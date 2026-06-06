import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const corridor = searchParams.get('corridor')
  const from     = searchParams.get('from')   // ISO date string
  const to       = searchParams.get('to')     // ISO date string

  let query = supabase
    .from('rate_history')
    .select('id, platform, corridor, rate, baseline, recorded_at')
    .order('recorded_at', { ascending: true })
    .limit(2000)

  if (corridor) query = query.eq('corridor', corridor)
  if (from)     query = query.gte('recorded_at', from)
  if (to)       query = query.lte('recorded_at', to)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
