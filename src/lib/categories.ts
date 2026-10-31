export { CATEGORY_IDS } from '../types';
import type { AppData, CategoryId, CategorySettings, PacingFocus, StatusLevel } from '../types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  singular: string;
  /** "עישנתי ___" verb completion */
  actionLabel: string;
  emoji: string;
  /** Very short label for compact calendar cells */
  short: string;
}

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  cigarettes: { id: 'cigarettes', label: 'סיגריות', singular: 'סיגריה', actionLabel: 'סיגריה', emoji: '🚬', short: 'סג' },
  joints: { id: 'joints', label: 'פייסלים', singular: 'פייסל', actionLabel: 'פייסל', emoji: '🌿', short: 'פ' },
  cigars: { id: 'cigars', label: 'סיגרים', singular: 'סיגר', actionLabel: 'סיגר', emoji: '🟤', short: 'סר' },
};

export const FOCUS_LABEL: Record<PacingFocus, string> = {
  daily: 'יומי + חודשי',
  weekly: 'שבועי + חודשי',
  monthly: 'חודשי / מזדמן',
};

export const STATUS_LABEL: Record<StatusLevel, string> = {
  good: 'מצב טוב',
  warning: 'מצב בסדר',
  bad: 'מצב לא טוב',
};

export const DEFAULT_SETTINGS: Record<CategoryId, CategorySettings> = {
  cigarettes: {
    monthlyLimit: 30,
    weeklyEnabled: false,
    weeklyLimit: 7,
    dailyOverride: 1,
    focus: 'daily',
    penalty: { mode: 'multiplier', multiplier: 2, fixedAmount: 3 },
  },
  joints: {
    monthlyLimit: 4,
    weeklyEnabled: true,
    weeklyLimit: 1,
    dailyOverride: null,
    focus: 'weekly',
    penalty: { mode: 'multiplier', multiplier: 2, fixedAmount: 3 },
  },
  cigars: {
    monthlyLimit: 2,
    weeklyEnabled: false,
    weeklyLimit: 1,
    dailyOverride: null,
    focus: 'monthly',
    penalty: { mode: 'multiplier', multiplier: 2, fixedAmount: 1 },
  },
};

export function createDefaultData(): AppData {
  return {
    version: 1,
    settings: structuredClone(DEFAULT_SETTINGS),
    logs: [],
    penaltyOverrides: {},
    baseBudgetOverrides: {},
  };
}

export const STATUS_STYLES: Record<
  StatusLevel,
  { dot: string; text: string; border: string; glow: string; bg: string; soft: string }
> = {
  good: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(16,185,129,0.55)]',
    bg: 'bg-emerald-500/10',
    soft: 'from-emerald-500/15',
  },
  warning: {
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(245,158,11,0.55)]',
    bg: 'bg-amber-500/10',
    soft: 'from-amber-500/15',
  },
  bad: {
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(244,63,94,0.6)]',
    bg: 'bg-rose-500/10',
    soft: 'from-rose-500/15',
  },
};
