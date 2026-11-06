import mammoth from 'mammoth';
import { PpctItem, PpctAuditResult, WeeklyMasterScheduleRow } from '../types/gdtc';
import { WeeklyIntegrationThemes } from './academicCalendar';

/**
 * Universal PPCT Parser & Auditor for GDTC Grades 1, 3, 5
 * Allows importing pacing guide from Word (.docx), tables, text, and auditing weekly schedules.
 */

export async function parsePpctFile(file: File, targetGrade?: 1 | 3 | 5): Promise<PpctItem[]> {
  const fileName = file.name.toLowerCase();
  let content = '';

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    content = result.value;
  } else {
    content = await file.text();
  }

  return parsePpctFromHtmlOrText(content, targetGrade);
}

export function parsePpctFromHtmlOrText(content: string, explicitGrade?: 1 | 3 | 5): PpctItem[] {
  const items: PpctItem[] = [];

  // 1. Try parsing HTML table rows if contains <table> or <tr>
  if (content.includes('<tr') || content.includes('<table')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const trs = doc.querySelectorAll('tr');

    let currentTopic = 'BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG';
    let currentGrade: 1 | 3 | 5 = explicitGrade || 1;

    trs.forEach((tr, trIdx) => {
      const text = tr.textContent || '';
      // Check if row indicates a grade
      if (text.match(/khối\s*1|lớp\s*1/i)) currentGrade = 1;
      else if (text.match(/khối\s*3|lớp\s*3/i)) currentGrade = 3;
      else if (text.match(/khối\s*5|lớp\s*5/i)) currentGrade = 5;

      // Check if row is a Topic header
      if (text.match(/chủ đề|chương|phần/i) && !text.match(/tiết/i)) {
        currentTopic = text.trim();
        return;
      }

      const cells = Array.from(tr.querySelectorAll('td, th')).map((c) => c.textContent?.trim() || '');
      if (cells.length >= 3) {
        // Skip table header
        if (cells[0].toLowerCase().includes('tuần') && cells[1].toLowerCase().includes('tiết')) return;

        // Try extracting: Week, Period, Lesson Title, Integration, Equipment
        let week = 1;
        let period = 1;
        let lessonTitle = '';
        let integration = '';
        let equipment = 'SGK, Tranh ảnh, dụng cụ TL';

        // Typical columns: [Tuần, Tiết, Tên bài học, Tích hợp/Ghi chú, ĐDDH]
        const wMatch = cells[0].match(/\d+/);
        if (wMatch) week = parseInt(wMatch[0], 10);

        const pMatch = cells[1].match(/\d+/);
        if (pMatch) period = parseInt(pMatch[0], 10);
        else {
          period = (week - 1) * 2 + 1;
        }

        lessonTitle = cells[2] || '';
        if (cells.length > 3) integration = cells[3] || '';
        if (cells.length > 4) equipment = cells[4] || equipment;

        if (lessonTitle && period >= 1 && period <= 70) {
          items.push({
            id: `ppct_up_k${currentGrade}_p${period}`,
            grade: currentGrade,
            week: week || Math.ceil(period / 2),
            period,
            topic: currentTopic,
            lessonTitle,
            integrationNotes: integration,
            equipment
          });
        }
      }
    });
  }

  // 2. Fallback: Parse tab-delimited or line-based text
  if (items.length === 0) {
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    let currentTopic = 'BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG';
    let currentGrade: 1 | 3 | 5 = explicitGrade || 1;

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.includes('khối 1') || lower.includes('lớp 1')) currentGrade = 1;
      else if (lower.includes('khối 3') || lower.includes('lớp 3')) currentGrade = 3;
      else if (lower.includes('khối 5') || lower.includes('lớp 5')) currentGrade = 5;

      if (lower.startsWith('chủ đề') || lower.startsWith('chương:')) {
        currentTopic = line.trim();
        return;
      }

      // Check tab or comma or semicolon separated
      const parts = line.split(/[\t|]/).map((p) => p.trim());
      if (parts.length >= 3) {
        const weekNum = parseInt(parts[0], 10) || 1;
        const periodNum = parseInt(parts[1], 10) || 1;
        const title = parts[2] || '';
        const integ = parts[3] || '';
        const eq = parts[4] || 'SGK, Tranh ảnh, dụng cụ TL';

        if (title) {
          items.push({
            id: `ppct_txt_k${currentGrade}_p${periodNum}`,
            grade: currentGrade,
            week: weekNum,
            period: periodNum,
            topic: currentTopic,
            lessonTitle: title,
            integrationNotes: integ,
            equipment: eq
          });
        }
      }
    });
  }

  return items;
}

/**
 * Intelligent Audit: Compares the active weekly schedule against the official PPCT
 */
