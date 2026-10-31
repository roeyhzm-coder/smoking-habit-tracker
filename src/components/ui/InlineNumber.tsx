import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Pencil, RotateCcw, X } from 'lucide-react';
import { formatNum } from '../../lib/calc';

interface InlineNumberProps {
  value: number;
  onSave: (v: number) => void;
  /** When provided and `overridden` is true, shows a "reset to auto" button. */
  onReset?: () => void;
  overridden?: boolean;
  min?: number;
  /** Hint for the expected increment (kept for API symmetry; free-form decimal entry is allowed). */
  step?: number;
  suffix?: string;
  label: string;
  className?: string;
  valueClassName?: string;
}

/** Click-to-edit number with pencil icon. Enter saves, Escape cancels. */
export function InlineNumber({
  value,
  onSave,
  onReset,
  overridden = false,
  min = 0,
  suffix,
  label,
  className = '',
  valueClassName = 'font-bold text-zinc-50',
}: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, value]);

  const parsed = Number(draft.replace(',', '.'));
  const valid = draft.trim() !== '' && Number.isFinite(parsed) && parsed >= min;

  const submit = (e?: FormEvent): void => {
    e?.preventDefault();
    if (!valid) return;
    onSave(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={submit} className={`inline-flex items-center gap-1 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setEditing(false);
            }
          }}
          className={`w-16 rounded-lg border bg-zinc-950 px-2 py-1 text-center text-sm tabular-nums text-zinc-50 outline-none focus:ring-2 focus:ring-sky-500/60 ${
            valid ? 'border-white/15' : 'border-rose-500/70'
          }`}
          dir="ltr"
        />
        <button
          type="submit"
          disabled={!valid}
          aria-label="שמירה"
          className="rounded-md p-1 text-emerald-400 hover:bg-emerald-500/15 disabled:opacity-40"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="ביטול"
          className="rounded-md p-1 text-zinc-400 hover:bg-white/8"
        >
          <X className="size-4" />
        </button>
      </form>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`עריכת ${label}`}
        title={`עריכת ${label}`}
        className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-white/8"
      >
        <span className={`tabular-nums ${valueClassName}`}>{formatNum(value)}</span>
        {suffix ? <span className="text-xs text-zinc-400">{suffix}</span> : null}
        <Pencil className="size-3.5 text-zinc-500 transition-colors group-hover:text-sky-400" aria-hidden />
      </button>
      {overridden ? (
        <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">ידני</span>
      ) : null}
      {overridden && onReset ? (
        <button
          type="button"
          onClick={onReset}
          aria-label={`איפוס ${label} לחישוב אוטומטי`}
          title="חזרה לחישוב אוטומטי"
          className="rounded-md p-1 text-zinc-500 hover:bg-white/8 hover:text-zinc-200"
        >
          <RotateCcw className="size-3.5" />
        </button>
      ) : null}
    </span>
  );
}
