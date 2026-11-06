/**
 * Academic Calendar and Curriculum Distribution (PPCT) utilities for Primary Physical Education (GDTC)
 * Covers Grades 1, 3, 5 across 35 academic weeks.
 * Supports official 7-column timetable: Thứ | Tiết | Lớp | Bài học | PPCT | ND Tích hợp/điều chỉnh | ĐDDH
 */

import { WeeklyMasterScheduleRow } from '../types/gdtc';

export interface WeekDateInfo {
  week: number;
  startDateStr: string;   // DD/MM/YYYY
  endDateStr: string;     // DD/MM/YYYY
  dateRangeText: string;  // "Từ ngày DD/MM/YYYY đến ngày DD/MM/YYYY"
  approvalDateText: string; // "Vệ Giang, ngày DD tháng MM năm YYYY"
}

export interface WeeklyGradePpctInfo {
  grade: 1 | 3 | 5;
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

import { defaultGrade1Ppct, defaultGrade3Ppct, defaultGrade5Ppct } from '../data/defaultPpctData';

/**
 * Calculates curriculum distribution (PPCT) periods for a given grade and week.
 * Dynamically queries official PPCT data across all 35 weeks for Grades 1, 3, and 5.
 */
export function getGradePpctInfo(grade: 1 | 3 | 5, week: number): WeeklyGradePpctInfo {
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const p3 = (week - 1) * 2 + 3;
  const periods = grade === 5 ? [p1, p2, p3] : [p1, p2];

  const ppctList = grade === 1 ? defaultGrade1Ppct : grade === 3 ? defaultGrade3Ppct : defaultGrade5Ppct;
  const matched = ppctList.filter((item) => item.week === week);
  const first = matched[0];

  const defaultTopic = first ? first.topic : (grade === 1 ? 'CHỦ ĐỀ 2: BÀI THỂ DỤC' : 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC');
  let rawTitle = first ? first.lessonTitle : '';
  if (!rawTitle) {
    rawTitle = week === 9
      ? (grade === 1 ? 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng' : grade === 3 ? 'Bài 1: Động tác vươn thở, động tác tay, động tác chân' : 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy')
      : `Bài học thể dục Tuần ${week}`;
  }
  // Strip trailing (tiết 1), (tiết 2) and clean title
  const defaultTitle = rawTitle.replace(/\s*\(\s*tiết\s*\d+[^)]*\)/gi, '').replace(/\.+$/, '').trim();

  return {
    grade,
    week,
    periods,
    periodLabel: grade === 5 ? `Tiết ${p1}, ${p2}, ${p3}` : `Tiết ${p1}, ${p2}`,
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

export function getWeeklyIntegrationThemes(week: number): WeeklyIntegrationThemes {
  const themesMap: Record<number, Partial<WeeklyIntegrationThemes>> = {
    8: {
      qpanTheme: 'Rèn luyện tính kỷ luật, tư thế đứng nghiêm thẳng hàng, tác phong nhanh nhẹn của người lính.',
      envTheme: 'Bảo vệ môi trường học đường: nhặt sạch lá cây, rác bẩn trên sân tập trước và sau giờ học.',
      trafficTheme: 'Ý thức đi đúng phần đường, giữ khoảng cách an toàn khi di chuyển tập thể.',
      lifeSkillsTheme: 'Kỹ năng lắng nghe hiệu lệnh, hỗ trợ giúp đỡ bạn trong hàng, xử lý khi mệt mỏi.',
      digitalTheme: 'Mã 3.1TC1a: Nhận biết tư thế chính xác qua tranh ảnh động tác số hóa và video minh họa.',
      inclusionTheme: 'Khích lệ học sinh hòa nhập tập các động tác tay nhẹ nhàng, được bạn trong tổ hỗ trợ.',
      gvScriptAddon: 'Lồng ghép giáo dục QPAN và bảo vệ môi trường: Nhắc nhở HS đứng đúng cự ly hàng dọc, giữ gìn vệ sinh sân bãi sạch sẽ; quan sát hỗ trợ HS hòa nhập.',
      hsScriptAddon: 'HS chú ý lắng nghe hiệu lệnh, chỉnh trang ngay ngắn, tự giác thu dọn dụng cụ/marker và nhặt rác sân tập sau buổi học.'
    },
    9: {
      qpanTheme: 'Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống; giữ đội hình và tinh thần đoàn kết.',
      envTheme: 'Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.',
      trafficTheme: 'Quan sát chướng ngại vật phía trước khi di chuyển, không xô đẩy bạn.',
      lifeSkillsTheme: 'Kỹ năng trao đổi cảm nhận sau giờ học, tự tin biểu đạt cảm xúc và hỗ trợ đồng đội.',
      digitalTheme: 'Mã 4.1TC1a / 6.1TC2a: HS sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người; nhận thức sự hỗ trợ của trí tuệ nhân tạo (AI) phân tích tư thế đúng/sai.',
      inclusionTheme: 'Học sinh hòa nhập tham gia theo khả năng, được bạn và giáo viên khích lệ.',
      gvScriptAddon: 'GV lồng ghép tích hợp năng lực số (4.1TC1a / 6.1TC2a), giáo dục QPAN và bảo vệ môi trường: Kiểm tra vệ sinh sân tập, hướng dẫn sử dụng và thu dọn dụng cụ đúng nơi quy định.',
      hsScriptAddon: 'HS chấp hành khẩu lệnh nghiêm túc, tự giác kiểm tra vệ sinh sân tập, nhặt vật nguy hiểm và thu dọn dụng cụ gọn gàng sau giờ học.'
    }
  };

  const current = themesMap[week] || {
    qpanTheme: `Tuần ${week}: Rèn luyện tác phong nhanh nhẹn, giữ vững cự ly cự chuẩn và tinh thần kỷ luật QPAN.`,
    envTheme: `Tuần ${week}: Giữ gìn sân tập xanh - sạch - đẹp, không xả rác bừa bãi, bảo quản dụng cụ.`,
    trafficTheme: `Tuần ${week}: Chấp hành quy tắc giao thông khi đi học, đội mũ bảo hiểm đạt chuẩn.`,
    lifeSkillsTheme: `Tuần ${week}: Tự giác luyện tập hàng ngày để nâng cao thể lực và sức đề kháng.`,
    digitalTheme: 'Mã 4.1TC1a / 6.1TC2a: Ứng dụng học liệu số và AI quan sát phân tích tư thế vận động.',
    inclusionTheme: 'Tạo môi trường thân thiện, khích lệ học sinh hòa nhập tham gia theo khả năng.',
    gvScriptAddon: `Giáo viên tích hợp giáo dục phẩm chất trách nhiệm (Tuần ${week}), nhắc nhở an toàn tập luyện và vệ sinh môi trường.`,
    hsScriptAddon: 'Học sinh tích cực phối hợp cùng tổ, tự giác bảo quản đồ dùng thể thao và thực hiện đúng nền nếp.'
  };

  return {
    week,
    qpanTheme: current.qpanTheme!,
    envTheme: current.envTheme!,
    trafficTheme: current.trafficTheme!,
    lifeSkillsTheme: current.lifeSkillsTheme!,
    digitalTheme: current.digitalTheme!,
    inclusionTheme: current.inclusionTheme!,
    gvScriptAddon: current.gvScriptAddon!,
    hsScriptAddon: current.hsScriptAddon!
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
  }
];

/**
 * Returns default schedule for any week (auto-generates based on week and PPCT rules if not week 9)
 */
export function getDefaultWeeklySchedule(week: number): WeeklyMasterScheduleRow[] {
  if (week === 9) {
    return defaultWeek9Schedule;
  }

  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const g1Info = getGradePpctInfo(1, week);
  const g3Info = getGradePpctInfo(3, week);
  const g5Info = getGradePpctInfo(5, week);
  const themes = getWeeklyIntegrationThemes(week);

  return [
    {
      id: `w${week}_1`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 2,
      className: '1A4',
      grade: 1,
      lessonTitle: `${g1Info.defaultTitle} (tiết 1)`,
      ppct: p1,
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.envTheme}`,
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
      integrationNotes: `- ${themes.digitalTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
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
      integrationNotes: `- ${themes.envTheme}`,
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
      integrationNotes: `- ${themes.envTheme}`,
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
      integrationNotes: `- ${themes.qpanTheme}`,
      equipment: 'SGK, Tranh ảnh, dụng cụ TL'
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

      let grade: 1 | 3 | 5 = 1;
      if (className.startsWith('3')) grade = 3;
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

        let grade: 1 | 3 | 5 = 1;
        if (className.startsWith('3')) grade = 3;
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
