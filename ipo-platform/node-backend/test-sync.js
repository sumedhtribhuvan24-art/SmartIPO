require('dotenv').config();
const { syncIPOsToDatabase } = require('./src/services/scraperService');

syncIPOsToDatabase().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
