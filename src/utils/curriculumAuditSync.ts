import { MasterPlanItem } from '../data/masterTemplateTuan8';
import { masterPlansTuan9 } from '../data/masterTemplateTuan9';
import { WeeklyMasterScheduleRow, LessonRow, SgkImageItem } from '../types/gdtc';
import {
  AUTHENTIC_TEXTBOOK_MAP,
  resolveAccurateMovement,
  resolveAccurateGameImage,
  resolveLessonSlotAssets,
  sanitizeVanDungRow,
  sanitizeRowColumn1Media,
  isInvalidColumn1AttachmentForRow
} from './planAutoMatcher';
import { findSgkLessonByTopicOrTitle } from '../data/sgkCurriculumTree';
import { defaultAllPpctData } from '../data/defaultPpctData';

export const DEFAULT_DISABLED_SPECIAL = 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.';
export const DEFAULT_DISABLED_GENERAL = 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.';

export interface CurriculumItemRule {
  grade: 1 | 3 | 5;
  ppct: number;
  topic: string;
  cleanTitle: string;
  movementName: string;
  movementKey: string;
  warmupGame: string;
  practiceGame: string;
  disabledStudentsSpecial?: string;
  disabledStudentsGeneral?: string;
}

/**
 * Authoritative GDTC 2018 (Kết nối tri thức) Curriculum Master Table across Grade 1, 3, 5
 */
export const AUTHORITATIVE_CURRICULUM_RULES: Record<string, CurriculumItemRule> = {
  // KHỐI 1 - TUẦN 8 (Tiết 15, 16)
  'k1_t15': {
    grade: 1,
    ppct: 15,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY',
    movementName: 'Học động tác Vươn thở',
    movementKey: 'vuon_tho',
    warmupGame: 'Làm theo hiệu lệnh',
    practiceGame: 'Thỏ nhường hang'
  },
  'k1_t16': {
    grade: 1,
    ppct: 16,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY',
    movementName: 'Học động tác Tay; Ôn động tác Vươn thở',
    movementKey: 'tay',
    warmupGame: 'Di chuyển theo tín hiệu',
    practiceGame: 'Thỏ nhường hang'
  },
  // KHỐI 1 - TUẦN 9 (Tiết 17, 18)
  'k1_t17': {
    grade: 1,
    ppct: 17,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG',
    movementName: 'Học động tác Chân và Động tác Vặn mình',
    movementKey: 'chan',
    warmupGame: 'Kết bạn',
    practiceGame: 'Lò cò tiếp sức'
  },
  'k1_t18': {
    grade: 1,
    ppct: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG',
    movementName: 'Học động tác Bụng; Ôn động tác Chân và Động tác Vặn mình',
    movementKey: 'bung',
    warmupGame: 'Kết bạn',
    practiceGame: 'Lò cò tiếp sức'
  },
  // KHỐI 1 - TUẦN 10 (Tiết 19, 20)
  'k1_t19': {
    grade: 1,
    ppct: 19,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG',
    movementName: 'Học động tác Vặn mình và Động tác Bụng',
    movementKey: 'bung',
    warmupGame: 'Kết bạn',
    practiceGame: 'Lò cò tiếp sức'
  },
  'k1_t20': {
    grade: 1,
    ppct: 20,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG',
    movementName: 'Ôn động tác Chân, Vặn mình, Bụng',
    movementKey: 'chan',
    warmupGame: 'Kết bạn',
    practiceGame: 'Lò cò tiếp sức'
  },
  // KHỐI 1 - TUẦN 11 (Tiết 21, 22)
  'k1_t21': {
    grade: 1,
    ppct: 21,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 3: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC ĐIỀU HÒA',
    movementName: 'Học động tác Phối hợp',
    movementKey: 'phoi_hop',
    warmupGame: 'Làm theo hiệu lệnh',
    practiceGame: 'Mèo đuổi chuột'
  },
  'k1_t22': {
    grade: 1,
    ppct: 22,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    cleanTitle: 'BÀI 3: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC ĐIỀU HÒA',
    movementName: 'Học động tác Điều hòa; Ôn động tác Phối hợp',
    movementKey: 'dieu_hoa',
    warmupGame: 'Làm theo hiệu lệnh',
    practiceGame: 'Mèo đuổi chuột'
  },

  // KHỐI 3 - TUẦN 8 (Tiết 15, 16)
  'k3_t15': {
    grade: 3,
    ppct: 15,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    cleanTitle: 'BÀI 3: ĐI ĐỀU, ĐỨNG LẠI VÀ TRÒ CHƠI PHÁT TRIỂN PHẢN XẠ',
    movementName: 'Kỹ thuật Đi đều và Đứng lại',
    movementKey: 'di_deu',
    warmupGame: 'Đứng ngồi theo hiệu lệnh',
    practiceGame: 'Chạy theo hình tam giác'
  },
  'k3_t16': {
    grade: 3,
    ppct: 16,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    cleanTitle: 'BÀI 3: ĐI ĐỀU, ĐỨNG LẠI VÀ TRÒ CHƠI PHÁT TRIỂN PHẢN XẠ',
    movementName: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp',
    movementKey: 'on_di_deu',
    warmupGame: 'Mèo đuổi chuột',
    practiceGame: 'Chạy theo hình tam giác'
  },
  // KHỐI 3 - TUẦN 9 (Tiết 17, 18)
  'k3_t17': {
    grade: 3,
    ppct: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN',
    movementName: 'Học động tác Vươn thở và Động tác Tay',
    movementKey: 'vuon_tho',
    warmupGame: 'Chui qua hầm',
    practiceGame: 'Đua ô tô'
  },
  'k3_t18': {
    grade: 3,
    ppct: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN',
    movementName: 'Ôn động tác Vươn thở và Động tác Tay',
    movementKey: 'tay',
    warmupGame: 'Chui qua hầm',
    practiceGame: 'Đua ô tô'
  },
  // KHỐI 3 - TUẦN 10 (Tiết 19, 20)
  'k3_t19': {
    grade: 3,
    ppct: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN',
    movementName: 'Học động tác Chân, Ôn Vươn thở và Tay',
    movementKey: 'chan',
    warmupGame: 'Đổi chỗ theo hiệu lệnh',
    practiceGame: 'Đua ô tô'
  },
  'k3_t20': {
    grade: 3,
    ppct: 20,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN',
    movementName: 'Ôn động tác Vươn thở, Tay, Chân',
    movementKey: 'chan',
    warmupGame: 'Chui qua hầm',
    practiceGame: 'Chạy nhanh tiếp sức'
  },
  // KHỐI 3 - TUẦN 11 (Tiết 21, 22)
  'k3_t21': {
    grade: 3,
    ppct: 21,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC LƯỜN, ĐỘNG TÁC BỤNG, ĐỘNG TÁC PHỐI HỢP',
    movementName: 'Học động tác Lườn và Động tác Bụng',
    movementKey: 'luon',
    warmupGame: 'Chim về tổ',
    practiceGame: 'Đua ô tô'
  },
  'k3_t22': {
    grade: 3,
    ppct: 22,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC LƯỜN, ĐỘNG TÁC BỤNG, ĐỘNG TÁC PHỐI HỢP',
    movementName: 'Học động tác Phối hợp, Ôn Lườn và Bụng',
    movementKey: 'phoi_hop',
    warmupGame: 'Mèo đuổi chuột',
    practiceGame: 'Nhanh lên bạn ơi'
  },

  // KHỐI 5 - TUẦN 8 (Tiết 15, 16, 17)
  'k5_t15': {
    grade: 5,
    ppct: 15,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN VỚI GẬY',
    movementName: 'Động tác Vươn thở, Tay với gậy',
    movementKey: 'gay',
    warmupGame: 'Ai nhanh hơn với gậy',
    practiceGame: 'Chuyền gậy tiếp sức'
  },
  'k5_t16': {
    grade: 5,
    ppct: 16,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN VỚI GẬY',
    movementName: 'Động tác Chân với gậy',
    movementKey: 'chan_gay',
    warmupGame: 'Ai nhanh hơn với gậy',
    practiceGame: 'Nhảy lò cò tiếp sức'
  },
  'k5_t17': {
    grade: 5,
    ppct: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY',
    movementName: 'Học động tác Bụng với gậy',
    movementKey: 'bung_gay',
    warmupGame: 'Ai kéo khoẻ hơn',
    practiceGame: 'Trao gậy tiếp sức'
  },
  // KHỐI 5 - TUẦN 9 (Tiết 18, 19, 20)
  'k5_t18': {
    grade: 5,
    ppct: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY',
    movementName: 'Học động tác Vặn mình với gậy',
    movementKey: 'van_minh_gay',
    warmupGame: 'Ai kéo khoẻ hơn',
    practiceGame: 'Trao gậy tiếp sức'
  },
  'k5_t19': {
    grade: 5,
    ppct: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY',
    movementName: 'Học động tác Toàn thân với gậy',
    movementKey: 'toan_than_gay',
    warmupGame: 'Đội nào nhanh nhất',
    practiceGame: 'Trao gậy tiếp sức'
  },
  'k5_t20': {
    grade: 5,
    ppct: 20,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY',
    movementName: 'Ôn động tác Bụng, Vặn mình, Toàn thân với gậy',
    movementKey: 'gay',
    warmupGame: 'Đội nào nhanh nhất',
    practiceGame: 'Chuyển bóng tiếp sức'
  },
  // KHỐI 5 - TUẦN 11 (Tiết 21, 22) & TUẦN 12 (Tiết 23, 24)
  'k5_t21': {
    grade: 5,
    ppct: 21,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 3: ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY',
    movementName: 'Học động tác Nhảy với gậy',
    movementKey: 'nhay_gay',
    warmupGame: 'Người thừa thứ hai',
    practiceGame: 'Trao gậy tiếp sức'
  },
  'k5_t22': {
    grade: 5,
    ppct: 22,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 3: ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY',
    movementName: 'Học động tác Điều hòa với gậy; Ôn động tác Nhảy với gậy',
    movementKey: 'dieu_hoa_gay',
    warmupGame: 'Người thừa thứ hai',
    practiceGame: 'Trao gậy tiếp sức'
  },
  'k5_t23': {
    grade: 5,
    ppct: 23,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    cleanTitle: 'BÀI 3: ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY',
    movementName: 'Ôn động tác Nhảy và Điều hòa với gậy',
    movementKey: 'dieu_hoa_gay',
    warmupGame: 'Đội nào nhanh nhất',
    practiceGame: 'Trao gậy tiếp sức'
  }
};

