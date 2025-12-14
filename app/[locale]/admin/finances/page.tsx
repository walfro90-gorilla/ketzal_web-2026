import { createAdminClient } from '@/utils/supabase/admin';
import WalletsTable from '@/components/admin/WalletsTable';
import { getTranslations } from 'next-intl/server';
import { Database } from '@/types/database.types';

export default async function FinancesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = createAdminClient();
    const t = await getTranslations('Sidebar');

    // Fetch wallets with profile info
    const { data: wallets, error } = await supabase
        .from('wallets')
        .select(`
      *,
      profiles (
        full_name,
        username
      )
    `)
        .order('balance', { ascending: false });

    if (error) {
        console.error("Error fetching wallets:", error);
    }

    // Type assertion since the join returns a complex object structure
    // that aligns with our props but TS might need help inferring the deeply nested join
    const formattedWallets = (wallets as any[]) || [];

    // 2. Fetch recent transactions
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            type,
            created_at,
            description,
            wallets (
                profiles (
                    full_name,
                    username
                )
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    // 3. Simple Stats
    const totalCirculation = (formattedWallets.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0) as number);
    const activeWalletsCount = formattedWallets.filter((w: any) => w.balance > 0).length;
    const totalTransactionsCount = transactions ? transactions.length : 0; // In real app, use count query

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('finances')}
                    </h1>
                    <p className="text-gray-400 mt-1">Central Bank & Wallet Management.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-secondary text-xs font-bold uppercase tracking-wider">Total Circulation</p>
                        <h3 className="text-4xl font-black text-white mt-2">
                            {totalCirculation.toLocaleString()}
                            <span className="text-lg text-secondary ml-2">AXO</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">System-wide balance</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-secondary/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Wallets</p>
                    <h3 className="text-4xl font-black text-white mt-2">
                        {activeWalletsCount}
                        <span className="text-lg text-gray-500 ml-2">/ {formattedWallets.length}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Users holding AXO</p>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Recent Activity</p>
                    <h3 className="text-4xl font-black text-white mt-2">
                        {transactions?.length || 0}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Transactions fetched</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Wallets Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">User Wallets</h2>
                    <WalletsTable initialWallets={formattedWallets} />
                </div>

                {/* Transactions Feed */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-right">User</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {!transactions || transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx: any) => (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold uppercase text-xs ${tx.type === 'deposit' ? 'text-green-400' : tx.type === 'withdrawal' ? 'text-red-400' : 'text-blue-400'}`}>
                                                            {tx.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate max-w-[150px]">{tx.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-white">
                                                    {tx.amount} AXO
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400 text-xs">
                                                    {tx.wallets?.profiles?.username || 'Unknown'}
                                                    <br />
                                                    <span className="text-[10px] text-gray-600">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
