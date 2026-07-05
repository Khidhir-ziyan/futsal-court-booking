import React, { useState } from 'react'

interface Props {
  onSuccess: () => void
  onBack: () => void
}

const AuthPage: React.FC<Props> = ({ onSuccess, onBack }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [seeding, setSeeding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Login failed')
        setLoading(false)
        return
      }

      const data = await res.json()
      localStorage.setItem('admin_token', data.token)
      onSuccess()
    } catch {
      setError('Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="font-display text-[14px] uppercase tracking-wordmark text-primary mb-4">
            Admin Panel
          </div>
          <div className="font-mono text-[11px] uppercase tracking-caption text-muted">
            Authenticate to continue
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary font-mono text-sm"
              autoFocus
            />
          </div>

          <div className="relative">
            <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          {error && (
            <div className="font-mono text-[11px] uppercase text-red-500 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-primary font-mono text-[12px] uppercase tracking-button hover:bg-primary hover:text-black transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={async () => {
              setSeeding(true)
              setSeedMsg('')
              try {
                const res = await fetch('/api/admin/seed', { method: 'POST' })
                const data = await res.json()
                setSeedMsg(data.message || 'Seeded')
              } catch {
                setSeedMsg('Seed failed')
              }
              setSeeding(false)
            }}
            disabled={seeding}
            className="font-mono text-[10px] uppercase tracking-caption text-muted hover:text-link transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            {seeding ? 'Creating...' : 'Create default admin account'}
          </button>
          {seedMsg && (
            <div className="font-mono text-[10px] uppercase tracking-caption mt-2 text-muted">{seedMsg}</div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onBack}
            className="font-mono text-[10px] uppercase tracking-caption text-muted hover:text-link transition-colors bg-transparent border-none cursor-pointer"
          >
            ← Back to site
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
