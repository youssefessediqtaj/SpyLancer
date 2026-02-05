"use client";

import { useState, useEffect, useRef } from "react";
import axios from "@/lib/axios";
import { Search, Loader2, PlayCircle, Store, Globe, Calendar, ExternalLink, Copy, TrendingUp } from "lucide-react";
import AdvancedFilters from "@/components/AdvancedFilters";

// Types (Ideally imported, but defining here for safety if import fails in full rewrite context)
interface LibraryAd {
    _id: string;
    description: string;
    platform: string;
    advertiser_name: string;
    ad_creative: {
        headline: string;
        primary_text: string;
        call_to_action: string;
    };
    media: {
        has_video: boolean;
        images: string[];
        videos: string[];
    };
    metrics: {
        likes: number;
        comments: number;
        shares: number;
        views: number;
        days_running: number;
        duplicate_count: number;
        scaling_score: number;
        confidence_score: number;
    };
    detected_store: {
        url: string;
        domain: string;
        ecommerce_platform: string;
    };
    countries: string[];
    ad_status: string;
    landing_page_url: string;
    last_seen: string;
}

export default function AdLibraryPage() {
    const [ads, setAds] = useState<LibraryAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trackingId, setTrackingId] = useState<string | null>(null);

    // Filter State
    const [filterState, setFilterState] = useState({
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
        page: 1
    });

    // Infinite Scroll State
    const [cursor, setCursor] = useState<string | null>(null);
    const cursorRef = useRef<string | null>(null); // Ref to avoid stale closures
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Initial Load & Filter Change
    useEffect(() => {
        fetchLibrary(true);
    }, [filterState]);

    // Infinite Scroll Implementation
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetchingMore || !hasMore) return;
            fetchLibrary(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isFetchingMore, hasMore]); // Cursor removed from dependency, using Ref

    const fetchLibrary = async (isReset = false) => {
        if (isReset) {
            setLoading(true);
            setCursor(null);
            cursorRef.current = null;
            setAds([]);
        } else {
            setIsFetchingMore(true);
        }

        setError(null);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filterState).forEach(([key, value]) => {
                if (value && value !== 'all' && key !== 'page') {
                    queryParams.append(key, value.toString());
                }
            });

            // If we are loading more, attach cursor from Ref
            if (!isReset && cursorRef.current) {
                queryParams.append('cursor', cursorRef.current);
            }

            const endpoint = '/library/ads';
            const res = await axios.get(`${endpoint}?${queryParams.toString()}`);

            if (isReset) {
                setAds(res.data.data);
            } else {
                setAds(prev => [...prev, ...res.data.data]);
            }

            if (res.data.next_cursor) {
                setCursor(res.data.next_cursor);
                cursorRef.current = res.data.next_cursor;
                setHasMore(true);
            } else {
                setHasMore(false);
            }

        } catch (error: any) {
            console.error("Failed to fetch library", error);
            if (error.response?.status === 401) {
                window.location.href = '/login';
                return;
            }
            setError(error.response?.data?.error || error.message || "Failed to load library ads.");
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    const handleFilterChange = (newFilters: any) => {
        setFilterState(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const resetFilters = () => {
        setFilterState({
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
            page: 1
        });
    };

    const trackAd = async (adId: string) => {
        setTrackingId(adId);
        try {
            await axios.post(`/library/ads/${adId}/track`);
            alert("Success! This ad is now being tracked on your dashboard.");
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to track ad");
        } finally {
            setTrackingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Global Ads Intelligence</h1>
                    <p className="text-gray-500 font-medium">Monitoring public Meta ads across 12 MENA countries with inferred performance metrics.</p>
                </div>

                {/* Compliance Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 p-5 rounded-[2rem] max-w-xl backdrop-blur-xl">
                    <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-400 font-bold uppercase tracking-tight">
                        <span className="flex items-center gap-2 mb-1 text-amber-600">
                            Compliance notice
                        </span>
                        Aggregating public Meta Ads Library data. Metrics are <span className="underline decoration-amber-500 underline-offset-4 decoration-2">estimated heuristics</span>. No private data is accessed.
                    </p>
                </div>
            </div>

            <div className="relative z-20">
                <AdvancedFilters
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                    loading={loading}
                />
            </div>

            {/* Active Filter Chips & Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(filterState).map(([key, value]) => {
                        if (value && value !== 'all' && key !== 'page' && key !== 'sort_by' && key !== 'status') {
                            return (
                                <div key={key} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                                    <span className="opacity-50">{key.replace('_', ' ')}:</span>
                                    {value}
                                    <button
                                        onClick={() => handleFilterChange({ [key]: 'all' })}
                                        className="hover:text-blue-800 dark:hover:text-blue-200"
                                    >×</button>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {Object.values(filterState).some(v => v !== 'all' && v !== '' && v !== 'active' && v !== 'newest') && (
                        <button
                            onClick={resetFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                        >Clear All Filters</button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Found <span className="text-blue-500">{ads.length}</span> matching ads
                    </p>
                    <button
                        onClick={() => fetchLibrary(true)}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={12} /> : <TrendingUp size={12} className="text-emerald-500" />}
                        Refresh Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && ads.length === 0 ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-96 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-800" />
                    ))
                ) : error ? (
                    <div className="col-span-full py-40 text-center">
                        <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-800 max-w-lg mx-auto">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                                {error?.includes('Network') ? 'Connection Error' : 'Request Failed'}
                            </h3>
                            <p className="text-red-500/80 mb-6">{error}</p>
                            <button
                                onClick={() => fetchLibrary(true)}
                                className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="col-span-full py-40 text-center">
                        <Search size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching ads found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : (
                    <>
                        {ads.map((ad) => (
                            <div key={ad._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
                                {/* Media Preview */}
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {ad.media.videos.length > 0 ? (
                                        <div className="w-full h-full flex items-center justify-center relative">
                                            <PlayCircle size={48} className="text-white drop-shadow-lg z-10" />
                                            <video className="absolute inset-0 w-full h-full object-cover opacity-80" src={ad.media.videos[0]} muted loop />
                                        </div>
                                    ) : ad.media.images.length > 0 ? (
                                        <img
                                            src={ad.media.images[0]}
                                            alt={ad.ad_creative.headline}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            No Preview
                                        </div>
                                    )}

                                    {/* Floating Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-blue-500 shadow-sm border border-gray-100/20">
                                            Public Ad — {ad.platform}
                                        </span>
                                        <span className="bg-emerald-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-white shadow-sm">
                                            {ad.ad_status}
                                        </span>
                                    </div>

                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <div className="bg-orange-500 px-3 py-1.5 rounded-xl text-center shadow-lg">
                                            <p className="text-[8px] font-black text-orange-100 uppercase leading-none">Scaling</p>
                                            <p className="text-sm font-black text-white">{(ad.metrics.scaling_score || 0).toFixed(1)}</p>
                                        </div>
                                        <div className="bg-purple-600 px-3 py-1.5 rounded-xl text-center shadow-lg">
                                            <p className="text-[8px] font-black text-purple-100 uppercase leading-none">Confidence</p>
                                            <p className="text-sm font-black text-white">{((ad.metrics.confidence_score || 0) * 10).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                                            <Store size={20} className="text-blue-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{ad.advertiser_name}</h3>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1 uppercase tracking-tighter"><Globe size={10} /> {ad.countries.join(', ')}</span>
                                                <span className="flex items-center gap-1 uppercase tracking-tighter"><Calendar size={10} /> {Math.floor(ad.metrics.days_running)}d</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{ad.ad_creative.headline}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                            {ad.ad_creative.primary_text}
                                        </p>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-50 dark:border-gray-800 space-y-3 font-medium">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400">
                                            <span className="font-bold">Estimated Metrics:</span>
                                            <span className="flex items-center gap-1 text-emerald-500 underline underline-offset-4 cursor-pointer">
                                                {ad.detected_store.ecommerce_platform} <ExternalLink size={10} />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-gray-500">
                                            <span>Duplicates: {ad.metrics.duplicate_count}</span>
                                            <span>Runtime: {Math.floor(ad.metrics.days_running)}d</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => trackAd(ad._id)}
                                                disabled={trackingId === ad._id}
                                                className="flex items-center justify-center gap-2 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                                            >
                                                {trackingId === ad._id ? <Loader2 className="animate-spin" size={14} /> : <Copy size={14} />}
                                                Track Ad
                                            </button>
                                            <a
                                                href={ad.landing_page_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-3 bg-[#0A0F1F] hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-wider transition-colors shadow-lg shadow-black/10"
                                            >
                                                <ExternalLink size={14} className="text-[#00D1FF]" />
                                                {ad.ad_creative.call_to_action || 'Store'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isFetchingMore && (
                            <div className="col-span-full py-8 flex justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
