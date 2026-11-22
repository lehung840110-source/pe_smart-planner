import { LessonRow, SchoolSettings } from '../types/gdtc';
import { standardFormationDiagrams, getFormationDiagramForPhaseAndGrade } from './formationDiagrams';
import { standardMovementsLibrary } from './movementLibrary';

export interface MasterPlanItem {
  id: string;
  grade: number;
  week: number;
  lessonNum: number;
  topic: string;
  title: string;
  dateRange: string;
  specialCompetencies: {
    healthCare: string;
    basicMovement: string;
    sportsCompetency: string;
    disabledStudents: string;
  };
  generalCompetencies: {
    autonomy: string;
    collaboration: string;
    problemSolving: string;
    disabledStudents: string;
  };
  qualities: {
    diligence: string;
    honesty: string;
    responsibility: string;
    disabledStudents: string;
  };
  integrations: {
    addressLabel?: string; // e.g. "GDQPAN & KNS", "NLS (mức L1–L2 – Mã 5.3)"
    addressContent?: string; // Nội dung địa chỉ tích hợp trọng tâm theo bài/tuần
    domains?: string[]; // ['NLS', 'GDQPAN', 'QuyenTreEm', 'ATGT', 'KNS', 'BVMT']
    digitalSkill: string; // e.g. "mức L1–L2 – Mã 5.3"
    digitalDescription: string;
    qpan?: string;
    childRights?: string;
    lifeSkills: string;
    trafficSafety?: string;
    environmentalEducation?: string;
  };
  locationEquipment: {
    location: string;
    teacherTools: string;
    studentTools: string;
  };
  rows: LessonRow[];
  postLessonAdjustment: string;
  signatures: {
    locationDate: string;
    bgh: string;
    headTeacher: string;
    teacher: string;
  };
}

export const defaultNghiaHiepSchoolSettings: SchoolSettings = {
  schoolName: 'TRƯỜNG TIỂU HỌC & THCS NGHĨA HIỆP',
  departmentName: 'TỔ CHUYÊN MÔN TIỂU HỌC',
  teacherName: 'LÊ QUỐC HƯNG',
  schoolYear: '2026 - 2027',
  approverPrincipal: 'Võ Thị Thuận',
  approverHead: 'Bùi Ngọc Lâm'
};

