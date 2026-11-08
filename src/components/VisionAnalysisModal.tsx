import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Activity, BookOpen, Users, AlertTriangle } from 'lucide-react';
import { SgkImageItem, LessonRow, ImageCategory } from '../types/gdtc';

export interface VisionAnalysisResult {
  name: string;
  category: ImageCategory;
  targetColumn: 'content' | 'hs';
  lvd: string;
  caption: string;
  technicalCues?: string[];
  commonErrors?: string[];
  gvScript: string;
  hsScript: string;
}

interface VisionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageItem: SgkImageItem | null;
  analysis: VisionAnalysisResult | null;
  lessonRows: LessonRow[];
  onApplyToLesson: (
    rowIndex: number,
    targetCol: 'content' | 'hs',
    movementName: string,
    lvd: string,
    gvScript: string,
    hsScript: string,
    imgItem: SgkImageItem
  ) => void;
}

export const VisionAnalysisModal: React.FC<VisionAnalysisModalProps> = ({
  isOpen,
  onClose,
  imageItem,
  analysis,
  lessonRows,
  onApplyToLesson,
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(1);
  const [targetColumn, setTargetColumn] = useState<'content' | 'hs'>('content');
  const [currentCategory, setCurrentCategory] = useState<ImageCategory>('dong_tac');
  const [name, setName] = useState<string>('');
  const [lvd, setLvd] = useState<string>('');
  const [gvScript, setGvScript] = useState<string>('');
  const [hsScript, setHsScript] = useState<string>('');

  // Find optimal row index based on category and title keywords
  const findOptimalRow = (cat: ImageCategory, movementTitle: string) => {
    const raw = `${movementTitle} ${imageItem?.title || ''} ${imageItem?.caption || ''}`.toLowerCase();
    let idx = -1;

    if (raw.includes('cặp đôi') || raw.includes('cap doi') || raw.includes('đối diện')) {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('cặp đôi') || r.content.includes('3.3')
      );
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) => r.content.toLowerCase().includes('luyện tập') || r.content.includes('3.')
        );
      }
    } else if (raw.includes('theo tổ') || raw.includes('tổ nhóm') || raw.includes('to nhom') || raw.includes('4 góc')) {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('theo tổ') || r.content.toLowerCase().includes('tổ nhóm') || r.content.includes('3.2')
      );
      if (idx === -1) {
        idx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('luyện tập'));
      }
    } else if (raw.includes('đồng loạt') || raw.includes('dong loat') || raw.includes('cả lớp')) {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('đồng loạt') || r.content.includes('3.1')
      );
      if (idx === -1) {
        idx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('luyện tập'));
      }
    } else if (cat === 'tap_luyen') {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('luyện tập') || r.content.includes('3.')
      );
    } else if (cat === 'tro_choi' || cat === 'tro_choi_khoi_dong') {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('trò chơi') || r.content.includes('3.5') || r.content.includes('3.4')
      );
      if (idx === -1) {
        idx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('luyện tập'));
      }
    } else if (cat === 'van_dung') {
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('vận dụng') || r.content.toLowerCase().includes('hồi tĩnh') || r.content.includes('4.')
      );
    } else {
      // dong_tac: Mục 2 Hình thành kiến thức
      idx = lessonRows.findIndex(
        (r) => r.content.toLowerCase().includes('hình thành kiến thức') || r.content.toLowerCase().includes('khám phá') || r.content.includes('2.')
      );
    }

    if (idx !== -1) return idx;
    if (cat === 'tro_choi') return Math.min(3, lessonRows.length - 1);
    if (cat === 'tap_luyen') return Math.min(2, lessonRows.length - 1);
    if (cat === 'van_dung') return Math.max(0, lessonRows.length - 1);
    return Math.min(1, lessonRows.length - 1);
  };

  useEffect(() => {
    if (analysis) {
      let effCat: ImageCategory = analysis.category;
      let effCol: 'content' | 'hs' = analysis.targetColumn;
      let effName = analysis.name || 'Động tác kỹ thuật SGK';
      let effLvd = analysis.lvd || "5 - 7'";
      let effGv = analysis.gvScript || '';
      let effHs = analysis.hsScript || '';

      const combinedText = `${effName} ${imageItem?.title || ''} ${imageItem?.caption || ''} ${imageItem?.folder || ''}`.toLowerCase();

      const isPairPractice =
        combinedText.includes('cặp đôi') ||
        combinedText.includes('cap doi') ||
        combinedText.includes('đối diện') ||
        combinedText.includes('doi dien');

      const isGroupPractice =
        combinedText.includes('theo tổ') ||
        combinedText.includes('tổ nhóm') ||
        combinedText.includes('to nhom') ||
        combinedText.includes('4 góc');

      const isMassPractice =
        combinedText.includes('đồng loạt') ||
        combinedText.includes('dong loat') ||
        combinedText.includes('cả lớp');

      const isGame =
        effCat === 'tro_choi' ||
        effCat === 'tro_choi_khoi_dong' ||
        combinedText.includes('trò chơi') ||
        combinedText.includes('tiếp sức') ||
        combinedText.includes('kéo co') ||
        combinedText.includes('con sâu');

      const isVanDung =
        effCat === 'van_dung' ||
        combinedText.includes('vận dụng') ||
        combinedText.includes('hồi tĩnh') ||
        combinedText.includes('chào cờ');

      if (isPairPractice) {
        effCat = 'tap_luyen';
        effCol = 'hs';
        if (!effName || effName.includes('Động tác')) {
          effName = 'Luyện tập cặp đôi sửa sai cho nhau';
        }
        effLvd = "3 - 5' (2 - 3 lượt đổi vai)";
      } else if (isGroupPractice) {
        effCat = 'tap_luyen';
        effCol = 'hs';
        if (!effName || effName.includes('Động tác')) {
          effName = 'Luyện tập theo tổ nhóm 4 góc sân';
        }
        effLvd = "4 - 6' (3 - 4 lần)";
      } else if (isMassPractice) {
        effCat = 'tap_luyen';
        effCol = 'hs';
        if (!effName || effName.includes('Động tác')) {
          effName = 'Luyện tập đồng loạt cả lớp 4 hàng ngang';
        }
        effLvd = "5 - 7' (2x8 nhịp/động tác)";
      } else if (isGame) {
        effCat = 'tro_choi';
        effCol = 'hs';
        effLvd = "4 - 6' (2 - 3 lượt chơi)";
      } else if (isVanDung) {
        effCat = 'van_dung';
        effCol = 'hs';
        effLvd = "2 - 3'";
      }

      setCurrentCategory(effCat);
      setName(effName);
      setLvd(effLvd);
      setGvScript(effGv);
      setHsScript(effHs);
      setTargetColumn(effCol);

      const matchedIdx = findOptimalRow(effCat, effName);
      setSelectedRowIndex(matchedIdx);
    }
  }, [analysis, imageItem]);

  if (!isOpen || !imageItem || !analysis) return null;

  const handleCategoryChange = (newCat: ImageCategory) => {
    setCurrentCategory(newCat);
    if (newCat === 'dong_tac') {
      setTargetColumn('content');
    } else {
      setTargetColumn('hs');
    }
    const matchedIdx = findOptimalRow(newCat, name);
    setSelectedRowIndex(matchedIdx);
  };

  const getCategoryBadge = (cat?: ImageCategory) => {
    switch (cat) {
      case 'dong_tac':
        return { label: '🎯 Hình ảnh động tác kỹ thuật mới (Cột 1)', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'tap_luyen':
        return { label: '👥 Hình ảnh tập luyện động tác (Cột 4)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'tro_choi':
      case 'tro_choi_khoi_dong':
        return { label: '🏆 Hình ảnh trò chơi vận động (Cột 4)', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'van_dung':
        return { label: '🌱 Hình ảnh vận dụng thực tế (Cột 4)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: '📷 Tư liệu minh họa GDTC', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const badge = getCategoryBadge(currentCategory);

  const handleApply = () => {
    onApplyToLesson(
      selectedRowIndex,
      targetColumn,
      name,
      lvd,
      gvScript,
      hsScript,
      imageItem
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Kết Quả AI Vision Phân Tích & Phân Loại Hình Ảnh SGK
              </h3>
              <p className="text-[11px] text-slate-500">
                Tự động nhận diện động tác, tập luyện, trò chơi, vận dụng kèm chú thích chuẩn
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 pr-1 text-xs">
          {/* Image + Quick Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="rounded-lg overflow-hidden border bg-white flex items-center justify-center p-2 max-h-36">
              <img
                src={imageItem.imgUrl}
                alt="Ảnh vừa phân tích"
                className="max-h-32 object-contain mx-auto"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-[10px] font-bold uppercase text-slate-400">Tên Nhận Diện Được</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full font-bold text-xs text-blue-900 bg-white border border-slate-300 rounded-lg p-2 mt-0.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Fast Category Selector Pills */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500">Phân loại nhanh:</span>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('dong_tac')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition ${
                    currentCategory === 'dong_tac'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Động tác mới
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('tap_luyen')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition ${
                    currentCategory === 'tap_luyen'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Luyện tập
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('tro_choi')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition ${
                    currentCategory === 'tro_choi'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Trò chơi
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('van_dung')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition ${
                    currentCategory === 'van_dung'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Vận dụng
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white/80 p-1.5 rounded-md border border-slate-200/60">
                <strong>Ghi chú tự động:</strong> "{analysis.caption}"
              </p>
              {analysis.technicalCues && analysis.technicalCues.length > 0 && (
                <div className="text-[10.5px] text-slate-700 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800">Yếu lĩnh kỹ thuật cốt lõi: </span>
                  {analysis.technicalCues.join(' · ')}
                </div>
              )}
            </div>
          </div>

          {/* Form to insert into Table */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                1. Chọn Hoạt Động Cần Điền:
              </label>
              <select
                value={selectedRowIndex}
                onChange={(e) => setSelectedRowIndex(parseInt(e.target.value, 10))}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-semibold focus:border-blue-500 focus:outline-none"
              >
                {lessonRows.map((r, idx) => (
                  <option key={idx} value={idx}>
                    Mục {idx + 1}: {r.content.split('\n')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                2. Chọn Cột Chèn Ảnh (Theo Quy Chuẩn):
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetColumn('content')}
                  className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    targetColumn === 'content'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> Cột Nội Dung
                </button>
                <button
                  type="button"
                  onClick={() => setTargetColumn('hs')}
                  className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    targetColumn === 'hs'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Cột Hoạt Động HS
                </button>
              </div>
            </div>
          </div>

          {/* Pedagogical Guidance Badge */}
          {targetColumn === 'hs' ? (
            <div className="text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200 rounded-lg p-2 flex items-start gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Đúng chuẩn Công văn 2345/BGDĐT:</strong> Hình ảnh luyện tập (cặp đôi, tổ nhóm, đồng loạt) hoặc sơ đồ trò chơi được gắn vào <strong>Cột 4 (Hoạt động của HS)</strong> để thể hiện đội hình và cách thức học sinh thực hiện.</span>
            </div>
          ) : (
            <div className="text-[11px] text-blue-800 bg-blue-50/90 border border-blue-200 rounded-lg p-2 flex items-start gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Đúng chuẩn Công văn 2345/BGDĐT:</strong> Cột 1 (Nội dung) chỉ dành riêng cho <strong>tranh phân thế động tác kỹ thuật mới</strong> ở Mục 2 (Khám phá & Hình thành kiến thức mới).</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lượng Vận Động (LVD)</label>
            <input
              type="text"
              value={lvd}
              onChange={(e) => setLvd(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Generated Scripts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-blue-800 mb-1">
                Kịch Bản Giáo Viên (Cột 3)
              </label>
              <textarea
                rows={4}
                value={gvScript}
                onChange={(e) => setGvScript(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-emerald-800 mb-1">
                Kịch Bản Học Sinh (Cột 4)
              </label>
              <textarea
                rows={4}
                value={hsScript}
                onChange={(e) => setHsScript(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 text-xs">
          <span className="text-slate-400 text-[11px]">
            Ảnh sẽ được tự động đính kèm vào đúng cột đã chọn.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
            >
              <Check className="w-4 h-4" /> Điền Vào Kế Hoạch Bài Dạy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
