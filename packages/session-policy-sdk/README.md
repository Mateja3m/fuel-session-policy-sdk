# @idoa/fuel-session-policy-sdk

Lightweight TypeScript SDK for session policy guardrails in Fuel dApps.

This package is middleware and is complementary to wallet flows. It is not a wallet implementation.

## Install

```bash
npm install @idoa/fuel-session-policy-sdk
```

## Security posture (v1)
- Strict runtime input validation in all public functions
- Guardrails for expiry, max spend, and contract allowlist
- Domain-separated payload structure for predicate data

Warning: v1 is not intended for high-value production custody.

## API
- `createSessionPolicy(input)`
- `validateSessionPolicy(policy)`
- `createPredicatePayload(policy)`
- `encodePredicateData(policy)`
- `decodePredicateData(encoded)`
- `buildSessionTransaction(params)`
- `executeWithSession(params)`

## Supported constraints
- `expiresAt`
- `maxSpend`
- `allowedContracts`

## Extension placeholders
- `allowedAssets`
- `allowedActions`
