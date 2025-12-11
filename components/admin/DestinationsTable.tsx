'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { MapPin, Plus, Trash, Edit, Globe } from 'lucide-react';
import { deleteDestination, createDestination } from '@/app/actions/destinations';
import { toast } from 'sonner';

type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationsTableProps {
    initialDestinations: Destination[];
}

export default function DestinationsTable({ initialDestinations }: DestinationsTableProps) {
    const t = useTranslations('Dashboard.destinationsTable');

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const res = await deleteDestination(id);
        if (res.error) {
            alert('Error deleting');
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Simple Create Form inline for speed, or a modal ideally. Using a simple detail/summary or just a separate page link is cleaner. 
            For this task, I'll put a placeholder 'New' button that could toggle a form.
        */}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">{t('name')}</th>
                            <th className="px-6 py-4">{t('location')}</th>
                            <th className="px-6 py-4">{t('stats')}</th>
                            <th className="px-6 py-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {initialDestinations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No destinations found.
                                </td>
                            </tr>
                        ) : (
                            initialDestinations.map((dest) => (
                                <tr key={dest.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                                                <Globe size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{dest.name}</p>
                                                <p className="text-xs text-gray-500">/{dest.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <MapPin size={14} />
                                            <span>{dest.city || dest.country || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-4 text-xs">
                                            <span title="Posts">📸 {dest.posts_count || 0}</span>
                                            <span title="Views">👁️ {dest.views_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dest.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
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
    );
}
