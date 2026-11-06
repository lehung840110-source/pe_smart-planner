import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Eraser,
  Sparkles,
  Scissors,
  Check,
  RotateCcw,
  Crop,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Download,
  PlusCircle
} from 'lucide-react';
import { SgkImageItem } from '../types/gdtc';
import {
  removeBackgroundCanvas,
  autoCropCanvas,
  enhanceContrastCanvas,
  smartCleanTextAndWatermarks,
  cropCanvasArea,
  loadImage
} from '../utils/imageProcessing';

interface SmartCleanModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageItem: SgkImageItem | null;
  onSaveCleanedImage: (updatedImg: SgkImageItem) => void;
  onSaveAsNewImage?: (newImg: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

export const SmartCleanModal: React.FC<SmartCleanModalProps> = ({
  isOpen,
  onClose,
  imageItem,
  onSaveCleanedImage,
  onSaveAsNewImage,
  showToast,
}) => {
  const [currentDataUrl, setCurrentDataUrl] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [eraserSize, setEraserSize] = useState<number>(24);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'eraser' | 'crop' | 'none'>('crop');

  // Save as new image state
  const [isSaveAsNewOpen, setIsSaveAsNewOpen] = useState<boolean>(false);
  const [newImageTitle, setNewImageTitle] = useState<string>('');
  const [newImageFolder, setNewImageFolder] = useState<string>('kyThuat');

  // Manual Crop Rect state in canvas pixel coordinates
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const isCroppingDragRef = useRef<boolean>(false);
  const cropStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDownRef = useRef<boolean>(false);

  useEffect(() => {
    if (imageItem) {
      setCurrentDataUrl(imageItem.imgUrl);
      setHistory([imageItem.imgUrl]);
      setCropRect(null);
      setNewImageTitle(`${imageItem.title} (bản xử lý)`);
      setNewImageFolder(imageItem.category || 'kyThuat');
      setIsSaveAsNewOpen(false);
      renderToCanvas(imageItem.imgUrl);
    }
  }, [imageItem, isOpen]);

  const renderToCanvas = async (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const img = await loadImage(url);
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    } catch (e) {
      console.warn('Canvas render error', e);
    }
  };

  if (!isOpen || !imageItem) return null;

  const pushState = (newUrl: string) => {
    setCurrentDataUrl(newUrl);
    setHistory((prev) => [...prev.slice(-8), newUrl]);
    setCropRect(null);
    renderToCanvas(newUrl);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const prev = history[history.length - 2];
      setHistory((h) => h.slice(0, -1));
      setCurrentDataUrl(prev);
      setCropRect(null);
      renderToCanvas(prev);
      showToast('Đã khôi phục thao tác trước!');
    }
  };

  // 1-Click: Auto remove text banner & icons above students
  const handleSmartStripHeader = async () => {
    setIsProcessing(true);
    showToast('Đang lọc bỏ chữ tiêu đề và các icon trang trí phụ...');
    try {
      const cleaned = await smartCleanTextAndWatermarks(currentDataUrl, true, 38);
      pushState(cleaned);
      showToast('Đã xóa sạch chữ tiêu đề và icon thừa, giữ nguyên học sinh!');
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click: Transparent Background
  const handleRemoveBg = async () => {
    setIsProcessing(true);
    showToast('Đang bóc tách nền trong suốt trên Canvas...');
    try {
      const transparent = await removeBackgroundCanvas(currentDataUrl, 38, true);
      pushState(transparent);
      showToast('Đã chuyển nền giấy sang trong suốt!');
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click: Auto Crop
  const handleAutoCrop = async () => {
    setIsProcessing(true);
    try {
      const cropped = await autoCropCanvas(currentDataUrl);
      pushState(cropped);
      showToast('Đã căn lề sát viền học sinh!');
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click: Enhance Contrast & Clean Watermarks
  const handleEnhanceWatermark = async () => {
    setIsProcessing(true);
    showToast('Đang xóa watermark và làm nét viền nét vẽ...');
    try {
      const enhanced = await enhanceContrastCanvas(currentDataUrl);
      pushState(enhanced);
      showToast('Đã xóa watermark thành công!');
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual Eraser Canvas Events
  const eraseAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'eraser') {
      isMouseDownRef.current = true;
      eraseAt(e.clientX, e.clientY);
    } else if (activeTool === 'crop') {
      isCroppingDragRef.current = true;
      cropStartRef.current = { x, y };
      setCropRect({ x, y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (activeTool === 'eraser' && isMouseDownRef.current) {
      eraseAt(e.clientX, e.clientY);
    } else if (activeTool === 'crop' && isCroppingDragRef.current) {
      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;
      const startX = cropStartRef.current.x;
      const startY = cropStartRef.current.y;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const w = Math.abs(currentX - startX);
      const h = Math.abs(currentY - startY);
      setCropRect({ x, y, w, h });
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'eraser' && isMouseDownRef.current && canvasRef.current) {
      isMouseDownRef.current = false;
      const updatedUrl = canvasRef.current.toDataURL('image/png');
      setCurrentDataUrl(updatedUrl);
      setHistory((prev) => [...prev.slice(-8), updatedUrl]);
    }
    isMouseDownRef.current = false;
    isCroppingDragRef.current = false;
  };

  // Execute manual crop
  const handleApplyManualCrop = async () => {
    if (!cropRect || cropRect.w < 10 || cropRect.h < 10) {
      showToast('Vui lòng kéo chuột trên ảnh để chọn vùng cần cắt!');
      return;
    }
    setIsProcessing(true);
    try {
      const cropped = await cropCanvasArea(
        currentDataUrl,
        cropRect.x,
        cropRect.y,
        cropRect.w,
        cropRect.h
      );
      pushState(cropped);
      setCropRect(null);
      showToast(`✂️ Đã cắt vùng ảnh ${Math.round(cropRect.w)}x${Math.round(cropRect.h)}px!`);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCrop = () => {
    setCropRect(null);
  };

  const handleSaveAndApply = () => {
    const updated: SgkImageItem = {
      ...imageItem,
      imgUrl: currentDataUrl,
    };
    onSaveCleanedImage(updated);
    showToast(`Đã cập nhật ảnh gốc cho "${updated.title}"!`);
    onClose();
  };

  const handleConfirmSaveAsNew = () => {
    if (!newImageTitle.trim()) {
      showToast('Vui lòng nhập tên cho hình ảnh mới!');
      return;
    }
    const newId = `img_clean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newImg: SgkImageItem = {
      id: newId,
      title: newImageTitle.trim(),
      category: newImageFolder as any,
      grade: String(imageItem?.grade || '1'),
      page: imageItem?.page || 1,
      imgUrl: currentDataUrl,
      caption: `Ảnh đã xử lý từ: ${imageItem?.title || 'SGK GDTC'}`
    };

    if (onSaveAsNewImage) {
      onSaveAsNewImage(newImg);
    } else {
      onSaveCleanedImage(newImg);
    }
    showToast(`✅ Đã lưu ảnh mới "${newImg.title}" vào thư mục!`);
    onClose();
  };

  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = currentDataUrl;
    const cleanFileName = (imageItem.title || 'anh_sgk_gdtc')
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '_');
    a.download = `${cleanFileName}_da_xu_ly.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('💾 Đang tải ảnh PNG đã xử lý về máy tính!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200 flex flex-col h-[90vh] max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Scissors className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Xưởng Xử Lý Ảnh SGK & Cắt Xén Tương Tác
              </h3>
              <p className="text-[11px] text-slate-500">
                Kéo chuột cắt vùng ảnh, tách nền trong suốt, tẩy chữ tiêu đề và xóa vệt watermark
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Action Toolbar */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTool(activeTool === 'crop' ? 'none' : 'crop')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTool === 'crop'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
              title="Kéo chuột trên ảnh để tự do chọn vùng muốn cắt"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{activeTool === 'crop' ? '✂️ Đang Bật Cắt Kéo Tay' : '✂️ Cắt Kéo Tay'}</span>
            </button>

            <button
              onClick={() => setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
              }`}
              title="Rê cọ tẩy thủ công xóa chữ hoặc icon bất kỳ"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{activeTool === 'eraser' ? '🖌️ Đang Bật Cọ Tẩy' : '🖌️ Cọ Tẩy Thủ Công'}</span>
            </button>

            <button
              onClick={handleSmartStripHeader}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition"
              title="Tự động xóa sạch dòng chữ tiêu đề và icon thừa trên đỉnh ảnh"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Tự Động Lọc Bỏ Chữ & Icon Thừa
            </button>

            <button
              onClick={handleRemoveBg}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs transition"
              title="Chuyển nền giấy sang trong suốt hoàn toàn"
            >
              <Scissors className="w-3.5 h-3.5" /> Tách Nền Trong Suốt
            </button>

            <button
              onClick={handleEnhanceWatermark}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs transition"
              title="Làm nét đường vẽ đen và tẩy mờ watermark chìm"
            >
              <Layers className="w-3.5 h-3.5" /> Xóa Watermark
            </button>

            <button
              onClick={handleAutoCrop}
              disabled={isProcessing}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1.5 px-2 rounded-lg flex items-center gap-1 transition"
              title="Căn sát lề thân người"
            >
              <Crop className="w-3.5 h-3.5" /> Căn Lề Tự Động
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 border rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition"
              title="Hoàn tác bước trước"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool contextual bar */}
        {activeTool === 'eraser' && (
          <div className="flex items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-200 p-2 rounded-xl text-xs mb-3 animate-in fade-in">
            <span className="text-[11px] font-semibold text-indigo-900">
              🖌️ Rê chuột trực tiếp lên chi tiết chữ hoặc icon cần tẩy xóa.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Cỡ cọ: {eraserSize}px</span>
              <input
                type="range"
                min="8"
                max="60"
                value={eraserSize}
                onChange={(e) => setEraserSize(parseInt(e.target.value, 10))}
                className="w-24 accent-indigo-600"
              />
            </div>
          </div>
        )}

        {activeTool === 'crop' && (
          <div className="flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 p-2 rounded-xl text-xs mb-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-blue-900">
              <span className="font-semibold">✂️ Kéo chuột trên ảnh để vẽ khung cắt.</span>
              {cropRect && cropRect.w > 10 && cropRect.h > 10 && (
                <span className="bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                  {Math.round(cropRect.w)} × {Math.round(cropRect.h)} px
                </span>
              )}
            </div>

            {cropRect && cropRect.w > 10 && cropRect.h > 10 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCancelCrop}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg bg-white transition"
                >
                  Hủy Vùng Chọn
                </button>
                <button
                  onClick={handleApplyManualCrop}
                  disabled={isProcessing}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-2xs transition"
                >
                  <Check className="w-3.5 h-3.5" /> Cắt Vùng Đã Chọn
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interactive Canvas Workspace */}
        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar bg-slate-200/90 rounded-xl border border-slate-300 flex items-center justify-center p-3 relative">
          <div className="relative shadow-md rounded-lg overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100">
            <canvas
              ref={canvasRef}
              className={`block max-h-[46vh] max-w-full ${
                activeTool === 'eraser'
                  ? 'cursor-crosshair'
                  : activeTool === 'crop'
                  ? 'cursor-crosshair'
                  : 'cursor-default'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {/* Visual Crop Box Overlay */}
            {activeTool === 'crop' && cropRect && cropRect.w > 5 && cropRect.h > 5 && canvasRef.current && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none"
                style={{
                  left: `${(cropRect.x / canvasRef.current.width) * 100}%`,
                  top: `${(cropRect.y / canvasRef.current.height) * 100}%`,
                  width: `${(cropRect.w / canvasRef.current.width) * 100}%`,
                  height: `${(cropRect.h / canvasRef.current.height) * 100}%`,
                }}
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] px-1 font-mono font-bold">
                  {Math.round(cropRect.w)}×{Math.round(cropRect.h)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save As New Image Inline Drawer */}
        {isSaveAsNewOpen && (
          <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 my-2 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <span className="font-bold text-purple-900 shrink-0">📁 Tên ảnh mới:</span>
              <input
                type="text"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Nhập tên ảnh..."
                className="flex-1 bg-white border border-purple-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-purple-900 text-[11px]">Thư mục:</span>
              <select
                value={newImageFolder}
                onChange={(e) => setNewImageFolder(e.target.value)}
                className="bg-white border border-purple-300 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="kyThuat">🤸 Kỹ thuật động tác</option>
                <option value="troChoiKhoiDong">🎮 Trò chơi khởi động</option>
                <option value="luyenTap">🏃 Luyện tập thể lực</option>
                <option value="vanDung">⭐ Vận dụng thực tế</option>
              </select>
              <button
                type="button"
                onClick={handleConfirmSaveAsNew}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-2xs transition"
              >
                Xác Nhận Lưu
              </button>
              <button
                type="button"
                onClick={() => setIsSaveAsNewOpen(false)}
                className="px-2 py-1 text-slate-500 hover:text-slate-700 border border-slate-300 bg-white rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Footer (Sticky & Always Visible) */}
        <div className="flex flex-wrap justify-between items-center pt-2.5 border-t border-slate-100 mt-2 text-xs shrink-0 gap-2">
          <p className="text-slate-400 text-[11px] hidden sm:block">
            Thầy Cô có thể tải ảnh về máy tính hoặc lưu thành ảnh mới vào thư viện.
          </p>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
              title="Tải ảnh PNG đã xử lý về máy tính"
            >
              <Download className="w-3.5 h-3.5" /> Tải Về Máy
            </button>
            <button
              type="button"
              onClick={() => setIsSaveAsNewOpen(!isSaveAsNewOpen)}
              className={`px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5 transition ${
                isSaveAsNewOpen
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-600" /> Lưu Thành Ảnh Mới
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
            >
              <Check className="w-3.5 h-3.5" /> Cập Nhật Ảnh Gốc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
