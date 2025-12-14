'use client';

import { useState } from 'react';
import { Search, Filter, MoreVertical, Edit, Trash, Pause, Play, Eye } from 'lucide-react';
import { Link } from '@/navigation';
import { deleteService, toggleServiceAvailability } from '@/app/actions/provider';
import { toast } from 'sonner';
import { MapPin, Clock, Users } from 'lucide-react';

interface Service {
    id: string;
    title: string;
    description: string | null;
    service_type: string;
    price_mxn: number;
    available: boolean;
    images: string[] | null;
    created_at: string;
    location_name: string | null;
    max_capacity: number | null;
    duration_hours: number | null;
}

interface ServicesGridProps {
    initialServices: Service[];
}

export default function ServicesGrid({ initialServices }: ServicesGridProps) {
    const [services, setServices] = useState(initialServices);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Filter Logic
    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || service.service_type === filterType;
        return matchesSearch && matchesType;
    });

    // Handlers
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const result = await deleteService(id);
        if (result.success) {
            setServices(current => current.filter(s => s.id !== id));
            toast.success('Service deleted successfully');
        } else {
            toast.error(result.message || 'Failed to delete');
        }
        setOpenMenuId(null);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setServices(current => current.map(s =>
            s.id === id ? { ...s, available: !currentStatus } : s
        ));

        const result = await toggleServiceAvailability(id, currentStatus);
        if (!result.success) {
            // Revert on failure
            setServices(current => current.map(s =>
                s.id === id ? { ...s, available: currentStatus } : s
            ));
            toast.error(result.message || 'Failed to update status');
        } else {
            toast.success(`Service ${currentStatus ? 'paused' : 'activated'}`);
        }
        setOpenMenuId(null);
    };

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#161616] p-4 rounded-xl border border-slate-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#0A0A0A] border border-slate-700 rounded-lg px-3 py-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent text-slate-100 text-sm focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="tour">Tours</option>
                            <option value="experience">Experiences</option>
                            <option value="lodging">Lodging</option>
                            <option value="transport">Transport</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                    <div
                        key={service.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#161616] transition-all hover:border-[#00E676]"
                    >
                        {/* Status Badge */}
                        <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold ${service.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {service.available ? 'Active' : 'Paused'}
                        </div>

                        {/* Image Placeholder */}
                        <div className="relative h-48 w-full bg-slate-800">
                            {service.images && service.images[0] ? (
                                <img src={service.images[0]} alt={service.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-600">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-md">
                                {service.service_type}
                            </div>
                        </div>

                        <div className="p-4">
                            {/* Actions Menu */}
                            <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* We can put a persistent menu button here if we want easily accessible actions without entering details */}
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-[#00E676] line-clamp-1">
                                    {service.title}
                                </h3>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === service.id ? null : service.id)}
                                        className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {openMenuId === service.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-[#0A0A0A] border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                                                <Link href={`/provider/services/${service.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-sm text-slate-200">
                                                    <Eye size={14} /> View Details
                                                </Link>
                                                <button
                                                    onClick={() => handleToggle(service.id, service.available)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-sm text-slate-200 text-left"
                                                >
                                                    {service.available ? <Pause size={14} /> : <Play size={14} />}
                                                    {service.available ? 'Pause Service' : 'Activate Service'}
                                                </button>
                                                <Link href={`/provider/services/${service.id}/edit`} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-sm text-blue-400">
                                                    <Edit size={14} /> Edit Service
                                                </Link>
                                                <div className="border-t border-slate-700 my-1" />
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-sm text-red-500 text-left"
                                                >
                                                    <Trash size={14} /> Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <p className="mb-4 text-sm text-slate-400 line-clamp-2">
                                {service.description || "No description provided."}
                            </p>

                            <div className="mb-4 space-y-2 text-sm text-slate-500">
                                {service.location_name && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{service.location_name}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    {service.duration_hours && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{service.duration_hours}h</span>
                                        </div>
                                    )}
                                    {service.max_capacity && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>Max {service.max_capacity}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                <span className="text-xl font-bold text-[#FFD700]">
                                    ${service.price_mxn} <span className="text-xs text-slate-500 font-normal">MXN</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {!filteredServices.length && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-[#161616] rounded-xl border border-slate-800 border-dashed">
                        <p>No services found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
