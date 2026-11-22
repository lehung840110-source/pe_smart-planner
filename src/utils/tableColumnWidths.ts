import { useState, useEffect, useCallback, useRef } from 'react';
import { safeLocalStorageSet } from './db';

export type ResizableTableKey = 'lessonPlan' | 'weeklySchedule';

export interface TableColumnPreset {
  storageKey: string;
  defaults: number[];
  minWidths: number[];
  maxWidths: number[];
  shortLabels: string[];
}

export const TABLE_COLUMN_PRESETS: Record<ResizableTableKey, TableColumnPreset> = {
  lessonPlan: {
    storageKey: 'gdtc_lesson_plan_col_widths_v2',
    // Chuẩn tỷ lệ in A4 / Word theo bản mẫu đã căn chỉnh:
    // Cột 1: Nội dung (34%) | Cột 2: LVĐ (8%) | Cột 3: Hoạt động GV (28%) | Cột 4: Hoạt động HS & Sơ đồ (30%)
    defaults: [34, 8, 28, 30],
    minWidths: [16, 6, 16, 16],
    maxWidths: [52, 20, 50, 50],
    shortLabels: ['Nội dung', 'LVĐ', 'HĐ GV', 'HĐ HS']
  },
  weeklySchedule: {
    storageKey: 'gdtc_weekly_schedule_col_widths_v2',
    // Chuẩn tỷ lệ bảng 7 cột TKB tuần:
    // Thứ (13.5%) | Tiết (6.5%) | Lớp (8.5%) | Bài học (29.5%) | PPCT (8.5%) | ND Tích hợp/ĐC (21.5%) | ĐDDH (12%)
    defaults: [13.5, 6.5, 8.5, 29.5, 8.5, 21.5, 12],
    minWidths: [8, 4.5, 5.5, 16, 5.5, 14, 7],
    maxWidths: [22, 14, 16, 48, 14, 42, 24],
    shortLabels: ['Thứ', 'Tiết', 'Lớp', 'Bài học', 'PPCT', 'Tích hợp', 'ĐDDH']
  }
};

export const TABLE_COL_WIDTHS_CHANGED_EVENT = 'gdtc-table-col-widths-changed';

export function normalizeColumnWidths(
  raw: unknown,
  key: ResizableTableKey
): number[] {
  const preset = TABLE_COLUMN_PRESETS[key];
  if (!Array.isArray(raw) || raw.length !== preset.defaults.length) {
    return [...preset.defaults];
  }

  const parsed = raw.map((v, idx) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return preset.defaults[idx];
    return Math.min(preset.maxWidths[idx], Math.max(preset.minWidths[idx], n));
  });

  const total = parsed.reduce((acc, n) => acc + n, 0);
  if (total <= 0) return [...preset.defaults];

  const scaled = parsed.map((n) => Math.round((n / total) * 1000) / 10);
  const roundedTotal = scaled.reduce((acc, n) => acc + n, 0);
  const diff = Math.round((100 - roundedTotal) * 10) / 10;
  if (Math.abs(diff) > 0 && scaled.length > 0) {
    const lastIdx = scaled.length - 1;
    scaled[lastIdx] = Math.round((scaled[lastIdx] + diff) * 10) / 10;
  }

  // Final guard so every column stays within sane bounds
  const valid = scaled.every(
    (n, idx) => n >= preset.minWidths[idx] - 0.5 && n <= preset.maxWidths[idx] + 0.5
  );
  return valid ? scaled : [...preset.defaults];
}

export function getSavedTableColumnWidths(key: ResizableTableKey): number[] {
  const preset = TABLE_COLUMN_PRESETS[key];
  if (typeof window === 'undefined') return [...preset.defaults];
  try {
    const raw = window.localStorage.getItem(preset.storageKey);
    if (!raw) return [...preset.defaults];
    return normalizeColumnWidths(JSON.parse(raw), key);
  } catch {
    return [...preset.defaults];
  }
}

export function getSavedLessonPlanColWidths(): number[] {
  return getSavedTableColumnWidths('lessonPlan');
}

export function getSavedWeeklyScheduleColWidths(): number[] {
  return getSavedTableColumnWidths('weeklySchedule');
}

export function saveTableColumnWidths(
  key: ResizableTableKey,
  widths: number[]
): number[] {
  const normalized = normalizeColumnWidths(widths, key);
  const preset = TABLE_COLUMN_PRESETS[key];
  if (typeof window !== 'undefined') {
    safeLocalStorageSet(preset.storageKey, JSON.stringify(normalized));
    window.dispatchEvent(
      new CustomEvent(TABLE_COL_WIDTHS_CHANGED_EVENT, {
        detail: { key, widths: normalized }
      })
    );
  }
  return normalized;
}

