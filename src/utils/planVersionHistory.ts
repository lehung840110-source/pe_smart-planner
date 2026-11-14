import { MasterPlanItem, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { DiagramAttachment, LessonRow } from '../types/gdtc';
import { getAppStateDB, setAppStateDB } from './db';

export type PlanVersionStatus = 'draft' | 'saved' | 'best';

export interface PlanDiffDetail {
  id: string;
  section: string;
  label: string;
  before: string;
  after: string;
}

export interface LessonPlanVersion {
  versionId: string;
  planKey: string; // e.g. plan_w9_k1_t17
  week: number;
  grade: 1 | 3 | 5;
  lessonNum: number;
  title: string;
  topic: string;
  versionNumber: number;
  createdAt: number;
  updatedAt: number;
  status: PlanVersionStatus;
  isStarredBest: boolean;
  sourceTab: 'tab-generator' | 'tab-export' | 'auto';
  label: string;
  changeSummary: string[];
  diffDetails: PlanDiffDetail[];
  snapshot: MasterPlanItem;
}

export interface PlanVersionStore {
  versionsByPlanKey: Record<string, LessonPlanVersion[]>;
  activeVersionIdByPlanKey: Record<string, string>;
}

const DB_VERSION_STORE_KEY = 'gdtc_plan_version_store_v1';
const LS_DRAFT_PREFIX = 'gdtc_draft_latest_';

export function getPlanVersionKey(week: number, grade: number, lessonNum: number): string {
  return `plan_w${Number(week)}_k${Number(grade)}_t${Number(lessonNum)}`;
}

function deepClonePlan(plan: MasterPlanItem): MasterPlanItem {
  return JSON.parse(JSON.stringify(normalizeMasterPlan(plan)));
}

function normalizeStr(s?: string): string {
  return (s || '').replace(/\r\n/g, '\n').trim();
}

function extractRowHeading(row?: LessonRow, idx: number = 0): string {
  if (!row?.content) return `Dòng ${idx + 1}`;
  const firstLine = row.content.split('\n').map((l) => l.trim()).find(Boolean) || '';
  const cleaned = firstLine.replace(/^[*+\-–]\s*/, '').trim();
  const short = cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
  return `Dòng ${idx + 1}${short ? ` (${short})` : ''}`;
}

function getRowContentImagesSummary(row?: LessonRow): string {
  if (!row) return '(Không có ảnh)';
  const list: DiagramAttachment[] =
    row.contentImages && row.contentImages.length > 0
      ? row.contentImages
      : row.contentImgUrl
      ? [{ id: 'single', url: row.contentImgUrl, title: row.contentImgTitle || 'Ảnh đính kèm' }]
      : [];
  if (list.length === 0) return '(Không có ảnh)';
  return list.map((img) => `${img.title || 'Ảnh'} [${img.url.slice(0, 48)}]`).join(' | ');
}

function getRowHsImagesSummary(row?: LessonRow): string {
  if (!row) return '(Không có sơ đồ)';
  const list: DiagramAttachment[] =
    row.hsImages && row.hsImages.length > 0
      ? row.hsImages
      : row.hsImgUrl
      ? [{ id: 'single', url: row.hsImgUrl, title: row.hsImgTitle || 'Sơ đồ' }]
      : [];
  if (list.length === 0) return '(Không có sơ đồ)';
  return list.map((img) => img.title || 'Sơ đồ').join(' | ');
}

function truncatePreview(val: string, maxLen: number = 180): string {
  const clean = normalizeStr(val);
  if (!clean) return '(Trống)';
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}...` : clean;
}

/**
 * Computes human-readable summary & field-by-field before/after diff between two lesson plans.
 */
export function computePlanDiff(
  prevPlan: MasterPlanItem | null | undefined,
  nextPlan: MasterPlanItem
): { changeSummary: string[]; diffDetails: PlanDiffDetail[] } {
  const next = normalizeMasterPlan(nextPlan);
  if (!prevPlan) {
    return {
      changeSummary: ['Lưu phiên bản giáo án mới'],
      diffDetails: []
    };
  }

  const prev = normalizeMasterPlan(prevPlan);
  const summary: string[] = [];
  const details: PlanDiffDetail[] = [];

  // 1. Metadata
  if (normalizeStr(prev.title) !== normalizeStr(next.title)) {
    summary.push('Sửa Tên bài học');
    details.push({
      id: `meta_title_${details.length}`,
      section: 'Thông tin chung',
      label: 'Tên bài học',
      before: truncatePreview(prev.title),
      after: truncatePreview(next.title)
    });
  }
  if (normalizeStr(prev.topic) !== normalizeStr(next.topic)) {
    summary.push('Sửa Chủ đề');
    details.push({
      id: `meta_topic_${details.length}`,
      section: 'Thông tin chung',
      label: 'Chủ đề',
      before: truncatePreview(prev.topic),
      after: truncatePreview(next.topic)
    });
  }
  if (normalizeStr(prev.dateRange) !== normalizeStr(next.dateRange)) {
    summary.push('Cập nhật Thời gian tuần học');
    details.push({
      id: `meta_date_${details.length}`,
      section: 'Thông tin chung',
      label: 'Thời gian',
      before: truncatePreview(prev.dateRange),
      after: truncatePreview(next.dateRange)
    });
  }

  // 2. Competencies & Integrations
  const specFields: Array<{ key: keyof MasterPlanItem['specialCompetencies']; label: string }> = [
    { key: 'healthCare', label: 'Chăm sóc sức khỏe' },
    { key: 'basicMovement', label: 'Vận động cơ bản' },
    { key: 'sportsCompetency', label: 'Hoạt động TDTT' },
    { key: 'disabledStudents', label: 'HS khuyết tật (Đặc thù)' }
  ];
  specFields.forEach((f) => {
    const a = normalizeStr(prev.specialCompetencies?.[f.key]);
    const b = normalizeStr(next.specialCompetencies?.[f.key]);
    if (a !== b) {
      summary.push(`Sửa Năng lực đặc thù (${f.label})`);
      details.push({
        id: `spec_${f.key}_${details.length}`,
        section: 'I. Yêu cầu cần đạt',
        label: `Năng lực đặc thù · ${f.label}`,
        before: truncatePreview(a),
        after: truncatePreview(b)
      });
    }
  });

  const genFields: Array<{ key: keyof MasterPlanItem['generalCompetencies']; label: string }> = [
    { key: 'autonomy', label: 'Tự chủ & Tự học' },
    { key: 'collaboration', label: 'Giao tiếp & Hợp tác' },
    { key: 'problemSolving', label: 'Giải quyết vấn đề' },
    { key: 'disabledStudents', label: 'HS khuyết tật (Chung)' }
  ];
  genFields.forEach((f) => {
    const a = normalizeStr(prev.generalCompetencies?.[f.key]);
    const b = normalizeStr(next.generalCompetencies?.[f.key]);
    if (a !== b) {
      summary.push(`Sửa Năng lực chung (${f.label})`);
      details.push({
        id: `gen_${f.key}_${details.length}`,
        section: 'I. Yêu cầu cần đạt',
        label: `Năng lực chung · ${f.label}`,
        before: truncatePreview(a),
        after: truncatePreview(b)
      });
    }
  });

  if (
    normalizeStr(prev.qualities?.diligence) !== normalizeStr(next.qualities?.diligence) ||
    normalizeStr(prev.qualities?.honesty) !== normalizeStr(next.qualities?.honesty) ||
    normalizeStr(prev.qualities?.responsibility) !== normalizeStr(next.qualities?.responsibility) ||
    normalizeStr(prev.qualities?.disabledStudents) !== normalizeStr(next.qualities?.disabledStudents)
  ) {
    summary.push('Sửa mục Phẩm chất');
    details.push({
      id: `qualities_${details.length}`,
      section: 'I. Yêu cầu cần đạt',
      label: 'Phẩm chất chủ yếu',
      before: truncatePreview(
        `${prev.qualities?.diligence || ''} ${prev.qualities?.honesty || ''} ${prev.qualities?.responsibility || ''} ${prev.qualities?.disabledStudents || ''}`
      ),
      after: truncatePreview(
        `${next.qualities?.diligence || ''} ${next.qualities?.honesty || ''} ${next.qualities?.responsibility || ''} ${next.qualities?.disabledStudents || ''}`
      )
    });
  }

  if (
    normalizeStr(prev.integrations?.digitalSkill) !== normalizeStr(next.integrations?.digitalSkill) ||
    normalizeStr(prev.integrations?.digitalDescription) !== normalizeStr(next.integrations?.digitalDescription) ||
    normalizeStr(prev.integrations?.lifeSkills) !== normalizeStr(next.integrations?.lifeSkills) ||
    normalizeStr(prev.integrations?.environmentalEducation) !== normalizeStr(next.integrations?.environmentalEducation)
  ) {
    summary.push('Sửa Nội dung tích hợp (NLS, QPAN, Môi trường)');
    details.push({
      id: `integ_${details.length}`,
      section: 'Nội dung tích hợp',
      label: 'Tích hợp NLS / QPAN / Môi trường',
      before: truncatePreview(`${prev.integrations?.digitalSkill}: ${prev.integrations?.digitalDescription}`),
      after: truncatePreview(`${next.integrations?.digitalSkill}: ${next.integrations?.digitalDescription}`)
    });
  }

  if (
    normalizeStr(prev.locationEquipment?.location) !== normalizeStr(next.locationEquipment?.location) ||
    normalizeStr(prev.locationEquipment?.teacherTools) !== normalizeStr(next.locationEquipment?.teacherTools) ||
    normalizeStr(prev.locationEquipment?.studentTools) !== normalizeStr(next.locationEquipment?.studentTools)
  ) {
    summary.push('Sửa II. Đồ dùng & Địa điểm dạy học');
    details.push({
      id: `loc_${details.length}`,
      section: 'II. Đồ dùng dạy học',
      label: 'Địa điểm & Chuẩn bị GV/HS',
      before: truncatePreview(`${prev.locationEquipment?.location} · ${prev.locationEquipment?.teacherTools} · ${prev.locationEquipment?.studentTools}`),
      after: truncatePreview(`${next.locationEquipment?.location} · ${next.locationEquipment?.teacherTools} · ${next.locationEquipment?.studentTools}`)
    });
  }

  if (normalizeStr(prev.postLessonAdjustment) !== normalizeStr(next.postLessonAdjustment)) {
    summary.push('Sửa IV. Điều chỉnh sau bài dạy');
    details.push({
      id: `adj_${details.length}`,
      section: 'IV. Điều chỉnh sau bài dạy',
      label: 'Nội dung điều chỉnh',
      before: truncatePreview(prev.postLessonAdjustment || ''),
      after: truncatePreview(next.postLessonAdjustment || '')
    });
  }

  // 3. Teaching Activity Rows
  const prevRows = prev.rows || [];
  const nextRows = next.rows || [];
  if (prevRows.length !== nextRows.length) {
    summary.push(`Thay đổi số dòng hoạt động (${prevRows.length} → ${nextRows.length} dòng)`);
    details.push({
      id: `row_count_${details.length}`,
      section: 'III. Hoạt động dạy học',
      label: 'Số lượng dòng hoạt động',
      before: `${prevRows.length} dòng`,
      after: `${nextRows.length} dòng`
    });
  }

  const maxRows = Math.max(prevRows.length, nextRows.length);
  for (let i = 0; i < maxRows; i++) {
    const rPrev = prevRows[i];
    const rNext = nextRows[i];
    const rowTitle = extractRowHeading(rNext || rPrev, i);

    if (!rPrev && rNext) {
      summary.push(`Thêm ${rowTitle}`);
      details.push({
        id: `row_add_${i}`,
        section: 'III. Hoạt động dạy học',
        label: `Thêm ${rowTitle}`,
        before: '(Chưa có dòng này)',
        after: truncatePreview(rNext.content)
      });
      continue;
    }
    if (rPrev && !rNext) {
      summary.push(`Xóa ${rowTitle}`);
      details.push({
        id: `row_del_${i}`,
        section: 'III. Hoạt động dạy học',
        label: `Xóa ${rowTitle}`,
        before: truncatePreview(rPrev.content),
        after: '(Đã xóa)'
      });
      continue;
    }
    if (!rPrev || !rNext) continue;

    const changedParts: string[] = [];
    if (normalizeStr(rPrev.content) !== normalizeStr(rNext.content)) {
      changedParts.push('Nội dung Cột 1');
      details.push({
        id: `row_${i}_content`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Cột 1 (Nội dung)`,
        before: truncatePreview(rPrev.content),
        after: truncatePreview(rNext.content)
      });
    }
    if (normalizeStr(rPrev.lvd) !== normalizeStr(rNext.lvd)) {
      changedParts.push('LVĐ Cột 2');
      details.push({
        id: `row_${i}_lvd`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Cột 2 (LVĐ)`,
        before: truncatePreview(rPrev.lvd),
        after: truncatePreview(rNext.lvd)
      });
    }
    if (normalizeStr(rPrev.gv) !== normalizeStr(rNext.gv)) {
      changedParts.push('Hoạt động GV Cột 3');
      details.push({
        id: `row_${i}_gv`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Cột 3 (GV)`,
        before: truncatePreview(rPrev.gv),
        after: truncatePreview(rNext.gv)
      });
    }
    if (normalizeStr(rPrev.hs) !== normalizeStr(rNext.hs)) {
      changedParts.push('Hoạt động HS Cột 4');
      details.push({
        id: `row_${i}_hs`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Cột 4 (HS)`,
        before: truncatePreview(rPrev.hs),
        after: truncatePreview(rNext.hs)
      });
    }

    const prevContentImg = getRowContentImagesSummary(rPrev);
    const nextContentImg = getRowContentImagesSummary(rNext);
    if (prevContentImg !== nextContentImg) {
      changedParts.push('Ảnh động tác/trò chơi Cột 1');
      details.push({
        id: `row_${i}_cimg`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Ảnh minh họa Cột 1`,
        before: prevContentImg,
        after: nextContentImg
      });
    }

    const prevHsImg = getRowHsImagesSummary(rPrev);
    const nextHsImg = getRowHsImagesSummary(rNext);
    if (prevHsImg !== nextHsImg) {
      changedParts.push('Sơ đồ đội hình Cột 4');
      details.push({
        id: `row_${i}_hsimg`,
        section: 'III. Hoạt động dạy học',
        label: `${rowTitle} · Sơ đồ Cột 4`,
        before: prevHsImg,
        after: nextHsImg
      });
    }

    if (changedParts.length > 0) {
      summary.push(`Sửa ${rowTitle}: ${changedParts.join(', ')}`);
    }
  }

  return {
    changeSummary: summary.slice(0, 12),
    diffDetails: details.slice(0, 24)
  };
}

