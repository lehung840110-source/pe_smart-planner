import { DiagramAttachment, LessonRow, SgkImageItem, SubFolderType } from '../types/gdtc';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import {
  standardFormationDiagrams,
  FormationDiagram,
  getFormationDiagramByKeyword,
  getFormationDiagramForPhaseAndGrade,
  isLegacySharedStandardFormationUrl
} from '../data/formationDiagrams';
import { standardMovementsLibrary, findMatchingMovement, MovementTechnicalItem } from '../data/movementLibrary';
import {
  sgkCurriculumTree,
  SgkLessonFolder,
  getEffectiveSgkCurriculumTree,
  getSgkTreeOverrides,
  findSgkLessonByTopicOrTitle,
  findSgkLessonForMovement,
  doesImageBelongToSgkLesson,
  findSgkLessonByPage,
  isFabricatedLegacyGameName
} from '../data/sgkCurriculumTree';
import { applyOfficialIntegrationsToLessonRows } from '../data/integrationAddressesData';
import { sortLibraryImages, detectPracticeSubSlotType } from './libraryImageOrder';
import {
  detectCompoundConceptId,
  detectLessonContextDomain,
  isCalisthenicsMovementLesson,
  isNonCalisthenicsCoordinationText,
  matchTechnicalImagesByContext
} from './keywordImageMatcher';
import { normalizeAllCapsForSentenceBody } from './textCaseHelper';

export interface AutoMatchResult {
  newRows: LessonRow[];
  detectedMovements: string[];
  matchedImages: Array<{ rowIdx: number; col: 'content' | 'hs'; title: string }>;
  matchedFormations: Array<{ rowIdx: number; name: string }>;
}

/**
 * Extracts movement names from a lesson title string.
 * Example: "Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 1)"
 * -> ["Động tác Chân", "Động tác Lườn (Bụng)"]
 */
export function extractMovementNamesFromTitle(title: string): string[] {
  const cleanTitle = title.replace(/^bài\s*\d+\s*[:\-]?\s*/i, '').trim();

  // Common movement patterns in GDPT 2018 (ordered by specificity)
  const knownMovements = [
    'Động tác Vươn thở với vòng thể dục',
    'Động tác Tay với vòng thể dục',
    'Động tác Chân với vòng thể dục',
    'Động tác Lườn với vòng thể dục',
    'Động tác Bụng với vòng thể dục',
    'Động tác Toàn thân với vòng thể dục',
    'Động tác Nhảy với vòng thể dục',
    'Động tác Điều hòa với vòng thể dục',
    'Động tác Vươn thở với vòng',
    'Động tác Tay với vòng',
    'Động tác Chân với vòng',
    'Động tác Lườn với vòng',
    'Động tác Bụng với vòng',
    'Động tác Toàn thân với vòng',
    'Động tác Nhảy với vòng',
    'Động tác Điều hòa với vòng',
    'Động tác Vươn thở với gậy',
    'Động tác Tay với gậy',
    'Động tác Chân với gậy',
    'Động tác Vặn mình với gậy',
    'Động tác Bụng với gậy',
    'Động tác Toàn thân với gậy',
    'Động tác Phối hợp với gậy',
    'Động tác Thăng bằng với gậy',
    'Động tác Nhảy với gậy',
    'Động tác Điều hòa với gậy',
    'Động tác với gậy',
    'Động tác Vươn thở',
    'Động tác Tay',
    'Động tác Chân',
    'Động tác Lườn',
    'Động tác Bụng',
    'Động tác Vặn mình',
    'Động tác Toàn thân',
    'Động tác Phối hợp',
    'Động tác Thăng bằng',
    'Động tác Nhảy',
    'Động tác Điều hòa',
    'Biến đổi đội hình hàng dọc',
    'Đổi chân khi đi đều sai nhịp',
    'Đi đều chuyển sang chạy',
    'Động tác Đi đều, Đứng lại',
    'Đi đều, Đứng lại',
    'Đi đều vòng phải',
    'Đi đều vòng trái'
  ];

  const isNonBtdCoord = isNonCalisthenicsCoordinationText(cleanTitle);
  const matches: Array<{ name: string; index: number }> = [];
  for (const km of knownMovements) {
    if (isNonBtdCoord && /phối hợp/i.test(km)) continue;
    const reg = new RegExp(km.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const match = reg.exec(cleanTitle);
    if (match) {
      const isSubMatch = matches.some((m) => Math.abs(m.index - match.index) < 6 && m.name.length > km.length);
      if (!isSubMatch) {
        matches.push({ name: km, index: match.index });
      }
    }
  }

  // Sort by occurrence in title to preserve exact pedagogical sequence
  matches.sort((a, b) => a.index - b.index);

  if (matches.length > 0) {
    return matches.map((m) => m.name);
  }

  // Fallback: split by comma if none matched
  const parts = cleanTitle
    .replace(/\s*\([^)]*\)/g, '')
    .split(/[,;\-]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && !s.toLowerCase().startsWith('tiết'));
  return parts.length > 0 ? parts : [cleanTitle];
}

export interface MovementPartitionResult {
  allMovements: string[];
  newMovements: string[];
  reviewMovements: string[];
  isPeriod2: boolean;
  displayMovementName: string;
  summaryExplanation: string;
}

/**
 * Authoritative Pedagogical Rule (GDPT 2018):
 * - N = 2:
 *   + Tiết 1: Học động tác 1.
 *   + Tiết 2: Học động tác 2 + Ôn động tác 1.
 * - N = 3:
 *   + Tiết 1: Học 2 động tác đầu (m1, m2).
 *   + Tiết 2: Học động tác thứ 3 (m3) + Ôn 2 động tác của Tiết 1 (m1, m2).
 * - N = 4:
 *   + Tiết 1: Học 2 động tác đầu (m1, m2).
 *   + Tiết 2: Học 2 động tác sau (m3, m4) + Ôn 2 động tác của Tiết 1 (m1, m2).
 * - N = 5:
 *   + Tiết 1: Học 3 động tác đầu (m1, m2, m3).
 *   + Tiết 2: Học 2 động tác sau (m4, m5) + Ôn 3 động tác của Tiết 1 (m1, m2, m3).
 * - N > 5:
 *   + Tiết 1: Học ceil(N/2) động tác đầu.
 *   + Tiết 2: Học phần còn lại + Ôn toàn bộ các động tác của Tiết 1.
 */
export function partitionLessonMovements(
  movements: string[],
  isPeriod2: boolean
): MovementPartitionResult {
  const count = movements.length;

  if (count <= 1) {
    const single = movements[0] || 'động tác thể dục';
    return {
      allMovements: movements,
      newMovements: isPeriod2 ? [] : movements,
      reviewMovements: isPeriod2 ? movements : [],
      isPeriod2,
      displayMovementName: isPeriod2 ? `Ôn tập ${single}` : `Học ${single}`,
      summaryExplanation: isPeriod2
        ? `Tiết 2: Ôn tập và hoàn thiện kỹ thuật ${single}`
        : `Tiết 1: Học kỹ thuật mới ${single}`
    };
  }

  let newMovements: string[] = [];
  let reviewMovements: string[] = [];

  if (count === 2) {
    // 2 động tác: Tiết 1 học m1; Tiết 2 học m2 + ôn m1
    if (!isPeriod2) {
      newMovements = [movements[0]];
      reviewMovements = [];
    } else {
      newMovements = [movements[1]];
      reviewMovements = [movements[0]];
    }
  } else if (count === 3) {
    // 3 động tác: Tiết 1 học m1, m2; Tiết 2 học m3 + ôn m1, m2
    if (!isPeriod2) {
      newMovements = [movements[0], movements[1]];
      reviewMovements = [];
    } else {
      newMovements = [movements[2]];
      reviewMovements = [movements[0], movements[1]];
    }
  } else if (count === 4) {
    // 4 động tác: mỗi tiết 2 động tác (Tiết 1: m1, m2; Tiết 2: m3, m4 + ôn m1, m2)
    if (!isPeriod2) {
      newMovements = [movements[0], movements[1]];
      reviewMovements = [];
    } else {
      newMovements = [movements[2], movements[3]];
      reviewMovements = [movements[0], movements[1]];
    }
  } else if (count === 5) {
    // 5 động tác: chia 3, 2 (Tiết 1: m1, m2, m3; Tiết 2: m4, m5 + ôn m1, m2, m3)
    if (!isPeriod2) {
      newMovements = [movements[0], movements[1], movements[2]];
      reviewMovements = [];
    } else {
      newMovements = [movements[3], movements[4]];
      reviewMovements = [movements[0], movements[1], movements[2]];
    }
  } else {
    // > 5 động tác
    const splitIdx = Math.ceil(count / 2);
    if (!isPeriod2) {
      newMovements = movements.slice(0, splitIdx);
      reviewMovements = [];
    } else {
      newMovements = movements.slice(splitIdx);
      reviewMovements = movements.slice(0, splitIdx);
    }
  }

  let displayMovementName = '';
  if (!isPeriod2) {
    displayMovementName = `Học ${newMovements.join(' và ')}`;
  } else {
    if (newMovements.length > 0 && reviewMovements.length > 0) {
      displayMovementName = `Học ${newMovements.join(' và ')}; Ôn ${reviewMovements.join(' và ')}`;
    } else if (newMovements.length > 0) {
      displayMovementName = `Học ${newMovements.join(' và ')}`;
    } else {
      displayMovementName = `Ôn ${reviewMovements.join(' và ')}`;
    }
  }

  const summaryExplanation = !isPeriod2
    ? `Tiết 1: Học mới ${newMovements.join(', ')}`
    : `Tiết 2: Học mới ${newMovements.join(', ')} kết hợp ôn tập ${reviewMovements.join(', ')} từ Tiết 1`;

  return {
    allMovements: movements,
    newMovements,
    reviewMovements,
    isPeriod2,
    displayMovementName,
    summaryExplanation
  };
}

/**
 * Checks whether an image represents a game (Trò chơi) rather than a technical movement (Động tác).
 * Games must NEVER be inserted into the technical movement activity (Khám phá & Làm quen động tác).
 */
