'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/utils/supabase/admin';

export async function processTransaction(
    walletId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    description: string = ''
) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Check administrative permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') return { error: "Insufficient permissions" };

    if (amount <= 0) return { error: "Amount must be positive" };

    // 1. Get current wallet balance to validation (especially for withdrawal)
    // Use adminSupabase to bypass RLS
    const result = await adminSupabase
        .from('wallets')
        .select('balance, user_id')
        .eq('id', walletId)
        .single();
    const { data: wallet, error: walletFetchError } = result as { data: any, error: any };

    if (walletFetchError || !wallet) {
        return { error: "Wallet not found" };
    }

    if (type === 'withdrawal' && wallet.balance < amount) {
        return { error: "Insufficient funds" };
    }

    // 2. Perform Transaction Record
    const { error: txError } = await (adminSupabase.from('transactions') as any).insert({
        wallet_id: walletId,
        amount: amount,
        type: type,
        description: description || `Admin ${type}: ${amount} AXO`,
        // reference_id can be admin user id or something
    });

    if (txError) {
        return { error: "Failed to record transaction: " + txError.message };
    }

    // 3. Update Wallet Balance
    // NOTE: In a real banking system, use RPC or protected transaction block slightly differently.
    // For MVP, simplistic update is acceptable given specific Admin role constraint.

    const newBalance = type === 'deposit'
        ? Number(wallet.balance) + Number(amount)
        : Number(wallet.balance) - Number(amount);

    const { error: updateError } = await (adminSupabase
        .from('wallets') as any)
        .update({ balance: newBalance })
        .eq('id', walletId);

    if (updateError) {
        // Rollback transaction? Or simplified error handling for now. 
        // Ideally we would want to wrap this in a postgres function for atomicity.
        return { error: "Failed to update wallet balance: " + updateError.message };
    }

    revalidatePath('/admin/finances');
    return { success: true };
}
