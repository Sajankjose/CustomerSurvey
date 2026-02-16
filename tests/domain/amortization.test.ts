import { describe, expect, it } from 'vitest';
import { buildAmortization, calculateEmi, compareAgainstBaseline } from '@/domain/loan/amortization';

describe('amortization engine', () => {
  it('calculates emi and schedule', () => {
    const emi = calculateEmi(1000000, 10, 10);
    expect(emi).toBeGreaterThan(10000);

    const baseline = buildAmortization({ principal: 1000000, annualInterestRatePct: 10, tenureYears: 10, extraMonthlyPayment: 0 });
    expect(baseline.monthsToClose).toBe(120);
    expect(baseline.schedule[0].openingBalance).toBe(1000000);
  });

  it('saves interest and tenure with extra payment', () => {
    const base = buildAmortization({ principal: 2000000, annualInterestRatePct: 8.5, tenureYears: 15, extraMonthlyPayment: 0 });
    const variant = buildAmortization({ principal: 2000000, annualInterestRatePct: 8.5, tenureYears: 15, extraMonthlyPayment: 15000 });
    const compare = compareAgainstBaseline(base, variant);

    expect(compare.monthsSaved).toBeGreaterThan(0);
    expect(compare.interestSaved).toBeGreaterThan(0);
  });
});
