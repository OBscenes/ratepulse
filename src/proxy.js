import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'rp_admin_session'

function verifyToken(token) {
  if (!token) return false
  const parts = token.split(':')
  if (parts.length !== 2) return false
  const [expiresAt, sig] = parts
  if (Date.now() > Number(expiresAt)) return false
  const expected = createHmac('sha256', process.env.ADMIN_PASSWORD)
    .update(String(expiresAt))
    .digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (verifyToken(token)) return NextResponse.next()

  const loginUrl = new URL('/admin/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
