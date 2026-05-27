const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Accept': 'text/html,*/*',
};

async function tryIPOWatch() {
  // ipowatch has structured IPO pages
  const urls = [
    'https://ipowatch.in/ipo-listing/',
    'https://ipowatch.in/upcoming-ipo/',
    'https://ipowatch.in/',
  ];
  
  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 10000, headers: HEADERS, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
      const $ = cheerio.load(res.data);
      console.log(`\n✅ ${url}`);
      // Find tables
      $('table').each((i, t) => {
        const rows = $(t).find('tr');
        console.log(`  Table ${i+1}: ${rows.length} rows`);
        // Print first 2 rows
        rows.slice(0, 2).each((j, r) => {
          const cells = $(r).find('td, th').map((_, c) => $(c).text().trim()).get();
          console.log(`    Row ${j}: ${cells.slice(0,5).join(' | ')}`);
        });
      });
    } catch(e) {
      console.log(`❌ ${url}: ${e.message}`);
    }
  }
  process.exit(0);
}
tryIPOWatch();
