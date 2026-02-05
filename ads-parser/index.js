const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const crypto = require('crypto');

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

// Simple MD5 hashing for media fingerprinting
function generateFingerprint(url) {
    if (!url) return null;
    return crypto.createHash('md5').update(url).digest('hex');
}

app.post('/parse', (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "html required" });

    const $ = cheerio.load(html);
    const ad_text = $('meta[property="og:description"]').attr('content') || '';
    const cta = $('button:contains("Shop Now")').text() || '';
    const landing_page = $('meta[property="og:url"]').attr('content') || '';

    res.json({ ad_text, cta, landing_page, media_type: 'video', countries: [] });
});

/**
 * Parses search results from Meta Ads Library
 */
app.post('/parse-library', (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "html required" });

    const $ = cheerio.load(html);
    const ads = [];
    const ALLOWED_CTAS = ['SHOP NOW', 'BUY NOW', 'PURCHASE', 'ORDER NOW', 'ORDER', 'SHOP', 'BUY', 'ACHETER', 'COMMANDER', 'اشتري', 'اطلب'];

    // STRATEGY 1: JSON/Script-based Extraction (Most Robust)
    // Matches "ad_archive_id":"123456789"
    const jsonIds = new Set();
    const jsonRegex = /"ad_archive_id":"(\d{10,16})"/g;
    let match;
    while ((match = jsonRegex.exec(html)) !== null) {
        jsonIds.add(match[1]);
    }
    console.log(`[Parser] Found ${jsonIds.size} IDs via JSON scan.`);

    // STRATEGY 2: DOM-based Extraction (Fallback & Context)
    $('div').each((i, el) => {
        const text = $(el).text();

        // Supports: "ID: 123", "Bibliothèque : 123", "الرقم: 123"
        // \s matches whitespace including non-breaking space if normalized, 
        // but explicit checking of prefix variations is safer.
        const idMatch = text.match(/(?:ID|Bibliothèque|الرقم|Pab).*?[:\s]\s*(\d{10,16})/i);

        let ad_id = null;
        if (idMatch) {
            ad_id = idMatch[1];
        } else if (jsonIds.size > 0) {
            // Checks if this div text contains one of the JSON IDs
            // This associates the correct DOM element with the ID found in JSON
            for (const jId of jsonIds) {
                if (text.includes(jId)) {
                    ad_id = jId;
                    break;
                }
            }
        }

        if (ad_id && text.length < 2000) { // Increased limit slightly

            // Check if we already processed this ID in this batch
            if (ads.some(a => a.platform_ad_id === ad_id)) return;

            const cardHtml = $(el).html();
            const upperCard = cardHtml.toUpperCase();

            // Detect CTA (Optional - for metadata only)
            let detectedCta = null;
            for (const cta of ALLOWED_CTAS) {
                if (upperCard.includes(cta)) {
                    detectedCta = cta.replace(' ', '_');
                    break;
                }
            }

            // NOTE: Removed strict CTA requirement to index all ads, not just buying-intent
            // The CTA is still extracted as metadata for filtering later

            const advertiser_name = $(el).find('span').first().text().trim() || "Unknown Advertiser";

            // Media extraction
            const images = [];
            const videos = [];
            $(el).find('img, video').each((_, m) => {
                const src = $(m).attr('src');
                if (src && !src.includes('data:image')) {
                    if (m.name === 'img') images.push(src);
                    if (m.name === 'video') videos.push(src);
                }
            });

            const landing_page_url = $(el).find('a[href*="l.facebook.com"]').first().attr('href') || '';

            ads.push({
                platform_ad_id: ad_id,
                advertiser_name,
                ad_creative: {
                    headline: text.substring(0, 100).split('\n')[0], // Extract first line as headline approximation
                    primary_text: text.substring(0, 1000).trim(),
                    call_to_action: detectedCta
                },
                media: {
                    images,
                    videos,
                    fingerprints: images.concat(videos).map(generateFingerprint)
                },
                landing_page_url,
                is_active: true
            });
        }
    });

    res.json({ ads, count: ads.length });
    console.log(`[Parser] Extracted ${ads.length} purchase-intent ads (Merged Strategy).`);
});

app.listen(3002, () => console.log("Ads Parser running on 3002"));
