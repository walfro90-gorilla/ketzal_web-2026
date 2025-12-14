"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/navigation";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface NavUserMenuProps {
    user: User;
    role?: string | null;
}

export default function NavUserMenu({ user, role }: NavUserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Get user initials or default avatar
    const initials = user.email?.substring(0, 2).toUpperCase() || "KV";

    // Determine Dashboard Path
    let dashboardPath = "/";
    const normalizedRole = role?.toLowerCase().trim();

    switch (normalizedRole) {
        case "admin":
            dashboardPath = "/admin";
            break;
        case "provider":
            dashboardPath = "/provider";
            break;
        case "ambassador":
            dashboardPath = "/ambassador";
            break;
        case "traveler":
            dashboardPath = "/traveler";
            break;
        default:
            dashboardPath = "/"; // Or maybe just don't show the link?
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-transparent hover:ring-primary/50 transition-all">
                    {initials}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{role || 'User'} Account</p>
                    </div>

                    <div className="p-2">
                        {/* Only show Dashboard link if role is assigned (even traveler has a 'dashboard' page now) */}
                        {role && (
                            <Link
                                href={dashboardPath}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon size={16} />
                            <span>Profile</span>
                        </Link>

                        <Link
                            href="/settings"
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings size={16} />
                            <span>Settings</span>
                        </Link>
                    </div>

                    <div className="p-2 border-t border-white/10">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
