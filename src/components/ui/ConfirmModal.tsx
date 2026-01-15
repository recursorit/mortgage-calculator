import { useEffect, useId, useRef } from 'react';
import {
  IconAlertTriangle,
  IconCheck,
  IconTrash,
  IconX,
} from '@tabler/icons-react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal(props: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!props.open) return;

    // Focus the cancel button by default to prevent accidental confirmation.
    cancelButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [props]);

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={props.description ? descriptionId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50"
        onClick={props.onClose}
        aria-label="Close dialog"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <div
              className={
                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ' +
                (props.danger
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                  : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-200')
              }
              aria-hidden="true"
            >
              <IconAlertTriangle size={18} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <div
                id={titleId}
                className="text-base font-black tracking-tight text-slate-900 dark:text-slate-50"
              >
                {props.title}
              </div>
              {props.description ? (
                <div
                  id={descriptionId}
                  className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                >
                  {props.description}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              ref={cancelButtonRef}
              onClick={props.onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-800 sm:w-auto"
            >
              <IconX size={18} aria-hidden="true" />
              {props.cancelLabel ?? 'Cancel'}
            </button>

            <button
              type="button"
              onClick={props.onConfirm}
              className={
                'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4 sm:w-auto ' +
                (props.danger
                  ? 'border border-rose-200 bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200 dark:border-rose-900/60 dark:bg-rose-600 dark:hover:bg-rose-500 dark:focus:ring-rose-900/50'
                  : 'border border-slate-200 bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-200 dark:border-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus:ring-slate-800')
              }
            >
              {props.danger ? (
                <IconTrash size={18} aria-hidden="true" />
              ) : (
                <IconCheck size={18} aria-hidden="true" />
              )}
              {props.confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
