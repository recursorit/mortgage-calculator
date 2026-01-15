import { useState } from 'react';
import { IconBrandGoogle, IconLogout, IconUser } from '@tabler/icons-react';

import { HeaderBar } from '../components/HeaderBar';
import { useAuth } from '../auth/useAuth';

function formatIsoMaybe(value: string | undefined | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : value;
}

export function UserProfilePage(props: { onOpenNav?: () => void }) {
  const auth = useAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <>
      <HeaderBar onOpenNav={props.onOpenNav} />

      <main className="py-6 sm:py-10">
        <div className="grid gap-6 print:hidden">
          <section className="rounded-3xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-[color:var(--mc-ink)]">
                  <IconUser size={20} aria-hidden="true" />
                  User profile
                </div>
                <div className="mt-1 text-sm text-[color:var(--mc-muted)]">
                  View your sign-in details and sync status.
                </div>
              </div>

              {auth.isEnabled && auth.user ? (
                <button
                  type="button"
                  onClick={() => void auth.signOut()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] px-3 py-2 text-sm font-bold text-[color:var(--mc-ink)] shadow-sm transition hover:bg-[color:var(--mc-surface-2)] focus:outline-none focus:ring-4 focus:ring-[color:var(--mc-focus)]"
                >
                  <IconLogout size={18} aria-hidden="true" />
                  Sign out
                </button>
              ) : null}
            </div>

            {!auth.isEnabled ? (
              <div className="mt-6 rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] px-4 py-3 text-sm text-[color:var(--mc-muted)]">
                Authentication is not configured for this build.
              </div>
            ) : !auth.isAuthReady ? (
              <div className="mt-6 rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] px-4 py-3 text-sm text-[color:var(--mc-muted)]">
                Loading authentication…
              </div>
            ) : auth.user ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="rounded-3xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] p-5">
                    <div className="flex items-center gap-4">
                      {auth.user.photoURL && !avatarFailed ? (
                        <img
                          src={auth.user.photoURL}
                          alt="User avatar"
                          className="h-14 w-14 rounded-2xl border border-[color:var(--mc-line)] object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          onError={() => setAvatarFailed(true)}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface-2)] text-[color:var(--mc-muted)]">
                          <IconUser size={20} aria-hidden="true" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate text-base font-extrabold text-[color:var(--mc-ink)]">
                          {auth.user.displayName ?? 'Signed in'}
                        </div>
                        <div className="truncate text-sm text-[color:var(--mc-muted)]">
                          {auth.user.email ?? 'No email on account'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[color:var(--mc-muted)]">
                          Email verified
                        </div>
                        <div className="font-semibold text-[color:var(--mc-ink)]">
                          {auth.user.emailVerified ? 'Yes' : 'No'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[color:var(--mc-muted)]">
                          User ID
                        </div>
                        <div className="max-w-[65%] truncate font-mono text-xs text-[color:var(--mc-ink)]">
                          {auth.user.uid}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="rounded-3xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] p-5">
                    <div className="text-sm font-extrabold text-[color:var(--mc-ink)]">
                      Account details
                    </div>

                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-[color:var(--mc-muted)]">
                          Created
                        </div>
                        <div className="text-right font-semibold text-[color:var(--mc-ink)]">
                          {formatIsoMaybe(auth.user.metadata.creationTime)}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="text-[color:var(--mc-muted)]">
                          Last sign-in
                        </div>
                        <div className="text-right font-semibold text-[color:var(--mc-ink)]">
                          {formatIsoMaybe(auth.user.metadata.lastSignInTime)}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="text-[color:var(--mc-muted)]">
                          Providers
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {(auth.user.providerData.length
                            ? auth.user.providerData
                            : [{ providerId: 'unknown' } as const]
                          ).map((p, idx) => (
                            <span
                              key={`${p.providerId}-${idx}`}
                              className="rounded-full border border-[color:var(--mc-line)] bg-[color:var(--mc-surface-2)] px-2 py-1 text-xs font-bold text-[color:var(--mc-ink)]"
                            >
                              {p.providerId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] px-4 py-3 text-sm">
                      <div className="font-extrabold text-[color:var(--mc-ink)]">
                        Scenario sync
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-[color:var(--mc-muted)]">
                        <div>
                          Status:{' '}
                          <span className="font-bold text-[color:var(--mc-ink)]">
                            {auth.scenarioSyncStatus}
                          </span>
                        </div>
                        <div>
                          Last synced:{' '}
                          <span className="font-bold text-[color:var(--mc-ink)]">
                            {auth.scenarioLastSyncedAtMs
                              ? new Date(
                                  auth.scenarioLastSyncedAtMs,
                                ).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                      </div>
                      {auth.scenarioSyncStatus === 'error' &&
                      auth.scenarioSyncError ? (
                        <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                          {auth.scenarioSyncError}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] p-6">
                <div className="text-sm font-extrabold text-[color:var(--mc-ink)]">
                  You’re not signed in
                </div>
                <div className="mt-1 text-sm text-[color:var(--mc-muted)]">
                  Sign in to see your profile details and scenario sync status.
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void auth.signInWithGoogle()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--mc-line)] bg-[color:var(--mc-surface)] px-3 py-2 text-sm font-bold text-[color:var(--mc-ink)] shadow-sm transition hover:bg-[color:var(--mc-surface-2)] focus:outline-none focus:ring-4 focus:ring-[color:var(--mc-focus)]"
                  >
                    <IconBrandGoogle size={18} aria-hidden="true" />
                    Sign in with Google
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
