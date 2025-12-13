'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AxoCoinSection() {
    const t = useTranslations('Landing.Axocoins');

    return (
        <section className="py-32 bg-black flex flex-col items-center justify-center overflow-hidden">
            <div className="container mx-auto px-4 text-center">

                {/* 3D Coin Animation Container */}
                <div className="relative w-64 h-64 mx-auto mb-16 perspective-1000">
                    <motion.div
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full relative preserve-3d"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front of Coin */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] border-4 border-[#FFD700] flex items-center justify-center backface-hidden shadow-[0_0_50px_rgba(255,215,0,0.4)]">
                            <span className="text-6xl font-black text-[#B8860B]">A</span>
                        </div>
                        {/* Back of Coin */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] border-4 border-[#FFD700] flex items-center justify-center backface-hidden shadow-[0_0_50px_rgba(255,215,0,0.4)]" style={{ transform: 'rotateY(180deg)' }}>
                            <span className="text-4xl font-black text-[#B8860B]">KETZAL</span>
                        </div>
                    </motion.div>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    {t('title')}
                </h2>
                <p className="text-xl text-gray-400">
                    {t('subtitle')}
                </p>

            </div>
        </section>
    );
}
