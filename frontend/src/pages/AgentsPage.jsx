import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

function CreateAgentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const agent = await api.createAgent(form)
      onCreated(agent)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.3rem' }}>New Field Agent</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '4px 8px' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. John Kamau" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@smartseason.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min. 6 characters" minLength={6} />
          </div>
          {error && (
            <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '10px 14px', borderRadius: 6, fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.agents().then(setAgents).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="fade-in" style={{ padding: 'clamp(16px, 4vw, 36px)', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--soil)' }}>Field Agents</h1>
          <p style={{ color: 'var(--clay)', fontSize: '0.9rem', marginTop: 4 }}>
            {agents.length} agent{agents.length !== 1 ? 's' : ''} in the programme
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ New Agent</button>
      </div>

      {agents.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <h3>No agents yet</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>Create the first field agent account.</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ New Agent</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {agents.map(agent => (
            <div key={agent.id} className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--moss), var(--sage))',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Instrument Serif', fontSize: '1.2rem', flexShrink: 0,
                }}>
                  {agent.name.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clay)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'Instrument Serif', fontSize: '1.6rem', color: 'var(--soil)' }}>{agent.field_count}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clay)', marginLeft: 4 }}>field{agent.field_count !== 1 ? 's' : ''} assigned</span>
                </div>
                <Link to="/fields">
                  <button className="btn btn-secondary btn-sm">View Fields</button>
                </Link>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--straw)', marginTop: 10 }}>
                Joined {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreated={(agent) => {
            setAgents(prev => [...prev, { ...agent, field_count: 0 }])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}