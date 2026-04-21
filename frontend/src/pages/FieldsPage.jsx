import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

function FieldCard({ field }) {
  const statusClass = { Active: 'badge-active', 'At Risk': 'badge-risk', Completed: 'badge-done' }
  const daysSincePlanting = Math.floor((Date.now() - new Date(field.planting_date)) / 86400000)

  return (
    <Link to={`/fields/${field.id}`}>
      <div className="card" style={{ padding: '18px 20px', transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--soil)', marginBottom: 2 }}>{field.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--clay)' }}>{field.crop_type}</div>
          </div>
          <span className={`badge ${statusClass[field.status]}`}>{field.status}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <span className={`stage-pill stage-${field.stage}`}>{field.stage}</span>
          {field.location && <span style={{ fontSize: '0.75rem', color: 'var(--clay)' }}>📍 {field.location}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--clay)' }}>
          <span>Day {daysSincePlanting} of season</span>
          {field.agent_name && <span>👤 {field.agent_name}</span>}
          {field.size_hectares && <span>{field.size_hectares} ha</span>}
        </div>
      </div>
    </Link>
  )
}

function CreateFieldModal({ agents, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', crop_type: '', planting_date: new Date().toISOString().split('T')[0], stage: 'Planted', location: '', size_hectares: '', assigned_agent_id: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = { ...form, size_hectares: form.size_hectares ? parseFloat(form.size_hectares) : null, assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null }
      const field = await api.createField(payload)
      onCreated(field)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.3rem' }}>New Field</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '4px 8px' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Field Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. North Plot A" />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <input className="form-input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required placeholder="e.g. Maize" />
            </div>
            <div className="form-group">
              <label className="form-label">Planting Date *</label>
              <input type="date" className="form-input" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stage</label>
              <select className="form-input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {['Planted', 'Growing', 'Ready', 'Harvested'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Size (hectares)</label>
              <input type="number" step="0.1" className="form-input" value={form.size_hectares} onChange={e => set('size_hectares', e.target.value)} placeholder="0.0" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Kiambu North" />
            </div>
            {agents?.length > 0 && (
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Assign Agent</label>
                <select className="form-input" value={form.assigned_agent_id} onChange={e => set('assigned_agent_id', e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
          </div>
          {error && <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '10px 14px', borderRadius: 6, fontSize: '0.875rem' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FieldsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [fields, setFields] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('All')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'All')

  useEffect(() => {
    Promise.all([
      api.fields(),
      user?.role === 'admin' ? api.agents() : Promise.resolve([])
    ]).then(([f, a]) => { setFields(f); setAgents(a) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = fields.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.crop_type.toLowerCase().includes(q) || (f.location || '').toLowerCase().includes(q) || (f.agent_name || '').toLowerCase().includes(q)
    const matchStage = filterStage === 'All' || f.stage === filterStage
    const matchStatus = filterStatus === 'All' || f.status === filterStatus
    return matchSearch && matchStage && matchStatus
  })

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>

  return (
    <div className="fade-in" style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--soil)' }}>Fields</h1>
          <p style={{ color: 'var(--clay)', fontSize: '0.9rem', marginTop: 4 }}>
            {user?.role === 'admin' ? `${fields.length} total fields` : `${fields.length} assigned to you`}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ New Field</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: '1 1 200px', maxWidth: 280 }} placeholder="Search fields, crops, agents…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input" style={{ width: 140 }} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="All">All Stages</option>
          {['Planted', 'Growing', 'Ready', 'Harvested'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-input" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['Active', 'At Risk', 'Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
          <h3>No fields found</h3>
          <p style={{ fontSize: '0.875rem' }}>{fields.length === 0 ? 'No fields have been created yet.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(f => <FieldCard key={f.id} field={f} />)}
        </div>
      )}

      {showCreate && (
        <CreateFieldModal
          agents={agents}
          onClose={() => setShowCreate(false)}
          onCreated={(f) => { setFields(prev => [f, ...prev]); setShowCreate(false) }}
        />
      )}
    </div>
  )
}
