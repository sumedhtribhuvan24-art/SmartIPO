const express = require('express');
const router = express.Router();
const { analyzeRawDRHP } = require('../services/geminiService');

// POST /api/drhp/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const { content, companyName } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'No content provided for analysis' });
    }

    console.log(`🧠 Manual DRHP Analysis triggered for: ${companyName || 'Unknown'}`);
    const analysis = await analyzeRawDRHP(content, companyName);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
