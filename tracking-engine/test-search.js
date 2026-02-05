const http = require('http');

const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3005,
            path: path,
            method: 'GET',
            headers: { 'X-INTERNAL-KEY': 'spylancer_prod_secret_2025' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Raw response:', data);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
};

(async () => {
    try {
        console.log('--- Testing Search ---');
        const res = await makeRequest('/library/ads/search?q=buy&limit=1');
        console.log('Total Hits:', res.total);
        console.log('First Hit ID:', res.data[0]?.id || 'None');
        console.log('First Hit Title:', res.data[0]?.ad_creative?.headline || 'No Headline');
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
