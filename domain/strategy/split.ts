export function splitStrategy(extraMoney: number, prepaymentPct: number) {
  const safeExtra = Math.max(0, extraMoney);
  const safePct = Math.min(100, Math.max(0, prepaymentPct));
  const prepayment = safeExtra * (safePct / 100);
  const sip = safeExtra - prepayment;
  return { prepayment, sip, prepaymentPct: safePct, sipPct: 100 - safePct };
}
