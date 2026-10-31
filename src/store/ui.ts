import { create } from 'zustand';
import type { CategoryId, LogEntry, Page } from '../types';

export type LogEditorState =
  | { mode: 'add'; category: CategoryId; presetTimestamp?: number }
  | { mode: 'edit'; logId: string };

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

interface UiState {
  page: Page;
  activeCategory: CategoryId;
  settingsOpen: boolean;
  settingsCategory: CategoryId;
  logEditor: LogEditorState | null;
  dayEditor: string | null;
  toast: Toast | null;
  setPage: (p: Page) => void;
  setActiveCategory: (c: CategoryId) => void;
  openSettings: (c?: CategoryId) => void;
  closeSettings: () => void;
  openLogEditor: (s: LogEditorState) => void;
  closeLogEditor: () => void;
  openDayEditor: (dayKey: string) => void;
  closeDayEditor: () => void;
  showToast: (message: string, action?: Toast['action']) => void;
  dismissToast: () => void;
}

let toastSeq = 0;

export const useUi = create<UiState>()((set, get) => ({
  page: 'dashboard',
  activeCategory: 'cigarettes',
  settingsOpen: false,
  settingsCategory: 'cigarettes',
  logEditor: null,
  dayEditor: null,
  toast: null,
  setPage: (page) => set({ page }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  openSettings: (c) => set({ settingsOpen: true, settingsCategory: c ?? get().activeCategory }),
  closeSettings: () => set({ settingsOpen: false }),
  openLogEditor: (logEditor) => set({ logEditor }),
  closeLogEditor: () => set({ logEditor: null }),
  openDayEditor: (dayEditor) => set({ dayEditor }),
  closeDayEditor: () => set({ dayEditor: null }),
  showToast: (message, action) => {
    toastSeq += 1;
    set({ toast: action ? { id: toastSeq, message, action } : { id: toastSeq, message } });
  },
  dismissToast: () => set({ toast: null }),
}));

export function describeEntryShort(entry: LogEntry, singular: string): string {
  const d = new Date(entry.timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${singular} ${hh}:${mm}`;
}