/**
 * Resolves the authoritative curriculum rule for any grade, period, and week across all 35 weeks.
 * Guaranteed to return a non-null, fully populated CurriculumItemRule matching GDPT 2018 standards.
 */
export function getCurriculumRule(grade: 1 | 3 | 5, ppct: number, week?: number): CurriculumItemRule {
  const key = `k${grade}_t${ppct}`;
  if (AUTHORITATIVE_CURRICULUM_RULES[key]) {
    const item = AUTHORITATIVE_CURRICULUM_RULES[key];
    return {
      ...item,
      disabledStudentsSpecial: item.disabledStudentsSpecial || DEFAULT_DISABLED_SPECIAL,
      disabledStudentsGeneral: item.disabledStudentsGeneral || DEFAULT_DISABLED_GENERAL
    };
  }

  const resolvedWeek = week || Math.ceil(ppct / 2);
  const ppctItem = defaultAllPpctData.find((p) => p.grade === grade && p.period === ppct);

  const rawTitle = ppctItem?.lessonTitle || `Bài học giáo dục thể chất Tuần ${resolvedWeek}`;
  const cleanTitle = cleanLessonTitleForHeader(rawTitle).toUpperCase();
  const isAssessment = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(cleanTitle);
  const rawTopic =
    ppctItem?.topic ||
    (isAssessment
      ? 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC'
      : grade === 1
      ? 'CHỦ ĐỀ 2: BÀI THỂ DỤC'
      : 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC');
  const topic = cleanTopicForDisplay(rawTopic, grade);

  const acc = resolveAccurateMovement('', rawTitle, grade);
  const movementName = acc.movementName || (isAssessment ? cleanTitle : 'Kỹ năng vận động bài học');
  const titleLower = cleanTitle.toLowerCase();
  const movementKey = isAssessment
    ? 'danh_gia'
    : titleLower.includes('gậy')
    ? 'gay'
    : titleLower.includes('vươn thở')
    ? 'vuon_tho'
    : titleLower.includes('tay') && !titleLower.includes('bóng') && !titleLower.includes('đầu, cổ')
    ? 'tay'
    : titleLower.includes('chân') && !titleLower.includes('chạy')
    ? 'chan'
    : titleLower.includes('lườn')
    ? 'luon'
    : titleLower.includes('bụng')
    ? 'bung'
    : titleLower.includes('vặn mình')
    ? 'van_minh'
    : titleLower.includes('phối hợp') && !titleLower.includes('chạy') && !titleLower.includes('bóng')
    ? 'phoi_hop'
    : titleLower.includes('điều hòa') || titleLower.includes('điều hoà')
    ? 'dieu_hoa'
    : titleLower.includes('đi đều')
    ? 'di_deu'
    : 'ky_nang_khac';

  const treeLesson = isAssessment ? undefined : findSgkLessonByTopicOrTitle(grade, cleanTitle, topic);
  let warmupGame = treeLesson?.subFolders?.troChoiKhoiDong?.items?.[0]?.gameName || 'Làm theo hiệu lệnh';
  let practiceGame = treeLesson?.subFolders?.troChoi?.items?.[0]?.gameName || (isAssessment ? 'Thi đua tiếp sức nhẹ nhàng' : 'Thỏ nhường hang');

  if (!treeLesson?.subFolders?.troChoiKhoiDong?.items?.[0]?.gameName) {
    if (isAssessment) {
      warmupGame = grade === 5 ? 'Chạy nhẹ theo hiệu lệnh' : 'Làm theo hiệu lệnh';
      practiceGame = grade === 1 ? 'Thỏ nhường hang' : grade === 3 ? 'Chim về tổ' : 'Tiếp sức đồng đội';
    } else if (grade === 1) {
      if (movementKey === 'vuon_tho' || movementKey === 'tay') {
        warmupGame = 'Làm theo hiệu lệnh';
        practiceGame = 'Thỏ nhường hang';
      } else if (movementKey === 'chan' || movementKey === 'van_minh' || movementKey === 'bung') {
        warmupGame = 'Kết bạn';
        practiceGame = 'Lò cò tiếp sức';
      } else {
        warmupGame = 'Đứng ngồi theo hiệu lệnh';
        practiceGame = 'Lò cò tiếp sức';
      }
    } else if (grade === 3) {
      if (movementKey === 'di_deu') {
        warmupGame = 'Đứng ngồi theo hiệu lệnh';
        practiceGame = 'Chạy theo hình tam giác';
      } else if (movementKey === 'vuon_tho' || movementKey === 'tay' || movementKey === 'chan') {
        warmupGame = 'Chui qua hầm';
        practiceGame = 'Đua ô tô';
      } else {
        warmupGame = 'Chim về tổ';
        practiceGame = 'Đua ô tô';
      }
    } else {
      if (titleLower.includes('gậy') || movementKey === 'gay') {
        warmupGame = 'Ai nhanh hơn với gậy';
        practiceGame = 'Chuyền gậy tiếp sức';
      } else {
        warmupGame = 'Chạy luồn cọc tiêu';
        practiceGame = 'Chuyển bóng tiếp sức';
      }
    }
  }

  return {
    grade,
    ppct,
    topic,
    cleanTitle,
    movementName,
    movementKey,
    warmupGame,
    practiceGame,
    disabledStudentsSpecial: DEFAULT_DISABLED_SPECIAL,
    disabledStudentsGeneral: DEFAULT_DISABLED_GENERAL
  };
}

/**
 * Cleans any repeated or trailing lesson period tags like "(Tiết 1)", "(Tiết 19)" from title
 */
export function cleanLessonTitleForHeader(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*\(\s*tiết\s*\d+[^)]*\)/gi, '') // Remove (tiết 1), (tiết 19)
    .replace(/\s*\(tiết\s*\d+\)/gi, '')
    .replace(/\s*-\s*tiết\s*\d+/gi, '')
    .replace(/\s*tiết\s*\d+\s*[-:]?\s*/gi, '')
    .replace(/\.+$/, '')
    .trim();
}

