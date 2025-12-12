import { createClient } from '@/utils/supabase/server';
import ServicesTable from '@/components/admin/ServicesTable';
import { getTranslations } from 'next-intl/server';

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    // Fetch pending services
    const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching services:", error);
    }

    const t = await getTranslations('Sidebar');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('services_moderation')}
                    </h1>
                    <p className="text-gray-400 mt-1">Review and approve provider experiences.</p>
                </div>
            </div>

            <ServicesTable initialServices={services || []} />
        </div>
    );
}
