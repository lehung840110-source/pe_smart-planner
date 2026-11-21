import { GradeLevel, SgkImageItem } from '../types/gdtc';

export interface SgkSubFolderItem {
  name: string;
  page: number;
  desc: string;
}

export interface SgkGameSubFolderItem extends SgkSubFolderItem {
  gameName: string;
}

export interface SgkLessonFolder {
  id: string;
  grade: GradeLevel;
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
      items?: SgkSubFolderItem[];
    };
    troChoiKhoiDong: {
      name: string;
      description: string;
      suggestedPage: number;
      items: SgkGameSubFolderItem[];
    };
    kyThuat: {
      name: string;
      items: SgkSubFolderItem[];
    };
    luyenTap: {
      name: string;
      items: SgkSubFolderItem[];
    };
    troChoi: {
      name: string;
      description: string;
      suggestedPage: number;
      items: SgkGameSubFolderItem[];
    };
    vanDung: {
      name: string;
      description: string;
      suggestedPage: number;
      question: string;
      answerGuide: string;
      items?: SgkSubFolderItem[];
    };
  };
}

interface RawSgkLessonFolder extends Omit<SgkLessonFolder, 'subFolders'> {
  subFolders: {
    khoiDong: {
      name: string;
      description: string;
      suggestedPage: number;
      items?: SgkSubFolderItem[];
    };
    troChoiKhoiDong?: {
      name: string;
      description: string;
      suggestedPage?: number;
      items?: Array<{ name: string; page: number; desc: string; gameName?: string }>;
    };
    kyThuat: {
      name: string;
      items: SgkSubFolderItem[];
    };
    luyenTap: {
      name: string;
      items: SgkSubFolderItem[];
    };
    troChoi?: {
      name: string;
      description: string;
      suggestedPage?: number;
      items?: Array<{ name: string; page: number; desc: string; gameName?: string }>;
    };
    vanDung: {
      name: string;
      description: string;
      suggestedPage: number;
      question?: string;
      answerGuide?: string;
      items?: SgkSubFolderItem[];
    };
  };
}

