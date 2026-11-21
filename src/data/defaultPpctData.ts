import { GradeLevel, PpctItem } from '../types/gdtc';
import { formatIntegrationForScheduleCell } from './integrationAddressesData';

/**
 * KẾ HOẠCH DẠY HỌC MÔN GIÁO DỤC THỂ CHẤT ĐÃ TÍCH HỢP (NĂM HỌC 2026 – 2027)
 * Trường Tiểu học & THCS Nghĩa Hiệp – UBND xã Vệ Giang
 *
 * - Khối 1, Khối 3, Khối 5: Đồng bộ 100% từng tuần (Tuần 1 – 35), từng tiết (Tiết 1 – 70),
 *   tên chủ đề, tên bài học và nội dung lồng ghép/tích hợp từ file KHDH tích hợp chính thức.
 * - Khối 2, Khối 4: Chuẩn phân phối chương trình GDPT 2018 (Kết nối tri thức – 70 tiết/khối).
 */

export const OFFICIAL_PPCT_SOURCE_LABEL =
  'Kế hoạch dạy học GDTC tích hợp 2026 – 2027 (TH & THCS Nghĩa Hiệp · Khối 1, 3, 5)';

export const OFFICIAL_GENERAL_KNOWLEDGE_NOTE =
  'Kiến thức chung về GDTC (Vệ sinh sân tập, vệ sinh cá nhân; chuẩn bị đồ dùng, dụng cụ tập luyện; dinh dưỡng trong tập luyện): Được hướng dẫn lồng ghép tích hợp xuyên suốt vào tất cả các giờ học một cách phù hợp (NLS theo TT 02/2025/TT-BGDĐT, GDQPAN, Quyền trẻ em, ATGT, KNS, BVMT và phòng chống tai nạn thương tích).';

export const DEFAULT_GENERAL_PERIOD_INTEGRATION =
  'Lồng ghép Kiến thức chung: Vệ sinh sân tập, vệ sinh cá nhân, chuẩn bị dụng cụ, an toàn tập luyện & phòng chống tai nạn thương tích.';

type PeriodRowTuple = [
  period: number,
  topic: string,
  lessonTitle: string,
  integrationNotes: string,
  equipment?: string
];

function buildExactPpctList(
  grade: GradeLevel,
  rows: PeriodRowTuple[],
  defaultEquipment: string
): PpctItem[] {
  return rows.map(([period, topic, lessonTitle, integrationNotes, equipment]) => {
    const week = Math.ceil(period / 2);
    return {
      id: `ppct_k${grade}_p${period}`,
      grade,
      week,
      period,
      topic,
      lessonTitle,
      integrationNotes: integrationNotes.trim(),
      equipment: equipment || defaultEquipment
    };
  });
}

// ============================================================================
// 1. KHỐI LỚP 1 — KẾ HOẠCH DẠY HỌC MÔN GDTC 1 (NĂM HỌC 2026 – 2027 · 70 TIẾT)
// ============================================================================
const K1_CD1 = 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ';
const K1_CD2 = 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
const K1_CD3 = 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN';
const K1_CD4 = 'CHỦ ĐỀ: MÔN THỂ THAO TỰ CHỌN: BÓNG RỔ';

const EQ_BASIC = 'SGK, Tranh ảnh, còi, dụng cụ TL';
const EQ_VIDEO = 'SGK, Tranh ảnh, video/màn hình, còi, dụng cụ TL';
const EQ_AUDIO = 'SGK, Loa/thiết bị đếm nhịp, tranh ảnh, còi';
const EQ_BASKETBALL = 'SGK, Bóng rổ thiếu nhi, rổ tập, còi, cọc tiêu';
const EQ_BASKETBALL_VIDEO = 'SGK, Video minh họa, bóng rổ thiếu nhi, còi';

