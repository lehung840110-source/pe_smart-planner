import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileJson,
  Film,
  GraduationCap,
  HardDriveDownload,
  Maximize2,
  MessageSquareQuote,
  Minimize2,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  Activity,
  X
} from 'lucide-react';
import { createFormationSvg } from '../data/formationDiagrams';
import { AppScreencastPreview } from './AppScreencastPreview';

export interface IntroSlideLiveStats {
  imageCount: number;
  planCount: number;
  savedVersionCount: number;
}

interface IntroSlideDeckProps {
  onNavigateTab?: (tabId: string) => void;
  onOpenAuth?: () => void;
  liveStats?: IntroSlideLiveStats;
}

interface SlideMeta {
  id: number;
  shortTitle: string;
  kicker: string;
  durationMs: number;
  speakerNote: string;
}

const SLIDE_META: SlideMeta[] = [
  {
    id: 1,
    shortTitle: 'Đêm khuya',
    kicker: 'KHỞI NGUỒN CÂU CHUYỆN',
    durationMs: 6000,
    speakerNote:
      'Câu chuyện bắt đầu từ một tối Chủ nhật quen thuộc: đồng hồ đã gần 11 giờ đêm, hạn nộp giáo án tuần mới đang cận kề, nhưng từng dòng nội dung và từng bức ảnh vẫn còn phải chỉnh sửa thủ công.'
  },
  {
    id: 2,
    shortTitle: 'Trước & Sau',
    kicker: 'NỖI ĐAU CHỈNH SỬA LẶP LẠI',
    durationMs: 6500,
    speakerNote:
      'Dạy song song Khối 1, Khối 3 và Khối 5 đồng nghĩa mỗi tuần là 6 tiết dạy kèm lịch chung. Việc cắt dán từng tranh động tác, căn lại từng dòng bảng 4 cột chiếm tới 2–3 giờ mỗi cuối tuần — đó là lúc tôi tự hỏi: phải có một trợ lý thông minh giúp làm việc này nhanh hơn.'
  },
  {
    id: 3,
    shortTitle: '3 Nguyên tắc',
    kicker: 'NGUYÊN TẮC CỐT LÕI',
    durationMs: 6000,
    speakerNote:
      'Khi xây dựng SmartPlan GDTC Pro, tôi giữ một nguyên tắc bất di bất dịch: AI chỉ là trợ lý làm phần tốn thời gian, còn giáo viên vẫn là người quyết định chuyên môn — đảm bảo thống nhất chương trình, trực quan sinh động và thật dễ thao tác.'
  },
  {
    id: 4,
    shortTitle: 'Mở các Tab',
    kicker: 'MINH HỌA MỞ CÁC TAB & TÍNH NĂNG',
    durationMs: 13000,
    speakerNote:
      'Trên giao diện thật của ứng dụng, con trỏ chuột lần lượt mở từng tab khép kín: Tab 1 quét cắt ảnh SGK, Tab 2 làm sạch ảnh, Tab 3 giáo án mẫu và Tab 5 sinh giáo án tuần mới.'
  },
  {
    id: 5,
    shortTitle: 'Sửa & Thay ảnh',
    kicker: 'SỬA ĐƠN GIẢN · THAY ẢNH & 67 SƠ ĐỒ',
    durationMs: 10400,
    speakerNote:
      'Khung quay phóng to trực tiếp vào bảng 4 cột thật để thấy thao tác cực kỳ đơn giản: sửa chữ ngay trong ô, 1 chạm bấm Đổi ảnh và Thêm sơ đồ đội hình theo từng khối.'
  },
  {
    id: 6,
    shortTitle: 'Kiểm đồng bộ',
    kicker: 'KIỂM TRA ĐỒNG BỘ 93% → 100%',
    durationMs: 8000,
    speakerNote:
      'Trên giao diện Tab 5, hệ thống tự quét 5 nhóm tiêu chí PPCT, động tác mới, tranh kỹ thuật và nhắc bấm Tự Động Chuẩn Hóa Khớp 100% Ngay.'
  },
  {
    id: 7,
    shortTitle: 'Sao lưu JSON',
    kicker: 'SỞ HỮU VÀ AN TÂM',
    durationMs: 6000,
    speakerNote:
      'Công sức tích lũy hàng trăm hình ảnh và hàng chục bản giáo án không bao giờ sợ thất lạc khi đổi máy hay trình duyệt, nhờ cơ chế đóng gói sao lưu và khôi phục trọn vẹn chỉ qua một tệp JSON.'
  },
  {
    id: 8,
    shortTitle: 'Công việc thật',
    kicker: 'TỪ LỚP HỌC THẬT',
    durationMs: 6000,
    speakerNote:
      'Mọi chi tiết nhỏ đều sinh ra từ thực tế đứng lớp tại Trường TH&THCS Nghĩa Hiệp: giữ nguyên Phiên bản #5 chính thức, Tiếp tục bản nháp dở (v4) và Lịch sử sửa để không bao giờ mất bản sửa cuối.'
  },
  {
    id: 9,
    shortTitle: 'Chuyển đổi số',
    kicker: 'Ý NGHĨA CỦA CHUYỂN ĐỔI SỐ',
    durationMs: 6500,
    speakerNote:
      'Chuyển đổi số thực chất không phải là đưa tờ giấy lên màn hình máy tính, mà là biến quy trình chuyên môn và công sức âm thầm của người giáo viên thành một hệ thống dữ liệu có thể tìm kiếm, kiểm tra và phục vụ lại cho đồng nghiệp.'
  },
  {
    id: 10,
    shortTitle: 'Xuất A4 & Lan tỏa',
    kicker: 'XEM TRƯỚC A4 · XUẤT WORD / PDF',
    durationMs: 8000,
    speakerNote:
      'Bước cuối cùng, con trỏ mở Tab 6 xem trọn bản in A4 gộp cả 3 khối và xuất thẳng file Word hoặc PDF chỉ với 1 lần nhấn — trả lại sự thảnh thơi cho tối Chủ nhật của thầy cô.'
  }
];

