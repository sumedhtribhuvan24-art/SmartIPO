/**
 * seed-ipos.js
 * Run once to insert real current Indian IPOs into the database.
 * Usage: node src/scripts/seed-ipos.js
 */

require('dotenv').config();
const { pool } = require('../config/database');

const REAL_IPOS = [
  {
    name: 'Ather Energy Limited',
    ticker: 'ATHER',
    sector: 'Automotive',
    priceBandMin: 304, priceBandMax: 321,
    priceBandDisplay: '₹304–₹321',
    lotSize: 46,
    openDate: '2025-04-28', closeDate: '2025-04-30',
    listingDate: '2025-05-06',
    issueSize: '₹2,981 Cr',
    status: 'active',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Prostarm Info Systems Ltd',
    ticker: 'PROSTARM',
    sector: 'Technology',
    priceBandMin: 95, priceBandMax: 100,
    priceBandDisplay: '₹95–₹100',
    lotSize: 1200,
    openDate: '2025-04-28', closeDate: '2025-04-30',
    listingDate: '2025-05-05',
    issueSize: '₹99 Cr',
    status: 'active',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Wagons Learning Limited',
    ticker: 'WAGONS',
    sector: 'Education',
    priceBandMin: 50, priceBandMax: 54,
    priceBandDisplay: '₹50–₹54',
    lotSize: 2000,
    openDate: '2025-04-28', closeDate: '2025-04-30',
    listingDate: '2025-05-05',
    issueSize: '₹32 Cr',
    status: 'active',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Spinaroo Commercial Limited',
    ticker: 'SPINAROO',
    sector: 'Consumer Goods',
    priceBandMin: 25, priceBandMax: 26,
    priceBandDisplay: '₹25–₹26',
    lotSize: 4800,
    openDate: '2025-04-23', closeDate: '2025-04-25',
    listingDate: '2025-04-29',
    issueSize: '₹12 Cr',
    status: 'closed',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'HDB Financial Services Limited',
    ticker: 'HDBFSL',
    sector: 'Banking & NBFC',
    priceBandMin: 500, priceBandMax: 528,
    priceBandDisplay: '₹500–₹528',
    lotSize: 28,
    openDate: '2025-06-01', closeDate: '2025-06-03',
    listingDate: null,
    issueSize: '₹12,500 Cr',
    status: 'upcoming',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Tata Capital Limited',
    ticker: 'TATACAP',
    sector: 'Fintech',
    priceBandMin: 0, priceBandMax: 0,
    priceBandDisplay: 'TBA',
    lotSize: 0,
    openDate: null, closeDate: null,
    listingDate: null,
    issueSize: '₹15,000 Cr',
    status: 'upcoming',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'PhysicsWallah Limited',
    ticker: 'PW',
    sector: 'Education',
    priceBandMin: 0, priceBandMax: 0,
    priceBandDisplay: 'TBA',
    lotSize: 0,
    openDate: null, closeDate: null,
    listingDate: null,
    issueSize: '₹3,500 Cr',
    status: 'upcoming',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'HDFC Credila Financial Services',
    ticker: 'HDFCCRED',
    sector: 'Banking & NBFC',
    priceBandMin: 0, priceBandMax: 0,
    priceBandDisplay: 'TBA',
    lotSize: 0,
    openDate: null, closeDate: null,
    listingDate: null,
    issueSize: '₹5,000 Cr',
    status: 'upcoming',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Hexaware Technologies Limited',
    ticker: 'HEXAWARE',
    sector: 'Technology',
    priceBandMin: 674, priceBandMax: 708,
    priceBandDisplay: '₹674–₹708',
    lotSize: 21,
    openDate: '2025-02-12', closeDate: '2025-02-14',
    listingDate: '2025-02-19',
    issueSize: '₹8,750 Cr',
    status: 'closed',
    source: 'MANUAL',
    drhpUrl: null,
  },
  {
    name: 'Schloss Bangalore (Leela Hotels)',
    ticker: 'LEELA',
    sector: 'Hospitality',
    priceBandMin: 413, priceBandMax: 435,
    priceBandDisplay: '₹413–₹435',
    lotSize: 34,
    openDate: '2025-03-05', closeDate: '2025-03-07',
    listingDate: '2025-03-12',
    issueSize: '₹3,500 Cr',
    status: 'closed',
    source: 'MANUAL',
    drhpUrl: null,
  },
];

async function seed() {
  console.log('🌱  Seeding IPO database with real IPO data...');
  let inserted = 0;
  for (const ipo of REAL_IPOS) {
    try {
      await pool.execute(
        `INSERT INTO ipos (
           name, ticker, sector,
           price_band_min, price_band_max, price_band_display,
           lot_size, open_date, close_date, listing_date,
           issue_size, status, drhp_pdf_url,
           data_source, is_active
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,TRUE)
         ON DUPLICATE KEY UPDATE
           status             = VALUES(status),
           price_band_min     = VALUES(price_band_min),
           price_band_max     = VALUES(price_band_max),
           price_band_display = VALUES(price_band_display),
           lot_size           = VALUES(lot_size),
           open_date          = VALUES(open_date),
           close_date         = VALUES(close_date),
           listing_date       = VALUES(listing_date),
           issue_size         = VALUES(issue_size),
           updated_at         = NOW()`,
        [
          ipo.name, ipo.ticker, ipo.sector,
          ipo.priceBandMin, ipo.priceBandMax, ipo.priceBandDisplay,
          ipo.lotSize,
          ipo.openDate   || null,
          ipo.closeDate  || null,
          ipo.listingDate || null,
          ipo.issueSize  || null,
          ipo.status,
          ipo.drhpUrl    || null,
          ipo.source,
        ]
      );
      console.log(`  ✅ ${ipo.name} (${ipo.status})`);
      inserted++;
    } catch (err) {
      console.error(`  ❌ ${ipo.name}: ${err.message}`);
    }
  }
  console.log(`\n✅  Done! ${inserted}/${REAL_IPOS.length} IPOs seeded.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
