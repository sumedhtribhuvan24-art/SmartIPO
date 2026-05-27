require('dotenv').config();
const { pool } = require('./src/config/database');

async function clean() {
  // Delete completely fake/dummy IPOs created from the initial schema seed
  const dummyNames = [
    'TechNova Solutions Ltd',
    'GreenEnergy Corp',
    'FinServe Holdings',
    'HealthFirst Diagnostics',
    'AutoDrive Systems',
    'Ather Energy Limited',      // real company but wrong year (2025)
    'Prostarm Info Systems Ltd', // real company but wrong year (2025)
    'Wagons Learning Limited',   // real company but wrong year (2025)
    'Spinaroo Commercial Limited',
    'HDB Financial Services Limited', // keep separate real entry from ipowatch
  ];

  const placeholders = dummyNames.map(() => '?').join(',');
  const [r] = await pool.execute(
    `DELETE FROM ipos WHERE name IN (${placeholders})`,
    dummyNames
  );
  console.log(`🗑️  Deleted ${r.affectedRows} dummy IPOs`);

  // Also remove any remaining active IPOs with 2025 dates
  const [r2] = await pool.execute(
    "DELETE FROM ipos WHERE status = 'active' AND (close_date < '2026-01-01' OR open_date < '2026-01-01')"
  );
  console.log(`🗑️  Deleted ${r2.affectedRows} stale 2025 active IPOs`);

  // Show what's left as active
  const [rows] = await pool.execute("SELECT name, status, open_date, close_date FROM ipos WHERE status = 'active' ORDER BY open_date DESC");
  console.log(`\n✅ Remaining ACTIVE IPOs (${rows.length}):`);
  rows.forEach(r => console.log(`   ${r.name}  |  ${r.open_date?.toISOString().split('T')[0]} → ${r.close_date?.toISOString().split('T')[0]}`));

  process.exit(0);
}
clean().catch(e => { console.error(e); process.exit(1); });
