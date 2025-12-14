'use client';

import { useTranslations } from 'next-intl';
import { Database } from '@/types/database.types';
import { format } from 'date-fns';
import { MoreHorizontal, User, Shield, Briefcase, Award, Eye, Trash, CheckCircle2, XCircle, BadgeCheck, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { deleteUser, updateUserRole, toggleUserVerification } from '@/app/actions/users';
import { Link } from '@/navigation';
import DeleteUserModal from './DeleteUserModal';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserWithEmail = Profile & { email: string | null };

interface UsersTableProps {
    initialUsers: UserWithEmail[];
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
    const t = useTranslations('Dashboard.usersTable');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [deleteModalState, setDeleteModalState] = useState<{ id: string; name: string; isOpen: boolean }>({
        id: '',
        name: '',
        isOpen: false
    });

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const confirmDelete = (user: UserWithEmail) => {
        setOpenMenuId(null);
        setDeleteModalState({
            id: user.id,
            name: user.full_name || user.username || 'User',
            isOpen: true
        });
    };

    const handleRoleUpdate = async (id: string, newRole: 'traveler' | 'provider' | 'admin' | 'ambassador') => {
        const res = await updateUserRole(id, newRole);
        if (res.error) {
            alert(res.error);
        } else {
            setOpenMenuId(null);
        }
    }

    const handleVerificationToggle = async (id: string, isVerified: boolean) => {
        const res = await toggleUserVerification(id, isVerified);
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

    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch = (
            (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                        <option value="all">All Roles</option>
                        <option value="traveler">Traveler</option>
                        <option value="provider">Provider</option>
                        <option value="admin">Admin</option>
                        <option value="ambassador">Ambassador</option>
                    </select>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl">
                <div className="relative w-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">{t('name')}</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">{t('role')}</th>
                                <th className="px-6 py-4">{t('joined')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
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
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-medium text-white">{user.full_name || 'Anonymous'}</p>
                                                        {user.is_verified && <BadgeCheck size={14} className="text-blue-500" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500">@{user.username || 'unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {user.email || '—'}
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
                                                <div className="absolute right-12 top-0 mt-2 w-56 bg-gray-950 border border-gray-800 shadow-2xl rounded-lg z-[100] animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10 origin-top-right">
                                                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left w-full border-b border-gray-800 text-sm">
                                                        <Eye size={14} />
                                                        {t('view_details')}
                                                    </Link>

                                                    {/* Verification Toggle */}
                                                    <div className="border-b border-gray-800 bg-gray-950/50">
                                                        <button
                                                            onClick={() => handleVerificationToggle(user.id, !user.is_verified)}
                                                            className={`flex items-center gap-2 px-4 py-2 w-full text-left text-xs font-medium transition-colors ${user.is_verified ? 'text-amber-500 hover:bg-amber-500/10' : 'text-blue-500 hover:bg-blue-500/10'}`}
                                                        >
                                                            {user.is_verified ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                                                            {user.is_verified ? 'Revoke Verification' : 'Verify User'}
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-gray-800 bg-gray-950">
                                                        <p className="px-4 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Change Role</p>
                                                        <button
                                                            onClick={() => handleRoleUpdate(user.id, 'traveler')}
                                                            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:bg-white/10 w-full text-left text-xs font-medium transition-colors"
                                                        >
                                                            <User size={12} />
                                                            Make Traveler
                                                        </button>
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
                                                        <button
                                                            onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 w-full text-left text-xs font-medium transition-colors"
                                                        >
                                                            <Shield size={12} />
                                                            Make Admin
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-gray-800 bg-gray-950">
                                                        <button
                                                            onClick={() => confirmDelete(user)}
                                                            className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors w-full text-left font-medium text-sm"
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
            </div>

            <DeleteUserModal
                userId={deleteModalState.id}
                userName={deleteModalState.name}
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
