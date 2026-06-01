export default function ChoreCard({ chore, accentColor, onComplete }) {
  const isDone = chore.status === 'approved' || chore.status === 'pending'
  const isPending = chore.status === 'pending'
  const isApproved = chore.status === 'approved'
  const isRejected = chore.status === 'rejected'

  const statusLabel = () => {
    if (isApproved) return { text: '✅ Approved!', color: '#22c55e' }
    if (isPending)  return { text: '⏳ Waiting for check…', color: '#f59e0b' }
    if (isRejected) return { text: '↩️ Try again', color: '#ef4444' }
    return null
  }

  const badge = statusLabel()

  return (
    <div
      className="card slide-up"
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        borderLeft: `5px solid ${isDone ? (isApproved ? '#22c55e' : '#f59e0b') : accentColor}`,
        opacity: isApproved ? .75 : 1,
        transition: 'all .2s',
      }}
    >
      {/* Big checkbox */}
      <button
        disabled={isPending || isApproved}
        onClick={onComplete}
        style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: isDone ? (isApproved ? '#22c55e' : '#f59e0b') : '#f1f5f9',
          border: `3px solid ${isDone ? 'transparent' : accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: '#fff',
          transition: 'all .2s',
          cursor: isPending || isApproved ? 'default' : 'pointer',
        }}
        aria-label={isDone ? 'Done' : 'Mark as done'}
      >
        {isDone ? '✓' : ''}
      </button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: '1.05rem',
          textDecoration: isApproved ? 'line-through' : 'none',
          color: isApproved ? '#94a3b8' : '#1a1a2e',
        }}>
          {chore.title}
        </div>
        {chore.description && (
          <div style={{ fontSize: '.85rem', color: '#64748b', marginTop: '.15rem' }}>
            {chore.description}
          </div>
        )}
        {badge && (
          <div style={{ fontSize: '.8rem', fontWeight: 600, color: badge.color, marginTop: '.3rem' }}>
            {badge.text}
          </div>
        )}
      </div>

      {/* Tap hint */}
      {!isDone && (
        <div style={{ fontSize: '.75rem', color: '#94a3b8', textAlign: 'center', flexShrink: 0 }}>
          Tap to<br />mark done
        </div>
      )}
    </div>
  )
}
