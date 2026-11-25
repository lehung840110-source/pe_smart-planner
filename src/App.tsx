import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TabScan } from './components/TabScan';
import { TabImageLibrary } from './components/TabImageLibrary';
import { TabExtractSample } from './components/TabExtractSample';
import { TabScenarioLibrary } from './components/TabScenarioLibrary';
import { TabGenerator } from './components/TabGenerator';
import { TabExportPrint } from './components/TabExportPrint';
import { TabTemplateLab } from './components/TabTemplateLab';
import { TabIntro } from './components/TabIntro';
import { TabFeedback } from './components/TabFeedback';
import { SettingsModal } from './components/SettingsModal';
import { SelectCellModal } from './components/SelectCellModal';
import { ScenarioModal } from './components/ScenarioModal';
import { VisionAnalysisModal, VisionAnalysisResult } from './components/VisionAnalysisModal';
import { ImportLessonModal } from './components/ImportLessonModal';
import { SmartCleanModal } from './components/SmartCleanModal';
import { FormationStudioModal } from './components/FormationStudioModal';
import { LovableImageStudioModal } from './components/LovableImageStudioModal';
import { SelectFormationModal } from './components/SelectFormationModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { AuthModal } from './components/AuthModal';
import { LockedFeatureGate } from './components/LockedFeatureGate';
import { GlobalFloatingTextCaseBar } from './components/TextCaseToolbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  FormationDiagram,
  CUSTOM_FORMATIONS_CHANGED_EVENT,
  OPEN_BACKUP_RESTORE_EVENT,
  TRIGGER_CLOUD_SYNC_EVENT,
  getSavedCustomFormations,
  getGradeFormationStyles,
  saveCustomFormationToStorage,
  saveCustomFormationsList,
  saveGradeFormationStyles,
  hydrateCustomFormationsFromDB,
  mergeCustomFormationsIntoStorage,
  standardFormationDiagrams
} from './data/formationDiagrams';
import { ParsedLessonFileResult, parseLessonFile, customTemplateToMasterPlan } from './utils/documentParser';
import { exportWordDocument, buildWordExportPackage } from './utils/exportUtils';
import {
  findMatchingGameSlotsAcrossPlans,
  applyGameImageToMatchingPlans,
  extractGameNameFromRowText,
  doGameNamesMatch
} from './utils/planAutoMatcher';
import { useAuth } from './contexts/AuthContext';
import {
  defaultSchoolSettings,
  defaultScenarios,
  defaultSgkImages,
  initialLessonsData,
} from './data/defaultData';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from './data/masterTemplateTuan8';
import { masterPlansTuan9 } from './data/masterTemplateTuan9';
import {
  buildMasterPlanIntegrationsFromAddress,
  applyOfficialIntegrationsToLessonRows,
  hasActivityIntegrationMarkers
} from './data/integrationAddressesData';
import { GradeLevel, SgkImageItem, ScenarioItem, SchoolSettings, LessonRow, ImageCategory, UserCustomTemplate, CustomLayoutBlueprint } from './types/gdtc';
import {
  getSavedLayoutBlueprints,
  getActiveLayoutBlueprintId,
  saveLayoutBlueprints,
  setActiveLayoutBlueprintId,
  hydrateLayoutBlueprintsFromDB
} from './utils/customLayoutBlueprint';
import {
  getAllImagesDB,
  saveImageDB,
  saveImagesDB,
  getAllScenariosDB,
  saveScenariosDB,
  getAppStateDB,
  setAppStateDB,
  clearImagesDB,
} from './utils/db';
import { CheckCircle2, Loader2, Lock, UserPlus, LogIn, Clock, Coffee, Sparkles } from 'lucide-react';
import { EXPIRY_WARNING_DAYS, formatVnDate } from './utils/subscriptionPlans';
import {
  PlanVersionStore,
  LessonPlanVersion,
  getPlanVersionKey,
  getPreferredVersionForPlan,
  loadPlanVersionStoreDB,
  savePlanVersionStoreDB,
  upsertDraftVersion,
  commitOfficialVersion,
  activateVersionInStore,
  toggleBestVersionInStore,
  deleteVersionFromStore,
  pruneVersionsKeepLatest,
  formatBytesApproxVi
} from './utils/planVersionHistory';
import { getGradePpctInfo } from './utils/academicCalendar';
import { getPpctPeriodItem } from './data/defaultPpctData';
import { cleanLessonTitleForHeader } from './utils/curriculumAuditSync';
import { createBalancedGranularLessonRows, stripFabricatedGameRows } from './utils/planAutoMatcher';
import { User as FirebaseGoogleUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCachedAccessTokenSync
} from './services/googleAuth';
import {
  getSgkTreeOverrides,
  saveSgkTreeLessonOverride,
  SGK_TREE_OVERRIDES_EVENT
} from './data/sgkCurriculumTree';
import {
  CloudSyncStatusInfo,
  LocalSyncSnapshot,
  performTwoWayCloudSync,
  checkCloudHasNewerUpdate,
  getCloudAutoSyncPref,
  setCloudAutoSyncPref
} from './services/cloudAutoSyncService';
import { useSeoMeta } from './hooks/useSeoMeta';
import { SemesterExportScope } from './components/SemesterBundleExportModal';

