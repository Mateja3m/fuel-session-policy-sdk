# Maintenance Policy

## Project posture
This is a reference middleware SDK, maintained with solo-developer practicality in mind.

## Maintenance priorities
1. Keep core policy checks deterministic and easy to audit.
2. Keep demo flow stable for reviewer reproducibility.
3. Avoid broad scope expansion beyond MVP constraints.

## Change acceptance criteria
- Must not introduce wallet/multisig/paymaster/account-abstraction scope creep.
- Must include tests for any policy-path behavior change.
- Must preserve a simple local/testnet demo workflow.

## Security note
v1 is educational/reference quality and not intended for high-value production custody without additional review and controls.
