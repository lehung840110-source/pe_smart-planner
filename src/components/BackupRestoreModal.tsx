import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Database,
  Save,
  Clock,
  ShieldCheck,
  FileJson,
  Sparkles,
  Cloud,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { User as FirebaseGoogleUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  SgkImageItem,
  ScenarioItem,
  SchoolSettings,
  LessonRow,
  UserCustomTemplate
} from '../types/gdtc';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import {
  FormationDiagram,
  GradeFormationStyleMap,
  CUSTOM_FORMATIONS_CHANGED_EVENT,
  getSavedCustomFormations,
  getSavedCustomFormationsAsync,
  getGradeFormationStyles,
  saveGradeFormationStyles,
  mergeCustomFormationsIntoStorage,
  saveCustomFormationsList
} from '../data/formationDiagrams';
import { PlanVersionStore, savePlanVersionStoreDB } from '../utils/planVersionHistory';
import {
  SgkTreeLessonOverride,
  getSgkTreeOverrides,
  saveSgkTreeLessonOverride
} from '../data/sgkCurriculumTree';
import {
  CloudSyncStatusInfo,
  CLOUD_SYNC_IMAGES_FILENAME,
  CLOUD_SYNC_WORKSPACE_FILENAME
} from '../services/cloudAutoSyncService';
import {
  getAllImagesDB,
  saveImagesDB,
  getAllScenariosDB,
  saveScenariosDB,
  setAppStateDB,
  getStorageEstimate
} from '../utils/db';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: SgkImageItem[];
  scenarios: ScenarioItem[];
  schoolSettings: SchoolSettings;
  allMasterPlans: Record<string, MasterPlanItem>;
  currentMasterPlan: MasterPlanItem;
  lessonRows: LessonRow[];
  planVersionStore?: PlanVersionStore;
  userCustomTemplates?: UserCustomTemplate[];
  activeCustomTemplateId?: string | null;
  activeWeek: number;
  activeGrade: number;
  activeLessonNum: number;
  activeTopic: string;
  activeTitle: string;
  cloudGoogleUser?: FirebaseGoogleUser | null;
  cloudAutoSyncEnabled?: boolean;
  cloudSessionConsented?: boolean;
  cloudSyncStatus?: CloudSyncStatusInfo;
  onRunCloudSync?: (options?: {
    silent?: boolean;
    interactiveSignIn?: boolean;
    enableAutoSyncAfter?: boolean;
    forcePushImages?: boolean;
    forcePushWorkspace?: boolean;
  }) => Promise<boolean>;
  onToggleCloudAutoSync?: (enabled: boolean) => void;
  onDisconnectCloudSync?: () => Promise<void>;
  onRestoreSuccess: (restoredData: {
    images?: SgkImageItem[];
    scenarios?: ScenarioItem[];
    schoolSettings?: SchoolSettings;
    allMasterPlans?: Record<string, MasterPlanItem>;
    currentMasterPlan?: MasterPlanItem;
    lessonRows?: LessonRow[];
    planVersionStore?: PlanVersionStore;
    userCustomTemplates?: UserCustomTemplate[];
    activeCustomTemplateId?: string | null;
    customFormationsCount?: number;
    activeWeek?: number;
    activeGrade?: number;
    activeLessonNum?: number;
    activeTopic?: string;
    activeTitle?: string;
  }) => void;
  showToast: (msg: string) => void;
}

