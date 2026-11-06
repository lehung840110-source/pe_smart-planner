import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  Gamepad2,
  Users2,
  Flame,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { SgkImageItem } from '../types/gdtc';

export type ImageClassificationCategory = 'dong_tac' | 'tro_choi_kd' | 'tro_choi_vd' | 'luyen_tap';

export interface ClassifiedImageInfo {
  category: ImageClassificationCategory;
  categoryLabel: string;
  grade: '1' | '3' | '5' | 'chung';
  badgeBg: string;
  badgeBorder: string;
}

/**
 * Accurately classifies an image item into one of the 4 standard categories and assigns grade.
 */
export function classifyImageItem(img: SgkImageItem): ClassifiedImageInfo {
  const t = (img.title || '').toLowerCase();
  const c = (img.caption || '').toLowerCase();
  const cat = (img.category || '').toLowerCase();
  const folder = (img.folder || '').toLowerCase();
  const id = (img.id || '').toLowerCase();
  const lTitle = (img.lessonTitle || '').toLowerCase();

  // 1. Determine Grade
  let grade: '1' | '3' | '5' | 'chung' = 'chung';
  if (img.grade === '1' || id.includes('k1') || t.includes('lớp 1') || t.includes('khối 1') || lTitle.includes('lớp 1')) {
    grade = '1';
  } else if (img.grade === '3' || id.includes('k3') || t.includes('lớp 3') || t.includes('khối 3') || lTitle.includes('lớp 3')) {
    grade = '3';
  } else if (img.grade === '5' || id.includes('k5') || t.includes('lớp 5') || t.includes('khối 5') || lTitle.includes('lớp 5')) {
    grade = '5';
  }

  // 2. Determine Category
  // A. Trò chơi khởi động
  const kdKeywords = [
    'khởi động',
    'kết bạn',
    'làm theo hiệu lệnh',
    'đứng ngồi theo hiệu lệnh',
    'di chuyển theo tín hiệu',
    'ai nhanh hơn',
    'ai kéo khoẻ',
    'ai kéo khỏe',
    'gió thổi gậy'
  ];
  if (
    cat === 'tro_choi_khoi_dong' ||
    cat === 'khoi_dong' ||
    folder === 'trochoikhoidong' ||
    folder === 'khoidong' ||
    kdKeywords.some((kw) => t.includes(kw) || c.includes(kw))
  ) {
    return {
      category: 'tro_choi_kd',
      categoryLabel: 'Trò chơi khởi động',
      grade,
      badgeBg: 'bg-amber-50 text-amber-800',
      badgeBorder: 'border-amber-200'
    };
  }

  // B. Hình ảnh luyện tập của bài học
  const practiceKeywords = [
    'luyện tập',
    'tập luyện',
    'luyện tập động tác',
    'tập theo tổ',
    'tổ nhóm',
    'tập đồng loạt',
    'cặp đôi',
    'thi đua',
    'đội hình luyện tập'
  ];
  if (
    cat === 'tap_luyen' ||
    folder === 'luyentap' ||
    practiceKeywords.some((kw) => t.includes(kw) || c.includes(kw))
  ) {
    return {
      category: 'luyen_tap',
      categoryLabel: 'Hình ảnh luyện tập',
      grade,
      badgeBg: 'bg-emerald-50 text-emerald-800',
      badgeBorder: 'border-emerald-200'
    };
  }

  // C. Trò chơi vận động
  const gameKeywords = [
    'trò chơi',
    'tiếp sức',
    'lò cò',
    'chui qua hầm',
    'đua ô tô',
    'trao gậy',
    'chuyền gậy',
    'con thỏ',
    'thỏ nhường hang',
    'mèo đuổi chuột',
    'chim về tổ',
    'hoàng anh hoàng yến',
    'cướp cờ',
    'kéo co',
    'ném bóng vào rổ',
    'vận động'
  ];
  if (
    cat === 'tro_choi' ||
    folder === 'trochoi' ||
    gameKeywords.some((kw) => t.includes(kw) || c.includes(kw))
  ) {
    return {
      category: 'tro_choi_vd',
      categoryLabel: 'Trò chơi vận động',
      grade,
      badgeBg: 'bg-purple-50 text-purple-800',
      badgeBorder: 'border-purple-200'
    };
  }

  // D. Động tác kỹ thuật (mặc định)
  return {
    category: 'dong_tac',
    categoryLabel: 'Động tác kỹ thuật',
    grade,
    badgeBg: 'bg-blue-50 text-blue-800',
    badgeBorder: 'border-blue-200'
  };
}

