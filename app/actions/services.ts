'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createService(formData: FormData) {
    const supabase = await createClient();

    // Extract data from formData
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const location_name = formData.get('location_name') as string;

    // Basic validation
    if (!title || !price) {
        return { error: 'Title and Price are required' };
    }

    // Get current user (Provider)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('services').insert({
        title,
        description,
        price_mxn: price,
        provider_id: user.id, // Link to creator
        service_type: 'experience', // Default for now
        available: true,
        location_name,
        // Add default values for required fields in new schema
        location: null, // USER-DEFINED in schema, keeping null for now
    });

    if (error) {
        console.error('Create Service Error:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/services');
    return { success: true };
}
