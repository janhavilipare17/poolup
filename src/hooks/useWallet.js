import { useState, useEffect } from 'react'

let walletAddress = localStorage.getItem('poolup_wallet') || null
const listeners = []

export const setGlobalWallet = (addr) => {
  walletAddress = addr
  localStorage.setItem('poolup_wallet', addr)
  listeners.forEach(fn => fn(addr))
}

export const useWallet = () => {
  const [wallet, setWallet] = useState(walletAddress)

  useEffect(() => {
    listeners.push(setWallet)
    return () => {
      const i = listeners.indexOf(setWallet)
      if (i > -1) listeners.splice(i, 1)
    }
  }, [])

  return wallet
}