import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSgk2dSequenceSvg } from './src/utils/sgkVectorGenerator.js';

import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Safely resolve image base64 from data URLs, file paths, or raw base64
function extractBase64Data(imageInput: string): { data: string; mimeType: string } | null {
  if (!imageInput || typeof imageInput !== 'string') return null;

  // 1. Data URL (e.g. data:image/png;base64,....)
  if (imageInput.startsWith('data:')) {
    if (imageInput.startsWith('data:image/svg+xml')) return null;
    const parts = imageInput.split(';base64,');
    if (parts.length === 2 && parts[1].length > 20) {
      const mime = parts[0].replace('data:', '') || 'image/png';
      return { mimeType: mime, data: parts[1] };
    }
    return null;
  }

  // 2. Local relative file path (e.g. /assets/sgk_chuan/k1_tay.jpg)
  const cleanPath = imageInput.replace(/^\/+/, '');
  const candidatePaths = [
    path.join(__dirname, 'public', cleanPath),
    path.join(__dirname, 'public', cleanPath.replace(/^public\//, '')),
    path.join(__dirname, cleanPath)
  ];

  for (const cPath of candidatePaths) {
    try {
      if (fs.existsSync(cPath) && fs.statSync(cPath).isFile()) {
        const fileBuffer = fs.readFileSync(cPath);
        const ext = path.extname(cPath).toLowerCase();
        const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
        return {
          mimeType,
          data: fileBuffer.toString('base64')
        };
      }
    } catch {}
  }

  // 3. Raw Base64 string
  if (imageInput.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imageInput)) {
    return { mimeType: 'image/jpeg', data: imageInput };
  }

  return null;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2563eb"/><path d="M12 34h10l6-14 8 24 6-10h10" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  );
});

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API: Sinh kế hoạch bài dạy GDTC thông minh bằng Gemini AI
app.post('/api/ai/generate-plan', async (req: Request, res: Response) => {
  const { grade, week, lessonNum, topic, title, focusMovement } = req.body;

  if (!aiClient) {
    // Graceful offline fallback with pedagogically sound GDPT 2018 structure
    return res.json({
      success: true,
      source: 'template',
      plan: {
        topic: topic || 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        title: title || `Bài: Rèn luyện kỹ năng động tác (Tiết ${lessonNum || 17})`,
        rows: [
          {
            content: "1. HOẠT ĐỘNG MỞ ĐẦU\n- Nhận lớp, kiểm tra sức khỏe và trang phục\n- Khởi động chung: Xoay các khớp cổ tay, chân, vai, hông\n- Khởi động chuyên môn: Chạy bước nhỏ, nâng cao đùi tại chỗ",
            lvd: "5 - 7'",
            gv: "- GV nhận lớp, thăm hỏi sức khỏe học sinh.\n- Phổ biến mục tiêu, yêu cầu cần đạt của tiết học.\n- Quan sát, nhắc nhở học sinh khởi động đúng biên độ và đủ nhịp.",
            hs: "- Cán sự tập hợp 4 hàng ngang, kiểm tra sĩ số và báo cáo GV.\n- Cả lớp thực hiện bài khởi động nhịp nhàng theo nhịp đếm.\n- Tác phong khẩn trương, hào hứng."
          },
          {
            content: `2. HÌNH THÀNH KIẾN THỨC MỚI\n- Khám phá kỹ thuật: ${focusMovement || 'Động tác mới của bài học'}\n- Phân tích kỹ thuật từng nhịp và tư thế thân người`,
            lvd: "6 - 8'",
            gv: "- Làm mẫu chuẩn xác 2-3 lần kết hợp giải thích chậm kỹ thuật từng nhịp.\n- Cho HS quan sát hình ảnh kỹ thuật SGK đính kèm.\n- Hô nhịp chậm cho học sinh tập mô phỏng từng nhịp.\n- Chỉ ra các sai sót thường gặp: cúi đầu, cong gối, tay chưa thẳng.",
            hs: "- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Chú ý quan sát động tác mẫu của thầy/cô.\n- Thực hiện tập mô phỏng theo khẩu lệnh."
          },
          {
            content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1 Luyện tập đồng loạt cả lớp\n3.2 Luyện tập phân hóa theo tổ\n3.3 Luyện tập cặp đôi sửa sai cho nhau",
            lvd: "14 - 16'",
            gv: "- Điều hành cả lớp tập 2-3 lần theo nhịp còi.\n- Phân công các tổ trưởng quản lý luyện tập ở từng khu vực quy định.\n- GV đi từng tổ uốn nắn, sửa sai cụ thể cho từng em.\n- Tổ chức thi đua trình diễn giữa các tổ, biểu dương tổ tập đều, đẹp.",
            hs: "- Lớp trưởng hô nhịp cho cả lớp tập luyện.\n- Về khu vực tổ luyện tập dưới sự điều hành của tổ trưởng.\n- Cặp đôi đổi vai nhận xét và chỉnh sửa tư thế cho bạn.\n- Tham gia thi đua với tinh thần đoàn kết, tích cực."
          },
          {
            content: "3.5 Trò chơi vận động bổ trợ\n- Rèn luyện phản xạ, độ khéo léo và tinh thần đồng đội",
            lvd: "4 - 5'",
            gv: "- GV phổ biến tên trò chơi, luật chơi rõ ràng và tổ chức chơi thử.\n- Điều hành học sinh chơi 2-3 hiệp, nhắc nhở giữ an toàn tuyệt đối.",
            hs: "- HS nắm vững luật chơi, tham gia nhiệt tình, vui tươi.\n- Giữ cự ly an toàn, cổ vũ văn minh."
          },
          {
            content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n- Thả lỏng toàn thân, hồi phục nhịp thở\n- Đánh giá tiết học và dặn dò bài tập rèn luyện tại nhà",
            lvd: "4 - 5'",
            gv: "- Hướng dẫn học sinh thả lỏng cơ bắp, điều hòa nhịp thở nhẹ nhàng.\n- Cùng học sinh nhận xét ưu điểm và nội dung cần rèn thêm.\n- Giao nhiệm vụ tự ôn luyện động tác vào buổi sáng tại nhà.",
            hs: "- Thực hiện các động tác thả lỏng tay chân, hít thở sâu.\n- Tự giác nhận xét bản thân và các bạn trong tổ.\n- Ghi nhớ dặn dò của giáo viên, giải tán: KHỎE!"
          }
        ]
      }
    });
  }

  try {
    const prompt = `Bạn là chuyên gia giảng dạy môn Giáo dục Thể chất (GDTC) tiểu học theo Chương trình GDPT 2018 tại Việt Nam.
Hãy soạn kế hoạch bài dạy chi tiết cho tiết học sau:
- Khối lớp: ${grade}
- Tuần học: ${week}
- Tiết PPCT: ${lessonNum}
- Chủ đề: ${topic}
- Tên bài: ${title}
- Động tác trọng tâm / Nội dung: ${focusMovement || 'Tự động chọn phù hợp theo khung phân phối chương trình'}

Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown bọc ngoài khác), theo schema:
{
  "topic": "Tên chủ đề",
  "title": "Tên bài học",
  "rows": [
    {
      "content": "Nội dung hoạt động (Cột 1)",
      "lvd": "Lượng vận động (Cột 2, VD: 5 - 7', 2 - 3 lần)",
      "gv": "Kịch bản hoạt động của Giáo viên (Cột 3, gạch đầu dòng chi tiết)",
      "hs": "Kịch bản hoạt động của Học sinh và đội hình (Cột 4, gạch đầu dòng chi tiết)"
    }
  ]
}
Yêu cầu gồm đủ 5 hàng:
1. Hoạt động mở đầu (Nhận lớp, Khởi động chung, Khởi động chuyên môn)
2. Hình thành kiến thức mới (Học động tác mới, phân tích kỹ thuật nhịp, quan sát tranh ảnh SGK)
3. Hoạt động luyện tập (Đồng loạt, theo tổ nhóm, cặp đôi)
4. Trò chơi vận động phát triển thể lực phù hợp lứa tuổi
5. Hoạt động vận dụng & Hồi tĩnh (Thả lỏng, nhận xét, dặn dò tập ở nhà)
Lời văn sư phạm chuẩn mực, phù hợp với giáo viên thể dục tiểu học Việt Nam.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      plan: parsed
    });
  } catch (error: any) {
    console.warn('Gemini API call notice, falling back to curated pedagogy plan:', error?.message);
    return res.json({
      success: true,
      source: 'curated_standard',
      plan: {
        topic: topic || 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        title: title || `Bài: Rèn luyện kỹ năng động tác (Tiết ${lessonNum || 17})`,
        rows: [
          {
            content: "1. HOẠT ĐỘNG MỞ ĐẦU\n- Nhận lớp, kiểm tra sức khỏe và tác phong\n- Khởi động chung: Xoay cổ tay, cổ chân, khớp gối, khớp hông\n- Khởi động chuyên môn: Chạy bước nhỏ, nâng cao đùi",
            lvd: "5 - 7'",
            gv: "- GV nhận lớp, thăm hỏi tình trạng thể lực của học sinh.\n- Phổ biến mục tiêu, yêu cầu cần đạt của tiết học: Nắm vững kỹ thuật và tích cực tập luyện.\n- Nhắc nhở HS khởi động đúng kỹ thuật, chú ý an toàn.",
            hs: "- Cán sự tập trung 4 hàng ngang, điểm số và báo cáo giáo viên.\n- Cả lớp thực hiện bài khởi động nhịp nhàng theo hiệu lệnh.\n- Tinh thần phấn chấn, sẵn sàng bước vào bài học."
          },
          {
            content: `2. HÌNH THÀNH KIẾN THỨC MỚI\n- ${title || 'Học động tác mới'}\n- Phân tích kỹ thuật nhịp 1, 2, 3, 4 theo tranh minh họa`,
            lvd: "6 - 8'",
            gv: "- GV làm mẫu chuẩn xác 2-3 lần (phương pháp trực quan gương).\n- Hướng dẫn quan sát tranh kỹ thuật SGK đính kèm.\n- Hô nhịp chậm cho học sinh tập mô phỏng từng nhịp.\n- Lưu ý sửa sai tư thế thân người và nhịp thở sâu.",
            hs: "- Đội hình 4 hàng ngang đứng so le, cự ly 1 sải tay.\n- Chú ý quan sát động tác mẫu của giáo viên.\n- Thực hiện mô phỏng theo khẩu lệnh đếm nhịp."
          },
          {
            content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1 Luyện tập đồng loạt cả lớp\n3.2 Luyện tập theo tổ / nhóm\n3.3 Luyện tập cặp đôi sửa sai",
            lvd: "14 - 16'",
            gv: "- Điều hành cả lớp tập 2-3 lần theo nhịp còi.\n- Phân công các tổ trưởng quản lý luyện tập ở từng khu vực quy định.\n- GV đi từng tổ uốn nắn, sửa sai cụ thể cho từng em.\n- Tổ chức thi đua trình diễn giữa các tổ, biểu dương tổ tập đều, đẹp.",
            hs: "- Lớp trưởng hô nhịp cho cả lớp tập luyện.\n- Về khu vực tổ luyện tập dưới sự điều hành của tổ trưởng.\n- Cặp đôi đổi vai nhận xét và chỉnh sửa tư thế cho bạn.\n- Tham gia thi đua với tinh thần đoàn kết, tích cực."
          },
          {
            content: "3.5 Trò chơi vận động bổ trợ\n- Rèn luyện phản xạ, độ khéo léo và tinh thần đồng đội",
            lvd: "4 - 5'",
            gv: "- GV phổ biến tên trò chơi, luật chơi rõ ràng và tổ chức chơi thử.\n- Điều hành học sinh chơi 2-3 hiệp, nhắc nhở giữ an toàn tuyệt đối.",
            hs: "- HS nắm vững luật chơi, tham gia nhiệt tình, vui tươi.\n- Giữ cự ly an toàn, cổ vũ văn minh."
          },
          {
            content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n- Thả lỏng toàn thân, hồi phục nhịp thở\n- Đánh giá tiết học và dặn dò bài tập rèn luyện tại nhà",
            lvd: "4 - 5'",
            gv: "- Hướng dẫn học sinh thả lỏng cơ bắp, điều hòa nhịp thở nhẹ nhàng.\n- Cùng học sinh nhận xét ưu điểm và nội dung cần rèn thêm.\n- Giao nhiệm vụ tự ôn luyện động tác vào buổi sáng tại nhà.",
            hs: "- Thực hiện các động tác thả lỏng tay chân, hít thở sâu.\n- Tự giác nhận xét bản thân và các bạn trong tổ.\n- Ghi nhớ dặn dò của giáo viên, giải tán: KHỎE!"
          }
        ]
      }
    });
  }
});

// API: Phân tích kỹ thuật động tác qua AI
app.post('/api/ai/analyze-exercise', async (req: Request, res: Response) => {
  const { exerciseName, grade, imageData } = req.body;

  if (!aiClient) {
    return res.json({
      success: true,
      analysis: {
        name: exerciseName || 'Động tác GDTC',
        technicalCues: [
          'Thân người giữ thẳng, mắt nhìn về phía trước',
          'Biên độ tay chân mở rộng dứt khoát, kết hợp hít sâu bằng mũi và thở bằng miệng',
          'Chân tiếp đất nhẹ nhàng bằng nửa trước bàn chân để giảm chấn động'
        ],
        commonErrors: [
          'Tay chưa vươn hết biên độ hoặc cong khuỷu tay',
          'Đầu cúi quá thấp làm mất thăng bằng',
          'Thực hiện sai nhịp thở so với nhịp động tác'
        ],
        coachingTips: 'Giáo viên nên đứng cùng hướng hoặc phương pháp soi gương, hô nhịp rõ ràng 1-2-3-4 dứt khoát.'
      }
    });
  }

  try {
    const prompt = `Bạn là giảng viên thể thao sư phạm chuyên về Giáo dục Thể chất lứa tuổi học sinh tiểu học (Khối ${grade || 1}).
Hãy phân tích kỹ thuật cho động tác / bài tập: "${exerciseName}".
Trả về kết quả JSON với format:
{
  "name": "${exerciseName}",
  "technicalCues": ["Yếu lĩnh 1", "Yếu lĩnh 2", "Yếu lĩnh 3"],
  "commonErrors": ["Lỗi sai thường gặp 1", "Lỗi sai thường gặp 2", "Lỗi sai thường gặp 3"],
  "coachingTips": "Lời khuyên sư phạm cho giáo viên khi sửa sai cho học sinh."
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API: Phân tích hình ảnh động tác SGK bằng Gemini Vision AI
app.post('/api/ai/analyze-vision', async (req: Request, res: Response) => {
  const {
    imageBase64,
    grade,
    lessonTitle,
    imageTitle,
    caption,
    folder,
    category
  } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu hình ảnh' });
  }

  // Intelligent domain-aware analysis fallback when AI client is unavailable, quota is exhausted, or offline
  const getFallbackAnalysis = () => {
    const rawText = `${imageTitle || ''} ${caption || ''} ${folder || ''} ${category || ''} ${lessonTitle || ''}`.toLowerCase();

    // 1. Cặp đôi luyện tập (Luyện tập cặp đôi / đối diện / sửa sai)
    if (
      rawText.includes('cặp đôi') ||
      rawText.includes('cap doi') ||
      rawText.includes('đối diện') ||
      rawText.includes('doi dien') ||
      rawText.includes('hai bạn') ||
      rawText.includes('2 bạn')
    ) {
      return {
        name: 'Luyện tập cặp đôi sửa sai cho nhau',
        category: 'tap_luyen',
        targetColumn: 'hs',
        lvd: "3 - 5' (2 - 3 lượt đổi vai)",
        caption:
          'Hình thức luyện tập cặp đôi: hai bạn quay mặt vào nhau, một bạn tập mẫu, một bạn quan sát giúp đỡ sửa sai và luân phiên đổi vai.',
        technicalCues: [
          'Hai bạn đứng đối diện nhau giữ cự ly an toàn 1.5 - 2 mét',
          'Quan sát chuẩn xác tư thế tay, chân và góc nghiêng thân người của bạn',
          'Nhắc nhở nhẹ nhàng, cổ vũ động viên và đổi vai luyện tập theo hiệu lệnh'
        ],
        commonErrors: [
          'Đứng quá gần hoặc nói chuyện riêng làm gián đoạn tập luyện',
          'Không tập trung quan sát nên chưa kịp thời giúp bạn sửa sai tư thế'
        ],
        gvScript:
          '- Chia lớp thành từng cặp đứng đối diện nhau cự ly 1.5 - 2 mét.\n- Giao nhiệm vụ: một bạn thực hiện động tác theo nhịp hô, một bạn quan sát giúp bạn uốn nắn tư thế rồi đổi vai.\n- GV luân phiên đi bao quát các cặp, uốn nắn và biểu dương cặp đôi phối hợp tích cực.',
        hsScript:
          '- Từng cặp đứng đối diện nhau nghiêm túc, cự ly 1.5m.\n- Bạn A thực hiện động tác theo nhịp hô, bạn B quan sát hỗ trợ sửa sai; sau đó đổi vai theo hiệu lệnh của GV.'
      };
    }

    // 2. Luyện tập theo tổ / nhóm (4 góc sân bãi)
    if (
      rawText.includes('theo tổ') ||
      rawText.includes('tổ nhóm') ||
      rawText.includes('to nhom') ||
      rawText.includes('4 góc') ||
      rawText.includes('tổ trưởng')
    ) {
      return {
        name: 'Luyện tập theo tổ nhóm 4 góc sân',
        category: 'tap_luyen',
        targetColumn: 'hs',
        lvd: "4 - 6' (3 - 4 lần)",
        caption:
          'Luyện tập theo tổ: 4 tổ di chuyển về 4 góc sân tập, tổ trưởng hô nhịp và điều hành các bạn tập luyện, luân phiên sửa sai.',
        technicalCues: [
          'Tổ trưởng hô nhịp to, rõ ràng và dứt khoát',
          'Các thành viên trong tổ thực hiện đều, đúng phương hướng',
          'Luân phiên quan sát và giúp đỡ bạn cùng tổ sửa sai'
        ],
        commonErrors: [
          'Mất trật tự khi di chuyển về vị trí của tổ mình',
          'Tập luyện chưa đều theo nhịp đếm của tổ trưởng'
        ],
        gvScript:
          '- Phân 4 tổ về 4 khu vực sân tập, giao nhiệm vụ điều hành cho tổ trưởng.\n- GV di chuyển giữa các tổ để uốn nắn kỹ thuật và hướng dẫn tổ trưởng cách sửa sai.',
        hsScript:
          '- 4 tổ nhanh chóng di chuyển về 4 góc sân bãi theo hiệu lệnh.\n- Tổ trưởng hô nhịp điều khiển, các tổ viên tự giác tập luyện và giúp bạn sửa sai.'
      };
    }

    // 3. Luyện tập đồng loạt cả lớp (4 hàng ngang so le)
    if (
      rawText.includes('đồng loạt') ||
      rawText.includes('dong loat') ||
      rawText.includes('cả lớp') ||
      rawText.includes('ca lop') ||
      rawText.includes('4 hàng ngang')
    ) {
      return {
        name: 'Luyện tập đồng loạt cả lớp 4 hàng ngang',
        category: 'tap_luyen',
        targetColumn: 'hs',
        lvd: "5 - 7' (2x8 nhịp/động tác)",
        caption:
          'Đội hình toàn lớp 4 hàng ngang giãn cách so le cự ly 1 sải tay đồng loạt thực hiện theo nhịp hô của giáo viên.',
        technicalCues: [
          'Toàn lớp đứng so le cự ly 1 sải tay để không vướng tay bạn',
          'Thực hiện động tác dứt khoát, mở rộng biên độ tay chân',
          'Phối hợp nhịp thở sâu tự nhiên theo nhịp đếm'
        ],
        commonErrors: [
          'Chưa đứng so le dẫn đến vướng tay bạn bên cạnh',
          'Thực hiện động tác vội vàng, chưa mở hết biên độ'
        ],
        gvScript:
          '- Điều hành lớp chuyển sang đội hình 4 hàng ngang so le cự ly 1 sải tay.\n- Hô nhịp dứt khoát (1, 2, 3, 4...) kết hợp quan sát uốn nắn lỗi sai chung cho cả lớp.',
        hsScript:
          '- Đội hình 4 hàng ngang giãn cách so le 1 sải tay.\n- Chú ý quan sát và đồng loạt thực hiện động tác theo nhịp hô của thầy cô.'
      };
    }

    // 4. Trò chơi vận động
    const isGame =
      category === 'tro_choi' ||
      category === 'tro_choi_khoi_dong' ||
      folder === 'troChoi' ||
      rawText.includes('trò chơi') ||
      rawText.includes('tro choi') ||
      rawText.includes('tiếp sức') ||
      rawText.includes('kéo co') ||
      rawText.includes('con sâu') ||
      rawText.includes('mèo đuổi chuột') ||
      rawText.includes('ném trúng đích') ||
      rawText.includes('chuyền bóng');
    if (isGame) {
      let gameName = 'Trò chơi vận động rèn luyện thể chất';
      if (
        imageTitle &&
        (imageTitle.toLowerCase().includes('trò chơi') ||
          imageTitle.toLowerCase().includes('tiếp sức') ||
          imageTitle.toLowerCase().includes('kéo co') ||
          imageTitle.toLowerCase().includes('con sâu'))
      ) {
        gameName = imageTitle;
      }
      return {
        name: gameName,
        category: 'tro_choi',
        targetColumn: 'hs',
        lvd: "4 - 6' (2 - 3 lượt chơi)",
        caption:
          caption ||
          'Sơ đồ và hướng dẫn luật chơi trò chơi vận động rèn luyện phản xạ nhanh nhẹn, tinh thần đồng đội.',
        technicalCues: [
          'Xuất phát đúng vạch quy định khi có hiệu lệnh còi',
          'Phối hợp trao tiếp sức an toàn, không xô đẩy hay cản trở bạn',
          'Tuân thủ tuyệt đối luật chơi và bảo đảm an toàn trên sân'
        ],
        commonErrors: [
          'Xuất phát trước hiệu lệnh còi của giáo viên (phạm quy)',
          'Chạy lấn làn của đội bạn hoặc dừng lại đột ngột'
        ],
        gvScript:
          '- GV nêu tên trò chơi, luật chơi và các lỗi phạm quy cần tránh.\n- Cho 1 nhóm chơi thử 1 lượt, sau đó tổ chức thi đua hào hứng giữa các tổ có tính điểm khen thưởng.',
        hsScript:
          '- Đội hình theo các tổ tập trung trước vạch xuất phát.\n- Tích cực tham gia thi đua với tinh thần đoàn kết, trung thực và cổ vũ hết mình.'
      };
    }

    // 5. Vận dụng & Hồi tĩnh
    const isVanDung =
      category === 'van_dung' ||
      folder === 'vanDung' ||
      rawText.includes('vận dụng') ||
      rawText.includes('van dung') ||
      rawText.includes('chào cờ') ||
      rawText.includes('thể dục sáng') ||
      rawText.includes('vệ sinh') ||
      rawText.includes('thu dọn');
    if (isVanDung) {
      return {
        name: 'Hoạt động vận dụng thực tế cuộc sống',
        category: 'van_dung',
        targetColumn: 'hs',
        lvd: "2 - 3'",
        caption:
          caption ||
          'Hình ảnh vận dụng bài thể dục vào đời sống thực tế: tập thể dục buổi sáng tại nhà, đứng nghiêm trang trong lễ chào cờ.',
        technicalCues: [
          'Hình thành thói quen rèn luyện thể dục thể thao hằng ngày',
          'Tự giác giữ gìn vệ sinh cá nhân và thu dọn cọc tiêu, trang thiết bị tập luyện'
        ],
        commonErrors: ['Chưa duy trì thói quen tập luyện thường xuyên tại nhà'],
        gvScript:
          '- Nêu câu hỏi vận dụng liên hệ thực tế: "Em nên tập bài thể dục này vào thời điểm nào trong ngày để tăng cường sức khỏe?"\n- Nhắc nhở HS giữ gìn vệ sinh, cùng nhau thu dọn cọc tiêu và trang thiết bị sân tập ngăn nắp.',
        hsScript:
          '- Hào hứng phát biểu liên hệ thực tế: Tập thể dục buổi sáng ở nhà cùng người thân.\n- Tự giác dọn dẹp vệ sinh sân tập và cất dụng cụ cẩn thận.'
      };
    }

    // 6. Động tác kỹ thuật mới SGK (dong_tac)
    let moveName = imageTitle || 'Động tác kỹ thuật bài thể dục';
    if (!imageTitle && lessonTitle) {
      if (lessonTitle.includes('Chân')) moveName = 'Động tác Chân';
      else if (lessonTitle.includes('Lườn')) moveName = 'Động tác Lườn';
      else if (lessonTitle.includes('Bụng')) moveName = 'Động tác Bụng';
      else if (lessonTitle.includes('Vươn thở')) moveName = 'Động tác Vươn thở';
      else if (lessonTitle.includes('Tay')) moveName = 'Động tác Tay';
      else if (lessonTitle.includes('Toàn thân')) moveName = 'Động tác Toàn thân';
      else if (lessonTitle.includes('Nhảy')) moveName = 'Động tác Nhảy';
      else if (lessonTitle.includes('Điều hòa')) moveName = 'Động tác Điều hòa';
    }

    return {
      name: moveName,
      category: 'dong_tac',
      targetColumn: 'content',
      lvd: "5 - 7'",
      caption:
        caption ||
        'Tư thế động tác chuẩn xác theo SGK GDTC, biên độ mở rộng theo nhịp đếm, hít thở sâu.',
      technicalCues: [
        'Tư thế chuẩn bị (TTCB) đứng nghiêm, thân người thẳng',
        'Phối hợp tay chân nhịp nhàng, đúng phương hướng và biên độ kỹ thuật',
        'Hít thở sâu nhịp nhàng theo nhịp vận động'
      ],
      commonErrors: [
        'Cúi đầu hoặc cong lưng làm mất thăng bằng',
        'Thực hiện vội vàng chưa mở hết biên độ cánh tay'
      ],
      gvScript:
        '- GV làm mẫu chuẩn xác 2-3 lần kết hợp phân tích kỹ thuật từng nhịp.\n- Cho HS quan sát hình ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai tư thế.',
      hsScript:
        '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Chú ý quan sát động tác mẫu của GV và thực hiện theo nhịp hô.'
    };
  };

  if (!aiClient) {
    return res.json({ success: true, source: 'curated_vision_fallback', analysis: getFallbackAnalysis() });
  }

  try {
    const resolved = extractBase64Data(imageBase64);
    if (!resolved) {
      return res.json({ success: true, source: 'curated_vision_fallback', analysis: getFallbackAnalysis() });
    }

    const imagePart = {
      inlineData: {
        mimeType: resolved.mimeType,
        data: resolved.data,
      },
    };

    const textPart = {
      text: `Bạn là chuyên gia giảng dạy môn Giáo dục Thể chất tiểu học (GDTC) tại Việt Nam theo Chương trình GDPT 2018 (Công văn 2345/BGDĐT).
Khối lớp mục tiêu: Khối ${grade || 1}. Tiết học: "${lessonTitle || 'Bài thể dục phát triển chung'}".
Thông tin ban đầu từ tệp hình ảnh bóc tách:
- Tiêu đề tệp: "${imageTitle || ''}"
- Ghi chú/chú thích: "${caption || ''}"
- Thư mục/nhóm: "${folder || category || ''}"

HÃY QUAN SÁT VÀ ĐỌC KỸ HÌNH TRÊN (bao gồm hình vẽ nhân vật học sinh và các chữ in hoa/thường trên trang sách):
QUY TẮC BẮT BUỘC THEO CÔNG VĂN 2345/BGDĐT:
1. Nếu hình ảnh vẽ 2 học sinh quay mặt vào nhau luyện tập (có chữ "Luyện tập cặp đôi" hoặc "cặp đôi", "đối diện"):
   -> name = "Luyện tập cặp đôi sửa sai cho nhau"
   -> category = "tap_luyen"
   -> targetColumn = "hs" (BẮT BUỘC Cột 4 Hoạt động HS - TUYỆT ĐỐI KHÔNG GÁN VÀO CỘT 1 NỘI DUNG!)
2. Nếu hình ảnh vẽ 4 tổ ở 4 góc sân hoặc nhóm học sinh có tổ trưởng chỉ huy:
   -> name = "Luyện tập theo tổ / nhóm"
   -> category = "tap_luyen"
   -> targetColumn = "hs"
3. Nếu hình ảnh vẽ cả lớp đứng 4 hàng ngang giãn cách:
   -> name = "Luyện tập đồng loạt cả lớp"
   -> category = "tap_luyen"
   -> targetColumn = "hs"
4. Nếu hình ảnh vẽ sơ đồ chạy, thi đấu trò chơi (tiếp sức, kéo co, con sâu, bắt bóng...):
   -> name = Tên trò chơi cụ thể
   -> category = "tro_choi"
   -> targetColumn = "hs"
5. Nếu hình ảnh vẽ học sinh vận dụng vào đời sống (chào cờ nghiêm túc, tập buổi sáng ở nhà, dọn vệ sinh...):
   -> name = "Vận dụng thực tế cuộc sống"
   -> category = "van_dung"
   -> targetColumn = "hs"
6. CHỈ KHI hình vẽ tranh phân thế kỹ thuật chi tiết các nhịp (TTCB, Nhịp 1, 2, 3...) của 1 học sinh thực hiện động tác mới:
   -> name = Tên động tác cụ thể (VD: "Động tác Chân", "Động tác Lườn", "Động tác Vươn thở"...)
   -> category = "dong_tac"
   -> targetColumn = "content" (Cột 1 Nội dung)

Trả về DUY NHẤT chuỗi JSON hợp lệ:
{
  "name": "Tên động tác / Hình ảnh tập luyện / Tên trò chơi",
  "category": "tap_luyen" | "dong_tac" | "tro_choi" | "van_dung",
  "targetColumn": "hs" | "content",
  "lvd": "5 - 7'",
  "caption": "Mô tả ghi chú tự động chuẩn mực sư phạm",
  "technicalCues": ["Yếu lĩnh 1", "Yếu lĩnh 2"],
  "commonErrors": ["Lỗi sai 1", "Lỗi sai 2"],
  "gvScript": "- Kịch bản GV...",
  "hsScript": "- Kịch bản HS..."
}`
    };

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    // Strict pedagogical sanity check & override if needed
    const checkText = `${parsed.name || ''} ${imageTitle || ''} ${caption || ''} ${folder || ''}`.toLowerCase();
    if (
      checkText.includes('cặp đôi') ||
      checkText.includes('cap doi') ||
      checkText.includes('đối diện')
    ) {
      parsed.category = 'tap_luyen';
      parsed.targetColumn = 'hs';
      if (!parsed.name || parsed.name.includes('Động tác')) {
        parsed.name = 'Luyện tập cặp đôi sửa sai cho nhau';
      }
    } else if (
      checkText.includes('đồng loạt') ||
      checkText.includes('tổ nhóm') ||
      checkText.includes('theo tổ')
    ) {
      parsed.category = 'tap_luyen';
      parsed.targetColumn = 'hs';
    } else if (
      checkText.includes('trò chơi') ||
      checkText.includes('tiếp sức') ||
      checkText.includes('kéo co')
    ) {
      parsed.category = 'tro_choi';
      parsed.targetColumn = 'hs';
    } else if (
      checkText.includes('vận dụng') ||
      checkText.includes('chào cờ') ||
      checkText.includes('thể dục sáng')
    ) {
      parsed.category = 'van_dung';
      parsed.targetColumn = 'hs';
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash-vision',
      analysis: parsed
    });
  } catch (_error: any) {
    return res.json({
      success: true,
      source: 'fallback-heuristics',
      analysis: getFallbackAnalysis()
    });
  }
});

// API: AI Sinh Sơ Đồ Đội Hình GDTC chuẩn sư phạm GDPT 2018
app.post('/api/ai/generate-formation', async (req: Request, res: Response) => {
  const { title, description, prompt, phase } = req.body;
  const userPrompt = (prompt || title || description || 'Sơ đồ đội hình tập luyện GDTC').trim();
  const lowerPrompt = userPrompt.toLowerCase();

  const escXml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  // Smart heuristic SVG synthesizer
  const synthesizeHeuristicFormation = () => {
    let name = userPrompt;
    let desc = 'Sơ đồ đội hình chuyên biệt tạo bởi AI hỗ trợ giáo viên tổ chức tiết học GDTC an toàn, hiệu quả.';
    let detectedPhase = phase || 'tro_choi';
    let content = '';

    if (lowerPrompt.includes('zic zac') || lowerPrompt.includes('dích dắc') || lowerPrompt.includes('luồn cọc') || lowerPrompt.includes('qua cọc')) {
      name = `Sơ đồ: Chạy zíc zắc qua 5 cọc mốc (${userPrompt})`;
      desc = 'Học sinh xuất phát luồn lách khéo léo qua các cọc tiêu, vòng qua cọc đích và chạy thẳng về tiếp sức.';
      detectedPhase = 'tro_choi';
      content = `
        <polygon points="160,32 152,48 168,48" fill="#dc2626"/>
        <text x="160" y="58" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Điều Hành</text>
        
        <!-- Vạch xuất phát -->
        <line x1="40" y1="90" x2="40" y2="185" stroke="#2563eb" stroke-width="2.5"/>
        <text x="40" y="80" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" text-anchor="middle">XUẤT PHÁT</text>
        
        <!-- 5 cọc tiêu cam hình tam giác -->
        <polygon points="90,120 84,136 96,136" fill="#ea580c"/>
        <polygon points="135,160 129,176 141,176" fill="#ea580c"/>
        <polygon points="180,115 174,131 186,131" fill="#ea580c"/>
        <polygon points="225,160 219,176 231,176" fill="#ea580c"/>
        <polygon points="270,130 264,146 276,146" fill="#ea580c"/>
        
        <!-- Đường chạy zic zac lượn sóng -->
        <path d="M 45 138 Q 90 95 135 138 T 225 138 T 275 138 Q 285 138 285 175 L 45 175" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrow)"/>
        
        <!-- Hàng học sinh chờ -->
        <circle cx="25" cy="115" r="5" fill="#1e293b"/>
        <circle cx="25" cy="135" r="5" fill="#1e293b"/>
        <circle cx="25" cy="155" r="5" fill="#1e293b"/>
        <circle cx="25" cy="175" r="5" fill="#1e293b"/>
        
        <text x="160" y="202" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
          Đường chạy zíc zắc cự ly các cọc 2 - 2.5m · Vòng qua cọc cuối về vạch đích
        </text>
      `;
    } else if (lowerPrompt.includes('tiếp sức') || lowerPrompt.includes('chuyền gậy') || lowerPrompt.includes('chạy nhanh')) {
      name = `Sơ đồ: Chạy tiếp sức theo làn (${userPrompt})`;
      desc = '4 làn chạy song song, cự ly 10-15m có cọc tiêu mốc quay đầu, trao gậy bằng tay thuận.';
      detectedPhase = 'tro_choi';
      content = `
        <polygon points="160,30 152,45 168,45" fill="#dc2626"/>
        <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Trọng Tài</text>
        
        <line x1="50" y1="75" x2="50" y2="185" stroke="#dc2626" stroke-width="2"/>
        <text x="50" y="70" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" text-anchor="middle">Vạch XP</text>
        
        <!-- 4 Làn -->
        <g>
          <line x1="50" y1="90" x2="260" y2="90" stroke="#cbd5e1" stroke-dasharray="4,3"/>
          <line x1="50" y1="120" x2="260" y2="120" stroke="#cbd5e1" stroke-dasharray="4,3"/>
          <line x1="50" y1="150" x2="260" y2="150" stroke="#cbd5e1" stroke-dasharray="4,3"/>
          <line x1="50" y1="180" x2="260" y2="180" stroke="#cbd5e1" stroke-dasharray="4,3"/>
          
          <!-- Cọc mốc -->
          <polygon points="260,82 254,98 266,98" fill="#ea580c"/>
          <polygon points="260,112 254,128 266,128" fill="#ea580c"/>
          <polygon points="260,142 254,158 266,158" fill="#ea580c"/>
          <polygon points="260,172 254,188 266,188" fill="#ea580c"/>
          
          <!-- Vận động viên chạy -->
          <circle cx="120" cy="90" r="5" fill="#2563eb"/><line x1="117" y1="87" x2="128" y2="87" stroke="#b45309" stroke-width="2"/>
          <circle cx="150" cy="120" r="5" fill="#16a34a"/><line x1="147" y1="117" x2="158" y2="117" stroke="#b45309" stroke-width="2"/>
          <circle cx="100" cy="150" r="5" fill="#9333ea"/><line x1="97" y1="147" x2="108" y2="147" stroke="#b45309" stroke-width="2"/>
          <circle cx="140" cy="180" r="5" fill="#e11d48"/><line x1="137" y1="177" x2="148" y2="177" stroke="#b45309" stroke-width="2"/>
        </g>
        <text x="160" y="202" font-family="sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">
          4 Làn chạy thi đấu tiếp sức · Chạy vòng qua cọc cam 10m về trao gậy
        </text>
      `;
    } else if (lowerPrompt.includes('ném bóng') || lowerPrompt.includes('vào rổ') || lowerPrompt.includes('trúng đích')) {
      name = `Sơ đồ: Ném bóng trúng đích (${userPrompt})`;
      desc = 'Học sinh đứng sau vạch giới hạn 3-4m, ngắm chuẩn ném bóng vào rổ / vòng tròn đích.';
      detectedPhase = 'tro_choi';
      content = `
        <polygon points="160,30 152,45 168,45" fill="#dc2626"/>
        <text x="160" y="55" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Trực Quan</text>
        
        <!-- Vạch ném -->
        <line x1="80" y1="75" x2="80" y2="185" stroke="#dc2626" stroke-width="2"/>
        <text x="80" y="70" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" text-anchor="middle">Vạch Ném (3-4m)</text>
        
        <!-- Rổ đích ném bên phải -->
        <circle cx="250" cy="100" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
        <circle cx="250" cy="140" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
        <circle cx="250" cy="175" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
        
        <!-- Quỹ đạo ném bóng -->
        <path d="M 85 100 Q 170 70 240 98" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>
        <path d="M 85 140 Q 170 120 240 140" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>
        <path d="M 85 175 Q 170 155 240 175" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>
        
        <!-- HS Ném -->
        <circle cx="70" cy="100" r="5" fill="#2563eb"/><circle cx="75" cy="95" r="2.5" fill="#ea580c"/>
        <circle cx="70" cy="140" r="5" fill="#16a34a"/><circle cx="75" cy="135" r="2.5" fill="#ea580c"/>
        <circle cx="70" cy="175" r="5" fill="#9333ea"/><circle cx="75" cy="170" r="2.5" fill="#ea580c"/>
        
        <text x="160" y="202" font-family="sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">
          Đội hình ném bóng trúng đích theo tổ · Tính điểm quả bóng lọt rổ
        </text>
      `;
    } else if (lowerPrompt.includes('vòng tròn') || lowerPrompt.includes('vòng quanh')) {
      name = `Sơ đồ: Đội hình vòng tròn (${userPrompt})`;
      desc = 'Học sinh dàn đều theo hình vòng tròn, cự ly 1 cánh tay, hướng mặt vào tâm hoặc quay theo chiều kim đồng hồ.';
      detectedPhase = 'khoi_dong';
      content = `
        <!-- Vòng tròn trung tâm -->
        <circle cx="160" cy="120" r="52" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="5,4"/>
        
        <!-- GV ở trung tâm -->
        <polygon points="160,110 152,125 168,125" fill="#dc2626"/>
        <text x="160" y="137" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
        
        <!-- 12 học sinh trên vòng tròn -->
        <g fill="#0284c7">
          <circle cx="160" cy="68" r="5"/><circle cx="186" cy="75" r="5"/><circle cx="206" cy="95" r="5"/><circle cx="212" cy="120" r="5"/>
          <circle cx="206" cy="145" r="5"/><circle cx="186" cy="165" r="5"/><circle cx="160" cy="172" r="5"/><circle cx="134" cy="165" r="5"/>
          <circle cx="114" cy="145" r="5"/><circle cx="108" cy="120" r="5"/><circle cx="114" cy="95" r="5"/><circle cx="134" cy="75" r="5"/>
        </g>
        <path d="M 175 66 A 55 55 0 0 1 214 110" fill="none" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arrow)"/>
        <text x="160" y="202" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1" text-anchor="middle">
          Đội hình vòng tròn cự ly giãn cách 1 sải tay · GV đứng ở tâm điều hành
        </text>
      `;
    } else {
      // General dynamic formation with teacher and squads
      name = `Sơ đồ: ${userPrompt}`;
      desc = 'Sơ đồ hình thành theo yêu cầu sư phạm của giáo viên, phân bổ vị trí người học khoa học.';
      content = `
        <polygon points="160,32 150,50 170,50" fill="#dc2626"/>
        <text x="160" y="62" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV Chỉ Huy</text>
        
        <rect x="35" y="75" width="115" height="48" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
        <text x="92" y="90" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">KHU VỰC TỔ 1 &amp; 2</text>
        <g fill="#1e293b"><circle cx="55" cy="107" r="4.5"/><circle cx="75" cy="107" r="4.5"/><circle cx="95" cy="107" r="4.5"/><circle cx="115" cy="107" r="4.5"/></g>
        
        <rect x="170" y="75" width="115" height="48" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,3"/>
        <text x="227" y="90" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">KHU VỰC TỔ 3 &amp; 4</text>
        <g fill="#1e293b"><circle cx="190" cy="107" r="4.5"/><circle cx="210" cy="107" r="4.5"/><circle cx="230" cy="107" r="4.5"/><circle cx="250" cy="107" r="4.5"/></g>
        
        <!-- Trung tâm tập luyện -->
        <rect x="75" y="135" width="170" height="50" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
        <text x="160" y="152" font-family="sans-serif" font-size="9" font-weight="bold" fill="#15803d" text-anchor="middle">VÙNG TẬP LUYỆN TRUNG TÂM</text>
        <g fill="#16a34a"><circle cx="105" cy="168" r="5"/><circle cx="140" cy="168" r="5"/><circle cx="180" cy="168" r="5"/><circle cx="215" cy="168" r="5"/></g>
        
        <text x="160" y="202" font-family="sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">
          Đội hình phân bổ khu vực tập luyện khoa học · Luân chuyển theo hiệu lệnh
        </text>
      `;
    }

    const fullSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="215" viewBox="0 0 320 215">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/>
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d"/>
          </marker>
          <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c"/>
          </marker>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect width="320" height="215" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="0" y="0" width="320" height="26" rx="9" fill="#f8fafc"/>
        <line x1="0" y1="26" x2="320" y2="26" stroke="#e2e8f0" stroke-width="1"/>
        <text x="12" y="18" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#1e293b">${escXml(name)}</text>
        <text x="308" y="18" font-family="sans-serif" font-size="8.5" font-weight="600" fill="#64748b" text-anchor="end">AI THIẾT KẾ</text>
        <g filter="url(#shadow)">
          ${content}
        </g>
      </svg>
    `.trim();

    return {
      name,
      description: desc,
      phase: detectedPhase,
      svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`
    };
  };

  // If Gemini client is available, try prompt expansion or SVG structure
  if (aiClient) {
    try {
      const aiPromptMsg = `Bạn là chuyên gia sư phạm Giáo dục Thể chất tiểu học (GDTC) tại Việt Nam theo Chương trình GDPT 2018.
Yêu cầu: Thiết kế sơ đồ đội hình tập luyện hoặc trò chơi vận động dựa trên mô tả sau:
"${userPrompt}"

Hãy trả về duy nhất chuỗi JSON hợp lệ theo format:
{
  "name": "Tên sơ đồ ngắn gọn chuẩn sư phạm (VD: Sơ đồ chạy zíc zắc 5 cọc)",
  "description": "Mô tả cự ly, vị trí đứng của GV và học sinh, các lưu ý an toàn (khoảng 1-2 câu).",
  "phase": "khoi_dong | tap_mau | dong_loat | to_nhom | cap_doi | thi_dua | tro_choi | hoi_tinh"
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: aiPromptMsg,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const heuristic = synthesizeHeuristicFormation();
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        name: parsed.name || heuristic.name,
        description: parsed.description || heuristic.description,
        phase: parsed.phase || heuristic.phase,
        svgDataUrl: heuristic.svgDataUrl
      });
    } catch (err: any) {
      console.warn('Gemini formation error, falling back to heuristic:', err?.message);
    }
  }

  // Instant heuristic fallback
  const result = synthesizeHeuristicFormation();
  return res.json({
    success: true,
    source: 'heuristic',
    ...result
  });
});

// API: Phân tích ảnh trò chơi tham chiếu -> sinh danh sách đối tượng Studio (FormationElement[]) có thể kéo thả chỉnh sửa
app.post('/api/ai/game-image-to-diagram', async (req: Request, res: Response) => {
  const { imageBase64 = '', gameTitle = '', caption = '', grade = 1 } = req.body || {};

  const ALLOWED_TYPES = new Set([
    'hs',
    'gv',
    'cs',
    'tt',
    'shape_rect',
    'shape_circle',
    'line_solid',
    'line_dashed',
    'arrow_straight',
    'arrow_curved',
    'ball',
    'marker',
    'cone',
    'hoop',
    'stick',
    'flag',
    'text',
    'sgk_board'
  ]);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(val)));

  const sanitizeElements = (rawElements: any[]): any[] => {
    if (!Array.isArray(rawElements)) return [];
    const cleaned: any[] = [];
    rawElements.slice(0, 70).forEach((el, idx) => {
      if (!el || typeof el !== 'object') return;
      const type = ALLOWED_TYPES.has(el.type) ? el.type : 'hs';
      const item: any = {
        id: typeof el.id === 'string' && el.id.trim() ? el.id.trim() : `ref_${type}_${idx}_${Date.now()}`,
        type,
        x: clamp(Number(el.x) || 320, 30, 610),
        y: clamp(Number(el.y) || 220, 68, 405),
        color: typeof el.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(el.color) ? el.color : '#2563eb'
      };
      if (el.label !== undefined && el.label !== null) item.label = String(el.label).slice(0, 60);
      if (el.radius !== undefined) item.radius = clamp(Number(el.radius) || 12, 6, 150);
      if (el.width !== undefined) item.width = clamp(Number(el.width) || 120, 20, 560);
      if (el.height !== undefined) item.height = clamp(Number(el.height) || 70, 6, 320);
      if (el.fontSize !== undefined) item.fontSize = clamp(Number(el.fontSize) || 12, 9, 22);
      if (type === 'line_solid' || type === 'line_dashed' || type === 'arrow_straight' || type === 'arrow_curved') {
        item.endX = clamp(Number(el.endX) || item.x + 100, 30, 610);
        item.endY = clamp(Number(el.endY) || item.y, 68, 405);
      }
      cleaned.push(item);
    });
    return cleaned;
  };

  const synthesizeGameElementsFromMeta = (rawTitle: string, rawCaption: string, gradeVal: number) => {
    const cleanTitle = (rawTitle || 'Trò chơi vận động').replace(/\s*-\s*SGK.*$/i, '').trim();
    const corpus = `${rawTitle} ${rawCaption}`.toLowerCase();
    const gNum = Number(gradeVal) || 1;
    const baseGv = { id: 'gv_main', type: 'gv', x: 320, y: 82, color: '#dc2626', label: 'GV Điều Hành' };

    // 1. Mèo đuổi chuột / Vòng tròn làm hang
    if (corpus.includes('mèo đuổi chuột') || (corpus.includes('mèo') && corpus.includes('chuột'))) {
      const circlePts = Array.from({ length: 12 }, (_, i) => {
        const ang = (i * 2 * Math.PI) / 12;
        return {
          id: `ring_hs_${i}`,
          type: 'hs',
          x: Math.round(320 + 115 * Math.cos(ang)),
          y: Math.round(238 + 95 * Math.sin(ang)),
          color: '#0284c7',
          radius: 11
        };
      });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: 'Vòng tròn giơ tay làm hang · Mèo đuổi Chuột',
        description: 'HS nắm tay xếp vòng tròn giơ cao làm hang, Mèo và Chuột luồn lách qua các hang theo hiệu lệnh GV.',
        phase: 'tro_choi',
        elements: [
          baseGv,
          { id: 'ring_area', type: 'shape_circle', x: 320, y: 238, radius: 115, color: '#0284c7', label: 'Vòng tròn làm hang' },
          ...circlePts,
          { id: 'mouse', type: 'hs', x: 320, y: 238, radius: 13, color: '#16a34a', label: 'Chuột' },
          { id: 'cat', type: 'hs', x: 145, y: 185, radius: 13, color: '#ea580c', label: 'Mèo' },
          { id: 'chase_arrow', type: 'arrow_curved', x: 162, y: 190, endX: 300, endY: 232, color: '#ea580c', label: 'Đuổi bắt' },
          { id: 'txt_note', type: 'text', x: 320, y: 392, color: '#475569', label: 'Cả lớp đọc vè/vỗ tay · Đổi vai Mèo & Chuột sau mỗi lượt', fontSize: 11.5 }
        ]
      };
    }

    // 2. Chui qua hầm / Chui qua cổng
    if (corpus.includes('chui qua hầm') || corpus.includes('qua hầm') || corpus.includes('qua cổng')) {
      const elements: any[] = [
        baseGv,
        { id: 'xp_line', type: 'line_solid', x: 105, y: 125, endX: 105, endY: 355, color: '#dc2626', label: 'Vạch XP' },
        { id: 'dich_flag_1', type: 'flag', x: 545, y: 165, color: '#16a34a', label: 'Cờ 1' },
        { id: 'dich_flag_2', type: 'flag', x: 545, y: 285, color: '#16a34a', label: 'Cờ 2' }
      ];
      // 2 đường hầm (hàng đôi giơ tay tạo hầm)
      [165, 285].forEach((laneY, lIdx) => {
        for (let k = 0; k < 5; k++) {
          const hx = 195 + k * 65;
          elements.push({ id: `tunnel_top_${lIdx}_${k}`, type: 'hs', x: hx, y: laneY - 22, color: '#2563eb', radius: 10 });
          elements.push({ id: `tunnel_bot_${lIdx}_${k}`, type: 'hs', x: hx, y: laneY + 22, color: '#0284c7', radius: 10 });
        }
        elements.push({ id: `runner_${lIdx}`, type: 'hs', x: 132, y: laneY, color: '#ea580c', radius: 11, label: 'Chui' });
        elements.push({ id: `arrow_${lIdx}`, type: 'arrow_straight', x: 148, y: laneY, endX: 525, endY: laneY, color: '#16a34a' });
        elements.push({ id: `wait_${lIdx}_1`, type: 'hs', x: 75, y: laneY, color: '#1e293b', radius: 10 });
        elements.push({ id: `wait_${lIdx}_2`, type: 'hs', x: 48, y: laneY, color: '#1e293b', radius: 10 });
      });
      elements.push({ id: 'txt_ham', type: 'text', x: 320, y: 392, color: '#475569', label: 'Hai hàng nắm tay giơ cao tạo đường hầm · Chui khéo léo qua hầm về cờ đích', fontSize: 11.5 });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: '2 đường hầm song song · Khéo léo & nhanh nhẹn',
        description: 'Các bạn xếp 2 hàng nắm tay giơ cao tạo thành hầm, lần lượt từng bạn cúi chui khéo léo qua hầm về đích.',
        phase: 'tro_choi',
        elements
      };
    }

    // 3. Kéo co / Ai kéo khỏe hơn
    if (corpus.includes('kéo co') || corpus.includes('kéo khỏe') || corpus.includes('kéo khoẻ')) {
      const elements: any[] = [
        baseGv,
        { id: 'center_circle', type: 'shape_circle', x: 320, y: 235, radius: 34, color: '#dc2626', label: 'Vùng tâm' },
        { id: 'line_left', type: 'line_dashed', x: 255, y: 145, endX: 255, endY: 330, color: '#2563eb', label: 'Giới hạn A' },
        { id: 'line_mid', type: 'line_solid', x: 320, y: 135, endX: 320, endY: 340, color: '#dc2626', label: 'Vạch Giữa' },
        { id: 'line_right', type: 'line_dashed', x: 385, y: 145, endX: 385, endY: 330, color: '#16a34a', label: 'Giới hạn B' },
        { id: 'rope', type: 'line_solid', x: 105, y: 235, endX: 535, endY: 235, color: '#b45309', label: 'Dây thừng' },
        { id: 'ribbon', type: 'flag', x: 320, y: 220, color: '#dc2626', label: 'Dải đỏ' }
      ];
      [225, 190, 155, 120].forEach((x, i) => {
        elements.push({ id: `teamA_${i}`, type: 'hs', x, y: i % 2 === 0 ? 216 : 254, color: '#2563eb', radius: 11, label: `A${i + 1}` });
      });
      [415, 450, 485, 520].forEach((x, i) => {
        elements.push({ id: `teamB_${i}`, type: 'hs', x, y: i % 2 === 0 ? 216 : 254, color: '#16a34a', radius: 11, label: `B${i + 1}` });
      });
      elements.push({ id: 'txt_kc', type: 'text', x: 320, y: 392, color: '#475569', label: 'Hai đội bám chắc dây · Kéo dải đỏ qua vạch giới hạn sẽ thắng', fontSize: 11.5 });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: '2 đội đối kháng qua vạch giới hạn',
        description: 'Hai đội lực lượng cân bằng đứng so le hai bên dây thừng, kéo theo hiệu lệnh còi của GV.',
        phase: 'tro_choi',
        elements
      };
    }

    // 4. Cướp cờ
    if (corpus.includes('cướp cờ')) {
      const elements: any[] = [
        baseGv,
        { id: 'line_a', type: 'line_solid', x: 95, y: 125, endX: 95, endY: 350, color: '#2563eb', label: 'Đội A' },
        { id: 'line_b', type: 'line_solid', x: 545, y: 125, endX: 545, endY: 350, color: '#16a34a', label: 'Đội B' },
        { id: 'center_ring', type: 'shape_circle', x: 320, y: 238, radius: 36, color: '#dc2626', label: 'Vòng Cờ' },
        { id: 'center_flag', type: 'flag', x: 320, y: 238, color: '#dc2626', label: 'Cờ Đích' },
        { id: 'arr_a', type: 'arrow_straight', x: 115, y: 222, endX: 295, endY: 235, color: '#2563eb' },
        { id: 'arr_b', type: 'arrow_straight', x: 525, y: 254, endX: 345, endY: 241, color: '#16a34a' }
      ];
      [145, 195, 245, 295, 340].forEach((y, i) => {
        elements.push({ id: `a_${i}`, type: 'hs', x: 70, y, color: '#2563eb', radius: 11, label: String(i + 1) });
        elements.push({ id: `b_${i}`, type: 'hs', x: 570, y, color: '#16a34a', radius: 11, label: String(i + 1) });
      });
      elements.push({ id: 'txt_cc', type: 'text', x: 320, y: 392, color: '#475569', label: 'GV gọi số nào hai bạn số đó chạy vào vòng tròn tranh cờ về vạch đội mình', fontSize: 11.5 });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: '2 đội đối diện đánh số 1-5 · Cờ trung tâm',
        description: 'Hai đội đứng đối diện sau vạch xuất phát, nghe gọi số nhanh chóng lao vào vòng trung tâm lấy cờ.',
        phase: 'tro_choi',
        elements
      };
    }

    // 5. Ném bóng trúng đích
    if (corpus.includes('ném bóng') || corpus.includes('trúng đích')) {
      const elements: any[] = [
        baseGv,
        { id: 'throw_line', type: 'line_solid', x: 165, y: 115, endX: 165, endY: 360, color: '#dc2626', label: 'Vạch Ném (3-4m)' }
      ];
      [155, 235, 315].forEach((y, idx) => {
        elements.push({ id: `q_${idx}_1`, type: 'hs', x: 138, y, color: '#2563eb', radius: 11 });
        elements.push({ id: `q_${idx}_2`, type: 'hs', x: 96, y, color: '#1e293b', radius: 10 });
        elements.push({ id: `ball_${idx}`, type: 'ball', x: 154, y: y - 10, color: '#ea580c', radius: 9 });
        elements.push({ id: `hoop_${idx}`, type: 'hoop', x: 515, y, color: '#d97706', radius: 22, label: `Đích ${idx + 1}` });
        elements.push({ id: `traj_${idx}`, type: 'arrow_curved', x: 175, y, endX: 488, endY: y, color: '#ea580c' });
      });
      elements.push({ id: 'txt_nb', type: 'text', x: 320, y: 392, color: '#475569', label: 'Đứng sau vạch giới hạn ngắm chuẩn ném bóng lọt vòng/rổ đích', fontSize: 11.5 });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: 'Vạch giới hạn 3-4m · Quỹ đạo ném đích',
        description: 'Các tổ xếp hàng dọc sau vạch ném, lần lượt ngắm ném bóng vào rổ/vòng tròn đích để tính điểm.',
        phase: 'tro_choi',
        elements
      };
    }

    // 6. Thỏ nhường hang / Kết bạn / Vòng tròn / Làm theo hiệu lệnh
    if (corpus.includes('thỏ') || corpus.includes('kết bạn') || corpus.includes('vòng tròn') || corpus.includes('hiệu lệnh') || corpus.includes('chim về tổ')) {
      const elements: any[] = [baseGv];
      if (corpus.includes('thỏ') || corpus.includes('chim')) {
        const nests = [
          { x: 175, y: 170 },
          { x: 465, y: 170 },
          { x: 175, y: 305 },
          { x: 465, y: 305 },
          { x: 320, y: 238 }
        ];
        nests.forEach((n, idx) => {
          elements.push({ id: `hoop_${idx}`, type: 'hoop', x: n.x, y: n.y, color: '#06b6d4', radius: 34, label: `Hang ${idx + 1}` });
          elements.push({ id: `wall1_${idx}`, type: 'hs', x: n.x - 16, y: n.y + 4, color: '#2563eb', radius: 9 });
          elements.push({ id: `wall2_${idx}`, type: 'hs', x: n.x + 16, y: n.y + 4, color: '#16a34a', radius: 9 });
        });
        elements.push({ id: 'move_1', type: 'arrow_curved', x: 215, y: 185, endX: 285, endY: 225, color: '#ea580c' });
        elements.push({ id: 'move_2', type: 'arrow_curved', x: 355, y: 255, endX: 430, endY: 295, color: '#ea580c' });
        elements.push({ id: 'txt_tho', type: 'text', x: 320, y: 392, color: '#475569', label: 'Nghe hiệu lệnh nhanh chóng di chuyển đổi hang/tổ an toàn', fontSize: 11.5 });
      } else {
        elements.push({ id: 'circle_main', type: 'shape_circle', x: 320, y: 240, radius: 110, color: '#3b82f6', label: 'Vòng tròn' });
        for (let i = 0; i < 12; i++) {
          const ang = (i * 2 * Math.PI) / 12;
          elements.push({
            id: `c_hs_${i}`,
            type: 'hs',
            x: Math.round(320 + 110 * Math.cos(ang)),
            y: Math.round(240 + 92 * Math.sin(ang)),
            color: i % 2 === 0 ? '#2563eb' : '#0284c7',
            radius: 10.5
          });
        }
        elements.push({ id: 'dir_arr', type: 'arrow_curved', x: 365, y: 138, endX: 432, endY: 192, color: '#16a34a', label: 'Chạy vòng' });
        elements.push({ id: 'txt_vc', type: 'text', x: 320, y: 392, color: '#475569', label: 'Cả lớp di chuyển vòng tròn, phản xạ nhanh theo hiệu lệnh / số lượng kết nhóm', fontSize: 11.5 });
      }
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: 'Đội hình vòng tròn / Cụm hang phản xạ',
        description: 'Học sinh di chuyển theo vòng tròn hoặc cụm ô mốc, lắng nghe hiệu lệnh của GV để phản xạ nhanh.',
        phase: 'tro_choi',
        elements
      };
    }

    // 7. Tam giác
    if (corpus.includes('tam giác')) {
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: '3 cọc mốc A - B - C hình tam giác',
        description: 'Học sinh chạy nối tiếp vòng qua 3 cọc mốc hình tam giác theo chiều mũi tên chỉ dẫn.',
        phase: 'tro_choi',
        elements: [
          baseGv,
          { id: 'cone_a', type: 'cone', x: 320, y: 145, color: '#ea580c', label: 'Mốc A' },
          { id: 'cone_b', type: 'cone', x: 485, y: 320, color: '#ea580c', label: 'Mốc B' },
          { id: 'cone_c', type: 'cone', x: 155, y: 320, color: '#ea580c', label: 'Mốc C' },
          { id: 'arr_ab', type: 'arrow_straight', x: 340, y: 162, endX: 468, endY: 300, color: '#16a34a' },
          { id: 'arr_bc', type: 'arrow_straight', x: 460, y: 320, endX: 180, endY: 320, color: '#16a34a' },
          { id: 'arr_ca', type: 'arrow_straight', x: 170, y: 300, endX: 300, endY: 162, color: '#16a34a' },
          { id: 'runner_1', type: 'hs', x: 295, y: 175, color: '#2563eb', radius: 11 },
          { id: 'runner_2', type: 'hs', x: 120, y: 320, color: '#1e293b', radius: 10 },
          { id: 'runner_3', type: 'hs', x: 92, y: 320, color: '#1e293b', radius: 10 },
          { id: 'txt_tg', type: 'text', x: 320, y: 392, color: '#475569', label: 'Chạy vòng quanh 3 cọc mốc A → B → C · Chạm tay tiếp sức', fontSize: 11.5 }
        ]
      };
    }

    // 8. Lò cò tiếp sức / Nhảy ô tiếp sức
    if (corpus.includes('lò cò') || corpus.includes('nhảy ô') || corpus.includes('nhảy bao bố')) {
      const elements: any[] = [
        baseGv,
        { id: 'xp_line', type: 'line_solid', x: 115, y: 115, endX: 115, endY: 365, color: '#dc2626', label: 'Vạch XP' }
      ];
      const lanes = [150, 215, 280, 345];
      lanes.forEach((ly, lIdx) => {
        for (let q = 0; q < 3; q++) {
          elements.push({ id: `q_${lIdx}_${q}`, type: 'hs', x: 45 + q * 24, y: ly, color: '#1e293b', radius: 9.5 });
        }
        [185, 250, 315, 380].forEach((hx, hIdx) => {
          elements.push({ id: `hoop_${lIdx}_${hIdx}`, type: 'hoop', x: hx, y: ly, color: '#06b6d4', radius: 16 });
        });
        elements.push({ id: `cone_${lIdx}`, type: 'cone', x: 525, y: ly, color: '#ea580c', label: `Mốc ${lIdx + 1}` });
        elements.push({ id: `arr_go_${lIdx}`, type: 'arrow_straight', x: 405, y: ly - 6, endX: 505, endY: ly - 6, color: '#16a34a' });
        elements.push({ id: `arr_back_${lIdx}`, type: 'arrow_curved', x: 505, y: ly + 10, endX: 128, endY: ly + 12, color: '#2563eb' });
      });
      elements.push({ id: 'txt_lc', type: 'text', x: 320, y: 396, color: '#475569', label: 'Nhảy qua các vòng tròn đích, vòng qua cọc mốc rồi chạy về vỗ tay bạn tiếp theo', fontSize: 11.5 });
      return {
        name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
        subtitle: '4 làn tiếp sức · Vòng đích & Cọc tiêu quay đầu',
        description: '4 tổ xếp hàng dọc sau vạch xuất phát, bật nhảy vào từng ô vòng, vòng qua cọc tiêu chạy về tiếp sức.',
        phase: 'tro_choi',
        elements
      };
    }

    // 9. Mặc định thông minh: Đua ô tô / Trao gậy / Tiếp sức 4 làn chuẩn
    const useStick = corpus.includes('gậy') || gNum === 5;
    const useBall = corpus.includes('bóng') || corpus.includes('đua ô tô') || corpus.includes('ô tô');
    const elements: any[] = [
      baseGv,
      { id: 'xp_line', type: 'line_solid', x: 125, y: 115, endX: 125, endY: 365, color: '#dc2626', label: 'Vạch XP' }
    ];
    [150, 215, 280, 345].forEach((ly, lIdx) => {
      elements.push({ id: `lane_sep_${lIdx}`, type: 'line_dashed', x: 125, y: ly + 28, endX: 540, endY: ly + 28, color: '#cbd5e1' });
      for (let q = 0; q < 3; q++) {
        elements.push({
          id: `wait_${lIdx}_${q}`,
          type: q === 2 ? 'tt' : 'hs',
          x: 50 + q * 26,
          y: ly,
          color: q === 2 ? '#ea580c' : '#1e293b',
          radius: 10,
          label: q === 2 ? `T${lIdx + 1}` : undefined
        });
      }
      elements.push({ id: `runner_${lIdx}`, type: 'hs', x: 245 + (lIdx % 2) * 45, y: ly, color: '#2563eb', radius: 11 });
      if (useStick) {
        elements.push({ id: `stick_${lIdx}`, type: 'stick', x: 262 + (lIdx % 2) * 45, y: ly - 10, width: 28, height: 6, color: '#d97706' });
      } else if (useBall) {
        elements.push({ id: `ball_${lIdx}`, type: 'ball', x: 262 + (lIdx % 2) * 45, y: ly - 10, radius: 8, color: '#ea580c' });
      }
      elements.push({ id: `cone_${lIdx}`, type: 'cone', x: 525, y: ly, color: '#ea580c', label: `Đích ${lIdx + 1}` });
      elements.push({ id: `arr_go_${lIdx}`, type: 'arrow_straight', x: 135, y: ly - 8, endX: 500, endY: ly - 8, color: '#16a34a' });
      elements.push({ id: `arr_ret_${lIdx}`, type: 'arrow_curved', x: 505, y: ly + 10, endX: 138, endY: ly + 12, color: '#2563eb' });
    });
    elements.push({
      id: 'txt_default_tc',
      type: 'text',
      x: 320,
      y: 396,
      color: '#475569',
      label: useStick
        ? '4 làn tiếp sức · Vòng qua cọc mốc chạy về trao gậy an toàn cho đồng đội'
        : '4 làn chạy tiếp sức · Vòng qua cọc tiêu quay về chạm tay bạn kế tiếp',
      fontSize: 11.5
    });

    return {
      name: `Sơ đồ Trò chơi: ${cleanTitle} (Khối ${gNum})`,
      subtitle: useStick ? '4 làn tiếp sức trao gậy & cọc mốc' : '4 làn tiếp sức & cọc mốc quay đầu',
      description: 'Bố trí 4 hàng dọc sau vạch xuất phát, lần lượt di chuyển qua mốc quay đầu về tiếp sức đồng đội.',
      phase: 'tro_choi',
      elements
    };
  };

  const fallbackResult = synthesizeGameElementsFromMeta(gameTitle, caption, Number(grade) || 1);
  const resolvedImage = extractBase64Data(imageBase64);

  if (aiClient && resolvedImage) {
    try {
      const visionPrompt = `Bạn là chuyên gia Giáo dục Thể chất Tiểu học (GDPT 2018). Hãy quan sát thật kỹ BỨC ẢNH TRÒ CHƠI VẬN ĐỘNG này và dựng lại thành SƠ ĐỒ ĐỘI HÌNH TRÊN SÂN BÃI kích thước chuẩn SVG 640x430.
Thông tin gợi ý:
- Tên trò chơi: "${gameTitle || 'Chưa rõ'}"
- Mô tả thêm: "${caption || 'Không có'}"
- Khối lớp: Lớp ${grade}

YÊU CẦU TỌA ĐỘ TRÊN SÂN BÃI (Rất quan trọng):
- Toàn bộ các đối tượng PHẢI nằm gọn trong khung sân: x từ 45 đến 595, y từ 78 đến 392.
- Đặt Giáo viên ("gv") quan sát ở phía trên (y khoảng 78-95) nếu phù hợp.
- Nếu trò chơi xếp vòng tròn: dùng "shape_circle" ở tâm (320, 238) + nhiều "hs" xếp quanh chu vi + người chạy/bắt ở trong hoặc ngoài + "arrow_curved" chỉ hướng di chuyển.
- Nếu trò chơi xếp hàng dọc/tiếp sức/chui hầm/nhảy ô: vẽ "line_solid" (vạch xuất phát), các hàng "hs" sau vạch, dụng cụ ("cone" cọc tiêu, "hoop" vòng tròn, "ball" bóng, "stick" gậy, "flag" cờ đích), và "arrow_straight"/"arrow_curved" chỉ hướng chạy đi và quay về.
- Nếu trò chơi đối kháng (kéo co, cướp cờ): vẽ hai đội đối xứng trái-phải qua vạch ranh giới giữa sân.
- Chỉ dùng các type hợp lệ: "gv", "hs", "cs", "tt", "cone", "hoop", "ball", "flag", "stick", "marker", "line_solid", "line_dashed", "arrow_straight", "arrow_curved", "shape_rect", "shape_circle", "text".
- Thêm 1 phần tử "text" hướng dẫn ngắn ở đáy sân (x=320, y=392).`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: resolvedImage.mimeType,
                  data: resolvedImage.data
                }
              },
              { text: visionPrompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              description: { type: Type.STRING },
              phase: { type: Type.STRING },
              elements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    endX: { type: Type.NUMBER },
                    endY: { type: Type.NUMBER },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    radius: { type: Type.NUMBER },
                    fontSize: { type: Type.NUMBER },
                    color: { type: Type.STRING },
                    label: { type: Type.STRING }
                  },
                  required: ['type', 'x', 'y', 'color']
                }
              }
            },
            required: ['name', 'subtitle', 'description', 'elements']
          }
        }
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const cleanedElements = sanitizeElements(parsed.elements);
      if (cleanedElements.length >= 4) {
        return res.json({
          success: true,
          source: 'gemini-4-hydrogen-vision',
          name: parsed.name || fallbackResult.name,
          subtitle: parsed.subtitle || fallbackResult.subtitle,
          description: parsed.description || fallbackResult.description,
          phase: parsed.phase === 'khoi_dong' ? 'khoi_dong' : 'tro_choi',
          elements: cleanedElements
        });
      }
    } catch (err: any) {
      console.warn('Gemini game-image-to-diagram fallback notice:', err?.message);
    }
  }

  return res.json({
    success: true,
    source: 'heuristic-game-layout',
    ...fallbackResult
  });
});

// API: Nhận diện chính xác tọa độ các khối động tác nguyên vẹn (tránh cắt đứt chân, loại bỏ chữ và icon)
app.post('/api/ai/detect-figures', async (req: Request, res: Response) => {
  const { imageBase64, pageNum } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu ảnh' });
  }

  // Heuristic rule-based fallback if API is unreachable
  const getFallbackBoxes = () => {
    return [
      {
        box_2d: [350, 40, 950, 960], // Lower full region containing complete student bodies and feet
        name: `Động tác thể dục trọn vẹn (Trang ${pageNum || 1})`,
        category: 'dong_tac'
      }
    ];
  };

  if (!aiClient) {
    return res.json({ success: true, figures: getFallbackBoxes() });
  }

  try {
    let cleanBase64 = imageBase64;
    let mimeType = 'image/png';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/png';
      cleanBase64 = parts[1];
    } else if (imageBase64.startsWith('data:image/svg+xml')) {
      return res.json({ success: true, figures: getFallbackBoxes() });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'image/jpeg' : 'image/png',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Bạn là hệ thống AI phân tích tài liệu sách giáo khoa Giáo Dục Thể Chất tiểu học (Chương trình GDPT 2018).
Nhiệm vụ: Phát hiện tọa độ các KHỐI HÌNH ĐỘNG TÁC HỌC SINH trong trang sách này để trích xuất chèn vào giáo án.

QUY TẮC BẮT BUỘC ĐỂ TRÁNH LỖI CẮT HÌNH:
1. NGUYÊN VẸN CƠ THỂ: Mỗi bounding box PHẢI BAO TRỌN VẸN toàn bộ người học sinh từ đỉnh đầu, hai tay mở rộng, thân mình xuống tận HẾT BÀN CHÂN VÀ GIÀY tiếp đất. TUYỆT ĐỐI KHÔNG CẮT ĐỨT NGANG THÂN, NGANG HÔNG HOẶC NGANG CHÂN.
2. LOẠI BỎ TRIỆT ĐỂ YẾU TỐ RÁC:
   - KHÔNG bao gồm các dòng chữ tiêu đề bên trên hoặc bên cạnh (ví dụ: "1 Khởi động", "1. Động tác vươn thở", "2. Động tác tay").
   - KHÔNG bao gồm các hộp ghi chú chữ màu vàng/xanh (ví dụ: "- Nghiêm túc, tích cực trong tập luyện.").
   - KHÔNG bao gồm các icon hoạt hình phụ ở góc (ví dụ: hình cậu bé đọc sách, hình con vật trang trí, số 1, 2 tròn).
   - KHÔNG bao gồm số trang, logo NXB.
3. Box chỉ chứa ĐÚNG HÌNH CÁC HỌC SINH ĐANG TẬP ĐỘNG TÁC hoặc sơ đồ sân khấu/vòng tròn trò chơi.
4. Tọa độ box_2d chuẩn hóa [ymin, xmin, ymax, xmax] trong khoảng [0, 1000].

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng:
{
  "figures": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "name": "Tên động tác nhận diện được",
      "category": "dong_tac"
    }
  ]
}`
    };

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const figures = parsed.figures && Array.isArray(parsed.figures) && parsed.figures.length > 0
      ? parsed.figures
      : getFallbackBoxes();

    return res.json({ success: true, figures });
  } catch (err: any) {
    console.warn('Detect figures AI error notice:', err?.message);
    return res.json({ success: true, figures: getFallbackBoxes() });
  }
});

// API: Sinh kịch bản sư phạm phong phú chi tiết cho GDTC bằng AI
app.post('/api/ai/generate-scenario', async (req: Request, res: Response) => {
  const { title, category, grade } = req.body;

  const fallbackScenario = {
    lvd: "5 - 7'",
    gv: `- GV làm mẫu chuẩn xác 2-3 lần (đứng phương pháp soi gương hoặc cùng hướng phù hợp).\n- Phân tích chi tiết khẩu lệnh dự lệnh và động lệnh, nhịp hô 1-2-3-4 dứt khoát.\n- Chỉ ra các lỗi sai học sinh hay mắc (thân người chao đảo, tay chưa căng, bước lệch nhịp) và cách khắc phục.\n- Điều hành học sinh tập luyện nhịp nhàng, uốn nắn tư thế cho từng em.\n- Nhắc nhở tinh thần kiên trì, tương trợ bạn trong tổ.`,
    hs: `- Đội hình 4 hàng ngang cự ly 1 sải tay đứng so le.\n- Quan sát kỹ mẫu và lắng nghe giải thích để ghi nhớ yếu lĩnh kỹ thuật.\n- Cả lớp tập mô phỏng đồng loạt theo nhịp đếm dứt khoát của giáo viên.\n- Cặp đôi đổi vai nhận xét, uốn nắn biên độ tay chân cho nhau.\n- Tích cực trao đổi, nêu câu hỏi thắc mắc nếu chưa rõ.`
  };

  if (!aiClient) {
    return res.json({ success: true, scenario: fallbackScenario });
  }

  try {
    const prompt = `Bạn là giảng viên sư phạm thể thao chuyên về môn Giáo dục Thể chất tiểu học Việt Nam (GDPT 2018).
Hãy soạn một kịch bản chi tiết, sâu sắc sư phạm cho hoạt động sau:
- Tên hoạt động / Động tác: ${title || 'Bài tập thể dục'}
- Loại hoạt động: ${category || 'Động tác mới'}
- Khối lớp: ${grade || 'Chung'}

Yêu cầu kịch bản chi tiết:
1. "lvd": Lượng vận động (ví dụ: "5 - 7'", "2L x 8N", "3-4 lần")
2. "gv": Hoạt động của Giáo viên (ít nhất 4-5 gạch đầu dòng chi tiết: khẩu lệnh cụ thể, hướng dẫn thị phạm, phân tích nhịp, các lỗi sai thường gặp và cách sửa, tích hợp phẩm chất/kỹ năng sống)
3. "hs": Hoạt động của Học sinh (ít nhất 4-5 gạch đầu dòng chi tiết: đội hình tập hợp, cự ly hàng lối, hành động thực hiện theo nhịp, tập cặp đôi sửa sai, phản hồi của học sinh)

Trả về DUY NHẤT một chuỗi JSON hợp lệ:
{
  "lvd": "...",
  "gv": "...",
  "hs": "..."
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      scenario: {
        lvd: parsed.lvd || fallbackScenario.lvd,
        gv: parsed.gv || fallbackScenario.gv,
        hs: parsed.hs || fallbackScenario.hs
      }
    });
  } catch (err: any) {
    console.warn('Scenario AI generation notice, fallback:', err?.message);
    return res.json({ success: true, scenario: fallbackScenario });
  }
});

// API: Phân tích nội dung SGK & sinh sơ đồ đội hình thể dục chuyên nghiệp bằng Gemini AI
app.post('/api/ai/generate-formation', async (req: Request, res: Response) => {
  const { title, description, formationType } = req.body;
  const safeTitle = (title || 'SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN').toUpperCase();
  const desc = description || '';

  const generateProgrammaticSvg = (t: string, d: string): string => {
    const isTriangle = d.toLowerCase().includes('tam giác') || t.toLowerCase().includes('tam giác');
    const isRelay = d.toLowerCase().includes('tiếp sức') || d.toLowerCase().includes('chuyền');
    
    let diagramInner = '';
    if (isTriangle) {
      diagramInner = `
        <polygon points="160,30 152,45 168,45" fill="#dc2626"/>
        <text x="160" y="55" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
        <polygon points="60,175 160,70 260,175" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,4"/>
        <polygon points="60,165 52,185 68,185" fill="#ea580c"/>
        <polygon points="160,60 152,80 168,80" fill="#0284c7"/>
        <polygon points="260,165 252,185 268,185" fill="#0284c7"/>
        <text x="60" y="198" font-size="9" font-weight="bold" fill="#c2410c" text-anchor="middle">Cọc A (XP)</text>
        <text x="160" y="92" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle">Cọc B</text>
        <text x="260" y="198" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle">Cọc C</text>
        <g fill="#1e293b"><circle cx="45" cy="175" r="4"/><circle cx="35" cy="175" r="4"/><circle cx="25" cy="175" r="4"/></g>
        <path d="M 85 145 L 135 90" stroke="#15803d" stroke-width="2" marker-end="url(#arrow)"/>
      `;
    } else if (isRelay) {
      diagramInner = `
        <polygon points="160,30 152,45 168,45" fill="#dc2626"/>
        <text x="160" y="55" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV / Trọng tài</text>
        <line x1="60" y1="65" x2="60" y2="175" stroke="#dc2626" stroke-width="2"/>
        <line x1="255" y1="65" x2="255" y2="175" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
        <g fill="#1e293b"><circle cx="30" cy="85" r="4"/><circle cx="42" cy="85" r="4"/><circle cx="30" cy="115" r="4"/><circle cx="42" cy="115" r="4"/><circle cx="30" cy="145" r="4"/><circle cx="42" cy="145" r="4"/><circle cx="30" cy="175" r="4"/><circle cx="42" cy="175" r="4"/></g>
        <polygon points="255,80 250,90 260,90" fill="#dc2626"/>
        <polygon points="255,110 250,120 260,120" fill="#dc2626"/>
        <polygon points="255,140 250,150 260,150" fill="#dc2626"/>
        <polygon points="255,170 250,180 260,180" fill="#dc2626"/>
        <path d="M 65 85 L 245 85" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
        <path d="M 65 115 L 245 115" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
        <path d="M 65 145 L 245 145" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
        <path d="M 65 175 L 245 175" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
      `;
    } else {
      diagramInner = `
        <polygon points="160,30 150,48 170,48" fill="#dc2626"/>
        <text x="160" y="60" font-family="sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle"> GV</text>
        <g fill="#0284c7">
          <circle cx="60" cy="90" r="5"/><circle cx="100" cy="90" r="5"/><circle cx="140" cy="90" r="5"/><circle cx="180" cy="90" r="5"/><circle cx="220" cy="90" r="5"/><circle cx="260" cy="90" r="5"/>
          <circle cx="80" cy="120" r="5"/><circle cx="120" cy="120" r="5"/><circle cx="160" cy="120" r="5"/><circle cx="200" cy="120" r="5"/><circle cx="240" cy="120" r="5"/>
          <circle cx="60" cy="150" r="5"/><circle cx="100" cy="150" r="5"/><circle cx="140" cy="150" r="5"/><circle cx="180" cy="150" r="5"/><circle cx="220" cy="150" r="5"/><circle cx="260" cy="150" r="5"/>
          <circle cx="80" cy="175" r="5"/><circle cx="120" cy="175" r="5"/><circle cx="160" cy="175" r="5"/><circle cx="200" cy="175" r="5"/><circle cx="240" cy="175" r="5"/>
        </g>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="215" viewBox="0 0 320 215">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d"/>
          </marker>
        </defs>
        <rect width="320" height="215" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="0" y="0" width="320" height="26" rx="9" fill="#f8fafc"/>
        <line x1="0" y1="26" x2="320" y2="26" stroke="#e2e8f0" stroke-width="1"/>
        <text x="12" y="17" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e293b">${t}</text>
        <text x="308" y="17" font-family="sans-serif" font-size="9" font-weight="600" fill="#64748b" text-anchor="end">AI Đội Hình</text>
        ${diagramInner}
        <text x="160" y="204" font-family="sans-serif" font-size="9" font-weight="600" fill="#475569" text-anchor="middle">${d.substring(0, 48) || 'Sơ đồ tổ chức tập luyện thể dục'}</text>
      </svg>
    `.trim();
  };

  if (!aiClient) {
    const rawSvg = generateProgrammaticSvg(safeTitle, desc);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
    return res.json({ success: true, svgDataUrl, svgRaw: rawSvg });
  }

  try {
    const prompt = `Bạn là chuyên gia giáo dục thể chất tiểu học (GDPT 2018). Hãy tạo MỘT SƠ ĐỒ ĐỘI HÌNH dạng SVG vector hoàn chỉnh (width="320" height="215" viewBox="0 0 320 215") cho hoạt động:
Tên hoạt động: "${safeTitle}"
Mô tả/Kỹ thuật: "${desc}"
Loại hình: "${formationType || 'Tự động xác định'}"

QUY TẮC BẮT BUỘC TRONG SƠ ĐỒ THỂ CHẤT:
1. Nếu là "chạy theo hình tam giác", BẮT BUỘC vẽ tam giác với 3 cọc mốc A, B, C, đường chạy A -> B -> C -> A và hàng chờ xuất phát, TUYỆT ĐỐI KHÔNG ĐƯỢC VẼ VÒNG TRÒN!
2. Nếu là "chuyền gậy tiếp sức" hoặc "tiếp sức", BẮT BUỘC vẽ các làn chạy song song, vạch xuất phát, cọc cờ mốc quay đầu và các mũi tên di chuyển.
3. Ký hiệu quy ước thể dục:
   - Giáo viên (GV): hình tam giác đỏ <polygon points="160,30 152,45 168,45" fill="#dc2626"/> kèm chữ " GV"
   - Cán sự / Tổ trưởng: hình tròn viền cam hoặc chữ "CS" / "TT"
   - Học sinh: các chấm tròn <circle r="4.5" fill="#0284c7" hoặc fill="#1e293b"/>
   - Hướng di chuyển: mũi tên nét đứt rõ ràng có marker-end.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo schema:
{
  "name": "Tên sơ đồ",
  "description": "Tóm tắt cách tổ chức",
  "svg": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"320\\" height=\\"215\\" viewBox=\\"0 0 320 215\\">...</svg>"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const svg = parsed.svg && parsed.svg.includes('<svg') ? parsed.svg : generateProgrammaticSvg(safeTitle, desc);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return res.json({
      success: true,
      svgDataUrl,
      svgRaw: svg,
      name: parsed.name || safeTitle,
      description: parsed.description || desc
    });
  } catch (err: any) {
    console.warn('AI formation generation notice, using algorithmic SVG:', err?.message);
    const rawSvg = generateProgrammaticSvg(safeTitle, desc);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
    return res.json({ success: true, svgDataUrl, svgRaw: rawSvg });
  }
});

