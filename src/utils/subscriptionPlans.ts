export type SubscriptionPlanId = 'week_1' | 'month_1' | 'semester_1' | 'year_1';

export type PlanTier = 'admin_lifetime' | 'trial' | 'paid' | 'expired';

export interface SubscriptionPlanOption {
  id: SubscriptionPlanId;
  codePrefix: 'W1' | 'M1' | 'S1' | 'Y1';
  name: string;
  shortLabel: string;
  durationDays: number;
  priceVnd: number;
  priceText: string;
  perMonthText: string;
  tagline: string;
  popular?: boolean;
  bestValue?: boolean;
}

export const TRIAL_DURATION_DAYS = 120;
export const EXPIRY_WARNING_DAYS = 7;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const ADMIN_OWNER_EMAIL = 'lehung840110@gmail.com';

export const DOWNLOAD_PRICING = {
  weekVnd: 20000,
  semesterVnd: 360000,
  fullYearVnd: 700000,
} as const;

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')} đ`;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanOption[] = [
  {
    id: 'week_1',
    codePrefix: 'W1',
    name: 'Gói Tải Lẻ 1 Tuần (7 ngày)',
    shortLabel: '1 Tuần · 20k',
    durationDays: 7,
    priceVnd: 20000,
    priceText: '20.000 đ',
    perMonthText: '20.000 đ / tuần',
    tagline: 'Mở khóa tải giáo án 1 tuần & gia hạn phần mềm sau dùng thử 120 ngày'
  },
  {
    id: 'month_1',
    codePrefix: 'M1',
    name: 'Gói 1 Tháng (30 ngày)',
    shortLabel: '1 Tháng · 80k',
    durationDays: 30,
    priceVnd: 80000,
    priceText: '80.000 đ',
    perMonthText: '80.000 đ / tháng',
    tagline: 'Mở khóa toàn bộ tính năng nâng cao trong 30 ngày'
  },
  {
    id: 'semester_1',
    codePrefix: 'S1',
    name: 'Gói Toàn Bộ 1 Học Kỳ (HK I / HK II)',
    shortLabel: '1 Học kỳ · 360k',
    durationDays: 135,
    priceVnd: 360000,
    priceText: '360.000 đ',
    perMonthText: 'Trọn bộ 1 Học kỳ',
    tagline: 'Mở khóa tải toàn bộ giáo án 1 học kỳ & đăng ký sử dụng sau 120 ngày dùng thử',
    popular: true
  },
  {
    id: 'year_1',
    codePrefix: 'Y1',
    name: 'Gói Cả Năm Học (35 Tuần Tích Hợp)',
    shortLabel: 'Cả năm · 700k',
    durationDays: 365,
    priceVnd: 700000,
    priceText: '700.000 đ',
    perMonthText: 'Tiết kiệm 20.000 đ',
    tagline: 'Mở khóa tải trọn bộ giáo án cả năm học & sử dụng phần mềm trọn 1 năm',
    bestValue: true
  }
];

export const GROUP_DISCOUNT_LABEL = 'Liên hệ Thầy Lê Quốc Hưng (lehung840110@gmail.com) để đăng ký sử dụng phần mềm sau gói dùng thử 120 ngày';

export const DONATION_BANK_INFO = {
  bankCode: 'VCB',
  bankName: 'Vietcombank',
  bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  accountNumber: '0271000960686',
  accountHolder: 'Lê Quốc Hưng',
  accountHolderAscii: 'LE QUOC HUNG',
  defaultTransferNote: 'Ung ho PE SmartPlan - [Tên / Trường]',
  qrFallbackTransferNote: 'Ung ho PE SmartPlan',
  title: 'Chung tay duy trì hệ thống & tiếp sức cho học sinh',
  purpose:
    'PE SmartPlan được chia sẻ miễn phí cho cộng đồng giáo viên Giáo dục Thể chất. Nếu thầy cô thấy công cụ hữu ích và muốn ủng hộ tùy tâm, kinh phí đóng góp sẽ được ưu tiên cho duy trì vận hành hệ thống/AI và mua sắm dụng cụ tập luyện, phần quà khích lệ, hỗ trợ học sinh có hoàn cảnh khó khăn.'
} as const;

