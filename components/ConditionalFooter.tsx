'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

/**
 * Renders the footer unless we are in a dashboard route where the layout handles it differently
 * OR where we don't want the global full-width footer.
 * 
 * UPDATE: Actually, for the dashboard, we want the footer to be positioned correctly (offset by sidebar).
 * Since RootLayout wraps everything, if we render Footer here, it spans full width.
 * So we hide it here for dashboard routes, and let the Dashboard Layouts render it inside their main content area.
 */
export default function ConditionalFooter() {
    const pathname = usePathname();
    const isDashboard = pathname?.includes('/admin') || pathname?.includes('/provider');

    if (isDashboard) {
        return null;
    }

    return <Footer />;
}
