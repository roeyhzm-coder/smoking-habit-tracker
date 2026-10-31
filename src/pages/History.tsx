import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import type { AppData, CategoryId } from '../types';
import { CATEGORY_DISPLAY_ORDER, CATEGORY_IDS, CATEGORY_META, CategoryIcon, STATUS_STYLES } from '../lib/categories';
import { RESULT_LABEL, formatNum, resultLevel, type Ledger, type MonthCategoryLedger } from '../lib/calc';
import { monthKeyOf, monthLabel, monthNameOnly, parseMonthKey, shiftMonthKey } from '../lib/dates';
import { useAppData, useLedger } from '../store/hooks';
import { useStore } from '../store/store';
import { Accordion } from '../components/ui/Accordion';
import { InlineNumber } from '../components/ui/InlineNumber';
import { MonthCalendar } from '../components/history/MonthCalendar';

function ResultBadge({ row, inProgress }: { row: MonthCategoryLedger; inProgress: boolean }) {
  const level = resultLevel(row.result);
  const st = STATUS_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${st.bg} px-2 py-0.5 text-[11px] font-semibold ${st.text}`}
      title={`${CATEGORY_META[row.category].label}: ${row.used}/${row.effective}`}
    >
      <span className={`size-1.5 rounded-full ${st.dot}`} />
      {CATEGORY_META[row.category].short}
      <span className="tabular-nums" dir="ltr">
        {row.used}/{formatNum(row.effective)}
      </span>
      {!inProgress || row.result === 'over' ? <span className="hidden sm:inline">· {RESULT_LABEL[row.result]}</span> : null}
    </span>
  );
}

function CategoryBreakdown({ row, settingsLimit }: { row: MonthCategoryLedger; settingsLimit: number }) {
  const setPenaltyOverride = useStore((s) => s.setPenaltyOverride);
  const setBaseOverride = useStore((s) => s.setBaseOverride);
  const cat: CategoryId = row.category;
  const nextKey = shiftMonthKey(row.monthKey, 1);
  const level = resultLevel(row.result);
  const st = STATUS_STYLES[level];

  return (
    <div className={`rounded-2xl border ${st.border} bg-zinc-950/40 p-3`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`size-2 rounded-full ${st.dot}`} />
        <CategoryIcon category={cat} className="size-4" />
        <h4 className="text-sm font-bold text-zinc-100">{CATEGORY_META[cat].label}</h4>
        <span className={`ms-auto text-xs font-semibold ${st.text}`}>{RESULT_LABEL[row.result]}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-zinc-400">תקציב בסיס</dt>
        <dd className="text-end">
          <InlineNumber
            label={`תקציב בסיס ${CATEGORY_META[cat].label}`}
            value={row.base}
            overridden={row.baseOverridden}
            onSave={(v) => setBaseOverride(row.monthKey, cat, v === settingsLimit ? null : Math.round(v))}
            onReset={() => setBaseOverride(row.monthKey, cat, null)}
          />
        </dd>
        <dt className="text-zinc-400">קנס שהופעל</dt>
        <dd className="text-end">
          <InlineNumber
            label={`קנס שהופעל ${CATEGORY_META[cat].label}`}
            value={row.applied}
            overridden={row.appliedOverridden}
            onSave={(v) => setPenaltyOverride(row.monthKey, cat, Math.round(v))}
            onReset={() => setPenaltyOverride(row.monthKey, cat, null)}
            valueClassName={row.applied > 0 ? 'font-bold text-rose-300' : 'font-bold text-zinc-50'}
          />
        </dd>
        <dt className="text-zinc-400">תקציב אפקטיבי</dt>
        <dd className="text-end font-bold tabular-nums text-zinc-50">{formatNum(row.effective)}</dd>
        <dt className="text-zinc-400">עישון בפועל</dt>
        <dd className={`text-end font-bold tabular-nums ${st.text}`}>{row.used}</dd>
        <dt className="text-zinc-400">קנס ל{monthNameOnly(nextKey)}</dt>
        <dd className="text-end">
          <InlineNumber
            label={`קנס לחודש הבא ${CATEGORY_META[cat].label}`}
            value={row.nextApplied}
            overridden={row.nextOverridden}
            onSave={(v) => setPenaltyOverride(nextKey, cat, Math.round(v))}
            onReset={() => setPenaltyOverride(nextKey, cat, null)}
            valueClassName={row.nextApplied > 0 ? 'font-bold text-rose-300' : 'font-bold text-zinc-50'}
          />
        </dd>
      </dl>
    </div>
  );
}

function MonthRow({
  data,
  ledger,
  monthKey,
  now,
  defaultOpen,
}: {
  data: AppData;
  ledger: Ledger;
  monthKey: string;
  now: Date;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const row = ledger[monthKey];
  if (!row) return null;
  const inProgress = monthKey === monthKeyOf(now);

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-900/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-start"
      >
        <span className="text-sm font-bold text-zinc-100">{monthNameOnly(monthKey)}</span>
        {inProgress ? (
          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">בתהליך</span>
        ) : null}
        <span className="ms-auto flex flex-wrap items-center gap-1">
          {CATEGORY_DISPLAY_ORDER.map((c) => (
            <ResultBadge key={c} row={row[c]} inProgress={inProgress} />
          ))}
        </span>
        <ChevronDown className={`size-4 text-zinc-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          {open ? (
            <div className="space-y-3 border-t border-white/6 px-3 pt-3 pb-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {CATEGORY_DISPLAY_ORDER.map((c) => (
                  <CategoryBreakdown key={c} row={row[c]} settingsLimit={data.settings[c].monthlyLimit} />
                ))}
              </div>
              <div className="rounded-2xl border border-white/6 bg-zinc-950/40 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <CalendarDays className="size-4" />
                  לוח חודשי — לחץ על יום לעריכה
                </div>
                <MonthCalendar data={data} ledger={ledger} monthKey={monthKey} now={now} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function History({ now }: { now: Date }) {
  const data = useAppData();
  const ledger = useLedger(data, now);
  const currentKey = monthKeyOf(now);

  const byYear = useMemo(() => {
    const keys = Object.keys(ledger)
      .filter((k) => k <= currentKey)
      .sort()
      .reverse();
    const groups = new Map<number, string[]>();
    for (const k of keys) {
      const y = parseMonthKey(k).year;
      groups.set(y, [...(groups.get(y) ?? []), k]);
    }
    return [...groups.entries()];
  }, [ledger, currentKey]);

  const totals = useMemo(() => {
    const out: Record<CategoryId, { met: number; over: number }> = {
      cigarettes: { met: 0, over: 0 },
      joints: { met: 0, over: 0 },
      cigars: { met: 0, over: 0 },
    };
    for (const [k, row] of Object.entries(ledger)) {
      if (k >= currentKey) continue;
      for (const c of CATEGORY_IDS) {
        if (row[c].result === 'over') out[c].over += 1;
        else out[c].met += 1;
      }
    }
    return out;
  }, [ledger, currentKey]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-50">טבלת מעקב והיסטוריה</h1>
        <p className="text-sm text-zinc-400">כל מספר עם עיפרון ניתן לעריכה. לחיצה על יום בלוח פותחת את עורך היום.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_DISPLAY_ORDER.map((c) => (
          <div key={c} className="rounded-2xl border border-white/8 bg-zinc-900/60 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <CategoryIcon category={c} className="size-3.5" />
              {CATEGORY_META[c].label}
            </div>
            <div className="mt-0.5 text-xs text-zinc-300">
              <span className="font-bold text-emerald-300 tabular-nums">{totals[c].met}</span> בתקציב ·{' '}
              <span className="font-bold text-rose-300 tabular-nums">{totals[c].over}</span> חריגה
            </div>
          </div>
        ))}
      </div>

      {byYear.map(([year, months], idx) => (
        <Accordion
          key={year}
          title={`${year}`}
          summary={`${months.length} חודשים`}
          defaultOpen={idx === 0}
          className="bg-transparent"
        >
          <div className="space-y-2">
            {months.map((k) => (
              <MonthRow
                key={k}
                data={data}
                ledger={ledger}
                monthKey={k}
                now={now}
                defaultOpen={k === currentKey}
              />
            ))}
          </div>
        </Accordion>
      ))}
      <p className="text-center text-xs text-zinc-600">{monthLabel(currentKey)} · חודשים קודמים נוצרים אוטומטית מהדיווחים</p>
    </div>
  );
}
