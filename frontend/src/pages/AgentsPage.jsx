import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

function CreateAgentCard({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const agent = await api.createAgent(form)
      onCreated(agent)
      setForm({ name: '', email: '', password: '' })
      setSuccess(`${agent.name} has been added as a field agent.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="create-agent" className="card" style={{ padding: '24px 26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--moss)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Coordinator Action
          </div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--soil)', marginBottom: 6 }}>Add Field Agent</h2>
          <p style={{ color: 'var(--clay)', fontSize: '0.9rem', maxWidth: 620, lineHeight: 1.6 }}>
            Create a new field-agent account here. The new user will be able to sign in and view only the fields assigned to them.
          </p>
        </div>
        <div style={{ background: 'rgba(22, 163, 74, 0.10)', color: 'var(--bark)', padding: '10px 14px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600 }}>
          Agents added: {success ? 'updated' : 'available'}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'start' }}>
        <input className="form-input" placeholder="Full name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
        <input className="form-input" type="email" placeholder="name@smartseason.com" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
        <input className="form-input" type="password" placeholder="Temporary password" minLength={6} value={form.password} onChange={(event) => updateField('password', event.target.value)} required />
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', minHeight: 44 }}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Create Agent'}
        </button>
      </form>

      {error && <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', marginTop: 14 }}>{error}</div>}
      {success && <div style={{ background: 'var(--active-bg)', color: 'var(--active)', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', marginTop: 14 }}>{success}</div>}
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.agents().then(setAgents).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>

  return (
    <div className="fade-in" style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--soil)' }}>Field Agents</h1>
        <p style={{ color: 'var(--clay)', fontSize: '0.9rem', marginTop: 4 }}>
          Manage agent access and review current workload across the programme.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <CreateAgentCard onCreated={(agent) => setAgents((current) => [agent, ...current])} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--soil)' }}>Existing Field Agents</h2>
          <p style={{ color: 'var(--clay)', fontSize: '0.88rem', marginTop: 4 }}>{agents.length} agent{agents.length !== 1 ? 's' : ''} in the programme</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {agents.map((agent) => (
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
              <div>
                <div style={{ fontWeight: 600, color: 'var(--soil)', fontSize: '0.95rem' }}>{agent.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>{agent.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: 'Instrument Serif', fontSize: '1.6rem', color: 'var(--soil)' }}>{agent.field_count}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--clay)', marginLeft: 4 }}>field{agent.field_count !== 1 ? 's' : ''} assigned</span>
              </div>
              <Link to={`/fields?agent=${agent.id}`}>
                <button className="btn btn-secondary btn-sm">View Fields</button>
              </Link>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--straw)', marginTop: 10 }}>
              Joined {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