// Helper: Sinh nhân vật hoạt hình 2D/3D SGK GDTC nền trong suốt, hỗ trợ cả Cá nhân, Cặp đôi và Trò chơi nhiều người (3-5 em)
function generate3dCartoonSvg(
  movementName: string,
  grade: string | number,
  characterMode: 'single' | 'pair' | 'group' = 'single',
  gender: 'male' | 'female' = 'male'
): string {
  const nameLower = (movementName || '').toLowerCase();
  const isMultiplayerGame =
    characterMode === 'group' ||
    nameLower.includes('trò chơi') ||
    nameLower.includes('tiếp sức') ||
    nameLower.includes('mèo đuổi chuột') ||
    nameLower.includes('vòng tròn') ||
    nameLower.includes('kéo co') ||
    nameLower.includes('cướp cờ') ||
    nameLower.includes('chuyền bóng') ||
    nameLower.includes('đổi chỗ') ||
    nameLower.includes('nhóm') ||
    nameLower.includes('tổ');

  const isPairExercise = characterMode === 'pair' || nameLower.includes('cặp đôi') || nameLower.includes('đối diện');

  // Shared Defs for accurate authentic GDTC uniform:
  // White t-shirt with royal blue (#2563eb) collar and sleeve cuffs
  // Royal blue (#2563eb / #1d4ed8) sweatpants with white side stripe (#ffffff)
  // Brown/tan leather/canvas sneakers (#b45309) with white rubber soles (#ffffff)
  const commonDefs = `
    <defs>
      <radialGradient id="headGrad" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#ffedd5"/>
        <stop offset="55%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fba265"/>
      </radialGradient>
      
      <radialGradient id="hairGradBoy" cx="30%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>

      <radialGradient id="hairGradGirl" cx="30%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#4a2810"/>
        <stop offset="60%" stop-color="#2d1506"/>
        <stop offset="100%" stop-color="#160800"/>
      </radialGradient>
      
      <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      
      <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="50%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      
      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fff1e6"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fba265"/>
      </linearGradient>
      
      <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="60%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
      
      <filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.18"/>
      </filter>
    </defs>
  `;

  // 1. CHẾ ĐỘ TRÒ CHƠI NHIỀU NGƯỜI (3-4 HỌC SINH VUI VẺ CHƠI CÙNG NHAU)
  if (isMultiplayerGame) {
    const isRelay = nameLower.includes('tiếp sức') || nameLower.includes('chuyền');
    const isTugOfWar = nameLower.includes('kéo co');
    const isCircle = nameLower.includes('vòng tròn') || nameLower.includes('mèo đuổi chuột') || nameLower.includes('đổi chỗ');

    let gameActionElements = '';

    if (isTugOfWar) {
      gameActionElements = `
        <!-- Dây kéo co màu đỏ cam ở giữa -->
        <path d="M 60 210 Q 260 220 460 210" stroke="#ea580c" stroke-width="12" stroke-linecap="round" filter="url(#softShadow)"/>
        <!-- Dải lụa đỏ đánh dấu tâm giữa -->
        <polygon points="260,200 252,240 268,240" fill="#dc2626"/>
      `;
    } else if (isRelay) {
      gameActionElements = `
        <!-- Vạch xuất phát / Làn chạy thể dục màu trắng ngọc -->
        <line x1="80" y1="320" x2="440" y2="320" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="8,6"/>
        <!-- Gậy tiếp sức rực rỡ màu vàng cam -->
        <rect x="235" y="170" width="28" height="8" rx="4" fill="#f59e0b" transform="rotate(-25 245 174)" filter="url(#softShadow)"/>
        <!-- Quả bóng thể dục đỏ trắng -->
        <circle cx="280" cy="180" r="16" fill="#dc2626"/>
        <circle cx="280" cy="180" r="13" fill="#ffffff"/>
        <path d="M 270 172 Q 280 180 290 172" stroke="#dc2626" stroke-width="3" fill="none"/>
      `;
    } else {
      // Vòng tròn vui nhộn / Mèo đuổi chuột
      gameActionElements = `
        <!-- Đường vòng tròn tập luyện mờ ảo -->
        <ellipse cx="260" cy="270" rx="190" ry="55" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="6,5" opacity="0.6"/>
        <!-- Cờ mốc nhỏ ở góc -->
        <polygon points="460,240 440,250 460,260" fill="#ef4444"/>
        <line x1="460" y1="240" x2="460" y2="280" stroke="#64748b" stroke-width="2.5"/>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="520" height="360" viewBox="0 0 520 360" style="background: transparent;">
        ${commonDefs}
        
        <!-- Vết bóng chân tiếp đất -->
        <ellipse cx="140" cy="315" rx="35" ry="8" fill="#94a3b8" opacity="0.3"/>
        <ellipse cx="260" cy="315" rx="35" ry="8" fill="#94a3b8" opacity="0.3"/>
        <ellipse cx="380" cy="315" rx="35" ry="8" fill="#94a3b8" opacity="0.3"/>

        <!-- Đạo cụ và sân chơi trò chơi -->
        ${gameActionElements}

        <!-- HỌC SINH 1: BÉ TRAI BÊN TRÁI (Đang chạy hăng say về phía bạn) -->
        <g filter="url(#softShadow)">
          <!-- Chân chạy -->
          <path d="M 125 240 L 105 295" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 105 295 L 98 300" stroke="#ffffff" stroke-width="3"/>
          <path d="M 90 295 Q 105 285 120 298 L 118 312 L 85 312 Z" fill="url(#shoeGrad)"/>
          <rect x="85" y="309" width="35" height="4" fill="#ffffff" rx="2"/>

          <path d="M 145 240 L 165 290" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 152 290 Q 168 280 182 292 L 180 306 L 148 306 Z" fill="url(#shoeGrad)"/>
          <rect x="148" y="303" width="34" height="4" fill="#ffffff" rx="2"/>

          <!-- Quần thể thao có sọc trắng -->
          <path d="M 115 200 L 110 245 L 160 245 L 155 200 Z" fill="url(#pantsGrad)"/>
          <line x1="112" y1="205" x2="108" y2="242" stroke="#ffffff" stroke-width="2.5"/>
          <line x1="158" y1="205" x2="162" y2="242" stroke="#ffffff" stroke-width="2.5"/>

          <!-- Áo thể thao trắng viền xanh -->
          <path d="M 120 135 L 115 205 L 155 205 L 150 135 Z" fill="url(#shirtGrad)"/>
          <path d="M 120 135 Q 135 145 150 135 L 147 150 Q 135 158 123 150 Z" fill="#2563eb"/>
          <line x1="135" y1="135" x2="135" y2="155" stroke="#2563eb" stroke-width="2"/>

          <!-- Cánh tay vươn tới hào hứng -->
          <path d="M 120 140 Q 155 160 185 160" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="187" cy="160" r="7" fill="url(#skinGrad)"/>
          <path d="M 120 140 L 132 152" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>

          <path d="M 148 140 Q 120 160 100 175" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="98" cy="177" r="7" fill="url(#skinGrad)"/>

          <!-- Đầu & Mặt bé trai -->
          <circle cx="135" cy="100" r="28" fill="url(#headGrad)"/>
          <path d="M 108 92 Q 135 60 162 92 Q 150 78 135 78 Q 120 78 108 92 Z" fill="url(#hairGradBoy)"/>
          <circle cx="127" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="126" cy="98" r="1.5" fill="#ffffff"/>
          <circle cx="143" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="142" cy="98" r="1.5" fill="#ffffff"/>
          <ellipse cx="120" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <ellipse cx="150" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <path d="M 130 112 Q 135 120 140 112" stroke="#991b1b" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>

        <!-- HỌC SINH 2: BÉ GÁI Ở GIỮA (Tươi cười nhảy vui mừng, hai tay giơ cao đón bạn) -->
        <g filter="url(#softShadow)">
          <!-- Đôi chân đứng kiễng gót nhảy vui -->
          <path d="M 250 240 L 246 295" stroke="#2563eb" stroke-width="14" stroke-linecap="round"/>
          <path d="M 235 292 Q 248 282 260 295 L 258 308 L 230 308 Z" fill="url(#shoeGrad)"/>
          <rect x="230" y="305" width="30" height="4" fill="#ffffff" rx="2"/>

          <path d="M 270 240 L 274 295" stroke="#2563eb" stroke-width="14" stroke-linecap="round"/>
          <path d="M 262 292 Q 275 282 288 295 L 286 308 L 258 308 Z" fill="url(#shoeGrad)"/>
          <rect x="258" y="305" width="30" height="4" fill="#ffffff" rx="2"/>

          <!-- Quần thể thao xanh sọc trắng -->
          <path d="M 240 200 L 236 245 L 284 245 L 280 200 Z" fill="url(#pantsGrad)"/>
          <line x1="238" y1="205" x2="234" y2="242" stroke="#ffffff" stroke-width="2.5"/>
          <line x1="282" y1="205" x2="286" y2="242" stroke="#ffffff" stroke-width="2.5"/>

          <!-- Áo thể thao trắng viền xanh -->
          <path d="M 244 135 L 240 205 L 280 205 L 276 135 Z" fill="url(#shirtGrad)"/>
          <path d="M 244 135 Q 260 145 276 135 L 273 150 Q 260 158 247 150 Z" fill="#2563eb"/>

          <!-- Hai cánh tay giơ cao vỗ tay / đón bạn -->
          <path d="M 245 140 Q 225 110 220 90" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="218" cy="88" r="7" fill="url(#skinGrad)"/>
          <path d="M 245 140 L 238 120" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>

          <path d="M 275 140 Q 295 110 300 90" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="302" cy="88" r="7" fill="url(#skinGrad)"/>
          <path d="M 275 140 L 282 120" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>

          <!-- Đầu & Tóc buộc 2 bên xinh xắn -->
          <circle cx="260" cy="100" r="28" fill="url(#headGrad)"/>
          <path d="M 233 95 Q 260 62 287 95 Q 275 80 260 82 Q 245 80 233 95 Z" fill="url(#hairGradGirl)"/>
          <!-- Hai bím tóc nhỏ xinh 2 bên -->
          <ellipse cx="228" cy="98" rx="8" ry="14" fill="url(#hairGradGirl)" transform="rotate(-20 228 98)"/>
          <circle cx="230" cy="90" r="4" fill="#ec4899"/>
          <ellipse cx="292" cy="98" rx="8" ry="14" fill="url(#hairGradGirl)" transform="rotate(20 292 98)"/>
          <circle cx="290" cy="90" r="4" fill="#ec4899"/>

          <!-- Mắt to tròn long lanh & Nụ cười tươi -->
          <circle cx="252" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="251" cy="98" r="1.5" fill="#ffffff"/>
          <circle cx="268" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="267" cy="98" r="1.5" fill="#ffffff"/>
          <ellipse cx="245" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45"/>
          <ellipse cx="275" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45"/>
          <path d="M 254 112 Q 260 122 266 112" stroke="#be123c" stroke-width="2.5" fill="#fda4af" stroke-linecap="round"/>
        </g>

        <!-- HỌC SINH 3: BÉ TRAI BÊN PHẢI (Cười tươi chạy tiến tới hoặc phối hợp nhịp nhàng) -->
        <g filter="url(#softShadow)">
          <!-- Chân sải bước -->
          <path d="M 370 240 L 350 295" stroke="#2563eb" stroke-width="14" stroke-linecap="round"/>
          <path d="M 338 292 Q 352 282 365 295 L 363 308 L 332 308 Z" fill="url(#shoeGrad)"/>
          <rect x="332" y="305" width="33" height="4" fill="#ffffff" rx="2"/>

          <path d="M 390 240 L 410 290" stroke="#2563eb" stroke-width="14" stroke-linecap="round"/>
          <path d="M 398 290 Q 412 280 426 292 L 424 306 L 392 306 Z" fill="url(#shoeGrad)"/>
          <rect x="392" y="303" width="34" height="4" fill="#ffffff" rx="2"/>

          <!-- Quần xanh sọc trắng -->
          <path d="M 360 200 L 355 245 L 405 245 L 400 200 Z" fill="url(#pantsGrad)"/>
          <line x1="357" y1="205" x2="353" y2="242" stroke="#ffffff" stroke-width="2.5"/>
          <line x1="403" y1="205" x2="407" y2="242" stroke="#ffffff" stroke-width="2.5"/>

          <!-- Áo thể thao trắng viền xanh -->
          <path d="M 365 135 L 360 205 L 400 205 L 395 135 Z" fill="url(#shirtGrad)"/>
          <path d="M 365 135 Q 380 145 395 135 L 392 150 Q 380 158 368 150 Z" fill="#2563eb"/>

          <!-- Cánh tay dang rộng vui tươi -->
          <path d="M 365 140 Q 335 155 315 160" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="313" cy="160" r="7" fill="url(#skinGrad)"/>
          <path d="M 365 140 L 350 150" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>

          <path d="M 395 140 Q 425 155 440 160" stroke="url(#skinGrad)" stroke-width="13" stroke-linecap="round"/>
          <circle cx="442" cy="160" r="7" fill="url(#skinGrad)"/>
          <path d="M 395 140 L 410 150" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>

          <!-- Đầu & Khuôn mặt bé trai -->
          <circle cx="380" cy="100" r="28" fill="url(#headGrad)"/>
          <path d="M 353 92 Q 380 60 407 92 Q 395 78 380 78 Q 365 78 353 92 Z" fill="url(#hairGradBoy)"/>
          <circle cx="372" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="371" cy="98" r="1.5" fill="#ffffff"/>
          <circle cx="388" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="387" cy="98" r="1.5" fill="#ffffff"/>
          <ellipse cx="365" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <ellipse cx="395" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <path d="M 375 112 Q 380 120 385 112" stroke="#991b1b" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>
      </svg>
    `.trim();
  }

  // 2. CHẾ ĐỘ TẬP LUYỆN CẶP ĐÔI (2 HỌC SINH ĐỐI DIỆN HƯỚNG DẪN NHAU)
  if (isPairExercise) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="450" height="360" viewBox="0 0 450 360" style="background: transparent;">
        ${commonDefs}
        
        <ellipse cx="140" cy="315" rx="40" ry="9" fill="#94a3b8" opacity="0.3"/>
        <ellipse cx="310" cy="315" rx="40" ry="9" fill="#94a3b8" opacity="0.3"/>

        <!-- Học sinh A (Nam) bên trái -->
        <g filter="url(#softShadow)">
          <path d="M 125 240 L 120 300" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 105 295 Q 120 285 135 298 L 133 312 L 100 312 Z" fill="url(#shoeGrad)"/>
          <rect x="100" y="309" width="35" height="4" fill="#ffffff" rx="2"/>

          <path d="M 155 240 L 160 300" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 148 295 Q 165 285 178 298 L 176 312 L 142 312 Z" fill="url(#shoeGrad)"/>
          <rect x="142" y="309" width="36" height="4" fill="#ffffff" rx="2"/>

          <path d="M 115 195 L 110 245 L 170 245 L 165 195 Z" fill="url(#pantsGrad)"/>
          <line x1="112" y1="200" x2="108" y2="242" stroke="#ffffff" stroke-width="3"/>
          <line x1="168" y1="200" x2="172" y2="242" stroke="#ffffff" stroke-width="3"/>

          <path d="M 120 135 L 115 200 L 165 200 L 160 135 Z" fill="url(#shirtGrad)"/>
          <path d="M 120 135 Q 140 148 160 135 L 157 150 Q 140 160 123 150 Z" fill="#2563eb"/>

          <!-- Tay phải đưa ra cùng tập -->
          <path d="M 160 140 Q 195 155 220 155" stroke="url(#skinGrad)" stroke-width="14" stroke-linecap="round"/>
          <circle cx="222" cy="155" r="7" fill="url(#skinGrad)"/>
          <path d="M 120 140 Q 100 160 110 185" stroke="url(#skinGrad)" stroke-width="14" stroke-linecap="round"/>

          <circle cx="140" cy="100" r="28" fill="url(#headGrad)"/>
          <path d="M 113 92 Q 140 60 167 92 Q 155 78 140 78 Q 125 78 113 92 Z" fill="url(#hairGradBoy)"/>
          <circle cx="132" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="148" cy="100" r="3.5" fill="#0f172a"/>
          <ellipse cx="125" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <ellipse cx="155" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4"/>
          <path d="M 135 112 Q 140 120 145 112" stroke="#991b1b" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Học sinh B (Nữ) bên phải đối diện -->
        <g filter="url(#softShadow)">
          <path d="M 295 240 L 290 300" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 275 295 Q 290 285 305 298 L 303 312 L 270 312 Z" fill="url(#shoeGrad)"/>
          <rect x="270" y="309" width="35" height="4" fill="#ffffff" rx="2"/>

          <path d="M 325 240 L 330 300" stroke="#2563eb" stroke-width="15" stroke-linecap="round"/>
          <path d="M 318 295 Q 335 285 348 298 L 346 312 L 312 312 Z" fill="url(#shoeGrad)"/>
          <rect x="312" y="309" width="36" height="4" fill="#ffffff" rx="2"/>

          <path d="M 285 195 L 280 245 L 340 245 L 335 195 Z" fill="url(#pantsGrad)"/>
          <line x1="282" y1="200" x2="278" y2="242" stroke="#ffffff" stroke-width="3"/>
          <line x1="338" y1="200" x2="342" y2="242" stroke="#ffffff" stroke-width="3"/>

          <path d="M 290 135 L 285 200 L 335 200 L 330 135 Z" fill="url(#shirtGrad)"/>
          <path d="M 290 135 Q 310 148 330 135 L 327 150 Q 310 160 293 150 Z" fill="#2563eb"/>

          <!-- Tay trái đưa ra đối diện tương tác -->
          <path d="M 290 140 Q 255 155 230 155" stroke="url(#skinGrad)" stroke-width="14" stroke-linecap="round"/>
          <circle cx="228" cy="155" r="7" fill="url(#skinGrad)"/>
          <path d="M 330 140 Q 350 160 340 185" stroke="url(#skinGrad)" stroke-width="14" stroke-linecap="round"/>

          <circle cx="310" cy="100" r="28" fill="url(#headGrad)"/>
          <path d="M 283 95 Q 310 62 337 95 Q 325 80 310 82 Q 295 80 283 95 Z" fill="url(#hairGradGirl)"/>
          <ellipse cx="278" cy="98" rx="7" ry="12" fill="url(#hairGradGirl)" transform="rotate(-15 278 98)"/>
          <circle cx="280" cy="92" r="3.5" fill="#ec4899"/>
          <ellipse cx="342" cy="98" rx="7" ry="12" fill="url(#hairGradGirl)" transform="rotate(15 342 98)"/>
          <circle cx="340" cy="92" r="3.5" fill="#ec4899"/>

          <circle cx="302" cy="100" r="3.5" fill="#0f172a"/>
          <circle cx="318" cy="100" r="3.5" fill="#0f172a"/>
          <ellipse cx="295" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45"/>
          <ellipse cx="325" cy="108" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45"/>
          <path d="M 305 112 Q 310 120 315 112" stroke="#be123c" stroke-width="2" fill="none" stroke-linecap="round"/>
        </g>
      </svg>
    `.trim();
  }

  // 3. CHẾ ĐỘ CÁ NHÂN (1 HỌC SINH):
  // ĐẶC BIỆT NẾU LÀ ĐỘNG TÁC THĂNG BẰNG / LUYỆN TẬP CÁ NHÂN:
  // TÁI TẠO CHÍNH XÁC 100% PHONG CÁCH HÌNH MẪU CỦA NGƯỜI DÙNG:
  // Cậu bé đứng thăng bằng trên 1 chân, chân kia nâng ngang thẳng ra bên, 2 tay dang ngang thăng bằng,
  // áo polo trắng viền xanh, quần xanh sọc trắng, giày nâu đế cao su trắng, nền trong suốt 100% KHÔNG CHỮ!
  const isBalancePose =
    nameLower.includes('thăng bằng') ||
    nameLower.includes('nâng chân') ||
    nameLower.includes('cá nhân') ||
    nameLower.includes('đá chân') ||
    nameLower.includes('chân');

  const isStretchingPose = nameLower.includes('vươn') || nameLower.includes('thở') || nameLower.includes('bài thể dục');
  const isArmsPose = nameLower.includes('tay') || nameLower.includes('dang ngang');
  const isWalkingPose = nameLower.includes('đi đều') || nameLower.includes('chạy');

  let bodyPose = '';

  if (isBalancePose) {
    // ĐÚNG PHONG CÁCH ẢNH MẪU NGƯỜI DÙNG TẢI LÊN
    bodyPose = `
      <!-- Hai cánh tay dang ngang hoàn hảo thăng bằng cơ thể -->
      <path d="M 180 185 L 75 185" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round"/>
      <path d="M 180 185 L 140 185" stroke="#2563eb" stroke-width="24" stroke-linecap="round"/>
      <circle cx="68" cy="185" r="11" fill="url(#skinGrad)"/>

      <path d="M 230 185 L 335 185" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round"/>
      <path d="M 230 185 L 270 185" stroke="#2563eb" stroke-width="24" stroke-linecap="round"/>
      <circle cx="342" cy="185" r="11" fill="url(#skinGrad)"/>

      <!-- Thân người & Áo polo thể thao trắng viền cổ xanh -->
      <path d="M 175 175 L 165 265 L 245 265 L 235 175 Z" fill="url(#shirtGrad)" filter="url(#softShadow)"/>
      <path d="M 175 175 Q 205 190 235 175 L 230 205 Q 205 218 180 205 Z" fill="#2563eb"/>
      <line x1="205" y1="175" x2="205" y2="200" stroke="#2563eb" stroke-width="3"/>

      <!-- Quần dài thể thao PE xanh dương với sọc trắng bên hông -->
      <path d="M 163 260 L 155 315 L 205 315 L 210 280 L 215 315 L 247 295 L 245 260 Z" fill="url(#pantsGrad)" filter="url(#softShadow)"/>
      <line x1="160" y1="265" x2="152" y2="310" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>

      <!-- Chân trụ (Chân phải) đứng thẳng vững vàng trên mặt đất -->
      <path d="M 195 310 L 195 375" stroke="#2563eb" stroke-width="22" stroke-linecap="round"/>
      <path d="M 175 372 Q 195 360 215 374 L 212 392 L 170 392 Z" fill="url(#shoeGrad)" filter="url(#softShadow)"/>
      <rect x="168" y="388" width="48" height="6" rx="3" fill="#ffffff"/>

      <!-- Chân lăng (Chân trái) nâng ngang sang bên chuẩn xác theo mẫu -->
      <path d="M 225 290 L 305 265" stroke="#2563eb" stroke-width="22" stroke-linecap="round"/>
      <line x1="228" y1="278" x2="305" y2="256" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <!-- Giày chân lăng màu nâu đế trắng -->
      <g transform="rotate(-15 310 270)">
        <path d="M 305 260 Q 325 248 335 272 L 325 285 L 295 272 Z" fill="url(#shoeGrad)" filter="url(#softShadow)"/>
        <rect x="300" y="270" width="38" height="6" rx="3" fill="#ffffff"/>
      </g>
    `;
  } else if (isStretchingPose) {
    // Vươn thở: Hai tay vươn chữ V
    bodyPose = `
      <path d="M 175 180 Q 130 115 110 75" stroke="url(#skinGrad)" stroke-width="22" stroke-linecap="round"/>
      <path d="M 175 180 L 150 145" stroke="#2563eb" stroke-width="26" stroke-linecap="round"/>
      <circle cx="106" cy="70" r="13" fill="url(#skinGrad)"/>

      <path d="M 235 180 Q 280 115 300 75" stroke="url(#skinGrad)" stroke-width="22" stroke-linecap="round"/>
      <path d="M 235 180 L 260 145" stroke="#2563eb" stroke-width="26" stroke-linecap="round"/>
      <circle cx="304" cy="70" r="13" fill="url(#skinGrad)"/>

      <path d="M 175 175 L 165 265 L 245 265 L 235 175 Z" fill="url(#shirtGrad)" filter="url(#softShadow)"/>
      <path d="M 175 175 Q 205 190 235 175 L 230 205 Q 205 218 180 205 Z" fill="#2563eb"/>

      <path d="M 165 260 L 150 320 L 200 320 L 205 285 L 210 320 L 260 320 L 245 260 Z" fill="url(#pantsGrad)" filter="url(#softShadow)"/>
      <line x1="162" y1="265" x2="148" y2="315" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="248" y1="265" x2="262" y2="315" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>

      <!-- Hai chân dang rộng bằng vai -->
      <path d="M 175 320 L 165 375" stroke="#2563eb" stroke-width="22" stroke-linecap="round"/>
      <path d="M 145 372 Q 165 360 185 374 L 182 392 L 140 392 Z" fill="url(#shoeGrad)"/>
      <rect x="138" y="388" width="48" height="6" rx="3" fill="#ffffff"/>

      <path d="M 235 320 L 245 375" stroke="#2563eb" stroke-width="22" stroke-linecap="round"/>
      <path d="M 225 372 Q 245 360 265 374 L 262 392 L 220 392 Z" fill="url(#shoeGrad)"/>
      <rect x="218" y="388" width="48" height="6" rx="3" fill="#ffffff"/>
    `;
  } else if (isWalkingPose) {
    // Đi đều / Chạy tiếp sức
    bodyPose = `
      <path d="M 235 180 Q 260 200 270 170 L 250 145" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="250" cy="145" r="12" fill="url(#skinGrad)"/>

      <path d="M 175 180 Q 150 205 125 225" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round"/>
      <circle cx="125" cy="225" r="12" fill="url(#skinGrad)"/>

      <path d="M 175 175 L 165 265 L 245 265 L 235 175 Z" fill="url(#shirtGrad)" filter="url(#softShadow)"/>
      <path d="M 175 175 Q 205 190 235 175 L 230 205 Q 205 218 180 205 Z" fill="#2563eb"/>

      <path d="M 165 260 L 145 315 L 190 315 L 205 285 L 220 315 L 260 310 L 245 260 Z" fill="url(#pantsGrad)" filter="url(#softShadow)"/>
      
      <path d="M 230 310 L 255 350 L 260 380" stroke="#2563eb" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 245 375 Q 265 360 285 380 L 280 392 L 235 392 Z" fill="url(#shoeGrad)"/>
      <rect x="235" y="388" width="48" height="6" rx="3" fill="#ffffff"/>

      <path d="M 165 315 L 155 375" stroke="#2563eb" stroke-width="20" stroke-linecap="round"/>
      <path d="M 140 370 Q 155 355 175 375 L 171 390 L 130 390 Z" fill="url(#shoeGrad)"/>
      <rect x="130" y="386" width="44" height="6" rx="3" fill="#ffffff"/>
    `;
  } else {
    // Động tác tay / đứng nghiêm chuẩn
    bodyPose = `
      <path d="M 175 180 L 80 180" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round"/>
      <path d="M 175 180 L 140 180" stroke="#2563eb" stroke-width="24" stroke-linecap="round"/>
      <circle cx="72" cy="180" r="12" fill="url(#skinGrad)"/>

      <path d="M 235 180 L 330 180" stroke="url(#skinGrad)" stroke-width="20" stroke-linecap="round"/>
      <path d="M 235 180 L 270 180" stroke="#2563eb" stroke-width="24" stroke-linecap="round"/>
      <circle cx="338" cy="180" r="12" fill="url(#skinGrad)"/>

      <path d="M 175 175 L 165 265 L 245 265 L 235 175 Z" fill="url(#shirtGrad)" filter="url(#softShadow)"/>
      <path d="M 175 175 Q 205 190 235 175 L 230 205 Q 205 218 180 205 Z" fill="#2563eb"/>

      <path d="M 165 260 L 155 320 L 200 320 L 205 285 L 210 320 L 255 320 L 245 260 Z" fill="url(#pantsGrad)" filter="url(#softShadow)"/>
      <line x1="160" y1="265" x2="152" y2="315" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="250" y1="265" x2="258" y2="315" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>

      <path d="M 180 320 L 180 375" stroke="#2563eb" stroke-width="20" stroke-linecap="round"/>
      <path d="M 165 372 Q 180 362 198 374 L 195 390 L 158 390 Z" fill="url(#shoeGrad)"/>
      <rect x="156" y="386" width="40" height="6" rx="3" fill="#ffffff"/>

      <path d="M 230 320 L 230 375" stroke="#2563eb" stroke-width="20" stroke-linecap="round"/>
      <path d="M 215 372 Q 230 362 248 374 L 245 390 L 208 390 Z" fill="url(#shoeGrad)"/>
      <rect x="206" y="386" width="40" height="6" rx="3" fill="#ffffff"/>
    `;
  }

  // Khung SVG 1 học sinh chuẩn mẫu: NỀN TRONG SUỐT 100%, TUYỆT ĐỐI KHÔNG CÓ TEXT/CHỮ
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="410" height="420" viewBox="0 0 410 420" style="background: transparent;">
      ${commonDefs}
      
      <!-- Cổ học sinh -->
      <path d="M 193 150 L 193 180 Q 205 185 217 180 L 217 150 Z" fill="url(#skinGrad)"/>
      
      <!-- Tư thế thân thể & tay chân theo động tác -->
      ${bodyPose}
      
      <!-- Đầu và khuôn mặt anime chuẩn mẫu SGK Kết Nối Tri Thức -->
      <g filter="url(#softShadow)">
        <circle cx="205" cy="105" r="46" fill="url(#headGrad)"/>
        
        <!-- Tai -->
        <circle cx="158" cy="108" r="11" fill="url(#headGrad)"/>
        <circle cx="252" cy="108" r="11" fill="url(#headGrad)"/>
        
        <!-- Mái tóc đen cắt tỉa gọn gàng chuẩn học sinh tiểu học -->
        <path d="M 155 98 Q 170 48 205 48 Q 240 48 255 98 Q 235 76 205 78 Q 175 76 155 98 Z" fill="url(#hairGradBoy)"/>
        
        <!-- Đôi mắt to tròn anime với tròng đen và điểm sáng long lanh -->
        <ellipse cx="188" cy="105" rx="8" ry="11" fill="#ffffff"/>
        <circle cx="189" cy="105" r="5.5" fill="#0f172a"/>
        <circle cx="187" cy="101" r="2.2" fill="#ffffff"/>
        <circle cx="191" cy="107" r="1" fill="#ffffff"/>

        <ellipse cx="222" cy="105" rx="8" ry="11" fill="#ffffff"/>
        <circle cx="221" cy="105" r="5.5" fill="#0f172a"/>
        <circle cx="219" cy="101" r="2.2" fill="#ffffff"/>
        <circle cx="223" cy="107" r="1" fill="#ffffff"/>
        
        <!-- Lông mày thanh tú -->
        <path d="M 180 90 Q 190 86 198 90" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M 212 90 Q 220 86 230 90" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        
        <!-- Mũi nhỏ -->
        <path d="M 202 112 Q 205 115 208 112" stroke="#ea580c" stroke-width="2" stroke-linecap="round" fill="none"/>
        
        <!-- Nụ cười tươi thân thiện -->
        <path d="M 194 124 Q 205 136 216 124" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round" fill="#be123c"/>
        <path d="M 199 126 Q 205 129 211 126" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
        
        <!-- Má hồng rạng rỡ -->
        <ellipse cx="174" cy="116" rx="7" ry="4.5" fill="#f43f5e" opacity="0.4"/>
        <ellipse cx="236" cy="116" rx="7" ry="4.5" fill="#f43f5e" opacity="0.4"/>
      </g>
    </svg>
  `.trim();
}

// API: Tạo ảnh nhân vật mới từ ảnh cũ hoặc tên động tác, đa phong cách, nền trong suốt, KHÔNG CHỮ
app.post('/api/ai/generate-3d-cartoon', async (req: Request, res: Response) => {
  const {
    movementName,
    grade = 1,
    description = '',
    sourceImageBase64 = '',
    style = 'sgk_vector',
    gender = 'male',
    characterMode = 'single',
    openAiApiKey = '',
    geminiApiKey = ''
  } = req.body;
  const safeName = movementName || 'Động tác thể dục';

  const nameLower = safeName.toLowerCase();
  const isMultiplayerGame =
    characterMode === 'group' ||
    nameLower.includes('trò chơi') ||
    nameLower.includes('tiếp sức') ||
    nameLower.includes('mèo đuổi chuột') ||
    nameLower.includes('vòng tròn') ||
    nameLower.includes('kéo co') ||
    nameLower.includes('cướp cờ') ||
    nameLower.includes('chuyền bóng') ||
    nameLower.includes('đổi chỗ') ||
    nameLower.includes('nhóm') ||
    (description && (description.toLowerCase().includes('trò chơi') || description.toLowerCase().includes('nhiều người')));

  const effectiveMode = characterMode === 'group' || isMultiplayerGame ? 'group' : characterMode === 'pair' ? 'pair' : 'single';

  // 1. Nếu có OpenAI API Key, ưu tiên gọi OpenAI DALL-E 3 để tạo tranh minh họa SGK
  if (openAiApiKey && openAiApiKey.trim()) {
    try {
      const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Vietnamese Physical Education primary textbook illustration (SGK GDTC Bộ Kết Nối Tri Thức). Exercise: "${safeName}" for Grade ${grade}. Full-body Vietnamese elementary school students wearing athletic uniform: white collared polo shirt with blue trim, royal-blue long sweatpants with white side stripe, sneakers. Sequential horizontal breakdown showing 5 key poses: TTCB, Step 1, Step 2, Step 3, Step 4. Clean 2D flat digital vector illustration, white background, no 3D clay or plastic toys, high resolution for school print.`,
          n: 1,
          size: '1024x1024'
        })
      });
      const openAiData: any = await openAiRes.json();
      if (openAiData?.data?.[0]?.url) {
        return res.json({
          success: true,
          source: 'openai-dall-e-3',
          imageUrl: openAiData.data[0].url,
          movementName: safeName,
          grade
        });
      }
    } catch (e: any) {
      console.warn('OpenAI API call notice:', e?.message);
    }
  }

  // 2. Chỉ gọi Gemini Image API nếu người dùng có cung cấp custom geminiApiKey
  // (Tránh gọi trên free tier default key vì model image có quota = 0 gây lỗi 429)
  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const userGeminiClient = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
      const parts: any[] = [];

      const resolvedRef = extractBase64Data(sourceImageBase64);
      if (resolvedRef) {
        parts.push({
          inlineData: {
            mimeType: resolvedRef.mimeType,
            data: resolvedRef.data,
          }
        });
      }

      const promptText = `Educational textbook illustration for primary physical education (SGK GDTC Khối ${grade}).
Movement: "${safeName}".
Attire: Vietnamese primary school PE uniform: clean white athletic polo shirt with blue trim, long royal-blue sports pants with white side stripe, sneakers.
Style: 2D flat digital vector cel-shading illustration, clean outlines, sequential horizontal movement breakdown (TTCB, Nhịp 1, Nhịp 2, Nhịp 3, Nhịp 4). Pure white background, high resolution. ABSOLUTELY NO 3D CLAY FIGURES, NO PLASTIC BOBBLEHEAD DOLLS.`;

      parts.push({ text: promptText });

      const response = await userGeminiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: '4:3'
          }
        }
      });

      const candidate = response?.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            return res.json({
              success: true,
              source: 'gemini-image-gen',
              imageUrl,
              movementName: safeName,
              style,
              characterMode: effectiveMode
            });
          }
        }
      }
    } catch {}
  }

  // 3. Fallback chuẩn xác 100%: Sinh Tranh Phân Thế 2D Vector SGK (TTCB -> Nhịp 1 -> Nhịp 2 -> Nhịp 3 -> Nhịp 4)
  const rawSvg = generateSgk2dSequenceSvg(safeName, grade, effectiveMode, gender);
  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;

  return res.json({
    success: true,
    source: 'sgk-2d-vector-sequence',
    imageUrl: svgDataUrl,
    svgRaw: rawSvg,
    movementName: safeName,
    style: 'sgk_vector',
    characterMode: effectiveMode
  });
});

// ============================================================================
// PERSISTENT USER ACCOUNTS, AUTHENTICATION & WORKSPACE SYNC (SCRYPT + HMAC)
// ============================================================================
const DATA_DIR = path.join(__dirname, '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKSPACES_DIR = path.join(DATA_DIR, 'workspaces');
const SECRET_FILE = path.join(DATA_DIR, '.session_secret');

interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  role: 'teacher' | 'admin';
  passwordHash: string;
  createdAt: number;
  lastLoginAt: number;
}

function ensureAuthStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WORKSPACES_DIR)) fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'CHANGE_THIS_SESSION_SECRET') {
    return process.env.SESSION_SECRET;
  }
  ensureAuthStorage();
  if (fs.existsSync(SECRET_FILE)) {
    const existing = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, { encoding: 'utf8', mode: 0o600 });
  return generated;
}

function readUsersList(): StoredUser[] {
  ensureAuthStorage();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsersList(users: StoredUser[]) {
  ensureAuthStorage();
  const tmpFile = `${USERS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tmpFile, USERS_FILE);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, expectedHex] = (storedHash || '').split(':');
  if (!salt || !expectedHex) return false;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (derivedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, expectedBuf);
}

function signSessionToken(user: StoredUser): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k) out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function authenticateRequest(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const cookies = parseCookies(req.headers.cookie);
  const token = bearerToken || cookies.gdtc_session || '';
  if (!token || !token.includes('.')) return null;

  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload?.sub || !payload?.exp || Date.now() > payload.exp) return null;
    const users = readUsersList();
    return users.find((u) => u.id === payload.sub) || null;
  } catch {
    return null;
  }
}

function toPublicUser(u: StoredUser) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    schoolName: u.schoolName,
    role: u.role,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt
  };
}

function setSessionCookie(res: Response, token: string) {
  res.setHeader(
    'Set-Cookie',
    `gdtc_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
}

app.post('/api/auth/register', (req: Request, res: Response) => {
  const rawEmail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const fullName = String(req.body?.fullName || '').trim() || 'Giáo viên GDTC';
  const schoolName = String(req.body?.schoolName || '').trim() || 'TRƯỜNG TIỂU HỌC & THCS';

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return res.status(400).json({ success: false, error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }

  const users = readUsersList();
  if (users.some((u) => u.email === rawEmail)) {
    return res.status(409).json({ success: false, error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.' });
  }

  const now = Date.now();
  const newUser: StoredUser = {
    id: `usr_${now}_${crypto.randomBytes(4).toString('hex')}`,
    email: rawEmail,
    fullName,
    schoolName,
    role: users.length === 0 ? 'admin' : 'teacher',
    passwordHash: hashPassword(password),
    createdAt: now,
    lastLoginAt: now
  };

  users.push(newUser);
  writeUsersList(users);

  const token = signSessionToken(newUser);
  setSessionCookie(res, token);

  return res.json({
    success: true,
    token,
    user: toPublicUser(newUser)
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const rawEmail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!rawEmail || !password) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
  }

  const users = readUsersList();
  const idx = users.findIndex((u) => u.email === rawEmail);
  if (idx < 0 || !verifyPassword(password, users[idx].passwordHash)) {
    return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu chưa chính xác.' });
  }

  users[idx].lastLoginAt = Date.now();
  writeUsersList(users);

  const token = signSessionToken(users[idx]);
  setSessionCookie(res, token);

  return res.json({
    success: true,
    token,
    user: toPublicUser(users[idx])
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.setHeader('Set-Cookie', 'gdtc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res.json({ success: true });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = authenticateRequest(req);
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }
  return res.json({ authenticated: true, user: toPublicUser(user) });
});

app.get('/api/workspace', (req: Request, res: Response) => {
  const user = authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
  }
  ensureAuthStorage();
  const safeId = user.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const wsPath = path.join(WORKSPACES_DIR, `${safeId}.json`);
  if (!fs.existsSync(wsPath)) {
    return res.json({ success: true, workspace: null });
  }
  try {
    const data = JSON.parse(fs.readFileSync(wsPath, 'utf8'));
    return res.json({ success: true, workspace: data });
  } catch {
    return res.json({ success: true, workspace: null });
  }
});

app.put('/api/workspace', (req: Request, res: Response) => {
  const user = authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Chưa đăng nhập.' });
  }
  ensureAuthStorage();
  const safeId = user.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const wsPath = path.join(WORKSPACES_DIR, `${safeId}.json`);
  const tmpPath = `${wsPath}.tmp`;

  const payload = {
    ...(req.body?.workspace || req.body || {}),
    userId: user.id,
    updatedAt: Date.now()
  };

  fs.writeFileSync(tmpPath, JSON.stringify(payload), 'utf8');
  fs.renameSync(tmpPath, wsPath);

  return res.json({ success: true, updatedAt: payload.updatedAt });
});

// ============================================================================
// MULTI-TASK LESSON PLAN ANALYZER (EXTRACT FULL 5512 CUSTOM USER TEMPLATE)
// ============================================================================
app.post('/api/ai/analyze-lesson-template', async (req: Request, res: Response) => {
  const { rawText, fileName, extractedDraft } = req.body || {};

  // If Gemini is configured and rawText is substantial, enhance missing fields via AI
  if (aiClient && typeof rawText === 'string' && rawText.trim().length > 80) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Bạn là chuyên gia phân tích Kế hoạch bài dạy môn Giáo dục Thể chất (GDPT 2018 - Công văn 5512).
Hãy phân tích văn bản giáo án sau và trích xuất chuẩn xác thành JSON gồm:
- templateName: tên ngắn gọn đại diện cho mẫu giáo án này
- subject: môn học (mặc định "Giáo dục thể chất")
- grade: số khối lớp (1, 2, 3, 4 hoặc 5)
- week: số tuần
- lessonNum: số tiết PPCT
- topic: Chủ đề bài học
- title: Tên bài học
- dateRange: thời gian thực hiện (nếu có)
- specialCompetencies: { healthCare, basicMovement, sportsCompetency, disabledStudents }
- generalCompetencies: { autonomy, collaboration, problemSolving, disabledStudents }
- qualities: { diligence, honesty, responsibility, disabledStudents }
- integrations: { digitalSkill, digitalDescription, lifeSkills, environmentalEducation }
- locationEquipment: { location, teacherTools, studentTools }
- postLessonAdjustment: nội dung mục IV Điều chỉnh sau bài dạy (nếu có)

Tên file: ${fileName || 'giao_an'}
Nội dung thô (cắt gọn tối đa 9000 ký tự):
${rawText.slice(0, 9000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              templateName: { type: Type.STRING },
              subject: { type: Type.STRING },
              grade: { type: Type.NUMBER },
              week: { type: Type.NUMBER },
              lessonNum: { type: Type.NUMBER },
              topic: { type: Type.STRING },
              title: { type: Type.STRING },
              dateRange: { type: Type.STRING },
              specialCompetencies: {
                type: Type.OBJECT,
                properties: {
                  healthCare: { type: Type.STRING },
                  basicMovement: { type: Type.STRING },
                  sportsCompetency: { type: Type.STRING },
                  disabledStudents: { type: Type.STRING }
                }
              },
              generalCompetencies: {
                type: Type.OBJECT,
                properties: {
                  autonomy: { type: Type.STRING },
                  collaboration: { type: Type.STRING },
                  problemSolving: { type: Type.STRING },
                  disabledStudents: { type: Type.STRING }
                }
              },
              qualities: {
                type: Type.OBJECT,
                properties: {
                  diligence: { type: Type.STRING },
                  honesty: { type: Type.STRING },
                  responsibility: { type: Type.STRING },
                  disabledStudents: { type: Type.STRING }
                }
              },
              integrations: {
                type: Type.OBJECT,
                properties: {
                  digitalSkill: { type: Type.STRING },
                  digitalDescription: { type: Type.STRING },
                  lifeSkills: { type: Type.STRING },
                  environmentalEducation: { type: Type.STRING }
                }
              },
              locationEquipment: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  teacherTools: { type: Type.STRING },
                  studentTools: { type: Type.STRING }
                }
              },
              postLessonAdjustment: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        const aiParsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini-ai',
          analysis: aiParsed
        });
      }
    } catch (e: any) {
      console.warn('Multi-task AI lesson analysis fallback:', e?.message);
    }
  }

  return res.json({
    success: true,
    source: 'heuristic',
    analysis: extractedDraft || null
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartPlan GDTC Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
