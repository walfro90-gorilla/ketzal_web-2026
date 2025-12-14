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

export async function signupAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;
    const role = formData.get("role") as string;
    const providerType = formData.get("provider_type") as string;
    const locale = (formData.get("locale") as string) || "en"; // Default to en if not provided

    // Basic Validation
    if (!email || !password || !fullName || !role) {
        return { error: locale === 'es' ? "Todos los campos son obligatorios" : "All fields are required" };
    }

    const supabase = await createClient();

    // Sign Up with Supabase Auth
    // We pass additional user metadata which our triggers will pick up
    // to populate the public.profiles table.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                username: username || email.split('@')[0], // Fallback username
                role: role,
                provider_type: providerType || null
            },
            // Use environment variable for origin or default to localhost
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: locale === 'es' ? "Este correo ya está registrado" : "Email already registered" };
    }

    // Return success to the client so it can show a confirmation message
    return { success: true };
}
