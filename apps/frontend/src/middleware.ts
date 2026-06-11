import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Fetch maintenance mode
  try {
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, {
      cache: 'no-store'
    });
    
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      const isMaintenance = settingsData.find((s: any) => s.key === 'maintenanceMode')?.value === 'true';
      
      let bypass = false;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (['SUPER_USER', 'ADMIN_USER', 'RESELLER_USER'].includes(payload.role)) {
            bypass = true;
          }
        } catch(e) {}
      }

      if (isMaintenance && !path.startsWith('/admin') && !path.startsWith('/login') && path !== '/maintenance') {
        if (!bypass) {
          const url = request.nextUrl.clone();
          url.pathname = '/maintenance';
          return NextResponse.redirect(url);
        }
      }

      // If maintenance mode is OFF but user is on /maintenance, redirect to home
      if (!isMaintenance && path === '/maintenance') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  } catch (e) {
    // Ignore fetch errors to not break the site if backend is down
  }

  // Protect Admin and Dashboard routes
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/dashboard');

  if (isProtectedPath) {
    if (!token) {
      // Redirect unauthenticated users to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    try {
      // Basic JWT decoding (the payload is the second part of the token)
      let payloadBase64 = token.split('.')[1];
      payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4) {
        payloadBase64 += '=';
      }
      const payloadString = atob(payloadBase64);
      const payload = JSON.parse(payloadString);
      const role = payload.role;

      // Role-based route protection
      if (path.startsWith('/admin') && !['SUPER_USER', 'ADMIN_USER', 'RESELLER_USER'].includes(role)) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // Add user info to headers so server components can use it if needed
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', role);
      requestHeaders.set('x-user-id', payload.sub.toString());

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (e) {
      // If token parsing fails, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // If path is login/register but user is already logged in, redirect them to their dashboard
  if (path === '/login' || path === '/register') {
    if (token) {
      try {
        let payloadBase64 = token.split('.')[1];
        payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        while (payloadBase64.length % 4) {
          payloadBase64 += '=';
        }
        const payload = JSON.parse(atob(payloadBase64));
        const role = payload.role;

        const url = request.nextUrl.clone();
        if (['SUPER_USER', 'ADMIN_USER', 'RESELLER_USER'].includes(role)) {
          url.pathname = '/admin';
        } else {
          url.pathname = '/dashboard';
        }
        return NextResponse.redirect(url);
      } catch (e) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
