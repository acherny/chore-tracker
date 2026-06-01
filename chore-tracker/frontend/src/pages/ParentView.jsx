import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLORS = ['#6366f1','#ec4899','#22c55e','#f59e0b','#06b6d4','#ef4444','#8b5cf6']

export default function ParentView() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('chores') // 'chores' | 'kids' | 'review'

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '1.25rem 1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>⚙️ Parent Dashboard</h1>
        <button onClick={() => navigate('/')} className="btn" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '.4rem .9rem', fontSize: '.85rem' }}>
          ← Home
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        {[['chores','📋 Chores'],['kids','👦 Kids'],['review','✅ Review']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '1rem', fontWeight: 700, fontSize: '.9rem',
            color: tab === id ? '#6366f1' : '#64748b',
            borderBottom: tab === id ? '3px solid #6366f1' : '3px solid transparent',
            background: 'none', transition: 'color .15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '1.25rem' }}>
        {tab === 'chores' && <ChoresTab />}
        {tab === 'kids'   && <KidsTab colors={COLORS} />}
        {tab === 'review' && <ReviewTab />}
      </div>
    </div>
  )
}

// ── Chores Tab ────────────────────────────────────────────────────────────────

function ChoresTab() {
  const [chores, setChores] = useState([])
  const [kids, setKids] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily', days_of_week: [] })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = async () => {
    const [c, k, a] = await Promise.all([
      fetch('./api/chores/').then(r => r.json()),
      fetch('./api/kids/').then(r => r.json()),
      fetch('./api/chores/assignments').then(r => r.json()),
    ])
    setChores(c); setKids(k); setAssignments(a)
  }
  useEffect(() => { load() }, [])

  const assignedKidIds = (choreId) =>
    assignments.filter(a => a.chore_id === choreId).map(a => a.kid_id)

  const toggleAssign = async (choreId, kidId) => {
    const existing = assignments.find(a => a.chore_id === choreId && a.kid_id === kidId)
    if (existing) {
      await fetch(`./api/chores/assignments/${existing.id}`, { method: 'DELETE' })
    } else {
      await fetch('./api/chores/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chore_id: choreId, kid_id: kidId }),
      })
    }
    load()
  }

  const toggleActive = async (chore) => {
    await fetch(`./api/chores/${chore.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !chore.active }),
    })
    load()
  }

  const deleteChore = async (id) => {
    if (!confirm('Delete this chore?')) return
    await fetch(`./api/chores/${id}`, { method: 'DELETE' })
    load()
  }

  const submitChore = async (e) => {
    e.preventDefault()
    await fetch('./api/chores/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ title: '', description: '', frequency: 'daily', days_of_week: [] })
    setShowForm(false)
    load()
  }

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter(d => d !== day)
        : [...f.days_of_week, day],
    }))
  }

  const startEdit = (chore) => {
    setEditingId(chore.id)
    setEditForm({
      title: chore.title,
      description: chore.description || '',
      frequency: chore.frequency,
      days_of_week: chore.days_of_week || [],
    })
    setShowForm(false) // close "add" form if open
  }

  const toggleEditDay = (day) => {
    setEditForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter(d => d !== day)
        : [...f.days_of_week, day],
    }))
  }

  const submitEdit = async (e, choreId) => {
    e.preventDefault()
    await fetch(`./api/chores/${choreId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditingId(null)
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>All Chores</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Chore'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitChore} className="card slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <h3 style={{ fontWeight: 700 }}>New Chore</h3>
          <FormField label="Title *">
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={inputStyle} placeholder="e.g. Make your bed" />
          </FormField>
          <FormField label="Description (optional)">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={inputStyle} placeholder="Any extra details…" />
          </FormField>
          <FormField label="Frequency">
            <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value, days_of_week: [] }))} style={inputStyle}>
              <option value="daily">Every day</option>
              <option value="weekly">Specific days of week</option>
            </select>
          </FormField>
          {form.frequency === 'weekly' && (
            <FormField label="Days">
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                {DAYS.map((d, i) => (
                  <button type="button" key={i} onClick={() => toggleDay(i)}
                    style={{
                      padding: '.35rem .75rem', borderRadius: 999, fontSize: '.85rem', fontWeight: 600,
                      background: form.days_of_week.includes(i) ? '#6366f1' : '#f1f5f9',
                      color: form.days_of_week.includes(i) ? '#fff' : '#475569',
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </FormField>
          )}
          <button type="submit" className="btn btn-success" style={{ alignSelf: 'flex-end' }}>
            Save Chore
          </button>
        </form>
      )}

      {chores.map(chore => (
        <div key={chore.id} className="card" style={{ opacity: chore.active ? 1 : .5 }}>
          {editingId === chore.id ? (
            /* ── Inline edit form ── */
            <form onSubmit={e => submitEdit(e, chore.id)} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700 }}>Edit Chore</h3>
                <button type="button" onClick={() => setEditingId(null)} style={{ background: 'none', color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
              </div>
              <FormField label="Title *">
                <input required value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
              </FormField>
              <FormField label="Description (optional)">
                <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} placeholder="Any extra details…" />
              </FormField>
              <FormField label="Frequency">
                <select value={editForm.frequency} onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value, days_of_week: [] }))} style={inputStyle}>
                  <option value="daily">Every day</option>
                  <option value="weekly">Specific days of week</option>
                </select>
              </FormField>
              {editForm.frequency === 'weekly' && (
                <FormField label="Days">
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                    {DAYS.map((d, i) => (
                      <button type="button" key={i} onClick={() => toggleEditDay(i)}
                        style={{
                          padding: '.35rem .75rem', borderRadius: 999, fontSize: '.85rem', fontWeight: 600,
                          background: editForm.days_of_week.includes(i) ? '#6366f1' : '#f1f5f9',
                          color: editForm.days_of_week.includes(i) ? '#fff' : '#475569',
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </FormField>
              )}
              <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingId(null)} className="btn btn-ghost" style={{ padding: '.5rem 1.1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-success" style={{ padding: '.5rem 1.1rem' }}>Save Changes</button>
              </div>
            </form>
          ) : (
            /* ── Normal view ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{chore.title}</div>
                  {chore.description && <div style={{ fontSize: '.85rem', color: '#64748b' }}>{chore.description}</div>}
                  <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.2rem' }}>
                    {chore.frequency === 'daily' ? '📅 Every day'
                      : `📅 ${(chore.days_of_week || []).map(d => DAYS[d]).join(', ')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button onClick={() => startEdit(chore)} className="btn" style={{ padding: '.3rem .7rem', fontSize: '.8rem', background: '#eff6ff', color: '#3b82f6' }}>
                    Edit
                  </button>
                  <button onClick={() => toggleActive(chore)} className="btn" style={{ padding: '.3rem .7rem', fontSize: '.8rem', background: chore.active ? '#f1f5f9' : '#dcfce7', color: chore.active ? '#ef4444' : '#16a34a' }}>
                    {chore.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteChore(chore.id)} className="btn" style={{ padding: '.3rem .7rem', fontSize: '.8rem', background: '#fef2f2', color: '#ef4444' }}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Kid assignment chips */}
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: '#94a3b8', fontWeight: 600 }}>Assigned to:</span>
                {kids.map(kid => {
                  const assigned = assignedKidIds(chore.id).includes(kid.id)
                  return (
                    <button key={kid.id} onClick={() => toggleAssign(chore.id, kid.id)}
                      style={{
                        padding: '.3rem .8rem', borderRadius: 999, fontSize: '.82rem', fontWeight: 600,
                        background: assigned ? kid.avatar_color : '#f1f5f9',
                        color: assigned ? '#fff' : '#475569',
                        transition: 'all .15s',
                      }}>
                      {assigned ? '✓ ' : ''}{kid.name}
                    </button>
                  )
                })}
                {kids.length === 0 && <span style={{ fontSize: '.8rem', color: '#94a3b8' }}>No kids added yet</span>}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Kids Tab ──────────────────────────────────────────────────────────────────

function KidsTab({ colors }) {
  const [kids, setKids] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', avatar_color: colors[0], pin: '' })

  const load = () => fetch('./api/kids/').then(r => r.json()).then(setKids)
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await fetch('./api/kids/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pin: form.pin || null }),
    })
    setForm({ name: '', avatar_color: colors[0], pin: '' })
    setShowForm(false)
    load()
  }

  const deleteKid = async (id) => {
    if (!confirm('Remove this kid? All their chore history will be deleted.')) return
    await fetch(`./api/kids/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Kids</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Kid'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <h3 style={{ fontWeight: 700 }}>New Kid</h3>
          <FormField label="Name *">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle} placeholder="Name" />
          </FormField>
          <FormField label="Color">
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {colors.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.avatar_color === c ? '3px solid #1a1a2e' : '3px solid transparent' }} />
              ))}
            </div>
          </FormField>
          <FormField label="PIN (optional, 4 digits)">
            <input value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
              style={inputStyle} placeholder="Leave blank for no PIN" maxLength={4} pattern="\d{4}" />
          </FormField>
          <button type="submit" className="btn btn-success" style={{ alignSelf: 'flex-end' }}>
            Add Kid
          </button>
        </form>
      )}

      {kids.map(kid => (
        <div key={kid.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: kid.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
            {kid.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{kid.name}</div>
            <div style={{ fontSize: '.8rem', color: '#94a3b8' }}>{kid.pin ? '🔒 PIN set' : 'No PIN'}</div>
          </div>
          <button onClick={() => deleteKid(kid.id)} className="btn" style={{ padding: '.3rem .7rem', fontSize: '.8rem', background: '#fef2f2', color: '#ef4444' }}>
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Review Tab ────────────────────────────────────────────────────────────────

function ReviewTab() {
  const [pending, setPending] = useState([])
  const [kids, setKids] = useState([])
  const [chores, setChores] = useState([])

  const load = async () => {
    const [p, k, c] = await Promise.all([
      fetch('./api/completions/?status=pending').then(r => r.json()),
      fetch('./api/kids/').then(r => r.json()),
      fetch('./api/chores/').then(r => r.json()),
    ])
    setPending(p); setKids(k); setChores(c)
  }
  useEffect(() => { load() }, [])

  const review = async (id, status, notes = null) => {
    await fetch(`./api/completions/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
    load()
  }

  const kidName = (id) => kids.find(k => k.id === id)?.name || 'Unknown'
  const kidColor = (id) => kids.find(k => k.id === id)?.avatar_color || '#6366f1'
  const choreName = (id) => chores.find(c => c.id === id)?.title || 'Unknown'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>
        Pending Review {pending.length > 0 && <span style={{ background: '#6366f1', color: '#fff', borderRadius: 999, padding: '.1rem .6rem', fontSize: '.75rem', marginLeft: '.5rem' }}>{pending.length}</span>}
      </h2>

      {pending.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '2.5rem' }}>
          🎉 Nothing to review right now!
        </div>
      )}

      {pending.map(c => (
        <div key={c.id} className="card slide-up" style={{ borderLeft: `5px solid ${kidColor(c.kid_id)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{choreName(c.chore_id)}</div>
              <div style={{ fontSize: '.85rem', color: '#64748b' }}>
                {kidName(c.kid_id)} · {new Date(c.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {c.completed_at && (
                <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>
                  Submitted {new Date(c.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => review(c.id, 'approved')}>
              ✅ Looks Good!
            </button>
            <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
              const notes = prompt('What needs to be fixed?')
              review(c.id, 'rejected', notes)
            }}>
              ↩️ Try Again
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
      <label style={{ fontSize: '.82rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  padding: '.6rem .9rem',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: '.95rem',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
}
