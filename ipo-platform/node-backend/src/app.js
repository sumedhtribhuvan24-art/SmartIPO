/**
 * app.js  —  The Financial Architect — IPO Platform API
 *
 * Boot sequence:
 *   1. Connect to MySQL
 *   2. Start Express server
 *   3. Start background scheduler (NSE/BSE sync every 30s)
 */
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const { testConnection }         = require('./config/database');
const { port, nodeEnv, frontendUrl } = require('./config/env');
const rateLimiter                = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const ipoRoutes                  = require('./routes/ipoRoutes');
const marketRoutes               = require('./routes/marketRoutes');
const healthRoutes               = require('./routes/healthRoutes');
const drhpRoutes                 = require('./routes/drhpRoutes');
const { startScheduler }         = require('./services/syncScheduler');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:         frontendUrl,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Logging & parsing ─────────────────────────────────────────────────────────
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/ipos',   ipoRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/drhp',   drhpRoutes);
app.use('/health',     healthRoutes);

// ── 404 / Error ───────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
async function start() {
  await testConnection();

  app.listen(port, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🏛  The Financial Architect — IPO API');
    console.log(`  ►  http://localhost:${port}`);
    console.log(`  ►  ENV: ${nodeEnv}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  if (nodeEnv !== 'test') {
    startScheduler();
  }
}

start().catch(err => {
  console.error('❌  Startup failed:', err.message);
  process.exit(1);
});

module.exports = app;
