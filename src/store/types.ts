import { User } from 'firebase/auth';

export interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  // Add other state slices here as needed
} 