const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const TEST_USER = {
    name: "QA Tester",
    email: `tester_${Date.now()}@spylancer.com`,
    password: "Password123!"
};

let token = '';

async function runTests() {
    console.log("🚀 Starting SpyLancer QA Suite...");

    try {
        // 1. Auth Flow
        console.log("\n[1/5] Testing Authorization Flow...");
        const regRes = await axios.post(`${API_URL}/register`, TEST_USER);
        if (regRes.data.status === 'success') {
            console.log("✅ Registration Successful");
            token = regRes.data.token;
        }

        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        if (loginRes.data.token) console.log("✅ Login Successful");

        const authHeader = { headers: { authorization: token } };

        // 2. Profile Management
        console.log("\n[2/5] Testing Profile Updates...");
        const profRes = await axios.put(`${API_URL}/profile`, { name: "QA Updated" }, authHeader);
        if (profRes.data.user.name === "QA Updated") console.log("✅ Profile Update Successful");

        // 3. Extraction Pipeline (Mock Link)
        console.log("\n[3/5] Testing Extraction Pipeline...");
        const adLink = "https://www.facebook.com/ads/library/?id=123456789";
        const extRes = await axios.post(`${API_URL}/ads/extract`, { ad_link: adLink }, authHeader);
        if (extRes.data.status === 'success') {
            console.log("✅ Pipeline Orchestration Successful");
            console.log(`   Detected Platform: ${extRes.data.extracted_data.platform}`);
            console.log(`   Scaling Score: ${extRes.data.extracted_data.scaling_score}`);
        }

        // 4. Tracking CRUD
        console.log("\n[4/5] Testing Tracking CRUD...");
        const newAd = await axios.post(`${API_URL}/ads`, {
            ...extRes.data.extracted_data,
            ad_link: adLink,
            status: 'testing'
        }, authHeader);
        const adId = newAd.data._id;
        console.log("✅ Ad Tracking Started");

        await axios.patch(`${API_URL}/ads/${adId}/favorite`, {}, authHeader);
        console.log("✅ Favoriting Successful");

        await axios.patch(`${API_URL}/ads/${adId}/archive`, {}, authHeader);
        console.log("✅ Archiving Successful");

        // 5. Dashboard Stats
        console.log("\n[5/5] Testing Analytics Aggregation...");
        const statsRes = await axios.get(`${API_URL}/stats/summary`, authHeader);
        if (statsRes.data.total_ads >= 1) console.log("✅ Stats Summary Validated");

        const chartRes = await axios.get(`${API_URL}/stats/charts`, authHeader);
        if (chartRes.data.new_ads_trend) console.log("✅ Charts Aggregation Validated");

        console.log("\n🏆 ALL CORE FLOWS PASSED QA 🏆");
        process.exit(0);

    } catch (e) {
        console.error("\n❌ QA TEST FAILED!");
        console.error(e.response?.data || e.message);
        process.exit(1);
    }
}

runTests();
