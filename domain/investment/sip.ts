export type SipInput = {
  monthlySip: number;
  years: number;
  annualReturnPctAssumption?: number;
};

export type SipProjection = {
  futureValue: number;
  yearlyPoints: Array<{ year: number; value: number }>;
};

export function projectSip(input: SipInput): SipProjection {
  const monthlySip = Math.max(0, input.monthlySip);
  const years = Math.max(0, input.years);
  const annual = input.annualReturnPctAssumption ?? 12;
  const monthlyRate = annual / 1200;
  const months = Math.round(years * 12);

  let value = 0;
  const yearlyPoints: Array<{ year: number; value: number }> = [{ year: 0, value: 0 }];

  for (let month = 1; month <= months; month += 1) {
    value = (value + monthlySip) * (1 + monthlyRate);
    if (month % 12 === 0 || month === months) {
      yearlyPoints.push({ year: month / 12, value });
    }
  }

  return { futureValue: value, yearlyPoints };
}
