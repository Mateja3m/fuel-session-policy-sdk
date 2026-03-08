import { describe, expect, it } from 'vitest';
import {
  buildSessionTransaction,
  createSessionPolicy,
  encodePredicateData,
  executeWithSession,
  SessionPolicyError,
  validateSessionPolicy
} from '../src/index.js';

const allowedContract = `0x${'1'.repeat(64)}`;
const blockedContract = `0x${'2'.repeat(64)}`;

describe('session policy sdk', () => {
  it('creates and validates a policy', () => {
    const policy = createSessionPolicy({
      expiresAt: Date.now() + 60_000,
      maxSpend: '25',
      allowedContracts: [allowedContract, allowedContract]
    });

    const validation = validateSessionPolicy(policy);

    expect(validation.valid).toBe(true);
    expect(policy.allowedContracts).toHaveLength(1);
  });

  it('encodes predicate data', () => {
    const policy = createSessionPolicy({
      expiresAt: Date.now() + 60_000,
      maxSpend: 10,
      allowedContracts: [allowedContract]
    });

    expect(encodePredicateData(policy).startsWith('0x')).toBe(true);
  });

  it('builds a transaction for an allowed contract', () => {
    const policy = createSessionPolicy({
      expiresAt: Date.now() + 60_000,
      maxSpend: '10',
      allowedContracts: [allowedContract]
    });

    const tx = buildSessionTransaction({
      policy,
      targetContract: allowedContract,
      amount: '2'
    });

    expect(tx.amount).toBe('2');
  });

  it('blocks disallowed contract execution', async () => {
    const policy = createSessionPolicy({
      expiresAt: Date.now() + 60_000,
      maxSpend: '10',
      allowedContracts: [allowedContract]
    });

    await expect(
      executeWithSession({
        policy,
        targetContract: blockedContract,
        amount: '2',
        currentSpent: '0',
        executor: async () => ({ txId: 'abc' })
      })
    ).rejects.toBeInstanceOf(SessionPolicyError);
  });

  it('executes allowed action and tracks spend', async () => {
    const policy = createSessionPolicy({
      expiresAt: Date.now() + 60_000,
      maxSpend: '10',
      allowedContracts: [allowedContract]
    });

    const result = await executeWithSession({
      policy,
      targetContract: allowedContract,
      amount: '3',
      currentSpent: '1',
      executor: async () => ({ txId: 'ok' })
    });

    expect(result.nextSpent).toBe('4');
    expect(result.receipt).toEqual({ txId: 'ok' });
  });
});
