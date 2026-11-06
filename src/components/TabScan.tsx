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
  Check
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SgkImageItem, ImageCategory } from '../types/gdtc';
import {
  removeBackgroundCanvas,
  autoCropCanvas,
  smartExtendFloor,
} from '../utils/imageProcessing';
import { sgkCurriculumTree, SgkLessonFolder } from '../data/sgkCurriculumTree';
import { standardMovementsLibrary } from '../data/movementLibrary';
import { standardFormationDiagrams } from '../data/formationDiagrams';

// Set up pdf.js worker with local Vite asset URL
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface TabScanProps {
  onImageExtracted: (newImg: SgkImageItem) => void;
  onNavigateToGallery: () => void;
  onAnalyzeVision?: (img: SgkImageItem) => void;
  onOpenSmartClean?: (img: SgkImageItem) => void;
}

export const TabScan: React.FC<TabScanProps> = ({
  onImageExtracted,
  onNavigateToGallery,
  onAnalyzeVision,
  onOpenSmartClean,
}) => {
  // Active Grade & Textbook selection
  const [selectedGrade, setSelectedGrade] = useState<1 | 3 | 5>(1);
  const [fileName, setFileName] = useState<string>('SGK GDTC Lớp 1 (Kết nối tri thức)');
  const [currentPage, setCurrentPage] = useState<number>(28); // Default to Bài 1 (Trang 28 PDF)
  const [totalPages, setTotalPages] = useState<number>(97);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Đang mở trang sách...');
  const [zoomScale, setZoomScale] = useState<number>(0.85); // Cố định canvas xem trang sách ở 85% theo yêu cầu

  // Search by Lesson or Movement
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('k1_cd2_b1');
  const [selectedSubCategory, setSelectedSubCategory] = useState<'khoiDong' | 'troChoiKhoiDong' | 'kyThuat' | 'luyenTap' | 'vanDung'>('kyThuat');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<'all' | 'dhdn' | 'the_duc' | 'knvd' | 'bong_ro' | 'boi'>('all');

  // Extraction states & Auto-save prevention
  const [autoSaveOnCrop, setAutoSaveOnCrop] = useState<boolean>(false); // Mặc định FALSE: chỉ quét khi người dùng bấm Lưu
  const [pendingCrop, setPendingCrop] = useState<SgkImageItem | null>(null);
  const [pendingCropTitle, setPendingCropTitle] = useState<string>('');
  const [pendingCropGrade, setPendingCropGrade] = useState<string>('1');
  const [pendingCropFolder, setPendingCropFolder] = useState<'khoiDong' | 'troChoiKhoiDong' | 'kyThuat' | 'luyenTap' | 'vanDung'>('kyThuat');

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

  // Map grade to default local PDF file
  const gradePdfMap = {
    1: { file: '/assets/aistudio/SGK_GDTC1_8dda41ef.pdf', name: 'SGK GDTC Lớp 1 (Kết nối tri thức)', defaultPage: 28 },
    3: { file: '/assets/aistudio/SGK_GDTC_3_e88153f9.pdf', name: 'SGK GDTC Lớp 3 (Kết nối tri thức)', defaultPage: 27 },
    5: { file: '/assets/aistudio/SGK_GDTC_5_fe099e32.pdf', name: 'SGK GDTC Lớp 5 (Kết nối tri thức)', defaultPage: 25 },
  };

  // Load Grade PDF on mount or grade switch
  useEffect(() => {
    loadPdfFromPath(gradePdfMap[selectedGrade].file, gradePdfMap[selectedGrade].name, gradePdfMap[selectedGrade].defaultPage);
  }, [selectedGrade]);

  // Tự động đồng bộ bài học & thư mục con (Kỹ thuật động tác mới vs Luyện tập) theo khối lớp và số trang hiện tại
  useEffect(() => {
    const matched = sgkCurriculumTree.find(
      (f) => f.grade === selectedGrade && currentPage >= f.startPage && currentPage <= f.endPage
    ) || sgkCurriculumTree.find((f) => f.grade === selectedGrade);

    if (matched) {
      setSelectedFolderId(matched.id);

      // Phân biệt chính xác Kỹ thuật mới vs Luyện tập dựa trên dữ liệu trang chuẩn của SGK
      const isLuyenTap = matched.subFolders.luyenTap.items.some((it) => it.page === currentPage);
      const isKyThuat = matched.subFolders.kyThuat.items.some((it) => it.page === currentPage);
      const isKhoiDong = matched.subFolders.khoiDong.suggestedPage === currentPage;
      const isVanDung = matched.subFolders.vanDung.suggestedPage === currentPage;

      if (isLuyenTap) {
        setSelectedSubCategory('luyenTap');
      } else if (isKyThuat) {
        setSelectedSubCategory('kyThuat');
      } else if (isKhoiDong) {
        setSelectedSubCategory('khoiDong');
      } else if (isVanDung) {
        setSelectedSubCategory('vanDung');
      }
    }
  }, [selectedGrade, currentPage]);

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

    const matchedFolder = sgkCurriculumTree.find(
      (f) => f.grade === selectedGrade && pageNum >= f.startPage && pageNum <= f.endPage
    ) || sgkCurriculumTree.find((f) => f.id === selectedFolderId);

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

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
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
    const activeFolder = sgkCurriculumTree.find(
      (f) => f.grade === selectedGrade && currentPage >= f.startPage && currentPage <= f.endPage
    ) || sgkCurriculumTree.find((f) => f.id === selectedFolderId) ||
         sgkCurriculumTree.find((f) => f.grade === selectedGrade);

    // 2. Tự động phân loại: Đâu là Kỹ thuật động tác mới, đâu là Luyện tập, đâu là Trò chơi khởi động
    let autoFolder: 'khoiDong' | 'troChoiKhoiDong' | 'kyThuat' | 'luyenTap' | 'vanDung' = selectedSubCategory;
    let autoTitle = customTitle || '';

    if (!autoTitle && activeFolder) {
      const kyThuatItem = activeFolder.subFolders.kyThuat.items.find((it) => it.page === currentPage);
      const luyenTapItem = activeFolder.subFolders.luyenTap.items.find((it) => it.page === currentPage);
      const troChoiItem = activeFolder.subFolders.troChoiKhoiDong?.items?.find((it) => it.page === currentPage);

      if (troChoiItem) {
        autoFolder = 'troChoiKhoiDong';
        autoTitle = `${troChoiItem.name} - Trò chơi khởi động (Trang ${currentPage})`;
      } else if (luyenTapItem) {
        autoFolder = 'luyenTap';
        autoTitle = `${luyenTapItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (kyThuatItem) {
        autoFolder = 'kyThuat';
        autoTitle = `${kyThuatItem.name} - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
      } else if (activeFolder.subFolders.khoiDong.suggestedPage === currentPage) {
        autoFolder = 'khoiDong';
        autoTitle = `Khởi động - ${activeFolder.lessonName.split(':')[1]?.trim() || activeFolder.lessonName} (Trang ${currentPage})`;
      } else if (activeFolder.subFolders.vanDung.suggestedPage === currentPage) {
        autoFolder = 'vanDung';
        autoTitle = `Vận dụng - ${activeFolder.lessonName.split(':')[1]?.trim() || activeFolder.lessonName} (Trang ${currentPage})`;
      } else {
        const lessonTitle = activeFolder.lessonName.split(':')[1]?.trim() || activeFolder.lessonName;
        const pageOffset = currentPage - activeFolder.startPage;
        if (pageOffset <= 1) {
          autoFolder = 'kyThuat';
          autoTitle = `Kỹ thuật động tác mới - ${lessonTitle} (Trang ${currentPage})`;
        } else if (pageOffset >= 2 && pageOffset < (activeFolder.endPage - activeFolder.startPage)) {
          autoFolder = 'luyenTap';
          autoTitle = `Luyện tập - ${lessonTitle} (Trang ${currentPage})`;
        } else {
          autoFolder = 'vanDung';
          autoTitle = `Vận dụng - ${lessonTitle} (Trang ${currentPage})`;
        }
      }
    }

    if (!autoTitle) {
      autoTitle = `Động tác thể dục - SGK Lớp ${selectedGrade} (Trang ${currentPage})`;
    }

    // Determine category from autoFolder
    let cat: ImageCategory = 'dong_tac';
    if (autoFolder === 'khoiDong') cat = 'khoi_dong';
    else if (autoFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
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

  // Jump to specific Lesson in the Curriculum Tree
  const handleSelectLessonFolder = (folder: SgkLessonFolder, subCat: 'khoiDong' | 'kyThuat' | 'luyenTap' | 'vanDung', specificPage?: number) => {
    setSelectedFolderId(folder.id);
    setSelectedSubCategory(subCat);
    setSelectedGrade(folder.grade);

    let targetPage = specificPage;
    if (!targetPage) {
      if (subCat === 'kyThuat') targetPage = folder.subFolders.kyThuat.items[0]?.page || folder.startPage;
      else if (subCat === 'khoiDong') targetPage = folder.subFolders.khoiDong.suggestedPage;
      else if (subCat === 'luyenTap') targetPage = folder.subFolders.luyenTap.items[0]?.page || folder.startPage;
      else if (subCat === 'vanDung') targetPage = folder.subFolders.vanDung.suggestedPage;
      else targetPage = folder.startPage;
    }
    handlePageChange(targetPage);
  };

  // Filter lessons for the Tree View
  const filteredTree = useMemo(() => {
    return sgkCurriculumTree.filter((f) => {
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

      const matchQuery =
        !searchQuery ||
        f.lessonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.movements.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchGrade && matchTopic && matchQuery;
    });
  }, [selectedGrade, selectedTopicFilter, searchQuery]);

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
        {/* 1. Left Column: Hierarchical Curriculum Tree Navigation */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col max-h-[750px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span>Cây Thư Mục SGK (Khối {selectedGrade})</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {filteredTree.length} bài
            </span>
          </div>

          {/* Quick Topic Filter Buttons */}
          <div className="flex flex-wrap gap-1 pb-2 mb-2.5 border-b border-slate-100">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'dhdn', label: 'ĐHĐN' },
              { id: 'the_duc', label: selectedGrade === 5 ? 'TD gậy' : 'Bài TD' },
              { id: 'knvd', label: 'KN Vận động' },
              { id: 'bong_ro', label: '🏀 Bóng rổ' },
              { id: 'boi', label: '🏊 Bơi lội' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTopicFilter(tab.id as any)}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold transition ${
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
              return (
                <div
                  key={lesson.id}
                  className={`border rounded-xl p-2.5 transition ${
                    isSelected ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Topic Tag */}
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                    {lesson.topicName}
                  </p>

                  {/* Lesson Title */}
                  <div
                    onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage)}
                    className="font-bold text-slate-800 text-xs mt-1 cursor-pointer hover:text-blue-700 leading-snug flex items-start gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{lesson.lessonName}</span>
                  </div>

                  {/* 4 Standard Sub-folders */}
                  <div className="mt-2 pl-3 space-y-1 border-l-2 border-slate-200 text-[11px]">
                    {/* 1. Khởi động */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'khoiDong', lesson.subFolders.khoiDong.suggestedPage)}
                      className={`cursor-pointer py-0.5 px-1.5 rounded flex items-center justify-between ${
                        isSelected && selectedSubCategory === 'khoiDong' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      <span>📁 1. Ảnh Khởi động</span>
                      <span className="text-[10px] text-slate-400">P.{lesson.subFolders.khoiDong.suggestedPage}</span>
                    </div>

                    {/* 2. Kỹ thuật động tác */}
                    <div className="space-y-0.5">
                      <div
                        onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage)}
                        className={`cursor-pointer py-0.5 px-1.5 rounded flex items-center justify-between ${
                          isSelected && selectedSubCategory === 'kyThuat' ? 'bg-blue-600 text-white font-bold' : 'text-blue-700 font-semibold hover:bg-blue-100'
                        }`}
                      >
                        <span>📁 2. Ảnh Kỹ thuật Động tác</span>
                        <span className="text-[10px] opacity-80">({lesson.subFolders.kyThuat.items.length})</span>
                      </div>
                      {lesson.subFolders.kyThuat.items.map((it, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectLessonFolder(lesson, 'kyThuat', it.page)}
                          className="pl-3.5 py-0.5 text-[10.5px] text-slate-600 hover:text-blue-600 cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate max-w-[140px]">• {it.name}</span>
                          <span className="text-[10px] text-slate-400">P.{it.page}</span>
                        </div>
                      ))}
                    </div>

                    {/* 3. Luyện tập */}
                    <div className="space-y-0.5">
                      <div
                        onClick={() => handleSelectLessonFolder(lesson, 'luyenTap', lesson.subFolders.luyenTap.items[0]?.page || lesson.startPage + 1)}
                        className={`cursor-pointer py-0.5 px-1.5 rounded flex items-center justify-between ${
                          isSelected && selectedSubCategory === 'luyenTap' ? 'bg-indigo-100 text-indigo-900 font-bold' : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <span>📁 3. Ảnh Luyện tập (Cá nhân, Cặp đôi, Tổ)</span>
                      </div>
                    </div>

                    {/* 4. Vận dụng */}
                    <div
                      onClick={() => handleSelectLessonFolder(lesson, 'vanDung', lesson.subFolders.vanDung.suggestedPage)}
                      className={`cursor-pointer py-0.5 px-1.5 rounded flex items-center justify-between ${
                        isSelected && selectedSubCategory === 'vanDung' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      <span>📁 4. Ảnh Vận dụng & Đời sống</span>
                      <span className="text-[10px] text-slate-400">P.{lesson.subFolders.vanDung.suggestedPage}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Center Column: Large Expanded Canvas Viewport */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-700 relative overflow-auto custom-scrollbar flex items-center justify-center p-4 min-h-[640px] max-h-[750px]">
          {/* Instruction Tooltip Overlay */}
          <div className="absolute top-4 left-4 z-20 bg-slate-800/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs flex items-center gap-2 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${autoSaveOnCrop ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            <span>
              {autoSaveOnCrop
                ? '⚡ Chế độ tự lưu: Nhả chuột sẽ lưu ảnh ngay'
                : '🛡️ Chế độ an toàn: Kéo chọn xong sẽ hiện hộp thoại xác nhận trước khi lưu'}
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
              recentExtracted.map((img) => (
                <div
                  key={img.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 hover:border-blue-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={img.imgUrl}
                      alt={img.title}
                      className="w-16 h-16 object-contain rounded-lg border bg-white shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-800 truncate">{img.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{img.caption}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px]">
                        <span className="text-blue-700 bg-blue-50 font-bold px-1.5 py-0.5 rounded">
                          Khối {img.grade} · Trang {img.page}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                          {img.category === 'dong_tac' ? 'Động tác' : 'Tập luyện'}
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
              ))
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
                      🎯 Vận Dụng & Thực Tiễn
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
