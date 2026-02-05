"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import {
    TrendingUp,
    Target,
    Skull,
    DollarSign,
    Users,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface Stats {
    total_ads: number;
    scaling: number;
    testing: number;
    killed: number;
    avg_duplicates: number;
    total_profit: number;
    top_product: {
        name: string;
        duplicates: number;
    } | null;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [summaryRes, chartsRes] = await Promise.all([
                    axios.get("/stats/summary"),
                    axios.get("/stats/charts")
                ]);
                setStats(summaryRes.data);
                setChartData(chartsRes.data.new_ads_trend || []);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { name: "Total Tracked", value: stats?.total_ads ?? 0, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Scaling", value: stats?.scaling ?? 0, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
        { name: "Killed", value: stats?.killed ?? 0, icon: Skull, color: "text-red-500", bg: "bg-red-50" },
        { name: "Est. Profit", value: `$${(stats?.total_profit || 0).toFixed(2)}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    ];

    return (
        <>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
                        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your Meta ads tracking today.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full font-medium border border-blue-100 dark:border-blue-800">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        Live Updates Synchronized
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse" />
                        ))
                    ) : (
                        statCards.map((card) => (
                            <div key={card.name} className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${card.bg} dark:bg-opacity-10 ${card.color}`}>
                                        <card.icon size={22} />
                                    </div>
                                    <ArrowUpRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value ?? 0}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ads Tracking Growth</h2>
                            <p className="text-sm text-gray-500">Number of new ads added per day over the last week.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Top Product / Sidebar Info */}
                    <div className="space-y-8">
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Scaling Signal</h2>
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                                    <div className="h-8 bg-gray-100 rounded w-full animate-pulse" />
                                </div>
                            ) : stats?.top_product ? (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Most Duplicated Product</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{stats.top_product.name}</p>
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg w-fit">
                                        🔥 {stats.top_product.duplicates} Active Duplicates
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 italic">No scaling signals detected yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                            <h2 className="text-lg font-bold mb-2">SpyLancer Pro</h2>
                            <p className="text-sm text-blue-100 mb-4 opacity-90">Unlock advanced AI analysis and unlimited ad tracking seats.</p>
                            <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
