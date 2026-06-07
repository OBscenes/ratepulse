'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCIES = ['GBP', 'EUR', 'CAD', 'NGN', 'GHS']
const CURRENCY_SYMBOL = { GBP: '£', EUR: '€', CAD: 'CA$', NGN: '₦', GHS: 'GH₵' }
const WESTERN = new Set(['GBP', 'EUR', 'CAD'])
const LOCAL   = new Set(['NGN', 'GHS'])

function formatRateDisplay(corridor, rate) {
  const [from, to] = corridor.split('-')
  const isInverted = LOCAL.has(from) && WESTERN.has(to)
  const formatted  = rate.toLocaleString('en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  if (isInverted) {
    return `${formatted} ${from} per ${CURRENCY_SYMBOL[to] || to}1`
  }
  return `${formatted} ${to} per ${CURRENCY_SYMBOL[from] || from}1`
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const S = {
  card: {
    background: '#0d0d1a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '20px 22px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    padding: '7px 10px',
    outline: 'none',
  },
  th: {
    padding: '10px 14px', textAlign: 'left',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
    color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.07)',
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px', fontSize: 13, color: '#cbd5e1',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  btn: {
    padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
  },
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function AdminNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'platforms',    label: 'Platform Manager' },
    { id: 'rateHistory',  label: 'Rate History' },
    { id: 'leads',        label: 'Leads' },
    { id: 'votes',        label: 'Votes' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          style={{
            ...S.btn,
            background: activeTab === t.id ? 'rgba(59,130,246,0.2)' : 'transparent',
            color: activeTab === t.id ? '#60a5fa' : '#475569',
            border: `1px solid ${activeTab === t.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Platform Manager ──────────────────────────────────────────────────────────

function corridorLabel(id) {
  return id.replace('-', ' → ')
}

function PlatformCard({ row, midmarket, onSave }) {
  const [margin, setMargin] = useState(String(row.margin))
  const [active, setActive] = useState(row.active)
  const [type,   setType]   = useState(row.type)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [err,    setErr]    = useState('')

  const dirty = Number(margin) !== Number(row.margin) || active !== row.active || type !== row.type

  const effectiveRate = midmarket != null ? midmarket * (1 + Number(margin) / 100) : null
  const canSend    = type === 'sending'   || type === 'both'
  const canReceive = type === 'receiving' || type === 'both'

  async function save() {
    setSaving(true)
    setErr('')
    try {
      const res = await fetch('/api/platforms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, margin: Number(margin), active, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      onSave(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setErr(e.message)
    }
    setSaving(false)
  }

  return (
    <div style={{
      background: '#0a0a17',
      border: `1px solid ${active ? 'rgba(255,255,255,0.08)' : 'rgba(248,113,113,0.15)'}`,
      borderRadius: 12, padding: '18px 18px 14px',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: row.color, flexShrink: 0, boxShadow: `0 0 6px ${row.color}80` }} />
        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14, flex: 1 }}>{row.name}</span>
        <button
          onClick={() => setActive(a => !a)}
          style={{
            ...S.btn, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
            background: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            color: active ? '#4ade80' : '#f87171',
            border: `1px solid ${active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
          }}
        >
          {active ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Margin */}
      <label style={{ fontSize: 11, color: '#475569', marginBottom: 5 }}>Margin %</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <input
          type="number"
          step="0.0001"
          value={margin}
          onChange={e => setMargin(e.target.value)}
          style={{ ...S.input, flex: 1, textAlign: 'right', fontSize: 15, fontWeight: 600,
            color: Number(margin) >= 0 ? '#4ade80' : '#f87171' }}
        />
        <span style={{ color: '#475569', fontSize: 13 }}>%</span>
      </div>

      {/* Type */}
      <label style={{ fontSize: 11, color: '#475569', marginBottom: 5 }}>Direction</label>
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        style={{ ...S.input, cursor: 'pointer', marginBottom: 14, width: '100%' }}
      >
        <option value="sending">Sending</option>
        <option value="receiving">Receiving</option>
        <option value="both">Both</option>
      </select>

      {/* Save */}
      <button
        onClick={save}
        disabled={!dirty || saving}
        style={{
          ...S.btn, width: '100%', textAlign: 'center',
          background: saved
            ? 'rgba(74,222,128,0.15)'
            : dirty ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
          color: saved ? '#4ade80' : dirty ? '#93c5fd' : '#334155',
          border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : dirty ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
      </button>
      {err && <p style={{ fontSize: 11, color: '#f87171', marginTop: 6, textAlign: 'center' }}>{err}</p>}

      {/* Computed rates */}
      {effectiveRate != null && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Sending</span>
            <span style={{ fontSize: 12, color: canSend ? '#94a3b8' : '#334155', fontVariantNumeric: 'tabular-nums' }}>
              {canSend ? formatRateDisplay(row.corridor, effectiveRate) : 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Receiving</span>
            <span style={{ fontSize: 12, color: canReceive ? '#94a3b8' : '#334155', fontVariantNumeric: 'tabular-nums' }}>
              {canReceive ? formatRateDisplay(row.corridor, effectiveRate) : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function PlatformManager() {
  const [platforms,    setPlatforms]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [fromCurrency, setFromCurrency] = useState('GBP')
  const [toCurrency,   setToCurrency]   = useState('NGN')
  const [midmarkets,   setMidmarkets]   = useState({})

  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(data => { setPlatforms(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))

    fetch('/api/midmarket')
      .then(r => r.json())
      .then(data => {
        const { updatedAt: _, ...rates } = data
        setMidmarkets(rates)
      })
      .catch(() => {})
  }, [])

  function handleSave(updated) {
    setPlatforms(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const corridor = fromCurrency && toCurrency ? `${fromCurrency}-${toCurrency}` : ''
  const cards     = corridor ? platforms.filter(p => p.corridor === corridor) : []
  const midmarket = midmarkets[corridor] ?? null

  const selectStyle = { ...S.input, cursor: 'pointer', fontWeight: 600, width: 96 }

  return (
    <div style={S.card}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Platform Manager</h2>

      {/* Dual currency selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} style={selectStyle}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <span style={{ color: '#3b82f6', fontSize: 16, fontWeight: 700, userSelect: 'none' }}>→</span>

        <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} style={selectStyle}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {midmarket != null && corridor && fromCurrency !== toCurrency && (
          <span style={{ fontSize: 11, color: '#475569', marginLeft: 6 }}>
            mid-market: {formatRateDisplay(corridor, midmarket)}
          </span>
        )}
      </div>

      {fromCurrency === toCurrency ? (
        <p style={{ color: '#334155', fontSize: 13 }}>Select two different currencies.</p>
      ) : loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading platforms…</p>
      ) : cards.length === 0 ? (
        <p style={{ color: '#334155', fontSize: 13 }}>No platforms configured for {corridor}.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#334155', marginBottom: 16 }}>
            {cards.length} platform{cards.length !== 1 ? 's' : ''} · {corridor}
            {midmarket != null && (
              <span style={{ color: '#475569' }}> · baseline {formatRateDisplay(corridor, midmarket)}</span>
            )}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {cards.map(row => (
              <PlatformCard
                key={row.id ?? `${row.corridor}-${row.platform_id}`}
                row={row}
                midmarket={midmarket}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Rate History ──────────────────────────────────────────────────────────────

const CORRIDOR_OPTIONS = [
  'GBP-NGN','GBP-GHS','EUR-NGN','EUR-GHS',
  'NGN-GBP','GHS-GBP','NGN-EUR','GHS-EUR',
]

function RateHistoryChart() {
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [corridor,   setCorridor]   = useState('GBP-NGN')
  const [fromDate,   setFromDate]   = useState('')
  const [toDate,     setToDate]     = useState('')
  const [platforms,  setPlatforms]  = useState([])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ corridor })
    if (fromDate) params.set('from', new Date(fromDate).toISOString())
    if (toDate)   params.set('to',   new Date(toDate + 'T23:59:59').toISOString())

    const res  = await fetch(`/api/admin/rate-history?${params}`)
    const rows = await res.json()

    // Group rows into chart-friendly format: [{time, Platform1: rate, Platform2: rate}]
    const byTime = {}
    const pSet   = new Set()
    for (const r of (Array.isArray(rows) ? rows : [])) {
      const label = new Date(r.recorded_at).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      if (!byTime[label]) byTime[label] = { time: label }
      byTime[label][r.platform] = Number(r.rate.toFixed(2))
      pSet.add(r.platform)
    }

    setData(Object.values(byTime))
    setPlatforms([...pSet])
    setLoading(false)
  }, [corridor, fromDate, toDate])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const COLORS = ['#4ade80','#f59e0b','#60a5fa','#f87171','#a78bfa','#34d399','#fbbf24','#fb923c']

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginRight: 'auto' }}>Rate History</h2>
        <select value={corridor} onChange={e => setCorridor(e.target.value)} style={{ ...S.input, cursor: 'pointer' }}>
          {CORRIDOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={S.input} />
        <span style={{ color: '#475569' }}>→</span>
        <input type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   style={S.input} />
        <button onClick={fetchHistory} style={{ ...S.btn, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
          Apply
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#334155' }}>
          <p style={{ fontSize: 14 }}>No rate history yet for {corridor}.</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>History is logged every time the mid-market refreshes (every 60 s).</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false} width={64} />
            <Tooltip
              contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            {platforms.map((p, i) => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ── Leads Table ───────────────────────────────────────────────────────────────

function LeadsTable() {
  const [leads,   setLeads]   = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetch('/api/admin/leads')
      .then(r => r.json())
      .then(data => { setLeads(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function sort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...leads].sort((a, b) => {
    let va = a[sortKey] ?? ''
    let vb = b[sortKey] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
  })

  function SortIcon({ k }) {
    if (sortKey !== k) return <span style={{ color: '#334155' }}> ⇅</span>
    return <span style={{ color: '#60a5fa' }}> {sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function exportCSV() {
    window.open('/api/admin/leads?format=csv')
  }

  const COLS = [
    { key: 'email',         label: 'Email' },
    { key: 'corridor',      label: 'Corridor' },
    { key: 'voted_app',     label: 'Voted App' },
    { key: 'expected_rate', label: 'Expected Rate' },
    { key: 'created_at',    label: 'Date' },
  ]

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          Leads
          <span style={{ marginLeft: 8, fontSize: 12, color: '#475569', fontWeight: 400 }}>{leads.length} total</span>
        </h2>
        <button
          onClick={exportCSV}
          style={{ ...S.btn, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key} style={{ ...S.th, cursor: 'pointer', userSelect: 'none' }} onClick={() => sort(c.key)}>
                    {c.label}<SortIcon k={c.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(lead => (
                <tr key={lead.id}>
                  <td style={S.td}>{lead.email}</td>
                  <td style={S.td}>
                    {lead.corridor && (
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
                        {lead.corridor}
                      </span>
                    )}
                  </td>
                  <td style={S.td}>{lead.voted_app || <span style={{ color: '#334155' }}>—</span>}</td>
                  <td style={S.td}>{lead.expected_rate ?? <span style={{ color: '#334155' }}>—</span>}</td>
                  <td style={{ ...S.td, color: '#475569' }}>
                    {lead.created_at ? new Date(lead.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#334155', padding: 32 }}>No leads yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Votes Table ───────────────────────────────────────────────────────────────

function VotesTable() {
  const [votes,   setVotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/votes')
      .then(r => r.json())
      .then(data => { setVotes(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped = votes.reduce((acc, v) => {
    if (!acc[v.corridor]) acc[v.corridor] = []
    acc[v.corridor].push(v)
    return acc
  }, {})

  return (
    <div style={S.card}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          Community Votes
          <span style={{ marginLeft: 8, fontSize: 12, color: '#475569', fontWeight: 400 }}>
            {votes.reduce((s, v) => s + (v.count || 0), 0)} total
          </span>
        </h2>
      </div>

      {loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {Object.entries(grouped).map(([corridor, rows]) => {
            const total = rows.reduce((s, r) => s + (r.count || 0), 0)
            return (
              <div key={corridor} style={{ ...S.card, padding: '16px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.5px', marginBottom: 12 }}>{corridor}</p>
                {rows.map(r => (
                  <div key={r.app_id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#cbd5e1' }}>{r.app_id}</span>
                      <span style={{ fontSize: 12, color: '#475569' }}>{r.count} vote{r.count !== 1 ? 's' : ''} · {r.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${r.pct}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: '#334155', marginTop: 10 }}>{total} total votes</p>
              </div>
            )
          })}
          {Object.keys(grouped).length === 0 && (
            <p style={{ color: '#334155', fontSize: 13 }}>No votes yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const [stats,      setStats]      = useState(null)
  const [reloading,  setReloading]  = useState(false)
  const [reloadMsg,  setReloadMsg]  = useState('')
  const [countdown,  setCountdown]  = useState(null)

  const fetchStats = useCallback(async () => {
    const res  = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
    setCountdown(data.nextUpdateIn)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // Tick the countdown every second
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleReload() {
    setReloading(true)
    setReloadMsg('')
    try {
      const res  = await fetch('/api/admin/reload', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReloadMsg('Rates refreshed!')
      fetchStats()
      setCountdown(60)
    } catch (e) {
      setReloadMsg(e.message)
    }
    setReloading(false)
    setTimeout(() => setReloadMsg(''), 4000)
  }

  const statItems = [
    { label: 'Total Leads',      value: stats?.totalLeads      ?? '—' },
    { label: 'Total Votes',      value: stats?.totalVotes      ?? '—' },
    { label: 'Active Platforms', value: stats?.activePlatforms ?? '—' },
  ]

  return (
    <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats */}
      <div style={S.card}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#3b82f6', marginBottom: 14 }}>QUICK STATS</p>
        {statItems.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Rate refresh status */}
      <div style={S.card}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#3b82f6', marginBottom: 14 }}>MID-MARKET RATE</p>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Last updated</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            {stats?.lastUpdated
              ? new Date(stats.lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : <span style={{ color: '#334155' }}>Not yet refreshed</span>
            }
          </p>
        </div>

        {countdown !== null && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Next auto-refresh in</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: countdown <= 10 ? '#f59e0b' : '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>
              {countdown}s
            </p>
          </div>
        )}

        <button
          onClick={handleReload}
          disabled={reloading}
          style={{
            ...S.btn,
            width: '100%', textAlign: 'center',
            background: reloading ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.18)',
            color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)',
            opacity: reloading ? 0.7 : 1,
          }}
        >
          {reloading ? 'Refreshing…' : '↺ Reload Rates Now'}
        </button>

        {reloadMsg && (
          <p style={{ fontSize: 12, marginTop: 8, color: reloadMsg.includes('!') ? '#4ade80' : '#f87171', textAlign: 'center' }}>
            {reloadMsg}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('platforms')

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(8,8,15,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 28px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>RP</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>RatePulse</span>
          <span style={{ fontSize: 12, color: '#334155', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>Admin</span>
        </div>
        <a href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>← Back to site</a>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: 20, padding: '28px 28px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'platforms'   && <PlatformManager />}
          {activeTab === 'rateHistory' && <RateHistoryChart />}
          {activeTab === 'leads'       && <LeadsTable />}
          {activeTab === 'votes'       && <VotesTable />}
        </div>

        {/* Right sidebar */}
        <Sidebar />
      </div>
    </div>
  )
}
