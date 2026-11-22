import mammoth from 'mammoth';
import {
  BlueprintAnalysisDiagnostic,
  BlueprintColumnMode,
  CustomLayoutBlueprint,
  DiagramAttachment,
  ImportedFormationMatchLogItem,
  ImportedTemplateWorkspace,
  ImportedWeeklyPlanEntry,
  LessonRow
} from '../types/gdtc';
import {
  FormationDiagram,
  getFormationDiagramByKeyword,
  getFormationDiagramForPhaseAndGrade,
  getSavedCustomFormations,
  standardFormationDiagrams
} from '../data/formationDiagrams';
import { parseLessonFile, ParsedLessonFileResult, parseTextLessonPlanMultiTask } from './documentParser';
import { getAppStateDB, safeLocalStorageSet, setAppStateDB } from './db';
import { saveOriginalDocumentDB, StoredOriginalDocument } from './originalDocumentStore';

export const CUSTOM_LAYOUT_BLUEPRINTS_STORAGE_KEY = 'gdtc_custom_layout_blueprints_v1';
export const ACTIVE_LAYOUT_BLUEPRINT_ID_STORAGE_KEY = 'gdtc_active_layout_blueprint_id_v1';
export const CUSTOM_LAYOUT_BLUEPRINTS_DB_KEY = 'custom_layout_blueprints';
export const ACTIVE_LAYOUT_BLUEPRINT_ID_DB_KEY = 'active_layout_blueprint_id';
export const TEMPLATE_LAB_WORKSPACES_DB_KEY = 'gdtc_template_lab_workspaces_v1';
export const CUSTOM_LAYOUT_BLUEPRINT_CHANGED_EVENT = 'gdtc:custom-layout-blueprint-changed';

export interface ColumnModeSpec {
  mode: BlueprintColumnMode;
  colCount: number;
  label: string;
  shortLabel: string;
  description: string;
  defaultHeaders: string[];
  defaultWidths: number[];
}

export const COLUMN_MODE_SPECS: Record<BlueprintColumnMode, ColumnModeSpec> = {
  '2col_gv_hs': {
    mode: '2col_gv_hs',
    colCount: 2,
    label: '2 cột (HĐ Giáo viên | HĐ Học sinh — CV 2345)',
    shortLabel: '2 cột GV–HS',
    description: 'Phổ biến ở Tiểu học theo CV 2345: gộp Nội dung & LVĐ vào đầu cột Hoạt động GV.',
    defaultHeaders: ['Hoạt động của Giáo viên', 'Hoạt động của Học sinh'],
    defaultWidths: [52, 48]
  },
  '2col_nd_tc': {
    mode: '2col_nd_tc',
    colCount: 2,
    label: '2 cột (Nội dung & LVĐ | Tổ chức thực hiện)',
    shortLabel: '2 cột ND–TC',
    description: 'Cột trái gồm Nội dung + LVĐ + Ảnh SGK; cột phải gồm HĐ của GV, HĐ của HS và sơ đồ.',
    defaultHeaders: ['Nội dung & Lượng vận động', 'Tổ chức thực hiện (Hoạt động GV & HS)'],
    defaultWidths: [42, 58]
  },
  '3col_nd_lvd_tc': {
    mode: '3col_nd_lvd_tc',
    colCount: 3,
    label: '3 cột (Nội dung | LVĐ | Tổ chức GV & HS)',
    shortLabel: '3 cột có LVĐ',
    description: 'Giữ riêng cột LVĐ đặc trưng GDTC, gộp Hoạt động GV và HS chung một cột Tổ chức.',
    defaultHeaders: ['Nội dung', 'LVĐ', 'Phương pháp & Tổ chức thực hiện (GV & HS)'],
    defaultWidths: [36, 10, 54]
  },
  '3col_nd_gv_hs': {
    mode: '3col_nd_gv_hs',
    colCount: 3,
    label: '3 cột (Nội dung & LVĐ | HĐ GV | HĐ HS)',
    shortLabel: '3 cột ND–GV–HS',
    description: 'Gộp thời lượng LVĐ vào cột Nội dung, giữ riêng 2 cột Hoạt động GV và Hoạt động HS.',
    defaultHeaders: ['Nội dung & Thời lượng', 'Hoạt động của Giáo viên', 'Hoạt động của Học sinh / Sơ đồ'],
    defaultWidths: [38, 30, 32]
  },
  '4col_standard': {
    mode: '4col_standard',
    colCount: 4,
    label: '4 cột chuẩn GDTC (Nội dung | LVĐ | HĐ GV | HĐ HS)',
    shortLabel: '4 cột chuẩn',
    description: 'Bố cục chuẩn chuyên ngành Giáo dục thể chất với đầy đủ 4 cột tách biệt.',
    defaultHeaders: [
      'Nội Dung / Kỹ Thuật Động Tác',
      'LVĐ',
      'Hoạt Động Của Giáo Viên',
      'Hoạt Động Của Học Sinh / Sơ Đồ'
    ],
    defaultWidths: [34, 8, 28, 30]
  },
  '5col_stt': {
    mode: '5col_stt',
    colCount: 5,
    label: '5 cột có STT (STT | Nội dung | LVĐ | HĐ GV | HĐ HS)',
    shortLabel: '5 cột có STT',
    description: 'Giống chuẩn 4 cột nhưng thêm cột Số thứ tự (STT) đầu bảng theo mẫu một số trường.',
    defaultHeaders: [
      'STT',
      'Nội dung',
      'LVĐ',
      'Hoạt động của Giáo viên',
      'Hoạt động của Học sinh / Sơ đồ'
    ],
    defaultWidths: [5, 32, 8, 27, 28]
  }
};

export const COLUMN_MODE_LIST: ColumnModeSpec[] = [
  COLUMN_MODE_SPECS['4col_standard'],
  COLUMN_MODE_SPECS['3col_nd_lvd_tc'],
  COLUMN_MODE_SPECS['3col_nd_gv_hs'],
  COLUMN_MODE_SPECS['2col_gv_hs'],
  COLUMN_MODE_SPECS['2col_nd_tc'],
  COLUMN_MODE_SPECS['5col_stt']
];

export function normalizeBlueprintWidths(widths: number[], colCount: number): number[] {
  const fallback =
    colCount === 2
      ? [48, 52]
      : colCount === 3
      ? [36, 10, 54]
      : colCount === 5
      ? [5, 32, 8, 27, 28]
      : [34, 8, 28, 30];

  if (!Array.isArray(widths) || widths.length !== colCount) return [...fallback];
  const cleaned = widths.map((w) => (Number.isFinite(w) && w > 2 ? Number(w) : 10));
  const sum = cleaned.reduce((acc, v) => acc + v, 0);
  if (sum <= 0) return [...fallback];

  const scaled = cleaned.map((v) => Math.max(4, Math.round((v / sum) * 1000) / 10));
  const scaledSum = scaled.reduce((acc, v) => acc + v, 0);
  const diff = Math.round((100 - scaledSum) * 10) / 10;
  scaled[scaled.length - 1] = Math.max(5, Math.round((scaled[scaled.length - 1] + diff) * 10) / 10);
  return scaled;
}

export function createBlueprintFromPreset(
  mode: BlueprintColumnMode,
  customName?: string,
  opts?: {
    showNationalMotto?: boolean;
    showSchoolHeader?: boolean;
    signatureCount?: 1 | 2 | 3;
    sec1?: string;
    sec2?: string;
    sec3?: string;
    sec4?: string;
  }
): CustomLayoutBlueprint {
  const spec = COLUMN_MODE_SPECS[mode];
  const now = Date.now();
  return {
    id: `bp_preset_${mode}_${now}_${Math.random().toString(36).slice(2, 6)}`,
    name: customName || `Mẫu thử nhanh: ${spec.shortLabel}`,
    sourceType: 'preset',
    createdAt: now,
    updatedAt: now,
    confidenceScore: 100,
    columnMode: mode,
    columnHeaders: [...spec.defaultHeaders],
    columnWidths: [...spec.defaultWidths],
    headerBlock: {
      showNationalMotto: opts?.showNationalMotto ?? (mode === '2col_gv_hs'),
      showSchoolHeader: opts?.showSchoolHeader ?? true,
      topLeftLine1: '',
      topLeftLine2: '',
      documentTitlePrefix: 'KẾ HOẠCH BÀI DẠY',
      showTeacherMetaLine: true
    },
    sectionHeadings: {
      sec1: opts?.sec1 || 'I. YÊU CẦU CẦN ĐẠT',
      sec2: opts?.sec2 || (mode === '2col_gv_hs' ? 'II. ĐỒ DÙNG DẠY HỌC' : 'II. ĐỊA ĐIỂM – PHƯƠNG TIỆN'),
      sec3: opts?.sec3 || 'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU',
      sec4: opts?.sec4 || 'IV. ĐIỀU CHỈNH SAU BÀI DẠY',
      showSec4: true
    },
    signatureBlock: {
      enabled: true,
      count: opts?.signatureCount ?? 3,
      leftTitle: 'BGH DUYỆT',
      middleTitle: 'TỔ TRƯỞNG CHUYÊN MÔN',
      rightTitle: 'GIÁO VIÊN SOẠN BÀI'
    },
    analysisNotes: [`Khởi tạo từ mẫu bố cục sẵn: ${spec.label}.`],
    diagnostics: [
      { id: 'cols', label: 'Cấu trúc bảng', value: spec.label, status: 'detected' },
      { id: 'headings', label: 'Hệ thống đề mục I–IV', value: 'Chuẩn GDPT 2018 / CV 2345', status: 'detected' },
      { id: 'sign', label: 'Khung ký duyệt', value: `${opts?.signatureCount ?? 3} cột ký duyệt`, status: 'detected' }
    ]
  };
}

