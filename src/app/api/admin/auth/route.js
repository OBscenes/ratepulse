import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'rp_admin_session'
const TTL_MS = 24 * 60 * 60 * 1000

function sign(expiresAt) {
  return createHmac('sha256', process.env.ADMIN_PASSWORD)
    .update(String(expiresAt))
    .digest('hex')
}

function makeToken() {
  const expiresAt = Date.now() + TTL_MS
  return `${expiresAt}:${sign(expiresAt)}`
}

export function verifyToken(token) {
  if (!token) return false
  const parts = token.split(':')
  if (parts.length !== 2) return false
  const [expiresAt, sig] = parts
  if (Date.now() > Number(expiresAt)) return false
  const expected = sign(expiresAt)
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function POST(request) {
  const { password } = await request.json()

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

  const correct = (() => {
    try {
      return timingSafeEqual(Buffer.from(password ?? ''), Buffer.from(adminPassword))
    } catch {
      return false
    }
  })()

  if (!correct) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = makeToken()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_MS / 1000,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}
