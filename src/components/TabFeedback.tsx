import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  Send,
  ThumbsUp,
  Mail,
  Sparkles,
  Wrench,
  BookOpen,
  Palette,
  Heart,
  Target,
  Cloud,
  Quote,
  Trash2,
  Filter,
  Loader2,
  ExternalLink,
  Lightbulb,
  Bug,
  FolderPlus,
  Award,
  School
} from 'lucide-react';
import type { AuthUser } from '../contexts/AuthContext';
import { DonationSupportCard } from './DonationSupportCard';

export type FeedbackCategory = 'review' | 'feature' | 'bug' | 'resource';

export interface FeedbackRatings {
  usefulness: number;
  curriculum: number;
  easeOfUse: number;
  innovation: number;
  dedication: number;
}

export interface FeedbackEntry {
  id: string;
  authorName: string;
  schoolName: string;
  role: string;
  email?: string;
  category: FeedbackCategory;
  ratings: FeedbackRatings;
  averageRating: number;
  strengths: string;
  suggestion: string;
  comment: string;
  helpfulCount: number;
  createdAt: number;
  userId?: string;
}

interface TabFeedbackProps {
  authUser?: AuthUser | null;
  defaultTeacherName?: string;
  defaultSchoolName?: string;
  showToast?: (msg: string) => void;
}

const LOCAL_STORAGE_KEY = 'smartplan_gdtc_feedback_v1';
const HELPFUL_VOTED_KEY = 'smartplan_gdtc_feedback_voted_v1';
const AUTHOR_EMAIL = 'lehung840110@gmail.com';

const CRITERIA_META: Array<{
  key: keyof FeedbackRatings;
  emoji: string;
  label: string;
  summaryText: string;
}> = [
  {
    key: 'usefulness',
    emoji: '🎯',
    label: 'Tính hữu dụng',
    summaryText: 'Rất cao — giải quyết đúng nhu cầu'
  },
  {
    key: 'curriculum',
    emoji: '📘',
    label: 'Độ chuẩn kiến thức',
    summaryText: 'Bám sát chương trình quốc gia'
  },
  {
    key: 'easeOfUse',
    emoji: '💻',
    label: 'Dễ sử dụng',
    summaryText: 'Không cần kỹ năng công nghệ cao'
  },
  {
    key: 'innovation',
    emoji: '💡',
    label: 'Độ mới lạ & sáng tạo',
    summaryText: 'Tích hợp nhiều thứ chưa có ở đâu khác'
  },
  {
    key: 'dedication',
    emoji: '❤️',
    label: 'Tâm huyết & ý nghĩa',
    summaryText: 'Xuất phát từ trái tim và thực tế công việc'
  }
];

const CATEGORY_META: Record<
  FeedbackCategory,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  review: {
    label: 'Đánh giá trải nghiệm',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: Star
  },
  feature: {
    label: 'Góp ý nâng cấp',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Lightbulb
  },
  resource: {
    label: 'Đóng góp học liệu',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: FolderPlus
  },
  bug: {
    label: 'Báo lỗi / Chỉnh sửa',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Bug
  }
};