const RAW_SGK_CURRICULUM_TREE: RawSgkLessonFolder[] = [
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
        description: 'Khởi động đôi chân và khớp gối trên cạn (Trang 82 SGK)',
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
        description: 'Tăng cường sức khỏe và sự tự tin dưới nước',
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
    movements: ['Lăn nửa vòng', 'Lăn trọn vòng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động các khớp cổ, vai, hông, gối, cổ tay, cổ chân theo SGK (Trang 37 SGK)',
        suggestedPage: 38,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Lăn nửa vòng', page: 38, desc: 'TTCB nằm sấp, khép chân, hai tay thẳng áp sát tai, bàn tay sấp; nghiêng người sang phải/trái, tay hỗ trợ đẩy người quay nửa vòng thành tư thế nằm ngửa (Trang 37–38 SGK)' },
          { name: 'Lăn trọn vòng', page: 39, desc: 'TTCB nằm sấp, khép chân, hai tay thẳng áp sát tai, bàn tay sấp; nghiêng người sang phải/trái, đẩy người quay liên tục trọn vòng trở về tư thế nằm sấp (Trang 38 SGK)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập lăn nửa vòng và lăn trọn vòng', page: 40, desc: 'Tập luyện theo hướng dẫn SGK GDTC Lớp 5 (Trang 39 SGK)' },
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
        description: 'Khởi động tay, vai và ngón tay (Trang 44 SGK)',
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

  // ==========================================================
  // KHỐI 2 - SÁCH GIÁO KHOA GDTC 2 (KẾT NỐI TRI THỨC)
  // pdfFile: giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf (pdfPage = printedPage + 1)
  // ==========================================================
  // --- CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ (K2) ---
  {
    id: 'k2_cd1_b1',
    grade: 2,
    topicId: 'k2_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Chuyển đội hình hàng dọc thành đội hình vòng tròn và ngược lại',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 9,
    endPage: 13,
    movements: ['Chuyển hàng dọc thành vòng tròn', 'Chuyển vòng tròn thành hàng dọc'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp cổ, vai, khuỷu tay, hông, cổ tay, gối, cổ chân (Tr.8 SGK / PDF Tr.9)',
        suggestedPage: 9,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Chuyển đội hình hàng dọc thành đội hình vòng tròn', page: 10, desc: 'Đi thường theo chiều ngược kim đồng hồ thành vòng tròn, quay mặt vào trong (PDF Tr.10)' },
          { name: 'Chuyển đội hình vòng tròn thành đội hình hàng dọc', page: 11, desc: 'Quay phải/trái theo chiều ngược kim đồng hồ, từ tổ trưởng lần lượt đi thành hàng dọc (PDF Tr.11)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập nhóm, luyện tập cả lớp', page: 12, desc: 'Thực hành chuyển đổi đội hình hàng dọc - vòng tròn theo tổ và cả lớp (PDF Tr.12)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình chuyển hàng dọc thành vòng tròn; tập chuyển vòng tròn thành hàng dọc; ứng dụng khi chơi trò chơi (PDF Tr.13)',
        suggestedPage: 13,
      },
    },
  },
  {
    id: 'k2_cd1_b2',
    grade: 2,
    topicId: 'k2_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Chuyển đội hình hàng ngang thành đội hình vòng tròn và ngược lại',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 14,
    endPage: 18,
    movements: ['Chuyển hàng ngang thành vòng tròn', 'Chuyển vòng tròn thành hàng ngang'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ chân tại chỗ kết hợp làm nóng các khớp (PDF Tr.14)',
        suggestedPage: 14,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Chuyển đội hình hàng ngang thành đội hình vòng tròn', page: 15, desc: 'Từ hàng ngang di chuyển khép kín thành vòng tròn quay mặt vào tâm (PDF Tr.15)' },
          { name: 'Chuyển đội hình vòng tròn thành đội hình hàng ngang', page: 16, desc: 'Từ vòng tròn lần lượt bước về vị trí hàng ngang ngay ngắn (PDF Tr.16)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập nhóm và cả lớp', page: 17, desc: 'Các nhóm và cả lớp tập chuyển hàng ngang thành vòng tròn và ngược lại (PDF Tr.17)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình chuyển vòng tròn thành hàng ngang; ứng dụng khi đồng diễn thể dục (PDF Tr.18)',
        suggestedPage: 18,
      },
    },
  },
  {
    id: 'k2_cd1_b3',
    grade: 2,
    topicId: 'k2_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Giậm chân tại chỗ, đứng lại',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 19,
    endPage: 22,
    movements: ['Giậm chân tại chỗ', 'Đứng lại'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp gối và khởi động các khớp chuẩn bị giậm chân (PDF Tr.19)',
        suggestedPage: 19,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Giậm chân tại chỗ', page: 20, desc: 'Nhịp 1 giậm chân trái, nhịp 2 giậm chân phải, tay đánh tự nhiên nhịp nhàng (PDF Tr.20)' },
          { name: 'Động tác Đứng lại', page: 20, desc: 'Dự lệnh và động lệnh ĐỨNG LẠI rơi vào chân phải, bước thêm 1 nhịp rồi thu chân về nghiêm (PDF Tr.20)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 21, desc: 'Tập giậm chân theo nhịp hô và thực hiện động tác đứng lại đúng nhịp (PDF Tr.21)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình giậm chân tại chỗ và đứng lại; tự hô và thực hiện đúng khẩu lệnh (PDF Tr.22)',
        suggestedPage: 22,
      },
    },
  },

  // --- CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC (K2) ---
  {
    id: 'k2_cd2_b1',
    grade: 2,
    topicId: 'k2_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác vươn thở, động tác tay',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 23,
    endPage: 26,
    movements: ['Động tác Vươn thở (Lớp 2)', 'Động tác Tay (Lớp 2)'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp kết hợp hít thở nhẹ nhàng (PDF Tr.23)',
        suggestedPage: 23,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Vươn thở (Lớp 2)', page: 24, desc: 'Bước chân trái sang ngang, đưa hai tay lên cao chữ V hít sâu vào, hạ tay thở ra (PDF Tr.24)' },
          { name: 'Động tác Tay (Lớp 2)', page: 24, desc: 'Hai tay dang ngang, đưa lên cao vỗ tay, dang ngang lòng bàn tay sấp/ngửa đúng nhịp (PDF Tr.24)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 25, desc: 'Tập luyện theo nhịp đếm 2 lần 8 nhịp cá nhân, cặp đôi và theo nhóm (PDF Tr.25)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình nhịp 3 động tác vươn thở, nhịp 1 động tác tay; tập thể dục trong giờ ra chơi tăng cường sức khoẻ (PDF Tr.26)',
        suggestedPage: 26,
      },
    },
  },
  {
    id: 'k2_cd2_b2',
    grade: 2,
    topicId: 'k2_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác chân, động tác lườn, động tác bụng',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 27,
    endPage: 31,
    movements: ['Động tác Chân (Lớp 2)', 'Động tác Lườn (Lớp 2)', 'Động tác Bụng (Lớp 2)'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp hông và làm nóng khớp gối, eo lườn (PDF Tr.27)',
        suggestedPage: 27,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Chân (Lớp 2)', page: 28, desc: 'Kiễng gót, khuỵu gối kết hợp đưa hai tay ra trước/dang ngang giữ lưng thẳng (PDF Tr.28)' },
          { name: 'Động tác Lườn (Lớp 2)', page: 28, desc: 'Bước chân sang ngang, nghiêng lườn sang trái/phải tay áp tai kéo giãn cơ lườn (PDF Tr.28)' },
          { name: 'Động tác Bụng (Lớp 2)', page: 29, desc: 'Cúi gập thân vỗ tay dưới hoặc chạm mũi chân giữ thẳng hai đầu gối (PDF Tr.29)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 29, desc: 'Ôn tập phối hợp liên hoàn Vươn thở - Tay - Chân - Lườn - Bụng (PDF Tr.29)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết nhịp động tác chân, nhịp 2 lườn, nhịp 3 bụng; tập lúc giải lao sinh hoạt câu lạc bộ (PDF Tr.30-31)',
        suggestedPage: 31,
      },
    },
  },
  {
    id: 'k2_cd2_b3',
    grade: 2,
    topicId: 'k2_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác phối hợp, động tác nhảy, động tác điều hoà',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 32,
    endPage: 36,
    movements: ['Động tác Phối hợp (Lớp 2)', 'Động tác Nhảy (Lớp 2)', 'Động tác Điều hoà (Lớp 2)'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ tay, cổ chân chuẩn bị bật nhảy (PDF Tr.32)',
        suggestedPage: 32,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Phối hợp (Lớp 2)', page: 33, desc: 'Khuỵu gối trước chân sau thẳng, xoay thân phối hợp tay nhịp nhàng (PDF Tr.33)' },
          { name: 'Động tác Nhảy (Lớp 2)', page: 33, desc: 'Bật tách hai chân dang tay/vỗ tay trên cao rồi bật chụm chân thu tay (PDF Tr.33)' },
          { name: 'Động tác Điều hoà (Lớp 2)', page: 34, desc: 'Lắc cổ tay thả lỏng tay chân kết hợp hít thở đều làm dịu nhịp tim (PDF Tr.34)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 34, desc: 'Tập hoàn chỉnh 8 động tác bài thể dục lớp 2 theo cá nhân, cặp đôi, nhóm (PDF Tr.34)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình nhịp 1 phối hợp, nhịp 2 nhảy, nhịp 3 điều hoà; tập tránh mệt mỏi để học tốt các môn khác (PDF Tr.35-36)',
        suggestedPage: 36,
      },
    },
  },

  // --- CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN (K2 - 6 BÀI) ---
  {
    id: 'k2_cd3_b1',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b1',
    lessonName: 'Bài 1: Bài tập di chuyển theo vạch kẻ thẳng',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 37,
    endPage: 40,
    movements: ['Đi thường theo vạch kẻ thẳng', 'Đi kiễng gót theo vạch kẻ thẳng', 'Phối hợp đi theo vạch kẻ thẳng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp làm nóng toàn thân trước khi tập di chuyển (PDF Tr.37)',
        suggestedPage: 37,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi thường theo vạch kẻ thẳng (tay tự nhiên, dang ngang, giơ cao) & Đi kiễng gót', page: 38, desc: 'Thực hiện 4 biến thể đi theo vạch kẻ thẳng giữ thân thẳng (PDF Tr.38)' },
          { name: 'Bài tập phối hợp đi thường theo vạch kẻ thẳng', page: 39, desc: 'Phối hợp liên hoàn các động tác tay khi đi theo vạch kẻ thẳng (PDF Tr.39)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 39, desc: 'Thực hành đi theo vạch kẻ thẳng cá nhân, cặp đôi và theo tổ (PDF Tr.39)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình đi thường tay phối hợp tự nhiên; tập cùng người thân; tập chống tê chân khi ngồi học bài (PDF Tr.40)',
        suggestedPage: 40,
      },
    },
  },
  {
    id: 'k2_cd3_b2',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b2',
    lessonName: 'Bài 2: Bài tập phối hợp di chuyển vòng trái, vòng phải',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 41,
    endPage: 46,
    movements: ['Đi thường vòng trái, vòng phải', 'Đi kiễng gót vòng trái, vòng phải'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ chân kết hợp đi chậm tại chỗ (PDF Tr.41)',
        suggestedPage: 41,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi thường theo vạch kẻ vòng trái, vòng phải (tay tự nhiên, dang ngang)', page: 42, desc: 'Di chuyển theo vạch kẻ vòng trái/phải giữ thăng bằng và tư thế đẹp (PDF Tr.42-43)' },
          { name: 'Đi kiễng gót vòng trái, vòng phải & Bài tập phối hợp', page: 43, desc: 'Đi kiễng gót tay chống hông và bài tập phối hợp vòng trái, vòng phải (PDF Tr.43-44)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 44, desc: 'Tập đi vòng trái, vòng phải theo làn vạch cong theo cặp và nhóm (PDF Tr.44)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết đi vòng trái/vòng phải; di chuyển vòng tránh vũng nước trên sân trường (PDF Tr.45-46)',
        suggestedPage: 46,
      },
    },
  },
  {
    id: 'k2_cd3_b3',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b3',
    lessonName: 'Bài 3: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ thẳng',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 47,
    endPage: 51,
    movements: ['Đi nhanh dần theo vạch kẻ thẳng', 'Đi nhanh chuyển sang chạy'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp gối và khởi động các khớp cổ chân (PDF Tr.47)',
        suggestedPage: 47,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi nhanh dần theo vạch kẻ thẳng & Đi nhanh chuyển sang chạy', page: 48, desc: 'Đi nhanh dần tay tự nhiên/chống hông rồi chuyển nhịp sang chạy trên vạch thẳng (PDF Tr.48)' },
          { name: 'Bài tập phối hợp di chuyển nhanh dần', page: 49, desc: 'Phối hợp tăng tốc nhịp nhàng theo vạch kẻ thẳng (PDF Tr.49)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 49, desc: 'Thực hành đi nhanh dần chuyển sang chạy theo tổ nhóm an toàn (PDF Tr.49)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình đi nhanh dần, đi nhanh chuyển sang chạy; tập đi nhanh và chạy tăng cường sức khoẻ (PDF Tr.50-51)',
        suggestedPage: 51,
      },
    },
  },
  {
    id: 'k2_cd3_b4',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b4',
    lessonName: 'Bài 4: Bài tập phối hợp di chuyển nhanh dần theo vạch kẻ sang trái và sang phải',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 52,
    endPage: 56,
    movements: ['Đi nhanh dần vòng trái, vòng phải', 'Đi nhanh chuyển chạy hướng trái, phải'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ chân tại chỗ và bước chuyển hướng nhẹ nhàng (PDF Tr.52)',
        suggestedPage: 52,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi nhanh dần theo vạch kẻ vòng trái, vòng phải', page: 53, desc: 'Đi nhanh dần tay tự nhiên hoặc dang ngang chuyển hướng vòng trái, vòng phải (PDF Tr.53-54)' },
          { name: 'Đi nhanh chuyển chạy hướng trái/phải & Bài tập phối hợp', page: 54, desc: 'Chuyển từ đi nhanh sang chạy theo đường vòng sang trái và sang phải (PDF Tr.54-55)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 55, desc: 'Các nhóm luyện tập di chuyển nhanh dần theo vạch đổi hướng trái - phải (PDF Tr.55)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Đếm số lần rẽ phải, rẽ trái theo hình mũi tên; di chuyển sang phải/trái tránh vũng nước (PDF Tr.56)',
        suggestedPage: 56,
      },
    },
  },
  {
    id: 'k2_cd3_b5',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b5',
    lessonName: 'Bài 5: Các động tác quỳ, ngồi cơ bản',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 57,
    endPage: 60,
    movements: ['Ngồi xổm, ngồi kiễng gót, ngồi bệt thẳng chân', 'Quỳ thấp, quỳ cao'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp hông và làm nóng khớp gối, cổ chân (PDF Tr.57)',
        suggestedPage: 57,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Ngồi xổm, Ngồi kiễng hai gót chân, Ngồi bệt thẳng chân, Quỳ thấp', page: 58, desc: 'Thực hiện chuẩn xác các tư thế ngồi và quỳ thấp giữ lưng thẳng (PDF Tr.58)' },
          { name: 'Động tác Quỳ cao', page: 59, desc: 'Hai gối quỳ trên thảm, thân người dựng thẳng từ đùi lên vai (PDF Tr.59)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 59, desc: 'Tập chuyển đổi giữa các tư thế ngồi và quỳ cơ bản (PDF Tr.59)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phân biệt quỳ thấp và quỳ cao, ngồi bệt thẳng chân; vận dụng các tư thế ngồi để khởi động (PDF Tr.60)',
        suggestedPage: 60,
      },
    },
  },
  {
    id: 'k2_cd3_b6',
    grade: 2,
    topicId: 'k2_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b6',
    lessonName: 'Bài 6: Bài tập phối hợp các tư thế quỳ, ngồi cơ bản',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 61,
    endPage: 65,
    movements: ['Phối hợp quỳ cao - quỳ thấp', 'Phối hợp ngồi xổm - kiễng gót', 'Ngồi bệt đá chân'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp gối và kéo giãn nhẹ khớp hông, đùi (PDF Tr.61)',
        suggestedPage: 61,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Bài tập 1 (Quỳ cao - quỳ thấp gập thân) & Bài tập 2 (Ngồi xổm - tì gối kiễng gót)', page: 62, desc: 'Phối hợp quỳ cao/thấp duỗi tay và ngồi xổm/kiễng gót dang tay (PDF Tr.62)' },
          { name: 'Bài tập 3: Ngồi bệt thẳng chân đá chân lên cao - co gối', page: 63, desc: 'Ngồi bệt chống tay sau, luân phiên đá thẳng chân và co gối nhịp nhàng (PDF Tr.63)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 63, desc: 'Thực hiện 3 bài tập phối hợp quỳ, ngồi theo nhịp đếm đồng đều (PDF Tr.63-64)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết nhịp của Bài tập 1; tập bài phối hợp hằng ngày và khi thấy mệt mỏi (PDF Tr.64-65)',
        suggestedPage: 65,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - CHỦ ĐỀ 1: MÔN BÓNG RỔ (K2 - 4 BÀI) ---
  {
    id: 'k2_tttc_br_b1',
    grade: 2,
    topicId: 'k2_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác di chuyển không bóng',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 66,
    endPage: 70,
    movements: ['Nhảy bằng hai chân', 'Nhảy bằng một chân', 'Động tác nhảy dừng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp cổ tay, cổ chân, gối, hông chuẩn bị bật nhảy (PDF Tr.66)',
        suggestedPage: 66,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Nhảy bằng hai chân & Nhảy bằng một chân', page: 67, desc: 'Bật nhảy nhẹ nhàng tiếp đất bằng nửa trước bàn chân, giữ thăng bằng (PDF Tr.67-68)' },
          { name: 'Động tác nhảy dừng', page: 68, desc: 'Đang di chuyển bật nhẹ tiếp đất đồng thời hai chân khuỵu gối dừng vững vàng (PDF Tr.68)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 68, desc: 'Tập bật nhảy và nhảy dừng theo tín hiệu còi theo nhóm (PDF Tr.68-69)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết động tác nhảy dừng hai chân và vận dụng khi vui chơi bóng rổ (PDF Tr.69-70)',
        suggestedPage: 70,
      },
    },
  },
  {
    id: 'k2_tttc_br_b2',
    grade: 2,
    topicId: 'k2_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác dẫn bóng',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 71,
    endPage: 74,
    movements: ['Làm quen cảm giác bóng', 'Dẫn bóng cao tay tại chỗ', 'Dẫn bóng di chuyển nhanh dần'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ tay, vai và ép dẻo bàn tay trước khi cầm bóng (PDF Tr.71)',
        suggestedPage: 71,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Lăn bóng qua lại, chuyền vòng quanh eo & Dẫn bóng cao tay tại chỗ', page: 72, desc: 'Dùng các ngón tay xòe rộng ấn đẩy bóng nảy đều ngang thắt lưng (PDF Tr.72)' },
          { name: 'Dẫn bóng di chuyển nhanh dần lên trước', page: 73, desc: 'Vừa đi vừa đẩy bóng chếch phía trước bước chạy và tăng tốc độ (PDF Tr.72-73)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 73, desc: 'Thực hành dẫn bóng tại chỗ và di chuyển theo hàng (PDF Tr.73)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn tư thế bàn tay dẫn bóng đúng và rèn cảm giác bóng rổ hằng ngày (PDF Tr.74)',
        suggestedPage: 74,
      },
    },
  },
  {
    id: 'k2_tttc_br_b3',
    grade: 2,
    topicId: 'k2_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác tung – bắt bóng bằng hai tay',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 75,
    endPage: 78,
    movements: ['Tại chỗ tung bóng ra trước hai tay', 'Di chuyển tung - bắt bóng hai tay'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ tay, khuỷu tay, vai và ép giãn ngón tay (PDF Tr.75)',
        suggestedPage: 75,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ tung bóng ra trước bằng hai tay & Di chuyển tung - bắt bóng', page: 76, desc: 'Hai tay cầm bóng trước ngực tung vòng cung và di chuyển đỡ bắt bóng gọn (PDF Tr.76)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 77, desc: 'Tập tung - bắt bóng cặp đôi và theo nhóm giữ cự ly phù hợp (PDF Tr.77)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết tư thế chuẩn bị tung bắt bóng và phối hợp chơi cùng bạn (PDF Tr.78)',
        suggestedPage: 78,
      },
    },
  },
  {
    id: 'k2_tttc_br_b4',
    grade: 2,
    topicId: 'k2_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Động tác ném rổ hai tay trước ngực',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 79,
    endPage: 82,
    movements: ['Tại chỗ ném rổ hai tay trước ngực cự li gần'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp và ép dẻo cổ tay chuẩn bị ném rổ (PDF Tr.79)',
        suggestedPage: 79,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ ném rổ hai tay trước ngực cự li gần', page: 80, desc: 'Hai chân đứng rộng bằng vai, khuỵu gối rồi đẩy mạnh bóng vòng cung từ ngực vào rổ (PDF Tr.80)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 80, desc: 'Thực hành ném rổ hai tay trước ngực cự li gần theo tổ nhóm (PDF Tr.80-81)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Quan sát bảng rổ, căn lực đẩy hai tay phù hợp khi ném rổ cự li gần (PDF Tr.82)',
        suggestedPage: 82,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - CHỦ ĐỀ 2: MÔN BƠI (K2 - 4 BÀI) ---
  {
    id: 'k2_tttc_boi_b1',
    grade: 2,
    topicId: 'k2_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b1',
    lessonName: 'Bài 1: Ôm gối nổi người trong nước',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 83,
    endPage: 85,
    movements: ['Hít thở và nín thở dưới nước', 'Ôm gối nổi người trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động kĩ các khớp trên cạn trước khi xuống bể bơi (PDF Tr.83)',
        suggestedPage: 83,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Ôm gối nổi người trong nước', page: 84, desc: 'Hít sâu nín thở, thu hai gối sát ngực hai tay ôm cẳng chân để lưng nổi tự nhiên (PDF Tr.84)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập trên cạn và dưới nước có người hướng dẫn', page: 84, desc: 'Tập ôm gối nổi sấp và đứng lại an toàn tại vùng nước nông (PDF Tr.84-85)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Giữ bình tĩnh thả lỏng cơ thể khi nổi nước và tuân thủ an toàn bể bơi (PDF Tr.85)',
        suggestedPage: 85,
      },
    },
  },
  {
    id: 'k2_tttc_boi_b2',
    grade: 2,
    topicId: 'k2_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b2',
    lessonName: 'Bài 2: Nổi người duỗi thẳng chân tay trong nước',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 86,
    endPage: 88,
    movements: ['Nổi người duỗi thẳng chân tay trong nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Gập thân vặn mình và xoay các khớp trên cạn trước khi xuống nước (PDF Tr.86)',
        suggestedPage: 86,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Nổi người duỗi thẳng chân tay trong nước', page: 87, desc: 'Nín thở úp mặt xuống nước, duỗi thẳng hai tay về trước và duỗi thẳng hai chân nổi ngang mặt nước (PDF Tr.87)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập nổi duỗi thẳng theo cặp và nhóm', page: 87, desc: 'Thực hành nổi sấp duỗi thẳng thân người tại khu vực nước cạn (PDF Tr.87-88)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Kiểm soát thăng bằng thân người thẳng ngang mặt nước tạo đà học bơi (PDF Tr.88)',
        suggestedPage: 88,
      },
    },
  },
  {
    id: 'k2_tttc_boi_b3',
    grade: 2,
    topicId: 'k2_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b3',
    lessonName: 'Bài 3: Đạp thành bể (hồ) bơi lướt nước',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 89,
    endPage: 91,
    movements: ['Đạp thành bể bơi lướt nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay hông và khởi động các khớp cổ chân, đầu gối trên cạn (PDF Tr.89)',
        suggestedPage: 89,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đạp thành bể (hồ) bơi lướt nước', page: 90, desc: 'Lưng tựa thành bể, duỗi thẳng hai tay kẹp mang tai, đạp mạnh hai bàn chân vào thành bể lướt thẳng (PDF Tr.90)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đạp thành bể lướt nước theo làn', page: 90, desc: 'Các nhóm luân phiên đạp thành bể lướt nước giữ tư thế thuôn thẳng (PDF Tr.90-91)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Giữ thân người thẳng và khép sát hai tay mang tai để lướt nước xa nhất (PDF Tr.91)',
        suggestedPage: 91,
      },
    },
  },
  {
    id: 'k2_tttc_boi_b4',
    grade: 2,
    topicId: 'k2_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b4',
    lessonName: 'Bài 4: Đạp đáy bể (hồ) bơi lướt nước',
    pdfFile: 'giao-duc-the-chat-2-ket-noi-tri-thuc-voi-cuoc-song_1806713a.pdf',
    startPage: 92,
    endPage: 94,
    movements: ['Đạp đáy bể bơi lướt nước'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp cổ chân tại chỗ và khởi động kĩ trên cạn (PDF Tr.92)',
        suggestedPage: 92,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đạp đáy bể (hồ) bơi lướt nước', page: 93, desc: 'Đứng khuỵu gối dưới nước, giơ thẳng hai tay kẹp tai, ngả thân đạp mạnh đáy bể lướt về trước (PDF Tr.93)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập đạp đáy bể lướt nước theo cặp/nhóm', page: 93, desc: 'Thực hành đạp đáy bể lướt nước khoảng 3-5m và đứng lại an toàn (PDF Tr.93-94)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Biết đạp đáy bể lướt nước khi tập luyện ở bể bơi nông dưới sự giám sát của người lớn (PDF Tr.94)',
        suggestedPage: 94,
      },
    },
  },

  // ==========================================================
  // KHỐI 4 - SÁCH GIÁO KHOA GDTC 4 (KẾT NỐI TRI THỨC)
  // pdfFile: SGK-GDTC-4-KNTT_1eb26d75.pdf (pdfPage = printedPage + 2)
  // ==========================================================
  // --- CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ (K4 - 3 BÀI) ---
  {
    id: 'k4_cd1_b1',
    grade: 4,
    topicId: 'k4_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Đi đều vòng bên phải',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 10,
    endPage: 14,
    movements: ['Đi đều vòng bên phải', 'Một hàng dọc đi đều vòng bên phải', 'Nhiều hàng dọc đi đều vòng bên phải'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp và chạy một vòng quanh sân tập (Tr.8 SGK / PDF Tr.10)',
        suggestedPage: 10,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi đều vòng bên phải & Một hàng dọc đi đều vòng bên phải', page: 11, desc: 'Khi nghe động lệnh BƯỚC! rơi vào chân phải, bước thêm chân trái rồi xoay mũi chân chuyển hướng vòng phải (PDF Tr.11-12)' },
          { name: 'Nhiều hàng dọc đi đều vòng bên phải', page: 12, desc: 'Hàng bên phải làm chuẩn bước ngắn, các hàng bên trái mở rộng bước giữ hàng ngang thẳng (PDF Tr.12-13)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 13, desc: 'Thực hành một hàng dọc và nhiều hàng dọc đi đều vòng bên phải theo khẩu lệnh (PDF Tr.13)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Khẩu lệnh "Vòng bên phải – Bước!", chọn hình một hàng dọc đi đều vòng phải, tập khi vui chơi giữa giờ (PDF Tr.14)',
        suggestedPage: 14,
      },
    },
  },
  {
    id: 'k4_cd1_b2',
    grade: 4,
    topicId: 'k4_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Đi đều vòng bên trái',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 15,
    endPage: 18,
    movements: ['Đi đều vòng bên trái', 'Một hàng dọc đi đều vòng bên trái', 'Nhiều hàng dọc đi đều vòng bên trái'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp, chạy quanh sân và chạy tại chỗ gót chạm mông (PDF Tr.15)',
        suggestedPage: 15,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi đều vòng bên trái & Một hàng dọc đi đều vòng bên trái', page: 16, desc: 'Động lệnh BƯỚC! rơi vào chân trái, bước thêm chân phải rồi chuyển hướng vòng bên trái (PDF Tr.16)' },
          { name: 'Nhiều hàng dọc đi đều vòng bên trái', page: 16, desc: 'Hàng ngoài cùng bên trái làm chuẩn bước ngắn, các hàng bên phải mở rộng bước dóng hàng (PDF Tr.16-17)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 17, desc: 'Thực hành đi đều vòng bên trái theo đội hình 1 hàng và nhiều hàng dọc (PDF Tr.17)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Xác định vị trí làm chuẩn khi nhiều hàng dọc vòng bên trái; chọn hình đúng; tập ngoại khoá (PDF Tr.18)',
        suggestedPage: 18,
      },
    },
  },
  {
    id: 'k4_cd1_b3',
    grade: 4,
    topicId: 'k4_cd1',
    topicName: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Đi đều vòng sau',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 19,
    endPage: 25,
    movements: ['Đi đều vòng sau bên phải/bên trái', 'Một hàng dọc đi đều vòng sau', 'Nhiều hàng dọc đi đều vòng sau'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp, chạy quanh sân và đá lăng cẳng chân ra trước (PDF Tr.19)',
        suggestedPage: 19,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đi đều vòng sau bên phải / bên trái & Một hàng dọc đi đều vòng sau', page: 20, desc: 'Thực hiện vòng chuyển hướng 180 độ về phía sau theo khẩu lệnh vòng sau bên phải/trái (PDF Tr.20-21)' },
          { name: 'Nhiều hàng dọc đi đều vòng sau bên phải / bên trái', page: 22, desc: 'Phối hợp giữ cự ly hàng ngang và góc quay đồng bộ giữa các hàng khi đi đều vòng sau (PDF Tr.22-23)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 23, desc: 'Tập đi đều vòng sau theo cặp và đội hình nhiều hàng dọc (PDF Tr.23-24)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Khẩu lệnh "Bên trái, vòng sau – Bước!", đánh giá đúng/sai hình và vị trí chuẩn khi vòng sau bên phải (PDF Tr.25)',
        suggestedPage: 25,
      },
    },
  },

  // --- CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG (K4 - 3 BÀI) ---
  {
    id: 'k4_cd2_b1',
    grade: 4,
    topicId: 'k4_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác vươn thở, động tác tay, động tác chân với vòng',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 26,
    endPage: 30,
    movements: ['Động tác Vươn thở với vòng', 'Động tác Tay với vòng', 'Động tác Chân với vòng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp kết hợp chạy tại chỗ, vỗ tay (PDF Tr.26)',
        suggestedPage: 26,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Vươn thở với vòng', page: 27, desc: 'Hai tay cầm vòng đưa lên cao chếch trước ngửa mặt hít sâu, hạ vòng thở ra (PDF Tr.27)' },
          { name: 'Động tác Tay với vòng & Động tác Chân với vòng', page: 28, desc: 'Thực hiện nhịp 1-8 động tác tay với vòng và động tác chân khuỵu gối với vòng (PDF Tr.28)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 29, desc: 'Ôn tập theo nhịp 2 lần 8 nhịp 3 động tác Vươn thở, Tay, Chân với vòng (PDF Tr.29)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận biết nhịp 3 động tác tay với vòng, nhịp 5; tập với vòng buổi sáng (PDF Tr.30)',
        suggestedPage: 30,
      },
    },
  },
  {
    id: 'k4_cd2_b2',
    grade: 4,
    topicId: 'k4_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác lườn, động tác lưng – bụng, động tác toàn thân với vòng',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 31,
    endPage: 34,
    movements: ['Động tác Lườn với vòng', 'Động tác Lưng - bụng với vòng', 'Động tác Toàn thân với vòng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp, giậm chân vỗ tay, cúi gập thân và vặn mình (PDF Tr.31)',
        suggestedPage: 31,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Lườn với vòng & Động tác Lưng – bụng với vòng', page: 32, desc: 'Cầm vòng nghiêng lườn trái/phải và cúi gập thân đưa vòng xuống thấp giữ thẳng gối (PDF Tr.32)' },
          { name: 'Động tác Toàn thân với vòng', page: 33, desc: 'Phối hợp bước chân khuỵu gối trước và xoay vặn thân đưa vòng nhịp nhàng (PDF Tr.33)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 33, desc: 'Tập liên hoàn Lườn - Lưng bụng - Toàn thân với vòng theo tổ nhóm (PDF Tr.33)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình nhịp 3 toàn thân với vòng, nhận diện động tác và nhịp, tập giờ ra chơi (PDF Tr.34)',
        suggestedPage: 34,
      },
    },
  },
  {
    id: 'k4_cd2_b3',
    grade: 4,
    topicId: 'k4_cd2',
    topicName: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI VÒNG',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác nhảy, động tác điều hoà với vòng',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 35,
    endPage: 38,
    movements: ['Động tác Nhảy với vòng', 'Động tác Điều hoà với vòng', 'Hoàn thiện bài TD với vòng'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp, chạy quanh sân, cúi gập thân và vặn mình (PDF Tr.35)',
        suggestedPage: 35,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Động tác Nhảy với vòng', page: 36, desc: 'Bật tách hai chân kết hợp đưa vòng ra trước/lên cao, bật chụm chân thu vòng (PDF Tr.36)' },
          { name: 'Động tác Điều hoà với vòng', page: 36, desc: 'Nâng gối thả lỏng, xoay lắc vòng nhẹ nhàng kết hợp hít thở sâu (PDF Tr.36)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 37, desc: 'Ôn luyện hoàn chỉnh 8 động tác bài thể dục với vòng theo nhóm (PDF Tr.37)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình nhịp 1 điều hoà với vòng, nhận diện động tác và nhịp, tập ngoại khoá (PDF Tr.38)',
        suggestedPage: 38,
      },
    },
  },

  // --- CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN (K4 - 4 BÀI) ---
  {
    id: 'k4_cd3_b1',
    grade: 4,
    topicId: 'k4_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b1',
    lessonName: 'Bài 1: Bài tập rèn luyện kĩ năng thăng bằng',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 39,
    endPage: 43,
    movements: ['Đứng kiễng gót rộng bằng vai/chân trước sau', 'Đứng kiễng gót trên một chân', 'Thăng bằng tại chỗ và di chuyển'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp kết hợp giậm chân tại chỗ, vỗ tay (PDF Tr.39)',
        suggestedPage: 39,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Đứng kiễng gót rộng bằng vai, chân trước sau & trên một chân', page: 40, desc: 'Giữ thân thẳng thăng bằng trên nửa trước bàn chân ở tư thế hai chân và một chân (PDF Tr.40-41)' },
          { name: 'Bài tập rèn luyện kĩ năng thăng bằng tại chỗ & khi di chuyển', page: 41, desc: 'Phối hợp giữ thăng bằng tĩnh và di chuyển trên vạch thẳng/bục thấp (PDF Tr.41-42)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 42, desc: 'Thực hành các bài tập giữ thăng bằng cá nhân và theo tổ nhóm (PDF Tr.42)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Nhận diện động tác; thăng bằng đứng kiễng gót một chân trong thể dục nhịp điệu; tập giữ thăng bằng giúp chân thon gọn (PDF Tr.43)',
        suggestedPage: 43,
      },
    },
  },
  {
    id: 'k4_cd3_b2',
    grade: 4,
    topicId: 'k4_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b2',
    lessonName: 'Bài 2: Bài tập rèn luyện kĩ năng bật xa',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 44,
    endPage: 48,
    movements: ['Tại chỗ bật xa', 'Di chuyển một bước bật xa giậm nhảy hai chân', 'Giậm nhảy bằng một chân'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp, ép dọc/ngang và tập 7 động tác thể dục (trừ điều hoà) (PDF Tr.44)',
        suggestedPage: 44,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ bật xa & Di chuyển một bước bật xa giậm nhảy hai chân', page: 45, desc: 'Đánh tay ra sau khuỵu gối, đạp mạnh hai chân bật xa về trước tiếp đất chùng gối (PDF Tr.45)' },
          { name: 'Di chuyển một bước bật xa: giậm nhảy bằng một chân', page: 46, desc: 'Bước 1 chân giậm nhảy mạnh bật xa, thu hai chân tiếp đất êm đồng thời (PDF Tr.46)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 46, desc: 'Luyện bật xa tại chỗ và di chuyển 1 bước bật xa theo mức vạch đích (PDF Tr.46-47)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Chọn hình đúng bật xa, nhận diện giậm nhảy một chân, bật xa vượt chướng ngại vật nhỏ (PDF Tr.48)',
        suggestedPage: 48,
      },
    },
  },
  {
    id: 'k4_cd3_b3',
    grade: 4,
    topicId: 'k4_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b3',
    lessonName: 'Bài 3: Bài tập rèn luyện kĩ năng bật cao',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 49,
    endPage: 52,
    movements: ['Tại chỗ bật cao', 'Di chuyển một bước bật cao'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp, kiễng gót, gập/ngả thân, nghiêng lườn và chạy vòng tròn (PDF Tr.49)',
        suggestedPage: 49,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ bật cao', page: 50, desc: 'Khuỵu gối đánh tay lên cao bật thẳng thân chạm vật chuẩn, tiếp đất mũi chân chùng gối (PDF Tr.50)' },
          { name: 'Di chuyển một bước bật cao', page: 50, desc: 'Bước đệm 1 bước lấy đà giậm nhảy bật cao vươn tay lên trên (PDF Tr.50)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 51, desc: 'Tập bật cao chạm bóng/vật chuẩn treo cao theo nhóm (PDF Tr.51)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Hiểu vai trò chùng gối và hạ tay khi tiếp đất; vận dụng bật cao chạm vật trên cao và chơi thể thao (PDF Tr.52)',
        suggestedPage: 52,
      },
    },
  },
  {
    id: 'k4_cd3_b4',
    grade: 4,
    topicId: 'k4_cd3',
    topicName: 'CHỦ ĐỀ 3: TƯ THẾ VÀ KĨ NĂNG VẬN ĐỘNG CƠ BẢN',
    lessonId: 'b4',
    lessonName: 'Bài 4: Nhảy dây',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 53,
    endPage: 57,
    movements: ['So dây, chao dây', 'Nhảy dây chụm chân', 'Nhảy dây qua từng chân'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp, đánh hông, nghiêng lườn, ép dọc/ngang và di chuyển tiến lùi theo còi (PDF Tr.53)',
        suggestedPage: 53,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'So dây, chao dây & Nhảy dây chụm chân', page: 54, desc: 'Đo dây vừa tầm, chao dây nhịp nhàng và bật chụm hai chân qua dây đều nhịp (PDF Tr.54-55)' },
          { name: 'Nhảy dây qua từng chân', page: 55, desc: 'Quay dây đều bằng cổ tay, bật luân phiên qua dây từng chân nhẹ nhàng (PDF Tr.55)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 55, desc: 'Luyện nhảy dây chụm chân và qua từng chân theo cặp đôi, tổ nhóm (PDF Tr.55-56)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Phân biệt nhảy dây chụm chân và qua từng chân; nhận diện so dây/chao dây; tập hằng ngày tăng linh hoạt (PDF Tr.57)',
        suggestedPage: 57,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - CHỦ ĐỀ 1: MÔN BÓNG RỔ (K4 - 4 BÀI) ---
  {
    id: 'k4_tttc_br_b1',
    grade: 4,
    topicId: 'k4_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b1',
    lessonName: 'Bài 1: Các động tác làm tăng khả năng điều khiển bóng',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 58,
    endPage: 62,
    movements: ['Chuyển bóng ngang đầu và vòng quanh thân/chân', 'Chuyển bóng hình số 8', 'Lăn bóng qua hai chân'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp và khởi động ngón tay, cổ tay làm quen bóng rổ (PDF Tr.58-59)',
        suggestedPage: 58,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Chuyển bóng từ dưới lên trên – ngang đầu, vòng quanh chân & thân', page: 59, desc: 'Dùng các đầu ngón tay chuyền bóng linh hoạt quanh đầu, eo thân và cổ chân (PDF Tr.59-60)' },
          { name: 'Chuyển bóng qua hai chân hình số 8 & Lăn bóng qua hai chân', page: 61, desc: 'Tách chân rộng hơn vai, chuyền và lăn bóng liên hoàn hình số 8 qua hai chân (PDF Tr.61)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 61, desc: 'Tập thuần thục chuỗi bài tập điều khiển bóng tại chỗ (PDF Tr.61-62)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Vận dụng các bài tập vờn bóng để tăng cảm giác bóng và độ khéo léo cổ tay (PDF Tr.62)',
        suggestedPage: 62,
      },
    },
  },
  {
    id: 'k4_tttc_br_b2',
    grade: 4,
    topicId: 'k4_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác tại chỗ dẫn bóng theo hình chữ V, dẫn bóng vượt chướng ngại vật',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 63,
    endPage: 66,
    movements: ['Tại chỗ dẫn bóng theo hình chữ V', 'Dẫn bóng vượt chướng ngại vật'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp, ép cổ tay và bật nhún nhẹ tại chỗ (PDF Tr.63)',
        suggestedPage: 63,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ dẫn bóng theo hình chữ V & Dẫn bóng vượt chướng ngại vật', page: 64, desc: 'Hạ thấp trọng tâm đẩy bóng đổi tay chữ V trước người và dẫn bóng qua cọc tiêu (PDF Tr.64)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 65, desc: 'Tập dẫn bóng chữ V tại chỗ và dẫn bóng zíc zắc qua hàng cọc (PDF Tr.65)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Dùng tay xa chướng ngại vật khi dẫn bóng đổi hướng để giữ bóng an toàn (PDF Tr.66)',
        suggestedPage: 66,
      },
    },
  },
  {
    id: 'k4_tttc_br_b3',
    grade: 4,
    topicId: 'k4_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác chuyền, bắt bóng bật đất bằng hai tay trước ngực',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 67,
    endPage: 69,
    movements: ['Chuyền bóng bật đất hai tay trước ngực', 'Bắt bóng bật đất hai tay trước ngực'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp vai, cổ tay và giãn cơ cẳng tay (PDF Tr.67)',
        suggestedPage: 67,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Chuyền bóng bật đất & Bắt bóng bật đất bằng hai tay trước ngực', page: 68, desc: 'Bước chân đẩy bóng chạm sàn khoảng 2/3 cự ly đến bạn; mở ngón tay đón bóng hoãn xung (PDF Tr.68)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cặp đôi và theo nhóm', page: 68, desc: 'Tập chuyền và bắt bóng bật đất hai tay trước ngực theo cặp đối diện (PDF Tr.68-69)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Xác định điểm bóng chạm sàn hợp lí khi chuyền bật đất cho đồng đội (PDF Tr.69)',
        suggestedPage: 69,
      },
    },
  },
  {
    id: 'k4_tttc_br_b4',
    grade: 4,
    topicId: 'k4_tttc_br',
    topicName: 'THỂ THAO TỰ CHỌN: BÓNG RỔ',
    lessonId: 'b4',
    lessonName: 'Bài 4: Động tác ném rổ bằng một tay trên vai',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 70,
    endPage: 72,
    movements: ['Tại chỗ ném rổ bằng một tay trên vai'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp vai, khuỷu tay, cổ tay và làm nóng đôi chân (PDF Tr.70)',
        suggestedPage: 70,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tại chỗ ném rổ bằng một tay trên vai', page: 71, desc: 'Tay thuận đặt sau dưới bóng ngang vai, tay phụ giữ bên; duỗi gối đẩy tay vẩy cổ tay vào rổ (PDF Tr.71)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập cá nhân, cặp đôi, nhóm', page: 71, desc: 'Thực hành ném rổ một tay trên vai ở cự ly gần theo nhóm (PDF Tr.71-72)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Thực hiện đúng tư thế vẩy cổ tay tạo quỹ đạo vòng cung khi ném rổ một tay trên vai (PDF Tr.72)',
        suggestedPage: 72,
      },
    },
  },

  // --- PHẦN 3: THỂ THAO TỰ CHỌN - CHỦ ĐỀ 2: MÔN BƠI (K4 - 3 BÀI) ---
  {
    id: 'k4_tttc_boi_b1',
    grade: 4,
    topicId: 'k4_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b1',
    lessonName: 'Bài 1: Động tác chân kiểu bơi ếch',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 73,
    endPage: 79,
    movements: ['Tập chân ếch trên cạn', 'Tập chân ếch vịn thành bể', 'Đạp chân ếch di động có/không điểm tựa'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Khởi động kĩ khớp háng, gối, cổ chân trên cạn trước khi xuống bể (PDF Tr.73-74)',
        suggestedPage: 73,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tập động tác chân ếch trên sân & trên ghế băng/bục xuất phát', page: 75, desc: 'Thực hiện 4 nhịp: Co chân - Bẻ mũi chân - Đạp khép - Duỗi thẳng lướt nước (PDF Tr.75)' },
          { name: 'Tập chân ếch trên thành bể & di động có/không điểm tựa', page: 76, desc: 'Vịn thành bể và ôm phao tập đạp chân ếch nhịp nhàng dưới nước (PDF Tr.76-77)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập trên cạn và dưới nước theo nhóm', page: 78, desc: 'Thực hành đạp chân ếch với phao giữ nhịp co - bẻ - đạp - khép chuẩn xác (PDF Tr.78)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Biết bẻ cổ chân vuông góc khi đạp để tạo lực đẩy nước mạnh trong bơi ếch (PDF Tr.79)',
        suggestedPage: 79,
      },
    },
  },
  {
    id: 'k4_tttc_boi_b2',
    grade: 4,
    topicId: 'k4_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b2',
    lessonName: 'Bài 2: Động tác tay kiểu bơi ếch',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 80,
    endPage: 85,
    movements: ['Tập tay ếch trên sân', 'Tập tay ếch tại chỗ/đi trong nước', 'Quạt tay ếch di động'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay khớp vai, cổ tay, khuỷu tay và vươn giãn cơ lưng trên cạn (PDF Tr.80)',
        suggestedPage: 80,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tập động tác tay ếch trên sân & đứng dưới nước', page: 81, desc: 'Tì nước - Quạt nước sang hai bên - Thu khép tay trước ngực - Vươn thẳng tay về trước (PDF Tr.81-82)' },
          { name: 'Tập tay ếch di động có/không điểm tựa', page: 82, desc: 'Phối hợp quạt tay ếch khi di chuyển trong nước giữ nhịp thở đều (PDF Tr.82-83)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập động tác tay ếch theo cặp và nhóm', page: 83, desc: 'Ôn luyện động tác tay ếch trên cạn và dưới nước nông (PDF Tr.83-84)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Không quạt tay quá sâu ra sau đường vai để giữ hiệu quả kéo nước kiểu bơi ếch (PDF Tr.85)',
        suggestedPage: 85,
      },
    },
  },
  {
    id: 'k4_tttc_boi_b3',
    grade: 4,
    topicId: 'k4_tttc_boi',
    topicName: 'THỂ THAO TỰ CHỌN: MÔN BƠI',
    lessonId: 'b3',
    lessonName: 'Bài 3: Động tác phối hợp trong bơi ếch',
    pdfFile: 'SGK-GDTC-4-KNTT_1eb26d75.pdf',
    startPage: 86,
    endPage: 91,
    movements: ['Tay phối hợp với thở', 'Phối hợp chân - tay - thở trong bơi ếch'],
    subFolders: {
      khoiDong: {
        name: 'Thư mục ảnh Khởi động',
        description: 'Xoay các khớp toàn thân và tập nhịp thở phối hợp tay trên cạn (PDF Tr.86)',
        suggestedPage: 86,
      },
      kyThuat: {
        name: 'Thư mục ảnh Kỹ thuật động tác',
        items: [
          { name: 'Tay phối hợp với thở (trên sân, thành bể, tại chỗ/di động)', page: 87, desc: 'Quạt tay ngẩng đầu hít vào bằng miệng, thu tay vươn thẳng cúi mặt thở ra trong nước (PDF Tr.87-88)' },
          { name: 'Phối hợp chân, tay, thở trong bơi ếch', page: 89, desc: 'Quạt tay lấy hơi - thu tay co chân - duỗi tay đạp chân lướt nước nhịp nhàng (PDF Tr.89-90)' },
        ],
      },
      luyenTap: {
        name: 'Thư mục ảnh Luyện tập',
        items: [
          { name: 'Luyện tập phối hợp bơi ếch hoàn chỉnh theo làn', page: 90, desc: 'Tập bơi phối hợp chân - tay - thở cự ly ngắn 10-15m có giám sát an toàn (PDF Tr.90)' },
        ],
      },
      vanDung: {
        name: 'Thư mục ảnh Vận dụng',
        description: 'Vận dụng kĩ thuật bơi ếch để rèn luyện sức khoẻ và phòng tránh đuối nước (PDF Tr.91)',
        suggestedPage: 91,
      },
    },
  },
];

