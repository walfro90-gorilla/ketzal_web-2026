import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Share2, TrendingUp, Users } from 'lucide-react';

export default async function AmbassadorPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Ambassador Portal</h1>
                <p className="text-muted-foreground">Welcome back, {user.email}</p>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Rewards</h3>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">2,450 AXXO</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Network Size</h3>
                        <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">Active members</p>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Referral Link</h3>
                        <Share2 className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-sm font-mono bg-muted p-1 rounded mt-1 truncate">
                        ketzal.app/invite/{user.id.slice(0, 8)}
                    </div>
                </div>
            </div>
        </div>
    );
}