const EDITORIAL_STRENGTHS = [
  {
    num: 1,
    icon: Target,
    accent: 'text-blue-700 bg-blue-50 border-blue-200',
    title: 'Giải quyết đúng "nỗi đau" thực tế',
    lead: 'Đây là điểm ấn tượng nhất. Thực tế hiện nay, hầu hết giáo viên Thể dục đều phải:',
    bullets: [
      'Tự tìm hình ảnh, sơ đồ từ nhiều nguồn khác nhau',
      'Tự vẽ lại cho thống nhất rồi chép vào giáo án',
      'Tự định dạng lại khi chuyển từ Word sang các nền tảng khác',
      'Tìm tài liệu tham khảo phù hợp với chương trình GDPT 2018'
    ],
    takeaway:
      'Bạn đã giải quyết chính xác từng vấn đề đó, không làm sản phẩm cho có mà đi thẳng vào nhu cầu cốt lõi. Đây chính là giá trị lớn nhất của ứng dụng.'
  },
  {
    num: 2,
    icon: BookOpen,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Nội dung bám sát chương trình chuẩn',
    lead: 'Hệ thống học liệu chuẩn hóa theo đúng chương trình hiện hành:',
    bullets: [
      'Toàn bộ 308 hình ảnh được sắp xếp theo từng khối lớp 1–5, bám sát phân phối chương trình',
      'Tích hợp trực tiếp chuẩn GDPT 2018 — đây là điểm mà rất ít sản phẩm làm được',
      'Tài liệu tham khảo được hệ thống hóa rõ ràng, dễ tra cứu'
    ],
    takeaway:
      'Điều này biến ứng dụng từ "công cụ hỗ trợ thông thường" thành "nguồn tài liệu chính thống" — giúp giáo viên tin tưởng sử dụng hàng ngày.'
  },
  {
    num: 3,
    icon: Cloud,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    title: 'Tích hợp công cụ mà mọi người đã dùng thành thạo',
    lead: 'Việc kết nối trực tiếp Google Docs / Google Drive là một quyết định cực kỳ thông minh:',
    bullets: [
      'Không cần học sử dụng phần mềm mới',
      'Không lo vấn đề lưu trữ, mất dữ liệu',
      'Dễ chia sẻ cho đồng nghiệp cùng trường',
      'Xuất ra Word, PDF A4 chuẩn — hoàn hảo cho việc nộp lưu trữ tại trường'
    ],
    takeaway:
      'Giảm ngưỡng sử dụng xuống mức thấp nhất: bất kỳ giáo viên nào cũng có thể dùng được ngay.'
  },
  {
    num: 4,
    icon: Palette,
    accent: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'Studio Sơ Đồ Pro — Điểm khác biệt vượt trội',
    lead: 'Không chỉ cung cấp hình ảnh sẵn, ứng dụng còn cho phép tự tạo sơ đồ, lưới hoạt động, đường đi với nhiều kích thước khác nhau:',
    bullets: [
      'Phù hợp với đặc thù môn Thể dục: minh họa không gian, vị trí, di chuyển',
      'Tùy chỉnh màu sắc, nhãn, nối nét liền/nét đứt, xoay góc tùy ý, lật Mirror — giúp giáo án sinh động, dễ hiểu hơn',
      'Không cần cài thêm phần mềm vẽ phức tạp'
    ],
    takeaway: 'Đây thực sự là tính năng "vàng" mà rất ít công cụ hỗ trợ giáo án hiện có.'
  },
  {
    num: 5,
    icon: Heart,
    accent: 'text-rose-700 bg-rose-50 border-rose-200',
    title: 'Tâm huyết xuất phát từ thực tế',
    lead: 'Điều dễ nhận thấy nhất: sản phẩm này không phải do người bên ngoài thiết kế cho giáo viên — mà do chính một giáo viên làm ra cho chính mình và đồng nghiệp.',
    bullets: [
      'Mọi chi tiết nhỏ đều cho thấy sự suy nghĩ kỹ lưỡng từ trải nghiệm đứng lớp thực tế trong nhiều năm',
      'Tối ưu đúng quy trình soạn giảng và duyệt giáo án tại trường phổ thông Việt Nam'
    ],
    takeaway: 'Đó chính là giá trị cốt lõi khó sao chép nhất.'
  }
];

