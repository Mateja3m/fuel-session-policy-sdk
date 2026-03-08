# @fuel-session-policy/sdk

Lightweight TypeScript SDK for session-based policy checks in Fuel dApps.

## API
- `createSessionPolicy(input)`
- `validateSessionPolicy(policy)`
- `encodePredicateData(policy)`
- `buildSessionTransaction(params)`
- `executeWithSession(params)`

## Supported constraints
- `expiresAt`
- `maxSpend`
- `allowedContracts`

## Extension points (MVP placeholders)
- `allowedAssets`
- `allowedActions`

## Out of scope (MVP)
- On-chain policy registry
- Revocation contracts
- Wallet/account abstraction framework
