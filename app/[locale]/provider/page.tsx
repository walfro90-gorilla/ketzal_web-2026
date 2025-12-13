import { createClient } from '@/utils/supabase/server';
import { DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';

// Assuming we don't have Card components yet based on file list, I'll inline styles for reliable first pass.

export default async function ProviderDashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // Ideally redirect, but for render test assume handled by middleware or return empty
        return <div className="p-4">Please log in.</div>;
    }

    // 1. Get Wallet Balance
    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, currency_code')
        .eq('user_id', user.id)
        .single() as any; // Cast result or just assume for now, better to cast data usage.

    // 2. Get Services Count & Avg Rating (Manual calc if not in profile)
    const { data: services, count: servicesCount } = await supabase
        .from('services')
        .select('rating', { count: 'exact' })
        .eq('provider_id', user.id);

    const avgRating = services && services.length > 0
        ? (services.reduce((acc, curr: any) => acc + (curr.rating || 0), 0) / services.length).toFixed(1)
        : '0.0';

    // 3. Get Pending Bookings
    // We need to join bookings on services where service.provider_id is current user
    // This is a complex query for Supabase client directly without join via foreign key on list potentially
    // But wait, bookings have service_id. services have provider_id.
    // We can select bookings, inner join services.
    const { count: pendingBookingsCount } = await supabase
        .from('bookings')
        .select('*, services!inner(provider_id)', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('services.provider_id', user.id);

    // 4. Total Sales (sum of completed bookings or wallet logs)
    // Let's use wallet balance as main financal metric for now.

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Balance */}
                <div className="rounded-xl border border-slate-800 bg-[#161616] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Total Balance</h3>
                        <DollarSign className="h-4 w-4 text-[#FFD700]" />
                    </div>
                    <div className="p-0 pt-2">
                        <div className="text-2xl font-bold text-slate-100">
                            {wallet?.balance ?? '0.00'} {wallet?.currency_code ?? 'AXO'}
                        </div>
                        <p className="text-xs text-slate-500">+20.1% from last month</p>
                    </div>
                </div>

                {/* Pending Bookings */}
                <div className="rounded-xl border border-slate-800 bg-[#161616] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Pending Bookings</h3>
                        <Calendar className="h-4 w-4 text-[#00E676]" />
                    </div>
                    <div className="p-0 pt-2">
                        <div className="text-2xl font-bold text-slate-100">{pendingBookingsCount ?? 0}</div>
                        <p className="text-xs text-slate-500">Requires attention</p>
                    </div>
                </div>

                {/* Active Services */}
                <div className="rounded-xl border border-slate-800 bg-[#161616] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Active Services</h3>
                        <Star className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="p-0 pt-2">
                        <div className="text-2xl font-bold text-slate-100">{servicesCount ?? 0}</div>
                        <p className="text-xs text-slate-500">{avgRating} Avg. Rating</p>
                    </div>
                </div>
                {/* Total Sales (Mock for now or derive) */}
                <div className="rounded-xl border border-slate-800 bg-[#161616] p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-slate-400">Total Revenue</h3>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="p-0 pt-2">
                        <div className="text-2xl font-bold text-slate-100">$0.00</div>
                        <p className="text-xs text-slate-500">lifetime</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-slate-800 bg-[#161616] p-6">
                    <h3 className="font-semibold text-slate-100 mb-4">Overview</h3>
                    <div className="h-[200px] w-full bg-slate-800/20 rounded flex items-center justify-center text-slate-500">
                        Chart Placeholder
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-slate-800 bg-[#161616] p-6">
                    <h3 className="font-semibold text-slate-100 mb-4">Recent Sales</h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none text-slate-200">Olivia Martin</p>
                                <p className="text-sm text-slate-500">olivia.martin@email.com</p>
                            </div>
                            <div className="ml-auto font-medium text-slate-100">+$1,999.00</div>
                        </div>
                        {/* Repeat items if needed */}
                        <div className="text-sm text-slate-500 text-center pt-4">No recent sales found</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
