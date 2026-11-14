import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  schoolName: string;
  role: 'teacher' | 'admin';
  createdAt: number;
  lastLoginAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    schoolName: string;
  }) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  pullWorkspace: () => Promise<any | null>;
  pushWorkspace: (workspace: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_STORAGE_KEY = 'gdtc_auth_token_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

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

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Đăng nhập thất bại.' };
      }
      if (data.token) {
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        } catch {}
        setToken(data.token);
      }
      setUser(data.user);
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
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Đăng ký tài khoản thất bại.' };
      }
      if (data.token) {
        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        } catch {}
        setToken(data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
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
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
    setToken(null);
    setUser(null);
    setLastSyncedAt(null);
  };

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
        login,
        register,
        logout,
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
