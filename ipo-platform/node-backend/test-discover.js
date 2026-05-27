const axios = require('axios');
const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://www.chittorgarh.com/'
};

async function tryEndpoint(url, label) {
  try {
    const res = await axios.get(url, { timeout: 10000, headers: HEADERS, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const data = res.data;
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      console.log(`\n✅ ${label}:`);
      console.log(JSON.stringify(data).substring(0, 500));
    } else {
      console.log(`\n❌ ${label}: Got HTML/binary`);
    }
  } catch(e) {
    console.log(`\n❌ ${label}: ${e.response?.status || e.message}`);
  }
}

async function run() {
  // Try Chittorgarh Next.js API routes
  await tryEndpoint('https://www.chittorgarh.com/api/ipo/dashboard', 'Chittorgarh /api/ipo/dashboard');
  await tryEndpoint('https://www.chittorgarh.com/api/ipo/list', 'Chittorgarh /api/ipo/list');
  await tryEndpoint('https://www.chittorgarh.com/api/ipos', 'Chittorgarh /api/ipos');
  
  // Try ipowatch.in
  await tryEndpoint('https://ipowatch.in/wp-json/wp/v2/posts?categories=2&per_page=10', 'IPOWatch WP API');
  
  // Try NSE full listing (different endpoint)
  await tryEndpoint('https://www.nseindia.com/api/ipo-allot-refund', 'NSE ipo-allot-refund');
  
  process.exit(0);
}

run();
