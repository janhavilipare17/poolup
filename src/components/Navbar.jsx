import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { setGlobalWallet } from '../hooks/useWallet'

function Navbar() {
  const location = useLocation()
  const [wallet, setWallet] = useState(localStorage.getItem('poolup_wallet') || null)
  const [showModal, setShowModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
        setWallet(address)
        setGlobalWallet(address)
        localStorage.setItem('poolup_wallet', address)
        setShowModal(false)
      } else if (walletName === 'xBull') {
        await window.xBullSDK.connect({ canRequestPublicKey: true, canRequestSign: true })
        const address = await window.xBullSDK.getPublicKey()
        setWallet(address)
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
    setWallet(null)
    setGlobalWallet(null)
    localStorage.removeItem('poolup_wallet')
  }

  const shortAddr = (addr) => addr ? addr.slice(0, 4) + '...' + addr.slice(-4) : ''

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>PoolUp</Link>

        {/* desktop links */}
        <div style={styles.desktopLinks}>
          <Link to="/" style={{ ...styles.link, ...(location.pathname === '/' ? styles.activeLink : {}) }}>Home</Link>
          <Link to="/goals" style={{ ...styles.link, ...(location.pathname === '/goals' ? styles.activeLink : {}) }}>Explore</Link>
          <Link to="/create" style={{ ...styles.link, ...(location.pathname === '/create' ? styles.activeLink : {}) }}>Create</Link>
          <Link to="/dashboard" style={{ ...styles.link, ...(location.pathname === '/dashboard' ? styles.activeLink : {}) }}>Dashboard</Link>
          {wallet ? (
            <div style={styles.walletBadge} onClick={disconnectWallet} title="Click to disconnect">
              <div style={styles.walletDot}></div>
              {shortAddr(wallet)}
            </div>
          ) : (
            <button style={styles.connectBtn} onClick={() => setShowModal(true)}>
              Connect Wallet
            </button>
          )}
        </div>

        {/* mobile hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {[
            { to: '/', label: 'Home' },
            { to: '/goals', label: 'Explore' },
            { to: '/create', label: 'Create' },
            { to: '/dashboard', label: 'Dashboard' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{ ...styles.mobileLink, ...(location.pathname === item.to ? styles.mobileLinkActive : {}) }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {wallet ? (
            <div style={styles.mobileWallet} onClick={() => { disconnectWallet(); setMenuOpen(false) }}>
              <div style={styles.walletDot}></div>
              {shortAddr(wallet)}
              <span style={{ fontSize: '11px', color: '#4a5a7a', marginLeft: 'auto' }}>tap to disconnect</span>
            </div>
          ) : (
            <button style={styles.mobileConnectBtn} onClick={() => { setShowModal(true); setMenuOpen(false) }}>
              Connect Wallet
            </button>
          )}
        </div>
      )}

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
    height: '64px', padding: '0 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(4,6,15,0.95)', backdropFilter: 'blur(20px)',
  },
  logo: {
    fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800,
    background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', textDecoration: 'none',
  },
  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: '8px',
    '@media (max-width: 768px)': { display: 'none' },
  },
  hamburger: {
    display: 'none',
    background: 'transparent', border: '1px solid #1e2d47',
    color: '#8a9cc4', width: '36px', height: '36px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '16px',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    '@media (max-width: 768px)': { display: 'flex' },
  },
  link: {
    color: '#8a9cc4', fontSize: '14px', padding: '6px 14px',
    borderRadius: '8px', textDecoration: 'none', transition: 'all .2s',
    fontFamily: "'DM Sans', sans-serif",
  },
  activeLink: { color: '#f0f4ff', background: 'rgba(255,255,255,0.05)' },
  connectBtn: {
    background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
    color: '#fff', border: 'none', padding: '8px 20px',
    borderRadius: '10px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  walletBadge: {
    background: '#1a2235', border: '1px solid #253550',
    padding: '6px 14px', borderRadius: '10px', fontSize: '12px',
    color: '#06d6a0', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: 'monospace', cursor: 'pointer',
  },
  walletDot: { width: '7px', height: '7px', background: '#06d6a0', borderRadius: '50%' },
  mobileMenu: {
    position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
    background: 'rgba(4,6,15,0.98)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #1e2d47',
    padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  mobileLink: {
    color: '#8a9cc4', fontSize: '15px', padding: '12px 16px',
    borderRadius: '10px', textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    border: '1px solid transparent',
  },
  mobileLinkActive: {
    color: '#f0f4ff', background: 'rgba(255,255,255,0.05)',
    border: '1px solid #1e2d47',
  },
  mobileWallet: {
    background: '#1a2235', border: '1px solid #253550',
    padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
    color: '#06d6a0', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: 'monospace', cursor: 'pointer', marginTop: '4px',
  },
  mobileConnectBtn: {
    background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
    color: '#fff', border: 'none', padding: '12px 20px',
    borderRadius: '10px', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    marginTop: '4px', width: '100%',
  },
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