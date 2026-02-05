const { chromium } = require('playwright');

const MENA_COUNTRIES = ['AE', 'SA', 'EG', 'MA', 'DZ', 'TN', 'QA', 'KW', 'OM', 'BH', 'JO', 'LB'];

const KEYWORDS = {
    en: ['buy', 'buy now', 'purchase', 'order now', 'shop now', 'limited offer', 'discount', 'sale'],
    ar: ['اشتري', 'اشتر الآن', 'اطلب الآن', 'عرض', 'تخفيض'],
    fr: ['acheter', 'commande', 'promotion', 'offre']
};

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

/**
 * PRODUCTION-GRADE MENA CRAWLER
 * Compliance: ONLY public Meta Ads Library data.
 */
async function startMenaCrawl(options = {}) {
    console.log('[MENA-Crawler] Starting discovery cycle...');
    const results = [];
    const onSnapshot = options.onSnapshot || (() => { });

    // Launch ONE browser for the whole cycle to avoid overhead, but fresh contexts
    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const targetCountries = options.countries || MENA_COUNTRIES;
    const targetKeywords = options.keywords || KEYWORDS;

    try {
        for (const country of targetCountries) {
            // Support both array of keywords (if simple list provided) or object (lang mapped)
            // If options.keywords is a flat array, wrap it like { 'debug': [...] }
            let langMap = targetKeywords;
            if (Array.isArray(targetKeywords)) {
                langMap = { 'debug': targetKeywords };
            }

            for (const lang of Object.keys(langMap)) {
                for (const keyword of langMap[lang]) {
                    console.log(`[MENA-Crawler] ${country} | ${keyword}`);

                    const context = await browser.newContext({
                        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
                    });
                    const page = await context.newPage();

                    try {
                        const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;

                        await page.goto(searchUrl, { timeout: 60000 });

                        // Wait for initial load
                        try {
                            await page.waitForLoadState('domcontentloaded');
                            await page.waitForTimeout(5000); // Give React time to hydrate
                        } catch (e) {
                            const title = await page.title();
                            const bodySnippet = await page.innerText('body');
                            console.warn(`[MENA-Crawler] FAILURE: Main content not found for ${keyword}. Title: "${title}"`);
                            console.warn(`[MENA-Crawler] Body Snippet: ${bodySnippet.substring(0, 300).replace(/\n/g, ' ')}`);
                        }

                        let previousHeight = 0;
                        let scrollCount = 0;
                        const MAX_SCROLLS = options.maxScrolls || 30; // Deep crawl limit per keyword

                        while (scrollCount < MAX_SCROLLS) {
                            scrollCount++;
                            previousHeight = await page.evaluate('document.body.scrollHeight');

                            // Scroll to bottom
                            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                            await page.waitForTimeout(3000); // Wait for lazy load

                            const currentHeight = await page.evaluate('document.body.scrollHeight');
                            const bodyText = await page.innerText('body');

                            // Check for "End of results"
                            if (bodyText.includes('No ads match your search') ||
                                bodyText.includes('End of results') ||
                                previousHeight === currentHeight) {
                                console.log(`[MENA-Crawler] Reached end of results or stopped scrolling.`);
                                break;
                            }

                            // Every 5 scrolls, take a snapshot to avoid massive memory usage at once
                            // or to save partial progress
                            if (scrollCount % 5 === 0) {
                                console.log(`[MENA-Crawler] DEBUG: Scroll ${scrollCount}/${MAX_SCROLLS} - Height: ${currentHeight}`);
                                const html = await page.content();
                                const adCountRegex = /<div[^>]*role="article"[^>]*>/g;
                                const adCount = (html.match(adCountRegex) || []).length;
                                console.log(`[MENA-Crawler] DEBUG: Snapshot captured. Est. Ads in DOM: ${adCount}`);

                                await onSnapshot({ country, keyword, html });
                            }
                        }

                        console.log(`[MENA-Crawler] DEBUG: Finished scrolling loop for ${keyword}`);

                        // Final Capture
                        const finalHtml = await page.content();
                        const finalBody = await page.innerText('body');

                        const finalAdCountRegex = /<div[^>]*role="article"[^>]*>/g;
                        const finalAdCount = (finalHtml.match(finalAdCountRegex) || []).length;
                        console.log(`[MENA-Crawler] DEBUG: Final Check - Est. Ads found: ${finalAdCount}`);

                        // DUMP HTML FOR DEBUGGING
                        const fs = require('fs');
                        fs.writeFileSync('/app/debug.html', finalHtml);
                        console.log('[MENA-Crawler] DEBUG: Dumped HTML to /app/debug.html');

                        if (finalBody.includes('ID') || finalBody.includes('الرقم') || finalBody.includes('Pab')) {
                            const snap = { country, keyword, html: finalHtml };
                            results.push(snap);
                            console.log(`[MENA-Crawler] Final snapshot captured for ${keyword}. Count: ${finalAdCount}`);
                            await onSnapshot(snap);
                        } else {
                            console.log(`[MENA-Crawler] No ads found for ${keyword}.`);
                        }
                    } catch (err) {
                        console.error(`[MENA-Crawler] Search Error: ${err.message}`);
                    } finally {
                        await context.close();
                    }
                    await new Promise(r => setTimeout(r, 4000));
                }
            }
        }
    } catch (globalErr) {
        console.error(`[MENA-Crawler] Fatal: ${globalErr.message}`);
    } finally {
        await browser.close();
    }

    console.log(`[MENA-Crawler] Finished. Total snapshots: ${results.length}`);
    return results;
}

module.exports = { startMenaCrawl };
