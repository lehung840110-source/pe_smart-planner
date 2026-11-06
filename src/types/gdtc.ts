export interface DiagramAttachment {
  id: string;
  url: string;
  title: string;
}

export interface LessonRow {
  content: string;
  lvd: string; // Lượng vận động (ví dụ: 5-7', 2-3 lần)
  gv: string;  // Hoạt động của GV
  hs: string;  // Hoạt động của HS
  contentImgUrl?: string;
  contentImgTitle?: string;
  hsImgUrl?: string;
  hsImgTitle?: string;
  hsImages?: DiagramAttachment[]; // Cho phép gắn nhiều sơ đồ trong cùng 1 dòng hoạt động (đồng loạt, tổ nhóm, cặp đôi, cá nhân...)
}

export interface ExtractedLessonData {
  id: string;
  grade: number;
  lessonNum: number;
  week: number;
  topic: string;
  title: string;
  rows: LessonRow[];
}

export interface ScenarioItem {
  id: string;
  title: string;
  category: 'Động tác mới' | 'Luyện tập' | 'Trò chơi' | 'Mở đầu' | 'Tích hợp' | 'Hồi tĩnh' | 'Vận dụng';
  grade: string; // "1", "2", "3", "4", "5", "Chung"
  content?: string; // Cột 1: Nội dung chi tiết từng tuần
  lvd: string;     // Cột 2: Lượng vận động
  gv: string;      // Cột 3: Hoạt động của GV
  hs: string;      // Cột 4: Hoạt động của HS
}

export interface WeeklyMasterScheduleRow {
  id: string;
  dayOfWeek: string;        // e.g. "Thứ 2 – Sáng", "Thứ 2 – Chiều"
  period: number;           // Tiết trong buổi: 1, 2, 3, 4
  className: string;        // Lớp: "1A4", "1A5", "3A1", "5A1", "5A2"
  grade: 1 | 3 | 5;         // Khối lớp: 1, 3, hoặc 5
  lessonTitle: string;      // Bài học: Bài 2: Động tác chân...
  ppct: number;             // Tiết PPCT: 17, 18
  integrationNotes: string; // ND Tích hợp / Điều chỉnh
  equipment: string;        // ĐDDH: SGK, Tranh ảnh, video, dụng cụ TL
}

export type ImageCategory = 'dong_tac' | 'tap_luyen' | 'tro_choi' | 'van_dung' | 'khoi_dong' | 'tro_choi_khoi_dong';
export type SubFolderType = 'kyThuat' | 'luyenTap' | 'vanDung' | 'khoiDong' | 'troChoi' | 'troChoiKhoiDong';

export interface SgkImageItem {
  id: string;
  title: string;
  grade: string; // "1", "3", "5"
  topicId?: string;
  topicTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  folder?: SubFolderType;
  page: number;
  category: ImageCategory;
  imgUrl: string;
  caption: string;
  selected?: boolean;
  createdAt?: number;
}

export interface SchoolSettings {
  schoolName: string;
  departmentName: string;
  teacherName: string;
  schoolYear: string;
  approverPrincipal: string;
  approverHead: string;
}

export interface PpctItem {
  id: string;
  grade: 1 | 3 | 5;
  week: number;
  period: number; // 1 to 70
  topic: string;
  lessonTitle: string;
  integrationNotes?: string;
  equipment?: string;
}

export interface PpctAuditResult {
  grade: 1 | 3 | 5;
  week: number;
  period: number;
  scheduledTitle: string;
  ppctTitle: string;
  scheduledClassName: string;
  dayOfWeek: string;
  isMatch: boolean;
  differenceNote?: string;
}
