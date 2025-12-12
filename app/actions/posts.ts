'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
    const supabase = createAdminClient();

    // Delete the post
    // Note: If you have storage buckets (like videos/thumbnails), you should delete those files here too.
    // For now, we just delete the DB record.
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/posts');
    return { success: true };
}
