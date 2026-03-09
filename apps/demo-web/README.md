# Demo Web App

Reviewer-focused React + MUI app for demonstrating session policy behavior.

## Purpose
- Show wallet connection status
- Show short-lived policy preview
- Demonstrate one valid action
- Demonstrate one blocked invalid action
- Surface clear human-readable status and logs

## Run
From repository root:
- `npm install`
- `npm run setup:local`
- `npm run dev`

## Local mode
Use default `.env.local` values and local Fuel node.

## Testnet mode
Set:
- `VITE_FUEL_NETWORK=testnet`
- `VITE_FUEL_NODE_URL=https://testnet.fuel.network/v1/graphql`

## Scope note
This app is a demo harness, not production wallet/account infrastructure.
