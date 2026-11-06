import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Calendar,
  Layers,
  Image as ImageIcon,
  Users,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Download,
  Palette,
  Edit3,
  PlusCircle
} from 'lucide-react';
import { LessonRow, ScenarioItem, SgkImageItem } from '../types/gdtc';
import { MasterPlanItem, nextWeeksSyllabusPresets, masterPlansTuan8 } from '../data/masterTemplateTuan8';
import {
  generateNextWeekPlan,
  AutoMatchResult,
  autoScanLibraryAndAttachToRows,
  extractMovementNamesFromTitle,
  createBalanced7LessonRows,
  splitAndBalanceExistingRows,
  resolveAccurateMovement
} from '../utils/planAutoMatcher';
import { SelectFormationModal } from './SelectFormationModal';
import { SelectMovementImageModal } from './SelectMovementImageModal';
import { FormationStudioModal } from './FormationStudioModal';
import { FormationDiagram, saveCustomFormationToStorage } from '../data/formationDiagrams';
import { downloadSvgAsPng } from '../utils/imageProcessing';

interface TabGeneratorProps {
  week: number;
  setWeek: (w: number) => void;
  grade: number;
  setGrade: (g: number) => void;
  lessonNum: number;
  setLessonNum: (n: number) => void;
  topic: string;
  setTopic: (t: string) => void;
  title: string;
  setTitle: (t: string) => void;
  lessonRows: LessonRow[];
  setLessonRows: React.Dispatch<React.SetStateAction<LessonRow[]>>;
  scenarios: ScenarioItem[];
  images: SgkImageItem[];
  currentMasterPlan: MasterPlanItem;
  onSwitchToExport: () => void;
  onSwitchToMasterTemplate: () => void;
  onOpenImport?: () => void;
  showToast: (msg: string) => void;
}

