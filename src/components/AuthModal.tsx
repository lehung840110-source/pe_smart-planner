import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  UserCheck,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  School,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Search,
  Eye,
  EyeOff,
  Send,
  Trash2,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';
import {
  useAuth,
  RegistrationNotificationItem,
  FoundAccountHint
} from '../contexts/AuthContext';
import { googleSignIn, getAccessToken } from '../services/googleAuth';
import {
  ADMIN_NOTIFICATION_EMAIL,
  sendEmailViaGmailApi,
  buildRegistrationNotificationEmail,
  buildPasswordRecoveryEmail,
  SendGmailParams
} from '../services/googleGmailService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSchoolName?: string;
  defaultTeacherName?: string;
  initialMode?: 'login' | 'register';
  gateReason?: string | null;
  onAuthSuccess: (mode: 'login' | 'register') => Promise<void> | void;
  onManualSyncUp: () => Promise<void>;
  showToast: (msg: string) => void;
}

interface PendingEmailConfirmation {
  kind: 'registration' | 'recovery';
  notificationId?: string;
  emailParams: SendGmailParams;
  summaryLines: { label: string; value: string }[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultSchoolName = '',
  defaultTeacherName = '',
  initialMode = 'login',
  gateReason = null,
  onAuthSuccess,
  onManualSyncUp,
  showToast
}) => {
  const {
    user,
    isSyncing,
    lastSyncedAt,
    rememberedAccounts,
    removeRememberedAccount,
    login,
    register,
    logout,
    findAccount,
    requestPasswordReset,
    resetPassword,
    changePassword,
    getRegistrationNotifications,
    markNotificationSent,
    confirmRegistrationNotification
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [recoveryTab, setRecoveryTab] = useState<'reset' | 'find'>('reset');

  // Login / Register fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(defaultTeacherName);
  const [schoolName, setSchoolName] = useState(defaultSchoolName);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Recovery fields
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [recoveryRequestInfo, setRecoveryRequestInfo] = useState<{
    email: string;
    maskedEmail: string;
    fullName: string;
    expiresAt: number;
    recoveryCode: string;
    notifyEmail: string;
  } | null>(null);
  const [findQuery, setFindQuery] = useState('');
  const [foundAccounts, setFoundAccounts] = useState<FoundAccountHint[] | null>(null);

  // Logged-in account: change password + registration notifications
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [confirmNewAccountPassword, setConfirmNewAccountPassword] = useState('');
  const [notifications, setNotifications] = useState<RegistrationNotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [confirmCodeInputs, setConfirmCodeInputs] = useState<Record<string, string>>({});

  // Post-registration or Gmail confirmation dialog (MANDATORY per Workspace skill before sending email)
  const [pendingEmailConfirm, setPendingEmailConfirm] = useState<PendingEmailConfirmation | null>(null);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoadingNotifications(true);
    const res = await getRegistrationNotifications();
    if (res.success) {
      setNotifications(res.notifications || []);
      setIsAdminView(Boolean(res.isAdmin));
    }
    setIsLoadingNotifications(false);
  }, [user, getRegistrationNotifications]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmailStatusMsg(null);
      if (!email && rememberedAccounts.length > 0) {
        setEmail(rememberedAccounts[0].email);
      }
      if (user) {
        loadNotifications();
      }
    }
  }, [isOpen, initialMode, user, loadNotifications, rememberedAccounts, email]);

  if (!isOpen) return null;

  const openRegistrationEmailConfirm = (notif: RegistrationNotificationItem) => {
    const emailParams = buildRegistrationNotificationEmail({
      fullName: notif.fullName,
      email: notif.email,
      schoolName: notif.schoolName,
      registeredAt: notif.registeredAt,
      confirmationCode: notif.confirmationCode
    });
    setEmailStatusMsg(null);
    setPendingEmailConfirm({
      kind: 'registration',
      notificationId: notif.id,
      emailParams,
      summaryLines: [
        { label: 'Người nhận thông báo', value: ADMIN_NOTIFICATION_EMAIL },
        { label: 'Tài khoản vừa đăng ký', value: `${notif.fullName} (${notif.email})` },
        { label: 'Đơn vị / Trường', value: notif.schoolName },
        { label: 'Mã xác nhận đăng ký', value: notif.confirmationCode }
      ]
    });
  };

  const openRecoveryEmailConfirm = (recipientEmail: string) => {
    if (!recoveryRequestInfo) return;
    const emailParams = buildPasswordRecoveryEmail({
      recipientEmail,
      accountEmail: recoveryRequestInfo.email,
      fullName: recoveryRequestInfo.fullName,
      recoveryCode: recoveryRequestInfo.recoveryCode,
      expiresAt: recoveryRequestInfo.expiresAt
    });
    setEmailStatusMsg(null);
    setPendingEmailConfirm({
      kind: 'recovery',
      emailParams,
      summaryLines: [
        { label: 'Gửi tới email', value: recipientEmail },
        { label: 'Tài khoản cần khôi phục', value: `${recoveryRequestInfo.fullName} (${recoveryRequestInfo.email})` },
        { label: 'Mã khôi phục 6 số', value: recoveryRequestInfo.recoveryCode },
        { label: 'Hiệu lực đến', value: new Date(recoveryRequestInfo.expiresAt).toLocaleTimeString('vi-VN') }
      ]
    });
  };

  const handleConfirmSendGmail = async () => {
    if (!pendingEmailConfirm) return;
    setIsSendingGmail(true);
    setEmailStatusMsg(null);
    try {
      let token = await getAccessToken();
      let senderEmail = user?.email || '';
      if (!token) {
        const signInRes = await googleSignIn();
        token = signInRes?.accessToken || null;
        senderEmail = signInRes?.user?.email || senderEmail;
      }
      if (!token) {
        throw new Error('Chưa hoàn tất đăng nhập Google để cấp quyền gửi Gmail.');
      }

      const sendRes = await sendEmailViaGmailApi(pendingEmailConfirm.emailParams);

      if (pendingEmailConfirm.kind === 'registration' && pendingEmailConfirm.notificationId) {
        await markNotificationSent(pendingEmailConfirm.notificationId, {
          gmailMessageId: sendRes.id,
          sentByEmail: senderEmail
        });
        await loadNotifications();
      }

      setEmailStatusMsg({
        type: 'success',
        text: `Đã gửi email xác nhận thành công tới ${pendingEmailConfirm.emailParams.to}!`
      });
      showToast(`📧 Đã gửi email thông báo tới ${pendingEmailConfirm.emailParams.to} thành công!`);
      setPendingEmailConfirm(null);
    } catch (err: any) {
      setEmailStatusMsg({
        type: 'error',
        text: err?.message || 'Không thể gửi email qua Gmail. Vui lòng thử lại hoặc dùng nút mở trình email.'
      });
    } finally {
      setIsSendingGmail(false);
    }
  };

  const buildMailtoHref = (params: SendGmailParams) => {
    const plainBody = `Thông báo từ hệ thống SmartPlan GDTC:\nChủ đề: ${params.subject}\nVui lòng kiểm tra thông tin xác nhận tài khoản trong ứng dụng.`;
    return `mailto:${encodeURIComponent(params.to)}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(plainBody)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận chưa trùng khớp.');
        return;
      }
      setIsSubmitting(true);
      const res = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim() || defaultTeacherName || 'Giáo viên GDTC',
        schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS',
        rememberMe
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Đăng ký thất bại.');
        return;
      }
      await onAuthSuccess('register');
      showToast(`🎉 Đăng ký thành công! Xin chào thầy/cô ${res.user?.fullName || email}.`);

      // Prompt user to confirm sending registration notification email to lehung840110@gmail.com
      if (res.registrationNotification) {
        openRegistrationEmailConfirm(res.registrationNotification);
        await loadNotifications();
      } else {
        onClose();
      }
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password, rememberMe);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Đăng nhập thất bại.');
      return;
    }
    await onAuthSuccess('login');
    showToast(`✅ Đăng nhập thành công! Đã đồng bộ hồ sơ giáo án của ${res.user?.fullName || email}.`);
    onClose();
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    const res = await requestPasswordReset(recoveryEmail.trim());
    setIsSubmitting(false);
    if (!res.success || !res.recoveryCode || !res.expiresAt || !res.email) {
      setErrorMsg(res.error || 'Không thể tạo mã khôi phục.');
      return;
    }
    setRecoveryRequestInfo({
      email: res.email,
      maskedEmail: res.maskedEmail || res.email,
      fullName: res.fullName || 'Giáo viên',
      expiresAt: res.expiresAt,
      recoveryCode: res.recoveryCode,
      notifyEmail: res.notifyEmail || ADMIN_NOTIFICATION_EMAIL
    });
    setSuccessMsg(
      `Đã tạo mã khôi phục 6 chữ số (hiệu lực 15 phút). Bạn có thể gửi mã xác nhận qua Gmail tới ${ADMIN_NOTIFICATION_EMAIL} hoặc email tài khoản rồi nhập mã bên dưới để đặt mật khẩu mới.`
    );
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (recoveryNewPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận chưa trùng khớp.');
      return;
    }
    setIsSubmitting(true);
    const res = await resetPassword({
      email: (recoveryRequestInfo?.email || recoveryEmail).trim(),
      code: recoveryCodeInput.trim(),
      newPassword: recoveryNewPassword
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Đặt lại mật khẩu thất bại.');
      return;
    }
    await onAuthSuccess('login');
    showToast('✅ Đã khôi phục mật khẩu và đăng nhập thành công!');
    setRecoveryRequestInfo(null);
    setRecoveryCodeInput('');
    setRecoveryNewPassword('');
    setRecoveryConfirmPassword('');
    onClose();
  };

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await findAccount(findQuery.trim());
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Không thể tra cứu tài khoản.');
      return;
    }
    setFoundAccounts(res.accounts || []);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (newAccountPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newAccountPassword !== confirmNewAccountPassword) {
      setErrorMsg('Mật khẩu mới nhập lại chưa trùng khớp.');
      return;
    }
    setIsSubmitting(true);
    const res = await changePassword({
      currentPassword,
      newPassword: newAccountPassword
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Đổi mật khẩu thất bại.');
      return;
    }
    setCurrentPassword('');
    setNewAccountPassword('');
    setConfirmNewAccountPassword('');
    setShowChangePassword(false);
    setSuccessMsg('Đã cập nhật mật khẩu mới thành công!');
    showToast('✅ Đã đổi mật khẩu tài khoản thành công!');
  };

  const handleConfirmRegistration = async (notifId: string) => {
    setErrorMsg(null);
    const code = confirmCodeInputs[notifId] || '';
    const res = await confirmRegistrationNotification(notifId, isAdminView ? undefined : code);
    if (!res.success) {
      setErrorMsg(res.error || 'Xác nhận tài khoản thất bại.');
      return;
    }
    await loadNotifications();
    showToast('✅ Đã xác nhận đăng ký tài khoản thành công!');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Đã đăng xuất khỏi tài khoản.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {user
                  ? 'Tài Khoản Giáo Viên & Xác Nhận Email'
                  : mode === 'recovery'
                  ? 'Phục Hồi Tài Khoản & Mật Khẩu'
                  : 'Đăng Nhập / Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Ghi nhớ đăng nhập, khôi phục mật khẩu & thông báo xác nhận qua {ADMIN_NOTIFICATION_EMAIL}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {emailStatusMsg && (
            <div
              className={`mx-5 mt-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                emailStatusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {emailStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              )}
              <span className="font-medium leading-relaxed">{emailStatusMsg.text}</span>
            </div>
          )}

          {user ? (
            <div className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              {/* Profile Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Đang đăng nhập (đã ghi nhớ)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {user.role === 'admin' ? 'Quản trị / Tổ trưởng' : 'Giáo viên'}
                    </span>
                    {user.registrationConfirmed ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Đã xác nhận
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Chờ xác nhận email
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-extrabold text-slate-900 pt-1">{user.fullName}</p>
                <p className="text-slate-600">{user.email}</p>
                <p className="text-slate-600 font-medium">{user.schoolName}</p>
                {lastSyncedAt && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã đồng bộ lần cuối: {new Date(lastSyncedAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>

              {/* Registration Notifications -> lehung840110@gmail.com */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>
                      {isAdminView
                        ? `Thông báo đăng ký gửi về ${ADMIN_NOTIFICATION_EMAIL}`
                        : `Xác nhận đăng ký qua ${ADMIN_NOTIFICATION_EMAIL}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={isLoadingNotifications}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded"
                    title="Làm mới"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-[11px] text-slate-500">Chưa có bản ghi thông báo đăng ký nào.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {notif.fullName} <span className="font-normal text-slate-500">({notif.email})</span>
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {notif.schoolName} · {new Date(notif.registeredAt).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              Mã xác nhận: <strong className="font-mono text-blue-700">{notif.confirmationCode}</strong>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                notif.emailSent
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {notif.emailSent ? 'Đã gửi Gmail' : 'Chưa gửi email'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                notif.confirmed
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {notif.confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => openRegistrationEmailConfirm(notif)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition"
                          >
                            <Send className="w-3 h-3" />
                            <span>{notif.emailSent ? 'Gửi lại qua Gmail' : 'Gửi thông báo qua Gmail'}</span>
                          </button>

                          {!notif.confirmed && (
                            isAdminView ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmRegistration(notif.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition"
                              >
                                <Check className="w-3 h-3" />
                                <span>Xác nhận tài khoản</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={confirmCodeInputs[notif.id] || ''}
                                  onChange={(e) =>
                                    setConfirmCodeInputs((prev) => ({
                                      ...prev,
                                      [notif.id]: e.target.value
                                    }))
                                  }
                                  placeholder="Nhập mã 6 số"
                                  className="w-24 px-2 py-1 text-[11px] border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleConfirmRegistration(notif.id)}
                                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                                >
                                  Xác nhận
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Change Password Section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword((v) => !v);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 transition"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                    Đổi mật khẩu tài khoản
                  </span>
                  <span className="text-[11px] text-blue-600">
                    {showChangePassword ? 'Thu gọn' : 'Mở rộng'}
                  </span>
                </button>
                {showChangePassword && (
                  <form onSubmit={handleChangePassword} className="p-3.5 space-y-2.5 bg-white">
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mật khẩu hiện tại"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={newAccountPassword}
                      onChange={(e) => setNewAccountPassword(e.target.value)}
                      placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmNewAccountPassword}
                      onChange={(e) => setConfirmNewAccountPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold"
                    >
                      {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
                    </button>
                  </form>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onManualSyncUp();
                  }}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Lưu & Đồng Bộ Giáo Án Lên Tài Khoản Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4 text-xs">
              {gateReason && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-amber-900">Mở khóa toàn bộ tính năng thành viên</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Vui lòng đăng nhập hoặc đăng ký tài khoản miễn phí để sử dụng: <strong>{gateReason}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Switch Mode Tabs (3 tabs: Login, Register, Recovery) */}
              <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                    mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                    mode === 'register' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('recovery');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    if (!recoveryEmail && email) setRecoveryEmail(email);
                  }}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                    mode === 'recovery' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Phục Hồi</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
              )}

              {mode === 'recovery' ? (
                <div className="space-y-4">
                  {/* Recovery sub-tabs */}
                  <div className="flex gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryTab('reset');
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                        recoveryTab === 'reset'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Đặt lại mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryTab('find');
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                        recoveryTab === 'find'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tìm tài khoản đã đăng ký
                    </button>
                  </div>

                  {recoveryTab === 'find' ? (
                    <div className="space-y-3">
                      <form onSubmit={handleFindAccount} className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            value={findQuery}
                            onChange={(e) => setFindQuery(e.target.value)}
                            placeholder="Nhập họ tên giáo viên, tên trường hoặc một phần email..."
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shrink-0"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tra cứu'}
                        </button>
                      </form>

                      {foundAccounts !== null && (
                        <div className="space-y-2">
                          {foundAccounts.length === 0 ? (
                            <p className="text-center py-4 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              Không tìm thấy tài khoản nào phù hợp với từ khoá "{findQuery}".
                            </p>
                          ) : (
                            foundAccounts.map((acc) => (
                              <div
                                key={acc.email}
                                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{acc.fullName}</p>
                                  <p className="text-[11px] text-teal-700 font-mono">{acc.maskedEmail}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{acc.schoolName}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEmail(acc.email);
                                      setMode('login');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]"
                                  >
                                    Đăng nhập
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRecoveryEmail(acc.email);
                                      setRecoveryTab('reset');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px]"
                                  >
                                    Khôi phục MK
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Step 1: Request 6-digit recovery code */}
                      <form onSubmit={handleRequestReset} className="space-y-2.5">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Bước 1: Nhập email tài khoản cần khôi phục mật khẩu
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="email"
                              required
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              placeholder="lehung840110@gmail.com"
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shrink-0"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo mã khôi phục'}
                          </button>
                        </div>
                      </form>

                      {recoveryRequestInfo && (
                        <>
                          {/* Recovery code status + optional Gmail send */}
                          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-teal-900">
                                Mã khôi phục cho {recoveryRequestInfo.fullName}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-teal-700 font-semibold">
                                <Clock className="w-3 h-3" />
                                Hết hạn lúc {new Date(recoveryRequestInfo.expiresAt).toLocaleTimeString('vi-VN')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-teal-200">
                              <span className="text-[11px] text-slate-600">Mã xác thực 6 số:</span>
                              <span className="font-mono text-base font-extrabold tracking-widest text-teal-800">
                                {recoveryRequestInfo.recoveryCode}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => openRecoveryEmailConfirm(ADMIN_NOTIFICATION_EMAIL)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]"
                              >
                                <Send className="w-3 h-3" />
                                <span>Gửi mã qua Gmail tới {ADMIN_NOTIFICATION_EMAIL}</span>
                              </button>
                              {recoveryRequestInfo.email !== ADMIN_NOTIFICATION_EMAIL && (
                                <button
                                  type="button"
                                  onClick={() => openRecoveryEmailConfirm(recoveryRequestInfo.email)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px]"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Gửi tới {recoveryRequestInfo.maskedEmail}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Step 2: Enter code + new password */}
                          <form onSubmit={handleCompleteReset} className="space-y-2.5 pt-2 border-t border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Bước 2: Nhập mã 6 số & đặt mật khẩu mới
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={recoveryCodeInput}
                              onChange={(e) => setRecoveryCodeInput(e.target.value)}
                              placeholder="Nhập mã khôi phục 6 chữ số"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono tracking-widest focus:border-teal-500 focus:outline-none"
                            />
                            <input
                              type="password"
                              required
                              minLength={6}
                              autoComplete="new-password"
                              value={recoveryNewPassword}
                              onChange={(e) => setRecoveryNewPassword(e.target.value)}
                              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                            />
                            <input
                              type="password"
                              required
                              minLength={6}
                              autoComplete="new-password"
                              value={recoveryConfirmPassword}
                              onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2"
                            >
                              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                              <span>Đặt Lại Mật Khẩu & Đăng Nhập</span>
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Remembered accounts quick-pick (Login mode) */}
                  {mode === 'login' && rememberedAccounts.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                      <p className="text-[11px] font-bold text-blue-900">
                        Tài khoản đã ghi nhớ trên thiết bị này:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rememberedAccounts.map((acc) => (
                          <div
                            key={acc.email}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition ${
                              email.toLowerCase() === acc.email.toLowerCase()
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setEmail(acc.email)}
                              className="font-semibold truncate max-w-[190px]"
                              title={`${acc.fullName} - ${acc.email}`}
                            >
                              {acc.fullName} ({acc.email})
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRememberedAccount(acc.email)}
                              className="opacity-70 hover:opacity-100"
                              title="Xóa khỏi danh sách ghi nhớ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'register' && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>
                        Sau khi tạo tài khoản, hệ thống sẽ tạo <strong>mã xác nhận đăng ký</strong> và mở hộp thoại gửi thông báo xác nhận tới email quản trị <strong>{ADMIN_NOTIFICATION_EMAIL}</strong>.
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email giáo viên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          name="email"
                          autoComplete="username"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vidu: lehung840110@gmail.com"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {mode === 'register' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Họ và tên giáo viên <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ví dụ: Lê Quốc Hưng"
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Đơn vị / Trường học
                          </label>
                          <div className="relative">
                            <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => setSchoolName(e.target.value)}
                              placeholder="TRƯỜNG TIỂU HỌC & THCS ..."
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === 'register' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nhập lại mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remember Me + Forgot Password Row */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Ghi nhớ tài khoản & đăng nhập (30 ngày)</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('recovery');
                          setRecoveryEmail(email);
                          setErrorMsg(null);
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:underline shrink-0"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 px-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                      mode === 'register'
                        ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
                        : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : mode === 'register' ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{mode === 'register' ? 'Tạo Tài Khoản & Gửi Xác Nhận' : 'Đăng Nhập Ngay'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explicit Confirmation Dialog before sending email via Gmail API (MANDATORY per Workspace Skill) */}
      {pendingEmailConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {pendingEmailConfirm.kind === 'registration'
                    ? 'Xác nhận gửi email thông báo đăng ký'
                    : 'Xác nhận gửi email mã khôi phục mật khẩu'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Email sẽ được gửi thông qua tài khoản Gmail sau khi bạn xác nhận
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <p className="font-bold text-slate-800 pb-1 border-b border-slate-200">
                Tiêu đề: {pendingEmailConfirm.emailParams.subject}
              </p>
              {pendingEmailConfirm.summaryLines.map((line) => (
                <div key={line.label} className="flex justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 shrink-0">{line.label}:</span>
                  <span className="font-semibold text-slate-900 text-right break-all">{line.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmSendGmail}
                disabled={isSendingGmail}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {isSendingGmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isSendingGmail
                    ? 'Đang gửi email qua Gmail...'
                    : `Đồng ý & Gửi Email tới ${pendingEmailConfirm.emailParams.to}`}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={buildMailtoHref(pendingEmailConfirm.emailParams)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở ứng dụng Email</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPendingEmailConfirm(null)}
                  disabled={isSendingGmail}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
                >
                  Huỷ / Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
