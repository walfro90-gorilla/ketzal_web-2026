'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// Fetch stats to show in the "Delete User" modal
export async function getUserDeletionStats(userId: string) {
    const supabaseAdmin = createAdminClient();

    // 1. Wallet Balance
    const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('balance, currency_code')
        .eq('user_id', userId)
        .single();

    // 2. Services Count
    const { count: servicesCount } = await supabaseAdmin
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', userId);

    // 3. Active Bookings as Provider (Bookings on their services)
    // We need to find services first, then bookings.
    const { data: services } = await supabaseAdmin
        .from('services')
        .select('id')
        .eq('provider_id', userId);

    let activeBookingsAsProvider = 0;

    if (services && services.length > 0) {
        const serviceIds = services.map(s => s.id);
        const { count } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .in('service_id', serviceIds)
            .in('status', ['pending', 'confirmed']);

        activeBookingsAsProvider = count || 0;
    }

    // 4. Bookings as Traveler (history)
    const { count: travelerBookings } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // 5. Active Posts
    const { count: postsCount } = await supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    return {
        walletBalance: wallet?.balance || 0,
        currency: wallet?.currency_code || 'MXN',
        servicesCount: servicesCount || 0,
        activeBookingsAsProvider,
        travelerBookingsCount: travelerBookings || 0,
        postsCount: postsCount || 0,
        canDelete: activeBookingsAsProvider === 0
    };
}


export async function createUser(formData: FormData) {
    const supabaseAdmin = createAdminClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('full_name') as string;
    const role = formData.get('role') as 'traveler' | 'provider' | 'admin' | 'ambassador';
    const username = formData.get('username') as string;

    if (!email || !password || !username) {
        return { error: "Email, Password, and Username are required" };
    }

    // 1. Create User in Auth (Auto-confirmed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for instant access
        user_metadata: {
            full_name: fullName,
            username: username,
            role: role // Critical for trigger to assign correct role
        }
    });

    if (authError) {
        console.error("Auth Creation Error:", authError);
        return { error: authError.message };
    }

    // 2. Triggers should handle Profile/Wallet creation. 
    // We optionally update here just to be safe or update non-trigger fields if needed.
    if (authData.user) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                role: role,
                username: username,
                full_name: fullName,
            })
            .eq('id', authData.user.id);

        if (profileError) {
            console.error("Profile Update Error:", profileError);
        }
    }

    revalidatePath('/admin/users');
    return { success: true };
}


