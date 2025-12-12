'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    // 1. Authenticate User
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    if (!data.user) {
        return { error: "Authentication failed." };
    }

    // 2. Fetch User Role from Profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    if (profileError || !profile) {
        // Fallback if profile not found (shouldn't happen in healthy system)
        return { error: "Profile not found." };
    }

    // Ensure profile is not null before accessing its properties
    // The previous check `!profile` already handles the null case,
    // but explicitly asserting the type can help TypeScript in some scenarios.
    const role = (profile as { role: string }).role;

    const locale = (formData.get("locale") as string) || "es";

    // 3. Determine Redirect Path
    let redirectPath = "/";
    switch (role) {
        case "admin":
            redirectPath = `/${locale}/admin`;
            break;
        case "provider":
            redirectPath = `/${locale}/provider`;
            break;
        case "ambassador":
            redirectPath = `/${locale}/ambassador`;
            break;
        case "traveler":
            redirectPath = `/${locale}/traveler`;
            break;
        default:
            // Default fallback or error
            redirectPath = `/${locale}`;
            break;
    }

    redirect(redirectPath);
}
