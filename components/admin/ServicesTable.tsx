'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { CheckCircle, XCircle, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicesTableProps {
    initialServices: Service[];
    // Actions could be passed down or handled via Server Actions imported directly
}

export default function ServicesTable({ initialServices }: ServicesTableProps) {
    const t = useTranslations('Dashboard.servicesTable');
    const [services, setServices] = useState(initialServices);

    // Mock handler for now - real implementation would call Server Action
    const handleApprove = (id: string) => {
        console.log("Approve", id);
        // Optimistic update
        setServices(services.map(s => s.id === id ? { ...s, available: true } : s));
    };

    const handleReject = (id: string) => {
        console.log("Reject", id);
        // Optimistic update (remove or mark rejected)
        setServices(services.filter(s => s.id !== id));
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">{t('title')}</th>
                            <th className="px-6 py-4">{t('price')}</th>
                            <th className="px-6 py-4">{t('status')}</th>
                            <th className="px-6 py-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {services.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No pending services. All caught up!
                                </td>
                            </tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-white">{service.title}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MapPin size={12} />
                                                {service.location_name || 'Remote'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-primary">
                                            <DollarSign size={14} />
                                            <span className="font-bold">{service.price_mxn}</span>
                                            <span className="text-xs text-gray-500 ml-1">MXN</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.available
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {service.available ? 'Live' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleReject(service.id)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                title={t('reject')}
                                            >
                                                <XCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(service.id)}
                                                className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-black transition-colors"
                                                title={t('approve')}
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
