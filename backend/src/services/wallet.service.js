const mongoose = require("mongoose");
const Wallet = require("../models/Wallet.model");
const User = require("../models/User.model");
const Transaction = require("../models/Transaction.model");
const {
  notFoundError,
  conflictError,
  insufficientFundsError,
} = require("../utils/errors");

const createWallet = async ({ userId }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw notFoundError("User not found");
  }
  const wallet = await Wallet.create({ userId });
  return wallet;
};

const getWallet = async (id) => {
  const wallet = await Wallet.findById(id);
  if (!wallet) {
    throw notFoundError("Wallet not found");
  }
  return wallet;
};

const credit = async (walletId, { amount, referenceId, description }) => {
  const amountDecimal = mongoose.Types.Decimal128.fromString(String(amount));

  let claimedTransaction;
  try {
    claimedTransaction = await Transaction.create({
      walletId,
      type: "credit",
      amount: amountDecimal,
      balanceBefore: mongoose.Types.Decimal128.fromString("0"),
      balanceAfter: mongoose.Types.Decimal128.fromString("0"),
      referenceId,
      description,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw conflictError("Duplicate transaction reference");
    }
    throw error;
  }

  try {
    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, status: "active" },
      { $inc: { balance: amountDecimal } },
      { new: true, returnDocument: "after" },
    );

    if (!wallet) {
      await Transaction.deleteOne({ _id: claimedTransaction._id });
      const exists = await Wallet.findById(walletId);
      if (!exists) {
        throw notFoundError("Wallet not found");
      }
      throw notFoundError("Wallet is frozen");
    }

    const balanceAfterStr = wallet.balance.toString();
    const balanceBeforeStr = (
      parseFloat(balanceAfterStr) - parseFloat(amount)
    ).toString();

    await Transaction.findByIdAndUpdate(claimedTransaction._id, {
      balanceBefore: mongoose.Types.Decimal128.fromString(balanceBeforeStr),
      balanceAfter: wallet.balance,
    });

    const transaction = await Transaction.findById(claimedTransaction._id);
    return { wallet, transaction };
  } catch (error) {
    if (!error.statusCode) {
      await Transaction.deleteOne({ _id: claimedTransaction._id });
    }
    throw error;
  }
};

const debit = async (walletId, { amount, referenceId, description }) => {
  const amountDecimal = mongoose.Types.Decimal128.fromString(String(amount));

  let claimedTransaction;
  try {
    claimedTransaction = await Transaction.create({
      walletId,
      type: "debit",
      amount: amountDecimal,
      balanceBefore: mongoose.Types.Decimal128.fromString("0"),
      balanceAfter: mongoose.Types.Decimal128.fromString("0"),
      referenceId,
      description,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw conflictError("Duplicate transaction reference");
    }
    throw error;
  }

  try {
    const wallet = await Wallet.findOneAndUpdate(
      {
        _id: walletId,
        status: "active",
        balance: { $gte: amountDecimal },
      },
      {
        $inc: {
          balance: mongoose.Types.Decimal128.fromString(String(-amount)),
        },
      },
      { new: true, returnDocument: "after" },
    );

    if (!wallet) {
      await Transaction.deleteOne({ _id: claimedTransaction._id });
      const exists = await Wallet.findById(walletId);
      if (!exists) {
        throw notFoundError("Wallet not found");
      }
      if (exists.status !== "active") {
        throw notFoundError("Wallet is frozen");
      }
      throw insufficientFundsError("Insufficient funds");
    }

    const balanceAfterStr = wallet.balance.toString();
    const balanceBeforeStr = (
      parseFloat(balanceAfterStr) + parseFloat(amount)
    ).toString();

    await Transaction.findByIdAndUpdate(claimedTransaction._id, {
      balanceBefore: mongoose.Types.Decimal128.fromString(balanceBeforeStr),
      balanceAfter: wallet.balance,
    });

    const transaction = await Transaction.findById(claimedTransaction._id);
    return { wallet, transaction };
  } catch (error) {
    if (!error.statusCode) {
      await Transaction.deleteOne({ _id: claimedTransaction._id });
    }
    throw error;
  }
};

const listTransactions = async (walletId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    Transaction.find({ walletId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments({ walletId }),
  ]);

  return {
    transactions,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const listWallets = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [wallets, total] = await Promise.all([
    Wallet.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Wallet.countDocuments(),
  ]);

  return {
    wallets,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const getWalletStats = async () => {
  const Transaction = require("../models/Transaction.model");
  const [walletStats, txStats] = await Promise.all([
    Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWallets: { $sum: 1 },
          totalBalance: { $sum: { $toDouble: "$balance" } },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalCredits: {
            $sum: {
              $cond: [
                { $eq: ["$type", "credit"] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          totalDebits: {
            $sum: {
              $cond: [{ $eq: ["$type", "debit"] }, { $toDouble: "$amount" }, 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const walletData = walletStats[0] || { totalWallets: 0, totalBalance: 0 };
  const txData = txStats[0] || {
    totalCredits: 0,
    totalDebits: 0,
    transactionCount: 0,
  };

  return {
    totalWallets: walletData.totalWallets,
    totalBalance: walletData.totalBalance.toFixed(2),
    totalCredits: txData.totalCredits.toFixed(2),
    totalDebits: txData.totalDebits.toFixed(2),
    transactionCount: txData.transactionCount,
  };
};

module.exports = {
  createWallet,
  getWallet,
  listWallets,
  getWalletStats,
  credit,
  debit,
  listTransactions,
};
