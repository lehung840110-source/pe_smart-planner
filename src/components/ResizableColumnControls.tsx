import React from 'react';
import { MoveHorizontal, RotateCcw } from 'lucide-react';
import { ResizableTableKey, TABLE_COLUMN_PRESETS } from '../utils/tableColumnWidths';

interface ColumnResizeHandleProps {
  colIndex: number;
  widths: number[];
  activeDividerIndex: number | null;
  onStartResize: (
    colIndex: number,
    e: React.PointerEvent<HTMLElement>,
    fixedOffsetPx?: number
  ) => void;
  onReset: () => void;
  variant?: 'header' | 'cell';
  fixedOffsetPx?: number;
}

/**
 * Interactive drag handle placed on the right border of table header/body cells.
 * Completely hidden when printing or exporting to Word (.no-print).
 */
export const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({
  colIndex,
  widths,
  activeDividerIndex,
  onStartResize,
  onReset,
  variant = 'header',
  fixedOffsetPx = 0
}) => {
  const isActive = activeDividerIndex === colIndex;
  const leftPct = Math.round(widths[colIndex] ?? 0);
  const rightPct = Math.round(widths[colIndex + 1] ?? 0);

  if (variant === 'cell') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        title="Kéo trái/phải để chỉnh độ rộng cột • Nhấp đúp để đặt lại mặc định"
        onPointerDown={(e) => onStartResize(colIndex, e, fixedOffsetPx)}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReset();
        }}
        className={`no-print group/colhandle absolute top-0 bottom-0 -right-1.5 w-3 z-20 cursor-col-resize select-none touch-none flex items-center justify-center`}
      >
        <span
          className={`block h-full transition-colors ${
            isActive
              ? 'w-[3px] bg-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]'
              : 'w-[2px] bg-transparent group-hover/colhandle:bg-blue-400/80'
          }`}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title="Kéo trái/phải để chỉnh độ rộng cột • Nhấp đúp để đặt lại mặc định"
      onPointerDown={(e) => onStartResize(colIndex, e, fixedOffsetPx)}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onReset();
      }}
      className="no-print group/colhandle absolute top-0 bottom-0 -right-1.5 w-3 z-30 cursor-col-resize select-none touch-none flex items-center justify-center"
    >
      {/* Visual divider line */}
      <span
        className={`block h-full transition-all ${
          isActive
            ? 'w-[3px] bg-blue-600'
            : 'w-[2px] bg-slate-300/70 group-hover/colhandle:w-[3px] group-hover/colhandle:bg-blue-500'
        }`}
      />

      {/* Subtle center grip pill on hover/active */}
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 w-2.5 h-5 rounded-full border flex items-center justify-center transition-opacity ${
          isActive
            ? 'opacity-100 bg-blue-600 border-blue-700 text-white shadow-sm'
            : 'opacity-0 group-hover/colhandle:opacity-100 bg-white border-blue-400 text-blue-600 shadow-2xs'
        }`}
      >
        <span className="w-[1px] h-2.5 bg-current opacity-80" />
      </span>

      {/* Live percentage tooltip while actively dragging */}
      {isActive && (
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold shadow-md tabular-nums z-40">
          {leftPct}% <span className="text-blue-300 mx-0.5">|</span> {rightPct}%
        </div>
      )}
    </div>
  );
};

interface ColumnWidthToolbarProps {
  tableKey: ResizableTableKey;
  widths: number[];
  isCustomized: boolean;
  onReset: () => void;
  className?: string;
}

/**
 * Compact helper strip shown above resizable lesson plan tables (hidden when printing).
 */
export const ColumnWidthToolbar: React.FC<ColumnWidthToolbarProps> = ({
  tableKey,
  widths,
  isCustomized,
  onReset,
  className = ''
}) => {
  const labels = TABLE_COLUMN_PRESETS[tableKey].shortLabels;

  return (
    <div
      className={`no-print flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/90 border border-slate-200/90 text-[11px] text-slate-600 ${className}`}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
          <MoveHorizontal className="w-3.5 h-3.5" />
          <span>Kéo viền cột để chỉnh độ rộng</span>
        </span>
        <span className="text-slate-400 hidden sm:inline">•</span>
        <span className="text-[10.5px] text-slate-500 tabular-nums">
          {widths
            .map((w, idx) => `${labels[idx] || `C${idx + 1}`} ${Math.round(w)}%`)
            .join(' · ')}
        </span>
      </div>

      {isCustomized ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10.5px] transition shadow-2xs"
          title="Khôi phục tỷ lệ độ rộng cột chuẩn mặc định"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại độ rộng mặc định</span>
        </button>
      ) : (
        <span className="text-[10px] text-slate-400 hidden md:inline">
          Tự lưu &amp; giữ nguyên khi In / Xuất Word
        </span>
      )}
    </div>
  );
};
