"use client";

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Scrollable Main Content */}
            <main className="flex-1 ml-64 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
