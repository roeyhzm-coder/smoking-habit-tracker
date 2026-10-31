import type { ReactNode } from 'react';
import { Calculator, Settings2 } from 'lucide-react';
import type { CategoryId, CategorySettings } from '../../types';
import { CATEGORY_META } from '../../lib/categories';
import { formatNum, penaltyFromRule, type CategoryStatus, type MonthCategoryLedger } from '../../lib/calc';
import { monthNameOnly, shiftMonthKey } from '../../lib/dates';
import { useStore } from '../../store/store';
import { useUi } from '../../store/ui';
import { Accordion } from '../ui/Accordion';
import { InlineNumber } from '../ui/InlineNumber';
import { OptionalNumberInput } from '../ui/OptionalNumberInput';

function Row({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1">
        <div className="text-sm text-zinc-300">{label}</div>
        {hint ? <div className="text-[11px] text-zinc-500">{hint}</div> : null}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

interface Props {
  category: CategoryId;
  settings: CategorySettings;
  row: MonthCategoryLedger;
  status: CategoryStatus;
}

export function BudgetBreakdown({ category, settings, row, status }: Props) {
  const updateSettings = useStore((s) => s.updateSettings);
  const updatePenaltyRule = useStore((s) => s.updatePenaltyRule);
  const setPenaltyOverride = useStore((s) => s.setPenaltyOverride);
  const setBaseOverride = useStore((s) => s.setBaseOverride);
  const openSettings = useUi((s) => s.openSettings);
  const meta = CATEGORY_META[category];
  const monthKey = row.monthKey;
  const nextKey = shiftMonthKey(monthKey, 1);
  const prevName = monthNameOnly(shiftMonthKey(monthKey, -1));
  const rule = settings.penalty;
  const projectedIfOneMore = penaltyFromRule(rule, Math.max(0, row.used + 1 - row.effective));

  return (
    <Accordion
      icon={<Calculator className="size-4" />}
      title="פירוט תקציב וקנסות (ועריכה מהירה)"
      summary={
        <span className="tabular-nums" dir="rtl">
          {formatNum(row.base)} − {formatNum(row.applied)} = <b className="text-zinc-200">{formatNum(row.effective)}</b>
        </span>
      }
    >
      <div className="divide-y divide-white/6">
        <Row
          label="תקציב חודשי בסיסי"
          hint={row.baseOverridden ? `מוגדר ידנית לחודש זה (ברירת מחדל: ${settings.monthlyLimit})` : 'ברירת מחדל לכל חודש'}
        >
          {row.baseOverridden ? (
            <InlineNumber
              label="תקציב בסיסי לחודש זה"
              value={row.base}
              overridden
              onSave={(v) => setBaseOverride(monthKey, category, Math.round(v))}
              onReset={() => setBaseOverride(monthKey, category, null)}
            />
          ) : (
            <InlineNumber
              label="תקציב חודשי בסיסי"
              value={settings.monthlyLimit}
              onSave={(v) => updateSettings(category, { monthlyLimit: Math.round(v) })}
            />
          )}
        </Row>
        {!row.baseOverridden ? (
          <div className="pb-2 text-end">
            <button
              type="button"
              onClick={() => setBaseOverride(monthKey, category, settings.monthlyLimit)}
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
            >
              קבע תקציב שונה רק לחודש הזה
            </button>
          </div>
        ) : null}

        <Row
          label={`קנס מחודש קודם (${prevName})`}
          hint={row.appliedOverridden ? `חישוב אוטומטי: ${formatNum(row.autoApplied)}` : 'מחושב אוטומטית — לחץ לעריכה ידנית'}
        >
          <InlineNumber
            label="קנס מחודש קודם"
            value={row.applied}
            overridden={row.appliedOverridden}
            onSave={(v) => setPenaltyOverride(monthKey, category, Math.round(v))}
            onReset={() => setPenaltyOverride(monthKey, category, null)}
            valueClassName={row.applied > 0 ? 'font-bold text-rose-300' : 'font-bold text-zinc-50'}
            suffix={meta.label}
          />
        </Row>
        {row.applied > 0 ? (
          <div className="pb-2 text-end">
            <button
              type="button"
              onClick={() => setPenaltyOverride(monthKey, category, 0)}
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
            >
              אפס קנס ל-0
            </button>
          </div>
        ) : null}

        <Row label="קנס על חריגה" hint="על כל חריגה מהתקציב, הורד X מהחודש הבא (חוק קבוע)">
          <InlineNumber
            label="קנס לכל יחידת חריגה"
            value={rule.perExcess}
            onSave={(v) => updatePenaltyRule(category, { perExcess: v })}
            suffix="לכל חריגה"
          />
        </Row>

        <Row label="תקציב אפקטיבי לחודש" hint="בסיס פחות קנס">
          <span className="font-extrabold tabular-nums text-zinc-50">{formatNum(row.effective)}</span>
        </Row>

        {settings.focus !== 'monthly' ? (
          <Row label="בנק ימים נקיים" hint={`מותר עד היום ${formatNum(status.allowedUntilToday)}, עישנת ${status.used}`}>
            <span className={`font-bold tabular-nums ${status.bank >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {status.bank >= 0 ? '+' : '−'}
              {formatNum(Math.abs(status.bank))}
            </span>
          </Row>
        ) : null}

        <Row
          label={`קנס צפוי ל${monthNameOnly(nextKey)}`}
          hint={
            row.nextOverridden
              ? `חישוב אוטומטי: ${formatNum(row.generatedAuto)}`
              : row.excess > 0
                ? `חריגה של ${row.excess}`
                : `עוד ${meta.singular} אחת מעבר לתקציב = קנס ${projectedIfOneMore}`
          }
        >
          <InlineNumber
            label="קנס לחודש הבא"
            value={row.nextApplied}
            overridden={row.nextOverridden}
            onSave={(v) => setPenaltyOverride(nextKey, category, Math.round(v))}
            onReset={() => setPenaltyOverride(nextKey, category, null)}
            valueClassName={row.nextApplied > 0 ? 'font-bold text-rose-300' : 'font-bold text-zinc-50'}
          />
        </Row>

        <Row label="מגבלה שבועית (רשות)" hint="ריק או 0 = ללא מגבלה">
          <OptionalNumberInput
            label="מגבלה שבועית"
            value={settings.weeklyLimit}
            onCommit={(v) => updateSettings(category, { weeklyLimit: v })}
          />
        </Row>
      </div>
      <button
        type="button"
        onClick={() => openSettings(category)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100"
      >
        <Settings2 className="size-3.5" />
        כל ההגדרות ל{meta.label}
      </button>
    </Accordion>
  );
}
