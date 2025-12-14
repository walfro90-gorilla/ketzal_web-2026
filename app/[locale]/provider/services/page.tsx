import { createClient } from '@/utils/supabase/server';
import { Link } from '@/navigation';
import { Plus } from 'lucide-react';
import ServicesGrid from '@/components/provider/ServicesGrid';

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-4">Please log in.</div>;
    }

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-100">My Services</h1>
                <Link
                    href="/provider/services/new"
                    className="flex items-center gap-2 rounded-lg bg-[#00E676] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00c865] transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Service
                </Link>
            </div>

            <ServicesGrid initialServices={services || []} />
        </div>
    );
}
