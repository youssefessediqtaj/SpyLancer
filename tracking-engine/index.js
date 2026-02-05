const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Ads = require('./models/trackingModel');
const LibraryAd = require('./models/libraryModel');
const cors = require('cors');

const { MeiliSearch } = require('meilisearch');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

// Meilisearch Initialization
const meiliClient = new MeiliSearch({
    host: 'http://meilisearch:7700',
    apiKey: 'spylancer_meili_master_key_2025'
});

// Initialize Scheduler
require('./scheduler');

const adIndex = meiliClient.index('libraryads', { primaryKey: 'id' });

// Configure searchable and filterable attributes
(async () => {
    try {
        await meiliClient.createIndex('libraryads', { primaryKey: 'id' });
        await adIndex.updateSettings({
            searchableAttributes: [
                'advertiser_name',
                'ad_creative.primary_text',
                'ad_creative.headline',
                'landing_page_url'
            ],
            filterableAttributes: [
                'platform',
                'ad_status',
                'countries',
                'categories',
                'payment_type',
                'pixel_detected',
                'language_primary',
                'media_type',
                'last_seen_timestamp',
                'start_date_timestamp'
            ],
            sortableAttributes: [
                'createdAt',
                'last_seen_timestamp',
                'metrics.days_running',
                'metrics.duplicate_count',
                'metrics.scaling_score',
                'metrics.confidence_score'
            ]
        });
        console.log('[Meilisearch] Index settings updated');
    } catch (e) {
        console.warn('[Meilisearch] Failed to update settings:', e.message);
    }
})();

// Enrichment Helper (Heuristics)
const enrichAd = (ad) => {
    const text = (ad.ad_creative.primary_text || '').toLowerCase();
    const store = ad.detected_store || {};
    const platform = store.ecommerce_platform || '';

    // 1. Language detection (simple)
    if (/[أ-ي]/.test(text)) ad.language_primary = 'ar';
    else if (/acheter|commande|promotion/.test(text)) ad.language_primary = 'fr';
    else ad.language_primary = 'en';

    // 2. COD detection
    const codKeywords = ['cash on delivery', 'الدفع عند الاستلام', 'paiement à la livraison', 'cod', 'cash on delivry'];
    const isCod = codKeywords.some(k => text.includes(k));
    ad.payment_type = isCod ? 'COD' : (platform ? 'Online' : 'Unknown');

    // 3. Category detection
    ad.categories = ad.categories || [];
    if (platform || ad.ad_creative.call_to_action?.includes('SHOP_NOW')) {
        ad.categories.push('E-Commerce');
    }
    if (isCod) ad.categories.push('Cash on Delivery (COD)');
    if (text.includes('download') || text.includes('app store') || text.includes('google play')) {
        ad.categories.push('Apps & Games');
    }
    if (ad.categories.length === 0) ad.categories.push('Others');

    // 4. Pixel detection
    const hasPixel = (ad.landing_page_url || '').includes('fbp') ||
        (ad.landing_page_url || '').includes('ga') ||
        (store.tech_stack || []).some(t => t.toLowerCase().includes('pixel'));
    ad.pixel_detected = !!hasPixel;

    // 5. Media type
    ad.media_type = (ad.media.videos || []).length > 0 ? 'video' : 'image';

    // 6. Timestamps for Meilisearch filtering
    ad.last_seen_timestamp = new Date(ad.last_seen || Date.now()).getTime();
    ad.start_date_timestamp = new Date(ad.ad_start_date || Date.now()).getTime();

    return ad;
};

// Internal Security Middleware
const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Tracking Engine connected to MongoDB'))
    .catch(err => console.error('Tracking Engine MongoDB error:', err));

