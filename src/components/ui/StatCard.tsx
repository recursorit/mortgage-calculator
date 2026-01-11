export function StatCard(props: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: 'sky' | 'violet' | 'emerald' | 'amber';
}) {
  const accent = props.accent ?? 'sky';
  const accents: Record<NonNullable<typeof props.accent>, string> = {
    sky: 'from-sky-500 to-cyan-500',
    violet: 'from-violet-500 to-fuchsia-500',
    emerald: 'from-emerald-500 to-lime-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        aria-hidden="true"
        className={
          'pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br opacity-20 ' +
          accents[accent]
        }
      />
      <div className="relative space-y-1">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {props.title}
        </div>
        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          {props.value}
        </div>
        {props.subtitle ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {props.subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
