import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { CATEGORY_IDS, CATEGORY_META } from '../../lib/categories';
import { combineDateTime, dayKeyOf, formatFullDate } from '../../lib/dates';
import { useStore } from '../../store/store';
import { useUi } from '../../store/ui';
import { Modal } from '../ui/Modal';
import { LogList } from '../LogList';

export function DayEditorModal() {
  const dayKey = useUi((s) => s.dayEditor);
  const close = useUi((s) => s.closeDayEditor);
  const openLogEditor = useUi((s) => s.openLogEditor);
  const activeCategory = useUi((s) => s.activeCategory);
  const logs = useStore((s) => s.logs);

  const dayLogs = useMemo(() => (dayKey ? logs.filter((l) => dayKeyOf(l.timestamp) === dayKey) : []), [logs, dayKey]);

  if (!dayKey) return null;
  const dayStart = combineDateTime(dayKey, '00:00');
  const counts = CATEGORY_IDS.map((c) => ({ c, n: dayLogs.filter((l) => l.category === c).length }));

  const presetTs = (): number => {
    const now = new Date();
    // Same day as today → now; otherwise default to 20:00 on that date.
    return dayKeyOf(now) === dayKey ? now.getTime() : combineDateTime(dayKey, '20:00');
  };

  return (
    <Modal
      open
      onClose={close}
      title={formatFullDate(dayStart)}
      footer={
        <button
          type="button"
          onClick={() => openLogEditor({ mode: 'add', category: activeCategory, presetTimestamp: presetTs() })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-sky-400"
        >
          <Plus className="size-4" strokeWidth={3} />
          הוספת דיווח לתאריך זה
        </button>
      }
    >
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        {counts.map(({ c, n }) => (
          <div key={c} className="rounded-xl border border-white/8 bg-zinc-950/60 px-2 py-2">
            <div className="text-[11px] text-zinc-400">{CATEGORY_META[c].label}</div>
            <div className="text-lg font-extrabold tabular-nums text-zinc-50">{n}</div>
          </div>
        ))}
      </div>
      <LogList logs={dayLogs} emptyText="אין דיווחים ביום זה — יום נקי 🌱" />
    </Modal>
  );
}
