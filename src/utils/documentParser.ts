import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { LessonRow, UserCustomTemplate, DiagramAttachment } from '../types/gdtc';
import { MasterPlanItem, normalizeMasterPlan } from '../data/masterTemplateTuan8';

export interface ParsedLessonFileResult {
  name?: string;
  sourceFileName?: string;
  fileType?: UserCustomTemplate['fileType'];
  title?: string;
  topic?: string;
  week?: number;
  grade?: number;
  lessonNum?: number;
  dateRange?: string;
  rows: LessonRow[];
  schoolName?: string;
  departmentName?: string;
  teacherName?: string;
  approverPrincipal?: string;
  approverHead?: string;
  specialCompetencies?: UserCustomTemplate['specialCompetencies'];
  generalCompetencies?: UserCustomTemplate['generalCompetencies'];
  qualities?: UserCustomTemplate['qualities'];
  integrations?: UserCustomTemplate['integrations'];
  locationEquipment?: UserCustomTemplate['locationEquipment'];
  postLessonAdjustment?: string;
  signatures?: UserCustomTemplate['signatures'];
  detectedSections?: string[];
  analysisNotes?: string[];
  rawTextExcerpt?: string;
}

export interface MultiTaskAnalysisProgress {
  step: number;
  totalSteps: number;
  label: string;
  percent: number;
}

const DEFAULT_SPECIAL: UserCustomTemplate['specialCompetencies'] = {
  healthCare: 'Biết vệ sinh cá nhân, chuẩn bị trang phục thể thao, sân tập an toàn trước, trong và sau khi tập luyện.',
  basicMovement: 'Thực hiện được kỹ thuật động tác cơ bản theo hướng dẫn và khẩu lệnh của giáo viên.',
  sportsCompetency: 'Biết quan sát tranh ảnh SGK, động tác mẫu và tự điều chỉnh tư thế trong luyện tập.',
  disabledStudents: 'Giảm nhẹ yêu cầu kỹ thuật và cường độ; linh hoạt cho HS hòa nhập tham gia phù hợp thể trạng.'
};

const DEFAULT_GENERAL: UserCustomTemplate['generalCompetencies'] = {
  autonomy: 'Chủ động chuẩn bị dụng cụ, lắng nghe hướng dẫn và tự giác luyện tập.',
  collaboration: 'Biết phối hợp cùng bạn, tổ/nhóm và chấp hành phân công khi tham gia trò chơi.',
  problemSolving: 'Nhận biết và sửa lỗi sai đơn giản trong quá trình tập luyện.',
  disabledStudents: 'Hỗ trợ bạn hòa nhập, khuyến khích tinh thần tự tin tham gia tập thể.'
};

const DEFAULT_QUALITIES: UserCustomTemplate['qualities'] = {
  diligence: 'Chăm chỉ, tích cực hoàn thành các nội dung rèn luyện thể lực.',
  honesty: 'Trung thực trong trò chơi, thi đua và nhận xét kết quả.',
  responsibility: 'Có ý thức giữ gìn an toàn cho bản thân, bạn bè và vệ sinh sân tập.',
  disabledStudents: 'Động viên tinh thần đoàn kết, yêu thương và hỗ trợ bạn khuyết tật.'
};

const DEFAULT_INTEGRATIONS: UserCustomTemplate['integrations'] = {
  digitalSkill: '4.1TC1a',
  digitalDescription: 'Sử dụng thiết bị số an toàn khi quan sát tranh ảnh và video động tác mẫu.',
  lifeSkills: 'Rèn kỹ năng làm việc nhóm, kỷ luật và ứng xử văn minh.',
  environmentalEducation: 'Thu gom rác, giữ gìn sân bãi xanh - sạch - đẹp sau buổi học.'
};

const DEFAULT_LOCATION_EQUIPMENT: UserCustomTemplate['locationEquipment'] = {
  location: 'Sân trường sạch sẽ, thoáng mát, đảm bảo an toàn tập luyện.',
  teacherTools: 'Còi, tranh ảnh minh họa, giáo án, đồng hồ bấm giây, cọc tiêu.',
  studentTools: 'Trang phục gọn gàng, đi giày thể thao hoặc dép quai hậu.'
};

/**
 * Universal document parser for lesson plans:
 * Supports Word (.docx, .doc), HTML, JSON, PDF (spatial layout), and plain text.
 */
export async function parseLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.json')) {
    return parseJsonLessonFile(file);
  } else if (fileName.endsWith('.docx')) {
    return parseDocxLessonFile(file);
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return parseHtmlOrDocLessonFile(file);
  } else if (fileName.endsWith('.pdf')) {
    return parsePdfLessonFile(file);
  } else {
    const text = await file.text();
    return parseTextLessonPlanMultiTask(text, file.name, 'text');
  }
}

