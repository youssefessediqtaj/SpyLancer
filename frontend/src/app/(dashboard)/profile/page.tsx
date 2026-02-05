"use client";

import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { User, Mail, Shield, Save, Loader2, LogOut, Key } from "lucide-react";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await axios.put("/profile", { name, email, password: password || undefined });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
            setPassword("");
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your profile information and security preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <Shield size={12} />
                                {user?.plan || 'Free'} Plan
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors dark:bg-red-900/10 dark:hover:bg-red-900/20"
                        >
                            <LogOut size={18} />
                            Sign Out of All Devices
                        </button>
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-2 space-y-6">
                        <form onSubmit={handleUpdate} className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6">
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-1.5 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Key size={16} className="text-gray-400" />
                                        New Password (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                        placeholder="Min. 8 characters"
                                    />
                                    <p className="text-xs text-gray-500">Leave blank if you don't want to change your password.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Changes
                            </button>
                        </form>

                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-4">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account Security</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Your data is encrypted using industry-standard protocols. We never share your scraping data with third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
