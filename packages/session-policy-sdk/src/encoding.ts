import { SessionPolicyError } from './errors.js';
import { assertSessionPolicyLike, parsePositiveAmount } from './guards.js';
import type { PredicatePolicyPayload, SessionPolicy } from './types.js';

const PAYLOAD_DOMAIN = 'fuel-session-policy-sdk';
const PAYLOAD_VERSION = '1';
const PAYLOAD_KIND = 'predicate-policy';

function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): string {
  if (!/^0x[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) {
    throw new SessionPolicyError('Encoded payload must be a valid 0x-prefixed hex string.');
  }

  const bytes = new Uint8Array((hex.length - 2) / 2);
  for (let i = 2, index = 0; i < hex.length; i += 2, index += 1) {
    bytes[index] = Number.parseInt(hex.slice(i, i + 2), 16);
  }

  return new TextDecoder().decode(bytes);
}

export function createPredicatePayload(policy: SessionPolicy): PredicatePolicyPayload {
  const normalized = assertSessionPolicyLike(policy);
  parsePositiveAmount(normalized.maxSpend, 'maxSpend');

  return {
    domain: PAYLOAD_DOMAIN,
    version: PAYLOAD_VERSION,
    kind: PAYLOAD_KIND,
    expiresAt: normalized.expiresAt,
    maxSpend: normalized.maxSpend,
    allowedContracts: normalized.allowedContracts
  };
}

export function encodePredicateData(policy: SessionPolicy): string {
  try {
    const payload = JSON.stringify(createPredicatePayload(policy));
    return `0x${toHex(payload)}`;
  } catch (error) {
    throw new SessionPolicyError(`Failed to encode predicate data: ${String(error)}`);
  }
}

export function decodePredicateData(encoded: string): PredicatePolicyPayload {
  try {
    const decoded = JSON.parse(fromHex(encoded)) as Partial<PredicatePolicyPayload>;

    if (decoded.domain !== PAYLOAD_DOMAIN) {
      throw new SessionPolicyError('Malformed policy payload: invalid domain.');
    }

    if (decoded.version !== PAYLOAD_VERSION) {
      throw new SessionPolicyError('Malformed policy payload: unsupported version.');
    }

    if (decoded.kind !== PAYLOAD_KIND) {
      throw new SessionPolicyError('Malformed policy payload: invalid kind.');
    }

    const policy = assertSessionPolicyLike({
      expiresAt: decoded.expiresAt,
      maxSpend: decoded.maxSpend,
      allowedContracts: decoded.allowedContracts
    });

    return {
      domain: PAYLOAD_DOMAIN,
      version: PAYLOAD_VERSION,
      kind: PAYLOAD_KIND,
      expiresAt: policy.expiresAt,
      maxSpend: policy.maxSpend,
      allowedContracts: policy.allowedContracts
    };
  } catch (error) {
    if (error instanceof SessionPolicyError) {
      throw error;
    }

    throw new SessionPolicyError(`Malformed policy payload: ${String(error)}`);
  }
}
