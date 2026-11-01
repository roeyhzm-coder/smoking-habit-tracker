import type { ComponentType } from 'react';
import type { AppData, CategoryId, CategorySettings, PacingFocus, StatusLevel } from '../types';
import { CigarIcon, CigaretteIcon, JointIcon, type IconProps } from '../components/icons/CategoryIcons';

export { CATEGORY_IDS } from '../types';

/**
 * Exact on-screen order of side-by-side category controls, LEFT → RIGHT:
 * סיגריות (left) · סיגרים (middle) · פייסלים (right).
 * Containers rendering this list MUST set dir="ltr" so the visual order is
 * guaranteed regardless of the page's RTL direction (each item sets dir="rtl"
 * internally to keep Hebrew icon/label flow).
 */
export const CATEGORY_ORDER_LTR: readonly CategoryId[] = ['cigarettes', 'cigars', 'joints'] as const;

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
    iconColor: 'text-slate-200',
    short: 'סג',
  },
  joints: {
    id: 'joints',
    label: 'פייסלים',
    singular: 'פייסל',
    actionLabel: 'פייסל',
    Icon: JointIcon,
    iconColor: 'text-violet-300',
    short: 'פ',
  },
  cigars: {
    id: 'cigars',
    label: 'סיגרים',
    singular: 'סיגר',
    actionLabel: 'סיגר',
    Icon: CigarIcon,
    iconColor: 'text-amber-500',
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
    dot: 'bg-teal-400',
    text: 'text-teal-300',
    border: 'border-teal-400/25',
    glow: 'shadow-[0_0_40px_-12px_rgba(20,184,166,0.35)]',
    bg: 'bg-teal-500/10',
    soft: 'from-teal-500/10',
    bar: 'bg-teal-500',
  },
  exact: {
    dot: 'bg-indigo-400',
    text: 'text-indigo-300',
    border: 'border-indigo-400/30',
    glow: 'shadow-[0_0_40px_-12px_rgba(129,140,248,0.4)]',
    bg: 'bg-indigo-400/12',
    soft: 'from-indigo-400/10',
    bar: 'bg-indigo-400',
  },
  warning: {
    dot: 'bg-amber-300',
    text: 'text-amber-300',
    border: 'border-amber-400/30',
    glow: 'shadow-[0_0_40px_-12px_rgba(245,158,11,0.3)]',
    bg: 'bg-amber-500/10',
    soft: 'from-amber-500/10',
    bar: 'bg-amber-300',
  },
  bad: {
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    border: 'border-rose-400/30',
    glow: 'shadow-[0_0_40px_-12px_rgba(244,63,94,0.35)]',
    bg: 'bg-rose-500/10',
    soft: 'from-rose-500/10',
    bar: 'bg-rose-500/85',
  },
};
