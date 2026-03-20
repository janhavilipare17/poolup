import * as StellarSdk from '@stellar/stellar-sdk'

const CONTRACT_ID = 'CDR4GG5DEFRMTJH7CCBDWYVH35NBFIE4KYLUURGGZINPHDY4V2CCJHGK'
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET
const RPC_URL = 'https://soroban-testnet.stellar.org'

const server = new StellarSdk.SorobanRpc.Server(RPC_URL)

const getAccount = async (publicKey) => {
  return await server.getAccount(publicKey)
}

// GET ALL GOALS from blockchain
export const getGoalsFromChain = async () => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID)
    const dummyKey = 'GBLUMAX4IIPS54AIGD5WXRRAXISG4HLV3BE3YR3SQAD3GZSXRTVJY5GI'

    const countTx = new StellarSdk.TransactionBuilder(
      await getAccount(dummyKey),
      { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call('get_goal_count'))
      .setTimeout(30)
      .build()

    const countResult = await server.simulateTransaction(countTx)
    const count = StellarSdk.scValToNative(countResult.result.retval)
    const goals = []

    for (let i = 1; i <= Number(count); i++) {
      const goalTx = new StellarSdk.TransactionBuilder(
        await getAccount(dummyKey),
        { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
      )
        .addOperation(
          contract.call(
            'get_goal',
            StellarSdk.nativeToScVal(BigInt(i), { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build()

      const goalResult = await server.simulateTransaction(goalTx)
      const goal = StellarSdk.scValToNative(goalResult.result.retval)

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

// CREATE GOAL on blockchain
export const createGoalOnChain = async (goalData, walletAddress) => {
  try {
    const account = await getAccount(walletAddress)
    const contract = new StellarSdk.Contract(CONTRACT_ID)

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'create_goal',
          StellarSdk.nativeToScVal(goalData.name, { type: 'string' }),
          StellarSdk.nativeToScVal(goalData.description, { type: 'string' }),
          StellarSdk.nativeToScVal(BigInt(Math.round(goalData.target * 10000000)), { type: 'i128' }),
          StellarSdk.nativeToScVal(BigInt(goalData.deadline), { type: 'u64' }),
          StellarSdk.nativeToScVal(walletAddress, { type: 'address' }),
        )
      )
      .setTimeout(30)
      .build()

    const simResult = await server.simulateTransaction(transaction)
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error('Simulation failed: ' + simResult.error)
    }

    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction, simResult
    ).build()

    const freighter = await import('@stellar/freighter-api')
    const { signedTransaction } = await freighter.signTransaction(
      preparedTx.toXDR(),
      { networkPassphrase: NETWORK_PASSPHRASE }
    )

    const txResult = await server.sendTransaction(
      StellarSdk.TransactionBuilder.fromXDR(signedTransaction, NETWORK_PASSPHRASE)
    )

    return { success: true, hash: txResult.hash }

  } catch (err) {
    console.error('Contract error:', err)
    throw err
  }
}

// CONTRIBUTE on blockchain
export const contributeOnChain = async (goalId, amount, walletAddress) => {
  try {
    const account = await getAccount(walletAddress)
    const contract = new StellarSdk.Contract(CONTRACT_ID)

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'contribute',
          StellarSdk.nativeToScVal(BigInt(goalId), { type: 'u64' }),
          StellarSdk.nativeToScVal(walletAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(BigInt(Math.round(amount * 10000000)), { type: 'i128' }),
        )
      )
      .setTimeout(30)
      .build()

    const simResult = await server.simulateTransaction(transaction)
    if (StellarSdk.SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error('Simulation failed: ' + simResult.error)
    }

    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction, simResult
    ).build()

    const freighter = await import('@stellar/freighter-api')
    const { signedTransaction } = await freighter.signTransaction(
      preparedTx.toXDR(),
      { networkPassphrase: NETWORK_PASSPHRASE }
    )

    const txResult = await server.sendTransaction(
      StellarSdk.TransactionBuilder.fromXDR(signedTransaction, NETWORK_PASSPHRASE)
    )

    return { success: true, hash: txResult.hash }

  } catch (err) {
    console.error('Contribute error:', err)
    throw err
  }
}