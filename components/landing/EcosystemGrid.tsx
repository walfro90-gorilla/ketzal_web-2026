'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { CreditCard, Map, Smartphone } from 'lucide-react';

const Card = ({ className, children, delay }: { className?: string, children: React.ReactNode, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className={cn(
            "relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 backdrop-blur-sm p-8 hover:border-[#00E676]/50 transition-colors group",
            className
        )}
    >
        {children}
    </motion.div>
);

export default function EcosystemGrid() {
    const t = useTranslations('Landing.Ecosystem');

    return (
        <section className="py-24 bg-[#0A0A0A] relative">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">

                    {/* Card 1: Explore (Vertical) */}
                    <Card className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]" delay={0.1}>
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512813195386-6c8113c9455f?q=80&w=2606&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative z-10 flex flex-col h-full justify-end">
                            <div className="mb-4 w-12 h-12 rounded-full bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">{t('explore')}</h3>
                        </div>
                    </Card>

                    {/* Card 2: Pay (Square) */}
                    <Card className="md:col-span-1 md:col-start-2 shadow-[0_0_30px_rgba(255,215,0,0.1)]" delay={0.2}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CreditCard size={120} className="text-[#FFD700]/10 group-hover:text-[#FFD700]/30 transition-colors transform rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-end">
                            <h3 className="text-2xl font-bold text-[#FFD700] mb-2">{t('pay')}</h3>
                        </div>
                    </Card>

                    {/* Card 3: Live (Rectangular/Map) */}
                    <Card className="md:col-span-2 md:col-start-2 md:row-start-2 bg-[#050505]" delay={0.3}>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
                        <div className="absolute right-4 top-4">
                            <Map size={48} className="text-blue-400/50" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-end">
                            <h3 className="text-3xl font-bold text-white mb-2">{t('live')}</h3>
                        </div>
                    </Card>

                </div>
            </div>
        </section>
    );
}
