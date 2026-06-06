import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { DEFAULT_PLATFORMS } from '@/lib/corridor-defaults'

const ALLRATES_BASE = 'https://allratestoday.com/api/v1/rates'

const STATIC_FALLBACKS = {
  'GBP-NGN': 1838.18,
  'GBP-GHS':   18.20,
  'EUR-NGN': 1820.00,
  'EUR-GHS':   15.60,
}

function buildRates(gbpNgn, gbpGhs, eurNgn, eurGhs) {
  return {
    'GBP-NGN': gbpNgn,
    'GBP-GHS': gbpGhs,
    'EUR-NGN': eurNgn,
    'EUR-GHS': eurGhs,
    'NGN-GBP': gbpNgn,
    'GHS-GBP': 1000   / gbpGhs,
    'NGN-EUR': 100000 / eurNgn,
    'GHS-EUR': 1000   / eurGhs,
  }
}

async function logRates(rates) {
  try {
    const { data: dbPlatforms } = await supabase
      .from('platforms')
      .select('corridor, platform_id, margin, active')

    const platforms = (dbPlatforms && dbPlatforms.length > 0) ? dbPlatforms : DEFAULT_PLATFORMS

    const records = platforms
      .filter(p => p.active && rates[p.corridor] != null)
      .map(p => ({
        platform:    p.platform_id,
        corridor:    p.corridor,
        rate:        rates[p.corridor] * (1 + p.margin / 100),
        baseline:    rates[p.corridor],
        recorded_at: new Date().toISOString(),
      }))

    if (records.length > 0) {
      await supabase.from('rate_history').insert(records)
    }
  } catch (err) {
    console.error('[admin/reload] rate_history log failed:', err.message)
  }
}

export async function POST() {
  const key = process.env.ALLRATES_API_KEY

  // Diagnose key availability first
  if (!key) {
    const msg = 'ALLRATES_API_KEY is not set in server environment variables. Add it in Vercel → Settings → Environment Variables.'
    console.error('[admin/reload]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  console.log('[admin/reload] API key present, length:', key.length)

  try {
    const headers = { Authorization: `Bearer ${key}` }

    const [gbpRes, eurRes] = await Promise.all([
      fetch(`${ALLRATES_BASE}?source=GBP&target=NGN,GHS`, { headers, cache: 'no-store' }),
      fetch(`${ALLRATES_BASE}?source=EUR&target=NGN,GHS`, { headers, cache: 'no-store' }),
    ])

    if (!gbpRes.ok) {
      const body = await gbpRes.text().catch(() => '')
      throw new Error(`AllRatesToday GBP: HTTP ${gbpRes.status} — ${body.slice(0, 300)}`)
    }
    if (!eurRes.ok) {
      const body = await eurRes.text().catch(() => '')
      throw new Error(`AllRatesToday EUR: HTTP ${eurRes.status} — ${body.slice(0, 300)}`)
    }

    const [gbpData, eurData] = await Promise.all([gbpRes.json(), eurRes.json()])

    console.log('[admin/reload] raw GBP data:', JSON.stringify(gbpData).slice(0, 200))
    console.log('[admin/reload] raw EUR data:', JSON.stringify(eurData).slice(0, 200))

    const base = {}
    for (const item of [...gbpData, ...eurData]) {
      base[`${item.source}-${item.target}`] = item.rate
    }

    const rates    = buildRates(
      base['GBP-NGN'] ?? STATIC_FALLBACKS['GBP-NGN'],
      base['GBP-GHS'] ?? STATIC_FALLBACKS['GBP-GHS'],
      base['EUR-NGN'] ?? STATIC_FALLBACKS['EUR-NGN'],
      base['EUR-GHS'] ?? STATIC_FALLBACKS['EUR-GHS'],
    )
    const updatedAt = new Date().toISOString()

    logRates(rates)  // fire-and-forget

    return NextResponse.json({ success: true, rates, updatedAt })
  } catch (err) {
    console.error('[admin/reload] fetch failed:', err.message)
    return NextResponse.json({
      error: err.message,
      hint: 'Check Vercel function logs for the full stack trace.',
    }, { status: 500 })
  }
}
