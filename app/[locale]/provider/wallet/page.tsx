
import { createClient } from '@/utils/supabase/server';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProviderWalletPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // 1. Fetch Wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // 2. Fetch Transactions
    let transactions = [];
    if (wallet) {
        const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false });
        transactions = txs || [];
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">My Wallet</h1>
                <p className="text-gray-400">Manage your earnings and payouts.</p>
            </header>

            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary/20 via-[#1a1a1a] to-[#111] border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet size={120} className="text-primary" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-primary font-medium mb-2 uppercase tracking-wider text-sm">Total Balance</p>
                        <h2 className="text-5xl font-black text-white mb-2">
                            {wallet?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            <span className="text-2xl text-gray-500 font-bold ml-2">{wallet?.currency_code || 'AXO'}</span>
                        </h2>
                        <p className="text-gray-400 text-sm">Available for withdrawal</p>
                    </div>

                    <div className="mt-8 flex gap-3 relative z-10">
                        <button className="bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2">
                            <ArrowUpRight size={18} />
                            Withdraw
                        </button>
                        <button className="bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 px-6 rounded-xl border border-white/10 transition-all flex items-center gap-2">
                            <CreditCard size={18} />
                            Settings
                        </button>
                    </div>
                </div>

                {/* Quick Stats or Promo */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                        <ArrowUpRight size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Next Payout</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Automatic payouts are scheduled for every Friday. Ensure your bank details are up to date.
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <History size={20} className="text-gray-400" />
                        Recent Transactions
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {transactions.length > 0 ? (
                                transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                                                ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' :
                                                    tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{tx.description || 'No description'}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        <td className={`px-6 py-4 text-right font-bold font-mono 
                                            ${tx.type === 'deposit' ? 'text-green-500' : 'text-white'}`}>
                                            {tx.type === 'deposit' ? '+' : ''}
                                            {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
