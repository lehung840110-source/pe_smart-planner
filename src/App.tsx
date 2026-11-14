import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TabScan } from './components/TabScan';
import { TabImageLibrary } from './components/TabImageLibrary';
import { TabExtractSample } from './components/TabExtractSample';
import { TabScenarioLibrary } from './components/TabScenarioLibrary';
import { TabGenerator } from './components/TabGenerator';
import { TabExportPrint } from './components/TabExportPrint';
import { TabIntro } from './components/TabIntro';
import { SettingsModal } from './components/SettingsModal';
import { SelectCellModal } from './components/SelectCellModal';
import { ScenarioModal } from './components/ScenarioModal';
import { VisionAnalysisModal, VisionAnalysisResult } from './components/VisionAnalysisModal';
import { ImportLessonModal } from './components/ImportLessonModal';
import { SmartCleanModal } from './components/SmartCleanModal';
import { FormationStudioModal } from './components/FormationStudioModal';
import { SelectFormationModal } from './components/SelectFormationModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { AuthModal } from './components/AuthModal';
import { LockedFeatureGate } from './components/LockedFeatureGate';
import { FormationDiagram, saveCustomFormationToStorage, standardFormationDiagrams } from './data/formationDiagrams';
import { ParsedLessonFileResult, parseLessonFile, customTemplateToMasterPlan } from './utils/documentParser';
import { exportWordDocument } from './utils/exportUtils';
import { useAuth } from './contexts/AuthContext';
import {
  defaultSchoolSettings,
  defaultScenarios,
  defaultSgkImages,
  initialLessonsData,
} from './data/defaultData';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from './data/masterTemplateTuan8';
import { masterPlansTuan9 } from './data/masterTemplateTuan9';
import { SgkImageItem, ScenarioItem, SchoolSettings, LessonRow, ImageCategory, UserCustomTemplate } from './types/gdtc';
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
import { CheckCircle2, Loader2, Lock, UserPlus, LogIn } from 'lucide-react';
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
  deleteVersionFromStore
} from './utils/planVersionHistory';
import { getGradePpctInfo } from './utils/academicCalendar';
import { createBalancedGranularLessonRows } from './utils/planAutoMatcher';

