import { GradeLevel, PpctItem } from '../types/gdtc';
import { formatIntegrationForScheduleCell } from './integrationAddressesData';

/**
 * Official Curriculum Distribution (Phân Phối Chương Trình - PPCT) GDPT 2018
 * Primary Physical Education (Giáo Dục Thể Chất) - Grades 1, 2, 3, 4, 5 (Kết nối tri thức)
 * 35 weeks x 2 periods/week = 70 periods per grade.
 */

// Helper to generate periods for a range of weeks with official per-grade/week/lesson integration addresses
function createPpctRange(
  grade: GradeLevel,
  startWeek: number,
  endWeek: number,
  topic: string,
  lessonTitleGen: (period: number, week: number, subPeriod: 1 | 2) => string,
  _legacyIntegrationGen?: (week: number) => string,
  equipment: string = 'SGK, Tranh ảnh, còi, dụng cụ TL'
): PpctItem[] {
  const items: PpctItem[] = [];
  for (let w = startWeek; w <= endWeek; w++) {
    const p1 = (w - 1) * 2 + 1;
    const p2 = (w - 1) * 2 + 2;

    const title1 = lessonTitleGen(p1, w, 1);
    const title2 = lessonTitleGen(p2, w, 2);
    const integ1 = formatIntegrationForScheduleCell(grade, w, p1, title1);
    const integ2 = formatIntegrationForScheduleCell(grade, w, p2, title2);

    items.push({
      id: `ppct_k${grade}_p${p1}`,
      grade,
      week: w,
      period: p1,
      topic,
      lessonTitle: title1,
      integrationNotes: integ1,
      equipment
    });

    items.push({
      id: `ppct_k${grade}_p${p2}`,
      grade,
      week: w,
      period: p2,
      topic,
      lessonTitle: title2,
      integrationNotes: integ2,
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
    `Bài 3: Động tác nhảy, động tác điều hòa với gậy (tiết ${sub})`
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

// 4. GRADE 2 PPCT (70 Periods, Weeks 1-35) - SGK GDTC Lớp 2 Kết nối tri thức
export const defaultGrade2Ppct: PpctItem[] = [
  ...createPpctRange(2, 1, 2, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 1: Chuyển đội hình hàng dọc thành đội hình vòng tròn và ngược lại (tiết ${sub})`
  ),
  ...createPpctRange(2, 3, 4, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 2: Chuyển đội hình hàng ngang thành đội hình vòng tròn và ngược lại (tiết ${sub})`
  ),
  ...createPpctRange(2, 5, 6, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 3: Giậm chân tại chỗ, đứng lại (tiết ${sub})`
  ),
  ...createPpctRange(2, 7, 8, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC', (p, w, sub) =>
    `Bài 1: Động tác vươn thở, động tác tay (tiết ${sub})`
  ),
  ...createPpctRange(2, 9, 10, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC', (p, w, sub) =>
    `Bài 2: Động tác chân, động tác lườn, động tác bụng (tiết ${sub})`,
    (w) => w === 9
      ? `- Tích hợp năng lực số (3.1TC1a): Quan sát hình ảnh/video trình tự nhịp động tác chân, lườn, bụng an toàn theo hướng dẫn GV.\n- Tích hợp QPAN: Rèn tác phong nhanh nhẹn, chấp hành hiệu lệnh tập trung.`
      : `- Tích hợp giáo dục quốc phòng và an ninh: Rèn ý thức tổ chức kỉ luật, giữ hàng ngũ ngay ngắn và tinh thần phối hợp đồng đội.`
  ),
  ...createPpctRange(2, 11, 14, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC', (p, w, sub) =>
    `Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hoà (tiết ${sub})`
  ),
  ...createPpctRange(2, 15, 16, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 1: Bài tập di chuyển theo vạch kẻ thẳng (tiết ${sub})`
  ),
  ...createPpctRange(2, 17, 18, 'ĐÁNH GIÁ VÀ TỔNG KẾT HỌC KỲ I', (p, w, sub) =>
    `Kiểm tra, đánh giá bài tập thể dục 8 động tác và di chuyển cơ bản HK I (tiết ${sub})`
  ),
  ...createPpctRange(2, 19, 20, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 2: Bài tập phối hợp di chuyển vòng trái, vòng phải (tiết ${sub})`
  ),
  ...createPpctRange(2, 21, 22, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 3: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ thẳng (tiết ${sub})`
  ),
  ...createPpctRange(2, 23, 24, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 4: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ sang trái và sang phải (tiết ${sub})`
  ),
  ...createPpctRange(2, 25, 26, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    w === 25
      ? `Bài 5: Các động tác quỳ, ngồi cơ bản (tiết ${sub})`
      : `Bài 6: Bài tập phối hợp các tư thế quỳ, ngồi cơ bản (tiết ${sub})`
  ),
  ...createPpctRange(2, 27, 30, 'THỂ THAO TỰ CHỌN: BÓNG RỔ / MÔN BƠI', (p, w, sub) =>
    w <= 28
      ? `Bài 1-2: Động tác di chuyển không bóng & Động tác dẫn bóng (tiết ${sub})`
      : `Bài 3-4: Động tác tung – bắt bóng bằng hai tay & Ném rổ hai tay trước ngực (tiết ${sub})`
  ),
  ...createPpctRange(2, 31, 32, 'THỂ THAO TỰ CHỌN: MÔN BƠI / TRÒ CHƠI VẬN ĐỘNG', (p, w, sub) =>
    `Thực hành kĩ năng làm quen nước / Ôn tập trò chơi vận động phát triển thể lực (tiết ${sub})`
  ),
  ...createPpctRange(2, 33, 35, 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC', (p, w, sub) =>
    `Kiểm tra, đánh giá thể lực và năng lực vận động cuối năm học (tiết ${sub})`
  ),
];

// 5. GRADE 4 PPCT (70 Periods, Weeks 1-35) - SGK GDTC Lớp 4 Kết nối tri thức
export const defaultGrade4Ppct: PpctItem[] = [
  ...createPpctRange(4, 1, 2, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 1: Đi đều vòng bên phải (tiết ${sub})`
  ),
  ...createPpctRange(4, 3, 4, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 2: Đi đều vòng bên trái (tiết ${sub})`
  ),
  ...createPpctRange(4, 5, 6, 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ', (p, w, sub) =>
    `Bài 3: Đi đều vòng sau (tiết ${sub})`
  ),
  ...createPpctRange(4, 7, 9, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG', (p, w, sub) =>
    `Bài 1: Động tác vươn thở, động tác tay, động tác chân với vòng (tiết ${sub})`,
    (w) => w === 9
      ? `- Tích hợp năng lực số (4.1TC1a / 6.1TC2a): Quan sát học liệu số và phân tích tư thế động tác với vòng qua hình ảnh minh họa.\n- Tích hợp bảo vệ môi trường: Thu dọn vòng thể dục ngăn nắp sau tập.`
      : `- Năng lực số: Quan sát học liệu tranh ảnh động tác số hóa.\n- QPAN: Rèn tính kỷ luật, tư thế nghiêm túc, tác phong nhanh nhẹn.\n- Bảo vệ môi trường: Giữ vệ sinh sân tập sạch đẹp.`,
    'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  ),
  ...createPpctRange(4, 10, 12, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG', (p, w, sub) =>
    `Bài 2: Động tác lườn, động tác lưng – bụng, động tác toàn thân với vòng (tiết ${sub})`,
    () => `- Tích hợp bảo vệ môi trường: Giữ gìn vệ sinh sân tập, sử dụng vòng thể dục an toàn và thu xếp gọn gàng.`,
    'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  ),
  ...createPpctRange(4, 13, 14, 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG', (p, w, sub) =>
    `Bài 3: Động tác nhảy, động tác điều hoà với vòng (tiết ${sub})`,
    undefined,
    'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  ),
  ...createPpctRange(4, 15, 16, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 1: Bài tập rèn luyện kĩ năng thăng bằng (tiết ${sub})`
  ),
  ...createPpctRange(4, 17, 18, 'ĐÁNH GIÁ VÀ TỔNG KẾT HỌC KỲ I', (p, w, sub) =>
    `Kiểm tra, đánh giá bài thể dục với vòng và kĩ năng thăng bằng HK I (tiết ${sub})`
  ),
  ...createPpctRange(4, 19, 21, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 2: Bài tập rèn luyện kĩ năng bật xa (tiết ${sub})`
  ),
  ...createPpctRange(4, 22, 23, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 3: Bài tập rèn luyện kĩ năng bật cao (tiết ${sub})`
  ),
  ...createPpctRange(4, 24, 26, 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN', (p, w, sub) =>
    `Bài 4: Nhảy dây (tiết ${sub})`,
    undefined,
    'SGK, Dây nhảy cá nhân, vạch kẻ, còi, dụng cụ TL'
  ),
  ...createPpctRange(4, 27, 30, 'THỂ THAO TỰ CHỌN: BÓNG RỔ / MÔN BƠI', (p, w, sub) =>
    w <= 28
      ? `Bài 1-2: Điều khiển bóng & Tại chỗ dẫn bóng chữ V, vượt chướng ngại vật (tiết ${sub})`
      : `Bài 3-4: Chuyền, bắt bóng bật đất & Ném rổ bằng một tay trên vai (tiết ${sub})`,
    undefined,
    'SGK, Bóng rổ thiếu nhi, cọc tiêu, còi'
  ),
  ...createPpctRange(4, 31, 32, 'THỂ THAO TỰ CHỌN: MÔN BƠI / TRÒ CHƠI VẬN ĐỘNG', (p, w, sub) =>
    `Kĩ thuật chân, tay, phối hợp bơi ếch / Ôn tập trò chơi vận động bóng rổ (tiết ${sub})`
  ),
  ...createPpctRange(4, 33, 35, 'ĐÁNH GIÁ VÀ TỔNG KẾT NĂM HỌC', (p, w, sub) =>
    `Kiểm tra, đánh giá tiêu chuẩn thể lực và năng lực vận động cuối năm (tiết ${sub})`
  ),
];

// Combined full dataset (All 5 Elementary Grades: 1, 2, 3, 4, 5)
export const defaultAllPpctData: PpctItem[] = [
  ...defaultGrade1Ppct,
  ...defaultGrade2Ppct,
  ...defaultGrade3Ppct,
  ...defaultGrade4Ppct,
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
        // Sanitize outdated items and upgrade legacy generic integration notes to official PDF integration addresses
        let needsSave = false;
        const legacyGenericMarkers = [
          'Quan sát học liệu tranh ảnh động tác số hóa',
          'Tích hợp năng lực số (4.1TC1a): Học sinh biết sử dụng thiết bị số an toàn',
          'Tích hợp bảo vệ môi trường: Giữ gìn vệ sinh sân bãi, sắp xếp dụng cụ thể thao ngăn nắp.',
          'Tích hợp năng lực số (3.1TC1a): Quan sát hình ảnh/video trình tự nhịp động tác chân'
        ];
        let sanitized: PpctItem[] = parsed.map((item: PpctItem) => {
          let nextItem = item;
          if (item.grade === 5 && item.lessonTitle.toLowerCase().includes('thăng bằng')) {
            needsSave = true;
            nextItem = {
              ...nextItem,
              lessonTitle: nextItem.lessonTitle
                .replace(/động tác thăng bằng,\s*/gi, '')
                .replace(/thăng bằng,\s*/gi, '')
            };
          }
          const note = nextItem.integrationNotes || '';
          const isLegacyGeneric =
            !note.trim() || legacyGenericMarkers.some((m) => note.includes(m));
          if (isLegacyGeneric) {
            const officialNote = formatIntegrationForScheduleCell(
              nextItem.grade,
              nextItem.week,
              nextItem.period,
              nextItem.lessonTitle
            );
            if (officialNote !== note) {
              needsSave = true;
              nextItem = { ...nextItem, integrationNotes: officialNote };
            }
          }
          return nextItem;
        });

        // Auto-backfill Grade 2 and Grade 4 PPCT for users upgrading from the 3-grade version
        const hasGrade2 = sanitized.some((item) => Number(item.grade) === 2);
        const hasGrade4 = sanitized.some((item) => Number(item.grade) === 4);
        if (!hasGrade2) {
          sanitized = [...sanitized, ...defaultGrade2Ppct];
          needsSave = true;
        }
        if (!hasGrade4) {
          sanitized = [...sanitized, ...defaultGrade4Ppct];
          needsSave = true;
        }

        if (needsSave) {
          saveStoredPpctData(sanitized);
        }
        return sanitized;
      }
    }
  } catch {
    // ignore corrupt PPCT storage
  }
  return defaultAllPpctData;
}

export function saveStoredPpctData(items: PpctItem[]): void {
  const payload = JSON.stringify(items);
  try {
    localStorage.setItem(STORAGE_KEY_PPCT, payload);
  } catch {
    try {
      localStorage.removeItem('gdtc_user_custom_images');
      localStorage.removeItem('gdtc_inline_images_registry');
      localStorage.setItem(STORAGE_KEY_PPCT, payload);
    } catch {
      // ignore storage quota limits
    }
  }
}
