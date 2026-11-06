import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Search,
  Check,
  FileSpreadsheet,
  Download,
  Info,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PpctItem, PpctAuditResult, WeeklyMasterScheduleRow } from '../types/gdtc';
import {
  parsePpctFile,
  parsePpctFromHtmlOrText,
  auditScheduleAgainstPpct,
  syncScheduleFromPpct
} from '../utils/ppctParser';
import { defaultAllPpctData, saveStoredPpctData } from '../data/defaultPpctData';

interface PpctManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ppctList: PpctItem[];
  onUpdatePpctList: (updatedList: PpctItem[]) => void;
  currentWeek: number;
  weeklyScheduleRows: WeeklyMasterScheduleRow[];
  onSyncScheduleWithPpct: (syncedRows: WeeklyMasterScheduleRow[]) => void;
  showToast: (msg: string) => void;
}

export const PpctManagerModal: React.FC<PpctManagerModalProps> = ({
  isOpen,
  onClose,
  ppctList,
  onUpdatePpctList,
  currentWeek,
  weeklyScheduleRows,
  onSyncScheduleWithPpct,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'upload' | 'browse'>('audit');
  const [selectedGrade, setSelectedGrade] = useState<1 | 3 | 5>(1);
  const [filterWeek, setFilterWeek] = useState<number>(currentWeek);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [uploadGrade, setUploadGrade] = useState<number>(0); // 0 = all grades auto-detect
  const [pastePpctText, setPastePpctText] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Run audit against current week
  const auditResults: PpctAuditResult[] = auditScheduleAgainstPpct(weeklyScheduleRows, ppctList, currentWeek);
  const matchCount = auditResults.filter((r) => r.isMatch).length;
  const mismatchCount = auditResults.length - matchCount;

  // Filtered PPCT items for the "browse" subtab
  const filteredPpct = ppctList.filter((item) => {
    if (item.grade !== selectedGrade) return false;
    if (filterWeek > 0 && item.week !== filterWeek) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return (
        item.lessonTitle.toLowerCase().includes(kw) ||
        item.topic.toLowerCase().includes(kw) ||
        (item.integrationNotes && item.integrationNotes.toLowerCase().includes(kw))
      );
    }
    return true;
  });

  // Handle uploading file
  const handleFileChange = async (file: File) => {
    setIsProcessingFile(true);
    try {
      const explicitGrade = uploadGrade === 0 ? undefined : (uploadGrade as 1 | 3 | 5);
      const parsed = await parsePpctFile(file, explicitGrade);
      if (parsed.length === 0) {
        showToast('⚠️ Không trích xuất được tiết học nào từ file. Vui lòng kiểm tra định dạng bảng.');
      } else {
        // Merge or replace
        const existingMap = new Map<string, PpctItem>();
        ppctList.forEach((p) => existingMap.set(`k${p.grade}_p${p.period}`, p));
        parsed.forEach((p) => existingMap.set(`k${p.grade}_p${p.period}`, p));
        const merged = Array.from(existingMap.values()).sort((a, b) => a.grade - b.grade || a.period - b.period);

        onUpdatePpctList(merged);
        saveStoredPpctData(merged);
        showToast(`✅ Đã nạp thành công ${parsed.length} tiết PPCT từ file "${file.name}"!`);
        setActiveSubTab('audit');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Lỗi đọc file PPCT: ' + (e.message || 'Chưa hỗ trợ định dạng này'));
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle apply pasted text
  const handleApplyPastedText = () => {
    if (!pastePpctText.trim()) {
      showToast('Vui lòng dán nội dung bảng phân phối chương trình!');
      return;
    }
    const explicitGrade = uploadGrade === 0 ? undefined : (uploadGrade as 1 | 3 | 5);
    const parsed = parsePpctFromHtmlOrText(pastePpctText, explicitGrade);
    if (parsed.length === 0) {
      showToast('⚠️ Không phân tích được dòng nào. Đảm bảo có các cột: Tuần, Tiết, Tên bài học.');
      return;
    }

    const existingMap = new Map<string, PpctItem>();
    ppctList.forEach((p) => existingMap.set(`k${p.grade}_p${p.period}`, p));
    parsed.forEach((p) => existingMap.set(`k${p.grade}_p${p.period}`, p));
    const merged = Array.from(existingMap.values()).sort((a, b) => a.grade - b.grade || a.period - b.period);

    onUpdatePpctList(merged);
    saveStoredPpctData(merged);
    setPastePpctText('');
    showToast(`✅ Đã nạp thành công ${parsed.length} tiết PPCT vào cơ sở dữ liệu!`);
    setActiveSubTab('audit');
  };

  // 1-Click Sync
  const handleSyncNow = () => {
    const synced = syncScheduleFromPpct(weeklyScheduleRows, ppctList, currentWeek);
    onSyncScheduleWithPpct(synced);
    showToast(`⚡ Đã đồng bộ 100% thời khóa biểu và giáo án Tuần ${currentWeek} khớp chuẩn Phân phối chương trình!`);
    onClose();
  };

  // Restore Default PPCT
  const handleRestoreDefault = () => {
    if (confirm('Khôi phục phân phối chương trình chuẩn Bộ GD&ĐT cho cả 3 khối (K1, K3, K5 - 70 tiết)?')) {
      onUpdatePpctList(defaultAllPpctData);
      saveStoredPpctData(defaultAllPpctData);
      showToast('Đã khôi phục PPCT chuẩn GDPT 2018 (70 tiết/khối)!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Phân Phối Chương Trình (PPCT) & Rà Soát Giáo Án 3 Khối
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                GDPT 2018 · 70 Tiết / Khối
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý phân phối chương trình Khối 1, 3, 5; rà soát và đối chiếu thời khóa biểu tuần thực tế với PPCT gốc để đảm bảo đúng tiến độ.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-3 pb-2 text-xs">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Rà Soát & Đối Chiếu Tuần {currentWeek}</span>
            {mismatchCount > 0 ? (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full font-bold text-[10px]">
                {mismatchCount} lệch
              </span>
            ) : (
              <span className="px-1.5 py-0.2 bg-white text-emerald-800 rounded-full font-bold text-[10px]">
                Khớp 100%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'upload'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Tải Lên / Cập Nhật PPCT 3 Khối</span>
          </button>

          <button
            onClick={() => setActiveSubTab('browse')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeSubTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Tra Cứu PPCT 35 Tuần (70 Tiết)</span>
          </button>

          <div className="ml-auto">
            <button
              onClick={handleRestoreDefault}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
              title="Khôi phục lại dữ liệu PPCT chuẩn mặc định"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi Phục Chuẩn GDPT 2018</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 py-3 text-xs pr-1">
          {/* TAB 1: AUDIT / RÀ SOÁT */}
          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  mismatchCount === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl text-white ${
                      mismatchCount === 0 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  >
                    {mismatchCount === 0 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      Kết quả rà soát kế hoạch giảng dạy Tuần {currentWeek}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {mismatchCount === 0
                        ? `Tuyệt vời! Tất cả ${auditResults.length} tiết giảng dạy trên thời khóa biểu đều khớp chuẩn 100% với Phân phối chương trình.`
                        : `Phát hiện ${mismatchCount} tiết giảng dạy có tên bài hoặc số tiết chưa khớp hoàn toàn với PPCT gốc.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSyncNow}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition"
                  title="Tự động cập nhật tên bài học và số tiết trên TKB khớp 100% với PPCT chính thức"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ Đồng Bộ Ngay Theo PPCT (1-Click)</span>
                </button>
              </div>

              {/* Detailed Audit Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-14 text-center">Khối</th>
                      <th className="p-2.5 w-20 text-center">Lớp</th>
                      <th className="p-2.5 w-28">Buổi dạy</th>
                      <th className="p-2.5 w-16 text-center">Tiết PPCT</th>
                      <th className="p-2.5">Bài học trên TKB hiện tại</th>
                      <th className="p-2.5">Tên bài theo PPCT gốc</th>
                      <th className="p-2.5 w-44">Tình trạng rà soát</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {auditResults.map((res, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 transition ${
                          !res.isMatch ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center font-bold text-blue-700">
                          Khối {res.grade}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">
                          {res.scheduledClassName}
                        </td>
                        <td className="p-2.5 text-slate-600">{res.dayOfWeek}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50/80">
                          {res.period}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900">
                          {res.scheduledTitle}
                        </td>
                        <td className="p-2.5 text-slate-700 italic">
                          {res.ppctTitle}
                        </td>
                        <td className="p-2.5">
                          {res.isMatch ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Check className="w-3.5 h-3.5" /> Khớp PPCT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Cần đối chiếu
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD / IMPORT PPCT */}
          {activeSubTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold">
                    Quy cách nạp Phân phối chương trình (PPCT) cả 3 khối:
                  </p>
                  <p>
                    Hỗ trợ tệp <strong>Word (.docx)</strong>, <strong>Excel/Bảng text</strong> chứa danh sách các tuần (1–35) và tiết học (1–70). Các cột thông thường: <em>Tuần, Tiết, Tên bài học, Ghi chú tích hợp (QPAN, Năng lực số, Môi trường), Thiết bị dạy học</em>.
                  </p>
                </div>
              </div>

              {/* Grade Selector for upload */}
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Khối lớp nạp:</span>
                <select
                  value={uploadGrade}
                  onChange={(e) => setUploadGrade(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-blue-800 text-xs"
                >
                  <option value={0}>Tự động nhận diện (Cả 3 khối K1, K3, K5)</option>
                  <option value={1}>Khối 1 (70 tiết)</option>
                  <option value={3}>Khối 3 (70 tiết)</option>
                  <option value={5}>Khối 5 (70 tiết)</option>
                </select>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 transition cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.txt,.html,.htm,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-3 bg-white text-blue-600 rounded-xl shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">
                    {isProcessingFile ? 'Đang phân tích tệp PPCT...' : 'Bấm để tải tệp Word (.docx) hoặc bảng PPCT'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hỗ trợ tệp kế hoạch dạy học năm môn Giáo dục thể chất từ Sở/Phòng hoặc trường.
                  </p>
                </div>
              </div>

              {/* Or Paste Table */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 text-xs block">
                  Hoặc dán trực tiếp bảng phân phối chương trình từ Word / Excel:
                </label>
                <textarea
                  value={pastePpctText}
                  onChange={(e) => setPastePpctText(e.target.value)}
                  placeholder="Ví dụ dán:&#10;Tuần 9	17	Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 1)	Tích hợp năng lực số 4.1TC1a	SGK, Tranh ảnh&#10;Tuần 9	18	Bài 2: Động tác chân, động tác vặn mình, động tác bụng (tiết 2)	Tích hợp QPAN	SGK, Tranh ảnh..."
                  rows={6}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setPastePpctText('')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={handleApplyPastedText}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs"
                  >
                    Nạp Vào Cơ Sở Dữ Liệu PPCT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BROWSE PPCT 35 WEEKS */}
          {activeSubTab === 'browse' && (
            <div className="space-y-3">
              {/* Filter Bar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Grade Tabs */}
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5">
                    <button
                      onClick={() => setSelectedGrade(1)}
                      className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                        selectedGrade === 1 ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Khối 1
                    </button>
                    <button
                      onClick={() => setSelectedGrade(3)}
                      className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                        selectedGrade === 3 ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Khối 3
                    </button>
                    <button
                      onClick={() => setSelectedGrade(5)}
                      className={`px-3 py-1 rounded-md font-bold text-xs transition ${
                        selectedGrade === 5 ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Khối 5
                    </button>
                  </div>

                  {/* Week Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-semibold text-xs">Tuần:</span>
                    <select
                      value={filterWeek}
                      onChange={(e) => setFilterWeek(parseInt(e.target.value, 10))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                    >
                      <option value={0}>Tất cả 35 tuần</option>
                      {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                        <option key={w} value={w}>
                          Tuần {w} ({w <= 18 ? 'HK I' : 'HK II'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Keyword */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm tên bài, chủ đề, tích hợp..."
                    className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-16 text-center">Tuần</th>
                      <th className="p-2 w-16 text-center">Tiết</th>
                      <th className="p-2 w-48">Chủ đề</th>
                      <th className="p-2">Tên bài học</th>
                      <th className="p-2 w-52">Nội dung tích hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPpct.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Không tìm thấy tiết học nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredPpct.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-2 text-center font-bold text-blue-700">
                            Tuần {item.week}
                          </td>
                          <td className="p-2 text-center font-bold text-slate-900 bg-slate-50/70">
                            {item.period}
                          </td>
                          <td className="p-2 text-slate-600 font-medium text-[11px]">
                            {item.topic}
                          </td>
                          <td className="p-2 font-semibold text-slate-900">
                            {item.lessonTitle}
                          </td>
                          <td className="p-2 text-slate-500 text-[11px] whitespace-pre-line">
                            {item.integrationNotes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
          <div className="text-slate-500">
            Tổng cộng: <strong>{ppctList.length} tiết PPCT</strong> đã lưu trong hệ thống.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Đóng
            </button>
            {activeSubTab === 'audit' && (
              <button
                onClick={handleSyncNow}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Đồng Bộ Vào Kế Hoạch Tuần</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
