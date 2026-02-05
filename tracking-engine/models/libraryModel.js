const mongoose = require('mongoose');

const LibraryAdSchema = new mongoose.Schema({
    platform: { type: String, required: true, default: 'meta' },
    platform_ad_id: { type: String, required: true, unique: true },
    advertiser_name: { type: String, required: true },
    advertiser_page_id: String,
    ad_status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    ad_start_date: Date,
    ad_end_date: Date,
    countries: [String],
    languages: [String],
    ad_creative: {
        primary_text: String,
        headline: String,
        description: String,
        call_to_action: String
    },
    media: {
        images: [String],
        videos: [String],
        fingerprints: [String]
    },
    landing_page_url: String,
    detected_store: {
        domain: String,
        ecommerce_platform: String,
        tech_stack: [String],
        currency: String,
        language: String
    },
    metrics: {
        days_running: { type: Number, default: 0 },
        duplicate_count: { type: Number, default: 0 },
        scaling_score: { type: Number, default: 0 },
        confidence_score: { type: Number, default: 0 }
    },
    is_active: { type: Boolean, default: true },
    first_seen: { type: Date, default: Date.now, immutable: true }, // Created once, never changes
    last_seen: { type: Date, default: Date.now },
    discovery_keyword: String,

    // Advanced Filter Fields
    categories: [String], // E-Commerce, COD, Affiliate, etc.
    payment_type: { type: String, enum: ['COD', 'Online', 'Unknown'], default: 'Unknown' },
    pixel_detected: { type: Boolean, default: false },
    language_primary: String, // en, ar, fr
    media_type: { type: String, enum: ['image', 'video', 'all'] }
}, { timestamps: true });

// Primary Index
LibraryAdSchema.index({ platform_ad_id: 1 }, { unique: true });

// Text Search
LibraryAdSchema.index({ advertiser_name: 'text', 'ad_creative.primary_text': 'text' });

// Retention & Cleanup Indexes
LibraryAdSchema.index({ first_seen: 1 }); // For deleting old ads (> 2 years)
LibraryAdSchema.index({ last_seen: 1, is_active: 1 }); // For marking inactive (> 7 days)

module.exports = mongoose.model('LibraryAd', LibraryAdSchema);
