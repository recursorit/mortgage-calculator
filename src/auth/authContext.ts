import { createContext } from 'react';
import type { User } from 'firebase/auth';

export type ScenarioSyncStatus = 'idle' | 'saving' | 'synced' | 'error';

export type AuthContextValue = {
  isEnabled: boolean;
  user: User | null;
  isAuthReady: boolean;
  scenarioSyncStatus: ScenarioSyncStatus;
  scenarioLastSyncedAtMs: number | null;
  scenarioSyncError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
