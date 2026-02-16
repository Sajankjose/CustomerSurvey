'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth } from 'date-fns';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildAmortization, compareAgainstBaseline } from '@/domain/loan/amortization';
import { projectSip } from '@/domain/investment/sip';
import { splitStrategy } from '@/domain/strategy/split';
import { inr } from '@/lib/format';
import { tokens } from '@/lib/tokens';
import { useFlowStore } from '@/store/flowStore';
import BalanceChart from './BalanceChart';
import { sanitizePhone, sanitizeText } from '@/infrastructure/sanitize';
import { track } from '@/infrastructure/analytics';

const schema = z.object({
  name: z.string().min(2, 'Just one small detail missing 🙂'),
  loanType: z.string(),
  remainingAmount: z.coerce.number().min(1000, 'That doesn’t look quite right.'),
  remainingYears: z.coerce.number().min(1, 'That doesn’t look quite right.'),
  interestRate: z.coerce.number().min(0.1, 'That doesn’t look quite right.'),
  extraMonthlyAmount: z.coerce.number().min(0, 'That doesn’t look quite right.'),
  split: z.coerce.number().min(0).max(100),
  email: z.string().email('That doesn’t look quite right.').optional().or(z.literal('')),
  mobile: z.string().optional(),
  referral: z.string().optional(),
  callbackDate: z.date().nullable(),
  callbackTime: z.string().optional()
});

type FormValues = z.infer<typeof schema>;
const steps = ['Entry Name', 'Loan Type', 'Remaining Amount', 'Remaining Years', 'Interest Rate', 'Extra Monthly Amount', 'Strategy Split', 'Magic Impact', 'Contact Details', 'Detailed Plan', 'Detailed Calculation', 'Callback Scheduling', 'Referral/Share', 'Confirmation'];
const slots = ['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'];

