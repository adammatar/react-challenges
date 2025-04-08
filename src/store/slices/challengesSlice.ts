import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  completed: boolean;
}

interface ChallengesState {
  challenges: Challenge[];
  loading: boolean;
  error: string | null;
  selectedChallenge: Challenge | null;
}

const initialState: ChallengesState = {
  challenges: [],
  loading: false,
  error: null,
  selectedChallenge: null,
};

const challengesSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.challenges = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedChallenge: (state, action: PayloadAction<Challenge | null>) => {
      state.selectedChallenge = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setChallenges,
  setSelectedChallenge,
  setLoading,
  setError,
  updateChallenge,
  clearError,
} = challengesSlice.actions;

export default challengesSlice.reducer; 