import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  MonitorDown,
  X,
  CheckCircle2,
  Laptop,
  Smartphone,
  HardDriveDownload,
  WifiOff,
  Package,
  Share,
  ExternalLink,
  FolderArchive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'desktop' | 'mobile';
  onAfterClick?: () => void;
  showToast?: (msg: string) => void;
}

const START_BAT_CONTENT = `@echo off
chcp 65001 >nul
title PE SmartPlan 2.0 - Khoi dong che do Offline
cd /d "%~dp0\\.."

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai Node.js. Hay cai tai https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" call npm install
if not exist "dist\\index.html" call npm run build

set NODE_ENV=production
set PORT=3000
start "" /b cmd /c "npx tsx server.ts"
timeout /t 3 /nobreak >nul

set "EDGE=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
set "EDGE64=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"
set "CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"

if exist "%EDGE%" (
    start "" "%EDGE%" --app=http://localhost:3000
) else if exist "%EDGE64%" (
    start "" "%EDGE64%" --app=http://localhost:3000
) else if exist "%CHROME%" (
    start "" "%CHROME%" --app=http://localhost:3000
) else (
    start "" "http://localhost:3000"
)

echo PE SmartPlan 2.0 dang chay OFFLINE tai http://localhost:3000
pause
`;

const BUILD_EXE_BAT_CONTENT = `@echo off
chcp 65001 >nul
title Dong goi PE SmartPlan 2.0 thanh file cai dat Windows (.exe)
cd /d "%~dp0\\.."

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Chua cai Node.js. Hay tai Node.js LTS tai https://nodejs.org
    pause
    exit /b 1
)

call npm install || pause & exit /b 1
call npm run build || pause & exit /b 1
call npm install --no-save electron electron-builder || pause & exit /b 1
call npx electron-builder --config desktop/electron-builder.json --win || pause & exit /b 1
explorer release
pause
`;

