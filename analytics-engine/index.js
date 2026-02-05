const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

app.post('/analyze', (req, res) => {
    const { duplicate_count, days_active, countries_count } = req.body;

    const R = Math.max(1, days_active || 1);
    const D = Math.max(1, duplicate_count || 1);
    const G = Math.max(1, countries_count || 1);

    // Heuristic Confidence Score Calculation
    // Using log weights to prevent single-metric dominance
    const score = (1.5 * Math.log2(R)) + (2.0 * Math.log2(D)) + (0.5 * G);
    const normalizedScore = Math.min(10, Math.max(0, score));

    const status = normalizedScore > 8 ? 'likely_winner' : (normalizedScore > 5 ? 'active' : 'testing');

    res.json({
        confidence_score: normalizedScore,
        status,
        disclaimer: "Estimated Performance — Not Real Ad Data",
        methodology: "Inferred from runtime, duplication, and geographic coverage"
    });
});

app.listen(3006, () => console.log("Analytics Engine running on 3006"));