export default function LoanClosurePlanner() {
  const { step, setStep, tab, setTab } = useFlowStore();
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      loanType: 'Home Loan',
      remainingAmount: 5000000,
      remainingYears: 16,
      interestRate: 8.4,
      extraMonthlyAmount: 25000,
      split: 40,
      email: '',
      mobile: '',
      referral: '',
      callbackDate: null,
      callbackTime: ''
    },
    mode: 'onChange'
  });

  const values = form.watch();
  const split = splitStrategy(values.extraMonthlyAmount, values.split);
  const baseline = useMemo(() => buildAmortization({ principal: values.remainingAmount, annualInterestRatePct: values.interestRate, tenureYears: values.remainingYears, extraMonthlyPayment: 0 }), [values.remainingAmount, values.interestRate, values.remainingYears]);
  const prepay = useMemo(() => buildAmortization({ principal: values.remainingAmount, annualInterestRatePct: values.interestRate, tenureYears: values.remainingYears, extraMonthlyPayment: split.prepayment }), [values.remainingAmount, values.interestRate, values.remainingYears, split.prepayment]);
  const compare = compareAgainstBaseline(baseline, prepay);
  const sipProjection = projectSip({ monthlySip: split.sip, years: prepay.monthsToClose / 12, annualReturnPctAssumption: 12 });

  const loanSeries = [
    { id: 'baseline', name: 'Regular payment', color: '#9A9A9A', values: baseline.schedule.map((r) => ({ x: r.monthIndex, y: r.closingBalance })) },
    { id: 'prepay', name: 'Extra prepayment', color: '#3A3A3A', values: prepay.schedule.map((r) => ({ x: r.monthIndex, y: r.closingBalance })) },
    { id: 'teal', name: 'Extra + SIP', color: '#07877B', values: prepay.schedule.map((r) => ({ x: r.monthIndex, y: r.closingBalance })) }
  ];

  const sipSeries = [{ id: 'sip', name: 'SIP illustration', color: '#07877B', values: sipProjection.yearlyPoints.map((p) => ({ x: p.year, y: p.value })) }];

  const onContinue = async () => {
    const ok = await form.trigger();
    if (!ok) return;
    track('step_continue', { step });
    setStep(Math.min(step + 1, steps.length - 1));
  };

  const onBack = () => setStep(Math.max(step - 1, 0));

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-appBg px-6 py-8 text-appText">
      <div className="mb-6 text-sm text-appSecondary">Step {step + 1} / {steps.length}</div>
      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: tokens.motion.screenTransition, ease: tokens.motion.ease }} className="rounded-card border border-appHairline bg-white p-6">
          <h1 className="mb-2 text-2xl font-semibold">{steps[step]}</h1>
          <p className="mb-6 text-sm text-appHelper">Approximate values are perfectly fine.</p>
          {step === 0 && <Input form={form} name="name" label="Your name" />}
          {step === 1 && <SelectLoanType form={form} />}
          {step === 2 && <Input form={form} name="remainingAmount" label="Remaining amount (₹)" type="number" />}
          {step === 3 && <Input form={form} name="remainingYears" label="Remaining years" type="number" />}
          {step === 4 && <Input form={form} name="interestRate" label="Interest rate (%)" type="number" />}
          {step === 5 && <Input form={form} name="extraMonthlyAmount" label="Extra monthly amount (₹)" type="number" />}
          {step === 6 && (
            <div>
              <label className="mb-2 block text-sm">Prepayment {values.split}% · SIP {100 - values.split}%</label>
              <input aria-label="Strategy split" type="range" min={0} max={100} className="h-11 w-full" {...form.register('split', { valueAsNumber: true })} />
            </div>
          )}
          {step === 7 && (
            <div className="space-y-3">
              <p className="text-xl font-semibold">Save {Math.round(compare.monthsSaved / 12)} years and {inr(compare.interestSaved)}</p>
              <p className="text-sm text-appSecondary">SIP projection: {inr(sipProjection.futureValue)} · Returns are market-linked and illustrative.</p>
            </div>
          )}
          {step === 8 && (
            <div className="space-y-3">
              <Input form={form} name="email" label="Email" />
              <Input form={form} name="mobile" label="Mobile" sanitize={sanitizePhone} />
            </div>
          )}
          {step === 9 && (
            <div className="space-y-4 text-sm">
              <p className="rounded-input border border-appHairline p-4">Derived EMI: {inr(prepay.derivedEmi)}. Interest saved with prepayment: {inr(compare.interestSaved)}.</p>
              <p className="text-appSecondary">Obligation-free discussion.</p>
            </div>
          )}
          {step === 10 && (
            <div className="space-y-4">
              <div className="flex gap-2 rounded-input bg-[#fafafa] p-1">
                <button className={`h-11 flex-1 rounded-input ${tab === 'loan' ? 'bg-white' : ''}`} onClick={() => setTab('loan')}>Loan Balance</button>
                <button className={`h-11 flex-1 rounded-input ${tab === 'sip' ? 'bg-white' : ''}`} onClick={() => setTab('sip')}>SIP Illustration</button>
              </div>
              <BalanceChart key={tab} mode={tab} series={tab === 'loan' ? loanSeries : sipSeries} />
              <details className="rounded-input border border-appHairline p-4 text-sm">
                <summary>Prepayment explainer</summary>
                Loan prepayment reduces your outstanding principal. This lowers total interest and shortens tenure.
              </details>
              <details className="rounded-input border border-appHairline p-4 text-sm">
                <summary>SIP explainer</summary>
                A SIP lets you invest fixed amounts regularly in mutual funds. Benefits include rupee-cost averaging and compounding. Returns are market-linked and illustrative.
              </details>
            </div>
          )}
          {step === 11 && (
            <div className="space-y-4">
              <CalendarView month={calendarMonth} selected={values.callbackDate} onPrev={() => setCalendarMonth((m) => addMonths(m, -1))} onNext={() => setCalendarMonth((m) => addMonths(m, 1))} onSelect={(date) => form.setValue('callbackDate', date)} />
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button key={slot} className={`h-11 rounded-button border ${values.callbackTime === slot ? 'border-appAccent text-appAccent' : 'border-appHairline'}`} onClick={() => form.setValue('callbackTime', slot)}>{slot}</button>
                ))}
              </div>
              {values.callbackDate && values.callbackTime && <p className="text-sm text-appSecondary">We’ll connect with you on {format(values.callbackDate, 'PPP')}, {values.callbackTime}</p>}
            </div>
          )}
          {step === 12 && <ShareCardGenerator name={values.name} saved={compare.interestSaved} />}
          {step === 13 && <p className="text-lg">You’re set. We’ll keep this plan client-side unless you choose to submit details later.</p>}
          <p className="mt-4 text-xs text-appHelper">{Object.values(form.formState.errors)[0]?.message?.toString()}</p>
          <div className="mt-6 flex justify-between">
            <button className="h-11 min-w-24 rounded-button border border-appHairline" onClick={onBack}>Back</button>
            <motion.button whileTap={{ scale: 0.985 }} transition={{ duration: tokens.motion.buttonPress, ease: tokens.motion.ease }} className="h-11 min-w-24 rounded-button bg-appAccent px-5 text-white" onClick={onContinue}>Continue</motion.button>
          </div>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

