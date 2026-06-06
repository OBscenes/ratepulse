import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')

  const { data, error } = await supabase
    .from('leads')
    .select('id, email, corridor, voted_app, expected_rate, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data || []

  if (format === 'csv') {
    const header = 'Email,Corridor,Voted App,Expected Rate,Date\n'
    const csv = rows.map(r =>
      [
        `"${r.email}"`,
        r.corridor  || '',
        r.voted_app || '',
        r.expected_rate ?? '',
        r.created_at ? new Date(r.created_at).toISOString() : '',
      ].join(',')
    ).join('\n')

    return new Response(header + csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ratepulse-leads.csv"',
      },
    })
  }

  return NextResponse.json(rows)
}
