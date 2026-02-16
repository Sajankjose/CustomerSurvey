export type AmortizationInput = {
  principal: number;
  annualInterestRatePct: number;
  tenureYears: number;
  extraMonthlyPayment: number;
};

export type AmortizationRow = {
  monthIndex: number;
  openingBalance: number;
  interest: number;
  principal: number;
  extraPayment: number;
  closingBalance: number;
};

export type AmortizationResult = {
  derivedEmi: number;
  schedule: AmortizationRow[];
  totalInterest: number;
  totalPaid: number;
  monthsToClose: number;
};

const clamp = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function calculateEmi(principal: number, annualRatePct: number, tenureYears: number): number {
  const p = clamp(principal);
  const n = Math.max(1, Math.round(tenureYears * 12));
  const r = annualRatePct / 1200;
  if (r === 0) return p / n;
  const factor = Math.pow(1 + r, n);
  return (p * r * factor) / (factor - 1);
}

export function buildAmortization(input: AmortizationInput): AmortizationResult {
  const principal = clamp(input.principal);
  const extra = Math.max(0, input.extraMonthlyPayment);
  const emi = calculateEmi(principal, input.annualInterestRatePct, input.tenureYears);
  const monthlyRate = input.annualInterestRatePct / 1200;
  const schedule: AmortizationRow[] = [];

  let balance = principal;
  let monthIndex = 0;
  let totalInterest = 0;

  while (balance > 0.01 && monthIndex < 1200) {
    monthIndex += 1;
    const openingBalance = balance;
    const interest = openingBalance * monthlyRate;
    const principalFromEmi = Math.max(0, emi - interest);
    const totalPrincipalPaid = Math.min(openingBalance, principalFromEmi + extra);
    const extraPayment = Math.max(0, totalPrincipalPaid - principalFromEmi);
    const closingBalance = Math.max(0, openingBalance - totalPrincipalPaid);

    schedule.push({
      monthIndex,
      openingBalance,
      interest,
      principal: totalPrincipalPaid - extraPayment,
      extraPayment,
      closingBalance
    });

    totalInterest += interest;
    balance = closingBalance;
  }

  return {
    derivedEmi: emi,
    schedule,
    totalInterest,
    totalPaid: principal + totalInterest,
    monthsToClose: monthIndex
  };
}

export function compareAgainstBaseline(base: AmortizationResult, variant: AmortizationResult) {
  return {
    monthsSaved: Math.max(0, base.monthsToClose - variant.monthsToClose),
    interestSaved: Math.max(0, base.totalInterest - variant.totalInterest)
  };
}
