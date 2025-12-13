'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { cn } from '@/utils/cn';

export default function HeroSection() {
    const t = useTranslations('Landing.Hero');

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Video Placeholder */}
            <div className="absolute inset-0 z-0 bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
                {/* Simulating video with a slow moving gradient for now */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518182170546-0766cacd423c?q=80&w=2697&auto=format&fit=crop')] bg-cover bg-center opacity-50 animate-pulse-slow" />
            </div>

            <div className="relative z-20 container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E676] via-[#FFD700] to-[#00E676] bg-[length:200%_auto] animate-gradient">
                        {t('title')}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light"
                >
                    {t('subtitle')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href="/download"
                        className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                    >
                        {t('cta_download')}
                    </Link>
                    <Link
                        href="/provider-join"
                        className="px-8 py-4 rounded-full bg-transparent border border-[#FFD700] text-[#FFD700] font-bold text-lg hover:bg-[#FFD700]/10 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                    >
                        {t('cta_provider')}
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
