import { SgkImageItem, SubFolderType } from '../types/gdtc';
import {
  SgkLessonFolder,
  doesImageBelongToSgkLesson,
  getEffectiveSgkCurriculumTree
} from '../data/sgkCurriculumTree';

export type LibrarySortMode = 'sgk' | 'page' | 'title' | 'newest';

export const SUBFOLDER_ORDER_RANK: Record<SubFolderType, number> = {
  khoiDong: 1,
  troChoiKhoiDong: 2,
  kyThuat: 3,
  luyenTap: 4,
  troChoi: 5,
  vanDung: 6
};

export type PracticeSubSlotType = 'dong_loat' | 'to_nhom' | 'cap_doi' | 'ca_nhan' | 'general';

/**
 * Resolves the canonical subfolder key of an SgkImageItem from its folder or category metadata.
 */
export function getImageSubFolderKey(img: SgkImageItem): SubFolderType {
  if (img.folder && SUBFOLDER_ORDER_RANK[img.folder]) {
    return img.folder;
  }
  switch (img.category) {
    case 'khoi_dong':
      return 'khoiDong';
    case 'tro_choi_khoi_dong':
      return 'troChoiKhoiDong';
    case 'tap_luyen':
      return 'luyenTap';
    case 'tro_choi':
      return 'troChoi';
    case 'van_dung':
      return 'vanDung';
    default:
      return 'kyThuat';
  }
}

/**
 * Detects whether a Luyện tập image specifically depicts đồng loạt, tổ nhóm, cặp đôi, or cá nhân / thi đua.
 */
export function detectPracticeSubSlotType(img: SgkImageItem): PracticeSubSlotType {
  const corpus = `${img.title || ''} ${(img.caption || '').split('•')[0] || ''}`.toLowerCase();
  if (/cặp\s*đôi|theo\s*cặp|hai\s*bạn|đôi\s*bạn|từng\s*cặp/i.test(corpus)) {
    return 'cap_doi';
  }
  if (/cá\s*nhân|tự\s*tập|thi\s*đua|trình\s*diễn|biểu\s*diễn/i.test(corpus)) {
    return 'ca_nhan';
  }
  if (/đồng\s*loạt|cả\s*lớp|toàn\s*lớp/i.test(corpus)) {
    return 'dong_loat';
  }
  if (/tổ|nhóm|theo\s*hàng|tiếp\s*sức/i.test(corpus)) {
    return 'to_nhom';
  }
  return 'general';
}

function getLessonTreeIndex(img: SgkImageItem, tree: SgkLessonFolder[]): number {
  const gradeNum = Number(img.grade) || 99;
  for (let i = 0; i < tree.length; i++) {
    const folder = tree[i];
    if (folder.grade !== gradeNum) continue;
    if (
      img.lessonId === folder.id ||
      (img.topicId === folder.topicId && img.lessonId === folder.lessonId)
    ) {
      return i;
    }
  }
  for (let i = 0; i < tree.length; i++) {
    const folder = tree[i];
    if (folder.grade !== gradeNum) continue;
    if (doesImageBelongToSgkLesson(img, folder)) {
      return i;
    }
  }
  return 9999;
}

/**
 * Sorts library images deterministically according to the chosen mode.
 * Default 'sgk' mode aligns strictly with the SGK curriculum tree hierarchy:
 * Grade -> Lesson order in SGK tree -> 6-subfolder pedagogical order -> Manual sortOrder -> SGK Page -> Title.
 */
export function sortLibraryImages(
  images: SgkImageItem[],
  mode: LibrarySortMode = 'sgk',
  tree: SgkLessonFolder[] = getEffectiveSgkCurriculumTree()
): SgkImageItem[] {
  if (!images || images.length <= 1) return images ? [...images] : [];

  // Precompute lesson tree index once per image for O(N log N) sorting
  const lessonRankMap = new Map<string, number>();
  if (mode === 'sgk') {
    for (const img of images) {
      lessonRankMap.set(img.id, getLessonTreeIndex(img, tree));
    }
  }

  return [...images].sort((a, b) => {
    if (mode === 'newest') {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      if (timeA !== timeB) return timeB - timeA;
      return (a.title || '').localeCompare(b.title || '', 'vi', { numeric: true });
    }

    if (mode === 'title') {
      const cmp = (a.title || '').localeCompare(b.title || '', 'vi', { numeric: true });
      if (cmp !== 0) return cmp;
      return (Number(a.grade) || 99) - (Number(b.grade) || 99);
    }

    if (mode === 'page') {
      const gA = Number(a.grade) || 99;
      const gB = Number(b.grade) || 99;
      if (gA !== gB) return gA - gB;

      const pA = typeof a.page === 'number' && a.page > 0 ? a.page : 9999;
      const pB = typeof b.page === 'number' && b.page > 0 ? b.page : 9999;
      if (pA !== pB) return pA - pB;

      const fA = SUBFOLDER_ORDER_RANK[getImageSubFolderKey(a)] || 99;
      const fB = SUBFOLDER_ORDER_RANK[getImageSubFolderKey(b)] || 99;
      if (fA !== fB) return fA - fB;

      return (a.title || '').localeCompare(b.title || '', 'vi', { numeric: true });
    }

    // Default 'sgk' tree order
    const gA = Number(a.grade) || 99;
    const gB = Number(b.grade) || 99;
    if (gA !== gB) return gA - gB;

    const lA = lessonRankMap.get(a.id) ?? 9999;
    const lB = lessonRankMap.get(b.id) ?? 9999;
    if (lA !== lB) return lA - lB;

    const fA = SUBFOLDER_ORDER_RANK[getImageSubFolderKey(a)] || 99;
    const fB = SUBFOLDER_ORDER_RANK[getImageSubFolderKey(b)] || 99;
    if (fA !== fB) return fA - fB;

    const hasOrderA = typeof a.sortOrder === 'number';
    const hasOrderB = typeof b.sortOrder === 'number';
    if (hasOrderA && hasOrderB && a.sortOrder !== b.sortOrder) {
      return (a.sortOrder as number) - (b.sortOrder as number);
    }
    if (hasOrderA && !hasOrderB) return -1;
    if (!hasOrderA && hasOrderB) return 1;

    const pA = typeof a.page === 'number' && a.page > 0 ? a.page : 9999;
    const pB = typeof b.page === 'number' && b.page > 0 ? b.page : 9999;
    if (pA !== pB) return pA - pB;

    return (a.title || '').localeCompare(b.title || '', 'vi', { numeric: true });
  });
}
