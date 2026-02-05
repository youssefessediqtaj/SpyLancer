import {
    LayoutDashboard,
    PlusCircle,
    Activity,
    BarChart,
    Bell,
    Star,
    Settings,
    User,
    Search
} from "lucide-react";

export const sidebarItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard"
    },
    {
        label: "Ad Library",
        icon: Search,
        path: "/ads/library"
    },
    {
        label: "Add Ad",
        icon: PlusCircle,
        path: "/ads/new"
    },
    {
        label: "Tracked Ads",
        icon: Activity,
        path: "/ads"
    },
    {
        label: "Analytics",
        icon: BarChart,
        path: "/analytics"
    },
    {
        label: "Alerts",
        icon: Bell,
        path: "/alerts"
    },
    {
        label: "Favorites",
        icon: Star,
        path: "/favorites"
    },
    {
        label: "Profile",
        icon: User,
        path: "/profile"
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/settings"
    }
];
