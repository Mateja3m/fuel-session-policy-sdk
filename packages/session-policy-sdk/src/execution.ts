import { SessionPolicyError } from './errors.js';
import {
  assertSessionPolicyLike,
  normalizeContractId,
  parseNonNegativeAmount,
  parsePositiveAmount
} from './guards.js';
import { validateSessionPolicy } from './policy.js';
import type {
  BuildSessionTransactionParams,
  SessionExecutionParams,
  SessionExecutionResult,
  SessionTransaction
} from './types.js';

function assertExecutor(value: unknown): asserts value is () => Promise<unknown> {
  if (typeof value !== 'function') {
    throw new SessionPolicyError('executor must be a function returning a Promise.');
  }
}

export function buildSessionTransaction(params: BuildSessionTransactionParams): SessionTransaction {
  if (!params || typeof params !== 'object') {
    throw new SessionPolicyError('buildSessionTransaction params must be an object.');
  }

  const policy = assertSessionPolicyLike(params.policy);
  const amount = parsePositiveAmount(params.amount, 'amount');
  const targetContract = normalizeContractId(String(params.targetContract));

  if (!policy.allowedContracts.includes(targetContract)) {
    throw new SessionPolicyError('Target contract is not allowed by the current session policy.');
  }

  return {
    targetContract,
    amount: amount.toString(),
    callData: params.callData,
    policyExpiresAt: policy.expiresAt
  };
}

export async function executeWithSession<T>(
  params: SessionExecutionParams<T>
): Promise<SessionExecutionResult<T>> {
  if (!params || typeof params !== 'object') {
    throw new SessionPolicyError('executeWithSession params must be an object.');
  }

  const policy = assertSessionPolicyLike(params.policy);
  const validation = validateSessionPolicy(policy);
  if (!validation.valid) {
    throw new SessionPolicyError(`Policy validation failed: ${validation.errors.join('; ')}`);
  }

  const targetContract = normalizeContractId(String(params.targetContract));
  if (!policy.allowedContracts.includes(targetContract)) {
    throw new SessionPolicyError('Session blocked action: target contract is not allowlisted.');
  }

  const maxSpend = parsePositiveAmount(policy.maxSpend, 'maxSpend');
  const currentSpent = parseNonNegativeAmount(params.currentSpent, 'currentSpent');
  const amount = parsePositiveAmount(params.amount, 'amount');

  if (currentSpent + amount > maxSpend) {
    throw new SessionPolicyError('Session blocked action: maxSpend would be exceeded.');
  }

  if (Date.now() >= policy.expiresAt) {
    throw new SessionPolicyError('Session blocked action: session has expired.');
  }

  assertExecutor(params.executor);
  const receipt = await params.executor();

  return {
    receipt,
    nextSpent: (currentSpent + amount).toString()
  };
}
