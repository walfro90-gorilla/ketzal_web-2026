'use client';

import { useState } from 'react';
import { updateSiteSettings, SiteSettings } from '@/app/actions/settings';
import { Save, Loader2, Globe, Image as ImageIcon, Phone, Lock } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings | null }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const res = await updateSiteSettings(formData);

        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully' });
        }
        setIsLoading(false);
    };

    const defaultSettings: Partial<SiteSettings> = initialSettings || {
        site_name: 'Ketzal',
        maintenance_mode: false
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

            {/* General Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-primary" />
                    General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Site Name</label>
                        <input
                            name="site_name"
                            defaultValue={defaultSettings.site_name}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            placeholder="e.g. Ketzal App"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <input
                            name="site_description"
                            defaultValue={defaultSettings.site_description || ''}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            placeholder="SEO Description"
                        />
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-secondary" />
                    Branding
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Logo URL</label>
                        <div className="flex gap-4">
                            <input
                                name="logo_url"
                                defaultValue={defaultSettings.logo_url || ''}
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                                placeholder="https://..."
                            />
                            {defaultSettings.logo_url && (
                                <div className="w-10 h-10 bg-white/5 rounded-lg p-1">
                                    <img src={defaultSettings.logo_url} className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Recommended size: 200x50px transparent PNG</p>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Phone size={20} className="text-blue-400" />
                    Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Public Email</label>
                        <input
                            name="contact_email"
                            defaultValue={defaultSettings.contact_email || ''}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                            type="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Support Phone</label>
                        <input
                            name="contact_phone"
                            defaultValue={defaultSettings.contact_phone || ''}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    System Status
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Disable public access to the main site.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="maintenance_mode"
                            defaultChecked={defaultSettings.maintenance_mode}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
                {message && (
                    <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                        {message.text}
                    </span>
                )}
            </div>
        </form>
    );
}
