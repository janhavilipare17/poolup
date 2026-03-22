import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScreenSize } from '../hooks/useScreenSize'
import { useWallet } from '../hooks/useWallet'
import { getGoalsFromChain } from '../utils/contract'

const TX_COLORS = {
  contribute: { bg: 'rgba(16,185,129,.1)', color: '#10b981', label: 'Contribute' },
  release: { bg: 'rgba(79,142,247,.1)', color: '#4f8ef7', label: 'Released' },
  refund: { bg: 'rgba(239,68,68,.08)', color: '#ef4444', label: 'Refunded' },
}

function Dashboard() {
  const navigate = useNavigate()
  const { isMobile } = useScreenSize()
  const walletAddr = useWallet()
  const [myGoals, setMyGoals] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true)
      if (!walletAddr) {
        setLoading(false)
        return
      }
      try {
        const chainGoals = await getGoalsFromChain()
        const myChainGoals = chainGoals.filter(g =>
          g.organiser === walletAddr ||
          g.contributors?.some(c => c.addr === walletAddr)
        )
        setMyGoals(myChainGoals)
      } catch (err) {
        console.error(err)
        setMyGoals([])
      }
      setLoading(false)
    }
    loadGoals()
  }, [walletAddr])

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.inner, padding: isMobile ? '1.5rem 1rem 3rem' : '2rem 2rem 4rem' }}>

        <div style={styles.header}>
          <div style={{ ...styles.pageTitle, fontSize: isMobile ? '1.8rem' : '2.5rem' }}>My Dashboard</div>
          <div style={styles.pageSub}>Goals connected to your wallet</div>
        </div>

        {!walletAddr ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>👛</div>
            <div style={styles.emptyTitle}>Connect your wallet first</div>
            <div style={styles.emptyDesc}>Connect your Stellar wallet to see your goals and contributions</div>
          </div>
        ) : loading ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <div style={styles.emptyTitle}>Loading your goals from Stellar...</div>
          </div>
        ) : (
          <>
            {/* stats */}
            <div style={{ ...styles.statsRow, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {[
                { icon: '🎯', value: myGoals.filter(g => g.organiser === walletAddr).length, label: 'Goals Created', color: '#4f8ef7' },
                { icon: '💰', value: `${myGoals.reduce((sum, g) => sum + g.collected, 0)} XLM`, label: 'Total Pooled', color: '#7c3aed' },
                { icon: '✅', value: myGoals.filter(g => g.status === 'completed').length, label: 'Completed', color: '#06d6a0' },
                { icon: '⚡', value: myGoals.reduce((sum, g) => sum + g.contributors.filter(c => c.addr === walletAddr).length, 0), label: 'My Transactions', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ ...styles.statCard, borderLeftColor: s.color, padding: isMobile ? '1rem' : '1.5rem' }}>
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div style={{ ...styles.statValue, color: s.color, fontSize: isMobile ? '1.5rem' : '2rem' }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* tabs */}
            <div style={styles.tabs}>
              {[
                { key: 'all', label: 'All My Goals' },
                { key: 'created', label: 'Created by Me' },
                { key: 'contributed', label: 'I Contributed' },
              ].map(t => (
                <button
                  key={t.key}
                  style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabActive : {}) }}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* goals */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>
                  {tab === 'all' ? 'All Related Goals' : tab === 'created' ? 'Goals I Created' : 'Goals I Contributed To'}
                </div>
                <button style={styles.createBtn} onClick={() => navigate('/create')}>
                  + New Goal
                </button>
              </div>

              {(() => {
                const filtered = tab === 'all' ? myGoals :
                  tab === 'created' ? myGoals.filter(g => g.organiser === walletAddr) :
                  myGoals.filter(g => g.contributors.some(c => c.addr === walletAddr))

                return filtered.length === 0 ? (
                  <div style={styles.empty}>
                    <div style={styles.emptyIcon}>🎯</div>
                    <div style={styles.emptyTitle}>No goals here yet</div>
                    <div style={styles.emptyDesc}>
                      {tab === 'created' ? 'Create your first goal!' : 'Contribute to a goal to see it here'}
                    </div>
                    <button style={{ ...styles.createBtn, marginTop: '1rem' }} onClick={() => navigate('/create')}>
                      + Create First Goal
                    </button>
                  </div>
                ) : (
                  <div style={{ ...styles.goalsRow, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                    {filtered.map(goal => {
                      const pct = Math.round((goal.collected / goal.target) * 100)
                      const isOrganiser = goal.organiser === walletAddr
                      return (
                        <div key={goal.id} style={styles.goalCard} onClick={() => navigate(`/goal/${goal.id}`)}>
                          <div style={styles.goalTop}>
                            <span style={styles.goalEmoji}>{goal.emoji}</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {isOrganiser && (
                                <span style={styles.organizerBadge}>Organiser</span>
                              )}
                              <span style={{ ...styles.goalStatus, ...(goal.status === 'completed' ? styles.statusCompleted : styles.statusActive) }}>
                                {goal.status}
                              </span>
                            </div>
                          </div>
                          <div style={styles.goalName}>{goal.name}</div>
                          <div style={styles.goalMeta}>{goal.deadline}</div>
                          <div style={styles.miniTrack}>
                            <div style={{ ...styles.miniBar, width: `${pct}%` }}></div>
                          </div>
                          <div style={styles.goalAmounts}>
                            <span style={styles.goalCollected}>{goal.collected} XLM</span>
                            <span style={styles.goalTarget}>/ {goal.target} XLM</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* transaction history */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>My Transactions</div>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" style={styles.explorerLink}>
                  View on Explorer ↗
                </a>
              </div>
              <div style={{ ...styles.tableWrap, overflowX: isMobile ? 'auto' : 'hidden' }}>
                {myGoals.flatMap(g => g.contributors.filter(c => c.addr === walletAddr).map(c => ({ ...c, goalName: g.name }))).length === 0 ? (
                  <div style={styles.empty}>
                    <div style={styles.emptyIcon}>📋</div>
                    <div style={styles.emptyTitle}>No transactions yet</div>
                    <div style={styles.emptyDesc}>Your contributions will appear here</div>
                  </div>
                ) : (
                  <table style={{ ...styles.table, minWidth: isMobile ? '500px' : 'unset' }}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Goal</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Time</th>
                        <th style={styles.th}>Explorer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myGoals.flatMap(g =>
                        g.contributors
                        .filter(c => c.addr === walletAddr)
                         .map((c, i) => (
                            <tr key={g.id + '-' + i} style={styles.tr}>
                              <td style={styles.td}>{g.name}</td>
                              <td style={{ ...styles.td, fontWeight: 600, color: '#06d6a0' }}>{c.amount} XLM</td>
                              <td style={{ ...styles.td, color: '#4a5a7a' }}>{c.time}</td>
                              <td style={styles.td}>
                                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" style={styles.explorerLink}>
                                  View ↗
                                </a>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { paddingTop: '64px', position: 'relative', zIndex: 1 },
  inner: { maxWidth: '1100px', margin: '0 auto' },
  header: { marginBottom: '2rem' },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-.02em' },
  pageSub: { color: '#8a9cc4', fontSize: '.95rem', marginTop: '.5rem', fontWeight: 300 },
  statsRow: { display: 'grid', gap: '1rem', marginBottom: '2.5rem' },
  statCard: { background: '#111827', border: '1px solid #1e2d47', borderLeft: '3px solid', borderRadius: '16px' },
  statIcon: { fontSize: '24px', marginBottom: '.75rem' },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: '.2rem' },
  statLabel: { fontSize: '12px', color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '.05em' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tabBtn: { background: '#111827', border: '1px solid #1e2d47', color: '#8a9cc4', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .2s' },
  tabActive: { background: '#4f8ef7', borderColor: '#4f8ef7', color: '#fff' },
  section: { marginBottom: '2.5rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 700 },
  createBtn: { background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  explorerLink: { fontSize: '13px', color: '#4f8ef7', textDecoration: 'none' },
  goalsRow: { display: 'grid', gap: '1rem' },
  goalCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all .3s' },
  goalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' },
  goalEmoji: { fontSize: '24px' },
  goalStatus: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', letterSpacing: '.04em', textTransform: 'uppercase' },
  statusActive: { background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' },
  statusCompleted: { background: 'rgba(79,142,247,.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,.2)' },
  organizerBadge: { fontSize: '10px', background: 'rgba(245,158,11,.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.3)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600, textTransform: 'uppercase' },
  goalName: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '.25rem' },
  goalMeta: { fontSize: '12px', color: '#4a5a7a', marginBottom: '.75rem' },
  miniTrack: { height: '4px', background: '#0d1428', borderRadius: '100px', overflow: 'hidden', marginBottom: '.5rem' },
  miniBar: { height: '100%', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed)', borderRadius: '100px' },
  goalAmounts: { display: 'flex', alignItems: 'baseline', gap: '.25rem' },
  goalCollected: { fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", color: '#f0f4ff' },
  goalTarget: { fontSize: '13px', color: '#4a5a7a' },
  tableWrap: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '16px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '.75rem 1rem', textAlign: 'left', fontSize: '11px', color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #1e2d47', fontWeight: 600 },
  tr: { transition: '.15s' },
  td: { padding: '.75rem 1rem', borderBottom: '1px solid rgba(30,45,71,.5)', fontSize: '13px', color: '#f0f4ff' },
  txType: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' },
  txHash: { fontFamily: 'monospace', fontSize: '11px', color: '#4f8ef7' },
  empty: { textAlign: 'center', padding: '3rem 2rem', color: '#4a5a7a' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '.75rem', opacity: .4 },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#8a9cc4', marginBottom: '.4rem' },
  emptyDesc: { fontSize: '13px' },
}

export default Dashboard