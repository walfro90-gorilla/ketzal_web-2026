import { createClient } from '@/utils/supabase/server';
import { Link } from '@/navigation';
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Calendar, Star, Edit, Trash, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-4">Unauthorized</div>;
    }

    // Fetch Service Details
    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('provider_id', user.id) // Security check
        .single();

    if (!service) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href="/provider/services" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Services
                </Link>
                <div className="flex gap-2">
                    <Link
                        href={`/provider/services/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <Edit className="h-4 w-4" /> Edit
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Image & Quick Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Image */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#161616]">
                        {service.images && service.images[0] ? (
                            <Image
                                src={service.images[0]}
                                alt={service.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-600">
                                No Image Available
                            </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${service.available ? 'bg-green-500/80 text-black' : 'bg-red-500/80 text-white'
                                }`}>
                                {service.available ? 'Active' : 'Paused'}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md uppercase">
                                {service.service_type}
                            </div>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-4">{service.title}</h1>
                        <div className="prose prose-invert max-w-none text-slate-400">
                            <p>{service.description}</p>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-[#161616] border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-200 mb-4">Service Details</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</div>
                                <div className="text-sm text-slate-200 font-medium">{service.location_name || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={12} /> Duration</div>
                                <div className="text-sm text-slate-200 font-medium">{service.duration_hours ? `${service.duration_hours}h` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users size={12} /> Capacity</div>
                                <div className="text-sm text-slate-200 font-medium">{service.max_capacity ? `Max ${service.max_capacity}` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={12} /> Price</div>
                                <div className="text-sm text-[#FFD700] font-bold">${service.price_mxn} MXN</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Performance */}
                <div className="space-y-6">
                    <div className="bg-[#161616] border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-4">Performance</h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Rating</span>
                                    <span className="flex items-center gap-1 text-[#FFD700] font-bold">
                                        <Star size={14} fill="#FFD700" /> {service.rating || '0.0'}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#FFD700]" style={{ width: `${(service.rating || 0) * 20}%` }} />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{service.total_reviews || 0} reviews</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Active Bookings</span>
                                    <span className="text-slate-200 font-bold">0</span>
                                </div>
                                {/* Placeholder for bookings chart/list */}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#161616] border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Bookings</h3>
                        <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
                            No recent bookings for this service.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
