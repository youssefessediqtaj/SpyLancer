function detectStore(html) {
    const signals = {
        Shopify: html.includes('cdn.shopify.com') || html.includes('shopify-checkout'),
        Woo: html.includes('wp-content') || html.includes('woocommerce'),
        YouCan: html.includes('youcan.shop') || html.includes('youcan-shop'),
        Prestashop: html.includes('prestashop') || html.includes('presta'),
    };

    let platform = 'Custom';
    let confidence = 0.5;
    let tech_stack = [];

    if (signals.Shopify) {
        platform = 'Shopify';
        confidence = 0.98;
        tech_stack.push('Shopify Core', 'Liquid');
    } else if (signals.Woo) {
        platform = 'WooCommerce';
        confidence = 0.95;
        tech_stack.push('WordPress', 'WooCommerce');
    } else if (signals.YouCan) {
        platform = 'YouCan';
        confidence = 0.92;
        tech_stack.push('YouCan Platform');
    }

    // Heuristics for metadata (real extraction should use cheerio)
    const currency = html.match(/currency\":\s*\"([A-Z]{3})\"/i)?.[1] ||
        html.match(/currencyCode\":\s*\"([A-Z]{3})\"/i)?.[1] || 'USD';

    const language = html.match(/language\":\s*\"([a-z]{2})\"/i)?.[1] || 'en';

    return {
        platform,
        confidence,
        tech_stack,
        currency,
        language
    };
}

module.exports = { detectStore };
