export type TextCaseMode = 'lower' | 'sentence' | 'title' | 'upper';

/**
 * Vietnamese-aware Unicode text case conversion supporting:
 * - lower: "bài tập rèn luyện kĩ năng lăn"
 * - sentence: "Bài tập rèn luyện kĩ năng lăn" (capitalizes start of text, new lines, bullet items, and after . ! ?)
 * - title: "Bài Tập Rèn Luyện Kĩ Năng Lăn" (capitalizes first letter of every word)
 * - upper: "BÀI TẬP RÈN LUYỆN KĨ NĂNG LĂN"
 */
export function transformVietnameseTextCase(text: string, mode: TextCaseMode): string {
  if (!text) return text;
  switch (mode) {
    case 'lower':
      return text.toLocaleLowerCase('vi-VN');
    case 'upper':
      return text.toLocaleUpperCase('vi-VN');
    case 'sentence': {
      const lowered = text.toLocaleLowerCase('vi-VN');
      return lowered.replace(
        /(^|[\n\r]\s*(?:[-•*+]\s*|\d+(?:\.\d+)*\.?\s*)?|[.!?…]\s+)(\p{L})/gu,
        (_match, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase('vi-VN')}`
      );
    }
    case 'title': {
      const lowered = text.toLocaleLowerCase('vi-VN');
      return lowered.replace(
        /(^|[\s(\["“'‘\/–—-])(\p{L})/gu,
        (_match, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase('vi-VN')}`
      );
    }
    default:
      return text;
  }
}

/**
 * Word-style Shift+F3 case cycling:
 * UPPERCASE -> lowercase -> Sentence case -> Title Case -> UPPERCASE
 */
export function cycleVietnameseTextCase(text: string): string {
  if (!text) return text;
  const upper = transformVietnameseTextCase(text, 'upper');
  const lower = transformVietnameseTextCase(text, 'lower');
  const sentence = transformVietnameseTextCase(text, 'sentence');
  const title = transformVietnameseTextCase(text, 'title');

  if (text === upper && text !== lower) {
    return lower;
  }
  if (text === lower) {
    return sentence;
  }
  if (text === sentence && title !== sentence) {
    return title;
  }
  return upper;
}

/**
 * Safely updates a React-controlled <input> or <textarea> element value and preserves selection.
 */
export function setNativeInputValueAndRestoreSelection(
  el: HTMLTextAreaElement | HTMLInputElement,
  nextValue: string,
  selStart: number,
  selEnd: number
): void {
  const proto =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

  if (nativeSetter) {
    nativeSetter.call(el, nextValue);
  } else {
    el.value = nextValue;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));

  requestAnimationFrame(() => {
    try {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    } catch {
      // Some input types don't support setSelectionRange
    }
  });
}

/**
 * Applies a text case transformation to either:
 * 1. The user's highlighted selection inside `el` (if any), OR
 * 2. The entire value for single-line inputs, OR
 * 3. The current line under the cursor for multi-line textareas (or full text if single line).
 * Returns true if the value changed.
 */
export function applyTextCaseToEditableElement(
  el: HTMLTextAreaElement | HTMLInputElement | null,
  mode: TextCaseMode | 'cycle',
  onDirectChange?: (nextValue: string) => void
): boolean {
  if (!el || el.readOnly || el.disabled) return false;
  const currentValue = el.value ?? '';
  if (!currentValue) return false;

  let start = el.selectionStart ?? 0;
  let end = el.selectionEnd ?? start;

  if (start === end) {
    // No explicit selection
    if (el instanceof HTMLInputElement || !currentValue.includes('\n')) {
      start = 0;
      end = currentValue.length;
    } else {
      // Multi-line textarea: target the current line under cursor so we don't accidentally change the whole cell
      const lineStart = currentValue.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      const nextNewline = currentValue.indexOf('\n', start);
      const lineEnd = nextNewline === -1 ? currentValue.length : nextNewline;
      start = lineStart;
      end = lineEnd;
    }
  }

  const targetSlice = currentValue.slice(start, end);
  if (!targetSlice.trim()) return false;

  const transformed =
    mode === 'cycle'
      ? cycleVietnameseTextCase(targetSlice)
      : transformVietnameseTextCase(targetSlice, mode);

  if (transformed === targetSlice) {
    // Still keep focus/selection intact
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.setSelectionRange(start, end);
      } catch {
        // ignore
      }
    });
    return false;
  }

  const nextValue = currentValue.slice(0, start) + transformed + currentValue.slice(end);
  const nextEnd = start + transformed.length;

  if (onDirectChange) {
    onDirectChange(nextValue);
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.setSelectionRange(start, nextEnd);
      } catch {
        // ignore
      }
    });
  } else {
    setNativeInputValueAndRestoreSelection(el, nextValue, start, nextEnd);
  }

  return true;
}

/**
 * Normalizes an all-uppercase Vietnamese phrase into natural sentence case when embedding into body prose.
 * Preserves mixed-case text as-is so user edits or acronyms like SGK/GDTC stay intact.
 */
export function normalizeAllCapsForSentenceBody(text: string): string {
  const trimmed = (text || '').trim();
  if (!trimmed) return trimmed;
  const hasLower = /\p{Ll}/u.test(trimmed);
  const hasUpper = /\p{Lu}/u.test(trimmed);
  if (hasUpper && !hasLower && trimmed.length >= 6) {
    return transformVietnameseTextCase(trimmed, 'sentence');
  }
  return trimmed;
}
