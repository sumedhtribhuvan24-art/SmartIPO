/**
 * ipoController.js
 * Thin layer: validates input, calls service, returns JSON.
 */
const ipoService         = require('../services/ipoService');
const { fetchSubscriptionData } = require('../services/scraperService');
const IPO                = require('../models/IPO');

function _badId(res) {
  return res.status(400).json({ success: false, error: 'Invalid IPO ID' });
}

const ipoController = {
  // GET /api/ipos
  async listIPOs(req, res, next) {
    try {
      const { status, sector, search, limit = 20, offset = 0 } = req.query;
      const result = await ipoService.listIPOs({ status, sector, search, limit, offset });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  // GET /api/ipos/:id
  async getIPOById(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(parseInt(id))) return _badId(res);

      const ipo = await ipoService.getIPOById(id);
      if (!ipo) return res.status(404).json({ success: false, error: 'IPO not found' });

      // Silently trigger analysis if it hasn't started yet (card was opened)
      if (ipo.drhpPdfUrl && (!ipo.analysisStatus || ipo.analysisStatus === 'none')) {
        setImmediate(() => ipoService.getOrTriggerAnalysis(id));
      }

      res.json({ success: true, data: ipo });
    } catch (err) { next(err); }
  },

  // GET /api/ipos/:id/analysis   ← called when user opens DRHP tab
  async getAnalysis(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(parseInt(id))) return _badId(res);

      const result = await ipoService.getOrTriggerAnalysis(id);
      if (!result) return res.status(404).json({ success: false, error: 'IPO not found' });

      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  // GET /api/ipos/:id/analysis/status   ← frontend polls every 5s
  async getAnalysisStatus(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(parseInt(id))) return _badId(res);

      const result = await ipoService.pollAnalysisStatus(id);
      if (!result) return res.status(404).json({ success: false, error: 'IPO not found' });

      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  // GET /api/ipos/:id/subscription   ← live NSE subscription numbers
  async getSubscription(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(parseInt(id))) return _badId(res);

      const ipo = await ipoService.getIPOById(id);
      if (!ipo) return res.status(404).json({ success: false, error: 'IPO not found' });

      let subData = null;
      if (ipo.nseSymbol) {
        subData = await fetchSubscriptionData(ipo.nseSymbol);
        if (subData) await IPO.updateSubscription(id, subData);
      }

      // Fall back to cached DB value
      if (!subData) {
        subData = {
          totalSubscription:  ipo.subscriptionRaw,
          qibSubscription:    ipo.subscriptionBreakdown.qib,
          niiSubscription:    ipo.subscriptionBreakdown.nii,
          retailSubscription: ipo.subscriptionBreakdown.retail,
          updatedAt: null,
          source: 'cached',
        };
      }

      res.json({ success: true, data: subData });
    } catch (err) { next(err); }
  },
};

module.exports = ipoController;