export function isGameImage(img: SgkImageItem): boolean {
  const t = (img.title || '').toLowerCase().replace(/["'“”‘’]/g, '');
  const c = (img.caption || '').toLowerCase().replace(/["'“”‘’]/g, '');
  const folder = (img.folder || '').toLowerCase();
  const cat = (img.category || '').toLowerCase();

  if (cat === 'tro_choi' || cat === 'tro_choi_khoi_dong' || folder === 'trochoi' || folder === 'trochoikhoidong') {
    return true;
  }
  if (t.includes('trò chơi') || t.includes('tro choi')) {
    return true;
  }
  // Only inspect caption before lesson bullet separator so a lesson title doesn't falsely flag an image
  const captionHead = c.split('•')[0] || '';
  if (captionHead.includes('trò chơi') || captionHead.includes('tro choi')) {
    return true;
  }
  const gameKeywords = [
    'lò cò tiếp sức',
    'trao gậy tiếp sức',
    'chuyền gậy tiếp sức',
    'kết bạn',
    'mèo đuổi chuột',
    'chim về tổ',
    'hoàng anh hoàng yến',
    'chạy theo hình',
    'cướp cờ',
    'thỏ nhường hang',
    'chui qua hầm',
    'chui qua',
    'đổi chỗ theo hiệu lệnh',
    'làm theo hiệu lệnh',
    'đứng ngồi theo hiệu lệnh',
    'đua ô tô',
    'nhanh lên bạn ơi',
    'người thừa thứ hai',
    'ai kéo khoẻ hơn',
    'ai kéo khỏe hơn',
    'đội nào nhanh nhất',
    'đua ngựa',
    'tìm người chỉ huy',
    'chuyền vòng tiếp sức',
    'lùa bóng qua cổng',
    'nhảy ô tiếp sức'
  ];
  return gameKeywords.some((kw) => t.includes(kw));
}

export function isWarmupGeneralImage(img: SgkImageItem): boolean {
  if (!img.imgUrl || img.imgUrl.startsWith('data:image/svg+xml')) return false;
  if (isGameImage(img)) return false;
  const t = (img.title || '').toLowerCase().replace(/["'“”‘’]/g, '');
  const capHead = ((img.caption || '').split('•')[0] || '').toLowerCase().replace(/["'“”‘’]/g, '');
  const text = `${t} ${capHead}`;
  if (/trò\s*chơi|chui\s*qua|hiệu\s*lệnh|đổi\s*chỗ|kết\s*bạn|lò\s*cò|mèo\s*đuổi|chim\s*về\s*tổ|đua\s*ô\s*tô|sơ\s*đồ/i.test(text)) {
    return false;
  }
  return img.folder === 'khoiDong' || img.category === 'khoi_dong' || /khởi\s*động\s*chung|xoay\s*(các\s*)?khớp|ép\s*dọc|ép\s*ngang/i.test(text);
}

/**
 * Returns true if the URL is an SVG data URI or static `.svg` illustration file.
 * Column 1 must ONLY hold authentic raster textbook photos (JPG/PNG/WEBP/JFIF), never stick-figure SVGs or formation diagrams.
 */
export function isSvgImageUrl(url?: string): boolean {
  if (!url) return false;
  const u = url.trim().toLowerCase();
  return u.startsWith('data:image/svg+xml') || /\.svg(\?.*|#.*)?$/i.test(u);
}

/**
 * Checks whether an image URL or title/caption explicitly references a DIFFERENT grade
 * (e.g. "/k2_", "Lớp 2", "Khối 2", "GDTC 2" when expectedGrade === 1).
 */
export function hasConflictingGradeTag(text: string | undefined, expectedGrade: number): boolean {
  if (!text) return false;
  const s = text.toLowerCase();

  // Check static asset prefixes such as /k2_..., /sgk_chuan/k4_..., k2_vuon_tho
  const prefixMatches = s.matchAll(/(?:^|[\/_\s])k([1-5])_/gi);
  for (const m of prefixMatches) {
    const g = Number(m[1]);
    if (g >= 1 && g <= 5 && g !== expectedGrade) return true;
  }

  // Check explicit Vietnamese grade labels: "Lớp 2", "Khối 2", "GDTC 2", "GDTC Lớp 2"
  const labelMatches = s.matchAll(
    /(?:^|[^a-zA-ZÀ-ỹ0-9])(?:lớp|lop|khối|khoi|gdtc(?:\s*(?:lớp|lop|khối|khoi))?)\s*([1-5])(?:\b|[^0-9])/gi
  );
  let sawExpected = false;
  let sawOther = false;
  for (const m of labelMatches) {
    const g = Number(m[1]);
    if (g === expectedGrade) sawExpected = true;
    else if (g >= 1 && g <= 5) sawOther = true;
  }
  if (sawOther && !sawExpected) return true;
  return false;
}

/**
 * Checks if a Column 1 media attachment (url + title) violates slot classification rules:
 * - ALL SVG files (`data:image/svg+xml` and `*.svg`) and formation diagrams must NEVER sit in Column 1
 * - Non-game rows (1.2, 2.1, 3.2, 4.2) MUST strictly match `grade` (never borrow images from another grade)
 * - Game rows (1.3, 3.5) MAY reuse raster game images from another grade ONLY when the game name matches
 * - Game photos must NEVER sit in 1.2 (Khởi động chung) or 2.1 (Động tác kỹ thuật)
 */
export function isInvalidColumn1AttachmentForRow(
  rowContent: string,
  imgUrl: string | undefined,
  imgTitle: string | undefined,
  grade: number,
  lessonTitle: string = '',
  userPinned: boolean = false
): boolean {
  if (!imgUrl || userPinned) return false;
  const uLower = imgUrl.toLowerCase();
  const cLower = (rowContent || '').toLowerCase();
  const tNorm = (imgTitle || '').toLowerCase().replace(/["'“”‘’]/g, '');

  // 1. Strictly ban ALL SVG files (formation diagrams + stick-figure .svg placeholders) & mislabeled formation JPG
  if (
    isSvgImageUrl(uLower) ||
    uLower.includes('k3_tro_choi_tam_giac.jpg') ||
    tNorm.includes('sơ đồ:') ||
    tNorm.startsWith('sơ đồ ') ||
    tNorm.startsWith('đội hình ')
  ) {
    return true;
  }

  // Ban known mislabeled static files from wrong categories
  if (uLower.includes('k3_on_di_deu_doi_chan.jpg') && !cLower.includes('ai kéo')) {
    return true;
  }
  if (
    (uLower.includes('k1_tro_choi_tho.jpg') || uLower.includes('k5_chuyen_gay_tiep_suc.jpg')) &&
    (cLower.includes('1.3.') || cLower.includes('3.5.') || cLower.includes('trò chơi'))
  ) {
    return true;
  }

  const gameTitlePattern = /trò\s*chơi|chui\s*qua|hiệu\s*lệnh|đổi\s*chỗ|kết\s*bạn|lò\s*cò|mèo\s*đuổi|chim\s*về\s*tổ|đua\s*ô\s*tô|ai\s*kéo|người\s*thừa|cướp\s*cờ/i;

  const isWarmupGameRow =
    cLower.includes('1.3.') ||
    (cLower.includes('trò chơi') && cLower.includes('khởi động'));
  const isKhoiDongChungRow =
    !isWarmupGameRow &&
    (cLower.includes('1.2.') || (cLower.includes('khởi động') && !cLower.includes('1.1.')));
  const isKnowledgeRow =
    cLower.includes('2.1.') ||
    cLower.includes('khám phá') ||
    cLower.includes('kiến thức mới');
  const isPracticeGameRow =
    cLower.includes('3.5.') ||
    (cLower.includes('3.4.') && cLower.includes('trò chơi')) ||
    cLower.includes('trò chơi vận động');
  const isGameRow = isWarmupGameRow || isPracticeGameRow;

  // 2. For movement, practice, and application rows (2.1, 3.1-3.4, 4.2): STRICTLY forbid any cross-grade image!
  //    Warm-up general (1.2 Khởi động chung) and exact-name Games (1.3, 3.5) MAY share raster images across grades.
  if (!isGameRow && !isKhoiDongChungRow) {
    if (hasConflictingGradeTag(uLower, grade) || hasConflictingGradeTag(tNorm, grade)) {
      return true;
    }
  }

  // 3. 1.2 Khởi động chung MUST NEVER hold game photos
  if (isKhoiDongChungRow && gameTitlePattern.test(tNorm)) {
    return true;
  }

  // 4. 2.1 Khám phá kiến thức mới MUST NEVER hold game photos, Bài thể dục in Assessment, or cross-domain hijacked photos
  if (isKnowledgeRow) {
    if (gameTitlePattern.test(tNorm)) return true;
    const isAssessment = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(`${lessonTitle} ${rowContent}`);
    if (isAssessment && (tNorm.includes('vươn thở') || uLower.includes('vuon_tho'))) return true;

    if (lessonTitle) {
      const lessonDomain = detectLessonContextDomain(lessonTitle);
      const isBtdPhotoTitle =
        !isNonCalisthenicsCoordinationText(tNorm) &&
        (/động\s*tác\s*(vươn\s*thở|tay|chân|lườn|bụng|vặn\s*mình|toàn\s*thân|phối\s*hợp|nhảy|điều\s*h[oò]a)\b/i.test(tNorm) ||
          /\/k[1-5]_(vuon_tho|tay|chan|luon|bung|van_minh|toan_than|phoi_hop|dieu_hoa)/i.test(uLower));

      // Reject Bài thể dục movement photos sitting inside non-BTD lessons (e.g. "Phối hợp di chuyển", "Vận động đầu, cổ", "Vận động của tay/chân")
      if (
        (lessonDomain === 'dhdn' || lessonDomain === 'tu_the_vdcb' || lessonDomain === 'tttc') &&
        isBtdPhotoTitle
      ) {
        return true;
      }

      // Reject non-BTD coordination photos sitting inside Bài thể dục lessons
      if (lessonDomain === 'bai_the_duc' && isNonCalisthenicsCoordinationText(tNorm)) {
        return true;
      }
    }
  }

  // 5. 1.3 or 3.5 Game rows: cross-grade raster reuse is ALLOWED ONLY when the game name matches!
  if (isGameRow) {
    const targetGameName = extractGameNameFromRowText(rowContent);
    if (targetGameName && tNorm.length > 0) {
      const exactMatch = doGameNamesMatch(imgTitle || '', targetGameName);
      if (!exactMatch) {
        const targetWords = getGameKeyTokens(targetGameName);
        const imgTokens = new Set(getGameKeyTokens(imgTitle || ''));
        const matchCount = targetWords.filter((w) => imgTokens.has(w)).length;
        const isGenericPlaceHolder =
          tNorm.includes('sơ đồ') || (tNorm.includes('tam giác') && !targetGameName.toLowerCase().includes('tam giác'));
        const isCrossGrade = hasConflictingGradeTag(uLower, grade) || hasConflictingGradeTag(tNorm, grade);
        // Cross-grade games require strong name match; same-grade requires at least 1 meaningful keyword hit
        if (isGenericPlaceHolder || (targetWords.length >= 2 && matchCount === 0)) {
          return true;
        }
        if (isCrossGrade && targetWords.length >= 2 && matchCount < Math.ceil(targetWords.length * 0.7)) {
          return true;
        }
      }
    } else if (hasConflictingGradeTag(uLower, grade) || hasConflictingGradeTag(tNorm, grade)) {
      // No identifiable game name in row -> do not allow blind cross-grade image
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes Column 1 attachments of a single LessonRow, removing misplaced SVG diagrams,
 * fake .svg stick-figure assets, cross-grade movement leaks, warm-up games sitting in 1.2,
 * or mismatched game photos.
 */
export function sanitizeRowColumn1Media(
  row: LessonRow,
  grade: number,
  lessonTitle: string = ''
): LessonRow {
  // Never strip media from rows the teacher has manually edited
  if (row.userEditedMedia) {
    return row;
  }

  const existingList: DiagramAttachment[] =
    row.contentImages && row.contentImages.length > 0
      ? row.contentImages
      : row.contentImgUrl
      ? [{ id: 'c_san_0', url: row.contentImgUrl, title: row.contentImgTitle || '' }]
      : [];

  if (existingList.length === 0 && !row.contentImgUrl) {
    return row;
  }

  const validList = existingList.filter(
    (item) =>
      item.url &&
      (item.userPinned ||
        !isInvalidColumn1AttachmentForRow(
          row.content,
          item.url,
          item.title || row.contentImgTitle,
          grade,
          lessonTitle,
          Boolean(item.userPinned)
        ))
  );

  if (validList.length === existingList.length && existingList.length > 0) {
    return row;
  }

  return {
    ...row,
    contentImgUrl: validList[0]?.url || undefined,
    contentImgTitle: validList[0]?.title || undefined,
    contentImages: validList
  };
}

/**
 * Compacts overlong 2.1 (Khám phá kiến thức mới) rows:
 * - Removes verbose 8-beat walls (`- Nhịp 1:`, `- Nhịp 2:`, ..., `- Nhịp 5, 6, 7, 8:`)
 * - Prioritizes the new movement over review (`* Ôn tập...`), keeping review to 1 concise bullet
 * - Removes stacked `Ôn tập:` review images when a new movement is being taught
 * Preserves any official integration lines (`Tích hợp ...`).
 */
export function compactOverlongKnowledgeRow(row: LessonRow): LessonRow {
  const raw = row.content || '';
  const cLower = raw.toLowerCase();
  const isKnowledgeRow =
    cLower.includes('2.1.') ||
    cLower.includes('khám phá') ||
    cLower.includes('kiến thức mới');
  if (!isKnowledgeRow) return row;

  const hasVerboseBeats = /(?:^|\n)\s*[-•]?\s*nhịp\s*[1-8]\s*[:\-]/i.test(raw);
  const hasReviewBeforeNew =
    /\*\s*ôn\s+tập/i.test(raw) && /\*\s*học\s+/i.test(raw);
  const hasStackedReviewImgs =
    (row.contentImages?.length || 0) > 1 &&
    (row.contentImages || []).some((it) => /^ôn\s*tập\s*:/i.test((it.title || '').trim()));

  if (!hasVerboseBeats && !hasReviewBeforeNew && !hasStackedReviewImgs) {
    return row;
  }

  let nextContent = raw;

  // 1. Strip verbose beat-by-beat lines (- Nhịp 1: ... - Nhịp 5, 6, 7, 8: ...)
  if (hasVerboseBeats) {
    const lines = nextContent.split('\n');
    const kept: string[] = [];
    let skippedBeatBlock = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-•]?\s*nhịp\s*[1-8](?:\s*,\s*[1-8])*\s*[:\-]/i.test(trimmed)) {
        if (!skippedBeatBlock) {
          kept.push(
            '- Thực hiện đúng tư thế chuẩn bị, biên độ kỹ thuật và nhịp thở theo tranh minh họa SGK (2x8 nhịp).'
          );
          skippedBeatBlock = true;
        }
        continue;
      }
      skippedBeatBlock = false;
      kept.push(line);
    }
    nextContent = kept.join('\n');
  }

  // 2. If row has BOTH `* Ôn tập...` AND `* Học ...`, prioritize `* Học ...` first and condense review into 1 line
  if (/\*\s*ôn\s+tập/i.test(nextContent) && /\*\s*học\s+/i.test(nextContent)) {
    const lines = nextContent.split('\n');
    const headerLines: string[] = [];
    const newBlocks: string[] = [];
    const integrationLines: string[] = [];
    let reviewHeading = '';
    let mode: 'header' | 'review' | 'new' | 'chain' = 'header';

    for (const line of lines) {
      const t = line.trim();
      if (/tích\s*hợp/i.test(t) && (t.startsWith('-') || t.startsWith('*') || t.startsWith('+'))) {
        integrationLines.push(line);
        continue;
      }
      if (/^\*\s*ôn\s+tập/i.test(t)) {
        mode = 'review';
        const mParen = t.match(/\(([^)]+)\)/);
        reviewHeading = mParen ? mParen[1].trim() : 'các động tác Tiết 1';
        continue;
      }
      if (/^\*\s*học\s+/i.test(t)) {
        mode = 'new';
        newBlocks.push(line);
        continue;
      }
      if (/^\*\s*phối\s*hợp\s*liên\s*hoàn/i.test(t)) {
        mode = 'chain';
        continue;
      }

      if (mode === 'header') {
        headerLines.push(line);
      } else if (mode === 'new') {
        if (t.length > 0) newBlocks.push(line);
      }
      // skip verbose lines inside 'review' and redundant 'chain'
    }

    const parts: string[] = [];
    const cleanHeader = headerLines.join('\n').trim();
    if (cleanHeader) parts.push(cleanHeader);
    if (newBlocks.length > 0) parts.push(newBlocks.join('\n').trim());
    parts.push(
      `* Ôn tập nhanh & ghép liên hoàn (${reviewHeading || 'động tác Tiết 1'}):\n- Ôn nhanh 1 lần động tác đã học và ghép liên hoàn với động tác mới (2x8 nhịp).`
    );
    if (integrationLines.length > 0) {
      parts.push(integrationLines.join('\n'));
    }
    nextContent = parts.join('\n');
  }

  nextContent = nextContent.replace(/\n{3,}/g, '\n\n').trim();

  // 3. Remove stacked `Ôn tập:` review images when learning a new movement
  let nextContentImages = row.contentImages ? [...row.contentImages] : undefined;
  let nextImgUrl = row.contentImgUrl;
  let nextImgTitle = row.contentImgTitle;

  if (/\*\s*học\s+/i.test(nextContent) && nextContentImages && nextContentImages.length > 0) {
    const newOnly = nextContentImages.filter((it) => !/^ôn\s*tập\s*:/i.test((it.title || '').trim()));
    nextContentImages = newOnly;
    nextImgUrl = newOnly[0]?.url || undefined;
    nextImgTitle = newOnly[0]?.title || undefined;
  }

  return {
    ...row,
    content: nextContent,
    contentImgUrl: nextImgUrl,
    contentImgTitle: nextImgTitle,
    contentImages: nextContentImages
  };
}

/**
 * Resolves the authoritative SubFolderType of an image item from its folder/category metadata.
 * Strictly prevents Game images saved under 'khoiDong' from polluting 1.2 Khởi động chung.
 */
export function getImageEffectiveSubFolder(img: SgkImageItem): SubFolderType {
  // Never allow any Game image to be treated as 'khoiDong' (1.2 Khởi động chung)
  if (isGameImage(img)) {
    const t = `${img.title || ''} ${(img.caption || '').split('•')[0] || ''}`.toLowerCase();
    if (
      img.folder === 'troChoiKhoiDong' ||
      img.category === 'tro_choi_khoi_dong' ||
      img.folder === 'khoiDong' ||
      img.category === 'khoi_dong' ||
      /trò chơi bổ trợ khởi động|trò chơi khởi động|chui qua hầm|làm theo hiệu lệnh|đứng ngồi theo hiệu lệnh|đổi chỗ theo hiệu lệnh|kết bạn|ai kéo khoẻ|đội nào nhanh nhất|người thừa thứ hai/i.test(t)
    ) {
      return 'troChoiKhoiDong';
    }
    return 'troChoi';
  }
  if (
    img.folder === 'kyThuat' ||
    img.folder === 'luyenTap' ||
    img.folder === 'vanDung' ||
    img.folder === 'khoiDong' ||
    img.folder === 'troChoi' ||
    img.folder === 'troChoiKhoiDong'
  ) {
    return img.folder;
  }
  if (img.category === 'tro_choi_khoi_dong') return 'troChoiKhoiDong';
  if (img.category === 'tro_choi') return 'troChoi';
  if (img.category === 'van_dung') return 'vanDung';
  if (img.category === 'khoi_dong') return 'khoiDong';
  if (img.category === 'tap_luyen') return 'luyenTap';
  return 'kyThuat';
}

export interface AccurateMovementDetails {
  movementName: string;
  imgUrl: string;
  imgTitle: string;
  movementSteps: string;
  gvExplanation: string;
  hsTask: string;
  practiceFocus: string;
  newMovements?: string[];
  reviewMovements?: string[];
  allImages?: Array<{ id: string; url: string; title: string }>;
}

export const AUTHENTIC_TEXTBOOK_MAP: Record<string, { url: string; title: string }> = {
  vuon_tho: {
    url: '/assets/sgk_chuan/k1_vuon_tho.jpg',
    title: 'Động tác Vươn thở - SGK Lớp 1 (Trang 36)'
  },
  tay: {
    url: '/assets/sgk_chuan/k1_tay.jpg',
    title: 'Động tác Tay - SGK Lớp 1 (Trang 37)'
  },
  chan: {
    url: '/assets/sgk_chuan/k1_chan.jpg',
    title: 'Động tác Chân - SGK Lớp 1 (Trang 43)'
  },
  luon: {
    url: '/assets/sgk_chuan/k1_luon.jpg',
    title: 'Động tác Lườn - SGK Lớp 1 (Trang 44)'
  },
  bung: {
    url: '/assets/sgk_chuan/k1_bung.jpg',
    title: 'Động tác Bụng - SGK Lớp 1 (Trang 49)'
  },
  phoi_hop: {
    url: '/assets/aistudio/ban-in_80x60cm_300dpi_vector-chuan-in_90ca6925.png',
    title: 'Động tác Phối hợp (Tranh Vector 5 Nhịp) - SGK GDTC Lớp 1'
  },
  dieu_hoa: {
    url: '',
    title: 'Động tác Điều hòa - Cần tìm hình ảnh đúng Khối 1 trong Thư viện'
  },
  di_deu: {
    url: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
    title: 'Động tác Đi đều, Đứng lại - SGK Lớp 3 (Trang 27)'
  },
  on_di_deu: {
    url: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
    title: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp - SGK Lớp 3 (Trang 27-28)'
  },
  gay: {
    url: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    title: 'Bài tập thể dục với gậy (Vươn thở, Tay) - SGK Lớp 5 (Trang 24)'
  },
  vuon_tho_tay_gay: {
    url: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    title: 'Động tác Vươn thở và Tay với gậy - SGK GDTC Lớp 5 (Trang 24-25)'
  },
  chan_gay: {
    url: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
    title: 'Động tác Chân với gậy - SGK Lớp 5 (Trang 25)'
  },
  bung_gay: {
    url: '/assets/sgk_chuan/k5_bung_voi_gay.jpg',
    title: 'Động tác Bụng với gậy - SGK GDTC Lớp 5 (Trang 30)'
  },
  van_minh_gay: {
    url: '/assets/sgk_chuan/k5_van_minh_voi_gay.jpg',
    title: 'Động tác Vặn mình với gậy - SGK GDTC Lớp 5 (Trang 30)'
  },
  bung_van_minh_gay: {
    url: '/assets/sgk_chuan/k5_bung_voi_gay.jpg',
    title: 'Động tác Bụng và Động tác Vặn mình với gậy - SGK GDTC Lớp 5 (Trang 30)'
  },
  toan_than_gay: {
    url: '/assets/sgk_chuan/k5_toan_than_voi_gay.jpg',
    title: 'Động tác Toàn thân với gậy - SGK GDTC Lớp 5 (Trang 31)'
  },
  van_minh: {
    url: '',
    title: 'Động tác Vặn mình - Chưa có ảnh chuẩn SGK trong thư viện'
  },
  toan_than: {
    url: '',
    title: 'Động tác Toàn thân - Chưa có ảnh chuẩn SGK trong thư viện'
  },
  nhay_gay: {
    url: '',
    title: 'Động tác Nhảy với gậy - Cần tìm hình ảnh đúng Khối 5 trong Thư viện'
  },
  dieu_hoa_gay: {
    url: '',
    title: 'Động tác Điều hòa với gậy - Cần tìm hình ảnh đúng Khối 5 trong Thư viện'
  },
  nhay: {
    url: '',
    title: 'Động tác Nhảy - Cần tìm hình ảnh trong Thư viện'
  },
  thang_bang: {
    url: '/assets/aistudio/0e0e03fc-7060-481d-85f2-da82dde1f3c3_eccfceae.jfif',
    title: 'Động tác Thăng bằng - SGK Lớp 1'
  },
  // Khối 2 (SGK GDTC Lớp 2 - chỉ dùng ảnh thật từ Thư viện, không tự chèn hình vẽ SVG thay thế)
  k2_vuon_tho: {
    url: '',
    title: 'Động tác Vươn thở (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_tay: {
    url: '',
    title: 'Động tác Tay (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_chan: {
    url: '',
    title: 'Động tác Chân (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_luon: {
    url: '',
    title: 'Động tác Lườn (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_bung: {
    url: '',
    title: 'Động tác Bụng (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_toan_than: {
    url: '',
    title: 'Động tác Toàn thân (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  k2_nhay_dieu_hoa: {
    url: '',
    title: 'Động tác Nhảy và Điều hòa (Khối 2) - Cần tìm hình ảnh đúng Khối 2 trong Thư viện'
  },
  // Khối 4 (SGK GDTC Lớp 4 - chỉ dùng ảnh thật từ Thư viện, không tự chèn hình vẽ SVG thay thế)
  vuon_tho_vong: {
    url: '',
    title: 'Động tác Vươn thở với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  tay_vong: {
    url: '',
    title: 'Động tác Tay với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  chan_vong: {
    url: '',
    title: 'Động tác Chân với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  luon_vong: {
    url: '',
    title: 'Động tác Lườn với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  bung_vong: {
    url: '',
    title: 'Động tác Bụng với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  toan_than_vong: {
    url: '',
    title: 'Động tác Toàn thân với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  },
  nhay_dieu_hoa_vong: {
    url: '',
    title: 'Động tác Nhảy và Điều hòa với vòng (Khối 4) - Cần tìm hình ảnh đúng Khối 4 trong Thư viện'
  }
};

/**
 * Profile containing all technical and pedagogical details for a movement.
 */
export interface MovementProfile {
  key: string;
  name: string;
  imgUrl: string;
  imgTitle: string;
  steps: string;
  gv: string;
  hs: string;
  practiceFocus: string;
}

/**
 * Retrieves single movement technical profile, authentic photo, and pedagogical text.
 */
export function getSingleMovementProfile(
  rawName: string = '',
  grade: number = 1,
  userImages: SgkImageItem[] = [],
  targetLesson?: SgkLessonFolder
): MovementProfile {
  const lower = rawName.toLowerCase();
  let key = 'vuon_tho';
  let cleanName = rawName.trim();

  if (lower.includes('phối hợp') || lower.includes('phoi hop')) {
    key = grade === 5 ? 'toan_than_gay' : grade === 4 ? 'toan_than_vong' : grade === 2 ? 'k2_toan_than' : 'phoi_hop';
    cleanName = grade === 5 ? 'Động tác Toàn thân với gậy' : grade === 4 ? 'Động tác Toàn thân với vòng thể dục' : 'Động tác Phối hợp';
  } else if (lower.includes('điều hòa') || lower.includes('điều hoà') || lower.includes('dieu hoa')) {
    key = grade === 5 ? 'dieu_hoa_gay' : grade === 4 ? 'nhay_dieu_hoa_vong' : grade === 2 ? 'k2_nhay_dieu_hoa' : 'dieu_hoa';
    cleanName = grade === 5 ? 'Động tác Điều hòa với gậy' : grade === 4 ? 'Động tác Điều hòa với vòng thể dục' : 'Động tác Điều hòa';
  } else if (lower.includes('vươn thở') || lower.includes('vuon tho')) {
    key = grade === 5 ? 'vuon_tho_tay_gay' : grade === 4 ? 'vuon_tho_vong' : grade === 2 ? 'k2_vuon_tho' : 'vuon_tho';
    cleanName = grade === 5 ? 'Động tác Vươn thở với gậy' : grade === 4 ? 'Động tác Vươn thở với vòng thể dục' : 'Động tác Vươn thở';
  } else if (lower.includes('tay')) {
    key = grade === 5 ? 'vuon_tho_tay_gay' : grade === 4 ? 'tay_vong' : grade === 2 ? 'k2_tay' : 'tay';
    cleanName = grade === 5 ? 'Động tác Tay với gậy' : grade === 4 ? 'Động tác Tay với vòng thể dục' : 'Động tác Tay';
  } else if (lower.includes('chân') || lower.includes('chan')) {
    key = grade === 5 ? 'chan_gay' : grade === 4 ? 'chan_vong' : grade === 2 ? 'k2_chan' : 'chan';
    cleanName = grade === 5 ? 'Động tác Chân với gậy' : grade === 4 ? 'Động tác Chân với vòng thể dục' : 'Động tác Chân';
  } else if (lower.includes('lườn') || lower.includes('luon')) {
    key = grade === 4 ? 'luon_vong' : grade === 2 ? 'k2_luon' : 'luon';
    cleanName = grade === 4 ? 'Động tác Lườn với vòng thể dục' : 'Động tác Lườn';
  } else if (lower.includes('lưng – bụng') || lower.includes('lưng - bụng') || lower.includes('bụng') || lower.includes('bung')) {
    key = grade === 5 ? 'bung_gay' : grade === 4 ? 'bung_vong' : grade === 2 ? 'k2_bung' : 'bung';
    cleanName = grade === 5 ? 'Động tác Bụng với gậy' : grade === 4 ? 'Động tác Lưng – bụng với vòng thể dục' : 'Động tác Bụng';
  } else if (lower.includes('vặn mình') || lower.includes('van minh')) {
    key = grade === 5 ? 'van_minh_gay' : 'van_minh';
    cleanName = grade === 5 ? 'Động tác Vặn mình với gậy' : 'Động tác Vặn mình';
  } else if (lower.includes('toàn thân') || lower.includes('toan than')) {
    key = grade === 5 ? 'toan_than_gay' : grade === 4 ? 'toan_than_vong' : grade === 2 ? 'k2_toan_than' : 'toan_than';
    cleanName = grade === 5 ? 'Động tác Toàn thân với gậy' : grade === 4 ? 'Động tác Toàn thân với vòng thể dục' : 'Động tác Toàn thân';
  } else if (lower.includes('nhảy') || lower.includes('nhay')) {
    key = grade === 5 ? 'nhay_gay' : grade === 4 ? 'nhay_dieu_hoa_vong' : grade === 2 ? 'k2_nhay_dieu_hoa' : 'nhay';
    cleanName = grade === 5 ? 'Động tác Nhảy với gậy' : grade === 4 ? 'Động tác Nhảy với vòng thể dục' : 'Động tác Nhảy';
  } else if (lower.includes('thăng bằng') || lower.includes('thang bang')) {
    key = grade === 5 ? 'nhay_gay' : 'phoi_hop';
    cleanName = grade === 5 ? 'Động tác Nhảy với gậy' : 'Động tác Phối hợp';
  } else if (lower.includes('đi đều') || lower.includes('đứng lại')) {
    key = lower.includes('ôn') || lower.includes('đổi chân') || lower.includes('sai nhịp') ? 'on_di_deu' : 'di_deu';
    cleanName = key === 'on_di_deu' ? 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp' : 'Động tác Đi đều, Đứng lại';
  } else if (lower.includes('gậy')) {
    key = 'gay';
    cleanName = 'Bài tập thể dục với gậy';
  }

  // Locate exact SGK lesson folder for this specific movement (crucial when PPCT groups differ from SGK chapters)
  const movementLesson = findSgkLessonForMovement(grade, cleanName) || targetLesson;

  // Strictly filter candidate images (sorted by SGK tree & manual order): raster only (NO .svg), NOT a game, strictly 'kyThuat' subfolder, strictly SAME grade
  const orderedUserImages = sortLibraryImages(userImages, 'sgk');
  const technicalOnlyImages = orderedUserImages.filter((img) => {
    if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
    if (isGameImage(img)) return false;
    if (getImageEffectiveSubFolder(img) !== 'kyThuat') return false;
    if (String(img.grade) !== String(grade)) return false;
    if (
      hasConflictingGradeTag(img.imgUrl, grade) ||
      hasConflictingGradeTag(img.title, grade) ||
      hasConflictingGradeTag((img.caption || '').split('•')[0], grade)
    ) {
      return false;
    }
    return true;
  });

  // Match movement strictly against img.title (never let lesson summaries or non-BTD coordination phrases cross-pollute!)
  const matchesMovementByTitle = (text: string, checkKey: string): boolean => {
    if (!text) return false;
    const isNonBtd = isNonCalisthenicsCoordinationText(text);
    const isLimbBasicTopic = /vận\s*động\s*(của\s*)?(đầu|cổ|tay|chân|cơ\s*thể)|bóng\s*rổ|tung\s*bắt|chuyền\s*bóng|dẫn\s*bóng|ném\s*rổ/i.test(text);

    if (checkKey === 'vuon_tho' || checkKey === 'k2_vuon_tho') return (text.includes('vươn thở') || text.includes('vuon tho')) && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'tay' || checkKey === 'k2_tay') return !isNonBtd && !isLimbBasicTopic && (text.includes('động tác tay') || /\btay\b/i.test(text)) && !text.includes('cổ tay') && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'chan' || checkKey === 'k2_chan') return !isNonBtd && !isLimbBasicTopic && (text.includes('động tác chân') || /\bchân\b/i.test(text)) && !text.includes('cổ chân') && !text.includes('vươn thở') && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'luon' || checkKey === 'k2_luon') return (text.includes('lườn') || text.includes('luon')) && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'bung' || checkKey === 'k2_bung') return (text.includes('bụng') || text.includes('bung')) && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'van_minh') return (text.includes('vặn mình') || text.includes('van minh')) && !text.includes('gậy');
    if (checkKey === 'toan_than' || checkKey === 'k2_toan_than') return !isNonBtd && (text.includes('toàn thân') || text.includes('toan than') || text.includes('động tác phối hợp')) && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'phoi_hop') return !isNonBtd && (text.includes('động tác phối hợp') || text.includes('k1_phoi_hop') || (text.includes('phối hợp') && !isLimbBasicTopic)) && !text.includes('gậy');
    if (checkKey === 'dieu_hoa' || checkKey === 'k2_nhay_dieu_hoa') return (text.includes('điều hòa') || text.includes('điều hoà') || text.includes('dieu hoa') || text.includes('k1_dieu_hoa') || text.includes('nhảy')) && !text.includes('gậy') && !text.includes('vòng');
    if (checkKey === 'nhay') return !isNonBtd && (text.includes('động tác nhảy') || /\bnhảy\b/i.test(text) || /\bnhay\b/i.test(text)) && !text.includes('gậy') && !text.includes('vòng') && !text.includes('lò cò') && !text.includes('chướng ngại vật') && !text.includes('trong nước');
    if (checkKey === 'vuon_tho_vong') return (text.includes('vươn thở') || text.includes('vuon tho')) && text.includes('vòng');
    if (checkKey === 'tay_vong') return !isLimbBasicTopic && (text.includes('tay')) && text.includes('vòng') && !text.includes('cổ tay');
    if (checkKey === 'chan_vong') return !isLimbBasicTopic && (text.includes('chân') || text.includes('chan')) && text.includes('vòng') && !text.includes('cổ chân');
    if (checkKey === 'luon_vong') return (text.includes('lườn') || text.includes('luon')) && text.includes('vòng');
    if (checkKey === 'bung_vong') return (text.includes('bụng') || text.includes('bung') || text.includes('lưng – bụng') || text.includes('lưng - bụng')) && text.includes('vòng');
    if (checkKey === 'toan_than_vong') return !isNonBtd && (text.includes('toàn thân') || text.includes('toan than')) && text.includes('vòng');
    if (checkKey === 'nhay_dieu_hoa_vong') return (text.includes('nhảy') || text.includes('điều hòa') || text.includes('điều hoà')) && text.includes('vòng');
    if (checkKey === 'chan_gay') return !isLimbBasicTopic && (text.includes('chân') || text.includes('chan')) && text.includes('gậy');
    if (checkKey === 'bung_gay') return (text.includes('bụng') || text.includes('bung')) && text.includes('gậy');
    if (checkKey === 'van_minh_gay') return (text.includes('vặn mình') || text.includes('van minh')) && text.includes('gậy');
    if (checkKey === 'toan_than_gay') return !isNonBtd && (text.includes('toàn thân') || text.includes('toan than')) && text.includes('gậy');
    if (checkKey === 'vuon_tho_tay_gay') return (text.includes('vươn thở') || text.includes('tay')) && text.includes('gậy');
    if (checkKey === 'nhay_gay') return (text.includes('nhảy') || text.includes('nhay')) && text.includes('gậy');
    if (checkKey === 'dieu_hoa_gay') return (text.includes('điều hòa') || text.includes('điều hoà') || text.includes('dieu hoa')) && text.includes('gậy');
    if (checkKey === 'gay') return text.includes('gậy');
    if (checkKey === 'on_di_deu') return text.includes('ôn đi đều') || text.includes('đổi chân') || text.includes('sai nhịp');
    if (checkKey === 'di_deu') return text.includes('đi đều') || text.includes('đứng lại');
    return false;
  };

  // Detect if an image title explicitly belongs to a DIFFERENT movement so it cannot falsely match
  const distinctMovementChecks: Array<{ k: string; pat: RegExp }> = [
    { k: 'vuon_tho', pat: /vươn\s*thở/i },
    { k: 'tay', pat: /động\s*tác\s*tay\b/i },
    { k: 'chan', pat: /động\s*tác\s*chân\b/i },
    { k: 'luon', pat: /động\s*tác\s*lườn\b/i },
    { k: 'bung', pat: /động\s*tác\s*bụng\b/i },
    { k: 'van_minh', pat: /động\s*tác\s*vặn\s*mình/i },
    { k: 'toan_than', pat: /động\s*tác\s*toàn\s*thân/i },
    { k: 'phoi_hop', pat: /động\s*tác\s*phối\s*hợp/i },
    { k: 'nhay', pat: /động\s*tác\s*nhảy/i },
    { k: 'dieu_hoa', pat: /động\s*tác\s*điều\s*h[oò]a/i },
    { k: 'di_deu', pat: /đi\s*đều/i }
  ];

  const isSeekingCalisthenics = key !== 'di_deu' && key !== 'on_di_deu';
  const baseKey = key.replace(/_gay$/, '').replace(/_vong$/, '').replace(/^k2_/, '');
  const scoreTechnicalCandidate = (img: SgkImageItem): number => {
    // Reject non-Bài-thể-dục folder images (cd1 / cd3 / tttc) when looking for a Bài thể dục movement!
    if (isSeekingCalisthenics) {
      const tid = (img.topicId || '').toLowerCase();
      if (tid.includes('cd1') || tid.includes('cd3') || tid.includes('tttc')) return -1;
      if (isNonCalisthenicsCoordinationText(`${img.title || ''} ${img.lessonTitle || ''}`)) return -1;
    }

    const rawTitle = (img.title || '').toLowerCase();
    // Strip embedded lesson summary clauses after "- SGK" or "•" to focus purely on subject name
    const cleanSubjectTitle = rawTitle.split(/\s+-\s+sgk/i)[0] || rawTitle;
    const rawCapNote = ((img.caption || '').split('•')[0] || '').toLowerCase();

    const titleMatches = matchesMovementByTitle(cleanSubjectTitle, key);
    const captionMatches = !titleMatches && matchesMovementByTitle(rawCapNote, key);

    if (!titleMatches && !captionMatches) return -1;

    // Reject if image subject title explicitly names a OTHER single movement (e.g. "Động tác Chân" when looking for "Động tác Bụng")
    const conflictOther = distinctMovementChecks.some(
      (chk) => chk.k !== baseKey && chk.k !== key && chk.pat.test(cleanSubjectTitle)
    );
    if (conflictOther && !titleMatches) return -1;

    let score = titleMatches ? 200 : 80;
    if (movementLesson && doesImageBelongToSgkLesson(img, movementLesson)) score += 120;
    if (targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) score += 60;
    if (!img.id.startsWith('img_sgk_') && !img.imgUrl.startsWith('data:image/svg+xml')) score += 70;
    if (img.imgUrl.startsWith('data:image/png') || img.imgUrl.startsWith('data:image/jpeg') || img.imgUrl.startsWith('data:image/webp')) {
      score += 40;
    }
    if (img.folder === 'kyThuat') score += 20;
    return score;
  };

  let bestImg: SgkImageItem | null = null;
  let bestScore = -1;
  for (const img of technicalOnlyImages) {
    const sc = scoreTechnicalCandidate(img);
    if (sc > bestScore) {
      bestScore = sc;
      bestImg = img;
    }
  }

  let resolvedImgUrl = '';
  let resolvedImgTitle = '';

  const authenticEntry = AUTHENTIC_TEXTBOOK_MAP[key];
  const authenticMatchesGrade = Boolean(
    authenticEntry &&
      authenticEntry.url &&
      !isSvgImageUrl(authenticEntry.url) &&
      !hasConflictingGradeTag(authenticEntry.url, grade) &&
      !hasConflictingGradeTag(authenticEntry.title, grade) &&
      ((grade === 1 && (authenticEntry.url.includes('/k1_') || authenticEntry.title.includes('Lớp 1'))) ||
        (grade === 2 && (authenticEntry.url.includes('/k2_') || authenticEntry.title.includes('Lớp 2'))) ||
        (grade === 3 && (authenticEntry.url.includes('/k3_') || authenticEntry.title.includes('Lớp 3'))) ||
        (grade === 4 && (authenticEntry.url.includes('/k4_') || authenticEntry.title.includes('Lớp 4'))) ||
        (grade === 5 && (authenticEntry.url.includes('/k5_') || authenticEntry.title.includes('Lớp 5'))))
  );

  if (bestImg && bestImg.imgUrl && !isSvgImageUrl(bestImg.imgUrl)) {
    resolvedImgUrl = bestImg.imgUrl;
    resolvedImgTitle = bestImg.title;
  } else if (authenticMatchesGrade && authenticEntry) {
    resolvedImgUrl = authenticEntry.url;
    resolvedImgTitle = authenticEntry.title;
  } else {
    resolvedImgUrl = '';
    resolvedImgTitle = movementLesson
      ? `Chưa tìm được ảnh đúng Khối ${grade} (Trang ${movementLesson.startPage}-${movementLesson.endPage}): ${cleanName} — Vui lòng tìm trong Thư viện`
      : `Chưa tìm được ảnh đúng Khối ${grade} trong Thư viện: ${cleanName}`;
  }

  let steps = '';
  let gv = '';
  let hs = '';
  let practiceFocus = '';

  switch (key) {
    case 'phoi_hop':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước khuỵu gối chân trước, chân sau thẳng, vươn tay chữ V; rút chân gập thân thẳng gối, dang tay mở ngực (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Phối hợp (SGK GDTC Lớp 1), nêu tác dụng rèn đôi chân vững vàng và sự phối hợp tay - chân - thân.\n- Làm mẫu chuẩn 2 - 3 lần theo chiều gương kết hợp cho HS quan sát tranh SGK, nhấn mạnh giữ thẳng chân sau khi khuỵu gối và thẳng gối khi gập thân.\n- Hô nhịp chậm cho lớp tập thử, di chuyển uốn nắn sai sót và biểu dương học sinh thực hiện tốt.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, giãn cách 1 sải tay.\n- Quan sát động tác mẫu của GV và tranh SGK; tập mô phỏng theo nhịp hô chậm, giữ thăng bằng vững và sửa sai theo góp ý.`;
      practiceFocus = 'bước khuỵu gối chân trước chân sau thẳng và cúi gập thân phối hợp nhịp nhàng';
      break;

    case 'tay':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang rộng bằng vai, dang thẳng tay ngang vai lòng bàn tay ngửa và vỗ tay trước ngực dứt khoát (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Tay, nêu tác dụng phát triển khớp vai, cơ cánh tay và giữ thân trên thẳng đẹp.\n- Làm mẫu 2 - 3 lần kết hợp đối chiếu tranh SGK; lưu ý hai tay duỗi thẳng ngang vai, không chùng khuỷu.\n- Hô nhịp chậm cho lớp tập thử, sửa lỗi gù lưng và khích lệ cả lớp tập đều đẹp.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát động tác mẫu của GV và tranh SGK; tập mô phỏng dứt khoát theo nhịp đếm, giữ lưng thẳng, ngực căng.`;
      practiceFocus = 'hai tay dang thẳng ngang vai và nhịp vỗ tay trước ngực dứt khoát';
      break;

    case 'chan':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Kiễng gót thăng bằng hai tay chống hông, hạ gót khuỵu gối sâu giữ thẳng lưng, hai tay đưa ra trước ngang vai (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Chân, nêu tác dụng tăng sức mạnh khớp gối, cổ chân và khả năng giữ thăng bằng.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh giữ thân thẳng khi khuỵu gối, không chúi người ra trước.\n- Hô nhịp chậm cho lớp tập thử và uốn nắn kịp thời lỗi mất thăng bằng, cong lưng.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát tư thế kiễng gót và khuỵu gối lưng thẳng; tập mô phỏng theo nhịp đếm chậm và tự chỉnh tư thế.`;
      practiceFocus = 'kiễng gót thăng bằng và khuỵu gối sâu giữ lưng thẳng';
      break;

    case 'luon':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang dang tay, nghiêng lườn thẳng sang hai bên (một tay chống hông, một tay vươn sát tai), giữ hai chân thẳng (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Lườn, giải thích tác dụng giúp cột sống và hai bên lườn dẻo dai.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh nghiêng đúng mặt phẳng bên, không xoay vặn thân, hai chân giữ thẳng.\n- Hô nhịp chậm cho lớp tập thử và uốn nắn tư thế tay áp sát tai.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát hướng nghiêng thẳng hai bên của GV; tập chậm rãi đều hai bên và tự chỉnh tay sát tai.`;
      practiceFocus = 'nghiêng lườn thẳng sang hai bên và tay vươn sát tai';
      break;

    case 'bung':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước rộng hơn vai vươn tay lên cao, cúi gập thân sâu tay chạm mu bàn chân, giữ thẳng hai gối và thở ra đều (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Bụng, nêu tác dụng giúp lưng bụng dẻo dai, thân người cân đối.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh giữ thẳng hai khớp gối khi cúi gập thân sâu.\n- Hô nhịp chậm cho lớp tập thử và sửa sai lỗi co gối cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1 sải tay.\n- Quan sát kỹ thuật gập thân giữ thẳng gối của GV; tập mô phỏng chậm rãi, thở ra đều khi gập thân.`;
      practiceFocus = 'hai chân giữ thẳng và cúi gập thân sâu thở ra nhịp nhàng';
      break;

    case 'van_minh':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang dang tay ngang vai, xoay vặn thân trên sang hai bên 90 độ, giữ hai bàn chân bám chắc mặt sân (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Vặn mình, nêu tác dụng tăng độ linh hoạt khớp háng và cột sống.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh giữ cố định hai bàn chân, chỉ xoay thân trên và giữ tay ngang vai.\n- Hô nhịp chậm cho lớp tập thử và sửa lỗi xoay cả bàn chân hoặc hạ tay.`;
      hs = `- Đội hình 4 hàng ngang so le 1 sải tay.\n- Quan sát góc xoay thân trên và tư thế cố định bàn chân; tập dứt khoát đúng biên độ theo nhịp hô GV.`;
      practiceFocus = 'bàn chân cố định bám sàn và vặn thân trên 90 độ dứt khoát';
      break;

    case 'toan_than':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước chếch trước khuỵu gối chân trước, vươn tay chữ V; thu chân gập thân tay chạm mũi chân rồi đứng thẳng mở ngực (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Toàn thân, nêu tác dụng phối hợp linh hoạt chân, lưng và cánh tay.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; phân tích kỹ dồn trọng tâm chân trước và giữ thẳng chân khi gập thân.\n- Hô nhịp chậm cho lớp tập thử và uốn nắn thăng bằng cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang so le, giãn cách 1 sải tay.\n- Quan sát động tác mẫu của GV; tập mô phỏng nhịp nhàng, giữ vững thăng bằng và biên độ vươn tay.`;
      practiceFocus = 'dồn trọng tâm chân trước khuỵu gối và phối hợp toàn thân nhịp nhàng';
      break;

    case 'nhay':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bật nhảy tách - khép chân nhịp nhàng kết hợp dang tay ngang vai và vỗ tay trên đỉnh đầu, tiếp đất êm bằng nửa trước bàn chân (2x8 nhịp).`;
      gv = `- GV giới thiệu Động tác Nhảy, nêu tác dụng phát triển sức bật và sự linh hoạt toàn thân.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhắc điểm an toàn tiếp đất nhẹ bằng mũi bàn chân để hoãn xung.\n- Hô nhịp đếm đều cho lớp tập thử và chỉnh cách tiếp đất êm cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1 sải tay.\n- Quan sát cách tiếp đất êm và nhịp vỗ tay trên đầu; bật nhảy nhịp nhàng, giữ lưng thẳng và nhịp thở đều.`;
      practiceFocus = 'bật nhảy nhịp nhàng và tiếp đất nhẹ nhàng bằng nửa trước bàn chân';
      break;

    case 'dieu_hoa':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước chân chạm mũi sang ngang, hai tay đưa trước - dang ngang lắc cổ tay thả lỏng nhẹ nhàng, kết hợp hít sâu bằng mũi và thở ra chậm (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Điều hòa, nhấn mạnh tác dụng thả lỏng cơ thể và đưa nhịp tim, hô hấp về trạng thái cân bằng.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK, hướng dẫn lắc cổ tay mềm mại và hít thở sâu êm.\n- Hô nhịp chậm, nhẹ nhàng cho cả lớp thực hiện và nhận xét sự tiến bộ của lớp.`;
      hs = `- Đội hình 4 hàng ngang đứng giãn cách thoải mái.\n- Quan sát và thả lỏng toàn thân theo nhịp hô êm dịu của GV, phối hợp lắc cổ tay và hít sâu thở chậm.`;
      practiceFocus = 'lắc cổ tay thả lỏng nhẹ nhàng và điều hòa nhịp thở sâu êm';
      break;

    case 'di_deu':
      steps = `- TTCB: Đứng nghiêm.\n- Khẩu lệnh & kỹ thuật: "Đi đều... BƯỚC!" đi theo nhịp 1-2 dứt khoát (chân nọ tay kia, tay đánh vuông góc trước ngực); "Đứng lại... ĐỨNG!" rơi vào chân phải, bước thêm chân trái rồi khép chân phải về đứng nghiêm.`;
      gv = `- GV giới thiệu động tác Đi đều, Đứng lại (SGK Lớp 3), phân tích tác phong đội ngũ thống nhất, kỷ luật.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh quy tắc chân trái nhịp 1, chân phải nhịp 2 và khẩu lệnh Đứng lại.\n- Cho lớp giậm chân tại chỗ rồi đi đều đoạn ngắn, sửa ngay lỗi đi cùng chân cùng tay.`;
      hs = `- Đội hình hàng dọc/hàng ngang giữ đúng cự ly.\n- Nghe rõ dự lệnh, động lệnh; đi đều đúng nhịp 1-2, đánh tay tự nhiên vuông góc trước ngực và giữ thẳng hàng.`;
      practiceFocus = 'bước chân đúng nhịp 1 - 2 chân nọ tay kia và đứng lại chuẩn khẩu lệnh';
      break;

    case 'bung_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Bước rộng hơn vai nâng gậy lên cao, cúi gập thân sâu hạ gậy chạm mũi bàn chân, giữ thẳng hai gối và thở ra đều (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Bụng với gậy (SGK Lớp 5), kiểm tra cự ly 1,5m an toàn.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh cầm chắc hai đầu gậy, cúi gập thân thẳng gối.\n- Hô nhịp chậm cho lớp tập thử và sửa lỗi co gối cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1,5m an toàn.\n- Cầm chắc gậy, quan sát GV làm mẫu và tập chậm rãi, giữ thẳng hai gối khi hạ gậy chạm mũi chân.`;
      practiceFocus = 'hai chân giữ thẳng, cúi gập thân sâu và hạ gậy chạm mũi bàn chân';
      break;

    case 'van_minh_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Bước sang ngang đưa gậy ngang vai, xoay vặn thân trên sang hai bên giữ chắc hai bàn chân bám sàn, mắt nhìn theo gậy (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Vặn mình với gậy (SGK Lớp 5), nhắc giữ cự ly 1,5m an toàn.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh giữ bàn chân cố định và gậy thăng bằng ngang vai.\n- Hô nhịp chậm cho lớp tập thử và sửa lỗi xoay chân hoặc hạ gậy thấp.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1,5m.\n- Cầm chắc gậy, giữ cố định bàn chân và xoay vặn thân trên dứt khoát theo nhịp đếm của GV.`;
      practiceFocus = 'hai bàn chân bám chắc sàn, vặn thân mình và giữ gậy ngang vai';
      break;

    case 'toan_than_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Khuỵu gối đưa gậy ngang vai, gập thân thẳng chân hạ gậy chạm mũi chân, đứng lên kiễng gót chân sau nâng gậy chữ V (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Toàn thân với gậy (SGK Lớp 5), làm mẫu 2 - 3 lần theo chiều gương kết hợp tranh SGK.\n- Nhấn mạnh tư thế khuỵu gối thẳng lưng, gập thân thẳng gối và nâng gậy giữ thăng bằng tốt.\n- Hô nhịp chậm cho lớp tập thử và ghép liên hoàn.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1,5m.\n- Quan sát kỹ thuật mẫu và tập mô phỏng dứt khoát, giữ thăng bằng tốt với gậy.`;
      practiceFocus = 'khuỵu gối lưng thẳng, cúi gập thân chạm gậy và nâng gậy kiễng gót thăng bằng';
      break;

    case 'chan_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Kiễng gót thăng bằng đưa gậy ngang vai, hạ gót khuỵu gối sâu giữ thẳng lưng đồng thời nâng gậy qua đầu (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Chân với gậy (SGK Lớp 5), làm mẫu 2 - 3 lần kết hợp tranh SGK.\n- Nhấn mạnh giữ thăng bằng khi kiễng gót và lưng thẳng khi khuỵu gối nâng gậy qua đầu.\n- Hô nhịp chậm cho lớp tập thử và uốn nắn lỗi gù lưng.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1,5m.\n- Quan sát tư thế kiễng gót và khuỵu gối nâng gậy; tập mô phỏng theo nhịp đếm chậm.`;
      practiceFocus = 'kiễng gót thăng bằng, khuỵu gối lưng thẳng và nâng gậy qua đầu';
      break;

    case 'nhay_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Bật nhảy tách chân nâng gậy qua đầu và bật khép chân hạ gậy trước đùi, cầm chắc gậy, tiếp đất êm bằng mũi bàn chân (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu Động tác Nhảy với gậy (SGK Lớp 5), lưu ý an toàn cầm chắc gậy và giữ cự ly 1,5m.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK; nhấn mạnh tiếp đất nhẹ nhàng bằng nửa trước bàn chân.\n- Hô nhịp đếm đều cho lớp tập thử và chỉnh cách tiếp đất êm.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1,5m an toàn.\n- Cầm chắc hai đầu gậy, bật nhảy nhịp nhàng và tiếp đất nhẹ nhàng bằng mũi bàn chân.`;
      practiceFocus = 'bật nhảy nhịp nhàng, nâng gậy qua đầu và tiếp đất nhẹ nhàng bằng nửa trước bàn chân';
      break;

    case 'k2_vuon_tho':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang đưa hai tay lên cao chữ V hít sâu bằng mũi; hạ tay bắt chéo trước bụng cúi đầu nhẹ thở ra chậm (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Vươn thở (SGK Lớp 2), làm mẫu 2 - 3 lần kết hợp tranh SGK.\n- Hướng dẫn lớp tập chậm kết hợp hít sâu - thở chậm và sửa lỗi cúi đầu quá thấp.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1 sải tay.\n- Quan sát GV làm mẫu và tranh SGK Lớp 2; thực hiện vươn tay nhịp nhàng theo hơi thở.`;
      practiceFocus = 'vươn hai tay chữ V thẳng căng và hít thở nhịp nhàng';
      break;

    case 'k2_tay':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang đưa tay ra trước ngang vai, vỗ tay trên đỉnh đầu rồi hạ tay dang ngang lòng bàn tay sấp (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Tay (SGK Lớp 2), thị phạm chuẩn tư thế tay ngang vai và vỗ tay trên đỉnh đầu dứt khoát.\n- Quan sát chỉnh sửa lỗi chùng khuỷu tay hoặc gù lưng.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát tranh SGK Lớp 2 và tập dứt khoát theo nhịp đếm của GV.`;
      practiceFocus = 'duỗi thẳng cánh tay ngang vai và vỗ tay dứt khoát trên đầu';
      break;

    case 'k2_chan':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Kiễng gót chống hông, hạ gót khuỵu gối sâu giữ thẳng lưng đồng thời đưa hai tay ra trước ngang vai (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Chân (SGK Lớp 2), nhấn mạnh kiễng gót thăng bằng và khuỵu gối thẳng lưng.\n- Hô nhịp chậm cho lớp tập thử và uốn nắn tư thế lưng thẳng.`;
      hs = `- Đội hình 4 hàng ngang giãn cách an toàn.\n- Giữ thăng bằng tốt khi kiễng gót và khuỵu gối thẳng lưng theo nhịp hô GV.`;
      practiceFocus = 'kiễng gót thăng bằng và khuỵu gối sâu giữ thẳng lưng';
      break;

    case 'k2_luon':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang dang tay, nghiêng lườn thẳng sang hai bên (một tay chống hông, một tay vươn áp sát tai), hai chân thẳng (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Lườn (SGK Lớp 2), hướng dẫn nghiêng thẳng mặt phẳng bên và giữ hai chân thẳng.\n- Quan sát uốn nắn tay vươn sát tai cho từng em.`;
      hs = `- Đội hình 4 hàng ngang so le 1 sải tay.\n- Nghiêng lườn nhịp nhàng đều hai bên, giữ chân trụ thẳng vững.`;
      practiceFocus = 'nghiêng thẳng mặt phẳng bên và giữ chân trụ thẳng';
      break;

    case 'k2_bung':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước rộng hơn vai vỗ tay trên cao, cúi gập thân sâu thẳng hai gối hướng tay chạm mũi chân rồi đứng thẳng dang tay (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Bụng (SGK Lớp 2), nhắc HS giữ thẳng khớp gối khi cúi gập thân sâu.\n- Thị phạm và sửa lỗi co gối cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang giãn cách.\n- Cúi gập thân chậm rãi thở ra, giữ thẳng hai gối khi chạm tay xuống mũi chân.`;
      practiceFocus = 'giữ thẳng đầu gối và cúi gập thân sâu nhịp nhàng';
      break;

    case 'k2_toan_than':
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước chếch trước khuỵu gối vươn tay chữ V, thu chân cúi gập thân chạm mũi chân rồi đứng thẳng dang tay mở ngực (2x8 nhịp theo tranh SGK Lớp 2).`;
      gv = `- GV giới thiệu Động tác Toàn thân (SGK Lớp 2), làm mẫu khuỵu gối dồn trọng tâm chân trước và gập thân thẳng chân.\n- Hướng dẫn tập từng bước rồi ghép liên hoàn mượt mà.`;
      hs = `- Đội hình 4 hàng ngang so le.\n- Quan sát và phối hợp dứt khoát các tư thế khuỵu gối, gập thân và mở ngực.`;
      practiceFocus = 'dồn trọng tâm chân trước vững vàng và phối hợp nhịp nhàng toàn thân';
      break;

    case 'k2_nhay_dieu_hoa':
      steps = `- Kỹ thuật trọng tâm: Bật nhảy tách - khép chân vỗ tay trên đầu (tiếp đất êm bằng mũi chân); kết thúc bằng động tác Điều hòa bước chạm mũi, lắc cổ tay thả lỏng và hít thở sâu (2x8 nhịp).`;
      gv = `- GV hướng dẫn Động tác Nhảy và Điều hòa (SGK Lớp 2), lưu ý tiếp đất nhẹ bằng mũi chân khi nhảy và thả lỏng toàn thân khi điều hòa.`;
      hs = `- Bật nhảy êm nhẹ, sau đó chuyển sang thả lỏng lắc cổ tay hít sâu thở chậm.`;
      practiceFocus = 'tiếp đất êm bằng mũi chân khi nhảy và hít thở sâu thả lỏng khi điều hòa';
      break;

    case 'vuon_tho_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Bước sang ngang nâng vòng lên cao chếch trước hít sâu; hạ vòng trước bụng cúi đầu nhẹ thở ra chậm (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Vươn thở với vòng (SGK Lớp 4), kiểm tra độ chắc chắn của vòng và cự ly 1,5m.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK, nhắc phối hợp nâng hạ vòng đều theo nhịp thở.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách an toàn 1,5m.\n- Cầm chắc hai bên mép vòng, nâng hạ vòng nhịp nhàng theo nhịp hít vào - thở ra.`;
      practiceFocus = 'cầm chắc hai bên mép vòng, nâng vòng chếch cao và phối hợp nhịp thở sâu';
      break;

    case 'tay_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Bước sang ngang đưa vòng thẳng ra trước ngang vai, nâng thẳng lên cao qua đầu rồi hạ về ngang vai (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Tay với vòng (SGK Lớp 4), thị phạm giữ vòng thăng bằng thẳng tay.\n- Uốn nắn lỗi chùng khuỷu tay hoặc ngả lưng khi nâng vòng.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1,5m an toàn.\n- Thực hiện dứt khoát động tác đưa vòng thẳng tay ngang vai và qua đầu.`;
      practiceFocus = 'tay duỗi thẳng khi đưa vòng ra trước ngang vai và nâng thẳng qua đầu';
      break;

    case 'chan_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Kiễng gót đưa vòng ngang vai, hạ gót khuỵu gối sâu giữ thẳng lưng đồng thời nâng vòng qua đầu (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Chân với vòng (SGK Lớp 4), phân tích kiễng gót thăng bằng và khuỵu gối lưng thẳng.\n- Chỉnh sửa tư thế gù lưng hoặc lệch vòng cho từng học sinh.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1,5m.\n- Giữ thăng bằng trên nửa trước bàn chân và giữ thẳng thân trên khi khuỵu gối với vòng.`;
      practiceFocus = 'kiễng gót vững vàng, khuỵu gối thẳng lưng và nâng vòng thẳng trên đầu';
      break;

    case 'luon_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Bước sang ngang nâng vòng qua đầu, nghiêng lườn thẳng sang hai bên giữ vòng thẳng trục thân, hai chân thẳng (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Lườn với vòng (SGK Lớp 4), nhấn mạnh duỗi thẳng tay nâng vòng và nghiêng đúng mặt phẳng bên.\n- Uốn nắn lỗi gập người ra trước khi nghiêng.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1,5m.\n- Nghiêng lườn dẻo dai hai bên với vòng thể dục, hai chân trụ thẳng vững.`;
      practiceFocus = 'giữ thẳng tay cầm vòng trên cao và nghiêng thẳng mặt phẳng lườn hai bên';
      break;

    case 'bung_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Bước rộng hơn vai nâng vòng lên cao, cúi gập thân sâu thẳng hai gối đưa vòng chạm gần mũi chân (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Bụng với vòng (SGK Lớp 4), nhắc HS không co đầu gối và hạ vòng nhẹ nhàng.\n- Hô nhịp chậm kết hợp sửa sai từng em.`;
      hs = `- Đội hình 4 hàng ngang so le 1,5m.\n- Giữ thẳng hai đầu gối khi gập thân sâu hạ vòng chạm mũi chân, thở ra đều.`;
      practiceFocus = 'hai chân giữ thẳng và cúi gập thân sâu hạ vòng nhịp nhàng';
      break;

    case 'toan_than_vong':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai bên mép vòng trước đùi.\n- Kỹ thuật trọng tâm: Bước chếch trước khuỵu gối nâng vòng chếch cao, rút chân gập thân hạ vòng chạm mũi chân rồi đứng thẳng đưa vòng ngang vai (2x8 nhịp theo tranh SGK Lớp 4).`;
      gv = `- GV giới thiệu Động tác Toàn thân với vòng (SGK Lớp 4), làm mẫu phối hợp nhịp nhàng bước khuỵu gối và gập thân với vòng.\n- Hướng dẫn ghép liên hoàn bài tập với vòng.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1,5m.\n- Quan sát và thực hiện liên hoàn thuần thục với vòng thể dục.`;
      practiceFocus = 'khuỵu gối chân trước, thẳng chân sau và điều khiển vòng nhịp nhàng';
      break;

    case 'nhay_dieu_hoa_vong':
      steps = `- Kỹ thuật trọng tâm: Bật nhảy tách - khép chân nâng hạ vòng qua đầu (tiếp đất êm bằng mũi chân); kết thúc bằng Điều hòa bước chạm mũi, lắc thả lỏng và hít thở sâu với vòng (2x8 nhịp).`;
      gv = `- GV hướng dẫn Động tác Nhảy và Điều hòa với vòng (SGK Lớp 4), nhấn mạnh cầm chắc vòng khi bật nhảy tiếp đất êm và thả lỏng phục hồi.`;
      hs = `- Bật nhảy tách - khép chân nhịp nhàng với vòng, tiếp đất bằng mũi chân và hít thở sâu thả lỏng điều hòa.`;
      practiceFocus = 'tiếp đất êm bằng mũi chân khi nhảy và thả lỏng điều hòa nhịp thở với vòng';
      break;

    case 'dieu_hoa_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Kỹ thuật trọng tâm: Bước sang ngang nâng gậy lên cao chữ V hít sâu bằng mũi; hạ gậy nhẹ nhàng trước đùi thả lỏng toàn thân, thở ra chậm (2x8 nhịp theo tranh SGK Lớp 5).`;
      gv = `- GV giới thiệu Động tác Điều hòa với gậy (SGK Lớp 5), nhấn mạnh tác dụng thả lỏng phục hồi cơ bắp và hô hấp.\n- Làm mẫu 2 - 3 lần kết hợp tranh SGK, hô nhịp chậm rãi cho cả lớp thư giãn và nhận xét tiến bộ.`;
      hs = `- Đội hình 4 hàng ngang giãn cách thoải mái.\n- Nâng hạ gậy uyển chuyển theo nhịp hô êm dịu, phối hợp hít sâu bằng mũi và thở ra chậm bằng miệng.`;
      practiceFocus = 'nâng hạ gậy nhịp nhàng theo hơi thở sâu và thả lỏng toàn thân';
      break;

    default:
      // Mặc định Vươn thở
      steps = `- TTCB: Đứng nghiêm.\n- Kỹ thuật trọng tâm: Bước sang ngang đưa hai tay vươn cao chếch chữ V hít sâu bằng mũi; hạ tay bắt chéo trước bụng thở ra chậm (2x8 nhịp theo tranh SGK).`;
      gv = `- GV giới thiệu ${cleanName}, nêu rõ tác dụng rèn luyện tư thế và thể lực.\n- Làm mẫu 2 - 3 lần theo chiều gương kết hợp đối chiếu tranh SGK; hô nhịp chậm cho lớp tập thử và uốn nắn sửa sai tại chỗ.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát GV làm mẫu và tranh SGK; tập mô phỏng nhịp nhàng theo nhịp đếm, phối hợp tốt hơi thở và biên độ động tác.`;
      practiceFocus = 'vươn căng hai tay chếch chữ V và phối hợp nhịp thở sâu';
      break;
  }

  return {
    key,
    name: cleanName,
    imgUrl: resolvedImgUrl,
    imgTitle: resolvedImgTitle,
    steps,
    gv,
    hs,
    practiceFocus
  };
}

/**
 * Resolves accurate movement name, technical image, and pedagogical steps from text/title.
 * Strictly guarantees that games (Trò chơi) are NEVER attached to technical movements (Học động tác).
 * Strictly enforces GDPT 2018 pedagogical rule:
 * - If a lesson has 2 new movements:
 *   + Tiết 1: Học động tác 1.
 *   + Tiết 2: Học động tác 2 + Ôn động tác 1.
 * - If a lesson has 3 new movements across 2 periods:
 *   + Period 1 (Tiết 1): Học 2 động tác đầu (m1, m2).
 *   + Period 2 (Tiết 2): Học động tác thứ 3 (m3) + Ôn 2 động tác của Tiết 1 (m1, m2).
 * - If a lesson has 4 new movements:
 *   + Period 1: Học 2 động tác đầu (m1, m2).
 *   + Period 2: Học 2 động tác sau (m3, m4) + Ôn 2 động tác của Tiết 1 (m1, m2).
 * - If a lesson has 5 new movements:
 *   + Period 1: Học 3 động tác đầu (m1, m2, m3).
 *   + Period 2: Học 2 động tác sau (m4, m5) + Ôn 3 động tác của Tiết 1 (m1, m2, m3).
 */
export function resolveAccurateMovement(
  content: string = '',
  title: string = '',
  grade: number = 1,
  userImages: SgkImageItem[] = [],
  topic: string = ''
): AccurateMovementDetails {
  const targetLesson = title ? findSgkLessonByTopicOrTitle(grade, title, topic) : undefined;
  const lessonDomain = detectLessonContextDomain(title, topic, targetLesson);
  const isBtdLesson = isCalisthenicsMovementLesson(title, topic, targetLesson);
  const contentLower = (content || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  // 0. Detect Exact Period Number (Tiết) without substring conflicts
  const isPeriod22 = titleLower.includes('tiết 22') || titleLower.includes('tiet 22') || contentLower.includes('tiết 22');
  const isPeriod21 = titleLower.includes('tiết 21') || titleLower.includes('tiet 21') || contentLower.includes('tiết 21');
  const isPeriod20 = titleLower.includes('tiết 20') || titleLower.includes('tiet 20') || contentLower.includes('tiết 20');
  const isPeriod19 = titleLower.includes('tiết 19') || titleLower.includes('tiet 19') || contentLower.includes('tiết 19');
  const isPeriod18 = titleLower.includes('tiết 18') || titleLower.includes('tiet 18') || contentLower.includes('tiết 18');
  const isPeriod17 = titleLower.includes('tiết 17') || titleLower.includes('tiet 17') || contentLower.includes('tiết 17');
  const isPeriod16 = titleLower.includes('tiết 16') || titleLower.includes('tiet 16') || contentLower.includes('tiết 16');
  const isPeriod15 = titleLower.includes('tiết 15') || titleLower.includes('tiet 15') || contentLower.includes('tiết 15');

  // Generic Tiết 2 vs Tiết 1
  const isPeriod2 =
    (titleLower.includes('tiết 2') ||
      titleLower.includes('tiet 2') ||
      titleLower.includes('(tiết 2)') ||
      titleLower.includes('- tiết 2') ||
      isPeriod16 ||
      isPeriod18 ||
      isPeriod20 ||
      isPeriod22) &&
    !isPeriod21 &&
    !isPeriod19 &&
    !isPeriod17 &&
    !isPeriod15 &&
    !titleLower.includes('tiết 21') &&
    !titleLower.includes('tiết 23');

  // 0b. Assessment / Evaluation Weeks (Week 17-18 HK I & Week 33-35 Cuối năm) — NEVER fall back to Bài thể dục / Vươn thở!
  const isAssessmentTopic =
    /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(titleLower);
  if (isAssessmentTopic) {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim() || 'Kiểm tra, đánh giá thể lực và năng lực thể chất';
    const isHki = /học kỳ\s*i|hk\s*i|học kì\s*i/i.test(titleLower);
    const stations =
      grade === 1
        ? isHki
          ? 'đứng nghiêm/nghỉ, quay các hướng, phối hợp các động tác đã học và trò chơi vận động'
          : 'chạy 30m tốc độ cao, bật xa tại chỗ và ngồi gập thân đo độ dẻo'
        : grade === 2
        ? isHki
          ? 'biến đổi đội hình hàng dọc, các động tác bài thể dục và trò chơi vận động HK I'
          : 'chạy 30m tốc độ, bật xa tại chỗ và giữ thăng bằng trên vạch kẻ thẳng'
        : grade === 3
        ? isHki
          ? 'đi đều - đứng lại, đội hình hàng ngang và các bài tập vận động cơ bản HK I'
          : 'chạy 30m, bật xa tại chỗ và phối hợp tung - bắt bóng đo năng lực vận động'
        : grade === 4
        ? isHki
          ? 'đi đều chuyển sang chạy, liên hoàn 8 động tác với vòng thể dục và trò chơi HK I'
          : 'chạy 50m, bật xa tại chỗ, nhảy dây chụm hai chân và chỉ số RLTT Lớp 4'
        : isHki
        ? 'biến đổi đội hình, phối hợp động tác với gậy và kỹ năng vận động HK I'
        : 'chạy cự ly ngắn 50m, bật xa tại chỗ và các chỉ số Tiêu chuẩn rèn luyện thân thể (RLTT) cuối cấp Tiểu học';

    const assessmentImg =
      userImages.find((img) => {
        if (!img.imgUrl || isSvgImageUrl(img.imgUrl) || String(img.grade) !== String(grade)) return false;
        if (hasConflictingGradeTag(img.imgUrl, grade) || hasConflictingGradeTag(img.title, grade)) return false;
        const eff = getImageEffectiveSubFolder(img);
        return eff === 'luyenTap' || eff === 'vanDung';
      }) || null;

    const imgUrl = assessmentImg?.imgUrl || '';
    const imgTitle = assessmentImg?.title || '';

    const periodLabel = isPeriod2 ? 'Tiết 2 (Đánh giá bổ sung & tổng hợp)' : 'Tiết 1 (Kiểm tra chính thức theo tổ)';
    const steps =
      `* Nội dung kiểm tra (${periodLabel}):\n` +
      `- Thực hành đánh giá các chỉ tiêu: ${stations}.\n` +
      `- Quy chuẩn đánh giá (Thông tư 27/BGDĐT): Học sinh hoàn thành đúng kỹ thuật, đạt chỉ số thể lực tối thiểu theo lứa tuổi được xếp mức Hoàn thành (HT) hoặc Hoàn thành tốt (HTT).\n` +
      `- Học sinh có thể lực hạn chế hoặc nghỉ ốm được kiểm tra lại nhẹ nhàng ở lượt sau.`;

    const gv =
      `- GV phổ biến rõ ràng tiêu chuẩn, cách thức chấm điểm và quy trình di chuyển qua từng nội dung kiểm tra: ${stations}.\n` +
      `- Làm mẫu lại một lượt động tác chuẩn và phạm quy cần tránh (dẫm vạch xuất phát, chạm tay ra sau khi bật xa...) để học sinh nắm vững trước khi thi.\n` +
      `- Gọi lần lượt từng nhóm 4 - 5 học sinh vào khu vực kiểm tra; ghi chép kết quả trung thực, khách quan vào bảng theo dõi lớp.\n` +
      `- Động viên tinh thần, nhắc các em bình tĩnh, hít thở sâu và đảm bảo an toàn tuyệt đối trong suốt quá trình kiểm tra.`;

    const hs =
      `- Đội hình chờ kiểm tra: 4 hàng ngang ngồi/đứng trật tự bên ngoài khu vực thi, quan sát bạn thực hiện và cổ vũ văn minh.\n` +
      `- Khi nghe GV gọi tên, khẩn trương bước vào vạch xuất phát thực hiện hết sức mình các nội dung: ${stations}.\n` +
      `- Lắng nghe GV công bố nhận xét từng lượt; các bạn chưa đạt chủ động tập bổ trợ chuẩn bị kiểm tra lại.`;

    return {
      movementName: normalizeAllCapsForSentenceBody(cleanTitle),
      imgUrl,
      imgTitle,
      movementSteps: steps,
      gvExplanation: gv,
      hsTask: hs,
      practiceFocus: `tư thế xuất phát đúng luật, nỗ lực tối đa và giữ an toàn khi thực hiện ${stations}`,
      newMovements: [cleanTitle],
      reviewMovements: [],
      allImages: imgUrl ? [{ id: 'img_assess_1', url: imgUrl, title: imgTitle }] : []
    };
  }

  // 1. Multi-movement partition — STRICTLY limited to Bài thể dục (Chủ đề 2) lessons!
  //    Never split non-exercise titles like "Vận động của đầu, cổ" or "Tung - bắt bóng bằng hai tay" into Bài thể dục movements.
  const extracted = isBtdLesson ? extractMovementNamesFromTitle(title) : [];

  if (isBtdLesson && extracted.length >= 2) {
    const partition = partitionLessonMovements(extracted, isPeriod2);
    const { newMovements, reviewMovements } = partition;

    // CASE A: Tiết 2 with Review of Period 1 movements — PRIORITIZE new movement, keep review concise, NEVER stack review images!
    if (isPeriod2 && reviewMovements.length > 0) {
      const newProfiles = newMovements.map((m) => getSingleMovementProfile(m, grade, userImages, targetLesson));
      const revProfiles = reviewMovements.map((m) => getSingleMovementProfile(m, grade, userImages, targetLesson));

      const newNamesStr = newMovements.join(' và ');
      const revNamesStr = reviewMovements.join(' và ');

      // Prioritize new movement first, keep review & chaining concise (no beat-by-beat wall!)
      let steps = '';
      if (newProfiles.length > 0) {
        for (const n of newProfiles) {
          steps += `* Học ${n.name} (Động tác mới - SGK GDTC Lớp ${grade}):\n${n.steps}\n`;
        }
        steps += `* Ôn tập nhanh & ghép liên hoàn (${revNamesStr}):\n- Ôn nhanh ${revNamesStr} (1 lần), sau đó ghép liên hoàn: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')} (2x8 nhịp).`;
      } else {
        steps = `* Ôn tập & hoàn thiện (${revNamesStr}):\n- Thực hiện liên hoàn ${revProfiles.map((r) => r.name).join(' -> ')} (2 lần x 8 nhịp), chú ý biên độ và nhịp thở đều.`;
      }

      // Teacher instructions
      const gv =
        (newProfiles.length > 0
          ? `- GV giới thiệu trọng tâm động tác mới Tiết 2: ${newNamesStr} (SGK GDTC Lớp ${grade}), làm mẫu 2 - 3 lần kết hợp cho HS quan sát tranh kỹ thuật SGK.\n- Hô nhịp chậm điều khiển lớp tập thử động tác mới; trực tiếp di chuyển uốn nắn sửa sai tư thế và nhắc giữ nhịp thở đều.\n- Tổ chức cho lớp ôn nhanh động tác Tiết 1 (${revNamesStr}) và ghép liên hoàn chuỗi: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')}; biểu dương tinh thần tập luyện tích cực.`
          : `- GV điều khiển lớp ôn tập liên hoàn các động tác đã học (${revNamesStr}), uốn nắn độ thẳng đẹp và tổ chức thi đua giữa các tổ.`);

      // Student tasks
      const hs =
        `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n` +
        (newProfiles.length > 0
          ? `- Chăm chú quan sát động tác mẫu của GV ở động tác mới (${newNamesStr}) và tập mô phỏng theo nhịp hô chậm.\n- Ôn nhanh ${revNamesStr} và ghép liên hoàn cả bài: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')}.`
          : `- Toàn lớp ôn tập liên hoàn các động tác (${revNamesStr}) nhịp nhàng theo nhịp đếm và nhận xét tổ bạn.`);

      const practiceFocus =
        newProfiles.length > 0
          ? `${newProfiles.map((n) => n.practiceFocus).join('; ')} kết hợp ghép liên hoàn với ${revNamesStr}`
          : `ôn luyện liên hoàn dứt khoát các động tác ${revNamesStr}`;

      // Strictly attach ONLY new movement image(s) when teaching a new movement — never stack or substitute review images!
      const primaryImg = newProfiles.length > 0 ? newProfiles[0] : revProfiles[0];
      const allImages = (
        newProfiles.length > 0
          ? newProfiles.map((n, i) => ({ id: `img_new_${i}`, url: n.imgUrl, title: n.imgTitle }))
          : revProfiles.slice(0, 1).map((r, i) => ({ id: `img_rev_${i}`, url: r.imgUrl, title: r.imgTitle }))
      ).filter((item) => Boolean(item.url));

      return {
        movementName: partition.displayMovementName,
        imgUrl: primaryImg?.imgUrl || '',
        imgTitle: primaryImg?.imgTitle || '',
        movementSteps: steps.trim(),
        gvExplanation: gv,
        hsTask: hs,
        practiceFocus,
        newMovements,
        reviewMovements,
        allImages
      };
    }

    // CASE B: Tiết 1 with multiple new movements (e.g. 2 movements in N=3, 2 movements in N=4, 3 movements in N=5)
    if (!isPeriod2 && newMovements.length > 1) {
      const newProfiles = newMovements.map((m) => getSingleMovementProfile(m, grade, userImages, targetLesson));
      const newNamesStr = newMovements.join(' và ');

      let steps = '';
      for (const n of newProfiles) {
        steps += `* Học ${n.name} (SGK GDTC Lớp ${grade}):\n${n.steps}\n\n`;
      }
      steps += `* Phối hợp liên hoàn:\n- Thực hiện liên tục: ${newProfiles.map((n) => n.name).join(' -> ')} (2 - 3 lần, mỗi lần 2x8 nhịp).`;

      const gv = `- GV giới thiệu các động tác mới trong Tiết 1: ${newNamesStr} (SGK GDTC Lớp ${grade}); phân tích tác dụng nâng cao thể lực và rèn luyện tư thế chuẩn mực.\n` +
        `- Thị phạm làm mẫu chuẩn xác từng động tác 2 - 3 lần theo phương pháp chiều gương: phân tích kỹ các điểm mấu chốt kỹ thuật và nhịp hô dứt khoát.\n` +
        `- Hướng dẫn học sinh đối chiếu tranh ảnh kỹ thuật SGK; hô nhịp chậm cho học sinh tập mô phỏng lần lượt từng động tác rồi phối hợp liên hoàn cả 2 động tác.\n` +
        `- Trực tiếp di chuyển giữa các hàng ngang uốn nắn sửa sai tư thế cho từng học sinh; nhắc nhở học sinh giữ cự ly an toàn.\n` +
        `- Động viên, khích lệ cả lớp thực hiện đều, đẹp và đúng biên độ.`;

      const hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n` +
        `- Chăm chú quan sát động tác làm mẫu của GV và hình ảnh kỹ thuật SGK; ghi nhớ khẩu lệnh và thứ tự từng nhịp.\n` +
        `- Lần lượt tập mô phỏng từng nhịp các động tác mới theo khẩu lệnh của giáo viên; phối hợp nhịp nhàng giữa hơi thở và động tác.\n` +
        `- Tích cực thực hiện liên hoàn chuỗi các động tác theo nhịp đếm dứt khoát.`;

      const practiceFocus = newProfiles.map((n) => n.practiceFocus).join(' và ');
      const primaryImg = newProfiles[0];
      const allImages = newProfiles
        .map((n, i) => ({ id: `img_new_${i}`, url: n.imgUrl, title: n.imgTitle }))
        .filter((item) => Boolean(item.url));

      return {
        movementName: partition.displayMovementName,
        imgUrl: primaryImg.imgUrl,
        imgTitle: primaryImg.imgTitle,
        movementSteps: steps,
        gvExplanation: gv,
        hsTask: hs,
        practiceFocus,
        newMovements,
        reviewMovements: [],
        allImages
      };
    }

    // CASE C: Exactly 1 new movement in Tiết 1 (e.g. N=2)
    if (newMovements.length === 1) {
      const single = getSingleMovementProfile(newMovements[0], grade, userImages, targetLesson);
      return {
        movementName: partition.displayMovementName,
        imgUrl: single.imgUrl,
        imgTitle: single.imgTitle,
        movementSteps: single.steps,
        gvExplanation: single.gv,
        hsTask: single.hs,
        practiceFocus: single.practiceFocus,
        newMovements,
        reviewMovements: [],
        allImages: single.imgUrl ? [{ id: 'img_single', url: single.imgUrl, title: single.imgTitle }] : []
      };
    }
  }

  // 2. Single movement detection — STRICTLY gated to Bài thể dục (Chủ đề 2) + explicit Đi đều (ĐHĐN)!
  //    NEVER hijack "Phối hợp di chuyển", "Vận động của đầu, cổ", "Vận động của tay", "Vận động của chân",
  //    "Vận động phối hợp của cơ thể", or "Bài tập phối hợp đội hình" into Bài thể dục!
  let targetName = '';
  if (isBtdLesson && !isNonCalisthenicsCoordinationText(titleLower)) {
    if (titleLower.includes('phối hợp')) {
      targetName = 'Động tác Phối hợp';
    } else if (titleLower.includes('điều hòa') || titleLower.includes('điều hoà')) {
      targetName = grade === 4 ? 'Động tác Điều hòa với vòng thể dục' : 'Động tác Điều hòa';
    } else if (titleLower.includes('chân')) {
      targetName = grade === 5 ? 'Động tác Chân với gậy' : grade === 4 ? 'Động tác Chân với vòng thể dục' : 'Động tác Chân';
    } else if (titleLower.includes('lườn')) {
      targetName = grade === 4 ? 'Động tác Lườn với vòng thể dục' : 'Động tác Lườn';
    } else if (titleLower.includes('bụng')) {
      targetName = grade === 5 ? 'Động tác Bụng với gậy' : grade === 4 ? 'Động tác Bụng với vòng thể dục' : 'Động tác Bụng';
    } else if (titleLower.includes('vặn mình')) {
      targetName = grade === 5 ? 'Động tác Vặn mình với gậy' : 'Động tác Vặn mình';
    } else if (titleLower.includes('toàn thân')) {
      targetName = grade === 5 ? 'Động tác Toàn thân với gậy' : grade === 4 ? 'Động tác Toàn thân với vòng thể dục' : 'Động tác Toàn thân';
    } else if (titleLower.includes('tay')) {
      targetName = grade === 5 ? 'Động tác Tay với gậy' : grade === 4 ? 'Động tác Tay với vòng thể dục' : 'Động tác Tay';
    } else if (titleLower.includes('vươn thở')) {
      targetName = grade === 5 ? 'Động tác Vươn thở với gậy' : grade === 4 ? 'Động tác Vươn thở với vòng thể dục' : 'Động tác Vươn thở';
    } else if (titleLower.includes('nhảy')) {
      targetName = grade === 5 ? 'Động tác Nhảy với gậy' : grade === 4 ? 'Động tác Nhảy với vòng thể dục' : 'Động tác Nhảy';
    }
  } else if (
    lessonDomain === 'dhdn' &&
    titleLower.includes('đi đều') &&
    !titleLower.includes('vòng các hướng') &&
    !titleLower.includes('phối hợp đi đều')
  ) {
    targetName = isPeriod2 ? 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp' : 'Động tác Đi đều, Đứng lại';
  }

  if (targetName) {
    const profile = getSingleMovementProfile(targetName, grade, userImages, targetLesson);
    return {
      movementName: profile.name,
      imgUrl: profile.imgUrl,
      imgTitle: profile.imgTitle,
      movementSteps: profile.steps,
      gvExplanation: profile.gv,
      hsTask: profile.hs,
      practiceFocus: profile.practiceFocus,
      newMovements: [profile.name],
      reviewMovements: [],
      allImages: profile.imgUrl ? [{ id: 'img_single', url: profile.imgUrl, title: profile.imgTitle }] : []
    };
  }

  // 3. Authentic SGK Domain Profile (ĐHĐN / Tư thế VĐ cơ bản / Thể thao tự chọn / Ôn tập BTD)
  //    Strictly grounded in SGK textbook tree + contextual compound-keyword matching (NEVER hijacked by Bài thể dục!)
  const rawCleanSkillTitle =
    title.replace(/\s*\([^)]*\)/g, '').replace(/^bài\s*\d+\s*[:\-]?\s*/i, '').trim() || 'Kỹ năng vận động bài học';
  const cleanSkillTitle = normalizeAllCapsForSentenceBody(rawCleanSkillTitle);
  const sgkTechItems = targetLesson?.subFolders?.kyThuat?.items || [];
  const selectedLibraryImgs = matchTechnicalImagesByContext(
    grade,
    title,
    topic,
    content,
    targetLesson,
    userImages,
    isPeriod2,
    {
      isSvgImageUrl,
      isGameImage,
      hasConflictingGradeTag,
      getImageEffectiveSubFolder
    }
  );

  // Select authentic SGK items for this period (max 2 items per period to keep layout concise and faithful to SGK)
  const activeSgkItems =
    sgkTechItems.length > 1
      ? isPeriod2
        ? sgkTechItems.slice(Math.ceil(sgkTechItems.length / 2))
        : sgkTechItems.slice(0, Math.ceil(sgkTechItems.length / 2))
      : sgkTechItems;

  const primaryLibImg = selectedLibraryImgs[0];
  const resolvedUrl = primaryLibImg?.imgUrl || '';
  const resolvedTitle = primaryLibImg?.title || activeSgkItems[0]?.name || cleanSkillTitle;

  let domainSteps = '';
  if (activeSgkItems.length > 0) {
    domainSteps = activeSgkItems
      .map(
        (item) =>
          `* Học ${item.name} (SGK GDTC Lớp ${grade}):\n- ${item.desc}`
      )
      .join('\n');
    if (isPeriod2 && sgkTechItems.length > activeSgkItems.length) {
      const prevNames = sgkTechItems
        .slice(0, Math.ceil(sgkTechItems.length / 2))
        .map((it) => it.name)
        .join(', ');
      domainSteps += `\n* Ôn tập nhanh & phối hợp (${prevNames}):\n- Ôn nhanh nội dung Tiết 1 và phối hợp liên hoàn theo đúng yêu cầu SGK.`;
    }
  } else {
    domainSteps = `* Học ${cleanSkillTitle} (SGK GDTC Lớp ${grade}):\n- Thực hiện đúng tư thế chuẩn bị, kỹ thuật động tác và cự ly an toàn theo tranh minh họa SGK.`;
  }

  const domainGv =
    `- GV giới thiệu mục tiêu và yêu cầu kỹ thuật của nội dung "${cleanSkillTitle}" (SGK GDTC Lớp ${grade}).\n` +
    `- Làm mẫu chuẩn xác 2 - 3 lần từ chậm đến nhanh kết hợp cho HS quan sát tranh minh họa SGK; phân tích những điểm cốt lõi và lỗi sai thường gặp.\n` +
    `- Hô nhịp chậm cho học sinh tập thử theo đúng trình tự SGK và trực tiếp sửa sai tư thế cho từng em.`;

  const domainHs =
    `- Đội hình quan sát: 4 hàng ngang đứng so le giữ cự ly an toàn.\n` +
    `- Chăm chú quan sát GV thị phạm và tranh ảnh SGK; thực hiện mô phỏng chậm theo hướng dẫn.\n` +
    `- Chủ động phối hợp nhịp nhàng, giữ an toàn cho bản thân và bạn cùng tập.`;

  const domainAttachments = (selectedLibraryImgs.length > 0 ? selectedLibraryImgs : primaryLibImg ? [primaryLibImg] : []).map(
    (img, idx) => ({
      id: `img_domain_${idx + 1}`,
      url: img.imgUrl,
      title: img.title || resolvedTitle
    })
  );

  return {
    movementName: cleanSkillTitle,
    imgUrl: resolvedUrl,
    imgTitle: resolvedTitle,
    movementSteps: domainSteps,
    gvExplanation: domainGv,
    hsTask: domainHs,
    practiceFocus: `tư thế chuẩn xác và thực hiện đúng kỹ thuật ${cleanSkillTitle.toLowerCase()} theo SGK`,
    newMovements: activeSgkItems.length > 0 ? activeSgkItems.map((it) => it.name) : [cleanSkillTitle],
    reviewMovements: [],
    allImages: domainAttachments
  };
}

const GAME_STOP_WORDS = new Set([
  'tro',
  'choi',
  'van',
  'dong',
  'khoi',
  'bo',
  'cua',
  'voi',
  'trong',
  'sach',
  'sgk',
  'hinh',
  'anh',
  'minh',
  'hoa',
  'lop',
  'khoi',
  'trang',
  'tiet',
  'bai',
  'va',
  'cho',
  'the',
  'duc',
  'gdtc',
  'kntt',
  '3d',
  'nen',
  'suot'
]);

function stripVietnameseDiacritics(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Extracts a clean, canonical game title from either a lesson row, tree item, or image title.
 */
export function normalizeGameNameForMatch(raw: string = ''): string {
  let s = (raw || '').trim();
  if (!s) return '';

  // Prefer quoted game name if present (e.g. Trò chơi bổ trợ khởi động: "Làm theo hiệu lệnh")
  const quoted = s.match(/["“]([^"”]{2,80})["”]/);
  if (quoted && quoted[1]?.trim()) {
    s = quoted[1].trim();
  }

  s = s
    .replace(/^\[3D\]\s*/i, '')
    .replace(/^\*?\s*(?:1\.3\.|3\.4\.|3\.5\.|2\.|5\.)?\s*/i, '')
    .replace(/^trò\s*chơi(?:\s+bổ\s*trợ\s*khởi\s*động|\s+khởi\s*động|\s+vận\s*động|\s+sgk[^:]*?)?\s*[:\-–]?\s*/i, '')
    .replace(/^tc\s*(?:khởi\s*động|vận\s*động)\s*[:\-–]?\s*/i, '')
    .replace(/\s*[-–]\s*(?:sgk|khối|lớp|gdtc).*$/i, '')
    .replace(/\s*\((?:trang|tr\.?|p\.?|nền\s+trong\s+suốt|sgk)[^)]*\)/gi, '')
    .replace(/^["“'‘]+|["”'’.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

/**
 * Extracts the specific game title mentioned in a lesson plan row's Column 1 content.
 */
export function extractGameNameFromRowText(rowContent: string = ''): string {
  if (!rowContent) return '';
  const lines = rowContent.split('\n');

  // 1. Prioritize lines explicitly mentioning "trò chơi"
  for (const line of lines) {
    if (!/trò\s*chơi/i.test(line)) continue;
    const quoted = line.match(/trò\s*chơi[^:\n"“]*[:\-–]?\s*["“]([^"”]{2,80})["”]/i);
    if (quoted && quoted[1]?.trim()) {
      return normalizeGameNameForMatch(quoted[1]);
    }
    const afterColon = line.match(/trò\s*chơi[^:\n]*:\s*([^\n.]+)/i);
    if (afterColon && afterColon[1]?.trim()) {
      const cleaned = normalizeGameNameForMatch(afterColon[1]);
      if (cleaned.length >= 3) return cleaned;
    }
  }

  // 2. Fallback: any quoted phrase in a game-related block
  if (/trò\s*chơi/i.test(rowContent)) {
    const anyQuoted = rowContent.match(/["“]([^"”]{3,80})["”]/);
    if (anyQuoted && anyQuoted[1]?.trim()) {
      return normalizeGameNameForMatch(anyQuoted[1]);
    }
  }

  return '';
}

function getGameKeyTokens(raw: string): string[] {
  const canonical = normalizeGameNameForMatch(raw);
  const ascii = stripVietnameseDiacritics(canonical)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!ascii) return [];
  return ascii.split(' ').filter((w) => w.length >= 2 && !GAME_STOP_WORDS.has(w));
}

/**
 * Determines whether two game titles (or an image title and a game name) refer to the same PE game.
 */
export function doGameNamesMatch(nameA: string = '', nameB: string = ''): boolean {
  const canonA = normalizeGameNameForMatch(nameA);
  const canonB = normalizeGameNameForMatch(nameB);
  if (!canonA || !canonB) return false;

  const asciiA = stripVietnameseDiacritics(canonA).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const asciiB = stripVietnameseDiacritics(canonB).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!asciiA || !asciiB) return false;

  // 1. Exact canonical match (accent-insensitive)
  if (asciiA === asciiB && asciiA.length >= 3) return true;

  // 2. Clean substring containment when shorter name is specific enough (>= 2 words or >= 6 chars)
  const shorter = asciiA.length <= asciiB.length ? asciiA : asciiB;
  const longer = asciiA.length <= asciiB.length ? asciiB : asciiA;
  const shorterTokens = getGameKeyTokens(shorter);
  const longerTokens = getGameKeyTokens(longer);

  if (shorter.length >= 5 && shorterTokens.length >= 2 && longer.includes(shorter)) {
    return true;
  }

  // 3. High-precision token overlap (handles small variations like "chuyền" vs "chuyển", "khoẻ" vs "khỏe")
  if (shorterTokens.length >= 2 && longerTokens.length >= 2) {
    const longerSet = new Set(longerTokens);
    let hits = 0;
    for (const tok of shorterTokens) {
      if (longerSet.has(tok)) hits++;
    }
    const ratio = hits / shorterTokens.length;
    const unionSize = new Set([...shorterTokens, ...longerTokens]).size;
    if (ratio >= 0.85 && hits >= 2 && hits / unionSize >= 0.65) {
      return true;
    }
  }

  return false;
}

export interface CrossGradeGameMatchTarget {
  planId: string;
  grade: number;
  lessonNum: number;
  week: number;
  title: string;
  rowIndex: number;
  rowGameName: string;
  slotType: 'tro_choi_kd' | 'tro_choi_vd';
  targetCol: 'content' | 'hs';
  alreadyHasImage: boolean;
}

function detectGameRowSlotType(row: LessonRow, rowIndex: number): 'tro_choi_kd' | 'tro_choi_vd' | null {
  const cLower = (row.content || '').toLowerCase();
  if (
    cLower.includes('1.3.') ||
    cLower.includes('trò chơi bổ trợ khởi động') ||
    cLower.includes('trò chơi khởi động') ||
    (rowIndex === 0 && cLower.includes('trò chơi'))
  ) {
    return 'tro_choi_kd';
  }
  if (
    cLower.includes('3.5.') ||
    (cLower.includes('3.4.') && cLower.includes('trò chơi')) ||
    cLower.includes('trò chơi vận động') ||
    (rowIndex >= 2 && cLower.includes('trò chơi'))
  ) {
    return 'tro_choi_vd';
  }
  return null;
}

/**
 * Scans multiple lesson plans (across all grades) to find every game row whose game name matches `gameName`.
 */
export function findMatchingGameSlotsAcrossPlans(
  plans: MasterPlanItem[],
  gameName: string,
  slotHint: 'tro_choi_kd' | 'tro_choi_vd' | 'any' = 'any'
): CrossGradeGameMatchTarget[] {
  const canonicalQuery = normalizeGameNameForMatch(gameName);
  if (!canonicalQuery || canonicalQuery.length < 3) return [];

  const matches: CrossGradeGameMatchTarget[] = [];

  for (const plan of plans) {
    if (!plan || !Array.isArray(plan.rows)) continue;
    plan.rows.forEach((row, rowIndex) => {
      const slotType = detectGameRowSlotType(row, rowIndex);
      if (!slotType) return;
      if (slotHint !== 'any' && slotType !== slotHint) {
        // Still allow matching across warmup/practice slots if the game title is an exact match
        const rowGame = extractGameNameFromRowText(row.content);
        if (!rowGame || !doGameNamesMatch(rowGame, canonicalQuery)) return;
      }

      const rowGame = extractGameNameFromRowText(row.content);
      if (!rowGame) return;
      if (!doGameNamesMatch(rowGame, canonicalQuery)) return;

      // Determine standard column: in 11-row / 7-row templates, games are attached to Column 1 (content) or Column 4 (hs)
      const hasContentImgs = Boolean(
        (row.contentImages && row.contentImages.length > 0) || row.contentImgUrl
      );
      const hasHsImgs = Boolean((row.hsImages && row.hsImages.length > 0) || row.hsImgUrl);
      const targetCol: 'content' | 'hs' =
        row.content.toLowerCase().includes('1.3.') || row.content.toLowerCase().includes('3.5.')
          ? 'content'
          : 'hs';

      matches.push({
        planId: plan.id,
        grade: plan.grade,
        lessonNum: plan.lessonNum,
        week: plan.week,
        title: plan.title,
        rowIndex,
        rowGameName: rowGame,
        slotType,
        targetCol,
        alreadyHasImage: targetCol === 'content' ? hasContentImgs : hasHsImgs
      });
    });
  }

  return matches;
}

/**
 * Inserts/updates a game image across every lesson plan row (across all grades) that uses the same game name.
 */
export function applyGameImageToMatchingPlans(
  plans: MasterPlanItem[],
  imgUrl: string,
  imgTitle: string,
  gameName: string,
  options?: {
    slotHint?: 'tro_choi_kd' | 'tro_choi_vd' | 'any';
    preferredCol?: 'content' | 'hs';
    excludePlanRow?: { planId: string; rowIndex: number };
    replaceExistingGameImage?: boolean;
  }
): { updatedPlans: MasterPlanItem[]; matchedTargets: CrossGradeGameMatchTarget[] } {
  const matchedTargets = findMatchingGameSlotsAcrossPlans(
    plans,
    gameName,
    options?.slotHint || 'any'
  ).filter(
    (t) =>
      !(
        options?.excludePlanRow &&
        t.planId === options.excludePlanRow.planId &&
        t.rowIndex === options.excludePlanRow.rowIndex
      )
  );

  if (matchedTargets.length === 0) {
    return { updatedPlans: plans, matchedTargets: [] };
  }

  const targetByKey = new Map<string, CrossGradeGameMatchTarget>();
  matchedTargets.forEach((t) => targetByKey.set(`${t.planId}::${t.rowIndex}`, t));

  const updatedPlans = plans.map((plan) => {
    let changed = false;
    const newRows = plan.rows.map((row, rIdx) => {
      const match = targetByKey.get(`${plan.id}::${rIdx}`);
      if (!match) return row;

      const col = options?.preferredCol || match.targetCol;
      changed = true;

      if (col === 'content') {
        const existingList =
          row.contentImages && row.contentImages.length > 0
            ? [...row.contentImages]
            : row.contentImgUrl
            ? [{ id: 'content_img_1', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh trò chơi' }]
            : [];

        const alreadySameUrl = existingList.some((it) => it.url === imgUrl);
        const nextList = options?.replaceExistingGameImage
          ? [{ id: `game_sync_${Date.now()}_${plan.grade}_${rIdx}`, url: imgUrl, title: imgTitle }]
          : alreadySameUrl
          ? existingList
          : [
              ...existingList.filter((it) => !it.url.startsWith('data:image/svg+xml')),
              { id: `game_sync_${Date.now()}_${plan.grade}_${rIdx}`, url: imgUrl, title: imgTitle }
            ];

        return {
          ...row,
          contentImgUrl: nextList[0]?.url || imgUrl,
          contentImgTitle: nextList[0]?.title || imgTitle,
          contentImages: nextList
        };
      } else {
        const existingList =
          row.hsImages && row.hsImages.length > 0
            ? [...row.hsImages]
            : row.hsImgUrl
            ? [{ id: 'diag_1', url: row.hsImgUrl, title: row.hsImgTitle || 'Ảnh trò chơi' }]
            : [];

        const alreadySameUrl = existingList.some((it) => it.url === imgUrl);
        const nextList = options?.replaceExistingGameImage
          ? [{ id: `game_hs_sync_${Date.now()}_${plan.grade}_${rIdx}`, url: imgUrl, title: imgTitle }]
          : alreadySameUrl
          ? existingList
          : [
              ...existingList,
              { id: `game_hs_sync_${Date.now()}_${plan.grade}_${rIdx}`, url: imgUrl, title: imgTitle }
            ];

        return {
          ...row,
          hsImgUrl: nextList[0]?.url || imgUrl,
          hsImgTitle: nextList[0]?.title || imgTitle,
          hsImages: nextList
        };
      }
    });

    return changed ? { ...plan, rows: newRows } : plan;
  });

  return { updatedPlans, matchedTargets };
}

/**
 * Resolves an authentic game image from the user library (across ALL grades if game name matches!)
 * or standard SGK assets matching the game name.
 * Same-grade images always rank highest; cross-grade same-name game images are automatically reused
 * so teachers don't have to hunt or re-upload the same game for every grade.
 */
export function resolveAccurateGameImage(
  gameName: string = '',
  grade: number = 1,
  category: 'tro_choi_kd' | 'tro_choi_vd' = 'tro_choi_vd',
  userImages: SgkImageItem[] = [],
  targetLesson?: SgkLessonFolder
): { url: string; title: string; sourceGrade?: string } {
  const canonicalQuery = normalizeGameNameForMatch(gameName);
  const cleanName = (canonicalQuery || gameName || '').toLowerCase().trim();
  const folderTarget: SubFolderType = category === 'tro_choi_kd' ? 'troChoiKhoiDong' : 'troChoi';
  const queryWords = getGameKeyTokens(cleanName);

  // 1. Search user library across ALL grades for raster game images matching this exact game name
  //    (Same-grade + same-lesson images receive a strong priority bonus; cross-grade exact matches are reused automatically!)
  if (userImages && userImages.length > 0 && cleanName.length >= 2) {
    const orderedCandidates = sortLibraryImages(userImages, 'sgk');
    const candidates = orderedCandidates.filter((img) => {
      if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
      const effFolder = getImageEffectiveSubFolder(img);
      return effFolder === 'troChoiKhoiDong' || effFolder === 'troChoi' || isGameImage(img);
    });

    let bestGameImg: SgkImageItem | null = null;
    let bestScore = -1;

    for (const img of candidates) {
      const sameGrade = String(img.grade) === String(grade);
      const rawTitle = (img.title || '').toLowerCase();
      const subjectTitle = normalizeGameNameForMatch(img.title || '').toLowerCase() || rawTitle.split(/\s+-\s+(?:sgk|khối)/i)[0] || rawTitle;
      const capHead = ((img.caption || '').split('•')[0] || '').toLowerCase();
      const effFolder = getImageEffectiveSubFolder(img);

      const canonicalTitleMatch = doGameNamesMatch(img.title || '', cleanName);
      const canonicalCapMatch = capHead.length >= 3 && doGameNamesMatch(capHead, cleanName);
      const titleExactMatch =
        canonicalTitleMatch ||
        canonicalCapMatch ||
        (cleanName.length >= 3 && (subjectTitle.includes(cleanName) || capHead.includes(cleanName)));

      const imgTokens = new Set([...getGameKeyTokens(subjectTitle), ...getGameKeyTokens(capHead)]);
      const wordHits = queryWords.filter((w) => imgTokens.has(w));
      const minRequiredHits =
        queryWords.length <= 2 ? queryWords.length : Math.max(2, Math.ceil(queryWords.length * 0.65));
      const keywordMatched = queryWords.length > 0 && wordHits.length >= minRequiredHits;

      // Cross-grade reuse requires strong canonical / exact game name match so unrelated games never mix!
      if (!sameGrade) {
        if (!titleExactMatch && !(queryWords.length >= 2 && wordHits.length === queryWords.length)) {
          continue;
        }
      } else {
        if (!titleExactMatch && !keywordMatched) continue;
        if (effFolder !== folderTarget && !titleExactMatch) continue;
      }

      let score = titleExactMatch ? 240 : 120 + wordHits.length * 35;
      if (sameGrade) score += 140;
      if (effFolder === folderTarget) score += 70;
      if (sameGrade && targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) score += 90;
      if (!img.id.startsWith('img_sgk_')) score += 60;

      if (score > bestScore) {
        bestScore = score;
        bestGameImg = img;
      }
    }

    if (bestGameImg) {
      return {
        url: bestGameImg.imgUrl,
        title: bestGameImg.title || `Trò chơi: ${gameName}`,
        sourceGrade: String(bestGameImg.grade || grade)
      };
    }
  }

  // 2. Cross-grade authoritative raster (.jpg) textbook asset mapping ONLY when the game name matches identically
  const asciiName = stripVietnameseDiacritics(cleanName);
  if (asciiName.includes('ket ban')) {
    return {
      url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
      title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC (Trang 31)',
      sourceGrade: '1'
    };
  }
  if (asciiName.includes('lo co')) {
    return {
      url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
      title: 'Trò chơi vận động: Lò cò tiếp sức - SGK GDTC (Trang 34)',
      sourceGrade: '1'
    };
  }
  if (asciiName.includes('trao gay')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_trao_gay_tiep_suc.jpg',
      title: 'Trò chơi vận động: Trao gậy tiếp sức - SGK GDTC 5 (Trang 32)',
      sourceGrade: '5'
    };
  }
  if (asciiName.includes('doi nao nhanh nhat')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Đội nào nhanh nhất - SGK GDTC 5 (Trang 29)',
      sourceGrade: '5'
    };
  }
  if (asciiName.includes('ai keo')) {
    return {
      url: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
      title: 'Trò chơi bổ trợ khởi động: Ai kéo khoẻ hơn - SGK GDTC 5 (Trang 27)',
      sourceGrade: '5'
    };
  }

  // No exact matching raster game image found -> leave empty so UI prompts teacher to search in Library
  return { url: '', title: '' };
}

/**
 * One-click batch sync: scans every game row (1.3 Warmup game & 3.5 Practice game) across all grades
 * in `plans`, finds matching same-name game images from ANY grade in `userImages`, and inserts them cleanly.
 */
export function autoSyncSharedGameImagesAcrossPlans(
  plans: MasterPlanItem[],
  userImages: SgkImageItem[]
): {
  updatedPlans: MasterPlanItem[];
  insertedCount: number;
  details: Array<{ grade: number; lessonNum: number; gameName: string; sourceGrade: string; imgTitle: string }>;
} {
  let insertedCount = 0;
  const details: Array<{ grade: number; lessonNum: number; gameName: string; sourceGrade: string; imgTitle: string }> = [];

  const updatedPlans = plans.map((plan) => {
    const effectiveLesson = findSgkLessonByTopicOrTitle(plan.grade, plan.title, plan.topic);
    let planChanged = false;

    const newRows = plan.rows.map((row, rowIndex) => {
      const slotType = detectGameRowSlotType(row, rowIndex);
      if (!slotType) return row;

      const gameName = extractGameNameFromRowText(row.content);
      if (!gameName) return row;

      const resolved = resolveAccurateGameImage(gameName, plan.grade, slotType, userImages, effectiveLesson);
      if (!resolved.url) return row;

      const isSectionedCol1 =
        row.content.toLowerCase().includes('1.3.') || row.content.toLowerCase().includes('3.5.');

      if (isSectionedCol1) {
        const existing =
          row.contentImages && row.contentImages.length > 0
            ? [...row.contentImages]
            : row.contentImgUrl
            ? [{ id: 'content_img_1', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh trò chơi' }]
            : [];
        if (existing.some((it) => it.url === resolved.url)) return row;

        // Replace placeholder SVG or empty slot, or append cleanly if different
        const cleanedExisting = existing.filter(
          (it) => !it.url.startsWith('data:image/svg+xml') && !it.url.endsWith('.svg')
        );
        const nextList = [
          ...cleanedExisting,
          { id: `shared_game_${Date.now()}_${plan.grade}_${rowIndex}`, url: resolved.url, title: resolved.title }
        ];
        planChanged = true;
        insertedCount++;
        details.push({
          grade: plan.grade,
          lessonNum: plan.lessonNum,
          gameName,
          sourceGrade: resolved.sourceGrade || String(plan.grade),
          imgTitle: resolved.title
        });
        return {
          ...row,
          contentImgUrl: nextList[0]?.url || resolved.url,
          contentImgTitle: nextList[0]?.title || resolved.title,
          contentImages: nextList
        };
      } else {
        const existing =
          row.hsImages && row.hsImages.length > 0
            ? [...row.hsImages]
            : row.hsImgUrl
            ? [{ id: 'diag_1', url: row.hsImgUrl, title: row.hsImgTitle || 'Ảnh trò chơi' }]
            : [];
        if (existing.some((it) => it.url === resolved.url)) return row;

        const nextList = [
          ...existing,
          { id: `shared_game_hs_${Date.now()}_${plan.grade}_${rowIndex}`, url: resolved.url, title: resolved.title }
        ];
        planChanged = true;
        insertedCount++;
        details.push({
          grade: plan.grade,
          lessonNum: plan.lessonNum,
          gameName,
          sourceGrade: resolved.sourceGrade || String(plan.grade),
          imgTitle: resolved.title
        });
        return {
          ...row,
          hsImgUrl: nextList[0]?.url || resolved.url,
          hsImgTitle: nextList[0]?.title || resolved.title,
          hsImages: nextList
        };
      }
    });

    return planChanged ? { ...plan, rows: newRows } : plan;
  });

  return { updatedPlans, insertedCount, details };
}

export interface PracticeSlotImagesMap {
  dongLoat: { url: string; title: string } | null;
  toNhom: { url: string; title: string } | null;
  capDoi: { url: string; title: string } | null;
  caNhan: { url: string; title: string } | null;
  primary: { url: string; title: string } | null;
}

/**
 * Resolves an authentic non-movement raster library image for a specific SGK subFolder slot:
 * - 'khoiDong': prioritizes same-grade & same-lesson warm-up images, and ALLOWS sharing warm-up images across grades/lessons!
 * - 'luyenTap' & 'vanDung': STRICTLY scoped to same grade AND exact targetLesson (NEVER arbitrarily substitutes images from another grade or another lesson!).
 */
export function resolveLessonSlotImage(
  grade: number,
  targetSubFolder: 'khoiDong' | 'luyenTap' | 'vanDung',
  targetLesson: SgkLessonFolder | undefined,
  userImages: SgkImageItem[] = []
): { url: string; title: string } | null {
  if (!userImages || userImages.length === 0) return null;

  const orderedImages = sortLibraryImages(userImages, 'sgk');

  // 1. Warm-up general (1.2 Khởi động chung): CAN be shared across grades & lessons, prioritizing same grade/lesson first
  if (targetSubFolder === 'khoiDong') {
    const kdCandidates = orderedImages.filter((img) => {
      if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
      if (isGameImage(img)) return false;
      if (!isWarmupGeneralImage(img)) return false;
      return getImageEffectiveSubFolder(img) === 'khoiDong';
    });

    if (kdCandidates.length === 0) return null;

    let best: SgkImageItem | null = null;
    let bestScore = -1;

    for (const img of kdCandidates) {
      const sameGrade =
        String(img.grade) === String(grade) &&
        !hasConflictingGradeTag(img.imgUrl, grade) &&
        !hasConflictingGradeTag(img.title, grade);

      let score = 0;
      if (sameGrade && targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) {
        score += 400;
      } else if (
        sameGrade &&
        targetLesson &&
        img.page &&
        img.page >= targetLesson.startPage &&
        img.page <= targetLesson.endPage
      ) {
        score += 360;
      } else if (sameGrade) {
        score += 260;
      } else {
        // Shared warm-up image from another grade in library
        score += 160;
      }

      if (img.folder === 'khoiDong') score += 25;
      if (!img.id.startsWith('img_sgk_')) score += 40;

      if (score > bestScore) {
        bestScore = score;
        best = img;
      }
    }

    return best ? { url: best.imgUrl, title: best.title } : null;
  }

  // 2. 'luyenTap' & 'vanDung': STRICTLY exact grade + exact SGK lesson (or exact same compound concept within same grade/subfolder)
  if (!targetLesson) return null;

  const lessonDomain = detectLessonContextDomain(targetLesson.lessonName, targetLesson.topicName, targetLesson);
  const targetConcept = detectCompoundConceptId(
    `${targetLesson.lessonName} ${targetLesson.movements.join(' ')}`,
    lessonDomain
  );

  const strictCandidates = orderedImages.filter((img) => {
    if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
    if (isGameImage(img)) return false;
    if (String(img.grade) !== String(grade)) return false;
    if (
      hasConflictingGradeTag(img.imgUrl, grade) ||
      hasConflictingGradeTag(img.title, grade) ||
      hasConflictingGradeTag((img.caption || '').split('•')[0], grade)
    ) {
      return false;
    }
    if (getImageEffectiveSubFolder(img) !== targetSubFolder) return false;
    const belongsExact =
      doesImageBelongToSgkLesson(img, targetLesson) ||
      Boolean(img.page && img.page >= targetLesson.startPage && img.page <= targetLesson.endPage);
    if (belongsExact) return true;

    // Only allow keyword-based concept match if image is unassigned to a different lesson and matches exact compound concept
    if (targetConcept !== 'generic' && !img.lessonId) {
      const imgConcept = detectCompoundConceptId(
        `${img.title || ''} ${(img.caption || '').split('•')[0] || ''} ${img.lessonTitle || ''}`,
        lessonDomain
      );
      if (imgConcept === targetConcept) return true;
    }
    return false;
  });

  if (strictCandidates.length === 0) return null;

  let best: SgkImageItem | null = null;
  let bestScore = -1;

  for (const img of strictCandidates) {
    let score = 100;
    if (
      img.lessonId === targetLesson.id ||
      (img.topicId === targetLesson.topicId && img.lessonId === targetLesson.lessonId)
    ) {
      score += 140;
    } else if (img.page && img.page >= targetLesson.startPage && img.page <= targetLesson.endPage) {
      score += 100;
    }
    if (img.folder === targetSubFolder) score += 25;
    if (!img.id.startsWith('img_sgk_')) score += 45;

    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }

  return best ? { url: best.imgUrl, title: best.title } : null;
}

/**
 * Resolves exact-lesson practice images into their specific practice rows:
 * 3.1 Đồng loạt, 3.2 Tổ/Nhóm, 3.3 Cặp đôi, 3.4 Cá nhân / Thi đua.
 * Strictly uses only same-grade, exact-lesson 'luyenTap' images from the library (never duplicates or borrows from other lessons).
 */
export function resolvePracticeSlotImages(
  grade: number,
  targetLesson: SgkLessonFolder | undefined,
  userImages: SgkImageItem[] = []
): PracticeSlotImagesMap {
  const empty: PracticeSlotImagesMap = {
    dongLoat: null,
    toNhom: null,
    capDoi: null,
    caNhan: null,
    primary: null
  };
  if (!targetLesson || !userImages || userImages.length === 0) return empty;

  const ordered = sortLibraryImages(userImages, 'sgk');
  const lessonPracticeImgs = ordered.filter((img) => {
    if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
    if (isGameImage(img)) return false;
    if (String(img.grade) !== String(grade)) return false;
    if (
      hasConflictingGradeTag(img.imgUrl, grade) ||
      hasConflictingGradeTag(img.title, grade) ||
      hasConflictingGradeTag((img.caption || '').split('•')[0], grade)
    ) {
      return false;
    }
    if (getImageEffectiveSubFolder(img) !== 'luyenTap') return false;
    return (
      doesImageBelongToSgkLesson(img, targetLesson) ||
      Boolean(img.page && img.page >= targetLesson.startPage && img.page <= targetLesson.endPage)
    );
  });

  if (lessonPracticeImgs.length === 0) return empty;

  const result: PracticeSlotImagesMap = { ...empty };
  const generalPool: SgkImageItem[] = [];

  for (const img of lessonPracticeImgs) {
    const subType = detectPracticeSubSlotType(img);
    const entry = { url: img.imgUrl, title: img.title };
    if (subType === 'dong_loat' && !result.dongLoat) {
      result.dongLoat = entry;
    } else if (subType === 'to_nhom' && !result.toNhom) {
      result.toNhom = entry;
    } else if (subType === 'cap_doi' && !result.capDoi) {
      result.capDoi = entry;
    } else if (subType === 'ca_nhan' && !result.caNhan) {
      result.caNhan = entry;
    } else {
      generalPool.push(img);
    }
  }

  // If the lesson has a general Luyện tập image without a sub-type tag, attach it cleanly to 3.2 Tổ/Nhóm if empty
  if (!result.toNhom && generalPool.length > 0) {
    result.toNhom = { url: generalPool[0].imgUrl, title: generalPool[0].title };
  }

  result.primary =
    result.toNhom ||
    result.dongLoat ||
    result.capDoi ||
    result.caNhan ||
    (lessonPracticeImgs[0] ? { url: lessonPracticeImgs[0].imgUrl, title: lessonPracticeImgs[0].title } : null);

  return result;
}

export interface ResolvedLessonSlotAssets {
  effectiveLesson?: SgkLessonFolder;
  khoiDongImg: { url: string; title: string } | null;
  warmupGameName: string;
  warmupGameImg: { url: string; title: string };
  movementDetails: AccurateMovementDetails;
  luyenTapImg: { url: string; title: string } | null;
  luyenTapBySlot: PracticeSlotImagesMap;
  practiceGameName: string;
  practiceGameImg: { url: string; title: string };
  vanDungQuestion: string;
  vanDungAnswerGuide: string;
  vanDungImg: { url: string; title: string } | null;
}

/**
 * Single deterministic 6-slot asset resolver connecting:
 * PPCT + Title + Period Rule -> Effective SGK Lesson Folder -> 6 Classified Library Slots.
 */
export function resolveLessonSlotAssets(
  grade: number = 1,
  title: string = '',
  topic: string = '',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): ResolvedLessonSlotAssets {
  const effectiveLesson = findSgkLessonByTopicOrTitle(grade, title, topic);
  const movementDetails = resolveAccurateMovement('', title, grade, userImages, topic);

  const treeWarmup = (effectiveLesson?.subFolders?.troChoiKhoiDong?.items?.[0]?.gameName || '').trim();
  const treePractice = (effectiveLesson?.subFolders?.troChoi?.items?.[0]?.gameName || '').trim();

  // Only accept non-fabricated custom or tree games; NEVER invent fallback games outside PPCT/SGK
  const cleanCustomWarmup =
    customWarmupGame && !isFabricatedLegacyGameName(customWarmupGame) ? customWarmupGame.trim() : '';
  const cleanCustomPractice =
    customPracticeGame && !isFabricatedLegacyGameName(customPracticeGame) ? customPracticeGame.trim() : '';
  const cleanTreeWarmup = treeWarmup && !isFabricatedLegacyGameName(treeWarmup) ? treeWarmup : '';
  const cleanTreePractice = treePractice && !isFabricatedLegacyGameName(treePractice) ? treePractice : '';

  // If the teacher uploaded an authentic SGK game image explicitly belonging to this exact lesson, derive its real game title
  const detectAuthenticLessonLibraryGame = (targetFolder: 'troChoiKhoiDong' | 'troChoi'): string => {
    if (!effectiveLesson || !userImages || userImages.length === 0) return '';
    const ordered = sortLibraryImages(userImages, 'sgk');
    const found = ordered.find((img) => {
      if (!img.imgUrl || isSvgImageUrl(img.imgUrl)) return false;
      if (String(img.grade) !== String(grade)) return false;
      if (getImageEffectiveSubFolder(img) !== targetFolder) return false;
      return doesImageBelongToSgkLesson(img, effectiveLesson);
    });
    if (!found) return '';
    const derived = normalizeGameNameForMatch(found.title || '').trim();
    if (!derived || derived.length < 3 || isFabricatedLegacyGameName(derived)) return '';
    return derived.charAt(0).toUpperCase() + derived.slice(1);
  };

  const manualOverride = effectiveLesson ? getSgkTreeOverrides()[effectiveLesson.id] : undefined;
  const overrideWarmup = manualOverride?.warmupGameName?.trim() || '';
  const overridePractice = manualOverride?.practiceGameName?.trim() || '';

  const warmupGameName =
    overrideWarmup ||
    cleanCustomWarmup ||
    cleanTreeWarmup ||
    detectAuthenticLessonLibraryGame('troChoiKhoiDong') ||
    '';
  const practiceGameName =
    overridePractice ||
    cleanCustomPractice ||
    cleanTreePractice ||
    detectAuthenticLessonLibraryGame('troChoi') ||
    '';

  const khoiDongImg = resolveLessonSlotImage(grade, 'khoiDong', effectiveLesson, userImages);
  const warmupGameImg = warmupGameName
    ? resolveAccurateGameImage(warmupGameName, grade, 'tro_choi_kd', userImages, effectiveLesson)
    : { url: '', title: '' };
  const luyenTapBySlot = resolvePracticeSlotImages(grade, effectiveLesson, userImages);
  const luyenTapImg = luyenTapBySlot.primary || resolveLessonSlotImage(grade, 'luyenTap', effectiveLesson, userImages);
  const practiceGameImg = practiceGameName
    ? resolveAccurateGameImage(practiceGameName, grade, 'tro_choi_vd', userImages, effectiveLesson)
    : { url: '', title: '' };
  const vanDungImg = resolveLessonSlotImage(grade, 'vanDung', effectiveLesson, userImages);

  const appDetails = getLessonSpecificApplication(movementDetails.movementName, title, grade, effectiveLesson);

  return {
    effectiveLesson,
    khoiDongImg,
    warmupGameName,
    warmupGameImg,
    movementDetails,
    luyenTapImg,
    luyenTapBySlot,
    practiceGameName,
    practiceGameImg,
    vanDungQuestion: appDetails.question,
    vanDungAnswerGuide: appDetails.answerGuide,
    vanDungImg
  };
}

/**
 * Creates 7 balanced lesson rows where:
 * 1. Practice 3.1, 3.2, 3.3 are separated into dedicated rows with individual diagrams.
 * 2. Teacher activities (Cột GV) are estimated at ~100-120 words per row to match image/diagram heights and eliminate white space.
 * 3. Movement image is 100% matched with title and content.
 * 4. Warm-up and practice games strictly match the syllabus and attach authentic textbook game photos.
 */
export function createBalanced7LessonRows(
  grade: number = 1,
  title: string = 'Bài tập rèn luyện thể dục phát triển chung',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): LessonRow[] {
  const resolved = resolveLessonSlotAssets(grade, title, '', userImages, customWarmupGame, customPracticeGame);
  const accurate = resolved.movementDetails;
  const mName = normalizeAllCapsForSentenceBody(accurate.movementName);
  const resolvedWarmup = resolved.warmupGameName;
  const resolvedPractice = resolved.practiceGameName;
  const warmupImg = resolved.warmupGameImg;
  const practiceImg = resolved.practiceGameImg;
  const appDetails = getLessonSpecificApplication(mName, title, grade, resolved.effectiveLesson);

  const isAssessmentLesson = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(title);
  const equipmentDesc =
    isAssessmentLesson
      ? 'Đồng hồ bấm giây, thước dây, còi, vạch xuất phát và phiếu ghi nhận kết quả kiểm tra theo tổ.'
      : grade === 5
      ? 'Gậy thể dục, cọc tiêu theo chuẩn nội dung trò chơi.'
      : grade === 4
      ? 'Vòng thể dục, cọc tiêu an toàn theo chuẩn nội dung trò chơi SGK.'
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  const diagNhanLop = getFormationDiagramForPhaseAndGrade('nhan_lop', grade);
  const diagTapMau = getFormationDiagramForPhaseAndGrade('tap_mau', grade);
  const diagDongLoat = getFormationDiagramForPhaseAndGrade('dong_loat', grade);
  const diagToNhom = getFormationDiagramForPhaseAndGrade('to_nhom', grade);
  const diagCapDoi = getFormationDiagramForPhaseAndGrade('cap_doi', grade);
  const diagThiDua = getFormationDiagramForPhaseAndGrade('thi_dua', grade);
  const diagTroChoi = resolvedPractice
    ? getFormationDiagramByKeyword(resolvedPractice, 'tro_choi', grade)
    : diagThiDua;
  const diagHoiTinh = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);

  return [
    // HÀNG 1: MỞ ĐẦU & KHỞI ĐỘNG (Chỉ chèn 1.3 nếu SGK có trò chơi khởi động)
    {
      content: resolvedWarmup
        ? `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}".`
        : `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (theo nhạc).`,
      lvd: `5 - 7 phút\n2L x 8N`,
      gv: resolvedWarmup
        ? `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.\n- Tổ chức trò chơi bổ trợ khởi động "${resolvedWarmup}" tạo không khí vui tươi, hào hứng trước khi vào bài mới; quan sát bao quát và nhắc nhở tinh thần tập trung, trật tự.`
        : `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.`,
      hs: resolvedWarmup
        ? `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.\n- Hào hứng tham gia trò chơi khởi động "${resolvedWarmup}", chấp hành nghiêm túc hiệu lệnh của giáo viên.`
        : `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.`,
      contentImgUrl: undefined,
      contentImgTitle: undefined,
      hsImgUrl: diagNhanLop.svgDataUrl,
      hsImgTitle: diagNhanLop.name,
      hsImages: [
        {
          id: 'diag_1_nhan_lop',
          url: diagNhanLop.svgDataUrl,
          title: diagNhanLop.name
        }
      ]
    },
    // HÀNG 2: HÌNH THÀNH KIẾN THỨC MỚI / HƯỚNG DẪN KIỂM TRA ĐÁNH GIÁ
    {
      content: isAssessmentLesson
        ? `2. HOẠT ĐỘNG HƯỚNG DẪN TIÊU CHÍ & TỔ CHỨC KIỂM TRA, ĐÁNH GIÁ\n2.1. Phổ biến nội dung, tiêu chuẩn đánh giá & thực hành mẫu:\n${accurate.movementSteps}`
        : `2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác:\n${accurate.movementSteps.startsWith('*') ? accurate.movementSteps : `* Học ${mName}:\n${accurate.movementSteps}`}`,
      lvd: isAssessmentLesson ? `5 - 6 phút` : `6 - 8 phút\n2 - 3 lần`,
      gv: accurate.gvExplanation,
      hs: accurate.hsTask,
      contentImgUrl: accurate.imgUrl,
      contentImgTitle: accurate.imgTitle,
      contentImages:
        accurate.allImages && accurate.allImages.length > 0
          ? accurate.allImages
          : accurate.imgUrl
          ? [{ id: 'img_kt_7r_1', url: accurate.imgUrl, title: accurate.imgTitle }]
          : [],
      hsImgUrl: diagTapMau.svgDataUrl,
      hsImgTitle: diagTapMau.name,
      hsImages: [
        {
          id: 'diag_2_quan_sat',
          url: diagTapMau.svgDataUrl,
          title: diagTapMau.name
        }
      ]
    },
    // HÀNG 3: 3.1. TẬP ĐỒNG LOẠT CẢ LỚP (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện ${mName} theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp ${accurate.practiceFocus}.`,
      lvd: `3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở và biên độ vận động của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và chú trọng ${accurate.practiceFocus}.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.`,
      hs: `- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý giữ đúng biên độ kỹ thuật và tư thế thân người, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.`,
      hsImgUrl: diagDongLoat.svgDataUrl,
      hsImgTitle: diagDongLoat.name,
      hsImages: [
        {
          id: 'diag_3_dong_loat',
          url: diagDongLoat.svgDataUrl,
          title: diagDongLoat.name
        }
      ]
    },
    // HÀNG 4: 3.2. TẬP THEO TỔ / NHÓM (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện ${mName} (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.`,
      lvd: `4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc, chú trọng rèn ${accurate.practiceFocus}.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.`,
      hs: `- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.`,
      hsImgUrl: diagToNhom.svgDataUrl,
      hsImgTitle: diagToNhom.name,
      hsImages: [
        {
          id: 'diag_4_to_nhom',
          url: diagToNhom.svgDataUrl,
          title: diagToNhom.name
        }
      ]
    },
    // HÀNG 5: 3.3. TẬP CẶP ĐÔI SỬA SAI (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện ${mName} kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.`,
      lvd: `3 - 4 phút\n1 - 2 lần\nđổi vai`,
      gv: `- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ xem bạn mình đã thực hiện chuẩn ${accurate.practiceFocus} hay chưa; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.`,
      hs: `- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.`,
      hsImgUrl: diagCapDoi.svgDataUrl,
      hsImgTitle: diagCapDoi.name,
      hsImages: [
        {
          id: 'diag_5_cap_doi',
          url: diagCapDoi.svgDataUrl,
          title: diagCapDoi.name
        }
      ]
    },
    // HÀNG 6: 3.4. THI ĐUA TRÌNH DIỄN GIỮA CÁC TỔ (HÀNG RIÊNG)
    {
      content: `3.4. Thi đua trình diễn giữa các tổ:\n- Từng tổ lên thực hiện ${mName} trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.`,
      lvd: `3 - 4 phút\n1 lượt / tổ`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- GV ghi nhận ưu điểm, sửa lỗi còn tồn tại và tuyên dương tổ thực hiện đều đẹp, đúng kỹ thuật.`,
      hs: `- Đội hình thi đua: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Từng tổ lên biểu diễn tự tin, thực hiện đúng động tác theo nhịp hô dứt khoát của tổ trưởng.`,
      contentImgUrl: undefined,
      contentImgTitle: undefined,
      contentImages: [],
      hsImgUrl: diagThiDua.svgDataUrl,
      hsImgTitle: diagThiDua.name,
      hsImages: [
        {
          id: 'diag_6_thi_dua',
          url: diagThiDua.svgDataUrl,
          title: diagThiDua.name
        }
      ]
    },
    // HÀNG 7: 3.5. TRÒ CHƠI VẬN ĐỘNG (HÀNG RIÊNG KHI SGK CÓ TRÒ CHƠI)
    ...(resolvedPractice
      ? [
          {
            content: `3.5. Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đồng đội.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
            lvd: `4 - 5 phút\n2 - 3 lượt`,
            gv: `- Phổ biến ngắn gọn tên trò chơi vận động "${resolvedPractice}", mục đích rèn luyện tố chất nhanh nhẹn, luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm làm mẫu thao tác tham gia trò chơi; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.`,
            hs: `- Học sinh chú ý lắng nghe GV phổ biến luật chơi và quan sát nhóm bạn chơi mẫu.\n- Đội hình trò chơi "${resolvedPractice}": 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn vượt qua thử thách và tiếp sức an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.`,
            contentImgUrl: practiceImg?.url,
            contentImgTitle: practiceImg?.title,
            contentImages: practiceImg?.url
              ? [{ id: 'img_tc_7r_1', url: practiceImg.url, title: practiceImg.title }]
              : [],
            hsImgUrl: diagTroChoi.svgDataUrl,
            hsImgTitle: diagTroChoi.name,
            hsImages: [
              {
                id: 'diag_6_tro_choi',
                url: diagTroChoi.svgDataUrl,
                title: diagTroChoi.name
              }
            ]
          }
        ]
      : []),
    // HÀNG 7: 4. VẬN DỤNG & HỒI TĨNH (Ô RIÊNG)
    {
      content: `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng toàn thân, rũ tay, rung đùi, lắc chân và hít thở sâu theo nhịp chậm rãi.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp bảo vệ môi trường: ${appDetails.environmentNote}\n4.3. Nhận xét & Xuống lớp.`,
      lvd: `3 - 5 phút\n1 - 2 lần`,
      gv: `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ tay, rung thả lỏng đùi và chân, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n${appDetails.fullGvText}`,
      hs: `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n${appDetails.fullHsText}`,
      contentImgUrl: resolved.vanDungImg?.url,
      contentImgTitle: resolved.vanDungImg?.title,
      contentImages: resolved.vanDungImg?.url
        ? [{ id: 'img_vd_7r_1', url: resolved.vanDungImg.url, title: resolved.vanDungImg.title }]
        : [],
      hsImgUrl: diagHoiTinh.svgDataUrl,
      hsImgTitle: diagHoiTinh.name,
      hsImages: [
        {
          id: 'diag_7_hoi_tinh',
          url: diagHoiTinh.svgDataUrl,
          title: diagHoiTinh.name
        }
      ]
    }
  ];
}

export interface LessonApplicationDetails {
  question: string;
  answerGuide: string;
  practicalHabit: string;
  environmentNote: string;
  fullContentText: string;
  fullGvText: string;
  fullHsText: string;
}

/**
 * Generates standardized, elementary-appropriate Vận dụng content referencing the SGK image
 * without fabricated specific questions, anatomy-heavy answer guides, or homework directives.
 */
export function getLessonSpecificApplication(
  _movementName: string = '',
  _title: string = '',
  _grade: number = 1,
  _lesson?: SgkLessonFolder
): LessonApplicationDetails {
  const question = 'Câu hỏi vận dụng sách giáo khoa.';
  const answerGuide = '';
  const practicalHabit = '';
  const environmentNote =
    'Kiểm tra vệ sinh sân tập, nhặt vật sắc nhọn/nguy hiểm, thu dọn và cất dụng cụ thể dục đúng nơi quy định an toàn.';

  const fullContentText =
    `4.2. Vận dụng:\n` +
    `- Câu hỏi vận dụng sách giáo khoa.\n` +
    `- Tích hợp bảo vệ môi trường: ${environmentNote}\n` +
    `4.3. Nhận xét & Xuống lớp.`;

  const fullGvText =
    `- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n` +
    `- Nhận xét câu trả lời, tuyên dương các em tích cực tham gia phát biểu đúng nội dung bài học.\n` +
    `- Giáo dục ý thức bảo vệ môi trường: nhắc nhở các em quan sát xung quanh sân tập, cùng nhau nhặt rác, cất dụng cụ gọn gàng, an toàn.\n` +
    `- Nhận xét chung tinh thần, thái độ học tập của cả lớp và phát lệnh xuống lớp.`;

  const fullHsText =
    `- Học sinh quan sát hình ảnh và lắng nghe câu hỏi vận dụng sách giáo khoa của giáo viên; tích cực xung phong trả lời câu hỏi.\n` +
    `- Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ.\n` +
    `- Lắng nghe nhận xét chung của giáo viên, chào thầy/cô và xếp hàng trật tự đi về lớp học.`;

  return {
    question,
    answerGuide,
    practicalHabit,
    environmentNote,
    fullContentText,
    fullGvText,
    fullHsText
  };
}

const LEGACY_VANDUNG_REGEX =
  /vận dụng & dặn dò|gợi ý trả lời|nhiệm vụ rèn luyện|dặn dò về nhà|tự tập ở nhà|tập luyện ngoài giờ|tập luyện ở nhà|bài tập về nhà|dặn dò tự|giao nhiệm vụ|câu hỏi vận dụng sgk:|nêu câu hỏi vận dụng:|đặt câu hỏi tương tác|em nên tập động tác này|em nên tập bài thể dục này|phát triển những nhóm cơ nào|cơ liên sườn|tứ đầu|cơ đùi|gân kheo|đốt sống cổ|nhóm cơ|dung tích phổi|cơ bắp/i;

/**
 * Sanitizes any Vận dụng (4.2) row across all grades and weeks:
 * - Removes fabricated specific questions, "Gợi ý trả lời" anatomy jargon, and "Dặn dò về nhà"
 * - Standardizes text to "- Câu hỏi vận dụng sách giáo khoa."
 * - Strictly preserves Column 1 Vận dụng images and Column 4 formation diagrams.
 */
export function sanitizeVanDungRow(row: LessonRow): LessonRow {
  const cLower = (row.content || '').toLowerCase();
  const hasCooldownSection = cLower.includes('4.1') || cLower.includes('hồi tĩnh');
  const hasExplicitVanDungHeading = cLower.includes('4.2') || /4\.2[\.\:]|vận dụng\s*:/.test(cLower);
  // NEVER convert a 4.1. Hồi tĩnh row whose parent heading contains "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH" into 4.2. Vận dụng!
  if (hasCooldownSection && !hasExplicitVanDungHeading) return row;

  const isVanDungRow = cLower.includes('4.2') || cLower.includes('vận dụng');
  if (!isVanDungRow) return row;

  // Ignore official auto-inserted integration lines when checking legacy Vận dụng phrases (e.g., "ở nhà" in official NLS PDF)
  const stripOfficialIntegrationLines = (txt: string) =>
    (txt || '')
      .split('\n')
      .filter((line) => !/^\s*[-•+]?\s*(\(Tích hợp\s+|Tích hợp\s+[^:\n]+:)/i.test(line))
      .join('\n');

  const combinedCorpus = `${stripOfficialIntegrationLines(row.content || '')}\n${stripOfficialIntegrationLines(row.gv || '')}\n${stripOfficialIntegrationLines(row.hs || '')}`;
  const needsRewrite =
    LEGACY_VANDUNG_REGEX.test(combinedCorpus) ||
    !cLower.includes('câu hỏi vận dụng sách giáo khoa');

  if (!needsRewrite) return row;

  const app = getLessonSpecificApplication();
  if (hasCooldownSection) {
    return {
      ...row,
      content:
        `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n` +
        `4.1. Hồi tĩnh:\n- Thả lỏng toàn thân, rũ tay, rung đùi, lắc chân và hít thở sâu theo nhịp chậm rãi.\n` +
        `4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp bảo vệ môi trường: ${app.environmentNote}\n` +
        `4.3. Nhận xét & Xuống lớp.`,
      gv:
        `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ tay, rung thả lỏng đùi và chân, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n` +
        `${app.fullGvText}`,
      hs:
        `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n` +
        `${app.fullHsText}`
    };
  }

  return {
    ...row,
    content: app.fullContentText,
    gv: app.fullGvText,
    hs: app.fullHsText
  };
}

/**
 * Sanitizes all rows in a plan while preserving separation between Row 10 (4.1 Hồi tĩnh)
 * and Row 11 (4.2 Vận dụng), automatically healing any duplicated 4.2 Vận dụng row.
 */
export function sanitizePlanRowsVanDung(rows: LessonRow[], grade: number = 1): LessonRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const isGranular = rows.length >= 9;
  const lastIdx = rows.length - 1;
  const secondLastIdx = rows.length - 2;

  const hoiTinhDiag = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);

  return rows.map((row, idx) => {
    const cLower = (row.content || '').toLowerCase();
    const lastLower = (rows[lastIdx]?.content || '').toLowerCase();
    const hasCooldown = cLower.includes('4.1') || cLower.includes('hồi tĩnh');
    const isLastAlsoVanDung = lastLower.includes('4.2') || lastLower.includes('vận dụng') || lastLower.includes('nhận xét');

    // In 10-11 row granular plans, the second-to-last row (index rows.length - 2) must stay pure 4.1 Hồi tĩnh
    if (isGranular && idx === secondLastIdx && (hasCooldown || (isLastAlsoVanDung && (cLower.includes('4.2') || cLower.includes('vận dụng'))))) {
      const needsHeal = cLower.includes('4.2') || cLower.includes('câu hỏi vận dụng') || !hasCooldown;
      if (needsHeal) {
        const healed: LessonRow = {
          ...row,
          content:
            `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n` +
            `4.1. Hồi tĩnh:\n` +
            `- Thả lỏng toàn thân, cúi người rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi để cơ thể hồi phục.`,
          gv:
            `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ mềm tay, rung thả lỏng đùi và chân, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n` +
            `- Nhắc học sinh thả lỏng tự nhiên, không gồng cứng cơ thể.`,
          hs:
            `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n` +
            `- Rũ tay, thả lỏng bắp chân nhịp nhàng, cảm nhận cơ thể hồi phục sảng khoái.`,
          hsImgUrl: hoiTinhDiag.svgDataUrl,
          hsImgTitle: hoiTinhDiag.name,
          hsImages: [{ id: `diag_ht_g${grade}_${idx}`, url: hoiTinhDiag.svgDataUrl, title: hoiTinhDiag.name }]
        };
        delete healed.contentImgUrl;
        delete healed.contentImgTitle;
        healed.contentImages = [];
        return healed;
      }
      return row;
    }

    return sanitizeVanDungRow(row);
  });
}

/**
 * Removes stale auto-generated 1.3 / 3.5 game rows (or fabricated game lines in merged rows)
 * whose game name is a legacy fabricated name outside the official SGK/PPCT curriculum,
 * while preserving authentic SGK games and any custom games manually added by the teacher.
 * Also fixes stale legacy movement headings (e.g. "Kỹ thuật lăn nghiêng sang phải / trái trên đệm").
 */
export function stripFabricatedGameRows(rows: LessonRow[]): LessonRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const result: LessonRow[] = [];
  for (const row of rows) {
    const content = row.content || '';
    const cLower = content.toLowerCase();

    const isDedicatedWarmupGame =
      (cLower.includes('1.3.') || (cLower.includes('trò chơi') && cLower.includes('khởi động'))) &&
      !cLower.includes('1.1.') &&
      !cLower.includes('1.2.');
    const isDedicatedPracticeGame =
      cLower.includes('3.5.') && !cLower.includes('3.4.');

    if (isDedicatedWarmupGame || isDedicatedPracticeGame) {
      const gName = extractGameNameFromRowText(content);
      // Drop dedicated game row if game name is empty or matches legacy fabricated list
      if (!gName || isFabricatedLegacyGameName(gName)) {
        continue;
      }
    }

    // Handle merged Row 0 (1.1 + 1.2 + 1.3) containing a fabricated warmup game line
    if ((cLower.includes('1.1.') || cLower.includes('1.2.')) && cLower.includes('1.3.')) {
      const gameLineMatch = content.match(/1\.3\.\s*Trò chơi[^\n]*/i);
      if (gameLineMatch) {
        const gName = extractGameNameFromRowText(gameLineMatch[0]);
        if (!gName || isFabricatedLegacyGameName(gName)) {
          const cleanedContent = content
            .replace(/\n?1\.3\.\s*Trò chơi[^\n]*/gi, '')
            .trim();
          const cleanedGv = (row.gv || '')
            .replace(/\n?-\s*(?:Tổ chức|GV nêu tên)\s+trò chơi[^\n]*/gi, '')
            .trim();
          const cleanedHs = (row.hs || '')
            .replace(/\n?-\s*(?:Hào hứng tham gia|Học sinh chăm chú lắng nghe hướng dẫn luật chơi)[^\n]*/gi, '')
            .trim();
          result.push({
            ...row,
            content: cleanedContent,
            gv: cleanedGv,
            hs: cleanedHs
          });
          continue;
        }
      }
    }

    // Handle merged Row 3.4 + * Trò chơi vận động containing a fabricated game
    if (cLower.includes('3.4.') && cLower.includes('trò chơi vận động')) {
      const gName = extractGameNameFromRowText(content);
      if (!gName || isFabricatedLegacyGameName(gName)) {
        const cleanedContent = content
          .replace(/\s*&\s*Trò chơi vận động/gi, '')
          .replace(/\n?\*\s*Trò chơi vận động:[\s\S]*$/i, '')
          .trim();
        result.push({
          ...row,
          content: cleanedContent,
          contentImgUrl: undefined,
          contentImgTitle: undefined,
          contentImages: []
        });
        continue;
      }
    }

    // Replace stale fabricated K5 Cd3 B1 movement heading from cached drafts with authentic SGK heading
    if (/kỹ thuật lăn nghiêng sang phải\s*\/\s*trái trên đệm/i.test(content)) {
      result.push({
        ...row,
        content: content.replace(
          /Kỹ thuật lăn nghiêng sang phải\s*\/\s*trái trên đệm/gi,
          'Lăn nửa vòng, Lăn trọn vòng'
        )
      });
      continue;
    }

    result.push(row);
  }

  return result;
}


/**
 * Creates 11 granular, 1:1 horizontally aligned lesson rows where each sub-activity
 * (Nhận lớp, Khởi động, Trò chơi khởi động, Động tác mới, Tập đồng loạt, Tập tổ, Tập cặp đôi, Thi đua, Trò chơi vận động, Hồi tĩnh, Vận dụng & Dặn dò)
 * has its OWN ROW, with Col 1 (Nội dung & Ảnh), Col 2 (LVĐ), Col 3 (GV), and Col 4 (HS & Sơ đồ) perfectly aligned horizontally.
 */
export function createBalancedGranularLessonRows(
  grade: number = 1,
  title: string = 'Bài tập rèn luyện thể dục phát triển chung',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string,
  week?: number,
  period?: number
): LessonRow[] {
  const resolved = resolveLessonSlotAssets(grade, title, '', userImages, customWarmupGame, customPracticeGame);
  const accurate = resolved.movementDetails;
  const mName = normalizeAllCapsForSentenceBody(accurate.movementName);
  const resolvedWarmup = resolved.warmupGameName;
  const resolvedPractice = resolved.practiceGameName;
  const warmupImg = resolved.warmupGameImg;
  const practiceImg = resolved.practiceGameImg;
  const appDetails = getLessonSpecificApplication(mName, title, grade, resolved.effectiveLesson);

  const isAssessmentLesson = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(title);
  const equipmentDesc =
    isAssessmentLesson
      ? 'Đồng hồ bấm giây, thước dây, còi, vạch xuất phát và phiếu ghi nhận kết quả kiểm tra theo tổ.'
      : grade === 5
      ? 'Gậy thể dục, cọc tiêu an toàn theo chuẩn nội dung trò chơi.'
      : grade === 4
      ? 'Vòng thể dục, cọc tiêu an toàn theo chuẩn nội dung trò chơi SGK.'
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  const discoveryHeading = isAssessmentLesson
    ? `2. HOẠT ĐỘNG HƯỚNG DẪN TIÊU CHÍ & TỔ CHỨC KIỂM TRA, ĐÁNH GIÁ\n2.1. Phổ biến nội dung, tiêu chuẩn đánh giá & thực hành mẫu:\n${accurate.movementSteps}`
    : `2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác mới:\n${accurate.movementSteps.startsWith('*') ? accurate.movementSteps : `* Học ${mName}:\n${accurate.movementSteps}`}`;

  const practiceRowHeading1 = isAssessmentLesson
    ? `3. HOẠT ĐỘNG THỰC HÀNH KIỂM TRA & ĐÁNH GIÁ THỂ LỰC\n3.1. Khởi động chuyên môn & thử sức đồng loạt:\n- Toàn lớp thực hiện thử ${mName} để ổn định tâm lý trước khi vào lượt kiểm tra chính thức.\n- Giáo viên lưu ý cách xuất phát, hít thở và tránh lỗi phạm quy.`
    : `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện ${mName} theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp ${accurate.practiceFocus}.`;

  const practiceRowHeading2 = isAssessmentLesson
    ? `3.2. Kiểm tra chính thức theo tổ / nhóm (Lượt 1):\n- Lần lượt từng tổ di chuyển vào khu vực kiểm tra theo hướng dẫn của GV.\n- Mỗi học sinh thực hiện 1 - 2 lượt chính thức; GV đo đạc, chấm điểm và nhận xét mức đạt chuẩn theo Thông tư 27.`
    : `3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện ${mName} (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.`;

  const practiceRowHeading3 = isAssessmentLesson
    ? `3.3. Thực hành tự rèn luyện bổ sung & Kiểm tra lại:\n- Các bạn đã hoàn thành ngồi cổ vũ trật tự hoặc tự tập thả lỏng nhẹ theo cặp.\n- Học sinh chưa đạt hoặc muốn cải thiện thành tích được thực hiện kiểm tra bổ sung ở lượt 2.`
    : `3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện ${mName} kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.`;

  const practiceRowHeading4 = isAssessmentLesson
    ? `3.4. Tổng hợp kết quả kiểm tra giữa các tổ:\n- Công bố nhanh kết quả đạt chuẩn của từng tổ theo các mức Hoàn thành tốt (HTT) và Hoàn thành (HT).\n- Tuyên dương các cá nhân có thành tích nổi bật và tinh thần vượt khó.`
    : `3.4. Thi đua trình diễn giữa các tổ:\n- Từng tổ lên thực hiện ${mName} trước lớp (theo nhịp hô của tổ trưởng).\n- Các tổ ngồi xem quan sát, theo dõi, nhận xét và chấm điểm chéo cho nhau.`;

  const diagNhanLop = getFormationDiagramForPhaseAndGrade('nhan_lop', grade);
  const diagKhoiDong = getFormationDiagramForPhaseAndGrade('khoi_dong', grade);
  const diagWarmupGame = resolvedWarmup ? getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong', grade) : diagKhoiDong;
  const diagTapMau = getFormationDiagramForPhaseAndGrade('tap_mau', grade);
  const diagDongLoat = getFormationDiagramForPhaseAndGrade('dong_loat', grade);
  const diagToNhom = getFormationDiagramForPhaseAndGrade('to_nhom', grade);
  const diagCapDoi = getFormationDiagramForPhaseAndGrade('cap_doi', grade);
  const diagThiDua = getFormationDiagramForPhaseAndGrade('thi_dua', grade);
  const diagTroChoi = resolvedPractice ? getFormationDiagramByKeyword(resolvedPractice, 'tro_choi', grade) : diagThiDua;
  const diagHoiTinh = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);
  const diagXuongLop = getFormationDiagramForPhaseAndGrade('xuong_lop', grade);

  const generatedRows: LessonRow[] = [
    // 1. NHẬN LỚP
    {
      content: `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, giày dép và tình trạng sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung và yêu cầu cần đạt của tiết học.`,
      lvd: `1 - 2 phút`,
      gv: `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng và tạo tâm thế học tập hứng khởi.`,
      hs: `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Toàn lớp đứng nghiêm trang, lắng nghe phổ biến và ghi nhớ mục tiêu tiết học.`,
      hsImgUrl: diagNhanLop.svgDataUrl,
      hsImgTitle: diagNhanLop.name,
      hsImages: [
        {
          id: 'diag_1_nhan_lop',
          url: diagNhanLop.svgDataUrl,
          title: diagNhanLop.name
        }
      ]
    },

    // 2. KHỞI ĐỘNG CHUYÊN MÔN
    {
      content: `1.2. Khởi động chung & chuyên môn:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (thực hiện theo nhịp nhạc hoặc nhịp đếm).`,
      lvd: `2L x 8N\n2 - 3 phút`,
      gv: `- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát.\n- GV di chuyển quan sát, nhắc nhở học sinh xoay đúng biên độ, nhịp nhàng, không làm vội vàng để phòng tránh chấn thương khớp.`,
      hs: `- Đội hình khởi động: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tích cực xoay kỹ các khớp theo nhịp đếm của cán sự, động tác dứt khoát, đúng biên độ và đều đẹp.`,
      contentImgUrl: resolved.khoiDongImg?.url,
      contentImgTitle: resolved.khoiDongImg?.title,
      contentImages: resolved.khoiDongImg?.url
        ? [{ id: 'img_kd_chung_1', url: resolved.khoiDongImg.url, title: resolved.khoiDongImg.title }]
        : [],
      hsImgUrl: diagKhoiDong.svgDataUrl,
      hsImgTitle: diagKhoiDong.name,
      hsImages: [
        {
          id: 'diag_2_khoi_dong',
          url: diagKhoiDong.svgDataUrl,
          title: diagKhoiDong.name
        }
      ]
    },

    // 3. TRÒ CHƠI BỔ TRỢ KHỞI ĐỘNG (Chỉ thêm khi SGK có trò chơi khởi động hoặc GV tự bổ sung)
    ...(resolvedWarmup
      ? [
          {
            content: `1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}":\n- Mục đích: Tạo phản xạ nhanh nhẹn, tinh thần sảng khoái và hưng phấn trước khi vào nội dung chính.\n- Luật chơi: Học sinh thực hiện nhanh theo hiệu lệnh của GV, ai làm sai sẽ thực hiện động tác phạt vui nhộn.`,
            lvd: `2 - 3 phút\n1 - 2 lượt`,
            gv: `- GV nêu tên trò chơi khởi động "${resolvedWarmup}", phổ biến ngắn gọn luật chơi và cách chơi.\n- Hô hiệu lệnh điều hành học sinh tham gia trò chơi tạo không khí sôi nổi, vui tươi trước khi vào phần trọng tâm.`,
            hs: `- Học sinh chăm chú lắng nghe hướng dẫn luật chơi, hào hứng tham gia trò chơi theo khẩu lệnh của giáo viên.\n- Chấp hành nghiêm túc hiệu lệnh, di chuyển nhanh nhẹn, vui tươi, trật tự.`,
            contentImgUrl: warmupImg?.url || undefined,
            contentImgTitle: warmupImg?.title || undefined,
            contentImages: warmupImg?.url
              ? [{ id: 'img_tc_kd_1', url: warmupImg.url, title: warmupImg.title }]
              : [],
            hsImgUrl: diagWarmupGame.svgDataUrl,
            hsImgTitle: diagWarmupGame.name,
            hsImages: [
              {
                id: 'diag_3_tc_kd',
                url: diagWarmupGame.svgDataUrl,
                title: diagWarmupGame.name
              }
            ]
          }
        ]
      : []),

    // 4. HÌNH THÀNH KIẾN THỨC MỚI / HƯỚNG DẪN KIỂM TRA ĐÁNH GIÁ
    {
      content: discoveryHeading,
      lvd: isAssessmentLesson ? `5 - 6 phút` : `6 - 8 phút\n2 - 3 lần`,
      gv: accurate.gvExplanation,
      hs: accurate.hsTask,
      contentImgUrl: accurate.imgUrl,
      contentImgTitle: accurate.imgTitle,
      contentImages:
        accurate.allImages && accurate.allImages.length > 0
          ? accurate.allImages
          : accurate.imgUrl
          ? [{ id: 'img_kt_1', url: accurate.imgUrl, title: accurate.imgTitle }]
          : [],
      hsImgUrl: diagTapMau.svgDataUrl,
      hsImgTitle: diagTapMau.name,
      hsImages: [
        {
          id: 'diag_4_quan_sat',
          url: diagTapMau.svgDataUrl,
          title: diagTapMau.name
        }
      ]
    },

    // 5. LUYỆN TẬP / THỰC HÀNH KIỂM TRA 3.1
    {
      content: practiceRowHeading1,
      lvd: `3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở và biên độ vận động của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và chú trọng ${accurate.practiceFocus}.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.`,
      hs: `- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý giữ đúng biên độ kỹ thuật và tư thế thân người, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.`,
      contentImgUrl: resolved.luyenTapBySlot.dongLoat?.url,
      contentImgTitle: resolved.luyenTapBySlot.dongLoat?.title,
      contentImages: resolved.luyenTapBySlot.dongLoat?.url
        ? [{ id: 'img_lt_dl_1', url: resolved.luyenTapBySlot.dongLoat.url, title: resolved.luyenTapBySlot.dongLoat.title }]
        : [],
      hsImgUrl: diagDongLoat.svgDataUrl,
      hsImgTitle: diagDongLoat.name,
      hsImages: [
        {
          id: 'diag_5_dong_loat',
          url: diagDongLoat.svgDataUrl,
          title: diagDongLoat.name
        }
      ]
    },

    // 6. LUYỆN TẬP / KIỂM TRA THEO TỔ 3.2
    {
      content: practiceRowHeading2,
      lvd: isAssessmentLesson ? `8 - 10 phút\n1 - 2 lượt / HS` : `4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: isAssessmentLesson
        ? `- Điều hành lần lượt từng tổ vào vị trí kiểm tra, giữ trật tự khu vực chờ.\n- Quan sát, đo đạc/chấm điểm chính xác các chỉ số đánh giá; động viên học sinh bình tĩnh thực hiện hết khả năng.`
        : `- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc, chú trọng rèn ${accurate.practiceFocus}.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.`,
      hs: isAssessmentLesson
        ? `- Xếp hàng ngay ngắn chờ đến lượt tổ mình vào kiểm tra.\n- Thực hiện nghiêm túc, đúng quy trình và trung thực khi kiểm tra đánh giá.`
        : `- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.`,
      contentImgUrl: (resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg)?.url,
      contentImgTitle: (resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg)?.title,
      contentImages: (resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg)?.url
        ? [{ id: 'img_lt_1', url: (resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg)!.url, title: (resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg)!.title }]
        : [],
      hsImgUrl: diagToNhom.svgDataUrl,
      hsImgTitle: diagToNhom.name,
      hsImages: [
        {
          id: 'diag_6_to_nhom',
          url: diagToNhom.svgDataUrl,
          title: diagToNhom.name
        }
      ]
    },

    // 7. LUYỆN TẬP / KIỂM TRA BỔ SUNG 3.3
    {
      content: practiceRowHeading3,
      lvd: isAssessmentLesson ? `3 - 4 phút\nlượt bổ sung` : `3 - 4 phút\n1 - 2 lần\nđổi vai`,
      gv: isAssessmentLesson
        ? `- Tổ chức kiểm tra bổ sung cho các học sinh có nhu cầu nâng mức thành tích hoặc chưa hoàn thành lượt 1; nhắc các em đã kiểm tra xong giữ trật tự và hít thở hồi phục.`
        : `- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ xem bạn mình đã thực hiện chuẩn ${accurate.practiceFocus} hay chưa; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.`,
      hs: isAssessmentLesson
        ? `- Các bạn kiểm tra lại tập trung thực hiện tốt hơn ở lượt 2; các bạn khác thả lỏng nhẹ và cổ vũ bạn.`
        : `- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.`,
      contentImgUrl: resolved.luyenTapBySlot.capDoi?.url,
      contentImgTitle: resolved.luyenTapBySlot.capDoi?.title,
      contentImages: resolved.luyenTapBySlot.capDoi?.url
        ? [{ id: 'img_lt_cd_1', url: resolved.luyenTapBySlot.capDoi.url, title: resolved.luyenTapBySlot.capDoi.title }]
        : [],
      hsImgUrl: diagCapDoi.svgDataUrl,
      hsImgTitle: diagCapDoi.name,
      hsImages: [
        {
          id: 'diag_7_cap_doi',
          url: diagCapDoi.svgDataUrl,
          title: diagCapDoi.name
        }
      ]
    },

    // 8. THI ĐUA / TỔNG HỢP KẾT QUẢ 3.4
    {
      content: practiceRowHeading4,
      lvd: `3 - 4 phút\n1 lượt / tổ`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- GV ghi nhận ưu điểm, sửa lỗi còn tồn tại và tuyên dương tổ thực hiện đều đẹp, đúng nhịp.`,
      hs: `- Đội hình thi đua: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Từng tổ lên biểu diễn tự tin, thực hiện đúng động tác theo nhịp hô dứt khoát của tổ trưởng.`,
      contentImgUrl: undefined,
      contentImgTitle: undefined,
      contentImages: [],
      hsImgUrl: diagThiDua.svgDataUrl,
      hsImgTitle: diagThiDua.name,
      hsImages: [
        {
          id: 'diag_8_thi_dua',
          url: diagThiDua.svgDataUrl,
          title: diagThiDua.name
        }
      ]
    },

    // 9. LUYỆN TẬP: 3.5. TRÒ CHƠI VẬN ĐỘNG (Chỉ thêm khi SGK có trò chơi vận động hoặc GV tự bổ sung)
    ...(resolvedPractice
      ? [
          {
            content: `3.5. Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đoàn kết.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
            lvd: `4 - 5 phút\n2 - 3 lượt`,
            gv: `- GV giới thiệu tên trò chơi vận động "${resolvedPractice}", giải thích mục đích, phổ biến luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm học sinh làm mẫu thao tác tham gia trò chơi để cả lớp nắm rõ quy trình.\n- Điều hành 4 đội thi đấu chính thức 2 - 3 lượt sôi nổi; nhắc nhở học sinh giữ cự ly an toàn tuyệt đối khi tiếp sức.\n- Nhận xét tinh thần thi đấu, tuyên dương đội chiến thắng và khích lệ các đội còn lại.`,
            hs: `- Học sinh chú ý lắng nghe GV giới thiệu tên trò chơi và phổ biến luật chơi; quan sát nhóm bạn chơi mẫu.\n- Đội hình trò chơi: 4 hàng dọc đứng sau vạch xuất phát, hướng về cọc tiêu.\n- Tham gia thi đấu hào hứng, nhanh nhẹn, đoàn kết, chấp hành nghiêm chỉnh luật chơi và tiếp sức an toàn cho bạn.\n- Cổ vũ nhiệt tình, thể hiện tinh thần thể thao trung thực, chúc mừng đội bạn khi giành chiến thắng.`,
            contentImgUrl: practiceImg?.url || undefined,
            contentImgTitle: practiceImg?.title || undefined,
            contentImages: practiceImg?.url ? [{ id: 'img_tc_1', url: practiceImg.url, title: practiceImg.title }] : [],
            hsImgUrl: diagTroChoi.svgDataUrl,
            hsImgTitle: diagTroChoi.name,
            hsImages: [
              {
                id: 'diag_9_tro_choi',
                url: diagTroChoi.svgDataUrl,
                title: diagTroChoi.name
              }
            ]
          }
        ]
      : []),

    // 10. HỒI TĨNH (HÀNG RIÊNG)
    {
      content: `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng toàn thân, cúi người rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi để cơ thể hồi phục.`,
      lvd: `2 - 3 phút\n1 - 2 lần`,
      gv: `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ mềm tay, rung thả lỏng đùi và chân, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n- Nhắc học sinh thả lỏng tự nhiên, không gồng cứng cơ thể.`,
      hs: `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n- Rũ tay, thả lỏng bắp chân nhịp nhàng, cảm nhận cơ thể hồi phục sảng khoái.`,
      hsImgUrl: diagHoiTinh.svgDataUrl,
      hsImgTitle: diagHoiTinh.name,
      hsImages: [
        {
          id: 'diag_10_hoi_tinh',
          url: diagHoiTinh.svgDataUrl,
          title: diagHoiTinh.name
        }
      ]
    },

    // 11. VẬN DỤNG, NHẬN XÉT & DẶN DÒ (HÀNG RIÊNG)
    {
      content: appDetails.fullContentText,
      lvd: `2 - 3 phút`,
      gv: appDetails.fullGvText,
      hs: appDetails.fullHsText,
      contentImgUrl: resolved.vanDungImg?.url,
      contentImgTitle: resolved.vanDungImg?.title,
      contentImages: resolved.vanDungImg?.url
        ? [{ id: 'img_vd_1', url: resolved.vanDungImg.url, title: resolved.vanDungImg.title }]
        : [],
      hsImgUrl: diagXuongLop.svgDataUrl,
      hsImgTitle: diagXuongLop.name,
      hsImages: [
        {
          id: 'diag_11_ket_thuc',
          url: diagXuongLop.svgDataUrl,
          title: diagXuongLop.name
        }
      ]
    }
  ];

  if (typeof week === 'number' && week >= 1 && week <= 35) {
    return applyOfficialIntegrationsToLessonRows(generatedRows, grade, week, period, title);
  }

  return generatedRows;
}

/**
 * Takes any existing lesson rows (e.g. 5 or 7 rows) and splits merged activities into 1:1 horizontally aligned rows,
 * ensuring that every single sub-activity (especially games with their pictures and rules) stands on its OWN row
 * and every classified asset goes strictly to its matching slot.
 */
export function splitAndAlignRows1to1(
  rows: LessonRow[],
  grade: number = 1,
  title: string = '',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): LessonRow[] {
  // If already 9 or more rows (granular 1:1 layout with or without optional 1.3/3.5 game rows),
  // strip any legacy fabricated game rows, sanitize misplaced attachments, compact overlong 2.1 rows, and clean Vận dụng 4.2 text
  if (rows && rows.length >= 9) {
    return sanitizePlanRowsVanDung(
      stripFabricatedGameRows(rows).map((r) => compactOverlongKnowledgeRow(sanitizeRowColumn1Media(r, grade, title))),
      grade
    );
  }

  // Create clean 1:1 granular rows using deterministic 6-slot resolver
  const granular11 = createBalancedGranularLessonRows(grade, title, userImages, customWarmupGame, customPracticeGame);

  if (!rows || rows.length === 0) {
    return granular11;
  }

  // Strictly match each source row by explicit section heading and reject .svg files, cross-grade non-game images, or mismatched games
  const isValidCarryOver = (targetRow: LessonRow, srcUrl?: string, srcTitle?: string) =>
    Boolean(
      srcUrl &&
        !isSvgImageUrl(srcUrl) &&
        !isInvalidColumn1AttachmentForRow(targetRow.content, srcUrl, srcTitle, grade, title)
    );
  const isTitleGame = (t?: string) =>
    /trò\s*chơi|chui\s*qua|hiệu\s*lệnh|kết\s*bạn|lò\s*cò|mèo\s*đuổi|chim\s*về\s*tổ|đua\s*ô\s*tô/i.test((t || '').toLowerCase());

  const findTargetRow = (pred: (cLower: string) => boolean) =>
    granular11.find((r) => pred((r.content || '').toLowerCase()));

  const rowKhoiDong = findTargetRow((c) => c.includes('1.2.') && !c.includes('1.3.'));
  const rowWarmupGame = findTargetRow((c) => c.includes('1.3.'));
  const rowMovement = findTargetRow((c) => c.includes('2.1.') || c.includes('2. hoạt động'));
  const rowPractice = findTargetRow((c) => c.includes('3.2.'));
  const rowPracticeGame = findTargetRow((c) => c.includes('3.5.'));
  const rowVanDung = findTargetRow((c) => c.includes('4.2.') && !c.includes('4.1.'));

  // Slot 1.2 (Khởi động chung)
  const srcKhoiDong = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    return c.includes('1.2.') && !c.includes('1.3.') && rowKhoiDong && isValidCarryOver(rowKhoiDong, r.contentImgUrl, r.contentImgTitle) && !isTitleGame(r.contentImgTitle);
  });
  if (srcKhoiDong?.contentImgUrl && rowKhoiDong && !rowKhoiDong.contentImgUrl) {
    rowKhoiDong.contentImgUrl = srcKhoiDong.contentImgUrl;
    rowKhoiDong.contentImgTitle = srcKhoiDong.contentImgTitle;
    rowKhoiDong.contentImages = (srcKhoiDong.contentImages || [
      { id: 'custom_kd_chung', url: srcKhoiDong.contentImgUrl, title: srcKhoiDong.contentImgTitle || 'Ảnh khởi động' }
    ]).filter((it) => isValidCarryOver(rowKhoiDong, it.url, it.title));
  }

  // Slot 1.3 (Trò chơi khởi động — only if target lesson has 1.3)
  const srcWarmupGame = rows.find((r, i) => {
    const c = (r.content || '').toLowerCase();
    return (c.includes('1.3.') || (i === 0 && c.includes('trò chơi') && c.includes('khởi động'))) && rowWarmupGame && isValidCarryOver(rowWarmupGame, r.contentImgUrl, r.contentImgTitle);
  });
  if (srcWarmupGame?.contentImgUrl && rowWarmupGame && !rowWarmupGame.contentImgUrl) {
    rowWarmupGame.contentImgUrl = srcWarmupGame.contentImgUrl;
    rowWarmupGame.contentImgTitle = srcWarmupGame.contentImgTitle;
    rowWarmupGame.contentImages = (srcWarmupGame.contentImages || [
      { id: 'custom_tckd', url: srcWarmupGame.contentImgUrl, title: srcWarmupGame.contentImgTitle || 'Ảnh trò chơi khởi động' }
    ]).filter((it) => isValidCarryOver(rowWarmupGame, it.url, it.title));
  }

  // Slot 2.1 (Kỹ thuật động tác mới) — strictly reject warmup/game/practice/cooldown/cross-grade/.svg rows
  const srcMovement = rows.find((r, i) => {
    const c = (r.content || '').toLowerCase();
    const isMovRow =
      c.includes('2.1.') ||
      c.includes('2. hoạt động hình thành') ||
      c.includes('khám phá') ||
      c.includes('kiến thức mới') ||
      (rows.length <= 7 && i === 1);
    return isMovRow && rowMovement && isValidCarryOver(rowMovement, r.contentImgUrl, r.contentImgTitle) && !isTitleGame(r.contentImgTitle);
  });
  if (srcMovement?.contentImgUrl && rowMovement && !rowMovement.contentImgUrl) {
    const validMovImgs = (srcMovement.contentImages || [
      { id: 'custom_mov', url: srcMovement.contentImgUrl, title: srcMovement.contentImgTitle || 'Ảnh động tác' }
    ]).filter((it) => isValidCarryOver(rowMovement, it.url, it.title) && !/^ôn\s*tập\s*:/i.test((it.title || '').trim()));
    if (validMovImgs.length > 0) {
      rowMovement.contentImgUrl = validMovImgs[0].url;
      rowMovement.contentImgTitle = validMovImgs[0].title;
      rowMovement.contentImages = validMovImgs;
    }
  }

  // Slot 3.2 (Luyện tập)
  const srcPractice = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    return (c.includes('3.2.') || c.includes('3.1.') || c.includes('3.3.')) && !c.includes('trò chơi') && rowPractice && isValidCarryOver(rowPractice, r.contentImgUrl, r.contentImgTitle);
  });
  if (srcPractice?.contentImgUrl && rowPractice && !rowPractice.contentImgUrl) {
    rowPractice.contentImgUrl = srcPractice.contentImgUrl;
    rowPractice.contentImgTitle = srcPractice.contentImgTitle;
    rowPractice.contentImages = (srcPractice.contentImages || [
      { id: 'custom_lt', url: srcPractice.contentImgUrl, title: srcPractice.contentImgTitle || 'Ảnh luyện tập' }
    ]).filter((it) => isValidCarryOver(rowPractice, it.url, it.title));
  }

  // Slot 3.5 (Trò chơi vận động — only if target lesson has 3.5)
  const srcPracticeGame = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    const isGameRow =
      c.includes('3.5.') ||
      (c.includes('trò chơi') && (c.includes('vận động') || c.includes('3.4'))) ||
      r.contentImgTitle?.toLowerCase().includes('trò chơi');
    return isGameRow && rowPracticeGame && isValidCarryOver(rowPracticeGame, r.contentImgUrl, r.contentImgTitle);
  });
  if (srcPracticeGame?.contentImgUrl && rowPracticeGame && !rowPracticeGame.contentImgUrl) {
    rowPracticeGame.contentImgUrl = srcPracticeGame.contentImgUrl;
    rowPracticeGame.contentImgTitle = srcPracticeGame.contentImgTitle;
    rowPracticeGame.contentImages = (srcPracticeGame.contentImages || [
      { id: 'custom_game', url: srcPracticeGame.contentImgUrl, title: srcPracticeGame.contentImgTitle || 'Ảnh trò chơi vận động' }
    ]).filter((it) => isValidCarryOver(rowPracticeGame, it.url, it.title));
  }

  // Slot 4.2 (Vận dụng)
  const srcVanDung = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    const isCooldownOnly = (c.includes('4.1') || c.includes('hồi tĩnh')) && !c.includes('4.2');
    return !isCooldownOnly && (c.includes('4.2.') || c.includes('vận dụng')) && rowVanDung && isValidCarryOver(rowVanDung, r.contentImgUrl, r.contentImgTitle);
  });
  if (srcVanDung?.contentImgUrl && rowVanDung && !rowVanDung.contentImgUrl) {
    rowVanDung.contentImgUrl = srcVanDung.contentImgUrl;
    rowVanDung.contentImgTitle = srcVanDung.contentImgTitle;
    rowVanDung.contentImages = (srcVanDung.contentImages || [
      { id: 'custom_vd', url: srcVanDung.contentImgUrl, title: srcVanDung.contentImgTitle || 'Ảnh vận dụng' }
    ]).filter((it) => isValidCarryOver(rowVanDung, it.url, it.title));
  }

  return granular11.map((r) => compactOverlongKnowledgeRow(sanitizeRowColumn1Media(r, grade, title)));
}

/**
 * Splits collapsed practice rows into separate 1:1 horizontally aligned rows.
 */
export function splitAndBalanceExistingRows(
  rows: LessonRow[],
  grade: number = 1,
  title: string = '',
  userImages: SgkImageItem[] = []
): LessonRow[] {
  return splitAndAlignRows1to1(rows, grade, title, userImages);
}

/**
 * Automatically creates a new lesson plan based on the Master Template (Tuần 8 Nghĩa Hiệp),
 * generating 11 balanced 1:1 rows strictly aligned across all 6 SGK folders.
 */
export function generateNextWeekPlan(
  grade: number,
  week: number,
  lessonNum: number,
  topic: string,
  title: string,
  baseMasterPlan?: MasterPlanItem,
  userImages: SgkImageItem[] = []
): AutoMatchResult {
  const detectedMovements = extractMovementNamesFromTitle(title);
  const newRows = createBalancedGranularLessonRows(grade, title, userImages, undefined, undefined, week, lessonNum);

  const matchedImages = newRows
    .map((r, idx) => ({ rowIdx: idx, col: 'content' as const, title: r.contentImgTitle || '' }))
    .filter((item) => !!item.title);

  const matchedFormations = newRows.map((r, idx) => ({
    rowIdx: idx,
    name: r.hsImgTitle || `Sơ đồ dòng ${idx + 1}`
  }));

  return {
    newRows,
    detectedMovements,
    matchedImages,
    matchedFormations
  };
}

/**
 * Scans the teacher's current image library and automatically attaches appropriate
 * images from all 6 SGK subfolders + accurate formation diagrams into exact 1:1 rows.
 */
export function autoScanLibraryAndAttachToRows(
  rows: LessonRow[],
  userImages: SgkImageItem[],
  grade: number,
  lessonTitle: string
): { updatedRows: LessonRow[]; attachedCount: number; messages: string[] } {
  let attachedCount = 0;
  const messages: string[] = [];
  const resolved = resolveLessonSlotAssets(grade, lessonTitle, '', userImages);
  const effectiveLesson = resolved.effectiveLesson;
  const updatedRows = stripFabricatedGameRows(rows).map((r) => ({ ...r }));

  updatedRows.forEach((row, idx) => {
    // Strictly preserve any row whose media was manually edited/pinned/cleared by the teacher
    if (row.userEditedMedia) {
      return;
    }

    const c = (row.content || '').toLowerCase();
    const isNhanLopRow = c.includes('1.1.') && !c.includes('1.2.') && !c.includes('1.3.');
    const isWarmupGame =
      c.includes('1.3.') ||
      (c.includes('trò chơi') && (c.includes('khởi động') || c.includes('bổ trợ khởi động')));
    const isKhoiDongChung = !isWarmupGame && !isNhanLopRow && (c.includes('1.2.') || (c.includes('khởi động') && !c.includes('trò chơi')));
    const isIntroBlock = isNhanLopRow || (!isWarmupGame && !isKhoiDongChung && (c.includes('1. hoạt động mở đầu') || idx === 0));
    const isKnowledgeRow =
      c.includes('2.1.') ||
      c.includes('2. hoạt động hình thành') ||
      c.includes('khám phá') ||
      c.includes('kiến thức mới');
    const isPracticeGameRow =
      c.includes('3.5.') ||
      (c.includes('trò chơi') && (c.includes('vận động') || c.includes('3.4')));
    const isPracticeTextRow =
      !isPracticeGameRow &&
      (c.includes('3.1.') || c.includes('3.2.') || c.includes('3.3.') || c.includes('3.4.'));
    const hasCooldownText = c.includes('4.1.') || c.includes('4.1 ') || c.includes('hồi tĩnh');
    const isGranularSecondLast = updatedRows.length >= 9 && idx === updatedRows.length - 2;
    const isCooldownOnlyRow =
      hasCooldownText || (isGranularSecondLast && (c.includes('4.2') || c.includes('vận dụng')));
    const isVanDungRow =
      !isCooldownOnlyRow && (c.includes('4.2.') || c.includes('4.2:') || c.includes('vận dụng'));

    if (isIntroBlock) {
      delete row.contentImgUrl;
      delete row.contentImgTitle;
      row.contentImages = [];
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const warmupDiagram = getFormationDiagramForPhaseAndGrade('nhan_lop', grade);
        row.hsImgUrl = warmupDiagram.svgDataUrl;
        row.hsImgTitle = warmupDiagram.name;
        row.hsImages = [{ id: `diag_auto_${idx}`, url: warmupDiagram.svgDataUrl, title: warmupDiagram.name }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Nhận lớp): Gắn "${warmupDiagram.name}"`);
      }
      return;
    }

    if (isKhoiDongChung) {
      if (resolved.khoiDongImg?.url) {
        row.contentImgUrl = resolved.khoiDongImg.url;
        row.contentImgTitle = resolved.khoiDongImg.title;
        row.contentImages = [{ id: `img_kdc_${idx}`, url: resolved.khoiDongImg.url, title: resolved.khoiDongImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Khởi động chung): Gắn "${resolved.khoiDongImg.title}"`);
      } else {
        // Strip any misplaced game photo or SVG formation diagram from 1.2 Khởi động chung
        const sanitized = sanitizeRowColumn1Media(row, grade, lessonTitle);
        row.contentImgUrl = sanitized.contentImgUrl;
        row.contentImgTitle = sanitized.contentImgTitle;
        row.contentImages = sanitized.contentImages;
        if (!row.contentImgUrl) {
          messages.push(`Dòng ${idx + 1} (Khởi động chung): Chưa tìm được ảnh xoay khớp phù hợp trong Thư viện`);
        }
      }
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const kdDiagram = getFormationDiagramForPhaseAndGrade('khoi_dong', grade);
        row.hsImgUrl = kdDiagram.svgDataUrl;
        row.hsImgTitle = kdDiagram.name;
        row.hsImages = [{ id: `diag_kd_${idx}`, url: kdDiagram.svgDataUrl, title: kdDiagram.name }];
      }
      return;
    }

    if (isWarmupGame) {
      const gameMatch = row.content.match(/"([^"]+)"/);
      const gName = (gameMatch ? gameMatch[1] : resolved.warmupGameName || '').trim();
      if (!gName || isFabricatedLegacyGameName(gName)) return;
      const gImg = resolveAccurateGameImage(gName, grade, 'tro_choi_kd', userImages, effectiveLesson);
      if (gImg.url) {
        row.contentImgUrl = gImg.url;
        row.contentImgTitle = gImg.title;
        row.contentImages = [{ id: `img_kd_${idx}`, url: gImg.url, title: gImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Trò chơi khởi động): Gắn "${gImg.title}"`);
      } else {
        const sanitized = sanitizeRowColumn1Media(row, grade, lessonTitle);
        row.contentImgUrl = sanitized.contentImgUrl;
        row.contentImgTitle = sanitized.contentImgTitle;
        row.contentImages = sanitized.contentImages;
        if (!row.contentImgUrl) {
          messages.push(`Dòng ${idx + 1} (Trò chơi khởi động "${gName}"): Chưa tìm được ảnh SGK phù hợp`);
        }
      }
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const wgDiagram = getFormationDiagramByKeyword(gName, 'khoi_dong', grade);
        row.hsImgUrl = wgDiagram.svgDataUrl;
        row.hsImgTitle = wgDiagram.name;
        row.hsImages = [{ id: `diag_tckd_${idx}`, url: wgDiagram.svgDataUrl, title: wgDiagram.name }];
      }
      return;
    }

    if (isKnowledgeRow) {
      const compacted = compactOverlongKnowledgeRow(row);
      row.content = compacted.content;
      const accurate = resolveAccurateMovement(row.content, lessonTitle, grade, userImages);
      if (accurate.imgUrl) {
        row.contentImgUrl = accurate.imgUrl;
        row.contentImgTitle = accurate.imgTitle;
        row.contentImages =
          accurate.allImages && accurate.allImages.length > 0
            ? accurate.allImages
            : [{ id: `img_kt_${idx}`, url: accurate.imgUrl, title: accurate.imgTitle }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Kỹ thuật mới Cột 1): Gắn chính xác "${accurate.imgTitle}"`);
      } else {
        delete row.contentImgUrl;
        row.contentImgTitle = accurate.imgTitle;
        row.contentImages = [];
        messages.push(`Dòng ${idx + 1} (${accurate.movementName}): Chưa xác định được ảnh đúng Khối ${grade} — Cần tìm hình ảnh trong Thư viện`);
      }
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const obsDiagram = getFormationDiagramForPhaseAndGrade('tap_mau', grade);
        row.hsImgUrl = obsDiagram.svgDataUrl;
        row.hsImgTitle = obsDiagram.name;
        row.hsImages = [{ id: `diag_kt_${idx}`, url: obsDiagram.svgDataUrl, title: obsDiagram.name }];
      }
      return;
    }

    if (isPracticeTextRow) {
      // Attach classified exact-lesson Luyện tập image matching each sub-slot (3.1 đồng loạt, 3.2 tổ nhóm, 3.3 cặp đôi)
      // Do NOT auto-inject caNhan practice photo into 3.4. Thi đua trình diễn
      const sanitizedLt = sanitizeRowColumn1Media(row, grade, lessonTitle);
      row.contentImgUrl = sanitizedLt.contentImgUrl;
      row.contentImgTitle = sanitizedLt.contentImgTitle;
      row.contentImages = sanitizedLt.contentImages;

      const isThiDuaRow = c.includes('thi đua') || c.includes('trình diễn');
      const matchedPracticeSubImg = c.includes('3.1.')
        ? resolved.luyenTapBySlot.dongLoat
        : c.includes('3.2.')
        ? resolved.luyenTapBySlot.toNhom || resolved.luyenTapImg
        : c.includes('3.3.')
        ? resolved.luyenTapBySlot.capDoi
        : c.includes('3.4.') && !isThiDuaRow
        ? resolved.luyenTapBySlot.caNhan
        : null;

      if (matchedPracticeSubImg?.url && !row.contentImgUrl && !row.userClearedContentImages) {
        row.contentImgUrl = matchedPracticeSubImg.url;
        row.contentImgTitle = matchedPracticeSubImg.title;
        row.contentImages = [{ id: `img_lt_${idx}`, url: matchedPracticeSubImg.url, title: matchedPracticeSubImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Luyện tập): Gắn "${matchedPracticeSubImg.title}"`);
      }
      if (!row.userClearedHsImages && (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl))) {
        const ltPhase = c.includes('3.1.')
          ? 'dong_loat'
          : c.includes('3.2.')
          ? 'to_nhom'
          : c.includes('3.3.')
          ? 'cap_doi'
          : 'thi_dua';
        const diag = getFormationDiagramForPhaseAndGrade(ltPhase, grade);
        row.hsImgUrl = diag.svgDataUrl;
        row.hsImgTitle = diag.name;
        row.hsImages = [{ id: `diag_lt_${idx}`, url: diag.svgDataUrl, title: diag.name }];
        attachedCount++;
      }
      return;
    }

    if (isPracticeGameRow) {
      const gameMatch = row.content.match(/"([^"]+)"/);
      const gName = (gameMatch ? gameMatch[1] : resolved.practiceGameName || '').trim();
      if (!gName || isFabricatedLegacyGameName(gName)) return;
      const gImg = resolveAccurateGameImage(gName, grade, 'tro_choi_vd', userImages, effectiveLesson);
      if (gImg.url) {
        row.contentImgUrl = gImg.url;
        row.contentImgTitle = gImg.title;
        row.contentImages = [{ id: `img_vd_${idx}`, url: gImg.url, title: gImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Trò chơi vận động): Gắn "${gImg.title}"`);
      } else {
        const sanitized = sanitizeRowColumn1Media(row, grade, lessonTitle);
        row.contentImgUrl = sanitized.contentImgUrl;
        row.contentImgTitle = sanitized.contentImgTitle;
        row.contentImages = sanitized.contentImages;
        if (!row.contentImgUrl) {
          messages.push(`Dòng ${idx + 1} (Trò chơi vận động "${gName}"): Chưa tìm được ảnh SGK phù hợp`);
        }
      }
      const matchedDiagram = getFormationDiagramByKeyword(row.content, 'tro_choi', grade);
      row.hsImgUrl = matchedDiagram.svgDataUrl;
      row.hsImgTitle = matchedDiagram.name;
      row.hsImages = [{ id: `diag_tc_${idx}`, url: matchedDiagram.svgDataUrl, title: matchedDiagram.name }];
      attachedCount++;
      return;
    }

    if (isVanDungRow) {
      const sanitizedRow = sanitizeVanDungRow(sanitizeRowColumn1Media(row, grade, lessonTitle));
      row.content = sanitizedRow.content;
      row.gv = sanitizedRow.gv;
      row.hs = sanitizedRow.hs;
      row.contentImgUrl = sanitizedRow.contentImgUrl;
      row.contentImgTitle = sanitizedRow.contentImgTitle;
      row.contentImages = sanitizedRow.contentImages;

      if (resolved.vanDungImg?.url && !row.contentImgUrl) {
        row.contentImgUrl = resolved.vanDungImg.url;
        row.contentImgTitle = resolved.vanDungImg.title;
        row.contentImages = [{ id: `img_vd_app_${idx}`, url: resolved.vanDungImg.url, title: resolved.vanDungImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Vận dụng SGK): Gắn "${resolved.vanDungImg.title}"`);
      }
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const endDiagram = getFormationDiagramForPhaseAndGrade('xuong_lop', grade);
        row.hsImgUrl = endDiagram.svgDataUrl;
        row.hsImgTitle = endDiagram.name;
        row.hsImages = [{ id: `diag_vd_end_${idx}`, url: endDiagram.svgDataUrl, title: endDiagram.name }];
      }
      return;
    }

    if (isCooldownOnlyRow) {
      delete row.contentImgUrl;
      delete row.contentImgTitle;
      row.contentImages = [];
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
        const cooldownDiagram = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);
        row.hsImgUrl = cooldownDiagram.svgDataUrl;
        row.hsImgTitle = cooldownDiagram.name;
        row.hsImages = [{ id: `diag_ht_${idx}`, url: cooldownDiagram.svgDataUrl, title: cooldownDiagram.name }];
        attachedCount++;
      }
    }
  });

  return {
    updatedRows,
    attachedCount,
    messages
  };
}

