/**
 * SpyLancer Comprehensive QA Suite
 * This script validates all core microservices and integration points.
 */

const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const INTERNAL_KEY = 'spylancer_prod_secret_2025'; // From docker-compose.yml

const TEST_USER = {
    name: "Comprehensive QA",
    email: `qa_${Date.now()}@spylancer.com`,
    password: "Password123!"
};

let token = '';

function log(status, message) {
    const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : (status === 'INFO' ? 'ℹ️' : '⚠️'));
    console.log(`${icon} [${status}] ${message}`);
}

async function runTests() {
    log('INFO', 'Starting Comprehensive QA Validation...');

    // 1. AUTHENTICATION TESTS
    console.log("\n--- [1] Authentication Tests ---");
    try {
        // Register
        const regRes = await axios.post(`${API_URL}/register`, TEST_USER);
        if (regRes.status === 200 && regRes.data.status === 'success') {
            log('PASS', 'User Registration');
            token = regRes.data.token;
        } else {
            throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
        }

        // Login
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        if (loginRes.data.token) {
            log('PASS', 'User Login');
        } else {
            throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
        }

        // Invalid Credentials
        try {
            await axios.post(`${API_URL}/login`, {
                email: TEST_USER.email,
                password: 'WrongPassword'
            });
            log('FAIL', 'Invalid Credentials (expected 401, got 200)');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                log('PASS', 'Invalid Credentials properly handled (401)');
            } else {
                log('FAIL', `Invalid Credentials unexpected response: ${e.response?.status}`);
            }
        }

        // Protected Routes without token
        try {
            await axios.get(`${API_URL}/stats/summary`);
            log('FAIL', 'Protected Route Access Without Token (expected failure, got success)');
        } catch (e) {
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                log('PASS', 'Protected Route Access Without Token denied');
            } else {
                log('FAIL', `Protected Route unexpected error: ${e.response?.status}`);
            }
        }

    } catch (err) {
        log('FAIL', `Auth suite crashed: ${err.message}`);
    }

    // 2. API GATEWAY TESTS
    console.log("\n--- [2] Gateway Tests ---");
    try {
        const authHeader = { headers: { authorization: `Bearer ${token}` } };

        // Link Validation
        try {
            await axios.post(`${API_URL}/ads/extract`, { ad_link: 'http://malicious-site.com' }, authHeader);
            log('FAIL', 'Invalid ad link accepted (expected rejection)');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                log('PASS', 'Invalid ad link rejected (400)');
            } else {
                log('FAIL', `Invalid ad link unexpected response: ${e.response?.status}`);
            }
        }

        // Internal services access (localhost check)
        // Note: This script runs outside docker, so hitting port 3007/3001 etc directly 
        // will only work if they are EXPOSED in docker-compose.
        // In the provided docker-compose, they use 'expose' (internal only) except for gateway and frontend.
        // We can check if ports are accidentally exposed.
        const ports = [3007, 3001, 3002, 3003, 3004, 3005, 3006];
        for (const port of ports) {
            try {
                await axios.get(`http://localhost:${port}/`, { timeout: 1000 });
                log('FAIL', `Internal service at port ${port} is PUBLICLY ACCESSIBLE`);
            } catch (e) {
                if (e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET') {
                    // This is good, means port is not mapped to localhost
                    // However, 'expose' in docker-compose doesn't map to host.
                    // But if someone used 'ports', it would be.
                } else if (e.response && (e.response.status === 403 || e.response.status === 401)) {
                    log('PASS', `Internal service at port ${port} rejected public call (401/403)`);
                }
            }
        }

    } catch (err) {
        log('FAIL', `Gateway suite crashed: ${err.message}`);
    }

    // 3. EXTRACTION PIPELINE
    console.log("\n--- [3] Ad Extraction Pipeline ---");
    let extractedData = null;
    try {
        const authHeader = { headers: { authorization: `Bearer ${token}` } };
        const validAdLink = "https://www.facebook.com/ads/library/?id=123456789";

        log('INFO', 'Submitting Meta ad link...');
        const start = Date.now();
        const extRes = await axios.post(`${API_URL}/ads/extract`, { ad_link: validAdLink }, authHeader);
        const end = Date.now();

        if (extRes.data.status === 'success') {
            log('PASS', `Extraction pipeline completed in ${end - start}ms`);
            extractedData = extRes.data.extracted_data;
            log('INFO', `Data: ${extractedData.platform} | Score: ${extractedData.scaling_score}`);
        } else {
            log('FAIL', `Extraction pipeline failed status: ${extRes.data.status}`);
        }
    } catch (err) {
        log('FAIL', `Extraction pipeline error: ${err.message}`);
        if (err.response) log('FAIL', `Details: ${JSON.stringify(err.response.data)}`);
    }

    // 4. TRACKING SERVICE
    console.log("\n--- [4] Tracking & Analytics ---");
    try {
        const authHeader = { headers: { authorization: `Bearer ${token}` } };
        if (extractedData) {
            // Create
            const createRes = await axios.post(`${API_URL}/ads`, {
                ...extractedData,
                ad_link: "https://www.facebook.com/ads/library/?id=123456789"
            }, authHeader);
            const adId = createRes.data._id;
            log('PASS', `Ad created and tracked (ID: ${adId})`);

            // Update
            await axios.patch(`${API_URL}/ads/${adId}/favorite`, {}, authHeader);
            log('PASS', 'Favorited ad');

            // Stats
            const statsRes = await axios.get(`${API_URL}/stats/summary`, authHeader);
            if (statsRes.data.total_ads >= 1) {
                log('PASS', 'Stats summary validated');
            } else {
                log('FAIL', 'Stats summary did not reflect new ad');
            }
        } else {
            log('SKIP', 'Tracking tests skipped due to extraction failure');
        }
    } catch (err) {
        log('FAIL', `Tracking suite error: ${err.message}`);
    }

    log('INFO', 'Comprehensive QA Suite finished.');
}

runTests();
