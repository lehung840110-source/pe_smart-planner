import React, { useRef, useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileSpreadsheet,
  FileText,
  FileUp,
  Film,
  History,
  Images,
  Layers,
  Palette,
  PlayCircle,
  Printer,
  ScanLine,
  School,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wand2,
  Lock,
  LogIn,
  Presentation,
  UserPlus,
  Mail,
  Cloud,
  Shapes,
  MessageSquareHeart
} from 'lucide-react';
import { IntroSlideDeck, IntroSlideLiveStats } from './IntroSlideDeck';
import { DonationSupportCard } from './DonationSupportCard';

interface TabIntroProps {
  onNavigateTab: (tabId: string) => void;
  onOpenImport?: () => void;
  onOpenAuth?: () => void;
  onOpenAuthMode?: (mode: 'login' | 'register') => void;
  isGuest?: boolean;
  onOpenFormationStudio?: () => void;
  onOpenSettings?: () => void;
  liveStats?: IntroSlideLiveStats;
}

export const TabIntro: React.FC<TabIntroProps> = ({
  onNavigateTab,
  onOpenImport,
  onOpenAuth,
  onOpenAuthMode,
  isGuest = false,
  onOpenFormationStudio,
  onOpenSettings,
  liveStats
}) => {
  const [activeGuideStep, setActiveGuideStep] = useState<number>(0);
  const [showFeaturePlans, setShowFeaturePlans] = useState<boolean>(false);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleJumpAndPlayIntroVideo = () => {
    document.getElementById('intro-video-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      introVideoRef.current?.play().catch(() => {});
    }, 350);
  };

  const solvedProblems = [
    {
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      title: 'Giảm 80% thời gian soạn giáo án đa khối mỗi tuần',
      problem: 'Giáo viên GDTC tiểu học thường dạy đồng thời nhiều khối từ Khối 1 đến Khối 5 (lên tới 10 tiết chuẩn/tuần + bảng kế hoạch dạy học chung 7 cột), cắt dán thủ công rất mất công.',
      solution: 'Hệ thống tự động đồng bộ Phân phối chương trình (PPCT) cả 5 khối theo từng tuần, sinh đồng loạt giáo án chuẩn Công văn 5512 chỉ với một thao tác.'
    },
    {
      icon: Images,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'Khắc phục tình trạng thiếu tranh động tác & nhầm sơ đồ',
      problem: 'Tìm tranh sách giáo khoa đúng từng động tác, tách bạch khởi động chung với trò chơi và vẽ sơ đồ đội hình dễ nhìn tốn rất nhiều thời gian.',
      solution: 'Tích hợp trình quét cắt trực tiếp từ SGK điện tử theo 6 thư mục phân loại nghiêm ngặt cùng Studio tự vẽ và kho sơ đồ phân biệt riêng cho cả 5 khối (Khối 1, 2, 3, 4, 5).'
    },
    {
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      title: 'Chuẩn hóa sư phạm, phân hóa đối tượng & hỗ trợ HS khuyết tật',
      problem: 'Rà soát thủ công dễ sót mục tiêu Năng lực số, Giáo dục môi trường, tách phần lý thuyết mới/ôn tập hoặc thiếu điều chỉnh cho học sinh khuyết tật, chưa hoàn thành.',
      solution: 'Tự động lọc nội dung cô đọng, chỉ diễn giải kỹ thuật ở động tác mới, bổ sung sẵn mục giảm tải hòa nhập và kiểm định độ khớp 100% với SGK trước khi xuất bản.'
    },
    {
      icon: History,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'Chống mất bản sửa cuối & kế thừa mẫu giáo án riêng của trường',
      problem: 'Sửa nhiều lần dễ thất lạc phiên bản ưng ý nhất, hoặc giáo viên có mẫu giáo án Word/PDF riêng muốn đưa vào để chỉnh sửa và tái sử dụng nhanh.',
      solution: 'Lưu nháp tự động liên tục + lịch sử phiên bản chọn bản hoàn hảo nhất; phân tích đa nhiệm tệp tải lên thành "Mẫu mới từ người dùng" và đồng bộ qua tài khoản.'
    }
  ];

  const coreFeatures = [
    {
      badge: 'Tab 1',
      memberOnly: true,
      title: 'Quét & Bóc Tách SGK Điện Tử',
      desc: 'Nhảy nhanh đến đúng trang SGK Khối 1, 2, 3, 4, 5; khoanh vùng cắt ảnh sắc nét và phân loại vào đúng 6 thư mục (Khởi động, Trò chơi KĐ, Động tác mới, Luyện tập, Trò chơi VĐ, Vận dụng).',
      icon: ScanLine,
      actionLabel: 'Mở Tab 1',
      onClick: () => onNavigateTab('tab-scan')
    },
    {
      badge: 'Tab 2',
      title: 'Thư Viện 308+ Ảnh SGK (Khối 1–5)',
      desc: 'Kho tài nguyên lên tới 308 hình ảnh chuẩn SGK từ Khối 1 đến Khối 5 phân loại theo 6 thư mục, hỗ trợ làm sạch nền và tự động chèn chính xác sau tiêu đề động tác, trò chơi.',
      icon: Images,
      actionLabel: 'Mở Tab 2',
      onClick: () => onNavigateTab('tab-img-library')
    },
    {
      badge: 'Tab 3',
      memberOnly: true,
      title: 'Giáo Án Mẫu & Mẫu Mới Từ Người Dùng',
      desc: 'Chỉnh sửa trực tiếp giáo án mẫu chuẩn hoặc nạp tệp Word (.docx/.doc), PDF, HTML để phân tích đầy đủ các phần I–IV và hiển thị ngay thành mẫu riêng.',
      icon: FileSpreadsheet,
      actionLabel: 'Mở Tab 3',
      onClick: () => onNavigateTab('tab-extract')
    },
    {
      badge: 'Tab 4',
      title: 'Thư Viện Kịch Bản Sư Phạm',
      desc: 'Kho kịch bản mở đầu, kỹ thuật động tác, luyện tập, trò chơi và vận dụng được biên soạn gọn súc theo từng khối lớp để chèn 1 chạm vào giáo án.',
      icon: BookOpen,
      actionLabel: 'Mở Tab 4',
      onClick: () => onNavigateTab('tab-library')
    },
    {
      badge: 'Tab 5',
      title: 'Sinh Giáo Án Tuần Mới & Rà Soát 100%',
      desc: 'Tự nhận diện động tác mới vs ôn tập theo PPCT tích hợp, đổi chữ hoa/thường nhanh, tự động chèn ảnh SGK chuẩn và chấm điểm mức độ khớp chương trình.',
      icon: Wand2,
      actionLabel: 'Mở Tab 5',
      onClick: () => onNavigateTab('tab-generator')
    },
    {
      badge: 'Tab 6',
      title: 'Xem Trước A4, Google Docs & Xuất Word / PDF',
      desc: 'Xem gộp cả 5 khối kèm lịch tuần 7 cột; kết nối tài liệu Google Docs / Google Drive trực tiếp, xuất Word (.DOC/.DOCX) hoặc in PDF A4 nguyên vẹn.',
      icon: Printer,
      actionLabel: 'Mở Tab 6',
      onClick: () => onNavigateTab('tab-export')
    },
    {
      badge: 'Công cụ',
      memberOnly: true,
      title: 'Studio Tạo Sơ Đồ Đội Hình Mạnh Mẽ & Linh Hoạt',
      desc: 'Tự vẽ lưới ô vuông (3x3, 1x5...), đường song song, nhóm hình theo mẫu (tròn, tam giác, gấp khúc), nối đối tượng nét liền/nét đứt/mũi tên, xoay góc tùy ý (45°...), lật gương Mirror & canh thẳng hàng tự động.',
      icon: Palette,
      actionLabel: 'Mở Studio Đội Hình',
      onClick: () => (onOpenFormationStudio ? onOpenFormationStudio() : onNavigateTab('tab-export'))
    },
    {
      badge: 'Hệ thống',
      title: 'Tài Khoản Giáo Viên & Kết Nối Google Drive',
      desc: 'Đăng ký miễn phí để mở khóa toàn bộ kho 308+ ảnh, Studio đội hình chuyên sâu, đồng bộ tài liệu Google Docs/Drive và lưu lịch sử mọi phiên bản giáo án.',
      icon: UserCheck,
      actionLabel: 'Mở Tài Khoản',
      onClick: () => (onOpenAuth ? onOpenAuth() : onNavigateTab('tab-generator'))
    }
  ];

  const guideSteps = [
    {
      step: 1,
      title: 'Cập nhật thông tin Nhà trường, Giáo viên & Đăng nhập đồng bộ',
      summary: 'Thiết lập tên trường, tổ chuyên môn, BGH ký duyệt và tài khoản cá nhân chỉ trong 30 giây.',
      details: [
        'Bấm vào ô tên giáo viên / tên trường ở góc trên bên phải thanh công cụ để điền thông tin Trường, Tổ chuyên môn, Hiệu trưởng duyệt, Tổ trưởng và Giáo viên soạn bài.',
        'Bấm nút "Đăng nhập / ĐK" để tạo tài khoản bằng Email cá nhân. Khi đã đăng nhập, mọi chỉnh sửa, phiên bản giáo án và mẫu mới tải lên sẽ tự động đồng bộ an toàn.'
      ],
      ctaLabel: 'Mở Cài đặt Trường & GV',
      onCta: () => onOpenSettings?.()
    },
    {
      step: 2,
      title: 'Quét ảnh SGK & phân loại đúng thư mục (nếu cần bổ sung hình)',
      summary: 'Ảnh phân loại chính xác giúp máy tự động gắn đúng tranh động tác vào Cột 1 và sơ đồ vào Cột 4.',
      details: [
        'Chuyển sang Tab 1 (Quét & Bóc Tách SGK), chọn Khối lớp và số trang SGK tương ứng với bài sắp dạy.',
        'Kéo chuột khoanh vùng từng hình ảnh động tác hoặc trò chơi, đặt tên ngắn gọn theo tên động tác và chọn đúng trong 6 thư mục (ví dụ: Khởi động chung → khoiDong; Trò chơi khởi động → troChoiKhoiDong; Động tác mới → dongTac...).'
      ],
      ctaLabel: 'Đi tới Tab 1 · Quét SGK',
      onCta: () => onNavigateTab('tab-scan')
    },
    {
      step: 3,
      title: 'Sinh giáo án mới từ PPCT chuẩn hoặc Nạp mẫu riêng của Thầy/Cô',
      summary: 'Hỗ trợ cả 2 luồng: soạn tự động theo khung Nghĩa Hiệp hoặc nạp tệp Word/PDF riêng.',
      details: [
        'Luồng 1 (Soạn theo chương trình): Vào Tab 5 (Sinh Giáo Án Tuần Mới), chọn Tuần – Khối – Tiết PPCT → bấm "Sinh Giáo Án Chuẩn" hoặc chọn gợi ý nhanh bài học.',
        'Luồng 2 (Nạp mẫu riêng): Bấm nút "Nạp File Giáo Án" trên thanh công cụ, tải lên 1 hoặc nhiều tệp (.docx, .pdf, .html, .txt) hoặc dán nội dung → bấm "Lưu Thành Mẫu Mới & Hiển Thị Ngay" để xem và dùng ở Tab 3, Tab 5 và Tab 6.'
      ],
      ctaLabel: 'Nạp File Giáo Án Ngay',
      onCta: () => (onOpenImport ? onOpenImport() : onNavigateTab('tab-extract'))
    },
    {
      step: 4,
      title: 'Chỉnh sửa trực tiếp, đổi sơ đồ theo khối & chốt Lưu phiên bản cuối',
      summary: 'Mọi chỉnh sửa đều được lưu nháp tự động và có thể chốt phiên bản hoàn hảo nhất.',
      details: [
        'Tại Tab 5 hoặc Tab 6 (bật "Chỉnh Sửa Giáo Án"), gõ sửa trực tiếp nội dung 4 cột, thêm/xóa dòng hoặc bấm chèn ảnh/sơ đồ đội hình.',
        'Muốn thay đổi phong cách đội hình riêng cho từng khối (1–5), vào Tab 6 bấm "Đổi Kiểu Đội Hình K1–K5".',
        'Sau khi ưng ý, bấm "Lưu phiên bản" (từng tiết) hoặc "Lưu Bộ 5 Khối" (cả tuần) để chốt bản chính thức mới nhất.'
      ],
      ctaLabel: 'Đi tới Tab 5 · Soạn & Sửa',
      onCta: () => onNavigateTab('tab-generator')
    },
    {
      step: 5,
      title: 'Xem trước trang in A4, Xuất file Word (.DOC/.DOCX) hoặc Lưu PDF',
      summary: 'Đảm bảo hình ảnh nhúng 100%, không lỗi font và sẵn sàng nộp ký duyệt hoặc in dạy.',
      details: [
        'Vào Tab 6 (Xem Trước & In), chọn chế độ xem mong muốn: Gộp cả 5 khối (kèm bảng lịch tuần), từng Khối 1–5, Tiết lẻ, hoặc Mẫu mới từ người dùng.',
        'Điều chỉnh phông chữ (Times New Roman 12pt/13pt) và cỡ ảnh chuẩn (95px) để bố cục cân đối trên khổ giấy A4.',
        'Bấm "Tải Word (.DOCX)" / "Tải Word (.DOC)" để chỉnh thêm trong Microsoft Word hoặc bấm "Lưu PDF / In A4" để xuất bản PDF.'
      ],
      ctaLabel: 'Đi tới Tab 6 · Xem Trước & In',
      onCta: () => onNavigateTab('tab-export')
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Hero & Author Spotlight */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] font-semibold text-sky-200">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giải pháp số hóa Kế hoạch bài dạy GDTC Tiểu học · Chương trình GDPT 2018</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              SmartPlan GDTC Pro — Trợ Lý Thiết Kế & Chuẩn Hóa Giáo Án Giáo Dục Thể Chất
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Giải pháp soạn Kế hoạch bài dạy thông minh <strong>“Tất cả trong 1”</strong> dành riêng cho giáo viên Giáo dục Thể chất: tích hợp tự động PPCT cả 5 khối, sở hữu bộ thư viện lên tới <strong>308 hình ảnh SGK từ Khối 1 đến Khối 5</strong>, <strong>Studio vẽ sơ đồ đội hình mạnh mẽ &amp; linh hoạt</strong>, kết nối trực tiếp tài liệu <strong>Google Docs / Google Drive</strong> và xuất Word/PDF A4 — giúp Quý thầy cô tiết kiệm tối đa thời gian, công sức soạn giảng và nâng cao vượt trội chất lượng dạy học động tác.
            </p>

            {/* Key Value Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5">
                <div className="text-base sm:text-lg font-extrabold text-emerald-300 tabular-nums">308+ Hình Ảnh</div>
                <div className="text-[11px] text-blue-100/85">Thư viện chuẩn SGK từ Khối 1 đến Khối 5</div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5">
                <div className="text-base sm:text-lg font-extrabold text-sky-300">Studio Sơ Đồ Pro</div>
                <div className="text-[11px] text-blue-100/85">Nối nét liền/đứt, xoay góc, Mirror, lưới ô</div>
              </div>
              <div className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5">
                <div className="text-base sm:text-lg font-extrabold text-amber-300">Tích Hợp Tự Động</div>
                <div className="text-[11px] text-blue-100/85">Kết nối Google Docs / Drive &amp; Word A4</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('tab-generator')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Wand2 className="w-4 h-4" />
                <span>Bắt Đầu Soạn Giáo Án (Tab 5)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('tab-export')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-sky-300" />
                <span>Xem Trước &amp; Xuất Word (Tab 6)</span>
              </button>
              {onOpenImport && (
                <button
                  type="button"
                  onClick={onOpenImport}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileUp className="w-4 h-4 text-amber-300" />
                  <span>Nạp Mẫu Giáo Án Riêng</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleJumpAndPlayIntroVideo}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Xem Video Giới Thiệu</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('intro-slide-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Presentation className="w-4 h-4 text-emerald-300" />
                <span>Xem Slide Trình Chiếu (10 Trang)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('tab-feedback')}
                className="bg-amber-500/90 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageSquareHeart className="w-4 h-4 text-white" />
                <span>Đánh Giá &amp; Góp Ý (Tab 8)</span>
              </button>
            </div>
          </div>

          {/* Author Info Card */}
          <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-md border border-blue-200/80 lg:w-80 shrink-0 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                LQH
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  <Award className="w-3 h-3" /> Thông Tin Tác Giả
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate">
                  Lê Quốc Hưng
                </h3>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <School className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chức danh &amp; Đơn vị:</strong> Giáo viên Trường TH&amp;THCS Nghĩa Hiệp
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chuyên môn:</strong> Bộ môn Giáo dục Thể chất (Khối 1, 2, 3, 4, 5 — GDPT 2018)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sứ mệnh:</strong> Tiết kiệm tối đa thời gian soạn giảng, nâng cao chất lượng dạy học động tác GDTC.
                </span>
              </div>
              <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100">
                <Mail className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="break-all">
                  <strong>Đóng góp ý kiến:</strong>{' '}
                  <a
                    href="mailto:lehung840110@gmail.com"
                    className="text-blue-700 hover:underline font-semibold"
                  >
                    lehung840110@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1V. Official Introduction Video Showcase */}
      <section
        id="intro-video-showcase"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      >
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                Video Giới Thiệu Ứng Dụng SmartPlan GDTC Pro
              </h3>
              <p className="text-[11.5px] text-blue-200/90 mt-0.5">
                Xem tổng quan trực quan quy trình soạn giáo án GDTC chuẩn GDPT 2018, kho 308+ hình ảnh SGK &amp; Studio sơ đồ đội hình
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const video = introVideoRef.current;
              if (!video) return;
              if (video.paused) {
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
          >
            <PlayCircle className="w-4 h-4 text-emerald-300" />
            <span>Phát / Tạm dừng</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950/95 flex justify-center">
          <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-slate-700/80 bg-black">
            <video
              ref={introVideoRef}
              src="/assets/aistudio/smartplan_gdtc_pro_gioi_thieu_15413708.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video object-contain bg-black block"
            >
              Trình duyệt của thầy cô chưa hỗ trợ phát trực tiếp video MP4.
            </video>
          </div>
        </div>
      </section>

      {/* 1A. Unique All-in-One Competitive Advantages */}
      <section className="bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/80 rounded-2xl border border-emerald-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Ưu Điểm Nổi Trội Độc Quyền Trong Một Ứng Dụng Duy Nhất
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Vì Sao SmartPlan GDTC Pro Khác Biệt Hoàn Toàn So Với Các Công Cụ Soạn Thảo Thông Thường?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Không có ứng dụng đơn lẻ nào tích hợp trọn vẹn từ kho ảnh SGK chuẩn, công cụ vẽ sơ đồ đội hình chuyên sâu, sinh giáo án tự động theo PPCT đến kết nối trực tiếp tài liệu Google Docs &amp; Google Drive ngay trong cùng một không gian làm việc.
            </p>
          </div>
          {isGuest && (
            <button
              type="button"
              onClick={() => (onOpenAuthMode ? onOpenAuthMode('register') : onOpenAuth?.())}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Dùng Miễn Phí Trọn 1 Học Kỳ (Không Mật Khẩu)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="bg-white rounded-xl border border-emerald-200/80 p-4 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Images className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 leading-snug">
              Thư viện lên tới 308 hình ảnh SGK (Khối 1 → Khối 5)
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Kho hình ảnh động tác &amp; trò chơi đầy đủ cả 5 khối lớp, được phân loại khoa học và tự động gán đúng vị trí sau tiêu đề động tác giúp giờ dạy trực quan, sinh động hơn hẳn.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-blue-200/80 p-4 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shapes className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 leading-snug">
              Studio tạo sơ đồ đội hình mạnh mẽ &amp; cực kỳ linh hoạt
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Hỗ trợ vẽ vùng lưới ô vuông (3x3, 1x5...), đường song song dọc/ngang, nhóm hình tròn/tam giác/gấp khúc, <strong>nối đối tượng bằng đường nét liền – nét đứt – mũi tên</strong>, <strong>xoay góc tùy chỉnh (45°, 90°...)</strong>, lật gương <strong>Mirror</strong>, nhóm &amp; thu nhỏ tỷ lệ, canh thẳng hàng tức thì.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-indigo-200/80 p-4 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 leading-snug">
              Tích hợp tự động &amp; kết nối tài liệu Google Docs / Drive
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Kết nối đồng bộ trực tiếp với <strong>Google Docs &amp; Google Drive</strong>, nạp tệp mẫu Word/PDF đa nhiệm, tự động sinh giáo án theo PPCT tích hợp và xuất file Word/PDF chuẩn Công văn 5512 chỉ trong 1 chạm.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-amber-200/80 p-4 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 leading-snug">
              Tiết kiệm công sức, nâng cao chất lượng dạy học động tác
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Giải phóng Quý thầy cô khỏi việc cắt dán, căn chỉnh thủ công lặp đi lặp lại mỗi tuần để dành trọn tâm huyết hướng dẫn kỹ thuật động tác chính xác, an toàn cho học sinh GDTC.
            </p>
          </div>
        </div>
      </section>

      {/* 1B. Interactive 10-Slide Storytelling Deck */}
      <IntroSlideDeck onNavigateTab={onNavigateTab} onOpenAuth={onOpenAuth} liveStats={liveStats} />

      {/* 2. Problems Solved Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. Ứng Dụng Giải Quyết Những Vấn Đề Gì Của Giáo Viên?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bốn nút thắt lớn nhất trong công tác soạn Kế hoạch bài dạy GDTC hàng tuần được xử lý tự động ngay trên một màn hình
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solvedProblems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2.5 hover:border-blue-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs leading-relaxed pl-1">
                  <p className="text-slate-600">
                    <strong className="text-rose-700">Thực trạng:</strong> {item.problem}
                  </p>
                  <p className="text-slate-800">
                    <strong className="text-emerald-700">Giải pháp:</strong> {item.solution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2B. 2-Stage Community Roadmap: Full Free 1 Semester + Voluntary Support */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Mở Miễn Phí Hoàn Toàn Trọn 1 Học Kỳ (120 Ngày · Không Cần Mật Khẩu)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chia sẻ trọn vẹn cho cộng đồng giáo viên GDTC trải nghiệm thực tế trên sân tập · Cam kết bảo toàn 100% giáo án cũ · Ủng hộ tùy tâm để duy trì máy chủ &amp; API.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFeaturePlans((v) => !v)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border border-slate-200 hover:border-blue-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{showFeaturePlans ? 'Ẩn tham khảo tính năng' : 'Tham khảo tính năng'}</span>
              {showFeaturePlans ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => (onOpenAuthMode ? onOpenAuthMode('register') : onOpenAuth?.())}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isGuest ? 'Vào Dùng Miễn Phí 1 Học Kỳ' : 'Tài Khoản & Ủng Hộ Duy Trì'}</span>
            </button>
            {isGuest && (
              <button
                type="button"
                onClick={() => (onOpenAuthMode ? onOpenAuthMode('login') : onOpenAuth?.())}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập 1 chạm</span>
              </button>
            )}
          </div>
        </div>

        {showFeaturePlans && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10.5px] uppercase">Cơ bản</span>
                <span>Tính năng cơ bản</span>
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Duyệt, tra cứu Thư viện ảnh SGK (Tab 2) &amp; Kịch bản sư phạm (Tab 4).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Xem trước bản A4 theo từng khối hoặc gộp cả 5 khối &amp; giữ nguyên 100% giáo án cũ đã tạo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Không khóa cứng dữ liệu, luôn trân trọng và bảo toàn thành quả soạn giảng của giáo viên.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Sử dụng ổn định hằng ngày cho nhu cầu xem, tra cứu và đối chiếu giáo án GDTC.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10.5px] uppercase">Nâng cao</span>
                <span>Tính năng nâng cao</span>
              </div>
              <ul className="space-y-1.5 text-emerald-900">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Thư viện 308+ hình ảnh SGK (Khối 1–5)</strong>, quét bóc tách SGK (Tab 1) &amp; làm sạch ảnh AI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Studio Tạo Sơ Đồ Đội Hình Pro:</strong> lưới ô vuông, đường song song, nhóm hình, nối nét liền/đứt/mũi tên, xoay góc, Mirror &amp; canh thẳng hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Chỉnh sửa trực tiếp giáo án mẫu 4 cột (Tab 3), nạp mẫu riêng, chốt lịch sử &amp; <strong>kết nối Google Docs / Drive</strong>, xuất Word/PDF.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Đồng bộ toàn bộ dữ liệu trên tài khoản cá nhân &amp; sao lưu/khôi phục linh hoạt trên mọi thiết bị.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* 3. Core Features Grid */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>2. Hệ Thống Các Tính Năng Chính</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhấn vào nút mở nhanh trên từng thẻ để chuyển trực tiếp đến tính năng tương ứng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between gap-3 hover:border-indigo-300 hover:shadow-xs transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                      <span>{feat.badge}</span>
                      {isGuest && (feat as any).memberOnly && (
                        <Lock className="w-3 h-3 text-amber-600" />
                      )}
                    </span>
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {feat.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={feat.onClick}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-[11.5px] font-semibold flex items-center justify-between transition"
                >
                  <span>{feat.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Step-by-Step User Guide */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>3. Hướng Dẫn Sử Dụng Nhanh Theo 5 Bước Chuẩn</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn từng bước bên trái để xem chi tiết thao tác và chuyển ngay tới màn hình thực hiện
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Quy trình khép kín · Sẵn sàng in A4
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Step Selector */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 divide-y divide-slate-100">
            {guideSteps.map((g, idx) => {
              const isSelected = activeGuideStep === idx;
              return (
                <button
                  key={g.step}
                  type="button"
                  onClick={() => setActiveGuideStep(idx)}
                  className={`w-full text-left p-4 transition flex items-start gap-3 ${
                    isSelected ? 'bg-blue-50/80' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {g.step}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold leading-snug ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {g.title}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {g.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Step Details */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between gap-5 bg-white">
            {(() => {
              const current = guideSteps[activeGuideStep] || guideSteps[0];
              return (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md tabular-nums">
                        Bước {current.step} / {guideSteps.length}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {current.summary}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      {current.title}
                    </h4>

                    <ul className="space-y-2.5">
                      {current.details.map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-slate-50/80 border border-slate-200/80 rounded-xl p-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={activeGuideStep === 0}
                        onClick={() => setActiveGuideStep((s) => Math.max(0, s - 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        Bước trước
                      </button>
                      <button
                        type="button"
                        disabled={activeGuideStep === guideSteps.length - 1}
                        onClick={() => setActiveGuideStep((s) => Math.min(guideSteps.length - 1, s + 1))}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        Bước tiếp theo
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={current.onCta}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                    >
                      <span>{current.ctaLabel}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 4B. Voluntary Community Support & Charitable Student Fund Card */}
      <DonationSupportCard />

      {/* 5. Footer Author Attribution & Feedback Mailbox */}
      <footer className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong className="text-slate-900">Tác giả phát triển:</strong> Lê Quốc Hưng — Giáo viên Trường TH&amp;THCS Nghĩa Hiệp
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Mọi ý kiến đóng góp xin gửi qua hộp thư cá nhân:{' '}
              <a
                href="mailto:lehung840110@gmail.com"
                className="font-bold text-blue-700 hover:underline"
              >
                lehung840110@gmail.com
              </a>
            </span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 sm:text-right">
          SmartPlan GDTC Pro · Giải pháp tạo Kế hoạch bài dạy thông minh môn Giáo dục Thể chất
        </span>
      </footer>
    </div>
  );
};