const PDF_ASSET_URL =
  '/assets/aistudio/SmartPlan-GDTC-Pro-Mot-hanh-trinh-chuyen-djoi-so-bat-djau-tu-lop-hoc_43c427f5.pdf';

const FeatheredDivider: React.FC<{ light?: boolean; className?: string }> = ({
  light = false,
  className = ''
}) => {
  const stroke = light ? '#E6F0E4' : '#1B5E38';
  return (
    <div className={`flex items-center w-full select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 36 12" className="w-7 h-3 shrink-0" fill="none">
        <path
          d="M2 6h34M6 2l4 4-4 4M11 2l4 4-4 4M16 2l4 4-4 4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="h-[1.5px] flex-1" style={{ backgroundColor: stroke }} />
      <svg viewBox="0 0 36 12" className="w-7 h-3 shrink-0" fill="none">
        <path
          d="M0 6h34M30 2l-4 4 4 4M25 2l-4 4 4 4M20 2l-4 4 4 4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const IntroSlideDeck: React.FC<IntroSlideDeckProps> = ({
  onNavigateTab,
  onOpenAuth,
  liveStats
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [beforeAfterMode, setBeforeAfterMode] = useState<'before' | 'after'>('before');
  const [slide5Tab, setSlide5Tab] = useState<'screencast' | 'gallery'>('screencast');
  const [selectedFormationIdx, setSelectedFormationIdx] = useState<number>(0);
  const [auditFilter, setAuditFilter] = useState<'all' | 'warn'>('all');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [videoTickPct, setVideoTickPct] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  const formationSamples = useMemo(
    () => [
      {
        label: 'Nhận lớp (Khối 1)',
        phase: 'Phần Mở đầu · 4 hàng ngang cự ly hẹp',
        svgUrl: createFormationSvg('Nhận lớp · Điểm danh', 'Khối 1', 'nhan_lop', 'clean')
      },
      {
        label: 'Khởi động (Khối 3)',
        phase: 'Khởi động chung · 4 hàng so le 1 sải tay',
        svgUrl: createFormationSvg('Khởi động so le', 'Khối 3', 'khoi_dong', 'clean')
      },
      {
        label: 'Luyện tập 4 tổ (Khối 5)',
        phase: 'Phân nhóm · 4 khu vực sân tự quản',
        svgUrl: createFormationSvg('Tập theo 4 tổ', 'Khối 5', 'to_nhom', 'clean')
      },
      {
        label: 'Tập đồng loạt',
        phase: 'Hình thành & Luyện tập · 2x8 nhịp',
        svgUrl: createFormationSvg('Tập đồng loạt', 'Cả lớp', 'dong_loat', 'clean')
      }
    ],
    []
  );

  const goToSlide = (index: number) => {
    const bounded = (index + SLIDE_META.length) % SLIDE_META.length;
    setDirection(bounded >= currentSlide ? 'next' : 'prev');
    setCurrentSlide(bounded);
    setVideoTickPct(0);
  };

  const handleNext = () => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % SLIDE_META.length);
    setVideoTickPct(0);
  };

  const handlePrev = () => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + SLIDE_META.length) % SLIDE_META.length);
    setVideoTickPct(0);
  };

  const startShortVideoMode = () => {
    setIsVideoMode(true);
    setDirection('next');
    setCurrentSlide(0);
    setVideoTickPct(0);
  };

  useEffect(() => {
    if (!isVideoMode) {
      setVideoTickPct(0);
      return;
    }

    const totalMs = SLIDE_META[currentSlide]?.durationMs || 6500;
    const stepInterval = 100;
    let elapsed = 0;

    const timer = window.setInterval(() => {
      elapsed += stepInterval;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setVideoTickPct(pct);
      if (elapsed >= totalMs) {
        setDirection('next');
        setCurrentSlide((prev) => (prev + 1) % SLIDE_META.length);
      }
    }, stepInterval);

    return () => window.clearInterval(timer);
  }, [isVideoMode, currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 48) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const renderSlideContent = (idx: number) => {
    switch (idx) {
      /* SLIDE 1: ĐÊM KHUYA & CÂU HỎI KHỞI NGUỒN */
      case 0:
        return (
          <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0F2418] via-[#1B3A28] to-[#2B4B37] flex items-center p-6 sm:p-10 lg:p-14">
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              viewBox="0 0 1200 675"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <radialGradient id="lampGlow" cx="82%" cy="18%" r="48%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#1B3A28" stopOpacity="0" />
              </radialGradient>
              <rect width="1200" height="675" fill="url(#lampGlow)" />
              <rect x="740" y="135" width="380" height="440" rx="18" fill="none" stroke="#E4EDE0" strokeWidth="1.5" />
              <line x1="780" y1="210" x2="1080" y2="210" stroke="#E4EDE0" strokeWidth="1.2" strokeDasharray="6 4" />
              <line x1="780" y1="275" x2="1050" y2="275" stroke="#E4EDE0" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="930" cy="460" r="68" fill="none" stroke="#E4EDE0" strokeWidth="1.2" />
            </svg>

            <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 bg-[#FAF9F5] text-[#1E2E22] rounded-2xl p-6 sm:p-9 lg:p-11 shadow-2xl border border-[#C7D8C2]">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#144A2B]">
                  <span className="inline-flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    <span>22:45 · Đêm Chủ Nhật</span>
                  </span>
                  <span className="text-[#91AA95]">·</span>
                  <span>SmartPlan GDTC Pro</span>
                </div>

                <h3 className="mt-3 text-2xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight leading-[1.16] text-[#18291C]">
                  Những đêm khuya, trang giáo án vẫn còn dang dở đến hạn nộp
                </h3>

                <FeatheredDivider className="my-5" />

                <p className="font-serif text-sm sm:text-base lg:text-[17px] leading-relaxed text-[#2D3E31]">
                  Từ những lần chỉnh sửa từng dòng, căn chỉnh từng hình ảnh lặp đi lặp lại rất mất thời gian… để tìm lời giải: <strong className="text-[#144A2B] font-semibold">làm sao để có một trợ lý hỗ trợ tạo giáo án mới thống nhất chương trình, trực quan sinh động và thật dễ thao tác?</strong>
                </p>

                <div className="mt-6 pt-4 border-t border-[#D6E3D2] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#3D5242]">
                    <strong className="text-[#144A2B]">Tác giả: Lê Quốc Hưng</strong> · Giáo viên Trường TH&amp;THCS Nghĩa Hiệp
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={startShortVideoMode}
                      className="px-3.5 py-2 rounded-lg bg-[#E5EFE3] hover:bg-[#D5E6D1] text-[#144A2B] border border-[#B9D0B5] text-xs font-semibold inline-flex items-center gap-1.5 transition whitespace-nowrap"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Phát như Video Ngắn</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 rounded-lg bg-[#144A2B] hover:bg-[#0F3820] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                    >
                      <span>Bắt đầu câu chuyện</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex lg:col-span-4 flex-col gap-3 text-[#E6F0E4] pl-2">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                    <Clock className="w-4 h-4" />
                    <span>Nhật ký tuần mới</span>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-emerald-50/90 italic">
                    “Khối 1, Khối 3, Khối 5 — 6 tiết dạy cùng một tuần. Chỉ cần sót một hình kỹ thuật hay nhầm một sơ đồ đội hình là lại phải mở máy sửa lại từ đầu.”
                  </p>
                  <div className="text-[11px] text-emerald-200/80 pt-1 border-t border-white/10">
                    Bấm “Phát như Video Ngắn” để xem hành trình kèm minh họa con trỏ &amp; hiệu ứng zoom
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      /* SLIDE 2: NỖI ĐAU CHỈNH SỬA & ĐỐI CHIẾU TRƯỚC - SAU */
      case 1:
        return (
          <div className="h-full w-full bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                  NỖI ĐAU TỪNG DÒNG, TỪNG BỨC ẢNH
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-tight leading-[1.18] text-[#1D2C20]">
                  Sửa từng dòng, ghép từng hình — tất cả đều mất thời gian
                </h3>
              </div>

              <FeatheredDivider />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#E5EFE3] rounded-xl p-4 sm:p-5 border border-[#CFE0CA] space-y-1.5">
                  <h4 className="text-sm sm:text-base font-semibold text-[#18291C]">
                    Chỉnh sửa lặp lại mỗi tuần
                  </h4>
                  <p className="font-serif text-xs sm:text-[13px] leading-relaxed text-[#304234]">
                    Cùng một khung 4 cột, cứ sang tuần mới lại cắt dán lại tranh động tác, đổi tên bài và rà từng dòng để kịp hạn nộp.
                  </p>
                </div>

                <div className="bg-[#E5EFE3] rounded-xl p-4 sm:p-5 border border-[#CFE0CA] space-y-1.5">
                  <h4 className="text-sm sm:text-base font-semibold text-[#18291C]">
                    Khát khao một người trợ lý
                  </h4>
                  <p className="font-serif text-xs sm:text-[13px] leading-relaxed text-[#304234]">
                    Làm sao để tạo giáo án mới nhanh gọn, thống nhất PPCT, trực quan sinh động mà thầy cô vẫn làm chủ hoàn toàn?
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white border border-[#C6D8C0] shadow-md overflow-hidden">
                <div className="bg-[#E5EFE3] px-4 py-3 border-b border-[#CFE0CA] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#144A2B]">
                    So sánh thực tế: Trước &amp; Sau khi có trợ lý
                  </span>
                  <div className="inline-flex rounded-lg bg-white p-0.5 border border-[#C3D5BE] text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setBeforeAfterMode('before')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        beforeAfterMode === 'before'
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Trước đây
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeforeAfterMode('after')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        beforeAfterMode === 'after'
                          ? 'bg-[#144A2B] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Nhờ SmartPlan
                    </button>
                  </div>
                </div>

                {beforeAfterMode === 'before' ? (
                  <div className="p-5 space-y-3 bg-rose-50/40">
                    <div className="flex items-baseline justify-between border-b border-rose-200/70 pb-2.5">
                      <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                        Soạn Word thủ công cuối tuần
                      </span>
                      <span className="text-xl font-bold text-rose-700 tabular-nums">~2,5 – 3 giờ / tuần</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Chụp/cắt từng hình SGK rời rạc, dán vào bảng Word rất dễ xô lệch cột.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Dạy đồng thời Khối 1, 3, 5 dễ nhầm sơ đồ đội hình hoặc sót phần giảm tải HS khuyết tật.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>Sửa qua nhiều lần dễ ghi đè nhầm, thất lạc bản hoàn chỉnh nhất trước giờ nộp.</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-5 space-y-3 bg-emerald-50/40">
                    <div className="flex items-baseline justify-between border-b border-emerald-200/80 pb-2.5">
                      <span className="text-xs font-semibold text-[#144A2B] uppercase tracking-wider">
                        Có SmartPlan GDTC Pro hỗ trợ
                      </span>
                      <span className="text-xl font-bold text-[#144A2B] tabular-nums">~10 – 15 phút / tuần</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#144A2B] shrink-0 mt-0.5" />
                        <span>Đồng bộ PPCT 3 khối, tự phân biệt động tác mới (có diễn giải kỹ thuật) và ôn tập.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#144A2B] shrink-0 mt-0.5" />
                        <span>Bấm 1 chạm chèn tranh SGK đã làm sạch &amp; sơ đồ đội hình riêng theo từng khối.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#144A2B] shrink-0 mt-0.5" />
                        <span>Tự kiểm định độ khớp, chốt lịch sử phiên bản và xuất Word / PDF A4 đồng loạt.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      /* SLIDE 3: 3 NGUYÊN TẮC CỐT LÕI */
      case 2:
        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#144A2B] text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#B8D7B2]">
                NGUYÊN TẮC CỐT LÕI
              </p>
              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.12] text-white">
                Giáo viên vẫn là người quyết định.
              </h3>
              <FeatheredDivider light />
              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#E4EFE1]">
                Đây là ứng dụng trợ lý của giáo viên — đảm nhận phần việc cơ học tốn thời gian, không phải AI làm thay tư duy sư phạm.
              </p>
            </div>

            <div className="lg:col-span-7 bg-[#FAF9F5] text-[#1E2E22] p-7 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
              <div>
                <h4 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D2C20]">
                  3 tiêu chí tạo nên một giáo án mới chuẩn mực
                </h4>
                <FeatheredDivider className="mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    num: '01',
                    title: 'Thống nhất chương trình',
                    desc: 'Khớp đúng tuần học, PPCT Khối 1, 3, 5 và tách bạch động tác mới với nội dung ôn tập.'
                  },
                  {
                    num: '02',
                    title: 'Trực quan sinh động',
                    desc: 'Bóc tách làm sạch ảnh SGK, gợi ý hình kỹ thuật và sơ đồ đội hình đúng vị trí.'
                  },
                  {
                    num: '03',
                    title: 'Dễ thao tác & Xác nhận',
                    desc: 'Chỉnh sửa trực tiếp trên bảng 4 cột, xem trước A4 và giáo viên là người chốt bản cuối.'
                  }
                ].map((col) => (
                  <div key={col.num} className="space-y-2.5">
                    <div className="text-lg font-semibold text-[#144A2B] tabular-nums">{col.num}</div>
                    <div className="h-[1.5px] w-full bg-[#1B5E38]" />
                    <h5 className="text-base sm:text-lg font-semibold text-[#1D2C20] leading-snug">
                      {col.title}
                    </h5>
                    <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#384A3C]">
                      {col.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* SLIDE 4: CON TRỎ CHUỘT MỞ CÁC TAB & TÍNH NĂNG ỨNG DỤNG (ZOOM-IN / ZOOM-OUT) */
      case 3:
        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-9 flex flex-col justify-center space-y-4">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                  TỪ MẪU ĐẾN HỆ THỐNG THAO TÁC
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-[1.18] text-[#1D2C20]">
                  Con trỏ mở từng tab tính năng khép kín
                </h3>
              </div>

              <FeatheredDivider />

              <div className="space-y-2.5 font-serif text-xs sm:text-sm text-[#324536]">
                <p>
                  <strong>01 · Quét &amp; Làm sạch (Tab 1–2):</strong> Khoanh cắt hình từ SGK điện tử và tẩy nền trắng tự động.
                </p>
                <p>
                  <strong>02 · Sinh giáo án chuẩn (Tab 3–5):</strong> Khớp PPCT theo tuần, chèn kịch bản và ảnh kỹ thuật đúng vị trí.
                </p>
                <p>
                  <strong>03 · Xem trước &amp; Xuất bản (Tab 6):</strong> Rà soát bố cục A4 cả 3 khối và xuất Word/PDF ngay lập tức.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#DCE8D8] p-4 sm:p-6 flex flex-col justify-center">
              <AppScreencastPreview
                mode="tabs_tour"
                autoAnimate={true}
                onNavigateTab={(tabId) => {
                  setIsFullscreen(false);
                  onNavigateTab?.(tabId);
                }}
              />
            </div>
          </div>
        );

      /* SLIDE 5: THAO TÁC SỬA TRỰC TIẾP, THAY ẢNH & KHO 67 SƠ ĐỒ */
      case 4: {
        const activeSample = formationSamples[selectedFormationIdx] || formationSamples[0];
        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-9 flex flex-col justify-center space-y-4">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                SỬA ĐƠN GIẢN · 67 SƠ ĐỒ TRỰC QUAN
              </p>

              <div className="text-5xl sm:text-6xl font-light text-[#1E3A28] tracking-tight tabular-nums leading-none">
                67
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-[1.18] text-[#1D2C20]">
                Sửa từng dòng, thay ảnh &amp; đổi sơ đồ chỉ trong 1 chạm
              </h3>

              <FeatheredDivider />

              <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#2D3E31]">
                Phóng to vào từng ô bảng 4 cột để gõ sửa trực tiếp, đổi tranh động tác SGK hoặc chọn nhanh sơ đồ Khối 1, Khối 3, Khối 5 mà không làm xô lệch định dạng.
              </p>

              <div className="inline-flex rounded-lg bg-[#E5EFE3] p-1 border border-[#C6D8C0] text-[11px] font-semibold w-fit">
                <button
                  type="button"
                  onClick={() => setSlide5Tab('screencast')}
                  className={`px-3 py-1 rounded-md transition ${
                    slide5Tab === 'screencast' ? 'bg-[#144A2B] text-white' : 'text-[#144A2B]'
                  }`}
                >
                  Video thao tác sửa &amp; thay ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setSlide5Tab('gallery')}
                  className={`px-3 py-1 rounded-md transition ${
                    slide5Tab === 'gallery' ? 'bg-[#144A2B] text-white' : 'text-[#144A2B]'
                  }`}
                >
                  Xem thử 67 sơ đồ
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#DCE8D8] p-4 sm:p-6 flex flex-col justify-center">
              {slide5Tab === 'screencast' ? (
                <AppScreencastPreview
                  mode="edit_replace"
                  autoAnimate={true}
                  onNavigateTab={(tabId) => {
                    setIsFullscreen(false);
                    onNavigateTab?.(tabId);
                  }}
                />
              ) : (
                <div className="bg-white rounded-xl border border-[#C3D5BE] shadow-md p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#144A2B]">{activeSample.label}</span>
                    <span className="text-[10.5px] text-slate-500">{activeSample.phase}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={activeSample.svgUrl}
                      alt={activeSample.label}
                      className="max-h-48 w-auto object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {formationSamples.map((sample, sIdx) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setSelectedFormationIdx(sIdx)}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium text-left transition border ${
                          selectedFormationIdx === sIdx
                            ? 'bg-[#144A2B] text-white border-[#144A2B]'
                            : 'bg-[#F5F9F3] text-[#283B2C] border-[#D4E2D0] hover:bg-[#E7F0E5]'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      /* SLIDE 6: KIỂM TRA ĐỒNG BỘ 93% → 100% (KÈM MÔ PHỎNG QUÉT ĐỒNG BỘ) */
      case 5: {
        const radius = 44;
        const circumference = 2 * Math.PI * radius;
        const matchPct = 93.33;
        const matchLength = (matchPct / 100) * circumference;

        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-9 flex flex-col justify-center space-y-3.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                KIỂM TRA ĐỒNG BỘ TỰ ĐỘNG
              </p>

              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-light text-[#1E3A28] tabular-nums leading-none">
                  93%
                </div>

                <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" role="img" aria-label="Biểu đồ 93.33% đạt chuẩn và 6.67% cần rà soát">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="#D97706" strokeWidth="16" />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#144A2B"
                    strokeWidth="16"
                    strokeDasharray={`${matchLength} ${circumference}`}
                    transform="rotate(-82 60 60)"
                  />
                </svg>

                <div className="text-[10.5px] space-y-1 tabular-nums">
                  <button
                    type="button"
                    onClick={() => setAuditFilter('all')}
                    className={`block px-2 py-0.5 rounded font-semibold ${
                      auditFilter === 'all' ? 'bg-[#E5EFE3] text-[#144A2B]' : 'text-[#144A2B]'
                    }`}
                  >
                    93.33% Đạt (28)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditFilter('warn')}
                    className={`block px-2 py-0.5 rounded font-semibold ${
                      auditFilter === 'warn' ? 'bg-amber-100 text-amber-800' : 'text-amber-700'
                    }`}
                  >
                    6.67% Nhắc (2)
                  </button>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-[1.2] text-[#1D2C20]">
                Tự rà soát độ khớp PPCT, ảnh SGK, sơ đồ &amp; HS khuyết tật
              </h3>

              <FeatheredDivider />

              <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#2D3E31]">
                {auditFilter === 'warn'
                  ? 'Hệ thống chỉ rõ 2 mục cần lưu ý (đổi sơ đồ phân biệt khối và ghi chú HS khuyết tật) để thầy cô bổ sung lên 100%.'
                  : 'Bên cạnh minh họa quá trình quét kiểm định: từ 28/30 tiêu chí đạt chuẩn, bấm 1 chạm để hoàn thiện trọn 30/30 tiêu chí.'}
              </p>
            </div>

            <div className="lg:col-span-7 bg-[#DCE8D8] p-4 sm:p-6 flex flex-col justify-center">
              <AppScreencastPreview
                mode="sync_audit"
                autoAnimate={true}
                onNavigateTab={(tabId) => {
                  setIsFullscreen(false);
                  onNavigateTab?.(tabId);
                }}
              />
            </div>
          </div>
        );
      }

      /* SLIDE 7: SỞ HỮU VÀ AN TÂM (+ SỐ LIỆU THỰC TẾ TRÊN MÁY) */
      case 6:
        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 bg-[#DCE8D8] p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#144A2B] text-white flex items-center justify-center shadow-md">
                <FileJson className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <div className="text-sm font-semibold text-[#144A2B]">Gói sao lưu toàn vẹn (.JSON)</div>
                <p className="font-serif text-xs leading-relaxed text-[#354B3A]">
                  Lưu trữ độc lập trên máy cá nhân hoặc đồng bộ tài khoản, phục hồi nguyên vẹn khi đổi máy tính.
                </p>
              </div>
              <div className="w-full max-w-xs bg-white/95 rounded-lg border border-[#C3D5BE] p-3 text-left text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-[#144A2B] font-semibold">
                  <span>SmartPlan_Backup.json</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-slate-600">Ảnh SGK · Giáo án 3 khối · Mẫu người dùng</div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                  SỞ HỮU VÀ AN TÂM
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl lg:text-[36px] font-semibold tracking-tight text-[#1D2C20]">
                  Bảo vệ trọn vẹn công sức đã tạo ra
                </h3>
                <FeatheredDivider className="mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: '173', label: 'hình ảnh đã bóc tách' },
                  { value: '80', label: 'kế hoạch bài dạy' },
                  { value: '150,85 MB', label: 'dữ liệu tích lũy' }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#E5EFE3] rounded-xl p-5 border border-[#CFE0CA] flex flex-col justify-between"
                  >
                    <div className="text-3xl sm:text-4xl font-light text-[#1E3A28] tabular-nums leading-tight">
                      {stat.value}
                    </div>
                    <div className="mt-3 font-serif text-sm text-[#2E4132]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#2D3E31]">
                Sao lưu và khôi phục toàn bộ ảnh, giáo án và dữ liệu chỉ qua một tệp JSON khi cần chuyển máy.
              </p>

              {liveStats && (
                <div className="rounded-lg bg-white border border-[#C6D8C0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#283B2C]">
                  <span className="font-semibold text-[#144A2B]">Đang sẵn có ngay trong phiên làm việc của bạn:</span>
                  <span className="tabular-nums font-medium">
                    <strong>{liveStats.imageCount}</strong> hình ảnh ·{' '}
                    <strong>{liveStats.planCount}</strong> giáo án ·{' '}
                    <strong>{liveStats.savedVersionCount}</strong> phiên bản đã lưu
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      /* SLIDE 8: CÔNG VIỆC THẬT & CHỐT PHIÊN BẢN CUỐI (GIAO DIỆN THẬT) */
      case 7:
        return (
          <div className="h-full w-full bg-[#FAF9F5] text-[#1E2E22] p-6 sm:p-10 lg:p-11 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                  XÂY DỰNG TỪ LỚP HỌC THẬT
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-[1.18] text-[#1D2C20]">
                  Giải quyết đúng những nút thắt tại Trường TH&amp;THCS Nghĩa Hiệp
                </h3>
              </div>

              <FeatheredDivider />

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  {
                    icon: CalendarClock,
                    title: 'Giảm thời gian',
                    desc: 'Sửa trực tiếp, thay ảnh & tiếp tục bản nháp dở.'
                  },
                  {
                    icon: Activity,
                    title: 'Đủ tài nguyên',
                    desc: 'Khắc phục thiếu tranh động tác & nhầm sơ đồ.'
                  },
                  {
                    icon: GraduationCap,
                    title: 'Chuẩn hóa',
                    desc: 'Phân hóa rõ theo khối, gồm HS khuyết tật.'
                  },
                  {
                    icon: HardDriveDownload,
                    title: 'Không thất lạc',
                    desc: 'Lưu lịch sử phiên bản để quay lại bản ưng ý.'
                  }
                ].map((col) => {
                  const Icon = col.icon;
                  return (
                    <div key={col.title} className="space-y-1.5">
                      <Icon className="w-6 h-6 text-[#144A2B] stroke-[1.6]" />
                      <h4 className="text-sm font-semibold text-[#1D2C20] leading-snug">
                        {col.title}
                      </h4>
                      <p className="font-serif text-xs leading-relaxed text-[#384A3C]">{col.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              <AppScreencastPreview
                mode="version_history"
                autoAnimate={true}
                onNavigateTab={(tabId) => {
                  setIsFullscreen(false);
                  onNavigateTab?.(tabId);
                }}
              />
            </div>
          </div>
        );

      /* SLIDE 9: Ý NGHĨA CỦA CHUYỂN ĐỔI SỐ */
      case 8:
        return (
          <div className="h-full w-full bg-[#FAF9F5] text-[#1E2E22] flex flex-col">
            <div className="h-24 sm:h-28 w-full bg-gradient-to-r from-[#D9E7D5] via-[#E6EFE3] to-[#D1E2CC] border-b border-[#C5D6C0] relative overflow-hidden flex items-center justify-between px-8 sm:px-14">
              <svg
                className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
                viewBox="0 0 1200 160"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 120 Q 300 40 600 100 T 1200 70" fill="none" stroke="#144A2B" strokeWidth="1.5" />
                <path d="M0 140 Q 400 70 800 120 T 1200 95" fill="none" stroke="#38A169" strokeWidth="1" strokeDasharray="6 6" />
              </svg>
              <div className="relative z-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#144A2B]">
                TỪ ĐÊM KHUYA ĐẾN HỆ THỐNG SỐ
              </div>
              <div className="relative z-10 hidden sm:flex items-center gap-4 text-xs text-[#2B4331] font-medium">
                <span>Chuẩn hóa dữ liệu</span>
                <span>·</span>
                <span>Tái sử dụng tài nguyên</span>
                <span>·</span>
                <span>Phục vụ đồng nghiệp</span>
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#144A2B]">
                  Ý NGHĨA CỦA CHUYỂN ĐỔI SỐ
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl lg:text-[36px] font-semibold tracking-tight text-[#1D2C20]">
                  Chuyển đổi số không phải là đưa giấy tờ lên máy tính
                </h3>
              </div>

              <FeatheredDivider />

              <div className="relative pt-2">
                <div className="hidden md:block absolute top-4 left-[12.5%] right-[12.5%] h-px bg-[#283B2D]/40" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-center">
                  {[
                    {
                      from: 'Quy trình chuyên môn',
                      to: 'Dữ liệu có cấu trúc'
                    },
                    {
                      from: 'Kinh nghiệm cá nhân',
                      to: 'Thư viện tìm kiếm và tái sử dụng'
                    },
                    {
                      from: 'Những lỗi thường gặp',
                      to: 'Các tiêu chí kiểm tra được'
                    },
                    {
                      from: 'Công sức âm thầm của giáo viên',
                      to: 'Một hệ thống phục vụ đồng nghiệp'
                    }
                  ].map((node) => (
                    <div
                      key={node.from}
                      className="relative flex flex-col items-center space-y-2.5"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1E2E22] border-2 border-[#FAF9F5] z-10 hidden md:block" />
                      <p className="font-serif text-xs sm:text-sm text-[#354839] min-h-[2.5rem] flex items-center justify-center">
                        {node.from}
                      </p>
                      <ArrowDown className="w-4 h-4 text-[#144A2B]" />
                      <p className="font-serif font-bold text-xs sm:text-sm text-[#144A2B] leading-snug">
                        {node.to}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      /* SLIDE 10: XEM TRƯỚC A4, XUẤT WORD / PDF & LAN TỎA */
      case 9:
      default:
        return (
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-[#144A2B] text-white p-6 sm:p-9 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#B8D7B2]">
                  HOÀN THIỆN &amp; LAN TỎA
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                  Trả lại sự thảnh thơi cho tối Chủ nhật
                </h3>
                <FeatheredDivider light />
                <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#E7F1E5]">
                  Từ trang giáo án dang dở lúc 22:45 đến bản in A4 chuẩn Công văn 5512 xuất Word/PDF chỉ trong vài phút — để thầy cô dành trọn tâm huyết cho sân bãi và học sinh.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/15">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreen(false);
                      onNavigateTab('tab-generator');
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-white hover:bg-[#E5EFE3] text-[#144A2B] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Tạo Giáo Án Mới Ngay (Tab 5)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreen(false);
                      onOpenAuth();
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 text-white text-xs font-semibold transition"
                  >
                    Đăng Nhập Để Lưu &amp; Xuất Word/PDF
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#DCE8D8] p-4 sm:p-6 flex flex-col justify-center">
              <AppScreencastPreview
                mode="export_a4"
                autoAnimate={true}
                onNavigateTab={(tabId) => {
                  setIsFullscreen(false);
                  onNavigateTab?.(tabId);
                }}
              />
            </div>
          </div>
        );
    }
  };

  const DeckBody = ({ fullscreen }: { fullscreen: boolean }) => (
    <div
      className={
        fullscreen
          ? 'w-full max-w-6xl mx-auto flex flex-col gap-3 h-full justify-center'
          : 'bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden'
      }
    >
      {/* Top Deck Utility Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 ${
          fullscreen
            ? 'bg-[#12271A] text-white rounded-xl border border-emerald-900/60'
            : 'bg-slate-50 border-b border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold tracking-wide text-[#144A2B] bg-[#E5EFE3] px-2.5 py-1 rounded-md tabular-nums shrink-0">
            {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDE_META.length).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className={`text-xs sm:text-sm font-bold truncate ${fullscreen ? 'text-white' : 'text-slate-900'}`}>
              Slide Câu Chuyện &amp; Video Minh Họa Thao Tác Ứng Dụng
            </h3>
            <p className={`text-[11px] truncate ${fullscreen ? 'text-emerald-200/80' : 'text-slate-500'}`}>
              {SLIDE_META[currentSlide].kicker} · {isVideoMode ? 'Đang phát như Video ngắn' : 'Phím ← / → hoặc vuốt để lật'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSpeakerNotes((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 border ${
              showSpeakerNotes
                ? 'bg-[#E5EFE3] text-[#144A2B] border-[#B7CFB2]'
                : fullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Bật/tắt gợi ý lời dẫn khi trình bày trước đồng nghiệp"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Lời dẫn</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVideoMode((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 border ${
              isVideoMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                : fullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Tự động chuyển slide và phóng to thu nhỏ như một video ngắn"
          >
            {isVideoMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isVideoMode ? 'Dừng Video' : 'Phát Video Ngắn'}</span>
          </button>

          <a
            href={PDF_ASSET_URL}
            download="SmartPlan-GDTC-Pro-Mot-hanh-trinh-chuyen-doi-so.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 border ${
              fullscreen
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Mở hoặc tải bản PDF gốc 10 trang"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Gốc</span>
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              fullscreen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-[#144A2B] hover:bg-[#0F3820] text-white'
            }`}
          >
            {fullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Thu gọn</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Toàn màn hình</span>
              </>
            )}
          </button>

          {fullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Đóng trình chiếu toàn màn hình"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 16:9 Slide Stage with Cinematic Cut / Zoom Transition */}
      <div
        className={`relative w-full overflow-hidden select-none ${
          fullscreen
            ? 'rounded-2xl shadow-2xl border border-emerald-900/50 min-h-[430px] lg:aspect-[16/9]'
            : 'min-h-[430px] lg:aspect-[16/9]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={currentSlide}
          className={`w-full h-full transition-all duration-500 ease-out animate-in fade-in zoom-in-95 ${
            direction === 'next' ? 'slide-in-from-right-3' : 'slide-in-from-left-3'
          }`}
        >
          {renderSlideContent(currentSlide)}
        </div>

        {/* Video Progress Bar at bottom edge of stage when Video Mode is active */}
        {isVideoMode && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20 z-30">
            <div
              className="h-full bg-emerald-400 transition-[width] duration-100 ease-linear"
              style={{ width: `${videoTickPct}%` }}
            />
          </div>
        )}

        {/* Left / Right Floating Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#144A2B] shadow-md border border-[#C6D8C0] flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#144A2B] z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#144A2B] shadow-md border border-[#C6D8C0] flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#144A2B] z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Optional Speaker Note Narration Strip */}
      {showSpeakerNotes && (
        <div
          className={`px-4 sm:px-6 py-3 border-t flex items-start gap-3 text-xs leading-relaxed ${
            fullscreen
              ? 'bg-[#12271A] border-emerald-900/60 text-emerald-50 rounded-xl'
              : 'bg-[#F5F9F3] border-[#DCE8D8] text-[#283B2C]'
          }`}
        >
          <MessageSquareQuote
            className={`w-4 h-4 shrink-0 mt-0.5 ${fullscreen ? 'text-emerald-300' : 'text-[#144A2B]'}`}
          />
          <p className="font-serif">
            <strong className={fullscreen ? 'text-emerald-200' : 'text-[#144A2B]'}>
              Gợi ý lời dẫn (Trang {String(currentSlide + 1).padStart(2, '0')}):
            </strong>{' '}
            {SLIDE_META[currentSlide].speakerNote}
          </p>
        </div>
      )}

      {/* Progress Bar & 10-Slide Selector Strip */}
      <div
        className={
          fullscreen
            ? 'bg-[#12271A] rounded-xl border border-emerald-900/60 p-3 space-y-2.5'
            : 'bg-slate-50 border-t border-slate-200 px-4 py-3 space-y-2.5'
        }
      >
        <div className="h-1 w-full bg-[#DCE6D9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#144A2B] transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / SLIDE_META.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
          {SLIDE_META.map((item, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#144A2B] text-white border-[#144A2B] shadow-2xs'
                    : fullscreen
                    ? 'bg-white/5 hover:bg-white/15 text-emerald-100 border-white/10'
                    : 'bg-white hover:bg-[#E5EFE3] text-slate-700 border-slate-200'
                }`}
              >
                <span className={`tabular-nums font-bold ${isActive ? 'text-[#B8D7B2]' : 'text-[#144A2B]'}`}>
                  {String(item.id).padStart(2, '0')}
                </span>
                <span>{item.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section id="intro-slide-deck" className="space-y-2">
        <DeckBody fullscreen={false} />
      </section>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1D13]/95 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Trình chiếu 10 slide SmartPlan GDTC Pro"
        >
          <DeckBody fullscreen={true} />
        </div>
      )}
    </>
  );
};