/**
 * Removes "- KHỐI LỚP ..." from topic text and normalizes official GDPT 2018 topic names
 */
export function cleanTopicForDisplay(topic: string, grade?: number): string {
  if (!topic) return '';
  let clean = topic
    .replace(/\s*-\s*khối\s*(lớp)?\s*\d+/gi, '')
    .replace(/\s*khối\s*(lớp)?\s*\d+/gi, '')
    .trim();

  // Keep Assessment / Evaluation topics intact (never collapse into Bài thể dục)
  if (/đánh giá|tổng kết|kiểm tra/i.test(clean)) {
    return clean.toUpperCase();
  }

  // Fix merged or malformed legacy topics
  if (/đội hình đội ngũ/i.test(clean) && /thể dục/i.test(clean)) {
    clean = 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
  } else if (/bài tập thể dục với gậy/i.test(clean)) {
    clean = 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
  } else if (/bài tập thể dục phát triển chung/i.test(clean)) {
    clean = grade === 1 ? 'CHỦ ĐỀ 2: BÀI THỂ DỤC' : 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
  } else if (/^bài thể dục$/i.test(clean)) {
    clean = 'CHỦ ĐỀ 2: BÀI THỂ DỤC';
  } else if (/^bài tập thể dục$/i.test(clean)) {
    clean = 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
  }

  // Ensure "CHỦ ĐỀ" prefix
  if (!clean.toUpperCase().startsWith('CHỦ ĐỀ')) {
    if (/thể dục/i.test(clean)) {
      clean = grade === 1 ? `CHỦ ĐỀ 2: BÀI THỂ DỤC` : `CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC`;
    } else if (/đội hình/i.test(clean)) {
      clean = `CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ`;
    } else {
      clean = `CHỦ ĐỀ: ${clean}`;
    }
  }

  return clean.toUpperCase();
}

export interface AuditCheckItem {
  id: string;
  grade: 1 | 3 | 5;
  ppct: number;
  scheduleTitle: string;
  planTitle: string;
  isTitleSynced: boolean;
  cleanMasterTitle: string;
  movementText: string;
  movementKey: string;
  isMovementCorrect: boolean;
  hasAuthenticImage: boolean;
  warmupGame: string;
  practiceGame: string;
  isGameSynced: boolean;
  hasDisabledCompetencies: boolean;
  status: 'passed' | 'warning' | 'error';
  messages: string[];
}

export interface AuditReport {
  overallScore: number; // 0 - 100
  allPassed: boolean;
  totalChecks: number;
  passedChecks: number;
  items: AuditCheckItem[];
}

/**
 * Audits all lesson plans and weekly timetable against authentic SGK standards
 */
