import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoals } from '../utils/storage'

function GoalCard({ goal, onClick }) {
  const pct = Math.round((goal.collected / goal.target) * 100)

  return (
    <div style={styles.card} onClick={() => onClick(goal.id)}>
      <div style={styles.cardTop}>
        <div style={styles.emoji}>{goal.emoji}</div>
        <span style={{ ...styles.status, ...(goal.status === 'completed' ? styles.statusCompleted : styles.statusActive) }}>
          {goal.status}
        </span>
      </div>
      <div style={styles.goalName}>{goal.name}</div>
      <div style={styles.goalDesc}>{goal.desc}</div>

      <div style={styles.progressWrap}>
        <div style={styles.progressLabels}>
          <span style={styles.collected}>{goal.collected} XLM</span>
<span style={styles.target}>of {goal.target} XLM</span>
        </div>
        <div style={styles.track}>
          <div style={{ ...styles.bar, width: `${pct}%`, background: goal.status === 'completed' ? 'linear-gradient(90deg, #06d6a0, #4f8ef7)' : 'linear-gradient(90deg, #4f8ef7, #7c3aed)' }}></div>
        </div>
        <div style={styles.pct}>{pct}% reached</div>
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.members}>👥 {goal.members} members</div>
        <div style={styles.deadline}>🗓 {goal.deadline}</div>
      </div>
    </div>
  )
}

function Goals() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [goals, setGoals] = useState([])

  useEffect(() => {
    const loadGoals = () => setGoals(getGoals())
    loadGoals()
    window.addEventListener('focus', loadGoals)
    return () => window.removeEventListener('focus', loadGoals)
  }, [])

  const filtered = goals.filter(g => {
    const matchFilter = filter === 'all' || g.status === filter
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Active Goals</div>
        <div style={styles.pageSub}>Browse and contribute to live goals on Stellar testnet</div>
      </div>

      <div style={styles.toolbar}>
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          style={styles.searchBox}
          placeholder="Search goals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button style={styles.createBtn} onClick={() => navigate('/create')}>
          + Create Goal
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎯</div>
          <div style={styles.emptyTitle}>
  {filter === 'completed' ? 'No completed goals yet' : 
   filter === 'active' ? 'No active goals yet' : 
   'No goals yet'}
</div>
<div style={styles.emptyDesc}>
  {filter === 'completed' ? 'Goals will appear here once they reach their target' :
   filter === 'active' ? 'Create a goal to get started!' :
   'Be the first to create a goal!'}
</div>
         {filter === 'all' && (
  <button style={{ ...styles.createBtn, marginTop: '1rem' }} onClick={() => navigate('/create')}>
    + Create First Goal
  </button>
)}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(goal => (
            <GoalCard key={goal.id} goal={goal} onClick={(id) => navigate(`/goal/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: { paddingTop: '64px', position: 'relative', zIndex: 1 },
  header: { padding: '3rem 2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.02em' },
  pageSub: { color: '#8a9cc4', fontSize: '.95rem', marginTop: '.5rem', fontWeight: 300 },
  toolbar: { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 1.5rem', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  filterBtn: { background: '#111827', border: '1px solid #1e2d47', color: '#8a9cc4', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .2s' },
  filterActive: { background: '#4f8ef7', borderColor: '#4f8ef7', color: '#fff' },
  searchBox: { flex: 1, minWidth: '200px', background: '#111827', border: '1px solid #1e2d47', color: '#f0f4ff', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' },
  createBtn: { background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  grid: { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' },
  card: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '20px', padding: '1.5rem', cursor: 'pointer', transition: 'all .3s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  emoji: { width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79,142,247,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  status: { fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', letterSpacing: '.04em', textTransform: 'uppercase' },
  statusActive: { background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' },
  statusCompleted: { background: 'rgba(79,142,247,.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,.2)' },
  goalName: { fontFamily: "'Syne', sans-serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '.3rem', letterSpacing: '-.01em' },
  goalDesc: { fontSize: '13px', color: '#8a9cc4', marginBottom: '1.25rem', fontWeight: 300, lineHeight: 1.5 },
  progressWrap: { marginBottom: '.75rem' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '.4rem' },
  collected: { color: '#f0f4ff', fontWeight: 500 },
  target: { color: '#4a5a7a' },
  track: { height: '6px', background: '#0d1428', borderRadius: '100px', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: '100px', transition: 'width .8s cubic-bezier(.4,0,.2,1)' },
  pct: { fontSize: '11px', color: '#4a5a7a', marginTop: '.3rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #1e2d47', marginTop: '.75rem' },
  members: { fontSize: '12px', color: '#8a9cc4' },
  deadline: { fontSize: '12px', color: '#4a5a7a' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: '#4a5a7a' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem', opacity: .4 },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#8a9cc4', marginBottom: '.5rem' },
  emptyDesc: { fontSize: '13px' },
}

export default Goals