export function auditScheduleAgainstPpct(
  scheduleRows: WeeklyMasterScheduleRow[],
  ppctList: PpctItem[],
  week: number
): PpctAuditResult[] {
  const results: PpctAuditResult[] = [];

  scheduleRows.forEach((row) => {
    // Look for matching PPCT item for this grade and period
    const ppctItem = ppctList.find((p) => p.grade === row.grade && p.period === row.ppct);

    const schedTitleNorm = normalizeTitleForComparison(row.lessonTitle);
    const ppctTitleNorm = ppctItem ? normalizeTitleForComparison(ppctItem.lessonTitle) : '';

    const isMatch = !!ppctItem && (
      schedTitleNorm.includes(ppctTitleNorm) ||
      ppctTitleNorm.includes(schedTitleNorm) ||
      computeStringSimilarity(schedTitleNorm, ppctTitleNorm) > 0.6
    );

    let diffNote = '';
    if (!ppctItem) {
      diffNote = `⚠️ Tiết PPCT ${row.ppct} không tìm thấy trong PPCT Khối ${row.grade}`;
    } else if (!isMatch) {
      diffNote = `⚠️ Tên bài trên TKB khác với PPCT gốc (PPCT: "${ppctItem.lessonTitle.substring(0, 45)}...")`;
    } else {
      diffNote = '✅ Hoàn toàn khớp với Phân phối chương trình';
    }

    results.push({
      grade: row.grade,
      week,
      period: row.ppct,
      scheduledTitle: row.lessonTitle,
      ppctTitle: ppctItem ? ppctItem.lessonTitle : '(Không có trong PPCT)',
      scheduledClassName: row.className,
      dayOfWeek: row.dayOfWeek,
      isMatch,
      differenceNote: diffNote
    });
  });

  return results;
}

/**
 * 1-Click Synchronization: Updates schedule rows to match the official PPCT
 */
export function syncScheduleFromPpct(
  scheduleRows: WeeklyMasterScheduleRow[],
  ppctList: PpctItem[],
  week: number
): WeeklyMasterScheduleRow[] {
  return scheduleRows.map((row) => {
    // Find expected period for this week if not set or mismatched
    const expectedP1 = (week - 1) * 2 + 1;
    const expectedP2 = (week - 1) * 2 + 2;

    // Use row.ppct if valid, or deduce from row index / period
    let targetPpct = row.ppct;
    if (targetPpct < expectedP1 || targetPpct > expectedP2) {
      targetPpct = row.dayOfWeek.toLowerCase().includes('thứ 2') || row.dayOfWeek.toLowerCase().includes('thứ 3')
        ? expectedP1
        : expectedP2;
    }

    const ppctMatch = ppctList.find((p) => p.grade === row.grade && p.period === targetPpct);
    if (!ppctMatch) return row;

    return {
      ...row,
      ppct: targetPpct,
      lessonTitle: ppctMatch.lessonTitle,
      integrationNotes: ppctMatch.integrationNotes || row.integrationNotes,
      equipment: ppctMatch.equipment || row.equipment
    };
  });
}

/**
 * Helper to extract cross-curricular integrations (QPAN, Môi trường, Năng lực số...)
 * from uploaded weekly plan text or table, and generate unified WeeklyIntegrationThemes.
 */
export function extractIntegrationFromPlan(
  textOrHtml: string,
  week: number,
  scheduleRows: WeeklyMasterScheduleRow[]
): Partial<WeeklyIntegrationThemes> {
  const result: Partial<WeeklyIntegrationThemes> = {
    week
  };

  // 1. Gather all integration texts from schedule rows and clean input HTML
  const cleanText = textOrHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const allIntegTexts = scheduleRows.map((r) => r.integrationNotes.replace(/<[^>]+>/g, ' ')).join('\n');
  const combined = `${cleanText}\n${allIntegTexts}`;

  // 2. Extract QPAN (Quốc phòng & An ninh)
  const qpanMatch = combined.match(/(?:quốc\s*phòng\s*và\s*an\s*ninh|qpan)[^:\n]*[:\-]?\s*([^\n\r]+)/i);
  if (qpanMatch) {
    result.qpanTheme = qpanMatch[1].replace(/^[–\-*+]\s*/, '').replace(/<[^>]+>/g, '').trim();
  }

  // 3. Extract Môi trường
  const envMatch = combined.match(/(?:bảo\s*vệ\s*môi\s*trường|môi\s*trường)[^:\n]*[:\-]?\s*([^\n\r]+)/i);
  if (envMatch) {
    result.envTheme = envMatch[1].replace(/^[–\-*+]\s*/, '').replace(/<[^>]+>/g, '').trim();
  }

  // 4. Extract Năng lực số (3.1TC1a, 4.1TC1a, 6.1TC2a)
  const digitalMatch = combined.match(/(?:năng\s*lực\s*số|[346]\.1TC\w+)[^:\n]*[:\-]?\s*([^\n\r]+)/i);
  if (digitalMatch) {
    result.digitalTheme = digitalMatch[0].replace(/^[–\-*+]\s*/, '').replace(/<[^>]+>/g, '').trim();
  }

  // 5. Extract Kỹ năng sống / An toàn
  const skillMatch = combined.match(/(?:kỹ\s*năng\s*sống|an\s*toàn|đạo\s*đức)[^:\n]*[:\-]?\s*([^\n\r]+)/i);
  if (skillMatch) {
    result.lifeSkillsTheme = skillMatch[1].replace(/^[–\-*+]\s*/, '').replace(/<[^>]+>/g, '').trim();
  }

  return result;
}

// Internal text normalization and similarity helpers
function normalizeTitleForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[–—\-:;,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/tiết\s*\d+/g, '')
    .trim();
}

function computeStringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });
  const total = Math.max(words1.size, words2.size);
  return total > 0 ? intersection / total : 0;
}
