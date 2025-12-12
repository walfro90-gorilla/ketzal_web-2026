import { createClient } from '@/utils/supabase/server';
import UsersTable from '@/components/admin/UsersTable';
import CreateUserButton from '@/components/admin/CreateUserButton';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // 1. Data Fetching
    const supabase = await createClient();
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching profiles:", error);
        // In a real app, handle error UI
    }

    // 2. Translations (Server-side)
    const t = await getTranslations('Sidebar');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('users')}
                    </h1>
                    <p className="text-gray-400 mt-1">Manage platform access and roles.</p>
                </div>

                {/* Actions like "Export CSV" or "Invite User" could go here */}
                {/* Create User Button with Modal */}
                <CreateUserButton />
            </div>

            <UsersTable initialUsers={profiles || []} />
        </div>
    );
}
