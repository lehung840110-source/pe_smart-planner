import { GradeLevel, LessonRow } from '../types/gdtc';

/**
 * BẢNG TỔNG HỢP ĐỊA CHỈ TÍCH HỢP MÔN GIÁO DỤC THỂ CHẤT (LỚP 1 – LỚP 5)
 * Bộ sách Kết nối tri thức với cuộc sống (35 tuần – 70 tiết/năm học) – NXB Giáo dục Việt Nam
 *
 * Các mạch nội dung tích hợp trọng tâm:
 * - Năng lực số (NLS) & Trí tuệ nhân tạo (AI) theo Thông tư 02/2025/TT-BGDĐT
 * - Giáo dục Quốc phòng và An ninh (GDQPAN)
 * - Giáo dục Quyền con người (Quyền trẻ em)
 * - An toàn giao thông (ATGT)
 * - Kỹ năng sống (KNS)
 * - Bảo vệ môi trường (BVMT)
 */

export type IntegrationDomainTag = 'NLS' | 'GDQPAN' | 'QuyenTreEm' | 'ATGT' | 'KNS' | 'BVMT';

export interface OfficialIntegrationAddress {
  id: string;
  grade: GradeLevel;
  weekStart: number;
  weekEnd: number;
  periodStart: number;
  periodEnd: number;
  lessonRef: string;
  headerLabel: string;
  content: string;
  domains: IntegrationDomainTag[];
  nlsCode?: string;
  keywords: string[];
}

export interface ResolvedPlanIntegrations {
  addressId: string;
  addressLabel: string;
  addressContent: string;
  domains: IntegrationDomainTag[];
  digitalSkill: string;
  digitalDescription: string;
  qpan?: string;
  childRights?: string;
  trafficSafety?: string;
  lifeSkills: string;
  environmentalEducation?: string;
}

export const GENERAL_KNOWLEDGE_THREAD_NOTE =
  'Mạch Kiến thức chung: Lồng ghép an toàn tập luyện, vệ sinh cá nhân, vệ sinh sân bãi và dinh dưỡng xuyên suốt các phần khởi động, luyện tập và kết thúc tiết học.';

export const INTEGRATION_DOMAIN_META: Record<
  IntegrationDomainTag,
  { shortLabel: string; fullLabel: string; badgeClass: string }
