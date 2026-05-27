import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const corridor = searchParams.get('corridor')
  if (!corridor) return NextResponse.json({ votes: [] })

  const { data, error } = await supabase
    .from('votes')
    .select('app_id, count')
    .eq('corridor', corridor)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ votes: data || [] })
}

export async function POST(request) {
  const { corridor, app_id } = await request.json()
  if (!corridor || !app_id) {
    return NextResponse.json({ error: 'Missing corridor or app_id' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id, count')
    .eq('corridor', corridor)
    .eq('app_id', app_id)
    .single()

  if (existing) {
    await supabase
      .from('votes')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('votes')
      .insert({ corridor, app_id, count: 1 })
  }

  const { data } = await supabase
    .from('votes')
    .select('app_id, count')
    .eq('corridor', corridor)

  return NextResponse.json({ votes: data || [] })
}
