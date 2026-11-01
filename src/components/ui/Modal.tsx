import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Stack above another modal */
  elevated?: boolean;
}

/** Bottom-sheet on mobile, centered dialog on larger screens. */
export function Modal({ open, title, onClose, children, footer, elevated = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${elevated ? 'z-60' : 'z-50'} flex items-end justify-center sm:items-center sm:p-4`}
      role="presentation"
    >
      <div className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="animate-sheet-up relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-white/8 bg-slate-900 shadow-2xl outline-none sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <h2 className="flex-1 text-base font-bold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/8 hover:text-slate-100"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-white/5 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
