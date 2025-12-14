'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createService(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const serviceType = formData.get('service_type') as string;
    const locationName = formData.get('location_name') as string;
    const locationAddress = formData.get('location_address') as string;
    const locationPlaceId = formData.get('location_place_id') as string;
    const maxCapacity = parseInt(formData.get('max_capacity') as string);
    const durationHours = parseInt(formData.get('duration_hours') as string);
    const lat = parseFloat(formData.get('latitude') as string);
    const lng = parseFloat(formData.get('longitude') as string);
    const imageUrl = formData.get('image_url') as string;

    const locationCoords = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
    const images = imageUrl ? [imageUrl] : [];

    // Basic validation
    if (!title || isNaN(price) || price < 0 || !serviceType) {
        return { message: 'Missing required fields or invalid price' };
    }

    const validServiceTypes = ['tour', 'experience', 'lodging', 'transport'];
    if (!validServiceTypes.includes(serviceType)) {
        return { message: 'Invalid service type selected' };
    }

    const { error } = await supabase.from('services').insert({
        provider_id: user.id,
        title,
        description,
        price_mxn: price,
        service_type: serviceType,
        location_name: locationName,
        location_address: locationAddress,
        location_place_id: locationPlaceId,
        location_coords: locationCoords,
        max_capacity: maxCapacity,
        duration_hours: durationHours,
        images: images,
        available: true
    } as any);

    if (error) {
        return { message: 'Failed to create service: ' + error.message };
    }


    // We can try to get locale from the formData if we add it, or default to 'es' 
    // Ideally we should use the localized redirect from `src/navigation` if it exists, or just append it manually.
    // For now, let's assume we want to redirect to the localized path.
    // The previous code was: redirect('/provider/services');

    // Check if locale is passed in formData (we will add it to the form)
    const locale = formData.get('locale') as string || 'es';

    revalidatePath(`/${locale}/provider/services`);
    redirect(`/${locale}/provider/services`);
}

export async function updateService(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Unauthorized' };
    }

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const serviceType = formData.get('service_type') as string;
    const locationName = formData.get('location_name') as string;
    const locationAddress = formData.get('location_address') as string;
    const locationPlaceId = formData.get('location_place_id') as string;
    const maxCapacity = parseInt(formData.get('max_capacity') as string);
    const durationHours = parseInt(formData.get('duration_hours') as string);
    const lat = parseFloat(formData.get('latitude') as string);
    const lng = parseFloat(formData.get('longitude') as string);
    const imageUrl = formData.get('image_url') as string;

    const locationCoords = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;

    // Only update images if a new one is provided. 
    // If not provided, we keep existing. But here we usually want to explicitly send what the final state is?
    // For simplicity, if imageUrl is present, we replace. If not, we might accidentally wipe it? 
    // The correct pattern usually involves fetching current if not provided or ensuring client sends current value.
    // Let's assume the editing form sends the *current* image url if no new one was uploaded, or the *new* one.
    const images = imageUrl ? [imageUrl] : [];

    // Basic validation
    if (!id || !title || isNaN(price) || price < 0 || !serviceType) {
        return { message: 'Missing required fields or invalid price' };
    }

    const updatePayload: any = {
        title,
        description,
        price_mxn: price,
        service_type: serviceType,
        max_capacity: maxCapacity,
        duration_hours: durationHours,
    };

    // Only update location fields if they are explicitly sent (basic check)
    // Actually, on edit form load, we will populate these hidden fields with existing data, so it's safe to update.
    if (locationName) {
        updatePayload.location_name = locationName;
        updatePayload.location_address = locationAddress;
        updatePayload.location_place_id = locationPlaceId;
        updatePayload.location_coords = locationCoords;
    }

    // Only update images if not empty, otherwise we might wipe existing images if form logic is flawed.
    // But if user deleted image, we should allow empty. 
    // We will assume `imageUrl` is the source of truth.
    updatePayload.images = images;

    const { error } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', id)
        .eq('provider_id', user.id);

    if (error) {
        return { message: 'Failed to update service: ' + error.message };
    }

    const locale = formData.get('locale') as string || 'es';
    revalidatePath(`/${locale}/provider/services/${id}`);
    revalidatePath(`/${locale}/provider/services`);
    redirect(`/${locale}/provider/services`);
}

export async function updateBookingStatus(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const bookingId = formData.get('bookingId') as string;
    const newStatus = formData.get('status') as string;

    if (!bookingId || !newStatus) return;

    await (supabase
        .from('bookings') as any)
        .update({ status: newStatus })
        .eq('id', bookingId);

    revalidatePath('/provider/bookings');
}

export async function deleteService(serviceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { message: 'Unauthorized' };

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('provider_id', user.id); // Ensure ownership

    if (error) {
        return { message: error.message };
    }

    revalidatePath('/provider/services');
    return { success: true };
}

export async function toggleServiceAvailability(serviceId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { message: 'Unauthorized' };

    const { error } = await supabase
        .from('services')
        .update({ available: !currentStatus })
        .eq('id', serviceId)
        .eq('provider_id', user.id);

    if (error) {
        return { message: error.message };
    }

    revalidatePath('/provider/services');
    return { success: true };
}
