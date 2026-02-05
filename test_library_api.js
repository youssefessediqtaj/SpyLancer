const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function testLibrary() {
    try {
        console.log("1. Registering/Logging in test user...");
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: "qa_v_final@example.com",
            password: "Password123!"
        });
        const token = loginRes.data.token;
        console.log("Token obtained.");

        console.log("2. Testing GET /library/ads...");
        const adsRes = await axios.get(`${API_URL}/library/ads`, {
            headers: { Authorization: token }
        });
        console.log(`Found ${adsRes.data.data.length} ads in library.`);
        console.log(JSON.stringify(adsRes.data.data, null, 2));

    } catch (e) {
        console.error("Test failed:", e.response?.data || e.message);
    }
}

testLibrary();
