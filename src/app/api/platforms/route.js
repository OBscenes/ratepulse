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

    console.log('[platforms PATCH] received:', { id, corridor, platform_id, sending_rate, receiving_rate, active })

    if (!id && !(corridor && platform_id)) {
      return NextResponse.json({ error: 'Missing id or corridor+platform_id' }, { status: 400 })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (active         !== undefined) updates.active         = Boolean(active)
    if (sending_rate   !== undefined) updates.sending_rate   = sending_rate   === null ? null : Number(sending_rate)
    if (receiving_rate !== undefined) updates.receiving_rate = receiving_rate === null ? null : Number(receiving_rate)

    let rowId = id

    if (!rowId) {
      // Log a DB sample so we can see actual stored values vs what we're searching
      const { data: sample } = await supabase
        .from('platforms')
        .select('id, corridor, platform_id')
        .limit(5)
      console.log('[platforms PATCH] DB sample:', JSON.stringify(sample))
      console.log('[platforms PATCH] searching for corridor=%s platform_id=%s', corridor, platform_id)

      // 1. Exact match
      const { data: found, error: findErr } = await supabase
        .from('platforms')
        .select('id')
        .eq('corridor', corridor)
        .eq('platform_id', platform_id)
        .limit(1)

      if (findErr) {
        console.error('[platforms PATCH] find error:', findErr)
        return NextResponse.json({ error: findErr.message }, { status: 500 })
      }

      if (found && found.length > 0) {
        rowId = found[0].id
        console.log('[platforms PATCH] exact match rowId:', rowId)
      } else {
        // 2. Case-insensitive fallback (handles gbp-ngn vs GBP-NGN mismatches)
        console.log('[platforms PATCH] exact match failed, trying case-insensitive')
        const { data: foundCI } = await supabase
          .from('platforms')
          .select('id, corridor, platform_id')
          .ilike('corridor', corridor)
          .ilike('platform_id', platform_id)
          .limit(1)

        console.log('[platforms PATCH] case-insensitive result:', JSON.stringify(foundCI))

        if (foundCI && foundCI.length > 0) {
          rowId = foundCI[0].id
        }
      }
    }

    // If still no rowId the table may not have an `id` column — fall back to
    // updating directly by corridor + platform_id and return the first affected row.
    if (!rowId) {
      console.log('[platforms PATCH] no id column found — updating by corridor+platform_id directly')
      const { data: rows, error: updateErr } = await supabase
        .from('platforms')
        .update(updates)
        .eq('corridor', corridor)
        .eq('platform_id', platform_id)
        .select()

      if (updateErr) {
        console.error('[platforms PATCH] direct update error:', updateErr)
        return NextResponse.json({
          error: updateErr.message,
          debug: { corridor, platform_id },
        }, { status: 500 })
      }

      if (!rows || rows.length === 0) {
        return NextResponse.json({
          error: 'Platform not found — no matching row for corridor+platform_id',
          debug: { corridor, platform_id },
        }, { status: 404 })
      }

      return NextResponse.json(rows[0])
    }

    const { data, error } = await supabase
      .from('platforms')
      .update(updates)
      .eq('id', rowId)
      .select()
      .single()

    if (error) {
      console.error('[platforms PATCH] update by id error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[platforms PATCH] unhandled error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
