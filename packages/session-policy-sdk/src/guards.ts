import { SessionPolicyError } from './errors.js';
import type { SessionPolicy } from './types.js';

const CONTRACT_ID_REGEX = /^0x[a-fA-F0-9]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeContractId(contractId: string): string {
  return contractId.trim().toLowerCase();
}

export function assertFiniteFutureTimestamp(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new SessionPolicyError(`${label} must be a finite UNIX timestamp in milliseconds.`);
  }

  return value;
}

export function parsePositiveAmount(value: unknown, label: string): bigint {
  const normalized = typeof value === 'number'
    ? value.toString()
    : typeof value === 'string'
      ? value.trim()
      : '';

  if (!/^\d+$/.test(normalized)) {
    throw new SessionPolicyError(`${label} must be a positive integer string.`);
  }

  const parsed = BigInt(normalized);
  if (parsed <= 0n) {
    throw new SessionPolicyError(`${label} must be greater than zero.`);
  }

  return parsed;
}

export function parseNonNegativeAmount(value: unknown, label: string): bigint {
  const normalized = typeof value === 'number'
    ? value.toString()
    : typeof value === 'string'
      ? value.trim()
      : '';

  if (!/^\d+$/.test(normalized)) {
    throw new SessionPolicyError(`${label} must be a non-negative integer string.`);
  }

  return BigInt(normalized);
}

export function normalizeAndValidateAllowedContracts(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new SessionPolicyError('allowedContracts must include at least one contract ID.');
  }

  const normalized = [...new Set(value.map((contract) => String(contract).trim().toLowerCase()))]
    .filter((contract) => contract.length > 0);

  if (normalized.length === 0) {
    throw new SessionPolicyError('allowedContracts must include at least one non-empty contract ID.');
  }

  for (const contract of normalized) {
    if (!CONTRACT_ID_REGEX.test(contract)) {
      throw new SessionPolicyError(`Invalid contract ID format: ${contract}`);
    }
  }

  return normalized;
}

export function assertSessionPolicyLike(value: unknown, label = 'policy'): SessionPolicy {
  if (!isRecord(value)) {
    throw new SessionPolicyError(`${label} must be an object.`);
  }

  const expiresAt = assertFiniteFutureTimestamp(value.expiresAt, 'expiresAt');
  const maxSpend = parsePositiveAmount(value.maxSpend, 'maxSpend').toString();
  const allowedContracts = normalizeAndValidateAllowedContracts(value.allowedContracts);

  const policy: SessionPolicy = {
    expiresAt,
    maxSpend,
    allowedContracts
  };

  if (Array.isArray(value.allowedAssets)) {
    policy.allowedAssets = [...new Set(value.allowedAssets.map((asset) => String(asset).trim().toLowerCase()))]
      .filter((asset) => asset.length > 0);
  }

  if (Array.isArray(value.allowedActions)) {
    policy.allowedActions = [...new Set(value.allowedActions.map((action) => String(action).trim()))]
      .filter((action) => action.length > 0);
  }

  return policy;
}

export function isContractId(value: string): boolean {
  return CONTRACT_ID_REGEX.test(value);
}
