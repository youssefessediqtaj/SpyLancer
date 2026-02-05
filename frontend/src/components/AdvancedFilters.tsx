"use client";

import React, { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Search,
    Filter,
    Calendar,
    Globe,
    Zap,
    CheckCircle2,
    CreditCard,
    Languages,
    ArrowUpDown,
    Image as ImageIcon,
    Video
} from "lucide-react";

interface FiltersProps {
    onFilterChange: (filters: any) => void;
    onReset: () => void;
    loading?: boolean;
}

export const MENA_COUNTRIES = [
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "EG", name: "Egypt" },
    { code: "MA", name: "Morocco" },
    { code: "DZ", name: "Algeria" },
    { code: "TN", name: "Tunisia" },
    { code: "QA", name: "Qatar" },
    { code: "KW", name: "Kuwait" },
    { code: "OM", name: "Oman" },
    { code: "BH", name: "Bahrain" },
    { code: "JO", name: "Jordan" },
    { code: "LB", name: "Lebanon" },
];

export const CATEGORIES = [
    "E-Commerce",
    "Cash on Delivery (COD)",
    "Brands",
    "Affiliate / CPA",
    "Apps & Games",
    "Others"
];

export const LANGUAGES = [
    { code: "ar", name: "Arabic" },
    { code: "fr", name: "French" },
    { code: "en", name: "English" },
    { code: "mixed", name: "Mixed" }
];

export default function AdvancedFilters({ onFilterChange, onReset, loading }: FiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        q: "",
        country: "all",
        category: "all",
        payment: "all",
        pixel: "all",
        platform: "all",
        lang: "all",
        media: "all",
        status: "active",
        sort_by: "newest",
        seen_start: "",
        seen_end: "",
    });

    const handleChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            q: "",
            country: "all",
            category: "all",
            payment: "all",
            pixel: "all",
            platform: "all",
            lang: "all",
            media: "all",
            status: "active",
            sort_by: "newest",
            seen_start: "",
            seen_end: "",
        };
        setFilters(defaultFilters);
        onReset();
    };

    return (
        <div className="w-full space-y-4">
            {/* Search & Main Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by keywords, advertiser or domain (e.g. 'perfume', 'store.com')..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-medium text-sm transition-all"
                        value={filters.q}
                        onChange={(e) => handleChange("q", e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${isExpanded
                                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800"
                                : "bg-white border-gray-100 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
                            }`}
                    >
                        <Filter size={16} />
                        {isExpanded ? "Hide Filters" : "Show Advanced Filters"}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <button
                        onClick={resetFilters}
                        className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-red-500 rounded-2xl transition-all hover:bg-red-50 dark:hover:bg-red-900/10"
                        title="Reset All"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Advanced Filter Panel */}
            {isExpanded && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">

                        {/* Market & Category */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} className="text-blue-500" /> MENA Country
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.country}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                >
                                    <option value="all">All MENA</option>
                                    {MENA_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-emerald-500" /> Ad Category
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.category}
                                    onChange={(e) => handleChange("category", e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Tech & Payment */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={12} className="text-yellow-500" /> Tracking Pixel
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.pixel}
                                    onChange={(e) => handleChange("pixel", e.target.value)}
                                >
                                    <option value="all">Any Status</option>
                                    <option value="true">Estimated Detected</option>
                                    <option value="false">None Detected</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} className="text-indigo-500" /> Payment Methods
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.payment}
                                    onChange={(e) => handleChange("payment", e.target.value)}
                                >
                                    <option value="all">Any Payment</option>
                                    <option value="COD">Cash on Delivery (COD)</option>
                                    <option value="Online">Online Payments</option>
                                </select>
                            </div>
                        </div>

                        {/* Content & Language */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Languages size={12} className="text-pink-500" /> Main Language
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.lang}
                                    onChange={(e) => handleChange("lang", e.target.value)}
                                >
                                    <option value="all">Any Language</option>
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 text-blue-400">
                                    Ad Status
                                </label>
                                <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
                                    <button
                                        onClick={() => handleChange('status', 'active')}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filters.status === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-400'}`}
                                    >Active</button>
                                    <button
                                        onClick={() => handleChange('status', 'inactive')}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filters.status === 'inactive' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-400'}`}
                                    >Inactive</button>
                                    <button
                                        onClick={() => handleChange('status', 'all')}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filters.status === 'all' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-400'}`}
                                    >All</button>
                                </div>
                            </div>
                        </div>

                        {/* Media & Sort */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ArrowUpDown size={12} className="text-purple-500" /> Order By
                                </label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.sort_by}
                                    onChange={(e) => handleChange("sort_by", e.target.value)}
                                >
                                    <option value="newest">Newest Ads</option>
                                    <option value="oldest">Oldest Ads</option>
                                    <option value="longest_running">Longest Running</option>
                                    <option value="duplicated">Most Duplicated</option>
                                    <option value="confidence">Highest Confidence</option>
                                    <option value="scaling">Efficiency Score</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Media Type
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleChange('media', 'all')}
                                        className={`px-3 py-2 rounded-xl border flex-1 text-[10px] font-black uppercase transition-all ${filters.media === 'all' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                    >All</button>
                                    <button
                                        onClick={() => handleChange('media', 'image')}
                                        className={`px-3 py-2 rounded-xl border flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all ${filters.media === 'image' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                    ><ImageIcon size={12} /> Img</button>
                                    <button
                                        onClick={() => handleChange('media', 'video')}
                                        className={`px-3 py-2 rounded-xl border flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase transition-all ${filters.media === 'video' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                    ><Video size={12} /> Vid</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seen On:</span>
                                <input
                                    type="date"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.seen_start}
                                    onChange={(e) => handleChange('seen_start', e.target.value)}
                                />
                                <span className="text-gray-300">to</span>
                                <input
                                    type="date"
                                    className="bg-gray-50 dark:bg-gray-800/50 border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                                    value={filters.seen_end}
                                    onChange={(e) => handleChange('seen_end', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-blue-500 mr-2">Pro Tip:</span>
                            Search formatted as <code className="bg-white dark:bg-gray-700 px-1 rounded text-blue-400">domain.com</code> to find direct competitors.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
