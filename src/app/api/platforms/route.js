import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { DEFAULT_PLATFORMS } from '@/lib/corridor-defaults'

async function getOrSeedPlatforms() {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('corridor')
    .order('margin', { ascending: false })

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
    .order('margin', { ascending: false })

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
    const { id, margin, active, type } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const updates = {}
    if (margin !== undefined) updates.margin = Number(margin)
    if (active !== undefined) updates.active = Boolean(active)
    if (type   !== undefined) updates.type   = type
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('platforms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
