const axios = require('axios');
const http = require('http');
const https = require('https');

const bseClient = axios.create({
  baseURL: 'https://api.bseindia.com',
  timeout: 15000,
  httpAgent: new http.Agent({ insecureHTTPParser: true }),
  httpsAgent: new https.Agent({ insecureHTTPParser: true }),
  headers: {
    Accept:           'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    Origin:   'https://www.bseindia.com',
    Referer:  'https://www.bseindia.com/markets/PublicIssues/IPOMain.aspx',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  },
});

async function test() {
  try {
    const { data } = await bseClient.get('/BseIndiaAPI/api/IPOMain/w', {
      params: { Type: 'Equity', Status: 'Active' },
    });
    console.log("Success!", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
