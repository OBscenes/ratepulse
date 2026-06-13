'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// ── Data ──────────────────────────────────────────────────────────────────────

const CORRIDORS = {
  'GBP-NGN': {
    id: 'GBP-NGN', label: 'GBP → NGN',
    from: 'GBP', fromFlag: '🇬🇧', to: 'NGN', toFlag: '🇳🇬',
    midmarket: 1838.18, unitAmount: 1,
    rateLabel: 'NGN per 1 GBP', ratePlaceholder: 'e.g. 1840',
    apps: [
      { id: 'lemfi',      name: 'LemFi',      margin:  0.4401, color: '#f59e0b' },
      { id: 'sendapp',    name: 'SendApp',    margin: -0.6202, color: '#4ade80' },
      { id: 'africhange', name: 'Africhange', margin: -0.6398, color: '#34d399' },
      { id: 'pesa',       name: 'Pesa',       margin: -0.6999, color: '#a78bfa' },
      { id: 'raenest',    name: 'Raenest',    margin: -0.7503, color: '#60a5fa' },
    ],
  },
  'GBP-GHS': {
    id: 'GBP-GHS', label: 'GBP → GHS',
    from: 'GBP', fromFlag: '🇬🇧', to: 'GHS', toFlag: '🇬🇭',
    midmarket: 18.20, unitAmount: 1,
    rateLabel: 'GHS per 1 GBP', ratePlaceholder: 'e.g. 18.50',
    apps: [
      { id: 'wise',         name: 'Wise',          margin: -1.9231, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         margin: -1.5385, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       margin: -2.3077, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -3.0220, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -1.7582, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', margin: -3.8462, color: '#fbbf24' },
    ],
  },
  'EUR-NGN': {
    id: 'EUR-NGN', label: 'EUR → NGN',
    from: 'EUR', fromFlag: '🇪🇺', to: 'NGN', toFlag: '🇳🇬',
    midmarket: 1820, unitAmount: 1,
    rateLabel: 'NGN per 1 EUR', ratePlaceholder: 'e.g. 1850',
    apps: [
      { id: 'wise',         name: 'Wise',          margin: -1.9231, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         margin: -1.5385, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       margin: -2.3077, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -3.0220, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -1.7582, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', margin: -3.8462, color: '#fbbf24' },
    ],
  },
  'EUR-GHS': {
    id: 'EUR-GHS', label: 'EUR → GHS',
    from: 'EUR', fromFlag: '🇪🇺', to: 'GHS', toFlag: '🇬🇭',
    midmarket: 15.60, unitAmount: 1,
    rateLabel: 'GHS per 1 EUR', ratePlaceholder: 'e.g. 15.80',
    apps: [
      { id: 'wise',         name: 'Wise',          margin: -2.2436, color: '#4ade80' },
      { id: 'lemfi',        name: 'LemFi',         margin: -1.7949, color: '#f59e0b' },
      { id: 'remitly',      name: 'Remitly',       margin: -2.6923, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -3.5256, color: '#a78bfa' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -2.0513, color: '#34d399' },
      { id: 'westernunion', name: 'Western Union', margin: -4.4872, color: '#fbbf24' },
    ],
  },
  'USD-NGN': {
    id: 'USD-NGN', label: 'USD → NGN',
    from: 'USD', fromFlag: '🇺🇸', to: 'NGN', toFlag: '🇳🇬',
    midmarket: 1600, unitAmount: 1,
    rateLabel: 'NGN per 1 USD', ratePlaceholder: 'e.g. 1580',
    apps: [],
  },
  'USD-GHS': {
    id: 'USD-GHS', label: 'USD → GHS',
    from: 'USD', fromFlag: '🇺🇸', to: 'GHS', toFlag: '🇬🇭',
    midmarket: 15.8, unitAmount: 1,
    rateLabel: 'GHS per 1 USD', ratePlaceholder: 'e.g. 15.50',
    apps: [],
  },
  'CAD-NGN': {
    id: 'CAD-NGN', label: 'CAD → NGN',
    from: 'CAD', fromFlag: '🇨🇦', to: 'NGN', toFlag: '🇳🇬',
    midmarket: 1200, unitAmount: 1,
    rateLabel: 'NGN per 1 CAD', ratePlaceholder: 'e.g. 1180',
    apps: [],
  },
  'CAD-GHS': {
    id: 'CAD-GHS', label: 'CAD → GHS',
    from: 'CAD', fromFlag: '🇨🇦', to: 'GHS', toFlag: '🇬🇭',
    midmarket: 11.6, unitAmount: 1,
    rateLabel: 'GHS per 1 CAD', ratePlaceholder: 'e.g. 11.40',
    apps: [],
  },
}

const RECEIVE_CORRIDORS = {
  'NGN-GBP': {
    id: 'NGN-GBP', label: 'NGN → GBP',
    from: 'NGN', fromFlag: '🇳🇬', to: 'GBP', toFlag: '🇬🇧',
    midmarket: 1838.18, unitAmount: 1,
    invertedRate: true,
    rateLabel: 'NGN per 1 GBP', ratePlaceholder: 'e.g. 1880',
    apps: [
      { id: 'sendapp',    name: 'SendApp',    margin: 2.1119, color: '#4ade80' },
      { id: 'africhange', name: 'Africhange', margin: 2.5471, color: '#34d399' },
      { id: 'raenest',    name: 'Raenest',    margin: 3.2001, color: '#60a5fa' },
      { id: 'pesa',       name: 'Pesa',       margin: 7.2256, color: '#a78bfa' },
      { id: 'lemfi',      name: 'LemFi',      margin: 7.8782, color: '#f59e0b' },
    ],
  },
  'GHS-GBP': {
    id: 'GHS-GBP', label: 'GHS → GBP',
    from: 'GHS', fromFlag: '🇬🇭', to: 'GBP', toFlag: '🇬🇧',
    midmarket: 54.95, unitAmount: 1000,
    rateLabel: 'GBP per 1,000 GHS', ratePlaceholder: 'e.g. 54.50',
    apps: [
      { id: 'lemfi',        name: 'LemFi',         margin: -1.3648, color: '#f59e0b' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -1.7289, color: '#34d399' },
      { id: 'wise',         name: 'Wise',          margin: -2.1838, color: '#4ade80' },
      { id: 'remitly',      name: 'Remitly',       margin: -2.7298, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -3.8217, color: '#a78bfa' },
      { id: 'westernunion', name: 'Western Union', margin: -5.0955, color: '#fbbf24' },
    ],
  },
  'NGN-EUR': {
    id: 'NGN-EUR', label: 'NGN → EUR',
    from: 'NGN', fromFlag: '🇳🇬', to: 'EUR', toFlag: '🇪🇺',
    midmarket: 54.95, unitAmount: 100000,
    rateLabel: 'EUR per 100,000 NGN', ratePlaceholder: 'e.g. 54.00',
    apps: [
      { id: 'lemfi',        name: 'LemFi',         margin: -1.5469, color: '#f59e0b' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -2.0018, color: '#34d399' },
      { id: 'wise',         name: 'Wise',          margin: -2.6388, color: '#4ade80' },
      { id: 'remitly',      name: 'Remitly',       margin: -3.2757, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -4.3676, color: '#a78bfa' },
      { id: 'westernunion', name: 'Western Union', margin: -5.7325, color: '#fbbf24' },
    ],
  },
  'GHS-EUR': {
    id: 'GHS-EUR', label: 'GHS → EUR',
    from: 'GHS', fromFlag: '🇬🇭', to: 'EUR', toFlag: '🇪🇺',
    midmarket: 64.10, unitAmount: 1000,
    rateLabel: 'EUR per 1,000 GHS', ratePlaceholder: 'e.g. 63.50',
    apps: [
      { id: 'lemfi',        name: 'LemFi',         margin: -1.4040, color: '#f59e0b' },
      { id: 'sendwave',     name: 'Sendwave',      margin: -1.7160, color: '#34d399' },
      { id: 'wise',         name: 'Wise',          margin: -2.2622, color: '#4ade80' },
      { id: 'remitly',      name: 'Remitly',       margin: -2.8862, color: '#f87171' },
      { id: 'worldremit',   name: 'WorldRemit',    margin: -3.9782, color: '#a78bfa' },
      { id: 'westernunion', name: 'Western Union', margin: -5.2262, color: '#fbbf24' },
    ],
  },
  'NGN-USD': {
    id: 'NGN-USD', label: 'NGN → USD',
    from: 'NGN', fromFlag: '🇳🇬', to: 'USD', toFlag: '🇺🇸',
    midmarket: 1600, unitAmount: 1,
    invertedRate: true,
    rateLabel: 'NGN per 1 USD', ratePlaceholder: 'e.g. 1620',
    apps: [],
  },
  'GHS-USD': {
    id: 'GHS-USD', label: 'GHS → USD',
    from: 'GHS', fromFlag: '🇬🇭', to: 'USD', toFlag: '🇺🇸',
    midmarket: 63.3, unitAmount: 1000,
    rateLabel: 'USD per 1,000 GHS', ratePlaceholder: 'e.g. 62.50',
    apps: [],
  },
  'NGN-CAD': {
    id: 'NGN-CAD', label: 'NGN → CAD',
    from: 'NGN', fromFlag: '🇳🇬', to: 'CAD', toFlag: '🇨🇦',
    midmarket: 1200, unitAmount: 1,
    invertedRate: true,
    rateLabel: 'NGN per 1 CAD', ratePlaceholder: 'e.g. 1220',
    apps: [],
  },
  'GHS-CAD': {
    id: 'GHS-CAD', label: 'GHS → CAD',
    from: 'GHS', fromFlag: '🇬🇭', to: 'CAD', toFlag: '🇨🇦',
    midmarket: 86.2, unitAmount: 1000,
    rateLabel: 'CAD per 1,000 GHS', ratePlaceholder: 'e.g. 85.00',
    apps: [],
  },
}

const ALL_CORRIDORS = { ...CORRIDORS, ...RECEIVE_CORRIDORS }

const CURRENCY_META = {
  GBP: { symbol: '£',   flag: '🇬🇧', name: 'British Pound',    decimals: 2 },
  EUR: { symbol: '€',   flag: '🇪🇺', name: 'Euro',             decimals: 2 },
  USD: { symbol: '$',   flag: '🇺🇸', name: 'US Dollar',        decimals: 2 },
  CAD: { symbol: 'CA$', flag: '🇨🇦', name: 'Canadian Dollar',  decimals: 2 },
  NGN: { symbol: '₦',   flag: '🇳🇬', name: 'Nigerian Naira',   decimals: 0 },
  GHS: { symbol: '₵',   flag: '🇬🇭', name: 'Ghanaian Cedi',    decimals: 2 },
}

const DIASPORA_SET = new Set(['GBP', 'EUR', 'USD', 'CAD'])

const VALID_DESTINATIONS = {
  GBP: ['NGN', 'GHS'],
  EUR: ['NGN', 'GHS'],
  USD: ['NGN', 'GHS'],
  CAD: ['NGN', 'GHS'],
  NGN: ['GBP', 'EUR', 'USD', 'CAD'],
  GHS: ['GBP', 'EUR', 'USD', 'CAD'],
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

function formatConverted(value, currency) {
  const { symbol, decimals } = CURRENCY_META[currency]
  if (decimals === 0) return symbol + Math.round(value).toLocaleString('en-GB')
  return symbol + value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

// ── Sub-components ────────────────────────────────────────────────────────────

function BottomGlow() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 320,
      background: 'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.07) 45%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 1,
    }} />
  )
}

