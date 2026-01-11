import type React from 'react';

export function LabeledField(props: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {props.label}
        </label>
        {props.hint ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {props.hint}
          </span>
        ) : null}
      </div>
      {props.children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { onFocus, ...rest } = props;
  return (
    <input
      {...rest}
      onFocus={(e) => {
        onFocus?.(e);
        if (e.currentTarget.value === '0') {
          e.currentTarget.select();
        }
      }}
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ' +
        'transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 ' +
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40 ' +
        (props.className ?? '')
      }
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none ' +
        'transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 ' +
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900/40 ' +
        (props.className ?? '')
      }
    />
  );
}

export function Toggle(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      className={
        'flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition ' +
        'hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 ' +
        'dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus:ring-slate-800'
      }
    >
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {props.label}
      </span>
      <span
        className={
          'relative inline-flex h-6 w-11 flex-none items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ' +
          (props.checked ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600')
        }
      >
        <span
          className={
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ' +
            (props.checked ? 'translate-x-5' : 'translate-x-0')
          }
        />
      </span>
    </button>
  );
}
