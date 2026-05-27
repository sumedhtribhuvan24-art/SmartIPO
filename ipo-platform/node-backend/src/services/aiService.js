/**
 * aiService.js
 * HTTP client that calls the Python FastAPI ML service.
 */
const axios = require('axios');
const { pythonServiceUrl } = require('../config/env');

const TIMEOUT_MS = 120_000; // 2 min — PDF extraction + FinBERT inference can be slow

const aiService = {
  /**
   * Send DRHP PDF URL to Python service.
   * Returns full structured analysis matching Analysis model fields.
   */
  async analyzeDRHP(pdfUrl, companyName = '', sector = '') {
    if (!pdfUrl) throw new Error('No DRHP PDF URL provided');

    console.log(`🤖  Calling Python ML service for: ${pdfUrl}`);

    const { data } = await axios.post(
      `${pythonServiceUrl}/analyze`,
      { pdf_url: pdfUrl, company_name: companyName, sector },
      { timeout: TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } }
    );

    if (!data || !data.summary) {
      throw new Error('Invalid or empty response from ML service');
    }

    return {
      summary:            data.summary            || '',
      financials:         data.financials          || '',
      risks:              Array.isArray(data.risks)      ? data.risks      : [],
      red_flags:          Array.isArray(data.red_flags)  ? data.red_flags  : [],
      outlook:            data.outlook             || '',
      use_of_funds:       data.use_of_funds        || '',
      management_summary: data.management_summary  || '',
      sentiment:   _validateSentiment(data.sentiment),
      score:       _validateScore(data.score),
      risk_level:  _validateRiskLevel(data.risk_level),
      finbert: {
        positive: parseFloat(data.finbert?.positive) || 0,
        negative: parseFloat(data.finbert?.negative) || 0,
        neutral:  parseFloat(data.finbert?.neutral)  || 0,
      },
      feature_vector: data.feature_vector || null,
      model_version:  data.meta?.modelVersion || 'finbert-v1',
      pdf_pages:      data.meta?.pdfPages     || null,
      pdf_char_count: data.meta?.pdfCharCount || null,
    };
  },

  async healthCheck() {
    try {
      const { data } = await axios.get(`${pythonServiceUrl}/health`, { timeout: 5000 });
      return data;
    } catch {
      return { status: 'unreachable' };
    }
  },
};

function _validateSentiment(v) {
  return ['Positive', 'Neutral', 'Negative'].includes(v) ? v : 'Neutral';
}
function _validateScore(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 5.0 : Math.min(10, Math.max(0, n));
}
function _validateRiskLevel(v) {
  return ['Low', 'Medium', 'High'].includes(v) ? v : 'Medium';
}

module.exports = aiService;
