import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Printer,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Save,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  PlusCircle,
  X,
  Compass,
  FolderOpen,
  Sliders,
  Type,
  School,
  Check,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Trash2,
  RotateCcw,
  HardDrive
} from 'lucide-react';
import mammoth from 'mammoth';
import { LessonRow, SchoolSettings, SgkImageItem, WeeklyMasterScheduleRow, DiagramAttachment, PpctItem } from '../types/gdtc';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { masterPlansTuan9 } from '../data/masterTemplateTuan9';
import { standardFormationDiagrams, FormationDiagram } from '../data/formationDiagrams';
import { standardMovementsLibrary } from '../data/movementLibrary';
import { exportWordDocument, exportCleanWordDocxFromData } from '../utils/exportUtils';
import {
  getWeekDateInfo,
  getGradePpctInfo,
  getWeeklyIntegrationThemes,
  WeeklyIntegrationThemes,
  defaultWeek9Schedule,
  getDefaultWeeklySchedule,
  parseUploadedWeeklyPlanTable
} from '../utils/academicCalendar';
import { SelectFormationModal } from './SelectFormationModal';
import { ClassifiedImagePickerModal, ImageClassificationCategory } from './ClassifiedImagePickerModal';
import { PpctManagerModal } from './PpctManagerModal';
import { getStoredPpctData, saveStoredPpctData } from '../data/defaultPpctData';
import { extractIntegrationFromPlan } from '../utils/ppctParser';
import { setAppStateDB, getAppStateDB } from '../utils/db';
import { createBalanced7LessonRows, resolveAccurateMovement, resolveAccurateGameImage } from '../utils/planAutoMatcher';
import {
  cleanLessonTitleForHeader,
  cleanTopicForDisplay,
  auditCurriculumSync,
  autoSyncCurriculumAndPlans,
  AUTHORITATIVE_CURRICULUM_RULES,
  getCurriculumRule,
  AuditReport
} from '../utils/curriculumAuditSync';