// Master Plans directly from the Tuần 8 PDF of GV Lê Quốc Hưng
export const masterPlansTuan8: Record<string, MasterPlanItem> = {
  k1_t15: {
    id: 'k1_t15',
    grade: 1,
    week: 8,
    lessonNum: 15,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 1)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện.',
      basicMovement: 'Thực hiện được động tác theo khẩu lệnh và biết giữ khoảng cách an toàn khi thực hiện.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, học liệu số/video minh họa hoặc động tác mẫu của GV; biết tự điều chỉnh động tác khi luyện tập.',
      disabledStudents: 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập. Có thể giao những việc mà học sinh thích thú như bắt, tập theo các động tác của GV một cách đơn giản nhất. Tham gia các trò chơi cùng bạn.'
    },
    generalCompetencies: {
      autonomy: 'Chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; lắng nghe hướng dẫn, tự giác luyện tập và tự điều chỉnh lỗi sai.',
      collaboration: 'Biết phối hợp với bạn, tổ/nhóm; chấp hành phân công, hỗ trợ bạn trong quá trình tập luyện và tham gia trò chơi.',
      problemSolving: 'Biết quan sát, nhận xét tình huống vận động đơn giản; phát hiện lỗi sai thường gặp và lựa chọn cách thực hiện an toàn, phù hợp.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác trong tập luyện, hoạt động tập thể và rèn luyện thể dục thể thao hằng ngày.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.',
      responsibility: 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn khi luyện tập.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    integrations: {
      digitalSkill: '3.1TC1a',
      digitalDescription: 'Dưới sự hướng dẫn của giáo viên, học sinh biết sắp xếp một số hình ảnh số đơn giản theo đúng trình tự của thứ tự nhịp, tư thế thân người và sự phối hợp các bộ phận.',
      lifeSkills: 'GV hướng dẫn HS kiên trì, chờ đến lượt, phối hợp, nhận xét bạn bằng lời tích cực và chủ động báo khi cơ thể mệt hoặc khó chịu.'
    },
    locationEquipment: {
      location: 'Sân trường bằng phẳng, sạch sẽ, an toàn.',
      teacherTools: 'Tranh ảnh động tác SGK, còi thể thao, thiết bị phát âm thanh, kế hoạch bài dạy.',
      studentTools: 'Trang phục thể thao gọn gàng, giày ba-ta vừa chân.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục tập luyện, sức khỏe của HS.\n- Phổ biến nội dung, yêu cầu tiết học.",
        lvd: "5 - 7'",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe học sinh.\n- Phổ biến nội dung, mục tiêu tiết 15: Học động tác Vươn thở, trò chơi Làm theo hiệu lệnh.",
        hs: "- Cán sự tập trung lớp thành 4 hàng ngang, điểm số, báo cáo sĩ số cho GV.\n- HS lắng nghe, nắm vững nội dung bài học.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình nhận lớp (4 hàng ngang cự ly hẹp)'
      },
      {
        content: "1.2. Khởi động:\n- Xoay các khớp cổ tay, cổ chân, vai, hông, gối,... (theo nhạc).\n1.3. Trò chơi bổ trợ:\n- Trò chơi \"Làm theo hiệu lệnh\".",
        lvd: "2L x 8N\n3 - 4'",
        gv: "- GV quan sát, nhắc HS tập đúng biên độ và nhịp hô.\n- Nêu tên trò chơi, luật chơi bổ trợ tạo không khí hứng khởi.",
        hs: "- Đội hình khởi động 4 hàng ngang so le giãn cách 1 sải tay.\n- Khởi động đều đặn và hào hứng tham gia trò chơi.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình khởi động (4 hàng ngang so le 1 sải tay)'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1. Khám phá & Hình thành động tác:\n* Học Động tác Vươn thở:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay vươn lên cao chếch chữ V, ngửa đầu, hít vào sâu bằng mũi.\n- Nhịp 2: Hai tay đưa xuống bắt chéo trước bụng (tay trái để trên), cúi đầu nhẹ, thở ra bằng miệng.\n- Nhịp 3: Như nhịp 1, ngửa đầu, hít vào.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.",
        lvd: "5 - 7'",
        gv: "- GV làm mẫu động tác chuẩn xác 2-3 lần và phân tích kỹ thuật từng nhịp.\n- Cho HS xem tranh ảnh SGK đính kèm, chỉ rõ nhịp hít vào thở ra.\n- Nêu các lỗi sai thường mắc (cúi đầu quá thấp, tay chưa vươn căng) và cách khắc phục.",
        hs: "- Đội hình HS tập trung quan sát tranh và GV làm mẫu.\n- HS quan sát mẫu, lắng nghe phân tích để ghi nhớ kỹ thuật.\n- Nêu câu hỏi thắc mắc nếu có.",
        contentImgUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vươn thở (SGK GDTC Lớp 1)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu & tranh SGK'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt cả lớp:\n- Cả lớp tập động tác Vươn thở theo hiệu lệnh GV (2-3 lần).\n3.2. Tập theo tổ nhóm:\n- Phân 4 tổ về 4 khu vực sân bãi.\n- Tổ trưởng điều khiển tổ mình tập luyện.",
        lvd: "15 - 16'\n2-3 lần\n3-4 lần",
        gv: "- GV hô nhịp điều khiển tập đồng loạt, uốn nắn tư thế.\n- Giao nhiệm vụ cho 4 tổ trưởng, phân khu vực tập luyện.\n- GV luân chuyển giữa các tổ quan sát, sửa sai cho từng em.\n- Tích hợp KNS: Nhắc HS kiên trì, chờ đến lượt, phối hợp tích cực.",
        hs: "- Đội hình tập đồng loạt 4 hàng ngang.\n- Chuyển đội hình về 4 góc sân theo tổ, tổ trưởng hô nhịp.\n- Các thành viên tự giác tập luyện, quan sát giúp đỡ bạn.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm (4 góc sân)'
      },
      {
        content: "3.3. Tập luyện theo cặp đôi:\n- 2 HS tạo thành từng cặp đổi vai quan sát sửa sai.\n3.4. Thi đua giữa các tổ:\n- Từng tổ lên thực hiện, các tổ khác nhận xét.",
        lvd: "2-3 lần\n1 lần",
        gv: "- Hướng dẫn cách đổi vai: 1 bạn tập, 1 bạn hô nhịp và góp ý.\n- Điều hành thi đua, khen thưởng và tuyên dương tổ thực hiện đều đẹp.",
        hs: "- Từng cặp đối diện nhau tập luyện nghiêm túc.\n- Từng tổ lên biểu diễn tự tin, các bạn ngồi xem nhận xét chân thành.",
        hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo cặp đôi đối diện sửa sai'
      },
      {
        content: "3.5. Trò chơi vận động: \"Thỏ nhường hang\"\n- Rèn phản xạ nhanh, khéo léo và tinh thần tập thể.",
        lvd: "4 - 5'\n1-2 lần",
        gv: "- GV nêu tên trò chơi, hướng dẫn cách chơi và luật chơi an toàn.\n- Tổ chức chơi thử 1 lần rồi chơi chính thức có thi đua, đảm bảo an toàn tuyệt đối.",
        hs: "- Đội hình vòng tròn tham gia trò chơi.\n- HS nắm vững luật chơi, tham gia nhiệt tình, tươi vui.",
        hsImgUrl: standardFormationDiagrams[7].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình vòng tròn trò chơi vận động'
      },
      {
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo nhịp nhạc.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp năng lực số (3.1TC1a) và vệ sinh sân tập.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng toàn thân, điều hòa nhịp tim.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- Hướng dẫn HS sắp xếp hình ảnh động tác theo đúng thứ tự nhịp.\n- Đánh giá, nhận xét tinh thần học tập của lớp và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh hàng ngang thả lỏng tay chân, hít thở sâu.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Lắng nghe nhận xét, trật tự giải tán về lớp theo hàng dọc.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh thả lỏng toàn thân'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k1_t16: {
    id: 'k1_t16',
    grade: 1,
    week: 8,
    lessonNum: 16,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 2)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết vệ sinh cá nhân, chọn trang phục thể thao và khởi động đúng cách.',
      basicMovement: 'Biết cách thực hiện động tác Tay kết hợp ôn tập động tác Vươn thở đúng nhịp.',
      sportsCompetency: 'Quan sát tranh ảnh động tác tay, bắt chước tư thế đúng biên độ.',
      disabledStudents: 'Áp dụng học hòa nhập, thực hiện động tác tay ở mức cơ bản.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác ôn luyện động tác vươn thở trước khi vào học động tác tay.',
      collaboration: 'Phối hợp với bạn trong tổ để hoàn thành bài tập nhóm.',
      problemSolving: 'Biết phát hiện lỗi sai khi dang tay bị trùng gối hoặc tay buông thấp.',
      disabledStudents: 'Linh hoạt hỗ trợ theo tiến bộ của học sinh.'
    },
    qualities: {
      diligence: 'Chăm chỉ ôn tập liên hoàn hai động tác.',
      honesty: 'Trung thực trong chơi trò chơi tiếp sức.',
      responsibility: 'Giữ an toàn khoảng cách khi vung tay tập luyện.',
      disabledStudents: 'Đoàn kết, giúp đỡ bạn hòa nhập.'
    },
    integrations: {
      digitalSkill: '3.1TC1a',
      digitalDescription: 'Học sinh biết ghép nối hình ảnh động tác Tay và Vươn thở theo thứ tự liên hoàn.',
      lifeSkills: 'Hình thành thói quen rèn luyện thân thể mỗi ngày nâng cao sức đề kháng.'
    },
    locationEquipment: {
      location: 'Sân trường thoáng mát, an toàn.',
      teacherTools: 'Tranh ảnh động tác tay, còi, vạch kẻ làn trò chơi.',
      studentTools: 'Giày ba-ta, trang phục thể thao.'
    },
    rows: [
      {
        content: "1. Mở đầu:\n1.1. Nhận lớp, kiểm tra sĩ số, trang phục, sức khỏe.\n1.2. Khởi động chung các khớp.\n1.3. Trò chơi khởi động: \"Di chuyển theo tín hiệu\".",
        lvd: "5 - 7'",
        gv: "- GV ổn định tổ chức, phổ biến mục tiêu tiết 16: Ôn vươn thở, học động tác Tay.\n- Cho lớp chạy nhẹ nhàng và khởi động xoay kỹ các khớp.",
        hs: "- Cán sự tập hợp 4 hàng ngang báo cáo sĩ số.\n- Khởi động đồng loạt theo cán sự nhịp nhàng.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình khởi động 4 hàng ngang'
      },
      {
        content: "2. Hình thành kiến thức mới:\n2.1. Ôn động tác Vươn thở (1-2 lần).\n2.2. Học mới Động tác Tay:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Hai tay đưa ra trước vỗ vào nhau ngang tầm ngực, phát ra tiếng kêu dứt khoát.\n- Nhịp 3: Như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng bước chân phải.",
        lvd: "6 - 8'",
        gv: "- Cho lớp ôn lại động tác vươn thở.\n- GV thị phạm động tác tay chuẩn xác, phân tích tư thế hai tay dang ngang bằng vai lòng bàn tay ngửa.\n- Hô nhịp chậm hướng dẫn HS bắt chước từng nhịp.",
        hs: "- Quan sát kỹ mẫu GV và tranh ảnh SGK.\n- Bắt chước thực hiện động tác tay dứt khoát, tay vỗ ngang ngực.",
        contentImgUrl: '/assets/sgk_chuan/k1_tay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Tay (SGK GDTC Lớp 1)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu'
      },
      {
        content: "3. Luyện tập:\n3.1. Tập đồng loạt liên hoàn Vươn thở + Tay.\n3.2. Tập theo 4 tổ tại 4 khu vực sân.\n3.3. Tập cặp đôi sửa sai.\n3.4. Thi đua giữa các tổ.",
        lvd: "14 - 15'",
        gv: "- Điều hành lớp tập liên hoàn 2 động tác.\n- Đi kiểm tra 4 tổ, uốn nắn lỗi tay buông thấp hoặc trùng gối.\n- Tổ chức biểu diễn thi đua chấm điểm khích lệ.",
        hs: "- Cán sự hô nhịp cả lớp tập luyện.\n- Về vị trí tổ luyện tập tích cực, nghiêm túc.\n- Cặp đôi giúp nhau kiểm tra lòng bàn tay ngửa đúng cách.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.5. Trò chơi vận động: \"Chạy tiếp sức ném bóng vào rổ\"\n- Rèn luyện sức bật, khéo léo và tốc độ.",
        lvd: "4 - 5'",
        gv: "- Chuẩn bị dụng cụ bóng và rổ, hướng dẫn cách chơi an toàn.\n- Tổ chức thi đấu giữa 4 hàng dọc tiếp sức hào hứng.",
        hs: "- 4 tổ xếp hàng dọc tham gia thi đấu hết mình, cổ vũ bạn văn minh.",
        hsImgUrl: standardFormationDiagrams[7].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình trò chơi vận động'
      },
      {
        content: "4. Vận dụng & Hồi tĩnh:\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng các khớp tay, khớp gối.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), nhận xét tinh thần tiết học và phát lệnh xuống lớp.",
        hs: "- Thả lỏng toàn thân theo nhịp điều hòa.\n- Trả lời câu hỏi vận dụng sách giáo khoa, chào cô/thầy và giải tán hô to: \"KHỎE!\"",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k2_t15: {
    id: 'k2_t15',
    grade: 2,
    week: 8,
    lessonNum: 15,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 1)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện động tác Vươn thở (SGK GDTC Lớp 2).',
      basicMovement: 'Thực hiện được động tác Vươn thở theo nhịp hô và biết phối hợp nhịp thở đều đặn trong tập luyện.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 2, học liệu số hoặc động tác mẫu của GV; biết tự điều chỉnh tư thế khi luyện tập.',
      disabledStudents: 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, thực hiện ở mức độ cơ bản, vừa sức.'
    },
    generalCompetencies: {
      autonomy: 'Chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập và tự sửa lỗi sai theo hướng dẫn.',
      collaboration: 'Biết phối hợp với bạn, tổ/nhóm; chấp hành phân công, hỗ trợ bạn trong tập luyện và tham gia trò chơi.',
      problemSolving: 'Biết quan sát, nhận xét lỗi sai thường gặp khi vươn tay hít thở và lựa chọn cách thực hiện đúng.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện hoàn thành nhiệm vụ học tập.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét trung thực kết quả luyện tập.',
      responsibility: 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn.',
      disabledStudents: 'Hoà đồng, tích cực tham gia các hoạt động cùng tập thể.'
    },
    integrations: {
      digitalSkill: '3.1TC1a',
      digitalDescription: 'Học sinh quan sát tranh ảnh động tác số chuẩn SGK Lớp 2 và sắp xếp đúng thứ tự nhịp hít thở.',
      lifeSkills: 'Rèn ý thức tổ chức kỷ luật, chờ đến lượt, góp ý tích cực cho bạn.'
    },
    locationEquipment: {
      location: 'Sân trường bằng phẳng, sạch sẽ, an toàn.',
      teacherTools: 'Tranh ảnh động tác SGK GDTC Lớp 2, còi thể thao, thiết bị phát âm thanh, vạch kẻ sân chơi.',
      studentTools: 'SGK, trang phục thể thao gọn gàng, giày ba-ta vừa chân.'
    },
    rows: [
      {
        content: "1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe của HS.\n- Phổ biến nội dung tiết 15: Học động tác Vươn thở.\n1.2. Khởi động:\n- Xoay kỹ các khớp cổ tay, cổ chân, vai, hông, đầu gối (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: \"Đua ngựa\".",
        lvd: "5 - 7'\n2L x 8N",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe HS, phổ biến mục tiêu bài học.\n- Hướng dẫn cán sự điều khiển xoay kỹ các khớp đúng biên độ.\n- Tổ chức trò chơi bổ trợ khởi động \"Đua ngựa\" sôi nổi, đảm bảo an toàn.",
        hs: "- Cán sự tập hợp 4 hàng ngang báo cáo sĩ số.\n- Toàn lớp khởi động đều đặn và hào hứng tham gia trò chơi \"Đua ngựa\".",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_dua_ngua.svg',
        contentImgTitle: 'Trò chơi bổ trợ khởi động: Đua ngựa - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_nhan_lop') || standardFormationDiagrams[0]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình nhận lớp & khởi động nhịp nhàng'
      },
      {
        content: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Hình thành động tác Vươn thở (SGK GDTC Lớp 2):\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa lên cao chếch chữ V, lòng bàn tay hướng vào nhau, ngửa đầu, hít vào sâu bằng mũi.\n- Nhịp 2: Hai tay đưa xuống bắt chéo trước bụng, cúi đầu nhẹ, thở ra từ từ.\n- Nhịp 3: Như nhịp 1, hít vào sâu.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Đổi chân phải bước sang ngang.",
        lvd: "6 - 8'\n2 - 3 lần",
        gv: "- GV giới thiệu Động tác Vươn thở (SGK Lớp 2 Trang 28), làm mẫu chuẩn xác 2-3 lần theo chiều gương.\n- Cho HS quan sát hình ảnh kỹ thuật SGK Lớp 2, phân tích rõ nhịp hít vào - thở ra và sửa lỗi cúi đầu quá thấp.",
        hs: "- Đội hình 4 hàng ngang so le quan sát mẫu GV và hình ảnh SGK Lớp 2.\n- Tập mô phỏng từng nhịp theo nhịp hô chậm của thầy cô.",
        contentImgUrl: '/assets/sgk_chuan/k2_vuon_tho.svg',
        contentImgTitle: 'Động tác Vươn thở - SGK GDTC Lớp 2 (Trang 28)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình quan sát mẫu & tranh SGK'
      },
      {
        content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp: Toàn lớp tập động tác Vươn thở theo nhịp hô GV (2-3 lần).\n3.2. Tập theo tổ nhóm: 4 tổ về 4 khu vực sân tập, tổ trưởng điều hành.\n3.3. Tập cặp đôi sửa sai & Thi đua giữa các tổ.",
        lvd: "14 - 16'\n2-3 lần",
        gv: "- GV điều hành tập đồng loạt, chuyển sang luyện tập theo 4 tổ và cặp đôi đối diện sửa sai.\n- Quan sát, động viên và nhận xét thi đua giữa các tổ.",
        hs: "- Tập trung luyện tập đồng loạt, theo tổ và cặp đôi sửa lỗi nhịp thở cho bạn.\n- Tự tin biểu diễn thi đua giữa các tổ.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình tập luyện theo tổ 4 góc sân'
      },
      {
        content: "3.4. Trò chơi vận động: \"Tìm người chỉ huy\"\n- Rèn luyện khả năng quan sát tinh anh, phản xạ nhanh và tinh thần tập thể.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- GV nêu tên trò chơi, hướng dẫn luật chơi an toàn theo đội hình vòng tròn và tổ chức chơi công bằng.",
        hs: "- Đội hình vòng tròn hào hứng tham gia trò chơi \"Tìm người chỉ huy\" đúng luật.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_tim_chi_huy.svg',
        contentImgTitle: 'Trò chơi vận động: Tìm người chỉ huy - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tro_choi') || standardFormationDiagrams[7]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình trò chơi vận động'
      },
      {
        content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh: Thả lỏng toàn thân, hít thở sâu.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT thu dọn dụng cụ, giữ vệ sinh sân tập.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng nhẹ nhàng, nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có).\n- Nhận xét tiết học và phát lệnh xuống lớp.",
        hs: "- Thả lỏng tay chân, trả lời câu hỏi vận dụng sách giáo khoa, thu dọn sân tập và xếp hàng về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_hoi_tinh') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình hồi tĩnh và nhận xét cuối giờ'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k2_t16: {
    id: 'k2_t16',
    grade: 2,
    week: 8,
    lessonNum: 16,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 2)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết vệ sinh cá nhân, trang phục thể thao và khởi động kỹ các khớp trước khi tập luyện.',
      basicMovement: 'Thực hiện được Động tác Tay kết hợp ôn tập liên hoàn Động tác Vươn thở (SGK GDTC Lớp 2).',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 2, tự sửa lỗi tư thế cánh tay ngang vai và vỗ tay đúng nhịp.',
      disabledStudents: 'Áp dụng học hòa nhập, thực hiện động tác tay ở mức cơ bản.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác ôn lại động tác vươn thở và chuẩn bị tốt trước khi học động tác tay.',
      collaboration: 'Phối hợp nhịp nhàng với bạn trong tập luyện theo cặp đôi và theo tổ.',
      problemSolving: 'Phát hiện lỗi tay bị chùng hoặc vỗ tay lệch nhịp để tự điều chỉnh.',
      disabledStudents: 'Được bạn hỗ trợ và động viên kịp thời.'
    },
    qualities: {
      diligence: 'Chăm chỉ, tích cực luyện tập liên hoàn hai động tác.',
      honesty: 'Trung thực khi tham gia trò chơi vận động và nhận xét tổ bạn.',
      responsibility: 'Giữ an toàn cự ly 1 sải tay, bảo quản sân bãi sạch sẽ.',
      disabledStudents: 'Đoàn kết, hòa đồng cùng bạn bè.'
    },
    integrations: {
      digitalSkill: '3.1TC1a',
      digitalDescription: 'Học sinh ghép nối đúng trình tự hình ảnh số Động tác Vươn thở và Động tác Tay.',
      lifeSkills: 'Hình thành thói quen tập thể dục buổi sáng nâng cao sức khỏe.'
    },
    locationEquipment: {
      location: 'Sân trường thoáng mát, bằng phẳng, an toàn.',
      teacherTools: 'Tranh ảnh SGK GDTC Lớp 2, còi thể thao, loa phát nhạc.',
      studentTools: 'SGK, trang phục thể thao, giày ba-ta vừa chân.'
    },
    rows: [
      {
        content: "1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, sức khỏe HS.\n1.2. Khởi động chung xoay các khớp theo nhạc.\n1.3. Trò chơi bổ trợ khởi động: \"Đua ngựa\".",
        lvd: "5 - 7'\n2L x 8N",
        gv: "- GV nhận lớp, phổ biến mục tiêu tiết 16: Học mới Động tác Tay, ôn Động tác Vươn thở.\n- Hướng dẫn khởi động các khớp và tổ chức trò chơi \"Đua ngựa\" tạo hưng phấn.",
        hs: "- Cán sự tập hợp 4 hàng ngang báo cáo sĩ số.\n- Khởi động đều đặn và tham gia trò chơi sôi nổi.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_dua_ngua.svg',
        contentImgTitle: 'Trò chơi bổ trợ khởi động: Đua ngựa - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_khoi_dong') || standardFormationDiagrams[1]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình khởi động 4 hàng ngang'
      },
      {
        content: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Ôn Động tác Vươn thở (1-2 lần).\n2.2. Học mới Động tác Tay (SGK GDTC Lớp 2 Trang 29):\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái sang ngang rộng bằng vai, hai tay đưa ra trước song song ngang vai.\n- Nhịp 2: Đưa hai tay lên cao vỗ vào nhau trên đỉnh đầu.\n- Nhịp 3: Hạ hai tay dang ngang bằng vai, lòng bàn tay sấp.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Đổi chân phải thực hiện tương tự.",
        lvd: "6 - 8'\n2 - 3 lần",
        gv: "- Cho lớp ôn lại Động tác Vươn thở 1 lần.\n- GV thị phạm Động tác Tay chuẩn xác theo SGK Lớp 2, phân tích độ thẳng cánh tay và nhịp vỗ tay trên đầu.\n- Hô nhịp chậm điều khiển HS tập mô phỏng.",
        hs: "- Quan sát kỹ mẫu GV và hình ảnh SGK Lớp 2.\n- Tập trung thực hiện đúng từng nhịp động tác tay, giữ lưng thẳng.",
        contentImgUrl: '/assets/sgk_chuan/k2_tay.svg',
        contentImgTitle: 'Động tác Tay - SGK GDTC Lớp 2 (Trang 29)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình quan sát mẫu'
      },
      {
        content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt liên hoàn Động tác Vươn thở + Động tác Tay.\n3.2. Tập theo 4 tổ & Cặp đôi đối diện sửa sai.\n3.3. Thi đua trình diễn giữa các tổ.",
        lvd: "14 - 16'\n2-3 lần",
        gv: "- Điều hành lớp ghép liên hoàn 2 động tác theo nhịp hô dứt khoát.\n- Kiểm tra 4 tổ, sửa lỗi tay chùng và tổ chức thi đua tuyên dương.",
        hs: "- Tập luyện đồng loạt, theo tổ và cặp đôi giúp nhau sửa biên độ tay thẳng.\n- Tự tin trình diễn thi đua giữa các tổ.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.4. Trò chơi vận động: \"Tìm người chỉ huy\"\n- Phát triển sự nhanh nhẹn, chú ý và tinh thần đồng đội.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- Phổ biến lại luật chơi, chọn chỉ huy mới cho từng lượt để tăng tính hấp dẫn và an toàn.",
        hs: "- Tham gia trò chơi hào hứng, trung thực và trật tự.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_tim_chi_huy.svg',
        contentImgTitle: 'Trò chơi vận động: Tìm người chỉ huy - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tro_choi') || standardFormationDiagrams[7]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình trò chơi vận động'
      },
      {
        content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng nhẹ nhàng, nêu câu hỏi vận dụng sách giáo khoa, nhận xét và phát lệnh xuống lớp.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa và giải tán trật tự.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_xuong_lop') || standardFormationDiagrams[8]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình hồi tĩnh'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k3_t15: {
    id: 'k3_t15',
    grade: 3,
    week: 8,
    lessonNum: 15,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 4: ĐỘNG TÁC ĐI ĐỀU, ĐỨNG LẠI (Tiết 3)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; thực hiện các yêu cầu an toàn trước, trong và sau khi tập luyện nội dung đi đều, đứng lại.',
      basicMovement: 'Thực hiện được động tác đi đều, đứng lại theo hướng dẫn của GV; biết xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video hoặc động tác mẫu của GV về động tác đi đều, đứng lại; biết tự điều chỉnh động tác khi luyện tập.',
      disabledStudents: 'Linh hoạt hỗ trợ cho HS hòa nhập đi theo nhịp đơn giản.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị trang phục, tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp hàng lối với bạn, tổ/nhóm; chấp hành phân công chỉ huy của tổ trưởng.',
      problemSolving: 'HS biết quan sát, phát hiện bước chân sai nhịp và tự đổi chân kịp thời.',
      disabledStudents: 'Tạo cơ hội tham gia theo khả năng.'
    },
    qualities: {
      diligence: 'Tích cực, kiên trì tập luyện bước chân dứt khoát.',
      honesty: 'Thực hiện đúng hiệu lệnh, nhận xét kết quả trung thực.',
      responsibility: 'Giữ hàng lối ngay ngắn, không chen lấn xô đẩy.',
      disabledStudents: 'Tương thân tương ái, hỗ trợ nhau cùng tiến bộ.'
    },
    integrations: {
      digitalSkill: 'Ứng dụng hình ảnh video trực quan',
      digitalDescription: 'Quan sát sơ đồ di chuyển đi đều trên màn hình/tranh vẽ SGK.',
      lifeSkills: 'Tác phong kỷ luật quân sự hóa học sinh, đi đứng ngay ngắn, đĩnh đạc.',
      trafficSafety: 'Tích hợp ATGT: Đi bộ trên vỉa hè, sang đường đúng quy định, tuân thủ tín hiệu đèn giao thông.'
    },
    locationEquipment: {
      location: 'Sân trường rộng, kẻ sẵn đường biên đi đều.',
      teacherTools: 'Còi thể thao, cờ chỉ huy, loa trợ giảng.',
      studentTools: 'Giày thể thao, trang phục đúng quy định.'
    },
    rows: [
      {
        content: "1. Mở đầu:\n1.1. Nhận lớp, kiểm tra tác phong, sức khỏe.\n1.2. Khởi động xoay các khớp, chạy bước nhỏ tại chỗ.\n1.3. Trò chơi khởi động: \"Đứng ngồi theo hiệu lệnh\".",
        lvd: "5 - 7'",
        gv: "- GV nhận lớp, quán triệt kỷ luật đội ngũ.\n- Phổ biến yêu cầu tiết 15: Nâng cao kỹ thuật đi đều, bước dứt khoát, giữ thẳng hàng.",
        hs: "- Cán sự tập trung 4 hàng dọc chuyển 4 hàng ngang báo cáo sĩ số.\n- Khởi động đồng loạt nghiêm túc.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình nhận lớp'
      },
      {
        content: "2. Kiến thức mới & Khám phá:\n- Kỹ thuật Đi đều và Đứng lại:\n+ Khẩu lệnh dự lệnh: \"Đi đều...\", động lệnh: \"BƯỚC!\".\n+ Nhịp 1: Chân trái bước tới trước tiếp đất bằng gót rồi đến cả bàn chân, tay phải đánh ra trước gập vuông góc, tay trái đánh ra sau.\n+ Nhịp 2: Chân phải bước tới, đổi chiều đánh tay.\n+ Khẩu lệnh \"Đứng lại... ĐỨNG!\": Rơi vào chân phải, bước tiếp nhịp 1 chân trái, nhịp 2 chân phải rồi thu chân trái về tư thế nghiêm.",
        lvd: "7 - 8'",
        gv: "- GV làm mẫu phân tích kỹ thuật đánh tay và bước chân.\n- Nhấn mạnh quy tắc: Chân trái - Nhịp 1; Chân phải - Nhịp 2.\n- Chỉ ra lỗi sai phổ biến: Đánh tay cùng chiều chân, bước sải quá dài.",
        hs: "- Chú ý quan sát động tác mẫu của GV.\n- Tập dậm chân tại chỗ đúng nhịp đếm 1-2, 1-2 trước khi bước đi đều.",
        contentImgUrl: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Đi đều, Đứng lại (SGK GDTC Lớp 3)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu'
      },
      {
        content: "3. Luyện tập:\n3.1. Tập đi đều đồng loạt cả lớp theo nhịp còi GV.\n3.2. Tập theo 4 tổ đi đều vòng quanh sân.\n3.3. Thi đua giữa các tổ: Đi đều 10m - Đứng lại.",
        lvd: "15 - 16'",
        gv: "- GV chỉ huy cả lớp đi đều, quan sát giữ cự ly hàng dọc và hàng ngang.\n- Phân công tổ trưởng điều khiển tổ mình tập luyện.\n- GV đi từng tổ uốn nắn, sửa lỗi bước chân lệch nhịp.",
        hs: "- Các tổ luyện tập tích cực, hô khẩu lệnh to rõ, bước chân đều tăm tắp.\n- Thi đua trình diễn giữa các tổ với tinh thần kỷ luật cao.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.5. Trò chơi vận động: \"Chạy tiếp sức nhanh như chớp\"\n- Phát triển tốc độ và sức mạnh đôi chân.",
        lvd: "4 - 5'",
        gv: "- Kẻ 4 làn chạy, phổ biến luật chơi tiếp sức an toàn.",
        hs: "- Tham gia hào hứng, tuân thủ vạch xuất phát, cổ vũ nhiệt tình.",
        hsImgUrl: standardFormationDiagrams[7].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình trò chơi vận động'
      },
      {
        content: "4. Vận dụng & Hồi tĩnh:\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp ATGT: Rèn thói quen đi bộ ngay ngắn, tuân thủ luật đường bộ.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng sâu, nêu câu hỏi vận dụng sách giáo khoa và liên hệ an toàn khi tham gia giao thông.\n- Khen ngợi tổ đi đều chuẩn xác nhất và phát lệnh xuống lớp.",
        hs: "- Thả lỏng tay chân, trả lời câu hỏi vận dụng sách giáo khoa và giải tán về lớp.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k5_t15: {
    id: 'k5_t15',
    grade: 5,
    week: 8,
    lessonNum: 15,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN VỚI GẬY (Tiết 1)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết thực hiện vệ sinh sân tập, vệ sinh cá nhân, kiểm tra dụng cụ gậy thể dục an toàn.',
      basicMovement: 'Biết khẩu lệnh và thực hiện được các động tác vươn thở, tay, chân với gậy thể dục.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, khám phá cách cầm gậy và tập luyện phối hợp nhịp nhàng.',
      disabledStudents: 'Giảm nhẹ yêu cầu, tập ở mức độ cơ bản với gậy nhẹ.'
    },
    generalCompetencies: {
      autonomy: 'Tự xem trước các động tác với gậy trong SGK; tự giác chuẩn bị dụng cụ.',
      collaboration: 'Biết phân công, phối hợp trong nhóm giữ khoảng cách an toàn khi tập với gậy.',
      problemSolving: 'Nhận biết các lỗi cầm gậy lệch tâm hoặc vung gậy nguy hiểm để phòng tránh.',
      disabledStudents: 'Hòa nhập cùng các bạn trong tổ.'
    },
    qualities: {
      diligence: 'Chăm chỉ luyện tập các động tác với dụng cụ.',
      honesty: 'Trung thực khi chơi trò chơi, bảo quản dụng cụ chung.',
      responsibility: 'Có ý thức giữ an toàn tuyệt đối cho bạn xung quanh khi cầm gậy.',
      disabledStudents: 'Đoàn kết, tôn trọng và yêu thương.'
    },
    integrations: {
      digitalSkill: '1.1TC1a',
      digitalDescription: 'Ứng dụng học liệu số, tra cứu video hướng dẫn bài tập với gậy chuẩn trên thiết bị dạy học.',
      lifeSkills: 'Rèn luyện tính cẩn thận, ngăn nắp khi quản lý và cất dọn dụng cụ thể thao sau giờ học.'
    },
    locationEquipment: {
      location: 'Sân trường rộng, bằng phẳng, sạch sẽ.',
      teacherTools: 'Gậy thể dục mẫu (dài 1m-1m2, nhẵn bóng), tranh ảnh SGK, còi.',
      studentTools: 'Mỗi học sinh 1 gậy thể dục theo kích cỡ tiêu chuẩn tiểu học, giày thể thao.'
    },
    rows: [
      {
        content: "1. Mở đầu:\n1.1. Nhận lớp, kiểm tra gậy thể dục (đảm bảo gậy trơn nhẵn, không nứt gãy, an toàn).\n1.2. Khởi động xoay các khớp kết hợp nâng gậy nhẹ nhàng.\n1.3. Trò chơi khởi động: \"Ai nhanh hơn với gậy\".",
        lvd: "5 - 7'",
        gv: "- GV nhận lớp, kiểm tra độ an toàn của từng chiếc gậy thể dục.\n- Quán triệt quy định an toàn tuyệt đối: Tuyệt đối không được đấu gậy hay vung gậy bừa bãi.",
        hs: "- Mỗi HS cầm gậy dựng thẳng bên chân phải, tập trung 4 hàng ngang cự ly giãn cách.\n- Khởi động theo sự hướng dẫn của cán sự.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình nhận lớp với gậy thể dục'
      },
      {
        content: "2. Khám phá & Hình thành kiến thức mới:\n2.1. Động tác Vươn thở với gậy:\n- Nhịp 1: Chân trái bước sang ngang, hai tay nâng gậy lên cao chếch chữ V, ngửa đầu, hít sâu.\n- Nhịp 2: Hạ gậy xuống ngang ngực rồi xuống dưới đùi, thở ra.\n2.2. Động tác Tay với gậy:\n- Nhịp 1: Nâng gậy ra trước ngang vai, thân thẳng.\n- Nhịp 2: Nâng gậy lên cao qua đầu.\n- Nhịp 3: Đưa gậy về ngang vai. Nhịp 4: Về TTCB.\n2.3. Động tác Chân với gậy:\n- Nhịp 1: Kiễng gót hai chân, nâng gậy ngang vai.\n- Nhịp 2: Khuỵu gối, đưa gậy ra trước song song mặt đất.",
        lvd: "8 - 10'",
        gv: "- GV làm mẫu phân tích kỹ thuật cầm hai đầu gậy chắc chắn, thẳng tay.\n- Cho HS quan sát hình vẽ SGK lớp 5 trang 15-16.\n- Hướng dẫn HS thực hiện từng động tác với tốc độ chậm, nhắc nhở giữ thăng bằng.",
        hs: "- Đội hình 4 hàng ngang so le cự ly rộng 1.5m.\n- Chú ý quan sát và làm theo mẫu GV, giữ chắc gậy.",
        contentImgUrl: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vươn thở, Tay với gậy (SGK GDTC Lớp 5)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu'
      },
      {
        content: "3. Luyện tập:\n3.1. Tập đồng loạt cả 3 động tác liên hoàn với gậy theo nhịp trống.\n3.2. Tập luyện theo 4 tổ tại 4 góc sân bãi.\n3.3. Tập cặp đôi kiểm tra tư thế gậy song song.\n3.4. Thi đua giữa các tổ.",
        lvd: "14 - 15'",
        gv: "- Gõ nhịp trống dứt khoát điều khiển lớp tập đồng loạt.\n- Luân chuyển tới từng tổ uốn nắn tay cầm gậy không bị so le.\n- Tổ chức thi đua khen ngợi tổ có động tác đều, thẳng gậy đẹp mắt.",
        hs: "- Các tổ luyện tập nghiêm túc, tổ trưởng hô nhịp dứt khoát.\n- Giữ khoảng cách an toàn, không để đầu gậy va chạm vào bạn.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.5. Trò chơi vận động: \"Chuyền gậy tiếp sức\"\n- Rèn luyện khéo léo, nhanh nhẹn và tinh thần đồng đội.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn kỹ thuật chuyền và nhận gậy an toàn không bị rơi.\n- Điều hành 4 tổ thi đấu tiếp sức có thưởng phạt vui nhộn.",
        hs: "- 4 hàng dọc tham gia thi đấu hào hứng, cẩn thận và nhanh nhẹn.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: standardFormationDiagrams[8].name
      },
      {
        content: "4. Vận dụng & Hồi tĩnh:\n4.1. Hồi tĩnh: Thả lỏng khớp vai, cổ tay và chân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Xếp gậy gọn gàng vào giá dụng cụ thể thao.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa; hướng dẫn tổ trưởng thu gậy và xếp ngay ngắn vào giỏ đựng đồ dùng.\n- Tuyên dương tinh thần trách nhiệm giữ gìn dụng cụ của lớp và phát lệnh xuống lớp.",
        hs: "- Thả lỏng sâu theo điệu nhạc nhẹ.\n- Quan sát ảnh, trả lời câu hỏi vận dụng sách giáo khoa; tự giác cất gậy trật tự, xếp hàng giải tán về lớp.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh và cất dụng cụ'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k3_t16: {
    id: 'k3_t16',
    grade: 3,
    week: 8,
    lessonNum: 16,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 4: ĐỘNG TÁC ĐI ĐỀU, ĐỨNG LẠI (Tiết 4 - Ôn động tác Đi đều, Đứng lại)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân bãi; thực hiện các quy định an toàn trước, trong và sau khi tập luyện nội dung động tác đi đều, đứng lại.',
      basicMovement: 'Thực hiện thuần thục động tác đi đều, đứng lại theo khẩu lệnh của GV; biết xử lí một số tình huống đơn giản khi sai nhịp bước chân.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video bài học hoặc động tác mẫu của GV; biết tự so sánh và điều chỉnh nhịp bước chân của mình theo tổ.',
      disabledStudents: 'Linh hoạt hỗ trợ cho HS hòa nhập đi theo nhịp đếm đơn giản, vui vẻ cùng bạn.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị trang phục thể thao cá nhân; tự giác ôn luyện nhịp đếm dậm chân và đi đều; tự sửa lỗi bước chân theo hướng dẫn.',
      collaboration: 'HS biết phối hợp nhịp bước chân với bạn trong hàng dọc, hàng ngang; chấp hành phân công chỉ huy của tổ trưởng; hỗ trợ bạn đi chưa đều.',
      problemSolving: 'HS biết quan sát, phát hiện bước chân sai nhịp của bản thân hoặc bạn trong tổ và áp dụng kỹ thuật đổi chân để lấy lại nhịp.',
      disabledStudents: 'Tạo cơ hội tham gia theo khả năng, phân công việc vừa sức.'
    },
    qualities: {
      diligence: 'Tích cực, kiên trì tập luyện bước chân dứt khoát, giữ thẳng hàng dọc và hàng ngang.',
      honesty: 'Thực hiện đúng hiệu lệnh chỉ huy, nhận xét kết quả tập luyện của bản thân và bạn một cách trung thực, khách quan.',
      responsibility: 'Có ý thức bảo đảm an toàn cho bản thân và bạn trong khi di chuyển theo cự ly; giữ gìn vệ sinh chung của sân bãi.',
      disabledStudents: 'Tương thân tương ái, đoàn kết hỗ trợ bạn cùng tiến bộ.'
    },
    integrations: {
      digitalSkill: '3.1TC1a',
      digitalDescription: 'Học sinh biết quan sát sơ đồ di chuyển hàng ngũ trực quan trên thiết bị số hoặc tranh vẽ SGK để định hình bước đi.',
      lifeSkills: 'HS biết lắng nghe hiệu lệnh, chờ đến lượt, phối hợp nhịp nhàng với nhóm và dùng lời nhắc nhở lịch sự khi hỗ trợ bạn sửa đội hình.',
      trafficSafety: 'Tích hợp ATGT: Rèn luyện thói quen đi bộ ngay ngắn trên vỉa hè, sang đường đúng quy định, tuân thủ tín hiệu đèn giao thông.',
      environmentalEducation: 'Tích hợp BVMT: Kiểm tra vệ sinh sân tập, không xả rác bừa bãi, nhặt vật gây trơn trượt bảo vệ an toàn cho lớp.'
    },
    locationEquipment: {
      location: 'Sân trường bằng phẳng, sạch sẽ, kẻ sẵn các đường biên cự ly 10m - 15m.',
      teacherTools: 'Giáo án, SGK, còi thể thao, cờ chỉ huy, tranh ảnh kỹ thuật đi đều - đứng lại.',
      studentTools: 'Trang phục thể thao gọn gàng, giày ba-ta vừa chân, bảo đảm an toàn.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, sức khỏe HS; phổ biến nội dung, yêu cầu tiết 16.\n1.2. Khởi động: Xoay các khớp cổ tay, cổ chân, vai, hông, gối (theo nhạc).\n1.3. Trò chơi khởi động: \"Mèo đuổi chuột\".",
        lvd: "6 - 8'\n2L x 8N\n3 lần",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe, kiểm tra tác phong thể thao của HS.\n- Phổ biến mục tiêu tiết 16: Ôn tập thuần thục kỹ thuật Đi đều, Đứng lại và Đổi chân khi sai nhịp.\n- Điều hành lớp khởi động xoay kỹ các khớp kết hợp chạy bước nhỏ tại chỗ.\n- Hướng dẫn luật chơi trò chơi \"Mèo đuổi chuột\" tạo tâm thế hứng khởi.",
        hs: "- Cán sự tập hợp lớp thành 4 hàng ngang cự ly hẹp, điểm số và báo cáo sĩ số cho GV.\n- Lắng nghe, ghi nhớ mục tiêu và nhiệm vụ học tập của tiết học.\n- Thực hiện bài khởi động nhịp nhàng, đúng biên độ dưới sự điều khiển của cán sự.\n- Cả lớp hào hứng tham gia trò chơi khởi động, giữ khoảng cách an toàn.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình khởi động 4 hàng ngang giãn cách 1 sải tay'
      },
      {
        content: "2. Hoạt động hình thành kiến thức & Khám phá\n- Ôn tập kỹ thuật Đi đều và Đứng lại:\n+ Khẩu lệnh \"Đi đều... BƯỚC!\": Chân trái bước nhịp 1, chân phải bước nhịp 2; tay đánh tự nhiên, tay trước gập vuông góc, tay sau thẳng.\n+ Khẩu lệnh \"Đứng lại... ĐỨNG!\": Rơi vào chân phải; bước tiếp nhịp 1 chân trái, nhịp 2 chân phải rồi thu chân trái về tư thế nghiêm.\n- Khắc phục lỗi sai: Đánh tay cùng chiều chân, bước sải chân quá dài hoặc lệch nhịp còi.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- GV thị phạm làm mẫu lại động tác chuẩn xác 2 lần kết hợp phân tích kỹ thuật đánh tay và nhịp chân.\n- Cho HS quan sát tranh ảnh SGK lớp 3 trang 27-28 chỉ rõ nhịp rơi của chân trái (nhịp 1) và chân phải (nhịp 2).\n- Nhấn mạnh quy tắc: Chân trái - Nhịp 1; Chân phải - Nhịp 2; động lệnh ĐỨNG rơi vào chân phải.\n- Hướng dẫn kỹ thuật đệm chân lướt để đổi chân khi lỡ bước sai nhịp.",
        hs: "- Đội hình 4 hàng ngang quan sát mẫu và tranh ảnh SGK.\n- Chú ý quan sát động tác thị phạm của giáo viên, ghi nhớ nhịp rơi của chân.\n- Cả lớp dậm chân tại chỗ theo nhịp đếm 1-2, 1-2 để củng cố nhịp điệu trước khi bước đi đều.\n- Mạnh dạn nêu câu hỏi thắc mắc về cách đổi chân khi bước sai nhịp.",
        contentImgUrl: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp (SGK GDTC Lớp 3)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu của GV'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt cả lớp: Đi đều theo nhịp còi GV (10 - 15m).\n3.2. Tập theo 4 tổ tại 4 khu vực sân bãi.\n3.3. Tập cặp đôi đối diện sửa sai.\n3.4. Thi đua giữa các tổ: Đi đều 15m - Đứng lại chuẩn xác.",
        lvd: "15 - 16'\n2-3 lần\n3-4 lần\n2-3 lần\n1 lần",
        gv: "- Điều hành cả lớp đi đều đồng loạt theo nhịp còi, uốn nắn hàng ngũ ngay ngắn.\n- Phân 4 tổ về 4 góc sân bãi, giao quyền cho tổ trưởng chỉ huy và đếm nhịp.\n- Luân chuyển giữa các tổ quan sát, uốn nắn tay đánh vuông góc, sửa lỗi bước lệch nhịp.\n- Hướng dẫn tập cặp đôi: 1 bạn đi, 1 bạn quan sát đếm nhịp và sửa sai.\n- Tổ chức biểu diễn thi đua giữa các tổ, nhận xét và tuyên dương tổ đi đều đẹp nhất.",
        hs: "- Cả lớp đi đều đồng loạt theo hiệu lệnh còi, giữ đúng cự ly hàng dọc và hàng ngang.\n- Chuyển về khu vực tổ, tổ trưởng hô to rõ ràng: \"Đi đều... BƯỚC!\", \"Một - hai, một - hai\".\n- Từng cặp đổi vai quan sát và nhắc nhở nhau sửa lỗi đánh tay cùng bên chân.\n- Từng tổ lên biểu diễn tự tin với tinh thần đồng đội cao; các tổ ngồi xem nhận xét chân thành.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm 4 khu vực'
      },
      {
        content: "3.5. Trò chơi vận động: \"Chạy theo hình tam giác\"\n- Rèn luyện phản xạ nhanh, sức bật, độ khéo léo và tinh thần tập thể.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- GV nêu tên trò chơi, hướng dẫn cách di chuyển theo các đỉnh hình tam giác.\n- Tổ chức cho HS chơi thử 1 lần, sau đó chơi chính thức có thi đua tính điểm.\n- Tích hợp KNS: Nhắc HS chờ đến lượt, tôn trọng vạch xuất phát và bảo đảm an toàn.",
        hs: "- Đội hình hàng dọc sẵn sàng tại các góc tam giác.\n- Nắm vững luật chơi, tham gia thi đấu hào hứng, nhanh nhẹn và cổ vũ văn minh.",
        hsImgUrl: standardFormationDiagrams[7].svgDataUrl,
        hsImgTitle: standardFormationDiagrams[7].name
      },
      {
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng toàn thân (theo điệu nhạc nhẹ).\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp ATGT và giữ vệ sinh sân tập.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Điều hành lớp thực hiện bài tập thả lỏng sâu, điều hòa nhịp thở.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- Tích hợp ATGT: Nhắc nhở HS luôn đi bộ trật tự trên vỉa hè, không đùa giỡn dưới lòng đường.\n- Nhận xét ưu điểm tiết học và phát lệnh xuống lớp.",
        hs: "- Đội hình hàng ngang thả lỏng tay chân, hít sâu thở đều theo hướng dẫn.\n- Quan sát hình ảnh, trả lời câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT: Kiểm tra vệ sinh khu vực sân tập, nhặt rác và vật nguy hiểm.\n- Lắng nghe nhận xét chung; giải tán đồng thanh hô to: \"KHỎE!\".",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh và nhận xét cuối giờ'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k4_t15: {
    id: 'k4_t15',
    grade: 4,
    week: 8,
    lessonNum: 15,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY VỚI VÒNG THỂ DỤC (Tiết 1)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết vệ sinh sân tập, vệ sinh cá nhân và kiểm tra độ an toàn của vòng thể dục trước khi tập luyện.',
      basicMovement: 'Biết khẩu lệnh và thực hiện được Động tác Vươn thở với vòng thể dục đúng nhịp thở và biên độ.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 4 Trang 26 và động tác mẫu của GV; tự sửa lỗi cầm vòng.',
      disabledStudents: 'Giảm nhẹ yêu cầu biên độ nâng vòng, thực hiện ở mức độ cơ bản, an toàn.'
    },
    generalCompetencies: {
      autonomy: 'Chủ động chuẩn bị vòng thể dục, trang phục thể thao; tự giác luyện tập theo hướng dẫn.',
      collaboration: 'Phối hợp giữ khoảng cách an toàn 1.5m khi tập với vòng; hỗ trợ bạn trong tổ/nhóm.',
      problemSolving: 'Nhận biết và tự điều chỉnh khi cầm vòng lệch tâm hoặc thở ngược nhịp.',
      disabledStudents: 'Hòa nhập vui vẻ cùng các bạn trong tổ.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác luyện tập bài thể dục với dụng cụ vòng.',
      honesty: 'Trung thực trong trò chơi tiếp sức và đánh giá bạn.',
      responsibility: 'Có ý thức giữ gìn dụng cụ vòng thể dục và bảo đảm an toàn chung.',
      disabledStudents: 'Đoàn kết, giúp đỡ bạn cùng tiến bộ.'
    },
    integrations: {
      digitalSkill: '3.1TC2a',
      digitalDescription: 'Học sinh quan sát tranh ảnh kỹ thuật số cầm vòng thể dục chuẩn xác và đối chiếu tư thế bản thân.',
      lifeSkills: 'Rèn luyện tác phong gọn gàng, ý thức an toàn dụng cụ và tinh thần đồng đội.',
      environmentalEducation: 'Thu dọn và xếp vòng thể dục gọn gàng đúng nơi quy định sau giờ học.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất bằng phẳng, sạch sẽ.',
      teacherTools: 'Kế hoạch bài dạy, SGK GDTC Lớp 4, còi, tranh ảnh động tác với vòng, vòng thể dục mẫu.',
      studentTools: 'Mỗi HS 1 vòng thể dục an toàn, trang phục thể thao, giày vừa chân.'
    },
    rows: [
      {
        content: "1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, sức khỏe và vòng thể dục của HS.\n1.2. Khởi động xoay các khớp kết hợp xoay vòng nhẹ nhàng.\n1.3. Trò chơi bổ trợ khởi động: \"Chuyền vòng tiếp sức\".",
        lvd: "5 - 7'\n2L x 8N",
        gv: "- GV nhận lớp, kiểm tra độ an toàn vòng thể dục và phổ biến mục tiêu tiết 15: Học Động tác Vươn thở với vòng thể dục.\n- Điều hành khởi động kỹ các khớp và tổ chức trò chơi bổ trợ \"Chuyền vòng tiếp sức\" an toàn.",
        hs: "- Cán sự tập hợp 4 hàng ngang giãn cách 1.5m báo cáo sĩ số.\n- Khởi động đều đặn và hào hứng tham gia trò chơi \"Chuyền vòng tiếp sức\".",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_nhan_lop') || standardFormationDiagrams[0]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình nhận lớp linh hoạt với vòng thể dục'
      },
      {
        content: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Học Động tác Vươn thở với vòng thể dục (SGK GDTC Lớp 4 Trang 26):\n- TTCB: Đứng nghiêm, hai tay cầm hai bên mép vòng trước đùi.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa vòng lên cao chếch trước, ngửa đầu, hít vào sâu.\n- Nhịp 2: Hạ hai tay đưa vòng về trước bụng, cúi đầu nhẹ, thở ra từ từ.\n- Nhịp 3: Như nhịp 1 (hít vào).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Đổi chân phải thực hiện tương tự.",
        lvd: "6 - 8'\n2 - 3 lần",
        gv: "- GV làm mẫu chuẩn xác 2-3 lần theo chiều gương kết hợp phân tích cách cầm hai bên mép vòng.\n- Cho HS quan sát hình ảnh kỹ thuật SGK Lớp 4 Trang 26, sửa lỗi cầm vòng lệch hoặc thở ngược nhịp.",
        hs: "- Đội hình 4 hàng ngang giãn cách 1.5m quan sát mẫu GV và tranh SGK Lớp 4.\n- Tập mô phỏng từng nhịp với vòng theo nhịp đếm chậm.",
        contentImgUrl: '/assets/sgk_chuan/k4_vuon_tho_vong.svg',
        contentImgTitle: 'Động tác Vươn thở với vòng thể dục - SGK GDTC Lớp 4 (Trang 26)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình quan sát làm mẫu với vòng'
      },
      {
        content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp theo nhịp hô GV.\n3.2. Tập theo 4 tổ tại 4 khu vực sân bãi.\n3.3. Tập cặp đôi sửa sai & Thi đua giữa các tổ.",
        lvd: "15 - 16'\n2-3 lần",
        gv: "- Điều hành tập đồng loạt, chuyển sang luyện tập theo 4 tổ và cặp đôi kiểm tra cách cầm vòng.\n- Quan sát nhắc nhở an toàn dụng cụ và đánh giá thi đua giữa các tổ.",
        hs: "- Tập luyện tích cực đồng loạt, theo tổ và cặp đôi; sửa lỗi cầm vòng thẳng và nhịp thở sâu.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình tập luyện 4 tổ giữ cự ly vòng'
      },
      {
        content: "3.4. Trò chơi vận động: \"Chuyền vòng tiếp sức\"\n- Rèn luyện sự khéo léo, phối hợp đồng đội và tốc độ di chuyển.",
        lvd: "4 - 5'\n2 - 3 lượt",
        gv: "- GV hướng dẫn luật chơi chi tiết, nhắc quy tắc chuyền vòng không làm rơi và đảm bảo an toàn khi chạy tiếp sức.",
        hs: "- 4 đội hàng dọc thi đấu sôi nổi, cổ vũ văn minh, phối hợp nhịp nhàng.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi vận động: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tro_choi') || standardFormationDiagrams[8]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Sơ đồ trò chơi Chuyền vòng tiếp sức'
      },
      {
        content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT thu dọn và xếp vòng đúng nơi quy định.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng nhẹ nhàng, nêu câu hỏi vận dụng sách giáo khoa và nhắc xếp vòng gọn gàng.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa, cất vòng đúng nơi quy định và về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_hoi_tinh') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình hồi tĩnh và cất vòng'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k4_t16: {
    id: 'k4_t16',
    grade: 4,
    week: 8,
    lessonNum: 16,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY VỚI VÒNG THỂ DỤC (Tiết 2)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết vệ sinh sân tập, chuẩn bị trang phục và kiểm tra độ an toàn vòng thể dục trước khi tập.',
      basicMovement: 'Thực hiện được Động tác Tay với vòng thể dục và ghép liên hoàn với Động tác Vươn thở với vòng.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 4 Trang 27, tự điều chỉnh cánh tay thẳng khi đưa vòng ra trước và qua đầu.',
      disabledStudents: 'Giảm nhẹ biên độ nâng vòng, thực hiện theo khả năng cá nhân.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác ôn tập động tác vươn thở với vòng và chuẩn bị cho động tác mới.',
      collaboration: 'Phối hợp giữ cự ly an toàn và hỗ trợ bạn trong tập luyện theo tổ, cặp đôi.',
      problemSolving: 'Phát hiện lỗi chùng khuỷu tay hoặc nghiêng vòng để tự chỉnh sửa.',
      disabledStudents: 'Được bạn và giáo viên hỗ trợ kịp thời.'
    },
    qualities: {
      diligence: 'Tích cực tập luyện liên hoàn các động tác với vòng thể dục.',
      honesty: 'Trung thực khi tham gia trò chơi tiếp sức.',
      responsibility: 'Có trách nhiệm giữ an toàn cho bạn và bảo quản vòng thể dục.',
      disabledStudents: 'Hòa đồng, đoàn kết cùng tập thể.'
    },
    integrations: {
      digitalSkill: '3.1TC2a',
      digitalDescription: 'Đối chiếu tư thế động tác Tay với vòng trên học liệu số chuẩn SGK Lớp 4.',
      lifeSkills: 'Rèn ý thức kỷ luật, nhanh nhẹn và hợp tác nhóm.',
      environmentalEducation: 'Giữ gìn vệ sinh sân bãi và cất dụng cụ vòng ngay ngắn.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất bằng phẳng, an toàn.',
      teacherTools: 'Kế hoạch bài dạy, SGK GDTC Lớp 4, còi, tranh ảnh kỹ thuật, vòng thể dục.',
      studentTools: 'Mỗi HS 1 vòng thể dục an toàn, trang phục và giày thể thao.'
    },
    rows: [
      {
        content: "1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, dụng cụ vòng.\n1.2. Khởi động xoay kỹ các khớp cổ tay, cổ chân, vai, hông.\n1.3. Trò chơi bổ trợ khởi động: \"Chuyền vòng tiếp sức\".",
        lvd: "5 - 7'\n2L x 8N",
        gv: "- GV nhận lớp, phổ biến mục tiêu tiết 16: Ôn Vươn thở với vòng, học mới Động tác Tay với vòng.\n- Hướng dẫn khởi động các khớp và tổ chức trò chơi bổ trợ khởi động.",
        hs: "- Cán sự tập hợp lớp báo cáo sĩ số.\n- Khởi động đều đặn và tham gia trò chơi an toàn, vui tươi.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_khoi_dong') || standardFormationDiagrams[1]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình khởi động với vòng'
      },
      {
        content: "2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Ôn tập Động tác Vươn thở với vòng (1-2 lần).\n2.2. Học mới Động tác Tay với vòng thể dục (SGK GDTC Lớp 4 Trang 27):\n- TTCB: Đứng nghiêm, hai tay cầm hai bên mép vòng trước đùi.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa vòng thẳng ra trước ngang vai.\n- Nhịp 2: Đưa vòng thẳng lên cao qua đầu.\n- Nhịp 3: Hạ vòng ra trước ngang vai.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Đổi chân phải thực hiện tương tự.",
        lvd: "6 - 8'\n2 - 3 lần",
        gv: "- Cho lớp ôn lại Động tác Vươn thở với vòng.\n- GV thị phạm Động tác Tay với vòng chuẩn xác, phân tích độ căng thẳng hai tay và cách giữ vòng song song.",
        hs: "- Quan sát mẫu GV và hình ảnh SGK Lớp 4 Trang 27.\n- Tập mô phỏng từng nhịp dứt khoát, giữ vòng thẳng cân đối.",
        contentImgUrl: '/assets/sgk_chuan/k4_tay_vong.svg',
        contentImgTitle: 'Động tác Tay với vòng thể dục - SGK GDTC Lớp 4 (Trang 27)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình quan sát làm mẫu'
      },
      {
        content: "3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt liên hoàn Động tác Vươn thở + Tay với vòng.\n3.2. Tập theo 4 tổ & Cặp đôi đối diện sửa sai.\n3.3. Thi đua biểu diễn giữa các tổ.",
        lvd: "15 - 16'\n2-3 lần",
        gv: "- Điều khiển tập liên hoàn 2 động tác, sửa lỗi chùng khuỷu tay tại 4 tổ và chấm điểm thi đua khích lệ.",
        hs: "- Tập đồng loạt, theo tổ và cặp đôi nghiêm túc; tự tin biểu diễn liên hoàn giữa các tổ.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.4. Trò chơi vận động: \"Chuyền vòng tiếp sức\"\n- Phát triển sức nhanh, sự khéo léo và tinh thần đoàn kết.",
        lvd: "4 - 5'\n2 - 3 lượt",
        gv: "- Tổ chức thi đấu tiếp sức giữa 4 hàng dọc công bằng, nhắc giữ an toàn khi chuyền vòng.",
        hs: "- Tham gia thi đấu nhiệt tình, phối hợp ăn ý với đồng đội.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi vận động: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tro_choi') || standardFormationDiagrams[8]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Sơ đồ trò chơi Chuyền vòng tiếp sức'
      },
      {
        content: "4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Thu dọn vòng thể dục ngăn nắp.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng sâu, nêu câu hỏi vận dụng sách giáo khoa, thu dọn vòng và nhận xét xuống lớp.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa, cất vòng đúng nơi quy định và về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_xuong_lop') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình hồi tĩnh và xuống lớp'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k5_t16: {
    id: 'k5_t16',
    grade: 5,
    week: 8,
    lessonNum: 16,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY, ĐỘNG TÁC CHÂN VỚI GẬY (Tiết 2)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết thực hiện vệ sinh sân tập, vệ sinh cá nhân, kiểm tra kỹ thuật an toàn của gậy thể dục (không nứt vỡ, nhẵn bóng) trước khi luyện tập.',
      basicMovement: 'Biết khẩu lệnh và thực hiện được Động tác Chân với gậy; kết hợp ôn tập liên hoàn thuần thục 3 động tác: Vươn thở - Tay - Chân với gậy.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK lớp 5 trang 26, nhận biết cách khuỵu gối giữ thân thẳng và đưa gậy song song mặt đất; biết tự sửa lỗi cầm gậy.',
      disabledStudents: 'Giảm nhẹ yêu cầu về biên độ khuỵu gối, thực hiện các động tác với gậy nhẹ ở mức độ cơ bản.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác xem trước động tác chân với gậy trong SGK; chủ động chuẩn bị gậy thể dục cá nhân; tự giác sửa tư thế gậy theo hướng dẫn.',
      collaboration: 'Biết phân công, phối hợp trong nhóm giữ khoảng cách an toàn 1.5m khi tập luyện với gậy; giúp bạn kiểm tra độ thăng bằng.',
      problemSolving: 'Nhận biết các lỗi cầm gậy lệch tâm, gối bị lệch hoặc thân người ngả về trước để tự điều chỉnh kịp thời.',
      disabledStudents: 'Hòa nhập vui vẻ cùng các bạn trong tổ, được bạn hỗ trợ cầm gậy.'
    },
    qualities: {
      diligence: 'Chăm chỉ, nghiêm túc tập luyện bài thể dục phối hợp với dụng cụ cầm tay.',
      honesty: 'Trung thực khi chơi trò chơi tiếp sức, tự giác báo cáo kết quả tập luyện.',
      responsibility: 'Có ý thức giữ an toàn tuyệt đối cho bản thân và bạn xung quanh; cẩn thận bảo quản dụng cụ học tập.',
      disabledStudents: 'Đoàn kết, tôn trọng, sẵn sàng giúp đỡ bạn hòa nhập.'
    },
    integrations: {
      digitalSkill: '1.1TC1a',
      digitalDescription: 'Học sinh biết tìm kiếm và đối chiếu tư thế cầm gậy trên học liệu số/video minh họa của giáo viên cung cấp.',
      lifeSkills: 'Rèn luyện tính cẩn thận, ngăn nắp, kỹ năng giữ thăng bằng cơ thể và quản lý dụng cụ thể thao an toàn.',
      environmentalEducation: 'Tích hợp BVMT: Giữ gìn vệ sinh sân bãi, sau buổi học tự giác thu dọn và xếp gậy ngay ngắn vào giá quy định.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất sạch sẽ, mặt sân bằng phẳng, an toàn.',
      teacherTools: 'Kế hoạch bài dạy, SGK, còi thể thao, tranh ảnh kỹ thuật động tác chân với gậy, giá đựng gậy.',
      studentTools: 'Mỗi học sinh 1 gậy thể dục tiêu chuẩn (dài 1m, nhẵn bóng), trang phục và giày thể thao.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, sức khỏe; kiểm tra gậy thể dục của từng HS.\n1.2. Khởi động: Xoay các khớp cổ tay, cổ chân, vai, hông, gối kết hợp nâng gậy nhẹ nhàng.\n1.3. Trò chơi khởi động: \"Ai nhanh hơn với gậy\".",
        lvd: "5 - 7'\n2L x 8N\n3 - 4'",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe học sinh; kiểm tra độ chắc chắn và an toàn của gậy thể dục.\n- Quán triệt kỷ luật an toàn: Tuyệt đối không dùng gậy đùa giỡn, giữ khoảng cách khi di chuyển.\n- Phổ biến mục tiêu tiết 16: Học động tác Chân với gậy, ôn liên hoàn 3 động tác Vươn thở - Tay - Chân.\n- Điều hành bài khởi động theo nhạc và tổ chức trò chơi khởi động phản xạ với gậy.",
        hs: "- Mỗi HS cầm gậy dựng thẳng bên chân phải, tập trung thành 4 hàng ngang cự ly 1.5m.\n- Cán sự điểm số, báo cáo tình hình lớp cho GV; cả lớp lắng nghe nắm vững mục tiêu bài học.\n- Thực hiện các động tác khởi động xoay khớp nhịp nhàng kết hợp nâng gậy ngang vai.\n- Tham gia trò chơi khởi động hào hứng, tuân thủ nghiêm ngặt quy tắc an toàn dụng cụ.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình nhận lớp với gậy thể dục (cự ly giãn cách an toàn)'
      },
      {
        content: "2. Hoạt động hình thành kiến thức & Khám phá\n2.1. Ôn tập Động tác Vươn thở và Động tác Tay với gậy (1-2 lần).\n2.2. Học mới Động tác Chân với gậy:\n- TTCB: Đứng nghiêm, hai tay cầm hai đầu gậy dựng thẳng trước đùi.\n- Nhịp 1: Kiễng gót hai chân, hai tay nâng gậy ra trước ngang vai (thân người thẳng, gậy song song mặt đất).\n- Nhịp 2: Khuỵu gối sâu, hai tay giữ nguyên gậy ngang vai hoặc đưa hạ nhẹ, lưng thẳng, mắt nhìn thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (kiễng gót hai chân, nâng gậy ngang vai).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện như nhịp 1, 2, 3, 4.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- Cho lớp ôn lại động tác Vươn thở và Tay với gậy 1 lần để tạo sự kết nối liên hoàn.\n- GV làm mẫu chuẩn xác động tác Chân với gậy 2-3 lần, phân tích chi tiết kỹ thuật kiễng gót và khuỵu gối.\n- Hướng dẫn HS xem hình vẽ SGK lớp 5 trang 26, chỉ rõ cách cầm gậy chắc chắn, lưng thẳng.\n- Lưu ý các lỗi thường mắc: Thân người đổ về trước khi khuỵu gối, hai tay cầm gậy bị lệch nghiêng.\n- Hô nhịp chậm hướng dẫn HS tập mô phỏng từng nhịp.",
        hs: "- Đội hình 4 hàng ngang so le cự ly 1.5m quan sát mẫu của GV và tranh ảnh SGK.\n- Chú ý quan sát tư thế kiễng gót thăng bằng và cách giữ gậy song song mặt đất.\n- Tập mô phỏng theo khẩu lệnh nhịp chậm của GV, cố gắng giữ thăng bằng thân người.\n- Tích cực trao đổi, nêu thắc mắc về cách giữ thăng bằng khi khuỵu gối.",
        contentImgUrl: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Chân với gậy & Ôn liên hoàn 3 động tác (SGK GDTC Lớp 5)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát mẫu kỹ thuật động tác chân với gậy'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt cả lớp: Liên hoàn 3 động tác Vươn thở, Tay, Chân với gậy theo nhịp trống.\n3.2. Tập theo 4 tổ tại 4 khu vực sân bãi.\n3.3. Tập theo cặp đôi đối diện sửa sai.\n3.4. Thi đua giữa các tổ: Biểu diễn liên hoàn 3 động tác với gậy.",
        lvd: "15 - 16'\n2-3 lần\n3-4 lần\n2-3 lần\n1 lần",
        gv: "- Gõ nhịp trống dứt khoát điều khiển cả lớp tập liên hoàn 3 động tác (2L x 8N mỗi động tác).\n- Giao nhiệm vụ cho 4 tổ trưởng quản lý tập luyện tại 4 góc sân bãi, nhắc giữ cự ly an toàn gậy.\n- Luân chuyển tới từng tổ uốn nắn tư thế khuỵu gối, nhắc HS giữ lưng thẳng và gậy thăng bằng.\n- Hướng dẫn tập cặp đôi: Hai bạn đứng đối diện nhau so gậy, bạn tập - bạn quan sát góp ý.\n- Tổ chức thi đua trình diễn giữa các tổ, biểu dương tổ có động tác đều, dứt khoát và thẳng gậy.",
        hs: "- Cả lớp tập đồng loạt theo nhịp trống dứt khoát của GV, động tác mạnh mẽ, chuẩn xác.\n- Các tổ về khu vực luyện tập nghiêm túc, tổ trưởng hô nhịp to rõ ràng.\n- Cặp đôi kiểm tra lẫn nhau: Nhắc bạn không cúi đầu, chỉnh tay cầm gậy không bị so le.\n- Từng tổ lên biểu diễn tự tin, các tổ ngồi xem nhận xét khách quan, học hỏi điểm tốt của bạn.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm tại 4 góc sân bãi'
      },
      {
        content: "3.5. Trò chơi vận động: \"Nhảy lò cò tiếp sức\"\n- Rèn luyện sức mạnh đôi chân, khả năng giữ thăng bằng và tinh thần tập thể.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- GV nêu tên trò chơi, nhắc nhở đặt gậy an toàn tại khu vực quy định trước khi chơi.\n- Hướng dẫn cách chơi, luật chơi an toàn: Lò cò qua cọc tiêu tiếp sức cho bạn kế tiếp.\n- Tổ chức chơi thử 1 lần rồi thi đấu chính thức giữa 4 tổ, động viên khích lệ học sinh.",
        hs: "- Đặt gậy gọn gàng theo tổ, xếp thành 4 hàng dọc sau vạch xuất phát.\n- Nắm vững luật chơi, tham gia thi đấu hào hứng, nhảy lò cò đúng kỹ thuật và an toàn.",
        hsImgUrl: standardFormationDiagrams[9].svgDataUrl,
        hsImgTitle: standardFormationDiagrams[9].name
      },
      {
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo nhạc nhẹ; thực hiện động tác vươn vai nhẹ nhàng.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT, thu dọn và sắp xếp gậy thể dục ngăn nắp.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Hướng dẫn lớp thả lỏng các khớp chân, khớp gối và cánh tay.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- Hướng dẫn các tổ trưởng thu gậy và xếp ngay ngắn vào giỏ/giá đựng dụng cụ của nhà trường.\n- Nhận xét đánh giá tinh thần học tập và phát lệnh xuống lớp.",
        hs: "- Thả lỏng tay chân, điều hòa nhịp thở thư thái theo hướng dẫn của GV.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Tích cực thu dọn dụng cụ, xếp gậy trật tự vào giá, giữ gìn vệ sinh sân bãi sạch sẽ.\n- Lắng nghe nhận xét chung của GV; trật tự giải tán về lớp: \"KHỎE!\".",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh và cất dụng cụ gậy thể dục'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  k5_t17: {
    id: 'k5_t17',
    grade: 5,
    week: 8,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VẶN MÌNH VỚI GẬY, ĐỘNG TÁC BỤNG VỚI GẬY (Tiết 3)',
    dateRange: 'Từ ngày 26 - 30 tháng 10 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết kiểm tra trang phục, giày tập và độ an toàn của gậy thể dục trước giờ học.',
      basicMovement: 'Biết và thực hiện được Động tác Vặn mình và Động tác Bụng với gậy; kết hợp ôn các động tác đã học.',
      sportsCompetency: 'Biết quan sát tranh ảnh kỹ thuật và làm theo hướng dẫn của GV, giữ vững trọng tâm cơ thể.',
      disabledStudents: 'Áp dụng học hòa nhập với biên độ vặn mình vừa sức, không gò ép.'
    },
    generalCompetencies: {
      autonomy: 'Chủ động chuẩn bị dụng cụ học tập cá nhân, tự giác rèn luyện tư thế chuẩn xác.',
      collaboration: 'Phối hợp với bạn trong tổ giữ cự ly an toàn 1.5m khi vặn mình và cúi gập bụng với gậy.',
      problemSolving: 'Biết phát hiện lỗi sai khi chân bị nhấc khỏi mặt đất hoặc tay buông thõng.',
      disabledStudents: 'Được các bạn trong tổ nhắc nhở và hỗ trợ kịp thời.'
    },
    qualities: {
      diligence: 'Chăm chỉ, tích cực luyện tập với gậy rèn luyện tính kiên trì.',
      honesty: 'Trung thực trong chơi trò chơi tiếp sức và đánh giá bạn.',
      responsibility: 'Có trách nhiệm bảo quản gậy thể dục của trường, giữ an toàn khoảng cách.',
      disabledStudents: 'Hòa đồng, đoàn kết và giúp đỡ bạn cùng tiến bộ.'
    },
    integrations: {
      digitalSkill: '1.1TC1a',
      digitalDescription: 'Học sinh biết so sánh động tác của bản thân với hình ảnh kỹ thuật chuẩn trên tranh ảnh hoặc thiết bị số.',
      lifeSkills: 'Rèn luyện khả năng phối hợp khéo léo, nhanh nhẹn và tinh thần đồng đội.',
      environmentalEducation: 'Vệ sinh sạch sẽ sân tập sau giờ học, xếp gậy trật tự đúng nơi quy định.'
    },
    locationEquipment: {
      location: 'Sân trường bằng phẳng, khô ráo, an toàn.',
      teacherTools: 'Gậy thể dục mẫu, còi, tranh ảnh kỹ thuật động tác vặn mình và bụng với gậy, cọc mốc trò chơi.',
      studentTools: 'Mỗi học sinh 1 gậy thể dục đúng chuẩn, giày thể thao vừa chân.'
    },
    rows: [
      {
        content: "1. Mở đầu:\n1.1. Nhận lớp, kiểm tra độ an toàn của gậy thể dục.\n1.2. Khởi động xoay các khớp có kết hợp nâng gậy ngang ngực.\n1.3. Trò chơi bổ trợ: \"Đội nào nhanh nhất\".",
        lvd: "5 - 7'\n2L x 8N",
        gv: "- GV nhận lớp, kiểm tra sĩ số, tác phong và gậy thể dục của từng học sinh.\n- Phổ biến mục tiêu: Học động tác Vặn mình và Bụng với gậy; Trò chơi Đội nào nhanh nhất theo SGK GDTC 5 Trang 29.\n- Nhắc nhở quy tắc an toàn: Không vung gậy ngang tầm mắt bạn.",
        hs: "- Cán sự tập hợp 4 hàng ngang cự ly giãn cách 1.5m, báo cáo sĩ số cho GV.\n- Cả lớp thực hiện bài khởi động đều đặn, hào hứng theo nhịp đếm.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình khởi động với gậy cự ly 1.5m'
      },
      {
        content: "2. Khám phá & Hình thành kiến thức mới:\n2.1. Động tác Vặn mình với gậy:\n- Nhịp 1: Bước chân trái sang ngang, hai tay nâng gậy ngang ngực.\n- Nhịp 2: Vặn thân sang trái 90 độ, hai chân giữ nguyên tiếp đất.\n- Nhịp 3: Quay thân về trước, hai tay nâng gậy lên cao qua đầu.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như trên nhưng đổi sang phải.\n2.2. Động tác Bụng với gậy:\n- Nhịp 1: Chân trái bước sang ngang, hai tay nâng gậy lên cao, ngửa đầu.\n- Nhịp 2: Cúi gập thân, hai tay đưa gậy chạm mũi bàn chân, gối thẳng.\n- Nhịp 3: Đứng thẳng thân, hai tay nâng gậy ngang vai.\n- Nhịp 4: Về TTCB.",
        lvd: "8 - 10'\n2 - 3 lần",
        gv: "- GV thị phạm chuẩn xác 2-3 lần từng động tác kết hợp phân tích nhịp hô.\n- Cho HS quan sát tranh SGK, giải thích kỹ thuật giữ thẳng gối khi gập bụng.\n- Hô nhịp chậm hướng dẫn HS mô phỏng từng nhịp với gậy.",
        hs: "- Đội hình 4 hàng ngang giãn cách 1.5m chú ý quan sát tranh và GV làm mẫu.\n- Tập trung làm theo nhịp hô chậm của GV, giữ chắc tay cầm hai đầu gậy.\n- Tự điều chỉnh không để gậy bị nghiêng lệch.",
        contentImgUrl: '/assets/sgk_chuan/k5_van_minh_toan_than_gay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vặn mình & Bụng với gậy (SGK GDTC Lớp 5)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình quan sát GV làm mẫu'
      },
      {
        content: "3. Luyện tập:\n3.1. Tập đồng loạt cả lớp liên hoàn các động tác với gậy theo nhịp trống.\n3.2. Tập theo 4 tổ tại 4 góc sân bãi.\n3.3. Tập cặp đôi đối diện sửa sai.\n3.4. Thi đua giữa các tổ.",
        lvd: "14 - 15'\n2-3 lần\n3-4 lần\n2-3 lần\n1 lần",
        gv: "- Gõ nhịp trống dứt khoát điều khiển cả lớp tập đồng loạt.\n- Phân 4 tổ về 4 góc sân, nhắc tổ trưởng quản lý và đếm nhịp.\n- Luân chuyển sửa sai tư thế gập bụng chưa thẳng gối hoặc vặn mình lệch chân.\n- Tổ chức thi đua trình diễn có nhận xét biểu dương kịp thời.",
        hs: "- Cả lớp tập đồng loạt dứt khoát, tiếng hô nhịp vang đều.\n- Về vị trí tổ luyện tập nghiêm túc, tổ trưởng điều hành.\n- Cặp đôi kiểm tra giúp nhau góc vặn mình 90 độ và gập bụng chạm gậy vào mũi chân.\n- Tự tin thi đua giữa các tổ với tinh thần học hỏi cao.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình tập luyện theo tổ nhóm tại 4 góc sân'
      },
      {
        content: "3.5. Trò chơi vận động: \"Chạy theo hình tam giác\"\n- Rèn luyện phản xạ nhanh, sức bật, độ khéo léo và khả năng chuyển hướng tốc độ.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- Đặt 3 cọc mốc A, B, C tạo thành tam giác đều cạnh 10m.\n- Phổ biến luật chơi: Chạy xuất phát từ A vòng qua B, qua C rồi về A tiếp sức.\n- Điều hành 4 tổ thi đấu tiếp sức có tính thời gian và khích lệ.",
        hs: "- Xếp gậy ngay ngắn phía sau, tập trung thành các hàng dọc tại vạch xuất phát A.\n- Nắm vững đường chạy vòng quanh 3 cọc mốc tam giác, thi đấu hết mình và cổ vũ văn minh.",
        hsImgUrl: standardFormationDiagrams[7].svgDataUrl,
        hsImgTitle: 'Sơ đồ Trò chơi: Chạy theo hình tam giác (3 cọc mốc A-B-C)'
      },
      {
        content: "4. Hoạt động vận dụng & Hồi tĩnh:\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo điệu nhạc nhẹ.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT, thu dọn và xếp gậy vào giá trật tự.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Hướng dẫn học sinh thả lỏng sâu, điều hòa nhịp tim và hơi thở.\n- GV nêu câu hỏi vận dụng sách giáo khoa; hướng dẫn các tổ trưởng thu dọn gậy thể dục cất vào phòng thiết bị.\n- Tuyên dương tinh thần học tập kỷ luật và an toàn của lớp, phát lệnh xuống lớp.",
        hs: "- Thả lỏng tay chân thoải mái theo nhịp điều hòa.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Tự giác cất gậy ngăn nắp, kiểm tra vệ sinh sạch sẽ sân tập; trật tự giải tán: \"KHỎE!\".",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Sơ đồ Đội hình hồi tĩnh và cất dụng cụ'
      }
    ],
    postLessonAdjustment: '…………………………………………………………………………………………………………………………………………………………………………………………',
    signatures: {
      locationDate: 'Vệ Giang, ngày 26 tháng 10 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  }
};

// Preset Syllabus for subsequent weeks (Tuần 9 đến Tuần 18) for GDPT 2018
export interface NextWeekLessonPreset {
  week: number;
  grade: number;
  lessonNum: number;
  topic: string;
  title: string;
  movementNames: string[];
  suggestedGame: string;
}

export const nextWeeksSyllabusPresets: NextWeekLessonPreset[] = [
  // Khối 1
  {
    week: 9,
    grade: 1,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG (Tiết 1)',
    movementNames: ['Học động tác Chân', 'Học động tác Vặn mình'],
    suggestedGame: 'Trò chơi: Nhảy lò cò tiếp sức'
  },
  {
    week: 9,
    grade: 1,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG (Tiết 2)',
    movementNames: ['Học động tác Bụng', 'Ôn động tác Chân và Động tác Vặn mình'],
    suggestedGame: 'Trò chơi: Nhảy lò cò tiếp sức'
  },
  {
    week: 10,
    grade: 1,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG (Tiết 3)',
    movementNames: ['Ôn động tác Chân, Vặn mình, Bụng'],
    suggestedGame: 'Trò chơi: Lò cò tiếp sức'
  },
  {
    week: 10,
    grade: 1,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC PHỐI HỢP VÀ ĐỘNG TÁC ĐIỀU HÒA (Tiết 1)',
    movementNames: ['Học động tác Phối hợp'],
    suggestedGame: 'Trò chơi: Mèo đuổi chuột'
  },
  {
    week: 11,
    grade: 1,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC PHỐI HỢP VÀ ĐỘNG TÁC ĐIỀU HÒA (Tiết 2)',
    movementNames: ['Học động tác Điều hòa', 'Ôn động tác Phối hợp'],
    suggestedGame: 'Trò chơi: Mèo đuổi chuột'
  },
  {
    week: 11,
    grade: 1,
    lessonNum: 22,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'ÔN TẬP BÀI THỂ DỤC',
    movementNames: ['Ôn tập hoàn thiện Bài thể dục'],
    suggestedGame: 'Trò chơi: Chạy tiếp sức ném bóng'
  },

  // Khối 2
  {
    week: 9,
    grade: 2,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 1)',
    movementNames: ['Học động tác Chân'],
    suggestedGame: 'Trò chơi: Tìm người chỉ huy'
  },
  {
    week: 9,
    grade: 2,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 2)',
    movementNames: ['Học động tác Lườn', 'Ôn động tác Chân'],
    suggestedGame: 'Trò chơi: Tìm người chỉ huy'
  },
  {
    week: 10,
    grade: 2,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 3)',
    movementNames: ['Ôn động tác Chân và Động tác Lườn'],
    suggestedGame: 'Trò chơi: Đua ngựa'
  },
  {
    week: 10,
    grade: 2,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 4)',
    movementNames: ['Hoàn thiện Động tác Chân và Động tác Lườn'],
    suggestedGame: 'Trò chơi: Tìm người chỉ huy'
  },
  {
    week: 11,
    grade: 2,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC BỤNG, ĐỘNG TÁC TOÀN THÂN (Tiết 1)',
    movementNames: ['Học động tác Bụng'],
    suggestedGame: 'Trò chơi: Đua ngựa'
  },
  {
    week: 11,
    grade: 2,
    lessonNum: 22,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC BỤNG, ĐỘNG TÁC TOÀN THÂN (Tiết 2)',
    movementNames: ['Học động tác Toàn thân', 'Ôn động tác Bụng'],
    suggestedGame: 'Trò chơi: Tìm người chỉ huy'
  },

  // Khối 3
  {
    week: 9,
    grade: 3,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 1)',
    movementNames: ['Học động tác Vươn thở', 'Học động tác Tay'],
    suggestedGame: 'Trò chơi: Đua ô tô'
  },
  {
    week: 9,
    grade: 3,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 2)',
    movementNames: ['Ôn động tác Vươn thở', 'Ôn động tác Tay'],
    suggestedGame: 'Trò chơi: Đua ô tô'
  },
  {
    week: 10,
    grade: 3,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN, ĐỘNG TÁC BỤNG (Tiết 1)',
    movementNames: ['Học động tác Chân', 'Học động tác Lườn'],
    suggestedGame: 'Trò chơi: Đua ô tô'
  },
  {
    week: 10,
    grade: 3,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN, ĐỘNG TÁC BỤNG (Tiết 2)',
    movementNames: ['Học động tác Bụng', 'Ôn động tác Chân và Lườn'],
    suggestedGame: 'Trò chơi: Chạy nhanh tiếp sức'
  },
  {
    week: 11,
    grade: 3,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA (Tiết 1)',
    movementNames: ['Học động tác Phối hợp'],
    suggestedGame: 'Trò chơi: Đua ô tô'
  },
  {
    week: 11,
    grade: 3,
    lessonNum: 22,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA (Tiết 2)',
    movementNames: ['Học động tác Nhảy', 'Ôn động tác Phối hợp'],
    suggestedGame: 'Trò chơi: Nhanh lên bạn ơi'
  },
  {
    week: 12,
    grade: 3,
    lessonNum: 23,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA (Tiết 3)',
    movementNames: ['Học động tác Điều hòa', 'Ôn động tác Phối hợp và Nhảy'],
    suggestedGame: 'Trò chơi: Nhanh lên bạn ơi'
  },
  {
    week: 12,
    grade: 3,
    lessonNum: 24,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'ÔN TẬP BÀI TẬP THỂ DỤC',
    movementNames: ['Ôn tập hoàn thiện Bài tập thể dục'],
    suggestedGame: 'Trò chơi: Chạy nhanh tiếp sức'
  },

  // Khối 4
  {
    week: 9,
    grade: 4,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 1)',
    movementNames: ['Học động tác Chân với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },
  {
    week: 9,
    grade: 4,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 2)',
    movementNames: ['Học động tác Lườn với vòng thể dục', 'Ôn động tác Chân với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },
  {
    week: 10,
    grade: 4,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 3)',
    movementNames: ['Ôn động tác Chân và Động tác Lườn với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },
  {
    week: 10,
    grade: 4,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 4)',
    movementNames: ['Hoàn thiện Động tác Chân, Lườn với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },
  {
    week: 11,
    grade: 4,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC BỤNG, ĐỘNG TÁC TOÀN THÂN VỚI VÒNG THỂ DỤC (Tiết 1)',
    movementNames: ['Học động tác Bụng với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },
  {
    week: 11,
    grade: 4,
    lessonNum: 22,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC BỤNG, ĐỘNG TÁC TOÀN THÂN VỚI VÒNG THỂ DỤC (Tiết 2)',
    movementNames: ['Học động tác Toàn thân với vòng thể dục', 'Ôn động tác Bụng với vòng thể dục'],
    suggestedGame: 'Trò chơi: Chuyền vòng tiếp sức'
  },

  // Khối 5
  {
    week: 9,
    grade: 5,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'Bài 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY (Tiết 1)',
    movementNames: ['Học động tác Bụng với gậy', 'Học động tác Vặn mình với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 9,
    grade: 5,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'Bài 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY (Tiết 2)',
    movementNames: ['Học động tác Toàn thân với gậy', 'Ôn động tác Bụng và Vặn mình với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 10,
    grade: 5,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'Bài 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY (Tiết 3)',
    movementNames: ['Học động tác Toàn thân với gậy', 'Ôn Bụng và Vặn mình với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 10,
    grade: 5,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'Bài 3: ĐỘNG TÁC NHẢY VÀ ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY (Tiết 1)',
    movementNames: ['Học động tác Nhảy với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 11,
    grade: 5,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'Bài 3: ĐỘNG TÁC NHẢY VÀ ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY (Tiết 2)',
    movementNames: ['Học động tác Điều hòa với gậy', 'Ôn động tác Nhảy với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 11,
    grade: 5,
    lessonNum: 22,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'HOÀN THIỆN BÀI THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY (Tiết 1)',
    movementNames: ['Hoàn thiện bài thể dục phát triển chung với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 12,
    grade: 5,
    lessonNum: 23,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'HOÀN THIỆN BÀI THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY (Tiết 2)',
    movementNames: ['Hoàn thiện bài thể dục phát triển chung với gậy'],
    suggestedGame: 'Trò chơi: Trao gậy tiếp sức'
  },
  {
    week: 12,
    grade: 5,
    lessonNum: 24,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    title: 'ÔN BÀI THỂ DỤC PHÁT TRIỂN CHUNG VỚI GẬY',
    movementNames: ['Ôn hoàn chỉnh bài thể dục phát triển chung với gậy'],
    suggestedGame: 'Trò chơi: Chuyền gậy tiếp sức'
  }
];

function healDuplicatedCooldownVanDungRows(rows: LessonRow[]): LessonRow[] {
  if (!Array.isArray(rows) || rows.length < 9) return rows;
  const lastIdx = rows.length - 1;
  const secondLastIdx = rows.length - 2;
  const lastContentLower = (rows[lastIdx]?.content || '').toLowerCase();
  const secondLastLower = (rows[secondLastIdx]?.content || '').toLowerCase();

  let vanDungIdx = rows.findIndex((r, idx) => {
    const c = (r?.content || '').toLowerCase();
    return idx >= secondLastIdx && (c.includes('4.2.') || c.includes('4.2:')) && !c.includes('4.1.');
  });

  // Fallback: if both of the last two rows are 4.2. Vận dụng (Row 10 lost 4.1 completely), target last row as 4.2
  if (vanDungIdx === secondLastIdx && (lastContentLower.includes('4.2') || lastContentLower.includes('vận dụng'))) {
    vanDungIdx = lastIdx;
  }
  if (vanDungIdx <= 0) return rows;

  const vanDungRow = rows[vanDungIdx];

  return rows.map((row, idx) => {
    if (idx >= vanDungIdx) return row;
    const c = row.content || '';
    const cLower = c.toLowerCase();
    const isCooldownRow = cLower.includes('4.1.') || cLower.includes('4.1 ') || cLower.includes('hồi tĩnh');
    const isDuplicateVanDungAtSecondLast =
      idx === secondLastIdx &&
      (cLower.includes('4.2.') || cLower.includes('4.2:') || cLower.includes('câu hỏi vận dụng sách giáo khoa') || cLower.includes('vận dụng'));

    if (!isCooldownRow && !isDuplicateVanDungAtSecondLast) return row;

    const hasCorrupted42 =
      isDuplicateVanDungAtSecondLast ||
      cLower.includes('4.2.') ||
      cLower.includes('4.2:') ||
      cLower.includes('câu hỏi vận dụng sách giáo khoa');
    const sharedContentImg =
      Boolean(row.contentImgUrl && vanDungRow?.contentImgUrl && row.contentImgUrl === vanDungRow.contentImgUrl) ||
      Boolean(row.contentImgUrl && (row.contentImgTitle || '').toLowerCase().includes('vận dụng'));

    if (!hasCorrupted42 && !sharedContentImg) return row;

    const cleanContent =
      `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n` +
      `4.1. Hồi tĩnh:\n` +
      `- Thả lỏng toàn thân, cúi người rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi để cơ thể hồi phục.`;

    const cleanGv =
      `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ mềm tay, rung thả lỏng đùi và chân, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n` +
      `- Nhắc học sinh thả lỏng tự nhiên, không gồng cứng cơ thể.`;

    const cleanHs =
      `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n` +
      `- Rũ tay, thả lỏng bắp chân nhịp nhàng, cảm nhận cơ thể hồi phục sảng khoái.`;

    const nextRow: LessonRow = {
      ...row,
      content: hasCorrupted42 ? cleanContent : row.content,
      gv: hasCorrupted42 ? cleanGv : row.gv,
      hs: hasCorrupted42 ? cleanHs : row.hs
    };

    if (sharedContentImg || hasCorrupted42) {
      delete nextRow.contentImgUrl;
      delete nextRow.contentImgTitle;
      nextRow.contentImages = [];
    }

    // If Row 10 mistakenly shares the exact same Xuống lớp diagram as Row 11 (or lacks diagram), switch Row 10 back to Hồi tĩnh diagram
    const hoiTinhDiag = standardFormationDiagrams.find((d) => d.phase === 'hoi_tinh');
    if (
      hoiTinhDiag &&
      (!nextRow.hsImgUrl || (vanDungRow?.hsImgUrl && nextRow.hsImgUrl === vanDungRow.hsImgUrl) || hasCorrupted42)
    ) {
      nextRow.hsImgUrl = hoiTinhDiag.svgDataUrl;
      nextRow.hsImgTitle = hoiTinhDiag.name;
      nextRow.hsImages = [{ id: `diag_ht_heal_${idx}`, url: hoiTinhDiag.svgDataUrl, title: hoiTinhDiag.name }];
    }

    return nextRow;
  });
}

/**
 * Automatically splits any legacy merged row combining "3.4. Thi đua trình diễn..."
 * and "Trò chơi vận động" into TWO separate dedicated rows:
 *  - Row 3.4: Thi đua trình diễn giữa các tổ (with its own LVĐ, GV/HS actions & Thi đua formation)
 *  - Row 3.5: Trò chơi vận động (preserving the exact game name, rules, SGK game image & game formation)
 * Idempotent: already-split rows pass through unchanged.
 */
export function splitMergedThiDuaAndTroChoiRows(
  rows: LessonRow[],
  grade: number = 1
): LessonRow[] {
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const result: LessonRow[] = [];

  for (const row of rows) {
    const content = row?.content || '';
    const cLower = content.toLowerCase();

    const hasThiDua =
      cLower.includes('thi đua') ||
      cLower.includes('trình diễn') ||
      /^\s*3\.4\b/.test(cLower);
    const hasTroChoi =
      cLower.includes('trò chơi vận động') ||
      /(?:^|\n)\s*(?:\*|3\.5\.?)\s*trò chơi/i.test(content);

    // Only split when BOTH Thi đua (3.4) and Trò chơi vận động are merged inside the SAME row
    if (!hasThiDua || !hasTroChoi) {
      result.push(row);
      continue;
    }

    const lines = content.split('\n');
    const gameLineIdx = lines.findIndex((ln, idx) => {
      if (idx === 0) return false;
      return /^\s*(?:(?:\*|-|•)?\s*trò chơi\s*(?:vận động)?|3\.5\.?\s*trò chơi)/i.test(ln.trim());
    });

    if (gameLineIdx === -1) {
      result.push(row);
      continue;
    }

    // 1. Split Column 1 content cleanly
    const rawThiDuaLines = lines.slice(0, gameLineIdx).filter((ln) => ln.trim().length > 0);
    const thiDuaBodyLines = rawThiDuaLines
      .slice(1)
      .filter((ln) => !/^\*?\s*thi đua trình diễn/i.test(ln.trim()));

    const thiDuaContent =
      `3.4. Thi đua trình diễn giữa các tổ:\n` +
      (thiDuaBodyLines.length > 0
        ? thiDuaBodyLines.join('\n')
        : `- Từng tổ lên thực hiện động tác trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.`);

    const rawGameLines = lines.slice(gameLineIdx).filter((ln) => ln.trim().length > 0);
    const firstGameLine = rawGameLines[0]
      .trim()
      .replace(/^(?:3\.5\.?\s*|\*+\s*|-\s*)/, '')
      .replace(/^trò chơi\s+vận động\s*:?\s*/i, '')
      .replace(/^trò chơi\s*:?\s*/i, '')
      .trim();
    const gameHeading = firstGameLine
      ? `3.5. Trò chơi vận động: ${firstGameLine}`
      : `3.5. Trò chơi vận động:`;
    const gameContent = [gameHeading, ...rawGameLines.slice(1)].join('\n');

    // 2. Split Column 3 (GV) lines
    const gvLines = (row.gv || '').split('\n').filter((ln) => ln.trim().length > 0);
    const thiDuaGvLines: string[] = [];
    const gameGvLines: string[] = [];
    let inGameGvSection = false;
    for (const ln of gvLines) {
      const l = ln.toLowerCase();
      if (
        !inGameGvSection &&
        (l.includes('trò chơi') ||
          l.includes('luật chơi') ||
          l.includes('làm mẫu thao tác') ||
          l.includes('4 đội thi đấu') ||
          l.includes('tinh thần thi đấu') ||
          l.includes('đội chiến thắng'))
      ) {
        inGameGvSection = true;
      }
      if (inGameGvSection) {
        gameGvLines.push(ln);
      } else {
        thiDuaGvLines.push(ln);
      }
    }
    const thiDuaGv =
      thiDuaGvLines.length > 0
        ? thiDuaGvLines.join('\n')
        : `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- GV ghi nhận ưu điểm, sửa lỗi còn tồn tại và tuyên dương tổ thực hiện đều đẹp, đúng kỹ thuật.`;
    const gameGv =
      gameGvLines.length > 0
        ? gameGvLines.join('\n')
        : `- Phổ biến ngắn gọn tên trò chơi vận động, mục đích, luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm làm mẫu thao tác tham gia trò chơi; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.`;

    // 3. Split Column 4 (HS) lines
    const hsLines = (row.hs || '').split('\n').filter((ln) => ln.trim().length > 0);
    const thiDuaHsLines: string[] = [];
    const gameHsLines: string[] = [];
    let inGameHsSection = false;
    for (const ln of hsLines) {
      const l = ln.toLowerCase();
      if (
        !inGameHsSection &&
        (l.includes('khi vào trò chơi') ||
          l.includes('luật chơi') ||
          l.includes('vạch xuất phát') ||
          l.includes('tiếp sức') ||
          l.includes('giành chiến thắng'))
      ) {
        inGameHsSection = true;
      }
      if (inGameHsSection) {
        gameHsLines.push(ln);
      } else {
        thiDuaHsLines.push(ln.replace(/đội hình thi đua\s*&\s*trò chơi/gi, 'Đội hình thi đua'));
      }
    }
    const thiDuaHs =
      thiDuaHsLines.length > 0
        ? thiDuaHsLines.join('\n')
        : `- Đội hình thi đua: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Từng tổ lên biểu diễn tự tin, thực hiện đúng động tác theo nhịp hô dứt khoát của tổ trưởng.`;
    const gameHs =
      gameHsLines.length > 0
        ? gameHsLines.join('\n')
        : `- Đội hình trò chơi: 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn vượt qua thử thách và tiếp sức an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.`;

    // 4. Preserve game media & formation diagram on 3.5; give 3.4 a clean Thi đua formation diagram
    const diagThiDua = getFormationDiagramForPhaseAndGrade('thi_dua', grade);

    const row34: LessonRow = {
      content: thiDuaContent,
      lvd: '3 - 4 phút\n1 lượt / tổ',
      gv: thiDuaGv,
      hs: thiDuaHs,
      hsImgUrl: diagThiDua.svgDataUrl,
      hsImgTitle: diagThiDua.name,
      hsImages: [
        {
          id: `diag_thi_dua_split_${grade}`,
          url: diagThiDua.svgDataUrl,
          title: diagThiDua.name
        }
      ]
    };

    const row35: LessonRow = {
      ...row,
      content: gameContent,
      lvd: row.lvd && /lượt|phút/i.test(row.lvd) ? row.lvd : '4 - 5 phút\n2 - 3 lượt',
      gv: gameGv,
      hs: gameHs
    };

    result.push(row34, row35);
  }

  return result;
}

export function normalizeMasterPlan(raw?: Partial<MasterPlanItem> | null): MasterPlanItem {
  const base = masterPlansTuan8.k1_t15;
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(base));
  }

  const resolvedGrade = typeof raw.grade === 'number' ? raw.grade : base.grade;
  const rawRows = Array.isArray(raw.rows) && raw.rows.length > 0 ? raw.rows : base.rows;

  return {
    id: raw.id || base.id,
    grade: resolvedGrade,
    week: typeof raw.week === 'number' ? raw.week : base.week,
    lessonNum: typeof raw.lessonNum === 'number' ? raw.lessonNum : base.lessonNum,
    topic: raw.topic || base.topic,
    title: raw.title || base.title,
    dateRange: raw.dateRange || base.dateRange,
    specialCompetencies: {
      healthCare: raw.specialCompetencies?.healthCare ?? base.specialCompetencies.healthCare,
      basicMovement: raw.specialCompetencies?.basicMovement ?? base.specialCompetencies.basicMovement,
      sportsCompetency: raw.specialCompetencies?.sportsCompetency ?? base.specialCompetencies.sportsCompetency,
      disabledStudents: raw.specialCompetencies?.disabledStudents ?? base.specialCompetencies.disabledStudents,
    },
    generalCompetencies: {
      autonomy: raw.generalCompetencies?.autonomy ?? base.generalCompetencies.autonomy,
      collaboration: raw.generalCompetencies?.collaboration ?? base.generalCompetencies.collaboration,
      problemSolving: raw.generalCompetencies?.problemSolving ?? base.generalCompetencies.problemSolving,
      disabledStudents: raw.generalCompetencies?.disabledStudents ?? base.generalCompetencies.disabledStudents,
    },
    qualities: {
      diligence: raw.qualities?.diligence ?? base.qualities.diligence,
      honesty: raw.qualities?.honesty ?? base.qualities.honesty,
      responsibility: raw.qualities?.responsibility ?? base.qualities.responsibility,
      disabledStudents: raw.qualities?.disabledStudents ?? base.qualities.disabledStudents,
    },
    integrations: {
      addressLabel: raw.integrations?.addressLabel ?? base.integrations.addressLabel,
      addressContent: raw.integrations?.addressContent ?? base.integrations.addressContent,
      domains: raw.integrations?.domains ?? base.integrations.domains,
      digitalSkill: raw.integrations?.digitalSkill ?? base.integrations.digitalSkill,
      digitalDescription: raw.integrations?.digitalDescription ?? base.integrations.digitalDescription,
      qpan: raw.integrations?.qpan ?? base.integrations.qpan,
      childRights: raw.integrations?.childRights ?? base.integrations.childRights,
      lifeSkills: raw.integrations?.lifeSkills ?? base.integrations.lifeSkills,
      trafficSafety: raw.integrations?.trafficSafety ?? base.integrations.trafficSafety,
      environmentalEducation: raw.integrations?.environmentalEducation ?? base.integrations.environmentalEducation,
    },
    locationEquipment: {
      location: raw.locationEquipment?.location ?? base.locationEquipment.location,
      teacherTools: raw.locationEquipment?.teacherTools ?? base.locationEquipment.teacherTools,
      studentTools: raw.locationEquipment?.studentTools ?? base.locationEquipment.studentTools,
    },
    rows: splitMergedThiDuaAndTroChoiRows(
      healDuplicatedCooldownVanDungRows(rawRows),
      resolvedGrade
    ),
    postLessonAdjustment: raw.postLessonAdjustment ?? base.postLessonAdjustment,
    signatures: {
      locationDate: raw.signatures?.locationDate ?? base.signatures.locationDate,
      bgh: raw.signatures?.bgh ?? base.signatures.bgh,
      headTeacher: raw.signatures?.headTeacher ?? base.signatures.headTeacher,
      teacher: raw.signatures?.teacher ?? base.signatures.teacher,
    },
  };
}


