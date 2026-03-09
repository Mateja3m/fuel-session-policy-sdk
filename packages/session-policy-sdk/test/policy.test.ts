import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildSessionTransaction,
  createPredicatePayload,
  createSessionPolicy,
  decodePredicateData,
  encodePredicateData,
  executeWithSession,
  SessionPolicyError,
  validateSessionPolicy
} from '../src/index.js';

const FIXED_NOW = new Date('2026-03-08T10:00:00.000Z').getTime();
const SHORT_LIVED_EXPIRES_AT = FIXED_NOW + 5 * 60 * 1000;
const allowedContract = `0x${'1'.repeat(64)}`;
const blockedContract = `0x${'2'.repeat(64)}`;

function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createShortLivedPolicy() {
  return createSessionPolicy({
    expiresAt: SHORT_LIVED_EXPIRES_AT,
    maxSpend: '5',
    allowedContracts: [allowedContract]
  });
}

describe('session policy sdk hardening', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a short-lived valid policy for demo fixture use', () => {
    const policy = createShortLivedPolicy();
    const validation = validateSessionPolicy(policy);

    expect(validation.valid).toBe(true);
    expect(policy.expiresAt - FIXED_NOW).toBe(5 * 60 * 1000);
  });

  it('rejects expired session policy input', () => {
    expect(() =>
      createSessionPolicy({
        expiresAt: FIXED_NOW - 1,
        maxSpend: '5',
        allowedContracts: [allowedContract]
      })
    ).toThrow('expiresAt must be in the future.');
  });

  it('rejects invalid maxSpend', () => {
    expect(() =>
      createSessionPolicy({
        expiresAt: SHORT_LIVED_EXPIRES_AT,
        maxSpend: '1.5',
        allowedContracts: [allowedContract]
      })
    ).toThrow('maxSpend must be a positive integer string.');
  });

  it('rejects empty allowedContracts', () => {
    expect(() =>
      createSessionPolicy({
        expiresAt: SHORT_LIVED_EXPIRES_AT,
        maxSpend: '5',
        allowedContracts: []
      })
    ).toThrow('allowedContracts must include at least one contract ID.');
  });

  it('blocks wrong contract target', async () => {
    const policy = createShortLivedPolicy();

    expect(() =>
      buildSessionTransaction({
        policy,
        targetContract: blockedContract,
        amount: '1'
      })
    ).toThrow('Target contract is not allowed by the current session policy.');

    await expect(
      executeWithSession({
        policy,
        targetContract: blockedContract,
        amount: '1',
        currentSpent: '0',
        executor: async () => ({ txId: 'tx-1' })
      })
    ).rejects.toBeInstanceOf(SessionPolicyError);
  });

  it('rejects malformed policy payload', () => {
    expect(() => decodePredicateData('0x123')).toThrow('Encoded payload must be a valid 0x-prefixed hex string.');

    const wrongDomainPayload = `0x${toHex(JSON.stringify({
      domain: 'other-domain',
      version: '1',
      kind: 'predicate-policy',
      expiresAt: SHORT_LIVED_EXPIRES_AT,
      maxSpend: '5',
      allowedContracts: [allowedContract]
    }))}`;

    expect(() => decodePredicateData(wrongDomainPayload)).toThrow('Malformed policy payload: invalid domain.');
  });

  it('supports valid happy-path encode and execution flow', async () => {
    const policy = createShortLivedPolicy();
    const payload = createPredicatePayload(policy);

    expect(payload.domain).toBe('fuel-session-policy-sdk');

    const encoded = encodePredicateData(policy);
    const decoded = decodePredicateData(encoded);
    expect(decoded.allowedContracts).toEqual([allowedContract]);

    const result = await executeWithSession({
      policy,
      targetContract: allowedContract,
      amount: '2',
      currentSpent: '1',
      executor: async () => ({ txId: 'tx-ok' })
    });

    expect(result.nextSpent).toBe('3');
    expect(result.receipt).toEqual({ txId: 'tx-ok' });
  });

  it('blocks invalid action when maxSpend would be exceeded', async () => {
    const policy = createShortLivedPolicy();

    await expect(
      executeWithSession({
        policy,
        targetContract: allowedContract,
        amount: '5',
        currentSpent: '1',
        executor: async () => ({ txId: 'tx-over' })
      })
    ).rejects.toThrow('Session blocked action: maxSpend would be exceeded.');
  });
});
