const mongoose = require('mongoose');
const LibraryAd = require('./tracking-engine/models/libraryModel');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/spylancer';

const mockAds = [
    {
        platform: "meta",
        platform_ad_id: "293847501",
        advertiser_name: "GlowSkin™ Official",
        advertiser_page_id: "pages/glowskin",
        ad_status: "active",
        ad_start_date: new Date("2024-11-15"),
        countries: ["USA", "Canada"],
        languages: ["English"],
        ad_creative: {
            primary_text: "Get the glow you deserve. 50% OFF today only! ✨",
            headline: "Portable Facial Steamer",
            description: "Deep cleansing for your skin at home.",
            call_to_action: "Shop Now"
        },
        media: {
            images: ["https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400"],
            videos: [],
            fingerprints: ["5e9b7a1f2c3d4e5f6a7b8c9d0e1f2a3b"]
        },
        landing_page_url: "https://glowskin-portable.com",
        detected_store: {
            domain: "glowskin-portable.com",
            ecommerce_platform: "Shopify",
            tech_stack: ["Shopify Core", "Liquid"],
            currency: "USD",
            language: "en"
        },
        metrics: {
            days_running: 45,
            duplicate_count: 12,
            scaling_score: 8.5,
            confidence_score: 0.88
        }
    },
    {
        platform: "meta",
        platform_ad_id: "882736451",
        advertiser_name: "CleanHome Solutions",
        advertiser_page_id: "pages/cleanhome",
        ad_status: "active",
        ad_start_date: new Date("2024-12-01"),
        countries: ["UK", "Germany"],
        languages: ["English", "German"],
        ad_creative: {
            primary_text: "Cleaning has never been this easy. Perfect for pet hair! 🐕",
            headline: "Handheld Vacuum Pro",
            description: "Powerful suction, lightweight design.",
            call_to_action: "Apply Now"
        },
        media: {
            images: [],
            videos: ["https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZzE4eXN6bzRycTJ6ZTN6YmN6bzRycTJ6ZTN6YmN6bzRycTJ6ZTMmbXA9Z2lmX2lkJmN0PWc/3o7TKVUn7iM8FMEU24/giphy.mp4"],
            fingerprints: ["1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p"]
        },
        landing_page_url: "https://cleanhomepro.co.uk",
        detected_store: {
            domain: "cleanhomepro.co.uk",
            ecommerce_platform: "WooCommerce",
            tech_stack: ["WordPress", "WooCommerce"],
            currency: "GBP",
            language: "en"
        },
        metrics: {
            days_running: 28,
            duplicate_count: 5,
            scaling_score: 6.2,
            confidence_score: 0.65
        }
    },
    {
        platform: "meta",
        platform_ad_id: "112233445",
        advertiser_name: "FitElite Apparel",
        advertiser_page_id: "pages/fitelite",
        ad_status: "active",
        ad_start_date: new Date("2024-10-20"),
        countries: ["Global"],
        languages: ["English"],
        ad_creative: {
            primary_text: "Comfort meets performance. New collection out now! 🔥",
            headline: "Pro-Stretch Leggings",
            description: "Squat-proof workout gear for athletes.",
            call_to_action: "Shop Now"
        },
        media: {
            images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=400"],
            videos: [],
            fingerprints: ["f1e2d3c4b5a6978879a0b1c2d3e4f5g6"]
        },
        landing_page_url: "https://fit-elite-store.com",
        detected_store: {
            domain: "fit-elite-store.com",
            ecommerce_platform: "Shopify",
            tech_stack: ["Shopify Core", "Liquid"],
            currency: "USD",
            language: "en"
        },
        metrics: {
            days_running: 60,
            duplicate_count: 25,
            scaling_score: 9.8,
            confidence_score: 0.95
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB for seeding...");

        await LibraryAd.deleteMany({});
        console.log("Cleared existing library ads.");

        await LibraryAd.insertMany(mockAds);
        console.log(`Successfully seeded ${mockAds.length} library ads!`);

        process.exit(0);
    } catch (e) {
        console.error("Seeding failed:", e);
        process.exit(1);
    }
}

seed();
