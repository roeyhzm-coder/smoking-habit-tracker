import { useState } from 'react';

interface Props {
  /** null = empty (no value) */
  value: number | null;
  /** Called with null when the field is cleared or set to 0. */
  onCommit: (v: number | null) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

/** Plain numeric box that saves on blur / Enter. Empty or 0 means "not set". */
export function OptionalNumberInput({ value, onCommit, label, placeholder = 'ללא', className = '' }: Props) {
  const external = value !== null && value > 0 ? String(value) : '';
  const [draft, setDraft] = useState(external);
  const [lastExternal, setLastExternal] = useState(external);

  // Re-sync when the stored value changes elsewhere (e.g. edited from another screen).
  if (lastExternal !== external) {
    setLastExternal(external);
    setDraft(external);
  }

  const commit = (): void => {
    const trimmed = draft.trim();
    if (trimmed === '') {
      onCommit(null);
      return;
    }
    const n = Math.round(Number(trimmed.replace(',', '.')));
    if (!Number.isFinite(n) || n <= 0) {
      setDraft('');
      onCommit(null);
      return;
    }
    setDraft(String(n));
    onCommit(n);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      dir="ltr"
      className={`w-16 rounded-lg border border-white/15 bg-zinc-950 px-2 py-1 text-center text-sm font-bold tabular-nums text-zinc-50 placeholder:font-normal placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-sky-500/60 ${className}`}
    />
  );
}
