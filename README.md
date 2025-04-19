# 🟧 bitcoin_dapp – ICP x Bitcoin Integration

Welcome to `bitcoin_dapp`, a decentralized app built on the Internet Computer that integrates **real Bitcoin functionality** using ICP’s native Bitcoin support. Built in Motoko, this app fetches Bitcoin balances and will soon support dynamic user wallets, transaction history, and more.

---

## 🛠️ Tech Stack

[![Motoko](https://img.shields.io/badge/Made%20with-Motoko-blueviolet)](https://dfinity.org/developers/motoko)  
[![ICP Native Bitcoin](https://img.shields.io/badge/ICP%20-Bitcoin%20Integration-orange)](https://internetcomputer.org/)  
[![Frontend: Svelte](https://img.shields.io/badge/Frontend-Svelte-red)](https://svelte.dev/)  
[![Status: In Progress](https://img.shields.io/badge/Status-Dev%20in%20Progress-yellow)](https://github.com/rainwaters11/ICP_DevMO)

---

## 📆 Project Timeline

### 🚀 Two Days Ago: Initial App Build
- Created core Bitcoin Dapp project with working regtest setup
- Implemented Motoko canister that:
  - Returns a fixed (hardcoded) Bitcoin address
  - Fetches BTC balance via ICP Bitcoin canister
  - Converts satoshis to readable BTC
- Added fallback error handling and mock values for resilience
- Set up two frontends:
  - `src/bitcoin_dapp_frontend`: JS/Lit-based
  - `frontend/`: Svelte version

---

### ✨ Today’s Progress (April 18, 2025)
Branch: `feature/bitcoin-enhancements`

- Created a new Git branch for production readiness
- Drafted new features and clean code structure for:
  - ✅ Dynamic Bitcoin address generation per user principal
  - ✅ User registration + persistent storage across upgrades
  - ✅ Switchable network modes: `regtest`, `testnet`, `mainnet`
  - ✅ Transaction history view via UTXOs
  - ✅ Fee estimation utility
- Updated project README and created clear milestones for mainnet prep

---

## 🔧 Features (Live or In Progress)

| Feature                        | Status         |
|-------------------------------|----------------|
| Hardcoded Bitcoin address     | ✅ Working     |
| Regtest BTC balance fetch     | ✅ Working     |
| Svelte + Lit frontend         | ✅ Working     |
| Dynamic address generation    | 🔄 In Progress |
| User registration system      | 🔄 In Progress |
| Transaction history (UTXOs)   | 🔄 In Progress |
| Fee estimation (sats/byte)    | 🔄 In Progress |
| Mainnet support toggle        | 🔄 In Progress |

---

## 🧪 Run Locally (Regtest Mode)

```bash
# Start local replica
dfx start --background

# Deploy canisters
dfx deploy

# Start frontend dev server
npm start
a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

### Note on frontend environment variables

Visit frontend: http://localhost:8080

Backend: http://localhost:4943

Notes:
Make sure your Bitcoin regtest node is running.

You may use mock values for balance/UTXOs during development.

📦 Folder Structure
bash
Copy
Edit
bitcoin_dapp/
├── src/
│   ├── bitcoin_dapp/          # Main Motoko canister
│   ├── bitcoin_dapp_frontend/ # JS/Lit frontend
│
├── frontend/                  # Svelte-based UI
├── dfx.json                   # Project config
├── README.md                  # This file
🧠 Next Steps
 Finalize generateNewAddress() using bitcoin_get_p2pkh_address

 Complete registerUser() and getUserAddress() with stable storage

 Test address persistence after canister upgrade

 Implement fee estimator and transaction list view

 Flip to mainnet and deploy with real BTC address

👤 Author
Misty Waters
Web3 Builder | ICP Developer
GitHub: @rainwaters11

📝 License
MIT License – Open to all ICP and Web3 builders ✨

