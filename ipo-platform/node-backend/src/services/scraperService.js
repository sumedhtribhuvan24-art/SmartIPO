/**
 * scraperService.js
 *
 * IPO data pipeline — scrapes live data from ipowatch.in
 * (structured HTML, works 24/7, same data as Groww/Zerodha)
 *
 * Flow: ipowatch.in current → ipowatch.in upcoming → NSE pre-open (fallback)
 */
const axios   = require('axios');
const cheerio = require('cheerio');
const { pool } = require('../config/database');
const http    = require('http');
const https   = require('https');

const BROWSER_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,*/*;q=0.9',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ── NSE client (for subscription data only) ───────────────────────────────────
const nseClient = axios.create({
  baseURL:    'https://www.nseindia.com',
  timeout:    15000,
  httpAgent:  new http.Agent ({ insecureHTTPParser: true }),
  httpsAgent: new https.Agent({ insecureHTTPParser: true }),
  headers:    BROWSER_HEADERS,
});
let _nseCookies = '';
async function _refreshNSECookies() {
  try {
    const res     = await nseClient.get('/');
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      _nseCookies = cookies.map(c => c.split(';')[0]).join('; ');
      nseClient.defaults.headers['Cookie'] = _nseCookies;
    }
    return true;
  } catch { return false; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _clean(str = '') { return str.replace(/\s+/g, ' ').trim(); }

function _parseDate(str = '') {
  if (!str) return null;
  str = _clean(str);

  // "Apr 28, 2025" or "Apr 28 2025"
  const m1 = /^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/.exec(str);
  if (m1) {
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const d = new Date(+m1[3], months[m1[1]] ?? 0, +m1[2]);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  // "28-Apr-2025"  "28 Apr 2025"
  const m2 = /^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/.exec(str);
  if (m2) {
    const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const d = new Date(+m2[3], months[m2[2].toLowerCase()] ?? 0, +m2[1]);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  // ISO / other formats
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function _deriveStatus(openDate, closeDate) {
  if (!openDate) return 'upcoming';
  const now   = new Date();
  const open  = new Date(openDate);
  const close = closeDate ? new Date(closeDate) : open;
  if (now < open)   return 'upcoming';
  if (now <= close) return 'active';
  return 'closed';
}

function _parsePriceBand(raw = '') {
  const nums = raw.replace(/[₹,]/g, '').match(/[\d.]+/g) || [];
  return {
    min: parseFloat(nums[0] || '0'),
    max: parseFloat(nums[1] || nums[0] || '0'),
    display: raw.includes('to') ? raw.replace(/\s+/g,' ').trim() : (nums[0] ? `₹${nums[0]}` : 'TBA'),
  };
}

// ── Scrape ipowatch.in/ipo-listing/ (current & recently closed) ───────────────
async function fetchFromIPOWatch() {
  const results = [];

  // ── Page 1: Current / Active IPOs (/ipo-listing/)
  const { data: htmlCurrent } = await axios.get('https://ipowatch.in/ipo-listing/', {
    timeout: 20000,
    headers: BROWSER_HEADERS,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const $c = cheerio.load(htmlCurrent);
  // First table = mainboard current IPOs
  $c('table').first().find('tr').each((i, row) => {
    if (i === 0) return;
    const cells = $c(row).find('td');
    if (cells.length < 5) return;
    const name      = _clean($c(cells[0]).text());
    const openRaw   = _clean($c(cells[1]).text());
    const closeRaw  = _clean($c(cells[2]).text());
    const sizeRaw   = _clean($c(cells[3]).text());
    const priceRaw  = _clean($c(cells[4]).text());
    const openDate  = _parseDate(openRaw);
    const closeDate = _parseDate(closeRaw);
    if (!name || name.length < 3) return;
    const { min, max, display } = _parsePriceBand(priceRaw);
    results.push({
      source: 'IPOWATCH', name, ticker: '', sector: 'General',
      priceBandMin: min, priceBandMax: max, priceBandDisplay: display,
      lotSize: 0, openDate, closeDate, listingDate: null,
      issueSize: sizeRaw || null,
      status: _deriveStatus(openDate, closeDate),
      drhpUrl: null,
    });
  });

  // ── Page 2: Upcoming IPOs (/upcoming-ipo/)
  const { data: htmlUpcoming } = await axios.get('https://ipowatch.in/upcoming-ipo/', {
    timeout: 20000,
    headers: BROWSER_HEADERS,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  const $u = cheerio.load(htmlUpcoming);

  // Parse ALL tables on upcoming page (Table 1 = mainboard, Table 2 = SME, Table 3 = future)
  $u('table').each((tIdx, table) => {
    $u(table).find('tr').each((i, row) => {
      if (i === 0) return;
      const cells = $u(row).find('td');
      if (cells.length < 3) return;
      const name      = _clean($u(cells[0]).text());
      const dateRaw   = _clean($u(cells[1]).text());
      const sizeRaw   = _clean($u(cells[2]).text());
      const priceRaw  = cells.length > 3 ? _clean($u(cells[3]).text()) : '';
      if (!name || name.length < 3) return;
      if (name.toLowerCase() === 'company' || name.toLowerCase() === 'ipo') return;
      if (dateRaw.toLowerCase() === 'ipo date' || dateRaw.toLowerCase() === 'date') return;
      // Skip "Apply IPO" rows
      if (name.toLowerCase().includes('apply') || sizeRaw.toLowerCase().includes('apply')) return;

      // Try to parse open/close dates from range like "23-27 April" or "Apr 23, 2026"
      let openDate = null;
      let closeDate = null;
      const currentYear = new Date().getFullYear();

      // Pattern: "23-27 April" or "23-27 Apr"
      const rangeMatch = /^(\d{1,2})[–\-](\d{1,2})\s+([A-Za-z]+)$/.exec(dateRaw);
      if (rangeMatch) {
        const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
        const mo = months[rangeMatch[3].toLowerCase().substring(0,3)];
        if (mo !== undefined) {
          const dOpen  = new Date(currentYear, mo, parseInt(rangeMatch[1]));
          const dClose = new Date(currentYear, mo, parseInt(rangeMatch[2]));
          openDate  = dOpen.toISOString().split('T')[0];
          closeDate = dClose.toISOString().split('T')[0];
        }
      } else {
        openDate = _parseDate(dateRaw);
      }

      const { min, max, display } = _parsePriceBand(priceRaw);
      // Don't add if price has placeholder "[.]"
      if (priceRaw.includes('[.]') && !openDate) return;

      results.push({
        source: 'IPOWATCH', name, ticker: '', sector: 'General',
        priceBandMin: min, priceBandMax: max, priceBandDisplay: display || 'TBA',
        lotSize: 0, openDate, closeDate, listingDate: null,
        issueSize: sizeRaw.includes('[.]') ? null : (sizeRaw || null),
        status: _deriveStatus(openDate, closeDate),
        drhpUrl: null,
      });
    });
  });

  return results;
}

// ── NSE pre-open fallback ─────────────────────────────────────────────────────
async function fetchFromNSE() {
  await _refreshNSECookies();
  const { data } = await nseClient.get('/api/market-data-pre-open?key=IPO');
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.map(item => {
    const meta = item.metadata || {};
    return {
      source: 'NSE',
      name:   meta.companyName || meta.symbolDesc || item.symbol || '',
      ticker: item.symbol || '', sector: meta.industry || 'General',
      priceBandMin: parseFloat(meta.pdClose || 0),
      priceBandMax: parseFloat(meta.pdClose || 0),
      priceBandDisplay: meta.pdClose ? `₹${meta.pdClose}` : 'TBA',
      lotSize: 0, openDate: null, closeDate: null, listingDate: null,
      issueSize: null, status: 'active', drhpUrl: null,
    };
  }).filter(i => i.name);
}

async function fetchFromBSE() { return []; }

// ── SEBI EDGAR DRHP lookup ────────────────────────────────────────────────────
async function fetchDRHPUrlFromSEBI(companyName) {
  try {
    const { data } = await axios.get(
      'https://efts.sebi.gov.in/efts-reports/eftsreportdownload',
      { params: { searchText: companyName, categoryName: 'DR', subcategoryName: '',
                  fromDate: '', toDate: '', fileStatus: '', efts_search_text: companyName },
        timeout: 10000,
        headers: { Accept: 'application/json', Referer: 'https://www.sebi.gov.in/',
                   'User-Agent': 'Mozilla/5.0 Chrome/120' } }
    );
    const hits = data?.hits?.hits;
    if (hits?.length > 0) {
      const fileId = hits[0]._source?.FILE_DOWNLOAD_ID || hits[0]._id;
      return `https://efts.sebi.gov.in/LATEST/UPLOAD/${fileId}.pdf`;
    }
    return null;
  } catch { return null; }
}

// ── Subscription data ─────────────────────────────────────────────────────────
async function fetchSubscriptionData(nseSymbol) {
  try {
    await _refreshNSECookies();
    const { data } = await nseClient.get(`/api/ipoSubscriptionStatus?symbol=${encodeURIComponent(nseSymbol)}`);
    return {
      totalSubscription:  data.overallSubscription || data.totalSubscription || 0,
      qibSubscription:    data.qibSubscription    || 0,
      niiSubscription:    data.niiSubscription    || 0,
      retailSubscription: data.retailSubscription || 0,
      updatedAt:          new Date().toISOString(),
    };
  } catch { return null; }
}

// ── GMP data ──────────────────────────────────────────────────────────────────
async function fetchGMPData() {
  try {
    const { data: html } = await axios.get('https://www.investorgain.com/report/ipo-gmp/331/',
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } });
    const gmpMap = {};
    const rows   = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    for (const row of rows) {
      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (cells.length >= 3) {
        const name = cells[0].replace(/<[^>]+>/g, '').trim().toLowerCase();
        const gmp  = parseFloat(cells[2].replace(/<[^>]+>/g, '').trim());
        if (name && !isNaN(gmp)) gmpMap[name] = gmp;
      }
    }
    return gmpMap;
  } catch { return {}; }
}

// ── Master sync ───────────────────────────────────────────────────────────────
async function syncIPOsToDatabase() {
  console.log('🔄  Starting IPO sync (ipowatch.in scraper)...');
  let synced = 0, errors = 0;
  let rawIPOs = [];

  try {
    rawIPOs = await fetchFromIPOWatch();
    if (rawIPOs.length > 0) {
      console.log(`    ✅ ipowatch.in: ${rawIPOs.length} IPOs found`);
    } else {
      throw new Error('No IPOs parsed from ipowatch.in');
    }
  } catch (err) {
    console.warn(`    ⚠️  ipowatch.in failed (${err.message}) — trying NSE pre-open`);
    try {
      rawIPOs = await fetchFromNSE();
      console.log(`    ✅ NSE pre-open: ${rawIPOs.length} IPOs`);
    } catch (nseErr) {
      console.warn(`    ⚠️  NSE failed (${nseErr.message}) — skipping sync`);
      return { synced: 0, errors: 1 };
    }
  }

  for (const ipo of rawIPOs) {
    if (!ipo.name || ipo.name.length < 3) continue;
    try {
      await upsertIPO(ipo);
      synced++;
    } catch (err) {
      console.error(`    ❌ Upsert failed for "${ipo.name}": ${err.message}`);
      errors++;
    }
  }

  console.log(`✅  Sync done: ${synced} upserted, ${errors} errors`);
  return { synced, errors };
}

// ── Upsert one IPO ────────────────────────────────────────────────────────────
async function upsertIPO(ipo) {
  await pool.execute(
    `INSERT INTO ipos (
       name, ticker, sector,
       price_band_min, price_band_max, price_band_display,
       lot_size, open_date, close_date, listing_date,
       issue_size, status, drhp_pdf_url, rhp_pdf_url,
       nse_symbol, bse_code, data_source, is_active
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,TRUE)
     ON DUPLICATE KEY UPDATE
       sector             = VALUES(sector),
       price_band_min     = VALUES(price_band_min),
       price_band_max     = VALUES(price_band_max),
       price_band_display = VALUES(price_band_display),
       lot_size           = VALUES(lot_size),
       open_date          = VALUES(open_date),
       close_date         = VALUES(close_date),
       listing_date       = VALUES(listing_date),
       issue_size         = VALUES(issue_size),
       status             = VALUES(status),
       drhp_pdf_url       = COALESCE(VALUES(drhp_pdf_url), drhp_pdf_url),
       data_source        = VALUES(data_source),
       updated_at         = NOW()`,
    [
      ipo.name, ipo.ticker || null, ipo.sector || 'General',
      ipo.priceBandMin || 0, ipo.priceBandMax || 0, ipo.priceBandDisplay || null,
      ipo.lotSize || 0,
      _parseDate(ipo.openDate), _parseDate(ipo.closeDate), _parseDate(ipo.listingDate),
      ipo.issueSize || null, ipo.status || 'upcoming',
      ipo.drhpUrl || null, ipo.rhpUrl || null,
      ipo.nseSymbol || null, ipo.bseCode || null,
      // Map scraper source to allowed ENUM values
      ipo.source === 'NSE' ? 'NSE' : ipo.source === 'BSE' ? 'BSE' : ipo.source === 'SEBI' ? 'SEBI' : 'MANUAL',
    ]
  );
}

function _parseDate2(str) { return _parseDate(str); }

module.exports = {
  syncIPOsToDatabase,
  fetchFromNSE,
  fetchFromBSE,
  fetchFromIPOWatch,
  fetchDRHPUrlFromSEBI,
  fetchSubscriptionData,
  fetchGMPData,
  upsertIPO,
};