export const defaultGrade1Ppct: PpctItem[] = buildExactPpctList(
  1,
  [
    // Tuần 1 (Tiết 1, 2)
    [1, K1_CD1, 'Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (tiết 1)', 'GDQPAN & KNS: Rèn tác phong nhanh nhẹn, nghiêm túc, chú ý lắng nghe hiệu lệnh của người chỉ huy.', EQ_BASIC],
    [2, K1_CD1, 'Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (tiết 2)', '', EQ_BASIC],
    // Tuần 2 (Tiết 3, 4)
    [3, K1_CD1, 'Bài 1: Các tư thế đứng nghiêm, đứng nghỉ (tiết 3)', 'KNS & Quyền trẻ em: Biết xếp hàng trật tự, nhường nhịn bạn bè; mọi HS đều có quyền tham gia bình đẳng.', EQ_BASIC],
    [4, K1_CD1, 'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng và điểm số (tiết 1)', '', EQ_BASIC],
    // Tuần 3 (Tiết 5, 6)
    [5, K1_CD1, 'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng và điểm số (tiết 2)', 'GDQPAN: Rèn ý thức tổ chức kỷ luật, phối hợp đồng bộ trong hàng dọc khi dóng hàng và điểm số.', EQ_BASIC],
    [6, K1_CD1, 'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng và điểm số (tiết 3)', '', EQ_BASIC],
    // Tuần 4 (Tiết 7, 8)
    [7, K1_CD1, 'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng và điểm số (tiết 4)', '', EQ_BASIC],
    [8, K1_CD1, 'Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 1)', 'BVMT: Nhắc nhở HS giữ gìn vệ sinh sân tập, không xả rác bừa bãi trước và sau giờ học.', EQ_BASIC],
    // Tuần 5 (Tiết 9, 10)
    [9, K1_CD1, 'Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 2)', '', EQ_BASIC],
    [10, K1_CD1, 'Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 3)', 'Quyền trẻ em & KNS: Hỗ trợ, giúp đỡ bạn dàn hàng, dồn hàng đúng khoảng cách; không chen lấn, xô đẩy.', EQ_BASIC],
    // Tuần 6 (Tiết 11, 12)
    [11, K1_CD1, 'Bài 3: Tập hợp đội hình hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng (tiết 4)', '', EQ_BASIC],
    [12, K1_CD1, 'Bài 4: Động tác quay các hướng (tiết 1)', 'Năng lực số (L1–L2): HS quan sát tranh/video minh họa trên màn hình để nhận diện hướng quay trái/phải.', EQ_VIDEO],
    // Tuần 7 (Tiết 13, 14)
    [13, K1_CD1, 'Bài 4: Động tác quay các hướng (tiết 2)', '', EQ_BASIC],
    [14, K1_CD1, 'Bài 4: Động tác quay các hướng (tiết 3)', 'GDQPAN & KNS: Rèn phản xạ nhanh, chính xác theo khẩu lệnh quay các hướng.', EQ_BASIC],
    // Tuần 8 (Tiết 15, 16)
    [15, K1_CD2, 'Bài 1: Động tác vươn thở, động tác tay (tiết 1)', 'Năng lực số (L1–L2 – Mã 5.3): Tập luyện theo nhịp đếm/nhạc nền phát từ thiết bị số giúp giữ nhịp đều.', EQ_AUDIO],
    [16, K1_CD2, 'Bài 1: Động tác vươn thở, động tác tay (tiết 2)', '', EQ_BASIC],
    // Tuần 9 (Tiết 17, 18)
    [17, K1_CD2, 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 1)', 'Quyền trẻ em & KNS: Tôn trọng thể lực từng bạn; động viên bạn thực hiện động tác chưa dẻo, không trêu chọc.', EQ_BASIC],
    [18, K1_CD2, 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 2)', '', EQ_BASIC],
    // Tuần 10 (Tiết 19, 20)
    [19, K1_CD2, 'Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 3)', '', EQ_BASIC],
    [20, K1_CD2, 'Bài 3: Động tác phối hợp và động tác điều hòa (tiết 1)', 'Năng lực số (L1–L2 – Mã 3.1): Khuyến khích PH quay video ngắn động tác tại nhà để HS tự quan sát tư thế.', EQ_VIDEO],
    // Tuần 11 (Tiết 21, 22)
    [21, K1_CD2, 'Bài 3: Động tác phối hợp và động tác điều hòa (tiết 2)', '', EQ_BASIC],
    [22, K1_CD2, 'Ôn tập bài thể dục', 'KNS & BVMT: Tự giác ôn tập theo nhóm; thu dọn, kiểm tra vệ sinh khu vực luyện tập.', EQ_BASIC],
    // Tuần 12 (Tiết 23, 24)
    [23, K1_CD2, 'Hoàn thiện bài tập thể dục (tiết 1)', '', EQ_BASIC],
    [24, K1_CD2, 'Hoàn thiện bài tập thể dục (tiết 2)', 'Quyền trẻ em: Đánh giá sự tiến bộ của từng cá nhân một cách công bằng, khích lệ tinh thần tập luyện.', EQ_BASIC],
    // Tuần 13 (Tiết 25, 26)
    [25, K1_CD3, 'Bài 1: Vận động của đầu, cổ (Tiết 1)', 'ATGT: Liên hệ tư thế giữ thẳng đầu, cổ, quan sát xung quanh an toàn khi đi bộ trên đường.', EQ_BASIC],
    [26, K1_CD3, 'Bài 1: Vận động của đầu, cổ (Tiết 2)', '', EQ_BASIC],
    // Tuần 14 (Tiết 27, 28)
    [27, K1_CD3, 'Bài 1: Vận động của đầu, cổ (Tiết 3)', '', EQ_BASIC],
    [28, K1_CD3, 'Bài 2: Vận động của tay (Tiết 1)', 'KNS: Rèn sự khéo léo, phối hợp nhịp nhàng giữa các thành viên trong nhóm khi vận động tay.', EQ_BASIC],
    // Tuần 15 (Tiết 29, 30)
    [29, K1_CD3, 'Bài 2: Vận động của tay (Tiết 2)', '', EQ_BASIC],
    [30, K1_CD3, 'Bài 2: Vận động của tay (Tiết 3)', '', EQ_BASIC],
    // Tuần 16 (Tiết 31, 32)
    [31, K1_CD3, 'Bài 2: Vận động của tay (Tiết 4)', '', EQ_BASIC],
    [32, K1_CD3, 'Bài 3: Vận động của chân (Tiết 1)', 'ATGT & BVMT: Liên hệ đi đúng phần đường, không chạy nhảy ùa ra lòng đường; giữ sân bãi sạch đẹp.', EQ_BASIC],
    // Tuần 17 (Tiết 33, 34)
    [33, K1_CD3, 'Bài 3: Vận động của chân (Tiết 2)', '', EQ_BASIC],
    [34, K1_CD3, 'Bài 3: Vận động của chân (Tiết 3)', '', EQ_BASIC],
    // Tuần 18 (Tiết 35, 36)
    [35, K1_CD3, 'Ôn tập và đánh giá học kì 1', 'KNS & Quyền trẻ em: Hợp tác nhóm nhỏ, tuân thủ luật chơi vận động, tôn trọng bạn chơi.', EQ_BASIC],
    [36, K1_CD3, 'Ôn tập - Kiểm tra cuối học kỳ I', 'Quyền trẻ em: Bình đẳng trong kiểm tra, đánh giá; tôn trọng sự cố gắng của mỗi học sinh.', EQ_BASIC],
    // Tuần 19 (Tiết 37, 38)
    [37, K1_CD3, 'Bài 3: Vận động của chân (Tiết 4)', '', EQ_BASIC],
    [38, K1_CD3, 'Bài 3: Vận động của chân (Tiết 5)', '', EQ_BASIC],
    // Tuần 20 (Tiết 39, 40)
    [39, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 1)', 'GDQPAN & KNS: Rèn tính kỷ luật, tinh thần đồng đội và ý chí vượt qua thử thách trong vận động phối hợp.', EQ_BASIC],
    [40, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 2)', '', EQ_BASIC],
    // Tuần 21 (Tiết 41, 42)
    [41, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 3)', '', EQ_BASIC],
    [42, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 4)', 'Năng lực số (L1–L2): Quan sát hình ảnh/video mẫu tư thế phối hợp cơ thể để bắt chước đúng kỹ thuật.', EQ_VIDEO],
    // Tuần 22 (Tiết 43, 44)
    [43, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 5)', '', EQ_BASIC],
    [44, K1_CD3, 'Bài 4: Vận động phối hợp của cơ thể (Tiết 6)', '', EQ_BASIC],
    // Tuần 23 (Tiết 45, 46)
    [45, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 1)', 'KNS: Rèn sự tự tin, kiên trì và khả năng giữ thăng bằng an toàn khi vận động.', EQ_BASIC],
    [46, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 2)', '', EQ_BASIC],
    // Tuần 24 (Tiết 47, 48)
    [47, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 3)', '', EQ_BASIC],
    [48, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 4)', 'BVMT & KNS: Giữ gìn vệ sinh cá nhân, rửa tay sạch sẽ sau khi vận động trên sân.', EQ_BASIC],
    // Tuần 25 (Tiết 49, 50)
    [49, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 5)', '', EQ_BASIC],
    [50, K1_CD3, 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo) (Tiết 6)', '', EQ_BASIC],
    // Tuần 26 (Tiết 51, 52)
    [51, K1_CD4, 'Bài 1: Làm quen với bóng (Tiết 1)', 'Năng lực số (L1–L2): Xem hình ảnh/clip minh họa cách cầm bóng, giữ bóng rổ an toàn trên thiết bị trình chiếu.', EQ_BASKETBALL_VIDEO],
    [52, K1_CD4, 'Bài 1: Làm quen với bóng (Tiết 2)', '', EQ_BASKETBALL],
    // Tuần 27 (Tiết 53, 54)
    [53, K1_CD4, 'Bài 1: Làm quen với bóng (Tiết 3)', 'Quyền trẻ em & KNS: Luân phiên lượt chơi để mọi bạn đều được làm quen với bóng; không tranh giành.', EQ_BASKETBALL],
    [54, K1_CD4, 'Bài 1: Làm quen với bóng (Tiết 4)', '', EQ_BASKETBALL],
    // Tuần 28 (Tiết 55, 56)
    [55, K1_CD4, 'Bài 2: Động tác di chuyển không bóng (Tiết 1)', 'ATGT & KNS: Rèn kỹ năng quan sát hướng di chuyển, tránh va chạm với bạn trên sân tập.', EQ_BASKETBALL],
    [56, K1_CD4, 'Bài 2: Động tác di chuyển không bóng (Tiết 2)', '', EQ_BASKETBALL],
    // Tuần 29 (Tiết 57, 58)
    [57, K1_CD4, 'Bài 2: Động tác di chuyển không bóng (Tiết 3)', '', EQ_BASKETBALL],
    [58, K1_CD4, 'Bài 2: Động tác di chuyển không bóng (Tiết 4)', '', EQ_BASKETBALL],
    // Tuần 30 (Tiết 59, 60)
    [59, K1_CD4, 'Bài 3: Động tác dẫn bóng (Tiết 1)', 'KNS: Rèn sự khéo léo, kiên nhẫn và kiểm soát cảm xúc khi thực hiện dẫn bóng.', EQ_BASKETBALL],
    [60, K1_CD4, 'Bài 3: Động tác dẫn bóng (Tiết 2)', '', EQ_BASKETBALL],
    // Tuần 31 (Tiết 61, 62)
    [61, K1_CD4, 'Bài 3: Động tác dẫn bóng (Tiết 3)', 'BVMT: Thu gom bóng và dụng cụ học tập gọn gàng, đúng nơi quy định sau tiết học.', EQ_BASKETBALL],
    [62, K1_CD4, 'Bài 3: Động tác dẫn bóng (Tiết 4)', '', EQ_BASKETBALL],
    // Tuần 32 (Tiết 63, 64)
    [63, K1_CD4, 'Bài 3: Động tác dẫn bóng (Tiết 5)', '', EQ_BASKETBALL],
    [64, K1_CD4, 'Bài 4: Động tác ném rổ hai tay trước ngực (tiết 1)', 'Năng lực số (L1–L2): Quan sát video mẫu tư thế ném rổ hai tay trước ngực để nhận biết động tác đúng.', EQ_BASKETBALL_VIDEO],
    // Tuần 33 (Tiết 65, 66)
    [65, K1_CD4, 'Bài 4: Động tác ném rổ hai tay trước ngực (tiết 2)', '', EQ_BASKETBALL],
    [66, K1_CD4, 'Bài 4: Động tác ném rổ hai tay trước ngực (tiết 3)', '', EQ_BASKETBALL],
    // Tuần 34 (Tiết 67, 68)
    [67, K1_CD4, 'Bài 4: Động tác ném rổ hai tay trước ngực (tiết 4)', 'Quyền trẻ em & KNS: Cổ vũ bạn ném bóng, rèn tinh thần đoàn kết và fair-play trong trò chơi.', EQ_BASKETBALL],
    [68, K1_CD4, 'Bài 4: Động tác ném rổ hai tay trước ngực (tiết 5)', '', EQ_BASKETBALL],
    // Tuần 35 (Tiết 69, 70)
    [69, K1_CD4, 'Ôn tập và đánh giá học kì 2', 'KNS & Quyền trẻ em: Tự tin thể hiện kỹ năng, tôn trọng kết quả của bản thân và bạn bè.', EQ_BASKETBALL],
    [70, K1_CD4, 'Tổng kết môn học', 'Năng lực số (L1–L2 – Mã 2.2) & BVMT: Xem lại hình ảnh hoạt động nổi bật trong năm; nhắc nhở giữ vệ sinh trường lớp.', EQ_VIDEO]
  ],
  EQ_BASIC
);