export function hasMeaningfulPlanChanges(
  a: MasterPlanItem | null | undefined,
  b: MasterPlanItem
): boolean {
  if (!a) return true;
  const diff = computePlanDiff(a, b);
  return diff.diffDetails.length > 0 || diff.changeSummary.length > 0;
}

export function getVersionsForPlan(
  store: PlanVersionStore,
  week: number,
  grade: number,
  lessonNum: number
): LessonPlanVersion[] {
  const key = getPlanVersionKey(week, grade, lessonNum);
  const list = store.versionsByPlanKey?.[key] || [];
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt || b.versionNumber - a.versionNumber);
}

/**
 * Returns the version that MUST be displayed by default:
 * 1. If the user explicitly selected/restored an active version in this session -> that version.
 * 2. Otherwise -> ALWAYS the most recently modified version (highest updatedAt: draft or saved),
 *    NEVER reverting to factory defaults when user edits exist.
 */
export function getPreferredVersionForPlan(
  store: PlanVersionStore,
  week: number,
  grade: number,
  lessonNum: number
): LessonPlanVersion | null {
  const key = getPlanVersionKey(week, grade, lessonNum);
  const versions = getVersionsForPlan(store, week, grade, lessonNum);
  if (versions.length === 0) return null;

  const activeId = store.activeVersionIdByPlanKey?.[key];
  if (activeId) {
    const found = versions.find((v) => v.versionId === activeId);
    if (found) return found;
  }

  // Default to the latest edited version
  return versions[0];
}