interface TabExportPrintProps {
  week: number;
  grade: number;
  lessonNum: number;
  topic: string;
  title: string;
  lessonRows: LessonRow[];
  schoolSettings: SchoolSettings;
  onUpdateSchoolSettings?: (newSettings: SchoolSettings) => void;
  currentMasterPlan?: MasterPlanItem;
  allMasterPlans?: Record<string, MasterPlanItem>;
  onUpdateMasterPlanItem?: (key: string, plan: MasterPlanItem) => void;
  images?: SgkImageItem[];
  showToast: (msg: string) => void;
  onUpdateMasterPlan?: (updated: MasterPlanItem) => void;
  onNavigateToLibrary?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const TabExportPrint: React.FC<TabExportPrintProps> = ({
  week: initialWeek,
  grade: initialGrade,
  lessonNum: initialLessonNum,
  topic: initialTopic,
  title: initialTitle,
  lessonRows,
  schoolSettings,
  onUpdateSchoolSettings,
  currentMasterPlan,
  allMasterPlans,
  onUpdateMasterPlanItem,
  images = [],
  showToast,
  onUpdateMasterPlan,
  onNavigateToLibrary,
  onOpenGoogleDrive
}) => {
  // 1. Dynamic Week Selection (Weeks 1 to 35)
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    return initialWeek || currentMasterPlan?.week || 9;
  });

  // Calculate dynamic dates for current week
  const weekInfo = getWeekDateInfo(selectedWeek);
  const [customDateRange, setCustomDateRange] = useState<string>(
    selectedWeek === 9 ? 'Từ ngày 02-06 tháng 11 năm 2026' : weekInfo.dateRangeText
  );
  const [customApprovalDate, setCustomApprovalDate] = useState<string>(
    selectedWeek === 9 ? 'Vệ Giang, ngày 06 tháng 11 năm 2026' : weekInfo.approvalDateText
  );

  // 2. Official 7-Column Master Timetable Schedule for Page 1 with local persistence
  const [weeklyScheduleRows, setWeeklyScheduleRows] = useState<WeeklyMasterScheduleRow[]>(() => {
    const w = initialWeek || currentMasterPlan?.week || 9;
    try {
      const saved = localStorage.getItem(`gdtc_schedule_w${w}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return w === 9 ? defaultWeek9Schedule : getDefaultWeeklySchedule(w);
  });

  // Upload Weekly Plan Modal State
  const [isUploadPlanModalOpen, setIsUploadPlanModalOpen] = useState<boolean>(false);
  const [pasteTableText, setPasteTableText] = useState<string>('');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PPCT Manager Modal State
  const [isPpctManagerOpen, setIsPpctManagerOpen] = useState<boolean>(false);
  const [ppctList, setPpctList] = useState<PpctItem[]>(() => getStoredPpctData());
  const [customWeeklyThemes, setCustomWeeklyThemes] = useState<WeeklyIntegrationThemes | null>(() => {
    const w = initialWeek || currentMasterPlan?.week || 9;
    try {
      const saved = localStorage.getItem(`gdtc_themes_w${w}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Formation Diagram Picker State for multiple diagrams in Column 4
  const [isFormationPickerOpen, setIsFormationPickerOpen] = useState<boolean>(false);
  const [formationTarget, setFormationTarget] = useState<{ planId: string; rowIndex: number } | null>(null);

  // Sync with prop when parent changes week (e.g. clicking 'TUẦN HIỆN HÀNH')
  useEffect(() => {
    if (initialWeek && initialWeek !== selectedWeek) {
      setSelectedWeek(initialWeek);
    }
  }, [initialWeek]);

  // Update schedule and dates when selectedWeek changes, prioritizing uploaded plan
  useEffect(() => {
    const savedDates = localStorage.getItem(`gdtc_dates_w${selectedWeek}`);
    if (savedDates) {
      try {
        const parsed = JSON.parse(savedDates);
        if (parsed.dateRange) setCustomDateRange(parsed.dateRange);
        if (parsed.approvalDate) setCustomApprovalDate(parsed.approvalDate);
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = getWeekDateInfo(selectedWeek);
      if (selectedWeek === 9) {
        setCustomDateRange('Từ ngày 02-06 tháng 11 năm 2026');
        setCustomApprovalDate('Vệ Giang, ngày 06 tháng 11 năm 2026');
      } else {
        setCustomDateRange(updated.dateRangeText);
        setCustomApprovalDate(updated.approvalDateText);
      }
    }

    // 1. Restore uploaded schedule rows if previously saved for this week
    try {
      const savedSchedule = localStorage.getItem(`gdtc_schedule_w${selectedWeek}`);
      if (savedSchedule) {
        const parsed = JSON.parse(savedSchedule);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWeeklyScheduleRows(parsed);
        } else {
          setWeeklyScheduleRows(selectedWeek === 9 ? defaultWeek9Schedule : getDefaultWeeklySchedule(selectedWeek));
        }
      } else {
        setWeeklyScheduleRows(selectedWeek === 9 ? defaultWeek9Schedule : getDefaultWeeklySchedule(selectedWeek));
      }
    } catch (e) {
      setWeeklyScheduleRows(selectedWeek === 9 ? defaultWeek9Schedule : getDefaultWeeklySchedule(selectedWeek));
    }

    // 2. Restore custom uploaded integration themes
    try {
      const savedThemes = localStorage.getItem(`gdtc_themes_w${selectedWeek}`);
      if (savedThemes) {
        setCustomWeeklyThemes(JSON.parse(savedThemes));
      } else {
        setCustomWeeklyThemes(null);
      }
    } catch (e) {
      setCustomWeeklyThemes(null);
    }
  }, [selectedWeek]);

  // View mode
  const [viewMode, setViewMode] = useState<'all_grades' | 'grade_1' | 'grade_3' | 'grade_5' | 'single'>('all_grades');

  // Selected plan key for single mode
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>(() => {
    if (currentMasterPlan) return `k${currentMasterPlan.grade}_t${currentMasterPlan.lessonNum}`;
    return 'k1_t17';
  });

  // Edit Mode toggle
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isHeaderEditorOpen, setIsHeaderEditorOpen] = useState<boolean>(false);

  // Undo History Stack
  const [historyStack, setHistoryStack] = useState<MasterPlanItem[][]>([]);

  // Typography & Styling controls
  const [fontFamily, setFontFamily] = useState<'Times New Roman' | 'Arial' | 'Roboto' | 'Calibri'>('Times New Roman');
  const [fontSize, setFontSize] = useState<'11pt' | '12pt' | '13pt' | '14pt'>('12pt');
  const [imageHeight, setImageHeight] = useState<number>(95); // Chuẩn 95px theo đúng kích thước thầy vừa điều chỉnh trong file PDF
  const [showImageCaptions, setShowImageCaptions] = useState<boolean>(false); // Mặc định tắt ghi chú dưới hình theo chuẩn giáo án GDTC tiểu học
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Local editable administrative settings
  const [localSettings, setLocalSettings] = useState<SchoolSettings>({
    ...schoolSettings,
    approverPrincipal: schoolSettings.approverPrincipal || 'Võ Thị Thuận',
    approverHead: schoolSettings.approverHead || 'Bùi Ngọc Lâm'
  });

  useEffect(() => {
    setLocalSettings({
      ...schoolSettings,
      approverPrincipal: schoolSettings.approverPrincipal || 'Võ Thị Thuận',
      approverHead: schoolSettings.approverHead || 'Bùi Ngọc Lâm'
    });
  }, [schoolSettings]);

  // Weekly integration theme (supports dynamic extraction from uploaded weekly plan)
  const weeklyThemes: WeeklyIntegrationThemes =
    customWeeklyThemes && customWeeklyThemes.week === selectedWeek
      ? customWeeklyThemes
    : getWeeklyIntegrationThemes(selectedWeek);

  // Multi-grade PPCT
  const ppctG1 = getGradePpctInfo(1, selectedWeek);
  const ppctG3 = getGradePpctInfo(3, selectedWeek);
  const ppctG5 = getGradePpctInfo(5, selectedWeek);

  // Initialize all plans for the selected week
  const [plansByGrade, setPlansByGrade] = useState<MasterPlanItem[]>([]);

  // Push snapshot to history before modifications
  const recordHistory = (newPlans: MasterPlanItem[]) => {
    setHistoryStack((prev) => [...prev.slice(-15), plansByGrade]);
    setPlansByGrade(newPlans);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setPlansByGrade(previous);
    showToast('Đã hoàn tác thao tác vừa rồi!');
  };

  // 1-Click: Split 3.1, 3.2, 3.3, 3.4 into dedicated rows and balance column heights with 100-120 words for GV
  const handleSplitAndBalanceAllPlans = () => {
    const updatedPlans = plansByGrade.map((p) => {
      const rule = getCurriculumRule(p.grade as (1 | 3 | 5), p.lessonNum, selectedWeek);
      const balancedRows = createBalanced7LessonRows(
        p.grade as (1 | 3 | 5),
        p.title,
        images,
        rule.warmupGame,
        rule.practiceGame
      );
      return {
        ...p,
        rows: balancedRows
      };
    });
    recordHistory(updatedPlans);
    showToast('✨ Đã tách 3.1, 3.2, 3.3, 3.4 thành từng ô riêng, cân bằng Cột GV 100-120 từ và chuẩn khớp ảnh kỹ thuật 100%!');
  };

  // Audit Modal State & Authoritative Curriculum Check
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Compute curriculum audit across all 3 grades
  const auditReport: AuditReport = useMemo(() => {
    return auditCurriculumSync(plansByGrade, weeklyScheduleRows, selectedWeek);
  }, [plansByGrade, weeklyScheduleRows, selectedWeek]);

  // 1-Click: Automatically synchronize curriculum, lesson titles, movements, games, and disabled students accommodations
  const handleAutoSyncAllCurriculum = () => {
    const result = autoSyncCurriculumAndPlans(plansByGrade, weeklyScheduleRows, selectedWeek, images);
    setWeeklyScheduleRows(result.updatedScheduleRows);
    recordHistory(result.updatedPlans);
    showToast('✨ Đã đồng bộ 100% Tên bài TKB & Giáo án, Động tác Cột 1, Trò chơi và Năng lực giảm tải cho HS khuyết tật chuẩn SGK!');
  };

  // Apply parsed weekly plan & extract cross-curricular integrations to all 3 grade plans
  const applyParsedWeeklySchedule = (
    rows: WeeklyMasterScheduleRow[],
    parsedWeek?: number,
    parsedDateRange?: string,
    rawTextOrHtml: string = ''
  ) => {
    const targetWeek = parsedWeek || selectedWeek;
    if (parsedWeek) setSelectedWeek(parsedWeek);
    if (parsedDateRange) setCustomDateRange(parsedDateRange);
    setWeeklyScheduleRows(rows);

    // 1. Persist schedule rows and dates to localStorage & IndexedDB
    try {
      localStorage.setItem(`gdtc_schedule_w${targetWeek}`, JSON.stringify(rows));
      setAppStateDB(`gdtc_schedule_w${targetWeek}`, rows);
      if (parsedDateRange) {
        localStorage.setItem(`gdtc_dates_w${targetWeek}`, JSON.stringify({ dateRange: parsedDateRange, approvalDate: customApprovalDate }));
      }
    } catch (e) {
      console.warn('Error saving schedule to storage:', e);
    }

    // 2. Extract integration themes (QPAN, Môi trường, Năng lực số 3.1TC1a/4.1TC1a/6.1TC2a)
    const extracted = extractIntegrationFromPlan(rawTextOrHtml, targetWeek, rows);
    const baseTheme = getWeeklyIntegrationThemes(targetWeek);
    const mergedTheme: WeeklyIntegrationThemes = {
      ...baseTheme,
      ...extracted,
      week: targetWeek
    };
    setCustomWeeklyThemes(mergedTheme);
    try {
      localStorage.setItem(`gdtc_themes_w${targetWeek}`, JSON.stringify(mergedTheme));
      setAppStateDB(`gdtc_themes_w${targetWeek}`, mergedTheme);
    } catch (e) {
      console.warn('Error saving themes to storage:', e);
    }

    // 3. Propagate specific integration themes and titles into plansByGrade for all 3 grades
    setPlansByGrade((prev) => {
      const updated = prev.map((plan) => {
        const existingInteg = plan.integrations || {
          digitalSkill: 'Mã 4.1TC1a',
          digitalDescription: 'Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu.',
          lifeSkills: 'Rèn luyện tính kỷ luật và tinh thần đoàn kết.',
          environmentalEducation: 'Giữ vệ sinh sân bãi sạch sẽ.'
        };

        const matchingRow = rows.find((r) => r.grade === plan.grade && r.ppct === plan.lessonNum);
        const rowIntegText = matchingRow?.integrationNotes || '';
        const cleanRowInteg = rowIntegText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        // Extract specific digital code from matching row if present
        const codeMatch = cleanRowInteg.match(/(?:mã\s*)?([1-6]\.1TC\w+(?:\s*\/\s*[1-6]\.1TC\w+)?)/i) || mergedTheme.digitalTheme?.match(/[1-6]\.1TC\w+/i);
        const code = codeMatch ? (codeMatch[1].toUpperCase().startsWith('MÃ') ? codeMatch[1] : `Mã ${codeMatch[1]}`) : existingInteg.digitalSkill;

        // Extract digital description
        let digitalDesc = existingInteg.digitalDescription;
        if (/học liệu|ai|thiết bị số|phần mềm|quan sát phân tích/i.test(cleanRowInteg)) {
          digitalDesc = cleanRowInteg;
        } else if (mergedTheme.digitalTheme) {
          digitalDesc = mergedTheme.digitalTheme;
        }

        // Extract environmental description
        let envDesc = existingInteg.environmentalEducation;
        if (/môi trường|sân tập|xanh|sạch|đẹp|rác/i.test(cleanRowInteg)) {
          envDesc = cleanRowInteg;
        } else if (mergedTheme.envTheme) {
          envDesc = mergedTheme.envTheme;
        }

        // Extract life skills / QPAN description
        let lifeSkillsDesc = existingInteg.lifeSkills;
        if (/qpan|quốc phòng|kỷ luật|tác phong/i.test(cleanRowInteg)) {
          lifeSkillsDesc = cleanRowInteg;
        } else if (mergedTheme.qpanTheme || mergedTheme.lifeSkillsTheme) {
          lifeSkillsDesc = `${mergedTheme.qpanTheme || ''} ${mergedTheme.lifeSkillsTheme || ''}`.trim();
        }

        const updatedPlan: MasterPlanItem = {
          ...plan,
          title: matchingRow?.lessonTitle || plan.title,
          integrations: {
            ...existingInteg,
            digitalSkill: code,
            digitalDescription: digitalDesc,
            lifeSkills: lifeSkillsDesc,
            environmentalEducation: envDesc
          }
        };

        // Notify parent and update central dictionary
        if (onUpdateMasterPlanItem) {
          onUpdateMasterPlanItem(`k${plan.grade}_t${plan.lessonNum}`, updatedPlan);
          onUpdateMasterPlanItem(`k${plan.grade}_t${plan.lessonNum}_w${targetWeek}`, updatedPlan);
        }

        return updatedPlan;
      });

      // Save updated plans to localStorage & IndexedDB
      try {
        localStorage.setItem(`gdtc_plans_w${targetWeek}`, JSON.stringify(updated));
        setAppStateDB(`gdtc_plans_w${targetWeek}`, updated);
      } catch (e) {
        console.warn('Error saving plans to storage:', e);
      }

      recordHistory(updated);
      return updated;
    });

    setIsUploadPlanModalOpen(false);
    setPasteTableText('');
    showToast(
      `✅ Đã nạp ${rows.length} tiết giảng dạy Tuần ${targetWeek} và tự động trích xuất nội dung tích hợp (QPAN, Năng lực số, Môi trường) vào toàn bộ giáo án 3 khối!`
    );
  };

  // Upload Word (.docx) or Text file of weekly timetable
  const handleUploadWeeklyFile = async (file: File) => {
    setIsParsingFile(true);
    try {
      const fileName = file.name.toLowerCase();
      let content = '';

      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        content = result.value;
      } else {
        content = await file.text();
      }

      const parsed = parseUploadedWeeklyPlanTable(content);
      if (parsed.rows && parsed.rows.length > 0) {
        applyParsedWeeklySchedule(parsed.rows, parsed.week, parsed.dateRange, content);
      } else {
        showToast('⚠️ Không tìm thấy bảng thời khóa biểu trong file. Vui lòng dán trực tiếp bảng từ Word/Excel.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Lỗi đọc file: ' + (err.message || 'Chưa nhận diện được bảng'));
    } finally {
      setIsParsingFile(false);
    }
  };

  // Sync schedule with official PPCT
  const handleSyncScheduleWithPpct = (syncedRows: WeeklyMasterScheduleRow[]) => {
    setWeeklyScheduleRows(syncedRows);
    setPlansByGrade((prev) => {
      const updated = prev.map((p) => {
        const match = syncedRows.find((r) => r.grade === p.grade && r.ppct === p.lessonNum);
        if (match) {
          return {
            ...p,
            title: match.lessonTitle,
            rows: buildOfficialLessonRows(p.grade as 1 | 3 | 5, p.lessonNum, p.topic, match.lessonTitle)
          };
        }
        return p;
      });
      recordHistory(updated);
      return updated;
    });
  };


  // Builds standard 7-row official lesson structure with separated 3.1, 3.2, 3.3, 3.4 and balanced column heights (100-120 words for GV)
  const buildOfficialLessonRows = (
    gradeVal: 1 | 3 | 5,
    pNum: number,
    topicName: string,
    titleName: string,
    warmupGame?: string,
    practiceGame?: string
  ): LessonRow[] => {
    return createBalanced7LessonRows(gradeVal, titleName, images, warmupGame, practiceGame);
  };

  // Helper to resolve a grade's master plan
  const resolvePlan = (g: 1 | 3 | 5, pNum: number, fallbackKey: string): MasterPlanItem => {
    const key = `k${g}_t${pNum}`;
    const ppct = getGradePpctInfo(g, selectedWeek);
    const rule = getCurriculumRule(g, pNum, selectedWeek);

    const timetableMatch = weeklyScheduleRows.find((r) => r.grade === g && r.ppct === pNum);
    const resolvedTitle = timetableMatch?.lessonTitle || rule.cleanTitle || ppct.defaultTitle;
    const resolvedTopic = rule.topic || ppct.defaultTopic;

    // 1. Prioritize authentic plan for the active week
    let base: MasterPlanItem;
    if (selectedWeek === 9 && masterPlansTuan9[key]) {
      base = masterPlansTuan9[key];
    } else if (allMasterPlans?.[key]) {
      base = allMasterPlans[key];
    } else if (allMasterPlans?.[`${key}_w${selectedWeek}`]) {
      base = allMasterPlans[`${key}_w${selectedWeek}`];
    } else if (masterPlansTuan8[fallbackKey]) {
      base = masterPlansTuan8[fallbackKey];
    } else {
      base = masterPlansTuan8.k1_t15;
    }

    const normalized = normalizeMasterPlan(base);

    // 2. Strict Content Mismatch Check:
    // Does the base plan's content actually match resolvedTitle?
    const cleanBaseTitle = cleanLessonTitleForHeader(base.title || '').toLowerCase();
    const cleanResolvedTitle = cleanLessonTitleForHeader(resolvedTitle).toLowerCase();
    const isMismatched =
      (cleanBaseTitle !== cleanResolvedTitle &&
        !cleanBaseTitle.includes(cleanResolvedTitle.slice(0, 10)) &&
        !cleanResolvedTitle.includes(cleanBaseTitle.slice(0, 10))) ||
      (cleanResolvedTitle.includes('vươn thở') && normalized.specialCompetencies?.basicMovement?.toLowerCase().includes('đi đều')) ||
      (cleanResolvedTitle.includes('bụng') && normalized.specialCompetencies?.basicMovement?.toLowerCase().includes('đi đều'));

    let rawRows: LessonRow[];
    let specialComp = normalized.specialCompetencies;
    let generalComp = normalized.generalCompetencies;
    let qualitiesComp = normalized.qualities;

    if (isMismatched) {
      if (selectedWeek === 9 && masterPlansTuan9[key]) {
        const auth9 = masterPlansTuan9[key];
        rawRows = auth9.rows;
        specialComp = auth9.specialCompetencies;
        generalComp = auth9.generalCompetencies;
        qualitiesComp = auth9.qualities;
      } else {
        rawRows = buildOfficialLessonRows(g, pNum, resolvedTopic, resolvedTitle, rule.warmupGame, rule.practiceGame);
        specialComp = {
          healthCare: `Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập; thực hiện các yêu cầu an toàn trước, trong và sau khi tập luyện nội dung ${rule.movementName || resolvedTitle}.`,
          basicMovement: `Thực hiện được ${rule.movementName || resolvedTitle} theo hướng dẫn của GV; biết xử lí một số tình huống đơn giản trong tập luyện và trò chơi vận động.`,
          sportsCompetency: `Biết quan sát tranh ảnh SGK, video/học liệu số hoặc động tác mẫu của GV về ${rule.movementName || resolvedTitle}; biết tự điều chỉnh động tác khi luyện tập.`,
          disabledStudents: rule.disabledStudentsSpecial || 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
        };
      }
    } else {
      rawRows =
        normalized.rows && normalized.rows.length >= 5
          ? normalized.rows
          : buildOfficialLessonRows(g, pNum, resolvedTopic, resolvedTitle, rule.warmupGame, rule.practiceGame);
    }

    // Guarantee disabled students accommodations are never missing
    if (!specialComp?.disabledStudents || specialComp.disabledStudents.trim().length === 0) {
      specialComp = {
        ...specialComp,
        disabledStudents: rule.disabledStudentsSpecial || 'Giảm nhẹ các yêu cầu về năng lực đặc thù. Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập, giảm cường độ vận động, yêu cầu kỹ thuật động tác, thực hiện ở mức độ cơ bản. Giữ vệ sinh cá nhân và sân tập.'
      };
    }
    if (!generalComp?.disabledStudents || generalComp.disabledStudents.trim().length === 0) {
      generalComp = {
        ...generalComp,
        disabledStudents: rule.disabledStudentsGeneral || 'Giảm nhẹ các yêu cầu về năng lực chung. Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'
      };
    }

    const rows = rawRows.map((r, rIdx) => {
      // Row 0: Warmup game
      if (rIdx === 0) {
        const gameImg = resolveAccurateGameImage(rule.warmupGame, g, 'tro_choi_kd', images);
        let contentText = r.content || '';
        if (rule.warmupGame && !contentText.toLowerCase().includes(rule.warmupGame.toLowerCase())) {
          if (contentText.includes('1.3.')) {
            contentText = contentText.replace(/1\.3\..*$/m, `1.3. Trò chơi bổ trợ khởi động: "${rule.warmupGame}".`);
          } else {
            contentText = `${contentText}\n1.3. Trò chơi bổ trợ khởi động: "${rule.warmupGame}".`;
          }
        }
        let gvText = r.gv || '';
        let hsText = r.hs || '';
        if (rule.warmupGame) {
          gvText = gvText
            .replace(/trò chơi bổ trợ khởi động "[^"]*"/gi, `trò chơi bổ trợ khởi động "${rule.warmupGame}"`)
            .replace(/trò chơi khởi động "[^"]*"/gi, `trò chơi khởi động "${rule.warmupGame}"`);
          hsText = hsText
            .replace(/trò chơi khởi động "[^"]*"/gi, `trò chơi khởi động "${rule.warmupGame}"`)
            .replace(/trò chơi bổ trợ khởi động "[^"]*"/gi, `trò chơi bổ trợ khởi động "${rule.warmupGame}"`);
        }
        return {
          ...r,
          content: contentText,
          gv: gvText,
          hs: hsText,
          contentImgUrl: gameImg.url,
          contentImgTitle: gameImg.title
        };
      }

      // Row 1: Technical movement exploration row: ensure authentic textbook photo, never artificial SVG or mismatched movement
      if (rIdx === 1) {
        const acc = resolveAccurateMovement(r.content || '', resolvedTitle, g, images);
        const currentUrl = r.contentImgUrl || '';
        const cLower = (r.content || '').toLowerCase();
        const tLower = resolvedTitle.toLowerCase();
        const isWrongImage =
          !currentUrl ||
          currentUrl.startsWith('data:image/svg+xml') ||
          isMismatched ||
          (g === 5 && (tLower.includes('bụng') || cLower.includes('bụng')) && !currentUrl.includes('bung')) ||
          (g === 5 && (tLower.includes('vặn mình') || cLower.includes('vặn mình')) && !currentUrl.includes('van_minh')) ||
          (g === 5 && (tLower.includes('toàn thân') || cLower.includes('toàn thân')) && !currentUrl.includes('toan_than')) ||
          (g === 5 && (tLower.includes('chân') || cLower.includes('chân')) && !currentUrl.includes('chan')) ||
          (g === 1 && (tLower.includes('bụng') || cLower.includes('bụng')) && !currentUrl.includes('bung')) ||
          (g === 1 && (tLower.includes('chân') || cLower.includes('chân')) && !currentUrl.includes('chan'));

        if (isWrongImage) {
          return {
            ...r,
            contentImgUrl: acc.imgUrl,
            contentImgTitle: acc.imgTitle
          };
        }
      }

      // Row 5: Practice Game
      if (rIdx === 5 || (rawRows.length === 7 && rIdx === 5) || rIdx === rawRows.length - 2) {
        const gameImg = resolveAccurateGameImage(rule.practiceGame, g, 'tro_choi_vd', images);
        let contentText = r.content || '';
        if (contentText.includes('Kéo co thể thao')) {
          contentText = contentText.replace(/Kéo co thể thao/g, rule.practiceGame || 'Trao gậy tiếp sức');
        }
        if (rule.practiceGame && !contentText.toLowerCase().includes(rule.practiceGame.toLowerCase())) {
          if (contentText.includes('Trò chơi vận động:')) {
            contentText = contentText.replace(/\*?\s*Trò chơi vận động:[^\n]*/i, `* Trò chơi vận động: "${rule.practiceGame}": Tổ chức cho học sinh chơi theo luật.`);
          } else {
            contentText = `* Trò chơi vận động: "${rule.practiceGame}": Tổ chức cho học sinh chơi theo luật.\n${contentText}`;
          }
        }
        let gvText = r.gv || '';
        let hsText = r.hs || '';
        if (rule.practiceGame) {
          gvText = gvText
            .replace(/trò chơi vận động "[^"]*"/gi, `trò chơi vận động "${rule.practiceGame}"`)
            .replace(/trò chơi "[^"]*"/gi, `trò chơi "${rule.practiceGame}"`);
          hsText = hsText
            .replace(/trò chơi vận động "[^"]*"/gi, `trò chơi vận động "${rule.practiceGame}"`)
            .replace(/trò chơi "[^"]*"/gi, `trò chơi "${rule.practiceGame}"`);
        }
        if (g === 1) {
          contentText = contentText.replace(/4\s*gậy\/bóng\/cọc tiêu/gi, 'vạch xuất phát, cọc mốc an toàn');
          gvText = gvText.replace(/cất gậy và\s*/gi, '').replace(/4\s*gậy/gi, 'cọc mốc');
          hsText = hsText.replace(/cầm gậy/gi, 'chạy tiếp sức');
        }

        const currentGameUrl = r.contentImgUrl || '';
        const isWrongGameImg =
          !currentGameUrl ||
          currentGameUrl.startsWith('data:image/svg+xml') ||
          (g === 5 && (rule.practiceGame?.includes('Trao gậy') || contentText.includes('Trao gậy')) && !currentGameUrl.includes('trao_gay')) ||
          (g === 5 && currentGameUrl.includes('k1_tro_choi'));

        return {
          ...r,
          content: contentText,
          gv: gvText,
          hs: hsText,
          contentImgUrl: isWrongGameImg ? gameImg.url : (r.contentImgUrl || gameImg.url),
          contentImgTitle: isWrongGameImg ? gameImg.title : (r.contentImgTitle || gameImg.title)
        };
      }

      return r;
    });

    // Resolve integrations: Inherit from timetableMatch if available, or customWeeklyThemes, or normalized
    let resolvedIntegrations = normalized.integrations || {
      digitalSkill: 'Mã 4.1TC1a',
      digitalDescription: 'Học sinh biết sử dụng thiết bị số an toàn khi quan sát học liệu.',
      lifeSkills: 'Rèn luyện tính kỷ luật và tinh thần đoàn kết.',
      environmentalEducation: 'Giữ vệ sinh sân bãi sạch sẽ.'
    };

    if (timetableMatch && timetableMatch.integrationNotes) {
      const cleanInteg = timetableMatch.integrationNotes.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanInteg) {
        const codeMatch = cleanInteg.match(/(?:mã\s*)?([1-6]\.1TC\w+(?:\s*\/\s*[1-6]\.1TC\w+)?)/i);
        const code = codeMatch ? (codeMatch[1].toUpperCase().startsWith('MÃ') ? codeMatch[1] : `Mã ${codeMatch[1]}`) : resolvedIntegrations.digitalSkill;

        let dDesc = resolvedIntegrations.digitalDescription;
        let lSkills = resolvedIntegrations.lifeSkills;
        let envDesc = resolvedIntegrations.environmentalEducation;

        if (/học liệu|ai|thiết bị số|phần mềm|quan sát phân tích/i.test(cleanInteg)) {
          dDesc = cleanInteg;
        }
        if (/qpan|quốc phòng|kỷ luật|tác phong/i.test(cleanInteg)) {
          lSkills = cleanInteg;
        }
        if (/môi trường|sân tập|xanh|sạch|đẹp|rác/i.test(cleanInteg)) {
          envDesc = cleanInteg;
        }

        resolvedIntegrations = {
          digitalSkill: code,
          digitalDescription: dDesc,
          lifeSkills: lSkills,
          environmentalEducation: envDesc
        };
      }
    } else if (customWeeklyThemes) {
      const codeMatch = customWeeklyThemes.digitalTheme?.match(/[1-6]\.1TC\w+/i);
      resolvedIntegrations = {
        digitalSkill: codeMatch ? `Mã ${codeMatch[0]}` : resolvedIntegrations.digitalSkill,
        digitalDescription: customWeeklyThemes.digitalTheme || resolvedIntegrations.digitalDescription,
        lifeSkills: `${customWeeklyThemes.qpanTheme || ''} ${customWeeklyThemes.lifeSkillsTheme || ''}`.trim() || resolvedIntegrations.lifeSkills,
        environmentalEducation: customWeeklyThemes.envTheme || resolvedIntegrations.environmentalEducation
      };
    }

    return {
      ...normalized,
      id: `plan_k${g}_t${pNum}_w${selectedWeek}`,
      grade: g,
      week: selectedWeek,
      lessonNum: pNum,
      topic: resolvedTopic,
      title: resolvedTitle,
      dateRange: customDateRange,
      rows: rows,
      specialCompetencies: specialComp,
      generalCompetencies: generalComp,
      qualities: qualitiesComp,
      integrations: resolvedIntegrations,
      signatures: {
        locationDate: customApprovalDate,
        bgh: localSettings.approverPrincipal || 'Võ Thị Thuận',
        headTeacher: localSettings.approverHead || 'Bùi Ngọc Lâm',
        teacher: localSettings.teacherName || 'Lê Quốc Hưng'
      }
    };
  };

  // Re-build plans whenever selectedWeek or schedule rows change
  useEffect(() => {
    const list: MasterPlanItem[] = [
      resolvePlan(1, ppctG1.periods[0], 'k1_t15'),
      resolvePlan(1, ppctG1.periods[1], 'k1_t16'),
      resolvePlan(3, ppctG3.periods[0], 'k3_t15'),
      resolvePlan(3, ppctG3.periods[1], 'k3_t16'),
      resolvePlan(5, ppctG5.periods[0], 'k5_t15'),
      resolvePlan(5, ppctG5.periods[1], 'k5_t16'),
      resolvePlan(5, ppctG5.periods[2], 'k5_t17'),
    ];

    // Check if saved plans exist in localStorage for this week
    try {
      const savedPlans = localStorage.getItem(`gdtc_plans_w${selectedWeek}`);
      if (savedPlans) {
        const parsed = JSON.parse(savedPlans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((sp: MasterPlanItem) => {
            const matchIdx = list.findIndex((p) => p.grade === sp.grade && p.lessonNum === sp.lessonNum);
            if (matchIdx >= 0 && sp.integrations) {
              list[matchIdx] = {
                ...list[matchIdx],
                integrations: sp.integrations,
                title: sp.title || list[matchIdx].title
              };
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error merging saved plans from storage', e);
    }

    if (currentMasterPlan && currentMasterPlan.week === selectedWeek) {
      const idx = list.findIndex(
        (p) => p.grade === currentMasterPlan.grade && p.lessonNum === currentMasterPlan.lessonNum
      );
      if (idx >= 0) {
        // Only override if currentMasterPlan actually matches the lesson title of list[idx]
        const cleanCurr = cleanLessonTitleForHeader(currentMasterPlan.title || '').toLowerCase();
        const cleanTarget = cleanLessonTitleForHeader(list[idx].title || '').toLowerCase();
        if (cleanCurr === cleanTarget || cleanCurr.includes(cleanTarget.slice(0, 10)) || cleanTarget.includes(cleanCurr.slice(0, 10))) {
          list[idx] = {
            ...normalizeMasterPlan(currentMasterPlan),
            rows: lessonRows && lessonRows.length > 0 ? JSON.parse(JSON.stringify(lessonRows)) : currentMasterPlan.rows
          };
        }
      }
    }

    setPlansByGrade(list);
  }, [selectedWeek, weeklyScheduleRows, currentMasterPlan, lessonRows]);

  // Editable row handler
  const handlePlanRowChange = (planId: string, rowIndex: number, field: keyof LessonRow, value: any) => {
    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      const newRows = [...p.rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
      return { ...p, rows: newRows };
    });
    recordHistory(newPlans);
  };

  // Editable section handler (Yêu cầu cần đạt, Địa điểm...)
  const handlePlanSectionChange = (
    planId: string,
    section: 'specialCompetencies' | 'generalCompetencies' | 'qualities' | 'integrations' | 'locationEquipment',
    subField: string,
    value: string
  ) => {
    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        [section]: {
          ...(p[section] as any),
          [subField]: value
        }
      };
    });
    recordHistory(newPlans);
  };

  // Editable metadata handler
  const handlePlanMetaChange = (planId: string, field: 'topic' | 'title' | 'dateRange' | 'postLessonAdjustment', value: string) => {
    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      return { ...p, [field]: value };
    });
    recordHistory(newPlans);
  };

  // Schedule row change
  const handleScheduleRowChange = (rowId: string, field: keyof WeeklyMasterScheduleRow, value: any) => {
    setWeeklyScheduleRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Multi-diagram: Add diagram to a row
  const handleAddDiagramToRow = (planId: string, rowIndex: number, diag: FormationDiagram) => {
    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      const newRows = [...p.rows];
      const targetRow = newRows[rowIndex];

      const currentDiagrams: DiagramAttachment[] = targetRow.hsImages && targetRow.hsImages.length > 0
        ? [...targetRow.hsImages]
        : targetRow.hsImgUrl
        ? [{ id: 'diag_init', url: targetRow.hsImgUrl, title: targetRow.hsImgTitle || 'Sơ đồ đội hình' }]
        : [];

      currentDiagrams.push({
        id: `diag_${Date.now()}`,
        url: diag.svgDataUrl,
        title: diag.name
      });

      newRows[rowIndex] = {
        ...targetRow,
        hsImgUrl: currentDiagrams[0]?.url,
        hsImgTitle: currentDiagrams[0]?.title,
        hsImages: currentDiagrams
      };

      return { ...p, rows: newRows };
    });

    recordHistory(newPlans);
    showToast(`✨ Đã gắn sơ đồ "${diag.name}" vào Cột 4!`);
  };

  // Multi-diagram: Remove a diagram from a row
  const handleRemoveDiagram = (planId: string, rowIndex: number, diagramIndex: number) => {
    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      const newRows = [...p.rows];
      const targetRow = newRows[rowIndex];

      let currentDiagrams: DiagramAttachment[] = targetRow.hsImages && targetRow.hsImages.length > 0
        ? [...targetRow.hsImages]
        : targetRow.hsImgUrl
        ? [{ id: 'diag_init', url: targetRow.hsImgUrl, title: targetRow.hsImgTitle || 'Sơ đồ đội hình' }]
        : [];

      currentDiagrams = currentDiagrams.filter((_, idx) => idx !== diagramIndex);

      newRows[rowIndex] = {
        ...targetRow,
        hsImgUrl: currentDiagrams[0]?.url || undefined,
        hsImgTitle: currentDiagrams[0]?.title || undefined,
        hsImages: currentDiagrams
      };

      return { ...p, rows: newRows };
    });

    recordHistory(newPlans);
    showToast('Đã xóa sơ đồ khỏi cột hoạt động!');
  };

  // Inline Image Picker Modal State (for Column 1 Movement image)
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<{
    planId: string;
    rowIndex: number;
    col: 'content' | 'hs';
    searchQuery: string;
    grade?: number;
    lessonTitle?: string;
    rowName?: string;
    category?: ImageClassificationCategory;
  } | null>(null);

  const handleOpenPicker = (
    planId: string,
    rowIndex: number,
    col: 'content' | 'hs',
    query: string,
    forcedCategory?: ImageClassificationCategory
  ) => {
    const targetPlan = plansByGrade.find((p) => p.id === planId);
    let rowName = `Dòng ${rowIndex + 1}`;
    let autoCategory: ImageClassificationCategory = 'dong_tac';

    if (rowIndex === 0) {
      rowName = '1. Mở đầu & Khởi động (Trò chơi khởi động)';
      autoCategory = 'tro_choi_kd';
    } else if (rowIndex === 1) {
      rowName = '2. Khám phá & Làm quen động tác';
      autoCategory = 'dong_tac';
    } else if (rowIndex >= 2 && rowIndex <= 4) {
      rowName = '3. Luyện tập';
      autoCategory = 'luyen_tap';
    } else if (rowIndex === 5) {
      rowName = '3.4 Trò chơi vận động';
      autoCategory = 'tro_choi_vd';
    } else if (rowIndex === 6) {
      rowName = '4. Vận dụng';
      autoCategory = 'luyen_tap';
    }

    setPickerTarget({
      planId,
      rowIndex,
      col,
      searchQuery: query,
      grade: targetPlan?.grade,
      lessonTitle: targetPlan?.title,
      rowName,
      category: forcedCategory || autoCategory
    });
    setPickerOpen(true);
  };

  const handleAttachImage = (imgUrl: string, imgTitle: string) => {
    if (!pickerTarget) return;
    const { planId, rowIndex, col } = pickerTarget;

    const newPlans = plansByGrade.map((p) => {
      if (p.id !== planId) return p;
      const newRows = [...p.rows];
      if (col === 'content') {
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          contentImgUrl: imgUrl,
          contentImgTitle: imgTitle
        };
      } else {
        const currentDiagrams = newRows[rowIndex].hsImages && newRows[rowIndex].hsImages!.length > 0
          ? [...newRows[rowIndex].hsImages!]
          : newRows[rowIndex].hsImgUrl
          ? [{ id: 'diag_1', url: newRows[rowIndex].hsImgUrl!, title: newRows[rowIndex].hsImgTitle || 'Sơ đồ đội hình' }]
          : [];

        currentDiagrams.push({
          id: `diag_${Date.now()}`,
          url: imgUrl,
          title: imgTitle
        });

        newRows[rowIndex] = {
          ...newRows[rowIndex],
          hsImgUrl: currentDiagrams[0]?.url,
          hsImgTitle: currentDiagrams[0]?.title,
          hsImages: currentDiagrams
        };
      }
      return { ...p, rows: newRows };
    });

    recordHistory(newPlans);
    setPickerOpen(false);
    setPickerTarget(null);
    showToast(`Đã chèn hình ảnh: "${imgTitle}" vào bảng giáo án!`);
  };

  // Save current week plans to IndexedDB and update parent
  const handleSaveWeekPlans = async () => {
    // 1. Update parent dictionary
    plansByGrade.forEach((plan) => {
      const key = `k${plan.grade}_t${plan.lessonNum}`;
      if (onUpdateMasterPlanItem) {
        onUpdateMasterPlanItem(key, plan);
      }
    });

    // 2. Persist to IndexedDB
    try {
      await setAppStateDB('weekly_schedule_rows', weeklyScheduleRows);
      await setAppStateDB('school_settings', localSettings);
      await setAppStateDB('active_week', selectedWeek);
      await setAppStateDB('custom_date_range', customDateRange);
      await setAppStateDB('custom_approval_date', customApprovalDate);
      localStorage.setItem(`gdtc_dates_w${selectedWeek}`, JSON.stringify({
        dateRange: customDateRange,
        approvalDate: customApprovalDate
      }));

      if (plansByGrade.length > 0) {
        await setAppStateDB('master_plan', plansByGrade[0]);
        await setAppStateDB('current_lesson_rows', plansByGrade[0].rows);
      }

      const currentAll = await getAppStateDB<Record<string, MasterPlanItem>>('gdtc_all_master_plans', {});
      plansByGrade.forEach((plan) => {
        const key = `k${plan.grade}_t${plan.lessonNum}`;
        currentAll[key] = plan;
      });
      await setAppStateDB('gdtc_all_master_plans', currentAll);

      if (onUpdateSchoolSettings) {
        onUpdateSchoolSettings(localSettings);
      }

      if (onUpdateMasterPlan && plansByGrade.length > 0) {
        onUpdateMasterPlan(plansByGrade[0]);
      }

      setIsEditMode(false);
      showToast(`💾 Đã lưu thành công bộ giáo án 3 khối (K1, K3, K5) của Tuần ${selectedWeek} vào cơ sở dữ liệu!`);
    } catch (e) {
      console.error(e);
      showToast('Đã lưu dữ liệu vào phiên làm việc hiện tại!');
    }
  };

  // Print & Word Export Handlers
  const handlePrint = () => {
    showToast("💡 Mẹo lưu PDF: Khi hộp thoại in mở ra, tại mục 'Máy in đích' (Destination) chọn 'Lưu dưới dạng PDF' (Save as PDF) để tải file PDF trọn vẹn!");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleExportWord = async (forceJoint = false, format: 'doc' | 'docx' = 'doc') => {
    setIsExportingWord(true);
    showToast(`⏳ Đang nhúng hình ảnh PNG chuẩn và tạo file Word (.${format.toUpperCase()}) in trực tiếp...`);
    try {
      const isSingle = !forceJoint && viewMode !== 'all_grades';
      const plansToExport = isSingle
        ? plansByGrade.filter((p) => {
            if (viewMode === 'grade_1') return p.grade === 1;
            if (viewMode === 'grade_3') return p.grade === 3;
            if (viewMode === 'grade_5') return p.grade === 5;
            if (viewMode === 'single') return `k${p.grade}_t${p.lessonNum}` === selectedPlanKey;
            return true;
          })
        : plansByGrade;

      const singleGradeLabel =
        viewMode === 'grade_1'
          ? 'Khoi_1'
          : viewMode === 'grade_3'
          ? 'Khoi_3'
          : viewMode === 'grade_5'
          ? 'Khoi_5'
          : 'Tiet_Le';

      const filename = isSingle
        ? `KHDH_GDTC_Tuan_${selectedWeek}_${singleGradeLabel}.${format}`
        : `KHDH_GDTC_Tuan_${selectedWeek}_Ca_3_Khoi_1_3_5.${format}`;

      await exportCleanWordDocxFromData({
        plans: plansToExport,
        scheduleRows: isSingle ? undefined : weeklyScheduleRows,
        settings: localSettings,
        week: selectedWeek,
        includeSchedule: !isSingle,
        weeklyThemes,
        filename,
        format,
        approvalDate: customApprovalDate,
        dateRange: customDateRange,
        imageMaxHeightPt: Math.min(68, Math.round(imageHeight * 0.7))
      });

      showToast(`✅ Đã xuất file Word (.${format.toUpperCase()}): "${filename}"! Hình ảnh hiển thị 100%, sẵn sàng in trực tiếp.`);
    } catch (e) {
      console.error('Word export error:', e);
      exportWordDocument('print-document', `Giao_An_GDTC_Tuan_${selectedWeek}.doc`);
      showToast('Đã tải file Word dự phòng!');
    } finally {
      setIsExportingWord(false);
    }
  };

  // Helper to extract movement name for picker
  const extractRowMovementName = (row: LessonRow): string => {
    const lines = row.content.split('\n');
    for (const l of lines) {
      if (l.toLowerCase().includes('động tác') || l.toLowerCase().includes('học') || l.toLowerCase().includes('trò chơi')) {
        return l.replace(/^[*+\-–]\s*/, '').trim();
      }
    }
    return 'động tác thể dục';
  };

  // Filter plans to display based on viewMode
  const displayedPlans = plansByGrade.filter((p) => {
    if (viewMode === 'all_grades') return true;
    if (viewMode === 'grade_1') return p.grade === 1;
    if (viewMode === 'grade_3') return p.grade === 3;
    if (viewMode === 'grade_5') return p.grade === 5;
    if (viewMode === 'single') return `k${p.grade}_t${p.lessonNum}` === selectedPlanKey;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROL BAR & TOOLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        {/* Top Header & Actions */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Xem Trước & In Kế Hoạch Bài Dạy Chuẩn CV 5512
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GDPT 2018 · BGH
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Hỗ trợ chỉnh sửa tất cả các phần, chèn nhiều sơ đồ, lưu vĩnh viễn và xuất PDF giữ nguyên hình ảnh.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo Button */}
            {isEditMode && (
              <button
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-300"
                title="Hoàn tác thao tác chỉnh sửa vừa rồi"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Hoàn Tác (Undo)</span>
              </button>
            )}

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
                isEditMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đang Bật Chế Độ Sửa</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Chỉnh Sửa Giáo Án 3 Khối</span>
                </>
              )}
            </button>

            <button
              onClick={handleSplitAndBalanceAllPlans}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              title="Tách 3.1, 3.2, 3.3 thành từng ô riêng, cân bằng chiều cao ô Cột GV (100-120 từ) và gắn ảnh chuẩn 100%"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>⚡ Tách 3.1, 3.2, 3.3 & Cân Bằng Các Ô (100-120 Từ)</span>
            </button>


            <button
              onClick={handleSaveWeekPlans}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              title="Lưu toàn bộ chỉnh sửa của 3 khối vào cơ sở dữ liệu vĩnh viễn"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Bộ 3 Giáo Án Tuần {selectedWeek}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition"
              title="Lưu file PDF hoặc in giấy A4 giữ trọn hình ảnh và nội dung"
            >
              <Printer className="w-4 h-4" />
              <span>Lưu PDF / In A4</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleExportWord(false, 'doc')}
                disabled={isExportingWord}
                className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                title="Xuất file Word MHTML (.DOC) - Hỗ trợ mọi phiên bản Word, nhúng ảnh trực tiếp để in"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>
                  {isExportingWord
                    ? 'Đang xuất Word...'
                    : viewMode === 'all_grades'
                    ? 'Tải Word (.DOC)'
                    : `Tải K${viewMode.replace('grade_', '')} (.DOC)`}
                </span>
              </button>

              <button
                onClick={() => handleExportWord(false, 'docx')}
                disabled={isExportingWord}
                className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                title="Xuất file Word hiện đại (.DOCX) - Tương thích hoàn hảo Word 2013-365, hiển thị ảnh 100%"
              >
                <FileText className="w-4 h-4 text-sky-300" />
                <span>
                  {isExportingWord
                    ? '...'
                    : viewMode === 'all_grades'
                    ? 'Tải Word (.DOCX)'
                    : `Tải K${viewMode.replace('grade_', '')} (.DOCX)`}
                </span>
              </button>

              {viewMode !== 'all_grades' && (
                <button
                  onClick={() => handleExportWord(true, 'docx')}
                  disabled={isExportingWord}
                  className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                  title="Tải toàn bộ 3 khối (K1, K3, K5) và lịch dạy tuần chung thành file Word .DOCX"
                >
                  <span>+ Tải Cả 3 Khối (.DOCX)</span>
                </button>
              )}

              {onOpenGoogleDrive && (
                <button
                  onClick={onOpenGoogleDrive}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                  title="Mở Google Drive để lưu trữ và quản lý giáo án trực tuyến"
                >
                  <HardDrive className="w-4 h-4 text-amber-200" />
                  <span>Lưu vào Google Drive</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC WEEK SELECTOR, DATES & PPCT CONTROLS */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">Chọn Tuần Học:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} ({w <= 18 ? 'Học kỳ I' : 'Học kỳ II'})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Date Range Display / In-place Editor */}
            <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-500">Khoảng thời gian:</span>
              {isEditMode ? (
                <input
                  type="text"
                  value={customDateRange}
                  onChange={(e) => setCustomDateRange(e.target.value)}
                  className="font-bold text-slate-900 border-b border-blue-400 focus:outline-none text-xs w-64"
                />
              ) : (
                <span className="font-bold text-slate-900">{customDateRange}</span>
              )}
            </div>

            {/* Auto PPCT Display */}
            <div className="hidden lg:flex items-center gap-2 text-slate-600 text-[11px]">
              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                K1: {ppctG1.periodLabel}
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                K3: {ppctG3.periodLabel}
              </span>
              <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                K5: {ppctG5.periodLabel}
              </span>
            </div>
          </div>

          {/* Quick Buttons for Header, Upload Weekly Plan & PPCT Manager */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsUploadPlanModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition"
              title="Tải lên file Word (.docx) hoặc dán bảng thời khóa biểu tuần mới để tự động phân tích và trích xuất nội dung tích hợp vào giáo án 3 khối"
            >
              <Upload className="w-3.5 h-3.5 text-blue-200" />
              <span>Nạp File Kế Hoạch Tuần</span>
            </button>

            <button
              onClick={() => setIsPpctManagerOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition"
              title="Quản lý Phân phối chương trình cả 3 khối, đối chiếu và rà soát tiến độ tuần"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
              <span>PPCT 3 Khối & Rà Soát</span>
            </button>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition"
              title="Rà soát đối chiếu tên bài TKB vs Giáo án, động tác, trò chơi và năng lực giảm tải cho HS khuyết tật chuẩn SGK"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
              <span>Rà Soát & Đồng Bộ SGK</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${auditReport.allPassed ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'}`}>
                {auditReport.overallScore}%
              </span>
            </button>

            <button
              onClick={() => setIsHeaderEditorOpen(!isHeaderEditorOpen)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 flex items-center gap-1 transition"
            >
              <School className="w-3.5 h-3.5 text-slate-500" />
              <span>Sửa Header & Khối BGH</span>
            </button>
          </div>
        </div>

        {/* 3. EDITABLE HEADER & SIGNATURE DRAWER */}
        {isHeaderEditorOpen && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-blue-200 pb-2">
              <span className="font-bold text-blue-900 text-xs">
                🏛️ Chỉnh Sửa Thông Tin Hành Chính & Khối BGH Duyệt
              </span>
              <button
                onClick={() => setIsHeaderEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">TÊN TRƯỜNG:</label>
                <input
                  type="text"
                  value={localSettings.schoolName}
                  onChange={(e) => setLocalSettings({ ...localSettings, schoolName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">TỔ CHUYÊN MÔN:</label>
                <input
                  type="text"
                  value={localSettings.departmentName}
                  onChange={(e) => setLocalSettings({ ...localSettings, departmentName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">GIÁO VIÊN SOẠN:</label>
                <input
                  type="text"
                  value={localSettings.teacherName}
                  onChange={(e) => setLocalSettings({ ...localSettings, teacherName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">NĂM HỌC:</label>
                <input
                  type="text"
                  value={localSettings.schoolYear}
                  onChange={(e) => setLocalSettings({ ...localSettings, schoolYear: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-blue-200">
              <div>
                <label className="text-[10px] font-bold text-blue-900 block mb-1">BGH DUYỆT (HỌ TÊN):</label>
                <input
                  type="text"
                  value={localSettings.approverPrincipal || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, approverPrincipal: e.target.value })}
                  placeholder="Võ Thị Thuận"
                  className="w-full bg-white border border-blue-300 rounded p-1.5 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">TỔ TRƯỞNG CHUYÊN MÔN:</label>
                <input
                  type="text"
                  value={localSettings.approverHead || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, approverHead: e.target.value })}
                  placeholder="Bùi Ngọc Lâm"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">NGÀY THÁNG KÝ DUYỆT:</label>
                <input
                  type="text"
                  value={customApprovalDate}
                  onChange={(e) => setCustomApprovalDate(e.target.value)}
                  placeholder="Vệ Giang, ngày 06 tháng 11 năm 2026"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. VIEW MODES & TYPOGRAPHY SELECTORS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* View Modes */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('all_grades')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'all_grades' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Gộp Cả 3 Khối (Tuần {selectedWeek})</span>
            </button>
            <button
              onClick={() => setViewMode('grade_1')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                viewMode === 'grade_1' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối 1 ({ppctG1.periodLabel})
            </button>
            <button
              onClick={() => setViewMode('grade_3')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                viewMode === 'grade_3' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối 3 ({ppctG3.periodLabel})
            </button>
            <button
              onClick={() => setViewMode('grade_5')}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                viewMode === 'grade_5' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối 5 ({ppctG5.periodLabel})
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${
                viewMode === 'single' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tiết Lẻ</span>
            </button>
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Phông chữ:</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Roboto">Roboto</option>
                <option value="Calibri">Calibri</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Cỡ chữ:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
              >
                <option value="11pt">11pt (Nhỏ)</option>
                <option value="12pt">12pt (Chuẩn)</option>
                <option value="13pt">13pt (Vừa)</option>
                <option value="14pt">14pt (Lớn)</option>
              </select>
            </div>

            {/* Image Scaling Slider */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Cỡ ảnh: <strong>{imageHeight}px</strong></span>
              <input
                type="range"
                min="65"
                max="180"
                step="5"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseInt(e.target.value, 10))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setImageHeight(80)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${imageHeight === 80 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  Gọn (80px)
                </button>
                <button
                  onClick={() => setImageHeight(95)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${imageHeight === 95 ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'}`}
                  title="Kích thước chuẩn sau khi thầy đã căn chỉnh hoàn hảo trên file Word/PDF"
                >
                  ⭐ Chuẩn (95px)
                </button>
                <button
                  onClick={() => setImageHeight(115)}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${imageHeight === 115 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  Vừa (115px)
                </button>
              </div>
            </div>

            {/* Show Image Captions Toggle */}
            <label className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer select-none" title="Bật/Tắt ghi chú tên hình ảnh bên dưới khung ảnh (Mặc định: Tắt theo chuẩn SGK để giáo án sạch đẹp, tránh sai lệch)">
              <input
                type="checkbox"
                checked={showImageCaptions}
                onChange={(e) => setShowImageCaptions(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px]">Ghi chú dưới ảnh</span>
            </label>
          </div>
        </div>

        {/* Single Mode Lesson Selector Tabs */}
        {viewMode === 'single' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Chọn Tiết Cần Xem:</span>
            {plansByGrade.map((p) => {
              const key = `k${p.grade}_t${p.lessonNum}`;
              const isSelected = selectedPlanKey === key;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanKey(key)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Khối {p.grade} · Tiết {p.lessonNum} ({p.title.split('-')[0].trim().toUpperCase()})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. OFFICIAL A4 DOCUMENT CONTAINER */}
      <div
        id="print-document"
        className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto text-slate-900 leading-relaxed"
        style={{
          fontFamily: fontFamily,
          fontSize: fontSize
        }}
      >
        {/* TRANG ĐẦU: KẾ HOẠCH DẠY HỌC CHUNG CỦA TUẦN (MẪU KẾ HOẠCH 7 CỘT CHUẨN CỦA TRƯỜNG) */}
        {viewMode === 'all_grades' && (
          <div className="official-master-overview-page mb-10 print:break-after-page">


            {/* Title Trang Đầu */}
            <div className="text-center space-y-1 mb-6">
              <h1 className="font-extrabold text-base sm:text-lg uppercase tracking-wide text-slate-900">
                KẾ HOẠCH DẠY HỌC MÔN GIÁO DỤC THỂ CHẤT
              </h1>
              <p className="font-bold text-sm text-slate-900 uppercase">
                TUẦN {selectedWeek}
              </p>
              {isEditMode ? (
                <div className="flex justify-center items-center gap-2 py-0.5">
                  <span className="text-xs text-slate-500 font-medium">Thời gian:</span>
                  <input
                    type="text"
                    value={customDateRange}
                    onChange={(e) => setCustomDateRange(e.target.value)}
                    className="text-xs font-semibold p-1 border border-blue-400 rounded w-64 text-center bg-blue-50/50"
                  />
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-600 italic">
                  ({customDateRange})
                </p>
              )}
              {isEditMode ? (
                <div className="flex justify-center items-center gap-3 text-xs pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Giáo viên:</span>
                    <input
                      type="text"
                      value={localSettings.teacherName || 'LÊ QUỐC HƯNG'}
                      onChange={(e) => setLocalSettings({ ...localSettings, teacherName: e.target.value })}
                      className="p-1 border border-blue-400 rounded w-36 text-center font-bold bg-blue-50/50"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Năm học:</span>
                    <input
                      type="text"
                      value={localSettings.schoolYear || '2026 - 2027'}
                      onChange={(e) => setLocalSettings({ ...localSettings, schoolYear: e.target.value })}
                      className="p-1 border border-blue-400 rounded w-28 text-center font-bold bg-blue-50/50"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-600 pt-1">
                  Giáo viên phụ trách: <strong>{localSettings.teacherName || 'LÊ QUỐC HƯNG'}</strong> · Năm học: <strong>{localSettings.schoolYear || '2026 - 2027'}</strong>
                </p>
              )}
            </div>

            {/* ACTION TOOLBAR SPECIFIC TO WEEKLY PLAN & PPCT AUDIT */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-xl border border-blue-200 no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Bảng 16 Tiết Giảng Dạy Tuần {selectedWeek} (Khối 1, 3, 5):
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Tự động đồng bộ với giáo án 3 khối
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsUploadPlanModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
                  title="Tải tệp Word (.docx) hoặc dán bảng thời khóa biểu tuần mới để tự động phân tích và trích xuất nội dung tích hợp vào giáo án 3 khối"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-200" />
                  <span>📥 Nạp File Kế Hoạch Tuần & Tích Hợp</span>
                </button>
                <button
                  onClick={() => setIsPpctManagerOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
                  title="Quản lý Phân phối chương trình cả 3 khối, đối chiếu và rà soát tiến độ tuần"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                  <span>📊 Rà Soát & Đối Chiếu PPCT 3 Khối</span>
                </button>
              </div>
            </div>

            {/* BẢNG KẾ HOẠCH 7 CỘT CHUẨN MẪU BỘ GIÁO ÁN 3 KHỐI CHUNG */}
            <div className="space-y-2 mb-6">
              <table className="w-full border-collapse border border-slate-600 text-xs mt-2">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-600 text-center">
                    <th className="border border-slate-600 p-2 w-[11%]">Thứ</th>
                    <th className="border border-slate-600 p-1 w-[6%]">Tiết</th>
                    <th className="border border-slate-600 p-1.5 w-[7%]">Lớp</th>
                    <th className="border border-slate-600 p-2 w-[31%]">Bài học</th>
                    <th className="border border-slate-600 p-1 w-[6%]">PPCT</th>
                    <th className="border border-slate-600 p-2 w-[27%]">ND Tích hợp/điều chỉnh</th>
                    <th className="border border-slate-600 p-2 w-[12%]">ĐDDH</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyScheduleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      {/* Thứ */}
                      <td className="border border-slate-600 p-1.5 text-center font-bold align-top">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={row.dayOfWeek}
                            onChange={(e) => handleScheduleRowChange(row.id, 'dayOfWeek', e.target.value)}
                            className="w-full text-center text-xs p-1 border border-blue-300 rounded font-bold"
                          />
                        ) : (
                          row.dayOfWeek
                        )}
                      </td>

                      {/* Tiết */}
                      <td className="border border-slate-600 p-1 text-center font-semibold align-top">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={row.period}
                            onChange={(e) => handleScheduleRowChange(row.id, 'period', parseInt(e.target.value, 10))}
                            className="w-full text-center text-xs p-1 border border-blue-300 rounded"
                          />
                        ) : (
                          row.period
                        )}
                      </td>

                      {/* Lớp */}
                      <td className="border border-slate-600 p-1.5 text-center font-bold text-slate-800 align-top">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={row.className}
                            onChange={(e) => handleScheduleRowChange(row.id, 'className', e.target.value)}
                            className="w-full text-center text-xs p-1 border border-blue-300 rounded font-bold"
                          />
                        ) : (
                          row.className
                        )}
                      </td>

                      {/* Bài học */}
                      <td className="border border-slate-600 p-2 align-top font-medium leading-relaxed">
                        {isEditMode ? (
                          <textarea
                            value={row.lessonTitle}
                            onChange={(e) => handleScheduleRowChange(row.id, 'lessonTitle', e.target.value)}
                            rows={2}
                            className="w-full p-1 text-xs border border-blue-300 rounded"
                          />
                        ) : (
                          row.lessonTitle
                        )}
                      </td>

                      {/* PPCT */}
                      <td className="border border-slate-600 p-1 text-center font-bold text-blue-900 align-top">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={row.ppct}
                            onChange={(e) => handleScheduleRowChange(row.id, 'ppct', parseInt(e.target.value, 10))}
                            className="w-full text-center text-xs p-1 border border-blue-300 rounded font-bold"
                          />
                        ) : (
                          row.ppct
                        )}
                      </td>

                      {/* ND Tích hợp / điều chỉnh */}
                      <td className="border border-slate-600 p-2 align-top leading-relaxed text-slate-700 text-[11px]">
                        {isEditMode ? (
                          <textarea
                            value={row.integrationNotes}
                            onChange={(e) => handleScheduleRowChange(row.id, 'integrationNotes', e.target.value)}
                            rows={3}
                            className="w-full p-1 text-xs border border-blue-300 rounded"
                          />
                        ) : (
                          <div className="whitespace-pre-line">{row.integrationNotes}</div>
                        )}
                      </td>

                      {/* ĐDDH */}
                      <td className="border border-slate-600 p-2 align-top text-center text-slate-700 text-[11px]">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={row.equipment}
                            onChange={(e) => handleScheduleRowChange(row.id, 'equipment', e.target.value)}
                            className="w-full text-center text-xs p-1 border border-blue-300 rounded"
                          />
                        ) : (
                          row.equipment
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CÁC BÀI DẠY CHI TIẾT THEO TỪNG TIẾT */}
        {displayedPlans.map((plan, planIdx) => {
          const isSingle = viewMode === 'single';
          return (
            <div key={plan.id} className="official-lesson-page mb-12 print:mb-0 print:break-after-page">


              {/* Title Section - In HOA, KHÔNG gạch ngang dưới tiêu đề */}
              <div className="text-center space-y-1.5 mb-6">
                <h2 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-slate-900">
                  KẾ HOẠCH BÀI DẠY TUẦN {plan.week} – KHỐI {plan.grade}
                </h2>
                {isEditMode ? (
                  <div className="flex justify-center items-center gap-2 py-0.5">
                    <span className="text-xs text-slate-500 font-medium">Thời gian:</span>
                    <input
                      type="text"
                      value={plan.dateRange}
                      onChange={(e) => handlePlanMetaChange(plan.id, 'dateRange', e.target.value)}
                      className="text-xs font-semibold p-1 border border-blue-400 rounded w-60 text-center bg-blue-50/50"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] font-semibold text-slate-600 italic">
                    ({plan.dateRange})
                  </p>
                )}
                <div className="pt-1.5">
                  {isEditMode ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xs text-slate-500">Chủ đề:</span>
                        <input
                          type="text"
                          value={plan.topic}
                          onChange={(e) => handlePlanMetaChange(plan.id, 'topic', e.target.value)}
                          className="font-bold uppercase text-xs text-blue-900 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-300 text-center w-80"
                        />
                      </div>
                      <input
                        type="text"
                        value={plan.title}
                        onChange={(e) => handlePlanMetaChange(plan.id, 'title', e.target.value)}
                        className="w-full text-center font-extrabold text-sm text-slate-900 uppercase focus:outline-none p-1 border border-blue-300 rounded bg-blue-50/50"
                        title="Sửa tên bài học"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold uppercase text-xs tracking-wider text-blue-900">
                        {cleanTopicForDisplay(plan.topic, plan.grade)}&nbsp;&nbsp;&nbsp;&nbsp;TIẾT {plan.lessonNum}
                      </p>
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                        {cleanLessonTitleForHeader(plan.title).toUpperCase()}
                      </h3>
                    </div>
                  )}
                </div>
              </div>

              {/* I. YÊU CẦU CẦN ĐẠT - Chi tiết đầy đủ các năng lực và giảm tải cho HS khuyết tật */}
              <div className="space-y-2 mb-5">
                <h4 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 text-slate-800">
                  I. YÊU CẦU CẦN ĐẠT
                </h4>
                {isEditMode ? (
                  <div className="pl-2 space-y-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="font-bold text-slate-800 block mb-0.5">1. Năng lực đặc thù:</label>
                      <div className="space-y-1.5 pl-2">
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Chăm sóc sức khỏe:</span>
                          <textarea
                            value={plan.specialCompetencies.healthCare}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'specialCompetencies', 'healthCare', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Vận động cơ bản:</span>
                          <textarea
                            value={plan.specialCompetencies.basicMovement}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'specialCompetencies', 'basicMovement', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Thể dục thể thao:</span>
                          <textarea
                            value={plan.specialCompetencies.sportsCompetency || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'specialCompetencies', 'sportsCompetency', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-amber-800 font-semibold block">* Giảm tải cho Học sinh khuyết tật:</span>
                          <textarea
                            value={plan.specialCompetencies.disabledStudents || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'specialCompetencies', 'disabledStudents', e.target.value)}
                            rows={2}
                            className="w-full p-1 border border-amber-300 rounded text-xs bg-amber-50/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-0.5">2. Năng lực chung:</label>
                      <div className="space-y-1.5 pl-2">
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Tự chủ và tự học:</span>
                          <textarea
                            value={plan.generalCompetencies.autonomy}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'generalCompetencies', 'autonomy', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Giao tiếp và hợp tác:</span>
                          <textarea
                            value={plan.generalCompetencies.collaboration}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'generalCompetencies', 'collaboration', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Giải quyết vấn đề & sáng tạo:</span>
                          <textarea
                            value={plan.generalCompetencies.problemSolving || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'generalCompetencies', 'problemSolving', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-amber-800 font-semibold block">* Giảm tải cho Học sinh khuyết tật:</span>
                          <textarea
                            value={plan.generalCompetencies.disabledStudents || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'generalCompetencies', 'disabledStudents', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-amber-300 rounded text-xs bg-amber-50/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-0.5">3. Phẩm chất:</label>
                      <div className="space-y-1.5 pl-2">
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Chăm chỉ:</span>
                          <textarea
                            value={plan.qualities.diligence}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'qualities', 'diligence', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Trung thực:</span>
                          <textarea
                            value={plan.qualities.honesty || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'qualities', 'honesty', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-600 block">- Trách nhiệm, nhân ái:</span>
                          <textarea
                            value={plan.qualities.responsibility}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'qualities', 'responsibility', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-blue-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-amber-800 font-semibold block">* Giảm tải cho Học sinh khuyết tật:</span>
                          <textarea
                            value={plan.qualities.disabledStudents || ''}
                            onChange={(e) => handlePlanSectionChange(plan.id, 'qualities', 'disabledStudents', e.target.value)}
                            rows={1}
                            className="w-full p-1 border border-amber-300 rounded text-xs bg-amber-50/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-0.5">4. Tích hợp liên môn:</label>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={plan.integrations.digitalSkill}
                          onChange={(e) => handlePlanSectionChange(plan.id, 'integrations', 'digitalSkill', e.target.value)}
                          placeholder="Mã số"
                          className="p-1 border border-blue-300 rounded text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={plan.integrations.digitalDescription}
                          onChange={(e) => handlePlanSectionChange(plan.id, 'integrations', 'digitalDescription', e.target.value)}
                          placeholder="Mô tả tích hợp"
                          className="col-span-3 p-1 border border-blue-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pl-3 space-y-2 text-xs text-slate-700 leading-relaxed">
                    <div>
                      <p className="font-bold text-slate-900">1. Năng lực đặc thù:</p>
                      <ul className="pl-4 space-y-0.5 mt-0.5 list-none">
                        <li>
                          <span className="font-semibold text-slate-800">- Năng lực chăm sóc sức khỏe:</span>{' '}
                          {plan.specialCompetencies?.healthCare || 'Biết chuẩn bị trang phục, giày tập, vệ sinh sân tập và thực hiện các yêu cầu an toàn trước, trong, sau khi tập luyện.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Năng lực vận động cơ bản:</span>{' '}
                          {plan.specialCompetencies?.basicMovement || 'Thực hiện được động tác theo khẩu lệnh và biết giữ khoảng cách an toàn khi thực hiện.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Năng lực thể dục thể thao:</span>{' '}
                          {plan.specialCompetencies?.sportsCompetency || 'Biết quan sát tranh ảnh SGK, học liệu số/video minh họa hoặc động tác mẫu của GV; biết tự điều chỉnh động tác khi luyện tập.'}
                        </li>
                        <li className="text-amber-900 font-medium italic pt-0.5">
                          <span>* Học sinh khuyết tật:</span>{' '}
                          <span className="font-normal">{plan.specialCompetencies?.disabledStudents || 'Tuỳ tình hình của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập. Có thể giao những việc mà học sinh thích thú như bắt, tập theo các động tác của GV một cách đơn giản nhất. Tham gia các trò chơi cùng bạn.'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">2. Năng lực chung:</p>
                      <ul className="pl-4 space-y-0.5 mt-0.5 list-none">
                        <li>
                          <span className="font-semibold text-slate-800">- Tự chủ và tự học:</span>{' '}
                          {plan.generalCompetencies?.autonomy || 'Chủ động chuẩn bị SGK, trang phục, dụng cụ cá nhân; lắng nghe hướng dẫn, tự giác luyện tập và tự điều chỉnh lỗi sai.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Giao tiếp và hợp tác:</span>{' '}
                          {plan.generalCompetencies?.collaboration || 'Biết phối hợp với bạn, tổ/nhóm; chấp hành phân công, hỗ trợ bạn trong quá trình tập luyện và tham gia trò chơi.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Giải quyết vấn đề và sáng tạo:</span>{' '}
                          {plan.generalCompetencies?.problemSolving || 'Biết quan sát, nhận xét tình huống vận động đơn giản; phát hiện lỗi sai thường gặp và lựa chọn cách thực hiện an toàn, phù hợp.'}
                        </li>
                        <li className="text-amber-900 font-medium italic pt-0.5">
                          <span>* Học sinh khuyết tật:</span>{' '}
                          <span className="font-normal">{plan.generalCompetencies?.disabledStudents || 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">3. Phẩm chất:</p>
                      <ul className="pl-4 space-y-0.5 mt-0.5 list-none">
                        <li>
                          <span className="font-semibold text-slate-800">- Chăm chỉ:</span>{' '}
                          {plan.qualities?.diligence || 'Tích cực, tự giác trong tập luyện, hoạt động tập thể và rèn luyện thể dục thể thao hằng ngày.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Trung thực:</span>{' '}
                          {plan.qualities?.honesty || 'Thực hiện đúng luật chơi, đúng hiệu lệnh; nhận xét kết quả luyện tập của bản thân và bạn một cách trung thực.'}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Trách nhiệm, nhân ái:</span>{' '}
                          {plan.qualities?.responsibility || 'Có trách nhiệm bảo đảm an toàn cho bản thân và bạn; đoàn kết, tôn trọng, giúp đỡ bạn khi luyện tập.'}
                        </li>
                        <li className="text-amber-900 font-medium italic pt-0.5">
                          <span>* Học sinh khuyết tật:</span>{' '}
                          <span className="font-normal">{plan.qualities?.disabledStudents || 'Tuỳ tình hình tiến bộ của HS mà GV linh hoạt áp dụng với tinh thần học hoà nhập.'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">4. Tích hợp liên môn:</p>
                      <ul className="pl-4 space-y-0.5 mt-0.5 list-none">
                        <li>
                          <span className="font-semibold text-slate-800">- Năng lực số (Mã {plan.integrations.digitalSkill}):</span>{' '}
                          {plan.integrations.digitalDescription}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Quốc phòng và An ninh (QPAN):</span>{' '}
                          {weeklyThemes.qpanTheme}
                        </li>
                        <li>
                          <span className="font-semibold text-slate-800">- Kỹ năng sống & An toàn:</span>{' '}
                          {plan.integrations.lifeSkills || 'GV hướng dẫn HS kiên trì, chờ đến lượt, phối hợp, nhận xét bạn bằng lời tích cực và chủ động báo khi cơ thể mệt hoặc khó chịu.'}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* II. ĐỊA ĐIỂM – PHƯƠNG TIỆN */}
              <div className="space-y-1.5 mb-5">
                <h4 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 text-slate-800">
                  II. ĐỊA ĐIỂM – PHƯƠNG TIỆN
                </h4>
                {isEditMode ? (
                  <div className="pl-2 space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-36 shrink-0">• Địa điểm:</span>
                      <input
                        type="text"
                        value={plan.locationEquipment.location}
                        onChange={(e) => handlePlanSectionChange(plan.id, 'locationEquipment', 'location', e.target.value)}
                        className="flex-1 p-1 border border-blue-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-36 shrink-0">• Giáo viên chuẩn bị:</span>
                      <input
                        type="text"
                        value={plan.locationEquipment.teacherTools}
                        onChange={(e) => handlePlanSectionChange(plan.id, 'locationEquipment', 'teacherTools', e.target.value)}
                        className="flex-1 p-1 border border-blue-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-36 shrink-0">• Học sinh chuẩn bị:</span>
                      <input
                        type="text"
                        value={plan.locationEquipment.studentTools}
                        onChange={(e) => handlePlanSectionChange(plan.id, 'locationEquipment', 'studentTools', e.target.value)}
                        className="flex-1 p-1 border border-blue-300 rounded text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pl-3 space-y-1 text-xs text-slate-700">
                    <p>- <strong>Địa điểm:</strong> {plan.locationEquipment.location}</p>
                    <p>- <strong>Giáo viên chuẩn bị:</strong> {plan.locationEquipment.teacherTools}</p>
                    <p>- <strong>Học sinh chuẩn bị:</strong> {plan.locationEquipment.studentTools}</p>
                  </div>
                )}
              </div>

              {/* III. TIẾN TRÌNH DẠY HỌC - BẢNG 4 CỘT CHUẨN MẪU */}
              <div className="space-y-2 mb-6">
                <h4 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 text-slate-800">
                  III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
                </h4>

                <table className="w-full border-collapse border border-slate-400 text-xs mt-2">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                      <th className="border border-slate-400 p-2 text-center w-[27%]">Nội Dung / Kỹ Thuật Động Tác</th>
                      <th className="border border-slate-400 p-1 text-center w-[7%]">LVĐ</th>
                      <th className="border border-slate-400 p-2 text-center w-[33%]">Hoạt Động Của Giáo Viên</th>
                      <th className="border border-slate-400 p-2 text-center w-[33%]">Hoạt Động Của Học Sinh / Sơ Đồ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.map((row, rowIdx) => {
                      const movementName = extractRowMovementName(row);
                      // Gather all diagrams for Column 4
                      const displayedDiagrams: DiagramAttachment[] = (row.hsImages && row.hsImages.length > 0)
                        ? row.hsImages
                        : row.hsImgUrl
                        ? [{ id: 'diag_init', url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ đội hình' }]
                        : [];

                      return (
                        <tr key={rowIdx} className="hover:bg-slate-50/50">
                          {/* Cột 1: Nội Dung */}
                          <td className="border border-slate-400 p-2 align-top font-medium leading-relaxed">
                            {isEditMode ? (
                              <>
                                <textarea
                                  value={row.content}
                                  onChange={(e) => handlePlanRowChange(plan.id, rowIdx, 'content', e.target.value)}
                                  rows={5}
                                  className="w-full p-1.5 text-xs border border-blue-300 rounded font-sans focus:outline-none"
                                />
                                {row.contentImgUrl ? (
                                  <div className="mt-2 p-1 bg-slate-50 rounded border border-slate-200 text-center relative group">
                                    <img
                                      src={row.contentImgUrl}
                                      alt={row.contentImgTitle || 'Ảnh động tác'}
                                      style={{ maxHeight: `${imageHeight}px` }}
                                      className="w-auto mx-auto object-contain rounded"
                                    />
                                    {showImageCaptions && row.contentImgTitle && (
                                      <p className="text-[10px] text-slate-600 italic mt-0.5">
                                        {row.contentImgTitle}
                                      </p>
                                    )}
                                    <button
                                      onClick={() => handleOpenPicker(
                                        plan.id,
                                        rowIdx,
                                        'content',
                                        rowIdx === 0 ? 'khởi động' : rowIdx === 5 ? 'trò chơi' : movementName,
                                        rowIdx === 0 ? 'tro_choi_kd' : rowIdx === 5 ? 'tro_choi_vd' : rowIdx === 1 ? 'dong_tac' : 'luyen_tap'
                                      )}
                                      className={`no-print mt-1 text-[10px] underline font-semibold block mx-auto ${
                                        rowIdx === 0 ? 'text-amber-700 hover:text-amber-900' : rowIdx === 5 ? 'text-purple-700 hover:text-purple-900' : 'text-blue-600 hover:text-blue-800'
                                      }`}
                                    >
                                      {rowIdx === 0 ? 'Đổi ảnh trò chơi khởi động' : rowIdx === 5 ? 'Đổi ảnh trò chơi vận động' : 'Đổi ảnh động tác'}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleOpenPicker(
                                      plan.id,
                                      rowIdx,
                                      'content',
                                      rowIdx === 0 ? 'khởi động' : rowIdx === 5 ? 'trò chơi' : movementName,
                                      rowIdx === 0 ? 'tro_choi_kd' : rowIdx === 5 ? 'tro_choi_vd' : rowIdx === 1 ? 'dong_tac' : 'luyen_tap'
                                    )}
                                    className={`w-full mt-2 px-2 py-1 border rounded text-[10px] font-semibold flex items-center justify-center gap-1 no-print transition ${
                                      rowIdx === 0
                                        ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800'
                                        : rowIdx === 5
                                        ? 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800'
                                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    <FolderOpen className="w-3 h-3" />
                                    {rowIdx === 0 ? 'Chèn ảnh trò chơi khởi động' : rowIdx === 5 ? 'Chèn ảnh trò chơi vận động' : 'Chèn ảnh động tác'}
                                  </button>
                                )}
                              </>
                            ) : (
                              (() => {
                                const lines = row.content.split('\n');
                                const ttcbIdx = lines.findIndex((l) => l.toLowerCase().includes('ttcb') || l.toLowerCase().includes('đứng nghiêm') || l.toLowerCase().includes('chuẩn bị'));
                                const nhip1Idx = lines.findIndex((l) => l.toLowerCase().includes('nhịp 1'));

                                const imgElement = row.contentImgUrl ? (
                                  <div className="my-2 p-1 bg-slate-50 rounded border border-slate-200 text-center">
                                    <img
                                      src={row.contentImgUrl}
                                      alt={row.contentImgTitle || 'Ảnh động tác'}
                                      style={{ maxHeight: `${imageHeight}px` }}
                                      className="w-auto mx-auto object-contain rounded"
                                    />
                                    {showImageCaptions && row.contentImgTitle && (
                                      <p className="text-[10px] text-slate-600 italic mt-0.5">
                                        {row.contentImgTitle}
                                      </p>
                                    )}
                                  </div>
                                ) : null;

                                if (imgElement && ttcbIdx >= 0 && ttcbIdx < lines.length - 1) {
                                  return (
                                    <div>
                                      <div className="whitespace-pre-line">{lines.slice(0, ttcbIdx + 1).join('\n')}</div>
                                      {imgElement}
                                      <div className="whitespace-pre-line">{lines.slice(ttcbIdx + 1).join('\n')}</div>
                                    </div>
                                  );
                                }

                                if (imgElement && nhip1Idx > 0) {
                                  return (
                                    <div>
                                      <div className="whitespace-pre-line">{lines.slice(0, nhip1Idx).join('\n')}</div>
                                      {imgElement}
                                      <div className="whitespace-pre-line">{lines.slice(nhip1Idx).join('\n')}</div>
                                    </div>
                                  );
                                }

                                return (
                                  <div>
                                    <div className="whitespace-pre-line">{row.content}</div>
                                    {imgElement}
                                  </div>
                                );
                              })()
                            )}
                          </td>

                          {/* Cột 2: LVĐ */}
                          <td className="border border-slate-400 p-1.5 align-top text-center font-semibold text-slate-800">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={row.lvd}
                                onChange={(e) => handlePlanRowChange(plan.id, rowIdx, 'lvd', e.target.value)}
                                className="w-full text-center p-1 text-xs border border-blue-300 rounded focus:outline-none"
                              />
                            ) : (
                              <div className="whitespace-pre-line">{row.lvd}</div>
                            )}
                          </td>

                          {/* Cột 3: Hoạt Động GV */}
                          <td className="border border-slate-400 p-2 align-top leading-relaxed text-slate-800">
                            {isEditMode ? (
                              <textarea
                                value={row.gv}
                                onChange={(e) => handlePlanRowChange(plan.id, rowIdx, 'gv', e.target.value)}
                                rows={5}
                                className="w-full p-1.5 text-xs border border-blue-300 rounded font-sans focus:outline-none"
                              />
                            ) : (
                              <div className="whitespace-pre-line">{row.gv}</div>
                            )}
                          </td>

                          {/* Cột 4: Hoạt Động HS & NHIỀU SƠ ĐỒ ĐỘI HÌNH */}
                          <td className="border border-slate-400 p-2 align-top leading-relaxed text-slate-800">
                            {isEditMode ? (
                              <textarea
                                value={row.hs}
                                onChange={(e) => handlePlanRowChange(plan.id, rowIdx, 'hs', e.target.value)}
                                rows={4}
                                className="w-full p-1.5 text-xs border border-blue-300 rounded font-sans focus:outline-none"
                              />
                            ) : (
                              <div className="whitespace-pre-line">{row.hs}</div>
                            )}

                            {/* Render Multi-Diagrams in Column 4 */}
                            {displayedDiagrams.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <div className={`grid ${displayedDiagrams.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                                  {displayedDiagrams.map((diag, diagIdx) => (
                                    <div
                                      key={`${diag.id || 'diag'}_${diagIdx}`}
                                      className="p-1 bg-slate-50 rounded border border-slate-200 text-center relative group"
                                    >
                                      <img
                                        src={diag.url}
                                        alt={diag.title || 'Sơ đồ'}
                                        style={{ maxHeight: `${imageHeight}px` }}
                                        className="w-auto mx-auto object-contain rounded bg-white shadow-2xs"
                                      />
                                      {diag.title && (
                                        <p className="text-[9.5px] text-slate-700 font-semibold mt-0.5 truncate" title={diag.title}>
                                          {diag.title}
                                        </p>
                                      )}
                                      {isEditMode && (
                                        <button
                                          onClick={() => handleRemoveDiagram(plan.id, rowIdx, diagIdx)}
                                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded text-[10px] shadow-xs no-print transition"
                                          title="Xóa sơ đồ này"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {isEditMode && (
                                  <button
                                    onClick={() => {
                                      setFormationTarget({ planId: plan.id, rowIndex: rowIdx });
                                      setIsFormationPickerOpen(true);
                                    }}
                                    className="w-full py-1 px-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded text-[10.5px] font-bold flex items-center justify-center gap-1 no-print transition"
                                    title="Chèn thêm sơ đồ tập đồng loạt, tổ nhóm, cặp đôi hoặc cá nhân vào dòng này"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                    <span>+ Thêm Sơ Đồ Khác (Đồng loạt / Tổ / Cặp / Cá nhân)</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {/* When no diagram attached yet */}
                            {displayedDiagrams.length === 0 && isEditMode && (
                              <button
                                onClick={() => {
                                  setFormationTarget({ planId: plan.id, rowIndex: rowIdx });
                                  setIsFormationPickerOpen(true);
                                }}
                                className="w-full mt-2 py-1 px-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 rounded text-[10.5px] font-bold flex items-center justify-center gap-1 no-print transition"
                              >
                                <Compass className="w-3.5 h-3.5 text-purple-600" />
                                <span>+ Chèn Sơ Đồ Đội Hình (Cột 4)</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* IV. ĐIỀU CHỈNH SAU BÀI DẠY */}
              <div className="space-y-1.5 mb-6">
                <h4 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 text-slate-800">
                  IV. ĐIỀU CHỈNH SAU BÀI DẠY
                </h4>
                {isEditMode ? (
                  <textarea
                    value={plan.postLessonAdjustment || ''}
                    onChange={(e) => handlePlanMetaChange(plan.id, 'postLessonAdjustment', e.target.value)}
                    rows={2}
                    placeholder="Ghi chú điều chỉnh sau bài dạy..."
                    className="w-full p-1.5 border border-blue-300 rounded text-xs"
                  />
                ) : (
                  <p className="text-slate-400 italic text-[11px] pl-3">
                    {plan.postLessonAdjustment || '…………………………………………………………………………………………………………………………………………………………………………………………'}
                  </p>
                )}
              </div>

              {/* Ngắt trang in giữa các tiết (in A4 tự động sang trang) */}
              {!isSingle && planIdx < displayedPlans.length - 1 && (
                <div className="my-6 border-b border-slate-200 no-print" />
              )}
            </div>
          );
        })}

        {/* KHỐI DUYỆT DUY NHẤT Ở SAU CÙNG CỦA TOÀN BỘ TẬP GIÁO ÁN (BGH DUYỆT) */}
        {displayedPlans.length > 0 && (
          <div className="mt-10 pt-6 border-t-2 border-slate-300 break-inside-avoid">

            <div className="text-right text-slate-700 italic mb-4 text-xs">
              {customApprovalDate}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center font-bold text-xs">
              <div className="space-y-16">
                <p className="uppercase text-[11px] text-slate-800">BGH DUYỆT</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={localSettings.approverPrincipal || 'Võ Thị Thuận'}
                    onChange={(e) => setLocalSettings({ ...localSettings, approverPrincipal: e.target.value })}
                    className="w-full text-center p-1 border border-blue-300 rounded font-bold text-xs"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-xs">{localSettings.approverPrincipal || 'Võ Thị Thuận'}</p>
                )}
              </div>
              <div className="space-y-16">
                <p className="uppercase text-[11px] text-slate-800">TỔ TRƯỞNG CHUYÊN MÔN</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={localSettings.approverHead || 'Bùi Ngọc Lâm'}
                    onChange={(e) => setLocalSettings({ ...localSettings, approverHead: e.target.value })}
                    className="w-full text-center p-1 border border-blue-300 rounded font-bold text-xs"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-xs">{localSettings.approverHead || 'Bùi Ngọc Lâm'}</p>
                )}
              </div>
              <div className="space-y-16">
                <p className="uppercase text-[11px] text-slate-800">GIÁO VIÊN SOẠN BÀI</p>
                {isEditMode ? (
                  <input
                    type="text"
                    value={localSettings.teacherName || 'Lê Quốc Hưng'}
                    onChange={(e) => setLocalSettings({ ...localSettings, teacherName: e.target.value })}
                    className="w-full text-center p-1 border border-blue-300 rounded font-bold text-xs"
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-xs">{localSettings.teacherName || 'Lê Quốc Hưng'}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-diagram Formation Picker Modal */}
      {isFormationPickerOpen && formationTarget && (
        <SelectFormationModal
          isOpen={true}
          onClose={() => {
            setIsFormationPickerOpen(false);
            setFormationTarget(null);
          }}
          targetRowIndex={formationTarget.rowIndex}
          onSelectFormation={(rowIdx, diag) => {
            handleAddDiagramToRow(formationTarget.planId, formationTarget.rowIndex, diag);
            setIsFormationPickerOpen(false);
            setFormationTarget(null);
          }}
        />
      )}

      {/* Upload Weekly Timetable & Auto-Extract Integrations Modal */}
      {isUploadPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Nạp File Kế Hoạch Tuần & Tự Động Tích Hợp
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bóc tách thời khóa biểu 7 cột và tự động đưa nội dung tích hợp (QPAN, Năng lực số, Môi trường) vào giáo án 3 khối.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadPlanModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
              {/* File Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-slate-50/70 hover:bg-blue-50/30 transition cursor-pointer flex flex-col items-center justify-center space-y-1.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.txt,.html,.htm,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadWeeklyFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-2xs">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">
                    {isParsingFile ? 'Đang phân tích tệp kế hoạch...' : 'Bấm để tải tệp Word (.docx) hoặc bảng tuần'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ file Word chứa bảng 7 cột chuẩn của tuần học mới.
                  </p>
                </div>
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-xs block">
                  Hoặc dán bảng thời khóa biểu tuần từ Word / Excel:
                </label>
                <textarea
                  value={pasteTableText}
                  onChange={(e) => setPasteTableText(e.target.value)}
                  placeholder="Dán nội dung bảng thời khóa biểu 7 cột (Thứ, Tiết, Lớp, Bài học, PPCT, Tích hợp/điều chỉnh, ĐDDH) vào đây..."
                  rows={5}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Feature highlight */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Tính năng thông minh:</strong> Hệ thống sẽ tự động quét cột <em>"ND Tích hợp/điều chỉnh"</em> và tiêu đề để đưa các mã Năng lực số (3.1TC1a, 4.1TC1a, 6.1TC2a), QPAN, Bảo vệ môi trường vào mục <strong>I.4 Yêu cầu cần đạt</strong> của giáo án Khối 1, 3, 5.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 shrink-0 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setWeeklyScheduleRows(getDefaultWeeklySchedule(10));
                    setSelectedWeek(10);
                    const w10Info = getWeekDateInfo(10);
                    setCustomDateRange(w10Info.dateRangeText);
                    setCustomApprovalDate(w10Info.approvalDateText);
                    setIsUploadPlanModalOpen(false);
                    showToast('Đã áp dụng mẫu kế hoạch Tuần 10 chuẩn GDPT 2018!');
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold"
                >
                  Mẫu Tuần 10
                </button>
                <button
                  onClick={() => {
                    setWeeklyScheduleRows(defaultWeek9Schedule);
                    setSelectedWeek(9);
                    setCustomDateRange('Từ ngày 02-06 tháng 11 năm 2026');
                    setCustomApprovalDate('Vệ Giang, ngày 06 tháng 11 năm 2026');
                    setIsUploadPlanModalOpen(false);
                    showToast('Đã áp dụng mẫu kế hoạch Tuần 9 chuẩn của trường!');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Mẫu Tuần 9
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUploadPlanModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (!pasteTableText.trim()) {
                      showToast('Vui lòng chọn file hoặc dán văn bản bảng kế hoạch!');
                      return;
                    }
                    const parsed = parseUploadedWeeklyPlanTable(pasteTableText);
                    if (parsed.rows && parsed.rows.length > 0) {
                      applyParsedWeeklySchedule(parsed.rows, parsed.week, parsed.dateRange, pasteTableText);
                    } else {
                      showToast('Không phân tích được bảng từ văn bản dán.');
                    }
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Áp Dụng & Tích Hợp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PPCT Manager & Pacing Audit Modal */}
      {isPpctManagerOpen && (
        <PpctManagerModal
          isOpen={isPpctManagerOpen}
          onClose={() => setIsPpctManagerOpen(false)}
          ppctList={ppctList}
          onUpdatePpctList={(updated) => {
            setPpctList(updated);
            saveStoredPpctData(updated);
          }}
          currentWeek={selectedWeek}
          weeklyScheduleRows={weeklyScheduleRows}
          onSyncScheduleWithPpct={handleSyncScheduleWithPpct}
          showToast={showToast}
        />
      )}

      {/* Curriculum Audit & SGK Synchronization Modal (Khối 1 - Khối 3 - Khối 5) */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Rà Soát & Đối Chiếu Chuẩn SGK (Khối 1 - 3 - 5) · Tuần {selectedWeek}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đối chiếu tên bài TKB vs Giáo án, kỹ thuật động tác, trò chơi và giảm tải cho HS khuyết tật
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Score & 1-Click Sync Banner */}
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-emerald-50 border border-indigo-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Mức độ đồng bộ chuẩn SGK:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${auditReport.allPassed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {auditReport.overallScore}% Chuẩn
                  </span>
                </div>
                <div className="w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${auditReport.allPassed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${auditReport.overallScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600">
                  {auditReport.passedChecks}/{auditReport.totalChecks} tiêu chí kiểm định đã đạt chuẩn tuyệt đối
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleAutoSyncAllCurriculum();
                    setIsAuditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Đồng Bộ 100% Cả 3 Khối Chuẩn SGK</span>
                </button>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5 w-24">Khối / PPCT</th>
                    <th className="p-2.5">Tên Bài TKB vs Giáo Án</th>
                    <th className="p-2.5">Động Tác Cột 1 & Ảnh</th>
                    <th className="p-2.5">Trò Chơi SGK</th>
                    <th className="p-2.5 w-32">HS Khuyết Tật</th>
                    <th className="p-2.5 w-28 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditReport.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-2.5 align-top font-bold text-slate-800">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${item.grade === 1 ? 'bg-blue-100 text-blue-800' : item.grade === 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                          Khối {item.grade}
                        </span>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          Tiết {item.ppct}
                        </div>
                      </td>
                      <td className="p-2.5 align-top">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {item.cleanMasterTitle}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          {item.isTitleSynced ? (
                            <span className="text-emerald-700 flex items-center gap-0.5 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Khớp 100% TKB & Giáo án
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-500" /> Chưa khớp TKB
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 align-top">
                        <div className="font-medium text-slate-700 text-[11px]">
                          {item.movementText}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          {item.hasAuthenticImage ? (
                            <span className="text-blue-700 flex items-center gap-0.5 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" /> Ảnh scan SGK thật
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-500" /> Ảnh cần thay thế
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 align-top text-[11px] text-slate-700">
                        <div><strong className="text-[10px] text-slate-500">Khởi động:</strong> {item.warmupGame}</div>
                        <div><strong className="text-[10px] text-slate-500">Vận động:</strong> {item.practiceGame}</div>
                      </td>
                      <td className="p-2.5 align-top text-[11px]">
                        {item.hasDisabledCompetencies ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Đã có giảm tải
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-500" /> Cần bổ sung
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 align-top text-center">
                        {item.status === 'passed' ? (
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            ✓ Đạt Chuẩn
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                            ⚠️ Cần Đồng Bộ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 shrink-0 text-xs">
              <span className="text-slate-500 text-[11px]">
                Nguồn đối chiếu: Khung chương trình chuẩn SGK GDTC GDPT 2018 (Kết nối tri thức)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleAutoSyncAllCurriculum();
                    setIsAuditModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đồng Bộ Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classified Movement & Game Image Picker */}
      {pickerOpen && pickerTarget && (
        <ClassifiedImagePickerModal
          isOpen={pickerOpen}
          onClose={() => {
            setPickerOpen(false);
            setPickerTarget(null);
          }}
          images={images}
          initialGrade={pickerTarget.grade ? (String(pickerTarget.grade) as '1' | '3' | '5') : 'all'}
          initialCategory={pickerTarget.category || 'all'}
          targetInfo={{
            grade: pickerTarget.grade,
            lessonTitle: pickerTarget.lessonTitle,
            rowName: pickerTarget.rowName,
            rowIndex: pickerTarget.rowIndex
          }}
          onSelectImage={handleAttachImage}
        />
      )}
    </div>
  );
};
