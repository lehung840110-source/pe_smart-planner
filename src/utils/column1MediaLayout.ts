export interface Column1MediaItem {
  id?: string;
  url?: string;
  title?: string;
}

export type Column1Segment<T extends Column1MediaItem> =
  | { type: 'text'; text: string }
  | { type: 'images'; images: T[] };

function normalizeForMatch(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MAJOR_SECTION_BANNER_RE = /^\s*[1-4]\.\s*HOẠT\s*ĐỘNG\b/i;
const SUB_HEADING_RE = /^\s*(?:1\.[1-3]|2\.[1-3]|3\.[1-5]|4\.[1-3])\.?\s+/;
const VANDUNG_HEADING_RE = /^\s*4\.2\.?\s*vận\s*dụng/i;
const GAME_HEADING_RE = /^\s*(?:(?:\*|•|-)?\s*(?:1\.3|3\.4|3\.5)\.?\s*)?trò\s*chơi/i;
const MOVEMENT_SUBHEADING_RE = /^\s*\*\s*(?:học\s+|kỹ\s*thuật|kĩ\s*thuật|nội\s*dung\s*kiểm\s*tra|thực\s*hành\s*kỹ\s*năng)/i;
const BULLET_LINE_RE = /^\s*[-•+]\s+/;

const STOP_WORDS = new Set([
  'hoc', 'dong', 'tac', 'sgk', 'gdtc', 'lop', 'khoi', 'moi', 'voi', 'va', 'cua', 'theo', 'trang', 'bai', 'tiet'
]);

function scoreHeadingImageMatch(headingLine: string, imgTitle: string): number {
  const hNorm = normalizeForMatch(headingLine);
  const tNorm = normalizeForMatch(imgTitle);
  if (!hNorm || !tNorm) return 0;

  const hTokens = hNorm.split(' ').filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
  const tTokens = new Set(tNorm.split(' ').filter((w) => w.length >= 2 && !STOP_WORDS.has(w)));
  if (hTokens.length === 0 || tTokens.size === 0) return 0;

  let hits = 0;
  for (const tok of hTokens) {
    if (tTokens.has(tok)) hits++;
  }

  // Exact movement phrase boost
  const movementKeywords = [
    'vuon tho', 'tay', 'chan', 'luon', 'bung', 'van minh', 'toan than', 'phoi hop', 'nhay', 'dieu hoa', 'di deu'
  ];
  for (const kw of movementKeywords) {
    if (hNorm.includes(kw) && tNorm.includes(kw)) {
      hits += 5;
    }
  }
  return hits;
}

/**
 * Splits Column 1 text and attached images so that EVERY attached image renders
 * immediately AFTER the heading/title of its content, movement, practice block, game,
 * or Vận dụng section — and BEFORE all bullet details, integration notes, and closing items
 * (such as `4.3. Nhận xét & Xuống lớp.`).
 *
 * Works uniformly for React preview/print components AND Word (.docx/.doc) HTML export.
 */
export function splitColumn1ContentForMedia<T extends Column1MediaItem>(
  content: string,
  images: T[]
): Column1Segment<T>[] {
  const raw = content || '';
  if (!images || images.length === 0) {
    return raw ? [{ type: 'text', text: raw }] : [];
  }
  if (!raw.trim()) {
    return [{ type: 'images', images }];
  }

  const lines = raw.split('\n');
  const trimmedLines = lines.map((l) => l.trim());

  // 1. Check for `4.2. Vận dụng:` — ALWAYS insert directly after `4.2. Vận dụng:` line
  //    so `- Câu hỏi vận dụng...`, `- Tích hợp...`, and `4.3. Nhận xét & Xuống lớp.` sit BELOW the image!
  const vanDungIdx = trimmedLines.findIndex((l) => VANDUNG_HEADING_RE.test(l));
  if (vanDungIdx !== -1) {
    return buildSegmentsAtSingleIndex(lines, vanDungIdx, images);
  }

  // 2. Check for Game heading (`1.3. Trò chơi...`, `3.5. Trò chơi...`, `* Trò chơi...`)
  const gameHeadingIdx = trimmedLines.findIndex((l) => GAME_HEADING_RE.test(l));
  if (gameHeadingIdx !== -1) {
    return buildSegmentsAtSingleIndex(lines, gameHeadingIdx, images);
  }

  // 3. Check for movement/technique subheadings (`* Học Động tác ...`, `* Kỹ thuật trọng tâm ...`)
  const movementHeadingIndices: number[] = [];
  for (let i = 0; i < trimmedLines.length; i++) {
    if (MOVEMENT_SUBHEADING_RE.test(trimmedLines[i])) {
      movementHeadingIndices.push(i);
    }
  }

  if (movementHeadingIndices.length === 1) {
    return buildSegmentsAtSingleIndex(lines, movementHeadingIndices[0], images);
  }

  if (movementHeadingIndices.length > 1) {
    // Pair each attached image with its best matching `* Học ...` heading line!
    const buckets = new Map<number, T[]>();
    const usedHeadingIndices = new Set<number>();

    for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
      const img = images[imgIdx];
      let bestHeadingIdx = -1;
      let bestScore = 0;

      for (const hIdx of movementHeadingIndices) {
        const sc = scoreHeadingImageMatch(trimmedLines[hIdx], img.title || '');
        if (sc > bestScore) {
          bestScore = sc;
          bestHeadingIdx = hIdx;
        }
      }

      if (bestHeadingIdx === -1) {
        // Assign sequentially to the first unused heading, or the first heading if more images than headings
        const nextUnused = movementHeadingIndices.find((hIdx) => !usedHeadingIndices.has(hIdx));
        bestHeadingIdx = nextUnused !== undefined ? nextUnused : movementHeadingIndices[0];
      }

      usedHeadingIndices.add(bestHeadingIdx);
      const list = buckets.get(bestHeadingIdx) || [];
      list.push(img);
      buckets.set(bestHeadingIdx, list);
    }

    const segments: Column1Segment<T>[] = [];
    let buffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      buffer.push(lines[i]);
      const attachedHere = buckets.get(i);
      if (attachedHere && attachedHere.length > 0) {
        const txt = buffer.join('\n').trimEnd();
        if (txt) segments.push({ type: 'text', text: txt });
        segments.push({ type: 'images', images: attachedHere });
        buffer = [];
      }
    }

    const tail = buffer.join('\n').replace(/^\n+/, '');
    if (tail.trim()) {
      segments.push({ type: 'text', text: tail });
    }
    return segments;
  }

  // 4. Standard numbered activity sub-heading (`1.2. Khởi động...`, `2.1. ...`, `3.1. Tập đồng loạt...`, `3.2. Tập theo tổ...`, `3.3. Tập cặp đôi...`, `3.4. Thi đua / Cá nhân...`)
  const subHeadingIdx = trimmedLines.findIndex((l) => SUB_HEADING_RE.test(l));
  if (subHeadingIdx !== -1) {
    return buildSegmentsAtSingleIndex(lines, subHeadingIdx, images);
  }

  // 5. Generic fallback: find the first non-empty, non-bullet heading line (skipping major banner if next line is also a heading)
  let anchorIdx = -1;
  for (let i = 0; i < trimmedLines.length; i++) {
    const l = trimmedLines[i];
    if (!l) continue;
    if (MAJOR_SECTION_BANNER_RE.test(l)) {
      anchorIdx = i;
      continue;
    }
    if (!BULLET_LINE_RE.test(l)) {
      anchorIdx = i;
      break;
    }
    break;
  }

  if (anchorIdx !== -1) {
    return buildSegmentsAtSingleIndex(lines, anchorIdx, images);
  }

  // Ultimate fallback: heading absent, put text then images
  return [
    { type: 'text', text: raw },
    { type: 'images', images }
  ];
}

function buildSegmentsAtSingleIndex<T extends Column1MediaItem>(
  lines: string[],
  anchorIdx: number,
  images: T[]
): Column1Segment<T>[] {
  const beforeText = lines.slice(0, anchorIdx + 1).join('\n').trimEnd();
  const afterText = lines.slice(anchorIdx + 1).join('\n').replace(/^\n+/, '');

  const segments: Column1Segment<T>[] = [];
  if (beforeText) {
    segments.push({ type: 'text', text: beforeText });
  }
  segments.push({ type: 'images', images });
  if (afterText.trim()) {
    segments.push({ type: 'text', text: afterText });
  }
  return segments;
}
