const axios = require('axios');
const https = require('https');

async function inspect() {
  const { data: html } = await axios.get('https://www.chittorgarh.com/ipo/ipo_dashboard.asp', {
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Accept': 'text/html,*/*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

  // Print first 5000 chars to understand structure
  console.log(html.substring(0, 8000));
}

inspect().catch(console.error);
