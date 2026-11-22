import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  UserCheck,
  Mail,
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
  Trash2,
  Clock,
  Check,
  Coffee,
  Copy,
  Crown,
  Gift,
  Lock,
  Plus,
  Send,
  Ticket,
  Users,
  ChevronDown,
  ChevronUp,
  LogIn
} from 'lucide-react';
import {
  useAuth,
  AuthUser,
  LicenseKeyRecord,
  RegistrationNotificationItem
} from '../contexts/AuthContext';
import { googleQuickSignIn, googleSignIn, getCachedAccessTokenSync } from '../services/googleAuth';
import {
  ADMIN_NOTIFICATION_EMAIL,
  sendEmailViaGmailApi,
  buildRegistrationNotificationEmail,
  SendGmailParams
} from '../services/googleGmailService';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlanId,
  TRIAL_DURATION_DAYS,
  GROUP_DISCOUNT_LABEL,
  formatVnDate
} from '../utils/subscriptionPlans';
import { DonationSupportCard } from './DonationSupportCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSchoolName?: string;
  defaultTeacherName?: string;
  initialMode?: 'login' | 'register' | 'billing';
  gateReason?: string | null;
  onAuthSuccess: (mode: 'login' | 'register') => Promise<void> | void;
  onManualSyncUp: () => Promise<void>;
  showToast: (msg: string) => void;
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
    passwordlessSignIn,
    redeemLicenseKey,
    adminGetSubscriptions,
    adminCreateLicenseKey,
    adminExtendUser,
    refreshUser,
    logout,
    getRegistrationNotifications,
    markNotificationSent
  } = useAuth();

  // Passwordless login form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState(defaultTeacherName);
  const [schoolName, setSchoolName] = useState(defaultSchoolName);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Optional legacy password login toggle
  const [showLegacyPassword, setShowLegacyPassword] = useState(false);
  const [legacyPassword, setLegacyPassword] = useState('');

  // Logged-in inner tab: 'overview' | 'billing' | 'admin'
  const [loggedInTab, setLoggedInTab] = useState<'overview' | 'billing' | 'admin'>('overview');

  // Billing & Key redemption state
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('week_1');
  const [licenseCodeInput, setLicenseCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Admin license & user management state
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>([]);
  const [adminKeys, setAdminKeys] = useState<LicenseKeyRecord[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminGenPlanId, setAdminGenPlanId] = useState<SubscriptionPlanId>('week_1');
  const [adminGenEmail, setAdminGenEmail] = useState('');
  const [adminGenNote, setAdminGenNote] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<LicenseKeyRecord | null>(null);
  const [copiedKeyCode, setCopiedKeyCode] = useState<string | null>(null);
  const [extendingEmail, setExtendingEmail] = useState<string | null>(null);

  // Optional notifications state (for Gmail registration notification)
  const [notifications, setNotifications] = useState<RegistrationNotificationItem[]>([]);
  const [isSendingGmail, setIsSendingGmail] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOwner = Boolean(user && user.email.toLowerCase() === ADMIN_NOTIFICATION_EMAIL.toLowerCase());
  const isExpired = Boolean(user && user.hasFullAccess === false);
  const daysRemaining = user?.daysRemaining ?? TRIAL_DURATION_DAYS;
  const planTier = user?.planTier || (isAdminOwner ? 'admin_lifetime' : 'trial');

  const loadAdminData = useCallback(async () => {
    if (!user || user.email.toLowerCase() !== ADMIN_NOTIFICATION_EMAIL.toLowerCase()) return;
    setIsLoadingAdmin(true);
    const res = await adminGetSubscriptions();
    if (res.success) {
      setAdminUsers(res.users || []);
      setAdminKeys(res.keys || []);
    }
    setIsLoadingAdmin(false);
  }, [user, adminGetSubscriptions]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const res = await getRegistrationNotifications();
    if (res.success) {
      setNotifications(res.notifications || []);
    }
  }, [user, getRegistrationNotifications]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (!email && rememberedAccounts.length > 0) {
        setEmail(rememberedAccounts[0].email);
        if (!fullName) setFullName(rememberedAccounts[0].fullName);
        if (!schoolName) setSchoolName(rememberedAccounts[0].schoolName);
      }
      if (user) {
        refreshUser();
        loadNotifications();
        if (user.email.toLowerCase() === ADMIN_NOTIFICATION_EMAIL.toLowerCase()) {
          loadAdminData();
        }
        if (initialMode === 'billing' || user.hasFullAccess === false) {
          setLoggedInTab('billing');
        } else {
          setLoggedInTab('overview');
        }
      }
    }
  }, [isOpen, initialMode, user?.id, user?.hasFullAccess]);

  if (!isOpen) return null;

  const handleGoogleQuickSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const gProfile = await googleQuickSignIn();
      if (!gProfile) {
        setIsGoogleLoading(false);
        return;
      }
      const res = await passwordlessSignIn({
        email: gProfile.email,
        fullName: gProfile.displayName || fullName.trim() || defaultTeacherName,
        schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS',
        provider: 'google',
        rememberMe
      });
      setIsGoogleLoading(false);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Không thể đăng nhập bằng tài khoản Google.');
        return;
      }
      await onAuthSuccess(res.isNewUser ? 'register' : 'login');
      if (res.user.planTier === 'admin_lifetime') {
        showToast(`👑 Xin chào Quản trị viên ${res.user.fullName}! Toàn quyền vĩnh viễn đã sẵn sàng.`);
      } else if (res.user.hasFullAccess === false) {
        showToast(`⏰ Tài khoản ${res.user.email} đã hết thời gian trải nghiệm 1 học kỳ. Vui lòng xem gói duy trì để tiếp tục.`);
        setLoggedInTab('billing');
        return;
      } else {
        showToast(
          res.isNewUser
            ? `🎉 Chào mừng ${res.user.fullName}! Đã mở khóa FULL tính năng miễn phí trọn 1 học kỳ (120 ngày)!`
            : `✅ Xin chào ${res.user.fullName}! Còn ${res.user.daysRemaining} ngày sử dụng Full tính năng.`
        );
      }
      onClose();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMsg(
        err?.message ||
          'Không mở được cửa sổ Google. Thầy/cô chỉ cần nhập trực tiếp Email cá nhân bên dưới (không cần mật khẩu).'
      );
    }
  };

  const handlePasswordlessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Vui lòng nhập đúng địa chỉ Email cá nhân (ví dụ: giaovien@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    const res = await passwordlessSignIn({
      email: cleanEmail,
      fullName: fullName.trim() || defaultTeacherName || cleanEmail.split('@')[0],
      schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS',
      provider: 'email_passwordless',
      rememberMe
    });
    setIsSubmitting(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Đăng nhập thất bại.');
      return;
    }

    await onAuthSuccess(res.isNewUser ? 'register' : 'login');
    if (res.user.planTier === 'admin_lifetime') {
      showToast(`👑 Xin chào Quản trị viên ${res.user.fullName}! Toàn quyền vĩnh viễn đã sẵn sàng.`);
    } else if (res.user.hasFullAccess === false) {
      showToast(`⏰ Tài khoản ${res.user.email} đã kết thúc giai đoạn trải nghiệm miễn phí. Mời thầy/cô xem gói duy trì.`);
      setLoggedInTab('billing');
      return;
    } else {
      showToast(
        res.isNewUser
          ? `🎉 Chào mừng ${res.user.fullName}! Đã mở khóa FULL tính năng miễn phí trọn 1 học kỳ (120 ngày)!`
          : `✅ Đăng nhập thành công! Còn ${res.user.daysRemaining} ngày sử dụng Full tính năng.`
      );
    }
    onClose();
  };

  const handleQuickRememberedSignIn = async (acc: {
    email: string;
    fullName: string;
    schoolName: string;
  }) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await passwordlessSignIn({
      email: acc.email,
      fullName: acc.fullName,
      schoolName: acc.schoolName,
      provider: 'email_passwordless',
      rememberMe: true
    });
    setIsSubmitting(false);
    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Đăng nhập nhanh thất bại.');
      return;
    }
    await onAuthSuccess('login');
    if (res.user.hasFullAccess === false) {
      showToast(`⏰ Tài khoản ${res.user.email} đã hết hạn dùng thử. Vui lòng gia hạn để tiếp tục.`);
      setLoggedInTab('billing');
      return;
    }
    showToast(`✅ Đã vào lại tài khoản ${res.user.fullName} (không cần mật khẩu)!`);
    onClose();
  };

  const handleLegacyPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await login(email.trim(), legacyPassword, rememberMe);
    setIsSubmitting(false);
    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Email hoặc mật khẩu chưa chính xác.');
      return;
    }
    await onAuthSuccess('login');
    showToast(`✅ Đăng nhập thành công: ${res.user.fullName}`);
    onClose();
  };

  const handleRedeemKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const code = licenseCodeInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Vui lòng nhập mã kích hoạt (ví dụ: GDTC-W1-XXXX-XXXX).');
      return;
    }
    setIsRedeeming(true);
    const res = await redeemLicenseKey(code);
    setIsRedeeming(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Mã kích hoạt không hợp lệ.');
      return;
    }
    setLicenseCodeInput('');
    const msg = `🎉 Kích hoạt thành công ${res.planLabel || ''}! Đã cộng thêm ${res.durationDays} ngày sử dụng Full tính năng.`;
    setSuccessMsg(msg);
    showToast(msg);
  };

  const handleAdminCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGeneratingKey(true);
    const res = await adminCreateLicenseKey({
      planId: adminGenPlanId,
      targetEmail: adminGenEmail.trim() || undefined,
      note: adminGenNote.trim() || undefined
    });
    setIsGeneratingKey(false);
    if (!res.success || !res.key) {
      setErrorMsg(res.error || 'Không thể tạo mã kích hoạt.');
      return;
    }
    setNewlyGeneratedKey(res.key);
    setAdminGenEmail('');
    setAdminGenNote('');
    setSuccessMsg(`Đã tạo mã kích hoạt mới: ${res.key.code} (${res.key.planLabel})`);
    showToast(`🎟️ Đã tạo mã ${res.key.code} (${res.key.planLabel})`);
    await loadAdminData();
  };

  const handleAdminExtend = async (targetEmail: string, days: number, label: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setExtendingEmail(`${targetEmail}_${days}`);
    const res = await adminExtendUser({ email: targetEmail, durationDays: days });
    setExtendingEmail(null);
    if (!res.success) {
      setErrorMsg(res.error || 'Không thể gia hạn tài khoản.');
      return;
    }
    setSuccessMsg(`Đã gia hạn trực tiếp +${days} ngày (${label}) cho tài khoản ${targetEmail}.`);
    showToast(`✅ Đã gia hạn +${days} ngày cho ${targetEmail}!`);
    await loadAdminData();
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedKeyCode(code);
      showToast(`📋 Đã sao chép mã kích hoạt: ${code}`);
      setTimeout(() => setCopiedKeyCode(null), 2000);
    } catch {
      showToast(`Mã kích hoạt: ${code}`);
    }
  };

  const buildRenewalMailtoHref = (isGroup = false) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];
    const subject = isGroup
      ? `[SmartPlan GDTC Pro] Đăng ký Gói Tổ/Nhóm (3–5 GV · Giảm 20%) - ${user?.email || email}`
      : `[SmartPlan GDTC Pro] Đăng ký gia hạn ${plan.name} (${plan.priceText}) - ${user?.email || email}`;
    const body = [
      'Kính gửi thầy Lê Quốc Hưng,',
      '',
      isGroup
        ? 'Tổ chuyên môn chúng tôi muốn đăng ký Gói Nhóm (3–5 giáo viên, giảm 20% phí duy trì hệ thống):'
        : 'Tôi muốn đăng ký gia hạn sử dụng SmartPlan GDTC Pro (phí duy trì hệ thống):',
      `- Tài khoản Email đại diện: ${user?.email || email || '(chưa nhập)'}`,
      `- Họ và tên: ${user?.fullName || fullName || '(chưa nhập)'}`,
      `- Đơn vị / Trường: ${user?.schoolName || schoolName || '(chưa nhập)'}`,
      isGroup
        ? `- Số lượng giáo viên dự kiến: 3–5 giáo viên · Gói quan tâm: ${plan.name}`
        : `- Gói lựa chọn: ${plan.name} — ${plan.priceText} (${plan.perMonthText})`,
      '',
      'Vui lòng gửi lại hướng dẫn và Mã kích hoạt giúp tôi. Xin cảm ơn!'
    ].join('\n');
    return `mailto:${encodeURIComponent(ADMIN_NOTIFICATION_EMAIL)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSendRenewalViaGmail = async () => {
    if (!user) return;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];
    setIsSendingGmail(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let token = getCachedAccessTokenSync();
      if (!token) {
        const signInRes = await googleSignIn();
        token = signInRes?.accessToken || null;
      }
      if (!token) {
        setIsSendingGmail(false);
        return;
      }
      const params: SendGmailParams = {
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `[SmartPlan GDTC Pro] Đăng ký gia hạn ${plan.name} (${plan.priceText}) - ${user.email}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="color: #1d4ed8;">Yêu Cầu Gia Hạn SmartPlan GDTC Pro</h2>
            <p>Thầy/cô vừa gửi yêu cầu duy trì hệ thống:</p>
            <ul>
              <li><strong>Họ và tên:</strong> ${user.fullName}</li>
              <li><strong>Email tài khoản:</strong> ${user.email}</li>
              <li><strong>Đơn vị / Trường:</strong> ${user.schoolName}</li>
              <li><strong>Gói đăng ký:</strong> ${plan.name} — <strong>${plan.priceText}</strong> (${plan.perMonthText})</li>
            </ul>
            <p>Quản trị viên vui lòng mở mục <em>Quản trị Gia hạn</em> trong ứng dụng để cấp mã hoặc bấm gia hạn trực tiếp cho email trên.</p>
          </div>
        `
      };
      await sendEmailViaGmailApi(params);
      setSuccessMsg(`Đã gửi yêu cầu gia hạn (${plan.name}) trực tiếp tới ${ADMIN_NOTIFICATION_EMAIL} qua Gmail!`);
      showToast(`📧 Đã gửi yêu cầu gia hạn tới ${ADMIN_NOTIFICATION_EMAIL}!`);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          `Không gửi được qua Gmail trực tiếp. Thầy/cô hãy bấm nút "Mở ứng dụng Email" để gửi tới ${ADMIN_NOTIFICATION_EMAIL}.`
      );
    } finally {
      setIsSendingGmail(false);
    }
  };

  const handleSendRegNotification = async (notif: RegistrationNotificationItem) => {
    setIsSendingGmail(true);
    setErrorMsg(null);
    try {
      let token = getCachedAccessTokenSync();
      let senderEmail = user?.email || '';
      if (!token) {
        const signInRes = await googleSignIn();
        token = signInRes?.accessToken || null;
        senderEmail = signInRes?.user?.email || senderEmail;
      }
      if (!token) {
        setIsSendingGmail(false);
        return;
      }
      const emailParams = buildRegistrationNotificationEmail({
        fullName: notif.fullName,
        email: notif.email,
        schoolName: notif.schoolName,
        registeredAt: notif.registeredAt,
        confirmationCode: notif.confirmationCode
      });
      const res = await sendEmailViaGmailApi(emailParams);
      await markNotificationSent(notif.id, { gmailMessageId: res.id, sentByEmail: senderEmail });
      await loadNotifications();
      showToast(`📧 Đã thông báo đăng ký tới ${ADMIN_NOTIFICATION_EMAIL}!`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không gửi được email thông báo.');
    } finally {
      setIsSendingGmail(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Đã đăng xuất khỏi tài khoản.');
    onClose();
  };

  const trialProgressPercent =
    planTier === 'trial'
      ? Math.min(100, Math.max(4, Math.round((daysRemaining / TRIAL_DURATION_DAYS) * 100)))
      : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-blue-50/60 to-emerald-50/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl text-white shrink-0 ${
                isExpired
                  ? 'bg-amber-600'
                  : isAdminOwner
                  ? 'bg-indigo-600'
                  : 'bg-blue-600'
              }`}
            >
              {isExpired ? (
                <Coffee className="w-5 h-5" />
              ) : isAdminOwner ? (
                <Crown className="w-5 h-5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 text-sm truncate">
                {!user
                  ? 'Đăng Nhập 1 Chạm — Miễn Phí Trọn 1 Học Kỳ'
                  : isExpired
                  ? 'Ủng Hộ & Gia Hạn Duy Trì Hệ Thống'
                  : 'Tài Khoản & Trải Nghiệm SmartPlan GDTC Pro'}
              </h3>
              <p className="text-[11px] text-slate-600 truncate">
                {!user
                  ? 'Không cần mật khẩu · Mở khóa 100% tính năng miễn phí trọn 1 học kỳ (120 ngày)'
                  : isAdminOwner
                  ? 'Quản trị viên hệ thống · Toàn quyền vĩnh viễn & Cấp mã kích hoạt'
                  : `Tài khoản cá nhân: ${user.email}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {user ? (
            <div className="p-5 space-y-4 text-xs">
              {/* Gate Reason Banner when Expired user clicked a locked feature */}
              {isExpired && gateReason && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-amber-900">
                      Đã hết 30 ngày dùng thử miễn phí
                    </p>
                    <p className="text-[11.5px] text-amber-800 mt-0.5">
                      Để tiếp tục sử dụng <strong>{gateReason}</strong>, mời thầy/cô gia hạn duy trì hệ thống chỉ <strong>20.000đ/tuần</strong> (chỉ bằng 1 ly cà phê) hoặc nhập Mã kích hoạt bên dưới.
                    </p>
                  </div>
                </div>
              )}

              {/* Logged-in Navigation Tabs */}
              <div
                className={`grid ${
                  isAdminOwner ? 'grid-cols-3' : 'grid-cols-2'
                } bg-slate-100 p-1 rounded-xl gap-1`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLoggedInTab('overview');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    loggedInTab === 'overview'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tài Khoản</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoggedInTab('billing');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    loggedInTab === 'billing'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>{isExpired ? 'Gia Hạn Ngay' : 'Ủng Hộ & Duy Trì'}</span>
                </button>
                {isAdminOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoggedInTab('admin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      loadAdminData();
                    }}
                    className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                      loggedInTab === 'admin'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Quản Trị Mã</span>
                  </button>
                )}
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

              {/* TAB 1: OVERVIEW */}
              {loggedInTab === 'overview' && (
                <div className="space-y-4">
                  {/* Subscription Status Card */}
                  {planTier === 'admin_lifetime' ? (
                    <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-indigo-900">
                          <Crown className="w-4 h-4 text-amber-500" />
                          Quản Trị Viên Hệ Thống · Toàn Quyền Vĩnh Viễn
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                          KHÔNG GIỚI HẠN
                        </span>
                      </div>
                      <p className="text-[11.5px] text-indigo-900/80 leading-relaxed">
                        Thầy/cô có toàn quyền tạo mã kích hoạt và gia hạn trực tiếp cho giáo viên tại mục <strong>Quản Trị Mã</strong>.
                      </p>
                    </div>
                  ) : planTier === 'paid' ? (
                    <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Gói Thành Viên Đang Hoạt Động
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10.5px] font-bold tabular-nums">
                          Còn {daysRemaining} ngày
                        </span>
                      </div>
                      <p className="text-[11.5px] text-emerald-900/85">
                        Đang mở khóa <strong>100% tính năng</strong> đến hết ngày{' '}
                        <strong>{formatVnDate(user.activeUntil)}</strong>. Cảm ơn thầy/cô đã đồng hành duy trì hệ thống!
                      </p>
                      <button
                        type="button"
                        onClick={() => setLoggedInTab('billing')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Gia hạn thêm / Nhập mã kích hoạt</span>
                      </button>
                    </div>
                  ) : planTier === 'trial' ? (
                    <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 border border-blue-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-blue-950">
                          <Gift className="w-4 h-4 text-blue-600" />
                          Đang Dùng Thử Full Tính Năng Miễn Phí
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10.5px] font-bold tabular-nums">
                          Còn {daysRemaining} / {TRIAL_DURATION_DAYS} ngày
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-blue-200/80">
                        <div
                          className={`h-full rounded-full transition-all ${
                            daysRemaining <= 5 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                          }`}
                          style={{ width: `${trialProgressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-700 flex-wrap gap-1">
                        <span>
                          Miễn phí Full đến: <strong>{formatVnDate(user.trialEndsAt)}</strong>
                        </span>
                        <span className="text-emerald-800 font-semibold">
                          Chia sẻ cộng đồng GDTC · Tùy tâm ủng hộ
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoggedInTab('billing')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-[11px] transition"
                      >
                        <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ủng hộ duy trì máy chủ / Xem gói gia hạn</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-rose-900">
                          <Clock className="w-4 h-4 text-rose-600" />
                          Đã Hết 30 Ngày Dùng Thử Miễn Phí
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10.5px] font-bold">
                          TẠM KHÓA TẠO GIÁO ÁN
                        </span>
                      </div>
                      <p className="text-[11.5px] text-rose-900/90 leading-relaxed">
                        Hồ sơ và các giáo án thầy/cô đã soạn vẫn được lưu an toàn. Mời thầy/cô gia hạn với chi phí duy trì hệ thống chỉ <strong>20.000đ/tuần</strong> (chỉ bằng 1 ly cà phê) để mở lại toàn bộ tính năng.
                      </p>
                      <button
                        type="button"
                        onClick={() => setLoggedInTab('billing')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>Mở Gói Gia Hạn (20k/Tuần) &amp; Nhập Mã Kích Hoạt</span>
                      </button>
                    </div>
                  )}

                  {/* Profile Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        Thông tin tài khoản cá nhân
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {user.authMethod === 'google'
                          ? 'Google 1 chạm'
                          : user.authMethod === 'email_passwordless'
                          ? 'Email không mật khẩu'
                          : 'Tài khoản cá nhân'}
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 pt-1">{user.fullName}</p>
                    <p className="text-slate-600">{user.email}</p>
                    <p className="text-slate-600 font-medium">{user.schoolName}</p>
                    {lastSyncedAt && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã đồng bộ giáo án lần cuối: {new Date(lastSyncedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>

                  {/* Quick Notification to Author (optional for new accounts) */}
                  {!isAdminOwner && notifications.length > 0 && !notifications[0].emailSent && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-blue-900 leading-snug">
                        <strong>Gửi thông báo kích hoạt về tác giả</strong> ({ADMIN_NOTIFICATION_EMAIL}) để được hỗ trợ nhanh nhất khi cần.
                      </div>
                      <button
                        type="button"
                        disabled={isSendingGmail}
                        onClick={() => handleSendRegNotification(notifications[0])}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[11px] shrink-0 flex items-center gap-1"
                      >
                        {isSendingGmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span>Gửi Gmail</span>
                      </button>
                    </div>
                  )}

                  {/* Sync + Logout Actions */}
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
                      <span>Lưu &amp; Đồng Bộ Giáo Án Lên Tài Khoản Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center justify-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng Xuất / Chuyển Tài Khoản Khác</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BILLING & VOLUNTARY SUPPORT */}
              {loggedInTab === 'billing' && (
                <div className="space-y-4">
                  {/* Official Vietcombank Support & Charitable Student Fund Card */}
                  <DonationSupportCard
                    compact
                    defaultShowQr
                    suggestedAmountVnd={
                      (SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0]).priceVnd
                    }
                    suggestedTransferNote={`Ung ho GDTC ${user.email.split('@')[0]}`}
                    onShowToast={showToast}
                  />

                  {/* 4 Pricing Plans Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`text-left p-3.5 rounded-xl border-2 transition relative ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9.5px] font-extrabold uppercase tracking-wide">
                              Hợp nhịp học kỳ
                            </span>
                          )}
                          {plan.bestValue && (
                            <span className="absolute -top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9.5px] font-extrabold uppercase tracking-wide">
                              Tối ưu nhất
                            </span>
                          )}
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {plan.name}
                            </span>
                            <span className="font-extrabold text-emerald-700 text-sm tabular-nums">
                              {plan.priceText}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10.5px]">
                            <span className="text-slate-600">{plan.tagline}</span>
                          </div>
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            <span>{plan.perMonthText}</span>
                            <span>·</span>
                            <span>+{plan.durationDays} ngày Full</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Group / Department Discount Card */}
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2 text-[11px] text-indigo-950">
                      <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold">{GROUP_DISCOUNT_LABEL}</p>
                        <p className="text-indigo-800/85">
                          Phù hợp cho các thầy/cô cùng tổ chuyên môn GDTC đăng ký chung để tiết kiệm thêm chi phí.
                        </p>
                      </div>
                    </div>
                    <a
                      href={buildRenewalMailtoHref(true)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] whitespace-nowrap text-center shrink-0 transition"
                    >
                      Đăng Ký Nhóm (-20%)
                    </a>
                  </div>

                  {/* Activation Key Redemption Box */}
                  <form
                    onSubmit={handleRedeemKey}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <label className="block font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span>Đã có Mã Kích Hoạt? Nhập để mở khóa ngay lập tức</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseCodeInput}
                        onChange={(e) => setLicenseCodeInput(e.target.value.toUpperCase())}
                        placeholder="VD: GDTC-W1-7K9M-XXXX"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold tracking-wider uppercase focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isRedeeming}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                      >
                        {isRedeeming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Kích Hoạt</span>
                      </button>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      Sau khi kích hoạt, thời hạn mới sẽ được cộng dồn trực tiếp vào tài khoản <strong>{user.email}</strong>.
                    </p>
                  </form>

                  {/* Contact Author to Get Activation Key */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                    <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Đăng ký nhận Mã Kích Hoạt qua tác giả Lê Quốc Hưng</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Gửi yêu cầu gói{' '}
                      <strong>
                        {(SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0]).name} (
                        {(SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0]).priceText})
                      </strong>{' '}
                      tới hộp thư cá nhân{' '}
                      <strong className="text-blue-700">{ADMIN_NOTIFICATION_EMAIL}</strong> để nhận mã kích hoạt hoặc gia hạn trực tiếp trên tài khoản.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={buildRenewalMailtoHref()}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Mở Email Gửi Yêu Cầu</span>
                      </a>
                      <button
                        type="button"
                        disabled={isSendingGmail}
                        onClick={handleSendRenewalViaGmail}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {isSendingGmail ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Gửi Nhanh Qua Gmail</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADMIN LICENSE KEY & EXTENSION MANAGER */}
              {loggedInTab === 'admin' && isAdminOwner && (
                <div className="space-y-4">
                  {/* Generate New Key Form */}
                  <form
                    onSubmit={handleAdminCreateKey}
                    className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <span>Tạo Mã Kích Hoạt Mới Cho Giáo Viên</span>
                      </span>
                      <button
                        type="button"
                        onClick={loadAdminData}
                        disabled={isLoadingAdmin}
                        className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                        title="Làm mới danh sách"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmin ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {SUBSCRIPTION_PLANS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAdminGenPlanId(p.id)}
                          className={`px-2.5 py-2 rounded-lg border text-left transition ${
                            adminGenPlanId === p.id
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 font-medium'
                          }`}
                        >
                          <div className="text-[11px]">{p.shortLabel} ({p.durationDays} ngày)</div>
                          <div
                            className={`text-[10px] ${
                              adminGenPlanId === p.id ? 'text-indigo-100' : 'text-emerald-700 font-bold'
                            }`}
                          >
                            {p.priceText}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        value={adminGenEmail}
                        onChange={(e) => setAdminGenEmail(e.target.value)}
                        placeholder="Email nhận (để trống = mã dùng chung)"
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={adminGenNote}
                        onChange={(e) => setAdminGenNote(e.target.value)}
                        placeholder="Ghi chú (VD: Thầy Nam - TH Nghĩa Hiệp)"
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingKey}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {isGeneratingKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Ticket className="w-4 h-4" />
                      )}
                      <span>Tạo Mã Kích Hoạt Ngay</span>
                    </button>

                    {newlyGeneratedKey && (
                      <div className="p-3 rounded-xl bg-white border-2 border-emerald-400 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-700 uppercase">
                            Mã vừa tạo ({newlyGeneratedKey.planLabel})
                          </div>
                          <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
                            {newlyGeneratedKey.code}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(newlyGeneratedKey.code)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                        >
                          {copiedKeyCode === newlyGeneratedKey.code ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedKeyCode === newlyGeneratedKey.code ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Registered Users & 1-Click Direct Extension */}
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-slate-50/70">
                    <div className="font-extrabold text-slate-900 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Danh sách Giáo viên ({adminUsers.length}) · Gia hạn trực tiếp</span>
                      </span>
                    </div>
                    {adminUsers.length === 0 ? (
                      <p className="text-[11px] text-slate-500">Chưa có tài khoản giáo viên nào.</p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {adminUsers.map((u) => (
                          <div
                            key={u.id}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                                <p className="text-[10.5px] text-slate-500 truncate">{u.email}</p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                  u.planTier === 'admin_lifetime'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : u.planTier === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.planTier === 'trial'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {u.planTier === 'admin_lifetime'
                                  ? 'Admin · Vĩnh viễn'
                                  : u.planTier === 'paid'
                                  ? `VIP · Còn ${u.daysRemaining} ngày`
                                  : u.planTier === 'trial'
                                  ? `Dùng thử · Còn ${u.daysRemaining} ngày`
                                  : 'Đã hết hạn'}
                              </span>
                            </div>

                            {u.planTier !== 'admin_lifetime' && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500">Gia hạn / Tặng thêm:</span>
                                {[
                                  { days: 7, label: '+7 ngày (20k)' },
                                  { days: 30, label: '+30 ngày (49k)' },
                                  { days: 120, label: '+120 ngày (1 HK Free)' },
                                  { days: 135, label: '+Học kỳ (129k)' },
                                  { days: 365, label: '+Năm (199k)' }
                                ].map((btn) => (
                                  <button
                                    key={btn.days}
                                    type="button"
                                    disabled={extendingEmail === `${u.email}_${btn.days}`}
                                    onClick={() => handleAdminExtend(u.email, btn.days, btn.label)}
                                    className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] transition"
                                  >
                                    {extendingEmail === `${u.email}_${btn.days}` ? '...' : btn.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Generated Keys History */}
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lịch sử Mã Kích Hoạt ({adminKeys.length})</span>
                    </div>
                    {adminKeys.length === 0 ? (
                      <p className="text-[11px] text-slate-500">Chưa tạo mã kích hoạt nào.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {adminKeys.slice(0, 25).map((k) => (
                          <div
                            key={k.code}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-extrabold text-slate-900 text-[11px]">
                                  {k.code}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                                  {k.planLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">
                                {k.redeemedAt
                                  ? `Đã dùng bởi ${k.redeemedByEmail} (${formatVnDate(k.redeemedAt)})`
                                  : k.targetEmail
                                  ? `Cấp riêng: ${k.targetEmail}`
                                  : k.note || 'Chưa sử dụng · Dùng cho mọi tài khoản'}
                              </p>
                            </div>
                            {k.redeemedAt ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                                Đã dùng
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCopyCode(k.code)}
                                className="px-2 py-1 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 font-bold text-[10px] flex items-center gap-1 shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedKeyCode === k.code ? 'Đã chép' : 'Chép'}</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* NOT LOGGED IN: PASSWORDLESS 30-DAY FREE TRIAL FLOW */
            <div className="p-5 space-y-4 text-xs">
              {gateReason && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-amber-900">
                      Mở khóa Full 100% tính năng miễn phí 30 ngày
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Đăng nhập nhanh bằng tài khoản cá nhân (không cần mật khẩu) để sử dụng: <strong>{gateReason}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* 1-Semester Full Free Access Hero Card */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 via-blue-50/70 to-indigo-50/70 border border-emerald-200 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs">
                    <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mở Miễn Phí Hoàn Toàn Trọn 1 Học Kỳ (120 Ngày)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                    KHÔNG CẦN MẬT KHẨU
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-700 leading-relaxed">
                  Chỉ cần đăng nhập tài khoản cá nhân để dùng thoải mái toàn bộ <strong>308+ ảnh SGK (K1–K5)</strong>, <strong>Studio Sơ Đồ Pro</strong>, <strong>Google Docs / Drive</strong> và xuất Word/PDF hoàn toàn miễn phí trong <strong>1 học kỳ</strong> để trải nghiệm thực tế và góp ý hoàn thiện!
                </p>
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

              {/* 1-Tap Google Sign-In */}
              <button
                type="button"
                disabled={isGoogleLoading || isSubmitting}
                onClick={handleGoogleQuickSignIn}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-blue-600 text-slate-900 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2.5 transition disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0 0 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.09z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                )}
                <span>Tiếp Tục Với Tài Khoản Google (1 Chạm · Không Mật Khẩu)</span>
              </button>

              {/* Remembered Accounts — 1-Tap Re-entry */}
              {rememberedAccounts.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-600">
                    Tài khoản đã dùng trên máy này (bấm 1 chạm để vào ngay):
                  </p>
                  <div className="space-y-1.5">
                    {rememberedAccounts.map((acc) => (
                      <div
                        key={acc.email}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition"
                      >
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleQuickRememberedSignIn(acc)}
                          className="flex-1 text-left min-w-0 flex items-center gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {(acc.fullName || acc.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{acc.fullName}</p>
                            <p className="text-[10.5px] text-slate-500 truncate">{acc.email}</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRememberedAccount(acc.email)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Xóa khỏi danh sách ghi nhớ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10.5px] font-semibold text-slate-400 whitespace-nowrap">
                  hoặc nhập Email cá nhân (không cần tạo mật khẩu)
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Passwordless Personal Email Form */}
              <form onSubmit={handlePasswordlessSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email cá nhân của thầy/cô <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="giaovien.gdtc@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ và tên giáo viên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="VD: Nguyễn Văn An"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Đơn vị / Trường
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="VD: Trường TH Nghĩa Hiệp"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này cho lần mở sau</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  )}
                  <span>Vào Dùng Miễn Phí Trọn 1 Học Kỳ (Không Cần Mật Khẩu)</span>
                </button>
              </form>

              {/* Transparent Pricing & Contact Footer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                <p>
                  <strong className="text-slate-800">☕ Vì cộng đồng giáo viên GDTC:</strong> Mở miễn phí trọn 1 học kỳ (120 ngày) &amp; cam kết bảo toàn 100% giáo án cũ. Nếu thấy hữu ích, thầy cô có thể ủng hộ tùy tâm duy trì máy chủ/API bất cứ lúc nào.
                </p>
                <p>
                  Mọi ý kiến đóng góp &amp; hỗ trợ gửi về:{' '}
                  <a
                    href={`mailto:${ADMIN_NOTIFICATION_EMAIL}`}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    {ADMIN_NOTIFICATION_EMAIL}
                  </a>
                </p>
              </div>

              {/* Optional Legacy Password Login Collapsible */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLegacyPassword((v) => !v)}
                  className="w-full py-1.5 text-[11px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1"
                >
                  <span>Đã có tài khoản mật khẩu cũ?</span>
                  {showLegacyPassword ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {showLegacyPassword && (
                  <form onSubmit={handleLegacyPasswordLogin} className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="text-[10.5px] text-slate-500">
                      Lưu ý: Bạn vẫn có thể vào lại tài khoản cũ ngay bên trên chỉ bằng Email mà không cần mật khẩu.
                    </p>
                    <input
                      type="password"
                      required
                      value={legacyPassword}
                      onChange={(e) => setLegacyPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng nhập bằng mật khẩu cũ</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
