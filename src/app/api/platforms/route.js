import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { DEFAULT_PLATFORMS } from '@/lib/corridor-defaults'

async function fetchAllPlatforms() {
  // order('corridor') only — avoids errors if column 'name' has a different name in the DB
  const { data, error } = await supabaseAdmin
    .from('platforms')
    .select('*')
    .order('corridor')

  if (error) {
    console.error('[GET /api/platforms] DB select error:', error.message, 'code:', error.code)
    throw error
  }

  console.log('[GET /api/platforms] DB returned', data.length, 'rows')
  if (data.length > 0) {
    // Log all unique corridor values so we can spot case/format mismatches
    const corridors = [...new Set(data.map(r => r.corridor))]
    console.log('[GET /api/platforms] unique corridors in DB:', JSON.stringify(corridors))
    console.log('[GET /api/platforms] first row:', JSON.stringify({
      id: data[0].id,
      corridor: data[0].corridor,
      platform_id: data[0].platform_id,
    }))
  }

  return data
}

export async function GET() {
  try {
    const data = await fetchAllPlatforms()

    if (data.length === 0) {
      // Seed from defaults on first call
      console.log('[GET /api/platforms] table empty — seeding with defaults')
      const { error: seedErr } = await supabaseAdmin
        .from('platforms')
        .insert(DEFAULT_PLATFORMS)

      if (seedErr) {
        console.error('[GET /api/platforms] seed error:', seedErr.message)
        return NextResponse.json(DEFAULT_PLATFORMS)
      }

      const { data: seeded } = await supabaseAdmin
        .from('platforms')
        .select('*')
        .order('corridor')

      return NextResponse.json(seeded || DEFAULT_PLATFORMS)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/platforms] error, falling back to DEFAULT_PLATFORMS:', err.message)
    return NextResponse.json(DEFAULT_PLATFORMS)
  }
}

export async function PATCH(request) {
  try {
    const { id, corridor, platform_id, sending_rate, receiving_rate, active } = await request.json()

    // Parse the numeric id explicitly — Supabase integer ids come through as numbers (328, 329 …)
    const numericId = (id != null && !isNaN(Number(id))) ? Number(id) : null

    console.log('[PATCH /api/platforms] received → id:', id, '→ numericId:', numericId,
      '| corridor:', corridor, '| platform_id:', platform_id)

    if (numericId == null && !(corridor && platform_id)) {
      return NextResponse.json({ error: 'Missing id or corridor+platform_id' }, { status: 400 })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (active         !== undefined) updates.active         = Boolean(active)
    if (sending_rate   !== undefined) updates.sending_rate   = sending_rate   === null ? null : Number(sending_rate)
    if (receiving_rate !== undefined) updates.receiving_rate = receiving_rate === null ? null : Number(receiving_rate)

    let rowId = numericId

    if (rowId == null) {
      // Log a DB sample to confirm actual stored values
      const { data: sample } = await supabaseAdmin
        .from('platforms')
        .select('id, corridor, platform_id')
        .limit(5)
      console.log('[PATCH /api/platforms] DB sample:', JSON.stringify(sample))
      console.log('[PATCH /api/platforms] searching corridor=%s platform_id=%s', corridor, platform_id)

      // 1. Exact match
      const { data: found, error: findErr } = await supabaseAdmin
        .from('platforms')
        .select('id')
        .eq('corridor', corridor)
        .eq('platform_id', platform_id)
        .limit(1)

      if (findErr) {
        console.error('[PATCH /api/platforms] find error:', findErr.message)
        return NextResponse.json({ error: findErr.message }, { status: 500 })
      }

      if (found && found.length > 0) {
        rowId = found[0].id
        console.log('[PATCH /api/platforms] exact match → rowId:', rowId)
      } else {
        // 2. Case-insensitive fallback
        console.log('[PATCH /api/platforms] exact match failed, trying ilike')
        const { data: foundCI } = await supabaseAdmin
          .from('platforms')
          .select('id, corridor, platform_id')
          .ilike('corridor', corridor)
          .ilike('platform_id', platform_id)
          .limit(1)

        console.log('[PATCH /api/platforms] ilike result:', JSON.stringify(foundCI))
        if (foundCI && foundCI.length > 0) rowId = foundCI[0].id
      }
    }

    // 3. If still no resolved id, update directly by corridor+platform_id
    if (rowId == null) {
      console.log('[PATCH /api/platforms] no id resolved — updating by corridor+platform_id directly')
      const { data: rows, error: directErr } = await supabaseAdmin
        .from('platforms')
        .update(updates)
        .eq('corridor', corridor)
        .eq('platform_id', platform_id)
        .select()

      if (directErr) {
        console.error('[PATCH /api/platforms] direct update error:', directErr.message)
        return NextResponse.json({
          error: directErr.message,
          debug: { corridor, platform_id },
        }, { status: 500 })
      }

      if (!rows || rows.length === 0) {
        return NextResponse.json({
          error: 'Platform not found',
          debug: { corridor, platform_id },
        }, { status: 404 })
      }

      return NextResponse.json(rows[0])
    }

    // Happy path: update by numeric id
    console.log('[PATCH /api/platforms] updating by id:', rowId)
    const { data, error } = await supabaseAdmin
      .from('platforms')
      .update(updates)
      .eq('id', rowId)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/platforms] update error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[PATCH /api/platforms] unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
