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
  const [name, setName] = useState<string>('');
  const [lvd, setLvd] = useState<string>('');
  const [gvScript, setGvScript] = useState<string>('');
  const [hsScript, setHsScript] = useState<string>('');

  useEffect(() => {
    if (analysis) {
      setName(analysis.name || 'Động tác kỹ thuật SGK');
      setLvd(analysis.lvd || "5 - 7'");
      setGvScript(analysis.gvScript || '');
      setHsScript(analysis.hsScript || '');

      const col = analysis.targetColumn === 'hs' ? 'hs' : 'content';
      setTargetColumn(col);

      // Select default row based on category
      if (analysis.category === 'tro_choi') {
        setSelectedRowIndex(3); // 3.5 Trò chơi
      } else if (analysis.category === 'tap_luyen') {
        setSelectedRowIndex(2); // 3. Luyện tập
      } else {
        setSelectedRowIndex(1); // 2. Hình thành kiến thức mới
      }
    }
  }, [analysis]);

  if (!isOpen || !imageItem || !analysis) return null;

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
                Kết Quả AI Vision Phân Tích Động Tác SGK
              </h3>
              <p className="text-[11px] text-slate-500">
                Tự động trích xuất tên kỹ thuật, khẩu lệnh sư phạm và vị trí cột chuẩn
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
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Tên Động Tác Nhận Diện Được</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full font-bold text-xs text-blue-900 bg-white border border-slate-300 rounded-lg p-2 mt-0.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                "{analysis.caption}"
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