export function areColumnWidthsDefault(
  widths: number[],
  key: ResizableTableKey
): boolean {
  const defaults = TABLE_COLUMN_PRESETS[key].defaults;
  if (widths.length !== defaults.length) return true;
  return widths.every((w, idx) => Math.abs(w - defaults[idx]) < 0.25);
}

export interface UseResizableTableColumnsResult {
  widths: number[];
  activeDividerIndex: number | null;
  isCustomized: boolean;
  startResize: (
    colIndex: number,
    e: React.PointerEvent<HTMLElement>,
    fixedOffsetPx?: number
  ) => void;
  resetWidths: () => void;
}

export function useResizableTableColumns(
  key: ResizableTableKey
): UseResizableTableColumnsResult {
  const preset = TABLE_COLUMN_PRESETS[key];
  const [widths, setWidths] = useState<number[]>(() =>
    getSavedTableColumnWidths(key)
  );
  const [activeDividerIndex, setActiveDividerIndex] = useState<number | null>(
    null
  );
  const widthsRef = useRef<number[]>(widths);

  useEffect(() => {
    widthsRef.current = widths;
  }, [widths]);

  // Listen for width updates triggered from other tabs / views
  useEffect(() => {
    const handleSyncEvent = (ev: Event) => {
      const custom = ev as CustomEvent<{
        key?: ResizableTableKey;
        widths?: number[];
      }>;
      if (custom.detail?.key !== key) return;
      if (Array.isArray(custom.detail.widths)) {
        const normalized = normalizeColumnWidths(custom.detail.widths, key);
        setWidths((prev) => {
          const same =
            prev.length === normalized.length &&
            prev.every((v, i) => Math.abs(v - normalized[i]) < 0.05);
          return same ? prev : normalized;
        });
      }
    };
    window.addEventListener(TABLE_COL_WIDTHS_CHANGED_EVENT, handleSyncEvent);
    return () => {
      window.removeEventListener(
        TABLE_COL_WIDTHS_CHANGED_EVENT,
        handleSyncEvent
      );
    };
  }, [key]);

  const startResize = useCallback(
    (
      colIndex: number,
      e: React.PointerEvent<HTMLElement>,
      fixedOffsetPx = 0
    ) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (colIndex < 0 || colIndex >= preset.defaults.length - 1) return;

      const tableEl = e.currentTarget.closest('table');
      const tableRect = tableEl?.getBoundingClientRect();
      const usableTableWidth = Math.max(
        320,
        (tableRect?.width || 800) - fixedOffsetPx
      );

      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidths = [...widthsRef.current];
      const startLeft = startWidths[colIndex];
      const startRight = startWidths[colIndex + 1];
      const combined = startLeft + startRight;

      const minLeft = preset.minWidths[colIndex];
      const maxLeft = preset.maxWidths[colIndex];
      const minRight = preset.minWidths[colIndex + 1];
      const maxRight = preset.maxWidths[colIndex + 1];

      const effectiveMinLeft = Math.max(minLeft, combined - maxRight);
      const effectiveMaxLeft = Math.min(maxLeft, combined - minRight);

      setActiveDividerIndex(colIndex);

      const prevCursor = document.body.style.cursor;
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      let latestWidths = startWidths;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaPx = moveEvent.clientX - startX;
        const deltaPct = (deltaPx / usableTableWidth) * 100;
        const rawLeft = startLeft + deltaPct;
        const clampedLeft = Math.min(
          effectiveMaxLeft,
          Math.max(effectiveMinLeft, rawLeft)
        );
        const roundedLeft = Math.round(clampedLeft * 10) / 10;
        const roundedRight = Math.round((combined - roundedLeft) * 10) / 10;

        const next = [...startWidths];
        next[colIndex] = roundedLeft;
        next[colIndex + 1] = roundedRight;
        latestWidths = next;
        widthsRef.current = next;
        setWidths(next);
      };

      const handlePointerEnd = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerEnd);
        window.removeEventListener('pointercancel', handlePointerEnd);
        document.body.style.cursor = prevCursor;
        document.body.style.userSelect = prevUserSelect;
        setActiveDividerIndex(null);
        saveTableColumnWidths(key, latestWidths);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    },
    [key, preset]
  );

  const resetWidths = useCallback(() => {
    const reset = saveTableColumnWidths(key, [...preset.defaults]);
    widthsRef.current = reset;
    setWidths(reset);
  }, [key, preset.defaults]);

  const isCustomized = !areColumnWidthsDefault(widths, key);

  return {
    widths,
    activeDividerIndex,
    isCustomized,
    startResize,
    resetWidths
  };
}