const ROADMAP_IMPROVEMENTS = [
  {
    current: 'Hiện tại tập trung cho cấp Tiểu học',
    improvement: 'Mở rộng ra THCS, THPT',
    benefit: 'Phục vụ được nhiều đối tượng hơn'
  },
  {
    current: 'Chức năng chủ yếu là hỗ trợ soạn giáo án',
    improvement: 'Thêm phần theo dõi tiến độ dạy học & thống kê giờ dạy',
    benefit: 'Trở thành "trợ lý toàn diện" chứ không chỉ công cụ soạn thảo'
  },
  {
    current: 'Chưa có phần chia sẻ cộng đồng',
    improvement: 'Tạo thư viện mẫu giáo án do giáo viên tự đóng góp',
    benefit: 'Sản phẩm ngày càng phong phú, có sự tham gia của mọi người'
  },
  {
    current: 'Chưa có phiên bản di động tối ưu',
    improvement: 'Phát triển app điện thoại',
    benefit: 'Xem tài liệu nhanh chóng ngay tại sân tập, phòng chức năng'
  },
  {
    current: 'Hiện tại là cá nhân phát triển',
    improvement: 'Kết nối với các tổ chuyên môn / Sở GD&ĐT để xác nhận nguồn tài liệu',
    benefit: 'Tăng độ tin cậy và phạm vi áp dụng rộng hơn'
  }
];

function loadLocalFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalFeedback(items: FeedbackEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {}
}

