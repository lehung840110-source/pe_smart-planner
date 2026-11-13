import React from 'react';
import { Trash2 } from 'lucide-react';
import { standardFormationDiagrams } from '../data/formationDiagrams';

export interface InlineImageItem {
  tag: string;
  title: string;
  url: string;
}

export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'image'; tag: string; title: string; url: string };

const INLINE_STORE_KEY = 'gdtc_inline_images_registry';

/**
 * Load persistent image registry from localStorage
 */
function getStoredRegistry(): Record<string, string> {
  try {
    const raw = localStorage.getItem(INLINE_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save persistent image registry to localStorage
 */
function saveStoredRegistry(store: Record<string, string>) {
  try {
    // Keep only compact entries (<= 40KB each, max 250KB total) in localStorage;
    // large base64 images remain in RAM and inside IndexedDB-persisted lesson plans.
    const compact: Record<string, string> = {};
    let approx = 2;
    for (const [k, v] of Object.entries(store)) {
      if (!v || v.length > 40_000) continue;
      if (approx + k.length + v.length + 6 > 250_000) break;
      compact[k] = v;
      approx += k.length + v.length + 6;
    }
    localStorage.setItem(INLINE_STORE_KEY, JSON.stringify(compact));
  } catch {
    // Ignore storage quota limits
  }
}

export const inMemoryImageRegistry: Record<string, string> = getStoredRegistry();

/**
 * Register an image URL into registry by title / key
 */
export function registerInlineImage(titleOrKey: string, url: string): string {
  if (!titleOrKey || !url) return '';
  const cleanKey = titleOrKey.trim().toLowerCase();
  inMemoryImageRegistry[cleanKey] = url;
  saveStoredRegistry(inMemoryImageRegistry);
  return cleanKey;
}

/**
 * Resolve an image URL from title or key
 */
export function lookupInlineImage(titleOrKey: string): string | undefined {
  if (!titleOrKey) return undefined;
  const cleanKey = titleOrKey.trim().toLowerCase();

  // 1. Direct registry match
  if (inMemoryImageRegistry[cleanKey]) {
    return inMemoryImageRegistry[cleanKey];
  }

  // 2. Partial match in registry
  const regEntry = Object.entries(inMemoryImageRegistry).find(([k]) =>
    k.includes(cleanKey) || cleanKey.includes(k)
  );
  if (regEntry) return regEntry[1];

  // 3. Match from standard formation diagrams
  const diag = standardFormationDiagrams.find((d) =>
    (d.name && d.name.toLowerCase().includes(cleanKey)) || cleanKey.includes((d.name || '').toLowerCase())
  );
  if (diag?.svgDataUrl) return diag.svgDataUrl;

  return undefined;
}

/**
 * Regex to detect inline tags:
 * 1. [HÌNH: Tiêu đề | url] or [HÌNH: Tiêu đề] (also HINH, ẢNH, ANH, IMAGE, IMG)
 * 2. [SƠ ĐỒ: Tên sơ đồ | url] or [SƠ ĐỒ: Tên sơ đồ] (also SO DO, SƠ_ĐỒ, DIAGRAM, FORMATION)
 * 3. ![Tiêu đề](url)
 * 4. {{img:url}} or {{img:title|url}}
 */
const INLINE_IMG_REGEX = /\[(?:HÌNH|HINH|ẢNH|ANH|SƠ\s*ĐỒ|SO\s*DO|SƠ_ĐỒ|SO_DO|DIAGRAM|FORMATION|IMAGE|IMG):\s*(?:([^|\n\]]+)\s*\|\s*)?([^\n\]]+)\]|!\[([^\]]*)\]\(([^)]+)\)|\{\{(?:img|diagram|sodo):(?:([^|\n}]+)\s*\|\s*)?([^\n}]+)\}\}/gi;

/**
 * Quick check if text contains inline images or formation diagrams
 */
