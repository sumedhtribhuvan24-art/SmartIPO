const aiService = require('../services/aiService');
const { pool }  = require('../config/database');

const healthController = {
  async getHealth(req, res) {
    const [dbCheck, aiCheck] = await Promise.allSettled([
      pool.execute('SELECT 1'),
      aiService.healthCheck(),
    ]);

    const status = {
      server:    'ok',
      database:  dbCheck.status === 'fulfilled' ? 'ok' : 'error',
      aiService: aiCheck.status === 'fulfilled'
                   ? (aiCheck.value?.status || 'ok')
                   : 'unreachable',
      timestamp: new Date().toISOString(),
      uptime:    process.uptime(),
    };

    res.status(status.database === 'ok' ? 200 : 503).json(status);
  },
};

module.exports = healthController;
