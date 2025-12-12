import { createClient } from '@/utils/supabase/server';
import PostsTable from '@/components/admin/PostsTable';
import { Video } from 'lucide-react';

export default async function PostsPage() {
    const supabase = await createClient();

    // Fetch posts with author profile
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                id,
                username,
                avatar_url,
                full_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Video size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Live Posts Feed</h1>
                    <p className="text-gray-400">Monitor and moderate user content in real-time.</p>
                </div>
            </div>

            <PostsTable initialPosts={posts as any || []} />
        </div>
    );
}
