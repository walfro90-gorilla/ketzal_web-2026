import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, MapPin, DollarSign, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const supabase = await createClient();

    // Fetch Profile & Wallet
    // Using single query if relation exists, or separate.
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', id).single();

    if (!profile) {
        return notFound();
    }

    // Fetch Stats based on Role
    let services = [];
    if (profile.role === 'provider') {
        const { data } = await supabase.from('services').select('*').eq('provider_id', id);
        services = data || [];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/users`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-white">User Details</h1>
            </div>

            {/* Header Card */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                            {(profile.username || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous'}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase 
                     ${profile.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                profile.role === 'provider' ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-300'}`}>
                            {profile.role}
                        </span>
                    </div>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="font-mono text-sm">@{profile.username}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Joined {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            <Shield size={14} />
                            Verified: {profile.is_verified ? 'Yes' : 'No'}
                        </div>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="bg-black/40 border border-white/5 rounded-lg p-4 min-w-[200px]">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Wallet Balance</p>
                    <div className="flex items-center gap-2 text-primary font-mono text-2xl font-bold">
                        <DollarSign size={24} />
                        {wallet?.balance?.toLocaleString() || '0.00'}
                        <span className="text-xs text-gray-500 self-end mb-1">AXO</span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services (If Provider) */}
                {profile.role === 'provider' && (
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Services Provided ({services.length})</h3>
                        <div className="space-y-3">
                            {services.length > 0 ? services.map((s) => (
                                <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 bg-gray-700 rounded-md"></div>
                                    <div>
                                        <p className="font-medium text-white text-sm">{s.title}</p>
                                        <p className="text-xs text-gray-500">${s.price_mxn} MXN</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`text-[10px] px-2 py-1 rounded-full ${s.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {s.available ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm">No services listed yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Activity / Bookings Placeholder */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    <div className="text-center py-10 text-gray-500 text-sm">
                        Coming Soon: Bookings & Reviews List
                    </div>
                </div>
            </div>
        </div>
    );
}
