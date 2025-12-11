'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import { LayoutDashboard, Users, FileText, Wallet, Settings, Menu, MapPin } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { clsx } from 'clsx';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const t = useTranslations('Sidebar');
    const isOnline = useNetworkStatus();
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/admin/services', label: t('services'), icon: FileText },
        { href: '/admin/destinations', label: t('destinations'), icon: MapPin },
        { href: '/admin/users', label: t('users'), icon: Users },
        { href: '/admin/finances', label: t('finances'), icon: Wallet },
        { href: '/admin/settings', label: t('settings'), icon: Settings },
    ];

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border hidden md:flex flex-col bg-background/95 backdrop-blur fixed h-full z-10">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <span className="text-xl font-bold tracking-widest text-primary">KETZAL</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className={clsx("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-red-500 animate-pulse")} />
                        {isOnline ? "Online" : "Offline Mode"}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur sticky top-0 z-20">
                    <div className="md:hidden">
                        <Menu className="text-gray-400" />
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <LanguageSelector />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-black font-bold text-xs ring-2 ring-white/10">
                            AD
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
