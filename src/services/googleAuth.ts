import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  getRedirectResult,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider with Google Drive, Google Docs, and Gmail scopes
export const googleDriveProvider = new GoogleAuthProvider();

// Full Workspace scopes configured in applet
export const GOOGLE_WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/gmail.send'
];

// Alias kept for backwards compatibility
export const GOOGLE_DRIVE_SCOPES = GOOGLE_WORKSPACE_SCOPES;

GOOGLE_WORKSPACE_SCOPES.forEach((scope) => {
  googleDriveProvider.addScope(scope);
});

// Prompt consent with incremental scopes for client-side popup OAuth
googleDriveProvider.setCustomParameters({
  prompt: 'consent',
  include_granted_scopes: 'true'
});

// Flag to indicate ongoing sign-in (with timestamp so stale mobile popup locks self-heal)
let isSigningIn = false;
let signingInStartedAt = 0;
// In-memory token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

/**
 * Detect mobile browsers (iOS Safari, Android Chrome, Samsung Internet, etc.)
 */
export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
    return true;
  }
  return Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
};

/**
 * Detect embedded in-app WebViews (Zalo, Facebook, Messenger, Instagram, Line, TikTok)
 * where Google OAuth explicitly blocks login with 403 disallowed_useragent.
 */
export const getInAppBrowserName = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';
  if (/Zalo/i.test(ua)) return 'Zalo';
  if (/FBAN|FBAV|FB_IAB|Messenger/i.test(ua)) return 'Facebook / Messenger';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/Line\//i.test(ua)) return 'LINE';
  if (/BytedanceWebview|musical_ly|TikTok/i.test(ua)) return 'TikTok';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/; wv\)/i.test(ua)) return 'trình duyệt tích hợp';
  return null;
};

export interface GoogleQuickProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  uid: string;
}

export type GoogleQuickSignInResult =
  | ({ status: 'success' } & GoogleQuickProfile)
  | { status: 'redirecting' }
  | { status: 'cancelled' };

/**
 * Initialize auth listener on application load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Synchronous check for cached in-memory token so callers can invoke googleSignIn()
 * directly inside the user click gesture without losing popup activation.
 */
export const getCachedAccessTokenSync = (): string | null => {
  return cachedAccessToken;
};

/**
 * Sign in with Google Popup and obtain access token for Drive, Docs, and Gmail.
 * Returns null cleanly when the user closes or cancels the popup.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn && Date.now() - signingInStartedAt < 12_000) {
    return null;
  }

  const inAppName = getInAppBrowserName();
  if (inAppName) {
    throw new Error(
      `Trình duyệt tích hợp bên trong ${inAppName} chặn kết nối Google Drive. Vui lòng mở ứng dụng bằng Chrome hoặc Safari trên điện thoại.`
    );
  }

  try {
    isSigningIn = true;
    signingInStartedAt = Date.now();
    const result = await signInWithPopup(auth, googleDriveProvider, browserPopupRedirectResolver);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được OAuth access token từ Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const code = String(error?.code || '');
    const msg = String(error?.message || '').toLowerCase();

    // User closed the Google sign-in window or clicked twice — normal cancellation, not a fatal error
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('popup-closed-by-user') ||
      msg.includes('cancelled-popup-request')
    ) {
      return null;
    }

    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      throw new Error(
        'Trình duyệt đang chặn cửa sổ đăng nhập Google (popup). Vui lòng cho phép popup cho trang này rồi bấm thử lại.'
      );
    }

    if (code !== 'auth/unauthorized-domain') {
      console.warn('Thông báo đăng nhập Google Workspace:', code || error?.message || error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Lightweight Google Sign-In requesting ONLY `gmail.send` scope (no Google Drive read/write prompts)
 * so teachers and Admin can automatically send payment receipts & activation emails in 1 click.
 */
export const googleGmailSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (cachedAccessToken && auth.currentUser) {
    return { user: auth.currentUser, accessToken: cachedAccessToken };
  }
  if (isSigningIn && Date.now() - signingInStartedAt < 12_000) {
    return null;
  }

  const inAppName = getInAppBrowserName();
  if (inAppName) {
    return null;
  }

  const gmailProvider = new GoogleAuthProvider();
  gmailProvider.addScope('https://www.googleapis.com/auth/gmail.send');
  gmailProvider.setCustomParameters({
    prompt: 'select_account',
    include_granted_scopes: 'true'
  });

  try {
    isSigningIn = true;
    signingInStartedAt = Date.now();
    const result = await signInWithPopup(auth, gmailProvider, browserPopupRedirectResolver);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return null;
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const code = String(error?.code || '');
    const msg = String(error?.message || '').toLowerCase();
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-blocked' ||
      msg.includes('popup-closed-by-user') ||
      msg.includes('popup-blocked')
    ) {
      return null;
    }
    return null;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Lightweight 1-tap Google Sign-In for personal account authentication (no password, no Drive consent).
 *
 * IMPORTANT: Never falls back to cross-origin signInWithRedirect (`firebaseapp.com`), because
 * modern Android Chrome, Chrome Custom Tabs, and iOS Safari enforce third-party storage partitioning
 * and throw "Unable to process request due to missing initial state" on redirect return.
 * Instead, stays inside the app and guides the user to 1-tap Personal Email login whenever a mobile
 * browser blocks popups.
 */