async function parseJsonLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (Array.isArray(data)) {
    return {
      sourceFileName: file.name,
      fileType: 'json',
      name: file.name.replace(/\.[^/.]+$/, ''),
      title: file.name.replace(/\.[^/.]+$/, ''),
      rows: data,
      detectedSections: ['III. Tiến trình dạy học (JSON)'],
      analysisNotes: [`Bóc tách ${data.length} dòng hoạt động từ tệp JSON.`]
    };
  }

  return {
    sourceFileName: file.name,
    fileType: 'json',
    name: data.name || data.title || file.name.replace(/\.[^/.]+$/, ''),
    title: data.title || file.name.replace(/\.[^/.]+$/, ''),
    topic: data.topic,
    week: data.week,
    grade: data.grade,
    lessonNum: data.lessonNum,
    dateRange: data.dateRange,
    rows: data.rows || [],
    teacherName: data.teacherName || data.signatures?.teacher,
    schoolName: data.schoolName,
    departmentName: data.departmentName,
    approverPrincipal: data.approverPrincipal || data.signatures?.bgh,
    approverHead: data.approverHead || data.signatures?.headTeacher,
    specialCompetencies: data.specialCompetencies,
    generalCompetencies: data.generalCompetencies,
    qualities: data.qualities,
    integrations: data.integrations,
    locationEquipment: data.locationEquipment,
    postLessonAdjustment: data.postLessonAdjustment,
    signatures: data.signatures,
    detectedSections: ['Metadata', 'I. Yêu cầu cần đạt', 'II. Địa điểm - Thiết bị', 'III. Bảng 4 cột', 'IV. Điều chỉnh'],
    analysisNotes: [`Nạp đầy đủ cấu trúc giáo án JSON (${(data.rows || []).length} hoạt động).`]
  };
}

async function parseDocxLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return extractFullLessonTemplateFromHtml(result.value, file.name, 'docx');
}

async function parseHtmlOrDocLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const text = await file.text();
  const ext: UserCustomTemplate['fileType'] = file.name.toLowerCase().endsWith('.doc') ? 'doc' : 'html';
  if (/<table|<html|<body|<p|<div/i.test(text)) {
    return extractFullLessonTemplateFromHtml(text, file.name, ext);
  }
  return parseTextLessonPlanMultiTask(text, file.name, ext);
}