export interface ClassifiedImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: SgkImageItem[];
  initialGrade?: 'all' | '1' | '3' | '5';
  initialCategory?: 'all' | ImageClassificationCategory;
  targetInfo?: {
    grade?: number;
    lessonTitle?: string;
    rowName?: string;
    rowIndex?: number;
  };
  onSelectImage: (imgUrl: string, imgTitle: string) => void;
}

export const ClassifiedImagePickerModal: React.FC<ClassifiedImagePickerModalProps> = ({
  isOpen,
  onClose,
  images,
  initialGrade = 'all',
  initialCategory = 'all',
  targetInfo,
  onSelectImage
}) => {
  const [gradeFilter, setGradeFilter] = useState<'all' | '1' | '3' | '5'>(initialGrade);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ImageClassificationCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync filters whenever target changes
  useEffect(() => {
    if (isOpen) {
      if (initialGrade && initialGrade !== 'all') {
        setGradeFilter(initialGrade);
      } else if (targetInfo?.grade) {
        setGradeFilter(String(targetInfo.grade) as '1' | '3' | '5');
      } else {
        setGradeFilter('all');
      }

      if (initialCategory && initialCategory !== 'all') {
        setCategoryFilter(initialCategory);
      } else if (targetInfo?.rowIndex !== undefined) {
        if (targetInfo.rowIndex === 0) setCategoryFilter('tro_choi_kd');
        else if (targetInfo.rowIndex === 1) setCategoryFilter('dong_tac');
        else if (targetInfo.rowIndex >= 2 && targetInfo.rowIndex <= 4) setCategoryFilter('luyen_tap');
        else setCategoryFilter('tro_choi_vd');
      } else {
        setCategoryFilter('all');
      }
      setSearchQuery('');
    }
  }, [isOpen, initialGrade, initialCategory, targetInfo]);

  // Classify all images once
  const classifiedImages = useMemo(() => {
    return images.map((img) => ({
      ...img,
      meta: classifyImageItem(img)
    }));
  }, [images]);

  // Category counts
  const counts = useMemo(() => {
    const byGrade = (g: 'all' | '1' | '3' | '5') => {
      if (g === 'all') return classifiedImages;
      return classifiedImages.filter((img) => img.meta.grade === g || img.meta.grade === 'chung');
    };

    const currentGradeImages = byGrade(gradeFilter);

    return {
      all: currentGradeImages.length,
      dong_tac: currentGradeImages.filter((i) => i.meta.category === 'dong_tac').length,
      tro_choi_kd: currentGradeImages.filter((i) => i.meta.category === 'tro_choi_kd').length,
      tro_choi_vd: currentGradeImages.filter((i) => i.meta.category === 'tro_choi_vd').length,
      luyen_tap: currentGradeImages.filter((i) => i.meta.category === 'luyen_tap').length,
      g1: classifiedImages.filter((i) => i.meta.grade === '1').length,
      g3: classifiedImages.filter((i) => i.meta.grade === '3').length,
      g5: classifiedImages.filter((i) => i.meta.grade === '5').length,
      total: classifiedImages.length
    };
  }, [classifiedImages, gradeFilter]);

  // Filtered images list
  const filteredImages = useMemo(() => {
    return classifiedImages.filter((img) => {
      // 1. Grade Filter
      if (gradeFilter !== 'all') {
        if (img.meta.grade !== gradeFilter && img.meta.grade !== 'chung') {
          return false;
        }
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (img.meta.category !== categoryFilter) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const t = (img.title || '').toLowerCase();
        const c = (img.caption || '').toLowerCase();
        const l = (img.lessonTitle || '').toLowerCase();
        return t.includes(q) || c.includes(q) || l.includes(q);
      }

      return true;
    });
  }, [classifiedImages, gradeFilter, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                Chọn Hình Ảnh Phân Loại Theo Khối Lớp & Nội Dung
              </h3>
              <p className="text-xs text-slate-500">
                {targetInfo ? (
                  <span>
                    Đang chèn cho:{' '}
                    <strong className="text-blue-700">
                      {targetInfo.grade ? `Khối ${targetInfo.grade}` : ''}
                      {targetInfo.rowName ? ` · ${targetInfo.rowName}` : ''}
                    </strong>
                    {targetInfo.lessonTitle ? ` (${targetInfo.lessonTitle})` : ''}
                  </span>
                ) : (
                  'Chọn hình ảnh bóc tách SGK chuẩn để chèn vào kế hoạch bài dạy'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="space-y-2.5 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Row 1: Grade Selection (Từng Khối Lớp) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Khối Lớp:
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setGradeFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    gradeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả khối ({counts.total})
                </button>
                <button
                  onClick={() => setGradeFilter('1')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    gradeFilter === '1'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Khối 1 ({counts.g1})
                </button>
                <button
                  onClick={() => setGradeFilter('3')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    gradeFilter === '3'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Khối 3 ({counts.g3})
                </button>
                <button
                  onClick={() => setGradeFilter('5')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    gradeFilter === '5'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Khối 5 ({counts.g5})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên động tác, trò chơi..."
                className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Selection (Phân loại chức năng) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Phân Loại:
            </span>

            {/* Tất cả */}
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1 ${
                categoryFilter === 'all'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Tất cả ({counts.all})
            </button>

            {/* Động tác kỹ thuật */}
            <button
              onClick={() => setCategoryFilter('dong_tac')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                categoryFilter === 'dong_tac'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Động tác kỹ thuật</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${categoryFilter === 'dong_tac' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'}`}>
                {counts.dong_tac}
              </span>
            </button>

            {/* Trò chơi khởi động */}
            <button
              onClick={() => setCategoryFilter('tro_choi_kd')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                categoryFilter === 'tro_choi_kd'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trò chơi khởi động</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${categoryFilter === 'tro_choi_kd' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {counts.tro_choi_kd}
              </span>
            </button>

            {/* Trò chơi vận động */}
            <button
              onClick={() => setCategoryFilter('tro_choi_vd')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                categoryFilter === 'tro_choi_vd'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Trò chơi vận động</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${categoryFilter === 'tro_choi_vd' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'}`}>
                {counts.tro_choi_vd}
              </span>
            </button>

            {/* Hình ảnh luyện tập */}
            <button
              onClick={() => setCategoryFilter('luyen_tap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                categoryFilter === 'luyen_tap'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <Users2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hình ảnh luyện tập</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${categoryFilter === 'luyen_tap' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {counts.luyen_tap}
              </span>
            </button>
          </div>
        </div>

        {/* Results Count & Current Filter Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 shrink-0">
          <span>
            Đang hiển thị <strong>{filteredImages.length}</strong> hình ảnh
            {gradeFilter !== 'all' && (
              <span className="font-semibold text-slate-800"> · Khối {gradeFilter}</span>
            )}
            {categoryFilter !== 'all' && (
              <span className="font-semibold text-slate-800">
                {' '}
                ·{' '}
                {categoryFilter === 'dong_tac'
                  ? 'Động tác kỹ thuật'
                  : categoryFilter === 'tro_choi_kd'
                  ? 'Trò chơi khởi động'
                  : categoryFilter === 'tro_choi_vd'
                  ? 'Trò chơi vận động'
                  : 'Hình ảnh luyện tập'}
              </span>
            )}
          </span>

          {(gradeFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setGradeFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Bỏ tất cả bộ lọc
            </button>
          )}
        </div>

        {/* Images Grid */}
        <div className="overflow-y-auto flex-1 p-1">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredImages.map((img) => {
                const gradeBadge =
                  img.meta.grade === '1'
                    ? { text: 'Khối 1', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
                    : img.meta.grade === '3'
                    ? { text: 'Khối 3', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                    : img.meta.grade === '5'
                    ? { text: 'Khối 5', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
                    : { text: 'Dùng chung', bg: 'bg-slate-100 text-slate-700 border-slate-200' };

                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      onSelectImage(img.imgUrl, img.title);
                      onClose();
                    }}
                    className="border border-slate-200 hover:border-blue-500 rounded-xl p-2.5 cursor-pointer transition hover:shadow-md flex flex-col justify-between bg-white group hover:bg-blue-50/20"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${gradeBadge.bg}`}
                        >
                          {gradeBadge.text}
                        </span>
                        <span
                          className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded border ${img.meta.badgeBg} ${img.meta.badgeBorder}`}
                        >
                          {img.meta.categoryLabel}
                        </span>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="h-32 w-full bg-slate-50 rounded-lg p-1.5 flex items-center justify-center border border-slate-100 group-hover:border-blue-200 transition">
                        <img
                          src={img.imgUrl}
                          alt={img.title}
                          className="max-h-full max-w-full object-contain rounded"
                          loading="lazy"
                        />
                      </div>

                      {/* Title & Caption */}
                      <p className="text-[11.5px] font-bold text-slate-800 group-hover:text-blue-600 mt-2 line-clamp-2 leading-snug">
                        {img.title}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Trang {img.page || 1} SGK</span>
                      <span className="text-blue-600 group-hover:text-blue-800 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Chọn ảnh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-bold text-sm text-slate-700">
                  Không tìm thấy hình ảnh nào phù hợp với bộ lọc hiện tại
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vui lòng thử chọn khối khác hoặc chuyển sang danh mục hình ảnh khác.
                </p>
              </div>
              <button
                onClick={() => {
                  setGradeFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xem Tất Cả Hình Ảnh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
