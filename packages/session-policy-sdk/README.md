# @idoa/fuel-session-policy-sdk

Lightweight TypeScript SDK for session-based policy checks in Fuel dApps.

## Install

```bash
npm install @idoa/fuel-session-policy-sdk
```

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

## Example

```ts
import {
  createSessionPolicy,
  executeWithSession
} from '@idoa/fuel-session-policy-sdk';

const policy = createSessionPolicy({
  expiresAt: Date.now() + 15 * 60 * 1000,
  maxSpend: '10',
  allowedContracts: ['0x1111111111111111111111111111111111111111111111111111111111111111']
});

const result = await executeWithSession({
  policy,
  targetContract: '0x1111111111111111111111111111111111111111111111111111111111111111',
  amount: '2',
  currentSpent: '0',
  executor: async () => ({ txId: 'mock-id' })
});

console.log(result.nextSpent);
```

## Notes
- `encodePredicateData` is currently a simple JSON-to-hex payload helper for MVP demo workflows.
- This package does not implement wallet logic or account abstraction.

