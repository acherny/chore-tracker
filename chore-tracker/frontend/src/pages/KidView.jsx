import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StreakDisplay from '../components/StreakDisplay'
import WinsModal from '../components/WinsModal'
import ChoreCard from '../components/ChoreCard'

export default function KidView() {
  const { kidId } = useParams()
  const navigate = useNavigate()

  const [chores, setChores] = useState([])
  const [stats, setStats] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(new Date().toISOString().split('T')[0])

  const loadData = useCallback(async () => {
    const [choreRes, statsRes] = await Promise.all([
      fetch(`./api/completions/today/${kidId}`),
      fetch(`./api/stats/${kidId}`),
    ])
    const choreData = await choreRes.json()
    const statsData = await statsRes.json()

    setChores(choreData.chores || [])
    setStats(statsData)

    // Surface any freshly earned achievements
    if (statsData.new_achievements?.length) {
      setNewAchievements(statsData.new_achievements)
    }
    setLoading(false)
  }, [kidId])

  useEffect(() => { loadData() }, [loadData])

  const handleComplete = async (chore) => {
    await fetch('./api/completions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chore_id: chore.chore_id, kid_id: Number(kidId), due_date: today }),
    })
    loadData()
  }

  if (loading) return <LoadingScreen />

  const doneCount = chores.filter(c => c.status === 'approved' || c.status === 'pending').length
  const totalCount = chores.length
  const allDone = totalCount > 0 && doneCount === totalCount
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff' }}>
      {/* Header */}
      <div style={{
        background: stats?.avatar_color || '#6366f1',
        padding: '1.5rem 1.5rem 3rem',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,.25)', borderRadius: 999, padding: '.4rem .9rem', color: '#fff', fontWeight: 600 }}>
            ← Back
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', opacity: .9 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '.25rem' }}>
          Hi, {stats?.kid_name}! 👋
        </h1>
        <p style={{ opacity: .85, fontSize: '1rem' }}>
          {allDone
            ? '🎉 All chores done! Amazing work!'
            : `${totalCount - doneCount} chore${totalCount - doneCount !== 1 ? 's' : ''} left today`}
        </p>
      </div>

      {/* Streak card — overlaps the header */}
      <div style={{ margin: '-1.5rem 1.25rem 0', position: 'relative', zIndex: 10 }}>
        <StreakDisplay
          streak={stats?.current_streak || 0}
          longest={stats?.longest_streak || 0}
          totalApproved={stats?.total_approved || 0}
        />
      </div>

      {/* Progress bar */}
      <div style={{ margin: '1.5rem 1.25rem 0', background: '#e2e8f0', borderRadius: 999, height: 12, overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: allDone ? '#22c55e' : (stats?.avatar_color || '#6366f1'),
          borderRadius: 999,
          transition: 'width .5s ease',
        }} />
      </div>
      <p style={{ textAlign: 'center', fontSize: '.85rem', color: '#64748b', marginTop: '.4rem' }}>
        {doneCount} of {totalCount} done today
      </p>

      {/* Chore list */}
      <div style={{ padding: '1rem 1.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {chores.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '2.5rem' }}>
            🎈 No chores assigned for today!
          </div>
        )}
        {chores.map(chore => (
          <ChoreCard
            key={chore.chore_id}
            chore={chore}
            accentColor={stats?.avatar_color || '#6366f1'}
            onComplete={() => handleComplete(chore)}
          />
        ))}
      </div>

      {/* All done celebration */}
      {allDone && (
        <div style={{
          margin: '0 1.25rem 2rem',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          borderRadius: 20, padding: '1.5rem',
          textAlign: 'center', color: '#fff',
        }} className="pop-in">
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>All done for today!</div>
          <div style={{ opacity: .9, marginTop: '.25rem' }}>Keep it up to grow your streak!</div>
        </div>
      )}

      {/* Wins modal for new achievements */}
      {newAchievements.length > 0 && (
        <WinsModal
          achievements={newAchievements}
          kidName={stats?.kid_name}
          onClose={() => setNewAchievements([])}
        />
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#6366f1' }}>
      <div style={{ fontSize: '3rem' }}>⏳</div>
      <p style={{ fontWeight: 600 }}>Loading your chores…</p>
    </div>
  )
}
