import type { CategoryId } from '../../types';
import { CATEGORY_ORDER_LTR, CATEGORY_META, CategoryIcon, STATUS_LABEL, STATUS_STYLES } from '../../lib/categories';
import type { CategoryStatus } from '../../lib/calc';

interface Props {
  statuses: Record<CategoryId, CategoryStatus>;
  active: CategoryId;
  onSelect: (c: CategoryId) => void;
}

export function SummaryBar({ statuses, active, onSelect }: Props) {
  return (
    <div dir="ltr" className="grid grid-cols-3 gap-2">
      {CATEGORY_ORDER_LTR.map((cat) => {
        const s = statuses[cat];
        const st = STATUS_STYLES[s.level];
        const isActive = cat === active;
        return (
          <button
            key={cat}
            dir="rtl"
            type="button"
            onClick={() => onSelect(cat)}
            aria-pressed={isActive}
            aria-label={`${CATEGORY_META[cat].label}: ${s.used} מתוך ${s.effective}, ${STATUS_LABEL[s.level]}`}
            className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-2 text-start transition-all ${
              isActive ? `${st.border} ${st.bg}` : 'border-white/8 bg-zinc-900/60 hover:bg-zinc-900'
            }`}
          >
            <span className="flex w-full items-center gap-1.5">
              <span className={`size-2 shrink-0 rounded-full ${st.dot} ${s.level !== 'good' ? 'animate-pulse' : ''}`} />
              <span className="truncate text-xs font-semibold text-zinc-300">{CATEGORY_META[cat].label}</span>
              <CategoryIcon category={cat} className="ms-auto size-3.5" />
            </span>
            <span className="tabular-nums text-sm font-bold text-zinc-50" dir="ltr">
              {s.used}
              <span className="font-medium text-zinc-500"> / {s.effective}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CategoryTabs({ active, onSelect }: { active: CategoryId; onSelect: (c: CategoryId) => void }) {
  return (
    <div dir="ltr" role="tablist" aria-label="קטגוריה" className="grid grid-cols-3 gap-1 rounded-2xl border border-white/8 bg-zinc-900/80 p-1">
      {CATEGORY_ORDER_LTR.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            dir="rtl"
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onSelect(cat)}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-bold transition-all ${
              isActive ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <CategoryIcon category={cat} color={isActive && cat === 'cigarettes' ? 'text-zinc-500' : undefined} />
            {CATEGORY_META[cat].label}
          </button>
        );
      })}
    </div>
  );
}
