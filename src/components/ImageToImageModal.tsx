import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Check,
  RotateCcw,
  Layers,
  Wand2,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { SgkImageItem, SubFolderType, ImageCategory } from '../types/gdtc';

interface ImageToImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: SgkImageItem | null;
  onSaveGeneratedImage: (newImg: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

export type StyleOption = 'sgk_vector' | '3d_pixar' | 'sketch_bw' | 'stickman';

export const ImageToImageModal: React.FC<ImageToImageModalProps> = ({
  isOpen,
  onClose,
  sourceImage,
  onSaveGeneratedImage,
  showToast,
}) => {
  const [movementName, setMovementName] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('1');
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>('sgk_vector');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [characterMode, setCharacterMode] = useState<'single' | 'pair' | 'group'>('single');
  const [targetFolder, setTargetFolder] = useState<SubFolderType>('kyThuat');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<string>('');

  React.useEffect(() => {
    if (sourceImage) {
      const clean = sourceImage.title.replace(/\s*-\s*SGK.*$/i, '').trim();
      setMovementName(clean);
      setTargetGrade(sourceImage.grade || '1');
      setGeneratedImageUrl(null);

      const isGame =
        sourceImage.folder === 'troChoiKhoiDong' ||
        sourceImage.category === 'tro_choi_khoi_dong' ||
        clean.toLowerCase().includes('trò chơi') ||
        clean.toLowerCase().includes('tiếp sức') ||
        clean.toLowerCase().includes('mèo đuổi chuột');

      const isPair = clean.toLowerCase().includes('cặp đôi');

      if (isGame) {
        setCharacterMode('group');
        setTargetFolder('troChoiKhoiDong');
      } else if (isPair) {
        setCharacterMode('pair');
        setTargetFolder('luyenTap');
      } else {
        setCharacterMode('single');
        setTargetFolder(sourceImage.folder || 'kyThuat');
      }
    }
  }, [sourceImage, isOpen]);

  if (!isOpen || !sourceImage) return null;

  const styleOptions = [
    {
      id: 'sgk_vector' as StyleOption,
      title: '⭐ 2D SGK Kết Nối Tri Thức (Chuẩn Mẫu)',
      desc: 'Học sinh tiểu học mặc áo thể thao trắng viền xanh, quần xanh sọc trắng. Nét vector 2D trong sáng, cel-shading chuẩn SGK GDPT 2018, nền trong suốt không chữ.',
      icon: '🎨',
      badge: 'Đúng Mẫu Thầy/Cô Chọn',
      previewThumb: '/assets/aistudio/0e0e03fc-7060-481d-85f2-da82dde1f3c3_eccfceae.jfif'
    },
    {
      id: '3d_pixar' as StyleOption,
      title: 'Hoạt Hình 3D Nổi Khối',
      desc: 'Nhân vật 3D nổi khối, sinh động, màu sắc tươi sáng, nền trong suốt, không chữ.',
      icon: '✨',
      badge: 'Hiện đại'
    },
    {
      id: 'sketch_bw' as StyleOption,
      title: 'Tranh Phác Thảo Trắng Đen',
      desc: 'Tranh nét vẽ chì đen trắng rõ ràng các khớp và góc độ tay chân, in laser siêu nét.',
      icon: '✏️',
      badge: 'In tiết kiệm mực'
    },
    {
      id: 'stickman' as StyleOption,
      title: 'Người Que Thể Thao Tối Giản',
      desc: 'Sơ đồ hình que thể hiện góc độ khớp xương và hướng vận động chuẩn xác.',
      icon: '🏃',
      badge: 'Phân tích kỹ thuật'
    }
  ];

  const handleGenerate = async () => {
    if (!movementName.trim()) {
      showToast('Vui lòng nhập tên động tác hoặc trò chơi!');
      return;
    }

    setIsGenerating(true);
    showToast(
      characterMode === 'group'
        ? 'AI đang phân tích và tạo khung cảnh trò chơi nhiều người (3-5 em)...'
        : 'AI đang phân tích tư thế ảnh gốc và tạo hình ảnh mới...'
    );

    try {
      const res = await fetch('/api/ai/generate-3d-cartoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName: movementName.trim(),
          grade: targetGrade,
          description: sourceImage.caption || '',
          sourceImageBase64: sourceImage.imgUrl,
          style: selectedStyle,
          gender: gender,
          characterMode: characterMode
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGenerationSource(data.source || 'ai');
        showToast('✨ Đã tạo thành công ảnh mới chuẩn mẫu!');
      } else {
        throw new Error(data.error || 'Không thể tạo ảnh');
      }
    } catch (err: any) {
      showToast('Lỗi tạo ảnh mới: ' + err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedImageUrl) return;

    const styleName =
      selectedStyle === 'sgk_vector'
        ? '2D SGK Chuẩn'
        : selectedStyle === '3d_pixar'
        ? '3D Pixar'
        : selectedStyle === 'sketch_bw'
        ? 'Trắng Đen'
        : 'Người Que';

    let cat: ImageCategory = 'dong_tac';
    if (targetFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
    else if (targetFolder === 'luyenTap') cat = 'tap_luyen';
    else if (targetFolder === 'vanDung') cat = 'van_dung';
    else if (targetFolder === 'troChoi') cat = 'tro_choi';
    else if (targetFolder === 'khoiDong') cat = 'khoi_dong';

    const newImgItem: SgkImageItem = {
      id: `ai_gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${movementName} (${styleName} - Nền trong suốt)`,
      grade: targetGrade,
      topicId: sourceImage.topicId,
      topicTitle: sourceImage.topicTitle,
      lessonId: sourceImage.lessonId,
      lessonTitle: sourceImage.lessonTitle,
      folder: targetFolder,
      page: sourceImage.page || 1,
      category: cat,
      imgUrl: generatedImageUrl,
      caption: `Hình ảnh tái tạo phong cách ${styleName} dựa trên ảnh mẫu SGK GDTC Khối ${targetGrade}. Tư thế chuẩn xác, nền trong suốt, không chữ.`,
      selected: false,
      createdAt: Date.now()
    };

    onSaveGeneratedImage(newImgItem);
    showToast(`📥 Đã lưu ảnh "${newImgItem.title}" vào thư viện!`);
    onClose();
  };

  const handleDownloadPng = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `${movementName.replace(/\s+/g, '_')}_${selectedStyle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Đã tải hình ảnh PNG xuống máy!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Tạo Hình Ảnh Mới Từ Hình Ảnh Cũ</h3>
              <p className="text-xs text-blue-100">
                AI phân tích tư thế động tác từ ảnh SGK gốc để sinh nhân vật mới nền trong suốt, không chữ
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
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50 text-xs">
          {/* Comparison / Workspace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Original Reference Image */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  1. Ảnh Mẫu Gốc (Tham Chiếu Tư Thế)
                </span>
                <p className="text-[11px] text-slate-500">
                  {sourceImage.title} · Khối {sourceImage.grade}
                </p>
              </div>

              <div className="bg-slate-100 rounded-lg p-2 h-56 flex items-center justify-center overflow-hidden border border-slate-200">
                <img
                  src={sourceImage.imgUrl}
                  alt={sourceImage.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="bg-blue-50/70 p-2 rounded-lg text-[11px] text-blue-900 border border-blue-100">
                💡 AI sẽ nhận diện biên độ tay, chân, hướng quay mặt và trọng tâm của ảnh này để vẽ lại chính xác.
              </div>
            </div>

            {/* Right: Generated Result Preview */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  2. Kết Quả Ảnh Mới Tạo
                </span>
                <p className="text-[11px] text-slate-500">
                  {generatedImageUrl ? 'Nền trong suốt · Không chữ · Sắc nét' : 'Chưa tạo ảnh'}
                </p>
              </div>

              <div className="bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 rounded-lg p-2 h-56 flex items-center justify-center overflow-hidden border border-slate-200 relative">
                {isGenerating ? (
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">AI đang vẽ nhân vật mới...</p>
                    <p className="text-[10px] text-slate-500">Khớp từng khớp xương và góc độ vươn</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Ảnh mới tạo"
                    className="max-h-full max-w-full object-contain animate-in fade-in"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                    <p className="font-medium text-xs">Chọn phong cách bên dưới và bấm "Bắt Đầu Tạo Ảnh Mới"</p>
                  </div>
                )}
              </div>

              {generatedImageUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPng}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải PNG Về Máy
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Lưu Vào Thư Viện
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Settings & Style Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              3. Tùy Chọn Tên Động Tác, Nhân Vật & Phong Cách Vẽ
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tên Động Tác / Trò Chơi:
                  </label>
                  <input
                    type="text"
                    value={movementName}
                    onChange={(e) => setMovementName(e.target.value)}
                    placeholder="Ví dụ: Động tác thăng bằng một chân, Trò chơi mèo đuổi chuột..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { label: '🤸 Thăng bằng chân (Chuẩn mẫu)', name: 'Động tác thăng bằng một chân', mode: 'single' as const, folder: 'luyenTap' as const },
                      { label: '🎮 Mèo đuổi chuột (Nhóm)', name: 'Trò chơi: Mèo đuổi chuột', mode: 'group' as const, folder: 'troChoiKhoiDong' as const },
                      { label: '🏃 Tiếp sức chuyền bóng', name: 'Trò chơi: Chuyền bóng tiếp sức', mode: 'group' as const, folder: 'troChoiKhoiDong' as const },
                      { label: '⚡ Đổi chỗ vỗ tay', name: 'Trò chơi: Đổi chỗ vỗ tay', mode: 'group' as const, folder: 'troChoiKhoiDong' as const },
                      { label: '👥 Cặp đôi sửa sai', name: 'Luyện tập cặp đôi sửa sai', mode: 'pair' as const, folder: 'luyenTap' as const }
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMovementName(tag.name);
                          setCharacterMode(tag.mode);
                          setTargetFolder(tag.folder);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded-md font-semibold transition"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Quy Mô Nhân Vật:
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setCharacterMode('single')}
                      className={`py-1 rounded font-bold transition text-center ${
                        characterMode === 'single' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="1 học sinh thực hiện động tác"
                    >
                      🏃 Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => setCharacterMode('pair')}
                      className={`py-1 rounded font-bold transition text-center ${
                        characterMode === 'pair' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="2 học sinh tập cặp đôi"
                    >
                      👥 Cặp đôi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCharacterMode('group');
                        if (targetFolder !== 'troChoiKhoiDong') setTargetFolder('troChoiKhoiDong');
                      }}
                      className={`py-1 rounded font-bold transition text-center ${
                        characterMode === 'group' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Nhóm 3-5 học sinh chơi trò chơi"
                    >
                      🎮 Nhóm
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Lưu Vào Thư Mục:
                  </label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value as SubFolderType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  >
                    <option value="troChoiKhoiDong">🎮 Trò chơi khởi động</option>
                    <option value="kyThuat">🏃 Kỹ thuật động tác mới</option>
                    <option value="luyenTap">👥 Luyện tập (Cá nhân/Nhóm)</option>
                    <option value="vanDung">🎯 Vận dụng thực tế</option>
                    <option value="khoiDong">⚡ Khởi động chung</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Khối Lớp:
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  >
                    <option value="1">Khối Lớp 1</option>
                    <option value="3">Khối Lớp 3</option>
                    <option value="5">Khối Lớp 5</option>
                  </select>
                </div>

                {characterMode === 'single' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Giới Tính Nhân Vật:
                    </label>
                    <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`flex-1 py-1 rounded font-semibold transition ${
                          gender === 'male' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        👦 Bé Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`flex-1 py-1 rounded font-semibold transition ${
                          gender === 'female' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        👧 Bé Nữ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Style Cards */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Chọn Phong Cách Minh Họa Mới:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {styleOptions.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStyle(st.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 relative overflow-hidden ${
                      selectedStyle === st.id
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {st.previewThumb ? (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={st.previewThumb} alt={st.title} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <span className="text-xl shrink-0 mt-0.5">{st.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{st.title}</span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold shrink-0">
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-slate-400 text-[11px]">
            Ảnh sinh ra đảm bảo nền trong suốt, tuyệt đối không chèn thêm watermark hoặc dòng chữ rác.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Đóng
            </button>
            <button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Đang Tạo Ảnh Mới...' : '🚀 Bắt Đầu Tạo Ảnh Mới'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
