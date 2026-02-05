const { chromium } = require('playwright');

async function fetchHTML(url) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await page.content();
    await browser.close();
    return html;
}

/**
 * Crawls Meta Ads Library for a keyword and country
 * Compliance: ONLY uses public URL and public data.
 */
async function crawlAds({ query, country = 'ALL', adType = 'all', activeStatus = 'active' }) {
    const baseUrl = 'https://www.facebook.com/ads/library/';
    const searchUrl = `${baseUrl}?active_status=${activeStatus}&ad_type=${adType}&country=${country}&q=${encodeURIComponent(query)}&search_type=keyword_unordered`;

    console.log(`[Crawler] Navigating to: ${searchUrl}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 45000 });

        // Wait for results to load
        await page.waitForSelector('div[role="main"]', { timeout: 15000 });

        // Scroll down to load more (simulated discovery)
        for (let i = 0; i < 3; i++) {
            await page.mouse.wheel(0, 1000);
            await page.waitForTimeout(1000);
        }

        const html = await page.content();
        await browser.close();
        return html;
    } catch (e) {
        console.error(`[Crawler] Error during crawl: ${e.message}`);
        await browser.close();
        throw e;
    }
}

module.exports = { fetchHTML, crawlAds };
