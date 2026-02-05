const cheerio = require('cheerio');

function extractProduct(html, platform) {
    const $ = cheerio.load(html);
    let name = $('meta[property="og:title"]').attr('content') || $('title').text();
    let price = parseFloat($('meta[property="product:price:amount"]').attr('content')) || 0;
    let currency = $('meta[property="product:price:currency"]').attr('content') || 'USD';
    let images = [$('meta[property="og:image"]').attr('content')].filter(Boolean);

    return { name, price, currency, images, variants: [], description: '', reviews_count: null, shipping: null, platform, confidence: 0.9 };
}

module.exports = { extractProduct };