function cleanLine(s: string): string {
  return (s || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function extractLabeledField(text: string, regex: RegExp): string {
  const m = text.match(regex);
  return m && m[1] ? cleanLine(m[1]) : '';
}

function sliceSection(text: string, startRegex: RegExp, endRegex?: RegExp): string {
  const startMatch = text.match(startRegex);
  if (!startMatch || startMatch.index === undefined) return '';
  const afterStart = text.slice(startMatch.index + startMatch[0].length);
  if (!endRegex) return afterStart.trim();
  const endMatch = afterStart.match(endRegex);
  if (!endMatch || endMatch.index === undefined) return afterStart.trim();
  return afterStart.slice(0, endMatch.index).trim();
}

function extractSectionsFromText(rawText: string) {
  const normalizedText = rawText.replace(/\r\n/g, '\n');

  const weekMatch = normalizedText.match(/tuần\s*(?:học)?\s*[:\-]?\s*(\d+)/i);
  const gradeMatch = normalizedText.match(/(?:khối|lớp)\s*[:\-]?\s*(\d+)/i);
  const lessonMatch = normalizedText.match(/tiết\s*(?:ppct|theo\s*ppct)?\s*[:\-]?\s*(\d+)/i);
  const dateRangeMatch = normalizedText.match(/(?:từ\s*ngày[^\n\r]+|thời\s*gian\s*thực\s*hiện\s*[:\-]?\s*[^\n\r]+)/i);

  const topicLine = extractLabeledField(
    normalizedText,
    /(?:chủ\s*đề(?:\s*\d+)?)\s*[:\-–]?\s*([^\n\r]+)/i
  );
  const fullTopicMatch = normalizedText.match(/(chủ\s*đề[^\n\r]*)/i);
  const topic = fullTopicMatch ? cleanLine(fullTopicMatch[1]) : topicLine || 'CHỦ ĐỀ BÀI HỌC';

  const titleMatch = normalizedText.match(/(?:tên\s*bài(?:\s*học)?|bài\s*\d+)\s*[:\-–]?\s*([^\n\r]+)/i);
  const title = titleMatch ? cleanLine(titleMatch[0].replace(/^tên\s*bài(?:\s*học)?\s*[:\-–]?\s*/i, '')) : '';

  const schoolMatch = normalizedText.match(/(trường\s*(?:tiểu\s*học|thcs|th\s*&\s*thcs)[^\n\r]+)/i);
  const deptMatch = normalizedText.match(/(tổ\s*(?:chuyên\s*môn)?[^\n\r]+)/i);
  const teacherMatch = normalizedText.match(/(?:giáo\s*viên(?:\s*soạn(?:\s*bài)?)?|người\s*soạn)\s*[:\-]?\s*([^\n\r]+)/i);
  const bghMatch = normalizedText.match(/(?:bgh\s*duyệt|ban\s*giám\s*hiệu|hiệu\s*trưởng)\s*[:\-]?\s*([^\n\r]+)/i);
  const headMatch = normalizedText.match(/(?:tổ\s*trưởng(?:\s*chuyên\s*môn)?)\s*[:\-]?\s*([^\n\r]+)/i);
  const locationDateMatch = normalizedText.match(/([^\n\r,]+,\s*ngày\s*\d+\s*tháng\s*\d+\s*năm\s*\d{4})/i);

  // Section I: Yêu cầu cần đạt
  const sec1 = sliceSection(
    normalizedText,
    /(?:^|\n)\s*I\.\s*YÊU\s*CẦU\s*CẦN\s*ĐẠT/i,
    /(?:\n\s*II\.\s*(?:ĐỒ\s*DÙNG|ĐỊA\s*ĐIỂM|THIẾT\s*BỊ|CHUẨN\s*BỊ))/i
  );

  // Section II: Địa điểm - Thiết bị
  const sec2 = sliceSection(
    normalizedText,
    /(?:^|\n)\s*II\.\s*(?:ĐỒ\s*DÙNG|ĐỊA\s*ĐIỂM|THIẾT\s*BỊ|CHUẨN\s*BỊ)[^\n]*/i,
    /(?:\n\s*III\.\s*(?:CÁC\s*HOẠT\s*ĐỘNG|TIẾN\s*TRÌNH))/i
  );

  // Section IV: Điều chỉnh sau bài dạy
  const sec4 = sliceSection(
    normalizedText,
    /(?:^|\n)\s*IV\.\s*ĐIỀU\s*CHỈNH\s*SAU\s*BÀI\s*DẠY/i,
    /(?:\n\s*(?:BGH|TỔ\s*TRƯỞNG|GIÁO\s*VIÊN|Vệ\s*Giang|Ngày\s*\d+))/i
  );

  const healthCare = extractLabeledField(sec1, /chăm\s*sóc\s*sức\s*khỏe\s*[:\-]?\s*([^\n]+)/i);
  const basicMovement = extractLabeledField(sec1, /(?:vận\s*động\s*cơ\s*bản|kiến\s*thức[, ]*kỹ\s*năng)\s*[:\-]?\s*([^\n]+)/i);
  const sportsCompetency = extractLabeledField(sec1, /(?:thể\s*dục\s*thể\s*thao|hoạt\s*động\s*tdtt)\s*[:\-]?\s*([^\n]+)/i);
  const disabledSpecial = extractLabeledField(sec1, /năng\s*lực\s*đặc\s*thù[\s\S]{0,400}?học\s*sinh\s*khuyết\s*tật\s*[:\-]?\s*([^\n]+)/i);

  const autonomy = extractLabeledField(sec1, /tự\s*chủ\s*(?:và|&)\s*tự\s*học\s*[:\-]?\s*([^\n]+)/i);
  const collaboration = extractLabeledField(sec1, /giao\s*tiếp\s*(?:và|&)\s*hợp\s*tác\s*[:\-]?\s*([^\n]+)/i);
  const problemSolving = extractLabeledField(sec1, /giải\s*quyết\s*vấn\s*đề[^\n:]*[:\-]?\s*([^\n]+)/i);
  const disabledGeneral = extractLabeledField(sec1, /năng\s*lực\s*chung[\s\S]{0,400}?học\s*sinh\s*khuyết\s*tật\s*[:\-]?\s*([^\n]+)/i);

  const diligence = extractLabeledField(sec1, /chăm\s*chỉ\s*[:\-]?\s*([^\n]+)/i);
  const honesty = extractLabeledField(sec1, /trung\s*thực\s*[:\-]?\s*([^\n]+)/i);
  const responsibility = extractLabeledField(sec1, /trách\s*nhiệm[^\n:]*[:\-]?\s*([^\n]+)/i);
  const disabledQualities = extractLabeledField(sec1, /phẩm\s*chất[\s\S]{0,400}?học\s*sinh\s*khuyết\s*tật\s*[:\-]?\s*([^\n]+)/i);

  const nlsCodeMatch = sec1.match(/(?:mã\s*)?([1-6]\.1TC\w+(?:\s*\/\s*[1-6]\.1TC\w+)?)/i);
  const digitalDescription = extractLabeledField(sec1, /năng\s*lực\s*số[^\n:]*[:\-]?\s*([^\n]+)/i);
  const lifeSkills = extractLabeledField(sec1, /(?:kỹ\s*năng\s*sống|qpan)[^\n:]*[:\-]?\s*([^\n]+)/i);
  const environmentalEducation = extractLabeledField(sec1, /môi\s*trường[^\n:]*[:\-]?\s*([^\n]+)/i);

  const location = extractLabeledField(sec2, /địa\s*điểm\s*[:\-]?\s*([^\n]+)/i);
  const teacherTools = extractLabeledField(sec2, /(?:giáo\s*viên\s*chuẩn\s*bị|gv\s*chuẩn\s*bị|giáo\s*viên)\s*[:\-]?\s*([^\n]+)/i);
  const studentTools = extractLabeledField(sec2, /(?:học\s*sinh\s*chuẩn\s*bị|hs\s*chuẩn\s*bị|học\s*sinh)\s*[:\-]?\s*([^\n]+)/i);

  const detectedSections: string[] = [];
  if (weekMatch || gradeMatch || title) detectedSections.push('Thông tin chung & PPCT');
  if (sec1) detectedSections.push('I. Yêu cầu cần đạt (5512)');
  if (sec2) detectedSections.push('II. Địa điểm & Thiết bị dạy học');
  if (sec4) detectedSections.push('IV. Điều chỉnh sau bài dạy');

  return {
    week: weekMatch ? parseInt(weekMatch[1], 10) : 9,
    grade: gradeMatch ? Math.min(5, Math.max(1, parseInt(gradeMatch[1], 10))) : 1,
    lessonNum: lessonMatch ? parseInt(lessonMatch[1], 10) : 17,
    dateRange: dateRangeMatch ? cleanLine(dateRangeMatch[0]) : 'Tuần học theo kế hoạch',
    topic,
    title,
    schoolName: schoolMatch ? cleanLine(schoolMatch[1]) : undefined,
    departmentName: deptMatch ? cleanLine(deptMatch[1]) : undefined,
    teacherName: teacherMatch ? cleanLine(teacherMatch[1]) : undefined,
    approverPrincipal: bghMatch ? cleanLine(bghMatch[1]) : undefined,
    approverHead: headMatch ? cleanLine(headMatch[1]) : undefined,
    locationDate: locationDateMatch ? cleanLine(locationDateMatch[1]) : '',
    specialCompetencies: {
      healthCare: healthCare || DEFAULT_SPECIAL.healthCare,
      basicMovement: basicMovement || DEFAULT_SPECIAL.basicMovement,
      sportsCompetency: sportsCompetency || DEFAULT_SPECIAL.sportsCompetency,
      disabledStudents: disabledSpecial || DEFAULT_SPECIAL.disabledStudents
    },
    generalCompetencies: {
      autonomy: autonomy || DEFAULT_GENERAL.autonomy,
      collaboration: collaboration || DEFAULT_GENERAL.collaboration,
      problemSolving: problemSolving || DEFAULT_GENERAL.problemSolving,
      disabledStudents: disabledGeneral || DEFAULT_GENERAL.disabledStudents
    },
    qualities: {
      diligence: diligence || DEFAULT_QUALITIES.diligence,
      honesty: honesty || DEFAULT_QUALITIES.honesty,
      responsibility: responsibility || DEFAULT_QUALITIES.responsibility,
      disabledStudents: disabledQualities || DEFAULT_QUALITIES.disabledStudents
    },
    integrations: {
      digitalSkill: nlsCodeMatch ? nlsCodeMatch[1] : DEFAULT_INTEGRATIONS.digitalSkill,
      digitalDescription: digitalDescription || DEFAULT_INTEGRATIONS.digitalDescription,
      lifeSkills: lifeSkills || DEFAULT_INTEGRATIONS.lifeSkills,
      environmentalEducation: environmentalEducation || DEFAULT_INTEGRATIONS.environmentalEducation
    },
    locationEquipment: {
      location: location || DEFAULT_LOCATION_EQUIPMENT.location,
      teacherTools: teacherTools || DEFAULT_LOCATION_EQUIPMENT.teacherTools,
      studentTools: studentTools || DEFAULT_LOCATION_EQUIPMENT.studentTools
    },
    postLessonAdjustment: sec4 || '....................................................................................................................',
    detectedSections
  };
}

function extractImagesFromCell(cell: Element, prefix: string): DiagramAttachment[] {
  const imgs = Array.from(cell.querySelectorAll('img'));
  const result: DiagramAttachment[] = [];
  imgs.forEach((img, idx) => {
    const src = img.getAttribute('src') || '';
    if (!src) return;
    const alt = img.getAttribute('alt') || img.getAttribute('title') || `Hình trích xuất ${idx + 1}`;
    result.push({
      id: `${prefix}_${Date.now()}_${idx}`,
      url: src,
      title: alt
    });
  });
  return result;
}

function getCellMultilineText(cell: Element): string {
  const clone = cell.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  clone.querySelectorAll('p, li, div, h1, h2, h3, h4').forEach((el) => {
    if (el.textContent && !el.textContent.endsWith('\n')) {
      el.append('\n');
    }
  });
  return (clone.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractFullLessonTemplateFromHtml(
  html: string,
  fallbackFileName: string,
  fileType: UserCustomTemplate['fileType'] = 'html'
): ParsedLessonFileResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Preserve block newlines when turning HTML into plain text for regex section extraction
  const bodyClone = doc.body.cloneNode(true) as HTMLElement;
  bodyClone.querySelectorAll('p, div, tr, li, br, h1, h2, h3, h4').forEach((el) => {
    if (el.tagName === 'BR') {
      el.replaceWith('\n');
    } else if (el.textContent && !el.textContent.endsWith('\n')) {
      el.append('\n');
    }
  });
  const textContent = (bodyClone.textContent || '').replace(/\u00a0/g, ' ');
  const sections = extractSectionsFromText(textContent);

  const tables = Array.from(doc.querySelectorAll('table'));
  const rows: LessonRow[] = [];

  tables.forEach((table) => {
    const trList = Array.from(table.querySelectorAll('tr'));
    // Heuristic: skip 7-column weekly timetable overview tables if a 4-column lesson plan table also exists
    const headerCells = trList[0]?.querySelectorAll('th, td') || [];
    const headerJoined = Array.from(headerCells).map((c) => (c.textContent || '').toLowerCase()).join(' | ');
    const isWeeklyOverviewTable =
      headerCells.length >= 6 && (headerJoined.includes('thứ') || headerJoined.includes('đddh') || headerJoined.includes('ppct'));
    if (isWeeklyOverviewTable && tables.length > 1) return;

    trList.forEach((tr, trIdx) => {
      const cells = Array.from(tr.querySelectorAll('th, td'));
      if (cells.length < 3) return;

      const c0 = (cells[0].textContent || '').trim();
      const c1 = (cells[1].textContent || '').trim();
      const isHeader =
        trIdx === 0 &&
        (c0.toLowerCase().includes('nội dung') ||
          c0.toLowerCase().includes('hoạt động') ||
          c1.toLowerCase().includes('lượng vận động') ||
          c1.toLowerCase() === 'lvđ');
      if (isHeader) return;

      // Support optional STT leading column (5 columns: STT | Nội dung | LVĐ | GV | HS)
      const hasLeadingStt = cells.length >= 5 && /^\d{1,2}\.?$/.test(c0);
      const offset = hasLeadingStt ? 1 : 0;

      const contentCell = cells[offset];
      const lvdCell = cells.length - offset >= 4 ? cells[offset + 1] : null;
      const gvCell = cells.length - offset >= 4 ? cells[offset + 2] : cells[offset + 1];
      const hsCell = cells.length - offset >= 4 ? cells[offset + 3] : cells[offset + 2];

      const contentText = contentCell ? getCellMultilineText(contentCell) : '';
      const lvdText = lvdCell ? getCellMultilineText(lvdCell) : '3 - 5 phút';
      const gvText = gvCell ? getCellMultilineText(gvCell) : '';
      const hsText = hsCell ? getCellMultilineText(hsCell) : '';

      if (!contentText && !gvText && !hsText) return;

      const cImgs = contentCell ? extractImagesFromCell(contentCell, `imp_c_${rows.length}`) : [];
      const gImgs = gvCell ? extractImagesFromCell(gvCell, `imp_g_${rows.length}`) : [];
      const hImgs = hsCell ? extractImagesFromCell(hsCell, `imp_h_${rows.length}`) : [];

      rows.push({
        content: contentText,
        lvd: lvdText || '3 - 5 phút',
        gv: gvText,
        hs: hsText,
        contentImgUrl: cImgs[0]?.url,
        contentImgTitle: cImgs[0]?.title,
        contentImages: cImgs,
        gvImgUrl: gImgs[0]?.url,
        gvImgTitle: gImgs[0]?.title,
        gvImages: gImgs,
        hsImgUrl: hImgs[0]?.url,
        hsImgTitle: hImgs[0]?.title,
        hsImages: hImgs
      });
    });
  });

  if (rows.length === 0) {
    return parseTextLessonPlanMultiTask(textContent, fallbackFileName, fileType);
  }

  const detectedSections = [...sections.detectedSections, `III. Bảng tiến trình 4 cột (${rows.length} hoạt động)`];
  const baseTitle = sections.title || fallbackFileName.replace(/\.[^/.]+$/, '');

  return {
    name: baseTitle,
    sourceFileName: fallbackFileName,
    fileType,
    title: baseTitle,
    topic: sections.topic,
    week: sections.week,
    grade: sections.grade,
    lessonNum: sections.lessonNum,
    dateRange: sections.dateRange,
    schoolName: sections.schoolName,
    departmentName: sections.departmentName,
    teacherName: sections.teacherName,
    approverPrincipal: sections.approverPrincipal,
    approverHead: sections.approverHead,
    specialCompetencies: sections.specialCompetencies,
    generalCompetencies: sections.generalCompetencies,
    qualities: sections.qualities,
    integrations: sections.integrations,
    locationEquipment: sections.locationEquipment,
    postLessonAdjustment: sections.postLessonAdjustment,
    signatures: {
      locationDate: sections.locationDate,
      bgh: sections.approverPrincipal || 'Ban Giám Hiệu',
      headTeacher: sections.approverHead || 'Tổ trưởng chuyên môn',
      teacher: sections.teacherName || 'Giáo viên soạn bài'
    },
    rows,
    detectedSections,
    analysisNotes: [
      `Trích xuất ${rows.length} dòng hoạt động từ bảng giáo án chuẩn 5512.`,
      `Nhận diện đầy đủ Khối ${sections.grade} · Tuần ${sections.week} · Tiết ${sections.lessonNum}.`,
      rows.some((r) => Boolean(r.contentImgUrl || r.hsImgUrl))
        ? 'Đã giữ nguyên hình ảnh và sơ đồ đội hình đính kèm trong file gốc.'
        : 'Giáo án văn bản thuần; có thể gắn thêm ảnh SGK hoặc sơ đồ ở Tab 5 & Tab 6.'
    ],
    rawTextExcerpt: textContent.slice(0, 6000)
  };
}

/**
 * Spatial PDF extractor using pdfjs-dist text coordinates (Y-grouping + X-column detection).
 */
async function parsePdfLessonFile(file: File): Promise<ParsedLessonFileResult> {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      const workerMod: any = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default || workerMod;
    } catch {
      // Fallback: pdfjs runs without explicit worker or uses TabScan's already configured worker
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = (content.items as any[]).filter((it) => typeof it.str === 'string' && it.str.trim().length > 0);

    // Group items by Y baseline (within 3.5pt tolerance)
    const lines: { y: number; cells: { x: number; text: string }[] }[] = [];
    items.forEach((it) => {
      const x = it.transform?.[4] ?? 0;
      const y = it.transform?.[5] ?? 0;
      const existingLine = lines.find((l) => Math.abs(l.y - y) <= 3.5);
      if (existingLine) {
        existingLine.cells.push({ x, text: it.str });
      } else {
        lines.push({ y, cells: [{ x, text: it.str }] });
      }
    });

    // Top-to-bottom (higher Y first in PDF coordinates), then left-to-right
    lines.sort((a, b) => b.y - a.y);
    const pageLines = lines.map((line) => {
      line.cells.sort((a, b) => a.x - b.x);
      let joined = '';
      let prevX = -999;
      line.cells.forEach((c) => {
        if (prevX >= 0 && c.x - prevX > 45) {
          joined += '\t' + c.text;
        } else if (joined.length > 0 && !joined.endsWith(' ') && !c.text.startsWith(' ')) {
          joined += ' ' + c.text;
        } else {
          joined += c.text;
        }
        prevX = c.x + (c.text.length * 4);
      });
      return joined.trim();
    });

    fullText += pageLines.join('\n') + '\n';
  }

  return parseTextLessonPlanMultiTask(fullText, file.name, 'pdf');
}

function splitRowColumnsFromLine(line: string): string[] | null {
  if (line.includes('\t')) {
    const parts = line.split('\t').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) return parts;
  }
  if (line.includes('|')) {
    const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) return parts;
  }
  return null;
}