export function getUnfinishedDraftForPlan(
  store: PlanVersionStore,
  week: number,
  grade: number,
  lessonNum: number
): LessonPlanVersion | null {
  const versions = getVersionsForPlan(store, week, grade, lessonNum);
  return versions.find((v) => v.status === 'draft') || null;
}

export function getBestVersionForPlan(
  store: PlanVersionStore,
  week: number,
  grade: number,
  lessonNum: number
): LessonPlanVersion | null {
  const versions = getVersionsForPlan(store, week, grade, lessonNum);
  return versions.find((v) => v.isStarredBest || v.status === 'best') || null;
}

const STRIPPED_MEDIA_TOKEN = '__STRIPPED_MEDIA__';

function createCompactMirrorVersion(version: LessonPlanVersion): LessonPlanVersion {
  const stripLargeUrl = (url?: string) =>
    url && url.length > 12_000 ? STRIPPED_MEDIA_TOKEN : url;

  return {
    ...version,
    snapshot: {
      ...version.snapshot,
      rows: (version.snapshot.rows || []).map((row) => ({
        ...row,
        contentImgUrl: stripLargeUrl(row.contentImgUrl),
        gvImgUrl: stripLargeUrl(row.gvImgUrl),
        hsImgUrl: stripLargeUrl(row.hsImgUrl),
        contentImages: row.contentImages?.map((img) => ({ ...img, url: stripLargeUrl(img.url) || img.url })),
        gvImages: row.gvImages?.map((img) => ({ ...img, url: stripLargeUrl(img.url) || img.url })),
        hsImages: row.hsImages?.map((img) => ({ ...img, url: stripLargeUrl(img.url) || img.url }))
      }))
    }
  };
}

