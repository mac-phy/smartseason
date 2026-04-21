import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

function UpdateForm({ field, onUpdated }) {
  const { user } = useAuth()
  const [stage, setStage] = useState(field.stage)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true); setSuccess(false)
    try {
      const updated = await api.updateField(field.id, { stage, notes })
      onUpdated(updated)
      setNotes('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const stages = ['Planted', 'Growing', 'Ready', 'Harvested']

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--bark)' }}>Log Update</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Current Stage</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stages.map(s => (
              <button type="button" key={s} onClick={() => setStage(s)} className={`stage-pill stage-${s}`}
                style={{ cursor: 'pointer', border: stage === s ? '2px solid var(--soil)' : '2px solid transparent', padding: '5px 14px', fontSize: '0.82rem', transition: 'all 0.15s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes / Observations</label>
          <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe current conditions, any issues, actions taken…" style={{ resize: 'vertical' }} />
        </div>
        {error && <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '8px 12px', borderRadius: 6, fontSize: '0.875rem' }}>{error}</div>}
        {success && <div style={{ background: 'var(--active-bg)', color: 'var(--active)', padding: '8px 12px', borderRadius: 6, fontSize: '0.875rem' }}>✓ Update logged successfully</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Submit Update'}
        </button>
      </form>
    </div>
  )
}

function EditFieldModal({ field, agents, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: field.name, crop_type: field.crop_type, planting_date: field.planting_date,
    stage: field.stage, location: field.location || '', size_hectares: field.size_hectares || '',
    assigned_agent_id: field.assigned_agent_id || ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const updated = await api.updateField(field.id, { ...form, size_hectares: form.size_hectares ? parseFloat(form.size_hectares) : null, assigned_agent_id: form.assigned_agent_id ? parseInt(form.assigned_agent_id) : null })
      onSaved(updated)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.3rem' }}>Edit Field</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '1.2rem' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Field Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type</label>
              <input className="form-input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Planting Date</label>
              <input type="date" className="form-input" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {['Planted', 'Growing', 'Ready', 'Harvested'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Size (ha)</label>
              <input type="number" step="0.1" className="form-input" value={form.size_hectares} onChange={e => set('size_hectares', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} />
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
          {error && <div style={{ background: 'var(--risk-bg)', color: 'var(--risk)', padding: '8px 12px', borderRadius: 6, fontSize: '0.875rem' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TimelineItem({ update, isLast }) {
  const date = new Date(update.created_at)
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--moss)', marginTop: 4 }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          {update.previous_stage && update.new_stage && update.previous_stage !== update.new_stage && (
            <span style={{ fontSize: '0.8rem', color: 'var(--clay)' }}>
              <span className={`stage-pill stage-${update.previous_stage}`}>{update.previous_stage}</span>
              {' → '}
              <span className={`stage-pill stage-${update.new_stage}`}>{update.new_stage}</span>
            </span>
          )}
          {update.previous_stage === update.new_stage && (
            <span className={`stage-pill stage-${update.new_stage}`}>{update.new_stage} (note added)</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--straw)' }}>
            {update.agent_name} · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {update.notes && (
          <div style={{ background: 'var(--wheat)', borderRadius: 6, padding: '8px 12px', fontSize: '0.875rem', color: 'var(--bark)', lineHeight: 1.5 }}>
            {update.notes}
          </div>
        )}
      </div>
    </div>
  )
}

export default function FieldDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [field, setField] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.field(id),
      user?.role === 'admin' ? api.agents() : Promise.resolve([])
    ]).then(([f, a]) => { setField(f); setAgents(a) }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this field? This action cannot be undone.')) return
    setDeleting(true)
    try { await api.deleteField(id); navigate('/fields') }
    catch (err) { alert(err.message); setDeleting(false) }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
  if (!field) return <div style={{ padding: 40, color: 'var(--clay)' }}>Field not found.</div>

  const statusClass = { Active: 'badge-active', 'At Risk': 'badge-risk', Completed: 'badge-done' }
  const isAdmin = user?.role === 'admin'
  const isAssignedAgent = user?.role === 'agent' && field.assigned_agent_id === user.id
  const canUpdate = isAdmin || isAssignedAgent
  const daysSince = Math.floor((Date.now() - new Date(field.planting_date)) / 86400000)

  return (
    <div className="fade-in" style={{ padding: '32px 36px', maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8rem', color: 'var(--clay)', marginBottom: 20 }}>
        <Link to="/fields" style={{ color: 'var(--moss)' }}>← Fields</Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: '2rem' }}>{field.name}</h1>
            <span className={`badge ${statusClass[field.status]}`}>{field.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`stage-pill stage-${field.stage}`}>{field.stage}</span>
            <span style={{ color: 'var(--clay)', fontSize: '0.875rem' }}>{field.crop_type}</span>
            {field.location && <span style={{ color: 'var(--clay)', fontSize: '0.875rem' }}>📍 {field.location}</span>}
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowEdit(true)} className="btn btn-secondary btn-sm">Edit</button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={deleting}>Delete</button>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          ['Planting Date', new Date(field.planting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })],
          ['Days in Season', `Day ${daysSince}`],
          ['Size', field.size_hectares ? `${field.size_hectares} hectares` : '—'],
          ['Assigned Agent', field.agent_name || 'Unassigned'],
        ].map(([label, value]) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--soil)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: canUpdate ? '1fr 1.2fr' : '1fr', gap: 20 }}>
        {/* Update form */}
        {canUpdate && <UpdateForm field={field} onUpdated={(updated) => setField(f => ({ ...f, ...updated, updates: f.updates }))} />}

        {/* Update history */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: 'var(--bark)' }}>
            Update History {field.updates?.length > 0 && <span style={{ color: 'var(--clay)', fontWeight: 400, fontSize: '0.85rem' }}>({field.updates.length})</span>}
          </h3>
          {field.updates?.length ? (
            <div>
              {field.updates.map((u, i) => (
                <TimelineItem key={u.id} update={u} isLast={i === field.updates.length - 1} />
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--clay)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
              No updates logged yet
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditFieldModal
          field={field}
          agents={agents}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setField(f => ({ ...f, ...updated })); setShowEdit(false) }}
        />
      )}
    </div>
  )
}
