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
  CreditCard,
  Copy,
  Check,
  Mail,
  KeyRound,
  Lock,
  Unlock,
  Landmark,
  Clock
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
import { useAuth } from '../contexts/AuthContext';
import {
  ADMIN_OWNER_EMAIL,
  DONATION_BANK_INFO,
  DOWNLOAD_PRICING,
  TRIAL_DURATION_DAYS,
  buildDonationVietQrUrl,
  formatVnd
} from '../utils/subscriptionPlans';

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
      label: `1 Tuần lẻ (Tuần ${activeWeek})`,
      shortLabel: `Tuan_${pad2(activeWeek)}`,
      periodCount: 2,
      weekCount: 1,
      unitPriceVnd: DOWNLOAD_PRICING.weekVnd,
      priceShort: '20k',
      planCodeHint: 'W1',
    };
  }
  if (scope === 'hk1') {
    return {
      label: 'Học kỳ I (Tuần 1 – Tuần 18)',
      shortLabel: 'Hoc_Ky_1',
      periodCount: 36,
      weekCount: 18,
      unitPriceVnd: DOWNLOAD_PRICING.semesterVnd,
      priceShort: '360k',
      planCodeHint: 'S1',
    };
  }
  if (scope === 'hk2') {
    return {
      label: 'Học kỳ II (Tuần 19 – Tuần 35)',
      shortLabel: 'Hoc_Ky_2',
      periodCount: 34,
      weekCount: 17,
      unitPriceVnd: DOWNLOAD_PRICING.semesterVnd,
      priceShort: '360k',
      planCodeHint: 'S1',
    };
  }
  return {
    label: 'Cả Năm Học — Giáo Án Tích Hợp (Tuần 1 – Tuần 35)',
    shortLabel: 'Ca_Nam_Hoc_Tich_Hop',
    periodCount: 70,
    weekCount: 35,
    unitPriceVnd: DOWNLOAD_PRICING.fullYearVnd,
    priceShort: '700k',
    planCodeHint: 'Y1',
  };
}

