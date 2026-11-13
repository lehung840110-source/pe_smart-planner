import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Check, Activity, BookOpen, Users, Calendar, MapPin, FileText } from 'lucide-react';
import { SgkImageItem, LessonRow, ImageCategory } from '../types/gdtc';
import { resolveImageUsageProvenance } from '../utils/imageProvenance';

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

  const provenance = useMemo(
    () => (imageItem ? resolveImageUsageProvenance(imageItem) : null),
    [imageItem]
  );

  // Find optimal row index based strictly on category and specific row markers (never match 1.3 for Trò chơi vận động!)
  const findOptimalRow = (cat: ImageCategory, movementTitle: string) => {
    const capHead = (imageItem?.caption || '').split('•')[0] || '';
    const raw = `${movementTitle} ${imageItem?.title || ''} ${capHead}`.toLowerCase();
    let idx = -1;

    if (cat === 'khoi_dong') {
      idx = lessonRows.findIndex((r) => r.content.includes('1.2'));
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('khởi động') &&
            !r.content.includes('1.1') &&
            !r.content.includes('1.3')
        );
      }
    } else if (cat === 'tro_choi_khoi_dong') {
      idx = lessonRows.findIndex((r) => r.content.includes('1.3'));
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('trò chơi') &&
            r.content.toLowerCase().includes('khởi động')
        );
      }
    } else if (cat === 'tro_choi') {
      idx = lessonRows.findIndex((r) => r.content.includes('3.5'));
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('trò chơi vận động') ||
            (r.content.includes('3.4') && r.content.toLowerCase().includes('trò chơi'))
        );
      }
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('trò chơi') &&
            !r.content.includes('1.3') &&
            !r.content.toLowerCase().includes('khởi động')
        );
      }
    } else if (cat === 'tap_luyen') {
      if (raw.includes('cặp đôi') || raw.includes('cap doi') || raw.includes('đối diện')) {
        idx = lessonRows.findIndex(
          (r) => r.content.includes('3.3') || r.content.toLowerCase().includes('cặp đôi')
        );
      } else if (raw.includes('đồng loạt') || raw.includes('dong loat') || raw.includes('cả lớp')) {
        idx = lessonRows.findIndex(
          (r) => r.content.includes('3.1') || r.content.toLowerCase().includes('đồng loạt')
        );
      } else {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.includes('3.2') ||
            r.content.toLowerCase().includes('theo tổ') ||
            r.content.toLowerCase().includes('tổ nhóm')
        );
      }
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            (r.content.toLowerCase().includes('luyện tập') || r.content.includes('3.')) &&
            !r.content.includes('3.5')
        );
      }
    } else if (cat === 'van_dung') {
      idx = lessonRows.findIndex((r) => r.content.includes('4.2'));
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('vận dụng') ||
            r.content.toLowerCase().includes('hồi tĩnh') ||
            r.content.includes('4.')
        );
      }
    } else {
      // dong_tac: Mục 2.1 Hình thành kiến thức mới
      idx = lessonRows.findIndex((r) => r.content.includes('2.1'));
      if (idx === -1) {
        idx = lessonRows.findIndex(
          (r) =>
            r.content.toLowerCase().includes('hình thành kiến thức') ||
            r.content.toLowerCase().includes('khám phá') ||
            r.content.includes('2.')
        );
      }
    }

    if (idx !== -1) return idx;
    if (cat === 'khoi_dong') return Math.min(1, lessonRows.length - 1);
    if (cat === 'tro_choi_khoi_dong') return Math.min(2, lessonRows.length - 1);
    if (cat === 'tap_luyen') return Math.min(4, lessonRows.length - 1);
    if (cat === 'tro_choi') return Math.max(0, lessonRows.length - 2);
    if (cat === 'van_dung') return Math.max(0, lessonRows.length - 1);
    return Math.min(3, lessonRows.length - 1);
  };

  useEffect(() => {
    if (analysis) {
      let effCat: ImageCategory = analysis.category;
      let effCol: 'content' | 'hs' = 'content';
      let effName = analysis.name || 'Động tác kỹ thuật SGK';
      let effLvd = analysis.lvd || "5 - 7'";
      const effGv = analysis.gvScript || '';
      const effHs = analysis.hsScript || '';

      // 1. Always honor explicit folder/category stored on imageItem FIRST
      if (imageItem?.folder === 'khoiDong' || imageItem?.category === 'khoi_dong') {
        effCat = 'khoi_dong';
        effCol = 'content';
      } else if (imageItem?.folder === 'troChoiKhoiDong' || imageItem?.category === 'tro_choi_khoi_dong') {
        effCat = 'tro_choi_khoi_dong';
        effCol = 'content';
      } else if (imageItem?.folder === 'troChoi' || imageItem?.category === 'tro_choi') {
        effCat = 'tro_choi';
        effCol = 'content';
        effLvd = "4 - 6' (2 - 3 lượt chơi)";
      } else if (imageItem?.folder === 'luyenTap' || imageItem?.category === 'tap_luyen') {
        effCat = 'tap_luyen';
        effCol = 'content';
      } else if (imageItem?.folder === 'vanDung' || imageItem?.category === 'van_dung') {
        effCat = 'van_dung';
        effCol = 'content';
        effLvd = "2 - 3'";
      } else if (imageItem?.folder === 'kyThuat' || imageItem?.category === 'dong_tac') {
        effCat = 'dong_tac';
        effCol = 'content';
      } else {
        // 2. Fallback keyword classification strictly on title + first sentence of caption
        const capHead = (imageItem?.caption || '').split('•')[0] || '';
        const combinedText = `${effName} ${imageItem?.title || ''} ${capHead}`.toLowerCase();

        if (combinedText.includes('trò chơi') && combinedText.includes('khởi động')) {
          effCat = 'tro_choi_khoi_dong';
          effLvd = "3 - 4'";
        } else if (combinedText.includes('khởi động') || combinedText.includes('xoay khớp')) {
          effCat = 'khoi_dong';
          effLvd = "3 - 4'";
        } else if (
          combinedText.includes('cặp đôi') ||
          combinedText.includes('theo tổ') ||
          combinedText.includes('tổ nhóm') ||
          combinedText.includes('đồng loạt') ||
          combinedText.includes('luyện tập')
        ) {
          effCat = 'tap_luyen';
          effLvd = "4 - 6'";
        } else if (
          combinedText.includes('trò chơi') ||
          combinedText.includes('tiếp sức') ||
          combinedText.includes('kéo co') ||
          combinedText.includes('lò cò')
        ) {
          effCat = 'tro_choi';
          effLvd = "4 - 6' (2 - 3 lượt chơi)";
        } else if (combinedText.includes('vận dụng') || combinedText.includes('hồi tĩnh')) {
          effCat = 'van_dung';
          effLvd = "2 - 3'";
        }
        effCol = 'content';
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
  }, [analysis, imageItem, lessonRows]);

  if (!isOpen || !imageItem || !analysis) return null;

  const handleCategoryChange = (newCat: ImageCategory) => {
    setCurrentCategory(newCat);
    // All 6 SGK picture types align cleanly in Column 1 (Nội dung & Hình ảnh) unless user switches to Column 4
    setTargetColumn('content');
    const matchedIdx = findOptimalRow(newCat, name);
    setSelectedRowIndex(matchedIdx);
  };

  const getCategoryBadge = (cat?: ImageCategory) => {
    switch (cat) {
      case 'khoi_dong':
        return { label: '🔥 Khởi động chung (Mục 1.2 - Cột 1)', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'tro_choi_khoi_dong':
        return { label: '⚡ Trò chơi khởi động (Mục 1.3 - Cột 1)', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'dong_tac':
        return { label: '🎯 Động tác kỹ thuật mới (Mục 2.1 - Cột 1)', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'tap_luyen':
        return { label: '👥 Hình ảnh tập luyện (Mục 3.2 - Cột 1)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'tro_choi':
        return { label: '🏆 Trò chơi vận động (Mục 3.5 - Cột 1)', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'van_dung':
        return { label: '🌱 Hình ảnh vận dụng thực tế (Mục 4.2 - Cột 1)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
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
                Tự động đối chiếu Khối · Trang SGK · Tuần học · Tiết PPCT và Mục chèn chuẩn xác
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
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

              {/* All 6 Fast Category Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 mr-0.5">Phân loại:</span>
                {([
                  { id: 'khoi_dong', label: 'Khởi động', activeCls: 'bg-orange-600 text-white border-orange-600' },
                  { id: 'tro_choi_khoi_dong', label: 'TC Khởi động', activeCls: 'bg-yellow-600 text-white border-yellow-600' },
                  { id: 'dong_tac', label: 'Động tác mới', activeCls: 'bg-blue-600 text-white border-blue-600' },
                  { id: 'tap_luyen', label: 'Luyện tập', activeCls: 'bg-indigo-600 text-white border-indigo-600' },
                  { id: 'tro_choi', label: 'TC Vận động', activeCls: 'bg-amber-600 text-white border-amber-600' },
                  { id: 'van_dung', label: 'Vận dụng', activeCls: 'bg-emerald-600 text-white border-emerald-600' }
                ] as { id: ImageCategory; label: string; activeCls: string }[]).map((catBtn) => (
                  <button
                    key={catBtn.id}
                    type="button"
                    onClick={() => handleCategoryChange(catBtn.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                      currentCategory === catBtn.id
                        ? `${catBtn.activeCls} shadow-2xs`
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {catBtn.label}
                  </button>
                ))}
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

          {/* Provenance Week & Target Section Card */}
          {provenance && (
            <div className="bg-sky-50/90 border border-sky-200 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className="font-bold text-sky-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                  Định Vị Giáo Án Tuần & Vị Trí Chèn Chính Xác
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-sky-200 text-sky-800 text-[10px] font-bold tabular-nums">
                  Khối {provenance.grade}{provenance.page ? ` · Trang ${provenance.page} SGK` : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                <div className="flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Bài học:</strong> {provenance.lessonName}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Dùng cho giáo án:</strong> <span className="font-bold text-emerald-700 tabular-nums">{provenance.weekLabel}</span></span>
                </div>
              </div>
              <div className="flex items-start gap-1.5 text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{provenance.summaryNotice}</span>
              </div>
            </div>
          )}

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
                  <Activity className="w-3.5 h-3.5" /> Cột Nội Dung (1)
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
                  <Users className="w-3.5 h-3.5" /> Cột Hoạt Động HS (4)
                </button>
              </div>
            </div>
          </div>

          {/* Pedagogical Guidance Badge */}
          {targetColumn === 'hs' ? (
            <div className="text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200 rounded-lg p-2 flex items-start gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Cột 4 (Hoạt động của HS):</strong> Thường dùng để gắn <strong>sơ đồ đội hình tập luyện / đội hình chơi</strong> tương ứng với mục đã chọn.</span>
            </div>
          ) : (
            <div className="text-[11px] text-blue-800 bg-blue-50/90 border border-blue-200 rounded-lg p-2 flex items-start gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Cột 1 (Nội dung & Hình ảnh):</strong> Quy chuẩn gán ảnh minh họa SGK (Khởi động 1.2, TC Khởi động 1.3, Động tác mới 2.1, Luyện tập 3.2, TC Vận động 3.5, Vận dụng 4.2) vào đúng hàng tương ứng.</span>
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
