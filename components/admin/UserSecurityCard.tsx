'use client';

import { useState } from 'react';
import { adminResetPassword, sendPasswordResetEmail } from '@/app/actions/security';
import { KeyRound, Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface UserSecurityCardProps {
    userId: string;
    email: string | undefined;
}

export default function UserSecurityCard({ userId, email }: UserSecurityCardProps) {
    const [isLoading, setIsLoading] = useState<'email' | 'manual' | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const handleSendEmail = async () => {
        if (!email) return;
        setIsLoading('email');
        setMessage(null);

        const res = await sendPasswordResetEmail(email);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Reset link sent to user!" });
        }
        setIsLoading(null);
    };

    const handleManualReset = async () => {
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 chars." });
            return;
        }
        setIsLoading('manual');
        setMessage(null);

        const res = await adminResetPassword(userId, newPassword);
        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Password changed successfully." });
            setNewPassword('');
        }
        setIsLoading(null);
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <KeyRound size={18} className="text-primary" />
                Security & Access
            </h3>

            <div className="space-y-6">
                {/* 1. Send Reset Email */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    <h4 className="text-sm font-medium text-white mb-1">Recovery Email</h4>
                    <p className="text-xs text-gray-500 mb-3">Send a standard password reset link to {email}</p>
                    <button
                        onClick={handleSendEmail}
                        disabled={!email || !!isLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary/10 text-secondary rounded-md text-xs font-bold hover:bg-secondary/20 transition-colors disabled:opacity-50 w-full justify-center"
                    >
                        {isLoading === 'email' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Send Reset Link
                    </button>
                </div>

                {/* 2. Manual Reset */}
                <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                    <h4 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        Admin Override
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">Forcibly set a new password. The user will be logged out.</p>

                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                        <button
                            onClick={handleManualReset}
                            disabled={!newPassword || !!isLoading}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 w-full justify-center"
                        >
                            {isLoading === 'manual' ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                            Set Password
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2
                        ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
