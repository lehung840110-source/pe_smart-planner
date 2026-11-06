import { PpctItem } from '../types/gdtc';

/**
 * Official Curriculum Distribution (Phân Phối Chương Trình - PPCT) GDPT 2018
 * Primary Physical Education (Giáo Dục Thể Chất) - Grades 1, 3, 5
 * 35 weeks x 2 periods/week = 70 periods per grade.
 */

// Helper to generate periods for a range of weeks
function createPpctRange(
  grade: 1 | 3 | 5,
  startWeek: number,
  endWeek: number,
  topic: string,
  lessonTitleGen: (period: number, week: number, subPeriod: 1 | 2) => string,
  integrationGen?: (week: number) => string,
  equipment: string = 'SGK, Tranh ảnh, còi, dụng cụ TL'
): PpctItem[] {
  const items: PpctItem[] = [];
  for (let w = startWeek; w <= endWeek; w++) {
    const p1 = (w - 1) * 2 + 1;
    const p2 = (w - 1) * 2 + 2;

    const integ = integrationGen
      ? integrationGen(w)
      : `- Năng lực số: Quan sát học liệu tranh ảnh động tác số hóa.\n- QPAN: Rèn tính kỷ luật, tư thế nghiêm túc, tác phong nhanh nhẹn.\n- Bảo vệ môi trường: Giữ vệ sinh sân tập sạch đẹp.`;

    items.push({
      id: `ppct_k${grade}_p${p1}`,
      grade,
      week: w,
      period: p1,
      topic,
      lessonTitle: lessonTitleGen(p1, w, 1),
      integrationNotes: integ,
      equipment
    });

    items.push({
      id: `ppct_k${grade}_p${p2}`,
      grade,
      week: w,
      period: p2,
      topic,
      lessonTitle: lessonTitleGen(p2, w, 2),
      integrationNotes: integ,
      equipment
    });
  }
  return items;
}

// 1. GRADE 1 PPCT (70 Periods, Weeks 1-35)
export const defaultGrade1Ppct: PpctItem[] = [
  // Weeks 1-4 (Periods 1-8): Đội hình đội ngũ
  ...createPpctRange(1, 1, 2, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 1: Tư thế đứng nghiêm, tư thế đứng nghỉ (tiết ${sub})`
  ),
  ...createPpctRange(1, 3, 4, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 2: Tập hợp hàng dọc, dóng hàng dọc, điểm số (tiết ${sub})`
  ),
  // Weeks 5-8 (Periods 9-16): Đội hình đội ngũ & Thể dục phát triển chung
  ...createPpctRange(1, 5, 6, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 3: Đứng nghiêm, đứng nghỉ, quay phải, quay trái (tiết ${sub})`
  ),
  ...createPpctRange(1, 7, 8, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 1: Động tác vươn thở, động tác tay (tiết ${sub})`
  ),
  // Weeks 9-12 (Periods 17-24): Động tác chân, vặn mình, bụng, phối hợp
  ...createPpctRange(1, 9, 10, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết ${sub})`,
    (w) => w === 9
      ? `- Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người.\n- Tích hợp QPAN: Rèn ý thức tổ chức kỷ luật, tác phong nhanh nhẹn.`
      : `- Tích hợp giáo dục quốc phòng và an ninh: Học sinh rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.`
  ),
  ...createPpctRange(1, 11, 12, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 3: Động tác phối hợp, động tác điều hòa (tiết ${sub})`
  ),
  // Weeks 13-16 (Periods 25-32): Ôn tập & Tư thế vận động cơ bản
  ...createPpctRange(1, 13, 14, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 4: Ôn tập và hoàn thiện bài thể dục phát triển chung (tiết ${sub})`
  ),
  ...createPpctRange(1, 15, 16, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 1: Tư thế vận động cơ bản của đầu, cổ, tay (tiết ${sub})`
  ),
  // Weeks 17-18 (Periods 33-36): Đánh giá học kỳ I
  ...createPpctRange(1, 17, 18, 'ĐÁNH GIÁ VÀ TỔNG KẾT HỌC KỲ I', (p, w, sub) =>
    `Kiểm tra, đánh giá kỹ năng vận động và bài thể dục học kỳ I (tiết ${sub})`
  ),
  // Weeks 19-26 (Periods 37-52): Tư thế vận động cơ bản của chân & Đi theo vạch kẻ
  ...createPpctRange(1, 19, 22, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 2: Tư thế vận động cơ bản của chân và thân mình (tiết ${sub})`
  ),
  ...createPpctRange(1, 23, 26, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 3: Vận động phối hợp di chuyển theo đường thẳng và vòng (tiết ${sub})`
  ),
  // Weeks 27-32 (Periods 53-64): Thể thao tự chọn & Trò chơi vận động
  ...createPpctRange(1, 27, 30, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN (BÓNG ĐÁ / BÓNG RỔ)', (p, w, sub) =>
    `Làm quen với bóng, di chuyển và chuyền bóng theo cặp (tiết ${sub})`
  ),
  ...createPpctRange(1, 31, 32, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN & TRÒ CHƠI', (p, w, sub) =>
    `Trò chơi vận động phát triển thể lực và tính khéo léo (tiết ${sub})`
  ),
  // Weeks 33-35 (Periods 65-70): Đánh giá cuối năm
  ...createPpctRange(1, 33, 35, 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC', (p, w, sub) =>
    `Kiểm tra, đánh giá thể lực và năng lực thể chất cuối năm học (tiết ${sub})`
  ),
];