export function buildDonationVietQrUrl(amountVnd?: number, transferNote?: string): string {
  const params = new URLSearchParams();
  if (amountVnd && amountVnd > 0) {
    params.set('amount', String(Math.round(amountVnd)));
  }
  const rawNote = transferNote || DONATION_BANK_INFO.defaultTransferNote;
  const qrSafeNote = rawNote.includes('[')
    ? DONATION_BANK_INFO.qrFallbackTransferNote
    : rawNote;
  params.set('addInfo', qrSafeNote);
  params.set('accountName', DONATION_BANK_INFO.accountHolderAscii);
  return `https://img.vietqr.io/image/${DONATION_BANK_INFO.bankCode}-${DONATION_BANK_INFO.accountNumber}-compact2.png?${params.toString()}`;
}

export function getSubscriptionPlanById(id: string): SubscriptionPlanOption {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) || SUBSCRIPTION_PLANS[0];
}

export function getSubscriptionPlanByPrefix(prefix: string): SubscriptionPlanOption | null {
  const upper = String(prefix || '').trim().toUpperCase();
  return SUBSCRIPTION_PLANS.find((p) => p.codePrefix === upper) || null;
}

const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const KEY_SIGNATURE_PEPPER = 'SMARTPLAN_GDTC_PRO_LQH_2026_V1';

