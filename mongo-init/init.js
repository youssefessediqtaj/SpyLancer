db = db.getSiblingDB('spylancer');

db.createCollection('ads');
db.ads.createIndex({ user_id: 1, ad_id: 1 }, { unique: true });
db.ads.createIndex({ user_id: 1, status: 1 });
db.ads.createIndex({ product_name: "text", advertiser_name: "text" });

db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

db.createCollection('extractioncaches');
db.extractioncaches.createIndex({ url_hash: 1 }, { unique: true });
db.extractioncaches.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days

console.log("MongoDB initialized for SpyLancer");
