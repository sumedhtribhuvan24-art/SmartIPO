const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Accept': 'text/html,*/*',
};

async function check(url) {
  try {
    const res = await axios.get(url, { timeout: 15000, headers: HEADERS, httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const $ = cheerio.load(res.data);
    console.log(`\n✅ ${url}`);
    $('table').each((i, t) => {
      const rows = $(t).find('tr');
      if (rows.length < 2) return;
      console.log(`  Table ${i+1} (${rows.length} rows):`);
      rows.slice(0, 4).each((j, r) => {
        const cells = $(r).find('td, th').map((_, c) => $(c).text().replace(/\s+/g,' ').trim()).get();
        if (cells.some(c => c.length > 1)) console.log(`    ${cells.slice(0,5).join(' | ')}`);
      });
    });
  } catch(e) {
    console.log(`\n❌ ${url}: ${e.message}`);
  }
}

async function run() {
  // Check ipowatch for 2026 IPOs
  await check('https://ipowatch.in/ipo-subscription-status/');
  await check('https://ipowatch.in/sme-ipo/');
  await check('https://ipowatch.in/upcoming-ipo/');
  process.exit(0);
}
run();