/**
 * Builds an official Word (.docx) summary table of Integrated Yearly/Semester Teaching Plans
 * (Kế hoạch dạy học & Địa chỉ tích hợp năm học: KNS, BVMT, QCN, ATGT, QPAN, Năng lực số)
 */
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
  const { user, redeemLicenseKey } = useAuth();
  const [targetGrade, setTargetGrade] = useState<BundleGradeTarget>(initialGrade);
  const [scope, setScope] = useState<SemesterExportScope>(initialScope);
  const [selectedSingleWeek, setSelectedSingleWeek] = useState<number>(currentWeek || 1);
  const [packageMode, setPackageMode] = useState<BundlePackageMode>('zip_by_week');
  const [includeIntegrationSummary, setIncludeIntegrationSummary] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment & Unlock state
  const [showPaymentPanel, setShowPaymentPanel] = useState<boolean>(true);
  const [qrFailed, setQrFailed] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [licenseCodeInput, setLicenseCodeInput] = useState<string>('');
  const [isRedeemingKey, setIsRedeemingKey] = useState<boolean>(false);
  const [unlockNotice, setUnlockNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cancelRef = useRef<boolean>(false);
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.planTier === 'admin_lifetime';
  const isPaidActive = user?.planTier === 'paid' && user?.hasFullAccess !== false;
  const isFreeTrialActive = user?.planTier === 'trial' && user?.hasFullAccess !== false;
  const isFullLicenseUnlocked = isAdmin || isPaidActive;
  const isFreeWeeklyAllowed = isFreeTrialActive && scope === 'week_1';
  const canDownloadCurrentSelection = isFullLicenseUnlocked || isFreeWeeklyAllowed;

  useEffect(() => {
    if (isOpen) {
      setTargetGrade(initialGrade);
      setScope(initialScope);
      setSelectedSingleWeek(currentWeek || 1);
      setErrorMsg(null);
      setUnlockNotice(null);
      setProgressPercent(0);
      setProgressLabel('');
      setQrFailed(false);
      setShowPaymentPanel(true);
      cancelRef.current = false;
    }
  }, [isOpen, initialGrade, initialScope, currentWeek]);

  // When selecting all 5 grades, force ZIP packaging so Word never overflows memory
  useEffect(() => {
    if (targetGrade === 'all' && packageMode === 'single_docx') {
      setPackageMode('zip_by_week');
    }
  }, [targetGrade, packageMode]);

  // Reset QR image fallback when price/note changes
  useEffect(() => {
    setQrFailed(false);
  }, [scope, targetGrade, selectedSingleWeek]);

  if (!isOpen) return null;

  const weeks = getWeeksForScope(scope, selectedSingleWeek);
  const scopeMeta = getScopeMeta(scope, selectedSingleWeek);
  const gradesToExport: GradeLevel[] = targetGrade === 'all' ? [1, 2, 3, 4, 5] : [targetGrade];
  const totalLessonsCount = gradesToExport.length * scopeMeta.periodCount;

  // Pricing calculation: 20k / week, 360k / semester, 700k / full year
  const finalPriceVnd = scopeMeta.unitPriceVnd;
  const userTag = (user?.email?.split('@')[0] || user?.fullName || 'GV')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 18);
  const gradeCode = targetGrade === 'all' ? 'K1-5' : `K${targetGrade}`;
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

  const buildPaymentMailtoHref = () => {
    const subject = `[PE SmartPlan] Xác nhận thanh toán mở khóa tải về (${formatVnd(finalPriceVnd)}) - ${user?.email || 'Giáo viên'}`;
    const body = [
      'Kính gửi Thầy Lê Quốc Hưng,',
      '',
      'Tôi đã thực hiện chuyển khoản mở khóa tải giáo án & đăng ký sử dụng phần mềm PE SmartPlan 2.0:',
      `- Gói đã chọn: ${scopeMeta.label} (${targetGrade === 'all' ? 'Cả 5 Khối 1–5' : `Khối ${targetGrade}`})`,
      `- Số tiền chuyển khoản: ${formatVnd(finalPriceVnd)}`,
      `- Tài khoản nhận: ${DONATION_BANK_INFO.accountNumber} - ${DONATION_BANK_INFO.bankName} (${DONATION_BANK_INFO.accountHolder})`,
      `- Nội dung chuyển khoản: ${transferNote}`,
      `- Email tài khoản đăng nhập PE SmartPlan: ${user?.email || '(chưa đăng nhập)'}`,
      `- Họ và tên / Trường: ${user?.fullName || schoolSettings.teacherName || ''} - ${user?.schoolName || schoolSettings.schoolName || ''}`,
      '',
      'Nhờ Thầy kiểm tra và gửi giúp Mã Kích Hoạt mở khóa tải về (sau gói dùng thử 120 ngày). Xin cảm ơn Thầy!'
    ].join('\n');
    return `mailto:${ADMIN_OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleRedeemUnlockKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = licenseCodeInput.trim().toUpperCase();
    if (!cleaned) {
      setUnlockNotice({ type: 'error', text: 'Vui lòng nhập mã kích hoạt nhận từ Thầy Lê Quốc Hưng.' });
      return;
    }
    setIsRedeemingKey(true);
    setUnlockNotice(null);
    try {
      const res = await redeemLicenseKey(cleaned);
      if (res.success) {
        setLicenseCodeInput('');
        setUnlockNotice({
          type: 'success',
          text: res.planLabel
            ? `Đã kích hoạt thành công ${res.planLabel}! Thầy cô có thể bấm tải xuống ngay bây giờ.`
            : 'Đã mở khóa tải về thành công! Thầy cô có thể bấm tải xuống ngay bây giờ.',
        });
        showToast('🎉 Đã kích hoạt mã mở khóa thành công! Sẵn sàng tải trọn bộ giáo án.');
      } else {
        setUnlockNotice({
          type: 'error',
          text: res.error || 'Mã kích hoạt chưa hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ lehung840110@gmail.com.',
        });
      }
    } catch (err: any) {
      setUnlockNotice({
        type: 'error',
        text: err?.message || 'Không thể kiểm tra mã kích hoạt lúc này.',
      });
    } finally {
      setIsRedeemingKey(false);
    }
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
      showToast(
        `🔒 Gói miễn phí chỉ tải miễn phí từng tuần. Để tải trọn bộ ${scopeMeta.label}, vui lòng mở khóa (${formatVnd(finalPriceVnd)}) hoặc đăng ký sử dụng phần mềm (tải miễn phí toàn bộ)!`
      );
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

        setProgressLabel(`Đang kết xuất file Word (.DOCX) Khối ${g} (${allPlans.length} tiết)...`);
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
        setProgressLabel('Hoàn tất! Đang tải xuống máy tính...');
        triggerDownload(pkg.docxBlob, filename);
        showToast(`✅ Đã tải Giáo án GDTC Khối ${g} · ${scopeMeta.label} (${allPlans.length} tiết)!`);
        onClose();
        return;
      }

      // ZIP mode (separate clean .DOCX per week + Integrated Yearly Summary Table)
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

          setProgressLabel(`Đang xuất Khối ${g} · Tuần ${w} (${w <= 18 ? 'HK I' : 'HK II'})...`);
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
          setProgressLabel(`Đang tạo Bảng Tổng Hợp Giáo Án Tích Hợp Khối ${g}...`);
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

      setProgressLabel('Đang nén gói tệp .ZIP chuẩn Windows / Mac...');
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
      showToast(
        `🎉 Đã tải trọn bộ Giáo án GDTC ${targetGrade === 'all' ? 'cả 5 Khối (1–5)' : `Khối ${targetGrade}`} · ${scopeMeta.label} (${totalLessonsCount} tiết)!`
      );
      onClose();
    } catch (err: any) {
      console.error('Semester bundle export error:', err);
      setErrorMsg(err?.message || 'Có lỗi khi đóng gói trọn bộ giáo án. Thầy thử chọn chế độ gói .ZIP theo từng tuần nhé.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[85] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4"
      onClick={() => !isExporting && onClose()}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight">
                Mở Khóa &amp; Tải Trọn Bộ Giáo Án Theo Khối, Học Kỳ &amp; Năm Học
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Bộ sách GDTC Kết nối tri thức · Giá tải về: 20k/tuần · 360k/học kỳ · 700k/cả năm · Đăng ký sau gói dùng thử {TRIAL_DURATION_DAYS} ngày
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Account & Clear Free vs Registered Software Policy Box */}
          <div className="space-y-2.5">
            <div
              className={`rounded-xl px-3.5 py-2.5 border text-xs flex flex-wrap items-center justify-between gap-2 ${
                isFullLicenseUnlocked
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isFreeTrialActive
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isFullLicenseUnlocked ? (
                  <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                <span className="leading-snug">
                  {isAdmin ? (
                    <>
                      <strong>Quản trị viên (Thầy Lê Quốc Hưng):</strong> Toàn bộ phần tải về đều <strong>MIỄN PHÍ</strong> · Khung QR bên dưới hiển thị đúng giao diện thanh toán dành cho giáo viên.
                    </>
                  ) : isPaidActive ? (
                    <>
                      <strong>Đã đăng ký sử dụng phần mềm</strong> (còn <strong>{user?.daysRemaining ?? 0} ngày</strong>): Toàn bộ phần tải về (từng tuần, trọn bộ Học kỳ &amp; Cả năm học) đều <strong>MIỄN PHÍ 100%</strong>!
                    </>
                  ) : isFreeTrialActive ? (
                    <>
                      <strong>Đang dùng Phiên bản Miễn phí (Dùng thử {TRIAL_DURATION_DAYS} ngày · còn {user?.daysRemaining ?? TRIAL_DURATION_DAYS} ngày):</strong> Thầy cô được <strong>tải MIỄN PHÍ giáo án từng tuần</strong>. Tải trọn bộ Học kỳ / Cả năm cần mở khóa theo gói hoặc đăng ký sử dụng phần mềm.
                    </>
                  ) : (
                    <>
                      <strong>Đăng ký sử dụng phần mềm sau gói dùng thử {TRIAL_DURATION_DAYS} ngày:</strong> Đăng ký phần mềm để <strong>tải miễn phí toàn bộ</strong>, hoặc mở khóa tải lẻ theo bảng giá 20k/tuần · 360k/học kỳ · 700k/cả năm.
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
                <span>{showPaymentPanel ? 'Thu gọn QR' : 'Hiện Mã QR Thanh Toán'}</span>
              </button>
            </div>

            {/* 2-Column Clear Policy Distinction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11.5px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Phiên bản Miễn phí (Dùng thử {TRIAL_DURATION_DAYS} ngày)</span>
                </div>
                <ul className="space-y-0.5 text-slate-600 pl-3.5 list-disc">
                  <li>
                    <strong className="text-emerald-700">Tải giáo án từng tuần của bạn: MIỄN PHÍ (0 đ)</strong> — không tính phí.
                  </li>
                  <li>
                    Tải gộp <strong>Toàn bộ Học kỳ (360k)</strong> / <strong>Cả năm (700k)</strong>: cần mở khóa theo gói.
                  </li>
                  <li>
                    Hết 120 ngày dùng thử: tải lẻ <strong>20k/tuần</strong> hoặc đăng ký sử dụng phần mềm.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1">
                <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Đã Đăng Ký Sử Dụng Phần Mềm</span>
                </div>
                <ul className="space-y-0.5 text-emerald-900 pl-3.5 list-disc">
                  <li>
                    <strong className="text-emerald-700">Tải về MIỄN PHÍ 100% toàn bộ</strong> (từng tuần, trọn bộ Học kỳ I, Học kỳ II &amp; Cả năm học).
                  </li>
                  <li>
                    Không thu thêm bất kỳ phí tải file Word/ZIP nào trong suốt thời hạn đăng ký.
                  </li>
                  <li>
                    Liên hệ kích hoạt: <strong>Thầy Lê Quốc Hưng</strong> (<code>{ADMIN_OWNER_EMAIL}</code>).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 1. Select Grade */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. Chọn Khối lớp cần tải giáo án:</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {([1, 2, 3, 4, 5] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setTargetGrade(g)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                    targetGrade === g
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
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

          {/* 2. Select Pricing & Scope Tier (20k / 360k / 700k) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-emerald-600" />
              <span>2. Chọn gói mở khóa tải về &amp; phạm vi giáo án:</span>
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setScope('week_1')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  scope === 'week_1'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200'
                    : 'bg-white border-slate-200 hover:border-sky-300'
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">1 Tuần Lẻ</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">
                    Tuần {selectedSingleWeek} · 2 tiết
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between gap-1">
                  {isFullLicenseUnlocked || isFreeTrialActive ? (
                    <>
                      <span className="text-sm font-black text-emerald-700">MIỄN PHÍ</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through tabular-nums">20k</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-blue-700 tabular-nums">20.000 đ</span>
                      <span className="text-[10px] font-bold text-slate-500">/ tuần</span>
                    </>
                  )}
                </div>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => setScope('hk1')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  scope === 'hk1'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Toàn Bộ Học Kỳ I</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">Tuần 1–18 · 36 tiết</div>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between gap-1">
                  {isFullLicenseUnlocked ? (
                    <>
                      <span className="text-sm font-black text-emerald-700">MIỄN PHÍ</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through tabular-nums">360k</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-emerald-700 tabular-nums">360.000 đ</span>
                      <span className="text-[10px] font-bold text-emerald-600">HK I</span>
                    </>
                  )}
                </div>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => setScope('hk2')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  scope === 'hk2'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Toàn Bộ Học Kỳ II</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">Tuần 19–35 · 34 tiết</div>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between gap-1">
                  {isFullLicenseUnlocked ? (
                    <>
                      <span className="text-sm font-black text-emerald-700">MIỄN PHÍ</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through tabular-nums">360k</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-emerald-700 tabular-nums">360.000 đ</span>
                      <span className="text-[10px] font-bold text-emerald-600">HK II</span>
                    </>
                  )}
                </div>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={() => setScope('full_year')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                  scope === 'full_year'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Trọn Bộ Cả Năm</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">Tuần 1–35 · 70 tiết</div>
                </div>
                <div className="pt-1.5 border-t border-indigo-100 flex items-baseline justify-between gap-1">
                  {isFullLicenseUnlocked ? (
                    <>
                      <span className="text-sm font-black text-emerald-700">MIỄN PHÍ</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through tabular-nums">700k</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-indigo-700 tabular-nums">700.000 đ</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Tiết kiệm
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {scope === 'week_1' && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-slate-700">Chọn tuần cần tải:</span>
                <select
                  value={selectedSingleWeek}
                  disabled={isExporting}
                  onChange={(e) => setSelectedSingleWeek(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-blue-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Tuần {w} ({w <= 18 ? 'Học kỳ I' : 'Học kỳ II'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 3. Packaging Mode */}
          {scope !== 'week_1' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>3. Chọn kiểu file tải về:</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setPackageMode('zip_by_week')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    packageMode === 'zip_by_week'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <FolderArchive className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Gói .ZIP tách từng tuần (.DOCX) <span className="text-emerald-700">· Khuyên dùng</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Mỗi tuần 1 file Word sắc nét, dễ mở in ấn, kèm Bảng tổng hợp giáo án tích hợp.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isExporting || targetGrade === 'all'}
                  onClick={() => setPackageMode('single_docx')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    packageMode === 'single_docx'
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">1 File Word (.DOCX) gộp liền mạch</div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {targetGrade === 'all'
                        ? 'Chỉ áp dụng khi chọn từng Khối lẻ (Khối 1–5) để mở mượt trên MS Word.'
                        : 'Gộp toàn bộ các tuần của khối đã chọn thành 1 quyển giáo án để in đóng cuốn.'}
                    </p>
                  </div>
                </button>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeIntegrationSummary}
                  disabled={isExporting || packageMode === 'single_docx'}
                  onChange={(e) => setIncludeIntegrationSummary(e.target.checked)}
                  className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đính kèm Bảng Kế Hoạch Dạy Học &amp; Giáo Án Tích Hợp Năm Học (.DOCX)</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* 4. VIETQR PAYMENT & LICENSE UNLOCK PANEL */}
          {showPaymentPanel && (
            <div
              ref={paymentSectionRef}
              className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/60 p-4 space-y-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Thanh Toán Mở Khóa Tải Về &amp; Đăng Ký Phần Mềm Sau {TRIAL_DURATION_DAYS} Ngày Dùng Thử
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Quét mã VietQR tự động điền đúng số tiền &amp; nội dung chuyển khoản — Kích hoạt nhanh qua Thầy Lê Quốc Hưng
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-700 text-white text-xs font-black tabular-nums">
                  {formatVnd(finalPriceVnd)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Left: Bank info & Contact */}
                <div className="md:col-span-7 space-y-2.5">
                  <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2 text-xs shadow-2xs">
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-800">
                        <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ngân hàng: Vietcombank (VCB)</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        VietQR 24/7
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-black tracking-wider text-slate-900 select-all">
                          {DONATION_BANK_INFO.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(DONATION_BANK_INFO.accountNumber, 'stk', 'số tài khoản VCB 0271000960686')
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] transition"
                        >
                          {copiedField === 'stk' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép STK'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-extrabold text-slate-900">Lê Quốc Hưng</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-slate-500">Gói &amp; Số tiền:</span>
                      <span className="font-extrabold text-blue-700 tabular-nums">
                        {scopeMeta.label} · {formatVnd(finalPriceVnd)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded select-all">
                          {transferNote}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(transferNote, 'note', 'nội dung chuyển khoản')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] transition"
                        >
                          {copiedField === 'note' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'note' ? 'Đã chép' : 'Chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between gap-2 flex-wrap">
                      <span>Liên hệ kích hoạt &amp; hỗ trợ:</span>
                      <a
                        href={`mailto:${ADMIN_OWNER_EMAIL}`}
                        className="font-bold text-blue-700 hover:underline"
                      >
                        Thầy Lê Quốc Hưng ({ADMIN_OWNER_EMAIL})
                      </a>
                    </div>
                  </div>

                  {/* Direct Payment Confirmation CTA */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={buildPaymentMailtoHref()}
                      className="flex-1 min-w-[200px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Gửi Xác Nhận Thanh Toán Cho Thầy Hưng</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `VCB ${DONATION_BANK_INFO.accountNumber} - LE QUOC HUNG - ${formatVnd(finalPriceVnd)} - ND: ${transferNote} - Lien he: ${ADMIN_OWNER_EMAIL}`,
                          'all',
                          'thông tin thanh toán'
                        )
                      }
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Chép thông tin</span>
                    </button>
                  </div>

                  {/* License Activation Form */}
                  <form onSubmit={handleRedeemUnlockKey} className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Đã nhận Mã Mở Khóa từ Thầy Lê Quốc Hưng? Nhập để mở khóa ngay:</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseCodeInput}
                        onChange={(e) => setLicenseCodeInput(e.target.value.toUpperCase())}
                        placeholder={`VD: GDTC-${scopeMeta.planCodeHint}-XXXX-XXXX`}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold tracking-wider uppercase focus:border-blue-500 focus:outline-none"
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
                        <span>Mở Khóa</span>
                      </button>
                    </div>
                    {unlockNotice && (
                      <div
                        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border ${
                          unlockNotice.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {unlockNotice.text}
                      </div>
                    )}
                  </form>
                </div>

                {/* Right: Live VietQR Card */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white rounded-xl border border-emerald-200 p-3 shadow-xs">
                  {!qrFailed ? (
                    <img
                      src={vietQrUrl}
                      alt={`Mã VietQR Vietcombank ${DONATION_BANK_INFO.accountNumber} - ${DONATION_BANK_INFO.accountHolder} - ${formatVnd(finalPriceVnd)}`}
                      onError={() => setQrFailed(true)}
                      className="w-full max-w-[230px] h-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-8 px-4 text-center space-y-2 text-xs text-slate-600">
                      <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-800">Không tải được ảnh QR (đang Offline)</p>
                      <p className="text-[11px]">
                        Chuyển khoản thủ công VCB <strong className="font-mono">{DONATION_BANK_INFO.accountNumber}</strong> — Lê Quốc Hưng — <strong>{formatVnd(finalPriceVnd)}</strong>
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <div className="text-[11px] font-extrabold text-emerald-800">
                      Quét QR bằng App Ngân hàng / MoMo / VNPay
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      Số tiền tự điền: <strong className="text-blue-700">{formatVnd(finalPriceVnd)}</strong> · VCB 0271000960686
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar when exporting */}
          {isExporting && (
            <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 font-semibold text-sky-200">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                  <span>{progressLabel || 'Đang chuẩn bị dữ liệu giáo án...'}</span>
                </span>
                <span className="font-mono font-bold tabular-nums text-emerald-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
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
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="tabular-nums">
              Dự kiến xuất: <strong>{totalLessonsCount} tiết</strong> ({gradesToExport.length} khối · {weeks.length} tuần) · Chi phí:{' '}
              {canDownloadCurrentSelection ? (
                <strong className="text-emerald-700">
                  MIỄN PHÍ (0 đ){isFullLicenseUnlocked ? ' — Đã đăng ký phần mềm' : ' — Gói từng tuần miễn phí'}
                </strong>
              ) : (
                <strong className="text-blue-700">{formatVnd(finalPriceVnd)}</strong>
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
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-200" />
                    <span>Thanh Toán &amp; Mở Khóa ({formatVnd(finalPriceVnd)})</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={scrollToPaymentPanel}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>
                        {isFullLicenseUnlocked
                          ? `Xem QR Thanh Toán (${scopeMeta.priceShort})`
                          : 'Đăng Ký Phần Mềm (QR)'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartExport}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {scope === 'week_1'
                          ? 'Tải Tuần Này Miễn Phí (.DOCX)'
                          : packageMode === 'single_docx' && targetGrade !== 'all'
                          ? 'Tải File Word Miễn Phí (.DOCX)'
                          : 'Tải Gói Trọn Bộ Miễn Phí (.ZIP)'}
                      </span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
