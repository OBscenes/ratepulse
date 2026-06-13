import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FILE_PATH    = 'settings/currency_settings.json'

const DEFAULT_SETTINGS = [
  { currency: 'GBP', visible: true },
  { currency: 'EUR', visible: true },
  { currency: 'USD', visible: true },
  { currency: 'CAD', visible: true },
]

async function readSettings() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${FILE_PATH}`, {
    headers: {
      apikey:        SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) return DEFAULT_SETTINGS
  return res.json()
}

async function writeSettings(settings) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      apikey:         SERVICE_KEY,
      Authorization:  `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert':     'true',
    },
    body: JSON.stringify(settings),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Storage write failed: ${text}`)
  }
}

export async function GET() {
  try {
    const settings = await readSettings()
    return NextResponse.json(settings)
  } catch (err) {
    console.error('[GET /api/currency-settings]', err.message)
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PATCH(request) {
  try {
    const { currency, visible } = await request.json()
    if (!currency || typeof visible !== 'boolean') {
      return NextResponse.json({ error: 'currency and visible (boolean) are required' }, { status: 400 })
    }
    const settings = await readSettings()
    const updated  = settings.map(s => s.currency === currency ? { ...s, visible } : s)
    if (!updated.find(s => s.currency === currency)) {
      updated.push({ currency, visible })
    }
    await writeSettings(updated)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/currency-settings]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
