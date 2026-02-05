const axios = require('axios');
const Keyword = require('../models/keywordModel');

const OLLAMA_URL = 'http://ollama:11434/api/generate';

const PROMPTS = {
    en: "Generate 20 commercial, high-intent buying keywords for e-commerce ads in English. Focus on phrases like 'Buy Now', 'Limited Offer', 'Free Shipping'. Return ONLY a comma-separated list.",
    ar: "Generate 20 commercial buying keywords for e-commerce in Arabic. Focus on 'الدفع عند الاستلام', 'عرض خاص', 'اشتر الآن'. Return ONLY a comma-separated list.",
    fr: "Generate 20 commercial buying keywords for e-commerce in French. Focus on 'Paiement à la livraison', 'Profitez', 'Commander'. Return ONLY a comma-separated list."
};

async function expandKeywords(language = 'en') {
    console.log(`[LLaMA] Expanding keywords for language: ${language}...`);
    try {
        const response = await axios.post(OLLAMA_URL, {
            model: "llama3", // Assuming llama3 or similar is pulled
            prompt: PROMPTS[language],
            stream: false
        });

        const rawText = response.data.response;
        console.log(`[LLaMA] Raw Output: ${rawText}`);

        // Cleanup and Parse
        const keywords = rawText.split(',')
            .map(k => k.trim().replace(/['".\n]/g, ''))
            .filter(k => k.length > 2);

        let addedCount = 0;
        for (const term of keywords) {
            try {
                // Upsert to avoid duplicates
                await Keyword.updateOne(
                    { term: term.toLowerCase() },
                    {
                        $setOnInsert: {
                            language,
                            source: 'llama',
                            metadata: { generated_at: new Date() }
                        }
                    },
                    { upsert: true }
                );
                addedCount++;
            } catch (e) {
                // Ignore duplicates
            }
        }

        console.log(`[LLaMA] Added ${addedCount} new keywords for ${language}.`);
        return keywords;

    } catch (e) {
        console.error(`[LLaMA] Generation failed: ${e.message}`);
        return [];
    }
}

module.exports = { expandKeywords };
