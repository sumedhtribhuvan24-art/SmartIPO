const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/healthController');

// GET /health
router.get('/', ctrl.getHealth);

module.exports = router;
