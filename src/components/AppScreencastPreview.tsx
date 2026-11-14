import React, { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';

export type ScreencastSceneMode =
  | 'tabs_tour'
  | 'edit_replace'
  | 'sync_audit'
  | 'version_history'
  | 'export_a4';

interface AppScreencastPreviewProps {
  mode: ScreencastSceneMode;
  autoAnimate?: boolean;
  onNavigateTab?: (tabId: string) => void;
}

interface CropConfig {
  src: string;
  alt: string;
  x0: number; // left fraction of original screenshot
  spanX: number; // visible width fraction of original screenshot
  y0: number; // top fraction of original screenshot
}

interface DemoStep {
  id: string;
  label: string;
  targetTabId: string;
  crop: CropConfig;
  cursorX: number; // percentage 0..100 inside viewport
  cursorY: number; // percentage 0..100 inside viewport
  clicking: boolean;
  zoomScale: number;
  zoomOrigin: string;
  caption: string;
}

const CROP_TAB1: CropConfig = {
  src: '/assets/aistudio/image_19a2cc80.png',
  alt: 'Giao diện thật Tab 1 Quét và Bóc Tách SGK',
  x0: 0.228,
  spanX: 0.544,
  y0: 0.116
};

const CROP_TAB2: CropConfig = {
  src: '/assets/aistudio/image_989d6bba.png',
  alt: 'Giao diện thật Tab 2 Thư Viện Ảnh 173',
  x0: 0.285,
  spanX: 0.55,
  y0: 0.184
};

const CROP_TAB3: CropConfig = {
  src: '/assets/aistudio/image_a6e08219.png',
  alt: 'Giao diện thật Tab 3 Giáo Án Mẫu và Sửa Trực Tiếp',
  x0: 0.285,
  spanX: 0.55,
  y0: 0.184
};

const CROP_TAB5: CropConfig = {
  src: '/assets/aistudio/image_da81a919.png',
  alt: 'Giao diện thật Tab 5 Sinh Giáo Án Tuần Mới và Kiểm Tra Đồng Bộ',
  x0: 0.285,
  spanX: 0.55,
  y0: 0.184
};

const CROP_EDIT: CropConfig = {
  src: '/assets/aistudio/image_26f2dcbd.png',
  alt: 'Giao diện thật Chỉnh sửa trực tiếp 4 cột, đổi ảnh và sơ đồ',
  x0: 0.285,
  spanX: 0.55,
  y0: 0.184
};

const CROP_TAB6: CropConfig = {
  src: '/assets/aistudio/image_6770d51d.png',
  alt: 'Giao diện thật Tab 6 Xem Trước và In A4',
  x0: 0.264,
  spanX: 0.69,
  y0: 0.184
};

const SCENE_STEPS: Record<ScreencastSceneMode, DemoStep[]> = {
  tabs_tour: [
    {
      id: 't1',
      label: '1. Quét SGK',
      targetTabId: 'tab-scan',
      crop: CROP_TAB1,
      cursorX: 11,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.0,
      zoomOrigin: '50% 30%',
      caption: 'Con trỏ mở Tab 1 · Quét & Bóc Tách SGK: Khoanh cắt hình trực tiếp từ sách giáo khoa'
    },
    {
      id: 't1z',
      label: 'Cắt ảnh SGK',
      targetTabId: 'tab-scan',
      crop: CROP_TAB1,
      cursorX: 48,
      cursorY: 75,
      clicking: true,
      zoomScale: 1.32,
      zoomOrigin: '48% 82%',
      caption: 'Zoom cận cảnh trang SGK: Kéo vùng chọn động tác & phân loại ngay vào thư mục chuẩn'
    },
    {
      id: 't2',
      label: '2. Kho Ảnh (173)',
      targetTabId: 'tab-img-library',
      crop: CROP_TAB2,
      cursorX: 25,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.18,
      zoomOrigin: '60% 65%',
      caption: 'Mở Tab 2 · Thư Viện Ảnh: Tẩy nền trắng, AI đọc động tác & gắn thẳng vào giáo án'
    },
    {
      id: 't3',
      label: '3. Giáo Án Mẫu',
      targetTabId: 'tab-extract',
      crop: CROP_TAB3,
      cursorX: 42,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.12,
      zoomOrigin: '55% 65%',
      caption: 'Mở Tab 3 · Giáo Án Mẫu: Cấu trúc 4 cột chuẩn 5512 kèm sơ đồ đội hình rõ nét'
    },
    {
      id: 't5',
      label: '5. Sinh Tuần Mới',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 70,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.0,
      zoomOrigin: '50% 50%',
      caption: 'Mở Tab 5 · Sinh Giáo Án Tuần Mới: Khớp PPCT 3 khối chỉ với một cú nhấp chuột'
    }
  ],
  edit_replace: [
    {
      id: 'e1',
      label: 'Toàn cảnh 4 cột',
      targetTabId: 'tab-generator',
      crop: CROP_EDIT,
      cursorX: 35,
      cursorY: 27,
      clicking: false,
      zoomScale: 1.0,
      zoomOrigin: '50% 50%',
      caption: 'Bảng chỉnh sửa trực tiếp 4 cột chuẩn 1:1 (Nội dung · LVĐ · GV · HS)'
    },
    {
      id: 'e2',
      label: 'Sửa chữ trực tiếp',
      targetTabId: 'tab-generator',
      crop: CROP_EDIT,
      cursorX: 33,
      cursorY: 45,
      clicking: true,
      zoomScale: 1.38,
      zoomOrigin: '32% 48%',
      caption: 'Zoom Cột 1: Bấm sửa trực tiếp nội dung bài dạy, tự động lưu nháp liên tục'
    },
    {
      id: 'e3',
      label: 'Đổi ảnh động tác',
      targetTabId: 'tab-generator',
      crop: CROP_EDIT,
      cursorX: 33,
      cursorY: 88,
      clicking: true,
      zoomScale: 1.42,
      zoomOrigin: '34% 88%',
      caption: 'Zoom nút Đổi ảnh: Thay thế tranh động tác SGK hoặc chèn thêm ảnh chỉ trong 1 chạm'
    },
    {
      id: 'e4',
      label: 'Đổi sơ đồ K1/3/5',
      targetTabId: 'tab-generator',
      crop: CROP_EDIT,
      cursorX: 77,
      cursorY: 62,
      clicking: true,
      zoomScale: 1.42,
      zoomOrigin: '78% 64%',
      caption: 'Zoom Cột 4: Bấm + Thêm Sơ Đồ Khác để đổi sơ đồ đội hình đồng loạt, tổ hoặc cặp'
    }
  ],
  sync_audit: [
    {
      id: 's1',
      label: 'Mở Tab 5 Rà soát',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 70,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.0,
      zoomOrigin: '50% 50%',
      caption: 'Tại Tab 5, hệ thống tự đối chiếu bài học hiện tại với PPCT và kho ảnh SGK'
    },
    {
      id: 's2',
      label: 'Quét 5 tiêu chí',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 48,
      cursorY: 69,
      clicking: false,
      zoomScale: 1.35,
      zoomOrigin: '50% 72%',
      caption: 'Zoom bảng rà soát: Chỉ rõ mục nào đạt chuẩn (xanh) và mục nào còn thiếu ảnh/kỹ thuật (đỏ)'
    },
    {
      id: 's3',
      label: 'Chuẩn hóa 100%',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 74,
      cursorY: 61,
      clicking: true,
      zoomScale: 1.38,
      zoomOrigin: '68% 60%',
      caption: 'Con trỏ bấm "Tự Động Chuẩn Hóa Khớp 100% Ngay" để đồng bộ toàn bộ giáo án'
    }
  ],
  version_history: [
    {
      id: 'v1',
      label: 'Xem bản đã lưu',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 45,
      cursorY: 79,
      clicking: false,
      zoomScale: 1.42,
      zoomOrigin: '42% 88%',
      caption: 'Zoom vùng quản lý phiên bản: Hiển thị rõ Phiên bản #5 chính thức & bản nháp dở (v4)'
    },
    {
      id: 'v2',
      label: 'Lưu & Khôi phục',
      targetTabId: 'tab-generator',
      crop: CROP_TAB5,
      cursorX: 42,
      cursorY: 85,
      clicking: true,
      zoomScale: 1.5,
      zoomOrigin: '42% 90%',
      caption: 'Bấm "Lưu phiên bản mới" hoặc mở "Lịch sử sửa & Phiên bản" để không bao giờ mất bản cuối'
    }
  ],
  export_a4: [
    {
      id: 'x1',
      label: '6. Xem Trước A4',
      targetTabId: 'tab-export',
      crop: CROP_TAB6,
      cursorX: 93,
      cursorY: 16,
      clicking: true,
      zoomScale: 1.0,
      zoomOrigin: '50% 50%',
      caption: 'Con trỏ mở Tab 6 · Xem Trước & In: Hiển thị trang giáo án A4 chuẩn kèm ảnh & sơ đồ'
    },
    {
      id: 'x2',
      label: 'Zoom bố cục A4',
      targetTabId: 'tab-export',
      crop: CROP_TAB6,
      cursorX: 72,
      cursorY: 54,
      clicking: false,
      zoomScale: 1.32,
      zoomOrigin: '68% 60%',
      caption: 'Zoom cận cảnh bảng A4: Hình ảnh động tác, giảm tải HS và đội hình Khối 5 cân đối sắc nét'
    }
  ]
};

export const AppScreencastPreview: React.FC<AppScreencastPreviewProps> = ({
  mode,
  autoAnimate = true,
  onNavigateTab
}) => {
  const steps = SCENE_STEPS[mode];
  const [stepIdx, setStepIdx] = useState<number>(0);

  useEffect(() => {
    setStepIdx(0);
  }, [mode]);

  useEffect(() => {
    if (!autoAnimate) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [autoAnimate, steps.length]);

  const current = steps[stepIdx] || steps[0];
  const { crop } = current;

  const imgWidthPct = (1 / crop.spanX) * 100;
  const marginLeftPct = (-crop.x0 / crop.spanX) * 100;
  const marginTopPct = (-(crop.y0 * (9 / 16)) / crop.spanX) * 100;

  return (
    <div className="rounded-xl bg-[#111827] border border-slate-700/80 shadow-xl overflow-hidden flex flex-col">
      {/* Mini Screencast Caption Bar */}
      <div className="px-3 py-2 bg-[#0B111B] border-b border-slate-800 flex items-center justify-between gap-2 text-[10.5px] text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GIAO DIỆN THẬT</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="truncate text-slate-200">{current.caption}</span>
        </div>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab(current.targetTabId)}
            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold shrink-0 whitespace-nowrap transition"
          >
            Mở Tab thật
          </button>
        )}
      </div>

      {/* Cropped Real App Viewport with Smooth Camera Zoom & Animated Cursor */}
      <div className="relative w-full aspect-[16/10] bg-white overflow-hidden">
        <div
          className="w-full h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `scale(${current.zoomScale})`,
            transformOrigin: current.zoomOrigin
          }}
        >
          <img
            src={crop.src}
            alt={crop.alt}
            style={{
              width: `${imgWidthPct}%`,
              maxWidth: 'none',
              height: 'auto',
              marginLeft: `${marginLeftPct}%`,
              marginTop: `${marginTopPct}%`
            }}
            className="block select-none pointer-events-none"
          />
        </div>

        {/* Animated Mouse Cursor + Click Ripple */}
        <div
          className="absolute pointer-events-none z-20 transition-all duration-700 ease-in-out"
          style={{
            left: `${current.cursorX}%`,
            top: `${current.cursorY}%`,
            transform: 'translate(-20%, -15%)'
          }}
          aria-hidden="true"
        >
          {current.clicking && (
            <span className="absolute -left-2.5 -top-2.5 w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-400/20 animate-ping" />
          )}
          <div className="relative drop-shadow-lg">
            <MousePointer2 className="w-5 h-5 text-slate-900 fill-white stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Step Switcher Controls */}
      <div className="px-2.5 py-2 bg-[#0F172A] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {steps.map((st, idx) => {
          const active = stepIdx === idx;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setStepIdx(idx)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
