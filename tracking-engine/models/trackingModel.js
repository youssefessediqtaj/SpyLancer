const mongoose = require('mongoose');

const AdsSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    ad_id: String,
    advertiser_name: String,
    product_name: String,
    ad_link: String,
    website: String,
    platform: String,
    ad_text: String,
    media_type: String,
    cta: String,
    countries: [String],
    start_date: Date,
    landing_page: String,
    status: { type: String, default: 'new' },
    duplicate_count: { type: Number, default: 1 },
    scaling_score: { type: Number, default: 0 },
    trend: { type: String, default: 'low' },
    is_favorite: { type: Boolean, default: false },
    alert_enabled: { type: Boolean, default: false },
    estimated_profit: { type: Number, default: 0 },
    tags: [String]
}, { timestamps: true });

AdsSchema.index({ user_id: 1, ad_id: 1 }, { unique: true });

module.exports = mongoose.model('Ads', AdsSchema);
