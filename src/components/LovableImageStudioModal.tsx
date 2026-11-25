import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  Upload,
  CheckCircle2,
  ClipboardPaste,
  Save,
  FilePlus2,
  Link2,
  PanelRightClose,
  PanelRightOpen,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Layers,
  BookOpen,
  Search,
  FolderOpen,
  Flame,
  Gamepad2,
  Users,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { GradeLevel, SgkImageItem, SubFolderType, ImageCategory } from '../types/gdtc';
import {
  SgkLessonFolder,
  getEffectiveSgkCurriculumTree,
  doesImageBelongToSgkLesson,
  SGK_TREE_OVERRIDES_EVENT
} from '../data/sgkCurriculumTree';

const LOVABLE_URL_STORAGE_KEY = 'smartplan_lovable_studio_url_v1';
const DEFAULT_LOVABLE_URL = '';

interface LovableImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  images?: SgkImageItem[];
  onSaveToLibrary: (newImg: SgkImageItem) => void;
  onSaveAndAttachToLesson?: (newImg: SgkImageItem) => void;
  showToast?: (msg: string) => void;
}

const FOLDER_OPTIONS: Array<{
  folder: SubFolderType;
  category: ImageCategory;
  label: string;
}> = [
  { folder: 'kyThuat', category: 'dong_tac', label: '3. Kỹ thuật động tác' },
  { folder: 'khoiDong', category: 'khoi_dong', label: '1. Khởi động chung' },
  { folder: 'troChoiKhoiDong', category: 'tro_choi_khoi_dong', label: '2. Trò chơi khởi động' },
  { folder: 'luyenTap', category: 'tap_luyen', label: '4. Luyện tập' },
  { folder: 'troChoi', category: 'tro_choi', label: '5. Trò chơi vận động' },
  { folder: 'vanDung', category: 'van_dung', label: '6. Vận dụng & Câu hỏi' },
];

const GRADE_BOOKS: Array<{ grade: GradeLevel; label: string; shortLabel: string }> = [
  { grade: 1, label: 'SGK Khối 1', shortLabel: 'Khối 1' },
  { grade: 2, label: 'SGK Khối 2', shortLabel: 'Khối 2' },
  { grade: 3, label: 'SGK Khối 3', shortLabel: 'Khối 3' },
  { grade: 4, label: 'SGK Khối 4', shortLabel: 'Khối 4' },
  { grade: 5, label: 'SGK Khối 5', shortLabel: 'Khối 5' },
];

function matchesSubFolderType(img: SgkImageItem, sub: SubFolderType): boolean {
  if (img.folder === sub) return true;
  if (!img.folder) {
    if (sub === 'khoiDong') return img.category === 'khoi_dong';
    if (sub === 'troChoiKhoiDong') return img.category === 'tro_choi_khoi_dong';
    if (sub === 'kyThuat') return img.category === 'dong_tac';
    if (sub === 'luyenTap') return img.category === 'tap_luyen';
    if (sub === 'troChoi') return img.category === 'tro_choi';
    if (sub === 'vanDung') return img.category === 'van_dung';
  }
  return false;
}

function normalizePublishedUrl(raw: string): {
  url: string;
  error: string | null;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { url: '', error: null };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { url: '', error: 'Đường dẫn phải bắt đầu bằng https://' };
    }
    const host = parsed.hostname.toLowerCase();
    if (host === 'lovable.dev' && parsed.pathname.startsWith('/projects/')) {
      return {
        url: '',
        error:
          'Đây là link trang chỉnh sửa nội bộ của Lovable (lovable.dev/projects/...), trình duyệt sẽ chặn nhúng. Thầy hãy bấm nút "Publish" màu xanh ở góc trên bên phải Lovable để lấy link công khai dạng https://ten-du-an.lovable.app rồi dán vào đây nhé!',
      };
    }
    return { url: parsed.toString(), error: null };
  } catch {
    return {
      url: '',
      error: 'Đường dẫn chưa đúng định dạng (ví dụ: https://ten-du-an.lovable.app)',
    };
  }
}

function parseGradeLevel(val?: string): GradeLevel {
  const n = Number(val);
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n;
  return 1;
}

