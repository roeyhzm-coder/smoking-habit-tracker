import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUi } from '../../store/ui';

export function ToastHost() {
  const toast = useUi((s) => s.toast);
  const dismiss = useUi((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(dismiss, 5000);
    return () => window.clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-70 flex justify-center px-4" aria-live="polite">
      <div
        key={toast.id}
        className="animate-sheet-up pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-zinc-800/95 px-4 py-3 text-sm text-zinc-100 shadow-xl backdrop-blur"
      >
        <span className="flex-1">{toast.message}</span>
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.run();
              dismiss();
            }}
            className="rounded-lg bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/30"
          >
            {toast.action.label}
          </button>
        ) : null}
        <button type="button" onClick={dismiss} aria-label="סגירה" className="text-zinc-400 hover:text-zinc-100">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
