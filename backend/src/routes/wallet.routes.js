const express = require("express");
const {
  createWallet,
  getWallet,
  listWallets,
  getWalletStats,
  credit,
  debit,
  listTransactions,
} = require("../controllers/wallet.controller");
const {
  createWalletRules,
  creditDebitRules,
} = require("../validators/wallet.validator");
const handleValidationErrors = require("../middlewares/validate.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/wallets:
 *   post:
 *     summary: Create a new wallet
 *     tags: [Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error
 */
router.post("/", createWalletRules, handleValidationErrors, createWallet);

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: List all wallets (paginated)
 *     tags: [Wallets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page (default 20)
 *     responses:
 *       200:
 *         description: Paginated list of wallets
 */
router.get("/stats", getWalletStats);
router.get("/", listWallets);

/**
 * @swagger
 * /api/wallets/{id}:
 *   get:
 *     summary: Get wallet by ID
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet details
 *       404:
 *         description: Wallet not found
 */
router.get("/:id", getWallet);

/**
 * @swagger
 * /api/wallets/{id}/credit:
 *   post:
 *     summary: Credit wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - referenceId
 *             properties:
 *               amount:
 *                 type: number
 *               referenceId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet credited successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Wallet not found
 *       409:
 *         description: Duplicate transaction reference
 */
router.post("/:id/credit", creditDebitRules, handleValidationErrors, credit);

/**
 * @swagger
 * /api/wallets/{id}/debit:
 *   post:
 *     summary: Debit wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - referenceId
 *             properties:
 *               amount:
 *                 type: number
 *               referenceId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet debited successfully
 *       400:
 *         description: Insufficient funds or validation error
 *       404:
 *         description: Wallet not found
 *       409:
 *         description: Duplicate transaction reference
 */
router.post("/:id/debit", creditDebitRules, handleValidationErrors, debit);

/**
 * @swagger
 * /api/wallets/{id}/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/:id/transactions", listTransactions);

module.exports = router;
