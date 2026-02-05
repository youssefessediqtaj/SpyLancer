const dns = require('dns');
const axios = require('axios');

console.log('--- Connectivity Test ---');

// 1. DNS Lookup
dns.lookup('ads-collector', (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Failed:', err.code);
    } else {
        console.log('DNS Lookup Success:', address, 'Family:', family);

        // 2. HTTP Request
        console.log('Attempting HTTP GET to http://ads-collector:3001/status ...');
        axios.get('http://ads-collector:3001/status', { timeout: 5000 })
            .then(res => {
                console.log('HTTP Success:', res.status, res.data);
            })
            .catch(e => {
                console.error('HTTP Failed:', e.message);
                if (e.response) console.error('Response:', e.response.status);
            });
    }
});
