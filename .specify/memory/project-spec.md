# WarpX Frontend - Project Specification

**Project**: WarpX Frontend  
**Created**: 2024-11-08  
**Status**: Active Development  
**Repository**: [warp(x)-frontend](https://github.com/warpxprotocol/warpx-frontend)

## Project Overview

**WarpX Frontend** is the frontend application for **warp(x)**, a privacy-preserving hybrid DEX (Decentralized Exchange) that combines the efficiency of traditional orderbooks with the flexibility of Automated Market Makers (AMM). Built on Polkadot SDK, warp(x) revolutionizes decentralized trading by offering:

- **Hybrid Trading System**: Seamlessly combines AMM and orderbook models for optimal execution
- **Privacy-Preserving Transactions**: Zcash shielded pool with zero-knowledge proof protocol and RISC0-verifier technology
- **High Performance**: Plans for NOMT (Nearly Optimal Merkle Trie) integration for improved I/O operations
- **Cross-Chain Interoperability**: Leverages Polkadot's security infrastructure and multi-chain capabilities

## Technical Stack

### Frontend Framework
- **Next.js 15** (App Router) with React 19
- **TypeScript 5.4.5** (strict mode enabled)
- **Tailwind CSS** + **shadcn/ui** for styling
- **Emotion** for styled components (configured)

### Blockchain Integration
- **Polkadot.js API** (`@polkadot/api`)
- **Polkadot Extension DApp** (`@polkadot/extension-dapp`)
- **Custom Substrate Runtime** (warp(x) node)
- **WebSocket Provider** for real-time updates

### State Management
- **Zustand** for global app state
- **React Query** (`@tanstack/react-query`) for server state and caching
- **Local State** (`useState`, `useReducer`) for component state

### Build & Development
- **Yarn Workspaces** (monorepo structure)
- **Prettier** for code formatting
- **Jest** + **@testing-library/react** for testing

## Project Structure

```
warpx-frontend/
├── packages/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router
│   │   │   ├── components/ # Reusable components
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   ├── providers/ # Context providers
│   │   │   ├── services/  # API clients and services
│   │   │   └── store/     # Zustand stores
│   │   └── public/        # Static assets
│   └── sdk/               # Polkadot type generation
│       └── src/interfaces/ # Generated type definitions
```

## Core Features

### 1. Wallet Integration
- Polkadot.js Extension connection
- Multi-account support
- Network switching
- Real-time balance queries
- Transaction signing via `signAndSend`

### 2. Hybrid Orderbook Trading
- **Limit Orders**: Price and amount specification with validation
- **Market Orders**: Execution against best available price
- **Real-time Orderbook**: Live bid/ask display with depth visualization
- **Price Discovery**: Dynamic routing between AMM and orderbook for optimal execution

### 3. AMM Pool Management
- **Pool Creation**: Create new liquidity pools with custom parameters
- **Add Liquidity**: Contribute to existing pools proportionally
- **Remove Liquidity**: Withdraw liquidity and receive LP tokens
- **LP Token Management**: Track and manage liquidity provider positions
- **Pool Information**: Real-time pool state (reserves, LP supply, fee rate, APR)

### 4. Real-time Data Synchronization
- WebSocket connections for live updates
- Blockchain event subscriptions
- Real-time price and liquidity information
- Orderbook state synchronization

## Architecture Patterns

### State Management Strategy
- **Zustand Stores**:
  - `store/wallet.ts`: Wallet connection and account state
  - `store/app.ts`: Global application state
- **React Query**:
  - `services/features/*/queries.ts`: Data fetching queries
  - Automatic caching and refetching
  - Real-time synchronization with chain state

### API Integration Pattern
- **API Hook**: `hooks/useApi.ts` provides centralized API access
- **Readiness Check**: `isApiReady(api, isConnected, isReady)` before API calls
- **Transaction Handling**: `hooks/useExtrinsic.ts` for blockchain transactions
- **Error Handling**: Toast notifications via `components/toast/useTxToast.ts`

### Component Organization
- **Page Components**: `app/[feature]/components/`
- **Shared Components**: `components/`
- **UI Primitives**: `components/ui/` (shadcn/ui)
- **Feature Hooks**: `app/features/[feature]/` or `hooks/`

## Runtime Integration

### Hybrid Orderbook Pallet
The frontend interacts with the `hybrid-orderbook` pallet which provides:
- Price-optimized order routing between AMM and orderbook
- Dynamic execution venue selection based on best price
- Efficient swap calculation using binary search (O(log n))
- Slippage protection through price impact calculation

### Private Transaction System (Planned)
Future integration with privacy-preserving features:
- Note-based asset management
- RISC0-based proof system
- Private swap mechanism
- KYC-compliant anonymous trading

## Development Workflow

### Initial Setup
1. Install dependencies: `yarn install`
2. Generate SDK types: `yarn workspace @warpx/sdk codegen`
3. Start dev server: `yarn workspace @warpx/frontend dev`

### SDK Type Generation
When runtime metadata changes:
1. Ensure local node is running (RPC port 9988)
2. Extract metadata: `curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "state_getMetadata", "params":[]}' http://localhost:9988 > packages/sdk/warpx.json`
3. Generate types: `yarn workspace @warpx/sdk codegen`

### Adding New Features
1. Create feature directory: `app/features/[feature]/` or page-specific `components/`
2. Define types in `types.ts`
3. Create queries in `services/features/[feature]/queries.ts`
4. Create custom hooks: `use[Feature].ts`
5. Build components following existing patterns
6. Connect to pages/routes

## Performance Considerations

- **Code Splitting**: Dynamic imports for route-based splitting
- **Caching**: React Query for efficient data caching
- **Render Optimization**: Prevent unnecessary re-renders
- **WebSocket Management**: Efficient connection handling for real-time updates

## Security & Privacy

- **Transaction Safety**: All transactions require user approval
- **Sensitive Data**: No sensitive information stored client-side
- **API Security**: Proper validation before blockchain operations
- **Privacy Features**: Future integration with shielded pool and zero-knowledge proofs

## Testing Strategy

- **Unit Tests**: Component and hook testing with Jest
- **Integration Tests**: API integration and transaction flow testing
- **E2E Tests**: User journey testing (planned)

## Future Enhancements

### Runtime
- NOMT integration for better storage I/O
- qp-trie for orderbook optimization
- L2 for pre-confirmation for faster block time
- TWAP (Time-Weighted Average Price)

### Client
- Prover for creating ZK proofs
- Wallet for storing local `Note` data

### Application
- Chart integration (backend needed)
- UX improvements

## References

- [Constitution](./constitution.md) - Project principles and development philosophy
- [Cursor AI Guide](../cursor.md) - Cursor AI collaboration guide
- [Claude AI Guide](../claude.md) - Claude AI collaboration guide
- [README](../README.md) - Project overview and setup
- [Original Repo](https://github.com/warpxprotocol/warpx) - Runtime repository
- [Frontend Repo](https://github.com/warpxprotocol/warpx-frontend) - This repository

