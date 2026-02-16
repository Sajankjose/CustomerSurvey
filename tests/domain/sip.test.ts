import { describe, expect, it } from 'vitest';
import { projectSip } from '@/domain/investment/sip';

describe('sip projection', () => {
  it('projects future value with monthly compounding', () => {
    const result = projectSip({ monthlySip: 5000, years: 10, annualReturnPctAssumption: 12 });
    expect(result.futureValue).toBeGreaterThan(1100000);
    expect(result.yearlyPoints.at(-1)?.year).toBe(10);
  });
});
