import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getGoals } from '../utils/storage'
import { useScreenSize } from '../hooks/useScreenSize'

function Home() {
  const navigate = useNavigate()
  const { isMobile } = useScreenSize()
  const [stats, setStats] = useState({ goals: 0, pooled: 0, users: 0 })

  useEffect(() => {
    const goals = getGoals()
    const totalPooled = goals.reduce((sum, g) => sum + g.collected, 0)
    const totalUsers = goals.reduce((sum, g) => sum + g.contributors.length, 0)
    setStats({ goals: goals.length, pooled: totalPooled, users: totalUsers })
  }, [])

  return (
    <div style={styles.wrapper}>
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>
      <div style={styles.orb3}></div>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          <span style={styles.badgeDot}></span>
          Built on Stellar · Soroban Smart Contracts
        </div>

        <h1 style={{ ...styles.h1, fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 8vw, 6rem)' }}>
          Pool money.<br />
          <span style={styles.gradient}>Unlock together.</span>
        </h1>

        <p style={{ ...styles.sub, fontSize: isMobile ? '1rem' : '1.1rem', padding: isMobile ? '0 1rem' : '0' }}>
          Create a shared savings goal, everyone locks their share on-chain.
          Funds release automatically when the target is hit — no trust needed.
        </p>

        <div style={{ ...styles.actions, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto', padding: isMobile ? '0 1rem' : '0' }}>
          <button style={{ ...styles.btnPrimary, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/create')}>
            Create a Goal
          </button>
          <button style={{ ...styles.btnSecondary, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/goals')}>
            Explore Goals
          </button>
        </div>

        <div style={{ ...styles.statsRow, gap: isMobile ? '1.5rem' : '3rem' }}>
          <div style={styles.statItem}>
            <div style={styles.statNum}>{stats.goals}</div>
            <div style={styles.statLabel}>Goals Created</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNum}>{stats.pooled} XLM</div>
            <div style={styles.statLabel}>Total Pooled</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNum}>{stats.users}</div>
            <div style={styles.statLabel}>Contributors</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNum}>~0</div>
            <div style={styles.statLabel}>Gas Fees</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...styles.section, padding: isMobile ? '3rem 1rem' : '5rem 2rem' }}>
        <div style={styles.sectionLabel}>How it works</div>
        <h2 style={{ ...styles.sectionTitle, fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 4vw, 3rem)' }}>Simple as 1, 2, 3</h2>
        <p style={styles.sectionSub}>
          No banks, no trust, no "I'll pay you later." The smart contract handles everything.
        </p>
        <div style={{ ...styles.stepsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {steps.map((step, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>0{i + 1}</div>
              <div style={{ ...styles.stepIcon, background: step.bg }}>{step.icon}</div>
              <div style={styles.stepTitle}>{step.title}</div>
              <div style={styles.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY STELLAR */}
      <section style={{ ...styles.section, paddingTop: 0, padding: isMobile ? '0 1rem 3rem' : '0 2rem 5rem' }}>
        <div style={styles.sectionLabel}>Why Stellar</div>
        <h2 style={{ ...styles.sectionTitle, fontSize: isMobile ? '1.8rem' : 'clamp(2rem, 4vw, 3rem)' }}>Built for real people</h2>
        <div style={{ ...styles.whyGrid, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {whys.map((w, i) => (
            <div key={i} style={styles.whyCard}>
              <div style={styles.whyIcon}>{w.icon}</div>
              <div style={styles.whyTitle}>{w.title}</div>
              <div style={styles.whyDesc}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...styles.ctaSection, padding: isMobile ? '2rem 1rem 4rem' : '3rem 2rem 6rem' }}>
        <div style={{ ...styles.ctaCard, padding: isMobile ? '2rem 1.5rem' : '3rem' }}>
          <h2 style={{ ...styles.ctaTitle, fontSize: isMobile ? '1.5rem' : '2rem' }}>Ready to pool up?</h2>
          <p style={styles.ctaSub}>Create your first goal in 30 seconds. Share with your group. Done.</p>
          <button style={{ ...styles.btnPrimary, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/create')}>
            Create your first goal →
          </button>
        </div>
      </section>
    </div>
  )
}

const steps = [
  { icon: '🎯', bg: 'rgba(79,142,247,.1)', title: 'Create your goal', desc: 'Set a goal name, target amount, and deadline. Share the link with your group.' },
  { icon: '🔒', bg: 'rgba(124,58,237,.1)', title: 'Everyone locks in', desc: 'Each member connects their Stellar wallet and locks their share. Nobody can pull out.' },
  { icon: '🚀', bg: 'rgba(6,214,160,.1)', title: 'Goal hit — funds fly', desc: 'Target reached? Smart contract auto-releases funds to the organiser in 5 seconds.' },
  { icon: '↩️', bg: 'rgba(245,158,11,.1)', title: 'Deadline passed? Auto refund', desc: 'Goal not reached in time? Everyone gets their exact contribution back. Zero loss.' },
]

const whys = [
  { icon: '⚡', title: '3-5 second settlement', desc: 'Payments confirm in seconds not days. No waiting around.' },
  { icon: '💸', title: 'Near zero fees', desc: 'Stellar fees are $0.00001. Splitting a $5 bill actually makes sense.' },
  { icon: '🔒', title: 'Smart contract security', desc: 'Funds locked in Soroban contract. Nobody can steal or misuse.' },
  { icon: '🌍', title: 'Works globally', desc: 'Friends across countries can pool together with no forex headache.' },
]

const styles = {
  wrapper: { position: 'relative', overflowX: 'hidden' },
  orb1: { position: 'fixed', width: '600px', height: '600px', background: 'rgba(79,142,247,.07)', borderRadius: '50%', filter: 'blur(120px)', top: '-200px', right: '-100px', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', width: '500px', height: '500px', background: 'rgba(124,58,237,.06)', borderRadius: '50%', filter: 'blur(120px)', bottom: '-150px', left: '-100px', pointerEvents: 'none', zIndex: 0 },
  orb3: { position: 'fixed', width: '300px', height: '300px', background: 'rgba(6,214,160,.05)', borderRadius: '50%', filter: 'blur(120px)', top: '40%', left: '40%', pointerEvents: 'none', zIndex: 0 },
  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 1.5rem 3rem', position: 'relative', zIndex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79,142,247,.1)', border: '1px solid rgba(79,142,247,.2)', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', color: '#4f8ef7', marginBottom: '2rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' },
  badgeDot: { width: '6px', height: '6px', background: '#4f8ef7', borderRadius: '50%', display: 'inline-block' },
  h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.03em', marginBottom: '1.5rem' },
  gradient: { background: 'linear-gradient(135deg, #4f8ef7, #7c3aed, #06d6a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  sub: { color: '#8a9cc4', maxWidth: '520px', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.7 },
  actions: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' },
  btnPrimary: { background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSecondary: { background: 'transparent', color: '#f0f4ff', border: '1px solid #253550', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  statsRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' },
  statItem: { textAlign: 'center' },
  statNum: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f0f4ff, #8a9cc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  statLabel: { fontSize: '12px', color: '#4a5a7a', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '.05em' },
  section: { maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 },
  sectionLabel: { fontSize: '11px', color: '#4f8ef7', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '1rem' },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: '1rem' },
  sectionSub: { color: '#8a9cc4', fontSize: '1rem', fontWeight: 300, maxWidth: '500px', lineHeight: 1.7, marginBottom: '3rem' },
  stepsGrid: { display: 'grid', gap: '1.5rem' },
  stepCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '20px', padding: '1.75rem', transition: 'all .3s' },
  stepNum: { fontFamily: "'Syne', sans-serif", fontSize: '3rem', fontWeight: 800, color: '#1e2d47', lineHeight: 1, marginBottom: '1rem' },
  stepIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '1rem' },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '.5rem' },
  stepDesc: { fontSize: '13px', color: '#8a9cc4', lineHeight: 1.6, fontWeight: 300 },
  whyGrid: { display: 'grid', gap: '1.25rem', marginTop: '2rem' },
  whyCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '16px', padding: '1.5rem' },
  whyIcon: { fontSize: '28px', marginBottom: '.75rem' },
  whyTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem' },
  whyDesc: { fontSize: '13px', color: '#8a9cc4', lineHeight: 1.6, fontWeight: 300 },
  ctaSection: { position: 'relative', zIndex: 1 },
  ctaCard: { maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(79,142,247,.08), rgba(124,58,237,.08))', border: '1px solid rgba(79,142,247,.15)', borderRadius: '28px', textAlign: 'center' },
  ctaTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, marginBottom: '.75rem', letterSpacing: '-.02em' },
  ctaSub: { color: '#8a9cc4', fontSize: '1rem', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.6 },
}

export default Home