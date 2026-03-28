import {
  TransactionBuilder,
  Networks,
  Keypair,
} from '@stellar/stellar-sdk'
import { rpc } from '@stellar/stellar-sdk'

const NETWORK_PASSPHRASE = Networks.TESTNET
const RPC_URL = 'https://soroban-testnet.stellar.org'
const server = new rpc.Server(RPC_URL, { allowHttp: false })

const SPONSOR_SECRET = import.meta.env.VITE_SPONSOR_SECRET_KEY

export const isSponsorshipAvailable = () => {
  return !!SPONSOR_SECRET && SPONSOR_SECRET.startsWith('S')
}

export const getSponsorPublicKey = () => {
  if (!isSponsorshipAvailable()) return null
  try {
    return Keypair.fromSecret(SPONSOR_SECRET).publicKey()
  } catch {
    return null
  }
}

export const submitWithFeeBump = async (innerSignedXDR) => {
  if (!isSponsorshipAvailable()) {
    throw new Error('Fee sponsorship not configured. Add VITE_SPONSOR_SECRET_KEY to .env')
  }

  try {
    const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET)
    const innerTx = TransactionBuilder.fromXDR(innerSignedXDR, NETWORK_PASSPHRASE)

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
  sponsorKeypair,
  '100000',
  innerTx,
  NETWORK_PASSPHRASE
)

    feeBumpTx.sign(sponsorKeypair)

    console.log('✅ Fee bump signed by sponsor:', sponsorKeypair.publicKey())

    const result = await server.sendTransaction(feeBumpTx)
    console.log('Fee bump submitted:', result)

    if (result.status === 'ERROR') {
      throw new Error('Fee bump failed: ' + JSON.stringify(result.errorResult))
    }

    await new Promise(r => setTimeout(r, 8000))

    try {
      const status = await server.getTransaction(result.hash)
      console.log('Fee bump final status:', status.status)
      if (status.status === 'FAILED') {
        throw new Error('Fee bump transaction failed on blockchain')
      }
    } catch (e) {
      console.log('Transaction pending or confirmed:', e.message)
    }

    return { success: true, hash: result.hash }
  } catch (err) {
    console.error('Fee bump error:', err)
    throw err
  }
}

export const getSponsorBalance = async () => {
  if (!isSponsorshipAvailable()) return null
  try {
    const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET)
    const pubKey = sponsorKeypair.publicKey()
    const response = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${pubKey}`
    )
    const data = await response.json()
    const xlmBalance = data.balances?.find(b => b.asset_type === 'native')
    return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0'
  } catch {
    return null
  }
}