export function hasInlineMedia(text?: string): boolean {
  if (!text) return false;
  return /\[(?:HÌNH|HINH|ẢNH|ANH|SƠ\s*ĐỒ|SO\s*DO|SƠ_ĐỒ|SO_DO|DIAGRAM|FORMATION|IMAGE|IMG):|!\[|\{\{(?:img|diagram|sodo):/i.test(text);
}

/**
 * Sanitizes text to remove ugly raw base64/SVG data URLs from the text,
 * converting them into clean readable labels like [HÌNH: Tiêu đề] hoặc [SƠ ĐỒ: Tên sơ đồ]!
 */
export function sanitizeInlineImageTagsInText(rawText: string): string {
  if (!rawText) return rawText;

  // Replace [HÌNH/SƠ ĐỒ: Tiêu đề | data:image/...;base64,...] or raw base64 with clean label
  return rawText.replace(
    /\[((?:HÌNH|HINH|ẢNH|ANH|SƠ\s*ĐỒ|SO\s*DO|SƠ_ĐỒ|SO_DO|DIAGRAM|FORMATION|IMAGE|IMG)):\s*(?:([^|\n\]]+)\s*\|\s*)?(data:image\/[^\n\]]+|data:image\/svg\+xml[^\n\]]+|[A-Za-z0-9+/=]{100,})\]/gi,
    (_match, prefix, title, base64Url) => {
      const cleanTitle = (title || 'Hình minh họa').trim();
      if (base64Url && (base64Url.startsWith('data:image') || base64Url.startsWith('data:'))) {
        registerInlineImage(cleanTitle, base64Url.trim());
      }
      const pUpper = (prefix || '').toUpperCase();
      const p = pUpper.includes('SƠ') || pUpper.includes('SO') || pUpper.includes('DIAG') || pUpper.includes('FORM') ? 'SƠ ĐỒ' : 'HÌNH';
      return `[${p}: ${cleanTitle}]`;
    }
  );
}

/**
 * Parses text into an alternating sequence of text blocks and inline image tags.
 */
export function parseInlineTextSegments(rawText: string): TextSegment[] {
  if (!rawText) return [];

  const sanitized = sanitizeInlineImageTagsInText(rawText);
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_IMG_REGEX.lastIndex = 0;

  while ((match = INLINE_IMG_REGEX.exec(sanitized)) !== null) {
    const matchStart = match.index;
    const matchEnd = INLINE_IMG_REGEX.lastIndex;

    // Push preceding text if any
    if (matchStart > lastIndex) {
      const textChunk = sanitized.slice(lastIndex, matchStart);
      if (textChunk) {
        segments.push({ type: 'text', text: textChunk });
      }
    }

    const fullTag = match[0];
    let title = '';
    let url = '';

    if (match[2]) {
      // Pattern 1: [HÌNH: title | url] or [HÌNH: title]
      if (match[1] && match[1].trim()) {
        title = match[1].trim();
        url = match[2].trim();
      } else {
        const candidate = match[2].trim();
        if (candidate.startsWith('http') || candidate.startsWith('/assets/') || candidate.startsWith('data:')) {
          url = candidate;
          title = 'Hình minh họa';
        } else {
          title = candidate;
          url = lookupInlineImage(candidate) || '';
        }
      }
    } else if (match[4]) {
      // Pattern 2: ![title](url)
      title = (match[3] || 'Hình minh họa').trim();
      url = match[4].trim();
    } else if (match[6]) {
      // Pattern 3: {{img:title|url}}
      if (match[5] && match[5].trim()) {
        title = match[5].trim();
        url = match[6].trim();
      } else {
        title = match[6].trim();
        url = lookupInlineImage(title) || match[6].trim();
      }
    }

    // Fallback if URL is missing, check registry
    if (!url && title) {
      url = lookupInlineImage(title) || '';
    }

    // Clean up title if it's a URL
    if (title.startsWith('http') || title.startsWith('data:') || title.startsWith('/')) {
      title = 'Hình minh họa';
    }

    if (url) {
      segments.push({
        type: 'image',
        tag: fullTag,
        title: title || 'Hình minh họa',
        url
      });
    }

    lastIndex = matchEnd;
  }

  // Push remaining text
  if (lastIndex < sanitized.length) {
    const remaining = sanitized.slice(lastIndex);
    if (remaining) {
      segments.push({ type: 'text', text: remaining });
    }
  }

  return segments;
}

/**
 * Extracts all inline images embedded within text.
 */
export function extractAllInlineImages(rawText: string): InlineImageItem[] {
  const segments = parseInlineTextSegments(rawText);
  return segments
    .filter((s): s is { type: 'image'; tag: string; title: string; url: string } => s.type === 'image')
    .map((s) => ({
      tag: s.tag,
      title: s.title,
      url: s.url
    }));
}

/**
 * Inserts a clean, concise image tag at cursor position:
 * ALWAYS saves the image URL in registry so only [HÌNH: Tên hình ảnh] appears in the text!
 * Never puts massive base64 strings into the user's text area!
 */
export function insertImageAtCursor(
  originalText: string,
  cursorStart: number,
  cursorEnd: number,
  imgTitle: string,
  imgUrl: string
): string {
  const cleanTitle = (imgTitle || 'Hình minh họa').replace(/[\[\]|\n]/g, '').trim();

  // Register image URL into registry
  if (imgUrl) {
    registerInlineImage(cleanTitle, imgUrl);
  }

  // Clean short tag: [HÌNH: Tên hình ảnh]
  const cleanTag = `\n[HÌNH: ${cleanTitle}]\n`;

  const before = originalText.slice(0, Math.max(0, cursorStart));
  const after = originalText.slice(Math.max(0, cursorEnd));

  const trimmedBefore = before.endsWith('\n') ? before : before ? `${before}\n` : '';
  const trimmedAfter = after.startsWith('\n') ? after.slice(1) : after;

  const result = `${trimmedBefore}[HÌNH: ${cleanTitle}]\n${trimmedAfter}`;
  return sanitizeInlineImageTagsInText(result);
}

/**
 * Inserts a clean formation diagram tag at cursor position:
 * ALWAYS saves the diagram SVG in registry so only [SƠ ĐỒ: Tên sơ đồ] appears in the text!
 */
export function insertFormationDiagramAtCursor(
  originalText: string,
  cursorStart: number,
  cursorEnd: number,
  diagramName: string,
  svgDataUrl: string
): string {
  const cleanTitle = (diagramName || 'Sơ đồ đội hình').replace(/[\[\]|\n]/g, '').trim();

  // Register diagram SVG into registry
  if (svgDataUrl) {
    registerInlineImage(cleanTitle, svgDataUrl);
  }

  const before = originalText.slice(0, Math.max(0, cursorStart));
  const after = originalText.slice(Math.max(0, cursorEnd));

  const trimmedBefore = before.endsWith('\n') ? before : before ? `${before}\n` : '';
  const trimmedAfter = after.startsWith('\n') ? after.slice(1) : after;

  const result = `${trimmedBefore}[SƠ ĐỒ: ${cleanTitle}]\n${trimmedAfter}`;
  return sanitizeInlineImageTagsInText(result);
}

/**
 * Removes a specific inline image tag from the text string.
 */
export function removeInlineImageFromText(originalText: string, rawTag: string): string {
  if (!originalText || !rawTag) return originalText;

  const escaped = rawTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reg = new RegExp(`\\s*${escaped}\\s*`, 'g');

  return originalText.replace(reg, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * React Component to render rich text containing inline images cleanly.
 */
interface RichTextWithImagesProps {
  text: string;
  imageHeight?: number;
  showCaptions?: boolean;
  isEditMode?: boolean;
  onRemoveImage?: (rawTag: string) => void;
  className?: string;
}

export const RichTextWithImages: React.FC<RichTextWithImagesProps> = ({
  text,
  imageHeight = 90,
  showCaptions = true,
  isEditMode = false,
  onRemoveImage,
  className = ''
}) => {
  if (!text) return null;

  const segments = parseInlineTextSegments(text);

  if (segments.length === 1 && segments[0].type === 'text') {
    return <div className={`whitespace-pre-line leading-relaxed ${className}`}>{segments[0].text}</div>;
  }

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return (
            <div key={`txt_${idx}`} className="whitespace-pre-line text-slate-800">
              {seg.text}
            </div>
          );
        }

        if (!seg.url || !seg.url.trim()) return null;

        return (
          <div
            key={`img_${idx}_${seg.title}`}
            className="my-2 p-1.5 bg-slate-50/90 rounded-lg border border-slate-200/80 text-center relative group max-w-md mx-auto print:max-w-none shadow-2xs hover:border-blue-300 transition"
          >
            <div className="relative inline-block w-full">
              <img
                src={seg.url}
                alt={seg.title}
                style={{ maxHeight: `${imageHeight}px` }}
                className="w-auto mx-auto object-contain rounded bg-white p-0.5 max-w-full shadow-2xs"
                loading="lazy"
              />

              {isEditMode && onRemoveImage && (
                <button
                  type="button"
                  onClick={() => onRemoveImage(seg.tag)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md text-[10px] shadow-xs no-print transition opacity-90 hover:opacity-100"
                  title="Xóa hình ảnh này khỏi dòng văn bản"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showCaptions && seg.title && (
              <p className="text-[10px] text-slate-600 italic font-medium mt-1 truncate" title={seg.title}>
                {seg.title}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
