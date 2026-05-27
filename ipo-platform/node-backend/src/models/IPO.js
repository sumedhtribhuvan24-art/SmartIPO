const { pool } = require('../config/database');

class IPO {
  /**
   * List all active IPOs with optional filters.
   */
  static async findAll({ status, sector, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT
        i.*,
        da.status          AS analysis_status,
        da.sentiment,
        da.score,
        da.risk_level,
        da.updated_at      AS analysis_updated_at
      FROM ipos i
      LEFT JOIN drhp_analyses da ON da.ipo_id = i.id
      WHERE i.is_active = TRUE
    `;
    const params = [];

    if (status) { query += ' AND i.status = ?';  params.push(status); }
    if (sector) { query += ' AND i.sector = ?';  params.push(sector); }
    if (search) {
      query += ' AND (i.name LIKE ? OR i.ticker LIKE ? OR i.sector LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    query += ` ORDER BY i.open_date DESC LIMIT ${isNaN(parsedLimit) ? 50 : parsedLimit} OFFSET ${isNaN(parsedOffset) ? 0 : parsedOffset}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Find single IPO by ID.
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
         i.*,
         da.status     AS analysis_status,
         da.sentiment,
         da.score,
         da.risk_level,
         da.updated_at AS analysis_updated_at
       FROM ipos i
       LEFT JOIN drhp_analyses da ON da.ipo_id = i.id
       WHERE i.id = ? AND i.is_active = TRUE`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Count total matching IPOs (for pagination).
   */
  static async countAll({ status, sector, search } = {}) {
    let query  = 'SELECT COUNT(*) AS total FROM ipos WHERE is_active = TRUE';
    const params = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (sector) { query += ' AND sector = ?'; params.push(sector); }
    if (search) {
      query += ' AND (name LIKE ? OR ticker LIKE ? OR sector LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  /**
   * Update live subscription data from NSE.
   */
  static async updateSubscription(id, sub) {
    await pool.execute(
      `UPDATE ipos SET
         total_subscription  = ?,
         qib_subscription    = ?,
         nii_subscription    = ?,
         retail_subscription = ?,
         sub_updated_at      = NOW(),
         updated_at          = NOW()
       WHERE id = ?`,
      [
        sub.totalSubscription  || 0,
        sub.qibSubscription    || 0,
        sub.niiSubscription    || 0,
        sub.retailSubscription || 0,
        id,
      ]
    );
  }
}

module.exports = IPO;
