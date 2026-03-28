import { useState, useEffect } from 'react'
import { isSponsorshipAvailable, getSponsorBalance } from '../utils/feeBump'

export default function GaslessBadge() {
  const [balance, setBalance] = useState(null)
  const sponsored = isSponsorshipAvailable()

  useEffect(() => {
    if (sponsored) {
      getSponsorBalance().then(setBalance)
    }
  }, [sponsored])

  if (!sponsored) return null

  return (
    <div style={styles.badge}>
      <span style={styles.dot} />
      <span style={styles.text}>
        ⚡ Gasless Transaction — fees sponsored by PoolUp
      </span>
      {balance && (
        <span style={styles.balance}>
          Sponsor balance: {balance} XLM
        </span>
      )}
    </div>
  )
}

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(6,214,160,0.08)',
    border: '1px solid rgba(6,214,160,0.25)',
    borderRadius: '10px',
    padding: '8px 14px',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  dot: {
    width: '7px',
    height: '7px',
    background: '#06d6a0',
    borderRadius: '50%',
    flexShrink: 0,
  },
  text: {
    fontSize: '13px',
    color: '#06d6a0',
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
  },
  balance: {
    fontSize: '11px',
    color: '#4a5a7a',
    fontFamily: 'monospace',
  },
}