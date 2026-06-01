import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Top-level wizard ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [kids, setKids] = useState([])   // full kid objects from API (have .id)
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
      {/* Step bar */}
      {step > 0 && step < 3 && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {['Add Kids', 'Add Chores'].map((label, i) => {
            const idx = i + 1
            const done = step > idx
            const active = step === idx
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', opacity: active || done ? 1 : .35 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.8rem', fontWeight: 800,
                  background: done ? '#22c55e' : active ? '#6366f1' : '#e2e8f0',
                  color: done || active ? '#fff' : '#94a3b8',
                }}>
                  {done ? '✓' : idx}
                </div>
                <span style={{ fontWeight: 600, fontSize: '.85rem', color: active ? '#6366f1' : done ? '#22c55e' : '#94a3b8' }}>
                  {label}
                </span>
                {i < 1 && <span style={{ color: '#e2e8f0', margin: '0 .25rem' }}>›</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Step content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <AddKidsStep kids={kids} setKids={setKids} onNext={() => setStep(2)} />}
        {step === 2 && <AddChoresStep kids={kids} onDone={() => setStep(3)} />}
        {step === 3 && <DoneStep onFinish={() => navigate('/')} />}
      </div>
    </div>
  )
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────

function WelcomeStep({ onNext }) {
  return (
    <div className="card pop-in" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1', marginBottom: '.5rem' }}>
        Welcome to Chore Tracker!
      </h1>
      <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Let's get you set up in two quick steps — add your kids, then add a few chores. You'll be up and running in under a minute.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', textAlign: 'left', background: '#f8f9ff', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        {[
          ['1️⃣', 'Add your kids and pick their colors'],
          ['2️⃣', 'Add chores and assign them'],
          ['🚀', 'Start tracking streaks and wins!'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', fontSize: '.95rem', color: '#475569', fontWeight: 500 }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onNext} style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem' }}>
        Let's Go! →
      </button>
    </div>
  )
}

// ── Step 1: Add Kids ──────────────────────────────────────────────────────────

function AddKidsStep({ kids, setKids, onNext }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addKid = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('./api/kids/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar_color: color }),
      })
      const kid = await res.json()
      setKids(prev => [...prev, kid])
      setName('')
      setColor(COLORS[kids.length + 1 < COLORS.length ? kids.length + 1 : 0])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card slide-up" style={{ maxWidth: 460, width: '100%', padding: '2rem' }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '.35rem' }}>👦 Add Your Kids</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '.95rem' }}>
        Add each child who'll be tracking chores. You can always add more later.
      </p>

      {/* Added kids so far */}
      {kids.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginBottom: '1.25rem' }}>
          {kids.map(kid => (
            <div key={kid.id} style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: kid.avatar_color + '20', borderRadius: 999,
              padding: '.35rem .75rem .35rem .35rem',
              border: `2px solid ${kid.avatar_color}`,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: kid.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '.9rem' }}>
                {kid.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#1a1a2e' }}>{kid.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={addKid} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <div>
          <label style={{ fontSize: '.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '.3rem' }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Emma"
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '.4rem' }}>Color</label>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button type="button" key={c} onClick={() => setColor(c)} style={{
                width: 34, height: 34, borderRadius: '50%', background: c,
                border: color === c ? '3px solid #1a1a2e' : '3px solid transparent',
                transition: 'border .15s',
              }} />
            ))}
          </div>
        </div>
        {error && <p style={{ color: '#ef4444', fontSize: '.85rem' }}>{error}</p>}
        <button type="submit" disabled={!name.trim() || saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: !name.trim() ? .5 : 1 }}>
          {saving ? 'Adding…' : '+ Add Kid'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          {kids.length === 0 ? 'Add at least one kid to continue' : `${kids.length} kid${kids.length !== 1 ? 's' : ''} added`}
        </span>
        <button className="btn btn-success" onClick={onNext} disabled={kids.length === 0} style={{ opacity: kids.length === 0 ? .4 : 1 }}>
          Continue →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Add Chores ────────────────────────────────────────────────────────

function AddChoresStep({ kids, onDone }) {
  const [chores, setChores] = useState([])
  const [form, setForm] = useState({ title: '', frequency: 'daily', days_of_week: [], assignedKids: [] })
  const [saving, setSaving] = useState(false)

  const toggleDay = (day) => setForm(f => ({
    ...f,
    days_of_week: f.days_of_week.includes(day) ? f.days_of_week.filter(d => d !== day) : [...f.days_of_week, day],
  }))

  const toggleKid = (kidId) => setForm(f => ({
    ...f,
    assignedKids: f.assignedKids.includes(kidId) ? f.assignedKids.filter(id => id !== kidId) : [...f.assignedKids, kidId],
  }))

  const addChore = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      // Create the chore
      const res = await fetch('./api/chores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), frequency: form.frequency, days_of_week: form.days_of_week }),
      })
      const chore = await res.json()

      // Assign to selected kids
      await Promise.all(form.assignedKids.map(kidId =>
        fetch('./api/chores/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chore_id: chore.id, kid_id: kidId }),
        })
      ))

      setChores(prev => [...prev, { ...chore, assignedKids: form.assignedKids }])
      setForm({ title: '', frequency: 'daily', days_of_week: [], assignedKids: [] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card slide-up" style={{ maxWidth: 500, width: '100%', padding: '2rem' }}>
      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '.35rem' }}>📋 Add Some Chores</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '.95rem' }}>
        Add a few chores to get started — you can always add, edit, or remove them later from the Parent Dashboard.
      </p>

      {/* Added chores so far */}
      {chores.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.25rem' }}>
          {chores.map(chore => (
            <div key={chore.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: '#f8f9ff', borderRadius: 10, padding: '.6rem .9rem' }}>
              <span style={{ fontSize: '1rem' }}>✅</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{chore.title}</span>
                <span style={{ fontSize: '.78rem', color: '#94a3b8', marginLeft: '.5rem' }}>
                  {chore.frequency === 'daily' ? 'Every day' : (chore.days_of_week || []).map(d => DAYS[d]).join(', ')}
                </span>
              </div>
              {chore.assignedKids.length > 0 && (
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  {chore.assignedKids.map(kidId => {
                    const kid = kids.find(k => k.id === kidId)
                    return kid ? (
                      <div key={kidId} style={{ width: 22, height: 22, borderRadius: '50%', background: kid.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 800 }}>
                        {kid.name.charAt(0)}
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={addChore} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <div>
          <label style={labelStyle}>Chore name</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Make your bed" style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>How often?</label>
          <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value, days_of_week: [] }))} style={{ ...inputStyle, width: '100%' }}>
            <option value="daily">Every day</option>
            <option value="weekly">Specific days of week</option>
          </select>
        </div>
        {form.frequency === 'weekly' && (
          <div>
            <label style={labelStyle}>Which days?</label>
            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
              {DAYS.map((d, i) => (
                <button type="button" key={i} onClick={() => toggleDay(i)} style={{
                  padding: '.3rem .65rem', borderRadius: 999, fontSize: '.82rem', fontWeight: 600,
                  background: form.days_of_week.includes(i) ? '#6366f1' : '#f1f5f9',
                  color: form.days_of_week.includes(i) ? '#fff' : '#475569',
                }}>{d}</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={labelStyle}>Assign to</label>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {kids.map(kid => (
              <button type="button" key={kid.id} onClick={() => toggleKid(kid.id)} style={{
                padding: '.3rem .8rem', borderRadius: 999, fontSize: '.85rem', fontWeight: 600,
                background: form.assignedKids.includes(kid.id) ? kid.avatar_color : '#f1f5f9',
                color: form.assignedKids.includes(kid.id) ? '#fff' : '#475569',
                transition: 'all .15s',
              }}>
                {form.assignedKids.includes(kid.id) ? '✓ ' : ''}{kid.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={!form.title.trim() || saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: !form.title.trim() ? .5 : 1 }}>
          {saving ? 'Adding…' : '+ Add Chore'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          {chores.length === 0 ? 'Add at least one chore to continue' : `${chores.length} chore${chores.length !== 1 ? 's' : ''} added`}
        </span>
        <button className="btn btn-success" onClick={onDone} disabled={chores.length === 0} style={{ opacity: chores.length === 0 ? .4 : 1 }}>
          Finish Setup →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Done ──────────────────────────────────────────────────────────────

function DoneStep({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 2800)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className="card pop-in" style={{ maxWidth: 380, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#22c55e', marginBottom: '.5rem' }}>You're all set!</h2>
      <p style={{ color: '#64748b', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        Your chores are set up and ready to go. Time to start building those streaks!
      </p>
      <button className="btn btn-primary" onClick={onFinish} style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', padding: '.9rem' }}>
        Go to Home Screen 🚀
      </button>
      <p style={{ fontSize: '.78rem', color: '#cbd5e1', marginTop: '.75rem' }}>Taking you there automatically…</p>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  padding: '.6rem .9rem',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: '.95rem',
  fontFamily: 'inherit',
  outline: 'none',
}

const labelStyle = {
  fontSize: '.82rem', fontWeight: 600, color: '#475569',
  display: 'block', marginBottom: '.35rem',
}