app.post('/ads', async (req, res) => {
    try {
        const ad = new Ads(req.body);
        await ad.save();
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/ads', async (req, res) => {
    try {
        const { user_id, status, search, country } = req.query;
        let query = { user_id };
        if (status && status !== 'all') query.status = status;
        if (country && country !== 'all') query.countries = { $in: [country] };
        if (search) {
            query.$or = [
                { product_name: new RegExp(search, 'i') },
                { advertiser_name: new RegExp(search, 'i') }
            ];
        }
        const ads = await Ads.find(query).sort({ createdAt: -1 });
        res.json({ data: ads });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/ads/:id', async (req, res) => {
    try {
        const ad = await Ads.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/ads/:id/archive', async (req, res) => {
    try {
        const ad = await Ads.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/ads/:id', async (req, res) => {
    try {
        await Ads.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/ads/:id/favorite', async (req, res) => {
    try {
        const ad = await Ads.findById(req.params.id);
        ad.is_favorite = !ad.is_favorite;
        await ad.save();
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/ads/:id/alert', async (req, res) => {
    try {
        const ad = await Ads.findById(req.params.id);
        ad.alert_enabled = !ad.alert_enabled;
        await ad.save();
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Stats helper
app.get('/internal/stats/summary', async (req, res) => {
    const { user_id } = req.query;
    try {
        const ads = await Ads.find({ user_id });
        const stats = {
            total_ads: ads.length,
            scaling: ads.filter(a => a.status === 'scaling').length,
            testing: ads.filter(a => a.status === 'testing').length,
            killed: ads.filter(a => a.status === 'killed').length,
            avg_duplicates: ads.length ? ads.reduce((acc, a) => acc + a.duplicate_count, 0) / ads.length : 0,
            total_profit: ads.reduce((acc, a) => acc + (a.estimated_profit || 0), 0),
            top_product: ads.length ? ads.sort((a, b) => b.duplicate_count - a.duplicate_count)[0] : null
        };
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/internal/stats/charts', async (req, res) => {
    const { user_id } = req.query;
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const aggregation = await Ads.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill gaps in days
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toISOString().split('T')[0]);
        }

        const formatted = labels.map(day => {
            const found = aggregation.find(a => a._id === day);
            return { _id: day.split('-').slice(1).join('/'), count: found ? found.count : 0 };
        });

        res.json({ new_ads_trend: formatted });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const { expandKeywords } = require('./services/llamaService');

// --- GLOBAL AD LIBRARY ENDPOINTS ---

// AI KEYWORD EXPANSION
app.post('/internal/keywords/expand', async (req, res) => {
    try {
        const results = {};
        for (const lang of ['en', 'ar', 'fr']) {
            results[lang] = await expandKeywords(lang);
        }
        res.json({ status: 'success', keywords: results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- RE-INDEX MAINTENANCE ---
app.post('/internal/ads/reindex', async (req, res) => {
    try {
        const ads = await LibraryAd.find({}).lean();
        console.log(`[Maintenance] Re-indexing ${ads.length} ads...`);

        const enriched = ads.map(a => enrichAd(a));

        // Update DB in batch
        const operations = enriched.map(ad => ({
            updateOne: {
                filter: { _id: ad._id },
                update: { $set: ad }
            }
        }));
        await LibraryAd.bulkWrite(operations);

        // Sync to Meili
        const meiliDocs = enriched.map(a => {
            const { _id, ...doc } = a;
            return {
                ...doc,
                id: a.platform_ad_id,
                mongodb_ref: a._id.toString(),
                last_seen_timestamp: new Date(a.last_seen || Date.now()).getTime(),
                start_date_timestamp: new Date(a.ad_start_date || Date.now()).getTime()
            };
        });

        await adIndex.addDocuments(meiliDocs);

        res.json({ status: 'success', reindexed: ads.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/library/ads/search', async (req, res) => {
    try {
        const {
            q,
            country,
            category,
            payment,
            pixel,
            platform,
            lang,
            media,
            status,
            seen_start,
            seen_end,
            start_date_range,
            sort_by = 'newest',
            page = 1,
            limit = 20
        } = req.query;

        let filter = [];

        // Simple Facets
        if (country && country !== 'all') filter.push(`countries = '${country}'`);
        if (category && category !== 'all') filter.push(`categories = '${category}'`);
        if (payment && payment !== 'all') filter.push(`payment_type = '${payment}'`);
        if (pixel && pixel !== 'all') filter.push(`pixel_detected = ${pixel === 'true'}`);
        if (platform && platform !== 'all') filter.push(`platform = '${platform}'`);
        if (lang && lang !== 'all') filter.push(`language_primary = '${lang}'`);
        if (media && media !== 'all') filter.push(`media_type = '${media}'`);
        if (status && status !== 'all') filter.push(`ad_status = '${status}'`);

        // Date Filters (Timestamps)
        if (seen_start) filter.push(`last_seen_timestamp >= ${new Date(seen_start).getTime()}`);
        if (seen_end) filter.push(`last_seen_timestamp <= ${new Date(seen_end).getTime()}`);
        if (start_date_range) {
            const [start, end] = start_date_range.split(',');
            if (start) filter.push(`start_date_timestamp >= ${new Date(start).getTime()}`);
            if (end) filter.push(`start_date_timestamp <= ${new Date(end).getTime()}`);
        }

        // Sorting
        const sortMap = {
            'newest': ['createdAt:desc'],
            'oldest': ['createdAt:asc'],
            'longest_running': ['metrics.days_running:desc'],
            'duplicated': ['metrics.duplicate_count:desc'],
            'confidence': ['metrics.confidence_score:desc'],
            'scaling': ['metrics.scaling_score:desc']
        };

        const searchResult = await adIndex.search(q || '', {
            filter: filter.join(' AND '),
            sort: sortMap[sort_by] || sortMap['newest'],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            data: searchResult.hits,
            total: searchResult.totalHits,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (e) {
        console.error(`[Search] Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

app.get('/library/ads', async (req, res) => {
    try {
        const { cursor, limit = 20, platform, status, country, media_type } = req.query;
        let query = { is_active: true }; // Default to active ads only

        // Filter Logic
        if (platform) query.platform = platform;
        if (status) query.ad_status = status;
        if (country) query.countries = { $in: [country] };
        if (media_type === 'video') query['media.videos.0'] = { $exists: true };
        if (media_type === 'image') query['media.images.0'] = { $exists: true };

        // Cursor Logic (last_seen based)
        if (cursor) {
            try {
                const [lastSeenStr, idStr] = Buffer.from(cursor, 'base64').toString('ascii').split('|');
                query.$or = [
                    { last_seen: { $lt: new Date(lastSeenStr) } },
                    {
                        last_seen: new Date(lastSeenStr),
                        _id: { $lt: idStr }
                    }
                ];
            } catch (e) {
                // Invalid cursor, ignore
            }
        }

        const ads = await LibraryAd.find(query)
            .sort({ last_seen: -1, _id: -1 })
            .limit(parseInt(limit));

        // Generate Next Cursor
        const nextCursor = ads.length === parseInt(limit)
            ? Buffer.from(`${ads[ads.length - 1].last_seen.toISOString()}|${ads[ads.length - 1]._id}`).toString('base64')
            : null;

        res.json({
            data: ads,
            next_cursor: nextCursor,
            has_more: !!nextCursor
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/library/ads/:id', async (req, res) => {
    try {
        const ad = await LibraryAd.findById(req.params.id);
        if (!ad) return res.status(404).json({ error: 'Ad not found' });
        res.json(ad);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/library/ads/:id/track', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });

        const libAd = await LibraryAd.findById(req.params.id);
        if (!libAd) return res.status(404).json({ error: 'Library ad not found' });

        // Check if already tracked
        const existing = await Ads.findOne({ user_id, ad_id: libAd.platform_ad_id });
        if (existing) return res.status(400).json({ error: 'Ad already tracked' });

        const newTrackedAd = new Ads({
            user_id,
            ad_id: libAd.platform_ad_id,
            advertiser_name: libAd.advertiser_name,
            product_name: libAd.ad_creative.headline || libAd.advertiser_name,
            ad_link: libAd.landing_page_url || `https://www.facebook.com/ads/library/?id=${libAd.platform_ad_id}`,
            website: libAd.detected_store?.domain,
            platform: libAd.platform,
            ad_text: libAd.ad_creative.primary_text,
            media_type: libAd.media.videos.length > 0 ? 'video' : 'image',
            cta: libAd.ad_creative.call_to_action,
            countries: libAd.countries,
            start_date: libAd.ad_start_date,
            landing_page: libAd.landing_page_url,
            duplicate_count: libAd.metrics.duplicate_count,
            scaling_score: libAd.metrics.scaling_score
        });

        await newTrackedAd.save();
        res.json({ status: 'success', data: newTrackedAd });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/library/ads/bulk-upsert', async (req, res) => {
    try {
        const { ads } = req.body;
        if (!Array.isArray(ads)) return res.status(400).json({ error: 'ads array required' });

        const enrichedAds = ads.map(ad => enrichAd(ad));

        const operations = enrichedAds.map(ad => ({
            updateOne: {
                filter: { platform_ad_id: ad.platform_ad_id },
                update: {
                    $set: { ...ad, last_seen: new Date(), is_active: true }
                },
                upsert: true
            }
        }));

        const dbResult = await LibraryAd.bulkWrite(operations);

        // Sync to Meilisearch (background better but for 25 ads synchronous is fine)
        // We need to fetch the full objects to ensure everything is indexed correctly
        const fullAds = await LibraryAd.find({ platform_ad_id: { $in: ads.map(a => a.platform_ad_id) } }).lean();

        // Meilisearch wants an 'id' field, but we use platform_ad_id
        const meiliDocs = fullAds.map(a => {
            const { _id, ...doc } = a;
            return {
                ...doc,
                id: a.platform_ad_id,
                mongodb_ref: a._id.toString(),
                last_seen_timestamp: new Date(a.last_seen).getTime(),
                start_date_timestamp: new Date(a.ad_start_date).getTime()
            };
        });

        await adIndex.addDocuments(meiliDocs);

        res.json({ status: 'success', processed: ads.length, dbResult });
    } catch (e) {
        console.error(`[Tracking] Bulk Upsert Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

app.listen(3005, () => console.log("Tracking Engine running on 3005"));

