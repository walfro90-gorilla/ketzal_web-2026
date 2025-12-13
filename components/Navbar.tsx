import { Link } from '@/navigation';
import { createClient } from '@/utils/supabase/server';
import NavUserMenu from './NavUserMenu';
import { Sparkles } from 'lucide-react';

import LanguageSelector from './LanguageSelector';
import Image from 'next/image';

export default async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        role = profile?.role;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">


                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative w-32 h-10">
                            <Image
                                src="/images/ketzal-logo.png"
                                alt="Ketzal Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        <LanguageSelector />
                        {user ? (
                            <NavUserMenu user={user} role={role} />
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
