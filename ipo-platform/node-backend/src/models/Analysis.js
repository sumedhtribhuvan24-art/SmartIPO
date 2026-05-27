const { pool } = require('../config/database');

class Analysis {
  static async findByIpoId(ipoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM drhp_analyses WHERE ipo_id = ?',
      [ipoId]
    );
    return rows[0] || null;
  }

  /**
   * Create a pending record (safe to call multiple times — idempotent).
   * Only resets to pending if previous run failed.
   */
  static async createPending(ipoId) {
    await pool.execute(
      `INSERT INTO drhp_analyses (ipo_id, status)
       VALUES (?, 'pending')
       ON DUPLICATE KEY UPDATE
         status     = IF(status = 'failed', 'pending', status),
         updated_at = NOW()`,
      [ipoId]
    );
  }

  static async updateStatus(ipoId, status) {
    await pool.execute(
      'UPDATE drhp_analyses SET status = ?, updated_at = NOW() WHERE ipo_id = ?',
      [status, ipoId]
    );
  }

  /**
   * Write completed ML analysis (all 10 structured fields).
   */
  static async upsertCompleted(ipoId, data) {
    await pool.execute(
      `INSERT INTO drhp_analyses (
         ipo_id, summary, financials, risks, red_flags,
         outlook, use_of_funds, management_summary,
         sentiment, score, risk_level,
         finbert_positive, finbert_negative, finbert_neutral,
         feature_vector, model_version, pdf_pages, pdf_char_count,
         status
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'done')
       ON DUPLICATE KEY UPDATE
         summary            = VALUES(summary),
         financials         = VALUES(financials),
         risks              = VALUES(risks),
         red_flags          = VALUES(red_flags),
         outlook            = VALUES(outlook),
         use_of_funds       = VALUES(use_of_funds),
         management_summary = VALUES(management_summary),
         sentiment          = VALUES(sentiment),
         score              = VALUES(score),
         risk_level         = VALUES(risk_level),
         finbert_positive   = VALUES(finbert_positive),
         finbert_negative   = VALUES(finbert_negative),
         finbert_neutral    = VALUES(finbert_neutral),
         feature_vector     = VALUES(feature_vector),
         model_version      = VALUES(model_version),
         pdf_pages          = VALUES(pdf_pages),
         pdf_char_count     = VALUES(pdf_char_count),
         status             = 'done',
         error_msg          = NULL,
         updated_at         = NOW()`,
      [
        ipoId,
        data.summary             || '',
        data.financials          || '',
        JSON.stringify(data.risks      || []),
        JSON.stringify(data.red_flags  || []),
        data.outlook             || '',
        data.use_of_funds        || '',
        data.management_summary  || '',
        data.sentiment           || 'Neutral',
        data.score               || 5.0,
        data.risk_level          || 'Medium',
        data.finbert?.positive   ?? null,
        data.finbert?.negative   ?? null,
        data.finbert?.neutral    ?? null,
        data.feature_vector ? JSON.stringify(data.feature_vector) : null,
        data.model_version       || 'finbert-v1',
        data.pdf_pages           || null,
        data.pdf_char_count      || null,
      ]
    );
  }

  static async markFailed(ipoId, errorMsg) {
    await pool.execute(
      `UPDATE drhp_analyses
       SET status = 'failed', error_msg = ?, updated_at = NOW()
       WHERE ipo_id = ?`,
      [String(errorMsg || '').slice(0, 500), ipoId]
    );
  }
}

module.exports = Analysis;
