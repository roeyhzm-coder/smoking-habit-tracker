import { useRef, useState, type ReactNode } from 'react';
import { Database, Download, RotateCcw, Sparkles, Trash2, Upload } from 'lucide-react';
import type { CategoryId, LogEntry, PacingFocus } from '../types';
import { CATEGORY_ORDER_LTR, CATEGORY_META, CategoryIcon, FOCUS_LABEL } from '../lib/categories';
import { buildLedger, formatNum } from '../lib/calc';
import { monthKeyOf, monthNameOnly } from '../lib/dates';
import { exportJson, useStore } from '../store/store';
import { useAppData } from '../store/hooks';
import { useUi } from '../store/ui';
import { Modal } from './ui/Modal';
import { InlineNumber } from './ui/InlineNumber';
import { OptionalNumberInput } from './ui/OptionalNumberInput';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        {hint ? <div className="text-[11px] leading-snug text-slate-500">{hint}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/8 p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-md px-2.5 py-1 font-semibold ${
            value === o.value ? 'bg-white/10 text-slate-100 shadow-sm ring-1 ring-white/10' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function buildDemoLogs(now: Date): Omit<LogEntry, 'id'>[] {
  const out: Omit<LogEntry, 'id'>[] = [];
  const add = (daysAgo: number, hour: number, category: CategoryId): void => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, Math.floor(Math.random() * 59));
    out.push({ category, timestamp: d.getTime(), createdAt: d.getTime() });
  };
  for (let i = 1; i <= 75; i += 1) {
    const r = (i * 37) % 10;
    if (r < 6) add(i, 9 + (r % 5), 'cigarettes');
    if (r === 3) add(i, 21, 'cigarettes');
    if (i % 8 === 0) add(i, 22, 'joints');
    if (i % 20 === 0) add(i, 20, 'cigars');
  }
  return out;
}

