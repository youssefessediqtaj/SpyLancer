const { startMenaCrawl } = require('./services/menaCrawlerService');

// Mock snapshot callback
const onSnapshot = async (snap) => {
    console.log(`[Verify] Snapshot received: ${snap.country} - ${snap.keyword} (${snap.html.length} chars)`);
};

(async () => {
    console.log('[Verify] Starting Single Keyword Deep Crawl Test...');
    // Override internal lists to just do 1 loop
    // But startMenaCrawl iterates internal lists.
    // I should modify startMenaCrawl to accept override? 
    // It accepts 'options' but doesn't implement overrides in the implementation I wrote.
    // I'll just rely on the logging since startMenaCrawl logs "AE | buy".
    // I'll wait for a few logs content then exit process.

    // Actually, I can't easily override without code change.
    // I'll just run it and kill it after 1 min.

    await startMenaCrawl({ onSnapshot });
})();