function rehydrateStrippedMedia(
  mirror: LessonPlanVersion,
  dbFallback?: LessonPlanVersion | null
): LessonPlanVersion {
  if (!dbFallback?.snapshot?.rows) return mirror;
  const dbRows = dbFallback.snapshot.rows;
  return {
    ...mirror,
    snapshot: normalizeMasterPlan({
      ...mirror.snapshot,
      rows: (mirror.snapshot.rows || []).map((row, idx) => {
        const refRow = dbRows[idx];
        if (!refRow) return row;
        return {
          ...row,
          contentImgUrl: row.contentImgUrl === STRIPPED_MEDIA_TOKEN ? refRow.contentImgUrl : row.contentImgUrl,
          gvImgUrl: row.gvImgUrl === STRIPPED_MEDIA_TOKEN ? refRow.gvImgUrl : row.gvImgUrl,
          hsImgUrl: row.hsImgUrl === STRIPPED_MEDIA_TOKEN ? refRow.hsImgUrl : row.hsImgUrl,
          contentImages: row.contentImages?.map((img, i) => ({
            ...img,
            url: img.url === STRIPPED_MEDIA_TOKEN ? (refRow.contentImages?.[i]?.url || refRow.contentImgUrl || '') : img.url
          })).filter((img) => Boolean(img.url) && img.url !== STRIPPED_MEDIA_TOKEN),
          gvImages: row.gvImages?.map((img, i) => ({
            ...img,
            url: img.url === STRIPPED_MEDIA_TOKEN ? (refRow.gvImages?.[i]?.url || refRow.gvImgUrl || '') : img.url
          })).filter((img) => Boolean(img.url) && img.url !== STRIPPED_MEDIA_TOKEN),
          hsImages: row.hsImages?.map((img, i) => ({
            ...img,
            url: img.url === STRIPPED_MEDIA_TOKEN ? (refRow.hsImages?.[i]?.url || refRow.hsImgUrl || '') : img.url
          })).filter((img) => Boolean(img.url) && img.url !== STRIPPED_MEDIA_TOKEN)
        };
      })
    })
  };
}

