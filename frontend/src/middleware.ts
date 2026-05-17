import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/signup', '/admin/login'];
const authPages = ['/login', '/signup', '/admin/login'];

const userRoutes = [
  '/dashboard', '/study-sessions', '/quizzes', '/rooms', '/gamification',
  '/reports', '/routine', '/textbooks', '/settings', '/onboarding',
];

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  const isPublic = publicRoutes.some((route) => path === route);
  const isAuthPage = authPages.some((route) => path === route);
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
  const isUserRoute = userRoutes.some((route) => path.startsWith(route));

  const payload = token ? decodeJWTPayload(token) : null;
  const role = payload?.role as string | undefined;

  if (!token) {
    if (isAdminRoute) return NextResponse.redirect(new URL('/admin/login', request.url));
    if (isUserRoute) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  if (role) {
    if (role === 'admin' && isUserRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (role !== 'admin' && isAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (isAuthPage) {
    const redirectTo = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