// ============================================================================
// 2. KHỐI LỚP 3 — KẾ HOẠCH DẠY HỌC MÔN GDTC KHỐI LỚP 3 (NĂM HỌC 2026 – 2027 · 70 TIẾT)
// ============================================================================
const K3_CD1 = 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ';
const K3_CD2 = 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC';
const K3_CD3 = 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN';
const K3_CD4 = 'CHỦ ĐỀ 4: THỂ THAO TỰ CHỌN – MÔN BÓNG RỔ';

const EQ_OBSTACLE = 'SGK, Cọc tiêu, chướng ngại vật thấp, vạch kẻ, còi';
const EQ_BALL_PASS = 'SGK, Bóng tập, tranh ảnh, còi, vạch kẻ';

export const defaultGrade3Ppct: PpctItem[] = buildExactPpctList(
  3,
  [
    // Tuần 1 (Tiết 1, 2)
    [1, K3_CD1, 'Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 1)', 'GDQPAN & Năng lực số (L2–L3 – Mã 1.1): Xem hình ảnh/video minh họa vị trí đứng hàng dọc; rèn tính kỷ luật.', EQ_VIDEO],
    [2, K3_CD1, 'Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 2)', '', EQ_BASIC],
    // Tuần 2 (Tiết 3, 4)
    [3, K3_CD1, 'Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 3)', 'KNS: Rèn tinh thần hợp tác, tự giác chấp hành hiệu lệnh khi biến đổi đội hình.', EQ_BASIC],
    [4, K3_CD1, 'Bài 1: Biến đổi ĐH từ một hàng dọc thành 2-3 hàng dọc và ngược lại (tiết 4)', '', EQ_BASIC],
    // Tuần 3 (Tiết 5, 6)
    [5, K3_CD1, 'Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 1)', 'Quyền trẻ em & KNS: Phân công nhiệm vụ rõ ràng trong nhóm; tôn trọng và hỗ trợ bạn gióng hàng chuẩn.', EQ_BASIC],
    [6, K3_CD1, 'Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 2)', '', EQ_BASIC],
    // Tuần 4 (Tiết 7, 8)
    [7, K3_CD1, 'Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 3)', 'BVMT: Kiểm tra vệ sinh sân tập trước giờ học, giữ gìn không gian tập luyện sạch sẽ.', EQ_BASIC],
    [8, K3_CD1, 'Bài 2: Biến đổi ĐH từ một hàng ngang thành 2-3 hàng ngang và ngược lại (tiết 4)', '', EQ_BASIC],
    // Tuần 5 (Tiết 9, 10)
    [9, K3_CD1, 'Bài 3: Biến đổi ĐH từ một vòng tròn thành 2-3 vòng tròn và ngược lại (tiết 1)', 'KNS & Quyền trẻ em: Phối hợp nhịp nhàng theo vòng tròn, tạo cơ hội cho mọi bạn cùng tham gia điều hành.', EQ_BASIC],
    [10, K3_CD1, 'Bài 3: Biến đổi ĐH từ một vòng tròn thành 2-3 vòng tròn và ngược lại (tiết 2)', '', EQ_BASIC],
    // Tuần 6 (Tiết 11, 12)
    [11, K3_CD1, 'Bài 4: Động tác đi đều và đứng lại (tiết 1)', 'GDQPAN & ATGT: Rèn tác phong nghiêm túc, đi đều đúng hàng; liên hệ đi bộ trật tự, an toàn giao thông.', EQ_BASIC],
    [12, K3_CD1, 'Bài 4: Động tác đi đều và đứng lại (tiết 2)', '', EQ_BASIC],
    // Tuần 7 (Tiết 13, 14)
    [13, K3_CD1, 'Bài 4: Động tác đi đều và đứng lại (tiết 3)', 'Năng lực số (L2–L3 – Mã 4.3): Nhắc quy tắc an toàn mắt và tư thế khi xem video hướng dẫn kỹ thuật.', EQ_VIDEO],
    [14, K3_CD1, 'Bài 4: Động tác đi đều và đứng lại (tiết 4)', '', EQ_BASIC],
    // Tuần 8 (Tiết 15, 16)
    [15, K3_CD1, 'Ôn tập Chủ đề 1: Đội hình đội ngũ (tiết 1)', 'GDQPAN & KNS: Lồng ghép kỹ năng phòng tránh đuối nước; rèn ý thức kỷ luật khi ôn tập.', EQ_BASIC],
    [16, K3_CD1, 'Ôn tập Chủ đề 1: Đội hình đội ngũ (tiết 2)', 'Quyền trẻ em: Đảm bảo quyền được bảo vệ an toàn; thực hành nhận biết nguy cơ mất an toàn dưới nước.', EQ_BASIC],
    // Tuần 9 (Tiết 17, 18)
    [17, K3_CD2, 'Bài 1: Động tác vươn thở, động tác tay (tiết 1)', 'Năng lực số (L2–L3 – Mã 5.3): Sử dụng nhạc nền/nhịp đếm số từ thiết bị điện tử để điều hòa nhịp thở và động tác.', EQ_AUDIO],
    [18, K3_CD2, 'Bài 1: Động tác vươn thở, động tác tay (tiết 2)', '', EQ_BASIC],
    // Tuần 10 (Tiết 19, 20)
    [19, K3_CD2, 'Bài 2: Động tác chân, động tác lườn, động tác bụng (tiết 1)', 'BVMT & KNS: Giáo dục thói quen giữ vệ sinh cá nhân, lau mồ hôi, uống nước hợp lý sau vận động.', EQ_BASIC],
    [20, K3_CD2, 'Bài 2: Động tác chân, động tác lườn, động tác bụng (tiết 2)', '', EQ_BASIC],
    // Tuần 11 (Tiết 21, 22)
    [21, K3_CD2, 'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (tiết 1)', 'Quyền trẻ em & KNS: Động viên, hỗ trợ bạn thực hiện động tác nhảy và phối hợp; không chê bai bạn.', EQ_BASIC],
    [22, K3_CD2, 'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (tiết 2)', '', EQ_BASIC],
    // Tuần 12 (Tiết 23, 24)
    [23, K3_CD2, 'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hòa (tiết 3)', '', EQ_BASIC],
    [24, K3_CD2, 'Ôn tập bài tập thể dục', '', EQ_BASIC],
    // Tuần 13 (Tiết 25, 26)
    [25, K3_CD3, 'Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (tiết 1)', 'GDQPAN & ATGT: Rèn sự bình tĩnh, quan sát vật cản phía trước; liên hệ tránh chướng ngại vật an toàn.', EQ_OBSTACLE],
    [26, K3_CD3, 'Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (tiết 2)', '', EQ_OBSTACLE],
    // Tuần 14 (Tiết 27, 28)
    [27, K3_CD3, 'Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (tiết 3)', '', EQ_OBSTACLE],
    [28, K3_CD3, 'Bài 1: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng (tiết 4)', '', EQ_OBSTACLE],
    // Tuần 15 (Tiết 29, 30)
    [29, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 1)', 'Năng lực số (L2–L3): Quan sát video phân tích cách hạ trọng tâm khi đổi hướng gấp khúc để giữ thăng bằng.', EQ_VIDEO],
    [30, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 2)', '', EQ_OBSTACLE],
    // Tuần 16 (Tiết 31, 32)
    [31, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 3)', '', EQ_OBSTACLE],
    [32, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 4)', 'KNS & ATGT: Rèn kỹ năng kiểm soát tốc độ và hướng di chuyển an toàn khi qua đường gấp khúc.', EQ_OBSTACLE],
    // Tuần 17 (Tiết 33, 34)
    [33, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 5)', '', EQ_OBSTACLE],
    [34, K3_CD3, 'Bài 2: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc (tiết 6)', '', EQ_OBSTACLE],
    // Tuần 18 (Tiết 35, 36)
    [35, K3_CD3, 'Ôn tập và đánh giá học kì I', 'Quyền trẻ em & KNS: Đánh giá công bằng, trung thực trong kiểm tra; tôn trọng năng lực từng học sinh.', EQ_OBSTACLE],
    [36, K3_CD3, 'Sơ kết học kì I', '', EQ_BASIC],
    // Tuần 19 (Tiết 37, 38)
    [37, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 1)', 'GDQPAN & BVMT: Rèn ý chí vượt khó trên địa hình tự nhiên; giữ gìn cảnh quan, cây xanh sân trường.', EQ_OBSTACLE],
    [38, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 2)', '', EQ_OBSTACLE],
    // Tuần 20 (Tiết 39, 40)
    [39, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 3)', '', EQ_OBSTACLE],
    [40, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 4)', 'KNS & Quyền trẻ em: Hợp tác, hỗ trợ đồng đội vượt chướng ngại vật an toàn.', EQ_OBSTACLE],
    // Tuần 21 (Tiết 41, 42)
    [41, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 5)', '', EQ_OBSTACLE],
    [42, K3_CD3, 'Bài 3: Bài tập phối hợp di chuyển vượt qua chướng ngại vật trên địa hình (tiết 6)', '', EQ_OBSTACLE],
    // Tuần 22 (Tiết 43, 44)
    [43, K3_CD3, 'Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 1)', 'Năng lực số (L2–L3): Xem clip mẫu kỹ thuật tung – bắt bóng tại chỗ bằng hai tay để nhận diện điểm tiếp xúc bóng.', EQ_VIDEO],
    [44, K3_CD3, 'Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 2)', '', EQ_BALL_PASS],
    // Tuần 23 (Tiết 45, 46)
    [45, K3_CD3, 'Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 3)', 'KNS: Rèn sự tập trung, phối hợp mắt – tay và tinh thần trách nhiệm với bạn cùng cặp.', EQ_BALL_PASS],
    [46, K3_CD3, 'Bài 4: Bài tập tại chỗ tung - bắt bóng bằng hai tay (tiết 4)', '', EQ_BALL_PASS],
    // Tuần 24 (Tiết 47, 48)
    [47, K3_CD3, 'Bài 5: Bài tập di chuyển tung - bắt bóng bằng hai tay (tiết 1)', 'BVMT & KNS: Giữ vệ sinh sân bãi và dụng cụ tập luyện; rèn sự khéo léo khi phối hợp di chuyển.', EQ_BALL_PASS],
    [48, K3_CD3, 'Bài 5: Bài tập di chuyển tung - bắt bóng bằng hai tay (tiết 2)', '', EQ_BALL_PASS],
    // Tuần 25 (Tiết 49, 50)
    [49, K3_CD3, 'Bài 5: Bài tập di chuyển tung - bắt bóng bằng hai tay (tiết 3)', '', EQ_BALL_PASS],
    [50, K3_CD3, 'Bài 5: Bài tập di chuyển tung - bắt bóng bằng hai tay (tiết 4)', '', EQ_BALL_PASS],
    // Tuần 26 (Tiết 51, 52)
    [51, K3_CD4, 'Bài 1: Bài tập bổ trợ với bóng (tiết 1)', 'Năng lực số (L2–L3 – Mã 1.1) & BVMT: Xem video bài tập bổ trợ bóng rổ; giữ vệ sinh sân bãi, dụng cụ.', EQ_BASKETBALL_VIDEO],
    [52, K3_CD4, 'Bài 1: Bài tập bổ trợ với bóng (tiết 2)', '', EQ_BASKETBALL],
    // Tuần 27 (Tiết 53, 54)
    [53, K3_CD4, 'Bài 1: Bài tập bổ trợ với bóng (tiết 3)', '', EQ_BASKETBALL],
    [54, K3_CD4, 'Bài 1: Bài tập bổ trợ với bóng (tiết 4)', '', EQ_BASKETBALL],
    // Tuần 28 (Tiết 55, 56)
    [55, K3_CD4, 'Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 1)', 'KNS: Rèn sự khéo léo, kiên trì khi dẫn bóng thẳng và đổi hướng.', EQ_BASKETBALL],
    [56, K3_CD4, 'Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 2)', '', EQ_BASKETBALL],
    // Tuần 29 (Tiết 57, 58)
    [57, K3_CD4, 'Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 3)', 'Quyền trẻ em & KNS: Luân phiên lượt tập công bằng giữa các thành viên trong tổ.', EQ_BASKETBALL],
    [58, K3_CD4, 'Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng (tiết 4)', '', EQ_BASKETBALL],
    // Tuần 30 (Tiết 59, 60)
    [59, K3_CD4, 'Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 1)', 'Năng lực số (L2–L3): Quan sát hình ảnh/video phân tích động tác chuyền bóng hai tay trước ngực.', EQ_BASKETBALL_VIDEO],
    [60, K3_CD4, 'Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 2)', '', EQ_BASKETBALL],
    // Tuần 31 (Tiết 61, 62)
    [61, K3_CD4, 'Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 3)', '', EQ_BASKETBALL],
    [62, K3_CD4, 'Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 4)', 'KNS: Rèn kỹ năng giao tiếp, ra tín hiệu và phối hợp đồng đội khi chuyền – bắt bóng.', EQ_BASKETBALL],
    // Tuần 32 (Tiết 63, 64)
    [63, K3_CD4, 'Bài 3: Động tác chuyền bóng hai tay trước ngực (tiết 5)', '', EQ_BASKETBALL],
    [64, K3_CD4, 'Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 1)', 'GDQPAN & KNS: Rèn sự quyết đoán, bình tĩnh và phối hợp nhịp nhàng giữa dẫn bóng và ném rổ.', EQ_BASKETBALL],
    // Tuần 33 (Tiết 65, 66)
    [65, K3_CD4, 'Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 2)', '', EQ_BASKETBALL],
    [66, K3_CD4, 'Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 3)', '', EQ_BASKETBALL],
    // Tuần 34 (Tiết 67, 68)
    [67, K3_CD4, 'Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 4)', 'Quyền trẻ em & BVMT: Tôn trọng luật chơi, cổ vũ bạn; thu dọn bóng gọn gàng sau tiết học.', EQ_BASKETBALL],
    [68, K3_CD4, 'Bài 4: Bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực (tiết 5)', '', EQ_BASKETBALL],
    // Tuần 35 (Tiết 69, 70)
    [69, K3_CD4, 'Ôn tập và đánh giá học kì 2: Ôn bài tập phối hợp dẫn bóng - ném rổ bằng hai tay trước ngực', 'KNS & Quyền trẻ em: Tự tin thể hiện kỹ thuật, đánh giá khách quan kết quả học tập.', EQ_BASKETBALL],
    [70, K3_CD4, 'Tổng kết năm học', 'Năng lực số (L2–L3) & KNS: Tự nhận xét sự tiến bộ và lập kế hoạch rèn luyện thể thao an toàn dịp hè.', EQ_BASIC]
  ],
  EQ_BASIC
);

