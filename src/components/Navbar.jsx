import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { setGlobalWallet } from '../hooks/useWallet'
import { useScreenSize } from '../hooks/useScreenSize'
import { useWallet, setGlobalWallet } from '../hooks/useWallet'

function Navbar() {
  const location = useLocation()
  const { isMobile } = useScreenSize()
 const wallet = useWallet()
  const [showModal, setShowModal] = useState(false)

  const connectWallet = async (walletName) => {
    try {
      if (walletName === 'Freighter') {
        const freighter = await import('@stellar/freighter-api')
        const { isConnected } = await freighter.isConnected()
        if (!isConnected) {
          alert('Please unlock your Freighter wallet and try again!')
          return
        }
        const { address } = await freighter.requestAccess()
        
        setGlobalWallet(address)
        localStorage.setItem('poolup_wallet', address)
        setShowModal(false)
      } else if (walletName === 'xBull') {
        await window.xBullSDK.connect({ canRequestPublicKey: true, canRequestSign: true })
        const address = await window.xBullSDK.getPublicKey()
        
        setGlobalWallet(address)
        localStorage.setItem('poolup_wallet', address)
        setShowModal(false)
      } else if (walletName === 'Lobstr') {
        alert('Lobstr is a mobile wallet. Please use Freighter or xBull.')
        return
      }
    } catch (err) {
      console.error('Wallet error:', err)
      alert('Could not connect. Error: ' + err.message)
    }
  }

  const disconnectWallet = () => {
   
    setGlobalWallet(null)
    localStorage.removeItem('poolup_wallet')
  }

  const shortAddr = (addr) => addr ? addr.slice(0, 4) + '...' + addr.slice(-4) : ''

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={{ ...styles.logo, fontSize: isMobile ? '16px' : '20px' }}>PoolUp</Link>

        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, padding: isMobile ? '5px 8px' : '6px 14px', fontSize: isMobile ? '12px' : '14px', ...(location.pathname === '/' ? styles.activeLink : {}) }}>Home</Link>
          <Link to="/goals" style={{ ...styles.link, padding: isMobile ? '5px 8px' : '6px 14px', fontSize: isMobile ? '12px' : '14px', ...(location.pathname === '/goals' ? styles.activeLink : {}) }}>Explore</Link>
          <Link to="/create" style={{ ...styles.link, padding: isMobile ? '5px 8px' : '6px 14px', fontSize: isMobile ? '12px' : '14px', ...(location.pathname === '/create' ? styles.activeLink : {}) }}>Create</Link>
          <Link to="/dashboard" style={{ ...styles.link, padding: isMobile ? '5px 8px' : '6px 14px', fontSize: isMobile ? '12px' : '14px', ...(location.pathname === '/dashboard' ? styles.activeLink : {}) }}>Dashboard</Link>

          {wallet ? (
  <div style={{ ...styles.walletBadge, fontSize: isMobile ? '11px' : '12px', padding: isMobile ? '5px 8px' : '6px 14px' }} onClick={disconnectWallet} title="Click to disconnect">
    <div style={styles.walletDot}></div>
    {shortAddr(wallet)}
  </div>
) : location.pathname !== '/' && (
  <button style={{ ...styles.connectBtn, fontSize: isMobile ? '11px' : '13px', padding: isMobile ? '6px 10px' : '8px 20px' }} onClick={() => setShowModal(true)}>
    {isMobile ? 'Connect' : 'Connect Wallet'}
  </button>
)}
        </div>
      </nav>

      {/* wallet modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            <div style={styles.modalIcon}>🔗</div>
            <div style={styles.modalTitle}>Connect Wallet</div>
            <div style={styles.modalSub}>
              Choose your Stellar wallet to connect to PoolUp. Your wallet is your identity — no signup needed.
            </div>
            {[
              { name: 'Freighter', icon: '⭐', desc: 'Official Stellar wallet browser extension' },
              { name: 'xBull', icon: '🐂', desc: 'Multi-platform Stellar wallet' },
              { name: 'Lobstr', icon: '🦞', desc: 'Mobile-friendly Stellar wallet' },
            ].map(w => (
              <div key={w.name} style={styles.walletOption} onClick={() => connectWallet(w.name)}>
                <div style={styles.walletLogo}>{w.icon}</div>
                <div>
                  <div style={styles.walletName}>{w.name}</div>
                  <div style={styles.walletDesc}>{w.desc}</div>
                </div>
                <div style={styles.walletArrow}>→</div>
              </div>
            ))}
            <div style={styles.modalFooter}>
              🔒 Your wallet is never stored on our servers
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: '64px', padding: '0 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(4,6,15,0.95)', backdropFilter: 'blur(20px)',
  },
  logo: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', textDecoration: 'none', flexShrink: 0,
  },
  links: { display: 'flex', alignItems: 'center', gap: '2px' },
  link: {
    color: '#8a9cc4', borderRadius: '8px',
    textDecoration: 'none', transition: 'all .2s',
    fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
  },
  activeLink: { color: '#f0f4ff', background: 'rgba(255,255,255,0.05)' },
  connectBtn: {
    background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
    color: '#fff', border: 'none',
    borderRadius: '10px', fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  },
  walletBadge: {
    background: '#1a2235', border: '1px solid #253550',
    borderRadius: '10px',
    color: '#06d6a0', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: 'monospace', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  walletDot: { width: '6px', height: '6px', background: '#06d6a0', borderRadius: '50%', flexShrink: 0 },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 999,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    background: '#111827', border: '1px solid #253550',
    borderRadius: '24px', padding: '2rem',
    width: '100%', maxWidth: '420px', position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: '#1a2235', border: '1px solid #1e2d47',
    color: '#8a9cc4', width: '28px', height: '28px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalIcon: { fontSize: '2.5rem', marginBottom: '.75rem', textAlign: 'center' },
  modalTitle: {
    fontFamily: "'Syne', sans-serif", fontSize: '1.4rem',
    fontWeight: 800, marginBottom: '.5rem', textAlign: 'center',
  },
  modalSub: {
    fontSize: '13px', color: '#8a9cc4', marginBottom: '1.5rem',
    fontWeight: 300, lineHeight: 1.6, textAlign: 'center',
  },
  walletOption: {
    background: '#080d1c', border: '1px solid #1e2d47',
    borderRadius: '14px', padding: '1rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '12px',
    cursor: 'pointer', transition: 'all .2s', marginBottom: '.75rem',
  },
  walletLogo: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: '#1a2235', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '20px',
    flexShrink: 0,
  },
  walletName: { fontWeight: 500, fontSize: '14px', color: '#f0f4ff', marginBottom: '2px' },
  walletDesc: { fontSize: '12px', color: '#4a5a7a' },
  walletArrow: { marginLeft: 'auto', color: '#4a5a7a', fontSize: '16px' },
  modalFooter: {
    textAlign: 'center', fontSize: '12px', color: '#4a5a7a',
    marginTop: '1rem', paddingTop: '1rem',
    borderTop: '1px solid #1e2d47',
  },
}

export default Navbar