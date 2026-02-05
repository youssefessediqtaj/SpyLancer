"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
    Search,
    TrendingUp,
    ExternalLink,
    Trash2,
    Edit3,
    CheckCircle2,
    Star,
    Bell,
    AlertCircle
} from "lucide-react";

interface Ad {
    _id: string;
    ad_link: string;
    advertiser_name: string;
    website: string;
    start_date: string;
    countries: string[];
    duplicate_count: number;
    status: string;
    product_name: string;
    notes?: string;
    estimated_profit?: number;
    scaling_score?: number;
    trend?: string;
    is_favorite?: boolean;
    alert_enabled?: boolean;
}

export default function TrackedAdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/ads");
            setAds(res.data.data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (ad: Ad) => {
        try {
            const res = await axios.patch(`/ads/${ad._id}/favorite`);
            setAds(ads.map(a => a._id === ad._id ? res.data : a));
        } catch (error) {
            console.error("Failed to toggle favorite", error);
        }
    };

    const toggleAlert = async (ad: Ad) => {
        try {
            const res = await axios.patch(`/ads/${ad._id}/alert`);
            setAds(ads.map(a => a._id === ad._id ? res.data : a));
        } catch (error) {
            console.error("Failed to toggle alert", error);
        }
    };

    const deleteAd = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`/ads/${id}`);
            setAds(ads.filter(ad => ad._id !== id));
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tracked Ads</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your ads..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
                    ))
                ) : ads.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">No ads tracked yet. Start by adding one!</p>
                    </div>
                ) : (
                    ads.filter(ad =>
                        ad.product_name.toLowerCase().includes(search.toLowerCase()) ||
                        ad.advertiser_name.toLowerCase().includes(search.toLowerCase())
                    ).map((ad) => (
                        <div key={ad._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{ad.product_name}</h3>
                                        <p className="text-sm text-gray-500">{ad.advertiser_name}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => toggleFavorite(ad)}
                                            className={`p-2 rounded-lg transition-colors ${ad.is_favorite ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        >
                                            <Star size={18} fill={ad.is_favorite ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => toggleAlert(ad)}
                                            className={`p-2 rounded-lg transition-colors ${ad.alert_enabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        >
                                            <Bell size={18} fill={ad.alert_enabled ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 dark:border-gray-800">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Duplicates</p>
                                        <p className="font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                                            {ad.duplicate_count}
                                            {ad.duplicate_count > 5 && <TrendingUp size={12} className="text-emerald-500" />}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Profit</p>
                                        <p className="font-bold text-emerald-500">${(ad.estimated_profit || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-gray-400">Created {new Date(ad.start_date || Date.now()).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        <a href={ad.ad_link} target="_blank" className="p-2 text-gray-400 hover:text-blue-500"><ExternalLink size={16} /></a>
                                        <button onClick={() => deleteAd(ad._id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