function mirrorLatestDraftToLocalStorage(planKey: string, version: LessonPlanVersion) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    let payloadToStore = version;
    let serialized = JSON.stringify(payloadToStore);

    if (serialized.length > 260_000) {
      payloadToStore = createCompactMirrorVersion(version);
      serialized = JSON.stringify(payloadToStore);
    }

    const indexRaw = localStorage.getItem('gdtc_draft_index');
    const indexKeys: string[] = indexRaw ? JSON.parse(indexRaw) : [];

    // Still skip only if even text-only compact snapshot exceeds 260KB
    if (serialized.length > 260_000) {
      localStorage.removeItem(`${LS_DRAFT_PREFIX}${planKey}`);
      const filtered = indexKeys.filter((k) => k !== planKey);
      localStorage.setItem('gdtc_draft_index', JSON.stringify(filtered));
      return;
    }

    const nextIndex = [planKey, ...indexKeys.filter((k) => k !== planKey)];
    while (nextIndex.length > 6) {
      const removed = nextIndex.pop();
      if (removed) localStorage.removeItem(`${LS_DRAFT_PREFIX}${removed}`);
    }
    localStorage.setItem('gdtc_draft_index', JSON.stringify(nextIndex));
    localStorage.setItem(`${LS_DRAFT_PREFIX}${planKey}`, serialized);
  } catch {
    // Reclaim disposable caches silently; IndexedDB still holds the full draft
    try {
      localStorage.removeItem('gdtc_user_custom_images');
      const indexRaw = localStorage.getItem('gdtc_draft_index');
      const keys: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      while (keys.length > 2) {
        const removed = keys.pop();
        if (removed) localStorage.removeItem(`${LS_DRAFT_PREFIX}${removed}`);
      }
      localStorage.setItem('gdtc_draft_index', JSON.stringify(keys));
    } catch {
      // ignore storage quota limits
    }
  }
}

