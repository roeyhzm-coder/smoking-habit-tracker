import type { AppData } from '../../types';
import { CATEGORY_IDS, CATEGORY_META } from '../../lib/categories';
import { buildMonthDays, type Ledger } from '../../lib/calc';
import { HEBREW_WEEKDAYS_SHORT, dayKeyOf } from '../../lib/dates';
import { useUi } from '../../store/ui';

const LEVEL_CELL = {
  good: 'border-emerald-500/40 bg-emerald-500/10',
  warning: 'border-amber-500/50 bg-amber-500/12',
  bad: 'border-rose-500/50 bg-rose-500/15',
} as const;

const CAT_DOT = { cigarettes: 'text-zinc-200', joints: 'text-lime-300', cigars: 'text-orange-300' } as const;

export function MonthCalendar({ data, ledger, monthKey, now }: { data: AppData; ledger: Ledger; monthKey: string; now: Date }) {
  const openDayEditor = useUi((s) => s.openDayEditor);
  const cells = buildMonthDays(data, ledger, monthKey, now);
  const firstWeekday = cells[0]?.date.getDay() ?? 0;
  const todayKey = dayKeyOf(now);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-500">
        {HEBREW_WEEKDAYS_SHORT.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} aria-hidden />
        ))}
        {cells.map((cell) => {
          const total = CATEGORY_IDS.reduce((a, c) => a + cell.counts[c], 0);
          const cls = cell.level
            ? LEVEL_CELL[cell.level]
            : cell.isFuture
              ? 'border-white/4 bg-transparent opacity-50'
              : 'border-emerald-500/20 bg-zinc-900/60';
          const isToday = cell.dayKey === todayKey;
          return (
            <button
              key={cell.dayKey}
              type="button"
              onClick={() => openDayEditor(cell.dayKey)}
              aria-label={`${cell.date.getDate()} — ${total} דיווחים`}
              className={`flex aspect-square min-h-11 flex-col items-center justify-between rounded-xl border p-1 transition-transform hover:scale-105 ${cls} ${
                isToday ? 'ring-2 ring-sky-400/70' : ''
              }`}
            >
              <span className="text-[11px] font-bold text-zinc-300">{cell.date.getDate()}</span>
              <span className="flex flex-wrap justify-center gap-x-1 text-[10px] font-bold leading-none tabular-nums">
                {CATEGORY_IDS.map((c) =>
                  cell.counts[c] > 0 ? (
                    <span key={c} className={CAT_DOT[c]} title={CATEGORY_META[c].label}>
                      {cell.counts[c]}
                      <span className="opacity-70">{CATEGORY_META[c].short}</span>
                    </span>
                  ) : null,
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
        <span>סג = סיגריות · פ = פייסלים · סר = סיגרים</span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-emerald-400" />
          נקי/בתקציב
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-amber-400" />
          בדיוק/בנק
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-sm bg-rose-400" />
          חריגה
        </span>
      </div>
    </div>
  );
}
