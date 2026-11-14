import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  FileText,
  Layers,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  analyzeLessonPlanMultiTask,
  MultiTaskAnalysisProgress
} from '../utils/documentParser';
import { UserCustomTemplate } from '../types/gdtc';

interface ImportLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUserTemplate: (template: UserCustomTemplate, applyImmediately: boolean) => void;
  showToast: (msg: string) => void;
}

export const ImportLessonModal: React.FC<ImportLessonModalProps> = ({
  isOpen,
  onClose,
  onSaveUserTemplate,
  showToast
}) => {
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [progress, setProgress] = useState<MultiTaskAnalysisProgress | null>(null);
  const [analyzedTemplates, setAnalyzedTemplates] = useState<UserCustomTemplate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [pastedText, setPastedText] = useState<string>('');
  const [customTemplateName, setCustomTemplateName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentTemplate = analyzedTemplates[selectedIndex] || null;

  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsParsing(true);
    setErrorMsg(null);
    const results: UserCustomTemplate[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        const tpl = await analyzeLessonPlanMultiTask(
          {
            file: f,
            templateName: fileList.length === 1 && customTemplateName.trim() ? customTemplateName.trim() : undefined,
            enableAiRefinement: true
          },
          (p) => {
            setProgress({
              ...p,
              label:
                fileList.length > 1
                  ? `[Tệp ${i + 1}/${fileList.length}: ${f.name}] ${p.label}`
                  : p.label
            });
          }
        );
        results.push(tpl);
      }

      setAnalyzedTemplates(results);
      setSelectedIndex(0);
      if (results[0] && !customTemplateName.trim()) {
        setCustomTemplateName(results[0].name);
      }
      showToast(
        results.length > 1
          ? `✅ Đã phân tích đa nhiệm thành công ${results.length} mẫu giáo án!`
          : `✅ Đã phân tích đa nhiệm "${results[0].name}" (${results[0].rows.length} hoạt động)!`
      );
    } catch (err: any) {
      setErrorMsg(`Không thể đọc file: ${err?.message || 'Định dạng chưa tương thích'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyzePastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMsg('Vui lòng dán nội dung giáo án vào ô bên dưới trước khi phân tích.');
      return;
    }
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const tpl = await analyzeLessonPlanMultiTask(
        {
          rawText: pastedText,
          templateName: customTemplateName.trim() || undefined,
          enableAiRefinement: true
        },
        setProgress
      );
      setAnalyzedTemplates([tpl]);
      setSelectedIndex(0);
      if (!customTemplateName.trim()) {
        setCustomTemplateName(tpl.name);
      }
      showToast(`✅ Đã bóc tách đa nhiệm thành công "${tpl.name}" (${tpl.rows.length} hoạt động)!`);
    } catch (err: any) {
      setErrorMsg(`Lỗi phân tích văn bản: ${err?.message || 'Vui lòng kiểm tra lại định dạng'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSave = (applyImmediately: boolean) => {
    if (analyzedTemplates.length === 0) return;
    analyzedTemplates.forEach((tpl, idx) => {
      const finalTpl: UserCustomTemplate =
        idx === selectedIndex && customTemplateName.trim()
          ? { ...tpl, name: customTemplateName.trim(), updatedAt: Date.now() }
          : tpl;
      onSaveUserTemplate(finalTpl, applyImmediately && idx === selectedIndex);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Phân Tích Đa Nhiệm & Lưu Mẫu Giáo Án Mới Từ Người Dùng
              </h3>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ tải 1 hoặc nhiều tệp (.docx, .doc, .pdf, .html, .json, .txt) hoặc dán văn bản chuẩn CV 5512
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-3 text-xs">
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              inputMode === 'file' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải File Word / PDF / HTML / JSON (Đa tệp)</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              inputMode === 'paste' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dán Nội Dung Giáo Án Trực Tiếp</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 pr-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {inputMode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 transition cursor-pointer flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".docx,.doc,.pdf,.json,.html,.htm,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesSelected(e.target.files);
                  }
                }}
              />
              <div className="p-3 bg-white text-blue-600 rounded-xl shadow-2xs mb-2">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-xs">
                Bấm để chọn 1 hoặc nhiều tệp giáo án cần phân tích đa nhiệm
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Tự động trích xuất đầy đủ: Thông tin chung, Mục I YCCĐ, Mục II Thiết bị, Bảng 4 cột & Ảnh, Mục IV Điều chỉnh
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Dán toàn bộ nội dung giáo án (bao gồm I. Yêu cầu cần đạt, II. Đồ dùng, III. Các hoạt động dạy học...) vào đây..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-xs"
              />
              <button
                type="button"
                onClick={handleAnalyzePastedText}
                disabled={isParsing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chạy Phân Tích Đa Nhiệm Từ Văn Bản</span>
              </button>
            </div>
          )}

          {/* Multi-Task Loading Indicator */}
          {isParsing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-blue-900 font-bold">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  {progress?.label || 'Đang phân tích đa nhiệm cấu trúc 5512...'}
                </span>
                <span>{progress?.percent ?? 45}%</span>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress?.percent ?? 45}%` }}
                />
              </div>
            </div>
          )}

          {/* Batch Tabs if multiple files analyzed */}
          {analyzedTemplates.length > 1 && !isParsing && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {analyzedTemplates.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setCustomTemplateName(tpl.name);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                    idx === selectedIndex
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Mẫu {idx + 1}: {tpl.name.slice(0, 28)}
                </button>
              ))}
            </div>
          )}

          {/* Parsed Template Full Preview */}
          {currentTemplate && !isParsing && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Phân tích đa nhiệm hoàn tất
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    Khối {currentTemplate.grade} · Tuần {currentTemplate.week} · Tiết {currentTemplate.lessonNum}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {currentTemplate.rows.length} Hoạt động
                  </span>
                </div>
              </div>

              {/* Editable Template Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Đặt tên cho Mẫu giáo án mới từ người dùng:
                </label>
                <input
                  type="text"
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  placeholder="Ví dụ: Mẫu giáo án GDTC chuẩn Trường ..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Detected Sections Pills */}
              <div className="flex flex-wrap gap-1.5">
                {currentTemplate.detectedSections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                  >
                    ✓ {sec}
                  </span>
                ))}
              </div>

              {/* Extracted Metadata Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <strong className="text-slate-500">Chủ đề:</strong>{' '}
                  <span className="text-slate-900 font-semibold">{currentTemplate.topic}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Tên bài:</strong>{' '}
                  <span className="text-slate-900 font-semibold">{currentTemplate.title}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Năng lực số:</strong>{' '}
                  <span className="text-blue-700 font-semibold">{currentTemplate.integrations.digitalSkill}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Địa điểm:</strong>{' '}
                  <span className="text-slate-800 truncate">{currentTemplate.locationEquipment.location}</span>
                </div>
              </div>

              {/* Extracted 4-Column Rows Sample */}
              <div className="max-h-44 overflow-y-auto custom-scrollbar border rounded-lg bg-white divide-y divide-slate-100 text-[11px]">
                {currentTemplate.rows.map((r, i) => (
                  <div key={i} className="p-2.5 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-800 truncate">
                        {i + 1}. {r.content.split('\n')[0]}
                      </p>
                      <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {r.lvd}
                      </span>
                    </div>
                    <p className="text-slate-500 truncate text-[10px]">
                      GV: {r.gv.slice(0, 75)} · HS: {r.hs.slice(0, 60)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100 mt-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => handleConfirmSave(false)}
            disabled={analyzedTemplates.length === 0 || isParsing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Lưu Vào Kho Mẫu Người Dùng</span>
          </button>
          <button
            type="button"
            onClick={() => handleConfirmSave(true)}
            disabled={analyzedTemplates.length === 0 || isParsing}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition"
          >
            <Layers className="w-4 h-4" />
            <span>Lưu Thành Mẫu Mới & Hiển Thị Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
