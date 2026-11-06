import { ExtractedLessonData, ScenarioItem, SgkImageItem, SchoolSettings } from '../types/gdtc';
import { standardFormationDiagrams } from './formationDiagrams';
import { standardMovementsLibrary } from './movementLibrary';

export const defaultSchoolSettings: SchoolSettings = {
  schoolName: 'TRƯỜNG TIỂU HỌC NGHĨA HIỆP',
  departmentName: 'TỔ CHUYÊN MÔN: TIỂU HỌC',
  teacherName: 'LÊ QUỐC HƯNG',
  schoolYear: '2026 - 2027',
  approverPrincipal: 'Võ Thị Thuận',
  approverHead: 'Bùi Ngọc Lâm'
};

// SVG helper to generate crisp visual educational illustrations for GDTC textbook exercises
export function generateSvgExerciseImage(title: string, subtitle: string, bgColor: string, figureType: 'stretch' | 'arm' | 'team' | 'game' | 'jump'): string {
  let figureSvg = '';

  if (figureType === 'stretch') {
    figureSvg = `
      <!-- Student Stretching -->
      <circle cx="160" cy="70" r="18" fill="#1e293b"/>
      <path d="M160 88 L160 160" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
      <!-- Arms raised up-outward -->
      <path d="M160 105 L120 45" stroke="#2563eb" stroke-width="10" stroke-linecap="round"/>
      <path d="M160 105 L200 45" stroke="#2563eb" stroke-width="10" stroke-linecap="round"/>
      <circle cx="120" cy="45" r="7" fill="#2563eb"/>
      <circle cx="200" cy="45" r="7" fill="#2563eb"/>
      <!-- Legs spread -->
      <path d="M160 160 L125 240" stroke="#1e293b" stroke-width="11" stroke-linecap="round"/>
      <path d="M160 160 L195 240" stroke="#1e293b" stroke-width="11" stroke-linecap="round"/>
      <!-- Inhale airflow indication -->
      <path d="M140 100 Q160 75 180 100" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="4,4" fill="none"/>
    `;
  } else if (figureType === 'arm') {
    figureSvg = `
      <!-- Student Arms sideways -->
      <circle cx="160" cy="70" r="18" fill="#1e293b"/>
      <path d="M160 88 L160 160" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
      <!-- Arms outstretched straight sideways -->
      <path d="M160 105 L70 105" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
      <path d="M160 105 L250 105" stroke="#10b981" stroke-width="10" stroke-linecap="round"/>
      <circle cx="70" cy="105" r="7" fill="#10b981"/>
      <circle cx="250" cy="105" r="7" fill="#10b981"/>
      <!-- Legs standing straight together -->
      <path d="M152 160 L150 240" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
      <path d="M168 160 L170 240" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
    `;
  } else if (figureType === 'team') {
    figureSvg = `
      <!-- Team formation -->
      <rect x="25" y="45" width="270" height="185" rx="14" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6,4"/>
      <!-- Group circles -->
      <circle cx="80" cy="100" r="16" fill="#f59e0b"/>
      <text x="80" y="105" font-size="12" font-weight="bold" fill="white" text-anchor="middle">T1</text>
      <circle cx="240" cy="100" r="16" fill="#f59e0b"/>
      <text x="240" y="105" font-size="12" font-weight="bold" fill="white" text-anchor="middle">T2</text>
      <circle cx="80" cy="180" r="16" fill="#f59e0b"/>
      <text x="80" y="185" font-size="12" font-weight="bold" fill="white" text-anchor="middle">T3</text>
      <circle cx="240" cy="180" r="16" fill="#f59e0b"/>
      <text x="240" y="185" font-size="12" font-weight="bold" fill="white" text-anchor="middle">T4</text>
      <!-- Center teacher -->
      <circle cx="160" cy="140" r="18" fill="#2563eb"/>
      <text x="160" y="145" font-size="12" font-weight="bold" fill="white" text-anchor="middle">GV</text>
      <!-- Direction arrows -->
      <path d="M140 130 L100 110" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
      <path d="M180 130 L220 110" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
      <path d="M140 150 L100 170" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
      <path d="M180 150 L220 170" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,3"/>
    `;
  } else if (figureType === 'game') {
    figureSvg = `
      <!-- Game Relay / Con tho -->
      <circle cx="160" cy="135" r="75" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="5,5"/>
      <circle cx="160" cy="60" r="12" fill="#8b5cf6"/>
      <circle cx="235" cy="135" r="12" fill="#8b5cf6"/>
      <circle cx="160" cy="210" r="12" fill="#8b5cf6"/>
      <circle cx="85" cy="135" r="12" fill="#8b5cf6"/>
      <!-- Rabbit center -->
      <circle cx="160" cy="135" r="16" fill="#ec4899"/>
      <text x="160" y="140" font-size="11" font-weight="bold" fill="white" text-anchor="middle">🐰</text>
      <text x="160" y="170" font-size="11" font-weight="bold" fill="#7c3aed" text-anchor="middle">Vòng chơi an toàn</text>
    `;
  } else {
    figureSvg = `
      <!-- Jump / Leg movement -->
      <circle cx="160" cy="65" r="18" fill="#1e293b"/>
      <path d="M160 83 L160 145" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
      <path d="M160 100 L110 135" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <path d="M160 100 L210 135" stroke="#0284c7" stroke-width="10" stroke-linecap="round"/>
      <!-- Knees bent -->
      <path d="M160 145 L130 185 L125 240" stroke="#1e293b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M160 145 L190 185 L195 240" stroke="#1e293b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="260" viewBox="0 0 320 260">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="16" fill="url(#cardGrad)" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="0" y="0" width="320" height="34" rx="14" fill="${bgColor}"/>
      <text x="14" y="22" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${title}</text>
      ${figureSvg}
      <rect x="12" y="226" width="296" height="24" rx="6" fill="#f1f5f9"/>
      <text x="160" y="242" font-family="sans-serif" font-size="10.5" font-weight="500" fill="#475569" text-anchor="middle">${subtitle}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const initialLessonsData: Record<string, ExtractedLessonData> = {
  k1_t15: {
    id: 'k1_t15',
    grade: 1,
    lessonNum: 15,
    week: 8,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 1)',
    rows: [
      {
        content: "1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối (theo nhạc).\n1.3. Trò chơi bổ trợ: \"Làm theo hiệu lệnh\" tạo hứng thú.",
        lvd: "5 - 7 phút\n2L x 8N",
        gv: "- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.\n- Tổ chức trò chơi bổ trợ tạo không khí vui tươi, hào hứng trước khi vào bài mới; quan sát bao quát và nhắc nhở tinh thần tập trung, trật tự.",
        hs: "- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.\n- Hào hứng tham gia trò chơi khởi động, chấp hành nghiêm túc hiệu lệnh của giáo viên.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và khởi động 4 hàng ngang',
        hsImages: [
          {
            id: 'diag_1_nhan_lop',
            url: standardFormationDiagrams[0].svgDataUrl,
            title: 'Đội hình nhận lớp và khởi động (4 hàng ngang)'
          }
        ]
      },
      {
        content: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác:\n* Học Động tác Vươn thở:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa lên cao chếch chữ V, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ, hít sâu bằng mũi.\n- Nhịp 2: Hai tay đưa xuống bắt chéo trước bụng, cúi nhẹ đầu, thở ra từ từ bằng miệng.\n- Nhịp 3: Như nhịp 1 (hít sâu).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.",
        lvd: "6 - 8 phút\n2 - 3 lần",
        gv: "- GV giới thiệu tên động tác Vươn thở, nêu rõ tác dụng giúp mở rộng lồng ngực, tăng cường dung tích phổi và hình thành phản xạ hô hấp sâu có lợi cho sự phát triển thể chất của học sinh lớp 1.\n- Thị phạm làm mẫu chuẩn xác 2 - 3 lần theo phương pháp chiều gương kết hợp phân tích chậm từng nhịp; nhấn mạnh nhịp hít sâu bằng mũi khi tay vươn lên cao và thở ra từ từ bằng miệng khi hạ tay bắt chéo.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK trang 36, chỉ rõ hướng của hai cánh tay chếch chữ V và góc ngửa của đầu thân người.\n- Hô nhịp chậm hướng dẫn toàn lớp tập thử từng nhịp; quan sát phát hiện các lỗi sai phổ biến (cúi gập đầu quá thấp, tay chùng chưa vươn căng, thở nông) và uốn nắn kịp thời ngay tại chỗ.",
        hs: "- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay để không va chạm.\n- Chăm chú quan sát động tác làm mẫu của GV và hình ảnh kỹ thuật SGK, ghi nhớ khẩu lệnh và thứ tự từng nhịp.\n- Bắt chước thực hiện mô phỏng từng nhịp theo nhịp hô chậm của giáo viên; phối hợp nhịp nhàng giữa nhịp thở và cử động tay chân.\n- Tự giác nhận biết và sửa lỗi sai tư thế theo hướng dẫn của thầy cô.",
        contentImgUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vươn thở (SGK GDTC Lớp 1)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình quan sát tranh mẫu & GV làm mẫu',
        hsImages: [
          {
            id: 'diag_2_quan_sat',
            url: standardFormationDiagrams[2].svgDataUrl,
            title: 'Đội hình quan sát tranh mẫu & GV làm mẫu'
          }
        ]
      },
      {
        content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện động tác Vươn thở theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp nhịp thở sâu.",
        lvd: "3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)",
        gv: "- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở nhắc lại các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và thực hiện dứt khoát, đều đẹp.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.",
        hs: "- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý hít sâu bằng mũi ở nhịp lẻ và thở ra bằng miệng ở nhịp chẵn, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.",
        hsImgUrl: standardFormationDiagrams[3].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện đồng loạt 4 hàng ngang giãn cách',
        hsImages: [
          {
            id: 'diag_3_dong_loat',
            url: standardFormationDiagrams[3].svgDataUrl,
            title: 'Đội hình tập đồng loạt (4 hàng ngang giãn cách)'
          }
        ]
      },
      {
        content: "3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện động tác Vươn thở (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.",
        lvd: "4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)",
        gv: "- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ vươn tay và độ mở chân cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.",
        hs: "- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập theo tổ / nhóm (4 góc sân)',
        hsImages: [
          {
            id: 'diag_4_to_nhom',
            url: standardFormationDiagrams[4].svgDataUrl,
            title: 'Đội hình tập theo tổ / nhóm (4 góc sân bãi)'
          }
        ]
      },
      {
        content: "3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện động tác kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.",
        lvd: "3 - 4 phút\n1 - 2 lần\nđổi vai",
        gv: "- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ tay bạn có vươn thẳng chữ V hay không, đầu có ngửa đúng góc và nhịp thở có đều không; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.",
        hs: "- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.",
        hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
        hsImgTitle: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai',
        hsImages: [
          {
            id: 'diag_5_cap_doi',
            url: standardFormationDiagrams[5].svgDataUrl,
            title: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai'
          }
        ]
      },
      {
        content: "3.4. Thi đua trình diễn giữa các tổ & Trò chơi vận động:\n* Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện động tác trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.\n* Trò chơi vận động: \"Trao gậy tiếp sức\" (hoặc \"Con thỏ\"):\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đồng đội.\n- Dụng cụ: 4 gậy tiếp sức, 4 cọc mốc cự ly 10m.\n- Luật chơi: Xuất phát đúng hiệu lệnh, chạy vòng qua cọc mốc quay về trao gậy cho bạn tiếp theo; đội nào về đích sớm nhất và ít lỗi phạm quy sẽ đạt giải Nhất.",
        lvd: "5 - 7 phút\n2 - 3 lượt",
        gv: "- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- Phổ biến ngắn gọn tên trò chơi vận động, mục đích rèn luyện tố chất nhanh nhẹn, luật chơi và các lỗi phạm quy (chạy trước lệnh, làm rơi gậy, không vòng qua cọc).\n- Cho 1 nhóm làm mẫu thao tác trao nhận gậy; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.",
        hs: "- Đội hình thi đua & trò chơi: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Khi vào trò chơi: 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn chạy vòng qua cọc và trao gậy an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi tiếp sức 4 làn cọc mốc 10m',
        hsImages: [
          {
            id: 'diag_6_tro_choi',
            url: standardFormationDiagrams[8].svgDataUrl,
            title: 'Sơ đồ trò chơi tiếp sức 4 làn cọc mốc 10m'
          }
        ]
      },
      {
        content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng cơ toàn thân, rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi.\n4.2. Vận dụng:\n- Nêu câu hỏi vận dụng bài tập vào thực tế: \"Em nên tập bài thể dục này vào thời điểm nào trong ngày để nâng cao sức khỏe?\"\n- Tích hợp bảo vệ môi trường: Kiểm tra vệ sinh sân tập, nhặt vật nguy hiểm, thu dọn dụng cụ đúng nơi quy định.\n4.3. Nhận xét & Dặn dò về nhà:\n- Đánh giá thái độ học tập; giao nhiệm vụ tự tập ở nhà.",
        lvd: "3 - 5 phút\n1 - 2 lần",
        gv: "- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ tay, rung thả lỏng cơ đùi, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n- Đặt câu hỏi tương tác thực tế giúp học sinh khắc sâu kiến thức; liên hệ thói quen tập thể dục buổi sáng cùng gia đình để tăng cường sức đề kháng.\n- Giáo dục ý thức bảo vệ môi trường: nhắc nhở các em quan sát xung quanh sân tập, cùng nhau nhặt rác, cất gậy và cọc tiêu vào phòng dụng cụ gọn gàng, an toàn.\n- Nhận xét ưu điểm, tinh thần tích cực của tiết học; dặn dò các em tự giác ôn tập ở nhà và chuẩn bị trang phục cho tiết tiếp theo; phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n- Tích cực xung phong trả lời câu hỏi vận dụng kiến thức vào thực tế cuộc sống.\n- Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ.\n- Lắng nghe dặn dò của thầy cô, chào giáo viên và xếp hàng trật tự đi về lớp học.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và thả lỏng toàn thân',
        hsImages: [
          {
            id: 'diag_7_hoi_tinh',
            url: standardFormationDiagrams[15].svgDataUrl,
            title: 'Đội hình hồi tĩnh và thả lỏng toàn thân'
          }
        ]
      }
    ]
  },
  k1_t16: {
    id: 'k1_t16',
    grade: 1,
    lessonNum: 16,
    week: 8,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 2)',
    rows: [
      {
        content: "1. Hoạt động mở đầu\n- Nhận lớp, kiểm tra dụng cụ\n- Khởi động chung & Chuyên môn",
        lvd: "5 - 7'",
        gv: "- GV ổn định tổ chức, phổ biến mục tiêu tiết 2: Ôn động tác Vươn thở, học mới động tác Tay.\n- Cho lớp chạy nhẹ nhàng 1 vòng quanh sân, sau đó xoay kỹ các khớp.",
        hs: "- Cán sự tập hợp báo cáo.\n- HS chạy nhẹ nhàng và khởi động đồng loạt theo cán sự."
      },
      {
        content: "2. Hình thành kiến thức mới\n- Ôn động tác Vươn thở\n- Học mới: Động tác Tay",
        lvd: "6 - 8'",
        gv: "- Cho cả lớp ôn lại động tác vươn thở 1-2 lần.\n- GV thị phạm động tác tay (tay dang ngang bàn tay ngửa, tay vỗ phía trước ngực).\n- Hướng dẫn kết hợp nhịp hô dứt khoát.",
        hs: "- Ôn vươn thở chuẩn xác.\n- Quan sát kĩ thuật động tác tay và thực hiện bắt chước."
      },
      {
        content: "3. Hoạt động luyện tập\n- Tập luyện phối hợp 2 động tác liên hoàn",
        lvd: "14 - 15'",
        gv: "- Điều hành lớp tập liên hoàn Vươn thở + Tay.\n- Quan sát sửa động tác tay không trùng gối, thân người thẳng.",
        hs: "- Tập theo tổ, tự đếm nhịp và sửa sai cho nhau."
      },
      {
        content: "3.5 Trò chơi vận động: Nhảy lò cò tiếp sức",
        lvd: "4 - 5'",
        gv: "- Chuẩn bị vạch xuất phát và đích, phổ biến luật chơi an toàn.",
        hs: "- Chia 4 hàng dọc thi đấu tiếp sức hào hứng, an toàn."
      },
      {
        content: "4. Hoạt động vận dụng",
        lvd: "3 - 5'",
        gv: "- Hướng dẫn thả lỏng, dặn dò tập luyện mỗi ngày để tăng sức đề kháng.",
        hs: "- Thả lỏng toàn thân, giải tán: Khỏe!"
      }
    ]
  },
  k3_t15: {
    id: 'k3_t15',
    grade: 3,
    lessonNum: 15,
    week: 8,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 4: ĐI ĐỀU, ĐỨNG LẠI (Tiết 3)',
    rows: [
      {
        content: "1. Mở đầu: Nhận lớp & Khởi động",
        lvd: "5 - 7'",
        gv: "- Nhận lớp, thăm hỏi tình trạng thể lực, phổ biến nhiệm vụ bài học.\n- Khởi động các khớp, ép dọc ép ngang.",
        hs: "- Tập hợp 4 hàng dọc chuyển 4 hàng ngang, khởi động nghiêm túc."
      },
      {
        content: "2. Kiến thức mới & Ôn luyện: Đi đều vòng phải, Đi đều đứng lại",
        lvd: "7 - 8'",
        gv: "- Nhắc lại khẩu lệnh: \"Đi đều - BƯỚC!\", \"Đứng lại - ĐỨNG!\".\n- GV làm mẫu cách tiếp đất bằng nửa trước bàn chân, đánh tay đúng nhịp.",
        hs: "- Lắng nghe, ghi nhớ chân trái rơi vào nhịp 1, chân phải rơi vào nhịp 2."
      },
      {
        content: "3. Luyện tập theo tổ & Báo cáo",
        lvd: "15 - 16'",
        gv: "- Phân công tổ trưởng điều hành tổ đi đều vòng quanh sân.\n- GV đi quan sát, uốn nắn từng hàng giữ khoảng cách đều nhau.",
        hs: "- Các tổ luyện tập nghiêm túc, bước chân dứt khoát, khẩu lệnh rõ ràng."
      },
      {
        content: "3.5 Trò chơi: Chạy tiếp sức ném bóng vào rổ",
        lvd: "5'",
        gv: "- Hướng dẫn cách chơi, chia đội hình, cổ vũ và chấm điểm.",
        hs: "- Tích cực tham gia, rèn luyện khéo léo và tốc độ."
      },
      {
        content: "4. Vận dụng: Hồi tĩnh & Đánh giá",
        lvd: "4'",
        gv: "- Điều hành thả lỏng, khen ngợi tổ có ý thức tổ chức kỷ luật tốt.",
        hs: "- Thả lỏng, nghe dặn dò chuẩn bị cho tiết sau."
      }
    ]
  },
  k5_t15: {
    id: 'k5_t15',
    grade: 5,
    lessonNum: 15,
    week: 8,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC PHÁT TRIỂN CHUNG',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, TAY, CHÂN VỚI GẬY (Tiết 1)',
    rows: [
      {
        content: "1. Khởi động & Nhận lớp với gậy thể dục",
        lvd: "5 - 7'",
        gv: "- Kiểm tra gậy thể dục của học sinh (đảm bảo gậy nhẵn mịn, an toàn).\n- Khởi động xoay khớp phối hợp gậy.",
        hs: "- Mỗi HS cầm 1 gậy thể dục dựng thẳng bên chân phải, tập trung nhanh."
      },
      {
        content: "2. Khám phá: Động tác Vươn thở và Tay với gậy",
        lvd: "8 - 10'",
        gv: "- Hướng dẫn cách cầm gậy 2 đầu, nâng gậy lên cao hít sâu.\n- Phân tích kỹ thuật gậy nằm ngang ngực và đưa lên đỉnh đầu.",
        hs: "- Quan sát mẫu và thực hiện từng nhịp với gậy."
      },
      {
        content: "3. Luyện tập đồng loạt & Đội hình phân tán",
        lvd: "14 - 15'",
        gv: "- Điều khiển lớp tập với nhịp trống/tiếng còi dứt khoát.\n- Sửa lỗi tay cầm gậy bị lệch, chưa thẳng cánh tay.",
        hs: "- Tập theo nhịp gõ, giữ khoảng cách an toàn tránh va gậy vào bạn."
      },
      {
        content: "3.5 Trò chơi: Chuyền gậy tiếp sức",
        lvd: "4 - 5'",
        gv: "- Quản lý luật chơi chuyền gậy không rơi, an toàn cao.",
        hs: "- Tham gia hào hứng, phối hợp ăn ý giữa các thành viên."
      },
      {
        content: "4. Vận dụng & Hồi tĩnh",
        lvd: "4'",
        gv: "- Cho HS thả lỏng khớp vai và chân, xếp gậy gọn gàng vào giá dụng cụ.",
        hs: "- Thả lỏng, cất dụng cụ ngăn nắp theo hướng dẫn."
      }
    ]
  }
};

export const defaultScenarios: ScenarioItem[] = [
  {
    id: 'sc_1_1_nhan_lop',
    title: '1.1 Nhận lớp: Kiểm tra vệ sinh, trang phục, sức khỏe & Phổ biến nội dung',
    category: 'Mở đầu',
    grade: 'Chung',
    content: '1.1 Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục tập luyện, sức khỏe của HS\n- Phổ biến nội dung, yêu cầu tiết học',
    lvd: '1 - 2 phút',
    gv: 'Gv nhận lớp, thăm hỏi sức khỏe học sinh phổ biến nội dung, yêu cầu giờ học',
    hs: 'Đội hình nhận lớp\n- Cán sự tập trung lớp, điểm số, báo cáo sĩ số, tình hình lớp cho GV.\n- Hs lắng nghe, nắm nội dung bài học'
  },
  {
    id: 'sc_1_2_khoi_dong',
    title: '1.2. Khởi động: Xoay các khớp cổ tay, cổ chân, vai, hông, gối theo nhạc',
    category: 'Mở đầu',
    grade: 'Chung',
    content: '1.2. Khởi động:\n- Xoay các khớp cổ tay, cổ chân, vai, hông, gối,... (theo nhạc)',
    lvd: '2Lx8N',
    gv: '- GV quan sát, nhắc học sinh tập đúng biên độ, nhịp hô.',
    hs: 'Đội hình khởi động\n- HS khởi động theo sự điều khiển của cán sự.'
  },
  {
    id: 'sc_1_3_trochoi_kd',
    title: '1.3. Trò chơi bổ trợ khởi động & Kiểm tra bài cũ',
    category: 'Mở đầu',
    grade: 'Chung',
    content: '1.3. Trò chơi bổ trợ khởi động:\n- Kiểm tra bài cũ',
    lvd: '3 - 4 phút',
    gv: '- GV tổ chức cho HS chơi trò chơi\n- Gọi 1 tổ học sinh lên thực hiện.\n- GV cùng HS quan sát và nhận xét, đánh giá.\n- GV gọi 1-2 HS lên thực hiện các nội dung động tác đã học.\n- GV nhận xét',
    hs: '- HS chú ý nắm luật chơi, tích cực, chủ động tham gia trò chơi.\n- Học sinh thực hiện theo yêu cầu của giáo viên'
  },
  {
    id: 'sc_2_dong_tac_moi',
    title: '2. Khám phá (Hình thành kiến thức mới): Kỹ thuật động tác SGK',
    category: 'Động tác mới',
    grade: 'Chung',
    content: '2. Khám phá kiến thức mới:\n- Giới thiệu tên động tác và kỹ thuật động tác của tuần mới (truy xuất từ bộ SGK đã tải lên)\n- Phân tích kỹ thuật các nhịp, tư thế tay, chân, thân người',
    lvd: '5 - 7 phút',
    gv: '- GV giới thiệu tên động tác, phân tích kỹ thuật và làm mẫu 2 - 3 lần theo chiều gương.\n- Hướng dẫn HS quan sát tranh ảnh kỹ thuật SGK đính kèm, chỉ rõ góc độ và nhịp thở.\n- Hô nhịp chậm cho cả lớp tập bắt chước 1 - 2 lần.',
    hs: 'ĐH quan sát tranh kỹ thuật và động tác mẫu (4 hàng ngang đứng so le)\n- HS chú ý quan sát tư thế của GV, ghi nhớ hướng di chuyển và nhịp thở.\n- Bắt chước thực hiện động tác theo hiệu lệnh.'
  },
  {
    id: 'sc_3_1_tap_dong_loat',
    title: '3.1. Tập đồng loạt: Ôn luyện theo nhịp hô của GV và cán sự',
    category: 'Luyện tập',
    grade: 'Chung',
    content: '3.1. Tập đồng loạt:\n- Toàn lớp thực hiện động tác theo nhịp hô chung',
    lvd: '1-2 lần',
    gv: '- GV hô nhịp và quan sát ( lần 1)\n- Hướng dẫn cán sự lớp hô nhịp. GV quan sát chung, nhắc lại những lỗi thường gặp như sai hướng, biên độ động tác, nhịp hô.',
    hs: 'ĐH tập luyện đồng loạt.\n- HS tập\n- CS điều khiển, HS thực hiện.\n- HS nhận biết những lỗi thường mắc phải, sửa ở những lần tập tiếp theo.'
  },
  {
    id: 'sc_3_2_tap_to_nhom',
    title: '3.2. Tập theo tổ nhóm: Phân chia khu vực & Giúp đỡ học sinh',
    category: 'Luyện tập',
    grade: 'Chung',
    content: '3.2. Tập theo tổ nhóm:\n- Phân chia khu vực tập luyện theo tổ\n- Giúp đỡ học sinh khó khăn, phân hóa thể lực',
    lvd: '2-3 Lần',
    gv: '- GV giao nhiệm vụ cho tổ trưởng, phân luyện tập theo khu vực.\n- GV quan sát chung, hỗ trợ đặc biệt cho HS gặp khó khăn khi thực hiện động tác.\n- GV chú ý đến sức khoẻ của HS có biểu hiện mệt mỏi, điều chỉnh phù hợp.',
    hs: '-ĐH tập luyện theo tổ\n- Hs tập theo điều khiển của tổ trưởng.\n- Hs nhận biết các dấu hiệu mệt mỏi khi tập luyện chủ động nhờ sự hỗ trợ từ GV'
  },
  {
    id: 'sc_3_4_trochoi_vandong',
    title: '3.4 Trò chơi vận động: Trao gậy tiếp sức (Tố chất nhanh nhẹn, khéo léo)',
    category: 'Trò chơi',
    grade: 'Chung',
    content: '3.4 Trò chơi vận động:\n* Trò chơi: “Trao gậy tiếp sức”\n- Tác dụng: Phát triển tố chất nhanh nhẹn, mạnh, khéo léo, phối hợp đồng đội.\n- Cách chơi & Luật chơi: Khi có lệnh, số 1 chạy nhanh vòng qua cọc tiêu quay về trao gậy cho số 2; không làm rơi gậy, xuất phát đúng hiệu lệnh.\n- Quy định thắng thua: Đội hoàn thành trước ít phạm quy nhất xếp giải Nhất.',
    lvd: '1-2 lần',
    gv: '- GV giới thiệu ngắn gọn về trò chơi, hướng dẫn cách chơi, luật chơi, những qui định về lỗi phạm qui…\n- GV hỏi về cách tổ chức khi chơi trò chơi này là gì? hướng dẫn cán sự biết cách tổ chức phân công, lựa chọn người điều khiển., trọng tài.\n- GV quan sát chung.\nChú ý: GV nhắc HS đảm bảo an toàn trong khi chơi.\n- GV chú ý tinh thần, thái độ , cảm xúc của học sinh.\n- GV giải thích ngắn gọn vì sao phải thi đua với nhau.\n- GV hãy hỏi về cảm xúc, ý kiến của HS về phần thi đua.',
    hs: 'ĐH chơi trò chơi\n- Hs chủ động lựa chọn, phân công, bố trí đội hình hợp lý, biết lựa chọn chiến thuật và quan sát đối thủ để giành thắng lợi cho đội mình\n- Trọng tài, người điều khiển trò chơi vào vị trí làm việc tiến hành lượt chơi đầu tiên.\n- HS nhận biết và thay đổi chiến thuật để đạt kết quả trong lượt chơi tiếp theo.\n- Thi đua giữa các tổ:\n+ GV giải thích ngắn gọn vì sao phải thi đua với nhau.\n+ Hs hiểu được lý do thi đua và cần chuẩn bị tinh thần cho cả tổ khi thi đua với tổ khác.\n+ Hs tự tin thể hiện ý kiến của bản thân.'
  },
  {
    id: 'sc_4_1_hoi_tinh',
    title: '4.1. Hồi tĩnh: Thả lỏng cơ toàn thân',
    category: 'Hồi tĩnh',
    grade: 'Chung',
    content: '4.1. Hồi tĩnh:\n- Thả lỏng cơ toàn thân',
    lvd: '2 - 3 phút',
    gv: '- GV điều hành lớp thả lỏng cơ toàn thân',
    hs: 'Đội hình hồi tĩnh\n- Học sinh thực hiện theo yêu cầu của giáo viên'
  },
  {
    id: 'sc_4_2_van_dung_bvmt',
    title: '4.2. Vận dụng: Vận dụng thực tế & Tích hợp Bảo vệ môi trường',
    category: 'Vận dụng',
    grade: 'Chung',
    content: '4.2. Vận dụng:\n- Tích hợp bảo vệ môi trường: GV nhắc HS kiểm tra vệ sinh sân tập, nhặt vật gây nguy hiểm; sử dụng và thu dọn dụng cụ đúng nơi quy định.',
    lvd: '2 - 3 phút',
    gv: '- GV nêu câu hỏi vận dụng kiến thức vào thực tế cuộc sống\nTích hợp bảo vệ môi trường: GV nhắc HS kiểm tra vệ sinh sân tập, nhặt vật gây nguy hiểm; sử dụng và thu dọn dụng cụ đúng nơi quy định.',
    hs: '- Học sinh thực hiện theo yêu cầu của giáo viên\n- HS trả lời câu hỏi vận dụng vào thực tế đời sống.\nHS kiểm tra vệ sinh sân tập, nhặt vật gây nguy hiểm; sử dụng và thu dọn dụng cụ đúng nơi quy định.'
  },
  {
    id: 'sc_4_3_nhan_xet_ve_nha',
    title: '1.3. Nhận xét và hướng dẫn tự tập luyện ở nhà & Xuống lớp',
    category: 'Vận dụng',
    grade: 'Chung',
    content: '1.3. Nhận xét và hướng dẫn tự tập luyện ở nhà:\n- Trao đổi ngắn về các hoạt động của bài học\n+ Về độ khó của động tác, về cảm xúc, khả năng ghi nhớ, tương tác, phối hợp trong giờ học\n- Hướng dẫn tập luyện ở nhà\n- Xuống lớp',
    lvd: '2 - 3 phút',
    gv: '- GV hỏi HS về giờ học này các bạn cảm thấy thế nào?\n- GV nắm bắt và tiến hành điều chỉnh kịp thời những giờ học tiếp theo.\n- Nhận xét tinh thần, ý thức, thái độ học của HS, đồng thời đưa ra hướng khắc phục hoặc trả lời câu hỏi của HS.\n- HD học sinh tập ở nhà.',
    hs: '- HS trả lời cảm nhận về giờ học.\n- HS hiểu được nắm được về nội dung của bài học, cần chuẩn bị tinh thần , ý thức sức khoẻ, hợp lý để đảm bảo yêu cầu của từng hoạt động\n- Xuống lớp: HS đi theo hàng về lớp'
  }
];

export const defaultSgkImages: SgkImageItem[] = [
  // ===== KHỐI 1 - BẢN GỐC TỪ SGK KẾT NỐI TRI THỨC =====
  {
    id: 'img_sgk_k1_vuon_tho',
    title: 'Động tác Vươn thở - SGK GDTC Lớp 1 (Trang 36)',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'kyThuat',
    page: 36,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
    caption: 'Tư thế nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay vươn lên cao chếch chữ V, đầu ngửa hít sâu bằng mũi.',
    selected: false,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'img_sgk_k1_tay',
    title: 'Động tác Tay - SGK GDTC Lớp 1 (Trang 37)',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'kyThuat',
    page: 37,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k1_tay.jpg',
    caption: 'Tư thế nhịp 1: Bước chân trái, hai tay dang ngang lòng bàn tay ngửa, mắt nhìn thẳng phía trước, ngực ưỡn căng.',
    selected: false,
    createdAt: Date.now() - 3500000
  },
  {
    id: 'img_sgk_k1_chan',
    title: 'Động tác Chân - SGK GDTC Lớp 1 (Trang 43)',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Chân và Động tác Lườn',
    folder: 'kyThuat',
    page: 43,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k1_chan.jpg',
    caption: 'Tư thế nhịp 1: Kiễng hai gót chân, hai tay chống hông. Nhịp 2: Khuỵu gối, hai tay đưa ra trước song song ngang vai.',
    selected: false,
    createdAt: Date.now() - 3450000
  },
  {
    id: 'img_sgk_k1_luon',
    title: 'Động tác Lườn - SGK GDTC Lớp 1 (Trang 44)',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Chân và Động tác Lườn',
    folder: 'kyThuat',
    page: 44,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k1_luon.jpg',
    caption: 'Tư thế nhịp 2: Chân trái bước sang ngang, tay trái chống hông, tay phải vươn cao nghiêng người sâu sang trái.',
    selected: false,
    createdAt: Date.now() - 3440000
  },
  {
    id: 'img_sgk_k1_bung',
    title: 'Động tác Bụng - SGK GDTC Lớp 1 (Trang 49)',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b3',
    lessonTitle: 'Bài 3: Động tác Bụng và Động tác Phối hợp',
    folder: 'kyThuat',
    page: 49,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k1_bung.jpg',
    caption: 'Tư thế nhịp 2: Cúi gập thân sâu ra trước, cúi đầu, hai tay hướng xuống chạm mu bàn chân, hai chân giữ thẳng.',
    selected: false,
    createdAt: Date.now() - 3430000
  },
  {
    id: 'img_sgk_k1_thang_bang_nang_chan_2d',
    title: 'Động tác Thăng bằng (Nâng chân ngang) - SGK Lớp 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Thể Dục & Thăng Bằng',
    folder: 'kyThuat',
    page: 25,
    category: 'dong_tac',
    imgUrl: '/assets/aistudio/0e0e03fc-7060-481d-85f2-da82dde1f3c3_eccfceae.jfif',
    caption: 'Động tác thăng bằng nâng chân ngang, hai tay dang ngang giữ thăng bằng chuẩn SGK Kết Nối Tri Thức.',
    selected: false,
    createdAt: Date.now() - 3700000
  },
  {
    id: 'img_sgk_k1_tro_choi',
    title: 'Trò chơi: Con thỏ / Làm theo hiệu lệnh - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'troChoi',
    page: 39,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: 'Đội hình tham gia trò chơi vận động Con thỏ / Làm theo hiệu lệnh an toàn, sinh động cho học sinh lớp 1.',
    selected: false,
    createdAt: Date.now() - 3300000
  },

  // ===== KHỐI 3 - BẢN GỐC TỪ SGK KẾT NỐI TRI THỨC =====
  {
    id: 'img_sgk_k3_di_deu',
    title: 'Động tác Đi đều, Đứng lại - SGK GDTC Lớp 3 (Trang 27)',
    grade: '3',
    topicId: 'k3_cd1',
    topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b4',
    lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
    folder: 'kyThuat',
    page: 27,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
    caption: 'Khẩu lệnh "Đi đều - BƯỚC!": Chân trái bước nhịp 1, chân phải bước nhịp 2; tay đánh tự nhiên trước ngực, ngực căng.',
    selected: false,
    createdAt: Date.now() - 2500000
  },
  {
    id: 'img_sgk_k3_on_di_deu',
    title: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp - SGK Lớp 3 (Trang 28)',
    grade: '3',
    topicId: 'k3_cd1',
    topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b4',
    lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
    folder: 'kyThuat',
    page: 28,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
    caption: 'Kỹ thuật đổi chân khi đi đều sai nhịp: Đệm một bước ngắn của chân sai nhịp để lấy lại nhịp chân trái nhịp 1, chân phải nhịp 2.',
    selected: false,
    createdAt: Date.now() - 2450000
  },
  {
    id: 'img_sgk_k3_chay_tam_giac',
    title: 'Trò chơi: Chạy theo hình tam giác - SGK Lớp 3 (Trang 29)',
    grade: '3',
    topicId: 'k3_cd1',
    topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b4',
    lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
    folder: 'troChoi',
    page: 29,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
    caption: 'Trò chơi vận động Chạy theo hình tam giác: 3 cọc mốc A-B-C cự ly 8-10m, học sinh chạy tiếp sức vòng quanh tam giác.',
    selected: false,
    createdAt: Date.now() - 2400000
  },

  // ===== KHỐI 5 - BẢN GỐC TỪ SGK KẾT NỐI TRI THỨC =====
  {
    id: 'img_sgk_k5_gay',
    title: 'Bài tập thể dục với gậy (Vươn thở, Tay) - SGK Lớp 5 (Trang 24)',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
    folder: 'kyThuat',
    page: 24,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    caption: 'Bài tập thể dục phát triển chung phối hợp với gậy: Hai tay cầm hai đầu gậy nâng cao qua đầu hít sâu, hạ gậy ngang vai.',
    selected: false,
    createdAt: Date.now() - 1500000
  },
  {
    id: 'img_sgk_k5_chan_gay',
    title: 'Động tác Chân với gậy - SGK GDTC Lớp 5 (Trang 25)',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
    folder: 'kyThuat',
    page: 25,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
    caption: 'Kỹ thuật Động tác Chân với gậy: Kiễng gót hai chân nâng gậy trước ngực, khuỵu gối sâu hạ gậy song song trước ngực.',
    selected: false,
    createdAt: Date.now() - 1450000
  },
  {
    id: 'img_sgk_k5_van_minh_toan_than',
    title: 'Động tác Vặn mình và Toàn thân với gậy - SGK Lớp 5 (Trang 28)',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Vặn mình, Bụng, Toàn thân với gậy',
    folder: 'kyThuat',
    page: 28,
    category: 'dong_tac',
    imgUrl: '/assets/sgk_chuan/k5_van_minh_toan_than_gay.jpg',
    caption: 'Động tác Vặn mình và Phối hợp toàn thân với gậy thể dục giúp rèn luyện độ dẻo mềm cột sống và sức bền thân trên.',
    selected: false,
    createdAt: Date.now() - 1420000
  },
  {
    id: 'img_sgk_k5_chuyen_gay',
    title: 'Trò chơi: Chuyền gậy tiếp sức - SGK Lớp 5 (Trang 26)',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
    folder: 'troChoi',
    page: 26,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k5_chuyen_gay_tiep_suc.jpg',
    caption: 'Trò chơi vận động Chuyền gậy tiếp sức: 4 làn chạy tiếp sức cự ly 10m, kỹ thuật cầm chuyền gậy chắc chắn và an toàn.',
    selected: false,
    createdAt: Date.now() - 1400000
  },

  // ===== BỔ SUNG TRÒ CHƠI KHỞI ĐỘNG, VẬN ĐỘNG & HÌNH ẢNH LUYỆN TẬP PHÂN LOẠI CHUẨN SGK =====
  // 1. Trò chơi khởi động
  {
    id: 'img_sgk_k1_tc_kd_hieu_lenh',
    title: 'Trò chơi khởi động: Làm theo hiệu lệnh / Đứng ngồi theo hiệu lệnh - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'troChoiKhoiDong',
    page: 38,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: 'Học sinh phản xạ nhanh theo khẩu lệnh của giáo viên: đứng nghiêm, ngồi xổm, vươn tay tạo không khí vui tươi.',
    selected: false,
    createdAt: Date.now() - 1300000
  },
  {
    id: 'img_sgk_k1_tc_kd_ket_ban',
    title: 'Trò chơi khởi động: Kết bạn - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Chân, Vặn mình, Bụng',
    folder: 'troChoiKhoiDong',
    page: 42,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: 'Học sinh vừa chạy nhẹ nhàng vừa lắng nghe số lượng kết nhóm để nhanh chóng bắt tay bạn.',
    selected: false,
    createdAt: Date.now() - 1280000
  },
  {
    id: 'img_sgk_k3_tc_kd_chui_ham',
    title: 'Trò chơi khởi động: Chui qua hầm / Đổi chỗ theo hiệu lệnh - Khối 3',
    grade: '3',
    topicId: 'k3_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân',
    folder: 'troChoiKhoiDong',
    page: 34,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
    caption: 'Trò chơi khởi động Chui qua hầm giúp làm nóng toàn thân, khởi động các khớp linh hoạt và tạo hứng khởi.',
    selected: false,
    createdAt: Date.now() - 1250000
  },
  {
    id: 'img_sgk_k3_tc_kd_meo_duoi_chuot',
    title: 'Trò chơi khởi động: Mèo đuổi chuột / Chim về tổ - Khối 3',
    grade: '3',
    topicId: 'k3_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Lườn, Bụng, Phối hợp',
    folder: 'troChoiKhoiDong',
    page: 36,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
    caption: 'Trò chơi khởi động vòng tròn rèn luyện độ nhanh nhẹn, tinh thần đồng đội và phản xạ linh hoạt.',
    selected: false,
    createdAt: Date.now() - 1240000
  },
  {
    id: 'img_sgk_k5_tc_kd_gay',
    title: 'Trò chơi khởi động: Đội nào nhanh nhất - Khối 5 (SGK Trang 29)',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Bụng, Vặn mình, Toàn thân với gậy',
    folder: 'troChoiKhoiDong',
    page: 29,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
    caption: 'Khởi động phản xạ với gậy thể dục: Trò chơi Đội nào nhanh nhất theo đúng hướng dẫn SGK GDTC 5 Trang 29.',
    selected: false,
    createdAt: Date.now() - 1200000
  },
  {
    id: 'img_sgk_k5_tc_kd_ai_keo_khoe',
    title: 'Trò chơi khởi động: Ai kéo khoẻ hơn / Chạy luồn cọc tiêu - Khối 5',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Bụng, Vặn mình, Toàn thân với gậy',
    folder: 'troChoiKhoiDong',
    page: 27,
    category: 'tro_choi_khoi_dong',
    imgUrl: '/assets/sgk_chuan/k5_chuyen_gay_tiep_suc.jpg',
    caption: 'Học sinh cầm hai đầu gậy thể dục kéo co cân bằng thể lực tay vai an toàn.',
    selected: false,
    createdAt: Date.now() - 1190000
  },

  // 2. Trò chơi vận động
  {
    id: 'img_sgk_k1_tc_vd_tho',
    title: 'Trò chơi vận động: Thỏ nhường hang - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'troChoi',
    page: 40,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: 'Trò chơi vận động Thỏ nhường hang giúp phát triển tố chất nhanh nhẹn, khéo léo và phản xạ chạy chỗ an toàn.',
    selected: false,
    createdAt: Date.now() - 1180000
  },
  {
    id: 'img_sgk_k1_tc_vd_lo_co',
    title: 'Trò chơi vận động: Lò cò tiếp sức / Chạy tiếp sức - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Chân, Vặn mình, Bụng',
    folder: 'troChoi',
    page: 46,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: '4 hàng dọc thi đua nhảy lò cò cự ly 8-10m vòng qua cọc mốc quay về chạm tay bạn tiếp theo.',
    selected: false,
    createdAt: Date.now() - 1170000
  },
  {
    id: 'img_sgk_k1_tc_vd_keo_co',
    title: 'Trò chơi vận động: Kéo co an toàn - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b3',
    lessonTitle: 'Bài 3: Động tác Phối hợp và Điều hòa',
    folder: 'troChoi',
    page: 51,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
    caption: 'Trò chơi kéo co đồng đội phát triển sức mạnh bắp chân và tinh thần đoàn kết tập thể.',
    selected: false,
    createdAt: Date.now() - 1160000
  },
  {
    id: 'img_sgk_k3_tc_vd_dua_o_to',
    title: 'Trò chơi vận động: Đua ô tô / Chạy zíc zắc tiếp sức - Khối 3',
    grade: '3',
    topicId: 'k3_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân',
    folder: 'troChoi',
    page: 35,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
    caption: 'Trò chơi vận động Đua ô tô: học sinh cầm vòng tượng trưng vô lăng chạy khéo léo qua cọc tiêu tiếp sức.',
    selected: false,
    createdAt: Date.now() - 1150000
  },
  {
    id: 'img_sgk_k5_tc_vd_trao_gay',
    title: 'Trò chơi vận động: Trao gậy tiếp sức / Chuyển bóng tiếp sức - Khối 5',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b2',
    lessonTitle: 'Bài 2: Động tác Bụng, Vặn mình, Toàn thân với gậy',
    folder: 'troChoi',
    page: 29,
    category: 'tro_choi',
    imgUrl: '/assets/sgk_chuan/k5_chuyen_gay_tiep_suc.jpg',
    caption: 'Kỹ thuật trao và nhận gậy tiếp sức tốc độ cao, phối hợp đồng đội nhịp nhàng và chính xác.',
    selected: false,
    createdAt: Date.now() - 1140000
  },

  // 3. Hình ảnh luyện tập của bài học
  {
    id: 'img_sgk_k1_luyen_tap',
    title: 'Hình ảnh luyện tập: Tập đồng loạt 4 hàng ngang giãn cách - Khối 1',
    grade: '1',
    topicId: 'k1_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
    folder: 'luyenTap',
    page: 37,
    category: 'tap_luyen',
    imgUrl: '/assets/sgk_chuan/k1_chan.jpg',
    caption: 'Toàn lớp đứng so le cự ly 1 sải tay đồng loạt thực hiện bài thể dục theo nhịp hô.',
    selected: false,
    createdAt: Date.now() - 1130000
  },
  {
    id: 'img_sgk_k3_luyen_tap',
    title: 'Hình ảnh luyện tập: Luyện tập theo tổ nhóm 4 góc sân - Khối 3',
    grade: '3',
    topicId: 'k3_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân',
    folder: 'luyenTap',
    page: 33,
    category: 'tap_luyen',
    imgUrl: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
    caption: '4 tổ luyện tập tại 4 khu vực sân bãi, tổ trưởng điều khiển, các thành viên hỗ trợ sửa sai cho nhau.',
    selected: false,
    createdAt: Date.now() - 1120000
  },
  {
    id: 'img_sgk_k5_luyen_tap',
    title: 'Hình ảnh luyện tập: Luyện tập cặp đôi sửa sai với gậy - Khối 5',
    grade: '5',
    topicId: 'k5_cd2',
    topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b1',
    lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
    folder: 'luyenTap',
    page: 25,
    category: 'tap_luyen',
    imgUrl: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
    caption: 'Từng cặp hai bạn đứng đối diện nhau quan sát và góp ý tư thế nâng gậy song song và khuỵu gối lưng thẳng.',
    selected: false,
    createdAt: Date.now() - 1110000
  }
];