export function parseTextLessonPlanMultiTask(
  text: string,
  fallbackFileName = 'Giao_an_moi',
  fileType: UserCustomTemplate['fileType'] = 'text'
): ParsedLessonFileResult {
  const normalizedText = (text || '').replace(/\r\n/g, '\n');
  const sections = extractSectionsFromText(normalizedText);

  // Locate Section III body if present
  const sec3Body =
    sliceSection(
      normalizedText,
      /(?:^|\n)\s*III\.\s*(?:CÁC\s*HOẠT\s*ĐỘNG|TIẾN\s*TRÌNH)[^\n]*/i,
      /(?:\n\s*IV\.\s*ĐIỀU\s*CHỈNH\s*SAU\s*BÀI\s*DẠY)/i
    ) || normalizedText;

  const lines = sec3Body.split('\n').map((l) => l.trim()).filter(Boolean);
  const rows: LessonRow[] = [];

  // Mode A: Tabular lines separated by \t or |
  const tabularLines = lines.map(splitRowColumnsFromLine).filter(Boolean) as string[][];
  if (tabularLines.length >= 2) {
    tabularLines.forEach((cols, idx) => {
      const joined = cols.join(' ').toLowerCase();
      if (idx === 0 && (joined.includes('nội dung') && (joined.includes('giáo viên') || joined.includes('lvđ')))) {
        return;
      }
      if (cols.length >= 4) {
        rows.push({
          content: cols[0],
          lvd: cols[1],
          gv: cols[2],
          hs: cols.slice(3).join(' ')
        });
      } else {
        rows.push({
          content: cols[0],
          lvd: '3 - 5 phút',
          gv: cols[1],
          hs: cols[2]
        });
      }
    });
  }

  // Mode B: Structured headings (1., 1.1., 1.2., 1.3., 2., 2.1., 3., 3.1..3.5, 4., 4.1..4.3)
  if (rows.length === 0 && lines.length > 0) {
    const headingRegex = /^(?:(?:[1-4]\.[1-5]\.?)|(?:[1-4]\.\s*(?:HOẠT ĐỘNG|MỞ ĐẦU|HÌNH THÀNH|KHÁM PHÁ|LUYỆN TẬP|VẬN DỤNG|HỒI TĨNH)))/i;
    let currentBlock: string[] = [];

    const flushBlock = () => {
      if (currentBlock.length === 0) return;
      const blockText = currentBlock.join('\n');
      const gvLines: string[] = [];
      const hsLines: string[] = [];
      const contentLines: string[] = [];
      let detectedLvd = '3 - 5 phút';

      const lvdMatch = blockText.match(/(\d+\s*[-–]\s*\d+\s*(?:phút|'|lần|lượt)|\d+L\s*x\s*\d+N)/i);
      if (lvdMatch) detectedLvd = lvdMatch[1];

      currentBlock.forEach((ln) => {
        const lower = ln.toLowerCase();
        if (lower.startsWith('gv:') || lower.startsWith('- gv') || lower.includes('giáo viên:')) {
          gvLines.push(ln.replace(/^(?:gv|giáo viên)\s*:\s*/i, '- '));
        } else if (lower.startsWith('hs:') || lower.startsWith('- hs') || lower.includes('học sinh:') || lower.includes('đội hình:')) {
          hsLines.push(ln.replace(/^(?:hs|học sinh)\s*:\s*/i, '- '));
        } else {
          contentLines.push(ln);
        }
      });

      rows.push({
        content: contentLines.join('\n') || blockText,
        lvd: detectedLvd,
        gv: gvLines.join('\n') || '- GV hướng dẫn, tổ chức và quan sát học sinh thực hiện hoạt động.',
        hs: hsLines.join('\n') || '- Học sinh chú ý lắng nghe và tích cực thực hiện nhiệm vụ học tập.'
      });
      currentBlock = [];
    };

    lines.forEach((ln) => {
      if (headingRegex.test(ln) && currentBlock.length > 0) {
        flushBlock();
      }
      currentBlock.push(ln);
    });
    flushBlock();
  }

  // Fallback only when text literally has no identifiable structure
  if (rows.length === 0) {
    rows.push(
      {
        content: '1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp & 1.2. Khởi động:\n- Phổ biến mục tiêu, xoay kỹ các khớp.',
        lvd: '5 - 7 phút',
        gv: '- GV nhận lớp, thăm hỏi sức khỏe HS và điều hành khởi động.',
        hs: '- Cán sự tập hợp 4 hàng ngang báo cáo sĩ số; toàn lớp khởi động đều đẹp.'
      },
      {
        content: '2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n- Giới thiệu và làm mẫu nội dung bài học.',
        lvd: '6 - 8 phút',
        gv: '- GV làm mẫu, phân tích kỹ thuật và sửa sai cho HS.',
        hs: '- HS quan sát mẫu và tập mô phỏng theo nhịp hô.'
      },
      {
        content: '3. HOẠT ĐỘNG LUYỆN TẬP\n- Tập đồng loạt, theo tổ nhóm và trò chơi vận động.',
        lvd: '15 - 16 phút',
        gv: '- Điều khiển lớp tập đồng loạt, theo tổ và tổ chức trò chơi.',
        hs: '- HS luyện tập tích cực, hợp tác sửa sai cùng bạn.'
      },
      {
        content: '4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh & 4.2. Vận dụng:\n- Thả lỏng toàn thân và câu hỏi vận dụng sách giáo khoa.',
        lvd: '4 - 5 phút',
        gv: '- Điều hành thả lỏng, nêu câu hỏi vận dụng SGK và nhận xét tiết học.',
        hs: '- Thực hiện thả lỏng sâu, trả lời câu hỏi và thu dọn dụng cụ.'
      }
    );
  }

  const baseTitle = sections.title || fallbackFileName.replace(/\.[^/.]+$/, '');
  const detectedSections = [
    ...sections.detectedSections,
    `III. Tiến trình bài dạy (${rows.length} hoạt động)`
  ];

  return {
    name: baseTitle,
    sourceFileName: fallbackFileName,
    fileType,
    title: baseTitle,
    topic: sections.topic,
    week: sections.week,
    grade: sections.grade,
    lessonNum: sections.lessonNum,
    dateRange: sections.dateRange,
    schoolName: sections.schoolName,
    departmentName: sections.departmentName,
    teacherName: sections.teacherName,
    approverPrincipal: sections.approverPrincipal,
    approverHead: sections.approverHead,
    specialCompetencies: sections.specialCompetencies,
    generalCompetencies: sections.generalCompetencies,
    qualities: sections.qualities,
    integrations: sections.integrations,
    locationEquipment: sections.locationEquipment,
    postLessonAdjustment: sections.postLessonAdjustment,
    signatures: {
      locationDate: sections.locationDate,
      bgh: sections.approverPrincipal || 'Ban Giám Hiệu',
      headTeacher: sections.approverHead || 'Tổ trưởng chuyên môn',
      teacher: sections.teacherName || 'Giáo viên soạn bài'
    },
    rows,
    detectedSections,
    analysisNotes: [
      `Đã phân tích ${rows.length} dòng hoạt động từ tài liệu "${fallbackFileName}".`,
      `Phát hiện thông số: Khối ${sections.grade} · Tuần ${sections.week} · Tiết ${sections.lessonNum}.`
    ],
    rawTextExcerpt: normalizedText.slice(0, 6000)
  };
}

/**
 * Multi-task pipeline: reads file or pasted text, runs deterministic 5512 parser,
 * optionally calls /api/ai/analyze-lesson-template to enrich missing fields,
 * and packages a full UserCustomTemplate.
 */
export async function analyzeLessonPlanMultiTask(
  input: {
    file?: File;
    rawText?: string;
    templateName?: string;
    enableAiRefinement?: boolean;
  },
  onProgress?: (progress: MultiTaskAnalysisProgress) => void
): Promise<UserCustomTemplate> {
  onProgress?.({
    step: 1,
    totalSteps: 4,
    label: input.file ? `Đang đọc tệp "${input.file.name}"...` : 'Đang đọc văn bản giáo án dán vào...',
    percent: 20
  });

  const parsed: ParsedLessonFileResult = input.file
    ? await parseLessonFile(input.file)
    : parseTextLessonPlanMultiTask(input.rawText || '', input.templateName || 'Mau_giao_an_moi', 'text');

  onProgress?.({
    step: 2,
    totalSteps: 4,
    label: `Đã tách ${parsed.rows.length} hoạt động & Mục tiêu 5512...`,
    percent: 50
  });

  let aiEnhancements: any = null;
  if (input.enableAiRefinement !== false && typeof fetch !== 'undefined') {
    onProgress?.({
      step: 3,
      totalSteps: 4,
      label: 'Đang phân tích đa nhiệm (YCCĐ, Tích hợp, Thiết bị, Khối lớp)...',
      percent: 78
    });
    try {
      const res = await fetch('/api/ai/analyze-lesson-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: parsed.rawTextExcerpt || parsed.rows.map((r) => `${r.content}\n${r.gv}\n${r.hs}`).join('\n\n'),
          fileName: parsed.sourceFileName || input.templateName,
          extractedDraft: {
            templateName: parsed.name || parsed.title,
            grade: parsed.grade,
            week: parsed.week,
            lessonNum: parsed.lessonNum,
            topic: parsed.topic,
            title: parsed.title
          }
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.source === 'gemini-ai' && json?.analysis) {
          aiEnhancements = json.analysis;
        }
      }
    } catch {
      // Offline/heuristic fallback already complete
    }
  }

  onProgress?.({
    step: 4,
    totalSteps: 4,
    label: 'Hoàn tất đóng gói "Mẫu giáo án mới từ người dùng"!',
    percent: 100
  });

  const merged: ParsedLessonFileResult = aiEnhancements
    ? {
        ...parsed,
        name: input.templateName?.trim() || aiEnhancements.templateName || parsed.name || parsed.title,
        grade: aiEnhancements.grade || parsed.grade,
        week: aiEnhancements.week || parsed.week,
        lessonNum: aiEnhancements.lessonNum || parsed.lessonNum,
        topic: aiEnhancements.topic || parsed.topic,
        title: aiEnhancements.title || parsed.title,
        dateRange: aiEnhancements.dateRange || parsed.dateRange,
        specialCompetencies: {
          ...DEFAULT_SPECIAL,
          ...parsed.specialCompetencies,
          ...(aiEnhancements.specialCompetencies || {})
        },
        generalCompetencies: {
          ...DEFAULT_GENERAL,
          ...parsed.generalCompetencies,
          ...(aiEnhancements.generalCompetencies || {})
        },
        qualities: {
          ...DEFAULT_QUALITIES,
          ...parsed.qualities,
          ...(aiEnhancements.qualities || {})
        },
        integrations: {
          ...DEFAULT_INTEGRATIONS,
          ...parsed.integrations,
          ...(aiEnhancements.integrations || {})
        },
        locationEquipment: {
          ...DEFAULT_LOCATION_EQUIPMENT,
          ...parsed.locationEquipment,
          ...(aiEnhancements.locationEquipment || {})
        },
        postLessonAdjustment: aiEnhancements.postLessonAdjustment || parsed.postLessonAdjustment,
        analysisNotes: [
          ...(parsed.analysisNotes || []),
          'Đã đối chiếu & làm giàu cấu trúc 5512 bằng bộ phân tích đa nhiệm AI.'
        ]
      }
    : parsed;

  return toUserCustomTemplate(merged, input.templateName);
}

export function toUserCustomTemplate(
  parsed: ParsedLessonFileResult,
  customName?: string
): UserCustomTemplate {
  const now = Date.now();
  const baseTitle = parsed.title || parsed.sourceFileName?.replace(/\.[^/.]+$/, '') || 'Mẫu giáo án mới';
  return {
    id: `tpl_user_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: customName?.trim() || parsed.name || baseTitle,
    sourceFileName: parsed.sourceFileName || 'Văn bản người dùng nhập',
    fileType: parsed.fileType || 'text',
    createdAt: now,
    updatedAt: now,
    grade: parsed.grade || 1,
    week: parsed.week || 9,
    lessonNum: parsed.lessonNum || 17,
    topic: parsed.topic || 'CHỦ ĐỀ BÀI HỌC',
    title: baseTitle,
    dateRange: parsed.dateRange || 'Tuần học theo kế hoạch',
    schoolName: parsed.schoolName,
    departmentName: parsed.departmentName,
    teacherName: parsed.teacherName,
    approverPrincipal: parsed.approverPrincipal,
    approverHead: parsed.approverHead,
    specialCompetencies: parsed.specialCompetencies || { ...DEFAULT_SPECIAL },
    generalCompetencies: parsed.generalCompetencies || { ...DEFAULT_GENERAL },
    qualities: parsed.qualities || { ...DEFAULT_QUALITIES },
    integrations: parsed.integrations || { ...DEFAULT_INTEGRATIONS },
    locationEquipment: parsed.locationEquipment || { ...DEFAULT_LOCATION_EQUIPMENT },
    rows: parsed.rows && parsed.rows.length > 0 ? parsed.rows : [],
    postLessonAdjustment:
      parsed.postLessonAdjustment ||
      '....................................................................................................................',
    signatures: parsed.signatures || {
      locationDate: '',
      bgh: parsed.approverPrincipal || 'Ban Giám Hiệu',
      headTeacher: parsed.approverHead || 'Tổ trưởng chuyên môn',
      teacher: parsed.teacherName || 'Giáo viên soạn bài'
    },
    detectedSections: parsed.detectedSections || ['III. Tiến trình dạy học'],
    analysisNotes: parsed.analysisNotes || [`Phân tích thành công ${parsed.rows?.length || 0} hoạt động.`],
    rawTextExcerpt: parsed.rawTextExcerpt
  };
}

export function customTemplateToMasterPlan(tpl: UserCustomTemplate): MasterPlanItem {
  return normalizeMasterPlan({
    id: tpl.id,
    grade: tpl.grade,
    week: tpl.week,
    lessonNum: tpl.lessonNum,
    topic: tpl.topic,
    title: tpl.title,
    dateRange: tpl.dateRange,
    specialCompetencies: tpl.specialCompetencies,
    generalCompetencies: tpl.generalCompetencies,
    qualities: tpl.qualities,
    integrations: tpl.integrations,
    locationEquipment: tpl.locationEquipment,
    rows: JSON.parse(JSON.stringify(tpl.rows)),
    postLessonAdjustment: tpl.postLessonAdjustment,
    signatures: tpl.signatures
  });
}

// Keep parseTextLessonPlan symbol for backwards compatibility if referenced
export const parseTextLessonPlan = parseTextLessonPlanMultiTask;
