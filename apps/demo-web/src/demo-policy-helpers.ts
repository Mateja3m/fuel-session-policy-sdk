import type { SessionPolicy } from '@idoa/fuel-session-policy-sdk';

export interface ActionEvaluation {
  allowed: boolean;
  reason: string;
}

export function evaluateDemoAction(
  policy: SessionPolicy | null,
  targetContract: string,
  amount: number,
  currentSpent: number,
  nowMs: number
): ActionEvaluation {
  if (!policy) {
    return { allowed: false, reason: 'No active policy.' };
  }

  if (!policy.allowedContracts.includes(targetContract.toLowerCase())) {
    return { allowed: false, reason: 'Target contract is not in allowedContracts.' };
  }

  if (nowMs >= policy.expiresAt) {
    return { allowed: false, reason: 'Session policy is expired.' };
  }

  if (currentSpent + amount > Number(policy.maxSpend)) {
    return { allowed: false, reason: 'Action would exceed maxSpend.' };
  }

  return { allowed: true, reason: 'All policy checks passed.' };
}
