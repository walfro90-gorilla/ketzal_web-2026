import { createClient } from '@/utils/supabase/server';
import DestinationsTable from '@/components/admin/DestinationsTable';
import { getTranslations } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { createDestination } from '@/app/actions/destinations';

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();
    const t = await getTranslations('Sidebar');
    const tTable = await getTranslations('Dashboard.destinationsTable');

    const { data: destinations, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching destinations:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('destinations')}
                    </h1>
                    <p className="text-gray-400 mt-1">Manage global travel locations.</p>
                </div>

                {/* Simple Create Trigger - In Real App, this opens a modal */}
                <form action={async (formData) => {
                    "use server";
                    await createDestination(formData);
                }} className="flex gap-2">
                    <input type="hidden" name="name" value="Tulum, Mexico" />
                    <input type="hidden" name="slug" value="tulum" />
                    <button type="submit" className="bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2">
                        <Plus size={16} />
                        {tTable('create')} (Demo)
                    </button>
                </form>
            </div>

            <DestinationsTable initialDestinations={destinations || []} />
        </div>
    );
}
