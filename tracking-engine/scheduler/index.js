const cron = require('node-cron');
const axios = require('axios');
const LibraryAd = require('../models/libraryModel');

const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';
const ADS_COLLECTOR_URL = 'http://ads-collector:3001';

console.log('[Scheduler] Initializing jobs...');

// --- 1. HOURLY CRAWL (At minute 0 of every hour) ---
cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Triggering Hourly MENA Crawl...');
    try {
        await axios.post(`${ADS_COLLECTOR_URL}/crawl/mena`, {}, {
            headers: { 'X-INTERNAL-KEY': INTERNAL_KEY }
        });
        console.log('[Scheduler] Crawl triggered successfully.');
    } catch (e) {
        console.error(`[Scheduler] Crawl trigger failed: ${e.message}`);
    }
});

// --- 2. DAILY CLEANUP (Retention & Inactivity) - Runs at 03:00 AM ---
cron.schedule('0 3 * * *', async () => {
    console.log('[Scheduler] Starting Daily Cleanup...');
    try {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        // Delete ads older than 2 years
        const deleteResult = await LibraryAd.deleteMany({ first_seen: { $lt: twoYearsAgo } });
        console.log(`[Scheduler] Retention Cleanup: Deleted ${deleteResult.deletedCount} old ads.`);

        // Mark ads unseen for 7 days as inactive
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const inactiveResult = await LibraryAd.updateMany(
            { last_seen: { $lt: sevenDaysAgo }, is_active: true },
            { $set: { is_active: false } }
        );
        console.log(`[Scheduler] Inactivity Check: Marked ${inactiveResult.nModified} ads as inactive.`);

    } catch (e) {
        console.error(`[Scheduler] Cleanup failed: ${e.message}`);
    }
});

// --- 3. WEEKLY AI EXPANSION - Runs on Monday at 04:00 AM ---
// This will limit costs/load while keeping keywords fresh
cron.schedule('0 4 * * 1', async () => {
    console.log('[Scheduler] Triggering Weekly AI Keyword Expansion...');
    // TODO: Call internal keyword expansion endpoint
    // await axios.post('http://localhost:3005/internal/keywords/expand', ...);
});

module.exports = {};
