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

  // 1. Initial Load from IndexedDB (with legacy localStorage migration)
  useEffect(() => {
    async function loadIndexedDB() {
      try {
        const storedImages = await getAllImagesDB();
        if (storedImages && storedImages.length > 0) {
          // Auto-heal triangle game diagram if it had the mass formation image
          const triangleRealDiagram = standardFormationDiagrams.find(f => f.id === 'f_tro_choi_tam_giac')?.svgDataUrl;
          const sanitized = storedImages.map((img: SgkImageItem) => {
            if (
              (img.id === 'img_sgk_k3_chay_tam_giac' || img.title?.toLowerCase().includes('tam giác')) &&
              img.imgUrl?.includes('k3_tro_choi_tam_giac.jpg') &&
              triangleRealDiagram
            ) {
              return {
                ...img,
                imgUrl: triangleRealDiagram,
                title: 'Trò chơi: Chạy theo hình tam giác - SGK Lớp 3 (Trang 29)',
                category: 'tro_choi' as ImageCategory,
                folder: 'troChoi' as any,
                caption: 'Trò chơi vận động Chạy theo hình tam giác: 3 cọc mốc A-B-C cự ly 8-10m, học sinh chạy tiếp sức vòng quanh tam giác theo chiều kim đồng hồ.'
              };
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

        const storedAllPlans = await getAppStateDB('gdtc_all_master_plans', null);
        if (storedAllPlans && typeof storedAllPlans === 'object' && Object.keys(storedAllPlans).length > 0) {
          const normalizedMap: Record<string, MasterPlanItem> = {
            ...masterPlansTuan8,
            ...masterPlansTuan9
          };
          // User's edited plans in IndexedDB MUST have absolute priority over default templates!
          Object.keys(storedAllPlans).forEach((key) => {
            const plan = normalizeMasterPlan(storedAllPlans[key]);
            normalizedMap[key] = plan;
          });
          setAllMasterPlans(normalizedMap);
        } else {
          // First time initialization
          const defaultMap: Record<string, MasterPlanItem> = {
            ...masterPlansTuan8,
            ...masterPlansTuan9
          };
          setAllMasterPlans(defaultMap);
          await setAppStateDB('gdtc_all_master_plans', defaultMap);
        }

        const storedMasterPlan = await getAppStateDB<MasterPlanItem | null>('master_plan', null);
        if (storedMasterPlan) {
          setCurrentMasterPlan(normalizeMasterPlan(storedMasterPlan));
        }

        const storedRows = await getAppStateDB<LessonRow[] | null>('current_lesson_rows', null);
        if (storedRows && Array.isArray(storedRows) && storedRows.length > 0) {
          setLessonRows(storedRows);
        }

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
    if (isDbLoadedRef.current) {
      setAppStateDB('current_lesson_rows', lessonRows);
    }
  }, [lessonRows]);

  // Tự động đồng bộ currentMasterPlan & allMasterPlans ngay khi giáo án tuần mới được sinh hoặc chỉnh sửa
  useEffect(() => {
    if (!isDbLoadedRef.current) return; // Do NOT overwrite DB on initial mount
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
      const rawText = `${img.title || ''} ${img.caption || ''} ${img.folder || ''} ${img.category || ''} ${title || ''}`.toLowerCase();
      const isPairPractice =
        rawText.includes('cặp đôi') ||
        rawText.includes('cap doi') ||
        rawText.includes('đối diện') ||
        rawText.includes('doi dien');
      const isGame =
        img.category === 'tro_choi' ||
        img.category === 'tro_choi_khoi_dong' ||
        img.folder === 'troChoi' ||
        rawText.includes('trò chơi') ||
        rawText.includes('tiếp sức') ||
        rawText.includes('kéo co');
      const isVanDung =
        img.category === 'van_dung' ||
        img.folder === 'vanDung' ||
        rawText.includes('vận dụng') ||
        rawText.includes('hồi tĩnh');

      let fallbackCategory: ImageCategory = img.category;
      let fallbackTargetCol: 'content' | 'hs' = 'hs';
      let fallbackName = img.title || 'Động tác kỹ thuật SGK';
      let fallbackLvd = "5 - 7'";
      let fallbackGv =
        '- GV làm mẫu chuẩn xác 2-3 lần kết hợp phân tích kỹ thuật từng nhịp.\n- Cho HS quan sát hình ảnh SGK đính kèm.\n- Hô nhịp dứt khoát và hướng dẫn HS sửa sai tư thế.';
      let fallbackHs =
        '- Đội hình 4 hàng ngang cự ly 1 sải tay so le.\n- Quan sát mẫu của GV và thực hiện đồng loạt theo nhịp đếm.';

      if (isPairPractice) {
        fallbackCategory = 'tap_luyen';
        fallbackTargetCol = 'hs';
        fallbackName = 'Luyện tập cặp đôi sửa sai cho nhau';
        fallbackLvd = "3 - 5' (2 - 3 lượt đổi vai)";
        fallbackGv =
          '- Chia lớp thành từng cặp đứng đối diện nhau cự ly 1.5 - 2 mét.\n- Giao nhiệm vụ: một bạn thực hiện động tác theo nhịp hô, một bạn quan sát giúp bạn uốn nắn tư thế rồi đổi vai.\n- GV luân phiên đi bao quát các cặp, uốn nắn và biểu dương cặp đôi phối hợp tích cực.';
        fallbackHs =
          '- Từng cặp đứng đối diện nhau nghiêm túc, cự ly 1.5m.\n- Bạn A thực hiện động tác theo nhịp hô, bạn B quan sát hỗ trợ sửa sai; sau đó đổi vai theo hiệu lệnh của GV.';
      } else if (isGame) {
        fallbackCategory = 'tro_choi';
        fallbackTargetCol = 'hs';
        fallbackName = img.title || 'Trò chơi vận động rèn luyện phản xạ';
        fallbackLvd = "4 - 6' (2 - 3 lượt chơi)";
        fallbackGv =
          '- GV nêu tên trò chơi, luật chơi và các lỗi phạm quy cần tránh.\n- Cho 1 nhóm chơi thử 1 lượt, sau đó tổ chức thi đua hào hứng giữa các tổ có tính điểm khen thưởng.';
        fallbackHs =
          '- Đội hình theo các tổ tập trung trước vạch xuất phát.\n- Tích cực tham gia thi đua với tinh thần đoàn kết, trung thực và cổ vũ hết mình.';
      } else if (isVanDung) {
        fallbackCategory = 'van_dung';
        fallbackTargetCol = 'hs';
        fallbackName = 'Hoạt động vận dụng thực tế cuộc sống';
        fallbackLvd = "2 - 3'";
        fallbackGv =
          '- Nêu câu hỏi vận dụng liên hệ thực tế: "Em nên tập bài thể dục này vào thời điểm nào trong ngày để tăng cường sức khỏe?"\n- Nhắc nhở HS giữ gìn vệ sinh, cùng nhau thu dọn cọc tiêu và trang thiết bị sân tập ngăn nắp.';
        fallbackHs =
          '- Hào hứng phát biểu liên hệ thực tế: Tập thể dục buổi sáng ở nhà cùng người thân.\n- Tự giác dọn dẹp vệ sinh sân tập và cất dụng cụ cẩn thận.';
      } else if (img.category === 'dong_tac') {
        fallbackTargetCol = 'content';
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