const COUNTER_SEED = 1247

function LiveCounter() {
  const [display, setDisplay]   = useState(0)
  const [target, setTarget]     = useState(COUNTER_SEED)
  const [done, setDone]         = useState(false)
  const rafRef                  = useRef(null)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(d => { if (d.count > 0) setTarget(d.count) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const duration = 1600
    const startTs  = performance.now()

    function tick(now) {
      const progress = Math.min((now - startTs) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
        setDone(true)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  const formatted = display.toLocaleString('en-GB')
  const body      = done ? formatted.slice(0, -1) : formatted
  const last      = done ? formatted.slice(-1)    : null

  return (
    <div style={{ marginBottom: 32, textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 800,
        letterSpacing: '-2px', lineHeight: 1,
        color: '#ffffff', fontVariantNumeric: 'tabular-nums',
      }}>
        {body}
        {last && (
          <span style={{ animation: 'digitPulse 1.5s ease-in-out infinite' }}>
            {last}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#475569', marginTop: 10, letterSpacing: '0.2px' }}>
        diaspora members waiting for better rates
      </p>
    </div>
  )
}

function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,8,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      animation: 'fadeUp 0.6s ease both',
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

function DirectionLabel({ direction }) {
  const [displayed, setDisplayed] = useState(direction)
  const [exiting, setExiting]     = useState(false)
  const timerRef                  = useRef(null)

  useEffect(() => {
    if (direction === displayed) return
    setExiting(true)
    timerRef.current = setTimeout(() => {
      setDisplayed(direction)
      setExiting(false)
    }, 160)
    return () => clearTimeout(timerRef.current)
  }, [direction])

  return (
    <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' }}>
      <span
        key={displayed}
        style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
          color: '#3b82f6', textTransform: 'uppercase',
          animation: exiting ? 'labelOut 0.16s ease forwards' : 'labelIn 0.2s ease forwards',
        }}
      >
        {displayed === 'sending' ? '↑ Sending' : '↓ Receiving'}
      </span>
    </div>
  )
}

function CurrencySelect({ value, onChange, currencies }) {
  const [open, setOpen]       = useState(false)
  const [pos, setPos]         = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const btnRef                = useRef(null)
  const dropdownRef           = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  function handleOpen() {
    if (btnRef.current) {
      const r       = btnRef.current.getBoundingClientRect()
      const minW    = 190
      const rawLeft = r.left + window.scrollX
      // Clamp to right edge so it doesn't overflow off screen
      const left    = rawLeft + minW > window.innerWidth
        ? r.right + window.scrollX - minW
        : rawLeft
      setPos({ top: r.bottom + window.scrollY + 6, left })
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (btnRef.current?.contains(e.target)) return
      if (dropdownRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const meta = CURRENCY_META[value]

  const dropdown = mounted && open ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999,
        background: '#0f0f1e',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12, overflow: 'hidden', minWidth: 190,
        boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
      }}
    >
      {currencies.map(code => {
        const m = CURRENCY_META[code]
        const active = code === value
        return (
          <button
            key={code}
            onClick={() => { onChange(code); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '11px 14px', border: 'none',
              background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: active ? '#60a5fa' : '#e2e8f0',
              fontSize: 14, fontWeight: active ? 600 : 400,
              cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{m.flag}</span>
            <span style={{ fontWeight: 600, minWidth: 32 }}>{code}</span>
            <span style={{ fontSize: 12, color: '#475569' }}>{m.name}</span>
          </button>
        )
      })}
    </div>,
    document.body
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          color: '#e2e8f0', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{meta.flag}</span>
        <span>{value}</span>
        <svg
          width="11" height="11" viewBox="0 0 24 24"
          fill="none" stroke="#64748b" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {dropdown}
    </>
  )
}

function CurrencyBar({ amount, fromCurrency, toCurrency, onAmountChange, onFromChange, onToChange, onSwap, diasporaCurrencies }) {
  const fromMeta  = CURRENCY_META[fromCurrency]
  const isSending = DIASPORA_SET.has(fromCurrency)
  const leftOpts  = isSending ? diasporaCurrencies : ['NGN', 'GHS']
  const rightOpts = isSending ? ['NGN', 'GHS'] : diasporaCurrencies

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#0d0d1a',
      border: '1px solid rgba(59,130,246,0.22)',
      borderRadius: 20, padding: 8,
      maxWidth: 700, margin: '0 auto 36px',
      boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.06)',
    }}>
      {/* Left: amount input + from currency selector */}
      <div style={{
        display: 'flex', alignItems: 'center', flex: 1, minWidth: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, overflow: 'visible',
      }}>
        <span style={{
          padding: '0 4px 0 16px',
          fontSize: 20, fontWeight: 700, color: '#64748b',
          userSelect: 'none', flexShrink: 0, lineHeight: 1,
        }}>
          {fromMeta.symbol}
        </span>
        <input
          type="number"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="100"
          min="0"
          style={{
            flex: 1, minWidth: 0,
            padding: '14px 8px',
            background: 'transparent', border: 'none',
            color: '#ffffff', fontSize: 22, fontWeight: 700,
            letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
          }}
        />
        <div style={{ padding: '0 8px', borderLeft: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <CurrencySelect
            value={fromCurrency}
            onChange={onFromChange}
            currencies={leftOpts}
          />
        </div>
      </div>

      {/* Swap button */}
      <button
        onClick={onSwap}
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.22)',
          color: '#60a5fa', fontSize: 18,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s, transform 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.22)'
          e.currentTarget.style.transform = 'rotate(180deg)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
          e.currentTarget.style.transform = 'rotate(0deg)'
        }}
      >
        ↔
      </button>

      {/* Right: to currency selector */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '0 8px',
        display: 'flex', alignItems: 'center',
      }}>
        <CurrencySelect
          value={toCurrency}
          onChange={onToChange}
          currencies={rightOpts}
        />
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
          height: '100%', width: `${pct}%`,
          background: isVoted ? '#3b82f6' : 'rgba(255,255,255,0.2)',
          borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
    </div>
  )
}

