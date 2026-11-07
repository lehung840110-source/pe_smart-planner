import React, { useState, useRef, useId } from 'react';
import {
  X,
  Upload,
  Images,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  FileSpreadsheet,
  Tag,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { SgkImageItem, ImageCategory, SubFolderType } from '../types/gdtc';
import { sgkCurriculumTree, SgkLessonFolder } from '../data/sgkCurriculumTree';

interface BatchImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportImages: (newImages: SgkImageItem[]) => void;
  defaultGrade?: string;
  showToast: (msg: string) => void;
}

interface PendingImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  grade: string; // '1' | '3' | '5'
  folder: SubFolderType;
  category: ImageCategory;
  topicId?: string;
  topicTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  status: 'ready' | 'uploading' | 'done' | 'error';
}

/**
 * Smart automatic detector from filename:
 * e.g., "K1_Bài 2_Động tác chân.jpg" => Grade 1, Topic 2, Dong tac
 * "k3_tam_giac.png" => Grade 3, Tro choi
 * "k5_vuon_tho.jpg" => Grade 5, Dong tac
 */
export function autoDetectMetadataFromFilename(
  filename: string,
  fallbackGrade: string = '1'
): {
  title: string;
  grade: string;
  folder: SubFolderType;
  category: ImageCategory;
  topicId?: string;
  topicTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
} {
  const lower = filename.toLowerCase();
  const cleanTitle = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();

  // Detect grade
  let detectedGrade = fallbackGrade === 'all' ? '1' : fallbackGrade;
  if (lower.includes('k1') || lower.includes('khoi 1') || lower.includes('khoi1') || lower.includes('lop 1') || lower.includes('lop1')) {
    detectedGrade = '1';
  } else if (lower.includes('k3') || lower.includes('khoi 3') || lower.includes('khoi3') || lower.includes('lop 3') || lower.includes('lop3')) {
    detectedGrade = '3';
  } else if (lower.includes('k5') || lower.includes('khoi 5') || lower.includes('khoi5') || lower.includes('lop 5') || lower.includes('lop5')) {
    detectedGrade = '5';
  }

  // Detect category & folder
  let folder: SubFolderType = 'kyThuat';
  let category: ImageCategory = 'dong_tac';

  if (lower.includes('tro choi') || lower.includes('tc_') || lower.includes('game') || lower.includes('ket ban') || lower.includes('tiep suc')) {
    folder = 'troChoi';
    category = 'tro_choi';
  } else if (lower.includes('luyen tap') || lower.includes('nhom') || lower.includes('cap') || lower.includes('doi hinh')) {
    folder = 'luyenTap';
    category = 'tap_luyen';
  } else if (lower.includes('van dung') || lower.includes('thuc te') || lower.includes('tinh huong')) {
    folder = 'vanDung';
    category = 'van_dung';
  } else if (lower.includes('khoi dong') || lower.includes('xoay khop')) {
    folder = 'khoiDong';
    category = 'khoi_dong';
  }

  // Match with curriculum tree
  const gNum = parseInt(detectedGrade, 10);
  const lessonsForGrade = sgkCurriculumTree.filter((item) => item.grade === gNum);

  let matchedLesson: SgkLessonFolder | undefined;
  if (lessonsForGrade.length > 0) {
    // Try matching lesson name or movements
    matchedLesson = lessonsForGrade.find((l) => {
      const lNameLower = l.lessonName.toLowerCase();
      if (lower.includes(lNameLower) || lower.includes(l.lessonId.toLowerCase())) return true;
      return l.movements?.some((m) => lower.includes(m.toLowerCase()));
    });
    // Fallback to first lesson in grade if none matches
    if (!matchedLesson) {
      matchedLesson = lessonsForGrade[0];
    }
  }

  return {
    title: cleanTitle,
    grade: detectedGrade,
    folder,
    category,
    topicId: matchedLesson?.topicId,
    topicTitle: matchedLesson?.topicName,
    lessonId: matchedLesson?.lessonId,
    lessonTitle: matchedLesson?.lessonName
  };
}

