const reportService = require("../services/report.service");

const getDailySummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await reportService.getDailySummary({ from, to });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailySummary,
};
