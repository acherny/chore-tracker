import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SelectKid() {
  const [kids, setKids] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('./api/kids/').then(r => r.json()).then(setKids)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6366f1', letterSpacing: '-1px' }}>
        🏠 Chore Tracker
      </h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Who's checking in?</p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {kids.map(kid => (
          <KidAvatar key={kid.id} kid={kid} onClick={() => navigate(`/kid/${kid.id}`)} />
        ))}
      </div>

      <button
        className="btn btn-ghost"
        style={{ marginTop: '1rem' }}
        onClick={() => navigate('/parent')}
      >
        ⚙️ Parent Dashboard
      </button>
    </div>
  )
}

function KidAvatar({ kid, onClick }) {
  return (
    <button
      onClick={onClick}
      className="pop-in"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        background: '#fff', borderRadius: '20px', padding: '2rem 2.5rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: `3px solid ${kid.avatar_color}`,
        transition: 'transform .15s, box-shadow .15s',
        fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)' }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: kid.avatar_color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem', color: '#fff', fontWeight: 800,
      }}>
        {kid.name.charAt(0).toUpperCase()}
      </div>
      {kid.name}
    </button>
  )
}
