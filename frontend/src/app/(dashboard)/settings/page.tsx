"use client";

import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import {
    User,
    Lock,
    CreditCard,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    Mail,
    CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || ""
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: ""
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await axios.put("/profile", profileForm);
            setUser(res.data.user);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err: any) {
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            await axios.put("/profile/password", passwordForm);
            setMessage({ type: "success", text: "Password changed successfully!" });
            setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update password." });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const password = prompt("Please confirm your password to delete your account:");
        if (!password) return;

        if (!confirm("This action is irreversible. All your tracked ads will be deleted. Proceed?")) return;

        try {
            await axios.delete("/profile", { data: { password } });
            window.location.href = "/register";
        } catch (err: any) {
            alert("Verification failed. Account not deleted.");
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-500">Manage your profile, security, and subscription.</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-red-50 border-red-100 text-red-600"
                        }`}>
                        {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Tabs (Visual) */}
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-blue-600 dark:text-blue-400 font-bold transition-all">
                            <User size={18} /> Profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-900 transition-all">
                            <Lock size={18} /> Security
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-900 transition-all">
                            <CreditCard size={18} /> Subscription
                        </button>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <User size={20} className="text-gray-400" /> Personal Information
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </section>

                        {/* Security Section */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-gray-400" /> Security & Password
                            </h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={passwordForm.password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm New</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            value={passwordForm.password_confirmation}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    Update Password
                                </button>
                            </form>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                <Trash2 size={20} /> Danger Zone
                            </h2>
                            <p className="text-sm text-red-500 mb-4 opacity-80">Once you delete your account, there is no going back. Please be certain.</p>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
                            >
                                Delete Account
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
