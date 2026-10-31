import { CalendarRange } from 'lucide-react';
import type { CategorySettings } from '../../types';
import { STATUS_STYLES } from '../../lib/categories';
import type { CategoryStatus } from '../../lib/calc';
import { formatDayMonth } from '../../lib/dates';
import { useStore } from '../../store/store';
import { InlineNumber } from '../ui/InlineNumber';

interface Props {
  status: CategoryStatus;
  settings: CategorySettings;
  /** prominent = large card (weekly focus); otherwise a compact row */
  prominent: boolean;
}

export function WeeklyCard({ status, settings, prominent }: Props) {
  const updateSettings = useStore((s) => s.updateSettings);
  const weekly = status.weekly;
  if (!settings.weeklyEnabled || !weekly) return null;
  const st = STATUS_STYLES[weekly.level];
  const limit = settings.weeklyLimit;
  const slots = Math.max(limit, status.weekCount);
  const range = `${formatDayMonth(status.weekStart)}–${formatDayMonth(status.weekEnd)}`;

  const limitEditor = (
    <InlineNumber
      label="תקציב שבועי"
      value={limit}
      onSave={(v) => updateSettings(status.category, { weeklyLimit: Math.round(v) })}
      suffix="לשבוע"
    />
  );

  if (!prominent) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border ${st.border} bg-zinc-900/60 px-4 py-3`}>
        <CalendarRange className={`size-4 ${st.text}`} aria-hidden />
        <span className="text-sm text-zinc-300">השבוע ({range}):</span>
        <span className={`text-sm font-bold tabular-nums ${st.text}`}>{status.weekCount}</span>
        <span className="ms-auto flex items-center gap-1 text-xs text-zinc-400">מגבלה: {limitEditor}</span>
      </div>
    );
  }

  return (
    <section className={`rounded-3xl border ${st.border} bg-zinc-900/70 p-4`}>
      <div className="flex items-center gap-2">
        <CalendarRange className={`size-5 ${st.text}`} aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">קצב שבועי</h3>
        <span className="text-xs text-zinc-500">({range})</span>
        <span className="ms-auto flex items-center gap-1 text-xs text-zinc-400">עד {limitEditor}</span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <div className={`text-4xl font-extrabold tabular-nums ${st.text}`}>
          {status.weekCount}
          <span className="text-lg font-semibold text-zinc-500"> / {limit}</span>
        </div>
        <div className="mb-2 flex flex-1 flex-wrap justify-end gap-1.5" aria-hidden>
          {Array.from({ length: Math.min(slots, 14) }, (_, i) => (
            <span
              key={i}
              className={`size-3.5 rounded-full border ${
                i < status.weekCount
                  ? i < limit
                    ? 'border-amber-300/60 bg-amber-400'
                    : 'border-rose-300/60 bg-rose-500'
                  : 'border-emerald-400/50 bg-emerald-400/15'
              }`}
            />
          ))}
        </div>
      </div>
      <p className={`mt-2 text-sm font-semibold ${st.text}`}>{weekly.text}</p>
    </section>
  );
}
