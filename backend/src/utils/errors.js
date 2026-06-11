const notFoundError = (message) =>
  Object.assign(new Error(message), { statusCode: 404 });
const conflictError = (message) =>
  Object.assign(new Error(message), { statusCode: 409 });
const insufficientFundsError = (message) =>
  Object.assign(new Error(message), { statusCode: 400 });
const validationError = (message) =>
  Object.assign(new Error(message), { statusCode: 422 });

module.exports = {
  notFoundError,
  conflictError,
  insufficientFundsError,
  validationError,
};
