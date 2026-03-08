# Fuel Session Policy SDK

TypeScript-first Fuel monorepo for lightweight session policies in dApps.

## Project Summary
This repository provides an MVP Session Policy SDK that lets a user approve one temporary policy and then execute multiple allowed actions under policy constraints.

Implemented policy constraints:
- `expiresAt`
- `maxSpend`
- `allowedContracts`

Extension placeholders included:
- `allowedAssets`
- `allowedActions`

## Monorepo Structure
- `apps/demo-web`: React + MUI demo app
- `packages/session-policy-sdk`: reusable TypeScript SDK
- `packages/shared`: shared TS constants/types
- `sway/session-policy-predicate`: one minimal reference predicate
- `scripts`: local setup scripts
- `docs`: architecture/policy/testing documentation

## Requirements
- Node.js 20+
- npm 10+
- Fuel toolchain (`forc`) for predicate build

## Quick Commands
- Install dependencies: `npm install`
- Prepare local demo env: `npm run setup:local`
- Run demo app: `npm run dev`
- Run tests: `npm test`
- Build all TS packages/apps: `npm run build`
- Build Sway predicate: `npm run fuel:build`

## How to Try This Quickly

### Local mode
1. Start a local Fuel node in a separate terminal.
2. Run:
   - `npm install`
   - `npm run setup:local`
   - `npm run dev`
3. Open the app and run this flow:
   - Connect wallet
   - Create example session policy
   - Approve session
   - Execute valid action
   - Execute invalid action

### Testnet mode
1. Update `apps/demo-web/.env.local`:
   - `VITE_FUEL_NETWORK=testnet`
   - `VITE_FUEL_NODE_URL=https://testnet.fuel.network/v1/graphql`
2. Fund wallet from Fuel faucet.
3. Start demo app with `npm run dev`.

### Expected happy-path result
- Valid action executes and logs a success entry with mock tx id.
- Session spend counter increases.

### Expected failure-path result
- Invalid action (blocked contract) is rejected by SDK policy checks.
- Result logs show clear blocked-action error.

## What Works Now
- Session policy creation and validation in TypeScript
- Predicate payload encoding helper
- Session execution wrapper with policy checks
- Demo app for approve/execute success+failure paths
- Reference Sway predicate for expiry, contract allowlist, spend cap

## Intentionally MVP Scope
- No wallet implementation
- No multisig/paymaster/account abstraction framework
- No backend relayer
- No policy registry/revocation contract
- No storage-based on-chain logic

## Phase-2 Directions
- Strong typed action-level constraints
- Asset-level restriction enforcement
- Optional ABI method filtering
- Richer demo transaction integration with live contracts
