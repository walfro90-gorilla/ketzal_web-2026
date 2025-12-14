'use client';

import { updateService } from '@/app/actions/provider';
import { useActionState, useState } from 'react';
import { ArrowLeft, Loader2, Sparkles, MapPin, DollarSign, Users, Clock, Edit } from 'lucide-react';
import { Link } from '@/navigation';
import { useParams } from 'next/navigation';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import FileUpload from '@/components/FileUpload';

const SERVICE_TYPES = [
    { value: 'tour', label: 'Guided Tour', description: 'Led by a guide' },
    { value: 'experience', label: 'Activity & Experience', description: 'Hands-on workshop or activity' },
    { value: 'lodging', label: 'Lodging / Stay', description: 'Short term rental' },
    { value: 'transport', label: 'Transportation', description: 'Private transfer services' },
];

const initialState = {
    message: '',
};

interface EditServiceFormProps {
    service: any;
    locale: string;
}

export default function EditServiceForm({ service, locale }: EditServiceFormProps) {
    const [state, formAction, isPending] = useActionState(updateService, initialState);

    // Initialize state with existing data
    const [location, setLocation] = useState<{ name: string; place_id: string; lat: number; lng: number; address: string } | null>({
        name: service.location_name || '',
        place_id: service.location_place_id || '',
        lat: service.location_coords?.lat || 0,
        lng: service.location_coords?.lng || 0,
        address: service.location_address || ''
    });

    const [imageUrl, setImageUrl] = useState(service.images?.[0] || '');

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/provider/services" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                        Edit Service <Edit className="h-5 w-5 text-blue-400" />
                    </h1>
                    <p className="text-slate-400 text-sm">Update your listing details.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-slate-800 bg-[#161616] p-8 shadow-2xl">
                        <form action={formAction} className="space-y-8">
                            {state?.message && (
                                <div className="p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                    {state.message}
                                </div>
                            )}

                            <input type="hidden" name="id" value={service.id} />

                            {/* Hidden Geography Fields */}
                            <input type="hidden" name="latitude" value={location?.lat || ''} />
                            <input type="hidden" name="longitude" value={location?.lng || ''} />
                            <input type="hidden" name="location_place_id" value={location?.place_id || ''} />
                            <input type="hidden" name="location_name" value={location?.name || ''} />
                            <input type="hidden" name="location_address" value={location?.address || ''} />
                            {/* Pass Locale for Redirect */}
                            <input type="hidden" name="locale" value={locale} />

                            {/* Section: Basic Details */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Basic Details</h2>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium text-slate-300">Service Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        defaultValue={service.title}
                                        className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                                        placeholder="e.g. Magical Sunset Hike in Tepozteco"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-slate-300">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={5}
                                        defaultValue={service.description}
                                        className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all resize-none"
                                        placeholder="Describe what makes this experience unique..."
                                    />
                                </div>
                            </div>

                            {/* Section: Type & Location */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Type & Location</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="service_type" className="text-sm font-medium text-slate-300">Service Type</label>
                                        <div className="relative">
                                            <select
                                                id="service_type"
                                                name="service_type"
                                                required
                                                defaultValue={service.service_type}
                                                className="w-full appearance-none rounded-md border border-slate-700 bg-[#0A0A0A] px-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                                            >
                                                <option value="" disabled>Select a type</option>
                                                {SERVICE_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Location (City)</label>
                                        <LocationAutocomplete
                                            onSelect={setLocation}
                                            className="w-full"
                                            defaultValue={service.location_name}
                                        />
                                        {location && location.name ? (
                                            <p className="text-xs text-[#00E676] flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Selected: {location.name}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500">Search for a city or region.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Logistics */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Logistics & Pricing</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="price" className="text-sm font-medium text-slate-300">Price (MXN)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                required
                                                min="0"
                                                step="0.01"
                                                defaultValue={service.price_mxn}
                                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] pl-9 pr-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="max_capacity" className="text-sm font-medium text-slate-300">Max Capacity</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <input
                                                type="number"
                                                id="max_capacity"
                                                name="max_capacity"
                                                min="1"
                                                defaultValue={service.max_capacity}
                                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] pl-9 pr-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                                                placeholder="e.g. 10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="duration_hours" className="text-sm font-medium text-slate-300">Duration (Hours)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <input
                                                type="number"
                                                id="duration_hours"
                                                name="duration_hours"
                                                min="0.5"
                                                step="0.5"
                                                defaultValue={service.duration_hours}
                                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] pl-9 pr-4 py-3 text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] transition-all"
                                                placeholder="e.g. 2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Media */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Media</h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Main Image</label>
                                    <FileUpload onUploadComplete={(url) => setImageUrl(url)} defaultValue={imageUrl} />
                                    <input type="hidden" name="image_url" value={imageUrl} />
                                </div>
                            </div>


                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-800">
                                <Link
                                    href="/provider/services"
                                    className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-xl border border-slate-800 bg-[#161616] p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Service ID</h3>
                        <code className="block bg-black/50 p-2 rounded text-xs text-slate-500 font-mono break-all mb-4">
                            {service.id}
                        </code>

                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Status</h3>
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${service.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                            {service.available ? 'Active & Visible' : 'Paused / Hidden'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
