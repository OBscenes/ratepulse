'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Constants ─────────────────────────────────────────────────────────────────

const DIASPORA_CURRENCIES = ['GBP', 'USD', 'CAD', 'EUR']
const AFRICAN_CURRENCIES  = ['NGN', 'GHS', 'KES']
const CURRENCY_FLAGS = { GBP: '🇬🇧', EUR: '🇪🇺', CAD: '🇨🇦', USD: '🇺🇸', NGN: '🇳🇬', GHS: '🇬🇭', KES: '🇰🇪' }

const ALL_12_CORRIDORS = [
  'gbp-ngn', 'gbp-ghs', 'gbp-kes',
  'usd-ngn', 'usd-ghs', 'usd-kes',
  'cad-ngn', 'cad-ghs', 'cad-kes',
  'eur-ngn', 'eur-ghs', 'eur-kes',
]

function corridorDisplayLabel(c) {
  const [from, to] = c.toUpperCase().split('-')
  return `${CURRENCY_FLAGS[from] ?? ''} ${from} → ${CURRENCY_FLAGS[to] ?? ''} ${to}`
}

function corridorLabel(c) {
  const [from, to] = c.split('-')
  return `${CURRENCY_FLAGS[from] ?? ''}${from} → ${CURRENCY_FLAGS[to] ?? ''}${to}`
}

