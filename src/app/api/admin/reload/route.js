import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Force-bust the midmarket cache and get fresh data
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res  = await fetch(`${base}/api/midmarket?force=1`, { cache: 'no-store' })

    if (!res.ok) throw new Error(`midmarket returned ${res.status}`)

    const data = await res.json()
    return NextResponse.json({ success: true, rates: data, updatedAt: data.updatedAt })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
