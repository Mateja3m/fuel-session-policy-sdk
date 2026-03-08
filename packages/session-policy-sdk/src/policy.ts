import { SessionPolicyError } from './errors.js';
import type {
  SessionPolicy,
  SessionPolicyInput,
  SessionValidationResult
} from './types.js';

const CONTRACT_ID_REGEX = /^0x[a-fA-F0-9]{64}$/;

function normalizeContractId(contractId: string): string {
  return contractId.trim().toLowerCase();
}

function normalizeDecimal(value: string | number): string {
  if (typeof value === 'number') {
    return value.toString();
  }

  return value.trim();
}

export function createSessionPolicy(input: SessionPolicyInput): SessionPolicy {
  const policy: SessionPolicy = {
    expiresAt: input.expiresAt,
    maxSpend: normalizeDecimal(input.maxSpend),
    allowedContracts: [...new Set(input.allowedContracts.map(normalizeContractId))]
  };

  // TODO(phase-2): enforce explicit allowlist semantics for assets/actions.
  if (input.allowedAssets) {
    policy.allowedAssets = [...new Set(input.allowedAssets.map((asset) => asset.trim().toLowerCase()))];
  }

  if (input.allowedActions) {
    policy.allowedActions = [...new Set(input.allowedActions.map((action) => action.trim()))];
  }

  const validation = validateSessionPolicy(policy);
  if (!validation.valid) {
    throw new SessionPolicyError(validation.errors.join('; '));
  }

  return policy;
}

export function validateSessionPolicy(policy: SessionPolicy): SessionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isFinite(policy.expiresAt)) {
    errors.push('expiresAt must be a finite UNIX timestamp in milliseconds.');
  } else if (policy.expiresAt <= Date.now()) {
    errors.push('expiresAt must be in the future.');
  }

  const spend = Number(policy.maxSpend);
  if (!policy.maxSpend || Number.isNaN(spend)) {
    errors.push('maxSpend must be a numeric value.');
  } else if (spend <= 0) {
    errors.push('maxSpend must be greater than zero.');
  }

  if (!Array.isArray(policy.allowedContracts) || policy.allowedContracts.length === 0) {
    errors.push('allowedContracts must include at least one contract ID.');
  } else {
    for (const contract of policy.allowedContracts) {
      if (!CONTRACT_ID_REGEX.test(contract)) {
        errors.push(`Invalid contract ID format: ${contract}`);
      }
    }
  }

  if (policy.allowedAssets && policy.allowedAssets.length === 0) {
    warnings.push('allowedAssets is present but empty; no asset filtering will be applied.');
  }

  if (policy.allowedActions && policy.allowedActions.length === 0) {
    warnings.push('allowedActions is present but empty; no action filtering will be applied.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
