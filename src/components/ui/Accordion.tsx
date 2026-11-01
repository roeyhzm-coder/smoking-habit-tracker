import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: ReactNode;
  /** Right-aligned summary shown in the header (e.g. count badge, totals). */
  summary?: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function Accordion({ title, summary, icon, defaultOpen = false, children, className = '' }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={`rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start transition-colors hover:bg-white/3 focus-visible:outline-2 focus-visible:outline-violet-400"
      >
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <span className="flex-1 text-sm font-semibold text-slate-100">{title}</span>
        {summary ? <span className="text-xs text-slate-400">{summary}</span> : null}
        <ChevronDown
          className={`size-4 shrink-0 text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/5 px-4 pt-3 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/8 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-200">
      {count}
    </span>
  );
}
