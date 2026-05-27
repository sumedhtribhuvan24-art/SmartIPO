const rateLimit = require('express-rate-limit');
const { rateLimitWindowMs, rateLimitMax } = require('../config/env');

module.exports = rateLimit({
  windowMs:        rateLimitWindowMs,
  max:             rateLimitMax,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});