// ============================================================================
// 3. KHỐI LỚP 5 — KẾ HOẠCH DẠY HỌC MÔN GDTC 5 (NĂM HỌC 2026 – 2027 · 70 TIẾT)
// ============================================================================
const K5_CD1 = 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ';
const K5_CD2 = 'CHỦ ĐỀ 2: BÀI THỂ DỤC PHÁT TRIỂN CHUNG';
const K5_CD3 = 'CHỦ ĐỀ 3: TƯ THẾ VÀ KỸ NĂNG VẬN ĐỘNG CƠ BẢN';
const K5_CD4 = 'CHỦ ĐỀ: MÔN THỂ THAO TỰ CHỌN: BÓNG RỔ';

const EQ_STICK = 'SGK, Gậy thể dục, tranh ảnh, còi, dụng cụ TL';
const EQ_STICK_AUDIO = 'SGK, Gậy thể dục, thiết bị đếm nhịp số, tranh ảnh, còi';
const EQ_MAT = 'SGK, Nệm/thảm tập an toàn, tranh ảnh, còi';
const EQ_MAT_VIDEO = 'SGK, Video kỹ thuật slow-motion, nệm/thảm tập an toàn, còi';
const EQ_CLIMB = 'SGK, Dụng cụ rèn luyện leo/trèo an toàn, thảm đệm, còi';

