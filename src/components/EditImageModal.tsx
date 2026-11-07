import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Upload,
  Clipboard,
  RotateCcw,
  BookOpen,
  Folder,
  Tag,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SgkImageItem, SubFolderType, ImageCategory } from '../types/gdtc';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageItem: SgkImageItem | null;
  onSave: (updatedItem: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

export const EditImageModal: React.FC<EditImageModalProps> = ({
  isOpen,
  onClose,
  imageItem,
  onSave,
  showToast,
}) => {
  const [title, setTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [grade, setGrade] = useState<'1' | '3' | '5'>('1');
  const [folder, setFolder] = useState<SubFolderType>('kyThuat');
  const [page, setPage] = useState<number | string>('');
  const [caption, setCaption] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [originalImgUrl, setOriginalImgUrl] = useState('');
  const [isReplaced, setIsReplaced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageItem && isOpen) {
      setTitle(imageItem.title || '');
      setLessonTitle(imageItem.lessonTitle || '');
      setGrade((imageItem.grade as '1' | '3' | '5') || '1');
      setFolder(imageItem.folder || 'kyThuat');
      setPage(imageItem.page || '');
      setCaption(imageItem.caption || '');
      setImgUrl(imageItem.imgUrl || '');
      setOriginalImgUrl(imageItem.imgUrl || '');
      setIsReplaced(false);
    }
  }, [imageItem, isOpen]);

  // Support Ctrl+V paste image directly from clipboard
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64) {
                setImgUrl(base64);
                setIsReplaced(true);
                showToast('✨ Đã dán ảnh mới từ Clipboard thành công!');
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, showToast]);

  if (!isOpen || !imageItem) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setImgUrl(base64);
        setIsReplaced(true);
        showToast(`✨ Đã nạp ảnh mới "${file.name}"!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setImgUrl(originalImgUrl);
    setIsReplaced(false);
    showToast('Đã khôi phục lại ảnh ban đầu!');
  };

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Vui lòng nhập tên/tiêu đề hình ảnh!');
      return;
    }

    let category: ImageCategory = 'dong_tac';
    if (folder === 'luyenTap') category = 'tap_luyen';
    else if (folder === 'vanDung') category = 'van_dung';
    else if (folder === 'troChoiKhoiDong') category = 'tro_choi_khoi_dong';
    else if (folder === 'troChoi') category = 'tro_choi';
    else if (folder === 'khoiDong') category = 'khoi_dong';

    const updated: SgkImageItem = {
      ...imageItem,
      title: title.trim(),
      lessonTitle: lessonTitle.trim(),
      grade,
      folder,
      category,
      page: page ? Number(page) || undefined : undefined,
      caption: caption.trim(),
      imgUrl
    };

    onSave(updated);
    showToast(`✅ Đã lưu thông tin mới cho "${title.trim()}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Chỉnh Sửa Thông Tin Hình Ảnh Thư Viện</span>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                  Khối Lớp {grade}
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Hiệu chỉnh chính xác tên động tác, bài học, số trang SGK, ghi chú kỹ thuật hoặc thay thế tệp ảnh mới
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Image Preview & Replacement Box */}
            <div className="md:col-span-5 bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Hình Ảnh Minh Họa
                </span>
                <p className="text-[11px] text-slate-500">
                  {isReplaced ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn ảnh mới thay thế
                    </span>
                  ) : (
                    'Ảnh hiện tại trong thư viện'
                  )}
                </p>
              </div>

              {/* Preview image */}
              <div className="bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 rounded-lg p-2 h-52 flex items-center justify-center overflow-hidden border border-slate-200 relative group">
                <img
                  src={imgUrl}
                  alt={title}
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>

              {/* Image Replacement Actions */}
              <div className="space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Upload className="w-3.5 h-3.5" /> Chọn tệp ảnh mới thay thế
                </button>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10.5px] text-slate-500 flex items-center justify-between">
                  <span>💡 Có thể bấm <strong>Ctrl + V</strong> để dán ảnh trực tiếp từ Clipboard</span>
                  {isReplaced && (
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-0.5 ml-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" /> Hoàn tác
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Metadata Inputs */}
            <div className="md:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b pb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Thông Tin Chuẩn Hóa Theo Sách Giáo Khoa</span>
              </h4>

              {/* Tên hình ảnh */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tên / Tiêu đề hình ảnh: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Động tác Nhảy với gậy (SGK GDTC Lớp 5)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Tên bài học */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tên bài học / Chủ đề:
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 2: Động tác Bụng, Vặn mình, Toàn thân với gậy"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Khối lớp & Thư mục con */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Khối lớp:
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as '1' | '3' | '5')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  >
                    <option value="1">Khối Lớp 1</option>
                    <option value="3">Khối Lớp 3</option>
                    <option value="5">Khối Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Thư mục phân loại:
                  </label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value as SubFolderType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  >
                    <option value="kyThuat">🏃 Động tác kỹ thuật</option>
                    <option value="luyenTap">👥 Luyện tập (Cá nhân/Nhóm)</option>
                    <option value="vanDung">🎯 Vận dụng thực tế</option>
                    <option value="troChoiKhoiDong">⚡ Trò chơi khởi động</option>
                    <option value="troChoi">🎮 Trò chơi vận động</option>
                    <option value="khoiDong">🔄 Khởi động chung</option>
                  </select>
                </div>
              </div>

              {/* Trang SGK */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Trang sách giáo khoa:
                </label>
                <input
                  type="text"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  placeholder="Ví dụ: 30"
                  className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Ghi chú kỹ thuật / Mô tả */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mô tả kỹ thuật động tác / Luật trò chơi:
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  placeholder="Ví dụ: TTCB: Đứng nghiêm, hai tay cầm hai đầu gậy xuôi trước đùi. Nhịp 1: Chân trái bước sang ngang, hai tay đưa gậy lên cao chếch chữ V..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-slate-500 text-[11px]">
            Tất cả thông tin chỉnh sửa sẽ được lưu bền vững vào IndexedDB và tự động đồng bộ khi xuất giáo án.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
