import React, { useEffect, useState, useRef } from 'react';
import {
  TextCaseMode,
  applyTextCaseToEditableElement
} from '../utils/textCaseHelper';

interface TextCaseButtonsProps {
  /** Optional explicit callback to resolve the target <textarea> or <input> */
  getTargetElement?: (btnEl: HTMLButtonElement) => HTMLTextAreaElement | HTMLInputElement | null;
  /** Optional direct controlled value updater (if omitted, dispatches React-compatible native input event) */
  onChangeValue?: (nextValue: string) => void;
  /** Compact mode for dense table toolbars */
  compact?: boolean;
  className?: string;
}

const CASE_ACTIONS: Array<{
  mode: TextCaseMode;
  label: string;
  title: string;
}> = [
  {
    mode: 'lower',
    label: 'aa',
    title: 'Đổi sang chữ thường (bôi đen đoạn chữ hoặc đặt con trỏ trên dòng cần đổi)'
  },
  {
    mode: 'sentence',
    label: 'Aa',
    title: 'Viết hoa chữ cái đầu câu'
  },
  {
    mode: 'title',
    label: 'Aa Bb',
    title: 'Viết Hoa Chữ Cái Đầu Từ'
  },
  {
    mode: 'upper',
    label: 'AA',
    title: 'Đổi sang CHỮ IN HOA (Phím tắt nhanh: Shift + F3)'
  }
];

function findNearestEditableField(btnEl: HTMLButtonElement): HTMLTextAreaElement | HTMLInputElement | null {
  // 1. If the user currently has focus inside a textarea/input within the same cell/field wrapper, prefer it
  const cellOrWrapper =
    btnEl.closest('td') ||
    btnEl.closest('[data-case-field]') ||
    btnEl.parentElement?.parentElement ||
    btnEl.parentElement;

  const active = document.activeElement;
  if (
    cellOrWrapper &&
    active &&
    (active instanceof HTMLTextAreaElement ||
      (active instanceof HTMLInputElement && (active.type === 'text' || active.type === 'search' || !active.type))) &&
    cellOrWrapper.contains(active)
  ) {
    return active;
  }

  if (cellOrWrapper) {
    const found = cellOrWrapper.querySelector<HTMLTextAreaElement | HTMLInputElement>(
      'textarea:not([readonly]):not([disabled]), input[type="text"]:not([readonly]):not([disabled]), input:not([type]):not([readonly]):not([disabled])'
    );
    if (found) return found;
  }

  return null;
}

/**
 * Inline compact toolbar for switching uppercase / lowercase / sentence case / title case
 * without losing text selection in the associated textarea or input.
 */
export const TextCaseButtons: React.FC<TextCaseButtonsProps> = ({
  getTargetElement,
  onChangeValue,
  compact = true,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center rounded border border-slate-300/90 bg-white/95 shadow-2xs overflow-hidden no-print ${className}`}
      title="Đổi chữ hoa / chữ thường cho đoạn bôi đen (hoặc dòng hiện tại). Phím tắt: Shift + F3"
    >
      {CASE_ACTIONS.map((act, idx) => (
        <button
          key={act.mode}
          type="button"
          onMouseDown={(e) => {
            // Keep textarea/input focus and highlighted selection intact!
            e.preventDefault();
          }}
          onClick={(e) => {
            const targetEl = getTargetElement
              ? getTargetElement(e.currentTarget)
              : findNearestEditableField(e.currentTarget);
            applyTextCaseToEditableElement(targetEl, act.mode, onChangeValue);
          }}
          className={`${
            compact ? 'px-1.5 py-0.5 text-[9.5px]' : 'px-2 py-1 text-[10.5px]'
          } font-bold text-slate-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 transition leading-none ${
            idx > 0 ? 'border-l border-slate-200' : ''
          }`}
          title={act.title}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
};

interface FloatingSelectionState {
  target: HTMLTextAreaElement | HTMLInputElement;
  selectedLength: number;
}

/**
 * Global floating quick-case bar + Shift+F3 keyboard shortcut that activates automatically
 * whenever the teacher highlights text inside ANY <textarea> or <input type="text"> in the app.
 */
export const GlobalFloatingTextCaseBar: React.FC = () => {
  const [selectionState, setSelectionState] = useState<FloatingSelectionState | null>(null);
  const activeTargetRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    const isEditableTextControl = (el: Element | null): el is HTMLTextAreaElement | HTMLInputElement => {
      if (!el) return false;
      if (el instanceof HTMLTextAreaElement) {
        return !el.readOnly && !el.disabled;
      }
      if (el instanceof HTMLInputElement) {
        const t = (el.type || 'text').toLowerCase();
        return (t === 'text' || t === 'search') && !el.readOnly && !el.disabled;
      }
      return false;
    };

    const refreshSelectionBar = () => {
      const active = document.activeElement;
      if (!isEditableTextControl(active)) {
        activeTargetRef.current = null;
        setSelectionState(null);
        return;
      }

      const start = active.selectionStart ?? 0;
      const end = active.selectionEnd ?? 0;
      const selected = active.value.slice(start, end);

      if (end <= start || !selected.trim()) {
        activeTargetRef.current = active;
        setSelectionState(null);
        return;
      }

      activeTargetRef.current = active;
      setSelectionState({
        target: active,
        selectedLength: selected.length
      });
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'F3') {
        const active = document.activeElement;
        if (isEditableTextControl(active)) {
          e.preventDefault();
          applyTextCaseToEditableElement(active, 'cycle');
          setTimeout(refreshSelectionBar, 20);
        }
      }
    };

    document.addEventListener('selectionchange', refreshSelectionBar);
    document.addEventListener('mouseup', refreshSelectionBar);
    document.addEventListener('keyup', refreshSelectionBar);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('selectionchange', refreshSelectionBar);
      document.removeEventListener('mouseup', refreshSelectionBar);
      document.removeEventListener('keyup', refreshSelectionBar);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  if (!selectionState) return null;

  return (
    <div
      onMouseDown={(e) => {
        // Prevent losing highlight selection when clicking anywhere on the bar
        e.preventDefault();
      }}
      className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700/90 backdrop-blur-xs"
    >
      <span className="text-[11px] font-semibold text-slate-300 pr-1.5 border-r border-slate-700 whitespace-nowrap">
        Đổi HOA/thường ({selectionState.selectedLength} ký tự)
      </span>
      {CASE_ACTIONS.map((act) => (
        <button
          key={act.mode}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            applyTextCaseToEditableElement(selectionState.target, act.mode);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold transition whitespace-nowrap"
          title={act.title}
        >
          {act.label}
        </button>
      ))}
      <span className="hidden sm:inline text-[10px] text-slate-400 pl-1.5 border-l border-slate-700 whitespace-nowrap">
        Phím tắt: Shift+F3
      </span>
    </div>
  );
};
