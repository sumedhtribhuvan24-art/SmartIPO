/**
 * syncScheduler.js
 *
 * Background jobs:
 *   • IPO data sync from ipowatch    — every 30 minutes
 *   • Status auto-update             — every 15 minutes
 *   • GMP data refresh               — every 5 minutes
 *   • Stale analysis retry           — every 10 minutes
 *   • Auto-queue new DRHP PDFs       — every 10 minutes
 */
const { syncIPOsToDatabase, fetchGMPData } = require('./scraperService');
const { triggerAnalysisAsync }             = require('./ipoService');
const { pool }                             = require('../config/database');

let _running = false;
const _intervals = [];

function startScheduler() {
  if (_running) return;
  _running = true;
  console.log('⏰  Scheduler started');

  _schedule('IPO Sync',        syncIPOs,        30 * 60_000);   // 30 min
  _schedule('Status Update',   autoUpdateStatus, 15 * 60_000);  // 15 min
  _schedule('GMP Refresh',     refreshGMP,       5 * 60_000);   // 5 min
  _schedule('Analysis Queue',  queueAnalyses,   10 * 60_000);   // 10 min
  _schedule('Stuck Retry',     retryStuck,      10 * 60_000);   // 10 min
}

function stopScheduler() {
  _intervals.forEach(clearInterval);
  _intervals.length = 0;
  _running = false;
  console.log('⏰  Scheduler stopped');
}

// ── Job runners ───────────────────────────────────────────────────────────────
async function syncIPOs() {
  await syncIPOsToDatabase();
}

// ── Auto-update IPO status based on open/close dates ─────────────────────────
async function autoUpdateStatus() {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD today

  // upcoming → active: open_date reached
  const [r1] = await pool.execute(
    `UPDATE ipos SET status = 'active', updated_at = NOW()
     WHERE status = 'upcoming'
       AND open_date IS NOT NULL
       AND open_date <= ? AND (close_date IS NULL OR close_date >= ?)`,
    [now, now]
  );

  // active → closed: close_date passed
  const [r2] = await pool.execute(
    `UPDATE ipos SET status = 'closed', updated_at = NOW()
     WHERE status = 'active'
       AND close_date IS NOT NULL
       AND close_date < ?`,
    [now]
  );

  const changed = r1.affectedRows + r2.affectedRows;
  if (changed > 0) {
    console.log(`📅  Status auto-update: ${r1.affectedRows} → active, ${r2.affectedRows} → closed`);
  }
}

async function refreshGMP() {
  const gmpMap = await fetchGMPData();
  if (!Object.keys(gmpMap).length) return;

  const [ipos] = await pool.execute(
    'SELECT id, name FROM ipos WHERE is_active = TRUE AND status IN ("active","upcoming")'
  );

  for (const ipo of ipos) {
    const key   = ipo.name.toLowerCase();
    const match = Object.keys(gmpMap).find(
      k => key.includes(k) || k.includes(key.split(' ')[0])
    );
    if (match) {
      await pool.execute(
        'UPDATE ipos SET gmp = ?, updated_at = NOW() WHERE id = ?',
        [gmpMap[match], ipo.id]
      );
    }
  }
}

async function queueAnalyses() {
  // Find IPOs that have a DRHP URL but no analysis record yet
  const [rows] = await pool.execute(`
    SELECT i.id, i.name, i.sector, i.drhp_pdf_url
    FROM   ipos i
    LEFT   JOIN drhp_analyses da ON da.ipo_id = i.id
    WHERE  i.drhp_pdf_url IS NOT NULL
      AND  i.is_active = TRUE
      AND  da.id IS NULL
    LIMIT  5
  `);

  for (const row of rows) {
    await pool.execute(
      `INSERT IGNORE INTO drhp_analyses (ipo_id, status) VALUES (?, 'pending')`,
      [row.id]
    );
    triggerAnalysisAsync(row.id, row.drhp_pdf_url, row.name, row.sector);
    console.log(`  ↺ Auto-queued DRHP for: ${row.name}`);
  }
}

async function retryStuck() {
  // Reset analyses stuck in "processing" for > 5 minutes (crashed jobs)
  const [result] = await pool.execute(`
    UPDATE drhp_analyses
    SET    status = 'pending', error_msg = 'Auto-retried after stuck processing'
    WHERE  status = 'processing'
      AND  updated_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
  `);
  if (result.affectedRows > 0) {
    console.log(`  ↺ Reset ${result.affectedRows} stuck analyses to pending`);
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function _schedule(name, fn, ms) {
  // Run once immediately, then on interval
  (async () => {
    try { await fn(); }
    catch (e) { console.error(`[${name}] Initial run error:`, e.message); }
  })();

  const id = setInterval(async () => {
    try { await fn(); }
    catch (e) { console.error(`[${name}] Interval error:`, e.message); }
  }, ms);

  _intervals.push(id);
}

module.exports = { startScheduler, stopScheduler };
