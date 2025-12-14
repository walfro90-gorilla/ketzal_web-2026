'use client';

import { use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { User, Shield, Briefcase, Award, MapPin, Calendar, Mail, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@/navigation';
import { format } from 'date-fns';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
    email?: string;
};

type Wallet = Database['public']['Tables']['wallets']['Row'];

export default function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // Unwrapping params
    const [user, setUser] = useState<Profile | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setLoading(false);
                return;
            }

            // 2. Fetch Email from Auth (Admin Only - requires logic or simplified assumption)
            // Note: Client-side fetching of *other* users' emails via auth.admin is not possible directly.
            // We usually fetch this via a server action or use a secure RPC.
            // For now, we'll placeholder it or skip it to avoid security errors, 
            // unless we have an RLS policy allowing admins to read auth.users (unlikely/unsafe).
            // BETTER: Server Component would handle this easily. 
            // BUT: This is a client component as requested for interactivity? 
            // ACTUALLY: Let's assume we can fetch basic public profile info.

            setUser(profileData);

            // 3. Fetch Wallet
            const { data: walletData } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', id)
                .single();

            if (walletData) setWallet(walletData);

            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading user details...</div>;
    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield size={20} className="text-red-400" />;
            case 'provider': return <Briefcase size={20} className="text-primary" />;
            case 'ambassador': return <Award size={20} className="text-secondary" />;
            default: return <User size={20} className="text-gray-400" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Link href="/admin/users" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to Users
            </Link>

            {/* Header Card */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <div className="relative z-10 w-32 h-32 rounded-full border-4 border-card bg-zinc-900 flex items-center justify-center overflow-hidden shadow-xl">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-bold text-gray-500">{(user.full_name || 'U').charAt(0)}</span>
                    )}
                </div>

                <div className="relative z-10 flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-3xl font-black text-white">{user.full_name || 'Anonymous'}</h1>
                        {user.is_verified && <CheckCircle2 size={24} className="text-blue-500" />}
                    </div>
                    <p className="text-lg text-gray-400">@{user.username}</p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            {getRoleIcon(user.role)}
                            <span className="capitalize font-medium">{user.role}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                            <Calendar size={16} />
                            <span>Joined {format(new Date(user.created_at), 'PPP')}</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Wallet Balance</p>
                        <p className="text-2xl font-mono text-primary">
                            {wallet?.balance ?? '0.00'} <span className="text-sm text-gray-400">AXO</span>
                        </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verification Status</p>
                        <div className={`flex items-center gap-2 font-medium ${user.is_verified ? 'text-blue-400' : 'text-gray-400'}`}>
                            {user.is_verified ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            {user.is_verified ? 'Verified' : 'Unverified'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid (Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl space-y-2">
                    <h3 className="text-gray-500 font-bold text-sm uppercase">Total Bookings</h3>
                    <p className="text-3xl font-black text-white">0</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl space-y-2">
                    <h3 className="text-gray-500 font-bold text-sm uppercase">Reviews Written</h3>
                    <p className="text-3xl font-black text-white">0</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl space-y-2">
                    <h3 className="text-gray-500 font-bold text-sm uppercase">Last Active</h3>
                    <p className="text-3xl font-black text-white">Now</p>
                </div>
            </div>

        </div>
    );
}
