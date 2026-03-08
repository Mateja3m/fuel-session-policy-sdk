# Architecture

## Why TypeScript-first
This project keeps almost all product logic in TypeScript so the core policy model is easy to iterate, test, and integrate into frontend dApps.

## Why Sway is intentionally minimal
A single reference predicate is included only to show how policy checks map to on-chain validation. This avoids overbuilding while giving reviewers a concrete Fuel-native component.

## Predicate in flow
1. dApp builds policy in TS SDK.
2. SDK validates and encodes predicate data.
3. Demo executes against allowed or blocked action paths.
4. Predicate acts as reference for expiry, contract target, and spend checks.

## Intentionally not included
- Wallet implementation
- Multisig
- Paymaster
- Full account abstraction framework
- Revocation/registry/storage contracts
- Backend relayer services
