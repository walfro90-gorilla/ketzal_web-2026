'use client';

import { useTranslations } from 'next-intl';
import { createUser } from '@/app/actions/users';
import { useState, useRef } from 'react';
import { UserPlus, X, Loader2 } from 'lucide-react';

// import { toast } from 'sonner';

export default function CreateUserButton() {
    const t = useTranslations('Dashboard.usersTable'); // Reusing or adding new keys
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        const res = await createUser(formData);
        setIsPending(false);

        if (res?.error) {
            alert(`Error: ${res.error}`);
        } else {
            alert('User created successfully!');
            setIsOpen(false);
            formRef.current?.reset();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
            >
                <UserPlus size={16} />
                Invite User
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white">Create New User</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form ref={formRef} action={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="cool_user_99"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-500">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-500">Full Name</label>
                                    <input
                                        name="full_name"
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-500">Role</label>
                                    <select
                                        name="role"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary outline-none appearance-none"
                                    >
                                        <option value="traveler">Traveler</option>
                                        <option value="provider">Provider</option>
                                        <option value="ambassador">Ambassador</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:brightness-110 transition-all flex justify-center items-center gap-2 mt-4"
                            >
                                {isPending ? <Loader2 className="animate-spin" /> : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
