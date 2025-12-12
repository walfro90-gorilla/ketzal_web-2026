'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function sendPasswordResetEmail(email: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    });

    if (error) {
        return { error: error.message };
    }
    return { success: true, message: "Reset email sent successfully." };
}

export async function adminResetPassword(userId: string, newPassword: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
    });

    if (error) {
        return { error: error.message };
    }

    // Optional: Revoke sessions to force re-login
    // await supabase.auth.admin.signOut(userId);

    revalidatePath('/admin/users');
    return { success: true, message: "Password updated successfully." };
}
