/**
 * Global Error Handling Middleware
 *
 * Must be registered LAST in server.js (after all routes) via:
 *   app.use(errorHandler);
 *
 * Catches both operational errors (thrown intentionally) and unexpected
 * programming errors, returning a consistent JSON error envelope.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status was set on the error object
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log every server error for debugging (suppress stack in prod response)
  if (statusCode >= 500) {
    console.error('🔴 Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Include stack trace only in development for security
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * 404 handler – catch-all for unknown routes.
 * Register this BEFORE errorHandler but AFTER all other routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Helper to create a structured operational error with a custom HTTP status.
 * @param {string} message
 * @param {number} statusCode
 * @returns {Error}
 */
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, notFound, createError };
