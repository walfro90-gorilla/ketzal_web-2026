import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const handleI18n = createMiddleware({
    locales: ['es', 'en', 'zh'],
    defaultLocale: 'es',
    localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
    const response = handleI18n(request);

    // Create a Supabase client for the middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    );

    // 1. Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Define Protected Routes
    const path = request.nextUrl.pathname;

    // Check if the path is part of a protected route group
    const isAdminRoute = path.includes('/admin');
    const isProviderRoute = path.includes('/provider');
    const isAmbassadorRoute = path.includes('/ambassador');
    const isTravelerRoute = path.includes('/traveler');

    // If accessing any protected route without being logged in, redirect to login
    if ((isAdminRoute || isProviderRoute || isAmbassadorRoute || isTravelerRoute) && !user) {
        // Construct absolute URL for redirect
        const loginUrl = new URL('/login', request.url);

        // Preserve different locales if present slightly complex, defaulting to simple login for now or infer
        // Ideally we should keep the locale e.g. /es/admin -> /es/login
        const segments = path.split('/');
        let locale = 'es';
        if (['es', 'en', 'zh'].includes(segments[1])) {
            locale = segments[1];
            loginUrl.pathname = `/${locale}/login`;
        } else {
            loginUrl.pathname = `/es/login`;
        }

        return NextResponse.redirect(loginUrl);
    }

    // 3. Role-Based Access Control (if user is logged in)
    if (user && (isAdminRoute || isProviderRoute || isAmbassadorRoute || isTravelerRoute)) {
        // Fetch user role from public.profiles
        // Note: Middleware shouldn't do DB calls ideally for perf, but Supabase standard patterns allow this via `supabase` client 
        // IF we have row level security properly set up. 
        // However, `supabase.auth.getUser()` is safe. `supabase.from('profiles')` might be slower.
        // Optimization: Store role in metadata or a cookie. For now, we query.

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;

        // Strict Checks
        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (isProviderRoute && role !== 'provider') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (isAmbassadorRoute && role !== 'ambassador') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        // Traveler is the base role, usually everyone can be a traveler, but if we want strict separation:
        // if (isTravelerRoute && role !== 'traveler') { ... } 
        // For now, let's assume 'traveler' route is for travelers, but maybe admins can view it? 
        // Let's stick to strict separation as requested: "cada role vea solo lo que le corresponde"
        if (isTravelerRoute && role !== 'traveler') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(es|en|zh)/:path*']
};
