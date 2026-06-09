import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { DEFAULT_PLATFORMS } from '@/lib/corridor-defaults'

async function getOrSeedPlatforms() {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('corridor')
    .order('name')

  if (error) throw error

  if (data.length > 0) return data

  // Seed from defaults on first call
  const { error: seedErr } = await supabase
    .from('platforms')
    .insert(DEFAULT_PLATFORMS)

  if (seedErr) throw seedErr

  const { data: seeded } = await supabase
    .from('platforms')
    .select('*')
    .order('corridor')
    .order('name')

  return seeded || DEFAULT_PLATFORMS
}

export async function GET() {
  try {
    const platforms = await getOrSeedPlatforms()
    return NextResponse.json(platforms)
  } catch (err) {
    // DB not ready — return hardcoded defaults so main site still works
    return NextResponse.json(DEFAULT_PLATFORMS)
  }
}

export async function PATCH(request) {
  try {
    const { id, corridor, platform_id, sending_rate, receiving_rate, active } = await request.json()

    if (!id && !(corridor && platform_id)) {
      return NextResponse.json({ error: 'Missing id or corridor+platform_id' }, { status: 400 })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (active         !== undefined) updates.active         = Boolean(active)
    if (sending_rate   !== undefined) updates.sending_rate   = sending_rate   === null ? null : Number(sending_rate)
    if (receiving_rate !== undefined) updates.receiving_rate = receiving_rate === null ? null : Number(receiving_rate)

    let q = supabase.from('platforms').update(updates)
    q = id ? q.eq('id', id) : q.eq('corridor', corridor).eq('platform_id', platform_id)

    const { data, error } = await q.select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
