'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { MoreHorizontal, User, Shield, Briefcase, Award, Eye, Trash, Edit } from 'lucide-react';
import { useState } from 'react';
import { deleteUser, updateUserRole } from '@/app/actions/users';
import { Link } from '@/navigation';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UsersTableProps {
    initialUsers: Profile[];
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
    const t = useTranslations('Dashboard.usersTable');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        const res = await deleteUser(id);
        if (res.error) {
            alert(res.error);
        } else {
            setOpenMenuId(null);
        }
    }

    const handleRoleUpdate = async (id: string, newRole: 'traveler' | 'provider' | 'admin' | 'ambassador') => {
        const res = await updateUserRole(id, newRole);
        if (res.error) {
            alert(res.error);
        } else {
            setOpenMenuId(null);
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield size={16} className="text-red-400" />;
            case 'provider': return <Briefcase size={16} className="text-primary" />;
            case 'ambassador': return <Award size={16} className="text-secondary" />;
            default: return <User size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl min-h-[400px]">
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">{t('name')}</th>
                            <th className="px-6 py-4">{t('role')}</th>
                            <th className="px-6 py-4">{t('joined')}</th>
                            <th className="px-6 py-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {initialUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            initialUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group relative">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username || ''} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-300">
                                                        {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.full_name || 'Anonymous'}</p>
                                                <p className="text-xs text-gray-500">@{user.username || 'unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(user.role)}
                                            <span className="capitalize text-gray-300">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {format(new Date(user.created_at), 'PPP')}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(user.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {/* Simple Custom Dropdown */}
                                        {openMenuId === user.id && (
                                            <div className="absolute right-10 top-0 mr-2 w-48 bg-gray-950 border border-gray-800 shadow-2xl rounded-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10">
                                                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left w-full border-b border-gray-800">
                                                    <Eye size={14} />
                                                    View Details
                                                </Link>
                                                <div className="border-t border-gray-800 bg-gray-950">
                                                    <p className="px-4 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Change Role</p>
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'provider')}
                                                        className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 w-full text-left text-xs font-medium transition-colors"
                                                    >
                                                        <Briefcase size={12} />
                                                        Make Provider
                                                    </button>
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'ambassador')}
                                                        className="flex items-center gap-2 px-4 py-2 text-secondary hover:bg-secondary/10 w-full text-left text-xs font-medium transition-colors"
                                                    >
                                                        <Award size={12} />
                                                        Make Ambassador
                                                    </button>
                                                </div>
                                                <div className="border-t border-gray-800 bg-gray-950">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors w-full text-left font-medium"
                                                    >
                                                        <Trash size={14} />
                                                        Delete User
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Overlay to close menu */}
                                        {openMenuId === user.id && (
                                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpenMenuId(null)} />
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Just a spacer for dropdowns near bottom */}
            <div className="h-40"></div>
        </div>
    );
}
