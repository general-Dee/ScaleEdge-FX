const axios = require('axios');

// For MVP, we'll use a free API (e.g., ExchangeRate-API or parallel market API)
// Replace with actual Kaduna parallel market source later

async function getLiveRates() {
  try {
    // Option 1: Use a free API (example: exchangerate-api.com, need API key for production)
    // For demo, return mock rates
    // In production, scrape from abokifx.com or similar with permission
    
    // Mock rates for now (replace with actual API call)
    const buyRate = 1450; // NGN to buy 1 USD
    const sellRate = 1470; // NGN to sell 1 USD
    
    return {
      buy: buyRate,
      sell: sellRate,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Rate fetch error:', error);
    throw error;
  }
}

async function fetchParallelMarketRates() {
  // TODO: Implement actual scraping from abokifx.com or other source
  // Example using axios + cheerio:
  /*
  const html = await axios.get('https://abokifx.com');
  const $ = cheerio.load(html.data);
  const buyRate = $('#parallel-market-buy').text();
  const sellRate = $('#parallel-market-sell').text();
  return { buy: buyRate, sell: sellRate };
  */
  
  // Fallback to mock for now
  return getLiveRates();
}

module.exports = { getLiveRates, fetchParallelMarketRates };