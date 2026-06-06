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

let cache     = null
let cacheTime = 0
export let lastUpdated = null   // exported so /api/admin/stats can read it
const TTL = 60_000

async function fetchLiveRates() {
  const key = process.env.ALLRATES_API_KEY
  if (!key) throw new Error('ALLRATES_API_KEY not configured')

  const headers = { Authorization: `Bearer ${key}` }
  const [gbpRes, eurRes] = await Promise.all([
    fetch(`${ALLRATES_BASE}?source=GBP&target=NGN,GHS`, { headers, cache: 'no-store' }),
    fetch(`${ALLRATES_BASE}?source=EUR&target=NGN,GHS`, { headers, cache: 'no-store' }),
  ])

  if (!gbpRes.ok) throw new Error(`AllRatesToday GBP: ${gbpRes.status}`)
  if (!eurRes.ok) throw new Error(`AllRatesToday EUR: ${eurRes.status}`)

  const [gbpData, eurData] = await Promise.all([gbpRes.json(), eurRes.json()])

  const base = {}
  for (const item of [...gbpData, ...eurData]) {
    base[`${item.source}-${item.target}`] = item.rate
  }

  return buildRates(
    base['GBP-NGN'] ?? STATIC_FALLBACKS['GBP-NGN'],
    base['GBP-GHS'] ?? STATIC_FALLBACKS['GBP-GHS'],
    base['EUR-NGN'] ?? STATIC_FALLBACKS['EUR-NGN'],
    base['EUR-GHS'] ?? STATIC_FALLBACKS['EUR-GHS'],
  )
}

async function logRatesToHistory(rates) {
  try {
    // Prefer DB platforms for margins; fall back to hardcoded defaults
    const { data: dbPlatforms } = await supabase
      .from('platforms')
      .select('corridor, platform_id, name, margin, active')

    const platforms = (dbPlatforms && dbPlatforms.length > 0)
      ? dbPlatforms
      : DEFAULT_PLATFORMS

    const records = platforms
      .filter(p => p.active && rates[p.corridor] != null)
      .map(p => ({
        platform:  p.platform_id,
        corridor:  p.corridor,
        rate:      rates[p.corridor] * (1 + p.margin / 100),
        baseline:  rates[p.corridor],
        recorded_at: new Date().toISOString(),
      }))

    if (records.length > 0) {
      await supabase.from('rate_history').insert(records)
    }
  } catch (err) {
    console.error('[midmarket] rate_history log failed:', err.message)
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === '1'
  const now   = Date.now()

  if (!force && cache && now - cacheTime < TTL) {
    return NextResponse.json(
      { ...cache, updatedAt: lastUpdated },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    )
  }

  try {
    const rates    = await fetchLiveRates()
    cache          = rates
    cacheTime      = now
    lastUpdated    = new Date().toISOString()

    // Fire-and-forget — don't block the response
    logRatesToHistory(rates)

    return NextResponse.json(
      { ...rates, updatedAt: lastUpdated },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    )
  } catch (err) {
    console.error('[midmarket] fetch failed:', err.message)

    const fallback = cache ?? buildRates(
      STATIC_FALLBACKS['GBP-NGN'],
      STATIC_FALLBACKS['GBP-GHS'],
      STATIC_FALLBACKS['EUR-NGN'],
      STATIC_FALLBACKS['EUR-GHS'],
    )
    return NextResponse.json(
      { ...fallback, updatedAt: lastUpdated },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
