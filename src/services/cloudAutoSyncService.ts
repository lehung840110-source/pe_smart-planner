import { getAccessToken } from './googleAuth';
import { getOrCreateAppFolder } from './googleDriveService';
import {
  SgkImageItem,
  ScenarioItem,
  SchoolSettings,
  LessonRow,
  UserCustomTemplate
} from '../types/gdtc';
import { MasterPlanItem, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { PlanVersionStore, LessonPlanVersion } from '../utils/planVersionHistory';
import { SgkTreeLessonOverride } from '../data/sgkCurriculumTree';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export const CLOUD_SYNC_WORKSPACE_FILENAME = 'SmartPlan_CloudSync_Workspace.json';
export const CLOUD_SYNC_IMAGES_FILENAME = 'SmartPlan_CloudSync_Images.json';
export const CLOUD_AUTOSYNC_PREF_KEY = 'gdtc_cloud_autosync_enabled_v1';

export interface CloudWorkspacePayload {
  schemaVersion: number;
  updatedAt: number;
  sourceHost: string;
  imagesCount: number;
  imagesFingerprint: string;
  schoolSettings: SchoolSettings;
  allMasterPlans: Record<string, MasterPlanItem>;
  planVersionStore: PlanVersionStore;
  userCustomTemplates: UserCustomTemplate[];
  activeCustomTemplateId: string | null;
  scenarios: ScenarioItem[];
  sgkTreeOverrides: Record<string, SgkTreeLessonOverride>;
  activeState: {
    week: number;
    grade: number;
    lessonNum: number;
    topic: string;
    title: string;
    lessonRows: LessonRow[];
  };
}

export interface CloudImagesPayload {
  schemaVersion: number;
  updatedAt: number;
  sourceHost: string;
  imagesFingerprint: string;
  images: SgkImageItem[];
}

export interface LocalSyncSnapshot {
  images: SgkImageItem[];
  scenarios: ScenarioItem[];
  schoolSettings: SchoolSettings;
  allMasterPlans: Record<string, MasterPlanItem>;
  planVersionStore: PlanVersionStore;
  userCustomTemplates: UserCustomTemplate[];
  activeCustomTemplateId: string | null;
  sgkTreeOverrides: Record<string, SgkTreeLessonOverride>;
  activeState: {
    week: number;
    grade: number;
    lessonNum: number;
    topic: string;
    title: string;
    lessonRows: LessonRow[];
  };
}

export interface CloudSyncStatusInfo {
  phase: 'idle' | 'syncing' | 'synced' | 'needs_reconnect' | 'error';
  lastSyncedAt: number | null;
  syncedImageCount: number;
  syncedPlanCount: number;
  lastSummary: string;
  errorMessage: string | null;
  unauthorizedDomain: string | null;
}

export interface TwoWaySyncResult {
  merged: LocalSyncSnapshot;
  didPullChanges: boolean;
  didPushWorkspace: boolean;
  didPushImages: boolean;
  addedImagesFromCloud: number;
  pushedImageCount: number;
  syncedAt: number;
  cloudWorkspaceModifiedTime?: string;
  cloudImagesModifiedTime?: string;
}

/**
 * Computes a fast, deterministic fingerprint of the image library so we only upload
 * the heavy Images JSON bundle to Google Drive when images actually changed.
 */
export function computeImagesFingerprint(images: SgkImageItem[]): string {
  if (!Array.isArray(images) || images.length === 0) return 'empty_0';
  const sorted = [...images]
    .map((img) => {
      const urlLen = img.imgUrl ? img.imgUrl.length : 0;
      const urlHead = img.imgUrl ? img.imgUrl.slice(0, 24) : '';
      const urlTail = img.imgUrl ? img.imgUrl.slice(-16) : '';
      return `${img.id}|${img.title || ''}|${img.grade || ''}|${img.folder || ''}|${img.lessonId || ''}|${img.category || ''}|${img.updatedAt || img.createdAt || 0}|${urlLen}|${urlHead}|${urlTail}`;
    })
    .sort();

  // Lightweight FNV-1a 32-bit hash over the sorted manifest
  let hash = 2166136261;
  for (let i = 0; i < sorted.length; i++) {
    const str = sorted[i];
    for (let j = 0; j < str.length; j++) {
      hash ^= str.charCodeAt(j);
      hash = Math.imul(hash, 16777619);
    }
  }
  return `v1_${images.length}_${(hash >>> 0).toString(16)}`;
}

export function getCloudAutoSyncPref(): boolean {
  try {
    return localStorage.getItem(CLOUD_AUTOSYNC_PREF_KEY) === '1';
  } catch {
    return false;
  }
}

export function setCloudAutoSyncPref(enabled: boolean): void {
  try {
    localStorage.setItem(CLOUD_AUTOSYNC_PREF_KEY, enabled ? '1' : '0');
  } catch {
    // ignore storage quota errors
  }
}

interface DriveSyncFileMeta {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

async function parseDriveError(res: Response, fallback: string): Promise<Error> {
  const txt = await res.text().catch(() => '');
  try {
    const parsed = JSON.parse(txt);
    const msg = parsed?.error?.message || '';
    if (msg.includes('insufficient authentication scopes') || parsed?.error?.status === 'PERMISSION_DENIED') {
      return new Error(
        'Tài khoản Google chưa cấp đủ quyền Google Drive. Vui lòng đăng nhập lại và tích chọn đầy đủ quyền Google Drive.'
      );
    }
    if (res.status === 401) {
      return new Error('Phiên đăng nhập Google Drive đã hết hạn. Vui lòng bấm "Kết nối lại Google Drive" để tiếp tục đồng bộ.');
    }
    if (msg) return new Error(`${fallback}: ${msg}`);
  } catch {
    // ignore json parse failure
  }
  return new Error(`${fallback} (${res.status})`);
}

async function findSyncFileInFolder(
  token: string,
  folderId: string,
  fileName: string
): Promise<DriveSyncFileMeta | null> {
  const q = `name = '${fileName}' and '${folderId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q,
    pageSize: '5',
    fields: 'files(id, name, modifiedTime, size)',
    orderBy: 'modifiedTime desc'
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw await parseDriveError(res, `Không thể tìm tệp đồng bộ ${fileName}`);
  }
  const data = await res.json();
  const files: DriveSyncFileMeta[] = data.files || [];
  return files.length > 0 ? files[0] : null;
}

async function downloadJsonFile<T>(token: string, fileId: string): Promise<T | null> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw await parseDriveError(res, 'Không thể tải dữ liệu đồng bộ từ Google Drive');
  }
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function upsertJsonFileInDrive(
  token: string,
  folderId: string,
  fileName: string,
  existingFileId: string | null,
  payload: unknown
): Promise<DriveSyncFileMeta> {
  const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

  if (existingFileId) {
    // Update existing canonical sync file in-place (zero duplicate clutter on Drive)
    const res = await fetch(
      `${DRIVE_UPLOAD_BASE}/files/${existingFileId}?uploadType=media&fields=id,name,modifiedTime,size`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: jsonBlob
      }
    );
    if (!res.ok) {
      throw await parseDriveError(res, `Không thể cập nhật tệp đồng bộ ${fileName}`);
    }
    return (await res.json()) as DriveSyncFileMeta;
  }

  // Create canonical sync file once inside 'SmartPlan GDTC Pro' folder
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId]
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', jsonBlob);

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,modifiedTime,size`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    }
  );
  if (!res.ok) {
    throw await parseDriveError(res, `Không thể tạo tệp đồng bộ ${fileName}`);
  }
  return (await res.json()) as DriveSyncFileMeta;
}

/**
 * Smart union-merge for image libraries (e.g., 193 images on AI Studio + 50 defaults on Vercel => 193+ images).
 * Never drops custom teacher images when syncing with a fresh browser.
 */
export function smartMergeImages(
  localImages: SgkImageItem[],
  cloudImages: SgkImageItem[]
): { merged: SgkImageItem[]; addedFromCloud: number; changedLocally: boolean } {
  const byId = new Map<string, SgkImageItem>();
  const localIds = new Set<string>();

  const scoreRichness = (img: SgkImageItem): number => {
    let score = 0;
    if (img.lessonId) score += 2;
    if (img.topicId) score += 2;
    if (img.folder) score += 1;
    if (img.caption && img.caption.length > 20) score += 2;
    if (img.imgUrl?.startsWith('data:image/')) score += 3;
    return score;
  };

  for (const img of localImages || []) {
    if (!img?.id || !img?.imgUrl) continue;
    localIds.add(img.id);
    byId.set(img.id, { ...img, selected: false });
  }

  let addedFromCloud = 0;
  let updatedFromCloud = 0;

  for (const cImg of cloudImages || []) {
    if (!cImg?.id || !cImg?.imgUrl) continue;
    const existing = byId.get(cImg.id);
    if (!existing) {
      byId.set(cImg.id, { ...cImg, selected: false });
      addedFromCloud++;
    } else {
      const cTime = cImg.updatedAt || cImg.createdAt || 0;
      const lTime = existing.updatedAt || existing.createdAt || 0;
      const cloudNewer = cTime > lTime;
      const sameTimeRicher = cTime === lTime && scoreRichness(cImg) > scoreRichness(existing);
      if (cloudNewer || sameTimeRicher) {
        byId.set(cImg.id, { ...existing, ...cImg, selected: false });
        updatedFromCloud++;
      }
    }
  }

  const merged = Array.from(byId.values());
  return {
    merged,
    addedFromCloud,
    changedLocally: addedFromCloud > 0 || updatedFromCloud > 0
  };
}

function smartMergePlanVersionStore(
  localStore: PlanVersionStore,
  cloudStore?: PlanVersionStore | null
): { merged: PlanVersionStore; changed: boolean } {
  if (!cloudStore || !cloudStore.versionsByPlanKey) {
    return { merged: localStore, changed: false };
  }

  let changed = false;
  const mergedByKey: Record<string, LessonPlanVersion[]> = {
    ...(localStore?.versionsByPlanKey || {})
  };
  const mergedActive: Record<string, string> = {
    ...(localStore?.activeVersionIdByPlanKey || {})
  };

  for (const [planKey, remoteList] of Object.entries(cloudStore.versionsByPlanKey || {})) {
    const localList = mergedByKey[planKey] || [];
    const byId = new Map<string, LessonPlanVersion>();
    for (const v of localList) {
      if (v?.versionId) byId.set(v.versionId, v);
    }
    for (const v of remoteList || []) {
      if (!v?.versionId) continue;
      const prev = byId.get(v.versionId);
      if (!prev || (v.updatedAt || 0) > (prev.updatedAt || 0)) {
        byId.set(v.versionId, v);
        changed = true;
      }
    }
    const sorted = Array.from(byId.values()).sort((a, b) => a.versionNumber - b.versionNumber);
    mergedByKey[planKey] = sorted;
    const newest = [...sorted].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    if (newest && mergedActive[planKey] !== newest.versionId) {
      mergedActive[planKey] = newest.versionId;
    }
  }

  return {
    merged: {
      versionsByPlanKey: mergedByKey,
      activeVersionIdByPlanKey: mergedActive
    },
    changed
  };
}

function smartMergeAllMasterPlans(
  localPlans: Record<string, MasterPlanItem>,
  cloudPlans: Record<string, MasterPlanItem> | undefined,
  mergedVersionStore: PlanVersionStore,
  cloudIsNewer: boolean
): { merged: Record<string, MasterPlanItem>; changed: boolean } {
  const next: Record<string, MasterPlanItem> = { ...(localPlans || {}) };
  let changed = false;

  if (cloudPlans && typeof cloudPlans === 'object') {
    for (const [key, val] of Object.entries(cloudPlans)) {
      if (!val || typeof val !== 'object') continue;
      const existing = next[key];
      if (!existing) {
        next[key] = normalizeMasterPlan(val);
        changed = true;
      } else if (cloudIsNewer) {
        const cStr = JSON.stringify(val.rows || []);
        const lStr = JSON.stringify(existing.rows || []);
        if (cStr !== lStr || val.title !== existing.title || val.topic !== existing.topic) {
          next[key] = normalizeMasterPlan(val);
          changed = true;
        }
      }
    }
  }

  // Always let the latest version in mergedVersionStore win for each slot
  for (const versions of Object.values(mergedVersionStore.versionsByPlanKey || {})) {
    const latest = [...(versions || [])].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    if (latest?.snapshot) {
      const snap = normalizeMasterPlan(latest.snapshot);
      const shortKey = `k${snap.grade}_t${snap.lessonNum}`;
      next[shortKey] = snap;
      next[`${shortKey}_w${snap.week}`] = snap;
    }
  }

  return { merged: next, changed };
}

function smartMergeCustomTemplates(
  localList: UserCustomTemplate[],
  cloudList?: UserCustomTemplate[]
): { merged: UserCustomTemplate[]; changed: boolean } {
  if (!Array.isArray(cloudList) || cloudList.length === 0) {
    return { merged: localList || [], changed: false };
  }
  let changed = false;
  const map = new Map<string, UserCustomTemplate>();
  for (const tpl of localList || []) {
    if (tpl?.id) map.set(tpl.id, tpl);
  }
  for (const tpl of cloudList) {
    if (!tpl?.id) continue;
    const prev = map.get(tpl.id);
    if (!prev || (tpl.updatedAt || 0) > (prev.updatedAt || 0)) {
      map.set(tpl.id, tpl);
      changed = true;
    }
  }
  return {
    merged: Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    changed
  };
}

function smartMergeScenarios(
  localList: ScenarioItem[],
  cloudList?: ScenarioItem[]
): { merged: ScenarioItem[]; changed: boolean } {
  if (!Array.isArray(cloudList) || cloudList.length === 0) {
    return { merged: localList || [], changed: false };
  }
  let changed = false;
  const map = new Map<string, ScenarioItem>();
  for (const sc of localList || []) {
    if (sc?.id) map.set(sc.id, sc);
  }
  for (const sc of cloudList) {
    if (!sc?.id) continue;
    if (!map.has(sc.id)) {
      map.set(sc.id, sc);
      changed = true;
    }
  }
  return { merged: Array.from(map.values()), changed };
}

function smartMergeTreeOverrides(
  localOverrides: Record<string, SgkTreeLessonOverride>,
  cloudOverrides?: Record<string, SgkTreeLessonOverride>,
  cloudIsNewer = false
): { merged: Record<string, SgkTreeLessonOverride>; changed: boolean } {
  if (!cloudOverrides || typeof cloudOverrides !== 'object') {
    return { merged: localOverrides || {}, changed: false };
  }
  const merged: Record<string, SgkTreeLessonOverride> = { ...(localOverrides || {}) };
  let changed = false;
  for (const [lessonId, ov] of Object.entries(cloudOverrides)) {
    if (!ov) continue;
    const prev = merged[lessonId];
    if (!prev) {
      merged[lessonId] = ov;
      changed = true;
    } else if (cloudIsNewer) {
      const combined = { ...prev, ...ov };
      if (JSON.stringify(combined) !== JSON.stringify(prev)) {
        merged[lessonId] = combined;
        changed = true;
      }
    }
  }
  return { merged, changed };
}

/**
 * Lightweight check on Drive to see if either sync file was modified remotely
 * since our last sync timestamp (used on window focus / platform switching).
 */
export async function checkCloudHasNewerUpdate(lastKnownSyncedAt: number | null): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const folderId = await getOrCreateAppFolder();
  const [wsMeta, imgMeta] = await Promise.all([
    findSyncFileInFolder(token, folderId, CLOUD_SYNC_WORKSPACE_FILENAME),
    findSyncFileInFolder(token, folderId, CLOUD_SYNC_IMAGES_FILENAME)
  ]);

  if (!wsMeta && !imgMeta) return false;
  if (!lastKnownSyncedAt) return true;

  const wsTime = wsMeta?.modifiedTime ? Date.parse(wsMeta.modifiedTime) : 0;
  const imgTime = imgMeta?.modifiedTime ? Date.parse(imgMeta.modifiedTime) : 0;
  const latestCloudTime = Math.max(wsTime, imgTime);

  // Add 3s tolerance for clock skew
  return latestCloudTime > lastKnownSyncedAt + 3000;
}

/**
 * Full 2-Way Smart Merge Synchronization with Google Drive.
 * 1. Pulls existing cloud Workspace & Images bundles (if any).
 * 2. Smart-merges with local IndexedDB state (union images so 193 images are never lost!).
 * 3. Pushes back to Drive only what is missing or newer on Drive.
 */
export async function performTwoWayCloudSync(
  local: LocalSyncSnapshot,
  options?: {
    lastSyncedAt?: number | null;
    forcePushImages?: boolean;
    forcePushWorkspace?: boolean;
    pullOnly?: boolean;
  }
): Promise<TwoWaySyncResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa kết nối Google Drive hoặc phiên đăng nhập đã hết hạn.');
  }

  const folderId = await getOrCreateAppFolder();
  const [wsMeta, imgMeta] = await Promise.all([
    findSyncFileInFolder(token, folderId, CLOUD_SYNC_WORKSPACE_FILENAME),
    findSyncFileInFolder(token, folderId, CLOUD_SYNC_IMAGES_FILENAME)
  ]);

  const localImagesFingerprint = computeImagesFingerprint(local.images);

  // 1. Download workspace metadata from Drive (small & fast)
  const cloudWorkspace = wsMeta
    ? await downloadJsonFile<CloudWorkspacePayload>(token, wsMeta.id)
    : null;

  // 2. Download images bundle ONLY if it exists on Drive AND its fingerprint differs from ours (or workspace missing)
  const shouldDownloadImages =
    Boolean(imgMeta) &&
    (!cloudWorkspace ||
      cloudWorkspace.imagesFingerprint !== localImagesFingerprint ||
      cloudWorkspace.imagesCount !== local.images.length);

  const cloudImagesPayload =
    shouldDownloadImages && imgMeta
      ? await downloadJsonFile<CloudImagesPayload>(token, imgMeta.id)
      : null;

  const lastSynced = options?.lastSyncedAt || 0;
  const cloudUpdatedAt = cloudWorkspace?.updatedAt || 0;
  const cloudIsNewer = cloudUpdatedAt > lastSynced;

  // 3. Smart Merge Images
  const imgMerge = smartMergeImages(local.images, cloudImagesPayload?.images || []);
  const mergedImages = imgMerge.merged;
  const mergedImagesFingerprint = computeImagesFingerprint(mergedImages);

  // 4. Smart Merge Workspace components
  const verMerge = smartMergePlanVersionStore(local.planVersionStore, cloudWorkspace?.planVersionStore);
  const plansMerge = smartMergeAllMasterPlans(
    local.allMasterPlans,
    cloudWorkspace?.allMasterPlans,
    verMerge.merged,
    cloudIsNewer
  );
  const tplMerge = smartMergeCustomTemplates(local.userCustomTemplates, cloudWorkspace?.userCustomTemplates);
  const scMerge = smartMergeScenarios(local.scenarios, cloudWorkspace?.scenarios);
  const treeMerge = smartMergeTreeOverrides(
    local.sgkTreeOverrides,
    cloudWorkspace?.sgkTreeOverrides,
    cloudIsNewer
  );

  const mergedSettings: SchoolSettings =
    cloudWorkspace?.schoolSettings && cloudIsNewer
      ? { ...local.schoolSettings, ...cloudWorkspace.schoolSettings }
      : { ...(cloudWorkspace?.schoolSettings || {}), ...local.schoolSettings };

  const mergedActiveState =
    cloudWorkspace?.activeState && cloudIsNewer && cloudWorkspace.activeState.lessonRows?.length > 0
      ? cloudWorkspace.activeState
      : local.activeState;

  const didPullChanges =
    imgMerge.changedLocally ||
    verMerge.changed ||
    plansMerge.changed ||
    tplMerge.changed ||
    scMerge.changed ||
    treeMerge.changed ||
    (cloudIsNewer && Boolean(cloudWorkspace?.schoolSettings));

  const mergedSnapshot: LocalSyncSnapshot = {
    images: mergedImages,
    scenarios: scMerge.merged,
    schoolSettings: mergedSettings,
    allMasterPlans: plansMerge.merged,
    planVersionStore: verMerge.merged,
    userCustomTemplates: tplMerge.merged,
    activeCustomTemplateId:
      local.activeCustomTemplateId || cloudWorkspace?.activeCustomTemplateId || tplMerge.merged[0]?.id || null,
    sgkTreeOverrides: treeMerge.merged,
    activeState: mergedActiveState
  };

  let didPushImages = false;
  let didPushWorkspace = false;
  let cloudWorkspaceModifiedTime = wsMeta?.modifiedTime;
  let cloudImagesModifiedTime = imgMeta?.modifiedTime;
  const now = Date.now();
  const sourceHost = typeof window !== 'undefined' ? window.location.hostname : 'unknown';

  if (!options?.pullOnly) {
    // Push Images bundle if Drive has no images file yet, or fingerprint differs after merge, or forced
    const cloudFingerprint = cloudImagesPayload?.imagesFingerprint || cloudWorkspace?.imagesFingerprint || '';
    const needPushImages =
      options?.forcePushImages ||
      !imgMeta ||
      cloudFingerprint !== mergedImagesFingerprint ||
      (cloudWorkspace?.imagesCount || 0) !== mergedImages.length;

    if (needPushImages) {
      const imagesPayload: CloudImagesPayload = {
        schemaVersion: 1,
        updatedAt: now,
        sourceHost,
        imagesFingerprint: mergedImagesFingerprint,
        images: mergedImages.map((img) => ({ ...img, selected: false }))
      };
      const updatedImgMeta = await upsertJsonFileInDrive(
        token,
        folderId,
        CLOUD_SYNC_IMAGES_FILENAME,
        imgMeta?.id || null,
        imagesPayload
      );
      cloudImagesModifiedTime = updatedImgMeta.modifiedTime;
      didPushImages = true;
    }

    // Push Workspace bundle if Drive has no workspace file yet, or local had changes/forced/images updated
    const needPushWorkspace =
      options?.forcePushWorkspace ||
      !wsMeta ||
      didPushImages ||
      !cloudWorkspace ||
      !cloudIsNewer;

    if (needPushWorkspace) {
      const wsPayload: CloudWorkspacePayload = {
        schemaVersion: 1,
        updatedAt: now,
        sourceHost,
        imagesCount: mergedImages.length,
        imagesFingerprint: mergedImagesFingerprint,
        schoolSettings: mergedSnapshot.schoolSettings,
        allMasterPlans: mergedSnapshot.allMasterPlans,
        planVersionStore: mergedSnapshot.planVersionStore,
        userCustomTemplates: mergedSnapshot.userCustomTemplates,
        activeCustomTemplateId: mergedSnapshot.activeCustomTemplateId,
        scenarios: mergedSnapshot.scenarios,
        sgkTreeOverrides: mergedSnapshot.sgkTreeOverrides,
        activeState: mergedSnapshot.activeState
      };
      const updatedWsMeta = await upsertJsonFileInDrive(
        token,
        folderId,
        CLOUD_SYNC_WORKSPACE_FILENAME,
        wsMeta?.id || null,
        wsPayload
      );
      cloudWorkspaceModifiedTime = updatedWsMeta.modifiedTime;
      didPushWorkspace = true;
    }
  }

  return {
    merged: mergedSnapshot,
    didPullChanges,
    didPushWorkspace,
    didPushImages,
    addedImagesFromCloud: imgMerge.addedFromCloud,
    pushedImageCount: didPushImages ? mergedImages.length : 0,
    syncedAt: now,
    cloudWorkspaceModifiedTime,
    cloudImagesModifiedTime
  };
}
