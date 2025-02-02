import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { VoteResults } from '../types';

interface VoteState {
  selectedVote: number | null;
  isRevealed: boolean;
  results: VoteResults | null;
  setVote: (vote: number) => void;
  setResults: (results: VoteResults) => void;
  reveal: () => void;
  reset: () => void;
}

export const useVoteStore = create<VoteState>()(
  devtools(
    (set) => ({
      selectedVote: null,
      isRevealed: false,
      results: null,
      setVote: (vote) => set({ selectedVote: vote }),
      setResults: (results) => set({ results }),
      reveal: () => set({ isRevealed: true }),
      reset: () => set({ 
        selectedVote: null, 
        isRevealed: false, 
        results: null 
      }),
    }),
    {
      name: 'vote-store',
    }
  )
);