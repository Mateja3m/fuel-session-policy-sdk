# Fuel Session Policy SDK

TypeScript-first reference middleware SDK for Fuel dApps.

This project helps dApps define temporary session policies so users can approve once and execute multiple constrained actions. It is complementary to wallets, not a wallet replacement.

## Positioning
- Reference middleware SDK for dApp session policies
- Complementary to wallet UX and signature flows
- Intentionally minimal MVP for reviewer clarity
- Future extensions are possible, but out of current scope

## Security Posture (v1)
- Short-lived session examples (5 minutes) in demo and tests
- Strict input validation across all public SDK functions
- Policy checks for `expiresAt`, `maxSpend`, and `allowedContracts`
- Domain-separated policy payload structure for encoding/decoding
- Explicit blocked-path handling and messaging in demo

Warning: v1 is not intended for high-value production custody.

## Monorepo Structure
- `packages/session-policy-sdk`: main publishable SDK (`@idoa/fuel-session-policy-sdk`)
- `demo-app`: reviewer-friendly React demo app
- `packages/shared`: private workspace helpers
- `sway/session-policy-predicate`: one minimal reference predicate
- `docs`: architecture, policy model, testing, compatibility, maintenance

## Compatibility
- Node.js: 20.x
- npm: 10.x
- TypeScript: 5.8.x
- Vitest: 3.2.x
- Vite: 6.x

See `docs/compatibility.md` for details.

## Quick Commands
- Install dependencies: `npm install`
- Prepare local env files: `npm run setup:local`
- Run demo app: `npm run dev`
- Typecheck all workspaces: `npm run typecheck`
- Lint (typecheck-backed): `npm run lint`
- Run tests: `npm test`
- Build all workspaces: `npm run build`
- Build Sway predicate: `npm run fuel:build`

## How to Try This Quickly

### Local mode
1. Start a local Fuel node in another terminal.
2. Run:
   - `npm install`
   - `npm run setup:local`
   - `npm run dev`
3. In the demo app:
   - Connect wallet
   - Create short-lived session policy
   - Approve session
   - Execute valid action (should pass)
   - Execute invalid action (should be blocked)

### Testnet mode
1. Update `demo-app/.env.local`:
   - `VITE_FUEL_NETWORK=testnet`
   - `VITE_FUEL_NODE_URL=https://testnet.fuel.network/v1/graphql`
2. Fund wallet from Fuel faucet.
3. Run `npm run dev` and repeat demo flow.

### Expected outcomes
- Happy path: valid action succeeds and spend counter increments.
- Failure path: invalid target contract is blocked with readable reason.

## Intentionally Out of Scope
- Wallet implementation
- Multisig
- Paymaster
- Full account abstraction framework
- Revocation/storage-heavy contract systems
- Backend relayer services
