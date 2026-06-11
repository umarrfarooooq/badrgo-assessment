const { body } = require("express-validator");

const createUserRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().normalizeEmail().withMessage("valid email required"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("valid phone number required"),
];

module.exports = {
  createUserRules,
};
