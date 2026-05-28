import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
  return NextResponse.json({ count: error ? 0 : (count || 0) })
}

export async function POST(request) {
  const { email, corridor, voted_app, expected_rate } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json({ success: true, alreadySubscribed: true })
  }

  const { error } = await supabase
    .from('leads')
    .insert({
      email,
      corridor: corridor || null,
      voted_app: voted_app || null,
      expected_rate: expected_rate ? Number(expected_rate) : null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
