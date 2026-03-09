# Architecture

## Overview
The repository is designed as a TypeScript-first middleware SDK with one minimal Sway reference predicate.

## Why TypeScript-first
- Most policy logic lives in TypeScript for fast iteration and easier solo maintenance.
- Validation and session execution checks can be tested deterministically with Vitest.
- dApp developers can integrate without deep Sway contract complexity.

## Why Sway is intentionally minimal
- One small predicate demonstrates Fuel-native validation mapping.
- It checks expiry, allowed contract target, and max spend only.
- No storage-based state, registry, or revocation logic is included.

## Runtime flow
1. dApp creates a session policy via SDK.
2. SDK validates, normalizes, and optionally encodes payload for predicate usage.
3. dApp executes actions through SDK guardrails.
4. Demo shows one allowed action and one blocked action path.

## Solo-maintainability choices
- Small focused modules (`policy`, `execution`, `encoding`, `guards`).
- Deterministic tests with fixed timestamps.
- CI runs typecheck, tests, and build on every push/PR.

## Intentionally not included
- Wallet, multisig, paymaster, or full account abstraction framework
- Backend relayer services
- On-chain revocation/registry systems
- High-value custody guarantees for v1
