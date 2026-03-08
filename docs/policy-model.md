# Policy Model

## Session lifecycle
1. User approves one session policy.
2. dApp reuses that policy for multiple actions.
3. Each action is validated against policy constraints.
4. Session ends when expired, exceeded spend limit, or manually discarded.

## Policy fields
- `expiresAt`: UNIX timestamp in milliseconds when session becomes invalid.
- `maxSpend`: max total spend amount as decimal string.
- `allowedContracts`: list of contract IDs allowed during the session.
- `allowedAssets` (extension point): optional future asset restriction list.
- `allowedActions` (extension point): optional future action-level rules.

## Validation rules
- `expiresAt` must be in the future.
- `maxSpend` must be a positive numeric string.
- `allowedContracts` must contain at least one valid contract ID string.

## Current limitations
- No persistent on-chain storage for policy state.
- No signature aggregation.
- No revocation contract.
- No per-method ABI validation yet.
