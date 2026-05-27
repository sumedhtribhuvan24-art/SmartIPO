require('dotenv').config();
const { pool } = require('./src/config/database');

async function seed() {
  // Real current IPOs as of April 26, 2026 - with full details
  const ipos = [
    {
      name: 'Adisoft Technologies Ltd',
      ticker: 'ADISOFT',
      sector: 'Technology',
      priceBandMin: 163, priceBandMax: 172,
      priceBandDisplay: '₹163–₹172',
      lotSize: 800,
      openDate: '2026-04-23', closeDate: '2026-04-27',
      listingDate: '2026-04-30',
      issueSize: '₹74.10 Cr',
      status: 'active',
      totalSubscription: 3.16,
      qibSubscription: 3.67,
      niiSubscription: 3.14,
      retailSubscription: 2.88,
    },
    {
      name: 'Amba Auto Sales and Services Ltd',
      ticker: 'AMBAAUTO',
      sector: 'Automotive',
      priceBandMin: 130, priceBandMax: 135,
      priceBandDisplay: '₹130–₹135',
      lotSize: 1000,
      openDate: '2026-04-27', closeDate: '2026-04-29',
      listingDate: '2026-05-02',
      issueSize: '₹65 Cr',
      status: 'upcoming',
    },
  ];

  for (const ipo of ipos) {
    try {
      await pool.execute(
        `INSERT INTO ipos (
           name, ticker, sector,
           price_band_min, price_band_max, price_band_display,
           lot_size, open_date, close_date, listing_date,
           issue_size, status,
           total_subscription, qib_subscription, nii_subscription, retail_subscription,
           data_source, is_active
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,TRUE)
         ON DUPLICATE KEY UPDATE
           ticker             = VALUES(ticker),
           price_band_min     = VALUES(price_band_min),
           price_band_max     = VALUES(price_band_max),
           price_band_display = VALUES(price_band_display),
           lot_size           = VALUES(lot_size),
           open_date          = VALUES(open_date),
           close_date         = VALUES(close_date),
           listing_date       = VALUES(listing_date),
           issue_size         = VALUES(issue_size),
           status             = VALUES(status),
           total_subscription = VALUES(total_subscription),
           qib_subscription   = VALUES(qib_subscription),
           nii_subscription   = VALUES(nii_subscription),
           retail_subscription = VALUES(retail_subscription),
           updated_at         = NOW()`,
        [
          ipo.name, ipo.ticker, ipo.sector,
          ipo.priceBandMin, ipo.priceBandMax, ipo.priceBandDisplay,
          ipo.lotSize,
          ipo.openDate, ipo.closeDate, ipo.listingDate,
          ipo.issueSize, ipo.status,
          ipo.totalSubscription || 0,
          ipo.qibSubscription || 0,
          ipo.niiSubscription || 0,
          ipo.retailSubscription || 0,
          'MANUAL',
        ]
      );
      console.log(`✅ Seeded: ${ipo.name} [${ipo.status}]`);
    } catch(err) {
      console.error(`❌ ${ipo.name}: ${err.message}`);
    }
  }
  console.log('\nDone!');
  process.exit(0);
}
seed();
