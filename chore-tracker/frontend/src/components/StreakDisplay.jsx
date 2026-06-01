const MILESTONES = [7, 14, 21, 30, 60, 90]

export default function StreakDisplay({ streak, longest, totalApproved }) {
  // Find the next milestone above current streak
  const nextMilestone = MILESTONES.find(m => m > streak)
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= streak) || 0
  const progress = nextMilestone
    ? Math.round(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100

  const flameColor = streak >= 30 ? '#f97316'
    : streak >= 14 ? '#f59e0b'
    : streak >= 7  ? '#eab308'
    : '#6366f1'

  return (
    <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {/* Streak fire */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: `${flameColor}18`, borderRadius: 14, padding: '.75rem 1rem', flexShrink: 0,
      }}>
        <span style={{ fontSize: '2rem' }}>🔥</span>
        <span style={{ fontSize: '2rem', fontWeight: 900, color: flameColor, lineHeight: 1 }}>
          {streak}
        </span>
        <span style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 600 }}>
          {streak === 1 ? 'day streak' : 'day streak'}
        </span>
      </div>

      {/* Right side */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {nextMilestone ? (
          <>
            <div style={{ fontSize: '.8rem', color: '#64748b', marginBottom: '.4rem' }}>
              🎯 {nextMilestone - streak} day{nextMilestone - streak !== 1 ? 's' : ''} to {nextMilestone}-day milestone!
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: flameColor, borderRadius: 999,
                transition: 'width .5s ease',
              }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: '.85rem', color: '#f97316', fontWeight: 700 }}>
            🏆 Legendary! {streak} days!
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '.6rem' }}>
          <Stat label="Best" value={`${longest}d`} />
          <Stat label="Total ✓" value={totalApproved} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a2e' }}>{value}</div>
      <div style={{ fontSize: '.7rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
    </div>
  )
}
