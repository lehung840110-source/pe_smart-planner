import { getAppStateDB, setAppStateDB, safeLocalStorageSet } from './db';
import type {
  AuthUser,
  FoundAccountHint,
  RegistrationNotificationItem,
  LicenseKeyRecord
} from '../contexts/AuthContext';
import {
  DAY_MS,
  TRIAL_DURATION_DAYS,
  SubscriptionPlanId,
  computeSubscriptionState,
  generateSignedLicenseCode,
  getSubscriptionPlanById,
  verifySignedLicenseCode
} from './subscriptionPlans';

export const LOCAL_ADMIN_NOTIFICATION_EMAIL = 'lehung840110@gmail.com';
export const LOCAL_TOKEN_PREFIX = 'local_sess_';

const USERS_KEY = 'gdtc_local_users_v1';
const SESSIONS_KEY = 'gdtc_local_sessions_v1';
const RECOVERY_CODES_KEY = 'gdtc_local_recovery_codes_v1';
const NOTIFICATIONS_KEY = 'gdtc_local_reg_notifications_v1';
const LICENSE_KEYS_KEY = 'gdtc_local_license_keys_v1';

interface LocalStoredUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  role: 'teacher' | 'admin';
  passwordHash: string;
  authMethod?: 'google' | 'email_passwordless' | 'password';
  createdAt: number;
  lastLoginAt: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  paidUntil?: number;
  registrationConfirmed?: boolean;
  confirmedAt?: number;
}

interface LocalSessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
  rememberMe: boolean;
}

interface LocalRecoveryCodeRecord {
  email: string;
  codeHash: string;
  expiresAt: number;
  createdAt: number;
  attempts: number;
}

