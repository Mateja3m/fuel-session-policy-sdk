# Testing

## Local setup
1. Install dependencies: `npm install`
2. Prepare env files: `npm run setup:local`
3. Start local Fuel node (separate terminal, per Fuel docs).
4. Run tests: `npm test`
5. Run demo: `npm run dev`

## Simulate demo flow
1. Connect a compatible wallet in the demo app.
2. Generate default session policy.
3. Click approve session.
4. Execute valid action and verify success log.

## Verify blocked invalid action
1. Keep the same approved session.
2. Execute invalid action button.
3. Confirm app logs policy validation failure for disallowed contract.
