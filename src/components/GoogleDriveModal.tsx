import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FolderOpen,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle,
  AlertCircle,
  HardDrive,
  FileCheck,
  Copy,
  Check
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  getAccessToken
} from '../services/googleAuth';
import {
  listDriveFiles,
  getOrCreateAppFolder,
  uploadFileToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
  DriveFileItem
} from '../services/googleDriveService';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional current plan data payload for quick backup
  currentPlanData?: {
    week: number;
    title: string;
    generateDocxBlob: () => Promise<Blob>;
    generateJsonBlob: () => Blob;
  };
  onImportFileContent?: (file: File) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentPlanData,
  onImportFileContent
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [appFolderId, setAppFolderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [scopeError, setScopeError] = useState<boolean>(false);

  // File to delete confirmation modal state (MANDATORY User Confirmation for destructive ops)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
        setFiles([]);
        setAppFolderId(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When modal is opened and user is logged in, fetch files
  useEffect(() => {
    if (isOpen && user) {
      loadFiles();
    }
  }, [isOpen, user]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    setScopeError(false);
    try {
      const folderId = await getOrCreateAppFolder();
      setAppFolderId(folderId);

      // List files in the SmartPlan folder as well as any relevant GDTC documents
      const query = `'${folderId}' in parents and trashed = false`;
      const driveFiles = await listDriveFiles(query, 50);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      const isScopeDenied =
        err?.message?.includes('insufficient authentication scopes') ||
        err?.message?.includes('insufficient') ||
        err?.message?.includes('PERMISSION_DENIED') ||
        (err?.message?.includes('403') && err?.message?.toLowerCase().includes('permission'));

      if (isScopeDenied) {
        setScopeError(true);
        setStatusMessage({
          type: 'error',
          text: 'Tài khoản chưa cấp quyền Google Drive (Lỗi 403). Vui lòng bấm "Cấp lại quyền Google Drive" bên dưới.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Không thể tải danh sách tệp từ Google Drive'
        });
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    setUnauthorizedDomain(null);
    setScopeError(false);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setStatusMessage({
          type: 'success',
          text: `Đăng nhập thành công: ${res.user.displayName || res.user.email}`
        });
        // Note: loadFiles() is triggered by useEffect([isOpen, user])
      }
    } catch (err: any) {
      console.error(err);
      const isUnauthorized =
        err?.code === 'auth/unauthorized-domain' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('unauthorized-domain'));

      if (isUnauthorized) {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'pe-smart-planner.vercel.app';
        setUnauthorizedDomain(currentDomain);
        setStatusMessage({
          type: 'error',
          text: `Firebase Error (auth/unauthorized-domain): Tên miền "${currentDomain}" chưa được thêm vào mục Authorized Domains của dự án Firebase.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleReauth = async () => {
    setScopeError(false);
    setStatusMessage(null);
    setIsLoggingIn(true);
    try {
      await logoutGoogle();
      setUser(null);
      setFiles([]);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setStatusMessage({
          type: 'success',
          text: `Cấp quyền thành công: ${res.user.displayName || res.user.email}`
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Cấp quyền Google Drive thất bại'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyCurrentDomain = () => {
    const domain = unauthorizedDomain || (typeof window !== 'undefined' ? window.location.hostname : 'pe-smart-planner.vercel.app');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setFiles([]);
      setStatusMessage({ type: 'info', text: 'Đã đăng xuất khỏi tài khoản Google' });
    } catch (err: any) {
      console.error(err);
    }
  };

  // Upload current plan as Word document to Google Drive
  const handleUploadCurrentWord = async () => {
    if (!currentPlanData) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const folderId = appFolderId || (await getOrCreateAppFolder());
      const docxBlob = await currentPlanData.generateDocxBlob();
      const filename = `KHBD_GDTC_Tuan_${currentPlanData.week}_${new Date().toISOString().slice(0, 10)}.docx`;

      await uploadFileToDrive(
        filename,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        docxBlob,
        folderId
      );

      setStatusMessage({
        type: 'success',
        text: `Đã lưu kế hoạch bài dạy "${filename}" vào Google Drive thành công!`
      });
      await loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Lưu vào Google Drive thất bại: ${err?.message || err}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Upload current plan as JSON backup to Google Drive
  const handleUploadCurrentJson = async () => {
    if (!currentPlanData) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const folderId = appFolderId || (await getOrCreateAppFolder());
      const jsonBlob = currentPlanData.generateJsonBlob();
      const filename = `Backup_SmartPlan_Tuan_${currentPlanData.week}_${new Date().toISOString().slice(0, 10)}.json`;

      await uploadFileToDrive(
        filename,
        'application/json',
        jsonBlob,
        folderId
      );

      setStatusMessage({
        type: 'success',
        text: `Đã sao lưu dữ liệu toàn diện "${filename}" lên Google Drive!`
      });
      await loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Sao lưu thất bại: ${err?.message || err}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Download and import file into application
  const handleImportFromDrive = async (fileItem: DriveFileItem) => {
    try {
      setStatusMessage({ type: 'info', text: `Đang tải "${fileItem.name}" từ Google Drive...` });
      const blob = await downloadDriveFileContent(fileItem.id);
      const file = new File([blob], fileItem.name, { type: fileItem.mimeType });

      if (onImportFileContent) {
        onImportFileContent(file);
        setStatusMessage({
          type: 'success',
          text: `Đã nạp tệp "${fileItem.name}" vào SmartPlan GDTC Pro thành công!`
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Không thể đọc tệp: ${err?.message || err}`
      });
    }
  };

  // Perform destructive file deletion with user confirmation
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Đã xoá tệp "${fileToDelete.name}" khỏi Google Drive.`
      });
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi khi xoá: ${err?.message || err}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Đồng bộ Google Drive™
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Lưu trữ giáo án, sao lưu trực tiếp và mở lại kế hoạch bài dạy từ đám mây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs underline hover:opacity-80 ml-2"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* User Auth Section */}
          {!user ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <HardDrive className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  Kết nối với Google Drive của bạn
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đăng nhập tài khoản Google để tự động đồng bộ kế hoạch bài dạy, tải file giáo án Word lên kho Drive và nạp lại khi cần thiết trên mọi thiết bị.
                </p>
              </div>

              {/* Official Google Material Sign-in Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition hover:shadow-md active:scale-98 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span>{isLoggingIn ? 'Đang kết nối Google...' : 'Đăng nhập với Google'}</span>
              </button>

              {/* Unauthorized Domain Diagnostic & Step-by-Step Guide Card */}
              {unauthorizedDomain && (
                <div className="mt-4 p-4 text-left bg-amber-50 border border-amber-300 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      !
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-900">
                        Cần thêm tên miền vào Firebase Authentication
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Ứng dụng đang mở tại <span className="font-mono font-semibold bg-amber-100 px-1 py-0.5 rounded text-amber-950">{unauthorizedDomain}</span> nhưng miền này chưa được thêm vào mục <b>Authorized domains</b> của dự án Firebase <span className="font-mono font-semibold text-slate-800">{firebaseConfig.projectId}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Copy Domain bar */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                    <div className="flex-1 font-mono text-xs text-slate-700 truncate px-1">
                      {unauthorizedDomain}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCurrentDomain}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium rounded-md transition"
                    >
                      {copiedDomain ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép miền</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 30-Second Walkthrough */}
                  <div className="text-[11px] text-amber-900 space-y-1.5 bg-amber-100/60 p-3 rounded-lg border border-amber-200/70">
                    <p className="font-bold text-amber-950">Các bước xử lý nhanh (khoảng 30 giây):</p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      <li>Bấm nút <b>"Mở Firebase Console"</b> bên dưới để đến trang cài đặt Authentication.</li>
                      <li>Cuộn xuống mục <b>"Authorized domains"</b> (Miền được ủy quyền).</li>
                      <li>Bấm <b>"Add domain"</b> rồi dán <code className="bg-white px-1 py-0.2 rounded font-mono font-semibold">{unauthorizedDomain}</code> (hoặc <code className="bg-white px-1 py-0.2 rounded font-mono font-semibold">vercel.app</code>) vào và nhấn lưu.</li>
                      <li>Quay lại đây và bấm nút <b>"Đăng nhập với Google"</b> lại để đồng bộ.</li>
                    </ol>
                  </div>

                  {/* Direct Link to Firebase Console */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                    >
                      <span>Mở Cài đặt Firebase Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoggingIn ? 'animate-spin text-blue-600' : ''}`} />
                      <span>Thử đăng nhập lại</span>
                    </button>
                  </div>

                  {/* Offline / Direct Word alternative */}
                  <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    💡 <b>Giải pháp sao lưu không cần mạng:</b> Thầy/Cô có thể bấm nút <b>"Sao Lưu / Khôi Phục"</b> (.json) hoặc <b>"Xuất file Word"</b> (.docx) ở góc trên thanh công cụ chính để tải giáo án về máy tính hoặc kéo thả trực tiếp lên Google Drive bất kỳ lúc nào mà không bắt buộc phải liên kết tài khoản ngay.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Bar */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full ring-2 ring-blue-300"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.email ? user.email.slice(0, 2).toUpperCase() : 'G'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {user.displayName || 'Tài khoản Google'}
                    </p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadFiles}
                    disabled={isLoadingFiles}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
                    title="Làm mới danh sách tệp"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-medium border border-red-200/60"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

              {/* Scope Error (403 Insufficient Permission) Diagnostic & 1-Click Fix */}
              {scopeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 text-left shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-red-900">
                        Chưa cấp quyền truy cập Google Drive (Lỗi 403)
                      </h5>
                      <p className="text-[11px] text-red-800 leading-relaxed">
                        Tài khoản <span className="font-semibold text-slate-800">{user.email}</span> đã đăng nhập nhưng chưa cấp quyền đọc/ghi Google Drive (Request had insufficient authentication scopes). Google yêu cầu Thầy/Cô tích chọn cho phép ứng dụng truy cập Drive để đọc và tạo thư mục giáo án.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-red-200 text-[11px] text-slate-700 space-y-1.5">
                    <p className="font-bold text-slate-900">👉 Hướng dẫn cấp quyền nhanh:</p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      <li>Bấm nút <b>"Cấp lại quyền Google Drive"</b> màu đỏ bên dưới.</li>
                      <li>Tại cửa sổ Google mở ra, hãy <b>tích chọn vào các ô vuông cấp quyền Google Drive</b> (Xem, chỉnh sửa, tạo tệp).</li>
                      <li>Bấm <b>"Tiếp tục"</b> để hoàn tất.</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleReauth}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-98"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoggingIn ? 'animate-spin' : ''}`} />
                      <span>{isLoggingIn ? 'Đang kết nối lại...' : 'Cấp lại quyền Google Drive'}</span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
                    >
                      Đăng xuất tài khoản
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Action: Upload current plan to Drive */}
              {currentPlanData && (
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-blue-100">
                        Sao lưu nhanh vào Google Drive
                      </h4>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        Kế hoạch Tuần {currentPlanData.week}: {currentPlanData.title}
                      </p>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                      Thư mục: SmartPlan GDTC Pro
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={handleUploadCurrentWord}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs rounded-lg shadow-xs transition active:scale-98 disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span>{isUploading ? 'Đang tải lên...' : 'Lưu File Word (.docx) lên Drive'}</span>
                    </button>

                    <button
                      onClick={handleUploadCurrentJson}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3.5 py-2 bg-blue-700/80 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition active:scale-98 disabled:opacity-50 border border-blue-400/40"
                    >
                      <FileCheck className="w-4 h-4 text-amber-300" />
                      <span>{isUploading ? 'Đang lưu...' : 'Sao lưu Toàn diện (.json)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* List of files stored in Drive */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                    <span>Tệp trên Google Drive ({files.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Tự động đồng bộ với thư mục SmartPlan GDTC Pro
                  </span>
                </div>

                {isLoadingFiles ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    <p className="text-xs">Đang lấy danh sách tệp từ Google Drive...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                    <p className="text-xs font-medium text-slate-600">
                      Chưa có tệp giáo án nào trong thư mục Google Drive
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Nhấn nút "Lưu File Word (.docx) lên Drive" ở trên để đưa kế hoạch bài dạy đầu tiên lên đám mây.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto custom-scrollbar">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('vi-VN') : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition"
                              title="Mở trên Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {onImportFileContent && (
                            <button
                              onClick={() => handleImportFromDrive(file)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
                              title="Tải và mở kế hoạch bài dạy này vào ứng dụng"
                            >
                              <Download className="w-3 h-3" />
                              <span>Nạp vào App</span>
                            </button>
                          )}

                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                            title="Xoá tệp khỏi Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Quyền bảo mật: Chỉ truy cập tệp do SmartPlan GDTC Pro tạo ra hoặc được cấp quyền</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Destructive Delete Action (MANDATORY per Workspace Skill) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Xác nhận xoá tệp trên Google Drive</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xoá vĩnh viễn tệp <strong className="text-slate-900 font-semibold">"{fileToDelete.name}"</strong> khỏi tài khoản Google Drive của bạn? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Đang xoá...' : 'Đồng ý Xoá Tệp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