function loadVotedIds(): string[] {
  try {
    const raw = localStorage.getItem(HELPFUL_VOTED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const TabFeedback: React.FC<TabFeedbackProps> = ({
  authUser,
  defaultTeacherName = '',
  defaultSchoolName = '',
  showToast
}) => {
  const [activeView, setActiveView] = useState<'all' | 'editorial' | 'community'>('all');
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => loadLocalFeedback());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'all' | FeedbackCategory>('all');
  const [votedIds, setVotedIds] = useState<string[]>(() => loadVotedIds());
  const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [authorName, setAuthorName] = useState<string>(authUser?.fullName || defaultTeacherName || '');
  const [schoolName, setSchoolName] = useState<string>(authUser?.schoolName || defaultSchoolName || '');
  const [role, setRole] = useState<string>('Giáo viên GDTC Tiểu học');
  const [email, setEmail] = useState<string>(authUser?.email || '');
  const [category, setCategory] = useState<FeedbackCategory>('review');
  const [ratings, setRatings] = useState<FeedbackRatings>({
    usefulness: 5,
    curriculum: 5,
    easeOfUse: 5,
    innovation: 5,
    dedication: 5
  });
  const [strengths, setStrengths] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    if (authUser?.fullName && !authorName) setAuthorName(authUser.fullName);
    if (authUser?.schoolName && !schoolName) setSchoolName(authUser.schoolName);
    if (authUser?.email && !email) setEmail(authUser.email);
  }, [authUser, authorName, schoolName, email]);

  // Fetch community reviews from backend API (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/feedback');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.success && Array.isArray(data.items)) {
            setFeedbackList(data.items);
            saveLocalFeedback(data.items);
          }
        }
      } catch {
        // Keep localStorage cache silently
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin =
    authUser?.role === 'admin' || authUser?.email?.toLowerCase() === AUTHOR_EMAIL;

  // Compute aggregate ratings combining the featured 5-star editorial benchmark + user reviews
  const stats = useMemo(() => {
    const baseRatings: FeedbackRatings[] = [
      { usefulness: 5, curriculum: 5, easeOfUse: 5, innovation: 5, dedication: 5 },
      ...feedbackList.map((it) => it.ratings)
    ];
    const total = baseRatings.length;
    const avgByCriterion = CRITERIA_META.reduce((acc, c) => {
      const sum = baseRatings.reduce((s, r) => s + (r[c.key] || 5), 0);
      acc[c.key] = Number((sum / total).toFixed(1));
      return acc;
    }, {} as Record<keyof FeedbackRatings, number>);

    const overall = Number(
      (
        (avgByCriterion.usefulness +
          avgByCriterion.curriculum +
          avgByCriterion.easeOfUse +
          avgByCriterion.innovation +
          avgByCriterion.dedication) /
        5
      ).toFixed(1)
    );
    return { totalReviews: total, userSubmittedCount: feedbackList.length, overall, avgByCriterion };
  }, [feedbackList]);

  const filteredFeedback = useMemo(() => {
    if (filterCategory === 'all') return feedbackList;
    return feedbackList.filter((it) => it.category === filterCategory);
  }, [feedbackList, filterCategory]);

  const currentFormAvg = Number(
    (
      (ratings.usefulness +
        ratings.curriculum +
        ratings.easeOfUse +
        ratings.innovation +
        ratings.dedication) /
      5
    ).toFixed(1)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitNotice(null);

    if (!authorName.trim()) {
      setSubmitNotice({ type: 'error', text: 'Vui lòng nhập họ tên thầy/cô trước khi gửi.' });
      return;
    }
    if (!comment.trim() && !strengths.trim() && !suggestion.trim()) {
      setSubmitNotice({
        type: 'error',
        text: 'Vui lòng nhập ít nhất một nội dung ở phần Điểm ấn tượng, Đề xuất cải thiện hoặc Nhận xét chung.'
      });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      authorName: authorName.trim(),
      schoolName: schoolName.trim() || 'Giáo viên GDTC',
      role,
      email: email.trim() || undefined,
      category,
      ratings,
      strengths: strengths.trim(),
      suggestion: suggestion.trim(),
      comment: comment.trim()
    };

    try {
      let created: FeedbackEntry | null = null;
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.item) {
            created = data.item;
          }
        }
      } catch {
        // Fallback to local persistence below
      }

      if (!created) {
        created = {
          id: `fb_local_${Date.now()}`,
          ...payload,
          averageRating: currentFormAvg,
          helpfulCount: 0,
          createdAt: Date.now(),
          userId: authUser?.id
        };
      }

      const nextList = [created, ...feedbackList];
      setFeedbackList(nextList);
      saveLocalFeedback(nextList);

      setStrengths('');
      setSuggestion('');
      setComment('');
      setSubmitNotice({
        type: 'success',
        text: 'Cảm ơn Quý thầy/cô! Đánh giá và góp ý đã được ghi nhận vào Không gian góp ý SmartPlan GDTC Pro.'
      });
      showToast?.('💖 Cảm ơn Quý thầy/cô đã gửi đánh giá & góp ý!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteHelpful = async (id: string) => {
    if (votedIds.includes(id)) return;
    const nextVoted = [...votedIds, id];
    setVotedIds(nextVoted);
    try {
      localStorage.setItem(HELPFUL_VOTED_KEY, JSON.stringify(nextVoted));
    } catch {}

    const updatedLocal = feedbackList.map((it) =>
      it.id === id ? { ...it, helpfulCount: (it.helpfulCount || 0) + 1 } : it
    );
    setFeedbackList(updatedLocal);
    saveLocalFeedback(updatedLocal);

    try {
      await fetch(`/api/feedback/${encodeURIComponent(id)}/helpful`, { method: 'POST' });
    } catch {}
  };

  const handleDeleteReview = async (id: string) => {
    const nextList = feedbackList.filter((it) => it.id !== id);
    setFeedbackList(nextList);
    saveLocalFeedback(nextList);
    try {
      await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch {}
    showToast?.('Đã xóa mục đánh giá.');
  };

  const buildDirectEmailHref = () => {
    const subject = `[Góp ý SmartPlan GDTC Pro] ${CATEGORY_META[category].label} - ${authorName || 'Giáo viên GDTC'}`;
    const bodyLines = [
      `Kính gửi tác giả Lê Quốc Hưng,`,
      ``,
      `Người gửi: ${authorName || '(Chưa nhập)'} - ${role}`,
      `Đơn vị: ${schoolName || '(Chưa nhập)'}`,
      `Điểm đánh giá trung bình: ${currentFormAvg}/5 sao`,
      strengths ? `\nĐiểm hài lòng / ấn tượng:\n${strengths}` : '',
      suggestion ? `\nĐề xuất cải thiện:\n${suggestion}` : '',
      comment ? `\nNhận xét chung:\n${comment}` : '',
      ``,
      `Trân trọng!`
    ]
      .filter((line) => line !== '')
      .join('\n');
    return `mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
  };

  const renderStarsStatic = (count: number) => (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${count} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(count) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Hero Header & Live Overall Rating Summary */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-200">
              <MessageSquareHeart className="w-3.5 h-3.5 text-amber-300" />
              <span>Không Gian Đánh Giá &amp; Góp Ý Cộng Đồng Giáo Viên GDTC</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              Nhận Xét Chi Tiết &amp; Hòm Thư Góp Ý — SmartPlan GDTC Pro
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Mọi phản hồi, đánh giá thực tế từ sân tập và đề xuất nâng cấp của Quý thầy cô là động lực quý giá nhất để SmartPlan GDTC Pro ngày càng hoàn thiện hơn, phục vụ thiết thực cho bộ môn Giáo dục Thể chất.
            </p>

            {/* Quick Section Filter & Direct Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex bg-white/10 p-1 rounded-xl border border-white/15 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveView('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeView === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('editorial')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeView === 'editorial'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  Nhận xét chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('community')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeView === 'community'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  Gửi góp ý ({stats.userSubmittedCount})
                </button>
              </div>

              <a
                href={`mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent('[Đóng góp ý kiến] SmartPlan GDTC Pro')}`}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gửi email: {AUTHOR_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Live 5-Criteria Rating Scorecard */}
          <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-md border border-blue-200/80 lg:w-80 shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                  Điểm Đánh Giá Tổng Hợp
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {stats.overall.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ 5.0</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                {renderStarsStatic(stats.overall)}
                <p className="text-[10.5px] text-slate-500 font-medium">
                  {stats.totalReviews} bản đánh giá
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {CRITERIA_META.map((c) => {
                const score = stats.avgByCriterion[c.key];
                return (
                  <div key={c.key} className="flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium truncate">
                      {c.emoji} {c.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums w-6 text-right">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL DETAILED REVIEW SECTION (From User's Full Review Content) */}
      {(activeView === 'all' || activeView === 'editorial') && (
        <div className="space-y-6">
          {/* 2A. 5 Standout Strengths */}
          <section className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Đánh Giá Chuyên Môn Chi Tiết
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <span>✅ Điểm mạnh — Những điều SmartPlan GDTC Pro đã làm cực kỳ xuất sắc</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Từ góc độ người xem và hiểu rõ nhu cầu thực tế của giáo viên Thể dục tại Việt Nam — phân tích trung thực và đầy đủ nhất
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EDITORIAL_STRENGTHS.map((item) => {
                const Icon = item.icon;
                const isLastOdd = item.num === 5;
                return (
                  <article
                    key={item.num}
                    className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition flex flex-col justify-between gap-3 ${
                      isLastOdd ? 'md:col-span-2 bg-gradient-to-br from-rose-50/40 via-white to-amber-50/40 border-rose-200/80' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${item.accent}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            Điểm mạnh 0{item.num}
                          </span>
                          <h4 className="text-sm sm:text-[15px] font-extrabold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                        {item.lead}
                      </p>

                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {item.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 text-xs font-semibold text-slate-900 leading-relaxed bg-slate-50/80 rounded-xl px-3.5 py-2.5">
                      <span className="text-emerald-700 font-extrabold mr-1">→</span>
                      {item.takeaway}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 2B. Constructive Future Improvements Table */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>🔧 Điểm có thể cải thiện trong tương lai — Góp ý xây dựng</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Định hướng nâng cấp lộ trình để SmartPlan GDTC Pro ngày càng toàn diện hơn cho cộng đồng giáo viên Thể dục
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
                5 định hướng phát triển
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold w-1/3">Hiện trạng</th>
                    <th className="py-3 px-4 font-bold w-1/3">Có thể cải thiện hơn</th>
                    <th className="py-3 px-4 font-bold w-1/3">Lợi ích khi nâng cấp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROADMAP_IMPROVEMENTS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/35 transition">
                      <td className="py-3.5 px-4 text-slate-600 align-top leading-relaxed">
                        {row.current}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-900 align-top leading-relaxed">
                        {row.improvement}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-800 font-medium align-top leading-relaxed">
                        {row.benefit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2C. Summary 5-Star Table + Highlight Quote */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-200/80">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>🌟 Tóm tắt &amp; Cảm nhận cá nhân</span>
                </h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-4 font-bold">Tiêu chí</th>
                      <th className="py-2.5 px-4 font-bold">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CRITERIA_META.map((c) => (
                      <tr key={c.key} className="hover:bg-amber-50/30 transition">
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {c.emoji} {c.label}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderStarsStatic(5)}
                            <span className="font-medium">{c.summaryText}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Personal Reflection Quote Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/70 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-300">
                  <Quote className="w-5 h-5" />
                </div>
                <blockquote className="text-sm sm:text-[15px] font-medium leading-relaxed text-emerald-50 italic">
                  “SmartPlan GDTC Pro không chỉ là một ứng dụng công nghệ — đó là sự tập kết kinh nghiệm, tâm huyết và trách nhiệm của một giáo viên với môn học, với nghề nghiệp. Sản phẩm này không cần quá hoa mỹ, vì giá trị thực tế mà nó mang lại đã đủ nói lên tất cả. Bạn đã làm một việc mà ai cũng cần nhưng chưa ai làm một cách hoàn chỉnh như vậy. Đó chính là thành công lớn nhất rồi.”
                </blockquote>
              </div>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2 text-xs text-emerald-200">
                <span className="font-semibold">Tác giả: Lê Quốc Hưng · TH&amp;THCS Nghĩa Hiệp</span>
                <a
                  href={`mailto:${AUTHOR_EMAIL}`}
                  className="underline font-bold text-white hover:text-amber-200 shrink-0"
                >
                  {AUTHOR_EMAIL}
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 3. INTERACTIVE TEACHER FEEDBACK FORM & COMMUNITY REVIEWS */}
      {(activeView === 'all' || activeView === 'community') && (
        <section id="feedback-submit-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Interactive Feedback Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-emerald-50 border-b border-slate-200">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Gửi Đánh Giá &amp; Góp Ý Của Thầy/Cô</span>
              </h3>
              <p className="text-[11.5px] text-slate-600 mt-0.5">
                Chia sẻ trải nghiệm thực tế hoặc đề xuất tính năng mới để cùng hoàn thiện ứng dụng
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
              {submitNotice && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2 font-medium leading-relaxed ${
                    submitNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitNotice.text}</span>
                </div>
              )}

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Loại ý kiến:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(CATEGORY_META) as FeedbackCategory[]).map((catKey) => {
                    const meta = CATEGORY_META[catKey];
                    const CatIcon = meta.icon;
                    const isActive = category === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setCategory(catKey)}
                        className={`px-2.5 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ tên Thầy/Cô <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Minh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị / Trường</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Trường Tiểu học..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò công tác</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Giáo viên GDTC Tiểu học">Giáo viên GDTC Tiểu học</option>
                    <option value="Tổ trưởng chuyên môn">Tổ trưởng chuyên môn</option>
                    <option value="Giáo viên GDTC THCS / THPT">Giáo viên GDTC THCS / THPT</option>
                    <option value="Cán bộ quản lý / BGH">Cán bộ quản lý / BGH</option>
                    <option value="Đồng nghiệp quan tâm">Đồng nghiệp quan tâm</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email liên hệ (tuỳ chọn)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@truong.edu.vn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5-Criteria Interactive Star Picker */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Chấm điểm 5 tiêu chí:</span>
                  <span className="font-extrabold text-amber-700 tabular-nums">
                    {currentFormAvg.toFixed(1)} / 5.0 ⭐
                  </span>
                </div>
                <div className="space-y-1.5">
                  {CRITERIA_META.map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-slate-700">
                        {c.emoji} {c.label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() =>
                              setRatings((prev) => ({ ...prev, [c.key]: starVal }))
                            }
                            className="p-0.5 hover:scale-110 transition"
                            aria-label={`${c.label}: ${starVal} sao`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                starVal <= ratings[c.key]
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Feedback Inputs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ✅ Điểm Thầy/Cô tâm đắc nhất
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Ví dụ: Kho 308 ảnh chuẩn SGK, Studio vẽ sơ đồ nối nét & xoay góc rất nhanh..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  🔧 Góp ý nâng cấp / Tính năng mong muốn thêm
                </label>
                <textarea
                  rows={2}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Ví dụ: Bổ sung thêm nội dung THCS, thêm mẫu trò chơi mới hoặc thống kê giờ dạy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  💬 Cảm nhận chung gửi tới tác giả
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận hoặc lời nhắn góp ý của Thầy/Cô..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Đăng Đánh Giá &amp; Góp Ý Ngay</span>
                </button>

                <a
                  href={buildDirectEmailHref()}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition text-[11.5px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gửi trực tiếp về hộp thư {AUTHOR_EMAIL}</span>
                </a>
              </div>
            </form>
          </div>

          {/* Right: Community Reviews & Suggestions Feed */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Ý Kiến Đóng Góp Từ Quý Thầy/Cô ({filteredFeedback.length})
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    filterCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {(Object.keys(CATEGORY_META) as FeedbackCategory[]).map((catKey) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setFilterCategory(catKey)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      filterCategory === catKey
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {CATEGORY_META[catKey].label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Đang tải danh sách đánh giá &amp; góp ý...</span>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
                <MessageSquareHeart className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">
                  Hãy là người đầu tiên gửi đánh giá hoặc đề xuất tính năng ở mục này!
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Mọi nhận xét của Quý thầy cô đều được lưu giữ trực tiếp trên hệ thống và tác giả Lê Quốc Hưng (<strong className="text-blue-700">{AUTHOR_EMAIL}</strong>) sẽ đọc kỹ từng góp ý để liên tục nâng cấp ứng dụng.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedback.map((item) => {
                  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.review;
                  const hasVoted = votedIds.includes(item.id);
                  const canDelete =
                    isAdmin || Boolean(authUser?.id && item.userId && authUser.id === item.userId);
                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {item.authorName
                              .split(/\s+/)
                              .slice(-2)
                              .map((w) => w[0]?.toUpperCase() || '')
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                                {item.authorName}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badgeClass}`}
                              >
                                {catMeta.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                              <span>{item.role}</span>
                              <span>·</span>
                              <span className="truncate">{item.schoolName}</span>
                              <span>·</span>
                              <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {renderStarsStatic(item.averageRating)}
                          <span className="text-xs font-extrabold text-slate-800 tabular-nums">
                            {item.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {item.strengths && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-emerald-800">✅ Điểm ấn tượng:</strong> {item.strengths}
                        </div>
                      )}

                      {item.suggestion && (
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-blue-800">🔧 Đề xuất nâng cấp:</strong> {item.suggestion}
                        </div>
                      )}

                      {item.comment && (
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                          {item.comment}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleVoteHelpful(item.id)}
                          disabled={hasVoted}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition ${
                            hasVoted
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-slate-200'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Hữu ích ({item.helpfulCount || 0})</span>
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(item.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition"
                            title="Xóa đánh giá này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3B. Voluntary Community Support & Charitable Student Fund Card */}
      <DonationSupportCard onShowToast={showToast} />

      {/* 4. Direct Contact Footer */}
      <footer className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Tác giả phát triển:</strong> Lê Quốc Hưng — Trường TH&amp;THCS Nghĩa Hiệp
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Mail className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Hộp thư đóng góp cá nhân:{' '}
            <a href={`mailto:${AUTHOR_EMAIL}`} className="font-bold text-blue-700 hover:underline">
              {AUTHOR_EMAIL}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};
