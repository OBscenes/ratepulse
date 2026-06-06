'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

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

function PlatformRow({ row, onSave }) {
  const [margin, setMargin] = useState(String(row.margin))
  const [active, setActive] = useState(row.active)
  const [type,   setType]   = useState(row.type)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const dirty = Number(margin) !== row.margin || active !== row.active || type !== row.type

  async function save() {
    setSaving(true)
    const res = await fetch('/api/platforms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, margin: Number(margin), active, type }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      onSave(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <tr>
      <td style={S.td}>
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
        }}>{row.corridor}</span>
      </td>
      <td style={{ ...S.td, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0, display: 'inline-block' }} />
        {row.name}
      </td>
      <td style={S.td}>
        <input
          type="number"
          step="0.0001"
          value={margin}
          onChange={e => setMargin(e.target.value)}
          style={{ ...S.input, width: 100, textAlign: 'right' }}
        />
        <span style={{ color: '#475569', fontSize: 12, marginLeft: 4 }}>%</span>
      </td>
      <td style={S.td}>
        <button
          onClick={() => setActive(a => !a)}
          style={{
            ...S.btn,
            padding: '4px 12px', fontSize: 11,
            background: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
            color: active ? '#4ade80' : '#f87171',
            border: `1px solid ${active ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
          }}
        >
          {active ? 'ON' : 'OFF'}
        </button>
      </td>
      <td style={S.td}>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ ...S.input, cursor: 'pointer' }}
        >
          <option value="sending">Sending</option>
          <option value="receiving">Receiving</option>
          <option value="both">Both</option>
        </select>
      </td>
      <td style={S.td}>
        <button
          onClick={save}
          disabled={!dirty || saving}
          style={{
            ...S.btn,
            background: saved ? 'rgba(74,222,128,0.15)' : dirty ? '#3b82f6' : 'rgba(255,255,255,0.05)',
            color: saved ? '#4ade80' : dirty ? '#fff' : '#334155',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? '…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </td>
    </tr>
  )
}

function PlatformManager() {
  const [platforms, setPlatforms] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')

  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(data => { setPlatforms(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleSave(updated) {
    setPlatforms(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const visible = platforms.filter(p =>
    !filter || p.corridor.includes(filter.toUpperCase()) || p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Platform Manager</h2>
        <input
          placeholder="Filter by corridor or name…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ ...S.input, width: 220 }}
        />
      </div>

      {loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading platforms…</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Corridor', 'Platform', 'Margin', 'Active', 'Type', ''].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(row => (
                <PlatformRow key={row.id ?? `${row.corridor}-${row.platform_id}`} row={row} onSave={handleSave} />
              ))}
            </tbody>
          </table>
        </div>
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
