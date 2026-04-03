/**
 * Wraps an async route handler so thrown errors are
 * automatically forwarded to Express's error middleware.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
