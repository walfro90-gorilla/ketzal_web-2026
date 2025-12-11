import { createClient } from '@/utils/supabase/server';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Users, FileText, BadgeDollarSign, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
    const t = await getTranslations('Dashboard');
    const supabase = await createClient();

    // 1. Fetch Real Data
    // A. Users Count
    const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // B. Pending Services (using available = false as "pending" for now, or just total count)
    // Assuming 'available: false' implies needing moderation or setup.
    const { count: pendingServicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('available', false);

    // C. Net Income (Sum of wallets or specific transactions)
    // Since 'wallets.balance' is user money, "Net Income" for the platform might be different.
    // For this dashboard, showing "Total System Liquidity" (Sum of all wallets) is a good proxy 
    // for now if "Revenue" isn't strictly defined in a separate table.
    // However, Supabase doesn't do SUM() easily in JS client without an RPC or loading all rows.
    // We will load all wallets (limited for perf, but okay for MVP) or use a small hack.
    // Better Approach: Just count transactions for "Activity" or just show 0 for now until KPI RPC exists.
    // Let's create an RPC for summing balances later. For now, we will just count Wallets with balance > 0 
    // or calculate from visible rows (not performant for 12k users, but fine for 10).
    const { data: wallets } = await supabase.from('wallets').select('balance');
    const totalLiquidity = wallets?.reduce((acc, w) => acc + (Number(w.balance) || 0), 0) || 0;

    const stats = [
        {
            label: t('totalUsers'),
            value: usersCount?.toLocaleString() || "0",
            trend: "Live", // Dynamic later
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: t('pendingServices'),
            value: pendingServicesCount?.toLocaleString() || "0",
            trend: pendingServicesCount && pendingServicesCount > 0 ? "Action Needed" : "All Clear",
            icon: FileText,
            color: "text-secondary",
            bg: "bg-secondary/10"
        },
        {
            label: t('netIncome'), // Or 'System Value'
            value: `$${totalLiquidity.toLocaleString()}`,
            trend: "AXO",
            icon: BadgeDollarSign,
            color: "text-primary",
            bg: "bg-primary/10"
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {t('welcome', { name: 'Admin' })}
                </h1>
                <p className="text-gray-400">Overview of Ketzal Network Performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'Action Needed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400'
                                    }`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-card border border-border rounded-xl p-6 h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Activity Chart Placeholder</p>
                    <p className="text-xs text-gray-600">Connect to analytics.tables</p>
                </div>
            </div>
        </div>
    );
}
