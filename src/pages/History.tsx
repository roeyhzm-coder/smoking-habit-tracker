import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, OctagonAlert, Target } from 'lucide-react';
import type { CategoryId, StatusLevel } from '../types';
import { CATEGORY_META, STATUS_STYLES } from '../lib/categories';
import { formatNum, resultLevel, type MonthCategoryLedger } from '../lib/calc';
import { monthKeyOf, monthLabel, monthNameOnly } from '../lib/dates';
import { useAppData, useLedger } from '../store/hooks';
import { CategoryTabs } from '../components/dashboard/SummaryBar';
import { MonthCalendar } from '../components/history/MonthCalendar';

interface Verdict {
  level: StatusLevel;
  label: string;
  Icon: typeof CheckCircle2;
}

function verdictOf(row: MonthCategoryLedger, inProgress: boolean): Verdict {
  if (row.result === 'over') return { level: 'bad', label: 'חריגה', Icon: OctagonAlert };
  if (inProgress) return { level: resultLevel(row.result), label: 'בתהליך', Icon: Clock3 };
  if (row.result === 'exact') return { level: 'exact', label: 'עמד ביעד בדיוק', Icon: Target };
  return { level: 'good', label: 'עמד ביעד', Icon: CheckCircle2 };
}

function MonthSummary({ row, inProgress }: { row: MonthCategoryLedger; inProgress: boolean }) {
  const v = verdictOf(row, inProgress);
  const st = STATUS_STYLES[v.level];
  const meta = CATEGORY_META[row.category];
  const pct = row.effective > 0 ? Math.min(100, (row.used / row.effective) * 100) : row.used > 0 ? 100 : 0;

  return (
    <div className={`rounded-3xl border ${st.border} bg-linear-to-b ${st.soft} to-zinc-900/80 p-4`}>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full ${st.bg} px-3 py-1 text-sm font-bold ${st.text}`}>
          <v.Icon className="size-4" aria-hidden />
          {v.label}
        </span>
        <p className="ms-auto text-sm text-zinc-300">
          עישנת{' '}
          <span className={`text-2xl font-extrabold tabular-nums ${st.text}`}>{row.used}</span>
          <span className="text-zinc-400"> מתוך </span>
          <span className="text-lg font-bold tabular-nums text-zinc-100">{formatNum(row.effective)}</span>{' '}
          <span className="text-zinc-500">{meta.label}</span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8" aria-hidden>
        <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function History({ now }: { now: Date }) {
  const data = useAppData();
  const ledger = useLedger(data, now);
  const currentKey = monthKeyOf(now);
  const [category, setCategory] = useState<CategoryId>('cigarettes');
  const [selected, setSelected] = useState<string>(currentKey);

  /** Newest first, never beyond the current month. */
  const months = useMemo(
    () =>
      Object.keys(ledger)
        .filter((k) => k <= currentKey)
        .sort()
        .reverse(),
    [ledger, currentKey],
  );

  const monthKey = months.includes(selected) ? selected : (months[0] ?? currentKey);
  const idx = months.indexOf(monthKey);
  const olderKey = idx >= 0 ? months[idx + 1] : undefined;
  const newerKey = idx > 0 ? months[idx - 1] : undefined;
  const row = ledger[monthKey]?.[category];
  const inProgress = monthKey === currentKey;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-zinc-50">היסטוריה</h1>

      <CategoryTabs active={category} onSelect={setCategory} />

      {/* Month navigator — RTL: older on the right, newer on the left */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => olderKey && setSelected(olderKey)}
          disabled={!olderKey}
          aria-label="חודש קודם"
          className="grid size-10 place-items-center rounded-xl border border-white/8 bg-zinc-900/60 text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-lg font-extrabold text-zinc-50">{monthLabel(monthKey)}</div>
        </div>
        <button
          type="button"
          onClick={() => newerKey && setSelected(newerKey)}
          disabled={!newerKey}
          aria-label="חודש הבא"
          className="grid size-10 place-items-center rounded-xl border border-white/8 bg-zinc-900/60 text-zinc-300 transition-colors hover:bg-zinc-900 disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      {/* Month strip: one dot per month, colored by the selected category's result */}
      {months.length > 1 ? (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="בחירת חודש">
          {months.map((k) => {
            const r = ledger[k]?.[category];
            const lvl = r ? verdictOf(r, k === currentKey).level : 'good';
            const isSel = k === monthKey;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={isSel}
                onClick={() => setSelected(k)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isSel ? 'border-zinc-100 bg-zinc-100 text-zinc-950' : 'border-white/8 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <span className={`size-2 rounded-full ${STATUS_STYLES[lvl].dot}`} />
                {monthNameOnly(k)}
              </button>
            );
          })}
        </div>
      ) : null}

      {row ? <MonthSummary row={row} inProgress={inProgress} /> : null}

      <div className="rounded-3xl border border-white/8 bg-zinc-900/50 p-3">
        <MonthCalendar data={data} ledger={ledger} monthKey={monthKey} category={category} now={now} />
      </div>
      <p className="text-center text-xs text-zinc-600">לחיצה על יום פותחת את עורך היום</p>
    </div>
  );
}
