require('dotenv').config();
const { pool } = require('./src/config/database');

async function update() {
  const [r] = await pool.execute(
    `UPDATE ipos SET
       price_band_min     = 163,
       price_band_max     = 172,
       price_band_display = '₹163 – ₹172',
       lot_size           = 800,
       open_date          = '2026-04-23',
       close_date         = '2026-04-27',
       listing_date       = '2026-04-30',
       issue_size         = '₹74.10 Cr',
       status             = 'active',
       sector             = 'Technology',
       ticker             = 'ADISOFT',
       total_subscription = 3.16,
       qib_subscription   = 3.67,
       nii_subscription   = 3.14,
       retail_subscription = 2.88,
       updated_at         = NOW()
     WHERE name = 'Adisoft Technologies Ltd'`,
    []
  );
  console.log(`✅ Updated Adisoft Technologies Ltd (${r.affectedRows} row)`);

  // Verify
  const [rows] = await pool.execute(
    `SELECT name, price_band_display, lot_size, open_date, close_date, listing_date, issue_size, status, total_subscription
     FROM ipos WHERE name = 'Adisoft Technologies Ltd'`
  );
  const ipo = rows[0];
  console.log('\n📋 Verified data in DB:');
  console.log(`   Name:        ${ipo.name}`);
  console.log(`   Price:       ${ipo.price_band_display}`);
  console.log(`   Lot Size:    ${ipo.lot_size}  (₹${ipo.lot_size * 172} at max price)`);
  console.log(`   Open:        ${ipo.open_date?.toISOString().split('T')[0]}`);
  console.log(`   Close:       ${ipo.close_date?.toISOString().split('T')[0]}`);
  console.log(`   Listing:     ${ipo.listing_date?.toISOString().split('T')[0]}`);
  console.log(`   Issue Size:  ${ipo.issue_size}`);
  console.log(`   Status:      ${ipo.status}`);
  console.log(`   Subscribed:  ${ipo.total_subscription}x`);
  process.exit(0);
}
update().catch(e => { console.error(e); process.exit(1); });
