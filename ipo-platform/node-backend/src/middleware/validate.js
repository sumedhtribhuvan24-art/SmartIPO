/**
 * validate.js
 * Simple request validators used inline in routes.
 */

function requireId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ success: false, error: 'Invalid ID parameter' });
  }
  req.params.id = String(id);
  next();
}

module.exports = { requireId };
