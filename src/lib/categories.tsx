import type { ComponentType } from 'react';
import type { AppData, CategoryId, CategorySettings, PacingFocus, StatusLevel } from '../types';
import { CigarIcon, CigaretteIcon, JointIcon, type IconProps } from '../components/icons/CategoryIcons';

export { CATEGORY_IDS } from '../types';

/**
 * Visual order for side-by-side category controls. The app is RTL, so the
 * FIRST item renders on the RIGHT. Reversed so that, visually left → right,
 * the order reads: סיגריות · פייסלים · סיגרים.
 */
export const CATEGORY_DISPLAY_ORDER: readonly CategoryId[] = ['cigars', 'joints', 'cigarettes'] as const;

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  singular: string;
  /** "עישנתי ___" verb completion */
  actionLabel: string;
  /** Custom inline SVG icon (uses currentColor for the main body) */
  Icon: ComponentType<IconProps>;
  /** Tailwind text color applied to the icon */
  iconColor: string;
  /** Very short label for compact calendar cells */
  short: string;
}

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  cigarettes: {
    id: 'cigarettes',
    label: 'סיגריות',
    singular: 'סיגריה',
    actionLabel: 'סיגריה',
    Icon: CigaretteIcon,
    iconColor: 'text-zinc-100',
    short: 'סג',
  },
  joints: {
    id: 'joints',
    label: 'פייסלים',
    singular: 'פייסל',
    actionLabel: 'פייסל',
    Icon: JointIcon,
    iconColor: 'text-lime-400',
    short: 'פ',
  },
  cigars: {
    id: 'cigars',
    label: 'סיגרים',
    singular: 'סיגר',
    actionLabel: 'סיגר',
    Icon: CigarIcon,
    iconColor: 'text-amber-600',
    short: 'סר',
  },
};

export function CategoryIcon({
  category,
  className = 'size-4',
  color,
}: {
  category: CategoryId;
  className?: string;
  /** Overrides the category's default icon color (e.g. on a light background). */
  color?: string;
}) {
  const { Icon, iconColor } = CATEGORY_META[category];
  return <Icon className={`${color ?? iconColor} ${className} shrink-0`} />;
}

export const FOCUS_LABEL: Record<PacingFocus, string> = {
  daily: 'יומי + חודשי',
  weekly: 'שבועי + חודשי',
  monthly: 'חודשי / מזדמן',
};

export const STATUS_LABEL: Record<StatusLevel, string> = {
  good: 'מצב טוב',
  exact: 'מצב בסדר — בדיוק ביעד',
  warning: 'שים לב',
  bad: 'מצב לא טוב',
};

export const DEFAULT_SETTINGS: Record<CategoryId, CategorySettings> = {
  cigarettes: {
    monthlyLimit: 30,
    weeklyLimit: null,
    dailyOverride: 1,
    focus: 'daily',
    penalty: { perExcess: 2 },
  },
  joints: {
    monthlyLimit: 4,
    weeklyLimit: 1,
    dailyOverride: null,
    focus: 'weekly',
    penalty: { perExcess: 2 },
  },
  cigars: {
    monthlyLimit: 2,
    weeklyLimit: null,
    dailyOverride: null,
    focus: 'monthly',
    penalty: { perExcess: 2 },
  },
};

/** Active weekly limit, or null when none is set (null / 0). */
export function weeklyLimitOf(s: CategorySettings): number | null {
  return s.weeklyLimit !== null && s.weeklyLimit > 0 ? s.weeklyLimit : null;
}

export function createDefaultData(): AppData {
  return {
    version: 2,
    settings: structuredClone(DEFAULT_SETTINGS),
    logs: [],
    penaltyOverrides: {},
    baseBudgetOverrides: {},
  };
}

export const STATUS_STYLES: Record<
  StatusLevel,
  { dot: string; text: string; border: string; glow: string; bg: string; soft: string; bar: string }
> = {
  good: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(16,185,129,0.55)]',
    bg: 'bg-emerald-500/10',
    soft: 'from-emerald-500/15',
    bar: 'bg-emerald-400',
  },
  exact: {
    dot: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_40px_-12px_rgba(59,130,246,0.6)]',
    bg: 'bg-blue-500/12',
    soft: 'from-blue-500/15',
    bar: 'bg-blue-500',
  },
  warning: {
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(245,158,11,0.55)]',
    bg: 'bg-amber-500/10',
    soft: 'from-amber-500/15',
    bar: 'bg-amber-400',
  },
  bad: {
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_40px_-12px_rgba(244,63,94,0.6)]',
    bg: 'bg-rose-500/10',
    soft: 'from-rose-500/15',
    bar: 'bg-rose-500',
  },
};
