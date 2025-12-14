'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { MapPin, Trash, Edit, Globe, Search, ArrowUpDown, Eye, Camera, Loader2 } from 'lucide-react';
import { deleteDestination } from '@/app/actions/destinations';
import { useState, useMemo } from 'react';
import ServiceMiniMap from './ServiceMiniMap';

type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationsTableProps {
    initialDestinations: Destination[];
}

export default function DestinationsTable({ initialDestinations }: DestinationsTableProps) {
    const t = useTranslations('Dashboard.destinationsTable');
    const [destinations, setDestinations] = useState(initialDestinations);

    // Search & Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'popular' | 'newest'>('name');

    // Minimap Hover State
    const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this destination?')) return;
        const res = await deleteDestination(id);
        if (res.error) {
            alert('Error deleting destination');
        } else {
            setDestinations(destinations.filter(d => d.id !== id));
        }
    };

    // Filter & Sort Logic
    const filteredDestinations = useMemo(() => {
        let result = [...destinations];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(dest =>
                dest.name.toLowerCase().includes(query) ||
                dest.slug.toLowerCase().includes(query) ||
                (dest.city && dest.city.toLowerCase().includes(query)) ||
                (dest.country && dest.country.toLowerCase().includes(query))
            );
        }

        // Sort
        if (sortBy === 'popular') {
            result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        } else {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [destinations, searchQuery, sortBy]);

    // Hover Handlers
    const handleLocationEnter = (e: React.MouseEvent, lat: number, lng: number) => {
        setHoveredCoords({ lat, lng });
        setMousePos({ x: e.clientX, y: e.clientY });
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
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card border border-border p-4 rounded-xl">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search destinations, cities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg p-1">
                    <button
                        onClick={() => setSortBy('name')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === 'name' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Name
                    </button>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === 'popular' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Popular
                    </button>
                    <button
                        onClick={() => setSortBy('newest')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === 'newest' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Newest
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase font-medium border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4">{t('name')}</th>
                                <th className="px-6 py-4">{t('location')}</th>
                                <th className="px-6 py-4">{t('stats')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredDestinations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                                <Globe size={24} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-white">No destinations found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDestinations.map((dest) => (
                                    <tr key={dest.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                                                    <Globe size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white group-hover:text-primary transition-colors">{dest.name}</p>
                                                    <p className="text-xs text-gray-500">/{dest.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-help w-fit"
                                                onMouseEnter={(e) => handleLocationEnter(e, dest.latitude, dest.longitude)}
                                                onMouseLeave={handleLocationLeave}
                                                onMouseMove={handleMouseMove}
                                            >
                                                <MapPin size={14} className="text-primary" />
                                                <span>{dest.city || dest.country || 'Unknown Location'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                                                <div className="flex items-center gap-1.5" title="Total Posts">
                                                    <Camera size={14} />
                                                    <span>{dest.posts_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Total Views">
                                                    <Eye size={14} />
                                                    <span>{dest.views_count || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors hover:text-white">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dest.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash size={16} />
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

            {/* Floating Map Preview */}
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