export async function deleteUser(userId: string) {
    const supabaseAdmin = createAdminClient();

    console.log(`[Admin] Deleting user ${userId}...`);

    // --- Safety Check ---
    // Administrators cannot delete users with ACTIVE bookings on their services (commitments)
    const stats = await getUserDeletionStats(userId);
    if (!stats.canDelete) {
        return { error: `Cannot delete user: They have ${stats.activeBookingsAsProvider} active bookings on their services. Please cancel or complete them first.` };
    }

    // --- 1. POSTS & INTERACTIONS ---
    console.log(`[Admin] Cleaning up posts and interactions for ${userId}...`);
    // Delete Interactions BY the user
    await supabaseAdmin.from('post_likes').delete().eq('user_id', userId);
    await supabaseAdmin.from('post_comments').delete().eq('user_id', userId);
    await supabaseAdmin.from('service_reviews').delete().eq('user_id', userId);

    // Fetch user's posts to clean UP interactions ON them
    const { data: userPosts } = await supabaseAdmin.from('posts').select('id').eq('user_id', userId);
    if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map(p => p.id);
        // Delete comments/likes ON these posts
        await supabaseAdmin.from('post_comments').delete().in('post_id', postIds);
        await supabaseAdmin.from('post_likes').delete().in('post_id', postIds);
        // Delete the posts themselves
        const { error: postsError } = await supabaseAdmin.from('posts').delete().eq('user_id', userId);
        if (postsError) return { error: `Failed to delete posts: ${postsError.message}` };
    }


    // --- 2. BOOKINGS & SERVICES ---
    console.log(`[Admin] Cleaning up bookings and services for ${userId}...`);

    // Delete Bookings MADE BY the user (Traveler History)
    await supabaseAdmin.from('bookings').delete().eq('user_id', userId);

    // Handle Provider Data (Services)
    const { data: services } = await supabaseAdmin.from('services').select('id').eq('provider_id', userId);
    if (services && services.length > 0) {
        const serviceIds = services.map(s => s.id);

        // Delete Bookings ON these services (We checked they aren't active, safe to delete history)
        await supabaseAdmin.from('bookings').delete().in('service_id', serviceIds);

        // Delete Reviews ON these services
        await supabaseAdmin.from('service_reviews').delete().in('service_id', serviceIds);

        // Unlink any posts referencing these services (to prevent FK error)
        await supabaseAdmin.from('posts').update({ linked_service_id: null } as any).in('linked_service_id', serviceIds);

        // Delete the Services
        const { error: servicesError } = await supabaseAdmin.from('services').delete().eq('provider_id', userId);
        if (servicesError) return { error: `Failed to delete services: ${servicesError.message}` };
    }


    // --- 3. WALLET & TRANSACTIONS ---
    console.log(`[Admin] Cleaning up wallet for ${userId}...`);
    const { data: wallet } = await supabaseAdmin.from('wallets').select('id').eq('user_id', userId).single();
    if (wallet) {
        // Delete all transactions linked to this wallet
        await supabaseAdmin.from('transactions').delete().eq('wallet_id', wallet.id);
        // Delete the wallet
        const { error: walletError } = await supabaseAdmin.from('wallets').delete().eq('id', wallet.id);
        if (walletError) return { error: `Failed to delete wallet: ${walletError.message}` };
    }


    // --- 4. PROFILE DEPENDENCIES ---
    console.log(`[Admin] Cleaning up profile dependencies for ${userId}...`);
    await supabaseAdmin.from('notification_preferences').delete().eq('user_id', userId);
    await supabaseAdmin.from('ambassador_details').delete().eq('user_id', userId);
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId);
    // Add referrals if they exist in schema and block deletion
    try {
        await supabaseAdmin.from('referrals').delete().eq('referred_user_id', userId);
        await supabaseAdmin.from('referrals').delete().eq('ambassador_id', userId);
    } catch (e) { /* Ignore if table doesn't exist or error */ }


    // --- 5. PROFILE ---
    console.log(`[Admin] Deleting profile for ${userId}...`);
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileError) {
        console.error("Error deleting profile:", profileError);
        return { error: `Failed to delete profile: ${profileError.message}` };
    }


    // --- 6. AUTH USER ---
    console.log(`[Admin] Deleting auth user ${userId}...`);
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
        console.error("Error deleting auth user:", authError);
        return { error: authError.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: 'traveler' | 'provider' | 'admin' | 'ambassador') {
    console.log(`[Admin] Initiating role update. User: ${userId}, Target Role: ${newRole}`);
    const supabaseAdmin = createAdminClient();

    // Update Public Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (profileError) {
        console.error(`[Admin] FATAL: Profile update failed for user ${userId}. Error:`, profileError);
        return { error: `Database Error: ${profileError.message}` };
    }

    console.log(`[Admin] Profile updated successfully for user ${userId}. Syncing Auth metadata...`);

    // Update Auth Metadata (to keep them in sync if you use metadata for claims)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
    });

    if (authError) {
        console.warn(`[Admin] WARNING: Auth metadata sync failed for user ${userId}:`, authError);
    } else {
        console.log(`[Admin] Auth metadata synced successfully for user ${userId}.`);
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`); // Revalidate detail page too
    return { success: true };
}

// Action for toggling user verification status (Safe for Admin)
export async function toggleUserVerification(userId: string, isVerified: boolean) {
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', userId);

    if (error) {
        console.error("Error toggling verification:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
}
