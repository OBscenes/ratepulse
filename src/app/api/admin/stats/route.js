import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  const [leadsRes, votesRes, platformsRes] = await Promise.allSettled([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('votes').select('count'),
    supabase.from('platforms').select('active').eq('active', true),
  ])

  const totalLeads      = leadsRes.status === 'fulfilled'      ? (leadsRes.value.count    || 0) : 0
  const totalVotes      = votesRes.status === 'fulfilled'
    ? (votesRes.value.data || []).reduce((s, v) => s + (v.count || 0), 0)
    : 0
  const activePlatforms = platformsRes.status === 'fulfilled'  ? (platformsRes.value.data?.length || 0) : 0

  return NextResponse.json({ totalLeads, totalVotes, activePlatforms })
}