function timeAgo(isoString) {
  if (!isoString) return null
  const secs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
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

function PlatformCard({ row, onSave }) {
  const [sendingRate,   setSendingRate]   = useState(row.sending_rate   != null ? String(row.sending_rate)   : '')
  const [receivingRate, setReceivingRate] = useState(row.receiving_rate != null ? String(row.receiving_rate) : '')
  const [active,    setActive]    = useState(row.active)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [toggling,  setToggling]  = useState(false)
  const [err,       setErr]       = useState('')
  const [updatedAt, setUpdatedAt] = useState(row.updated_at ?? null)

  const parsedSending   = sendingRate   === '' ? null : (isNaN(Number(sendingRate))   ? null : Number(sendingRate))
  const parsedReceiving = receivingRate === '' ? null : (isNaN(Number(receivingRate)) ? null : Number(receivingRate))

  // Availability is saved instantly on toggle — only rate changes need the Save button
  const dirty =
    parsedSending   !== (row.sending_rate   ?? null) ||
    parsedReceiving !== (row.receiving_rate ?? null)

  async function toggleAvailability() {
    const newActive = !active
    setActive(newActive)
    setToggling(true)
    setErr('')
    try {
      const res = await fetch('/api/platforms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, corridor: row.corridor, platform_id: row.platform_id, active: newActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Toggle failed')
      onSave(data)
    } catch (e) {
      setActive(!newActive) // revert on error
      setErr(e.message)
    }
    setToggling(false)
  }

  async function save() {
    setSaving(true)
    setErr('')
    try {
      const res = await fetch('/api/platforms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:             row.id,
          corridor:       row.corridor,
          platform_id:    row.platform_id,
          sending_rate:   parsedSending,
          receiving_rate: parsedReceiving,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      onSave(data)
      setSaved(true)
      setUpdatedAt(data.updated_at)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setErr(e.message)
    }
    setSaving(false)
  }

  const rateInputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.14)',
    borderRadius: 8, color: '#f1f5f9',
    fontSize: 22, fontWeight: 600,
    padding: '10px 14px', outline: 'none',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.3px',
  }

  const fieldLabelStyle = {
    display: 'block', marginBottom: 5,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
    color: '#475569', textTransform: 'uppercase',
  }

  return (
    <div style={{
      background: '#0a0a17',
      border: `1px solid ${active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
      borderRadius: 12, padding: '16px 16px 12px',
      display: 'flex', flexDirection: 'column', gap: 0,
      opacity: active ? 1 : 0.5,
      transition: 'opacity 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0, boxShadow: `0 0 6px ${row.color}80` }} />
        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14, flex: 1 }}>{row.name}</span>
        {/* Per-corridor availability toggle — saves immediately */}
        <button
          onClick={toggleAvailability}
          disabled={toggling}
          title={active ? 'Hide from users on this corridor' : 'Show to users on this corridor'}
          style={{ background: 'none', border: 'none', cursor: toggling ? 'wait' : 'pointer', padding: 0, opacity: toggling ? 0.5 : 1, flexShrink: 0 }}
        >
          <div style={{
            width: 34, height: 19, borderRadius: 10, position: 'relative',
            background: active ? '#4ade80' : 'rgba(255,255,255,0.14)',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2.5, left: active ? 17 : 2.5,
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }} />
          </div>
        </button>
      </div>

      {/* Sending Rate */}
      <label style={fieldLabelStyle}>Sending Rate</label>
      <input
        type="number"
        step="any"
        min="0"
        value={sendingRate}
        onChange={e => setSendingRate(e.target.value)}
        placeholder="—"
        aria-label={`${row.name} sending rate`}
        style={{ ...rateInputStyle, marginBottom: 12 }}
      />

      {/* Receiving Rate */}
      <label style={fieldLabelStyle}>Receiving Rate</label>
      <input
        type="number"
        step="any"
        min="0"
        value={receivingRate}
        onChange={e => setReceivingRate(e.target.value)}
        placeholder="—"
        aria-label={`${row.name} receiving rate`}
        style={{ ...rateInputStyle, marginBottom: 14 }}
      />

      {/* Save rates */}
      <button
        onClick={save}
        disabled={!dirty || saving}
        style={{
          ...S.btn, width: '100%', textAlign: 'center', fontSize: 14, padding: '9px 14px',
          background: saved
            ? 'rgba(74,222,128,0.15)'
            : dirty ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.04)',
          color: saved ? '#4ade80' : dirty ? '#93c5fd' : '#334155',
          border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : dirty ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Rates'}
      </button>

      {err && <p style={{ fontSize: 11, color: '#f87171', marginTop: 6, textAlign: 'center' }}>{err}</p>}

      <p style={{ fontSize: 10, color: '#334155', marginTop: 8, textAlign: 'center' }}>
        {updatedAt ? `Last updated ${timeAgo(updatedAt)}` : 'Never updated'}
      </p>
    </div>
  )
}

// ── Add Platform Modal ────────────────────────────────────────────────────────

function AddPlatformModal({ onClose, onAdded }) {
  const [name,              setName]              = useState('')
  const [platformId,        setPlatformId]        = useState('')
  const [idTouched,         setIdTouched]         = useState(false)
  const [color,             setColor]             = useState('#60a5fa')
  const [selectedCorridors, setSelectedCorridors] = useState(new Set(ALL_12_CORRIDORS))
  const [saving,            setSaving]            = useState(false)
  const [err,               setErr]               = useState('')

  useEffect(() => {
    if (!idTouched) setPlatformId(name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  }, [name])

  function toggleCorridor(c) {
    setSelectedCorridors(prev => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }

  async function handleSave() {
    if (!name.trim() || !platformId.trim()) { setErr('Platform name and ID are required.'); return }
    if (selectedCorridors.size === 0)        { setErr('Select at least one corridor.');       return }
    setSaving(true)
    setErr('')
    try {
      const res = await fetch('/api/platforms', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:        name.trim(),
          platform_id: platformId.trim(),
          color,
          corridors:   [...selectedCorridors],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add platform')
      onAdded(Array.isArray(data) ? data : [data])
    } catch (e) {
      setErr(e.message)
    }
    setSaving(false)
  }

  const fl = { display: 'block', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: '#475569', textTransform: 'uppercase' }
  const fi = { ...S.input, width: '100%', boxSizing: 'border-box', fontSize: 14 }
  const canSave = !saving && name.trim() && platformId.trim() && selectedCorridors.size > 0

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '26px 28px', width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Add Platform</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* Name */}
        <label style={fl}>Platform Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. LemFi" style={{ ...fi, marginBottom: 14 }} />

        {/* ID */}
        <label style={fl}>
          Platform ID{' '}
          <span style={{ color: '#334155', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>— auto-generated, editable</span>
        </label>
        <input
          value={platformId}
          onChange={e => { setPlatformId(e.target.value); setIdTouched(true) }}
          placeholder="e.g. lemfi"
          style={{ ...fi, marginBottom: 14, fontFamily: 'monospace' }}
        />

        {/* Color */}
        <label style={fl}>Color</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: 40, height: 38, border: 'none', background: 'none', cursor: 'pointer', padding: 2, borderRadius: 6, flexShrink: 0 }}
          />
          <input value={color} onChange={e => setColor(e.target.value)} placeholder="#60a5fa" style={{ ...fi }} />
        </div>

        {/* Corridors */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ ...fl, marginBottom: 0 }}>
            Corridors <span style={{ color: '#334155', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>({selectedCorridors.size} selected)</span>
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['All', () => setSelectedCorridors(new Set(ALL_12_CORRIDORS))], ['None', () => setSelectedCorridors(new Set())]].map(([label, fn]) => (
              <button key={label} onClick={fn} style={{ ...S.btn, padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.09)' }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 22 }}>
          {ALL_12_CORRIDORS.map(c => {
            const checked = selectedCorridors.has(c)
            return (
              <label key={c} style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                padding: '7px 10px', borderRadius: 8, userSelect: 'none',
                background: checked ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${checked ? 'rgba(59,130,246,0.28)' : 'rgba(255,255,255,0.07)'}`,
                fontSize: 12, color: checked ? '#93c5fd' : '#64748b',
              }}>
                <input type="checkbox" checked={checked} onChange={() => toggleCorridor(c)} style={{ accentColor: '#3b82f6', width: 13, height: 13, flexShrink: 0 }} />
                {corridorDisplayLabel(c)}
              </label>
            )
          })}
        </div>

        {err && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 14 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ ...S.btn, flex: 1, background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{ ...S.btn, flex: 2, textAlign: 'center', background: 'rgba(59,130,246,0.18)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.38)', opacity: canSave ? 1 : 0.45 }}
          >
            {saving ? 'Adding…' : `Add to ${selectedCorridors.size} corridor${selectedCorridors.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Platform Manager ──────────────────────────────────────────────────────────

function PlatformManager() {
  const [platforms,    setPlatforms]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [fromCurrency, setFromCurrency] = useState('GBP')
  const [toCurrency,   setToCurrency]   = useState('NGN')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(data => {
        const rows = Array.isArray(data) ? data : []
        console.log('[PlatformManager] fetched', rows.length, 'platforms')
        if (rows.length > 0) {
          console.log('[PlatformManager] first row:', JSON.stringify({
            id: rows[0].id,
            corridor: rows[0].corridor,
            platform_id: rows[0].platform_id,
          }))
        }
        setPlatforms(rows)
        setLoading(false)
      })
      .catch(err => {
        console.error('[PlatformManager] fetch error:', err)
        setLoading(false)
      })
  }, [])

  function handleSave(updated) {
    setPlatforms(prev => prev.map(p => p.id == updated.id ? updated : p))
  }

  function handleAdded(newRows) {
    setPlatforms(prev => {
      const existing = new Set(prev.map(p => `${p.corridor}|${p.platform_id}`))
      const toAdd = newRows.filter(r => !existing.has(`${r.corridor}|${r.platform_id}`))
      return [...prev, ...toAdd]
    })
    setShowAddModal(false)
  }

  const corridor = fromCurrency && toCurrency ? `${fromCurrency}-${toCurrency}` : ''
  const corridorUpper = corridor.toUpperCase()
  const cards    = corridor
    ? platforms.filter(p => (p.corridor ?? '').toUpperCase() === corridorUpper)
    : []

  const flagLabel   = c => `${CURRENCY_FLAGS[c] ?? ''} ${c}`
  const selectStyle = { ...S.input, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: 120 }
  const labelStyle  = { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: '#475569', textTransform: 'uppercase', marginBottom: 5 }

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Platform Manager</h2>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            ...S.btn, background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.35)',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span> Add Platform
        </button>
      </div>

      {/* Dual currency selectors */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Diaspora Countries</label>
          <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} style={selectStyle}>
            {DIASPORA_CURRENCIES.map(c => <option key={c} value={c}>{flagLabel(c)}</option>)}
          </select>
        </div>

        <span style={{ color: '#3b82f6', fontSize: 16, fontWeight: 700, userSelect: 'none', paddingBottom: 8 }}>→</span>

        <div>
          <label style={labelStyle}>African Countries</label>
          <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} style={selectStyle}>
            {AFRICAN_CURRENCIES.map(c => <option key={c} value={c}>{flagLabel(c)}</option>)}
          </select>
        </div>
      </div>

      {fromCurrency === toCurrency ? (
        <p style={{ color: '#334155', fontSize: 13 }}>Select two different currencies.</p>
      ) : loading ? (
        <p style={{ color: '#475569', fontSize: 13 }}>Loading platforms…</p>
      ) : cards.length === 0 ? (
        <p style={{ color: '#334155', fontSize: 13 }}>No platforms configured for {corridorLabel(corridor)}.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#334155', marginBottom: 16 }}>
            {cards.length} platform{cards.length !== 1 ? 's' : ''} · {corridorLabel(corridor)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {cards.map(row => (
              <PlatformCard
                key={row.id ?? `${row.corridor}-${row.platform_id}`}
                row={row}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      )}

      {showAddModal && <AddPlatformModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />}
    </div>
  )
}

// ── Rate History ──────────────────────────────────────────────────────────────

const CORRIDOR_OPTIONS = [
  'GBP-NGN','GBP-GHS','EUR-NGN','EUR-GHS',
  'NGN-GBP','GHS-GBP','NGN-EUR','GHS-EUR',
  'USD-NGN','USD-GHS','NGN-USD','GHS-USD',
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
          {CORRIDOR_OPTIONS.map(c => <option key={c} value={c}>{corridorLabel(c)}</option>)}
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

// ── Currency Visibility ───────────────────────────────────────────────────────

function CurrencyVisibility() {
  const [settings, setSettings] = useState([
    { currency: 'GBP', visible: true },
    { currency: 'EUR', visible: true },
    { currency: 'USD', visible: true },
    { currency: 'CAD', visible: true },
  ])
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    fetch('/api/currency-settings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSettings(data) })
      .catch(() => {})
  }, [])

  async function toggle(currency) {
    const current = settings.find(s => s.currency === currency)
    if (!current) return
    const newVisible = !current.visible
    setSettings(prev => prev.map(s => s.currency === currency ? { ...s, visible: newVisible } : s))
    setSaving(currency)
    try {
      const res = await fetch('/api/currency-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, visible: newVisible }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      setSettings(prev => prev.map(s => s.currency === currency ? { ...s, visible: !newVisible } : s))
    }
    setSaving(null)
  }

  return (
    <div style={S.card}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#3b82f6', marginBottom: 14 }}>CURRENCY VISIBILITY</p>
      {settings.map(s => (
        <div key={s.currency} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>
            {CURRENCY_FLAGS[s.currency]} {s.currency}
          </span>
          <button
            onClick={() => toggle(s.currency)}
            disabled={saving === s.currency}
            style={{ background: 'none', border: 'none', cursor: saving === s.currency ? 'wait' : 'pointer', padding: 0, opacity: saving === s.currency ? 0.5 : 1 }}
          >
            <div style={{
              width: 34, height: 19, borderRadius: 10, position: 'relative',
              background: s.visible ? '#4ade80' : 'rgba(255,255,255,0.14)',
              transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 2.5, left: s.visible ? 17 : 2.5,
                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }} />
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const [stats, setStats] = useState(null)

  const fetchStats = useCallback(async () => {
    const res  = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const statItems = [
    { label: 'Total Leads',      value: stats?.totalLeads      ?? '—' },
    { label: 'Total Votes',      value: stats?.totalVotes      ?? '—' },
    { label: 'Active Platforms', value: stats?.activePlatforms ?? '—' },
  ]

  return (
    <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={S.card}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: '#3b82f6', marginBottom: 14 }}>QUICK STATS</p>
        {statItems.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
          </div>
        ))}
      </div>
      <CurrencyVisibility />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('platforms')
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>← Back to site</a>
          <button
            onClick={handleLogout}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1px solid rgba(248,113,113,0.3)',
              background: 'rgba(248,113,113,0.08)', color: '#f87171',
              transition: 'opacity 0.15s',
            }}
          >
            Logout
          </button>
        </div>
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
