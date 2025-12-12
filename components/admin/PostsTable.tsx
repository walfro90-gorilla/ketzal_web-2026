'use client';

import { useState } from 'react';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { MoreHorizontal, Trash, FileImage, Video, MapPin, Heart, ExternalLink } from 'lucide-react';
import { deletePost } from '@/app/actions/posts';
import { Link } from '@/navigation';

// Join type definition
type PostWithAuthor = Database['public']['Tables']['posts']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null
};

interface PostsTableProps {
    initialPosts: PostWithAuthor[];
}

export default function PostsTable({ initialPosts }: PostsTableProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [posts, setPosts] = useState(initialPosts);

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

        const res = await deletePost(postId);
        if (res.error) {
            alert(res.error);
        } else {
            // Optimistic update
            setPosts(posts.filter(p => p.id !== postId));
            setOpenMenuId(null);
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl min-h-[400px]">
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Content</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Stats</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileImage size={32} className="opacity-50" />
                                        <p>No posts found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors group relative">
                                    {/* Content (Thumbnail + Description) */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-gray-800 rounded-md overflow-hidden relative flex-shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
                                                {post.thumbnail_url ? (
                                                    <img src={post.thumbnail_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <Video size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <p className="text-white font-medium truncate" title={post.description || ''}>
                                                    {post.description || 'No description'}
                                                </p>
                                                <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                                                    <ExternalLink size={10} /> View Video
                                                </a>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Author */}
                                    <td className="px-6 py-4">
                                        {post.profiles ? (
                                            <Link href={`/admin/users/${post.profiles.id}`} className="flex items-center gap-2 group/author">
                                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                    {post.profiles.avatar_url ? (
                                                        <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold">
                                                            {(post.profiles.username || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-gray-300 group-hover/author:text-white transition-colors">@{post.profiles.username}</span>
                                            </Link>
                                        ) : (
                                            <span className="text-gray-500 italic">Unknown User</span>
                                        )}
                                    </td>

                                    {/* Stats */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-300">
                                            <Heart size={14} className={post.likes_count > 0 ? "text-red-500 fill-red-500" : "text-gray-500"} />
                                            <span>{post.likes_count}</span>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4">
                                        {post.location_tag ? (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full w-fit">
                                                <MapPin size={10} />
                                                <span className="truncate max-w-[100px]">{JSON.stringify(post.location_tag).slice(0, 15)}...</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-xs">-</span>
                                        )}
                                    </td>

                                    {/* Created At */}
                                    <td className="px-6 py-4 text-gray-400 text-xs tabular-nums">
                                        {format(new Date(post.created_at), 'MMM d, yyyy HH:mm')}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(post.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === post.id && (
                                            <div className="absolute right-10 top-2 mr-2 w-48 bg-gray-950 border border-gray-800 shadow-2xl rounded-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10">
                                                <div className="border-t border-gray-800 bg-gray-950">
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors w-full text-left font-medium"
                                                    >
                                                        <Trash size={14} />
                                                        Delete Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Overlay to close menu */}
                                        {openMenuId === post.id && (
                                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpenMenuId(null)} />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Spacer for bottom scrolling */}
            <div className="h-24"></div>
        </div>
    );
}
