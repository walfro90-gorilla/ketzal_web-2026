import { Link } from '@/navigation';
import { Shield, Map } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Ketzal Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <h1 className="text-6xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary z-10">
        KETZAL
      </h1>

      <p className="text-gray-400 mb-12 max-w-md text-center z-10">
        Advanced Tourism Network & Distributed System.
        <br />Select a portal to continue:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10">
        <Link
          href="/admin"
          className="group flex flex-col items-center p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary transition-all hover:scale-105"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-colors">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-2">God Mode Control</p>
        </Link>

        <Link
          href="/admin"
          className="group flex flex-col items-center p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-secondary transition-all hover:scale-105"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-black transition-colors">
            <Map size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Provider Portal</h2>
          <p className="text-sm text-gray-500 mt-2">Manage Experiences</p>
        </Link>
      </div>

      <div className="mt-12 text-xs text-gray-600 z-10">
        System v1.0.0 • Offline-First • Multi-Region
      </div>
    </div>
  );
}
