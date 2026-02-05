"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
    Bell,
    ExternalLink,
    AlertCircle,
    Info
} from "lucide-react";

interface Ad {
    _id: string;
    product_name: string;
    advertiser_name: string;
    alert_enabled: boolean;
    ad_link: string;
    status: string;
}

export default function AlertsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/ads");
            setAds(res.data.data.filter((ad: Ad) => ad.alert_enabled));
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Bell className="text-blue-500 fill-blue-500/10" size={28} />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Alerts</h1>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
                <Info className="text-blue-500 mt-0.5 shrink-0" size={20} />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    You will receive notifications on your dashboard when these ads show major increases in duplicate count or scaling speed.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
                    ))
                ) : ads.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                        <Bell className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No alerts active. Enable alerts on tracked ads to get notified!</p>
                    </div>
                ) : (
                    ads.map((ad) => (
                        <div key={ad._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded-bl-lg">Active Alert</span>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{ad.product_name}</h3>
                                <p className="text-xs text-gray-500">{ad.advertiser_name}</p>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 capitalize">{ad.status}</span>
                            </div>

                            <a
                                href={ad.ad_link}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
                            >
                                <ExternalLink size={14} />
                                View Tracker
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
