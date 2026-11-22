import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  isLocalSessionToken,
  localRegister,
  localLogin,
  localGetMe,
  localLogout,
  localFindAccount,
  localRequestPasswordReset,
  localResetPassword,
  localChangePassword,
  localGetRegistrationNotifications,
  localMarkNotificationSent,
  localConfirmRegistrationNotification,
  localPullWorkspace,
  localPushWorkspace,
  localPasswordlessAuth,
  localRedeemLicenseKey,
  localAdminGetSubscriptions,
  localAdminCreateLicenseKey,
  localAdminExtendUser
} from '../utils/localAuthFallback';
import type { PlanTier, SubscriptionPlanId } from '../utils/subscriptionPlans';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  role: 'teacher' | 'admin';
  authMethod?: 'google' | 'email_passwordless' | 'password';
  createdAt: number;
  lastLoginAt: number;
  registrationConfirmed?: boolean;
  confirmedAt?: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  paidUntil?: number;
  planTier?: PlanTier;
  activeUntil?: number | null;
  daysRemaining?: number;
  hasFullAccess?: boolean;
}

export interface LicenseKeyRecord {
  code: string;
  planId: SubscriptionPlanId;
  planLabel: string;
  durationDays: number;
  priceVnd: number;
  targetEmail?: string;
  note?: string;
  createdAt: number;
  createdBy: string;
  redeemedAt?: number;
  redeemedByEmail?: string;
}

export interface RememberedAccount {
  email: string;
  fullName: string;
  schoolName: string;
  savedAt: number;
}

export interface RegistrationNotificationItem {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  schoolName: string;
  notifyEmail: string;
  confirmationCode: string;
  registeredAt: number;
  emailSent: boolean;
  emailSentAt?: number;
  gmailMessageId?: string;
  sentByEmail?: string;
  confirmed: boolean;
  confirmedAt?: number;
  confirmedBy?: string;
}

