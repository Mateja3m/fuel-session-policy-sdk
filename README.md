# Fuel Session Policy SDK

TypeScript-first Fuel monorepo for building and demonstrating temporary session policies in Fuel dApps.

## Main Publishable Package
- `@idoa/fuel-session-policy-sdk`

This is the only package intended for npm publication.

## Repository Structure
- `packages/session-policy-sdk`: publishable TypeScript SDK
- `apps/demo-web`: private React + MUI demo app
- `packages/shared`: private internal workspace (optional helper types/constants)
- `sway/session-policy-predicate`: minimal reference predicate
- `docs`: architecture, policy model, and testing docs
- `scripts`: setup and utility scripts

## Current SDK Scope
Implemented policy constraints:
- `expiresAt`
- `maxSpend`
- `allowedContracts`

Placeholder extension points:
- `allowedAssets`
- `allowedActions`

## Requirements
- Node.js 20+
- npm 10+
- `forc` installed for Sway predicate build only

## Local Development
- Install dependencies: `npm install`
- Prepare local env files: `npm run setup:local`
- Run demo app: `npm run dev`
- Run tests: `npm test`
- Build all workspaces: `npm run build`
- Build predicate: `npm run fuel:build`

## How to Try This Quickly

### Local mode
1. Start a local Fuel node in another terminal.
2. Run:
   - `npm install`
   - `npm run setup:local`
   - `npm run dev`
3. In the demo app:
   - Connect wallet
   - Create example session policy
   - Approve session
   - Execute valid action
   - Execute invalid action

### Testnet mode
1. Update `apps/demo-web/.env.local`:
   - `VITE_FUEL_NETWORK=testnet`
   - `VITE_FUEL_NODE_URL=https://testnet.fuel.network/v1/graphql`
2. Fund your wallet from Fuel faucet.
3. Run `npm run dev` and repeat the same flow.

### Expected happy path
- Valid action succeeds.
- Spend tracker increments.

### Expected failure path
- Invalid action is blocked by policy checks.
- Log panel shows the policy violation reason.

## npm Publishing Readiness

The publish target is:
- `@idoa/fuel-session-policy-sdk`

### Pre-publish checks
- `npm run build`
- `npm test`
- `npm run pack:sdk`

### Publish command
- `npm run publish:sdk`

### One-time npm prerequisites
- Ensure `@idoa` npm scope exists and you have permission.
- Run `npm login`.
- Ensure package metadata URLs in `packages/session-policy-sdk/package.json` point to your final repository.

## What Is Intentionally Out of Scope
- Wallet implementation
- Multisig/paymaster/account abstraction framework
- Backend relayer
- On-chain session registry/revocation contracts
- Storage-based predicate state

## Notes for Reviewers
- Core product logic is in TypeScript SDK for fast iteration and low complexity.
- Sway is intentionally limited to one small reference predicate for expiry, contract allowlist, and spend cap checks.
