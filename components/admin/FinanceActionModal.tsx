'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface FinanceActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, description: string) => Promise<void>;
    type: 'deposit' | 'withdrawal';
    userName: string;
    isPending: boolean;
}

export default function FinanceActionModal({
    isOpen,
    onClose,
    onSubmit,
    type,
    userName,
    isPending
}: FinanceActionModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return;

        await onSubmit(numericAmount, description);
        setAmount('');
        setDescription('');
    };

    const isDeposit = type === 'deposit';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className={`text-xl font-bold ${isDeposit ? 'text-green-500' : 'text-red-500'}`}>
                        {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5 mb-4">
                        <p className="text-sm text-gray-400">Target User</p>
                        <p className="font-medium text-white text-lg">{userName}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Amount (AXO)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-right font-mono text-lg"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Reason for transaction..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !amount}
                            className={`px-6 py-2 rounded-lg font-bold text-black transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' :
                                    isDeposit ? 'bg-[#00E676] hover:bg-[#00c865]' : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                        >
                            {isPending ? 'Processing...' : (isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
