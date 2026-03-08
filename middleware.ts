import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Check if route is protected (anything under the root that is a page, or API routes, except /api/auth)
    const { pathname } = request.nextUrl;

    // Allow public paths (auth APIs, static files, login is handled globally via global state now,
    // but we can block direct access to internal sub-tabs so that the JS doesn't even have to render 
    // the layout if not logged in).
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Try reading the cookie
    const hasAuthToken = request.cookies.has('admin_auth_token');

    // If no token, we can redirect or just let AdminContext handle login, 
    // BUT since we want to act as a vault, we can redirect to a specific login page, 
    // or just let them load "/" and AdminContext will pop up the Login box.
    // However, if they try to access "/miembros" directly without a token,
    // we can redirect them back to "/" to enter the password.
    if (!hasAuthToken && pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // We match everything EXCEPT static files and api/auth
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
