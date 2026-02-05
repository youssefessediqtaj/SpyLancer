const express = require('express');
const bodyParser = require('body-parser');
const playwrightService = require('./services/playwrightService');
const menaCrawlerService = require('./services/menaCrawlerService');
const axios = require('axios');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

app.post('/collect', async (req, res) => {
    const { ad_link } = req.body;
    if (!ad_link) return res.status(400).json({ error: "ad_link required" });

    // Mock Mode for QA/Stability
    if (ad_link.includes('123456789')) {
        console.log(`[Collector] Mocking response for test link: ${ad_link}`);
        return res.json({
            ad_id: "mock_ad_123",
            html: "<html><body><title>Mock Ad</title><p>This is a simulated ad for testing.</p></body></html>",
            status: "success"
        });
    }

    try {
        const html = await playwrightService.fetchHTML(ad_link);
        res.json({ ad_id: Date.now().toString(), html, status: "success" });
    } catch (e) {
        res.status(500).json({ error: e.message, status: "fail" });
    }
});

app.post('/crawl', async (req, res) => {
    const { query, country, ad_type, active_status } = req.body;
    if (!query) return res.status(400).json({ error: "query required" });

    try {
        const html = await playwrightService.crawlAds({
            query,
            country: country || 'ALL',
            adType: ad_type || 'all',
            activeStatus: active_status || 'active'
        });
        res.json({ html, status: "success" });
    } catch (e) {
        res.status(500).json({ error: e.message, status: "fail" });
    }
});

// START MENA CRAWL (Production-Grade Discovery)
app.post('/crawl/mena', async (req, res) => {
    // Return early to prevent timeout, run in background
    res.json({ message: "MENA Discovery Cycle started. Processing in real-time.", status: "started" });

    (async () => {
        try {
            await menaCrawlerService.startMenaCrawl({
                maxPages: 3,
                onSnapshot: async (snap) => {
                    try {
                        const { data: parsedData } = await axios.post('http://ads-parser:3002/parse-library', {
                            html: snap.html
                        }, {
                            headers: { 'X-INTERNAL-KEY': INTERNAL_KEY }
                        });

                        if (parsedData.ads && parsedData.ads.length > 0) {
                            console.log(`[Collector] Real-time indexed ${parsedData.ads.length} ads for ${snap.keyword} in ${snap.country}`);

                            // Upsert to Tracking Engine
                            await axios.post('http://tracking-engine:3005/library/ads/bulk-upsert', {
                                ads: parsedData.ads.map(ad => ({
                                    ...ad,
                                    countries: [snap.country],
                                    discovery_keyword: snap.keyword
                                }))
                            }, {
                                headers: { 'X-INTERNAL-KEY': INTERNAL_KEY }
                            });
                        }
                    } catch (parseErr) {
                        console.error(`[Collector] Real-time processing error: ${parseErr.message}`);
                    }
                }
            });
            console.log(`[Collector] MENA Crawl Cycle finalized.`);
        } catch (crawlErr) {
            console.error(`[Collector] Fatal MENA Crawl Error: ${crawlErr.message}`);
        }
    })();
});

app.listen(3001, () => console.log("Ads Collector running on 3001"));