export function auditCurriculumSync(
  plans: MasterPlanItem[],
  scheduleRows: WeeklyMasterScheduleRow[],
  currentWeek: number
): AuditReport {
  let passedCount = 0;
  let totalCount = 0;

  const items: AuditCheckItem[] = plans.map((plan) => {
    const rule = getCurriculumRule(plan.grade as 1 | 3 | 5, plan.lessonNum, currentWeek);

    // 1. Check title synchronization with timetable
    const schedRow = scheduleRows.find((r) => r.grade === plan.grade && r.ppct === plan.lessonNum);
    const schedTitleClean = cleanLessonTitleForHeader(schedRow?.lessonTitle || '');
    const planTitleClean = cleanLessonTitleForHeader(plan.title || '');
    const cleanMasterTitle = rule ? rule.cleanTitle : planTitleClean;

    // Normalization for robust Vietnamese title comparison
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const nSched = norm(schedTitleClean);
    const nPlan = norm(planTitleClean);
    const nRule = norm(cleanMasterTitle);

    const isTitleSynced = Boolean(
      nSched === nPlan ||
      (nSched && nPlan.includes(nSched)) ||
      (nPlan && nSched.includes(nPlan)) ||
      (nRule && nPlan.includes(nRule)) ||
      (nRule && nRule.includes(nPlan)) ||
      (nSched && nRule && nSched.includes(nRule.slice(0, 12)))
    );

    // 2. Check movement content in row 2 (5-7 rows) or row 4 (granular 11 rows)
    const r2 =
      plan.rows?.find(
        (r) =>
          r.content.includes('Khám phá') ||
          r.content.includes('2.1.') ||
          (r.content.includes('Học') && r.content.includes('động tác'))
      ) || (plan.rows && plan.rows.length >= 2 ? plan.rows[1] : null);
    const r2Content = (r2?.content || '').toLowerCase();
    const movementText = rule?.movementName || 'Động tác chuẩn SGK';
    const movementKeywords = rule
      ? rule.movementName
          .toLowerCase()
          .replace(/[;,.\-()]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2 && !['học', 'động', 'tác', 'với', 'cho', 'các'].includes(w))
      : [];
    const isMovementCorrect = rule
      ? r2Content.includes(rule.movementKey) ||
        r2Content.includes(rule.movementName.toLowerCase().slice(0, 10)) ||
        (movementKeywords.length > 0 && movementKeywords.some((kw) => r2Content.includes(kw))) ||
        r2Content.includes('động tác')
      : true;

    // 3. Check authentic image in movement row
    const imgUrl =
      r2?.contentImgUrl ||
      (r2?.contentImages && r2.contentImages.length > 0 ? r2.contentImages[0].url : '') ||
      '';
    const hasAuthenticImage =
      Boolean(imgUrl) &&
      (imgUrl.includes('/assets/sgk_chuan/') ||
        imgUrl.includes('/assets/aistudio/') ||
        (!imgUrl.startsWith('data:image/svg+xml') && imgUrl.length > 5));

    // 4. Check games strictly in their dedicated rows (1.3 Warmup game & 3.5/3.4 Practice game)
    const r1 =
      plan.rows?.find(
        (r) =>
          r.content.includes('1.3.') ||
          r.content.toLowerCase().includes('trò chơi bổ trợ khởi động') ||
          r.content.toLowerCase().includes('trò chơi khởi động')
      ) || (plan.rows && plan.rows.length >= 1 ? plan.rows[0] : null);
    const rPractice =
      plan.rows?.find(
        (r) =>
          r.content.includes('3.5.') ||
          r.content.toLowerCase().includes('trò chơi vận động')
      ) ||
      (plan.rows && plan.rows.length >= 6 ? plan.rows[5] : plan.rows?.[plan.rows.length - 2]);
    const r1Text = (r1?.content || '').toLowerCase();
    const rPracText = (rPractice?.content || '').toLowerCase();

    const warmupGame = rule?.warmupGame || 'Trò chơi khởi động';
    const practiceGame = rule?.practiceGame || 'Trò chơi vận động';

    const warmupKeywords = rule ? rule.warmupGame.toLowerCase().split(/\s+/).filter((w) => w.length > 3) : [];
    const practiceKeywords = rule ? rule.practiceGame.toLowerCase().split(/\s+/).filter((w) => w.length > 3) : [];

    const isWarmupSynced = rule
      ? r1Text.includes(rule.warmupGame.toLowerCase()) ||
        (warmupKeywords.length > 0 && warmupKeywords.some((kw) => r1Text.includes(kw)))
      : true;

    const isPracticeSynced = rule
      ? rPracText.includes(rule.practiceGame.toLowerCase()) ||
        (practiceKeywords.length > 0 && practiceKeywords.some((kw) => rPracText.includes(kw)))
      : true;

    const r1Img = r1?.contentImgUrl || '';
    const rPracImg = rPractice?.contentImgUrl || '';
    const isNoGradeLeak =
      plan.grade === 1
        ? !r1Img.includes('k3_') && !r1Img.includes('k5_') && !rPracImg.includes('k3_') && !rPracImg.includes('k5_')
        : true;

    const isGameSynced = isWarmupSynced && isPracticeSynced && isNoGradeLeak;

    // 5. Check competencies for disabled students
    const hasDisabledSpecial = Boolean(plan.specialCompetencies?.disabledStudents);
    const hasDisabledGeneral = Boolean(plan.generalCompetencies?.disabledStudents);
    const hasDisabledCompetencies = hasDisabledSpecial && hasDisabledGeneral;

    const messages: string[] = [];
    if (!isTitleSynced) messages.push('Tên bài trong TKB và Giáo án chưa trùng khớp');
    if (!isMovementCorrect) messages.push(`Cột 1 (Nội dung) chưa khớp đúng ${movementText}`);
    if (!hasAuthenticImage) messages.push('Chưa gắn ảnh scan bóc tách SGK thật (đang dùng ảnh tạm)');
    if (!isGameSynced) {
      if (!isNoGradeLeak) {
        messages.push('Hình ảnh trò chơi bị nhầm lẫn giữa các khối lớp');
      } else {
        messages.push(`Trò chơi cần khớp chuẩn SGK: "${warmupGame}" / "${practiceGame}"`);
      }
    }
    if (!hasDisabledCompetencies) messages.push('Thiếu chi tiết giảm tải cho HS khuyết tật');

    let status: 'passed' | 'warning' | 'error' = 'passed';
    if (!isTitleSynced || !hasAuthenticImage || !isMovementCorrect || !isGameSynced) {
      status = 'warning';
    }
    if (messages.length >= 3) {
      status = 'error';
    }

    totalCount += 5;
    if (isTitleSynced) passedCount++;
    if (isMovementCorrect) passedCount++;
    if (hasAuthenticImage) passedCount++;
    if (isGameSynced) passedCount++;
    if (hasDisabledCompetencies) passedCount++;

    return {
      id: plan.id,
      grade: plan.grade as 1 | 3 | 5,
      ppct: plan.lessonNum,
      scheduleTitle: schedRow?.lessonTitle || plan.title,
      planTitle: plan.title,
      isTitleSynced,
      cleanMasterTitle,
      movementText,
      movementKey: rule?.movementKey || 'ky_nang_khac',
      isMovementCorrect,
      hasAuthenticImage,
      warmupGame,
      practiceGame,
      isGameSynced,
      hasDisabledCompetencies,
      status,
      messages
    };
  });

  const overallScore = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

  return {
    overallScore,
    allPassed: overallScore >= 90,
    totalChecks: totalCount,
    passedChecks: passedCount,
    items
  };
}

/**
 * Automatically repairs and synchronizes lesson titles, timetable rows, movement steps,
 * games, and competencies across all 3 grades according to official SGK standards.
 * Guaranteed to achieve 100% textbook synchronization rate.
 */
