import { SgkImageItem } from '../types/gdtc';

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

const LESSON_PEDAGOGY_ENRICHMENT: Record<string, LessonPedagogyEnrichment> = {
  // ===== KHỐI 1 =====
  k1_cd1_b1: {
    warmupGame: 'Chạy theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Chạy nhẹ nhàng quanh sân và dừng đứng nghiêm khi có hiệu lệnh còi (SGK GDTC 1)',
    practiceGame: 'Thỏ nhường hang',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi rèn phản xạ nhanh và giữ tư thế nghiêm/nghỉ đúng hiệu lệnh',
    vanDungQuestion: 'Khi nghe hiệu lệnh chào cờ đầu tuần hoặc xếp hàng vào lớp, em thực hiện tư thế đứng nghiêm và đứng nghỉ như thế nào?',
    vanDungAnswerGuide: 'Khi nghe khẩu lệnh "Nghiêm!", hai gót chân chạm nhau, hai bàn chân mở chữ V, thân người thẳng; khi nghe "Nghỉ!", chùng nhẹ một gối, giữ hàng ngũ ngay ngắn.'
  },
  k1_cd1_b2: {
    warmupGame: 'Làm theo tín hiệu',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Quan sát cờ/tay hiệu lệnh của GV để di chuyển nhanh về đúng vị trí hàng dọc',
    practiceGame: 'Kết bạn',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Chạy vòng tròn và nhanh chóng tập hợp thành hàng theo số lượng hiệu lệnh',
    vanDungQuestion: 'Khi xếp hàng dọc chuẩn bị vào lớp học, em làm thế nào để dóng hàng thẳng với bạn đứng phía trước?',
    vanDungAnswerGuide: 'Đặt tay phải chạm nhẹ vai bạn phía trước giữ đúng khoảng cách một cánh tay, nhìn thẳng gáy bạn để toàn hàng thẳng tắp.'
  },
  k1_cd1_b3: {
    warmupGame: 'Đứng ngồi theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Phản xạ nhanh theo khẩu lệnh đứng - ngồi để làm nóng đôi chân và cổ chân',
    practiceGame: 'Nhảy vào vòng tròn',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Thi đua bật nhảy chụm chân vào đúng vòng tròn đích theo tổ hàng ngang',
    vanDungQuestion: 'Trong các buổi sinh hoạt tập thể ngoài sân trường, vì sao em cần biết cách dàn hàng và dồn hàng ngang?',
    vanDungAnswerGuide: 'Giúp lớp có khoảng cách đều nhau khi tập thể dục không bị va chạm và thu gọn đội hình nhanh gọn khi di chuyển.'
  },
  k1_cd1_b4: {
    warmupGame: 'Đèn xanh đèn đỏ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Di chuyển và dừng quay đúng hướng theo hiệu lệnh tín hiệu màu',
    practiceGame: 'Quay nhanh đúng hướng',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi đua giữa các tổ quay phải, quay trái, quay sau chính xác góc 90°/180°',
    vanDungQuestion: 'Động tác quay phải, quay trái, quay sau giúp ích gì cho em khi di chuyển và vui chơi ở sân trường?',
    vanDungAnswerGuide: 'Giúp em đổi hướng nhanh nhẹn, giữ thăng bằng bằng gót chân trụ, không xô đẩy vào bạn khi chuyển hướng đi lại.'
  },
  k1_cd2_b1: {
    warmupGame: 'Làm theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Làm theo hiệu lệnh tạo hưng phấn trước bài thể dục (Trang 28 SGK)',
    practiceGame: 'Thỏ nhường hang',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Thỏ nhường hang phát triển sức nhanh và sự khéo léo (Trang 30 SGK)',
    vanDungQuestion: 'Em thường tập Động tác Vươn thở và Động tác Tay vào thời điểm nào trong ngày để hít thở sâu và cơ thể khỏe mạnh?',
    vanDungAnswerGuide: 'Tập mỗi buổi sáng thức dậy ở nơi thoáng khí hoặc giữa giờ ra chơi để lồng ngực nở rộng, giảm mỏi vai tay khi học.'
  },
  k1_cd2_b2: {
    warmupGame: 'Kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi Kết bạn xoay khớp cổ chân, đầu gối và ghép nhóm vui nhộn (Trang 32 SGK)',
    practiceGame: 'Lò cò tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi Lò cò tiếp sức rèn sức mạnh đôi chân và tinh thần đồng đội (Trang 35 SGK)',
    vanDungQuestion: 'Tập luyện Động tác Chân, Động tác Vặn mình và Động tác Bụng hằng ngày giúp em phát triển những bộ phận nào?',
    vanDungAnswerGuide: 'Giúp đôi chân vững vàng giữ thăng bằng tốt, cơ lưng bụng săn chắc và cột sống dẻo dai linh hoạt.'
  },
  k1_cd2_b3: {
    warmupGame: 'Nhảy lò cò',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động nhẹ khớp cổ chân và phản xạ thăng bằng trước khi học Phối hợp & Điều hòa',
    practiceGame: 'Mèo đuổi chuột',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi dân gian Mèo đuổi chuột rèn tốc độ phản ứng và phối hợp tập thể (Trang 39 SGK)',
    vanDungQuestion: 'Sau khi tập bài thể dục kết thúc bằng Động tác Phối hợp và Động tác Điều hòa, em cảm thấy nhịp thở và cơ thể ra sao?',
    vanDungAnswerGuide: 'Cơ thể ấm lên sảng khoái, sau động tác điều hòa lắc cổ tay và hít thở chậm giúp nhịp tim và hơi thở dịu lại nhẹ nhàng.'
  },
  k1_cd3_b1: {
    warmupGame: 'Nghe nhạc đoán hướng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Xoay khớp cổ nhẹ nhàng và quay đầu nhìn theo tín hiệu cờ của GV',
    practiceGame: 'Chuyền bóng qua đầu',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Các tổ xếp hàng dọc chuyền bóng nhẹ nhàng qua đầu thi đua về đích',
    vanDungQuestion: 'Khi ngồi học bài và đọc sách ở nhà, em giữ tư thế đầu và cổ như thế nào để tránh mỏi cổ và cong vẹo cột sống?',
    vanDungAnswerGuide: 'Ngồi lưng thẳng tự nhiên, đầu không cúi gập quá sát mặt bàn, giữ khoảng cách mắt với vở 25-30cm và nghỉ giải lao xoay cổ nhẹ nhàng.'
  },
  k1_cd3_b2: {
    warmupGame: 'Chim bay cò bay',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Phản xạ giơ hai tay dang ngang hoặc lên cao theo lời hô đúng của GV',
    practiceGame: 'Chuyền bóng hai bên',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Phối hợp dang tay đưa tay linh hoạt truyền tiếp sức theo tổ',
    vanDungQuestion: 'Khi mang cặp sách hoặc vác đồ nhẹ ở nhà, em sử dụng hai tay như thế nào để bảo vệ cột sống và khớp vai?',
    vanDungAnswerGuide: 'Đeo cặp bằng hai quai cân xứng trên hai vai hoặc xách đồ đều hai tay, không nghiêng lệch người về một phía.'
  },
  k1_cd3_b3: {
    warmupGame: 'Nhảy lò cò kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Bật nhảy nhẹ trên nửa trước bàn chân làm ấm cổ chân và khớp gối',
    practiceGame: 'Lò cò tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Bật nhảy lò cò vòng qua cọc mốc rồi chạy về chạm tay bạn tiếp theo',
    vanDungQuestion: 'Các bài tập kiễng gót và đứng thăng bằng một chân giúp ích gì cho em trong sinh hoạt và vui chơi?',
    vanDungAnswerGuide: 'Giúp đôi chân chắc khỏe, giữ thăng bằng vững vàng khi bước qua bậc thềm hoặc đi trên lối đi hẹp.'
  },
  k1_cd3_b4: {
    warmupGame: 'Đi theo tín hiệu',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Đi tự nhiên theo vòng tròn và thay đổi tốc độ theo nhịp vỗ tay',
    practiceGame: 'Đi tiếp sức trên vạch thẳng',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi đi nhanh giữ thăng bằng trên vạch kẻ thẳng về đích trao cờ',
    vanDungQuestion: 'Khi đi bộ trên vạch kẻ thẳng với hai tay chống hông hoặc dang ngang, mắt em cần nhìn hướng nào để đi thẳng dáng đẹp?',
    vanDungAnswerGuide: 'Mắt nhìn thẳng về phía trước cách 2-3m, không cúi gằm xuống chân, giữ đầu thẳng và bước chân tự nhiên.'
  },
  k1_cd3_b5: {
    warmupGame: 'Đoàn tàu nối đuôi',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Nối hàng đi kiễng gót nhẹ nhàng theo nhịp hô đồng thanh của lớp',
    practiceGame: 'Vượt cầu hẹp tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Đi kiễng gót theo đường vòng cung về chạm tay đồng đội',
    vanDungQuestion: 'Trong những tình huống nào hằng ngày em cần vận dụng cách đi kiễng gót hoặc đi chuyển hướng nhẹ nhàng?',
    vanDungAnswerGuide: 'Khi đi qua chỗ có vũng nước nhỏ, di chuyển qua lối hẹp có đồ vật hoặc đi nhẹ chân giữ trật tự trong hành lang.'
  },
  k1_tttc_br_b1: {
    warmupGame: 'Lăn bóng tiếp sức',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động cổ tay ngón tay bằng cách lăn nhẹ bóng giữa hai bạn',
    practiceGame: 'Chuyền bóng vòng tròn',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Đứng vòng tròn tung bắt bóng êm hai tay không làm rơi bóng',
    vanDungQuestion: 'Khi bắt quả bóng bay tới trước ngực, em mở rộng các ngón tay và thu tay như thế nào để bóng không bị bật ra ngoài?',
    vanDungAnswerGuide: 'Xòe rộng mười ngón tay đón bóng, hơi co nhẹ khuỷu tay kéo bóng về gần ngực để giảm lực va đập.'
  },
  k1_tttc_br_b2: {
    warmupGame: 'Chạy đổi hướng theo bóng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Chạy bước nhỏ và hạ trọng tâm trượt ngang theo hướng tay chỉ của GV',
    practiceGame: 'Đuổi bắt trượt ngang',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi di chuyển trượt ngang nhanh chạm cọc tiêu đổi chiều',
    vanDungQuestion: 'Vì sao khi di chuyển trượt ngang không bóng em cần hạ thấp trọng tâm và không bắt chéo hai chân?',
    vanDungAnswerGuide: 'Giúp giữ thăng bằng chắc chắn, không bị vấp chân và sẵn sàng đổi hướng sang trái hay sang phải thật nhanh.'
  },
  k1_tttc_br_b3: {
    warmupGame: 'Vỗ bóng theo nhịp',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Nhồi nhẹ bóng tại chỗ theo nhịp đếm 1-2-3-4 làm quen độ nảy',
    practiceGame: 'Dẫn bóng tiếp sức tại chỗ',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi tổ dẫn bóng tại chỗ 15 nhịp liên tục không rơi bóng',
    vanDungQuestion: 'Khi dẫn bóng rổ tại chỗ, em dùng phần nào của bàn tay để đẩy bóng xuống sân cho bóng nảy ổn định ngang hông?',
    vanDungAnswerGuide: 'Dùng phần đệm các ngón tay mở rộng ấn mềm mại đẩy bóng xuống sân, tránh dùng cả lòng bàn tay đập mạnh vào bóng.'
  },
  k1_tttc_br_b4: {
    warmupGame: 'Tung bóng qua vạch',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động khớp vai, khuỷu tay và nhún gối trước khi ném rổ',
    practiceGame: 'Ném bóng vào giỏ tiếp sức',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Các tổ lần lượt ném bóng hai tay trước ngực vào rổ thấp tính điểm',
    vanDungQuestion: 'Để ném bóng hai tay trước ngực đi đúng vòng cung vào rổ, em phối hợp chân và tay như thế nào?',
    vanDungAnswerGuide: 'Hạ nhẹ gối lấy đà, duỗi thẳng chân kết hợp đẩy hai tay chếch lên cao theo đường vòng cung hướng về vành rổ.'
  },
  k1_tttc_boi_b1: {
    warmupGame: 'Chuyền nước qua vòng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động kỹ trên cạn và làm quen té nước lên vai ngực trước khi xuống bể nông',
    practiceGame: 'Đi bộ thi dưới nước',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi đi thẳng trong mực nước ngang hông giữ thăng bằng tốt nhất',
    vanDungQuestion: 'Trước khi xuống bể bơi đi lại trong nước, em cần thực hiện những bước an toàn nào?',
    vanDungAnswerGuide: 'Khởi động kỹ các khớp trên cạn, tắm tráng làm quen nhiệt độ nước và chỉ xuống vùng nước nông có sự giám sát của người lớn.'
  },
  k1_tttc_boi_b2: {
    warmupGame: 'Ếch nhảy trên lá sen',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Nhún bật hai chân nhẹ nhàng trên cạn và ven thành bể nông',
    practiceGame: 'Nhảy lò cò dưới nước',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi bật nhảy hai chân trong nước nông cự ly 5m an toàn',
    vanDungQuestion: 'Khi bật nhảy hai chân trong nước, vì sao em cần gạt nhẹ hai tay ở hai bên thân?',
    vanDungAnswerGuide: 'Giúp giữ thân người thăng bằng vững chắc, chống nghiêng ngả khi chân tiếp đáy bể trong môi trường có lực đẩy của nước.'
  },
  k1_tttc_boi_b3: {
    warmupGame: 'Thổi bóng trên mặt nước',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Thổi hơi dài trên mặt nước tập kiểm soát hơi thở bình tĩnh',
    practiceGame: 'Tìm kho báu đáy bể nông',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Ngụp mặt nhịn thở mở mắt nhìn đồ vật dưới nước 3-5 giây',
    vanDungQuestion: 'Khi úp mặt xuống nước tập nhịn thở, em lấy hơi bằng bộ phận nào trước khi ngụp xuống?',
    vanDungAnswerGuide: 'Ngẩng đầu trên mặt nước há miệng hít vào một hơi vừa đủ, ngậm kín miệng rồi từ từ úp mặt xuống nước giữ bình tĩnh.'
  },
  k1_tttc_boi_b4: {
    warmupGame: 'Bong bóng cá',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Ngậm hơi thổi bọt khí liên tục dưới nước như chú cá nhỏ',
    practiceGame: 'Đội nào thổi bọt đều nhất',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Hai tay bám thành bể thi ngụp thở thổi bọt khí đúng nhịp không sặc nước',
    vanDungQuestion: 'Trong kỹ thuật thở có điểm tì ở thành bể, em thở ra vào lúc nào và hít vào vào lúc nào?',
    vanDungAnswerGuide: 'Thở ra từ từ thành bong bóng bằng mũi/miệng khi mặt ở dưới nước; khi nhô đầu lên mặt nước thì há miệng hít sâu ngay.'
  },
  k1_tttc_boi_b5: {
    warmupGame: 'Sứa nổi trên mặt nước',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Thả lỏng vai và tay đứng tự nhiên trong mực nước ngang ngực',
    practiceGame: 'Thi thở không điểm tì 10 nhịp',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thực hiện nhịp nhàng 5-10 lần nhún chân ngụp thở không bám thành bể',
    vanDungQuestion: 'Nếu lỡ bị trượt chân ở khu vực nước nông, kỹ năng đứng thở không điểm tì giúp em giữ an toàn như thế nào?',
    vanDungAnswerGuide: 'Giúp em bình tĩnh không hoảng loạn, chủ động nhún chân ngoi lên hít hơi và giữ cơ thể nổi ổn định chờ hỗ trợ.'
  },

  // ===== KHỐI 3 =====
  k3_cd1_b1: {
    warmupGame: 'Kết bạn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Di chuyển vòng tròn và ghép nhanh thành 2-3 nhóm theo hiệu lệnh số lượng',
    practiceGame: 'Chạy đổi chỗ vỗ tay nhau',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Chạy nhanh đổi vị trí hàng dọc và vỗ tay chính xác tạo hứng thú tập thể',
    vanDungQuestion: 'Trong giờ sinh hoạt dưới cờ hoặc hoạt động ngoài trời, em vận dụng cách biến đổi từ một hàng dọc thành hai, ba hàng dọc như thế nào?',
    vanDungAnswerGuide: 'Điểm số 1-2 (hoặc 1-2-3), ghi nhớ vị trí số chẵn/số lẻ để bước sang ngang tiến lên đúng hàng ngay ngắn trong vài giây.'
  },
  k3_cd1_b2: {
    warmupGame: 'Làm theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Tập trung lắng nghe khẩu lệnh dóng hàng và bước chuyển hàng ngang',
    practiceGame: 'Chim về tổ',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Phản xạ chạy nhanh về đúng tổ hàng ngang theo quy ước sau tiếng còi',
    vanDungQuestion: 'Khi tham gia biểu diễn đồng diễn thể dục toàn trường, việc biến đổi từ một hàng ngang thành hai, ba hàng ngang giúp ích gì?',
    vanDungAnswerGuide: 'Giúp dàn đội hình đều đẹp trên sân rộng, tạo không gian thoáng để thực hiện động tác tay chân không chạm nhau.'
  },
  k3_cd1_b3: {
    warmupGame: 'Mèo đuổi chuột',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Chạy luồn lách nhẹ nhàng quanh vòng tròn rèn sự nhanh nhẹn',
    practiceGame: 'Hoàng Anh - Hoàng Yến',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Hai đội quay lưng ở tâm vòng tròn rượt đuổi bắt bạn khi nghe gọi tên',
    vanDungQuestion: 'Đội hình một vòng tròn và hai vòng tròn thường được em vận dụng trong những hoạt động vui chơi tập thể nào?',
    vanDungAnswerGuide: 'Thường dùng khi chơi các trò chơi dân gian, sinh hoạt Sao Nhi đồng, múa hát tập thể hoặc khởi động vòng tròn ngoài sân.'
  },
  k3_cd1_b4: {
    warmupGame: 'Đứng ngồi theo hiệu lệnh',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động cổ chân, khớp gối và phản xạ theo hiệu lệnh trước bài Đi đều (Trang 27 SGK)',
    practiceGame: 'Chạy theo hình tam giác',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi Chạy theo hình tam giác phát triển tốc độ và chuyển hướng nhanh (Trang 29 SGK)',
    vanDungQuestion: 'Khi đi đều bị sai nhịp so với cả hàng, em cần thực hiện động tác gì để lấy lại nhịp đúng và vận dụng đi bộ trên vỉa hè ra sao?',
    vanDungAnswerGuide: 'Thực hiện bước đệm lướt chân để đưa nhịp 1 rơi vào chân trái khớp tiếng hô "Một"; ngoài đời sống đi bộ hàng lối ngay ngắn bên lề phải.'
  },
  k3_cd2_b1: {
    warmupGame: 'Chui qua hầm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Chui qua hầm làm mềm dẻo lưng bụng và cổ tay (SGK GDTC 3)',
    practiceGame: 'Đua ô tô',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Đua ô tô rèn sự nhanh nhẹn, khéo léo và phối hợp theo tổ',
    vanDungQuestion: 'Em hãy tự tập Động tác Vươn thở và Động tác Tay vào mỗi buổi sáng; hai động tác này giúp lồng ngực và đôi tay phát triển như thế nào?',
    vanDungAnswerGuide: 'Giúp lồng ngực nở nang tăng dung tích phổi, khớp vai và cơ cánh tay linh hoạt, giảm mỏi mệt khi ngồi học viết bài.'
  },
  k3_cd2_b2: {
    warmupGame: 'Chim về tổ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Chim về tổ rèn phản xạ di chuyển và làm nóng khớp gối (Trang 35 SGK)',
    practiceGame: 'Đua ô tô',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi vận động Đua ô tô tiếp sức luồn cọc tiêu theo quy định SGK GDTC 3',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd2_b3: {
    warmupGame: 'Mèo đuổi chuột',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Mèo đuổi chuột tạo tâm thế sôi nổi trước khi hoàn thiện bài thể dục (Trang 40 SGK)',
    practiceGame: 'Nhanh lên bạn ơi',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Nhanh lên bạn ơi rèn bật nhảy, tốc độ và tinh thần đồng đội (Trang 42 SGK)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k3_cd3_b1: {
    warmupGame: 'Bước qua suối nhỏ',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động bật nhẹ cổ chân và nâng cao đùi tại chỗ',
    practiceGame: 'Vượt chướng ngại vật tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Chạy nâng đùi bước và nhảy qua các vạch/thanh chắn thấp tiếp sức giữa các tổ',
    vanDungQuestion: 'Khi đi đường gặp rãnh nước hoặc vật cản thấp trên lối đi, em quan sát và bước qua như thế nào để đảm bảo an toàn?',
    vanDungAnswerGuide: 'Giảm tốc độ, quan sát kỹ khoảng cách, nâng cao đùi bước dứt khoát qua vật cản và đặt chắc bàn chân xuống đất mới bước tiếp.'
  },
  k3_cd3_b2: {
    warmupGame: 'Rắn uốn lượn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Di chuyển lượn sóng nhẹ theo hàng dọc qua các cọc mốc',
    practiceGame: 'Đua xe zíc zắc tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Chạy chuyển hướng luồn qua cọc mốc hình gấp khúc trao cờ cho đồng đội',
    vanDungQuestion: 'Kỹ năng di chuyển đổi hướng trên đường gấp khúc giúp ích gì cho em khi chạy chơi hoặc đi lại nơi đông người?',
    vanDungAnswerGuide: 'Giúp nghiêng người chuyển trọng tâm linh hoạt, chủ động né tránh vật cản hoặc người đi ngược chiều không va chạm.'
  },
  k3_cd3_b3: {
    warmupGame: 'Chui qua hang động',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Vận động phối hợp cúi thấp người và giữ thăng bằng khớp gối',
    practiceGame: 'Chiến sĩ vượt địa hình',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi đi thăng bằng qua vạch hẹp, bước qua bục thấp và chui qua dây thấp tiếp sức',
    vanDungQuestion: 'Khi tham gia dã ngoại hoặc sinh hoạt tập thể ngoài trời, em cần chú ý điều gì khi đi qua cầu hẹp hoặc chui qua vật thấp?',
    vanDungAnswerGuide: 'Hai tay dang ngang giữ thăng bằng khi đi qua cầu hẹp, cúi thấp đầu quan sát phía trước khi chui qua vật chắn.'
  },
  k3_cd3_b4: {
    warmupGame: 'Tung bóng theo nhạc',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Xoay khớp cổ tay, khuỷu tay và làm nóng cảm giác bắt bóng bằng hai tay',
    practiceGame: 'Tung bóng vỗ tay thi tài',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi tung bóng cao quá đầu, vỗ tay nhiều tiếng rồi bắt gọn không rơi bóng',
    vanDungQuestion: 'Để bắt bóng hai tay tại chỗ chuẩn xác không bị tuột, mắt và bàn tay em phối hợp ra sao?',
    vanDungAnswerGuide: 'Mắt luôn dõi theo đường bay của bóng, hai tay đưa ra trước xòe ngón đón bóng và hơi thu tay theo đà bóng rơi.'
  },
  k3_cd3_b5: {
    warmupGame: 'Đoàn tàu chuyền bóng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Đi bước nhỏ kết hợp chuyền nhẹ bóng qua lại theo hàng',
    practiceGame: 'Vừa đi vừa tung bắt tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Hai bạn chạy/đi song song tung bắt bóng về vạch đích trao bóng cho cặp sau',
    vanDungQuestion: 'Khi vừa di chuyển vừa tung bóng cho bạn bên cạnh, em điều chỉnh hướng tung bóng như thế nào để bạn dễ bắt?',
    vanDungAnswerGuide: 'Tung bóng hơi chếch về phía trước mặt bạn nửa bước theo hướng di chuyển với lực vừa phải tầm ngang ngực.'
  },
  k3_tttc_br_b1: {
    warmupGame: 'Lăn bóng luồn chân',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động ngón tay và lưng bằng động tác lăn bóng quanh hai cổ chân',
    practiceGame: 'Xoay bóng tiếp sức số 8',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi xoay bóng quanh hông và luồn bóng hình số 8 nhanh nhất không rơi',
    vanDungQuestion: 'Các bài tập xoay bóng quanh hông và luồn bóng hình số 8 giúp ích gì cho người chơi bóng rổ?',
    vanDungAnswerGuide: 'Tăng cảm giác tiếp xúc bóng linh hoạt của hai bàn tay, giữ chắc bóng và rèn sự khéo léo của cổ tay khi đổi hướng.'
  },
  k3_tttc_br_b2: {
    warmupGame: 'Chạy nhồi bóng biến tốc',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Dẫn bóng chậm rồi tăng tốc khi nghe tiếng còi báo hiệu',
    practiceGame: 'Dẫn bóng luồn cọc tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi dẫn bóng qua hàng cọc zíc zắc về vạch xuất phát trao bóng cho bạn',
    vanDungQuestion: 'Khi dẫn bóng đổi hướng qua chướng ngại vật, vì sao mắt em cần nhìn phía trước thay vì chỉ nhìn xuống quả bóng?',
    vanDungAnswerGuide: 'Để kịp thời quan sát cọc mốc, đồng đội và đối phương xung quanh, chủ động đổi tay dẫn bóng an toàn.'
  },
  k3_tttc_br_b3: {
    warmupGame: 'Chuyền bóng nhanh tay',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Hai hàng đứng đối diện chuyền bắt bóng hai tay tăng dần tốc độ',
    practiceGame: 'Ai chuyền chuẩn nhất',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Cặp đôi thực hiện 10 lần chuyền bóng hai tay trước ngực không rơi bóng',
    vanDungQuestion: 'Trong kỹ thuật chuyền bóng bằng hai tay trước ngực, bước chân và động tác vẩy cổ tay thực hiện như thế nào?',
    vanDungAnswerGuide: 'Bước một chân lên trước tạo lực, đẩy thẳng hai tay ra trước kết hợp miết ngón cái hướng xuống dưới để bóng đi căng và thẳng.'
  },
  k3_tttc_br_b4: {
    warmupGame: 'Dẫn bóng chạm đích',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Dẫn bóng 3 nhịp đến vạch quy định thực hiện tư thế hai bước dừng nhảy',
    practiceGame: 'Thi ném rổ ghi điểm',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Các tổ phối hợp dẫn bóng tới vạch rồi ném rổ hai tay tính tổng số quả vào rổ',
    vanDungQuestion: 'Khi kết thúc dẫn bóng để chuyển sang ném rổ bằng hai tay trước ngực, em dừng bước thế nào để không phạm luật chạy bước?',
    vanDungAnswerGuide: 'Dừng lại thăng bằng trên hai chân rộng bằng vai, ôm bóng chắc trước ngực, hạ thấp gối rồi nhún bật đẩy bóng vào rổ.'
  },
  k3_tttc_boi_b1: {
    warmupGame: 'Té nước tạo mưa',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động khớp toàn thân trên cạn và làm quen nước bằng trò chơi té nước nhẹ',
    practiceGame: 'Cá heo nhô đầu thở',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi đạp đáy bể nhô đầu hít sâu rồi ngụp thở bọt khí liên tục 8-10 lần',
    vanDungQuestion: 'Kỹ thuật đạp đáy bể nhô đầu kết hợp thở trong nước giúp ích gì nếu em bị hụt chân ở vùng nước vừa tầm đứng?',
    vanDungAnswerGuide: 'Giúp em không hoảng sợ, gập gối đạp mạnh xuống đáy đẩy đầu nhô lên mặt nước để lấy hơi thở đều đặn.'
  },
  k3_tttc_boi_b2: {
    warmupGame: 'Quạt nước đẩy thuyền',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Xoay khớp vai và dùng lòng bàn tay đẩy mặt nước tạo gợn sóng',
    practiceGame: 'Đua thuyền trên nước',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Khua hai tay gạt nước hình số 8 nằm ngang giữ đầu nổi ổn định khi di chuyển',
    vanDungQuestion: 'Khi khua tay trong nước tạo lực nâng giữ đầu nổi, hai bàn tay của em cần giữ tư thế ra sao?',
    vanDungAnswerGuide: 'Khép nhẹ các ngón tay hơi khum hình muôi, gạt nước nhịp nhàng ngang trước ngực chứ không xòe ngón hoặc vung lên khỏi mặt nước.'
  },
  k3_tttc_boi_b3: {
    warmupGame: 'Chân vịt gõ nhịp',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Ngồi thành bể duỗi thẳng mũi chân đập nước tạo bọt trắng đều',
    practiceGame: 'Đạp chân phao tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Hai tay ôm phao phía trước đập chân luân phiên lướt nhanh qua bể 10m',
    vanDungQuestion: 'Để đạp chân lướt nước tiến nhanh về phía trước mà không bị mỏi nhanh, em cần phát lực từ khớp nào?',
    vanDungAnswerGuide: 'Phát lực từ khớp hông đưa cả cẳng chân vẩy nhẹ cổ chân, tránh co gập đầu gối quá nhiều khiến lực đẩy bị triệt tiêu.'
  },
  k3_tttc_boi_b4: {
    warmupGame: 'Nổi sấp lướt nước',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Bám thành bể đạp chân kết hợp úp mặt thổi bọt khí làm quen lướt nước',
    practiceGame: 'Bơi tự do 15m tiếp sức',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Phối hợp nhịp nhàng đập chân và khua tay bơi qua quãng đường 10-15m an toàn',
    vanDungQuestion: 'Khi phối hợp vừa đập chân vừa khua tay bơi di chuyển trong nước, em cần duy trì nhịp thở như thế nào?',
    vanDungAnswerGuide: 'Giữ nhịp chân đập đều liên tục, chủ động thở ra hết trong nước và ngẩng đầu hoặc nghiêng đầu lấy hơi đều đặn.'
  },

  // ===== KHỐI 5 =====
  k5_cd1_b1: {
    warmupGame: 'Chỉ huy nhanh trí',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Nghe khẩu lệnh rút gọn để phản xạ quay hướng và dóng hàng cực nhanh',
    practiceGame: 'Thi tập hợp chi đội nhanh nhất',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Các phân đội thi tập hợp hàng dọc, hàng ngang, điểm số chính xác thời gian ngắn nhất',
    vanDungQuestion: 'Là học sinh lớp 5 anh/chị lớn trong trường, em vận dụng kỹ năng chỉ huy tập hợp đội hình vào các buổi chào cờ và sinh hoạt Đội như thế nào?',
    vanDungAnswerGuide: 'Tự tin đứng đúng vị trí chỉ huy, hô khẩu lệnh to rõ hai phần (dự lệnh và động lệnh), bao quát chỉnh đốn hàng ngũ phân đội ngay ngắn.'
  },
  k5_cd1_b2: {
    warmupGame: 'Ghép hàng thần tốc',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Chạy nhẹ quanh sân và lập tức chuyển sang đội hình 2 hoặc 3 hàng ngang khi có tín hiệu',
    practiceGame: 'Biến đổi đội hình tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Thi biến đổi đội hình từ hàng dọc sang hàng ngang và ngược lại chuẩn cự ly',
    vanDungQuestion: 'Khi biểu diễn đồng diễn hoặc tổ chức trò chơi tập thể đông người, kỹ năng phối hợp biến đổi đội hình mang lại lợi ích gì?',
    vanDungAnswerGuide: 'Giúp đội hình dịch chuyển khoa học, nhanh nhẹn, tạo nhiều đội hình đẹp mắt mà không xảy ra xô đẩy lộn xộn.'
  },
  k5_cd1_b3: {
    warmupGame: 'Dậm chân theo nhịp trống',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Dậm chân tại chỗ kết hợp đánh tay vuông góc đúng nhịp trống hành tiến',
    practiceGame: 'Diễu hành qua lễ đài',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thi các chi đội đi đều vòng bên phải, vòng bên trái qua cọc góc thẳng hàng nhất',
    vanDungQuestion: 'Khi đi đều vòng bên phải hoặc vòng bên trái, em đầu hàng và các bạn hàng trong/hàng ngoài điều chỉnh bước chân ra sao để hàng không bị gãy?',
    vanDungAnswerGuide: 'Bạn phía góc vòng bước ngắn bước hơn làm trụ, các bạn phía vòng ngoài đánh bước rộng hơn để giữ các hàng ngang luôn thẳng tắp.'
  },
  k5_cd2_b1: {
    warmupGame: 'Ai nhanh hơn với gậy',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Ai nhanh hơn với gậy rèn phản xạ giữ gậy cân bằng (Trang 25 SGK)',
    practiceGame: 'Chuyền gậy tiếp sức',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Trò chơi vận động Chuyền gậy tiếp sức theo tổ phát triển tốc độ và phối hợp đồng đội (Trang 28 SGK)',
    vanDungQuestion: 'Tập Động tác Vươn thở, Tay, Chân với gậy thể dục phát triển những tố chất thể lực nào và sau khi tập em cần bảo quản gậy ra sao?',
    vanDungAnswerGuide: 'Phát triển sức mạnh cơ tay vai, cơ chân và thăng bằng; sau khi tập xong không vứt hoặc chống gậy mạnh xuống đất mà thu gọn xếp ngay ngắn vào giá thiết bị.'
  },
  k5_cd2_b2: {
    warmupGame: 'Ai kéo khoẻ hơn',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Ai kéo khoẻ hơn rèn sức mạnh bám gậy và khởi động lưng bụng (Trang 30 SGK)',
    practiceGame: 'Trao gậy tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Trao gậy tiếp sức hoàn thiện tốc độ bứt phá và kỹ thuật trao gậy an toàn (Trang 32 SGK)',
    vanDungQuestion: 'Khi tập Động tác Bụng, Vặn mình, Toàn thân với gậy, em giữ thăng bằng và sử dụng gậy an toàn như thế nào? Em vận dụng tập ở nhà ra sao?',
    vanDungAnswerGuide: 'Nắm chắc hai đầu gậy rộng hơn vai, giữ giãn cách an toàn để đầu gậy không vung trúng bạn; ở nhà có thể dùng thanh tre nhẹ hoặc gậy tập sáng.'
  },
  k5_cd2_b3: {
    warmupGame: 'Người thừa thứ hai',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Trò chơi bổ trợ khởi động Người thừa thứ hai tạo không khí sôi nổi trước phần Nhảy & Điều hòa với gậy (Trang 34 SGK)',
    practiceGame: 'Đội nào nhanh nhất',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Trò chơi vận động Đội nào nhanh nhất phối hợp di chuyển với gậy về đích tiếp sức (Trang 36 SGK)',
    vanDungQuestion: 'Bài thể dục 8 động tác với gậy kết thúc bằng Động tác Nhảy và Động tác Điều hòa có tác dụng gì cho sức bền và hồi phục cơ thể?',
    vanDungAnswerGuide: 'Động tác Nhảy với gậy tăng sức bật và độ linh hoạt toàn thân; Động tác Điều hòa với gậy giúp thả lỏng cơ vai tay và đưa nhịp thở trở về ổn định.'
  },
  k5_cd3_b1: {
    warmupGame: 'Con lăn khéo léo',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động kỹ khớp cổ, vai, cột sống trước khi tập các tư thế lăn trên đệm',
    practiceGame: 'Lăn tròn tiếp sức trên đệm',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Các tổ thực hiện lăn nghiêng 2 vòng thẳng hướng trên thảm đệm an toàn',
    vanDungQuestion: 'Khi không may bị trượt ngã khi chơi thể thao hoặc chạy nhảy, kỹ năng cuộn tròn thân người và lăn giúp em bảo vệ cơ thể ra sao?',
    vanDungAnswerGuide: 'Thu cằm bảo vệ đầu, ôm tay gọn giảm lực va đập trực tiếp xuống khuỷu tay hay cột sống, tản lực trượt theo vòng lăn để giảm chấn thương.'
  },
  k5_cd3_b2: {
    warmupGame: 'Bập bênh lưng trên đệm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Ngồi ôm gối cuộn tròn lưng lăn bập bênh làm quen cảm giác gập cằm sát ngực',
    practiceGame: 'Thi lộn xuôi đúng kỹ thuật',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Thực hiện chống tay gập cằm lộn xuôi tròn lưng ngồi gọn thẳng đẹp trên đệm (có hỗ trợ)',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k5_cd3_b3: {
    warmupGame: 'Khởi động tay nắm xà',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động kỹ cổ tay, ngón tay, vai và chân trước khi leo thang dóng',
    practiceGame: 'Chinh phục bậc thang cao',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Leo từng bậc tay chân so le chắc chắn lên mốc quy định rồi bước xuống an toàn',
    vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
    vanDungAnswerGuide: ''
  },
  k5_cd3_b4: {
    warmupGame: 'Bật nhún tiếp đất êm',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Tập nhảy xuống từ bục thấp khuỵu gối hoãn xung đúng tư thế',
    practiceGame: 'Vượt rào gỗ tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi chạy tiếp sức vượt rào gỗ thấp và tiếp đất thăng bằng bằng hai chân',
    vanDungQuestion: 'Khi trèo qua vật cản và nhảy xuống mặt đất, vì sao em phải tiếp đất bằng nửa trước bàn chân kết hợp khuỵu gối?',
    vanDungAnswerGuide: 'Động tác khuỵu gối hoãn xung giúp hấp thụ lực chấn động từ mặt đất, bảo vệ khớp gối, cột sống và tránh trượt ngã.'
  },
  k5_tttc_br_b1: {
    warmupGame: 'Đèn tín hiệu dẫn bóng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Dẫn bóng chậm khi giơ cờ vàng, bứt tốc nhanh khi giơ cờ xanh',
    practiceGame: 'Đua dẫn bóng vòng cung tiếp sức',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Dẫn bóng biến tốc uốn lượn vòng qua 5 cọc mốc trao bóng cho bạn',
    vanDungQuestion: 'Khi dẫn bóng rổ chuyển từ đi chậm sang bứt tốc nhanh, góc độ đẩy bóng xuống mặt sân thay đổi thế nào?',
    vanDungAnswerGuide: 'Khi bứt tốc đẩy bóng hơi chếch về phía trước mặt và tăng độ cao nảy ngang hông để chân chạy theo nhịp bóng không vướng.'
  },
  k5_tttc_br_b2: {
    warmupGame: 'Tháp cao chuyền bóng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động vai và bật nhảy chạm bóng trên cao trước khi tập chuyền',
    practiceGame: 'Chuyền bổng vượt người chắn',
    practiceGamePageOffset: 2,
    practiceGameDesc: 'Thi chuyền bóng hai tay trên đầu vượt qua bạn đứng chắn giữa hai người',
    vanDungQuestion: 'Trong thi đấu bóng rổ, em sử dụng kỹ thuật chuyền bóng bằng hai tay trên đầu hiệu quả nhất trong tình huống nào?',
    vanDungAnswerGuide: 'Khi cần chuyền bóng vượt qua tầm tay với của hậu vệ đối phương đứng chắn phía trước mặt hoặc phát động phản công nhanh.'
  },
  k5_tttc_br_b3: {
    warmupGame: 'Hai bước nhảy chạm bảng',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Chạy đà 1-2 nhịp bật cao một chân chạm bảng rổ mô phỏng bước lên rổ',
    practiceGame: 'Thi lên rổ hai bước ghi điểm',
    practiceGamePageOffset: 1,
    practiceGameDesc: 'Các tổ luân phiên dẫn bóng hai bước bật nhảy đặt bóng bảng rổ ghi điểm',
    vanDungQuestion: 'Trong kỹ thuật hai bước lên rổ (nhịp 1 bước dài, nhịp 2 bước ngắn), em tận dụng nhịp bước thứ hai để làm gì?',
    vanDungAnswerGuide: 'Bước 2 ngắn giúp hãm đà chạy ngang chuyển thành lực bật nhảy thẳng đứng cao nhất đưa bóng tiếp cận gần vành rổ.'
  },
  k5_tttc_boi_b1: {
    warmupGame: 'Quạt chân tung bọt',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Khởi động và ép dẻo cổ chân trên thành bể trước khi đập chân trườn sấp',
    practiceGame: 'Lướt nước đập chân 15m',
    practiceGamePageOffset: 3,
    practiceGameDesc: 'Ôm phao lướt nước thi đạp chân trườn sấp cự ly 15m nhanh và thẳng nhất',
    vanDungQuestion: 'Để động tác chân bơi trườn sấp tạo ra lực đẩy tiến tốt nhất, vị trí bàn chân đập so với mặt nước như thế nào?',
    vanDungAnswerGuide: 'Hai chân duỗi mũi hơi xoay vào trong, đập liên tục ngay sát mặt nước tạo bọt trắng nhẹ chứ không giơ hẳn gót lên khỏi mặt nước.'
  },
  k5_tttc_boi_b2: {
    warmupGame: 'Cối xay gió quạt tay',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Xoay khớp vai biên độ rộng và thực hiện mô phỏng quạt tay trên cạn',
    practiceGame: 'Kẹp phao bơi tay 15m',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Kẹp phao giữa hai đùi thi kéo quạt tay bơi trườn sấp về đích 15m',
    vanDungQuestion: 'Khi thực hiện động tác tay bơi trườn sấp dưới nước, giai đoạn nào tạo lực kéo người tiến mạnh nhất?',
    vanDungAnswerGuide: 'Giai đoạn tì nước - kéo nước - đẩy nước chữ S ngay dưới thân người cho đến khi bàn tay lướt sát gần đùi rồi mới nhấc khuỷu vung tay về trước.'
  },
  k5_tttc_boi_b3: {
    warmupGame: 'Thở nghiêng đầu theo nhịp tay',
    warmupGamePageOffset: 0,
    warmupGameDesc: 'Thực hành đứng gập thân trên cạn quạt tay kết hợp nghiêng đầu lấy hơi',
    practiceGame: 'Tiếp sức bơi trườn sấp 25m',
    practiceGamePageOffset: 4,
    practiceGameDesc: 'Thi bơi trườn sấp hoàn chỉnh phối hợp chân - tay - thở cự ly 25m an toàn',
    vanDungQuestion: 'Trong bơi trườn sấp, vì sao em chỉ nghiêng đầu sang một bên lấy hơi thay vì ngẩng thẳng mặt lên phía trước?',
    vanDungAnswerGuide: 'Nghiêng đầu giữ trục thân người thẳng phẳng song song mặt nước giảm lực cản và giúp chân không bị chìm xuống đáy bể.'
  }
};

export const sgkCurriculumTree: SgkLessonFolder[] = RAW_SGK_CURRICULUM_TREE.map((raw) => {
  const enrich = LESSON_PEDAGOGY_ENRICHMENT[raw.id];
  const kdPage = raw.subFolders.khoiDong.suggestedPage || raw.startPage;
  const ltPage = raw.subFolders.luyenTap.items[0]?.page || Math.min(raw.endPage, raw.startPage + 2);
  const vdPage = raw.subFolders.vanDung.suggestedPage || raw.endPage;
  const tckdPage = Math.min(raw.endPage, raw.startPage + (enrich?.warmupGamePageOffset ?? 0));
  const tcPage = Math.min(raw.endPage, raw.startPage + (enrich?.practiceGamePageOffset ?? Math.max(1, raw.endPage - raw.startPage - 1)));

  const warmupGameName = enrich?.warmupGame || 'Làm theo hiệu lệnh';
  const practiceGameName = enrich?.practiceGame || 'Trò chơi vận động tiếp sức';

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
        description: enrich?.warmupGameDesc || `Trò chơi bổ trợ khởi động "${warmupGameName}" (Trang ${tckdPage} SGK)`,
        suggestedPage: tckdPage,
        items:
          raw.subFolders.troChoiKhoiDong?.items?.map((it) => ({
            ...it,
            gameName: it.gameName || warmupGameName
          })) || [
            {
              name: `Trò chơi khởi động: ${warmupGameName}`,
              gameName: warmupGameName,
              page: tckdPage,
              desc: enrich?.warmupGameDesc || raw.subFolders.khoiDong.description
            }
          ]
      },
      kyThuat: raw.subFolders.kyThuat,
      luyenTap: raw.subFolders.luyenTap,
      troChoi: {
        name: raw.subFolders.troChoi?.name || 'Thư mục Trò chơi vận động',
        description: enrich?.practiceGameDesc || `Trò chơi vận động "${practiceGameName}" (Trang ${tcPage} SGK)`,
        suggestedPage: tcPage,
        items:
          raw.subFolders.troChoi?.items?.map((it) => ({
            ...it,
            gameName: it.gameName || practiceGameName
          })) || [
            {
              name: `Trò chơi vận động: ${practiceGameName}`,
              gameName: practiceGameName,
              page: tcPage,
              desc: enrich?.practiceGameDesc || `Trò chơi vận động phát triển thể chất "${practiceGameName}"`
            }
          ]
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
  warmupGameName?: string;
  warmupGamePage?: number;
  warmupGameDesc?: string;
  practiceGameName?: string;
  practiceGamePage?: number;
  practiceGameDesc?: string;
  vanDungQuestion?: string;
  vanDungAnswerGuide?: string;
  vanDungPage?: number;
  khoiDongPage?: number;
  khoiDongDesc?: string;
}

const SGK_TREE_OVERRIDES_STORAGE_KEY = 'gdtc_sgk_tree_overrides_v1';

export function getSgkTreeOverrides(): Record<string, SgkTreeLessonOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SGK_TREE_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSgkTreeLessonOverride(
  lessonId: string,
  patch: SgkTreeLessonOverride
): Record<string, SgkTreeLessonOverride> {
  const current = getSgkTreeOverrides();
  const next: Record<string, SgkTreeLessonOverride> = {
    ...current,
    [lessonId]: {
      ...(current[lessonId] || {}),
      ...patch
    }
  };
  try {
    localStorage.setItem(SGK_TREE_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
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
  return next;
}

export function getEffectiveSgkCurriculumTree(): SgkLessonFolder[] {
  const overrides = getSgkTreeOverrides();
  if (!overrides || Object.keys(overrides).length === 0) return sgkCurriculumTree;

  return sgkCurriculumTree.map((folder) => {
    const ov = overrides[folder.id];
    if (!ov) return folder;

    const nextKdPage = ov.khoiDongPage ?? folder.subFolders.khoiDong.suggestedPage;
    const nextKdDesc = ov.khoiDongDesc ?? folder.subFolders.khoiDong.description;
    const nextTckdName = ov.warmupGameName?.trim() || folder.subFolders.troChoiKhoiDong.items[0]?.gameName || '';
    const nextTckdPage = ov.warmupGamePage ?? folder.subFolders.troChoiKhoiDong.suggestedPage;
    const nextTckdDesc = ov.warmupGameDesc ?? folder.subFolders.troChoiKhoiDong.description;

    const nextTcName = ov.practiceGameName?.trim() || folder.subFolders.troChoi.items[0]?.gameName || '';
    const nextTcPage = ov.practiceGamePage ?? folder.subFolders.troChoi.suggestedPage;
    const nextTcDesc = ov.practiceGameDesc ?? folder.subFolders.troChoi.description;

    const nextVdPage = ov.vanDungPage ?? folder.subFolders.vanDung.suggestedPage;

    return {
      ...folder,
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
          items: [
            {
              name: `Trò chơi khởi động: ${nextTckdName}`,
              gameName: nextTckdName,
              page: nextTckdPage,
              desc: nextTckdDesc
            }
          ]
        },
        troChoi: {
          ...folder.subFolders.troChoi,
          suggestedPage: nextTcPage,
          description: nextTcDesc,
          items: [
            {
              name: `Trò chơi vận động: ${nextTcName}`,
              gameName: nextTcName,
              page: nextTcPage,
              desc: nextTcDesc
            }
          ]
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

/**
 * Finds the most accurate lesson folder from the effective SGK Curriculum tree matching grade, title, or topic.
 * Uses movement/topic scoring instead of hard-rejecting when PPCT Bài numbers differ from SGK Bài numbers.
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
  const combinedText = `${cleanTopic} ${cleanTitle}`;
  const bMatchTitle = cleanTitle.match(/bài\s*(\d+)/i);

  let bestFolder: SgkLessonFolder | undefined;
  let bestScore = -1;

  for (const folder of gradeFolders) {
    let score = 0;
    const lName = folder.lessonName.toLowerCase();
    const tName = folder.topicName.toLowerCase();

    // 1. Movement overlap (highest signal when PPCT splits or renumbers lessons)
    for (const m of folder.movements) {
      const mLow = m.toLowerCase().trim();
      const mCore = mLow.replace(/^động tác\s+/i, '').replace(/\s+với gậy$/i, '').trim();
      if (mLow && cleanTitle.includes(mLow)) {
        score += 30;
      } else if (mCore.length >= 3 && cleanTitle.includes(mCore)) {
        score += 18;
      }
    }

    // 2. Topic alignment
    if (cleanTopic) {
      if (tName.includes('bài tập thể dục') && cleanTopic.includes('thể dục')) score += 10;
      if (tName.includes('đội hình') && cleanTopic.includes('đội hình')) score += 10;
      if ((tName.includes('kĩ năng') || tName.includes('tư thế')) && (cleanTopic.includes('kĩ năng') || cleanTopic.includes('tư thế'))) score += 10;
      if (tName.includes('bóng rổ') && cleanTopic.includes('bóng rổ')) score += 15;
      if (tName.includes('bơi') && cleanTopic.includes('bơi')) score += 15;
    }

    // 3. Lesson number tie-breaker (bonus rather than hard rejection!)
    const bMatchFolder = lName.match(/bài\s*(\d+)/i);
    if (bMatchFolder && bMatchTitle && bMatchFolder[1] === bMatchTitle[1]) {
      score += 8;
    }

    // 4. Meaningful word overlap in lessonName / description
    const words = lName
      .replace(/bài\s*\d+\s*[:\-]?\s*/i, '')
      .replace(/\(.*?\)/g, '')
      .split(/[\s,;:\-]+/)
      .filter((w) => w.length > 3 && !['động', 'tác', 'thực', 'hiện'].includes(w));
    for (const w of words) {
      if (combinedText.includes(w)) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return (bestScore > 0 ? bestFolder : undefined) || gradeFolders[0];
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
  const defaultPages: Record<number, number> = { 1: 28, 3: 27, 5: 25 };
  return {
    page: defaultPages[grade] || 25,
    lesson: null,
    movements: [],
  };
}

