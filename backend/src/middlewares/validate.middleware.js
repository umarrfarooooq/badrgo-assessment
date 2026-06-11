const { validationResult } = require("express-validator");
const { validationError } = require("../utils/errors");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => `${err.path}: ${err.msg}`)
      .join(", ");
    return next(validationError(message));
  }
  next();
};

module.exports = handleValidationErrors;
