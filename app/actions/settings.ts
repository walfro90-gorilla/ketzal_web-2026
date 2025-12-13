'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface SiteSettings {
    id: number;
    site_name: string;
    site_description: string | null;
    logo_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    maintenance_mode: boolean;
}

export async function getSiteSettings() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('site_settings').select('*').single();

    if (error) {
        console.error('Error fetching settings:', error);
        // Fallback to default settings if not found or DB error
        return {
            id: 1,
            site_name: 'Ketzal',
            site_description: null,
            logo_url: null,
            contact_email: null,
            contact_phone: null,
            maintenance_mode: false,
        } as SiteSettings;
    }
    return data as SiteSettings;
}


export async function updateSiteSettings(formData: FormData) {
    const supabase = await createClient();

    // Check Auth (Middleware handles general auth, but good to be safe)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Verify Admin Role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Unauthorized: Admins only' };

    const updates = {
        site_name: formData.get('site_name') as string,
        site_description: formData.get('site_description') as string,
        logo_url: formData.get('logo_url') as string,
        contact_email: formData.get('contact_email') as string,
        contact_phone: formData.get('contact_phone') as string,
        maintenance_mode: formData.get('maintenance_mode') === 'on',
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', 1);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Update global layout if needed
    return { success: true };
}
