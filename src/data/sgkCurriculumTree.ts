export interface SgkLessonFolder {
  id: string;
  grade: 1 | 3 | 5;
  topicId: string;
  topicName: string;
  lessonId: string;
  lessonName: string;
  pdfFile: string;
  startPage: number;
  endPage: number;
  movements: string[];
  subFolders: {
    khoiDong: {
      name: string;
      description: string;
      suggestedPage: number;
    };
    kyThuat: {
      name: string;
      items: Array<{ name: string; page: number; desc: string }>;
    };
    luyenTap: {
      name: string;
      items: Array<{ name: string; page: number; desc: string }>;
    };
    vanDung: {
      name: string;
      description: string;
      suggestedPage: number;
    };
    troChoiKhoiDong?: {
      name: string;
      description: string;
      items?: Array<{ name: string; page: number; desc: string }>;
    };
  };
}

export const sgkCurriculumTree: SgkLessonFolder[] = [
  // =========================================================================
  // ============================ KHỐI 1 =====================================
  // =========================================================================

  // --- CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ (K1) ---
  {
    id: 'k1_cd1_b1',
    grade: 1,
    topicId: 'k1_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Các tư thế đứng nghiêm, đứng nghỉ',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 11,
    endPage: 14,
    movements: ['Tư thế đứng nghiêm', 'Tư thế đứng nghỉ'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp cổ tay, cổ chân, vai, hông; trò chơi Chạy theo hiệu lệnh (Trang 10 SGK)',
        suggestedPage: 11,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Đứng nghiêm (Gót chân chạm, mũi mở chữ V)', page: 11, desc: 'Tư thế đứng thẳng, ngực căng, hai gót sát nhau (Trang 10 SGK)' },
          { name: 'Động tác Đứng nghỉ (Trùng gối chân trái)', page: 12, desc: 'Chân trái trùng gối nhẹ, trọng tâm dồn chân phải (Trang 11 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi', page: 13, desc: 'Tự tập tư thế nghiêm, nghỉ trước bạn (Trang 12 SGK)' },
          { name: 'Luyện tập tổ nhóm', page: 14, desc: 'Tập hợp hàng theo từng tổ (Trang 13 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Đứng nghiêm khi chào cờ, xếp hàng vào lớp trật tự',
        suggestedPage: 14,
      },
    },
  },
  {
    id: 'k1_cd1_b2',
    grade: 1,
    topicId: 'k1_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Tập hợp đội hình hàng dọc, dóng hàng, điểm số',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 15,
    endPage: 18,
    movements: ['Tập hợp hàng dọc', 'Dóng hàng dọc', 'Điểm số hàng dọc'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp và trò chơi Làm theo tín hiệu (Trang 14 SGK)',
        suggestedPage: 15,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tập hợp đội hình hàng dọc', page: 15, desc: 'Khẩu lệnh "Thành 1 (2, 3, 4) hàng dọc... TẬP HỢP!" (Trang 14 SGK)' },
          { name: 'Dóng hàng dọc & Điểm số', page: 16, desc: 'Tay phải đặt lên vai bạn, điểm số 1, 2, 3... (Trang 15 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập tổ nhóm dóng hàng', page: 17, desc: 'Thi đua dóng hàng nhanh giữa các tổ (Trang 16 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Xếp hàng vào lớp ngay ngắn, trật tự',
        suggestedPage: 18,
      },
    },
  },
  {
    id: 'k1_cd1_b3',
    grade: 1,
    topicId: 'k1_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Tập hợp hàng ngang, dóng hàng, điểm số, dàn hàng, dồn hàng',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 19,
    endPage: 24,
    movements: ['Tập hợp hàng ngang', 'Dóng hàng ngang', 'Dàn hàng ngang', 'Dồn hàng ngang'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay các khớp (Trang 18 SGK)',
        suggestedPage: 19,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tập hợp & dóng hàng ngang', page: 20, desc: 'Tay trái chống hông, dóng hàng thẳng (Trang 19 SGK)' },
          { name: 'Dàn hàng & dồn hàng ngang', page: 21, desc: 'Cách nhau một sải tay khi dàn hàng (Trang 20 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập dàn hàng tổ nhóm', page: 22, desc: 'Tập dàn hàng so le giãn cách (Trang 21 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tự giác tập hợp hàng ngang khi sinh hoạt tập thể',
        suggestedPage: 24,
      },
    },
  },
  {
    id: 'k1_cd1_b4',
    grade: 1,
    topicId: 'k1_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Động tác quay các hướng',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 25,
    endPage: 27,
    movements: ['Quay phải', 'Quay trái', 'Quay sau'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp gối và cổ chân (Trang 24 SGK)',
        suggestedPage: 25,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Quay phải', page: 25, desc: 'Lấy gót chân phải làm trụ, mũi chân trái tiếp đất (Trang 24 SGK)' },
          { name: 'Động tác Quay trái', page: 26, desc: 'Lấy gót chân trái làm trụ, mũi chân phải tiếp đất (Trang 25 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập quay hướng cặp đôi', page: 26, desc: 'Hai bạn hô nhịp và sửa góc quay 90 độ (Trang 25 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Ứng dụng chuyển hướng đi lại trong học đường',
        suggestedPage: 27,
      },
    },
  },

  // --- CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC (K1) ---
  {
    id: 'k1_cd2_b1',
    grade: 1,
    topicId: 'k1_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác Vươn thở và Động tác Tay (Tuần 8)',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 28,
    endPage: 31,
    movements: ['Động tác Vươn thở', 'Động tác Tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động theo nhạc, xoay khớp và trò chơi Làm theo hiệu lệnh (Trang 27 SGK)',
        suggestedPage: 28,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Vươn thở (Hít sâu chữ V, thở ra bắt chéo tay)', page: 29, desc: 'Vươn hai tay lên cao chếch chữ V, ngửa đầu hít sâu (Trang 28 SGK)' },
          { name: 'Động tác Tay (Dang ngang lòng ngửa, vỗ tay trước ngực)', page: 30, desc: 'Hai tay dang ngang lòng ngửa, vỗ tay ngang ngực (Trang 29 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi', page: 31, desc: 'Hai bạn quay mặt vào nhau tập liên hoàn 2 động tác (Trang 30 SGK)' },
          { name: 'Luyện tập nhóm 4 tổ', page: 31, desc: 'Tập đồng loạt theo nhịp còi của tổ trưởng (Trang 30 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tập thể dục buổi sáng tại nhà nâng cao sức đề kháng',
        suggestedPage: 31,
      },
    },
  },
  {
    id: 'k1_cd2_b2',
    grade: 1,
    topicId: 'k1_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác Chân, Động tác Vặn mình, Động tác Bụng (Tuần 9)',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 32,
    endPage: 36,
    movements: ['Động tác Chân', 'Động tác Vặn mình', 'Động tác Bụng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp gối, cổ chân, trò chơi Kết bạn (Trang 31 SGK)',
        suggestedPage: 32,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Chân (Kiễng gót, khuỵu hai gối, hai tay chống hông)', page: 33, desc: 'Kiễng hai gót chân, khuỵu gối lưng thẳng (Trang 32 SGK)' },
          { name: 'Động tác Vặn mình (Bước chân trái, vặn mình 90 độ)', page: 33, desc: 'Chân trái bước sang ngang, vặn mình sang trái (Trang 32 SGK)' },
          { name: 'Động tác Bụng (Gập thân sâu, hai tay với mũi bàn chân)', page: 34, desc: 'Cúi gập thân sâu, hai tay với mũi chân, chân thẳng (Trang 33 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi', page: 35, desc: 'Tự uốn lườn, giữ thẳng lưng khi khuỵu gối (Trang 34 SGK)' },
          { name: 'Luyện tập nhóm 4 tổ', page: 35, desc: 'Thi đua thực hiện đều đẹp 4 tổ (Trang 34 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Vận dụng rèn luyện dáng đứng ngay ngắn, dẻo dai',
        suggestedPage: 36,
      },
    },
  },
  {
    id: 'k1_cd2_b3',
    grade: 1,
    topicId: 'k1_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác Phối hợp và Động tác Điều hòa (Tuần 10)',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 37,
    endPage: 40,
    movements: ['Động tác Phối hợp', 'Động tác Điều hòa'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay hông, ép dọc, trò chơi Nhảy lò cò (Trang 36 SGK)',
        suggestedPage: 37,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Phối hợp (Bước chân chếch, hai tay vươn cao)', page: 38, desc: 'Trọng tâm dồn chân trước, hai tay vươn cao (Trang 37 SGK)' },
          { name: 'Động tác Điều hòa (Nâng đùi nhẹ nhàng, lắc cổ tay thả lỏng)', page: 38, desc: 'Nâng đùi nhẹ nhàng, lắc cổ tay thư giãn (Trang 37 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi', page: 39, desc: 'Ôn tập toàn bộ bài thể dục phát triển chung (Trang 38 SGK)' },
          { name: 'Luyện tập tổ nhóm đồng loạt', page: 39, desc: 'Tập đồng loạt theo nhịp đếm còi (Trang 38 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tập luyện thể dục thường xuyên giúp cơ thể dẻo dai khỏe mạnh',
        suggestedPage: 40,
      },
    },
  },

  // --- CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN (K1) ---
  {
    id: 'k1_cd3_b1',
    grade: 1,
    topicId: 'k1_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b1',
    lessonName: 'Bài 1: Vận động của đầu, cổ',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 41,
    endPage: 44,
    movements: ['Vận động của đầu, cổ', 'Động tác Cúi đầu, Ngửa đầu, Nghiêng đầu'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay cổ nhẹ nhàng, khởi động cổ tay cổ chân (Trang 40 SGK)',
        suggestedPage: 41,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Cúi đầu, Ngửa đầu, Nghiêng đầu', page: 42, desc: 'Từ TTCB cúi đầu, ngửa đầu, nghiêng trái, nghiêng phải (Trang 41 SGK)' },
          { name: 'Động tác Xoay đầu một vòng, Bài tập phối hợp', page: 43, desc: 'Xoay đầu một vòng từ trái sang phải, phối hợp đầu cổ (Trang 42 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & tổ nhóm', page: 44, desc: 'Tập các cử động đầu cổ đúng nhịp (Trang 43 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Giữ tư thế ngồi học ngay ngắn tránh vẹo cột sống cổ',
        suggestedPage: 44,
      },
    },
  },
  {
    id: 'k1_cd3_b2',
    grade: 1,
    topicId: 'k1_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b2',
    lessonName: 'Bài 2: Vận động của tay',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 46,
    endPage: 48,
    movements: ['Đưa tay ra trước', 'Đưa tay lên cao', 'Dang hai tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay khớp vai và cánh tay (Trang 45 SGK)',
        suggestedPage: 46,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tư thế hai tay đưa ra trước & lên cao', page: 46, desc: 'Hai tay đưa thẳng ra trước ngang vai, vươn cao song song (Trang 45 SGK)' },
          { name: 'Tư thế hai tay dang ngang', page: 47, desc: 'Dang ngang hai tay, lòng bàn tay sấp / ngửa (Trang 46 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập phối hợp các hướng tay', page: 48, desc: 'Thực hiện liên hoàn theo khẩu lệnh chỉ huy (Trang 47 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Ứng dụng trong sinh hoạt, mang vác đồ vật đúng tư thế',
        suggestedPage: 48,
      },
    },
  },
  {
    id: 'k1_cd3_b3',
    grade: 1,
    topicId: 'k1_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b3',
    lessonName: 'Bài 3: Vận động của chân',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 50,
    endPage: 53,
    movements: ['Kiễng gót chân', 'Đứng một chân', 'Khuỵu gối'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp gối, cổ chân và trò chơi Lò cò (Trang 49 SGK)',
        suggestedPage: 50,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tư thế kiễng hai gót chân, giữ thăng bằng', page: 50, desc: 'Hai tay chống hông, kiễng gót chân đứng thẳng (Trang 49 SGK)' },
          { name: 'Tư thế đứng co một chân & khuỵu gối', page: 51, desc: 'Đứng trụ một chân, chân kia co vuông góc (Trang 50 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập thăng bằng chân', page: 52, desc: 'Thi đứng thăng bằng 5 - 10 giây (Trang 51 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện đôi chân khỏe mạnh, thăng bằng vững vàng',
        suggestedPage: 53,
      },
    },
  },
  {
    id: 'k1_cd3_b4',
    grade: 1,
    topicId: 'k1_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b4',
    lessonName: 'Bài 4: Vận động phối hợp của cơ thể',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 55,
    endPage: 57,
    movements: ['Vận động phối hợp tay chân', 'Di chuyển theo đường thẳng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân (Trang 54 SGK)',
        suggestedPage: 55,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi theo vạch kẻ thẳng, hai tay chống hông', page: 55, desc: 'Bước đều trên đường thẳng kẻ sẵn, mắt nhìn phía trước (Trang 54 SGK)' },
          { name: 'Đi theo vạch kẻ thẳng, hai tay dang ngang', page: 56, desc: 'Dang ngang hai tay giữ thăng bằng tuyệt đối (Trang 55 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đi nối tiếp theo tổ', page: 57, desc: 'Đi theo hàng thẳng không chạm chân ra ngoài (Trang 56 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Hình thành dáng đi tự nhiên, ngay ngắn',
        suggestedPage: 57,
      },
    },
  },
  {
    id: 'k1_cd3_b5',
    grade: 1,
    topicId: 'k1_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b5',
    lessonName: 'Bài 5: Vận động phối hợp của cơ thể (tiếp theo)',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 59,
    endPage: 62,
    movements: ['Đi kiễng gót', 'Đi bằng gót chân', 'Đi chuyển hướng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp cổ chân và gối (Trang 58 SGK)',
        suggestedPage: 59,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi kiễng gót theo đường kẻ thẳng', page: 59, desc: 'Nửa trước bàn chân tiếp đất, hai tay dang ngang (Trang 58 SGK)' },
          { name: 'Đi bằng gót chân', page: 60, desc: 'Gót chân tiếp đất, mũi chân chếch lên (Trang 59 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đi đổi hướng vòng cung', page: 61, desc: 'Đi chuyển hướng theo đường kẻ vòng (Trang 60 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Thích ứng linh hoạt khi đi trên các địa hình hẹp',
        suggestedPage: 62,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BÓNG RỔ (K1) ---
  {
    id: 'k1_tttc_br_b1',
    grade: 1,
    topicId: 'k1_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Làm quen với bóng',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 64,
    endPage: 67,
    movements: ['Cầm bóng bằng hai tay', 'Tung bóng tại chỗ', 'Bắt bóng hai tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay cổ tay, các ngón tay và khớp vai (Trang 63 SGK)',
        suggestedPage: 64,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tư thế cầm bóng bằng hai tay trước ngực', page: 64, desc: 'Các ngón tay xòe rộng bao quanh bóng, hai ngón cái hướng vào nhau (Trang 63 SGK)' },
          { name: 'Động tác tung và bắt bóng tại chỗ', page: 65, desc: 'Tung bóng lên cao 0.5 - 1m rồi đón bắt êm bằng hai tay (Trang 64 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chuyền bóng tại chỗ', page: 66, desc: 'Hai bạn đứng đối diện 2m chuyền bắt bóng (Trang 65 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện sự khéo léo của bàn tay và phản xạ nhanh',
        suggestedPage: 67,
      },
    },
  },
  {
    id: 'k1_tttc_br_b2',
    grade: 1,
    topicId: 'k1_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác di chuyển không bóng',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 69,
    endPage: 70,
    movements: ['Tư thế chuẩn bị bóng rổ', 'Di chuyển trượt ngang', 'Dừng lại'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Chạy biến tốc và đổi hướng (Trang 68 SGK)',
        suggestedPage: 69,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tư thế thủ cơ bản trong bóng rổ', page: 69, desc: 'Chân rộng bằng vai, hạ thấp trọng tâm, hai tay mở rộng (Trang 68 SGK)' },
          { name: 'Di chuyển bước trượt ngang', page: 70, desc: 'Trượt ngang chân không bắt chéo, giữ vững trọng tâm (Trang 69 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập trượt theo hiệu lệnh', page: 70, desc: 'Trượt sang trái, sang phải theo hướng tay GV (Trang 69 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phát triển sức mạnh cơ chân và khả năng thăng bằng',
        suggestedPage: 70,
      },
    },
  },
  {
    id: 'k1_tttc_br_b3',
    grade: 1,
    topicId: 'k1_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác dẫn bóng',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 72,
    endPage: 74,
    movements: ['Dẫn bóng tại chỗ', 'Nhồi bóng bằng các ngón tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Vận động cổ tay và cảm giác bóng (Trang 71 SGK)',
        suggestedPage: 72,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác dẫn bóng tại chỗ bằng tay thuận', page: 72, desc: 'Dùng các ngón tay ấn nhồi bóng xuống sân, bóng nảy ngang hông (Trang 71 SGK)' },
          { name: 'Dẫn bóng tại chỗ đổi tay', page: 73, desc: 'Nhồi bóng luân phiên tay phải và tay trái (Trang 72 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đếm nhịp nhồi bóng', page: 74, desc: 'Nhồi bóng 10 - 20 nhịp không rơi bóng (Trang 73 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chơi bóng rổ vui khỏe cùng bạn bè sau giờ học',
        suggestedPage: 74,
      },
    },
  },
  {
    id: 'k1_tttc_br_b4',
    grade: 1,
    topicId: 'k1_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Động tác ném rổ hai tay trước ngực',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 76,
    endPage: 78,
    movements: ['Tư thế chuẩn bị ném rổ', 'Đẩy bóng ném vào rổ hai tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai, khuỷu tay và khớp gối (Trang 75 SGK)',
        suggestedPage: 76,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tư thế ném rổ hai tay trước ngực', page: 76, desc: 'Bóng trước ngực, hạ gối lấy đà, đẩy bóng hướng vòng cung vào rổ (Trang 75 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập ném bóng cự ly gần', page: 77, desc: 'Ném bóng vào bảng rổ cự ly 1.5 - 2m (Trang 76 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tự tin tham gia các trò chơi ném bóng trúng đích',
        suggestedPage: 78,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BƠI (K1) ---
  {
    id: 'k1_tttc_boi_b1',
    grade: 1,
    topicId: 'k1_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b1',
    lessonName: 'Bài 1: Đi trong nước',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 80,
    endPage: 81,
    movements: ['Làm quen mực nước nông', 'Đi thẳng trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động trên cạn, tắm tráng trước khi xuống bể (Trang 79 SGK)',
        suggestedPage: 80,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật đi bộ trong nước mực nước ngang hông', page: 80, desc: 'Bước đều thắng sức cản của nước, hai tay gạt nước nhẹ nhàng (Trang 79 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đi ngang và đi lùi trong nước', page: 81, desc: 'Giữ thăng bằng cơ thể trong môi trường nước (Trang 80 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Trang bị kỹ năng an toàn và phòng chống đuối nước',
        suggestedPage: 81,
      },
    },
  },
  {
    id: 'k1_tttc_boi_b2',
    grade: 1,
    topicId: 'k1_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b2',
    lessonName: 'Bài 2: Chạy, nhảy trong nước',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 83,
    endPage: 84,
    movements: ['Chạy cự ly ngắn trong nước', 'Bật nhảy trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động cơ đùi và khớp gối trên cạn (Trang 82 SGK)',
        suggestedPage: 83,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác bật nhảy hai chân trong nước', page: 83, desc: 'Nhún gối bật nhảy nổi lên mặt nước, tiếp đất êm bằng hai chân (Trang 82 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chạy tiếp sức dưới nước nông', page: 84, desc: 'Thi chạy nhanh cự ly 5m dưới nước (Trang 83 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tăng cường sức mạnh cơ bắp và sự tự tin dưới nước',
        suggestedPage: 84,
      },
    },
  },
  {
    id: 'k1_tttc_boi_b3',
    grade: 1,
    topicId: 'k1_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b3',
    lessonName: 'Bài 3: Lặn, nhịn thở trong nước',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 86,
    endPage: 87,
    movements: ['Hít hơi trên cạn', 'Úp mặt nhịn thở dưới nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Hít thở sâu trên thành bể (Trang 85 SGK)',
        suggestedPage: 86,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật úp mặt vào nước nhịn thở 3 - 5 giây', page: 86, desc: 'Há miệng hít sâu trên mặt nước, ngụp mặt xuống nước nín thở (Trang 85 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập ngụp lặn theo nhóm', page: 87, desc: 'Cùng đếm nhịp ngụp thở an toàn có bạn bên cạnh (Trang 86 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Bình tĩnh kiểm soát nhịp thở khi gặp nước sâu',
        suggestedPage: 87,
      },
    },
  },
  {
    id: 'k1_tttc_boi_b4',
    grade: 1,
    topicId: 'k1_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b4',
    lessonName: 'Bài 4: Tập thở có điểm tì',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 89,
    endPage: 90,
    movements: ['Bám thành bể thở trong nước', 'Thổi bọt khí dưới nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay cổ và khớp vai (Trang 88 SGK)',
        suggestedPage: 89,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Hai tay bám thành bể ngụp thở', page: 89, desc: 'Tay bám chắc thành bể, ngụp đầu thổi bọt khí, ngoi lên há miệng lấy hơi (Trang 88 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập nhịp thở liên tục 5 - 10 lần', page: 90, desc: 'Duy trì nhịp thở đều đặn không sặc nước (Trang 89 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tạo thói quen hít vào bằng miệng, thở ra bằng mũi/miệng trong nước',
        suggestedPage: 90,
      },
    },
  },
  {
    id: 'k1_tttc_boi_b5',
    grade: 1,
    topicId: 'k1_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b5',
    lessonName: 'Bài 5: Tập thở không có điểm tì',
    pdfFile: 'SGK_GDTC1_8dda41ef.pdf',
    startPage: 92,
    endPage: 94,
    movements: ['Đứng giữa bể ngụp thở', 'Thả lỏng nổi cơ thể'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân và nhấp nước (Trang 91 SGK)',
        suggestedPage: 92,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đứng tự do giữa làn nước ngụp thở', page: 92, desc: 'Không bám thành bể, tự giác nhún chân ngoi ngụp lấy hơi nhịp nhàng (Trang 91 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập phối hợp thở và nổi thân người', page: 93, desc: 'Nổi thân nhẹ nhàng như chiếc lá (Trang 92 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng sinh tồn cơ bản phòng tránh tai nạn sông nước',
        suggestedPage: 94,
      },
    },
  },

  // =========================================================================
  // ============================ KHỐI 3 =====================================
  // =========================================================================

  // --- CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ (K3) ---
  {
    id: 'k3_cd1_b1',
    grade: 3,
    topicId: 'k3_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Biến đổi đội hình từ một hàng dọc thành hai, ba hàng dọc và ngược lại',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 9,
    endPage: 15,
    movements: ['Biến đổi 1 thành 2 hàng dọc', 'Biến đổi 1 thành 3 hàng dọc'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay các khớp, trò chơi kết bạn (Trang 8 SGK)',
        suggestedPage: 9,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Khẩu lệnh & động tác biến đổi 1 thành 2 hàng dọc', page: 10, desc: 'Số chẵn bước chân trái sang ngang một bước rồi tiến lên cạnh số lẻ (Trang 9 SGK)' },
          { name: 'Biến đổi trở về một hàng dọc', page: 12, desc: 'Số chẵn bước chân phải lùi về vị trí cũ (Trang 11 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập tổ nhóm phân chia số', page: 13, desc: 'Tập điểm số 1-2 và biến đổi nhanh nhẹn (Trang 12 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Xếp hàng di chuyển đội hình diễu hành lễ chào cờ',
        suggestedPage: 15,
      },
    },
  },
  {
    id: 'k3_cd1_b2',
    grade: 3,
    topicId: 'k3_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Biến đổi đội hình từ một hàng ngang thành hai, ba hàng ngang và ngược lại',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 16,
    endPage: 21,
    movements: ['Biến đổi 1 thành 2 hàng ngang', 'Biến đổi 1 thành 3 hàng ngang'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động dóng hàng ngang (Trang 15 SGK)',
        suggestedPage: 16,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác biến đổi 1 thành 2 hàng ngang', page: 17, desc: 'Số chẵn bước lùi một bước sang trái đứng sau số lẻ (Trang 16 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập thi đua dóng hàng ngang các tổ', page: 19, desc: 'Biến đổi đội hình nhanh và trật tự (Trang 18 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Dàn đội hình biểu diễn đồng diễn thể dục',
        suggestedPage: 21,
      },
    },
  },
  {
    id: 'k3_cd1_b3',
    grade: 3,
    topicId: 'k3_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Biến đổi đội hình từ một vòng tròn thành hai vòng tròn và ngược lại',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 22,
    endPage: 26,
    movements: ['Biến đổi 1 thành 2 vòng tròn', 'Trở về 1 vòng tròn'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động vòng tròn nắm tay (Trang 21 SGK)',
        suggestedPage: 22,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác biến đổi 1 thành 2 vòng tròn', page: 23, desc: 'Số chẵn bước tiến vào tâm vòng tròn 1 bước tạo vòng tròn trong (Trang 22 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập di chuyển vòng tròn theo nhạc', page: 25, desc: 'Biến đổi vòng tròn đều đẹp (Trang 24 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Ứng dụng trong sinh hoạt lửa trại, múa hát tập thể',
        suggestedPage: 26,
      },
    },
  },
  {
    id: 'k3_cd1_b4',
    grade: 3,
    topicId: 'k3_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Động tác Đi đều, Đứng lại (Tuần 8)',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 27,
    endPage: 30,
    movements: ['Đi đều', 'Đứng lại', 'Đổi chân khi đi đều sai nhịp'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay cổ chân, khớp gối, chạy bước nhỏ tại chỗ; trò chơi Mèo đuổi chuột (Trang 26 SGK)',
        suggestedPage: 27,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Đi đều (Nhịp 1 chân trái, đánh tay phải gập vuông góc)', page: 28, desc: 'Khẩu lệnh "Đi đều... BƯỚC!", chân trái nhịp 1, chân phải nhịp 2 (Trang 27 SGK)' },
          { name: 'Động tác Đứng lại (Động lệnh ĐỨNG rơi chân phải)', page: 29, desc: 'Khẩu lệnh "Đứng lại... ĐỨNG!", bước thêm 2 nhịp rồi thu chân (Trang 28 SGK)' },
          { name: 'Đổi chân khi đi đều sai nhịp', page: 29, desc: 'Đệm chân nhảy lướt để lấy lại đúng nhịp 1 chân trái (Trang 28 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi', page: 30, desc: 'Hai bạn đi đều song song kiểm tra cự ly (Trang 29 SGK)' },
          { name: 'Luyện tập theo tổ', page: 30, desc: 'Tổ trưởng hô nhịp, cả tổ đi đều vòng quanh sân (Trang 29 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Đi bộ ngay ngắn trên vỉa hè; trò chơi Chạy theo hình tam giác (Trang 29 SGK)',
        suggestedPage: 30,
      },
    },
  },

  // --- CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC (K3) ---
  {
    id: 'k3_cd2_b1',
    grade: 3,
    topicId: 'k3_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác Vươn thở, Động tác Tay (Tuần 9)',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 31,
    endPage: 34,
    movements: ['Động tác Vươn thở', 'Động tác Tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay các khớp (Trang 30 SGK)',
        suggestedPage: 31,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Vươn thở (Khối 3)', page: 32, desc: 'Vươn tay lên cao hít sâu, bắt chéo tay thở ra (Trang 31 SGK)' },
          { name: 'Động tác Tay (Khối 3)', page: 32, desc: 'Dang ngang hai tay, vỗ tay trước ngực (Trang 31 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & tổ nhóm', page: 33, desc: 'Tập đồng loạt theo nhịp đếm tổ trưởng (Trang 32 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tập thể dục buổi sáng rèn luyện thể lực',
        suggestedPage: 34,
      },
    },
  },
  {
    id: 'k3_cd2_b2',
    grade: 3,
    topicId: 'k3_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác Chân, Động tác Lườn, Động tác Bụng (Tuần 10)',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 35,
    endPage: 39,
    movements: ['Động tác Chân', 'Động tác Lườn', 'Động tác Bụng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay hông, ép dẻo (Trang 34 SGK)',
        suggestedPage: 35,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Chân (Khối 3)', page: 36, desc: 'Kiễng gót hai chân, khuỵu gối lưng thẳng (Trang 35 SGK)' },
          { name: 'Động tác Lườn (Nghiêng lườn sang trái, phải)', page: 36, desc: 'Tay chống hông, tay vươn cao nghiêng lườn (Trang 35 SGK)' },
          { name: 'Động tác Bụng (Gập thân người sâu)', page: 37, desc: 'Gập thân người, tay hướng mũi chân (Trang 36 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & tổ nhóm', page: 38, desc: 'Tập liên hoàn các động tác (Trang 37 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tập thể dục giữ vóc dáng cân đối',
        suggestedPage: 39,
      },
    },
  },
  {
    id: 'k3_cd2_b3',
    grade: 3,
    topicId: 'k3_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác Phối hợp, Động tác Nhảy, Động tác Điều hòa (Tuần 11)',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 40,
    endPage: 43,
    movements: ['Động tác Phối hợp', 'Động tác Nhảy', 'Động tác Điều hòa'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân (Trang 39 SGK)',
        suggestedPage: 40,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Phối hợp (Khối 3)', page: 41, desc: 'Phối hợp tay chân và thân mình (Trang 40 SGK)' },
          { name: 'Động tác Nhảy (Bật nhảy tách chân vỗ tay trên đầu)', page: 41, desc: 'Bật nhảy tách chân, vỗ tay trên đỉnh đầu (Trang 40 SGK)' },
          { name: 'Động tác Điều hòa (Nâng đùi thả lỏng)', page: 42, desc: 'Nâng đùi nhẹ nhàng, lắc cổ tay thư giãn (Trang 41 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập toàn bộ bài thể dục 8 động tác', page: 42, desc: 'Tập hoàn chỉnh bài thể dục khối 3 (Trang 41 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện thói quen tự tập thể dục hàng ngày',
        suggestedPage: 43,
      },
    },
  },

  // --- CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN (K3) ---
  {
    id: 'k3_cd3_b1',
    grade: 3,
    topicId: 'k3_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b1',
    lessonName: 'Bài 1: Phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 44,
    endPage: 47,
    movements: ['Bước qua chướng ngại vật', 'Nhảy qua chướng ngại vật'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp gối và cổ chân (Trang 43 SGK)',
        suggestedPage: 44,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi bước qua chướng ngại vật thấp', page: 44, desc: 'Nâng cao đùi bước dứt khoát qua thanh chắn cao 15-20cm (Trang 43 SGK)' },
          { name: 'Bật nhảy chụm chân qua chướng ngại vật', page: 45, desc: 'Nhún hai gối bật qua vạch hoặc cọc mốc an toàn (Trang 44 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chạy vượt chướng ngại vật tiếp sức', page: 46, desc: 'Thi đấu tiếp sức giữa các tổ (Trang 45 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng quan sát và bước tránh vật cản trên đường đi',
        suggestedPage: 47,
      },
    },
  },
  {
    id: 'k3_cd3_b2',
    grade: 3,
    topicId: 'k3_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b2',
    lessonName: 'Bài 2: Phối hợp di chuyển vượt qua chướng ngại vật trên đường gấp khúc',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 48,
    endPage: 52,
    movements: ['Di chuyển luồn cọc tiêu', 'Đổi hướng gấp khúc'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Chạy biến tốc và uốn thân (Trang 47 SGK)',
        suggestedPage: 48,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Chạy luồn cọc mốc zíc zắc', page: 49, desc: 'Nghiêng người chuyển trọng tâm lượn qua các cọc mốc (Trang 48 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập tổ nhóm đường gấp khúc', page: 50, desc: 'Tập giữ thăng bằng khi chạy tốc độ cao (Trang 49 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Linh hoạt đổi hướng tránh va chạm khi tham gia giao thông',
        suggestedPage: 52,
      },
    },
  },
  {
    id: 'k3_cd3_b3',
    grade: 3,
    topicId: 'k3_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b3',
    lessonName: 'Bài 3: Phối hợp di chuyển vượt qua chướng ngại vật trên địa hình',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 53,
    endPage: 56,
    movements: ['Đi thăng bằng trên cầu gỗ', 'Chui qua hầm thấp'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai, cổ chân (Trang 52 SGK)',
        suggestedPage: 53,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi thăng bằng trên ghế thể dục', page: 53, desc: 'Dang ngang hai tay, bước từng bước tự tin trên ghế (Trang 52 SGK)' },
          { name: 'Bò chui qua cổng thấp', page: 54, desc: 'Hạ thấp người bò khéo léo không chạm thanh cổng (Trang 53 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập liên hoàn vượt địa hình', page: 55, desc: 'Chạy - bước qua bục - chui qua hầm tiếp sức (Trang 54 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Vượt chướng ngại vật tự tin trong dã ngoại và sinh hoạt',
        suggestedPage: 56,
      },
    },
  },
  {
    id: 'k3_cd3_b4',
    grade: 3,
    topicId: 'k3_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b4',
    lessonName: 'Bài 4: Bài tập tại chỗ tung – bắt bóng bằng hai tay',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 57,
    endPage: 60,
    movements: ['Tung bóng lên cao', 'Bắt bóng hai tay trước ngực'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay cổ tay, cánh tay và vỗ bóng (Trang 56 SGK)',
        suggestedPage: 57,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tung bóng lên cao bằng hai tay và bắt bóng', page: 57, desc: 'Tung bóng thẳng hướng đỉnh đầu, mắt nhìn theo bóng, đón bóng êm (Trang 56 SGK)' },
          { name: 'Tung bóng vỗ tay rồi bắt bóng', page: 58, desc: 'Tung bóng, vỗ tay 1-2 tiếng trước khi bắt bóng (Trang 57 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập bắt bóng theo cặp', page: 59, desc: 'Hai bạn tung bắt qua lại cự ly 2.5 - 3m (Trang 58 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện phản xạ thị giác và sự khéo léo',
        suggestedPage: 60,
      },
    },
  },
  {
    id: 'k3_cd3_b5',
    grade: 3,
    topicId: 'k3_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b5',
    lessonName: 'Bài 5: Bài tập di chuyển tung – bắt bóng bằng hai tay',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 61,
    endPage: 64,
    movements: ['Vừa đi vừa tung bắt bóng', 'Chuyền bóng khi di chuyển'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Chạy bước nhỏ kết hợp cầm bóng (Trang 60 SGK)',
        suggestedPage: 61,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi theo đường thẳng vừa đi vừa tung bắt bóng', page: 61, desc: 'Bước đều nhịp nhàng tung bóng phía trước và đón bắt (Trang 60 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cặp đôi di chuyển chuyền bóng song song', page: 62, desc: 'Hai bạn chạy song song chuyền bóng cho nhau (Trang 61 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Ứng dụng trong các môn thể thao đồng đội',
        suggestedPage: 64,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BÓNG RỔ (K3) ---
  {
    id: 'k3_tttc_br_b1',
    grade: 3,
    topicId: 'k3_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Bài tập bổ trợ với bóng',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 65,
    endPage: 69,
    movements: ['Xoay bóng quanh hông', 'Xoay bóng quanh gối', 'Tung bắt bóng nhanh'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động ngón tay và khớp cổ tay (Trang 64 SGK)',
        suggestedPage: 65,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác xoay bóng vòng quanh hông', page: 65, desc: 'Chuyển bóng từ tay phải sang tay trái vòng qua sau lưng (Trang 64 SGK)' },
          { name: 'Động tác xoay bóng qua hai chân hình số 8', page: 66, desc: 'Hạ thấp gối, luồn bóng qua háng hình số 8 (Trang 65 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cảm giác bóng thi đua tổ', page: 67, desc: 'Thi ai xoay bóng nhanh nhất không rơi bóng (Trang 66 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Làm chủ trái bóng rổ điêu luyện',
        suggestedPage: 69,
      },
    },
  },
  {
    id: 'k3_tttc_br_b2',
    grade: 3,
    topicId: 'k3_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác dẫn bóng theo hướng thẳng, dẫn bóng đổi hướng',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 70,
    endPage: 73,
    movements: ['Dẫn bóng di chuyển thẳng', 'Dẫn bóng chuyển hướng zíc zắc'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Chạy bước nhỏ nhồi bóng (Trang 69 SGK)',
        suggestedPage: 70,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật dẫn bóng tiến thẳng', page: 70, desc: 'Thân hơi ngả trước, nhồi bóng chếch phía trước bàn chân (Trang 69 SGK)' },
          { name: 'Dẫn bóng đổi hướng qua cọc mốc', page: 71, desc: 'Chuyển bóng đổi tay lách qua vật cản (Trang 70 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập tiếp sức dẫn bóng cự ly 10m', page: 72, desc: 'Dẫn bóng qua cọc tiêu vòng về trao bóng cho bạn (Trang 71 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện khả năng quan sát không gian khi di chuyển',
        suggestedPage: 73,
      },
    },
  },
  {
    id: 'k3_tttc_br_b3',
    grade: 3,
    topicId: 'k3_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác chuyền bóng bằng hai tay trước ngực',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 74,
    endPage: 76,
    movements: ['Chuyền bóng hai tay trước ngực', 'Đón bắt bóng trước ngực'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai và cổ tay (Trang 73 SGK)',
        suggestedPage: 74,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật chuyền bóng hai tay trước ngực (Chest Pass)', page: 74, desc: 'Bóng trước ngực, miết các ngón tay đẩy bóng thẳng đi, cổ tay vẩy ra ngoài (Trang 73 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chuyền bắt cặp đôi cự ly 3 - 4m', page: 75, desc: 'Chuyền bóng chuẩn xác vào tầm ngực bạn đón (Trang 74 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phối hợp đồng đội ăn ý trong thi đấu bóng rổ',
        suggestedPage: 76,
      },
    },
  },
  {
    id: 'k3_tttc_br_b4',
    grade: 3,
    topicId: 'k3_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Phối hợp dẫn bóng – ném rổ bằng hai tay trước ngực',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 77,
    endPage: 78,
    movements: ['Dẫn bóng vào cự ly', 'Dừng bóng ném rổ'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động ném rổ tự do (Trang 76 SGK)',
        suggestedPage: 77,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Phối hợp dẫn bóng 2 nhịp rồi ném rổ', page: 77, desc: 'Dẫn bóng tới cự ly 2.5m, dừng lại hạ gối ném rổ hai tay (Trang 76 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Thi ném rổ tính điểm theo tổ', page: 78, desc: 'Mỗi em thực hiện 3 lượt ném tính tổng điểm tổ (Trang 77 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện sự tập trung và độ chuẩn xác',
        suggestedPage: 78,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BƠI (K3) ---
  {
    id: 'k3_tttc_boi_b1',
    grade: 3,
    topicId: 'k3_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b1',
    lessonName: 'Bài 1: Đạp đáy bể (hồ) bơi nhô đầu kết hợp thở trong nước',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 80,
    endPage: 83,
    movements: ['Đạp đáy bể nhô đầu', 'Hít thở sâu trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay khớp trên cạn (Trang 79 SGK)',
        suggestedPage: 80,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác nhún chân đạp đáy bể nhô lên thở', page: 80, desc: 'Nhún sâu hai chân đạp mạnh đáy bể đẩy đầu nhô khỏi mặt nước há miệng hít thở (Trang 79 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập nhịp điệu liên hoàn 10 lần', page: 81, desc: 'Nhịp nhàng ngoi ngụp không gián đoạn (Trang 80 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng ngoi thở tự cứu bản thân khi rơi xuống nước',
        suggestedPage: 83,
      },
    },
  },
  {
    id: 'k3_tttc_boi_b2',
    grade: 3,
    topicId: 'k3_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b2',
    lessonName: 'Bài 2: Khua tay trong nước',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 84,
    endPage: 87,
    movements: ['Khua tay tạo lực đẩy', 'Gạt nước ngang ngực'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai và cổ tay (Trang 83 SGK)',
        suggestedPage: 84,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật khua tay tạo lực nổi trong nước', page: 84, desc: 'Hai bàn tay khép hờ, khua gạt nước theo hình số 8 nằm ngang (Trang 83 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập khua tay giữ thăng bằng thân người', page: 85, desc: 'Đứng nước khua tay giữ đầu nổi trên mặt nước (Trang 84 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Cảm nhận lực nâng của nước lên cơ thể',
        suggestedPage: 87,
      },
    },
  },
  {
    id: 'k3_tttc_boi_b3',
    grade: 3,
    topicId: 'k3_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b3',
    lessonName: 'Bài 3: Đập chân trong nước',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 88,
    endPage: 91,
    movements: ['Đập chân bám thành bể', 'Đập chân có phao bơi'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp cổ chân và gối (Trang 87 SGK)',
        suggestedPage: 88,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật đập chân so le bám thành bể', page: 88, desc: 'Duỗi thẳng mũi chân, đập chân luân phiên từ khớp hông (Trang 87 SGK)' },
          { name: 'Đập chân ôm phao bơi lướt nước', page: 89, desc: 'Hai tay giữ phao phía trước, đập chân đẩy người lướt đi 5 - 10m (Trang 88 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đập chân cự ly 10m', page: 90, desc: 'Đập chân liên tục, thân người nổi phẳng (Trang 89 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nền tảng quan trọng cho mọi kiểu bơi thể thao',
        suggestedPage: 91,
      },
    },
  },
  {
    id: 'k3_tttc_boi_b4',
    grade: 3,
    topicId: 'k3_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b4',
    lessonName: 'Bài 4: Đập chân, khua tay di chuyển trong nước',
    pdfFile: 'SGK_GDTC_3_e88153f9.pdf',
    startPage: 92,
    endPage: 94,
    movements: ['Phối hợp tay chân bơi cơ bản', 'Di chuyển nổi trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân (Trang 91 SGK)',
        suggestedPage: 92,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Phối hợp đập chân so le và khua tay gạt nước', page: 92, desc: 'Chân đập liên tục tạo lực đẩy tới, tay khua giữ nổi cơ thể (Trang 91 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Bơi tự do qua bể cự ly 10 - 15m', page: 93, desc: 'Bơi chuyển động nhịp nhàng, tự tin (Trang 92 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng bơi lội phòng ngừa rủi ro đuối nước hiệu quả',
        suggestedPage: 94,
      },
    },
  },

  // =========================================================================
  // ============================ KHỐI 5 =====================================
  // =========================================================================

  // --- CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ (K5) ---
  {
    id: 'k5_cd1_b1',
    grade: 5,
    topicId: 'k5_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Bài tập phối hợp đội hình đội ngũ',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 9,
    endPage: 14,
    movements: ['Tập hợp hàng dọc, hàng ngang', 'Dóng hàng điểm số nhanh'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động xoay các khớp, chạy bước nhỏ (Trang 8 SGK)',
        suggestedPage: 9,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Phối hợp tập hợp hàng dọc và dóng hàng cự ly chuẩn', page: 10, desc: 'Chỉ huy hô khẩu lệnh dứt khoát, toàn chi đội tập hợp thần tốc (Trang 9 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cán sự chỉ huy điều hành chi đội', page: 12, desc: 'Tập tác phong chỉ huy nghiêm trang, mạch lạc (Trang 11 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tác phong nhanh nhẹn, kỷ luật trong tập thể Đội TNTP',
        suggestedPage: 14,
      },
    },
  },
  {
    id: 'k5_cd1_b2',
    grade: 5,
    topicId: 'k5_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Bài tập phối hợp biến đổi đội hình',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 15,
    endPage: 20,
    movements: ['Biến đổi hàng dọc thành hàng ngang', 'Biến đổi phân đội'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động biến đổi đội hình (Trang 14 SGK)',
        suggestedPage: 15,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật chuyển đổi đội hình từ hàng dọc sang hàng ngang', page: 16, desc: 'Động tác nhịp nhàng, giữ đúng cự ly khoảng cách (Trang 15 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập phối hợp đồng loạt toàn lớp', page: 18, desc: 'Thi đua biến đổi đội hình không xô đẩy (Trang 17 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phục vụ các hoạt động mít tinh, đại hội cháu ngoan Bác Hồ',
        suggestedPage: 20,
      },
    },
  },
  {
    id: 'k5_cd1_b3',
    grade: 5,
    topicId: 'k5_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Bài tập phối hợp đi đều vòng các hướng',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 21,
    endPage: 24,
    movements: ['Đi đều vòng phải', 'Đi đều vòng trái', 'Đi đều đổi hướng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Dậm chân tại chỗ đúng nhịp đếm 1-2 (Trang 20 SGK)',
        suggestedPage: 21,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật đi đều vòng bên phải, vòng bên trái', page: 21, desc: 'Khẩu lệnh "Vòng bên phải (trái)... BƯỚC!", em đầu hàng bước vòng, các em sau bám theo (Trang 20 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chi đội đi đều diễu hành qua lễ đài', page: 22, desc: 'Đánh tay dứt khoát vuông góc, chân bước đều tăm tắp (Trang 21 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tác phong ngay ngắn, chững chạc của học sinh lớp 5',
        suggestedPage: 24,
      },
    },
  },

  // --- CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY (K5) ---
  {
    id: 'k5_cd2_b1',
    grade: 5,
    topicId: 'k5_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy (Tuần 8-9)',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 25,
    endPage: 29,
    movements: ['Động tác Vươn thở với gậy', 'Động tác Tay với gậy', 'Động tác Chân với gậy'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động các khớp kết hợp nâng gậy nhẹ nhàng (Trang 24 SGK)',
        suggestedPage: 25,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Vươn thở với gậy (Nâng gậy chữ V lên cao)', page: 25, desc: 'Hai tay cầm hai đầu gậy nâng lên cao chếch chữ V, ngửa đầu hít sâu (Trang 24 SGK)' },
          { name: 'Động tác Tay với gậy (Nâng gậy trước ngực và qua đầu)', page: 26, desc: 'Nâng gậy thẳng ra trước ngang vai, nâng gậy lên cao thẳng tay (Trang 25 SGK)' },
          { name: 'Động tác Chân với gậy (Kiễng gót khuỵu gối, gậy song song)', page: 27, desc: 'Kiễng gót chân, khuỵu gối hạ thấp trọng tâm, gậy đưa song song (Trang 26 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & cặp đôi với gậy', page: 28, desc: 'Hai bạn đứng đối diện so gậy song song (Trang 27 SGK)' },
          { name: 'Luyện tập tổ nhóm 4 góc sân', page: 28, desc: 'Tập đồng loạt theo hiệu lệnh trống của tổ trưởng (Trang 27 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Bảo quản và thu dọn gậy ngăn nắp vào giá; Trò chơi Chuyền gậy tiếp sức (Trang 26-28 SGK)',
        suggestedPage: 29,
      },
    },
  },
  {
    id: 'k5_cd2_b2',
    grade: 5,
    topicId: 'k5_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác Bụng, Vặn mình, Toàn thân với gậy (Tuần 10)',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 30,
    endPage: 33,
    movements: ['Động tác Bụng với gậy', 'Động tác Vặn mình với gậy', 'Động tác Toàn thân với gậy'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay thân mình với gậy, ép dẻo cơ thể (Trang 29 SGK)',
        suggestedPage: 30,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Bụng với gậy (Gập thân gậy chạm mu bàn chân)', page: 30, desc: 'Gập sâu thân người, hai tay cầm gậy hạ sát chân, chân giữ thẳng (Trang 29 SGK)' },
          { name: 'Động tác Vặn mình với gậy (Xoay thân 90 độ)', page: 31, desc: 'Gậy đặt sau gáy hoặc vươn trước, vặn thân mình sang trái/phải 90 độ (Trang 30 SGK)' },
          { name: 'Động tác Toàn thân với gậy (Phối hợp gập uốn thân)', page: 31, desc: 'Phối hợp nhịp nhàng giữa tay nâng gậy, chân và thân mình (Trang 30 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân & tổ nhóm', page: 32, desc: 'Tập liên hoàn các động tác với gậy (Trang 31 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tăng cường sức mạnh cơ lưng bụng, rèn dáng vóc',
        suggestedPage: 33,
      },
    },
  },
  {
    id: 'k5_cd2_b3',
    grade: 5,
    topicId: 'k5_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác Nhảy và Động tác Điều hòa với gậy (Tuần 11)',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 34,
    endPage: 37,
    movements: ['Động tác Nhảy với gậy', 'Động tác Điều hòa với gậy'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân với gậy (Trang 33 SGK)',
        suggestedPage: 34,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Nhảy với gậy (Bật nhảy tách chân, nâng gậy qua đầu)', page: 34, desc: 'Bật nhảy tách chân, hai tay nâng gậy thẳng qua đầu (Trang 33 SGK)' },
          { name: 'Động tác Điều hòa với gậy (Thả lỏng, nâng hạ gậy nhịp nhàng)', page: 35, desc: 'Hít sâu nâng gậy, hạ gậy thở ra nhẹ nhàng (Trang 34 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập hoàn chỉnh bài thể dục phát triển chung với gậy', page: 36, desc: 'Tập liên hoàn 8 động tác với gậy thể dục (Trang 35 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tự giác tập luyện với gậy thể dục tại nhà',
        suggestedPage: 37,
      },
    },
  },

  // --- CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN (K5) ---
  {
    id: 'k5_cd3_b1',
    grade: 5,
    topicId: 'k5_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b1',
    lessonName: 'Bài 1: Bài tập rèn luyện kĩ năng lăn',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 38,
    endPage: 41,
    movements: ['Lăn nghiêng sang phải', 'Lăn nghiêng sang trái', 'Lăn tròn trên đệm'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai, cổ và cột sống trên đệm mềm (Trang 37 SGK)',
        suggestedPage: 38,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật lăn nghiêng sang phải / trái trên đệm', page: 38, desc: 'Nằm ngửa trên đệm, hai tay duỗi thẳng qua đầu, khép chân lăn tròn (Trang 37 SGK)' },
          { name: 'Động tác cuộn tròn thân người lăn lưng', page: 39, desc: 'Hai tay ôm gối, cúi đầu sát gối cuộn tròn lăn lưng bập bênh (Trang 38 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập lăn liên hoàn trên đệm', page: 40, desc: 'Lăn 2 - 3 vòng liên tục giữ thẳng hướng (Trang 39 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tự bảo vệ đầu và cột sống khi ngã, giảm thiểu chấn thương',
        suggestedPage: 41,
      },
    },
  },
  {
    id: 'k5_cd3_b2',
    grade: 5,
    topicId: 'k5_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b2',
    lessonName: 'Bài 2: Bài tập rèn luyện kĩ năng lộn xuôi',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 42,
    endPage: 44,
    movements: ['Tư thế chuẩn bị lộn xuôi', 'Chống tay gập cằm lộn xuôi'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp cổ và cổ tay kỹ lưỡng (Trang 41 SGK)',
        suggestedPage: 42,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật lộn xuôi trên đệm thể dục', page: 42, desc: 'Hai tay chống đệm, cúi gập cằm sát ngực, đạp chân cuộn tròn lưng lộn xuôi (Trang 41 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập có GV hoặc bạn hỗ trợ', page: 43, desc: 'GV đỡ lưng hỗ trợ giúp HS cuộn tròn an toàn (Trang 42 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tăng cường sự khéo léo, dũng cảm và kiểm soát cơ thể',
        suggestedPage: 44,
      },
    },
  },
  {
    id: 'k5_cd3_b3',
    grade: 5,
    topicId: 'k5_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b3',
    lessonName: 'Bài 3: Bài tập rèn luyện kĩ năng leo',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 45,
    endPage: 49,
    movements: ['Leo thang dóng', 'Leo thang dây'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động cơ bắp tay, vai và ngón tay (Trang 44 SGK)',
        suggestedPage: 45,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật leo thang dóng thể dục', page: 45, desc: 'Tay nắm chắc dóng thang, chân bước nhịp nhàng từng bậc dóng (Trang 44 SGK)' },
          { name: 'Kỹ thuật xuống thang an toàn', page: 46, desc: 'Chân bước lùi từng dóng, tay bám chắc hạ thấp dần (Trang 45 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập leo phối hợp tay chân so le', page: 47, desc: 'Duy trì nhịp leo chắc chắn và an toàn (Trang 46 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phát triển lực kéo tay, sức bền chi trên',
        suggestedPage: 49,
      },
    },
  },
  {
    id: 'k5_cd3_b4',
    grade: 5,
    topicId: 'k5_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ & KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b4',
    lessonName: 'Bài 4: Bài tập rèn luyện kĩ năng trèo',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 50,
    endPage: 53,
    movements: ['Trèo qua rào gỗ', 'Trèo qua chướng ngại vật cao'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động cổ chân, đùi và khớp hông (Trang 49 SGK)',
        suggestedPage: 50,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật trèo qua tường gỗ thể dục 60-80cm', page: 50, desc: 'Hai tay bám mép rào, bật nhảy co một chân lên mép rồi trèo qua (Trang 49 SGK)' },
          { name: 'Tư thế tiếp đất an toàn sau khi trèo', page: 51, desc: 'Tiếp đất bằng nửa trước hai bàn chân, khuỵu gối hoãn xung (Trang 50 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập vượt rào tiếp sức theo tổ', page: 52, desc: 'Trèo qua rào chạy tiếp sức sôi nổi (Trang 51 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng thoát hiểm và vượt chướng ngại vật trong đời sống',
        suggestedPage: 53,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BÓNG RỔ (K5) ---
  {
    id: 'k5_tttc_br_b1',
    grade: 5,
    topicId: 'k5_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Dẫn bóng thay đổi tốc độ, dẫn bóng theo đường vòng',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 54,
    endPage: 58,
    movements: ['Dẫn bóng nhanh - chậm', 'Dẫn bóng uốn lượn đường cong'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp cổ tay và chạy chuyển hướng (Trang 53 SGK)',
        suggestedPage: 54,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Dẫn bóng thay đổi tốc độ (Nhanh - Chậm)', page: 54, desc: 'Nhồi bóng thấp khi chậm, đẩy bóng cao hơn khi bứt tốc (Trang 53 SGK)' },
          { name: 'Dẫn bóng lượn theo đường vòng cung', page: 55, desc: 'Nghiêng trọng tâm vào trong, dùng tay xa đối phương che bóng (Trang 54 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập dẫn bóng biến tốc qua 5 cọc mốc', page: 56, desc: 'Thi đua dẫn bóng luồn cọc tiêu (Trang 55 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Bứt phá vượt qua đối phương trong thi đấu thực tế',
        suggestedPage: 58,
      },
    },
  },
  {
    id: 'k5_tttc_br_b2',
    grade: 5,
    topicId: 'k5_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác chuyền, bắt bóng bằng hai tay trên cao',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 59,
    endPage: 62,
    movements: ['Chuyền bóng trên đầu (Overhead Pass)', 'Bắt bóng trên cao'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp vai, khuỷu tay và bật nhảy (Trang 58 SGK)',
        suggestedPage: 59,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật chuyền bóng hai tay trên đầu', page: 59, desc: 'Bóng giữ trên trán, gập cổ tay miết bóng chuyền đi mạnh mẽ (Trang 58 SGK)' },
          { name: 'Kỹ thuật bật nhảy đón bắt bóng trên cao', page: 60, desc: 'Bật nhảy đưa hai tay đón bóng trên điểm cao nhất (Trang 59 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập chuyền bóng vượt qua đối thủ cản', page: 61, desc: 'Tập chuyền bổng qua đầu bạn đứng giữa (Trang 60 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tận dụng chiều cao để phân phối bóng chiến thuật',
        suggestedPage: 62,
      },
    },
  },
  {
    id: 'k5_tttc_br_b3',
    grade: 5,
    topicId: 'k5_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BÓNG RỔ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác hai bước ném rổ bằng một tay trên vai',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 63,
    endPage: 65,
    movements: ['Chạy hai bước lên rổ (Layup)', 'Ném rổ một tay trên vai'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động đà nhảy một chân (Trang 62 SGK)',
        suggestedPage: 63,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật hai bước lên rổ (Nhịp 1 chân phải, nhịp 2 chân trái bật nhảy)', page: 63, desc: 'Ôm bóng bước 1 dài, bước 2 ngắn bật cao nâng bóng đặt vào rổ (Trang 62 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập lên rổ cự ly 45 độ bảng rổ', page: 64, desc: 'Tập đưa bóng vào điểm ngắm bảng rổ chuẩn xác (Trang 63 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Ghi điểm đẹp mắt trong trận đấu bóng rổ mini',
        suggestedPage: 65,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - BƠI (K5) ---
  {
    id: 'k5_tttc_boi_b1',
    grade: 5,
    topicId: 'k5_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác chân kiểu bơi trườn sấp',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 66,
    endPage: 71,
    movements: ['Đập chân trườn sấp trên cạn', 'Đập chân trườn sấp dưới nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động khớp cổ chân, ép dẻo cổ chân trên cạn (Trang 65 SGK)',
        suggestedPage: 66,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật đập chân bơi trườn sấp trên thành bể', page: 66, desc: 'Ngồi trên thành bể, duỗi thẳng cổ chân, đập so le nhịp nhàng từ hông (Trang 65 SGK)' },
          { name: 'Nằm sấp đập chân ôm phao lướt nước', page: 68, desc: 'Thân người nổi thẳng ngang mặt nước, chân đập sủi bọt trắng nhẹ (Trang 67 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đập chân trườn sấp cự ly 15m', page: 69, desc: 'Đập chân liên tục duy trì tốc độ lướt nước (Trang 68 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Tạo lực đẩy chính đưa cơ thể lao nhanh về phía trước',
        suggestedPage: 71,
      },
    },
  },
  {
    id: 'k5_tttc_boi_b2',
    grade: 5,
    topicId: 'k5_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác tay kiểu bơi trườn sấp',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 72,
    endPage: 78,
    movements: ['Quạt tay trườn sấp', 'Vung tay trên không', 'Ôm nước đẩy nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp vai biên độ rộng trên cạn (Trang 71 SGK)',
        suggestedPage: 72,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật quạt nước tay trườn sấp mô phỏng trên cạn', page: 72, desc: 'Cúi gập thân, luân phiên vào nước - ôm nước - quạt nước - vung tay (Trang 71 SGK)' },
          { name: 'Kẹp phao chân tập quạt tay dưới nước', page: 74, desc: 'Kẹp phao giữa hai đùi, tập trung dùng lực quạt tay kéo người đi (Trang 73 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập quạt tay luân phiên cự ly 15m', page: 76, desc: 'Quạt tay đều đặn không ngắt quãng (Trang 75 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kỹ năng bơi sải nhanh nhẹn, bền bỉ',
        suggestedPage: 78,
      },
    },
  },
  {
    id: 'k5_tttc_boi_b3',
    grade: 5,
    topicId: 'k5_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác phối hợp trong bơi trườn sấp',
    pdfFile: 'SGK_GDTC_5_fe099e32.pdf',
    startPage: 79,
    endPage: 85,
    movements: ['Phối hợp tay - chân - thở bơi trườn sấp', 'Bơi trườn sấp hoàn chỉnh'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động toàn thân và tập thở nghiêng đầu trên cạn (Trang 78 SGK)',
        suggestedPage: 79,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Kỹ thuật nghiêng đầu lấy hơi trong bơi trườn sấp', page: 80, desc: 'Tay quạt nước kết hợp nghiêng đầu há miệng hít sâu, úp mặt thở ra (Trang 79 SGK)' },
          { name: 'Phối hợp hoàn chỉnh 6 nhịp chân - 2 nhịp tay - 1 lần thở', page: 81, desc: 'Nhịp nhàng lướt trên mặt nước theo chu kỳ chuẩn (Trang 80 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Bơi trườn sấp hoàn chỉnh cự ly 25m', page: 83, desc: 'Bơi liên tục 25m qua bể bơi đúng kỹ thuật (Trang 82 SGK)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Rèn luyện thể lực toàn diện và thành thạo bơi lội phòng chống đuối nước',
        suggestedPage: 85,
      },
    },
  },
];
