export interface SessionPolicyInput {
  expiresAt: number;
  maxSpend: string | number;
  allowedContracts: string[];
  allowedAssets?: string[];
  allowedActions?: string[];
}

export interface SessionPolicy {
  expiresAt: number;
  maxSpend: string;
  allowedContracts: string[];
  allowedAssets?: string[];
  allowedActions?: string[];
}

export interface SessionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PredicatePolicyPayload {
  domain: 'fuel-session-policy-sdk';
  version: '1';
  kind: 'predicate-policy';
  expiresAt: number;
  maxSpend: string;
  allowedContracts: string[];
}

export interface SessionTransaction {
  targetContract: string;
  amount: string;
  callData?: string;
  policyExpiresAt: number;
}

export interface BuildSessionTransactionParams {
  policy: SessionPolicy;
  targetContract: string;
  amount: string | number;
  callData?: string;
}

export interface SessionExecutionParams<T = unknown> {
  policy: SessionPolicy;
  targetContract: string;
  amount: string | number;
  currentSpent: string | number;
  executor: () => Promise<T>;
}

export interface SessionExecutionResult<T = unknown> {
  receipt: T;
  nextSpent: string;
}