function RateCard({ app, midmarket, to, from, invertedRate, rateLabel, unitAmount, inputAmount, rank, hasVoted, votedApp, votes, totalVotes, onVote, voteLoading, fastAnim }) {
  const hasRate = app.rate !== null && app.rate !== undefined
  const spread = hasRate ? ((app.rate - midmarket) / midmarket) * 100 : null
  const isBest = rank === 0 && hasRate
  const isVotedApp = votedApp === app.id
  const appVoteCount = votes.find(v => v.app_id === app.id)?.count || 0
  const votePct = totalVotes > 0 ? Math.round((appVoteCount / totalVotes) * 100) : 0
  const showConverted = inputAmount > 0 && hasRate
  const convertedValue = hasRate
    ? (invertedRate ? inputAmount / app.rate : (inputAmount / unitAmount) * app.rate)
    : null

  return (
    <div
      style={{
        background: '#0d0d1a',
        border: `1px solid ${isVotedApp ? '#3b82f6' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '22px 22px 18px',
        display: 'flex', flexDirection: 'column', gap: 0,
        transition: 'border-color 0.3s, transform 0.2s, box-shadow 0.2s',
        boxShadow: isVotedApp ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.1)' : '0 1px 3px rgba(0,0,0,0.3)',
        animation: fastAnim ? 'fadeUp 0.12s ease both' : 'fadeUp 0.5s ease both',
        animationDelay: fastAnim ? `${rank * 20}ms` : `${760 + rank * 70}ms`,
      }}
      onMouseEnter={e => {
        if (!isVotedApp) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = isVotedApp
          ? '0 0 0 1px rgba(59,130,246,0.4), 0 12px 40px rgba(59,130,246,0.15)'
          : '0 8px 24px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={e => {
        if (!isVotedApp) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isVotedApp
          ? '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.1)'
          : '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: app.color, boxShadow: `0 0 8px ${app.color}80` }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{app.name}</span>
        </div>
        {isBest && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            border: '1px solid rgba(74,222,128,0.25)', letterSpacing: '0.5px',
          }}>BEST RATE</span>
        )}
        {isVotedApp && !isBest && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
            background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)', letterSpacing: '0.5px',
          }}>YOUR PICK</span>
        )}
      </div>

      {/* Primary number: converted amount when input > 0, else raw rate */}
      <div style={{ marginBottom: 4 }}>
        {hasRate ? (
          <span style={{ fontSize: showConverted ? 34 : 38, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>
            {showConverted ? formatConverted(convertedValue, to) : formatRate(app.rate, invertedRate ? from : to)}
          </span>
        ) : (
          <span style={{ fontSize: 20, fontWeight: 600, color: '#334155', letterSpacing: '-0.3px', lineHeight: 1 }}>
            Rate unavailable
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>
        {hasRate && showConverted ? `Rate: ${formatRate(app.rate, invertedRate ? from : to)} ${rateLabel}` : rateLabel}
      </p>

      {/* Spread badge */}
      {hasRate ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6, padding: '5px 10px', marginBottom: 18, alignSelf: 'flex-start',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={spreadColor(spread)} strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          <span style={{ fontSize: 12, color: spreadColor(spread), fontWeight: 500 }}>
            {Math.abs(spread).toFixed(1)}% {invertedRate ? 'above' : 'below'} mid-market
          </span>
        </div>
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 6, padding: '5px 10px', marginBottom: 18, alignSelf: 'flex-start',
        }}>
          <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>Not yet updated</span>
        </div>
      )}

      {/* Vote area */}
      {hasVoted ? (
        <div>
          <VoteBar
            label={`${appVoteCount} vote${appVoteCount !== 1 ? 's' : ''}`}
            pct={votePct} color={app.color} isVoted={isVotedApp}
          />
          {isVotedApp && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#60a5fa',
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
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 10, color: '#60a5fa', fontSize: 13, fontWeight: 600,
            cursor: voteLoading ? 'wait' : 'pointer', transition: 'all 0.2s',
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

      {app.updatedAt && (
        <p style={{ fontSize: 10, color: '#334155', marginTop: 8, textAlign: 'center' }}>
          Updated {timeAgo(app.updatedAt)}
        </p>
      )}
    </div>
  )
}

function ExpectedRateSection({ c, communityRate, onSubmit, submitted, submitting }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    onSubmit(input.trim())
    setInput('')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
      <div style={{
        background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
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
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4ade80',
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
                  }}>{c.invertedRate ? c.from : c.to}</span>
                  <input
                    type="number"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={c.ratePlaceholder}
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
                    fontSize: 14, fontWeight: 600,
                    cursor: input ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </form>
            )}
          </div>

          {communityRate.count > 0 && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 16, padding: '24px 32px', minWidth: 180,
            }}>
              <p style={{ fontSize: 12, color: '#475569', marginBottom: 8, letterSpacing: '0.5px' }}>
                COMMUNITY EXPECTS
              </p>
              <p style={{ fontSize: 40, fontWeight: 800, color: '#60a5fa', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {formatRate(communityRate.average, c.invertedRate ? c.from : c.to)}
              </p>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                {c.invertedRate
                  ? `${c.from} per 1 ${c.to}`
                  : `${c.to} per ${c.unitAmount === 1 ? `1 ${c.from}` : `${c.unitAmount.toLocaleString()} ${c.from}`}`}
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

function EmailCapture({ c, votedApp, expectedRate }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, corridor: c.id, voted_app: votedApp, expected_rate: expectedRate }),
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 20, padding: '40px 32px', textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
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
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address" required
              style={{
                flex: 1, minWidth: 220, padding: '13px 16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#fff', fontSize: 14,
              }}
            />
            <button
              type="submit" disabled={loading}
              style={{
                padding: '13px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Adding you…' : (
                <>
                  Notify me
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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

function FloatingToggle({ fromCurrency, toCurrency, onSwap, visible }) {
  const fromMeta = CURRENCY_META[fromCurrency]
  const toMeta   = CURRENCY_META[toCurrency]

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 10,
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
      transform: visible ? 'translateY(0)' : 'translateY(88px)',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(8,8,15,0.94)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59,130,246,0.28)', borderRadius: 50,
        padding: '8px 10px 8px 16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(59,130,246,0.07)',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{fromMeta.flag}</span>
          <span>{fromCurrency}</span>
        </span>
        <button
          onClick={onSwap}
          style={{
            padding: '5px 11px', borderRadius: 50, border: 'none',
            background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
            fontSize: 14, cursor: 'pointer', fontWeight: 700,
          }}
        >
          ↔
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{toMeta.flag}</span>
          <span>{toCurrency}</span>
        </span>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: '#1e293b' }}>
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
  const [amount, setAmount]               = useState('100')
  const [fromCurrency, setFromCurrency]   = useState('GBP')
  const [toCurrency, setToCurrency]       = useState('NGN')
  const [votedApps, setVotedApps]         = useState({})
  const [votes, setVotes]                 = useState({})
  const [communityRates, setCommunityRates] = useState({})
  const [rateInputs, setRateInputs]       = useState({})
  const [rateSubmitted, setRateSubmitted] = useState({})
  const [rateSubmitting, setRateSubmitting] = useState(false)
  const [voteLoading, setVoteLoading]     = useState(false)
  const [showFloating, setShowFloating]   = useState(false)
  const [fastAnim, setFastAnim]           = useState(false)
  const [platformsData, setPlatformsData] = useState([])
  const [currencySettings, setCurrencySettings] = useState([
    { currency: 'GBP', visible: true },
    { currency: 'EUR', visible: true },
    { currency: 'USD', visible: true },
    { currency: 'CAD', visible: true },
  ])
  const toggleRef                         = useRef(null)

  const corridorId    = `${fromCurrency}-${toCurrency}`
  const c             = ALL_CORRIDORS[corridorId]
  const direction     = DIASPORA_SET.has(fromCurrency) ? 'sending' : 'receiving'
  const numericAmount = parseFloat(amount) || 0

  const visibleDiasporaCurrencies = currencySettings.filter(s => s.visible).map(s => s.currency)

  function handleFromChange(newFrom) {
    if (newFrom === toCurrency) {
      setFromCurrency(newFrom)
      setToCurrency(fromCurrency)
      return
    }
    setFromCurrency(newFrom)
    if (!ALL_CORRIDORS[`${newFrom}-${toCurrency}`]) {
      setToCurrency(VALID_DESTINATIONS[newFrom][0])
    }
  }

  function handleToChange(newTo) {
    if (newTo === fromCurrency) {
      setToCurrency(newTo)
      setFromCurrency(toCurrency)
      return
    }
    setToCurrency(newTo)
    if (!ALL_CORRIDORS[`${fromCurrency}-${newTo}`]) {
      const validSources = Object.keys(VALID_DESTINATIONS).filter(k => VALID_DESTINATIONS[k].includes(newTo))
      setFromCurrency(validSources[0])
    }
  }

  function handleSwap() {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    const t = setTimeout(() => setFastAnim(true), 1600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetch('/api/currency-settings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCurrencySettings(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (visibleDiasporaCurrencies.length === 0) return
    const visibleSet = new Set(visibleDiasporaCurrencies)
    if (DIASPORA_SET.has(fromCurrency) && !visibleSet.has(fromCurrency)) {
      const fallback = visibleDiasporaCurrencies[0]
      setFromCurrency(fallback)
      if (!VALID_DESTINATIONS[fallback].includes(toCurrency)) {
        setToCurrency(VALID_DESTINATIONS[fallback][0])
      }
    } else if (!DIASPORA_SET.has(fromCurrency) && !visibleSet.has(toCurrency)) {
      setToCurrency(visibleDiasporaCurrencies[0])
    }
  }, [visibleDiasporaCurrencies])

  useEffect(() => {
    function fetchPlatforms() {
      fetch('/api/platforms')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log('[RatePulse] /api/platforms returned', data.length, 'rows')
            if (data.length > 0) {
              const sample = data[0]
              console.log('[RatePulse] first row:', JSON.stringify({
                corridor: sample.corridor,
                platform_id: sample.platform_id,
                sending_rate: sample.sending_rate,
                receiving_rate: sample.receiving_rate,
              }))
              const corridors = [...new Set(data.map(r => r.corridor))]
              console.log('[RatePulse] unique corridors:', corridors)
            }
            setPlatformsData(data)
          }
        })
        .catch(() => {})
    }
    fetchPlatforms()
    const timer = setInterval(fetchPlatforms, 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!toggleRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowFloating(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(toggleRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const storedVotes = {}
    const storedRates = {}
    ;[...Object.keys(CORRIDORS), ...Object.keys(RECEIVE_CORRIDORS)].forEach(id => {
      const v = localStorage.getItem(`rp_voted_${id}`)
      if (v) storedVotes[id] = v
      if (localStorage.getItem(`rp_rate_${id}`)) storedRates[id] = true
    })
    setVotedApps(storedVotes)
    setRateSubmitted(storedRates)
  }, [])

  useEffect(() => {
    fetchVotes(corridorId)
    fetchRates(corridorId)
  }, [corridorId])

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
    if (votedApps[corridorId] || voteLoading) return
    setVoteLoading(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor: corridorId, app_id: appId }),
      })
      const data = await res.json()
      setVotes(prev => ({ ...prev, [corridorId]: data.votes || [] }))
      setVotedApps(prev => ({ ...prev, [corridorId]: appId }))
      localStorage.setItem(`rp_voted_${corridorId}`, appId)
    } catch {}
    setVoteLoading(false)
  }

  async function handleRateSubmit(rate) {
    if (rateSubmitted[corridorId] || rateSubmitting) return
    setRateSubmitting(true)
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor: corridorId, rate }),
      })
      const data = await res.json()
      setCommunityRates(prev => ({ ...prev, [corridorId]: data }))
      setRateSubmitted(prev => ({ ...prev, [corridorId]: true }))
      localStorage.setItem(`rp_rate_${corridorId}`, rate)
    } catch {}
    setRateSubmitting(false)
  }

  const corridorVotes = votes[corridorId] || []
  const totalVotes    = corridorVotes.reduce((sum, v) => sum + (v.count || 0), 0)
  const hasVoted      = !!votedApps[corridorId]
  const communityRate = communityRates[corridorId] || { average: null, count: 0 }

  // DB always stores rows as diaspora→africa (e.g. 'gbp-ngn'), never the reverse.
  // Receiving mode flips the UI corridor (NGN→GBP) but must still read the gbp-ngn row.
  const isSending = DIASPORA_SET.has(fromCurrency)
  const rateField    = isSending ? 'sending_rate' : 'receiving_rate'
  // Canonical DB key: always diaspora-africa in lowercase
  const dbCorridorKey = isSending
    ? `${fromCurrency}-${toCurrency}`.toLowerCase()
    : `${toCurrency}-${fromCurrency}`.toLowerCase()

  // Build platform list dynamically from Supabase — any platform added via admin
  // automatically appears here without touching this file.
  const corridorPlatforms = platformsData.filter(
    p => (p.corridor ?? '').toLowerCase() === dbCorridorKey && p.active !== false
  )

  console.log(
    `[RatePulse] corridor=${dbCorridorKey} rateField=${rateField}`,
    `active platforms:`, corridorPlatforms.map(p => p.platform_id)
  )

  const effectiveApps = corridorPlatforms.map(p => ({
    id:        p.platform_id,
    name:      p.name,
    color:     p.color || '#60a5fa',
    rate:      p[rateField] ?? null,
    updatedAt: p.updated_at ?? null,
  }))

  const rankedApps = [...effectiveApps].sort((a, b) => {
    const aHas = a.rate !== null && a.rate !== undefined
    const bHas = b.rate !== null && b.rate !== undefined
    if (!aHas && !bHas) return 0
    if (!aHas) return 1   // null rates sink to the bottom
    if (!bHas) return -1
    return c.invertedRate ? a.rate - b.rate : b.rate - a.rate
  })

  const fadeIn = (delay) => ({
    animation: 'fadeUp 0.6s ease both',
    animationDelay: `${delay}ms`,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', position: 'relative', zIndex: 2 }}>
      <BottomGlow />
      <FloatingToggle
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        onSwap={handleSwap}
        visible={showFloating}
      />
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '72px 24px 48px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>

        <div style={fadeIn(120)}>
          <LiveCounter />
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-1.5px', marginBottom: 18,
          background: 'linear-gradient(135deg, #f1f5f9 30%, #64748b 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          ...fadeIn(260),
        }}>
          What rate are you actually getting?
        </h1>

        <p style={{
          fontSize: 16, color: '#475569', lineHeight: 1.8,
          maxWidth: 560, margin: '0 auto 40px',
          ...fadeIn(380),
        }}>
          The community remittance rate tracker for Nigerians and Ghanaians in the UK &amp; Europe.
          Vote on what works, compare apps, and track community expectations.
        </p>

        <div ref={toggleRef} style={fadeIn(500)}>
          <DirectionLabel direction={direction} />
          <CurrencyBar
            amount={amount}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            onAmountChange={setAmount}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
            onSwap={handleSwap}
            diasporaCurrencies={visibleDiasporaCurrencies}
          />
        </div>
      </div>

      {/* Rate cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {rankedApps.map((app, rank) => (
            <RateCard
              key={`${corridorId}-${app.id}`}
              app={app}
              midmarket={c.midmarket}
              to={c.to}
              from={c.from}
              invertedRate={!!c.invertedRate}
              rateLabel={c.rateLabel}
              unitAmount={c.unitAmount}
              inputAmount={numericAmount}
              rank={rank}
              hasVoted={hasVoted}
              votedApp={votedApps[corridorId]}
              votes={corridorVotes}
              totalVotes={totalVotes}
              onVote={handleVote}
              voteLoading={voteLoading}
              fastAnim={fastAnim}
            />
          ))}
        </div>

        {hasVoted && totalVotes > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 16 }}>
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} on {c.from} → {c.to}
          </p>
        )}
      </div>

      {/* Expected rate + Email */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 20,
        ...fadeIn(820),
      }}>
        <ExpectedRateSection
          c={c}
          communityRate={communityRate}
          onSubmit={handleRateSubmit}
          submitted={!!rateSubmitted[corridorId]}
          submitting={rateSubmitting}
        />
        <EmailCapture
          c={c}
          votedApp={votedApps[corridorId]}
          expectedRate={rateInputs[corridorId]}
        />
      </div>

      <div style={fadeIn(900)}>
        <Footer />
      </div>
    </div>
  )
}
