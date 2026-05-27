/**
 * logger.js
 * Thin wrapper — swap with Winston/Pino in production.
 */
const isProd = process.env.NODE_ENV === 'production';

const logger = {
  info:  (...a) => console.log('[INFO] ', ...a),
  warn:  (...a) => console.warn('[WARN] ', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  debug: (...a) => { if (!isProd) console.log('[DEBUG]', ...a); },
};

module.exports = logger;
