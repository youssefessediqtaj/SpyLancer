const { startMenaCrawl } = require('./services/menaCrawlerService');

(async () => {
    console.log('[Debug] Testing Multi-Keyword Loop...');
    // Test 2 countries, 1 keyword each, verifying loop transition.
    const options = {
        countries: ['AE', 'SA'],
        keywords: ['buy'], // Will be wrapped as { debug: ['buy'] } by my logic
        maxScrolls: 2
    };

    // Mock onSnapshot to just log
    options.onSnapshot = async (snap) => {
        console.log(`[Debug-Snapshot] Country: ${snap.country}, Keyword: ${snap.keyword}, Size: ${snap.html.length}`);
    };

    // Note: I can't easily override MAX_SCROLLS in the function without editing it again or passing it.
    // The current code has const MAX_SCROLLS = 30; inside the function.
    // Ideally I should have made it an option.
    // But for now, I'll just let it run for a bit and then kill it, or trust it works if I see it switch country.
    // 30 scrolls * 2 countries might take too long (minutes).
    // I should edit the service to accept maxScrolls option too.

    await startMenaCrawl(options);
})();
