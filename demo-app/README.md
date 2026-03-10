# Demo App

Reviewer-focused React + MUI app for demonstrating session policy behavior.

## Purpose
- Show wallet connection status
- Show short-lived policy preview
- Demonstrate one valid action
- Demonstrate one blocked invalid action
- Surface clear human-readable status and logs

## Wallet connection behavior
- First tries injected providers (`window.fuel` / `window.fuelet`).
- If injection is unavailable, falls back to Fuel connector adapters (`@fuels/connectors`).
- Status panel and logs include connection failure reasons for quick debugging.

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

## Troubleshooting wallet detection
1. Ensure wallet extension is enabled for `localhost`.
2. Restart dev server: `npm run dev`.
3. Hard refresh the browser tab.
4. Check `Result Logs` for connector-level errors.

## Scope note
This app is a demo harness, not production wallet/account infrastructure.
