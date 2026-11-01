import { useEffect } from 'react';
import { CalendarDays, Gauge, Settings } from 'lucide-react';
import type { Page } from './types';
import { useNow } from './store/hooks';
import { useUi } from './store/ui';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { SettingsModal } from './components/SettingsModal';
import { LogEditorModal } from './components/LogEditorModal';
import { DayEditorModal } from './components/history/DayEditorModal';
import { ToastHost } from './components/ui/Toast';

/** Exact on-screen order, LEFT → RIGHT (container is dir="ltr"): מסך ראשי left, היסטוריה right. */
const NAV_LTR: { id: Page; label: string; icon: typeof Gauge }[] = [
  { id: 'dashboard', label: 'מסך ראשי', icon: Gauge },
  { id: 'history', label: 'היסטוריה', icon: CalendarDays },
];

export default function App() {
  const now = useNow();
  const page = useUi((s) => s.page);
  const setPage = useUi((s) => s.setPage);
  const openSettings = useUi((s) => s.openSettings);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="min-h-dvh bg-slate-950 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.05),transparent_50%)] bg-fixed">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <div className="text-base font-extrabold text-slate-100">מעקב תקציב עישון</div>
            <div className="text-[11px] text-slate-500">
              {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => openSettings()}
            aria-label="הגדרות תקציב וקנסות"
            className="rounded-xl border border-white/8 p-2 text-slate-300 transition-colors hover:bg-white/8 hover:text-slate-100"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4 pb-28">
        {page === 'dashboard' ? <Dashboard now={now} /> : <History now={now} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-slate-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div dir="ltr" className="mx-auto grid max-w-lg grid-cols-2">
          {NAV_LTR.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              dir="rtl"
              type="button"
              onClick={() => setPage(id)}
              aria-current={page === id ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                page === id ? 'text-violet-300' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <SettingsModal now={now} />
      <DayEditorModal />
      <LogEditorModal />
      <ToastHost />
    </div>
  );
}
