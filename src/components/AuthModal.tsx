import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  LogIn,
  Smartphone,
  Image as ImageIcon,
  Link2
} from 'lucide-react';
import {
  useAuth,
  AuthUser,
  LicenseKeyRecord,
  RegistrationNotificationItem,
  PaymentProofRequest
} from '../contexts/AuthContext';
import {
  googleQuickSignIn,
  googleSignIn,
  googleGmailSignIn,
  getCachedAccessTokenSync,
  getInAppBrowserName
} from '../services/googleAuth';
import {
  ADMIN_NOTIFICATION_EMAIL,
  sendEmailViaGmailApi,
  buildRegistrationNotificationEmail,
  buildActivationSuccessEmailToUser,
  buildGmailWebComposeUrl,
  SendGmailParams
} from '../services/googleGmailService';
import {
  SUBSCRIPTION_PLANS,
  SubscriptionPlanId,
  TRIAL_DURATION_DAYS,
  formatVnDate,
  formatVnd,
  getShortPaidPlanBadge
} from '../utils/subscriptionPlans';
import { DonationSupportCard } from './DonationSupportCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSchoolName?: string;
  defaultTeacherName?: string;
  initialMode?: 'login' | 'register' | 'billing' | 'admin';
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
    adminGetPaymentRequests,
    adminApprovePaymentRequest,
    adminMarkPaymentRequestEmailed,
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
  const [copiedPageUrl, setCopiedPageUrl] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const inAppBrowserName = getInAppBrowserName();

  // Optional legacy password login toggle
  const [showLegacyPassword, setShowLegacyPassword] = useState(false);
  const [legacyPassword, setLegacyPassword] = useState('');

  // Logged-in inner tab: 'overview' | 'billing' | 'admin'
  const [loggedInTab, setLoggedInTab] = useState<'overview' | 'billing' | 'admin'>('overview');

  // Feature reference & Key redemption state
  const [showFeaturePlans, setShowFeaturePlans] = useState(false);
  const [licenseCodeInput, setLicenseCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Admin license & user management state
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>([]);
  const [adminKeys, setAdminKeys] = useState<LicenseKeyRecord[]>([]);
  const [adminPaymentRequests, setAdminPaymentRequests] = useState<PaymentProofRequest[]>([]);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [sendingActivationEmailId, setSendingActivationEmailId] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminGenPlanId, setAdminGenPlanId] = useState<SubscriptionPlanId>('week_1');
  const [adminGenEmail, setAdminGenEmail] = useState('');
  const [adminGenNote, setAdminGenNote] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<LicenseKeyRecord | null>(null);
  const [manualKeyRecipientEmail, setManualKeyRecipientEmail] = useState('');
  const [sendingManualKeyCode, setSendingManualKeyCode] = useState<string | null>(null);
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
  const pendingPaymentCount = adminPaymentRequests.filter((r) => r.status === 'pending').length;

  const loadAdminData = useCallback(async () => {
    if (!user || user.email.toLowerCase() !== ADMIN_NOTIFICATION_EMAIL.toLowerCase()) return;
    setIsLoadingAdmin(true);
    const [subRes, payRes] = await Promise.all([
      adminGetSubscriptions(),
      adminGetPaymentRequests()
    ]);
    if (subRes.success) {
      setAdminUsers(subRes.users || []);
      setAdminKeys(subRes.keys || []);
    }
    if (payRes.success) {
      setAdminPaymentRequests(payRes.requests || []);
    }
    setIsLoadingAdmin(false);
  }, [user, adminGetSubscriptions, adminGetPaymentRequests]);

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
      setShowFeaturePlans(false);
      if (!email && rememberedAccounts.length > 0) {
        setEmail(rememberedAccounts[0].email);
        if (!fullName) setFullName(rememberedAccounts[0].fullName);
        if (!schoolName) setSchoolName(rememberedAccounts[0].schoolName);
      }
      if (user) {
        refreshUser();
        loadNotifications();
        const isOwner = user.email.toLowerCase() === ADMIN_NOTIFICATION_EMAIL.toLowerCase();
        if (isOwner) {
          loadAdminData();
        }
        if (initialMode === 'admin' && isOwner) {
          setLoggedInTab('admin');
        } else if (initialMode === 'billing' || user.hasFullAccess === false) {
          setLoggedInTab('billing');
        } else {
          setLoggedInTab('overview');
        }
      }
    }
  }, [isOpen, initialMode, user?.id, user?.hasFullAccess]);

  if (!isOpen) return null;

  const triggerBackgroundSync = (mode: 'login' | 'register') => {
    try {
      Promise.resolve(onAuthSuccess(mode)).catch(() => {
        // Keep login succeeded even if background workspace sync fails on slow mobile network
      });
    } catch {
      // Ignore sync errors so modal always closes cleanly
    }
  };

  const handleCopyLinkForBrowser = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedPageUrl(true);
      showToast('✅ Đã sao chép đường dẫn! Thầy/cô hãy dán vào Chrome hoặc Safari.');
      setTimeout(() => setCopiedPageUrl(false), 3000);
    } catch {
      showToast('Hãy bấm biểu tượng ba chấm (⋯) góc trên rồi chọn "Mở bằng trình duyệt" (Chrome/Safari).');
    }
  };

  const handleGoogleQuickSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const gRes = await googleQuickSignIn();
      if (gRes.status === 'redirecting') {
        setSuccessMsg('Đang chuyển sang trang đăng nhập Google trên điện thoại...');
        showToast('🔄 Đang chuyển sang trang đăng nhập Google...');
        return;
      }
      if (gRes.status === 'cancelled') {
        setIsGoogleLoading(false);
        return;
      }
      const res = await passwordlessSignIn({
        email: gRes.email,
        fullName: gRes.displayName || fullName.trim() || defaultTeacherName,
        schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS',
        provider: 'google',
        rememberMe
      });
      setIsGoogleLoading(false);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Không thể đăng nhập bằng tài khoản Google.');
        return;
      }
      triggerBackgroundSync(res.isNewUser ? 'register' : 'login');
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
          'Không mở được cửa sổ Google trên điện thoại. Thầy/cô chỉ cần nhập trực tiếp Email cá nhân bên dưới (không cần mật khẩu).'
      );
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 120);
    }
  };

  const handlePasswordlessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.replace(/[\s\u200B-\u200D\uFEFF]+/g, '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Vui lòng nhập đúng địa chỉ Email cá nhân (ví dụ: giaovien@gmail.com).');
      emailInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await passwordlessSignIn({
        email: cleanEmail,
        fullName: fullName.trim() || defaultTeacherName || cleanEmail.split('@')[0],
        schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS',
        provider: 'email_passwordless',
        rememberMe
      });
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        return;
      }

      triggerBackgroundSync(res.isNewUser ? 'register' : 'login');
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
    } catch {
      setErrorMsg('Không thể kết nối lúc này. Vui lòng thử lại sau vài giây.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRememberedSignIn = async (acc: {
    email: string;
    fullName: string;
    schoolName: string;
  }) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await passwordlessSignIn({
        email: acc.email,
        fullName: acc.fullName,
        schoolName: acc.schoolName,
        provider: 'email_passwordless',
        rememberMe: true
      });
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Đăng nhập nhanh thất bại.');
        return;
      }
      triggerBackgroundSync('login');
      if (res.user.hasFullAccess === false) {
        showToast(`⏰ Tài khoản ${res.user.email} đã hết hạn dùng thử. Vui lòng gia hạn để tiếp tục.`);
        setLoggedInTab('billing');
        return;
      }
      showToast(`✅ Đã vào lại tài khoản ${res.user.fullName} (không cần mật khẩu)!`);
      onClose();
    } catch {
      setErrorMsg('Không thể đăng nhập nhanh lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLegacyPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanEmail = email.replace(/[\s\u200B-\u200D\uFEFF]+/g, '').trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập Email tài khoản ở ô phía trên trước khi đăng nhập bằng mật khẩu cũ.');
      emailInputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await login(cleanEmail, legacyPassword, rememberMe);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Email hoặc mật khẩu chưa chính xác.');
        return;
      }
      triggerBackgroundSync('login');
      showToast(`✅ Đăng nhập thành công: ${res.user.fullName}`);
      onClose();
    } catch {
      setErrorMsg('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
    const msg = `🎉 Đã kích hoạt sử dụng phần mềm thành công! (${res.planLabel || 'Bản quyền'}${res.durationDays ? ` · +${res.durationDays} ngày` : ''} · Toàn bộ tính năng tải về đã được mở khóa.)`;
    setSuccessMsg(msg);
    showToast(msg);
  };

  const buildActivationGmailWebHref = (req: PaymentProofRequest) => {
    const code = req.licenseCode || '';
    const link =
      req.activationLink ||
      `${window.location.origin}/?activate=${encodeURIComponent(code)}&email=${encodeURIComponent(req.email)}`;
    const subject = `[PE SmartPlan] Mã & Link kích hoạt ${req.scopeLabel} — PE SmartPlan 2.0`;
    const body = [
      `Xin chào ${req.fullName || req.email},`,
      '',
      `Quản trị viên đã duyệt chuyển khoản và tạo Mã kích hoạt gói ${req.scopeLabel}:`,
      `- Mã kích hoạt (Khóa kích hoạt): ${code}`,
      `- Link kích hoạt 1 chạm: ${link}`,
      '',
      `Thầy/cô đăng nhập vào ứng dụng bằng email ${req.email}, sau đó nhập mã trên (hoặc bấm trực tiếp vào link) để kích hoạt mở khóa tải giáo án đúng theo gói đã đăng ký.`,
      'Trân trọng, Thầy Lê Quốc Hưng (PE SmartPlan 2.0)'
    ].join('\n');
    return buildGmailWebComposeUrl({ to: req.email, subject, body });
  };

  const buildLicenseKeyActivationLink = (code: string, recipientEmail?: string) => {
    const cleanEmail = (recipientEmail || '').trim().toLowerCase();
    return `${window.location.origin}/?activate=${encodeURIComponent(code)}${
      cleanEmail ? `&email=${encodeURIComponent(cleanEmail)}` : ''
    }`;
  };

  const buildLicenseKeyGmailWebHref = (keyRec: LicenseKeyRecord, recipientEmail?: string) => {
    const to = (recipientEmail ?? keyRec.targetEmail ?? '').trim().toLowerCase();
    const link = buildLicenseKeyActivationLink(keyRec.code, to);
    const subject = `[PE SmartPlan] Mã & Link kích hoạt ${keyRec.planLabel} — PE SmartPlan 2.0`;
    const body = [
      `Xin chào ${keyRec.note || to || 'Thầy/Cô'},`,
      '',
      `Quản trị viên gửi thầy/cô Mã kích hoạt gói ${keyRec.planLabel} trên ứng dụng PE SmartPlan 2.0:`,
      `- Mã kích hoạt: ${keyRec.code}`,
      `- Link kích hoạt 1 chạm: ${link}`,
      '',
      'Hướng dẫn kích hoạt mở khóa tải theo gói:',
      '1. Đăng nhập ứng dụng PE SmartPlan bằng Email cá nhân.',
      '2. Nhập mã kích hoạt trên vào mục Mở khóa tải giáo án (hoặc bấm trực tiếp vào link kích hoạt 1 chạm).',
      '3. Sau khi kích hoạt thành công, tính năng tải giáo án theo gói đã đăng ký sẽ tự động mở khóa!',
      '',
      'Trân trọng, Thầy Lê Quốc Hưng (PE SmartPlan 2.0)'
    ].join('\n');
    return buildGmailWebComposeUrl({ to, subject, body });
  };

  const handleSendLicenseKeyViaGmail = async (keyRec: LicenseKeyRecord, rawRecipientEmail: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const cleanEmail = rawRecipientEmail.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Vui lòng nhập đúng địa chỉ Email của giáo viên trước khi gửi mã qua Gmail.');
      return;
    }
    setSendingManualKeyCode(keyRec.code);
    try {
      let token = getCachedAccessTokenSync();
      if (!token) {
        const gRes = await googleGmailSignIn();
        token = gRes?.accessToken || null;
      }
      if (!token) {
        setErrorMsg('Chưa cấp quyền gửi tự động qua Gmail. Thầy có thể bấm "Mở Gmail gửi mã" để gửi nhanh.');
        return;
      }
      const link = buildLicenseKeyActivationLink(keyRec.code, cleanEmail);
      const mailParams = buildActivationSuccessEmailToUser({
        recipientEmail: cleanEmail,
        fullName: keyRec.note || cleanEmail,
        planLabel: keyRec.planLabel,
        licenseCode: keyRec.code,
        activationLink: link
      });
      await sendEmailViaGmailApi(mailParams);
      const msg = `📧 Đã gửi Mã (${keyRec.code}) & Link kích hoạt gói ${keyRec.planLabel} về email ${cleanEmail}! Giáo viên đăng nhập và nhập mã để mở khóa tải theo gói.`;
      setSuccessMsg(msg);
      showToast(`📧 Đã gửi mã ${keyRec.code} về ${cleanEmail}!`);
    } catch (err: any) {
      setErrorMsg(
        err?.message || `Không gửi tự động qua Gmail được. Hãy bấm "Mở Gmail gửi mã" để gửi cho ${cleanEmail}.`
      );
    } finally {
      setSendingManualKeyCode(null);
    }
  };

  const handleCopyLicenseKeyAndLink = async (keyRec: LicenseKeyRecord, recipientEmail?: string) => {
    const cleanEmail = (recipientEmail ?? keyRec.targetEmail ?? '').trim().toLowerCase();
    const link = buildLicenseKeyActivationLink(keyRec.code, cleanEmail);
    const text = [
      `PE SmartPlan — Mã kích hoạt gói ${keyRec.planLabel}:`,
      `Mã kích hoạt: ${keyRec.code}`,
      `Link kích hoạt 1 chạm: ${link}`,
      'Thầy/cô đăng nhập ứng dụng rồi nhập mã (hoặc bấm link trên) để mở khóa tải giáo án theo gói.'
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyCode(`${keyRec.code}_link`);
      showToast(`📋 Đã chép Mã & Link kích hoạt ${keyRec.code}`);
      setTimeout(() => setCopiedKeyCode(null), 2000);
    } catch {
      showToast(`Mã: ${keyRec.code}`);
    }
  };

  const handleSendActivationEmailViaGmail = async (
    req: PaymentProofRequest,
    overrideCode?: string,
    overrideLink?: string,
    allowPromptSignIn = true
  ): Promise<boolean> => {
    const code = overrideCode || req.licenseCode;
    if (!code) return false;
    const link =
      overrideLink ||
      req.activationLink ||
      `${window.location.origin}/?activate=${encodeURIComponent(code)}&email=${encodeURIComponent(req.email)}`;

    setSendingActivationEmailId(req.id);
    try {
      let token = getCachedAccessTokenSync();
      if (!token && allowPromptSignIn) {
        const signInRes = await googleGmailSignIn();
        token = signInRes?.accessToken || null;
      }
      if (!token) {
        return false;
      }
      const mailParams = buildActivationSuccessEmailToUser({
        recipientEmail: req.email,
        fullName: req.fullName || req.email,
        planLabel: req.scopeLabel,
        licenseCode: code,
        activationLink: link
      });
      await sendEmailViaGmailApi(mailParams);
      await adminMarkPaymentRequestEmailed(req.id);
      setAdminPaymentRequests((prev) =>
        prev.map((item) =>
          item.id === req.id
            ? { ...item, activationEmailSent: true, activationEmailSentAt: Date.now() }
            : item
        )
      );
      showToast(`📧 Đã tự động gửi Mã & Link kích hoạt về email ${req.email}!`);
      return true;
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          `Chưa gửi tự động qua Gmail được. Thầy có thể bấm "Mở Gmail gửi sẵn" để gửi Mã & Link cho ${req.email}.`
      );
      return false;
    } finally {
      setSendingActivationEmailId(null);
    }
  };

  const handleApprovePaymentRequest = async (req: PaymentProofRequest) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setApprovingRequestId(req.id);
    try {
      // Request lightweight Gmail send token inside the click gesture if not cached yet
      let gmailToken = getCachedAccessTokenSync();
      if (!gmailToken) {
        const gRes = await googleGmailSignIn();
        gmailToken = gRes?.accessToken || null;
      }

      const res = await adminApprovePaymentRequest(req.id, window.location.origin);
      if (!res.success || !res.key) {
        setErrorMsg(res.error || 'Không thể duyệt yêu cầu thanh toán.');
        return;
      }
      const generatedCode = res.key.code;
      const activationLink =
        res.activationLink ||
        `${window.location.origin}/?activate=${encodeURIComponent(generatedCode)}&email=${encodeURIComponent(req.email)}`;

      const updatedReq: PaymentProofRequest = {
        ...req,
        status: 'approved',
        licenseCode: generatedCode,
        activationLink,
        approvedAt: Date.now()
      };

      // Send activation email automatically right away if token is available
      let emailAutoSent = false;
      if (gmailToken || getCachedAccessTokenSync()) {
        emailAutoSent = await handleSendActivationEmailViaGmail(updatedReq, generatedCode, activationLink, false);
      }

      await loadAdminData();

      const msg = emailAutoSent
        ? `✅ Đã tạo Mã (${generatedCode} · ${req.scopeLabel}) & gửi về email ${req.email}! Giáo viên đăng nhập và nhập mã (hoặc bấm link trong mail) để kích hoạt mở khóa tải theo gói.`
        : `✅ Đã tạo Mã ${generatedCode} (${req.scopeLabel}) cho ${req.email}. Bấm "Gửi tự động qua Gmail" hoặc "Mở Gmail gửi sẵn" để gửi ngược mã về email giáo viên.`;
      setSuccessMsg(msg);
      showToast(msg);
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleCopyCodeAndLink = async (req: PaymentProofRequest) => {
    const code = req.licenseCode || '';
    const link =
      req.activationLink ||
      `${window.location.origin}/?activate=${encodeURIComponent(code)}&email=${encodeURIComponent(req.email)}`;
    const text = `Đã kích hoạt sử dụng phần mềm thành công!\nMã kích hoạt: ${code}\nLink kích hoạt 1 chạm: ${link}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyCode(req.id);
      showToast(`📋 Đã chép Mã & Link kích hoạt cho ${req.email}`);
      setTimeout(() => setCopiedKeyCode(null), 2000);
    } catch {
      showToast(`Mã: ${code}`);
    }
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
    setManualKeyRecipientEmail(res.key.targetEmail || '');
    setAdminGenEmail('');
    setAdminGenNote('');
    setSuccessMsg(
      res.key.targetEmail
        ? `Đã tạo mã ${res.key.code} (${res.key.planLabel}) cho ${res.key.targetEmail}. Bấm "Gửi Mã về Email" ngay bên dưới để gửi cho giáo viên nhập sau khi đăng nhập!`
        : `Đã tạo mã kích hoạt mới: ${res.key.code} (${res.key.planLabel}). Nhập email giáo viên bên dưới để gửi mã về mail.`
    );
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

  const buildRenewalMailtoHref = () => {
    const subject = `[PE SmartPlan] Liên hệ hỗ trợ kích hoạt Tính năng nâng cao - ${user?.email || email}`;
    const body = [
      'Kính gửi thầy Lê Quốc Hưng,',
      '',
      'Tôi muốn liên hệ tìm hiểu và kích hoạt Tính năng nâng cao trên PE SmartPlan:',
      `- Tài khoản Email: ${user?.email || email || '(chưa nhập)'}`,
      `- Họ và tên: ${user?.fullName || fullName || '(chưa nhập)'}`,
      `- Đơn vị / Trường: ${user?.schoolName || schoolName || '(chưa nhập)'}`,
      '',
      'Vui lòng hỗ trợ hướng dẫn và cấp Mã kích hoạt giúp tôi. Xin cảm ơn!'
    ].join('\n');
    return `mailto:${encodeURIComponent(ADMIN_NOTIFICATION_EMAIL)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSendRenewalViaGmail = async () => {
    if (!user) return;
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
        subject: `[PE SmartPlan] Liên hệ hỗ trợ kích hoạt Tính năng nâng cao - ${user.email}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="color: #1d4ed8;">Yêu Cầu Hỗ Trợ Kích Hoạt Tính Năng Nâng Cao</h2>
            <p>Thầy/cô vừa gửi yêu cầu hỗ trợ tài khoản PE SmartPlan:</p>
            <ul>
              <li><strong>Họ và tên:</strong> ${user.fullName}</li>
              <li><strong>Email tài khoản:</strong> ${user.email}</li>
              <li><strong>Đơn vị / Trường:</strong> ${user.schoolName}</li>
            </ul>
            <p>Quản trị viên vui lòng mở mục <em>Quản Trị Mã</em> trong ứng dụng để cấp mã hoặc gia hạn trực tiếp cho email trên.</p>
          </div>
        `
      };
      await sendEmailViaGmailApi(params);
      setSuccessMsg(`Đã gửi yêu cầu hỗ trợ trực tiếp tới ${ADMIN_NOTIFICATION_EMAIL} qua Gmail!`);
      showToast(`📧 Đã gửi yêu cầu tới ${ADMIN_NOTIFICATION_EMAIL}!`);
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
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain no-print"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
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
                  : 'Tài Khoản & Trải Nghiệm PE SmartPlan'}
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
                      Đã kết thúc giai đoạn trải nghiệm miễn phí 1 học kỳ
                    </p>
                    <p className="text-[11.5px] text-amber-800 mt-0.5">
                      Để tiếp tục sử dụng <strong>{gateReason}</strong>, thầy/cô có thể nhập Mã kích hoạt hoặc bấm <strong>Tham khảo tính năng</strong> bên dưới.
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
                    {pendingPaymentCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-extrabold leading-tight">
                        {pendingPaymentCount}
                      </span>
                    )}
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
                          Đã Đăng Ký Sử Dụng Phần Mềm Có Phí
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10.5px] font-bold tabular-nums">
                          Còn {daysRemaining} ngày · Đã mở khóa tải về
                        </span>
                      </div>
                      <p className="text-[11.5px] text-emerald-900/85">
                        Đang mở khóa <strong>100% tính năng &amp; tải về miễn phí</strong> đến hết ngày{' '}
                        <strong>{formatVnDate(user.activeUntil)}</strong>. Cảm ơn thầy/cô đã đăng ký sử dụng phần mềm!
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
                    <div className="rounded-xl p-4 bg-amber-50/80 border border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-950">
                          <Lock className="w-4 h-4 text-amber-600" />
                          Tài Khoản Miễn Phí (Đăng Nhập Email · Chưa Đăng Ký Có Phí)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[10.5px] font-bold tabular-nums">
                          Dùng thử {daysRemaining}/{TRIAL_DURATION_DAYS} ngày · Khóa tải về
                        </span>
                      </div>
                      <p className="text-[11.5px] text-amber-950/90 leading-relaxed">
                        Đăng nhập bằng Email chỉ là tài khoản dùng thử miễn phí trực tuyến, <strong>chưa phải đăng ký sử dụng phần mềm có phí</strong> nên <strong>tính năng tải về file Word / PDF / ZIP đang bị khóa</strong>. Để mở khóa toàn bộ: chuyển khoản, gửi email kèm <strong>hình ảnh chuyển khoản thành công</strong> tới <strong>{ADMIN_NOTIFICATION_EMAIL}</strong> để nhận <strong>Mã Kích Hoạt</strong>.
                      </p>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-amber-200">
                        <div
                          className="h-full rounded-full transition-all bg-gradient-to-r from-amber-500 to-blue-500"
                          style={{ width: `${trialProgressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-700 flex-wrap gap-1">
                        <span>
                          Hạn dùng thử xem trực tuyến: <strong>{formatVnDate(user.trialEndsAt)}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoggedInTab('billing')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Thanh toán &amp; Nhập Mã Kích Hoạt mở khóa tải về</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-rose-900">
                          <Clock className="w-4 h-4 text-rose-600" />
                          Đã Kết Thúc Giai Đoạn Trải Nghiệm Miễn Phí 1 Học Kỳ
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[10.5px] font-bold">
                          CHẾ ĐỘ CƠ BẢN
                        </span>
                      </div>
                      <p className="text-[11.5px] text-rose-900/90 leading-relaxed">
                        Hồ sơ và toàn bộ giáo án thầy/cô đã soạn vẫn được lưu giữ an toàn. Mời thầy/cô nhập Mã kích hoạt hoặc liên hệ tác giả để tiếp tục mở khóa đầy đủ tính năng.
                      </p>
                      <button
                        type="button"
                        onClick={() => setLoggedInTab('billing')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>Ủng Hộ Duy Trì &amp; Nhập Mã Kích Hoạt</span>
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
                      disabled={isGoogleLoading}
                      onClick={handleGoogleQuickSignIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-slate-800 border-2 border-blue-600/80 font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.09z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z" />
                        </svg>
                      )}
                      <span>
                        {user.authMethod === 'google'
                          ? 'Đổi Tài Khoản Google Khác'
                          : 'Chuyển Sang Đăng Nhập Bằng Tài Khoản Google'}
                      </span>
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

              {/* TAB 2: VOLUNTARY SUPPORT & COLLAPSIBLE FEATURE PLANS (NO PRICES) */}
              {loggedInTab === 'billing' && (
                <div className="space-y-4">
                  {/* Official Vietcombank Support & Charitable Student Fund Card */}
                  <DonationSupportCard
                    compact
                    defaultShowQr
                    suggestedTransferNote={`Ung ho PE SmartPlan - ${user.fullName || user.email.split('@')[0]}`}
                    onShowToast={showToast}
                  />

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
                        placeholder="VD: GDTC-S1-7K9M-XXXX"
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

                  {/* Collapsible Toggle: Hidden by default — only opens when user clicks "Tham khảo tính năng" */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowFeaturePlans((v) => !v)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left bg-slate-50/80 hover:bg-blue-50/70 transition"
                    >
                      <span className="inline-flex items-center gap-2 font-bold text-slate-800 text-xs">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Tham khảo tính năng</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                        <span>{showFeaturePlans ? 'Thu gọn' : 'Xem chi tiết'}</span>
                        {showFeaturePlans ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {showFeaturePlans && (
                      <div className="p-4 border-t border-slate-200 space-y-3.5">
                        {/* Only 2 Feature Tiers: Basic & Advanced — NO PRICES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase">
                                Cơ bản
                              </span>
                              <span className="font-extrabold text-slate-900 text-xs">
                                Tính năng cơ bản
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-slate-600 leading-snug">
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>Duyệt, tra cứu Thư viện ảnh SGK (Tab 2) &amp; Kịch bản sư phạm (Tab 4).</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>Xem trước bản A4 theo từng khối hoặc gộp cả 5 khối.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>Bảo toàn 100% giáo án đã tạo, không khóa cứng dữ liệu.</span>
                              </li>
                            </ul>
                          </div>

                          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                                Nâng cao
                              </span>
                              <span className="font-extrabold text-emerald-950 text-xs">
                                Tính năng nâng cao
                              </span>
                            </div>
                            <ul className="space-y-1.5 text-emerald-900 leading-snug">
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>308+ hình ảnh SGK (K1–K5)</strong>, quét bóc tách SGK &amp; làm sạch ảnh AI.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Studio Sơ Đồ Đội Hình Pro:</strong> lưới, nhóm hình, nối nét, xoay góc, Mirror.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>Sửa trực tiếp 4 cột, nạp mẫu riêng, kết nối <strong>Google Docs / Drive</strong> &amp; xuất Word/PDF.</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Contact Author for Activation Support — NO PRICES */}
                        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                          <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span>Liên hệ tác giả Lê Quốc Hưng để được hỗ trợ kích hoạt</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            Gửi email tới hộp thư cá nhân{' '}
                            <strong className="text-blue-700">{ADMIN_NOTIFICATION_EMAIL}</strong> để được hỗ trợ kích hoạt Tính năng nâng cao cho tài khoản cá nhân hoặc tổ chuyên môn.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={buildRenewalMailtoHref()}
                              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Mở Email Liên Hệ</span>
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
                  </div>
                </div>
              )}

              {/* TAB 3: ADMIN LICENSE KEY & EXTENSION MANAGER */}
              {loggedInTab === 'admin' && isAdminOwner && (
                <div className="space-y-4">
                  {/* Payment Proof Approval Queue -> Auto Generate Key + 1-Click Activation Link + Auto Email */}
                  <div className="border-2 border-emerald-200 rounded-xl p-3.5 space-y-2.5 bg-emerald-50/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>
                          Ảnh chuyển khoản chờ duyệt ({pendingPaymentCount} chờ · {adminPaymentRequests.length} tổng)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={loadAdminData}
                        disabled={isLoadingAdmin}
                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                        title="Làm mới danh sách"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmin ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {adminPaymentRequests.length === 0 ? (
                      <p className="text-[11px] text-slate-500">
                        Chưa có giáo viên nào tải lên ảnh chuyển khoản.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {adminPaymentRequests.map((req) => (
                          <div
                            key={req.id}
                            className={`p-3 rounded-xl border space-y-2 ${
                              req.status === 'pending'
                                ? 'bg-white border-amber-300'
                                : 'bg-white/90 border-emerald-200'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {req.proofImageDataUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewReceiptUrl(req.proofImageDataUrl || null)}
                                  className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-emerald-500 transition"
                                  title="Bấm xem ảnh chuyển khoản lớn"
                                >
                                  <img
                                    src={req.proofImageDataUrl}
                                    alt={`Ảnh chuyển khoản ${req.id}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ) : (
                                <div className="shrink-0 w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-xs truncate">
                                    {req.email}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                                      req.status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {req.status === 'approved' ? 'Đã duyệt · Cấp mã' : 'Chờ duyệt'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 truncate">
                                  {req.fullName}
                                  {req.schoolName ? ` · ${req.schoolName}` : ''}
                                </div>
                                <div className="text-[11px] text-slate-700 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-bold text-emerald-700">{formatVnd(req.amountVnd)}</span>
                                  <span>· {req.scopeLabel}</span>
                                  <span className="text-slate-400">#{req.id}</span>
                                </div>
                                <div className="text-[10.5px] font-mono text-slate-500 truncate">
                                  ND: {req.transferNote}
                                </div>
                              </div>
                            </div>

                            {req.status === 'pending' ? (
                              <button
                                type="button"
                                disabled={approvingRequestId === req.id}
                                onClick={() => handleApprovePaymentRequest(req)}
                                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                              >
                                {approvingRequestId === req.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Duyệt → Tự động tạo Mã &amp; Gửi Link Kích Hoạt</span>
                              </button>
                            ) : (
                              <div className="pt-1.5 border-t border-emerald-100 space-y-1.5">
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="font-mono font-extrabold text-emerald-900">
                                    Mã: {req.licenseCode}
                                  </span>
                                  {req.activationEmailSent ? (
                                    <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Đã gửi email
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-700">
                                      Chưa gửi email
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={sendingActivationEmailId === req.id}
                                    onClick={() => handleSendActivationEmailViaGmail(req, undefined, undefined, true)}
                                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[10.5px] inline-flex items-center gap-1"
                                  >
                                    {sendingActivationEmailId === req.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    <span>{req.activationEmailSent ? 'Gửi lại qua Gmail' : 'Gửi tự động qua Gmail'}</span>
                                  </button>
                                  <a
                                    href={buildActivationGmailWebHref(req)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10.5px] inline-flex items-center gap-1"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>Mở Gmail gửi sẵn</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCodeAndLink(req)}
                                    className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10.5px] inline-flex items-center gap-1"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    <span>{copiedKeyCode === req.id ? 'Đã chép' : 'Chép Mã & Link'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Receipt Fullscreen Lightbox */}
                  {previewReceiptUrl && (
                    <div
                      className="fixed inset-0 z-[120] bg-slate-950/80 flex items-center justify-center p-4"
                      onClick={() => setPreviewReceiptUrl(null)}
                    >
                      <div
                        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                          <span>Ảnh biên lai chuyển khoản</span>
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(null)}
                            className="p-1 hover:bg-white/15 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-auto">
                          <img
                            src={previewReceiptUrl}
                            alt="Biên lai chuyển khoản"
                            className="max-w-full max-h-[68vh] object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                              adminGenPlanId === p.id ? 'text-indigo-100' : 'text-emerald-700 font-semibold'
                            }`}
                          >
                            +{p.durationDays} ngày Full
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
                      <div className="p-3 rounded-xl bg-white border-2 border-emerald-400 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-emerald-700 uppercase">
                              Mã vừa tạo ({newlyGeneratedKey.planLabel})
                            </div>
                            <div className="font-mono text-sm font-extrabold text-slate-900 tracking-wider select-all">
                              {newlyGeneratedKey.code}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(newlyGeneratedKey.code)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 shrink-0"
                          >
                            {copiedKeyCode === newlyGeneratedKey.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedKeyCode === newlyGeneratedKey.code ? 'Đã chép' : 'Chép mã'}</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-emerald-100 space-y-2">
                          <input
                            type="email"
                            value={manualKeyRecipientEmail}
                            onChange={(e) => setManualKeyRecipientEmail(e.target.value)}
                            placeholder="Nhập Email giáo viên để gửi ngược mã & link kích hoạt..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={sendingManualKeyCode === newlyGeneratedKey.code}
                              onClick={() =>
                                handleSendLicenseKeyViaGmail(newlyGeneratedKey, manualKeyRecipientEmail)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1 transition"
                            >
                              {sendingManualKeyCode === newlyGeneratedKey.code ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Gửi Mã về Email (Gmail)</span>
                            </button>
                            <a
                              href={buildLicenseKeyGmailWebHref(newlyGeneratedKey, manualKeyRecipientEmail)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] inline-flex items-center gap-1 transition"
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                              <span>Mở Gmail gửi mã</span>
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLicenseKeyAndLink(newlyGeneratedKey, manualKeyRecipientEmail)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 transition"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>
                                {copiedKeyCode === `${newlyGeneratedKey.code}_link` ? 'Đã chép' : 'Chép Mã & Link'}
                              </span>
                            </button>
                          </div>
                        </div>
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
                                  ? `${getShortPaidPlanBadge(u.paidPlanId)} · Còn ${u.daysRemaining} ngày`
                                  : u.planTier === 'trial'
                                  ? `Miễn phí · Còn ${u.daysRemaining} ngày`
                                  : 'Đã hết hạn'}
                              </span>
                            </div>

                            {u.planTier !== 'admin_lifetime' && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500">Gia hạn / Tặng thêm:</span>
                                {[
                                  { days: 7, label: '+7 ngày' },
                                  { days: 30, label: '+30 ngày' },
                                  { days: 120, label: '+120 ngày (1 HK)' },
                                  { days: 135, label: '+135 ngày (HK)' },
                                  { days: 365, label: '+365 ngày (1 Năm)' }
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
                              <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                                {k.targetEmail && (
                                  <button
                                    type="button"
                                    disabled={sendingManualKeyCode === k.code}
                                    onClick={() => handleSendLicenseKeyViaGmail(k, k.targetEmail || '')}
                                    className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[10px] flex items-center gap-1"
                                    title={`Gửi mã về email ${k.targetEmail}`}
                                  >
                                    {sendingManualKeyCode === k.code ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    <span>Gửi mail</span>
                                  </button>
                                )}
                                <a
                                  href={buildLicenseKeyGmailWebHref(k, k.targetEmail)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-md bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 font-bold text-[10px] flex items-center gap-1"
                                  title="Mở Gmail soạn sẵn mã & link kích hoạt"
                                >
                                  <Mail className="w-3 h-3 text-blue-600" />
                                  <span>Gmail</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(k.code)}
                                  className="px-2 py-1 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 font-bold text-[10px] flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedKeyCode === k.code ? 'Đã chép' : 'Chép'}</span>
                                </button>
                              </div>
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
                      Mở khóa Full 100% tính năng miễn phí trọn 1 học kỳ (120 ngày)
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Đăng nhập nhanh bằng tài khoản cá nhân (không cần mật khẩu) để sử dụng: <strong>{gateReason}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* 1-Semester Free Online Trial Hero Card */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 via-blue-50/70 to-indigo-50/70 border border-emerald-200 p-3 sm:p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs">
                    <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đăng Nhập Tài Khoản Miễn Phí (Trải Nghiệm 120 Ngày)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                    KHÔNG CẦN MẬT KHẨU
                  </span>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-slate-700 leading-relaxed">
                  Đăng nhập nhanh bằng <strong>Google</strong> hoặc <strong>Email cá nhân</strong> để xem &amp; soạn bài trực tuyến miễn phí. <em>(Tính năng tải file Word / PDF / ZIP mở khóa sau khi thanh toán &amp; nhập Mã Kích Hoạt.)</em>
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

              {/* In-App Browser Helper Banner (Zalo, Facebook, Messenger, TikTok) */}
              {inAppBrowserName && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] leading-relaxed">
                      Thầy/cô đang mở ứng dụng bên trong <strong>{inAppBrowserName}</strong> (nơi Google chặn cửa sổ đăng nhập). Để vào ngay trên điện thoại: chỉ cần <strong>nhập Email cá nhân bên dưới</strong> (không cần mật khẩu) hoặc mở trang này bằng <strong>Chrome / Safari</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => emailInputRef.current?.focus()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] active:bg-emerald-700"
                    >
                      Nhập Email vào ngay
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLinkForBrowser}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 active:bg-amber-100"
                    >
                      {copiedPageUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPageUrl ? 'Đã sao chép link' : 'Sao chép link mở Chrome/Safari'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1-Tap Google Sign-In */}
              <button
                type="button"
                disabled={isGoogleLoading || isSubmitting}
                onClick={handleGoogleQuickSignIn}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-blue-50 border-2 border-blue-600 text-slate-900 font-extrabold text-xs shadow-xs flex items-center justify-center gap-2.5 transition disabled:opacity-50"
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
                          className="flex-1 text-left min-w-0 flex items-center gap-2.5 min-h-[40px]"
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
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
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
              <form onSubmit={handlePasswordlessSubmit} noValidate className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email cá nhân của thầy/cô <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="go"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="giaovien.gdtc@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-base sm:text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ và tên giáo viên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                      <input
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="VD: Nguyễn Văn An"
                        className="w-full pl-9 pr-3 py-2 text-base sm:text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Đơn vị / Trường
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                      <input
                        type="text"
                        autoComplete="organization"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="VD: Trường TH Nghĩa Hiệp"
                        className="w-full pl-9 pr-3 py-2 text-base sm:text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này cho lần mở sau</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 active:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition"
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
                  className="w-full py-2 text-[11px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1"
                >
                  <span>Đã có tài khoản mật khẩu cũ?</span>
                  {showLegacyPassword ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {showLegacyPassword && (
                  <form onSubmit={handleLegacyPasswordLogin} noValidate className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="text-[10.5px] text-slate-500">
                      Lưu ý: Bạn vẫn có thể vào lại tài khoản cũ ngay bên trên chỉ bằng Email mà không cần mật khẩu.
                    </p>
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={legacyPassword}
                      onChange={(e) => setLegacyPassword(e.target.value)}
                      placeholder="Nhập mật khẩu cũ..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-base sm:text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[42px] py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
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
