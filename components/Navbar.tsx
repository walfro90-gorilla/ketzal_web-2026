import { Link } from '@/navigation';
import { createClient } from '@/utils/supabase/server';
import NavUserMenu from './NavUserMenu';
import { Sparkles } from 'lucide-react';

export default async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
                            KETZAL
                        </span>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <NavUserMenu user={user} />
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
