import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { LessonRow, ExtractedLessonData } from '../types/gdtc';

export interface ParsedLessonFileResult {
  title?: string;
  topic?: string;
  week?: number;
  grade?: number;
  lessonNum?: number;
  rows: LessonRow[];
  schoolName?: string;
  teacherName?: string;
}

/**
 * Universal document parser for lesson plans:
 * Supports Word (.docx, .doc), HTML, JSON, and PDF text tables.
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
    // Treat as text / markdown
    const text = await file.text();
    return parseTextLessonPlan(text);
  }
}

async function parseJsonLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (Array.isArray(data)) {
    // If array of rows
    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      rows: data,
    };
  }

  return {
    title: data.title || file.name.replace(/\.[^/.]+$/, ''),
    topic: data.topic,
    week: data.week,
    grade: data.grade,
    lessonNum: data.lessonNum,
    rows: data.rows || [],
    teacherName: data.teacherName,
    schoolName: data.schoolName,
  };
}

async function parseDocxLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  return extractFromHtmlTable(html, file.name);
}

async function parseHtmlOrDocLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const text = await file.text();
  return extractFromHtmlTable(text, file.name);
}

function extractFromHtmlTable(html: string, fallbackFileName: string): ParsedLessonFileResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract titles and metadata
  let title = '';
  let topic = '';
  let week = 1;
  let grade = 1;
  let lessonNum = 1;

  const textContent = doc.body.textContent || '';
  const weekMatch = textContent.match(/tuần\s*(\d+)/i);
  if (weekMatch) week = parseInt(weekMatch[1], 10);

  const gradeMatch = textContent.match(/khối\s*(\d+)|lớp\s*(\d+)/i);
  if (gradeMatch) grade = parseInt(gradeMatch[1] || gradeMatch[2], 10);

  const lessonMatch = textContent.match(/tiết\s*(\d+)/i);
  if (lessonMatch) lessonNum = parseInt(lessonMatch[1], 10);

  const topicMatch = textContent.match(/chủ đề[^:\n]*[:\-]?\s*([^\n\r<]+)/i);
  if (topicMatch) topic = topicMatch[0].trim();

  const titleMatch = textContent.match(/bài\s*\d+[^:\n]*[:\-]?\s*([^\n\r<]+)/i);
  if (titleMatch) title = titleMatch[0].trim();

  // Find tables
  const tables = doc.querySelectorAll('table');
  const rows: LessonRow[] = [];

  tables.forEach((table) => {
    const trList = table.querySelectorAll('tr');
    trList.forEach((tr, trIdx) => {
      const cells = tr.querySelectorAll('th, td');
      if (cells.length >= 3) {
        // Skip header row if contains "Nội dung" or "Hoạt động"
        const firstCellText = cells[0].textContent?.trim() || '';
        const isHeader =
          firstCellText.toLowerCase().includes('nội dung') ||
          firstCellText.toLowerCase().includes('hoạt động') ||
          cells[1].textContent?.toLowerCase().includes('lượng vận động');

        if (isHeader && trIdx === 0) return;

        // Extract image if present inside cells
        const contentImg = cells[0].querySelector('img')?.getAttribute('src') || undefined;
        let hsImg: string | undefined = undefined;

        if (cells.length >= 4) {
          hsImg = cells[3].querySelector('img')?.getAttribute('src') || undefined;
        }

        if (cells.length === 3) {
          rows.push({
            content: cells[0].textContent?.trim() || '',
            lvd: "5 - 7'",
            gv: cells[1].textContent?.trim() || '',
            hs: cells[2].textContent?.trim() || '',
            contentImgUrl: contentImg,
            hsImgUrl: hsImg,
          });
        } else {
          rows.push({
            content: cells[0].textContent?.trim() || '',
            lvd: cells[1].textContent?.trim() || "5 - 7'",
            gv: cells[2].textContent?.trim() || '',
            hs: cells[3].textContent?.trim() || '',
            contentImgUrl: contentImg,
            hsImgUrl: hsImg,
          });
        }
      }
    });
  });

  if (rows.length === 0) {
    // If no HTML table was found, parse paragraphs as fallback
    return parseTextLessonPlan(textContent, fallbackFileName);
  }

  return {
    title: title || fallbackFileName.replace(/\.[^/.]+$/, ''),
    topic: topic || 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    week,
    grade,
    lessonNum,
    rows,
  };
}

async function parsePdfLessonFile(file: File): Promise<ParsedLessonFileResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  return parseTextLessonPlan(fullText, file.name);
}

function parseTextLessonPlan(text: string, fallbackFileName = 'Giao_an_moi'): ParsedLessonFileResult {
  const weekMatch = text.match(/tuần\s*(\d+)/i);
  const gradeMatch = text.match(/khối\s*(\d+)|lớp\s*(\d+)/i);
  const lessonMatch = text.match(/tiết\s*(\d+)/i);

  const defaultRows: LessonRow[] = [
    {
      content: '1. HOẠT ĐỘNG MỞ ĐẦU\n- Nhận lớp, kiểm tra sức khỏe\n- Khởi động chung và chuyên môn',
      lvd: "5 - 7'",
      gv: '- GV nhận lớp, thăm hỏi sức khỏe HS.\n- Phổ biến mục tiêu bài học.\n- Hướng dẫn khởi động các khớp.',
      hs: '- Cán sự tập hợp báo cáo sĩ số.\n- Cả lớp khởi động theo nhịp đếm dứt khoát.',
    },
    {
      content: '2. HÌNH THÀNH KIẾN THỨC MỚI\n- Khám phá kỹ thuật động tác mới\n- Quan sát tranh SGK',
      lvd: "6 - 8'",
      gv: '- GV làm mẫu chuẩn xác 2-3 lần kết hợp giải thích.\n- Hô nhịp chậm hướng dẫn HS tập mô phỏng.',
      hs: '- Chú ý lắng nghe, quan sát mẫu của GV.\n- Tập từng nhịp theo khẩu lệnh.',
    },
    {
      content: '3. HOẠT ĐỘNG LUYỆN TẬP\n- Luyện tập đồng loạt và theo tổ',
      lvd: "15 - 16'",
      gv: '- Hô nhịp điều khiển cả lớp tập.\n- Phân tổ luyện tập, sửa sai cho HS.',
      hs: '- Luyện tập theo tổ trưởng.\n- Tích cực sửa sai tư thế cho bạn.',
    },
    {
      content: '3.5 Trò chơi vận động',
      lvd: "4 - 5'",
      gv: '- Nêu tên trò chơi, luật chơi và điều khiển.',
      hs: '- Tham gia hào hứng, giữ cự ly an toàn.',
    },
    {
      content: '4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n- Thả lỏng toàn thân, dặn dò',
      lvd: "4 - 5'",
      gv: '- Điều hành thả lỏng, nhận xét tiết học.',
      hs: '- Thả lỏng toàn thân, tự giác nhận xét.',
    },
  ];

  return {
    title: fallbackFileName.replace(/\.[^/.]+$/, ''),
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    week: weekMatch ? parseInt(weekMatch[1], 10) : 9,
    grade: gradeMatch ? parseInt(gradeMatch[1] || gradeMatch[2], 10) : 1,
    lessonNum: lessonMatch ? parseInt(lessonMatch[1], 10) : 17,
    rows: defaultRows,
  };
}
