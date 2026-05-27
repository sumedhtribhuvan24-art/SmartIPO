require('dotenv').config();
const { pool } = require('./src/config/database');
async function fix() {
  const [r] = await pool.execute("UPDATE ipos SET status='closed' WHERE close_date < CURDATE() AND status='active'");
  console.log('Fixed', r.affectedRows, 'IPOs (changed active→closed for past close dates)');
  const [r2] = await pool.execute("UPDATE ipos SET status='upcoming' WHERE open_date > CURDATE() AND status='active'");
  console.log('Fixed', r2.affectedRows, 'IPOs (changed active→upcoming for future open dates)');
  process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
