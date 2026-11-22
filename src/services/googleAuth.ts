import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
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

// Flag to indicate ongoing sign-in
let isSigningIn = false;
// In-memory token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

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
  if (isSigningIn) {
    return null;
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleDriveProvider);
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
 * Lightweight 1-tap Google Sign-In for personal account authentication (no password, no Drive consent).
 * Returns basic profile info cleanly, or null if the user closes the popup.
 */
export const googleQuickSignIn = async (): Promise<{
  email: string;
  displayName: string;
  photoURL?: string;
  uid: string;
} | null> => {
  if (isSigningIn) {
    return null;
  }
  const basicProvider = new GoogleAuthProvider();
  basicProvider.setCustomParameters({ prompt: 'select_account' });
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, basicProvider);
    const u = result.user;
    if (!u?.email) {
      throw new Error('Không lấy được địa chỉ email từ tài khoản Google.');
    }
    return {
      email: u.email.trim().toLowerCase(),
      displayName: (u.displayName || '').trim() || u.email.split('@')[0],
      photoURL: u.photoURL || undefined,
      uid: u.uid
    };
  } catch (error: any) {
    const code = String(error?.code || '');
    const msg = String(error?.message || '').toLowerCase();
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
        'Trình duyệt đang chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup hoặc nhập Email cá nhân bên dưới.'
      );
    }
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      throw new Error(
        'Tên miền hiện tại chưa kích hoạt popup Google. Vui lòng nhập trực tiếp Email cá nhân bên dưới (không cần mật khẩu).'
      );
    }
    throw error;
  } finally {
    isSigningIn = false;
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
