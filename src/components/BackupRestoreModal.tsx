import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Database,
  Save,
  Clock,
  ShieldCheck,
  FileJson,
  Sparkles
} from 'lucide-react';
import { SgkImageItem, ScenarioItem, SchoolSettings, LessonRow } from '../types/gdtc';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import {
  getAllImagesDB,
  saveImagesDB,
  getAllScenariosDB,
  saveScenariosDB,
  getAppStateDB,
  setAppStateDB,
  getStorageEstimate
} from '../utils/db';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: SgkImageItem[];
  scenarios: ScenarioItem[];
  schoolSettings: SchoolSettings;
  allMasterPlans: Record<string, MasterPlanItem>;
  currentMasterPlan: MasterPlanItem;
  lessonRows: LessonRow[];
  activeWeek: number;
  activeGrade: number;
  activeLessonNum: number;
  activeTopic: string;
  activeTitle: string;
  onRestoreSuccess: (restoredData: {
    images?: SgkImageItem[];
    scenarios?: ScenarioItem[];
    schoolSettings?: SchoolSettings;
    allMasterPlans?: Record<string, MasterPlanItem>;
    currentMasterPlan?: MasterPlanItem;
    lessonRows?: LessonRow[];
    activeWeek?: number;
    activeGrade?: number;
    activeLessonNum?: number;
    activeTopic?: string;
    activeTitle?: string;
  }) => void;
  showToast: (msg: string) => void;
}

