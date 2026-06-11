const express = require("express");
const { getDailySummary } = require("../controllers/report.controller");

const router = express.Router();

/**
 * @swagger
 * /api/reports/daily-summary:
 *   get:
 *     summary: Get daily summary of credits and debits
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Daily summary report
 */
router.get("/daily-summary", getDailySummary);

module.exports = router;
