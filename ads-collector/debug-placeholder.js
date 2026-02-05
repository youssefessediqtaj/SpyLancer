const { startMenaCrawl } = require('./services/menaCrawlerService');

// Mock data to force multiple iterations quickly
const MENA_COUNTRIES = ['AE', 'SA'];
// We can't easily mock internal constants of the module without proxyquire or similar.
// But we can check if it loops by observing logs.
// Or effectively, I can modify the service to accept 'countries' and 'keywords' as options?
// The current implementation hardcodes them.
// I'll modify menaCrawlerService.js to accept overrides in options.

// See next tool call for modification of menaCrawlerService.js
