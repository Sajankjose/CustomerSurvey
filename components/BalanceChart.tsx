'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { inr } from '@/lib/format';
import { tokens } from '@/lib/tokens';

type Series = { id: string; name: string; color: string; values: Array<{ x: number; y: number }> };

export default function BalanceChart({ series, mode }: { series: Series[]; mode: 'loan' | 'sip' }) {
  const [focus, setFocus] = useState<string | null>(null);
  const data = useMemo(() => {
    const max = Math.max(...series.map((s) => s.values.length), 0);
    return Array.from({ length: max }, (_, i) => {
      const row: Record<string, number> = { x: series[0]?.values[i]?.x ?? i };
      series.forEach((s) => {
        row[s.id] = s.values[i]?.y ?? 0;
      });
      return row;
    });
  }, [series]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: tokens.motion.graphTabSwitch, ease: tokens.motion.ease }} className="h-[320px] w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke={tokens.colors.hairline} />
            <XAxis dataKey="x" tickFormatter={(v) => (mode === 'loan' ? `Year ${Math.floor(v / 12)}` : `Year ${v}`)} />
            <YAxis tickFormatter={(v) => inr(Number(v)).replace('₹', '₹ ')} width={90} />
            <Tooltip animationDuration={tokens.motion.tooltip * 1000} formatter={(v: number) => inr(v)} labelFormatter={(label) => (mode === 'loan' ? `Month ${label}` : `Year ${label}`)} />
            <Legend onClick={(e) => setFocus((curr) => (curr === e.dataKey ? null : String(e.dataKey)))} />
            {series.map((line) => (
              <Line key={line.id} type="monotone" dataKey={line.id} name={line.name} stroke={line.color} strokeWidth={2.5} opacity={focus && focus !== line.id ? 0.4 : 1} dot={false} isAnimationActive animationDuration={tokens.motion.graphLoad * 1000} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
}
