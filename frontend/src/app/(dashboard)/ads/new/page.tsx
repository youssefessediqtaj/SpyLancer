"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import {
    PlusCircle,
    ArrowLeft,
    Globe,
    Link as LinkIcon,
    Store,
    Tag,
    Calendar,
    DollarSign,
    Users,
    Sparkles,
    Loader2
} from "lucide-react";

export default function NewAdPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [useAI, setUseAI] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        ad_id: "", // Required for tracking
        ad_token: "", // Internal reference
        ad_link: "",
        advertiser_name: "",
        product_name: "",
        website: "",
        start_date: new Date().toISOString().split('T')[0],
        countries: "Worldwide",
        creative_type: "image",
        product_cost: "",
        selling_price: "",
        notes: "",
        ad_text: "",
        scaling_score: 0,
        trend: "low",
        store_tech: "Unknown"
    });

    const handleAIAnalyze = async () => {
        if (!form.ad_link) {
            setError("Please provide a Meta Ads Library link first.");
            return;
        }
        setAiLoading(true);
        setError("");
        try {
            const res = await axios.post("/ads/extract", {
                ad_link: form.ad_link,
                website: form.website,
                ad_text: form.ad_text
            });

            const data = res.data.extracted_data;
            const extraction = res.data.product || {};

            setForm({
                ...form,
                ad_id: extraction.ad_id || `extracted_${Date.now()}`,
                advertiser_name: data.advertiser_name || form.advertiser_name,
                product_name: data.product_name || form.product_name,
                selling_price: data.selling_price || form.selling_price,
                product_cost: data.estimated_cost || form.product_cost,
                countries: data.country || form.countries,
                creative_type: data.creative_type || form.creative_type,
                scaling_score: data.scaling_score || 0,
                trend: data.trend || 'low',
                store_tech: data.store_tech || 'Unknown',
                start_date: data.first_seen_date || form.start_date,
                notes: `Analysis: ${data.offer_type || 'General'} | Scaling Score: ${data.scaling_score || 0}/10 | Trend: ${data.trend || 'low'} \nOriginal Notes: ${form.notes}`
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "AI Analysis failed. Please fill manually.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Submitting form:", form);
            // Ensure countries is an array if required by backend, or just handle field name
            const payload = {
                ...form,
                countries: [form.countries], // Backend expects array
                estimated_profit: (Number(form.selling_price) - Number(form.product_cost)) || 0
            };
            const res = await axios.post("/ads", payload);
            console.log("Response:", res.data);
            router.push("/dashboard"); // Redirect to dashboard to see results
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.response?.data?.message || "Failed to create ad tracking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                        <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
                        <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100 italic">AI Intelligence</span>
                        <button
                            type="button"
                            onClick={() => setUseAI(!useAI)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${useAI ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useAI ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/50 dark:shadow-none">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <PlusCircle className="text-blue-600" />
                                Track New Meta Ad
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {useAI ? "Magic Mode: AI needs the 'Ad Text' or 'Landing Page' to analyze details." : "Fill in the details from the Meta Ads Library manually."}
                            </p>
                        </div>
                        {useAI && (
                            <button
                                type="button"
                                onClick={handleAIAnalyze}
                                disabled={aiLoading}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {aiLoading ? "Scraping & Analyzing..." : "Magic Extract"}
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ad Link */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <LinkIcon size={16} className="text-gray-400" />
                                    Meta Ads Library Link
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://www.facebook.com/ads/library/..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.ad_link}
                                    onChange={(e) => setForm({ ...form, ad_link: e.target.value })}
                                />
                            </div>

                            {/* Advertiser Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Users size={16} className="text-gray-400" />
                                    Advertiser Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Ecommerce"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.advertiser_name}
                                    onChange={(e) => setForm({ ...form, advertiser_name: e.target.value })}
                                />
                            </div>

                            {/* Product Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Tag size={16} className="text-gray-400" />
                                    Internal Product Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Magic Blender 2.0"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.product_name}
                                    onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                                />
                            </div>

                            {/* Ad Text (Optional, for AI) */}
                            {useAI && (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Sparkles size={16} className="text-indigo-400" />
                                        Ad Text / Copy (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Paste the primary text from the ad for better AI analysis..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        value={form.ad_text}
                                        onChange={(e) => setForm({ ...form, ad_text: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Website */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Store size={16} className="text-gray-400" />
                                    Product Landing Page
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://acme.com/product"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.website}
                                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                                />
                            </div>

                            {/* Launch Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    First Seen Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.start_date}
                                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                />
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Globe size={16} className="text-gray-400" />
                                    Target Country
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. USA, UK, FR"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.countries}
                                    onChange={(e) => setForm({ ...form, countries: e.target.value })}
                                />
                            </div>

                            {/* Creative Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Creative Format</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none"
                                    value={form.creative_type}
                                    onChange={(e) => setForm({ ...form, creative_type: e.target.value })}
                                >
                                    <option value="image">Single Image</option>
                                    <option value="video">Video Ad</option>
                                    <option value="carousel">Carousel</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 border-t border-gray-50 dark:border-gray-800 pt-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Financials (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            Product Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            value={form.product_cost}
                                            onChange={(e) => setForm({ ...form, product_cost: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            Selling Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            value={form.selling_price}
                                            onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Internal Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Add any additional details or analysis..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? "Initializing Tracking..." : "Start Tracking Ad"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
