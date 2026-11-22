export interface DiagramAttachment {
  id: string;
  url: string;
  title: string;
  userPinned?: boolean; // Đánh dấu ảnh/sơ đồ do giáo viên tự chọn/chèn — tuyệt đối không bị bộ lọc tự động xóa
}

export interface LessonRow {
  content: string;
  lvd: string; // Lượng vận động (ví dụ: 5-7', 2-3 lần)
  gv: string;  // Hoạt động của GV
  hs: string;  // Hoạt động của HS
  contentImgUrl?: string;
  contentImgTitle?: string;
  contentImages?: DiagramAttachment[]; // Cho phép gắn nhiều hình ảnh trong Cột 1
  gvImgUrl?: string;
  gvImgTitle?: string;
  gvImages?: DiagramAttachment[];      // Cho phép gắn nhiều hình ảnh / sơ đồ trong Cột 3 (Hoạt động GV)
  hsImgUrl?: string;
  hsImgTitle?: string;
  hsImages?: DiagramAttachment[];      // Cho phép gắn nhiều sơ đồ trong cùng 1 dòng hoạt động (đồng loạt, tổ nhóm, cặp đôi, cá nhân...)
  userEditedMedia?: boolean;           // Giáo viên đã chủ động sửa/đổi/xóa ảnh hoặc sơ đồ ở dòng này
  userClearedContentImages?: boolean;  // Giáo viên đã chủ động xóa sạch ảnh Cột 1 ở dòng này
  userClearedHsImages?: boolean;       // Giáo viên đã chủ động xóa sạch sơ đồ Cột 4 ở dòng này
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

export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export interface WeeklyMasterScheduleRow {
  id: string;
  dayOfWeek: string;        // e.g. "Thứ 2 – Sáng", "Thứ 2 – Chiều"
  period: number;           // Tiết trong buổi: 1, 2, 3, 4
  className: string;        // Lớp: "1A4", "2A1", "3A1", "4A1", "5A1"...
  grade: GradeLevel;        // Khối lớp: 1, 2, 3, 4, hoặc 5
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
  grade: string; // "1", "2", "3", "4", "5"
  topicId?: string;
  topicTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  folder?: SubFolderType;
  page?: number;
  category: ImageCategory;
  imgUrl: string;
  caption: string;
  selected?: boolean;
  sortOrder?: number;
  createdAt?: number;
  updatedAt?: number;
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
  grade: GradeLevel;
  week: number;
  period: number; // 1 to 70
  topic: string;
  lessonTitle: string;
  integrationNotes?: string;
  equipment?: string;
}

export interface PpctAuditResult {
  grade: GradeLevel;
  week: number;
  period: number;
  scheduledTitle: string;
  ppctTitle: string;
  scheduledClassName: string;
  dayOfWeek: string;
  isMatch: boolean;
  differenceNote?: string;
}

export interface UserCustomTemplate {
  id: string;
  name: string;
  sourceFileName: string;
  fileType: 'docx' | 'doc' | 'pdf' | 'html' | 'json' | 'text';
  createdAt: number;
  updatedAt: number;
  grade: number;
  week: number;
  lessonNum: number;
  topic: string;
  title: string;
  dateRange: string;
  schoolName?: string;
  departmentName?: string;
  teacherName?: string;
  approverPrincipal?: string;
  approverHead?: string;
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
    addressLabel?: string;
    addressContent?: string;
    domains?: string[];
    digitalSkill: string;
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
  detectedSections: string[];
  analysisNotes: string[];
  rawTextExcerpt?: string;
}

export type BlueprintColumnMode =
  | '2col_nd_tc'
  | '2col_gv_hs'
  | '3col_nd_lvd_tc'
  | '3col_nd_gv_hs'
  | '4col_standard'
  | '5col_stt';

export interface BlueprintAnalysisDiagnostic {
  id: string;
  label: string;
  value: string;
  status: 'detected' | 'inferred' | 'fallback';
}

export interface CustomLayoutBlueprint {
  id: string;
  name: string;
  sourceFileName?: string;
  sourceType: 'docx' | 'doc' | 'pdf' | 'html' | 'preset' | 'text';
  createdAt: number;
  updatedAt: number;
  confidenceScore: number;
  columnMode: BlueprintColumnMode;
  columnHeaders: string[];
  columnWidths: number[];
  headerBlock: {
    showNationalMotto: boolean;
    showSchoolHeader: boolean;
    topLeftLine1: string;
    topLeftLine2: string;
    documentTitlePrefix: string;
    showTeacherMetaLine: boolean;
  };
  sectionHeadings: {
    sec1: string;
    sec2: string;
    sec3: string;
    sec4: string;
    showSec4: boolean;
  };
  signatureBlock: {
    enabled: boolean;
    count: 1 | 2 | 3;
    leftTitle: string;
    middleTitle: string;
    rightTitle: string;
  };
  detectedSchoolName?: string;
  detectedDepartmentName?: string;
  detectedTeacherName?: string;
  detectedApproverPrincipal?: string;
  detectedApproverHead?: string;
  analysisNotes: string[];
  diagnostics: BlueprintAnalysisDiagnostic[];
}

export interface ImportedFormationMatchLogItem {
  rowIdx: number;
  diagramId: string;
  diagramName: string;
  reason: string;
}

export interface ImportedWeeklyPlanEntry {
  id: string;
  week: number;
  period: number;
  gradeNum: number;
  gradeLabel: string;
  topic: string;
  lessonTitle: string;
  gameName?: string;
  pageHint?: number;
  endPageHint?: number;
  dateRange?: string;
  objectivesSummary?: string;
  equipmentSummary?: string;
  rows: LessonRow[];
  formationsAutoMatched?: boolean;
  autoFormationLog?: ImportedFormationMatchLogItem[];
}

export interface ImportedTemplateWorkspace {
  blueprintId: string;
  fileName: string;
  receivedAt: number;
  detectedGradeNum: number;
  detectedGradeLabel: string;
  totalPages?: number;
  weeklySchedule: ImportedWeeklyPlanEntry[];
  selectedEntryId: string;
  autoInsertedFormationsCount: number;
  teacherUploadedImagesCount: number;
  weeklyPlanSourceName?: string;
}

