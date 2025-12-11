'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// ... createUser implementation ...
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

    // Delete from Auth (Cascade deletes profile/wallet if configured in DB, else manual cleanup needed)
    // Usually profiles table has 'on delete cascade' on the foreign key to auth.users.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error("Error deleting user:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: 'traveler' | 'provider' | 'admin' | 'ambassador') {
    const supabaseAdmin = createAdminClient();

    // Update Public Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (profileError) {
        return { error: profileError.message };
    }

    // Update Auth Metadata (to keep them in sync if you use metadata for claims)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
    });

    if (authError) {
        console.warn("Auth metadata sync failed", authError);
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`); // Revalidate detail page too
    return { success: true };
}
