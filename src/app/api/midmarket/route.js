import { NextResponse } from 'next/server'

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
    'NGN-GBP': gbpNgn,             // invertedRate corridor shares GBP-NGN base
    'GHS-GBP': 1000   / gbpGhs,   // GBP per 1,000 GHS
    'NGN-EUR': 100000 / eurNgn,   // EUR per 100,000 NGN
    'GHS-EUR': 1000   / eurGhs,   // EUR per 1,000 GHS
  }
}

let cache     = null
let cacheTime = 0
const TTL     = 60_000  // 60 s

async function fetchLiveRates() {
  const key = process.env.ALLRATES_API_KEY
  if (!key) throw new Error('ALLRATES_API_KEY not configured')

  const headers = { Authorization: `Bearer ${key}` }
  const [gbpRes, eurRes] = await Promise.all([
    fetch(`${ALLRATES_BASE}?source=GBP&target=NGN,GHS`, { headers, cache: 'no-store' }),
    fetch(`${ALLRATES_BASE}?source=EUR&target=NGN,GHS`, { headers, cache: 'no-store' }),
  ])

  if (!gbpRes.ok) throw new Error(`AllRatesToday GBP request failed: ${gbpRes.status}`)
  if (!eurRes.ok) throw new Error(`AllRatesToday EUR request failed: ${eurRes.status}`)

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

export async function GET() {
  const now = Date.now()

  if (cache && now - cacheTime < TTL) {
    return NextResponse.json(cache, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  }

  try {
    const rates = await fetchLiveRates()
    cache     = rates
    cacheTime = now
    return NextResponse.json(rates, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err) {
    console.error('[midmarket] fetch failed:', err.message)

    const fallback = cache ?? buildRates(
      STATIC_FALLBACKS['GBP-NGN'],
      STATIC_FALLBACKS['GBP-GHS'],
      STATIC_FALLBACKS['EUR-NGN'],
      STATIC_FALLBACKS['EUR-GHS'],
    )
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