> = {
  NLS: {
    shortLabel: 'NLS / AI',
    fullLabel: 'Năng lực số & AI (TT 02/2025)',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  GDQPAN: {
    shortLabel: 'GDQPAN',
    fullLabel: 'Giáo dục Quốc phòng & An ninh',
    badgeClass: 'bg-red-100 text-red-800 border-red-200'
  },
  QuyenTreEm: {
    shortLabel: 'Quyền trẻ em',
    fullLabel: 'Giáo dục Quyền con người (Quyền trẻ em)',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  ATGT: {
    shortLabel: 'ATGT',
    fullLabel: 'An toàn giao thông',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  KNS: {
    shortLabel: 'KNS',
    fullLabel: 'Kỹ năng sống',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  BVMT: {
    shortLabel: 'BVMT',
    fullLabel: 'Bảo vệ môi trường',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
};

export const OFFICIAL_INTEGRATION_ADDRESSES: OfficialIntegrationAddress[] = [
  // =========================================================================
  // 1. KHỐI LỚP 1 (35 tuần – 70 tiết)
  // =========================================================================
  {
    id: 'k1_w1_2',
    grade: 1,
    weekStart: 1,
    weekEnd: 2,
    periodStart: 1,
    periodEnd: 4,
    lessonRef: 'CĐ1 – Bài 1: Tư thế đứng nghiêm, đứng nghỉ; Tập hợp hàng dọc, dóng hàng, điểm số',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tác phong nhanh nhẹn, chú ý lắng nghe hiệu lệnh, xếp hàng trật tự, biết nhường nhịn nhau khi xếp hàng.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['đứng nghiêm', 'đứng nghỉ', 'hàng dọc', 'dóng hàng dọc', 'điểm số']
  },
  {
    id: 'k1_w3_4',
    grade: 1,
    weekStart: 3,
    weekEnd: 4,
    periodStart: 5,
    periodEnd: 8,
    lessonRef: 'CĐ1 – Bài 2: Tập hợp hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng',
    headerLabel: 'Quyền trẻ em & BVMT',
    content: 'Mọi HS đều được tham gia bình đẳng; nhắc nhở không xả rác, giữ gìn vệ sinh khu vực tập luyện.',
    domains: ['QuyenTreEm', 'BVMT'],
    keywords: ['hàng ngang', 'dàn hàng', 'dồn hàng', 'tập hợp hàng']
  },
  {
    id: 'k1_w5_7',
    grade: 1,
    weekStart: 5,
    weekEnd: 7,
    periodStart: 9,
    periodEnd: 14,
    lessonRef: 'CĐ1 – Bài 3: Động tác quay các hướng; Trò chơi vận động & Ôn tập',
    headerLabel: 'NLS (mức L1–L2)',
    content: 'GV trình chiếu tranh/clip ngắn về hướng quay trái/phải để HS làm quen nhận diện hướng qua hình ảnh trực quan.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2',
    keywords: ['quay các hướng', 'quay phải', 'quay trái', 'quay sau']
  },
  {
    id: 'k1_w8_9',
    grade: 1,
    weekStart: 8,
    weekEnd: 9,
    periodStart: 15,
    periodEnd: 18,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay; Trò chơi vận động',
    headerLabel: 'NLS (mức L1–L2 – Mã 5.3)',
    content: 'Tập theo tiếng đếm nhịp/nhạc nền phát từ loa/thiết bị số giúp HS giữ nhịp đều đặn.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2 – Mã 5.3',
    keywords: ['vươn thở', 'động tác tay']
  },
  {
    id: 'k1_w10_11',
    grade: 1,
    weekStart: 10,
    weekEnd: 11,
    periodStart: 19,
    periodEnd: 22,
    lessonRef: 'CĐ2 – Bài 2: Động tác chân, động tác vặn mình, động tác bụng',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Tôn trọng thể lực từng bạn; động viên bạn thực hiện động tác chưa dẻo, không trêu chọc.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['động tác chân', 'vặn mình', 'động tác bụng']
  },
  {
    id: 'k1_w12_13',
    grade: 1,
    weekStart: 12,
    weekEnd: 13,
    periodStart: 23,
    periodEnd: 26,
    lessonRef: 'CĐ2 – Bài 3: Động tác phối hợp, động tác điều hòa; Ôn bài thể dục',
    headerLabel: 'NLS (mức L1–L2 – Mã 3.1)',
    content: 'Khuyến khích phụ huynh chụp ảnh/quay video ngắn động tác ở nhà để HS tự xem lại tư thế.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2 – Mã 3.1',
    keywords: ['động tác phối hợp', 'điều hòa', 'điều hoà', 'ôn bài thể dục']
  },
  {
    id: 'k1_w14_16',
    grade: 1,
    weekStart: 14,
    weekEnd: 16,
    periodStart: 27,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 1: Vận động của đầu, cổ, tay, chân',
    headerLabel: 'ATGT & BVMT',
    content: 'Liên hệ tư thế đi/đứng an toàn, không chạy nhảy ùa ra đường; giữ sân tập sạch sẽ.',
    domains: ['ATGT', 'BVMT'],
    keywords: ['đầu, cổ', 'đầu cổ', 'vận động cơ bản của đầu']
  },
  {
    id: 'k1_w17_18',
    grade: 1,
    weekStart: 17,
    weekEnd: 18,
    periodStart: 33,
    periodEnd: 36,
    lessonRef: 'CĐ3 – Bài 2: Vận động phối hợp toàn bộ cơ thể; Ôn tập & KT cuối HKI',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Hợp tác theo nhóm nhỏ, tuân thủ luật chơi; đánh giá công bằng, tôn trọng sự cố gắng của bạn.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['phối hợp toàn bộ cơ thể', 'học kỳ i', 'học kì i', 'cuối hki']
  },
  {
    id: 'k1_w19_22',
    grade: 1,
    weekStart: 19,
    weekEnd: 22,
    periodStart: 37,
    periodEnd: 44,
    lessonRef: 'CĐ3 – Bài 3: Kỹ năng vận động cơ bản (bật nhảy, ném/bắt, di chuyển kết hợp)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sự khéo léo, phản xạ nhanh và tinh thần đồng đội qua các trò chơi tiếp sức, ném trúng đích.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['bật nhảy', 'ném/bắt', 'di chuyển kết hợp', 'chân và thân mình']
  },
  {
    id: 'k1_w23_25',
    grade: 1,
    weekStart: 23,
    weekEnd: 25,
    periodStart: 45,
    periodEnd: 50,
    lessonRef: 'CĐ4 – Bài 1: Làm quen với bóng (Thể thao tự chọn – Bóng rổ/Bóng đá)',
    headerLabel: 'NLS (mức L1–L2)',
    content: 'Xem hình ảnh/video minh họa cách cầm bóng, giữ bóng an toàn trên màn hình/bảng tương tác.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2',
    keywords: ['làm quen với bóng', 'thể thao tự chọn', 'cầm bóng']
  },
  {
    id: 'k1_w26_28',
    grade: 1,
    weekStart: 26,
    weekEnd: 28,
    periodStart: 51,
    periodEnd: 56,
    lessonRef: 'CĐ4 – Bài 2: Di chuyển không bóng & dẫn bóng cơ bản',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Luân phiên lượt chơi để mọi bạn đều có cơ hội chạm bóng; kiểm soát cảm xúc, không tranh giành thô bạo.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['di chuyển không bóng', 'dẫn bóng cơ bản', 'chuyền bóng']
  },
  {
    id: 'k1_w29_32',
    grade: 1,
    weekStart: 29,
    weekEnd: 32,
    periodStart: 57,
    periodEnd: 64,
    lessonRef: 'CĐ4 – Bài 3: Ném rổ/sút bóng cơ bản & Trò chơi vận động',
    headerLabel: 'BVMT & KNS',
    content: 'Thu dọn bóng và dụng cụ đúng nơi quy định sau tiết học; rèn tính trung thực và tinh thần fair-play.',
    domains: ['BVMT', 'KNS'],
    keywords: ['ném rổ', 'sút bóng', 'trò chơi vận động phát triển thể lực']
  },
  {
    id: 'k1_w33_35',
    grade: 1,
    weekStart: 33,
    weekEnd: 35,
    periodStart: 65,
    periodEnd: 70,
    lessonRef: 'Ôn tập tổng hợp & Kiểm tra đánh giá cuối năm học',
    headerLabel: 'NLS (mức L1–L2 – Mã 2.2) & Quyền trẻ em',
    content: 'Ghi nhận tiến bộ qua hình ảnh/clip đánh giá (nếu có); tôn trọng năng lực cá nhân.',
    domains: ['NLS', 'QuyenTreEm'],
    nlsCode: 'mức L1–L2 – Mã 2.2',
    keywords: ['cuối năm', 'tổng kết năm học', 'kiểm tra đánh giá cuối năm']
  },

  // =========================================================================
  // 2. KHỐI LỚP 2 (35 tuần – 70 tiết)
  // =========================================================================
  {
    id: 'k2_w1_3',
    grade: 2,
    weekStart: 1,
    weekEnd: 3,
    periodStart: 1,
    periodEnd: 6,
    lessonRef: 'CĐ1 – Bài 1: Biến đổi đội hình hàng dọc – hàng ngang và ngược lại',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tính kỷ luật, phối hợp nhịp nhàng giữa các thành viên trong hàng, chấp hành hiệu lệnh nhanh.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['hàng dọc', 'biến đổi đội hình', 'chuyển đội hình hàng dọc']
  },
  {
    id: 'k2_w4_6',
    grade: 2,
    weekStart: 4,
    weekEnd: 6,
    periodStart: 7,
    periodEnd: 12,
    lessonRef: 'CĐ1 – Bài 2: Chuyển đội hình hàng ngang – vòng tròn và ngược lại; Trò chơi Bịt mắt bắt dê',
    headerLabel: 'Quyền trẻ em & ATGT',
    content: 'Đảm bảo an toàn khi bịt mắt di chuyển, không đẩy ngã bạn; liên hệ quan sát an toàn khi đi lại.',
    domains: ['QuyenTreEm', 'ATGT'],
    keywords: ['vòng tròn', 'bịt mắt bắt dê', 'giậm chân tại chỗ']
  },
  {
    id: 'k2_w7_8',
    grade: 2,
    weekStart: 7,
    weekEnd: 8,
    periodStart: 13,
    periodEnd: 16,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay',
    headerLabel: 'NLS (mức L1–L2 – Mã 5.3)',
    content: 'Sử dụng nhạc/nhịp đếm qua thiết bị số để duy trì nhịp thở và biên độ động tác tay.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2 – Mã 5.3',
    keywords: ['vươn thở', 'động tác tay']
  },
  {
    id: 'k2_w9_11',
    grade: 2,
    weekStart: 9,
    weekEnd: 11,
    periodStart: 17,
    periodEnd: 22,
    lessonRef: 'CĐ2 – Bài 2: Động tác chân, động tác lườn, động tác bụng; Trò chơi Chèo thuyền',
    headerLabel: 'BVMT & KNS',
    content: 'Liên hệ ý thức giữ gìn nguồn nước, sông hồ sạch đẹp qua hình ảnh Chèo thuyền; phối hợp nhịp nhàng theo tổ.',
    domains: ['BVMT', 'KNS'],
    keywords: ['động tác chân', 'động tác lườn', 'động tác bụng', 'chèo thuyền']
  },
  {
    id: 'k2_w12_13',
    grade: 2,
    weekStart: 12,
    weekEnd: 13,
    periodStart: 23,
    periodEnd: 26,
    lessonRef: 'CĐ2 – Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa; Trò chơi Mèo đuổi chuột',
    headerLabel: 'NLS (mức L1–L2)',
    content: 'Quan sát video mẫu động tác nhảy – điều hòa để nhận biết nhịp thả lỏng sau vận động mạnh.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2',
    keywords: ['động tác phối hợp', 'động tác nhảy', 'điều hòa', 'điều hoà', 'mèo đuổi chuột']
  },
  {
    id: 'k2_w14_16',
    grade: 2,
    weekStart: 14,
    weekEnd: 16,
    periodStart: 27,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 1: Phối hợp di chuyển vòng trái, vòng phải; Trò chơi Bỏ khăn',
    headerLabel: 'ATGT',
    content: 'Rèn thói quen đi theo vạch kẻ, quan sát hướng rẽ trái/phải, giữ trật tự khi di chuyển tập thể.',
    domains: ['ATGT'],
    keywords: ['vòng trái', 'vòng phải', 'vạch kẻ thẳng', 'bỏ khăn']
  },
  {
    id: 'k2_w17_18',
    grade: 2,
    weekStart: 17,
    weekEnd: 18,
    periodStart: 33,
    periodEnd: 36,
    lessonRef: 'CĐ3 – Bài 2: Di chuyển nhanh dần theo vạch kẻ thẳng; Ôn tập & KT cuối HKI',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tuân thủ quy tắc an toàn khi tăng tốc độ; cổ vũ tích cực, không chê bai bạn chạy chậm.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['nhanh dần theo vạch kẻ thẳng', 'học kỳ i', 'học kì i', 'hk i']
  },
  {
    id: 'k2_w19_22',
    grade: 2,
    weekStart: 19,
    weekEnd: 22,
    periodStart: 37,
    periodEnd: 44,
    lessonRef: 'CĐ3 – Bài 3: Di chuyển nhanh dần đổi hướng trái, phải; Trò chơi Di chuyển tiếp sức',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn phản xạ nhanh, sự tập trung và tinh thần trách nhiệm với tập thể trong các lượt tiếp sức.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['đổi hướng', 'sang trái và sang phải', 'di chuyển tiếp sức']
  },
  {
    id: 'k2_w23_26',
    grade: 2,
    weekStart: 23,
    weekEnd: 26,
    periodStart: 45,
    periodEnd: 52,
    lessonRef: 'CĐ4 – Bài 1: Di chuyển không bóng & động tác nhảy (2 chân, 1 chân)',
    headerLabel: 'NLS (mức L1–L2)',
    content: 'Xem clip ngắn minh họa tư thế tiếp đất bằng nửa bàn chân trước để tránh chấn thương.',
    domains: ['NLS'],
    nlsCode: 'mức L1–L2',
    keywords: ['di chuyển không bóng', 'động tác nhảy', 'quỳ, ngồi']
  },
  {
    id: 'k2_w27_30',
    grade: 2,
    weekStart: 27,
    weekEnd: 30,
    periodStart: 53,
    periodEnd: 60,
    lessonRef: 'CĐ4 – Bài 2: Dẫn bóng và phối hợp di chuyển cơ bản',
    headerLabel: 'Quyền trẻ em & BVMT',
    content: 'Chia sẻ bóng công bằng trong nhóm; giữ vệ sinh sân bãi, không vứt chai nước/giấy bừa bãi.',
    domains: ['QuyenTreEm', 'BVMT'],
    keywords: ['dẫn bóng', 'tung – bắt bóng', 'bóng rổ']
  },
  {
    id: 'k2_w31_32',
    grade: 2,
    weekStart: 31,
    weekEnd: 32,
    periodStart: 61,
    periodEnd: 64,
    lessonRef: 'CĐ4 – Bài 3: Ném rổ/sút bóng 2 tay trước ngực cự ly gần; Trò chơi Chuyền nhanh, nhảy nhanh',
    headerLabel: 'KNS',
    content: 'Rèn sự khéo léo, phối hợp mắt – tay và tinh thần hỗ trợ đồng đội.',
    domains: ['KNS'],
    keywords: ['ném rổ', 'hai tay trước ngực', 'chuyền nhanh, nhảy nhanh', 'làm quen nước']
  },
  {
    id: 'k2_w33_35',
    grade: 2,
    weekStart: 33,
    weekEnd: 35,
    periodStart: 65,
    periodEnd: 70,
    lessonRef: 'Ôn tập tổng hợp & Kiểm tra đánh giá cuối năm học',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Tự đánh giá khách quan, tôn trọng kết quả luyện tập của bản thân và bạn bè.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['cuối năm', 'tổng kết năm học', 'đánh giá cuối năm']
  },

  // =========================================================================
  // 3. KHỐI LỚP 3 (35 tuần – 70 tiết)
  // =========================================================================
  {
    id: 'k3_w1_3',
    grade: 3,
    weekStart: 1,
    weekEnd: 3,
    periodStart: 1,
    periodEnd: 6,
    lessonRef: 'CĐ1 – Bài 1: Biến đổi đội hình 1 hàng dọc thành 2, 3 hàng dọc và ngược lại',
    headerLabel: 'GDQPAN & NLS (mức L2–L3 – Mã 1.1)',
    content: 'Khai thác hình ảnh/video minh họa vị trí đứng, cự li hàng dọc; rèn tính kỷ luật.',
    domains: ['GDQPAN', 'NLS'],
    nlsCode: 'mức L2–L3 – Mã 1.1',
    keywords: ['hàng dọc', 'biến đổi đội hình 1 hàng dọc']
  },
  {
    id: 'k3_w4_6',
    grade: 3,
    weekStart: 4,
    weekEnd: 6,
    periodStart: 7,
    periodEnd: 12,
    lessonRef: 'CĐ1 – Bài 2: Biến đổi đội hình 1 hàng ngang thành 2, 3 hàng ngang và ngược lại',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Phân công nhiệm vụ rõ ràng trong nhóm; tôn trọng ý kiến và hỗ trợ bạn gióng hàng chuẩn.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['hàng ngang', 'biến đổi đội hình 1 hàng ngang', 'quay sau']
  },
  {
    id: 'k3_w7_9',
    grade: 3,
    weekStart: 7,
    weekEnd: 9,
    periodStart: 13,
    periodEnd: 18,
    lessonRef: 'CĐ1 – Bài 3 & 4: Động tác giậm chân tại chỗ; Đi đều, đứng lại',
    headerLabel: 'GDQPAN, ATGT & NLS (Mã 4.3)',
    content: 'Nhắc quy tắc an toàn khi xem video trên thiết bị số (tư thế, thời gian xem); liên hệ đi đều đúng hàng, an toàn giao thông.',
    domains: ['GDQPAN', 'ATGT', 'NLS'],
    nlsCode: 'Mã 4.3',
    keywords: ['giậm chân tại chỗ', 'đi đều', 'đứng lại']
  },
  {
    id: 'k3_w10_11',
    grade: 3,
    weekStart: 10,
    weekEnd: 11,
    periodStart: 19,
    periodEnd: 22,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay',
    headerLabel: 'NLS (mức L2–L3)',
    content: 'Sử dụng ứng dụng/nhạc đếm nhịp để điều hòa hơi thở và giữ nhịp luyện tập ổn định.',
    domains: ['NLS'],
    nlsCode: 'mức L2–L3',
    keywords: ['vươn thở', 'động tác tay']
  },
  {
    id: 'k3_w12_14',
    grade: 3,
    weekStart: 12,
    weekEnd: 14,
    periodStart: 23,
    periodEnd: 28,
    lessonRef: 'CĐ2 – Bài 2: Động tác chân, động tác lườn, động tác bụng',
    headerLabel: 'BVMT & KNS',
    content: 'Giáo dục thói quen giữ vệ sinh cá nhân, thay trang phục/lau mồ hôi đúng cách; duy trì sự kiên trì.',
    domains: ['BVMT', 'KNS'],
    keywords: ['động tác chân', 'động tác lườn', 'động tác bụng', 'động tác nhảy', 'điều hòa']
  },
  {
    id: 'k3_w15_17',
    grade: 3,
    weekStart: 15,
    weekEnd: 17,
    periodStart: 29,
    periodEnd: 34,
    lessonRef: 'CĐ3 – Bài 1: Phối hợp di chuyển vượt chướng ngại vật trên đường thẳng',
    headerLabel: 'GDQPAN & ATGT',
    content: 'Rèn sự bình tĩnh, quan sát vật cản phía trước; liên hệ tránh vật cản an toàn khi di chuyển.',
    domains: ['GDQPAN', 'ATGT'],
    keywords: ['vượt chướng ngại vật', 'đường thẳng', 'chướng ngại vật thấp']
  },
  {
    id: 'k3_w18',
    grade: 3,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 35,
    periodEnd: 36,
    lessonRef: 'Ôn tập & Kiểm tra đánh giá cuối học kì I',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tự tin thể hiện kỹ năng, trung thực trong thực hiện yêu cầu và tôn trọng bạn cùng nhóm.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['học kỳ i', 'học kì i', 'hk i']
  },
  {
    id: 'k3_w19_22',
    grade: 3,
    weekStart: 19,
    weekEnd: 22,
    periodStart: 37,
    periodEnd: 44,
    lessonRef: 'CĐ3 – Bài 2: Phối hợp di chuyển vượt chướng ngại vật trên đường gấp khúc',
    headerLabel: 'NLS (mức L2–L3)',
    content: 'Quan sát video phân tích cách hạ trọng tâm khi đổi hướng gấp khúc để giữ thăng bằng.',
    domains: ['NLS'],
    nlsCode: 'mức L2–L3',
    keywords: ['đường gấp khúc', 'bật xa', 'nhảy dây']
  },
  {
    id: 'k3_w23_25',
    grade: 3,
    weekStart: 23,
    weekEnd: 25,
    periodStart: 45,
    periodEnd: 50,
    lessonRef: 'CĐ3 – Bài 3: Các bài tập phối hợp kỹ năng vận động cơ bản (chạy, nhảy, ném/bắt)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Bảo đảm không gian tập an toàn cho nhau; hợp tác giải quyết tình huống vận động nhóm.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['ném bóng trúng đích', 'chạy, nhảy', 'kỹ năng vận động cơ bản']
  },
  {
    id: 'k3_w26_29',
    grade: 3,
    weekStart: 26,
    weekEnd: 29,
    periodStart: 51,
    periodEnd: 58,
    lessonRef: 'CĐ4 – Bài 1 & 2: Kỹ thuật cơ bản môn Thể thao tự chọn (dẫn bóng, chuyền/ném hoặc đá cầu/bơi)',
    headerLabel: 'NLS (mức L2–L3) & BVMT',
    content: 'Xem clip kỹ thuật chuẩn; giữ gìn nguồn nước (nếu học bơi) hoặc vệ sinh sân tập.',
    domains: ['NLS', 'BVMT'],
    nlsCode: 'mức L2–L3',
    keywords: ['thể thao tự chọn', 'tâng bóng', 'dẫn bóng', 'đá cầu', 'bơi']
  },
  {
    id: 'k3_w30_32',
    grade: 3,
    weekStart: 30,
    weekEnd: 32,
    periodStart: 59,
    periodEnd: 64,
    lessonRef: 'CĐ4 – Bài 3: Phối hợp kỹ thuật và trò chơi vận động trong thể thao tự chọn',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Điều chỉnh cảm xúc khi thắng/thua, tôn trọng trọng tài và bạn chơi.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['trò chơi thi đua tiếp sức', 'phối hợp kỹ thuật']
  },
  {
    id: 'k3_w33_35',
    grade: 3,
    weekStart: 33,
    weekEnd: 35,
    periodStart: 65,
    periodEnd: 70,
    lessonRef: 'Ôn tập tổng hợp & Kiểm tra đánh giá cuối năm học',
    headerLabel: 'NLS (mức L2–L3) & KNS',
    content: 'Tự nhận xét sự tiến bộ của bản thân và lập kế hoạch vận động hè đơn giản.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'mức L2–L3',
    keywords: ['cuối năm', 'tổng kết năm học']
  },

  // =========================================================================
  // 4. KHỐI LỚP 4 (35 tuần – 70 tiết)
  // =========================================================================
  {
    id: 'k4_w1_2',
    grade: 4,
    weekStart: 1,
    weekEnd: 2,
    periodStart: 1,
    periodEnd: 4,
    lessonRef: 'CĐ1 – Bài 1: Đi đều vòng bên phải',
    headerLabel: 'GDQPAN, ATGT & NLS (mức L3–L4 – Mã 1.1)',
    content: 'HS tìm kiếm/xem video kỹ thuật đi đều vòng phải trong kho học liệu số; liên hệ đi đúng hàng, quan sát hướng rẽ an toàn.',
    domains: ['GDQPAN', 'ATGT', 'NLS'],
    nlsCode: 'mức L3–L4 – Mã 1.1',
    keywords: ['đi đều vòng bên phải', 'vòng phải']
  },
  {
    id: 'k4_w3_4',
    grade: 4,
    weekStart: 3,
    weekEnd: 4,
    periodStart: 5,
    periodEnd: 8,
    lessonRef: 'CĐ1 – Bài 2: Đi đều vòng bên trái',
    headerLabel: 'GDQPAN & ATGT',
    content: 'Rèn sự đồng bộ trong hàng ngũ; liên hệ chấp hành tín hiệu và giữ khoảng cách an toàn khi di chuyển.',
    domains: ['GDQPAN', 'ATGT'],
    keywords: ['đi đều vòng bên trái', 'vòng trái']
  },
  {
    id: 'k4_w5_7',
    grade: 4,
    weekStart: 5,
    weekEnd: 7,
    periodStart: 9,
    periodEnd: 14,
    lessonRef: 'CĐ1 – Bài 3: Đi đều vòng sau; Ôn tập đội hình đội ngũ',
    headerLabel: 'BVMT & KNS',
    content: 'Kiểm tra vệ sinh sân tập trước/sau giờ học, thu dọn dụng cụ gọn gàng; rèn tính kỷ luật cao.',
    domains: ['BVMT', 'KNS'],
    keywords: ['đi đều vòng sau', 'vòng sau']
  },
  {
    id: 'k4_w8_10',
    grade: 4,
    weekStart: 8,
    weekEnd: 10,
    periodStart: 15,
    periodEnd: 20,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay, động tác chân với vòng',
    headerLabel: 'NLS (mức L4–L5 – Mã 5.3)',
    content: 'Sử dụng ứng dụng đếm nhịp (metronome) trên điện thoại/máy tính bảng để tự chủ tập đúng nhịp bài thể dục với vòng.',
    domains: ['NLS'],
    nlsCode: 'mức L4–L5 – Mã 5.3',
    keywords: ['vươn thở', 'động tác tay', 'động tác chân với vòng', 'chân, động tác lườn với vòng']
  },
  {
    id: 'k4_w11_13',
    grade: 4,
    weekStart: 11,
    weekEnd: 13,
    periodStart: 21,
    periodEnd: 26,
    lessonRef: 'CĐ2 – Bài 2: Động tác lườn, động tác bụng, động tác phối hợp, nhảy, điều hòa với vòng',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Hỗ trợ bạn mới làm quen dụng cụ vòng; phát huy tinh thần tự học và hợp tác nhóm.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['lưng – bụng', 'động tác lườn', 'toàn thân với vòng', 'nhảy, động tác điều hoà với vòng']
  },
  {
    id: 'k4_w14_16',
    grade: 4,
    weekStart: 14,
    weekEnd: 16,
    periodStart: 27,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 1 & 2: Kỹ năng vận động cơ bản (thăng bằng, bật xa, bật cao hoặc nhảy dây)',
    headerLabel: 'NLS (mức L3–L4) & BVMT',
    content: 'Xem video phân tích kỹ thuật bật/nhảy an toàn; giữ gìn dụng cụ cá nhân và vệ sinh môi trường.',
    domains: ['NLS', 'BVMT'],
    nlsCode: 'mức L3–L4',
    keywords: ['thăng bằng', 'bật xa', 'bật cao', 'nhảy dây']
  },
  {
    id: 'k4_w17_18',
    grade: 4,
    weekStart: 17,
    weekEnd: 18,
    periodStart: 33,
    periodEnd: 36,
    lessonRef: 'Ôn tập & Kiểm tra đánh giá cuối học kì I',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Đánh giá công bằng, tôn trọng sự khác biệt về thể lực và tốc độ tiến bộ của từng HS.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['học kỳ i', 'học kì i', 'hk i']
  },
  {
    id: 'k4_w19_22',
    grade: 4,
    weekStart: 19,
    weekEnd: 22,
    periodStart: 37,
    periodEnd: 44,
    lessonRef: 'CĐ3 – Bài 3: Phối hợp các kỹ năng vận động cơ bản và trò chơi phát triển thể lực',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sức bền, ý chí vượt khó và kỹ năng phối hợp đồng đội trong các bài tập tiếp sức.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['bật xa', 'bật cao', 'trò chơi phát triển thể lực', 'tiếp sức']
  },
  {
    id: 'k4_w23_27',
    grade: 4,
    weekStart: 23,
    weekEnd: 27,
    periodStart: 45,
    periodEnd: 54,
    lessonRef: 'CĐ4 – Bài 1 & 2: Kỹ thuật cơ bản môn Thể thao tự chọn (Bóng rổ / Bơi ếch)',
    headerLabel: 'NLS (mức L3–L4 – Mã 1.1) & Quyền trẻ em',
    content: 'Khai thác video hướng dẫn kỹ thuật chuẩn; đảm bảo an toàn tuyệt đối (đặc biệt khi học bơi).',
    domains: ['NLS', 'QuyenTreEm'],
    nlsCode: 'mức L3–L4 – Mã 1.1',
    keywords: ['điều khiển bóng', 'dẫn bóng chữ v', 'bóng rổ', 'bơi ếch']
  },
  {
    id: 'k4_w28_32',
    grade: 4,
    weekStart: 28,
    weekEnd: 32,
    periodStart: 55,
    periodEnd: 64,
    lessonRef: 'CĐ4 – Bài 3: Bài tập phối hợp kỹ thuật và trò chơi/đấu tập đơn giản',
    headerLabel: 'KNS & BVMT',
    content: 'Rèn kỹ năng giải quyết mâu thuẫn trong thi đấu, tinh thần trung thực; giữ vệ sinh sân bãi/hồ bơi.',
    domains: ['KNS', 'BVMT'],
    keywords: ['chuyền, bắt bóng', 'ném rổ bằng một tay', 'phối hợp bơi ếch', 'đấu tập']
  },
  {
    id: 'k4_w33_35',
    grade: 4,
    weekStart: 33,
    weekEnd: 35,
    periodStart: 65,
    periodEnd: 70,
    lessonRef: 'Ôn tập tổng hợp & Kiểm tra đánh giá cuối năm học',
    headerLabel: 'NLS (mức L3–L4) & KNS',
    content: 'Tự tổng kết kết quả rèn luyện cá nhân và xây dựng thói quen vận động hằng ngày.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'mức L3–L4',
    keywords: ['cuối năm', 'tổng kết năm học']
  },

  // =========================================================================
  // 5. KHỐI LỚP 5 (35 tuần – 70 tiết)
  // =========================================================================
  {
    id: 'k5_w1_3',
    grade: 5,
    weekStart: 1,
    weekEnd: 3,
    periodStart: 1,
    periodEnd: 6,
    lessonRef: 'CĐ1 – Bài 1: Bài tập phối hợp đội hình đội ngũ (biến đổi hàng dọc, hàng ngang, vòng tròn)',
    headerLabel: 'GDQPAN & NLS (mức L4–L5 – Mã 1.1)',
    content: 'HS tự tìm kiếm/lọc video kỹ thuật phối hợp đội hình trong kho học liệu số; rèn tác phong chỉ huy/chấp hành.',
    domains: ['GDQPAN', 'NLS'],
    nlsCode: 'mức L4–L5 – Mã 1.1',
    keywords: ['đội hình hàng dọc', 'hàng ngang', 'biến đổi đội hình', 'vòng tròn']
  },
  {
    id: 'k5_w4_6',
    grade: 5,
    weekStart: 4,
    weekEnd: 6,
    periodStart: 7,
    periodEnd: 12,
    lessonRef: 'CĐ1 – Bài 2: Phối hợp đi đều vòng các hướng; Giậm chân, đi đều, đi đều vòng sau',
    headerLabel: 'NLS (mức L4–L5 – Mã 6.1) & ATGT',
    content: 'Dùng ứng dụng AI đơn giản/video phân tích tư thế để nhận diện lỗi sai khi đi đều; liên hệ di chuyển an toàn trên đường.',
    domains: ['NLS', 'ATGT'],
    nlsCode: 'mức L4–L5 – Mã 6.1',
    keywords: ['đi đều vòng', 'giậm chân', 'đi đều vòng sau']
  },
  {
    id: 'k5_w7_9',
    grade: 5,
    weekStart: 7,
    weekEnd: 9,
    periodStart: 13,
    periodEnd: 18,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy',
    headerLabel: 'GDQPAN, KNS & BVMT',
    content: 'Rèn sự khéo léo, kỷ luật khi sử dụng gậy tập; thu dọn dụng cụ ngăn nắp, giữ sân tập sạch sẽ.',
    domains: ['GDQPAN', 'KNS', 'BVMT'],
    keywords: ['vươn thở', 'động tác tay', 'động tác chân với gậy']
  },
  {
    id: 'k5_w10_12',
    grade: 5,
    weekStart: 10,
    weekEnd: 12,
    periodStart: 19,
    periodEnd: 24,
    lessonRef: 'CĐ2 – Bài 2: Động tác lườn, động tác bụng, động tác phối hợp, bật nhảy, điều hòa với gậy',
    headerLabel: 'NLS (mức L4–L5 – Mã 5.3) & Quyền trẻ em',
    content: 'Dùng bộ đếm nhịp số để chủ động điều chỉnh nhịp tập; hỗ trợ bạn yếu hơn một cách tôn trọng.',
    domains: ['NLS', 'QuyenTreEm'],
    nlsCode: 'mức L4–L5 – Mã 5.3',
    keywords: ['động tác bụng', 'vặn mình', 'toàn thân với gậy', 'động tác lườn', 'động tác nhảy', 'điều hòa với gậy']
  },
  {
    id: 'k5_w13_16',
    grade: 5,
    weekStart: 13,
    weekEnd: 16,
    periodStart: 25,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 1 & 2: Kỹ năng vận động cơ bản nâng cao (chạy, nhảy, ném/bắt, phối hợp vận động)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Rèn kỹ năng tự đánh giá mức độ sẵn sàng luyện tập, tôn trọng khác biệt thể chất.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['chạy tiếp sức', 'vượt rào cản', 'vận động cơ bản nâng cao']
  },
  {
    id: 'k5_w17_18',
    grade: 5,
    weekStart: 17,
    weekEnd: 18,
    periodStart: 33,
    periodEnd: 36,
    lessonRef: 'Ôn tập & Kiểm tra đánh giá cuối học kì I',
    headerLabel: 'NLS (mức L4–L5) & KNS',
    content: 'Quan sát video/nhận xét của GV để điều chỉnh kỹ thuật; giữ thái độ trung thực, cầu thị.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'mức L4–L5',
    keywords: ['học kỳ i', 'học kì i', 'hk i']
  },
  {
    id: 'k5_w19_22',
    grade: 5,
    weekStart: 19,
    weekEnd: 22,
    periodStart: 37,
    periodEnd: 44,
    lessonRef: 'CĐ3 – Bài 3: Các bài tập phát triển thể lực và trò chơi vận động phối hợp',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn ý chí bền bỉ, tinh thần đồng đội và khả năng phối hợp chiến thuật nhỏ trong nhóm.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['bật cao', 'nhảy xa kiểu bước qua', 'phát triển thể lực']
  },
  {
    id: 'k5_w23_28',
    grade: 5,
    weekStart: 23,
    weekEnd: 28,
    periodStart: 45,
    periodEnd: 56,
    lessonRef: 'CĐ4 – Bài 1 & 2: Kỹ thuật nâng cao môn Thể thao tự chọn (Bóng rổ / Bơi / Đá cầu...)',
    headerLabel: 'NLS (mức L4–L5 – Mã 1.1 & 6.1)',
    content: 'Khai thác học liệu số chuẩn; ứng dụng AI/video hỗ trợ nhận diện lỗi kỹ thuật đơn giản (GV kiểm duyệt).',
    domains: ['NLS'],
    nlsCode: 'mức L4–L5 – Mã 1.1 & 6.1',
    keywords: ['chạy cự ly ngắn', 'chạy bền', 'dắt bóng', 'chuyền bóng', 'thể thao tự chọn']
  },
  {
    id: 'k5_w29_32',
    grade: 5,
    weekStart: 29,
    weekEnd: 32,
    periodStart: 57,
    periodEnd: 64,
    lessonRef: 'CĐ4 – Bài 3: Phối hợp kỹ thuật, luật chơi và thi đấu/trò chơi vận động',
    headerLabel: 'Quyền trẻ em, KNS & BVMT',
    content: 'Tôn trọng luật chơi và đối thủ, giải quyết bất đồng ôn hòa; giữ gìn vệ sinh môi trường tập luyện.',
    domains: ['QuyenTreEm', 'KNS', 'BVMT'],
    keywords: ['luật thi đấu', 'chiến thuật nhóm', 'thi đấu tập', 'ném rổ', 'sút bóng']
  },
  {
    id: 'k5_w33_35',
    grade: 5,
    weekStart: 33,
    weekEnd: 35,
    periodStart: 65,
    periodEnd: 70,
    lessonRef: 'Ôn tập tổng hợp & Kiểm tra đánh giá cuối năm học',
    headerLabel: 'NLS (mức L4–L5) & KNS',
    content: 'Lập kế hoạch rèn luyện thể chất vừa sức cho bản thân và chia sẻ sản phẩm/kinh nghiệm tập luyện.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'mức L4–L5',
    keywords: ['cuối năm', 'tổng kết năm học', 'tiêu chuẩn rèn luyện thân thể']
  }
];

/**
 * Looks up the exact official integration address for a given Grade, Week, Period, and optional Lesson Title.
 * Smart matching:
 * 1. First checks if `title` strongly matches a specific lesson entry of the same grade within ±3 weeks
 *    (handles schools whose PPCT shifts a lesson by 1-2 weeks relative to the reference schedule).
 * 2. Otherwise returns the exact `(grade, week)` or `(grade, period)` match from the 35-week official table.
 */
export function getIntegrationAddressForLesson(
  grade: number,
  week: number,
  period?: number,
  lessonTitle?: string
): OfficialIntegrationAddress {
  const safeGrade = Math.min(5, Math.max(1, Math.round(grade || 1))) as GradeLevel;
  const safeWeek = Math.min(35, Math.max(1, Math.round(week || 1)));
  const gradeEntries = OFFICIAL_INTEGRATION_ADDRESSES.filter((item) => item.grade === safeGrade);

  // Exact week match (always exists for weeks 1..35)
  const exactWeekMatch =
    gradeEntries.find((item) => safeWeek >= item.weekStart && safeWeek <= item.weekEnd) ||
    (period
      ? gradeEntries.find((item) => period >= item.periodStart && period <= item.periodEnd)
      : undefined) ||
    gradeEntries[0];

  // If lessonTitle is provided, check whether a nearby entry (±3 weeks) matches the exact lesson content much better
  if (lessonTitle && lessonTitle.trim().length >= 4) {
    const cleanTitle = lessonTitle.toLowerCase();
    let bestEntry: OfficialIntegrationAddress | null = null;
    let bestScore = 0;

    for (const entry of gradeEntries) {
      const weekDist =
        safeWeek >= entry.weekStart && safeWeek <= entry.weekEnd
          ? 0
          : Math.min(Math.abs(safeWeek - entry.weekStart), Math.abs(safeWeek - entry.weekEnd));
      if (weekDist > 3) continue;

      let score = 0;
      for (const kw of entry.keywords) {
        if (cleanTitle.includes(kw.toLowerCase())) {
          score += kw.length >= 10 ? 15 : 10;
        }
      }
      // Bonus for exact week range
      if (weekDist === 0 && score > 0) score += 6;

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    if (bestEntry && bestScore >= 12) {
      return bestEntry;
    }
  }

  return exactWeekMatch;
}

/**
 * Formats the official integration address concisely for the 7-column Weekly Schedule & PPCT table.
 */
export function formatIntegrationForScheduleCell(
  grade: number,
  week: number,
  period?: number,
  lessonTitle?: string
): string {
  const addr = getIntegrationAddressForLesson(grade, week, period, lessonTitle);
  return `- ${addr.headerLabel}: ${addr.content}`;
}

/**
 * Builds the structured `MasterPlanItem['integrations']` object directly from the official address.
 */
export function buildMasterPlanIntegrationsFromAddress(
  grade: number,
  week: number,
  period?: number,
  lessonTitle?: string
): ResolvedPlanIntegrations {
  const addr = getIntegrationAddressForLesson(grade, week, period, lessonTitle);
  const hasNLS = addr.domains.includes('NLS');
  const hasQPAN = addr.domains.includes('GDQPAN');
  const hasRights = addr.domains.includes('QuyenTreEm');
  const hasATGT = addr.domains.includes('ATGT');
  const hasKNS = addr.domains.includes('KNS');
  const hasBVMT = addr.domains.includes('BVMT');

  const levelFallback =
    grade <= 2 ? 'mức L1–L2' : grade === 3 ? 'mức L2–L3' : grade === 4 ? 'mức L3–L4' : 'mức L4–L5';

  return {
    addressId: addr.id,
    addressLabel: addr.headerLabel,
    addressContent: addr.content,
    domains: addr.domains,
    digitalSkill: hasNLS ? addr.nlsCode || levelFallback : `Lồng ghép (${levelFallback})`,
    digitalDescription: hasNLS
      ? addr.content
      : `Quan sát tranh ảnh/học liệu số minh họa tư thế bài học an toàn theo hướng dẫn của giáo viên.`,
    qpan: hasQPAN ? addr.content : undefined,
    childRights: hasRights ? addr.content : undefined,
    trafficSafety: hasATGT ? addr.content : undefined,
    lifeSkills: hasKNS
      ? addr.content
      : hasRights
      ? addr.content
      : 'Rèn ý thức tự giác, hợp tác với bạn, tuân thủ quy tắc an toàn khi tập luyện và chơi trò chơi.',
    environmentalEducation: hasBVMT
      ? addr.content
      : 'Giữ gìn vệ sinh sân tập sạch sẽ, thu dọn và bảo quản dụng cụ đúng nơi quy định sau tiết học.'
  };
}

/**
 * Returns all integration entries for a given grade (useful for reference tables/pickers).
 */
export function getIntegrationAddressesByGrade(grade: GradeLevel): OfficialIntegrationAddress[] {
  return OFFICIAL_INTEGRATION_ADDRESSES.filter((item) => item.grade === grade);
}

// ============================================================================
// ACTIVITY TABLE PLACEMENT ENGINE (BẢNG III – HOẠT ĐỘNG DẠY HỌC CHỦ YẾU)
// Tự động phân tích nội dung tích hợp từng tuần/bài/khối và chèn đúng vị trí
// vào các dòng & cột (Nội dung / GV / HS) theo đúng hướng dẫn Phụ lục 1.
// ============================================================================

export type ActivityIntegrationSlot =
  | '1.1_nhan_lop'
  | '1.2_khoi_dong'
  | '2.1_kien_thuc_moi'
  | '3.1_dong_loat'
  | '3.2_to_nhom'
  | '3.3_cap_doi'
  | '3.4_thi_dua'
  | '3.5_tro_choi'
  | '4.1_hoi_tinh'
  | '4.2_van_dung';

export interface ActivityIntegrationPlacement {
  id: string;
  slot: ActivityIntegrationSlot;
  slotShortLabel: string;
  slotFullLabel: string;
  domainLabel: string;
  domains: IntegrationDomainTag[];
  isGeneralKnowledgeThread?: boolean;
  rawText: string;
  contentLine: string;
  gvLine: string;
  hsLine: string;
}

export const ACTIVITY_SLOT_META: Record<
  ActivityIntegrationSlot,
  { shortLabel: string; fullLabel: string }
> = {
  '1.1_nhan_lop': { shortLabel: '1.1 Nhận lớp', fullLabel: '1.1. Mở đầu – Nhận lớp' },
  '1.2_khoi_dong': { shortLabel: '1.2 Khởi động', fullLabel: '1.2. Khởi động chung & chuyên môn' },
  '2.1_kien_thuc_moi': { shortLabel: '2.1 Kiến thức mới', fullLabel: '2.1. Hình thành kiến thức mới' },
  '3.1_dong_loat': { shortLabel: '3.1 Tập đồng loạt', fullLabel: '3.1. Luyện tập đồng loạt cả lớp' },
  '3.2_to_nhom': { shortLabel: '3.2 Tập tổ/nhóm', fullLabel: '3.2. Luyện tập theo tổ / nhóm' },
  '3.3_cap_doi': { shortLabel: '3.3 Cặp đôi', fullLabel: '3.3. Luyện tập cặp đôi & sửa sai' },
  '3.4_thi_dua': { shortLabel: '3.4 Thi đua/Đánh giá', fullLabel: '3.4. Thi đua / Tổng hợp đánh giá' },
  '3.5_tro_choi': { shortLabel: '3.5 Trò chơi vận động', fullLabel: '3.5. Trò chơi vận động' },
  '4.1_hoi_tinh': { shortLabel: '4.1 Hồi tĩnh', fullLabel: '4.1. Hồi tĩnh' },
  '4.2_van_dung': { shortLabel: '4.2 Vận dụng & Kết thúc', fullLabel: '4.2. Vận dụng, nhận xét & kết thúc' }
};

function capitalizeSentence(text: string): string {
  const trimmed = text.trim().replace(/^[-•+]\s*/, '');
  if (!trimmed) return '';
  const withCap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(withCap) ? withCap : `${withCap}.`;
}

function lowerFirstVietnamese(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  // Keep acronyms like HS, GV, AI, ATGT, GDQPAN, NLS capitalized
  if (/^(HS|GV|AI|ATGT|GDQPAN|NLS|BVMT|KNS)\b/.test(trimmed)) {
    return trimmed;
  }
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function detectClauseDomains(clause: string, addr: OfficialIntegrationAddress): IntegrationDomainTag[] {
  const lower = clause.toLowerCase();
  const matched: IntegrationDomainTag[] = [];

  if (
    /video|clip|học liệu số|ứng dụng|\bai\b|metronome|đếm nhịp|nhạc nền|loa|thiết bị số|màn hình|bảng tương tác|chụp ảnh|quay video|chia sẻ sản phẩm|trình chiếu/.test(
      lower
    )
  ) {
    matched.push('NLS');
  }
  if (
    /an toàn giao thông|giao thông|vạch kẻ|rẽ trái|rẽ phải|ùa ra đường|trên đường|tín hiệu|vật cản|tránh vật cản|khi đi lại|đi\/đứng an toàn/.test(
      lower
    )
  ) {
    matched.push('ATGT');
  }
  if (
    /vệ sinh|xả rác|rác|sân tập|sân bãi|nguồn nước|sông hồ|hồ bơi|môi trường|chai nước|thu dọn|ngăn nắp|thay trang phục|lau mồ hôi/.test(
      lower
    )
  ) {
    matched.push('BVMT');
  }
  if (
    /bình đẳng|tôn trọng|không trêu chọc|không chê bai|hỗ trợ bạn|bạn yếu|mọi bạn|chia sẻ bóng|luân phiên|công bằng|không đẩy ngã|an toàn tuyệt đối|không gian tập an toàn|trọng tài|khác biệt thể chất|khác biệt về thể lực/.test(
      lower
    )
  ) {
    matched.push('QuyenTreEm');
  }
  if (
    /tác phong|hiệu lệnh|xếp hàng|hàng ngũ|kỷ luật|chỉ huy|đồng bộ|đồng đội|sức bền|ý chí|phản xạ|tiếp sức|chiến thuật|cự li|gậy tập|bình tĩnh/.test(
      lower
    )
  ) {
    matched.push('GDQPAN');
  }
  if (
    /hợp tác|tự học|kiên trì|nhường nhịn|trung thực|fair-play|cảm xúc|mâu thuẫn|bất đồng|tự nhận xét|tự đánh giá|lập kế hoạch|tự tổng kết|thói quen vận động|khéo léo|tự tin|phân công|sẵn sàng luyện tập|nhịp nhàng theo tổ|cổ vũ tích cực|động viên/.test(
      lower
    )
  ) {
    matched.push('KNS');
  }

  const intersection = matched.filter((d) => addr.domains.includes(d));
  if (intersection.length > 0) return intersection;
  if (matched.length > 0) return matched;
  return addr.domains;
}

function formatDomainsLabel(domains: IntegrationDomainTag[], addr: OfficialIntegrationAddress): string {
  // If all domains of the address are present, preserve the exact official headerLabel
  if (domains.length === addr.domains.length && domains.every((d) => addr.domains.includes(d))) {
    return addr.headerLabel;
  }
  return domains
    .map((d) => {
      if (d === 'NLS') return addr.nlsCode ? `NLS (${addr.nlsCode})` : 'NLS';
      if (d === 'GDQPAN') return 'GDQPAN';
      if (d === 'QuyenTreEm') return 'Quyền trẻ em';
      if (d === 'ATGT') return 'ATGT';
      if (d === 'KNS') return 'KNS';
      return 'BVMT';
    })
    .join(' & ');
}

function resolveSlotForClause(
  clause: string,
  clauseDomains: IntegrationDomainTag[],
  addr: OfficialIntegrationAddress,
  lessonTitle?: string
): ActivityIntegrationSlot {
  const lower = clause.toLowerCase();
  const isAssessment =
    /kiểm tra|đánh giá|cuối học kì|cuối học kỳ|cuối năm|tổng kết/i.test(addr.lessonRef) ||
    /kiểm tra|đánh giá|cuối học kì|cuối học kỳ|cuối năm|tổng kết/i.test(lessonTitle || '');

  // 1. Chèo thuyền (BVMT + KNS tied directly to the practice game)
  if (/chèo thuyền/.test(lower)) {
    return '3.5_tro_choi';
  }

  // 2. Home application / Summer plan / Daily habit / Real-life ATGT connection / Post-lesson cleanup & hygiene -> 4.2 Vận dụng & Kết thúc
  if (
    /ở nhà|phụ huynh|lập kế hoạch|vận động hè|tự tổng kết|thói quen vận động hằng ngày|chia sẻ sản phẩm|tự nhận xét sự tiến bộ/.test(
      lower
    )
  ) {
    return '4.2_van_dung';
  }

  if (/liên hệ|ùa ra đường|trên đường|khi đi lại|an toàn giao thông/.test(lower)) {
    return '4.2_van_dung';
  }

  if (
    /thu dọn|không xả rác|vệ sinh sân|vệ sinh khu vực|vệ sinh môi trường|vệ sinh cá nhân|chai nước|nguồn nước|hồ bơi|lau mồ hôi|sân tập sạch|giữ gìn dụng cụ cá nhân/.test(
      lower
    )
  ) {
    return '4.2_van_dung';
  }

  // 3. Visual / Video / AI observation -> 2.1 Kiến thức mới (or 3.4/4.2 if assessment review)
  if (
    /trình chiếu|xem hình ảnh|xem video|xem clip|tìm kiếm|lọc video|khai thác video|khai thác hình ảnh|khai thác học liệu|bảng tương tác|màn hình|nhận diện hướng|nhận diện lỗi|quy tắc an toàn khi xem video|phân tích tư thế|phân tích kỹ thuật|phân tích cách hạ trọng tâm|quan sát video/.test(
      lower
    )
  ) {
    if (isAssessment && /nhận xét của gv|ghi nhận tiến bộ/.test(lower)) {
      return '3.4_thi_dua';
    }
    return '2.1_kien_thuc_moi';
  }

  // 4. Digital metronome / Rhythm music -> 3.1 Tập đồng loạt
  if (/đếm nhịp|nhạc nền|metronome|nhịp đếm|bộ đếm nhịp|nhịp thở|nhịp tập/.test(lower)) {
    return '3.1_dong_loat';
  }

  // 5. Opening formation / Lining up / Listening to command (Grade 1 W1-2) -> 1.1 Nhận lớp
  if (/xếp hàng trật tự|nhường nhịn nhau khi xếp hàng/.test(lower)) {
    return '1.1_nhan_lop';
  }

  // 6. Games, Relays, Rules, Fair-play, Emotions -> 3.5 Trò chơi vận động
  if (
    /trò chơi|tiếp sức|luật chơi|fair-play|tranh giành|thắng\/thua|trọng tài|đối thủ|thi đấu|bịt mắt|bất đồng|mâu thuẫn|chạm bóng|ném trúng đích/.test(
      lower
    )
  ) {
    return '3.5_tro_choi';
  }

  // 7. Assessment / Fair evaluation / Peer applause -> 3.4 Thi đua / Tổng hợp kết quả
  if (
    /đánh giá công bằng|tự đánh giá|ghi nhận tiến bộ|tự tin thể hiện kỹ năng|cổ vũ tích cực|tôn trọng kết quả|tôn trọng năng lực|thái độ trung thực, cầu thị/.test(
      lower
    )
  ) {
    return '3.4_thi_dua';
  }

  // 8. Whole-class formation discipline / Marching / Pace / Wand safety -> 3.1 Tập đồng loạt
  if (
    /hiệu lệnh|hàng ngũ|cự li|đồng bộ|vạch kẻ|đi theo vạch|gậy tập|chỉ huy|chấp hành|vật cản|tăng tốc độ|tác phong|kỷ luật/.test(
      lower
    )
  ) {
    return '3.1_dong_loat';
  }

  // 9. Group cooperation, equality, helping peers, safe space, perseverance -> 3.2 Tập tổ / nhóm
  if (
    /nhóm|tổ|bình đẳng|hỗ trợ bạn|tôn trọng|không trêu chọc|chia sẻ|phân công|không gian tập|tự học|kiên trì|phối hợp mắt – tay|chiến thuật nhỏ|khéo léo|sẵn sàng luyện tập|an toàn tuyệt đối/.test(
      lower
    )
  ) {
    return '3.2_to_nhom';
  }

  // Fallback by primary domain
  if (clauseDomains.includes('BVMT') || clauseDomains.includes('ATGT')) return '4.2_van_dung';
  if (clauseDomains.includes('NLS')) return '2.1_kien_thuc_moi';
  if (clauseDomains.includes('GDQPAN')) return '3.1_dong_loat';
  return '3.2_to_nhom';
}

function buildTeacherAndStudentLines(
  domainLabel: string,
  domains: IntegrationDomainTag[],
  slot: ActivityIntegrationSlot,
  sentence: string
): { gvLine: string; hsLine: string } {
  const body = lowerFirstVietnamese(sentence);
  const primary = domains[0];

  if (primary === 'NLS') {
    if (slot === '3.1_dong_loat') {
      return {
        gvLine: `- (Tích hợp ${domainLabel}): GV sử dụng loa/ứng dụng đếm nhịp số hỗ trợ cả lớp giữ nhịp: ${body}`,
        hsLine: `- (Tích hợp ${domainLabel}): HS lắng nghe nhịp đếm/nhạc nền từ thiết bị số để thực hiện động tác đều đẹp, đúng nhịp.`
      };
    }
    if (slot === '4.2_van_dung') {
      return {
        gvLine: `- (Tích hợp ${domainLabel}): GV hướng dẫn HS vận dụng công cụ số an toàn sau giờ học: ${body}`,
        hsLine: `- (Tích hợp ${domainLabel}): HS ghi nhớ hướng dẫn, thực hiện theo yêu cầu dưới sự đồng hành của gia đình/GV.`
      };
    }
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV tổ chức cho HS quan sát/khai thác học liệu số an toàn (đúng tư thế, thời lượng): ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS tập trung quan sát hình ảnh/video minh họa theo chỉ dẫn của GV để nắm đúng kỹ thuật động tác.`
    };
  }

  if (primary === 'GDQPAN') {
    if (slot === '3.5_tro_choi') {
      return {
        gvLine: `- (Tích hợp ${domainLabel}): GV khích lệ tinh thần đồng đội, ý chí vượt khó và phản xạ nhanh: ${body}`,
        hsLine: `- (Tích hợp ${domainLabel}): HS thi đấu nỗ lực, đoàn kết cùng đồng đội và chấp hành nghiêm túc hiệu lệnh của GV.`
      };
    }
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV quán triệt tác phong nhanh nhẹn, kỷ luật hàng ngũ và sự đồng bộ: ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS chấp hành nhanh hiệu lệnh, giữ cự ly hàng ngũ ngay ngắn và tập luyện nghiêm túc.`
    };
  }

  if (primary === 'QuyenTreEm') {
    if (slot === '3.4_thi_dua') {
      return {
        gvLine: `- (Tích hợp ${domainLabel}): GV tổ chức nhận xét, đánh giá công bằng, tôn trọng sự khác biệt và tiến bộ của từng HS: ${body}`,
        hsLine: `- (Tích hợp ${domainLabel}): HS cổ vũ văn minh, trung thực khi tự đánh giá và tôn trọng kết quả luyện tập của bạn.`
      };
    }
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV bảo đảm mọi HS đều được tham gia bình đẳng, khuyến khích hỗ trợ nhau: ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS tôn trọng thể lực của bạn, chia sẻ lượt tập/dụng cụ công bằng và sẵn sàng giúp đỡ bạn cùng nhóm.`
    };
  }

  if (primary === 'ATGT') {
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV lồng ghép liên hệ thực tế an toàn giao thông: ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS chú ý lắng nghe, liên hệ ý thức quan sát và di chuyển an toàn khi tham gia giao thông hằng ngày.`
    };
  }

  if (primary === 'BVMT') {
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV giáo dục ý thức bảo vệ môi trường và nhắc nhở thu dọn gọn gàng: ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS tự giác giữ vệ sinh sân bãi/cá nhân, không xả rác và cất dụng cụ đúng nơi quy định.`
    };
  }

  // KNS default
  if (slot === '3.5_tro_choi') {
    return {
      gvLine: `- (Tích hợp ${domainLabel}): GV nhắc HS tuân thủ luật chơi, giữ tinh thần trung thực, fair-play: ${body}`,
      hsLine: `- (Tích hợp ${domainLabel}): HS chơi đúng luật, biết kiểm soát cảm xúc khi thắng/thua và hợp tác tích cực cùng đồng đội.`
    };
  }
  return {
    gvLine: `- (Tích hợp ${domainLabel}): GV định hướng rèn luyện kỹ năng sống trong quá trình hoạt động: ${body}`,
    hsLine: `- (Tích hợp ${domainLabel}): HS tích cực hợp tác nhóm, lắng nghe góp ý và chủ động hoàn thiện kỹ năng cá nhân.`
  };
}

/**
 * Determines exact pedagogical placements in the 4-column teaching activities table
 * for a given (grade, week, period, lessonTitle), combining:
 * 1) The official weekly/lesson integration clauses from the PDF (split smartly to their best rows)
 * 2) Mạch Kiến thức chung (an toàn tập luyện ở Khởi động; vệ sinh cá nhân, sân bãi & dinh dưỡng ở Kết thúc)
 */
export function getLessonActivityIntegrationPlacements(
  grade: number,
  week: number,
  period?: number,
  lessonTitle?: string
): ActivityIntegrationPlacement[] {
  const addr = getIntegrationAddressForLesson(grade, week, period, lessonTitle);
  const rawClauses = addr.content
    .split(/\s*;\s*/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const placements: ActivityIntegrationPlacement[] = [];

  rawClauses.forEach((clause, idx) => {
    const clauseDomains = detectClauseDomains(clause, addr);
    const domainLabel = formatDomainsLabel(clauseDomains, addr);
    const slot = resolveSlotForClause(clause, clauseDomains, addr, lessonTitle);
    const sentence = capitalizeSentence(clause);
    const { gvLine, hsLine } = buildTeacherAndStudentLines(domainLabel, clauseDomains, slot, sentence);

    placements.push({
      id: `${addr.id}_c${idx}`,
      slot,
      slotShortLabel: ACTIVITY_SLOT_META[slot].shortLabel,
      slotFullLabel: ACTIVITY_SLOT_META[slot].fullLabel,
      domainLabel,
      domains: clauseDomains,
      isGeneralKnowledgeThread: false,
      rawText: sentence,
      contentLine: `- Tích hợp ${domainLabel}: ${sentence}`,
      gvLine,
      hsLine
    });
  });

  // Merge consecutive placements targeting the SAME slot & same domainLabel? No — keep separate if distinct,
  // or combine if same slot so a row stays compact. Let's keep each distinct clause crisp!

  // Mạch Kiến thức chung (Hướng dẫn Phụ lục 1 – trang 1 PDF):
  // 1) Phần khởi động: An toàn tập luyện
  const hasWarmupPlacement = placements.some((p) => p.slot === '1.2_khoi_dong');
  if (!hasWarmupPlacement) {
    placements.unshift({
      id: `${addr.id}_ktc_kd`,
      slot: '1.2_khoi_dong',
      slotShortLabel: ACTIVITY_SLOT_META['1.2_khoi_dong'].shortLabel,
      slotFullLabel: ACTIVITY_SLOT_META['1.2_khoi_dong'].fullLabel,
      domainLabel: 'Kiến thức chung (An toàn tập luyện)',
      domains: ['KNS'],
      isGeneralKnowledgeThread: true,
      rawText: 'Khởi động kỹ các khớp, giữ cự ly giãn cách an toàn để phòng tránh chấn thương khi vận động.',
      contentLine:
        '- Tích hợp Kiến thức chung (An toàn tập luyện): Khởi động kỹ các khớp, giữ cự ly giãn cách an toàn để phòng tránh chấn thương.',
      gvLine:
        '- (Tích hợp Kiến thức chung): GV nhắc HS kiểm tra dây giày, giữ khoảng cách giãn cách an toàn và khởi động đủ biên độ khớp.',
      hsLine:
        '- (Tích hợp Kiến thức chung): HS tự giác kiểm tra trang phục, giữ giãn cách an toàn với bạn xung quanh khi khởi động.'
    });
  }

  // 2) Phần kết thúc (4.2): Vệ sinh cá nhân, vệ sinh sân bãi & dinh dưỡng
  const alreadyHasHygieneInEnding = placements.some(
    (p) =>
      p.slot === '4.2_van_dung' &&
      (p.domains.includes('BVMT') || /vệ sinh|thu dọn|sân tập|sân bãi|rác|lau mồ hôi/i.test(p.rawText))
  );

  if (alreadyHasHygieneInEnding) {
    // Keep it ultra-concise (personal hygiene + hydration/nutrition only) so there is zero overlap with BVMT
    placements.push({
      id: `${addr.id}_ktc_end`,
      slot: '4.2_van_dung',
      slotShortLabel: ACTIVITY_SLOT_META['4.2_van_dung'].shortLabel,
      slotFullLabel: ACTIVITY_SLOT_META['4.2_van_dung'].fullLabel,
      domainLabel: 'Kiến thức chung (Vệ sinh cá nhân & Dinh dưỡng)',
      domains: ['BVMT'],
      isGeneralKnowledgeThread: true,
      rawText: 'Nhắc HS lau mồ hôi, rửa tay sạch sẽ, uống nước và bổ sung dinh dưỡng hợp lý sau giờ tập.',
      contentLine:
        '- Tích hợp Kiến thức chung (Vệ sinh cá nhân & Dinh dưỡng): Lau mồ hôi, rửa tay sạch sẽ, uống nước và bổ sung dinh dưỡng hợp lý sau khi vận động.',
      gvLine:
        '- (Tích hợp Kiến thức chung): GV dặn HS lau mồ hôi, rửa tay sạch sẽ trước khi vào lớp và bổ sung nước, dinh dưỡng hợp lý.',
      hsLine:
        '- (Tích hợp Kiến thức chung): HS thực hiện vệ sinh cá nhân (lau mồ hôi, rửa tay) và uống nước bổ sung sau tiết học.'
    });
  } else {
    placements.push({
      id: `${addr.id}_ktc_end`,
      slot: '4.2_van_dung',
      slotShortLabel: ACTIVITY_SLOT_META['4.2_van_dung'].shortLabel,
      slotFullLabel: ACTIVITY_SLOT_META['4.2_van_dung'].fullLabel,
      domainLabel: 'Kiến thức chung (Vệ sinh & Dinh dưỡng)',
      domains: ['BVMT'],
      isGeneralKnowledgeThread: true,
      rawText: 'Kiểm tra vệ sinh sân tập, thu dọn dụng cụ gọn gàng; giữ vệ sinh cá nhân và bổ sung nước, dinh dưỡng hợp lý sau vận động.',
      contentLine:
        '- Tích hợp Kiến thức chung (Vệ sinh & Dinh dưỡng): Kiểm tra vệ sinh sân bãi, thu dọn dụng cụ gọn gàng; giữ vệ sinh cá nhân (lau mồ hôi, rửa tay) và bổ sung nước, dinh dưỡng hợp lý.',
      gvLine:
        '- (Tích hợp Kiến thức chung): GV nhắc HS kiểm tra vệ sinh sân tập, cất dụng cụ đúng nơi quy định; lau mồ hôi, rửa tay và bổ sung nước/dinh dưỡng sau khi tập.',
      hsLine:
        '- (Tích hợp Kiến thức chung): HS cùng bạn giữ sân tập sạch sẽ, thu dọn dụng cụ ngăn nắp và thực hiện vệ sinh cá nhân, uống nước sau giờ học.'
    });
  }

  return placements;
}

/**
 * Checks whether a lesson row array already has structured activity-table integration lines injected.
 */
export function hasActivityIntegrationMarkers(rows: LessonRow[] | undefined): boolean {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  return rows.some(
    (r) =>
      /\(Tích hợp\s+[^:\n)]+\):/i.test(r.gv || '') ||
      /\(Tích hợp\s+[^:\n)]+\):/i.test(r.hs || '')
  );
}

/**
 * Finds the best matching row index in either a 10-11 row granular table OR a compact 5-7 row table
 * for a given pedagogical slot.
 */
function findRowIndexForSlot(rows: LessonRow[], slot: ActivityIntegrationSlot): number {
  const lowerContents = rows.map((r) => (r.content || '').toLowerCase());
  const findBy = (pred: (c: string, idx: number) => boolean) => lowerContents.findIndex(pred);

  switch (slot) {
    case '1.1_nhan_lop': {
      const idx = findBy((c) => c.includes('1.1') || c.includes('nhận lớp'));
      return idx >= 0 ? idx : 0;
    }
    case '1.2_khoi_dong': {
      const idx = findBy(
        (c) => (c.includes('1.2') || (c.includes('khởi động') && !c.includes('1.3') && !c.includes('trò chơi')))
      );
      if (idx >= 0) return idx;
      const fallback = findBy((c) => c.includes('khởi động') || c.includes('mở đầu'));
      return fallback >= 0 ? fallback : 0;
    }
    case '2.1_kien_thuc_moi': {
      const idx = findBy(
        (c) =>
          c.includes('2.1') ||
          c.includes('hình thành kiến thức') ||
          c.includes('khám phá') ||
          c.includes('hướng dẫn tiêu chí')
      );
      return idx >= 0 ? idx : Math.min(3, rows.length - 1);
    }
    case '3.1_dong_loat': {
      const idx = findBy(
        (c) => c.includes('3.1') || c.includes('tập đồng loạt') || c.includes('thử sức đồng loạt')
      );
      if (idx >= 0) return idx;
      const fallback = findBy((c) => c.includes('luyện tập') && !c.includes('trò chơi'));
      return fallback >= 0 ? fallback : Math.min(4, rows.length - 1);
    }
    case '3.2_to_nhom': {
      const idx = findBy((c) => c.includes('3.2') || c.includes('theo tổ') || c.includes('tổ / nhóm'));
      if (idx >= 0) return idx;
      const fallback = findBy((c) => c.includes('3.1') || (c.includes('luyện tập') && !c.includes('trò chơi')));
      return fallback >= 0 ? fallback : Math.min(5, rows.length - 1);
    }
    case '3.3_cap_doi': {
      const idx = findBy((c) => c.includes('3.3') || c.includes('cặp đôi') || c.includes('kiểm tra lại'));
      if (idx >= 0) return idx;
      return findRowIndexForSlot(rows, '3.2_to_nhom');
    }
    case '3.4_thi_dua': {
      const idx = findBy((c) => c.includes('3.4') || c.includes('thi đua') || c.includes('tổng hợp kết quả'));
      if (idx >= 0) return idx;
      return findRowIndexForSlot(rows, '3.2_to_nhom');
    }
    case '3.5_tro_choi': {
      const idx = findBy(
        (c) => c.includes('3.5') || (c.includes('trò chơi') && (c.includes('vận động') || !c.includes('1.3')))
      );
      if (idx >= 0) return idx;
      const fallback = findBy((c) => c.includes('trò chơi'));
      return fallback >= 0 ? fallback : Math.max(0, rows.length - 3);
    }
    case '4.1_hoi_tinh': {
      const idx = findBy((c) => c.includes('4.1') || c.includes('hồi tĩnh'));
      return idx >= 0 ? idx : Math.max(0, rows.length - 2);
    }
    case '4.2_van_dung': {
      const idx = findBy((c) => c.includes('4.2') || (c.includes('vận dụng') && !c.includes('4.1')));
      if (idx >= 0) return idx;
      return rows.length - 1;
    }
  }
}

function stripPreviousIntegrationLinesFromContent(text: string): string {
  return (text || '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (/^[-•+]?\s*Tích hợp\s+[^:\n]+:/i.test(trimmed)) return false;
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripPreviousIntegrationLinesFromAction(text: string, isEndingRow: boolean): string {
  return (text || '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (/^[-•+]?\s*\(Tích hợp\s+[^:\n)]+\):/i.test(trimmed)) return false;
      // Remove legacy generic environment reminder on 4.2 when we inject the structured official BVMT / Kiến thức chung line
      if (
        isEndingRow &&
        /^[-•+]?\s*Giáo dục ý thức bảo vệ môi trường:\s*nhắc nhở các em quan sát xung quanh sân tập/i.test(trimmed)
      ) {
        return false;
      }
      if (
        isEndingRow &&
        /^[-•+]?\s*Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ\.?$/i.test(
          trimmed
        )
      ) {
        return false;
      }
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function insertContentLinesInRow(baseContent: string, linesToAdd: string[], isEndingRow: boolean): string {
  if (linesToAdd.length === 0) return baseContent;
  const block = linesToAdd.join('\n');
  if (!baseContent) return block;

  // On 4.2 Vận dụng, place integration bullets neatly BEFORE "4.3. Nhận xét & Xuống lớp."
  if (isEndingRow) {
    const closingHeadingMatch = baseContent.match(/\n?(4\.3\.?\s*Nhận xét[^\n]*)$/i);
    if (closingHeadingMatch && closingHeadingMatch.index !== undefined) {
      const before = baseContent.slice(0, closingHeadingMatch.index).trimEnd();
      const closing = closingHeadingMatch[1].trim();
      return `${before}\n${block}\n${closing}`;
    }
  }

  return `${baseContent}\n${block}`;
}

/**
 * Idempotently injects all official integration placements for (grade, week, period, lessonTitle)
 * into the exact appropriate rows and columns (Nội dung / Hoạt động GV / Hoạt động HS)
 * of the 4-column teaching activities table.
 */
export function applyOfficialIntegrationsToLessonRows(
  rows: LessonRow[],
  grade: number,
  week: number,
  period?: number,
  lessonTitle?: string
): LessonRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const placements = getLessonActivityIntegrationPlacements(grade, week, period, lessonTitle);

  // Group placements by resolved row index
  const groupedByRowIdx = new Map<number, ActivityIntegrationPlacement[]>();
  for (const p of placements) {
    const targetIdx = findRowIndexForSlot(rows, p.slot);
    if (targetIdx < 0 || targetIdx >= rows.length) continue;
    const list = groupedByRowIdx.get(targetIdx) || [];
    list.push(p);
    groupedByRowIdx.set(targetIdx, list);
  }

  const endingRowIdx = findRowIndexForSlot(rows, '4.2_van_dung');

  return rows.map((row, idx) => {
    const isEndingRow = idx === endingRowIdx;
    const rowPlacements = groupedByRowIdx.get(idx) || [];

    const cleanedContent = stripPreviousIntegrationLinesFromContent(row.content || '');
    const cleanedGv = stripPreviousIntegrationLinesFromAction(row.gv || '', isEndingRow && rowPlacements.length > 0);
    const cleanedHs = stripPreviousIntegrationLinesFromAction(row.hs || '', isEndingRow && rowPlacements.length > 0);

    if (rowPlacements.length === 0) {
      // Only return updated object if stale markers were removed
      if (cleanedContent === (row.content || '') && cleanedGv === (row.gv || '') && cleanedHs === (row.hs || '')) {
        return row;
      }
      return {
        ...row,
        content: cleanedContent,
        gv: cleanedGv,
        hs: cleanedHs
      };
    }

    const contentLines = rowPlacements.map((p) => p.contentLine);
    const gvLines = rowPlacements.map((p) => p.gvLine);
    const hsLines = rowPlacements.map((p) => p.hsLine);

    return {
      ...row,
      content: insertContentLinesInRow(cleanedContent, contentLines, isEndingRow),
      gv: cleanedGv ? `${cleanedGv}\n${gvLines.join('\n')}` : gvLines.join('\n'),
      hs: cleanedHs ? `${cleanedHs}\n${hsLines.join('\n')}` : hsLines.join('\n')
    };
  });
}

