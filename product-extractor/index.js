const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { extractProduct } = require('./services/extractorService');

const app = express();
app.use(bodyParser.json());

const mongoose = require('mongoose');
const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Product Extractor connected to MongoDB'))
    .catch(err => console.error('Product Extractor MongoDB error:', err));

const CacheSchema = new mongoose.Schema({
    url_hash: { type: String, unique: true },
    data: Object,
    createdAt: { type: Date, default: Date.now, expires: '7d' } // Cache for 7 days
});
const ExtractionCache = mongoose.model('ExtractionCache', CacheSchema);

const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

app.post('/extract', async (req, res) => {
    const { landing_page_html, platform, url } = req.body;
    if (!landing_page_html) return res.status(400).json({ error: "html required" });

    // 1. Cache Check
    const url_hash = crypto.createHash('md5').update(url || landing_page_html.substring(0, 100)).digest('hex');
    try {
        const cached = await ExtractionCache.findOne({ url_hash });
        if (cached) {
            console.log(`[Cache Hit] for hash: ${url_hash}`);
            return res.json(cached.data);
        }
    } catch (e) {
        console.error("Cache error", e);
    }

    // 2. Extract
    const product = extractProduct(landing_page_html, platform || 'Custom'); // Added 'Custom' default for platform

    // 3. Save to Cache
    try {
        await ExtractionCache.create({ url_hash, data: product });
    } catch (e) {
        console.error("Cache save error", e);
    }

    res.json(product);
});

app.listen(3004, () => console.log("Product Extractor running on 3004"));
