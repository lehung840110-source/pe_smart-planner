import { PpctItem, SgkImageItem, SubFolderType } from '../types/gdtc';
import { getStoredPpctData } from '../data/defaultPpctData';
import {
  SgkLessonFolder,
  findSgkLessonByPage,
  findSgkLessonByTopicOrTitle,
  findSgkLessonForMovement,
  getEffectiveSgkCurriculumTree
} from '../data/sgkCurriculumTree';
import {
  extractMovementNamesFromTitle,
  getImageEffectiveSubFolder,
  partitionLessonMovements
} from './planAutoMatcher';

export interface ImageUsageProvenance {
  grade: number;
  subFolder: SubFolderType;
  subFolderLabel: string;
  slotCode: string;
  slotName: string;
  slotLabel: string;
  targetColLabel: string;
  lessonId?: string;
  lessonName: string;
  topicName: string;
  page?: number;
  weeks: number[];
  periods: number[];
  newMovementPeriods: number[];
  reviewMovementPeriods: number[];
  weekLabel: string;
  specificEntityName: string;
  summaryNotice: string;
}

function getSlotMetaBySubFolder(subFolder: SubFolderType): {
  subFolderLabel: string;
  slotCode: string;
  slotName: string;
  slotLabel: string;
  targetColLabel: string;
} {
  switch (subFolder) {
    case 'khoiDong':
      return {
        subFolderLabel: 'Khởi động chung',
        slotCode: '1.2',
        slotName: 'Phần Khởi động chung',
        slotLabel: 'Mục 1.2: Khởi động chung (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
    case 'troChoiKhoiDong':
      return {
        subFolderLabel: 'Trò chơi bổ trợ khởi động',
        slotCode: '1.3',
        slotName: 'Phần Trò chơi khởi động',
        slotLabel: 'Mục 1.3: Trò chơi bổ trợ khởi động (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
    case 'luyenTap':
      return {
        subFolderLabel: 'Luyện tập',
        slotCode: '3.2',
        slotName: 'Phần Luyện tập theo tổ / nhóm',
        slotLabel: 'Mục 3.2: Hoạt động luyện tập (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
    case 'troChoi':
      return {
        subFolderLabel: 'Trò chơi vận động',
        slotCode: '3.5',
        slotName: 'Phần Trò chơi vận động',
        slotLabel: 'Mục 3.5: Trò chơi vận động (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
    case 'vanDung':
      return {
        subFolderLabel: 'Vận dụng thực tế',
        slotCode: '4.2',
        slotName: 'Phần Vận dụng thực tế',
        slotLabel: 'Mục 4.2: Vận dụng thực tế (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
    case 'kyThuat':
    default:
      return {
        subFolderLabel: 'Động tác kỹ thuật mới',
        slotCode: '2.1',
        slotName: 'Phần Hình thành kiến thức mới',
        slotLabel: 'Mục 2.1: Khám phá & Hình thành kiến thức mới (Cột 1 - Nội dung)',
        targetColLabel: 'Cột 1 (Nội dung & Hình ảnh)'
      };
  }
}

function cleanEntityDisplayName(title: string): string {
  return (title || 'Hình ảnh SGK')
    .replace(/^\[3D\]\s*/i, '')
    .replace(/\s*-\s*SGK.*$/i, '')
    .replace(/\(Nền trong suốt\)/gi, '')
    .replace(/^Trò chơi(?:\s+bổ trợ khởi động|\s+vận động|\s+khởi động)?\s*[:\-]?\s*/i, '')
    .trim();
}

function getLessonDomain(topicIdOrName: string): 'cd1' | 'cd2' | 'cd3' | 'tttc' | 'other' {
  const s = (topicIdOrName || '').toLowerCase();
  if (s.includes('cd1') || s.includes('đội hình')) return 'cd1';
  if (s.includes('cd2') || s.includes('bài thể dục') || s.includes('bài tập thể dục')) return 'cd2';
  if (s.includes('cd3') || s.includes('tư thế') || s.includes('kĩ năng vận động') || s.includes('kỹ năng vận động')) {
    return 'cd3';
  }
  if (s.includes('tttc') || s.includes('thể thao tự chọn') || s.includes('bóng') || s.includes('bơi')) return 'tttc';
  return 'other';
}

function normalizeMovementCore(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/động tác/g, '')
    .replace(/với gậy/g, '')
    .replace(/ôn tập|học mới|học|ôn/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolvePpctUsageForImage(
  grade: number,
  subFolder: SubFolderType,
  specificEntityName: string,
  lesson: SgkLessonFolder | undefined,
  ppctList: PpctItem[]
): {
  weeks: number[];
  periods: number[];
  newMovementPeriods: number[];
  reviewMovementPeriods: number[];
  weekLabel: string;
} {
  const gradePpct = ppctList.filter((p) => Number(p.grade) === grade);
  const entityCore = normalizeMovementCore(specificEntityName);
  const lessonDomain = lesson ? getLessonDomain(`${lesson.topicId} ${lesson.topicName}`) : 'other';

  // Extract explicit week numbers from SGK lessonName e.g. "(Tuần 9)" or "(Tuần 8-9)"
  const explicitWeeks = new Set<number>();
  if (lesson?.lessonName) {
    const mRange = lesson.lessonName.match(/tuần\s*(\d+)\s*[-–]\s*(\d+)/i);
    if (mRange) {
      const startW = Number(mRange[1]);
      const endW = Number(mRange[2]);
      for (let w = startW; w <= endW; w++) explicitWeeks.add(w);
    } else {
      const mSingle = lesson.lessonName.match(/tuần\s*(\d+)/i);
      if (mSingle) explicitWeeks.add(Number(mSingle[1]));
    }
  }

  const lessonBaiMatch = lesson?.lessonName.match(/bài\s*(\d+)/i);
  const lessonBaiTag = lessonBaiMatch ? `bài ${lessonBaiMatch[1]}` : '';

  const matchedItems: PpctItem[] = [];
  const newMovementPeriods: number[] = [];
  const reviewMovementPeriods: number[] = [];

  for (const p of gradePpct) {
    const pTopicLower = (p.topic || '').toLowerCase();
    const pTitleLower = (p.lessonTitle || '').toLowerCase();
    if (/đánh giá|tổng kết|kiểm tra/i.test(pTopicLower) || /kiểm tra|đánh giá/i.test(pTitleLower)) {
      continue;
    }

    const pDomain = getLessonDomain(`${p.topic} ${p.lessonTitle}`);
    if (lessonDomain !== 'other' && pDomain !== 'other' && lessonDomain !== pDomain) {
      continue;
    }

    let isMatch = false;

    // 1. Direct movement keyword overlap when image is a technical movement in Bài thể dục
    if (subFolder === 'kyThuat' && entityCore.length >= 2) {
      const extracted = extractMovementNamesFromTitle(p.lessonTitle);
      const isP2 = p.period % 2 === 0 || /tiết\s*2/i.test(pTitleLower);
      if (extracted.length >= 2) {
        const part = partitionLessonMovements(extracted, isP2);
        const inNew = part.newMovements.some((m) => {
          const mc = normalizeMovementCore(m);
          return mc.length >= 2 && (mc.includes(entityCore) || entityCore.includes(mc));
        });
        const inRev = part.reviewMovements.some((m) => {
          const mc = normalizeMovementCore(m);
          return mc.length >= 2 && (mc.includes(entityCore) || entityCore.includes(mc));
        });
        if (inNew || inRev) {
          isMatch = true;
          if (inNew) newMovementPeriods.push(p.period);
          if (inRev) reviewMovementPeriods.push(p.period);
        }
      } else if (pTitleLower.includes(entityCore)) {
        isMatch = true;
        newMovementPeriods.push(p.period);
      }
    }

    // 2. Non-movement slot or lesson-level match within same domain
    if (!isMatch && lesson) {
      const lessonMovsMatch = lesson.movements.some((m) => {
        const mc = normalizeMovementCore(m);
        return mc.length >= 3 && pTitleLower.includes(mc);
      });
      const sameBai = lessonBaiTag && pTitleLower.includes(lessonBaiTag);
      const weekTagged = explicitWeeks.has(p.week);

      if (lessonMovsMatch || (sameBai && weekTagged) || (subFolder !== 'kyThuat' && weekTagged)) {
        isMatch = true;
      } else if (sameBai && explicitWeeks.size === 0) {
        isMatch = true;
      }
    }

    if (isMatch) {
      matchedItems.push(p);
    }
  }

  // Fallback to explicit weeks from lessonName if PPCT match was empty
  if (matchedItems.length === 0 && explicitWeeks.size > 0) {
    for (const p of gradePpct) {
      if (explicitWeeks.has(p.week)) {
        matchedItems.push(p);
      }
    }
  }

  const weeks = Array.from(new Set(matchedItems.map((m) => m.week))).sort((a, b) => a - b);
  const periods = Array.from(new Set(matchedItems.map((m) => m.period))).sort((a, b) => a - b);

  let weekLabel = '';
  if (weeks.length === 1) {
    weekLabel = `Tuần ${weeks[0]} (Tiết PPCT: ${periods.join(', ')})`;
  } else if (weeks.length > 1) {
    const consecutive = weeks.every((w, i) => i === 0 || w === weeks[i - 1] + 1);
    const wRange = consecutive ? `Tuần ${weeks[0]} - ${weeks[weeks.length - 1]}` : `Tuần ${weeks.join(', ')}`;
    weekLabel = `${wRange} (Tiết PPCT: ${periods.join(', ')})`;
  } else if (explicitWeeks.size > 0) {
    const arr = Array.from(explicitWeeks).sort((a, b) => a - b);
    weekLabel = arr.length > 1 ? `Tuần ${arr[0]} - ${arr[arr.length - 1]}` : `Tuần ${arr[0]}`;
  } else {
    weekLabel = `Theo PPCT Khối ${grade} (${lesson?.topicName || 'SGK GDTC'})`;
  }

  return {
    weeks,
    periods,
    newMovementPeriods,
    reviewMovementPeriods,
    weekLabel
  };
}

/**
 * Resolves full deterministic provenance for ANY library or lesson image:
 * which Grade, SGK Page, Lesson, Week(s)/Periods, and exact Lesson Plan Section/Column it belongs to.
 */
export function resolveImageUsageProvenance(
  img: Partial<SgkImageItem> & { title?: string; imgUrl?: string },
  ppctItems?: PpctItem[]
): ImageUsageProvenance {
  const title = img.title || 'Hình ảnh SGK';
  const tLower = title.toLowerCase();
  const idLower = (img.id || '').toLowerCase();
  const lessonTitleLower = (img.lessonTitle || '').toLowerCase();

  let grade = Number(img.grade || 0);
  if (![1, 3, 5].includes(grade)) {
    if (idLower.includes('k3_') || tLower.includes('lớp 3') || lessonTitleLower.includes('lớp 3')) grade = 3;
    else if (idLower.includes('k5_') || tLower.includes('lớp 5') || lessonTitleLower.includes('lớp 5')) grade = 5;
    else grade = 1;
  }

  const fakeItem: SgkImageItem = {
    id: img.id || 'preview',
    title,
    grade: String(grade),
    folder: img.folder,
    page: img.page || 0,
    category: img.category || 'dong_tac',
    imgUrl: img.imgUrl || '',
    caption: img.caption || '',
    lessonId: img.lessonId,
    lessonTitle: img.lessonTitle,
    topicId: img.topicId,
    topicTitle: img.topicTitle
  };

  const subFolder = getImageEffectiveSubFolder(fakeItem);
  const slotMeta = getSlotMetaBySubFolder(subFolder);
  const effectiveTree = getEffectiveSgkCurriculumTree();

  // Resolve exact SGK lesson: lessonId -> page -> movement/title
  let lesson: SgkLessonFolder | undefined = img.lessonId
    ? effectiveTree.find((f) => f.id === img.lessonId && f.grade === grade)
    : undefined;

  if (!lesson && img.page && img.page > 0) {
    lesson = findSgkLessonByPage(grade, img.page, effectiveTree);
  }
  if (!lesson && subFolder === 'kyThuat') {
    lesson = findSgkLessonForMovement(grade, title, effectiveTree);
  }
  if (!lesson) {
    lesson = findSgkLessonByTopicOrTitle(grade, img.lessonTitle || title, img.topicTitle || '');
  }

  const specificEntityName = cleanEntityDisplayName(title);
  const ppctData = ppctItems || getStoredPpctData();
  const ppctMatch = resolvePpctUsageForImage(grade, subFolder, specificEntityName, lesson, ppctData);

  const lessonName = lesson?.lessonName || img.lessonTitle || 'Bài học GDTC chuẩn SGK';
  const topicName = lesson?.topicName || img.topicTitle || `Chương trình GDTC Lớp ${grade}`;
  const cleanLessonShort = lessonName.replace(/\s*\(Tuần[^)]*\)/gi, '').trim();
  const pageText = img.page && img.page > 0 ? `Trang ${img.page} SGK Lớp ${grade}` : `SGK Lớp ${grade}`;

  let movementDetailNote = '';
  if (subFolder === 'kyThuat' && (ppctMatch.newMovementPeriods.length > 0 || ppctMatch.reviewMovementPeriods.length > 0)) {
    const parts: string[] = [];
    if (ppctMatch.newMovementPeriods.length > 0) {
      parts.push(`Học mới ở Tiết ${ppctMatch.newMovementPeriods.join(', ')}`);
    }
    if (ppctMatch.reviewMovementPeriods.length > 0) {
      parts.push(`Ôn tập ở Tiết ${ppctMatch.reviewMovementPeriods.join(', ')}`);
    }
    movementDetailNote = ` (${parts.join('; ')})`;
  }

  const summaryNotice =
    `Hình ảnh ${slotMeta.subFolderLabel} "${specificEntityName}" ` +
    `(${pageText} · ${cleanLessonShort}) sẽ được sử dụng cho giáo án ${ppctMatch.weekLabel}${movementDetailNote} ` +
    `và chèn vào ${slotMeta.slotLabel}.`;

  return {
    grade,
    subFolder,
    subFolderLabel: slotMeta.subFolderLabel,
    slotCode: slotMeta.slotCode,
    slotName: slotMeta.slotName,
    slotLabel: slotMeta.slotLabel,
    targetColLabel: slotMeta.targetColLabel,
    lessonId: lesson?.id || img.lessonId,
    lessonName,
    topicName,
    page: img.page,
    weeks: ppctMatch.weeks,
    periods: ppctMatch.periods,
    newMovementPeriods: ppctMatch.newMovementPeriods,
    reviewMovementPeriods: ppctMatch.reviewMovementPeriods,
    weekLabel: ppctMatch.weekLabel,
    specificEntityName,
    summaryNotice
  };
}

export interface SlotMissingImageNotice {
  subFolder: SubFolderType;
  slotCode: string;
  slotLabel: string;
  entityLabel: string;
  lessonName: string;
  pageLabel: string;
  suggestedPage?: number;
  message: string;
}

/**
 * Computes an explicit, actionable missing-image notice when a lesson plan row (1.2, 1.3, 2.1, 3.2, 3.5, 4.2)
 * has no matching authentic SGK image in the library — instead of substituting a wrong photo or formation diagram.
 */
export function resolveSlotMissingImageNotice(
  grade: number,
  rowContent: string,
  lessonTitle: string = '',
  topic: string = ''
): SlotMissingImageNotice | null {
  const cLower = (rowContent || '').toLowerCase();
  const titleLower = (lessonTitle || '').toLowerCase();

  // Assessment / review-only / attendance / cooldown rows do not require extracted SGK figures
  if (/kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(titleLower)) {
    return null;
  }

  let subFolder: SubFolderType | null = null;
  if (cLower.includes('1.3.') || (cLower.includes('trò chơi') && cLower.includes('khởi động'))) {
    subFolder = 'troChoiKhoiDong';
  } else if (!cLower.includes('1.1.') && (cLower.includes('1.2.') || cLower.includes('khởi động chung'))) {
    subFolder = 'khoiDong';
  } else if (cLower.includes('2.1.') || cLower.includes('khám phá') || cLower.includes('kiến thức mới')) {
    subFolder = 'kyThuat';
  } else if (cLower.includes('3.5.') || (cLower.includes('3.4.') && cLower.includes('trò chơi')) || cLower.includes('trò chơi vận động')) {
    subFolder = 'troChoi';
  } else if (cLower.includes('3.2.') || cLower.includes('tập luyện theo tổ')) {
    subFolder = 'luyenTap';
  } else if (cLower.includes('4.2.') || cLower.includes('vận dụng')) {
    subFolder = 'vanDung';
  }

  if (!subFolder) return null;

  const effectiveTree = getEffectiveSgkCurriculumTree();
  let lesson = findSgkLessonByTopicOrTitle(grade, lessonTitle, topic);

  if (subFolder === 'kyThuat') {
    const movFromContent = extractMovementNamesFromTitle(rowContent);
    const movFromTitle = extractMovementNamesFromTitle(lessonTitle);
    const firstMov = movFromContent[0] || movFromTitle[0];
    if (firstMov) {
      const exactMovLesson = findSgkLessonForMovement(grade, firstMov, effectiveTree);
      if (exactMovLesson) lesson = exactMovLesson;
    }
  }

  const slotMeta = getSlotMetaBySubFolder(subFolder);
  const cleanLessonName = lesson
    ? lesson.lessonName.replace(/\s*\(Tuần[^)]*\)/gi, '').trim()
    : (lessonTitle || 'Bài học theo PPCT').replace(/\s*\([^)]*\)/g, '').trim();

  let entityLabel = slotMeta.subFolderLabel;
  let suggestedPage: number | undefined = lesson?.startPage;

  if (subFolder === 'khoiDong') {
    entityLabel = 'Khởi động chung (xoay các khớp)';
    suggestedPage = lesson?.subFolders?.khoiDong?.suggestedPage || lesson?.startPage;
  } else if (subFolder === 'troChoiKhoiDong') {
    const qMatch = (rowContent || '').match(/[""“']([^""”']+)[""”']/);
    const gameName = qMatch?.[1]?.trim() || lesson?.subFolders?.troChoiKhoiDong?.items?.[0]?.gameName || 'Trò chơi bổ trợ khởi động';
    entityLabel = `Trò chơi khởi động "${gameName}"`;
    const matchedItem = lesson?.subFolders?.troChoiKhoiDong?.items?.find((it) =>
      (it.gameName || it.name || '').toLowerCase().includes(gameName.toLowerCase().slice(0, 8))
    );
    suggestedPage = matchedItem?.page || lesson?.subFolders?.troChoiKhoiDong?.suggestedPage || lesson?.startPage;
  } else if (subFolder === 'kyThuat') {
    const movList = extractMovementNamesFromTitle(lessonTitle);
    const specificFromRow = extractMovementNamesFromTitle(rowContent);
    const isP2 = /tiết\s*2/i.test(titleLower);
    const partitioned = movList.length >= 2 ? partitionLessonMovements(movList, isP2) : null;
    const targetMovs = partitioned?.newMovements?.length
      ? partitioned.newMovements
      : specificFromRow.length > 0
      ? specificFromRow
      : movList;

    entityLabel = targetMovs.length > 0 ? targetMovs.join(', ') : 'Động tác kỹ thuật mới';
    const firstKeyWord = (targetMovs[0] || '').toLowerCase().replace(/^động tác\s+/i, '').trim();
    const matchedTechItem = firstKeyWord
      ? lesson?.subFolders?.kyThuat?.items?.find((it) => it.name.toLowerCase().includes(firstKeyWord))
      : lesson?.subFolders?.kyThuat?.items?.[0];
    suggestedPage = matchedTechItem?.page || lesson?.subFolders?.kyThuat?.items?.[0]?.page || lesson?.startPage;
  } else if (subFolder === 'luyenTap') {
    entityLabel = 'Luyện tập theo tổ / nhóm';
    suggestedPage = lesson?.subFolders?.luyenTap?.items?.[0]?.page || lesson?.startPage;
  } else if (subFolder === 'troChoi') {
    const qMatch = (rowContent || '').match(/[""“']([^""”']+)[""”']/);
    const gameName = qMatch?.[1]?.trim() || lesson?.subFolders?.troChoi?.items?.[0]?.gameName || 'Trò chơi vận động';
    entityLabel = `Trò chơi vận động "${gameName}"`;
    const matchedItem = lesson?.subFolders?.troChoi?.items?.find((it) =>
      (it.gameName || it.name || '').toLowerCase().includes(gameName.toLowerCase().slice(0, 8))
    );
    suggestedPage = matchedItem?.page || lesson?.subFolders?.troChoi?.suggestedPage || lesson?.startPage;
  } else if (subFolder === 'vanDung') {
    entityLabel = 'Vận dụng thực tế';
    suggestedPage = lesson?.subFolders?.vanDung?.suggestedPage || lesson?.endPage || lesson?.startPage;
  }

  const pageLabel = suggestedPage
    ? `Trang ${suggestedPage}`
    : lesson
    ? `Trang ${lesson.startPage}-${lesson.endPage}`
    : '';

  const sgkRef = [cleanLessonName, pageLabel].filter(Boolean).join(' · ');
  const message =
    `Chưa tìm được hình phù hợp cho ${entityLabel} — ` +
    `Cần trích xuất từ hình ảnh SGK GDTC Lớp ${grade} (${sgkRef}) và phân loại vào "${slotMeta.subFolderLabel}".`;

  return {
    subFolder,
    slotCode: slotMeta.slotCode,
    slotLabel: slotMeta.slotLabel,
    entityLabel,
    lessonName: cleanLessonName,
    pageLabel,
    suggestedPage,
    message
  };
}

