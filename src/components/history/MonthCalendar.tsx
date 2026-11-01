import type { AppData, CategoryId, StatusLevel } from '../../types';
import { CATEGORY_META, CategoryIcon } from '../../lib/categories';
import { buildMonthDays, type Ledger } from '../../lib/calc';
import { HEBREW_WEEKDAYS_SHORT, dayKeyOf } from '../../lib/dates';
import { useUi } from '../../store/ui';

const LEVEL_CELL: Record<StatusLevel, string> = {
  good: 'border-emerald-500/40 bg-emerald-500/12 text-emerald-200',
  exact: 'border-blue-500/60 bg-blue-500/18 text-blue-200',
  warning: 'border-amber-500/50 bg-amber-500/14 text-amber-200',
  bad: 'border-rose-500/55 bg-rose-500/18 text-rose-200',
};

const LEGEND: { cls: string; label: string }[] = [
  { cls: 'bg-zinc-700', label: 'יום נקי' },
  { cls: 'bg-emerald-400', label: 'בתקציב' },
  { cls: 'bg-blue-500', label: 'בדיוק ביעד' },
  { cls: 'bg-amber-400', label: 'קצב מהיר' },
  { cls: 'bg-rose-400', label: 'חריגה' },
];

interface Props {
  data: AppData;
  ledger: Ledger;
  monthKey: string;
  category: CategoryId;
  now: Date;
}

/** Visual month board for a single category. Tap a day to open the day editor. */
export function MonthCalendar({ data, ledger, monthKey, category, now }: Props) {
  const openDayEditor = useUi((s) => s.openDayEditor);
  const cells = buildMonthDays(data, ledger, monthKey, now, category);
  const firstWeekday = cells[0]?.date.getDay() ?? 0;
  const todayKey = dayKeyOf(now);
  const meta = CATEGORY_META[category];

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-zinc-500">
        {HEBREW_WEEKDAYS_SHORT.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} aria-hidden />
        ))}
        {cells.map((cell) => {
          const count = cell.counts[category];
          const isToday = cell.dayKey === todayKey;
          const cls = cell.level
            ? LEVEL_CELL[cell.level]
            : cell.isFuture
              ? 'border-white/4 bg-transparent text-zinc-600'
              : 'border-white/6 bg-zinc-900/70 text-zinc-500';
          return (
            <button
              key={cell.dayKey}
              type="button"
              onClick={() => openDayEditor(cell.dayKey)}
              aria-label={`${cell.date.getDate()} — ${count} ${meta.label}`}
              className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl border transition-transform hover:scale-105 active:scale-95 ${cls} ${
                isToday ? 'ring-2 ring-sky-400/80 ring-offset-1 ring-offset-zinc-950' : ''
              }`}
            >
              <span className="absolute top-1 start-1.5 text-[10px] font-semibold leading-none opacity-70">
                {cell.date.getDate()}
              </span>
              {count > 0 ? (
                <span className="mt-1.5 text-base font-extrabold leading-none tabular-nums">{count}</span>
              ) : !cell.isFuture ? (
                <span className="mt-1.5 size-1.5 rounded-full bg-zinc-600" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1 font-semibold text-zinc-400">
          <CategoryIcon category={category} className="size-3.5" />
          {meta.label}
        </span>
        {LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1">
            <span className={`size-2 rounded-sm ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
