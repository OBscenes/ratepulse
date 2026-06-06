import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('votes')
    .select('corridor, app_id, count')
    .order('corridor')
    .order('count', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []
  const totalByCorr = {}
  for (const r of rows) {
    totalByCorr[r.corridor] = (totalByCorr[r.corridor] || 0) + (r.count || 0)
  }

  const enriched = rows.map(r => ({
    ...r,
    pct: totalByCorr[r.corridor] > 0
      ? Math.round((r.count / totalByCorr[r.corridor]) * 100)
      : 0,
  }))

  return NextResponse.json(enriched)
}
