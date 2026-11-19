import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Image as ImageIcon, LayoutGrid, Users, Gamepad2, Sparkles } from 'lucide-react';
import { SgkImageItem, LessonRow } from '../types/gdtc';
import {
  CrossGradeGameMatchTarget,
  normalizeGameNameForMatch
} from '../utils/planAutoMatcher';

interface SelectCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageItem: SgkImageItem | null;
  lessonRows: LessonRow[];
  onConfirm: (rowIndex: number, column: 'content' | 'hs') => void;
  getMatchingMultiGradeTargets?: (gameName: string) => CrossGradeGameMatchTarget[];
  onConfirmAllMatchingGrades?: (gameName: string) => void;
}

export const SelectCellModal: React.FC<SelectCellModalProps> = ({
  isOpen,
  onClose,
  imageItem,
  lessonRows,
  onConfirm,
  getMatchingMultiGradeTargets,
  onConfirmAllMatchingGrades
}) => {
  const [selectedRow, setSelectedRow] = useState<number>(1);
  const [targetColumn, setTargetColumn] = useState<'content' | 'hs'>('content');
  const [gameMatchQuery, setGameMatchQuery] = useState<string>('');

  const isGameImage = Boolean(
    imageItem &&
      (imageItem.category === 'tro_choi' ||
        imageItem.category === 'tro_choi_khoi_dong' ||
        imageItem.folder === 'troChoi' ||
        imageItem.folder === 'troChoiKhoiDong' ||
        (imageItem.title || '').toLowerCase().includes('trò chơi'))
  );

  useEffect(() => {
    if (imageItem) {
      setGameMatchQuery(normalizeGameNameForMatch(imageItem.title || ''));
    }
    if (imageItem && lessonRows && lessonRows.length > 0) {
      if (imageItem.category === 'dong_tac') {
        // Động tác kỹ thuật: Luôn ở Cột 1 của Hoạt động Hình thành kiến thức mới (Hàng 2 / index 1)
        const rowIdx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('hình thành kiến thức') || r.content.toLowerCase().includes('khám phá'));
        setSelectedRow(rowIdx >= 0 ? rowIdx : 1);
        setTargetColumn('content');
      } else if (imageItem.category === 'tro_choi') {
        // Trò chơi vận động: Luôn ở Cột 4 (Sơ đồ sân bãi trò chơi) của Hoạt động Trò chơi
        const rowIdx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('trò chơi vận động') || r.content.toLowerCase().includes('3.4') || r.content.toLowerCase().includes('3.5'));
        setSelectedRow(rowIdx >= 0 ? rowIdx : Math.min(3, lessonRows.length - 1));
        setTargetColumn('hs');
      } else if (imageItem.category === 'khoi_dong' || imageItem.category === 'tro_choi_khoi_dong') {
        // Khởi động: Ở Cột 4 của Hoạt động Mở đầu (Hàng 1 / index 0)
        setSelectedRow(0);
        setTargetColumn('hs');
      } else {
        // Hình ảnh / Sơ đồ Luyện tập (tap_luyen): Theo chuẩn GDTC thuộc Cột 4 (Hoạt động HS & Sơ đồ) của Hoạt động Luyện tập
        const rowIdx = lessonRows.findIndex((r) => r.content.toLowerCase().includes('hoạt động luyện tập') || r.content.toLowerCase().includes('3.1') || r.content.toLowerCase().includes('luyện tập'));
        setSelectedRow(rowIdx >= 0 ? rowIdx : 2);
        setTargetColumn('hs');
      }
    }
  }, [imageItem, lessonRows]);

  const multiGradeMatches = useMemo(() => {
    if (!isOpen || !imageItem || !getMatchingMultiGradeTargets || !gameMatchQuery.trim()) return [];
    return getMatchingMultiGradeTargets(gameMatchQuery.trim());
  }, [isOpen, imageItem, getMatchingMultiGradeTargets, gameMatchQuery]);

  const matchedGradesList = useMemo(() => {
    return Array.from(new Set(multiGradeMatches.map((m) => m.grade))).sort((a, b) => a - b);
  }, [multiGradeMatches]);

  if (!isOpen || !imageItem) return null;

  const handleConfirm = () => {
    onConfirm(selectedRow, targetColumn);
    onClose();
  };

  const handleConfirmMultiGrade = () => {
    if (!onConfirmAllMatchingGrades || !gameMatchQuery.trim()) return;
    onConfirmAllMatchingGrades(gameMatchQuery.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
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

        {/* Cross-grade same-name game batch insert panel */}
        {(isGameImage || multiGradeMatches.length > 0) && onConfirmAllMatchingGrades && (
          <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Chèn Tự Động Cho Tất Cả Khối Cùng Tên Trò Chơi</span>
              </span>
              {multiGradeMatches.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white tabular-nums whitespace-nowrap">
                  {multiGradeMatches.length} tiết ({matchedGradesList.map((g) => `K${g}`).join(', ')})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={gameMatchQuery}
                onChange={(e) => setGameMatchQuery(e.target.value)}
                placeholder="Nhập tên trò chơi để đối chiếu trên cả 5 khối..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>

            {multiGradeMatches.length > 0 ? (
              <>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {multiGradeMatches.slice(0, 8).map((m, idx) => (
                    <div
                      key={`${m.planId}_${m.rowIndex}_${idx}`}
                      className="flex items-center justify-between gap-2 text-[11px] bg-white/80 px-2 py-1 rounded border border-purple-100"
                    >
                      <span className="font-semibold text-slate-800 truncate">
                        Khối {m.grade} · Tuần {m.week} · Tiết {m.lessonNum}
                      </span>
                      <span className="text-purple-700 font-medium truncate max-w-[180px]">
                        "{m.rowGameName}"
                      </span>
                    </div>
                  ))}
                  {multiGradeMatches.length > 8 && (
                    <div className="text-[10.5px] text-purple-700 font-semibold pl-1">
                      ...và {multiGradeMatches.length - 8} tiết khác cùng tên trò chơi.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmMultiGrade}
                  className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>
                    Tự Động Chèn Vào {multiGradeMatches.length} Tiết Cùng Trò Chơi ({matchedGradesList.map((g) => `Khối ${g}`).join(', ')})
                  </span>
                </button>
              </>
            ) : (
              <p className="text-[11px] text-purple-800/80 leading-snug">
                Nhập đúng tên trò chơi (ví dụ: <em>Làm theo hiệu lệnh</em>, <em>Lò cò tiếp sức</em>, <em>Kết bạn</em>...) để tìm và chèn nhanh vào các khối lớp đang dùng trò chơi này.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Pick Row */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              1. Chọn Hoạt Động Cần Chèn Cho Tiết Hiện Tại (Hàng trong Bảng):
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

          {/* Pedagogical Rule Badge */}
          {imageItem.category === 'dong_tac' && targetColumn !== 'content' && (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              ⚠️ <strong>Lưu ý sư phạm:</strong> Tranh kỹ thuật phân thế động tác mới thường được đặt tại <strong>Cột 1 (Nội dung)</strong> ở Hoạt động Khám phá để học sinh đối chiếu khi giáo viên làm mẫu.
            </div>
          )}

          {imageItem.category === 'tap_luyen' && targetColumn === 'content' && (
            <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] leading-relaxed">
              🚫 <strong>Sai quy chuẩn giáo án GDTC:</strong> Cột 1 của Hoạt động Luyện tập chỉ chứa văn bản các bước (3.1 Tập đồng loạt, 3.2 Tập tổ nhóm). Hình ảnh và sơ đồ luyện tập <strong>bắt buộc phải nằm ở Cột 4 (Hoạt động HS)</strong>.
            </div>
          )}

          {imageItem.category === 'tro_choi' && (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã chọn đúng <strong>Cột 4</strong> để chèn sơ đồ sân bãi và luật chơi trò chơi vận động.</span>
            </div>
          )}
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
            <Check className="w-3.5 h-3.5" /> Chèn Vào Tiết Hiện Tại
          </button>
        </div>
      </div>
    </div>
  );
};