export const LovableImageStudioModal: React.FC<LovableImageStudioModalProps> = ({
  isOpen,
  onClose,
  defaultGrade = '1',
  images = [],
  onSaveToLibrary,
  onSaveAndAttachToLesson,
  showToast,
}) => {
  const [savedUrl, setSavedUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(LOVABLE_URL_STORAGE_KEY) || DEFAULT_LOVABLE_URL;
    } catch {
      return DEFAULT_LOVABLE_URL;
    }
  });
  const [urlInput, setUrlInput] = useState<string>(savedUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(false);
  const [isDockOpen, setIsDockOpen] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Staged imported image from Lovable
  const [stagedDataUrl, setStagedDataUrl] = useState<string | null>(null);
  const [stagedDimensions, setStagedDimensions] = useState<{ w: number; h: number } | null>(null);
  const [imgTitle, setImgTitle] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => parseGradeLevel(defaultGrade));
  const [imgFolder, setImgFolder] = useState<SubFolderType>('kyThuat');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<number | undefined>(undefined);
  const [recentSaved, setRecentSaved] = useState<SgkImageItem[]>([]);

  // SGK Curriculum Tree state (same structure as Tab 1)
  const [treeRevision, setTreeRevision] = useState<number>(0);
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [expandedLessonIds, setExpandedLessonIds] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onOverridesChanged = () => setTreeRevision((r) => r + 1);
    window.addEventListener(SGK_TREE_OVERRIDES_EVENT, onOverridesChanged);
    return () => window.removeEventListener(SGK_TREE_OVERRIDES_EVENT, onOverridesChanged);
  }, []);

  useEffect(() => {
    if (defaultGrade) {
      setSelectedGrade(parseGradeLevel(defaultGrade));
    }
  }, [defaultGrade]);

  const effectiveTree = useMemo(() => getEffectiveSgkCurriculumTree(), [treeRevision]);

  const gradeLessons = useMemo(
    () => effectiveTree.filter((lesson) => lesson.grade === selectedGrade),
    [effectiveTree, selectedGrade]
  );

  // Reset topic filter and pick first lesson when switching grade
  useEffect(() => {
    setTopicFilter('all');
    if (gradeLessons.length > 0) {
      const stillInGrade = gradeLessons.some((l) => l.id === selectedLessonId);
      if (!stillInGrade) {
        const first = gradeLessons[0];
        setSelectedLessonId(first.id);
        setSelectedPage(first.subFolders.kyThuat.items[0]?.page || first.startPage);
        setExpandedLessonIds({ [first.id]: true });
      }
    }
  }, [selectedGrade, gradeLessons, selectedLessonId]);

  const gradeTopics = useMemo(() => {
    const map = new Map<string, string>();
    gradeLessons.forEach((l) => {
      if (!map.has(l.topicId)) {
        map.set(l.topicId, l.topicName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [gradeLessons]);

  const filteredTree = useMemo(() => {
    const q = treeSearch.trim().toLowerCase();
    return gradeLessons.filter((lesson) => {
      if (topicFilter !== 'all' && lesson.topicId !== topicFilter) return false;
      if (!q) return true;
      const pageRangeStr = `${lesson.startPage}-${lesson.endPage} tr.${lesson.startPage} trang ${lesson.startPage}`;
      if (
        lesson.topicName.toLowerCase().includes(q) ||
        lesson.lessonName.toLowerCase().includes(q) ||
        pageRangeStr.includes(q) ||
        lesson.movements.some((m) => m.toLowerCase().includes(q)) ||
        lesson.subFolders.kyThuat.items.some(
          (it) => it.name.toLowerCase().includes(q) || String(it.page).includes(q)
        ) ||
        lesson.subFolders.troChoiKhoiDong.items.some(
          (it) => it.gameName.toLowerCase().includes(q) || it.name.toLowerCase().includes(q)
        ) ||
        lesson.subFolders.troChoi.items.some(
          (it) => it.gameName.toLowerCase().includes(q) || it.name.toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      return false;
    });
  }, [gradeLessons, topicFilter, treeSearch]);

  const activeLesson = useMemo(
    () => gradeLessons.find((l) => l.id === selectedLessonId) || gradeLessons[0] || null,
    [gradeLessons, selectedLessonId]
  );

  const getFolderSubCount = useCallback(
    (lesson: SgkLessonFolder, sub?: SubFolderType): number => {
      if (!images || images.length === 0) return 0;
      return images.filter((img) => {
        if (!doesImageBelongToSgkLesson(img, lesson)) return false;
        if (!sub) return true;
        return matchesSubFolderType(img, sub);
      }).length;
    },
    [images]
  );

  const handleCopyKeyword = useCallback(
    (e: React.MouseEvent, text: string, key: string) => {
      e.stopPropagation();
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      setCopiedKey(key);
      showToast?.(`Đã sao chép "${text}" để dán vào khung tìm kiếm Lovable!`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    },
    [showToast]
  );

  const handleSelectTreeTarget = useCallback(
    (lesson: SgkLessonFolder, sub: SubFolderType, page?: number, suggestedTitle?: string) => {
      setSelectedLessonId(lesson.id);
      setImgFolder(sub);
      setSelectedPage(page || lesson.startPage);
      setExpandedLessonIds((prev) => ({ ...prev, [lesson.id]: true }));
      if (suggestedTitle) {
        setImgTitle(suggestedTitle);
      } else if (!imgTitle.trim()) {
        setImgTitle(lesson.lessonName);
      }
    },
    [imgTitle]
  );

  const loadImageFromFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast?.('Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : null;
        if (!result) return;
        setStagedDataUrl(result);
        const cleanName = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .trim();
        setImgTitle((prev) => prev.trim() || cleanName || activeLesson?.lessonName || 'Tranh minh họa GDTC từ Lovable');

        const probe = new Image();
        probe.onload = () => {
          setStagedDimensions({ w: probe.naturalWidth, h: probe.naturalHeight });
        };
        probe.src = result;
        setIsDockOpen(true);
      };
      reader.readAsDataURL(file);
    },
    [showToast, activeLesson]
  );

  // Support Ctrl+V image paste while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            loadImageFromFile(file);
            showToast?.('Đã dán ảnh vào khung nhận ảnh SmartPlan!');
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, loadImageFromFile, showToast]);

  // Support optional postMessage bridge from Lovable app
  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (!payload || typeof payload !== 'object') return;
      if (
        (payload.type === 'SMARTPLAN_ADD_IMAGE' || payload.type === 'LOVABLE_EXPORT_IMAGE') &&
        typeof payload.dataUrl === 'string' &&
        payload.dataUrl.startsWith('data:image/')
      ) {
        setStagedDataUrl(payload.dataUrl);
        if (typeof payload.title === 'string' && payload.title.trim()) {
          setImgTitle(payload.title.trim());
        }
        const probe = new Image();
        probe.onload = () => {
          setStagedDimensions({ w: probe.naturalWidth, h: probe.naturalHeight });
        };
        probe.src = payload.dataUrl;
        setIsDockOpen(true);
        showToast?.('Đã nhận ảnh trực tiếp từ ứng dụng Lovable!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, showToast]);

  if (!isOpen) return null;

  const handleConnectUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { url, error } = normalizePublishedUrl(urlInput);
    if (error) {
      setUrlError(error);
      return;
    }
    setUrlError(null);
    setSavedUrl(url);
    setUrlInput(url);
    try {
      if (url) {
        localStorage.setItem(LOVABLE_URL_STORAGE_KEY, url);
      } else {
        localStorage.removeItem(LOVABLE_URL_STORAGE_KEY);
      }
    } catch {
      // ignore storage quota errors
    }
    if (url) {
      setIsIframeLoading(true);
      setIframeKey((k) => k + 1);
      showToast?.('Đã kết nối ứng dụng tạo ảnh Lovable vào SmartPlan!');
    }
  };

  const handleDisconnectUrl = () => {
    setSavedUrl('');
    setUrlInput('');
    setUrlError(null);
    try {
      localStorage.removeItem(LOVABLE_URL_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const buildImageRecord = (): SgkImageItem | null => {
    if (!stagedDataUrl) return null;
    const folderMeta =
      FOLDER_OPTIONS.find((f) => f.folder === imgFolder) || FOLDER_OPTIONS[0];
    const finalTitle =
      imgTitle.trim() || activeLesson?.lessonName || `Tranh minh họa GDTC Lớp ${selectedGrade}`;
    const now = Date.now();
    const pageNum = selectedPage || activeLesson?.startPage;
    return {
      id: `lovable_${now}_${Math.random().toString(36).slice(2, 7)}`,
      title: finalTitle,
      grade: String(selectedGrade),
      topicId: activeLesson?.topicId,
      topicTitle: activeLesson?.topicName,
      lessonId: activeLesson?.id,
      lessonTitle: activeLesson?.lessonName,
      folder: folderMeta.folder,
      page: pageNum,
      category: folderMeta.category,
      imgUrl: stagedDataUrl,
      caption: activeLesson
        ? `${finalTitle} · SGK Lớp ${selectedGrade}${pageNum ? ` (Tr.${pageNum})` : ''} · ${activeLesson.topicName} · ${activeLesson.lessonName}`
        : `${finalTitle} (Tạo từ Lovable Studio)`,
      selected: false,
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleSaveOnly = () => {
    const record = buildImageRecord();
    if (!record) return;
    onSaveToLibrary(record);
    setRecentSaved((prev) => [record, ...prev].slice(0, 6));
    setStagedDataUrl(null);
    setStagedDimensions(null);
    setImgTitle('');
    showToast?.(
      `Đã lưu "${record.title}" vào Lớp ${record.grade}${activeLesson ? ` · ${activeLesson.lessonName}` : ''}!`
    );
  };

  const handleSaveAndAttach = () => {
    const record = buildImageRecord();
    if (!record) return;
    setRecentSaved((prev) => [record, ...prev].slice(0, 6));
    setStagedDataUrl(null);
    setStagedDimensions(null);
    setImgTitle('');
    if (onSaveAndAttachToLesson) {
      onSaveAndAttachToLesson(record);
      onClose();
    } else {
      onSaveToLibrary(record);
      showToast?.(`Đã lưu "${record.title}" vào Thư Viện Ảnh!`);
    }
  };

  const activeFolderLabel =
    FOLDER_OPTIONS.find((f) => f.folder === imgFolder)?.label || '3. Kỹ thuật động tác';

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3">
      <div className="bg-white w-full max-w-[1580px] h-[94vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold leading-tight truncate">
                Tích Hợp Studio Tạo Ảnh Lovable
              </h2>
              <p className="text-[11px] text-sky-100 truncate">
                Tra cứu cây thư mục SGK từng khối, tạo ảnh từ Lovable và lưu đúng vào Bài học &amp; Giáo án
              </p>
            </div>
          </div>

          {/* Inline URL controls */}
          <form
            onSubmit={handleConnectUrl}
            className="flex items-center gap-1.5 flex-1 max-w-xl min-w-[240px]"
          >
            <div className="relative flex-1">
              <Link2 className="w-3.5 h-3.5 text-sky-200 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="Dán link Lovable đã Publish (https://....lovable.app)"
                className="w-full bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder-sky-100/80 focus:placeholder-slate-400 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-white/25 focus:border-white focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs transition shrink-0 shadow-xs"
            >
              Kết nối
            </button>
            {savedUrl && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsIframeLoading(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition shrink-0"
                  title="Tải lại ứng dụng Lovable"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <a
                  href={savedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition shrink-0"
                  title="Mở ứng dụng Lovable ở tab mới"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </form>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDockOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition"
              title={isDockOpen ? 'Thu gọn bảng nhận ảnh & cây SGK' : 'Mở bảng nhận ảnh & cây SGK'}
            >
              {isDockOpen ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {isDockOpen ? 'Ẩn bảng phải' : 'Nhận ảnh & Cây SGK'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-rose-500 text-white transition"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation warning bar */}
        {urlError && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2 text-xs text-amber-900 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{urlError}</span>
          </div>
        )}

        {/* Main Split Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-slate-100">
          {/* Left: Embedded Lovable Workspace */}
          <div className="flex-1 relative min-h-[280px] flex flex-col bg-slate-50 overflow-hidden">
            {savedUrl ? (
              <>
                {isIframeLoading && (
                  <div className="absolute inset-0 z-10 bg-white/85 flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">
                      Đang tải ứng dụng Lovable...
                    </span>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={savedUrl}
                  title="Ứng dụng tạo hình ảnh Lovable"
                  className="w-full h-full border-0 bg-white"
                  allow="clipboard-read; clipboard-write; fullscreen"
                  onLoad={() => setIsIframeLoading(false)}
                />
                <div className="bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
                  <span className="truncate">
                    Đang nhúng: <strong className="text-slate-700">{savedUrl}</strong>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>Mở toàn màn hình</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={handleDisconnectUrl}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Đổi link khác
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Kết nối ứng dụng tạo ảnh Lovable của thầy
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Chỉ cần dán đường link công khai sau khi bấm <strong>Publish</strong> trên Lovable — ứng dụng <em>IMG BOOK EXTRACT / Textbook Illustration Finder</em> sẽ chạy trực tiếp ngay trong khung này.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p>
                        Mở dự án trên Lovable, bấm nút{' '}
                        <span className="inline-block px-1.5 py-0.5 rounded bg-blue-600 text-white font-semibold text-[10px]">
                          Publish
                        </span>{' '}
                        màu xanh ở góc trên bên phải.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p>
                        Sao chép đường link công khai dạng{' '}
                        <code className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-900 font-mono text-[11px]">
                          https://ten-du-an.lovable.app
                        </code>
                        .
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <p>
                        Dán link vào ô bên dưới và bấm <strong>Nhúng vào SmartPlan</strong>. Bên phải có sẵn <strong>Cây thư mục SGK Khối 1–5</strong> giúp thầy tra số trang &amp; copy tên bài để tìm cực nhanh trong IMG Book Extract.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleConnectUrl} className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Đường dẫn ứng dụng Lovable đã Publish:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          if (urlError) setUrlError(null);
                        }}
                        placeholder="https://textbook-illustration-finder.lovable.app"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs whitespace-nowrap"
                      >
                        Nhúng vào SmartPlan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Receive Image + SGK Curriculum Tree (Matching Tab 1) */}
          {isDockOpen && (
            <div className="w-full lg:w-[410px] xl:w-[445px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 max-h-[52vh] lg:max-h-none overflow-hidden">
              {/* Top Half (scrollable if staged image open): Image Receive Box */}
              <div className="p-3 border-b border-slate-200 bg-slate-50/70 shrink-0 space-y-2.5 max-h-[48%] overflow-y-auto">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Nhận Ảnh Từ Lovable → Thư Viện &amp; Giáo Án</span>
                  </h3>
                  {recentSaved.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      +{recentSaved.length} đã lưu
                    </span>
                  )}
                </div>

                {/* Current target destination pill */}
                {activeLesson && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-[11px] text-blue-900 flex items-center justify-between gap-2">
                    <span className="truncate">
                      Đích lưu:{' '}
                      <strong>
                        Khối {selectedGrade} · {activeLesson.lessonName}
                      </strong>{' '}
                      <span className="text-blue-700">({activeFolderLabel})</span>
                    </span>
                    {selectedPage && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0 tabular-nums">
                        Tr.{selectedPage}
                      </span>
                    )}
                  </div>
                )}

                {!stagedDataUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) loadImageFromFile(file);
                    }}
                    className={`rounded-xl border-2 border-dashed px-3 py-3 text-center transition cursor-pointer ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) loadImageFromFile(file);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          Kéo thả ảnh PNG hoặc bấm chọn file
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ClipboardPaste className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Hỗ trợ dán nhanh Ctrl + V ảnh vừa tải từ Lovable</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 bg-white rounded-xl border border-slate-200 p-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="relative w-24 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                        <img
                          src={stagedDataUrl}
                          alt="Ảnh vừa nhận từ Lovable"
                          className="w-full h-full object-contain bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setStagedDataUrl(null);
                            setStagedDimensions(null);
                          }}
                          className="absolute top-1 right-1 p-1 rounded bg-slate-900/75 hover:bg-rose-600 text-white transition"
                          title="Xóa ảnh đang chọn"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          value={imgTitle}
                          onChange={(e) => setImgTitle(e.target.value)}
                          placeholder="Tên động tác / hình ảnh..."
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(parseGradeLevel(e.target.value))}
                            className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                          >
                            {GRADE_BOOKS.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={imgFolder}
                            onChange={(e) => setImgFolder(e.target.value as SubFolderType)}
                            className="border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                          >
                            {FOLDER_OPTIONS.map((opt) => (
                              <option key={opt.folder} value={opt.folder}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {stagedDimensions && (
                          <p className="text-[10px] text-slate-400 tabular-nums">
                            Kích thước: {stagedDimensions.w} × {stagedDimensions.h} px
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={handleSaveOnly}
                        className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Thư Viện</span>
                      </button>
                      {onSaveAndAttachToLesson && (
                        <button
                          type="button"
                          onClick={handleSaveAndAttach}
                          className="py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
                        >
                          <FilePlus2 className="w-3.5 h-3.5" />
                          <span>Lưu &amp; Gắn Giáo Án</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {recentSaved.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {recentSaved.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 shrink-0 max-w-[180px]"
                        title={`${item.title} (Lớp ${item.grade})`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-semibold text-emerald-900 truncate">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Section: Authentic SGK Curriculum Tree (Matching Tab 1) */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
                {/* Tree Header + Grade Book Switcher */}
                <div className="px-3 pt-2.5 pb-2 border-b border-slate-200 bg-slate-50/50 space-y-2 shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Cây Thư Mục SGK GDTC (Khối {selectedGrade})</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                      {filteredTree.length} bài học
                    </span>
                  </div>

                  {/* Grade Tabs: Khối 1 -> Khối 5 */}
                  <div className="grid grid-cols-5 gap-1">
                    {GRADE_BOOKS.map((book) => {
                      const active = selectedGrade === book.grade;
                      return (
                        <button
                          key={book.grade}
                          type="button"
                          onClick={() => setSelectedGrade(book.grade)}
                          className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition text-center ${
                            active
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          {book.shortLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Box + Topic Filter */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={treeSearch}
                        onChange={(e) => setTreeSearch(e.target.value)}
                        placeholder={`Tìm bài, động tác, số trang SGK Lớp ${selectedGrade}...`}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-6 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      {treeSearch && (
                        <button
                          type="button"
                          onClick={() => setTreeSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topic filter pills */}
                  {gradeTopics.length > 1 && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                      <button
                        type="button"
                        onClick={() => setTopicFilter('all')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition ${
                          topicFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả chủ đề
                      </button>
                      {gradeTopics.map((topic) => (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => setTopicFilter(topic.id)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition ${
                            topicFilter === topic.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          title={topic.name}
                        >
                          {topic.name.replace(/^CHỦ ĐỀ\s*/i, 'CĐ ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scrollable SGK Tree List (Same 6-subfolder structure as Tab 1) */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {filteredTree.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Không tìm thấy bài học nào khớp "{treeSearch}" trong SGK Khối {selectedGrade}.
                    </div>
                  ) : (
                    filteredTree.map((lesson) => {
                      const isSelected = activeLesson?.id === lesson.id;
                      const isExpanded =
                        Boolean(expandedLessonIds[lesson.id]) || Boolean(treeSearch.trim());
                      const totalLessonImgs = getFolderSubCount(lesson);
                      const kdCount = getFolderSubCount(lesson, 'khoiDong');
                      const tckdCount = getFolderSubCount(lesson, 'troChoiKhoiDong');
                      const ktCount = getFolderSubCount(lesson, 'kyThuat');
                      const ltCount = getFolderSubCount(lesson, 'luyenTap');
                      const tcCount = getFolderSubCount(lesson, 'troChoi');
                      const vdCount = getFolderSubCount(lesson, 'vanDung');
                      const warmupGameTitle =
                        lesson.subFolders.troChoiKhoiDong.items[0]?.gameName || 'Trò chơi khởi động';
                      const practiceGameTitle =
                        lesson.subFolders.troChoi.items[0]?.gameName || 'Trò chơi vận động';

                      return (
                        <div
                          key={lesson.id}
                          className={`border rounded-xl p-2 transition ${
                            isSelected
                              ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-200'
                              : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Topic + Page Range + Image Count */}
                          <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            <span className="text-blue-800 truncate">{lesson.topicName}</span>
                            <span className="tabular-nums whitespace-nowrap text-slate-500 shrink-0">
                              Tr.{lesson.startPage}-{lesson.endPage} · {totalLessonImgs} ảnh
                            </span>
                          </div>

                          {/* Lesson Header */}
                          <div
                            onClick={() => {
                              setExpandedLessonIds((prev) => ({
                                ...prev,
                                [lesson.id]: !isExpanded,
                              }));
                              handleSelectTreeTarget(
                                lesson,
                                'kyThuat',
                                lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage
                              );
                            }}
                            className="group mt-1 cursor-pointer flex items-start justify-between gap-1.5"
                          >
                            <div className="flex items-start gap-1.5 min-w-0 font-bold text-slate-900 text-xs group-hover:text-blue-700 leading-snug">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              )}
                              <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{lesson.lessonName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopyKeyword(e, lesson.lessonName, `lesson_${lesson.id}`)
                              }
                              title="Sao chép tên bài để tìm trong Lovable IMG Book Extract"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-700 hover:bg-blue-100 shrink-0 transition"
                            >
                              {copiedKey === `lesson_${lesson.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* 6 Authentic SGK Sub-folders (when expanded) */}
                          {isExpanded && (
                            <div className="mt-2 pl-2.5 space-y-1 border-l border-slate-300 text-[11px]">
                              {/* 1. Khởi động chung */}
                              <div
                                onClick={() =>
                                  handleSelectTreeTarget(
                                    lesson,
                                    'khoiDong',
                                    lesson.subFolders.khoiDong.suggestedPage,
                                    `Khởi động - ${lesson.lessonName}`
                                  )
                                }
                                className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                  isSelected && imgFolder === 'khoiDong'
                                    ? 'bg-sky-600 text-white font-semibold'
                                    : 'text-slate-700 hover:bg-slate-200/70'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Flame className="w-3 h-3 shrink-0" />
                                  <span className="truncate">1. Khởi động chung</span>
                                </span>
                                <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                                  P.{lesson.subFolders.khoiDong.suggestedPage} · {kdCount} ảnh
                                </span>
                              </div>

                              {/* 2. Trò chơi khởi động */}
                              <div
                                onClick={() =>
                                  handleSelectTreeTarget(
                                    lesson,
                                    'troChoiKhoiDong',
                                    lesson.subFolders.troChoiKhoiDong.suggestedPage,
                                    warmupGameTitle
                                  )
                                }
                                className={`group cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                  isSelected && imgFolder === 'troChoiKhoiDong'
                                    ? 'bg-amber-600 text-white font-semibold'
                                    : 'text-amber-900 bg-amber-50/70 hover:bg-amber-100'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 min-w-0">
                                  <Gamepad2 className="w-3 h-3 shrink-0" />
                                  <span className="truncate" title={warmupGameTitle}>
                                    2. TC KĐ: <strong>{warmupGameTitle}</strong>
                                  </span>
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] tabular-nums whitespace-nowrap opacity-85">
                                    P.{lesson.subFolders.troChoiKhoiDong.suggestedPage} · {tckdCount}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleCopyKeyword(e, warmupGameTitle, `tckd_${lesson.id}`)
                                    }
                                    title={`Sao chép "${warmupGameTitle}"`}
                                    className="p-0.5 rounded hover:bg-black/10 transition"
                                  >
                                    {copiedKey === `tckd_${lesson.id}` ? (
                                      <Check className="w-2.5 h-2.5" />
                                    ) : (
                                      <Copy className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* 3. Kỹ thuật động tác + danh sách động tác */}
                              <div className="space-y-0.5">
                                <div
                                  onClick={() =>
                                    handleSelectTreeTarget(
                                      lesson,
                                      'kyThuat',
                                      lesson.subFolders.kyThuat.items[0]?.page || lesson.startPage,
                                      lesson.subFolders.kyThuat.items[0]?.name || lesson.lessonName
                                    )
                                  }
                                  className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                    isSelected && imgFolder === 'kyThuat'
                                      ? 'bg-blue-600 text-white font-semibold'
                                      : 'text-blue-800 font-semibold hover:bg-blue-100/80'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <Layers className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                      3. Kỹ thuật động tác ({lesson.subFolders.kyThuat.items.length})
                                    </span>
                                  </span>
                                  <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                                    {ktCount} ảnh
                                  </span>
                                </div>

                                {lesson.subFolders.kyThuat.items.map((it, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() =>
                                      handleSelectTreeTarget(lesson, 'kyThuat', it.page, it.name)
                                    }
                                    className="group pl-3.5 pr-1 py-0.5 rounded text-[10.5px] text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between gap-1.5 transition"
                                  >
                                    <span className="truncate" title={it.name}>
                                      • {it.name}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap">
                                        P.{it.page}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          handleCopyKeyword(
                                            e,
                                            it.name,
                                            `kt_${lesson.id}_${idx}`
                                          )
                                        }
                                        title={`Sao chép "${it.name}" để tìm trong IMG Book Extract`}
                                        className="p-0.5 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-100 transition"
                                      >
                                        {copiedKey === `kt_${lesson.id}_${idx}` ? (
                                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-2.5 h-2.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* 4. Luyện tập */}
                              <div
                                onClick={() =>
                                  handleSelectTreeTarget(
                                    lesson,
                                    'luyenTap',
                                    lesson.subFolders.luyenTap.items[0]?.page || lesson.startPage + 1,
                                    `Luyện tập - ${lesson.lessonName}`
                                  )
                                }
                                className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                  isSelected && imgFolder === 'luyenTap'
                                    ? 'bg-indigo-600 text-white font-semibold'
                                    : 'text-slate-700 hover:bg-slate-200/70'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Users className="w-3 h-3 shrink-0" />
                                  <span className="truncate">4. Ảnh Luyện tập (Tổ/Cặp)</span>
                                </span>
                                <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                                  P.{lesson.subFolders.luyenTap.items[0]?.page || lesson.startPage + 1} · {ltCount} ảnh
                                </span>
                              </div>

                              {/* 5. Trò chơi vận động */}
                              <div
                                onClick={() =>
                                  handleSelectTreeTarget(
                                    lesson,
                                    'troChoi',
                                    lesson.subFolders.troChoi.suggestedPage,
                                    practiceGameTitle
                                  )
                                }
                                className={`group cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                  isSelected && imgFolder === 'troChoi'
                                    ? 'bg-purple-600 text-white font-semibold'
                                    : 'text-purple-900 bg-purple-50/70 hover:bg-purple-100'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 min-w-0">
                                  <Gamepad2 className="w-3 h-3 shrink-0" />
                                  <span className="truncate" title={practiceGameTitle}>
                                    5. TC VĐ: <strong>{practiceGameTitle}</strong>
                                  </span>
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] tabular-nums whitespace-nowrap opacity-85">
                                    P.{lesson.subFolders.troChoi.suggestedPage} · {tcCount}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleCopyKeyword(e, practiceGameTitle, `tc_${lesson.id}`)
                                    }
                                    title={`Sao chép "${practiceGameTitle}"`}
                                    className="p-0.5 rounded hover:bg-black/10 transition"
                                  >
                                    {copiedKey === `tc_${lesson.id}` ? (
                                      <Check className="w-2.5 h-2.5" />
                                    ) : (
                                      <Copy className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* 6. Vận dụng & Câu hỏi */}
                              <div
                                onClick={() =>
                                  handleSelectTreeTarget(
                                    lesson,
                                    'vanDung',
                                    lesson.subFolders.vanDung.suggestedPage,
                                    `Vận dụng - ${lesson.lessonName}`
                                  )
                                }
                                className={`cursor-pointer py-1 px-2 rounded-md flex items-center justify-between gap-1.5 transition ${
                                  isSelected && imgFolder === 'vanDung'
                                    ? 'bg-emerald-600 text-white font-semibold'
                                    : 'text-slate-700 hover:bg-slate-200/70'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <HelpCircle className="w-3 h-3 shrink-0" />
                                  <span className="truncate">6. Vận dụng &amp; Câu hỏi</span>
                                </span>
                                <span className="text-[10px] tabular-nums whitespace-nowrap shrink-0 opacity-85">
                                  P.{lesson.subFolders.vanDung.suggestedPage} · {vdCount} ảnh
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
