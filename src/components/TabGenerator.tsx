import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Download,
  Palette,
  Edit3,
  PlusCircle,
  Compass,
  History,
  Save,
  Star,
  AlertCircle,
  Lock
} from 'lucide-react';
import { LessonRow, ScenarioItem, SgkImageItem, DiagramAttachment, UserCustomTemplate } from '../types/gdtc';
import { MasterPlanItem, nextWeeksSyllabusPresets, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { PlanVersionHistoryModal } from './PlanVersionHistoryModal';
import {
  PlanVersionStore,
  LessonPlanVersion,
  formatRelativeTimeVi,
  getBestVersionForPlan,
  getPlanVersionKey,
  getPreferredVersionForPlan,
  getUnfinishedDraftForPlan,
  getVersionsForPlan
} from '../utils/planVersionHistory';
import {
  generateNextWeekPlan,
  AutoMatchResult,
  autoScanLibraryAndAttachToRows,
  extractMovementNamesFromTitle,
  partitionLessonMovements,
  createBalanced7LessonRows,
  createBalancedGranularLessonRows,
  splitAndAlignRows1to1,
  splitAndBalanceExistingRows,
  resolveAccurateMovement,
  isInvalidColumn1AttachmentForRow
} from '../utils/planAutoMatcher';
import { auditPlanAgainstCurriculum, ComplianceAuditReport } from '../utils/curriculumAuditSync';
import {
  RichTextWithImages,
  hasInlineMedia,
  sanitizeInlineImageTagsInText,
  registerInlineImage
} from '../utils/inlineImageHelper';
import { SelectFormationModal } from './SelectFormationModal';
import { SelectMovementImageModal } from './SelectMovementImageModal';
import { FormationStudioModal } from './FormationStudioModal';
import { ImageProvenanceTooltip } from './ImageProvenanceTooltip';
import { resolveSlotMissingImageNotice } from '../utils/imageProvenance';
import { FormationDiagram, saveCustomFormationToStorage } from '../data/formationDiagrams';
import { downloadSvgAsPng } from '../utils/imageProcessing';
import { getSgkPageForLesson } from '../data/sgkCurriculumTree';

interface TabGeneratorProps {
  week: number;
  setWeek: (w: number) => void;
  grade: number;
  setGrade: (g: number) => void;
  lessonNum: number;
  setLessonNum: (n: number) => void;
  topic: string;
  setTopic: (t: string) => void;
  title: string;
  setTitle: (t: string) => void;
  lessonRows: LessonRow[];
  setLessonRows: React.Dispatch<React.SetStateAction<LessonRow[]>>;
  scenarios: ScenarioItem[];
  images: SgkImageItem[];
  currentMasterPlan: MasterPlanItem;
  onChangeLessonContext?: (nextWeek: number, nextGrade: number, nextLessonNum: number) => void;
  planVersionStore?: PlanVersionStore;
  onSaveOfficialVersion?: (
    plan: MasterPlanItem,
    customLabel?: string,
    markAsBest?: boolean,
    baselinePlan?: MasterPlanItem | null,
    forceNewVersion?: boolean
  ) => LessonPlanVersion | void;
  onLoadPlanVersion?: (planKey: string, versionId: string) => void;
  onToggleBestVersion?: (planKey: string, versionId: string) => void;
  onDeletePlanVersion?: (planKey: string, versionId: string) => void;
  userCustomTemplates?: UserCustomTemplate[];
  activeCustomTemplateId?: string | null;
  onApplyCustomTemplate?: (tpl: UserCustomTemplate) => void;
  onSwitchToExport: () => void;
  onSwitchToMasterTemplate: () => void;
  onOpenImport?: () => void;
  onNavigateToScan?: (targetGrade: 1 | 3 | 5, targetPage?: number) => void;
  isGuest?: boolean;
  onRequireAuth?: (feature: string) => void;
  showToast: (msg: string) => void;
}

export const TabGenerator: React.FC<TabGeneratorProps> = ({
  week,
  setWeek,
  grade,
  setGrade,
  lessonNum,
  setLessonNum,
  topic,
  setTopic,
  title,
  setTitle,
  lessonRows,
  setLessonRows,
  scenarios,
  images,
  currentMasterPlan,
  onChangeLessonContext,
  planVersionStore,
  onSaveOfficialVersion,
  onLoadPlanVersion,
  onToggleBestVersion,
  onDeletePlanVersion,
  userCustomTemplates = [],
  activeCustomTemplateId = null,
  onApplyCustomTemplate,
  onSwitchToExport,
  onSwitchToMasterTemplate,
  onOpenImport,
  onNavigateToScan,
  isGuest = false,
  onRequireAuth,
  showToast,
}) => {
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [lastAutoMatch, setLastAutoMatch] = useState<AutoMatchResult | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(!isGuest);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isGuest) {
      setIsEditMode(false);
    }
  }, [isGuest]);

  const effectiveEditMode = !isGuest && isEditMode;

  const activePlanKey = useMemo(() => getPlanVersionKey(week, grade, lessonNum), [week, grade, lessonNum]);

  const versionsForCurrent = useMemo(() => {
    if (!planVersionStore) return [];
    return getVersionsForPlan(planVersionStore, week, grade, lessonNum);
  }, [planVersionStore, week, grade, lessonNum]);

  const preferredVersion = useMemo(() => {
    if (!planVersionStore) return null;
    return getPreferredVersionForPlan(planVersionStore, week, grade, lessonNum);
  }, [planVersionStore, week, grade, lessonNum]);

  const bestVersion = useMemo(() => {
    if (!planVersionStore) return null;
    return getBestVersionForPlan(planVersionStore, week, grade, lessonNum);
  }, [planVersionStore, week, grade, lessonNum]);

  const unfinishedDraft = useMemo(() => {
    if (!planVersionStore) return null;
    return getUnfinishedDraftForPlan(planVersionStore, week, grade, lessonNum);
  }, [planVersionStore, week, grade, lessonNum]);

  const currentPlanSnapshot: MasterPlanItem = useMemo(
    () =>
      normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as 1 | 3 | 5,
        week,
        lessonNum,
        topic,
        title,
        rows: lessonRows
      }),
    [currentMasterPlan, grade, lessonNum, week, topic, title, lessonRows]
  );

  // Compute textbook PDF page for current lesson
  const sgkInfo = useMemo(() => getSgkPageForLesson(grade, title, topic), [grade, title, topic]);

  // Real-time MoET & SGK Compliance Audit (Check 100% match)
  const auditReport: ComplianceAuditReport = useMemo(() => {
    return auditPlanAgainstCurriculum(grade, week, lessonNum, title, lessonRows);
  }, [grade, week, lessonNum, title, lessonRows]);

  // Modals for manual picking
  const [targetRowForFormation, setTargetRowForFormation] = useState<number | null>(null);
  const [targetRowForStudio, setTargetRowForStudio] = useState<number | null>(null);
  const [studioInitialDiagram, setStudioInitialDiagram] = useState<FormationDiagram | null>(null);
  const [targetRowForImage, setTargetRowForImage] = useState<number | null>(null);

  // Advanced inline & column attachment pickers
  const [targetInlinePicker, setTargetInlinePicker] = useState<{
    rowIndex: number;
    col: 'content' | 'gv' | 'hs';
    type: 'image' | 'formation';
    cursorStart: number;
    cursorEnd: number;
  } | null>(null);

  const [targetColAttachment, setTargetColAttachment] = useState<{
    rowIndex: number;
    col: 'content' | 'gv' | 'hs';
    type: 'image' | 'formation';
  } | null>(null);

  // Filter syllabus presets for current grade and week
  const relevantPresets = nextWeeksSyllabusPresets.filter(
    (p) => p.grade === grade
  );

  const handleSelectPresetLesson = (preset: typeof nextWeeksSyllabusPresets[0]) => {
    setWeek(preset.week);
    setLessonNum(preset.lessonNum);
    setTopic(preset.topic);
    setTitle(preset.title);

    // Automatically generate using Master Template
    const match = generateNextWeekPlan(
      preset.grade,
      preset.week,
      preset.lessonNum,
      preset.topic,
      preset.title,
      currentMasterPlan,
      images
    );

    setLessonRows(match.newRows);
    setLastAutoMatch(match);

    showToast(
      `✨ Đã tự động sinh giáo án Tuần ${preset.week} - Tiết ${preset.lessonNum} và gắn đúng ảnh kỹ thuật & sơ đồ đội hình!`
    );
  };

  // Run the Auto-Match & Generation Engine
  const handleAutoGenerateFromMaster = () => {
    const match = generateNextWeekPlan(
      grade,
      week,
      lessonNum,
      topic,
      title,
      currentMasterPlan,
      images
    );

    setLessonRows(match.newRows);
    setLastAutoMatch(match);

    showToast(
      `⚡ Đã áp dụng mẫu Nghĩa Hiệp: Nhận diện ${match.detectedMovements.length} động tác, tự gắn ${match.matchedImages.length} ảnh kỹ thuật và ${match.matchedFormations.length} sơ đồ đội hình!`
    );
  };

  // 1-Click: Auto-scan teacher's library and attach to all rows
  const handleAutoScanLibraryAndAttach = () => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Quét Thư viện & tự động gắn ảnh kỹ thuật');
      return;
    }
    const result = autoScanLibraryAndAttachToRows(lessonRows, images, grade, title);
    setLessonRows(result.updatedRows);
    showToast(
      `⚡ Đã quét thư viện (${images.length} ảnh): Tự động gắn ${result.attachedCount} ảnh kỹ thuật & sơ đồ đội hình vào các hoạt động!`
    );
  };

  // 1-Click: Split activities into separate 1:1 horizontally aligned rows
  const handleSplitAndBalanceRows = () => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Tách 3.1, 3.2, 3.3 & cân bằng cấu trúc 11 hoạt động');
      return;
    }
    const balanced = createBalancedGranularLessonRows(grade, title, images);
    setLessonRows(balanced);
    showToast(
      `✨ Đã chuẩn hóa bảng thành ${balanced.length} hoạt động tương xứng 1:1 theo chiều ngang (Trò chơi, Luyện tập, Động tác mới có dòng riêng biệt)!`
    );
  };

  // 1-Click: Rà soát & Chuẩn hóa sư phạm (Loại bỏ ảnh chèn sai, khớp đúng tranh kỹ thuật và sơ đồ SGK)
  const handleAuditAndFixPedagogicalRules = () => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Rà soát & chuẩn hóa sư phạm giáo án');
      return;
    }
    const result = autoScanLibraryAndAttachToRows(lessonRows, images, grade, title);
    setLessonRows(result.updatedRows);
    showToast(
      `🛡️ Đã rà soát & chuẩn hóa sư phạm: Loại bỏ các ảnh chèn sai ở Cột 1 và khớp đúng tranh kỹ thuật động tác mới!`
    );
  };

  // Gemini AI Custom Adaptation
  const handleAiRefine = async () => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Tinh chỉnh giáo án bằng Gemini AI');
      return;
    }
    setIsAiGenerating(true);
    showToast('Gemini AI đang hiệu chỉnh kịch bản theo yêu cầu chuẩn GDPT 2018...');

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          week,
          lessonNum,
          topic,
          title,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan && data.plan.rows) {
        // Merge AI text with current images & formation diagrams
        const mergedRows = data.plan.rows.map((row: LessonRow, idx: number) => {
          const origRow = lessonRows[idx];
          return {
            ...row,
            contentImgUrl: origRow?.contentImgUrl || row.contentImgUrl,
            contentImgTitle: origRow?.contentImgTitle || row.contentImgTitle,
            hsImgUrl: origRow?.hsImgUrl || row.hsImgUrl,
            hsImgTitle: origRow?.hsImgTitle || row.hsImgTitle,
          };
        });

        setLessonRows(mergedRows);
        showToast('✨ Gemini AI đã tinh chỉnh xong nội dung bài dạy!');
      } else {
        throw new Error(data.error || 'Lỗi xử lý AI');
      }
    } catch (err: any) {
      console.warn('AI generate fallback:', err);
      // Fallback: run local auto generator
      handleAutoGenerateFromMaster();
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Row update handlers
  const handleUpdateRow = (idx: number, field: keyof LessonRow, val: string) => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Chỉnh sửa nội dung giáo án');
      return;
    }
    setLessonRows((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleAddRow = () => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Thêm dòng hoạt động mới vào giáo án');
      return;
    }
    setLessonRows((prev) => [
      ...prev,
      {
        content: 'Hoạt động bổ sung',
        lvd: "3 - 5'",
        gv: '- GV chỉ dẫn.',
        hs: '- HS thực hiện.',
      },
    ]);
    showToast('Đã thêm 1 dòng hoạt động mới!');
  };

  const handleDeleteRow = (idx: number) => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Xóa dòng hoạt động trong giáo án');
      return;
    }
    if (lessonRows.length <= 1) return;
    setLessonRows((prev) => prev.filter((_, i) => i !== idx));
    showToast('Đã xóa dòng hoạt động.');
  };

  const handleMoveRow = (idx: number, dir: 'up' | 'down') => {
    if (isGuest && onRequireAuth) {
      onRequireAuth('Sắp xếp lại các dòng hoạt động');
      return;
    }
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= lessonRows.length) return;
    setLessonRows((prev) => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  // Formation and image selectors
  const handleSelectFormation = (rowIdx: number, formation: FormationDiagram) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx]) {
        const currentDiags = updated[rowIdx].hsImages && updated[rowIdx].hsImages!.length > 0
          ? [...updated[rowIdx].hsImages!]
          : updated[rowIdx].hsImgUrl
          ? [{ id: `diag_init`, url: updated[rowIdx].hsImgUrl!, title: updated[rowIdx].hsImgTitle || 'Sơ đồ' }]
          : [];

        currentDiags.push({
          id: `diag_${Date.now()}`,
          url: formation.svgDataUrl,
          title: formation.name
        });

        updated[rowIdx] = {
          ...updated[rowIdx],
          hsImgUrl: currentDiags[0]?.url,
          hsImgTitle: currentDiags[0]?.title,
          hsImages: currentDiags
        };
      }
      return updated;
    });
    showToast(`Đã gắn "${formation.name}" vào Cột 4 dòng ${rowIdx + 1}!`);
  };

  const handleRemoveFormationDiagram = (rowIdx: number, diagIdx: number) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      const targetRow = updated[rowIdx];
      if (!targetRow) return prev;

      const currentDiags = targetRow.hsImages && targetRow.hsImages.length > 0
        ? [...targetRow.hsImages]
        : targetRow.hsImgUrl
        ? [{ id: 'diag_init', url: targetRow.hsImgUrl, title: targetRow.hsImgTitle || 'Sơ đồ' }]
        : [];

      currentDiags.splice(diagIdx, 1);
      targetRow.hsImages = currentDiags;
      if (currentDiags.length > 0) {
        targetRow.hsImgUrl = currentDiags[0].url;
        targetRow.hsImgTitle = currentDiags[0].title;
      } else {
        delete targetRow.hsImgUrl;
        delete targetRow.hsImgTitle;
      }
      return updated;
    });
    showToast('Đã xóa sơ đồ khỏi dòng hoạt động.');
  };

  const handleSelectMovementImage = (rowIdx: number, imgUrl: string, imgTitle: string) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx]) {
        updated[rowIdx] = {
          ...updated[rowIdx],
          contentImgUrl: imgUrl,
          contentImgTitle: imgTitle,
        };
      }
      return updated;
    });
    showToast(`Đã gắn ảnh kỹ thuật "${imgTitle}" vào Cột 1 dòng ${rowIdx + 1}!`);
  };

  const handleAddRowBelow = (idx: number) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      updated.splice(idx + 1, 0, {
        content: 'Hoạt động bổ sung...',
        lvd: '2 - 3 phút',
        gv: '- Giáo viên hướng dẫn và thị phạm.',
        hs: '- Học sinh tích cực tập luyện theo hiệu lệnh.',
      });
      return updated;
    });
    showToast(`Đã chèn 1 dòng mới bên dưới dòng ${idx + 1}!`);
  };

  const handleRemoveInlineTag = (rowIndex: number, col: 'content' | 'gv' | 'hs', rawTag: string) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      const currentText = updated[rowIndex]?.[col] || '';
      updated[rowIndex] = {
        ...updated[rowIndex],
        [col]: currentText.replace(rawTag, '').trim()
      };
      return updated;
    });
  };

  const onConfirmImageSelection = (rowIndex: number, imgUrl: string, imgTitle: string) => {
    if (targetInlinePicker && targetInlinePicker.type === 'image') {
      const { col, cursorStart, cursorEnd } = targetInlinePicker;
      const rIdx = targetInlinePicker.rowIndex;
      setLessonRows((prev) => {
        const updated = [...prev];
        const row = updated[rIdx];
        if (row) {
          const text = row[col] || '';
          const before = text.slice(0, cursorStart);
          const after = text.slice(cursorEnd);
          const cleanTitle = imgTitle.trim();
          registerInlineImage(cleanTitle, imgUrl);
          const tag = `[HÌNH: ${cleanTitle}]`;
          const newText = `${before}${before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : ''}${tag}${after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n') ? ' ' : ''}${after}`;
          updated[rIdx] = {
            ...row,
            [col]: newText
          };
        }
        return updated;
      });
      setTargetInlinePicker(null);
      showToast(`Đã chèn ảnh "[HÌNH: ${imgTitle}]" vào văn bản Cột ${col === 'content' ? '1' : col === 'gv' ? '3' : '4'}!`);
      return;
    }

    if (targetColAttachment && targetColAttachment.type === 'image') {
      const { col } = targetColAttachment;
      const rIdx = targetColAttachment.rowIndex;
      setLessonRows((prev) => {
        const updated = [...prev];
        const row = updated[rIdx];
        if (row) {
          if (col === 'content') {
            const list = row.contentImages && row.contentImages.length > 0
              ? [...row.contentImages]
              : row.contentImgUrl
              ? [{ id: 'init', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh' }]
              : [];
            list.push({ id: `cimg_${Date.now()}`, url: imgUrl, title: imgTitle });
            updated[rIdx] = { ...row, contentImgUrl: list[0]?.url, contentImgTitle: list[0]?.title, contentImages: list };
          } else if (col === 'gv') {
            const list = row.gvImages && row.gvImages.length > 0
              ? [...row.gvImages]
              : row.gvImgUrl
              ? [{ id: 'init', url: row.gvImgUrl, title: row.gvImgTitle || 'Ảnh GV' }]
              : [];
            list.push({ id: `gvimg_${Date.now()}`, url: imgUrl, title: imgTitle });
            updated[rIdx] = { ...row, gvImgUrl: list[0]?.url, gvImgTitle: list[0]?.title, gvImages: list };
          } else {
            const list = row.hsImages && row.hsImages.length > 0
              ? [...row.hsImages]
              : row.hsImgUrl
              ? [{ id: 'init', url: row.hsImgUrl, title: row.hsImgTitle || 'Ảnh HS' }]
              : [];
            list.push({ id: `hsimg_${Date.now()}`, url: imgUrl, title: imgTitle });
            updated[rIdx] = { ...row, hsImgUrl: list[0]?.url, hsImgTitle: list[0]?.title, hsImages: list };
          }
        }
        return updated;
      });
      setTargetColAttachment(null);
      showToast(`Đã đính kèm ảnh vào Cột ${col === 'content' ? '1' : col === 'gv' ? '3' : '4'} dòng ${rIdx + 1}!`);
      return;
    }

    handleSelectMovementImage(rowIndex, imgUrl, imgTitle);
    setTargetRowForImage(null);
  };

  const onConfirmFormationSelection = (rowIndex: number, formation: FormationDiagram) => {
    if (targetInlinePicker && targetInlinePicker.type === 'formation') {
      const { col, cursorStart, cursorEnd } = targetInlinePicker;
      const rIdx = targetInlinePicker.rowIndex;
      setLessonRows((prev) => {
        const updated = [...prev];
        const row = updated[rIdx];
        if (row) {
          const text = row[col] || '';
          const before = text.slice(0, cursorStart);
          const after = text.slice(cursorEnd);
          const cleanTitle = formation.name.trim();
          registerInlineImage(cleanTitle, formation.svgDataUrl);
          const tag = `[SƠ ĐỒ: ${cleanTitle}]`;
          const newText = `${before}${before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : ''}${tag}${after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n') ? ' ' : ''}${after}`;
          updated[rIdx] = {
            ...row,
            [col]: newText
          };
        }
        return updated;
      });
      setTargetInlinePicker(null);
      showToast(`Đã chèn "[SƠ ĐỒ: ${formation.name}]" vào vị trí con trỏ!`);
      return;
    }

    if (targetColAttachment && targetColAttachment.type === 'formation') {
      const { col } = targetColAttachment;
      const rIdx = targetColAttachment.rowIndex;
      setLessonRows((prev) => {
        const updated = [...prev];
        const row = updated[rIdx];
        if (row) {
          if (col === 'content') {
            const list = row.contentImages && row.contentImages.length > 0
              ? [...row.contentImages]
              : row.contentImgUrl
              ? [{ id: 'init', url: row.contentImgUrl, title: row.contentImgTitle || 'Sơ đồ' }]
              : [];
            list.push({ id: `cform_${Date.now()}`, url: formation.svgDataUrl, title: formation.name });
            updated[rIdx] = { ...row, contentImgUrl: list[0]?.url, contentImgTitle: list[0]?.title, contentImages: list };
          } else if (col === 'gv') {
            const list = row.gvImages && row.gvImages.length > 0
              ? [...row.gvImages]
              : row.gvImgUrl
              ? [{ id: 'init', url: row.gvImgUrl, title: row.gvImgTitle || 'Sơ đồ GV' }]
              : [];
            list.push({ id: `gvform_${Date.now()}`, url: formation.svgDataUrl, title: formation.name });
            updated[rIdx] = { ...row, gvImgUrl: list[0]?.url, gvImgTitle: list[0]?.title, gvImages: list };
          } else {
            handleSelectFormation(rIdx, formation);
          }
        }
        return updated;
      });
      setTargetColAttachment(null);
      return;
    }

    handleSelectFormation(rowIndex, formation);
    setTargetRowForFormation(null);
  };

  return (
    <div className="space-y-6">
      {/* Master Template Source Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mẫu Mặc Định Đang Kích Hoạt
            </span>
            <span className="text-blue-200 text-xs">
              Trường TH & THCS Nghĩa Hiệp (GV: Lê Quốc Hưng)
            </span>
          </div>
          <h2 className="text-base font-bold mt-1 text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Sinh Giáo Án Tuần Kế Tiếp Từ Giáo Án Mẫu Nghĩa Hiệp
          </h2>
          <p className="text-blue-100 text-xs mt-0.5 max-w-2xl">
            Giữ nguyên 100% khung sườn quy chuẩn, mục tiêu năng lực số (3.1TC1a/1.1TC1a), ATGT, cấu trúc 4 cột và chữ ký BGH. Chỉ cập nhật tên bài và tự động điền ảnh động tác & sơ đồ đội hình.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Nạp &amp; Phân Tích Mẫu Mới</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
            </button>
          )}
          <button
            onClick={onSwitchToMasterTemplate}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <FileCheck className="w-4 h-4 text-emerald-300" />
            <span>Sửa Trực Tiếp Giáo Án Mẫu</span>
            {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* Custom User Templates Quick Bar */}
      {userCustomTemplates.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Mẫu giáo án mới từ người dùng:
            </span>
            {userCustomTemplates.map((tpl) => {
              const isAct = tpl.id === activeCustomTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    if (isGuest && onRequireAuth) {
                      onRequireAuth('Sử dụng mẫu giáo án mới từ người dùng');
                      return;
                    }
                    onApplyCustomTemplate?.(tpl);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isAct
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <span>{tpl.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isAct ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    K{tpl.grade}·T{tpl.week} ({tpl.rows.length} dòng)
                  </span>
                  {isGuest && <Lock className="w-3 h-3 text-amber-500" />}
                </button>
              );
            })}
          </div>
          {onOpenImport && (
            <button
              type="button"
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('Nạp thêm mẫu giáo án mới');
                  return;
                }
                onOpenImport();
              }}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline shrink-0 inline-flex items-center gap-1"
            >
              {isGuest && <Lock className="w-3 h-3 text-amber-500" />}
              <span>+ Nạp mẫu khác</span>
            </button>
          )}
        </div>
      )}

      {/* Week & Lesson Setup Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Thông Tin Tiết Dạy Mới (Tuần Tiếp Theo)
        </h3>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Tuần */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tuần Học:
            </label>
            <select
              value={week}
              onChange={(e) => {
                const nw = parseInt(e.target.value, 10);
                const nl = (nw - 1) * 2 + (lessonNum % 2 === 0 ? 2 : 1);
                if (onChangeLessonContext) onChangeLessonContext(nw, grade, nl);
                else setWeek(nw);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>

          {/* Khối lớp */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Khối Lớp:
            </label>
            <select
              value={grade}
              onChange={(e) => {
                const ng = parseInt(e.target.value, 10);
                if (onChangeLessonContext) onChangeLessonContext(week, ng, lessonNum);
                else setGrade(ng);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value={1}>Khối 1</option>
              <option value={3}>Khối 3</option>
              <option value={5}>Khối 5</option>
            </select>
          </div>

          {/* Tiết PPCT */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tiết PPCT:
            </label>
            <input
              type="number"
              value={lessonNum}
              onChange={(e) => {
                const nl = parseInt(e.target.value, 10) || 1;
                if (onChangeLessonContext) onChangeLessonContext(week, grade, nl);
                else setLessonNum(nl);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Chủ đề */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Chủ Đề:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tên bài học */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tên Bài Dạy Mới (Chứa các động tác cần học):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 1)"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-blue-900 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center gap-2 flex-wrap">
              {onNavigateToScan && (
                <button
                  onClick={() => onNavigateToScan(grade as 1 | 3 | 5, sgkInfo.page)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                  title={`Mở trang ${sgkInfo.page} của SGK Lớp ${grade} để bóc tách hoặc đối chiếu`}
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>📖 Mở SGK Điện Tử (Trang {sgkInfo.page})</span>
                  {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
                </button>
              )}

              <button
                onClick={handleAutoGenerateFromMaster}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Tự động bóc tách tên động tác, tìm ảnh SGK và sơ đồ đội hình"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                ⚡ Sinh Giáo Án Chuẩn
              </button>

              <button
                onClick={handleSplitAndBalanceRows}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Tách phần 3.1 (đồng loạt), 3.2 (tổ nhóm), 3.3 (cặp đôi) thành từng ô riêng, cân bằng Cột GV 100-120 từ giải quyết triệt để khoảng trắng"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>⚡ Tách 3.1, 3.2, 3.3 &amp; Cân Bằng Các Ô</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
              </button>

              <button
                onClick={handleAutoScanLibraryAndAttach}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Quét ảnh từ thư viện của bạn và tự động gắn vào các hoạt động"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Quét Thư Viện Gắn Ảnh</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
              </button>
            </div>
          </div>

          {/* Pedagogical Rule Guidance & Textbook Page Info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {(() => {
              const movs = extractMovementNamesFromTitle(title);
              const isP2 =
                (title.toLowerCase().includes('tiết 2') ||
                  title.toLowerCase().includes('tiet 2') ||
                  title.toLowerCase().includes('(tiết 2)') ||
                  lessonNum % 2 === 0) &&
                !title.toLowerCase().includes('tiết 1') &&
                !title.toLowerCase().includes('tiết 21') &&
                !title.toLowerCase().includes('tiết 19') &&
                !title.toLowerCase().includes('tiết 17') &&
                !title.toLowerCase().includes('tiết 15');
              const part = partitionLessonMovements(movs, isP2);
              return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  🎯 <strong>Quy tắc sư phạm GDPT 2018 ({movs.length} động tác):</strong> {part.summaryExplanation} {part.reviewMovements.length > 0 ? `(Bao gồm phần ôn ${part.reviewMovements.join(' & ')} ở Tiết 1)` : ''}
                </span>
              );
            })()}
            {sgkInfo.lesson && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Trang SGK chuẩn: <strong>Trang {sgkInfo.page} - {sgkInfo.lesson.endPage}</strong> ({sgkInfo.movements.join(', ')})
              </span>
            )}
          </div>
        </div>

        {/* Quick Syllabus Presets for current grade */}
        {relevantPresets.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium mb-2">
              💡 Gợi ý nhanh bài học phân phối chương trình tiếp theo (Khối {grade}):
            </p>
            <div className="flex flex-wrap gap-2">
              {relevantPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetLesson(preset)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition text-left flex items-center gap-1.5"
                >
                  <span className="bg-white text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                    Tuần {preset.week}
                  </span>
                  <span>{preset.title.replace(/^bài\s*\d+\s*[:\-]?\s*/i, '')}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 100% SGK & PPCT Compliance Audit Bar (Tick Xanh Chuẩn Bộ GD&ĐT) */}
      <div className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
        auditReport.is100PercentCompliant
          ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950'
          : 'bg-amber-50/90 border-amber-300 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-start md:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              auditReport.is100PercentCompliant ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {auditReport.is100PercentCompliant ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm tracking-tight">
                  {auditReport.is100PercentCompliant
                    ? 'ĐÃ KHỚP 100% VỚI SGK VÀ PHÂN PHỐI CHƯƠNG TRÌNH (BỘ GD&ĐT)'
                    : `CẦN RÀ SOÁT ĐỂ KHỚP 100% VỚI SGK & PPCT (${auditReport.score}%)`}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  auditReport.is100PercentCompliant
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white animate-pulse'
                }`}>
                  {auditReport.is100PercentCompliant ? '✓ 100% CHUẨN ĐỒNG BỘ' : '⚠️ CẦN CHUẨN HÓA'}
                </span>
              </div>
              <p className="text-[11.5px] mt-0.5 font-medium opacity-90">
                Tuần {week} • Tiết {lessonNum} • Khối {grade}: {auditReport.is100PercentCompliant
                  ? `Động tác "${auditReport.expectedMovement}" khớp 100% từ tên bài học, tranh kỹ thuật SGK, 4 bước luyện tập đến bài tập vận dụng thực tế.`
                  : `Phát hiện nội dung hoặc tranh ảnh chưa đồng bộ với phân phối chương trình của Tuần ${week} (Yêu cầu: "${auditReport.expectedMovement}").`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {!auditReport.is100PercentCompliant && (
              <button
                type="button"
                onClick={() => {
                  if (isGuest && onRequireAuth) {
                    onRequireAuth('Tự động chuẩn hóa khớp 100% SGK & PPCT');
                    return;
                  }
                  const match = generateNextWeekPlan(
                    grade,
                    week,
                    lessonNum,
                    topic,
                    auditReport.expectedTitle || title,
                    currentMasterPlan,
                    images
                  );
                  setTitle(auditReport.expectedTitle || title);
                  setLessonRows(match.newRows);
                  setLastAutoMatch(match);
                  showToast('🛡️ ĐÃ TỰ ĐỘNG CHUẨN HÓA KHỚP 100% SGK VÀ PHÂN PHỐI CHƯƠNG TRÌNH!');
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>🛡️ Tự động Chuẩn hóa Khớp 100% Ngay</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleSplitAndBalanceRows}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="Đồng bộ lại cấu trúc 11 hoạt động tương xứng 1:1 theo chiều ngang"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Đồng bộ 1:1</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-500" />}
            </button>
          </div>
        </div>

        {/* 5-Dimension Checkmark Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-200/60">
          {auditReport.checks.map((c) => (
            <div
              key={c.id}
              className={`p-2 rounded-xl border text-xs transition ${
                c.passed
                  ? 'bg-white/85 border-emerald-300 text-emerald-900'
                  : 'bg-white/90 border-red-300 text-red-900 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {c.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold shrink-0">✕</span>
                )}
                <span className="truncate">{c.title}</span>
              </div>
              <div className="text-[10px] mt-1 font-semibold truncate" title={c.currentValue}>
                {c.passed ? `✓ ${c.currentValue}` : `Cần: ${c.expectedValue}`}
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5 leading-tight truncate" title={c.description}>
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Version History & Auto-Draft Status Strip */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap tabular-nums">
            <History className="w-4 h-4 text-blue-600 shrink-0" />
            {preferredVersion ? (
              <span>
                Đang hiển thị: Phiên bản #{preferredVersion.versionNumber}
                {preferredVersion.isStarredBest || preferredVersion.status === 'best'
                  ? ' · Hoàn hảo nhất'
                  : preferredVersion.status === 'draft'
                  ? ' · Bản nháp đang sửa dở'
                  : ' · Đã lưu chính thức'}
              </span>
            ) : (
              <span>Chưa có lịch sử chỉnh sửa · Tự động lưu bản nháp khi Thầy/Cô gõ sửa</span>
            )}
            {preferredVersion && (
              <span className="text-slate-500 font-normal">
                · Cập nhật {formatRelativeTimeVi(preferredVersion.updatedAt)}
              </span>
            )}
          </div>
          {preferredVersion?.changeSummary && preferredVersion.changeSummary.length > 0 && (
            <p className="text-[11px] text-slate-600 mt-0.5 truncate max-w-2xl">
              Thay đổi gần nhất: {preferredVersion.changeSummary.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {unfinishedDraft && preferredVersion?.versionId !== unfinishedDraft.versionId && onLoadPlanVersion && (
            <button
              type="button"
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('Khôi phục bản nháp & quản lý phiên bản');
                  return;
                }
                onLoadPlanVersion(activePlanKey, unfinishedDraft.versionId);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 whitespace-nowrap shrink-0 transition"
            >
              Tiếp tục bản nháp dở (v{unfinishedDraft.versionNumber})
            </button>
          )}

          {bestVersion && preferredVersion?.versionId !== bestVersion.versionId && onLoadPlanVersion && (
            <button
              type="button"
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('Tải phiên bản hoàn hảo nhất');
                  return;
                }
                onLoadPlanVersion(activePlanKey, bestVersion.versionId);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 whitespace-nowrap shrink-0 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Tải bản hoàn hảo nhất</span>
            </button>
          )}

          {onSaveOfficialVersion && (
            <button
              type="button"
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('Lưu phiên bản chính thức lên tài khoản');
                  return;
                }
                onSaveOfficialVersion(
                  currentPlanSnapshot,
                  undefined,
                  false,
                  {
                    ...currentPlanSnapshot,
                    rows: createBalancedGranularLessonRows(grade, title, images)
                  },
                  true
                );
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu phiên bản mới</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-200" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isGuest && onRequireAuth) {
                onRequireAuth('Xem Lịch sử chỉnh sửa & Khôi phục phiên bản');
                return;
              }
              setIsVersionModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition tabular-nums"
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử sửa &amp; Phiên bản ({versionsForCurrent.length})</span>
            {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* 4-Column Table Direct Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              {effectiveEditMode
                ? 'Bảng Tiến Trình Giảng Dạy Đã Sinh (Chỉnh Sửa Trực Tiếp Toàn Diện)'
                : 'Bảng Tiến Trình Giảng Dạy Đã Sinh (Chế Độ Xem Trước)'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isGuest
                ? 'Đang ở Chế độ Khách (Xem trước). Đăng nhập để bật Chế độ sửa, chèn ảnh/sơ đồ và lưu phiên bản chính thức.'
                : 'Hỗ trợ gõ sửa trực tiếp, chèn ảnh SGK và sơ đồ đội hình vào bất kỳ vị trí nào trong các cột và từng dòng văn bản'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('Chỉnh sửa trực tiếp nội dung 4 cột');
                  return;
                }
                setIsEditMode(!isEditMode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                effectiveEditMode
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{effectiveEditMode ? 'Đang ở Chế Độ Sửa' : 'Bật Chế Độ Sửa'}</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
            </button>

            <button
              type="button"
              onClick={handleAuditAndFixPedagogicalRules}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              title="Tự động kiểm tra và loại bỏ các ảnh chèn sai vị trí, khớp đúng tranh kỹ thuật động tác mới theo chuẩn SGK"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rà Soát Chuẩn Sư Phạm</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
            </button>

            <button
              type="button"
              onClick={handleAiRefine}
              disabled={isAiGenerating}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isAiGenerating ? 'AI đang xử lý...' : 'Gemini AI Tinh Chỉnh'}</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Dòng</span>
              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
            </button>

            <button
              type="button"
              onClick={onSwitchToExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Xem Trước &amp; In
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-8 text-center text-slate-400">STT</th>
                <th className="p-3 w-1/4">Cột 1: Nội Dung / Kỹ Thuật / Ảnh</th>
                <th className="p-3 w-20 text-center">Cột 2: LVĐ</th>
                <th className="p-3 w-1/3">Cột 3: Hoạt Động Giáo Viên</th>
                <th className="p-3 w-1/3">Cột 4: Hoạt Động Học Sinh & Sơ Đồ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {lessonRows.map((row, idx) => {
                // Gather all attachments for Column 1
                const contentImgs: DiagramAttachment[] = row.contentImages && row.contentImages.length > 0
                  ? row.contentImages
                  : row.contentImgUrl
                  ? [{ id: `c_init_${idx}`, url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh động tác' }]
                  : [];

                // Gather all attachments for Column 3 (GV)
                const gvImgs: DiagramAttachment[] = row.gvImages && row.gvImages.length > 0
                  ? row.gvImages
                  : row.gvImgUrl
                  ? [{ id: `gv_init_${idx}`, url: row.gvImgUrl, title: row.gvImgTitle || 'Ảnh GV' }]
                  : [];

                // Gather all attachments for Column 4 (HS)
                const hsImgs: DiagramAttachment[] = row.hsImages && row.hsImages.length > 0
                  ? row.hsImages
                  : row.hsImgUrl
                  ? [{ id: `hs_init_${idx}`, url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ' }]
                  : [];

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    {/* STT */}
                    <td className="p-2.5 text-center font-bold text-slate-400 align-top">
                      {idx + 1}
                    </td>

                    {/* Cột 1: Nội dung / Kỹ thuật / Ảnh */}
                    <td className="p-2.5 align-top space-y-2">
                      {effectiveEditMode ? (
                        <>
                          {/* Row management toolbar */}
                          <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200 px-2 py-1 rounded text-[10.5px]">
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 bg-blue-700 text-white font-bold rounded text-[9px]">
                                Dòng {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddRowBelow(idx)}
                                className="p-0.5 text-emerald-700 hover:bg-emerald-100 rounded transition"
                                title="Thêm 1 dòng mới bên dưới dòng này"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                              </button>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveRow(idx, 'up')}
                                  className="p-0.5 text-slate-600 hover:bg-slate-200 rounded transition text-[10px]"
                                  title="Chuyển dòng lên"
                                >
                                  <MoveUp className="w-3 h-3" />
                                </button>
                              )}
                              {idx < lessonRows.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveRow(idx, 'down')}
                                  className="p-0.5 text-slate-600 hover:bg-slate-200 rounded transition text-[10px]"
                                  title="Chuyển dòng xuống"
                                >
                                  <MoveDown className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded transition"
                                title="Xóa dòng hoạt động này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Inline Insertion at cursor for Column 1 */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.content?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'content',
                                    type: 'image',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-0.5 transition shadow-2xs text-[10px]"
                                title="Chèn ảnh vào vị trí con trỏ hoặc dòng chữ đang chọn"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-300" />
                                <span>📷 Chèn ảnh</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.content?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'content',
                                    type: 'formation',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center gap-0.5 transition shadow-2xs text-[10px]"
                                title="Chèn sơ đồ đội hình vào vị trí con trỏ"
                              >
                                <Compass className="w-3 h-3 text-amber-300" />
                                <span>📐 Chèn sơ đồ</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={4}
                            value={sanitizeInlineImageTagsInText(row.content)}
                            onChange={(e) => handleUpdateRow(idx, 'content', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                            placeholder="Nhập nội dung hoạt động... (Có thể bấm 'Chèn ảnh' hoặc 'Chèn sơ đồ' để chèn trực tiếp tại con trỏ)"
                          />

                          {/* Live preview if inline tags exist in Column 1 */}
                          {row.content && hasInlineMedia(row.content) && (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                                👁️ Xem trước nội dung kèm hình ảnh:
                              </p>
                              <RichTextWithImages
                                text={row.content}
                                imageHeight={80}
                                showCaptions={true}
                                isEditMode={true}
                                onRemoveImage={(rawTag) => handleRemoveInlineTag(idx, 'content', rawTag)}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                          <RichTextWithImages
                            text={row.content}
                            imageHeight={80}
                            showCaptions={true}
                            isEditMode={false}
                          />
                        </div>
                      )}

                      {/* Column 1 Image Gallery */}
                      {contentImgs.length > 0 && (() => {
                        const rLower = (row.content || '').toLowerCase();
                        const inferredFolder: 'khoiDong' | 'troChoiKhoiDong' | 'kyThuat' | 'luyenTap' | 'troChoi' | 'vanDung' =
                          rLower.includes('1.3') || (rLower.includes('trò chơi') && rLower.includes('khởi động'))
                            ? 'troChoiKhoiDong'
                            : rLower.includes('1.2') || (rLower.includes('khởi động') && !rLower.includes('1.1'))
                            ? 'khoiDong'
                            : rLower.includes('3.5') || rLower.includes('trò chơi vận động')
                            ? 'troChoi'
                            : rLower.includes('3.1') || rLower.includes('3.2') || rLower.includes('3.3') || rLower.includes('luyện tập')
                            ? 'luyenTap'
                            : rLower.includes('4.2') || rLower.includes('vận dụng')
                            ? 'vanDung'
                            : 'kyThuat';
                        return (
                        <div className="space-y-1.5">
                          <div className={`grid ${contentImgs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                            {contentImgs.filter((cImg) => Boolean(cImg?.url && cImg.url.trim())).map((cImg, cIdx) => (
                              <div key={cImg.id || cIdx} className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 relative group group/imgtip text-center">
                                <img
                                  src={cImg.url}
                                  alt={cImg.title}
                                  className="max-h-32 w-auto mx-auto object-contain rounded bg-white"
                                />
                                <p className="text-[10px] text-slate-600 font-medium text-center mt-1 truncate" title={cImg.title}>
                                  {cImg.title}
                                </p>
                                <ImageProvenanceTooltip
                                  image={{
                                    title: cImg.title || row.contentImgTitle,
                                    grade: String(grade),
                                    lessonTitle: title,
                                    folder: inferredFolder,
                                    imgUrl: cImg.url
                                  }}
                                  position="bottom"
                                />
                                {effectiveEditMode && (
                                  <>
                                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => downloadSvgAsPng(cImg.url, `anh_cot1_dong_${idx + 1}.png`)}
                                        className="bg-slate-900/85 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                                        title="Tải ảnh PNG xuống máy"
                                      >
                                        <Download className="w-3 h-3 text-emerald-400" /> PNG
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLessonRows((prev) => {
                                          const updated = [...prev];
                                          const cur = updated[idx]?.contentImages || [];
                                          const next = cur.filter((_, i) => i !== cIdx);
                                          updated[idx] = {
                                            ...updated[idx],
                                            contentImages: next,
                                            contentImgUrl: next[0]?.url,
                                            contentImgTitle: next[0]?.title
                                          };
                                          return updated;
                                        });
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
                                      title="Xóa ảnh"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        );
                      })()}

                      {/* Misplaced attachment warning OR Missing-image guidance */}
                      {contentImgs.some((im) =>
                        isInvalidColumn1AttachmentForRow(row.content, im.url, im.title, grade, title)
                      ) && (
                        <div className="p-2 bg-red-50 border border-red-300 rounded-lg text-[10.5px] leading-snug text-red-900 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold">Cảnh báo: Hình đang gắn chưa khớp mục này</p>
                            <p className="mt-0.5">
                              Ảnh trò chơi không được đặt vào 1.2 Khởi động chung, và Sơ đồ đội hình thuộc Cột 4 (không thay cho ảnh SGK ở Cột 1).
                            </p>
                          </div>
                        </div>
                      )}

                      {contentImgs.length === 0 && !hasInlineMedia(row.content) && (() => {
                        const missingNotice = resolveSlotMissingImageNotice(grade, row.content, title, topic);
                        if (!missingNotice) return null;
                        return (
                          <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-[10.5px] leading-snug text-amber-950 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-amber-900">Chưa tìm được hình phù hợp cho mục này</p>
                              <p className="text-amber-800 mt-0.5">{missingNotice.message}</p>
                              {onNavigateToScan && missingNotice.suggestedPage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isGuest && onRequireAuth) {
                                      onRequireAuth('Mở Tab 1 quét & bóc tách ảnh từ SGK');
                                      return;
                                    }
                                    onNavigateToScan(grade as 1 | 3 | 5, missingNotice.suggestedPage);
                                  }}
                                  className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded font-bold text-[10px] transition"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Mở Tab 1 trích xuất SGK Lớp {grade} (Trang {missingNotice.suggestedPage})</span>
                                  {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Add column-level image to Column 1 */}
                      {effectiveEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetColAttachment({
                              rowIndex: idx,
                              col: 'content',
                              type: 'image'
                            });
                          }}
                          className="w-full bg-blue-50/70 hover:bg-blue-100 text-blue-800 border border-dashed border-blue-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <ImageIcon className="w-3 h-3 text-blue-600" />
                          {contentImgs.length > 0 ? '+ Đính kèm thêm ảnh kỹ thuật vào Cột 1' : '+ Gắn ảnh kỹ thuật SGK (Cột 1)'}
                        </button>
                      )}
                    </td>

                    {/* Cột 2: LVĐ */}
                    <td className="p-2.5 text-center align-top font-semibold text-slate-800">
                      {effectiveEditMode ? (
                        <textarea
                          rows={3}
                          value={row.lvd}
                          onChange={(e) => handleUpdateRow(idx, 'lvd', e.target.value)}
                          className="w-full text-center p-1.5 text-xs rounded-lg border border-slate-300 font-bold focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <div className="whitespace-pre-line py-1 text-xs font-bold text-slate-800">
                          {row.lvd}
                        </div>
                      )}
                    </td>

                    {/* Cột 3: Hoạt Động Giáo Viên */}
                    <td className="p-2.5 align-top leading-relaxed text-slate-800 space-y-2">
                      {effectiveEditMode ? (
                        <>
                          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-2 py-0.5 rounded text-[10.5px]">
                            <span className="font-bold text-emerald-800 text-[10px]">Cột 3: Kịch Bản GV</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.gv?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'gv',
                                    type: 'image',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-0.5 transition text-[10px]"
                                title="Chèn ảnh vào vị trí con trỏ trong Hoạt động GV"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-300" />
                                <span>📷 Chèn ảnh</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.gv?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'gv',
                                    type: 'formation',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center gap-0.5 transition text-[10px]"
                                title="Chèn sơ đồ vị trí GV vào dòng này"
                              >
                                <Compass className="w-3 h-3 text-amber-300" />
                                <span>📐 Chèn sơ đồ</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={7}
                            value={sanitizeInlineImageTagsInText(row.gv)}
                            onChange={(e) => handleUpdateRow(idx, 'gv', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                            placeholder="Nhập kịch bản hoạt động của giáo viên..."
                          />

                          {/* Live preview if inline tags exist in Column 3 */}
                          {row.gv && hasInlineMedia(row.gv) && (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                              <RichTextWithImages
                                text={row.gv}
                                imageHeight={70}
                                showCaptions={true}
                                isEditMode={true}
                                onRemoveImage={(rawTag) => handleRemoveInlineTag(idx, 'gv', rawTag)}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs leading-relaxed text-slate-800">
                          <RichTextWithImages
                            text={row.gv}
                            imageHeight={70}
                            showCaptions={true}
                            isEditMode={false}
                          />
                        </div>
                      )}

                      {/* Column 3 Image Gallery */}
                      {gvImgs.length > 0 && (
                        <div className="space-y-1.5">
                          <div className={`grid ${gvImgs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                            {gvImgs.filter((gImg) => Boolean(gImg?.url && gImg.url.trim())).map((gImg, gIdx) => (
                              <div key={gImg.id || gIdx} className="p-1 bg-slate-50 rounded-lg border border-slate-200 relative group text-center">
                                <img
                                  src={gImg.url}
                                  alt={gImg.title}
                                  className="max-h-24 w-auto mx-auto object-contain rounded bg-white"
                                />
                                <p className="text-[9.5px] text-slate-600 font-medium text-center mt-0.5 truncate">
                                  {gImg.title}
                                </p>
                                {effectiveEditMode && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLessonRows((prev) => {
                                        const updated = [...prev];
                                        const next = (updated[idx]?.gvImages || []).filter((_, i) => i !== gIdx);
                                        updated[idx] = {
                                          ...updated[idx],
                                          gvImages: next,
                                          gvImgUrl: next[0]?.url,
                                          gvImgTitle: next[0]?.title
                                        };
                                        return updated;
                                      });
                                    }}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow"
                                    title="Xóa ảnh"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Cột 4: Hoạt Động Học Sinh & Sơ Đồ Đội Hình */}
                    <td className="p-2.5 align-top leading-relaxed text-slate-800 space-y-2">
                      {effectiveEditMode ? (
                        <>
                          <div className="flex items-center justify-between bg-purple-50/80 border border-purple-200 px-2 py-0.5 rounded text-[10.5px]">
                            <span className="font-bold text-purple-800 text-[10px]">Cột 4: Hoạt Động HS</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.hs?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'hs',
                                    type: 'image',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold flex items-center gap-0.5 transition text-[10px]"
                                title="Chèn ảnh vào vị trí con trỏ trong Hoạt động HS"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-300" />
                                <span>📷 Chèn ảnh</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.closest('td')?.querySelector('textarea');
                                  const start = textarea?.selectionStart ?? (row.hs?.length || 0);
                                  const end = textarea?.selectionEnd ?? start;
                                  setTargetInlinePicker({
                                    rowIndex: idx,
                                    col: 'hs',
                                    type: 'formation',
                                    cursorStart: start,
                                    cursorEnd: end
                                  });
                                }}
                                className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center gap-0.5 transition text-[10px]"
                                title="Chèn sơ đồ đội hình vào vị trí con trỏ trong Hoạt động HS"
                              >
                                <Compass className="w-3 h-3 text-amber-300" />
                                <span>📐 Chèn sơ đồ</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={4}
                            value={sanitizeInlineImageTagsInText(row.hs)}
                            onChange={(e) => handleUpdateRow(idx, 'hs', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                            placeholder="Nhập hoạt động của học sinh..."
                          />

                          {/* Live preview if inline tags exist in Column 4 */}
                          {row.hs && hasInlineMedia(row.hs) && (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                              <RichTextWithImages
                                text={row.hs}
                                imageHeight={80}
                                showCaptions={true}
                                isEditMode={true}
                                onRemoveImage={(rawTag) => handleRemoveInlineTag(idx, 'hs', rawTag)}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs leading-relaxed text-slate-800">
                          <RichTextWithImages
                            text={row.hs}
                            imageHeight={80}
                            showCaptions={true}
                            isEditMode={false}
                          />
                        </div>
                      )}

                      {/* Multi-Diagram in Column 4 */}
                      <div className="space-y-2">
                        {/* Buttons to attach from Library & Open Studio */}
                        {effectiveEditMode && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetColAttachment({
                                  rowIndex: idx,
                                  col: 'hs',
                                  type: 'formation'
                                });
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                            >
                              <Users className="w-3 h-3 text-blue-600" />
                              {hsImgs.length > 0 ? '+ Thêm từ Kho Sơ Đồ' : '+ Kho sơ đồ'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStudioInitialDiagram(
                                  hsImgs[0]
                                    ? {
                                        id: `dh_row_${idx}`,
                                        name: hsImgs[0].title || `Sơ đồ dòng ${idx + 1}`,
                                        code: 'DH_CUSTOM',
                                        phase: 'dong_loat',
                                        description: row.hs,
                                        svgDataUrl: hsImgs[0].url
                                      }
                                    : null
                                );
                                setTargetRowForStudio(idx);
                              }}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition shadow-2xs"
                            >
                              <Palette className="w-3 h-3 text-purple-600" />
                              🎨 Studio tự vẽ
                            </button>
                          </div>
                        )}

                        {/* Formation Diagram Preview in Column 4 */}
                        {hsImgs.length > 0 ? (
                          <div className="space-y-2">
                            <div className={`grid ${hsImgs.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                              {hsImgs.filter((diag) => Boolean(diag?.url && diag.url.trim())).map((diag, diagIdx) => (
                                <div
                                  key={diag.id || diagIdx}
                                  className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 relative group text-center"
                                >
                                  <img
                                    src={diag.url}
                                    alt={diag.title || 'Sơ đồ đội hình'}
                                    className="max-h-32 w-auto mx-auto object-contain rounded bg-white"
                                  />
                                  {diag.title && (
                                    <p className="text-[10px] text-slate-700 font-medium text-center mt-1 truncate" title={diag.title}>
                                      {diag.title}
                                    </p>
                                  )}
                                  {effectiveEditMode && (
                                    <>
                                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setStudioInitialDiagram({
                                              id: diag.id || `dh_row_${idx}_${diagIdx}`,
                                              name: diag.title || `Sơ đồ ${diagIdx + 1}`,
                                              code: 'DH_CUSTOM',
                                              phase: 'dong_loat',
                                              description: row.hs,
                                              svgDataUrl: diag.url
                                            });
                                            setTargetRowForStudio(idx);
                                          }}
                                          className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                                          title="Chỉnh sửa sơ đồ này trong Studio"
                                        >
                                          <Edit3 className="w-3 h-3 text-white" /> Sửa
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => downloadSvgAsPng(diag.url, `so_do_dong_${idx + 1}_${diagIdx + 1}.png`)}
                                          className="bg-slate-900/85 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                                          title="Tải sơ đồ PNG xuống máy"
                                        >
                                          <Download className="w-3 h-3 text-emerald-400" /> PNG
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFormationDiagram(idx, diagIdx)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
                                        title="Xóa sơ đồ này"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>

                            {effectiveEditMode && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetColAttachment({
                                    rowIndex: idx,
                                    col: 'hs',
                                    type: 'formation'
                                  });
                                }}
                                className="w-full py-1 px-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded text-[10.5px] font-bold flex items-center justify-center gap-1 transition"
                                title="Chèn thêm sơ đồ tập đồng loạt, tổ nhóm, cặp đôi hoặc cá nhân vào dòng này"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>+ Thêm Sơ Đồ Khác (Đồng loạt / Tổ / Cặp / Cá nhân)</span>
                              </button>
                            )}
                          </div>
                        ) : effectiveEditMode ? (
                          <div className="p-2 bg-blue-50/90 border border-dashed border-blue-300 rounded-xl text-center space-y-1">
                            <p className="text-[10px] text-blue-900 font-medium">
                              ⚠️ Chưa gắn sơ đồ đội hình cho hoạt động này
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setTargetColAttachment({
                                  rowIndex: idx,
                                  col: 'hs',
                                  type: 'formation'
                                });
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs transition"
                            >
                              <Users className="w-3 h-3" /> Chọn sơ đồ đội hình
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Giáo án được bảo đảm tương thích in ấn A4 và xuất file Word đầy đủ hình ảnh
          </span>

          <button
            type="button"
            onClick={onSwitchToExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Eye className="w-4 h-4" /> Xem Trước & In Giáo Án
          </button>
        </div>
      </div>

      {/* Select Formation Modal (Dùng cho cả inline con trỏ và đính kèm cột) */}
      {(targetRowForFormation !== null || targetColAttachment?.type === 'formation' || targetInlinePicker?.type === 'formation') && (
        <SelectFormationModal
          isOpen={true}
          onClose={() => {
            setTargetRowForFormation(null);
            setTargetColAttachment(null);
            setTargetInlinePicker(null);
          }}
          targetRowIndex={targetRowForFormation ?? targetColAttachment?.rowIndex ?? targetInlinePicker?.rowIndex ?? 0}
          grade={grade}
          libraryImages={images}
          onSelectFormation={onConfirmFormationSelection}
        />
      )}

      {/* Select Movement Image Modal (Dùng cho cả inline con trỏ và đính kèm cột) */}
      {(targetRowForImage !== null || targetColAttachment?.type === 'image' || targetInlinePicker?.type === 'image') && (
        <SelectMovementImageModal
          isOpen={true}
          onClose={() => {
            setTargetRowForImage(null);
            setTargetColAttachment(null);
            setTargetInlinePicker(null);
          }}
          targetRowIndex={targetRowForImage ?? targetColAttachment?.rowIndex ?? targetInlinePicker?.rowIndex ?? 0}
          userImages={images}
          onSelectImage={onConfirmImageSelection}
        />
      )}

      {/* Formation Studio Modal */}
      {targetRowForStudio !== null && (
        <FormationStudioModal
          isOpen={true}
          onClose={() => setTargetRowForStudio(null)}
          targetRowIndex={targetRowForStudio}
          initialFormation={studioInitialDiagram}
          libraryImages={images}
          grade={grade}
          onApplyFormationToRow={(rowIdx, customFormation) => {
            handleSelectFormation(rowIdx, customFormation);
            saveCustomFormationToStorage(customFormation);
            setTargetRowForStudio(null);
            showToast(`✨ Đã áp dụng sơ đồ "${customFormation.name}" vào Cột 4 dòng số ${rowIdx + 1}!`);
          }}
          onSaveToLibrary={(customFormation) => {
            saveCustomFormationToStorage(customFormation);
            showToast(`💾 Đã lưu sơ đồ "${customFormation.name}" vào thư viện đội hình!`);
          }}
        />
      )}

      {/* Version History & Draft Resume Modal */}
      {isVersionModalOpen && planVersionStore && onSaveOfficialVersion && onLoadPlanVersion && onToggleBestVersion && onDeletePlanVersion && (
        <PlanVersionHistoryModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          store={planVersionStore}
          initialTargetKey={activePlanKey}
          targets={[
            {
              week,
              grade: grade as 1 | 3 | 5,
              lessonNum,
              title,
              currentPlan: currentPlanSnapshot,
              defaultBaselinePlan: {
                ...currentPlanSnapshot,
                rows: createBalancedGranularLessonRows(grade, title, images)
              }
            }
          ]}
          onSaveNewVersion={(plan, customLabel, markAsBest, baseline, forceNew) =>
            onSaveOfficialVersion(plan, customLabel, markAsBest, baseline, forceNew ?? true)
          }
          onLoadVersion={onLoadPlanVersion}
          onToggleBest={onToggleBestVersion}
          onDeleteVersion={onDeletePlanVersion}
          onResetToDefaultBaseline={(target) => {
            if (target.defaultBaselinePlan) {
              setLessonRows(JSON.parse(JSON.stringify(target.defaultBaselinePlan.rows)));
              showToast('Đã khôi phục nội dung về bản chuẩn gốc (lịch sử các bản đã sửa vẫn được giữ nguyên).');
            }
          }}
        />
      )}
    </div>
  );
};
