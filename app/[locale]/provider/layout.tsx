import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Package, Calendar, Wallet, Settings, LogOut } from 'lucide-react';
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Footer from '@/components/Footer';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
}

const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-slate-100 hover:bg-slate-800"
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Link>
    );
};

export default async function ProviderLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Await params for Next.js 15+ compatibility
    const { locale } = await params;
    const { data: { user } } = await (await createClient()).auth.getUser();

    // In a real app we might useTranslations here, but for now specific text or simple strings
    // const t = useTranslations('ProviderLayout');

    return (
        <div className="flex min-h-screen w-full bg-[#0A0A0A] text-slate-100">
            {/* Sidebar */}
            <aside className="hidden border-r border-slate-800 bg-[#0F0F0F] md:block md:w-64 lg:w-72 fixed bottom-0 top-16 z-40">
                <div className="flex h-full flex-col gap-2">
                    {/* Logo section removed to use global navbar */}
                    <div className="flex-1 overflow-auto py-4 px-3">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-2">
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/provider" />
                            <SidebarItem icon={Package} label="My Services" href="/provider/services" />
                            <SidebarItem icon={Calendar} label="Bookings" href="/provider/bookings" />
                            <SidebarItem icon={Wallet} label="Wallet" href="/provider/wallet" />
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t border-slate-800">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-2">
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-slate-100 hover:bg-slate-800 cursor-pointer">
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </div>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 md:ml-64 lg:ml-72 min-h-[calc(100vh-4rem)]">
                {/* Header removed */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