export function SettingsModal({ now }: { now: Date }) {
  const open = useUi((s) => s.settingsOpen);
  const close = useUi((s) => s.closeSettings);
  const cat = useUi((s) => s.settingsCategory);
  const openSettings = useUi((s) => s.openSettings);
  const showToast = useUi((s) => s.showToast);
  const data = useAppData();
  const updateSettings = useStore((s) => s.updateSettings);
  const updatePenaltyRule = useStore((s) => s.updatePenaltyRule);
  const setPenaltyOverride = useStore((s) => s.setPenaltyOverride);
  const importData = useStore((s) => s.importData);
  const resetSettings = useStore((s) => s.resetSettings);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const s = data.settings[cat];
  const meta = CATEGORY_META[cat];
  const monthKey = monthKeyOf(now);
  const ledgerRow = buildLedger(data, now)[monthKey]?.[cat];
  const autoDaily = ledgerRow ? ledgerRow.effective / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 0;

  const onExport = (): void => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smoking-tracker-${monthKeyOf(now)}-${now.getDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('הקובץ יוצא בהצלחה');
  };

  const onImport = async (file: File): Promise<void> => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      importData(parsed);
      showToast('הנתונים יובאו בהצלחה');
    } catch {
      showToast('ייבוא נכשל — הקובץ אינו תקין');
    }
  };

  const onSeed = (): void => {
    const state = useStore.getState();
    importData({ ...state, logs: [...state.logs, ...buildDemoLogs(now)] });
    showToast('נוספו נתוני דמו ל-75 הימים האחרונים');
  };

  return (
    <Modal open onClose={close} title="הגדרות תקציב וקנסות">
      <div dir="ltr" role="tablist" className="mb-2 grid grid-cols-3 gap-1 rounded-xl border border-white/5 bg-slate-950 p-1">
        {CATEGORY_ORDER_LTR.map((c) => (
          <button
            key={c}
            dir="rtl"
            role="tab"
            type="button"
            aria-selected={c === cat}
            onClick={() => openSettings(c)}
            className={`rounded-lg px-2 py-1.5 text-sm font-bold ${
              c === cat ? 'bg-white/10 text-slate-100 shadow-sm ring-1 ring-white/10' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon category={c} className="size-4" color={c === cat && c === 'cigarettes' ? 'text-slate-100' : undefined} />
              {CATEGORY_META[c].label}
            </span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-white/5">
        <Field label="תקציב חודשי" hint="ברירת המחדל לכל חודש">
          <InlineNumber
            label="תקציב חודשי"
            value={s.monthlyLimit}
            onSave={(v) => updateSettings(cat, { monthlyLimit: Math.round(v) })}
            suffix={meta.label}
          />
        </Field>

        <Field label="מגבלה שבועית (השאר ריק או 0 לביטול)" hint="שבוע מתחיל ביום ראשון">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <OptionalNumberInput
              label="מגבלה שבועית"
              value={s.weeklyLimit}
              onCommit={(v) => updateSettings(cat, { weeklyLimit: v })}
            />
            לשבוע
          </span>
        </Field>

        <Field
          label="תקציב יומי"
          hint={s.dailyOverride === null ? `אוטומטי: תקציב מעודכן ÷ ימים בחודש = ${formatNum(autoDaily)}` : 'ערך ידני'}
        >
          <div className="flex flex-col items-end gap-1.5">
            <Segmented
              value={s.dailyOverride === null ? 'auto' : 'manual'}
              options={[
                { value: 'auto', label: 'אוטומטי' },
                { value: 'manual', label: 'ידני' },
              ]}
              onChange={(v) =>
                updateSettings(cat, { dailyOverride: v === 'auto' ? null : Math.max(1, Math.round(autoDaily)) })
              }
            />
            {s.dailyOverride !== null ? (
              <InlineNumber
                label="תקציב יומי ידני"
                value={s.dailyOverride}
                step={0.5}
                onSave={(v) => updateSettings(cat, { dailyOverride: v })}
              />
            ) : null}
          </div>
        </Field>

        <Field label="מיקוד קצב" hint="קובע איזה מדד מניע את צבע הסטטוס">
          <Segmented<PacingFocus>
            value={s.focus}
            options={(['daily', 'weekly', 'monthly'] as const).map((f) => ({ value: f, label: FOCUS_LABEL[f].split(' ')[0] ?? f }))}
            onChange={(v) => updateSettings(cat, { focus: v })}
          />
        </Field>

        <div className="py-3">
          <div className="text-sm font-semibold text-slate-200">קנס על חריגה</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
            על כל חריגה, הורד
            <InlineNumber
              label="קנס לכל יחידת חריגה"
              value={s.penalty.perExcess}
              onSave={(v) => updatePenaltyRule(cat, { perExcess: v })}
              valueClassName="font-extrabold text-rose-300"
            />
            מהתקציב בחודש הבא
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500">
            נשמר כחוק הקבוע לכל החודשים. דוגמה: חריגה של 2 = קנס של {formatNum(Math.ceil(2 * s.penalty.perExcess - 1e-9))}
            {Number.isInteger(s.penalty.perExcess) ? '' : ' (מעוגל למעלה)'}.
          </div>
          {ledgerRow ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
              <span className="flex-1">עריכת קנס ידנית ל{monthNameOnly(monthKey)} (החודש):</span>
              <InlineNumber
                label="קנס לחודש הנוכחי"
                value={ledgerRow.applied}
                overridden={ledgerRow.appliedOverridden}
                onSave={(v) => setPenaltyOverride(monthKey, cat, Math.round(v))}
                onReset={() => setPenaltyOverride(monthKey, cat, null)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <Database className="size-4" />
          נתונים וגיבוי
        </h3>
        <p className="mb-3 text-[11px] text-slate-500">הנתונים נשמרים מקומית בדפדפן בלבד. מומלץ לייצא גיבוי מדי פעם.</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <button type="button" onClick={onExport} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 px-3 py-2 font-semibold text-slate-200 hover:bg-white/5">
            <Download className="size-4" /> ייצוא JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 px-3 py-2 font-semibold text-slate-200 hover:bg-white/5">
            <Upload className="size-4" /> ייבוא JSON
          </button>
          <button type="button" onClick={onSeed} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 px-3 py-2 font-semibold text-slate-200 hover:bg-white/5">
            <Sparkles className="size-4" /> נתוני דמו
          </button>
          <button
            type="button"
            onClick={() => {
              resetSettings();
              showToast('ההגדרות אופסו לברירת המחדל');
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 px-3 py-2 font-semibold text-slate-200 hover:bg-white/5"
          >
            <RotateCcw className="size-4" /> איפוס הגדרות
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onImport(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              window.setTimeout(() => setConfirmReset(false), 4000);
              return;
            }
            resetAll();
            setConfirmReset(false);
            showToast('כל הנתונים נמחקו');
          }}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold ${
            confirmReset ? 'border-rose-500 bg-rose-500/20 text-rose-200' : 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
          }`}
        >
          <Trash2 className="size-4" />
          {confirmReset ? 'לחץ שוב לאישור מחיקת הכל' : 'מחיקת כל הנתונים'}
        </button>
      </section>
    </Modal>
  );
}
