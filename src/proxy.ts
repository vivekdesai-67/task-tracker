import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow /login, static assets, and Next.js internals through
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Read & decrypt the session cookie directly (edge-safe, read-only)
  const cookieValue = request.cookies.get(sessionOptions.cookieName as string)?.value;

  if (!cookieValue) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const session = await unsealData<SessionData>(cookieValue, {
      password: sessionOptions.password as string,
    });

    if (!session.userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    // Cookie is invalid or tampered — boot to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
