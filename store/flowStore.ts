import { create } from 'zustand';

type FlowState = {
  step: number;
  setStep: (next: number) => void;
  tab: 'loan' | 'sip';
  setTab: (tab: 'loan' | 'sip') => void;
};

// Zustand is used here for lightweight local flow state without introducing a state machine runtime overhead.
export const useFlowStore = create<FlowState>((set) => ({
  step: 0,
  tab: 'loan',
  setStep: (step) => set({ step }),
  setTab: (tab) => set({ tab })
}));
