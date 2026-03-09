# Compatibility

## Supported stack (current MVP)
- Node.js: 20.x
- npm: 10.x
- TypeScript: 5.8.x
- Vitest: 3.2.x
- Vite: 6.2+
- fuels (peer): >=0.100.0 <0.110.0

## Fuel ecosystem assumptions
- Fuel wallet extension exposing `window.fuel` for demo connection.
- Local GraphQL node URL for local mode.
- Fuel testnet GraphQL URL for public demo mode.

## Versioning policy
- Critical dependencies are pinned or constrained in `package.json`.
- Compatibility updates should land with:
  1. test updates,
  2. changelog note,
  3. README compatibility section update.

## Not guaranteed in MVP
- Backward compatibility for experimental placeholder fields.
- Full production hardening for high-value custody flows.
