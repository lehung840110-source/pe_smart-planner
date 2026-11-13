import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Wand2,
  Trash2,
  FileUp,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  Search,
  FolderTree,
  Folder,
  FolderOpen,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  CheckCircle2,
  Scissors,
  Crop,
  Eraser,
  Download,
  Filter,
  X,
  Save,
  Check,
  Edit3,
  RotateCcw,
  Gamepad2,
  Flame,
  Users,
  HelpCircle,
  Target
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SgkImageItem, ImageCategory, SubFolderType } from '../types/gdtc';
import {
  removeBackgroundCanvas,
  autoCropCanvas,
  smartExtendFloor,
} from '../utils/imageProcessing';
import {
  sgkCurriculumTree,
  SgkLessonFolder,
  getEffectiveSgkCurriculumTree,
  saveSgkTreeLessonOverride,
  resetSgkTreeLessonOverride,
  doesImageBelongToSgkLesson
} from '../data/sgkCurriculumTree';
import { ImageProvenanceTooltip } from './ImageProvenanceTooltip';
import { resolveImageUsageProvenance } from '../utils/imageProvenance';
import { standardMovementsLibrary } from '../data/movementLibrary';
import { standardFormationDiagrams } from '../data/formationDiagrams';

// Set up pdf.js worker with local Vite asset URL
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface TabScanProps {
  images?: SgkImageItem[];
  onImageExtracted: (newImg: SgkImageItem) => void;
  onNavigateToGallery: () => void;
  onAnalyzeVision?: (img: SgkImageItem) => void;
  onOpenSmartClean?: (img: SgkImageItem) => void;
  onOpenBatchUpload?: () => void;
  initialGrade?: 1 | 3 | 5;
  initialPage?: number;
}

const SUBFOLDER_LABELS: Record<SubFolderType, string> = {
  khoiDong: '1. Khởi động chung',
  troChoiKhoiDong: '2. Trò chơi khởi động',
  kyThuat: '3. Kỹ thuật động tác',
  luyenTap: '4. Luyện tập',
  troChoi: '5. Trò chơi vận động',
  vanDung: '6. Vận dụng & Câu hỏi'
};

