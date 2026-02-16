'use client';

import { useErrorBoundaryLogger } from '@/hooks/useErrorBoundaryLogger';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useErrorBoundaryLogger(error);
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-appSecondary">Please try again. Your local inputs were not transmitted.</p>
      <button className="mt-6 h-11 rounded-button bg-appAccent px-4 text-white" onClick={reset}>Try again</button>
    </main>
  );
}
