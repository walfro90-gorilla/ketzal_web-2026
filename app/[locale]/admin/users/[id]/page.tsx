import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, MapPin, DollarSign, Shield, Phone, FileImage, ExternalLink } from 'lucide-react';
import { Link } from '@/navigation';
import UserSecurityCard from '@/components/admin/UserSecurityCard';

import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

export default async function UserDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const supabase = await createClient();

    // 1. Fetch Basic Data (Profile, Wallet)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single();
    const profile = profileData as Profile | null;

    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', id).single();
    const wallet = walletData as Database['public']['Tables']['wallets']['Row'] | null;

    if (!profile) return notFound();

    // 2. Fetch Sensitive Data (Email, Phone) using Admin Client
    const supabaseAdmin = createAdminClient();
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

    // 3. Fetch Posts
    const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false });
    const posts = postsData as Post[] | null;

    // 4. Fetch Services if Provider
    let services: Service[] = [];
    if (profile.role === 'provider') {
        const { data } = await supabase.from('services').select('*').eq('provider_id', id);
        if (data) services = data;
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
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 ring-4 ring-white/5">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                            {(profile.username || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous'}</h2>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                     ${profile.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                    profile.role === 'provider' ? 'bg-primary/20 text-primary' :
                                        profile.role === 'ambassador' ? 'bg-secondary/20 text-secondary' : 'bg-gray-700 text-gray-300'}`}>
                                {profile.role}
                            </span>
                        </div>
                        <p className="text-gray-400 font-mono text-sm">@{profile.username}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
                        {authUser?.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-500" />
                                <span>{authUser.email}</span>
                            </div>
                        )}
                        {authUser?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-500" />
                                <span>{authUser.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={14} className={profile.is_verified ? "text-green-500" : "text-gray-500"} />
                            <span>Verified: {profile.is_verified ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>

                {/* Wallet & Stats */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Wallet Balance</p>
                        <div className="flex items-center gap-2 text-primary font-mono text-2xl font-bold">
                            <DollarSign size={20} />
                            {wallet?.balance?.toLocaleString() || '0.00'}
                            <span className="text-xs text-gray-500 self-end mb-1">AXO</span>
                        </div>
                    </div>
                    {/* KM Container Stat */}
                    <div className="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5 tracking-wider">Exploration</p>
                            <p className="text-white font-bold text-lg">{profile.km_container || 0} <span className="text-xs text-gray-500 font-normal">km</span></p>
                        </div>
                        <MapPin size={20} className="text-secondary opacity-80" />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Posts & Services */}
                <div className="space-y-6">
                    {/* Created Posts */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileImage size={18} className="text-gray-400" />
                                User Posts ({posts?.length || 0})
                            </h3>
                        </div>

                        {posts && posts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {posts.slice(0, 4).map((post) => (
                                    <div key={post.id} className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative group">
                                        {post.thumbnail_url ? (
                                            <img src={post.thumbnail_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900 border border-white/5">
                                                <FileImage size={24} />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-xs text-white truncate">{post.description || 'No description'}</p>
                                        </div>
                                    </div>
                                ))}
                                {posts.length > 4 && (
                                    <div className="col-span-2 text-center py-2">
                                        <span className="text-xs text-gray-500">+ {posts.length - 4} more posts</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
                                <p className="text-gray-500 text-sm">No posts created yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Services (If Provider) */}
                    {profile.role === 'provider' && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Services Provided ({services.length})</h3>
                            <div className="space-y-3">
                                {services.length > 0 ? services.map((s) => (
                                    <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-gray-700 rounded-md overflow-hidden">
                                            {s.images && s.images[0] ? (
                                                <img src={s.images[0]} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">S</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white text-sm truncate group-hover:text-primary transition-colors">{s.title}</p>
                                            <p className="text-xs text-gray-500 font-mono">${s.price_mxn} MXN</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`text-[10px] px-2 py-1 rounded-full ${s.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {s.available ? 'Active' : 'Hidden'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 text-sm">No services listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Security & Logs */}
                <div className="space-y-6">
                    {/* Security Card */}
                    <UserSecurityCard userId={id} email={authUser?.email} />

                    <div className="bg-card border border-border rounded-xl p-6 min-h-[300px] flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">Activity Log</h3>
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                            <div className="p-4 rounded-full bg-white/5 mb-3">
                                <ExternalLink size={24} className="opacity-50" />
                            </div>
                            <p className="text-sm">No recent activity recorded.</p>
                            <p className="text-xs opacity-50 mt-1">Bookings and transactions will appear here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
