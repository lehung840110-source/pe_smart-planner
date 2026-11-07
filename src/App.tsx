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
import { FormationDiagram, saveCustomFormationToStorage } from './data/formationDiagrams';
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
import { SgkImageItem, ScenarioItem, SchoolSettings, LessonRow } from './types/gdtc';
import {
  getAllImagesDB,
  saveImagesDB,
  getAllScenariosDB,
  saveScenariosDB,
  getAppStateDB,
  setAppStateDB,
  clearImagesDB,
} from './utils/db';
import { CheckCircle2, Loader2 } from 'lucide-react';

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

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDbLoadedRef = useRef<boolean>(false);

  // 1. Initial Load from IndexedDB (with legacy localStorage migration)
  useEffect(() => {
    async function loadIndexedDB() {
      try {
        const storedImages = await getAllImagesDB();
        if (storedImages && storedImages.length > 0) {
          // Upgrade any legacy synthetic SVGs to authentic textbook photos if available
          const upgraded = storedImages.map((img: SgkImageItem) => {
            const defMatch = defaultSgkImages.find((d) => d.id === img.id);
            if (defMatch && (img.imgUrl.startsWith('data:image/svg+xml') || !img.imgUrl)) {
              return { ...img, imgUrl: defMatch.imgUrl };
            }
            return img;
          });
          // Ensure all default authentic images are present
          const existingIds = new Set(upgraded.map((i: SgkImageItem) => i.id));
          const merged = [...upgraded];
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

        const storedAllPlans = await getAppStateDB('gdtc_all_master_plans', null);
        if (storedAllPlans && typeof storedAllPlans === 'object') {
          const normalizedMap: Record<string, MasterPlanItem> = {
            ...masterPlansTuan9
          };
          Object.keys(storedAllPlans).forEach((key) => {
            const plan = normalizeMasterPlan(storedAllPlans[key]);
            // Ensure Row 2 has authentic image rather than legacy SVG
            if (plan.rows && plan.rows.length >= 2) {
              const r2 = plan.rows[1];
              if (r2.contentImgUrl?.startsWith('data:image/svg+xml') || !r2.contentImgUrl) {
                if (key.includes('k3_t17') || key.includes('k3_t18')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Vươn thở & Động tác Tay (SGK GDTC Lớp 3)';
                } else if (key.includes('k3_t16')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp (SGK GDTC Lớp 3)';
                } else if (key.includes('k3_t15')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Đi đều, Đứng lại (SGK GDTC Lớp 3)';
                } else if (key.includes('k1_t15')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Vươn thở (SGK GDTC Lớp 1)';
                } else if (key.includes('k1_t16')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k1_tay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Tay (SGK GDTC Lớp 1)';
                } else if (key.includes('k1_t17')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k1_chan.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Chân & Vặn mình (SGK GDTC Lớp 1)';
                } else if (key.includes('k1_t18')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k1_bung.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Bụng (SGK GDTC Lớp 1)';
                } else if (key.includes('k5_t15')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Vươn thở, Tay với gậy (SGK GDTC Lớp 5)';
                } else if (key.includes('k5_t16')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_chan_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Chân với gậy (SGK GDTC Lớp 5)';
                } else if (key.includes('k5_t17')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_bung_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Bụng với gậy (SGK GDTC Lớp 5)';
                } else if (key.includes('k5_t18')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_van_minh_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Vặn mình với gậy (SGK GDTC Lớp 5)';
                } else if (key.includes('k5_t19')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_toan_than_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Toàn thân với gậy (SGK GDTC Lớp 5)';
                }
              }

              // Self-heal any stored plans that have mismatched Grade 5 images or fabricated games
              const cLower = (r2.content || '').toLowerCase();
              if (plan.grade === 5) {
                if (cLower.includes('động tác bụng') || cLower.includes('học động tác bụng')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_bung_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Bụng với gậy (SGK GDTC Lớp 5)';
                } else if (cLower.includes('động tác vặn mình') || cLower.includes('học động tác vặn mình')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_van_minh_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Vặn mình với gậy (SGK GDTC Lớp 5)';
                } else if (cLower.includes('động tác toàn thân') || cLower.includes('học động tác toàn thân')) {
                  r2.contentImgUrl = '/assets/sgk_chuan/k5_toan_than_voi_gay.jpg';
                  r2.contentImgTitle = 'Hình ảnh Kỹ thuật: Động tác Toàn thân với gậy (SGK GDTC Lớp 5)';
                }

                // Sanitize game rows
                plan.rows.forEach((r) => {
                  if (r.content && r.content.includes('Kéo co thể thao')) {
                    r.content = r.content.replace(/Kéo co thể thao/g, 'Trao gậy tiếp sức');
                    r.contentImgUrl = '/assets/sgk_chuan/k5_tro_choi_trao_gay_tiep_suc.jpg';
                    r.contentImgTitle = 'Trò chơi vận động: Trao gậy tiếp sức - SGK GDTC 5';
                  }
                });
              }
            }
            // If stored plan is mismatched with authentic Week 9 plans, prefer authoritative Week 9 plan
            if (masterPlansTuan9[key]) {
              normalizedMap[key] = masterPlansTuan9[key];
            } else {
              normalizedMap[key] = plan;
            }
          });
          setAllMasterPlans(normalizedMap);
        }

        const storedMasterPlan = await getAppStateDB('master_plan', masterPlansTuan8.k1_t15);
        if (storedMasterPlan) {
          const plan = normalizeMasterPlan(storedMasterPlan);
          if (plan.rows && plan.rows.length >= 2 && plan.rows[1].contentImgUrl?.startsWith('data:image/svg+xml')) {
            plan.rows[1].contentImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
          }
          setCurrentMasterPlan(plan);
        }

        const storedRows = await getAppStateDB('current_lesson_rows', initialLessonsData.k1_t15.rows);
        if (storedRows && storedRows.length >= 2 && storedRows[1].contentImgUrl?.startsWith('data:image/svg+xml')) {
          storedRows[1].contentImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
        }
        setLessonRows(storedRows);

        // Restore active week and lesson metadata
        const savedWeek = await getAppStateDB('active_week', 9);
        const savedGrade = await getAppStateDB('active_grade', 1);
        const savedLessonNum = await getAppStateDB('active_lesson_num', 17);
        const savedTopic = await getAppStateDB('active_topic', 'CHỦ ĐỀ 2: BÀI THỂ DỤC');
        const savedTitle = await getAppStateDB('active_title', 'BÀI 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC BỤNG (TIẾT 1)');

        setWeek(savedWeek);
        setGrade(savedGrade);
        setLessonNum(savedLessonNum);
        setTopic(savedTopic);
        setTitle(savedTitle);
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
    setAppStateDB('school_settings', schoolSettings);
  }, [schoolSettings]);

  useEffect(() => {
    setAppStateDB('master_plan', currentMasterPlan);
  }, [currentMasterPlan]);

  useEffect(() => {
    setAppStateDB('gdtc_all_master_plans', allMasterPlans);
  }, [allMasterPlans]);

  // Synchronized Plan Updater: updates allMasterPlans reactively
  const handleUpdateSingleMasterPlan = (key: string, updatedPlan: MasterPlanItem) => {
    const normalized = normalizeMasterPlan(updatedPlan);
    setAllMasterPlans((prev) => ({
      ...prev,
      [key]: normalized
    }));

    if (currentMasterPlan.id === normalized.id || currentMasterPlan.lessonNum === normalized.lessonNum && currentMasterPlan.grade === normalized.grade) {
      setCurrentMasterPlan(normalized);
      setLessonRows(JSON.parse(JSON.stringify(normalized.rows)));
    }
  };

  useEffect(() => {
    setAppStateDB('current_lesson_rows', lessonRows);
  }, [lessonRows]);

  // Tự động đồng bộ currentMasterPlan & allMasterPlans ngay khi giáo án tuần mới được sinh hoặc chỉnh sửa
  useEffect(() => {
    if (!lessonRows || lessonRows.length === 0) return;
    const key = `k${grade}_t${lessonNum}`;
    const syncedPlan: MasterPlanItem = {
      ...currentMasterPlan,
      id: `plan_${key}_w${week}`,
      grade: grade as 1 | 3 | 5,
      week,
      lessonNum,
      topic,
      title,
      rows: lessonRows
    };
    setCurrentMasterPlan(syncedPlan);
    setAllMasterPlans((prev) => ({
      ...prev,
      [key]: syncedPlan
    }));
  }, [lessonRows, week, grade, lessonNum, topic, title]);

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
    const syncedPlan: MasterPlanItem = {
      ...currentMasterPlan,
      id: `plan_${key}_w${week}`,
      grade: grade as 1 | 3 | 5,
      week,
      lessonNum,
      topic,
      title,
      rows: JSON.parse(JSON.stringify(lessonRows))
    };
    setCurrentMasterPlan(syncedPlan);
    setAllMasterPlans((prev) => ({
      ...prev,
      [key]: syncedPlan
    }));
    setActiveTab('tab-export');
    showToast(`Đã chuyển sang Xem trước & In cho giáo án Tuần ${week} - Khối ${grade} (Tiết ${lessonNum})!`);
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
    setImages((prev) => {
      const exists = prev.some(
        (im) =>
          im.id === newImg.id ||
          (im.title === newImg.title && im.grade === newImg.grade && im.page === newImg.page)
      );
      if (exists) {
        return prev;
      }
      const updated = [newImg, ...prev];
      saveImagesDB(updated).catch((err) => console.warn('Lỗi ghi IndexedDB:', err));
      return updated;
    });
    showToast(`Đã lưu "${newImg.title}" an toàn vào Thư viện!`);
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
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setVisionImage(img);
        setVisionResult(data.analysis);
        setIsVisionModalOpen(true);
        showToast('✨ Gemini Vision đã nhận diện xong động tác!');
      } else {
        throw new Error(data.error || 'Lỗi nhận diện');
      }
    } catch (err: any) {
      console.warn('Vision analysis fallback notice:', err);
      setVisionImage(img);
      setVisionResult({
        name: img.title || 'Động tác kỹ thuật SGK',
        category: img.category,
        targetColumn: img.category === 'dong_tac' ? 'content' : 'hs',
        lvd: "5 - 7'",
        caption: img.caption || 'Tư thế động tác chuẩn xác, thân người thẳng, hít thở sâu.',
        technicalCues: ['Giữ thẳng thân người', 'Biên độ tay chân mở rộng dứt khoát', 'Hít thở đều đặn'],
        commonErrors: ['Cúi đầu mất thăng bằng', 'Chưa thẳng cánh tay'],
        gvScript: '- GV làm mẫu chuẩn xác 2-3 lần.\n- Cho HS quan sát tranh ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai.',
        hsScript: '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Chú ý quan sát và thực hiện theo nhịp hô.',
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
        const firstLine = copy[rowIndex].content.split('\n')[0];
        copy[rowIndex] = {
          ...copy[rowIndex],
          content: `${firstLine}\n- ${movementName}`,
          lvd: lvdVal || copy[rowIndex].lvd,
          gv: gvScriptVal || copy[rowIndex].gv,
          hs: hsScriptVal || copy[rowIndex].hs,
        };

        if (targetCol === 'content') {
          copy[rowIndex].contentImgUrl = imgItem.imgUrl;
          copy[rowIndex].contentImgTitle = movementName;
        } else {
          copy[rowIndex].hsImgUrl = imgItem.imgUrl;
          copy[rowIndex].hsImgTitle = movementName;
        }
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
            onImageExtracted={handleImageExtracted}
            onNavigateToGallery={() => setActiveTab('tab-img-library')}
            onAnalyzeVision={handleAnalyzeVision}
            onOpenSmartClean={handleOpenSmartClean}
            onOpenBatchUpload={() => {
              setActiveTab('tab-img-library');
            }}
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
            onSwitchToExport={handleSwitchToExportFromGenerator}
            onSwitchToMasterTemplate={() => setActiveTab('tab-extract')}
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
            images={images}
            showToast={showToast}
            onUpdateMasterPlan={(updated) => {
              setCurrentMasterPlan(updated);
              setLessonRows(JSON.parse(JSON.stringify(updated.rows)));
            }}
            onNavigateToLibrary={() => setActiveTab('tab-img-library')}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
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
    </div>
  );
}
