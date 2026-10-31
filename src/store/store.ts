import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AppData,
  CategoryId,
  CategorySettings,
  LogEntry,
  MonthOverrides,
  PenaltyRule,
} from '../types';
import { CATEGORY_IDS, DEFAULT_SETTINGS, createDefaultData } from '../lib/categories';

export const STORAGE_KEY = 'smoking-habit-tracker:v1';

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function setOverride(
  map: MonthOverrides,
  monthKey: string,
  cat: CategoryId,
  value: number | null,
): MonthOverrides {
  const next: MonthOverrides = { ...map };
  const row = { ...(next[monthKey] ?? {}) };
  if (value === null) delete row[cat];
  else row[cat] = Math.max(0, value);
  if (Object.keys(row).length === 0) delete next[monthKey];
  else next[monthKey] = row;
  return next;
}

// ---------- Import validation ----------
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isCategory(v: unknown): v is CategoryId {
  return typeof v === 'string' && (CATEGORY_IDS as readonly string[]).includes(v);
}
function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function sanitizePenalty(v: unknown, fb: PenaltyRule): PenaltyRule {
  if (!isRecord(v)) return { ...fb };
  // v1 stored { mode, multiplier, fixedAmount } — the multiplier carries over as "per excess unit".
  return { perExcess: Math.max(0, num(v.perExcess, num(v.multiplier, fb.perExcess))) };
}

function sanitizeWeekly(s: Record<string, unknown>, fb: number | null): number | null {
  // v1 had an explicit on/off toggle; a disabled limit becomes "no limit".
  if (s.weeklyEnabled === false) return null;
  if (s.weeklyLimit === null) return null;
  const n = num(s.weeklyLimit, fb ?? 0);
  return n > 0 ? Math.round(n) : null;
}

function sanitizeSettings(v: unknown): Record<CategoryId, CategorySettings> {
  const out = structuredClone(DEFAULT_SETTINGS);
  if (!isRecord(v)) return out;
  for (const cat of CATEGORY_IDS) {
    const s = v[cat];
    if (!isRecord(s)) continue;
    const fb = DEFAULT_SETTINGS[cat];
    out[cat] = {
      monthlyLimit: Math.max(0, num(s.monthlyLimit, fb.monthlyLimit)),
      weeklyLimit: sanitizeWeekly(s, fb.weeklyLimit),
      dailyOverride:
        s.dailyOverride === null ? null : typeof s.dailyOverride === 'number' ? Math.max(0, s.dailyOverride) : fb.dailyOverride,
      focus: s.focus === 'daily' || s.focus === 'weekly' || s.focus === 'monthly' ? s.focus : fb.focus,
      penalty: sanitizePenalty(s.penalty, fb.penalty),
    };
  }
  return out;
}

function sanitizeOverrides(v: unknown): MonthOverrides {
  const out: MonthOverrides = {};
  if (!isRecord(v)) return out;
  for (const [key, row] of Object.entries(v)) {
    if (!/^\d{4}-\d{2}$/.test(key) || !isRecord(row)) continue;
    const r: Partial<Record<CategoryId, number>> = {};
    for (const cat of CATEGORY_IDS) {
      const val = row[cat];
      if (typeof val === 'number' && Number.isFinite(val)) r[cat] = Math.max(0, val);
    }
    if (Object.keys(r).length > 0) out[key] = r;
  }
  return out;
}

function sanitizeLogs(v: unknown): LogEntry[] {
  if (!Array.isArray(v)) return [];
  const out: LogEntry[] = [];
  for (const item of v) {
    if (!isRecord(item) || !isCategory(item.category)) continue;
    const ts = num(item.timestamp, NaN);
    if (!Number.isFinite(ts)) continue;
    const entry: LogEntry = {
      id: typeof item.id === 'string' && item.id ? item.id : uid(),
      category: item.category,
      timestamp: ts,
      createdAt: num(item.createdAt, ts),
    };
    if (typeof item.note === 'string' && item.note.trim()) entry.note = item.note.trim();
    out.push(entry);
  }
  return out.sort((a, b) => a.timestamp - b.timestamp);
}

export function sanitizeData(raw: unknown): AppData {
  if (!isRecord(raw)) throw new Error('קובץ לא תקין');
  return {
    version: 2,
    settings: sanitizeSettings(raw.settings),
    logs: sanitizeLogs(raw.logs),
    penaltyOverrides: sanitizeOverrides(raw.penaltyOverrides),
    baseBudgetOverrides: sanitizeOverrides(raw.baseBudgetOverrides),
  };
}

