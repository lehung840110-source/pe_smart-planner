import { LessonRow, SchoolSettings } from '../types/gdtc';
import { standardFormationDiagrams } from './formationDiagrams';
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
    digitalSkill: string; // e.g. "3.1TC1a" or "1.1TC1a"
    digitalDescription: string;
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
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo nhịp nhạc.\n4.2. Vận dụng: Tích hợp năng lực số (3.1TC1a) và rèn luyện thể dục buổi sáng.\n4.3. Nhận xét & Dặn dò về nhà.\n4.4. Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng cơ bắp, điều hòa nhịp tim.\n- Nêu câu hỏi vận dụng: \"Em vận dụng động tác vươn thở vào thời điểm nào trong ngày?\"\n- Hướng dẫn HS sắp xếp hình ảnh động tác theo đúng thứ tự nhịp.\n- Đánh giá tiết học, tuyên dương, dặn dò tập ở nhà.",
        hs: "- Đội hình hồi tĩnh hàng ngang thả lỏng tay chân, hít thở sâu.\n- Trả lời: Tập thể dục buổi sáng tại nhà để tăng cường sức khỏe.\n- Ghi nhớ nhiệm vụ, trật tự giải tán về lớp theo hàng dọc.",
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
        content: "4. Vận dụng & Hồi tĩnh:\n- Thả lỏng toàn thân, dặn dò tự tập luyện ở nhà.\n- Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng các khớp tay, khớp gối.\n- Dặn dò HS tập liên hoàn 2 động tác mỗi sáng sớm.",
        hs: "- Thả lỏng toàn thân theo nhịp điều hòa.\n- Giải tán hô to: \"KHỎE!\"",
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
        content: "4. Vận dụng & Hồi tĩnh:\n- Thả lỏng toàn thân.\n- Tích hợp ATGT: Rèn thói quen đi bộ ngay ngắn, tuân thủ luật đường bộ.\n- Nhận xét và dặn dò.",
        lvd: "4 - 5'",
        gv: "- Hướng dẫn thả lỏng sâu, liên hệ thực tế an toàn khi tham gia giao thông.\n- Khen ngợi tổ đi đều chuẩn xác nhất.",
        hs: "- Thả lỏng tay chân, tiếp thu lời dặn và giải tán về lớp.",
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
        content: "4. Vận dụng & Hồi tĩnh:\n- Thả lỏng khớp vai, cổ tay và chân.\n- Xếp gậy gọn gàng vào giá dụng cụ thể thao.\n- Dặn dò và xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- Hướng dẫn tổ trưởng thu gậy và xếp ngay ngắn vào giỏ đựng đồ dùng.\n- Tuyên dương tinh thần trách nhiệm giữ gìn dụng cụ của lớp.",
        hs: "- Thả lỏng sâu theo điệu nhạc nhẹ.\n- Tự giác cất gậy trật tự, xếp hàng giải tán về lớp.",
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
        contentImgUrl: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
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
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng cơ bắp toàn thân (theo điệu nhạc nhẹ).\n4.2. Vận dụng: Tích hợp ATGT và rèn nếp xếp hàng ngay ngắn khi di chuyển.\n4.3. Đánh giá, nhận xét buổi học & Dặn dò tự ôn luyện ở nhà.\n4.4. Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Điều hành lớp thực hiện bài tập thả lỏng sâu, điều hòa nhịp thở.\n- Nêu câu hỏi vận dụng: \"Em áp dụng kỹ năng đi đều, đứng lại vào những hoạt động nào ở trường và đời sống?\"\n- Tích hợp ATGT: Nhắc nhở HS luôn đi bộ trật tự trên vỉa hè, không đùa giỡn dưới lòng đường.\n- Nhận xét ưu điểm, chỉ ra tồn tại cần khắc phục; dặn dò HS tự ôn luyện dậm chân tại nhà.",
        hs: "- Đội hình hàng ngang thả lỏng tay chân, hít sâu thở đều theo hướng dẫn.\n- Tự tin trả lời: Áp dụng khi di chuyển vào lớp, lễ chào cờ thứ Hai và đi bộ an toàn trên đường.\n- Tích hợp BVMT: Kiểm tra vệ sinh khu vực sân tập, nhặt rác và vật nguy hiểm.\n- Lắng nghe ghi nhớ lời dặn của GV; giải tán đồng thanh hô to: \"KHỎE!\".",
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
        content: "4. Hoạt động vận dụng & Hồi tĩnh\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo nhạc nhẹ; thực hiện động tác vươn vai nhẹ nhàng.\n4.2. Vận dụng: Tích hợp BVMT, thu dọn và sắp xếp gậy thể dục ngăn nắp.\n4.3. Đánh giá, nhận xét buổi học & Dặn dò tự rèn luyện ở nhà.\n4.4. Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Hướng dẫn lớp thả lỏng sâu các khớp chân, khớp gối và cơ bắp tay.\n- Nêu câu hỏi vận dụng: \"Bài tập thể dục với gậy giúp phát triển những nhóm cơ nào?\"\n- Hướng dẫn các tổ trưởng thu gậy và xếp ngay ngắn vào giỏ/giá đựng dụng cụ của nhà trường.\n- Nhận xét đánh giá tinh thần học tập; dặn dò HS tự ôn luyện 3 động tác vào mỗi buổi sáng.",
        hs: "- Thả lỏng tay chân, điều hòa nhịp thở thư thái theo hướng dẫn của GV.\n- Trả lời câu hỏi: Giúp thân hình dẻo dai, tay khỏe, lưng thẳng và dáng đi đẹp.\n- Tích cực thu dọn dụng cụ, xếp gậy trật tự vào giá, giữ gìn vệ sinh sân bãi sạch sẽ.\n- Lắng nghe ghi nhớ nhiệm vụ về nhà; trật tự giải tán về lớp: \"KHỎE!\".",
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
      lifeSkills: 'Rèn luyện khả năng phối hợp khéo léo giữa các nhóm cơ và tinh thần đồng đội.',
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
        content: "4. Hoạt động vận dụng & Hồi tĩnh:\n4.1. Hồi tĩnh: Thả lỏng toàn thân theo điệu nhạc nhẹ.\n4.2. Vận dụng: Tích hợp BVMT, thu dọn và xếp gậy vào giá trật tự.\n4.3. Đánh giá nhận xét tiết học & Dặn dò tự ôn luyện ở nhà.\n4.4. Xuống lớp.",
        lvd: "4 - 5'\n2L x 8N",
        gv: "- Hướng dẫn học sinh thả lỏng sâu, điều hòa nhịp tim và hơi thở.\n- Hướng dẫn các tổ trưởng thu dọn gậy thể dục cất vào phòng thiết bị.\n- Tuyên dương tinh thần học tập kỷ luật và an toàn của lớp.",
        hs: "- Thả lỏng tay chân thoải mái theo nhịp điều hòa.\n- Tự giác cất gậy ngăn nắp, kiểm tra vệ sinh sạch sẽ sân tập.\n- Ghi nhớ bài tập rèn luyện tại nhà; trật tự giải tán: \"KHỎE!\".",
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
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 1)',
    movementNames: ['Động tác Chân', 'Động tác Bụng (Lườn)'],
    suggestedGame: 'Trò chơi: Nhảy lò cò tiếp sức'
  },
  {
    week: 9,
    grade: 1,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 2)',
    movementNames: ['Động tác Chân', 'Động tác Bụng (Lườn)', 'Ôn Vươn thở, Tay'],
    suggestedGame: 'Trò chơi: Mèo đuổi chuột'
  },
  {
    week: 10,
    grade: 1,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN (Tiết 1)',
    movementNames: ['Động tác Vặn mình', 'Động tác Toàn thân'],
    suggestedGame: 'Trò chơi: Kéo co an toàn'
  },
  {
    week: 10,
    grade: 1,
    lessonNum: 20,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 3: ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN (Tiết 2)',
    movementNames: ['Động tác Vặn mình', 'Động tác Toàn thân', 'Ôn 4 động tác trước'],
    suggestedGame: 'Trò chơi: Chạy tiếp sức'
  },
  {
    week: 11,
    grade: 1,
    lessonNum: 21,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 4: ĐỘNG TÁC ĐIỀU HÒA - HOÀN THIỆN BÀI THỂ DỤC (Tiết 1)',
    movementNames: ['Động tác Điều hòa', 'Hoàn thiện Bài thể dục 8 động tác'],
    suggestedGame: 'Trò chơi: Chim bay cò bay'
  },

  // Khối 3
  {
    week: 9,
    grade: 3,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 4: ĐỘNG TÁC ĐI ĐỀU, ĐỨNG LẠI (Tiết 5 - Đổi chân khi đi đều sai nhịp)',
    movementNames: ['Đổi chân khi đi đều sai nhịp', 'Đi đều, Đứng lại'],
    suggestedGame: 'Trò chơi: Lò cò tiếp sức ném bóng'
  },
  {
    week: 9,
    grade: 3,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 4: ĐỘNG TÁC ĐI ĐỀU, ĐỨNG LẠI (Tiết 6 - Hoàn thiện kỹ thuật)',
    movementNames: ['Đi đều vòng theo cự ly', 'Đứng lại đúng hiệu lệnh'],
    suggestedGame: 'Trò chơi: Bịt mắt bắt dê'
  },
  {
    week: 10,
    grade: 3,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    title: 'Bài 5: ĐI ĐỀU VÒNG PHẢI, ĐI ĐỀU VÒNG TRÁI (Tiết 1)',
    movementNames: ['Đi đều vòng phải', 'Đi đều vòng trái'],
    suggestedGame: 'Trò chơi: Chạy zíc zắc tiếp sức'
  },

  // Khối 5
  {
    week: 9,
    grade: 5,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG VỚI GẬY (Tiết 1)',
    movementNames: ['Động tác Vặn mình với gậy', 'Động tác Bụng với gậy'],
    suggestedGame: 'Trò chơi: Chuyển bóng tiếp sức'
  },
  {
    week: 9,
    grade: 5,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG VỚI GẬY (Tiết 2)',
    movementNames: ['Động tác Vặn mình với gậy', 'Động tác Bụng với gậy', 'Ôn Vươn thở, Tay, Chân'],
    suggestedGame: 'Trò chơi: Lò cò qua cọc tiêu'
  },
  {
    week: 10,
    grade: 5,
    lessonNum: 19,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC PHỐI HỢP, ĐỘNG TÁC NHẢY, ĐỘNG TÁC ĐIỀU HÒA VỚI GẬY (Tiết 1)',
    movementNames: ['Động tác Phối hợp với gậy', 'Động tác Nhảy với gậy', 'Động tác Điều hòa'],
    suggestedGame: 'Trò chơi: Kéo co thể thao'
  }
];

