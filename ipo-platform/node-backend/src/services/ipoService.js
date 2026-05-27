/**
 * ipoService.js
 * Core business logic for IPO listing, detail, and DRHP analysis triggering.
 */
const IPO      = require('../models/IPO');
const Analysis = require('../models/Analysis');
const aiService = require('./aiService');

const DISCLAIMER =
  'This is AI-generated analysis for educational purposes only. ' +
  'It does not constitute financial advice or a recommendation to buy, sell, or ' +
  'hold any security. Please consult a SEBI-registered financial advisor before investing.';

// ─── Exported so the scheduler can reuse it ───────────────────────────────────
function triggerAnalysisAsync(ipoId, drhpPdfUrl, companyName = '', sector = '') {
  // Deliberately NOT awaited — fire and forget
  setImmediate(async () => {
    try {
      await Analysis.updateStatus(ipoId, 'processing');
      const result = await aiService.analyzeDRHP(drhpPdfUrl, companyName, sector);
      await Analysis.upsertCompleted(ipoId, result);
      console.log(`✅  DRHP analysis done for IPO #${ipoId}`);
    } catch (err) {
      console.error(`❌  DRHP analysis failed for IPO #${ipoId}:`, err.message);
      await Analysis.markFailed(ipoId, err.message);
    }
  });
}

const ipoService = {
  // ── List IPOs ──────────────────────────────────────────────────────────────
  async listIPOs({ status, sector, search, limit = 20, offset = 0 } = {}) {
    const [ipos, total] = await Promise.all([
      IPO.findAll({ status, sector, search, limit, offset }),
      IPO.countAll({ status, sector, search }),
    ]);
    return { total, count: ipos.length, data: ipos.map(formatIPO) };
  },

  // ── Single IPO ─────────────────────────────────────────────────────────────
  async getIPOById(id) {
    const ipo = await IPO.findById(id);
    return ipo ? formatIPO(ipo) : null;
  },

  // ── Get or trigger DRHP analysis ──────────────────────────────────────────
  /**
   * Called when frontend opens the DRHP tab (or card detail).
   * State machine:
   *   done        → return full report immediately
   *   processing  → return status, frontend polls
   *   pending     → return status, frontend polls
   *   no record   → create pending + fire async job, return "pending"
   *   no pdf url  → return "unavailable"
   */
  async getOrTriggerAnalysis(ipoId) {
    const ipo = await IPO.findById(ipoId);
    if (!ipo) return null;

    const analysis = await Analysis.findByIpoId(ipoId);

    // Already done — return full structured report
    if (analysis?.status === 'done') {
      return { ...formatAnalysis(analysis, ipo), disclaimer: DISCLAIMER };
    }

    // Already running
    if (analysis?.status === 'processing') {
      return {
        ipoId, ipoName: ipo.name, sector: ipo.sector,
        status:  'processing',
        message: 'AI pipeline is running. This takes 30–60 seconds. The page will auto-update.',
        disclaimer: DISCLAIMER,
      };
    }

    // No DRHP PDF yet
    if (!ipo.drhp_pdf_url) {
      if (!analysis) await Analysis.createPending(ipoId);
      return {
        ipoId, ipoName: ipo.name, sector: ipo.sector,
        status:  'unavailable',
        message: 'DRHP PDF not yet published on SEBI EDGAR. Analysis will auto-start once available.',
        disclaimer: DISCLAIMER,
      };
    }

    // Start fresh (or retry after failure)
    await Analysis.createPending(ipoId);
    triggerAnalysisAsync(ipoId, ipo.drhp_pdf_url, ipo.name, ipo.sector);

    return {
      ipoId, ipoName: ipo.name, sector: ipo.sector,
      status:  'pending',
      message: 'DRHP analysis triggered. Please check back in 30–60 seconds.',
      disclaimer: DISCLAIMER,
    };
  },

  // ── Poll analysis status ───────────────────────────────────────────────────
  async pollAnalysisStatus(ipoId) {
    const [ipo, analysis] = await Promise.all([
      IPO.findById(ipoId),
      Analysis.findByIpoId(ipoId),
    ]);
    if (!ipo) return null;
    if (!analysis) return { ipoId, status: 'not_started' };
    if (analysis.status === 'done') {
      return { ...formatAnalysis(analysis, ipo), disclaimer: DISCLAIMER };
    }
    return {
      ipoId,
      ipoName:   ipo.name,
      status:    analysis.status,
      updatedAt: analysis.updated_at,
    };
  },
};

