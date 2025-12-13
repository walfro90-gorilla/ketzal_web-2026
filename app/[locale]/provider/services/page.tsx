import { createClient } from '@/utils/supabase/server';
import { Link } from '@/navigation';
import { Plus, MapPin, Clock, Users } from 'lucide-react';
import Image from 'next/image';

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-4">Please log in.</div>;
    }

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-100">My Services</h1>
                <Link
                    href="/provider/services/new"
                    className="flex items-center gap-2 rounded-lg bg-[#00E676] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00c865] transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Service
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services?.map((service: any) => (
                    <div
                        key={service.id}
                        className="group overflow-hidden rounded-xl border border-slate-800 bg-[#161616] transition-all hover:border-[#00E676]"
                    >
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
                            <h3 className="mb-2 text-lg font-bold text-slate-100 group-hover:text-[#00E676]">
                                {service.title}
                            </h3>
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
                                <div className={`h-2 w-2 rounded-full ${service.available ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                        </div>
                    </div>
                ))}

                {!services?.length && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-[#161616] rounded-xl border border-slate-800 border-dashed">
                        <p>No services found. Create your first service!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