// 2. GRADE 3 PPCT (70 Periods, Weeks 1-35)
export const defaultGrade3Ppct: PpctItem[] = [
  // Weeks 1-4 (Periods 1-8): Đội hình đội ngũ & Quay sau
  ...createPpctRange(3, 1, 2, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 1: Tập hợp hàng ngang, dóng hàng ngang, điểm số (tiết ${sub})`
  ),
  ...createPpctRange(3, 3, 4, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 2: Động tác quay sau, đi đều vòng phải, vòng trái (tiết ${sub})`
  ),
  // Weeks 5-8 (Periods 9-16): Đi đều vòng phải, vòng trái & Trò chơi
  ...createPpctRange(3, 5, 8, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ & TRÒ CHƠI', (p, w, sub) =>
    `Bài 3: Đi đều, đứng lại và trò chơi phát triển phản xạ (tiết ${sub})`
  ),
  // Weeks 9-12 (Periods 17-24): Bài thể dục phát triển chung Khối 3
  ...createPpctRange(3, 9, 10, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 1: Động tác vươn thở, động tác tay, động tác chân (tiết ${sub})`,
    (w) => `- Tích hợp bảo vệ môi trường: Giữ gìn vệ sinh sân bãi, sắp xếp dụng cụ thể thao ngăn nắp.\n- Tích hợp QPAN: Tác phong nhanh nhẹn, chấp hành hiệu lệnh.`
  ),
  ...createPpctRange(3, 11, 12, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 2: Động tác lườn, động tác bụng, động tác phối hợp (tiết ${sub})`
  ),
  // Weeks 13-16 (Periods 25-32): Động tác nhảy, điều hòa & hoàn thiện bài thể dục
  ...createPpctRange(3, 13, 14, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG', (p, w, sub) =>
    `Bài 3: Động tác nhảy, động tác điều hòa và thi đua trình diễn (tiết ${sub})`
  ),
  ...createPpctRange(3, 15, 16, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 1: Đi vượt chướng ngại vật thấp, đi chuyển hướng phải - trái (tiết ${sub})`
  ),
  // Weeks 17-18 (Periods 33-36): Đánh giá học kỳ I
  ...createPpctRange(3, 17, 18, 'ĐÁNH GIÁ VÀ TỔNG KẾT HỌC KỲ I', (p, w, sub) =>
    `Kiểm tra, đánh giá bài tập thể dục và kỹ năng vận động HK I (tiết ${sub})`
  ),
  // Weeks 19-26 (Periods 37-52): Bật nhảy, ném bóng trúng đích
  ...createPpctRange(3, 19, 22, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 2: Động tác bật xa, nhảy dây kiểu chụm hai chân (tiết ${sub})`
  ),
  ...createPpctRange(3, 23, 26, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 3: Phối hợp chạy, nhảy và ném bóng trúng đích (tiết ${sub})`
  ),
  // Weeks 27-32 (Periods 53-64): Môn thể thao tự chọn (Bóng đá mini / Cầu lông)
  ...createPpctRange(3, 27, 30, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN', (p, w, sub) =>
    `Luyện tập kỹ thuật tâng bóng, dẫn bóng và chuyền bóng tiếp sức (tiết ${sub})`
  ),
  ...createPpctRange(3, 31, 32, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN & TRÒ CHƠI VẬN ĐỘNG', (p, w, sub) =>
    `Trò chơi thi đua tiếp sức và phối hợp đồng đội (tiết ${sub})`
  ),
  // Weeks 33-35 (Periods 65-70): Đánh giá cuối năm
  ...createPpctRange(3, 33, 35, 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC', (p, w, sub) =>
    `Đánh giá xếp loại thể lực và năng lực vận động học sinh cuối năm (tiết ${sub})`
  ),
];

// 3. GRADE 5 PPCT (70 Periods, Weeks 1-35)
export const defaultGrade5Ppct: PpctItem[] = [
  // Weeks 1-4 (Periods 1-8): Đội hình đội ngũ nâng cao & Biến đổi đội hình
  ...createPpctRange(5, 1, 2, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ NÂNG CAO', (p, w, sub) =>
    `Bài 1: Ôn tập đội hình hàng dọc, hàng ngang, quay phải, quay trái, quay sau (tiết ${sub})`
  ),
  ...createPpctRange(5, 3, 4, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ NÂNG CAO', (p, w, sub) =>
    `Bài 2: Biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc và ngược lại (tiết ${sub})`
  ),
  // Weeks 5-8 (Periods 9-16): Thể dục phát triển chung với gậy
  ...createPpctRange(5, 5, 8, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY', (p, w, sub) =>
    `Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy (tiết ${sub})`
  ),
  // Weeks 9-12 (Periods 17-24): Động tác bụng, vặn mình, toàn thân với gậy
  ...createPpctRange(5, 9, 10, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY', (p, w, sub) =>
    `Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết ${sub})`,
    (w) => `- Tích hợp năng lực số (6.1TC2a): Học sinh làm quen với AI phân tích tư thế chuyển động, độ căng và nhịp biên độ động tác gậy.\n- Tích hợp bảo vệ môi trường: Giữ gìn vệ sinh sân bãi, sử dụng gậy thể dục an toàn.`
  ),
  ...createPpctRange(5, 11, 12, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY', (p, w, sub) =>
    `Bài 3: Động tác thăng bằng, động tác nhảy, động tác điều hòa với gậy (tiết ${sub})`
  ),
  // Weeks 13-16 (Periods 25-32): Hoàn thiện bài thể dục gậy & Tư thế vận động nâng cao
  ...createPpctRange(5, 13, 14, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY', (p, w, sub) =>
    `Bài 4: Ôn tập, biểu diễn đồng diễn bài thể dục với gậy 8 động tác (tiết ${sub})`
  ),
  ...createPpctRange(5, 15, 16, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 1: Phối hợp chạy tiếp sức, bật nhảy vượt rào cản thấp (tiết ${sub})`
  ),
  // Weeks 17-18 (Periods 33-36): Đánh giá học kỳ I
  ...createPpctRange(5, 17, 18, 'ĐÁNH GIÁ VÀ TỔNG KẾT HỌC KỲ I', (p, w, sub) =>
    `Kiểm tra, đánh giá bài tập thể dục với gậy và kỹ năng vận động HK I (tiết ${sub})`
  ),
  // Weeks 19-26 (Periods 37-52): Chạy bền, nhảy cao kiểu bước qua
  ...createPpctRange(5, 19, 22, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 2: Kỹ thuật bật cao, nhảy xa kiểu bước qua và tiếp đất an toàn (tiết ${sub})`
  ),
  ...createPpctRange(5, 23, 26, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 3: Chạy cự ly ngắn (30m - 50m) và chạy bền vượt địa hình tự nhiên (tiết ${sub})`
  ),
  // Weeks 27-32 (Periods 53-64): Môn Thể thao tự chọn (Bóng rổ / Bóng đá / Đá cầu)
  ...createPpctRange(5, 27, 30, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN (BÓNG RỔ / BÓNG ĐÁ)', (p, w, sub) =>
    `Kỹ thuật dắt bóng, chuyền bóng và ném rổ / sút bóng cầu môn (tiết ${sub})`
  ),
  ...createPpctRange(5, 31, 32, 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN & THI ĐẤU TẬP TẬP THỂ', (p, w, sub) =>
    `Luật thi đấu cơ bản, phối hợp chiến thuật nhóm và thi đấu tập (tiết ${sub})`
  ),
  // Weeks 33-35 (Periods 65-70): Đánh giá cuối năm
  ...createPpctRange(5, 33, 35, 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC', (p, w, sub) =>
    `Kiểm tra tiêu chuẩn rèn luyện thân thể và đánh giá thể chất cuối cấp Tiểu học (tiết ${sub})`
  ),
];

// Combined full dataset
export const defaultAllPpctData: PpctItem[] = [
  ...defaultGrade1Ppct,
  ...defaultGrade3Ppct,
  ...defaultGrade5Ppct,
];

// LocalStorage & DB persistence helpers
const STORAGE_KEY_PPCT = 'gdtc_official_ppct_data';

export function getStoredPpctData(): PpctItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PPCT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load PPCT from localStorage:', e);
  }
  return defaultAllPpctData;
}

export function saveStoredPpctData(items: PpctItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PPCT, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save PPCT to localStorage:', e);
  }
}
