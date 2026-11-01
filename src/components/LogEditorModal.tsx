import { useEffect, useState, type FormEvent } from 'react';
import { CalendarClock, Trash2 } from 'lucide-react';
import type { CategoryId } from '../types';
import { CATEGORY_ORDER_LTR, CATEGORY_META, CategoryIcon } from '../lib/categories';
import { combineDateTime, toDateInput, toTimeInput } from '../lib/dates';
import { useStore } from '../store/store';
import { describeEntryShort, useUi } from '../store/ui';
import { Modal } from './ui/Modal';

export function LogEditorModal() {
  const state = useUi((s) => s.logEditor);
  const close = useUi((s) => s.closeLogEditor);
  const showToast = useUi((s) => s.showToast);
  const logs = useStore((s) => s.logs);
  const addLog = useStore((s) => s.addLog);
  const updateLog = useStore((s) => s.updateLog);
  const deleteLog = useStore((s) => s.deleteLog);
  const restoreLog = useStore((s) => s.restoreLog);

  const editing = state?.mode === 'edit' ? logs.find((l) => l.id === state.logId) : undefined;

  const [category, setCategory] = useState<CategoryId>('cigarettes');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!state) return;
    if (state.mode === 'add') {
      const ts = state.presetTimestamp ?? Date.now();
      setCategory(state.category);
      setDate(toDateInput(ts));
      setTime(toTimeInput(ts));
      setNote('');
    } else if (editing) {
      setCategory(editing.category);
      setDate(toDateInput(editing.timestamp));
      setTime(toTimeInput(editing.timestamp));
      setNote(editing.note ?? '');
    }
    // Only reinitialize when the modal target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return null;
  if (state.mode === 'edit' && !editing) return null;

  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time);
  const ts = valid ? combineDateTime(date, time) : NaN;
  const inFuture = valid && ts > Date.now() + 60_000;

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!valid) return;
    if (state.mode === 'add') {
      const entry = addLog({ category, timestamp: ts, note });
      showToast(`נוסף: ${describeEntryShort(entry, CATEGORY_META[category].singular)}`);
    } else if (editing) {
      updateLog(editing.id, { category, timestamp: ts, note });
      showToast('הדיווח עודכן');
    }
    close();
  };

  const onDelete = (): void => {
    if (!editing) return;
    const removed = deleteLog(editing.id);
    if (removed) {
      showToast(`נמחק: ${describeEntryShort(removed, CATEGORY_META[removed.category].singular)}`, {
        label: 'שחזור',
        run: () => restoreLog(removed),
      });
    }
    close();
  };

  const field =
    'w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-sky-500/60';

  return (
    <Modal
      open
      elevated
      onClose={close}
      title={
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="size-5 text-sky-400" />
          {state.mode === 'add' ? 'הוספת דיווח לתאריך/שעה' : 'עריכת דיווח'}
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-zinc-400">קטגוריה</legend>
          <div dir="ltr" className="grid grid-cols-3 gap-2">
            {CATEGORY_ORDER_LTR.map((c) => (
              <button
                key={c}
                dir="rtl"
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                  category === c
                    ? 'border-sky-500/60 bg-sky-500/15 text-sky-200'
                    : 'border-white/10 bg-zinc-950 text-zinc-300 hover:bg-white/5'
                }`}
              >
                <CategoryIcon category={c} className="size-4" />
                {CATEGORY_META[c].singular}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-400">תאריך</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} dir="ltr" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-400">שעה</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} dir="ltr" required />
          </label>
        </div>
        {inFuture ? <p className="text-xs text-amber-300">שים לב: התאריך/שעה שבחרת נמצאים בעתיד.</p> : null}
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-400">הערה (אופציונלי)</span>
          <input
            type="text"
            value={note}
            maxLength={140}
            onChange={(e) => setNote(e.target.value)}
            placeholder="למשל: אחרי ארוחה, עם חברים…"
            className={field}
          />
        </label>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!valid}
            className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-sky-400 disabled:opacity-40"
          >
            {state.mode === 'add' ? 'הוספה' : 'שמירה'}
          </button>
          {state.mode === 'edit' ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10"
            >
              <Trash2 className="size-4" />
              מחיקה
            </button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
