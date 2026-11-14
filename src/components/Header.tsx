import React from 'react';
import {
  Activity,
  ScanLine,
  Images,
  FileSpreadsheet,
  BookOpen,
  Wand2,
  Printer,
  RotateCcw,
  Settings,
  Sparkles,
  School,
  FileUp,
  Palette,
  Users,
  Calendar,
  HardDrive,
  Database,
  LogIn,
  UserCheck,
  Info,
  Lock
} from 'lucide-react';
import { SchoolSettings } from '../types/gdtc';
import type { AuthUser } from '../contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  imageCount: number;
  schoolSettings: SchoolSettings;
  onOpenSettings: () => void;
  onResetData: () => void;
  onOpenImport?: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenFormationStudio?: () => void;
  onOpenFormationLibrary?: () => void;
  onOpenPpctManager?: () => void;
  currentWeek?: number;
  onSelectCurrentWeek?: () => void;
  onOpenBackupRestore?: () => void;
  authUser?: AuthUser | null;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  imageCount,
  schoolSettings,
  onOpenSettings,
  onResetData,
  onOpenImport,
  onOpenGoogleDrive,
  onOpenFormationStudio,
  onOpenFormationLibrary,
  onOpenPpctManager,
  currentWeek = 9,
  onSelectCurrentWeek,
  onOpenBackupRestore,
  authUser,
  isGuest = false,
  onOpenAuth,
}) => {
  const navTabs = [
    { id: 'tab-scan', label: '1. Quét & Bóc Tách SGK', icon: ScanLine, memberOnly: true },
    { id: 'tab-img-library', label: `2. Thư Viện Ảnh (${imageCount})`, icon: Images, memberOnly: false },
    { id: 'tab-extract', label: '3. Giáo Án Mẫu & Sửa Trực Tiếp', icon: FileSpreadsheet, memberOnly: true },
    { id: 'tab-library', label: '4. Thư Viện Kịch Bản', icon: BookOpen, memberOnly: false },
    { id: 'tab-generator', label: '5. Sinh Giáo Án Tuần Mới', icon: Wand2, memberOnly: false },
    { id: 'tab-export', label: '6. Xem Trước & In', icon: Printer, memberOnly: false },
    { id: 'tab-intro', label: '7. Giới Thiệu & Hướng Dẫn', icon: Info, memberOnly: false },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                  SmartPlan GDTC Pro
                </h1>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Bóc tách ảnh SGK · Thư viện kịch bản · Sinh kế hoạch bài dạy chuẩn
              </p>
            </div>
          </div>

          {/* Teacher and School badge + Quick tools */}
          <div className="flex items-center space-x-2">
            {onSelectCurrentWeek && (
              <button
                onClick={onSelectCurrentWeek}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition animate-pulse hover:animate-none"
                title={`Nhấn để mở Kế hoạch bài dạy Tuần ${currentWeek} hiện hành`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>TUẦN HIỆN HÀNH ({currentWeek})</span>
              </button>
            )}

            {onOpenFormationLibrary && (
              <button
                onClick={onOpenFormationLibrary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-2xs transition"
                title={isGuest ? 'Đăng nhập để mở & chèn từ Kho Sơ Đồ' : 'Mở Kho 32+ sơ đồ đội hình thể dục chuẩn và chèn vào giáo án'}
              >
                <Users className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden sm:inline">Kho Sơ Đồ</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
              </button>
            )}

            {onOpenFormationStudio && (
              <button
                onClick={onOpenFormationStudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-2xs transition"
                title={isGuest ? 'Đăng nhập để mở Studio Đội Hình' : 'Mở Studio thiết kế & sinh sơ đồ đội hình thể dục'}
              >
                <Palette className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Studio Đội Hình</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
              </button>
            )}

            {onOpenPpctManager && (
              <button
                onClick={onOpenPpctManager}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition"
                title="Mở bảng Phân phối chương trình (PPCT) cả 3 khối và rà soát tiến độ tuần"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">PPCT 3 Khối</span>
              </button>
            )}

            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition"
                title={isGuest ? 'Đăng nhập để Nạp & phân tích file giáo án mới' : 'Nạp & phân tích đa nhiệm giáo án mới từ file Word (.docx), PDF, HTML hoặc JSON'}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nạp File Giáo Án</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
              </button>
            )}

            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition"
                title={isGuest ? 'Đăng nhập để kết nối Google Drive' : 'Đồng bộ kế hoạch bài dạy với Google Drive'}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Drive</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-100" />}
              </button>
            )}

            {onOpenBackupRestore && (
              <button
                onClick={onOpenBackupRestore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-2xs transition"
                title={isGuest ? 'Đăng nhập để Sao lưu & Khôi phục dữ liệu' : 'Sao lưu & Khôi phục dữ liệu (Bảo vệ dữ liệu khi chạy trên Vercel / Chuyển máy)'}
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Sao Lưu / Khôi Phục</span>
                {isGuest && <Lock className="w-3 h-3 text-amber-300" />}
              </button>
            )}

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-2xs transition ${
                  authUser
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                title={authUser ? `Đang đăng nhập: ${authUser.email}` : 'Đăng nhập hoặc Đăng ký tài khoản giáo viên'}
              >
                {authUser ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline max-w-[110px] truncate">{authUser.fullName}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-sky-300" />
                    <span className="hidden sm:inline">Đăng nhập / ĐK</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs text-slate-700 font-medium"
              title={isGuest ? 'Đăng nhập để chỉnh sửa thông tin trường & giáo viên' : 'Cài đặt thông tin trường và giáo viên'}
            >
              <School className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline font-semibold text-slate-900">
                {schoolSettings.teacherName}
              </span>
              <span className="hidden lg:inline text-slate-400">·</span>
              <span className="hidden lg:inline text-slate-500 truncate max-w-[150px]">
                {schoolSettings.schoolName}
              </span>
              {isGuest ? <Lock className="w-3 h-3 text-amber-500 ml-0.5" /> : <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
            </button>

            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
              title={isGuest ? 'Đăng nhập để khôi phục dữ liệu ban đầu' : 'Khôi phục dữ liệu ban đầu'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-2 -mb-px overflow-x-auto scrollbar-none py-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showLock = isGuest && tab.memberOnly;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {showLock && (
                  <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
