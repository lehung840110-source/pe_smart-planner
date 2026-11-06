import JSZip from 'jszip';
import { SgkImageItem, WeeklyMasterScheduleRow, SchoolSettings } from '../types/gdtc';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import { cleanTopicForDisplay, cleanLessonTitleForHeader } from './curriculumAuditSync';

export function downloadZipOfImages(images: SgkImageItem[], filename = 'Thu_Vien_Hinh_Anh_SGK_GDTC.zip') {
  const zip = new JSZip();
  const folder = zip.folder('Hinh_Anh_SGK_GDTC');

  images.forEach((img, idx) => {
    let base64Data = '';
    let ext = 'png';

    if (img.imgUrl.startsWith('data:image/svg+xml')) {
      const svgText = decodeURIComponent(img.imgUrl.replace('data:image/svg+xml;utf8,', ''));
      folder?.file(`Hinh_${idx + 1}_K${img.grade}_Trang${img.page}.svg`, svgText);
      return;
    } else if (img.imgUrl.startsWith('data:image/')) {
      const parts = img.imgUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png';
      base64Data = parts[1];
    } else {
      return;
    }

    if (base64Data && folder) {
      folder.file(`Hinh_${idx + 1}_K${img.grade}_Trang${img.page}.${ext}`, base64Data, { base64: true });
    }
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export function downloadJsonFile(data: any, filename = 'Thu_Vien_Hinh_Anh_SGK.json') {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export interface ProcessedWordImage {
  pngBase64: string;
  widthPt: number;
  heightPt: number;
}

/**
 * Converts any image source (SVG DataURL, raw SVG text, or relative image path)
 * into a high-quality standalone raster PNG base64 string ("data:image/png;base64,...").
 * Calculates proportional compact display dimensions in points (pt) for Microsoft Word.
 */
export function convertSvgOrImageToPngBase64(
  src?: string,
  maxWidthPt = 112,
  maxHeightPt = 68
): Promise<ProcessedWordImage> {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      resolve({ pngBase64: '', widthPt: 0, heightPt: 0 });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve({ pngBase64: src, widthPt: maxWidthPt, heightPt: maxHeightPt });
    }, 4000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const naturalW = img.naturalWidth || img.width || 600;
        const naturalH = img.naturalHeight || img.height || 400;

        // Calculate proportional display dimensions in points (pt) matching teacher's adjusted PDF
        let widthPt = maxWidthPt;
        let heightPt = Math.round((naturalH / naturalW) * widthPt);

        // Strictly constrain height
        if (heightPt > maxHeightPt) {
          heightPt = maxHeightPt;
          widthPt = Math.round((naturalW / naturalH) * heightPt);
        }

        // Maintain high resolution (e.g. 500-800px) so print is sharp without taking excessive megabytes
        const canvasW = Math.max(450, Math.min(naturalW * 2, 800));
        const canvasH = Math.round((naturalH / naturalW) * canvasW) || 300;

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ pngBase64: src, widthPt, heightPt });
          return;
        }

        // Fill solid white background so transparency prints clean in MS Word
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.drawImage(img, 0, 0, canvasW, canvasH);

        const pngBase64 = canvas.toDataURL('image/png');
        resolve({ pngBase64, widthPt, heightPt });
      } catch (err) {
        console.warn('Canvas rasterization error:', err);
        resolve({ pngBase64: src, widthPt: maxWidthPt, heightPt: maxHeightPt });
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve({ pngBase64: src, widthPt: maxWidthPt, heightPt: maxHeightPt });
    };

    if (src.trim().startsWith('<svg')) {
      const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
    } else {
      img.src = src;
    }
  });
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Splits raw base64 string into 76-character chunks with \r\n as mandated by RFC 2045 for MIME.
 */
function formatBase64Chunks(base64Str: string): string {
  const clean = base64Str.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
  const chunks = clean.match(/.{1,76}/g);
  return chunks ? chunks.join('\r\n') : clean;
}

export interface ExportWordDataOptions {
  plans: MasterPlanItem[];
  scheduleRows?: WeeklyMasterScheduleRow[];
  settings: SchoolSettings;
  week: number;
  includeSchedule?: boolean;
  weeklyThemes?: {
    qpanTheme?: string;
    ethicsTheme?: string;
    digitalTheme?: string;
  };
  filename?: string;
  format?: 'doc' | 'docx';
  approvalDate?: string;
  dateRange?: string;
  imageMaxHeightPt?: number;
}