/**
 * Detects the pedagogical formation phase for a lesson row based on its heading text.
 */
export function detectFormationPhaseFromRowContent(content: string): FormationDiagram['phase'] {
  const c = (content || '').toLowerCase();
  if (c.includes('1.1') || (c.includes('nhận lớp') && !c.includes('1.2'))) return 'nhan_lop';
  if (c.includes('1.2') || (c.includes('khởi động') && !c.includes('1.3'))) return 'khoi_dong';
  if (c.includes('1.3') || (c.includes('trò chơi') && c.includes('khởi động'))) return 'khoi_dong';
  if (c.includes('2.1') || c.includes('khám phá') || c.includes('hình thành kiến thức')) return 'tap_mau';
  if (c.includes('3.1') || c.includes('đồng loạt')) return 'dong_loat';
  if (c.includes('3.2') || c.includes('theo tổ')) return 'to_nhom';
  if (c.includes('3.3') || c.includes('cặp đôi')) return 'cap_doi';
  if (c.includes('3.5') || (c.includes('trò chơi') && !c.includes('khởi động'))) return 'tro_choi';
  if (c.includes('3.4') || c.includes('thi đua') || c.includes('trình diễn')) return 'thi_dua';
  if (c.includes('4.1') || c.includes('hồi tĩnh')) return 'hoi_tinh';
  if (c.includes('4.2') || c.includes('4.3') || c.includes('vận dụng') || c.includes('xuống lớp')) return 'xuong_lop';
  return 'dong_loat';
}

