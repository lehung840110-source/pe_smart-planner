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
  period1Title?: string;
  period2Title?: string;
  period1Topic?: string;
  period2Topic?: string;
  period1Integration?: string;
  period2Integration?: string;
  period1Equipment?: string;
  period2Equipment?: string;
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
  DEFAULT_GENERAL_PERIOD_INTEGRATION,
  getPpctWeekItems
} from '../data/defaultPpctData';

/**
 * Calculates curriculum distribution (PPCT) periods for a given grade and week.
 * Dynamically queries the stored/official PPCT data (including the 2026–2027 integrated plan for Grades 1, 3, 5)
 * across all 35 weeks for Grades 1, 2, 3, 4, and 5.
 */
export function getGradePpctInfo(grade: GradeLevel, week: number): WeeklyGradePpctInfo {
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const periods = [p1, p2];

  const matched = getPpctWeekItems(grade, week);
  const first = matched.find((m) => m.period === p1) || matched[0];
  const second = matched.find((m) => m.period === p2) || matched[1] || first;

  const fallbackTopic = grade === 1 ? 'CHỦ ĐỀ 2: BÀI THỂ DỤC' : 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
  const defaultTopic = first?.topic || fallbackTopic;
  const rawTitle1 = first?.lessonTitle || `Bài học giáo dục thể chất Tuần ${week} (Tiết 1)`;
  const rawTitle2 = second?.lessonTitle || `Bài học giáo dục thể chất Tuần ${week} (Tiết 2)`;

  // Strip trailing (tiết 1), (tiết 2) for compact summary display while preserving exact per-period titles
  const defaultTitle = rawTitle1.replace(/\s*\(\s*tiết\s*\d+[^)]*\)/gi, '').replace(/\.+$/, '').trim();

  return {
    grade,
    week,
    periods,
    periodLabel: `Tiết ${p1}, ${p2}`,
    defaultTopic,
    defaultTitle,
    period1Title: rawTitle1,
    period2Title: rawTitle2,
    period1Topic: first?.topic || defaultTopic,
    period2Topic: second?.topic || defaultTopic,
    period1Integration: first?.integrationNotes || '',
    period2Integration: second?.integrationNotes || '',
    period1Equipment: first?.equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL',
    period2Equipment: second?.equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL'
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
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const addr = getIntegrationAddressForLesson(safeGrade, week, p1);
  const allGradeAddrs = [1, 3, 5, 2, 4].flatMap((g) => [
    getIntegrationAddressForLesson(g, week, p1),
    getIntegrationAddressForLesson(g, week, p2)
  ]);

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

function formatPpctIntegrationCell(
  grade: GradeLevel,
  week: number,
  period: number,
  lessonTitle: string,
  ppctNote?: string
): string {
  const cleaned = (ppctNote || '').trim();
  if (cleaned) {
    return cleaned.startsWith('-') ? cleaned : `- ${cleaned}`;
  }
  if (grade === 1 || grade === 3 || grade === 5) {
    return `- ${DEFAULT_GENERAL_PERIOD_INTEGRATION}`;
  }
  return formatIntegrationForScheduleCell(grade, week, period, lessonTitle);
}

/**
 * Returns the exact 7-column weekly schedule for any week (1–35),
 * pulling verbatim per-period titles, integration notes, and equipment from the
 * official integrated curriculum plan (Grades 1, 3, 5) and GDPT 2018 (Grades 2, 4).
 */
export function getDefaultWeeklySchedule(week: number): WeeklyMasterScheduleRow[] {
  const p1 = (week - 1) * 2 + 1;
  const p2 = (week - 1) * 2 + 2;
  const g1Info = getGradePpctInfo(1, week);
  const g2Info = getGradePpctInfo(2, week);
  const g3Info = getGradePpctInfo(3, week);
  const g4Info = getGradePpctInfo(4, week);
  const g5Info = getGradePpctInfo(5, week);

  const g1Title1 = g1Info.period1Title || `${g1Info.defaultTitle} (tiết 1)`;
  const g1Title2 = g1Info.period2Title || `${g1Info.defaultTitle} (tiết 2)`;
  const g2Title1 = g2Info.period1Title || `${g2Info.defaultTitle} (tiết 1)`;
  const g2Title2 = g2Info.period2Title || `${g2Info.defaultTitle} (tiết 2)`;
  const g3Title1 = g3Info.period1Title || `${g3Info.defaultTitle} (tiết 1)`;
  const g3Title2 = g3Info.period2Title || `${g3Info.defaultTitle} (tiết 2)`;
  const g4Title1 = g4Info.period1Title || `${g4Info.defaultTitle} (tiết 1)`;
  const g4Title2 = g4Info.period2Title || `${g4Info.defaultTitle} (tiết 2)`;
  const g5Title1 = g5Info.period1Title || `${g5Info.defaultTitle} (tiết 1)`;
  const g5Title2 = g5Info.period2Title || `${g5Info.defaultTitle} (tiết 2)`;

  const g1Note1 = formatPpctIntegrationCell(1, week, p1, g1Title1, g1Info.period1Integration);
  const g1Note2 = formatPpctIntegrationCell(1, week, p2, g1Title2, g1Info.period2Integration);
  const g2Note1 = formatPpctIntegrationCell(2, week, p1, g2Title1, g2Info.period1Integration);
  const g2Note2 = formatPpctIntegrationCell(2, week, p2, g2Title2, g2Info.period2Integration);
  const g3Note1 = formatPpctIntegrationCell(3, week, p1, g3Title1, g3Info.period1Integration);
  const g3Note2 = formatPpctIntegrationCell(3, week, p2, g3Title2, g3Info.period2Integration);
  const g4Note1 = formatPpctIntegrationCell(4, week, p1, g4Title1, g4Info.period1Integration);
  const g4Note2 = formatPpctIntegrationCell(4, week, p2, g4Title2, g4Info.period2Integration);
  const g5Note1 = formatPpctIntegrationCell(5, week, p1, g5Title1, g5Info.period1Integration);
  const g5Note2 = formatPpctIntegrationCell(5, week, p2, g5Title2, g5Info.period2Integration);

  const g1Eq1 = g1Info.period1Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g1Eq2 = g1Info.period2Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g2Eq1 = g2Info.period1Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g2Eq2 = g2Info.period2Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g3Eq1 = g3Info.period1Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g3Eq2 = g3Info.period2Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g4Eq1 = g4Info.period1Equipment || 'SGK, Vòng thể dục, tranh ảnh, dụng cụ TL';
  const g4Eq2 = g4Info.period2Equipment || 'SGK, Vòng thể dục, tranh ảnh, dụng cụ TL';
  const g5Eq1 = g5Info.period1Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';
  const g5Eq2 = g5Info.period2Equipment || 'SGK, Tranh ảnh, còi, dụng cụ TL';

  return [
    {
      id: `w${week}_1`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 2,
      className: '1A4',
      grade: 1,
      lessonTitle: g1Title1,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: g1Eq1
    },
    {
      id: `w${week}_2`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 3,
      className: '1A5',
      grade: 1,
      lessonTitle: g1Title1,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: g1Eq1
    },
    {
      id: `w${week}_3`,
      dayOfWeek: 'Thứ 2 – Sáng',
      period: 4,
      className: '1A3',
      grade: 1,
      lessonTitle: g1Title1,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: g1Eq1
    },
    {
      id: `w${week}_4`,
      dayOfWeek: 'Thứ 2 – Chiều',
      period: 2,
      className: '1A1',
      grade: 1,
      lessonTitle: g1Title1,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: g1Eq1
    },
    {
      id: `w${week}_5`,
      dayOfWeek: 'Thứ 2 – Chiều',
      period: 3,
      className: '1A2',
      grade: 1,
      lessonTitle: g1Title1,
      ppct: p1,
      integrationNotes: g1Note1,
      equipment: g1Eq1
    },
    {
      id: `w${week}_6`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 1,
      className: '5A1',
      grade: 5,
      lessonTitle: g5Title1,
      ppct: p1,
      integrationNotes: g5Note1,
      equipment: g5Eq1
    },
    {
      id: `w${week}_7`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 2,
      className: '3A1',
      grade: 3,
      lessonTitle: g3Title1,
      ppct: p1,
      integrationNotes: g3Note1,
      equipment: g3Eq1
    },
    {
      id: `w${week}_8`,
      dayOfWeek: 'Thứ 3 – Chiều',
      period: 3,
      className: '5A2',
      grade: 5,
      lessonTitle: g5Title1,
      ppct: p1,
      integrationNotes: g5Note1,
      equipment: g5Eq1
    },
    {
      id: `w${week}_9`,
      dayOfWeek: 'Thứ 5 – Sáng',
      period: 2,
      className: '1A1',
      grade: 1,
      lessonTitle: g1Title2,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: g1Eq2
    },
    {
      id: `w${week}_10`,
      dayOfWeek: 'Thứ 5 – Chiều',
      period: 2,
      className: '3A1',
      grade: 3,
      lessonTitle: g3Title2,
      ppct: p2,
      integrationNotes: g3Note2,
      equipment: g3Eq2
    },
    {
      id: `w${week}_11`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 2,
      className: '1A4',
      grade: 1,
      lessonTitle: g1Title2,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: g1Eq2
    },
    {
      id: `w${week}_12`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 3,
      className: '1A5',
      grade: 1,
      lessonTitle: g1Title2,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: g1Eq2
    },
    {
      id: `w${week}_13`,
      dayOfWeek: 'Thứ 6 – Sáng',
      period: 4,
      className: '1A3',
      grade: 1,
      lessonTitle: g1Title2,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: g1Eq2
    },
    {
      id: `w${week}_14`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 1,
      className: '5A1',
      grade: 5,
      lessonTitle: g5Title2,
      ppct: p2,
      integrationNotes: g5Note2,
      equipment: g5Eq2
    },
    {
      id: `w${week}_15`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 2,
      className: '5A2',
      grade: 5,
      lessonTitle: g5Title2,
      ppct: p2,
      integrationNotes: g5Note2,
      equipment: g5Eq2
    },
    {
      id: `w${week}_16`,
      dayOfWeek: 'Thứ 6 – Chiều',
      period: 3,
      className: '1A2',
      grade: 1,
      lessonTitle: g1Title2,
      ppct: p2,
      integrationNotes: g1Note2,
      equipment: g1Eq2
    },
    {
      id: `w${week}_17`,
      dayOfWeek: 'Thứ 3 – Sáng',
      period: 1,
      className: '2A1',
      grade: 2,
      lessonTitle: g2Title1,
      ppct: p1,
      integrationNotes: g2Note1,
      equipment: g2Eq1
    },
    {
      id: `w${week}_18`,
      dayOfWeek: 'Thứ 5 – Sáng',
      period: 1,
      className: '2A1',
      grade: 2,
      lessonTitle: g2Title2,
      ppct: p2,
      integrationNotes: g2Note2,
      equipment: g2Eq2
    },
    {
      id: `w${week}_19`,
      dayOfWeek: 'Thứ 4 – Sáng',
      period: 1,
      className: '4A1',
      grade: 4,
      lessonTitle: g4Title1,
      ppct: p1,
      integrationNotes: g4Note1,
      equipment: g4Eq1
    },
    {
      id: `w${week}_20`,
      dayOfWeek: 'Thứ 4 – Chiều',
      period: 1,
      className: '4A1',
      grade: 4,
      lessonTitle: g4Title2,
      ppct: p2,
      integrationNotes: g4Note2,
      equipment: g4Eq2
    }
  ];
}

/**
 * Default Week 9 schedule derived directly from the official integrated curriculum plan.
 */
export const defaultWeek9Schedule: WeeklyMasterScheduleRow[] = getDefaultWeeklySchedule(9);

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
