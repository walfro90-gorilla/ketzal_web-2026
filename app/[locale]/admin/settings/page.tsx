import { getSiteSettings } from '@/app/actions/settings';
import SettingsForm from '@/components/admin/SettingsForm';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
    const settings = await getSiteSettings();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Settings size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
                    <p className="text-gray-400">Manage global configurations for the app and website.</p>
                </div>
            </div>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
