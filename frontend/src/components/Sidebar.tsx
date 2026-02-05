"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sidebarItems } from "@/config/sidebar";
import { LogOut, TrendingUp } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-[#0A0F1F] text-white h-screen fixed flex flex-col border-r border-white/5">
            <div className="p-6 border-b border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-[#00D1FF]">
                    <TrendingUp size={24} />
                    <span>SpyLancer</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? "bg-[#00D1FF] text-black shadow-lg shadow-[#00D1FF]/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }
              `}
                        >
                            <item.icon size={20} className={isActive ? "text-black" : "group-hover:text-white"} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1 h-4 rounded-full bg-black/50" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#00D1FF] flex items-center justify-center text-black font-bold text-xs">
                        {user?.name?.[0] || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate uppercase tracking-widest">{user?.plan || "Free"} Plan</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
                >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
