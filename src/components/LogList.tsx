import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { CategoryId, LogEntry } from '../types';
import { CATEGORY_IDS, CATEGORY_META } from '../lib/categories';
import { combineDateTime, toDateInput, toTimeInput } from '../lib/dates';
import { useStore } from '../store/store';
import { describeEntryShort, useUi } from '../store/ui';

interface LogListProps {
  logs: LogEntry[];
  emptyText: string;
  /** Show the category chip/select (false when list is already filtered to a single category). */
  showCategory?: boolean;
}

export function LogList({ logs, emptyText, showCategory = true }: LogListProps) {
  if (logs.length === 0) {
    return <p className="py-3 text-center text-sm text-zinc-500">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-white/6">
      {logs.map((log) => (
        <LogRow key={log.id} log={log} showCategory={showCategory} />
      ))}
    </ul>
  );
}

function LogRow({ log, showCategory }: { log: LogEntry; showCategory: boolean }) {
  const updateLog = useStore((s) => s.updateLog);
  const deleteLog = useStore((s) => s.deleteLog);
  const restoreLog = useStore((s) => s.restoreLog);
  const showToast = useUi((s) => s.showToast);
  const openLogEditor = useUi((s) => s.openLogEditor);
  const [time, setTime] = useState(() => toTimeInput(log.timestamp));
  const [lastTs, setLastTs] = useState(log.timestamp);

  // Keep local input in sync if the entry is changed elsewhere.
  if (lastTs !== log.timestamp) {
    setLastTs(log.timestamp);
    setTime(toTimeInput(log.timestamp));
  }

  const commitTime = (): void => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setTime(toTimeInput(log.timestamp));
      return;
    }
    const ts = combineDateTime(toDateInput(log.timestamp), time);
    if (ts !== log.timestamp) updateLog(log.id, { timestamp: ts });
  };

  const onDelete = (): void => {
    const removed = deleteLog(log.id);
    if (removed) {
      showToast(`נמחק: ${describeEntryShort(removed, CATEGORY_META[removed.category].singular)}`, {
        label: 'שחזור',
        run: () => restoreLog(removed),
      });
    }
  };

  return (
    <li className="flex items-center gap-2 py-2">
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={commitTime}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        aria-label="שעת הדיווח"
        dir="ltr"
        className="w-[5.5rem] rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-sm tabular-nums text-zinc-100 outline-none focus:ring-2 focus:ring-sky-500/60"
      />
      {showCategory ? (
        <select
          value={log.category}
          onChange={(e) => updateLog(log.id, { category: e.target.value as CategoryId })}
          aria-label="קטגוריה"
          className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          {CATEGORY_IDS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].singular}
            </option>
          ))}
        </select>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-xs text-zinc-400" title={log.note}>
        {log.note ?? ''}
      </span>
      <button
        type="button"
        onClick={() => openLogEditor({ mode: 'edit', logId: log.id })}
        aria-label="עריכה מלאה"
        title="עריכה מלאה (תאריך, קטגוריה, הערה)"
        className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/8 hover:text-sky-300"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="מחיקה"
        title="מחיקה"
        className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/15 hover:text-rose-300"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
