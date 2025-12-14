'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { CheckCircle, XCircle, MapPin, DollarSign, Search, Filter, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import ServiceMiniMap from './ServiceMiniMap';

type Service = Database['public']['Tables']['services']['Row'];

interface ServicesTableProps {
    initialServices: Service[];
}

export default function ServicesTable({ initialServices }: ServicesTableProps) {
    const t = useTranslations('Dashboard.servicesTable');
    const [services, setServices] = useState(initialServices);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'unavailable'>('all');

    // Minimap Hover State
    const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Mock handler for now
    const handleApprove = (id: string) => {
        setServices(services.map(s => s.id === id ? { ...s, available: true } : s));
    };

    const handleReject = (id: string) => {
        setServices(services.map(s => s.id === id ? { ...s, available: false } : s));
    };

    // Filter Logic
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch =
                service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (service.location_name || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                filterStatus === 'all' ? true :
                    filterStatus === 'live' ? service.available :
                        !service.available;

            return matchesSearch && matchesFilter;
        });
    }, [services, searchQuery, filterStatus]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const handleLocationEnter = (e: React.MouseEvent, coords: any) => {
        if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
            setHoveredCoords({ lat: coords.lat, lng: coords.lng });
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleLocationLeave = () => {
        setHoveredCoords(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (hoveredCoords) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card border border-border p-4 rounded-xl">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search services or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg p-1">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('live')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'live' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Live
                    </button>
                    <button
                        onClick={() => setFilterStatus('unavailable')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'unavailable' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Unavailable
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase font-medium border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">{t('title')}</th>
                                <th className="px-6 py-4">{t('price')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                                <Search size={24} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-white">No services found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-white">{service.title}</p>
                                                <div
                                                    className="flex items-center gap-1 text-xs text-gray-500 mt-1 cursor-help w-fit hover:text-primary transition-colors duration-200"
                                                    onMouseEnter={(e) => handleLocationEnter(e, service.location_coords)}
                                                    onMouseLeave={handleLocationLeave}
                                                    onMouseMove={handleMouseMove}
                                                >
                                                    <MapPin size={12} />
                                                    {service.location_name || 'Remote'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white/80">
                                            {formatCurrency(service.price_mxn)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${service.available
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {service.available ? 'Live' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleReject(service.id)}
                                                    className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                                                    title={t('reject')}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(service.id)}
                                                    className="p-2 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded-lg transition-all"
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

            {/* Floating Mini Map */}
            {hoveredCoords && (
                <div
                    className="fixed z-50 pointer-events-none transition-opacity duration-200"
                    style={{
                        left: mousePos.x + 20,
                        top: mousePos.y - 100
                    }}
                >
                    <ServiceMiniMap lat={hoveredCoords.lat} lng={hoveredCoords.lng} />
                </div>
            )}
        </div>
    );
}
