'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { User, Mail, MapPin, Calendar, Edit2, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';

// Define a type for the profile data
type Profile = {
    username: string;
    full_name: string | null;
    role: string;
    avatar_url?: string | null;
    created_at: string;
    email?: string;
}

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Profile');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setProfile({
                    ...data,
                    email: user.email
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24 md:pb-6 md:pl-72 pt-20 md:pt-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-zinc-900">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url!} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                    <User size={48} className="text-zinc-500" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full hover:scale-110 transition-transform">
                            <Edit2 size={16} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-black tracking-tight">{profile.full_name || profile.username}</h1>
                        <p className="text-zinc-400">@{profile.username}</p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-2">
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                                {profile.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info Card */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-2 mb-4">{t('personal_info')}</h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Mail size={18} />
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Calendar size={18} />
                                <span>{t('joined')} {new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats or Additional Info (Placeholder) */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h2 className="text-lg font-bold border-b border-white/5 pb-2 mb-4">{t('activity')}</h2>
                        <p className="text-zinc-500 text-sm">
                            {t('no_recent_activity')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
