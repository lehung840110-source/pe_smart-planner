import React, { useRef } from 'react';

export interface SplitLvdParts {
  time: string;
  reps: string;
}

/**
 * Splits a single `row.lvd` string into:
 * - `time`: first line (e.g. "5 - 7 phút")
 * - `reps`: second line onward (e.g. "2L x 8N" or "2 - 3 lần\n(2x8 nhịp)")
 */
export function splitLvdTimeAndReps(raw?: string): SplitLvdParts {
  const normalized = (raw || '').replace(/\r\n/g, '\n');
  const firstNewlineIdx = normalized.indexOf('\n');
  if (firstNewlineIdx === -1) {
    return { time: normalized, reps: '' };
  }
  return {
    time: normalized.slice(0, firstNewlineIdx),
    reps: normalized.slice(firstNewlineIdx + 1)
  };
}

/**
 * Recombines `time` (line 1) and `reps` (line 2+) back into `row.lvd`
 * without dropping spaces or jumping cursor focus while typing.
 */
export function joinLvdTimeAndReps(time: string, reps: string): string {
  if (reps === '') {
    return time;
  }
  return `${time}\n${reps}`;
}

interface LvdDualInputProps {
  value?: string;
  onChange: (nextValue: string) => void;
  /** 'stacked' fits narrow table columns (LVĐ); 'row' fits wide mobile cards */
  layout?: 'stacked' | 'row';
  /** Visual border accent matching surrounding editor style */
  variant?: 'blue' | 'slate';
}

/**
 * Dual-field LVĐ editor:
 * 1) Top input: Thời gian (e.g. "5 - 7 phút") — pressing Enter jumps straight to box 2
 * 2) Bottom textarea: Số lần / Nhịp (e.g. "2L x 8N", "2 - 3 lần\n(2x8 nhịp)") — supports Enter for multiple lines
 */
export const LvdDualInput: React.FC<LvdDualInputProps> = ({
  value = '',
  onChange,
  layout = 'stacked',
  variant = 'blue'
}) => {
  const repsRef = useRef<HTMLTextAreaElement | null>(null);
  const { time, reps } = splitLvdTimeAndReps(value);

  const borderCls =
    variant === 'blue'
      ? 'border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400'
      : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400';

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanTime = e.target.value.replace(/\r?\n/g, ' ');
    onChange(joinLvdTimeAndReps(cleanTime, reps));
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(joinLvdTimeAndReps(time, e.target.value));
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      repsRef.current?.focus();
    }
  };

  if (layout === 'row') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
            Thời gian:
          </label>
          <input
            type="text"
            value={time}
            onChange={handleTimeChange}
            onKeyDown={handleTimeKeyDown}
            placeholder="VD: 5 - 7 phút"
            className={`w-full p-2 text-xs font-bold rounded-xl border ${borderCls} text-slate-800 bg-white focus:outline-none`}
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
            Số lần / nhịp:
          </label>
          <textarea
            ref={repsRef}
            rows={2}
            value={reps}
            onChange={handleRepsChange}
            placeholder="VD: 2L x 8N"
            className={`w-full p-2 text-xs font-bold rounded-xl border ${borderCls} text-slate-800 bg-white focus:outline-none resize-y leading-snug`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-left">
      <div>
        <span className="block text-[9px] font-bold text-slate-500 text-center uppercase tracking-tight mb-0.5">
          Thời gian
        </span>
        <input
          type="text"
          value={time}
          onChange={handleTimeChange}
          onKeyDown={handleTimeKeyDown}
          placeholder="5 - 7 phút"
          title="Nhập thời gian (nhấn Enter để chuyển xuống ô Số lần)"
          className={`w-full text-center px-1 py-1 text-xs font-bold border ${borderCls} rounded bg-white text-slate-800 focus:outline-none`}
        />
      </div>

      <div>
        <span className="block text-[9px] font-bold text-slate-500 text-center uppercase tracking-tight mb-0.5">
          Số lần / nhịp
        </span>
        <textarea
          ref={repsRef}
          rows={2}
          value={reps}
          onChange={handleRepsChange}
          placeholder="2L x 8N"
          title="Nhập số lần, số lượt hoặc nhịp (hỗ trợ nhấn Enter xuống dòng)"
          className={`w-full text-center px-1 py-1 text-xs font-bold border ${borderCls} rounded bg-white text-slate-800 focus:outline-none resize-y leading-snug`}
        />
      </div>
    </div>
  );
};