export interface BlueprintAnalysisOutput {
  blueprint: CustomLayoutBlueprint;
  parsedContent: ParsedLessonFileResult;
  workspace: ImportedTemplateWorkspace;
  originalDocument: StoredOriginalDocument;
}

function cleanText(s?: string): string {
  return (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function classifyColumnsFromHeaders(headers: string[]): BlueprintColumnMode {
  const count = headers.length;
  const lower = headers.map((h) => h.toLowerCase());

  if (count <= 2) {
    const firstIsGv =
      /(?:giáo\s*viên|\bgv\b|hoạt\s*động\s*(?:của\s*)?gv|hoạt\s*động\s*dạy)/i.test(lower[0] || '') &&
      /(?:học\s*sinh|\bhs\b|hoạt\s*động\s*(?:của\s*)?hs|hoạt\s*động\s*học)/i.test(lower[1] || '');
    return firstIsGv ? '2col_gv_hs' : '2col_nd_tc';
  }

  if (count === 3) {
    const col1IsLvd =
      /(?:đlvđ|lvđ|lượng\s*vận\s*động|thời\s*gian|định\s*lượng|sl\s*\/?\s*tg|tg\s*\/?\s*sl)/i.test(lower[1] || '');
    const col2IsCombined =
      /(?:tổ\s*chức|phương\s*pháp|gv\s*[&và\-–]\s*hs|giáo\s*viên\s*[&và\-–]\s*học\s*sinh)/i.test(lower[2] || '');
    if (col1IsLvd || col2IsCombined) {
      return '3col_nd_lvd_tc';
    }
    return '3col_nd_gv_hs';
  }

  if (count >= 5) {
    const col0IsStt = /^(?:stt|tt|số\s*tt|bước|phần)$/i.test((lower[0] || '').trim());
    if (col0IsStt) return '5col_stt';
    return '4col_standard';
  }

  return '4col_standard';
}

function extractHeadingLine(text: string, regex: RegExp, fallback: string): { value: string; found: boolean } {
  const m = text.match(regex);
  if (m && m[0]) {
    const cleaned = cleanText(m[0]).replace(/[:：]\s*$/, '');
    if (cleaned.length >= 4 && cleaned.length <= 95) {
      return { value: cleaned.toUpperCase(), found: true };
    }
  }
  return { value: fallback, found: false };
}

function analyzeStructureFromHtmlAndText(
  html: string | null,
  rawText: string,
  parsedContent: ParsedLessonFileResult,
  fileName: string,
  sourceType: CustomLayoutBlueprint['sourceType']
): CustomLayoutBlueprint {
  const normalizedText = (rawText || '').replace(/\r\n/g, '\n');
  const diagnostics: BlueprintAnalysisDiagnostic[] = [];
  const notes: string[] = [];
  let detectedPoints = 0;
  const maxPoints = 6;

  // 1. Detect table structure (columns, headers, widths)
  let detectedHeaders: string[] = [];
  let detectedWidths: number[] = [];
  let tableFoundInDom = false;

  if (html && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    // Score candidate tables: prefer 2..5 column tables with lesson-plan header keywords and >= 2 rows
    let bestTable: { table: HTMLTableElement; score: number; headers: string[]; widths: number[] } | null = null;

    tables.forEach((tbl) => {
      const trs = Array.from(tbl.querySelectorAll('tr'));
      if (trs.length < 2) return;

      // Pick header row (supports both 1-row headers and CV 5512 2-row merged headers via colSpan)
      const firstRowCells = Array.from(trs[0].querySelectorAll('th, td')) as HTMLTableCellElement[];
      if (firstRowCells.length < 2) return;

      const hasMergedSpan = firstRowCells.some((c) => (c.colSpan || 1) > 1);
      let headerTexts: string[] = [];
      let colCount = firstRowCells.length;

      if (hasMergedSpan && trs.length >= 2) {
        const secondRowCells = Array.from(trs[1].querySelectorAll('th, td')) as HTMLTableCellElement[];
        const secondTexts = secondRowCells.map((c) => cleanText(c.textContent || ''));
        let secondIdx = 0;
        firstRowCells.forEach((cell) => {
          const span = Math.max(1, cell.colSpan || 1);
          const cellText = cleanText(cell.textContent || '');
          if (span === 1) {
            headerTexts.push(cellText);
          } else {
            for (let s = 0; s < span; s++) {
              const sub = secondTexts[secondIdx++];
              headerTexts.push(sub || cellText);
            }
          }
        });
        colCount = headerTexts.length;
      } else {
        headerTexts = firstRowCells.map((c) => cleanText(c.textContent || ''));
        colCount = firstRowCells.length;
      }

      if (colCount < 2 || colCount > 6) return;

      const headerJoined = headerTexts.join(' | ').toLowerCase();

      // Skip weekly timetable 6-7 cols
      const isTimetable =
        colCount >= 6 &&
        (/(?:thứ|tiết|ppct|đddh)/i.test(headerJoined));
      if (isTimetable) return;

      // Skip signature table or national motto header table (2-3 cols, 1-2 rows containing BGH / CỘNG HÒA)
      const isSignatureOrMotto =
        trs.length <= 3 &&
        /(?:cộng\s*hòa|độc\s*lập|bgh\s*duyệt|tổ\s*trưởng|giáo\s*viên\s*soạn|hiệu\s*trưởng)/i.test(
          cleanText(tbl.textContent || '').toLowerCase()
        );
      if (isSignatureOrMotto) return;

      let score = trs.length * 2;
      if (/(?:nội\s*dung|hoạt\s*động|tổ\s*chức|giáo\s*viên|học\s*sinh|đlvđ|lvđ|lượng\s*vận\s*động)/i.test(headerJoined)) {
        score += 30;
      }
      if (colCount >= 2 && colCount <= 5) score += 10;

      // Attempt to read explicit percentage or numeric widths on header cells or <col>
      const colEls = Array.from(tbl.querySelectorAll('colgroup col'));
      const rawWidths: number[] = [];
      for (let i = 0; i < colCount; i++) {
        const cell = firstRowCells[i] as HTMLElement | undefined;
        const colEl = colEls[i] as HTMLElement | undefined;
        const wAttr =
          colEl?.style?.width ||
          colEl?.getAttribute('width') ||
          (!hasMergedSpan ? cell?.style?.width || cell?.getAttribute('width') || '' : '');
        const num = parseFloat(wAttr.replace(/[^\d.]/g, ''));
        if (Number.isFinite(num) && num > 0) {
          rawWidths.push(num);
        }
      }

      if (!bestTable || score > bestTable.score) {
        bestTable = {
          table: tbl,
          score,
          headers: headerTexts,
          widths: rawWidths.length === colCount ? rawWidths : []
        };
      }
    });

    if (bestTable) {
      const picked = bestTable as { table: HTMLTableElement; score: number; headers: string[]; widths: number[] };
      tableFoundInDom = true;
      detectedHeaders = picked.headers;
      detectedWidths = picked.widths;
    }
  }

  // Fallback for PDF / pasted text: look for tabular header line separated by tabs or pipes
  if (!tableFoundInDom) {
    const lines = normalizedText.split('\n').map((l) => l.trim()).filter(Boolean);
    for (let li = 0; li < Math.min(lines.length, 400); li++) {
      const ln = lines[li];
      const sep = ln.includes('\t') ? '\t' : ln.includes('|') ? '|' : null;
      if (!sep) continue;
      const parts = ln.split(sep).map(cleanText).filter(Boolean);
      if (parts.length >= 2 && parts.length <= 5) {
        const joined = parts.join(' ').toLowerCase();
        if (/(?:nội\s*dung|hoạt\s*động|giáo\s*viên|học\s*sinh|đlvđ|lvđ|lượng\s*vận\s*động|tổ\s*chức)/i.test(joined)) {
          // Handle 2-line CV 5512 PDF header: "Nội dung | ĐLVĐ | Phương pháp – Hình thức..." followed by "Hoạt động của GV | Hoạt động của HS"
          const nextLn = lines[li + 1] || '';
          if (
            parts.length === 3 &&
            /phương\s*pháp|tổ\s*chức/i.test(parts[2]) &&
            /hoạt\s*động\s*của\s*(?:gv|giáo\s*viên)/i.test(nextLn) &&
            /hoạt\s*động\s*của\s*(?:hs|học\s*sinh)/i.test(nextLn)
          ) {
            detectedHeaders = [parts[0], parts[1], 'Hoạt động của GV', 'Hoạt động của HS'];
          } else {
            detectedHeaders = parts;
          }
          break;
        }
      }
    }
  }

  let columnMode: BlueprintColumnMode = '4col_standard';
  let finalHeaders: string[] = [...COLUMN_MODE_SPECS['4col_standard'].defaultHeaders];
  let finalWidths: number[] = [...COLUMN_MODE_SPECS['4col_standard'].defaultWidths];

  if (detectedHeaders.length >= 2) {
    columnMode = classifyColumnsFromHeaders(detectedHeaders);
    const spec = COLUMN_MODE_SPECS[columnMode];
    // Trim or pad headers to exact spec.colCount
    finalHeaders = spec.defaultHeaders.map((def, idx) => {
      const h = detectedHeaders[idx];
      return h && h.length >= 2 && h.length <= 70 ? h : def;
    });
    finalWidths =
      detectedWidths.length === spec.colCount
        ? normalizeBlueprintWidths(detectedWidths, spec.colCount)
        : [...spec.defaultWidths];
    detectedPoints += 2;
    diagnostics.push({
      id: 'table',
      label: 'Bảng tiến trình dạy học',
      value: `${spec.colCount} cột (${finalHeaders.join(' | ')})`,
      status: 'detected'
    });
    notes.push(`Phát hiện chính xác bảng ${spec.colCount} cột: ${finalHeaders.join(' · ')}.`);
  } else {
    // Infer from text markers if no explicit table header found
    const mentionsGvHsOnly =
      /hoạt\s*động\s*của\s*giáo\s*viên/i.test(normalizedText) &&
      /hoạt\s*động\s*của\s*học\s*sinh/i.test(normalizedText) &&
      !/(?:lvđ|lượng\s*vận\s*động)/i.test(normalizedText);
    if (mentionsGvHsOnly) {
      columnMode = '2col_gv_hs';
      finalHeaders = [...COLUMN_MODE_SPECS['2col_gv_hs'].defaultHeaders];
      finalWidths = [...COLUMN_MODE_SPECS['2col_gv_hs'].defaultWidths];
      detectedPoints += 1;
      diagnostics.push({
        id: 'table',
        label: 'Bảng tiến trình dạy học',
        value: 'Suy luận 2 cột (HĐ GV | HĐ HS — CV 2345)',
        status: 'inferred'
      });
    } else {
      diagnostics.push({
        id: 'table',
        label: 'Bảng tiến trình dạy học',
        value: 'Mặc định 4 cột chuẩn GDTC (có thể đổi ngay bên dưới)',
        status: 'fallback'
      });
    }
  }

  // 2. Detect Header block (National Motto, School/Dept header, Document Title)
  const hasNationalMotto = /cộng\s*hòa\s*xã\s*hội\s*chủ\s*nghĩa\s*việt\s*nam/i.test(normalizedText);
  const deptUpperMatch = normalizedText.match(/(?:phòng\s*gd[^\n]{0,60}|sở\s*gd[^\n]{0,60}|ubnd[^\n]{0,60})/i);
  const schoolLineMatch = normalizedText.match(/(trường\s*(?:tiểu\s*học|thcs|th\s*&\s*thcs|pt)[^\n]{0,65})/i);
  const groupLineMatch = normalizedText.match(/(tổ\s*(?:chuyên\s*môn|khối|tự\s*nhiên|năng\s*khiếu)[^\n]{0,55})/i);

  const topLeftLine1 = cleanText(deptUpperMatch?.[0] || schoolLineMatch?.[1] || parsedContent.schoolName || '');
  const topLeftLine2 = cleanText(
    deptUpperMatch?.[0] && schoolLineMatch?.[1]
      ? schoolLineMatch[1]
      : groupLineMatch?.[1] || parsedContent.departmentName || ''
  );
  const showSchoolHeader = Boolean(topLeftLine1 || topLeftLine2 || hasNationalMotto);

  if (hasNationalMotto || showSchoolHeader) {
    detectedPoints += 1;
    diagnostics.push({
      id: 'header',
      label: 'Tiêu ngữ & Đơn vị',
      value: [
        hasNationalMotto ? 'Có Quốc hiệu – Tiêu ngữ' : 'Không dùng Quốc hiệu',
        topLeftLine1 ? topLeftLine1 : null
      ]
        .filter(Boolean)
        .join(' · '),
      status: 'detected'
    });
  } else {
    diagnostics.push({
      id: 'header',
      label: 'Tiêu ngữ & Đơn vị',
      value: 'Kiểu gọn (chỉ tiêu đề Kế hoạch bài dạy)',
      status: 'inferred'
    });
  }

  const docTitleMatch = normalizedText.match(
    /(?:kế\s*hoạch\s*bài\s*dạy|kế\s*hoạch\s*dạy\s*học|giáo\s*án\s*(?:môn\s*)?giáo\s*dục\s*thể\s*chất|giáo\s*án)/i
  );
  const documentTitlePrefix = docTitleMatch ? cleanText(docTitleMatch[0]).toUpperCase() : 'KẾ HOẠCH BÀI DẠY';
  const showTeacherMetaLine = /(?:giáo\s*viên(?:\s*giảng\s*dạy|\s*soạn)?\s*:|môn\s*học\s*:|ngày\s*soạn\s*:)/i.test(
    normalizedText.slice(0, 1200)
  );

  // 3. Detect Section Headings I, II, III, IV
  const sec1 = extractHeadingLine(
    normalizedText,
    /(?:^|\n)\s*I\.\s*(?:YÊU\s*CẦU\s*CẦN\s*ĐẠT|MỤC\s*TIÊU[^\n]{0,40})/i,
    'I. YÊU CẦU CẦN ĐẠT'
  );
  const sec2 = extractHeadingLine(
    normalizedText,
    /(?:^|\n)\s*II\.\s*(?:ĐỒ\s*DÙNG\s*DẠY\s*HỌC|ĐỊA\s*ĐIỂM[^\n]{0,45}|THIẾT\s*BỊ[^\n]{0,45}|CHUẨN\s*BỊ[^\n]{0,45})/i,
    'II. ĐỊA ĐIỂM – PHƯƠNG TIỆN'
  );
  const sec3 = extractHeadingLine(
    normalizedText,
    /(?:^|\n)\s*III\.\s*(?:CÁC\s*HOẠT\s*ĐỘNG[^\n]{0,45}|HOẠT\s*ĐỘNG\s*DẠY\s*HỌC[^\n]{0,45}|TIẾN\s*TRÌNH[^\n]{0,45})/i,
    'III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU'
  );
  const sec4 = extractHeadingLine(
    normalizedText,
    /(?:^|\n)\s*IV\.\s*(?:ĐIỀU\s*CHỈNH[^\n]{0,45}|RÚT\s*KINH\s*NGHIỆM[^\n]{0,45})/i,
    'IV. ĐIỀU CHỈNH SAU BÀI DẠY'
  );

  const foundHeadingCount = [sec1.found, sec2.found, sec3.found, sec4.found].filter(Boolean).length;
  if (foundHeadingCount >= 2) {
    detectedPoints += 2;
    diagnostics.push({
      id: 'sections',
      label: 'Hệ thống mục lớn I–IV',
      value: `Nhận diện ${foundHeadingCount}/4 mục (${sec1.value} / ${sec2.value})`,
      status: 'detected'
    });
    notes.push(`Giữ nguyên tên đề mục của mẫu gốc: ${sec1.value}, ${sec2.value}, ${sec3.value}.`);
  } else {
    diagnostics.push({
      id: 'sections',
      label: 'Hệ thống mục lớn I–IV',
      value: 'Áp dụng đề mục chuẩn I–IV (CV 5512 / 2345)',
      status: 'fallback'
    });
  }

  // 4. Detect Signature Block (tail of document)
  const tailText = normalizedText.slice(Math.max(0, normalizedText.length - 1200));
  const hasBgh = /(?:bgh\s*duyệt|ban\s*giám\s*hiệu|hiệu\s*trưởng|phó\s*hiệu\s*trưởng|duyệt\s*của\s*bgh)/i.test(tailText);
  const hasHead = /(?:tổ\s*trưởng|duyệt\s*của\s*tổ|tổ\s*chuyên\s*môn)/i.test(tailText);
  const hasTeacherSign = /(?:giáo\s*viên\s*soạn|người\s*soạn|giáo\s*viên\s*giảng\s*dạy|giáo\s*viên)/i.test(tailText);

  let sigCount: 1 | 2 | 3 = 3;
  let leftTitle = 'BGH DUYỆT';
  let middleTitle = 'TỔ TRƯỞNG CHUYÊN MÔN';
  let rightTitle = 'GIÁO VIÊN SOẠN BÀI';

  const bghLabelMatch = tailText.match(/(?:bgh\s*duyệt|ban\s*giám\s*hiệu|duyệt\s*của\s*bgh|hiệu\s*trưởng)/i);
  const headLabelMatch = tailText.match(/(?:tổ\s*trưởng\s*chuyên\s*môn|tổ\s*trưởng|duyệt\s*của\s*tổ\s*trưởng)/i);
  const teacherLabelMatch = tailText.match(/(?:giáo\s*viên\s*soạn\s*bài|giáo\s*viên\s*soạn|người\s*soạn|giáo\s*viên)/i);

  if (bghLabelMatch) leftTitle = cleanText(bghLabelMatch[0]).toUpperCase();
  if (headLabelMatch) middleTitle = cleanText(headLabelMatch[0]).toUpperCase();
  if (teacherLabelMatch) rightTitle = cleanText(teacherLabelMatch[0]).toUpperCase();

  if (hasBgh && hasHead && hasTeacherSign) {
    sigCount = 3;
    detectedPoints += 1;
  } else if ((hasBgh || hasHead) && hasTeacherSign) {
    sigCount = 2;
    if (!hasBgh && hasHead) leftTitle = middleTitle;
    detectedPoints += 1;
  } else if (hasTeacherSign) {
    sigCount = 1;
    detectedPoints += 1;
  } else {
    sigCount = 3;
  }

  diagnostics.push({
    id: 'signatures',
    label: 'Khung ký duyệt cuối trang',
    value:
      sigCount === 3
        ? `3 cột (${leftTitle} · ${middleTitle} · ${rightTitle})`
        : sigCount === 2
        ? `2 cột (${leftTitle} · ${rightTitle})`
        : `1 cột (${rightTitle})`,
    status: hasBgh || hasHead || hasTeacherSign ? 'detected' : 'fallback'
  });

  const confidenceScore = Math.min(99, Math.max(55, Math.round((detectedPoints / maxPoints) * 100)));
  const cleanBaseName = fileName.replace(/\.[^/.]+$/, '').replace(/[_]+/g, ' ').trim();
  const now = Date.now();

  return {
    id: `bp_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: cleanBaseName ? `Mẫu từ: ${cleanBaseName}` : 'Mẫu giáo án người dùng',
    sourceFileName: fileName,
    sourceType,
    createdAt: now,
    updatedAt: now,
    confidenceScore,
    columnMode,
    columnHeaders: finalHeaders,
    columnWidths: finalWidths,
    headerBlock: {
      showNationalMotto: hasNationalMotto,
      showSchoolHeader,
      topLeftLine1,
      topLeftLine2,
      documentTitlePrefix,
      showTeacherMetaLine
    },
    sectionHeadings: {
      sec1: sec1.value,
      sec2: sec2.value,
      sec3: sec3.value,
      sec4: sec4.value,
      showSec4: true
    },
    signatureBlock: {
      enabled: true,
      count: sigCount,
      leftTitle,
      middleTitle,
      rightTitle
    },
    detectedSchoolName: parsedContent.schoolName || schoolLineMatch?.[1]?.trim(),
    detectedDepartmentName: parsedContent.departmentName || groupLineMatch?.[1]?.trim(),
    detectedTeacherName: parsedContent.teacherName,
    detectedApproverPrincipal: parsedContent.approverPrincipal,
    detectedApproverHead: parsedContent.approverHead,
    analysisNotes:
      notes.length > 0
        ? notes
        : [`Đã phân tích bố cục từ tệp "${fileName}" và tự động lưu vào kho mẫu.`],
    diagnostics
  };
}

/**
 * Analyzes an uploaded lesson plan file (.docx, .doc, .pdf, .html, .txt)
 * and extracts its CustomLayoutBlueprint, ParsedLessonFileResult, AND ImportedTemplateWorkspace
 * (including weekly plan schedule & auto-matched formation diagrams from the app library).
 */
export async function analyzeLessonLayoutFile(
  file: File,
  onProgress?: (label: string, percent: number) => void
): Promise<BlueprintAnalysisOutput> {
  const lowerName = file.name.toLowerCase();
  const rawArrayBuffer = await file.arrayBuffer();
  const parsedContent = await parseLessonFile(file, onProgress);

  let html: string | null = null;
  let sourceType: CustomLayoutBlueprint['sourceType'] = 'text';
  let originalPlainText: string | undefined = undefined;

  if (lowerName.endsWith('.docx')) {
    sourceType = 'docx';
    try {
      const res = await mammoth.convertToHtml({ arrayBuffer: rawArrayBuffer.slice(0) });
      html = res.value || null;
    } catch {
      html = null;
    }
  } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
    sourceType = lowerName.endsWith('.doc') ? 'doc' : 'html';
    try {
      const txt = await file.text();
      if (/<table|<html|<p|<div/i.test(txt)) {
        html = txt;
      } else {
        originalPlainText = txt;
      }
    } catch {
      html = null;
    }
  } else if (lowerName.endsWith('.pdf')) {
    sourceType = 'pdf';
  } else {
    try {
      originalPlainText = await file.text();
    } catch {
      originalPlainText = parsedContent.fullText || parsedContent.rawTextExcerpt || '';
    }
  }

  let rawText = parsedContent.fullText || parsedContent.rawTextExcerpt || '';
  if (html && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const clone = doc.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('p, div, tr, li, br, h1, h2, h3, h4').forEach((el) => {
      if (el.tagName === 'BR') el.replaceWith('\n');
      else if (el.textContent && !el.textContent.endsWith('\n')) el.append('\n');
    });
    const htmlPlain = (clone.textContent || '').replace(/\u00a0/g, ' ');
    if (htmlPlain.length > rawText.length) {
      rawText = htmlPlain;
    }
  }

  onProgress?.('Đang phân tích khung bảng, kế hoạch tuần & bảo toàn nguyên vẹn bản gốc...', 92);
  const analysisTextSample = rawText.replace(/\[\[PAGE:\d+\]\]\n?/g, '').slice(0, 24000);
  const blueprint = analyzeStructureFromHtmlAndText(html, analysisTextSample, parsedContent, file.name, sourceType);
  const workspace = extractImportedWorkspaceFromParsed(blueprint, parsedContent, rawText);

  const originalDocument: StoredOriginalDocument = {
    blueprintId: blueprint.id,
    fileName: file.name,
    fileType: sourceType,
    mimeType: file.type || (sourceType === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
    sizeBytes: file.size,
    savedAt: Date.now(),
    pdfBytes: sourceType === 'pdf' ? new Uint8Array(rawArrayBuffer.slice(0)) : undefined,
    originalHtml: html || undefined,
    rawBytes: sourceType !== 'pdf' ? new Uint8Array(rawArrayBuffer.slice(0)) : undefined,
    originalText: originalPlainText
  };
  await saveOriginalDocumentDB(originalDocument);

  onProgress?.('Hoàn tất tiếp nhận bản gốc nguyên vẹn!', 100);

  return { blueprint, parsedContent, workspace, originalDocument };
}

/**
 * Analyzes pasted text / HTML snippet directly in the Template Lab.
 */
export function analyzeLessonLayoutText(rawText: string, templateName = 'Mẫu dán trực tiếp'): BlueprintAnalysisOutput {
  const isHtml = /<table|<tr|<td|<div|<p/i.test(rawText);
  const parsedContent = parseTextLessonPlanMultiTask(
    isHtml && typeof DOMParser !== 'undefined'
      ? new DOMParser().parseFromString(rawText, 'text/html').body.textContent || rawText
      : rawText,
    templateName,
    isHtml ? 'html' : 'text'
  );
  const html = isHtml ? rawText : null;
  const blueprint = analyzeStructureFromHtmlAndText(
    html,
    parsedContent.fullText || parsedContent.rawTextExcerpt || rawText,
    parsedContent,
    templateName,
    isHtml ? 'html' : 'text'
  );
  blueprint.name = templateName.trim() || blueprint.name;
  const workspace = extractImportedWorkspaceFromParsed(
    blueprint,
    parsedContent,
    parsedContent.fullText || rawText
  );
  const originalDocument: StoredOriginalDocument = {
    blueprintId: blueprint.id,
    fileName: `${blueprint.name}.${isHtml ? 'html' : 'txt'}`,
    fileType: isHtml ? 'html' : 'text',
    mimeType: isHtml ? 'text/html' : 'text/plain',
    sizeBytes: rawText.length,
    savedAt: Date.now(),
    originalHtml: isHtml ? rawText : undefined,
    originalText: !isHtml ? rawText : undefined
  };
  saveOriginalDocumentDB(originalDocument).catch(() => {});

  return { blueprint, parsedContent, workspace, originalDocument };
}

// =========================================================================
// PERSISTENCE (localStorage + IndexedDB mirror + change event)
// =========================================================================

export function getSavedLayoutBlueprints(): CustomLayoutBlueprint[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LAYOUT_BLUEPRINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLayoutBlueprints(list: CustomLayoutBlueprint[]): void {
  const trimmed = list.slice(0, 30);
  safeLocalStorageSet(CUSTOM_LAYOUT_BLUEPRINTS_STORAGE_KEY, JSON.stringify(trimmed));
  setAppStateDB(CUSTOM_LAYOUT_BLUEPRINTS_DB_KEY, trimmed).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUSTOM_LAYOUT_BLUEPRINT_CHANGED_EVENT));
  }
}

export function getActiveLayoutBlueprintId(): string | null {
  try {
    const id = localStorage.getItem(ACTIVE_LAYOUT_BLUEPRINT_ID_STORAGE_KEY);
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

export function setActiveLayoutBlueprintId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_LAYOUT_BLUEPRINT_ID_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_LAYOUT_BLUEPRINT_ID_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
  setAppStateDB(ACTIVE_LAYOUT_BLUEPRINT_ID_DB_KEY, id || null).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUSTOM_LAYOUT_BLUEPRINT_CHANGED_EVENT));
  }
}

export function getActiveLayoutBlueprint(): CustomLayoutBlueprint | null {
  const activeId = getActiveLayoutBlueprintId();
  if (!activeId) return null;
  const all = getSavedLayoutBlueprints();
  return all.find((b) => b.id === activeId) || null;
}

export async function hydrateLayoutBlueprintsFromDB(): Promise<{
  blueprints: CustomLayoutBlueprint[];
  activeId: string | null;
}> {
  const localList = getSavedLayoutBlueprints();
  const localActiveId = getActiveLayoutBlueprintId();
  try {
    const [dbList, dbActiveId] = await Promise.all([
      getAppStateDB<CustomLayoutBlueprint[]>(CUSTOM_LAYOUT_BLUEPRINTS_DB_KEY, []),
      getAppStateDB<string | null>(ACTIVE_LAYOUT_BLUEPRINT_ID_DB_KEY, null)
    ]);

    const mergedMap = new Map<string, CustomLayoutBlueprint>();
    (Array.isArray(dbList) ? dbList : []).forEach((b) => mergedMap.set(b.id, b));
    localList.forEach((b) => {
      const existing = mergedMap.get(b.id);
      if (!existing || (b.updatedAt || 0) >= (existing.updatedAt || 0)) {
        mergedMap.set(b.id, b);
      }
    });
    const mergedList = Array.from(mergedMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    if (mergedList.length > 0) {
      safeLocalStorageSet(CUSTOM_LAYOUT_BLUEPRINTS_STORAGE_KEY, JSON.stringify(mergedList));
    }

    const resolvedActiveId =
      (localActiveId && mergedList.some((b) => b.id === localActiveId) ? localActiveId : null) ||
      (dbActiveId && mergedList.some((b) => b.id === dbActiveId) ? dbActiveId : null);

    if (resolvedActiveId) {
      try {
        localStorage.setItem(ACTIVE_LAYOUT_BLUEPRINT_ID_STORAGE_KEY, resolvedActiveId);
      } catch {
        // ignore
      }
    }

    return { blueprints: mergedList, activeId: resolvedActiveId };
  } catch {
    return { blueprints: localList, activeId: localActiveId };
  }
}

// =========================================================================
// SHARED ROW PROJECTION (maps 4-col LessonRow into 2/3/4/5 blueprint columns)
// =========================================================================

export interface ProjectedBlueprintCell {
  align: 'left' | 'center';
  bold?: boolean;
  /** Ordered content blocks inside this cell so text + images stay in logical sequence */
  blocks: Array<{
    badge?: string;
    text?: string;
    images?: DiagramAttachment[];
    /** Which original column this block came from (used by Word export image sizing/inline map) */
    sourceCol: 'stt' | 'c1' | 'lvd' | 'c3' | 'c4';
  }>;
}

export function extractRowAttachments(row: LessonRow): {
  c1Images: DiagramAttachment[];
  c3Images: DiagramAttachment[];
  c4Images: DiagramAttachment[];
} {
  const c1Images: DiagramAttachment[] =
    row.contentImages && row.contentImages.length > 0
      ? row.contentImages
      : row.contentImgUrl
      ? [{ id: 'c1_single', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh động tác' }]
      : [];

  const c3Images: DiagramAttachment[] =
    row.gvImages && row.gvImages.length > 0
      ? row.gvImages
      : row.gvImgUrl
      ? [{ id: 'c3_single', url: row.gvImgUrl, title: row.gvImgTitle || 'Hình minh họa GV' }]
      : [];

  const c4Images: DiagramAttachment[] =
    row.hsImages && row.hsImages.length > 0
      ? row.hsImages
      : row.hsImgUrl
      ? [{ id: 'c4_single', url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ đội hình' }]
      : [];

  return {
    c1Images: c1Images.filter((a) => Boolean(a?.url?.trim())),
    c3Images: c3Images.filter((a) => Boolean(a?.url?.trim())),
    c4Images: c4Images.filter((a) => Boolean(a?.url?.trim()))
  };
}

export function projectRowForBlueprint(
  row: LessonRow,
  rowIdx: number,
  mode: BlueprintColumnMode,
  customAttachments?: {
    c1Images?: DiagramAttachment[];
    c3Images?: DiagramAttachment[];
    c4Images?: DiagramAttachment[];
  }
): ProjectedBlueprintCell[] {
  const extracted = extractRowAttachments(row);
  const c1Images = customAttachments?.c1Images ?? extracted.c1Images;
  const c3Images = customAttachments?.c3Images ?? extracted.c3Images;
  const c4Images = customAttachments?.c4Images ?? extracted.c4Images;
  const lvdClean = (row.lvd || '').trim();

  switch (mode) {
    case '2col_gv_hs':
      return [
        {
          align: 'left',
          blocks: [
            {
              badge: lvdClean ? `Nội dung (${lvdClean.replace(/\n+/g, ' · ')})` : 'Nội dung',
              text: row.content || '',
              images: c1Images,
              sourceCol: 'c1'
            },
            {
              badge: 'Hoạt động của Giáo viên',
              text: row.gv || '',
              images: c3Images,
              sourceCol: 'c3'
            }
          ]
        },
        {
          align: 'left',
          blocks: [
            {
              text: row.hs || '',
              images: c4Images,
              sourceCol: 'c4'
            }
          ]
        }
      ];

    case '2col_nd_tc':
      return [
        {
          align: 'left',
          blocks: [
            {
              text: row.content || '',
              images: c1Images,
              sourceCol: 'c1'
            },
            ...(lvdClean
              ? [
                  {
                    badge: 'LVĐ',
                    text: lvdClean,
                    sourceCol: 'lvd' as const
                  }
                ]
              : [])
          ]
        },
        {
          align: 'left',
          blocks: [
            {
              badge: 'Hoạt động của Giáo viên',
              text: row.gv || '',
              images: c3Images,
              sourceCol: 'c3'
            },
            {
              badge: 'Hoạt động của Học sinh & Đội hình',
              text: row.hs || '',
              images: c4Images,
              sourceCol: 'c4'
            }
          ]
        }
      ];

    case '3col_nd_lvd_tc':
      return [
        {
          align: 'left',
          blocks: [
            {
              text: row.content || '',
              images: c1Images,
              sourceCol: 'c1'
            }
          ]
        },
        {
          align: 'center',
          bold: true,
          blocks: [
            {
              text: lvdClean,
              sourceCol: 'lvd'
            }
          ]
        },
        {
          align: 'left',
          blocks: [
            {
              badge: 'Giáo viên',
              text: row.gv || '',
              images: c3Images,
              sourceCol: 'c3'
            },
            {
              badge: 'Học sinh & Sơ đồ',
              text: row.hs || '',
              images: c4Images,
              sourceCol: 'c4'
            }
          ]
        }
      ];

    case '3col_nd_gv_hs':
      return [
        {
          align: 'left',
          blocks: [
            {
              text: row.content || '',
              images: c1Images,
              sourceCol: 'c1'
            },
            ...(lvdClean
              ? [
                  {
                    badge: 'Thời lượng / LVĐ',
                    text: lvdClean,
                    sourceCol: 'lvd' as const
                  }
                ]
              : [])
          ]
        },
        {
          align: 'left',
          blocks: [
            {
              text: row.gv || '',
              images: c3Images,
              sourceCol: 'c3'
            }
          ]
        },
        {
          align: 'left',
          blocks: [
            {
              text: row.hs || '',
              images: c4Images,
              sourceCol: 'c4'
            }
          ]
        }
      ];

    case '5col_stt':
      return [
        {
          align: 'center',
          bold: true,
          blocks: [{ text: String(rowIdx + 1), sourceCol: 'stt' }]
        },
        {
          align: 'left',
          blocks: [{ text: row.content || '', images: c1Images, sourceCol: 'c1' }]
        },
        {
          align: 'center',
          bold: true,
          blocks: [{ text: lvdClean, sourceCol: 'lvd' }]
        },
        {
          align: 'left',
          blocks: [{ text: row.gv || '', images: c3Images, sourceCol: 'c3' }]
        },
        {
          align: 'left',
          blocks: [{ text: row.hs || '', images: c4Images, sourceCol: 'c4' }]
        }
      ];

    case '4col_standard':
    default:
      return [
        {
          align: 'left',
          blocks: [{ text: row.content || '', images: c1Images, sourceCol: 'c1' }]
        },
        {
          align: 'center',
          bold: true,
          blocks: [{ text: lvdClean, sourceCol: 'lvd' }]
        },
        {
          align: 'left',
          blocks: [{ text: row.gv || '', images: c3Images, sourceCol: 'c3' }]
        },
        {
          align: 'left',
          blocks: [{ text: row.hs || '', images: c4Images, sourceCol: 'c4' }]
        }
      ];
  }
}

/* ============================================================================
 * AUTO FORMATION ANALYZER & WEEKLY PLAN EXTRACTOR FOR TEMPLATE LAB (TAB 7)
 * ========================================================================== */

function mapGradeToFormationStyleGrade(gradeNum: number): 1 | 2 | 3 | 4 | 5 {
  if (!Number.isFinite(gradeNum) || gradeNum <= 1) return 1;
  if (gradeNum === 2) return 2;
  if (gradeNum === 3) return 3;
  if (gradeNum === 4) return 4;
  // Grades 5..12 (including THCS 6-9 / THPT 10-12) use mature Grade 5 self-managed formations
  return 5;
}

function pickFormationForImportedRow(
  row: LessonRow,
  rowIdx: number,
  totalRows: number,
  gradeNum: number
): { diagram: FormationDiagram; reason: string } {
  const combined = `${row.content || ''}\n${row.gv || ''}\n${row.hs || ''}`;
  const lower = combined.toLowerCase();
  const contentLower = (row.content || '').toLowerCase();
  const styleGrade = mapGradeToFormationStyleGrade(gradeNum);

  // Check teacher's own custom saved formations first if there's an explicit strong keyword match
  const customFormations = getSavedCustomFormations();
  if (customFormations.length > 0) {
    const matchedCustom = customFormations.find((cf) => {
      const cfName = (cf.name || '').toLowerCase().trim();
      return cfName.length >= 6 && lower.includes(cfName);
    });
    if (matchedCustom) {
      return {
        diagram: matchedCustom,
        reason: `Khớp trực tiếp sơ đồ tự tạo trong Kho: "${matchedCustom.name}"`
      };
    }
  }

  // 1. Trò chơi vận động (specific game formations take priority)
  const isGameRow =
    /(?:trò\s*chơi|tiếp\s*sức|kéo\s*co|cướp\s*cờ|mèo\s*đuổi\s*chuột|lò\s*cò|thỏ\s*(?:nhường|đổi)\s*hang|ném\s*bóng|bật\s*ô|chuyền\s*gậy|tam\s*giác)/i.test(
      contentLower
    ) || /(?:tổ\s*chức\s*trò\s*chơi|luật\s*chơi|cách\s*chơi)/i.test(lower);
  if (isGameRow) {
    const d = getFormationDiagramByKeyword(combined, 'tro_choi', styleGrade);
    return {
      diagram: d,
      reason: `Phát hiện hoạt động Trò chơi vận động → chèn "${d.name}"`
    };
  }

  // 2. Hồi tĩnh / Thả lỏng / Vận dụng / Xuống lớp / Kết thúc
  if (
    /(?:hồi\s*tĩnh|thả\s*lỏng|kết\s*thúc|xuống\s*lớp|vận\s*dụng|củng\s*cố|dặn\s*dò|nhận\s*xét\s*(?:tiết|giờ)\s*học)/i.test(
      contentLower
    ) ||
    (rowIdx === totalRows - 1 && totalRows >= 4 && /thả\s*lỏng|hồi\s*tĩnh|nhận\s*xét|vận\s*dụng/i.test(lower))
  ) {
    const d = getFormationDiagramForPhaseAndGrade('hoi_tinh', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Vận dụng / Hồi tĩnh – Thả lỏng → chèn "${d.name}"`
    };
  }

  // 3. Mở đầu: Khởi động vs Nhận lớp
  if (/(?:khởi\s*động|xoay\s*(?:các\s*)?khớp|ép\s*dọc|ép\s*ngang|chạy\s*bước\s*nhỏ|nâng\s*cao\s*đùi|gót\s*chạm\s*mông)/i.test(contentLower)) {
    const d = getFormationDiagramForPhaseAndGrade('khoi_dong', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Khởi động (giãn cách so le) → chèn "${d.name}"`
    };
  }
  if (
    /(?:nhận\s*lớp|mở\s*đầu|ổn\s*định\s*tổ\s*chức|báo\s*cáo\s*sĩ\s*số|phổ\s*biến\s*(?:mục\s*tiêu|nhiệm\s*vụ))/i.test(
      contentLower
    ) ||
    rowIdx === 0
  ) {
    if (/khởi\s*động|xoay\s*khớp/i.test(lower) && !/nhận\s*lớp|ổn\s*định/i.test(contentLower)) {
      const d = getFormationDiagramForPhaseAndGrade('khoi_dong', styleGrade);
      return {
        diagram: d,
        reason: `Hoạt động Mở đầu & Khởi động → chèn "${d.name}"`
      };
    }
    const d = getFormationDiagramForPhaseAndGrade('nhan_lop', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Mở đầu / Nhận lớp → chèn "${d.name}"`
    };
  }

  // 4. Thi đua / Trình diễn / Biểu diễn / Kiểm tra đánh giá
  if (/(?:thi\s*đua|trình\s*diễn|biểu\s*diễn|kiểm\s*tra|đánh\s*giá\s*kết\s*quả|thi\s*đấu\s*tập)/i.test(contentLower)) {
    const d = getFormationDiagramForPhaseAndGrade('thi_dua', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Thi đua / Trình diễn / Đánh giá → chèn "${d.name}"`
    };
  }

  // 5. Hình thành kiến thức mới / Quan sát mẫu / Làm mẫu kỹ thuật
  if (
    /(?:hình\s*thành\s*kiến\s*thức|kiến\s*thức\s*mới|khám\s*phá|làm\s*mẫu|thị\s*phạm|giới\s*thiệu\s*kỹ\s*thuật|quan\s*sát\s*tranh|phân\s*tích\s*kỹ\s*thuật)/i.test(
      contentLower
    ) ||
    /^(?:2\.|hoạt\s*động\s*2)/i.test(contentLower.trim())
  ) {
    const d = getFormationDiagramForPhaseAndGrade('tap_mau', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Hình thành kiến thức mới / Quan sát mẫu → chèn "${d.name}"`
    };
  }

  // 6. Luyện tập (phân loại chi tiết: Cặp đôi · Tổ/Nhóm · Cá nhân · Đồng loạt)
  if (/(?:cặp\s*đôi|theo\s*cặp|đôi\s*một|hai\s*bạn|đối\s*diện)/i.test(lower)) {
    const d = getFormationDiagramForPhaseAndGrade('cap_doi', styleGrade);
    return {
      diagram: d,
      reason: `Luyện tập theo cặp đôi → chèn "${d.name}"`
    };
  }
  if (/(?:theo\s*tổ|tổ\s*nhóm|chia\s*nhóm|luyện\s*tập\s*nhóm|4\s*tổ|nhóm\s*trưởng|khu\s*vực\s*tập)/i.test(lower)) {
    const d = getFormationDiagramForPhaseAndGrade('to_nhom', styleGrade);
    return {
      diagram: d,
      reason: `Luyện tập theo tổ / nhóm → chèn "${d.name}"`
    };
  }
  if (/(?:cá\s*nhân|tự\s*tập|tự\s*giác\s*luyện\s*tập|độc\s*lập)/i.test(lower)) {
    const d =
      standardFormationDiagrams.find((f) => f.id === 'f_p_tap_ca_nhan') ||
      getFormationDiagramForPhaseAndGrade('dong_loat', styleGrade);
    return {
      diagram: d,
      reason: `Luyện tập cá nhân → chèn "${d.name}"`
    };
  }
  if (
    /(?:luyện\s*tập|đồng\s*loạt|cả\s*lớp|tập\s*luyện|xuất\s*phát|chạy\s*cự\s*ly|chạy\s*lao|nhảy\s*cao|nhảy\s*xa|cầu\s*lông|bóng\s*đá|đá\s*cầu|bài\s*thể\s*dục)/i.test(
      lower
    )
  ) {
    // Check explicit line formations (1/2/3/4 hàng dọc/ngang) if mentioned
    if (/(?:1|2|3)\s*hàng\s*(?:dọc|ngang)/i.test(lower)) {
      const d = getFormationDiagramByKeyword(combined, 'dong_loat', styleGrade);
      return {
        diagram: d,
        reason: `Khớp mô tả đội hình trong bài → chèn "${d.name}"`
      };
    }
    const d = getFormationDiagramForPhaseAndGrade('dong_loat', styleGrade);
    return {
      diagram: d,
      reason: `Hoạt động Luyện tập đồng loạt / toàn lớp → chèn "${d.name}"`
    };
  }

  // 7. Fallback by keyword or row position
  const posPhase: FormationDiagram['phase'] =
    rowIdx === 0
      ? 'nhan_lop'
      : rowIdx === 1
      ? 'tap_mau'
      : rowIdx >= totalRows - 1
      ? 'hoi_tinh'
      : 'dong_loat';
  const fallbackDiagram = getFormationDiagramByKeyword(combined, posPhase, styleGrade);
  return {
    diagram: fallbackDiagram,
    reason: `Phân tích tiến trình hoạt động → gợi ý "${fallbackDiagram.name}"`
  };
}

/**
 * Automatically analyzes every activity row of an imported lesson plan and inserts
 * matching formation diagrams from the app's Formation Library into Column 4 (HS & Sơ đồ).
 */
export function autoAnalyzeAndInsertFormationsForRows(
  rows: LessonRow[],
  gradeNum: number,
  options?: { forceReplaceAuto?: boolean }
): {
  rows: LessonRow[];
  insertedCount: number;
  matchLog: ImportedFormationMatchLogItem[];
} {
  const forceReplaceAuto = options?.forceReplaceAuto ?? false;
  const matchLog: ImportedFormationMatchLogItem[] = [];
  let insertedCount = 0;

  const enrichedRows: LessonRow[] = (rows || []).map((row, idx) => {
    const existingHsImages: DiagramAttachment[] = Array.isArray(row.hsImages)
      ? [...row.hsImages]
      : row.hsImgUrl
      ? [{ id: `existing_hs_${idx}`, url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ đội hình' }]
      : [];

    // Preserve manual teacher choices unless explicitly forced
    const hasTeacherPinnedDiagram =
      row.userClearedHsImages ||
      existingHsImages.some((im) => im.userPinned || (im.id && !im.id.startsWith('auto_lib_form_')));

    if (hasTeacherPinnedDiagram && existingHsImages.length > 0 && !forceReplaceAuto) {
      return row;
    }
    if (row.userClearedHsImages && !forceReplaceAuto) {
      return row;
    }

    const { diagram, reason } = pickFormationForImportedRow(row, idx, rows.length, gradeNum);
    const autoAttachment: DiagramAttachment = {
      id: `auto_lib_form_${diagram.id}_${idx}`,
      url: diagram.svgDataUrl,
      title: diagram.name
    };

    const nextHsImages = forceReplaceAuto
      ? [autoAttachment]
      : existingHsImages.length > 0
      ? existingHsImages
      : [autoAttachment];

    if (nextHsImages[0]?.id === autoAttachment.id) {
      insertedCount += 1;
      matchLog.push({
        rowIdx: idx,
        diagramId: diagram.id,
        diagramName: diagram.name,
        reason
      });
    }

    return {
      ...row,
      hsImages: nextHsImages,
      hsImgUrl: nextHsImages[0]?.url,
      hsImgTitle: nextHsImages[0]?.title,
      userClearedHsImages: false
    };
  });

  return { rows: enrichedRows, insertedCount, matchLog };
}

function extractGameNameFromLessonText(text: string): string | undefined {
  const m = text.match(
    /(?:trò\s*chơi(?:\s*vận\s*động|\s*bổ\s*trợ)?)\s*[:\-–“"']?\s*([^\n.;()]{4,65})/i
  );
  if (!m || !m[1]) return undefined;
  const candidate = cleanText(m[1]).replace(/^["'“”‘’]+|["'“”‘’.,:;]+$/g, '');
  if (!candidate || /^(?:vận\s*động|bổ\s*trợ|theo\s*nhóm|tập\s*thể)$/i.test(candidate)) {
    return undefined;
  }
  return candidate;
}

function getPageHintBeforeIndex(fullTextWithMarkers: string, index: number): number | undefined {
  const prefix = fullTextWithMarkers.slice(Math.max(0, index - 4000), index + 80);
  const matches = Array.from(prefix.matchAll(/\[\[PAGE:(\d+)\]\]/g));
  if (matches.length === 0) return undefined;
  const last = matches[matches.length - 1];
  return parseInt(last[1], 10);
}

/**
 * Extracts a full ImportedTemplateWorkspace (including multi-week / multi-period schedule
 * for large full-year files like a 35-week GDTC 8 PDF, or a clean 1-entry schedule for single-lesson files)
 * and automatically matches suitable formation diagrams for the active lesson.
 */
export function extractImportedWorkspaceFromParsed(
  blueprint: CustomLayoutBlueprint,
  parsedContent: ParsedLessonFileResult,
  rawFullText: string
): ImportedTemplateWorkspace {
  const fullText = rawFullText || parsedContent.fullText || parsedContent.rawTextExcerpt || '';
  const cleanAll = fullText.replace(/\[\[PAGE:\d+\]\]\n?/g, '');

  // Detect actual grade (supports 1..12 including THCS 6-9 & THPT 10-12)
  const fileNameGradeMatch = (parsedContent.sourceFileName || '').match(/(?:gdtc|lop|khoi|k)[_\-\s.]*(\d{1,2})\b/i);
  const textGradeMatch = cleanAll
    .slice(0, 4000)
    .match(/(?:khối|lớp|gdtc|giáo\s*dục\s*thể\s*chất)\s*[:\-–]?\s*(\d{1,2})\b/i);
  const detectedGradeNum = (() => {
    if (parsedContent.rawGrade && parsedContent.rawGrade >= 1 && parsedContent.rawGrade <= 12) {
      // If text header specifically had Grade 6..12 or fileName had GDTC-8, prefer the non-1 match
      if (parsedContent.rawGrade > 1) return parsedContent.rawGrade;
    }
    const fnG = fileNameGradeMatch ? parseInt(fileNameGradeMatch[1], 10) : 0;
    if (fnG >= 1 && fnG <= 12) return fnG;
    const txG = textGradeMatch ? parseInt(textGradeMatch[1], 10) : 0;
    if (txG >= 1 && txG <= 12) return txG;
    return parsedContent.rawGrade || parsedContent.grade || 1;
  })();
  const detectedGradeLabel = `Khối ${detectedGradeNum}`;

  // Attempt multi-lesson / multi-week boundary detection
  // Matches patterns like:
  // - "Tuần 01_ Tiết PPCT: 01" / "Tuần 1 - Tiết 2" / "TUẦN 12 · TIẾT PPCT: 23"
  const boundaryRegex =
    /(?:^|\n)[^\n]{0,50}\bTuần\s*[:\-_.]?\s*0?(\d{1,2})\s*(?:[_\-–|:.,/\s]+)\s*Tiết(?:\s*(?:theo\s*)?PPCT)?\s*[:\-_.]?\s*0?(\d{1,3})\b/gi;

  const boundaryHits: Array<{ index: number; week: number; period: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = boundaryRegex.exec(fullText)) !== null) {
    const w = parseInt(m[1], 10);
    const p = parseInt(m[2], 10);
    if (w >= 1 && w <= 40 && p >= 1 && p <= 140) {
      // Avoid duplicate hits inside the same 400-char header block
      const prev = boundaryHits[boundaryHits.length - 1];
      if (!prev || (m.index - prev.index > 350 && !(prev.week === w && prev.period === p))) {
        boundaryHits.push({ index: m.index, week: w, period: p });
      }
    }
  }

  const weeklySchedule: ImportedWeeklyPlanEntry[] = [];

  if (boundaryHits.length >= 2) {
    // Multi-week / multi-lesson document (e.g. 35-week / 70-period GDTC 8 PDF or bundled DOCX)
    const seenKey = new Set<string>();
    for (let i = 0; i < boundaryHits.length; i++) {
      const hit = boundaryHits[i];
      const nextIndex = i + 1 < boundaryHits.length ? boundaryHits[i + 1].index : fullText.length;
      const segKey = `w${hit.week}_p${hit.period}`;
      if (seenKey.has(segKey)) continue;
      seenKey.add(segKey);

      const rawSegWithMarkers = fullText.slice(hit.index, Math.min(nextIndex, hit.index + 16000));
      const cleanSeg = rawSegWithMarkers.replace(/\[\[PAGE:\d+\]\]\n?/g, '');
      const headerArea = cleanSeg.slice(0, 1400);

      const topicMatch =
        headerArea.match(/CHỦ\s*ĐỀ\s*(?:\d+\s*)?[:\-–.]?\s*([^\n]{3,110})/i) ||
        headerArea.match(/KẾ\s*HOẠCH\s*BÀI\s*DẠY\s*[:\-–]?\s*([^\n]{3,110})/i);
      const lessonMatch =
        headerArea.match(/(?:BÀI|Bài)\s*\d+\s*[:.\-–]?\s*([^\n]{3,130})/i) ||
        headerArea.match(/TÊN\s*BÀI(?:\s*HỌC)?\s*[:\-–]?\s*([^\n]{3,130})/i);

      const parsedTopic = topicMatch ? cleanText(topicMatch[0].replace(/^KẾ\s*HOẠCH\s*BÀI\s*DẠY\s*[:\-–]?\s*/i, '')) : `Chủ đề Tuần ${hit.week}`;
      const parsedLessonTitle = lessonMatch
        ? cleanText(lessonMatch[0].replace(/^TÊN\s*BÀI(?:\s*HỌC)?\s*[:\-–]?\s*/i, ''))
        : `Tiết ${hit.period} (Tuần ${hit.week})`;
      const gameName = extractGameNameFromLessonText(cleanSeg);
      const pageHint = getPageHintBeforeIndex(fullText, hit.index);

      // Parse full lesson rows for the first entry immediately; for entries 2..N parse fast right here
      const segParsed = parseTextLessonPlanMultiTask(
        cleanSeg,
        `${parsedContent.sourceFileName || 'GiaoAn'}_T${hit.week}_P${hit.period}`,
        parsedContent.fileType || 'pdf'
      );

      weeklySchedule.push({
        id: `imp_w${hit.week}_p${hit.period}_${i}`,
        week: hit.week,
        period: hit.period,
        gradeNum: detectedGradeNum,
        gradeLabel: detectedGradeLabel,
        topic: parsedTopic,
        lessonTitle: parsedLessonTitle,
        gameName,
        pageHint,
        dateRange: segParsed.dateRange,
        objectivesSummary: segParsed.specialCompetencies?.basicMovement,
        equipmentSummary: segParsed.locationEquipment?.teacherTools,
        rows: segParsed.rows,
        formationsAutoMatched: false
      });
    }
  } else {
    // Single-lesson file (standard .docx / .pdf / pasted text)
    const singleGame = extractGameNameFromLessonText(cleanAll);
    weeklySchedule.push({
      id: `imp_single_w${parsedContent.week || 1}_p${parsedContent.lessonNum || 1}`,
      week: parsedContent.week || 1,
      period: parsedContent.lessonNum || 1,
      gradeNum: detectedGradeNum,
      gradeLabel: detectedGradeLabel,
      topic: parsedContent.topic || 'CHỦ ĐỀ BÀI HỌC',
      lessonTitle:
        parsedContent.title ||
        parsedContent.name ||
        (parsedContent.sourceFileName || 'Giáo án nhập vào').replace(/\.[^/.]+$/, ''),
      gameName: singleGame,
      pageHint: 1,
      dateRange: parsedContent.dateRange,
      objectivesSummary: parsedContent.specialCompetencies?.basicMovement,
      equipmentSummary: parsedContent.locationEquipment?.teacherTools,
      rows: JSON.parse(JSON.stringify(parsedContent.rows || [])),
      formationsAutoMatched: false
    });
  }

  // Sort weekly schedule chronologically and compute endPageHint for each lesson
  weeklySchedule.sort((a, b) => a.week - b.week || a.period - b.period);
  for (let i = 0; i < weeklySchedule.length; i++) {
    const curr = weeklySchedule[i];
    const next = weeklySchedule[i + 1];
    if (curr.pageHint) {
      if (next && next.pageHint && next.pageHint > curr.pageHint) {
        curr.endPageHint = next.pageHint - 1;
      } else if (next && next.pageHint === curr.pageHint) {
        curr.endPageHint = curr.pageHint;
      } else if (parsedContent.totalPages && parsedContent.totalPages >= curr.pageHint) {
        curr.endPageHint = Math.min(parsedContent.totalPages, curr.pageHint + 8);
      }
    }
  }

  // Immediately run smart formation auto-matching on the first (active) lesson!
  let autoInsertedFormationsCount = 0;
  if (weeklySchedule.length > 0) {
    const first = weeklySchedule[0];
    const autoRes = autoAnalyzeAndInsertFormationsForRows(first.rows, first.gradeNum);
    first.rows = autoRes.rows;
    first.formationsAutoMatched = true;
    first.autoFormationLog = autoRes.matchLog;
    autoInsertedFormationsCount = autoRes.insertedCount;
  }

  return {
    blueprintId: blueprint.id,
    fileName: parsedContent.sourceFileName || blueprint.sourceFileName || blueprint.name,
    receivedAt: Date.now(),
    detectedGradeNum,
    detectedGradeLabel,
    totalPages: parsedContent.totalPages,
    weeklySchedule,
    selectedEntryId: weeklySchedule[0]?.id || '',
    autoInsertedFormationsCount,
    teacherUploadedImagesCount: (weeklySchedule[0]?.rows || []).reduce(
      (sum, r) => sum + (Array.isArray(r.contentImages) ? r.contentImages.length : r.contentImgUrl ? 1 : 0),
      0
    )
  };
}

/**
 * Parses an optional standalone Weekly Plan / PPCT file (.docx, .pdf, .html, .txt)
 * so teachers who uploaded a 1-lesson template can also feed their weekly plan into Tab 7.
 */
export async function parseExternalWeeklyPlanFile(
  file: File,
  fallbackGradeNum: number,
  templateRows: LessonRow[]
): Promise<ImportedWeeklyPlanEntry[]> {
  const parsed = await parseLessonFile(file);
  const fullText = (parsed.fullText || parsed.rawTextExcerpt || '').replace(/\[\[PAGE:\d+\]\]\n?/g, '');
  const entries: ImportedWeeklyPlanEntry[] = [];
  const seen = new Set<string>();

  // Scan line-by-line for "Tuần X ... Tiết Y ... Tên bài"
  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  let activeWeek = parsed.week || 1;
  let activeTopic = parsed.topic || 'Chủ đề bài học';

  lines.forEach((ln, idx) => {
    const topicHit = ln.match(/(?:CHỦ\s*ĐỀ\s*(?:\d+\s*)?[:\-–.]?\s*[^\n\t|]{4,90})/i);
    if (topicHit) {
      activeTopic = cleanText(topicHit[0]);
    }
    const wMatch = ln.match(/Tuần\s*[:\-_.]?\s*0?(\d{1,2})\b/i);
    if (wMatch) {
      activeWeek = parseInt(wMatch[1], 10);
    }
    const pMatch = ln.match(/Tiết(?:\s*(?:theo\s*)?PPCT)?\s*[:\-_.]?\s*0?(\d{1,3})\b/i);
    const bMatch = ln.match(/(?:Bài\s*\d+\s*[:.\-–]?\s*[^\t|]{4,120})/i);

    if (pMatch || bMatch) {
      const period = pMatch ? parseInt(pMatch[1], 10) : entries.length + 1;
      const key = `ext_w${activeWeek}_p${period}`;
      if (seen.has(key)) return;
      seen.add(key);

      const lessonTitle = bMatch
        ? cleanText(bMatch[0])
        : cleanText(ln.replace(/Tuần\s*[:\-_.]?\s*0?\d+/i, '').replace(/Tiết(?:\s*PPCT)?\s*[:\-_.]?\s*0?\d+/i, '')) ||
          `Bài học Tuần ${activeWeek} – Tiết ${period}`;

      const clonedRows: LessonRow[] = JSON.parse(JSON.stringify(templateRows || []));
      entries.push({
        id: `ext_plan_${activeWeek}_${period}_${idx}`,
        week: activeWeek,
        period,
        gradeNum: fallbackGradeNum,
        gradeLabel: `Khối ${fallbackGradeNum}`,
        topic: activeTopic,
        lessonTitle,
        gameName: extractGameNameFromLessonText(ln),
        rows: clonedRows,
        formationsAutoMatched: false
      });
    }
  });

  if (entries.length === 0) {
    // Fallback: create 1 entry from parsed content
    entries.push({
      id: `ext_single_${Date.now()}`,
      week: parsed.week || 1,
      period: parsed.lessonNum || 1,
      gradeNum: fallbackGradeNum,
      gradeLabel: `Khối ${fallbackGradeNum}`,
      topic: parsed.topic || 'Kế hoạch tuần nhập thêm',
      lessonTitle: parsed.title || file.name.replace(/\.[^/.]+$/, ''),
      rows: parsed.rows && parsed.rows.length > 0 ? parsed.rows : JSON.parse(JSON.stringify(templateRows || [])),
      formationsAutoMatched: false
    });
  }

  return entries.sort((a, b) => a.week - b.week || a.period - b.period);
}

export async function loadTemplateLabWorkspacesAsync(): Promise<Record<string, ImportedTemplateWorkspace>> {
  try {
    const dbVal = await getAppStateDB<Record<string, ImportedTemplateWorkspace>>(TEMPLATE_LAB_WORKSPACES_DB_KEY, {});
    if (dbVal && typeof dbVal === 'object') {
      return dbVal;
    }
  } catch {
    // ignore
  }
  return {};
}

export async function saveTemplateLabWorkspacesAsync(
  workspaces: Record<string, ImportedTemplateWorkspace>
): Promise<void> {
  try {
    await setAppStateDB(TEMPLATE_LAB_WORKSPACES_DB_KEY, workspaces);
  } catch {
    // ignore
  }
}

