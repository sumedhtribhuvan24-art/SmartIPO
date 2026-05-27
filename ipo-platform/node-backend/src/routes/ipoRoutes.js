const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ipoController');

// GET /api/ipos?status=active|upcoming|closed&sector=X&search=Y&limit=20&offset=0
router.get('/',                    ctrl.listIPOs);

// GET /api/ipos/:id
router.get('/:id',                 ctrl.getIPOById);

// GET /api/ipos/:id/analysis         ← opens DRHP tab; triggers if not started
router.get('/:id/analysis',        ctrl.getAnalysis);

// GET /api/ipos/:id/analysis/status  ← frontend polls every 5s
router.get('/:id/analysis/status', ctrl.getAnalysisStatus);

// GET /api/ipos/:id/subscription     ← live NSE sub data
router.get('/:id/subscription',    ctrl.getSubscription);

module.exports = router;