export async function loadPlanVersionStoreDB(): Promise<PlanVersionStore> {
  const emptyStore: PlanVersionStore = {
    versionsByPlanKey: {},
    activeVersionIdByPlanKey: {}
  };

  let dbStore = await getAppStateDB<PlanVersionStore>(DB_VERSION_STORE_KEY, emptyStore);
  if (!dbStore || typeof dbStore !== 'object') {
    dbStore = { ...emptyStore };
  }
  const versionsByPlanKey: Record<string, LessonPlanVersion[]> = {
    ...(dbStore.versionsByPlanKey || {})
  };
  const activeVersionIdByPlanKey: Record<string, string> = {
    ...(dbStore.activeVersionIdByPlanKey || {})
  };

  // Recover any newer localStorage fail-safe drafts (e.g. if browser closed immediately after edit)
  try {
    const indexRaw = localStorage.getItem('gdtc_draft_index');
    const indexKeys: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    for (const planKey of indexKeys) {
      const raw = localStorage.getItem(`${LS_DRAFT_PREFIX}${planKey}`);
      if (!raw) continue;
      const rawMirrorVersion: LessonPlanVersion = JSON.parse(raw);
      if (!rawMirrorVersion?.versionId || !rawMirrorVersion?.snapshot) continue;

      const existingList = versionsByPlanKey[planKey] ? [...versionsByPlanKey[planKey]] : [];
      const existingIdx = existingList.findIndex((v) => v.versionId === rawMirrorVersion.versionId);
      const dbFallback =
        (existingIdx >= 0 ? existingList[existingIdx] : null) ||
        [...existingList].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] ||
        null;

      const mirrorVersion = rehydrateStrippedMedia(rawMirrorVersion, dbFallback);

      if (existingIdx >= 0) {
        if ((mirrorVersion.updatedAt || 0) > (existingList[existingIdx].updatedAt || 0)) {
          existingList[existingIdx] = mirrorVersion;
          versionsByPlanKey[planKey] = existingList;
          activeVersionIdByPlanKey[planKey] = mirrorVersion.versionId;
        }
      } else {
        const newestInDb = existingList.reduce((max, v) => Math.max(max, v.updatedAt || 0), 0);
        if ((mirrorVersion.updatedAt || 0) > newestInDb) {
          versionsByPlanKey[planKey] = [mirrorVersion, ...existingList];
          activeVersionIdByPlanKey[planKey] = mirrorVersion.versionId;
        }
      }
    }
  } catch {
    // ignore corrupt draft mirror entries
  }

  return {
    versionsByPlanKey,
    activeVersionIdByPlanKey
  };
}

export async function savePlanVersionStoreDB(store: PlanVersionStore): Promise<void> {
  await setAppStateDB(DB_VERSION_STORE_KEY, store);
}

/**
 * Saves or updates a live auto-saved draft for unfinished edits.
 * Maintains at most 1 active draft on top of the last saved version so keystrokes don't create noisy versions.
 */
export function upsertDraftVersion(
  store: PlanVersionStore,
  plan: MasterPlanItem,
  sourceTab: 'tab-generator' | 'tab-export',
  baselinePlan?: MasterPlanItem | null
): { store: PlanVersionStore; changed: boolean; draftVersion: LessonPlanVersion | null } {
  const week = Number(plan.week) || 9;
  const grade = (Number(plan.grade) as 1 | 3 | 5) || 1;
  const lessonNum = Number(plan.lessonNum) || 17;
  const planKey = getPlanVersionKey(week, grade, lessonNum);

  const existingList = getVersionsForPlan(store, week, grade, lessonNum);
  const activeId = store.activeVersionIdByPlanKey?.[planKey];
  const activeVersion = existingList.find((v) => v.versionId === activeId) || existingList[0] || null;
  const lastFinalized = existingList.find((v) => v.status !== 'draft') || null;
  const diffReference = lastFinalized?.snapshot || baselinePlan || null;

  const normalizedSnapshot = deepClonePlan({
    ...plan,
    id: `plan_k${grade}_t${lessonNum}_w${week}`,
    week,
    grade,
    lessonNum
  });

  // Check if nothing actually changed vs active version
  if (activeVersion && !hasMeaningfulPlanChanges(activeVersion.snapshot, normalizedSnapshot)) {
    return { store, changed: false, draftVersion: activeVersion };
  }

  // If there is no prior user version AND the incoming plan is identical to the factory baseline, do not create a spurious draft
  if (!activeVersion && baselinePlan && !hasMeaningfulPlanChanges(baselinePlan, normalizedSnapshot)) {
    return { store, changed: false, draftVersion: null };
  }

  const now = Date.now();
  const { changeSummary, diffDetails } = computePlanDiff(diffReference, normalizedSnapshot);

  let nextList: LessonPlanVersion[];
  let resultingDraft: LessonPlanVersion;

  if (activeVersion && activeVersion.status === 'draft') {
    // Update the ongoing draft in-place cleanly
    resultingDraft = {
      ...activeVersion,
      title: normalizedSnapshot.title,
      topic: normalizedSnapshot.topic,
      updatedAt: now,
      sourceTab,
      changeSummary: changeSummary.length > 0 ? changeSummary : ['Đang chỉnh sửa bản nháp'],
      diffDetails,
      snapshot: normalizedSnapshot
    };
    nextList = existingList.map((v) => (v.versionId === activeVersion.versionId ? resultingDraft : v));
  } else {
    // Start a fresh draft on top of the finalized/default state
    const maxVersionNum = existingList.reduce((max, v) => Math.max(max, v.versionNumber || 0), 0);
    resultingDraft = {
      versionId: `ver_${planKey}_${now}_${Math.random().toString(36).slice(2, 6)}`,
      planKey,
      week,
      grade,
      lessonNum,
      title: normalizedSnapshot.title,
      topic: normalizedSnapshot.topic,
      versionNumber: maxVersionNum + 1,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      isStarredBest: false,
      sourceTab,
      label: `Bản nháp đang sửa dở (${formatDateTimeVi(now)})`,
      changeSummary: changeSummary.length > 0 ? changeSummary : ['Chỉnh sửa giáo án'],
      diffDetails,
      snapshot: normalizedSnapshot
    };
    nextList = [resultingDraft, ...existingList].slice(0, 30);
  }

  mirrorLatestDraftToLocalStorage(planKey, resultingDraft);

  return {
    changed: true,
    draftVersion: resultingDraft,
    store: {
      versionsByPlanKey: {
        ...store.versionsByPlanKey,
        [planKey]: nextList
      },
      activeVersionIdByPlanKey: {
        ...store.activeVersionIdByPlanKey,
        [planKey]: resultingDraft.versionId
      }
    }
  };
}

