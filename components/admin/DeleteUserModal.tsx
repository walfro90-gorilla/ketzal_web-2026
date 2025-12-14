'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Trash2, Wallet, Briefcase, Calendar, X } from 'lucide-react';
import { getUserDeletionStats, deleteUser } from '@/app/actions/users';

interface DeleteUserModalProps {
    userId: string;
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DeleteUserModal({ userId, userName, isOpen, onClose }: DeleteUserModalProps) {
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [stats, setStats] = useState<{
        walletBalance: number;
        currency: string;
        servicesCount: number;
        activeBookingsAsProvider: number;
        travelerBookingsCount: number;
        postsCount: number;
        canDelete: boolean;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getUserDeletionStats(userId)
                .then(data => {
                    setStats(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const handleDelete = async () => {
        setDeleting(true);
        const res = await deleteUser(userId);
        setDeleting(false);
        if (res.error) {
            alert(res.error);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0A0A0A] border border-red-900/30 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        <h2 className="font-semibold">Delete User Forever</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-gray-300">
                        Are you sure you want to delete <strong className="text-white">{userName}</strong>?
                        This action is <strong className="text-red-400 underline decoration-red-400/30">irreversible</strong>.
                    </p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-xs">Analyzing user data...</p>
                        </div>
                    ) : stats ? (
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data to be removed</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                                            <Wallet className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Wallet Balance</p>
                                            <p className="font-mono text-sm text-gray-200">
                                                ${stats.walletBalance.toFixed(2)} {stats.currency}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-purple-500/10 text-purple-400">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Services</p>
                                            <p className="font-mono text-sm text-gray-200">
                                                {stats.servicesCount}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Active Bookings</p>
                                            <p className="font-mono text-sm text-gray-200">
                                                {stats.activeBookingsAsProvider}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                                            <Trash2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">History</p>
                                            <p className="font-mono text-sm text-gray-200">
                                                {stats.travelerBookingsCount} bookings
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-pink-500/10 text-pink-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">My Posts</p>
                                            <p className="font-mono text-sm text-gray-200">
                                                {stats.postsCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!stats.canDelete && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Cannot Delete:</strong> This user has active bookings on their services. You must complete or cancel them before deleting this user.
                                    </span>
                                </div>
                            )}

                            {stats.canDelete && stats.servicesCount > 0 && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Warning:</strong> {stats.servicesCount} services will be permanently deleted along with their reviews.
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-red-500">Failed to load stats.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white/5 px-6 py-4 flex justify-end gap-3 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        disabled={deleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading || !stats?.canDelete || deleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Confirm Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