export const defaultGrade5Ppct: PpctItem[] = buildExactPpctList(
  5,
  [
    // Tuần 1 (Tiết 1, 2)
    [1, K5_CD1, 'Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 1)', 'GDQPAN & Năng lực số (L4–L5 – Mã 1.1): HS tự tìm kiếm/xem video kỹ thuật phối hợp đội hình; rèn tác phong chỉ huy.', EQ_VIDEO],
    [2, K5_CD1, 'Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 2)', '', EQ_BASIC],
    // Tuần 2 (Tiết 3, 4)
    [3, K5_CD1, 'Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 3)', 'KNS & Quyền trẻ em: Phát huy vai trò tự quản của nhóm trưởng; tôn trọng ý kiến đóng góp của các bạn trong tổ.', EQ_BASIC],
    [4, K5_CD1, 'Bài 1: Bài tập phối hợp đội hình đội ngũ (Tiết 4)', '', EQ_BASIC],
    // Tuần 3 (Tiết 5, 6)
    [5, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 1)', 'GDQPAN & KNS: Rèn tính kỷ luật, sự thống nhất và phối hợp đồng bộ khi biến đổi đội hình.', EQ_BASIC],
    [6, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 2)', '', EQ_BASIC],
    // Tuần 4 (Tiết 7, 8)
    [7, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 3)', '', EQ_BASIC],
    [8, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 4)', 'BVMT: Kiểm tra vệ sinh sân tập, nhắc nhở ý thức giữ gìn môi trường xanh – sạch – đẹp.', EQ_BASIC],
    // Tuần 5 (Tiết 9, 10)
    [9, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 5)', '', EQ_BASIC],
    [10, K5_CD1, 'Bài 2: Bài tập phối hợp biến đổi đội hình (Tiết 6)', '', EQ_BASIC],
    // Tuần 6 (Tiết 11, 12)
    [11, K5_CD1, 'Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 1)', 'Năng lực số (L4–L5 – Mã 6.1) & ATGT: Dùng video/ứng dụng phân tích tư thế nhận diện lỗi đi đều; liên hệ đi đúng phần đường.', EQ_VIDEO],
    [12, K5_CD1, 'Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 2)', '', EQ_BASIC],
    // Tuần 7 (Tiết 13, 14)
    [13, K5_CD1, 'Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 3)', 'GDQPAN & KNS: Rèn tác phong nghiêm trang, giữ cự li và tốc độ đều khi đi đều vòng các hướng.', EQ_BASIC],
    [14, K5_CD1, 'Bài 3: Bài tập phối hợp đi đều vòng các hướng (Tiết 4)', '', EQ_BASIC],
    // Tuần 8 (Tiết 15, 16)
    [15, K5_CD2, 'Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy (Tiết 1)', 'GDQPAN, KNS & BVMT: Rèn sự khéo léo, kỷ luật khi sử dụng gậy; kiểm tra độ an toàn dụng cụ trước khi tập.', EQ_STICK],
    [16, K5_CD2, 'Bài 1: Động tác vươn thở, động tác tay, động tác chân với gậy (Tiết 2)', '', EQ_STICK],
    // Tuần 9 (Tiết 17, 18)
    [17, K5_CD2, 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 1)', 'Năng lực số (L4–L5 – Mã 5.3): Sử dụng ứng dụng đếm nhịp số để chủ động điều chỉnh nhịp tập bài thể dục với gậy.', EQ_STICK_AUDIO],
    [18, K5_CD2, 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 2)', '', EQ_STICK],
    // Tuần 10 (Tiết 19, 20)
    [19, K5_CD2, 'Bài 2: Động tác bụng, động tác vặn mình, động tác toàn thân với gậy (tiết 3)', '', EQ_STICK],
    [20, K5_CD2, 'Bài 3: Động tác nhảy và động tác điều hòa với gậy (tiết 1)', 'Quyền trẻ em & KNS: Hỗ trợ bạn thực hiện động tác khó một cách tôn trọng; đảm bảo khoảng cách an toàn khi cầm gậy.', EQ_STICK],
    // Tuần 11 (Tiết 21, 22)
    [21, K5_CD2, 'Bài 3: Động tác nhảy và động tác điều hòa với gậy (tiết 2)', '', EQ_STICK],
    [22, K5_CD2, 'Hoàn thiện bài thể dục phát triển chung với gậy (Tiết 1)', 'KNS & BVMT: Tự giác luyện tập nhóm; thu dọn và bảo quản gậy tập gọn gàng, đúng quy định.', EQ_STICK],
    // Tuần 12 (Tiết 23, 24)
    [23, K5_CD2, 'Hoàn thiện bài thể dục phát triển chung với gậy (Tiết 2)', '', EQ_STICK],
    [24, K5_CD2, 'Ôn bài thể dục phát triển chung với gậy', '', EQ_STICK],
    // Tuần 13 (Tiết 25, 26)
    [25, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 1)', '', EQ_MAT],
    [26, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 2)', '', EQ_MAT],
    // Tuần 14 (Tiết 27, 28)
    [27, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 3)', '', EQ_MAT],
    [28, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 4)', 'Năng lực số (L4–L5): Xem video chậm (slow-motion) phân tích kỹ thuật lăn để phòng tránh chấn thương cột sống.', EQ_MAT_VIDEO],
    // Tuần 15 (Tiết 29, 30)
    [29, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 5)', '', EQ_MAT],
    [30, K5_CD3, 'Bài 1: Bài tập rèn luyện kĩ năng lăn (Tiết 6)', '', EQ_MAT],
    // Tuần 16 (Tiết 31, 32)
    [31, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 1)', 'KNS & Quyền trẻ em: Tuân thủ nguyên tắc an toàn, hỗ trợ bảo hiểm cho bạn khi tập lộn xuôi; không đùa nghịch.', EQ_MAT],
    [32, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 2)', '', EQ_MAT],
    // Tuần 17 (Tiết 33, 34)
    [33, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 3)', '', EQ_MAT],
    [34, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 4)', '', EQ_MAT],
    // Tuần 18 (Tiết 35, 36)
    [35, K5_CD3, 'Ôn tập học kì I', 'KNS: Rèn tính tự giác, trung thực và kỹ năng tự điều chỉnh động tác trước kiểm tra.', EQ_MAT],
    [36, K5_CD3, 'Kiểm tra cuối học kỳ I', 'Quyền trẻ em: Đánh giá công bằng, tôn trọng sự khác biệt về thể lực và tốc độ tiến bộ của từng HS.', EQ_MAT],
    // Tuần 19 (Tiết 37, 38)
    [37, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 5)', '', EQ_MAT],
    [38, K5_CD3, 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi (Tiết 6)', '', EQ_MAT],
    // Tuần 20 (Tiết 39, 40)
    [39, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 1)', 'GDQPAN & KNS: Rèn sức mạnh, sự bền bỉ và ý chí vượt khó trong bài tập rèn luyện kỹ năng leo.', EQ_CLIMB],
    [40, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 2)', '', EQ_CLIMB],
    // Tuần 21 (Tiết 41, 42)
    [41, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 3)', '', EQ_CLIMB],
    [42, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 4)', 'Năng lực số (L4–L5) & BVMT: Quan sát clip hướng dẫn điểm tựa an toàn khi leo; giữ vệ sinh khu vực tập luyện.', EQ_VIDEO],
    // Tuần 22 (Tiết 43, 44)
    [43, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 5)', '', EQ_CLIMB],
    [44, K5_CD3, 'Bài 3: Bài tập rèn luyện kĩ năng leo (Tiết 6)', '', EQ_CLIMB],
    // Tuần 23 (Tiết 45, 46)
    [45, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 1)', 'GDQPAN & KNS: Rèn sự bình tĩnh, khéo léo và tinh thần hỗ trợ đồng đội khi thực hiện kỹ năng trèo.', EQ_CLIMB],
    [46, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 2)', '', EQ_CLIMB],
    // Tuần 24 (Tiết 47, 48)
    [47, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 3)', '', EQ_CLIMB],
    [48, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 4)', 'Quyền trẻ em & KNS: Đảm bảo an toàn tuyệt đối cho bản thân và bạn bè; tuân thủ nghiêm quy định sân bãi.', EQ_CLIMB],
    // Tuần 25 (Tiết 49, 50)
    [49, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 5)', '', EQ_CLIMB],
    [50, K5_CD3, 'Bài 4: Bài tập rèn luyện kỹ năng trèo (Tiết 6)', '', EQ_CLIMB],
    // Tuần 26 (Tiết 51, 52)
    [51, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 1)', '', EQ_BASKETBALL],
    [52, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 2)', '', EQ_BASKETBALL],
    // Tuần 27 (Tiết 53, 54)
    [53, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 3)', '', EQ_BASKETBALL],
    [54, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 4)', 'ATGT & KNS: Rèn khả năng quan sát rộng, làm chủ tốc độ và chuyển hướng linh hoạt, tránh va chạm.', EQ_BASKETBALL],
    // Tuần 28 (Tiết 55, 56)
    [55, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 5)', '', EQ_BASKETBALL],
    [56, K5_CD4, 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng (tiết 6)', '', EQ_BASKETBALL],
    // Tuần 29 (Tiết 57, 58)
    [57, K5_CD4, 'Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 1)', 'Năng lực số (L4–L5 – Mã 6.1): Quay video ngắn hoặc dùng ứng dụng AI đơn giản tự soi tư thế chuyền, bắt bóng trên cao.', EQ_BASKETBALL_VIDEO],
    [58, K5_CD4, 'Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 2)', '', EQ_BASKETBALL],
    // Tuần 30 (Tiết 59, 60)
    [59, K5_CD4, 'Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 3)', 'KNS & Quyền trẻ em: Rèn kỹ năng phối hợp đồng đội, tin tưởng và chia sẻ cơ hội bóng công bằng cho mọi bạn.', EQ_BASKETBALL],
    [60, K5_CD4, 'Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao (Tiết 4)', '', EQ_BASKETBALL],
    // Tuần 31 (Tiết 61, 62)
    [61, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 1)', 'Năng lực số (L4–L5 – Mã 1.1): Xem video phân tích nhịp bước chân (2 bước) và động tác ném rổ một tay trên vai.', EQ_BASKETBALL_VIDEO],
    [62, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 2)', '', EQ_BASKETBALL],
    // Tuần 32 (Tiết 63, 64)
    [63, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 3)', '', EQ_BASKETBALL],
    [64, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 4)', 'GDQPAN & KNS: Rèn sự quyết đoán, tập trung cao độ và bản lĩnh thi đấu trong thực hành ném rổ.', EQ_BASKETBALL],
    // Tuần 33 (Tiết 65, 66)
    [65, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 5)', '', EQ_BASKETBALL],
    [66, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 6)', '', EQ_BASKETBALL],
    // Tuần 34 (Tiết 67, 68)
    [67, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 7)', 'Quyền trẻ em, KNS & BVMT: Tôn trọng luật chơi và đối thủ, giải quyết bất đồng ôn hòa; thu gom dụng cụ sạch sẽ.', EQ_BASKETBALL],
    [68, K5_CD4, 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai (Tiết 8)', '', EQ_BASKETBALL],
    // Tuần 35 (Tiết 69, 70)
    [69, K5_CD4, 'Ôn tập và đánh giá học kì II', 'KNS & Quyền trẻ em: Tự tin thể hiện năng lực, đánh giá khách quan kết quả rèn luyện cuối năm.', EQ_BASKETBALL],
    [70, K5_CD4, 'Kiểm tra cuối năm. Tổng kết môn học', 'Năng lực số (L4–L5) & KNS: Lập kế hoạch rèn luyện TDTT vừa sức trong dịp hè và chia sẻ kinh nghiệm cùng bạn bè.', EQ_BASIC]
  ],
  EQ_BASIC
);

// ============================================================================
// Helper for Grades 2 & 4 (kept intact from GDPT 2018 Kết nối tri thức)
// ============================================================================
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
    `Bài 2: Động tác chân, động tác lườn, động tác bụng (tiết ${sub})`
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
  )
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
  ...createPpctRange(
    4,
    7,
    9,
    'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    (p, w, sub) => `Bài 1: Động tác vươn thở, động tác tay, động tác chân với vòng (tiết ${sub})`,
    undefined,
    'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  ),
  ...createPpctRange(
    4,
    10,
    12,
    'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    (p, w, sub) => `Bài 2: Động tác lườn, động tác lưng – bụng, động tác toàn thân với vòng (tiết ${sub})`,
    undefined,
    'SGK, Vòng thể dục, tranh ảnh, còi, dụng cụ TL'
  ),
  ...createPpctRange(
    4,
    13,
    14,
    'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    (p, w, sub) => `Bài 3: Động tác nhảy, động tác điều hoà với vòng (tiết ${sub})`,
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
  ...createPpctRange(
    4,
    24,
    26,
    'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    (p, w, sub) => `Bài 4: Nhảy dây (tiết ${sub})`,
    undefined,
    'SGK, Dây nhảy cá nhân, vạch kẻ, còi, dụng cụ TL'
  ),
  ...createPpctRange(
    4,
    27,
    30,
    'THỂ THAO TỰ CHỌN: BÓNG RỔ / MÔN BƠI',
    (p, w, sub) =>
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
  )
];

// Combined full dataset (All 5 Elementary Grades: 1, 2, 3, 4, 5)
export const defaultAllPpctData: PpctItem[] = [
  ...defaultGrade1Ppct,
  ...defaultGrade2Ppct,
  ...defaultGrade3Ppct,
  ...defaultGrade4Ppct,
  ...defaultGrade5Ppct
];

// LocalStorage & Schema Version Helpers
const STORAGE_KEY_PPCT = 'gdtc_official_ppct_data';
const STORAGE_KEY_PPCT_VERSION = 'gdtc_official_ppct_schema_version';
export const CURRENT_PPCT_SCHEMA_VERSION = 'nghia_hiep_2026_2027_k135_v1';

export function getStoredPpctData(): PpctItem[] {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEY_PPCT_VERSION);
    const raw = localStorage.getItem(STORAGE_KEY_PPCT);

    // Auto-migrate to official 2026-2027 Nghĩa Hiệp integrated plan for Grades 1, 3, 5
    if (storedVersion !== CURRENT_PPCT_SCHEMA_VERSION) {
      let upgraded: PpctItem[] = [...defaultAllPpctData];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Preserve any Grade 2 & Grade 4 entries while replacing Grades 1, 3, 5 with official 2026-2027 plan
            const existingG2 = parsed.filter((item: PpctItem) => Number(item.grade) === 2);
            const existingG4 = parsed.filter((item: PpctItem) => Number(item.grade) === 4);
            upgraded = [
              ...defaultGrade1Ppct,
              ...(existingG2.length === 70 ? existingG2 : defaultGrade2Ppct),
              ...defaultGrade3Ppct,
              ...(existingG4.length === 70 ? existingG4 : defaultGrade4Ppct),
              ...defaultGrade5Ppct
            ];
          }
        } catch {
          upgraded = [...defaultAllPpctData];
        }
      }

      // Clear stale cached weekly schedules & themes generated from the pre-PDF curriculum
      try {
        for (let w = 1; w <= 35; w++) {
          localStorage.removeItem(`gdtc_schedule_w${w}`);
          localStorage.removeItem(`gdtc_themes_w${w}`);
        }
      } catch {
        // ignore storage restrictions
      }

      saveStoredPpctData(upgraded);
      return upgraded;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let needsSave = false;
        let sanitized: PpctItem[] = parsed;

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
    localStorage.setItem(STORAGE_KEY_PPCT_VERSION, CURRENT_PPCT_SCHEMA_VERSION);
  } catch {
    try {
      localStorage.removeItem('gdtc_user_custom_images');
      localStorage.removeItem('gdtc_inline_images_registry');
      localStorage.setItem(STORAGE_KEY_PPCT, payload);
      localStorage.setItem(STORAGE_KEY_PPCT_VERSION, CURRENT_PPCT_SCHEMA_VERSION);
    } catch {
      // ignore storage quota limits
    }
  }
}

/**
 * Exact lookup for a single (grade, period) item from the active PPCT (1..70).
 */
export function getPpctPeriodItem(
  grade: GradeLevel,
  period: number,
  customList?: PpctItem[]
): PpctItem | undefined {
  const source = customList && customList.length > 0 ? customList : getStoredPpctData();
  const safePeriod = Math.min(70, Math.max(1, Math.round(period || 1)));
  return (
    source.find((item) => Number(item.grade) === Number(grade) && Number(item.period) === safePeriod) ||
    defaultAllPpctData.find((item) => Number(item.grade) === Number(grade) && Number(item.period) === safePeriod)
  );
}

/**
 * Exact lookup for both periods of a given (grade, week) pair.
 */
export function getPpctWeekItems(
  grade: GradeLevel,
  week: number,
  customList?: PpctItem[]
): PpctItem[] {
  const safeWeek = Math.min(35, Math.max(1, Math.round(week || 1)));
  const p1 = (safeWeek - 1) * 2 + 1;
  const p2 = (safeWeek - 1) * 2 + 2;
  return [
    getPpctPeriodItem(grade, p1, customList),
    getPpctPeriodItem(grade, p2, customList)
  ].filter((item): item is PpctItem => Boolean(item));
}