// ─── Formatter: DB row → frontend IPO shape ───────────────────────────────────
function formatIPO(row) {
  const sub = parseFloat(row.total_subscription) || parseFloat(row.subscription) || 0;
  return {
    id:          String(row.id),
    name:        row.name,
    ticker:      row.ticker || '',
    sector:      row.sector,
    priceBand:   row.price_band_display || `₹${row.price_band_min}–₹${row.price_band_max}`,
    priceBandMin: parseFloat(row.price_band_min),
    priceBandMax: parseFloat(row.price_band_max),
    gmp:         `₹${parseFloat(row.gmp) || 0}`,
    gmpRaw:      parseFloat(row.gmp) || 0,
    subscription:    sub > 0 ? `${sub}x` : '—',
    subscriptionRaw: sub,
    subscriptionBreakdown: {
      qib:    parseFloat(row.qib_subscription)    || 0,
      nii:    parseFloat(row.nii_subscription)    || 0,
      retail: parseFloat(row.retail_subscription) || 0,
    },
    lotSize:     row.lot_size ? String(row.lot_size) : '—',
    dates:       _formatDateRange(row.open_date, row.close_date),
    openDate:    row.open_date    || null,
    closeDate:   row.close_date   || null,
    listingDate: row.listing_date || null,
    issueSize:   row.issue_size   || '—',
    status:      row.status,
    aiPotential: row.ai_potential || 'moderate',
    logo:        row.logo_url
                   || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=003d9b&color=fff&size=128`,
    // Analysis summary fields (from LEFT JOIN)
    aiVerdict:       row.sentiment ? `AI Sentiment: ${row.sentiment}` : 'AI Sentiment: Pending',
    analysisStatus:  row.analysis_status || 'none',
    sentiment:       row.sentiment  || null,
    score:           row.score      ? parseFloat(row.score) : null,
    riskLevel:       row.risk_level || null,
    revenueGrowth:   '—',
    // Source metadata
    drhpPdfUrl:  row.drhp_pdf_url || null,
    dataSource:  row.data_source  || 'MANUAL',
    nseSymbol:   row.nse_symbol   || null,
    bseCode:     row.bse_code     || null,
    financialHealth: row.risk_level === 'Low' ? 'Excellent' : row.risk_level === 'High' ? 'Risky' : 'Stable',
  };
}

// ─── Formatter: DB row → full analysis report ─────────────────────────────────
function formatAnalysis(row, ipo) {
  const parse = v => {
    if (!v) return [];
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
    return Array.isArray(v) ? v : [];
  };
  return {
    ipoId:    String(ipo.id),
    ipoName:  ipo.name,
    ticker:   ipo.ticker || '',
    sector:   ipo.sector,
    status:   row.status,
    // Structured sections
    summary:           row.summary           || '',
    financials:        row.financials        || '',
    risks:             parse(row.risks),
    redFlags:          parse(row.red_flags),
    outlook:           row.outlook           || '',
    useOfFunds:        row.use_of_funds      || '',
    managementSummary: row.management_summary || '',
    // ML outputs
    sentiment:  row.sentiment,
    score:      parseFloat(row.score),
    riskLevel:  row.risk_level,
    finbert: {
      positive: parseFloat(row.finbert_positive) || 0,
      negative: parseFloat(row.finbert_negative) || 0,
      neutral:  parseFloat(row.finbert_neutral)  || 0,
    },
    meta: {
      modelVersion: row.model_version,
      pdfPages:     row.pdf_pages,
      pdfCharCount: row.pdf_char_count,
      generatedAt:  row.updated_at,
    },
  };
}

function _formatDateRange(open, close) {
  if (!open) return '—';
  const fmt = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  return `${fmt(open)} – ${fmt(close)}`;
}

module.exports = { ...ipoService, triggerAnalysisAsync };
