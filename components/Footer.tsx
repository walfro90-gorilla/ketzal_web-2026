import { Link } from '@/navigation';
import { Github, Twitter, Instagram } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-[#0a0a0a] pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">


                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <div className="relative w-32 h-10">
                                <Image
                                    src="/images/ketzal-logo-white.png"
                                    alt="Ketzal Logo White"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-sm">
                            Advanced Tourism Network & Distributed System. Connecting travelers with authentic experiences through decentralized technology.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
                            <li><Link href="/provider" className="hover:text-primary transition-colors">Provider Portal</Link></li>
                            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        © {currentYear} Ketzal Inc. All rights reserved.
                    </div>

                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
