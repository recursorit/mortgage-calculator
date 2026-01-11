import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  AuthContext,
  type AuthContextValue,
  type ScenarioSyncStatus,
} from './authContext';
import {
  getFirebaseAuth,
  getFirebaseDb,
  isFirebaseConfigured,
} from '../lib/firebase';
import type { Scenario } from '../store/mortgageStore';
import { useMortgageStore } from '../store/mortgageStore';

function formatFirebaseError(err: unknown): string {
  if (!err) return 'Unknown error';

  if (typeof err === 'string') return err;

  if (err instanceof Error) {
    const anyErr = err as Error & { code?: unknown };
    const code = typeof anyErr.code === 'string' ? anyErr.code : null;
    return code ? `${code}: ${err.message}` : err.message;
  }

  if (typeof err === 'object') {
    const record = err as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code : null;
    const message =
      typeof record.message === 'string' ? record.message : 'Unknown error';
    return code ? `${code}: ${message}` : message;
  }

  return 'Unknown error';
}

function mergeScenarios(local: Scenario[], remote: Scenario[]): Scenario[] {
  const map = new Map<string, Scenario>();

  for (const s of remote) map.set(s.id, s);
  for (const s of local) map.set(s.id, s);

  const merged = [...map.values()];
  merged.sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1));
  return merged;
}

export function AuthProvider(props: { children: ReactNode }) {
  const isEnabled = isFirebaseConfigured();
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(() => !isEnabled);

  const [scenarioSyncStatus, setScenarioSyncStatus] =
    useState<ScenarioSyncStatus>('idle');
  const [scenarioLastSyncedAtMs, setScenarioLastSyncedAtMs] = useState<
    number | null
  >(null);
  const [scenarioSyncError, setScenarioSyncError] = useState<string | null>(
    null,
  );

  const scenarios = useMortgageStore((s) => s.scenarios);
  const setScenarios = useMortgageStore((s) => s.setScenarios);

  const userUid = user?.uid ?? null;

  // Load remote scenarios once per login.
  const loadedForUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setIsAuthReady(true);

      if (!next) {
        setScenarioSyncStatus('idle');
        setScenarioLastSyncedAtMs(null);
        setScenarioSyncError(null);
      }
    });
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;
    if (!userUid) {
      loadedForUidRef.current = null;
      return;
    }
    if (loadedForUidRef.current === userUid) return;
    loadedForUidRef.current = userUid;

    const db = getFirebaseDb();
    const ref = doc(db, 'users', userUid);

    (async () => {
      const snap = await getDoc(ref);
      const data = snap.exists() ? (snap.data() as unknown) : null;
      const remoteScenarios = (() => {
        if (!data || typeof data !== 'object') return [];
        const scenariosValue = (data as Record<string, unknown>).scenarios;
        return Array.isArray(scenariosValue)
          ? (scenariosValue as Scenario[])
          : [];
      })();

      if (remoteScenarios.length) {
        const latestLocal = useMortgageStore.getState().scenarios;
        setScenarios(mergeScenarios(latestLocal, remoteScenarios));
      }

      // Remote load succeeded; keep status idle until we actually write.
      setScenarioSyncStatus('idle');
      setScenarioLastSyncedAtMs(null);
      setScenarioSyncError(null);
    })().catch((err: unknown) => {
      const message = formatFirebaseError(err);
      console.error('[firebase] scenario load failed', err);
      setScenarioSyncError(message);
      setScenarioSyncStatus('error');
    });
  }, [isEnabled, setScenarios, userUid]);

  // Debounced save to Firestore when scenarios change.
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    if (!userUid) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const db = getFirebaseDb();
      const ref = doc(db, 'users', userUid);

      setScenarioSyncStatus('saving');
      setScenarioSyncError(null);

      setDoc(
        ref,
        {
          scenarios,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
        .then(() => {
          setScenarioSyncStatus('synced');
          setScenarioLastSyncedAtMs(Date.now());
          setScenarioSyncError(null);
        })
        .catch((err: unknown) => {
          const message = formatFirebaseError(err);
          console.error('[firebase] scenario save failed', err);
          setScenarioSyncError(message);
          setScenarioSyncStatus('error');
        });
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [isEnabled, scenarios, userUid]);

  const signInWithGoogle = useCallback(async () => {
    if (!isEnabled) return;
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch {
      // Popup can fail on mobile or with strict blockers → fallback.
      await signInWithRedirect(auth, provider);
    }
  }, [isEnabled]);

  const signOutFn = useCallback(async () => {
    if (!isEnabled) return;
    const auth = getFirebaseAuth();
    await signOut(auth);
  }, [isEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isEnabled,
      user,
      isAuthReady,
      scenarioSyncStatus,
      scenarioLastSyncedAtMs,
      scenarioSyncError,
      signInWithGoogle,
      signOut: signOutFn,
    }),
    [
      isAuthReady,
      isEnabled,
      scenarioLastSyncedAtMs,
      scenarioSyncError,
      scenarioSyncStatus,
      signInWithGoogle,
      signOutFn,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