export const TabGenerator: React.FC<TabGeneratorProps> = ({
  week,
  setWeek,
  grade,
  setGrade,
  lessonNum,
  setLessonNum,
  topic,
  setTopic,
  title,
  setTitle,
  lessonRows,
  setLessonRows,
  scenarios,
  images,
  currentMasterPlan,
  onSwitchToExport,
  onSwitchToMasterTemplate,
  showToast,
}) => {
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [lastAutoMatch, setLastAutoMatch] = useState<AutoMatchResult | null>(null);

  // Modals for manual picking
  const [targetRowForFormation, setTargetRowForFormation] = useState<number | null>(null);
  const [targetRowForStudio, setTargetRowForStudio] = useState<number | null>(null);
  const [studioInitialDiagram, setStudioInitialDiagram] = useState<FormationDiagram | null>(null);
  const [targetRowForImage, setTargetRowForImage] = useState<number | null>(null);

  // Filter syllabus presets for current grade and week
  const relevantPresets = nextWeeksSyllabusPresets.filter(
    (p) => p.grade === grade
  );

  const handleSelectPresetLesson = (preset: typeof nextWeeksSyllabusPresets[0]) => {
    setWeek(preset.week);
    setLessonNum(preset.lessonNum);
    setTopic(preset.topic);
    setTitle(preset.title);

    // Automatically generate using Master Template
    const match = generateNextWeekPlan(
      preset.grade,
      preset.week,
      preset.lessonNum,
      preset.topic,
      preset.title,
      currentMasterPlan,
      images
    );

    setLessonRows(match.newRows);
    setLastAutoMatch(match);

    showToast(
      `✨ Đã tự động sinh giáo án Tuần ${preset.week} - Tiết ${preset.lessonNum} và gắn đúng ảnh kỹ thuật & sơ đồ đội hình!`
    );
  };

  // Run the Auto-Match & Generation Engine
  const handleAutoGenerateFromMaster = () => {
    const match = generateNextWeekPlan(
      grade,
      week,
      lessonNum,
      topic,
      title,
      currentMasterPlan,
      images
    );

    setLessonRows(match.newRows);
    setLastAutoMatch(match);

    showToast(
      `⚡ Đã áp dụng mẫu Nghĩa Hiệp: Nhận diện ${match.detectedMovements.length} động tác, tự gắn ${match.matchedImages.length} ảnh kỹ thuật và ${match.matchedFormations.length} sơ đồ đội hình!`
    );
  };

  // 1-Click: Auto-scan teacher's library and attach to all rows
  const handleAutoScanLibraryAndAttach = () => {
    const result = autoScanLibraryAndAttachToRows(lessonRows, images, grade, title);
    setLessonRows(result.updatedRows);
    showToast(
      `⚡ Đã quét thư viện (${images.length} ảnh): Tự động gắn ${result.attachedCount} ảnh kỹ thuật & sơ đồ đội hình vào các hoạt động!`
    );
  };

  // 1-Click: Split 3.1, 3.2, 3.3 into separate rows and balance teacher text to 100-120 words
  const handleSplitAndBalanceRows = () => {
    const balanced = createBalanced7LessonRows(grade, title, images);
    setLessonRows(balanced);
    showToast(
      '✨ Đã tách 3.1 (đồng loạt), 3.2 (tổ nhóm), 3.3 (cặp đôi) thành từng ô riêng, điền đầy Cột GV 100-120 từ và khớp ảnh chuẩn 100%!'
    );
  };

  // Gemini AI Custom Adaptation
  const handleAiRefine = async () => {
    setIsAiGenerating(true);
    showToast('Gemini AI đang hiệu chỉnh kịch bản theo yêu cầu chuẩn GDPT 2018...');

    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          week,
          lessonNum,
          topic,
          title,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan && data.plan.rows) {
        // Merge AI text with current images & formation diagrams
        const mergedRows = data.plan.rows.map((row: LessonRow, idx: number) => {
          const origRow = lessonRows[idx];
          return {
            ...row,
            contentImgUrl: origRow?.contentImgUrl || row.contentImgUrl,
            contentImgTitle: origRow?.contentImgTitle || row.contentImgTitle,
            hsImgUrl: origRow?.hsImgUrl || row.hsImgUrl,
            hsImgTitle: origRow?.hsImgTitle || row.hsImgTitle,
          };
        });

        setLessonRows(mergedRows);
        showToast('✨ Gemini AI đã tinh chỉnh xong nội dung bài dạy!');
      } else {
        throw new Error(data.error || 'Lỗi xử lý AI');
      }
    } catch (err: any) {
      console.warn('AI generate fallback:', err);
      // Fallback: run local auto generator
      handleAutoGenerateFromMaster();
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Row update handlers
  const handleUpdateRow = (idx: number, field: keyof LessonRow, val: string) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleAddRow = () => {
    setLessonRows((prev) => [
      ...prev,
      {
        content: 'Hoạt động bổ sung',
        lvd: "3 - 5'",
        gv: '- GV chỉ dẫn.',
        hs: '- HS thực hiện.',
      },
    ]);
    showToast('Đã thêm 1 dòng hoạt động mới!');
  };

  const handleDeleteRow = (idx: number) => {
    if (lessonRows.length <= 1) return;
    setLessonRows((prev) => prev.filter((_, i) => i !== idx));
    showToast('Đã xóa dòng hoạt động.');
  };

  const handleMoveRow = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= lessonRows.length) return;
    setLessonRows((prev) => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  // Formation and image selectors
  const handleSelectFormation = (rowIdx: number, formation: FormationDiagram) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx]) {
        const currentDiags = updated[rowIdx].hsImages && updated[rowIdx].hsImages!.length > 0
          ? [...updated[rowIdx].hsImages!]
          : updated[rowIdx].hsImgUrl
          ? [{ id: `diag_init`, url: updated[rowIdx].hsImgUrl!, title: updated[rowIdx].hsImgTitle || 'Sơ đồ' }]
          : [];

        currentDiags.push({
          id: `diag_${Date.now()}`,
          url: formation.svgDataUrl,
          title: formation.name
        });

        updated[rowIdx] = {
          ...updated[rowIdx],
          hsImgUrl: currentDiags[0]?.url,
          hsImgTitle: currentDiags[0]?.title,
          hsImages: currentDiags
        };
      }
      return updated;
    });
    showToast(`Đã gắn "${formation.name}" vào Cột 4 dòng ${rowIdx + 1}!`);
  };

  const handleRemoveFormationDiagram = (rowIdx: number, diagIdx: number) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      const targetRow = updated[rowIdx];
      if (!targetRow) return prev;

      const currentDiags = targetRow.hsImages && targetRow.hsImages.length > 0
        ? [...targetRow.hsImages]
        : targetRow.hsImgUrl
        ? [{ id: 'diag_init', url: targetRow.hsImgUrl, title: targetRow.hsImgTitle || 'Sơ đồ' }]
        : [];

      currentDiags.splice(diagIdx, 1);
      targetRow.hsImages = currentDiags;
      if (currentDiags.length > 0) {
        targetRow.hsImgUrl = currentDiags[0].url;
        targetRow.hsImgTitle = currentDiags[0].title;
      } else {
        delete targetRow.hsImgUrl;
        delete targetRow.hsImgTitle;
      }
      return updated;
    });
    showToast('Đã xóa sơ đồ khỏi dòng hoạt động.');
  };

  const handleSelectMovementImage = (rowIdx: number, imgUrl: string, imgTitle: string) => {
    setLessonRows((prev) => {
      const updated = [...prev];
      if (updated[rowIdx]) {
        updated[rowIdx] = {
          ...updated[rowIdx],
          contentImgUrl: imgUrl,
          contentImgTitle: imgTitle,
        };
      }
      return updated;
    });
    showToast(`Đã gắn ảnh kỹ thuật "${imgTitle}" vào Cột 1 dòng ${rowIdx + 1}!`);
  };

  return (
    <div className="space-y-6">
      {/* Master Template Source Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mẫu Mặc Định Đang Kích Hoạt
            </span>
            <span className="text-blue-200 text-xs">
              Trường TH & THCS Nghĩa Hiệp (GV: Lê Quốc Hưng)
            </span>
          </div>
          <h2 className="text-base font-bold mt-1 text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            Sinh Giáo Án Tuần Kế Tiếp Từ Giáo Án Mẫu Nghĩa Hiệp
          </h2>
          <p className="text-blue-100 text-xs mt-0.5 max-w-2xl">
            Giữ nguyên 100% khung sườn quy chuẩn, mục tiêu năng lực số (3.1TC1a/1.1TC1a), ATGT, cấu trúc 4 cột và chữ ký BGH. Chỉ cập nhật tên bài và tự động điền ảnh động tác & sơ đồ đội hình.
          </p>
        </div>

        <button
          onClick={onSwitchToMasterTemplate}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <FileCheck className="w-4 h-4 text-emerald-300" />
          Sửa Trực Tiếp Giáo Án Mẫu
        </button>
      </div>

      {/* Week & Lesson Setup Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Thông Tin Tiết Dạy Mới (Tuần Tiếp Theo)
        </h3>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Tuần */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tuần Học:
            </label>
            <select
              value={week}
              onChange={(e) => setWeek(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {Array.from({ length: 27 }, (_, i) => i + 9).map((w) => (
                <option key={w} value={w}>
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>

          {/* Khối lớp */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Khối Lớp:
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value={1}>Khối 1</option>
              <option value={3}>Khối 3</option>
              <option value={5}>Khối 5</option>
            </select>
          </div>

          {/* Tiết PPCT */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tiết PPCT:
            </label>
            <input
              type="number"
              value={lessonNum}
              onChange={(e) => setLessonNum(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Chủ đề */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Chủ Đề:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tên bài học */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tên Bài Dạy Mới (Chứa các động tác cần học):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 1)"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-blue-900 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAutoGenerateFromMaster}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Tự động bóc tách tên động tác, tìm ảnh SGK và sơ đồ đội hình"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                ⚡ Sinh Giáo Án Chuẩn
              </button>

              <button
                onClick={handleSplitAndBalanceRows}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Tách phần 3.1 (đồng loạt), 3.2 (tổ nhóm), 3.3 (cặp đôi) thành từng ô riêng, cân bằng Cột GV 100-120 từ giải quyết triệt để khoảng trắng"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                ⚡ Tách 3.1, 3.2, 3.3 & Cân Bằng Các Ô (100-120 Từ)
              </button>

              <button
                onClick={handleAutoScanLibraryAndAttach}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                title="Quét ảnh từ thư viện của bạn và tự động gắn vào các hoạt động"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                ⚡ Quét Thư Viện Gắn Ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Syllabus Presets for current grade */}
        {relevantPresets.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium mb-2">
              💡 Gợi ý nhanh bài học phân phối chương trình tiếp theo (Khối {grade}):
            </p>
            <div className="flex flex-wrap gap-2">
              {relevantPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetLesson(preset)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition text-left flex items-center gap-1.5"
                >
                  <span className="bg-white text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                    Tuần {preset.week}
                  </span>
                  <span>{preset.title.replace(/^bài\s*\d+\s*[:\-]?\s*/i, '')}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auto-Match Audit Status Box */}
      {lastAutoMatch && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1">
            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã Khớp Tự Động Thành Công Vào Kế Hoạch Bài Dạy:
            </p>
            <p className="text-emerald-800 text-[11.5px]">
              <strong>• Động tác tìm thấy:</strong> {lastAutoMatch.detectedMovements.join(', ')}
            </p>
            <p className="text-emerald-800 text-[11.5px]">
              <strong>• Ảnh kỹ thuật Cột 1:</strong>{' '}
              {lastAutoMatch.matchedImages.length > 0
                ? lastAutoMatch.matchedImages.map((m) => m.title).join(', ')
                : 'Đã gắn tranh kỹ thuật chuẩn vector'}
            </p>
            <p className="text-emerald-800 text-[11.5px]">
              <strong>• Sơ đồ đội hình Cột 4:</strong>{' '}
              {lastAutoMatch.matchedFormations.length} sơ đồ đội hình chuẩn (Nhận lớp, Khởi động, Tập mẫu, Tập tổ, Trò chơi, Hồi tĩnh)
            </p>
          </div>

          <button
            onClick={onSwitchToExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-2xs transition flex items-center gap-1.5 shrink-0"
          >
            <Eye className="w-4 h-4" /> Xem Trước & In Giáo Án
          </button>
        </div>
      )}

      {/* 4-Column Table Direct Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Bảng Tiến Trình Giảng Dạy Đã Sinh (4 Cột Quy Chuẩn)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Bạn có thể gõ sửa trực tiếp bất kỳ ô nào, hoặc bấm nút để đổi ảnh động tác và sơ đồ đội hình
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiRefine}
              disabled={isAiGenerating}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {isAiGenerating ? 'AI đang xử lý...' : 'Gemini AI Tinh Chỉnh'}
            </button>

            <button
              onClick={handleAddRow}
              className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Dòng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-6 text-center text-slate-400">STT</th>
                <th className="p-3 w-1/4">Cột 1: Nội Dung / Ảnh Kỹ Thuật</th>
                <th className="p-3 w-20 text-center">Cột 2: LVĐ</th>
                <th className="p-3 w-1/3">Cột 3: Hoạt Động Giáo Viên</th>
                <th className="p-3 w-1/3">Cột 4: Hoạt Động Học Sinh & Sơ Đồ</th>
                <th className="p-3 w-16 text-center">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {lessonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  {/* STT */}
                  <td className="p-3 text-center font-bold text-slate-400 align-top">
                    {idx + 1}
                  </td>

                  {/* Cột 1: Nội dung */}
                  {/* Cột 1: Nội dung */}
                  <td className="p-3 align-top space-y-2">
                    <textarea
                      rows={4}
                      value={row.content}
                      onChange={(e) => handleUpdateRow(idx, 'content', e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                    />

                    {/* Button to attach/swap movement image */}
                    <button
                      onClick={() => setTargetRowForImage(idx)}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <ImageIcon className="w-3 h-3 text-emerald-600" />
                      {row.contentImgUrl ? 'Đổi ảnh kỹ thuật Cột 1' : '+ Gắn ảnh kỹ thuật Cột 1'}
                    </button>

                    {/* Image Preview in Column 1 */}
                    {row.contentImgUrl ? (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <img
                          src={row.contentImgUrl}
                          alt={row.contentImgTitle || 'Ảnh kỹ thuật'}
                          className="max-h-36 w-full object-contain rounded"
                        />
                        {row.contentImgTitle && (
                          <p className="text-[10px] text-slate-600 font-medium text-center mt-1">
                            {row.contentImgTitle}
                          </p>
                        )}
                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                          <button
                            onClick={() => downloadSvgAsPng(row.contentImgUrl!, `anh_ky_thuat_dong_${idx + 1}.png`)}
                            className="bg-slate-900/85 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                            title="Tải ảnh PNG xuống máy"
                          >
                            <Download className="w-3 h-3 text-emerald-400" /> PNG
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setLessonRows((prev) => {
                              const updated = [...prev];
                              delete updated[idx].contentImgUrl;
                              delete updated[idx].contentImgTitle;
                              return updated;
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      /* Thông báo khi chưa có ảnh kỹ thuật, nêu rõ tên động tác cần chèn */
                      <div className="p-2 bg-amber-50/90 border border-dashed border-amber-300 rounded-xl text-center space-y-1">
                        <p className="text-[10px] text-amber-900 font-medium">
                          ⚠️ Chưa có ảnh kỹ thuật cho:{' '}
                          <strong className="font-bold underline text-amber-950">
                            {idx === 0
                              ? 'Khởi động chung / xoay khớp'
                              : idx === 1
                              ? (extractMovementNamesFromTitle(title)[0] || 'Kỹ thuật động tác mới')
                              : idx === 2
                              ? '3.1. Tập đồng loạt'
                              : idx === 3
                              ? '3.2. Tập theo tổ / nhóm'
                              : idx === 4
                              ? '3.3. Tập cặp đôi sửa sai'
                              : idx === 5
                              ? '3.4. Thi đua / Trò chơi'
                              : 'Hồi tĩnh & Vận dụng'}
                          </strong>
                        </p>
                        <button
                          onClick={() => setTargetRowForImage(idx)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs transition"
                        >
                          <ImageIcon className="w-3 h-3" /> Chèn ảnh từ thư viện
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Cột 2: LVĐ */}
                  <td className="p-3 text-center align-top font-semibold text-slate-800">
                    <input
                      type="text"
                      value={row.lvd}
                      onChange={(e) => handleUpdateRow(idx, 'lvd', e.target.value)}
                      className="w-full text-center p-1.5 text-xs rounded-lg border border-slate-300 font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </td>

                  {/* Cột 3: Hoạt động GV - Cân bằng 100-120 từ */}
                  <td className="p-3 align-top leading-relaxed text-slate-800">
                    <textarea
                      rows={8}
                      value={row.gv}
                      onChange={(e) => handleUpdateRow(idx, 'gv', e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                  </td>

                  {/* Cột 4: Hoạt động HS & Sơ đồ đội hình */}
                  <td className="p-3 align-top leading-relaxed text-slate-800 space-y-2">
                    <textarea
                      rows={4}
                      value={row.hs}
                      onChange={(e) => handleUpdateRow(idx, 'hs', e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                    />

                    {/* Multi-Diagram in Column 4 */}
                    {(() => {
                      const rowDiagrams = row.hsImages && row.hsImages.length > 0
                        ? row.hsImages
                        : row.hsImgUrl
                        ? [{ id: `dh_${idx}_0`, url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ đội hình' }]
                        : [];

                      return (
                        <div className="space-y-2">
                          {/* Buttons to attach/swap formation diagram & Open Studio */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => setTargetRowForFormation(idx)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                            >
                              <Users className="w-3 h-3 text-blue-600" />
                              {rowDiagrams.length > 0 ? '+ Thêm từ Kho Sơ Đồ' : '+ Kho sơ đồ'}
                            </button>
                            <button
                              onClick={() => {
                                setStudioInitialDiagram(
                                  rowDiagrams[0]
                                    ? {
                                        id: `dh_row_${idx}`,
                                        name: rowDiagrams[0].title || `Sơ đồ dòng ${idx + 1}`,
                                        code: 'DH_CUSTOM',
                                        phase: 'dong_loat',
                                        description: row.hs,
                                        svgDataUrl: rowDiagrams[0].url
                                      }
                                    : null
                                );
                                setTargetRowForStudio(idx);
                              }}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition shadow-2xs"
                            >
                              <Palette className="w-3 h-3 text-purple-600" />
                              🎨 Studio tự vẽ
                            </button>
                          </div>

                          {/* Formation Diagram Preview in Column 4 */}
                          {rowDiagrams.length > 0 ? (
                            <div className="space-y-2">
                              <div className={`grid ${rowDiagrams.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                                {rowDiagrams.map((diag, diagIdx) => (
                                  <div
                                    key={diag.id || diagIdx}
                                    className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 relative group text-center"
                                  >
                                    <img
                                      src={diag.url}
                                      alt={diag.title || 'Sơ đồ đội hình'}
                                      className="max-h-32 w-auto mx-auto object-contain rounded bg-white"
                                    />
                                    {diag.title && (
                                      <p className="text-[10px] text-slate-700 font-medium text-center mt-1 truncate" title={diag.title}>
                                        {diag.title}
                                      </p>
                                    )}
                                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setStudioInitialDiagram({
                                            id: diag.id || `dh_row_${idx}_${diagIdx}`,
                                            name: diag.title || `Sơ đồ ${diagIdx + 1}`,
                                            code: 'DH_CUSTOM',
                                            phase: 'dong_loat',
                                            description: row.hs,
                                            svgDataUrl: diag.url
                                          });
                                          setTargetRowForStudio(idx);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                                        title="Chỉnh sửa sơ đồ này trong Studio"
                                      >
                                        <Edit3 className="w-3 h-3 text-white" /> Sửa
                                      </button>
                                      <button
                                        onClick={() => downloadSvgAsPng(diag.url, `so_do_dong_${idx + 1}_${diagIdx + 1}.png`)}
                                        className="bg-slate-900/85 hover:bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 shadow"
                                        title="Tải sơ đồ PNG xuống máy"
                                      >
                                        <Download className="w-3 h-3 text-emerald-400" /> PNG
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveFormationDiagram(idx, diagIdx)}
                                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
                                      title="Xóa sơ đồ này"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={() => setTargetRowForFormation(idx)}
                                className="w-full py-1 px-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded text-[10.5px] font-bold flex items-center justify-center gap-1 transition"
                                title="Chèn thêm sơ đồ tập đồng loạt, tổ nhóm, cặp đôi hoặc cá nhân vào dòng này"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>+ Thêm Sơ Đồ Khác (Đồng loạt / Tổ / Cặp / Cá nhân)</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-50/90 border border-dashed border-blue-300 rounded-xl text-center space-y-1">
                              <p className="text-[10px] text-blue-900 font-medium">
                                ⚠️ Chưa gắn sơ đồ đội hình cho hoạt động này
                              </p>
                              <button
                                onClick={() => setTargetRowForFormation(idx)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] inline-flex items-center gap-1 shadow-2xs transition"
                              >
                                <Users className="w-3 h-3" /> Chọn sơ đồ đội hình
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Action buttons */}
                  <td className="p-3 text-center align-top space-y-1.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMoveRow(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                        title="Lên trên"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveRow(idx, 'down')}
                        disabled={idx === lessonRows.length - 1}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                        title="Xuống dưới"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteRow(idx)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Giáo án được bảo đảm tương thích in ấn A4 và xuất file Word đầy đủ hình ảnh
          </span>

          <button
            onClick={onSwitchToExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Eye className="w-4 h-4" /> Xem Trước & In Giáo Án
          </button>
        </div>
      </div>

      {/* Select Formation Modal */}
      {targetRowForFormation !== null && (
        <SelectFormationModal
          isOpen={true}
          onClose={() => setTargetRowForFormation(null)}
          targetRowIndex={targetRowForFormation}
          onSelectFormation={handleSelectFormation}
        />
      )}

      {/* Select Movement Image Modal */}
      {targetRowForImage !== null && (
        <SelectMovementImageModal
          isOpen={true}
          onClose={() => setTargetRowForImage(null)}
          targetRowIndex={targetRowForImage}
          userImages={images}
          onSelectImage={handleSelectMovementImage}
        />
      )}

      {/* Formation Studio Modal */}
      {targetRowForStudio !== null && (
        <FormationStudioModal
          isOpen={true}
          onClose={() => setTargetRowForStudio(null)}
          targetRowIndex={targetRowForStudio}
          initialFormation={studioInitialDiagram}
          onApplyFormationToRow={(rowIdx, customFormation) => {
            handleSelectFormation(rowIdx, customFormation);
            saveCustomFormationToStorage(customFormation);
            setTargetRowForStudio(null);
            showToast(`✨ Đã áp dụng sơ đồ "${customFormation.name}" vào Cột 4 dòng số ${rowIdx + 1}!`);
          }}
          onSaveToLibrary={(customFormation) => {
            saveCustomFormationToStorage(customFormation);
            showToast(`💾 Đã lưu sơ đồ "${customFormation.name}" vào thư viện đội hình!`);
          }}
        />
      )}
    </div>
  );
};
