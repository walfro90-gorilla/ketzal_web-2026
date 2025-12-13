'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processTransaction(
    walletId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    description: string = ''
) {
    const supabase = await createClient();

    // Check administrative permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'admin') return { error: "Insufficient permissions" };

    if (amount <= 0) return { error: "Amount must be positive" };

    // 1. Get current wallet balance to validation (especially for withdrawal)
    const result = await supabase
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
    const { error: txError } = await (supabase.from('transactions') as any).insert({
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
        ? wallet.balance + amount
        : wallet.balance - amount;

    const { error: updateError } = await (supabase
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
