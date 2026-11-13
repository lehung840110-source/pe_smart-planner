import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TabScan } from './components/TabScan';
import { TabImageLibrary } from './components/TabImageLibrary';
import { TabExtractSample } from './components/TabExtractSample';
import { TabScenarioLibrary } from './components/TabScenarioLibrary';
import { TabGenerator } from './components/TabGenerator';
import { TabExportPrint } from './components/TabExportPrint';
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
import { FormationDiagram, saveCustomFormationToStorage, standardFormationDiagrams } from './data/formationDiagrams';
import { ParsedLessonFileResult, parseLessonFile } from './utils/documentParser';
import { exportWordDocument } from './utils/exportUtils';
import {
  defaultSchoolSettings,
  defaultScenarios,
  defaultSgkImages,
  initialLessonsData,
} from './data/defaultData';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from './data/masterTemplateTuan8';
import { masterPlansTuan9 } from './data/masterTemplateTuan9';
import { SgkImageItem, ScenarioItem, SchoolSettings, LessonRow, ImageCategory } from './types/gdtc';
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
import { CheckCircle2, Loader2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('tab-generator');

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
    setScanInitialGrade(targetGrade);
    setScanInitialPage(targetPage);
    setActiveTab('tab-scan');
    showToast(`📖 Đang mở SGK Lớp ${targetGrade}${targetPage ? ` (Trang ${targetPage})` : ''} để bóc tách...`);
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDbLoadedRef = useRef<boolean>(false);

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
    if (!isDbLoadedRef.current || plansToSave.length === 0) return;
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
    baselinePlan?: MasterPlanItem | null
  ): LessonPlanVersion => {
    const res = commitOfficialVersion(planVersionStoreRef.current, plan, sourceTab, {
      customLabel,
      markAsBest,
      baselinePlan,
      forceNewVersion: Boolean(customLabel)
    });
    planVersionStoreRef.current = res.store;
    setPlanVersionStore(res.store);
    savePlanVersionStoreDB(res.store).catch(() => {});
    upsertMasterPlanInDictionary(res.savedVersion.snapshot);
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
      const res = commitOfficialVersion(nextStore, p, sourceTab);
      nextStore = res.store;
      const snap = res.savedVersion.snapshot;
      dictUpdates[`k${snap.grade}_t${snap.lessonNum}`] = snap;
      dictUpdates[`k${snap.grade}_t${snap.lessonNum}_w${snap.week}`] = snap;
    });
    planVersionStoreRef.current = nextStore;
    setPlanVersionStore(nextStore);
    savePlanVersionStoreDB(nextStore).catch(() => {});
    setAllMasterPlans((prev) => ({ ...prev, ...dictUpdates }));

    // If current Tab 5 lesson is among these plans, keep it synced silently without wiping Tab 6
    const matchingTab5 = plans.find(
      (p) => p.grade === grade && p.lessonNum === lessonNum && p.week === week
    );
    if (matchingTab5) {
      skipNextAutoDraftRef.current = true;
      setCurrentMasterPlan(normalizeMasterPlan(matchingTab5));
      setLessonRows(JSON.parse(JSON.stringify(matchingTab5.rows)));
      setTitle(matchingTab5.title);
      setTopic(matchingTab5.topic);
    }
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
    if (!isDbLoadedRef.current) return;
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
  }, [lessonRows, week, grade, lessonNum, topic, title]);

  // Flush draft immediately when closing/reloading browser tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isDbLoadedRef.current || !lessonRows || lessonRows.length === 0) return;
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
  }, [lessonRows, week, grade, lessonNum, topic, title, currentMasterPlan]);

  useEffect(() => {
    if (isDbLoadedRef.current) {
      setAppStateDB('active_week', week);
      setAppStateDB('active_grade', grade);
      setAppStateDB('active_lesson_num', lessonNum);
      setAppStateDB('active_topic', topic);
      setAppStateDB('active_title', title);
    }
  }, [week, grade, lessonNum, topic, title]);

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
    showToast(`Đã lưu bản nháp và chuyển sang Xem trước & In cho giáo án Tuần ${week} - Khối ${grade} (Tiết ${lessonNum})!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3400);
  };

  const handleResetData = async () => {
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
  // Gemini Vision AI Analysis
  const handleAnalyzeVision = async (img: SgkImageItem) => {
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

  const handleLessonImported = (result: ParsedLessonFileResult) => {
    if (result.title) setTitle(result.title);
    if (result.topic) setTopic(result.topic);
    if (result.week) setWeek(result.week);
    if (result.grade) setGrade(result.grade);
    if (result.lessonNum) setLessonNum(result.lessonNum);
    if (result.rows && result.rows.length > 0) {
      setLessonRows(result.rows);
    }
    if (result.teacherName || result.schoolName) {
      setSchoolSettings((prev) => ({
        ...prev,
        teacherName: result.teacherName || prev.teacherName,
        schoolName: result.schoolName || prev.schoolName,
      }));
    }
    setActiveTab('tab-generator');
    showToast(`Đã nạp thành công giáo án "${result.title || 'Mới'}" với ${result.rows.length} hoạt động!`);
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
        setActiveTab={setActiveTab}
        imageCount={images.length}
        schoolSettings={schoolSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
        onOpenFormationStudio={() => setIsGlobalStudioOpen(true)}
        onOpenFormationLibrary={() => setIsGlobalFormationLibraryOpen(true)}
        onOpenPpctManager={() => {
          setActiveTab('tab-export');
          showToast('📊 Chuyển đến Xem trước & Rà soát Phân phối chương trình (PPCT) 3 khối!');
        }}
        currentWeek={week}
        onSelectCurrentWeek={() => {
          setActiveTab('tab-export');
          showToast(`✨ Đang xem Kế hoạch bài dạy Tuần ${week} (Tuần hiện hành)!`);
        }}
      />

      {/* Main Body View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {activeTab === 'tab-scan' && (
          <TabScan
            images={images}
            onImageExtracted={handleImageExtracted}
            onNavigateToGallery={() => setActiveTab('tab-img-library')}
            onAnalyzeVision={handleAnalyzeVision}
            onOpenSmartClean={handleOpenSmartClean}
            onOpenBatchUpload={() => {
              setActiveTab('tab-img-library');
            }}
            initialGrade={scanInitialGrade}
            initialPage={scanInitialPage}
          />
        )}

        {activeTab === 'tab-img-library' && (
          <TabImageLibrary
            images={images}
            setImages={setImages}
            onOpenSelectCellModal={handleOpenSelectCellModal}
            onAnalyzeVision={handleAnalyzeVision}
            onOpenSmartClean={handleOpenSmartClean}
            showToast={showToast}
          />
        )}

        {activeTab === 'tab-extract' && (
          <TabExtractSample
            currentMasterPlan={currentMasterPlan}
            setCurrentMasterPlan={setCurrentMasterPlan}
            userImages={images}
            onApplyMasterToGenerator={(plan) => {
              setGrade(plan.grade);
              setLessonNum(plan.lessonNum + 2);
              setWeek(plan.week + 1);
              setTopic(plan.topic);
              setTitle(plan.title);
              setLessonRows(JSON.parse(JSON.stringify(plan.rows)));
              setActiveTab('tab-generator');
              showToast(`Đã chuyển giáo án mẫu sang Trình tạo bài giảng (Tuần ${plan.week + 1})!`);
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'tab-library' && (
          <TabScenarioLibrary
            scenarios={scenarios}
            setScenarios={setScenarios}
            onOpenAddModal={() => {
              setScenarioToEdit(null);
              setIsScenarioModalOpen(true);
            }}
            onEditScenario={(sc) => {
              setScenarioToEdit(sc);
              setIsScenarioModalOpen(true);
            }}
            onInsertToLesson={handleInsertScenarioToLesson}
            showToast={showToast}
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
            onSaveOfficialVersion={(plan, label, markAsBest, baseline) =>
              handleSaveOfficialVersion(plan, 'tab-generator', label, markAsBest, baseline)
            }
            onLoadPlanVersion={handleLoadPlanVersion}
            onToggleBestVersion={handleToggleBestVersion}
            onDeletePlanVersion={handleDeletePlanVersion}
            onSwitchToExport={handleSwitchToExportFromGenerator}
            onSwitchToMasterTemplate={() => setActiveTab('tab-extract')}
            onNavigateToScan={handleNavigateToScanFromLesson}
            showToast={showToast}
            onOpenImport={() => setIsImportModalOpen(true)}
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
              setSchoolSettings(newSettings);
              setAppStateDB('school_settings', newSettings);
            }}
            currentMasterPlan={currentMasterPlan}
            allMasterPlans={allMasterPlans}
            onUpdateMasterPlanItem={handleUpdateSingleMasterPlan}
            planVersionStore={planVersionStore}
            versionRefreshNonce={versionRefreshNonce}
            onAutoSaveDraftPlans={(plans) => handleAutoSaveDraftPlans(plans, 'tab-export')}
            onSaveOfficialVersion={(plan, label, markAsBest, baseline) =>
              handleSaveOfficialVersion(plan, 'tab-export', label, markAsBest, baseline)
            }
            onSaveMultipleOfficialVersions={(plans) =>
              handleSaveMultipleOfficialVersions(plans, 'tab-export')
            }
            onLoadPlanVersion={handleLoadPlanVersion}
            onToggleBestVersion={handleToggleBestVersion}
            onDeletePlanVersion={handleDeletePlanVersion}
            images={images}
            showToast={showToast}
            onUpdateMasterPlan={(updated) => {
              skipNextAutoDraftRef.current = true;
              setCurrentMasterPlan(updated);
              setLessonRows(JSON.parse(JSON.stringify(updated.rows)));
            }}
            onNavigateToLibrary={() => setActiveTab('tab-img-library')}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
            onNavigateToGenerator={() => setActiveTab('tab-generator')}
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
        onLessonImported={handleLessonImported}
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
