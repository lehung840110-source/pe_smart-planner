import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  FileCheck2,
  FileDown,
  FileText,
  FileUp,
  FlaskConical,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  Printer,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wand2,
  X
} from 'lucide-react';
import {
  BlueprintColumnMode,
  CustomLayoutBlueprint,
  DiagramAttachment,
  ImportedTemplateWorkspace,
  ImportedWeeklyPlanEntry,
  LessonRow,
  SchoolSettings,
  SgkImageItem,
  UserCustomTemplate
} from '../types/gdtc';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import { FormationDiagram } from '../data/formationDiagrams';
import {
  analyzeLessonLayoutFile,
  analyzeLessonLayoutText,
  autoAnalyzeAndInsertFormationsForRows,
  COLUMN_MODE_LIST,
  COLUMN_MODE_SPECS,
  createBlueprintFromPreset,
  extractRowAttachments,
  loadTemplateLabWorkspacesAsync,
  normalizeBlueprintWidths,
  parseExternalWeeklyPlanFile,
  projectRowForBlueprint,
  saveTemplateLabWorkspacesAsync
} from '../utils/customLayoutBlueprint';
import { ParsedLessonFileResult, toUserCustomTemplate, customTemplateToMasterPlan } from '../utils/documentParser';
import { exportCleanWordDocxFromData } from '../utils/exportUtils';
import { cleanLessonTitleForHeader, cleanTopicForDisplay } from '../utils/curriculumAuditSync';
import { RichTextWithImages } from '../utils/inlineImageHelper';
import { splitColumn1ContentForMedia } from '../utils/column1MediaLayout';
import { isInvalidColumn1AttachmentForRow } from '../utils/planAutoMatcher';
import { SelectFormationModal } from './SelectFormationModal';
import { SelectMovementImageModal } from './SelectMovementImageModal';
import { FaithfulOriginalDocumentViewer } from './FaithfulOriginalDocumentViewer';
import {
  getOriginalDocumentDB,
  StoredOriginalDocument
} from '../utils/originalDocumentStore';

interface TabTemplateLabProps {
  blueprints: CustomLayoutBlueprint[];
  activeBlueprintId: string | null;
  onSaveBlueprint: (bp: CustomLayoutBlueprint, activate?: boolean) => void;
  onUpdateBlueprint: (bp: CustomLayoutBlueprint) => void;
  onDeleteBlueprint: (id: string) => void;
  onActivateBlueprint: (id: string | null, applyDetectedSchoolMeta?: boolean) => void;
  onSaveUserTemplate: (tpl: UserCustomTemplate, applyImmediately: boolean) => void;
  onNavigateToExport: () => void;
  currentMasterPlan: MasterPlanItem;
  allMasterPlans: Record<string, MasterPlanItem>;
  images: SgkImageItem[];
  schoolSettings: SchoolSettings;
  showToast: (msg: string) => void;
}

async function compressUploadedMovementImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          const maxDim = 920;
          let w = img.naturalWidth || img.width || 600;
          let h = img.naturalHeight || img.height || 400;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function buildMasterPlanFromImportedEntry(
  entry: ImportedWeeklyPlanEntry,
  parsedFallback?: ParsedLessonFileResult
): MasterPlanItem {
  const clampedGrade = Math.min(5, Math.max(1, entry.gradeNum || 1)) as 1 | 2 | 3 | 4 | 5;
  const tpl = toUserCustomTemplate(
    {
      ...(parsedFallback || { rows: entry.rows }),
      name: entry.lessonTitle,
      title: entry.lessonTitle,
      topic: entry.topic,
      week: entry.week,
      grade: clampedGrade,
      rawGrade: entry.gradeNum,
      lessonNum: entry.period,
      dateRange: entry.dateRange || parsedFallback?.dateRange || `Tuần ${entry.week} · Tiết PPCT ${entry.period}`,
      rows: entry.rows
    },
    entry.lessonTitle
  );
  return customTemplateToMasterPlan(tpl);
}

