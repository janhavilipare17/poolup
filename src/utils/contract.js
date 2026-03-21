import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
} from '@stellar/stellar-sdk'

const CONTRACT_ID = 'CDR4GG5DEFRMTJH7CCBDWYVH35NBFIE4KYLUURGGZINPHDY4V2CCJHGK'
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
        contributors: [],
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
    .setTimeout(30)
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

  console.log('Sign result:', signResult)
  console.log('Sign result type:', typeof signResult)

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

  console.log('signedXDR:', signedXDR)

  if (!signedXDR) throw new Error('Could not get signed transaction')

  const txResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE)
  )

  console.log('TX Result:', txResult)
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
// save contribution locally so we can show it
export const saveContributionLocally = (goalId, contribution) => {
  const key = `poolup_contribs_${goalId}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.unshift(contribution)
  localStorage.setItem(key, JSON.stringify(existing))
}

// get local contributions for a goal
export const getLocalContributions = (goalId) => {
  const key = `poolup_contribs_${goalId}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}