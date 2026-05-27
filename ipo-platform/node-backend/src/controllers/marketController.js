const marketService = require('../services/marketService');

const marketController = {
  async getMarketTrends(req, res, next) {
    try {
      const trends = await marketService.getMarketTrends();
      res.json({
        success: true,
        count: trends.length,
        data: trends,
        disclaimer: 'Market data is for informational purposes only.',
        timestamp: new Date().toISOString(),
      });
    } catch (err) { next(err); }
  },

  async getSectors(req, res, next) {
    try {
      const sectors = await marketService.getSectors();
      res.json({ success: true, data: sectors });
    } catch (err) { next(err); }
  },
};

module.exports = marketController;
