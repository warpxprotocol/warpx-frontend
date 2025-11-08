# WarpX Frontend Constitution

## Core Principles

### I. Code Quality & Type Safety
**TypeScript Strict Mode**: All code MUST comply with TypeScript strict mode. Explicit type definitions are prioritized over implicit types. The `any` type is prohibited without strong justification. SDK types are auto-generated from Polkadot runtime metadata and MUST NOT be manually edited.

**Error Handling**: All asynchronous operations MUST include proper error handling. User-facing error messages must be clear and actionable. Network errors and transaction failures must be handled gracefully with appropriate user feedback.

**Testability**: Components and logic MUST be designed to be testable. Jest is configured with `@testing-library/react` for component testing. Test files should be placed in `__test/` directories or as `*.test.tsx` files.

### II. Architecture Consistency
**App Router Pattern**: Next.js 15 App Router structure MUST be strictly followed. Server and client components must be clearly distinguished using the `'use client'` directive when needed.

**Monorepo Structure**: Yarn Workspaces structure MUST be maintained. The `packages/` directory structure MUST NOT be changed. Local workspace dependencies (`@warpx/sdk`) must be properly configured.

**Separation of Concerns**: Features MUST be organized into clear directory structures:
- Page-specific components: `app/[feature]/components/`
- Shared components: `components/`
- UI primitives: `components/ui/` (shadcn/ui)
- Custom hooks: `hooks/` or `app/features/[feature]/`
- Services: `services/features/[feature]/`

### III. User Experience & Accessibility
**Loading States**: All asynchronous operations MUST provide clear loading states. React Query's `isLoading` and `isError` states must be utilized appropriately.

**Error Feedback**: User-facing error messages MUST be understandable and actionable. Toast notifications must be used for transaction feedback via `components/toast/useTxToast.ts`.

**Accessibility**: ARIA attributes and keyboard navigation MUST be considered. Components should be accessible to users with disabilities.

**Responsive Design**: The application MUST support both mobile and desktop environments.

### IV. Performance & Scalability
**Code Splitting**: Dynamic imports MUST be used when appropriate to enable code splitting.

**Caching Strategy**: React Query MUST be utilized for efficient data caching. Server state should be managed through React Query, not local state.

**Render Optimization**: Unnecessary re-renders MUST be prevented. React optimization patterns must be followed.

**Blockchain Performance**: Polkadot API readiness MUST be checked before use via `isApiReady(api, isConnected, isReady)`. WebSocket connections must be properly managed for real-time updates.

### V. Blockchain Integration & Security
**Transaction Safety**: All blockchain transactions MUST use the `useExtrinsic` hook. Clear feedback and error handling must be included for every transaction.

**API Readiness**: Polkadot API readiness MUST be verified before any API calls. The `useApi()` hook provides the necessary state management.

**Real-time Synchronization**: WebSocket connections MUST be properly managed for real-time data updates. Orderbook and pool state must sync with chain state.

**Privacy Considerations**: When implementing private transaction features, local note storage and commitment handling MUST follow security best practices.

## Development Standards

### Code Style
- **Prettier**: All code MUST be formatted with Prettier using `yarn format`
- **Naming Conventions**:
  - Components: PascalCase (e.g., `TradeInput.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useTradeOperations.ts`)
  - Utilities: camelCase (e.g., `utils.ts`)
  - Types: PascalCase (e.g., `types.ts`)

### File Structure
- **Components**: `components/` or `app/[feature]/components/`
- **Hooks**: `hooks/` or `app/features/[feature]/`
- **Services**: `services/features/[feature]/`
- **Types**: Each module's `types.ts` file

### State Management
- **Zustand**: Global app state (`store/wallet.ts`, `store/app.ts`)
- **React Query**: Server state and caching (`services/features/*/queries.ts`)
- **Local State**: `useState`, `useReducer` for simple component state

## Critical Constraints

### Never Do
- ❌ Manually edit `packages/sdk/src/interfaces/` files (auto-generated)
- ❌ Change monorepo structure (`packages/` directory)
- ❌ Violate Next.js App Router rules
- ❌ Disable TypeScript strict mode
- ❌ Use `any` type without justification
- ❌ Skip error handling in async operations
- ❌ Store sensitive data in client-side state

### Always Do
- ✅ Use SDK types from `@warpx/sdk/*`
- ✅ Run `yarn workspace @warpx/sdk codegen` when SDK types need regeneration
- ✅ Use workspace scripts: `yarn workspace @warpx/...`
- ✅ Follow existing code patterns and conventions
- ✅ Handle errors gracefully with user feedback
- ✅ Check API readiness before blockchain operations
- ✅ Use React Query for server state management

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Documentation of the change rationale
2. Team review and approval
3. Update of dependent templates and documentation
4. Version increment following semantic versioning

All pull requests and code reviews MUST verify compliance with these principles. Complexity must be justified, and deviations require explicit approval.

**Version**: 1.0.0 | **Ratified**: 2024-11-08 | **Last Amended**: 2024-11-08
