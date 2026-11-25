import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  X,
  FolderArchive,
  FileText,
  Download,
  CheckCircle2,
  BookOpen,
  CalendarRange,
  ShieldCheck,
  Loader2,
  Layers,
  Sparkles,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Mail,
  KeyRound,
  Lock,
  Unlock,
  Landmark,
  Upload,
  Image as ImageIcon,
  Trash2,
  Send
} from 'lucide-react';
import {
  GradeLevel,
  SchoolSettings,
  CustomLayoutBlueprint,
  WeeklyMasterScheduleRow
} from '../types/gdtc';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import { WeeklyIntegrationThemes } from '../utils/academicCalendar';
import { buildWordExportPackage } from '../utils/exportUtils';
import { buildMasterPlanIntegrationsFromAddress } from '../data/integrationAddressesData';
import { useAuth, PaymentProofRequest } from '../contexts/AuthContext';
import {
  ADMIN_OWNER_EMAIL,
  DONATION_BANK_INFO,
  DOWNLOAD_PRICING,
  SubscriptionPlanId,
  buildDonationVietQrUrl,
  canDownloadScopeByPlan,
  formatVnd,
  getShortPaidPlanBadge
} from '../utils/subscriptionPlans';
import {
  buildPaymentProofToAdminEmail,
  buildGmailWebComposeUrl,
  sendEmailViaGmailApi
} from '../services/googleGmailService';
import { getCachedAccessTokenSync, googleGmailSignIn } from '../services/googleAuth';

export type SemesterExportScope = 'week_1' | 'hk1' | 'hk2' | 'full_year';
export type BundleGradeTarget = GradeLevel | 'all';
export type BundlePackageMode = 'zip_by_week' | 'single_docx';

interface ResolvedWeekBundle {
  plans: MasterPlanItem[];
  dateRange: string;
  approvalDate: string;
  scheduleRows: WeeklyMasterScheduleRow[];
  themes: WeeklyIntegrationThemes | null;
}

interface SemesterBundleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGrade?: GradeLevel;
  initialScope?: SemesterExportScope;
  currentWeek?: number;
  schoolSettings: SchoolSettings;
  resolveWeekPlansForGrade: (week: number, grade: GradeLevel) => ResolvedWeekBundle;
  lessonPlanColWidths?: number[];
  scheduleColWidths?: number[];
  imageMaxHeightPt?: number;
  layoutBlueprint?: CustomLayoutBlueprint | null;
  showToast: (msg: string) => void;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function getWeeksForScope(scope: SemesterExportScope, activeWeek: number): number[] {
  if (scope === 'week_1') return [Math.max(1, Math.min(35, activeWeek || 1))];
  if (scope === 'hk1') return Array.from({ length: 18 }, (_, i) => i + 1);
  if (scope === 'hk2') return Array.from({ length: 17 }, (_, i) => i + 19);
  return Array.from({ length: 35 }, (_, i) => i + 1);
}

function getScopeMeta(scope: SemesterExportScope, activeWeek: number) {
  if (scope === 'week_1') {
    return {
      label: `1 Tuần (Tuần ${activeWeek})`,
      shortLabel: `Tuan_${pad2(activeWeek)}`,
      periodCount: 2,
      weekCount: 1,
      unitPriceVnd: DOWNLOAD_PRICING.weekVnd,
      priceShort: '20k',
      planCodeHint: 'W1',
      planId: 'week_1' as SubscriptionPlanId,
    };
  }
  if (scope === 'hk1') {
    return {
      label: 'Học kỳ I (Tuần 1–18)',
      shortLabel: 'Hoc_Ky_1',
      periodCount: 36,
      weekCount: 18,
      unitPriceVnd: DOWNLOAD_PRICING.semesterVnd,
      priceShort: '360k',
      planCodeHint: 'S1',
      planId: 'semester_1' as SubscriptionPlanId,
    };
  }
  if (scope === 'hk2') {
    return {
      label: 'Học kỳ II (Tuần 19–35)',
      shortLabel: 'Hoc_Ky_2',
      periodCount: 34,
      weekCount: 17,
      unitPriceVnd: DOWNLOAD_PRICING.semesterVnd,
      priceShort: '360k',
      planCodeHint: 'S1',
      planId: 'semester_1' as SubscriptionPlanId,
    };
  }
  return {
    label: 'Cả Năm Học (Tuần 1–35)',
    shortLabel: 'Ca_Nam_Hoc_Tich_Hop',
    periodCount: 70,
    weekCount: 35,
    unitPriceVnd: DOWNLOAD_PRICING.fullYearVnd,
    priceShort: '700k',
    planCodeHint: 'Y1',
    planId: 'year_1' as SubscriptionPlanId,
  };
}

/**
 * Compress uploaded receipt screenshot to a crisp JPEG data URL (max ~960px) so upload & Gmail attachment stay fast on phones.
 */