export default function App() {
  const { user: authUser, isLoading: authLoading, pullWorkspace, pushWorkspace } = useAuth();
  const isGuest = !authLoading && !authUser;
  const isSubscriptionExpired = Boolean(!authLoading && authUser && authUser.hasFullAccess === false);
  const isAccessLocked = isGuest || isSubscriptionExpired;
  const isTrialExpiringSoon = Boolean(
    !authLoading &&
      authUser &&
      authUser.planTier === 'trial' &&
      typeof authUser.daysRemaining === 'number' &&
      authUser.daysRemaining > 0 &&
      authUser.daysRemaining <= EXPIRY_WARNING_DAYS
  );
  const [activeTab, setActiveTab] = useState<string>('tab-generator');
  const [semesterBundleTrigger, setSemesterBundleTrigger] = useState<{
    grade: GradeLevel;
    scope: SemesterExportScope;
    nonce: number;
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'billing'>('register');
  const [authGateReason, setAuthGateReason] = useState<string | null>(null);
  const [userCustomTemplates, setUserCustomTemplates] = useState<UserCustomTemplate[]>([]);
  const [activeCustomTemplateId, setActiveCustomTemplateId] = useState<string | null>(null);
  const userCustomTemplatesRef = useRef<UserCustomTemplate[]>([]);
  useEffect(() => {
    userCustomTemplatesRef.current = userCustomTemplates;
  }, [userCustomTemplates]);

  // Custom Layout Blueprints (Tab 7: Thử nghiệm mẫu giáo án riêng)
  const [layoutBlueprints, setLayoutBlueprints] = useState<CustomLayoutBlueprint[]>(() =>
    getSavedLayoutBlueprints()
  );
  const [activeLayoutBlueprintId, setActiveLayoutBlueprintIdState] = useState<string | null>(() =>
    getActiveLayoutBlueprintId()
  );

  useEffect(() => {
    hydrateLayoutBlueprintsFromDB().then(({ blueprints, activeId }) => {
      if (blueprints.length > 0) {
        setLayoutBlueprints(blueprints);
      }
      if (activeId !== undefined) {
        setActiveLayoutBlueprintIdState(activeId);
      }
    });
    const onBlueprintChanged = () => {
      setLayoutBlueprints(getSavedLayoutBlueprints());
      setActiveLayoutBlueprintIdState(getActiveLayoutBlueprintId());
    };
    window.addEventListener('gdtc:custom-layout-blueprint-changed', onBlueprintChanged);
    return () => window.removeEventListener('gdtc:custom-layout-blueprint-changed', onBlueprintChanged);
  }, []);

  const activeLayoutBlueprint: CustomLayoutBlueprint | null =
    activeLayoutBlueprintId
      ? layoutBlueprints.find((b) => b.id === activeLayoutBlueprintId) || null
      : null;

  const handleSaveLayoutBlueprint = (bp: CustomLayoutBlueprint, activate = false) => {
    setLayoutBlueprints((prev) => {
      const next = [bp, ...prev.filter((item) => item.id !== bp.id)];
      saveLayoutBlueprints(next);
      return next;
    });
    if (activate) {
      setActiveLayoutBlueprintIdState(bp.id);
      setActiveLayoutBlueprintId(bp.id);
    }
  };

  const handleUpdateLayoutBlueprint = (updatedBp: CustomLayoutBlueprint) => {
    setLayoutBlueprints((prev) => {
      const next = prev.map((item) => (item.id === updatedBp.id ? updatedBp : item));
      saveLayoutBlueprints(next);
      return next;
    });
  };

  const handleDeleteLayoutBlueprint = (id: string) => {
    setLayoutBlueprints((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveLayoutBlueprints(next);
      return next;
    });
    if (activeLayoutBlueprintId === id) {
      setActiveLayoutBlueprintIdState(null);
      setActiveLayoutBlueprintId(null);
      showToast('Đã xóa mẫu và quay về mẫu chuẩn 4 cột GDPT 2018.');
    } else {
      showToast('Đã xóa mẫu khỏi kho mẫu thử nghiệm.');
    }
  };

  const handleActivateLayoutBlueprint = (id: string | null, applyDetectedSchoolMeta = true) => {
    setActiveLayoutBlueprintIdState(id);
    setActiveLayoutBlueprintId(id);
    if (!id) {
      showToast('🔄 Đã quay về mẫu chuẩn 4 cột GDPT 2018 mặc định!');
      return;
    }
    const target = layoutBlueprints.find((b) => b.id === id);
    if (target) {
      if (
        applyDetectedSchoolMeta &&
        (target.detectedSchoolName ||
          target.detectedDepartmentName ||
          target.detectedTeacherName ||
          target.detectedApproverPrincipal ||
          target.detectedApproverHead)
      ) {
        setSchoolSettings((prev) => ({
          ...prev,
          schoolName: target.detectedSchoolName || prev.schoolName,
          departmentName: target.detectedDepartmentName || prev.departmentName,
          teacherName: target.detectedTeacherName || prev.teacherName,
          approverPrincipal: target.detectedApproverPrincipal || prev.approverPrincipal,
          approverHead: target.detectedApproverHead || prev.approverHead
        }));
      }
      showToast(`✨ Đã áp dụng trực tiếp mẫu "${target.name}" cho toàn bộ giáo án (Tab 6 & xuất Word)!`);
    }
  };

  // IndexedDB-backed State
  const [images, setImages] = useState<SgkImageItem[]>(defaultSgkImages);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(defaultScenarios);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(defaultSchoolSettings);
  const [currentMasterPlan, setCurrentMasterPlan] = useState<MasterPlanItem>(masterPlansTuan8.k1_t15);
  // Synchronized All-Grades Master Plans Dictionary (K1-K5 across weeks)
  const [allMasterPlans, setAllMasterPlans] = useState<Record<string, MasterPlanItem>>(() => {
    return {
      ...JSON.parse(JSON.stringify(masterPlansTuan8)),
      ...JSON.parse(JSON.stringify(masterPlansTuan9))
    };
  });

  // Generator Plan State
  const [week, setWeek] = useState<number>(9);
  const [grade, setGrade] = useState<number>(1);
  const [lessonNum, setLessonNum] = useState<number>(17);
  const [topic, setTopic] = useState<string>('CHỦ ĐỀ 2: BÀI THỂ DỤC');
  const [title, setTitle] = useState<string>(
    'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC BỤNG (Tiết 1)'
  );
  const [lessonRows, setLessonRows] = useState<LessonRow[]>(() =>
    applyOfficialIntegrationsToLessonRows(
      initialLessonsData.k1_t15.rows,
      1,
      9,
      17,
      'Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC BỤNG (Tiết 1)'
    )
  );

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<ScenarioItem | null>(null);
  const [isSelectCellModalOpen, setIsSelectCellModalOpen] = useState<boolean>(false);
  const [imageToAttach, setImageToAttach] = useState<SgkImageItem | null>(null);

  // Gemini Vision State
  const [isVisionModalOpen, setIsVisionModalOpen] = useState<boolean>(false);
  const [visionImage, setVisionImage] = useState<SgkImageItem | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);

  // Import Lesson Plan State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Smart Clean / Tẩy rác State
  const [isSmartCleanOpen, setIsSmartCleanOpen] = useState<boolean>(false);
  const [cleanImageTarget, setCleanImageTarget] = useState<SgkImageItem | null>(null);

  // Formation Studio & Library Global States
  const [isGlobalStudioOpen, setIsGlobalStudioOpen] = useState<boolean>(false);
  const [isLovableStudioOpen, setIsLovableStudioOpen] = useState<boolean>(false);
  const [isGlobalFormationLibraryOpen, setIsGlobalFormationLibraryOpen] = useState<boolean>(false);

  // Google Drive Modal State
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);
  const [googleDriveBundle, setGoogleDriveBundle] = useState<{
    week: number;
    title: string;
    plans: MasterPlanItem[];
    scheduleRows?: any[];
    includeSchedule: boolean;
    settings: SchoolSettings;
    approvalDate?: string;
    dateRange?: string;
  } | null>(null);

  // Backup & Restore Modal State
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState<boolean>(false);

  // SGK Page Jump State
  const [scanInitialGrade, setScanInitialGrade] = useState<GradeLevel | undefined>(undefined);
  const [scanInitialPage, setScanInitialPage] = useState<number | undefined>(undefined);

  const handleNavigateToScanFromLesson = (targetGrade: GradeLevel, targetPage?: number) => {
    if (isAccessLocked) {
      requireAuth('Quét & bóc tách ảnh trực tiếp từ SGK (Tab 1)');
      return;
    }
    setScanInitialGrade(targetGrade);
    setScanInitialPage(targetPage);
    setActiveTab('tab-scan');
    showToast(`📖 Đang mở SGK Lớp ${targetGrade}${targetPage ? ` (Trang ${targetPage})` : ''} để bóc tách...`);
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDbLoadedRef = useRef<boolean>(false);

  // Dynamic SEO metadata (title, description, canonical, OpenGraph) synced with current tab, grade & week
  const safeGradeLevel: GradeLevel = (grade >= 1 && grade <= 5 ? grade : 1) as GradeLevel;
  useSeoMeta({ activeTab, grade: safeGradeLevel, week, title });

  // Parse SEO & shared deep-link query params (?tab=, ?khoi=, ?tuan=, ?hocky=) once on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = (params.get('tab') || '').toLowerCase();
      const khoiParam = parseInt(params.get('khoi') || '', 10);
      const tuanParam = parseInt(params.get('tuan') || '', 10);
      const hockyParam = (params.get('hocky') || '').toLowerCase();

      const tabMap: Record<string, string> = {
        scan: 'tab-scan',
        extract: 'tab-img-library',
        library: 'tab-library',
        template: 'tab-template',
        generator: 'tab-generator',
        export: 'tab-export',
        intro: 'tab-intro',
        feedback: 'tab-feedback',
      };

      const validGrade: GradeLevel | null =
        khoiParam >= 1 && khoiParam <= 5 ? (khoiParam as GradeLevel) : null;
      if (validGrade) {
        setGrade(validGrade);
        setScanInitialGrade(validGrade);
      }
      if (tuanParam >= 1 && tuanParam <= 35) {
        setWeek(tuanParam);
      }
      if (tabParam && tabMap[tabParam]) {
        setActiveTab(tabMap[tabParam]);
      } else if (hockyParam === '1' || hockyParam === '2' || hockyParam === 'all') {
        setActiveTab('tab-export');
      }

      if (hockyParam === '1' || hockyParam === '2' || hockyParam === 'all') {
        const mappedScope: SemesterExportScope =
          hockyParam === '1' ? 'hk1' : hockyParam === '2' ? 'hk2' : 'full_year';
        setSemesterBundleTrigger({
          grade: validGrade || 1,
          scope: mappedScope,
          nonce: Date.now(),
        });
      }
    } catch {
      // Ignore malformed query strings
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register' | 'billing' = 'login', reason: string | null = null) => {
    setAuthGateReason(reason);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const requireAuth = (featureName: string, mode: 'login' | 'register' | 'billing' = 'register') => {
    if (isSubscriptionExpired) {
      openAuthModal('billing', featureName);
      showToast(`☕ Đã hết thời gian trải nghiệm 1 học kỳ — Xem gói duy trì hoặc nhập mã để mở khóa: ${featureName}`);
      return;
    }
    openAuthModal(mode, featureName);
    showToast(`🎁 Đăng nhập 1 chạm (không cần mật khẩu) để dùng miễn phí trọn 1 học kỳ: ${featureName}`);
  };

  // Unified Lesson Plan Version History & Draft Store (Default = Last Edited Version)
  const [planVersionStore, setPlanVersionStore] = useState<PlanVersionStore>({
    versionsByPlanKey: {},
    activeVersionIdByPlanKey: {}
  });
  const planVersionStoreRef = useRef<PlanVersionStore>(planVersionStore);
  useEffect(() => {
    planVersionStoreRef.current = planVersionStore;
  }, [planVersionStore]);

  const loadedPlanKeyRef = useRef<string>(getPlanVersionKey(9, 1, 17));
  const skipNextAutoDraftRef = useRef<boolean>(false);
  const [versionRefreshNonce, setVersionRefreshNonce] = useState<number>(0);

  // 1. Initial Load from IndexedDB (with legacy localStorage migration)
  useEffect(() => {
    async function loadIndexedDB() {
      try {
        const storedImages = await getAllImagesDB();
        if (storedImages && storedImages.length > 0) {
          // Auto-heal legacy mislabeled default entries in IndexedDB without touching teacher-cropped images
          const legacyFakeIds = new Set([
            'img_sgk_k3_tc_kd_chui_ham',
            'img_sgk_k3_tc_kd_meo_duoi_chuot',
            'img_sgk_k1_tro_choi',
            'img_sgk_k1_tc_kd_hieu_lenh',
            'img_sgk_k1_tc_vd_tho',
            'img_sgk_k5_chuyen_gay'
          ]);
          const triangleRealDiagram = standardFormationDiagrams.find(f => f.id === 'f_tro_choi_tam_giac')?.svgDataUrl;
          const sanitized = storedImages
            .filter((img: SgkImageItem) => !legacyFakeIds.has(img.id))
            .map((img: SgkImageItem) => {
              if (
                (img.id === 'img_sgk_k3_chay_tam_giac' || img.title?.toLowerCase().includes('tam giác')) &&
                img.imgUrl?.includes('k3_tro_choi_tam_giac.jpg') &&
                triangleRealDiagram
              ) {
                return {
                  ...img,
                  imgUrl: triangleRealDiagram,
                  title: 'Sơ đồ Trò chơi: Chạy theo hình tam giác - SGK Lớp 3 (Trang 29)',
                  category: 'tro_choi' as ImageCategory,
                  folder: 'troChoi' as any,
                  caption: 'Sơ đồ Trò chơi vận động Chạy theo hình tam giác: 3 cọc mốc A-B-C cự ly 8-10m, học sinh chạy tiếp sức vòng quanh tam giác.'
                };
              }
              if (img.id === 'img_sgk_k3_on_di_deu' && img.imgUrl?.includes('k3_on_di_deu_doi_chan.jpg')) {
                return { ...img, imgUrl: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg' };
              }
              if (img.id === 'img_sgk_k5_tc_kd_ai_keo_khoe' && img.imgUrl?.includes('k5_tro_choi_doi_nao_nhanh_nhat.jpg')) {
                return { ...img, imgUrl: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg' };
              }
              if (!img.imgUrl) {
                const defMatch = defaultSgkImages.find((d) => d.id === img.id);
                if (defMatch) return { ...img, imgUrl: defMatch.imgUrl };
              }
              return img;
            });
          // Merge any missing default images if not in user's library
          const existingIds = new Set(sanitized.map((i: SgkImageItem) => i.id));
          const merged = [...sanitized];
          defaultSgkImages.forEach((def) => {
            if (!existingIds.has(def.id)) {
              merged.push(def);
            }
          });
          setImages(merged);
          await saveImagesDB(merged);
        } else {
          // Check if user had old localStorage items
          const legacy = localStorage.getItem('gdtc_sgk_images');
          const initial = legacy ? JSON.parse(legacy) : defaultSgkImages;
          setImages(initial);
          await saveImagesDB(initial);
          localStorage.removeItem('gdtc_sgk_images'); // Free up localStorage quota
        }

        const storedScenarios = await getAllScenariosDB();
        if (storedScenarios && storedScenarios.length > 0) {
          setScenarios(storedScenarios);
        } else {
          const legacy = localStorage.getItem('gdtc_scenarios');
          const initial = legacy ? JSON.parse(legacy) : defaultScenarios;
          setScenarios(initial);
          await saveScenariosDB(initial);
        }

        const storedSettings = await getAppStateDB('school_settings', defaultSchoolSettings);
        setSchoolSettings(storedSettings);

        // Hydrate all custom formations & grade formation presets from IndexedDB mirror
        await hydrateCustomFormationsFromDB();

        const loadedVersionStore = await loadPlanVersionStoreDB();
        planVersionStoreRef.current = loadedVersionStore;
        setPlanVersionStore(loadedVersionStore);

        const storedCustomTemplates = await getAppStateDB<UserCustomTemplate[]>('user_custom_templates', []);
        const safeCustomTemplates = Array.isArray(storedCustomTemplates) ? storedCustomTemplates : [];
        userCustomTemplatesRef.current = safeCustomTemplates;
        setUserCustomTemplates(safeCustomTemplates);

        const storedActiveCustomId = await getAppStateDB<string | null>('active_custom_template_id', null);
        setActiveCustomTemplateId(
          storedActiveCustomId && safeCustomTemplates.some((t) => t.id === storedActiveCustomId)
            ? storedActiveCustomId
            : safeCustomTemplates[0]?.id || null
        );

        const storedAllPlans = await getAppStateDB('gdtc_all_master_plans', null);
        const normalizedMap: Record<string, MasterPlanItem> = {
          ...masterPlansTuan8,
          ...masterPlansTuan9
        };
        if (storedAllPlans && typeof storedAllPlans === 'object' && Object.keys(storedAllPlans).length > 0) {
          // User's edited plans in IndexedDB MUST have absolute priority over default templates!
          Object.keys(storedAllPlans).forEach((key) => {
            const plan = normalizeMasterPlan(storedAllPlans[key]);
            normalizedMap[key] = plan;
          });
        }
        // Ensure latest edited version from versionStore also wins in normalizedMap
        Object.keys(loadedVersionStore.versionsByPlanKey || {}).forEach((pKey) => {
          const versions = loadedVersionStore.versionsByPlanKey[pKey] || [];
          const activeId = loadedVersionStore.activeVersionIdByPlanKey?.[pKey];
          const chosen =
            (activeId ? versions.find((v) => v.versionId === activeId) : null) ||
            [...versions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
          if (chosen?.snapshot) {
            const snap = normalizeMasterPlan(chosen.snapshot);
            const shortKey = `k${snap.grade}_t${snap.lessonNum}`;
            normalizedMap[`${shortKey}_w${snap.week}`] = snap;
            normalizedMap[shortKey] = snap;
          }
        });
        setAllMasterPlans(normalizedMap);
        await setAppStateDB('gdtc_all_master_plans', normalizedMap);
        setVersionRefreshNonce((n) => n + 1);

        // Restore active week and lesson metadata
        const savedWeek = await getAppStateDB('active_week', 9);
        const savedGrade = await getAppStateDB('active_grade', 1);
        const savedLessonNum = await getAppStateDB('active_lesson_num', 17);
        const savedTopic = await getAppStateDB('active_topic', 'CHỦ ĐỀ 2: BÀI THỂ DỤC');
        const savedTitle = await getAppStateDB('active_title', 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC BỤNG (TIẾT 1)');

        const storedMasterPlan = await getAppStateDB<MasterPlanItem | null>('master_plan', null);
        const storedRows = await getAppStateDB<LessonRow[] | null>('current_lesson_rows', null);

        // CRITICAL: Always default to the last edited version if available!
        const latestVer = getPreferredVersionForPlan(loadedVersionStore, savedWeek, savedGrade, savedLessonNum);
        loadedPlanKeyRef.current = getPlanVersionKey(savedWeek, savedGrade, savedLessonNum);
        skipNextAutoDraftRef.current = true;

        setWeek(savedWeek);
        setGrade(savedGrade);
        setLessonNum(savedLessonNum);

        if (latestVer?.snapshot) {
          const snap = normalizeMasterPlan(latestVer.snapshot);
          setCurrentMasterPlan(snap);
          setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
          setTopic(snap.topic || savedTopic);
          setTitle(snap.title || savedTitle);
        } else {
          const mapMatch =
            normalizedMap[`k${savedGrade}_t${savedLessonNum}_w${savedWeek}`] ||
            normalizedMap[`k${savedGrade}_t${savedLessonNum}`];
          if (storedMasterPlan && storedMasterPlan.grade === savedGrade && storedMasterPlan.lessonNum === savedLessonNum && storedMasterPlan.week === savedWeek) {
            setCurrentMasterPlan(normalizeMasterPlan(storedMasterPlan));
          } else if (mapMatch) {
            setCurrentMasterPlan(normalizeMasterPlan(mapMatch));
          }

          if (storedRows && Array.isArray(storedRows) && storedRows.length > 0) {
            setLessonRows(storedRows);
          } else if (mapMatch?.rows?.length) {
            setLessonRows(JSON.parse(JSON.stringify(mapMatch.rows)));
          }
          setTopic(savedTopic);
          setTitle(savedTitle);
        }
      } catch (err) {
        console.warn('IndexedDB initialization notice:', err);
      } finally {
        isDbLoadedRef.current = true;
      }
    }

    loadIndexedDB();
  }, []);

  // 2. Persist to IndexedDB on state changes (Asynchronous & Gigabyte capable)
  useEffect(() => {
    if (isDbLoadedRef.current) {
      saveImagesDB(images).catch((e) => console.warn('Error syncing images to DB', e));
    }
  }, [images]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      saveScenariosDB(scenarios).catch((e) => console.warn('Error syncing scenarios to DB', e));
    }
  }, [scenarios]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('school_settings', schoolSettings);
    }
  }, [schoolSettings]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('master_plan', currentMasterPlan);
    }
  }, [currentMasterPlan]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('gdtc_all_master_plans', allMasterPlans);
    }
  }, [allMasterPlans]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      savePlanVersionStoreDB(planVersionStore).catch((e) => console.warn('Error syncing version store', e));
    }
  }, [planVersionStore]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('user_custom_templates', userCustomTemplates);
    }
  }, [userCustomTemplates]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('active_custom_template_id', activeCustomTemplateId);
    }
  }, [activeCustomTemplateId]);

  const allMasterPlansRef = useRef<Record<string, MasterPlanItem>>(allMasterPlans);
  useEffect(() => {
    allMasterPlansRef.current = allMasterPlans;
  }, [allMasterPlans]);

  const schoolSettingsRef = useRef<SchoolSettings>(schoolSettings);
  useEffect(() => {
    schoolSettingsRef.current = schoolSettings;
  }, [schoolSettings]);

  const imagesRef = useRef<SgkImageItem[]>(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const buildWorkspaceSnapshot = () => ({
    version: 3,
    updatedAt: Date.now(),
    schoolSettings: schoolSettingsRef.current,
    images: imagesRef.current,
    customFormations: getSavedCustomFormations(),
    gradeFormationStyles: getGradeFormationStyles(),
    planVersionStore: planVersionStoreRef.current,
    allMasterPlans: allMasterPlansRef.current,
    userCustomTemplates: userCustomTemplatesRef.current,
    activeCustomTemplateId,
    activeWeek: week,
    activeGrade: grade,
    activeLessonNum: lessonNum
  });

  const mergeAndApplyServerWorkspace = async (serverWs: any) => {
    if (!serverWs || typeof serverWs !== 'object') return false;
    let changed = false;

    if (Array.isArray(serverWs.images) && serverWs.images.length > 0) {
      const mergedImgMap = new Map<string, SgkImageItem>();
      imagesRef.current.forEach((img) => {
        if (img?.id) mergedImgMap.set(img.id, img);
      });
      serverWs.images.forEach((img: SgkImageItem) => {
        if (img?.id && img?.imgUrl) {
          mergedImgMap.set(img.id, { ...img, selected: false });
        }
      });
      const mergedImages = Array.from(mergedImgMap.values());
      if (mergedImages.length !== imagesRef.current.length) {
        imagesRef.current = mergedImages;
        setImages(mergedImages);
        await saveImagesDB(mergedImages);
        changed = true;
      }
    }

    if (Array.isArray(serverWs.customFormations) && serverWs.customFormations.length > 0) {
      const { addedCount } = mergeCustomFormationsIntoStorage(serverWs.customFormations, {
        silentEvent: true,
        source: 'server_pull'
      });
      if (addedCount > 0) changed = true;
    }

    if (serverWs.gradeFormationStyles && typeof serverWs.gradeFormationStyles === 'object') {
      saveGradeFormationStyles(serverWs.gradeFormationStyles, { silentEvent: true });
    }

    if (serverWs.schoolSettings && typeof serverWs.schoolSettings === 'object') {
      const mergedSettings = { ...schoolSettingsRef.current, ...serverWs.schoolSettings };
      setSchoolSettings(mergedSettings);
      await setAppStateDB('school_settings', mergedSettings);
    }

    if (Array.isArray(serverWs.userCustomTemplates) && serverWs.userCustomTemplates.length > 0) {
      const mergedMap = new Map<string, UserCustomTemplate>();
      [...userCustomTemplatesRef.current, ...serverWs.userCustomTemplates].forEach((tpl: UserCustomTemplate) => {
        if (!tpl?.id) return;
        const existing = mergedMap.get(tpl.id);
        if (!existing || (tpl.updatedAt || 0) >= (existing.updatedAt || 0)) {
          mergedMap.set(tpl.id, tpl);
        }
      });
      const mergedTemplates = Array.from(mergedMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      userCustomTemplatesRef.current = mergedTemplates;
      setUserCustomTemplates(mergedTemplates);
      await setAppStateDB('user_custom_templates', mergedTemplates);
      if (!activeCustomTemplateId && mergedTemplates[0]) {
        setActiveCustomTemplateId(serverWs.activeCustomTemplateId || mergedTemplates[0].id);
      }
      changed = true;
    }

    if (serverWs.planVersionStore && typeof serverWs.planVersionStore === 'object') {
      const localStore = planVersionStoreRef.current;
      const remoteStore = serverWs.planVersionStore as PlanVersionStore;
      const mergedByKey: Record<string, LessonPlanVersion[]> = { ...(localStore.versionsByPlanKey || {}) };
      const mergedActive: Record<string, string> = { ...(localStore.activeVersionIdByPlanKey || {}) };

      Object.entries(remoteStore.versionsByPlanKey || {}).forEach(([planKey, remoteList]) => {
        const localList = mergedByKey[planKey] || [];
        const byId = new Map<string, LessonPlanVersion>();
        [...localList, ...(remoteList || [])].forEach((v) => {
          if (!v?.versionId) return;
          const prev = byId.get(v.versionId);
          if (!prev || (v.updatedAt || 0) >= (prev.updatedAt || 0)) {
            byId.set(v.versionId, v);
          }
        });
        const sorted = Array.from(byId.values()).sort((a, b) => a.versionNumber - b.versionNumber);
        mergedByKey[planKey] = sorted;
        const newest = [...sorted].sort((a, b) => b.updatedAt - a.updatedAt)[0];
        if (newest) {
          mergedActive[planKey] = newest.versionId;
        }
      });

      const nextStore: PlanVersionStore = {
        versionsByPlanKey: mergedByKey,
        activeVersionIdByPlanKey: mergedActive
      };
      planVersionStoreRef.current = nextStore;
      setPlanVersionStore(nextStore);
      await savePlanVersionStoreDB(nextStore);
      changed = true;
    }

    const nextAllPlans: Record<string, MasterPlanItem> = { ...allMasterPlansRef.current };
    if (serverWs.allMasterPlans && typeof serverWs.allMasterPlans === 'object') {
      Object.entries(serverWs.allMasterPlans).forEach(([k, val]) => {
        if (val && typeof val === 'object') {
          nextAllPlans[k] = normalizeMasterPlan(val as MasterPlanItem);
        }
      });
    }
    Object.values(planVersionStoreRef.current.versionsByPlanKey || {}).forEach((versions) => {
      const latest = [...(versions || [])].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (latest?.snapshot) {
        const snap = normalizeMasterPlan(latest.snapshot);
        const shortKey = `k${snap.grade}_t${snap.lessonNum}`;
        nextAllPlans[shortKey] = snap;
        nextAllPlans[`${shortKey}_w${snap.week}`] = snap;
      }
    });
    setAllMasterPlans(nextAllPlans);
    await setAppStateDB('gdtc_all_master_plans', nextAllPlans);

    const activeVer = getPreferredVersionForPlan(planVersionStoreRef.current, week, grade, lessonNum);
    if (activeVer?.snapshot) {
      const snap = normalizeMasterPlan(activeVer.snapshot);
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(snap);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      setTitle(snap.title);
      setTopic(snap.topic);
    }

    setVersionRefreshNonce((n) => n + 1);
    return changed;
  };

  const hasPulledInitialWorkspaceRef = useRef<boolean>(false);
  useEffect(() => {
    if (!authUser) {
      hasPulledInitialWorkspaceRef.current = false;
      return;
    }
    if (hasPulledInitialWorkspaceRef.current) return;
    hasPulledInitialWorkspaceRef.current = true;

    pullWorkspace().then(async (ws) => {
      if (ws && (ws.planVersionStore || ws.userCustomTemplates?.length || ws.allMasterPlans)) {
        await mergeAndApplyServerWorkspace(ws);
      }
    }).catch(() => {});
  }, [authUser?.id]);

  const [customFormationsNonce, setCustomFormationsNonce] = useState<number>(0);

  // Debounced automatic server sync when authenticated
  const autoSyncTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!authUser || !isDbLoadedRef.current) return;
    if (autoSyncTimerRef.current !== null) {
      window.clearTimeout(autoSyncTimerRef.current);
    }
    autoSyncTimerRef.current = window.setTimeout(() => {
      autoSyncTimerRef.current = null;
      pushWorkspace(buildWorkspaceSnapshot()).catch(() => {});
    }, 2000);
    return () => {
      if (autoSyncTimerRef.current !== null) {
        window.clearTimeout(autoSyncTimerRef.current);
      }
    };
  }, [authUser?.id, planVersionStore, userCustomTemplates, schoolSettings, activeCustomTemplateId, customFormationsNonce]);

  // =========================================================================
  // 2-WAY GOOGLE DRIVE CLOUD AUTO-SYNC (AI STUDIO <-> VERCEL <-> MOBILE)
  // =========================================================================
  const [cloudGoogleUser, setCloudGoogleUser] = useState<FirebaseGoogleUser | null>(null);
  const [cloudAutoSyncEnabled, setCloudAutoSyncEnabled] = useState<boolean>(() => getCloudAutoSyncPref());
  const [cloudSessionConsented, setCloudSessionConsented] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatusInfo>({
    phase: 'idle',
    lastSyncedAt: null,
    syncedImageCount: 0,
    syncedPlanCount: 0,
    lastSummary: '',
    errorMessage: null,
    unauthorizedDomain: null
  });

  const scenariosRef = useRef<ScenarioItem[]>(scenarios);
  useEffect(() => {
    scenariosRef.current = scenarios;
  }, [scenarios]);

  const lessonRowsRef = useRef<LessonRow[]>(lessonRows);
  useEffect(() => {
    lessonRowsRef.current = lessonRows;
  }, [lessonRows]);

  const activeMetaRef = useRef({ week, grade, lessonNum, topic, title, activeCustomTemplateId });
  useEffect(() => {
    activeMetaRef.current = { week, grade, lessonNum, topic, title, activeCustomTemplateId };
  }, [week, grade, lessonNum, topic, title, activeCustomTemplateId]);

  const isCloudSyncingRef = useRef<boolean>(false);
  const lastCloudSyncedAtRef = useRef<number | null>(null);
  const suppressNextAutoPushRef = useRef<boolean>(false);
  const lastFocusCheckRef = useRef<number>(0);
  const [sgkOverridesNonce, setSgkOverridesNonce] = useState<number>(0);

  // Monitor Firebase Google Auth session (in-memory OAuth token only per Workspace guidelines)
  useEffect(() => {
    const unsubscribe = initAuth(
      (gUser) => {
        setCloudGoogleUser(gUser);
      },
      () => {
        setCloudGoogleUser(null);
        setCloudSessionConsented(false);
        if (getCloudAutoSyncPref()) {
          setCloudSyncStatus((prev) => ({
            ...prev,
            phase: 'needs_reconnect'
          }));
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Track SGK curriculum tree edits AND custom formation library edits so they auto-sync too
  useEffect(() => {
    const onTreeOverride = () => setSgkOverridesNonce((n) => n + 1);
    const onFormationsChanged = () => setCustomFormationsNonce((n) => n + 1);
    const onOpenBackupRestore = () => setIsBackupRestoreOpen(true);

    window.addEventListener(SGK_TREE_OVERRIDES_EVENT, onTreeOverride);
    window.addEventListener(CUSTOM_FORMATIONS_CHANGED_EVENT, onFormationsChanged);
    window.addEventListener(OPEN_BACKUP_RESTORE_EVENT, onOpenBackupRestore);
    return () => {
      window.removeEventListener(SGK_TREE_OVERRIDES_EVENT, onTreeOverride);
      window.removeEventListener(CUSTOM_FORMATIONS_CHANGED_EVENT, onFormationsChanged);
      window.removeEventListener(OPEN_BACKUP_RESTORE_EVENT, onOpenBackupRestore);
    };
  }, []);

  const buildLocalCloudSyncSnapshot = (): LocalSyncSnapshot => ({
    images: imagesRef.current,
    customFormations: getSavedCustomFormations(),
    gradeFormationStyles: getGradeFormationStyles(),
    scenarios: scenariosRef.current,
    schoolSettings: schoolSettingsRef.current,
    allMasterPlans: allMasterPlansRef.current,
    planVersionStore: planVersionStoreRef.current,
    userCustomTemplates: userCustomTemplatesRef.current,
    activeCustomTemplateId: activeMetaRef.current.activeCustomTemplateId,
    sgkTreeOverrides: getSgkTreeOverrides(),
    activeState: {
      week: activeMetaRef.current.week,
      grade: activeMetaRef.current.grade,
      lessonNum: activeMetaRef.current.lessonNum,
      topic: activeMetaRef.current.topic,
      title: activeMetaRef.current.title,
      lessonRows: lessonRowsRef.current
    }
  });

  const applyCloudMergedSnapshot = async (merged: LocalSyncSnapshot) => {
    suppressNextAutoPushRef.current = true;

    imagesRef.current = merged.images;
    setImages(merged.images);
    await saveImagesDB(merged.images);

    if (Array.isArray(merged.customFormations)) {
      saveCustomFormationsList(merged.customFormations, {
        silentEvent: true,
        source: 'cloud_sync_pull'
      });
    }
    if (merged.gradeFormationStyles && typeof merged.gradeFormationStyles === 'object') {
      saveGradeFormationStyles(merged.gradeFormationStyles, { silentEvent: true });
    }

    scenariosRef.current = merged.scenarios;
    setScenarios(merged.scenarios);
    await saveScenariosDB(merged.scenarios);

    schoolSettingsRef.current = merged.schoolSettings;
    setSchoolSettings(merged.schoolSettings);
    await setAppStateDB('school_settings', merged.schoolSettings);

    planVersionStoreRef.current = merged.planVersionStore;
    setPlanVersionStore(merged.planVersionStore);
    await savePlanVersionStoreDB(merged.planVersionStore);

    userCustomTemplatesRef.current = merged.userCustomTemplates;
    setUserCustomTemplates(merged.userCustomTemplates);
    await setAppStateDB('user_custom_templates', merged.userCustomTemplates);

    if (merged.activeCustomTemplateId) {
      setActiveCustomTemplateId(merged.activeCustomTemplateId);
      await setAppStateDB('active_custom_template_id', merged.activeCustomTemplateId);
    }

    allMasterPlansRef.current = merged.allMasterPlans;
    setAllMasterPlans(merged.allMasterPlans);
    await setAppStateDB('gdtc_all_master_plans', merged.allMasterPlans);

    if (merged.sgkTreeOverrides && typeof merged.sgkTreeOverrides === 'object') {
      Object.entries(merged.sgkTreeOverrides).forEach(([lessonId, ov]) => {
        if (ov) saveSgkTreeLessonOverride(lessonId, ov);
      });
    }

    const activeVer = getPreferredVersionForPlan(
      merged.planVersionStore,
      activeMetaRef.current.week,
      activeMetaRef.current.grade,
      activeMetaRef.current.lessonNum
    );
    if (activeVer?.snapshot) {
      const snap = normalizeMasterPlan(activeVer.snapshot);
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(snap);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      setTitle(snap.title);
      setTopic(snap.topic);
    }

    setVersionRefreshNonce((n) => n + 1);
  };

  const runTwoWayCloudSync = async (opts?: {
    silent?: boolean;
    interactiveSignIn?: boolean;
    enableAutoSyncAfter?: boolean;
    forcePushImages?: boolean;
    forcePushWorkspace?: boolean;
  }): Promise<boolean> => {
    if (isCloudSyncingRef.current) return false;
    isCloudSyncingRef.current = true;

    setCloudSyncStatus((prev) => ({
      ...prev,
      phase: 'syncing',
      errorMessage: null,
      unauthorizedDomain: null
    }));

    try {
      // Check cached token synchronously so googleSignIn() runs directly inside the click gesture
      let token = getCachedAccessTokenSync();
      if (!token) {
        if (!opts?.interactiveSignIn) {
          setCloudSyncStatus((prev) => ({
            ...prev,
            phase: 'needs_reconnect',
            errorMessage: 'Vui lòng kết nối lại Google Drive để đồng bộ.'
          }));
          return false;
        }
        const signInRes = await googleSignIn();
        if (!signInRes) {
          // User closed the Google sign-in popup before completing
          setCloudSyncStatus((prev) => ({
            ...prev,
            phase: prev.lastSyncedAt ? 'needs_reconnect' : 'idle',
            errorMessage:
              'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất. Hãy bấm lại nút đăng nhập và chọn tài khoản Google để đồng bộ.'
          }));
          if (!opts?.silent) {
            showToast('ℹ️ Đã đóng cửa sổ đăng nhập Google. Bấm lại khi bạn sẵn sàng đồng bộ.');
          }
          return false;
        }
        setCloudGoogleUser(signInRes.user);
        token = signInRes.accessToken;
      }

      if (opts?.interactiveSignIn) {
        setCloudSessionConsented(true);
      }

      if (opts?.enableAutoSyncAfter) {
        setCloudAutoSyncEnabled(true);
        setCloudAutoSyncPref(true);
      }

      const localSnapshot = buildLocalCloudSyncSnapshot();
      const result = await performTwoWayCloudSync(localSnapshot, {
        lastSyncedAt: lastCloudSyncedAtRef.current,
        forcePushImages: opts?.forcePushImages,
        forcePushWorkspace: opts?.forcePushWorkspace
      });

      if (result.didPullChanges) {
        await applyCloudMergedSnapshot(result.merged);
      }

      lastCloudSyncedAtRef.current = result.syncedAt;
      const totalPlans = Object.keys(result.merged.allMasterPlans || {}).length;
      const totalFormations = result.merged.customFormations?.length || 0;
      const summaryParts: string[] = [];
      if (result.addedImagesFromCloud > 0) {
        summaryParts.push(`+${result.addedImagesFromCloud} ảnh mới từ Drive`);
      }
      if (result.addedFormationsFromCloud > 0) {
        summaryParts.push(`+${result.addedFormationsFromCloud} sơ đồ tự vẽ từ Drive`);
      }
      if (result.didPushImages) {
        summaryParts.push(`đã đẩy ${result.merged.images.length} ảnh lên Drive`);
      }
      if (result.didPushWorkspace && totalFormations > 0) {
        summaryParts.push(`đã đồng bộ ${totalFormations} sơ đồ tự thiết kế`);
      } else if (result.didPushWorkspace && !result.didPushImages) {
        summaryParts.push('đã cập nhật giáo án lên Drive');
      } else if (result.didPullChanges && result.addedImagesFromCloud === 0 && result.addedFormationsFromCloud === 0) {
        summaryParts.push('đã cập nhật giáo án mới từ Drive');
      }
      const summaryText =
        summaryParts.length > 0
          ? summaryParts.join(' · ')
          : `Đã đồng bộ khít (${result.merged.images.length} ảnh · ${totalFormations} sơ đồ · ${totalPlans} giáo án)`;

      setCloudSyncStatus({
        phase: 'synced',
        lastSyncedAt: result.syncedAt,
        syncedImageCount: result.merged.images.length,
        syncedPlanCount: totalPlans,
        syncedFormationCount: totalFormations,
        lastSummary: summaryText,
        errorMessage: null,
        unauthorizedDomain: null
      });

      if (!opts?.silent) {
        showToast(
          `☁️ Đồng bộ 2 nền tảng thành công! ${summaryText} (${result.merged.images.length} ảnh · ${totalFormations} sơ đồ tự vẽ).`
        );
      }
      return true;
    } catch (err: any) {
      const isUnauthorized =
        err?.code === 'auth/unauthorized-domain' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('unauthorized-domain'));
      const currentDomain =
        typeof window !== 'undefined' ? window.location.hostname : 'pe-smart-planner.vercel.app';

      const msg = isUnauthorized
        ? `Tên miền "${currentDomain}" chưa được thêm vào Authorized Domains của Firebase.`
        : err?.message || 'Đồng bộ Google Drive chưa thành công. Vui lòng thử lại.';

      if (!isUnauthorized) {
        console.warn('Cloud Auto-Sync notice:', err?.code || msg);
      }

      setCloudSyncStatus((prev) => ({
        ...prev,
        phase: 'error',
        errorMessage: msg,
        unauthorizedDomain: isUnauthorized ? currentDomain : null
      }));

      if (!opts?.silent) {
        showToast(`⚠️ ${msg}`);
      }
      return false;
    } finally {
      isCloudSyncingRef.current = false;
    }
  };

  const handleToggleCloudAutoSync = (nextEnabled: boolean) => {
    setCloudAutoSyncEnabled(nextEnabled);
    setCloudAutoSyncPref(nextEnabled);
    if (!nextEnabled) {
      showToast('Đã tạm dừng tự động đồng bộ nền Google Drive.');
    } else {
      showToast('☁️ Đã bật chế độ Tự động đồng bộ 2 nền tảng mỗi khi sửa ảnh hoặc giáo án!');
    }
  };

  const handleDisconnectCloudSync = async () => {
    try {
      await logoutGoogle();
    } catch {
      // ignore sign-out error
    }
    setCloudGoogleUser(null);
    setCloudSessionConsented(false);
    setCloudAutoSyncEnabled(false);
    setCloudAutoSyncPref(false);
    setCloudSyncStatus({
      phase: 'idle',
      lastSyncedAt: null,
      syncedImageCount: 0,
      syncedPlanCount: 0,
      lastSummary: '',
      errorMessage: null,
      unauthorizedDomain: null
    });
    showToast('Đã ngắt kết nối đồng bộ Google Drive.');
  };

  // Debounced automatic background push to Google Drive when Auto-Sync is active in this session
  const cloudAutoPushTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isDbLoadedRef.current) return;
    if (!cloudAutoSyncEnabled || !cloudSessionConsented || !cloudGoogleUser) return;

    if (suppressNextAutoPushRef.current) {
      suppressNextAutoPushRef.current = false;
      return;
    }

    if (cloudAutoPushTimerRef.current !== null) {
      window.clearTimeout(cloudAutoPushTimerRef.current);
    }

    cloudAutoPushTimerRef.current = window.setTimeout(() => {
      cloudAutoPushTimerRef.current = null;
      runTwoWayCloudSync({ silent: true, interactiveSignIn: false }).catch(() => {});
    }, 4500);

    return () => {
      if (cloudAutoPushTimerRef.current !== null) {
        window.clearTimeout(cloudAutoPushTimerRef.current);
      }
    };
  }, [
    cloudAutoSyncEnabled,
    cloudSessionConsented,
    cloudGoogleUser?.uid,
    images,
    allMasterPlans,
    planVersionStore,
    userCustomTemplates,
    scenarios,
    schoolSettings,
    sgkOverridesNonce,
    customFormationsNonce
  ]);

  // Allow any child modal (e.g., SelectFormationModal) to trigger immediate 2-way Cloud Sync
  const runTwoWayCloudSyncRef = useRef(runTwoWayCloudSync);
  runTwoWayCloudSyncRef.current = runTwoWayCloudSync;
  useEffect(() => {
    const onTriggerCloudSync = () => {
      runTwoWayCloudSyncRef.current({
        silent: false,
        interactiveSignIn: true,
        enableAutoSyncAfter: true,
        forcePushWorkspace: true
      }).catch(() => {});
    };
    window.addEventListener(TRIGGER_CLOUD_SYNC_EVENT, onTriggerCloudSync);
    return () => window.removeEventListener(TRIGGER_CLOUD_SYNC_EVENT, onTriggerCloudSync);
  }, []);

  // Automatic background pull when returning to tab (switching AI Studio <-> Vercel <-> Mobile)
  useEffect(() => {
    if (!cloudAutoSyncEnabled || !cloudSessionConsented || !cloudGoogleUser) return;

    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastFocusCheckRef.current < 45000) return;
      if (isCloudSyncingRef.current) return;
      lastFocusCheckRef.current = now;

      try {
        const hasNewer = await checkCloudHasNewerUpdate(lastCloudSyncedAtRef.current);
        if (hasNewer) {
          await runTwoWayCloudSync({ silent: true, interactiveSignIn: false });
        }
      } catch {
        // silent background check
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [cloudAutoSyncEnabled, cloudSessionConsented, cloudGoogleUser?.uid]);

  // Helper: sync a plan into allMasterPlans safely by both week-specific and generic key
  const upsertMasterPlanInDictionary = (plan: MasterPlanItem) => {
    const normalized = normalizeMasterPlan(plan);
    const shortKey = `k${normalized.grade}_t${normalized.lessonNum}`;
    const weekKey = `${shortKey}_w${normalized.week}`;
    setAllMasterPlans((prev) => ({
      ...prev,
      [shortKey]: normalized,
      [weekKey]: normalized
    }));
  };

  // Synchronized Plan Updater: updates allMasterPlans reactively
  const handleUpdateSingleMasterPlan = (key: string, updatedPlan: MasterPlanItem) => {
    const normalized = normalizeMasterPlan(updatedPlan);
    setAllMasterPlans((prev) => ({
      ...prev,
      [key]: normalized,
      [`k${normalized.grade}_t${normalized.lessonNum}_w${normalized.week}`]: normalized
    }));

    if (
      currentMasterPlan.id === normalized.id ||
      (currentMasterPlan.lessonNum === normalized.lessonNum &&
        currentMasterPlan.grade === normalized.grade &&
        currentMasterPlan.week === normalized.week)
    ) {
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(normalized);
      setLessonRows(JSON.parse(JSON.stringify(normalized.rows)));
    }
  };

  // Auto-save draft helper for single or multiple plans (never triggers destructive Tab 6 reset)
  const handleAutoSaveDraftPlans = (
    plansToSave: MasterPlanItem[],
    sourceTab: 'tab-generator' | 'tab-export'
  ) => {
    if (!isDbLoadedRef.current || isAccessLocked || plansToSave.length === 0) return;
    let updatedStore = planVersionStoreRef.current;
    let anyChanged = false;
    const dictUpdates: Record<string, MasterPlanItem> = {};

    plansToSave.forEach((rawPlan) => {
      const normalized = normalizeMasterPlan(rawPlan);
      const res = upsertDraftVersion(updatedStore, normalized, sourceTab, null);
      if (res.changed) {
        updatedStore = res.store;
        anyChanged = true;
      }
      const shortKey = `k${normalized.grade}_t${normalized.lessonNum}`;
      dictUpdates[shortKey] = normalized;
      dictUpdates[`${shortKey}_w${normalized.week}`] = normalized;
    });

    if (anyChanged) {
      planVersionStoreRef.current = updatedStore;
      setPlanVersionStore(updatedStore);
      savePlanVersionStoreDB(updatedStore).catch(() => {});
    }
    setAllMasterPlans((prev) => {
      const next = { ...prev, ...dictUpdates };
      setAppStateDB('gdtc_all_master_plans', next).catch(() => {});
      return next;
    });
    if (sourceTab === 'tab-generator' && plansToSave[0]) {
      const firstNorm = normalizeMasterPlan(plansToSave[0]);
      setAppStateDB('master_plan', firstNorm).catch(() => {});
      setAppStateDB('current_lesson_rows', firstNorm.rows).catch(() => {});
    }
  };

  const handleSaveOfficialVersion = (
    plan: MasterPlanItem,
    sourceTab: 'tab-generator' | 'tab-export',
    customLabel?: string,
    markAsBest?: boolean,
    baselinePlan?: MasterPlanItem | null,
    forceNewVersion?: boolean
  ): LessonPlanVersion => {
    const res = commitOfficialVersion(planVersionStoreRef.current, plan, sourceTab, {
      customLabel,
      markAsBest,
      baselinePlan,
      forceNewVersion: forceNewVersion ?? Boolean(customLabel)
    });
    planVersionStoreRef.current = res.store;
    setPlanVersionStore(res.store);
    savePlanVersionStoreDB(res.store).catch(() => {});

    const snap = normalizeMasterPlan(res.savedVersion.snapshot);
    const shortKey = `k${snap.grade}_t${snap.lessonNum}`;
    const weekKey = `${shortKey}_w${snap.week}`;
    setAllMasterPlans((prev) => {
      const next = { ...prev, [shortKey]: snap, [weekKey]: snap };
      setAppStateDB('gdtc_all_master_plans', next).catch(() => {});
      return next;
    });

    if (
      Number(snap.week) === Number(week) &&
      Number(snap.grade) === Number(grade) &&
      Number(snap.lessonNum) === Number(lessonNum)
    ) {
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(snap);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      setTitle(snap.title);
      setTopic(snap.topic);
      setAppStateDB('master_plan', snap).catch(() => {});
      setAppStateDB('current_lesson_rows', snap.rows).catch(() => {});
    }

    setVersionRefreshNonce((n) => n + 1);
    showToast(
      `💾 Đã lưu "${res.savedVersion.label}" (Phiên bản #${res.savedVersion.versionNumber})!`
    );
    return res.savedVersion;
  };

  const handleSaveMultipleOfficialVersions = (
    plans: MasterPlanItem[],
    sourceTab: 'tab-export'
  ) => {
    let nextStore = planVersionStoreRef.current;
    const dictUpdates: Record<string, MasterPlanItem> = {};
    plans.forEach((p) => {
      const res = commitOfficialVersion(nextStore, p, sourceTab, { forceNewVersion: false });
      nextStore = res.store;
      const snap = normalizeMasterPlan(res.savedVersion.snapshot);
      dictUpdates[`k${snap.grade}_t${snap.lessonNum}`] = snap;
      dictUpdates[`k${snap.grade}_t${snap.lessonNum}_w${snap.week}`] = snap;
    });
    planVersionStoreRef.current = nextStore;
    setPlanVersionStore(nextStore);
    savePlanVersionStoreDB(nextStore).catch(() => {});
    setAllMasterPlans((prev) => {
      const next = { ...prev, ...dictUpdates };
      setAppStateDB('gdtc_all_master_plans', next).catch(() => {});
      return next;
    });

    // If current Tab 5 lesson is among these plans, keep it synced silently without wiping Tab 6
    const matchingTab5 = plans.find(
      (p) => Number(p.grade) === Number(grade) && Number(p.lessonNum) === Number(lessonNum) && Number(p.week) === Number(week)
    );
    if (matchingTab5) {
      const normalizedMatch = normalizeMasterPlan(matchingTab5);
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(normalizedMatch);
      setLessonRows(JSON.parse(JSON.stringify(normalizedMatch.rows)));
      setTitle(normalizedMatch.title);
      setTopic(normalizedMatch.topic);
      setAppStateDB('master_plan', normalizedMatch).catch(() => {});
      setAppStateDB('current_lesson_rows', normalizedMatch.rows).catch(() => {});
    }
    setVersionRefreshNonce((n) => n + 1);
  };

  const handleLoadPlanVersion = (planKey: string, versionId: string) => {
    const res = activateVersionInStore(planVersionStoreRef.current, planKey, versionId);
    if (!res.version) return;
    planVersionStoreRef.current = res.store;
    setPlanVersionStore(res.store);
    savePlanVersionStoreDB(res.store).catch(() => {});

    const snap = normalizeMasterPlan(res.version.snapshot);
    upsertMasterPlanInDictionary(snap);

    if (
      Number(snap.week) === Number(week) &&
      Number(snap.grade) === Number(grade) &&
      Number(snap.lessonNum) === Number(lessonNum)
    ) {
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(snap);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      setTitle(snap.title);
      setTopic(snap.topic);
    }

    setVersionRefreshNonce((n) => n + 1);
    showToast(`📂 Đã tải lại Phiên bản #${res.version.versionNumber}: "${res.version.label}"!`);
  };

  const handleToggleBestVersion = (planKey: string, versionId: string) => {
    const nextStore = toggleBestVersionInStore(planVersionStoreRef.current, planKey, versionId);
    planVersionStoreRef.current = nextStore;
    setPlanVersionStore(nextStore);
    savePlanVersionStoreDB(nextStore).catch(() => {});
    showToast('⭐ Đã cập nhật trạng thái Phiên bản hoàn hảo nhất!');
  };

  const handleDeletePlanVersion = (planKey: string, versionId: string) => {
    const nextStore = deleteVersionFromStore(planVersionStoreRef.current, planKey, versionId);
    planVersionStoreRef.current = nextStore;
    setPlanVersionStore(nextStore);
    savePlanVersionStoreDB(nextStore).catch(() => {});
    showToast('🗑️ Đã xóa phiên bản cũ khỏi lịch sử.');
  };

  const handlePrunePlanVersions = (targetPlanKey?: string, keepCount: number = 3) => {
    if (isAccessLocked) {
      requireAuth('Dọn các phiên bản cũ để tiết kiệm dung lượng');
      return;
    }
    const res = pruneVersionsKeepLatest(planVersionStoreRef.current, keepCount, targetPlanKey);
    if (res.removedCount === 0) {
      showToast(`✅ Dữ liệu đã gọn nhẹ — mỗi tiết hiện đều đang có ≤ ${keepCount} phiên bản gần nhất!`);
      return;
    }
    planVersionStoreRef.current = res.store;
    setPlanVersionStore(res.store);
    savePlanVersionStoreDB(res.store).catch(() => {});
    setVersionRefreshNonce((n) => n + 1);
    const scopeText = targetPlanKey ? 'tiết giáo án này' : `${res.affectedPlansCount} tiết giáo án`;
    showToast(
      `🧹 Đã xóa ${res.removedCount} phiên bản cũ của ${scopeText} (chỉ giữ ${keepCount} bản gần nhất/tiết) · Tiết kiệm ~${formatBytesApproxVi(res.freedBytesApprox)}!`
    );
  };

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('current_lesson_rows', lessonRows);
    }
  }, [lessonRows]);

  // Context switching in Tab 5: load last edited version when switching (week, grade, lessonNum)
  const handleChangeGeneratorContext = (
    nextWeek: number,
    nextGrade: number,
    nextLessonNum: number
  ) => {
    const targetKey = getPlanVersionKey(nextWeek, nextGrade, nextLessonNum);
    if (loadedPlanKeyRef.current !== targetKey) {
      // Flush current active plan draft before switching context
      const currentPlanSnapshot: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as GradeLevel,
        week,
        lessonNum,
        topic,
        title,
        rows: JSON.parse(JSON.stringify(lessonRows))
      });
      handleAutoSaveDraftPlans([currentPlanSnapshot], 'tab-generator');
    }

    loadedPlanKeyRef.current = targetKey;
    skipNextAutoDraftRef.current = true;
    setWeek(nextWeek);
    setGrade(nextGrade);
    setLessonNum(nextLessonNum);

    const ppctPeriod = getPpctPeriodItem(nextGrade as GradeLevel, nextLessonNum);
    const ppct = getGradePpctInfo(nextGrade as GradeLevel, nextWeek);
    const expectedPpctTitle = ppctPeriod?.lessonTitle || '';
    const isPdfIntegratedGrade = nextGrade === 1 || nextGrade === 3 || nextGrade === 5;
    const normTitle = (s: string) =>
      cleanLessonTitleForHeader(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const isDraftStaleAgainstPpct = (snapTitle: string): boolean => {
      if (!isPdfIntegratedGrade || !expectedPpctTitle) return false;
      const a = normTitle(snapTitle);
      const b = normTitle(expectedPpctTitle);
      if (!a || !b) return false;
      return a !== b && !a.includes(b.slice(0, 14)) && !b.includes(a.slice(0, 14));
    };

    const existingVer = getPreferredVersionForPlan(
      planVersionStoreRef.current,
      nextWeek,
      nextGrade,
      nextLessonNum
    );
    if (existingVer?.snapshot) {
      const snap = normalizeMasterPlan(existingVer.snapshot);
      const isUnpinnedDraft = existingVer.status === 'draft' && !existingVer.isStarredBest;
      if (!(isUnpinnedDraft && isDraftStaleAgainstPpct(snap.title))) {
        const officialInteg = buildMasterPlanIntegrationsFromAddress(nextGrade, nextWeek, nextLessonNum, snap.title);
        const shouldRefreshInteg =
          !snap.integrations?.addressLabel ||
          !snap.integrations?.addressContent ||
          (isUnpinnedDraft && isPdfIntegratedGrade && snap.integrations.addressContent !== officialInteg.addressContent);
        if (shouldRefreshInteg) {
          snap.integrations = { ...officialInteg };
        }
        const cleanedSnapRows = stripFabricatedGameRows(snap.rows);
        const hydratedRows =
          hasActivityIntegrationMarkers(cleanedSnapRows) && !shouldRefreshInteg
            ? cleanedSnapRows
            : applyOfficialIntegrationsToLessonRows(cleanedSnapRows, nextGrade, nextWeek, nextLessonNum, snap.title);
        snap.rows = hydratedRows;
        setCurrentMasterPlan(snap);
        setTopic(snap.topic);
        setTitle(snap.title);
        setLessonRows(JSON.parse(JSON.stringify(hydratedRows)));
        showToast(
          `📂 Đã mở phiên bản chỉnh sửa gần nhất (#${existingVer.versionNumber}) cho Tuần ${nextWeek} · Khối ${nextGrade} · Tiết ${nextLessonNum}!`
        );
        return;
      }
    }

    const weekSpecific = allMasterPlans[`k${nextGrade}_t${nextLessonNum}_w${nextWeek}`];
    if (weekSpecific) {
      const snap = normalizeMasterPlan(weekSpecific);
      if (!isDraftStaleAgainstPpct(snap.title)) {
        const officialInteg = buildMasterPlanIntegrationsFromAddress(nextGrade, nextWeek, nextLessonNum, snap.title);
        if (!snap.integrations?.addressLabel || !snap.integrations?.addressContent) {
          snap.integrations = { ...officialInteg, ...(snap.integrations || {}), ...officialInteg };
        }
        const cleanedSnapRows = stripFabricatedGameRows(snap.rows);
        const hydratedRows = hasActivityIntegrationMarkers(cleanedSnapRows)
          ? cleanedSnapRows
          : applyOfficialIntegrationsToLessonRows(cleanedSnapRows, nextGrade, nextWeek, nextLessonNum, snap.title);
        snap.rows = hydratedRows;
        setCurrentMasterPlan(snap);
        setTopic(snap.topic);
        setTitle(snap.title);
        setLessonRows(JSON.parse(JSON.stringify(hydratedRows)));
        return;
      }
    }

    const isSecondPeriod = ppct.periods[1] === nextLessonNum;
    const nextTopic = ppctPeriod?.topic || (isSecondPeriod ? ppct.period2Topic : ppct.period1Topic) || ppct.defaultTopic;
    const nextTitle =
      ppctPeriod?.lessonTitle ||
      (isSecondPeriod ? ppct.period2Title : ppct.period1Title) ||
      `${ppct.defaultTitle} (${isSecondPeriod ? 'Tiết 2' : 'Tiết 1'})`;
    const freshRows = createBalancedGranularLessonRows(nextGrade, nextTitle, images, undefined, undefined, nextWeek, nextLessonNum);
    const officialInteg = buildMasterPlanIntegrationsFromAddress(nextGrade, nextWeek, nextLessonNum, nextTitle);
    setCurrentMasterPlan((prev) =>
      normalizeMasterPlan({
        ...prev,
        id: `plan_k${nextGrade}_t${nextLessonNum}_w${nextWeek}`,
        grade: nextGrade as GradeLevel,
        week: nextWeek,
        lessonNum: nextLessonNum,
        topic: nextTopic,
        title: nextTitle,
        integrations: officialInteg,
        rows: freshRows
      })
    );
    setTopic(nextTopic);
    setTitle(nextTitle);
    setLessonRows(freshRows);
  };

  // Debounced auto-save draft for Tab 5 edits (NEVER overwrites a different week/grade/lesson slot!)
  useEffect(() => {
    if (!isDbLoadedRef.current || isAccessLocked) return;
    if (!lessonRows || lessonRows.length === 0) return;

    const currentKey = getPlanVersionKey(week, grade, lessonNum);
    if (loadedPlanKeyRef.current !== currentKey) {
      // Context changed via direct state update without handleChangeGeneratorContext: check stored version first!
      loadedPlanKeyRef.current = currentKey;
      const existingVer = getPreferredVersionForPlan(planVersionStoreRef.current, week, grade, lessonNum);
      if (existingVer?.snapshot) {
        skipNextAutoDraftRef.current = true;
        const snap = normalizeMasterPlan(existingVer.snapshot);
        snap.rows = stripFabricatedGameRows(snap.rows);
        setCurrentMasterPlan(snap);
        setTopic(snap.topic);
        setTitle(snap.title);
        setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
        return;
      }
    }

    if (skipNextAutoDraftRef.current) {
      skipNextAutoDraftRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const sameContext =
        Number(currentMasterPlan.grade) === Number(grade) &&
        Number(currentMasterPlan.week) === Number(week);
      const resolvedIntegrations =
        sameContext && currentMasterPlan.integrations?.addressLabel && currentMasterPlan.integrations?.addressContent
          ? currentMasterPlan.integrations
          : buildMasterPlanIntegrationsFromAddress(grade, week, lessonNum, title);
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as GradeLevel,
        week,
        lessonNum,
        topic,
        title,
        integrations: resolvedIntegrations,
        rows: JSON.parse(JSON.stringify(lessonRows))
      });
      setCurrentMasterPlan(syncedPlan);
      handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    }, 350);

    return () => clearTimeout(timer);
  }, [lessonRows, week, grade, lessonNum, topic, title, isAccessLocked]);

  // Flush draft immediately when closing/reloading browser tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isDbLoadedRef.current || isAccessLocked || !lessonRows || lessonRows.length === 0) return;
      const currentKey = getPlanVersionKey(week, grade, lessonNum);
      if (loadedPlanKeyRef.current !== currentKey) return;
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as GradeLevel,
        week,
        lessonNum,
        topic,
        title,
        rows: lessonRows
      });
      const res = upsertDraftVersion(planVersionStoreRef.current, syncedPlan, 'tab-generator', null);
      if (res.changed) {
        savePlanVersionStoreDB(res.store).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [lessonRows, week, grade, lessonNum, topic, title, currentMasterPlan, isAccessLocked]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('active_week', week);
      setAppStateDB('active_grade', grade);
      setAppStateDB('active_lesson_num', lessonNum);
      setAppStateDB('active_topic', topic);
      setAppStateDB('active_title', title);
    }
  }, [week, grade, lessonNum, topic, title]);

  const handleTabChange = (nextTab: string) => {
    if (activeTab === 'tab-generator' && nextTab !== 'tab-generator' && lessonRows.length > 0) {
      const key = `k${grade}_t${lessonNum}`;
      const sameContext =
        Number(currentMasterPlan.grade) === Number(grade) &&
        Number(currentMasterPlan.week) === Number(week);
      const resolvedIntegrations =
        sameContext && currentMasterPlan.integrations?.addressLabel && currentMasterPlan.integrations?.addressContent
          ? currentMasterPlan.integrations
          : buildMasterPlanIntegrationsFromAddress(grade, week, lessonNum, title);
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_${key}_w${week}`,
        grade: grade as GradeLevel,
        week,
        lessonNum,
        topic,
        title,
        integrations: resolvedIntegrations,
        rows: JSON.parse(JSON.stringify(lessonRows))
      });
      setCurrentMasterPlan(syncedPlan);
      handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    }

    if (nextTab === 'tab-generator') {
      const latestVer = getPreferredVersionForPlan(planVersionStoreRef.current, week, grade, lessonNum);
      if (latestVer?.snapshot) {
        const snap = normalizeMasterPlan(latestVer.snapshot);
        const isUserEdited =
          latestVer.sourceTab === 'tab-generator' ||
          latestVer.sourceTab === 'tab-export' ||
          latestVer.status !== 'draft';
        const hydratedRows =
          isUserEdited || hasActivityIntegrationMarkers(snap.rows)
            ? snap.rows
            : applyOfficialIntegrationsToLessonRows(snap.rows, grade, week, lessonNum, snap.title);
        snap.rows = hydratedRows;
        skipNextAutoDraftRef.current = true;
        setCurrentMasterPlan(snap);
        setLessonRows(JSON.parse(JSON.stringify(hydratedRows)));
        setTitle(snap.title);
        setTopic(snap.topic);
      } else if (!hasActivityIntegrationMarkers(lessonRows)) {
        setLessonRows((prev) => applyOfficialIntegrationsToLessonRows(prev, grade, week, lessonNum, title));
      }
    }

    if (nextTab === 'tab-export') {
      setVersionRefreshNonce((n) => n + 1);
    }

    setActiveTab(nextTab);
  };

  const handleSwitchToExportFromGenerator = () => {
    const key = `k${grade}_t${lessonNum}`;
    const sameContext =
      Number(currentMasterPlan.grade) === Number(grade) &&
      Number(currentMasterPlan.week) === Number(week);
    const resolvedIntegrations =
      sameContext && currentMasterPlan.integrations?.addressLabel && currentMasterPlan.integrations?.addressContent
        ? currentMasterPlan.integrations
        : buildMasterPlanIntegrationsFromAddress(grade, week, lessonNum, title);
    const syncedPlan: MasterPlanItem = normalizeMasterPlan({
      ...currentMasterPlan,
      id: `plan_${key}_w${week}`,
      grade: grade as GradeLevel,
      week,
      lessonNum,
      topic,
      title,
      integrations: resolvedIntegrations,
      rows: JSON.parse(JSON.stringify(lessonRows))
    });
    setCurrentMasterPlan(syncedPlan);
    handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    setVersionRefreshNonce((n) => n + 1);
    setActiveTab('tab-export');
    showToast(
      isAccessLocked
        ? `Đang mở chế độ Xem trước A4 cho giáo án Tuần ${week} - Khối ${grade} (Tiết ${lessonNum})!`
        : `✅ Đã đồng bộ bản cuối từ Tab 5 sang Tab 6 (Tuần ${week} · Khối ${grade} · Tiết ${lessonNum})!`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3400);
  };

  const handleResetData = async () => {
    if (isAccessLocked) {
      requireAuth('Khôi phục dữ liệu gốc của hệ thống');
      return;
    }
    if (
      window.confirm(
        'Khôi phục toàn bộ Thư viện ảnh, Kịch bản và Kế hoạch bài dạy về dữ liệu gốc trong IndexedDB?'
      )
    ) {
      await clearImagesDB();
      await saveImagesDB(defaultSgkImages);
      await saveScenariosDB(defaultScenarios);
      await setAppStateDB('school_settings', defaultSchoolSettings);
      await setAppStateDB('master_plan', masterPlansTuan8.k1_t15);
      await setAppStateDB('current_lesson_rows', initialLessonsData.k1_t15.rows);

      setImages(defaultSgkImages);
      setScenarios(defaultScenarios);
      setSchoolSettings(defaultSchoolSettings);
      setCurrentMasterPlan(masterPlansTuan8.k1_t15);
      setLessonRows(initialLessonsData.k1_t15.rows);
      showToast('Đã khôi phục dữ liệu ban đầu trong IndexedDB thành công!');
    }
  };

  const handleImageExtracted = (newImg: SgkImageItem) => {
    // Save directly to IndexedDB and localStorage mirror
    saveImageDB(newImg).catch((err) => console.warn('Lỗi ghi IndexedDB:', err));

    setImages((prev) => {
      // Filter by ID only so subsequent crops are never silently dropped
      const filtered = prev.filter((im) => im.id !== newImg.id);
      return [newImg, ...filtered];
    });
    showToast(`✅ Đã quét và lưu thành công "${newImg.title}" vào Thư viện!`);
  };

  const handleOpenSelectCellModal = (img: SgkImageItem) => {
    if (isAccessLocked) {
      requireAuth('Gắn ảnh vào giáo án');
      return;
    }
    setImageToAttach(img);
    setIsSelectCellModalOpen(true);
  };

  const handleConfirmAttachImage = (rowIndex: number, column: 'content' | 'hs') => {
    if (!imageToAttach || !lessonRows[rowIndex]) return;

    setLessonRows((prev) => {
      const updated = [...prev];
      if (column === 'content') {
        updated[rowIndex] = {
          ...updated[rowIndex],
          contentImgUrl: imageToAttach.imgUrl,
          contentImgTitle: imageToAttach.title,
        };
      } else {
        updated[rowIndex] = {
          ...updated[rowIndex],
          hsImgUrl: imageToAttach.imgUrl,
          hsImgTitle: imageToAttach.title,
        };
      }
      return updated;
    });

    setActiveTab('tab-generator');
    showToast(
      `Đã chèn "${imageToAttach.title}" vào ${
        column === 'content' ? 'Cột Nội Dung' : 'Cột Hoạt Động HS'
      } thành công!`
    );
  };

  const getUniqueSavedMasterPlans = (): MasterPlanItem[] => {
    const seen = new Set<string>();
    const list: MasterPlanItem[] = [];
    Object.values(allMasterPlans).forEach((plan) => {
      if (!plan || !plan.id) return;
      const dedupeKey = `${plan.week}_${plan.grade}_${plan.lessonNum}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      list.push(plan);
    });
    return list;
  };

  const getMatchingMultiGradeGameTargets = (gameName: string) => {
    return findMatchingGameSlotsAcrossPlans(getUniqueSavedMasterPlans(), gameName, 'any');
  };

  const handleConfirmAttachImageForAllMatchingGrades = (gameName: string) => {
    if (!imageToAttach) return;
    const uniquePlans = getUniqueSavedMasterPlans();
    const { updatedPlans, matchedTargets } = applyGameImageToMatchingPlans(
      uniquePlans,
      imageToAttach.imgUrl,
      imageToAttach.title,
      gameName,
      { slotHint: 'any' }
    );

    if (matchedTargets.length > 0) {
      const planMapUpdate: Record<string, MasterPlanItem> = {};
      updatedPlans.forEach((p) => {
        const wasTouched = matchedTargets.some((t) => t.planId === p.id);
        if (!wasTouched) return;
        const wkKey = `k${p.grade}_t${p.lessonNum}_w${p.week}`;
        const genKey = `k${p.grade}_t${p.lessonNum}`;
        planMapUpdate[wkKey] = p;
        planMapUpdate[genKey] = p;
      });
      setAllMasterPlans((prev) => ({ ...prev, ...planMapUpdate }));
    }

    // Also update current open lessonRows in TabGenerator if any game row matches the same game name
    setLessonRows((prev) =>
      prev.map((row) => {
        const rowGame = extractGameNameFromRowText(row.content || '');
        if (!rowGame || !doGameNamesMatch(rowGame, gameName)) return row;
        const isCol1 = row.content.toLowerCase().includes('1.3.') || row.content.toLowerCase().includes('3.5.');
        if (isCol1) {
          const existing =
            row.contentImages && row.contentImages.length > 0
              ? [...row.contentImages]
              : row.contentImgUrl
              ? [{ id: 'content_img_1', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh trò chơi' }]
              : [];
          const nextList = existing.some((it) => it.url === imageToAttach.imgUrl)
            ? existing
            : [...existing, { id: `game_sync_${Date.now()}`, url: imageToAttach.imgUrl, title: imageToAttach.title }];
          return {
            ...row,
            contentImgUrl: nextList[0]?.url,
            contentImgTitle: nextList[0]?.title,
            contentImages: nextList
          };
        }
        return {
          ...row,
          hsImgUrl: imageToAttach.imgUrl,
          hsImgTitle: imageToAttach.title
        };
      })
    );

    const grades = Array.from(new Set(matchedTargets.map((t) => t.grade))).sort((a, b) => a - b);
    showToast(
      `🎮 Đã tự động chèn ảnh "${imageToAttach.title}" vào ${matchedTargets.length} tiết cùng trò chơi "${gameName}" (${grades
        .map((g) => `Khối ${g}`)
        .join(', ')})!`
    );
  };

  const handleOpenSmartClean = (img: SgkImageItem) => {
    if (isAccessLocked) {
      requireAuth('Tẩy rác & làm sạch ảnh bằng AI');
      return;
    }
    setCleanImageTarget(img);
    setIsSmartCleanOpen(true);
  };

  const handleSaveCleanedImage = (updatedImg: SgkImageItem) => {
    setImages((prev) => {
      const updated = prev.map((im) => (im.id === updatedImg.id ? updatedImg : im));
      saveImagesDB(updated).catch((err) => console.warn('Lỗi ghi IndexedDB:', err));
      return updated;
    });
    showToast(`Đã làm sạch và cập nhật ảnh "${updatedImg.title}" thành công!`);
  };

  // Gemini Vision AI Analysis
  const handleAnalyzeVision = async (img: SgkImageItem) => {
    if (isAccessLocked) {
      requireAuth('Phân tích động tác bằng Gemini Vision AI');
      return;
    }
    setIsAnalyzingVision(true);
    showToast('Gemini Vision AI đang đọc hình ảnh động tác SGK...');

    try {
      const res = await fetch('/api/ai/analyze-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: img.imgUrl,
          grade,
          lessonTitle: title,
          imageTitle: img.title,
          caption: img.caption,
          folder: img.folder,
          category: img.category,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setVisionImage(img);
        setVisionResult(data.analysis);
        setIsVisionModalOpen(true);
        showToast('✨ Gemini Vision đã nhận diện xong hình ảnh!');
      } else {
        throw new Error(data.error || 'Lỗi nhận diện');
      }
    } catch (err: any) {
      console.warn('Vision analysis fallback notice:', err);
      const capHead = (img.caption || '').split('•')[0] || '';
      const rawText = `${img.title || ''} ${capHead} ${img.folder || ''} ${img.category || ''} ${title || ''}`.toLowerCase();
      const isWarmupGeneral = img.folder === 'khoiDong' || img.category === 'khoi_dong';
      const isWarmupGame = img.folder === 'troChoiKhoiDong' || img.category === 'tro_choi_khoi_dong';
      const isPairPractice =
        rawText.includes('cặp đôi') ||
        rawText.includes('cap doi') ||
        rawText.includes('đối diện') ||
        rawText.includes('doi dien');
      const isPractice = img.folder === 'luyenTap' || img.category === 'tap_luyen' || isPairPractice;
      const isGame =
        !isWarmupGame &&
        (img.category === 'tro_choi' ||
          img.folder === 'troChoi' ||
          rawText.includes('trò chơi') ||
          rawText.includes('tiếp sức') ||
          rawText.includes('lò cò') ||
          rawText.includes('kéo co'));
      const isVanDung =
        img.category === 'van_dung' ||
        img.folder === 'vanDung' ||
        rawText.includes('vận dụng') ||
        rawText.includes('hồi tĩnh');

      let fallbackCategory: ImageCategory = img.category;
      const fallbackTargetCol: 'content' | 'hs' = 'content';
      let fallbackName = img.title || 'Động tác kỹ thuật SGK';
      let fallbackLvd = "5 - 7'";
      let fallbackGv =
        '- GV làm mẫu chuẩn xác 2-3 lần kết hợp phân tích kỹ thuật từng nhịp.\n- Cho HS quan sát hình ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai tư thế.';
      let fallbackHs =
        '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Quan sát mẫu của GV và thực hiện đồng loạt theo nhịp đếm.';

      if (isWarmupGeneral) {
        fallbackCategory = 'khoi_dong';
        fallbackLvd = "3 - 4'";
        fallbackGv =
          '- Tổ chức đội hình 4 hàng ngang giãn cách 1 sải tay, điều hành khởi động xoay kỹ các khớp cổ, vai, khuỷu tay, hông, gối, cổ tay cổ chân.';
        fallbackHs =
          '- Cả lớp đồng loạt khởi động tích cực theo nhịp đếm 2x8 nhịp của cán sự lớp.';
      } else if (isWarmupGame) {
        fallbackCategory = 'tro_choi_khoi_dong';
        fallbackLvd = "3 - 4'";
        fallbackGv =
          '- GV nêu tên trò chơi khởi động, hướng dẫn luật chơi ngắn gọn và cho HS chơi thử 1 lượt tạo không khí sôi nổi.';
        fallbackHs =
          '- Tham gia trò chơi bổ trợ khởi động hào hứng, chú ý an toàn theo hiệu lệnh GV.';
      } else if (isPractice) {
        fallbackCategory = 'tap_luyen';
        fallbackName = img.title || (isPairPractice ? 'Luyện tập cặp đôi sửa sai cho nhau' : 'Luyện tập theo tổ nhóm SGK');
        fallbackLvd = isPairPractice ? "3 - 5' (2 - 3 lượt đổi vai)" : "4 - 6' (2 - 3 lần)";
        fallbackGv =
          '- Chia lớp theo tổ nhóm / cặp đôi tại 4 khu vực sân tập.\n- Giao nhiệm vụ tự quản cho tổ trưởng điều hành và GV luân phiên quan sát, sửa sai.';
        fallbackHs =
          '- HS luyện tập tích cực theo nhóm/cặp đôi; quan sát giúp bạn điều chỉnh biên độ và nhịp động tác chuẩn xác.';
      } else if (isGame) {
        fallbackCategory = 'tro_choi';
        fallbackName = img.title || 'Trò chơi vận động rèn luyện phản xạ';
        fallbackLvd = "4 - 6' (2 - 3 lượt chơi)";
        fallbackGv =
          '- GV nêu tên trò chơi vận động, phổ biến luật chơi và các lỗi phạm quy cần tránh.\n- Cho 1 nhóm chơi thử 1 lượt, sau đó tổ chức thi đua hào hứng giữa các tổ.';
        fallbackHs =
          '- Đội hình theo các tổ đứng sau vạch xuất phát.\n- Tích cực thi đua đúng luật, đoàn kết và cổ vũ bạn.';
      } else if (isVanDung) {
        fallbackCategory = 'van_dung';
        fallbackName = img.title || 'Hoạt động vận dụng thực tế cuộc sống';
        fallbackLvd = "2 - 3'";
        fallbackGv =
          '- Nêu câu hỏi vận dụng gắn với nội dung bài học theo đúng SGK và gợi mở HS liên hệ thực hành ở nhà.\n- Nhắc nhở HS giữ gìn vệ sinh và thu dọn dụng cụ ngăn nắp.';
        fallbackHs =
          '- Quan sát tranh vận dụng SGK, trả lời câu hỏi và ghi nhớ thực hành cùng người thân tại nhà.';
      } else {
        fallbackCategory = 'dong_tac';
      }

      setVisionImage(img);
      setVisionResult({
        name: fallbackName,
        category: fallbackCategory,
        targetColumn: fallbackTargetCol,
        lvd: fallbackLvd,
        caption:
          img.caption ||
          'Hình thức tập luyện chuẩn mực chuyên môn GDTC theo chương trình GDPT 2018.',
        technicalCues: [
          'Giữ cự ly và thăng bằng cơ thể',
          'Biên độ tay chân mở rộng dứt khoát',
          'Hít thở đều đặn và phối hợp cùng bạn'
        ],
        commonErrors: ['Đứng quá gần hoặc nói chuyện', 'Chưa thẳng thân người'],
        gvScript: fallbackGv,
        hsScript: fallbackHs,
      });
      setIsVisionModalOpen(true);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const handleApplyVisionToLesson = (
    rowIndex: number,
    targetCol: 'content' | 'hs',
    movementName: string,
    lvdVal: string,
    gvScriptVal: string,
    hsScriptVal: string,
    imgItem: SgkImageItem
  ) => {
    setLessonRows((prev) => {
      const copy = [...prev];
      if (copy[rowIndex]) {
        let updatedContent = copy[rowIndex].content;
        if (targetCol === 'content') {
          // Chỉ thêm dòng động tác vào Cột Nội dung nếu là tranh phân thế kỹ thuật mới
          const firstLine = copy[rowIndex].content.split('\n')[0];
          if (!copy[rowIndex].content.includes(movementName)) {
            updatedContent = `${firstLine}\n- ${movementName}\n${copy[rowIndex].content.substring(firstLine.length).trim()}`;
          }
          copy[rowIndex].contentImgUrl = imgItem.imgUrl;
          copy[rowIndex].contentImgTitle = movementName;
        } else {
          // Nếu là Cột Hoạt động HS (Luyện tập cặp đôi, đồng loạt, tổ nhóm, trò chơi)
          copy[rowIndex].hsImgUrl = imgItem.imgUrl;
          copy[rowIndex].hsImgTitle = movementName;
        }

        copy[rowIndex] = {
          ...copy[rowIndex],
          content: updatedContent,
          lvd: lvdVal || copy[rowIndex].lvd,
          gv: gvScriptVal || copy[rowIndex].gv,
          hs: hsScriptVal || copy[rowIndex].hs,
        };
      }
      return copy;
    });

    setActiveTab('tab-generator');
    showToast(`Đã tự động điền kịch bản và chèn ảnh "${movementName}" vào đúng cột!`);
  };

  const handleSaveUserTemplate = (tpl: UserCustomTemplate, applyImmediately: boolean) => {
    setUserCustomTemplates((prev) => {
      const next = [tpl, ...prev.filter((t) => t.id !== tpl.id)];
      userCustomTemplatesRef.current = next;
      setAppStateDB('user_custom_templates', next).catch(() => {});
      return next;
    });
    setActiveCustomTemplateId(tpl.id);
    setAppStateDB('active_custom_template_id', tpl.id).catch(() => {});

    const mp = customTemplateToMasterPlan(tpl);
    if (tpl.teacherName || tpl.schoolName) {
      setSchoolSettings((prev) => ({
        ...prev,
        teacherName: tpl.teacherName || prev.teacherName,
        schoolName: tpl.schoolName || prev.schoolName
      }));
    }

    // Also store in version store for quick recall across Tab 5 & Tab 6
    const versionRes = commitOfficialVersion(planVersionStoreRef.current, mp, 'tab-generator', {
      customLabel: `Mẫu mới: ${tpl.name}`,
      forceNewVersion: true
    });
    planVersionStoreRef.current = versionRes.store;
    setPlanVersionStore(versionRes.store);
    savePlanVersionStoreDB(versionRes.store).catch(() => {});
    upsertMasterPlanInDictionary(mp);

    if (applyImmediately) {
      loadedPlanKeyRef.current = getPlanVersionKey(mp.week, mp.grade, mp.lessonNum);
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(mp);
      setWeek(mp.week);
      setGrade(mp.grade);
      setLessonNum(mp.lessonNum);
      setTopic(mp.topic);
      setTitle(mp.title);
      setLessonRows(JSON.parse(JSON.stringify(mp.rows)));
      setVersionRefreshNonce((n) => n + 1);
      setActiveTab('tab-extract');
      showToast(`✨ Đã lưu & hiển thị "${tpl.name}" với ${tpl.rows.length} hoạt động (Tab 3, Tab 5 & Tab 6)!`);
    } else {
      setVersionRefreshNonce((n) => n + 1);
      showToast(`✅ Đã lưu mẫu "${tpl.name}" vào bộ sưu tập Mẫu mới từ người dùng!`);
    }
  };

  const handleUpdateCustomTemplate = (updatedTpl: UserCustomTemplate) => {
    setUserCustomTemplates((prev) => {
      const next = prev.map((t) => (t.id === updatedTpl.id ? updatedTpl : t));
      userCustomTemplatesRef.current = next;
      setAppStateDB('user_custom_templates', next).catch(() => {});
      return next;
    });
    const mp = customTemplateToMasterPlan(updatedTpl);
    if (activeCustomTemplateId === updatedTpl.id) {
      setCurrentMasterPlan(mp);
    }
    upsertMasterPlanInDictionary(mp);
  };

  const handleDeleteCustomTemplate = (tplId: string) => {
    setUserCustomTemplates((prev) => {
      const next = prev.filter((t) => t.id !== tplId);
      userCustomTemplatesRef.current = next;
      setAppStateDB('user_custom_templates', next).catch(() => {});
      if (activeCustomTemplateId === tplId) {
        const nextActive = next[0]?.id || null;
        setActiveCustomTemplateId(nextActive);
        setAppStateDB('active_custom_template_id', nextActive).catch(() => {});
      }
      return next;
    });
    showToast('🗑️ Đã xóa mẫu giáo án khỏi danh sách Mẫu mới từ người dùng.');
  };

  const handleSelectCustomTemplate = (tpl: UserCustomTemplate) => {
    setActiveCustomTemplateId(tpl.id);
    setAppStateDB('active_custom_template_id', tpl.id).catch(() => {});
    const mp = customTemplateToMasterPlan(tpl);
    setCurrentMasterPlan(mp);
  };

  const handleApplyCustomTemplateToGenerator = (tpl: UserCustomTemplate) => {
    setActiveCustomTemplateId(tpl.id);
    setAppStateDB('active_custom_template_id', tpl.id).catch(() => {});
    const mp = customTemplateToMasterPlan(tpl);
    loadedPlanKeyRef.current = getPlanVersionKey(mp.week, mp.grade, mp.lessonNum);
    skipNextAutoDraftRef.current = true;
    setCurrentMasterPlan(mp);
    setWeek(mp.week);
    setGrade(mp.grade);
    setLessonNum(mp.lessonNum);
    setTopic(mp.topic);
    setTitle(mp.title);
    setLessonRows(JSON.parse(JSON.stringify(mp.rows)));
    setActiveTab('tab-generator');
    showToast(`✨ Đã nạp mẫu "${tpl.name}" vào Trình tạo giáo án!`);
  };

  const handleSaveAllExtractedToLibrary = (newScenarios: ScenarioItem[]) => {
    setScenarios((prev) => [...newScenarios, ...prev]);
  };

  const handleSaveSingleExtractedToLibrary = (scenario: ScenarioItem) => {
    setScenarios((prev) => [scenario, ...prev]);
  };

  const handleSaveScenario = (scenario: ScenarioItem) => {
    if (scenarioToEdit) {
      setScenarios((prev) => prev.map((s) => (s.id === scenario.id ? scenario : s)));
      showToast('Đã cập nhật kịch bản thành công!');
    } else {
      setScenarios((prev) => [scenario, ...prev]);
      showToast('Đã thêm kịch bản mới vào thư viện!');
    }
    setScenarioToEdit(null);
  };

  const handleInsertScenarioToLesson = (sc: ScenarioItem) => {
    setLessonRows((prev) => {
      const copy = [...prev];
      if (sc.category === 'Mở đầu' && copy[0]) {
        copy[0] = {
          ...copy[0],
          content: sc.content || copy[0].content,
          lvd: sc.lvd || copy[0].lvd,
          gv: sc.gv || copy[0].gv,
          hs: sc.hs || copy[0].hs,
        };
      } else if (sc.category === 'Động tác mới' && copy[1]) {
        copy[1] = {
          ...copy[1],
          content: sc.content || `2. HÌNH THÀNH KIẾN THỨC MỚI\n- ${sc.title}`,
          lvd: sc.lvd || copy[1].lvd,
          gv: sc.gv,
          hs: sc.hs,
        };
      } else if (sc.category === 'Luyện tập' && copy[2]) {
        copy[2] = {
          ...copy[2],
          content: sc.content || `3. HOẠT ĐỘNG LUYỆN TẬP\n- ${sc.title}`,
          lvd: sc.lvd || copy[2].lvd,
          gv: sc.gv,
          hs: sc.hs,
        };
      } else if (sc.category === 'Trò chơi' && copy[3]) {
        copy[3] = {
          ...copy[3],
          content: sc.content || `3.4 Trò chơi vận động: ${sc.title}`,
          lvd: sc.lvd || copy[3].lvd,
          gv: sc.gv,
          hs: sc.hs,
        };
      } else if ((sc.category === 'Hồi tĩnh' || sc.category === 'Vận dụng') && copy[4]) {
        copy[4] = {
          ...copy[4],
          content: sc.content || copy[4].content,
          lvd: sc.lvd || copy[4].lvd,
          gv: sc.gv,
          hs: sc.hs,
        };
      } else if (copy[0]) {
        copy[0] = {
          ...copy[0],
          content: sc.content || copy[0].content,
          gv: sc.gv,
          hs: sc.hs,
        };
      }
      return copy;
    });

    setActiveTab('tab-generator');
    showToast(`Đã chèn kịch bản "${sc.title}" vào kế hoạch bài dạy!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 left-3 right-3 md:left-auto md:right-5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md md:max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Vision Loading Overlay if active */}
      {isAnalyzingVision && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-2xl shadow-2xl border border-indigo-100 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <div>
              <p className="text-xs font-bold text-slate-900">Gemini Vision AI đang phân tích hình ảnh...</p>
              <p className="text-[11px] text-slate-500">Đang đọc tên động tác, góc thân người và soạn kịch bản sư phạm</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        imageCount={images.length}
        schoolSettings={schoolSettings}
        onOpenSettings={() =>
          isAccessLocked ? requireAuth('Cài đặt thông tin Trường & Giáo viên') : setIsSettingsOpen(true)
        }
        onResetData={handleResetData}
        onOpenImport={() =>
          isAccessLocked ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
        }
        onOpenGoogleDrive={() => {
          if (isAccessLocked) {
            requireAuth('Đồng bộ & lưu trữ giáo án lên Google Drive');
            return;
          }
          setGoogleDriveBundle(null);
          setIsGoogleDriveOpen(true);
        }}
        onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
        onOpenFormationStudio={() =>
          isAccessLocked ? requireAuth('Studio thiết kế & tự vẽ Sơ đồ đội hình') : setIsGlobalStudioOpen(true)
        }
        onOpenLovableStudio={() => setIsLovableStudioOpen(true)}
        onOpenFormationLibrary={() =>
          isAccessLocked ? requireAuth('Kho 32+ sơ đồ đội hình & chèn vào giáo án') : setIsGlobalFormationLibraryOpen(true)
        }
        onOpenPpctManager={() => {
          handleTabChange('tab-export');
          showToast('📊 Chuyển đến Xem trước & Rà soát Phân phối chương trình (PPCT) 5 khối!');
        }}
        currentWeek={week}
        onSelectCurrentWeek={() => {
          handleTabChange('tab-export');
          showToast(`✨ Đang xem Kế hoạch bài dạy Tuần ${week} (Tuần hiện hành)!`);
        }}
        authUser={authUser}
        isGuest={isAccessLocked}
        onOpenAuth={() => openAuthModal(isSubscriptionExpired ? 'billing' : 'login', null)}
        activeLayoutBlueprintName={activeLayoutBlueprint?.name || null}
        showToast={showToast}
      />

      {/* Guest Banner: 1-Semester (120-Day) Passwordless Full Free Community Access */}
      {isGuest && (
        <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-blue-50 border-b border-emerald-200 no-print">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-start sm:items-center gap-2 text-slate-700">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10.5px] shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-3 h-3" />
                Miễn Phí Trọn 1 Học Kỳ
              </span>
              <span className="leading-snug text-[11.5px] sm:text-xs">
                Đăng nhập tài khoản cá nhân <strong>(không cần mật khẩu)</strong> để mở khóa <strong>100% tính năng miễn phí 120 ngày</strong>: 308+ ảnh SGK (K1–K5), Studio Sơ đồ Pro &amp; Google Docs — chia sẻ vì cộng đồng giáo viên GDTC.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuthModal('login', null)}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-900 border-2 border-blue-600 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>Đăng Nhập Google</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register', null)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Dùng Email Cá Nhân</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gentle 7-Day Pre-Expiry Reminder Banner */}
      {isTrialExpiringSoon && authUser && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-blue-50 border-b border-amber-200 no-print">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-start sm:items-center gap-2 text-slate-800">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10.5px] shrink-0">
                <Clock className="w-3 h-3" />
                Còn {authUser.daysRemaining} ngày Full
              </span>
              <span className="leading-snug text-[11.5px] sm:text-xs">
                Giai đoạn trải nghiệm miễn phí trọn 1 học kỳ kết thúc ngày <strong>{formatVnDate(authUser.trialEndsAt)}</strong> · Cam kết <strong>không mất giáo án cũ</strong>. Thầy/cô có thể bấm <strong>Tham khảo tính năng</strong> hoặc nhập mã kích hoạt khi cần.
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('billing', null)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap shrink-0"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Tham Khảo Tính Năng</span>
            </button>
          </div>
        </div>
      )}

      {/* Expired Trial -> Friendly Basic Mode Banner */}
      {isSubscriptionExpired && authUser && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/70 to-orange-50 border-b border-amber-300 no-print">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-start sm:items-center gap-2 text-slate-800">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10.5px] shrink-0 mt-0.5 sm:mt-0">
                <Lock className="w-3 h-3" />
                Tính Năng Cơ Bản
              </span>
              <span className="leading-snug text-[11.5px] sm:text-xs">
                Đã kết thúc giai đoạn trải nghiệm miễn phí 1 học kỳ · Toàn bộ giáo án cũ vẫn giữ nguyên &amp; tiếp tục xem/tra cứu ở chế độ Tính năng cơ bản. Bấm <strong>Tham khảo tính năng</strong> hoặc nhập mã kích hoạt để mở Tính năng nâng cao.
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('billing', null)}
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition whitespace-nowrap shrink-0"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Tham Khảo Tính Năng</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10 flex flex-col">
        {activeTab === 'tab-scan' && (
          isAccessLocked ? (
            <LockedFeatureGate
              badgeText={isSubscriptionExpired ? 'Tính Năng Pro · Tab 1' : 'Tab 1 · Bóc Tách SGK'}
              title="Tab 1 · Quét & Bóc Tách Ảnh Từ SGK Điện Tử"
              description={
                isSubscriptionExpired
                  ? 'Giai đoạn trải nghiệm miễn phí 1 học kỳ đã kết thúc. Vui lòng nhập mã kích hoạt hoặc liên hệ tác giả để tiếp tục sử dụng tính năng quét SGK & phân tích Gemini Vision AI.'
                  : 'Đăng nhập 1 chạm bằng tài khoản cá nhân (không cần mật khẩu) để mở khóa miễn phí trọn 1 học kỳ toàn bộ tính năng quét SGK Khối 1–5, làm sạch nền AI và phân tích kỹ thuật Gemini Vision.'
              }
              highlights={[
                'Cắt vùng ảnh chuẩn nét cao từ từng trang SGK Khối 1, 2, 3, 4, 5',
                'Tự động phân tích tên động tác, nhịp đếm bằng Gemini Vision AI',
                'Làm sạch nền & khử nhiễu ảnh scan trước khi đưa vào giáo án',
                'Lưu trực tiếp vào Thư viện ảnh & gắn tự động vào đúng tiết học'
              ]}
              onRegister={() =>
                openAuthModal(isSubscriptionExpired ? 'billing' : 'register', 'Quét & Bóc Tách Ảnh SGK (Tab 1)')
              }
              onLogin={() =>
                openAuthModal(isSubscriptionExpired ? 'billing' : 'login', 'Quét & Bóc Tách Ảnh SGK (Tab 1)')
              }
              onFallbackTab={() => handleTabChange('tab-generator')}
            />
          ) : (
            <TabScan
              images={images}
              onImageExtracted={handleImageExtracted}
              onNavigateToGallery={() => handleTabChange('tab-img-library')}
              onAnalyzeVision={handleAnalyzeVision}
              onOpenSmartClean={handleOpenSmartClean}
              onOpenBatchUpload={() => {
                handleTabChange('tab-img-library');
              }}
              showToast={showToast}
              initialGrade={scanInitialGrade}
              initialPage={scanInitialPage}
            />
          )
        )}

        {activeTab === 'tab-img-library' && (
          <TabImageLibrary
            images={images}
            setImages={setImages}
            onOpenSelectCellModal={handleOpenSelectCellModal}
            onAnalyzeVision={handleAnalyzeVision}
            onOpenSmartClean={handleOpenSmartClean}
            onOpenCloudSync={() => setIsBackupRestoreOpen(true)}
            cloudSyncConnected={Boolean(cloudGoogleUser && cloudSessionConsented)}
            cloudSyncing={cloudSyncStatus.phase === 'syncing'}
            showToast={showToast}
            isGuest={isAccessLocked}
            onRequireAuth={(feature) => requireAuth(feature)}
          />
        )}

        {activeTab === 'tab-extract' && (
          isAccessLocked ? (
            <LockedFeatureGate
              badgeText={isSubscriptionExpired ? 'Tính Năng Pro · Tab 3' : 'Tab 3 · Sửa Giáo Án Mẫu'}
              title="Tab 3 · Giáo Án Mẫu & Chỉnh Sửa Trực Tiếp 4 Cột"
              description={
                isSubscriptionExpired
                  ? 'Giai đoạn trải nghiệm miễn phí 1 học kỳ đã kết thúc. Toàn bộ giáo án cũ của thầy/cô vẫn an toàn ở Tab 6. Vui lòng nhập mã kích hoạt hoặc liên hệ tác giả để mở lại chỉnh sửa trực tiếp 4 cột & nạp mẫu riêng.'
                  : 'Đăng nhập 1 chạm (không cần mật khẩu) để trải nghiệm miễn phí trọn 1 học kỳ không gian chỉnh sửa trực tiếp 4 cột chuẩn Công văn 5512 và nạp mẫu giáo án riêng.'
              }
              highlights={[
                'Sửa trực tiếp toàn bộ bảng 4 cột chuẩn 1:1 (Nội dung · LVĐ · GV · HS)',
                'Quản lý, chỉnh sửa và áp dụng bộ sưu tập Mẫu giáo án mới từ người dùng',
                'Đính kèm, thay thế ảnh động tác & sơ đồ đội hình ngay trên từng dòng',
                'Chuyển nhanh giáo án mẫu đã hoàn thiện sang Tuần mới (Tab 5)'
              ]}
              onRegister={() =>
                openAuthModal(isSubscriptionExpired ? 'billing' : 'register', 'Giáo Án Mẫu & Sửa Trực Tiếp (Tab 3)')
              }
              onLogin={() =>
                openAuthModal(isSubscriptionExpired ? 'billing' : 'login', 'Giáo Án Mẫu & Sửa Trực Tiếp (Tab 3)')
              }
              onFallbackTab={() => handleTabChange('tab-generator')}
            />
          ) : (
            <TabExtractSample
              currentMasterPlan={currentMasterPlan}
              setCurrentMasterPlan={setCurrentMasterPlan}
              userImages={images}
              userCustomTemplates={userCustomTemplates}
              activeCustomTemplateId={activeCustomTemplateId}
              onSelectCustomTemplate={handleSelectCustomTemplate}
              onUpdateCustomTemplate={handleUpdateCustomTemplate}
              onDeleteCustomTemplate={handleDeleteCustomTemplate}
              onOpenImport={() => setIsImportModalOpen(true)}
              onApplyMasterToGenerator={(plan) => {
                const targetWeek = plan.week + 1;
                const targetLesson = plan.lessonNum + 2;
                loadedPlanKeyRef.current = getPlanVersionKey(targetWeek, plan.grade, targetLesson);
                skipNextAutoDraftRef.current = true;
                setGrade(plan.grade);
                setLessonNum(targetLesson);
                setWeek(targetWeek);
                setTopic(plan.topic);
                setTitle(plan.title);
                setLessonRows(JSON.parse(JSON.stringify(plan.rows)));
                setActiveTab('tab-generator');
                showToast(`Đã chuyển giáo án mẫu sang Trình tạo bài giảng (Tuần ${targetWeek})!`);
              }}
              showToast={showToast}
            />
          )
        )}

        {activeTab === 'tab-library' && (
          <TabScenarioLibrary
            scenarios={scenarios}
            setScenarios={setScenarios}
            onOpenAddModal={() => {
              if (isAccessLocked) {
                requireAuth('Thêm kịch bản giảng dạy mới');
                return;
              }
              setScenarioToEdit(null);
              setIsScenarioModalOpen(true);
            }}
            onEditScenario={(sc) => {
              if (isAccessLocked) {
                requireAuth('Chỉnh sửa kịch bản giảng dạy');
                return;
              }
              setScenarioToEdit(sc);
              setIsScenarioModalOpen(true);
            }}
            onInsertToLesson={(sc) => {
              if (isAccessLocked) {
                requireAuth('Chèn kịch bản vào giáo án tuần này');
                return;
              }
              handleInsertScenarioToLesson(sc);
            }}
            showToast={showToast}
            isGuest={isAccessLocked}
            onRequireAuth={(feature) => requireAuth(feature)}
          />
        )}

        {activeTab === 'tab-generator' && (
          <TabGenerator
            week={week}
            setWeek={setWeek}
            grade={grade}
            setGrade={setGrade}
            lessonNum={lessonNum}
            setLessonNum={setLessonNum}
            topic={topic}
            setTopic={setTopic}
            title={title}
            setTitle={setTitle}
            lessonRows={lessonRows}
            setLessonRows={setLessonRows}
            scenarios={scenarios}
            images={images}
            currentMasterPlan={currentMasterPlan}
            onChangeLessonContext={handleChangeGeneratorContext}
            planVersionStore={planVersionStore}
            onSaveOfficialVersion={(plan, label, markAsBest, baseline, forceNew) => {
              if (isAccessLocked) {
                requireAuth('Lưu phiên bản giáo án mới');
                return;
              }
              return handleSaveOfficialVersion(plan, 'tab-generator', label, markAsBest, baseline, forceNew);
            }}
            onLoadPlanVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Tải phiên bản từ Lịch sử');
                return;
              }
              handleLoadPlanVersion(planKey, versionId);
            }}
            onToggleBestVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Đánh dấu phiên bản hoàn hảo nhất');
                return;
              }
              handleToggleBestVersion(planKey, versionId);
            }}
            onDeletePlanVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Xóa phiên bản trong Lịch sử');
                return;
              }
              handleDeletePlanVersion(planKey, versionId);
            }}
            onPruneOldVersions={handlePrunePlanVersions}
            userCustomTemplates={userCustomTemplates}
            activeCustomTemplateId={activeCustomTemplateId}
            onApplyCustomTemplate={(tpl) => {
              if (isAccessLocked) {
                requireAuth('Sử dụng mẫu giáo án mới từ người dùng');
                return;
              }
              handleApplyCustomTemplateToGenerator(tpl);
            }}
            onSwitchToExport={handleSwitchToExportFromGenerator}
            onSwitchToMasterTemplate={() => handleTabChange('tab-extract')}
            onNavigateToScan={handleNavigateToScanFromLesson}
            showToast={showToast}
            onOpenImport={() =>
              isAccessLocked ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            isGuest={isAccessLocked}
            onRequireAuth={(feature) => requireAuth(feature)}
          />
        )}

        {activeTab === 'tab-export' && (
          <TabExportPrint
            week={week}
            grade={grade}
            lessonNum={lessonNum}
            topic={topic}
            title={title}
            lessonRows={lessonRows}
            schoolSettings={schoolSettings}
            onUpdateSchoolSettings={(newSettings) => {
              if (isAccessLocked) return;
              setSchoolSettings(newSettings);
              setAppStateDB('school_settings', newSettings);
            }}
            currentMasterPlan={currentMasterPlan}
            allMasterPlans={allMasterPlans}
            onUpdateMasterPlanItem={handleUpdateSingleMasterPlan}
            planVersionStore={planVersionStore}
            versionRefreshNonce={versionRefreshNonce}
            onAutoSaveDraftPlans={(plans) => handleAutoSaveDraftPlans(plans, 'tab-export')}
            onSaveOfficialVersion={(plan, label, markAsBest, baseline, forceNew) => {
              if (isAccessLocked) {
                requireAuth('Lưu phiên bản giáo án mới');
                return;
              }
              return handleSaveOfficialVersion(plan, 'tab-export', label, markAsBest, baseline, forceNew);
            }}
            onSaveMultipleOfficialVersions={(plans) => {
              if (isAccessLocked) {
                requireAuth('Lưu bộ giáo án 5 khối vào Lịch sử & Cơ sở dữ liệu');
                return;
              }
              handleSaveMultipleOfficialVersions(plans, 'tab-export');
            }}
            onLoadPlanVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Tải phiên bản từ Lịch sử');
                return;
              }
              handleLoadPlanVersion(planKey, versionId);
            }}
            onToggleBestVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Đánh dấu phiên bản hoàn hảo nhất');
                return;
              }
              handleToggleBestVersion(planKey, versionId);
            }}
            onDeletePlanVersion={(planKey, versionId) => {
              if (isAccessLocked) {
                requireAuth('Xóa phiên bản trong Lịch sử');
                return;
              }
              handleDeletePlanVersion(planKey, versionId);
            }}
            onPruneOldVersions={handlePrunePlanVersions}
            onActiveWeekChange={(nw) => setWeek(nw)}
            userCustomTemplates={userCustomTemplates}
            activeCustomTemplateId={activeCustomTemplateId}
            onSelectCustomTemplate={(id) => {
              if (isAccessLocked) {
                requireAuth('Xem & sử dụng Mẫu giáo án mới từ người dùng');
                return;
              }
              setActiveCustomTemplateId(id);
              setAppStateDB('active_custom_template_id', id).catch(() => {});
            }}
            onUpdateUserCustomTemplate={(tpl) => {
              if (isAccessLocked) return;
              handleUpdateCustomTemplate(tpl);
            }}
            onOpenImportModal={() =>
              isAccessLocked ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            images={images}
            showToast={showToast}
            onUpdateMasterPlan={(updated) => {
              skipNextAutoDraftRef.current = true;
              setCurrentMasterPlan(updated);
              setLessonRows(JSON.parse(JSON.stringify(updated.rows)));
            }}
            onNavigateToLibrary={() => handleTabChange('tab-img-library')}
            onOpenGoogleDrive={(bundle) => {
              if (isAccessLocked) {
                requireAuth('Đồng bộ & lưu trữ giáo án lên Google Drive');
                return;
              }
              setGoogleDriveBundle(bundle || null);
              setIsGoogleDriveOpen(true);
            }}
            onNavigateToGenerator={() => handleTabChange('tab-generator')}
            isGuest={isAccessLocked}
            onRequireAuth={(feature) => requireAuth(feature)}
            activeLayoutBlueprint={activeLayoutBlueprint}
            onClearActiveLayoutBlueprint={() => handleActivateLayoutBlueprint(null)}
            onNavigateToTemplateLab={() => handleTabChange('tab-template-lab')}
            semesterBundleTrigger={semesterBundleTrigger}
          />
        )}

        {activeTab === 'tab-template-lab' && (
          <TabTemplateLab
            blueprints={layoutBlueprints}
            activeBlueprintId={activeLayoutBlueprintId}
            onSaveBlueprint={handleSaveLayoutBlueprint}
            onUpdateBlueprint={handleUpdateLayoutBlueprint}
            onDeleteBlueprint={handleDeleteLayoutBlueprint}
            onActivateBlueprint={handleActivateLayoutBlueprint}
            onSaveUserTemplate={handleSaveUserTemplate}
            onNavigateToExport={() => handleTabChange('tab-export')}
            currentMasterPlan={{
              ...currentMasterPlan,
              grade,
              week,
              lessonNum,
              topic,
              title,
              rows: lessonRows
            }}
            allMasterPlans={allMasterPlans}
            images={images}
            schoolSettings={schoolSettings}
            showToast={showToast}
          />
        )}

        {activeTab === 'tab-intro' && (
          <TabIntro
            onNavigateTab={handleTabChange}
            onOpenImport={() =>
              isAccessLocked ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            onOpenAuth={() => openAuthModal(isSubscriptionExpired ? 'billing' : 'login', null)}
            onOpenAuthMode={(mode) => openAuthModal(isSubscriptionExpired ? 'billing' : mode, null)}
            onOpenFormationStudio={() =>
              isAccessLocked ? requireAuth('Studio thiết kế & tự vẽ Sơ đồ đội hình') : setIsGlobalStudioOpen(true)
            }
            onOpenSettings={() =>
              isAccessLocked ? requireAuth('Cài đặt thông tin Trường & Giáo viên') : setIsSettingsOpen(true)
            }
            onOpenSemesterBundle={(targetGrade, targetScope) => {
              if (isAccessLocked) {
                requireAuth('Tải trọn bộ giáo án theo Khối, Học kỳ & Giáo án tích hợp năm học');
                return;
              }
              setGrade(targetGrade);
              setActiveTab('tab-export');
              setSemesterBundleTrigger({
                grade: targetGrade,
                scope: targetScope,
                nonce: Date.now(),
              });
            }}
            onOpenGradeTextbook={(targetGrade) => {
              handleNavigateToScanFromLesson(targetGrade);
            }}
            showToast={showToast}
            isGuest={isAccessLocked}
            liveStats={{
              imageCount: images.length,
              planCount: Object.keys(allMasterPlans || {}).length,
              savedVersionCount: Object.values(planVersionStore.versionsByPlanKey || {}).reduce(
                (sum, list) => sum + list.length,
                0
              )
            }}
          />
        )}

        {activeTab === 'tab-feedback' && (
          <TabFeedback
            authUser={authUser}
            defaultTeacherName={schoolSettings.teacherName}
            defaultSchoolName={schoolSettings.schoolName}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={schoolSettings}
        onSave={(newSettings) => {
          setSchoolSettings(newSettings);
          showToast('Đã lưu thông tin nhà trường và giáo viên!');
        }}
      />

      <SelectCellModal
        isOpen={isSelectCellModalOpen}
        onClose={() => {
          setIsSelectCellModalOpen(false);
          setImageToAttach(null);
        }}
        imageItem={imageToAttach}
        lessonRows={lessonRows}
        onConfirm={handleConfirmAttachImage}
        getMatchingMultiGradeTargets={getMatchingMultiGradeGameTargets}
        onConfirmAllMatchingGrades={handleConfirmAttachImageForAllMatchingGrades}
      />

      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => {
          setIsScenarioModalOpen(false);
          setScenarioToEdit(null);
        }}
        scenarioToEdit={scenarioToEdit}
        onSave={handleSaveScenario}
      />

      <VisionAnalysisModal
        isOpen={isVisionModalOpen}
        onClose={() => {
          setIsVisionModalOpen(false);
          setVisionImage(null);
          setVisionResult(null);
        }}
        imageItem={visionImage}
        analysis={visionResult}
        lessonRows={lessonRows}
        onApplyToLesson={handleApplyVisionToLesson}
      />

      <ImportLessonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSaveUserTemplate={handleSaveUserTemplate}
        showToast={showToast}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthGateReason(null);
        }}
        initialMode={authModalMode}
        gateReason={authGateReason}
        defaultSchoolName={schoolSettings.schoolName}
        defaultTeacherName={schoolSettings.teacherName}
        onAuthSuccess={async (mode) => {
          setAuthGateReason(null);
          hasPulledInitialWorkspaceRef.current = true;
          if (mode === 'register') {
            await pushWorkspace(buildWorkspaceSnapshot());
            showToast('☁️ Đã tạo tài khoản và sao lưu dữ liệu làm việc hiện tại lên tài khoản!');
          } else {
            const ws = await pullWorkspace();
            if (ws && (ws.planVersionStore || ws.userCustomTemplates?.length || ws.allMasterPlans)) {
              await mergeAndApplyServerWorkspace(ws);
              showToast('☁️ Đã đồng bộ các phiên bản giáo án & mẫu người dùng từ tài khoản!');
            } else {
              await pushWorkspace(buildWorkspaceSnapshot());
            }
          }
        }}
        onManualSyncUp={async () => {
          const ok = await pushWorkspace(buildWorkspaceSnapshot());
          if (ok) {
            showToast('☁️ Đã đồng bộ dữ liệu giáo án hiện tại lên máy chủ!');
          } else {
            showToast('⚠️ Chưa thể đồng bộ lên máy chủ, vui lòng thử lại.');
          }
        }}
        showToast={showToast}
      />

      <SmartCleanModal
        isOpen={isSmartCleanOpen}
        onClose={() => {
          setIsSmartCleanOpen(false);
          setCleanImageTarget(null);
        }}
        imageItem={cleanImageTarget}
        onSaveCleanedImage={handleSaveCleanedImage}
        onSaveAsNewImage={handleImageExtracted}
        showToast={showToast}
      />

      {/* Global Formation Studio Modal */}
      {isGlobalStudioOpen && (
        <FormationStudioModal
          isOpen={isGlobalStudioOpen}
          onClose={() => setIsGlobalStudioOpen(false)}
          targetRowIndex={2}
          libraryImages={images}
          grade={grade}
          onApplyFormationToRow={(rowIdx, customFormation) => {
            setLessonRows((prev) => {
              const updated = [...prev];
              if (updated[rowIdx]) {
                updated[rowIdx] = {
                  ...updated[rowIdx],
                  hsImgUrl: customFormation.svgDataUrl,
                  hsImgTitle: customFormation.name,
                  hsImages: [
                    ...(updated[rowIdx].hsImages || []),
                    {
                      id: `diag_${Date.now()}`,
                      url: customFormation.svgDataUrl,
                      title: customFormation.name,
                      userPinned: true
                    }
                  ],
                  userEditedMedia: true,
                  userClearedHsImages: false
                };
              }
              return updated;
            });
            saveCustomFormationToStorage(customFormation);
            setIsGlobalStudioOpen(false);
            setActiveTab('tab-generator');
            showToast(`✨ Đã gắn sơ đồ "${customFormation.name}" vào Cột 4 dòng số ${rowIdx + 1}!`);
          }}
          onSaveToLibrary={(customFormation) => {
            saveCustomFormationToStorage(customFormation);
            showToast(`💾 Đã lưu sơ đồ "${customFormation.name}" vào thư viện!`);
          }}
        />
      )}

      {/* Integrated Lovable Image Studio Modal */}
      <LovableImageStudioModal
        isOpen={isLovableStudioOpen}
        onClose={() => setIsLovableStudioOpen(false)}
        defaultGrade={String(grade)}
        images={images}
        onSaveToLibrary={(newImg) => {
          handleImageExtracted(newImg);
        }}
        onSaveAndAttachToLesson={(newImg) => {
          handleImageExtracted(newImg);
          handleOpenSelectCellModal(newImg);
        }}
        showToast={showToast}
      />

      {/* Global Formation Library Modal */}
      {isGlobalFormationLibraryOpen && (
        <SelectFormationModal
          isOpen={isGlobalFormationLibraryOpen}
          onClose={() => setIsGlobalFormationLibraryOpen(false)}
          targetRowIndex={2}
          grade={grade}
          libraryImages={images}
          onSelectFormation={(rowIdx, formation) => {
            setLessonRows((prev) => {
              const updated = [...prev];
              if (updated[rowIdx]) {
                updated[rowIdx] = {
                  ...updated[rowIdx],
                  hsImgUrl: formation.svgDataUrl,
                  hsImgTitle: formation.name,
                  hsImages: [
                    ...(updated[rowIdx].hsImages || []),
                    {
                      id: `diag_${Date.now()}`,
                      url: formation.svgDataUrl,
                      title: formation.name,
                      userPinned: true
                    }
                  ],
                  userEditedMedia: true,
                  userClearedHsImages: false
                };
              }
              return updated;
            });
            saveCustomFormationToStorage(formation);
            setIsGlobalFormationLibraryOpen(false);
            setActiveTab('tab-generator');
            showToast(`✨ Đã chèn sơ đồ "${formation.name}" vào Cột 4 dòng số ${rowIdx + 1}!`);
          }}
        />
      )}

      {/* Google Drive Integration Modal */}
      {isGoogleDriveOpen && (
        <GoogleDriveModal
          isOpen={isGoogleDriveOpen}
          onClose={() => {
            setIsGoogleDriveOpen(false);
            setGoogleDriveBundle(null);
          }}
          onOpenAutoSyncCenter={() => {
            setIsGoogleDriveOpen(false);
            setIsBackupRestoreOpen(true);
          }}
          totalLibraryImages={images.length}
          currentPlanData={{
            week: googleDriveBundle?.week ?? week,
            title: googleDriveBundle?.title ?? title,
            generateGoogleDocHtml: async () => {
              const targetPlans: MasterPlanItem[] =
                googleDriveBundle && googleDriveBundle.plans.length > 0
                  ? googleDriveBundle.plans
                  : [
                      {
                        ...currentMasterPlan,
                        grade,
                        week,
                        lessonNum,
                        topic,
                        title,
                        rows: lessonRows
                      }
                    ];
              const targetWeek = googleDriveBundle?.week ?? week;
              const pkg = await buildWordExportPackage({
                plans: targetPlans,
                scheduleRows: googleDriveBundle?.scheduleRows,
                settings: googleDriveBundle?.settings ?? schoolSettings,
                week: targetWeek,
                includeSchedule: Boolean(googleDriveBundle?.includeSchedule),
                approvalDate: googleDriveBundle?.approvalDate,
                dateRange: googleDriveBundle?.dateRange,
                format: 'docx',
                filename: `KHBD_GDTC_Tuan_${targetWeek}.docx`,
                layoutBlueprint: activeLayoutBlueprint || null
              });
              return pkg.html;
            },
            generateDocxBlob: async () => {
              const targetPlans: MasterPlanItem[] =
                googleDriveBundle && googleDriveBundle.plans.length > 0
                  ? googleDriveBundle.plans
                  : [
                      {
                        ...currentMasterPlan,
                        grade,
                        week,
                        lessonNum,
                        topic,
                        title,
                        rows: lessonRows
                      }
                    ];
              const targetWeek = googleDriveBundle?.week ?? week;
              const pkg = await buildWordExportPackage({
                plans: targetPlans,
                scheduleRows: googleDriveBundle?.scheduleRows,
                settings: googleDriveBundle?.settings ?? schoolSettings,
                week: targetWeek,
                includeSchedule: Boolean(googleDriveBundle?.includeSchedule),
                approvalDate: googleDriveBundle?.approvalDate,
                dateRange: googleDriveBundle?.dateRange,
                format: 'docx',
                filename: `KHBD_GDTC_Tuan_${targetWeek}.docx`,
                layoutBlueprint: activeLayoutBlueprint || null
              });
              return pkg.docxBlob;
            },
            generateJsonBlob: () => {
              const fullData = {
                week: googleDriveBundle?.week ?? week,
                grade,
                lessonNum,
                topic,
                title: googleDriveBundle?.title ?? title,
                schoolSettings: googleDriveBundle?.settings ?? schoolSettings,
                currentMasterPlan,
                lessonRows,
                mergedBundlePlans: googleDriveBundle?.plans,
                mergedBundleSchedule: googleDriveBundle?.scheduleRows,
                exportedAt: new Date().toISOString()
              };
              return new Blob([JSON.stringify(fullData, null, 2)], {
                type: 'application/json'
              });
            }
          }}
          onImportFileContent={async (file: File) => {
            try {
              const parsed = await parseLessonFile(file);
              if (parsed && parsed.rows && parsed.rows.length > 0) {
                if (parsed.week) setWeek(parsed.week);
                if (parsed.grade) setGrade(parsed.grade);
                if (parsed.topic) setTopic(parsed.topic);
                if (parsed.title) setTitle(parsed.title);
                setLessonRows(parsed.rows);
                showToast(`Đã nạp thành công giáo án "${file.name}" từ Google Drive!`);
                setActiveTab('tab-generator');
                setIsGoogleDriveOpen(false);
              } else {
                showToast(`Không thể đọc cấu trúc giáo án từ "${file.name}". Vui lòng kiểm tra lại định dạng.`);
              }
            } catch (err: any) {
              console.error(err);
              showToast(`Lỗi khi nạp file từ Drive: ${err?.message || err}`);
            }
          }}
        />
      )}

      {/* Backup and Restore Modal */}
      {isBackupRestoreOpen && (
        <BackupRestoreModal
          isOpen={isBackupRestoreOpen}
          onClose={() => setIsBackupRestoreOpen(false)}
          images={images}
          scenarios={scenarios}
          schoolSettings={schoolSettings}
          allMasterPlans={allMasterPlans}
          currentMasterPlan={currentMasterPlan}
          lessonRows={lessonRows}
          planVersionStore={planVersionStore}
          userCustomTemplates={userCustomTemplates}
          activeCustomTemplateId={activeCustomTemplateId}
          activeWeek={week}
          activeGrade={grade}
          activeLessonNum={lessonNum}
          activeTopic={topic}
          activeTitle={title}
          cloudGoogleUser={cloudGoogleUser}
          cloudAutoSyncEnabled={cloudAutoSyncEnabled}
          cloudSessionConsented={cloudSessionConsented}
          cloudSyncStatus={cloudSyncStatus}
          onRunCloudSync={(options) => runTwoWayCloudSync(options)}
          onToggleCloudAutoSync={handleToggleCloudAutoSync}
          onDisconnectCloudSync={handleDisconnectCloudSync}
          onRestoreSuccess={(data) => {
            if (data.images) setImages(data.images);
            if (data.scenarios) setScenarios(data.scenarios);
            if (data.schoolSettings) setSchoolSettings(data.schoolSettings);
            if (data.allMasterPlans) setAllMasterPlans(data.allMasterPlans);
            if (data.currentMasterPlan) setCurrentMasterPlan(data.currentMasterPlan);
            if (data.lessonRows) setLessonRows(data.lessonRows);
            if (data.planVersionStore) {
              planVersionStoreRef.current = data.planVersionStore;
              setPlanVersionStore(data.planVersionStore);
            }
            if (data.userCustomTemplates) {
              userCustomTemplatesRef.current = data.userCustomTemplates;
              setUserCustomTemplates(data.userCustomTemplates);
            }
            if (data.activeCustomTemplateId !== undefined) {
              setActiveCustomTemplateId(data.activeCustomTemplateId);
            }
            if (data.activeWeek) setWeek(data.activeWeek);
            if (data.activeGrade) setGrade(data.activeGrade);
            if (data.activeLessonNum) setLessonNum(data.activeLessonNum);
            if (data.activeTopic) setTopic(data.activeTopic);
            if (data.activeTitle) setTitle(data.activeTitle);
            setVersionRefreshNonce((n) => n + 1);
            setCustomFormationsNonce((n) => n + 1);
          }}
          onPruneOldVersions={handlePrunePlanVersions}
          showToast={showToast}
        />
      )}

      {/* Global quick uppercase/lowercase bar on text selection + Shift+F3 shortcut */}
      <GlobalFloatingTextCaseBar />
      <OfflineIndicator />
    </div>
  );
}