export function isLocalSessionToken(token?: string | null): boolean {
  return typeof token === 'string' && token.startsWith(LOCAL_TOKEN_PREFIX);
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSixDigitCode(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return String(100000 + (arr[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

function fallbackSaltedHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

async function computeHashWithSalt(secret: string, salt: string, algo: 'sha256' | 'fnv'): Promise<string> {
  const payload = `${salt}:${secret}:gdtc_local_v1`;
  if (algo === 'sha256' && typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const data = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${salt}:${hex}`;
  }
  return `fnv:${salt}:${fallbackSaltedHash(payload)}`;
}

async function hashLocalSecret(secret: string): Promise<string> {
  const salt = randomHex(16);
  const preferSha = typeof crypto !== 'undefined' && Boolean(crypto.subtle);
  return computeHashWithSalt(secret, salt, preferSha ? 'sha256' : 'fnv');
}

async function verifyLocalSecret(secret: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;
  const [algo, salt] = parts;
  if (algo !== 'sha256' && algo !== 'fnv') return false;
  const candidate = await computeHashWithSalt(secret, salt, algo);
  return candidate === storedHash;
}

function maskEmailAddress(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  if (localPart.length <= 2) {
    return `${localPart[0] || '*'}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}${'*'.repeat(Math.min(5, Math.max(2, localPart.length - 2)))}${localPart.slice(-1)}@${domain}`;
}

const memoryJsonStore = new Map<string, string>();

function readJsonStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? memoryJsonStore.get(key) ?? null;
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    try {
      const mem = memoryJsonStore.get(key);
      return mem ? (JSON.parse(mem) ?? fallback) : fallback;
    } catch {
      return fallback;
    }
  }
}

function writeJsonStore<T>(key: string, value: T): void {
  const serialized = JSON.stringify(value);
  memoryJsonStore.set(key, serialized);
  safeLocalStorageSet(key, serialized);
}

function readUsers(): LocalStoredUser[] {
  const list = readJsonStore<LocalStoredUser[]>(USERS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeUsers(users: LocalStoredUser[]): void {
  writeJsonStore(USERS_KEY, users);
}

function readSessions(): LocalSessionRecord[] {
  const now = Date.now();
  const list = readJsonStore<LocalSessionRecord[]>(SESSIONS_KEY, []);
  if (!Array.isArray(list)) return [];
  return list.filter((s) => s && s.token && s.userId && s.expiresAt > now);
}

function writeSessions(sessions: LocalSessionRecord[]): void {
  writeJsonStore(SESSIONS_KEY, sessions.slice(0, 50));
}

function createLocalSession(userId: string, rememberMe: boolean): string {
  const token = `${LOCAL_TOKEN_PREFIX}${Date.now()}_${randomHex(16)}`;
  const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const sessions = readSessions();
  sessions.unshift({
    token,
    userId,
    expiresAt: Date.now() + ttlMs,
    rememberMe
  });
  writeSessions(sessions);
  return token;
}

function resolveUserByToken(token?: string | null): LocalStoredUser | null {
  if (!isLocalSessionToken(token)) return null;
  const sessions = readSessions();
  const sess = sessions.find((s) => s.token === token);
  if (!sess) return null;
  const users = readUsers();
  return users.find((u) => u.id === sess.userId) || null;
}

function toPublicUser(u: LocalStoredUser): AuthUser {
  const sub = computeSubscriptionState({
    email: u.email,
    createdAt: u.createdAt,
    trialStartedAt: u.trialStartedAt,
    trialEndsAt: u.trialEndsAt,
    paidUntil: u.paidUntil
  });
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    schoolName: u.schoolName,
    role: u.email === LOCAL_ADMIN_NOTIFICATION_EMAIL ? 'admin' : u.role,
    authMethod: u.authMethod || 'password',
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    registrationConfirmed: Boolean(u.registrationConfirmed),
    confirmedAt: u.confirmedAt,
    trialStartedAt: sub.trialStartedAt,
    trialEndsAt: sub.trialEndsAt,
    paidUntil: sub.paidUntil,
    planTier: sub.planTier,
    activeUntil: sub.activeUntil,
    daysRemaining: sub.daysRemaining,
    hasFullAccess: sub.hasFullAccess
  };
}

function readLocalLicenseKeys(): LicenseKeyRecord[] {
  const list = readJsonStore<LicenseKeyRecord[]>(LICENSE_KEYS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeLocalLicenseKeys(items: LicenseKeyRecord[]): void {
  writeJsonStore(LICENSE_KEYS_KEY, items.slice(0, 500));
}

function readNotifications(): RegistrationNotificationItem[] {
  const list = readJsonStore<RegistrationNotificationItem[]>(NOTIFICATIONS_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeNotifications(items: RegistrationNotificationItem[]): void {
  writeJsonStore(NOTIFICATIONS_KEY, items.slice(0, 200));
}

function readRecoveryCodes(): LocalRecoveryCodeRecord[] {
  const list = readJsonStore<LocalRecoveryCodeRecord[]>(RECOVERY_CODES_KEY, []);
  return Array.isArray(list) ? list : [];
}

function writeRecoveryCodes(items: LocalRecoveryCodeRecord[]): void {
  writeJsonStore(RECOVERY_CODES_KEY, items);
}

export async function localRegister(params: {
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
  rememberMe?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  token?: string;
  user?: AuthUser;
  registrationNotification?: RegistrationNotificationItem;
}> {
  const rawEmail = String(params.email || '').trim().toLowerCase();
  const password = String(params.password || '');
  const fullName = String(params.fullName || '').trim() || 'Giáo viên GDTC';
  const schoolName = String(params.schoolName || '').trim() || 'TRƯỜNG TIỂU HỌC & THCS';
  const rememberMe = params.rememberMe !== false;

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { success: false, error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }

  const users = readUsers();
  if (users.some((u) => u.email === rawEmail)) {
    return {
      success: false,
      error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng tính năng Khôi phục mật khẩu.'
    };
  }

  const now = Date.now();
  const isAdminAccount = users.length === 0 || rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL;
  const newUser: LocalStoredUser = {
    id: `usr_${now}_${randomHex(4)}`,
    email: rawEmail,
    fullName,
    schoolName,
    role: isAdminAccount ? 'admin' : 'teacher',
    passwordHash: await hashLocalSecret(password),
    createdAt: now,
    lastLoginAt: now,
    registrationConfirmed: rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL,
    ...(rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL ? { confirmedAt: now } : {})
  };

  users.push(newUser);
  writeUsers(users);

  const confirmationCode = randomSixDigitCode();
  const notificationRecord: RegistrationNotificationItem = {
    id: `reg_${now}_${randomHex(3)}`,
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    schoolName: newUser.schoolName,
    notifyEmail: LOCAL_ADMIN_NOTIFICATION_EMAIL,
    confirmationCode,
    registeredAt: now,
    emailSent: false,
    confirmed: rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL,
    ...(rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL
      ? { confirmedAt: now, confirmedBy: LOCAL_ADMIN_NOTIFICATION_EMAIL }
      : {})
  };

  const notifications = readNotifications();
  notifications.unshift(notificationRecord);
  writeNotifications(notifications);

  const token = createLocalSession(newUser.id, rememberMe);

  return {
    success: true,
    token,
    user: toPublicUser(newUser),
    registrationNotification: notificationRecord
  };
}

export async function localLogin(
  email: string,
  password: string,
  rememberMe = true
): Promise<{ success: boolean; error?: string; token?: string; user?: AuthUser }> {
  const rawEmail = String(email || '').trim().toLowerCase();
  const pwd = String(password || '');

  if (!rawEmail || !pwd) {
    return { success: false, error: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' };
  }

  const users = readUsers();
  const idx = users.findIndex((u) => u.email === rawEmail);
  if (idx < 0 || !(await verifyLocalSecret(pwd, users[idx].passwordHash))) {
    return { success: false, error: 'Email hoặc mật khẩu chưa chính xác.' };
  }

  users[idx].lastLoginAt = Date.now();
  if (users[idx].email === LOCAL_ADMIN_NOTIFICATION_EMAIL && users[idx].role !== 'admin') {
    users[idx].role = 'admin';
  }
  writeUsers(users);

  const token = createLocalSession(users[idx].id, rememberMe);
  return {
    success: true,
    token,
    user: toPublicUser(users[idx])
  };
}

export function localGetMe(token?: string | null): { authenticated: boolean; user: AuthUser | null } {
  const user = resolveUserByToken(token);
  if (!user) {
    return { authenticated: false, user: null };
  }
  return { authenticated: true, user: toPublicUser(user) };
}

export function localLogout(token?: string | null): void {
  if (!isLocalSessionToken(token)) return;
  const sessions = readSessions().filter((s) => s.token !== token);
  writeSessions(sessions);
}

export function localFindAccount(query: string): {
  success: boolean;
  accounts?: FoundAccountHint[];
  error?: string;
} {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) {
    return { success: false, error: 'Vui lòng nhập ít nhất 2 ký tự họ tên hoặc email để tra cứu.' };
  }

  const users = readUsers();
  const matches: FoundAccountHint[] = users
    .filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.schoolName.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((u) => ({
      email: u.email,
      maskedEmail: maskEmailAddress(u.email),
      fullName: u.fullName,
      schoolName: u.schoolName,
      createdAt: u.createdAt
    }));

  return { success: true, accounts: matches };
}

export async function localRequestPasswordReset(email: string): Promise<{
  success: boolean;
  email?: string;
  maskedEmail?: string;
  fullName?: string;
  expiresAt?: number;
  recoveryCode?: string;
  notifyEmail?: string;
  error?: string;
}> {
  const rawEmail = String(email || '').trim().toLowerCase();
  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' };
  }

  const users = readUsers();
  const user = users.find((u) => u.email === rawEmail);
  if (!user) {
    return {
      success: false,
      error: 'Không tìm thấy tài khoản nào đăng ký với email này. Bạn có thể dùng tab "Tra cứu tài khoản" để tìm lại.'
    };
  }

  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000;
  const recoveryCode = randomSixDigitCode();

  const existing = readRecoveryCodes().filter((item) => item.email !== rawEmail && item.expiresAt > now);
  existing.push({
    email: rawEmail,
    codeHash: await hashLocalSecret(recoveryCode),
    expiresAt,
    createdAt: now,
    attempts: 0
  });
  writeRecoveryCodes(existing);

  return {
    success: true,
    email: rawEmail,
    maskedEmail: maskEmailAddress(rawEmail),
    fullName: user.fullName,
    expiresAt,
    recoveryCode,
    notifyEmail: LOCAL_ADMIN_NOTIFICATION_EMAIL
  };
}

export async function localResetPassword(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string; token?: string; user?: AuthUser }> {
  const rawEmail = String(params.email || '').trim().toLowerCase();
  const code = String(params.code || '').trim();
  const newPassword = String(params.newPassword || '');

  if (!rawEmail || !code) {
    return { success: false, error: 'Vui lòng nhập đầy đủ email và mã khôi phục 6 chữ số.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
  }

  const now = Date.now();
  const codes = readRecoveryCodes();
  const codeIdx = codes.findIndex((c) => c.email === rawEmail);
  if (codeIdx < 0) {
    return {
      success: false,
      error: 'Chưa có yêu cầu khôi phục mật khẩu cho email này hoặc mã đã được sử dụng.'
    };
  }

  const record = codes[codeIdx];
  if (now > record.expiresAt) {
    codes.splice(codeIdx, 1);
    writeRecoveryCodes(codes);
    return { success: false, error: 'Mã khôi phục đã hết hạn (quá 15 phút). Vui lòng tạo mã mới.' };
  }

  if (record.attempts >= 5) {
    codes.splice(codeIdx, 1);
    writeRecoveryCodes(codes);
    return { success: false, error: 'Bạn đã nhập sai mã quá 5 lần. Vui lòng yêu cầu mã khôi phục mới.' };
  }

  if (!(await verifyLocalSecret(code, record.codeHash))) {
    record.attempts += 1;
    writeRecoveryCodes(codes);
    return {
      success: false,
      error: `Mã khôi phục chưa chính xác (còn ${Math.max(0, 5 - record.attempts)} lần thử).`
    };
  }

  const users = readUsers();
  const userIdx = users.findIndex((u) => u.email === rawEmail);
  if (userIdx < 0) {
    return { success: false, error: 'Không tìm thấy tài khoản tương ứng.' };
  }

  users[userIdx].passwordHash = await hashLocalSecret(newPassword);
  users[userIdx].lastLoginAt = now;
  writeUsers(users);

  codes.splice(codeIdx, 1);
  writeRecoveryCodes(codes);

  const token = createLocalSession(users[userIdx].id, true);
  return {
    success: true,
    token,
    user: toPublicUser(users[userIdx])
  };
}

export async function localChangePassword(
  token: string | null,
  params: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean; error?: string }> {
  const authUser = resolveUserByToken(token);
  if (!authUser) {
    return { success: false, error: 'Vui lòng đăng nhập để đổi mật khẩu.' };
  }

  const currentPassword = String(params.currentPassword || '');
  const newPassword = String(params.newPassword || '');
  if (newPassword.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
  }

  const users = readUsers();
  const idx = users.findIndex((u) => u.id === authUser.id);
  if (idx < 0 || !(await verifyLocalSecret(currentPassword, users[idx].passwordHash))) {
    return { success: false, error: 'Mật khẩu hiện tại chưa chính xác.' };
  }

  users[idx].passwordHash = await hashLocalSecret(newPassword);
  writeUsers(users);
  return { success: true };
}

export function localGetRegistrationNotifications(token: string | null): {
  success: boolean;
  notifyEmail?: string;
  isAdmin?: boolean;
  notifications?: RegistrationNotificationItem[];
  error?: string;
} {
  const authUser = resolveUserByToken(token);
  if (!authUser) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  const all = readNotifications();
  const isAdmin = authUser.role === 'admin' || authUser.email === LOCAL_ADMIN_NOTIFICATION_EMAIL;
  const visible = isAdmin ? all : all.filter((n) => n.userId === authUser.id || n.email === authUser.email);

  return {
    success: true,
    notifyEmail: LOCAL_ADMIN_NOTIFICATION_EMAIL,
    isAdmin,
    notifications: visible
  };
}

export function localMarkNotificationSent(
  token: string | null,
  id: string,
  payload: { gmailMessageId?: string; sentByEmail?: string }
): { success: boolean; notification?: RegistrationNotificationItem; error?: string } {
  const authUser = resolveUserByToken(token);
  if (!authUser) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  const notifications = readNotifications();
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx < 0) {
    return { success: false, error: 'Không tìm thấy thông báo đăng ký.' };
  }

  const isAdmin = authUser.role === 'admin' || authUser.email === LOCAL_ADMIN_NOTIFICATION_EMAIL;
  if (!isAdmin && notifications[idx].userId !== authUser.id) {
    return { success: false, error: 'Bạn không có quyền cập nhật thông báo này.' };
  }

  notifications[idx].emailSent = true;
  notifications[idx].emailSentAt = Date.now();
  if (payload.gmailMessageId) notifications[idx].gmailMessageId = payload.gmailMessageId;
  notifications[idx].sentByEmail = payload.sentByEmail || authUser.email;
  writeNotifications(notifications);

  return { success: true, notification: notifications[idx] };
}

export function localConfirmRegistrationNotification(
  token: string | null,
  id: string,
  confirmationCode?: string
): { success: boolean; notification?: RegistrationNotificationItem; error?: string } {
  const authUser = resolveUserByToken(token);
  if (!authUser) {
    return { success: false, error: 'Chưa đăng nhập.' };
  }

  const submittedCode = String(confirmationCode || '').trim();
  const notifications = readNotifications();
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx < 0) {
    return { success: false, error: 'Không tìm thấy bản ghi đăng ký.' };
  }

  const isAdmin = authUser.role === 'admin' || authUser.email === LOCAL_ADMIN_NOTIFICATION_EMAIL;
  const codeMatches = Boolean(submittedCode && submittedCode === notifications[idx].confirmationCode);
  if (!isAdmin && !(notifications[idx].userId === authUser.id && codeMatches)) {
    return { success: false, error: 'Mã xác nhận chưa khớp hoặc cần quản trị viên xác nhận.' };
  }

  const now = Date.now();
  notifications[idx].confirmed = true;
  notifications[idx].confirmedAt = now;
  notifications[idx].confirmedBy = authUser.email;
  writeNotifications(notifications);

  const users = readUsers();
  const userIdx = users.findIndex((u) => u.id === notifications[idx].userId);
  if (userIdx >= 0) {
    users[userIdx].registrationConfirmed = true;
    users[userIdx].confirmedAt = now;
    writeUsers(users);
  }

  return { success: true, notification: notifications[idx] };
}

function workspaceStorageKey(userId: string): string {
  return `gdtc_local_workspace_${userId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

export async function localPullWorkspace(token: string | null): Promise<any | null> {
  const authUser = resolveUserByToken(token);
  if (!authUser) return null;
  return getAppStateDB<any | null>(workspaceStorageKey(authUser.id), null);
}

export async function localPushWorkspace(
  token: string | null,
  workspace: any
): Promise<{ success: boolean; updatedAt?: number }> {
  const authUser = resolveUserByToken(token);
  if (!authUser) return { success: false };
  const updatedAt = Date.now();
  const payload = {
    ...(workspace || {}),
    ownerId: authUser.id,
    ownerEmail: authUser.email,
    updatedAt
  };
  await setAppStateDB(workspaceStorageKey(authUser.id), payload);
  return { success: true, updatedAt };
}

export async function localPasswordlessAuth(params: {
  email: string;
  fullName?: string;
  schoolName?: string;
  provider: 'google' | 'email_passwordless';
  rememberMe?: boolean;
}): Promise<{
  success: boolean;
  isNewUser?: boolean;
  error?: string;
  token?: string;
  user?: AuthUser;
  registrationNotification?: RegistrationNotificationItem;
}> {
  const rawEmail = String(params.email || '').trim().toLowerCase();
  const fullNameInput = String(params.fullName || '').trim();
  const schoolNameInput = String(params.schoolName || '').trim();
  const provider = params.provider === 'google' ? 'google' : 'email_passwordless';
  const rememberMe = params.rememberMe !== false;

  if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return {
      success: false,
      error: 'Email cá nhân không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: ten@gmail.com).'
    };
  }

  const users = readUsers();
  const now = Date.now();
  const existingIdx = users.findIndex((u) => u.email === rawEmail);

  if (existingIdx >= 0) {
    const existing = users[existingIdx];
    existing.lastLoginAt = now;
    if (!existing.trialStartedAt) existing.trialStartedAt = existing.createdAt || now;
    if (!existing.trialEndsAt) existing.trialEndsAt = existing.trialStartedAt + TRIAL_DURATION_DAYS * DAY_MS;
    if (fullNameInput && (!existing.fullName || existing.fullName === 'Giáo viên GDTC')) {
      existing.fullName = fullNameInput;
    }
    if (schoolNameInput && (!existing.schoolName || existing.schoolName === 'TRƯỜNG TIỂU HỌC & THCS')) {
      existing.schoolName = schoolNameInput;
    }
    if (existing.email === LOCAL_ADMIN_NOTIFICATION_EMAIL && existing.role !== 'admin') {
      existing.role = 'admin';
    }
    if (!existing.authMethod) existing.authMethod = provider;
    writeUsers(users);

    const token = createLocalSession(existing.id, rememberMe);
    return {
      success: true,
      isNewUser: false,
      token,
      user: toPublicUser(existing)
    };
  }

  const isAdminAccount = rawEmail === LOCAL_ADMIN_NOTIFICATION_EMAIL;
  const derivedName = fullNameInput || rawEmail.split('@')[0] || 'Giáo viên GDTC';
  const newUser: LocalStoredUser = {
    id: `usr_${now}_${randomHex(4)}`,
    email: rawEmail,
    fullName: derivedName,
    schoolName: schoolNameInput || 'TRƯỜNG TIỂU HỌC & THCS',
    role: isAdminAccount ? 'admin' : 'teacher',
    passwordHash: await hashLocalSecret(randomHex(24)),
    authMethod: provider,
    createdAt: now,
    lastLoginAt: now,
    trialStartedAt: now,
    trialEndsAt: now + TRIAL_DURATION_DAYS * DAY_MS,
    registrationConfirmed: true,
    confirmedAt: now
  };

  users.push(newUser);
  writeUsers(users);

  const notificationRecord: RegistrationNotificationItem = {
    id: `reg_${now}_${randomHex(3)}`,
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    schoolName: newUser.schoolName,
    notifyEmail: LOCAL_ADMIN_NOTIFICATION_EMAIL,
    confirmationCode: randomSixDigitCode(),
    registeredAt: now,
    emailSent: false,
    confirmed: true,
    confirmedAt: now,
    confirmedBy: provider
  };
  const notifications = readNotifications();
  notifications.unshift(notificationRecord);
  writeNotifications(notifications);

  const token = createLocalSession(newUser.id, rememberMe);
  return {
    success: true,
    isNewUser: true,
    token,
    user: toPublicUser(newUser),
    registrationNotification: notificationRecord
  };
}

export function localRedeemLicenseKey(
  token: string | null,
  rawCode: string
): {
  success: boolean;
  error?: string;
  planLabel?: string;
  durationDays?: number;
  user?: AuthUser;
} {
  const authUser = resolveUserByToken(token);
  if (!authUser) {
    return { success: false, error: 'Vui lòng đăng nhập tài khoản trước khi nhập mã kích hoạt.' };
  }

  const normalized = String(rawCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!normalized) {
    return { success: false, error: 'Vui lòng nhập mã kích hoạt.' };
  }

  const keys = readLocalLicenseKeys();
  const keyIdx = keys.findIndex((k) => k.code.toUpperCase() === normalized);
  let durationDays = 0;
  let planLabel = '';

  if (keyIdx >= 0) {
    const rec = keys[keyIdx];
    if (rec.redeemedAt) {
      return { success: false, error: 'Mã kích hoạt này đã được sử dụng trước đó.' };
    }
    if (rec.targetEmail && rec.targetEmail.toLowerCase() !== authUser.email.toLowerCase()) {
      return { success: false, error: `Mã kích hoạt này được cấp riêng cho email ${rec.targetEmail}.` };
    }
    durationDays = rec.durationDays;
    planLabel = rec.planLabel;
    keys[keyIdx].redeemedAt = Date.now();
    keys[keyIdx].redeemedByEmail = authUser.email;
    writeLocalLicenseKeys(keys);
  } else {
    const sig = verifySignedLicenseCode(normalized);
    if (!sig.valid || !sig.plan) {
      return {
        success: false,
        error: 'Mã kích hoạt không hợp lệ hoặc bị sai ký tự. Vui lòng kiểm tra lại.'
      };
    }
    durationDays = sig.plan.durationDays;
    planLabel = sig.plan.name;
    keys.unshift({
      code: sig.normalizedCode,
      planId: sig.plan.id,
      planLabel: sig.plan.name,
      durationDays: sig.plan.durationDays,
      priceVnd: sig.plan.priceVnd,
      createdAt: Date.now(),
      createdBy: LOCAL_ADMIN_NOTIFICATION_EMAIL,
      redeemedAt: Date.now(),
      redeemedByEmail: authUser.email
    });
    writeLocalLicenseKeys(keys);
  }

  const users = readUsers();
  const userIdx = users.findIndex((u) => u.id === authUser.id);
  if (userIdx < 0) {
    return { success: false, error: 'Không tìm thấy tài khoản.' };
  }
  const now = Date.now();
  const baseTime = Math.max(now, users[userIdx].paidUntil || 0, users[userIdx].trialEndsAt || 0);
  users[userIdx].paidUntil = baseTime + durationDays * DAY_MS;
  writeUsers(users);

  return {
    success: true,
    planLabel,
    durationDays,
    user: toPublicUser(users[userIdx])
  };
}

export function localAdminGetSubscriptions(token: string | null): {
  success: boolean;
  users?: AuthUser[];
  keys?: LicenseKeyRecord[];
  error?: string;
} {
  const authUser = resolveUserByToken(token);
  if (!authUser || authUser.email !== LOCAL_ADMIN_NOTIFICATION_EMAIL) {
    return { success: false, error: 'Chỉ quản trị viên mới có quyền truy cập mục này.' };
  }
  const users = readUsers()
    .map((u) => toPublicUser(u))
    .sort((a, b) => (b.lastLoginAt || 0) - (a.lastLoginAt || 0));
  const keys = readLocalLicenseKeys().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return { success: true, users, keys };
}

export function localAdminCreateLicenseKey(
  token: string | null,
  params: { planId: SubscriptionPlanId; targetEmail?: string; note?: string }
): { success: boolean; key?: LicenseKeyRecord; error?: string } {
  const authUser = resolveUserByToken(token);
  if (!authUser || authUser.email !== LOCAL_ADMIN_NOTIFICATION_EMAIL) {
    return { success: false, error: 'Chỉ quản trị viên mới được tạo mã kích hoạt.' };
  }
  const plan = getSubscriptionPlanById(params.planId);
  const record: LicenseKeyRecord = {
    code: generateSignedLicenseCode(plan.id),
    planId: plan.id,
    planLabel: plan.name,
    durationDays: plan.durationDays,
    priceVnd: plan.priceVnd,
    targetEmail: params.targetEmail?.trim().toLowerCase() || undefined,
    note: params.note?.trim().slice(0, 120) || undefined,
    createdAt: Date.now(),
    createdBy: authUser.email
  };
  const keys = readLocalLicenseKeys();
  keys.unshift(record);
  writeLocalLicenseKeys(keys);
  return { success: true, key: record };
}

export function localAdminExtendUser(
  token: string | null,
  params: { email: string; durationDays: number }
): { success: boolean; user?: AuthUser; error?: string } {
  const authUser = resolveUserByToken(token);
  if (!authUser || authUser.email !== LOCAL_ADMIN_NOTIFICATION_EMAIL) {
    return { success: false, error: 'Chỉ quản trị viên mới được gia hạn trực tiếp.' };
  }
  const rawEmail = String(params.email || '').trim().toLowerCase();
  const days = Number(params.durationDays || 7);
  if (!rawEmail || !Number.isFinite(days) || days < 1) {
    return { success: false, error: 'Email hoặc số ngày gia hạn không hợp lệ.' };
  }
  const users = readUsers();
  const idx = users.findIndex((u) => u.email === rawEmail);
  if (idx < 0) {
    return { success: false, error: `Không tìm thấy tài khoản ${rawEmail}.` };
  }
  const now = Date.now();
  const baseTime = Math.max(now, users[idx].paidUntil || 0, users[idx].trialEndsAt || 0);
  users[idx].paidUntil = baseTime + days * DAY_MS;
  writeUsers(users);
  return { success: true, user: toPublicUser(users[idx]) };
}
