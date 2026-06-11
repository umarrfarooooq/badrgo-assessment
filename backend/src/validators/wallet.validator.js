const { body } = require("express-validator");

const createWalletRules = [
  body("userId").notEmpty().withMessage("userId is required"),
];

const creditDebitRules = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("amount must be a positive number"),
  body("referenceId").notEmpty().withMessage("referenceId is required"),
  body("description").optional().isString(),
];

module.exports = {
  createWalletRules,
  creditDebitRules,
};