/**
 * Commits an official saved version (promoting active draft if present, or creating a new saved checkpoint).
 */
export function commitOfficialVersion(
  store: PlanVersionStore,
  plan: MasterPlanItem,
  sourceTab: 'tab-generator' | 'tab-export',
  options?: {
    customLabel?: string;
    markAsBest?: boolean;
    baselinePlan?: MasterPlanItem | null;
    forceNewVersion?: boolean;
  }
): { store: PlanVersionStore; savedVersion: LessonPlanVersion } {
  const week = Number(plan.week) || 9;
  const grade = (Number(plan.grade) as 1 | 3 | 5) || 1;
  const lessonNum = Number(plan.lessonNum) || 17;
  const planKey = getPlanVersionKey(week, grade, lessonNum);

  const existingList = getVersionsForPlan(store, week, grade, lessonNum);
  const activeId = store.activeVersionIdByPlanKey?.[planKey];
  const activeVersion = existingList.find((v) => v.versionId === activeId) || existingList[0] || null;
  const lastSaved = existingList.find((v) => v.status !== 'draft') || null;
  const diffRef = lastSaved?.snapshot || options?.baselinePlan || null;

  const normalizedSnapshot = deepClonePlan({
    ...plan,
    id: `plan_k${grade}_t${lessonNum}_w${week}`,
    week,
    grade,
    lessonNum
  });

  const now = Date.now();
  const { changeSummary, diffDetails } = computePlanDiff(diffRef, normalizedSnapshot);
  const markAsBest = Boolean(options?.markAsBest);

  let nextList = existingList.map((v) =>
    markAsBest ? { ...v, isStarredBest: false, status: v.status === 'best' ? 'saved' : v.status } : v
  );

  let savedVersion: LessonPlanVersion;

  if (!options?.forceNewVersion && activeVersion && activeVersion.status === 'draft') {
    // Promote current draft to official saved version
    savedVersion = {
      ...activeVersion,
      title: normalizedSnapshot.title,
      topic: normalizedSnapshot.topic,
      updatedAt: now,
      status: markAsBest ? 'best' : 'saved',
      isStarredBest: markAsBest,
      sourceTab,
      label:
        options?.customLabel?.trim() ||
        (markAsBest ? `Bản hoàn hảo nhất (${formatDateTimeVi(now)})` : `Bản đã lưu v${activeVersion.versionNumber} (${formatDateTimeVi(now)})`),
      changeSummary: changeSummary.length > 0 ? changeSummary : ['Đã lưu phiên bản chính thức'],
      diffDetails,
      snapshot: normalizedSnapshot
    };
    nextList = nextList.map((v) => (v.versionId === activeVersion.versionId ? savedVersion : v));
  } else if (
    !options?.forceNewVersion &&
    activeVersion &&
    !hasMeaningfulPlanChanges(activeVersion.snapshot, normalizedSnapshot)
  ) {
    // Same content — just update timestamp / label / best flag
    savedVersion = {
      ...activeVersion,
      updatedAt: now,
      status: markAsBest ? 'best' : 'saved',
      isStarredBest: markAsBest || activeVersion.isStarredBest,
      label: options?.customLabel?.trim() || activeVersion.label
    };
    nextList = nextList.map((v) => (v.versionId === activeVersion.versionId ? savedVersion : v));
  } else {
    const maxVersionNum = nextList.reduce((max, v) => Math.max(max, v.versionNumber || 0), 0);
    savedVersion = {
      versionId: `ver_${planKey}_${now}_${Math.random().toString(36).slice(2, 6)}`,
      planKey,
      week,
      grade,
      lessonNum,
      title: normalizedSnapshot.title,
      topic: normalizedSnapshot.topic,
      versionNumber: maxVersionNum + 1,
      createdAt: now,
      updatedAt: now,
      status: markAsBest ? 'best' : 'saved',
      isStarredBest: markAsBest,
      sourceTab,
      label:
        options?.customLabel?.trim() ||
        (markAsBest
          ? `Bản hoàn hảo nhất v${maxVersionNum + 1}`
          : `Phiên bản #${maxVersionNum + 1} (${formatDateTimeVi(now)})`),
      changeSummary: changeSummary.length > 0 ? changeSummary : ['Lưu phiên bản giáo án mới'],
      diffDetails,
      snapshot: normalizedSnapshot
    };
    nextList = [savedVersion, ...nextList].slice(0, 30);
  }

  mirrorLatestDraftToLocalStorage(planKey, savedVersion);

  return {
    savedVersion,
    store: {
      versionsByPlanKey: {
        ...store.versionsByPlanKey,
        [planKey]: nextList
      },
      activeVersionIdByPlanKey: {
        ...store.activeVersionIdByPlanKey,
        [planKey]: savedVersion.versionId
      }
    }
  };
}

