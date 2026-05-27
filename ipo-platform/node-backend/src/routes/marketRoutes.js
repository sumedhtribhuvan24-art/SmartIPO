const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/marketController');

// GET /api/market/trends
router.get('/trends',  ctrl.getMarketTrends);

// GET /api/market/sectors
router.get('/sectors', ctrl.getSectors);

module.exports = router;