// ---------- Store ----------
export interface LogInput {
  category: CategoryId;
  timestamp: number;
  note?: string;
}

interface Actions {
  addLog: (input: LogInput) => LogEntry;
  updateLog: (id: string, patch: Partial<Omit<LogEntry, 'id' | 'createdAt'>>) => void;
  deleteLog: (id: string) => LogEntry | undefined;
  restoreLog: (entry: LogEntry) => void;
  /** Removes the most recently created entry of a category. */
  undoLast: (cat: CategoryId) => LogEntry | undefined;
  updateSettings: (cat: CategoryId, patch: Partial<CategorySettings>) => void;
  updatePenaltyRule: (cat: CategoryId, patch: Partial<PenaltyRule>) => void;
  setPenaltyOverride: (monthKey: string, cat: CategoryId, value: number | null) => void;
  setBaseOverride: (monthKey: string, cat: CategoryId, value: number | null) => void;
  importData: (raw: unknown) => void;
  resetSettings: () => void;
  resetAll: () => void;
}

export type Store = AppData & Actions;

function insertSorted(logs: LogEntry[], entry: LogEntry): LogEntry[] {
  return [...logs, entry].sort((a, b) => a.timestamp - b.timestamp);
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createDefaultData(),

      addLog: ({ category, timestamp, note }) => {
        const entry: LogEntry = { id: uid(), category, timestamp, createdAt: Date.now() };
        const trimmed = note?.trim();
        if (trimmed) entry.note = trimmed;
        set((s) => ({ logs: insertSorted(s.logs, entry) }));
        return entry;
      },

      updateLog: (id, patch) =>
        set((s) => ({
          logs: s.logs
            .map((l) => {
              if (l.id !== id) return l;
              const next: LogEntry = { ...l, ...patch };
              if (patch.note !== undefined) {
                const t = patch.note.trim();
                if (t) next.note = t;
                else delete next.note;
              }
              return next;
            })
            .sort((a, b) => a.timestamp - b.timestamp),
        })),

      deleteLog: (id) => {
        const found = get().logs.find((l) => l.id === id);
        if (found) set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
        return found;
      },

      restoreLog: (entry) =>
        set((s) => (s.logs.some((l) => l.id === entry.id) ? s : { logs: insertSorted(s.logs, entry) })),

      undoLast: (cat) => {
        const candidates = get().logs.filter((l) => l.category === cat);
        if (candidates.length === 0) return undefined;
        const last = candidates.reduce((a, b) => (b.createdAt > a.createdAt ? b : a));
        set((s) => ({ logs: s.logs.filter((l) => l.id !== last.id) }));
        return last;
      },

      updateSettings: (cat, patch) =>
        set((s) => ({ settings: { ...s.settings, [cat]: { ...s.settings[cat], ...patch } } })),

      updatePenaltyRule: (cat, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [cat]: { ...s.settings[cat], penalty: { ...s.settings[cat].penalty, ...patch } },
          },
        })),

      setPenaltyOverride: (monthKey, cat, value) =>
        set((s) => ({ penaltyOverrides: setOverride(s.penaltyOverrides, monthKey, cat, value) })),

      setBaseOverride: (monthKey, cat, value) =>
        set((s) => ({ baseBudgetOverrides: setOverride(s.baseBudgetOverrides, monthKey, cat, value) })),

      importData: (raw) => set(() => sanitizeData(raw)),

      resetSettings: () => set(() => ({ settings: structuredClone(DEFAULT_SETTINGS) })),

      resetAll: () => set(() => createDefaultData()),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted) => persisted as AppData,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): AppData => ({
        version: 2,
        settings: s.settings,
        logs: s.logs,
        penaltyOverrides: s.penaltyOverrides,
        baseBudgetOverrides: s.baseBudgetOverrides,
      }),
      merge: (persisted, current) => {
        try {
          return { ...current, ...sanitizeData(persisted) };
        } catch {
          return current;
        }
      },
    },
  ),
);

export function selectData(s: Store): AppData {
  return {
    version: 2,
    settings: s.settings,
    logs: s.logs,
    penaltyOverrides: s.penaltyOverrides,
    baseBudgetOverrides: s.baseBudgetOverrides,
  };
}

export function exportJson(): string {
  return JSON.stringify(selectData(useStore.getState()), null, 2);
}
