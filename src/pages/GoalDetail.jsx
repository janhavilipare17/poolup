import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { getGoalsFromChain } from '../utils/contract'
const COLORS = ['#4f8ef7', '#7c3aed', '#06d6a0', '#f59e0b', '#ef4444', '#ec4899']

function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [goal, setGoal] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [collected, setCollected] = useState(0)
  const [contributors, setContributors] = useState([])
  const walletAddr = useWallet()
  const [goalLoading, setGoalLoading] = useState(true)

  useEffect(() => {
    const loadGoal = async () => {
      setGoalLoading(true)
      try {
        const chainGoals = await getGoalsFromChain()
        const found = chainGoals.find(g => String(g.id) === String(id))
        if (found) {
          setGoal(found)
          setCollected(found.collected)
          setContributors(found.contributors || [])
          setGoalLoading(false)
          return
        }
      } catch (err) {
        console.error(err)
      }
      setGoalLoading(false)
    }

    loadGoal()

    // poll every 10 seconds for real-time updates
    const interval = setInterval(async () => {
      try {
        const chainGoals = await getGoalsFromChain()
        const found = chainGoals.find(g => String(g.id) === String(id))
        if (found) {
          setCollected(found.collected)
          setContributors(found.contributors || [])
          setGoal(found)
        }
      } catch (err) {
        console.error(err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [id])

  if (goalLoading) {
    return (
      <div style={styles.notFound}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={styles.notFoundTitle}>Loading goal...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div style={styles.notFound}>
        <div style={styles.notFoundIcon}>🔍</div>
        <div style={styles.notFoundTitle}>Goal not found</div>
        <button style={styles.backBtn} onClick={() => navigate('/goals')}>Back to Goals</button>
      </div>
    )
  }
  const pct = Math.min(Math.round((collected / goal.target) * 100), 100)
  const remaining = Math.max(goal.target - collected, 0)

const handleContribute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount!')
      return
    }
    if (!walletAddr) {
      alert('Please connect your wallet first!')
      return
    }
    setLoading(true)
    try {
      const { contributeOnChain } = await import('../utils/contract')
      const result = await contributeOnChain(goal.id, parseFloat(amount), walletAddr)
      setAmount('')
      setLoading(false)
     alert('Contribution successful! Tx: ' + result.hash)
      // wait for blockchain confirmation then reload
      await new Promise(r => setTimeout(r, 3000))
      const chainGoals = await getGoalsFromChain()
      const found = chainGoals.find(g => String(g.id) === String(id))
      if (found) {
        setCollected(found.collected)
        setContributors(found.contributors || [])
      }
    } catch (err) {
      console.error(err)
      alert('Error contributing: ' + err.message)
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    if (!walletAddr) {
      alert('Please connect your wallet first!')
      return
    }
    if (!window.confirm('Are you sure you want to request a refund?')) return
    setLoading(true)
    try {
      const { refundFromChain } = await import('../utils/contract')
      await refundFromChain(goal.id, walletAddr)
      alert('Refund successful! Funds returned to contributors.')
      window.location.href = '/goals'
    } catch (err) {
      console.error(err)
      alert('Refund error: ' + err.message)
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/goal/${goal.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.inner}>

        <button style={styles.backBtn} onClick={() => navigate('/goals')}>
          ← Back to Goals
        </button>

        <div style={styles.mainCard}>
          <div style={styles.topBar}></div>

          <div style={styles.topSection}>
            <div style={styles.emojiBox}>{goal.emoji}</div>
            <div style={styles.goalInfo}>
              <div style={styles.goalName}>{goal.name}</div>
              <div style={styles.goalDesc}>{goal.desc}</div>
              <div style={styles.metaRow}>
                <div style={styles.metaChip}>Organiser: <span style={styles.metaVal}>{goal.organiser}</span></div>
                <div style={styles.metaChip}>Deadline: <span style={styles.metaVal}>{goal.deadline}</span></div>
                <span style={{ ...styles.statusBadge, ...(goal.status === 'completed' ? styles.statusCompleted : styles.statusActive) }}>
                  {goal.status}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.progressSection}>
            <div style={styles.bigNums}>
              <span style={styles.bigAmount}>{collected} XLM</span>
              <span style={styles.bigTarget}>of {goal.target} XLM</span>
            </div>
            <div style={styles.bigTrack}>
              <div style={{ ...styles.bigBar, width: `${pct}%` }}>
                {pct > 5 && <div style={styles.bigBarDot}></div>}
              </div>
            </div>
            <div style={styles.progressInfo}>
              <span style={styles.pctText}>{pct}% reached</span>
              <span style={styles.remainText}>{remaining} XLM remaining</span>
            </div>
          </div>

          {goal.status === 'active' && (
            <div style={styles.contributeCard}>
              <div style={styles.contributeTitle}>Lock your contribution</div>
              <div style={styles.contributeRow}>
                <input
                  style={styles.contributeInput}
                  type="number"
                  placeholder="Enter XLM amount..."
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <button
                  style={{ ...styles.contributeBtn, opacity: loading ? .7 : 1 }}
                  onClick={handleContribute}
                  disabled={loading}
                >
                  {loading ? 'Locking...' : 'Lock Funds 🔒'}
                </button>
              </div>
              <div style={styles.contributeHint}>
                Funds are locked in Soroban smart contract in XLM — cannot be withdrawn once sent
              </div>
            </div>
          )}

{goal.status === 'active' && goal.collected < goal.target && (() => {
  const dl = goal.deadline
  const dlDate = typeof dl === 'number' ? new Date(dl * 1000) : new Date(dl)
  dlDate.setHours(23, 59, 59, 0)
  const deadlinePassed = dlDate < new Date()
  return (
    <div style={{ ...styles.refundCard, opacity: deadlinePassed ? 1 : 0.5 }}>
      <div style={styles.refundTitle}>
        {deadlinePassed ? 'Deadline passed — goal not reached' : 'Refund available after deadline'}
      </div>
      <div style={styles.refundDesc}>
        {deadlinePassed
          ? 'The goal deadline has passed and the target was not reached. Contributors can get their money back.'
          : `Refund will be available on ${dlDate.toLocaleDateString()} if the goal is not reached.`}
      </div>
      <button
        style={{
          ...styles.refundBtn,
          opacity: deadlinePassed ? 1 : 0.4,
          cursor: deadlinePassed ? 'pointer' : 'not-allowed',
        }}
        onClick={deadlinePassed ? handleRefund : undefined}
        disabled={loading || !deadlinePassed}
      >
        {loading ? 'Processing...' : deadlinePassed ? 'Request Refund ↩️' : '🔒 Refund locked until deadline'}
      </button>
    </div>
  )
})()}

          {goal.status === 'refunded' && (
            <div style={styles.refundCard}>
              <div style={styles.refundTitle}>Goal refunded</div>
              <div style={styles.refundDesc}>
                This goal was not reached. All contributions have been returned to contributors.
              </div>
            </div>
          )}

          <div style={styles.shareBanner}>
            <div style={styles.shareText}>
              <strong style={styles.shareTitle}>Share this goal</strong>
              <span style={styles.shareSub}>Send this link to your group members</span>
            </div>
            <div style={styles.shareLink}>{window.location.origin}/goal/{goal.id}</div>
            <button style={styles.copyBtn} onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div style={styles.contribCard}>
          <div style={styles.contribHeader}>
            <div style={styles.contribTitle}>Contributors</div>
            <div style={styles.contribCount}>{contributors.length} people</div>
          </div>
          {contributors.length === 0 ? (
            <div style={styles.noContrib}>No contributions yet — be the first! 🎯</div>
          ) : (
            contributors.map((c, i) => (
              <div key={i} style={styles.contribRow}>
                <div style={{ ...styles.contribAvatar, background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                  {c.addr.slice(0, 2)}
                </div>
                <div style={styles.contribInfo}>
                  <div style={styles.contribAddr}>{c.addr}</div>
                  <div style={styles.contribTime}>{c.time}</div>
                </div>
                <div style={styles.contribAmount}>{c.amount} XLM</div>
                <a style={styles.explorerLink} href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">
                  View ↗
                </a>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  wrapper: { paddingTop: '64px', position: 'relative', zIndex: 1 },
  inner: { maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem 4rem' },
  notFound: { paddingTop: '64px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  notFoundIcon: { fontSize: '4rem' },
  notFoundTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700 },
  backBtn: { background: 'transparent', border: '1px solid #1e2d47', color: '#8a9cc4', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: '1.5rem', display: 'inline-block' },
  mainCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '28px', padding: '2.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed, #06d6a0)' },
  topSection: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' },
  emojiBox: { width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(79,142,247,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 },
  goalInfo: { flex: 1 },
  goalName: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-.02em', marginBottom: '.4rem' },
  goalDesc: { color: '#8a9cc4', fontSize: '.95rem', fontWeight: 300, lineHeight: 1.6, marginBottom: '.75rem' },
  metaRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  metaChip: { background: '#080d1c', border: '1px solid #1e2d47', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', color: '#8a9cc4' },
  metaVal: { color: '#f0f4ff', fontWeight: 500 },
  statusBadge: { fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', letterSpacing: '.04em', textTransform: 'uppercase' },
  statusActive: { background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' },
  statusCompleted: { background: 'rgba(79,142,247,.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,.2)' },
  progressSection: { marginBottom: '2rem' },
  bigNums: { display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.75rem' },
  bigAmount: { fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #4f8ef7, #06d6a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  bigTarget: { fontSize: '1.2rem', color: '#4a5a7a' },
  bigTrack: { height: '12px', background: '#0d1428', borderRadius: '100px', overflow: 'hidden', position: 'relative' },
  bigBar: { height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed, #06d6a0)', transition: 'width 1s cubic-bezier(.4,0,.2,1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  bigBarDot: { width: '16px', height: '16px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 12px rgba(79,142,247,.6)', marginRight: '-8px', flexShrink: 0 },
  progressInfo: { display: 'flex', justifyContent: 'space-between', marginTop: '.6rem', fontSize: '12px' },
  pctText: { color: '#8a9cc4' },
  remainText: { color: '#4a5a7a' },
  contributeCard: { background: '#080d1c', border: '1px solid #1e2d47', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' },
  contributeTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' },
  contributeRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  contributeInput: { flex: 1, minWidth: '200px', background: '#111827', border: '1px solid #253550', color: '#f0f4ff', padding: '12px 16px', borderRadius: '12px', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", outline: 'none', fontWeight: 500 },
  contributeBtn: { background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap', transition: 'all .2s' },
  contributeHint: { fontSize: '11px', color: '#4a5a7a', marginTop: '.6rem' },
  refundCard: { background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  refundTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '.5rem' },
  refundDesc: { fontSize: '13px', color: '#8a9cc4', marginBottom: '1rem', lineHeight: 1.6 },
  refundBtn: { background: 'rgba(239,68,68,.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  shareBanner: { background: 'linear-gradient(135deg, rgba(79,142,247,.08), rgba(124,58,237,.08))', border: '1px solid rgba(79,142,247,.15)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  shareText: { flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '2px' },
  shareTitle: { fontSize: '.95rem', fontFamily: "'Syne', sans-serif", fontWeight: 700 },
  shareSub: { fontSize: '12px', color: '#8a9cc4' },
  shareLink: { fontFamily: 'monospace', fontSize: '12px', color: '#4f8ef7', background: '#080d1c', border: '1px solid #1e2d47', padding: '8px 14px', borderRadius: '8px', flex: 1, minWidth: '150px', wordBreak: 'break-all' },
  copyBtn: { background: '#4f8ef7', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: '.2s' },
  contribCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '20px', padding: '1.5rem' },
  contribHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  contribTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700 },
  contribCount: { fontSize: '12px', color: '#4a5a7a', background: '#080d1c', padding: '4px 10px', borderRadius: '8px', border: '1px solid #1e2d47' },
  noContrib: { textAlign: 'center', padding: '2rem', color: '#4a5a7a', fontSize: '14px' },
  contribRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '.75rem 0', borderBottom: '1px solid #1e2d47' },
  contribAvatar: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, fontFamily: 'monospace' },
  contribInfo: { flex: 1 },
  contribAddr: { fontSize: '13px', fontWeight: 500, fontFamily: 'monospace' },
  contribTime: { fontSize: '11px', color: '#4a5a7a', marginTop: '1px' },
  contribAmount: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#06d6a0' },
  explorerLink: { fontSize: '11px', color: '#4f8ef7', textDecoration: 'none', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(79,142,247,.2)', background: 'rgba(79,142,247,.05)' },
}

export default GoalDetail