export function activateVersionInStore(
  store: PlanVersionStore,
  planKey: string,
  versionId: string
): { store: PlanVersionStore; version: LessonPlanVersion | null } {
  const list = store.versionsByPlanKey?.[planKey] || [];
  const target = list.find((v) => v.versionId === versionId);
  if (!target) return { store, version: null };

  mirrorLatestDraftToLocalStorage(planKey, target);

  return {
    version: {
      ...target,
      snapshot: deepClonePlan(target.snapshot)
    },
    store: {
      ...store,
      activeVersionIdByPlanKey: {
        ...store.activeVersionIdByPlanKey,
        [planKey]: versionId
      }
    }
  };
}

export function toggleBestVersionInStore(
  store: PlanVersionStore,
  planKey: string,
  versionId: string
): PlanVersionStore {
  const list = store.versionsByPlanKey?.[planKey] || [];
  const target = list.find((v) => v.versionId === versionId);
  if (!target) return store;

  const willBeBest = !target.isStarredBest;
  const nextList = list.map((v) => {
    if (v.versionId === versionId) {
      return {
        ...v,
        isStarredBest: willBeBest,
        status: willBeBest ? ('best' as const) : ('saved' as const)
      };
    }
    return willBeBest
      ? {
          ...v,
          isStarredBest: false,
          status: v.status === 'best' ? ('saved' as const) : v.status
        }
      : v;
  });

  return {
    ...store,
    versionsByPlanKey: {
      ...store.versionsByPlanKey,
      [planKey]: nextList
    }
  };
}

export function deleteVersionFromStore(
  store: PlanVersionStore,
  planKey: string,
  versionId: string
): PlanVersionStore {
  const list = store.versionsByPlanKey?.[planKey] || [];
  const nextList = list.filter((v) => v.versionId !== versionId);
  const nextActive = { ...(store.activeVersionIdByPlanKey || {}) };

  if (nextActive[planKey] === versionId) {
    const sorted = [...nextList].sort((a, b) => b.updatedAt - a.updatedAt);
    if (sorted[0]) {
      nextActive[planKey] = sorted[0].versionId;
      mirrorLatestDraftToLocalStorage(planKey, sorted[0]);
    } else {
      delete nextActive[planKey];
      try {
        localStorage.removeItem(`${LS_DRAFT_PREFIX}${planKey}`);
      } catch {}
    }
  }

  return {
    versionsByPlanKey: {
      ...store.versionsByPlanKey,
      [planKey]: nextList
    },
    activeVersionIdByPlanKey: nextActive
  };
}

export function formatDateTimeVi(ts: number): string {
  try {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export function formatRelativeTimeVi(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 15) return 'vừa xong';
  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return formatDateTimeVi(ts);
}
