# Testing

## Local setup
1. `npm install`
2. `npm run setup:local`
3. Start local Fuel node separately
4. `npm run typecheck`
5. `npm test`
6. `npm run dev`

## SDK tests (Vitest)
Current coverage includes:
- expired session policy
- invalid `maxSpend`
- empty `allowedContracts`
- wrong contract target
- malformed policy payload
- valid happy-path flow
- blocked invalid action

## Demo flow verification
1. Connect Fuel wallet in demo app.
2. Generate short-lived policy.
3. Approve session.
4. Run valid action and confirm success status.
5. Run invalid action and confirm blocked status/reason.

## Testnet mode
1. Set `VITE_FUEL_NETWORK=testnet` and testnet node URL in `.env.local`.
2. Fund wallet with faucet.
3. Repeat same flow and confirm behavior parity with local mode.

## Reviewer note
The demo deliberately uses readable status and logs to make happy-path and failure-path outcomes obvious in screenshots/videos.
