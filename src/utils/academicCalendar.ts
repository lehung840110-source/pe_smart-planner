/**
 * Academic Calendar and Curriculum Distribution (PPCT) utilities for Primary Physical Education (GDTC)
 * Covers Grades 1, 3, 5 across 35 academic weeks.
 * Supports official 7-column timetable: Thứ | Tiết | Lớp | Bài học | PPCT | ND Tích hợp/điều chỉnh | ĐDDH
 */

import { GradeLevel, WeeklyMasterScheduleRow } from '../types/gdtc';
import {
  formatIntegrationForScheduleCell,
  getIntegrationAddressForLesson
} from '../data/integrationAddressesData';

export interface WeekDateInfo {
  week: number;
  startDateStr: string;   // DD/MM/YYYY
  endDateStr: string;     // DD/MM/YYYY
  dateRangeText: string;  // "Từ ngày DD/MM/YYYY đến ngày DD/MM/YYYY"
  approvalDateText: string; // "Vệ Giang, ngày DD tháng MM năm YYYY"
}

export interface WeeklyGradePpctInfo {
  grade: GradeLevel;
  week: number;
  periods: number[];      // e.g. [15, 16] or [17, 18]
  periodLabel: string;    // "Tiết 17, 18"
  defaultTopic: string;
  defaultTitle: string;
}

/**
 * Calculates academic week dates starting from the beginning of the school year.
 * Default starting Monday: September 7, 2026.
 */
export function getWeekDateInfo(week: number, baseYear: number = 2026): WeekDateInfo {
  // Semester 1 start Monday: Sep 7, 2026
  const startMonday = new Date(baseYear, 8, 7); // Month is 0-indexed: 8 = September
  
  // Semester 2 adjustment if week > 18 (e.g. 2 weeks Tet break)
  let dayOffset = (week - 1) * 7;
  if (week > 18) {
    dayOffset += 14; // 2 weeks Tet holiday
  }

  const monDate = new Date(startMonday);
  monDate.setDate(startMonday.getDate() + dayOffset);

  const friDate = new Date(monDate);
  friDate.setDate(monDate.getDate() + 4);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dMon = `${pad(monDate.getDate())}/${pad(monDate.getMonth() + 1)}/${monDate.getFullYear()}`;
  const dFri = `${pad(friDate.getDate())}/${pad(friDate.getMonth() + 1)}/${friDate.getFullYear()}`;

  const dateRangeText = `Từ ngày ${dMon} đến ngày ${dFri}`;
  const approvalDateText = `Vệ Giang, ngày ${pad(friDate.getDate())} tháng ${pad(friDate.getMonth() + 1)} năm ${friDate.getFullYear()}`;

  return {
    week,
    startDateStr: dMon,
    endDateStr: dFri,
    dateRangeText,
    approvalDateText
  };
}

import {
  defaultGrade1Ppct,
  defaultGrade2Ppct,
  defaultGrade3Ppct,
  defaultGrade4Ppct,
  defaultGrade5Ppct
} from '../data/defaultPpctData';

/**
 * Calculates curriculum distribution (PPCT) periods for a given grade and week.
 * Dynamically queries official PPCT data across all 35 weeks for Grades 1, 2, 3, 4, and 5.
 */
