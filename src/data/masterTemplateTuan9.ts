import { LessonRow } from '../types/gdtc';
import { MasterPlanItem } from './masterTemplateTuan8';
import { standardFormationDiagrams } from './formationDiagrams';

/**
 * Authoritative Master Lesson Plans for Week 9 (Tuần 9)
 * Transcribed with 100% precision from the teacher's official document:
 * PHANHHIEU1_2627_LEQUOCHUNG_GDTC_TUAN_9_4e35c673.pdf
 */
export const masterPlansTuan9: Record<string, MasterPlanItem> = {
  // ==========================================
  // KHỐI 1 - TUẦN 9 - TIẾT 17 (Trang 3 - 6)
  // ==========================================
  k1_t17: {
    id: 'k1_t17',
    grade: 1,
    week: 9,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC BỤNG (Tiết 1)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập; kiểm tra vệ sinh sân tập, dụng cụ và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung.',
      basicMovement: 'Thực hiện được động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung theo hướng dẫn của GV; biết phối hợp với bạn, xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV; biết tự điều chỉnh tư thế, nhịp tập, hướng di chuyển khi luyện tập động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung.',
      disabledStudents: 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập. Có thể giao những việc mà học sinh thích thú như bắt, tập theo các động tác của GV một cách đơn giản nhất. Tham gia các trò chơi cùng bạn.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp với bạn, tổ/nhóm; chấp hành phân công; hỗ trợ bạn trong tập luyện và trò chơi.',
      problemSolving: 'HS biết quan sát, phát hiện lỗi sai, lựa chọn cách thực hiện an toàn, phù hợp với khả năng của bản thân.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện để hoàn thành nhiệm vụ của bài học.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.',
      responsibility: 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn tập chưa tốt.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    integrations: {
      digitalSkill: '4.1TC1a',
      digitalDescription: 'Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu về thứ tự nhịp, tư thế thân người và sự phối hợp các bộ phận: không chạm thiết bị khi tay ướt, không tự ý bấm và báo giáo viên khi cần hỗ trợ.',
      lifeSkills: 'Rèn ý thức tổ chức kỉ luật, chấp hành hiệu lệnh, phối hợp với bạn và bình tĩnh khi xử lí tình huống.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV; kẻ vẽ sân tập; tranh ảnh SGK, video/học liệu số, còi, dụng cụ phục vụ trò chơi.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao; bảo đảm vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, tình hình sức khỏe của lớp.\n- Phổ biến nội dung yêu cầu giờ học.",
        lvd: "5 - 7'",
        gv: "- GV tiếp nhận tình hình sức khoẻ và đặc điểm của HS.\n- Phổ biến nội dung, yêu cầu tiết học: Học động tác chân, vặn mình; trò chơi Kết bạn.",
        hs: "- Đội hình nhận lớp 4 hàng ngang tập trung.\n- Cán sự tập trung lớp, điểm số, báo cáo sĩ số cho GV.\n- HS lắng nghe, nắm vững nội dung bài học.",
        hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp'
      },
      {
        content: "1.2 Khởi động:\nXoay các khớp cổ tay, cổ chân, hông, vai, gối...\n1.3 Trò chơi bổ trợ khởi động:\n- Trò chơi “Kết bạn”.",
        lvd: "2x8n\n3L",
        gv: "- Khởi động cùng học sinh, nhắc HS xoay đúng biên độ.\n- GV hướng dẫn xếp đội hình vòng tròn, giới thiệu ngắn gọn và hướng dẫn chơi.\n- Khen và tuyên dương HS nhanh chóng, tập trung; hỗ trợ HS gặp khó khăn.",
        hs: "- Cùng KĐ các khớp đều đặn.\n- HS di chuyển thành vòng tròn, lắng nghe và hào hứng tham gia trò chơi Kết bạn.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình khởi động vòng tròn'
      },
      {
        content: "2. Hoạt động hình thành kiến thức:\n2.1. Học động tác chân:\n- N1: Kiễng gót hai tay giang ngang, bàn tay sấp.\n- N2: Khuỵu gối, hai tay chống hông.\n- N3: Như nhịp 1.\n- N4: Về TTCB.\n- N5,6,7,8: Lặp lại nhịp 1,2,3,4.\n2.2. Học động tác vặn mình:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang, hai tay giang ngang.\n- Nhịp 2: Vặn mình sang trái, hai tay phối hợp.\n- Nhịp 3: Như nhịp 1.\n- Nhịp 4: Về TTCB.",
        lvd: "7 - 8'",
        gv: "- Giới thiệu động tác và cho HS quan sát tranh SGK.\n- Tích hợp năng lực số (4.1TC1a): GV nhắc HS quy tắc an toàn khi xem học liệu: tay khô, không tự ý chạm/bấm thiết bị và báo GV khi cần.\n- Giáo viên làm mẫu và hô nhịp cho học sinh tập theo, sau mỗi lần tập giáo viên nhận xét, sửa sai và khích lệ kịp thời.",
        hs: "- Quan sát mẫu và hình dung cách tập, gọi tên đúng động tác.\n- Tích hợp: Học sinh giữ tay khô, không tự ý thao tác trên thiết bị và biết báo GV khi cần hỗ trợ.\n- Đồng loạt tập theo nhịp đếm của GV; sửa sai theo chỉ dẫn.",
        contentImgUrl: '/assets/sgk_chuan/k1_chan.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Chân & Vặn mình (SGK GDTC Lớp 1)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình tập động tác mới'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tổ chức tập đồng loạt:\n- Cả lớp tập động tác chân, vặn mình theo nhịp hô GV (1-2 lần).\n3.2. Luyện tập theo cặp:\n- Từng cặp 2 bạn quay mặt đối diện nhau tập luyện.",
        lvd: "6 - 8'\n1-2 lần\n1-2 lần",
        gv: "- GV hô nhịp cho lớp tập, giải đáp thắc mắc của HS.\n- Hướng dẫn HS tập luyện cặp đôi: 1 bạn tập, 1 bạn hô và quan sát nhận xét; sau đó đổi vị trí cho nhau.\n- GV quan sát, chỉ dẫn sửa sai cho từng cặp; biểu dương cặp đôi hợp tác tốt.",
        hs: "- Đội hình tập đồng loạt 4 hàng ngang.\n- Đội hình luyện tập cặp đôi: 1 HS tập, 1 HS quan sát và nhận xét bạn tập, sau đó đổi vai.",
        hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
        hsImgTitle: 'Đội hình luyện tập cặp đôi'
      },
      {
        content: "3.3 Trò chơi vận động: \"Lò cò tiếp sức\":\n- Mục đích: Rèn luyện sức mạnh của chân, sự khéo léo và tinh thần thi đua đồng đội.\n- Cách chơi: Từng hàng lò cò qua vạch mốc quay về đập tay bạn tiếp theo.",
        lvd: "4 - 6'",
        gv: "- GV nêu tên trò chơi, hướng dẫn cách chơi và luật chơi, tác dụng của trò chơi.\n- Tạo hứng thú cho học sinh khi chơi, làm trọng tài công bằng cho trò chơi.",
        hs: "- HS lắng nghe phổ biến luật chơi và tham gia trò chơi nhiệt tình, chấp hành an toàn.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi Lò cò tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh:\n- Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "5 - 6'\n2x8n",
        gv: "- GV điều hành lớp thả lỏng toàn thân, hít thở sâu.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- Nhận xét đánh giá chung và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Thả lỏng tay, chân, điều hòa nhịp thở.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Đội hình nhận xét và kết thúc giờ học.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh tiếp thu tốt động tác chân và vặn mình, tham gia trò chơi sôi nổi.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 1 - TUẦN 9 - TIẾT 18 (Trang 7 - 10)
  // ==========================================
  k1_t18: {
    id: 'k1_t18',
    grade: 1,
    week: 9,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, VẶN MÌNH, ĐỘNG TÁC BỤNG (Tiết 2)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập; kiểm tra vệ sinh sân tập, dụng cụ và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung.',
      basicMovement: 'Thực hiện được động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung theo hướng dẫn của GV; biết phối hợp với bạn, xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV; biết tự điều chỉnh tư thế, nhịp tập, hướng di chuyển khi luyện tập động tác chân, vặn mình, bụng và ôn các động tác của bài thể dục phát triển chung.',
      disabledStudents: 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, thực hiện theo khả năng.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp với bạn, tổ/nhóm; chấp hành phân công; hỗ trợ bạn trong tập luyện và trò chơi.',
      problemSolving: 'HS biết quan sát, phát hiện lỗi sai, lựa chọn cách thực hiện an toàn, phù hợp với khả năng của bản thân.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện để hoàn thành nhiệm vụ của bài học.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.',
      responsibility: 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn tập chưa tốt.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    integrations: {
      digitalSkill: '4.1TC1a',
      digitalDescription: 'Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu.',
      lifeSkills: 'Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV; kẻ vẽ sân tập theo nội dung bài học; còi, tranh ảnh SGK, video/học liệu số, dụng cụ phục vụ trò chơi.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao; bảo đảm vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, tình hình sức khỏe của lớp.\n- Phổ biến nội dung yêu cầu giờ học.\n1.2. Khởi động:\nXoay các khớp cổ tay, cổ chân, hông, vai, gối..\n1.3. Trò chơi bổ trợ khởi động: Trò chơi “Kết bạn”",
        lvd: "7 - 8'\n2x8n\n3L",
        gv: "- GV tiếp nhận tình hình sức khoẻ và đặc điểm của HS; phổ biến nội dung tiết 18: Học động tác bụng, ôn chân, vặn mình.\n- Tích hợp bảo vệ môi trường: GV hướng dẫn HS kiểm tra vệ sinh sân tập, nhặt vật gây nguy hiểm; sử dụng và thu dọn dụng cụ đúng nơi quy định.\n- Khởi động cùng học sinh, hướng dẫn cách chơi, luật chơi trò chơi Kết bạn; nhận xét biểu dương.",
        hs: "- Đội hình nhận lớp và khởi động tập trung.\n- Cùng KĐ các khớp đều đặn.\n- Thực hiện yêu cầu của giáo viên và tham gia trò chơi hào hứng.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và trò chơi'
      },
      {
        content: "2. Hoạt động hình thành kiến thức:\n2.1 Học động tác bụng:\n- N1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa ra trước vỗ vào nhau.\n- N2: Cúi người gập thân, hai tay chạm mũi bàn chân.\n- N3: Đứng thẳng, hai tay giang ngang bàn tay ngửa.\n- N4: Về TTCB.\n- N5,6,7,8: Như nhịp 1,2,3,4 nhưng bước chân phải.",
        lvd: "4 - 5'",
        gv: "- Giới thiệu động tác và cho HS quan sát tranh SGK.\n- Giáo viên làm mẫu và hô nhịp cho học sinh tập theo với tốc độ chậm, kết hợp diễn giải bằng lời nói với thực hiện thao tác giúp HS có hình dung cụ thể về động tác.\n- Sau mỗi lần tập giáo viên nhận xét, sửa sai và khích lệ động viên kịp thời.",
        hs: "- Quan sát mẫu và hình dung cách tập, gọi tên đúng động tác.\n- Đồng loạt tập theo nhịp đếm của GV; sửa sai theo chỉ dẫn của GV.",
        contentImgUrl: '/assets/sgk_chuan/k1_bung.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Bụng (SGK GDTC Lớp 1)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình tập động tác mới'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1 Tổ chức tập đồng loạt:\n- Ôn tập động tác chân, vặn mình và học động tác bụng (1-2 lần).\n3.2 Luyện tập theo tổ & Thi đua giữa các tổ:\n- Các tổ luyện tập, tổ trưởng hô nhịp.\n- Thi đua giữa các tổ lên biểu diễn.",
        lvd: "8 - 10'\n1-2 lần\n1 lần",
        gv: "- GV hô nhịp cho lớp tập, giải đáp thắc mắc của HS.\n- HD học sinh tập luyện theo tổ; quan sát, chỉ dẫn cho HS sửa sai.\n- Yêu cầu các tổ lên thi đua thực hiện các động tác đã học; đánh giá, tuyên dương.",
        hs: "- Đội hình tập luyện đồng loạt 4 hàng ngang.\n- Cùng GV phát hiện lỗi sai và sửa chữa kịp thời.\n- Các nhóm lên thi đua tập, các bạn khác quan sát nhận xét.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện đồng loạt và theo tổ'
      },
      {
        content: "3.3 Trò chơi \"Lò cò tiếp sức\":\n- Chơi tiếp sức giữa các tổ rèn sức mạnh của chân và tính khéo léo.",
        lvd: "1-2 lần",
        gv: "- Nêu tên trò chơi, hướng dẫn cách chơi và luật chơi, tác dụng của trò chơi.\n- Tạo hứng thú cho học sinh khi chơi; làm trọng tài công bằng.",
        hs: "- HS lắng nghe và tham gia trò chơi sôi nổi, đúng luật.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi Lò cò tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "5 - 6'\n2x8n",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- Nhận xét ưu điểm, hạn chế của tiết học và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Thả lỏng tay chân, điều hòa cơ thể.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Lắng nghe nhận xét chung và trật tự về lớp.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh nắm vững động tác bụng, phối hợp tốt nhịp gập thân.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 2 - TUẦN 9 - TIẾT 17
  // ==========================================
  k2_t17: {
    id: 'k2_t17',
    grade: 2,
    week: 9,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 1)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập; kiểm tra vệ sinh sân tập, thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện động tác Chân và ôn bài thể dục.',
      basicMovement: 'Thực hiện được Động tác Chân (SGK GDTC Lớp 2 Trang 33) theo nhịp hô; phối hợp giữ thăng bằng tốt.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 2, học liệu số hoặc động tác mẫu của GV; tự sửa lỗi khuỵu gối và kiễng gót.',
      disabledStudents: 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, thực hiện ở mức độ cơ bản.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp với bạn, tổ/nhóm; chấp hành phân công; hỗ trợ bạn trong tập luyện và trò chơi.',
      problemSolving: 'HS biết quan sát, phát hiện lỗi sai khi kiễng gót mất thăng bằng hoặc cong lưng và lựa chọn cách khắc phục.',
      disabledStudents: 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện để hoàn thành nhiệm vụ của bài học.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn trung thực.',
      responsibility: 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, giúp đỡ bạn tập chưa tốt.',
      disabledStudents: 'Hòa đồng, tham gia các hoạt động vui vẻ cùng bạn.'
    },
    integrations: {
      digitalSkill: '4.1TC1a',
      digitalDescription: 'Học sinh biết sử dụng thiết bị số an toàn khi quan sát tranh ảnh kỹ thuật động tác Chân SGK Lớp 2.',
      lifeSkills: 'Rèn ý thức tổ chức kỷ luật, chấp hành hiệu lệnh và phối hợp với bạn.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK GDTC Lớp 2, SGV; tranh ảnh SGK, còi, dụng cụ phục vụ trò chơi.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao gọn gàng.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe của lớp.\n- Phổ biến nội dung yêu cầu giờ học: Học động tác Chân; trò chơi Đua ngựa.\n1.2. Khởi động:\n- Xoay các khớp cổ tay, cổ chân, hông, vai, gối...\n1.3. Trò chơi bổ trợ khởi động: Trò chơi “Đua ngựa”.",
        lvd: "6 - 7'\n2x8n",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe và phổ biến mục tiêu tiết 17.\n- Hướng dẫn cán sự khởi động kỹ các khớp; tổ chức trò chơi \"Đua ngựa\" tạo hứng khởi an toàn.",
        hs: "- Đội hình nhận lớp 4 hàng ngang báo cáo sĩ số.\n- Xoay khớp đều đặn và hào hứng tham gia trò chơi \"Đua ngựa\".",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_dua_ngua.svg',
        contentImgTitle: 'Trò chơi bổ trợ khởi động: Đua ngựa - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_nhan_lop') || standardFormationDiagrams[0]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình nhận lớp & khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1. Học Động tác Chân (SGK GDTC Lớp 2 Trang 33):\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Kiễng gót hai chân, hai tay chống hông (lưng thẳng).\n- Nhịp 2: Hạ gót, khuỵu gối sâu giữ lưng thẳng, hai tay đưa ra trước song song ngang vai.\n- Nhịp 3: Đứng thẳng lên kiễng gót như nhịp 1.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Lặp lại như nhịp 1, 2, 3, 4.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- GV giới thiệu Động tác Chân (SGK Lớp 2 Trang 33) và cho HS quan sát tranh kỹ thuật.\n- Thị phạm làm mẫu 2-3 lần theo chiều gương, phân tích nhịp kiễng gót và khuỵu gối giữ thẳng lưng.\n- Hô nhịp chậm hướng dẫn HS tập mô phỏng và sửa sai trực tiếp.",
        hs: "- Quan sát tranh SGK Lớp 2 và động tác mẫu của GV.\n- Thực hiện tập chậm từng nhịp, chú ý giữ thăng bằng và thẳng lưng.",
        contentImgUrl: '/assets/sgk_chuan/k2_chan.svg',
        contentImgTitle: 'Động tác Chân - SGK GDTC Lớp 2 (Trang 33)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình quan sát mẫu'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tổ chức tập đồng loạt cả lớp theo nhịp hô GV (1-2 lần).\n3.2. Luyện tập theo 4 tổ tại 4 góc sân.\n3.3. Luyện tập cặp đôi đối diện sửa sai & Thi đua giữa các tổ.",
        lvd: "12 - 14'\n2-3 lần",
        gv: "- GV hô nhịp cho lớp tập đồng loạt, chuyển sang luyện tập theo tổ và cặp đôi sửa sai.\n- Quan sát, động viên và tổ chức thi đua trình diễn giữa các tổ.",
        hs: "- Đội hình tập đồng loạt 4 hàng ngang, sau đó di chuyển về 4 tổ và cặp đôi đối diện sửa lỗi.\n- Từng tổ lên thi đua tự tin, nhận xét khách quan.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.4. Trò chơi vận động: \"Tìm người chỉ huy\"\n- Mục đích: Rèn phản xạ nhanh, khả năng quan sát và tinh thần đồng đội.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- GV nêu tên trò chơi, phổ biến luật chơi và làm trọng tài điều hành công bằng.",
        hs: "- Đội hình vòng tròn tham gia trò chơi \"Tìm người chỉ huy\" nhiệt tình, an toàn.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_tim_chi_huy.svg',
        contentImgTitle: 'Trò chơi vận động: Tìm người chỉ huy - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tro_choi') || standardFormationDiagrams[7]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình trò chơi vận động'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2x8n",
        gv: "- Điều hành thả lỏng toàn thân, hít thở sâu.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), nhận xét đánh giá tiết học và phát lệnh xuống lớp.",
        hs: "- Thả lỏng tay chân điều hòa nhịp thở.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa; xếp hàng về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_hoi_tinh') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình hồi tĩnh và kết thúc'
      }
    ],
    postLessonAdjustment: 'Học sinh nắm vững kỹ thuật kiễng gót và khuỵu gối thẳng lưng ở Động tác Chân.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 2 - TUẦN 9 - TIẾT 18
  // ==========================================
  k2_t18: {
    id: 'k2_t18',
    grade: 2,
    week: 9,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (Tiết 2)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, vệ sinh sân tập; thực hiện an toàn khi tập động tác Lườn và ôn động tác Chân.',
      basicMovement: 'Thực hiện được Động tác Lườn (SGK GDTC Lớp 2 Trang 34) kết hợp ôn thuần thục Động tác Chân.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 2, tự sửa lỗi nghiêng thân bị xoay ra trước.',
      disabledStudents: 'Linh hoạt áp dụng mức độ nhẹ nhàng phù hợp khả năng HS hòa nhập.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác ôn lại động tác Chân và tích cực khám phá động tác Lườn.',
      collaboration: 'Phối hợp nhịp nhàng với bạn khi tập theo cặp đôi và theo tổ.',
      problemSolving: 'Phát hiện và chỉnh sửa lỗi nghiêng lườn chưa thẳng mặt phẳng bên.',
      disabledStudents: 'Được các bạn trong tổ quan tâm giúp đỡ.'
    },
    qualities: {
      diligence: 'Chăm chỉ, tích cực luyện tập hoàn thành bài học.',
      honesty: 'Trung thực khi tham gia trò chơi và nhận xét bạn.',
      responsibility: 'Giữ gìn vệ sinh sân bãi và thu dọn dụng cụ gọn gàng.',
      disabledStudents: 'Hòa đồng, vui vẻ cùng tập thể.'
    },
    integrations: {
      digitalSkill: '4.1TC1a',
      digitalDescription: 'Quan sát an toàn học liệu số về kỹ thuật động tác Lườn SGK Lớp 2.',
      lifeSkills: 'Tích hợp bảo vệ môi trường: giữ sân tập sạch sẽ, không xả rác.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK GDTC Lớp 2, tranh ảnh minh họa, còi, dụng cụ trò chơi.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, vệ sinh sân tập.\n1.2. Khởi động xoay các khớp cổ tay, cổ chân, vai, hông, gối.\n1.3. Trò chơi bổ trợ khởi động: Trò chơi “Đua ngựa”.",
        lvd: "6 - 7'\n2x8n",
        gv: "- GV nhận lớp, phổ biến mục tiêu tiết 18: Học Động tác Lườn, ôn Động tác Chân.\n- Điều hành khởi động và tổ chức trò chơi \"Đua ngựa\" hào hứng.",
        hs: "- Cán sự tập trung lớp báo cáo sĩ số.\n- Khởi động đều đặn và chơi trò chơi sôi nổi.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_dua_ngua.svg',
        contentImgTitle: 'Trò chơi bổ trợ khởi động: Đua ngựa - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_khoi_dong') || standardFormationDiagrams[1]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1. Ôn Động tác Chân (1-2 lần).\n2.2. Học Động tác Lườn (SGK GDTC Lớp 2 Trang 34):\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang lòng bàn tay ngửa.\n- Nhịp 2: Nghiêng lườn sang trái, tay trái chống hông, tay phải vươn cao áp sát tai.\n- Nhịp 3: Về tư thế nhịp 1.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Đổi chân phải và nghiêng lườn sang phải.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- Cho lớp ôn lại Động tác Chân 1 lần.\n- GV thị phạm Động tác Lườn chuẩn xác theo SGK Lớp 2 Trang 34; nhấn mạnh giữ thẳng hai chân và nghiêng đúng mặt phẳng bên.",
        hs: "- Quan sát tranh SGK Lớp 2 và mẫu của GV.\n- Tập từng nhịp chậm rãi, kéo căng đều cơ liên sườn hai bên.",
        contentImgUrl: '/assets/sgk_chuan/k2_luon.svg',
        contentImgTitle: 'Động tác Lườn - SGK GDTC Lớp 2 (Trang 34)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình quan sát mẫu'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt liên hoàn Động tác Chân + Động tác Lườn.\n3.2. Luyện tập theo 4 tổ & Cặp đôi sửa sai.\n3.3. Thi đua giữa các tổ lên biểu diễn.",
        lvd: "12 - 14'\n2-3 lần",
        gv: "- Điều khiển tập đồng loạt liên hoàn Chân + Lườn, kiểm tra sửa sai theo tổ và tổ chức thi đua tuyên dương.",
        hs: "- Luyện tập đồng loạt, theo tổ và cặp đôi giúp nhau sửa tư thế tay vươn sát tai.\n- Tự tin thi đua giữa các tổ.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình tập luyện theo tổ'
      },
      {
        content: "3.4. Trò chơi vận động: \"Tìm người chỉ huy\"\n- Phát triển khả năng quan sát, phản xạ nhanh và tinh thần tập thể.",
        lvd: "4 - 5'\n1 - 2 lần",
        gv: "- Phổ biến luật chơi, làm trọng tài điều hành công bằng, đảm bảo an toàn.",
        hs: "- Đội hình vòng tròn tham gia trò chơi hào hứng, trung thực.",
        contentImgUrl: '/assets/sgk_chuan/k2_tro_choi_tim_chi_huy.svg',
        contentImgTitle: 'Trò chơi vận động: Tìm người chỉ huy - SGK GDTC Lớp 2',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_tro_choi') || standardFormationDiagrams[7]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình trò chơi vận động'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2x8n",
        gv: "- Điều hành lớp thả lỏng toàn thân, nêu câu hỏi vận dụng sách giáo khoa, nhận xét tiết học và phát lệnh xuống lớp.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa, thu dọn sân tập và về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k2_xuong_lop') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 2 - Đội hình hồi tĩnh và kết thúc'
      }
    ],
    postLessonAdjustment: 'Học sinh thực hiện tốt liên hoàn Động tác Chân và Động tác Lườn đúng biên độ.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 3 - TUẦN 9 - TIẾT 17 (Trang 10 - 13)
  // ==========================================
  k3_t17: {
    id: 'k3_t17',
    grade: 3,
    week: 9,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 1)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; thực hiện các yêu cầu bảo đảm an toàn trước, trong và sau khi tập luyện nội dung động tác vươn thở, động tác tay của bài thể dục.',
      basicMovement: 'Thực hiện được động tác vươn thở, động tác tay của bài thể dục theo hướng dẫn của GV; biết xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV về động tác vươn thở, động tác tay của bài thể dục; biết tự điều chỉnh động tác khi luyện tập.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp với bạn, tổ/nhóm; chấp hành phân công; hỗ trợ bạn trong tập luyện.',
      problemSolving: 'HS biết quan sát, phát hiện lỗi sai, lựa chọn cách thực hiện an toàn, phù hợp.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện để hoàn thành nhiệm vụ học tập.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét trung thực kết quả tập luyện của bản thân và bạn.',
      responsibility: 'Có ý thức bảo đảm an toàn cho bản thân và bạn trong khi tập luyện, tham gia trò chơi.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về phẩm chất, tham gia các hoạt động vui vẻ cùng bạn.'
    },
    integrations: {
      digitalSkill: '5.1.CB1a',
      digitalDescription: 'HS nhận biết được một số vấn đề đơn giản khi tranh/video không hiển thị; biết thử lại theo hướng dẫn hoặc nhờ GV hỗ trợ.',
      lifeSkills: 'Rèn tác phong nhanh nhẹn, đoàn kết, giúp đỡ bạn tập chưa tốt; tích hợp bảo vệ môi trường thu dọn dụng cụ gọn gàng.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV; kẻ vẽ sân tập theo nội dung bài học; còi, cờ, tranh ảnh SGK, video/học liệu số, dụng cụ luyện tập phù hợp.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao; bảo đảm vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp:\n- Hoạt động của cán sự lớp; hoạt động của giáo viên.\n1.2 Khởi động:\n- Khởi động chung: Xoay các khớp cổ tay, cổ chân, vai, hông, gối,...\n- Khởi động chuyên môn: Chạy tại chỗ nâng cao đùi, đánh gót, phối hợp nhảy bật tách chân, nhảy đổi chân.\n1.3 Trò chơi: “Chui qua hầm”.",
        lvd: "6 - 8'\n2x8n\n3L",
        gv: "- GV nhận lớp phổ biến nội dung, yêu cầu của giờ học; hỏi thăm sức khỏe của HS và trang phục tập luyện.\n- Giáo viên di chuyển và quan sát, chỉ dẫn cho HS thực hiện; làm mẫu động tác khởi động chuyên môn.\n- GV quan sát chỉnh sửa tư thế đúng trực tiếp tại chỗ cho HS; khen và tuyên dương HS.\n- Hướng dẫn trò chơi Chui qua hầm an toàn.",
        hs: "- Cán sự tập trung lớp, điểm số, báo cáo sĩ số, tình hình của lớp học cho GV.\n- Đội hình khởi động 4 hàng ngang giãn cách.\n- HS quan sát và thực hiện theo GV: chạy tại chỗ nâng cao đùi, đánh gót, nhảy bật tách chân.\n- HS phối hợp bật nhảy và chơi trò chơi hào hứng.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1 Học động tác vươn thở và động tác tay:\n* Động tác vươn thở:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang, hai tay vươn lên cao chếch chữ V, ngửa đầu, hít vào sâu.\n- Nhịp 2: Hai tay bắt chéo trước bụng, cúi đầu nhẹ, thở ra.\n- Nhịp 3: Như nhịp 1, hít vào.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.\n* Động tác tay:\n- TTCB: Đứng nghiêm.\n- Nhịp 1: Kiễng gót, hai tay đưa ra trước vỗ tay.\n- Nhịp 2: Đứng hạ gót, hai tay giang ngang bàn tay ngửa.\n- Nhịp 3: Như nhịp 1.\n- Nhịp 4: Về TTCB.",
        lvd: "6 - 8'\n1-2 lần\n1-2 lần",
        gv: "- Cho HS quan sát tranh động tác SGK.\n- Tích hợp năng lực số 5.1.CB1a: GV nêu cách xử lí khi tranh/video không hiển thị: kiểm tra lại theo hướng dẫn, không tự ý bấm nhiều lần và báo GV để được hỗ trợ.\n- GV làm mẫu động tác kết hợp phân tích kĩ thuật từng nhịp.\n- GV cùng HS nhận xét, đánh giá tuyên dương.",
        hs: "- Đội hình HS quan sát GV làm mẫu động tác.\n- Tích hợp: HS nhận biết được một số vấn đề đơn giản khi tranh/video không hiển thị; biết thử lại theo hướng dẫn hoặc nhờ GV hỗ trợ.\n- HS quan sát lắng nghe GV chỉ dẫn, nhận xét để vận dụng vào tập luyện.",
        contentImgUrl: '/assets/sgk_chuan/k1_vuon_tho.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vươn thở & Động tác Tay (SGK GDTC Lớp 3)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình HS quan sát GV làm mẫu động tác'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt:\n- Toàn lớp tập động tác vươn thở, động tác tay theo nhịp hô GV.\n3.2. Tập theo tổ:\n- Các tổ về vị trí sân bãi luyện tập, tổ trưởng hô nhịp.\n- Thi đua giữa các tổ: Từng tổ lên biểu diễn.",
        lvd: "4 - 5'\n1-2 lần",
        gv: "- GV tổ chức cho HS luyện tập: Luyện tập đồng loạt, GV hướng dẫn quan sát chung, sửa sai cho HS.\n- GV cho mỗi nhóm lên thi đua – trình diễn, nhận xét đánh giá.",
        hs: "- Đội hình tập luyện đồng loạt 4 hàng ngang.\n- Đội hình tập luyện theo tổ: Thực hiện thi đua giữa các tổ; HS quan sát bạn trình diễn, đưa ra nhận xét của cá nhân.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện đồng loạt và theo tổ'
      },
      {
        content: "3.3. Trò chơi vận động: Trò chơi “Đua ô tô”.\n3.4 Bài tập phát triển thể lực: Cho HS chạy XP cao 15m.",
        lvd: "4 - 6'\n2x8n",
        gv: "- GV nêu tên trò chơi, hướng dẫn cách chơi theo trình tự, tổ chức của trò chơi.\n- Cho HS chơi thử và chơi chính thức, phân định thắng thua.\n- GV hướng dẫn HS tập chạy xuất phát cao 15m rèn luyện thể lực.",
        hs: "- HS tích cực tham gia trò chơi Đua ô tô đúng luật, hào hứng.\n- Cả lớp tập luyện chạy XP cao 15m kết hợp đi lại hít thở sâu.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi Đua ô tô & Chạy tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng:\n4.1 Hồi tĩnh: Thả lỏng toàn thân.\n4.2 Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3 Nhận xét & Xuống lớp.",
        lvd: "4 - 6'\n2x8n",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có), tổ chức cho học sinh quan sát và trả lời.\n- GV nhận xét kết quả, ý thức, thái độ của HS và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Rũ tay, thả lỏng chân, hít thở sâu.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa.\n- Đội hình nhận xét kết thúc giờ học.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh nắm vững 2 động tác Vươn thở và Tay, thực hiện nhịp nhàng, đúng biên độ.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 3 - TUẦN 9 - TIẾT 18 (Trang 14 - 17)
  // ==========================================
  k3_t18: {
    id: 'k3_t18',
    grade: 3,
    week: 9,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 1: ĐỘNG TÁC VƯƠN THỞ, ĐỘNG TÁC TAY (Tiết 2)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; thực hiện các yêu cầu bảo đảm an toàn trước, trong và sau khi tập luyện nội dung động tác vươn thở, động tác tay của bài thể dục.',
      basicMovement: 'Thực hiện được động tác vươn thở, động tác tay của bài thể dục theo hướng dẫn của GV; biết xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV về động tác vươn thở, động tác tay của bài thể dục; biết tự điều chỉnh động tác khi luyện tập.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, thực hiện theo khả năng.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'HS biết phối hợp với bạn, tổ/nhóm; chấp hành phân công; hỗ trợ bạn trong tập luyện.',
      problemSolving: 'HS biết quan sát, phát hiện lỗi sai, lựa chọn cách thực hiện an toàn, phù hợp.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện để hoàn thành nhiệm vụ học tập.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét trung thực kết quả tập luyện của bản thân và bạn.',
      responsibility: 'Có ý thức bảo đảm an toàn cho bản thân và bạn trong khi tập luyện, tham gia trò chơi.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về phẩm chất, tham gia các hoạt động vui vẻ cùng bạn.'
    },
    integrations: {
      digitalSkill: '5.1.CB1a',
      digitalDescription: 'HS nhận biết được một số vấn đề đơn giản khi tranh/video không hiển thị; biết thử lại theo hướng dẫn hoặc nhờ GV hỗ trợ.',
      lifeSkills: 'Tích hợp bảo vệ môi trường: HS kiểm tra và giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV; kẻ vẽ sân tập theo nội dung bài học; còi, cờ, tranh ảnh SGK, video/học liệu số, dụng cụ luyện tập phù hợp.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao; bảo đảm vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp: Cán sự lớp tập trung lớp, điểm số, báo cáo sĩ số.\n1.2 Khởi động chung: Xoay các khớp cổ tay, cổ chân, vai, hông, gối,...\n1.3 Khởi động chuyên môn: Chạy tại chỗ nâng cao đùi, đánh gót, nhảy bật tách chân.\n- Trò chơi: “Chui qua hầm”.",
        lvd: "6 - 8'\n2x8n\n1 lần\n1-2 lần",
        gv: "- GV nhận lớp phổ biến nội dung, yêu cầu của giờ học.\n- Tích hợp bảo vệ môi trường: GV nhắc HS kiểm tra vệ sinh sân tập, nhặt rác hoặc vật gây nguy hiểm; sử dụng và thu dọn dụng cụ đúng nơi quy định.\n- Làm mẫu động tác khởi động, quan sát chỉnh sửa tư thế đúng trực tiếp cho HS.\n- Giới thiệu ngắn gọn, hướng dẫn trò chơi Chui qua hầm an toàn.",
        hs: "- Cán sự tập trung lớp, báo cáo sĩ số cho GV.\n- Khởi động đều đặn, chạy nâng cao đùi, đánh gót, nhảy bật tách chân.\n- Tham gia chơi trò chơi Chui qua hầm đúng luật, an toàn.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1 Học động tác vươn thở (Ôn tập & hoàn thiện).\n2.2 Học động tác tay (Ôn tập & hoàn thiện).",
        lvd: "5 phút",
        gv: "- GV làm mẫu lại động tác kết hợp phân tích kĩ thuật động tác.\n- Hô khẩu lệnh và thực hiện động tác mẫu; chọn 1-2 HS lên thực hiện lại động tác.\n- GV hỏi HS về động tác của bạn vừa thực hiện, nhận xét sửa sai kịp thời.",
        hs: "- Đội hình quan sát GV làm mẫu động tác.\n- HS quan sát lắng nghe GV chỉ dẫn, nhận xét để vận dụng vào tập luyện.\n- Từng bạn tự tin lên thực hiện động tác mẫu.",
        contentImgUrl: '/assets/sgk_chuan/k1_tay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Ôn Động tác Vươn thở & Động tác Tay (SGK GDTC Lớp 3)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình HS quan sát GV làm mẫu động tác'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1 Tập đồng loạt:\n- Toàn lớp tập động tác vươn thở và tay theo nhịp còi GV.\n3.2. Tập theo tổ:\n- Từng tổ luyện tập, tổ trưởng hô nhịp.\n* Thi đua giữa các tổ: Các tổ lên trình diễn.",
        lvd: "6 - 7'\n1-2 lần\n1 lần",
        gv: "- GV tổ chức luyện tập đồng loạt; quan sát sửa sai cho HS.\n- Hướng dẫn cán sự lớp hô nhịp, nhắc lại những lỗi thường gặp như sai hướng, biên độ động tác.\n- Cho mỗi nhóm lên thi đua – trình diễn; nhận xét, đánh giá, tuyên dương.",
        hs: "- Đội hình tập luyện đồng loạt.\n- Đội hình tập luyện theo tổ; thực hiện thi đua giữa các tổ; quan sát phần trình diễn của bạn và đưa ra nhận xét.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện theo tổ'
      },
      {
        content: "3.3. Trò chơi vận động: Trò chơi “Đua ô tô”.\n3.4. Bài tập phát triển thể lực: Cho HS chạy XP cao 15m; bật nhảy tại chỗ.",
        lvd: "2 - 3'\n1 lần\n1 lần",
        gv: "- GV nêu tên trò chơi, hướng dẫn cách chơi theo trình tự; cho HS chơi thử và chơi chính thức.\n- Hướng dẫn bài tập phát triển thể lực chạy 15m và bật nhảy tại chỗ.",
        hs: "- HS tích cực tham gia trò chơi Đua ô tô đúng luật, an toàn.\n- Cả lớp tập luyện chạy và bật nhảy kết hợp đi lại hít thở.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi Đua ô tô'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1 Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n4.3 Nhận xét & Xuống lớp.",
        lvd: "4 - 6'\n2x8n",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có) và tích hợp BVMT thu dọn dụng cụ để đúng nơi quy định.\n- Hỏi HS về cảm nhận giờ học, tuyên dương tổ tập tốt và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Thả lỏng toàn thân, hít thở sâu.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa; kiểm tra vệ sinh sân tập, nhặt vật nguy hiểm, cất dụng cụ.\n- Trình bày ý kiến và cảm nhận của mình về giờ học; đi thẳng hàng về lớp.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh nắm vững kỹ thuật, thực hiện động tác tay và vươn thở chuẩn xác.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 4 - TUẦN 9 - TIẾT 17
  // ==========================================
  k4_t17: {
    id: 'k4_t17',
    grade: 4,
    week: 9,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 1)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; kiểm tra độ an toàn vòng thể dục trước khi tập.',
      basicMovement: 'Thực hiện được Động tác Chân với vòng thể dục (SGK GDTC Lớp 4 Trang 31) đúng tư thế kiễng gót và khuỵu gối.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 4, học liệu số hoặc mẫu của GV để tự chỉnh sửa tư thế giữ vòng.',
      disabledStudents: 'Giảm nhẹ yêu cầu về biên độ khuỵu gối, thực hiện an toàn với tinh thần hòa nhập.'
    },
    generalCompetencies: {
      autonomy: 'HS chủ động chuẩn bị vòng thể dục, trang phục; tự giác luyện tập, tự sửa lỗi theo hướng dẫn.',
      collaboration: 'Phối hợp giữ cự ly an toàn 1.5m khi cầm vòng; hỗ trợ bạn trong tổ/nhóm.',
      problemSolving: 'Phát hiện lỗi gù lưng khi khuỵu gối hoặc mất thăng bằng khi kiễng gót để tự khắc phục.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực chung theo khả năng HS.'
    },
    qualities: {
      diligence: 'Tích cực, tự giác tập luyện hoàn thành nhiệm vụ bài học.',
      honesty: 'Thực hiện đúng luật chơi, nhận xét trung thực kết quả của bản thân và bạn.',
      responsibility: 'Bảo quản vòng thể dục cẩn thận, giữ an toàn cho bản thân và bạn.',
      disabledStudents: 'Tham gia vui vẻ, hòa đồng cùng tập thể.'
    },
    integrations: {
      digitalSkill: '5.1.CB1a',
      digitalDescription: 'HS biết quan sát tranh ảnh kỹ thuật số SGK Lớp 4 và xử lí đơn giản khi thiết bị trình chiếu gặp sự cố.',
      lifeSkills: 'Rèn ý thức kỷ luật, sự khéo léo giữ thăng bằng và phối hợp đồng đội.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK GDTC Lớp 4, SGV; còi, tranh ảnh SGK, vòng thể dục.',
      studentTools: 'Mỗi HS 1 vòng thể dục an toàn, trang phục và giày thể thao.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp: Cán sự tập hợp báo cáo sĩ số; GV kiểm tra trang phục, dụng cụ vòng.\n1.2. Khởi động xoay các khớp cổ tay, cổ chân, vai, hông, gối kết hợp xoay vòng nhẹ.\n1.3. Trò chơi bổ trợ khởi động: Trò chơi “Chuyền vòng tiếp sức”.",
        lvd: "6 - 7'\n2x8n",
        gv: "- GV nhận lớp, phổ biến nội dung tiết 17: Học Động tác Chân với vòng thể dục.\n- Hướng dẫn khởi động kỹ các khớp cổ chân, đầu gối và tổ chức trò chơi bổ trợ \"Chuyền vòng tiếp sức\".",
        hs: "- Cán sự tập trung 4 hàng ngang báo cáo sĩ số.\n- Khởi động đều đặn và tích cực tham gia trò chơi an toàn.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_nhan_lop') || standardFormationDiagrams[0]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình nhận lớp với vòng thể dục'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1. Học Động tác Chân với vòng thể dục (SGK GDTC Lớp 4 Trang 31):\n- TTCB: Đứng nghiêm, hai tay cầm hai bên mép vòng trước đùi.\n- Nhịp 1: Kiễng gót hai chân, hai tay đưa vòng ra trước ngang vai.\n- Nhịp 2: Hạ gót, khuỵu gối sâu giữ lưng thẳng, đồng thời nâng vòng lên cao qua đầu.\n- Nhịp 3: Đứng thẳng lên kiễng gót, hạ vòng ngang vai.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Lặp lại như nhịp 1, 2, 3, 4.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- GV giới thiệu Động tác Chân với vòng (SGK Lớp 4 Trang 31), cho HS quan sát tranh kỹ thuật.\n- Làm mẫu 2-3 lần theo chiều gương, nhấn mạnh giữ thẳng lưng khi khuỵu gối và nâng vòng qua đầu cân đối.\n- Hô nhịp chậm cho lớp tập mô phỏng và sửa lỗi từng em.",
        hs: "- Đội hình 4 hàng ngang giãn cách 1.5m quan sát mẫu GV và tranh SGK Lớp 4.\n- Tập trung thực hiện từng nhịp kiễng gót, khuỵu gối vững vàng với vòng.",
        contentImgUrl: '/assets/sgk_chuan/k4_chan_vong.svg',
        contentImgTitle: 'Động tác Chân với vòng thể dục - SGK GDTC Lớp 4 (Trang 31)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình quan sát làm mẫu với vòng'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt cả lớp theo nhịp hô GV.\n3.2. Tập theo 4 tổ tại 4 khu vực sân bãi.\n3.3. Tập cặp đôi đối diện sửa sai & Thi đua giữa các tổ.",
        lvd: "13 - 15'\n2-3 lần",
        gv: "- Điều hành tập đồng loạt, kiểm tra 4 tổ và hướng dẫn cặp đôi kiểm tra thăng bằng lưng thẳng cho nhau.\n- Tổ chức thi đua trình diễn và tuyên dương tổ tập đẹp.",
        hs: "- Tập đồng loạt 4 hàng ngang, chuyển về 4 tổ và cặp đôi hỗ trợ sửa lỗi khuỵu gối.\n- Từng tổ lên thi đua tự tin.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.4. Trò chơi vận động: “Chuyền vòng tiếp sức”\n- Phát triển sức nhanh, sự khéo léo và tinh thần phối hợp đồng đội.",
        lvd: "4 - 5'\n2 - 3 lượt",
        gv: "- GV hướng dẫn luật chơi chi tiết, nhắc quy tắc chuyền vòng an toàn và làm trọng tài công bằng.",
        hs: "- 4 đội hàng dọc thi đấu sôi nổi, cổ vũ văn minh.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi vận động: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tro_choi') || standardFormationDiagrams[8]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Sơ đồ trò chơi Chuyền vòng tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Thu dọn vòng thể dục ngăn nắp.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2x8n",
        gv: "- Điều hành thả lỏng toàn thân, nêu câu hỏi vận dụng sách giáo khoa, hướng dẫn cất vòng gọn gàng và nhận xét xuống lớp.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa, cất vòng đúng nơi quy định và về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_hoi_tinh') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình hồi tĩnh và kết thúc'
      }
    ],
    postLessonAdjustment: 'Học sinh giữ thăng bằng tốt, thực hiện Động tác Chân với vòng thể dục đúng nhịp.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 4 - TUẦN 9 - TIẾT 18
  // ==========================================
  k4_t18: {
    id: 'k4_t18',
    grade: 4,
    week: 9,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN VỚI VÒNG THỂ DỤC (Tiết 2)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết vệ sinh sân tập, chuẩn bị trang phục và kiểm tra độ an toàn vòng thể dục trước khi tập.',
      basicMovement: 'Thực hiện được Động tác Lườn với vòng thể dục (SGK GDTC Lớp 4 Trang 32) và ôn Động tác Chân với vòng.',
      sportsCompetency: 'Biết quan sát tranh ảnh SGK GDTC Lớp 4, tự chỉnh sửa lỗi tay cầm vòng bị chùng khi nghiêng lườn.',
      disabledStudents: 'Giảm nhẹ biên độ nghiêng lườn, thực hiện theo khả năng cá nhân.'
    },
    generalCompetencies: {
      autonomy: 'Tự giác ôn lại động tác Chân với vòng và tích cực học động tác Lườn với vòng.',
      collaboration: 'Phối hợp giữ cự ly 1.5m khi cầm vòng và góp ý sửa sai theo cặp đôi.',
      problemSolving: 'Nhận biết lỗi xoay người thay vì nghiêng lườn mặt phẳng bên để tự điều chỉnh.',
      disabledStudents: 'Được bạn và giáo viên hỗ trợ tích cực.'
    },
    qualities: {
      diligence: 'Chăm chỉ, tự giác tập luyện liên hoàn các động tác với vòng.',
      honesty: 'Trung thực trong thi đấu trò chơi và nhận xét tổ bạn.',
      responsibility: 'Giữ gìn dụng cụ, cất vòng đúng nơi quy định sau giờ học.',
      disabledStudents: 'Hòa đồng, đoàn kết cùng bạn bè.'
    },
    integrations: {
      digitalSkill: '5.1.CB1a',
      digitalDescription: 'Quan sát tranh ảnh kỹ thuật số động tác Lườn với vòng SGK Lớp 4 an toàn.',
      lifeSkills: 'Tích hợp bảo vệ môi trường: giữ sân bãi sạch đẹp và cất dụng cụ đúng nơi quy định.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK GDTC Lớp 4, còi, tranh ảnh minh họa, vòng thể dục.',
      studentTools: 'Mỗi HS 1 vòng thể dục an toàn, trang phục thể thao.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1. Nhận lớp: Kiểm tra sĩ số, trang phục, sức khỏe và vòng thể dục.\n1.2. Khởi động xoay kỹ các khớp theo nhạc.\n1.3. Trò chơi bổ trợ khởi động: Trò chơi “Chuyền vòng tiếp sức”.",
        lvd: "6 - 7'\n2x8n",
        gv: "- GV nhận lớp, phổ biến mục tiêu tiết 18: Ôn Động tác Chân với vòng, học mới Động tác Lườn với vòng.\n- Hướng dẫn khởi động các khớp và tổ chức trò chơi bổ trợ.",
        hs: "- Cán sự tập trung lớp báo cáo sĩ số.\n- Khởi động đều đặn và tham gia trò chơi an toàn.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_khoi_dong') || standardFormationDiagrams[1]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình khởi động với vòng'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới\n2.1. Ôn Động tác Chân với vòng (1-2 lần).\n2.2. Học mới Động tác Lườn với vòng thể dục (SGK GDTC Lớp 4 Trang 32):\n- TTCB: Đứng nghiêm, hai tay cầm hai bên mép vòng trước đùi.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa vòng lên cao qua đầu.\n- Nhịp 2: Nghiêng lườn sâu sang trái, hai tay giữ thẳng nâng vòng theo trục thân, hai chân thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Đổi chân phải và nghiêng lườn sang phải.",
        lvd: "7 - 8'\n2 - 3 lần",
        gv: "- Cho lớp ôn lại Động tác Chân với vòng 1 lần.\n- GV làm mẫu Động tác Lườn với vòng chuẩn xác theo SGK Lớp 4 Trang 32; phân tích tư thế thẳng tay nâng vòng và nghiêng đúng mặt phẳng bên.",
        hs: "- Đội hình 4 hàng ngang 1.5m quan sát mẫu GV và tranh SGK Lớp 4.\n- Tập từng nhịp chậm rãi, cảm nhận căng giãn cơ lườn hai bên.",
        contentImgUrl: '/assets/sgk_chuan/k4_luon_vong.svg',
        contentImgTitle: 'Động tác Lườn với vòng thể dục - SGK GDTC Lớp 4 (Trang 32)',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tap_mau') || standardFormationDiagrams[2]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình quan sát làm mẫu'
      },
      {
        content: "3. Hoạt động luyện tập\n3.1. Tập đồng loạt liên hoàn Động tác Chân + Động tác Lườn với vòng.\n3.2. Tập theo 4 tổ & Cặp đôi đối diện sửa sai.\n3.3. Thi đua biểu diễn giữa các tổ.",
        lvd: "13 - 15'\n2-3 lần",
        gv: "- Điều hành tập đồng loạt liên hoàn 2 động tác với vòng, kiểm tra sửa sai theo tổ và cặp đôi.\n- Tổ chức thi đua trình diễn và biểu dương.",
        hs: "- Tập luyện đồng loạt, theo tổ và cặp đôi tích cực; sửa lỗi chùng tay khi nghiêng lườn.\n- Tự tin biểu diễn thi đua giữa các tổ.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_to_nhom') || standardFormationDiagrams[4]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình tập luyện theo tổ'
      },
      {
        content: "3.4. Trò chơi vận động: “Chuyền vòng tiếp sức”\n- Rèn luyện tốc độ, sự khéo léo và tinh thần đoàn kết.",
        lvd: "4 - 5'\n2 - 3 lượt",
        gv: "- Điều hành thi đấu giữa 4 đội hàng dọc công bằng, đảm bảo an toàn khi di chuyển tiếp sức.",
        hs: "- Thi đấu hào hứng, phối hợp nhịp nhàng, cổ vũ bạn văn minh.",
        contentImgUrl: '/assets/sgk_chuan/k4_tro_choi_chuyen_vong.svg',
        contentImgTitle: 'Trò chơi vận động: Chuyền vòng tiếp sức - SGK GDTC Lớp 4',
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_tro_choi') || standardFormationDiagrams[8]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Sơ đồ trò chơi Chuyền vòng tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT kiểm tra vệ sinh sân tập, thu dọn vòng.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'\n2x8n",
        gv: "- Điều hành thả lỏng toàn thân, nêu câu hỏi vận dụng sách giáo khoa, nhắc cất vòng ngăn nắp và phát lệnh xuống lớp.",
        hs: "- Thả lỏng cơ thể, trả lời câu hỏi vận dụng sách giáo khoa, thu dọn vòng và xếp hàng về lớp.",
        hsImgUrl: (standardFormationDiagrams.find((d) => d.id === 'f_k4_xuong_lop') || standardFormationDiagrams[15]).svgDataUrl,
        hsImgTitle: 'Khối 4 - Đội hình hồi tĩnh và xuống lớp'
      }
    ],
    postLessonAdjustment: 'Học sinh thực hiện tốt liên hoàn Động tác Chân và Động tác Lườn với vòng thể dục.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 5 - TUẦN 9 - TIẾT 17 (Trang 17 - 21)
  // ==========================================
  k5_t17: {
    id: 'k5_t17',
    grade: 5,
    week: 9,
    lessonNum: 17,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY (Tiết 1)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết thực hiện vệ sinh sân tập, thực hiện vệ sinh cá nhân để đảm bảo an toàn trong tập luyện.',
      basicMovement: 'Biết khẩu lệnh và thực hiện được các bài tập, Trò chơi “trao gậy tiếp sức”.',
      sportsCompetency: 'Biết quan sát tranh, tự khám phá bài và quan sát động tác làm mẫu của giáo viên để tập luyện.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
    },
    generalCompetencies: {
      autonomy: 'Tự xem trước các động tác động tác bụng, động tác vặn mình, động tác toàn thân với gậy, Trò chơi “Nhảy lò cò tiếp sức” trong sách giáo khoa.',
      collaboration: 'Biết phân công, hợp tác trong nhóm để thực hiện các động tác và trò chơi; biết phối hợp với bạn trong quá trình tập luyện và tham gia trò chơi.',
      problemSolving: 'Biết quan sát, nhận xét tình huống vận động; tự sửa lỗi khi thực hiện động tác với gậy.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Đoàn kết, nghiêm túc, tích cực trong tập luyện và hoạt động tập thể.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét trung thực.',
      responsibility: 'Tích cực tham gia các trò chơi vận động, có trách nhiệm trong khi chơi trò chơi và hình thành thói quen tập luyện TDTT.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về phẩm chất, tham gia các trò chơi một cách vui vẻ, bày tỏ cảm xúc với bạn bè, tìm sự hỗ trợ khi cần thiết.'
    },
    integrations: {
      digitalSkill: '6.1TC2a',
      digitalDescription: 'Học sinh làm quen và bước đầu nhận thức được sự hỗ trợ của trí tuệ nhân tạo (AI) thông qua việc quan sát phần mềm phân tích tư thế chân, tay, thân người, cách cầm gậy, biên độ và nhịp động tác đúng/sai mà giáo viên giới thiệu.',
      lifeSkills: 'Rèn tác phong nhanh nhẹn, ý thức kỷ luật, an toàn khi cầm dụng cụ gậy thể dục.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV. Kẻ vẽ sân tập theo nội dung bài học. Còi, cờ, tranh ảnh, băng đĩa hình, dụng cụ gậy luyện tập.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao, đảm bảo vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục tập luyện, sức khỏe của HS.\n- Phổ biến nội dung, yêu cầu tiết học: Học động tác bụng với gậy; trò chơi Ai kéo khoẻ hơn.\n1.2. Khởi động:\n- Xoay các khớp cổ tay, cổ chân, vai, hông, gối,...\n- Khởi động chuyên môn: Chạy xuất phát cao, nâng cao đùi, gót chạm mông.\n1.3. Trò chơi bổ trợ khởi động: Trò chơi \"Ai kéo khoẻ hơn\".\n- Kiểm tra bài cũ: Gọi 1-2 HS lên thực hiện nội dung động tác đã học.",
        lvd: "5 - 7'\n2Lx8N",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe học sinh; phổ biến nội dung, yêu cầu giờ học.\n- Quan sát, nhắc học sinh tập đúng biên độ, nhịp hô; thực hiện động tác khởi động; chú ý an toàn khi chạy về.\n- Tổ chức cho HS chơi trò chơi bổ trợ; gọi 1 tổ lên thực hiện, quan sát đánh giá.\n- Kiểm tra bài cũ 1-2 HS, nhận xét biểu dương.",
        hs: "- Cán sự tập trung lớp, điểm số, báo cáo sĩ số, tình hình lớp cho GV; lắng nghe nội dung bài học.\n- Khởi động theo sự điều khiển của cán sự, chú ý quan sát.\n- Chú ý nắm luật chơi, tích cực tham gia trò chơi bổ trợ.\n- HS lên kiểm tra bài cũ theo yêu cầu của GV.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới:\n2.1 Học động tác bụng với gậy:\n- TTCB: Đứng nghiêm, hai tay cầm hai đầu gậy xuôi trước đùi.\n- Nhịp 1: Chân trái bước sang ngang, hai tay đưa gậy lên cao chếch chữ V, ngửa đầu.\n- Nhịp 2: Gập thân sâu, hai tay đưa gậy chạm mũi chân, cúi đầu thở ra.\n- Nhịp 3: Như nhịp 1.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.",
        lvd: "5 - 7'",
        gv: "- Tích hợp năng lực số (6.1TC2a): GV giới thiệu ngắn phần mềm có AI hỗ trợ phân tích tư thế chân, tay, thân người, cách cầm gậy, biên độ và nhịp với gậy.\n- GV sẽ thực hiện lại và phân tích các nhịp để học sinh quan sát.\n- GV giải đáp thắc mắc của HS nếu có.",
        hs: "- Tích hợp: Học sinh làm quen và bước đầu nhận thức được sự hỗ trợ của trí tuệ nhân tạo (AI) thông qua việc quan sát phần mềm phân tích tư thế đúng/sai mà giáo viên giới thiệu.\n- HS quan sát tranh, thảo luận trả lời câu hỏi; quan sát mẫu và ghi nhớ cách thực hiện.",
        contentImgUrl: '/assets/sgk_chuan/k5_bung_voi_gay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Bụng với gậy (SGK GDTC Lớp 5)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình quan sát làm mẫu động tác'
      },
      {
        content: "3. Hoạt động luyện tập:\n3.1. Tập đồng loạt (1-2 lần):\n- Toàn lớp tập động tác bụng với gậy.\n3.2. Tập theo tổ nhóm (2-3 lần):\n- 4 tổ về 4 khu vực, tổ trưởng điều khiển.\n3.3. Tập theo cặp đôi (1-2 lần):\n- 2 HS quay mặt vào nhau tạo thành cặp để tập luyện và sửa sai.\n- Thi đua giữa các tổ: Từng tổ lên trình diễn.",
        lvd: "15 - 16'\n1-2 lần\n2-3 lần\n1-2 lần",
        gv: "- GV quan sát, sửa sai cho HS khi tập đồng loạt.\n- Giao nhiệm vụ cho tổ trưởng, phân khu vực luyện tập; quan sát nhắc nhở và sửa sai.\n- Cho 2 HS quay mặt vào nhau tập luyện cặp đôi: 1 HS tập, 1 HS hô và quan sát nhận xét, sau đó đổi vai.\n- Tổ chức cho HS thi đua giữa các tổ; đánh giá tuyên dương.",
        hs: "- Đội hình tập luyện đồng loạt; cán sự điều khiển, HS thực hiện.\n- Tập theo tổ dưới sự điều khiển của tổ trưởng; chú ý sửa sai.\n- Tập cặp đôi đối diện nhau, phối hợp giúp đỡ bạn.\n- Từng tổ lên thi đua trình diễn tự tin, tổ bạn nhận xét.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện theo tổ nhóm'
      },
      {
        content: "3.4. Trò chơi: “Trao gậy tiếp sức”:\n- Rèn luyện kỹ năng trao nhận gậy khi chạy và phối hợp đồng đội.",
        lvd: "1 - 2 lần",
        gv: "- GV giới thiệu ngắn gọn về trò chơi, hướng dẫn cách chơi, luật chơi, lỗi phạm quy.\n- Hướng dẫn cán sự biết cách tổ chức, lựa chọn trọng tài; nhắc HS bảo đảm an toàn khi chơi.\n- Chú ý tinh thần, thái độ, cảm xúc của học sinh.",
        hs: "- Đội hình chơi trò chơi tiếp sức 4 hàng dọc.\n- HS chơi theo hướng dẫn của GV, tích cực tham gia trò chơi vận động.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Sơ đồ trò chơi Trao gậy tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT thu dọn dụng cụ gậy đúng nơi quy định.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có); nhắc HS nhặt rác, thu dọn gậy gọn gàng.\n- Hỏi HS về cảm nhận giờ học, nhận xét chung và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Rũ tay, thả lỏng chân, hít thở sâu.\n- Quan sát hình ảnh, trả lời câu hỏi vận dụng sách giáo khoa; kiểm tra vệ sinh sân tập, thu dọn dụng cụ đúng nơi quy định.\n- Trả lời cảm nhận về giờ học; đi theo hàng về lớp.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh cầm gậy chắc chắn, thực hiện động tác bụng với gậy đúng biên độ và nhịp thở.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  },

  // ==========================================
  // KHỐI 5 - TUẦN 9 - TIẾT 18 (Trang 22 - 26)
  // ==========================================
  k5_t18: {
    id: 'k5_t18',
    grade: 5,
    week: 9,
    lessonNum: 18,
    topic: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    title: 'Bài 2: ĐỘNG TÁC BỤNG, ĐỘNG TÁC VẶN MÌNH, ĐỘNG TÁC TOÀN THÂN VỚI GẬY (Tiết 2)',
    dateRange: 'Từ ngày 02-06 tháng 11 năm 2026',
    specialCompetencies: {
      healthCare: 'Biết thực hiện vệ sinh sân tập, thực hiện vệ sinh cá nhân để đảm bảo an toàn trong tập luyện.',
      basicMovement: 'Biết khẩu lệnh và thực hiện được các bài tập, Trò chơi “Trao gậy tiếp sức”.',
      sportsCompetency: 'Biết quan sát tranh, tự khám phá bài và quan sát động tác làm mẫu của giáo viên để tập luyện.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
    },
    generalCompetencies: {
      autonomy: 'Tự xem trước các động tác bụng, động tác vặn mình, động tác toàn thân với gậy, Trò chơi “Trao gậy tiếp sức” trong sách giáo khoa.',
      collaboration: 'Biết phân công, hợp tác trong nhóm để thực hiện các động tác và trò chơi; biết phối hợp với bạn trong quá trình tập luyện và tham gia trò chơi.',
      problemSolving: 'Biết quan sát nhận biết lỗi thường mắc phải khi vặn mình với gậy và tự sửa sai.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
    },
    qualities: {
      diligence: 'Đoàn kết, nghiêm túc, tích cực trong tập luyện và hoạt động tập thể.',
      honesty: 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét trung thực.',
      responsibility: 'Tích cực tham gia các trò chơi vận động, có trách nhiệm trong khi chơi trò chơi và hình thành thói quen tập luyện TDTT.',
      disabledStudents: 'Giảm nhẹ các yêu cầu về phẩm chất, tham gia các trò chơi một cách vui vẻ, bày tỏ cảm xúc với bạn bè, tìm sự hỗ trợ khi cần thiết.'
    },
    integrations: {
      digitalSkill: '6.1TC2a',
      digitalDescription: 'Học sinh làm quen và bước đầu nhận thức được sự hỗ trợ của trí tuệ nhân tạo (AI) thông qua việc quan sát phần mềm phân tích tư thế chân, tay, thân người, cách cầm gậy, biên độ và nhịp động tác đúng/sai.',
      lifeSkills: 'Tích hợp bảo vệ môi trường: Học sinh giữ vệ sinh sân tập, không xả rác; sử dụng dụng cụ tiết kiệm, đúng mục đích và thu dọn gọn gàng sau luyện tập.'
    },
    locationEquipment: {
      location: 'Sân trường hoặc nhà thể chất.',
      teacherTools: 'Giáo án, SGK, SGV. Kẻ vẽ sân tập theo nội dung bài học. Còi, cờ, tranh ảnh, băng đĩa hình, gậy thể dục.',
      studentTools: 'SGK, giày thể thao, trang phục thể thao, đảm bảo vệ sinh và an toàn trong tập luyện.'
    },
    rows: [
      {
        content: "1. Hoạt động mở đầu\n1.1 Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục tập luyện, sức khỏe của HS.\n- Phổ biến nội dung: Học động tác vặn mình với gậy; trò chơi Trao gậy tiếp sức.\n1.2. Khởi động:\n- Xoay các khớp cổ tay, cổ chân, vai, hông, gối,... (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: Trò chơi \"Ai kéo khoẻ hơn\".\n- Kiểm tra bài cũ: Gọi 1-2 HS lên thực hiện động tác bụng với gậy.",
        lvd: "5 - 7'\n2Lx8N",
        gv: "- GV nhận lớp, thăm hỏi sức khỏe học sinh, phổ biến nội dung, yêu cầu giờ học.\n- Quan sát, nhắc học sinh tập đúng biên độ, nhịp hô.\n- Tổ chức trò chơi bổ trợ tạo không khí phấn khởi; kiểm tra bài cũ 1-2 HS, nhận xét biểu dương.",
        hs: "- Cán sự tập trung lớp, điểm số, báo cáo sĩ số, tình hình lớp cho GV.\n- Khởi động theo sự điều khiển của cán sự theo nhạc.\n- Tích cực tham gia trò chơi; thực hiện kiểm tra bài cũ theo yêu cầu của GV.",
        hsImgUrl: standardFormationDiagrams[1].svgDataUrl,
        hsImgTitle: 'Đội hình nhận lớp và khởi động'
      },
      {
        content: "2. Hoạt động hình thành kiến thức mới:\n2.1. Học động tác vặn mình với gậy:\n- Chơi trò chơi \"Nhìn nhanh đoán nhanh\":\n- TTCB: Đứng nghiêm, hai tay cầm hai đầu gậy xuôi trước đùi.\n- Nhịp 1: Chân trái bước sang ngang, hai tay đưa gậy lên cao chếch chữ V, ngửa đầu.\n- Nhịp 2: Vặn mình sang trái 90 độ, gậy giữ căng song song mặt đất.\n- Nhịp 3: Về như nhịp 1.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi vặn mình sang phải.",
        lvd: "5 - 7'",
        gv: "- Yêu cầu HS xem tranh ảnh trong SGK, quan sát và trả lời câu hỏi.\n- GV sẽ thực hiện lại và phân tích các nhịp để học sinh quan sát.\n- Giải đáp thắc mắc của HS nếu có; hướng dẫn cách xoay vặn thân người đúng trục.",
        hs: "- Đội hình HS quan sát tranh, tập mẫu.\n- HS quan sát tranh, thảo luận nhóm trả lời câu hỏi; ghi nhớ tư thế cầm gậy và nhịp vặn mình.",
        contentImgUrl: '/assets/sgk_chuan/k5_van_minh_voi_gay.jpg',
        contentImgTitle: 'Hình ảnh Kỹ thuật: Động tác Vặn mình với gậy (SGK GDTC Lớp 5)',
        hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
        hsImgTitle: 'Đội hình HS quan sát tranh, tập mẫu'
      },
      {
        content: "3. Hoạt động luyện tập:\n3.1. Tập đồng loạt (1-2 lần):\n- GV hô nhịp và quan sát; hướng dẫn cán sự lớp hô nhịp; nhắc lại những lỗi thường gặp.\n3.2. Tập theo tổ nhóm (2-3 lần):\n- Phân khu vực luyện tập; GV hỗ trợ đặc biệt cho HS gặp khó khăn khi thực hiện động tác.\n3.3 Tập theo cặp đôi (1-2 lần):\n- Tiến hành tập luyện cặp đôi, tiếp tục sửa sai và phối hợp với bạn khi tập.\n- Thi đua giữa các tổ: Từng tổ lên thi đua - trình diễn.",
        lvd: "15 - 16'\n1-2 lần\n2-3 lần\n1-2 lần",
        gv: "- Điều hành luyện tập đồng loạt; quan sát sửa sai tư thế gậy và xoay thân.\n- Giao nhiệm vụ cho tổ trưởng, chú ý đến sức khoẻ của HS có biểu hiện mệt mỏi để điều chỉnh.\n- Tổ chức tập cặp đôi, giải thích ngắn gọn vì sao phải thi đua với nhau, hỏi cảm xúc của HS.\n- Đánh giá, tuyên dương tổ thực hiện xuất sắc.",
        hs: "- ĐH tập luyện đồng loạt; nhận biết những lỗi thường mắc phải để sửa ở lần tiếp theo.\n- Tập theo tổ dưới sự điều khiển của tổ trưởng; nhận biết dấu hiệu mệt mỏi chủ động báo GV.\n- Tập luyện cặp đôi, phối hợp hoàn thành nhiệm vụ; tự tin thể hiện phần thi đua của tổ mình.",
        hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
        hsImgTitle: 'Đội hình tập luyện theo tổ'
      },
      {
        content: "3.4 Trò chơi vận động: \"Trao gậy tiếp sức\":\n- Rèn luyện tốc độ, sự phối hợp nhịp nhàng và tinh thần đồng đội.",
        lvd: "1-2 lần",
        gv: "- Hướng dẫn cách chơi, luật chơi, quy định về lỗi phạm quy; nhắc HS đảm bảo an toàn.\n- Chú ý tinh thần, thái độ, cảm xúc của học sinh.",
        hs: "- ĐH chơi trò chơi; chủ động lựa chọn chiến thuật và bố trí đội hình hợp lý để giành thắng lợi.\n- Trọng tài, người điều khiển vào vị trí; thay đổi chiến thuật cho lượt tiếp theo.",
        hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
        hsImgTitle: 'Đội hình chơi trò chơi Trao gậy tiếp sức'
      },
      {
        content: "4. Hoạt động vận dụng\n4.1. Hồi tĩnh: Thả lỏng toàn thân.\n4.2. Vận dụng:\n- Câu hỏi vận dụng sách giáo khoa.\n- Tích hợp BVMT thu dọn dụng cụ đúng nơi quy định.\n4.3. Nhận xét & Xuống lớp.",
        lvd: "4 - 5'",
        gv: "- Điều hành lớp thả lỏng toàn thân.\n- GV nêu câu hỏi vận dụng sách giáo khoa (kèm hình ảnh SGK nếu có); nhắc HS nhặt vật nguy hiểm, cất gậy thể dục.\n- Trao đổi ngắn về cảm nhận giờ học, nhận xét chung và phát lệnh xuống lớp.",
        hs: "- Đội hình hồi tĩnh: Thả lỏng chân tay, điều hòa nhịp tim.\n- Quan sát hình ảnh và trả lời câu hỏi vận dụng sách giáo khoa; kiểm tra vệ sinh sân tập và thu dọn dụng cụ sạch sẽ.\n- Trả lời cảm nhận về giờ học; đi theo hàng về lớp.",
        hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
        hsImgTitle: 'Đội hình hồi tĩnh và kết thúc giờ học'
      }
    ],
    postLessonAdjustment: 'Học sinh thực hiện tốt động tác vặn mình với gậy, giữ vững thăng bằng và cự ly an toàn.',
    signatures: {
      locationDate: 'Vệ Giang, ngày 06 tháng 11 năm 2026',
      bgh: 'Võ Thị Thuận',
      headTeacher: 'Bùi Ngọc Lâm',
      teacher: 'Lê Quốc Hưng'
    }
  }
};
