import { describe, expect, it } from 'vitest';
import type { SessionPolicy } from '@idoa/fuel-session-policy-sdk';
import { evaluateDemoAction } from './demo-policy-helpers.js';

const allowedContract = `0x${'1'.repeat(64)}`;
const blockedContract = `0x${'2'.repeat(64)}`;
const now = new Date('2026-03-08T10:00:00.000Z').getTime();

const policy: SessionPolicy = {
  expiresAt: now + 60_000,
  maxSpend: '3',
  allowedContracts: [allowedContract]
};

describe('demo policy helpers', () => {
  it('allows happy-path action', () => {
    const result = evaluateDemoAction(policy, allowedContract, 1, 1, now);
    expect(result.allowed).toBe(true);
    expect(result.reason).toContain('passed');
  });

  it('blocks invalid contract action', () => {
    const result = evaluateDemoAction(policy, blockedContract, 1, 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('not in allowedContracts');
  });
});