export function normalizeMasterPlan(raw?: Partial<MasterPlanItem> | null): MasterPlanItem {
  const base = masterPlansTuan8.k1_t15;
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(base));
  }

  return {
    id: raw.id || base.id,
    grade: typeof raw.grade === 'number' ? raw.grade : base.grade,
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
      digitalSkill: raw.integrations?.digitalSkill ?? base.integrations.digitalSkill,
      digitalDescription: raw.integrations?.digitalDescription ?? base.integrations.digitalDescription,
      lifeSkills: raw.integrations?.lifeSkills ?? base.integrations.lifeSkills,
      trafficSafety: raw.integrations?.trafficSafety ?? base.integrations.trafficSafety,
      environmentalEducation: raw.integrations?.environmentalEducation ?? base.integrations.environmentalEducation,
    },
    locationEquipment: {
      location: raw.locationEquipment?.location ?? base.locationEquipment.location,
      teacherTools: raw.locationEquipment?.teacherTools ?? base.locationEquipment.teacherTools,
      studentTools: raw.locationEquipment?.studentTools ?? base.locationEquipment.studentTools,
    },
    rows: Array.isArray(raw.rows) && raw.rows.length > 0 ? raw.rows : base.rows,
    postLessonAdjustment: raw.postLessonAdjustment ?? base.postLessonAdjustment,
    signatures: {
      locationDate: raw.signatures?.locationDate ?? base.signatures.locationDate,
      bgh: raw.signatures?.bgh ?? base.signatures.bgh,
      headTeacher: raw.signatures?.headTeacher ?? base.signatures.headTeacher,
      teacher: raw.signatures?.teacher ?? base.signatures.teacher,
    },
  };
}

