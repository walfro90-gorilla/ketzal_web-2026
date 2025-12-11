'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { format } from 'date-fns';

type WalletType = Database['public']['Tables']['wallets']['Row'] & {
    profiles: { full_name: string | null, username: string | null } | null
};

interface WalletsTableProps {
    initialWallets: WalletType[];
}

export default function WalletsTable({ initialWallets }: WalletsTableProps) {
    const t = useTranslations('Dashboard.walletsTable');

    // Future: Pagination / Real-time updates
    const wallets = initialWallets;

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">{t('user')}</th>
                            <th className="px-6 py-4 text-right">{t('balance')}</th>
                            <th className="px-6 py-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {wallets.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No wallets active.
                                </td>
                            </tr>
                        ) : (
                            wallets.map((wallet) => (
                                <tr key={wallet.user_id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                                                <Wallet size={18} />
                                            </div>
                                            <div>
                                                {/* Safe access to joined profile relation */}
                                                <p className="font-medium text-white">
                                                    {wallet.profiles?.full_name || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    @{wallet.profiles?.username || 'user'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-mono text-lg font-bold text-white tracking-tight">
                                            {wallet.balance.toLocaleString()}
                                            <span className="text-xs text-secondary ml-1">{wallet.currency_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-xs">
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-green-400">
                                                <ArrowDownLeft size={14} /> Deposit
                                            </button>
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-red-400">
                                                Withdraw <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
