const Transaction = require("../models/Transaction.model");

const getDailySummary = async ({ from, to }) => {
  const matchStage = {};

  if (from && to) {
    matchStage.createdAt = {
      $gte: new Date(from),
      $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
    };
  }

  const results = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalCredits: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, { $toDouble: "$amount" }, 0],
          },
        },
        totalDebits: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, { $toDouble: "$amount" }, 0],
          },
        },
        transactionCount: { $sum: 1 },
        walletIds: { $addToSet: "$walletId" },
      },
    },
    {
      $project: {
        _id: 1,
        totalCredits: 1,
        totalDebits: 1,
        transactionCount: 1,
        activeWallets: { $size: "$walletIds" },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return results;
};

module.exports = {
  getDailySummary,
};
