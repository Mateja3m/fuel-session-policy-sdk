import { SessionPolicyError } from './errors.js';
import type { SessionPolicy } from './types.js';

function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function encodePredicateData(policy: SessionPolicy): string {
  try {
    const payload = JSON.stringify({
      expiresAt: policy.expiresAt,
      maxSpend: policy.maxSpend,
      allowedContracts: policy.allowedContracts
    });

    return `0x${toHex(payload)}`;
  } catch (error) {
    throw new SessionPolicyError(`Failed to encode predicate data: ${String(error)}`);
  }
}