interface LessonPedagogyEnrichment {
  warmupGame: string;
  warmupGamePageOffset?: number;
  warmupGameDesc: string;
  practiceGame: string;
  practiceGamePageOffset?: number;
  practiceGameDesc: string;
  vanDungQuestion: string;
  vanDungAnswerGuide: string;
}

/**
 * Set of legacy fabricated game names that were previously auto-assigned outside the SGK/PPCT curriculum.
 * Used to strip stale auto-generated game rows from previously cached lesson plan drafts.
 */
const FABRICATED_LEGACY_GAME_NAMES = new Set<string>([
  'con lan kheo leo',
  'lan tron tiep suc tren dem',
  'bap benh lung tren dem',
  'thi lon xuoi dung ki thuat',
  'thi lon xuoi dung ky thuat',
  'khoi dong tay nam xa',
  'chinh phuc bac thang cao',
  'bat nhun tiep dat em',
  'vuot rao go tiep suc',
  'chi huy nhanh tri',
  'ghep hang than toc',
  'dam chan theo nhip trong',
  'thi tap hop chi doi nhanh nhat',
  'bien doi doi hinh tiep suc',
  'dieu hanh qua le dai',
  'nghe nhac doan huong',
  'chuyen bong qua dau',
  'chuyen bong hai ben',
  'nhay lo co ket ban',
  'di theo tin hieu',
  'di tiep suc tren vach thang',
  'doan tau noi duoi',
  'vuot cau hep tiep suc',
  'lan bong tiep suc',
  'chuyen bong vong tron',
  'chay doi huong theo bong',
  'duoi bat truot ngang',
  'vo bong theo nhip',
  'dan bong tiep suc tai cho',
  'tung bong qua vach',
  'nem bong vao gio tiep suc',
  'chuyen nuoc qua vong',
  'di bo thi duoi nuoc',
  'ech nhay tren la sen',
  'nhay lo co duoi nuoc',
  'thoi bong tren mat nuoc',
  'tim kho bau day be nong',
  'bong bong ca',
  'doi nao thoi bot deu nhat',
  'sua noi tren mat nuoc',
  'thi tho khong diem ti 10 nhip',
  'buoc qua suoi nho',
  'vuot chuong ngai vat tiep suc',
  'ran uon luon',
  'dua xe zic zac tiep suc',
  'chui qua hang dong',
  'chien si vuot dia hinh',
  'tung bong theo nhac',
  'tung bong vo tay thi tai',
  'doan tau chuyen bong',
  'vua di vua tung bat tiep suc',
  'lan bong luon chan',
  'xoay bong tiep suc so 8',
  'chay nhoi bong bien toc',
  'dan bong luon coc tiep suc',
  'chuyen bong nhanh tay',
  'ai chuyen chuan nhat',
  'dan bong cham dich',
  'thi nem ro ghi diem',
  'te nuoc tao mua',
  'ca heo nho dau tho',
  'quat nuoc day thuyen',
  'dua thuyen tren nuoc',
  'chan vit go nhip',
  'dap chan phao tiep suc',
  'noi sap luot nuoc',
  'boi tu do 15m tiep suc',
  'den tin hieu dan bong',
  'dua dan bong vong cung tiep suc',
  'thap cao chuyen bong',
  'chuyen bong vuot nguoi chan',
  'hai buoc nhay cham bang',
  'thi len ro hai buoc ghi diem',
  'quat chan tung bot',
  'luot nuoc dap chan 15m',
  'coi xay gio quat tay',
  'kep phao boi tay 15m',
  'tho nghieng dau theo nhip tay',
  'tiep suc boi truon sap 25m',
  'chay luon coc tieu',
  'chuyen bong tiep suc',
  'quay nhanh dung huong',
  'nhay vao vong tron',
  'thi dua tiep suc nhe nhang',
  'chay nhe theo hieu lenh',
  'tiep suc dong doi',
  'tro choi van dong tiep suc',
  'tro choi van dong sgk'
]);

