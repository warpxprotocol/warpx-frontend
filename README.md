# warp(x) Frontend

## ✨ Introduction

This is the **frontend repository** for the [warp(x)](https://warpx.vercel.app) project — a fully on-chain hybrid DEX combining both AMM and Orderbook mechanics, built on **Polkadot SDK**.

The frontend is developed using **Next.js**, **React**, **Tailwind CSS**, and **@polkadot/api**, and interacts directly with a Substrate-based node via WebSocket for live trading and asset state updates.

warp(x) enables users to:
- Trade using **Limit / Market orders**
- Interact with **AMM pools**
- Connect via **Polkadot.js Wallet Extension**
- Visualize live **orderbook and liquidity data**
- Execute **fully on-chain transactions** with real-time feedback

---

## 🚀 How to Run

Make sure the local Substrate node is running before launching the frontend.


### 🧩 SDK & Type Generation

Type generation is needed for proper API interaction with the custom runtime.

1. Move to SDK workspace:

```bash
cd packages/sdk
```

2. Run the node and expose metadata:

```bash
./target/release/warpx-node \
  --rpc-port 9988 \
  ...
```

3. Export runtime metadata:

```bash
curl -H "Content-Type: application/json" \
     -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' \
     http://localhost:9988 > ./warpx.json
```

4. Generate type definitions:

```bash
# From project root
yarn codegen

# Or from SDK workspace
yarn workspace @warpx/sdk codegen
```

This will generate the required custom types for the frontend to work with the Polkadot API.

---

## 📦 Tech Stack

| Layer              | Tech                                                       |
|--------------------|------------------------------------------------------------|
| **Framework**      | [Next.js](https://nextjs.org/) (App Router)               |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Blockchain API** | [`warp/api`](./packages/sdk), [`@polkadot/api`](https://polkadot.js.org/docs/api/) |
| **Wallet Integration** | [@polkadot/extension-dapp](https://polkadot.js.org/docs/extension/) |
| **State / Data**   | React Query, Zustand                                       |
| **Build Tool**     | Turborepo (Yarn Workspaces)

---

# Application

### 🔌 Polkadot Node Integration

- `WsProvider`

  - [x] Connects to local or remote nodes (e.g. warpX testnet).

- `ApiPromise`

  - [x] Centralized factory function ensures a single shared instance across the appApiPromise is created and shared across the app.

- `Zustand`

  - [x] Manages and persists:
    - [x] Polkadot API connection instance.
    - [x] Current connected wallet account.
    - [x] Pool info and metadata.
    - [x] UI states: loading, success, error.

- `React Query`

  - [x] Fetches on-chain data (balances, orderbook, pools).
  - [x] Handles caching, refetching, and state sync.

- `Polkadot.js Extension Integration`

  - [x] Uses `web3Enable`, `web3Accounts` for wallet access.
  - [x] Handles transaction signing via `signAndSend`.

- `Custom Hooks`

  - [x] `useApi`, `useWallet`, `useSubmitTx`, `useOrderbook`.
  - [x] Encapsulate logic for modular use in components.

- `Connection Handling`
  - [x] Shows real-time status (Connected / Connecting / Disconnected).
  - [x] Graceful fallback for missing wallet or node issues.

### 💧 Pool Management

- `Pair Discovery`

  - [x] Query existing pairs and display available pools
  - [x] Handle routing to pair-specific pages (e.g. `/pools/DOT/USDC`)

- `Create Pool`

  - [x] Submits `create_pool` transaction with correct token IDs
  - [x] Enforces minimum amount of liquidity when creating a new pool

- `Add Liquidity Pool`

  - [x] Submits `add_liquidity` transaction
  - [x] Calculates proportional contribution based on current pool reserves

- `AMM Info Fetching`
  - [x] Fetches on-chain pool state (reserves, LP supply, fee rate)
  - [x] Updates UI with live price, ratio, and APR
  - [x] Uses React Query to sync with latest chain state
- `verified_pool(optional)` :
  [Link](https://www.coinbase.com/verified-pools)

### 🧾 Order System

- `Live Orderbook Fetching`

  - [x] Fetches real-time bids and asks from on-chain storage
  - [x] Uses React Query or subscription to sync order changes
  - [x] Displays sorted orderbook (highest bid, lowest ask)

- `Order State Management`

  - [x] Normalizes raw storage into price/amount format
  - [x] Aggregates orders by price level for display
  - [x] Updates state efficiently on every block or event

- `UI Display`
  - [x] Renders bid/ask tables side by side
  - [x] Shows depth bar or volume visualizations

### 🔄 Trade Execution

- `Limit Order`

  - [x] Form input for price and amount
  - [x] Validates balance and orderbook constraints
  - [x] Submits `limit_order` transaction
  - [x] Shows estimated fill, fees, and confirmation status

- `Market Order`

  - [x] Executes against best available price in the orderbook
  - [x] Auto-calculates expected output based on slippage
  - [x] Submits `market_order` transaction with real-time preview

- `UX & Feedback`
  - [x] Displays transaction status: pending, included, failed
  - [x] Shows toast notifications or inline status
  - [x] Resets form after confirmation


---

## 🧠 Developer Notes

- Ensure your local chain exposes the correct RPC port (9988) for SDK operations.
- Onchain logic for order matching is handled by Substrate custom pallets (see backend repo).
- Frontend provides live WebSocket updates for trades and liquidity events.
- Wallet must be connected and authorized via Polkadot.js Extension to sign transactions.

---

## 🙌 Contributors
- **Frontend**: [Kiyori (GitHub: @thxforall)](https://github.com/thxforall)
  
---
