'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createDestination(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    // Fallback lat/lon if not provided (tulum default)
    const latitude = parseFloat((formData.get('latitude') as string) || '20.2114');
    const longitude = parseFloat((formData.get('longitude') as string) || '-87.4654');

    if (!name || !slug) {
        return { error: "Name and Slug are required" };
    }

    const { error } = await supabase.from('destinations').insert({
        name,
        slug,
        latitude,
        longitude,
        // Optional fields from schema
        city: formData.get('city') as string || null,
        country: formData.get('country') as string || null,
        posts_count: 0
    });

    if (error) {
        console.error("Create Destination Error:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/destinations');
    return { success: true };
}

export async function deleteDestination(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from('destinations').delete().eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/destinations');
    return { success: true };
}