async function compressReceiptImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'));
    reader.onload = () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('File đã chọn không phải hình ảnh hợp lệ.'));
      img.onload = () => {
        const maxSide = 960;
        let w = img.width;
        let h = img.height;
        if (w > maxSide || h > maxSide) {
          const ratio = Math.min(maxSide / w, maxSide / h);
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

async function buildIntegratedSummaryDocxBlob(
  grade: GradeLevel,
  scope: SemesterExportScope,
  activeWeek: number,
  plans: MasterPlanItem[],
  settings: SchoolSettings
): Promise<Blob> {
  const scopeMeta = getScopeMeta(scope, activeWeek);
  const schoolName = (settings.schoolName || 'TRƯỜNG TIỂU HỌC').toUpperCase();
  const teacherName = settings.teacherName || 'Giáo viên GDTC';
  const schoolYear = settings.schoolYear || '2025 - 2026';

  const rowsHtml = plans
    .map((p) => {
      const official = buildMasterPlanIntegrationsFromAddress(
        grade,
        p.week,
        p.lessonNum,
        p.title || ''
      );
      const domains = (p.integrations?.domains || official.domains || []).join(', ');
      const addrLabel = p.integrations?.addressLabel || official.addressLabel || '';
      const addrContent = p.integrations?.addressContent || official.addressContent || '';
      const nls = p.integrations?.digitalSkill || official.digitalSkill || '';
      const integTextParts = [
        domains ? `<b>[${escapeHtml(domains)}]</b>` : '',
        addrLabel ? `<b>${escapeHtml(addrLabel)}:</b> ` : '',
        escapeHtml(addrContent),
        nls ? `<br/><i>Năng lực số: ${escapeHtml(nls)}</i>` : '',
      ].filter(Boolean);

      return `
        <tr>
          <td style="text-align:center;font-weight:bold;">Tuần ${p.week}</td>
          <td style="text-align:center;">Tiết ${p.lessonNum}</td>
          <td>${escapeHtml(p.topic || '')}</td>
          <td><b>${escapeHtml(p.title || '')}</b></td>
          <td>${integTextParts.join(' ')}</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: A4 landscape; margin: 1.4cm 1.4cm 1.4cm 1.6cm; }
        body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.35; color: #000; }
        h1 { font-size: 14pt; text-align: center; margin: 4pt 0; text-transform: uppercase; }
        h2 { font-size: 12.5pt; text-align: center; margin: 2pt 0 10pt; font-weight: bold; }
        .meta { text-align: center; font-size: 11.5pt; margin-bottom: 12pt; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; font-size: 11pt; }
        th { background-color: #e8eef7; font-weight: bold; text-align: center; }
      </style>
    </head>
    <body>
      <h1>KẾ HOẠCH DẠY HỌC &amp; ĐỊA CHỈ TÍCH HỢP MÔN GIÁO DỤC THỂ CHẤT — LỚP ${grade}</h1>
      <h2>${escapeHtml(scopeMeta.label)} · Bộ sách Kết nối tri thức với cuộc sống</h2>
      <div class="meta">
        Đơn vị: <b>${escapeHtml(schoolName)}</b> &nbsp;|&nbsp; Năm học: <b>${escapeHtml(schoolYear)}</b> &nbsp;|&nbsp; Giáo viên: <b>${escapeHtml(teacherName)}</b>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:9%;">Tuần</th>
            <th style="width:9%;">Tiết PPCT</th>
            <th style="width:20%;">Chủ đề / Mạch nội dung</th>
            <th style="width:26%;">Tên bài học (SGK Kết nối tri thức)</th>
            <th style="width:36%;">Nội dung Giáo án tích hợp (KNS, BVMT, QCN, ATGT, QPAN, NLS)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="htm" ContentType="text/html"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="htmlChunk"/>
    <w:sectPr>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="794" w:right="794" w:bottom="794" w:left="907" w:header="708" w:footer="708"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.htm"/>
</Relationships>`
  );
  zip.file('word/afchunk.htm', '\ufeff' + html);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export const SemesterBundleExportModal: React.FC<SemesterBundleExportModalProps> = ({
  isOpen,
  onClose,
  initialGrade = 1,
  initialScope = 'hk1',
  currentWeek = 1,
  schoolSettings,
  resolveWeekPlansForGrade,
  lessonPlanColWidths,
  scheduleColWidths,
  imageMaxHeightPt = 92,
  layoutBlueprint,
  showToast,
}) => {
  const { user, redeemLicenseKey, submitPaymentProof, getMyPaymentRequests, refreshUser } = useAuth();
  const [targetGrade, setTargetGrade] = useState<BundleGradeTarget>(initialGrade);
  const [scope, setScope] = useState<SemesterExportScope>(initialScope);
  const [selectedSingleWeek, setSelectedSingleWeek] = useState<number>(currentWeek || 1);
  const [packageMode, setPackageMode] = useState<BundlePackageMode>('zip_by_week');
  const [includeIntegrationSummary, setIncludeIntegrationSummary] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment, Receipt Upload & Activation state
  const [showPaymentPanel, setShowPaymentPanel] = useState<boolean>(true);
  const [qrFailed, setQrFailed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [isSendingGmailNotice, setIsSendingGmailNotice] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<PaymentProofRequest | null>(null);
  const [proofNotice, setProofNotice] = useState<{ type: 'success' | 'error'; text: string; needsManualGmail?: boolean } | null>(null);
  const [licenseCodeInput, setLicenseCodeInput] = useState<string>('');
  const [isRedeemingKey, setIsRedeemingKey] = useState<boolean>(false);
  const [unlockNotice, setUnlockNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cancelRef = useRef<boolean>(false);
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.planTier === 'admin_lifetime';
  const isPaidActive = user?.planTier === 'paid' && user?.hasFullAccess !== false;
  const isScopeUnlocked = (s: SemesterExportScope) => canDownloadScopeByPlan(user, s);
  const canDownloadCurrentSelection = isScopeUnlocked(scope);

  useEffect(() => {
    if (isOpen) {
      setTargetGrade(initialGrade);
      setScope(initialScope);
      setSelectedSingleWeek(currentWeek || 1);
      setErrorMsg(null);
      setUnlockNotice(null);
      setProofNotice(null);
      setProgressPercent(0);
      setProgressLabel('');
      setQrFailed(false);
      setShowPaymentPanel(!canDownloadScopeByPlan(user, initialScope));
      cancelRef.current = false;

      if (user) {
        refreshUser();
        getMyPaymentRequests().then((res) => {
          if (res.success && res.requests && res.requests.length > 0) {
            setSubmittedRequest(res.requests[0]);
          }
        });
      }
    }
  }, [isOpen, initialGrade, initialScope, currentWeek]);

  useEffect(() => {
    if (!isOpen) return;
    setShowPaymentPanel(!canDownloadScopeByPlan(user, scope));
  }, [isOpen, scope, user?.planTier, user?.paidPlanId, user?.hasFullAccess]);

  useEffect(() => {
    if (targetGrade === 'all' && packageMode === 'single_docx') {
      setPackageMode('zip_by_week');
    }
  }, [targetGrade, packageMode]);

  useEffect(() => {
    setQrFailed(false);
  }, [scope, targetGrade, selectedSingleWeek]);

  if (!isOpen) return null;

  const weeks = getWeeksForScope(scope, selectedSingleWeek);
  const scopeMeta = getScopeMeta(scope, selectedSingleWeek);
  const gradesToExport: GradeLevel[] = targetGrade === 'all' ? [1, 2, 3, 4, 5] : [targetGrade];
  const totalLessonsCount = gradesToExport.length * scopeMeta.periodCount;

  const finalPriceVnd = scopeMeta.unitPriceVnd;
  const userTag = (user?.email?.split('@')[0] || user?.fullName || 'GV')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 18);
  const gradeCode = targetGrade === 'all' ? 'K1-5' : `K${targetGrade}`;
  const gradeLabel = targetGrade === 'all' ? 'Cả 5 Khối (1–5)' : `Khối ${targetGrade}`;
  const scopeCode =
    scope === 'week_1'
      ? `T${pad2(selectedSingleWeek)}`
      : scope === 'hk1'
      ? 'HK1'
      : scope === 'hk2'
      ? 'HK2'
      : 'CANAM';
  const transferNote = `PE SmartPlan ${gradeCode} ${scopeCode} ${userTag}`.trim();
  const vietQrUrl = buildDonationVietQrUrl(finalPriceVnd, transferNote);

  const handleCopyText = (val: string, key: string, label: string) => {
    navigator.clipboard?.writeText(val).then(() => {
      setCopiedField(key);
      showToast(`Đã sao chép ${label}!`);
      setTimeout(() => setCopiedField(null), 2200);
    });
  };

  const scrollToPaymentPanel = () => {
    setShowPaymentPanel(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleSelectProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofNotice(null);
    try {
      const compressed = await compressReceiptImage(file);
      setProofPreviewUrl(compressed);
      setProofFileName(file.name);
    } catch (err: any) {
      setProofNotice({ type: 'error', text: err?.message || 'Không đọc được ảnh đã chọn.' });
    } finally {
      e.target.value = '';
    }
  };

  const getReceiptImageUrl = (req?: PaymentProofRequest | null): string => {
    if (!req?.id) return '';
    const tokenPart = req.viewToken ? `?k=${encodeURIComponent(req.viewToken)}` : '';
    return `${window.location.origin}/api/payment-requests/${encodeURIComponent(req.id)}/image${tokenPart}`;
  };

  const buildPaymentGmailWebHref = (req?: PaymentProofRequest | null) => {
    const requestId = req?.id;
    const refPart = requestId ? ` · #${requestId}` : '';
    const amountStr = req?.amountVnd ? formatVnd(req.amountVnd) : formatVnd(finalPriceVnd);
    const emailStr = req?.email || user?.email || '(chưa đăng nhập)';
    const scopeStr = req?.scopeLabel || scopeMeta.label;
    const gradeStr = req?.gradeLabel || gradeLabel;
    const noteStr = req?.transferNote || transferNote;
    const receiptUrl = getReceiptImageUrl(req);
    const adminReviewUrl = `${window.location.origin}/?adminTab=payments`;

    const subject = `[PE SmartPlan] Đã CK ${amountStr} (${emailStr})${refPart}`;
    const bodyLines = [
      `Kính gửi Thầy Lê Quốc Hưng (${ADMIN_OWNER_EMAIL}),`,
      '',
      `Tôi đã chuyển khoản và tải ảnh biên lai lên hệ thống${requestId ? ` (Mã yêu cầu: #${requestId})` : ''}:`,
      `- Email kích hoạt: ${emailStr}`,
      `- Gói: ${scopeStr} · ${gradeStr} · ${amountStr}`,
      `- Nội dung CK: ${noteStr}`,
      ...(receiptUrl ? [`- Link xem ảnh chuyển khoản: ${receiptUrl}`] : []),
      `- Link Quản trị duyệt & gửi mã kích hoạt: ${adminReviewUrl}`,
      '',
      'Nhờ Thầy xác nhận để hệ thống gửi mã & link kích hoạt. Xin cảm ơn Thầy!'
    ];
    return buildGmailWebComposeUrl({
      to: ADMIN_OWNER_EMAIL,
      subject,
      body: bodyLines.join('\n')
    });
  };

  const handleSendExistingRequestViaGmail = async () => {
    if (!submittedRequest || !user?.email) return;
    setIsSendingGmailNotice(true);
    setProofNotice(null);
    try {
      let token = getCachedAccessTokenSync();
      if (!token) {
        const gRes = await googleGmailSignIn();
        token = gRes?.accessToken || null;
      }
      if (!token) {
        setProofNotice({
          type: 'error',
          text: 'Chưa cấp quyền gửi tự động qua Gmail. Hãy bấm nút "Mở Gmail" ngay bên cạnh để mở sẵn thư kèm link ảnh chuyển khoản.',
          needsManualGmail: true
        });
        return;
      }
      const receiptImageUrl = getReceiptImageUrl(submittedRequest);
      const adminReviewUrl = `${window.location.origin}/?adminTab=payments`;
      const emailPayload = buildPaymentProofToAdminEmail({
        requestId: submittedRequest.id,
        email: submittedRequest.email,
        fullName: submittedRequest.fullName || user.fullName || schoolSettings.teacherName || user.email.split('@')[0],
        schoolName: submittedRequest.schoolName || user.schoolName || schoolSettings.schoolName || '',
        scopeLabel: submittedRequest.scopeLabel,
        gradeLabel: submittedRequest.gradeLabel,
        amountText: formatVnd(submittedRequest.amountVnd),
        transferNote: submittedRequest.transferNote,
        adminReviewUrl,
        receiptImageUrl
      });
      await sendEmailViaGmailApi(emailPayload);
      setProofNotice({
        type: 'success',
        text: `✅ Đã gửi Email báo nhận ảnh chuyển khoản (#${submittedRequest.id}) trực tiếp tới ${ADMIN_OWNER_EMAIL}!`
      });
      showToast(`📧 Đã gửi email thông báo tới ${ADMIN_OWNER_EMAIL}!`);
    } catch (err: any) {
      setProofNotice({
        type: 'error',
        text:
          err?.message ||
          `Không gửi tự động qua Gmail được. Hãy bấm nút "Mở Gmail" để gửi nhanh tới ${ADMIN_OWNER_EMAIL}.`,
        needsManualGmail: true
      });
    } finally {
      setIsSendingGmailNotice(false);
    }
  };

  const handleUploadAndSendProof = async () => {
    if (!user?.email) {
      setProofNotice({ type: 'error', text: 'Vui lòng đăng nhập Email trước khi tải ảnh chuyển khoản.' });
      return;
    }
    if (!proofPreviewUrl) {
      setProofNotice({ type: 'error', text: 'Vui lòng chọn hình ảnh chụp màn hình chuyển khoản thành công.' });
      fileInputRef.current?.click();
      return;
    }

    setIsUploadingProof(true);
    setProofNotice(null);
    try {
      // 1. Obtain Gmail send permission inside the direct click gesture BEFORE async upload so popup is never blocked
      let gmailToken = getCachedAccessTokenSync();
      if (!gmailToken) {
        const gRes = await googleGmailSignIn();
        gmailToken = gRes?.accessToken || null;
      }

      // 2. Upload receipt image directly to server for Admin verification
      const uploadRes = await submitPaymentProof({
        planId: scopeMeta.planId,
        scopeLabel: scopeMeta.label,
        gradeLabel,
        amountVnd: finalPriceVnd,
        transferNote,
        proofImageDataUrl: proofPreviewUrl,
        fullName: user.fullName || schoolSettings.teacherName,
        schoolName: user.schoolName || schoolSettings.schoolName
      });

      if (!uploadRes.success || !uploadRes.request) {
        setProofNotice({
          type: 'error',
          text: uploadRes.error || 'Chưa tải được ảnh lên hệ thống. Vui lòng thử lại.'
        });
        return;
      }

      const savedReq = uploadRes.request;
      setSubmittedRequest(savedReq);

      const receiptImageUrl = getReceiptImageUrl(savedReq);
      const adminReviewUrl = `${window.location.origin}/?adminTab=payments`;

      // 3. Automatically send email WITH attached receipt image + direct view link via Gmail API
      let sentViaGmail = false;
      if (gmailToken) {
        try {
          const emailPayload = buildPaymentProofToAdminEmail({
            requestId: savedReq.id,
            email: user.email,
            fullName: user.fullName || schoolSettings.teacherName || user.email.split('@')[0],
            schoolName: user.schoolName || schoolSettings.schoolName || '',
            scopeLabel: scopeMeta.label,
            gradeLabel,
            amountText: formatVnd(finalPriceVnd),
            transferNote,
            adminReviewUrl,
            receiptImageUrl,
            proofImageDataUrl: proofPreviewUrl
          });
          await sendEmailViaGmailApi(emailPayload);
          sentViaGmail = true;
        } catch {
          sentViaGmail = false;
        }
      }

      if (sentViaGmail) {
        setProofNotice({
          type: 'success',
          text: `✅ Đã tải ảnh & gửi Email KÈM ẢNH chuyển khoản tới ${ADMIN_OWNER_EMAIL} (#${savedReq.id})! Quản trị viên duyệt xong sẽ tự động gửi Mã & Link kích hoạt về ${user.email}.`
        });
        showToast(`✅ Đã gửi email kèm ảnh chuyển khoản tới ${ADMIN_OWNER_EMAIL} (#${savedReq.id})!`);
      } else {
        setProofNotice({
          type: 'success',
          text: `Đã lưu ảnh chuyển khoản (#${savedReq.id}) lên hệ thống. Bấm nút "Mở Gmail Gửi Ngay" bên dưới để gửi báo ngay vào hộp thư ${ADMIN_OWNER_EMAIL} (đã điền sẵn link ảnh).`,
          needsManualGmail: true
        });
        showToast(`✅ Đã lưu ảnh chuyển khoản (#${savedReq.id})! Bấm "Mở Gmail" để gửi thông báo vào mail.`);
      }
      setProofPreviewUrl(null);
      setProofFileName('');
    } catch (err: any) {
      setProofNotice({
        type: 'error',
        text: err?.message || 'Có lỗi khi gửi ảnh chuyển khoản.'
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  const redeemCodeNow = async (rawCode: string) => {
    const cleaned = rawCode.trim().toUpperCase();
    if (!cleaned) {
      setUnlockNotice({ type: 'error', text: 'Vui lòng nhập Mã Kích Hoạt.' });
      return;
    }
    setIsRedeemingKey(true);
    setUnlockNotice(null);
    try {
      const res = await redeemLicenseKey(cleaned);
      if (res.success) {
        setLicenseCodeInput('');
        const unlockedCurrent = canDownloadScopeByPlan(res.user, scope);
        let nextScope = scope;
        if (!unlockedCurrent) {
          if (res.planId === 'week_1' || res.planId === 'month_1') {
            nextScope = 'week_1';
            setScope('week_1');
          } else if (res.planId === 'semester_1' && scope === 'full_year') {
            nextScope = 'hk1';
            setScope('hk1');
          }
        }
        if (canDownloadScopeByPlan(res.user, nextScope)) {
          setShowPaymentPanel(false);
        }
        const activeLabel = res.planLabel || getShortPaidPlanBadge(res.user?.paidPlanId);
        setUnlockNotice({
          type: 'success',
          text: `🎉 Đã kích hoạt sử dụng phần mềm thành công (${activeLabel})! Tính năng tải về theo gói đã được mở khóa.`
        });
        showToast(`🎉 Đã kích hoạt thành công ${activeLabel}! Đã mở khóa tải theo gói.`);
      } else {
        setUnlockNotice({
          type: 'error',
          text: res.error || 'Mã kích hoạt chưa hợp lệ. Vui lòng kiểm tra lại.'
        });
      }
    } catch (err: any) {
      setUnlockNotice({
        type: 'error',
        text: err?.message || 'Không thể kiểm tra mã kích hoạt lúc này.'
      });
    } finally {
      setIsRedeemingKey(false);
    }
  };

  const handleRedeemUnlockKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await redeemCodeNow(licenseCodeInput);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleStartExport = async () => {
    if (!canDownloadCurrentSelection) {
      scrollToPaymentPanel();
      showToast('🔒 Tính năng tải về đang khóa. Vui lòng chuyển khoản, tải ảnh lên để nhận Mã & Link kích hoạt!');
      return;
    }

    setIsExporting(true);
    setErrorMsg(null);
    setProgressPercent(2);
    cancelRef.current = false;

    try {
      const yearSlug = (schoolSettings.schoolYear || '2025-2026').replace(/[^0-9]+/g, '-').replace(/^-|-$/g, '');

      if ((packageMode === 'single_docx' || scope === 'week_1') && targetGrade !== 'all') {
        const g = targetGrade;
        const allPlans: MasterPlanItem[] = [];
        let lastDateRange = '';
        let lastApprovalDate = '';

        for (let i = 0; i < weeks.length; i++) {
          if (cancelRef.current) {
            setIsExporting(false);
            setProgressLabel('Đã hủy đóng gói.');
            return;
          }
          const w = weeks[i];
          setProgressLabel(`Đang tổng hợp Khối ${g} · Tuần ${w}/${weeks[weeks.length - 1]}...`);
          setProgressPercent(Math.round(((i + 1) / (weeks.length + 2)) * 80));
          await new Promise((r) => setTimeout(r, 0));

          const resolved = resolveWeekPlansForGrade(w, g);
          allPlans.push(...resolved.plans);
          lastDateRange = resolved.dateRange;
          lastApprovalDate = resolved.approvalDate;
        }

        setProgressLabel(`Đang xuất file Word (.DOCX) Khối ${g} (${allPlans.length} tiết)...`);
        setProgressPercent(88);
        await new Promise((r) => setTimeout(r, 15));

        const filename = `PE_SmartPlan_Giao_An_GDTC_Khoi_${g}_${scopeMeta.shortLabel}_${yearSlug}.docx`;
        const pkg = await buildWordExportPackage({
          plans: allPlans,
          settings: schoolSettings,
          week: weeks[0],
          includeSchedule: false,
          filename,
          format: 'docx',
          approvalDate: lastApprovalDate,
          dateRange: weeks.length === 1 ? lastDateRange : `${scopeMeta.label} (${lastDateRange})`,
          imageMaxHeightPt,
          lessonPlanColWidths,
          scheduleColWidths,
          layoutBlueprint: layoutBlueprint ?? null,
        });

        setProgressPercent(100);
        setProgressLabel('Hoàn tất! Đang tải xuống...');
        triggerDownload(pkg.docxBlob, filename);
        showToast(`✅ Đã tải Giáo án GDTC Khối ${g} · ${scopeMeta.label} (${allPlans.length} tiết)!`);
        onClose();
        return;
      }

      const masterZip = new JSZip();
      const totalSteps = gradesToExport.length * weeks.length + (includeIntegrationSummary ? gradesToExport.length : 0);
      let completedSteps = 0;

      for (const g of gradesToExport) {
        const gradeFolderName = `Khoi_${g}_${scopeMeta.shortLabel}`;
        const gradeFolder = masterZip.folder(gradeFolderName) || masterZip;
        const collectedPlansForGrade: MasterPlanItem[] = [];

        for (const w of weeks) {
          if (cancelRef.current) {
            setIsExporting(false);
            setProgressLabel('Đã hủy đóng gói.');
            return;
          }

          setProgressLabel(`Đang xuất Khối ${g} · Tuần ${w}...`);
          await new Promise((r) => setTimeout(r, 0));

          const resolved = resolveWeekPlansForGrade(w, g);
          collectedPlansForGrade.push(...resolved.plans);

          const pStart = resolved.plans[0]?.lessonNum ?? (w * 2 - 1);
          const pEnd = resolved.plans[resolved.plans.length - 1]?.lessonNum ?? (w * 2);
          const weekDocName = `Tuan_${pad2(w)}_Khoi_${g}_Tiet_${pad2(pStart)}-${pad2(pEnd)}.docx`;

          const pkg = await buildWordExportPackage({
            plans: resolved.plans,
            scheduleRows: resolved.scheduleRows.filter((r) => r.grade === g),
            settings: schoolSettings,
            week: w,
            includeSchedule: false,
            weeklyThemes: resolved.themes || undefined,
            filename: weekDocName,
            format: 'docx',
            approvalDate: resolved.approvalDate,
            dateRange: resolved.dateRange,
            imageMaxHeightPt,
            lessonPlanColWidths,
            scheduleColWidths,
            layoutBlueprint: layoutBlueprint ?? null,
          });

          gradeFolder.file(weekDocName, pkg.docxBlob);
          completedSteps++;
          setProgressPercent(Math.min(92, Math.round((completedSteps / Math.max(1, totalSteps)) * 90)));
        }

        if (includeIntegrationSummary) {
          setProgressLabel(`Đang tạo Bảng Tổng Hợp Tích Hợp Khối ${g}...`);
          await new Promise((r) => setTimeout(r, 0));
          const summaryBlob = await buildIntegratedSummaryDocxBlob(
            g,
            scope,
            selectedSingleWeek,
            collectedPlansForGrade,
            schoolSettings
          );
          gradeFolder.file(
            `00_Bang_Tong_Hop_Giao_An_Tich_Hop_Khoi_${g}_${scopeMeta.shortLabel}.docx`,
            summaryBlob
          );
          completedSteps++;
          setProgressPercent(Math.min(94, Math.round((completedSteps / Math.max(1, totalSteps)) * 90)));
        }
      }

      setProgressLabel('Đang nén file .ZIP...');
      setProgressPercent(96);
      const zipBlob = await masterZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 5 },
      });

      const gradeTag = targetGrade === 'all' ? 'Ca_5_Khoi_1-5' : `Khoi_${targetGrade}`;
      const zipFilename = `PE_SmartPlan_Giao_An_GDTC_${gradeTag}_${scopeMeta.shortLabel}_${yearSlug}.zip`;
      setProgressPercent(100);
      triggerDownload(zipBlob, zipFilename);
      showToast(`🎉 Đã tải trọn bộ Giáo án GDTC ${gradeLabel} · ${scopeMeta.label}!`);
      onClose();
    } catch (err: any) {
      console.error('Semester bundle export error:', err);
      setErrorMsg(err?.message || 'Có lỗi khi đóng gói giáo án.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => !isExporting && onClose()}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-teal-800 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <FolderArchive className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold leading-tight truncate">
                Mở Khóa &amp; Tải Giáo Án GDTC
              </h3>
              <p className="text-[11px] text-sky-100 truncate">
                20k/tuần · 360k/học kỳ · 700k/cả năm · Đã kích hoạt tải miễn phí 100%
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500 disabled:opacity-40 text-white transition shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* 1 Compact Status Bar */}
          <div
            className={`rounded-xl px-3.5 py-2.5 border text-xs flex flex-wrap items-center justify-between gap-2 ${
              canDownloadCurrentSelection
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {canDownloadCurrentSelection ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-semibold leading-snug">
                {isAdmin ? (
                  <>Quản trị viên · Đã mở khóa tải toàn bộ các gói</>
                ) : isPaidActive ? (
                  canDownloadCurrentSelection ? (
                    <>
                      <strong>Đã kích hoạt {user?.paidPlanLabel || `Gói ${getShortPaidPlanBadge(user?.paidPlanId)}`}</strong> (còn {user?.daysRemaining ?? 0} ngày · Đã mở khóa tải 0 đ)
                    </>
                  ) : (
                    <>
                      Đang dùng <strong>{user?.paidPlanLabel || `Gói ${getShortPaidPlanBadge(user?.paidPlanId)}`}</strong> (còn {user?.daysRemaining ?? 0} ngày) · Gói <strong>{scopeMeta.label}</strong> cần nâng cấp mã
                    </>
                  )
                ) : (
                  <>
                    <strong>Tài khoản Miễn phí</strong> ({user?.email || 'Chưa đăng nhập'}) · <strong>Đang khóa tải về</strong> — Thanh toán &amp; nhập mã kích hoạt theo gói
                  </>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentPanel((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>{showPaymentPanel ? 'Ẩn QR & Nhập mã' : 'Mở QR & Nhập mã'}</span>
            </button>
          </div>

          {/* Live Activation / Pending Request Notice */}
          {unlockNotice && (
            <div
              className={`rounded-xl px-3.5 py-2.5 border text-xs font-bold flex items-center gap-2 ${
                unlockNotice.type === 'success'
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {unlockNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{unlockNotice.text}</span>
            </div>
          )}

          {submittedRequest && !canDownloadCurrentSelection && (
            <div className="rounded-xl px-3.5 py-2.5 border bg-blue-50 border-blue-200 text-blue-950 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {submittedRequest.status === 'approved' ? (
                    <>
                      <strong>Quản trị viên đã duyệt #{submittedRequest.id}!</strong> Mã của bạn:{' '}
                      <code className="font-mono font-bold text-indigo-800">{submittedRequest.licenseCode}</code> — Bấm kích hoạt để mở khóa tải ngay.
                    </>
                  ) : (
                    <>
                      Đã gửi ảnh CK <strong>#{submittedRequest.id}</strong> ({formatVnd(submittedRequest.amountVnd)}) — Chờ quản trị viên gửi mã &amp; link kích hoạt về <strong>{submittedRequest.email}</strong>.
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                {submittedRequest.status === 'approved' && submittedRequest.licenseCode && (
                  <button
                    type="button"
                    disabled={isRedeemingKey}
                    onClick={() => {
                      setLicenseCodeInput(submittedRequest.licenseCode || '');
                      redeemCodeNow(submittedRequest.licenseCode || '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1"
                  >
                    {isRedeemingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                    <span>Kích Hoạt Mã Ngay</span>
                  </button>
                )}
                {submittedRequest.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={isSendingGmailNotice}
                      onClick={handleSendExistingRequestViaGmail}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      {isSendingGmailNotice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Gửi báo vào Gmail</span>
                    </button>
                    <a
                      href={buildPaymentGmailWebHref(submittedRequest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Mở Gmail</span>
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    refreshUser();
                    getMyPaymentRequests().then((r) => {
                      if (r.success && r.requests?.[0]) setSubmittedRequest(r.requests[0]);
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-800 font-bold text-[11px] hover:bg-blue-100 shrink-0"
                >
                  Kiểm tra lại
                </button>
              </div>
            </div>
          )}

          {/* 1. Select Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Chọn Khối lớp:</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {([1, 2, 3, 4, 5] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setTargetGrade(g)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                    targetGrade === g
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setTargetGrade('all')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                  targetGrade === 'all'
                    ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                    : 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Cả 5 Khối
              </button>
            </div>
          </div>

          {/* 2. Select Package & Pricing */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Chọn gói tải về:</span>
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: 'week_1' as SemesterExportScope, title: '1 Tuần Lẻ', sub: `Tuần ${selectedSingleWeek} · 2 tiết`, price: '20.000 đ', strike: '20k', tag: '/ tuần', accent: 'sky' },
                { id: 'hk1' as SemesterExportScope, title: 'Học Kỳ I', sub: 'Tuần 1–18 · 36 tiết', price: '360.000 đ', strike: '360k', tag: 'HK I', accent: 'emerald' },
                { id: 'hk2' as SemesterExportScope, title: 'Học Kỳ II', sub: 'Tuần 19–35 · 34 tiết', price: '360.000 đ', strike: '360k', tag: 'HK II', accent: 'emerald' },
                { id: 'full_year' as SemesterExportScope, title: 'Cả Năm Học', sub: 'Tuần 1–35 · 70 tiết', price: '700.000 đ', strike: '700k', tag: 'Tiết kiệm', accent: 'indigo' },
              ].map((opt) => {
                const active = scope === opt.id;
                const cardUnlocked = isScopeUnlocked(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setScope(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                      active
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        {opt.id === 'full_year' && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                        <span>{opt.title}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 tabular-nums">{opt.sub}</div>
                    </div>
                    <div className="pt-1 border-t border-slate-100 flex items-baseline justify-between gap-1">
                      {cardUnlocked ? (
                        <>
                          <span className="text-xs font-black text-emerald-700">0 đ · ĐÃ MỞ</span>
                          <span className="text-[10px] text-slate-400 line-through">{opt.strike}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm font-black text-blue-700 tabular-nums">{opt.price}</span>
                          <span className="text-[10px] font-bold text-amber-700 inline-flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{isPaidActive ? 'Nâng cấp' : opt.tag}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {scope === 'week_1' && (
              <div className="flex items-center gap-2 pt-0.5 text-xs">
                <span className="font-semibold text-slate-700">Tuần:</span>
                <select
                  value={selectedSingleWeek}
                  disabled={isExporting}
                  onChange={(e) => setSelectedSingleWeek(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-blue-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Tuần {w} ({w <= 18 ? 'HK I' : 'HK II'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Packaging Mode (only shown when unlocked for current multi-week scope) */}
          {scope !== 'week_1' && canDownloadCurrentSelection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setPackageMode('zip_by_week')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                  packageMode === 'zip_by_week'
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <FolderArchive className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-xs font-bold text-slate-900">Gói .ZIP tách từng tuần (.DOCX)</div>
              </button>
              <button
                type="button"
                disabled={isExporting || targetGrade === 'all'}
                onClick={() => setPackageMode('single_docx')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 disabled:opacity-50 ${
                  packageMode === 'single_docx'
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-xs font-bold text-slate-900">1 File Word (.DOCX) gộp liền</div>
              </button>
            </div>
          )}

          {scope !== 'week_1' && canDownloadCurrentSelection && packageMode === 'zip_by_week' && (
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer text-xs font-semibold text-emerald-950">
              <input
                type="checkbox"
                checked={includeIntegrationSummary}
                disabled={isExporting}
                onChange={(e) => setIncludeIntegrationSummary(e.target.checked)}
                className="rounded border-emerald-400 text-emerald-600"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Kèm Bảng Kế Hoạch Dạy Học &amp; Giáo Án Tích Hợp (.DOCX)</span>
            </label>
          )}

          {/* 4. COMPACT VIETQR + UPLOAD RECEIPT IMAGE + ENTER CODE PANEL */}
          {showPaymentPanel && (
            <div
              ref={paymentSectionRef}
              className="rounded-2xl border-2 border-blue-200 bg-slate-50/80 p-3.5 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                {/* Left: Bank Info + Upload Proof + Key Input */}
                <div className="md:col-span-7 space-y-3">
                  {/* Compact Bank Box */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-800">
                        <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Vietcombank (VCB) · Lê Quốc Hưng</span>
                      </span>
                      <span className="font-black text-blue-700 tabular-nums">{formatVnd(finalPriceVnd)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">STK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-black text-slate-900 select-all">
                          {DONATION_BANK_INFO.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(DONATION_BANK_INFO.accountNumber, 'stk', 'số tài khoản VCB')
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px]"
                        >
                          {copiedField === 'stk' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">Nội dung:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded select-all">
                          {transferNote}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(transferNote, 'note', 'nội dung CK')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px]"
                        >
                          {copiedField === 'note' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Chép</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Receipt Image Upload & Send to Admin Email */}
                  <div className="rounded-xl bg-white border border-emerald-200 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tải ảnh chuyển khoản &amp; gửi về {ADMIN_OWNER_EMAIL}</span>
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSelectProofFile}
                      className="hidden"
                    />

                    {!proofPreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Chọn ảnh chụp màn hình chuyển khoản thành công</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <img
                          src={proofPreviewUrl}
                          alt="Ảnh chuyển khoản"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">{proofFileName || 'Ảnh chuyển khoản'}</div>
                          <div className="text-[10.5px] text-emerald-700 font-semibold">Đã sẵn sàng gửi duyệt</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProofPreviewUrl(null);
                            setProofFileName('');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isUploadingProof || !proofPreviewUrl}
                        onClick={handleUploadAndSendProof}
                        className="flex-1 min-w-[180px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        {isUploadingProof ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingProof ? 'Đang tải & gửi...' : 'Gửi Ảnh Chuyển Khoản Nhận Mã'}</span>
                      </button>

                      <a
                        href={buildPaymentGmailWebHref(submittedRequest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        title={`Mở Gmail soạn sẵn thư gửi tới ${ADMIN_OWNER_EMAIL}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Mở Gmail</span>
                      </a>
                    </div>

                    {proofNotice && (
                      <div
                        className={`text-[11px] font-semibold px-2.5 py-2 rounded-lg border space-y-1.5 ${
                          proofNotice.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        <div>{proofNotice.text}</div>
                        {proofNotice.needsManualGmail && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <a
                              href={buildPaymentGmailWebHref(submittedRequest)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Mở Gmail Gửi Ngay</span>
                            </a>
                            {submittedRequest && (
                              <button
                                type="button"
                                disabled={isSendingGmailNotice}
                                onClick={handleSendExistingRequestViaGmail}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1"
                              >
                                {isSendingGmailNotice ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Gửi tự động qua Gmail</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enter Activation Code */}
                  <form onSubmit={handleRedeemUnlockKey} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Nhập Mã Kích Hoạt (nhận qua email sau khi duyệt):</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseCodeInput}
                        onChange={(e) => setLicenseCodeInput(e.target.value.toUpperCase())}
                        placeholder={`GDTC-${scopeMeta.planCodeHint}-XXXX-XXXX`}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-base sm:text-xs font-bold tracking-wider uppercase focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isRedeemingKey}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5"
                      >
                        {isRedeemingKey ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                        <span>Kích Hoạt</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Live VietQR Card */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white rounded-xl border border-emerald-200 p-3 shadow-2xs">
                  {!qrFailed ? (
                    <img
                      src={vietQrUrl}
                      alt={`Mã VietQR Vietcombank ${DONATION_BANK_INFO.accountNumber} - ${formatVnd(finalPriceVnd)}`}
                      onError={() => setQrFailed(true)}
                      className="w-full max-w-[210px] h-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-6 px-3 text-center space-y-1.5 text-xs text-slate-600">
                      <QrCode className="w-9 h-9 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800">Chuyển khoản VCB {DONATION_BANK_INFO.accountNumber}</p>
                      <p className="text-[11px]">Lê Quốc Hưng · {formatVnd(finalPriceVnd)}</p>
                    </div>
                  )}
                  <div className="mt-1.5 text-center text-[10.5px] text-slate-600">
                    Quét QR tự điền <strong className="text-blue-700">{formatVnd(finalPriceVnd)}</strong> · Liên hệ{' '}
                    <span className="font-semibold text-slate-800">{ADMIN_OWNER_EMAIL}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar when exporting */}
          {isExporting && (
            <div className="rounded-xl bg-slate-900 text-white p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 font-semibold text-sky-200">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                  <span>{progressLabel || 'Đang đóng gói giáo án...'}</span>
                </span>
                <span className="font-mono font-bold tabular-nums text-emerald-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            {canDownloadCurrentSelection ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="tabular-nums">
              <strong>{totalLessonsCount} tiết</strong> ({gradesToExport.length} khối · {weeks.length} tuần) ·{' '}
              {canDownloadCurrentSelection ? (
                <strong className="text-emerald-700">Đã kích hoạt (0 đ)</strong>
              ) : (
                <strong className="text-amber-700">Khóa · {formatVnd(finalPriceVnd)}</strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isExporting ? (
              <button
                type="button"
                onClick={() => {
                  cancelRef.current = true;
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Hủy đóng gói
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
                >
                  Đóng
                </button>

                {!canDownloadCurrentSelection ? (
                  <button
                    type="button"
                    onClick={scrollToPaymentPanel}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-200" />
                    <span>Thanh Toán &amp; Gửi Ảnh ({formatVnd(finalPriceVnd)})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartExport}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {scope === 'week_1'
                        ? 'Tải Tuần Này (.DOCX)'
                        : packageMode === 'single_docx' && targetGrade !== 'all'
                        ? 'Tải File Word (.DOCX)'
                        : 'Tải Gói Trọn Bộ (.ZIP)'}
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
