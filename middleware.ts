/**
 * @fileoverview Correlation ID middleware.
 *
 * Injects a unique `X-Request-Id` header into every request so logs can be
 * correlated across services.  Also adds basic security headers and enforces
 * a Content Security Policy (CSP) for the entire application.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ─── Correlation ID ────────────────────────────────────────────────────────

function generateRequestId(): string {
  // Use crypto.randomUUID() when available (Edge runtime), fall back to Date+rand
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── CSP Policy ───────────────────────────────────────────────────────────

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Scripts: allow self + Supabase realtime CDN + Tailwind CDN (dev)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
  // Styles: allow self + inline (Tailwind generates inline styles)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com",
  // Connections: Supabase, Groq AI, PayOS, Resend
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api-merchant.payos.vn https://api.resend.com",
  // Images: anything HTTPS + data URIs (for avatars)
  "img-src 'self' data: https:",
  // Frames: block all (clickjacking protection)
  "frame-ancestors 'none'",
  // Media
  "media-src 'self'",
  // Workers
  "worker-src 'self' blob:",
  // Form submission only to self
  "form-action 'self'",
  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
].join('; ')

// ─── Middleware ────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const requestId = generateRequestId()

  // Run Supabase session update with the original (unmodified) request.
  // NextRequest.headers is read-only in the Edge runtime, so we cannot
  // mutate it; we attach the correlation ID to the *response* instead.
  const response = await updateSession(request)

  // Attach correlation ID to response so clients (and server logs) can trace it
  response.headers.set('X-Request-Id', requestId)

  // ── Security Headers ──────────────────────────────────────────────────
  response.headers.set('Content-Security-Policy', CSP_DIRECTIVES)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
