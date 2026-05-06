const express = require('express');
const router = express.Router();
const { fetchParallelMarketRates } = require('../services/rateService');

router.get('/live', async (req, res) => {
  try {
    const rates = await fetchParallelMarketRates();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

module.exports = router;