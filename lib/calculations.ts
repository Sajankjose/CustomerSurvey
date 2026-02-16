export type AmortizationRow = {
  month: number;
  openingBalance: number;
  emi: number;
  interestPaid: number;
  principalPaid: number;
  closingBalance: number;
};

export type LoanScenario = {
  id: string;
  label: string;
  extraToLoan: number;
  color: string;
};

export type LoanResult = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: AmortizationRow[];
};

export function toMonthlyRate(annualRate: number): number {
  return annualRate / 12 / 100;
}

export function calculateEmi(principal: number, annualRate: number, years: number): number {
  const n = years * 12;
  const r = toMonthlyRate(annualRate);
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

export function buildSchedule(
  principal: number,
  annualRate: number,
  years: number,
  extraMonthly = 0
): LoanResult {
  const emi = calculateEmi(principal, annualRate, years);
  const r = toMonthlyRate(annualRate);
  let balance = principal;
  let month = 0;
  let totalInterest = 0;
  const schedule: AmortizationRow[] = [];

  while (balance > 0.01 && month < 1200) {
    month += 1;
    const interestPaid = balance * r;
    let principalPaid = emi - interestPaid + extraMonthly;
    if (principalPaid <= 0) principalPaid = 0;
    const closingBalance = Math.max(0, balance - principalPaid);
    const adjustedPrincipal = balance - closingBalance;
    const adjustedEmi = adjustedPrincipal + interestPaid;

    totalInterest += interestPaid;
    schedule.push({
      month,
      openingBalance: balance,
      emi: adjustedEmi,
      interestPaid,
      principalPaid: adjustedPrincipal,
      closingBalance
    });

    balance = closingBalance;
  }

  return {
    months: month,
    totalInterest,
    totalPaid: principal + totalInterest,
    schedule
  };
}

export function projectSipFutureValue(monthlyInvestment: number, annualRate = 12, months = 120): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return monthlyInvestment * months;
  return monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}
