require('dotenv').config();
const { fetchFromIPOWatch } = require('./src/services/scraperService');

async function test() {
  console.log('Testing ipowatch.in scraper...\n');
  try {
    const ipos = await fetchFromIPOWatch();
    console.log(`Found ${ipos.length} IPOs total:\n`);
    // Show first 20
    ipos.slice(0, 20).forEach(ipo => {
      console.log(`  [${ipo.status.toUpperCase().padEnd(8)}] ${ipo.name}`);
      console.log(`    Price: ${ipo.priceBandDisplay.padEnd(16)} Open: ${ipo.openDate || 'TBA'}  Close: ${ipo.closeDate || 'TBA'}`);
      console.log(`    Size: ${ipo.issueSize || 'N/A'}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
test();
