import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/signup', '/admin/login'];
const authPages = ['/login', '/signup', '/admin/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const path = request.nextUrl.pathname;

  const isPublic = publicRoutes.some((route) => path === route);
  const isAuthPage = authPages.some((route) => path === route);
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
  const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/study-sessions') ||
    path.startsWith('/quizzes') || path.startsWith('/rooms') || path.startsWith('/gamification') ||
    path.startsWith('/reports') || path.startsWith('/routine') || path.startsWith('/textbooks') ||
    path.startsWith('/settings') || path.startsWith('/onboarding');

  if (!token && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (!token && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