export function computeLicenseChecksum(prefix: string, tokenPart: string): string {
  const input = `${prefix.toUpperCase()}-${tokenPart.toUpperCase()}-${KEY_SIGNATURE_PEPPER}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b1;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch + i * 17), 0x85ebca6b);
  }
  const combined = ((h1 >>> 0) ^ (h2 >>> 0)) >>> 0;
  let out = '';
  let val = combined;
  for (let i = 0; i < 4; i++) {
    out += KEY_ALPHABET[val % KEY_ALPHABET.length];
    val = Math.floor(val / KEY_ALPHABET.length) + ((h1 >>> (i * 5)) & 31);
  }
  return out;
}

export function generateSignedLicenseCode(planId: SubscriptionPlanId): string {
  const plan = getSubscriptionPlanById(planId);
  let randPart = '';
  for (let i = 0; i < 4; i++) {
    const idx =
      typeof crypto !== 'undefined' && crypto.getRandomValues
        ? crypto.getRandomValues(new Uint32Array(1))[0] % KEY_ALPHABET.length
        : Math.floor(Math.random() * KEY_ALPHABET.length);
    randPart += KEY_ALPHABET[idx];
  }
  const chk = computeLicenseChecksum(plan.codePrefix, randPart);
  return `GDTC-${plan.codePrefix}-${randPart}-${chk}`;
}

export function verifySignedLicenseCode(rawCode: string): {
  valid: boolean;
  normalizedCode: string;
  plan?: SubscriptionPlanOption;
} {
  const normalized = String(rawCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  const match = /^GDTC-(W1|M1|S1|Y1)-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(normalized);
  if (!match) {
    return { valid: false, normalizedCode: normalized };
  }
  const [, prefix, randPart, chk] = match;
  const expected = computeLicenseChecksum(prefix, randPart);
  if (chk !== expected) {
    return { valid: false, normalizedCode: normalized };
  }
  const plan = getSubscriptionPlanByPrefix(prefix);
  if (!plan) {
    return { valid: false, normalizedCode: normalized };
  }
  return { valid: true, normalizedCode: normalized, plan };
}

export interface ComputedSubscriptionState {
  trialStartedAt: number;
  trialEndsAt: number;
  paidUntil?: number;
  paidPlanId?: SubscriptionPlanId;
  paidPlanLabel?: string;
  planTier: PlanTier;
  activeUntil: number | null;
  daysRemaining: number;
  hasFullAccess: boolean;
}

export const PLAN_TIER_RANK: Record<SubscriptionPlanId, number> = {
  week_1: 1,
  month_1: 2,
  semester_1: 3,
  year_1: 4
};

export function inferPlanIdFromDays(days: number): SubscriptionPlanId {
  if (days >= 300) return 'year_1';
  if (days >= 100) return 'semester_1';
  if (days >= 25) return 'month_1';
  return 'week_1';
}

export function getShortPaidPlanBadge(planId?: SubscriptionPlanId): string {
  switch (planId) {
    case 'year_1':
      return 'Cả Năm';
    case 'semester_1':
      return 'Học Kỳ';
    case 'month_1':
      return '1 Tháng';
    case 'week_1':
    default:
      return '1 Tuần';
  }
}

export function canDownloadWeeklyPlan(
  user: { planTier?: PlanTier; hasFullAccess?: boolean } | null | undefined
): boolean {
  if (!user) return false;
  if (user.planTier === 'admin_lifetime') return true;
  return user.planTier === 'paid' && user.hasFullAccess !== false;
}

export function canDownloadScopeByPlan(
  user: { planTier?: PlanTier; hasFullAccess?: boolean; paidPlanId?: SubscriptionPlanId } | null | undefined,
  scope: 'week_1' | 'hk1' | 'hk2' | 'full_year'
): boolean {
  if (!user) return false;
  if (user.planTier === 'admin_lifetime') return true;
  if (user.planTier !== 'paid' || user.hasFullAccess === false) return false;
  const activeRank = PLAN_TIER_RANK[user.paidPlanId || 'week_1'] || 1;
  if (scope === 'week_1') return activeRank >= 1;
  if (scope === 'hk1' || scope === 'hk2') return activeRank >= 3; // semester_1 or year_1
  if (scope === 'full_year') return activeRank >= 4; // year_1
  return false;
}

export function computeSubscriptionState(input: {
  email: string;
  createdAt: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  paidUntil?: number;
  paidPlanId?: SubscriptionPlanId;
  paidPlanLabel?: string;
}): ComputedSubscriptionState {
  const now = Date.now();
  const created = Number(input.createdAt) || now;
  const trialStartedAt = Number(input.trialStartedAt) || created;
  const trialEndsAt = Number(input.trialEndsAt) || trialStartedAt + TRIAL_DURATION_DAYS * DAY_MS;
  const paidUntil = input.paidUntil ? Number(input.paidUntil) : undefined;

  if (String(input.email || '').trim().toLowerCase() === ADMIN_OWNER_EMAIL) {
    return {
      trialStartedAt,
      trialEndsAt,
      paidUntil,
      paidPlanId: 'year_1',
      paidPlanLabel: 'Quản trị viên · Toàn quyền',
      planTier: 'admin_lifetime',
      activeUntil: null,
      daysRemaining: 9999,
      hasFullAccess: true
    };
  }

  if (paidUntil && paidUntil > now) {
    const remainingDays = Math.max(1, Math.ceil((paidUntil - now) / DAY_MS));
    const resolvedPlanId = input.paidPlanId || inferPlanIdFromDays(remainingDays);
    const resolvedPlanLabel = input.paidPlanLabel || getSubscriptionPlanById(resolvedPlanId).name;
    return {
      trialStartedAt,
      trialEndsAt,
      paidUntil,
      paidPlanId: resolvedPlanId,
      paidPlanLabel: resolvedPlanLabel,
      planTier: 'paid',
      activeUntil: paidUntil,
      daysRemaining: remainingDays,
      hasFullAccess: true
    };
  }

  if (trialEndsAt > now) {
    return {
      trialStartedAt,
      trialEndsAt,
      paidUntil,
      planTier: 'trial',
      activeUntil: trialEndsAt,
      daysRemaining: Math.max(1, Math.ceil((trialEndsAt - now) / DAY_MS)),
      hasFullAccess: true
    };
  }

  return {
    trialStartedAt,
    trialEndsAt,
    paidUntil,
    planTier: 'expired',
    activeUntil: paidUntil && paidUntil > trialEndsAt ? paidUntil : trialEndsAt,
    daysRemaining: 0,
    hasFullAccess: false
  };
}

export function formatVnDate(ts?: number | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}