export const BatchImageUploadModal: React.FC<BatchImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImportImages,
  defaultGrade = '1',
  showToast
}) => {
  const [pendingList, setPendingList] = useState<PendingImageItem[]>([]);
  const [isProcessingZip, setIsProcessingZip] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [selectedTargetGrade, setSelectedTargetGrade] = useState<string>(
    defaultGrade === 'all' ? '1' : defaultGrade
  );
  const [selectedTargetFolder, setSelectedTargetFolder] = useState<SubFolderType>('kyThuat');
  const [applyFolderToAll, setApplyFolderToAll] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Read files and populate preview
  const handleAddFiles = (files: FileList | File[]) => {
    const newItems: PendingImageItem[] = [];

    Array.from(files).forEach((file) => {
      // check if image
      if (!file.type.startsWith('image/') && !file.name.match(/\.(png|jpe?g|webp|svg|jfif)$/i)) {
        return;
      }

      const meta = autoDetectMetadataFromFilename(
        file.name,
        selectedTargetGrade
      );

      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        id: 'pending_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        file,
        previewUrl,
        name: meta.title,
        grade: meta.grade,
        folder: applyFolderToAll ? selectedTargetFolder : meta.folder,
        category: meta.category,
        topicId: meta.topicId,
        topicTitle: meta.topicTitle,
        lessonId: meta.lessonId,
        lessonTitle: meta.lessonTitle,
        status: 'ready'
      });
    });

    if (newItems.length === 0) {
      showToast('⚠️ Không tìm thấy tệp hình ảnh hợp lệ (PNG, JPG, WEBP, SVG)!');
      return;
    }

    setPendingList((prev) => [...prev, ...newItems]);
    showToast(`📸 Đã thêm ${newItems.length} hình ảnh vào danh sách tải lên!`);
  };

  // Handle ZIP unpacking
  const handleZipFile = async (zipFile: File) => {
    setIsProcessingZip(true);
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(zipFile);
      const newItems: PendingImageItem[] = [];

      for (const [relativePath, fileObj] of Object.entries(content.files)) {
        if (fileObj.dir) continue;
        if (!relativePath.match(/\.(png|jpe?g|webp|svg|jfif)$/i)) continue;

        const blob = await fileObj.async('blob');
        const filename = relativePath.split('/').pop() || 'image.png';
        const file = new File([blob], filename, { type: blob.type || 'image/png' });

        const meta = autoDetectMetadataFromFilename(filename, selectedTargetGrade);
        const previewUrl = URL.createObjectURL(blob);

        newItems.push({
          id: 'zip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          file,
          previewUrl,
          name: meta.title,
          grade: meta.grade,
          folder: applyFolderToAll ? selectedTargetFolder : meta.folder,
          category: meta.category,
          topicId: meta.topicId,
          topicTitle: meta.topicTitle,
          lessonId: meta.lessonId,
          lessonTitle: meta.lessonTitle,
          status: 'ready'
        });
      }

      if (newItems.length === 0) {
        showToast('⚠️ Tệp ZIP không chứa tệp ảnh nào hợp lệ.');
      } else {
        setPendingList((prev) => [...prev, ...newItems]);
        showToast(`📦 Đã giải nén thành công ${newItems.length} ảnh từ tệp ZIP!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`❌ Lỗi khi đọc file ZIP: ${err?.message || err}`);
    } finally {
      setIsProcessingZip(false);
    }
  };

  // Convert File to Base64 data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Final commit to image library
  const handleCommitUpload = async () => {
    if (pendingList.length === 0) return;
    setIsImporting(true);

    try {
      const convertedItems: SgkImageItem[] = [];

      for (const item of pendingList) {
        const dataUrl = await fileToDataUrl(item.file);
        const sgkItem: SgkImageItem = {
          id: 'img_user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: item.name,
          grade: item.grade,
          topicId: item.topicId,
          topicTitle: item.topicTitle,
          lessonId: item.lessonId,
          lessonTitle: item.lessonTitle,
          folder: item.folder,
          page: 1,
          category: item.category,
          imgUrl: dataUrl,
          caption: `Tải lên hàng loạt vào Khối ${item.grade} - ${item.folder}`,
          selected: false,
          createdAt: Date.now()
        };
        convertedItems.push(sgkItem);
      }

      onImportImages(convertedItems);
      showToast(`🎉 Đã tải lên và lưu trữ thành công ${convertedItems.length} hình ảnh vào kho thư viện!`);
      setPendingList([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(`❌ Lỗi khi lưu ảnh: ${err?.message || err}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemovePending = (id: string) => {
    setPendingList((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleClearAll = () => {
    pendingList.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingList([]);
  };

  const handleGradeBatchChange = (newGrade: string) => {
    setSelectedTargetGrade(newGrade);
    setPendingList((prev) =>
      prev.map((item) => ({
        ...item,
        grade: newGrade
      }))
    );
  };

  const handleFolderBatchChange = (newFolder: SubFolderType) => {
    setSelectedTargetFolder(newFolder);
    setPendingList((prev) =>
      prev.map((item) => ({
        ...item,
        folder: newFolder,
        category:
          newFolder === 'troChoi'
            ? 'tro_choi'
            : newFolder === 'luyenTap'
            ? 'tap_luyen'
            : newFolder === 'vanDung'
            ? 'van_dung'
            : newFolder === 'khoiDong'
            ? 'khoi_dong'
            : 'dong_tac'
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Tải Lên Hàng Loạt Hình Ảnh SGK
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  Tự Động Phân Loại
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên nhiều file ảnh cùng lúc hoặc giải nén từ file ZIP, không cần quét lại từ đầu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Upload Method Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Multiple files */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition mb-2">
                <Images className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">Chọn Nhiều File Ảnh</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Giữ Ctrl / Shift để chọn nhiều ảnh</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleAddFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </button>

            {/* ZIP archive */}
            <button
              onClick={() => zipInputRef.current?.click()}
              disabled={isProcessingZip}
              className="p-4 border-2 border-dashed border-purple-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer disabled:opacity-50"
            >
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition mb-2">
                {isProcessingZip ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                ) : (
                  <FileArchive className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800">Tải File Nén (.ZIP)</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Tự động giải nén và bóc tách kho ảnh</span>
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleZipFile(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </button>

            {/* Folder Upload */}
            <button
              onClick={() => folderInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition mb-2">
                <FolderTree className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800">Chọn Cả Thư Mục Ảnh</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Quét toàn bộ ảnh trong folder</span>
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                // @ts-ignore
                directory="true"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleAddFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </button>
          </div>

          {/* Quick Batch Options */}
          {pendingList.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Gán nhanh cho toàn bộ danh sách:</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Select Grade for All */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Khối:</span>
                    <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
                      {['1', '3', '5'].map((g) => (
                        <button
                          key={g}
                          onClick={() => handleGradeBatchChange(g)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                            selectedTargetGrade === g
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Khối {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Folder for All */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Thư mục:</span>
                    <select
                      value={selectedTargetFolder}
                      onChange={(e) => handleFolderBatchChange(e.target.value as SubFolderType)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
                    >
                      <option value="kyThuat">1. Động tác Kỹ thuật Mới</option>
                      <option value="luyenTap">2. Luyện tập & Đội hình</option>
                      <option value="troChoi">3. Trò chơi vận động</option>
                      <option value="khoiDong">4. Khởi động / Khớp</option>
                      <option value="vanDung">5. Vận dụng / Thực tế</option>
                    </select>
                  </div>

                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hết danh sách chờ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending List Table / Grid */}
          {pendingList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
              <Images className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Chưa có ảnh nào được chọn tải lên
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Nhấn một trong 3 nút phía trên để chọn file ảnh từ máy tính hoặc kéo thả thư mục vào đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Danh sách {pendingList.length} ảnh chuẩn bị nạp vào Thư Viện:</span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Sẵn sàng lưu vào IndexedDB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-1">
                {pendingList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl hover:shadow-xs transition group relative"
                  >
                    {/* Preview Image */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata Edit inline */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPendingList((prev) =>
                            prev.map((p) => (p.id === item.id ? { ...p, name: val } : p))
                          );
                        }}
                        className="text-xs font-bold text-slate-800 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden truncate"
                        title="Bấm để chỉnh sửa tên ảnh"
                      />

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Grade badge selector */}
                        <select
                          value={item.grade}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPendingList((prev) =>
                              prev.map((p) => (p.id === item.id ? { ...p, grade: val } : p))
                            );
                          }}
                          className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5"
                        >
                          <option value="1">K1</option>
                          <option value="3">K3</option>
                          <option value="5">K5</option>
                        </select>

                        {/* Folder selector */}
                        <select
                          value={item.folder}
                          onChange={(e) => {
                            const val = e.target.value as SubFolderType;
                            setPendingList((prev) =>
                              prev.map((p) =>
                                p.id === item.id
                                  ? {
                                      ...p,
                                      folder: val,
                                      category:
                                        val === 'troChoi'
                                          ? 'tro_choi'
                                          : val === 'luyenTap'
                                          ? 'tap_luyen'
                                          : val === 'vanDung'
                                          ? 'van_dung'
                                          : val === 'khoiDong'
                                          ? 'khoi_dong'
                                          : 'dong_tac'
                                    }
                                  : p
                              )
                            );
                          }}
                          className="text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 truncate max-w-[120px]"
                        >
                          <option value="kyThuat">Kỹ thuật</option>
                          <option value="luyenTap">Luyện tập</option>
                          <option value="troChoi">Trò chơi</option>
                          <option value="khoiDong">Khởi động</option>
                          <option value="vanDung">Vận dụng</option>
                        </select>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemovePending(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {pendingList.length > 0 ? (
              <span>Đã chuẩn bị <strong>{pendingList.length}</strong> ảnh để lưu vào Thư viện.</span>
            ) : (
              <span>Hỗ trợ định dạng: PNG, JPG, JPEG, WEBP, SVG, ZIP</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 rounded-xl text-xs transition"
            >
              Hủy
            </button>

            <button
              onClick={handleCommitUpload}
              disabled={pendingList.length === 0 || isImporting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu vào kho ảnh...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Nạp {pendingList.length > 0 ? `${pendingList.length} Ảnh` : ''} Vào Thư Viện</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
