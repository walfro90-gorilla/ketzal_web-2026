import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import EditServiceForm from '@/components/provider/EditServiceForm';

export default async function EditServicePage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-4">Unauthorized</div>;
    }

    // Fetch existing service data
    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('provider_id', user.id)
        .single();

    if (!service) {
        notFound();
    }

    return <EditServiceForm service={service} locale={locale} />;
}
