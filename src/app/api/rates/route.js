import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const corridor = searchParams.get('corridor')
  if (!corridor) return NextResponse.json({ average: null, count: 0 })

  const { data, error } = await supabase
    .from('expected_rates')
    .select('rate')
    .eq('corridor', corridor)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const count = data?.length || 0
  const average = count > 0
    ? data.reduce((sum, r) => sum + Number(r.rate), 0) / count
    : null

  return NextResponse.json({ average, count })
}

export async function POST(request) {
  const { corridor, rate } = await request.json()
  if (!corridor || !rate) {
    return NextResponse.json({ error: 'Missing corridor or rate' }, { status: 400 })
  }

  const numRate = Number(rate)
  if (isNaN(numRate) || numRate <= 0) {
    return NextResponse.json({ error: 'Invalid rate' }, { status: 400 })
  }

  const { error } = await supabase
    .from('expected_rates')
    .insert({ corridor, rate: numRate })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = await supabase
    .from('expected_rates')
    .select('rate')
    .eq('corridor', corridor)

  const count = data?.length || 1
  const average = data.reduce((sum, r) => sum + Number(r.rate), 0) / count

  return NextResponse.json({ average, count })
}
