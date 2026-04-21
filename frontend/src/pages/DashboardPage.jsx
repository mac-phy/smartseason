import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '2.2rem', fontFamily: 'Instrument Serif', color: color || 'var(--soil)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--clay)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function StageBar({ byStage }) {
  const stages = ['Planted', 'Growing', 'Ready', 'Harvested']
  const colors = { Planted: '#E65100', Growing: '#1B5E20', Ready: '#0D47A1', Harvested: '#546E7A' }
  const bgs = { Planted: '#FFF3E0', Growing: '#E8F5E9', Ready: '#E3F2FD', Harvested: '#ECEFF1' }
  const total = Object.values(byStage).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Stage Breakdown</div>
      <div style={{ display: 'flex', height: 10, borderRadius: 10, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
        {stages.map(s => byStage[s] > 0 && (
          <div key={s} style={{ flex: byStage[s] / total, background: colors[s], transition: 'flex 0.5s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
        {stages.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[s], display: 'inline-block' }} />
            <span style={{ color: 'var(--bark)' }}>{s}</span>
            <span style={{ color: 'var(--clay)', fontWeight: 600 }}>{byStage[s] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpdateItem({ update }) {
  const date = new Date(update.created_at)
  const ago = getTimeAgo(date)
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--wheat)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, fontWeight: 600, color: 'var(--bark)' }}>
        {(update.agent_name || 'U').charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--soil)', marginBottom: 2 }}>
          {update.field_name}
          {update.previous_stage && update.new_stage && (
            <span style={{ color: 'var(--clay)', fontWeight: 400 }}>
              {' '}· <span className={`stage-pill stage-${update.previous_stage}`}>{update.previous_stage}</span>
              {' → '}
              <span className={`stage-pill stage-${update.new_stage}`}>{update.new_stage}</span>
            </span>
          )}
        </div>
        {update.notes && <div style={{ fontSize: '0.8rem', color: 'var(--clay)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{update.notes}</div>}
        <div style={{ fontSize: '0.75rem', color: 'var(--straw)' }}>{update.agent_name} · {ago}</div>
      </div>
    </div>
  )
}

function AtRiskCard({ field }) {
  return (
    <Link to={`/fields/${field.id}`}>
      <div className="card" style={{ padding: '14px 16px', borderLeft: '3px solid var(--risk)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--soil)' }}>{field.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clay)' }}>{field.crop_type} · <span className={`stage-pill stage-${field.stage}`}>{field.stage}</span></div>
        </div>
        <span className="badge badge-risk">At Risk</span>
      </div>
    </Link>
  )
}

function getTimeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
  if (!data) return null

  const isAdmin = user?.role === 'admin'

  return (
    <div className="fade-in" style={{ padding: '32px 36px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--clay)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--soil)' }}>
          {isAdmin ? 'Season Overview' : `Good day, ${user?.name?.split(' ')[0]}`}
        </h1>
        <p style={{ color: 'var(--clay)', marginTop: 4, fontSize: '0.9rem' }}>
          {isAdmin ? `Monitoring ${data.totalFields} fields across ${data.agentCount} agents` : `You have ${data.totalFields} field${data.totalFields !== 1 ? 's' : ''} assigned`}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Fields" value={data.totalFields} />
        <StatCard label="Active" value={data.byStatus.Active || 0} color="var(--active)" />
        <StatCard label="At Risk" value={data.byStatus['At Risk'] || 0} color="var(--risk)" />
        <StatCard label="Completed" value={data.byStatus.Completed || 0} color="var(--done)" />
        {isAdmin && <StatCard label="Field Agents" value={data.agentCount} />}
      </div>

      {/* Stage bar */}
      <div style={{ marginBottom: 24 }}>
        <StageBar byStage={data.byStage} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Activity */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</div>
            <Link to="/fields" style={{ fontSize: '0.78rem', color: 'var(--moss)' }}>View all →</Link>
          </div>
          {data.recentUpdates?.length ? (
            data.recentUpdates.map(u => <UpdateItem key={u.id} update={u} />)
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p style={{ fontSize: '0.875rem' }}>No updates yet</p>
            </div>
          )}
        </div>

        {/* At Risk / Quick Links */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            {data.byStatus['At Risk'] > 0 ? '⚠ At-Risk Fields' : 'Field Summary'}
          </div>
          {data.byStatus['At Risk'] > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* We show at-risk items from recent updates that have status At Risk */}
              <div style={{ padding: '20px', background: 'var(--risk-bg)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'Instrument Serif', color: 'var(--risk)' }}>{data.byStatus['At Risk']}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--risk)', marginTop: 4 }}>
                  field{data.byStatus['At Risk'] !== 1 ? 's' : ''} need attention
                </div>
                <Link to="/fields?status=At+Risk">
                  <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }}>Review Fields →</button>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', background: 'var(--active-bg)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✓</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--active)', fontWeight: 500 }}>All fields on track</div>
            </div>
          )}

          {/* Stage summary pills */}
          <div style={{ marginTop: 16 }}>
            {[['Ready', 'Ready for harvest'], ['Growing', 'In growth phase'], ['Planted', 'Recently planted']].map(([stage, label]) => (
              data.byStage[stage] > 0 && (
                <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--bark)' }}>{label}</span>
                  <span className={`stage-pill stage-${stage}`}>{data.byStage[stage]}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
