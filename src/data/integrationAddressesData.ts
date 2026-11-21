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
  // 1. KHỐI LỚP 1 — KHDH GDTC TÍCH HỢP 2026–2027 (TH & THCS NGHĨA HIỆP)
  // =========================================================================
  {
    id: 'nh_k1_p1',
    grade: 1,
    weekStart: 1,
    weekEnd: 1,
    periodStart: 1,
    periodEnd: 1,
    lessonRef: 'CĐ1 – Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tác phong nhanh nhẹn, nghiêm túc, chú ý lắng nghe hiệu lệnh của người chỉ huy.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['đứng nghiêm', 'đứng nghỉ']
  },
  {
    id: 'nh_k1_p3',
    grade: 1,
    weekStart: 2,
    weekEnd: 2,
    periodStart: 3,
    periodEnd: 3,
    lessonRef: 'CĐ1 – Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (tiết 3)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Biết xếp hàng trật tự, nhường nhịn bạn bè; mọi HS đều có quyền tham gia bình đẳng.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['đứng nghiêm', 'đứng nghỉ', 'xếp hàng']
  },
  {
    id: 'nh_k1_p5',
    grade: 1,
    weekStart: 3,
    weekEnd: 3,
    periodStart: 5,
    periodEnd: 5,
    lessonRef: 'CĐ1 – Bài 2: Tập hợp đội hình hàng dọc, dóng hàng và điểm số (tiết 2)',
    headerLabel: 'GDQPAN',
    content: 'Rèn ý thức tổ chức kỷ luật, phối hợp đồng bộ trong hàng dọc khi dóng hàng và điểm số.',
    domains: ['GDQPAN'],
    keywords: ['hàng dọc', 'dóng hàng', 'điểm số']
  },
  {
    id: 'nh_k1_p8',
    grade: 1,
    weekStart: 4,
    weekEnd: 4,
    periodStart: 8,
    periodEnd: 8,
    lessonRef: 'CĐ1 – Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 1)',
    headerLabel: 'BVMT',
    content: 'Nhắc nhở HS giữ gìn vệ sinh sân tập, không xả rác bừa bãi trước và sau giờ học.',
    domains: ['BVMT'],
    keywords: ['hàng ngang', 'dàn hàng', 'dồn hàng']
  },
  {
    id: 'nh_k1_p10',
    grade: 1,
    weekStart: 5,
    weekEnd: 5,
    periodStart: 10,
    periodEnd: 10,
    lessonRef: 'CĐ1 – Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 3)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Hỗ trợ, giúp đỡ bạn dàn hàng, dồn hàng đúng khoảng cách; không chen lấn, xô đẩy.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['hàng ngang', 'dàn hàng', 'dồn hàng']
  },
  {
    id: 'nh_k1_p12',
    grade: 1,
    weekStart: 6,
    weekEnd: 6,
    periodStart: 12,
    periodEnd: 12,
    lessonRef: 'CĐ1 – Bài 4: Động tác quay các hướng (tiết 1)',
    headerLabel: 'Năng lực số (L1–L2)',
    content: 'HS quan sát tranh/video minh họa trên màn hình để nhận diện hướng quay trái/phải.',
    domains: ['NLS'],
    nlsCode: 'L1–L2',
    keywords: ['quay các hướng', 'quay trái', 'quay phải']
  },
  {
    id: 'nh_k1_p14',
    grade: 1,
    weekStart: 7,
    weekEnd: 7,
    periodStart: 14,
    periodEnd: 14,
    lessonRef: 'CĐ1 – Bài 4: Động tác quay các hướng (tiết 3)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn phản xạ nhanh, chính xác theo khẩu lệnh quay các hướng.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['quay các hướng']
  },
  {
    id: 'nh_k1_p15',
    grade: 1,
    weekStart: 8,
    weekEnd: 8,
    periodStart: 15,
    periodEnd: 15,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay (tiết 1)',
    headerLabel: 'Năng lực số (L1–L2 – Mã 5.3)',
    content: 'Tập luyện theo nhịp đếm/nhạc nền phát từ thiết bị số giúp giữ nhịp đều.',
    domains: ['NLS'],
    nlsCode: 'L1–L2 – Mã 5.3',
    keywords: ['vươn thở', 'động tác tay']
  },
  {
    id: 'nh_k1_p17',
    grade: 1,
    weekStart: 9,
    weekEnd: 9,
    periodStart: 17,
    periodEnd: 17,
    lessonRef: 'CĐ2 – Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 1)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Tôn trọng thể lực từng bạn; động viên bạn thực hiện động tác chưa dẻo, không trêu chọc.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['động tác chân', 'vặn mình', 'động tác bụng']
  },
  {
    id: 'nh_k1_p20',
    grade: 1,
    weekStart: 10,
    weekEnd: 10,
    periodStart: 20,
    periodEnd: 20,
    lessonRef: 'CĐ2 – Bài 3: Động tác phối hợp và động tác điều hòa (tiết 1)',
    headerLabel: 'Năng lực số (L1–L2 – Mã 3.1)',
    content: 'Khuyến khích PH quay video ngắn động tác tại nhà để HS tự quan sát tư thế.',
    domains: ['NLS'],
    nlsCode: 'L1–L2 – Mã 3.1',
    keywords: ['phối hợp', 'điều hòa', 'điều hoà']
  },
  {
    id: 'nh_k1_p22',
    grade: 1,
    weekStart: 11,
    weekEnd: 11,
    periodStart: 22,
    periodEnd: 22,
    lessonRef: 'CĐ2 – Ôn tập bài thể dục',
    headerLabel: 'KNS & BVMT',
    content: 'Tự giác ôn tập theo nhóm; thu dọn, kiểm tra vệ sinh khu vực luyện tập.',
    domains: ['KNS', 'BVMT'],
    keywords: ['ôn tập bài thể dục']
  },
  {
    id: 'nh_k1_p24',
    grade: 1,
    weekStart: 12,
    weekEnd: 12,
    periodStart: 24,
    periodEnd: 24,
    lessonRef: 'CĐ2 – Hoàn thiện bài tập thể dục (tiết 2)',
    headerLabel: 'Quyền trẻ em',
    content: 'Đánh giá sự tiến bộ của từng cá nhân một cách công bằng, khích lệ tinh thần tập luyện.',
    domains: ['QuyenTreEm'],
    keywords: ['hoàn thiện bài tập thể dục']
  },
  {
    id: 'nh_k1_p25',
    grade: 1,
    weekStart: 13,
    weekEnd: 13,
    periodStart: 25,
    periodEnd: 25,
    lessonRef: 'CĐ3 – Bài 1: Vận động của đầu, cổ (Tiết 1)',
    headerLabel: 'ATGT',
    content: 'Liên hệ tư thế giữ thẳng đầu, cổ, quan sát xung quanh an toàn khi đi bộ trên đường.',
    domains: ['ATGT'],
    keywords: ['vận động của đầu, cổ', 'đầu, cổ']
  },
  {
    id: 'nh_k1_p28',
    grade: 1,
    weekStart: 14,
    weekEnd: 14,
    periodStart: 28,
    periodEnd: 28,
    lessonRef: 'CĐ3 – Bài 2: Vận động của tay (Tiết 1)',
    headerLabel: 'KNS',
    content: 'Rèn sự khéo léo, phối hợp nhịp nhàng giữa các thành viên trong nhóm khi vận động tay.',
    domains: ['KNS'],
    keywords: ['vận động của tay']
  },
  {
    id: 'nh_k1_p32',
    grade: 1,
    weekStart: 16,
    weekEnd: 16,
    periodStart: 32,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 3: Vận động của chân (Tiết 1)',
    headerLabel: 'ATGT & BVMT',
    content: 'Liên hệ đi đúng phần đường, không chạy nhảy ùa ra lòng đường; giữ sân bãi sạch đẹp.',
    domains: ['ATGT', 'BVMT'],
    keywords: ['vận động của chân']
  },
  {
    id: 'nh_k1_p35',
    grade: 1,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 35,
    periodEnd: 35,
    lessonRef: 'Ôn tập và đánh giá học kì 1',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Hợp tác nhóm nhỏ, tuân thủ luật chơi vận động, tôn trọng bạn chơi.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['đánh giá học kì 1', 'ôn tập và đánh giá học kì 1']
  },
  {
    id: 'nh_k1_p36',
    grade: 1,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 36,
    periodEnd: 36,
    lessonRef: 'Ôn tập - Kiểm tra cuối học kỳ I',
    headerLabel: 'Quyền trẻ em',
    content: 'Bình đẳng trong kiểm tra, đánh giá; tôn trọng sự cố gắng của mỗi học sinh.',
    domains: ['QuyenTreEm'],
    keywords: ['kiểm tra cuối học kỳ i', 'cuối học kỳ i']
  },
  {
    id: 'nh_k1_p39',
    grade: 1,
    weekStart: 20,
    weekEnd: 20,
    periodStart: 39,
    periodEnd: 39,
    lessonRef: 'CĐ3 – Bài 4: Vận động phối hợp của cơ thể (Tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tính kỷ luật, tinh thần đồng đội và ý chí vượt qua thử thách trong vận động phối hợp.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['vận động phối hợp của cơ thể']
  },
  {
    id: 'nh_k1_p42',
    grade: 1,
    weekStart: 21,
    weekEnd: 21,
    periodStart: 42,
    periodEnd: 42,
    lessonRef: 'CĐ3 – Bài 4: Vận động phối hợp của cơ thể (Tiết 4)',
    headerLabel: 'Năng lực số (L1–L2)',
    content: 'Quan sát hình ảnh/video mẫu tư thế phối hợp cơ thể để bắt chước đúng kỹ thuật.',
    domains: ['NLS'],
    nlsCode: 'L1–L2',
    keywords: ['vận động phối hợp của cơ thể']
  },
  {
    id: 'nh_k1_p45',
    grade: 1,
    weekStart: 23,
    weekEnd: 23,
    periodStart: 45,
    periodEnd: 45,
    lessonRef: 'CĐ3 – Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 1)',
    headerLabel: 'KNS',
    content: 'Rèn sự tự tin, kiên trì và khả năng giữ thăng bằng an toàn khi vận động.',
    domains: ['KNS'],
    keywords: ['vận động phối hợp của cơ thể (tiếp theo)']
  },
  {
    id: 'nh_k1_p48',
    grade: 1,
    weekStart: 24,
    weekEnd: 24,
    periodStart: 48,
    periodEnd: 48,
    lessonRef: 'CĐ3 – Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 4)',
    headerLabel: 'BVMT & KNS',
    content: 'Giữ gìn vệ sinh cá nhân, rửa tay sạch sẽ sau khi vận động trên sân.',
    domains: ['BVMT', 'KNS'],
    keywords: ['vận động phối hợp của cơ thể (tiếp theo)']
  },
  {
    id: 'nh_k1_p51',
    grade: 1,
    weekStart: 26,
    weekEnd: 26,
    periodStart: 51,
    periodEnd: 51,
    lessonRef: 'CĐ Bóng rổ – Bài 1: Làm quen với bóng (Tiết 1)',
    headerLabel: 'Năng lực số (L1–L2)',
    content: 'Xem hình ảnh/clip minh họa cách cầm bóng, giữ bóng rổ an toàn trên thiết bị trình chiếu.',
    domains: ['NLS'],
    nlsCode: 'L1–L2',
    keywords: ['làm quen với bóng']
  },
  {
    id: 'nh_k1_p53',
    grade: 1,
    weekStart: 27,
    weekEnd: 27,
    periodStart: 53,
    periodEnd: 53,
    lessonRef: 'CĐ Bóng rổ – Bài 1: Làm quen với bóng (Tiết 3)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Luân phiên lượt chơi để mọi bạn đều được làm quen với bóng; không tranh giành.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['làm quen với bóng']
  },
  {
    id: 'nh_k1_p55',
    grade: 1,
    weekStart: 28,
    weekEnd: 28,
    periodStart: 55,
    periodEnd: 55,
    lessonRef: 'CĐ Bóng rổ – Bài 2: Động tác di chuyển không bóng (Tiết 1)',
    headerLabel: 'ATGT & KNS',
    content: 'Rèn kỹ năng quan sát hướng di chuyển, tránh va chạm với bạn trên sân tập.',
    domains: ['ATGT', 'KNS'],
    keywords: ['di chuyển không bóng']
  },
  {
    id: 'nh_k1_p59',
    grade: 1,
    weekStart: 30,
    weekEnd: 30,
    periodStart: 59,
    periodEnd: 59,
    lessonRef: 'CĐ Bóng rổ – Bài 3: Động tác dẫn bóng (Tiết 1)',
    headerLabel: 'KNS',
    content: 'Rèn sự khéo léo, kiên nhẫn và kiểm soát cảm xúc khi thực hiện dẫn bóng.',
    domains: ['KNS'],
    keywords: ['dẫn bóng']
  },
  {
    id: 'nh_k1_p61',
    grade: 1,
    weekStart: 31,
    weekEnd: 31,
    periodStart: 61,
    periodEnd: 61,
    lessonRef: 'CĐ Bóng rổ – Bài 3: Động tác dẫn bóng (Tiết 3)',
    headerLabel: 'BVMT',
    content: 'Thu gom bóng và dụng cụ học tập gọn gàng, đúng nơi quy định sau tiết học.',
    domains: ['BVMT'],
    keywords: ['dẫn bóng']
  },
  {
    id: 'nh_k1_p64',
    grade: 1,
    weekStart: 32,
    weekEnd: 32,
    periodStart: 64,
    periodEnd: 64,
    lessonRef: 'CĐ Bóng rổ – Bài 4: Động tác ném rổ hai tay trước ngực (tiết 1)',
    headerLabel: 'Năng lực số (L1–L2)',
    content: 'Quan sát video mẫu tư thế ném rổ hai tay trước ngực để nhận biết động tác đúng.',
    domains: ['NLS'],
    nlsCode: 'L1–L2',
    keywords: ['ném rổ hai tay trước ngực']
  },
  {
    id: 'nh_k1_p67',
    grade: 1,
    weekStart: 34,
    weekEnd: 34,
    periodStart: 67,
    periodEnd: 67,
    lessonRef: 'CĐ Bóng rổ – Bài 4: Động tác ném rổ hai tay trước ngực (tiết 4)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Cổ vũ bạn ném bóng, rèn tinh thần đoàn kết và fair-play trong trò chơi.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['ném rổ hai tay trước ngực']
  },
  {
    id: 'nh_k1_p69',
    grade: 1,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 69,
    periodEnd: 69,
    lessonRef: 'Ôn tập và đánh giá học kì 2',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tự tin thể hiện kỹ năng, tôn trọng kết quả của bản thân và bạn bè.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['đánh giá học kì 2']
  },
  {
    id: 'nh_k1_p70',
    grade: 1,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 70,
    periodEnd: 70,
    lessonRef: 'Tổng kết môn học',
    headerLabel: 'Năng lực số (L1–L2 – Mã 2.2) & BVMT',
    content: 'Xem lại hình ảnh hoạt động nổi bật trong năm; nhắc nhở giữ vệ sinh trường lớp.',
    domains: ['NLS', 'BVMT'],
    nlsCode: 'L1–L2 – Mã 2.2',
    keywords: ['tổng kết môn học']
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
  // 3. KHỐI LỚP 3 — KHDH GDTC TÍCH HỢP 2026–2027 (TH & THCS NGHĨA HIỆP)
  // =========================================================================
  {
    id: 'nh_k3_p1',
    grade: 3,
    weekStart: 1,
    weekEnd: 1,
    periodStart: 1,
    periodEnd: 1,
    lessonRef: 'CĐ1 – Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 1)',
    headerLabel: 'GDQPAN & Năng lực số (L2–L3 – Mã 1.1)',
    content: 'Xem hình ảnh/video minh họa vị trí đứng hàng dọc; rèn tính kỷ luật.',
    domains: ['GDQPAN', 'NLS'],
    nlsCode: 'L2–L3 – Mã 1.1',
    keywords: ['hàng dọc']
  },
  {
    id: 'nh_k3_p3',
    grade: 3,
    weekStart: 2,
    weekEnd: 2,
    periodStart: 3,
    periodEnd: 3,
    lessonRef: 'CĐ1 – Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 3)',
    headerLabel: 'KNS',
    content: 'Rèn tinh thần hợp tác, tự giác chấp hành hiệu lệnh khi biến đổi đội hình.',
    domains: ['KNS'],
    keywords: ['hàng dọc', 'biến đổi']
  },
  {
    id: 'nh_k3_p5',
    grade: 3,
    weekStart: 3,
    weekEnd: 3,
    periodStart: 5,
    periodEnd: 5,
    lessonRef: 'CĐ1 – Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 1)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Phân công nhiệm vụ rõ ràng trong nhóm; tôn trọng và hỗ trợ bạn gióng hàng chuẩn.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['hàng ngang']
  },
  {
    id: 'nh_k3_p7',
    grade: 3,
    weekStart: 4,
    weekEnd: 4,
    periodStart: 7,
    periodEnd: 7,
    lessonRef: 'CĐ1 – Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 3)',
    headerLabel: 'BVMT',
    content: 'Kiểm tra vệ sinh sân tập trước giờ học, giữ gìn không gian tập luyện sạch sẽ.',
    domains: ['BVMT'],
    keywords: ['hàng ngang']
  },
  {
    id: 'nh_k3_p9',
    grade: 3,
    weekStart: 5,
    weekEnd: 5,
    periodStart: 9,
    periodEnd: 9,
    lessonRef: 'CĐ1 – Bài 3: Biến đổi ĐH từ một vòng tròn thành 2-3 vòng tròn và ngược lại (tiết 1)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Phối hợp nhịp nhàng theo vòng tròn, tạo cơ hội cho mọi bạn cùng tham gia điều hành.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['vòng tròn']
  },
  {
    id: 'nh_k3_p11',
    grade: 3,
    weekStart: 6,
    weekEnd: 6,
    periodStart: 11,
    periodEnd: 11,
    lessonRef: 'CĐ1 – Bài 4: Động tác đi đều và đứng lại (tiết 1)',
    headerLabel: 'GDQPAN & ATGT',
    content: 'Rèn tác phong nghiêm túc, đi đều đúng hàng; liên hệ đi bộ trật tự, an toàn giao thông.',
    domains: ['GDQPAN', 'ATGT'],
    keywords: ['đi đều', 'đứng lại']
  },
  {
    id: 'nh_k3_p13',
    grade: 3,
    weekStart: 7,
    weekEnd: 7,
    periodStart: 13,
    periodEnd: 13,
    lessonRef: 'CĐ1 – Bài 4: Động tác đi đều và đứng lại (tiết 3)',
    headerLabel: 'Năng lực số (L2–L3 – Mã 4.3)',
    content: 'Nhắc quy tắc an toàn mắt và tư thế khi xem video hướng dẫn kỹ thuật.',
    domains: ['NLS'],
    nlsCode: 'L2–L3 – Mã 4.3',
    keywords: ['đi đều', 'đứng lại']
  },
  {
    id: 'nh_k3_p15',
    grade: 3,
    weekStart: 8,
    weekEnd: 8,
    periodStart: 15,
    periodEnd: 15,
    lessonRef: 'CĐ1 – Ôn tập Chủ đề 1: Đội hình đội ngũ (tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Lồng ghép kỹ năng phòng tránh đuối nước; rèn ý thức kỷ luật khi ôn tập.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['ôn tập chủ đề 1', 'đuối nước']
  },
  {
    id: 'nh_k3_p16',
    grade: 3,
    weekStart: 8,
    weekEnd: 8,
    periodStart: 16,
    periodEnd: 16,
    lessonRef: 'CĐ1 – Ôn tập Chủ đề 1: Đội hình đội ngũ (tiết 2)',
    headerLabel: 'Quyền trẻ em',
    content: 'Đảm bảo quyền được bảo vệ an toàn; thực hành nhận biết nguy cơ mất an toàn dưới nước.',
    domains: ['QuyenTreEm'],
    keywords: ['ôn tập chủ đề 1', 'dưới nước']
  },
  {
    id: 'nh_k3_p17',
    grade: 3,
    weekStart: 9,
    weekEnd: 9,
    periodStart: 17,
    periodEnd: 17,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay (tiết 1)',
    headerLabel: 'Năng lực số (L2–L3 – Mã 5.3)',
    content: 'Sử dụng nhạc nền/nhịp đếm số từ thiết bị điện tử để điều hòa nhịp thở và động tác.',
    domains: ['NLS'],
    nlsCode: 'L2–L3 – Mã 5.3',
    keywords: ['vươn thở', 'động tác tay']
  },
  {
    id: 'nh_k3_p19',
    grade: 3,
    weekStart: 10,
    weekEnd: 10,
    periodStart: 19,
    periodEnd: 19,
    lessonRef: 'CĐ2 – Bài 2: Động tác chân, động tác lườn, động tác bụng (tiết 1)',
    headerLabel: 'BVMT & KNS',
    content: 'Giáo dục thói quen giữ vệ sinh cá nhân, lau mồ hôi, uống nước hợp lý sau vận động.',
    domains: ['BVMT', 'KNS'],
    keywords: ['động tác chân', 'động tác lườn', 'động tác bụng']
  },
  {
    id: 'nh_k3_p21',
    grade: 3,
    weekStart: 11,
    weekEnd: 11,
    periodStart: 21,
    periodEnd: 21,
    lessonRef: 'CĐ2 – Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (tiết 1)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Động viên, hỗ trợ bạn thực hiện động tác nhảy và phối hợp; không chê bai bạn.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['phối hợp', 'động tác nhảy', 'điều hòa']
  },
  {
    id: 'nh_k3_p25',
    grade: 3,
    weekStart: 13,
    weekEnd: 13,
    periodStart: 25,
    periodEnd: 25,
    lessonRef: 'CĐ3 – Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (tiết 1)',
    headerLabel: 'GDQPAN & ATGT',
    content: 'Rèn sự bình tĩnh, quan sát vật cản phía trước; liên hệ tránh chướng ngại vật an toàn.',
    domains: ['GDQPAN', 'ATGT'],
    keywords: ['chướng ngại vật trên đường thẳng']
  },
  {
    id: 'nh_k3_p29',
    grade: 3,
    weekStart: 15,
    weekEnd: 15,
    periodStart: 29,
    periodEnd: 29,
    lessonRef: 'CĐ3 – Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 1)',
    headerLabel: 'Năng lực số (L2–L3)',
    content: 'Quan sát video phân tích cách hạ trọng tâm khi đổi hướng gấp khúc để giữ thăng bằng.',
    domains: ['NLS'],
    nlsCode: 'L2–L3',
    keywords: ['đường gấp khúc']
  },
  {
    id: 'nh_k3_p32',
    grade: 3,
    weekStart: 16,
    weekEnd: 16,
    periodStart: 32,
    periodEnd: 32,
    lessonRef: 'CĐ3 – Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 4)',
    headerLabel: 'KNS & ATGT',
    content: 'Rèn kỹ năng kiểm soát tốc độ và hướng di chuyển an toàn khi qua đường gấp khúc.',
    domains: ['KNS', 'ATGT'],
    keywords: ['đường gấp khúc']
  },
  {
    id: 'nh_k3_p35',
    grade: 3,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 35,
    periodEnd: 35,
    lessonRef: 'Ôn tập và đánh giá học kì I',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Đánh giá công bằng, trung thực trong kiểm tra; tôn trọng năng lực từng học sinh.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['đánh giá học kì i']
  },
  {
    id: 'nh_k3_p37',
    grade: 3,
    weekStart: 19,
    weekEnd: 19,
    periodStart: 37,
    periodEnd: 37,
    lessonRef: 'CĐ3 – Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 1)',
    headerLabel: 'GDQPAN & BVMT',
    content: 'Rèn ý chí vượt khó trên địa hình tự nhiên; giữ gìn cảnh quan, cây xanh sân trường.',
    domains: ['GDQPAN', 'BVMT'],
    keywords: ['trên địa hình']
  },
  {
    id: 'nh_k3_p40',
    grade: 3,
    weekStart: 20,
    weekEnd: 20,
    periodStart: 40,
    periodEnd: 40,
    lessonRef: 'CĐ3 – Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 4)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Hợp tác, hỗ trợ đồng đội vượt chướng ngại vật an toàn.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['trên địa hình']
  },
  {
    id: 'nh_k3_p43',
    grade: 3,
    weekStart: 22,
    weekEnd: 22,
    periodStart: 43,
    periodEnd: 43,
    lessonRef: 'CĐ3 – Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 1)',
    headerLabel: 'Năng lực số (L2–L3)',
    content: 'Xem clip mẫu kỹ thuật tung – bắt bóng tại chỗ bằng hai tay để nhận diện điểm tiếp xúc bóng.',
    domains: ['NLS'],
    nlsCode: 'L2–L3',
    keywords: ['tại chỗ tung', 'tung - bắt bóng']
  },
  {
    id: 'nh_k3_p45',
    grade: 3,
    weekStart: 23,
    weekEnd: 23,
    periodStart: 45,
    periodEnd: 45,
    lessonRef: 'CĐ3 – Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 3)',
    headerLabel: 'KNS',
    content: 'Rèn sự tập trung, phối hợp mắt – tay và tinh thần trách nhiệm với bạn cùng cặp.',
    domains: ['KNS'],
    keywords: ['tại chỗ tung', 'tung - bắt bóng']
  },
  {
    id: 'nh_k3_p47',
    grade: 3,
    weekStart: 24,
    weekEnd: 24,
    periodStart: 47,
    periodEnd: 47,
    lessonRef: 'CĐ3 – Bài 5: Bài tập di chuyển tung - bắt bóng bằng hai tay (tiết 1)',
    headerLabel: 'BVMT & KNS',
    content: 'Giữ vệ sinh sân bãi và dụng cụ tập luyện; rèn sự khéo léo khi phối hợp di chuyển.',
    domains: ['BVMT', 'KNS'],
    keywords: ['di chuyển tung']
  },
  {
    id: 'nh_k3_p51',
    grade: 3,
    weekStart: 26,
    weekEnd: 26,
    periodStart: 51,
    periodEnd: 51,
    lessonRef: 'CĐ4 Bóng rổ – Bài 1: Bài tập bổ trợ với bóng (tiết 1)',
    headerLabel: 'Năng lực số (L2–L3 – Mã 1.1) & BVMT',
    content: 'Xem video bài tập bổ trợ bóng rổ; giữ vệ sinh sân bãi, dụng cụ.',
    domains: ['NLS', 'BVMT'],
    nlsCode: 'L2–L3 – Mã 1.1',
    keywords: ['bổ trợ với bóng']
  },
  {
    id: 'nh_k3_p55',
    grade: 3,
    weekStart: 28,
    weekEnd: 28,
    periodStart: 55,
    periodEnd: 55,
    lessonRef: 'CĐ4 Bóng rổ – Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 1)',
    headerLabel: 'KNS',
    content: 'Rèn sự khéo léo, kiên trì khi dẫn bóng thẳng và đổi hướng.',
    domains: ['KNS'],
    keywords: ['dẫn bóng theo hướng thẳng', 'dẫn bóng đổi hướng']
  },
  {
    id: 'nh_k3_p57',
    grade: 3,
    weekStart: 29,
    weekEnd: 29,
    periodStart: 57,
    periodEnd: 57,
    lessonRef: 'CĐ4 Bóng rổ – Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 3)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Luân phiên lượt tập công bằng giữa các thành viên trong tổ.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['dẫn bóng theo hướng thẳng', 'dẫn bóng đổi hướng']
  },
  {
    id: 'nh_k3_p59',
    grade: 3,
    weekStart: 30,
    weekEnd: 30,
    periodStart: 59,
    periodEnd: 59,
    lessonRef: 'CĐ4 Bóng rổ – Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 1)',
    headerLabel: 'Năng lực số (L2–L3)',
    content: 'Quan sát hình ảnh/video phân tích động tác chuyền bóng hai tay trước ngực.',
    domains: ['NLS'],
    nlsCode: 'L2–L3',
    keywords: ['chuyền bóng hai tay trước ngực']
  },
  {
    id: 'nh_k3_p62',
    grade: 3,
    weekStart: 31,
    weekEnd: 31,
    periodStart: 62,
    periodEnd: 62,
    lessonRef: 'CĐ4 Bóng rổ – Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 4)',
    headerLabel: 'KNS',
    content: 'Rèn kỹ năng giao tiếp, ra tín hiệu và phối hợp đồng đội khi chuyền – bắt bóng.',
    domains: ['KNS'],
    keywords: ['chuyền bóng hai tay trước ngực']
  },
  {
    id: 'nh_k3_p64',
    grade: 3,
    weekStart: 32,
    weekEnd: 32,
    periodStart: 64,
    periodEnd: 64,
    lessonRef: 'CĐ4 Bóng rổ – Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sự quyết đoán, bình tĩnh và phối hợp nhịp nhàng giữa dẫn bóng và ném rổ.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['phối hợp dẫn bóng', 'ném rổ bằng hai tay']
  },
  {
    id: 'nh_k3_p67',
    grade: 3,
    weekStart: 34,
    weekEnd: 34,
    periodStart: 67,
    periodEnd: 67,
    lessonRef: 'CĐ4 Bóng rổ – Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 4)',
    headerLabel: 'Quyền trẻ em & BVMT',
    content: 'Tôn trọng luật chơi, cổ vũ bạn; thu dọn bóng gọn gàng sau tiết học.',
    domains: ['QuyenTreEm', 'BVMT'],
    keywords: ['phối hợp dẫn bóng', 'ném rổ bằng hai tay']
  },
  {
    id: 'nh_k3_p69',
    grade: 3,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 69,
    periodEnd: 69,
    lessonRef: 'Ôn tập và đánh giá học kì 2',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tự tin thể hiện kỹ thuật, đánh giá khách quan kết quả học tập.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['đánh giá học kì 2']
  },
  {
    id: 'nh_k3_p70',
    grade: 3,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 70,
    periodEnd: 70,
    lessonRef: 'Tổng kết năm học',
    headerLabel: 'Năng lực số (L2–L3) & KNS',
    content: 'Tự nhận xét sự tiến bộ và lập kế hoạch rèn luyện thể thao an toàn dịp hè.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'L2–L3',
    keywords: ['tổng kết năm học']
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
  // 5. KHỐI LỚP 5 — KHDH GDTC TÍCH HỢP 2026–2027 (TH & THCS NGHĨA HIỆP)
  // =========================================================================
  {
    id: 'nh_k5_p1',
    grade: 5,
    weekStart: 1,
    weekEnd: 1,
    periodStart: 1,
    periodEnd: 1,
    lessonRef: 'CĐ1 – Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 1)',
    headerLabel: 'GDQPAN & Năng lực số (L4–L5 – Mã 1.1)',
    content: 'HS tự tìm kiếm/xem video kỹ thuật phối hợp đội hình; rèn tác phong chỉ huy.',
    domains: ['GDQPAN', 'NLS'],
    nlsCode: 'L4–L5 – Mã 1.1',
    keywords: ['phối hợp đội hình đội ngũ']
  },
  {
    id: 'nh_k5_p3',
    grade: 5,
    weekStart: 2,
    weekEnd: 2,
    periodStart: 3,
    periodEnd: 3,
    lessonRef: 'CĐ1 – Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 3)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Phát huy vai trò tự quản của nhóm trưởng; tôn trọng ý kiến đóng góp của các bạn trong tổ.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['phối hợp đội hình đội ngũ']
  },
  {
    id: 'nh_k5_p5',
    grade: 5,
    weekStart: 3,
    weekEnd: 3,
    periodStart: 5,
    periodEnd: 5,
    lessonRef: 'CĐ1 – Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tính kỷ luật, sự thống nhất và phối hợp đồng bộ khi biến đổi đội hình.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['biến đổi đội hình']
  },
  {
    id: 'nh_k5_p8',
    grade: 5,
    weekStart: 4,
    weekEnd: 4,
    periodStart: 8,
    periodEnd: 8,
    lessonRef: 'CĐ1 – Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 4)',
    headerLabel: 'BVMT',
    content: 'Kiểm tra vệ sinh sân tập, nhắc nhở ý thức giữ gìn môi trường xanh – sạch – đẹp.',
    domains: ['BVMT'],
    keywords: ['biến đổi đội hình']
  },
  {
    id: 'nh_k5_p11',
    grade: 5,
    weekStart: 6,
    weekEnd: 6,
    periodStart: 11,
    periodEnd: 11,
    lessonRef: 'CĐ1 – Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 1)',
    headerLabel: 'Năng lực số (L4–L5 – Mã 6.1) & ATGT',
    content: 'Dùng video/ứng dụng phân tích tư thế nhận diện lỗi đi đều; liên hệ đi đúng phần đường.',
    domains: ['NLS', 'ATGT'],
    nlsCode: 'L4–L5 – Mã 6.1',
    keywords: ['đi đều vòng các hướng']
  },
  {
    id: 'nh_k5_p13',
    grade: 5,
    weekStart: 7,
    weekEnd: 7,
    periodStart: 13,
    periodEnd: 13,
    lessonRef: 'CĐ1 – Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 3)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn tác phong nghiêm trang, giữ cự li và tốc độ đều khi đi đều vòng các hướng.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['đi đều vòng các hướng']
  },
  {
    id: 'nh_k5_p15',
    grade: 5,
    weekStart: 8,
    weekEnd: 8,
    periodStart: 15,
    periodEnd: 15,
    lessonRef: 'CĐ2 – Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy (Tiết 1)',
    headerLabel: 'GDQPAN, KNS & BVMT',
    content: 'Rèn sự khéo léo, kỷ luật khi sử dụng gậy; kiểm tra độ an toàn dụng cụ trước khi tập.',
    domains: ['GDQPAN', 'KNS', 'BVMT'],
    keywords: ['vươn thở', 'động tác tay', 'động tác chân với gậy']
  },
  {
    id: 'nh_k5_p17',
    grade: 5,
    weekStart: 9,
    weekEnd: 9,
    periodStart: 17,
    periodEnd: 17,
    lessonRef: 'CĐ2 – Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 1)',
    headerLabel: 'Năng lực số (L4–L5 – Mã 5.3)',
    content: 'Sử dụng ứng dụng đếm nhịp số để chủ động điều chỉnh nhịp tập bài thể dục với gậy.',
    domains: ['NLS'],
    nlsCode: 'L4–L5 – Mã 5.3',
    keywords: ['động tác bụng', 'vặn mình', 'toàn thân với gậy']
  },
  {
    id: 'nh_k5_p20',
    grade: 5,
    weekStart: 10,
    weekEnd: 10,
    periodStart: 20,
    periodEnd: 20,
    lessonRef: 'CĐ2 – Bài 3: Động tác nhảy và động tác điều hòa với gậy (tiết 1)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Hỗ trợ bạn thực hiện động tác khó một cách tôn trọng; đảm bảo khoảng cách an toàn khi cầm gậy.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['động tác nhảy', 'điều hòa với gậy']
  },
  {
    id: 'nh_k5_p22',
    grade: 5,
    weekStart: 11,
    weekEnd: 11,
    periodStart: 22,
    periodEnd: 22,
    lessonRef: 'CĐ2 – Hoàn thiện bài thể dục phát triển chung với gậy (Tiết 1)',
    headerLabel: 'KNS & BVMT',
    content: 'Tự giác luyện tập nhóm; thu dọn và bảo quản gậy tập gọn gàng, đúng quy định.',
    domains: ['KNS', 'BVMT'],
    keywords: ['hoàn thiện bài thể dục phát triển chung với gậy']
  },
  {
    id: 'nh_k5_p28',
    grade: 5,
    weekStart: 14,
    weekEnd: 14,
    periodStart: 28,
    periodEnd: 28,
    lessonRef: 'CĐ3 – Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 4)',
    headerLabel: 'Năng lực số (L4–L5)',
    content: 'Xem video chậm (slow-motion) phân tích kỹ thuật lăn để phòng tránh chấn thương cột sống.',
    domains: ['NLS'],
    nlsCode: 'L4–L5',
    keywords: ['kĩ năng lăn', 'kỹ năng lăn']
  },
  {
    id: 'nh_k5_p31',
    grade: 5,
    weekStart: 16,
    weekEnd: 16,
    periodStart: 31,
    periodEnd: 31,
    lessonRef: 'CĐ3 – Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 1)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tuân thủ nguyên tắc an toàn, hỗ trợ bảo hiểm cho bạn khi tập lộn xuôi; không đùa nghịch.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['lộn xuôi']
  },
  {
    id: 'nh_k5_p35',
    grade: 5,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 35,
    periodEnd: 35,
    lessonRef: 'Ôn tập học kì I',
    headerLabel: 'KNS',
    content: 'Rèn tính tự giác, trung thực và kỹ năng tự điều chỉnh động tác trước kiểm tra.',
    domains: ['KNS'],
    keywords: ['ôn tập học kì i']
  },
  {
    id: 'nh_k5_p36',
    grade: 5,
    weekStart: 18,
    weekEnd: 18,
    periodStart: 36,
    periodEnd: 36,
    lessonRef: 'Kiểm tra cuối học kỳ I',
    headerLabel: 'Quyền trẻ em',
    content: 'Đánh giá công bằng, tôn trọng sự khác biệt về thể lực và tốc độ tiến bộ của từng HS.',
    domains: ['QuyenTreEm'],
    keywords: ['kiểm tra cuối học kỳ i']
  },
  {
    id: 'nh_k5_p39',
    grade: 5,
    weekStart: 20,
    weekEnd: 20,
    periodStart: 39,
    periodEnd: 39,
    lessonRef: 'CĐ3 – Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sức mạnh, sự bền bỉ và ý chí vượt khó trong bài tập rèn luyện kỹ năng leo.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['kĩ năng leo', 'kỹ năng leo']
  },
  {
    id: 'nh_k5_p42',
    grade: 5,
    weekStart: 21,
    weekEnd: 21,
    periodStart: 42,
    periodEnd: 42,
    lessonRef: 'CĐ3 – Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 4)',
    headerLabel: 'Năng lực số (L4–L5) & BVMT',
    content: 'Quan sát clip hướng dẫn điểm tựa an toàn khi leo; giữ vệ sinh khu vực tập luyện.',
    domains: ['NLS', 'BVMT'],
    nlsCode: 'L4–L5',
    keywords: ['kĩ năng leo', 'kỹ năng leo']
  },
  {
    id: 'nh_k5_p45',
    grade: 5,
    weekStart: 23,
    weekEnd: 23,
    periodStart: 45,
    periodEnd: 45,
    lessonRef: 'CĐ3 – Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 1)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sự bình tĩnh, khéo léo và tinh thần hỗ trợ đồng đội khi thực hiện kỹ năng trèo.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['kỹ năng trèo', 'kĩ năng trèo']
  },
  {
    id: 'nh_k5_p48',
    grade: 5,
    weekStart: 24,
    weekEnd: 24,
    periodStart: 48,
    periodEnd: 48,
    lessonRef: 'CĐ3 – Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 4)',
    headerLabel: 'Quyền trẻ em & KNS',
    content: 'Đảm bảo an toàn tuyệt đối cho bản thân và bạn bè; tuân thủ nghiêm quy định sân bãi.',
    domains: ['QuyenTreEm', 'KNS'],
    keywords: ['kỹ năng trèo', 'kĩ năng trèo']
  },
  {
    id: 'nh_k5_p54',
    grade: 5,
    weekStart: 27,
    weekEnd: 27,
    periodStart: 54,
    periodEnd: 54,
    lessonRef: 'CĐ Bóng rổ – Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 4)',
    headerLabel: 'ATGT & KNS',
    content: 'Rèn khả năng quan sát rộng, làm chủ tốc độ và chuyển hướng linh hoạt, tránh va chạm.',
    domains: ['ATGT', 'KNS'],
    keywords: ['dẫn bóng thay đổi tốc độ', 'đường vòng']
  },
  {
    id: 'nh_k5_p57',
    grade: 5,
    weekStart: 29,
    weekEnd: 29,
    periodStart: 57,
    periodEnd: 57,
    lessonRef: 'CĐ Bóng rổ – Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 1)',
    headerLabel: 'Năng lực số (L4–L5 – Mã 6.1)',
    content: 'Quay video ngắn hoặc dùng ứng dụng AI đơn giản tự soi tư thế chuyền, bắt bóng trên cao.',
    domains: ['NLS'],
    nlsCode: 'L4–L5 – Mã 6.1',
    keywords: ['chuyền, bắt bóng bằng hai tay trên cao']
  },
  {
    id: 'nh_k5_p59',
    grade: 5,
    weekStart: 30,
    weekEnd: 30,
    periodStart: 59,
    periodEnd: 59,
    lessonRef: 'CĐ Bóng rổ – Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 3)',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Rèn kỹ năng phối hợp đồng đội, tin tưởng và chia sẻ cơ hội bóng công bằng cho mọi bạn.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['chuyền, bắt bóng bằng hai tay trên cao']
  },
  {
    id: 'nh_k5_p61',
    grade: 5,
    weekStart: 31,
    weekEnd: 31,
    periodStart: 61,
    periodEnd: 61,
    lessonRef: 'CĐ Bóng rổ – Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 1)',
    headerLabel: 'Năng lực số (L4–L5 – Mã 1.1)',
    content: 'Xem video phân tích nhịp bước chân (2 bước) và động tác ném rổ một tay trên vai.',
    domains: ['NLS'],
    nlsCode: 'L4–L5 – Mã 1.1',
    keywords: ['hai bước ném rổ']
  },
  {
    id: 'nh_k5_p64',
    grade: 5,
    weekStart: 32,
    weekEnd: 32,
    periodStart: 64,
    periodEnd: 64,
    lessonRef: 'CĐ Bóng rổ – Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 4)',
    headerLabel: 'GDQPAN & KNS',
    content: 'Rèn sự quyết đoán, tập trung cao độ và bản lĩnh thi đấu trong thực hành ném rổ.',
    domains: ['GDQPAN', 'KNS'],
    keywords: ['hai bước ném rổ']
  },
  {
    id: 'nh_k5_p67',
    grade: 5,
    weekStart: 34,
    weekEnd: 34,
    periodStart: 67,
    periodEnd: 67,
    lessonRef: 'CĐ Bóng rổ – Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 7)',
    headerLabel: 'Quyền trẻ em, KNS & BVMT',
    content: 'Tôn trọng luật chơi và đối thủ, giải quyết bất đồng ôn hòa; thu gom dụng cụ sạch sẽ.',
    domains: ['QuyenTreEm', 'KNS', 'BVMT'],
    keywords: ['hai bước ném rổ']
  },
  {
    id: 'nh_k5_p69',
    grade: 5,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 69,
    periodEnd: 69,
    lessonRef: 'Ôn tập và đánh giá học kì II',
    headerLabel: 'KNS & Quyền trẻ em',
    content: 'Tự tin thể hiện năng lực, đánh giá khách quan kết quả rèn luyện cuối năm.',
    domains: ['KNS', 'QuyenTreEm'],
    keywords: ['đánh giá học kì ii']
  },
  {
    id: 'nh_k5_p70',
    grade: 5,
    weekStart: 35,
    weekEnd: 35,
    periodStart: 70,
    periodEnd: 70,
    lessonRef: 'Kiểm tra cuối năm. Tổng kết môn học',
    headerLabel: 'Năng lực số (L4–L5) & KNS',
    content: 'Lập kế hoạch rèn luyện TDTT vừa sức trong dịp hè và chia sẻ kinh nghiệm cùng bạn bè.',
    domains: ['NLS', 'KNS'],
    nlsCode: 'L4–L5',
    keywords: ['kiểm tra cuối năm', 'tổng kết môn học']
  }
];

function buildGeneralKnowledgeFallbackAddress(
  grade: GradeLevel,
  week: number,
  period?: number,
  lessonTitle?: string
): OfficialIntegrationAddress {
  const p = period || (week - 1) * 2 + 1;
  return {
    id: `nh_k${grade}_p${p}_general`,
    grade,
    weekStart: week,
    weekEnd: week,
    periodStart: p,
    periodEnd: p,
    lessonRef: lessonTitle || `Kiến thức chung về GDTC (Tuần ${week} – Tiết ${p})`,
    headerLabel: 'Kiến thức chung & KNS – BVMT',
    content:
      'Lồng ghép vệ sinh sân tập, vệ sinh cá nhân, chuẩn bị dụng cụ tập luyện, dinh dưỡng hợp lý và phòng chống tai nạn thương tích.',
    domains: ['KNS', 'BVMT'],
    keywords: ['kiến thức chung', 'vệ sinh sân tập', 'an toàn tập luyện']
  };
}

/**
 * Looks up the exact official integration address for a given Grade, Week, Period, and optional Lesson Title.
 *
 * For Grades 1, 3, 5 (synced to the official 2026-2027 Nghĩa Hiệp integrated plan):
 * 1. Exact `(grade, period)` match ALWAYS takes top priority.
 * 2. If `period` is specified and that specific period has no dedicated note in the PDF table,
 *    returns the official "Kiến thức chung về GDTC" thread (matching the PDF's top guidance row).
 * 3. If `period` is omitted (week-level summary), returns the week's explicit entry if present,
 *    otherwise the "Kiến thức chung về GDTC" thread.
 *
 * For Grades 2 & 4: keeps the week-range + keyword matcher intact.
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

  // Grades 1, 3, 5 follow the exact per-period 2026-2027 Nghĩa Hiệp integrated plan
  if (safeGrade === 1 || safeGrade === 3 || safeGrade === 5) {
    if (period && period >= 1 && period <= 70) {
      const exactPeriodMatch = gradeEntries.find(
        (item) => period >= item.periodStart && period <= item.periodEnd
      );
      if (exactPeriodMatch) return exactPeriodMatch;
      return buildGeneralKnowledgeFallbackAddress(safeGrade, safeWeek, period, lessonTitle);
    }

    const weekMatch = gradeEntries.find(
      (item) => safeWeek >= item.weekStart && safeWeek <= item.weekEnd
    );
    if (weekMatch) return weekMatch;
    return buildGeneralKnowledgeFallbackAddress(safeGrade, safeWeek, undefined, lessonTitle);
  }

  // Grades 2 & 4: week-range + keyword match
  const exactWeekMatch =
    gradeEntries.find((item) => safeWeek >= item.weekStart && safeWeek <= item.weekEnd) ||
    (period
      ? gradeEntries.find((item) => period >= item.periodStart && period <= item.periodEnd)
      : undefined) ||
    gradeEntries[0];

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

  // 2. Home application / Summer plan / Daily habit / Drowning safety / Real-life ATGT connection / Post-lesson cleanup & hygiene -> 4.2 Vận dụng & Kết thúc
  if (
    /ở nhà|tại nhà|phụ huynh|lập kế hoạch|vận động hè|dịp hè|tự tổng kết|thói quen vận động hằng ngày|chia sẻ sản phẩm|chia sẻ kinh nghiệm|tự nhận xét sự tiến bộ|hoạt động nổi bật trong năm|đuối nước|dưới nước/.test(
      lower
    )
  ) {
    return '4.2_van_dung';
  }

  if (/liên hệ|ùa ra đường|ùa ra lòng đường|trên đường|khi đi lại|an toàn giao thông|đúng phần đường/.test(lower)) {
    return '4.2_van_dung';
  }

  // Pre-lesson facility & equipment safety inspection -> 1.1 Nhận lớp
  if (/kiểm tra vệ sinh sân tập trước giờ học|kiểm tra độ an toàn dụng cụ trước khi tập/.test(lower)) {
    return '1.1_nhan_lop';
  }

  if (
    /thu dọn|thu gom|không xả rác|vệ sinh sân|vệ sinh khu vực|vệ sinh môi trường|vệ sinh trường lớp|vệ sinh cá nhân|rửa tay|chai nước|nguồn nước|hồ bơi|lau mồ hôi|uống nước|sân tập sạch|sân bãi sạch|cảnh quan|cây xanh|giữ gìn dụng cụ/.test(
      lower
    )
  ) {
    return '4.2_van_dung';
  }

  // 3. Visual / Video / AI observation -> 2.1 Kiến thức mới (or 3.4/4.2 if assessment review)
  if (
    /trình chiếu|xem hình ảnh|xem video|xem clip|tìm kiếm|lọc video|khai thác video|khai thác hình ảnh|khai thác học liệu|bảng tương tác|màn hình|nhận diện hướng|nhận diện lỗi|quy tắc an toàn mắt|quy tắc an toàn khi xem video|phân tích tư thế|phân tích kỹ thuật|phân tích cách hạ trọng tâm|phân tích động tác|phân tích nhịp bước|quan sát video|quan sát hình ảnh|quan sát clip|tự soi tư thế|slow-motion/.test(
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
  if (/xếp hàng trật tự|nhường nhịn bạn bè|nhường nhịn nhau khi xếp hàng/.test(lower)) {
    return '1.1_nhan_lop';
  }

  // 6. Games, Relays, Rules, Fair-play, Emotions -> 3.5 Trò chơi vận động
  if (
    /trò chơi|tiếp sức|luật chơi|fair-play|tranh giành|thắng\/thua|trọng tài|đối thủ|thi đấu|bịt mắt|bất đồng|mâu thuẫn|chạm bóng|ném trúng đích|cổ vũ bạn/.test(
      lower
    )
  ) {
    return '3.5_tro_choi';
  }

  // 7. Assessment / Fair evaluation / Peer applause -> 3.4 Thi đua / Tổng hợp kết quả
  if (
    /đánh giá công bằng|đánh giá khách quan|đánh giá sự tiến bộ|bình đẳng trong kiểm tra|tự đánh giá|ghi nhận tiến bộ|tự tin thể hiện kỹ năng|tự tin thể hiện năng lực|tự tin thể hiện kỹ thuật|cổ vũ tích cực|tôn trọng kết quả|tôn trọng năng lực|thái độ trung thực|trung thực và kỹ năng tự điều chỉnh/.test(
      lower
    )
  ) {
    return '3.4_thi_dua';
  }

  // 8. Whole-class formation discipline / Marching / Pace / Wand safety -> 3.1 Tập đồng loạt
  if (
    /hiệu lệnh|khẩu lệnh|hàng ngũ|hàng dọc|cự li|đồng bộ|vạch kẻ|đi theo vạch|gậy tập|sử dụng gậy|chỉ huy|chấp hành|vật cản|tăng tốc độ|tác phong|kỷ luật|tránh va chạm/.test(
      lower
    )
  ) {
    return '3.1_dong_loat';
  }

  // 9. Group cooperation, equality, helping peers, safe space, perseverance -> 3.2 Tập tổ / nhóm
  if (
    /nhóm|tổ|bình đẳng|hỗ trợ bạn|hỗ trợ bảo hiểm|hỗ trợ đồng đội|tôn trọng|không trêu chọc|không chê bai|chia sẻ|phân công|không gian tập|tự học|kiên trì|phối hợp mắt – tay|chiến thuật nhỏ|khéo léo|sẵn sàng luyện tập|an toàn tuyệt đối|bảo hiểm|khoảng cách an toàn|luân phiên lượt/.test(
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
      if (/^[-•+]?\s*Tích hợp(?:\s+[^:\n]{0,60})?:/i.test(trimmed)) return false;
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

