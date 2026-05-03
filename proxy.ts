import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: keep this Edge-runtime-friendly. We do NOT call into auth/db here
// (better-sqlite3 + argon2 are Node-only). Auth enforcement lives in
// app/(app)/layout.tsx and app/(auth)/layout.tsx.
export default function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
