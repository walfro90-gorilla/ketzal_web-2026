'use client';

import { useState, useMemo } from 'react';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { MoreHorizontal, Trash, Video, MapPin, Heart, Search, Calendar } from 'lucide-react';
import { deletePost } from '@/app/actions/posts';
import { Link } from '@/navigation';
import VideoPreviewModal from './VideoPreviewModal';

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

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'recent' | 'popular'>('all');

    // Modal State
    const [previewVideo, setPreviewVideo] = useState<{ url: string; desc: string } | null>(null);

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

    // Filter Logic
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post =>
                (post.description?.toLowerCase().includes(query)) ||
                (post.profiles?.username?.toLowerCase().includes(query)) ||
                (post.profiles?.full_name?.toLowerCase().includes(query))
            );
        }

        // Filter / Sort
        if (filterType === 'popular') {
            result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        } else if (filterType === 'recent') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return result;
    }, [posts, searchQuery, filterType]);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card border border-border p-4 rounded-xl">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search posts or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('recent')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${filterType === 'recent' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Calendar size={12} /> Recent
                        </button>
                        <button
                            onClick={() => setFilterType('popular')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${filterType === 'popular' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Heart size={12} /> Popular
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl min-h-[400px] overflow-hidden">
                <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase font-medium border-b border-white/5">
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
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                                <Search size={24} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium text-white">No posts found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-white/5 transition-colors group relative">
                                        {/* Content (Thumbnail + Description) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => setPreviewVideo({ url: post.video_url, desc: post.description || '' })}
                                                    className="w-20 h-14 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/10 group-hover:border-primary/50 cursor-pointer transition-all group-hover:shadow-[0_0_15px_rgba(0,230,118,0.2)]"
                                                >
                                                    {post.thumbnail_url ? (
                                                        <img src={post.thumbnail_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                                                            <Video size={20} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Video size={20} className="text-white drop-shadow-lg" />
                                                    </div>
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="text-white font-medium truncate" title={post.description || ''}>
                                                        {post.description || 'No description'}
                                                    </p>
                                                    <button
                                                        onClick={() => setPreviewVideo({ url: post.video_url, desc: post.description || '' })}
                                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 opacity-80 hover:opacity-100"
                                                    >
                                                        <Video size={12} /> Watch Preview
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Author */}
                                        <td className="px-6 py-4">
                                            {post.profiles ? (
                                                <Link href={`/admin/users/${post.profiles.id}`} className="flex items-center gap-3 group/author">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden ring-1 ring-white/10">
                                                        {post.profiles.avatar_url ? (
                                                            <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                                {(post.profiles.username || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-white group-hover/author:text-primary transition-colors">
                                                            {post.profiles.full_name || 'Unknown'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">@{post.profiles.username}</p>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500 italic text-xs">Deleted User</span>
                                            )}
                                        </td>

                                        {/* Stats */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-300 font-mono text-xs">
                                                <Heart size={14} className={post.likes_count > 0 ? "text-red-500 fill-red-500" : "text-gray-600"} />
                                                <span>{post.likes_count}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            {post.location_tag ? (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full w-fit hover:bg-white/10 transition-colors cursor-default">
                                                    <MapPin size={10} />
                                                    <span className="truncate max-w-[100px]">{JSON.stringify(post.location_tag).slice(0, 15)}...</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-700 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Created At */}
                                        <td className="px-6 py-4 text-gray-500 text-xs tabular-nums">
                                            {format(new Date(post.created_at), 'MMM d, HH:mm')}
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
                                                <div className="absolute right-10 top-2 mr-2 w-40 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-lg z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                setPreviewVideo({ url: post.video_url, desc: post.description || '' });
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
                                                        >
                                                            <Video size={14} />
                                                            Preview
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left font-medium border-t border-white/5"
                                                        >
                                                            <Trash size={14} />
                                                            Delete
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
            </div>

            {/* Video Preview Modal */}
            <VideoPreviewModal
                isOpen={!!previewVideo}
                onClose={() => setPreviewVideo(null)}
                videoUrl={previewVideo?.url || ''}
                description={previewVideo?.desc}
            />
        </div>
    );
}
