'use client'
import { useState, useEffect } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const CORRIDORS = {
  'GBP-NGN': {
    id: 'GBP-NGN',
    label: 'GBP → NGN',
    from: 'GBP', fromFlag: '🇬🇧',
    to: 'NGN',   toFlag: '🇳🇬',
    midmarket: 2120,
    apps: [
      { id: 'wise',         name: 'Wise',          rate: 2087, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         rate: 2095, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       rate: 2080, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    rate: 2065, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      rate: 2090, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', rate: 2040, color: '#fbbf24' },
    ],
  },
  'GBP-GHS': {
    id: 'GBP-GHS',
    label: 'GBP → GHS',
    from: 'GBP', fromFlag: '🇬🇧',
    to: 'GHS',   toFlag: '🇬🇭',
    midmarket: 18.20,
    apps: [
      { id: 'wise',         name: 'Wise',          rate: 17.85, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         rate: 17.92, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       rate: 17.78, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    rate: 17.65, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      rate: 17.88, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', rate: 17.50, color: '#fbbf24' },
    ],
  },
  'EUR-NGN': {
    id: 'EUR-NGN',
    label: 'EUR → NGN',
    from: 'EUR', fromFlag: '🇪🇺',
    to: 'NGN',   toFlag: '🇳🇬',
    midmarket: 1820,
    apps: [
      { id: 'wise',         name: 'Wise',          rate: 1785, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         rate: 1792, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       rate: 1778, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    rate: 1765, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      rate: 1788, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', rate: 1750, color: '#fbbf24' },
    ],
  },
  'EUR-GHS': {
    id: 'EUR-GHS',
    label: 'EUR → GHS',
    from: 'EUR', fromFlag: '🇪🇺',
    to: 'GHS',   toFlag: '🇬🇭',
    midmarket: 15.60,
    apps: [
      { id: 'wise',         name: 'Wise',          rate: 15.25, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         rate: 15.32, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       rate: 15.18, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    rate: 15.05, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      rate: 15.28, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', rate: 14.90, color: '#fbbf24' },
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRate(rate, to) {
  if (to === 'NGN') return Number(rate).toLocaleString('en-GB', { maximumFractionDigits: 0 })
  return Number(rate).toFixed(2)
}

function spreadColor(pct) {
  const abs = Math.abs(pct)
  if (abs <= 1.0) return '#4ade80'
  if (abs <= 2.0) return '#f59e0b'
  if (abs <= 3.0) return '#fb923c'
  return '#f87171'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,8,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px',
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
        }}>RP</div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>RatePulse</span>
      </div>
      <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
        Live community data
      </span>
    </nav>
  )
}

function CorridorTabs({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, justifyContent: 'center',
      flexWrap: 'wrap', padding: '0 24px',
    }}>
      {Object.values(CORRIDORS).map(c => {
        const isActive = active === c.id
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            style={{
              padding: '10px 22px',
              borderRadius: 50,
              border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
              color: isActive ? '#60a5fa' : '#94a3b8',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {c.fromFlag} {c.label} {c.toFlag}
          </button>
        )
      })}
    </div>
  )
}

function MidMarketBar({ corridor }) {
  const c = CORRIDORS[corridor]
  const formatted = formatRate(c.midmarket, c.to)
  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: '0 24px',
    }}>
      <div style={{
        background: 'rgba(59,130,246,0.07)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: '#94a3b8',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>Mid-market rate</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
          1 {c.from} = {formatted} {c.to}
        </span>
        <span style={{ fontSize: 12, color: '#475569', marginLeft: 'auto' }}>
          Every app below charges a spread on this. The gap is their fee.
        </span>
      </div>
    </div>
  )
}

function VoteBar({ label, pct, color, isVoted }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: 11, color: isVoted ? '#60a5fa' : '#475569', fontWeight: isVoted ? 600 : 400 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isVoted ? '#3b82f6' : 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

function RateCard({ app, corridor, midmarket, to, from, rank, totalApps, hasVoted, votedApp, votes, totalVotes, onVote, voteLoading }) {
  const spread = ((app.rate - midmarket) / midmarket) * 100
  const isBest = rank === 0
  const isVotedApp = votedApp === app.id
  const appVoteCount = votes.find(v => v.app_id === app.id)?.count || 0
  const votePct = totalVotes > 0 ? Math.round((appVoteCount / totalVotes) * 100) : 0

  return (
    <div style={{
      background: '#0d0d1a',
      border: `1px solid ${isVotedApp ? '#3b82f6' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 16,
      padding: '22px 22px 18px',
      display: 'flex', flexDirection: 'column', gap: 0,
      transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.2s',
      boxShadow: isVotedApp ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.1)' : '0 1px 3px rgba(0,0,0,0.3)',
      animation: 'fadeUp 0.4s ease forwards',
      animationDelay: `${rank * 60}ms`,
      opacity: 0,
    }}
      onMouseEnter={e => {
        if (!isVotedApp) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = isVotedApp ? '0 0 0 1px rgba(59,130,246,0.4), 0 12px 40px rgba(59,130,246,0.15)' : '0 8px 24px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={e => {
        if (!isVotedApp) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isVotedApp ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.1)' : '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: app.color,
            boxShadow: `0 0 8px ${app.color}80`,
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{app.name}</span>
        </div>
        {isBest && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            border: '1px solid rgba(74,222,128,0.25)',
            letterSpacing: '0.5px',
          }}>BEST RATE</span>
        )}
        {isVotedApp && !isBest && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)',
            letterSpacing: '0.5px',
          }}>YOUR PICK</span>
        )}
      </div>

      {/* Rate */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>
          {formatRate(app.rate, to)}
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>
        {to} per 1 {from}
      </p>

      {/* Spread badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 6, padding: '5px 10px',
        marginBottom: 18, alignSelf: 'flex-start',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={spreadColor(spread)} strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        <span style={{ fontSize: 12, color: spreadColor(spread), fontWeight: 500 }}>
          {Math.abs(spread).toFixed(1)}% below mid-market
        </span>
      </div>

      {/* Vote area */}
      {hasVoted ? (
        <div>
          <VoteBar
            label={`${appVoteCount} vote${appVoteCount !== 1 ? 's' : ''}`}
            pct={votePct}
            color={app.color}
            isVoted={isVotedApp}
          />
          {isVotedApp && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: '#60a5fa',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              You voted for {app.name}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => onVote(app.id)}
          disabled={voteLoading}
          style={{
            width: '100%', padding: '11px 0',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 10,
            color: '#60a5fa', fontSize: 13, fontWeight: 600,
            cursor: voteLoading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
            e.currentTarget.style.color = '#93c5fd'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
            e.currentTarget.style.color = '#60a5fa'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          Works for me
        </button>
      )}
    </div>
  )
}

function ExpectedRateSection({ corridor, communityRate, onSubmit, submitted, submitting }) {
  const [input, setInput] = useState('')
  const c = CORRIDORS[corridor]
  const placeholder = c.to === 'NGN' ? 'e.g. 2150' : 'e.g. 18.50'

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    onSubmit(input.trim())
    setInput('')
  }

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: '0 24px',
    }}>
      <div style={{
        background: '#0d0d1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>

          {/* Left: form */}
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '1.5px', marginBottom: 8 }}>
              COMMUNITY PULSE
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.3px' }}>
              What rate do you expect?
            </h3>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 20, lineHeight: 1.6 }}>
              Tell us what rate you consider fair for {c.from} → {c.to}. Your response shapes the community benchmark.
            </p>

            {submitted ? (
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: '#4ade80',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Thanks — your response has been counted.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, color: '#475569', fontWeight: 600, pointerEvents: 'none',
                  }}>
                    {c.to}
                  </span>
                  <input
                    type="number"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '12px 14px 12px 48px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, color: '#fff', fontSize: 14,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input || submitting}
                  style={{
                    padding: '12px 22px',
                    background: input ? '#3b82f6' : 'rgba(59,130,246,0.2)',
                    border: 'none', borderRadius: 10,
                    color: input ? '#fff' : '#475569',
                    fontSize: 14, fontWeight: 600, cursor: input ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </form>
            )}
          </div>

          {/* Right: community average */}
          {communityRate.count > 0 && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 16, padding: '24px 32px',
              minWidth: 180,
            }}>
              <p style={{ fontSize: 12, color: '#475569', marginBottom: 8, letterSpacing: '0.5px' }}>
                COMMUNITY EXPECTS
              </p>
              <p style={{ fontSize: 40, fontWeight: 800, color: '#60a5fa', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {formatRate(communityRate.average, c.to)}
              </p>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                {c.to} per 1 {c.from}
              </p>
              <p style={{ fontSize: 11, color: '#334155', marginTop: 10 }}>
                Based on {communityRate.count} response{communityRate.count !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmailCapture({ corridor, votedApp, expectedRate }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const c = CORRIDORS[corridor]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, corridor, voted_app: votedApp, expected_rate: expectedRate }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: '0 24px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 20, padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(59,130,246,0.12)',
          border: '1px solid rgba(59,130,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.4px' }}>
          Get rate alerts for {c.from} → {c.to}
        </h3>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 28, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
          We'll notify you the moment any app moves the rate on this corridor. No spam, just signal.
        </p>

        {submitted ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 24px', borderRadius: 12,
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            fontSize: 14, color: '#4ade80', fontWeight: 500,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            You're on the list — we'll alert you at {email}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 460, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                flex: 1, minWidth: 220, padding: '13px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Adding you…' : (
                <>
                  Notify me
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
        {error && <p style={{ fontSize: 13, color: '#f87171', marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 24px',
      textAlign: 'center',
      color: '#1e293b',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
        }}>RP</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>RatePulse</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6 }}>
        Community-driven exchange rate data for the Nigerian & Ghanaian diaspora.
        <br />Rates are community-reported and for informational purposes only.
      </p>
    </footer>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeCorridor, setActiveCorridor] = useState('GBP-NGN')
  const [votedApps, setVotedApps] = useState({})
  const [votes, setVotes]   = useState({})
  const [communityRates, setCommunityRates] = useState({})
  const [rateInputs, setRateInputs] = useState({})
  const [rateSubmitted, setRateSubmitted] = useState({})
  const [rateSubmitting, setRateSubmitting] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)

  // Load localStorage vote state on mount
  useEffect(() => {
    const stored = {}
    Object.keys(CORRIDORS).forEach(c => {
      const v = localStorage.getItem(`rp_voted_${c}`)
      if (v) stored[c] = v
    })
    setVotedApps(stored)

    // Also check submitted rates
    const submittedRates = {}
    Object.keys(CORRIDORS).forEach(c => {
      if (localStorage.getItem(`rp_rate_${c}`)) submittedRates[c] = true
    })
    setRateSubmitted(submittedRates)
  }, [])

  // Fetch data when corridor changes
  useEffect(() => {
    fetchVotes(activeCorridor)
    fetchRates(activeCorridor)
  }, [activeCorridor])

  async function fetchVotes(corridor) {
    try {
      const res = await fetch(`/api/votes?corridor=${corridor}`)
      const data = await res.json()
      setVotes(prev => ({ ...prev, [corridor]: data.votes || [] }))
    } catch {}
  }

  async function fetchRates(corridor) {
    try {
      const res = await fetch(`/api/rates?corridor=${corridor}`)
      const data = await res.json()
      setCommunityRates(prev => ({ ...prev, [corridor]: data }))
    } catch {}
  }

  async function handleVote(appId) {
    if (votedApps[activeCorridor] || voteLoading) return
    setVoteLoading(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor: activeCorridor, app_id: appId }),
      })
      const data = await res.json()
      setVotes(prev => ({ ...prev, [activeCorridor]: data.votes || [] }))
      setVotedApps(prev => ({ ...prev, [activeCorridor]: appId }))
      localStorage.setItem(`rp_voted_${activeCorridor}`, appId)
    } catch {}
    setVoteLoading(false)
  }

  async function handleRateSubmit(rate) {
    if (rateSubmitted[activeCorridor] || rateSubmitting) return
    setRateSubmitting(true)
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor: activeCorridor, rate }),
      })
      const data = await res.json()
      setCommunityRates(prev => ({ ...prev, [activeCorridor]: data }))
      setRateSubmitted(prev => ({ ...prev, [activeCorridor]: true }))
      localStorage.setItem(`rp_rate_${activeCorridor}`, rate)
    } catch {}
    setRateSubmitting(false)
  }

  const c = CORRIDORS[activeCorridor]
  const corridorVotes  = votes[activeCorridor] || []
  const totalVotes     = corridorVotes.reduce((sum, v) => sum + (v.count || 0), 0)
  const hasVoted       = !!votedApps[activeCorridor]
  const communityRate  = communityRates[activeCorridor] || { average: null, count: 0 }

  // Sort apps by rate descending for rank
  const rankedApps = [...c.apps].sort((a, b) => b.rate - a.rate)

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#fff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '72px 24px 52px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 50,
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          marginBottom: 24, fontSize: 12, color: '#60a5fa', fontWeight: 500,
        }}>
          🇬🇧 🇪🇺 → 🇳🇬 🇬🇭 &nbsp;·&nbsp; Community-powered data
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-1.5px', marginBottom: 18,
          background: 'linear-gradient(135deg, #f1f5f9 30%, #64748b 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          What rate are you actually getting?
        </h1>

        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          The community remittance rate tracker for Nigerians and Ghanaians in the UK &amp; Europe. Vote on what works, compare apps, and track community expectations.
        </p>

        <CorridorTabs active={activeCorridor} onChange={setActiveCorridor} />
      </div>

      {/* Mid-market bar */}
      <div style={{ marginBottom: 28 }}>
        <MidMarketBar corridor={activeCorridor} />
      </div>

      {/* Rate cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {rankedApps.map((app, rank) => (
            <RateCard
              key={app.id}
              app={app}
              corridor={activeCorridor}
              midmarket={c.midmarket}
              to={c.to}
              from={c.from}
              rank={rank}
              totalApps={c.apps.length}
              hasVoted={hasVoted}
              votedApp={votedApps[activeCorridor]}
              votes={corridorVotes}
              totalVotes={totalVotes}
              onVote={handleVote}
              voteLoading={voteLoading}
            />
          ))}
        </div>

        {hasVoted && totalVotes > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 16 }}>
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} on {c.from} → {c.to}
          </p>
        )}
      </div>

      {/* Expected rate + Email — side by side on large screens */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <ExpectedRateSection
          corridor={activeCorridor}
          communityRate={communityRate}
          onSubmit={handleRateSubmit}
          submitted={!!rateSubmitted[activeCorridor]}
          submitting={rateSubmitting}
        />
        <EmailCapture
          corridor={activeCorridor}
          votedApp={votedApps[activeCorridor]}
          expectedRate={rateInputs[activeCorridor]}
        />
      </div>

      <Footer />
    </div>
  )
}
