import { SessionPolicyError } from './errors.js';
import {
  assertFiniteFutureTimestamp,
  isContractId,
  normalizeAndValidateAllowedContracts,
  normalizeContractId,
  parsePositiveAmount
} from './guards.js';
import type {
  SessionPolicy,
  SessionPolicyInput,
  SessionValidationResult
} from './types.js';

function normalizeAssets(allowedAssets: string[] | undefined): string[] | undefined {
  if (!Array.isArray(allowedAssets)) {
    return undefined;
  }

  return [...new Set(allowedAssets.map((asset) => asset.trim().toLowerCase()))]
    .filter((asset) => asset.length > 0);
}

function normalizeActions(allowedActions: string[] | undefined): string[] | undefined {
  if (!Array.isArray(allowedActions)) {
    return undefined;
  }

  return [...new Set(allowedActions.map((action) => action.trim()))]
    .filter((action) => action.length > 0);
}

export function createSessionPolicy(input: SessionPolicyInput): SessionPolicy {
  if (!input || typeof input !== 'object') {
    throw new SessionPolicyError('Session policy input must be an object.');
  }

  const policy: SessionPolicy = {
    expiresAt: assertFiniteFutureTimestamp(input.expiresAt, 'expiresAt'),
    maxSpend: parsePositiveAmount(input.maxSpend, 'maxSpend').toString(),
    allowedContracts: normalizeAndValidateAllowedContracts(input.allowedContracts)
      .map((contract) => normalizeContractId(contract))
  };

  const normalizedAssets = normalizeAssets(input.allowedAssets);
  const normalizedActions = normalizeActions(input.allowedActions);

  if (normalizedAssets) {
    policy.allowedAssets = normalizedAssets;
  }

  if (normalizedActions) {
    policy.allowedActions = normalizedActions;
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

  if (!policy || typeof policy !== 'object') {
    return {
      valid: false,
      errors: ['policy must be an object.'],
      warnings
    };
  }

  if (typeof policy.expiresAt !== 'number' || !Number.isFinite(policy.expiresAt)) {
    errors.push('expiresAt must be a finite UNIX timestamp in milliseconds.');
  } else if (policy.expiresAt <= Date.now()) {
    errors.push('expiresAt must be in the future.');
  }

  try {
    parsePositiveAmount(policy.maxSpend, 'maxSpend');
  } catch (error) {
    errors.push(String((error as Error).message));
  }

  if (!Array.isArray(policy.allowedContracts) || policy.allowedContracts.length === 0) {
    errors.push('allowedContracts must include at least one contract ID.');
  } else {
    for (const contract of policy.allowedContracts) {
      const normalized = String(contract).trim().toLowerCase();
      if (!isContractId(normalized)) {
        errors.push(`Invalid contract ID format: ${contract}`);
      }
    }
  }

  if (Array.isArray(policy.allowedAssets) && policy.allowedAssets.length === 0) {
    warnings.push('allowedAssets is present but empty; no asset filtering will be applied.');
  }

  if (Array.isArray(policy.allowedActions) && policy.allowedActions.length === 0) {
    warnings.push('allowedActions is present but empty; no action filtering will be applied.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
