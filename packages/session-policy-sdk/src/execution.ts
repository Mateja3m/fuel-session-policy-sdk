import { SessionPolicyError } from './errors.js';
import { validateSessionPolicy } from './policy.js';
import type {
  BuildSessionTransactionParams,
  SessionExecutionParams,
  SessionExecutionResult,
  SessionTransaction
} from './types.js';

function toNumber(value: string | number, label: string): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    throw new SessionPolicyError(`${label} must be numeric.`);
  }

  return numeric;
}

export function buildSessionTransaction(params: BuildSessionTransactionParams): SessionTransaction {
  const amount = toNumber(params.amount, 'amount');

  if (!params.policy.allowedContracts.includes(params.targetContract.toLowerCase())) {
    throw new SessionPolicyError('Target contract is not allowed by the current session policy.');
  }

  return {
    targetContract: params.targetContract.toLowerCase(),
    amount: amount.toString(),
    callData: params.callData,
    policyExpiresAt: params.policy.expiresAt
  };
}

export async function executeWithSession<T>(
  params: SessionExecutionParams<T>
): Promise<SessionExecutionResult<T>> {
  const validation = validateSessionPolicy(params.policy);
  if (!validation.valid) {
    throw new SessionPolicyError(`Policy validation failed: ${validation.errors.join('; ')}`);
  }

  const targetContract = params.targetContract.toLowerCase();
  if (!params.policy.allowedContracts.includes(targetContract)) {
    throw new SessionPolicyError('Session blocked action: target contract is not allowlisted.');
  }

  const maxSpend = toNumber(params.policy.maxSpend, 'maxSpend');
  const currentSpent = toNumber(params.currentSpent, 'currentSpent');
  const amount = toNumber(params.amount, 'amount');

  if (currentSpent + amount > maxSpend) {
    throw new SessionPolicyError('Session blocked action: maxSpend would be exceeded.');
  }

  if (Date.now() >= params.policy.expiresAt) {
    throw new SessionPolicyError('Session blocked action: session has expired.');
  }

  const receipt = await params.executor();

  return {
    receipt,
    nextSpent: (currentSpent + amount).toString()
  };
}
