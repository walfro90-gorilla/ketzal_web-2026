import { createClient } from '@/utils/supabase/server';
import { updateBookingStatus } from '@/app/actions/provider';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default async function BookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-4">Please log in.</div>;
    }

    // Fetch bookings for services owned by user.
    // Join bookings -> services (filter by provider_id) -> profiles (traveler)
    // Since supabase client join syntax is specific:
    // select *, services!inner(*), profiles:user_id(*)

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
        *,
        services!inner (
           title,
           provider_id
        ),
        profiles:user_id (
           full_name,
           username,
           avatar_url
        )
    `)
        .eq('services.provider_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-100">Bookings Management</h1>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#161616] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0A0A0A] text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Guest</th>
                                <th className="px-6 py-4 font-medium">Service</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Total Price</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {bookings?.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden">
                                                {booking.profiles?.avatar_url ? (
                                                    <img src={booking.profiles.avatar_url} alt="Ava" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                        {booking.profiles?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{booking.profiles?.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500">@{booking.profiles?.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {booking.services?.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`
                             inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                             ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                                                booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'}
                         `}>
                                            {booking.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-200">
                                        ${booking.total_price}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <form action={async (formData) => {
                                                        'use server';
                                                        await updateBookingStatus(formData);
                                                    }}>
                                                        <input type="hidden" name="bookingId" value={booking.id} />
                                                        <input type="hidden" name="status" value="confirmed" />
                                                        <button className="rounded px-2 py-1 text-xs font-bold text-green-500 hover:bg-green-500/10 transition-colors">
                                                            Accept
                                                        </button>
                                                    </form>
                                                    <form action={async (formData) => {
                                                        'use server';
                                                        await updateBookingStatus(formData);
                                                    }}>
                                                        <input type="hidden" name="bookingId" value={booking.id} />
                                                        <input type="hidden" name="status" value="cancelled" />
                                                        <button className="rounded px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                                                            Reject
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                            {booking.status !== 'pending' && (
                                                <span className="text-xs text-slate-500 capitalize">{booking.status}</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!bookings?.length && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
