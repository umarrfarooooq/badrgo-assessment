const walletService = require("../services/wallet.service");

const createWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    next(error);
  }
};

const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.params.id);
    res.status(200).json(wallet);
  } catch (error) {
    next(error);
  }
};

const credit = async (req, res, next) => {
  try {
    const result = await walletService.credit(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const debit = async (req, res, next) => {
  try {
    const result = await walletService.debit(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const listTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await walletService.listTransactions(req.params.id, {
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const listWallets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await walletService.listWallets({ page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getWalletStats = async (req, res, next) => {
  try {
    const stats = await walletService.getWalletStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
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
