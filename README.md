# PoolUp 

> Pool money. Unlock together.

A decentralized group savings dApp built on Stellar blockchain using Soroban smart contracts. Create shared savings goals, lock XLM contributions on-chain, and automatically release funds when the target is hit — no trust needed.

##  Live Demo
**[https://poolup-woad.vercel.app](https://poolup-woad.vercel.app)**

##  Demo Video
[Watch Demo Video](https://drive.google.com/file/d/1_rufMCd__c5nKx9FNYoh3qrd32TfsSYe/view?usp=drive_link)

---

##  What is PoolUp?

PoolUp solves a real problem  when a group of friends wants to pool money for a trip, gift, or event, someone always has to be trusted with the funds. PoolUp eliminates this trust problem by locking funds in a Soroban smart contract that automatically releases when the goal is reached, or refunds everyone if the deadline passes.

### Real-world use cases
-  Group trips (Goa trip, Europe vacation)
-  Birthday gifts for friends
-  Event planning (parties, concerts)
-  Group orders and purchases
-  Fitness challenges with stakes

---

##  Features

- **Create Goals** — Set a name, target XLM amount, deadline, and emoji
- **Share Links** — Every goal gets a unique shareable link
- **Lock Funds** — Contributors lock XLM directly into the smart contract
- **Auto Release** — Funds release when target is reached
- **Auto Refund** — Everyone gets refunded if deadline passes without reaching goal
- **Real-time Updates** — Goal page polls blockchain every 5 seconds
- **Wallet Identity** — Your Stellar wallet is your identity — no signup needed
- **Dashboard** — See all goals you created or contributed to
- **Explorer Links** — Every transaction visible on Stellar Expert

---

##  Architecture
```
Frontend (React + Vite)
        ↕
Stellar SDK (@stellar/stellar-sdk)
        ↕
Soroban Smart Contract (Rust)
        ↕
Stellar Testnet Blockchain
```

### Smart Contract Functions
| Function | Description |
|----------|-------------|
| `create_goal` | Creates a new goal on-chain |
| `contribute` | Locks XLM contribution on-chain |
| `get_goal` | Fetches goal details |
| `get_goal_count` | Returns total number of goals |
| `get_contributors` | Returns all contributors for a goal |
| `get_progress` | Returns current collected amount |
| `refund` | Refunds contributors if deadline passed |

### Contract Details
- **Network:** Stellar Testnet
- **Contract ID:** `CAYDVDZKUHO3KXWRPGOM4DOATC2TJD2LISBA5B32GOL5ZSS6JZGX6WOQ`
- **Explorer:** [View Contract](https://stellar.expert/explorer/testnet/contract/CAYDVDZKUHO3KXWRPGOM4DOATC2TJD2LISBA5B32GOL5ZSS6JZGX6WOQ)

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Blockchain | Stellar Testnet |
| Smart Contract | Soroban (Rust) |
| Wallet | Freighter, xBull |
| Deployment | Vercel |
| Stellar SDK | @stellar/stellar-sdk v13 |

---

##  Installation
```bash
# Clone the repository
git clone https://github.com/janhavilipare17/poolup.git
cd poolup

# Install dependencies
npm install

# Run locally
npm run dev
```

### Smart Contract
```bash
cd contracts/poolup
stellar contract build
stellar contract deploy --wasm target/wasm32v1-none/release/poolup.wasm --source deployer --network testnet
```

---

##  Testnet Users

The following wallet addresses have tested PoolUp on Stellar testnet:

| User | Wallet Address | Action |
|------|---------------|--------|
| User 1 | `GBLUMAX4IIPS54AIGD5WXRRAXISG4HLV3BE3YR3SQAD3GZSXRTVJY5GI` | Created goals, contributed |
| User 2 | `GDAV623NX6QVNZUPGLQ7PNYAY42WSYMVCMHZMUDW74KJLEB2SIOEJQZG` | Contributed |
| User 3 | `GCSX7FR6XYMAPHEJASF2RA3BHQV3PM4DKVW3FTSQV76IIR7GYIGJSW3W` | Contributed |
| User 4 | `GDBIJAOFPMGQWDUUQTJ3YFHI44MWHQHPALJQG7ZDA7D5WWEDKJYA4OHA` | Contributed |
| User 5 | `GC4PZZW35N6GEORNVODLSNSMZSBY7SN4OFQBIILMEZUJEL4I2ZOMNE5H` | Contributed |

---

##  User Feedback

### Feedback Round 1

| User | Feedback | Status |
|------|----------|--------|
| User 1 | "Share link should work across devices" |  Fixed — moved to blockchain |
| User 2 | "Dashboard should only show my goals" |  Fixed — filter by wallet |
| User 3 | "Refund button should be locked until deadline" | Fixed — deadline check added |
| User 4 | "Loading state needed when fetching goals" |  Fixed — added loading states |
| User 5 | "Connect wallet button needed on all pages" |  Fixed — added to navbar |

### Iterations Completed
1. **Moved from localStorage to blockchain** — goals now visible to everyone
2. **Added real-time polling** — contributors visible without refresh
3. **Fixed transaction timeout** — increased from 30s to 300s
4. **Added loading states** — better UX while fetching from blockchain
5. **Dashboard wallet filter** — only shows goals connected to your wallet

---

## 🗺️ Roadmap

-  Soroban mainnet deployment
-  Real XLM transactions
-  Mobile app (React Native)
-  Goal categories and tags
-  Email/SMS notifications when goal is reached
-  Multi-currency support

---

##  License

MIT License — feel free to use and build on this project.

---

Built with ❤️ on Stellar blockchain
