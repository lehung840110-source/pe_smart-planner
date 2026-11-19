import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  role: 'teacher' | 'admin';
  createdAt: number;
  lastLoginAt: number;
  registrationConfirmed?: boolean;
  confirmedAt?: number;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>(() =>
    readRememberedAccounts()
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
      const activeToken = overrideToken !== undefined ? overrideToken : token;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeToken) {
        headers.Authorization = `Bearer ${activeToken}`;
      }
      return headers;
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: authHeaders(),
          credentials: 'include'
        });
        const data = await res.json();
        if (!cancelled && data?.authenticated && data?.user) {
          setUser(data.user);
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
  }, [authHeaders]);

  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
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
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ để đăng nhập.' };
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    schoolName: string;
    rememberMe?: boolean;
  }) => {
    try {
      const rememberMe = params.rememberMe !== false;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...params, rememberMe })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
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
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ để đăng ký.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include'
      });
    } catch {}
    clearStoredToken();
    setToken(null);
    setUser(null);
    setLastSyncedAt(null);
  };

  const findAccount = async (query: string) => {
    try {
      const res = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể tra cứu tài khoản.' };
      }
      return { success: true, accounts: data.accounts || [] };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ.' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
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
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ.' };
    }
  };

  const resetPassword = async (params: { email: string; code: string; newPassword: string }) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
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
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ.' };
    }
  };

  const changePassword = async (params: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Đổi mật khẩu thất bại.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ.' };
    }
  };

  const getRegistrationNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/notifications', {
        method: 'GET',
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Không thể tải danh sách thông báo.' };
      }
      return {
        success: true,
        notifyEmail: data.notifyEmail,
        isAdmin: data.isAdmin,
        notifications: data.notifications || []
      };
    } catch {
      return { success: false, error: 'Không thể kết nối máy chủ.' };
    }
  }, [authHeaders]);

  const markNotificationSent = useCallback(
    async (id: string, payload: { gmailMessageId?: string; sentByEmail?: string }) => {
      try {
        const res = await fetch(`/api/auth/notifications/${encodeURIComponent(id)}/mark-sent`, {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          return { success: false, error: data?.error || 'Không thể cập nhật trạng thái gửi email.' };
        }
        return { success: true, notification: data.notification };
      } catch {
        return { success: false, error: 'Không thể kết nối máy chủ.' };
      }
    },
    [authHeaders]
  );

  const confirmRegistrationNotification = useCallback(
    async (id: string, confirmationCode?: string) => {
      try {
        const res = await fetch(`/api/auth/notifications/${encodeURIComponent(id)}/confirm`, {
          method: 'POST',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({ confirmationCode })
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          return { success: false, error: data?.error || 'Không thể xác nhận tài khoản.' };
        }
        if (data.notification && user && data.notification.userId === user.id) {
          setUser((prev) => (prev ? { ...prev, registrationConfirmed: true, confirmedAt: Date.now() } : prev));
        }
        return { success: true, notification: data.notification };
      } catch {
        return { success: false, error: 'Không thể kết nối máy chủ.' };
      }
    },
    [authHeaders, user]
  );

  const pullWorkspace = useCallback(async () => {
    if (!token && !user) return null;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'GET',
        headers: authHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.workspace?.updatedAt) {
        setLastSyncedAt(data.workspace.updatedAt);
      }
      return data?.workspace || null;
    } catch {
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [token, user, authHeaders]);

  const pushWorkspace = useCallback(
    async (workspace: any): Promise<boolean> => {
      if (!token && !user) return false;
      setIsSyncing(true);
      try {
        const res = await fetch('/api/workspace', {
          method: 'PUT',
          headers: authHeaders(),
          credentials: 'include',
          body: JSON.stringify({ workspace })
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data?.updatedAt) {
          setLastSyncedAt(data.updatedAt);
        }
        return Boolean(data?.success);
      } catch {
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [token, user, authHeaders]
  );

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
