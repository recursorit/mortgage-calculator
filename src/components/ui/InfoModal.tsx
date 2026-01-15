import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { IconX } from '@tabler/icons-react';

type InfoModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export function InfoModal(props: InfoModalProps) {
  const { open, onClose, title, description, children } = props;

  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div
                id={titleId}
                className="text-base font-black tracking-tight text-slate-900 dark:text-slate-50"
              >
                {title}
              </div>
              {description ? (
                <div
                  id={descriptionId}
                  className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                >
                  {description}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
              aria-label="Close"
              title="Close"
            >
              <IconX size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">{children}</div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
            >
              <IconX size={18} aria-hidden="true" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
