import { createClient } from '@/utils/supabase/server';
import WalletsTable from '@/components/admin/WalletsTable';
import { getTranslations } from 'next-intl/server';
import { Database } from '@/types/database.types';

export default async function FinancesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();
    const t = await getTranslations('Sidebar');

    // Fetch wallets with profile info
    const { data: wallets, error } = await supabase
        .from('wallets')
        .select(`
      *,
      profiles (
        full_name,
        username
      )
    `)
        .order('balance', { ascending: false });

    if (error) {
        console.error("Error fetching wallets:", error);
    }

    // Type assertion since the join returns a complex object structure
    // that aligns with our props but TS might need help inferring the deeply nested join
    const formattedWallets = (wallets as any[]) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {t('finances')}
                    </h1>
                    <p className="text-gray-400 mt-1">Central Bank & Wallet Management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/20">
                    <p className="text-secondary text-sm font-medium uppercase tracking-wider">Total Circulation</p>
                    <h3 className="text-4xl font-black text-white mt-2">
                        {(formattedWallets.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0) as number).toLocaleString()}
                        <span className="text-lg text-secondary ml-2">AXO</span>
                    </h3>
                </div>
            </div>

            <WalletsTable initialWallets={formattedWallets} />
        </div>
    );
}
