import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, LayoutGrid, Users } from 'lucide-react';
import { SgkImageItem, LessonRow } from '../types/gdtc';

interface SelectCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageItem: SgkImageItem | null;
  lessonRows: LessonRow[];
  onConfirm: (rowIndex: number, column: 'content' | 'hs') => void;
}

export const SelectCellModal: React.FC<SelectCellModalProps> = ({
  isOpen,
  onClose,
  imageItem,
  lessonRows,
  onConfirm,
}) => {
  const [selectedRow, setSelectedRow] = useState<number>(1);
  const [targetColumn, setTargetColumn] = useState<'content' | 'hs'>('content');

  useEffect(() => {
    if (imageItem) {
      if (imageItem.category === 'dong_tac') {
        setTargetColumn('content');
        setSelectedRow(1); // 2. Hình thành kiến thức mới
      } else if (imageItem.category === 'tro_choi') {
        setTargetColumn('hs');
        setSelectedRow(3); // 3.5 Trò chơi vận động
      } else {
        setTargetColumn('hs');
        setSelectedRow(2); // 3. Hoạt động luyện tập
      }
    }
  }, [imageItem]);

  if (!isOpen || !imageItem) return null;

  const handleConfirm = () => {
    onConfirm(selectedRow, targetColumn);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Chèn Hình Ảnh Vào Kế Hoạch Bài Dạy</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected image preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 mb-4">
          <img
            src={imageItem.imgUrl}
            alt={imageItem.title}
            className="w-16 h-16 object-contain rounded-lg border bg-white shadow-2xs"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-slate-800 truncate">{imageItem.title}</p>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{imageItem.caption}</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Pick Row */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              1. Chọn Hoạt Động Cần Chèn (Hàng trong Bảng):
            </label>
            <select
              value={selectedRow}
              onChange={(e) => setSelectedRow(parseInt(e.target.value, 10))}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {lessonRows.map((r, idx) => {
                const firstLine = r.content.split('\n')[0];
                return (
                  <option key={idx} value={idx}>
                    Mục {idx + 1}: {firstLine}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Pick Column */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              2. Chọn Cột Chèn (Theo Chuẩn Quy Phạm Môn GDTC):
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                  targetColumn === 'content'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Cột Nội Dung
                  </span>
                  <input
                    type="radio"
                    name="target-col"
                    checked={targetColumn === 'content'}
                    onChange={() => setTargetColumn('content')}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Chuẩn cho <strong>Ảnh Động Tác Kỹ Thuật SGK</strong> (Khám phá kiến thức mới)
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                  targetColumn === 'hs'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-2xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> Cột Hoạt Động HS
                  </span>
                  <input
                    type="radio"
                    name="target-col"
                    checked={targetColumn === 'hs'}
                    onChange={() => setTargetColumn('hs')}
                    className="text-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Chuẩn cho <strong>Sơ đồ Đội hình, Luyện tập & Trò chơi</strong>
                </p>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Check className="w-3.5 h-3.5" /> Xác Nhận Chèn Ảnh
          </button>
        </div>
      </div>
    </div>
  );
};
