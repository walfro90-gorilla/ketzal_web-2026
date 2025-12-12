'use client';

import { createService } from '@/app/actions/provider';
import { useActionState } from 'react'; // React 19
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';

const SERVICE_TYPES = [
    { value: 'tour', label: 'Guided Tour' },
    { value: 'activity', label: 'Activity & Experience' },
    { value: 'lodging', label: 'Lodging / Stay' },
    { value: 'transport', label: 'Transportation' },
];

const initialState = {
    message: '',
};

export default function NewServicePage() {
    const [state, formAction, isPending] = useActionState(createService, initialState);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/provider/services" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-100">Create New Service</h1>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#161616] p-6">
                <form action={formAction} className="space-y-6">

                    {state?.message && (
                        <div className="p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-slate-300">Service Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                            placeholder="e.g. Magical Sunset Hike"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={4}
                            className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                            placeholder="Describe what makes this experience unique..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="service_type" className="text-sm font-medium text-slate-300">Service Type</label>
                            <select
                                id="service_type"
                                name="service_type" // Should match action get('service_type')
                                required
                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                            >
                                <option value="" disabled selected>Select a type</option>
                                {SERVICE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium text-slate-300">Price (MXN)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500">$</span>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] pl-7 pr-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="location_name" className="text-sm font-medium text-slate-300">Location Name</label>
                        <input
                            type="text"
                            id="location_name"
                            name="location_name"
                            required
                            className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                            placeholder="e.g. Zona Arqueológica de Tulum"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="max_capacity" className="text-sm font-medium text-slate-300">Max Capacity</label>
                            <input
                                type="number"
                                id="max_capacity"
                                name="max_capacity"
                                min="1"
                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                                placeholder="e.g. 10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="duration_hours" className="text-sm font-medium text-slate-300">Duration (Hours)</label>
                            <input
                                type="number"
                                id="duration_hours"
                                name="duration_hours"
                                min="1"
                                className="w-full rounded-md border border-slate-700 bg-[#0A0A0A] px-3 py-2 text-sm text-slate-100 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676]"
                                placeholder="e.g. 2"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 rounded-lg bg-[#00E676] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#00c865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Service'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
