import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.agents().then(setAgents).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>

  return (
    <div className="fade-in" style={{ padding: '32px 36px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--soil)' }}>Field Agents</h1>
        <p style={{ color: 'var(--clay)', fontSize: '0.9rem', marginTop: 4 }}>{agents.length} agents in the programme</p>
      </div>

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