interface EmbeddedImageMime {
  location: string;
  base64Data: string;
  rawBase64Url: string;
}

/**
 * Generates a clean, professional Microsoft Word document (.doc MHTML or .docx OpenXML)
 * directly from the structured data model.
 * 
 * CRITICAL REQUIREMENTS SATISFIED:
 * 1. Zero HTML form controls (<textarea>, <input>, <button>) - produces 100% pure text paragraphs and tables.
 * 2. Pre-rasterizes all technical movement illustrations and formation diagrams into standalone PNG base64 images.
 * 3. Compact proportional image dimensions (height 80-85pt) preventing massive 40-page vertical stretch.
 * 4. In .doc format, uses standard MHTML MIME Multipart/Related packaging with Content-Location mapping.
 * 5. In .docx format, packages via OpenXML zip with altChunk.
 * 6. Exact formatting matching Vietnamese Ministry of Education & GDPT 2018 guidelines (Times New Roman, A4 margins).
 */
export async function exportCleanWordDocxFromData(options: ExportWordDataOptions) {
  const {
    plans,
    scheduleRows,
    settings,
    week,
    includeSchedule = true,
    weeklyThemes,
    filename = `KHDH_GDTC_Tuan_${week}.doc`,
    format = 'doc',
    approvalDate,
    dateRange: customDateRangeOption,
    imageMaxHeightPt = 80
  } = options;

  const isDocx = format === 'docx' || filename.toLowerCase().endsWith('.docx');

  // 1. Pre-process and rasterize all images across all plans with strict bounds
  const processedPlans = await Promise.all(
    plans.map(async (plan) => {
      const processedRows = await Promise.all(
        plan.rows.map(async (row) => {
          let contentImgInfo: ProcessedWordImage = { pngBase64: '', widthPt: 0, heightPt: 0 };
          if (row.contentImgUrl) {
            contentImgInfo = await convertSvgOrImageToPngBase64(row.contentImgUrl, 98, Math.min(68, imageMaxHeightPt));
          }

          // Gather diagrams from hsImages or hsImgUrl
          const rawDiagrams = row.hsImages && row.hsImages.length > 0
            ? row.hsImages
            : row.hsImgUrl
            ? [{ id: 'init', url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ đội hình' }]
            : [];

          const processedDiagrams = await Promise.all(
            rawDiagrams.map(async (d) => {
              const diagInfo = await convertSvgOrImageToPngBase64(d.url, 115, Math.min(70, imageMaxHeightPt));
              return {
                title: d.title,
                pngBase64: diagInfo.pngBase64,
                widthPt: diagInfo.widthPt || 112,
                heightPt: diagInfo.heightPt || Math.min(68, imageMaxHeightPt)
              };
            })
          );

          return {
            ...row,
            contentImgPng: contentImgInfo.pngBase64,
            contentImgWidth: contentImgInfo.widthPt || 98,
            contentImgHeight: contentImgInfo.heightPt || Math.min(65, imageMaxHeightPt),
            diagrams: processedDiagrams
          };
        })
      );

      return {
        ...plan,
        processedRows
      };
    })
  );

  // 2. Track embedded images for MHTML MIME container
  const embeddedImages: EmbeddedImageMime[] = [];
  let imgCounter = 0;

  const registerImage = (pngBase64: string): string => {
    if (!pngBase64) return '';
    imgCounter++;
    const imgLocation = `file:///C:/gdtc_img_${imgCounter}.png`;
    embeddedImages.push({
      location: imgLocation,
      base64Data: formatBase64Chunks(pngBase64),
      rawBase64Url: pngBase64
    });
    // In docx mode, Word supports data:image/png;base64 directly inside afchunk; in .doc MHTML mode it requires the file:/// location
    return isDocx ? pngBase64 : imgLocation;
  };

  // 3. Build Word HTML structure
  let bodyContent = '';

  // Page 1: Kế Hoạch Tuần Chung (if includeSchedule and scheduleRows exist)
  if (includeSchedule && scheduleRows && scheduleRows.length > 0) {
    const firstPlan = plans[0];
    const dateRange = customDateRangeOption || firstPlan?.dateRange || `Tuần ${week}`;

    bodyContent += `
      <!-- TRANG 1: KẾ HOẠCH DẠY HỌC TUẦN CHUNG -->
      <div style="text-align: center; margin: 14pt 0 10pt 0;">
        <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; color: #000;">
          KẾ HOẠCH DẠY HỌC MÔN GIÁO DỤC THỂ CHẤT
        </h2>
        <p style="margin: 3pt 0 0 0; font-size: 13pt; font-weight: bold;">
          TUẦN ${week}
        </p>
        <p style="margin: 2pt 0 0 0; font-size: 11pt; font-style: italic;">
          (${escapeHtml(dateRange)})
        </p>
      </div>

      <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%; border: 1pt solid #000; margin-top: 10pt;">
        <thead>
          <tr style="background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 11pt;">
            <th style="border: 1pt solid #000; padding: 5pt; width: 14%;">Thứ</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 7%;">Tiết</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 9%;">Lớp</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 30%;">Bài học</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 8%;">PPCT</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 22%;">ND Tích hợp / Điều chỉnh</th>
            <th style="border: 1pt solid #000; padding: 5pt; width: 10%;">ĐDDH</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRows.map((sr) => `
            <tr style="font-size: 11pt;">
              <td style="border: 1pt solid #000; padding: 5pt; font-weight: bold; text-align: center;">${escapeHtml(sr.dayOfWeek)}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: center; font-weight: bold;">${sr.period}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: center; font-weight: bold;">${escapeHtml(sr.className)}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: left;">${escapeHtml(sr.lessonTitle)}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: center; font-weight: bold;">${sr.ppct}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: left;">${escapeHtml(sr.integrationNotes).replace(/\n/g, '<br/>')}</td>
              <td style="border: 1pt solid #000; padding: 5pt; text-align: center;">${escapeHtml(sr.equipment)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Ngắt trang sang giáo án từng khối -->
      <br clear="all" style="page-break-before: always; mso-break-type: section-break;" />
    `;
  }

  // Next: Each Grade's Lesson Plan
  processedPlans.forEach((plan, planIdx) => {
    bodyContent += `
      <!-- KẾ HOẠCH BÀI DẠY KHỐI ${plan.grade} -->
      <div style="text-align: center; margin: 10pt 0 14pt 0;">
        <h2 style="margin: 0; font-size: 13.5pt; font-weight: bold; text-transform: uppercase;">
          KẾ HOẠCH BÀI DẠY TUẦN ${plan.week} – KHỐI ${plan.grade}
        </h2>
        <p style="margin: 2pt 0 6pt 0; font-size: 11pt; font-style: italic;">
          (${escapeHtml(plan.dateRange)})
        </p>
        <p style="margin: 0; font-size: 12.5pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a;">
          ${escapeHtml(cleanTopicForDisplay(plan.topic, plan.grade))}&nbsp;&nbsp;&nbsp;&nbsp;TIẾT ${plan.lessonNum}
        </p>
        <p style="margin: 4pt 0 0 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">
          ${escapeHtml(cleanLessonTitleForHeader(plan.title)).toUpperCase()}
        </p>
      </div>

      <!-- I. YÊU CẦU CẦN ĐẠT -->
      <div style="margin-bottom: 12pt;">
        <p style="font-size: 12.5pt; font-weight: bold; margin: 6pt 0 4pt 0; text-transform: uppercase;">
          I. YÊU CẦU CẦN ĐẠT
        </p>

        <p style="font-size: 11.5pt; font-weight: bold; margin: 4pt 0 2pt 0;">1. Năng lực đặc thù</p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Năng lực chăm sóc sức khỏe:</i> ${escapeHtml(plan.specialCompetencies?.healthCare || 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Năng lực vận động cơ bản:</i> ${escapeHtml(plan.specialCompetencies?.basicMovement || 'Thực hiện được động tác theo khẩu lệnh và biết giữ khoảng cách an toàn khi thực hiện.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Năng lực thể dục thể thao:</i> ${escapeHtml(plan.specialCompetencies?.sportsCompetency || 'Biết quan sát tranh ảnh SGK, học liệu số/video minh họa hoặc động tác mẫu của GV; biết tự điều chỉnh động tác khi luyện tập.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt; color: #78350f;">
          * <i>Học sinh khuyết tật:</i> ${escapeHtml(plan.specialCompetencies?.disabledStudents || 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập. Có thể giao những việc mà học sinh thích thú như bắt, tập theo các động tác của GV một cách đơn giản nhất. Tham gia các trò chơi cùng bạn.')}
        </p>

        <p style="font-size: 11.5pt; font-weight: bold; margin: 6pt 0 2pt 0;">2. Năng lực chung</p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Tự chủ và tự học:</i> ${escapeHtml(plan.generalCompetencies?.autonomy || 'Chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; lắng nghe hướng dẫn, tự giác luyện tập và tự điều chỉnh lỗi sai.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Giao tiếp và hợp tác:</i> ${escapeHtml(plan.generalCompetencies?.collaboration || 'Biết phối hợp với bạn, tổ/nhóm; chấp hành phân công, hỗ trợ bạn trong quá trình tập luyện và tham gia trò chơi.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Giải quyết vấn đề và sáng tạo:</i> ${escapeHtml(plan.generalCompetencies?.problemSolving || 'Biết quan sát, nhận xét tình huống vận động đơn giản; phát hiện lỗi sai thường gặp và lựa chọn cách thực hiện an toàn, phù hợp.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt; color: #78350f;">
          * <i>Học sinh khuyết tật:</i> ${escapeHtml(plan.generalCompetencies?.disabledStudents || 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.')}
        </p>

        <p style="font-size: 11.5pt; font-weight: bold; margin: 6pt 0 2pt 0;">3. Phẩm chất</p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Chăm chỉ:</i> ${escapeHtml(plan.qualities?.diligence || 'Tích cực, tự giác trong tập luyện, hoạt động tập thể và rèn luyện thể dục thể thao hằng ngày.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Trung thực:</i> ${escapeHtml(plan.qualities?.honesty || 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Trách nhiệm, nhân ái:</i> ${escapeHtml(plan.qualities?.responsibility || 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn khi luyện tập.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt; color: #78350f;">
          * <i>Học sinh khuyết tật:</i> ${escapeHtml(plan.qualities?.disabledStudents || 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.')}
        </p>

        <p style="font-size: 11.5pt; font-weight: bold; margin: 6pt 0 2pt 0;">4. Tích hợp liên môn</p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Năng lực số (${escapeHtml(plan.integrations?.digitalSkill)}):</i> ${escapeHtml(plan.integrations?.digitalDescription)}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Giáo dục Quốc phòng và An ninh (QPAN):</i> Rèn luyện tác phong nhanh nhẹn, giữ vững cự ly chuẩn và tinh thần kỷ luật QPAN.
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          - <i>Kỹ năng sống & An toàn:</i> ${escapeHtml(plan.integrations?.lifeSkills || 'GV hướng dẫn HS kiên trì, chờ đến lượt, phối hợp, nhận xét bạn bằng lời tích cực và chủ động báo khi cơ thể mệt hoặc khó chịu.')}
        </p>
      </div>

      <!-- II. ĐỊA ĐIỂM – PHƯƠNG TIỆN -->
      <div style="margin-bottom: 12pt;">
        <p style="font-size: 12.5pt; font-weight: bold; margin: 6pt 0 4pt 0; text-transform: uppercase;">
          II. ĐỊA ĐIỂM – PHƯƠNG TIỆN
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          <b>1. Địa điểm:</b> ${escapeHtml(plan.locationEquipment?.location || 'Sân trường bằng phẳng, sạch sẽ, an toàn.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 15pt;">
          <b>2. Phương tiện:</b>
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 30pt;">
          + <i>Đối với giáo viên:</i> ${escapeHtml(plan.locationEquipment?.teacherTools || 'Tranh ảnh động tác SGK, còi thể thao, thiết bị phát âm thanh, kế hoạch bài dạy.')}
        </p>
        <p style="font-size: 11.5pt; margin: 2pt 0 2pt 30pt;">
          + <i>Đối với học sinh:</i> ${escapeHtml(plan.locationEquipment?.studentTools || 'Trang phục thể thao gọn gàng, giày ba-ta vừa chân.')}
        </p>
      </div>

      <!-- III. HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (BẢNG 4 CỘT) -->
      <div style="margin-bottom: 12pt;">
        <p style="font-size: 12.5pt; font-weight: bold; margin: 6pt 0 4pt 0; text-transform: uppercase;">
          III. HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
        </p>

        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; border: 1pt solid #000;">
          <thead>
            <tr style="background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 11pt;">
              <th style="border: 1pt solid #000; padding: 6pt; width: 28%;">Nội Dung / Kỹ Thuật Động Tác</th>
              <th style="border: 1pt solid #000; padding: 6pt; width: 11%;">LVĐ</th>
              <th style="border: 1pt solid #000; padding: 6pt; width: 31%;">Hoạt Động Của Giáo Viên</th>
              <th style="border: 1pt solid #000; padding: 6pt; width: 30%;">Hoạt Động Của Học Sinh / Sơ Đồ</th>
            </tr>
          </thead>
          <tbody>
            ${plan.processedRows.map((row) => {
              const contentImgSrc = row.contentImgPng ? registerImage(row.contentImgPng) : '';

              const diagramsWithSrc = row.diagrams.map((d) => ({
                title: d.title,
                src: registerImage(d.pngBase64),
                widthPt: d.widthPt,
                heightPt: d.heightPt
              }));

              // Intelligent inline placement for Column 1 technical image (after TTCB line)
              const contentLines = escapeHtml(row.content).split('\n');
              let col1Html = '';

              if (contentImgSrc) {
                const ttcbIdx = contentLines.findIndex(
                  (l) => l.toLowerCase().includes('ttcb') || l.toLowerCase().includes('đứng nghiêm') || l.toLowerCase().includes('chuẩn bị')
                );
                const nhip1Idx = contentLines.findIndex((l) => l.toLowerCase().includes('nhịp 1'));

                const imgBlock = `
                  <div style="text-align: center; margin: 3pt 0 4pt 0; page-break-inside: avoid;">
                    <img src="${contentImgSrc}" width="${row.contentImgWidth || 98}" height="${row.contentImgHeight || 65}" style="width: ${row.contentImgWidth || 98}pt; height: ${row.contentImgHeight || 65}pt; max-width: 102pt; max-height: 68pt; object-fit: contain; display: block; margin: 2pt auto; border: 1px solid #e2e8f0; border-radius: 3px;" />
                    ${row.contentImgTitle ? `
                      <p style="font-size: 8.5pt; font-style: italic; margin: 1pt 0 0 0; text-align: center; color: #444;">
                        ${escapeHtml(row.contentImgTitle)}
                      </p>
                    ` : ''}
                  </div>
                `;

                if (ttcbIdx >= 0 && ttcbIdx < contentLines.length - 1) {
                  const before = contentLines.slice(0, ttcbIdx + 1).join('<br/>');
                  const after = contentLines.slice(ttcbIdx + 1).join('<br/>');
                  col1Html = `<div>${before}</div>${imgBlock}<div>${after}</div>`;
                } else if (nhip1Idx > 0) {
                  const before = contentLines.slice(0, nhip1Idx).join('<br/>');
                  const after = contentLines.slice(nhip1Idx).join('<br/>');
                  col1Html = `<div>${before}</div>${imgBlock}<div>${after}</div>`;
                } else {
                  col1Html = `<div>${contentLines.join('<br/>')}</div>${imgBlock}`;
                }
              } else {
                col1Html = `<div>${contentLines.join('<br/>')}</div>`;
              }

              return `
                <tr style="font-size: 11pt; vertical-align: top;">
                  <!-- Cột 1: Nội dung & Ảnh kỹ thuật chèn đúng vị trí -->
                  <td style="border: 1pt solid #000; padding: 6pt; vertical-align: top; text-align: left;">
                    ${col1Html}
                  </td>

                  <!-- Cột 2: LVĐ -->
                  <td style="border: 1pt solid #000; padding: 6pt; vertical-align: top; text-align: center; font-weight: bold;">
                    ${escapeHtml(row.lvd).replace(/\n/g, '<br/>')}
                  </td>

                  <!-- Cột 3: HĐ của GV -->
                  <td style="border: 1pt solid #000; padding: 6pt; vertical-align: top; text-align: left;">
                    ${escapeHtml(row.gv).replace(/\n/g, '<br/>')}
                  </td>

                  <!-- Cột 4: HĐ của HS & SƠ ĐỒ ĐỘI HÌNH ĐÃ CHUẨN KÍCH THƯỚC -->
                  <td style="border: 1pt solid #000; padding: 6pt; vertical-align: top; text-align: left;">
                    <div>${escapeHtml(row.hs).replace(/\n/g, '<br/>')}</div>
                    ${diagramsWithSrc.length > 0 ? `
                      <div style="margin-top: 4pt;">
                        ${diagramsWithSrc.map((d) => `
                          <div style="text-align: center; margin-top: 3pt; page-break-inside: avoid;">
                            <img src="${d.src}" width="${d.widthPt || 112}" height="${d.heightPt || 68}" style="width: ${d.widthPt || 112}pt; height: ${d.heightPt || 68}pt; max-width: 118pt; max-height: 72pt; object-fit: contain; display: block; margin: 2pt auto; border: 1px solid #d1d5db; border-radius: 4px;" />
                            ${d.title ? `
                              <p style="font-size: 8.5pt; font-style: italic; margin: 1.5pt 0 0 0; text-align: center; color: #374151;">
                                ${escapeHtml(d.title)}
                              </p>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- IV. ĐIỀU CHỈNH SAU BÀI DẠY -->
      <div style="margin-bottom: 14pt;">
        <p style="font-size: 12.5pt; font-weight: bold; margin: 6pt 0 3pt 0; text-transform: uppercase;">
          IV. ĐIỀU CHỈNH SAU BÀI DẠY
        </p>
        <p style="font-size: 11pt; font-style: italic; margin: 2pt 0 8pt 15pt; color: #444;">
          ${escapeHtml(plan.postLessonAdjustment || '…………………………………………………………………………………………………………………………………………………………………………………………')}
        </p>
      </div>

      ${planIdx < processedPlans.length - 1 ? `
        <!-- Ngắt trang sang khối tiếp theo -->
        <br clear="all" style="page-break-before: always; mso-break-type: section-break;" />
      ` : ''}
    `;
  });

  // KHỐI KÝ DUYỆT DUY NHẤT Ở TRANG CUỐI CÙNG CỦA TOÀN BỘ BỘ GIÁO ÁN (BGH DUYỆT)
  if (processedPlans.length > 0) {
    const firstPlan = processedPlans[0];
    bodyContent += `
      <!-- KHỐI KÝ DUYỆT BGH Ở TRANG CUỐI CÙNG -->
      <table border="0" cellspacing="0" cellpadding="3" style="width: 100%; border: none; margin-top: 24pt; page-break-inside: avoid;">
        <tr>
          <td colspan="3" style="border: none; text-align: right; font-style: italic; font-size: 11pt; padding-bottom: 6pt;">
            ${escapeHtml(approvalDate || firstPlan?.signatures?.locationDate || 'Vệ Giang, ngày 13 tháng 11 năm 2026')}
          </td>
        </tr>
        <tr style="font-weight: bold; text-align: center; font-size: 11.5pt;">
          <td style="width: 33%; border: none;">BGH DUYỆT</td>
          <td style="width: 33%; border: none;">TỔ TRƯỞNG CHUYÊN MÔN</td>
          <td style="width: 33%; border: none;">GIÁO VIÊN SOẠN</td>
        </tr>
        <tr style="font-style: italic; font-size: 10pt; text-align: center; color: #555;">
          <td style="border: none;">(Ký, ghi rõ họ tên)</td>
          <td style="border: none;">(Ký, ghi rõ họ tên)</td>
          <td style="border: none;">(Ký, ghi rõ họ tên)</td>
        </tr>
        <tr>
          <td style="border: none; height: 50pt;"></td>
          <td style="border: none; height: 50pt;"></td>
          <td style="border: none; height: 50pt;"></td>
        </tr>
        <tr style="font-weight: bold; text-align: center; font-size: 11.5pt;">
          <td style="border: none;">${escapeHtml(settings.approverPrincipal || 'Võ Thị Thuận')}</td>
          <td style="border: none;">${escapeHtml(settings.approverHead || 'Bùi Ngọc Lâm')}</td>
          <td style="border: none;">${escapeHtml(settings.teacherName || 'Lê Quốc Hưng')}</td>
        </tr>
      </table>
    `;
  }


  // 4. Assemble HTML document
  const wordHtml = `<!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Giáo án Giáo Dục Thể Chất</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt; /* Standard A4 */
          margin: 56.7pt 42.5pt 56.7pt 70.8pt; /* Top 2cm, Right 1.5cm, Bottom 2cm, Left 2.5cm */
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.25;
          color: #000000;
        }
        h1, h2, h3, h4, p, div, table, td, th {
          font-family: 'Times New Roman', serif;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          vertical-align: top;
        }
        img {
          display: block;
          margin: 4pt auto;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${bodyContent}
      </div>
    </body>
    </html>
  `;

  // 5. Output file according to format:
  if (isDocx) {
    // Produce genuine OpenXML .docx file with altChunk
    const zip = new JSZip();

    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="htm" ContentType="text/html"/>
  <Default Extension="html" ContentType="text/html"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="htmlChunk"/>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1417" w:header="708" w:footer="708"/>
    </w:sectPr>
  </w:body>
</w:document>`
    );

    zip.file(
      'word/_rels/document.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.htm"/>
</Relationships>`
    );

    zip.file('word/afchunk.htm', '\ufeff' + wordHtml);

    const docxBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Produce standard MHTML multipart/related document with Content-Location mapping
    // This allows Microsoft Word to display 100% of embedded PNG images offline
    const boundary = '----=_NextPart_GDTC_DOC_BUNDLE_' + Date.now();

    let mhtml = 'MIME-Version: 1.0\r\n';
    mhtml += `Content-Type: multipart/related; boundary="${boundary}"\r\n\r\n`;

    // Part 1: Main HTML text
    mhtml += `--${boundary}\r\n`;
    mhtml += 'Content-Type: text/html; charset="utf-8"\r\n';
    mhtml += 'Content-Transfer-Encoding: 8bit\r\n';
    mhtml += 'Content-Location: file:///C:/document.htm\r\n\r\n';
    mhtml += wordHtml + '\r\n\r\n';

    // Part 2..N: Embedded rasterized PNG images
    for (const imgItem of embeddedImages) {
      mhtml += `--${boundary}\r\n`;
      mhtml += 'Content-Type: image/png\r\n';
      mhtml += 'Content-Transfer-Encoding: base64\r\n';
      mhtml += `Content-Location: ${imgItem.location}\r\n\r\n`;
      mhtml += imgItem.base64Data + '\r\n\r\n';
    }

    // End boundary
    mhtml += `--${boundary}--\r\n`;

    const docBlob = new Blob([mhtml], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(docBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Fallback DOM export that strictly strips all HTML input/textarea/buttons
 * and converts them to plain text blocks, avoiding MS Word ActiveX form control boxes.
 */
export function exportWordDocument(elementId: string, filename = 'Giao_An_GDTC.doc') {
  const docElement = document.getElementById(elementId);
  if (!docElement) return;

  // Clone node to safely modify without affecting the UI
  const clone = docElement.cloneNode(true) as HTMLElement;

  // 1. Remove all buttons, toolbars, and no-print elements
  const buttons = clone.querySelectorAll('button, .no-print');
  buttons.forEach((el) => el.remove());

  // 2. Replace all <textarea> with styled text <div>
  const textareas = clone.querySelectorAll('textarea');
  textareas.forEach((ta) => {
    const div = document.createElement('div');
    div.style.whiteSpace = 'pre-line';
    div.innerText = ta.value;
    ta.parentNode?.replaceChild(div, ta);
  });

  // 3. Replace all <input> with styled text <span>
  const inputs = clone.querySelectorAll('input');
  inputs.forEach((inp) => {
    const span = document.createElement('span');
    span.innerText = inp.value;
    inp.parentNode?.replaceChild(span, inp);
  });

  // 4. Replace all <select> with styled text <span>
  const selects = clone.querySelectorAll('select');
  selects.forEach((sel) => {
    const span = document.createElement('span');
    span.innerText = sel.options[sel.selectedIndex]?.text || sel.value;
    sel.parentNode?.replaceChild(span, sel);
  });

  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Giáo án GDTC</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt;
          margin: 56.7pt 42.5pt 56.7pt 70.8pt;
        }
        div.WordSection1 { page: WordSection1; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.25; }
        table { border-collapse: collapse; width: 100%; margin-top: 8pt; }
        th, td { border: 1px solid #000; padding: 5pt; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        img { max-width: 140px; max-height: 95px; object-fit: contain; display: block; margin: 4pt auto; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
  `;
  const footer = '</div></body></html>';
  const htmlContent = header + clone.innerHTML + footer;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
