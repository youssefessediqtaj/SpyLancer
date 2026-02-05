const { chromium } = require('playwright');

async function testCrawl() {
    console.log('[Test] Starting diagnostic crawl for AE | buy');
    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    try { await page.screenshot({ path: "/tmp/final_discovery.png" }); 
        const url = 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=AE&q=buy&search_type=keyword_unordered';
        console.log(`[Test] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(10000);

        const title = await page.title();
        console.log(`[Test] Title: ${title}`);

        // Find blockers
        const blockers = await page.evaluate(() => {
            return {
                h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText),
                buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText),
                bodyPreview: document.body.innerText.substring(0, 1000).replace(/\n/g, ' ')
            };
        });

        console.log(`[Test] H1 Tags:`, blockers.h1);
        console.log(`[Test] Buttons:`, blockers.buttons.filter(b => b.length > 0));
        console.log(`[Test] Body Preview:`, blockers.bodyPreview);

        const html = await page.content();
        console.log(`[Test] HTML Length: ${html.length}`);

        // Find all possible result containers
        const containers = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('div').forEach(div => {
                if (div.innerText.includes('Library ID') && div.innerText.length < 500) {
                    results.push({
                        tag: div.tagName,
                        class: div.className,
                        text: div.innerText.substring(0, 50)
                    });
                }
            });
            return results;
        });

        console.log(`[Test] Found ${containers.length} potential ad item containers.`);
        if (containers.length > 0) {
            console.log(`[Test] Sample container:`, containers[0]);
        }

        const hasResults = await page.$('div[role="main"]');
        console.log(`[Test] Has results container: ${!!hasResults}`);

        if (hasResults) {
            const bodySnippet = (await page.innerText('body')).substring(0, 1000).replace(/\n/g, ' ');
            console.log(`[Test] Body Snippet: ${bodySnippet}`);
        } else {
            console.warn('[Test] Results container NOT found.');
        }

    } catch (e) {
        console.error(`[Test] Error: ${e.message}`);
    } finally {
        await browser.close();
    }
}

testCrawl();