export interface BackupDataPackage {
  version: number;
  generator: string;
  timestamp: number;
  exportDate: string;
  schoolSettings: SchoolSettings;
  images: SgkImageItem[];
  customFormations?: FormationDiagram[];
  gradeFormationStyles?: GradeFormationStyleMap;
  scenarios: ScenarioItem[];
  allMasterPlans: Record<string, MasterPlanItem>;
  currentMasterPlan: MasterPlanItem;
  lessonRows: LessonRow[];
  planVersionStore?: PlanVersionStore;
  userCustomTemplates?: UserCustomTemplate[];
  activeCustomTemplateId?: string | null;
  sgkTreeOverrides?: Record<string, SgkTreeLessonOverride>;
  activeState: {
    week: number;
    grade: number;
    lessonNum: number;
    topic: string;
    title: string;
  };
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  images,
  scenarios,
  schoolSettings,
  allMasterPlans,
  currentMasterPlan,
  lessonRows,
  planVersionStore,
  userCustomTemplates = [],
  activeCustomTemplateId = null,
  activeWeek,
  activeGrade,
  activeLessonNum,
  activeTopic,
  activeTitle,
  cloudGoogleUser = null,
  cloudAutoSyncEnabled = false,
  cloudSessionConsented = false,
  cloudSyncStatus,
  onRunCloudSync,
  onToggleCloudAutoSync,
  onDisconnectCloudSync,
  onRestoreSuccess,
  showToast
}) => {
  const [storageInfo, setStorageInfo] = useState<{ usedMB: string; quotaMB: string }>({
    usedMB: '0.00',
    quotaMB: '...'
  });
  const [customFormationsCount, setCustomFormationsCount] = useState<number>(
    () => getSavedCustomFormations().length
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isForceSaving, setIsForceSaving] = useState<boolean>(false);
  const [previewBackup, setPreviewBackup] = useState<BackupDataPackage | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa xong');
  const [showCloudSyncConfirm, setShowCloudSyncConfirm] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCopyDomain = () => {
    const domain =
      cloudSyncStatus?.unauthorizedDomain ||
      (typeof window !== 'undefined' ? window.location.hostname : 'pe-smart-planner.vercel.app');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleConfirmCloudSync = async () => {
    setShowCloudSyncConfirm(false);
    if (!onRunCloudSync) return;
    await onRunCloudSync({
      silent: false,
      interactiveSignIn: true,
      enableAutoSyncAfter: true,
      forcePushWorkspace: true
    });
  };

  useEffect(() => {
    if (isOpen) {
      getStorageEstimate().then(setStorageInfo);
      getSavedCustomFormationsAsync().then((list) => setCustomFormationsCount(list.length));
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
    }
  }, [isOpen]);

  useEffect(() => {
    const onFormationsChanged = () => {
      setCustomFormationsCount(getSavedCustomFormations().length);
    };
    window.addEventListener(CUSTOM_FORMATIONS_CHANGED_EVENT, onFormationsChanged);
    return () => window.removeEventListener(CUSTOM_FORMATIONS_CHANGED_EVENT, onFormationsChanged);
  }, []);

  if (!isOpen) return null;

  // 1. Export entire application data (Images + Custom Formations + Plans + Versions + Templates) into a single .json file
  const handleExportBackup = async () => {
    setIsExporting(true);
    showToast('📦 Đang thu thập và đóng gói toàn bộ hệ thống (Kho ảnh, Kho sơ đồ tự vẽ, Giáo án, Kịch bản, Mẫu riêng)...');

    try {
      const dbImages = await getAllImagesDB();
      const exportImages = dbImages && dbImages.length > 0 ? dbImages : images;

      const dbScenarios = await getAllScenariosDB();
      const exportScenarios = dbScenarios && dbScenarios.length > 0 ? dbScenarios : scenarios;

      const exportCustomFormations = await getSavedCustomFormationsAsync();
      const exportGradeFormationStyles = getGradeFormationStyles();
      const exportSgkTreeOverrides = getSgkTreeOverrides();

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const backupPackage: BackupDataPackage = {
        version: 3,
        generator: 'SmartPlan GDTC Pro - Full System Backup (GDPT 2018)',
        timestamp: Date.now(),
        exportDate: now.toLocaleString('vi-VN'),
        schoolSettings,
        images: exportImages,
        customFormations: exportCustomFormations,
        gradeFormationStyles: exportGradeFormationStyles,
        scenarios: exportScenarios,
        allMasterPlans,
        currentMasterPlan,
        lessonRows,
        planVersionStore,
        userCustomTemplates,
        activeCustomTemplateId,
        sgkTreeOverrides: exportSgkTreeOverrides,
        activeState: {
          week: activeWeek,
          grade: activeGrade,
          lessonNum: activeLessonNum,
          topic: activeTopic,
          title: activeTitle
        }
      };

      const jsonStr = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const safeTeacher = (schoolSettings.teacherName || 'GiaoVien').replace(/\s+/g, '_');
      a.download = `Sao_Luu_Toan_He_Thong_SmartPlan_GDTC_${safeTeacher}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(
        `✅ Đã xuất file sao lưu toàn hệ thống: ${exportImages.length} ảnh · ${exportCustomFormations.length} sơ đồ tự thiết kế · ${Object.keys(allMasterPlans).length} giáo án!`
      );
    } catch (err: any) {
      showToast('Lỗi khi xuất file sao lưu: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Select and Preview File before restoring
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      try {
        const text = loadEvt.target?.result as string;
        const rawParsed: any = JSON.parse(text);

        let parsed: BackupDataPackage;
        if (Array.isArray(rawParsed)) {
          // Detect whether array is custom formations or image library
          const looksLikeFormations =
            rawParsed.length > 0 && rawParsed[0] && typeof rawParsed[0].svgDataUrl === 'string';
          parsed = {
            version: 3,
            generator: looksLikeFormations
              ? 'SmartPlan GDTC Pro - Gói Kho Sơ Đồ JSON'
              : 'SmartPlan GDTC Pro - Gói Kho Ảnh JSON',
            timestamp: Date.now(),
            exportDate: new Date().toLocaleString('vi-VN'),
            schoolSettings,
            images: looksLikeFormations ? [] : rawParsed,
            customFormations: looksLikeFormations ? rawParsed : undefined,
            scenarios,
            allMasterPlans,
            currentMasterPlan,
            lessonRows,
            activeState: {
              week: activeWeek,
              grade: activeGrade,
              lessonNum: activeLessonNum,
              topic: activeTopic,
              title: activeTitle
            }
          };
        } else if (rawParsed && rawParsed.type === 'gdtc_custom_formations_backup' && Array.isArray(rawParsed.customFormations)) {
          parsed = {
            version: 3,
            generator: 'SmartPlan GDTC Pro - Gói Kho Sơ Đồ Đội Hình JSON',
            timestamp: rawParsed.timestamp || Date.now(),
            exportDate: rawParsed.exportDate || new Date().toLocaleString('vi-VN'),
            schoolSettings,
            images: [],
            customFormations: rawParsed.customFormations,
            gradeFormationStyles: rawParsed.gradeFormationStyles,
            scenarios,
            allMasterPlans,
            currentMasterPlan,
            lessonRows,
            activeState: {
              week: activeWeek,
              grade: activeGrade,
              lessonNum: activeLessonNum,
              topic: activeTopic,
              title: activeTitle
            }
          };
        } else {
          parsed = rawParsed as BackupDataPackage;
        }

        if (
          !parsed.images &&
          !parsed.customFormations &&
          !parsed.allMasterPlans &&
          !parsed.schoolSettings
        ) {
          throw new Error('Định dạng file sao lưu không hợp lệ.');
        }

        setPreviewBackup(parsed);
        const fCount = parsed.customFormations?.length || 0;
        showToast(
          `📄 Đã đọc tệp sao lưu (${parsed.images?.length || 0} ảnh · ${fCount} sơ đồ tự thiết kế). Bấm "Xác Nhận Khôi Phục" để nạp ngay.`
        );
      } catch (err: any) {
        showToast('Lỗi đọc tệp sao lưu: ' + err?.message);
        setPreviewBackup(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Confirm and restore into IndexedDB + localStorage + React State
  const handleConfirmRestore = async () => {
    if (!previewBackup) return;

    setIsImporting(true);
    showToast('🔄 Đang nạp toàn bộ dữ liệu vào cơ sở dữ liệu trình duyệt...');

    try {
      let restoredImages: SgkImageItem[] | undefined = undefined;
      if (previewBackup.images && Array.isArray(previewBackup.images) && previewBackup.images.length > 0) {
        const mergedMap = new Map<string, SgkImageItem>();
        images.forEach((img) => {
          if (img?.id) mergedMap.set(img.id, img);
        });
        previewBackup.images.forEach((img, i) => {
          if (!img?.imgUrl) return;
          const safeId = img.id || `restored_img_${Date.now()}_${i}`;
          mergedMap.set(safeId, { ...img, id: safeId, selected: false });
        });
        restoredImages = Array.from(mergedMap.values());
        await saveImagesDB(restoredImages);
      }

      let restoredFormationsCount = customFormationsCount;
      if (Array.isArray(previewBackup.customFormations) && previewBackup.customFormations.length > 0) {
        const { merged } = mergeCustomFormationsIntoStorage(previewBackup.customFormations, {
          source: 'backup_restore'
        });
        restoredFormationsCount = merged.length;
        setCustomFormationsCount(merged.length);
      }

      if (previewBackup.gradeFormationStyles && typeof previewBackup.gradeFormationStyles === 'object') {
        saveGradeFormationStyles(previewBackup.gradeFormationStyles);
      }

      if (previewBackup.scenarios && Array.isArray(previewBackup.scenarios)) {
        await saveScenariosDB(previewBackup.scenarios);
      }

      if (previewBackup.schoolSettings) {
        await setAppStateDB('school_settings', previewBackup.schoolSettings);
      }

      if (previewBackup.allMasterPlans) {
        await setAppStateDB('gdtc_all_master_plans', previewBackup.allMasterPlans);
      }

      if (previewBackup.currentMasterPlan) {
        await setAppStateDB('master_plan', previewBackup.currentMasterPlan);
      }

      if (previewBackup.lessonRows) {
        await setAppStateDB('current_lesson_rows', previewBackup.lessonRows);
      }

      if (previewBackup.planVersionStore && previewBackup.planVersionStore.versionsByPlanKey) {
        await savePlanVersionStoreDB(previewBackup.planVersionStore);
      }

      if (Array.isArray(previewBackup.userCustomTemplates) && previewBackup.userCustomTemplates.length > 0) {
        await setAppStateDB('user_custom_templates', previewBackup.userCustomTemplates);
      }

      if (previewBackup.activeCustomTemplateId) {
        await setAppStateDB('active_custom_template_id', previewBackup.activeCustomTemplateId);
      }

      if (previewBackup.sgkTreeOverrides && typeof previewBackup.sgkTreeOverrides === 'object') {
        Object.entries(previewBackup.sgkTreeOverrides).forEach(([lessonId, ov]) => {
          if (ov) saveSgkTreeLessonOverride(lessonId, ov);
        });
      }

      if (previewBackup.activeState) {
        await setAppStateDB('active_week', previewBackup.activeState.week);
        await setAppStateDB('active_grade', previewBackup.activeState.grade);
        await setAppStateDB('active_lesson_num', previewBackup.activeState.lessonNum);
        await setAppStateDB('active_topic', previewBackup.activeState.topic);
        await setAppStateDB('active_title', previewBackup.activeState.title);
      }

      try {
        localStorage.setItem(
          'gdtc_backup_metadata',
          JSON.stringify({
            timestamp: Date.now(),
            imageCount: restoredImages?.length || images.length,
            formationsCount: restoredFormationsCount,
            plansCount: Object.keys(previewBackup.allMasterPlans || {}).length,
            teacher: previewBackup.schoolSettings?.teacherName
          })
        );
      } catch {
        // ignore quota issues
      }

      onRestoreSuccess({
        images: restoredImages,
        scenarios: previewBackup.scenarios,
        schoolSettings: previewBackup.schoolSettings,
        allMasterPlans: previewBackup.allMasterPlans,
        currentMasterPlan: previewBackup.currentMasterPlan,
        lessonRows: previewBackup.lessonRows,
        planVersionStore: previewBackup.planVersionStore,
        userCustomTemplates: previewBackup.userCustomTemplates,
        activeCustomTemplateId: previewBackup.activeCustomTemplateId,
        customFormationsCount: restoredFormationsCount,
        activeWeek: previewBackup.activeState?.week,
        activeGrade: previewBackup.activeState?.grade,
        activeLessonNum: previewBackup.activeState?.lessonNum,
        activeTopic: previewBackup.activeState?.topic,
        activeTitle: previewBackup.activeState?.title
      });

      showToast(
        `🎉 Đã khôi phục hoàn tất! Hiện có ${restoredImages?.length || images.length} ảnh · ${restoredFormationsCount} sơ đồ tự thiết kế.`
      );
      setPreviewBackup(null);
      onClose();
    } catch (err: any) {
      showToast('Lỗi khi khôi phục dữ liệu: ' + err?.message);
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Force Save right now (IndexedDB + Mirror including custom formations)
  const handleForceSave = async () => {
    setIsForceSaving(true);
    try {
      await saveImagesDB(images);
      await saveScenariosDB(scenarios);
      const latestFormations = await getSavedCustomFormationsAsync();
      saveCustomFormationsList(latestFormations, { silentEvent: true });
      saveGradeFormationStyles(getGradeFormationStyles(), { silentEvent: true });
      await setAppStateDB('school_settings', schoolSettings);
      await setAppStateDB('gdtc_all_master_plans', allMasterPlans);
      await setAppStateDB('master_plan', currentMasterPlan);
      await setAppStateDB('current_lesson_rows', lessonRows);
      if (planVersionStore) await savePlanVersionStoreDB(planVersionStore);
      if (userCustomTemplates) await setAppStateDB('user_custom_templates', userCustomTemplates);
      await setAppStateDB('active_week', activeWeek);
      await setAppStateDB('active_grade', activeGrade);
      await setAppStateDB('active_lesson_num', activeLessonNum);
      await setAppStateDB('active_topic', activeTopic);
      await setAppStateDB('active_title', activeTitle);

      setCustomFormationsCount(latestFormations.length);
      const estimate = await getStorageEstimate();
      setStorageInfo(estimate);
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setLastSyncTime(timeStr);
      showToast(`💾 Đã lưu tức thì toàn bộ hệ thống (${images.length} ảnh · ${latestFormations.length} sơ đồ tự vẽ) lúc ${timeStr}!`);
    } catch (err: any) {
      showToast('Lỗi khi lưu: ' + err?.message);
    } finally {
      setIsForceSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Đồng Bộ 2 Nền Tảng & Sao Lưu Dữ Liệu</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Tự động đồng bộ AI Studio ↔ Vercel ↔ Điện thoại qua Google Drive · Kèm sao lưu JSON offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-slate-50 text-xs max-h-[78vh] overflow-y-auto">
          
          {/* Featured: 2-Platform Automatic Cloud Sync via Google Drive */}
          {onRunCloudSync && (
            <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Cloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm leading-tight">
                      Tự Động Đồng Bộ AI Studio ↔ Vercel ↔ Điện Thoại (Google Drive)
                    </h4>
                    <p className="text-[11px] text-blue-100 mt-0.5">
                      Hợp nhất thông minh {images.length} ảnh SGK · {customFormationsCount} sơ đồ tự thiết kế &amp; giáo án — không bao giờ ghi đè mất dữ liệu
                    </p>
                  </div>
                </div>
                {cloudGoogleUser && cloudSessionConsented && (
                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-200/50 text-emerald-50">
                    {cloudSyncStatus?.phase === 'syncing'
                      ? 'Đang đồng bộ...'
                      : cloudAutoSyncEnabled
                      ? 'Tự động đồng bộ: ĐANG BẬT'
                      : 'Đã kết nối Drive'}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                {!cloudGoogleUser || !cloudSessionConsented ? (
                  <div className="space-y-3">
                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      Kết nối <strong>cùng 1 tài khoản Google</strong> trên cả AI Studio và Vercel để tự động đồng bộ 2 chiều toàn bộ kho ảnh ({images.length} ảnh), <strong>kho sơ đồ đội hình tự thiết kế ({customFormationsCount} sơ đồ)</strong>, giáo án 5 khối, kịch bản và tên trò chơi qua thư mục <strong>SmartPlan GDTC Pro</strong> trên Google Drive.
                    </p>

                    {!showCloudSyncConfirm ? (
                      <button
                        type="button"
                        disabled={cloudSyncStatus?.phase === 'syncing'}
                        onClick={() => setShowCloudSyncConfirm(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
                      >
                        {cloudSyncStatus?.phase === 'syncing' ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          </svg>
                        )}
                        <span>
                          {cloudAutoSyncEnabled
                            ? 'Sign in with Google · Kết nối lại để đồng bộ tự động'
                            : 'Sign in with Google · Bật Tự Động Đồng Bộ 2 Nền Tảng'}
                        </span>
                      </button>
                    ) : (
                      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2.5">
                        <p className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          Xác nhận tạo / cập nhật tệp đồng bộ trên Google Drive
                        </p>
                        <p className="text-[11px] text-indigo-900 leading-relaxed">
                          Hệ thống sẽ đăng nhập Google và tạo/cập nhật 2 tệp đồng bộ (
                          <code className="bg-white/80 px-1 rounded">{CLOUD_SYNC_WORKSPACE_FILENAME}</code> và{' '}
                          <code className="bg-white/80 px-1 rounded">{CLOUD_SYNC_IMAGES_FILENAME}</code>) trong thư mục{' '}
                          <strong>SmartPlan GDTC Pro</strong> để hợp nhất {images.length} ảnh,{' '}
                          <strong>{customFormationsCount} sơ đồ tự thiết kế</strong> và{' '}
                          {Object.keys(allMasterPlans).length} bài giáo án giữa AI Studio &amp; Vercel.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowCloudSyncConfirm(false)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-300 transition"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmCloudSync}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Xác nhận & Đồng bộ ngay</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cloudGoogleUser.photoURL ? (
                          <img
                            src={cloudGoogleUser.photoURL}
                            alt="Google Avatar"
                            className="w-8 h-8 rounded-full ring-2 ring-emerald-300 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {(cloudGoogleUser.email || 'G').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {cloudGoogleUser.displayName || 'Tài khoản Google Drive'}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate">{cloudGoogleUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={cloudSyncStatus?.phase === 'syncing'}
                          onClick={() =>
                            onRunCloudSync({
                              silent: false,
                              interactiveSignIn: true,
                              enableAutoSyncAfter: cloudAutoSyncEnabled
                            })
                          }
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              cloudSyncStatus?.phase === 'syncing' ? 'animate-spin' : ''
                            }`}
                          />
                          <span>
                            {cloudSyncStatus?.phase === 'syncing' ? 'Đang đồng bộ...' : 'Đồng Bộ 2 Chiều Ngay'}
                          </span>
                        </button>
                        {onDisconnectCloudSync && (
                          <button
                            type="button"
                            onClick={onDisconnectCloudSync}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                            title="Ngắt kết nối đồng bộ Google Drive"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {onToggleCloudAutoSync && (
                      <label className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            Tự động đồng bộ nền mỗi khi thêm ảnh, lưu sơ đồ mới hoặc sửa giáo án
                          </span>
                          <span className="text-[10.5px] text-slate-500">
                            Tự đẩy sau 4 giây khi chỉnh sửa (bao gồm toàn bộ Kho Sơ Đồ tự vẽ) và tự kéo bản mới nhất khi chuyển AI Studio ↔ Vercel
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cloudAutoSyncEnabled}
                          onChange={(e) => onToggleCloudAutoSync(e.target.checked)}
                          className="w-4 h-4 accent-indigo-600 rounded shrink-0"
                        />
                      </label>
                    )}

                    {cloudSyncStatus?.lastSyncedAt && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {cloudSyncStatus.lastSummary || 'Đã đồng bộ 2 chiều'}
                        </span>
                        <span className="text-[10.5px] text-slate-500">
                          Lúc {new Date(cloudSyncStatus.lastSyncedAt).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Error & Unauthorized Domain 1-Click Fix Helper */}
                {cloudSyncStatus?.errorMessage && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-[11px] text-amber-950">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">{cloudSyncStatus.errorMessage}</p>
                    </div>
                    {cloudSyncStatus.unauthorizedDomain && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-amber-900">
                          Để đăng nhập Google Drive trên Vercel, chỉ cần thêm 1 lần tên miền dưới đây vào mục{' '}
                          <strong>Authorized domains</strong> trong Firebase Console:
                        </p>
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-amber-200">
                          <code className="flex-1 text-xs text-slate-800 px-1 truncate">
                            {cloudSyncStatus.unauthorizedDomain}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyDomain}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-md text-[11px]"
                          >
                            {copiedDomain ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition"
                        >
                          <span>Mở Firebase Authentication Settings</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Browser Storage Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                Trạng Thái Bộ Nhớ Trình Duyệt Hiện Tại
              </span>
              <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Lần lưu gần nhất: <strong>{lastSyncTime}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Kho hình ảnh</span>
                <span className="text-sm font-bold text-blue-600">{images.length} ảnh</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Kho sơ đồ tự vẽ</span>
                <span className="text-sm font-bold text-indigo-600">{customFormationsCount} sơ đồ</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Kế hoạch bài dạy</span>
                <span className="text-sm font-bold text-emerald-600">{Object.keys(allMasterPlans).length} bài</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Dung lượng sử dụng</span>
                <span className="text-sm font-bold text-purple-600">{storageInfo.usedMB} MB</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cơ chế tự động lưu IndexedDB đang kích hoạt
              </span>
              <button
                disabled={isForceSaving}
                onClick={handleForceSave}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-300 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isForceSaving ? 'Đang lưu...' : 'Lưu Tức Thì Ngay'}</span>
              </button>
            </div>
          </div>

          {/* Action Grid: Export & Import */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Box 1: Export Backup */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  1. Xuất Toàn Bộ Dữ Liệu Ra File (.json)
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Tải về 1 file sao lưu toàn hệ thống duy nhất chứa <strong>{images.length} ảnh</strong>, <strong>{customFormationsCount} sơ đồ tự thiết kế</strong>, kịch bản, mẫu riêng và tất cả giáo án đã soạn.
                </p>
              </div>

              <button
                disabled={isExporting}
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang Đóng Gói...' : '📥 Tải File Sao Lưu Toàn Hệ Thống'}</span>
              </button>
            </div>

            {/* Box 2: Import Backup */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  2. Khôi Phục Dữ Liệu Từ File (.json)
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Chọn file <code>.json</code> toàn hệ thống (hoặc file kho sơ đồ / kho ảnh) để nạp đầy đủ sang Vercel hay máy tính mới.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FileJson className="w-4 h-4 text-emerald-600" />
                <span>Chọn File Sao Lưu Để Khôi Phục</span>
              </button>
            </div>
          </div>

          {/* Backup Preview Dialog if file selected */}
          {previewBackup && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  File sao lưu hợp lệ: {previewBackup.exportDate}
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  Sẵn sàng khôi phục
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Số hình ảnh</span>
                  <span className="font-bold text-blue-600">
                    {previewBackup.images?.length || 0} ảnh
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Kho sơ đồ tự vẽ</span>
                  <span className="font-bold text-indigo-600">
                    {previewBackup.customFormations?.length || 0} sơ đồ
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Số bài giáo án</span>
                  <span className="font-bold text-emerald-600">
                    {Object.keys(previewBackup.allMasterPlans || {}).length} bài
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Giáo viên</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {previewBackup.schoolSettings?.teacherName || 'Chưa đặt'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setPreviewBackup(null)}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-lg font-bold border border-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isImporting}
                  onClick={handleConfirmRestore}
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isImporting ? 'Đang Khôi Phục...' : 'Xác Nhận Khôi Phục Toàn Bộ'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs transition"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};
