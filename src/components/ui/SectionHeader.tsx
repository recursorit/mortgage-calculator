export function SectionHeader(props: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.right ? <div className="print:hidden">{props.right}</div> : null}
    </div>
  );
}