const README_OFFLINE_CONTENT = `HƯỚNG DẪN CÀI ĐẶT OFFLINE PE SMARTPLAN 2.0 TRÊN MÁY TÍNH WINDOWS
================================================================

1. CÀI NHANH DẠNG ỨNG DỤNG DESKTOP (PWA - KHÔNG CẦN NODE.JS):
   - Mở trang ứng dụng bằng Chrome hoặc Microsoft Edge.
   - Bấm nút "Cài Offline" trên thanh công cụ (hoặc biểu tượng Cài đặt trên thanh địa chỉ trình duyệt).
   - Chọn "Cài đặt" -> Biểu tượng PE SmartPlan 2.0 sẽ xuất hiện ngay trên Desktop & Start Menu và chạy Offline.

2. ĐÓNG GÓI THÀNH FILE CÀI ĐẶT WINDOWS (.EXE) HOẶC CHẠY OFFLINE QUA THƯ MỤC:
   - Tải mã nguồn ứng dụng về máy tính và giải nén.
   - Copy thư mục "desktop" (trong gói này) vào thư mục gốc của dự án (nếu chưa có).
   - Chạy Offline ngay: nháy đúp desktop\\Start-SmartPlan-Offline.bat
   - Đóng gói ra file Setup.exe & Portable.exe: nháy đúp desktop\\Build-Installer-EXE.bat
     (File .exe sẽ được xuất ra trong thư mục release\\).
`;

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'desktop',
  onAfterClick,
  showToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isEmbeddedIframe, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadingKit, setIsDownloadingKit] = useState(false);

  // Suppress button automatically when already running as an installed standalone Desktop/Mobile app
  if (isInstalled) {
    return null;
  }

  const handleTriggerClick = () => {
    setIsModalOpen(true);
    onAfterClick?.();
  };

  const handleNativeInstall = async () => {
    const accepted = await install();
    if (accepted) {
      setIsModalOpen(false);
      showToast?.('Đã cài đặt PE SmartPlan 2.0 lên máy tính! Thầy có thể mở trực tiếp từ Desktop ở chế độ Offline.');
    }
  };

  const handleDownloadWindowsKit = async () => {
    try {
      setIsDownloadingKit(true);
      const zip = new JSZip();
      const folder = zip.folder('desktop');
      folder?.file('Start-SmartPlan-Offline.bat', START_BAT_CONTENT);
      folder?.file('Build-Installer-EXE.bat', BUILD_EXE_BAT_CONTENT);
      folder?.file('HUONG_DAN_CAI_DAT_OFFLINE.txt', README_OFFLINE_CONTENT);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PE-SmartPlan-2.0-Windows-Offline-Kit.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast?.('Đã tải gói script đóng gói Offline Windows (.zip) về máy!');
    } catch {
      showToast?.('Không thể tạo file tải xuống, thầy thử lại nhé.');
    } finally {
      setIsDownloadingKit(false);
    }
  };

  const openCurrentAppInNewTab = () => {
    const currentUrl = window.location.href;
    const link = document.createElement('a');
    link.href = currentUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {variant === 'desktop' ? (
        <button
          type="button"
          onClick={handleTriggerClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-2xs transition whitespace-nowrap shrink-0 border border-slate-700"
          title="Cài đặt PE SmartPlan 2.0 làm phần mềm Offline trên máy tính Windows / Mac hoặc tải gói đóng gói .exe"
        >
          <MonitorDown className="w-3.5 h-3.5 text-sky-300 shrink-0" />
          <span className="hidden xl:inline">Cài Offline</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTriggerClick}
          className="min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 font-semibold text-xs flex items-center gap-2 text-left active:bg-slate-200"
        >
          <MonitorDown className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="leading-tight flex-1">Cài Offline (PC / ĐT)</span>
        </button>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5 text-sky-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold leading-tight">
                    Cài Đặt &amp; Đóng Gói Offline Trên Máy Tính
                  </h3>
                  <p className="text-xs text-sky-200 mt-0.5">
                    Cài lên màn hình Desktop như phần mềm Windows độc lập — dùng được cả khi tắt mạng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500 text-white transition shrink-0"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Method 1: Instant PWA Desktop Install */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          Cách 1: Cài trực tiếp lên Desktop (Nhanh nhất · 10 giây)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Tạo biểu tượng <strong>PE SmartPlan 2.0</strong> ngay trên màn hình Desktop &amp; Start Menu, mở cửa sổ phần mềm riêng và tự lưu bộ nhớ đệm Offline (Service Worker + IndexedDB).
                      </p>
                    </div>
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <MonitorDown className="w-4 h-4" />
                    <span>Cài Đặt Ngay Lên Máy Tính (PE SmartPlan 2.0)</span>
                  </button>
                ) : isIOS ? (
                  <div className="rounded-xl bg-white border border-blue-200 p-3 text-xs text-slate-700 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Hướng dẫn cài trên iPhone / iPad (Safari):</span>
                    </div>
                    <p>
                      1. Bấm nút <Share className="w-3.5 h-3.5 inline text-blue-600" /> <strong>Chia sẻ</strong> trên thanh công cụ Safari.
                    </p>
                    <p>
                      2. Cuộn xuống chọn <strong>Thêm vào Màn hình chính (Add to Home Screen)</strong> → bấm <strong>Thêm</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white border border-blue-200 p-3.5 text-xs text-slate-700 space-y-2">
                    {isEmbeddedIframe && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <span className="text-amber-800 font-medium">
                          Trình duyệt chỉ hiện nút cài đặt Desktop khi mở ứng dụng ở tab riêng:
                        </span>
                        <button
                          type="button"
                          onClick={openCurrentAppInNewTab}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap transition shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Mở tab riêng để cài</span>
                        </button>
                      </div>
                    )}
                    <p>
                      <strong>Trên Google Chrome / Microsoft Edge (Windows 10/11 &amp; Mac):</strong>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>
                        Nhìn góc phải thanh địa chỉ trình duyệt, bấm biểu tượng <strong>Cài đặt ứng dụng</strong> (hình màn hình có mũi tên tải xuống) hoặc vào menu <strong>⋮ → Lưu và chia sẻ → Cài đặt trang dưới dạng ứng dụng</strong>.
                      </li>
                      <li>
                        Bấm <strong>Cài đặt (Install)</strong> → Xong! Từ giờ mở ngay trên Desktop, không cần mạng vẫn soạn và xuất Word bình thường.
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Method 2: Standalone Windows .exe & Local Offline Launcher */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900">
                      Cách 2: Đóng gói thành File Cài Đặt Windows (.EXE) / Chạy Offline qua USB
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Hệ thống đã tích hợp sẵn bộ đóng gói trong thư mục <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-900 font-mono text-[11px]">desktop/</code> của mã nguồn:
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                    <div className="font-bold text-slate-900">Chạy Offline tức thì (.bat)</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Nháy đúp <code className="font-mono text-blue-700">desktop\Start-SmartPlan-Offline.bat</code> để tự khởi chạy máy chủ nội bộ Offline ở chế độ cửa sổ phần mềm Desktop.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                    <div className="font-bold text-slate-900">Tạo bộ cài Setup.exe &amp; Portable</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Nháy đúp <code className="font-mono text-blue-700">desktop\Build-Installer-EXE.bat</code> để đóng gói Electron thành file <strong>PE SmartPlan 2.0 Setup.exe</strong> cài cho mọi máy Windows không cần Node.js.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadWindowsKit}
                  disabled={isDownloadingKit}
                  className="w-full py-2 px-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <FolderArchive className="w-4 h-4 text-indigo-600" />
                  <span>
                    {isDownloadingKit
                      ? 'Đang tạo gói tải xuống...'
                      : 'Tải Hướng Dẫn & Script Đóng Gói Windows (.zip)'}
                  </span>
                </button>
              </div>

              {/* What works offline */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <WifiOff className="w-4 h-4 text-emerald-600" />
                  <span>Các tính năng hoạt động 100% khi tắt mạng (Offline):</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Soạn, sửa, sinh giáo án 5 khối &amp; 35 tuần
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Thư viện ảnh SGK lưu cục bộ (IndexedDB)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Studio vẽ &amp; chèn sơ đồ đội hình
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Xuất file Word (.docx), in ấn &amp; sao lưu
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <HardDriveDownload className="w-3.5 h-3.5 text-blue-600" />
                Dữ liệu cá nhân được lưu an toàn ngay trên máy tính của thầy.
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
