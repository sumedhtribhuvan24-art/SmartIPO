require('dotenv').config();

module.exports = {
  port:               parseInt(process.env.PORT)              || 3000,
  nodeEnv:            process.env.NODE_ENV                    || 'development',
  frontendUrl:        process.env.FRONTEND_URL                || '*',
  pythonServiceUrl:   process.env.PYTHON_SERVICE_URL          || 'http://localhost:8000',
  rateLimitWindowMs:  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMax:       parseInt(process.env.RATE_LIMIT_MAX)    || 100,
};
