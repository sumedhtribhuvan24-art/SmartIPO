/**
 * asyncWrapper.js
 * Wraps async route handlers so errors propagate to Express error handler
 * without needing try/catch in every controller.
 *
 * Usage:
 *   router.get('/path', wrap(myAsyncController));
 */
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = { wrap };
