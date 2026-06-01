import { useEffect, useState } from 'react'

const MILESTONE_COPY = {
  streak_7:   { emoji: '⭐', title: '1 Week Streak!',   subtitle: 'You did it! 7 days in a row!' },
  streak_14:  { emoji: '🌟', title: '2 Week Streak!',   subtitle: '14 days straight — incredible!' },
  streak_21:  { emoji: '🏅', title: '3 Week Streak!',   subtitle: 'Three whole weeks! You\'re on fire!' },
  streak_30:  { emoji: '🥇', title: '1 Month Streak!',  subtitle: '30 days! You\'re a chore champion!' },
  streak_60:  { emoji: '🏆', title: '2 Month Streak!',  subtitle: '60 days! Absolutely legendary!' },
  streak_90:  { emoji: '👑', title: '3 Month Streak!',  subtitle: 'Three months! You are a STAR!' },
  streak_180: { emoji: '💎', title: '6 Month Streak!',  subtitle: 'Half a year of awesomeness!' },
  streak_365: { emoji: '🌈', title: 'Full Year Streak!', subtitle: 'A WHOLE YEAR! You are unstoppable!' },
}

// Confetti pieces
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4']
function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${Math.random() * 90 + 5}%`,
    delay: `${Math.random() * .5}s`,
    size: Math.random() * 8 + 6,
  }))
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: 0,
          width: p.size, height: p.size,
          background: p.color, borderRadius: 2,
          animation: `confetti-fall 1.2s ${p.delay} ease-in both`,
        }} />
      ))}
    </div>
  )
}

export default function WinsModal({ achievements, kidName, onClose }) {
  const [current, setCurrent] = useState(0)

  const achievement = achievements[current]
  const copy = MILESTONE_COPY[achievement?.achievement_type] || {
    emoji: '🎉',
    title: 'Achievement Unlocked!',
    subtitle: 'Amazing work!',
  }

  const next = () => {
    if (current < achievements.length - 1) setCurrent(c => c + 1)
    else onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1.5rem',
    }}>
      <div className="card pop-in" style={{
        maxWidth: 360, width: '100%', textAlign: 'center',
        position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem',
      }}>
        <Confetti />
        <div style={{ fontSize: '5rem', marginBottom: '.5rem', lineHeight: 1 }}>{copy.emoji}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1a2e', marginBottom: '.5rem' }}>
          {copy.title}
        </div>
        <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '.25rem' }}>
          {kidName}, {copy.subtitle}
        </div>

        {achievements.length > 1 && (
          <div style={{ fontSize: '.8rem', color: '#94a3b8', margin: '.75rem 0' }}>
            {current + 1} of {achievements.length} new achievements
          </div>
        )}

        <button className="btn btn-primary" onClick={next} style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '.9rem' }}>
          {current < achievements.length - 1 ? 'Next Achievement! →' : '🎉 Let\'s Go!'}
        </button>
      </div>
    </div>
  )
}
