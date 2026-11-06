import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { parseLessonFile, ParsedLessonFileResult } from '../utils/documentParser';

interface ImportLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonImported: (result: ParsedLessonFileResult) => void;
  showToast: (msg: string) => void;
}

export const ImportLessonModal: React.FC<ImportLessonModalProps> = ({
  isOpen,
  onClose,
  onLessonImported,
  showToast,
}) => {
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ParsedLessonFileResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setIsParsing(true);
    setFileName(file.name);
    try {
      const result = await parseLessonFile(file);
      setParsedData(result);
      showToast(`Đã bóc tách thành công ${result.rows.length} hoạt động từ file "${file.name}"!`);
    } catch (err: any) {
      alert('Không thể đọc file: ' + (err.message || 'Định dạng chưa tương thích'));
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    onLessonImported(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Nạp File Kế Hoạch Bài Dạy Mới
              </h3>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ Word (.docx, .doc), PDF, HTML và JSON bảng giáo án chuẩn 5512
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 pr-1 text-xs">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 transition cursor-pointer flex flex-col items-center justify-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.pdf,.json,.html,.htm,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="p-3 bg-white text-blue-600 rounded-xl shadow-2xs mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-xs">
              Bấm để chọn file hoặc kéo thả tệp giáo án vào đây
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              File Word (.docx / .doc), PDF hoặc JSON giáo án GDTC
            </p>
            {fileName && (
              <span className="mt-2 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                Đã chọn: {fileName}
              </span>
            )}
          </div>

          {/* Loading */}
          {isParsing && (
            <div className="py-6 text-center text-slate-600 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Đang phân tích bảng 4 cột và nội dung hoạt động...</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedData && !isParsing && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Bóc tách thành công
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {parsedData.rows.length} Hoạt động
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p>
                  <strong className="text-slate-600">Bài học:</strong> {parsedData.title}
                </p>
                {parsedData.topic && (
                  <p>
                    <strong className="text-slate-600">Chủ đề:</strong> {parsedData.topic}
                  </p>
                )}
                <p>
                  <strong className="text-slate-600">Tuần:</strong> {parsedData.week || 1} ·{' '}
                  <strong className="text-slate-600">Khối:</strong> {parsedData.grade || 1} ·{' '}
                  <strong className="text-slate-600">Tiết:</strong> {parsedData.lessonNum || 1}
                </p>
              </div>

              {/* Rows sample preview */}
              <div className="max-h-40 overflow-y-auto custom-scrollbar border rounded-lg bg-white divide-y divide-slate-100 text-[11px]">
                {parsedData.rows.map((r, i) => (
                  <div key={i} className="p-2 space-y-0.5">
                    <p className="font-semibold text-slate-800 truncate">
                      {i + 1}. {r.content.split('\n')[0]}
                    </p>
                    <p className="text-slate-500 truncate text-[10px]">
                      LVD: {r.lvd} | GV: {r.gv.slice(0, 60)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedData}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
          >
            <Check className="w-4 h-4" /> Nạp Vào Giáo Án Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
