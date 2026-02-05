"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
    Star,
    ExternalLink,
    TrendingUp,
    AlertCircle
} from "lucide-react";

interface Ad {
    _id: string;
    product_name: string;
    advertiser_name: string;
    duplicate_count: number;
    estimated_profit: number;
    is_favorite: boolean;
    ad_link: string;
}

export default function FavoritesPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/ads");
            setAds(res.data.data.filter((ad: Ad) => ad.is_favorite));
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" size={28} />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
                    ))
                ) : ads.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <Star className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No favorites yet. Mark some ads as favorites to see them here!</p>
                    </div>
                ) : (
                    ads.map((ad) => (
                        <div key={ad._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{ad.product_name}</h3>
                                    <p className="text-sm text-gray-500">{ad.advertiser_name}</p>
                                </div>
                                <Star className="text-yellow-400 fill-yellow-400" size={18} />
                            </div>

                            <div className="flex items-center justify-between mb-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span className="font-bold">{ad.duplicate_count} Scales</span>
                                </div>
                                <span className="text-emerald-500 font-bold">${(ad.estimated_profit || 0).toFixed(2)}</span>
                            </div>

                            <a
                                href={ad.ad_link}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
                            >
                                <ExternalLink size={14} />
                                View on Meta Library
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