export const TabTemplateLab: React.FC<TabTemplateLabProps> = ({
  blueprints,
  activeBlueprintId,
  onSaveBlueprint,
  onUpdateBlueprint,
  onDeleteBlueprint,
  onActivateBlueprint,
  onSaveUserTemplate,
  onNavigateToExport,
  currentMasterPlan,
  allMasterPlans,
  images,
  schoolSettings,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const weeklyPlanFileInputRef = useRef<HTMLInputElement | null>(null);
  const movementImageInputRef = useRef<HTMLInputElement | null>(null);

  const [inputMode, setInputMode] = useState<'upload' | 'paste' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ label: string; percent: number } | null>(null);
  const [isExportingTest, setIsExportingTest] = useState(false);
  const [isImportingWeeklyPlan, setIsImportingWeeklyPlan] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [pastedName, setPastedName] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    activeBlueprintId || blueprints[0]?.id || null
  );
  const [lastParsedByBlueprintId, setLastParsedByBlueprintId] = useState<
    Record<string, ParsedLessonFileResult>
  >({});
  const [workspacesByBlueprintId, setWorkspacesByBlueprintId] = useState<
    Record<string, ImportedTemplateWorkspace>
  >({});
  const [previewPlanKey, setPreviewPlanKey] = useState<string>('current');
  const [applyDetectedMetaOnActivate, setApplyDetectedMetaOnActivate] = useState<boolean>(true);
  const [editorSectionOpen, setEditorSectionOpen] = useState<'columns' | 'header' | 'sections' | 'signatures'>('columns');

  // Scope within the 1 selected week: show the full week (all periods of that week) or a specific period in that week
  const [weekScopeMode, setWeekScopeMode] = useState<'full_week' | 'single_period'>('full_week');

  // Interactive media modals & upload targets for imported lesson plan
  const [uploadTargetRowIdx, setUploadTargetRowIdx] = useState<number>(1);
  const [formationModalRowIdx, setFormationModalRowIdx] = useState<number | null>(null);
  const [libraryImageModalRowIdx, setLibraryImageModalRowIdx] = useState<number | null>(null);

  // Faithful verbatim original document (100% untouched PDF / Word / HTML) & viewer mode
  const [originalDocument, setOriginalDocument] = useState<StoredOriginalDocument | null>(null);
  const [sandboxViewMode, setSandboxViewMode] = useState<'original' | 'structured'>('original');

  // Load persisted imported workspaces from IndexedDB on mount
  useEffect(() => {
    let alive = true;
    loadTemplateLabWorkspacesAsync().then((loaded) => {
      if (!alive || !loaded || Object.keys(loaded).length === 0) return;
      setWorkspacesByBlueprintId(loaded);
      const initialId = activeBlueprintId || blueprints[0]?.id;
      if (initialId && loaded[initialId]) {
        setPreviewPlanKey('uploaded_file');
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const persistWorkspaceUpdate = (
    blueprintId: string,
    updater: (prevWs: ImportedTemplateWorkspace) => ImportedTemplateWorkspace
  ) => {
    setWorkspacesByBlueprintId((prev) => {
      const existing = prev[blueprintId];
      if (!existing) return prev;
      const updated = updater(existing);
      const next = { ...prev, [blueprintId]: updated };
      saveTemplateLabWorkspacesAsync(next).catch(() => {});
      return next;
    });
  };

  const selectedBlueprint: CustomLayoutBlueprint | null = useMemo(() => {
    if (selectedBlueprintId) {
      const found = blueprints.find((b) => b.id === selectedBlueprintId);
      if (found) return found;
    }
    if (activeBlueprintId) {
      const found = blueprints.find((b) => b.id === activeBlueprintId);
      if (found) return found;
    }
    return blueprints[0] || null;
  }, [blueprints, selectedBlueprintId, activeBlueprintId]);

  const activeBlueprint = useMemo(
    () => (activeBlueprintId ? blueprints.find((b) => b.id === activeBlueprintId) || null : null),
    [blueprints, activeBlueprintId]
  );

  const activeWorkspace: ImportedTemplateWorkspace | null = useMemo(() => {
    if (!selectedBlueprint) return null;
    return workspacesByBlueprintId[selectedBlueprint.id] || null;
  }, [selectedBlueprint, workspacesByBlueprintId]);

  const activeImportedEntry: ImportedWeeklyPlanEntry | null = useMemo(() => {
    if (!activeWorkspace || activeWorkspace.weeklySchedule.length === 0) return null;
    return (
      activeWorkspace.weeklySchedule.find((e) => e.id === activeWorkspace.selectedEntryId) ||
      activeWorkspace.weeklySchedule[0]
    );
  }, [activeWorkspace]);

  // Switch preview automatically to teacher's imported lesson plan when selecting a blueprint that has one
  useEffect(() => {
    if (activeWorkspace && activeImportedEntry) {
      setPreviewPlanKey('uploaded_file');
    } else if (previewPlanKey === 'uploaded_file') {
      setPreviewPlanKey('current');
    }
  }, [selectedBlueprint?.id, Boolean(activeWorkspace)]);

  // Load saved original verbatim document (PDF bytes / Word HTML) whenever selected blueprint changes
  useEffect(() => {
    let alive = true;
    const bpId = selectedBlueprint?.id;
    if (!bpId) {
      setOriginalDocument(null);
      setSandboxViewMode('structured');
      return;
    }
    getOriginalDocumentDB(bpId).then((doc) => {
      if (!alive) return;
      setOriginalDocument(doc);
      if (doc) {
        setSandboxViewMode('original');
      } else {
        setSandboxViewMode('structured');
      }
    });
    return () => {
      alive = false;
    };
  }, [selectedBlueprint?.id]);

  // Sample plans available for live sandbox rendering
  const samplePlanOptions = useMemo(() => {
    const opts: Array<{ key: string; label: string; plan: MasterPlanItem }> = [];
    const uploadedParsed = selectedBlueprint ? lastParsedByBlueprintId[selectedBlueprint.id] : undefined;

    if (activeImportedEntry) {
      const asPlan = buildMasterPlanFromImportedEntry(activeImportedEntry, uploadedParsed);
      opts.push({
        key: 'uploaded_file',
        label: `📄 Giáo án thầy cô nhập: ${activeImportedEntry.gradeLabel} · Tuần ${activeImportedEntry.week} · Tiết ${activeImportedEntry.period} – ${activeImportedEntry.lessonTitle}`,
        plan: asPlan
      });
    } else if (uploadedParsed && uploadedParsed.rows && uploadedParsed.rows.length > 0) {
      const asPlan = customTemplateToMasterPlan(toUserCustomTemplate(uploadedParsed, uploadedParsed.name));
      opts.push({
        key: 'uploaded_file',
        label: `📄 Bài trích từ file vừa tải (${uploadedParsed.rows.length} hoạt động)`,
        plan: asPlan
      });
    }

    opts.push({
      key: 'current',
      label: `⭐ Bài đang soạn trong ứng dụng: Khối ${currentMasterPlan.grade} · Tuần ${currentMasterPlan.week} – ${cleanLessonTitleForHeader(
        currentMasterPlan.title
      )}`,
      plan: currentMasterPlan
    });

    const seen = new Set<string>([`${currentMasterPlan.grade}_${currentMasterPlan.week}_${currentMasterPlan.lessonNum}`]);
    Object.entries(allMasterPlans || {}).forEach(([k, p]) => {
      if (!p || !Array.isArray(p.rows) || p.rows.length === 0) return;
      const sig = `${p.grade}_${p.week}_${p.lessonNum}`;
      if (seen.has(sig)) return;
      seen.add(sig);
      opts.push({
        key: k,
        label: `Khối ${p.grade} · Tuần ${p.week} · Tiết ${p.lessonNum} – ${cleanLessonTitleForHeader(p.title)}`,
        plan: p
      });
    });
    return opts.slice(0, 14);
  }, [currentMasterPlan, allMasterPlans, selectedBlueprint, lastParsedByBlueprintId, activeImportedEntry]);

  const previewPlan: MasterPlanItem = useMemo(() => {
    const found = samplePlanOptions.find((o) => o.key === previewPlanKey);
    return found ? found.plan : currentMasterPlan;
  }, [samplePlanOptions, previewPlanKey, currentMasterPlan]);

  const isViewingImportedLesson = previewPlanKey === 'uploaded_file' && Boolean(activeWorkspace && activeImportedEntry);

  const handleAnalyzeFile = async (file: File) => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisProgress({ label: `Đang tiếp nhận "${file.name}"...`, percent: 8 });
    try {
      const { blueprint, parsedContent, workspace, originalDocument: savedOrigDoc } = await analyzeLessonLayoutFile(
        file,
        (label, percent) => {
          setAnalysisProgress({ label, percent });
        }
      );
      onSaveBlueprint(blueprint, false);
      setSelectedBlueprintId(blueprint.id);
      setLastParsedByBlueprintId((prev) => ({ ...prev, [blueprint.id]: parsedContent }));
      setWorkspacesByBlueprintId((prev) => {
        const next = { ...prev, [blueprint.id]: workspace };
        saveTemplateLabWorkspacesAsync(next).catch(() => {});
        return next;
      });
      setOriginalDocument(savedOrigDoc);
      setSandboxViewMode('original');
      setPreviewPlanKey('uploaded_file');
      setWeekScopeMode('full_week');

      const distinctWeeks = new Set(workspace.weeklySchedule.map((e) => e.week)).size;
      const firstWeek = workspace.weeklySchedule[0]?.week || 1;
      showToast(
        distinctWeeks > 1
          ? `✅ Đã tiếp nhận "${file.name}" (${distinctWeeks} tuần). Đang hiển thị gọn 1 giáo án hoàn thiện nguyên vẹn của Tuần ${firstWeek} — thầy cô có thể chọn tuần bất kỳ!`
          : `✅ Đã tiếp nhận nguyên vẹn giáo án "${file.name}" — giữ nguyên 100% nội dung và hình ảnh gốc!`
      );
    } catch (err: any) {
      console.error('Layout analysis error:', err);
      showToast(`⚠️ Không thể phân tích tệp "${file.name}": ${err?.message || 'Định dạng chưa hỗ trợ.'}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyzePastedText = () => {
    if (!pastedText.trim()) {
      showToast('Vui lòng dán nội dung giáo án mẫu vào ô trước khi phân tích.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const { blueprint, parsedContent, workspace, originalDocument: savedOrigDoc } = analyzeLessonLayoutText(
        pastedText,
        pastedName.trim() || 'Mẫu giáo án dán trực tiếp'
      );
      onSaveBlueprint(blueprint, false);
      setSelectedBlueprintId(blueprint.id);
      setLastParsedByBlueprintId((prev) => ({ ...prev, [blueprint.id]: parsedContent }));
      setWorkspacesByBlueprintId((prev) => {
        const next = { ...prev, [blueprint.id]: workspace };
        saveTemplateLabWorkspacesAsync(next).catch(() => {});
        return next;
      });
      setOriginalDocument(savedOrigDoc);
      setSandboxViewMode('original');
      setPreviewPlanKey('uploaded_file');
      showToast(
        `✅ Đã tiếp nhận nguyên vẹn giáo án "${blueprint.name}" để ứng dụng hiển thị & phân tích!`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectWeeklyEntry = (entryId: string) => {
    if (!selectedBlueprint || !activeWorkspace) return;
    persistWorkspaceUpdate(selectedBlueprint.id, (ws) => {
      const nextSchedule = ws.weeklySchedule.map((entry) => {
        if (entry.id !== entryId) return entry;
        if (entry.formationsAutoMatched) return entry;
        const autoRes = autoAnalyzeAndInsertFormationsForRows(entry.rows, entry.gradeNum);
        return {
          ...entry,
          rows: autoRes.rows,
          formationsAutoMatched: true,
          autoFormationLog: autoRes.matchLog
        };
      });
      const chosen = nextSchedule.find((e) => e.id === entryId);
      const formCount = (chosen?.rows || []).filter(
        (r) => (r.hsImages && r.hsImages.length > 0) || Boolean(r.hsImgUrl)
      ).length;
      return {
        ...ws,
        weeklySchedule: nextSchedule,
        selectedEntryId: entryId,
        autoInsertedFormationsCount: formCount
      };
    });
    setPreviewPlanKey('uploaded_file');
  };

  const handleRunAutoFormationsOnCurrent = () => {
    if (!selectedBlueprint || !activeWorkspace || !activeImportedEntry) return;
    const autoRes = autoAnalyzeAndInsertFormationsForRows(
      activeImportedEntry.rows,
      activeImportedEntry.gradeNum,
      { forceReplaceAuto: true }
    );
    persistWorkspaceUpdate(selectedBlueprint.id, (ws) => ({
      ...ws,
      weeklySchedule: ws.weeklySchedule.map((e) =>
        e.id === activeImportedEntry.id
          ? {
              ...e,
              rows: autoRes.rows,
              formationsAutoMatched: true,
              autoFormationLog: autoRes.matchLog
            }
          : e
      ),
      autoInsertedFormationsCount: autoRes.insertedCount
    }));
    setPreviewPlanKey('uploaded_file');
    setSandboxViewMode('structured');
    showToast(
      `✨ Ứng dụng đã phân tích ${activeImportedEntry.rows.length} hoạt động và chèn thử ${autoRes.insertedCount} sơ đồ đội hình từ thư viện (Bản gốc của thầy cô vẫn giữ nguyên vẹn 100%)!`
    );
  };

  const handleImportExternalWeeklyPlan = async (file: File) => {
    if (!selectedBlueprint || !activeWorkspace || !file) return;
    setIsImportingWeeklyPlan(true);
    try {
      const templateRows = activeImportedEntry?.rows || [];
      const importedEntries = await parseExternalWeeklyPlanFile(
        file,
        activeWorkspace.detectedGradeNum || 1,
        templateRows
      );
      if (importedEntries.length === 0) {
        showToast('⚠️ Không tìm thấy danh sách Tuần / Tiết trong tệp kế hoạch tuần vừa chọn.');
        return;
      }
      // Run auto formation matching on first newly imported entry
      const firstAuto = autoAnalyzeAndInsertFormationsForRows(
        importedEntries[0].rows,
        importedEntries[0].gradeNum
      );
      importedEntries[0] = {
        ...importedEntries[0],
        rows: firstAuto.rows,
        formationsAutoMatched: true,
        autoFormationLog: firstAuto.matchLog
      };

      persistWorkspaceUpdate(selectedBlueprint.id, (ws) => ({
        ...ws,
        weeklySchedule: importedEntries,
        selectedEntryId: importedEntries[0].id,
        weeklyPlanSourceName: file.name,
        autoInsertedFormationsCount: firstAuto.insertedCount
      }));
      setPreviewPlanKey('uploaded_file');
      showToast(
        `📅 Đã nạp kế hoạch tuần từ "${file.name}" (${importedEntries.length} tiết dạy) để phân tích cùng mẫu giáo án!`
      );
    } catch (err: any) {
      showToast(`⚠️ Lỗi đọc kế hoạch tuần: ${err?.message || 'Vui lòng thử tệp .docx, .pdf hoặc .txt.'}`);
    } finally {
      setIsImportingWeeklyPlan(false);
      if (weeklyPlanFileInputRef.current) weeklyPlanFileInputRef.current.value = '';
    }
  };

  const updateImportedRow = (rowIdx: number, updater: (row: LessonRow) => LessonRow) => {
    if (!selectedBlueprint || !activeWorkspace || !activeImportedEntry) return;
    persistWorkspaceUpdate(selectedBlueprint.id, (ws) => {
      const nextSchedule = ws.weeklySchedule.map((entry) => {
        if (entry.id !== activeImportedEntry.id) return entry;
        const nextRows = entry.rows.map((r, idx) => (idx === rowIdx ? updater(r) : r));
        return { ...entry, rows: nextRows };
      });
      const updatedEntry = nextSchedule.find((e) => e.id === activeImportedEntry.id);
      const uploadedImgCount = (updatedEntry?.rows || []).reduce(
        (sum, r) => sum + (Array.isArray(r.contentImages) ? r.contentImages.length : r.contentImgUrl ? 1 : 0),
        0
      );
      const formCount = (updatedEntry?.rows || []).filter(
        (r) => (r.hsImages && r.hsImages.length > 0) || Boolean(r.hsImgUrl)
      ).length;
      return {
        ...ws,
        weeklySchedule: nextSchedule,
        teacherUploadedImagesCount: uploadedImgCount,
        autoInsertedFormationsCount: formCount
      };
    });
  };

  const handleUploadMovementImagesForRow = async (files: FileList | null, targetRowIdx: number) => {
    if (!files || files.length === 0 || !activeImportedEntry) return;
    const safeIdx = Math.min(Math.max(0, targetRowIdx), Math.max(0, activeImportedEntry.rows.length - 1));
    const added: DiagramAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      const dataUrl = await compressUploadedMovementImage(f);
      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      added.push({
        id: `teacher_mv_${Date.now()}_${i}`,
        url: dataUrl,
        title: cleanName || `Hình minh họa động tác ${i + 1}`,
        userPinned: true
      });
    }
    if (added.length === 0) return;

    updateImportedRow(safeIdx, (row) => {
      const existing: DiagramAttachment[] = Array.isArray(row.contentImages)
        ? [...row.contentImages]
        : row.contentImgUrl
        ? [{ id: `orig_c_${safeIdx}`, url: row.contentImgUrl, title: row.contentImgTitle || 'Hình minh họa' }]
        : [];
      const merged = [...existing, ...added];
      return {
        ...row,
        contentImages: merged,
        contentImgUrl: merged[0]?.url,
        contentImgTitle: merged[0]?.title,
        userEditedMedia: true,
        userClearedContentImages: false
      };
    });
    showToast(`🖼️ Đã tải ${added.length} ảnh minh họa động tác vào Hoạt động ${safeIdx + 1}!`);
    if (movementImageInputRef.current) movementImageInputRef.current.value = '';
  };

  const handlePickLibraryImageForRow = (rowIdx: number, imgUrl: string, title: string) => {
    updateImportedRow(rowIdx, (row) => {
      const existing: DiagramAttachment[] = Array.isArray(row.contentImages)
        ? [...row.contentImages]
        : row.contentImgUrl
        ? [{ id: `orig_c_${rowIdx}`, url: row.contentImgUrl, title: row.contentImgTitle || 'Hình minh họa' }]
        : [];
      const nextImg: DiagramAttachment = {
        id: `lib_mv_${Date.now()}`,
        url: imgUrl,
        title: title || 'Ảnh động tác từ thư viện',
        userPinned: true
      };
      const merged = [...existing, nextImg];
      return {
        ...row,
        contentImages: merged,
        contentImgUrl: merged[0]?.url,
        contentImgTitle: merged[0]?.title,
        userEditedMedia: true,
        userClearedContentImages: false
      };
    });
    showToast(`🖼️ Đã chèn ảnh "${title}" từ thư viện vào Hoạt động ${rowIdx + 1}!`);
  };

  const handleRemoveImportedContentImage = (rowIdx: number, imageIdOrIdx: string | number) => {
    updateImportedRow(rowIdx, (row) => {
      const existing: DiagramAttachment[] = Array.isArray(row.contentImages)
        ? [...row.contentImages]
        : row.contentImgUrl
        ? [{ id: `orig_c_${rowIdx}`, url: row.contentImgUrl, title: row.contentImgTitle || '' }]
        : [];
      const filtered = existing.filter((im, idx) =>
        typeof imageIdOrIdx === 'string' ? im.id !== imageIdOrIdx : idx !== imageIdOrIdx
      );
      return {
        ...row,
        contentImages: filtered,
        contentImgUrl: filtered[0]?.url,
        contentImgTitle: filtered[0]?.title,
        userEditedMedia: true,
        userClearedContentImages: filtered.length === 0
      };
    });
  };

  const handleSelectFormationForRow = (rowIdx: number, formation: FormationDiagram) => {
    updateImportedRow(rowIdx, (row) => {
      const picked: DiagramAttachment = {
        id: `lib_form_${formation.id}_${Date.now()}`,
        url: formation.svgDataUrl,
        title: formation.name,
        userPinned: true
      };
      return {
        ...row,
        hsImages: [picked],
        hsImgUrl: picked.url,
        hsImgTitle: picked.title,
        userEditedMedia: true,
        userClearedHsImages: false
      };
    });
    setFormationModalRowIdx(null);
    showToast(`🧩 Đã chọn sơ đồ "${formation.name}" từ thư viện cho Hoạt động ${rowIdx + 1}!`);
  };

  const handleRemoveImportedFormation = (rowIdx: number) => {
    updateImportedRow(rowIdx, (row) => ({
      ...row,
      hsImages: [],
      hsImgUrl: undefined,
      hsImgTitle: undefined,
      userEditedMedia: true,
      userClearedHsImages: true
    }));
  };

  const handleCreatePreset = (mode: BlueprintColumnMode) => {
    const spec = COLUMN_MODE_SPECS[mode];
    const bp = createBlueprintFromPreset(mode, `Mẫu ${spec.shortLabel}`);
    onSaveBlueprint(bp, false);
    setSelectedBlueprintId(bp.id);
    showToast(`✨ Đã tạo & tự động lưu mẫu thử "${bp.name}"!`);
  };

  const handleDuplicateSelected = () => {
    if (!selectedBlueprint) return;
    const now = Date.now();
    const copy: CustomLayoutBlueprint = {
      ...JSON.parse(JSON.stringify(selectedBlueprint)),
      id: `bp_copy_${now}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${selectedBlueprint.name} (Bản sao)`,
      createdAt: now,
      updatedAt: now
    };
    onSaveBlueprint(copy, false);
    setSelectedBlueprintId(copy.id);
    showToast(`📋 Đã nhân bản mẫu "${copy.name}".`);
  };

  const patchSelectedBlueprint = (updater: (bp: CustomLayoutBlueprint) => CustomLayoutBlueprint) => {
    if (!selectedBlueprint) return;
    const updated = {
      ...updater(selectedBlueprint),
      updatedAt: Date.now()
    };
    onUpdateBlueprint(updated);
  };

  const handleColumnModeChange = (nextMode: BlueprintColumnMode) => {
    const spec = COLUMN_MODE_SPECS[nextMode];
    patchSelectedBlueprint((bp) => ({
      ...bp,
      columnMode: nextMode,
      columnHeaders: [...spec.defaultHeaders],
      columnWidths: [...spec.defaultWidths]
    }));
  };

  const handleTestWordExport = async () => {
    if (!selectedBlueprint) return;
    setIsExportingTest(true);
    try {
      const safeSlug = selectedBlueprint.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 32);

      await exportCleanWordDocxFromData({
        plans: [previewPlan],
        settings: {
          ...schoolSettings,
          schoolName:
            (applyDetectedMetaOnActivate && selectedBlueprint.detectedSchoolName) || schoolSettings.schoolName,
          departmentName:
            (applyDetectedMetaOnActivate && selectedBlueprint.detectedDepartmentName) || schoolSettings.departmentName,
          teacherName:
            (applyDetectedMetaOnActivate && selectedBlueprint.detectedTeacherName) || schoolSettings.teacherName,
          approverPrincipal:
            (applyDetectedMetaOnActivate && selectedBlueprint.detectedApproverPrincipal) ||
            schoolSettings.approverPrincipal,
          approverHead:
            (applyDetectedMetaOnActivate && selectedBlueprint.detectedApproverHead) || schoolSettings.approverHead
        },
        week: previewPlan.week,
        includeSchedule: false,
        format: 'docx',
        filename: `Thu_Mau_${safeSlug || 'GiaoAn'}_K${
          isViewingImportedLesson && activeImportedEntry ? activeImportedEntry.gradeNum : previewPlan.grade
        }_T${previewPlan.week}_Tiet${previewPlan.lessonNum}.docx`,
        layoutBlueprint: selectedBlueprint
      });
      showToast(`📄 Đã xuất thử file Word (.docx) theo mẫu "${selectedBlueprint.name}"!`);
    } catch (err: any) {
      showToast(`⚠️ Lỗi xuất thử Word: ${err?.message || 'Vui lòng thử lại.'}`);
    } finally {
      setIsExportingTest(false);
    }
  };

  const handleImportParsedContentDirectly = () => {
    if (!selectedBlueprint) return;
    if (activeImportedEntry && activeImportedEntry.rows.length > 0) {
      const parsed = lastParsedByBlueprintId[selectedBlueprint.id];
      const clampedGrade = Math.min(5, Math.max(1, activeImportedEntry.gradeNum || 1));
      const tpl = toUserCustomTemplate(
        {
          ...(parsed || { rows: activeImportedEntry.rows }),
          name: activeImportedEntry.lessonTitle || selectedBlueprint.name,
          title: activeImportedEntry.lessonTitle,
          topic: activeImportedEntry.topic,
          week: activeImportedEntry.week,
          grade: clampedGrade,
          rawGrade: activeImportedEntry.gradeNum,
          lessonNum: activeImportedEntry.period,
          rows: JSON.parse(JSON.stringify(activeImportedEntry.rows))
        },
        activeImportedEntry.lessonTitle || selectedBlueprint.name
      );
      onSaveUserTemplate(tpl, true);
      return;
    }
    const parsed = lastParsedByBlueprintId[selectedBlueprint.id];
    if (!parsed || !parsed.rows || parsed.rows.length === 0) return;
    const tpl = toUserCustomTemplate(parsed, parsed.name || selectedBlueprint.name);
    onSaveUserTemplate(tpl, true);
  };

  const effectivePreviewSettings: SchoolSettings = useMemo(() => {
    if (!selectedBlueprint || !applyDetectedMetaOnActivate) return schoolSettings;
    return {
      ...schoolSettings,
      schoolName: selectedBlueprint.detectedSchoolName || schoolSettings.schoolName,
      departmentName: selectedBlueprint.detectedDepartmentName || schoolSettings.departmentName,
      teacherName: selectedBlueprint.detectedTeacherName || schoolSettings.teacherName,
      approverPrincipal: selectedBlueprint.detectedApproverPrincipal || schoolSettings.approverPrincipal,
      approverHead: selectedBlueprint.detectedApproverHead || schoolSettings.approverHead
    };
  }, [selectedBlueprint, applyDetectedMetaOnActivate, schoolSettings]);

  const currentBlueprintIsActive = Boolean(selectedBlueprint && activeBlueprintId === selectedBlueprint.id);
  const uploadedParsedForSelected = selectedBlueprint ? lastParsedByBlueprintId[selectedBlueprint.id] : undefined;

  // Group extracted schedule by week so Tab 7 ALWAYS displays strictly 1 complete week at a time
  const availableWeekGroups = useMemo(() => {
    if (!activeWorkspace || activeWorkspace.weeklySchedule.length === 0) return [];
    const map = new Map<number, ImportedWeeklyPlanEntry[]>();
    activeWorkspace.weeklySchedule.forEach((e) => {
      const list = map.get(e.week) || [];
      list.push(e);
      map.set(e.week, list);
    });
    const sortedWeeks = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedWeeks.map((w, idx) => {
      const entries = (map.get(w) || []).sort((a, b) => a.period - b.period);
      const startPage = entries.reduce(
        (min, e) => (e.pageHint && e.pageHint < min ? e.pageHint : min),
        entries[0]?.pageHint || 1
      );
      const nextWeekNum = sortedWeeks[idx + 1];
      const nextWeekEntries = nextWeekNum !== undefined ? map.get(nextWeekNum) || [] : [];
      const nextWeekStartPage = nextWeekEntries[0]?.pageHint;
      const computedEnd =
        nextWeekStartPage && nextWeekStartPage > startPage
          ? nextWeekStartPage - 1
          : entries.reduce(
              (max, e) => Math.max(max, e.endPageHint || e.pageHint || startPage),
              startPage
            );
      const endPage = Math.max(startPage, computedEnd);
      const topicSummary = entries[0]?.topic || entries[0]?.lessonTitle || `Tuần ${w}`;
      return {
        week: w,
        nextWeekNumber: nextWeekNum,
        entries,
        startPage,
        endPage,
        topicSummary
      };
    });
  }, [activeWorkspace]);

  const selectedWeekGroup = useMemo(() => {
    if (availableWeekGroups.length === 0) return null;
    const matched = availableWeekGroups.find((g) => g.week === activeImportedEntry?.week);
    return matched || availableWeekGroups[0];
  }, [availableWeekGroups, activeImportedEntry?.week]);

  const distinctWeeksCount = availableWeekGroups.length;

  const handleSelectWeek = (weekNum: number) => {
    const group = availableWeekGroups.find((g) => g.week === weekNum);
    if (!group || group.entries.length === 0) return;
    handleSelectWeeklyEntry(group.entries[0].id);
    setWeekScopeMode('full_week');
  };

  const handlePickRandomWeek = () => {
    if (availableWeekGroups.length <= 1) return;
    const candidates = availableWeekGroups.filter((g) => g.week !== selectedWeekGroup?.week);
    const pool = candidates.length > 0 ? candidates : availableWeekGroups;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (picked) {
      handleSelectWeek(picked.week);
      showToast(`🎲 Đã chuyển sang hiển thị nguyên vẹn giáo án Tuần ${picked.week} (${picked.entries.length} tiết)!`);
    }
  };

  const currentEntryStats = useMemo(() => {
    const rows = activeImportedEntry?.rows || [];
    const formationCount = rows.filter((r) => (r.hsImages && r.hsImages.length > 0) || Boolean(r.hsImgUrl)).length;
    const movementImgCount = rows.reduce(
      (sum, r) => sum + (Array.isArray(r.contentImages) ? r.contentImages.length : r.contentImgUrl ? 1 : 0),
      0
    );
    return { totalRows: rows.length, formationCount, movementImgCount };
  }, [activeImportedEntry]);

  return (
    <div className="space-y-5">
      {/* Hidden inputs for uploading movement images & standalone weekly plan */}
      <input
        ref={movementImageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUploadMovementImagesForRow(e.target.files, uploadTargetRowIdx)}
      />
      <input
        ref={weeklyPlanFileInputRef}
        type="file"
        accept=".docx,.doc,.pdf,.html,.htm,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportExternalWeeklyPlan(f);
        }}
      />
      {/* Top Hero / Active Template Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Phòng Thử Nghiệm &amp; Phân Tích Mẫu Giáo Án Riêng
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tự động phân tích &amp; tự động lưu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                Tải file giáo án Word (<b>.docx</b>) hoặc <b>PDF</b> mẫu của trường/cá nhân thầy cô lên đây. Ứng dụng sẽ tự động nhận diện số cột (2, 3, 4 hoặc 5 cột), tiêu ngữ, tên các mục I–IV, khung ký duyệt, tự lưu lại và chạy thử ngay trên giáo án thật. Nếu thấy ưng ý, bấm <b>1 nút để áp dụng trực tiếp</b> cho toàn bộ giáo án &amp; file Word tải về!
              </p>
            </div>
          </div>

          {/* Active Global Template Indicator */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeBlueprint ? (
              <div className="flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">
                    Đang áp dụng: {activeBlueprint.name}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {COLUMN_MODE_SPECS[activeBlueprint.columnMode].shortLabel} · Tự động dùng ở Tab 6 &amp; xuất Word
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onActivateBlueprint(null)}
                  className="ml-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition"
                  title="Tắt mẫu riêng, quay về mẫu chuẩn 4 cột GDPT 2018 mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Về mẫu chuẩn</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Đang dùng: <b className="text-slate-900">Mẫu chuẩn 4 cột GDPT 2018 (Mặc định)</b>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (5/12): Upload / Saved Blueprints / Structure Editor */}
        <div className="xl:col-span-5 space-y-4">
          {/* Card 1: Upload / Paste / Quick Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileUp className="w-4 h-4 text-blue-600" />
                <span>Bước 1: Nạp mẫu giáo án để phân tích</span>
              </h3>
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-2 py-1 rounded-md transition ${
                    inputMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tải File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-2 py-1 rounded-md transition ${
                    inputMode === 'paste' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dán chữ
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('presets')}
                  className={`px-2 py-1 rounded-md transition ${
                    inputMode === 'presets' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mẫu sẵn
                </button>
              </div>
            </div>

            <div className="p-4">
              {inputMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.pdf,.html,.htm,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAnalyzeFile(f);
                    }}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleAnalyzeFile(f);
                    }}
                    onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/70'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-sm font-bold text-blue-800">
                          {analysisProgress?.label || 'Đang phân tích cấu trúc bảng, kế hoạch tuần & sơ đồ đội hình...'}
                        </p>
                        {analysisProgress && (
                          <div className="w-full max-w-xs bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full transition-all duration-200"
                              style={{ width: `${Math.min(100, Math.max(8, analysisProgress.percent))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Kéo thả hoặc nhấn chọn file giáo án mẫu của thầy cô
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Hỗ trợ tốt nhất <b>Word (.docx)</b>, ngoài ra hỗ trợ <b>.doc, .pdf, .html</b>
                          </p>
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          Chọn file &amp; Phân tích tự động
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inputMode === 'paste' && (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={pastedName}
                    onChange={(e) => setPastedName(e.target.value)}
                    placeholder="Đặt tên mẫu (VD: Mẫu trường Tiểu học Vệ Giang)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    rows={5}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Dán toàn bộ nội dung 1 bài giáo án mẫu từ Word vào đây (có thể copy cả tiêu ngữ, mục I, II, III, bảng các cột và khung chữ ký)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzePastedText}
                    disabled={isAnalyzing}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    <span>Phân tích cấu trúc &amp; Tự động lưu mẫu</span>
                  </button>
                </div>
              )}

              {inputMode === 'presets' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">
                    Chưa có sẵn file? Chọn nhanh 1 trong 6 kiểu khung giáo án phổ biến tại các trường Tiểu học để xem thử và tùy biến ngay:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COLUMN_MODE_LIST.map((spec) => (
                      <button
                        key={spec.mode}
                        type="button"
                        onClick={() => handleCreatePreset(spec.mode)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900">{spec.shortLabel}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {spec.colCount} cột
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{spec.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Auto-Saved Blueprints Library */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Kho mẫu đã phân tích &amp; tự lưu ({blueprints.length})</span>
              </h3>
              {selectedBlueprint && (
                <button
                  type="button"
                  onClick={handleDuplicateSelected}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Tạo bản sao của mẫu đang chọn để thử biến thể khác"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nhân bản</span>
                </button>
              )}
            </div>

            <div className="p-3">
              {blueprints.length === 0 ? (
                <div className="text-center py-5 px-3 text-xs text-slate-500 space-y-2">
                  <p>Chưa có mẫu riêng nào được lưu.</p>
                  <p>
                    Hãy tải 1 file <b>.docx / .pdf</b> ở trên hoặc nhấn <b>Mẫu sẵn</b> để thử ngay!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {blueprints.map((bp) => {
                    const isSelected = selectedBlueprint?.id === bp.id;
                    const isApplied = activeBlueprintId === bp.id;
                    const spec = COLUMN_MODE_SPECS[bp.columnMode];
                    return (
                      <div
                        key={bp.id}
                        onClick={() => setSelectedBlueprintId(bp.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/70 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{bp.name}</span>
                            {isApplied && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                Đang áp dụng
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            <span className="font-semibold text-blue-700">{spec.shortLabel}</span>
                            <span>·</span>
                            <span>{bp.signatureBlock.count} cột ký</span>
                            <span>·</span>
                            <span>Độ khớp {bp.confidenceScore}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlueprintId(bp.id);
                              onActivateBlueprint(isApplied ? null : bp.id, applyDetectedMetaOnActivate);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                              isApplied
                                ? 'bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isApplied ? 'Tắt' : 'Áp dụng'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBlueprint(bp.id);
                              if (selectedBlueprintId === bp.id) {
                                const next = blueprints.find((item) => item.id !== bp.id);
                                setSelectedBlueprintId(next?.id || null);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa mẫu này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Analysis Diagnostics & Live Structure Customizer */}
          {selectedBlueprint && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Bước 2: Kết quả phân tích &amp; Tinh chỉnh nhanh</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Tự lưu mọi thay đổi
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Auto-detected diagnostics */}
                <div className="space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Báo cáo nhận diện tự động
                  </div>
                  {selectedBlueprint.diagnostics.map((d) => (
                    <div key={d.id} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-600 shrink-0">{d.label}:</span>
                      <span
                        className={`font-semibold text-right ${
                          d.status === 'detected'
                            ? 'text-emerald-700'
                            : d.status === 'inferred'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Blueprint Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên mẫu đã lưu</label>
                  <input
                    type="text"
                    value={selectedBlueprint.name}
                    onChange={(e) =>
                      patchSelectedBlueprint((bp) => ({ ...bp, name: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sub-tabs for quick customization */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  {[
                    { id: 'columns', label: 'Số cột' },
                    { id: 'header', label: 'Tiêu ngữ' },
                    { id: 'sections', label: 'Mục I–IV' },
                    { id: 'signatures', label: 'Ký duyệt' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorSectionOpen(tab.id as any)}
                      className={`py-1.5 rounded-lg transition ${
                        editorSectionOpen === tab.id
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Sub-panel: Columns */}
                {editorSectionOpen === 'columns' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kiểu cấu trúc bảng tiến trình (Mục III)
                      </label>
                      <select
                        value={selectedBlueprint.columnMode}
                        onChange={(e) => handleColumnModeChange(e.target.value as BlueprintColumnMode)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {COLUMN_MODE_LIST.map((spec) => (
                          <option key={spec.mode} value={spec.mode}>
                            {spec.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {COLUMN_MODE_SPECS[selectedBlueprint.columnMode].description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Tiêu đề &amp; Tỷ lệ độ rộng từng cột (%)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const spec = COLUMN_MODE_SPECS[selectedBlueprint.columnMode];
                            patchSelectedBlueprint((bp) => ({
                              ...bp,
                              columnWidths: [...spec.defaultWidths]
                            }));
                          }}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Cân lại mặc định
                        </button>
                      </div>
                      {selectedBlueprint.columnHeaders.map((hdr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 w-10 shrink-0">
                            Cột {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={hdr}
                            onChange={(e) => {
                              const nextHeaders = [...selectedBlueprint.columnHeaders];
                              nextHeaders[idx] = e.target.value;
                              patchSelectedBlueprint((bp) => ({ ...bp, columnHeaders: nextHeaders }));
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min={4}
                              max={80}
                              value={Math.round(selectedBlueprint.columnWidths[idx] ?? 25)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (!Number.isFinite(val)) return;
                                const nextWidths = [...selectedBlueprint.columnWidths];
                                nextWidths[idx] = Math.max(4, Math.min(80, val));
                                patchSelectedBlueprint((bp) => ({
                                  ...bp,
                                  columnWidths: normalizeBlueprintWidths(nextWidths, nextWidths.length)
                                }));
                              }}
                              className="w-14 px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center font-bold tabular-nums"
                            />
                            <span className="text-[11px] text-slate-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-panel: Header & National Motto */}
                {editorSectionOpen === 'header' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedBlueprint.headerBlock.showSchoolHeader}
                          onChange={(e) =>
                            patchSelectedBlueprint((bp) => ({
                              ...bp,
                              headerBlock: { ...bp.headerBlock, showSchoolHeader: e.target.checked }
                            }))
                          }
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-800">Hiện Tên trường / Tổ CM</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedBlueprint.headerBlock.showNationalMotto}
                          onChange={(e) =>
                            patchSelectedBlueprint((bp) => ({
                              ...bp,
                              headerBlock: { ...bp.headerBlock, showNationalMotto: e.target.checked }
                            }))
                          }
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-800">Hiện Quốc hiệu – Tiêu ngữ</span>
                      </label>
                    </div>

                    {selectedBlueprint.headerBlock.showSchoolHeader && (
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Dòng 1 góc trái (Phòng GD / Tên trường)
                          </label>
                          <input
                            type="text"
                            value={selectedBlueprint.headerBlock.topLeftLine1}
                            placeholder={effectivePreviewSettings.schoolName}
                            onChange={(e) =>
                              patchSelectedBlueprint((bp) => ({
                                ...bp,
                                headerBlock: { ...bp.headerBlock, topLeftLine1: e.target.value }
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Dòng 2 góc trái (Tên trường / Tổ chuyên môn)
                          </label>
                          <input
                            type="text"
                            value={selectedBlueprint.headerBlock.topLeftLine2}
                            placeholder={effectivePreviewSettings.departmentName}
                            onChange={(e) =>
                              patchSelectedBlueprint((bp) => ({
                                ...bp,
                                headerBlock: { ...bp.headerBlock, topLeftLine2: e.target.value }
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tiêu đề đầu giáo án
                      </label>
                      <input
                        type="text"
                        value={selectedBlueprint.headerBlock.documentTitlePrefix}
                        onChange={(e) =>
                          patchSelectedBlueprint((bp) => ({
                            ...bp,
                            headerBlock: { ...bp.headerBlock, documentTitlePrefix: e.target.value }
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedBlueprint.headerBlock.showTeacherMetaLine}
                        onChange={(e) =>
                          patchSelectedBlueprint((bp) => ({
                            ...bp,
                            headerBlock: { ...bp.headerBlock, showTeacherMetaLine: e.target.checked }
                          }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">
                        Hiện dòng Môn học · Khối lớp · Giáo viên dưới tiêu đề
                      </span>
                    </label>
                  </div>
                )}

                {/* Sub-panel: Section I-IV Headings */}
                {editorSectionOpen === 'sections' && (
                  <div className="space-y-2.5 text-xs">
                    {[
                      { key: 'sec1', label: 'Tiêu đề Mục I' },
                      { key: 'sec2', label: 'Tiêu đề Mục II' },
                      { key: 'sec3', label: 'Tiêu đề Mục III' },
                      { key: 'sec4', label: 'Tiêu đề Mục IV' }
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {item.label}
                        </label>
                        <input
                          type="text"
                          value={(selectedBlueprint.sectionHeadings as any)[item.key]}
                          onChange={(e) =>
                            patchSelectedBlueprint((bp) => ({
                              ...bp,
                              sectionHeadings: {
                                ...bp.sectionHeadings,
                                [item.key]: e.target.value
                              }
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                    ))}
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBlueprint.sectionHeadings.showSec4}
                        onChange={(e) =>
                          patchSelectedBlueprint((bp) => ({
                            ...bp,
                            sectionHeadings: { ...bp.sectionHeadings, showSec4: e.target.checked }
                          }))
                        }
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-700">Hiển thị Mục IV (Điều chỉnh sau bài dạy)</span>
                    </label>
                  </div>
                )}

                {/* Sub-panel: Signature Block */}
                {editorSectionOpen === 'signatures' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={selectedBlueprint.signatureBlock.enabled}
                          onChange={(e) =>
                            patchSelectedBlueprint((bp) => ({
                              ...bp,
                              signatureBlock: { ...bp.signatureBlock, enabled: e.target.checked }
                            }))
                          }
                          className="rounded text-blue-600"
                        />
                        <span>Hiện khung ký duyệt cuối giáo án</span>
                      </label>

                      <div className="flex items-center gap-1">
                        {([1, 2, 3] as const).map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() =>
                              patchSelectedBlueprint((bp) => ({
                                ...bp,
                                signatureBlock: { ...bp.signatureBlock, count: cnt }
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              selectedBlueprint.signatureBlock.count === cnt
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {cnt} cột
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedBlueprint.signatureBlock.enabled && (
                      <div className="space-y-2">
                        {selectedBlueprint.signatureBlock.count >= 2 && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Chức danh bên trái
                            </label>
                            <input
                              type="text"
                              value={selectedBlueprint.signatureBlock.leftTitle}
                              onChange={(e) =>
                                patchSelectedBlueprint((bp) => ({
                                  ...bp,
                                  signatureBlock: { ...bp.signatureBlock, leftTitle: e.target.value }
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                            />
                          </div>
                        )}
                        {selectedBlueprint.signatureBlock.count === 3 && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Chức danh ở giữa
                            </label>
                            <input
                              type="text"
                              value={selectedBlueprint.signatureBlock.middleTitle}
                              onChange={(e) =>
                                patchSelectedBlueprint((bp) => ({
                                  ...bp,
                                  signatureBlock: { ...bp.signatureBlock, middleTitle: e.target.value }
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Chức danh bên phải (Người soạn)
                          </label>
                          <input
                            type="text"
                            value={selectedBlueprint.signatureBlock.rightTitle}
                            onChange={(e) =>
                              patchSelectedBlueprint((bp) => ({
                                ...bp,
                                signatureBlock: { ...bp.signatureBlock, rightTitle: e.target.value }
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detected school/teacher metadata toggle */}
                {(selectedBlueprint.detectedSchoolName ||
                  selectedBlueprint.detectedTeacherName ||
                  selectedBlueprint.detectedApproverPrincipal) && (
                  <label className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyDetectedMetaOnActivate}
                      onChange={(e) => setApplyDetectedMetaOnActivate(e.target.checked)}
                      className="rounded text-amber-600 mt-0.5"
                    />
                    <span>
                      Khi áp dụng mẫu, đồng bộ luôn thông tin nhận diện được từ file gốc:{' '}
                      <b>
                        {[
                          selectedBlueprint.detectedSchoolName,
                          selectedBlueprint.detectedTeacherName,
                          selectedBlueprint.detectedApproverPrincipal
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </b>
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (7/12): Received Notice, Weekly Plan Schedule & Live A4 Preview Sandbox */}
        <div className="xl:col-span-7 space-y-4">
          {/* Teacher Uploaded Template Status & Processing Notice Banner */}
          {activeWorkspace && activeImportedEntry && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-blue-50/80 rounded-2xl border border-emerald-300 shadow-xs p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                      Đã tiếp nhận mẫu giáo án · Chỉ hiển thị 1 giáo án hoàn thiện (Tuần {selectedWeekGroup?.week || activeImportedEntry.week})
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                      {activeWorkspace.detectedGradeLabel}
                      {selectedWeekGroup
                        ? ` · Tuần ${selectedWeekGroup.week}/${distinctWeeksCount}`
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed mt-1.5">
                    <b className="text-emerald-900">Đã tiếp nhận mẫu giáo án để ứng dụng xử lý.</b> Ứng dụng{' '}
                    <b className="text-emerald-900">chỉ hiển thị gọn nguyên vẹn 1 giáo án hoàn thiện của 1 tuần bất kỳ</b>{' '}
                    trong file (giữ nguyên 100% nội dung, bảng biểu và hình ảnh gốc — không mở tràn cả bộ nhiều tuần). Thầy cô có thể chọn tuần khác bên dưới hoặc thử ghép{' '}
                    <b className="text-blue-800">ảnh động tác</b> &amp;{' '}
                    <b className="text-teal-800">sơ đồ thư viện</b> ở chế độ Chạy thử khung mẫu.
                  </p>
                </div>
              </div>

              {/* Quick Live Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white/90 rounded-xl border border-emerald-200/80 px-3 py-2">
                  <div className="text-[11px] text-slate-500 font-semibold">Đang hiển thị gọn 1 tuần</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    Tuần {selectedWeekGroup?.week || activeImportedEntry.week}{' '}
                    {selectedWeekGroup
                      ? `(${selectedWeekGroup.entries.length} tiết · trích từ ${distinctWeeksCount} tuần)`
                      : ''}
                  </div>
                </div>
                <div className="bg-white/90 rounded-xl border border-teal-200/80 px-3 py-2">
                  <div className="text-[11px] text-slate-500 font-semibold">Sơ đồ đội hình (Thư viện)</div>
                  <div className="font-bold text-teal-800 mt-0.5">
                    Đã tự chèn {currentEntryStats.formationCount}/{currentEntryStats.totalRows} hoạt động
                  </div>
                </div>
                <div className="bg-white/90 rounded-xl border border-blue-200/80 px-3 py-2">
                  <div className="text-[11px] text-slate-500 font-semibold">Ảnh minh họa động tác</div>
                  <div className="font-bold text-blue-800 mt-0.5">
                    {currentEntryStats.movementImgCount > 0
                      ? `Đã tải ${currentEntryStats.movementImgCount} ảnh minh họa`
                      : 'Chưa có — Hãy tải ảnh động tác'}
                  </div>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const preferredRow = activeImportedEntry.rows.length > 1 ? 1 : 0;
                    setUploadTargetRowIdx(preferredRow);
                    setTimeout(() => movementImageInputRef.current?.click(), 0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Tải ảnh minh họa động tác</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunAutoFormationsOnCurrent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phân tích &amp; chèn sơ đồ phù hợp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormationModalRowIdx(0)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Mở Kho Sơ Đồ Thư Viện</span>
                </button>
              </div>
            </div>
          )}

          {/* Single-Week Focused Selector & Plan Summary (Strictly 1 Week At A Time) */}
          {activeWorkspace && selectedWeekGroup && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      Kế hoạch dạy học Tuần {selectedWeekGroup.week} ({selectedWeekGroup.entries.length} tiết · {activeWorkspace.detectedGradeLabel})
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {distinctWeeksCount > 1
                        ? `Chỉ hiển thị 1 giáo án hoàn thiện của Tuần ${selectedWeekGroup.week} (trích gọn từ file có ${distinctWeeksCount} tuần)`
                        : `Nguồn: ${activeWorkspace.weeklyPlanSourceName || activeWorkspace.fileName}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {distinctWeeksCount > 1 && (
                    <button
                      type="button"
                      onClick={handlePickRandomWeek}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1 transition"
                      title="Chọn ngẫu nhiên 1 tuần khác trong file để xem giáo án hoàn thiện"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Đổi tuần ngẫu nhiên</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => weeklyPlanFileInputRef.current?.click()}
                    disabled={isImportingWeeklyPlan}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-60"
                    title="Nạp thêm tệp Kế hoạch tuần / Phân phối chương trình (.docx, .pdf, .txt)"
                  >
                    {isImportingWeeklyPlan ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Nạp Kế hoạch tuần riêng</span>
                  </button>
                </div>
              </div>

              {/* Clean 1-Week Dropdown Selector */}
              {distinctWeeksCount > 1 && (
                <div className="px-4 py-2.5 border-b border-slate-100 bg-indigo-50/40 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 shrink-0">
                    Chọn 1 tuần bất kỳ trong file:
                  </label>
                  <div className="flex flex-wrap items-center gap-2 flex-1 justify-end min-w-[220px]">
                    <select
                      value={selectedWeekGroup.week}
                      onChange={(e) => handleSelectWeek(Number(e.target.value))}
                      className="w-full sm:w-auto sm:min-w-[290px] max-w-full px-3 py-1.5 rounded-lg border border-indigo-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableWeekGroups.map((g) => {
                        const periodText =
                          g.entries.length > 1
                            ? `Tiết ${g.entries[0].period}–${g.entries[g.entries.length - 1].period}`
                            : `Tiết ${g.entries[0]?.period || 1}`;
                        return (
                          <option key={g.week} value={g.week}>
                            Tuần {g.week} ({periodText}) – {g.topicSummary.slice(0, 48)}
                          </option>
                        );
                      })}
                    </select>
                    {selectedWeekGroup.entries.length > 1 && (
                      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setWeekScopeMode('full_week')}
                          className={`px-2 py-1 rounded-md transition ${
                            weekScopeMode === 'full_week'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Trọn Tuần {selectedWeekGroup.week}
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeekScopeMode('single_period')}
                          className={`px-2 py-1 rounded-md transition ${
                            weekScopeMode === 'single_period'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Chỉ Tiết {activeImportedEntry?.period}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compact Table Showing ONLY The 1–2 Periods Of The Selected Week */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-left">
                      <th className="py-2 px-2.5 w-16 text-center">Tuần</th>
                      <th className="py-2 px-2 w-16 text-center">Tiết</th>
                      <th className="py-2 px-2.5">Chủ đề &amp; Tên bài học trong Tuần {selectedWeekGroup.week}</th>
                      <th className="py-2 px-2.5 hidden sm:table-cell">Trò chơi / Phạm vi trang</th>
                      <th className="py-2 px-2.5 w-28 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedWeekGroup.entries.map((entry) => {
                      const isSelected = activeImportedEntry?.id === entry.id && isViewingImportedLesson;
                      const formCnt = entry.rows.filter(
                        (r) => (r.hsImages && r.hsImages.length > 0) || Boolean(r.hsImgUrl)
                      ).length;
                      const imgCnt = entry.rows.reduce(
                        (s, r) => s + (Array.isArray(r.contentImages) ? r.contentImages.length : r.contentImgUrl ? 1 : 0),
                        0
                      );

                      return (
                        <tr
                          key={entry.id}
                          onClick={() => handleSelectWeeklyEntry(entry.id)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-indigo-50/90' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-2.5 text-center font-bold text-slate-900 whitespace-nowrap">
                            Tuần {entry.week}
                          </td>
                          <td className="py-2 px-2 text-center font-semibold text-indigo-700 whitespace-nowrap">
                            Tiết {entry.period}
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="font-bold text-slate-900 leading-snug">{entry.lessonTitle}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{entry.topic}</div>
                          </td>
                          <td className="py-2 px-2.5 hidden sm:table-cell text-[11px] text-slate-600">
                            <div>{entry.gameName ? `🎯 ${entry.gameName}` : `${entry.rows.length} hoạt động`}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {entry.pageHint
                                ? entry.endPageHint && entry.endPageHint > entry.pageHint
                                  ? `Trang ${entry.pageHint}–${entry.endPageHint} · `
                                  : `Trang ${entry.pageHint} · `
                                : ''}
                              {formCnt} sơ đồ · {imgCnt} ảnh
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectWeeklyEntry(entry.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800'
                              }`}
                            >
                              {isSelected ? 'Đang mở' : 'Chọn tiết'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Preview Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {sandboxViewMode === 'original' && originalDocument
                    ? 'Bước 3: Giáo án gốc nguyên vẹn 100% của thầy cô'
                    : 'Bước 3: Chạy thử khung mẫu & ghép sơ đồ thư viện'}
                </span>
                {selectedBlueprint && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {COLUMN_MODE_SPECS[selectedBlueprint.columnMode].shortLabel}
                  </span>
                )}
              </div>

              {/* Clean 2-Mode Switcher: Verbatim Original (Default) vs Structured Blueprint Sandbox */}
              {originalDocument ? (
                <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSandboxViewMode('original')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      sandboxViewMode === 'original'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Bản gốc nguyên vẹn (100%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxViewMode('structured')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      sandboxViewMode === 'structured'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Chạy thử khung mẫu &amp; Sơ đồ</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                  <select
                    value={previewPlanKey}
                    onChange={(e) => setPreviewPlanKey(e.target.value)}
                    className="max-w-full sm:max-w-[320px] px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Chọn giáo án thầy cô nhập vào hoặc bài dạy có sẵn trong ứng dụng"
                  >
                    {samplePlanOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {originalDocument && sandboxViewMode === 'structured' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-slate-500 font-medium">
                  Chọn bài học để chạy thử khung bố cục ({COLUMN_MODE_SPECS[selectedBlueprint?.columnMode || '4col_standard'].shortLabel}):
                </span>
                <select
                  value={previewPlanKey}
                  onChange={(e) => setPreviewPlanKey(e.target.value)}
                  className="max-w-full sm:max-w-[340px] px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {samplePlanOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedBlueprint && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {currentBlueprintIsActive ? (
                  <>
                    <button
                      type="button"
                      onClick={onNavigateToExport}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Đang áp dụng · Mở Tab 6 Xem &amp; Xuất ngay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onActivateBlueprint(null)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Quay về mẫu chuẩn 4 cột</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onActivateBlueprint(selectedBlueprint.id, applyDetectedMetaOnActivate)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ứng ý rồi — Áp dụng mẫu này cho toàn bộ giáo án!</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleTestWordExport}
                  disabled={isExportingTest}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-60"
                >
                  {isExportingTest ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>Xuất thử Word (.docx)</span>
                </button>

                {((activeImportedEntry && activeImportedEntry.rows.length > 0) ||
                  (uploadedParsedForSelected && uploadedParsedForSelected.rows.length > 0)) && (
                  <button
                    type="button"
                    onClick={handleImportParsedContentDirectly}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Nạp luôn nội dung bài học cùng ảnh & sơ đồ đã ghép vào trình soạn thảo (Tab 3 / Tab 5 / Tab 6)"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Nạp luôn nội dung bài này vào trình soạn</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Live Document Viewport: Verbatim Original (100% Untouched) OR Structured Blueprint Sandbox */}
          {!selectedBlueprint ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Bản xem trước giáo án trực tiếp sẽ hiển thị tại đây
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Hãy tải file giáo án Word (.docx) hoặc PDF của thầy cô ở khung bên trái để hiển thị <b>nguyên vẹn 100% nội dung, bảng biểu &amp; hình ảnh gốc</b>, hoặc bấm thử nhanh 1 mẫu 2 cột / 3 cột / 5 cột!
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCreatePreset('2col_gv_hs')}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition"
                >
                  Thử mẫu 2 cột (CV 2345)
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePreset('3col_nd_lvd_tc')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition"
                >
                  Thử mẫu 3 cột (Có LVĐ)
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePreset('5col_stt')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                >
                  Thử mẫu 5 cột (Có STT)
                </button>
              </div>
            </div>
          ) : sandboxViewMode === 'original' && originalDocument ? (
            <FaithfulOriginalDocumentViewer
              document={originalDocument}
              lockedStartPage={
                weekScopeMode === 'single_period' && activeImportedEntry?.pageHint
                  ? activeImportedEntry.pageHint
                  : selectedWeekGroup?.startPage || activeImportedEntry?.pageHint || 1
              }
              lockedEndPage={
                weekScopeMode === 'single_period' && activeImportedEntry?.endPageHint
                  ? activeImportedEntry.endPageHint
                  : selectedWeekGroup?.endPage || activeImportedEntry?.endPageHint
              }
              selectedWeekNumber={selectedWeekGroup?.week || activeImportedEntry?.week}
              nextWeekNumber={selectedWeekGroup?.nextWeekNumber}
              isMultiWeekDocument={distinctWeeksCount > 1}
              targetLessonLabel={
                selectedWeekGroup
                  ? weekScopeMode === 'single_period' && activeImportedEntry
                    ? `${activeImportedEntry.gradeLabel} · Tuần ${activeImportedEntry.week} · Tiết ${activeImportedEntry.period} – ${activeImportedEntry.lessonTitle}`
                    : `${activeWorkspace?.detectedGradeLabel || ''} · Giáo án hoàn thiện Tuần ${selectedWeekGroup.week} (${selectedWeekGroup.entries
                        .map((e) => `Tiết ${e.period}`)
                        .join(' & ')})`
                  : originalDocument.fileName
              }
            />
          ) : (
            <div className="bg-slate-200/70 rounded-2xl p-3 sm:p-5 border border-slate-300 overflow-x-auto">
              <div
                className="bg-white shadow-md mx-auto max-w-[820px] min-w-[640px] px-7 sm:px-10 py-8 text-slate-900"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Optional National Motto & School Header */}
                {(selectedBlueprint.headerBlock.showSchoolHeader ||
                  selectedBlueprint.headerBlock.showNationalMotto) && (
                  <div className="flex items-start justify-between gap-4 mb-5 text-xs">
                    <div
                      className={
                        selectedBlueprint.headerBlock.showNationalMotto ? 'w-[46%] text-center' : 'w-full text-left'
                      }
                    >
                      {selectedBlueprint.headerBlock.showSchoolHeader && (
                        <>
                          <p className="font-bold uppercase leading-snug">
                            {selectedBlueprint.headerBlock.topLeftLine1 || effectivePreviewSettings.schoolName}
                          </p>
                          <p className="font-bold uppercase leading-snug mt-0.5">
                            {selectedBlueprint.headerBlock.topLeftLine2 || effectivePreviewSettings.departmentName}
                          </p>
                        </>
                      )}
                    </div>
                    {selectedBlueprint.headerBlock.showNationalMotto && (
                      <div className="w-[54%] text-center">
                        <p className="font-bold uppercase leading-snug">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </p>
                        <p className="font-bold underline underline-offset-4 mt-0.5">
                          Độc lập – Tự do – Hạnh phúc
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Document Title */}
                <div className="text-center space-y-1 mb-5">
                  <h3 className="font-bold text-base uppercase tracking-wide">
                    {selectedBlueprint.headerBlock.documentTitlePrefix || 'KẾ HOẠCH BÀI DẠY'} TUẦN {previewPlan.week} –{' '}
                    {isViewingImportedLesson && activeImportedEntry
                      ? activeImportedEntry.gradeLabel.toUpperCase()
                      : `KHỐI ${previewPlan.grade}`}
                  </h3>
                  <p className="text-xs italic text-slate-700">({previewPlan.dateRange})</p>
                  <p className="text-sm font-bold text-blue-900 pt-1">
                    {isViewingImportedLesson && activeImportedEntry
                      ? activeImportedEntry.topic
                      : cleanTopicForDisplay(previewPlan.topic, previewPlan.grade)}{' '}
                    &nbsp;&nbsp;&nbsp; TIẾT {previewPlan.lessonNum}
                  </p>
                  <p className="text-sm font-bold uppercase">
                    {isViewingImportedLesson && activeImportedEntry
                      ? activeImportedEntry.lessonTitle
                      : cleanLessonTitleForHeader(previewPlan.title)}
                  </p>
                  {selectedBlueprint.headerBlock.showTeacherMetaLine && (
                    <p className="text-xs pt-1 text-slate-800">
                      <b>Môn học:</b> Giáo dục thể chất &nbsp;|&nbsp; <b>Lớp:</b>{' '}
                      {isViewingImportedLesson && activeImportedEntry
                        ? activeImportedEntry.gradeLabel
                        : `Khối ${previewPlan.grade}`}{' '}
                      &nbsp;|&nbsp; <b>Giáo viên:</b> {effectivePreviewSettings.teacherName}
                    </p>
                  )}
                </div>

                {/* Section I */}
                <div className="mb-4 text-xs leading-relaxed">
                  <h4 className="font-bold uppercase text-sm mb-1.5">
                    {selectedBlueprint.sectionHeadings.sec1}
                  </h4>
                  <p className="font-bold">1. Năng lực đặc thù</p>
                  <p className="pl-3">- <i>Chăm sóc sức khỏe:</i> {previewPlan.specialCompetencies?.healthCare}</p>
                  <p className="pl-3">- <i>Vận động cơ bản:</i> {previewPlan.specialCompetencies?.basicMovement}</p>
                  <p className="font-bold mt-1">2. Năng lực chung &amp; 3. Phẩm chất</p>
                  <p className="pl-3">
                    - <i>Tự chủ, hợp tác, trách nhiệm:</i> {previewPlan.generalCompetencies?.autonomy}
                  </p>
                </div>

                {/* Section II */}
                <div className="mb-4 text-xs leading-relaxed">
                  <h4 className="font-bold uppercase text-sm mb-1.5">
                    {selectedBlueprint.sectionHeadings.sec2}
                  </h4>
                  <p className="pl-3">
                    <b>1. Địa điểm:</b> {previewPlan.locationEquipment?.location}
                  </p>
                  <p className="pl-3">
                    <b>2. Phương tiện:</b> GV: {previewPlan.locationEquipment?.teacherTools} · HS:{' '}
                    {previewPlan.locationEquipment?.studentTools}
                  </p>
                </div>

                {/* Section III: Dynamic 2/3/4/5 Column Table */}
                <div className="mb-5">
                  <h4 className="font-bold uppercase text-sm mb-2">
                    {selectedBlueprint.sectionHeadings.sec3}
                  </h4>
                  {(() => {
                    const spec = COLUMN_MODE_SPECS[selectedBlueprint.columnMode];
                    const widths = normalizeBlueprintWidths(selectedBlueprint.columnWidths, spec.colCount);
                    const headers = spec.defaultHeaders.map(
                      (def, idx) => selectedBlueprint.columnHeaders[idx]?.trim() || def
                    );

                    return (
                      <table className="w-full table-fixed border-collapse border border-black text-xs">
                        <colgroup>
                          {widths.map((w, idx) => (
                            <col key={idx} style={{ width: `${w}%` }} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100 font-bold text-center">
                            {headers.map((h, idx) => (
                              <th key={idx} className="border border-black p-1.5 leading-snug">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewPlan.rows.map((row, rowIdx) => {
                            const extracted = extractRowAttachments(row);
                            const validC1 = isViewingImportedLesson
                              ? extracted.c1Images
                              : extracted.c1Images.filter(
                                  (att) =>
                                    !isInvalidColumn1AttachmentForRow(
                                      row.content,
                                      att.url,
                                      att.title,
                                      previewPlan.grade,
                                      previewPlan.title
                                    )
                                );
                            const cells = projectRowForBlueprint(row, rowIdx, selectedBlueprint.columnMode, {
                              c1Images: validC1,
                              c3Images: extracted.c3Images,
                              c4Images: extracted.c4Images
                            });
                            const autoMatchInfo = isViewingImportedLesson
                              ? activeImportedEntry?.autoFormationLog?.find((l) => l.rowIdx === rowIdx)
                              : undefined;

                            return (
                              <tr key={rowIdx} className="align-top">
                                {cells.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`border border-black p-1.5 break-words leading-relaxed ${
                                      cell.align === 'center' ? 'text-center' : 'text-left'
                                    } ${cell.bold ? 'font-bold' : ''}`}
                                  >
                                    {cell.blocks.map((blk, bIdx) => (
                                      <div key={bIdx} className={bIdx > 0 ? 'mt-2 pt-1.5 border-t border-dashed border-slate-300' : ''}>
                                        {blk.badge && (
                                          <p className="font-bold text-blue-900 text-[11px] mb-0.5">
                                            • {blk.badge}:
                                          </p>
                                        )}

                                        {blk.sourceCol === 'c1' ? (
                                          <div className="space-y-1.5">
                                            {splitColumn1ContentForMedia(blk.text || '', blk.images || []).map(
                                              (seg, sIdx) =>
                                                seg.type === 'text' ? (
                                                  <RichTextWithImages
                                                    key={sIdx}
                                                    text={seg.text}
                                                    imageHeight={86}
                                                    className="whitespace-pre-line"
                                                  />
                                                ) : (
                                                  <div key={sIdx} className="flex flex-col items-center gap-1 my-1">
                                                    {seg.images.map((im, iIdx) => (
                                                      <div key={im.id || iIdx} className="relative group text-center">
                                                        <img
                                                          src={im.url}
                                                          alt={im.title}
                                                          style={{ maxHeight: '92px' }}
                                                          className="mx-auto object-contain rounded border border-slate-200"
                                                        />
                                                        {isViewingImportedLesson && (
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              handleRemoveImportedContentImage(rowIdx, im.id || iIdx)
                                                            }
                                                            title="Xóa ảnh minh họa này"
                                                            className="no-print absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-90 hover:opacity-100"
                                                          >
                                                            <X className="w-3 h-3" />
                                                          </button>
                                                        )}
                                                        {im.title && (
                                                          <p className="text-[10px] italic text-slate-600 mt-0.5">
                                                            {im.title}
                                                          </p>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )
                                            )}

                                            {/* Interactive Movement Image Controls for Teacher's Imported Lesson */}
                                            {isViewingImportedLesson && (
                                              <div
                                                className="no-print mt-2 pt-1.5 border-t border-dashed border-blue-200/80 space-y-1"
                                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                              >
                                                {(!blk.images || blk.images.length === 0) && rowIdx >= 1 && (
                                                  <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                                    Chưa có ảnh minh họa động tác cho hoạt động này
                                                  </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setUploadTargetRowIdx(rowIdx);
                                                      setTimeout(() => movementImageInputRef.current?.click(), 0);
                                                    }}
                                                    className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold flex items-center gap-1 transition"
                                                  >
                                                    <ImagePlus className="w-3 h-3" />
                                                    <span>Tải ảnh động tác</span>
                                                  </button>
                                                  {images.length > 0 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => setLibraryImageModalRowIdx(rowIdx)}
                                                      className="px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition"
                                                    >
                                                      <ImageIcon className="w-3 h-3" />
                                                      <span>Thư viện ảnh</span>
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <>
                                            {blk.text && (
                                              <RichTextWithImages
                                                text={blk.text}
                                                imageHeight={82}
                                                className="whitespace-pre-line"
                                              />
                                            )}
                                            {blk.images && blk.images.length > 0 && (
                                              <div className="flex flex-col items-center gap-1.5 mt-1.5">
                                                {blk.images.map((im, iIdx) => (
                                                  <div key={im.id || iIdx} className="relative text-center">
                                                    <img
                                                      src={im.url}
                                                      alt={im.title}
                                                      style={{ maxHeight: '88px' }}
                                                      className="mx-auto object-contain rounded border border-slate-200"
                                                    />
                                                    {isViewingImportedLesson && blk.sourceCol === 'c4' && (
                                                      <button
                                                        type="button"
                                                        onClick={() => handleRemoveImportedFormation(rowIdx)}
                                                        title="Xóa sơ đồ đội hình ở dòng này"
                                                        className="no-print absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-90 hover:opacity-100"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </button>
                                                    )}
                                                    {im.title && (
                                                      <p className="text-[10px] italic text-slate-600 mt-0.5">
                                                        {im.title}
                                                      </p>
                                                    )}
                                                    {isViewingImportedLesson &&
                                                      blk.sourceCol === 'c4' &&
                                                      im.id?.startsWith('auto_lib_form_') && (
                                                        <p
                                                          className="no-print text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 mt-0.5"
                                                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                                          title={autoMatchInfo?.reason}
                                                        >
                                                          ✨ Tự động chèn từ Kho sơ đồ
                                                        </p>
                                                      )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {/* Interactive Formation Library Picker for Teacher's Imported Lesson */}
                                            {isViewingImportedLesson && blk.sourceCol === 'c4' && (
                                              <div
                                                className="no-print mt-2 pt-1.5 border-t border-dashed border-teal-200 flex flex-wrap items-center justify-center gap-1"
                                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                              >
                                                <button
                                                  type="button"
                                                  onClick={() => setFormationModalRowIdx(rowIdx)}
                                                  className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold flex items-center gap-1 transition"
                                                >
                                                  <RefreshCw className="w-2.5 h-2.5" />
                                                  <span>
                                                    {blk.images && blk.images.length > 0
                                                      ? 'Đổi sơ đồ (Thư viện)'
                                                      : 'Chọn sơ đồ (Thư viện)'}
                                                  </span>
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

                {/* Section IV */}
                {selectedBlueprint.sectionHeadings.showSec4 && (
                  <div className="mb-6 text-xs">
                    <h4 className="font-bold uppercase text-sm mb-1">
                      {selectedBlueprint.sectionHeadings.sec4}
                    </h4>
                    <p className="italic text-slate-500 pl-3">
                      {previewPlan.postLessonAdjustment ||
                        '..........................................................................................................................'}
                    </p>
                  </div>
                )}

                {/* Signature Block */}
                {selectedBlueprint.signatureBlock.enabled && (
                  <div className="pt-4 border-t border-slate-200 text-xs">
                    <p className="text-right italic text-slate-700 mb-3">
                      {previewPlan.signatures?.locationDate || 'Ngày ..... tháng ..... năm 2026'}
                    </p>
                    <div
                      className={`grid gap-4 text-center font-bold ${
                        selectedBlueprint.signatureBlock.count === 1
                          ? 'grid-cols-2'
                          : selectedBlueprint.signatureBlock.count === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-3'
                      }`}
                    >
                      {selectedBlueprint.signatureBlock.count === 1 ? (
                        <>
                          <div />
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.rightTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.teacherName}</p>
                          </div>
                        </>
                      ) : selectedBlueprint.signatureBlock.count === 2 ? (
                        <>
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.leftTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.approverPrincipal || effectivePreviewSettings.approverHead}</p>
                          </div>
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.rightTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.teacherName}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.leftTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.approverPrincipal}</p>
                          </div>
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.middleTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.approverHead}</p>
                          </div>
                          <div className="space-y-12">
                            <div>
                              <p className="uppercase">{selectedBlueprint.signatureBlock.rightTitle}</p>
                              <p className="font-normal italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <p>{effectivePreviewSettings.teacherName}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formation Library Modal for Experiencing & Swapping Formations in Imported Lesson Plan */}
      <SelectFormationModal
        isOpen={formationModalRowIdx !== null}
        onClose={() => setFormationModalRowIdx(null)}
        targetRowIndex={formationModalRowIdx ?? 0}
        onSelectFormation={handleSelectFormationForRow}
        grade={activeImportedEntry ? Math.min(5, Math.max(1, activeImportedEntry.gradeNum)) : previewPlan.grade}
        libraryImages={images}
      />

      {/* Movement Image Library Modal */}
      <SelectMovementImageModal
        isOpen={libraryImageModalRowIdx !== null}
        onClose={() => setLibraryImageModalRowIdx(null)}
        targetRowIndex={libraryImageModalRowIdx ?? 0}
        userImages={images}
        grade={activeImportedEntry ? Math.min(5, Math.max(1, activeImportedEntry.gradeNum)) : previewPlan.grade}
        lessonTitle={activeImportedEntry?.lessonTitle || previewPlan.title}
        lessonTopic={activeImportedEntry?.topic || previewPlan.topic}
        gameName={activeImportedEntry?.gameName}
        onSelectImage={(rowIdx, url, title) => handlePickLibraryImageForRow(rowIdx, url, title)}
      />
    </div>
  );
};
