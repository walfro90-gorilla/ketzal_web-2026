'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { Globe, Moon, Sun, LogOut, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from '@/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Settings');
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    const changeLanguage = (newLocale: 'en' | 'es' | 'zh') => {
        router.replace(pathname, { locale: newLocale });
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 pb-24 md:pb-6 md:pl-72 pt-20 md:pt-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-black tracking-tight mb-2">{t('title')}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">{t('subtitle')}</p>
                </header>

                <div className="space-y-6">
                    {/* Language Section */}
                    <section className="bg-card dark:bg-[#111] border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-gray-50/50 dark:bg-transparent">
                            <h2 className="font-bold flex items-center gap-2">
                                <Globe size={18} className="text-primary" />
                                {t('language')}
                            </h2>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="grid gap-2">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${locale === 'en' ? 'bg-primary/20 text-primary border border-primary/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
                                >
                                    <span>English</span>
                                    {locale === 'en' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                                <button
                                    onClick={() => changeLanguage('es')}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${locale === 'es' ? 'bg-primary/20 text-primary border border-primary/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
                                >
                                    <span>Español</span>
                                    {locale === 'es' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                                <button
                                    onClick={() => changeLanguage('zh')}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${locale === 'zh' ? 'bg-primary/20 text-primary border border-primary/50' : 'hover:bg-accent hover:text-accent-foreground'}`}
                                >
                                    <span>中文 (Chinese)</span>
                                    {locale === 'zh' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section className="bg-card dark:bg-[#111] border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-gray-50/50 dark:bg-transparent">
                            <h2 className="font-bold flex items-center gap-2">
                                {resolvedTheme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                                {t('appearance')}
                            </h2>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between p-3">
                                <span>{t('dark_mode')}</span>
                                <button
                                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${resolvedTheme === 'dark' ? 'bg-primary' : 'bg-zinc-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Account Actions */}
                    <section className="bg-card dark:bg-[#111] border border-border rounded-2xl overflow-hidden shadow-sm">
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left p-4 hover:bg-red-500/10 text-red-500 flex items-center gap-3 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">{t('sign_out')}</span>
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