export default function App() {
  const { user: authUser, isLoading: authLoading, pullWorkspace, pushWorkspace } = useAuth();
  const isGuest = !authLoading && !authUser;
  const [activeTab, setActiveTab] = useState<string>('tab-generator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [authGateReason, setAuthGateReason] = useState<string | null>(null);
  const [userCustomTemplates, setUserCustomTemplates] = useState<UserCustomTemplate[]>([]);
  const [activeCustomTemplateId, setActiveCustomTemplateId] = useState<string | null>(null);
  const userCustomTemplatesRef = useRef<UserCustomTemplate[]>([]);
  useEffect(() => {
    userCustomTemplatesRef.current = userCustomTemplates;
  }, [userCustomTemplates]);

  // IndexedDB-backed State
  const [images, setImages] = useState<SgkImageItem[]>(defaultSgkImages);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(defaultScenarios);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(defaultSchoolSettings);
  const [currentMasterPlan, setCurrentMasterPlan] = useState<MasterPlanItem>(masterPlansTuan8.k1_t15);
  // Synchronized All-Grades Master Plans Dictionary (K1, K3, K5 across weeks)
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
  const [lessonRows, setLessonRows] = useState<LessonRow[]>(initialLessonsData.k1_t15.rows);

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
  const [isGlobalFormationLibraryOpen, setIsGlobalFormationLibraryOpen] = useState<boolean>(false);

  // Google Drive Modal State
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);

  // Backup & Restore Modal State
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState<boolean>(false);

  // SGK Page Jump State
  const [scanInitialGrade, setScanInitialGrade] = useState<1 | 3 | 5 | undefined>(undefined);
  const [scanInitialPage, setScanInitialPage] = useState<number | undefined>(undefined);

  const handleNavigateToScanFromLesson = (targetGrade: 1 | 3 | 5, targetPage?: number) => {
    if (isGuest) {
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

  const openAuthModal = (mode: 'login' | 'register' = 'login', reason: string | null = null) => {
    setAuthGateReason(reason);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const requireAuth = (featureName: string, mode: 'login' | 'register' = 'register') => {
    openAuthModal(mode, featureName);
    showToast(`🔒 Đăng ký hoặc đăng nhập miễn phí để mở khóa: ${featureName}`);
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

  const buildWorkspaceSnapshot = () => ({
    version: 1,
    updatedAt: Date.now(),
    schoolSettings: schoolSettingsRef.current,
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
  }, [authUser?.id, planVersionStore, userCustomTemplates, schoolSettings, activeCustomTemplateId]);

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
    if (!isDbLoadedRef.current || !authUser || plansToSave.length === 0) return;
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
    setAllMasterPlans((prev) => ({ ...prev, ...dictUpdates }));
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
        grade: grade as 1 | 3 | 5,
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

    const existingVer = getPreferredVersionForPlan(
      planVersionStoreRef.current,
      nextWeek,
      nextGrade,
      nextLessonNum
    );
    if (existingVer?.snapshot) {
      const snap = normalizeMasterPlan(existingVer.snapshot);
      setCurrentMasterPlan(snap);
      setTopic(snap.topic);
      setTitle(snap.title);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      showToast(
        `📂 Đã mở phiên bản chỉnh sửa gần nhất (#${existingVer.versionNumber}) cho Tuần ${nextWeek} · Khối ${nextGrade} · Tiết ${nextLessonNum}!`
      );
      return;
    }

    const weekSpecific = allMasterPlans[`k${nextGrade}_t${nextLessonNum}_w${nextWeek}`];
    if (weekSpecific) {
      const snap = normalizeMasterPlan(weekSpecific);
      setCurrentMasterPlan(snap);
      setTopic(snap.topic);
      setTitle(snap.title);
      setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
      return;
    }

    const ppct = getGradePpctInfo(nextGrade as 1 | 3 | 5, nextWeek);
    const isSecondPeriod = ppct.periods[1] === nextLessonNum;
    const nextTitle = `${ppct.defaultTitle} (${isSecondPeriod ? 'Tiết 2' : 'Tiết 1'})`;
    const freshRows = createBalancedGranularLessonRows(nextGrade, nextTitle, images);
    setTopic(ppct.defaultTopic);
    setTitle(nextTitle);
    setLessonRows(freshRows);
  };

  // Debounced auto-save draft for Tab 5 edits (NEVER overwrites a different week/grade/lesson slot!)
  useEffect(() => {
    if (!isDbLoadedRef.current || !authUser) return;
    if (!lessonRows || lessonRows.length === 0) return;

    const currentKey = getPlanVersionKey(week, grade, lessonNum);
    if (loadedPlanKeyRef.current !== currentKey) {
      // Context changed via direct state update without handleChangeGeneratorContext: check stored version first!
      loadedPlanKeyRef.current = currentKey;
      const existingVer = getPreferredVersionForPlan(planVersionStoreRef.current, week, grade, lessonNum);
      if (existingVer?.snapshot) {
        skipNextAutoDraftRef.current = true;
        const snap = normalizeMasterPlan(existingVer.snapshot);
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
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as 1 | 3 | 5,
        week,
        lessonNum,
        topic,
        title,
        rows: JSON.parse(JSON.stringify(lessonRows))
      });
      setCurrentMasterPlan(syncedPlan);
      handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    }, 450);

    return () => clearTimeout(timer);
  }, [lessonRows, week, grade, lessonNum, topic, title, authUser]);

  // Flush draft immediately when closing/reloading browser tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isDbLoadedRef.current || !authUser || !lessonRows || lessonRows.length === 0) return;
      const currentKey = getPlanVersionKey(week, grade, lessonNum);
      if (loadedPlanKeyRef.current !== currentKey) return;
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_k${grade}_t${lessonNum}_w${week}`,
        grade: grade as 1 | 3 | 5,
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
  }, [lessonRows, week, grade, lessonNum, topic, title, currentMasterPlan, authUser]);

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
      const syncedPlan: MasterPlanItem = normalizeMasterPlan({
        ...currentMasterPlan,
        id: `plan_${key}_w${week}`,
        grade: grade as 1 | 3 | 5,
        week,
        lessonNum,
        topic,
        title,
        rows: JSON.parse(JSON.stringify(lessonRows))
      });
      handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    }

    if (nextTab === 'tab-generator') {
      const latestVer = getPreferredVersionForPlan(planVersionStoreRef.current, week, grade, lessonNum);
      if (latestVer?.snapshot) {
        const snap = normalizeMasterPlan(latestVer.snapshot);
        skipNextAutoDraftRef.current = true;
        setCurrentMasterPlan(snap);
        setLessonRows(JSON.parse(JSON.stringify(snap.rows)));
        setTitle(snap.title);
        setTopic(snap.topic);
      }
    }

    if (nextTab === 'tab-export') {
      setVersionRefreshNonce((n) => n + 1);
    }

    setActiveTab(nextTab);
  };

  const handleSwitchToExportFromGenerator = () => {
    const key = `k${grade}_t${lessonNum}`;
    const syncedPlan: MasterPlanItem = normalizeMasterPlan({
      ...currentMasterPlan,
      id: `plan_${key}_w${week}`,
      grade: grade as 1 | 3 | 5,
      week,
      lessonNum,
      topic,
      title,
      rows: JSON.parse(JSON.stringify(lessonRows))
    });
    setCurrentMasterPlan(syncedPlan);
    handleAutoSaveDraftPlans([syncedPlan], 'tab-generator');
    setVersionRefreshNonce((n) => n + 1);
    setActiveTab('tab-export');
    showToast(
      isGuest
        ? `Đang mở chế độ Xem trước A4 cho giáo án Tuần ${week} - Khối ${grade} (Tiết ${lessonNum})!`
        : `Đã lưu bản nháp và chuyển sang Xem trước & In cho giáo án Tuần ${week} - Khối ${grade} (Tiết ${lessonNum})!`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3400);
  };

  const handleResetData = async () => {
    if (isGuest) {
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
    if (isGuest) {
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

  const handleOpenSmartClean = (img: SgkImageItem) => {
    if (isGuest) {
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
    if (isGuest) {
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
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
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
          isGuest ? requireAuth('Cài đặt thông tin Trường & Giáo viên') : setIsSettingsOpen(true)
        }
        onResetData={handleResetData}
        onOpenImport={() =>
          isGuest ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
        }
        onOpenGoogleDrive={() =>
          isGuest ? requireAuth('Đồng bộ & lưu trữ giáo án lên Google Drive') : setIsGoogleDriveOpen(true)
        }
        onOpenBackupRestore={() =>
          isGuest ? requireAuth('Sao lưu & Khôi phục toàn bộ dữ liệu') : setIsBackupRestoreOpen(true)
        }
        onOpenFormationStudio={() =>
          isGuest ? requireAuth('Studio thiết kế & tự vẽ Sơ đồ đội hình') : setIsGlobalStudioOpen(true)
        }
        onOpenFormationLibrary={() =>
          isGuest ? requireAuth('Kho 32+ sơ đồ đội hình & chèn vào giáo án') : setIsGlobalFormationLibraryOpen(true)
        }
        onOpenPpctManager={() => {
          handleTabChange('tab-export');
          showToast('📊 Chuyển đến Xem trước & Rà soát Phân phối chương trình (PPCT) 3 khối!');
        }}
        currentWeek={week}
        onSelectCurrentWeek={() => {
          handleTabChange('tab-export');
          showToast(`✨ Đang xem Kế hoạch bài dạy Tuần ${week} (Tuần hiện hành)!`);
        }}
        authUser={authUser}
        isGuest={isGuest}
        onOpenAuth={() => openAuthModal('login', null)}
      />

      {/* Guest Basic Access Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border-b border-amber-200 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[11px] shrink-0">
                <Lock className="w-3 h-3" />
                Chế Độ Khách (Cơ Bản)
              </span>
              <span className="leading-snug">
                Bạn đang dùng thử các tính năng xem &amp; sinh mẫu cơ bản. <strong>Đăng ký / Đăng nhập</strong> tài khoản miễn phí để mở khóa 100% tính năng (Quét SGK, Sửa trực tiếp, Lưu phiên bản, Nạp file, Studio Sơ đồ &amp; Xuất Word/PDF).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openAuthModal('register', null)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng Ký Miễn Phí</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('login', null)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {activeTab === 'tab-scan' && (
          isGuest ? (
            <LockedFeatureGate
              badgeText="Tab 1 · Bóc Tách SGK"
              title="Tab 1 · Quét & Bóc Tách Ảnh Từ SGK Điện Tử"
              description="Trích xuất ảnh động tác và trò chơi trực tiếp từ sách giáo khoa GDTC Kết nối tri thức (Khối 1, 3, 5), làm sạch nền AI và phân tích kỹ thuật bằng Gemini Vision dành riêng cho thành viên."
              highlights={[
                'Cắt vùng ảnh chuẩn nét cao từ từng trang SGK Khối 1, 3, 5',
                'Tự động phân tích tên động tác, nhịp đếm bằng Gemini Vision AI',
                'Làm sạch nền & khử nhiễu ảnh scan trước khi đưa vào giáo án',
                'Lưu trực tiếp vào Thư viện ảnh & gắn tự động vào đúng tiết học'
              ]}
              onRegister={() => openAuthModal('register', 'Quét & Bóc Tách Ảnh SGK (Tab 1)')}
              onLogin={() => openAuthModal('login', 'Quét & Bóc Tách Ảnh SGK (Tab 1)')}
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
            showToast={showToast}
            isGuest={isGuest}
            onRequireAuth={(feature) => requireAuth(feature)}
          />
        )}

        {activeTab === 'tab-extract' && (
          isGuest ? (
            <LockedFeatureGate
              badgeText="Tab 3 · Sửa Giáo Án Mẫu"
              title="Tab 3 · Giáo Án Mẫu & Chỉnh Sửa Trực Tiếp 4 Cột"
              description="Không gian làm việc chuyên sâu để giáo viên chỉnh sửa từng dòng hoạt động chuẩn Công văn 5512, quản lý các mẫu giáo án mới do bạn nạp lên và chuyển đổi nhanh sang tuần kế tiếp."
              highlights={[
                'Sửa trực tiếp toàn bộ bảng 4 cột chuẩn 1:1 (Nội dung · LVĐ · GV · HS)',
                'Quản lý, chỉnh sửa và áp dụng bộ sưu tập Mẫu giáo án mới từ người dùng',
                'Đính kèm, thay thế ảnh động tác & sơ đồ đội hình ngay trên từng dòng',
                'Chuyển nhanh giáo án mẫu đã hoàn thiện sang Tuần mới (Tab 5)'
              ]}
              onRegister={() => openAuthModal('register', 'Giáo Án Mẫu & Sửa Trực Tiếp (Tab 3)')}
              onLogin={() => openAuthModal('login', 'Giáo Án Mẫu & Sửa Trực Tiếp (Tab 3)')}
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
              if (isGuest) {
                requireAuth('Thêm kịch bản giảng dạy mới');
                return;
              }
              setScenarioToEdit(null);
              setIsScenarioModalOpen(true);
            }}
            onEditScenario={(sc) => {
              if (isGuest) {
                requireAuth('Chỉnh sửa kịch bản giảng dạy');
                return;
              }
              setScenarioToEdit(sc);
              setIsScenarioModalOpen(true);
            }}
            onInsertToLesson={(sc) => {
              if (isGuest) {
                requireAuth('Chèn kịch bản vào giáo án tuần này');
                return;
              }
              handleInsertScenarioToLesson(sc);
            }}
            showToast={showToast}
            isGuest={isGuest}
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
              if (isGuest) {
                requireAuth('Lưu phiên bản giáo án mới');
                return;
              }
              return handleSaveOfficialVersion(plan, 'tab-generator', label, markAsBest, baseline, forceNew);
            }}
            onLoadPlanVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Tải phiên bản từ Lịch sử');
                return;
              }
              handleLoadPlanVersion(planKey, versionId);
            }}
            onToggleBestVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Đánh dấu phiên bản hoàn hảo nhất');
                return;
              }
              handleToggleBestVersion(planKey, versionId);
            }}
            onDeletePlanVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Xóa phiên bản trong Lịch sử');
                return;
              }
              handleDeletePlanVersion(planKey, versionId);
            }}
            userCustomTemplates={userCustomTemplates}
            activeCustomTemplateId={activeCustomTemplateId}
            onApplyCustomTemplate={(tpl) => {
              if (isGuest) {
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
              isGuest ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            isGuest={isGuest}
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
              if (isGuest) return;
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
              if (isGuest) {
                requireAuth('Lưu phiên bản giáo án mới');
                return;
              }
              return handleSaveOfficialVersion(plan, 'tab-export', label, markAsBest, baseline, forceNew);
            }}
            onSaveMultipleOfficialVersions={(plans) => {
              if (isGuest) {
                requireAuth('Lưu bộ giáo án 3 khối vào Lịch sử & Cơ sở dữ liệu');
                return;
              }
              handleSaveMultipleOfficialVersions(plans, 'tab-export');
            }}
            onLoadPlanVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Tải phiên bản từ Lịch sử');
                return;
              }
              handleLoadPlanVersion(planKey, versionId);
            }}
            onToggleBestVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Đánh dấu phiên bản hoàn hảo nhất');
                return;
              }
              handleToggleBestVersion(planKey, versionId);
            }}
            onDeletePlanVersion={(planKey, versionId) => {
              if (isGuest) {
                requireAuth('Xóa phiên bản trong Lịch sử');
                return;
              }
              handleDeletePlanVersion(planKey, versionId);
            }}
            onActiveWeekChange={(nw) => setWeek(nw)}
            userCustomTemplates={userCustomTemplates}
            activeCustomTemplateId={activeCustomTemplateId}
            onSelectCustomTemplate={(id) => {
              if (isGuest) {
                requireAuth('Xem & sử dụng Mẫu giáo án mới từ người dùng');
                return;
              }
              setActiveCustomTemplateId(id);
              setAppStateDB('active_custom_template_id', id).catch(() => {});
            }}
            onUpdateUserCustomTemplate={(tpl) => {
              if (isGuest) return;
              handleUpdateCustomTemplate(tpl);
            }}
            onOpenImportModal={() =>
              isGuest ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            images={images}
            showToast={showToast}
            onUpdateMasterPlan={(updated) => {
              skipNextAutoDraftRef.current = true;
              setCurrentMasterPlan(updated);
              setLessonRows(JSON.parse(JSON.stringify(updated.rows)));
            }}
            onNavigateToLibrary={() => handleTabChange('tab-img-library')}
            onOpenGoogleDrive={() =>
              isGuest ? requireAuth('Đồng bộ & lưu trữ giáo án lên Google Drive') : setIsGoogleDriveOpen(true)
            }
            onNavigateToGenerator={() => handleTabChange('tab-generator')}
            isGuest={isGuest}
            onRequireAuth={(feature) => requireAuth(feature)}
          />
        )}

        {activeTab === 'tab-intro' && (
          <TabIntro
            onNavigateTab={handleTabChange}
            onOpenImport={() =>
              isGuest ? requireAuth('Nạp & phân tích đa nhiệm file Giáo án mới') : setIsImportModalOpen(true)
            }
            onOpenAuth={() => openAuthModal('login', null)}
            onOpenAuthMode={(mode) => openAuthModal(mode, null)}
            onOpenFormationStudio={() =>
              isGuest ? requireAuth('Studio thiết kế & tự vẽ Sơ đồ đội hình') : setIsGlobalStudioOpen(true)
            }
            onOpenSettings={() =>
              isGuest ? requireAuth('Cài đặt thông tin Trường & Giáo viên') : setIsSettingsOpen(true)
            }
            isGuest={isGuest}
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
                  hsImgTitle: customFormation.name
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
                  hsImgTitle: formation.name
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
          onClose={() => setIsGoogleDriveOpen(false)}
          currentPlanData={{
            week,
            title,
            generateDocxBlob: async () => {
              // Generate standard docx or doc blob for the current plan
              return new Blob([`Kế hoạch bài dạy Tuần ${week}: ${title}`], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              });
            },
            generateJsonBlob: () => {
              const fullData = {
                week,
                grade,
                lessonNum,
                topic,
                title,
                schoolSettings,
                currentMasterPlan,
                lessonRows,
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
          activeWeek={week}
          activeGrade={grade}
          activeLessonNum={lessonNum}
          activeTopic={topic}
          activeTitle={title}
          onRestoreSuccess={(data) => {
            if (data.images) setImages(data.images);
            if (data.scenarios) setScenarios(data.scenarios);
            if (data.schoolSettings) setSchoolSettings(data.schoolSettings);
            if (data.allMasterPlans) setAllMasterPlans(data.allMasterPlans);
            if (data.currentMasterPlan) setCurrentMasterPlan(data.currentMasterPlan);
            if (data.lessonRows) setLessonRows(data.lessonRows);
            if (data.activeWeek) setWeek(data.activeWeek);
            if (data.activeGrade) setGrade(data.activeGrade);
            if (data.activeLessonNum) setLessonNum(data.activeLessonNum);
            if (data.activeTopic) setTopic(data.activeTopic);
            if (data.activeTitle) setTitle(data.activeTitle);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
