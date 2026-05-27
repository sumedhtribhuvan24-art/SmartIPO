/**
 * errorHandler.js
 * Global Express error handler + 404 handler.
 */

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const ts = new Date().toISOString();
  console.error(`[${ts}] ERROR ${req.method} ${req.path}:`, err.stack || err.message);

  // MySQL specific
  if (err.code === 'ER_DUP_ENTRY')   return res.status(409).json({ success: false, error: 'Duplicate entry' });
  if (err.code === 'ECONNREFUSED')   return res.status(503).json({ success: false, error: 'Database unavailable' });

  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(status).json({ success: false, error: message });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error:   `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFound };
