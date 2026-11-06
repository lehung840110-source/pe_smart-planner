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

// --- Images Store Operations ---
export async function getAllImagesDB(): Promise<SgkImageItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.IMAGES, 'readonly');
      const store = tx.objectStore(STORES.IMAGES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to empty images due to IndexedDB error:', err);
    return [];
  }
}

export async function saveImageDB(image: SgkImageItem): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.put(image);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveImagesDB(images: SgkImageItem[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    store.clear(); // Clear all old records so deleted images do NOT linger!
    images.forEach((img) => store.put(img));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteImageDB(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearImagesDB(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.IMAGES, 'readwrite');
    const store = tx.objectStore(STORES.IMAGES);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
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
