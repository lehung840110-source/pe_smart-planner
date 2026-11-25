import React, { useState } from 'react';
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
  Lock,
  Menu,
  X,
  LayoutGrid,
  ChevronRight,
  MessageSquareHeart,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { SchoolSettings } from '../types/gdtc';
import type { AuthUser } from '../contexts/AuthContext';
import { getShortPaidPlanBadge } from '../utils/subscriptionPlans';
import { PWAInstallButton } from './PWAInstallButton';

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
  onOpenLovableStudio?: () => void;
  onOpenFormationLibrary?: () => void;
  onOpenPpctManager?: () => void;
  currentWeek?: number;
  onSelectCurrentWeek?: () => void;
  onOpenBackupRestore?: () => void;
  authUser?: AuthUser | null;
  isGuest?: boolean;
  onOpenAuth?: () => void;
  activeLayoutBlueprintName?: string | null;
  showToast?: (msg: string) => void;
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
  onOpenLovableStudio,
  onOpenFormationLibrary,
  onOpenPpctManager,
  currentWeek = 9,
  onSelectCurrentWeek,
  onOpenBackupRestore,
  authUser,
  isGuest = false,
  onOpenAuth,
  activeLayoutBlueprintName = null,
  showToast,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'tab-scan', label: '1. Quét & Bóc Tách SGK', shortLabel: 'Quét SGK', icon: ScanLine, memberOnly: true },
    { id: 'tab-img-library', label: `2. Thư Viện Ảnh (${imageCount})`, shortLabel: 'Thư viện', icon: Images, memberOnly: false },
    { id: 'tab-extract', label: '3. Giáo Án Mẫu & Sửa Trực Tiếp', shortLabel: 'GA Mẫu', icon: FileSpreadsheet, memberOnly: true },
    { id: 'tab-library', label: '4. Thư Viện Kịch Bản', shortLabel: 'Kịch bản', icon: BookOpen, memberOnly: false },
    { id: 'tab-generator', label: '5. Sinh Giáo Án Tuần Mới', shortLabel: 'Sinh GA', icon: Wand2, memberOnly: false },
    { id: 'tab-export', label: '6. Xem Trước & In', shortLabel: 'Xem & In', icon: Printer, memberOnly: false },
    { id: 'tab-template-lab', label: '7. Thử Mẫu Giáo Án', shortLabel: 'Thử mẫu', icon: FlaskConical, memberOnly: false },
    { id: 'tab-intro', label: '8. Giới Thiệu & Hướng Dẫn', shortLabel: 'Hướng dẫn', icon: Info, memberOnly: false },
    { id: 'tab-feedback', label: '9. Đánh Giá & Góp Ý', shortLabel: 'Đánh giá', icon: MessageSquareHeart, memberOnly: false },
  ];

  const mobileBottomTabs = [
    { id: 'tab-generator', label: 'Sinh GA', icon: Wand2 },
    { id: 'tab-export', label: 'Xem & In', icon: Printer },
    { id: 'tab-template-lab', label: 'Thử mẫu', icon: FlaskConical },
    { id: 'tab-img-library', label: 'Ảnh SGK', icon: Images },
  ];

  const handleMobileSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const runToolAndClose = (fn?: () => void) => {
    setIsMobileMenuOpen(false);
    if (fn) fn();
  };

  const isDrawerTabActive =
    activeTab === 'tab-scan' ||
    activeTab === 'tab-extract' ||
    activeTab === 'tab-library' ||
    activeTab === 'tab-intro' ||
    activeTab === 'tab-feedback';

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Compact Mobile Top Bar (< md) */}
          <div className="flex md:hidden justify-between items-center h-14 gap-2">
            {/* Brand Zone */}
            <button
              type="button"
              onClick={() => setActiveTab('tab-generator')}
              className="flex items-center gap-2 min-w-0 text-left"
            >
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-xs flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight whitespace-nowrap truncate">
                  PE SmartPlan <span className="text-blue-600">2.0</span>
                </h1>
                <p className="text-[10.5px] text-slate-500 whitespace-nowrap truncate">
                  GDPT 2018 · Tuần {currentWeek}
                </p>
              </div>
            </button>

            {/* Right 3 Thumb-Friendly Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onSelectCurrentWeek && (
                <button
                  type="button"
                  onClick={onSelectCurrentWeek}
                  className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0 transition"
                  title={`Xem Kế hoạch bài dạy Tuần ${currentWeek}`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                  <span className="tabular-nums">T.{currentWeek}</span>
                </button>
              )}

              {onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className={`min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition ${
                    authUser
                      ? authUser.hasFullAccess === false
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-900 text-white'
                  }`}
                  title={
                    authUser
                      ? authUser.planTier === 'admin_lifetime'
                        ? `Quản trị viên: ${authUser.email}`
                        : authUser.hasFullAccess === false
                        ? `Hết hạn dùng thử — Bấm để gia hạn`
                        : `${authUser.fullName} · Còn ${authUser.daysRemaining ?? 120} ngày Full`
                      : 'Đăng nhập 1 chạm (không mật khẩu) · Miễn phí trọn 1 học kỳ'
                  }
                  aria-label={authUser ? 'Tài khoản' : 'Đăng nhập'}
                >
                  {authUser ? (
                    <>
                      <UserCheck
                        className={`w-4 h-4 ${
                          authUser.hasFullAccess === false ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      />
                      <span className="text-[10px] font-extrabold tabular-nums">
                        {authUser.planTier === 'admin_lifetime'
                          ? 'Admin'
                          : authUser.hasFullAccess === false
                          ? 'Gia hạn'
                          : authUser.planTier === 'paid'
                          ? `${getShortPaidPlanBadge(authUser.paidPlanId)}·${authUser.daysRemaining ?? 7}n`
                          : `Free·${authUser.daysRemaining ?? 120}n`}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.09z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z" />
                      </svg>
                      <span className="text-[11px] font-bold">Google</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="min-h-[40px] min-w-[40px] p-2 rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition"
                aria-label="Mở menu chức năng và công cụ"
                title="Mở tất cả tab & công cụ"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop & Tablet Header (>= md) */}
          <div className="hidden md:flex justify-between h-16 items-center gap-3">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
                <Activity className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                    PE SmartPlan
                  </h1>
                  <span className="text-[11px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-md whitespace-nowrap tabular-nums">
                    v2.0
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap hidden lg:inline">
                    GDPT 2018
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden xl:block whitespace-nowrap">
                  Bóc tách ảnh SGK · Thư viện kịch bản · Sinh kế hoạch bài dạy chuẩn
                </p>
              </div>
            </div>

            {/* Teacher and School badge + Quick tools (scrollable middle) + Pinned Account/Google Login on right */}
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 min-w-0">
                {onSelectCurrentWeek && (
                  <button
                    onClick={onSelectCurrentWeek}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition whitespace-nowrap shrink-0 tabular-nums"
                    title={`Nhấn để mở Kế hoạch bài dạy Tuần ${currentWeek} hiện hành`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden xl:inline">TUẦN HIỆN HÀNH ({currentWeek})</span>
                    <span className="xl:hidden">TUẦN {currentWeek}</span>
                  </button>
                )}

                {onOpenFormationLibrary && (
                  <button
                    onClick={onOpenFormationLibrary}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title={isGuest ? 'Đăng nhập để mở & chèn từ Kho Sơ Đồ' : 'Mở Kho 32+ sơ đồ đội hình thể dục chuẩn và chèn vào giáo án'}
                  >
                    <Users className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                    <span className="hidden xl:inline">Kho Sơ Đồ</span>
                    {isGuest && <Lock className="w-3 h-3 text-amber-300 shrink-0" />}
                  </button>
                )}

                {onOpenFormationStudio && (
                  <button
                    onClick={onOpenFormationStudio}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title={isGuest ? 'Đăng nhập để mở Studio Đội Hình' : 'Mở Studio thiết kế & sinh sơ đồ đội hình thể dục'}
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden xl:inline">Studio Đội Hình</span>
                    {isGuest && <Lock className="w-3 h-3 text-amber-300 shrink-0" />}
                  </button>
                )}

                {onOpenLovableStudio && (
                  <button
                    onClick={onOpenLovableStudio}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title="Mở ứng dụng tạo hình ảnh minh họa Lovable tích hợp sẵn và lưu thẳng vào Giáo án"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span className="hidden xl:inline">Ảnh Lovable</span>
                  </button>
                )}

                {onOpenPpctManager && (
                  <button
                    onClick={onOpenPpctManager}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title="Mở bảng Phân phối chương trình (PPCT) cả 5 khối và rà soát tiến độ tuần"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span className="hidden 2xl:inline">PPCT 5 Khối</span>
                  </button>
                )}

                {onOpenImport && (
                  <button
                    onClick={onOpenImport}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title={isGuest ? 'Đăng nhập để Nạp & phân tích file giáo án mới' : 'Nạp & phân tích đa nhiệm giáo án mới từ file Word (.docx), PDF, HTML hoặc JSON'}
                  >
                    <FileUp className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden 2xl:inline">Nạp File</span>
                    {isGuest && <Lock className="w-3 h-3 text-amber-300 shrink-0" />}
                  </button>
                )}

                {onOpenGoogleDrive && (
                  <button
                    onClick={onOpenGoogleDrive}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title={isGuest ? 'Đăng nhập để kết nối Google Drive & Google Docs' : 'Lưu & xem kế hoạch bài dạy trên Google Docs / Google Drive'}
                  >
                    <HardDrive className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden 2xl:inline">Google Drive</span>
                    {isGuest && <Lock className="w-3 h-3 text-amber-100 shrink-0" />}
                  </button>
                )}

                {onOpenBackupRestore && (
                  <button
                    onClick={onOpenBackupRestore}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-2xs transition whitespace-nowrap shrink-0"
                    title="Sao lưu & Khôi phục toàn bộ ảnh và giáo án (Chuyển dữ liệu sang Vercel / Máy khác)"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden 2xl:inline">Sao Lưu</span>
                  </button>
                )}

                <PWAInstallButton variant="desktop" showToast={showToast} />
              </div>

              {/* Pinned Account / Google Sign-In + Settings (Never clipped off-screen) */}
              <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-2xs transition whitespace-nowrap shrink-0 ${
                      authUser
                        ? authUser.hasFullAccess === false
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white hover:bg-blue-50 text-slate-900 border-2 border-blue-600'
                    }`}
                    title={
                      authUser
                        ? authUser.planTier === 'admin_lifetime'
                          ? `Quản trị viên: ${authUser.email} (Toàn quyền vĩnh viễn) — Bấm để quản lý tài khoản / đổi tài khoản Google`
                          : authUser.hasFullAccess === false
                          ? `Đã kết thúc giai đoạn trải nghiệm — Bấm để xem hỗ trợ & nhập mã kích hoạt`
                          : `Đang đăng nhập: ${authUser.email} · Còn ${authUser.daysRemaining ?? 120} ngày Full`
                        : 'Đăng nhập bằng tài khoản Google (1 chạm · Không mật khẩu) · Mở Full miễn phí trọn 1 học kỳ'
                    }
                  >
                    {authUser ? (
                      <>
                        <UserCheck
                          className={`w-3.5 h-3.5 shrink-0 ${
                            authUser.hasFullAccess === false ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        />
                        <span className="max-w-[92px] truncate">{authUser.fullName}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold tabular-nums ${
                            authUser.planTier === 'admin_lifetime'
                              ? 'bg-indigo-600 text-white'
                              : authUser.hasFullAccess === false
                              ? 'bg-amber-600 text-white'
                              : authUser.planTier === 'paid'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {authUser.planTier === 'admin_lifetime'
                            ? 'Admin'
                            : authUser.hasFullAccess === false
                            ? 'Gia hạn'
                            : authUser.planTier === 'paid'
                            ? `${getShortPaidPlanBadge(authUser.paidPlanId)} · ${authUser.daysRemaining ?? 7}n`
                            : `Miễn phí · ${authUser.daysRemaining ?? 120}n`}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.09z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z" />
                        </svg>
                        <span>Đăng nhập Google</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs text-slate-700 font-medium whitespace-nowrap shrink-0"
                  title={isGuest ? 'Đăng nhập để chỉnh sửa thông tin trường & giáo viên' : `Cài đặt trường & GV: ${schoolSettings.teacherName} · ${schoolSettings.schoolName}`}
                >
                  <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden 2xl:inline font-semibold text-slate-900 max-w-[110px] truncate">
                    {schoolSettings.teacherName}
                  </span>
                  {isGuest ? <Lock className="w-3 h-3 text-amber-500 shrink-0" /> : <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                </button>

                <button
                  onClick={onResetData}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
                  title={isGuest ? 'Đăng nhập để khôi phục dữ liệu ban đầu' : 'Khôi phục dữ liệu ban đầu'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop & Tablet Tab Navigation (>= md) */}
          <nav className="hidden md:flex space-x-2 -mb-px overflow-x-auto scrollbar-none py-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const showLock = isGuest && tab.memberOnly;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3.5 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'tab-template-lab' && activeLayoutBlueprintName && (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                      title={`Đang áp dụng mẫu riêng: ${activeLayoutBlueprintName}`}
                    />
                  )}
                  {showLock && (
                    <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (< md) */}
      <nav
        aria-label="Điều hướng chính trên điện thoại"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-safe no-print"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {mobileBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMobileSelectTab(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.4]' : 'text-slate-400'}`} />
                <span className="text-[10.5px] leading-none whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
              isMobileMenuOpen || isDrawerTabActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 font-medium'
            }`}
          >
            <LayoutGrid className={`w-5 h-5 ${isMobileMenuOpen || isDrawerTabActive ? 'text-blue-600 stroke-[2.4]' : 'text-slate-400'}`} />
            <span className="text-[10.5px] leading-none whitespace-nowrap">Tất cả</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Sheet Drawer: All 7 Tabs + All Quick Tools */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end no-print"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full max-h-[86vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Sheet Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">Danh Mục &amp; Công Cụ</h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {authUser ? `${authUser.fullName} · ${schoolSettings.schoolName}` : schoolSettings.schoolName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-4 py-3 space-y-5">
              {/* All Tabs */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-2">Các màn hình chính ({navTabs.length} tab)</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const showLock = isGuest && tab.memberOnly;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleMobileSelectTab(tab.id)}
                        className={`w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition ${
                          isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-white text-slate-800 active:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs truncate">{tab.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {showLock && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Tools Grid */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-2">Công cụ giảng dạy &amp; Tài khoản</p>
                <div className="grid grid-cols-2 gap-2">
                  {onOpenPpctManager && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenPpctManager)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-emerald-100"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="leading-tight">PPCT 5 Khối</span>
                    </button>
                  )}

                  {onOpenFormationLibrary && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenFormationLibrary)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-blue-100"
                    >
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="leading-tight flex-1">Kho Sơ Đồ</span>
                      {isGuest && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    </button>
                  )}

                  {onOpenFormationStudio && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenFormationStudio)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-indigo-100"
                    >
                      <Palette className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="leading-tight flex-1">Studio Đội Hình</span>
                      {isGuest && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    </button>
                  )}

                  {onOpenLovableStudio && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenLovableStudio)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-fuchsia-100"
                    >
                      <Sparkles className="w-4 h-4 text-fuchsia-600 shrink-0" />
                      <span className="leading-tight flex-1">Studio Ảnh Lovable</span>
                    </button>
                  )}

                  {onOpenImport && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenImport)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-sky-100"
                    >
                      <FileUp className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="leading-tight flex-1">Nạp File Giáo Án</span>
                      {isGuest && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    </button>
                  )}

                  {onOpenGoogleDrive && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenGoogleDrive)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-amber-100"
                    >
                      <HardDrive className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="leading-tight flex-1">Google Docs / Drive</span>
                      {isGuest && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    </button>
                  )}

                  {onOpenBackupRestore && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenBackupRestore)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-teal-100"
                    >
                      <Database className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="leading-tight flex-1">Sao Lưu / Khôi Phục</span>
                    </button>
                  )}

                  <PWAInstallButton variant="mobile" showToast={showToast} />

                  <button
                    type="button"
                    onClick={() => runToolAndClose(onOpenSettings)}
                    className="min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 text-left active:bg-slate-100"
                  >
                    <Settings className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="leading-tight flex-1">Cài đặt Trường &amp; GV</span>
                    {isGuest && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                  </button>

                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => runToolAndClose(onOpenAuth)}
                      className="min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-2 text-left active:bg-slate-800"
                    >
                      {authUser ? (
                        <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <LogIn className="w-4 h-4 text-sky-300 shrink-0" />
                      )}
                      <span className="leading-tight truncate">
                        {authUser ? authUser.fullName : 'Đăng nhập Google'}
                      </span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => runToolAndClose(onResetData)}
                  className="mt-2.5 w-full min-h-[44px] px-3 py-2 rounded-xl border border-red-200 bg-red-50/70 text-red-700 font-semibold text-xs flex items-center justify-center gap-2 active:bg-red-100"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Khôi phục dữ liệu ban đầu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
