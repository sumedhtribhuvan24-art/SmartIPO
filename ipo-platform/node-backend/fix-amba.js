require('dotenv').config();
const { pool } = require('./src/config/database');
async function fix() {
  // Amba Auto opens Apr 27 — today is Apr 26, so it should be "upcoming" not "active"
  const [r] = await pool.execute(
    `UPDATE ipos SET status = 'upcoming', updated_at = NOW() WHERE name LIKE '%Amba Auto%'`
  );
  console.log(`✅ Moved Amba Auto to upcoming (${r.affectedRows} row)`);
  process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