export function getGradePpctInfo(grade: GradeLevel, week: number): WeeklyGradePpctInfo {
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const periods = [p1, p2];

  const ppctList =
    grade === 1
      ? defaultGrade1Ppct
      : grade === 2
      ? defaultGrade2Ppct
      : grade === 3
      ? defaultGrade3Ppct
      : grade === 4
      ? defaultGrade4Ppct
      : defaultGrade5Ppct;
  const matched = ppctList.filter((item) => item.week === week);
  const first = matched[0];

  const defaultTopic = first ? first.topic : (grade === 1 ? 'CHỦ ĐỀ 2: BÀI THỂ DỤC' : 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC');
  let rawTitle = first ? first.lessonTitle : '';
  if (!rawTitle) {
    rawTitle = week === 9
      ? (grade === 1
          ? 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng'
          : grade === 2
          ? 'Bài 2: Động tác chân, động tác lườn'
          : grade === 3
          ? 'Bài 1: Động tác vươn thở, động tác tay, động tác chân'
          : grade === 4
          ? 'Bài 2: Động tác chân, động tác lườn với vòng thể dục'
          : 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy')
      : `Bài học thể dục Tuần ${week}`;
  }
  // Strip trailing (tiết 1), (tiết 2) and clean title
  const defaultTitle = rawTitle.replace(/\s*\(\s*tiết\s*\d+[^)]*\)/gi, '').replace(/\.+$/, '').trim();

  return {
    grade,
    week,
    periods,
    periodLabel: `Tiết ${p1}, ${p2}`,
    defaultTopic,
    defaultTitle
  };
}

/**
 * Weekly Cross-curricular Theme Integrations
 */
export interface WeeklyIntegrationThemes {
  week: number;
  qpanTheme: string;      // Quốc phòng - An ninh
  envTheme: string;       // Bảo vệ môi trường
  trafficTheme: string;   // An toàn giao thông
  lifeSkillsTheme: string;// Kỹ năng sống & Tự chủ
  digitalTheme: string;   // Năng lực số
  inclusionTheme: string; // Giáo dục hòa nhập
  gvScriptAddon: string;  // Nội dung lồng ghép vào hoạt động GV
  hsScriptAddon: string;  // Hành động tương ứng của HS
}

export function getWeeklyIntegrationThemes(week: number, grade?: number): WeeklyIntegrationThemes {
  const safeGrade = grade ? Math.min(5, Math.max(1, Math.round(grade))) : 1;
  const addr = getIntegrationAddressForLesson(safeGrade, week);
  const allGradeAddrs = [1, 2, 3, 4, 5].map((g) => getIntegrationAddressForLesson(g, week));

  const qpanMatch = allGradeAddrs.find((a) => a.domains.includes('GDQPAN'));
  const envMatch = allGradeAddrs.find((a) => a.domains.includes('BVMT'));
  const atgtMatch = allGradeAddrs.find((a) => a.domains.includes('ATGT'));
  const nlsMatch = allGradeAddrs.find((a) => a.domains.includes('NLS'));
  const knsMatch = allGradeAddrs.find((a) => a.domains.includes('KNS') || a.domains.includes('QuyenTreEm'));

  return {
    week,
    qpanTheme:
      qpanMatch?.content ||
      `Rèn tác phong nhanh nhẹn, ý thức tổ chức kỷ luật, chấp hành hiệu lệnh và phối hợp đồng đội (Tuần ${week}).`,
    envTheme:
      envMatch?.content ||
      `Giữ gìn vệ sinh cá nhân và sân tập sạch sẽ, không xả rác, thu dọn dụng cụ ngăn nắp sau tiết học.`,
    trafficTheme:
      atgtMatch?.content ||
      `Quan sát hướng di chuyển an toàn, giữ khoảng cách và chấp hành quy tắc an toàn giao thông.`,
    lifeSkillsTheme:
      knsMatch?.content ||
      `Hợp tác theo tổ/nhóm, tôn trọng thể lực từng bạn, tuân thủ luật chơi và rèn luyện hằng ngày.`,
    digitalTheme: nlsMatch
      ? `${nlsMatch.headerLabel}: ${nlsMatch.content}`
      : `${addr.headerLabel}: ${addr.content}`,
    inclusionTheme:
      'Tôn trọng năng lực cá nhân, khích lệ học sinh hòa nhập tham gia tập luyện phù hợp thể lực và cùng bạn chơi trò chơi.',
    gvScriptAddon: `GV lồng ghép tích hợp ${addr.headerLabel}: ${addr.content}`,
    hsScriptAddon: `HS thực hiện tốt nội dung tích hợp (${addr.headerLabel}), đảm bảo an toàn tập luyện và giữ gìn vệ sinh sân bãi.`
  };
}

/**
 * EXACT 7-COLUMN OFFICIAL SCHEDULE (MẪU KẾ HOẠCH TRANG ĐẦU GIÁO ÁN) FOR WEEK 9
 * As provided in the teacher's uploaded Microsoft Word document
 */
export const defaultWeek9Schedule: WeeklyMasterScheduleRow[] = [
  {
    id: 'w9_row_1',
    dayOfWeek: 'Thứ 2 – Sáng',
    period: 2,
    className: '1A4',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người và sự phối hợp các bộ phận: không chạm thiết bị khi tay ướt, không tự ý bấm và báo giáo viên khi cần hỗ trợ.-',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_2',
    dayOfWeek: 'Thứ 2 – Sáng',
    period: 3,
    className: '1A5',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người và sự phối hợp các bộ phận.',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_3',
    dayOfWeek: 'Thứ 2 – Sáng',
    period: 4,
    className: '1A3',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người.',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_4',
    dayOfWeek: 'Thứ 2 – Chiều',
    period: 2,
    className: '1A1',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người.',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_5',
    dayOfWeek: 'Thứ 2 – Chiều',
    period: 3,
    className: '1A2',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người.',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_6',
    dayOfWeek: 'Thứ 3 – Chiều',
    period: 1,
    className: '5A1',
    grade: 5,
    lessonTitle: 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (6.1TC2a): Học sinh làm quen và bước đầu nhận thức được sự hỗ trợ của trí tuệ nhân tạo (AI) thông qua việc quan sát phần mềm phân tích tư thế chân, tay, thân người, cách cầm gậy, biên độ và nhịp động tác đúng/sai mà giáo viên giới thiệu.',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_7',
    dayOfWeek: 'Thứ 3 – Chiều',
    period: 2,
    className: '3A1',
    grade: 3,
    lessonTitle: 'Bài 1: Động tác vươn thở, động tác tay (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_8',
    dayOfWeek: 'Thứ 3 – Chiều',
    period: 3,
    className: '5A2',
    grade: 5,
    lessonTitle: 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (6.1TC2a): Học sinh làm quen và bước đầu nhận thức được sự hỗ trợ của trí tuệ nhân tạo (AI) thông qua việc quan sát phần mềm phân tích tư thế chân, tay, thân người, cách cầm gậy...',
    equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
  },
  {
    id: 'w9_row_9',
    dayOfWeek: 'Thứ 5 – Sáng',
    period: 2,
    className: '1A1',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_10',
    dayOfWeek: 'Thứ 5 – Chiều',
    period: 2,
    className: '3A1',
    grade: 3,
    lessonTitle: 'Bài 1: Động tác vươn thở, động tác tay (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: HS rèn tác phong nhanh nhẹn, nghiêm túc, chấp hành khẩu lệnh, giữ đội hình và tinh thần đoàn kết.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_11',
    dayOfWeek: 'Thứ 6 – Sáng',
    period: 2,
    className: '1A4',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_12',
    dayOfWeek: 'Thứ 6 – Sáng',
    period: 3,
    className: '1A5',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_13',
    dayOfWeek: 'Thứ 6 – Sáng',
    period: 4,
    className: '1A3',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_14',
    dayOfWeek: 'Thứ 6 – Chiều',
    period: 1,
    className: '5A1',
    grade: 5,
    lessonTitle: 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_15',
    dayOfWeek: 'Thứ 6 – Chiều',
    period: 2,
    className: '5A2',
    grade: 5,
    lessonTitle: 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_16',
    dayOfWeek: 'Thứ 6 – Chiều',
    period: 3,
    className: '1A2',
    grade: 1,
    lessonTitle: 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng. (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.',
    equipment: 'SGK, Tranh ảnh, dụng cụ TL'
  },
  {
    id: 'w9_row_17',
    dayOfWeek: 'Thứ 3 – Sáng',
    period: 1,
    className: '2A1',
    grade: 2,
    lessonTitle: 'Bài 2: Động tác chân, động tác lườn (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (3.1TC1a): Quan sát hình ảnh/video trình tự nhịp động tác chân, lườn an toàn theo hướng dẫn GV.',
    equipment: 'SGK, Tranh ảnh, còi, dụng cụ TL'
  },
  {
    id: 'w9_row_18',
    dayOfWeek: 'Thứ 5 – Sáng',
    period: 1,
    className: '2A1',
    grade: 2,
    lessonTitle: 'Bài 2: Động tác chân, động tác lườn (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp giáo dục quốc phòng và an ninh: Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh.',
    equipment: 'SGK, Tranh ảnh, còi, dụng cụ TL'
  },
  {
    id: 'w9_row_19',
    dayOfWeek: 'Thứ 4 – Sáng',
    period: 1,
    className: '4A1',
    grade: 4,
    lessonTitle: 'Bài 2: Động tác chân, động tác lườn với vòng thể dục (tiết 1)',
    ppct: 17,
    integrationNotes: '- Tích hợp năng lực số (4.1TC1a / 6.1TC2a): Quan sát học liệu số và phân tích tư thế giữ vòng thăng bằng qua hình ảnh minh họa.',
    equipment: 'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  },
  {
    id: 'w9_row_20',
    dayOfWeek: 'Thứ 4 – Chiều',
    period: 1,
    className: '4A1',
    grade: 4,
    lessonTitle: 'Bài 2: Động tác chân, động tác lườn với vòng thể dục (tiết 2)',
    ppct: 18,
    integrationNotes: '- Tích hợp bảo vệ môi trường: Thu dọn vòng thể dục ngăn nắp sau tập, giữ sân bãi sạch đẹp.',
    equipment: 'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  }
];

/**
 * Returns default schedule for any week (auto-generates based on week and PPCT rules if not week 9)
 */
export function getDefaultWeeklySchedule(week: number): WeeklyMasterScheduleRow[] {
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const g1Info = getGradePpctInfo(1, week);
  const g2Info = getGradePpctInfo(2, week);
  const g3Info = getGradePpctInfo(3, week);
  const g4Info = getGradePpctInfo(4, week);
  const g5Info = getGradePpctInfo(5, week);

  const g1Note1 = formatIntegrationForScheduleCell(1, week, p1, g1Info.defaultTitle);
  const g1Note2 = formatIntegrationForScheduleCell(1, week, p2, g1Info.defaultTitle);
  const g2Note1 = formatIntegrationForScheduleCell(2, week, p1, g2Info.defaultTitle);
  const g2Note2 = formatIntegrationForScheduleCell(2, week, p2, g2Info.defaultTitle);
  const g3Note1 = formatIntegrationForScheduleCell(3, week, p1, g3Info.defaultTitle);
  const g3Note2 = formatIntegrationForScheduleCell(3, week, p2, g3Info.defaultTitle);
  const g4Note1 = formatIntegrationForScheduleCell(4, week, p1, g4Info.defaultTitle);
  const g4Note2 = formatIntegrationForScheduleCell(4, week, p2, g4Info.defaultTitle);
  const g5Note1 = formatIntegrationForScheduleCell(5, week, p1, g5Info.defaultTitle);
  const g5Note2 = formatIntegrationForScheduleCell(5, week, p2, g5Info.defaultTitle);

  return [
    {
      id: `w${week}_1`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 2,
      className: '1A4',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_2`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 3,
      className: '1A5',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_3`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 4,
      className: '1A3',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_4`,
      dayOfWeek: 'Thứ 2 – Chiều',
      period: 2,
      className: '1A1',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_5`,
      dayOfWeek: 'Thứ 2 – Chiều',
      period: 3,
      className: '1A2',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_6`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 1,
      className: '5A1',
      grade: 5,
      lessonTitle: `${g5Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g5Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_7`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 2,
      className: '3A1',
      grade: 3,
      lessonTitle: `${g3Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g3Note1,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_8`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 3,
      className: '5A2',
      grade: 5,
      lessonTitle: `${g5Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g5Note1,
      equipment: 'SGK, Tranh ảnh, video, dụng cụ TL'
    },
    {
      id: `w${week}_9`,
      dayOfWeek: 'Thứ 5 – Sáng',
      period: 2,
      className: '1A1',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_10`,
      dayOfWeek: 'Thứ 5 – Chiều',
      period: 2,
      className: '3A1',
      grade: 3,
      lessonTitle: `${g3Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g3Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_11`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 2,
      className: '1A4',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_12`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 3,
      className: '1A5',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_13`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 4,
      className: '1A3',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_14`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 1,
      className: '5A1',
      grade: 5,
      lessonTitle: `${g5Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g5Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_15`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 2,
      className: '5A2',
      grade: 5,
      lessonTitle: `${g5Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g5Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_16`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 3,
      className: '1A2',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_17`,
      dayOfWeek: 'Thứ 3 – Sáng',
      period: 1,
      className: '2A1',
      grade: 2,
      lessonTitle: `${g2Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g2Note1,
      equipment: 'SGK, Tranh ảnh, còi, dụng cụ TL'
    },
    {
      id: `w${week}_18`,
      dayOfWeek: 'Thứ 5 – Sáng',
      period: 1,
      className: '2A1',
      grade: 2,
      lessonTitle: `${g2Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g2Note2,
      equipment: 'SGK, Tranh ảnh, còi, dụng cụ TL'
    },
    {
      id: `w${week}_19`,
      dayOfWeek: 'Thứ 4 – Sáng',
      period: 1,
      className: '4A1',
      grade: 4,
      lessonTitle: `${g4Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: g4Note1,
      equipment: 'SGK, Vòng thể dục, tranh ảnh, dụng cụ TL'
    },
    {
      id: `w${week}_20`,
      dayOfWeek: 'Thứ 4 – Chiều',
      period: 1,
      className: '4A1',
      grade: 4,
      lessonTitle: `${g4Info.defaultTitle} (tiết 2)`,
      ppct: p2,
      integrationNotes: g4Note2,
      equipment: 'SGK, Vòng thể dục, tranh ảnh, dụng cụ TL'
    }
  ];
}

/**
 * Universal Parser for Uploaded Weekly Plan Table (Word HTML or Tab-delimited text)
 */
export function parseUploadedWeeklyPlanTable(content: string): {
  week?: number;
  dateRange?: string;
  rows: WeeklyMasterScheduleRow[];
} {
  let detectedWeek = 9;
  let detectedDateRange = '';
  const rows: WeeklyMasterScheduleRow[] = [];

  const weekMatch = content.match(/tuần\s*(\d+)/i);
  if (weekMatch) {
    detectedWeek = parseInt(weekMatch[1], 10);
  }

  const dateMatch = content.match(/\((từ ngày[^\)]+)\)/i);
  if (dateMatch) {
    detectedDateRange = dateMatch[1];
  }

  // Parse HTML Table if Mammoth / Word HTML
  if (content.includes('<table')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const trElements = Array.from(doc.querySelectorAll('tr'));

    let currentDay = 'Thứ 2 – Sáng';

    trElements.forEach((tr, idx) => {
      const tds = Array.from(tr.querySelectorAll('td, th')).map((td) => td.textContent?.trim() || '');
      if (tds.length < 4 || tds[0].toLowerCase().includes('thứ') && tds[1].toLowerCase().includes('tiết')) {
        return; // Skip header
      }

      // Check if first cell has Day
      let offset = 0;
      if (tds[0].toLowerCase().includes('thứ')) {
        currentDay = tds[0];
        offset = 1;
      }

      const period = parseInt(tds[offset] || '1', 10) || 1;
      const className = tds[offset + 1] || '1A1';
      const lessonTitle = tds[offset + 2] || '';
      const ppct = parseInt(tds[offset + 3] || '17', 10) || 17;
      const integrationNotes = tds[offset + 4] || '';
      const equipment = tds[offset + 5] || 'SGK, Tranh ảnh, dụng cụ TL';

      let grade: GradeLevel = 1;
      if (className.startsWith('2')) grade = 2;
      else if (className.startsWith('3')) grade = 3;
      else if (className.startsWith('4')) grade = 4;
      else if (className.startsWith('5')) grade = 5;

      rows.push({
        id: `uploaded_${Date.now()}_${idx}`,
        dayOfWeek: currentDay,
        period,
        className,
        grade,
        lessonTitle,
        ppct,
        integrationNotes,
        equipment
      });
    });
  }

  // Fallback: If no HTML table rows parsed, split lines
  if (rows.length === 0) {
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    let currentDay = 'Thứ 2 – Sáng';

    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes('thứ')) {
        currentDay = line.trim();
        return;
      }
      const parts = line.split('\t').map((p) => p.trim());
      if (parts.length >= 4) {
        const period = parseInt(parts[0], 10) || 1;
        const className = parts[1] || '1A1';
        const lessonTitle = parts[2] || '';
        const ppct = parseInt(parts[3], 10) || 17;
        const integrationNotes = parts[4] || '';
        const equipment = parts[5] || 'SGK, Tranh ảnh, dụng cụ TL';

        let grade: GradeLevel = 1;
        if (className.startsWith('2')) grade = 2;
        else if (className.startsWith('3')) grade = 3;
        else if (className.startsWith('4')) grade = 4;
        else if (className.startsWith('5')) grade = 5;

        rows.push({
          id: `line_${idx}`,
          dayOfWeek: currentDay,
          period,
          className,
          grade,
          lessonTitle,
          ppct,
          integrationNotes,
          equipment
        });
      }
    });
  }

  return {
    week: detectedWeek,
    dateRange: detectedDateRange,
    rows: rows.length > 0 ? rows : defaultWeek9Schedule
  };
}
