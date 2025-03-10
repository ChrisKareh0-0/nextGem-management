import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures all pages are treated as dynamic and handles authentication
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect old routes to new routes
  if (pathname === '/statistics') {
    return NextResponse.redirect(new URL('/dashboard/statistics', request.url));
  }
  
  const response = NextResponse.next();
  
  // Add headers to disable caching and ensure dynamic rendering
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('X-Next-Dynamic', '1');
  
  // Skip authentication check for the login page and public assets
  if (
    pathname === '/' || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/icons') || 
    pathname === '/favicon.ico'
  ) {
    return response;
  }
  
  // For client-side authentication, we'll rely on the AuthCheck component
  // This middleware just ensures pages are dynamic and not cached
  
  return response;
}

// Apply this middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 