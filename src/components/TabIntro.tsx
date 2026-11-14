import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  FileText,
  FileUp,
  History,
  Images,
  Layers,
  Palette,
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
  UserPlus
} from 'lucide-react';
import { IntroSlideDeck, IntroSlideLiveStats } from './IntroSlideDeck';

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

  const solvedProblems = [
    {
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      title: 'Giảm 80% thời gian soạn giáo án đa khối mỗi tuần',
      problem: 'Giáo viên GDTC tiểu học thường dạy đồng thời Khối 1, Khối 3, Khối 5 (6 tiết/tuần + bảng kế hoạch dạy học chung 7 cột), cắt dán thủ công rất mất công.',
      solution: 'Hệ thống tự động đồng bộ Phân phối chương trình (PPCT) cả 3 khối theo từng tuần, sinh đồng loạt giáo án chuẩn Công văn 5512 chỉ với một thao tác.'
    },
    {
      icon: Images,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'Khắc phục tình trạng thiếu tranh động tác & nhầm sơ đồ',
      problem: 'Tìm tranh sách giáo khoa đúng từng động tác, tách bạch khởi động chung với trò chơi và vẽ sơ đồ đội hình dễ nhìn tốn rất nhiều thời gian.',
      solution: 'Tích hợp trình quét cắt trực tiếp từ SGK điện tử theo 6 thư mục phân loại nghiêm ngặt cùng Studio tự vẽ và kho 32+ sơ đồ phân biệt riêng cho Khối 1, Khối 3, Khối 5.'
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
      desc: 'Nhảy nhanh đến đúng trang SGK Khối 1, 3, 5; khoanh vùng cắt ảnh sắc nét và phân loại vào đúng 6 thư mục (Khởi động, Trò chơi KĐ, Động tác mới, Luyện tập, Trò chơi VĐ, Vận dụng).',
      icon: ScanLine,
      actionLabel: 'Mở Tab 1',
      onClick: () => onNavigateTab('tab-scan')
    },
    {
      badge: 'Tab 2',
      title: 'Thư Viện Ảnh & Làm Sạch Ảnh',
      desc: 'Lưu trữ tập trung toàn bộ ảnh đã bóc tách trong cơ sở dữ liệu trình duyệt, hỗ trợ tẩy nền/xóa chi tiết thừa và chèn thẳng vào đúng cột của bài dạy.',
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
      desc: 'Tự nhận diện động tác mới vs ôn tập theo PPCT, cân bằng 11 dòng tiến trình, chèn ảnh/sơ đồ ngay tại con trỏ và chấm điểm mức độ khớp chuẩn SGK.',
      icon: Wand2,
      actionLabel: 'Mở Tab 5',
      onClick: () => onNavigateTab('tab-generator')
    },
    {
      badge: 'Tab 6',
      title: 'Xem Trước A4, Sửa & Xuất Word / PDF',
      desc: 'Xem gộp cả 3 khối kèm lịch dạy tuần 7 cột hoặc xem riêng từng khối/mẫu người dùng; tùy chỉnh cỡ chữ, cỡ ảnh và xuất Word (.DOC/.DOCX) hoặc in PDF A4 nguyên vẹn.',
      icon: Printer,
      actionLabel: 'Mở Tab 6',
      onClick: () => onNavigateTab('tab-export')
    },
    {
      badge: 'Công cụ',
      memberOnly: true,
      title: 'Studio Tự Vẽ & Đổi Kiểu Đội Hình K1/3/5',
      desc: 'Thiết kế sơ đồ mới từ hình ảnh trò chơi tham chiếu hoặc tùy chọn kiểu đội hình đặc trưng riêng cho Khối 1, Khối 3, Khối 5 tránh trùng lặp.',
      icon: Palette,
      actionLabel: 'Mở Studio Đội Hình',
      onClick: () => (onOpenFormationStudio ? onOpenFormationStudio() : onNavigateTab('tab-export'))
    },
    {
      badge: 'Hệ thống',
      title: 'Tài Khoản Giáo Viên & Lịch Sử Phiên Bản',
      desc: 'Đăng ký/Đăng nhập để đồng bộ giáo án, thiết lập trường lớp và các mẫu người dùng vừa nạp lên máy chủ; lưu vết mọi lần sửa để khôi phục bất kỳ lúc nào.',
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
        'Muốn thay đổi phong cách đội hình riêng cho Khối 1, 3, 5, vào Tab 6 bấm "Đổi Kiểu Đội Hình K1/3/5".',
        'Sau khi ưng ý, bấm "Lưu phiên bản" (từng tiết) hoặc "Lưu Bộ 3 Khối" (cả tuần) để chốt bản chính thức mới nhất.'
      ],
      ctaLabel: 'Đi tới Tab 5 · Soạn & Sửa',
      onCta: () => onNavigateTab('tab-generator')
    },
    {
      step: 5,
      title: 'Xem trước trang in A4, Xuất file Word (.DOC/.DOCX) hoặc Lưu PDF',
      summary: 'Đảm bảo hình ảnh nhúng 100%, không lỗi font và sẵn sàng nộp ký duyệt hoặc in dạy.',
      details: [
        'Vào Tab 6 (Xem Trước & In), chọn chế độ xem mong muốn: Gộp cả 3 khối (kèm bảng 16 tiết), từng Khối 1/3/5, Tiết lẻ, hoặc Mẫu mới từ người dùng.',
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
              Ứng dụng được xây dựng từ thực tiễn giảng dạy môn Giáo dục Thể chất tại trường phổ thông, giúp thầy cô giải quyết trọn vẹn từ khâu bóc tách hình ảnh SGK, thiết kế sơ đồ đội hình từng khối, soạn giáo án đúng chuẩn Công văn 5512 đến xuất file Word và in A4 đồng loạt cả 3 khối trong vài phút.
            </p>

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
                <span>Xem Trước & Xuất Word (Tab 6)</span>
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
                onClick={() =>
                  document.getElementById('intro-slide-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Presentation className="w-4 h-4 text-emerald-300" />
                <span>Xem Slide Trình Chiếu (10 Trang)</span>
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
                  <strong>Chức danh & Đơn vị:</strong> Giáo viên Trường TH&amp;THCS Nghĩa Hiệp
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chuyên môn:</strong> Bộ môn Giáo dục Thể chất (Khối 1, Khối 3, Khối 5 — GDPT 2018)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mục tiêu sản phẩm:</strong> Chuẩn hóa giáo án trực quan, giảm tải giấy tờ cho đồng nghiệp GDTC.
                </span>
              </div>
            </div>
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

      {/* 2B. Guest Basic vs Authenticated Full Features */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Quyền Truy Cập: Chế Độ Khách (Cơ Bản) &amp; Thành Viên (Toàn Bộ Tính Năng)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Người dùng chưa đăng nhập vẫn có thể tham khảo kho học liệu &amp; xem trước giáo án; đăng ký tài khoản miễn phí để mở khóa 100% tính năng chuyên sâu.
            </p>
          </div>
          {isGuest && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => (onOpenAuthMode ? onOpenAuthMode('register') : onOpenAuth?.())}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký miễn phí</span>
              </button>
              <button
                type="button"
                onClick={() => (onOpenAuthMode ? onOpenAuthMode('login') : onOpenAuth?.())}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập ngay</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10.5px] uppercase">Chưa đăng nhập</span>
              <span>Tính Năng Cơ Bản (Xem &amp; Tham Khảo)</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Xem trang Giới thiệu &amp; Hướng dẫn sử dụng (Tab 7).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Duyệt, tìm kiếm Thư viện ảnh SGK (Tab 2) &amp; Kịch bản sư phạm (Tab 4).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Chọn tuần/khối/tiết và bấm Sinh giáo án cơ bản xem thử ở Tab 5.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Xem trước bản A4 theo từng khối hoặc gộp 3 khối ở Tab 6.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10.5px] uppercase">Đã đăng nhập</span>
              <span>Mở Khóa 100% Tính Năng Chuyên Sâu</span>
            </div>
            <ul className="space-y-1.5 text-emerald-900">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Quét &amp; bóc tách ảnh SGK (Tab 1), xử lý ảnh thông minh, Gemini Vision &amp; AI.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Chỉnh sửa trực tiếp giáo án mẫu (Tab 3), nạp &amp; phân tích mẫu giáo án riêng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Lưu phiên bản cuối, Lịch sử sửa, Studio Đội Hình &amp; Đổi kiểu K1/3/5.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Xuất file Word (.DOC/.DOCX), lưu PDF/in A4, Google Drive &amp; đồng bộ tài khoản.</span>
              </li>
            </ul>
          </div>
        </div>
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

      {/* 5. Footer Author Attribution */}
      <footer className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <School className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong className="text-slate-900">Tác giả phát triển:</strong> Lê Quốc Hưng — Giáo viên Trường TH&amp;THCS Nghĩa Hiệp
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          SmartPlan GDTC Pro · Bộ công cụ hỗ trợ giảng dạy môn Giáo dục Thể chất Tiểu học
        </span>
      </footer>
    </div>
  );
};
