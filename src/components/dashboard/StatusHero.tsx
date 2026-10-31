import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';
import type { CategorySettings, StatusLevel } from '../../types';
import { CATEGORY_META, STATUS_LABEL, STATUS_STYLES } from '../../lib/categories';
import { formatNum, type CategoryStatus } from '../../lib/calc';
import { useStore } from '../../store/store';
import { InlineNumber } from '../ui/InlineNumber';

const LEVEL_ICON: Record<StatusLevel, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  bad: OctagonAlert,
};

function Indicator({ level, label, text }: { level: StatusLevel; label: string; text: string }) {
  const st = STATUS_STYLES[level];
  const Icon = LEVEL_ICON[level];
  return (
    <div className={`flex items-start gap-2 rounded-xl ${st.bg} px-3 py-2`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${st.text}`} aria-hidden />
      <p className="text-sm leading-snug">
        <span className="text-zinc-400">{label}: </span>
        <span className={`font-semibold ${st.text}`}>{text}</span>
      </p>
    </div>
  );
}

export function StatusHero({ status, settings }: { status: CategoryStatus; settings: CategorySettings }) {
  const updateSettings = useStore((s) => s.updateSettings);
  const st = STATUS_STYLES[status.level];
  const meta = CATEGORY_META[status.category];
  const usedPct = status.effective > 0 ? Math.min(100, (status.used / status.effective) * 100) : status.used > 0 ? 100 : 0;
  const pacePct = status.effective > 0 ? Math.min(100, (status.allowedUntilToday / status.effective) * 100) : 0;
  const barColor = status.level === 'good' ? 'bg-emerald-400' : status.level === 'warning' ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border ${st.border} ${st.glow} bg-linear-to-b ${st.soft} to-zinc-900/80 p-5 transition-all duration-500`}
    >
      <div className="flex items-center gap-2">
        <span className={`size-2.5 rounded-full ${st.dot}`} />
        <span className={`text-xs font-bold tracking-wide ${st.text}`}>{STATUS_LABEL[status.level]}</span>
        <span className="ms-auto text-xs text-zinc-500">
          יום {status.dayOfMonth} מתוך {status.daysInMonth}
        </span>
      </div>
      <h2 className="mt-1 text-2xl font-extrabold text-zinc-50">{status.headline}</h2>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-black/25 px-2 py-3">
          <div className="text-[11px] font-semibold text-zinc-400">תקציב אפקטיבי</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums text-zinc-50">{formatNum(status.effective)}</div>
        </div>
        <div className="rounded-2xl bg-black/25 px-2 py-3">
          <div className="text-[11px] font-semibold text-zinc-400">עישנת</div>
          <div className={`mt-1 text-2xl font-extrabold tabular-nums ${st.text}`}>{status.used}</div>
        </div>
        <div className="rounded-2xl bg-black/25 px-2 py-3">
          <div className="text-[11px] font-semibold text-zinc-400">{status.remaining >= 0 ? 'נשאר' : 'חריגה'}</div>
          <div
            className={`mt-1 text-2xl font-extrabold tabular-nums ${status.remaining >= 0 ? 'text-zinc-50' : 'text-rose-300'}`}
          >
            {formatNum(Math.abs(status.remaining))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/8" aria-hidden>
          <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${usedPct}%` }} />
          {settings.focus !== 'monthly' ? (
            <div
              className="absolute top-0 h-full w-0.5 bg-zinc-100/80"
              style={{ insetInlineStart: `${pacePct}%` }}
              title="הקצב המותר עד היום"
            />
          ) : null}
        </div>
        {settings.focus !== 'monthly' ? (
          <div className="mt-1.5 flex justify-between text-[11px] text-zinc-500">
            <span>
              מותר עד היום: <span className="tabular-nums text-zinc-300">{formatNum(status.allowedUntilToday)}</span>
            </span>
            <span>
              {status.bank >= 0 ? 'בנק ימים נקיים: ' : 'מעל הקצב: '}
              <span className={`tabular-nums ${status.bank >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {formatNum(Math.abs(status.bank))}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {settings.focus === 'daily' ? (
          <div className="space-y-1">
            <Indicator level={status.daily.level} label="יומי" text={status.daily.text} />
            <div className="flex items-center gap-1 ps-3 text-xs text-zinc-500">
              תקציב יומי:
              <InlineNumber
                label="תקציב יומי"
                value={Number(status.dailyBudget.toFixed(2))}
                step={0.5}
                overridden={status.dailyOverridden}
                onSave={(v) => updateSettings(status.category, { dailyOverride: v })}
                onReset={() => updateSettings(status.category, { dailyOverride: null })}
                valueClassName="font-semibold text-zinc-200"
                suffix={`${meta.label} ליום`}
              />
            </div>
          </div>
        ) : null}
        <Indicator level={status.general.level} label="מצב כללי" text={status.general.text} />
      </div>
    </section>
  );
}