export const TabScan: React.FC<TabScanProps> = ({
  images = [],
  onImageExtracted,
  onNavigateToGallery,
  onAnalyzeVision,
  onOpenSmartClean,
  onOpenBatchUpload,
  initialGrade,
  initialPage,
}) => {
  // Active Grade & Textbook selection
  const [selectedGrade, setSelectedGrade] = useState<1 | 3 | 5>(initialGrade || 1);
  const [fileName, setFileName] = useState<string>('SGK GDTC Lớp 1 (Kết nối tri thức)');
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 28); // Default to Bài 1 (Trang 28 PDF)
  const [totalPages, setTotalPages] = useState<number>(97);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Đang mở trang sách...');
  const [zoomScale, setZoomScale] = useState<number>(0.85); // Cố định canvas xem trang sách ở 85% theo yêu cầu

  // Effective Tree + Inline Tree Metadata Editing
  const [treeRevision, setTreeRevision] = useState<number>(0);
  const effectiveTree = useMemo(() => getEffectiveSgkCurriculumTree(), [treeRevision]);
  const [isEditingLessonMeta, setIsEditingLessonMeta] = useState<boolean>(false);
  const [editWarmupGame, setEditWarmupGame] = useState<string>('');
  const [editPracticeGame, setEditPracticeGame] = useState<string>('');

  // Search by Lesson or Movement
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('k1_cd2_b1');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubFolderType>('kyThuat');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<'all' | 'dhdn' | 'the_duc' | 'knvd' | 'bong_ro' | 'boi'>('all');

  // Extraction states & Auto-save prevention
  const [autoSaveOnCrop, setAutoSaveOnCrop] = useState<boolean>(false); // Mặc định FALSE: chỉ quét khi người dùng bấm Lưu
  const [pendingCrop, setPendingCrop] = useState<SgkImageItem | null>(null);
  const [pendingCropTitle, setPendingCropTitle] = useState<string>('');
  const [pendingCropGrade, setPendingCropGrade] = useState<string>('1');
  const [pendingCropFolder, setPendingCropFolder] = useState<SubFolderType>('kyThuat');

  const [recentExtracted, setRecentExtracted] = useState<SgkImageItem[]>([]);
  const [isBatchScanning, setIsBatchScanning] = useState<boolean>(false);
  const [batchPercent, setBatchPercent] = useState<number>(0);
  const [batchStatus, setBatchStatus] = useState<string>('');

  // Refs
  const pdfDocRef = useRef<any>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelBatchRef = useRef<boolean>(false);
  const isDrawingRef = useRef<boolean>(false);
  const startCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const subFolderLockRef = useRef<{ page: number; folder: SubFolderType; itemTitle?: string } | null>(null);

  // Map grade to default local PDF file
  const gradePdfMap = {
    1: { file: '/assets/aistudio/SGK_GDTC1_8dda41ef.pdf', name: 'SGK GDTC Lớp 1 (Kết nối tri thức)', defaultPage: 28 },
    3: { file: '/assets/aistudio/SGK_GDTC_3_e88153f9.pdf', name: 'SGK GDTC Lớp 3 (Kết nối tri thức)', defaultPage: 27 },
    5: { file: '/assets/aistudio/SGK_GDTC_5_fe099e32.pdf', name: 'SGK GDTC Lớp 5 (Kết nối tri thức)', defaultPage: 25 },
  };

  // Load Grade PDF on mount or grade switch
  useEffect(() => {
    subFolderLockRef.current = null;
    loadPdfFromPath(gradePdfMap[selectedGrade].file, gradePdfMap[selectedGrade].name, initialPage || gradePdfMap[selectedGrade].defaultPage);
  }, [selectedGrade]);

  // Sync when initialGrade or initialPage changes from parent
  useEffect(() => {
    if (initialGrade && initialGrade !== selectedGrade) {
      setSelectedGrade(initialGrade);
    }
  }, [initialGrade]);

  useEffect(() => {
    if (initialPage && initialPage > 0 && initialPage !== currentPage) {
      subFolderLockRef.current = null;
      setCurrentPage(initialPage);
      if (pdfDocRef.current) {
        renderPdfPage(pdfDocRef.current, initialPage, zoomScale);
      }
    }
  }, [initialPage]);

  // Tự động đồng bộ bài học & thư mục con khi đổi trang, nhưng TÔN TRỌNG khóa mục tiêu khi người dùng vừa bấm chọn nhánh trong Cây Thư Mục
  useEffect(() => {
    const matched = effectiveTree.find(
      (f) => f.grade === selectedGrade && currentPage >= f.startPage && currentPage <= f.endPage
    ) || effectiveTree.find((f) => f.grade === selectedGrade);

    if (matched) {
      setSelectedFolderId(matched.id);

      // Nếu người dùng vừa bấm chọn rõ 1 nhánh trong cây cho trang này, giữ nguyên lựa chọn đó
      if (subFolderLockRef.current && subFolderLockRef.current.page === currentPage) {
        setSelectedSubCategory(subFolderLockRef.current.folder);
        return;
      }

      const isTroChoiKd = matched.subFolders.troChoiKhoiDong.items.some((it) => it.page === currentPage);
      const isTroChoiVd = matched.subFolders.troChoi.items.some((it) => it.page === currentPage);
      const isLuyenTap = matched.subFolders.luyenTap.items.some((it) => it.page === currentPage);
      const isKyThuat = matched.subFolders.kyThuat.items.some((it) => it.page === currentPage);
      const isKhoiDong = matched.subFolders.khoiDong.suggestedPage === currentPage;
      const isVanDung = matched.subFolders.vanDung.suggestedPage === currentPage;

      if (isKyThuat) {
        setSelectedSubCategory('kyThuat');
      } else if (isLuyenTap) {
        setSelectedSubCategory('luyenTap');
      } else if (isTroChoiVd) {
        setSelectedSubCategory('troChoi');
      } else if (isTroChoiKd) {
        setSelectedSubCategory('troChoiKhoiDong');
      } else if (isKhoiDong) {
        setSelectedSubCategory('khoiDong');
      } else if (isVanDung) {
        setSelectedSubCategory('vanDung');
      }
    }
  }, [selectedGrade, currentPage, effectiveTree]);

  const loadPdfFromPath = async (url: string, name: string, targetPage = 10) => {
    setIsLoading(true);
    setLoadingText(`Đang mở sách ${name}...`);
    try {
      const loadingTask = pdfjsLib.getDocument({ url });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setFileName(name);
      setTotalPages(pdf.numPages);
      const pageToRender = Math.min(targetPage, pdf.numPages);
      setCurrentPage(pageToRender);
      await renderPdfPage(pdf, pageToRender, zoomScale);
    } catch (err) {
      console.warn('PDF path loading fallback notice:', err);
      // Fallback: draw high-resolution mock textbook page if file path unavailable
      renderFallbackPage(targetPage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPdfPage = async (pdfDoc: any, pageNum: number, scale: number) => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = pdfCanvasRef.current;
      const drawCanvas = drawCanvasRef.current;
      if (!canvas || !drawCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      drawCanvas.width = Math.floor(viewport.width * dpr);
      drawCanvas.height = Math.floor(viewport.height * dpr);
      drawCanvas.style.width = `${Math.floor(viewport.width)}px`;
      drawCanvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      await page.render(renderContext).promise;

      // Clear drawing layer
      const dCtx = drawCanvas.getContext('2d');
      dCtx?.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    } catch (e) {
      console.warn('Page render error:', e);
    }
  };

  const renderFallbackPage = (pageNum: number) => {
    const canvas = pdfCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!canvas || !drawCanvas) return;

    const baseW = 780;
    const baseH = 1040;
    const w = Math.round(baseW * zoomScale);
    const h = Math.round(baseH * zoomScale);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    drawCanvas.width = w;
    drawCanvas.height = h;
    drawCanvas.style.width = `${w}px`;
    drawCanvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const matchedFolder = effectiveTree.find(
      (f) => f.grade === selectedGrade && pageNum >= f.startPage && pageNum <= f.endPage
    ) || effectiveTree.find((f) => f.id === selectedFolderId);

    // Book Header
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(40 * zoomScale, 30 * zoomScale, (baseW - 80) * zoomScale, 6 * zoomScale);
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.round(20 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText(`SGK GIÁO DỤC THỂ CHẤT LỚP ${selectedGrade} · TRANG ${pageNum}`, 40 * zoomScale, 65 * zoomScale);
    ctx.font = `${Math.round(13 * zoomScale)}px Inter, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText(`${matchedFolder?.topicName || 'KẾT NỐI TRI THỨC'} · ${matchedFolder?.lessonName || ''}`, 40 * zoomScale, 90 * zoomScale);

    // Box 1: Khởi động
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40 * zoomScale, 110 * zoomScale, (baseW - 80) * zoomScale, 130 * zoomScale);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(40 * zoomScale, 110 * zoomScale, (baseW - 80) * zoomScale, 130 * zoomScale);
    ctx.fillStyle = '#1e40af';
    ctx.font = `bold ${Math.round(14 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText('1. KHỞI ĐỘNG CHUNG VÀ TRÒ CHƠI BỔ TRỢ', 55 * zoomScale, 140 * zoomScale);
    ctx.fillStyle = '#475569';
    ctx.font = `${Math.round(12 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText(matchedFolder?.subFolders.khoiDong.description || 'Xoay các khớp cổ tay, cổ chân, khớp gối, khớp hông nhịp nhàng 2 lần x 8 nhịp.', 55 * zoomScale, 170 * zoomScale);

    // Box 2: Kỹ thuật động tác
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40 * zoomScale, 260 * zoomScale, (baseW - 80) * zoomScale, 360 * zoomScale);
    ctx.strokeRect(40 * zoomScale, 260 * zoomScale, (baseW - 80) * zoomScale, 360 * zoomScale);
    ctx.fillStyle = '#065f46';
    ctx.font = `bold ${Math.round(14 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText('2. KIẾN THỨC MỚI & KỸ THUẬT ĐỘNG TÁC CHUẨN', 55 * zoomScale, 290 * zoomScale);
    ctx.fillStyle = '#334155';
    ctx.font = `${Math.round(12 * zoomScale)}px Inter, sans-serif`;
    const movements = matchedFolder?.subFolders.kyThuat.items || [];
    movements.forEach((m, idx) => {
      ctx.fillText(`• ${m.name}: ${m.desc}`, 55 * zoomScale, (325 + idx * 45) * zoomScale);
    });

    // Box 3: Luyện tập & Vận dụng
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40 * zoomScale, 640 * zoomScale, (baseW - 80) * zoomScale, 340 * zoomScale);
    ctx.strokeRect(40 * zoomScale, 640 * zoomScale, (baseW - 80) * zoomScale, 340 * zoomScale);
    ctx.fillStyle = '#7c2d12';
    ctx.font = `bold ${Math.round(14 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText('3. LUYỆN TẬP TỔ NHÓM & VẬN DỤNG THỰC TẾ', 55 * zoomScale, 670 * zoomScale);
    ctx.fillStyle = '#475569';
    ctx.font = `${Math.round(12 * zoomScale)}px Inter, sans-serif`;
    ctx.fillText('Luyện tập cá nhân, cặp đôi quan sát sửa sai và tổ nhóm 4 khu vực sân tập.', 55 * zoomScale, 705 * zoomScale);
    ctx.fillText(matchedFolder?.subFolders.vanDung.description || 'Vận dụng rèn luyện thể dục buổi sáng tại nhà nâng cao sức khỏe.', 55 * zoomScale, 740 * zoomScale);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoomScale + delta, 0.5), 2.0);
    setZoomScale(newZoom);
    if (pdfDocRef.current) {
      renderPdfPage(pdfDocRef.current, currentPage, newZoom);
    } else {
      renderFallbackPage(currentPage);
    }
  };

  const handlePageChange = (newPage: number, preserveLock = false) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (!preserveLock) {
      subFolderLockRef.current = null;
    }
    setCurrentPage(newPage);
    if (pdfDocRef.current) {
      renderPdfPage(pdfDocRef.current, newPage, zoomScale);
    } else {
      renderFallbackPage(newPage);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setLoadingText(`Đang mở ${file.name}...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setFileName(file.name);
      setTotalPages(pdf.numPages);
      // Skip cover (pages 1-8) automatically
      const startPage = pdf.numPages > 8 ? 9 : 1;
      setCurrentPage(startPage);
      await renderPdfPage(pdf, startPage, zoomScale);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Drawing box on the page to crop
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;

    startCoordRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    const startX = startCoordRef.current.x;
    const startY = startCoordRef.current.y;

    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    // Outer dark mask
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

    // Clear cut-out
    const boxX = Math.min(startX, currentX);
    const boxY = Math.min(startY, currentY);
    const boxW = Math.abs(currentX - startX);
    const boxH = Math.abs(currentY - startY);
    ctx.clearRect(boxX, boxY, boxW, boxH);

    // Glowing border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const drawCanvas = drawCanvasRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    if (!drawCanvas || !pdfCanvas) return;

    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    const startX = startCoordRef.current.x;
    const startY = startCoordRef.current.y;

    const cropX = Math.round(Math.min(startX, currentX));
    const cropY = Math.round(Math.min(startY, currentY));
    const cropW = Math.round(Math.abs(currentX - startX));
    const cropH = Math.round(Math.abs(currentY - startY));

    if (cropW > 30 && cropH > 30) {
      await extractCroppedArea(cropX, cropY, cropW, cropH);
    }

    // Clear overlay
    const ctx = drawCanvas.getContext('2d');
    ctx?.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  };

  const extractCroppedArea = async (x: number, y: number, w: number, h: number, customTitle?: string) => {
    const pdfCanvas = pdfCanvasRef.current;
    if (!pdfCanvas) return;

    // Cắt CHÍNH XÁC 100% tọa độ vùng chọn người dùng vừa kéo chuột, không tự ý dời hay kéo dài làm méo hình
    const safeX = Math.max(0, Math.min(x, pdfCanvas.width - 1));
    const safeY = Math.max(0, Math.min(y, pdfCanvas.height - 1));
    const safeW = Math.max(1, Math.min(w, pdfCanvas.width - safeX));
    const safeH = Math.max(1, Math.min(h, pdfCanvas.height - safeY));

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = safeW;
    cropCanvas.height = safeH;
    const cCtx = cropCanvas.getContext('2d')!;
    cCtx.drawImage(pdfCanvas, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);

    const cleanDataUrl = cropCanvas.toDataURL('image/png');

    // 1. Tự động xác định bài học theo trang đang mở & khối lớp (Ưu tiên theo trang trước)
    const activeFolder = effectiveTree.find(
      (f) => f.grade === selectedGrade && currentPage >= f.startPage && currentPage <= f.endPage
    ) || effectiveTree.find((f) => f.id === selectedFolderId) ||
         effectiveTree.find((f) => f.grade === selectedGrade);

    // 2. Xác định phân loại thư mục theo: (a) Khóa lựa chọn từ Cây Thư Mục, hoặc (b) Suy diễn chuẩn xác theo trang & hạng mục đang chọn
    const isLockedForThisPage = subFolderLockRef.current && subFolderLockRef.current.page === currentPage;
    let autoFolder: SubFolderType = isLockedForThisPage
      ? subFolderLockRef.current!.folder
      : selectedSubCategory;
    let autoTitle = customTitle || '';

    if (!autoTitle && activeFolder) {
      const lessonTitle = activeFolder.lessonName.split(':')[1]?.trim() || activeFolder.lessonName;
      const kyThuatItem = activeFolder.subFolders.kyThuat.items.find((it) => it.page === currentPage);
      const luyenTapItem = activeFolder.subFolders.luyenTap.items.find((it) => it.page === currentPage);
      const troChoiKdItem = activeFolder.subFolders.troChoiKhoiDong.items.find((it) => it.page === currentPage);
      const troChoiVdItem = activeFolder.subFolders.troChoi.items.find((it) => it.page === currentPage);

      if (isLockedForThisPage) {
        const lockedItemTitle = subFolderLockRef.current?.itemTitle;
        if (autoFolder === 'troChoiKhoiDong') {
          const gName = troChoiKdItem?.gameName || activeFolder.subFolders.troChoiKhoiDong.items[0]?.gameName || 'Trò chơi khởi động';
          autoTitle = `${gName} - Trò chơi khởi động (Khối ${selectedGrade}, Trang ${currentPage})`;
        } else if (autoFolder === 'troChoi') {
          const gName = troChoiVdItem?.gameName || activeFolder.subFolders.troChoi.items[0]?.gameName || 'Trò chơi vận động';
          autoTitle = `${gName} - Trò chơi vận động (Khối ${selectedGrade}, Trang ${currentPage})`;
        } else if (autoFolder === 'khoiDong') {
          autoTitle = `Khởi động - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
        } else if (autoFolder === 'luyenTap') {
          autoTitle = `${luyenTapItem?.name || `Luyện tập - ${lessonTitle}`} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
        } else if (autoFolder === 'vanDung') {
          autoTitle = `Vận dụng - ${lessonTitle} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
        } else {
          autoTitle = `${lockedItemTitle || kyThuatItem?.name || activeFolder.movements[0] || lessonTitle} (Khối ${selectedGrade}) - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
        }
      } else if (kyThuatItem && selectedSubCategory === 'kyThuat') {
        autoFolder = 'kyThuat';
        autoTitle = `${kyThuatItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (luyenTapItem && selectedSubCategory === 'luyenTap') {
        autoFolder = 'luyenTap';
        autoTitle = `${luyenTapItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (troChoiKdItem && selectedSubCategory === 'troChoiKhoiDong') {
        autoFolder = 'troChoiKhoiDong';
        autoTitle = `${troChoiKdItem.gameName} - Trò chơi khởi động (Khối ${selectedGrade}, Trang ${currentPage})`;
      } else if (troChoiVdItem && selectedSubCategory === 'troChoi') {
        autoFolder = 'troChoi';
        autoTitle = `${troChoiVdItem.gameName} - Trò chơi vận động (Khối ${selectedGrade}, Trang ${currentPage})`;
      } else if (troChoiVdItem) {
        autoFolder = 'troChoi';
        autoTitle = `${troChoiVdItem.gameName} - Trò chơi vận động (Khối ${selectedGrade}, Trang ${currentPage})`;
      } else if (troChoiKdItem) {
        autoFolder = 'troChoiKhoiDong';
        autoTitle = `${troChoiKdItem.gameName} - Trò chơi khởi động (Khối ${selectedGrade}, Trang ${currentPage})`;
      } else if (luyenTapItem) {
        autoFolder = 'luyenTap';
        autoTitle = `${luyenTapItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (kyThuatItem) {
        autoFolder = 'kyThuat';
        autoTitle = `${kyThuatItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (activeFolder.subFolders.khoiDong.suggestedPage === currentPage) {
        autoFolder = 'khoiDong';
        autoTitle = `Khởi động - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
      } else if (activeFolder.subFolders.vanDung.suggestedPage === currentPage) {
        autoFolder = 'vanDung';
        autoTitle = `Vận dụng - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
      } else {
        const pageOffset = currentPage - activeFolder.startPage;
        if (pageOffset <= 1) {
          autoFolder = 'kyThuat';
          autoTitle = `Kỹ thuật động tác - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
        } else if (pageOffset >= 2 && pageOffset < (activeFolder.endPage - activeFolder.startPage)) {
          autoFolder = 'luyenTap';
          autoTitle = `Luyện tập - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
        } else {
          autoFolder = 'vanDung';
          autoTitle = `Vận dụng - ${lessonTitle} (SGK Lớp ${selectedGrade}, Trang ${currentPage})`;
        }
      }
    }

    // Refined title override ONLY when the user explicitly typed a customTitle (never overwrite locked branch with naive movement keywords inside lessonName!)
    if (customTitle) {
      const lowerTitle = customTitle.toLowerCase();
      if (lowerTitle.includes('trò chơi khởi động') || lowerTitle.includes('bổ trợ khởi động')) {
        autoFolder = 'troChoiKhoiDong';
      } else if (
        lowerTitle.includes('trò chơi vận động') ||
        lowerTitle.includes('tiếp sức') ||
        lowerTitle.includes('kéo co') ||
        lowerTitle.includes('mèo đuổi chuột') ||
        lowerTitle.includes('đua ô tô') ||
        lowerTitle.includes('nhanh lên bạn ơi')
      ) {
        autoFolder = 'troChoi';
      } else if (lowerTitle.includes('khởi động') || lowerTitle.includes('xoay khớp')) {
        autoFolder = 'khoiDong';
      } else if (lowerTitle.includes('vận dụng') || lowerTitle.includes('hồi tĩnh')) {
        autoFolder = 'vanDung';
      } else if (
        lowerTitle.includes('luyện tập') ||
        lowerTitle.includes('tập luyện') ||
        lowerTitle.includes('đồng loạt') ||
        lowerTitle.includes('tổ nhóm') ||
        lowerTitle.includes('cặp đôi')
      ) {
        autoFolder = 'luyenTap';
      } else if (lowerTitle.includes('động tác') || lowerTitle.includes('kỹ thuật')) {
        autoFolder = 'kyThuat';
      }
    }

    if (!autoTitle) {
      autoTitle = `Động tác thể dục - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
    }

    // Determine category from autoFolder strictly according to GDTC standards
    let cat: ImageCategory = 'dong_tac';
    if (autoFolder === 'khoiDong') cat = 'khoi_dong';
    else if (autoFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
    else if (autoFolder === 'troChoi') cat = 'tro_choi';
    else if (autoFolder === 'kyThuat') cat = 'dong_tac';
    else if (autoFolder === 'luyenTap') cat = 'tap_luyen';
    else if (autoFolder === 'vanDung') cat = 'van_dung';

    const newImg: SgkImageItem = {
      id: `crop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: autoTitle,
      grade: String(selectedGrade), // Cắt SGK lớp nào -> lưu đúng vào khối lớp đó!
      topicId: activeFolder?.topicId,
      topicTitle: activeFolder?.topicName,
      lessonId: activeFolder?.lessonId,
      lessonTitle: activeFolder?.lessonName,
      folder: autoFolder,
      page: currentPage,
      category: cat,
      imgUrl: cleanDataUrl,
      caption: `Trích xuất từ SGK GDTC Lớp ${selectedGrade} (Trang ${currentPage}) · ${activeFolder?.topicName || ''} · ${activeFolder?.lessonName || ''}`,
      selected: false,
      createdAt: Date.now()
    };

    if (autoSaveOnCrop) {
      onImageExtracted(newImg);
      setRecentExtracted((prev) => [newImg, ...prev.slice(0, 6)]);
    } else {
      // Chế độ an toàn: Chỉ mở hộp thoại xác nhận, KHÔNG tự ý lưu vào thư viện
      setPendingCrop(newImg);
      setPendingCropTitle(newImg.title);
      setPendingCropGrade(String(selectedGrade));
      setPendingCropFolder(autoFolder);
    }
  };

  const handleConfirmSavePendingCrop = () => {
    if (!pendingCrop) return;
    let cat: ImageCategory = 'dong_tac';
    if (pendingCropFolder === 'khoiDong') cat = 'khoi_dong';
    else if (pendingCropFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
    else if (pendingCropFolder === 'troChoi') cat = 'tro_choi';
    else if (pendingCropFolder === 'kyThuat') cat = 'dong_tac';
    else if (pendingCropFolder === 'luyenTap') cat = 'tap_luyen';
    else if (pendingCropFolder === 'vanDung') cat = 'van_dung';

    const confirmedImg: SgkImageItem = {
      ...pendingCrop,
      title: pendingCropTitle.trim() || pendingCrop.title,
      grade: pendingCropGrade,
      folder: pendingCropFolder,
      category: cat
    };
    onImageExtracted(confirmedImg);
    setRecentExtracted((prev) => [confirmedImg, ...prev.slice(0, 6)]);
    setPendingCrop(null);
  };

  const handleDownloadPendingCrop = () => {
    if (!pendingCrop) return;
    const a = document.createElement('a');
    a.href = pendingCrop.imgUrl;
    const cleanTitle = (pendingCropTitle.trim() || pendingCrop.title || 'anh_sgk_crop')
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '_');
    a.download = `${cleanTitle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCancelPendingCrop = () => {
    setPendingCrop(null);
  };

  const handleGenerate3dFromPendingCrop = async () => {
    if (!pendingCrop) return;
    const cleanName = pendingCropTitle.trim().replace(/\s*-\s*SGK.*$/i, '').trim() || pendingCrop.title;
    setGenerating3dScanId('pending_crop');
    try {
      const res = await fetch('/api/ai/generate-3d-cartoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName: cleanName,
          grade: pendingCropGrade,
          description: pendingCrop.caption,
          sourceImageBase64: pendingCrop.imgUrl,
          style: 'sgk_vector'
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        let cat: ImageCategory = 'dong_tac';
        if (pendingCropFolder === 'khoiDong') cat = 'khoi_dong';
        else if (pendingCropFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
        else if (pendingCropFolder === 'troChoi') cat = 'tro_choi';
        else if (pendingCropFolder === 'kyThuat') cat = 'dong_tac';
        else if (pendingCropFolder === 'luyenTap') cat = 'tap_luyen';
        else if (pendingCropFolder === 'vanDung') cat = 'van_dung';

        const new3d: SgkImageItem = {
          id: `crop_ai_${Date.now()}`,
          title: `[Tái tạo SGK] ${cleanName} (Nền trong suốt)`,
          grade: pendingCropGrade,
          topicId: pendingCrop.topicId,
          topicTitle: pendingCrop.topicTitle,
          lessonId: pendingCrop.lessonId,
          lessonTitle: pendingCrop.lessonTitle,
          folder: pendingCropFolder,
          page: pendingCrop.page || 1,
          category: cat,
          imgUrl: data.imageUrl,
          caption: `Nhân vật hoạt hình 3D Pixar GDTC, nền trong suốt, không chữ, tư thế: ${cleanName}`,
          selected: false,
          createdAt: Date.now()
        };
        onImageExtracted(new3d);
        setRecentExtracted((prev) => [new3d, ...prev.slice(0, 6)]);
        setPendingCrop(null);
      }
    } catch (e: any) {
      console.warn('3D error', e);
    } finally {
      setGenerating3dScanId(null);
    }
  };

  const [generating3dScanId, setGenerating3dScanId] = useState<string | null>(null);

  const handleGenerate3dFromScan = async (img: SgkImageItem) => {
    setGenerating3dScanId(img.id);
    try {
      const cleanName = img.title.replace(/\s*-\s*SGK.*$/i, '').trim();
      const res = await fetch('/api/ai/generate-3d-cartoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName: cleanName,
          grade: img.grade,
          description: img.caption
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        const new3d: SgkImageItem = {
          id: `crop_3d_${Date.now()}`,
          title: `[3D] ${cleanName} (Nền trong suốt)`,
          grade: img.grade,
          topicId: img.topicId,
          topicTitle: img.topicTitle,
          lessonId: img.lessonId,
          lessonTitle: img.lessonTitle,
          folder: img.folder || 'kyThuat',
          page: img.page || 1,
          category: img.category || 'dong_tac',
          imgUrl: data.imageUrl,
          caption: `Nhân vật hoạt hình 3D Pixar GDTC, nền trong suốt, không chữ, tư thế: ${cleanName}`,
          selected: false,
          createdAt: Date.now()
        };
        onImageExtracted(new3d);
        setRecentExtracted((prev) => [new3d, ...prev.slice(0, 6)]);
      }
    } catch (e: any) {
      console.warn('3D error', e);
    } finally {
      setGenerating3dScanId(null);
    }
  };

  // Jump to specific Lesson + SubFolder in the Curriculum Tree
  const handleSelectLessonFolder = (
    folder: SgkLessonFolder,
    subCat: SubFolderType,
    specificPage?: number,
    specificItemTitle?: string
  ) => {
    let targetPage = specificPage;
    if (!targetPage) {
      if (subCat === 'kyThuat') targetPage = folder.subFolders.kyThuat.items[0]?.page || folder.startPage;
      else if (subCat === 'khoiDong') targetPage = folder.subFolders.khoiDong.suggestedPage;
      else if (subCat === 'troChoiKhoiDong') targetPage = folder.subFolders.troChoiKhoiDong.suggestedPage || folder.startPage;
      else if (subCat === 'luyenTap') targetPage = folder.subFolders.luyenTap.items[0]?.page || folder.startPage;
      else if (subCat === 'troChoi') targetPage = folder.subFolders.troChoi.suggestedPage || folder.endPage;
      else if (subCat === 'vanDung') targetPage = folder.subFolders.vanDung.suggestedPage;
      else targetPage = folder.startPage;
    }

    subFolderLockRef.current = { page: targetPage, folder: subCat, itemTitle: specificItemTitle };
    setSelectedFolderId(folder.id);
    setSelectedSubCategory(subCat);
    setSelectedGrade(folder.grade);
    handlePageChange(targetPage, true);
  };

  // Active Lesson Folder + live image counts per (lessonId, subFolder)
  const activeLessonFolder = useMemo(() => {
    return (
      effectiveTree.find((f) => f.id === selectedFolderId) ||
      effectiveTree.find((f) => f.grade === selectedGrade && currentPage >= f.startPage && currentPage <= f.endPage) ||
      effectiveTree.find((f) => f.grade === selectedGrade) ||
      null
    );
  }, [effectiveTree, selectedFolderId, selectedGrade, currentPage]);

  useEffect(() => {
    if (activeLessonFolder) {
      setEditWarmupGame(activeLessonFolder.subFolders.troChoiKhoiDong.items[0]?.gameName || '');
      setEditPracticeGame(activeLessonFolder.subFolders.troChoi.items[0]?.gameName || '');
    }
  }, [activeLessonFolder]);

  const matchesSubFolderType = (img: SgkImageItem, sub: SubFolderType): boolean => {
    if (img.folder === sub) return true;
    if (!img.folder) {
      if (sub === 'khoiDong') return img.category === 'khoi_dong';
      if (sub === 'troChoiKhoiDong') return img.category === 'tro_choi_khoi_dong';
      if (sub === 'kyThuat') return img.category === 'dong_tac';
      if (sub === 'luyenTap') return img.category === 'tap_luyen';
      if (sub === 'troChoi') return img.category === 'tro_choi';
      if (sub === 'vanDung') return img.category === 'van_dung';
    }
    return false;
  };

  const getFolderSubCount = (lesson: SgkLessonFolder, sub?: SubFolderType): number => {
    if (!images || images.length === 0) return 0;
    return images.filter((img) => {
      if (!doesImageBelongToSgkLesson(img, lesson)) return false;
      if (!sub) return true;
      return matchesSubFolderType(img, sub);
    }).length;
  };

  const handleSaveLessonMeta = () => {
    if (!activeLessonFolder) return;
    saveSgkTreeLessonOverride(activeLessonFolder.id, {
      warmupGameName: editWarmupGame.trim() || activeLessonFolder.subFolders.troChoiKhoiDong.items[0]?.gameName,
      practiceGameName: editPracticeGame.trim() || activeLessonFolder.subFolders.troChoi.items[0]?.gameName,
      vanDungQuestion: 'Câu hỏi vận dụng sách giáo khoa.',
      vanDungAnswerGuide: ''
    });
    setTreeRevision((r) => r + 1);
    setIsEditingLessonMeta(false);
  };

  const handleResetLessonMeta = () => {
    if (!activeLessonFolder) return;
    resetSgkTreeLessonOverride(activeLessonFolder.id);
    setTreeRevision((r) => r + 1);
    setIsEditingLessonMeta(false);
  };

  // Filter lessons for the Tree View
  const filteredTree = useMemo(() => {
    return effectiveTree.filter((f) => {
      const matchGrade = f.grade === selectedGrade;

      let matchTopic = true;
      if (selectedTopicFilter === 'dhdn') {
        matchTopic = f.topicId.includes('cd1') || f.topicName.includes('ĐỘI HÌNH');
      } else if (selectedTopicFilter === 'the_duc') {
        matchTopic = f.topicId.includes('cd2') || f.topicName.includes('THỂ DỤC');
      } else if (selectedTopicFilter === 'knvd') {
        matchTopic = f.topicId.includes('cd3') || f.topicName.includes('KĨ NĂNG') || f.topicName.includes('TƯ THẾ');
      } else if (selectedTopicFilter === 'bong_ro') {
        matchTopic = f.topicId.includes('br') || f.topicName.includes('BÓNG RỔ');
      } else if (selectedTopicFilter === 'boi') {
        matchTopic = f.topicId.includes('boi') || f.topicName.includes('BƠI');
      }

      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        f.lessonName.toLowerCase().includes(q) ||
        f.topicName.toLowerCase().includes(q) ||
        f.movements.some((m) => m.toLowerCase().includes(q)) ||
        f.subFolders.troChoiKhoiDong.items.some((g) => g.gameName.toLowerCase().includes(q)) ||
        f.subFolders.troChoi.items.some((g) => g.gameName.toLowerCase().includes(q)) ||
        f.subFolders.vanDung.question.toLowerCase().includes(q);
      return matchGrade && matchTopic && matchQuery;
    });
  }, [effectiveTree, selectedGrade, selectedTopicFilter, searchQuery]);

  // One-time auto-loader of authentic textbook figures for all 3 grades
  const handleAutoLoadDefaultSgkFigures = async () => {
    setIsLoading(true);
    setLoadingText('Đang nạp bộ sưu tập ảnh động tác SGK chuẩn của 3 khối lớp...');

    const sampleImages: SgkImageItem[] = [
      // ===== KHỐI 1 =====
      {
        id: 'auto_k1_vuon_tho',
        title: 'Động tác Vươn thở - SGK Lớp 1 (Trang 36)',
        grade: '1',
        topicId: 'k1_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
        folder: 'kyThuat',
        page: 36,
        category: 'dong_tac',
        imgUrl: standardMovementsLibrary[0].svgDataUrl,
        caption: 'Nhịp 1: Chân trái bước sang ngang, hai tay vươn cao chếch chữ V hít sâu; Nhịp 2: Bắt chéo tay thở ra',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k1_tay',
        title: 'Động tác Tay - SGK Lớp 1 (Trang 37)',
        grade: '1',
        topicId: 'k1_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
        folder: 'kyThuat',
        page: 37,
        category: 'dong_tac',
        imgUrl: standardMovementsLibrary[1].svgDataUrl,
        caption: 'Nhịp 1: Hai tay dang ngang bằng vai lòng bàn tay ngửa; Nhịp 2: Vỗ tay trước ngực',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k1_luyen_tap',
        title: 'Luyện tập theo tổ nhóm 4 khu vực - Khối 1',
        grade: '1',
        topicId: 'k1_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
        folder: 'luyenTap',
        page: 38,
        category: 'tap_luyen',
        imgUrl: standardFormationDiagrams[4].svgDataUrl,
        caption: 'Đội hình phân chia 4 tổ tại 4 khu vực sân bãi, tổ trưởng chỉ huy đếm nhịp',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k1_van_dung',
        title: 'Vận dụng tập thể dục buổi sáng - Khối 1',
        grade: '1',
        topicId: 'k1_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI THỂ DỤC',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở và Động tác Tay',
        folder: 'vanDung',
        page: 39,
        category: 'van_dung',
        imgUrl: standardFormationDiagrams[1].svgDataUrl,
        caption: 'Tự giác tập luyện bài thể dục vào buổi sáng ở nhà rèn luyện sức khỏe',
        selected: false,
        createdAt: Date.now()
      },

      // ===== KHỐI 3 =====
      {
        id: 'auto_k3_di_deu',
        title: 'Động tác Đi đều, Đứng lại - SGK Lớp 3 (Trang 27)',
        grade: '3',
        topicId: 'k3_cd1',
        topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
        lessonId: 'b4',
        lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
        folder: 'kyThuat',
        page: 27,
        category: 'dong_tac',
        imgUrl: standardMovementsLibrary[7].svgDataUrl,
        caption: 'Chân trái bước nhịp 1, chân phải bước nhịp 2; tay đánh tự nhiên vuông góc',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k3_chay_tam_giac',
        title: 'Trò chơi: Chạy theo hình tam giác - SGK Lớp 3 (Trang 29)',
        grade: '3',
        topicId: 'k3_cd1',
        topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
        lessonId: 'b4',
        lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
        folder: 'troChoi',
        page: 29,
        category: 'tro_choi',
        imgUrl: standardFormationDiagrams[7].svgDataUrl,
        caption: 'Sơ đồ chạy qua 3 cọc mốc A, B, C cự ly 8-10m tiếp sức vui tươi, an toàn',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k3_cap_doi',
        title: 'Luyện tập cặp đôi sửa sai bước chân - Khối 3',
        grade: '3',
        topicId: 'k3_cd1',
        topicTitle: 'CHỦ ĐỀ 1: ĐỘI HÌNH ĐỘI NGŨ',
        lessonId: 'b4',
        lessonTitle: 'Bài 4: Động tác Đi đều, Đứng lại',
        folder: 'luyenTap',
        page: 28,
        category: 'tap_luyen',
        imgUrl: standardFormationDiagrams[5].svgDataUrl,
        caption: 'Hai học sinh đứng đối diện nhau, 1 bạn đếm nhịp và 1 bạn bước chân kiểm tra',
        selected: false,
        createdAt: Date.now()
      },

      // ===== KHỐI 5 =====
      {
        id: 'auto_k5_gay',
        title: 'Động tác Vươn thở, Tay, Chân với gậy - SGK Lớp 5 (Trang 24)',
        grade: '5',
        topicId: 'k5_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
        folder: 'kyThuat',
        page: 24,
        category: 'dong_tac',
        imgUrl: standardMovementsLibrary[8].svgDataUrl,
        caption: 'Bài tập thể dục phát triển chung phối hợp với gậy thể dục 1m',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k5_chuyen_gay',
        title: 'Trò chơi: Chuyền gậy tiếp sức - SGK Lớp 5 (Trang 26)',
        grade: '5',
        topicId: 'k5_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
        folder: 'troChoi',
        page: 26,
        category: 'tro_choi',
        imgUrl: standardFormationDiagrams[8].svgDataUrl,
        caption: 'Sơ đồ 4 làn tiếp sức chạy vòng qua cọc cờ 10m và chuyền gậy an toàn',
        selected: false,
        createdAt: Date.now()
      },
      {
        id: 'auto_k5_van_dung',
        title: 'Vận dụng xếp gậy thể dục ngăn nắp - Khối 5',
        grade: '5',
        topicId: 'k5_cd2',
        topicTitle: 'CHỦ ĐỀ 2: BÀI TẬP THỂ DỤC VỚI GẬY',
        lessonId: 'b1',
        lessonTitle: 'Bài 1: Động tác Vươn thở, Tay, Chân với gậy',
        folder: 'vanDung',
        page: 27,
        category: 'van_dung',
        imgUrl: standardFormationDiagrams[15].svgDataUrl,
        caption: 'Sau giờ học thu gom và xếp gậy trật tự vào giá thiết bị nhà trường',
        selected: false,
        createdAt: Date.now()
      }
    ];

    const confirmLoad = window.confirm(
      'Bạn có chắc chắn muốn nạp bộ sưu tập ảnh động tác SGK mẫu cho cả 3 khối lớp vào Thư viện không?'
    );
    if (!confirmLoad) {
      setIsLoading(false);
      return;
    }

    for (const img of sampleImages) {
      onImageExtracted(img);
    }

    setRecentExtracted((prev) => [...sampleImages, ...prev]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Grade Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedGrade(1)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedGrade === 1 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Khối 1</span>
            </button>
            <button
              onClick={() => setSelectedGrade(3)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedGrade === 3 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Khối 3</span>
            </button>
            <button
              onClick={() => setSelectedGrade(5)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedGrade === 5 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Khối 5</span>
            </button>
          </div>

          {/* Search Box by Lesson or Movement */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo bài học, động tác (Vươn thở, Đi đều, Gậy...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Upload or Auto Load */}
          <div className="flex items-center gap-2">
            {onOpenBatchUpload && (
              <button
                onClick={onOpenBatchUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                title="Tải lên hàng loạt nhiều file ảnh hoặc giải nén từ file ZIP, không cần quét lại từ đầu"
              >
                <Upload className="w-3.5 h-3.5 text-blue-200" />
                <span>Tải Hàng Loạt Ảnh (ZIP / Nhiều Ảnh)</span>
              </button>
            )}

            <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Chọn file PDF ngoài</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>

            <button
              onClick={handleAutoLoadDefaultSgkFigures}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="Tự động đồng bộ các ảnh kỹ thuật trọng tâm của SGK 1, 3, 5 vào Thư viện ảnh"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nạp SGK Mặc Định</span>
            </button>

            {/* Toggle: Chỉ quét/lưu khi xác nhận (tránh làm đầy thư viện) */}
            <label
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border select-none transition cursor-pointer ${
                autoSaveOnCrop
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
              }`}
              title="Mặc định TẮT (Chế độ An Toàn): Quét xong sẽ hỏi xác nhận, chỉ lưu khi bạn đồng ý để tránh rác thư viện."
            >
              <input
                type="checkbox"
                checked={autoSaveOnCrop}
                onChange={(e) => setAutoSaveOnCrop(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
              />
              <span className="text-[11px]">
                {autoSaveOnCrop ? '⚡ Tự lưu ngay khi nhả chuột' : '🛡️ An toàn: Hỏi trước khi lưu'}
              </span>
            </label>
          </div>
        </div>

        {/* Page Navigators & Zoom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-slate-700 font-semibold">
              <span>Trang</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => handlePageChange(parseInt(e.target.value, 10) || 1)}
                className="w-14 text-center border border-slate-300 rounded-md py-0.5 px-1 font-bold text-blue-700"
              />
              <span>/ {totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-slate-400 italic ml-2 hidden sm:inline">
              (Bỏ qua trang bìa 1-8, ưu tiên đúng bài học)
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-700 min-w-[45px] text-center text-xs">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.15)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
              title="Phóng to rõ nét"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomScale(0.85);
                if (pdfDocRef.current) renderPdfPage(pdfDocRef.current, currentPage, 0.85);
                else renderFallbackPage(currentPage);
              }}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                Math.round(zoomScale * 100) === 85
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Cố định canvas xem trang sách ở 85% theo yêu cầu chuẩn"
            >
              ⭐ Cố định 85%
            </button>
            <button
              onClick={() => {
                setZoomScale(0.85);
                if (pdfDocRef.current) renderPdfPage(pdfDocRef.current, currentPage, 0.85);
                else renderFallbackPage(currentPage);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline px-1.5"
            >
              Vừa trang (85%)
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Tree Directory + Center Large Canvas + Right Recent Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Left Column: Detailed 6-Branch Curriculum Tree Navigation */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col max-h-[800px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Cây Thư Mục SGK · Khối {selectedGrade}</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums whitespace-nowrap shrink-0">
              {filteredTree.length} bài · 6 phân mục/bài
            </span>
          </div>

          {/* Quick Topic Filter Buttons */}
          <div className="flex flex-wrap gap-1 pb-2 mb-2.5 border-b border-slate-100">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'dhdn', label: 'ĐHĐN' },
              { id: 'the_duc', label: selectedGrade === 5 ? 'TD gậy' : 'Bài TD' },
              { id: 'knvd', label: 'KN Vận động' },
              { id: 'bong_ro', label: 'Bóng rổ' },
              { id: 'boi', label: 'Bơi lội' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTopicFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0 ${
                  selectedTopicFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 text-xs pr-1">
            {filteredTree.map((lesson) => {
              const isSelected = selectedFolderId === lesson.id;
              const totalLessonImgs = getFolderSubCount(lesson);
              const kdCount = getFolderSubCount(lesson, 'khoiDong');
              const tckdCount = getFolderSubCount(lesson, 'troChoiKhoiDong');
              const ktCount = getFolderSubCount(lesson, 'kyThuat');
              const ltCount = getFolderSubCount(lesson, 'luyenTap');
              const tcCount = getFolderSubCount(lesson, 'troChoi');
              const vdCount = getFolderSubCount(lesson, 'vanDung');
              const warmupGameTitle = lesson.subFolders.troChoiKhoiDong.items[0]?.gameName || 'Trò chơi khởi động';
              const practiceGameTitle = lesson.subFolders.troChoi.items[0]?.gameName || 'Trò chơi vận động';

              return (
                <div
                  key={lesson.id}
                  className={`border rounded-xl p-2.5 transition ${
                    isSelected ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Topic + Grade + Page Range */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    <span className="text-blue-800 truncate">{lesson.topicName}</span>
                    <span className="tabular-nums whitespace-nowrap shrink-0 text-slate-500">
                      Tr.{lesson.startPage}-{lesson.endPage} · {totalLessonImgs} ảnh
                    </span>
                  </div>

                  {/* Lesson Title */}
                  <div
                    onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage)}
                    className="font-bold text-slate-900 text-xs mt-1 cursor-pointer hover:text-blue-700 leading-snug flex items-start gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{lesson.lessonName}</span>
                  </div>

                  {/* 6 Authentic SGK Sub-folders */}
                  <div className="mt-2 pl-2.5 space-y-1 border-l border-slate-300 text-[11px]">
                    {/* 1. Khởi động chung */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'khoiDong', lesson.subFolders.khoiDong.suggestedPage)}
                      className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                        isSelected && selectedSubCategory === 'khoiDong'
                          ? 'bg-sky-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Flame className="w-3 h-3 shrink-0" />
                        <span className="truncate">1. Khởi động chung</span>
                      </span>
                      <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                        P.{lesson.subFolders.khoiDong.suggestedPage} · {kdCount} ảnh
                      </span>
                    </div>

                    {/* 2. Trò chơi khởi động + Tên trò chơi */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'troChoiKhoiDong', lesson.subFolders.troChoiKhoiDong.suggestedPage, warmupGameTitle)}
                      className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                        isSelected && selectedSubCategory === 'troChoiKhoiDong'
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'text-amber-900 bg-amber-50/70 hover:bg-amber-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Gamepad2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">2. TC Khởi động: <strong>{warmupGameTitle}</strong></span>
                      </span>
                      <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                        P.{lesson.subFolders.troChoiKhoiDong.suggestedPage} · {tckdCount} ảnh
                      </span>
                    </div>

                    {/* 3. Kỹ thuật động tác */}
                    <div className="space-y-0.5">
                      <div
                        onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage)}
                        className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                          isSelected && selectedSubCategory === 'kyThuat'
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'text-blue-800 font-semibold hover:bg-blue-100/80'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Layers className="w-3 h-3 shrink-0" />
                          <span className="truncate">3. Kỹ thuật động tác ({lesson.subFolders.kyThuat.items.length})</span>
                        </span>
                        <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                          {ktCount} ảnh
                        </span>
                      </div>
                      {lesson.subFolders.kyThuat.items.map((it, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', it.page, it.name)}
                          className="pl-4 py-0.5 text-[10.5px] text-slate-600 hover:text-blue-700 cursor-pointer flex items-center justify-between gap-1.5"
                        >
                          <span className="truncate">• {it.name}</span>
                          <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap shrink-0">P.{it.page}</span>
                        </div>
                      ))}
                    </div>

                    {/* 4. Luyện tập */}
                    <div className="space-y-0.5">
                      <div
                        onClick={() => handleSelectLessonFolder(lesson, 'luyenTap', lesson.subFolders.luyenTap.items[0]?.page || lesson.startPage + 1)}
                        className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                          isSelected && selectedSubCategory === 'luyenTap'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-200/70'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Users className="w-3 h-3 shrink-0" />
                          <span className="truncate">4. Ảnh Luyện tập (Tổ/Cặp)</span>
                        </span>
                        <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                          P.{lesson.subFolders.luyenTap.items[0]?.page || lesson.startPage + 1} · {ltCount} ảnh
                        </span>
                      </div>
                    </div>

                    {/* 5. Trò chơi vận động + Tên trò chơi */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'troChoi', lesson.subFolders.troChoi.suggestedPage, practiceGameTitle)}
                      className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                        isSelected && selectedSubCategory === 'troChoi'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-purple-900 bg-purple-50/70 hover:bg-purple-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Target className="w-3 h-3 shrink-0" />
                        <span className="truncate">5. TC Vận động: <strong>{practiceGameTitle}</strong></span>
                      </span>
                      <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                        P.{lesson.subFolders.troChoi.suggestedPage} · {tcCount} ảnh
                      </span>
                    </div>

                    {/* 6. Hình ảnh & Câu hỏi Vận dụng */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'vanDung', lesson.subFolders.vanDung.suggestedPage)}
                      className={`cursor-pointer py-1 px-2 rounded-md transition space-y-0.5 ${
                        isSelected && selectedSubCategory === 'vanDung'
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-950 bg-emerald-50/60 hover:bg-emerald-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                          <HelpCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">6. Vận dụng (Ảnh &amp; Câu hỏi SGK)</span>
                        </span>
                        <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                          P.{lesson.subFolders.vanDung.suggestedPage} · {vdCount} ảnh
                        </span>
                      </div>
                      <p className={`text-[10px] pl-4 line-clamp-2 leading-tight ${
                        isSelected && selectedSubCategory === 'vanDung' ? 'text-emerald-50' : 'text-slate-600'
                      }`}>
                        Câu hỏi vận dụng sách giáo khoa (Kèm ảnh SGK)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Center Column: Active SGK Target Bar + Expanded Canvas Viewport */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Structured Lesson Metadata & Target Category Lock Bar */}
          {activeLessonFolder && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    Khối {selectedGrade} · Trang hiện hành {currentPage}/{totalPages} · Khoảng trang bài Tr.{activeLessonFolder.startPage}-{activeLessonFolder.endPage}
                  </div>
                  <div className="font-bold text-slate-900 truncate mt-0.5">
                    {activeLessonFolder.lessonName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingLessonMeta((v) => !v)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEditingLessonMeta ? 'Đóng chỉnh sửa' : 'Chỉnh sửa mục bài'}</span>
                </button>
              </div>

              {/* Quick Subfolder Target Lock Selector (so crops ALWAYS go to exact intended slot) */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-600">
                  Mục tiêu phân loại khi cắt ảnh trang {currentPage}:
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['khoiDong', 'troChoiKhoiDong', 'kyThuat', 'luyenTap', 'troChoi', 'vanDung'] as SubFolderType[]).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        subFolderLockRef.current = { page: currentPage, folder: sub };
                        setSelectedSubCategory(sub);
                      }}
                      className={`px-2 py-1 rounded-md text-[10.5px] font-semibold border text-left truncate transition ${
                        selectedSubCategory === sub
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {SUBFOLDER_LABELS[sub]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explicit Readout or Inline Editor for Games & Application Question */}
              {!isEditingLessonMeta ? (
                <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px] text-slate-700 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-amber-800 whitespace-nowrap shrink-0">Trò chơi Khởi động:</span>
                    <span className="font-medium text-right truncate">
                      {activeLessonFolder.subFolders.troChoiKhoiDong.items[0]?.gameName} (P.{activeLessonFolder.subFolders.troChoiKhoiDong.suggestedPage})
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-purple-800 whitespace-nowrap shrink-0">Trò chơi Vận động:</span>
                    <span className="font-medium text-right truncate">
                      {activeLessonFolder.subFolders.troChoi.items[0]?.gameName} (P.{activeLessonFolder.subFolders.troChoi.suggestedPage})
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-200/80">
                    <span className="font-semibold text-emerald-800">Mục 4.2 Vận dụng: </span>
                    <span className="text-slate-700">Câu hỏi vận dụng sách giáo khoa (Đính kèm hình ảnh trang {activeLessonFolder.subFolders.vanDung.suggestedPage} SGK)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1 bg-slate-50 rounded-xl p-2.5 border border-blue-200 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Tên Trò chơi Khởi động</label>
                      <input
                        type="text"
                        value={editWarmupGame}
                        onChange={(e) => setEditWarmupGame(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Tên Trò chơi Vận động</label>
                      <input
                        type="text"
                        value={editPracticeGame}
                        onChange={(e) => setEditPracticeGame(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-2 text-[11px] text-emerald-900">
                    Mục 4.2 trong giáo án các khối được chuẩn hóa ghi <strong>"Câu hỏi vận dụng sách giáo khoa."</strong> kèm hình ảnh cắt từ trang SGK (bỏ gợi ý trả lời giải phẫu và dặn dò về nhà).
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetLessonMeta}
                      className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Khôi phục gốc
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLessonMeta}
                      className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" /> Lưu mục SGK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF Canvas Viewport */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 relative overflow-auto custom-scrollbar flex items-center justify-center p-4 min-h-[540px] max-h-[650px]">
            {/* Instruction Tooltip Overlay */}
            <div className="absolute top-3 left-3 z-20 bg-slate-800/95 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] flex items-center gap-2 shadow-md">
              <Scissors className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                {autoSaveOnCrop
                  ? `Tự lưu ngay vào: Khối ${selectedGrade} · ${SUBFOLDER_LABELS[selectedSubCategory]}`
                  : `Kéo chọn hình để lưu vào: Khối ${selectedGrade} · ${SUBFOLDER_LABELS[selectedSubCategory]}`}
              </span>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 text-white">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-xs font-semibold text-slate-200">{loadingText}</p>
              </div>
            )}

            {/* Canvas Stacking Wrapper */}
            <div className="relative shadow-2xl rounded-lg bg-white overflow-hidden my-auto">
              <canvas ref={pdfCanvasRef} className="block" />
              <canvas
                ref={drawCanvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            </div>
          </div>
        </div>

        {/* 3. Right Column: Live Extracted Gallery for this Session */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col max-h-[750px]">
          <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ảnh Bóc Tách Tức Thì</span>
            </h3>
            <button
              onClick={onNavigateToGallery}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Vào Thư Viện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            {recentExtracted.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-600">Chưa có ảnh nào được cắt</p>
                <p className="text-[11px] text-slate-400 px-4">
                  Chọn một bài học ở cột bên trái và dùng chuột kéo chọn vùng động tác trên trang sách.
                </p>
              </div>
            ) : (
              recentExtracted.map((img) => {
                const prov = resolveImageUsageProvenance(img);
                return (
                <div
                  key={img.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 hover:border-blue-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative group/imgtip shrink-0">
                      <img
                        src={img.imgUrl}
                        alt={img.title}
                        className="w-16 h-16 object-contain rounded-lg border bg-white shadow-2xs"
                      />
                      <ImageProvenanceTooltip image={img} position="bottom" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-800 truncate">{img.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{img.caption}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="text-blue-700 bg-blue-50 font-bold px-1.5 py-0.5 rounded tabular-nums">
                          Khối {img.grade} · Trang {img.page}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                          {img.category === 'dong_tac'
                            ? 'Động tác'
                            : img.category === 'tap_luyen'
                            ? 'Luyện tập'
                            : img.category === 'khoi_dong'
                            ? 'Khởi động'
                            : img.category === 'tro_choi_khoi_dong'
                            ? 'TC Khởi động'
                            : img.category === 'tro_choi'
                            ? 'TC Vận động'
                            : 'Vận dụng'}
                        </span>
                        <span className="text-sky-700 bg-sky-50 font-semibold px-1.5 py-0.5 rounded tabular-nums">
                          {prov.weekLabel} · Mục {prov.slotCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1.5 border-t border-slate-200/60 text-[10px]">
                    <button
                      disabled={generating3dScanId === img.id}
                      onClick={() => handleGenerate3dFromScan(img)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs transition shrink-0"
                      title="Tạo nhân vật hoạt hình 3D Pixar, nền trong suốt, không có chữ kèm theo"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{generating3dScanId === img.id ? '3D...' : 'Tạo 3D'}</span>
                    </button>

                    {onAnalyzeVision && (
                      <button
                        onClick={() => onAnalyzeVision(img)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 shadow-2xs transition"
                        title="Dùng Gemini Vision đọc động tác và tự động điền vào giáo án"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>AI Đọc & Điền</span>
                      </button>
                    )}
                    {onOpenSmartClean && (
                      <button
                        onClick={() => onOpenSmartClean(img)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-1 px-2 rounded-lg transition"
                        title="Tẩy sạch chữ thừa và icon hoạt hình"
                      >
                        <Eraser className="w-3 h-3 inline mr-0.5 text-purple-600" />
                        Tẩy
                      </button>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Lưu Vùng Ảnh Vừa Quét (Ngăn chặn làm đầy thư viện bừa bãi) */}
      {pendingCrop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-sm">Xác Nhận Lưu Vùng Ảnh Vừa Quét</h3>
              </div>
              <button
                onClick={handleCancelPendingCrop}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Preview image */}
              <div className="flex items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-56 overflow-hidden">
                <img
                  src={pendingCrop.imgUrl}
                  alt={pendingCrop.title}
                  className="max-h-48 object-contain rounded shadow-xs"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Động tác / Hình ảnh:
                </label>
                <input
                  type="text"
                  value={pendingCropTitle}
                  onChange={(e) => setPendingCropTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên động tác (VD: Động tác Vươn thở nhịp 1)..."
                />
              </div>

              {/* Grade and Folder Selection */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Lớp:</label>
                  <select
                    value={pendingCropGrade}
                    onChange={(e) => setPendingCropGrade(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="1">Khối Lớp 1</option>
                    <option value="3">Khối Lớp 3</option>
                    <option value="5">Khối Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thư Mục Mục Tiêu (Tự Động Phân Loại):</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('kyThuat')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 ${
                        pendingCropFolder === 'kyThuat'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🏃 Động Tác Mới
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('luyenTap')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 ${
                        pendingCropFolder === 'luyenTap'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      👥 Luyện Tập
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('troChoi')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 ${
                        pendingCropFolder === 'troChoi'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🎯 Trò Chơi Vận Động
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('troChoiKhoiDong')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 ${
                        pendingCropFolder === 'troChoiKhoiDong'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🎮 Trò Chơi K.Động
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('khoiDong')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 ${
                        pendingCropFolder === 'khoiDong'
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ⚡ Khởi Động Chung
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingCropFolder('vanDung')}
                      className={`px-2 py-1.5 rounded-lg text-left font-semibold border transition text-[11px] flex items-center gap-1 col-span-2 ${
                        pendingCropFolder === 'vanDung'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🌱 Vận Dụng & Hồi Tĩnh
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Bảo vệ thư viện:</strong> Ảnh chỉ được lưu vào Thư viện khi bạn bấm nút xác nhận bên dưới. Bạn cũng có thể bấm <strong>"Tải Về Máy (PNG)"</strong> ngay để lưu file vào máy tính.
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelPendingCrop}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  ❌ Huỷ Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPendingCrop}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition flex items-center gap-1.5"
                  title="Tải ảnh PNG vừa cắt trực tiếp về máy tính"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>💾 Tải Về Máy (PNG)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate3dFromPendingCrop}
                  disabled={generating3dScanId === 'pending_crop'}
                  className="px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Tạo nhân vật chuẩn SGK với nền trong suốt không chữ"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{generating3dScanId === 'pending_crop' ? 'Đang tạo...' : '🎨 Tái Tạo Ảnh SGK Trong Suốt'}</span>
                </button>

                <button
                  onClick={handleConfirmSavePendingCrop}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 Lưu Vào Thư Viện</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