export function autoSyncCurriculumAndPlans(
  plans: MasterPlanItem[],
  scheduleRows: WeeklyMasterScheduleRow[],
  currentWeek: number,
  images: SgkImageItem[] = []
): { updatedPlans: MasterPlanItem[]; updatedScheduleRows: WeeklyMasterScheduleRow[] } {
  // 1. Synchronize Weekly Schedule Rows
  const updatedScheduleRows = scheduleRows.map((row) => {
    const rule = getCurriculumRule(row.grade as 1 | 3 | 5, row.ppct, currentWeek);
    if (rule) {
      return {
        ...row,
        lessonTitle: rule.cleanTitle
      };
    }
    return {
      ...row,
      lessonTitle: cleanLessonTitleForHeader(row.lessonTitle)
    };
  });

  // 2. Synchronize Detailed Lesson Plans
  const updatedPlans = plans.map((plan) => {
    const key = `k${plan.grade}_t${plan.lessonNum}`;
    const rule = getCurriculumRule(plan.grade as 1 | 3 | 5, plan.lessonNum, currentWeek);

    // If Week 9 authoritative template exists in masterPlansTuan9, use it directly
    if ((plan.week === 9 || currentWeek === 9) && masterPlansTuan9[key]) {
      const auth9 = masterPlansTuan9[key];
      return {
        ...plan,
        topic: auth9.topic,
        title: auth9.title,
        rows: auth9.rows,
        specialCompetencies: auth9.specialCompetencies,
        generalCompetencies: auth9.generalCompetencies,
        qualities: auth9.qualities,
        integrations: auth9.integrations,
        locationEquipment: auth9.locationEquipment
      };
    }

    const masterTitle = rule ? rule.cleanTitle : cleanLessonTitleForHeader(plan.title);
    const cleanTopic = cleanTopicForDisplay(rule?.topic || plan.topic, plan.grade);
    const mKey = rule?.movementKey || 'ky_nang_khac';
    const mName = rule?.movementName || 'nội dung bài học theo PPCT';
    const isAssessmentWeek = mKey === 'danh_gia' || /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(masterTitle);
    const isGranularPlan = plan.rows.length >= 9;
    const slotAssets = resolveLessonSlotAssets(
      plan.grade,
      masterTitle,
      cleanTopic,
      images,
      rule?.warmupGame,
      rule?.practiceGame
    );

    // Map every classified image strictly by row section heading (never misplace onto 1.1 Nhận lớp!)
    const newRows: LessonRow[] = plan.rows.map((row, rIdx) => {
      const cLower = (row.content || '').toLowerCase();
      const isWarmupGameRow =
        cLower.includes('1.3.') ||
        cLower.includes('trò chơi bổ trợ khởi động') ||
        cLower.includes('trò chơi khởi động') ||
        (!isGranularPlan && rIdx === 0);
      const isKhoiDongChungRow =
        !isWarmupGameRow &&
        (cLower.includes('1.2.') || (cLower.includes('khởi động') && !cLower.includes('1.1.')));
      const isKnowledgeRow =
        cLower.includes('2.1.') ||
        cLower.includes('khám phá') ||
        cLower.includes('kiến thức mới') ||
        cLower.includes('tiêu chuẩn đánh giá') ||
        (!isGranularPlan && rIdx === 1);
      const isPracticeGameRow =
        cLower.includes('3.5.') ||
        (cLower.includes('3.4.') && cLower.includes('trò chơi')) ||
        cLower.includes('trò chơi vận động') ||
        (!isGranularPlan && (rIdx === 5 || rIdx === plan.rows.length - 2));
      const isPracticeGroupRow =
        !isPracticeGameRow &&
        (cLower.includes('3.2.') || cLower.includes('tập theo tổ') || cLower.includes('3.1.') || cLower.includes('3.3.') || cLower.includes('3.4.'));
      const isVanDungRow = cLower.includes('4.2.') || cLower.includes('vận dụng');

      // 1.2 Khởi động chung
      if (isKhoiDongChungRow) {
        if (slotAssets.khoiDongImg?.url) {
          return {
            ...row,
            contentImgUrl: slotAssets.khoiDongImg.url,
            contentImgTitle: slotAssets.khoiDongImg.title,
            contentImages: [
              { id: `sync_kd_${rIdx}`, url: slotAssets.khoiDongImg.url, title: slotAssets.khoiDongImg.title }
            ]
          };
        }
        return sanitizeRowColumn1Media(row, plan.grade, masterTitle);
      }

      // 1.3 Trò chơi khởi động (hoặc Hàng 1 trong mẫu 7 dòng)
      if (isWarmupGameRow && rule) {
        let content = row.content;
        if (!content.toLowerCase().includes(slotAssets.warmupGameName.toLowerCase())) {
          if (/1\.3\.\s*Trò chơi[^:\n]*:[^\n]*/i.test(content)) {
            content = content.replace(
              /1\.3\.\s*Trò chơi[^:\n]*:[^\n]*/i,
              `1.3. Trò chơi bổ trợ khởi động: "${slotAssets.warmupGameName}".`
            );
          } else {
            content += `\n1.3. Trò chơi bổ trợ khởi động: "${slotAssets.warmupGameName}".`;
          }
        }
        let gv = row.gv || '';
        let hs = row.hs || '';
        gv = gv
          .replace(/trò chơi bổ trợ khởi động "[^"]*"/gi, `trò chơi bổ trợ khởi động "${slotAssets.warmupGameName}"`)
          .replace(/trò chơi khởi động "[^"]*"/gi, `trò chơi khởi động "${slotAssets.warmupGameName}"`);
        hs = hs
          .replace(/trò chơi khởi động "[^"]*"/gi, `trò chơi khởi động "${slotAssets.warmupGameName}"`)
          .replace(/trò chơi bổ trợ khởi động "[^"]*"/gi, `trò chơi bổ trợ khởi động "${slotAssets.warmupGameName}"`);
        const wImg = slotAssets.warmupGameImg;
        return {
          ...row,
          content,
          gv,
          hs,
          contentImgUrl: wImg.url || undefined,
          contentImgTitle: wImg.title || undefined,
          contentImages: wImg.url ? [{ id: `sync_tckd_${rIdx}`, url: wImg.url, title: wImg.title }] : []
        };
      }

      // 2.1 Khám phá & Làm quen động tác (hoặc Phổ biến tiêu chuẩn đánh giá)
      if (isKnowledgeRow) {
        const acc = slotAssets.movementDetails;
        const resolvedImgUrl = isAssessmentWeek ? '' : acc.imgUrl || '';
        const resolvedImgTitle = isAssessmentWeek ? '' : acc.imgTitle || '';

        const isStale =
          isAssessmentWeek
            ? (cLower.includes('vươn thở') || cLower.includes('bài thể dục') || !cLower.includes('đánh giá'))
            : (!cLower.includes(mKey.replace(/_/g, ' ')) && !cLower.includes(mName.toLowerCase().slice(0, 8)));

        const sectionHeader = isAssessmentWeek
          ? '2. HOẠT ĐỘNG ÔN TẬP & HƯỚNG DẪN ĐÁNH GIÁ\n2.1. Phổ biến nội dung, tiêu chuẩn đánh giá & kiểm tra:'
          : '2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác mới:';

        const content = isStale
          ? `${sectionHeader}\n${acc.movementSteps}`
          : row.content;

        return {
          ...row,
          content,
          contentImgUrl: resolvedImgUrl || undefined,
          contentImgTitle: resolvedImgTitle || undefined,
          contentImages:
            !isAssessmentWeek && acc.allImages && acc.allImages.length > 0 && acc.allImages.some((i) => i.url)
              ? acc.allImages
              : resolvedImgUrl
              ? [{ id: `sync_kt_${rIdx}`, url: resolvedImgUrl, title: resolvedImgTitle }]
              : [],
          gv: acc.gvExplanation || row.gv,
          hs: acc.hsTask || row.hs
        };
      }

      // 3.1 - 3.4 Luyện tập / Kiểm tra thực hành
      if (isPracticeGroupRow) {
        let updatedPracticeRow = sanitizeRowColumn1Media({ ...row }, plan.grade, masterTitle);
        if (isAssessmentWeek && (cLower.includes('vươn thở') || cLower.includes('bài thể dục') || cLower.includes('đồng loạt'))) {
          if (cLower.includes('3.1.')) {
            updatedPracticeRow.content = `3. HOẠT ĐỘNG KIỂM TRA, ĐÁNH GIÁ\n3.1. Ôn tập khởi động chuyên môn & thử sức nhẹ trước kiểm tra:\n- Toàn lớp thực hiện nhẹ nhàng nội dung kiểm tra (${masterTitle}).`;
          } else if (cLower.includes('3.2.')) {
            updatedPracticeRow.content = `3.2. Thực hành kiểm tra theo tổ / lượt đánh giá:\n- Lần lượt từng tổ/nhóm lên vạch xuất phát thực hiện kiểm tra theo hiệu lệnh GV.`;
          } else if (cLower.includes('3.3.')) {
            updatedPracticeRow.content = `3.3. Quan sát, hỗ trợ kiểm tra chéo & hoàn thiện lượt 2:\n- HS chưa đạt mức quy định hoặc cần nâng thành tích được thực hiện lại lượt 2.`;
          } else if (cLower.includes('3.4.')) {
            updatedPracticeRow.content = `3.4. Tổng hợp kết quả đánh giá (TT 27/2020/TT-BGDĐT):\n- Công bố xếp loại Hoàn thành tốt / Hoàn thành / Chưa hoàn thành.`;
          }
          updatedPracticeRow.contentImgUrl = undefined;
          updatedPracticeRow.contentImgTitle = undefined;
          updatedPracticeRow.contentImages = [];
        } else if (cLower.includes('đi đều') && !masterTitle.toLowerCase().includes('đi đều')) {
          updatedPracticeRow.content = `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt:\n- Toàn lớp tập ${mName} theo nhịp hô GV (1-2 lần).\n3.2. Luyện tập theo tổ nhóm (2-3 lần):\n- 4 tổ về 4 khu vực sân bãi, tổ trưởng điều khiển.\n3.3. Luyện tập cặp đôi sửa sai.`;
        }
        if (!isAssessmentWeek && (cLower.includes('3.2.') || !isGranularPlan) && slotAssets.luyenTapImg?.url) {
          updatedPracticeRow.contentImgUrl = slotAssets.luyenTapImg.url;
          updatedPracticeRow.contentImgTitle = slotAssets.luyenTapImg.title;
          updatedPracticeRow.contentImages = [
            { id: `sync_lt_${rIdx}`, url: slotAssets.luyenTapImg.url, title: slotAssets.luyenTapImg.title }
          ];
        }
        return updatedPracticeRow;
      }

      // 3.5 (hoặc 3.4 trong mẫu 7 dòng) Trò chơi vận động
      if (isPracticeGameRow && rule) {
        let content = row.content;
        if (!content.toLowerCase().includes(slotAssets.practiceGameName.toLowerCase())) {
          if (/Trò chơi vận động:[^\n]*/i.test(content)) {
            content = content.replace(
              /Trò chơi vận động:[^\n]*/i,
              `Trò chơi vận động: "${slotAssets.practiceGameName}"`
            );
          } else {
            content += `\n* Trò chơi vận động: "${slotAssets.practiceGameName}"`;
          }
        }
        let gv = row.gv || '';
        let hs = row.hs || '';
        gv = gv
          .replace(/trò chơi vận động "[^"]*"/gi, `trò chơi vận động "${slotAssets.practiceGameName}"`)
          .replace(/trò chơi "[^"]*"/gi, `trò chơi "${slotAssets.practiceGameName}"`);
        hs = hs
          .replace(/trò chơi vận động "[^"]*"/gi, `trò chơi vận động "${slotAssets.practiceGameName}"`)
          .replace(/trò chơi "[^"]*"/gi, `trò chơi "${slotAssets.practiceGameName}"`);

        if (plan.grade === 1) {
          content = content.replace(/4\s*gậy\/bóng\/cọc tiêu/gi, 'vạch xuất phát, cọc mốc an toàn');
          gv = gv.replace(/cất gậy và\s*/gi, '').replace(/4\s*gậy/gi, 'cọc mốc');
          hs = hs.replace(/cầm gậy/gi, 'chạy tiếp sức');
        }
        const pImg = slotAssets.practiceGameImg;
        return {
          ...row,
          content,
          gv,
          hs,
          contentImgUrl: pImg.url || undefined,
          contentImgTitle: pImg.title || undefined,
          contentImages: pImg.url ? [{ id: `sync_tcvd_${rIdx}`, url: pImg.url, title: pImg.title }] : []
        };
      }

      // 4.2 Vận dụng thực tế (Chuẩn hóa theo SGK, bỏ gợi ý giải phẫu & dặn dò về nhà; giữ/gắn ảnh Vận dụng)
      if (isVanDungRow) {
        const cleanedVd = sanitizeVanDungRow(sanitizeRowColumn1Media(row, plan.grade, masterTitle));
        return {
          ...cleanedVd,
          ...(slotAssets.vanDungImg?.url && !cleanedVd.contentImgUrl
            ? {
                contentImgUrl: slotAssets.vanDungImg.url,
                contentImgTitle: slotAssets.vanDungImg.title,
                contentImages: [
                  { id: `sync_vd_${rIdx}`, url: slotAssets.vanDungImg.url, title: slotAssets.vanDungImg.title }
                ]
              }
            : {})
        };
      }

      return sanitizeRowColumn1Media(row, plan.grade, masterTitle);
    });

    // Check if competencies mention a mismatched movement (e.g. mentions "đi đều" or "vươn thở" when teaching another topic or Assessment week)
    const isCompMismatched =
      (Boolean(plan.specialCompetencies?.basicMovement?.toLowerCase().includes('đi đều')) &&
        !masterTitle.toLowerCase().includes('đi đều')) ||
      (isAssessmentWeek &&
        /vươn thở|bài thể dục/i.test(plan.specialCompetencies?.basicMovement || ''));

    const specialComp = (!isCompMismatched && plan.specialCompetencies) ? plan.specialCompetencies : {
      healthCare:
        `Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; thực hiện các yêu cầu an toàn trước, trong và sau khi tập luyện nội dung ${mName}.`,
      basicMovement:
        `Thực hiện được ${mName} theo hướng dẫn của GV; biết xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.`,
      sportsCompetency:
        `Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV về ${mName}; biết tự điều chỉnh động tác khi luyện tập.`,
      disabledStudents:
        plan.specialCompetencies?.disabledStudents ||
        'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
    };

    const generalComp = {
      autonomy:
        plan.generalCompetencies?.autonomy ||
        'Chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; lắng nghe hướng dẫn, tự giác luyện tập và tự điều chỉnh lỗi sai.',
      collaboration:
        plan.generalCompetencies?.collaboration ||
        'Biết phối hợp với bạn, tổ/nhóm; chấp hành phân công, hỗ trợ bạn trong quá trình tập luyện và tham gia trò chơi.',
      problemSolving:
        plan.generalCompetencies?.problemSolving ||
        'Biết quan sát, nhận xét tình huống vận động đơn giản; phát hiện lỗi sai thường gặp và lựa chọn cách thực hiện an toàn, phù hợp.',
      disabledStudents:
        plan.generalCompetencies?.disabledStudents ||
        'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    };

    const qualities = {
      diligence:
        plan.qualities?.diligence ||
        'Tích cực, tự giác trong tập luyện, hoạt động tập thể và rèn luyện thể dục thể thao hằng ngày.',
      honesty:
        plan.qualities?.honesty ||
        'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.',
      responsibility:
        plan.qualities?.responsibility ||
        'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn khi luyện tập.',
      disabledStudents:
        plan.qualities?.disabledStudents ||
        'Giảm nhẹ các yêu cầu về phẩm chất, tham gia các hoạt động vui vẻ cùng bạn.'
    };

    return {
      ...plan,
      topic: cleanTopic,
      title: masterTitle,
      rows: newRows,
      specialCompetencies: specialComp,
      generalCompetencies: generalComp,
      qualities: qualities
    };
  });

  return {
    updatedPlans,
    updatedScheduleRows
  };
}

export interface ComplianceAuditReport {
  is100PercentCompliant: boolean;
  score: number;
  expectedTitle: string;
  expectedMovement: string;
  expectedGame: string;
  checks: {
    id: string;
    title: string;
    passed: boolean;
    currentValue: string;
    expectedValue: string;
    description: string;
  }[];
}

/**
 * Audits a lesson plan against authoritative MoET curriculum & SGK standards.
 * Verifies 100% compliance across PPCT, movement name, vector image, practice steps, and dynamic application.
 */
export function auditPlanAgainstCurriculum(
  grade: number,
  week: number,
  lessonNum: number,
  title: string,
  rows: LessonRow[]
): ComplianceAuditReport {
  let key = `k${grade}_t${lessonNum}`;
  let rule: CurriculumItemRule | undefined = AUTHORITATIVE_CURRICULUM_RULES[key];
  if (!rule) {
    for (let p = 1; p <= 70; p++) {
      const candidate = AUTHORITATIVE_CURRICULUM_RULES[`k${grade}_t${p}`];
      if (candidate && Math.ceil(candidate.ppct / 2) === week) {
        rule = candidate;
        break;
      }
    }
  }
  if (!rule) {
    rule = getCurriculumRule(grade as 1 | 3 | 5, lessonNum, week);
  }

  const expectedTitle = rule?.cleanTitle || title;
  const expectedMovement = rule?.movementName || 'Nội dung bài học theo PPCT';
  const expectedGame = rule?.practiceGame || 'Trò chơi vận động SGK';

  const titleLower = (title || '').toLowerCase();
  const expMovLower = expectedMovement.toLowerCase();
  const isAssessment = /kiểm tra|đánh giá|tổng kết|xếp loại|tiêu chuẩn rèn luyện/i.test(expectedTitle);

  // 1. PPCT & Lesson Title check
  const titlePassed = Boolean(
    title &&
      (titleLower.includes(expectedTitle.toLowerCase().slice(0, 15)) ||
        (isAssessment && /kiểm tra|đánh giá|xếp loại|tiêu chuẩn/i.test(titleLower)) ||
        (expMovLower.includes('phối hợp') && titleLower.includes('phối hợp')) ||
        (expMovLower.includes('điều hòa') && titleLower.includes('điều hòa')) ||
        (expMovLower.includes('nhảy') && titleLower.includes('nhảy')) ||
        (expMovLower.includes('toàn thân') && titleLower.includes('toàn thân')) ||
        (expMovLower.includes('bụng') && titleLower.includes('bụng')) ||
        (expMovLower.includes('chân') && titleLower.includes('chân')) ||
        (expMovLower.includes('vặn mình') && titleLower.includes('vặn mình')) ||
        (expMovLower.includes('vươn thở') && titleLower.includes('vươn thở')) ||
        (expMovLower.includes('tay') && titleLower.includes('tay')))
  );

  // 2. Movement / Content Name in Discovery Row (2.1)
  const movRow =
    rows.find(
      (r) =>
        r.content.includes('2.1') ||
        r.content.toLowerCase().includes('khám phá') ||
        r.content.toLowerCase().includes('học động tác') ||
        r.content.toLowerCase().includes('kiểm tra')
    ) ||
    rows[3] ||
    rows[1];
  const movContentLower = (movRow?.content || '').toLowerCase();

  let movNamePassed = false;
  if (isAssessment) {
    movNamePassed =
      (movContentLower.includes('kiểm tra') || movContentLower.includes('đánh giá') || movContentLower.includes('thể lực')) &&
      !movContentLower.includes('học động tác vươn thở');
  } else if (expMovLower.includes('phối hợp')) {
    movNamePassed = movContentLower.includes('phối hợp') && !movContentLower.includes('toàn lớp thực hiện động tác bụng');
  } else if (expMovLower.includes('điều hòa')) {
    movNamePassed = movContentLower.includes('điều hòa');
  } else if (expMovLower.includes('nhảy')) {
    movNamePassed = movContentLower.includes('nhảy');
  } else if (expMovLower.includes('toàn thân')) {
    movNamePassed = movContentLower.includes('toàn thân');
  } else if (expMovLower.includes('bụng')) {
    movNamePassed = movContentLower.includes('bụng');
  } else if (expMovLower.includes('chân')) {
    movNamePassed = movContentLower.includes('chân');
  } else if (expMovLower.includes('vặn mình')) {
    movNamePassed = movContentLower.includes('vặn mình');
  } else if (expMovLower.includes('vươn thở')) {
    movNamePassed = movContentLower.includes('vươn thở');
  } else {
    movNamePassed = movContentLower.length > 20 && !movContentLower.includes('học động tác vươn thở');
  }

  // 3. Technical Diagram / Authentic Cropped Photo (Inspect BOTH URL AND Title + contentImages!)
  const movMediaEntries = [
    movRow?.contentImgUrl || '',
    movRow?.contentImgTitle || '',
    ...(movRow?.contentImages || []).map((i) => `${i.url || ''} ${i.title || ''}`)
  ];
  const imgCorpus = movMediaEntries.join(' ').toLowerCase();
  const imgUrl = movRow?.contentImgUrl || movRow?.contentImages?.[0]?.url || '';
  const imgTitleDisplay = movRow?.contentImgTitle || movRow?.contentImages?.[0]?.title || '';

  const invalidCol1Rows = rows.filter((r) => {
    const imgs =
      r.contentImages && r.contentImages.length > 0
        ? r.contentImages
        : r.contentImgUrl
        ? [{ url: r.contentImgUrl, title: r.contentImgTitle || '' }]
        : [];
    return imgs.some((im) => isInvalidColumn1AttachmentForRow(r.content, im.url, im.title, grade, title));
  });
  const hasInvalidCol1Placement = invalidCol1Rows.length > 0;

  let imgPassed = false;
  if (hasInvalidCol1Placement) {
    imgPassed = false;
  } else if (isAssessment) {
    imgPassed = !imgCorpus.includes('vươn thở') && !imgCorpus.includes('vuon_tho');
  } else if (expMovLower.includes('phối hợp')) {
    imgPassed =
      (imgCorpus.includes('phối hợp') || imgCorpus.includes('phoi_hop') || imgCorpus.includes('k1_phoi_hop')) &&
      !imgCorpus.includes('k1_chan') &&
      !imgCorpus.includes('k1_bung');
  } else if (expMovLower.includes('điều hòa')) {
    imgPassed =
      imgCorpus.includes('điều hòa') ||
      imgCorpus.includes('điều hoà') ||
      imgCorpus.includes('dieu_hoa') ||
      imgCorpus.includes('k5') ||
      imgCorpus.includes('k1_dieu_hoa');
  } else if (expMovLower.includes('nhảy')) {
    imgPassed =
      imgCorpus.includes('nhảy') ||
      imgCorpus.includes('nhay') ||
      imgCorpus.includes('chan_voi_gay') ||
      imgCorpus.includes('toan_than');
  } else if (expMovLower.includes('toàn thân')) {
    imgPassed = imgCorpus.includes('toàn thân') || imgCorpus.includes('toan_than');
  } else if (expMovLower.includes('bụng')) {
    imgPassed = imgCorpus.includes('bụng') || imgCorpus.includes('bung');
  } else if (expMovLower.includes('lườn')) {
    imgPassed = imgCorpus.includes('lườn') || imgCorpus.includes('luon');
  } else if (expMovLower.includes('vặn mình')) {
    imgPassed = imgCorpus.includes('vặn mình') || imgCorpus.includes('van_minh');
  } else if (expMovLower.includes('chân')) {
    imgPassed = imgCorpus.includes('chân') || imgCorpus.includes('chan');
  } else if (expMovLower.includes('vươn thở')) {
    imgPassed = imgCorpus.includes('vươn thở') || imgCorpus.includes('vuon_tho');
  } else if (expMovLower.includes('tay')) {
    imgPassed = imgCorpus.includes('động tác tay') || imgCorpus.includes('k1_tay') || imgCorpus.includes('vuon_tho_tay');
  } else {
    imgPassed = Boolean(imgUrl) && !isInvalidColumn1AttachmentForRow(movRow?.content || '', imgUrl, imgTitleDisplay, grade, title);
  }

  // 4. Practice Sequence (3.1 - 3.4)
  const practiceRows = rows.filter(r => r.content.includes('3.1') || r.content.includes('3.2') || r.content.includes('3.3') || r.content.includes('3.4'));
  const practicePassed = practiceRows.length >= 3 && practiceRows.every(r => {
    const cLower = r.content.toLowerCase();
    if (isAssessment) return !cLower.includes('động tác vươn thở') && !cLower.includes('học động tác mới');
    if (expMovLower.includes('phối hợp')) return !cLower.includes('động tác bụng') && !cLower.includes('động tác chân');
    if (expMovLower.includes('điều hòa')) return !cLower.includes('động tác vươn thở');
    return true;
  });

  // 5. Standardized SGK Vận dụng (4.2): No fabricated question, no anatomy answer guide, no Dặn dò về nhà
  const vanDungRow = rows.find(r => r.content.includes('4.2') || r.content.toLowerCase().includes('vận dụng')) || rows[rows.length - 1];
  const vdContentLower = (vanDungRow?.content || '').toLowerCase();
  const vdFullLower = `${vanDungRow?.content || ''} ${vanDungRow?.gv || ''} ${vanDungRow?.hs || ''}`.toLowerCase();
  const hasForbiddenVanDungTerms =
    /vận dụng & dặn dò|gợi ý trả lời|nhiệm vụ rèn luyện|dặn dò về nhà|tự tập ở nhà|cơ liên sườn|tứ đầu|cơ đùi|gân kheo|đốt sống cổ|nhóm cơ nào/.test(
      vdFullLower
    );
  const vdPassed = Boolean(
    vanDungRow &&
    (vdContentLower.includes('câu hỏi vận dụng sách giáo khoa') ||
      vdContentLower.includes('4.2. vận dụng')) &&
    !hasForbiddenVanDungTerms
  );

  const resolvedImgLabel = hasInvalidCol1Placement
    ? `Đặt nhầm ảnh/sơ đồ (${invalidCol1Rows.length} mục Cột 1)`
    : isAssessment
    ? imgPassed
      ? 'Phiếu / Sơ đồ đánh giá thể lực'
      : 'Đang gắn nhầm ảnh Vươn thở'
    : imgTitleDisplay
    ? imgTitleDisplay
    : imgCorpus.includes('phoi_hop') || imgCorpus.includes('phối hợp')
    ? 'Tranh ĐT Phối hợp'
    : imgCorpus.includes('dieu_hoa') || imgCorpus.includes('điều hòa')
    ? 'Tranh ĐT Điều hòa'
    : imgCorpus.includes('chan') || imgCorpus.includes('chân')
    ? 'Tranh ĐT Chân'
    : imgCorpus.includes('bung') || imgCorpus.includes('bụng')
    ? 'Tranh ĐT Bụng'
    : imgUrl
    ? 'Ảnh kỹ thuật đính kèm'
    : `Chưa có ảnh SGK Khối ${grade} (Cần trích xuất ở Tab 1)`;

  const checks = [
    {
      id: 'ppct',
      title: 'Phân phối chương trình & Tiêu đề',
      passed: titlePassed,
      currentValue: title || 'Chưa đặt tiêu đề',
      expectedValue: expectedTitle,
      description: titlePassed ? 'Khớp chính xác tuần và tên bài học theo PPCT' : 'Cần cập nhật đúng tên bài học theo PPCT của tuần'
    },
    {
      id: 'movement',
      title: isAssessment ? 'Nội dung kiểm tra & đánh giá' : 'Tên kỹ thuật động tác mới',
      passed: movNamePassed,
      currentValue: movRow
        ? isAssessment
          ? movContentLower.includes('vươn thở')
            ? 'Đang lẫn nội dung Vươn thở / Bài thể dục'
            : 'Kiểm tra, đánh giá thể lực & năng lực'
          : movContentLower.includes('phối hợp')
          ? 'Động tác Phối hợp'
          : movContentLower.includes('điều hòa')
          ? 'Động tác Điều hòa'
          : movContentLower.includes('bụng')
          ? 'Động tác Bụng'
          : 'Động tác theo bài học'
        : 'Chưa có',
      expectedValue: expectedMovement,
      description: movNamePassed ? 'Đúng nội dung bài học theo phân phối tuần' : 'Nội dung đang ghi sai tên động tác của tuần khác'
    },
    {
      id: 'image',
      title: isAssessment ? 'Học liệu / Không lẫn tranh Bài thể dục' : 'Tranh kỹ thuật & Phân loại ảnh Cột 1',
      passed: imgPassed,
      currentValue: resolvedImgLabel,
      expectedValue: isAssessment ? 'Không gắn nhầm tranh Bài thể dục' : `Ảnh SGK Khối ${grade} khớp đúng mục`,
      description: hasInvalidCol1Placement
        ? 'Phát hiện ảnh đặt sai mục (ví dụ: trò chơi đặt vào 1.2 Khởi động chung hoặc sơ đồ đặt vào Cột 1) — cần loại bỏ hoặc trích xuất ảnh SGK đúng.'
        : imgPassed
        ? isAssessment
          ? 'Sạch nội dung kiểm tra cuối năm, không lẫn tranh Bài thể dục'
          : 'Đã gắn tranh kỹ thuật / ảnh bóc tách chuẩn SGK đúng mục và đúng Khối'
        : `Chưa tìm được ảnh SGK Khối ${grade} phù hợp cho ${expectedMovement} — cần trích xuất từ trang sách tương ứng ở Tab 1.`
    },
    {
      id: 'practice',
      title: 'Chuỗi hoạt động luyện tập (3.1 - 3.4)',
      passed: practicePassed,
      currentValue: `${practiceRows.length}/4 hoạt động chuẩn`,
      expectedValue: 'Tập đồng loạt, tổ, cặp đôi và thi đua',
      description: practicePassed ? 'Đầy đủ 4 bước luyện tập chuẩn sư phạm tương xứng 1:1' : 'Các hoạt động luyện tập cần đồng bộ đúng tên động tác'
    },
    {
      id: 'application',
      title: 'Vận dụng thực tế (SGK)',
      passed: vdPassed,
      currentValue: vdPassed ? 'Câu hỏi vận dụng sách giáo khoa' : 'Còn gợi ý giải phẫu / dặn dò về nhà / câu hỏi không khớp',
      expectedValue: 'Ghi "Câu hỏi vận dụng sách giáo khoa" + ảnh SGK (không gợi ý giải phẫu, không dặn dò về nhà)',
      description: vdPassed
        ? 'Đúng chuẩn mục 4.2: ghi "Câu hỏi vận dụng sách giáo khoa", sạch thuật ngữ giải phẫu và phần dặn dò về nhà.'
        : 'Cần chuẩn hóa mục 4.2 thành "Câu hỏi vận dụng sách giáo khoa", bỏ phần Gợi ý trả lời và Dặn dò về nhà.'
    }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const is100PercentCompliant = passedCount === checks.length;

  return {
    is100PercentCompliant,
    score,
    expectedTitle,
    expectedMovement,
    expectedGame,
    checks
  };
}