export interface BackupDataPackage {
  version: number;
  generator: string;
  timestamp: number;
  exportDate: string;
  schoolSettings: SchoolSettings;
  images: SgkImageItem[];
  scenarios: ScenarioItem[];
  allMasterPlans: Record<string, MasterPlanItem>;
  currentMasterPlan: MasterPlanItem;
  lessonRows: LessonRow[];
  activeState: {
    week: number;
    grade: number;
    lessonNum: number;
    topic: string;
    title: string;
  };
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  images,
  scenarios,
  schoolSettings,
  allMasterPlans,
  currentMasterPlan,
  lessonRows,
  activeWeek,
  activeGrade,
  activeLessonNum,
  activeTopic,
  activeTitle,
  onRestoreSuccess,
  showToast
}) => {
  const [storageInfo, setStorageInfo] = useState<{ usedMB: string; quotaMB: string }>({
    usedMB: '0.00',
    quotaMB: '...'
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isForceSaving, setIsForceSaving] = useState<boolean>(false);
  const [previewBackup, setPreviewBackup] = useState<BackupDataPackage | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa xong');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      getStorageEstimate().then(setStorageInfo);
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Export entire application data into a single .json file
  const handleExportBackup = async () => {
    setIsExporting(true);
    showToast('📦 Đang thu thập và đóng gói toàn bộ dữ liệu (Kho ảnh, Kế hoạch bài dạy, Kịch bản)...');

    try {
      // Ensure we fetch latest images directly from IndexedDB in case some were just added
      const dbImages = await getAllImagesDB();
      const exportImages = dbImages && dbImages.length > 0 ? dbImages : images;

      const dbScenarios = await getAllScenariosDB();
      const exportScenarios = dbScenarios && dbScenarios.length > 0 ? dbScenarios : scenarios;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const backupPackage: BackupDataPackage = {
        version: 2,
        generator: 'SmartPlan GDTC Pro - GDPT 2018',
        timestamp: Date.now(),
        exportDate: now.toLocaleString('vi-VN'),
        schoolSettings,
        images: exportImages,
        scenarios: exportScenarios,
        allMasterPlans,
        currentMasterPlan,
        lessonRows,
        activeState: {
          week: activeWeek,
          grade: activeGrade,
          lessonNum: activeLessonNum,
          topic: activeTopic,
          title: activeTitle
        }
      };

      const jsonStr = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const safeTeacher = (schoolSettings.teacherName || 'GiaoVien').replace(/\s+/g, '_');
      a.download = `Sao_Luu_SmartPlan_GDTC_${safeTeacher}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`✅ Đã xuất thành công file sao lưu chứa ${exportImages.length} ảnh và toàn bộ giáo án!`);
    } catch (err: any) {
      showToast('Lỗi khi xuất file sao lưu: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Select and Preview File before restoring
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      try {
        const text = loadEvt.target?.result as string;
        const parsed: BackupDataPackage = JSON.parse(text);

        if (!parsed.images && !parsed.allMasterPlans && !parsed.schoolSettings) {
          throw new Error('Định dạng file sao lưu không hợp lệ.');
        }

        setPreviewBackup(parsed);
        showToast('📄 Đã đọc tệp sao lưu. Vui lòng bấm "Xác Nhận Khôi Phục" để áp dụng.');
      } catch (err: any) {
        showToast('Lỗi đọc tệp sao lưu: ' + err?.message);
        setPreviewBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm and restore into IndexedDB + State
  const handleConfirmRestore = async () => {
    if (!previewBackup) return;

    setIsImporting(true);
    showToast('🔄 Đang nạp dữ liệu vào cơ sở dữ liệu IndexedDB của trình duyệt...');

    try {
      if (previewBackup.images && Array.isArray(previewBackup.images)) {
        await saveImagesDB(previewBackup.images);
      }

      if (previewBackup.scenarios && Array.isArray(previewBackup.scenarios)) {
        await saveScenariosDB(previewBackup.scenarios);
      }

      if (previewBackup.schoolSettings) {
        await setAppStateDB('school_settings', previewBackup.schoolSettings);
      }

      if (previewBackup.allMasterPlans) {
        await setAppStateDB('gdtc_all_master_plans', previewBackup.allMasterPlans);
      }

      if (previewBackup.currentMasterPlan) {
        await setAppStateDB('master_plan', previewBackup.currentMasterPlan);
      }

      if (previewBackup.lessonRows) {
        await setAppStateDB('current_lesson_rows', previewBackup.lessonRows);
      }

      if (previewBackup.activeState) {
        await setAppStateDB('active_week', previewBackup.activeState.week);
        await setAppStateDB('active_grade', previewBackup.activeState.grade);
        await setAppStateDB('active_lesson_num', previewBackup.activeState.lessonNum);
        await setAppStateDB('active_topic', previewBackup.activeState.topic);
        await setAppStateDB('active_title', previewBackup.activeState.title);
      }

      // Also store backup mirror in localStorage for fail-safe
      try {
        localStorage.setItem(
          'gdtc_backup_metadata',
          JSON.stringify({
            timestamp: Date.now(),
            imageCount: previewBackup.images?.length || 0,
            plansCount: Object.keys(previewBackup.allMasterPlans || {}).length,
            teacher: previewBackup.schoolSettings?.teacherName
          })
        );
      } catch {
        // ignore quota issues
      }

      onRestoreSuccess({
        images: previewBackup.images,
        scenarios: previewBackup.scenarios,
        schoolSettings: previewBackup.schoolSettings,
        allMasterPlans: previewBackup.allMasterPlans,
        currentMasterPlan: previewBackup.currentMasterPlan,
        lessonRows: previewBackup.lessonRows,
        activeWeek: previewBackup.activeState?.week,
        activeGrade: previewBackup.activeState?.grade,
        activeLessonNum: previewBackup.activeState?.lessonNum,
        activeTopic: previewBackup.activeState?.topic,
        activeTitle: previewBackup.activeState?.title
      });

      showToast('🎉 Đã khôi phục hoàn tất 100% dữ liệu từ file sao lưu!');
      setPreviewBackup(null);
      onClose();
    } catch (err: any) {
      showToast('Lỗi khi khôi phục dữ liệu: ' + err?.message);
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Force Save right now (IndexedDB + Mirror)
  const handleForceSave = async () => {
    setIsForceSaving(true);
    try {
      await saveImagesDB(images);
      await saveScenariosDB(scenarios);
      await setAppStateDB('school_settings', schoolSettings);
      await setAppStateDB('gdtc_all_master_plans', allMasterPlans);
      await setAppStateDB('master_plan', currentMasterPlan);
      await setAppStateDB('current_lesson_rows', lessonRows);
      await setAppStateDB('active_week', activeWeek);
      await setAppStateDB('active_grade', activeGrade);
      await setAppStateDB('active_lesson_num', activeLessonNum);
      await setAppStateDB('active_topic', activeTopic);
      await setAppStateDB('active_title', activeTitle);

      const estimate = await getStorageEstimate();
      setStorageInfo(estimate);
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setLastSyncTime(timeStr);
      showToast(`💾 Đã lưu dữ liệu tức thì thành công lúc ${timeStr}!`);
    } catch (err: any) {
      showToast('Lỗi khi lưu: ' + err?.message);
    } finally {
      setIsForceSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Trung Tâm Sao Lưu & Khôi Phục Dữ Liệu</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Bảo vệ dữ liệu khi chạy trên Vercel · Xuất & Nhập file JSON độc lập 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-slate-50 text-xs">
          
          {/* Vercel Cloud Advisory Notice */}
          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3 text-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="font-bold text-blue-900">
                💡 Hướng dẫn cho Thầy khi ứng dụng triển khai trên Vercel:
              </p>
              <p>
                1. <strong>Tự động lưu vào trình duyệt:</strong> Toàn bộ hình ảnh tải lên, ảnh phục chế, và giáo án Thầy sửa được tự động lưu vào <strong>IndexedDB</strong> của trình duyệt máy tính.
              </p>
              <p>
                2. <strong>Để không bao giờ mất dữ liệu:</strong> Mỗi khi kết thúc buổi làm việc hoặc khi muốn chuyển giáo án sang máy tính trường / máy tính ở nhà, Thầy bấm nút <strong>"📥 Xuất File Sao Lưu (.json)"</strong> bên dưới để tải về một file nhỏ gọn. Khi mở ở máy mới hoặc Vercel, chỉ cần bấm <strong>"Khôi Phục"</strong> là 100% mọi thứ trở lại nguyên vẹn!
              </p>
            </div>
          </div>

          {/* Current Browser Storage Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                Trạng Thái Bộ Nhớ Trình Duyệt Hiện Tại
              </span>
              <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Lần lưu gần nhất: <strong>{lastSyncTime}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Kho hình ảnh</span>
                <span className="text-sm font-bold text-blue-600">{images.length} ảnh</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Kế hoạch bài dạy</span>
                <span className="text-sm font-bold text-emerald-600">{Object.keys(allMasterPlans).length} bài</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Dung lượng sử dụng</span>
                <span className="text-sm font-bold text-purple-600">{storageInfo.usedMB} MB</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cơ chế tự động lưu IndexedDB đang kích hoạt
              </span>
              <button
                disabled={isForceSaving}
                onClick={handleForceSave}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-300 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isForceSaving ? 'Đang lưu...' : 'Lưu Tức Thì Ngay'}</span>
              </button>
            </div>
          </div>

          {/* Action Grid: Export & Import */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Box 1: Export Backup */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  1. Xuất Toàn Bộ Dữ Liệu Ra File (.json)
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Tải về 1 file sao lưu duy nhất chứa toàn bộ {images.length} ảnh (kể cả ảnh Thầy vẽ lại, ảnh scan) và tất cả giáo án đã soạn.
                </p>
              </div>

              <button
                disabled={isExporting}
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang Đóng Gói...' : '📥 Tải File Sao Lưu Về Máy'}</span>
              </button>
            </div>

            {/* Box 2: Import Backup */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  2. Khôi Phục Dữ Liệu Từ File (.json)
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Chọn file <code>.json</code> đã sao lưu trước đó để nạp lại đầy đủ hình ảnh và giáo án trên Vercel hay máy tính mới.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FileJson className="w-4 h-4 text-emerald-600" />
                <span>Chọn File Sao Lưu Để Khôi Phục</span>
              </button>
            </div>
          </div>

          {/* Backup Preview Dialog if file selected */}
          {previewBackup && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  File sao lưu hợp lệ: {previewBackup.exportDate}
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  Sẵn sàng khôi phục
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Giáo viên</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {previewBackup.schoolSettings?.teacherName || 'Chưa đặt'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Số hình ảnh</span>
                  <span className="font-bold text-blue-600">
                    {previewBackup.images?.length || 0} ảnh
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Số bài giáo án</span>
                  <span className="font-bold text-emerald-600">
                    {Object.keys(previewBackup.allMasterPlans || {}).length} bài
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Trường</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {previewBackup.schoolSettings?.schoolName || 'Tiểu học'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setPreviewBackup(null)}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-lg font-bold border border-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isImporting}
                  onClick={handleConfirmRestore}
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isImporting ? 'Đang Khôi Phục...' : 'Xác Nhận Khôi Phục Toàn Bộ'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs transition"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};