function isUserCustomDiagramRow(row: LessonRow): boolean {
  const ids = (row.hsImages || []).map((i) => i.id || '').join(' ');
  const title = (row.hsImgTitle || '').toLowerCase();
  return (
    ids.includes('custom_') ||
    ids.includes('dh_custom_') ||
    ids.includes('ai_') ||
    title.startsWith('sơ đồ ai:')
  );
}

/**
 * Upgrades empty or legacy shared Column 4 SVG diagrams on a lesson's rows
 * to grade-specific diagrams (Khối 1, 2, 3, 4, 5) while strictly preserving
 * user-drawn Studio / AI diagrams unless `forceUpgrade` is used on standard rows.
 */
export function applyGradeDistinctFormationsToRows(
  rows: LessonRow[],
  grade: number,
  forceUpgrade: boolean = false
): LessonRow[] {
  return rows.map((row) => {
    // Strictly preserve any row whose media was manually edited, cleared, or pinned by the teacher
    if (
      !forceUpgrade &&
      (row.userEditedMedia ||
        row.userClearedHsImages ||
        (row.hsImages || []).some((img) => Boolean(img.userPinned)))
    ) {
      return row;
    }

    const phase = detectFormationPhaseFromRowContent(row.content);
    const shouldUpgrade =
      !row.hsImgUrl ||
      isLegacySharedStandardFormationUrl(row.hsImgUrl) ||
      (forceUpgrade && !isUserCustomDiagramRow(row));

    if (!shouldUpgrade) return row;

    const cLower = (row.content || '').toLowerCase();
    const isWarmupGame = cLower.includes('1.3') || (cLower.includes('trò chơi') && cLower.includes('khởi động'));
    const nextDiag =
      phase === 'tro_choi' || isWarmupGame
        ? getFormationDiagramByKeyword(row.content || '', phase === 'tro_choi' ? 'tro_choi' : 'khoi_dong', grade)
        : getFormationDiagramForPhaseAndGrade(phase, grade);

    return {
      ...row,
      hsImgUrl: nextDiag.svgDataUrl,
      hsImgTitle: nextDiag.name,
      hsImages: [
        {
          id: `diag_g${grade}_${phase}`,
          url: nextDiag.svgDataUrl,
          title: nextDiag.name
        }
      ]
    };
  });
}
