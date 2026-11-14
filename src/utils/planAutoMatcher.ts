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
  findSgkLessonByPage
} from '../data/sgkCurriculumTree';

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
    'Đổi chân khi đi đều sai nhịp',
    'Động tác Đi đều, Đứng lại',
    'Đi đều, Đứng lại',
    'Đi đều vòng phải',
    'Đi đều vòng trái'
  ];

  const matches: Array<{ name: string; index: number }> = [];
  for (const km of knownMovements) {
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
    'đội nào nhanh nhất'
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
 * Checks if a Column 1 media attachment (url + title) violates slot classification rules:
 * - SVG formation diagrams ("SƠ ĐỒ: ..." or data:image/svg+xml) must NEVER sit in Column 1 as textbook images
 * - Game photos must NEVER sit in 1.2 (Khởi động chung) or 2.1 (Động tác kỹ thuật)
 * - Cross-grade static URLs (/k1_ in Grade 3/5, /k3_ in Grade 1/5, /k5_ in Grade 1/3) are invalid
 * - Game images for a different named game are invalid in 1.3 or 3.5
 */
export function isInvalidColumn1AttachmentForRow(
  rowContent: string,
  imgUrl: string | undefined,
  imgTitle: string | undefined,
  grade: number,
  lessonTitle: string = ''
): boolean {
  if (!imgUrl) return false;
  const uLower = imgUrl.toLowerCase();
  const cLower = (rowContent || '').toLowerCase();
  const tNorm = (imgTitle || '').toLowerCase().replace(/["'“”‘’]/g, '');

  // 1. Strictly ban SVG formation diagrams AND the mislabeled JPG that actually depicts "SƠ ĐỒ: TẬP LUYỆN ĐỒNG LOẠT"
  if (
    uLower.startsWith('data:image/svg+xml') ||
    uLower.includes('k3_tro_choi_tam_giac.jpg') ||
    tNorm.includes('sơ đồ:') ||
    tNorm.startsWith('sơ đồ ') ||
    tNorm.startsWith('đội hình ')
  ) {
    return true;
  }

  // Ban known mislabeled static files from wrong categories:
  // - k3_on_di_deu_doi_chan.jpg is actually "Trò chơi Ai kéo khoẻ hơn" (must not appear in 1.2 or 2.1 Đi đều)
  // - k1_tro_choi_tho.jpg is actually "Luyện tập cặp đôi" (must not appear in 1.3 or 3.5 game rows)
  // - k5_chuyen_gay_tiep_suc.jpg is actually "Luyện tập nhóm" (must not appear in 1.3 or 3.5 game rows)
  if (uLower.includes('k3_on_di_deu_doi_chan.jpg') && !cLower.includes('ai kéo')) {
    return true;
  }
  if (
    (uLower.includes('k1_tro_choi_tho.jpg') || uLower.includes('k5_chuyen_gay_tiep_suc.jpg')) &&
    (cLower.includes('1.3.') || cLower.includes('3.5.') || cLower.includes('trò chơi'))
  ) {
    return true;
  }

  // 2. Ban cross-grade static paths
  if (grade === 3 && uLower.includes('/sgk_images/k1_')) return true;
  if (grade === 5 && (uLower.includes('/sgk_images/k1_') || uLower.includes('/sgk_images/k3_'))) return true;
  if (grade === 1 && (uLower.includes('/sgk_images/k3_') || uLower.includes('/sgk_images/k5_'))) return true;

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

  // 3. 1.2 Khởi động chung MUST NEVER hold game photos
  if (isKhoiDongChungRow && gameTitlePattern.test(tNorm)) {
    return true;
  }

  // 4. 2.1 Khám phá kiến thức mới MUST NEVER hold game photos (or Bài thể dục in Assessment week)
  if (isKnowledgeRow) {
    if (gameTitlePattern.test(tNorm)) return true;
    const isAssessment = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(`${lessonTitle} ${rowContent}`);
    if (isAssessment && (tNorm.includes('vươn thở') || uLower.includes('vuon_tho'))) return true;
  }

  // 5. 1.3 or 3.5 Game rows: if row explicitly names a game in quotes, ensure attachment doesn't name a completely different game
  if (isWarmupGameRow || isPracticeGameRow) {
    const qMatch = (rowContent || '').match(/[""“']([^""”']+)[""”']/);
    if (qMatch && qMatch[1] && tNorm.length > 0) {
      const targetGameClean = qMatch[1]
        .toLowerCase()
        .replace(/trò\s*chơi(?:\s+bổ\s*trợ)?(?:\s+khởi\s*động|\s+vận\s*động)?/gi, '')
        .replace(/["'“”‘’]/g, '')
        .trim();
      const targetWords = targetGameClean.split(/\s+/).filter((w) => w.length >= 2);
      const stopWords = new Set(['trò', 'chơi', 'khởi', 'động', 'vận', 'sgk', 'lớp', 'trang', 'theo', 'của']);
      const significantWords = targetWords.filter((w) => !stopWords.has(w));
      if (significantWords.length >= 2) {
        const matchCount = significantWords.filter((w) => tNorm.includes(w)).length;
        const isGenericPlaceHolder = tNorm.includes('sơ đồ') || (tNorm.includes('tam giác') && !targetGameClean.includes('tam giác'));
        if (isGenericPlaceHolder || matchCount === 0) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Sanitizes Column 1 attachments of a single LessonRow, removing misplaced SVG diagrams,
 * warm-up games sitting in 1.2, cross-grade defaults, or mismatched game photos.
 */
export function sanitizeRowColumn1Media(
  row: LessonRow,
  grade: number,
  lessonTitle: string = ''
): LessonRow {
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
    (item) => item.url && !isInvalidColumn1AttachmentForRow(row.content, item.url, item.title || row.contentImgTitle, grade, lessonTitle)
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
    url: '/assets/sgk_chuan/k1_phoi_hop.svg',
    title: 'Động tác Phối hợp - SGK GDTC Lớp 1 (Trang 50)'
  },
  dieu_hoa: {
    url: '/assets/sgk_chuan/k1_dieu_hoa.svg',
    title: 'Động tác Điều hòa - SGK GDTC Lớp 1 (Trang 51)'
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
    title: 'Động tác Nhảy với gậy - Cần bóc tách từ SGK Lớp 5 (Trang 34)'
  },
  dieu_hoa_gay: {
    url: '',
    title: 'Động tác Điều hòa với gậy - Cần bóc tách từ SGK Lớp 5 (Trang 35)'
  },
  nhay: {
    url: '',
    title: 'Động tác Nhảy - Cần bóc tách từ SGK'
  },
  thang_bang: {
    url: '/assets/aistudio/0e0e03fc-7060-481d-85f2-da82dde1f3c3_eccfceae.jfif',
    title: 'Động tác Thăng bằng - SGK Lớp 1'
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
    key = grade === 5 ? 'toan_than_gay' : 'phoi_hop';
    cleanName = grade === 5 ? 'Động tác Toàn thân với gậy' : 'Động tác Phối hợp';
  } else if (lower.includes('điều hòa') || lower.includes('điều hoà') || lower.includes('dieu hoa')) {
    key = grade === 5 ? 'dieu_hoa_gay' : 'dieu_hoa';
    cleanName = grade === 5 ? 'Động tác Điều hòa với gậy' : 'Động tác Điều hòa';
  } else if (lower.includes('vươn thở') || lower.includes('vuon tho')) {
    key = grade === 5 ? 'vuon_tho_tay_gay' : 'vuon_tho';
    cleanName = grade === 5 ? 'Động tác Vươn thở với gậy' : 'Động tác Vươn thở';
  } else if (lower.includes('tay')) {
    key = grade === 5 ? 'vuon_tho_tay_gay' : 'tay';
    cleanName = grade === 5 ? 'Động tác Tay với gậy' : 'Động tác Tay';
  } else if (lower.includes('chân') || lower.includes('chan')) {
    key = grade === 5 ? 'chan_gay' : 'chan';
    cleanName = grade === 5 ? 'Động tác Chân với gậy' : 'Động tác Chân';
  } else if (lower.includes('lườn') || lower.includes('luon')) {
    key = 'luon';
    cleanName = 'Động tác Lườn';
  } else if (lower.includes('bụng') || lower.includes('bung')) {
    key = grade === 5 ? 'bung_gay' : 'bung';
    cleanName = grade === 5 ? 'Động tác Bụng với gậy' : 'Động tác Bụng';
  } else if (lower.includes('vặn mình') || lower.includes('van minh')) {
    key = grade === 5 ? 'van_minh_gay' : 'van_minh';
    cleanName = grade === 5 ? 'Động tác Vặn mình với gậy' : 'Động tác Vặn mình';
  } else if (lower.includes('toàn thân') || lower.includes('toan than')) {
    key = grade === 5 ? 'toan_than_gay' : 'toan_than';
    cleanName = grade === 5 ? 'Động tác Toàn thân với gậy' : 'Động tác Toàn thân';
  } else if (lower.includes('nhảy') || lower.includes('nhay')) {
    key = grade === 5 ? 'nhay_gay' : 'nhay';
    cleanName = grade === 5 ? 'Động tác Nhảy với gậy' : 'Động tác Nhảy';
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

  // Strictly filter candidate images: non-empty URL, NOT a game, strictly 'kyThuat' subfolder, strictly SAME grade
  const technicalOnlyImages = userImages.filter((img) => {
    if (!img.imgUrl) return false;
    if (isGameImage(img)) return false;
    if (getImageEffectiveSubFolder(img) !== 'kyThuat') return false;
    if (String(img.grade) !== String(grade)) return false;
    return true;
  });

  // Match movement strictly against img.title (never let lesson summaries in caption/lessonTitle cross-pollute!)
  const matchesMovementByTitle = (text: string, checkKey: string): boolean => {
    if (!text) return false;
    if (checkKey === 'vuon_tho') return (text.includes('vươn thở') || text.includes('vuon tho')) && !text.includes('gậy');
    if (checkKey === 'tay') return (text.includes('động tác tay') || /\btay\b/i.test(text)) && !text.includes('cổ tay') && !text.includes('gậy');
    if (checkKey === 'chan') return (text.includes('động tác chân') || /\bchân\b/i.test(text)) && !text.includes('cổ chân') && !text.includes('vươn thở') && !text.includes('gậy');
    if (checkKey === 'luon') return (text.includes('lườn') || text.includes('luon')) && !text.includes('gậy');
    if (checkKey === 'bung') return (text.includes('bụng') || text.includes('bung')) && !text.includes('gậy');
    if (checkKey === 'van_minh') return (text.includes('vặn mình') || text.includes('van minh')) && !text.includes('gậy');
    if (checkKey === 'toan_than') return (text.includes('toàn thân') || text.includes('toan than')) && !text.includes('gậy');
    if (checkKey === 'phoi_hop') return (text.includes('phối hợp') || text.includes('phoi hop') || text.includes('k1_phoi_hop')) && !text.includes('gậy');
    if (checkKey === 'dieu_hoa') return (text.includes('điều hòa') || text.includes('điều hoà') || text.includes('dieu hoa') || text.includes('k1_dieu_hoa')) && !text.includes('gậy');
    if (checkKey === 'nhay') return (text.includes('động tác nhảy') || /\bnhảy\b/i.test(text) || /\bnhay\b/i.test(text)) && !text.includes('gậy') && !text.includes('lò cò');
    if (checkKey === 'chan_gay') return (text.includes('chân') || text.includes('chan')) && text.includes('gậy');
    if (checkKey === 'bung_gay') return (text.includes('bụng') || text.includes('bung')) && text.includes('gậy');
    if (checkKey === 'van_minh_gay') return (text.includes('vặn mình') || text.includes('van minh')) && text.includes('gậy');
    if (checkKey === 'toan_than_gay') return (text.includes('toàn thân') || text.includes('toan than')) && text.includes('gậy');
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

  const baseKey = key.replace(/_gay$/, '');
  const scoreTechnicalCandidate = (img: SgkImageItem): number => {
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
      ((grade === 1 && (authenticEntry.url.includes('/k1_') || authenticEntry.title.includes('Lớp 1'))) ||
        (grade === 3 && (authenticEntry.url.includes('/k3_') || authenticEntry.title.includes('Lớp 3'))) ||
        (grade === 5 && (authenticEntry.url.includes('/k5_') || authenticEntry.title.includes('Lớp 5'))))
  );

  if (bestImg && bestImg.imgUrl && !bestImg.imgUrl.startsWith('data:image/svg+xml')) {
    resolvedImgUrl = bestImg.imgUrl;
    resolvedImgTitle = bestImg.title;
  } else if (authenticMatchesGrade && authenticEntry) {
    resolvedImgUrl = authenticEntry.url;
    resolvedImgTitle = authenticEntry.title;
  } else {
    resolvedImgUrl = '';
    resolvedImgTitle = movementLesson
      ? `Chưa tìm được ảnh SGK Khối ${grade} (Trang ${movementLesson.startPage}-${movementLesson.endPage}): ${cleanName}`
      : `Chưa tìm được ảnh SGK Khối ${grade} trong Thư viện: ${cleanName}`;
  }

  let steps = '';
  let gv = '';
  let hs = '';
  let practiceFocus = '';

  switch (key) {
    case 'phoi_hop':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái ra trước chếch sang trái một bước, khuỵu gối chân trước, chân sau thẳng, đồng thời hai tay đưa ra trước chếch lên cao chữ V, lòng bàn tay hướng vào nhau, ngửa đầu, mắt nhìn theo tay (hít vào).\n- Nhịp 2: Rút chân trái về, đồng thời cúi gập thân sâu, hai tay chạm hai mũi bàn chân, hai chân giữ thẳng, đầu cúi (thở ra).\n- Nhịp 3: Đứng thẳng lên, hai tay dang ngang bằng vai, lòng bàn tay ngửa, ngực căng (hít vào).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải chếch sang phải.`;
      gv = `- GV giới thiệu Động tác Phối hợp (Bài 3 SGK GDTC Lớp 1), phân tích tác dụng giúp đôi chân vững vàng, lưng dẻo dai và phối hợp nhịp nhàng giữa tay, chân và thân mình.\n- Làm mẫu kỹ thuật 2 - 3 lần theo phương pháp chiều gương kết hợp phân tích nhịp: nhịp 1 bước khuỵu gối vươn tay, nhịp 2 gập sâu giữ chân thẳng, nhịp 3 mở rộng lồng ngực.\n- Cho học sinh quan sát tranh kỹ thuật SGK, nhấn mạnh việc giữ thăng bằng khi dồn trọng tâm vào chân trước.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn kịp thời cho những em chân sau bị chùng hoặc chưa giữ thẳng chân khi cúi gập.\n- Biểu dương tinh thần tập luyện nghiêm túc và động tác chuẩn xác của học sinh.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n- Chăm chú quan sát động tác thị phạm bước khuỵu gối và vươn tay của thầy cô.\n- Tập mô phỏng theo nhịp hô chậm: chú ý nhịp 1 chân sau thẳng, nhịp 2 hai chân giữ thẳng khi cúi gập tay chạm mũi chân.\n- Tích cực sửa sai tư thế theo góp ý của giáo viên.`;
      practiceFocus = 'bước khuỵu gối chân trước chân sau thẳng và cúi gập thân phối hợp nhịp nhàng';
      break;

    case 'tay':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Hai tay đưa ra trước vỗ vào nhau ngang ngực, tiếng vỗ dứt khoát.\n- Nhịp 3: Như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải bước sang ngang.`;
      gv = `- GV giới thiệu tên Động tác Tay, nêu rõ tác dụng phát triển sức mạnh khớp vai, cơ cánh tay và tạo tư thế thân trên thẳng đẹp.\n- Thị phạm làm mẫu chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích rõ điểm mấu chốt: nhịp 1 hai tay dang thẳng ngang vai lòng bàn tay ngửa, nhịp 2 vỗ tay trước ngực dứt khoát.\n- Hướng dẫn học sinh đối chiếu với hình ảnh kỹ thuật SGK, lưu ý không để cánh tay chúc xuống dưới hoặc giơ quá cao qua vai.\n- Hô nhịp chậm cho học sinh làm thử; trực tiếp sửa lỗi chùng khuỷu tay và gù lưng cho từng em; nhắc nhở học sinh giữ ngực căng.\n- Động viên, khích lệ cả lớp thực hiện đều và chuẩn xác biên độ.`;
      hs = `- Đội hình 4 hàng ngang đứng so le giãn cách 1 sải tay để không va chạm tay nhau.\n- Quan sát tỉ mỉ động tác mẫu của GV và hình ảnh kỹ thuật SGK, ghi nhớ độ cao của cánh tay ngang vai.\n- Thực hiện mô phỏng từng nhịp theo nhịp hô chậm của giáo viên; giữ lưng thẳng, ngực căng.\n- Tự giác nhận biết và sửa lỗi sai tư thế theo hướng dẫn của thầy cô.`;
      practiceFocus = 'hai tay dang thẳng ngang vai và nhịp vỗ tay trước ngực dứt khoát';
      break;

    case 'chan':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Kiễng gót hai chân, hai tay chống hông (thân thẳng, mắt nhìn thẳng).\n- Nhịp 2: Hạ gót, khuỵu gối sâu, hai tay đưa ra trước song song ngang vai, lòng bàn tay sấp, lưng giữ thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (kiễng gót hai chân, hai tay chống hông).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Chân, phân tích tác dụng giúp đôi chân khỏe mạnh, khớp gối, cổ chân linh hoạt và giữ thăng bằng cơ thể tốt.\n- Làm mẫu chuẩn 2 - 3 lần theo phương pháp chiều gương; nhấn mạnh nhịp 1 kiễng cao gót giữ thăng bằng trên nửa trước bàn chân, nhịp 2 khuỵu gối sâu nhưng thân người luôn giữ thẳng, không chúi đầu ra trước.\n- Cho học sinh quan sát tranh kỹ thuật SGK, chỉ rõ vị trí đặt hai tay chống hông và hai tay song song ngang vai.\n- Hô nhịp chậm hướng dẫn lớp tập từng nhịp; phát hiện các lỗi sai (mất thăng bằng ngả nghiêng, cong gập lưng khi khuỵu gối) và trực tiếp uốn nắn sửa sai.\n- Biểu dương tinh thần tập luyện nghiêm túc của học sinh.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n- Chăm chú quan sát tư thế kiễng gót thăng bằng và cách khuỵu gối lưng thẳng của giáo viên.\n- Mô phỏng động tác theo nhịp đếm chậm; cố gắng giữ thăng bằng không để người chao đảo.\n- Lắng nghe góp ý của thầy cô để hoàn thiện độ sâu của gối và độ thẳng của lưng.`;
      practiceFocus = 'kiễng gót thăng bằng và khuỵu gối sâu giữ lưng thẳng';
      break;

    case 'luon':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Nghiêng lườn sâu sang trái, tay trái chống hông, tay phải vươn cao ép sát tai, trọng tâm dồn chân phải.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân bước sang phải và nghiêng lườn sang phải.`;
      gv = `- GV giới thiệu Động tác Lườn, giải thích tác dụng giúp cột sống dẻo dai, hai bên lườn mềm mại và giữ dáng đứng cân đối.\n- Làm mẫu chuẩn xác 2 - 3 lần; nhấn mạnh điểm kỹ thuật quan trọng: khi nghiêng người phải giữ thân trên nghiêng thẳng sang bên, không gập người ra trước hoặc ngửa ra sau, hai chân giữ thẳng.\n- Cho học sinh xem tranh kỹ thuật SGK, chỉ rõ độ cong của tay vươn trên đầu và tư thế tay chống hông.\n- Hô nhịp chậm cho học sinh tập thử; kịp thời phát hiện và sửa các lỗi sai xoay vặn thân mình thay vì nghiêng lườn.\n- Khen ngợi những em thực hiện độ uốn lườn sâu và đúng kỹ thuật.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát hướng nghiêng thẳng sang hai bên của thân người, ghi nhớ nhịp thở đều đặn.\n- Thực hiện từng nhịp chậm rãi, cảm nhận sự căng giãn nhẹ hai bên lườn khi nghiêng.\n- Tích cực sửa sai tư thế tay áp sát tai theo hướng dẫn của giáo viên.`;
      practiceFocus = 'nghiêng lườn thẳng sang hai bên và tay vươn sát tai';
      break;

    case 'bung':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng hơn vai, hai tay đưa thẳng lên cao song song, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ.\n- Nhịp 2: Cúi gập thân sâu ra trước, cúi đầu, hai tay hướng xuống chạm hai mu bàn chân, hai chân giữ thẳng.\n- Nhịp 3: Đứng thẳng lên, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.`;
      gv = `- GV giới thiệu Động tác Bụng, phân tích tác dụng giúp lưng bụng dẻo dai và giữ thân người gọn gàng, khỏe mạnh.\n- Làm mẫu trực quan 2 - 3 lần kết hợp phân tích nhịp: nhịp 1 vươn căng hai tay lên cao, nhịp 2 gập sâu thân người thở ra hết, hai chân giữ thẳng không được co gập gối.\n- Cho học sinh quan sát tranh vẽ kỹ thuật SGK, lưu ý tư thế đầu cúi tự nhiên theo thân người.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn cho những em chân còn bị co gập hoặc cúi gập quá vội vàng.\n- Tuyên dương các em giữ được chân thẳng và chạm tay tới mu bàn chân.`;
      hs = `- Đội hình 4 hàng ngang giãn cách cự ly 1 sải tay.\n- Chăm chú theo dõi tư thế cúi gập thân và giữ thẳng đầu gối của thầy cô.\n- Tập mô phỏng chậm rãi, thở ra hết khi gập thân và hít sâu khi vươn người đứng thẳng.\n- Tự giác điều chỉnh không co gối khi tay với xuống chạm mu bàn chân.`;
      practiceFocus = 'hai chân giữ thẳng và cúi gập thân sâu thở ra nhịp nhàng';
      break;

    case 'van_minh':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Vặn mình sang trái 90 độ, hai bàn chân giữ nguyên cố định bám sàn, hai tay giữ ngang vai.\n- Nhịp 3: Như nhịp 1 (về tư thế hai tay dang ngang).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng bước chân phải và vặn mình sang phải.`;
      gv = `- GV giới thiệu Động tác Vặn mình, nêu rõ tác dụng tăng độ linh hoạt của khớp háng, cột sống và rèn luyện sự khéo léo phối hợp vận động.\n- Làm mẫu kỹ thuật 2 - 3 lần; nhấn mạnh yêu cầu: hai bàn chân phải bám chắc trên mặt sân, chỉ xoay vặn phần thân trên 90 độ, không xoay nhấc gót chân.\n- Hướng dẫn học sinh quan sát hình ảnh SGK, nhắc nhở giữ hai tay ngang bằng vai trong suốt quá trình vặn mình.\n- Hô nhịp chậm hướng dẫn lớp tập luyện; quan sát phát hiện lỗi xoay cả chân hoặc hạ tay xuống thấp để kịp thời nhắc nhở sửa chữa.\n- Biểu dương sự cố gắng và chuyển động dứt khoát của học sinh.`;
      hs = `- Đội hình 4 hàng ngang so le 1 sải tay.\n- Quan sát góc xoay 90 độ của thân trên và vị trí cố định của hai bàn chân.\n- Thực hiện động tác vặn mình dứt khoát, giữ hai cánh tay thẳng ngang vai.\n- Chỉnh sửa tư thế bàn chân bám chắc mặt sân theo nhắc nhở của thầy cô.`;
      practiceFocus = 'bàn chân cố định bám sàn và vặn thân trên 90 độ dứt khoát';
      break;

    case 'toan_than':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái chếch trước, khuỵu gối sâu, chân sau thẳng, hai tay vươn chếch cao chữ V, ngửa đầu.\n- Nhịp 2: Rút chân trái về, cúi gập thân hai tay chạm mũi chân, chân thẳng.\n- Nhịp 3: Đứng thẳng hai tay dang ngang bằng vai, ngực căng.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng bước chân phải chếch trước.`;
      gv = `- GV giới thiệu Động tác Toàn thân, phân tích tác dụng giúp chân, lưng và cánh tay dẻo dai, nâng cao khả năng phối hợp vận động toàn thân.\n- Thị phạm chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích kỹ thuật dồn trọng tâm lên chân trước khi khuỵu gối và cúi gập thân giữ thẳng chân.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK, chỉ rõ độ mở của hai chân.\n- Hô nhịp chậm cho học sinh tập mô phỏng; kịp thời uốn nắn tư thế khuỵu gối vững chãi và thẳng chân sau.\n- Khen ngợi những em thực hiện nhịp nhàng, vững vàng thăng bằng.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, khoảng cách 1 sải tay.\n- Quan sát kỹ thuật bước chân chếch trước và khuỵu gối của GV.\n- Tập mô phỏng từng nhịp theo nhịp hô chậm, chú ý giữ thăng bằng chân trước chân sau.\n- Tiếp thu chỉ dẫn để hoàn thiện độ vươn cao của hai tay và độ dẻo thân người.`;
      practiceFocus = 'dồn trọng tâm chân trước khuỵu gối và phối hợp toàn thân nhịp nhàng';
      break;

    case 'nhay':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bật nhảy tách hai chân sang ngang rộng bằng vai, đồng thời hai tay dang ngang bằng vai, lòng bàn tay sấp.\n- Nhịp 2: Bật nhảy khép hai chân về, đồng thời hai tay vỗ vào nhau trên đỉnh đầu.\n- Nhịp 3: Như nhịp 1 (bật nhảy tách chân, hai tay dang ngang).\n- Nhịp 4: Bật nhảy khép chân về TTCB (hạ hai tay xuôi theo thân).\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Nhảy, giải thích tác dụng phát triển sức bật của đôi chân, độ linh hoạt toàn thân và sự hào hứng phấn chấn.\n- Thị phạm mẫu chuẩn 2 - 3 lần; lưu ý điểm an toàn quan trọng: khi bật nhảy phải tiếp đất nhẹ nhàng bằng nửa trước bàn chân để hoãn xung, tránh dộng gót gây đau khớp gối.\n- Cho học sinh quan sát tranh ảnh SGK, chỉ rõ nhịp vỗ tay trên đỉnh đầu dứt khoát kết hợp bật nhảy nhịp nhàng.\n- Hô nhịp đếm chậm cho học sinh tập thử từng nhịp; trực tiếp sửa sai cách tiếp đất cho các em; nhắc nhở học sinh giữ nhịp thở đều.\n- Tuyên dương tinh thần tập luyện sôi nổi, động tác đều đẹp của cả lớp.`;
      hs = `- Đội hình 4 hàng ngang giãn cách 1 sải tay an toàn.\n- Chú ý quan sát động tác tiếp đất êm bằng mũi bàn chân và nhịp vỗ tay trên đầu của GV.\n- Bật nhảy nhịp nhàng theo nhịp đếm, giữ lưng thẳng, tiếp đất nhẹ nhàng không gây tiếng ồn lớn.\n- Tự điều chỉnh biên độ nhảy vừa sức và giữ nhịp thở ổn định.`;
      practiceFocus = 'bật nhảy nhịp nhàng và tiếp đất nhẹ nhàng bằng nửa trước bàn chân';
      break;

    case 'dieu_hoa':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang chạm bằng mũi chân, hai tay đưa ra trước lắc cổ tay nhẹ nhàng, hít sâu bằng mũi.\n- Nhịp 2: Về TTCB, thở ra từ từ bằng miệng.\n- Nhịp 3: Chân phải đưa sang ngang chạm bằng mũi chân, hai tay dang ngang lắc cổ tay nhẹ nhàng, hít sâu.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Thực hiện như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Điều hòa, nhấn mạnh đây là động tác cuối cùng của bài thể dục giúp cơ thể thả lỏng, nhịp tim và hô hấp hồi phục về trạng thái cân bằng.\n- Làm mẫu 2 - 3 lần kết hợp hướng dẫn nhịp thở sâu, êm; phân tích kỹ thuật lắc cổ tay nhẹ nhàng, thả lỏng toàn bộ các cơ bắp.\n- Cho học sinh đối chiếu với tranh ảnh SGK, hướng dẫn các em tập trung cảm nhận sự thư thái khi thực hiện động tác.\n- Hô nhịp chậm, giọng điệu nhẹ nhàng truyền cảm giúp học sinh thả lỏng tối đa; nhắc nhở các em không gồng cứng cơ bắp.\n- Nhận xét và đánh giá cao sự tiến bộ của toàn lớp trong việc hoàn thiện bài tập thể dục.`;
      hs = `- Đội hình 4 hàng ngang đứng giãn cách thoải mái.\n- Lắng nghe nhịp hô chậm rãi, êm dịu của giáo viên, thả lỏng hoàn toàn các khớp cổ tay và chân.\n- Thực hiện đưa chân chạm mũi nhẹ nhàng, kết hợp hít vào sâu bằng mũi và thở ra chậm rãi bằng miệng.\n- Đưa cơ thể về trạng thái hồi phục khoan khoái sau giờ học.`;
      practiceFocus = 'lắc cổ tay thả lỏng nhẹ nhàng và điều hòa nhịp thở sâu êm';
      break;

    case 'di_deu':
      steps = `- TTCB: Đứng nghiêm.\n- Khẩu lệnh: "Đi đều... BƯỚC!".\n- Động tác: Bước chân trái ra trước nhịp 1, đồng thời tay phải gập vuông góc trước ngực, tay trái đánh thẳng ra sau; nhịp 2 bước chân phải, đổi tay; bước chân theo nhịp 1-2, 1-2 dứt khoát.\n- Khẩu lệnh: "Đứng lại... ĐỨNG!" (dự lệnh và động lệnh đều rơi vào chân phải).\n- Động tác: Sau động lệnh "ĐỨNG!", bước tiếp chân trái một bước rồi khép chân phải về TTCB đứng nghiêm.`;
      gv = `- GV giới thiệu động tác Đi đều, Đứng lại, phân tích ý nghĩa rèn luyện tính kỷ luật, tác phong đội ngũ nhanh nhẹn, thống nhất và đẹp mắt.\n- Làm mẫu chuẩn xác 2 - 3 lần theo phương pháp vừa làm vừa phân tích; nhấn mạnh quy tắc: "Chân nọ tay kia", chân trái bước vào nhịp 1, chân phải bước vào nhịp 2, tay đánh vuông góc trước ngực.\n- Cho học sinh xem tranh kỹ thuật SGK lớp 3 trang 27, hướng dẫn cách nghe khẩu lệnh dự lệnh và động lệnh.\n- Hô nhịp tại chỗ cho học sinh tập dậm chân trước, sau đó cho đi đều từng bước ngắn; quan sát phát hiện lỗi đi cùng chân cùng tay để sửa ngay.\n- Khen ngợi các em bước chân đúng nhịp hô dứt khoát.`;
      hs = `- Đội hình hàng dọc hoặc hàng ngang theo cự ly chuẩn bị đi đều.\n- Lắng nghe dự lệnh và động lệnh của GV, ghi nhớ quy tắc bước chân trái ở nhịp 1 và chân phải ở nhịp 2.\n- Đi đều dứt khoát, tay đánh tự nhiên vuông góc trước ngực, mắt nhìn thẳng phía trước.\n- Chỉnh đốn cự ly hàng ngũ thẳng đều theo các bạn xung quanh.`;
      practiceFocus = 'bước chân đúng nhịp 1 - 2 chân nọ tay kia và đứng lại chuẩn khẩu lệnh';
      break;

    case 'bung_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Chân trái bước sang ngang rộng hơn vai, hai tay đưa gậy ra trước - lên cao, mắt nhìn theo gậy.\n- Nhịp 2: Cúi người, gập thân, hai chân thẳng, hai tay đưa gậy xuống chạm mũi bàn chân, mắt nhìn theo gậy.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (hai tay đưa gậy lên cao, mắt nhìn theo gậy).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 đổi chân.`;
      gv = `- GV giới thiệu Động tác Bụng với gậy (SGK Lớp 5 Trang 30), phân tích tác dụng giúp lưng và đôi chân dẻo dai, khỏe mạnh.\n- Làm mẫu trực quan 2 - 3 lần kết hợp phân tích kỹ thuật: nhịp 1 nâng gậy lên cao thân thẳng, nhịp 2 cúi gập thân sâu thở ra hết, hai chân giữ thẳng không được co gập gối, gậy chạm mũi bàn chân.\n- Cho học sinh quan sát hình ảnh kỹ thuật SGK lớp 5 trang 30, lưu ý cách cầm hai đầu gậy chắc chắn.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn cho những em chân còn bị co gập hoặc cúi gập vội vàng.\n- Tuyên dương các em giữ được chân thẳng và hạ gậy chạm mũi chân chuẩn xác.`;
      hs = `- Đội hình 4 hàng ngang giãn cách cự ly 1.5m đảm bảo không chạm gậy vào bạn bên cạnh.\n- Chăm chú theo dõi tư thế cúi gập thân và giữ thẳng đầu gối của thầy cô.\n- Cầm chắc gậy, tập mô phỏng chậm rãi, thở ra hết khi gập thân và hít sâu khi vươn người đứng thẳng.\n- Tự giác điều chỉnh không co gối khi gậy hạ xuống chạm mu bàn chân.`;
      practiceFocus = 'hai chân giữ thẳng, cúi gập thân sâu và hạ gậy chạm mũi bàn chân';
      break;

    case 'van_minh_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa gậy ra trước ngang vai (lòng bàn tay sấp).\n- Nhịp 2: Giữ nguyên chân, vặn mình sang trái, hai tay cầm gậy đưa ngang sang trái - ra sau, mắt nhìn theo gậy.\n- Nhịp 3: Về nhịp 1 (gậy đưa thẳng ra trước ngang vai).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 đổi chân, nhịp 6 đổi hướng vặn mình sang phải.`;
      gv = `- GV giới thiệu Động tác Vặn mình với gậy (SGK Lớp 5 Trang 30), nêu rõ tác dụng tăng độ linh hoạt khớp háng, cơ lườn và cột sống.\n- Làm mẫu kỹ thuật 2 - 3 lần; nhấn mạnh yêu cầu cốt lõi: hai bàn chân phải bám chắc trên mặt sân, chỉ xoay vặn phần thân trên, hai tay cầm gậy đưa ngang ra sau dứt khoát.\n- Hướng dẫn học sinh quan sát hình ảnh SGK trang 30, nhắc nhở giữ gậy thăng bằng ngang vai trong suốt quá trình vặn mình.\n- Hô nhịp chậm hướng dẫn lớp tập luyện; quan sát phát hiện lỗi xoay cả chân hoặc hạ gậy xuống thấp để kịp thời nhắc nhở sửa chữa.\n- Biểu dương sự cố gắng và chuyển động dứt khoát của học sinh.`;
      hs = `- Đội hình 4 hàng ngang so le 1.5m cự ly an toàn.\n- Quan sát góc xoay thân trên và vị trí cố định của hai bàn chân khi thực hiện động tác với gậy.\n- Cầm chắc gậy, thực hiện động tác vặn mình dứt khoát, giữ gậy ngang vai.\n- Chỉnh sửa tư thế bàn chân bám chắc mặt sân theo nhắc nhở của thầy cô.`;
      practiceFocus = 'hai bàn chân bám chắc sàn, vặn thân mình và giữ gậy ngang vai';
      break;

    case 'toan_than_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Khuỵu gối chân trái, chân phải thẳng, hai tay đưa gậy ra trước ngang vai.\n- Nhịp 2: Duỗi gối, cúi người gập thân sâu, hai chân thẳng, hai tay đưa gậy xuống chạm mũi bàn chân, mắt nhìn theo gậy.\n- Nhịp 3: Đứng thẳng, chân trái đưa ra sau kiễng gót tì mũi chân, trọng tâm dồn chân phải, hai tay đưa gậy lên cao chếch chữ V, ngửa đầu.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 dồn chân phải, nhịp 7 đổi chân.`;
      gv = `- GV giới thiệu Động tác Toàn thân với gậy (SGK Lớp 5 Trang 31), phân tích tác dụng phối hợp toàn diện các khớp chân, cơ lưng, bụng và cánh tay.\n- Thị phạm chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích kỹ thuật: nhịp 1 khuỵu gối giữ lưng thẳng, nhịp 2 cúi gập thân thẳng chân gậy chạm chân, nhịp 3 nâng gậy lên cao chân sau kiễng gót dồn trọng tâm chân trước.\n- Cho học sinh quan sát tranh ảnh kỹ thuật SGK trang 31; hô nhịp chậm cho học sinh tập mô phỏng động tác Toàn thân; sau đó cho cả lớp ghép liên hoàn.\n- Khen ngợi những em thực hiện nhịp nhàng, vững vàng thăng bằng.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, khoảng cách 1.5m.\n- Quan sát kỹ thuật khuỵu gối, gập thân và vươn gậy kiễng gót của giáo viên ở động tác Toàn thân.\n- Tập mô phỏng từng nhịp theo nhịp hô chậm; ghép liên hoàn các động tác với gậy đẹp mắt.`;
      practiceFocus = 'khuỵu gối lưng thẳng, cúi gập thân chạm gậy và nâng gậy kiễng gót thăng bằng';
      break;

    case 'chan_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Kiễng gót hai chân, hai tay đưa gậy ra trước ngang vai (lưng thẳng, mắt nhìn theo gậy).\n- Nhịp 2: Hạ gót, khuỵu gối sâu, hai tay đưa gậy lên cao qua đầu, lưng giữ thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (kiễng gót, gậy ngang vai).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Chân với gậy (SGK GDTC Lớp 5 Trang 25), phân tích tác dụng tăng cường sức mạnh cơ chân, khớp gối và khả năng giữ thăng bằng.\n- Làm mẫu chuẩn xác 2-3 lần; nhấn mạnh nhịp 1 kiễng cao gót giữ thăng bằng trên nửa trước bàn chân, nhịp 2 khuỵu gối sâu nhưng thân người luôn giữ thẳng, hai tay nâng gậy lên cao qua đầu.\n- Cho học sinh quan sát tranh ảnh kỹ thuật SGK trang 25; hô nhịp chậm cho học sinh tập mô phỏng.\n- Kịp thời sửa sai các lỗi mất thăng bằng hoặc gù lưng; tuyên dương học sinh thực hiện tốt.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly 1.5m.\n- Chăm chú quan sát tư thế kiễng gót và khuỵu gối lưng thẳng của giáo viên ở động tác Chân.\n- Tập mô phỏng động tác Chân theo nhịp đếm chậm; sau đó ghép liên hoàn các động tác với gậy.`;
      practiceFocus = 'kiễng gót thăng bằng, khuỵu gối lưng thẳng và nâng gậy qua đầu';
      break;

    case 'nhay_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Bật nhảy tách hai chân sang ngang rộng bằng vai, đồng thời hai tay nâng gậy lên cao qua đầu, mắt nhìn thẳng.\n- Nhịp 2: Bật nhảy khép hai chân về, hạ gậy về trước đùi như TTCB.\n- Nhịp 3: Như nhịp 1 (bật nhảy tách chân, hai tay nâng gậy qua đầu).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Nhảy với gậy (SGK GDTC Lớp 5 Trang 34), phân tích tác dụng phát triển sức bật của đôi chân, độ khéo léo và sức mạnh cánh tay khi cầm gậy.\n- Thị phạm làm mẫu chuẩn 2 - 3 lần theo phương pháp chiều gương; lưu ý điểm an toàn: tiếp đất nhẹ nhàng bằng nửa trước bàn chân để hoãn xung, hai tay cầm gậy chắc chắn không để tuột gậy.\n- Cho học sinh quan sát hình ảnh kỹ thuật SGK lớp 5 trang 34, nhấn mạnh việc giữ gậy thẳng trên cao ở nhịp 1 và 3.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển uốn nắn cách tiếp đất êm cho từng học sinh.\n- Tuyên dương tinh thần hào hứng, động tác dứt khoát của cả lớp.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly 1.5m đảm bảo tuyệt đối an toàn khi vung gậy.\n- Quan sát động tác tiếp đất êm và nhịp nâng gậy qua đầu của giáo viên.\n- Cầm chắc hai đầu gậy, bật nhảy nhịp nhàng theo nhịp đếm, tiếp đất nhẹ nhàng bằng mũi bàn chân.\n- Tự giác điều chỉnh tư thế lưng thẳng và không để chạm gậy vào bạn.`;
      practiceFocus = 'bật nhảy nhịp nhàng, nâng gậy qua đầu và tiếp đất nhẹ nhàng bằng nửa trước bàn chân';
      break;

    case 'dieu_hoa_gay':
      steps = `- TTCB: Đứng thẳng, hai tay cầm hai đầu gậy trước đùi.\n- Nhịp 1: Chân trái bước sang ngang, hai tay nâng gậy lên cao chếch chữ V, ngửa đầu, hít sâu bằng mũi.\n- Nhịp 2: Cúi nhẹ đầu, hạ hai tay đưa gậy xuống ngang ngực rồi hạ về trước đùi, thở ra từ từ bằng miệng.\n- Nhịp 3: Chân phải bước sang ngang, hai tay nâng gậy lên cao chếch chữ V, ngửa đầu hít sâu.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Thực hiện như nhịp 1, 2, 3, 4.`;
      gv = `- GV giới thiệu Động tác Điều hòa với gậy (SGK GDTC Lớp 5 Trang 35), nhấn mạnh đây là động tác thả lỏng toàn thân, giúp nhịp thở và cơ bắp hồi phục sau các bài tập vận động mạnh với gậy.\n- Làm mẫu 2 - 3 lần kết hợp hướng dẫn hít sâu, thở êm và nâng hạ gậy nhịp nhàng theo hơi thở.\n- Cho học sinh quan sát tranh kỹ thuật SGK lớp 5 trang 35, hướng dẫn các em tập trung cảm nhận sự thư giãn.\n- Hô nhịp chậm rãi, truyền cảm giúp học sinh thả lỏng tối đa.\n- Nhận xét và đánh giá cao sự tiến bộ, tinh thần rèn luyện nghiêm túc của học sinh.`;
      hs = `- Đội hình 4 hàng ngang đứng giãn cách thoải mái.\n- Lắng nghe nhịp hô chậm rãi của giáo viên, nâng hạ gậy uyển chuyển, thả lỏng toàn bộ các khớp.\n- Phối hợp nhịp thở sâu bằng mũi khi nâng gậy và thở ra từ từ bằng miệng khi hạ gậy.\n- Đưa cơ thể về trạng thái hồi phục khoan khoái sau giờ học.`;
      practiceFocus = 'nâng hạ gậy nhịp nhàng theo hơi thở sâu và thả lỏng toàn thân';
      break;

    default:
      // Mặc định Vươn thở
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa lên cao chếch chữ V, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ, hít sâu bằng mũi.\n- Nhịp 2: Hai tay đưa xuống bắt chéo trước bụng, cúi nhẹ đầu, thở ra từ từ bằng miệng.\n- Nhịp 3: Như nhịp 1 (hít sâu).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.`;
      gv = `- GV giới thiệu tên ${cleanName}, nêu rõ tác dụng giúp phát triển các nhóm cơ và rèn luyện tư thế chuẩn xác.\n- Thị phạm làm mẫu chuẩn xác 2 - 3 lần theo phương pháp chiều gương kết hợp phân tích chậm từng nhịp; nhấn mạnh nhịp hít sâu bằng mũi, vươn căng các cơ, và nhịp thở ra hết bằng miệng.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK, chỉ rõ hướng của các chi và góc ngửa của đầu thân người.\n- Hô nhịp chậm hướng dẫn toàn lớp tập thử từng nhịp; quan sát uốn nắn sửa sai tại chỗ cho học sinh.\n- Khen ngợi những em thực hiện đúng biên độ.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay để không va chạm.\n- Chăm chú quan sát động tác làm mẫu của GV và hình ảnh kỹ thuật SGK, ghi nhớ khẩu lệnh và thứ tự từng nhịp.\n- Bắt chước thực hiện mô phỏng từng nhịp theo nhịp hô chậm của giáo viên; phối hợp nhịp nhàng giữa nhịp thở và cử động tay chân.\n- Tự giác nhận biết và sửa lỗi sai tư thế theo hướng dẫn của thầy cô.`;
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
  userImages: SgkImageItem[] = []
): AccurateMovementDetails {
  const targetLesson = title ? findSgkLessonByTopicOrTitle(grade, title) : undefined;
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
        : grade === 3
        ? isHki
          ? 'đi đều - đứng lại, đội hình hàng ngang và các bài tập vận động cơ bản HK I'
          : 'chạy 30m, bật xa tại chỗ và phối hợp tung - bắt bóng đo năng lực vận động'
        : isHki
        ? 'biến đổi đội hình, phối hợp động tác với gậy và kỹ năng vận động HK I'
        : 'chạy cự ly ngắn 50m, bật xa tại chỗ và các chỉ số Tiêu chuẩn rèn luyện thân thể (RLTT) cuối cấp Tiểu học';

    const assessmentImg =
      userImages.find((img) => {
        if (!img.imgUrl || img.imgUrl.startsWith('data:image/svg+xml') || String(img.grade) !== String(grade)) return false;
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
      movementName: cleanTitle,
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

  // 1. Check if multiple movements are specified in the title (ONLY for Bài thể dục / ĐHĐN lessons)
  const extracted = extractMovementNamesFromTitle(title);

  if (extracted.length >= 2) {
    const partition = partitionLessonMovements(extracted, isPeriod2);
    const { newMovements, reviewMovements } = partition;

    // CASE A: Tiết 2 with Review of Period 1 movements
    if (isPeriod2 && reviewMovements.length > 0) {
      const newProfiles = newMovements.map((m) => getSingleMovementProfile(m, grade, userImages, targetLesson));
      const revProfiles = reviewMovements.map((m) => getSingleMovementProfile(m, grade, userImages, targetLesson));

      const newNamesStr = newMovements.join(' và ');
      const revNamesStr = reviewMovements.join(' và ');

      // Structured steps: explicit review of period 1 + new movement(s) of period 2 + continuous chaining
      let steps = `* Ôn tập các động tác đã học ở Tiết 1 (${revNamesStr}):\n`;
      for (const r of revProfiles) {
        steps += `- Ôn ${r.name}: Toàn lớp thực hiện 2 lần x 8 nhịp theo nhịp đếm dứt khoát của cán sự lớp; chú ý ${r.practiceFocus}.\n`;
      }
      steps += `- Ghép liên hoàn các động tác tiết 1: ${revProfiles.map((r) => r.name).join(' -> ')}.\n\n`;

      if (newProfiles.length > 0) {
        for (const n of newProfiles) {
          steps += `* Học ${n.name} (Động tác mới - SGK GDTC Lớp ${grade}):\n${n.steps}\n\n`;
        }
        steps += `* Phối hợp liên hoàn toàn bài:\n- Thực hiện liên tục: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')} (2 - 3 lần, mỗi lần 2x8 nhịp).`;
      } else {
        steps += `* Hoàn thiện và thi đua liên hoàn các động tác đã học.`;
      }

      // Teacher instructions (~100-120 words)
      const gv = `- GV tổ chức cho cả lớp ôn tập nhanh các động tác đã học ở Tiết 1 (${revNamesStr}) 1 - 2 lần để củng cố kỹ năng và kích hoạt cơ thể trước khi vào nội dung mới.\n` +
        (newProfiles.length > 0
          ? `- GV giới thiệu động tác mới của Tiết 2: ${newNamesStr} (SGK GDTC Lớp ${grade}), nêu rõ tác dụng phát triển thể lực và rèn luyện tư thế chuẩn xác.\n- Thị phạm làm mẫu chuẩn xác động tác mới 2 - 3 lần theo phương pháp chiều gương; phân tích chi tiết từng nhịp kết hợp chỉ dẫn học sinh đối chiếu hình ảnh kỹ thuật SGK.\n- Hô nhịp chậm điều khiển lớp tập thử động tác mới; trực tiếp di chuyển uốn nắn sửa sai tư thế cho từng học sinh; nhắc nhở giữ nhịp thở sâu và cự ly thẳng hàng.\n- Hướng dẫn toàn lớp ghép liên hoàn chuỗi các động tác: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')}; biểu dương tinh thần tập luyện tích cực của cả lớp.`
          : `- GV điều khiển lớp hoàn thiện kỹ thuật và thi đua giữa các tổ; uốn nắn độ thẳng đẹp của từng động tác.`);

      // Student tasks
      const hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n` +
        `- Toàn lớp thực hiện ôn tập các động tác Tiết 1 (${revNamesStr}) nhịp nhàng theo nhịp đếm của cán sự lớp.\n` +
        (newProfiles.length > 0
          ? `- Chăm chú quan sát động tác thị phạm của GV ở động tác mới (${newNamesStr}), ghi nhớ các điểm kỹ thuật then chốt và nhịp hô.\n- Luyện tập mô phỏng động tác mới theo nhịp hô chậm của GV, sau đó phối hợp ghép liên hoàn cả bài: ${[...revProfiles.map((r) => r.name), ...newProfiles.map((n) => n.name)].join(' -> ')}.`
          : `- Tích cực luyện tập hoàn thiện bài thể dục và tham gia nhận xét tổ bạn.`);

      const practiceFocus = newProfiles.length > 0
        ? `${newProfiles.map((n) => n.practiceFocus).join('; ')} kết hợp ôn luyện liên hoàn với ${revNamesStr}`
        : `ôn luyện liên hoàn dứt khoát các động tác ${revNamesStr}`;

      const primaryImg = newProfiles[0] || revProfiles[0];
      const allImages = [
        ...newProfiles.map((n, i) => ({ id: `img_new_${i}`, url: n.imgUrl, title: n.imgTitle })),
        ...revProfiles.map((r, i) => ({ id: `img_rev_${i}`, url: r.imgUrl, title: `Ôn tập: ${r.imgTitle}` }))
      ].filter((item) => Boolean(item.url));

      return {
        movementName: partition.displayMovementName,
        imgUrl: primaryImg.imgUrl,
        imgTitle: primaryImg.imgTitle,
        movementSteps: steps,
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

  // 2. Fallback: single movement detection (STRICTLY separated from Bài thể dục so non-exercise topics don't fall back to Vươn thở!)
  let targetName = '';
  if (titleLower.includes('phối hợp') && !titleLower.includes('chạy') && !titleLower.includes('bóng') && !titleLower.includes('nhảy xa')) {
    targetName = 'Động tác Phối hợp';
  } else if (titleLower.includes('điều hòa') || titleLower.includes('điều hoà') || isPeriod22) {
    targetName = 'Động tác Điều hòa';
  } else if (titleLower.includes('chân') && !titleLower.includes('chạy')) {
    targetName = grade === 5 ? 'Động tác Chân với gậy' : 'Động tác Chân';
  } else if (titleLower.includes('lườn')) {
    targetName = 'Động tác Lườn';
  } else if (titleLower.includes('bụng')) {
    targetName = grade === 5 ? 'Động tác Bụng với gậy' : 'Động tác Bụng';
  } else if (titleLower.includes('vặn mình')) {
    targetName = grade === 5 ? 'Động tác Vặn mình với gậy' : 'Động tác Vặn mình';
  } else if (titleLower.includes('tay') && !titleLower.includes('đầu, cổ') && !titleLower.includes('bóng')) {
    targetName = grade === 5 ? 'Động tác Tay với gậy' : 'Động tác Tay';
  } else if (titleLower.includes('vươn thở')) {
    targetName = grade === 5 ? 'Động tác Vươn thở với gậy' : 'Động tác Vươn thở';
  } else if (titleLower.includes('đi đều')) {
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

  // 3. Generic Authentic Domain Profile (ĐHĐN / Tư thế VĐ cơ bản / Thể thao tự chọn) — NEVER leaks Động tác Vươn thở!
  const cleanSkillTitle = title.replace(/\s*\([^)]*\)/g, '').replace(/^bài\s*\d+\s*[:\-]?\s*/i, '').trim() || 'Kỹ năng vận động bài học';
  const matchedTreeItem = targetLesson?.subFolders?.kyThuat?.items?.[0];
  const libraryCandidates = userImages.filter((img) => {
    if (!img.imgUrl || String(img.grade) !== String(grade)) return false;
    if (targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) {
      return getImageEffectiveSubFolder(img) === 'kyThuat';
    }
    return false;
  });
  const matchedLibImg = libraryCandidates[0];
  const resolvedUrl = matchedLibImg?.imgUrl || '';
  const resolvedTitle = matchedLibImg?.title || matchedTreeItem?.name || cleanSkillTitle;

  const domainSteps = matchedTreeItem
    ? `* Kỹ thuật trọng tâm (${matchedTreeItem.name}):\n- ${matchedTreeItem.desc}\n- Thực hiện đúng tư thế ban đầu, biên độ chuyển động và giữ thăng bằng ổn định theo khẩu lệnh.`
    : `* Thực hành kỹ năng trọng tâm (${cleanSkillTitle}):\n- Chuẩn bị tư thế xuất phát chuẩn xác, mắt nhìn hướng di chuyển.\n- Thực hiện từng giai đoạn động tác nhịp nhàng, đúng luật và phối hợp nhịp thở tự nhiên.`;

  const domainGv =
    `- GV giới thiệu mục tiêu và yêu cầu kỹ thuật của nội dung "${cleanSkillTitle}" (SGK GDTC Lớp ${grade}).\n` +
    `- Làm mẫu chuẩn xác 2 - 3 lần từ chậm đến nhanh kết hợp phân tích những điểm cốt lõi và lỗi sai thường gặp.\n` +
    `- Hướng dẫn học sinh quan sát tranh minh họa SGK, chia nhịp/bước tập thử và trực tiếp sửa sai tư thế cho từng em.`;

  const domainHs =
    `- Đội hình quan sát: 4 hàng ngang đứng so le giữ cự ly an toàn.\n` +
    `- Chăm chú quan sát GV thị phạm và tranh ảnh SGK; thực hiện mô phỏng chậm theo hướng dẫn.\n` +
    `- Chủ động phối hợp nhịp nhàng, giữ an toàn cho bản thân và bạn cùng tập.`;

  return {
    movementName: cleanSkillTitle,
    imgUrl: resolvedUrl,
    imgTitle: resolvedTitle,
    movementSteps: domainSteps,
    gvExplanation: domainGv,
    hsTask: domainHs,
    practiceFocus: `tư thế chuẩn xác và thực hiện nhịp nhàng kỹ năng ${cleanSkillTitle.toLowerCase()}`,
    newMovements: [cleanSkillTitle],
    reviewMovements: [],
    allImages: resolvedUrl ? [{ id: 'img_domain_1', url: resolvedUrl, title: resolvedTitle }] : []
  };
}

/**
 * Resolves an authentic game image from the user library or standard SGK assets matching the game name.
 */
export function resolveAccurateGameImage(
  gameName: string = '',
  grade: number = 1,
  category: 'tro_choi_kd' | 'tro_choi_vd' = 'tro_choi_vd',
  userImages: SgkImageItem[] = [],
  targetLesson?: SgkLessonFolder
): { url: string; title: string } {
  const cleanName = (gameName || '').toLowerCase().trim();
  const folderTarget: SubFolderType = category === 'tro_choi_kd' ? 'troChoiKhoiDong' : 'troChoi';
  const stopWords = new Set(['trò', 'chơi', 'vận', 'động', 'khởi', 'bổ', 'trợ', 'của', 'với', 'trong', 'sách', 'sgk']);
  const queryWords = cleanName
    .replace(/["""'.,:;()\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  // 1. Search user library strictly by Grade + real raster image (NEVER SVG formation diagram!) + exact game match
  if (userImages && userImages.length > 0) {
    const candidates = userImages.filter((img) => {
      if (!img.imgUrl || img.imgUrl.startsWith('data:image/svg+xml')) return false;
      if (String(img.grade) !== String(grade)) return false;
      const effFolder = getImageEffectiveSubFolder(img);
      return effFolder === 'troChoiKhoiDong' || effFolder === 'troChoi' || isGameImage(img);
    });

    let bestGameImg: SgkImageItem | null = null;
    let bestScore = -1;

    for (const img of candidates) {
      const rawTitle = (img.title || '').toLowerCase();
      const subjectTitle = rawTitle.split(/\s+-\s+(?:sgk|khối)/i)[0] || rawTitle;
      const capHead = ((img.caption || '').split('•')[0] || '').toLowerCase();
      const effFolder = getImageEffectiveSubFolder(img);

      // Must match this exact game name (not just share folder with a totally different game!)
      const titleExactMatch = cleanName.length >= 3 && (subjectTitle.includes(cleanName) || capHead.includes(cleanName));
      const wordHits = queryWords.filter((w) => subjectTitle.includes(w) || capHead.includes(w));
      const minRequiredHits = queryWords.length <= 2 ? queryWords.length : Math.max(2, Math.ceil(queryWords.length * 0.6));
      const keywordMatched = queryWords.length > 0 && wordHits.length >= minRequiredHits;

      if (!titleExactMatch && !keywordMatched) continue;
      // Block cross-category unless title explicitly matches the exact game name
      if (effFolder !== folderTarget && !titleExactMatch) continue;

      let score = titleExactMatch ? 220 : 120 + wordHits.length * 35;
      if (effFolder === folderTarget) score += 80;
      if (targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) score += 90;
      if (!img.id.startsWith('img_sgk_')) score += 60;
      if (score > bestScore) {
        bestScore = score;
        bestGameImg = img;
      }
    }

    if (bestGameImg) {
      return {
        url: bestGameImg.imgUrl,
        title: bestGameImg.title || `Trò chơi: ${gameName}`
      };
    }
  }

  // 2. Authoritative textbook raster mapping ONLY when the image genuinely depicts THAT EXACT game (zero arbitrary fallback!)
  if (grade === 1) {
    if (cleanName.includes('kết bạn') || cleanName.includes('ket ban')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
        title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC 1 (Trang 31)'
      };
    }
    if (cleanName.includes('lò cò') || cleanName.includes('lo co')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
        title: 'Trò chơi vận động: Lò cò tiếp sức - SGK GDTC 1 (Trang 34)'
      };
    }
    return { url: '', title: '' };
  }

  if (grade === 3) {
    // k3_tro_choi_tam_giac.jpg actually contains "SƠ ĐỒ: TẬP LUYỆN ĐỒNG LOẠT", NOT a game photo.
    // All Grade 3 games must come from extracted SGK library images matching that exact game.
    return { url: '', title: '' };
  }

  // Grade 5 (Bài tập thể dục với gậy)
  if (cleanName.includes('trao gậy') || cleanName.includes('trao gay')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_trao_gay_tiep_suc.jpg',
      title: 'Trò chơi vận động: Trao gậy tiếp sức - SGK GDTC 5 (Trang 32)'
    };
  }
  if (cleanName.includes('nhanh nhất') || cleanName.includes('đội nào nhanh nhất')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Đội nào nhanh nhất - SGK GDTC 5 (Trang 29)'
    };
  }
  if (cleanName.includes('ai kéo') || cleanName.includes('ai keo')) {
    return {
      url: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
      title: 'Trò chơi bổ trợ khởi động: Ai kéo khoẻ hơn - SGK GDTC 5 (Trang 27)'
    };
  }

  return { url: '', title: '' };
}

/**
 * Resolves an authentic non-movement raster library image for a specific SGK subFolder slot
 * ('khoiDong' | 'luyenTap' | 'vanDung') strictly scoped by grade, excluding games and SVG formation diagrams.
 */
export function resolveLessonSlotImage(
  grade: number,
  targetSubFolder: 'khoiDong' | 'luyenTap' | 'vanDung',
  targetLesson: SgkLessonFolder | undefined,
  userImages: SgkImageItem[] = []
): { url: string; title: string } | null {
  if (!userImages || userImages.length === 0) return null;

  const candidates = userImages.filter((img) => {
    if (!img.imgUrl || img.imgUrl.startsWith('data:image/svg+xml')) return false;
    if (String(img.grade) !== String(grade)) return false;
    if (targetSubFolder === 'khoiDong' && !isWarmupGeneralImage(img)) return false;
    return getImageEffectiveSubFolder(img) === targetSubFolder;
  });

  if (candidates.length === 0) return null;

  let best: SgkImageItem | null = null;
  let bestScore = -1;

  for (const img of candidates) {
    let score = 0;
    if (targetLesson && doesImageBelongToSgkLesson(img, targetLesson)) {
      score += 120;
    } else if (
      targetLesson &&
      img.page &&
      img.page >= targetLesson.startPage &&
      img.page <= targetLesson.endPage
    ) {
      score += 100;
    } else if (targetLesson?.topicId && img.topicId === targetLesson.topicId) {
      score += 60;
    } else if (!targetLesson) {
      score += 40;
    } else {
      // Do NOT leak images from unrelated topics
      continue;
    }

    if (img.folder === targetSubFolder) score += 20;
    if (!img.id.startsWith('img_sgk_')) score += 50;

    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }

  return best ? { url: best.imgUrl, title: best.title } : null;
}

export interface ResolvedLessonSlotAssets {
  effectiveLesson?: SgkLessonFolder;
  khoiDongImg: { url: string; title: string } | null;
  warmupGameName: string;
  warmupGameImg: { url: string; title: string };
  movementDetails: AccurateMovementDetails;
  luyenTapImg: { url: string; title: string } | null;
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
  const movementDetails = resolveAccurateMovement('', title, grade, userImages);

  const treeWarmup = effectiveLesson?.subFolders?.troChoiKhoiDong?.items?.[0]?.gameName;
  const treePractice = effectiveLesson?.subFolders?.troChoi?.items?.[0]?.gameName;

  const fallbackWarmup =
    grade === 1 ? 'Làm theo hiệu lệnh' : grade === 3 ? 'Chui qua hầm' : 'Ai kéo khoẻ hơn';
  const fallbackPractice =
    grade === 1 ? 'Lò cò tiếp sức' : grade === 3 ? 'Đua ô tô' : 'Trao gậy tiếp sức';

  const warmupGameName = customWarmupGame || treeWarmup || fallbackWarmup;
  const practiceGameName = customPracticeGame || treePractice || fallbackPractice;

  const khoiDongImg = resolveLessonSlotImage(grade, 'khoiDong', effectiveLesson, userImages);
  const warmupGameImg = resolveAccurateGameImage(warmupGameName, grade, 'tro_choi_kd', userImages, effectiveLesson);
  const luyenTapImg = resolveLessonSlotImage(grade, 'luyenTap', effectiveLesson, userImages);
  const practiceGameImg = resolveAccurateGameImage(practiceGameName, grade, 'tro_choi_vd', userImages, effectiveLesson);
  const vanDungImg = resolveLessonSlotImage(grade, 'vanDung', effectiveLesson, userImages);

  const appDetails = getLessonSpecificApplication(movementDetails.movementName, title, grade, effectiveLesson);

  return {
    effectiveLesson,
    khoiDongImg,
    warmupGameName,
    warmupGameImg,
    movementDetails,
    luyenTapImg,
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
  const mName = accurate.movementName;
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
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  const diagNhanLop = getFormationDiagramForPhaseAndGrade('nhan_lop', grade);
  const diagTapMau = getFormationDiagramForPhaseAndGrade('tap_mau', grade);
  const diagDongLoat = getFormationDiagramForPhaseAndGrade('dong_loat', grade);
  const diagToNhom = getFormationDiagramForPhaseAndGrade('to_nhom', grade);
  const diagCapDoi = getFormationDiagramForPhaseAndGrade('cap_doi', grade);
  const diagTroChoi = getFormationDiagramByKeyword(resolvedPractice, 'tro_choi', grade);
  const diagHoiTinh = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);

  return [
    // HÀNG 1: MỞ ĐẦU & KHỞI ĐỘNG (Gắn ảnh Trò chơi khởi động chuẩn SGK)
    {
      content: `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}".`,
      lvd: `5 - 7 phút\n2L x 8N`,
      gv: `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.\n- Tổ chức trò chơi bổ trợ khởi động "${resolvedWarmup}" tạo không khí vui tươi, hào hứng trước khi vào bài mới; quan sát bao quát và nhắc nhở tinh thần tập trung, trật tự.`,
      hs: `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.\n- Hào hứng tham gia trò chơi khởi động "${resolvedWarmup}", chấp hành nghiêm túc hiệu lệnh của giáo viên.`,
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
    // HÀNG 6: 3.4. THI ĐUA TRÌNH DIỄN & TRÒ CHƠI VẬN ĐỘNG (Ô RIÊNG - Sơ đồ sân bãi trò chơi ở Cột 4)
    {
      content: `3.4. Thi đua trình diễn giữa các tổ & Trò chơi vận động:\n* Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện động tác trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.\n* Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đồng đội.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
      lvd: `5 - 7 phút\n2 - 3 lượt`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- Phổ biến ngắn gọn tên trò chơi vận động "${resolvedPractice}", mục đích rèn luyện tố chất nhanh nhẹn, luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm làm mẫu thao tác tham gia trò chơi; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.`,
      hs: `- Đội hình thi đua & trò chơi: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Khi vào trò chơi "${resolvedPractice}": 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn vượt qua thử thách và tiếp sức an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.`,
      contentImgUrl: practiceImg?.url,
      contentImgTitle: practiceImg?.title,
      contentImages: practiceImg?.url ? [{ id: 'img_tc_7r_1', url: practiceImg.url, title: practiceImg.title }] : [],
      hsImgUrl: diagTroChoi.svgDataUrl,
      hsImgTitle: diagTroChoi.name,
      hsImages: [
        {
          id: 'diag_6_tro_choi',
          url: diagTroChoi.svgDataUrl,
          title: diagTroChoi.name
        }
      ]
    },
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

  const combinedCorpus = `${row.content || ''}\n${row.gv || ''}\n${row.hs || ''}`;
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
 * Creates 11 granular, 1:1 horizontally aligned lesson rows where each sub-activity
 * (Nhận lớp, Khởi động, Trò chơi khởi động, Động tác mới, Tập đồng loạt, Tập tổ, Tập cặp đôi, Thi đua, Trò chơi vận động, Hồi tĩnh, Vận dụng & Dặn dò)
 * has its OWN ROW, with Col 1 (Nội dung & Ảnh), Col 2 (LVĐ), Col 3 (GV), and Col 4 (HS & Sơ đồ) perfectly aligned horizontally.
 */
export function createBalancedGranularLessonRows(
  grade: number = 1,
  title: string = 'Bài tập rèn luyện thể dục phát triển chung',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): LessonRow[] {
  const resolved = resolveLessonSlotAssets(grade, title, '', userImages, customWarmupGame, customPracticeGame);
  const accurate = resolved.movementDetails;
  const mName = accurate.movementName;
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
    : `3.4. Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện ${mName} trước lớp (theo nhịp hô của tổ trưởng).\n- Các tổ ngồi xem quan sát, theo dõi, nhận xét và chấm điểm chéo cho nhau.`;

  const diagNhanLop = getFormationDiagramForPhaseAndGrade('nhan_lop', grade);
  const diagKhoiDong = getFormationDiagramForPhaseAndGrade('khoi_dong', grade);
  const diagWarmupGame = getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong', grade);
  const diagTapMau = getFormationDiagramForPhaseAndGrade('tap_mau', grade);
  const diagDongLoat = getFormationDiagramForPhaseAndGrade('dong_loat', grade);
  const diagToNhom = getFormationDiagramForPhaseAndGrade('to_nhom', grade);
  const diagCapDoi = getFormationDiagramForPhaseAndGrade('cap_doi', grade);
  const diagThiDua = getFormationDiagramForPhaseAndGrade('thi_dua', grade);
  const diagTroChoi = getFormationDiagramByKeyword(resolvedPractice, 'tro_choi', grade);
  const diagHoiTinh = getFormationDiagramForPhaseAndGrade('hoi_tinh', grade);
  const diagXuongLop = getFormationDiagramForPhaseAndGrade('xuong_lop', grade);

  return [
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

    // 3. TRÒ CHƠI BỔ TRỢ KHỞI ĐỘNG
    {
      content: `1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}":\n- Mục đích: Tạo phản xạ nhanh nhẹn, tinh thần sảng khoái và hưng phấn trước khi vào nội dung chính.\n- Luật chơi: Học sinh thực hiện nhanh theo hiệu lệnh của GV, ai làm sai sẽ thực hiện động tác phạt vui nhộn.`,
      lvd: `2 - 3 phút\n1 - 2 lượt`,
      gv: `- GV nêu tên trò chơi khởi động "${resolvedWarmup}", phổ biến ngắn gọn luật chơi và cách chơi.\n- Hô hiệu lệnh điều hành học sinh tham gia trò chơi tạo không khí sôi nổi, vui tươi trước khi vào phần trọng tâm.`,
      hs: `- Học sinh chăm chú lắng nghe hướng dẫn luật chơi, hào hứng tham gia trò chơi theo khẩu lệnh của giáo viên.\n- Chấp hành nghiêm túc hiệu lệnh, di chuyển nhanh nhẹn, vui tươi, trật tự.`,
      contentImgUrl: warmupImg?.url,
      contentImgTitle: warmupImg?.title,
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
    },

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
      contentImgUrl: resolved.luyenTapImg?.url,
      contentImgTitle: resolved.luyenTapImg?.title,
      contentImages: resolved.luyenTapImg?.url
        ? [{ id: 'img_lt_1', url: resolved.luyenTapImg.url, title: resolved.luyenTapImg.title }]
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

    // 9. LUYỆN TẬP: 3.5. TRÒ CHƠI VẬN ĐỘNG (HÀNG RIÊNG TƯƠNG XỨNG 1:1)
    {
      content: `3.5. Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đoàn kết.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
      lvd: `4 - 5 phút\n2 - 3 lượt`,
      gv: `- GV giới thiệu tên trò chơi vận động "${resolvedPractice}", giải thích mục đích, phổ biến luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm học sinh làm mẫu thao tác tham gia trò chơi để cả lớp nắm rõ quy trình.\n- Điều hành 4 đội thi đấu chính thức 2 - 3 lượt sôi nổi; nhắc nhở học sinh giữ cự ly an toàn tuyệt đối khi tiếp sức.\n- Nhận xét tinh thần thi đấu, tuyên dương đội chiến thắng và khích lệ các đội còn lại.`,
      hs: `- Học sinh chú ý lắng nghe GV giới thiệu tên trò chơi và phổ biến luật chơi; quan sát nhóm bạn chơi mẫu.\n- Đội hình trò chơi: 4 hàng dọc đứng sau vạch xuất phát, hướng về cọc tiêu.\n- Tham gia thi đấu hào hứng, nhanh nhẹn, đoàn kết, chấp hành nghiêm chỉnh luật chơi và tiếp sức an toàn cho bạn.\n- Cổ vũ nhiệt tình, thể hiện tinh thần thể thao trung thực, chúc mừng đội bạn khi giành chiến thắng.`,
      contentImgUrl: practiceImg?.url,
      contentImgTitle: practiceImg?.title,
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
    },

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
  // If already 10 or more rows, sanitize any misplaced SVG/game attachments in Column 1 and clean Vận dụng 4.2 text (without touching 4.1 Hồi tĩnh)
  if (rows && rows.length >= 10) {
    return sanitizePlanRowsVanDung(
      rows.map((r) => sanitizeRowColumn1Media(r, grade, title)),
      grade
    );
  }

  // Create clean 1:1 granular rows using deterministic 6-slot resolver
  const granular11 = createBalancedGranularLessonRows(grade, title, userImages, customWarmupGame, customPracticeGame);

  if (!rows || rows.length === 0) {
    return granular11;
  }

  // Strictly match each source row by explicit section heading and reject games in 1.2 or SVG diagrams in Col 1
  const isCustomRaster = (url?: string) => Boolean(url && !url.startsWith('data:image/svg+xml'));
  const isTitleGame = (title?: string) =>
    /trò\s*chơi|chui\s*qua|hiệu\s*lệnh|kết\s*bạn|lò\s*cò|mèo\s*đuổi|chim\s*về\s*tổ|đua\s*ô\s*tô/i.test((title || '').toLowerCase());

  // Slot 1.2 (Khởi động chung -> idx 1)
  const srcKhoiDong = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    return c.includes('1.2.') && !c.includes('1.3.') && isCustomRaster(r.contentImgUrl) && !isTitleGame(r.contentImgTitle);
  });
  if (srcKhoiDong?.contentImgUrl && granular11[1] && !granular11[1].contentImgUrl) {
    granular11[1].contentImgUrl = srcKhoiDong.contentImgUrl;
    granular11[1].contentImgTitle = srcKhoiDong.contentImgTitle;
    granular11[1].contentImages = srcKhoiDong.contentImages || [
      { id: 'custom_kd_chung', url: srcKhoiDong.contentImgUrl, title: srcKhoiDong.contentImgTitle || 'Ảnh khởi động' }
    ];
  }

  // Slot 1.3 (Trò chơi khởi động -> idx 2)
  const srcWarmupGame = rows.find((r, i) => {
    const c = (r.content || '').toLowerCase();
    return (c.includes('1.3.') || (i === 0 && c.includes('trò chơi') && c.includes('khởi động'))) && isCustomRaster(r.contentImgUrl);
  });
  if (srcWarmupGame?.contentImgUrl && granular11[2] && !granular11[2].contentImgUrl) {
    granular11[2].contentImgUrl = srcWarmupGame.contentImgUrl;
    granular11[2].contentImgTitle = srcWarmupGame.contentImgTitle;
    granular11[2].contentImages = srcWarmupGame.contentImages || [
      { id: 'custom_tckd', url: srcWarmupGame.contentImgUrl, title: srcWarmupGame.contentImgTitle || 'Ảnh trò chơi khởi động' }
    ];
  }

  // Slot 2.1 (Kỹ thuật động tác mới -> idx 3) — strictly reject warmup/game/practice/cooldown rows
  const srcMovement = rows.find((r, i) => {
    const c = (r.content || '').toLowerCase();
    const isMovRow =
      c.includes('2.1.') ||
      c.includes('2. hoạt động hình thành') ||
      c.includes('khám phá') ||
      c.includes('kiến thức mới') ||
      (rows.length <= 7 && i === 1);
    return isMovRow && isCustomRaster(r.contentImgUrl) && !isTitleGame(r.contentImgTitle);
  });
  if (srcMovement?.contentImgUrl && granular11[3] && !granular11[3].contentImgUrl) {
    granular11[3].contentImgUrl = srcMovement.contentImgUrl;
    granular11[3].contentImgTitle = srcMovement.contentImgTitle;
    granular11[3].contentImages = srcMovement.contentImages || [
      { id: 'custom_mov', url: srcMovement.contentImgUrl, title: srcMovement.contentImgTitle || 'Ảnh động tác' }
    ];
  }

  // Slot 3.2 (Luyện tập -> idx 5)
  const srcPractice = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    return (c.includes('3.2.') || c.includes('3.1.') || c.includes('3.3.')) && !c.includes('trò chơi') && isCustomRaster(r.contentImgUrl);
  });
  if (srcPractice?.contentImgUrl && granular11[5] && !granular11[5].contentImgUrl) {
    granular11[5].contentImgUrl = srcPractice.contentImgUrl;
    granular11[5].contentImgTitle = srcPractice.contentImgTitle;
    granular11[5].contentImages = srcPractice.contentImages || [
      { id: 'custom_lt', url: srcPractice.contentImgUrl, title: srcPractice.contentImgTitle || 'Ảnh luyện tập' }
    ];
  }

  // Slot 3.5 (Trò chơi vận động -> idx 8)
  const srcPracticeGame = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    const isGameRow =
      c.includes('3.5.') ||
      (c.includes('trò chơi') && (c.includes('vận động') || c.includes('3.4'))) ||
      r.contentImgTitle?.toLowerCase().includes('trò chơi');
    return isGameRow && isCustomRaster(r.contentImgUrl);
  });
  if (srcPracticeGame?.contentImgUrl && granular11[8] && !granular11[8].contentImgUrl) {
    granular11[8].contentImgUrl = srcPracticeGame.contentImgUrl;
    granular11[8].contentImgTitle = srcPracticeGame.contentImgTitle;
    granular11[8].contentImages = srcPracticeGame.contentImages || [
      { id: 'custom_game', url: srcPracticeGame.contentImgUrl, title: srcPracticeGame.contentImgTitle || 'Ảnh trò chơi vận động' }
    ];
  }

  // Slot 4.2 (Vận dụng -> idx 10)
  const srcVanDung = rows.find((r) => {
    const c = (r.content || '').toLowerCase();
    const isCooldownOnly = (c.includes('4.1') || c.includes('hồi tĩnh')) && !c.includes('4.2');
    return !isCooldownOnly && (c.includes('4.2.') || c.includes('vận dụng')) && isCustomRaster(r.contentImgUrl);
  });
  if (srcVanDung?.contentImgUrl && granular11[10] && !granular11[10].contentImgUrl) {
    granular11[10].contentImgUrl = srcVanDung.contentImgUrl;
    granular11[10].contentImgTitle = srcVanDung.contentImgTitle;
    granular11[10].contentImages = srcVanDung.contentImages || [
      { id: 'custom_vd', url: srcVanDung.contentImgUrl, title: srcVanDung.contentImgTitle || 'Ảnh vận dụng' }
    ];
  }

  return granular11;
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
  const newRows = createBalancedGranularLessonRows(grade, title, userImages);

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
  const updatedRows = rows.map((r) => ({ ...r }));

  updatedRows.forEach((row, idx) => {
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
      const gName = gameMatch ? gameMatch[1] : resolved.warmupGameName;
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
        messages.push(`Dòng ${idx + 1} (${accurate.movementName}): Chưa có ảnh chuẩn trong Thư viện`);
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
      // Attach classified Luyện tập image to 3.2 (or merged practice row), preserve valid Luyện tập raster image
      const sanitizedLt = sanitizeRowColumn1Media(row, grade, lessonTitle);
      row.contentImgUrl = sanitizedLt.contentImgUrl;
      row.contentImgTitle = sanitizedLt.contentImgTitle;
      row.contentImages = sanitizedLt.contentImages;
      if ((c.includes('3.2.') || c.includes('3.1.')) && resolved.luyenTapImg?.url && !row.contentImgUrl) {
        row.contentImgUrl = resolved.luyenTapImg.url;
        row.contentImgTitle = resolved.luyenTapImg.title;
        row.contentImages = [{ id: `img_lt_${idx}`, url: resolved.luyenTapImg.url, title: resolved.luyenTapImg.title }];
        attachedCount++;
        messages.push(`Dòng ${idx + 1} (Luyện tập): Gắn "${resolved.luyenTapImg.title}"`);
      }
      if (!row.hsImgUrl || isLegacySharedStandardFormationUrl(row.hsImgUrl)) {
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
      const gName = gameMatch ? gameMatch[1] : resolved.practiceGameName;
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
 * to grade-specific diagrams (Khối 1, 3, 5) while strictly preserving
 * user-drawn Studio / AI diagrams unless `forceUpgrade` is used on standard rows.
 */
export function applyGradeDistinctFormationsToRows(
  rows: LessonRow[],
  grade: number,
  forceUpgrade: boolean = false
): LessonRow[] {
  return rows.map((row) => {
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
