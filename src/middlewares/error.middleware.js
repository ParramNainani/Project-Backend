const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Global error-handling middleware.
 * Express recognizes this as an error handler because it has 4 arguments.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Prisma known request error
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
    errors = [{ field: err.meta?.target?.join(', '), message }];
  }

  // Prisma not-found error
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Log in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
