'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { useState } from 'react';
import FinanceActionModal from './FinanceActionModal';
import { processTransaction } from '@/app/actions/finance';
import { useRouter } from 'next/navigation';

type WalletType = Database['public']['Tables']['wallets']['Row'] & {
    profiles: { full_name: string | null, username: string | null } | null
};

interface WalletsTableProps {
    initialWallets: WalletType[];
}

export default function WalletsTable({ initialWallets }: WalletsTableProps) {
    const t = useTranslations('Sidebar'); // Fallback to 'Sidebar' since 'Dashboard.walletsTable' might not be fully populated
    const router = useRouter();

    // Future: Pagination / Real-time updates
    const wallets = initialWallets;

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'deposit' | 'withdrawal';
        walletId: string;
        userName: string;
    }>({
        isOpen: false,
        type: 'deposit',
        walletId: '',
        userName: '',
    });

    const [isPending, setIsPending] = useState(false);

    const openModal = (type: 'deposit' | 'withdrawal', wallet: WalletType) => {
        setModalState({
            isOpen: true,
            type,
            walletId: wallet.id,
            userName: wallet.profiles?.full_name || wallet.profiles?.username || 'Unknown User'
        });
    };

    const handleTransaction = async (amount: number, description: string) => {
        setIsPending(true);
        try {
            const result = await processTransaction(modalState.walletId, modalState.type, amount, description);
            if (result.error) {
                alert(result.error);
            } else {
                setModalState(prev => ({ ...prev, isOpen: false }));
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-right">Balance</th>
                                <th className="px-6 py-4 text-right">Transactions</th>
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
                                                <button
                                                    onClick={() => openModal('deposit', wallet)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-green-400"
                                                >
                                                    <ArrowDownLeft size={14} /> Deposit
                                                </button>
                                                <button
                                                    onClick={() => openModal('withdrawal', wallet)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-red-500 hover:text-red-400"
                                                >
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

            <FinanceActionModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onSubmit={handleTransaction}
                type={modalState.type}
                userName={modalState.userName}
                isPending={isPending}
            />
        </>
    );
}
