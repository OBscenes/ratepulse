'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Incorrect password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            marginBottom: 14,
            boxShadow: '0 0 32px rgba(99,102,241,0.35)',
          }}>RP</div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#f1f5f9', letterSpacing: '-0.3px' }}>RatePulse</span>
          <span style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Admin Dashboard</span>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            padding: '28px 28px 24px',
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, textAlign: 'center' }}>
            Sign in to continue
          </p>

          <label style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            required
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 14,
              padding: '10px 12px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />

          {error && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 8, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '11px 0',
              borderRadius: 8,
              border: 'none',
              background: loading || !password
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: loading || !password ? '#475569' : '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
