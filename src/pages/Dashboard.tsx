import { useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import type { CategoryId } from '../types';
import { CATEGORY_IDS, CATEGORY_META } from '../lib/categories';
import { computeStatus, type CategoryStatus } from '../lib/calc';
import { dayKeyOf, monthKeyOf } from '../lib/dates';
import { useAppData, useLedger } from '../store/hooks';
import { useUi } from '../store/ui';
import { SummaryBar, CategoryTabs } from '../components/dashboard/SummaryBar';
import { StatusHero } from '../components/dashboard/StatusHero';
import { WeeklyCard } from '../components/dashboard/WeeklyCard';
import { BudgetBreakdown } from '../components/dashboard/BudgetBreakdown';
import { ActionDock } from '../components/dashboard/ActionDock';
import { Accordion, CountBadge } from '../components/ui/Accordion';
import { LogList } from '../components/LogList';

export function Dashboard({ now }: { now: Date }) {
  const data = useAppData();
  const ledger = useLedger(data, now);
  const active = useUi((s) => s.activeCategory);
  const setActive = useUi((s) => s.setActiveCategory);

  const statuses = useMemo(() => {
    const out = {} as Record<CategoryId, CategoryStatus>;
    for (const c of CATEGORY_IDS) out[c] = computeStatus(data, ledger, c, now);
    return out;
  }, [data, ledger, now]);

  const status = statuses[active];
  const settings = data.settings[active];
  const row = ledger[monthKeyOf(now)]?.[active];
  const todayKey = dayKeyOf(now);
  const todayLogs = useMemo(
    () => data.logs.filter((l) => l.category === active && dayKeyOf(l.timestamp) === todayKey).reverse(),
    [data.logs, active, todayKey],
  );
  const hasAnyLogs = data.logs.some((l) => l.category === active);
  const meta = CATEGORY_META[active];

  return (
    <div className="space-y-4">
      <SummaryBar statuses={statuses} active={active} onSelect={setActive} />
      <CategoryTabs active={active} onSelect={setActive} />

      <StatusHero status={status} settings={settings} />

      {settings.weeklyEnabled ? (
        <WeeklyCard status={status} settings={settings} prominent={settings.focus === 'weekly'} />
      ) : null}

      <ActionDock category={active} hasLogs={hasAnyLogs} />

      <Accordion
        icon={<ListChecks className="size-4" />}
        title={`פירוט דיווחי היום — ${meta.label}`}
        summary={<CountBadge count={todayLogs.length} />}
      >
        <LogList logs={todayLogs} emptyText={`אין דיווחים היום. יום נקי! 🌱`} />
      </Accordion>

      {row ? <BudgetBreakdown category={active} settings={settings} row={row} status={status} /> : null}
    </div>
  );
}
