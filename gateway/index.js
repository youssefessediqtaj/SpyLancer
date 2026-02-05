const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

const PORT = 8000;
const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

// Redis for Rate Limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Services URLs
const AUTH_URL = 'http://auth-service:3007';
const TRACKING_URL = 'http://tracking-engine:3005';
const COLLECTOR_URL = 'http://ads-collector:3001';
const PARSER_URL = 'http://ads-parser:3002';
const DETECTOR_URL = 'http://store-detector:3003';
const EXTRACTOR_URL = 'http://product-extractor:3004';
const ANALYTICS_URL = 'http://analytics-engine:3006';

// Internal Axios Instance
const internalApi = axios.create({
    timeout: 30000,
    headers: { 'X-INTERNAL-KEY': INTERNAL_KEY }
});

// Middleware for Auth & Role Limits
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization;
    console.log(`[Auth] Checking token for path: ${req.path}`);

    if (!token) {
        console.warn(`[Auth] No token provided for ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log(`[Auth] Verifying token with Auth Service: ${token.substring(0, 15)}...`);
        const { data } = await internalApi.get(`${AUTH_URL}/me`, {
            headers: { authorization: token }
        });

        console.log(`[Auth] Success: Authenticated as ${data.user.email} (${data.user.plan})`);
        req.user = data.user;
        next();
    } catch (e) {
        console.error(`[Auth] Authentication failed for ${req.path}: ${e.message}`);
        if (e.response) {
            console.error(`[Auth] Auth Service Response: ${e.response.status} - ${JSON.stringify(e.response.data)}`);
        } else {
            console.error(`[Auth] No response from Auth Service. Is it down? URL: ${AUTH_URL}/me`);
        }
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for easier testing
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
});

app.use('/api/', apiLimiter);

// Extraction Pipeline Orchestration
async function fullAdPipeline(ad_link) {
    console.log(`[Gateway] Processing pipeline for: ${ad_link}`);
    const { data: collected } = await internalApi.post(`${COLLECTOR_URL}/collect`, { ad_link });
    const { data: parsed } = await internalApi.post(`${PARSER_URL}/parse`, { html: collected.html });
    const { data: store } = await internalApi.post(`${DETECTOR_URL}/detect`, { landing_page_html: collected.html });
    const { data: product } = await internalApi.post(`${EXTRACTOR_URL}/extract`, {
        landing_page_html: collected.html,
        platform: store.platform
    });
    const { data: analytics } = await internalApi.post(`${ANALYTICS_URL}/analyze`, {
        duplicate_count: 5,
        days_active: 7
    });
    return { collected, parsed, store, product, analytics };
}

// Routes
app.post('/api/ads/extract', authenticate, async (req, res) => {
    const { ad_link } = req.body;
    try {
        const result = await fullAdPipeline(ad_link);
        const extractedData = {
            advertiser_name: result.product.name,
            product_name: result.product.name,
            selling_price: result.product.price,
            currency: result.product.currency,
            offer_type: result.parsed.cta,
            landing_page: result.parsed.landing_page,
            platform: result.store.platform,
            confidence: result.product.confidence,
            scaling_score: result.analytics.scaling_score,
            trend: result.analytics.trend,
            ad_id: result.collected.ad_id || ad_link.split('id=')[1]
        };
        res.json({ status: 'success', extracted_data: extractedData });
    } catch (e) {
        console.error(`Pipeline error: ${e.message}`);
        res.status(500).json({ error: "Extraction failed." });
    }
});

app.get('/api/me', authenticate, (req, res) => {
    res.json({ status: 'success', user: req.user });
});

app.put('/api/profile', authenticate, async (req, res) => {
    try {
        const { data } = await internalApi.put(`${AUTH_URL}/profile`, req.body, {
            headers: { authorization: req.headers.authorization }
        });
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { data } = await internalApi.post(`${AUTH_URL}/register`, req.body);
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { data } = await internalApi.post(`${AUTH_URL}/login`, req.body);
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.get('/api/ads', authenticate, async (req, res) => {
    try {
        const { data } = await internalApi.get(`${TRACKING_URL}/ads`, { params: { ...req.query, user_id: req.user.id } });
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

// Library Routes
app.get('/api/library/ads', authenticate, async (req, res) => {
    try {
        const { data } = await internalApi.get(`${TRACKING_URL}/library/ads`, { params: req.query });
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.get('/api/library/search', authenticate, async (req, res) => {
    try {
        const { data } = await internalApi.get(`${TRACKING_URL}/library/ads/search`, { params: req.query });
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.post('/api/library/ads/:id/track', authenticate, async (req, res) => {
    try {
        const { data } = await internalApi.post(`${TRACKING_URL}/library/ads/${req.params.id}/track`, { user_id: req.user.id });
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

// ADMIN - Trigger MENA Crawl
app.post('/api/admin/crawler/mena', authenticate, async (req, res) => {
    // In production, check for admin role here
    try {
        const { data } = await internalApi.post(`${COLLECTOR_URL}/crawl/mena`);
        res.json(data);
    } catch (e) {
        res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
    }
});

app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
