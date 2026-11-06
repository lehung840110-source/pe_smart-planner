import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey });
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
  const { imageBase64, grade, lessonTitle } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu hình ảnh' });
  }

  // Fallback function when AI client is unavailable or overloaded
  const getFallbackAnalysis = () => {
    const isGame = lessonTitle && (lessonTitle.toLowerCase().includes('trò chơi') || lessonTitle.toLowerCase().includes('chơi'));
    return {
      name: isGame ? 'Trò chơi vận động tiếp sức' : 'Động tác kỹ thuật bài thể dục',
      category: isGame ? 'tro_choi' : 'dong_tac',
      targetColumn: isGame ? 'hs' : 'content',
      lvd: isGame ? "4 - 5'" : "5 - 7'",
      caption: isGame
        ? 'Hình minh họa luật chơi và sơ đồ tham gia trò chơi rèn luyện phản xạ.'
        : 'Tư thế động tác chuẩn xác, biên độ mở rộng theo nhịp đếm, hít thở sâu.',
      technicalCues: [
        'Giữ thăng bằng trọng tâm cơ thể, thân người thẳng',
        'Phối hợp tay chân nhịp nhàng với nhịp hô hấp tự nhiên',
        'Tiếp đất nhẹ nhàng bằng nửa trước bàn chân để giảm chấn động'
      ],
      commonErrors: [
        'Cúi đầu hoặc cong lưng làm mất thăng bằng',
        'Thực hiện vội vàng chưa mở hết biên độ cánh tay'
      ],
      gvScript: '- GV làm mẫu chuẩn xác 2-3 lần kết hợp phân tích kỹ thuật từng nhịp.\n- Cho HS quan sát hình ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai tư thế.',
      hsScript: '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Quan sát mẫu của GV và thực hiện đồng loạt theo nhịp đếm.'
    };
  };

  if (!aiClient) {
    return res.json({ success: true, source: 'curated_vision_fallback', analysis: getFallbackAnalysis() });
  }

  try {
    let cleanBase64 = imageBase64;
    let mimeType = 'image/png';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/png';
      cleanBase64 = parts[1];
    } else if (imageBase64.startsWith('data:image/svg+xml')) {
      return res.json({ success: true, source: 'svg_detected', analysis: getFallbackAnalysis() });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'image/jpeg' : 'image/png',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Bạn là chuyên gia giảng dạy môn Giáo dục Thể chất tiểu học (GDTC) tại Việt Nam theo Chương trình GDPT 2018.
Khối lớp mục tiêu: Khối ${grade || 1}. Tiết học: ${lessonTitle || 'Bài thể dục phát triển chung'}.
Hãy quan sát hình ảnh vừa bóc tách từ sách giáo khoa và phân tích chi tiết:
1. Nhận diện tên động tác kỹ thuật hoặc tên sơ đồ/trò chơi vận động thể hiện trong ảnh.
2. Xác định category: "dong_tac" (ảnh động tác kỹ thuật cá nhân - ghép vào Cột Nội dung), "tap_luyen" (sơ đồ đội hình tập luyện), hoặc "tro_choi" (trò chơi vận động).
3. Xác định targetColumn: "content" (Cột Nội dung) nếu là "dong_tac"; hoặc "hs" (Cột Hoạt động HS) nếu là "tap_luyen" / "tro_choi".
4. Lượng vận động gợi ý (lvd, VD: "5 - 7'", "2x8 nhịp").
5. Chú thích ngắn gọn (caption, 1-2 câu miêu tả kỹ thuật).
6. 2-3 Yếu lĩnh kỹ thuật cốt lõi (technicalCues).
7. 2 Lỗi sai học sinh tiểu học hay mắc (commonErrors).
8. Kịch bản sư phạm Giáo viên (gvScript): khẩu lệnh, thị phạm, chỉ ra sai sót.
9. Kịch bản sư phạm Học sinh (hsScript): đội hình, động tác thực hiện.

Trả về DUY NHẤT chuỗi JSON hợp lệ, không bọc markdown khác:
{
  "name": "Tên động tác / sơ đồ",
  "category": "dong_tac",
  "targetColumn": "content",
  "lvd": "5 - 7'",
  "caption": "Mô tả tư thế",
  "technicalCues": ["Yếu lĩnh 1", "Yếu lĩnh 2"],
  "commonErrors": ["Lỗi 1", "Lỗi 2"],
  "gvScript": "- GV làm mẫu...",
  "hsScript": "- Đội hình..."
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
    return res.json({
      success: true,
      source: 'gemini-3.8-flash-vision',
      analysis: parsed
    });
  } catch (error: any) {
    console.warn('Vision API notice, using fallback:', error?.message);
    return res.json({
      success: true,
      source: 'fallback-heuristics',
      analysis: {
        name: 'Động tác thể dục cơ bản SGK',
        category: 'dong_tac',
        targetColumn: 'content',
        lvd: "5 - 7'",
        caption: 'Tư thế động tác chuẩn xác, thân người thẳng, nhịp nhàng.',
        technicalCues: ['Giữ thẳng thân người', 'Biên độ tay chân mở rộng dứt khoát', 'Hít thở đều đặn'],
        commonErrors: ['Cúi đầu mất thăng bằng', 'Chưa thẳng cánh tay'],
        gvScript: '- GV làm mẫu chuẩn xác 2-3 lần.\n- Cho HS quan sát tranh ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai.',
        hsScript: '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Chú ý quan sát và thực hiện theo nhịp hô.',
      }
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
    characterMode = 'single'
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

  // Định nghĩa mô tả phong cách hình ảnh chân thực chuẩn SGK GDTC Việt Nam
  let stylePrompt = '';
  if (style === 'sgk_vector' || style === 'sgk_2d') {
    const studentDesc = effectiveMode === 'group'
      ? 'A joyful group of 3 to 4 energetic Vietnamese primary school children (boys and girls) playing an active physical education game together, running, holding hands, or passing a relay baton/ball'
      : effectiveMode === 'pair'
      ? 'A cooperative pair of two cute Vietnamese primary school children (a boy and a girl) practicing together with friendly smiles'
      : gender === 'female'
      ? 'Charming Vietnamese primary school girl student with a neat ponytail, cute anime-style face, dark sparkling eyes, warm cheerful smile, gentle rosy cheeks'
      : 'Charming energetic Vietnamese primary school boy student with neat short black hair, cute anime-style face, dark sparkling eyes, warm encouraging smile, gentle rosy cheeks';

    stylePrompt = `Authentic Vietnamese Physical Education textbook illustration style (Bộ sách Kết Nối Tri Thức Với Cuộc Sống / Chân Trời Sáng Tạo / Cánh Diều):
- Characters: ${studentDesc}.
- Attire: Standard Vietnamese primary school physical education PE uniform consisting of a clean white short-sleeve athletic t-shirt with royal-blue collar and sleeve-cuff trim, matching royal-blue athletic sweatpants with a single crisp white vertical stripe running down the outer side of each leg, brown/tan athletic sneakers with white rubber soles.
- Art Style: High-quality 2D digital vector cartoon illustration with smooth crisp dark brown/black outlines, flat colors with clean soft cel-shading on folds and contours.
- Composition: Full-body characters showing complete arms, torso, legs, and shoes demonstrating the physical exercise posture or game interaction.
- Background: 100% PURE SOLID TRANSPARENT BACKGROUND (ISOLATED PNG CUTOUT). No faux checkerboard grid, no drop shadow boxes.
- ABSOLUTELY STRICT RESTRICTIONS: ZERO TEXT, NO VIETNAMESE WORDS, NO "Luyện tập cá nhân", NO "Kết nối tri thức", NO PUBLISHER LOGOS, NO WATERMARKS, NO PAGE NUMBERS, NO DECORATIVE FRAMES. PURE ATHLETIC STUDENT CHARACTER ONLY.`;
  } else if (style === '3d_pixar') {
    stylePrompt = 'Full-body 3D Pixar Disney animated movie style cute energetic Vietnamese primary school student(s), vibrant colors, volumetric lighting, wearing PE uniform, pure transparent background, no text';
  } else if (style === 'sketch_bw') {
    stylePrompt = 'Black and white hand-drawn pencil line art sketch of athletic student(s) demonstrating exercise posture, clean anatomical lines, pure transparent background, no text';
  } else if (style === 'stickman') {
    stylePrompt = 'Clean bold minimalist pedagogical athletic stick figure diagram showing joint angles and limb positions, transparent background, no text';
  } else {
    stylePrompt = 'Modern clean flat vector line-art illustration suitable for Vietnamese physical education textbook (SGK GDTC), pure transparent background, no text';
  }

  // 1. Nếu có Gemini AI Client, thử tạo bằng mô hình sinh ảnh chuẩn gemini-3.1-flash-lite-image
  if (aiClient) {
    try {
      const parts: any[] = [];

      // Nếu có ảnh gốc truyền vào, đính kèm ảnh tham chiếu để AI giữ nguyên tư thế và góc độ thân người
      if (sourceImageBase64 && sourceImageBase64.length > 100) {
        let cleanBase64 = sourceImageBase64;
        let mimeType = 'image/png';
        if (sourceImageBase64.includes(';base64,')) {
          const splitParts = sourceImageBase64.split(';base64,');
          mimeType = splitParts[0].replace('data:', '') || 'image/png';
          cleanBase64 = splitParts[1];
        }
        parts.push({
          inlineData: {
            mimeType: mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'image/jpeg' : 'image/png',
            data: cleanBase64,
          }
        });
      }

      const promptText = `Reference activity: "${safeName}" for Grade ${grade} primary school PE.
${sourceImageBase64 && effectiveMode === 'single' ? 'CRITICAL: Carefully analyze the human body posture, arm angles, torso, and foot positioning in the attached reference image. Replicate the EXACT SAME physical exercise movement posture.' : ''}
${stylePrompt}
Dressed in neat school sports PE athletic uniform and running sneakers.
SOLID PURE TRANSPARENT BACKGROUND. ISOLATED CUTOUT CHARACTERS.
CRITICAL MANDATORY REQUIREMENT: ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO LABELS, NO WATERMARKS, NO BORDER, NO BACKGROUND OBJECTS, NO DECORATIVE FRAMES. PURE ATHLETIC CHARACTERS ONLY.`;

      parts.push({ text: promptText });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts
        },
        config: {
          imageConfig: {
            aspectRatio: effectiveMode === 'group' ? '4:3' : '1:1'
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
              source: 'gemini-3.1-flash-lite-image',
              imageUrl,
              movementName: safeName,
              style,
              characterMode: effectiveMode
            });
          }
        }
      }
    } catch (apiErr: any) {
      console.warn('Gemini image generation notice, falling back to volumetric 3D SVG:', apiErr?.message);
    }
  }

  // 2. Fallback sang Hoạ sĩ Vector SVG thể tích cao, trong suốt và sạch 100% không chứa chữ
  const rawSvg = generate3dCartoonSvg(safeName, grade, effectiveMode, gender);
  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;

  return res.json({
    success: true,
    source: 'vector-3d-transparent',
    imageUrl: svgDataUrl,
    svgRaw: rawSvg,
    movementName: safeName,
    style,
    characterMode: effectiveMode
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
