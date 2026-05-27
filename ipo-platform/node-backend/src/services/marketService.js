/**
 * marketService.js
 * Returns market trend data from the DB (refreshed by scheduler via NSE/BSE).
 */
const { pool } = require('../config/database');

const marketService = {
  async getMarketTrends() {
    const [rows] = await pool.execute(
      `SELECT sector, change_pct AS \`change\`, trend, volume, updated_at
       FROM market_trends
       ORDER BY sector`
    );
    return rows;
  },

  async getSectors() {
    const [rows] = await pool.execute(
      'SELECT DISTINCT sector FROM ipos WHERE is_active = TRUE ORDER BY sector'
    );
    return rows.map(r => r.sector);
  },
};

module.exports = marketService;
