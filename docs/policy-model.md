# Policy Model

## Session lifecycle
1. User approves one temporary policy.
2. dApp can execute repeated actions if policy checks pass.
3. Session is blocked when any constraint is violated.
4. Session naturally expires at `expiresAt`.

## Core fields
- `expiresAt`: UNIX timestamp in milliseconds.
- `maxSpend`: positive integer string representing total allowed spend.
- `allowedContracts`: strict allowlist of Fuel contract IDs (`0x` + 64 hex).

## Extension placeholders
- `allowedAssets`
- `allowedActions`

These are placeholders only in MVP and do not provide full enforcement semantics yet.

## Validation rules
- Policy object must be structurally valid.
- `expiresAt` must be finite and in the future.
- `maxSpend` must be positive integer string.
- `allowedContracts` must be non-empty and format-valid.

## Payload model
Encoded predicate payload is domain-separated:
- `domain: fuel-session-policy-sdk`
- `version: 1`
- `kind: predicate-policy`

This reduces accidental cross-format parsing and version ambiguity.

## Limitations
- No persistent on-chain session state
- No on-chain revocation primitive
- No full ABI/action-level enforcement
- Not intended for high-value production custody in v1
