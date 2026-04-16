import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * VendorFlow Middleware Template
 * Demonstrates how to protect sensitive routes (Dashboard, Platform Console)
 * using the JWT tokens generated during login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isDashboard = pathname.startsWith('/dashboard');
  const isPlatform = pathname.startsWith('/platform');

  // In a real production app, you would:
  // 1. Get the token from cookies or headers
  // 2. Verify the JWT signature
  // 3. Redirect to login if invalid
  
  // For this demonstration, we allow all but provide a hook for extension.
  // Example verification check:
  // const token = request.headers.get('authorization') || request.cookies.get('token');
  // if (!token && (isDashboard || isPlatform)) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

// Config to limit middleware to specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/platform/:path*',
    '/api/vendor/:path*',
  ],
};
