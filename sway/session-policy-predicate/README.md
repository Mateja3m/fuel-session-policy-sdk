# Session Policy Predicate (Reference)

This is a deliberately small Sway predicate used as a reference for grant/demo discussions.

## What it validates
- expiry (`provided_expiry`)
- allowed contract target (`provided_allowed_contract`)
- max spend (`provided_max_spend`)

## Build
From repository root:
- `npm run fuel:build`

Or directly:
- `cd sway/session-policy-predicate && forc build`

## Intentionally out of scope (MVP)
- Policy storage
- Revocation registry
- On-chain session lifecycle state
- Signature aggregation and account abstraction

The TypeScript SDK is the main product surface; this predicate exists to show a minimal Fuel-native validation reference.
