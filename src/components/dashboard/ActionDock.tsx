import { useRef, useState } from 'react';
import { CalendarPlus, Plus, Undo2 } from 'lucide-react';
import type { CategoryId } from '../../types';
import { CATEGORY_META } from '../../lib/categories';
import { useStore } from '../../store/store';
import { describeEntryShort, useUi } from '../../store/ui';

/** Guard against accidental double-taps on the 1-tap log button. */
const TAP_GUARD_MS = 700;

export function ActionDock({ category, hasLogs }: { category: CategoryId; hasLogs: boolean }) {
  const addLog = useStore((s) => s.addLog);
  const undoLast = useStore((s) => s.undoLast);
  const restoreLog = useStore((s) => s.restoreLog);
  const deleteLog = useStore((s) => s.deleteLog);
  const showToast = useUi((s) => s.showToast);
  const openLogEditor = useUi((s) => s.openLogEditor);
  const lastTap = useRef(0);
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(0);
  const meta = CATEGORY_META[category];

  const onAdd = (): void => {
    const now = Date.now();
    if (busy || now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;
    setBusy(true);
    window.setTimeout(() => setBusy(false), TAP_GUARD_MS);
    const entry = addLog({ category, timestamp: now });
    setPulse((p) => p + 1);
    if ('vibrate' in navigator) navigator.vibrate?.(20);
    showToast(`נרשם: ${describeEntryShort(entry, meta.singular)}`, {
      label: 'ביטול',
      run: () => deleteLog(entry.id),
    });
  };

  const onUndo = (): void => {
    const removed = undoLast(category);
    if (removed) {
      showToast(`בוטל: ${describeEntryShort(removed, meta.singular)}`, {
        label: 'שחזור',
        run: () => restoreLog(removed),
      });
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex gap-2">
        <button
          key={pulse}
          type="button"
          onClick={onAdd}
          disabled={busy}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-50 px-4 py-4 text-lg font-extrabold text-zinc-950 shadow-lg shadow-black/40 transition-all active:scale-[0.97] disabled:opacity-80 ${
            pulse > 0 ? 'animate-pop' : ''
          }`}
        >
          <Plus className="size-6" strokeWidth={3} />
          עישנתי {meta.actionLabel}
        </button>
        <button
          type="button"
          onClick={onUndo}
          disabled={!hasLogs}
          aria-label={`ביטול דיווח אחרון של ${meta.singular}`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 bg-zinc-900 px-4 text-xs font-bold text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-35"
        >
          <Undo2 className="size-5" />
          ביטול אחרון
        </button>
      </div>
      <button
        type="button"
        onClick={() => openLogEditor({ mode: 'add', category })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-sky-500/50 hover:text-sky-300"
      >
        <CalendarPlus className="size-4" />
        הוספה לתאריך/שעה אחרת
      </button>
    </section>
  );
}
