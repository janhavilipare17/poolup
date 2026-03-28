# PoolUp 

> Pool money. Unlock together.

A decentralized group savings dApp built on Stellar blockchain using Soroban smart contracts. Create shared savings goals, lock XLM contributions on-chain, and automatically release funds when the target is hit — no trust needed.

##  Live Demo
**[https://poolup-woad.vercel.app](https://poolup-woad.vercel.app)**

##  Demo Video
[Watch Demo Video](https://drive.google.com/file/d/1_rufMCd__c5nKx9FNYoh3qrd32TfsSYe/view?usp=drive_link)

---

##  What is PoolUp?

PoolUp solves a real problem — when a group of friends wants to pool money for a trip, gift, or event, someone always has to be trusted with the funds. PoolUp eliminates this trust problem by locking funds in a Soroban smart contract that automatically releases when the goal is reached, or refunds everyone if the deadline passes.

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
User Browser
     ↓
React Frontend (Vercel)
     ↓
@stellar/stellar-sdk
     ↓
Soroban RPC (soroban-testnet.stellar.org)
     ↓
Soroban Smart Contract (Rust)
     ↓
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

##  Project Structure
```
poolup/
├── contracts/
│   └── poolup/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs              # Soroban smart contract (Rust)
├── src/
│   ├── pages/
│   │   ├── Home.jsx                # Landing page with stats
│   │   ├── Goals.jsx               # Explore all goals
│   │   ├── Create.jsx              # Create new goal
│   │   ├── GoalDetail.jsx          # Goal page with contribute
│   │   └── Dashboard.jsx           # My goals and transactions
│   ├── components/
│   │   └── Navbar.jsx              # Navigation with wallet connect
│   ├── hooks/
│   │   ├── useWallet.js            # Global wallet state
│   │   └── useScreenSize.js        # Mobile responsive hook
│   ├── utils/
│   │   └── contract.js             # All blockchain interactions
│   ├── App.jsx                     # Routes
│   └── main.jsx                    # Entry point
├── public/
├── Cargo.toml                      # Rust workspace
├── vercel.json                     # Vercel config
├── package.json
├── ARCHITECTURE.md                 # Architecture document
└── README.md
```

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

### Build Smart Contract
```bash
# Install Rust and Stellar CLI first
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli

# Build contract
cd contracts/poolup
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/poolup.wasm \
  --source deployer \
  --network testnet
```

---

##  Environment Setup

No environment variables needed! The app connects directly to:
- **Soroban RPC:** `https://soroban-testnet.stellar.org`
- **Network:** Stellar Testnet

---

##  Wallet Setup for Users

1. Install [Freighter](https://freighter.app) browser extension
2. Create a new wallet
3. Switch network to **Testnet**
4. Get free testnet XLM from [Friendbot](https://friendbot.stellar.org)
5. Visit [poolup-woad.vercel.app](https://poolup-woad.vercel.app) and connect!

---

##  Testnet Users

The following wallet addresses have tested PoolUp on Stellar testnet:

| User | Wallet Address | Action |
|------|---------------|--------|
| User 1 | `GBLUMAX4IIPS54AIGD5WXRRAXISG4HLV3BE3YR3SQAD3GZSXRTVJY5GI` | Created goals, contributed |
| User 2 | `GD5B3XLT2WRSACEFMQP35MYWRIMGK3HIJVIRFL6A4KOXFSSH5XJYFTVS` | Contributed |
| User 3 | `GDBIJAOFPMGQWDUUQTJ3YFHI44MWHQHPALJQG7ZDA7D5WWEDKJYA4OHA` | Contributed |
| User 4 | `GCLTDFYMDJZYLDKETB6Z24CCPHGFQS7NRZFJWT4AUXQZ5SF2BJOME7CN` | Contributed |
| User 5 | `GDAV623NX6QVNZUPGLQ7PNYAY42WSYMVCMHZMUDW74KJLEB2SIOEJQZG` | Contributed |

---
##  User Feedback Summary

| User | Feedback | Status |
|------|----------|--------|
| User 1 | Share link should work across devices | ✅ Fixed |
| User 2 | Dashboard should only show my goals | ✅ Fixed |
| User 3 | Refund button should be locked until deadline | ✅ Fixed |
| User 4 | Loading state needed when fetching goals | ✅ Fixed |
| User 5 | Connect wallet button needed on all pages | ✅ Fixed |
---
## submit your Feedback

We would love to hear your feedback!  
Please fill out the form below:
 [Submit Feedback](https://docs.google.com/forms/d/e/1FAIpQLSd4VG8YduygvOaii5r_py_T8esoN_asIaAMuPi-oOeIV-wQjA/viewform)
 
> Note: These improvements were implemented during development. While commit messages may not strictly follow the required format, the listed commits correspond directly to user feedback fixes.

## Security
[View Security Checklist](./SECURITY_CHECKLIST.md)

##  Implemented Feedback (with Commit References)

> Note: The following commits correspond to user feedback implementations.

###  1. Cross-device Share Link
Commit ID: `13e42ab`  
(100% blockchain - zero localStorage for goals and contributions)

###  2. Personalized Dashboard
Commit ID: `37524ee`  
(fix dashboard transactions - show only current wallet contributions)

###  3. Refund Lock Until Deadline
Commit ID: `f51fc75`  
(add contributors display, loading states, refund feature, blockchain integration)

###  4. Loading States
Commit ID: `f51fc75`  
(loading states added)

###  5. Wallet Button on All Pages
Commit ID: `c209907`  
(add connect wallet to navbar on all pages except home)

---
### Iterations Completed
1. **Moved from localStorage to blockchain** — goals now visible to everyone
2. **Added real-time polling** — contributors visible without refresh
3. **Fixed transaction timeout** — increased from 30s to 300s
4. **Added loading states** — better UX while fetching from blockchain
5. **Dashboard wallet filter** — only shows goals connected to your wallet
6. **On-chain contributors** — updated smart contract to store contributor list

---

##  Verify on Stellar Explorer

- **Contract:** [CAYDVDZ...X6WOQ](https://stellar.expert/explorer/testnet/contract/CAYDVDZKUHO3KXWRPGOM4DOATC2TJD2LISBA5B32GOL5ZSS6JZGX6WOQ)
- **All transactions** visible on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)

---

##  Roadmap

- [ ] Soroban mainnet deployment
- [ ] Real XLM transactions
- [ ] Mobile app (React Native)
- [ ] Goal categories and tags
- [ ] Email/SMS notifications when goal is reached
- [ ] Multi-currency support
- [ ] Gasless transactions via fee bump

---
##  Final Note

Implemented **5/5 user feedback suggestions**, significantly improving:
- Usability
- Cross-device accessibility
- UI responsiveness
- Blockchain reliability

All improvements are backed by real commit history and on-chain functionality.
---
##  License

MIT License — feel free to use and build on this project.

---
Final submission update