function Input({ form, name, label, type = 'text', sanitize }: { form: ReturnType<typeof useForm<FormValues>>; name: keyof FormValues; label: string; type?: string; sanitize?: (v: string) => string; }) {
  const value = form.watch(name);
  return (
    <label className="block text-sm">
      {label}
      <input
        aria-label={label}
        type={type}
        value={String(value ?? '')}
        onChange={(e) => {
          const raw = sanitize ? sanitize(e.target.value) : sanitizeText(e.target.value);
          const parsed = type === 'number' ? Number(raw || 0) : raw;
          form.setValue(name, parsed as FormValues[typeof name], { shouldValidate: true });
        }}
        className="mt-2 h-11 w-full rounded-input border border-appHairline px-4"
      />
      <span className="text-xs text-appHelper">Approximate values are perfectly fine.</span>
    </label>
  );
}

function SelectLoanType({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const selected = form.watch('loanType');
  return (
    <div className="grid grid-cols-2 gap-2">
      {['Home Loan', 'Personal Loan', 'Auto Loan', 'Education Loan'].map((loan) => (
        <motion.button key={loan} transition={{ duration: tokens.motion.selection, ease: tokens.motion.ease }} className={`h-12 rounded-input border ${selected === loan ? 'border-appAccent text-appAccent' : 'border-appHairline'}`} onClick={() => form.setValue('loanType', loan)}>{loan}</motion.button>
      ))}
    </div>
  );
}

function CalendarView({ month, selected, onPrev, onNext, onSelect }: { month: Date; selected: Date | null; onPrev: () => void; onNext: () => void; onSelect: (d: Date) => void; }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  return (
    <div className="rounded-input border border-appHairline p-4">
      <div className="mb-2 flex items-center justify-between">
        <button className="h-11 w-11 rounded-full border border-appHairline" onClick={onPrev} aria-label="Previous month">‹</button>
        <AnimatePresence mode="wait">
          <motion.div key={format(month, 'yyyy-MM')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: tokens.motion.screenTransition, ease: tokens.motion.ease }}>{format(month, 'MMMM yyyy')}</motion.div>
        </AnimatePresence>
        <button className="h-11 w-11 rounded-full border border-appHairline" onClick={onNext} aria-label="Next month">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <button key={day.toISOString()} className={`h-11 rounded-full text-xs ${isSameDay(day, selected ?? new Date(0)) ? 'bg-appAccent text-white' : ''} ${!isSameMonth(day, month) ? 'opacity-25' : ''}`} onClick={() => onSelect(day)}>{format(day, 'd')}</button>
        ))}
      </div>
    </div>
  );
}

function ShareCardGenerator({ name, saved }: { name: string; saved: number }) {
  const [downloadUrl, setDownloadUrl] = useState('');
  const templates = [
    `Quiet progress compounds. ${name || 'I'} am saving ${inr(saved)} in potential interest.`,
    `Discipline today, freedom tomorrow. Wealth grows in calm decisions.`
  ];

  const generate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#1C1C1C';
    ctx.font = '600 56px Inter';
    ctx.fillText('Loan Closure Planner', 72, 160);
    ctx.font = '400 40px Inter';
    ctx.fillText(templates[0], 72, 260, 930);
    ctx.fillStyle = '#07877B';
    ctx.fillText('Wealth mindset. Quiet confidence.', 72, 360);
    setDownloadUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <button className="h-11 rounded-button border border-appHairline px-4" onClick={generate}>Generate 1080x1080 card</button>
      {downloadUrl && <a download="loan-plan-share-card.png" href={downloadUrl} className="inline-block h-11 rounded-button bg-appAccent px-4 py-3 text-white">Download PNG</a>}
      <p className="text-sm text-appSecondary">WhatsApp template: "I’m building wealth with calm, consistent decisions. Here’s my loan closure plan."</p>
    </div>
  );
}