export interface FoundAccountHint {
  email: string;
  maskedEmail: string;
  fullName: string;
  schoolName: string;
  createdAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  rememberedAccounts: RememberedAccount[];
  removeRememberedAccount: (email: string) => void;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    schoolName: string;
    rememberMe?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
    user?: AuthUser;
    registrationNotification?: RegistrationNotificationItem;
  }>;
  logout: () => Promise<void>;
  findAccount: (query: string) => Promise<{ success: boolean; accounts?: FoundAccountHint[]; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    email?: string;
    maskedEmail?: string;
    fullName?: string;
    expiresAt?: number;
    recoveryCode?: string;
    notifyEmail?: string;
    error?: string;
  }>;
  resetPassword: (params: {
    email: string;
    code: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  changePassword: (params: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  getRegistrationNotifications: () => Promise<{
    success: boolean;
    notifyEmail?: string;
    isAdmin?: boolean;
    notifications?: RegistrationNotificationItem[];
    error?: string;
  }>;
  markNotificationSent: (
    id: string,
    payload: { gmailMessageId?: string; sentByEmail?: string }
  ) => Promise<{ success: boolean; notification?: RegistrationNotificationItem; error?: string }>;
  confirmRegistrationNotification: (
    id: string,
    confirmationCode?: string
  ) => Promise<{ success: boolean; notification?: RegistrationNotificationItem; error?: string }>;
  passwordlessSignIn: (params: {
    email: string;
    fullName?: string;
    schoolName?: string;
    provider: 'google' | 'email_passwordless';
    rememberMe?: boolean;
  }) => Promise<{
    success: boolean;
    isNewUser?: boolean;
    error?: string;
    user?: AuthUser;
    registrationNotification?: RegistrationNotificationItem;
  }>;
  redeemLicenseKey: (code: string) => Promise<{
    success: boolean;
    planLabel?: string;
    durationDays?: number;
    user?: AuthUser;
    error?: string;
  }>;
  adminGetSubscriptions: () => Promise<{
    success: boolean;
    users?: AuthUser[];
    keys?: LicenseKeyRecord[];
    error?: string;
  }>;
  adminCreateLicenseKey: (params: {
    planId: SubscriptionPlanId;
    targetEmail?: string;
    note?: string;
  }) => Promise<{ success: boolean; key?: LicenseKeyRecord; error?: string }>;
  adminExtendUser: (params: {
    email: string;
    durationDays: number;
  }) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  refreshUser: () => Promise<void>;
  pullWorkspace: () => Promise<any | null>;
  pushWorkspace: (workspace: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_STORAGE_KEY = 'gdtc_auth_token_v1';
const REMEMBERED_ACCOUNTS_KEY = 'gdtc_remembered_accounts_v1';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveStoredToken(token: string, rememberMe: boolean) {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {}
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

function readRememberedAccounts(): RememberedAccount[] {
  try {
    const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type BackendApiResult<T = any> =
  | { unavailable: true }
  | { unavailable: false; ok: boolean; status: number; data: T };

/**
 * Calls the Express backend API and distinguishes legitimate API JSON responses
 * (including 400/401/403/404/409/429 validation errors) from missing/unreachable
 * backend deployments (e.g., static Vercel hosting returning HTML 404/index.html or network errors).
 */
async function tryBackendJson<T = any>(url: string, init?: RequestInit): Promise<BackendApiResult<T>> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : null;
  try {
    const res = await fetch(url, {
      ...init,
      ...(controller ? { signal: controller.signal } : {})
    });
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return { unavailable: true };
    }
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      return { unavailable: true };
    }
    const isRecognizedApiPayload =
      data !== null &&
      typeof data === 'object' &&
      ('success' in data || 'authenticated' in data);

    if (!isRecognizedApiPayload) {
      return { unavailable: true };
    }
    return { unavailable: false, ok: res.ok, status: res.status, data };
  } catch {
    return { unavailable: true };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>(() =>
    readRememberedAccounts()
  );

  const getActiveToken = useCallback(
    (overrideToken?: string | null): string | null => {
      if (overrideToken !== undefined) return overrideToken;
      return token || readStoredToken();
    },
    [token]
  );

  const upsertRememberedAccount = useCallback((u: AuthUser) => {
    setRememberedAccounts((prev) => {
      const next: RememberedAccount[] = [
        {
          email: u.email,
          fullName: u.fullName,
          schoolName: u.schoolName,
          savedAt: Date.now()
        },
        ...prev.filter((item) => item.email.toLowerCase() !== u.email.toLowerCase())
      ].slice(0, 5);
      try {
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeRememberedAccount = useCallback((email: string) => {
    setRememberedAccounts((prev) => {
      const next = prev.filter((item) => item.email.toLowerCase() !== email.toLowerCase());
      try {
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const authHeaders = useCallback(
    (overrideToken?: string | null) => {
      const activeToken = getActiveToken(overrideToken);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }
      return headers;
    },
    [getActiveToken]
  );

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const activeToken = getActiveToken();
        if (isLocalSessionToken(activeToken)) {
          const localRes = localGetMe(activeToken);
          if (!cancelled) {
            setUser(localRes.authenticated ? localRes.user : null);
          }
          return;
        }

        const apiRes = await tryBackendJson<{ authenticated?: boolean; user?: AuthUser | null }>('/api/auth/me', {
          method: 'GET',
          headers: authHeaders(activeToken),
          credentials: 'include'
        });

        if (apiRes.unavailable) {
          const localRes = localGetMe(activeToken);
          if (!cancelled) {
            setUser(localRes.authenticated ? localRes.user : null);
          }
          return;
        }

        if (!cancelled && apiRes.data?.authenticated && apiRes.data?.user) {
          setUser(apiRes.data.user);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, [authHeaders, getActiveToken]);

  const login = async (email: string, password: string, rememberMe = true) => {
    const apiRes = await tryBackendJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, rememberMe })
    });

    if (apiRes.unavailable) {
      const localRes = await localLogin(email, password, rememberMe);
      if (!localRes.success || !localRes.user) {
        return { success: false, error: localRes.error || 'Đăng nhập thất bại.' };
      }
      if (localRes.token) {
        saveStoredToken(localRes.token, rememberMe);
        setToken(localRes.token);
      }
      setUser(localRes.user);
      if (rememberMe) {
        upsertRememberedAccount(localRes.user);
      }
      return { success: true, user: localRes.user };
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Đăng nhập thất bại.' };
    }
    if (data.token) {
      saveStoredToken(data.token, rememberMe);
      setToken(data.token);
    }
    setUser(data.user);
    if (rememberMe && data.user) {
      upsertRememberedAccount(data.user);
    }
    return { success: true, user: data.user };
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    schoolName: string;
    rememberMe?: boolean;
  }) => {
    const rememberMe = params.rememberMe !== false;
    const apiRes = await tryBackendJson('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...params, rememberMe })
    });

    if (apiRes.unavailable) {
      const localRes = await localRegister({ ...params, rememberMe });
      if (!localRes.success || !localRes.user) {
        return { success: false, error: localRes.error || 'Đăng ký tài khoản thất bại.' };
      }
      if (localRes.token) {
        saveStoredToken(localRes.token, rememberMe);
        setToken(localRes.token);
      }
      setUser(localRes.user);
      if (rememberMe) {
        upsertRememberedAccount(localRes.user);
      }
      return {
        success: true,
        user: localRes.user,
        registrationNotification: localRes.registrationNotification
      };
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Đăng ký tài khoản thất bại.' };
    }
    if (data.token) {
      saveStoredToken(data.token, rememberMe);
      setToken(data.token);
    }
    setUser(data.user);
    if (rememberMe && data.user) {
      upsertRememberedAccount(data.user);
    }
    return {
      success: true,
      user: data.user,
      registrationNotification: data.registrationNotification
    };
  };

  const logout = async () => {
    const activeToken = getActiveToken();
    if (isLocalSessionToken(activeToken)) {
      localLogout(activeToken);
    } else {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: authHeaders(activeToken),
          credentials: 'include'
        });
      } catch {}
    }
    clearStoredToken();
    setToken(null);
    setUser(null);
    setLastSyncedAt(null);
  };

  const findAccount = async (query: string) => {
    const apiRes = await tryBackendJson('/api/auth/find-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (apiRes.unavailable) {
      return localFindAccount(query);
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Không thể tra cứu tài khoản.' };
    }
    return { success: true, accounts: data.accounts || [] };
  };

  const requestPasswordReset = async (email: string) => {
    const apiRes = await tryBackendJson('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (apiRes.unavailable) {
      return localRequestPasswordReset(email);
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Không thể tạo mã khôi phục mật khẩu.' };
    }
    return {
      success: true,
      email: data.email,
      maskedEmail: data.maskedEmail,
      fullName: data.fullName,
      expiresAt: data.expiresAt,
      recoveryCode: data.recoveryCode,
      notifyEmail: data.notifyEmail
    };
  };

  const resetPassword = async (params: { email: string; code: string; newPassword: string }) => {
    const apiRes = await tryBackendJson('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params)
    });

    if (apiRes.unavailable) {
      const localRes = await localResetPassword(params);
      if (!localRes.success) {
        return { success: false, error: localRes.error || 'Đặt lại mật khẩu thất bại.' };
      }
      if (localRes.token) {
        saveStoredToken(localRes.token, true);
        setToken(localRes.token);
      }
      if (localRes.user) {
        setUser(localRes.user);
        upsertRememberedAccount(localRes.user);
      }
      return { success: true, user: localRes.user };
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Đặt lại mật khẩu thất bại.' };
    }
    if (data.token) {
      saveStoredToken(data.token, true);
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
      upsertRememberedAccount(data.user);
    }
    return { success: true, user: data.user };
  };

  const changePassword = async (params: { currentPassword: string; newPassword: string }) => {
    const activeToken = getActiveToken();
    if (isLocalSessionToken(activeToken)) {
      return localChangePassword(activeToken, params);
    }

    const apiRes = await tryBackendJson('/api/auth/change-password', {
      method: 'POST',
      headers: authHeaders(activeToken),
      credentials: 'include',
      body: JSON.stringify(params)
    });

    if (apiRes.unavailable) {
      return localChangePassword(activeToken, params);
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Đổi mật khẩu thất bại.' };
    }
    return { success: true };
  };

  const getRegistrationNotifications = useCallback(async () => {
    const activeToken = getActiveToken();
    if (isLocalSessionToken(activeToken)) {
      return localGetRegistrationNotifications(activeToken);
    }

    const apiRes = await tryBackendJson('/api/auth/notifications', {
      method: 'GET',
      headers: authHeaders(activeToken),
      credentials: 'include'
    });

    if (apiRes.unavailable) {
      return localGetRegistrationNotifications(activeToken);
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Không thể tải danh sách thông báo.' };
    }
    return {
      success: true,
      notifyEmail: data.notifyEmail,
      isAdmin: data.isAdmin,
      notifications: data.notifications || []
    };
  }, [authHeaders, getActiveToken]);

  const markNotificationSent = useCallback(
    async (id: string, payload: { gmailMessageId?: string; sentByEmail?: string }) => {
      const activeToken = getActiveToken();
      if (isLocalSessionToken(activeToken)) {
        return localMarkNotificationSent(activeToken, id, payload);
      }

      const apiRes = await tryBackendJson(`/api/auth/notifications/${encodeURIComponent(id)}/mark-sent`, {
        method: 'POST',
        headers: authHeaders(activeToken),
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (apiRes.unavailable) {
        return localMarkNotificationSent(activeToken, id, payload);
      }

      const data = apiRes.data;
      if (!apiRes.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể cập nhật trạng thái gửi email.' };
      }
      return { success: true, notification: data.notification };
    },
    [authHeaders, getActiveToken]
  );

  const confirmRegistrationNotification = useCallback(
    async (id: string, confirmationCode?: string) => {
      const activeToken = getActiveToken();
      if (isLocalSessionToken(activeToken)) {
        const localRes = localConfirmRegistrationNotification(activeToken, id, confirmationCode);
        if (localRes.success && localRes.notification && user && localRes.notification.userId === user.id) {
          setUser((prev) => (prev ? { ...prev, registrationConfirmed: true, confirmedAt: Date.now() } : prev));
        }
        return localRes;
      }

      const apiRes = await tryBackendJson(`/api/auth/notifications/${encodeURIComponent(id)}/confirm`, {
        method: 'POST',
        headers: authHeaders(activeToken),
        credentials: 'include',
        body: JSON.stringify({ confirmationCode })
      });

      if (apiRes.unavailable) {
        const localRes = localConfirmRegistrationNotification(activeToken, id, confirmationCode);
        if (localRes.success && localRes.notification && user && localRes.notification.userId === user.id) {
          setUser((prev) => (prev ? { ...prev, registrationConfirmed: true, confirmedAt: Date.now() } : prev));
        }
        return localRes;
      }

      const data = apiRes.data;
      if (!apiRes.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể xác nhận tài khoản.' };
      }
      if (data.notification && user && data.notification.userId === user.id) {
        setUser((prev) => (prev ? { ...prev, registrationConfirmed: true, confirmedAt: Date.now() } : prev));
      }
      return { success: true, notification: data.notification };
    },
    [authHeaders, getActiveToken, user]
  );

  const pullWorkspace = useCallback(async () => {
    const activeToken = getActiveToken();
    if (!activeToken && !user) return null;
    setIsSyncing(true);
    try {
      if (isLocalSessionToken(activeToken)) {
        const ws = await localPullWorkspace(activeToken);
        if (ws?.updatedAt) setLastSyncedAt(ws.updatedAt);
        return ws;
      }

      const apiRes = await tryBackendJson('/api/workspace', {
        method: 'GET',
        headers: authHeaders(activeToken),
        credentials: 'include'
      });

      if (apiRes.unavailable) {
        const ws = await localPullWorkspace(activeToken);
        if (ws?.updatedAt) setLastSyncedAt(ws.updatedAt);
        return ws;
      }

      if (!apiRes.ok) return null;
      if (apiRes.data?.workspace?.updatedAt) {
        setLastSyncedAt(apiRes.data.workspace.updatedAt);
      }
      return apiRes.data?.workspace || null;
    } catch {
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [getActiveToken, user, authHeaders]);

  const pushWorkspace = useCallback(
    async (workspace: any): Promise<boolean> => {
      const activeToken = getActiveToken();
      if (!activeToken && !user) return false;
      setIsSyncing(true);
      try {
        if (isLocalSessionToken(activeToken)) {
          const localRes = await localPushWorkspace(activeToken, workspace);
          if (localRes.updatedAt) setLastSyncedAt(localRes.updatedAt);
          return localRes.success;
        }

        const apiRes = await tryBackendJson('/api/workspace', {
          method: 'PUT',
          headers: authHeaders(activeToken),
          credentials: 'include',
          body: JSON.stringify({ workspace })
        });

        if (apiRes.unavailable) {
          const localRes = await localPushWorkspace(activeToken, workspace);
          if (localRes.updatedAt) setLastSyncedAt(localRes.updatedAt);
          return localRes.success;
        }

        if (!apiRes.ok) return false;
        if (apiRes.data?.updatedAt) {
          setLastSyncedAt(apiRes.data.updatedAt);
        }
        return Boolean(apiRes.data?.success);
      } catch {
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [getActiveToken, user, authHeaders]
  );

  const passwordlessSignIn = async (params: {
    email: string;
    fullName?: string;
    schoolName?: string;
    provider: 'google' | 'email_passwordless';
    rememberMe?: boolean;
  }) => {
    const rememberMe = params.rememberMe !== false;
    const apiRes = await tryBackendJson('/api/auth/passwordless', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...params, rememberMe })
    });

    if (apiRes.unavailable) {
      const localRes = await localPasswordlessAuth({ ...params, rememberMe });
      if (!localRes.success || !localRes.user) {
        return { success: false, error: localRes.error || 'Đăng nhập thất bại.' };
      }
      if (localRes.token) {
        saveStoredToken(localRes.token, rememberMe);
        setToken(localRes.token);
      }
      setUser(localRes.user);
      if (rememberMe) {
        upsertRememberedAccount(localRes.user);
      }
      return {
        success: true,
        isNewUser: localRes.isNewUser,
        user: localRes.user,
        registrationNotification: localRes.registrationNotification
      };
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Đăng nhập thất bại.' };
    }
    if (data.token) {
      saveStoredToken(data.token, rememberMe);
      setToken(data.token);
    }
    setUser(data.user);
    if (rememberMe && data.user) {
      upsertRememberedAccount(data.user);
    }
    return {
      success: true,
      isNewUser: Boolean(data.isNewUser),
      user: data.user,
      registrationNotification: data.registrationNotification
    };
  };

  const redeemLicenseKey = useCallback(
    async (code: string) => {
      const activeToken = getActiveToken();
      if (isLocalSessionToken(activeToken)) {
        const localRes = localRedeemLicenseKey(activeToken, code);
        if (localRes.success && localRes.user) {
          setUser(localRes.user);
        }
        return localRes;
      }

      const apiRes = await tryBackendJson('/api/subscription/redeem', {
        method: 'POST',
        headers: authHeaders(activeToken),
        credentials: 'include',
        body: JSON.stringify({ code })
      });

      if (apiRes.unavailable) {
        const localRes = localRedeemLicenseKey(activeToken, code);
        if (localRes.success && localRes.user) {
          setUser(localRes.user);
        }
        return localRes;
      }

      const data = apiRes.data;
      if (!apiRes.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể kích hoạt mã.' };
      }
      if (data.user) setUser(data.user);
      return {
        success: true,
        planLabel: data.planLabel,
        durationDays: data.durationDays,
        user: data.user
      };
    },
    [authHeaders, getActiveToken]
  );

  const adminGetSubscriptions = useCallback(async () => {
    const activeToken = getActiveToken();
    if (isLocalSessionToken(activeToken)) {
      return localAdminGetSubscriptions(activeToken);
    }

    const apiRes = await tryBackendJson('/api/admin/subscriptions', {
      method: 'GET',
      headers: authHeaders(activeToken),
      credentials: 'include'
    });

    if (apiRes.unavailable) {
      return localAdminGetSubscriptions(activeToken);
    }

    const data = apiRes.data;
    if (!apiRes.ok || !data?.success) {
      return { success: false, error: data?.error || 'Không thể tải danh sách quản trị.' };
    }
    return {
      success: true,
      users: data.users || [],
      keys: data.keys || []
    };
  }, [authHeaders, getActiveToken]);

  const adminCreateLicenseKey = useCallback(
    async (params: { planId: SubscriptionPlanId; targetEmail?: string; note?: string }) => {
      const activeToken = getActiveToken();
      if (isLocalSessionToken(activeToken)) {
        return localAdminCreateLicenseKey(activeToken, params);
      }

      const apiRes = await tryBackendJson('/api/admin/license-keys', {
        method: 'POST',
        headers: authHeaders(activeToken),
        credentials: 'include',
        body: JSON.stringify(params)
      });

      if (apiRes.unavailable) {
        return localAdminCreateLicenseKey(activeToken, params);
      }

      const data = apiRes.data;
      if (!apiRes.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể tạo mã kích hoạt.' };
      }
      return { success: true, key: data.key };
    },
    [authHeaders, getActiveToken]
  );

  const adminExtendUser = useCallback(
    async (params: { email: string; durationDays: number }) => {
      const activeToken = getActiveToken();
      if (isLocalSessionToken(activeToken)) {
        const localRes = localAdminExtendUser(activeToken, params);
        if (localRes.success && localRes.user && user && localRes.user.email === user.email) {
          setUser(localRes.user);
        }
        return localRes;
      }

      const apiRes = await tryBackendJson('/api/admin/extend-user', {
        method: 'POST',
        headers: authHeaders(activeToken),
        credentials: 'include',
        body: JSON.stringify(params)
      });

      if (apiRes.unavailable) {
        const localRes = localAdminExtendUser(activeToken, params);
        if (localRes.success && localRes.user && user && localRes.user.email === user.email) {
          setUser(localRes.user);
        }
        return localRes;
      }

      const data = apiRes.data;
      if (!apiRes.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể gia hạn tài khoản.' };
      }
      if (data.user && user && data.user.email === user.email) {
        setUser(data.user);
      }
      return { success: true, user: data.user };
    },
    [authHeaders, getActiveToken, user]
  );

  const refreshUser = useCallback(async () => {
    const activeToken = getActiveToken();
    if (!activeToken) return;
    if (isLocalSessionToken(activeToken)) {
      const localRes = localGetMe(activeToken);
      if (localRes.authenticated && localRes.user) setUser(localRes.user);
      return;
    }
    const apiRes = await tryBackendJson<{ authenticated?: boolean; user?: AuthUser | null }>('/api/auth/me', {
      method: 'GET',
      headers: authHeaders(activeToken),
      credentials: 'include'
    });
    if (!apiRes.unavailable && apiRes.data?.authenticated && apiRes.data?.user) {
      setUser(apiRes.data.user);
    }
  }, [authHeaders, getActiveToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSyncing,
        lastSyncedAt,
        rememberedAccounts,
        removeRememberedAccount,
        login,
        register,
        passwordlessSignIn,
        redeemLicenseKey,
        adminGetSubscriptions,
        adminCreateLicenseKey,
        adminExtendUser,
        refreshUser,
        logout,
        findAccount,
        requestPasswordReset,
        resetPassword,
        changePassword,
        getRegistrationNotifications,
        markNotificationSent,
        confirmRegistrationNotification,
        pullWorkspace,
        pushWorkspace
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
