import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Plane, MapPin, Ticket } from 'lucide-react';

export default async function TravelerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">My Travels</h1>
                <p className="text-muted-foreground">Ready for your next adventure, {user.email}?</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for upcoming trip */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden group">
                    <div className="h-48 bg-gray-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                            <h3 className="text-white font-bold text-xl">Tulum, Mexico</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Dec 24 - Jan 2</span>
                        </div>
                        <button className="w-full py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
                            View Itinerary
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center space-y-4">
                    <h3 className="font-semibold">Travel Stats</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-full text-blue-500"><Plane size={20} /></div>
                            <span className="text-sm">Trips Taken</span>
                        </div>
                        <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-full text-orange-500"><MapPin size={20} /></div>
                            <span className="text-sm">Countries</span>
                        </div>
                        <span className="font-bold">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-500/10 rounded-full text-purple-500"><Ticket size={20} /></div>
                            <span className="text-sm">Upcoming</span>
                        </div>
                        <span className="font-bold">1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    )
}
