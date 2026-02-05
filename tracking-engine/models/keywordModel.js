const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
    term: { type: String, required: true, unique: true, index: true },
    language: { type: String, enum: ['en', 'ar', 'fr'], required: true },
    category: { type: String, default: 'general' }, // e.g., 'clothing', 'electronics'
    source: { type: String, enum: ['seed', 'llama', 'manual'], default: 'seed' },
    is_active: { type: Boolean, default: true },
    last_used: { type: Date, default: null },
    efficiency_score: { type: Number, default: 0 }, // Future: Success rate of finding ads

    // Metadata from LLaMA
    metadata: {
        relevance_score: Number,
        generated_at: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Keyword', KeywordSchema);
