import { SgkImageItem, ScenarioItem, SchoolSettings, LessonRow } from '../types/gdtc';

const DB_NAME = 'SmartPlanGDTC_DB';
const DB_VERSION = 1;

export const STORES = {
  IMAGES: 'images',
  SCENARIOS: 'scenarios',
  APP_STATE: 'app_state',
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.IMAGES)) {
        db.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SCENARIOS)) {
        db.createObjectStore(STORES.SCENARIOS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
        db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

const MAX_LS_MIRROR_CHARS = 350_000;

export function pruneDisposableLocalStorageCaches(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem('gdtc_user_custom_images');
    localStorage.removeItem('gdtc_sgk_images');
    const draftIdxRaw = localStorage.getItem('gdtc_draft_index');
    if (draftIdxRaw) {
      const keys: string[] = JSON.parse(draftIdxRaw);
      if (Array.isArray(keys)) {
        // Keep only the 3 smallest/most recent draft keys when reclaiming quota
        while (keys.length > 3) {
          const oldKey = keys.pop();
          if (oldKey) localStorage.removeItem(`gdtc_v1_draft_${oldKey}`);
        }
        localStorage.setItem('gdtc_draft_index', JSON.stringify(keys));
      }
    }
  } catch {
    // ignore storage access errors
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    pruneDisposableLocalStorageCaches();
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

function mirrorLightweightCustomImages(images: SgkImageItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const customImages = images.filter(isUserCustomImage);
    if (customImages.length === 0) return;

    // Only keep lightweight entries in localStorage mirror; IndexedDB holds full high-res base64 images
    const compact: SgkImageItem[] = [];
    let approxBytes = 2;
    for (const img of customImages.slice(0, 40)) {
      const urlLen = img.imgUrl?.length || 0;
      if (urlLen > 80_000) continue;
      const serialized = JSON.stringify(img);
      if (approxBytes + serialized.length + 1 > MAX_LS_MIRROR_CHARS) break;
      compact.push(img);
      approxBytes += serialized.length + 1;
    }

    if (compact.length > 0) {
      safeLocalStorageSet('gdtc_user_custom_images', JSON.stringify(compact));
    } else {
      // Remove stale bloated mirror key so small settings never hit QuotaExceededError
      localStorage.removeItem('gdtc_user_custom_images');
    }
  } catch {
    // IndexedDB already persisted all images cleanly
  }
}

// --- Images Store Operations ---
export async function getAllImagesDB(): Promise<SgkImageItem[]> {
  let idbImages: SgkImageItem[] = [];
  try {
    const db = await openDatabase();
    idbImages = await new Promise<SgkImageItem[]>((resolve, reject) => {
      const tx = db.transaction(STORES.IMAGES, 'readonly');
      const store = tx.objectStore(STORES.IMAGES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage mirror silently
  }

  // Also check localStorage mirror for any user custom / scanned images
  let customMirror: SgkImageItem[] = [];
  try {
    const raw = localStorage.getItem('gdtc_user_custom_images');
    if (raw) {
      customMirror = JSON.parse(raw);
      // Clean up legacy multi-megabyte mirror key once IndexedDB already holds images
      if (idbImages.length > 0 && raw.length > MAX_LS_MIRROR_CHARS) {
        localStorage.removeItem('gdtc_user_custom_images');
      }
    }
  } catch {
    // ignore JSON error
  }

  // Merge unique by ID
  const map = new Map<string, SgkImageItem>();
  idbImages.forEach((img) => map.set(img.id, img));
  customMirror.forEach((img) => {
    if (!map.has(img.id)) {
      map.set(img.id, img);
    }
  });

  return Array.from(map.values());
}

// Helper to determine if an image is user-created (scanned, uploaded, or generated) vs factory default
export function isUserCustomImage(image: SgkImageItem): boolean {
  if (!image || !image.id) return false;
  // Factory default images begin with 'img_sgk_' or 'img_default_'
  if (image.id.startsWith('img_sgk_') || image.id.startsWith('img_default_')) {
    return false;
  }
  return (
    image.id.startsWith('crop_') ||
    image.id.startsWith('img_user_') ||
    image.id.startsWith('img_ai_') ||
    image.id.startsWith('zip_') ||
    image.id.startsWith('custom_') ||
    Boolean(image.createdAt && image.createdAt > 1700000000000)
  );
}

export async function saveImageDB(image: SgkImageItem): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.put(image);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.onabort = () => reject(new Error('Transaction aborted'));
  });

  if (isUserCustomImage(image) && (image.imgUrl?.length || 0) <= 80_000) {
    try {
      const raw = localStorage.getItem('gdtc_user_custom_images');
      const list: SgkImageItem[] = raw ? JSON.parse(raw) : [];
      const updated = [image, ...list.filter((it) => it.id !== image.id)];
      mirrorLightweightCustomImages(updated);
    } catch {
      // IndexedDB preserved
    }
  }
}

export async function saveImagesDB(images: SgkImageItem[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);

    // Retrieve all existing keys to safely remove deleted ones without clearing entire DB
    const getKeysReq = store.getAllKeys();
    getKeysReq.onsuccess = () => {
      const existingKeys = new Set((getKeysReq.result || []).map(String));
      const incomingKeys = new Set(images.map((img) => String(img.id)));

      // Delete only keys that were removed
      existingKeys.forEach((key) => {
        if (!incomingKeys.has(key)) {
          store.delete(key);
        }
      });

      // Put all current images
      images.forEach((img) => {
        store.put(img);
      });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error('Transaction aborted'));
  });

  mirrorLightweightCustomImages(images);
}

export async function deleteImageDB(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Remove from localStorage mirror as well
  try {
    const raw = localStorage.getItem('gdtc_user_custom_images');
    if (raw) {
      const list: SgkImageItem[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id);
      safeLocalStorageSet('gdtc_user_custom_images', JSON.stringify(filtered));
    }
  } catch {}
}

export async function clearImagesDB(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  try {
    localStorage.removeItem('gdtc_user_custom_images');
  } catch {}
}

// --- Scenarios Store Operations ---
export async function getAllScenariosDB(): Promise<ScenarioItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SCENARIOS, 'readonly');
      const store = tx.objectStore(STORES.SCENARIOS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveScenariosDB(scenarios: ScenarioItem[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SCENARIOS, 'readwrite');
    const store = tx.objectStore(STORES.SCENARIOS);
    scenarios.forEach((sc) => store.put(sc));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteScenarioDB(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SCENARIOS, 'readwrite');
    const store = tx.objectStore(STORES.SCENARIOS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- App State Store Operations (key-value) ---
export async function getAppStateDB<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.APP_STATE, 'readonly');
      const store = tx.objectStore(STORES.APP_STATE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
          resolve(defaultValue);
        }
      };
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function setAppStateDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.APP_STATE, 'readwrite');
      const store = tx.objectStore(STORES.APP_STATE);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Error saving state to IndexedDB', e);
  }
}

// Estimate storage size currently used in IndexedDB
export async function getStorageEstimate(): Promise<{ usedMB: string; quotaMB: string }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = (estimate.usage || 0) / (1024 * 1024);
      const quota = (estimate.quota || 0) / (1024 * 1024);
      return {
        usedMB: used.toFixed(2),
        quotaMB: quota > 0 ? (quota > 1024 ? `${(quota / 1024).toFixed(1)} GB` : `${quota.toFixed(0)} MB`) : 'Không giới hạn',
      };
    } catch {
      // fallback
    }
  }
  return { usedMB: '0.00', quotaMB: 'Chuẩn IndexedDB' };
}
