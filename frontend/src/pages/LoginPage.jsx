import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SmartSeasonLogo from '../components/SmartSeasonLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@smartseason.com')
      setPassword('admin123')
      return
    }

    setEmail('james@smartseason.com')
    setPassword('agent123')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #15803d 0%, #16a34a 58%, #22c55e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(244,238,221,0.12) 0%, transparent 32%),
                          radial-gradient(circle at 80% 20%, rgba(215,166,58,0.18) 0%, transparent 28%),
                          radial-gradient(circle at 70% 80%, rgba(21,128,61,0.20) 0%, transparent 24%)`,
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <SmartSeasonLogo size={70} stacked light subtitle="Field Monitoring System" />
        </div>

        <div className="card" style={{ padding: 32, background: 'rgba(247, 243, 232, 0.88)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 24, color: 'var(--bark)' }}>Sign in to your account</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@smartseason.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '10px 14px', borderRadius: 6, fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0 16px' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--clay)', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo credentials</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fillDemo('admin')} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              Admin
            </button>
            <button onClick={() => fillDemo('agent')} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              Field Agent
            </button>
          </div>
          {/* <p style={{ marginTop: 14, fontSize: '0.8rem', color: 'var(--clay)', textAlign: 'center', lineHeight: 1.5 }}>
            If demo sign-in fails, seed the backend database first with <code>npm run seed</code>.
          </p> */}

          <div className="divider" style={{ margin: '18px 0 16px' }} />
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--clay)', lineHeight: 1.6 }}>
            Need access? Contact a coordinator to create your account and assign the right role.
          </p>
        </div>
      </div>
    </div>
  )
}