export function isFabricatedLegacyGameName(name: string = ''): boolean {
  const norm = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\bky\b/g, 'ki')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!norm) return false;
  return FABRICATED_LEGACY_GAME_NAMES.has(norm);
}

const LESSON_PEDAGOGY_ENRICHMENT: Record<string, LessonPedagogyEnrichment> = {
  // ===== KHỐI 1 (CHỈ GIỮ CÁC TRÒ CHƠI CHÍNH THỨC TRONG SGK, KHÔNG TỰ SÁNG TẠO) =====
  k1_cd1_b1: {
    warmupGame: '',
    warmupGameDesc: '',
    practiceGame: '',
    practiceGameDesc: '',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd1_b2: {
    warmupGame: '',
    warmupGameDesc: '',
    practiceGame: '',
    practiceGameDesc: '',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd1_b3: {
    warmupGame: '',
    warmupGameDesc: '',
    practiceGame: '',
    practiceGameDesc: '',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd1_b4: {
    warmupGame: '',
    warmupGameDesc: '',
    practiceGame: '',
    practiceGameDesc: '',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd2_b1: {
    warmupGame: 'Làm theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Làm theo hiệu lệnh (Trang 28 SGK)',
    practiceGame: 'Thỏ nhường hang',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Thỏ nhường hang (Trang 30 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd2_b2: {
    warmupGame: 'Kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Kết bạn (Trang 32 SGK)',
    practiceGame: 'Lò cò tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi vận động Lò cò tiếp sức (Trang 35 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd2_b3: {
    warmupGame: '',
    warmupGameDesc: '',
    practiceGame: 'Mèo đuổi chuột',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Mèo đuổi chuột (Trang 39 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k1_cd3_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_cd3_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_cd3_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_cd3_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_cd3_b5: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_br_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_br_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_br_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_br_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_boi_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_boi_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_boi_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_boi_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k1_tttc_boi_b5: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },

  // ===== KHỐI 3 (CHỈ GIỮ CÁC TRÒ CHƠI CHÍNH THỨC TRONG SGK, KHÔNG TỰ SÁNG TẠO) =====
  k3_cd1_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd1_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd1_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd1_b4: {
    warmupGame: 'Đứng ngồi theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Đứng ngồi theo hiệu lệnh (Trang 27 SGK)',
    practiceGame: 'Chạy theo hình tam giác',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Chạy theo hình tam giác (Trang 29 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd2_b1: {
    warmupGame: 'Chui qua hầm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Chui qua hầm (SGK GDTC 3)',
    practiceGame: 'Đua ô tô',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Đua ô tô (SGK GDTC 3)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd2_b2: {
    warmupGame: 'Chim về tổ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Chim về tổ (Trang 35 SGK)',
    practiceGame: 'Đua ô tô',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi vận động Đua ô tô (SGK GDTC 3)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd2_b3: {
    warmupGame: 'Mèo đuổi chuột',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Mèo đuổi chuột (Trang 40 SGK)',
    practiceGame: 'Nhanh lên bạn ơi',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Nhanh lên bạn ơi (Trang 42 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd3_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd3_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd3_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd3_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_cd3_b5: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_br_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_br_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_br_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_br_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_boi_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_boi_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_boi_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k3_tttc_boi_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },

  // ===== KHỐI 5 (CHỈ GIỮ CÁC TRÒ CHƠI CHÍNH THỨC TRONG SGK, KHÔNG TỰ SÁNG TẠO) =====
  k5_cd1_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd1_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd1_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd2_b1: {
    warmupGame: 'Ai nhanh hơn với gậy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Ai nhanh hơn với gậy (Trang 25 SGK)',
    practiceGame: 'Chuyền gậy tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi vận động Chuyền gậy tiếp sức (Trang 28 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k5_cd2_b2: {
    warmupGame: 'Ai kéo khoẻ hơn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Ai kéo khoẻ hơn (Trang 30 SGK)',
    practiceGame: 'Trao gậy tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Trao gậy tiếp sức (Trang 32 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k5_cd2_b3: {
    warmupGame: 'Người thừa thứ hai',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Người thừa thứ hai (Trang 34 SGK)',
    practiceGame: 'Đội nào nhanh nhất',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Đội nào nhanh nhất (Trang 36 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k5_cd3_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd3_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd3_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_cd3_b4: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_br_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_br_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_br_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_boi_b1: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_boi_b2: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },
  k5_tttc_boi_b3: { warmupGame: '', warmupGameDesc: '', practiceGame: '', practiceGameDesc: '', vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.', vanDungAnswerGuide: '' },

  // ===== KHỐI 2 =====
  k2_cd1_b1: {
    warmupGame: 'Làm theo hiệu lệnh',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Làm theo hiệu lệnh rèn phản xạ nghe và thực hiện khẩu lệnh nhanh (PDF Tr.10)',
    practiceGame: 'Lò cò tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Lò cò tiếp sức theo hàng dọc phát triển sức bật và tinh thần đồng đội (PDF Tr.12)',
    vanDungQuestion: 'Em hãy chọn hình chuyển đội hình hàng dọc thành đội hình vòng tròn và thực hiện khi chơi trò chơi tập thể.',
    vanDungAnswerGuide: 'Từ hàng dọc đi thường theo chiều ngược kim đồng hồ tạo thành vòng tròn, quay mặt vào tâm.'
  },
  k2_cd1_b2: {
    warmupGame: 'Kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Kết bạn tạo không khí vui tươi và chuẩn bị ghép đội hình vòng tròn (PDF Tr.14)',
    practiceGame: 'Bịt mắt bắt dê',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Bịt mắt bắt dê rèn thính giác, sự khéo léo trong đội hình vòng tròn (PDF Tr.17)',
    vanDungQuestion: 'Em hãy chọn hình chuyển đội hình vòng tròn thành hàng ngang và vận dụng khi đồng diễn thể dục.',
    vanDungAnswerGuide: 'Từ vòng tròn lần lượt di chuyển giãn đều thành hàng ngang ngay ngắn trước khi bắt đầu đồng diễn.'
  },
  k2_cd1_b3: {
    warmupGame: 'Nhóm ba, nhóm bảy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Nhóm ba, nhóm bảy rèn phản xạ nhanh nhẹn và ghép nhóm theo số (PDF Tr.19)',
    practiceGame: 'Chạy đổi chỗ, vỗ tay nhau',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Chạy đổi chỗ, vỗ tay nhau giúp nâng cao sự nhanh nhẹn và phối hợp đồng đội (PDF Tr.21)',
    vanDungQuestion: 'Em hãy chọn hình đúng giậm chân tại chỗ, đứng lại và tự hô thực hiện động tác.',
    vanDungAnswerGuide: 'Hô "Giậm chân – Giậm!" (nhịp 1 chân trái, nhịp 2 chân phải); "Đứng lại – Đứng!" rơi vào chân phải rồi thu chân về tư thế nghiêm.'
  },
  k2_cd2_b1: {
    warmupGame: 'Đèn xanh đèn đỏ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Đèn xanh đèn đỏ rèn phản xạ quan sát hiệu lệnh và làm nóng cơ thể (PDF Tr.23)',
    practiceGame: 'Ném trúng đích',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Ném trúng đích rèn lực tay, khả năng ngắm hướng chính xác (PDF Tr.25)',
    vanDungQuestion: 'Em hãy chọn hình nhịp 3 động tác vươn thở, nhịp 1 động tác tay và tập thể dục giờ ra chơi.',
    vanDungAnswerGuide: 'Nhịp 3 vươn thở hai tay đưa cao chữ V hít sâu; nhịp 1 động tác tay đưa hai tay sang ngang lòng bàn tay sấp.'
  },
  k2_cd2_b2: {
    warmupGame: 'Tàu hoả chạy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Tàu hoả chạy khởi động khớp vai, tay và nhịp bước đồng đều (PDF Tr.27)',
    practiceGame: 'Chèo thuyền',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Chèo thuyền rèn sức mạnh cơ bụng, lưng và sự phối hợp đồng bộ theo tổ (PDF Tr.30)',
    vanDungQuestion: 'Em hãy nhận biết nhịp động tác chân, nhịp 2 lườn, nhịp 3 bụng và tập lúc giải lao câu lạc bộ.',
    vanDungAnswerGuide: 'Đứng đúng tư thế kiễng gót/khuỵu gối ở động tác chân, nghiêng lườn hết biên độ nhịp 2 và giữ thẳng gối ở động tác bụng.'
  },
  k2_cd2_b3: {
    warmupGame: 'Lái ô tô',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Lái ô tô tạo hứng thú và rèn phản xạ di chuyển đổi hướng (PDF Tr.32)',
    practiceGame: 'Mèo đuổi chuột',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Mèo đuổi chuột phát triển tốc độ chạy và sự khéo léo trong vòng tròn (PDF Tr.35)',
    vanDungQuestion: 'Em hãy chọn hình nhịp 1 phối hợp, nhịp 2 nhảy, nhịp 3 điều hoà và tập để tránh mệt mỏi khi học.',
    vanDungAnswerGuide: 'Thực hiện đúng biên độ nhịp phối hợp, bật tách chân nhịp nhàng và lắc thả lỏng tay chân hít thở sâu.'
  },
  k2_cd3_b1: {
    warmupGame: 'Đứng ngồi theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Đứng ngồi theo hiệu lệnh rèn sự tập trung và phản xạ nhanh (PDF Tr.37)',
    practiceGame: 'Nhảy đúng, nhảy nhanh',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Nhảy đúng, nhảy nhanh rèn sức bật cổ chân và giữ thăng bằng (PDF Tr.40)',
    vanDungQuestion: 'Em hãy chọn hình đi thường hai tay phối hợp tự nhiên và tập chống tê chân khi ngồi học bài.',
    vanDungAnswerGuide: 'Đứng dậy đi thường hoặc kiễng gót theo vạch thẳng giúp lưu thông máu, giảm tê mỏi chân.'
  },
  k2_cd3_b2: {
    warmupGame: 'Tìm tên theo chủ đề',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Tìm tên theo chủ đề giúp khởi động tinh thần hứng khởi (PDF Tr.41)',
    practiceGame: 'Bỏ khăn',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Bỏ khăn rèn phản xạ quan sát và tốc độ chạy vòng tròn (PDF Tr.45)',
    vanDungQuestion: 'Em hãy nhận biết tư thế đi vòng trái, vòng phải và vận dụng tránh vũng nước trên sân trường.',
    vanDungAnswerGuide: 'Điều chỉnh hướng bàn chân và thân người vòng khéo léo sang trái hoặc phải quanh chướng ngại vật.'
  },
  k2_cd3_b3: {
    warmupGame: 'Kéo cưa, lừa xẻ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Kéo cưa, lừa xẻ khởi động nhịp nhàng cơ tay, lưng và gối theo cặp (PDF Tr.47)',
    practiceGame: 'Con cóc là cậu ông Trời',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Con cóc là cậu ông Trời rèn sức bật đôi chân và phản xạ nhanh (PDF Tr.50)',
    vanDungQuestion: 'Em hãy chọn hình đi nhanh dần, đi nhanh chuyển sang chạy và tập luyện tăng cường sức khoẻ.',
    vanDungAnswerGuide: 'Tăng dần tần số bước đi rồi chuyển nhịp tự nhiên sang chạy trên nửa trước bàn chân.'
  },
  k2_cd3_b4: {
    warmupGame: 'Kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Kết bạn tạo không khí vui tươi trước bài tập di chuyển đổi hướng (PDF Tr.52)',
    practiceGame: 'Di chuyển tiếp sức',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Di chuyển tiếp sức rèn tốc độ chạy vòng trái, vòng phải theo tổ (PDF Tr.56)',
    vanDungQuestion: 'Em hãy đếm số lần rẽ phải, rẽ trái theo hình mũi tên và vận dụng tránh vũng nước trên đường.',
    vanDungAnswerGuide: 'Quan sát hướng mũi tên rẽ trái/rẽ phải rõ ràng, chủ động chuyển hướng mềm mại không mất đà.'
  },
  k2_cd3_b5: {
    warmupGame: 'Mèo và chim sẻ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Mèo và chim sẻ làm nóng cơ chân và phản xạ nhanh nhẹn (PDF Tr.57)',
    practiceGame: 'Vượt hố tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Vượt hố tiếp sức phát triển sức bật và tinh thần thi đua tập thể (PDF Tr.60)',
    vanDungQuestion: 'Em hãy phân biệt tư thế quỳ thấp, quỳ cao, ngồi bệt thẳng chân và vận dụng khi khởi động.',
    vanDungAnswerGuide: 'Quỳ cao đùi thẳng vuông góc mặt sàn; quỳ thấp mông chạm gót; ngồi bệt duỗi thẳng hai chân.'
  },
  k2_cd3_b6: {
    warmupGame: 'Ếch nhảy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Ếch nhảy khởi động khớp gối và cổ chân trước bài phối hợp quỳ, ngồi (PDF Tr.61)',
    practiceGame: 'Tung vòng vào đích',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Tung vòng vào đích rèn sự khéo léo, chính xác và phối hợp tay mắt (PDF Tr.64)',
    vanDungQuestion: 'Em hãy nhận biết các nhịp của Bài tập 1 và tập phối hợp quỳ, ngồi hằng ngày khi mệt mỏi.',
    vanDungAnswerGuide: 'Tập bài phối hợp quỳ cao - quỳ thấp và ngồi xổm - kiễng gót giúp giãn cơ lưng, chân hiệu quả.'
  },
  k2_tttc_br_b1: {
    warmupGame: 'Anh em đoàn kết',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Anh em đoàn kết rèn sự gắn kết và khởi động bước di chuyển (PDF Tr.67)',
    practiceGame: 'Nhảy ôm bóng tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Nhảy ôm bóng tiếp sức rèn bật nhảy hai chân và giữ bóng chắc chắn (PDF Tr.69)',
    vanDungQuestion: 'Em hãy quan sát hình và vận dụng động tác nhảy dừng đúng kỹ thuật khi chơi bóng rổ.',
    vanDungAnswerGuide: 'Tiếp đất đồng thời hai chân khuỵu gối hạ thấp trọng tâm để dừng vững không bị chạy bước.'
  },
  k2_tttc_br_b2: {
    warmupGame: 'Phản xạ nhanh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Phản xạ nhanh khởi động sự linh hoạt của bàn tay và bước chân (PDF Tr.71)',
    practiceGame: 'Dẫn bóng tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Dẫn bóng tiếp sức rèn kĩ thuật dẫn bóng cao tay di chuyển nhanh dần (PDF Tr.73)',
    vanDungQuestion: 'Em hãy chọn tư thế bàn tay dẫn bóng đúng trong bóng rổ.',
    vanDungAnswerGuide: 'Xòe rộng các ngón tay tiếp xúc bóng, dùng lực cổ tay và cẳng tay ấn bóng nảy đều, không dùng lòng bàn tay vỗ bóng.'
  },
  k2_tttc_br_b3: {
    warmupGame: 'Biểu tượng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Biểu tượng tạo hứng khởi trước khi tập tung bắt bóng hai tay (PDF Tr.75)',
    practiceGame: 'Lăn bóng bằng tay',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Lăn bóng bằng tay rèn độ khéo léo cổ tay, ngón tay khi điều khiển bóng (PDF Tr.77)',
    vanDungQuestion: 'Em hãy nhận biết tư thế chuẩn bị tung và bắt bóng bằng hai tay.',
    vanDungAnswerGuide: 'Chân đứng rộng bằng vai gối hơi khuỵu, hai tay mở rộng hình phễu trước ngực đón bóng êm.'
  },
  k2_tttc_br_b4: {
    warmupGame: 'Diệt con vật có hại',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Diệt con vật có hại làm nóng cơ chân và tay nhanh nhẹn (PDF Tr.79)',
    practiceGame: 'Chuyển nhanh, nhảy nhanh',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Chuyển nhanh, nhảy nhanh phối hợp chuyền bóng và bật nhảy ném rổ (PDF Tr.81)',
    vanDungQuestion: 'Em hãy thực hiện động tác ném rổ hai tay trước ngực ở cự li gần khi vui chơi.',
    vanDungAnswerGuide: 'Đứng chân rộng bằng vai, khuỵu gối rồi duỗi thẳng đẩy bóng vòng cung từ ngực hướng lên bảng rổ.'
  },
  k2_tttc_boi_b1: {
    warmupGame: 'Di chuyển theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Di chuyển theo hiệu lệnh khởi động trên cạn trước khi xuống nước (PDF Tr.83)',
    practiceGame: 'Tìm nhà vô địch',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Tìm nhà vô địch thi đua thực hiện ôm gối nổi nước giữ thăng bằng lâu nhất (PDF Tr.85)',
    vanDungQuestion: 'Khi thực hiện ôm gối nổi người trong nước, em cần giữ nhịp thở và tư thế như thế nào?',
    vanDungAnswerGuide: 'Hít sâu bằng miệng trên mặt nước, nín thở cúi mặt xuống nước và ôm gọn hai gối sát ngực thả lỏng.'
  },
  k2_tttc_boi_b2: {
    warmupGame: 'Tín hiệu đèn giao thông',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Tín hiệu đèn giao thông rèn phản xạ nhanh trên cạn (PDF Tr.86)',
    practiceGame: 'Con sứa',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Con sứa giúp làm quen lực đẩy nổi của nước khi duỗi thẳng thân (PDF Tr.88)',
    vanDungQuestion: 'Vì sao khi nổi người duỗi thẳng chân tay em cần thả lỏng cổ và giữ thân phẳng?',
    vanDungAnswerGuide: 'Giữ thân người phẳng và thả lỏng giúp lực đẩy của nước nâng cơ thể nổi cân bằng ngang mặt nước.'
  },
  k2_tttc_boi_b3: {
    warmupGame: 'Chim bay, cò bay',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Chim bay, cò bay rèn tập trung và làm nóng trên cạn (PDF Tr.89)',
    practiceGame: 'Tên lửa',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Tên lửa thi đạp thành bể lướt nước thẳng và xa nhất (PDF Tr.91)',
    vanDungQuestion: 'Để đạp thành bể lướt nước đi xa nhất, hai tay và hai chân em đặt ở tư thế nào?',
    vanDungAnswerGuide: 'Hai tay duỗi thẳng kẹp sát mang tai, bàn chân đạp mạnh thành bể rồi duỗi thẳng khép hai chân.'
  },
  k2_tttc_boi_b4: {
    warmupGame: 'Ếch nhảy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Ếch nhảy khởi động lực bật của hai chân trên cạn (PDF Tr.92)',
    practiceGame: 'Cướp cờ',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Cướp cờ dưới nước nông phát triển tốc độ lướt nước và phản xạ (PDF Tr.94)',
    vanDungQuestion: 'Khi đạp đáy bể lướt nước ở vùng nước nông, em cần phối hợp thở và đứng lại ra sao?',
    vanDungAnswerGuide: 'Hít sâu trước khi cúi mặt đạp đáy bể lướt nước; khi muốn dừng thì co gối đưa hai chân chạm đáy bể.'
  },

  // ===== KHỐI 4 =====
  k4_cd1_b1: {
    warmupGame: 'Gió thổi',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Gió thổi rèn phản xạ nhanh nhẹn và khả năng tập trung theo hiệu lệnh (PDF Tr.11)',
    practiceGame: 'Chạy tiếp sức theo vòng tròn',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Chạy tiếp sức theo vòng tròn phát triển tốc độ và tinh thần đồng đội (PDF Tr.14)',
    vanDungQuestion: 'Khi nghe khẩu lệnh "Vòng bên phải – Bước!", em xác định động lệnh rơi vào chân nào và chọn hình một hàng dọc đi đều vòng phải đúng?',
    vanDungAnswerGuide: 'Động lệnh "Bước!" rơi vào chân phải, bước thêm một bước chân trái rồi xoay mũi chân phải chuyển hướng 90 độ sang phải.'
  },
  k4_cd1_b2: {
    warmupGame: 'Số chẵn, số lẻ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Số chẵn, số lẻ rèn phản xạ lắng nghe và phối hợp di chuyển (PDF Tr.15)',
    practiceGame: 'Vượt rào tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Vượt rào tiếp sức rèn sức bật, sự khéo léo và tinh thần thi đua (PDF Tr.18)',
    vanDungQuestion: 'Khi nhiều hàng dọc đi đều vòng bên trái, hàng nào làm chuẩn và bước chân của các hàng khác điều chỉnh ra sao?',
    vanDungAnswerGuide: 'Hàng ngoài cùng bên trái làm chuẩn bước ngắn tại chỗ hoặc bước nhỏ; các hàng bên phải mở rộng bước giữ thẳng hàng ngang.'
  },
  k4_cd1_b3: {
    warmupGame: 'Sáng – Tối',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Sáng – Tối rèn sự tập trung chú ý và phản xạ đổi tư thế nhanh (PDF Tr.19)',
    practiceGame: 'Đội nào nhanh hơn',
    practiceGamePageOffset: 5,
    practiceGameDesc: 'Trò chơi Đội nào nhanh hơn thi đua đi đều vòng sau giữ đội hình thẳng hàng (PDF Tr.24)',
    vanDungQuestion: 'Khi nghe khẩu lệnh "Bên trái, vòng sau – Bước!", em thực hiện động tác chuyển hướng và giữ hàng chuẩn bên phải thế nào?',
    vanDungAnswerGuide: 'Động lệnh rơi vào chân trái, bước thêm chân phải làm trục quay 180 độ về bên trái đi ngược lại; khi vòng sau bên phải lấy hàng bên phải làm chuẩn.'
  },
  k4_cd2_b1: {
    warmupGame: 'Làm theo hiệu lệnh',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Làm theo hiệu lệnh khởi động phản xạ cầm vòng và nghe khẩu lệnh (PDF Tr.27)',
    practiceGame: 'Nhảy lướt sóng',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Nhảy lướt sóng với vòng rèn sức bật cổ chân và phối hợp nhịp đồng đội (PDF Tr.29)',
    vanDungQuestion: 'Em hãy nhận diện nhịp 3 động tác tay với vòng, nhịp 5 chân với vòng và tập luyện vào buổi sáng.',
    vanDungAnswerGuide: 'Nắm đúng biên độ đưa vòng ngang ngực, lên cao qua đầu ở động tác tay và giữ lưng thẳng khi khuỵu gối ở động tác chân.'
  },
  k4_cd2_b2: {
    warmupGame: 'Quân xanh quân đỏ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Quân xanh quân đỏ rèn tốc độ phản ứng theo hiệu lệnh thi đấu (PDF Tr.31)',
    practiceGame: 'Chạy đổi vòng',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Chạy đổi vòng phát triển sức nhanh, sự khéo léo và quan sát (PDF Tr.34)',
    vanDungQuestion: 'Em hãy chọn hình đúng nhịp 3 động tác toàn thân với vòng, nhận diện động tác và tập giờ ra chơi.',
    vanDungAnswerGuide: 'Nhịp 3 động tác toàn thân bước chân gập thân vặn người đưa vòng sang ngang đúng hướng, giữ thẳng chân sau.'
  },
  k4_cd2_b3: {
    warmupGame: 'Nghe số chạy đổi chỗ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Nghe số chạy đổi chỗ rèn thính giác và sự linh hoạt di chuyển (PDF Tr.35)',
    practiceGame: 'Chuyền vòng tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Chuyền vòng tiếp sức rèn tốc độ chuyền nhận vòng và phối hợp tổ nhóm (PDF Tr.37)',
    vanDungQuestion: 'Em hãy chọn hình đúng nhịp 1 động tác điều hoà với vòng và vận dụng tập trong giờ ngoại khoá.',
    vanDungAnswerGuide: 'Nhịp 1 động tác điều hoà hạ vòng nhẹ nhàng, thả lỏng tay chân kết hợp hít thở sâu giúp cơ thể hồi phục.'
  },
  k4_cd3_b1: {
    warmupGame: 'Chạy đổi chỗ, bắt khăn',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Chạy đổi chỗ, bắt khăn khởi động phản xạ và thăng bằng di chuyển (PDF Tr.40)',
    practiceGame: 'Di chuyển giữ thăng bằng tiếp sức',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Di chuyển giữ thăng bằng tiếp sức rèn thăng bằng tĩnh và động chính xác (PDF Tr.43)',
    vanDungQuestion: 'Em hãy nhận diện động tác giữ thăng bằng đứng kiễng gót một chân và vận dụng tập luyện hằng ngày.',
    vanDungAnswerGuide: 'Giữ thân thẳng, mắt nhìn điểm cố định phía trước, hai tay dang ngang giữ thăng bằng vững trên nửa trước bàn chân.'
  },
  k4_cd3_b2: {
    warmupGame: 'Đếm sao',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Đếm sao khởi động xoay khớp và vận động bật nhún nhẹ nhàng (PDF Tr.44)',
    practiceGame: 'Bật nhảy xoay người tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Bật nhảy xoay người tiếp sức rèn sức bật chân và định hướng thăng bằng (PDF Tr.47)',
    vanDungQuestion: 'Em hãy chọn hình bật xa đúng, nhận diện giậm nhảy bằng một chân và vận dụng bật xa vượt chướng ngại vật nhỏ.',
    vanDungAnswerGuide: 'Đánh tay mạnh ra sau rồi vung lên trước khi giậm nhảy; tiếp đất đồng thời bằng hai bàn chân chùng gối giảm chấn động.'
  },
  k4_cd3_b3: {
    warmupGame: 'Thoát hiểm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Thoát hiểm khởi động sức nhanh phản xạ và bước bật nhảy linh hoạt (PDF Tr.49)',
    practiceGame: 'Bật nhảy theo cặp tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Bật nhảy theo cặp tiếp sức rèn phối hợp nhịp nhàng và sức mạnh đôi chân (PDF Tr.51)',
    vanDungQuestion: 'Vì sao khi tiếp đất sau động tác bật cao em cần chùng gối và hạ tay?',
    vanDungAnswerGuide: 'Chùng gối và hạ tay khi tiếp đất giúp giảm lực dội lên khớp gối, cột sống và giữ thăng bằng vững vàng.'
  },
  k4_cd3_b4: {
    warmupGame: 'Đi vòng tròn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Đi vòng tròn làm nóng khớp cổ chân và phối hợp nhịp di chuyển (PDF Tr.53)',
    practiceGame: 'Nhảy dây tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Nhảy dây tiếp sức phát triển sức bền, sự khéo léo và tinh thần đồng đội (PDF Tr.56)',
    vanDungQuestion: 'Em hãy phân biệt nhảy dây chụm chân với nhảy dây qua từng chân và nhận diện tư thế so dây, chao dây.',
    vanDungAnswerGuide: 'So dây đặt hai chân giữa dây kéo tay cầm ngang ngực; nhảy chụm chân bật cả hai chân cùng lúc, nhảy từng chân bước luân phiên.'
  },
  k4_tttc_br_b1: {
    warmupGame: 'Chuyền bóng phải, trái',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Chuyền bóng phải, trái khởi động độ linh hoạt cổ tay và phản xạ chuyền bóng (PDF Tr.59)',
    practiceGame: 'Ôm bóng chạy qua vật cản tiếp sức',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Ôm bóng chạy qua vật cản tiếp sức rèn tốc độ di chuyển và giữ bóng chắc (PDF Tr.62)',
    vanDungQuestion: 'Khi thực hiện chuyển bóng vòng quanh thân và hình số 8 qua hai chân, em cần điều khiển bóng bằng bộ phận nào của bàn tay?',
    vanDungAnswerGuide: 'Dùng các đầu ngón tay tiếp xúc và đẩy chuyển bóng linh hoạt, mắt nhìn thẳng tránh nhìn xuống bóng.'
  },
  k4_tttc_br_b2: {
    warmupGame: 'Chuyền bóng qua hầm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Chuyền bóng qua hầm khởi động thân mình và tinh thần phối hợp nhóm (PDF Tr.63)',
    practiceGame: 'Dẫn bóng qua vật cản tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Dẫn bóng qua vật cản tiếp sức rèn kĩ thuật dẫn bóng đổi hướng tốc độ cao (PDF Tr.66)',
    vanDungQuestion: 'Khi dẫn bóng vượt chướng ngại vật đổi hướng, em dùng tay nào dẫn bóng để che chắn bóng an toàn?',
    vanDungAnswerGuide: 'Dùng tay ở phía xa chướng ngại vật dẫn bóng, hạ thấp trọng tâm và đưa vai, tay còn lại che chắn bóng.'
  },
  k4_tttc_br_b3: {
    warmupGame: 'Tung – bắt bóng nhanh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Tung – bắt bóng nhanh rèn phản xạ mắt tay và cảm giác bắt bóng (PDF Tr.67)',
    practiceGame: 'Bóng chuyền 6',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Bóng chuyền 6 rèn khả năng chuyền - bắt bóng đồng đội di chuyển liên tục (PDF Tr.69)',
    vanDungQuestion: 'Khi chuyền bóng bật đất bằng hai tay trước ngực, điểm bóng chạm sàn nên cách bạn nhận bóng khoảng bao xa?',
    vanDungAnswerGuide: 'Bóng chạm sàn ở khoảng 2/3 quãng đường từ người chuyền đến người nhận để bóng nảy lên đúng tầm ngực bạn.'
  },
  k4_tttc_br_b4: {
    warmupGame: 'Lăn bóng qua lại',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Lăn bóng qua lại làm nóng cổ tay và cảm giác điều khiển bóng rổ (PDF Tr.70)',
    practiceGame: 'Dẫn bóng ném rổ tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Dẫn bóng ném rổ tiếp sức phối hợp dẫn bóng nhanh và ném rổ một tay trên vai (PDF Tr.72)',
    vanDungQuestion: 'Khi ném rổ bằng một tay trên vai, động tác duỗi tay và vẩy cổ tay diễn ra như thế nào?',
    vanDungAnswerGuide: 'Đạp thẳng chân kết hợp duỗi khuỷu tay chếch lên cao và gập vẩy mềm cổ tay xuống dưới giúp bóng đi vòng cung vào rổ.'
  },
  k4_tttc_boi_b1: {
    warmupGame: 'Chuyển phao phải, trái',
    warmupGamePageOffset: 1,
    warmupGameDesc: 'Trò chơi Chuyển phao phải, trái khởi động thân trên và phản xạ phối hợp nhóm trên cạn (PDF Tr.74)',
    practiceGame: 'Chuyển hàng mùa lũ',
    practiceGamePageOffset: 5,
    practiceGameDesc: 'Trò chơi Chuyển hàng mùa lũ thi đua đạp chân ếch với phao di chuyển nhanh dưới nước (PDF Tr.78)',
    vanDungQuestion: 'Trong động tác chân kiểu bơi ếch, nhịp nào tạo ra lực đẩy tiến về trước mạnh nhất?',
    vanDungAnswerGuide: 'Nhịp bẻ mũi bàn chân hướng ra ngoài rồi đạp mạnh kết hợp khép hai chân duỗi thẳng lướt nước tạo lực đẩy chính.'
  },
  k4_tttc_boi_b2: {
    warmupGame: 'Ai là vua',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Ai là vua khởi động sức nhanh và hứng thú tập luyện trên cạn (PDF Tr.80)',
    practiceGame: 'Đua thuyền rồng',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Trò chơi Đua thuyền rồng thi quạt tay ếch và giữ nhịp phối hợp đồng đội dưới nước (PDF Tr.84)',
    vanDungQuestion: 'Khi thực hiện động tác tay kiểu bơi ếch, hai bàn tay quạt nước theo hướng và biên độ như thế nào?',
    vanDungAnswerGuide: 'Hai bàn tay mở chếch tì nước, quạt vòng sang hai bên không quá đường vai rồi thu khép nhanh trước ngực và vươn thẳng về trước.'
  },
  k4_tttc_boi_b3: {
    warmupGame: 'Pháo nổ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Pháo nổ khởi động hơi thở và phối hợp bật nhảy trên cạn (PDF Tr.86)',
    practiceGame: 'Di chuyển tiếp sức bằng phao',
    practiceGamePageOffset: 5,
    practiceGameDesc: 'Trò chơi Di chuyển tiếp sức bằng phao hoàn thiện phối hợp chân - tay - thở bơi ếch (PDF Tr.91)',
    vanDungQuestion: 'Trình tự phối hợp nhịp nhàng giữa tay, thở và chân trong kiểu bơi ếch diễn ra như thế nào?',
    vanDungAnswerGuide: 'Quạt tay mở ngực đồng thời ngẩng đầu hít vào, thu tay duỗi thẳng về trước kết hợp cúi mặt thở ra và đạp khép chân lướt nước.'
  }
};

export const sgkCurriculumTree: SgkLessonFolder[] = RAW_SGK_CURRICULUM_TREE.map((raw) => {
  const enrich = LESSON_PEDAGOGY_ENRICHMENT[raw.id];
  const kdPage = raw.subFolders.khoiDong.suggestedPage || raw.startPage;
  const ltPage = raw.subFolders.luyenTap.items[0]?.page || Math.min(raw.endPage, raw.startPage + 2);
  const vdPage = raw.subFolders.vanDung.suggestedPage || raw.endPage;
  const tckdPage = Math.min(raw.endPage, raw.startPage + (enrich?.warmupGamePageOffset ?? 0));
  const tcPage = Math.min(raw.endPage, raw.startPage + (enrich?.practiceGamePageOffset ?? Math.max(1, raw.endPage - raw.startPage - 1)));

  const warmupGameName = (enrich?.warmupGame || '').trim();
  const practiceGameName = (enrich?.practiceGame || '').trim();

  return {
    ...raw,
    subFolders: {
      khoiDong: {
        ...raw.subFolders.khoiDong,
        items: raw.subFolders.khoiDong.items || [
          {
            name: 'Xoay khớp & Khởi động chung',
            page: kdPage,
            desc: raw.subFolders.khoiDong.description
          }
        ]
      },
      troChoiKhoiDong: {
        name: raw.subFolders.troChoiKhoiDong?.name || 'Thư mục Trò chơi khởi động',
        description: warmupGameName
          ? enrich?.warmupGameDesc || `Trò chơi bổ trợ khởi động "${warmupGameName}" (Trang ${tckdPage} SGK)`
          : 'Không có trò chơi khởi động riêng trong SGK (chỉ thêm khi GV chủ động nhập)',
        suggestedPage: tckdPage,
        items: raw.subFolders.troChoiKhoiDong?.items?.length
          ? raw.subFolders.troChoiKhoiDong.items.map((it) => ({
              ...it,
              gameName: it.gameName || warmupGameName
            }))
          : warmupGameName
          ? [
              {
                name: `Trò chơi khởi động: ${warmupGameName}`,
                gameName: warmupGameName,
                page: tckdPage,
                desc: enrich?.warmupGameDesc || raw.subFolders.khoiDong.description
              }
            ]
          : []
      },
      kyThuat: raw.subFolders.kyThuat,
      luyenTap: raw.subFolders.luyenTap,
      troChoi: {
        name: raw.subFolders.troChoi?.name || 'Thư mục Trò chơi vận động',
        description: practiceGameName
          ? enrich?.practiceGameDesc || `Trò chơi vận động "${practiceGameName}" (Trang ${tcPage} SGK)`
          : 'Không có trò chơi vận động riêng trong SGK (chỉ thêm khi GV chủ động nhập)',
        suggestedPage: tcPage,
        items: raw.subFolders.troChoi?.items?.length
          ? raw.subFolders.troChoi.items.map((it) => ({
              ...it,
              gameName: it.gameName || practiceGameName
            }))
          : practiceGameName
          ? [
              {
                name: `Trò chơi vận động: ${practiceGameName}`,
                gameName: practiceGameName,
                page: tcPage,
                desc: enrich?.practiceGameDesc || `Trò chơi vận động "${practiceGameName}"`
              }
            ]
          : []
      },
      vanDung: {
        ...raw.subFolders.vanDung,
        question: 'Câu hỏi vận dụng sách giáo khoa.',
        answerGuide: '',
        items: raw.subFolders.vanDung.items || [
          {
            name: `Hình ảnh vận dụng (Trang ${vdPage} SGK)`,
            page: vdPage,
            desc: raw.subFolders.vanDung.description
          }
        ]
      }
    }
  };
});

export interface SgkTreeLessonOverride {
  lessonName?: string;
  warmupGameName?: string;
  warmupGamePage?: number;
  warmupGameDesc?: string;
  practiceGameName?: string;
  practiceGamePage?: number;
  practiceGameDesc?: string;
  kyThuatItemNames?: Record<number, string>;
  vanDungQuestion?: string;
  vanDungAnswerGuide?: string;
  vanDungPage?: number;
  khoiDongPage?: number;
  khoiDongDesc?: string;
}

const SGK_TREE_OVERRIDES_STORAGE_KEY = 'gdtc_sgk_tree_overrides_v1';
export const SGK_TREE_OVERRIDES_EVENT = 'gdtc:sgk-tree-overrides-updated';

function emitSgkTreeOverridesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SGK_TREE_OVERRIDES_EVENT));
  }
}

export function getSgkTreeOverrides(): Record<string, SgkTreeLessonOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SGK_TREE_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasSgkTreeLessonOverride(lessonId: string): boolean {
  const overrides = getSgkTreeOverrides();
  const ov = overrides[lessonId];
  return Boolean(ov && Object.keys(ov).length > 0);
}

export function saveSgkTreeLessonOverride(
  lessonId: string,
  patch: SgkTreeLessonOverride
): Record<string, SgkTreeLessonOverride> {
  const current = getSgkTreeOverrides();
  const existing = current[lessonId] || {};
  const mergedKyThuatNames = patch.kyThuatItemNames
    ? { ...(existing.kyThuatItemNames || {}), ...patch.kyThuatItemNames }
    : existing.kyThuatItemNames;

  const next: Record<string, SgkTreeLessonOverride> = {
    ...current,
    [lessonId]: {
      ...existing,
      ...patch,
      ...(mergedKyThuatNames ? { kyThuatItemNames: mergedKyThuatNames } : {})
    }
  };
  try {
    localStorage.setItem(SGK_TREE_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
  emitSgkTreeOverridesUpdated();
  return next;
}

export function resetSgkTreeLessonOverride(lessonId: string): Record<string, SgkTreeLessonOverride> {
  const current = getSgkTreeOverrides();
  const next = { ...current };
  delete next[lessonId];
  try {
    localStorage.setItem(SGK_TREE_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  emitSgkTreeOverridesUpdated();
  return next;
}

export function getEffectiveSgkCurriculumTree(): SgkLessonFolder[] {
  const overrides = getSgkTreeOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return sgkCurriculumTree;

  return sgkCurriculumTree.map((folder) => {
    const ov = overrides[folder.id];
    if (!ov) return folder;

    const nextLessonName = ov.lessonName?.trim() || folder.lessonName;
    const nextKdPage = ov.khoiDongPage ?? folder.subFolders.khoiDong.suggestedPage;
    const nextKdDesc = ov.khoiDongDesc ?? folder.subFolders.khoiDong.description;

    const hasCustomWarmup = Boolean(ov.warmupGameName && ov.warmupGameName.trim());
    const nextTckdName = hasCustomWarmup
      ? ov.warmupGameName!.trim()
      : folder.subFolders.troChoiKhoiDong.items[0]?.gameName || '';
    const nextTckdPage = ov.warmupGamePage ?? folder.subFolders.troChoiKhoiDong.suggestedPage;
    const nextTckdDesc =
      ov.warmupGameDesc ??
      (hasCustomWarmup
        ? `Trò chơi bổ trợ khởi động "${nextTckdName}" (Trang ${nextTckdPage} SGK)`
        : folder.subFolders.troChoiKhoiDong.description);

    const hasCustomPractice = Boolean(ov.practiceGameName && ov.practiceGameName.trim());
    const nextTcName = hasCustomPractice
      ? ov.practiceGameName!.trim()
      : folder.subFolders.troChoi.items[0]?.gameName || '';
    const nextTcPage = ov.practiceGamePage ?? folder.subFolders.troChoi.suggestedPage;
    const nextTcDesc =
      ov.practiceGameDesc ??
      (hasCustomPractice
        ? `Trò chơi vận động "${nextTcName}" (Trang ${nextTcPage} SGK)`
        : folder.subFolders.troChoi.description);

    const nextKyThuatItems = ov.kyThuatItemNames
      ? folder.subFolders.kyThuat.items.map((item, idx) => {
          const customName = ov.kyThuatItemNames?.[idx]?.trim();
          return customName ? { ...item, name: customName } : item;
        })
      : folder.subFolders.kyThuat.items;

    const nextVdPage = ov.vanDungPage ?? folder.subFolders.vanDung.suggestedPage;

    return {
      ...folder,
      lessonName: nextLessonName,
      subFolders: {
        ...folder.subFolders,
        khoiDong: {
          ...folder.subFolders.khoiDong,
          suggestedPage: nextKdPage,
          description: nextKdDesc
        },
        troChoiKhoiDong: {
          ...folder.subFolders.troChoiKhoiDong,
          suggestedPage: nextTckdPage,
          description: nextTckdDesc,
          items: nextTckdName
            ? [
                {
                  name: `Trò chơi khởi động: ${nextTckdName}`,
                  gameName: nextTckdName,
                  page: nextTckdPage,
                  desc: nextTckdDesc
                }
              ]
            : []
        },
        kyThuat: {
          ...folder.subFolders.kyThuat,
          items: nextKyThuatItems
        },
        troChoi: {
          ...folder.subFolders.troChoi,
          suggestedPage: nextTcPage,
          description: nextTcDesc,
          items: nextTcName
            ? [
                {
                  name: `Trò chơi vận động: ${nextTcName}`,
                  gameName: nextTcName,
                  page: nextTcPage,
                  desc: nextTcDesc
                }
              ]
            : []
        },
        vanDung: {
          ...folder.subFolders.vanDung,
          suggestedPage: nextVdPage,
          question: 'Câu hỏi vận dụng sách giáo khoa.',
          answerGuide: ''
        }
      }
    };
  });
}

/**
 * Checks whether an image belongs strictly to a given SGK Lesson Folder
 * using grade match, topic/lesson ID, page range, or lesson movements.
 */
export function doesImageBelongToSgkLesson(img: SgkImageItem, folder: SgkLessonFolder): boolean {
  if (!img || String(img.grade) !== String(folder.grade)) return false;

  // Reject images explicitly bound to a different topic unless page clearly places them here
  if (img.topicId && folder.topicId && img.topicId !== folder.topicId && img.topicId !== folder.id) {
    if (!(img.page && img.page >= folder.startPage && img.page <= folder.endPage)) {
      return false;
    }
  }

  // Exact folder ID or (topicId + lessonId) match
  if (
    img.lessonId === folder.id ||
    (img.topicId === folder.topicId && img.lessonId === folder.lessonId)
  ) {
    return true;
  }

  // Explicit SGK page range match
  if (img.page && img.page >= folder.startPage && img.page <= folder.endPage) {
    return true;
  }

  // Movement / Game name overlap within same grade
  const textCorpus = `${img.title || ''} ${img.caption || ''} ${img.lessonTitle || ''}`.toLowerCase();
  const hasMovementMatch = folder.movements.some((m) => {
    const cleanM = m.toLowerCase().trim();
    return cleanM.length > 3 && textCorpus.includes(cleanM);
  });
  if (hasMovementMatch) return true;

  const warmupGameName = (folder.subFolders.troChoiKhoiDong.items[0]?.gameName || '').toLowerCase();
  const practiceGameName = (folder.subFolders.troChoi.items[0]?.gameName || '').toLowerCase();
  if ((warmupGameName && textCorpus.includes(warmupGameName)) || (practiceGameName && textCorpus.includes(practiceGameName))) {
    return true;
  }

  const cleanLessonName = folder.lessonName.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  if (cleanLessonName.length > 5 && textCorpus.includes(cleanLessonName)) {
    return true;
  }

  return false;
}

/**
 * Finds the exact SGK lesson folder covering a given grade and textbook PDF page.
 */
export function findSgkLessonByPage(
  grade: number,
  page: number,
  tree: SgkLessonFolder[] = getEffectiveSgkCurriculumTree()
): SgkLessonFolder | undefined {
  return tree.find((f) => f.grade === grade && page >= f.startPage && page <= f.endPage);
}

/**
 * Finds the exact SGK lesson folder focusing on a specific movement keyword for a grade.
 */
export function findSgkLessonForMovement(
  grade: number,
  movementName: string,
  tree: SgkLessonFolder[] = getEffectiveSgkCurriculumTree()
): SgkLessonFolder | undefined {
  const cleanM = (movementName || '')
    .toLowerCase()
    .replace(/^học\s+/i, '')
    .replace(/^ôn\s+/i, '')
    .replace(/\s*\(.*?\)/g, '')
    .trim();
  if (!cleanM) return undefined;

  const stripMov = cleanM.replace(/^động tác\s+/i, '').trim();
  const candidates = tree.filter((f) => f.grade === grade);

  let best: SgkLessonFolder | undefined;
  let bestScore = 0;

  for (const folder of candidates) {
    let score = 0;
    for (const m of folder.movements) {
      const mLow = m.toLowerCase();
      if (mLow === cleanM) score += 20;
      else if (mLow.includes(cleanM) || cleanM.includes(mLow)) score += 12;
      else if (stripMov.length >= 3 && mLow.includes(stripMov)) score += 8;
    }
    for (const item of folder.subFolders.kyThuat.items) {
      const itLow = item.name.toLowerCase();
      if (itLow.includes(cleanM)) score += 8;
      else if (stripMov.length >= 3 && itLow.includes(stripMov)) score += 5;
    }
    if (score > bestScore) {
      bestScore = score;
      best = folder;
    }
  }
  return bestScore > 0 ? best : undefined;
}

function normalizeCurriculumMatchText(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\bky\b/g, 'ki')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the most accurate lesson folder from the effective SGK Curriculum tree matching grade, title, or topic.
 * Uses movement/topic/SGK-item scoring instead of hard-rejecting when PPCT Bài numbers differ from SGK Bài numbers,
 * and NEVER blindly defaults to Bài 1 when no authentic textbook lesson matches (e.g., assessment/review-only slots).
 */
export function findSgkLessonByTopicOrTitle(
  grade: number,
  title: string,
  topic?: string
): SgkLessonFolder | undefined {
  const tree = getEffectiveSgkCurriculumTree();
  const gradeFolders = tree.filter((f) => f.grade === grade);
  if (gradeFolders.length === 0) return undefined;

  const cleanTitle = (title || '').toLowerCase();
  const cleanTopic = (topic || '').toLowerCase();
  const normTitle = normalizeCurriculumMatchText(title);
  const normTopic = normalizeCurriculumMatchText(topic || '');
  const combinedNorm = `${normTopic} ${normTitle}`.trim();

  // Assessment / end-of-term evaluation periods do not map to a single SGK lesson's technical photos
  if (/\b(kiem tra|danh gia|tong ket|xep loai|tieu chuan ren luyen)\b/.test(normTitle)) {
    return undefined;
  }

  const bMatchTitle = cleanTitle.match(/bài\s*(\d+)/i);
  const stopWords = new Set(['dong', 'tac', 'thuc', 'hien', 'bai', 'tap', 'phoi', 'hop', 'voi', 'cho', 'cac', 'trong', 'tren', 'cua']);

  let bestFolder: SgkLessonFolder | undefined;
  let bestScore = 0;

  for (const folder of gradeFolders) {
    let score = 0;
    const normLessonName = normalizeCurriculumMatchText(folder.lessonName.replace(/\s*\([^)]*\)/g, ''));
    const normTopicName = normalizeCurriculumMatchText(folder.topicName);

    // 1. Movement overlap (highest signal when PPCT splits or renumbers lessons)
    for (const m of folder.movements) {
      const mNorm = normalizeCurriculumMatchText(m);
      const mCore = mNorm.replace(/^dong tac\s+/, '').replace(/\s+voi gay$/, '').replace(/\s+voi vong.*$/, '').trim();
      if (mNorm && normTitle.includes(mNorm)) {
        score += 34;
      } else if (mCore.length >= 3 && normTitle.includes(mCore)) {
        score += 20;
      }
    }

    // 1b. Official SGK kyThuat item names overlap
    for (const kt of folder.subFolders.kyThuat.items || []) {
      const ktNorm = normalizeCurriculumMatchText(kt.name.replace(/\s*\([^)]*\)/g, ''));
      if (ktNorm.length >= 5 && normTitle.includes(ktNorm)) {
        score += 24;
      }
    }

    // 2. Topic alignment
    if (normTopic || normTitle) {
      if (normTopicName.includes('bai tap the duc') && combinedNorm.includes('the duc')) score += 12;
      if (normTopicName.includes('doi hinh') && combinedNorm.includes('doi hinh')) score += 12;
      if ((normTopicName.includes('ki nang') || normTopicName.includes('tu the')) && (combinedNorm.includes('ki nang') || combinedNorm.includes('tu the') || combinedNorm.includes('chuong ngai vat') || combinedNorm.includes('tung') || combinedNorm.includes('bat bong') || combinedNorm.includes('lan'))) score += 12;
      if (normTopicName.includes('bong ro') && combinedNorm.includes('bong ro')) score += 18;
      if (normTopicName.includes('bong da') && combinedNorm.includes('bong da')) score += 18;
      if (normTopicName.includes('aerobics') && (combinedNorm.includes('aerobic') || combinedNorm.includes('nhip dieu'))) score += 18;
      if (normTopicName.includes('boi') && combinedNorm.includes('boi')) score += 18;
    }

    // 3. Lesson number tie-breaker (only boosts when topic also aligns or lesson words overlap)
    const bMatchFolder = folder.lessonName.toLowerCase().match(/bài\s*(\d+)/i);
    if (bMatchFolder && bMatchTitle && bMatchFolder[1] === bMatchTitle[1] && score > 0) {
      score += 10;
    }

    // 4. Meaningful word overlap in lessonName
    const cleanLessonCore = normLessonName.replace(/^bai\s*\d+\s*/, '').trim();
    if (cleanLessonCore.length >= 6 && normTitle.includes(cleanLessonCore)) {
      score += 40;
    }
    const words = cleanLessonCore
      .split(' ')
      .filter((w) => w.length >= 3 && !stopWords.has(w));
    let wordHits = 0;
    for (const w of words) {
      if (combinedNorm.includes(w)) {
        score += 4;
        wordHits++;
      }
    }
    if (words.length > 0 && wordHits >= Math.ceil(words.length * 0.6)) {
      score += 14;
    }

    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 10 ? bestFolder : undefined;
}

/**
 * Returns the exact textbook PDF start page and movements for the lesson.
 */
export function getSgkPageForLesson(
  grade: number,
  title: string,
  topic?: string
): { page: number; lesson: SgkLessonFolder | null; movements: string[] } {
  const folder = findSgkLessonByTopicOrTitle(grade, title, topic);
  if (folder) {
    return {
      page: folder.startPage,
      lesson: folder,
      movements: folder.movements,
    };
  }
  const defaultPages: Record<number, number> = { 1: 28, 2: 23, 3: 27, 4: 26, 5: 25 };
  return {
    page: defaultPages[grade] || 25,
    lesson: null,
    movements: [],
  };
}

