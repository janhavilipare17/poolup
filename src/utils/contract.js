import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
} from '@stellar/stellar-sdk'
import { submitWithFeeBump, isSponsorshipAvailable } from './feeBump'
const CONTRACT_ID = 'CAYDVDZKUHO3KXWRPGOM4DOATC2TJD2LISBA5B32GOL5ZSS6JZGX6WOQ'
const NETWORK_PASSPHRASE = Networks.TESTNET
const RPC_URL = 'https://soroban-testnet.stellar.org'

const server = new rpc.Server(RPC_URL, { allowHttp: false })

const getAccount = async (publicKey) => {
  return await server.getAccount(publicKey)
}

const DUMMY_KEY = 'GBLUMAX4IIPS54AIGD5WXRRAXISG4HLV3BE3YR3SQAD3GZSXRTVJY5GI'

export const getGoalsFromChain = async () => {
  try {
    const contract = new Contract(CONTRACT_ID)

    const countTx = new TransactionBuilder(
      await getAccount(DUMMY_KEY),
      { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call('get_goal_count'))
      .setTimeout(30)
      .build()

    const countResult = await server.simulateTransaction(countTx)
    const count = scValToNative(countResult.result.retval)
    const goals = []

    for (let i = 1; i <= Number(count); i++) {
      const goalTx = new TransactionBuilder(
        await getAccount(DUMMY_KEY),
        { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
      )
        .addOperation(
          contract.call(
            'get_goal',
            nativeToScVal(BigInt(i), { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build()

      const goalResult = await server.simulateTransaction(goalTx)
      const goal = scValToNative(goalResult.result.retval)

      // fetch contributors for this goal
      let contributors = []
      try {
        const contribTx = new TransactionBuilder(
          await getAccount(DUMMY_KEY),
          { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
        )
          .addOperation(
            contract.call(
              'get_contributors',
              nativeToScVal(BigInt(i), { type: 'u64' })
            )
          )
          .setTimeout(30)
          .build()

        const contribResult = await server.simulateTransaction(contribTx)
        const contribData = scValToNative(contribResult.result.retval)
        contributors = contribData.map(c => ({
          addr: c.contributor,
          amount: Number(c.amount) / 10000000,
          time: new Date(Number(c.timestamp) * 1000).toLocaleString(),
        }))
      } catch (e) {
        console.error('Error fetching contributors:', e)
      }

      goals.push({
        id: Number(goal.id),
        name: goal.name,
        desc: goal.description,
        target: Number(goal.target) / 10000000,
        collected: Number(goal.collected) / 10000000,
        organiser: goal.organiser,
        deadline: new Date(Number(goal.deadline) * 1000).toLocaleDateString(),
        status: goal.status === 0 ? 'active' : goal.status === 1 ? 'completed' : 'refunded',
        emoji: '🎯',
        contributors,
      })
    }

    return goals
  } catch (err) {
    console.error('Error fetching goals:', err)
    return []
  }
}

const buildSignAndSubmit = async (account, operation, walletAddress) => {
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build()

  const simResult = await server.simulateTransaction(tx)
  console.log('Sim result:', simResult)

  if (simResult.error) {
    throw new Error('Simulation failed: ' + simResult.error)
  }

  const assembled = rpc.assembleTransaction(tx, simResult)
  const finalTx = assembled.build()

  const freighter = await import('@stellar/freighter-api')
  const signResult = await freighter.signTransaction(
    finalTx.toXDR(),
    { networkPassphrase: NETWORK_PASSPHRASE }
  )

  let signedXDR = null
  if (typeof signResult === 'string') {
    signedXDR = signResult
  } else if (signResult && signResult.signedTxXdr) {
    signedXDR = signResult.signedTxXdr
  } else if (signResult && signResult.signedTransaction) {
    signedXDR = signResult.signedTransaction
  } else if (signResult && signResult.xdr) {
    signedXDR = signResult.xdr
  }

  if (!signedXDR) throw new Error('Could not get signed transaction')

  // ── FEE SPONSORSHIP ──────────────────────────────────────
  // If sponsor is configured, use fee bump (user pays 0 fees)
  // Otherwise fall back to normal submission
  // ─────────────────────────────────────────────────────────
  if (isSponsorshipAvailable()) {
    console.log('✅ Using fee sponsorship — user pays 0 fees!')
    return await submitWithFeeBump(signedXDR)
  }

  // Fallback: normal submission
  console.log('⚠️ No sponsor configured, submitting normally')
  const txResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE)
  )

  if (txResult.status === 'ERROR') {
    throw new Error('Transaction failed: ' + JSON.stringify(txResult.errorResult))
  }

  await new Promise(r => setTimeout(r, 4000))

  try {
    const status = await server.getTransaction(txResult.hash)
    console.log('Final status:', status.status)
    if (status.status === 'FAILED') {
      throw new Error('Transaction failed on blockchain')
    }
  } catch (e) {
    console.log('Transaction pending or confirmed:', e.message)
  }

  return { success: true, hash: txResult.hash }
}
export const createGoalOnChain = async (goalData, walletAddress) => {
  try {
    const account = await getAccount(walletAddress)
    const contract = new Contract(CONTRACT_ID)

    const operation = contract.call(
      'create_goal',
      nativeToScVal(goalData.name, { type: 'string' }),
      nativeToScVal(goalData.description, { type: 'string' }),
      nativeToScVal(BigInt(Math.round(goalData.target * 10000000)), { type: 'i128' }),
      nativeToScVal(BigInt(goalData.deadline), { type: 'u64' }),
      nativeToScVal(walletAddress, { type: 'address' }),
    )

    return await buildSignAndSubmit(account, operation, walletAddress)
  } catch (err) {
    console.error('Contract error:', err)
    throw err
  }
}

export const contributeOnChain = async (goalId, amount, walletAddress) => {
  try {
    const account = await getAccount(walletAddress)
    const contract = new Contract(CONTRACT_ID)

    const operation = contract.call(
      'contribute',
      nativeToScVal(BigInt(goalId), { type: 'u64' }),
      nativeToScVal(walletAddress, { type: 'address' }),
      nativeToScVal(BigInt(Math.round(amount * 10000000)), { type: 'i128' }),
    )

    return await buildSignAndSubmit(account, operation, walletAddress)
  } catch (err) {
    console.error('Contribute error:', err)
    throw err
  }
}
export const refundFromChain = async (goalId, walletAddress) => {
  try {
    const account = await getAccount(walletAddress)
    const contract = new Contract(CONTRACT_ID)

    const operation = contract.call(
      'refund',
      nativeToScVal(BigInt(goalId), { type: 'u64' }),
    )

    return await buildSignAndSubmit(account, operation, walletAddress)
  } catch (err) {
    console.error('Refund error:', err)
    throw err
  }
}
