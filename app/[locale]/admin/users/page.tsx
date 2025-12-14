import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import UsersTable from '@/components/admin/UsersTable';
import CreateUserButton from '@/components/admin/CreateUserButton';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // 1. Data Fetching
    // 1. Data Fetching
    const supabaseAdmin = createAdminClient();

    // Fetch Profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch Auth Users to get emails
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000
    });

    if (profilesError || authError) {
        console.error("Error fetching users data:", profilesError || authError);
    }

    // Merge profiles with emails
    const usersWithEmail = profiles?.map(profile => {
        const authUser = authUsers?.find(u => u.id === profile.id);
        return {
            ...profile,
            email: authUser?.email || null
        };
    }) || [];

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

                {/* Create User Button with Modal */}
                <CreateUserButton />
            </div>

            <UsersTable initialUsers={usersWithEmail} />
        </div>
    );
}
