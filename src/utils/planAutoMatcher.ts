import { LessonRow, SgkImageItem } from '../types/gdtc';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { standardFormationDiagrams, FormationDiagram, getFormationDiagramByKeyword } from '../data/formationDiagrams';
import { standardMovementsLibrary, findMatchingMovement, MovementTechnicalItem } from '../data/movementLibrary';
import { sgkCurriculumTree, SgkLessonFolder } from '../data/sgkCurriculumTree';

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
  const t = (img.title || '').toLowerCase();
  const c = (img.caption || '').toLowerCase();
  const folder = (img.folder || '').toLowerCase();
  const cat = (img.category || '').toLowerCase();

  if (cat === 'tro_choi' || cat === 'tro_choi_khoi_dong' || folder === 'trochoi' || folder === 'trochoikhoidong') {
    return true;
  }
  if (t.includes('trò chơi') || t.includes('tro choi') || c.includes('trò chơi') || c.includes('tro choi')) {
    return true;
  }
  const gameKeywords = [
    'lò cò tiếp sức',
    'tiếp sức',
    'chuyền gậy',
    'kết bạn',
    'mèo đuổi chuột',
    'chim về tổ',
    'hoàng anh hoàng yến',
    'chạy theo hình',
    'cướp cờ',
    'kéo co',
    'thỏ nhường hang'
  ];
  return gameKeywords.some((kw) => t.includes(kw) || c.includes(kw));
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
    url: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
    title: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp - SGK Lớp 3 (Trang 28)'
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
    url: '/assets/sgk_chuan/k5_van_minh_voi_gay.jpg',
    title: 'Động tác Vặn mình với gậy - SGK GDTC Lớp 5 (Trang 30)'
  },
  toan_than: {
    url: '/assets/sgk_chuan/k5_toan_than_voi_gay.jpg',
    title: 'Động tác Toàn thân với gậy - SGK GDTC Lớp 5 (Trang 31)'
  },
  nhay_gay: {
    url: '/assets/sgk_chuan/k5_toan_than_voi_gay.jpg',
    title: 'Động tác Nhảy với gậy - SGK GDTC Lớp 5 (Trang 34)'
  },
  dieu_hoa_gay: {
    url: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    title: 'Động tác Điều hòa với gậy - SGK GDTC Lớp 5 (Trang 35)'
  },
  nhay: {
    url: '/assets/sgk_chuan/k1_chan.jpg',
    title: 'Động tác Nhảy - SGK GDTC'
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
  userImages: SgkImageItem[] = []
): MovementProfile {
  const lower = rawName.toLowerCase();
  let key = 'vuon_tho';
  let cleanName = rawName.trim();

  if (lower.includes('phối hợp') || lower.includes('phoi hop')) {
    key = grade === 5 ? 'toan_than_gay' : 'phoi_hop';
    cleanName = grade === 5 ? 'Động tác Toàn thân với gậy' : 'Động tác Phối hợp';
  } else if (lower.includes('điều hòa') || lower.includes('dieu hoa')) {
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
    // If erroneously present, automatically sanitize to Nhảy với gậy for Grade 5 (GDTC 5 has no thăng bằng)
    key = grade === 5 ? 'nhay_gay' : 'phoi_hop';
    cleanName = grade === 5 ? 'Động tác Nhảy với gậy' : 'Động tác Phối hợp';
  } else if (lower.includes('đi đều') || lower.includes('đứng lại')) {
    key = lower.includes('ôn') || lower.includes('đổi chân') || lower.includes('sai nhịp') ? 'on_di_deu' : 'di_deu';
    cleanName = key === 'on_di_deu' ? 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp' : 'Động tác Đi đều, Đứng lại';
  } else if (lower.includes('gậy')) {
    key = 'gay';
    cleanName = 'Bài tập thể dục với gậy';
  }

  // Find authentic textbook image
  const technicalOnlyImages = userImages.filter((img) => !isGameImage(img));
  const matchedUserImg = technicalOnlyImages.find((img) => {
    const t = img.title.toLowerCase();
    const c = (img.caption || '').toLowerCase();
    if (t.includes('trò chơi') || t.includes('tro choi')) return false;

    if (key === 'vuon_tho') return t.includes('vươn thở') || c.includes('vươn thở');
    if (key === 'tay') return (t.includes('động tác tay') || c.includes('động tác tay') || t.includes('tay')) && !t.includes('cổ tay');
    if (key === 'chan') return (t.includes('động tác chân') || t.includes('chân')) && !t.includes('cổ chân') && !t.includes('vươn thở');
    if (key === 'luon') return t.includes('lườn') || c.includes('lườn');
    if (key === 'bung') return (t.includes('bụng') || c.includes('bụng')) && !t.includes('gậy');
    if (key === 'van_minh') return (t.includes('vặn mình') || c.includes('vặn mình')) && !t.includes('gậy');
    if (key === 'toan_than') return (t.includes('toàn thân') || c.includes('toàn thân')) && !t.includes('gậy');
    if (key === 'phoi_hop') return t.includes('phối hợp') || c.includes('phối hợp') || t.includes('k1_phoi_hop');
    if (key === 'dieu_hoa') return t.includes('điều hòa') || c.includes('điều hòa') || t.includes('k1_dieu_hoa');
    if (key === 'chan_gay') return (t.includes('chân') || c.includes('chân')) && (t.includes('gậy') || c.includes('gậy'));
    if (key === 'bung_gay') return (t.includes('bụng') || c.includes('bụng')) && (t.includes('gậy') || c.includes('gậy'));
    if (key === 'van_minh_gay') return (t.includes('vặn mình') || c.includes('vặn mình')) && (t.includes('gậy') || c.includes('gậy'));
    if (key === 'toan_than_gay') return (t.includes('toàn thân') || c.includes('toàn thân')) && (t.includes('gậy') || c.includes('gậy'));
    if (key === 'vuon_tho_tay_gay') return (t.includes('vươn thở') || t.includes('tay')) && (t.includes('gậy') || c.includes('gậy'));
    if (key === 'on_di_deu') return t.includes('ôn đi đều') || t.includes('đổi chân') || t.includes('sai nhịp');
    if (key === 'di_deu') return t.includes('đi đều') || c.includes('đi đều');
    return false;
  });

  let resolvedImgUrl = '';
  let resolvedImgTitle = '';

  if (matchedUserImg && !matchedUserImg.imgUrl.startsWith('data:image/svg+xml')) {
    resolvedImgUrl = matchedUserImg.imgUrl;
    resolvedImgTitle = matchedUserImg.title;
  } else if (AUTHENTIC_TEXTBOOK_MAP[key]) {
    resolvedImgUrl = AUTHENTIC_TEXTBOOK_MAP[key].url;
    resolvedImgTitle = AUTHENTIC_TEXTBOOK_MAP[key].title;
  } else if (matchedUserImg) {
    resolvedImgUrl = matchedUserImg.imgUrl;
    resolvedImgTitle = matchedUserImg.title;
  } else {
    resolvedImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
    resolvedImgTitle = `Kỹ thuật SGK: ${cleanName}`;
  }

  let steps = '';
  let gv = '';
  let hs = '';
  let practiceFocus = '';

  switch (key) {
    case 'phoi_hop':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái ra trước chếch sang trái một bước, khuỵu gối chân trước, chân sau thẳng, đồng thời hai tay đưa ra trước chếch lên cao chữ V, lòng bàn tay hướng vào nhau, ngửa đầu, mắt nhìn theo tay (hít vào).\n- Nhịp 2: Rút chân trái về, đồng thời cúi gập thân sâu, hai tay chạm hai mũi bàn chân, hai chân giữ thẳng, đầu cúi (thở ra).\n- Nhịp 3: Đứng thẳng lên, hai tay dang ngang bằng vai, lòng bàn tay ngửa, ngực căng (hít vào).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải chếch sang phải.`;
      gv = `- GV giới thiệu Động tác Phối hợp (Bài 3 SGK GDTC Lớp 1), phân tích tác dụng phát triển sức mạnh của cơ đùi, độ dẻo dai của cột sống và khả năng phối hợp nhịp nhàng giữa tay, chân và thân mình.\n- Làm mẫu kỹ thuật 2 - 3 lần theo phương pháp chiều gương kết hợp phân tích nhịp: nhịp 1 bước khuỵu gối vươn tay, nhịp 2 gập sâu giữ chân thẳng, nhịp 3 mở rộng lồng ngực.\n- Cho học sinh quan sát tranh kỹ thuật SGK, nhấn mạnh việc giữ thăng bằng khi dồn trọng tâm vào chân trước.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn kịp thời cho những em chân sau bị chùng hoặc chưa giữ thẳng chân khi cúi gập.\n- Biểu dương tinh thần tập luyện nghiêm túc và động tác chuẩn xác của học sinh.`;
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
      gv = `- GV giới thiệu Động tác Chân, phân tích tác dụng tăng cường sức mạnh cơ đùi, khớp gối, cổ chân và rèn luyện khả năng giữ thăng bằng cơ thể.\n- Làm mẫu chuẩn 2 - 3 lần theo phương pháp chiều gương; nhấn mạnh nhịp 1 kiễng cao gót giữ thăng bằng trên nửa trước bàn chân, nhịp 2 khuỵu gối sâu nhưng thân người luôn giữ thẳng, không chúi đầu ra trước.\n- Cho học sinh quan sát tranh kỹ thuật SGK, chỉ rõ vị trí đặt hai tay chống hông và hai tay song song ngang vai.\n- Hô nhịp chậm hướng dẫn lớp tập từng nhịp; phát hiện các lỗi sai (mất thăng bằng ngả nghiêng, cong gập lưng khi khuỵu gối) và trực tiếp uốn nắn sửa sai.\n- Biểu dương tinh thần tập luyện nghiêm túc của học sinh.`;
      hs = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n- Chăm chú quan sát tư thế kiễng gót thăng bằng và cách khuỵu gối lưng thẳng của giáo viên.\n- Mô phỏng động tác theo nhịp đếm chậm; cố gắng giữ thăng bằng không để người chao đảo.\n- Lắng nghe góp ý của thầy cô để hoàn thiện độ sâu của gối và độ thẳng của lưng.`;
      practiceFocus = 'kiễng gót thăng bằng và khuỵu gối sâu giữ lưng thẳng';
      break;

    case 'luon':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Nghiêng lườn sâu sang trái, tay trái chống hông, tay phải vươn cao ép sát tai, trọng tâm dồn chân phải.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân bước sang phải và nghiêng lườn sang phải.`;
      gv = `- GV giới thiệu Động tác Lườn, giải thích tác dụng làm giãn mềm cột sống, phát triển các nhóm cơ liên sườn và rèn luyện độ dẻo dai cơ thể.\n- Làm mẫu chuẩn xác 2 - 3 lần; nhấn mạnh điểm kỹ thuật quan trọng: khi nghiêng người phải giữ thân trên trên một mặt phẳng trán, không gập người ra trước hoặc ngửa ra sau, hai chân giữ thẳng.\n- Cho học sinh xem tranh kỹ thuật SGK, chỉ rõ độ cong của tay vươn trên đầu và tư thế tay chống hông.\n- Hô nhịp chậm cho học sinh tập thử; kịp thời phát hiện và sửa các lỗi sai xoay vặn thân mình thay vì nghiêng lườn.\n- Khen ngợi những em thực hiện độ uốn lườn sâu và đúng kỹ thuật.`;
      hs = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát hướng uốn của thân người trên mặt phẳng trán, ghi nhớ nhịp thở đều đặn.\n- Thực hiện từng nhịp chậm rãi, tự cảm nhận độ căng của cơ lườn khi uốn nghiêng.\n- Tích cực sửa sai tư thế tay áp sát tai theo hướng dẫn của giáo viên.`;
      practiceFocus = 'độ uốn lườn sâu trên mặt phẳng trán và tay vươn sát tai';
      break;

    case 'bung':
      steps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng hơn vai, hai tay đưa thẳng lên cao song song, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ.\n- Nhịp 2: Cúi gập thân sâu ra trước, cúi đầu, hai tay hướng xuống chạm hai mu bàn chân, hai chân giữ thẳng.\n- Nhịp 3: Đứng thẳng lên, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.`;
      gv = `- GV giới thiệu Động tác Bụng, phân tích tác dụng tăng cường độ dẻo dai của gân kheo cơ đùi sau và săn chắc các nhóm cơ bụng.\n- Làm mẫu trực quan 2 - 3 lần kết hợp phân tích nhịp: nhịp 1 vươn căng hai tay lên cao, nhịp 2 gập sâu thân người thở ra hết, hai chân giữ thẳng không được co gập gối.\n- Cho học sinh quan sát tranh vẽ kỹ thuật SGK, lưu ý tư thế đầu cúi tự nhiên theo thân người.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn cho những em chân còn bị co gập hoặc cúi gập quá vội vàng.\n- Tuyên dương các em giữ được chân thẳng và chạm tay tới mu bàn chân.`;
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
      gv = `- GV giới thiệu Động tác Toàn thân, phân tích tác dụng kéo giãn liên hoàn các nhóm cơ đùi, lưng và cánh tay, nâng cao khả năng phối hợp vận động toàn diện.\n- Thị phạm chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích kỹ thuật dồn trọng tâm lên chân trước khi khuỵu gối và độ căng cơ lưng khi cúi gập.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK, chỉ rõ độ mở của hai chân.\n- Hô nhịp chậm cho học sinh tập mô phỏng; kịp thời uốn nắn tư thế khuỵu gối vững chãi và thẳng chân sau.\n- Khen ngợi những em thực hiện nhịp nhàng, vững vàng thăng bằng.`;
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
      gv = `- GV giới thiệu Động tác Bụng với gậy (SGK Lớp 5 Trang 30), phân tích tác dụng tăng cường độ dẻo của cột sống, phát triển cơ bụng và cơ đùi sau.\n- Làm mẫu trực quan 2 - 3 lần kết hợp phân tích kỹ thuật: nhịp 1 nâng gậy lên cao thân thẳng, nhịp 2 cúi gập thân sâu thở ra hết, hai chân giữ thẳng không được co gập gối, gậy chạm mũi bàn chân.\n- Cho học sinh quan sát hình ảnh kỹ thuật SGK lớp 5 trang 30, lưu ý cách cầm hai đầu gậy chắc chắn.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn cho những em chân còn bị co gập hoặc cúi gập vội vàng.\n- Tuyên dương các em giữ được chân thẳng và hạ gậy chạm mũi chân chuẩn xác.`;
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
  const contentLower = (content || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const combined = `${content} ${title}`.toLowerCase();

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

  // 1. Check if multiple movements are specified in the title
  const extracted = extractMovementNamesFromTitle(title);

  if (extracted.length >= 2) {
    const partition = partitionLessonMovements(extracted, isPeriod2);
    const { newMovements, reviewMovements } = partition;

    // CASE A: Tiết 2 with Review of Period 1 movements
    if (isPeriod2 && reviewMovements.length > 0) {
      const newProfiles = newMovements.map((m) => getSingleMovementProfile(m, grade, userImages));
      const revProfiles = reviewMovements.map((m) => getSingleMovementProfile(m, grade, userImages));

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
      ];

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
      const newProfiles = newMovements.map((m) => getSingleMovementProfile(m, grade, userImages));
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
      const allImages = newProfiles.map((n, i) => ({ id: `img_new_${i}`, url: n.imgUrl, title: n.imgTitle }));

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
      const single = getSingleMovementProfile(newMovements[0], grade, userImages);
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
        allImages: [{ id: 'img_single', url: single.imgUrl, title: single.imgTitle }]
      };
    }
  }

  // 2. Fallback: single movement detection
  let targetName = 'Động tác Vươn thở';
  if (titleLower.includes('phối hợp') || (titleLower.includes('bài 3') && grade === 1 && !isPeriod22 && !titleLower.includes('điều hòa'))) {
    targetName = 'Động tác Phối hợp';
  } else if (titleLower.includes('điều hòa') || isPeriod22) {
    targetName = 'Động tác Điều hòa';
  } else if (titleLower.includes('chân')) {
    targetName = grade === 5 ? 'Động tác Chân với gậy' : 'Động tác Chân';
  } else if (titleLower.includes('lườn')) {
    targetName = 'Động tác Lườn';
  } else if (titleLower.includes('bụng')) {
    targetName = grade === 5 ? 'Động tác Bụng với gậy' : 'Động tác Bụng';
  } else if (titleLower.includes('vặn mình')) {
    targetName = grade === 5 ? 'Động tác Vặn mình với gậy' : 'Động tác Vặn mình';
  } else if (titleLower.includes('tay')) {
    targetName = grade === 5 ? 'Động tác Tay với gậy' : 'Động tác Tay';
  } else if (titleLower.includes('đi đều')) {
    targetName = isPeriod2 ? 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp' : 'Động tác Đi đều, Đứng lại';
  }

  const profile = getSingleMovementProfile(targetName, grade, userImages);
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
    allImages: [{ id: 'img_single', url: profile.imgUrl, title: profile.imgTitle }]
  };
}

/**
 * Resolves an authentic game image from the user library or standard SGK assets matching the game name.
 */
export function resolveAccurateGameImage(
  gameName: string = '',
  grade: number = 1,
  category: 'tro_choi_kd' | 'tro_choi_vd' = 'tro_choi_vd',
  userImages: SgkImageItem[] = []
): { url: string; title: string } {
  const cleanName = (gameName || '').toLowerCase().trim();

  // 1. Search user library for exact or keyword matching strictly for this grade
  if (userImages && userImages.length > 0) {
    const match = userImages.find((img) => {
      if (img.grade && String(img.grade) !== String(grade)) return false;
      const t = (img.title || '').toLowerCase();
      const c = (img.caption || '').toLowerCase();
      if (!isGameImage(img)) return false;
      if (cleanName && (t.includes(cleanName) || c.includes(cleanName))) return true;

      const words = cleanName.split(/\s+/).filter((w) => w.length > 3);
      return words.length > 0 && words.some((w) => t.includes(w) || c.includes(w));
    });

    if (match) {
      return {
        url: match.imgUrl,
        title: match.title || `Trò chơi: ${gameName}`
      };
    }
  }

  // 2. Authoritative textbook image mapping by grade
  if (grade === 1) {
    if (cleanName.includes('kết bạn') || cleanName.includes('ket ban')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
        title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC 1 (Trang 31)'
      };
    }
    if (cleanName.includes('lò cò') || cleanName.includes('lo co') || cleanName.includes('tiếp sức')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
        title: 'Trò chơi bổ trợ khéo léo: Lò cò tiếp sức - SGK GDTC 1 (Trang 34)'
      };
    }
    if (cleanName.includes('thỏ') || cleanName.includes('tho') || cleanName.includes('hiệu lệnh')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
        title: `Trò chơi SGK Khối 1: ${gameName || 'Con thỏ / Làm theo hiệu lệnh'}`
      };
    }
    // Default fallback for Grade 1
    if (category === 'tro_choi_kd') {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
        title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC 1 (Trang 31)'
      };
    } else {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
        title: 'Trò chơi bổ trợ khéo léo: Lò cò tiếp sức - SGK GDTC 1 (Trang 34)'
      };
    }
  }

  if (grade === 3) {
    return {
      url: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
      title: `Trò chơi SGK Khối 3: ${gameName || 'Chạy theo hình tam giác / Đua ô tô'}`
    };
  }

  // Grade 5 (Bài tập thể dục với gậy - Trò chơi chính khóa SGK GDTC 5)
  if (cleanName.includes('trao gậy') || cleanName.includes('trao gay')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_trao_gay_tiep_suc.jpg',
      title: 'Trò chơi vận động: Trao gậy tiếp sức - SGK GDTC 5 (Trang 32)'
    };
  }
  if (cleanName.includes('chuyền gậy') || cleanName.includes('chuyen gay')) {
    return {
      url: '/assets/sgk_chuan/k5_chuyen_gay_tiep_suc.jpg',
      title: 'Trò chơi vận động: Chuyền gậy tiếp sức - SGK GDTC 5 (Trang 26)'
    };
  }
  if (cleanName.includes('nhanh nhất') || cleanName.includes('đội nào') || cleanName.includes('doi nao') || cleanName.includes('nhanh nhat')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Đội nào nhanh nhất - SGK GDTC 5 (Trang 29)'
    };
  }
  if (cleanName.includes('kéo khoẻ') || cleanName.includes('keo khoe') || cleanName.includes('ai kéo') || cleanName.includes('nhanh hơn với gậy')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Ai kéo khoẻ hơn - SGK GDTC 5 (Trang 27)'
    };
  }
  if (cleanName.includes('người thừa') || cleanName.includes('nguoi thua') || cleanName.includes('thừa thứ hai')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Người thừa thứ hai - SGK GDTC 5 (Trang 34)'
    };
  }
  if (category === 'tro_choi_kd') {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: `Trò chơi bổ trợ khởi động: ${gameName || 'Ai kéo khoẻ hơn'} - SGK GDTC 5 (Trang 27)`
    };
  }
  return {
    url: '/assets/sgk_chuan/k5_tro_choi_trao_gay_tiep_suc.jpg',
    title: `Trò chơi vận động: ${gameName || 'Trao gậy tiếp sức'} - SGK GDTC 5 (Trang 32)`
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
  const accurate = resolveAccurateMovement('', title, grade, userImages);
  const mName = accurate.movementName;

  const isG1Bai2 =
    grade === 1 &&
    (title.toLowerCase().includes('chân') ||
      title.toLowerCase().includes('vặn mình') ||
      title.toLowerCase().includes('bụng') ||
      title.toLowerCase().includes('bài 2'));
  const isG1Bai3 =
    grade === 1 &&
    (title.toLowerCase().includes('phối hợp') ||
      title.toLowerCase().includes('điều hòa') ||
      title.toLowerCase().includes('bài 3'));

  const defaultG1Warmup = isG1Bai2 ? 'Kết bạn' : 'Làm theo hiệu lệnh';
  const defaultG1Practice = isG1Bai2 ? 'Lò cò tiếp sức' : isG1Bai3 ? 'Mèo đuổi chuột' : 'Thỏ nhường hang';

  const resolvedWarmup =
    customWarmupGame ||
    (grade === 1 ? defaultG1Warmup : grade === 3 ? 'Chui qua hầm' : 'Ai kéo khoẻ hơn');
  const resolvedPractice =
    customPracticeGame ||
    (grade === 1 ? defaultG1Practice : grade === 3 ? 'Đua ô tô' : 'Trao gậy tiếp sức');

  const warmupImg = resolveAccurateGameImage(resolvedWarmup, grade, 'tro_choi_kd', userImages);
  const practiceImg = resolveAccurateGameImage(resolvedPractice, grade, 'tro_choi_vd', userImages);

  const equipmentDesc =
    grade === 5
      ? 'Gậy thể dục, cọc tiêu theo chuẩn nội dung trò chơi.'
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  return [
    // HÀNG 1: MỞ ĐẦU & KHỞI ĐỘNG (Gắn ảnh Trò chơi khởi động chuẩn SGK)
    {
      content: `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}".`,
      lvd: `5 - 7 phút\n2L x 8N`,
      gv: `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.\n- Tổ chức trò chơi bổ trợ khởi động "${resolvedWarmup}" tạo không khí vui tươi, hào hứng trước khi vào bài mới; quan sát bao quát và nhắc nhở tinh thần tập trung, trật tự.`,
      hs: `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.\n- Hào hứng tham gia trò chơi khởi động "${resolvedWarmup}", chấp hành nghiêm túc hiệu lệnh của giáo viên.`,
      contentImgUrl: undefined,
      contentImgTitle: undefined,
      hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
      hsImgTitle: 'Đội hình nhận lớp và khởi động 4 hàng ngang',
      hsImages: [
        {
          id: 'diag_1_nhan_lop',
          url: standardFormationDiagrams[0].svgDataUrl,
          title: 'Đội hình nhận lớp và khởi động (4 hàng ngang)'
        }
      ]
    },
    // HÀNG 2: HÌNH THÀNH KIẾN THỨC MỚI (Khớp 100% ảnh kỹ thuật và bước thực hiện vào Cột 1)
    {
      content: `2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác:\n${accurate.movementSteps.startsWith('*') ? accurate.movementSteps : `* Học ${mName}:\n${accurate.movementSteps}`}`,
      lvd: `6 - 8 phút\n2 - 3 lần`,
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
      hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
      hsImgTitle: 'Đội hình quan sát tranh mẫu & GV làm mẫu',
      hsImages: [
        {
          id: 'diag_2_quan_sat',
          url: standardFormationDiagrams[2].svgDataUrl,
          title: 'Đội hình quan sát tranh mẫu & GV làm mẫu'
        }
      ]
    },
    // HÀNG 3: 3.1. TẬP ĐỒNG LOẠT CẢ LỚP (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện ${mName} theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp ${accurate.practiceFocus}.`,
      lvd: `3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở và biên độ vận động của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và chú trọng ${accurate.practiceFocus}.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.`,
      hs: `- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý giữ đúng biên độ kỹ thuật và tư thế thân người, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.`,
      hsImgUrl: standardFormationDiagrams[3].svgDataUrl,
      hsImgTitle: 'Đội hình tập luyện đồng loạt 4 hàng ngang giãn cách',
      hsImages: [
        {
          id: 'diag_3_dong_loat',
          url: standardFormationDiagrams[3].svgDataUrl,
          title: 'Đội hình tập đồng loạt (4 hàng ngang giãn cách)'
        }
      ]
    },
    // HÀNG 4: 3.2. TẬP THEO TỔ / NHÓM (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện ${mName} (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.`,
      lvd: `4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc, chú trọng rèn ${accurate.practiceFocus}.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.`,
      hs: `- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.`,
      hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
      hsImgTitle: 'Đội hình tập theo tổ / nhóm (4 góc sân)',
      hsImages: [
        {
          id: 'diag_4_to_nhom',
          url: standardFormationDiagrams[4].svgDataUrl,
          title: 'Đội hình tập theo tổ / nhóm (4 góc sân bãi)'
        }
      ]
    },
    // HÀNG 5: 3.3. TẬP CẶP ĐÔI SỬA SAI (Ô RIÊNG - Sơ đồ ở Cột 4)
    {
      content: `3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện ${mName} kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.`,
      lvd: `3 - 4 phút\n1 - 2 lần\nđổi vai`,
      gv: `- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ xem bạn mình đã thực hiện chuẩn ${accurate.practiceFocus} hay chưa; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.`,
      hs: `- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.`,
      hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
      hsImgTitle: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai',
      hsImages: [
        {
          id: 'diag_5_cap_doi',
          url: standardFormationDiagrams[5].svgDataUrl,
          title: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai'
        }
      ]
    },
    // HÀNG 6: 3.4. THI ĐUA TRÌNH DIỄN & TRÒ CHƠI VẬN ĐỘNG (Ô RIÊNG - Sơ đồ sân bãi trò chơi ở Cột 4)
    {
      content: `3.4. Thi đua trình diễn giữa các tổ & Trò chơi vận động:\n* Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện động tác trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.\n* Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đồng đội.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
      lvd: `5 - 7 phút\n2 - 3 lượt`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- Phổ biến ngắn gọn tên trò chơi vận động "${resolvedPractice}", mục đích rèn luyện tố chất nhanh nhẹn, luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm làm mẫu thao tác tham gia trò chơi; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.`,
      hs: `- Đội hình thi đua & trò chơi: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Khi vào trò chơi "${resolvedPractice}": 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn vượt qua thử thách và tiếp sức an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.`,
      contentImgUrl: undefined,
      contentImgTitle: undefined,
      hsImgUrl: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').svgDataUrl,
      hsImgTitle: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').name,
      hsImages: [
        {
          id: 'diag_6_tro_choi',
          url: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').svgDataUrl,
          title: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').name
        }
      ]
    },
    // HÀNG 7: 4. VẬN DỤNG & HỒI TĨNH (Ô RIÊNG)
    {
      content: `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng cơ toàn thân, rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi.\n4.2. Vận dụng:\n- Câu hỏi vận dụng SGK: "${getLessonSpecificApplication(mName, title, grade).question}"\n- Gợi ý trả lời & Vận dụng: ${getLessonSpecificApplication(mName, title, grade).answerGuide}\n- Tích hợp bảo vệ môi trường: Kiểm tra vệ sinh sân tập, nhặt vật nguy hiểm, thu dọn dụng cụ đúng nơi quy định.\n4.3. Nhận xét & Dặn dò về nhà:\n- Đánh giá thái độ học tập; giao nhiệm vụ tự tập ở nhà: ${getLessonSpecificApplication(mName, title, grade).practicalHabit}`,
      lvd: `3 - 5 phút\n1 - 2 lần`,
      gv: `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ tay, rung thả lỏng cơ đùi, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n- Đặt câu hỏi tương tác thực tế: "${getLessonSpecificApplication(mName, title, grade).question}" giúp học sinh khắc sâu kiến thức; liên hệ thói quen tập luyện: ${getLessonSpecificApplication(mName, title, grade).answerGuide}\n- Giáo dục ý thức bảo vệ môi trường: nhắc nhở các em quan sát xung quanh sân tập, cùng nhau nhặt rác, cất gậy và cọc tiêu vào phòng dụng cụ gọn gàng, an toàn.\n- Nhận xét ưu điểm, tinh thần tích cực của tiết học; dặn dò các em tự giác ôn tập ở nhà và chuẩn bị trang phục cho tiết tiếp theo; phát lệnh xuống lớp.`,
      hs: `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n- Tích cực xung phong trả lời câu hỏi vận dụng kiến thức vào thực tế cuộc sống.\n- Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ.\n- Lắng nghe dặn dò của thầy cô, chào giáo viên và xếp hàng trật tự đi về lớp học.`,
      hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
      hsImgTitle: 'Đội hình hồi tĩnh và thả lỏng toàn thân',
      hsImages: [
        {
          id: 'diag_7_hoi_tinh',
          url: standardFormationDiagrams[15].svgDataUrl,
          title: 'Đội hình hồi tĩnh và thả lỏng toàn thân'
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
 * Generates dynamic, pedagogical questions, answers, and real-life application tailored
 * specifically to each movement/lesson instead of a static generic question.
 */
export function getLessonSpecificApplication(
  movementName: string,
  title: string = '',
  grade: number = 1
): LessonApplicationDetails {
  const mLower = (movementName + ' ' + title).toLowerCase();

  let question = 'Em nên tập động tác này vào thời điểm nào trong ngày để rèn luyện sức khỏe và phòng tránh cong vẹo cột sống?';
  let answerGuide = 'Tập vào mỗi buổi sáng khi thức dậy hoặc sau giờ học căng thẳng; kết hợp hít thở sâu để nâng cao thể lực và sự tỉnh táo.';
  let practicalHabit = 'Tự giác thực hiện 2 lần 8 nhịp tại nhà mỗi ngày cùng người thân.';

  if (mLower.includes('phối hợp')) {
    question = 'Khi thực hiện Động tác Phối hợp, sự kết hợp giữa tay, chân và cúi gập thân người giúp cơ thể phát triển điều gì và em nên tập vào lúc nào?';
    answerGuide = 'Giúp toàn thân phát triển hài hòa, kéo giãn các nhóm cơ, tăng độ dẻo dai cột sống và phản xạ khéo léo. Em nên tập 2 lần 8 nhịp mỗi sáng hoặc sau khi ngồi học bài 35 - 45 phút để chống mỏi lưng.';
    practicalHabit = 'Tập động tác phối hợp vào mỗi buổi sáng và hướng dẫn người thân cùng tập để giữ vóc dáng cân đối.';
  } else if (mLower.includes('điều hòa')) {
    question = 'Vì sao Động tác Điều hòa luôn được xếp ở cuối bài thể dục và cần kết hợp lắc cổ tay, hít thở chậm rãi?';
    answerGuide = 'Vì động tác điều hòa kết hợp hít sâu, thở chậm và thả lỏng cổ tay giúp nhịp tim, nhịp thở và các nhóm cơ dần trở về trạng thái ổn định bình thường sau các vận động mạnh.';
    practicalHabit = 'Tập động tác điều hòa sau các giờ chạy nhảy, vui chơi thể thao hoặc khi cảm thấy mệt mỏi để lấy lại năng lượng.';
  } else if (mLower.includes('nhảy') || mLower.includes('nhay')) {
    question = 'Khi thực hiện Động tác Nhảy, vì sao em cần tiếp đất nhẹ nhàng bằng nửa trước bàn chân và hơi khuỵu nhẹ gối?';
    answerGuide = 'Tiếp đất bằng nửa trước bàn chân và khuỵu nhẹ gối giúp hoãn xung lực cơ thể, bảo vệ khớp gối, khớp cổ chân và tránh chấn động lên cột sống não bộ.';
    practicalHabit = 'Tập bật nhảy nhẹ nhàng tại chỗ mỗi sáng kết hợp hít thở đều để tăng sức bật của đôi chân.';
  } else if (mLower.includes('bụng')) {
    question = 'Động tác Bụng với tư thế gập thân sâu và hai tay chạm mũi chân có tác dụng gì đối với cơ thể và hệ tiêu hóa của em?';
    answerGuide = 'Làm dẻo dai cột sống lưng, săn chắc cơ bụng và kích thích hệ tiêu hóa hoạt động tốt hơn. Cần giữ thẳng gối khi cúi gập thân.';
    practicalHabit = 'Tập động tác bụng vào buổi sáng hoặc trước bữa ăn tối 30 phút để rèn luyện cơ thể thon gọn, khỏe mạnh.';
  } else if (mLower.includes('chân')) {
    question = 'Khi kiễng gót hoặc khụy gối trong Động tác Chân, em làm thế nào để giữ thăng bằng cơ thể thật tốt?';
    answerGuide = 'Giữ lưng thẳng, mắt nhìn thẳng phía trước, hai tay chống hông hoặc dang ngang để giữ thăng bằng, dồn trọng tâm đều vào các ngón chân giúp cơ đùi và bắp chân khỏe mạnh.';
    practicalHabit = 'Thường xuyên tập kiễng gót và khụy gối đúng kỹ thuật mỗi sáng để đôi chân dẻo dai, nhanh nhẹn.';
  } else if (mLower.includes('vặn mình')) {
    question = 'Khi xoay người sang trái hoặc phải trong Động tác Vặn mình, hai bàn chân của em cần giữ như thế nào để đạt hiệu quả cao?';
    answerGuide = 'Hai bàn chân giữ cố định bám chắc mặt sàn, chỉ xoay phần thân trên để kéo căng cơ liên sườn và khớp hông, rèn sự linh hoạt của cột sống.';
    practicalHabit = 'Tập vặn mình sau khi ngồi học bài lâu để giải tỏa căng thẳng cho cột sống và thắt lưng.';
  } else if (mLower.includes('lườn')) {
    question = 'Tác dụng của Động tác Lườn đối với lồng ngực và hơi thở của em trong sinh hoạt hằng ngày là gì?';
    answerGuide = 'Mở rộng lồng ngực, kéo giãn cơ liên sườn hai bên, giúp dung tích phổi tăng lên, hơi thở sâu hơn và tăng lượng oxy cho cơ thể.';
    practicalHabit = 'Tập nghiêng lườn luân phiên hai bên mỗi ngày để giữ thân hình dẻo dai và phòng tránh lệch vẹo cột sống.';
  } else if (mLower.includes('vươn thở')) {
    question = 'Em hít vào và thở ra ở những nhịp nào trong Động tác Vươn thở để lồng ngực nở rộng và cơ thể sảng khoái nhất?';
    answerGuide = 'Nhịp 1 vươn tay lên cao ngẩng đầu hít sâu bằng mũi; nhịp 2 hạ tay cúi đầu thở ra từ từ bằng miệng; giúp thanh lọc không khí trong phổi và cung cấp oxy cho não bộ.';
    practicalHabit = 'Mỗi sáng thức dậy mở cửa sổ hít thở không khí trong lành và tập động tác vươn thở 2 lần 8 nhịp.';
  } else if (mLower.includes('tay')) {
    question = 'Thường xuyên tập Động tác Tay kết hợp vỗ tay trên cao giúp ích gì cho em khi học tập và sinh hoạt?';
    answerGuide = 'Rèn khớp vai linh hoạt, cơ cánh tay và cổ tay dẻo dai, giảm mỏi cơ khi ngồi viết bài lâu và tăng khả năng phản xạ khéo léo.';
    practicalHabit = 'Tập các cử động vươn tay, vỗ tay nhịp nhàng giữa các giờ học để cổ tay mềm mại, viết bài nhanh đẹp.';
  } else if (mLower.includes('gậy') || mLower.includes('bài thể dục với gậy')) {
    question = 'Việc cầm gậy thể dục tập luyện giúp cải thiện dáng đứng và cột sống của em như thế nào?';
    answerGuide = 'Giúp giữ thẳng cột sống lưng, chống gù vai, mở rộng lồng ngực và tăng lực bám chắc chắn của hai bàn tay.';
    practicalHabit = 'Tập với gậy thể dục hoặc thanh tre nhỏ tại nhà để rèn tác phong nhanh nhẹn và tư thế đi đứng ngay ngắn.';
  } else if (mLower.includes('đi đều') || mLower.includes('đội hình')) {
    question = 'Kỹ năng tập hợp hàng ngũ và đi đều bước giúp ích gì cho em khi tham gia các hoạt động ở trường và nơi công cộng?';
    answerGuide = 'Rèn tác phong nhanh nhẹn, tính kỷ luật, giữ cự ly hàng lối ngay ngắn khi chào cờ, xếp hàng vào lớp và đi bộ trên đường an toàn.';
    practicalHabit = 'Ý thức giữ trật tự, đi đứng ngay ngắn, xếp hàng văn minh trong mọi hoạt động tập thể.';
  }

  const environmentNote = 'Kiểm tra vệ sinh sân tập, nhặt vật sắc nhọn/nguy hiểm, thu dọn và cất dụng cụ thể dục đúng nơi quy định an toàn.';

  const fullContentText = `4.2. Vận dụng & Dặn dò về nhà:\n- Câu hỏi vận dụng SGK: "${question}"\n- Gợi ý trả lời & Vận dụng: ${answerGuide}\n- Nhiệm vụ rèn luyện: ${practicalHabit}\n- Tích hợp bảo vệ môi trường: ${environmentNote}\n- Nhận xét thái độ học tập; giao nhiệm vụ tự tập ở nhà.\n4.3. Xuống lớp.`;

  const fullGvText = `- Đặt câu hỏi tương tác thực tế: "${question}" giúp học sinh khắc sâu kiến thức bài học; liên hệ thói quen tập luyện: ${answerGuide}\n- Giáo dục ý thức bảo vệ môi trường: nhắc nhở các em quan sát xung quanh sân tập, cùng nhau nhặt rác, cất dụng cụ gọn gàng, an toàn.\n- Nhận xét ưu điểm, tinh thần tích cực của tiết học; dặn dò các em tự giác ôn tập ở nhà và chuẩn bị trang phục cho tiết tiếp theo; phát lệnh xuống lớp.`;

  const fullHsText = `- Tích cực xung phong trả lời câu hỏi vận dụng kiến thức vào thực tế cuộc sống; ghi nhớ: "${answerGuide.slice(0, 80)}...".\n- Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ.\n- Lắng nghe dặn dò của thầy cô, chào giáo viên và xếp hàng trật tự đi về lớp học.`;

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
  const accurate = resolveAccurateMovement('', title, grade, userImages);
  const mName = accurate.movementName;

  const isG1Bai2 =
    grade === 1 &&
    (title.toLowerCase().includes('chân') ||
      title.toLowerCase().includes('vặn mình') ||
      title.toLowerCase().includes('bụng') ||
      title.toLowerCase().includes('bài 2'));
  const isG1Bai3 =
    grade === 1 &&
    (title.toLowerCase().includes('phối hợp') ||
      title.toLowerCase().includes('điều hòa') ||
      title.toLowerCase().includes('bài 3'));

  const defaultG1Warmup = isG1Bai2 ? 'Kết bạn' : 'Làm theo hiệu lệnh';
  const defaultG1Practice = isG1Bai2 ? 'Lò cò tiếp sức' : isG1Bai3 ? 'Mèo đuổi chuột' : 'Thỏ nhường hang';

  const resolvedWarmup =
    customWarmupGame ||
    (grade === 1 ? defaultG1Warmup : grade === 3 ? 'Chui qua hầm' : 'Ai kéo khoẻ hơn');
  const resolvedPractice =
    customPracticeGame ||
    (grade === 1 ? defaultG1Practice : grade === 3 ? 'Đua ô tô' : 'Trao gậy tiếp sức');

  const warmupImg = resolveAccurateGameImage(resolvedWarmup, grade, 'tro_choi_kd', userImages);
  const practiceImg = resolveAccurateGameImage(resolvedPractice, grade, 'tro_choi_vd', userImages);

  const equipmentDesc =
    grade === 5
      ? 'Gậy thể dục, cọc tiêu an toàn theo chuẩn nội dung trò chơi.'
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  return [
    // 1. NHẬN LỚP
    {
      content: `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, giày dép và tình trạng sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung và yêu cầu cần đạt của tiết học.`,
      lvd: `1 - 2 phút`,
      gv: `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng và tạo tâm thế học tập hứng khởi.`,
      hs: `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Toàn lớp đứng nghiêm trang, lắng nghe phổ biến và ghi nhớ mục tiêu tiết học.`,
      hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
      hsImgTitle: 'Đội hình nhận lớp (4 hàng ngang cự ly hẹp)',
      hsImages: [
        {
          id: 'diag_1_nhan_lop',
          url: standardFormationDiagrams[0].svgDataUrl,
          title: 'Đội hình nhận lớp (4 hàng ngang cự ly hẹp)'
        }
      ]
    },

    // 2. KHỞI ĐỘNG CHUYÊN MÔN
    {
      content: `1.2. Khởi động chung & chuyên môn:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (thực hiện theo nhịp nhạc hoặc nhịp đếm).`,
      lvd: `2L x 8N\n2 - 3 phút`,
      gv: `- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát.\n- GV di chuyển quan sát, nhắc nhở học sinh xoay đúng biên độ, nhịp nhàng, không làm vội vàng để phòng tránh chấn thương khớp.`,
      hs: `- Đội hình khởi động: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tích cực xoay kỹ các khớp theo nhịp đếm của cán sự, động tác dứt khoát, đúng biên độ và đều đẹp.`,
      hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
      hsImgTitle: 'Đội hình khởi động (4 hàng ngang so le 1 sải tay)',
      hsImages: [
        {
          id: 'diag_2_khoi_dong',
          url: standardFormationDiagrams[1].svgDataUrl,
          title: 'Đội hình khởi động (4 hàng ngang so le 1 sải tay)'
        }
      ]
    },

    // 3. TRÒ CHƠI BỔ TRỢ KHỞI ĐỘNG
    {
      content: `1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}":\n- Mục đích: Tạo phản xạ nhanh nhẹn, tinh thần sảng khoái và hưng phấn trước khi học động tác mới.\n- Luật chơi: Học sinh thực hiện nhanh theo hiệu lệnh của GV, ai làm sai sẽ thực hiện động tác phạt vui nhộn.`,
      lvd: `2 - 3 phút\n1 - 2 lượt`,
      gv: `- GV nêu tên trò chơi khởi động "${resolvedWarmup}", phổ biến ngắn gọn luật chơi và cách chơi.\n- Hô hiệu lệnh điều hành học sinh tham gia trò chơi tạo không khí sôi nổi, vui tươi trước khi vào phần trọng tâm.`,
      hs: `- Học sinh chăm chú lắng nghe hướng dẫn luật chơi, hào hứng tham gia trò chơi theo khẩu lệnh của giáo viên.\n- Chấp hành nghiêm túc hiệu lệnh, di chuyển nhanh nhẹn, vui tươi, trật tự.`,
      contentImgUrl: warmupImg?.url,
      contentImgTitle: warmupImg?.title,
      hsImgUrl: getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong').svgDataUrl,
      hsImgTitle: getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong').name,
      hsImages: [
        {
          id: 'diag_3_tc_kd',
          url: getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong').svgDataUrl,
          title: getFormationDiagramByKeyword(resolvedWarmup, 'khoi_dong').name
        }
      ]
    },

    // 4. HÌNH THÀNH KIẾN THỨC MỚI (Khám phá động tác)
    {
      content: `2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác mới:\n${accurate.movementSteps.startsWith('*') ? accurate.movementSteps : `* Học ${mName}:\n${accurate.movementSteps}`}`,
      lvd: `6 - 8 phút\n2 - 3 lần`,
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
      hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
      hsImgTitle: 'Đội hình quan sát tranh mẫu & GV làm mẫu',
      hsImages: [
        {
          id: 'diag_4_quan_sat',
          url: standardFormationDiagrams[2].svgDataUrl,
          title: 'Đội hình quan sát tranh mẫu & GV làm mẫu'
        }
      ]
    },

    // 5. LUYỆN TẬP: 3.1. TẬP ĐỒNG LOẠT
    {
      content: `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện ${mName} theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp ${accurate.practiceFocus}.`,
      lvd: `3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở và biên độ vận động của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và chú trọng ${accurate.practiceFocus}.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.`,
      hs: `- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý giữ đúng biên độ kỹ thuật và tư thế thân người, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.`,
      hsImgUrl: standardFormationDiagrams[3].svgDataUrl,
      hsImgTitle: 'Đội hình tập luyện đồng loạt 4 hàng ngang giãn cách',
      hsImages: [
        {
          id: 'diag_5_dong_loat',
          url: standardFormationDiagrams[3].svgDataUrl,
          title: 'Đội hình tập đồng loạt (4 hàng ngang giãn cách)'
        }
      ]
    },

    // 6. LUYỆN TẬP: 3.2. TẬP THEO TỔ / NHÓM
    {
      content: `3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện ${mName} (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.`,
      lvd: `4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc, chú trọng rèn ${accurate.practiceFocus}.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.`,
      hs: `- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.`,
      hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
      hsImgTitle: 'Đội hình tập theo tổ / nhóm (4 góc sân)',
      hsImages: [
        {
          id: 'diag_6_to_nhom',
          url: standardFormationDiagrams[4].svgDataUrl,
          title: 'Đội hình tập theo tổ / nhóm (4 góc sân bãi)'
        }
      ]
    },

    // 7. LUYỆN TẬP: 3.3. TẬP CẶP ĐÔI SỬA SAI
    {
      content: `3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện ${mName} kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.`,
      lvd: `3 - 4 phút\n1 - 2 lần\nđổi vai`,
      gv: `- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ xem bạn mình đã thực hiện chuẩn ${accurate.practiceFocus} hay chưa; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.`,
      hs: `- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.`,
      hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
      hsImgTitle: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai',
      hsImages: [
        {
          id: 'diag_7_cap_doi',
          url: standardFormationDiagrams[5].svgDataUrl,
          title: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai'
        }
      ]
    },

    // 8. LUYỆN TẬP: 3.4. THI ĐUA TRÌNH DIỄN GIỮA CÁC TỔ
    {
      content: `3.4. Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện ${mName} trước lớp (theo nhịp hô của tổ trưởng).\n- Các tổ ngồi xem quan sát, theo dõi, nhận xét và chấm điểm chéo cho nhau.`,
      lvd: `3 - 4 phút\n1 lượt / tổ`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- GV ghi nhận ưu điểm, sửa lỗi còn tồn tại và tuyên dương tổ thực hiện đều đẹp, đúng nhịp.`,
      hs: `- Đội hình thi đua: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Từng tổ lên biểu diễn tự tin, thực hiện đúng động tác theo nhịp hô dứt khoát của tổ trưởng.`,
      hsImgUrl: standardFormationDiagrams[6]?.svgDataUrl || standardFormationDiagrams[3].svgDataUrl,
      hsImgTitle: 'Đội hình thi đua trình diễn động tác giữa các tổ',
      hsImages: [
        {
          id: 'diag_8_thi_dua',
          url: standardFormationDiagrams[6]?.svgDataUrl || standardFormationDiagrams[3].svgDataUrl,
          title: 'Đội hình thi đua trình diễn động tác giữa các tổ'
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
      hsImgUrl: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').svgDataUrl,
      hsImgTitle: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').name,
      hsImages: [
        {
          id: 'diag_9_tro_choi',
          url: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').svgDataUrl,
          title: getFormationDiagramByKeyword(resolvedPractice, 'tro_choi').name
        }
      ]
    },

    // 10. HỒI TĨNH (HÀNG RIÊNG)
    {
      content: `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng toàn thân, cúi người rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi để cơ thể hồi phục.`,
      lvd: `2 - 3 phút\n1 - 2 lần`,
      gv: `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ mềm cơ bắp tay, rung thả lỏng cơ đùi, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n- Nhắc học sinh thả lỏng tự nhiên, không gồng cứng cơ thể.`,
      hs: `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n- Rũ tay, thả lỏng bắp chân nhịp nhàng, cảm nhận cơ thể hồi phục sảng khoái.`,
      hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
      hsImgTitle: 'Đội hình hồi tĩnh và thả lỏng toàn thân',
      hsImages: [
        {
          id: 'diag_10_hoi_tinh',
          url: standardFormationDiagrams[15].svgDataUrl,
          title: 'Đội hình hồi tĩnh và thả lỏng toàn thân'
        }
      ]
    },

    // 11. VẬN DỤNG, NHẬN XÉT & DẶN DÒ (HÀNG RIÊNG)
    {
      content: getLessonSpecificApplication(mName, title, grade).fullContentText,
      lvd: `2 - 3 phút`,
      gv: getLessonSpecificApplication(mName, title, grade).fullGvText,
      hs: getLessonSpecificApplication(mName, title, grade).fullHsText,
      hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
      hsImgTitle: 'Đội hình kết thúc tiết học và xuống lớp',
      hsImages: [
        {
          id: 'diag_11_ket_thuc',
          url: standardFormationDiagrams[0].svgDataUrl,
          title: 'Đội hình kết thúc tiết học và xuống lớp'
        }
      ]
    }
  ];
}

/**
 * Takes any existing lesson rows (e.g. 5 or 7 rows) and splits merged activities into 1:1 horizontally aligned rows,
 * ensuring that every single sub-activity (especially games with their pictures and rules) stands on its OWN row.
 */
export function splitAndAlignRows1to1(
  rows: LessonRow[],
  grade: number = 1,
  title: string = '',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): LessonRow[] {
  // If already 10 or more rows, update any generic application question to be lesson-specific
  if (rows && rows.length >= 10) {
    const accurate = resolveAccurateMovement('', title, grade, userImages);
    const mName = accurate.movementName;
    const appDetails = getLessonSpecificApplication(mName, title, grade);
    const updated = [...rows];
    const lastIdx = updated.length - 1;
    if (updated[lastIdx] && (updated[lastIdx].content.includes('Em nên tập động tác này') || updated[lastIdx].content.includes('4.2. Vận dụng'))) {
      updated[lastIdx] = {
        ...updated[lastIdx],
        content: appDetails.fullContentText,
        gv: appDetails.fullGvText,
        hs: appDetails.fullHsText
      };
    }
    return updated;
  }

  // Create clean 1:1 granular rows
  const granular11 = createBalancedGranularLessonRows(grade, title, userImages, customWarmupGame, customPracticeGame);

  // If input rows is empty or not provided, return the full 11
  if (!rows || rows.length === 0) {
    return granular11;
  }

  // Preserve any custom images or texts teacher wrote into rows if possible
  // Find movement photo from input rows:
  const customMovementRow = rows.find((r) => r.contentImgUrl && !r.contentImgUrl.includes('tro_choi'));
  if (customMovementRow?.contentImgUrl && granular11[3]) {
    granular11[3].contentImgUrl = customMovementRow.contentImgUrl;
    granular11[3].contentImgTitle = customMovementRow.contentImgTitle;
    granular11[3].contentImages = customMovementRow.contentImages || [
      { id: 'custom_mov', url: customMovementRow.contentImgUrl, title: customMovementRow.contentImgTitle || 'Ảnh động tác' }
    ];
  }

  // Find practice game photo if teacher attached one:
  const customGameRow = rows.find((r) => (r.content && r.content.toLowerCase().includes('trò chơi vận động')) || r.contentImgTitle?.toLowerCase().includes('trò chơi'));
  if (customGameRow?.contentImgUrl && granular11[8]) {
    granular11[8].contentImgUrl = customGameRow.contentImgUrl;
    granular11[8].contentImgTitle = customGameRow.contentImgTitle;
    granular11[8].contentImages = customGameRow.contentImages || [
      { id: 'custom_game', url: customGameRow.contentImgUrl, title: customGameRow.contentImgTitle || 'Ảnh trò chơi' }
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
 * generating 7 balanced rows with separated 3.1, 3.2, 3.3 and 100-120 words in Cột GV.
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
 * technical movement pictures and accurate formation diagrams to all rows of any lesson plan.
 */
export function autoScanLibraryAndAttachToRows(
  rows: LessonRow[],
  userImages: SgkImageItem[],
  grade: number,
  lessonTitle: string
): { updatedRows: LessonRow[]; attachedCount: number; messages: string[] } {
  let attachedCount = 0;
  const messages: string[] = [];
  const updatedRows = rows.map((r) => ({ ...r }));

  // Filter images for this grade or general
  const gradeImages = userImages.filter((img) => String(img.grade) === String(grade) || !img.grade);

  // ROW 0: Hoạt động mở đầu (Nhận lớp, Khởi động)
  if (updatedRows[0]) {
    // Chuẩn GDTC: Cột 1 không chèn ảnh động tác. Xóa bỏ nếu vô tình bị gán
    delete updatedRows[0].contentImgUrl;
    delete updatedRows[0].contentImgTitle;

    // Sơ đồ đội hình cho Hàng 1 thuộc Cột 4 (Hoạt động HS)
    if (!updatedRows[0].hsImgUrl) {
      const warmupDiagram = standardFormationDiagrams.find((f) => f.id === 'f_khoi_dong') || standardFormationDiagrams[1];
      updatedRows[0].hsImgUrl = warmupDiagram.svgDataUrl;
      updatedRows[0].hsImgTitle = warmupDiagram.name;
      attachedCount++;
      messages.push(`H1 (Đội hình Khởi động Cột 4): Gắn "${warmupDiagram.name}"`);
    }
  }

  // ROW 1: Hình thành kiến thức mới (Động tác kỹ thuật)
  const targetRow1 = updatedRows[1] ? 1 : 0;
  if (updatedRows[targetRow1]) {
    const accurate = resolveAccurateMovement(updatedRows[targetRow1].content, lessonTitle, grade, userImages);
    updatedRows[targetRow1].contentImgUrl = accurate.imgUrl;
    updatedRows[targetRow1].contentImgTitle = accurate.imgTitle;
    attachedCount++;
    messages.push(`H2 (Kỹ thuật mới Cột 1): Gắn chính xác "${accurate.imgTitle}" khớp với ${accurate.movementName}`);

    // Sơ đồ đội hình quan sát tranh mẫu & GV thị phạm (Cột 4)
    if (!updatedRows[targetRow1].hsImgUrl) {
      const obsDiagram = standardFormationDiagrams.find((f) => f.id === 'f_tap_mau') || standardFormationDiagrams[2];
      updatedRows[targetRow1].hsImgUrl = obsDiagram.svgDataUrl;
      updatedRows[targetRow1].hsImgTitle = obsDiagram.name;
      attachedCount++;
      messages.push(`H2 (Đội hình Quan sát Cột 4): Gắn "${obsDiagram.name}"`);
    }
  }

  // ROW 2: Hoạt động Luyện tập (Tổ nhóm / Cặp đôi)
  const targetRow2 = updatedRows[2] ? 2 : targetRow1;
  if (updatedRows[targetRow2]) {
    // NGUYÊN TẮC BẮT BUỘC GDTC (Công văn 2345/BGDĐT): Cột 1 Hoạt động Luyện tập là văn bản (3.1 Tập đồng loạt, 3.2 Tập tổ nhóm).
    // Tuyệt đối KHÔNG gán ảnh kỹ thuật hay hình ảnh vào Cột 1! Nếu có ảnh thừa do gán sai trước đó, tự động loại bỏ triệt để.
    delete updatedRows[targetRow2].contentImgUrl;
    delete updatedRows[targetRow2].contentImgTitle;

    // Sơ đồ đội hình luyện tập tổ nhóm / đồng loạt bắt buộc nằm ở Cột 4 (Hoạt động HS)
    if (!updatedRows[targetRow2].hsImgUrl) {
      const teamDiagram = standardFormationDiagrams.find((f) => f.id === 'f_to_nhom') || standardFormationDiagrams[4];
      updatedRows[targetRow2].hsImgUrl = teamDiagram.svgDataUrl;
      updatedRows[targetRow2].hsImgTitle = teamDiagram.name;
      attachedCount++;
      messages.push(`H3 (Đội hình Luyện tập Cột 4): Gắn "${teamDiagram.name}"`);
    }
  }

  // ROW 3: Trò chơi vận động
  const targetRow3 = updatedRows[3] ? 3 : 2;
  if (updatedRows[targetRow3]) {
    // Kiểm tra nếu Cột 1 bị gán nhầm ảnh động tác hoặc ảnh luyện tập, loại bỏ ngay
    if (updatedRows[targetRow3].contentImgUrl) {
      const currentTitle = (updatedRows[targetRow3].contentImgTitle || '').toLowerCase();
      if (
        currentTitle.includes('động tác') ||
        currentTitle.includes('vươn thở') ||
        currentTitle.includes('tay') ||
        currentTitle.includes('chân') ||
        currentTitle.includes('bụng') ||
        currentTitle.includes('luyện tập')
      ) {
        delete updatedRows[targetRow3].contentImgUrl;
        delete updatedRows[targetRow3].contentImgTitle;
        messages.push(`H4 (Trò chơi): Đã loại bỏ ảnh động tác/luyện tập chèn sai vào ô trò chơi`);
      }
    }

    // Sơ đồ trò chơi: TỰ ĐỘNG KHỚP NỘI DUNG CHÍNH XÁC (Tránh lỗi tam giác ra vòng tròn hoặc kéo co ra tiếp sức!)
    const matchedDiagram = getFormationDiagramByKeyword(updatedRows[targetRow3].content, 'tro_choi');
    updatedRows[targetRow3].hsImgUrl = matchedDiagram.svgDataUrl;
    updatedRows[targetRow3].hsImgTitle = matchedDiagram.name;
    attachedCount++;
    messages.push(`H4 (Sơ đồ sân bãi trò chơi Cột 4): Khớp chính xác "${matchedDiagram.name}"`);
  }

  // ROW 4: Hồi tĩnh & Vận dụng
  const targetRow4 = updatedRows[4] ? 4 : updatedRows.length - 1;
  if (updatedRows[targetRow4]) {
    // Cột 1 là nội dung câu hỏi vận dụng và bảo vệ môi trường, không để ảnh
    delete updatedRows[targetRow4].contentImgUrl;
    delete updatedRows[targetRow4].contentImgTitle;

    if (!updatedRows[targetRow4].hsImgUrl) {
      const cooldownDiagram = standardFormationDiagrams.find((f) => f.id === 'f_hoi_tinh') || standardFormationDiagrams[15];
      updatedRows[targetRow4].hsImgUrl = cooldownDiagram.svgDataUrl;
      updatedRows[targetRow4].hsImgTitle = cooldownDiagram.name;
      attachedCount++;
      messages.push(`H5 (Đội hình Hồi tĩnh Cột 4): Gắn "${cooldownDiagram.name}"`);
    }
  }

  return {
    updatedRows,
    attachedCount,
    messages
  };
}
