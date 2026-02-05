"use client";

import React, { useEffect, useState } from "react";

import axios from "@/lib/axios";
import {
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    ChevronDown,
    Star
} from "lucide-react";

interface Ad {
    _id: string;
    ad_link: string;
    advertiser_name: string;
    website: string;
    launch_date: string;
    country: string;
    duplicate_count: number;
    status: string;
    product_name: string;
    notes?: string;
    estimated_profit?: number;
    scaling_score?: number;
    trend?: string;
    is_favorite?: boolean;
}

export default function AnalysisPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [countryFilter, setCountryFilter] = useState("all");

    const [editingAd, setEditingAd] = useState<Ad | null>(null);

    useEffect(() => {
        fetchAds();
    }, [statusFilter, countryFilter]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (countryFilter !== "all") params.append("country", countryFilter);
            if (search) params.append("search", search);

            const res = await axios.get(`/ads?${params.toString()}`);
            setAds(res.data.data);
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAd = async (id: string) => {
        if (!confirm("Are you sure you want to delete this tracked ad?")) return;
        try {
            await axios.delete(`/ads/${id}`);
            setAds(ads.filter(ad => ad._id !== id));
        } catch (error) {
            alert("Failed to delete ad");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAd) return;
        try {
            const res = await axios.put(`/ads/${editingAd._id}`, editingAd);
            setAds(ads.map(ad => ad._id === editingAd._id ? res.data : ad));
            setEditingAd(null);
        } catch (error) {
            alert("Failed to update ad");
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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
            testing: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
            scaling: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
            killed: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
            potential_winner: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
            archived: "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${styles[status] || styles.new}`}>
                {status.replace("_", " ")}
            </span>
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Center</h1>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search ads..."
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAds()}
                            />
                        </div>

                        <select
                            className="px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Status: All</option>
                            <option value="new">New</option>
                            <option value="testing">Testing</option>
                            <option value="scaling">Scaling</option>
                            <option value="killed">Killed</option>
                        </select>

                        <select
                            className="px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm hidden md:block"
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                        >
                            <option value="all">Region: Global</option>
                            <option value="US">USA</option>
                            <option value="UK">UK</option>
                            <option value="FR">France</option>
                        </select>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Duplicates</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Scaling</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Profit</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Launch Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6 border-b"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : ads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle size={48} className="text-gray-200 dark:text-gray-700" />
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No ads found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ads.map((ad) => (
                                        <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleFavorite(ad)}
                                                        className={`transition-colors ${ad.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                                    >
                                                        <Star size={18} />
                                                    </button>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white mb-0.5">{ad.product_name || "Unnamed Product"}</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{ad.advertiser_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(ad.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white">{ad.duplicate_count}</span>
                                                    {ad.duplicate_count > 5 && <TrendingUp size={14} className="text-orange-500" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${ad.scaling_score && ad.scaling_score > 7 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${(ad.scaling_score || 0) * 10}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{(ad.scaling_score || 0).toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className={`font-mono font-bold ${typeof ad.estimated_profit === 'number' && ad.estimated_profit > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    {typeof ad.estimated_profit === 'number' ? `$${ad.estimated_profit.toFixed(2)}` : "—"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(ad.launch_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingAd(ad)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium flex items-center gap-1"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <a
                                                        href={ad.ad_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                        title="View on Meta Ads Library"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                    <button
                                                        onClick={() => deleteAd(ad._id)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await axios.patch(`/ads/${ad._id}/archive`);
                                                                setAds(ads.filter(a => a._id !== ad._id)); // Hide from active list
                                                            } catch (e) {
                                                                alert("Failed to archive ad");
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                                                        title="Archive"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