export const googleQuickSignIn = async (): Promise<GoogleQuickSignInResult> => {
  // Self-heal stale lock if a previous mobile Safari popup tab was closed without firing close event
  if (isSigningIn && Date.now() - signingInStartedAt < 12_000) {
    return { status: 'cancelled' };
  }

  const inAppName = getInAppBrowserName();
  if (inAppName) {
    throw new Error(
      `Trình duyệt bên trong ${inAppName} chặn cửa sổ Google. Thầy/cô chỉ cần nhập trực tiếp Email cá nhân ngay bên dưới (1 chạm · không cần mật khẩu) để đăng nhập ngay!`
    );
  }

  const basicProvider = new GoogleAuthProvider();
  basicProvider.setCustomParameters({ prompt: 'select_account' });
  const startedAt = Date.now();

  try {
    isSigningIn = true;
    signingInStartedAt = startedAt;
    const result = await signInWithPopup(auth, basicProvider, browserPopupRedirectResolver);
    const u = result.user;
    if (!u?.email) {
      throw new Error('Không lấy được địa chỉ email từ tài khoản Google.');
    }
    return {
      status: 'success',
      email: u.email.trim().toLowerCase(),
      displayName: (u.displayName || '').trim() || u.email.split('@')[0],
      photoURL: u.photoURL || undefined,
      uid: u.uid
    };
  } catch (error: any) {
    const code = String(error?.code || '');
    const msg = String(error?.message || '').toLowerCase();
    const elapsedMs = Date.now() - startedAt;

    const isPopupBlocked = code === 'auth/popup-blocked' || msg.includes('popup-blocked');
    const isUnsupportedEnv =
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/web-storage-unsupported' ||
      msg.includes('missing initial state');
    const isInstantMobileClose =
      isMobileBrowser() &&
      (code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        msg.includes('popup-closed-by-user')) &&
      elapsedMs < 1800;

    if (isPopupBlocked || isUnsupportedEnv || isInstantMobileClose) {
      throw new Error(
        'Trình duyệt trên điện thoại (hoặc tab mở từ ứng dụng khác) đang chặn cửa sổ Google. Thầy/cô hãy nhập trực tiếp Email cá nhân ngay bên dưới (không cần mật khẩu) để vào ngay, hoặc mở link bằng Chrome / Safari!'
      );
    }

    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('popup-closed-by-user') ||
      msg.includes('cancelled-popup-request')
    ) {
      return { status: 'cancelled' };
    }

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      throw new Error(
        'Tên miền hiện tại chưa kích hoạt cửa sổ Google trực tiếp. Thầy/cô chỉ cần nhập Email cá nhân ngay bên dưới (1 chạm · không cần mật khẩu) để đăng nhập!'
      );
    }

    if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      throw new Error(
        'Kết nối mạng khi mở Google chưa ổn định. Vui lòng thử lại hoặc nhập trực tiếp Email cá nhân ngay bên dưới.'
      );
    }

    throw new Error(
      'Không mở được cửa sổ Google trên trình duyệt điện thoại này. Thầy/cô hãy nhập trực tiếp Email cá nhân ngay bên dưới (không cần mật khẩu) để vào ngay!'
    );
  } finally {
    isSigningIn = false;
  }
};

/**
 * Safely check if any pending redirect result exists (kept as a no-op-safe listener for compatibility).
 */
export const consumeGoogleRedirectResult = async (): Promise<{
  profile?: GoogleQuickProfile;
  error?: string;
}> => {
  try {
    const result = await getRedirectResult(auth, browserPopupRedirectResolver);
    const redirectEmail = result?.user?.email;
    if (result?.user && redirectEmail) {
      const u = result.user;
      return {
        profile: {
          email: redirectEmail.trim().toLowerCase(),
          displayName: (u.displayName || '').trim() || redirectEmail.split('@')[0],
          photoURL: u.photoURL || undefined,
          uid: u.uid
        }
      };
    }
    return {};
  } catch {
    return {};
  }
};

/**
 * Get cached access token in memory
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out and clear cached token
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
