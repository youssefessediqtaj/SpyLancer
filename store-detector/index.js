const express = require('express');
const bodyParser = require('body-parser');
const { detectStore } = require('./services/detectorService');

const app = express();
app.use(bodyParser.json());

const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

app.post('/detect', async (req, res) => {
    const { landing_page_html, url } = req.body;

    let result = { platform: 'Unknown', confidence: 0 };
    let domain = '';

    if (url) {
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch (e) {
            console.warn(`[Detector] Invalid URL: ${url}`);
        }
    }

    if (landing_page_html) {
        result = detectStore(landing_page_html);
    }

    res.json({
        domain,
        platform: result.platform,
        confidence: result.confidence,
        tech_stack: result.tech_stack || [],
        currency: result.currency || 'USD',
        country: result.country || 'US'
    });
});

app.listen(3003, () => console.log("Store Detector running on 3003"));
