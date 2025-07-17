import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware for route protection and role-based access control
 * 
 * This middleware handles:
 * 1. Authentication checks for protected routes
 * 2. Role-based access control for artist-specific routes
 * 3. Redirects for unauthorized access attempts
 * 4. Protection for API routes that require authentication
 */

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/onboarding/artist',
  '/orders',
  '/communities',
];

// Define routes that require artist role
const artistRoutes = [
  '/dashboard/artwork',
  '/dashboard/auctions',
  '/dashboard/sales',
  '/dashboard/statistics',
];

// Define routes that require admin role
const adminRoutes = [
  '/admin',
];

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/users',
  '/api/artworks',
  '/api/orders',
  '/api/auctions',
  '/api/communities',
];

// Define API routes that require artist role
const artistApiRoutes = [
  '/api/artworks/create',
  '/api/artworks/update',
  '/api/artworks/delete',
  '/api/auctions/create',
];

// Define API routes that require admin role
const adminApiRoutes = [
  '/api/admin',
];

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;
    const isArtist = token?.isArtist === true;
    const pathname = req.nextUrl.pathname;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the route requires artist role
    const isArtistRoute = artistRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // Check if the route requires admin role
    const isAdminRoute = adminRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the API route is protected
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Check if the API route requires artist role
    const isArtistApiRoute = artistApiRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    // Check if the API route requires admin role
    const isAdminApiRoute = adminApiRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Handle protected page routes
    if (isProtectedRoute && !isAuthenticated) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    // Handle artist-only page routes
    if (isArtistRoute && !isArtist) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Handle admin-only page routes
    if (isAdminRoute) {
      // For demo purposes, we'll check if the user has an admin email
      // In a real app, you would check for an admin role
      const user = token?.email;
      const isAdmin = user === 'admin@chitrakosha.com';
      
      if (!isAuthenticated || !isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Handle protected API routes
    if (isProtectedApiRoute && !isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication required' 
        }),
        { 
          status: 401,
          headers: { 'content-type': 'application/json' }
        }
      );
    }

    // Handle artist-only API routes
    if (isArtistApiRoute && !isArtist) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Artist privileges required' 
        }),
        { 
          status: 403,
          headers: { 'content-type': 'application/json' }
        }
      );
    }

    // Handle admin-only API routes
    if (isAdminApiRoute) {
      // For demo purposes, we'll check if the user has an admin email
      // In a real app, you would check for an admin role
      const user = token?.email;
      const isAdmin = user === 'admin@chitrakosha.com';
      
      if (!isAuthenticated || !isAdmin) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: 'Admin privileges required' 
          }),
          { 
            status: 403,
            headers: { 'content-type': 'application/json' }
          }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Skip the default withAuth behavior and use our custom logic
      authorized: () => true,
    },
  }
);

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - API routes that handle their own authentication:
     *   - /api/auth/* (NextAuth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};