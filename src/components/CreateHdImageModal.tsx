import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  Download,
  Save,
  PlusCircle,
  SlidersHorizontal,
  Users,
  User,
  Activity,
  FileCode2,
  Check,
  Wand2,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import {
  HdSceneSpec,
  HdSceneMode,
  HdGender,
  HdEquipment,
  HdPoseSpec,
  HD_PRESET_LIST,
  buildHdSceneSpecFromKeyword,
  generateHdSgkSvg,
  renderSvgToHdPngDataUrl,
} from '../utils/hdSgkIllustrator';
import { SgkImageItem, SubFolderType, ImageCategory } from '../types/gdtc';

interface CreateHdImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  initialMovementName?: string;
  onSaveToLibrary: (newImg: SgkImageItem) => void;
  onSaveAndAttachToLesson?: (newImg: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

const FOLDER_TO_CATEGORY: Record<SubFolderType, ImageCategory> = {
  kyThuat: 'dong_tac',
  luyenTap: 'tap_luyen',
  troChoi: 'tro_choi',
  troChoiKhoiDong: 'tro_choi_khoi_dong',
  khoiDong: 'khoi_dong',
  vanDung: 'van_dung',
};

const QUICK_STEP_POSES: { id: string; label: string; patch: Partial<HdPoseSpec> }[] = [
  {
    id: 'stand',
    label: 'Đứng nghiêm',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, kneeSquat: 0, heelRaisePx: 0, leftUpperDeg: 7, leftElbowDeg: 4, rightUpperDeg: 7, rightElbowDeg: 4, leftHipDeg: 3, leftKneeDeg: 0, rightHipDeg: 3, rightKneeDeg: 0, motionArc: 'none' }
  },
  {
    id: 'v_up',
    label: 'Vươn chữ V',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, kneeSquat: 0, leftUpperDeg: 148, leftElbowDeg: 0, rightUpperDeg: 148, rightElbowDeg: 0, leftHipDeg: 18, leftKneeDeg: 0, rightHipDeg: 6, rightKneeDeg: 0, palmFacing: 'up', motionArc: 'arms_up' }
  },
  {
    id: 'side_down',
    label: 'Dang ngang (Sấp)',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, leftUpperDeg: 90, leftElbowDeg: 0, rightUpperDeg: 90, rightElbowDeg: 0, palmFacing: 'down', motionArc: 'arms_out' }
  },
  {
    id: 'side_up',
    label: 'Dang ngang (Ngửa)',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, leftUpperDeg: 90, leftElbowDeg: 0, rightUpperDeg: 90, rightElbowDeg: 0, palmFacing: 'up', motionArc: 'arms_out' }
  },
  {
    id: 'clap_front',
    label: 'Vỗ tay trước ngực',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, leftUpperDeg: 24, leftElbowDeg: 95, rightUpperDeg: 24, rightElbowDeg: 95, motionArc: 'clap' }
  },
  {
    id: 'clap_top',
    label: 'Vỗ tay trên cao',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, leftUpperDeg: 145, leftElbowDeg: -36, rightUpperDeg: 145, rightElbowDeg: -36, motionArc: 'clap' }
  },
  {
    id: 'hips_squat',
    label: 'Chống hông khuỵu gối',
    patch: { facing: 'front', torsoTiltDeg: 0, torsoForwardBend: 0, kneeSquat: 0.7, heelRaisePx: 0, leftUpperDeg: 48, leftElbowDeg: 105, rightUpperDeg: 48, rightElbowDeg: 105, leftHipDeg: 5, leftKneeDeg: 0, rightHipDeg: 5, rightKneeDeg: 0 }
  },
  {
    id: 'tiptoe',
    label: 'Kiễng gót',
    patch: { facing: 'front', kneeSquat: 0, heelRaisePx: 14, motionArc: 'hop_up' }
  },
  {
    id: 'side_left',
    label: 'Nghiêng lườn trái',
    patch: { facing: 'front', torsoTiltDeg: -22, torsoForwardBend: 0, leftUpperDeg: 48, leftElbowDeg: 105, rightUpperDeg: 162, rightElbowDeg: -16, leftHipDeg: 20, rightHipDeg: 20, motionArc: 'side_left' }
  },
  {
    id: 'bend_fwd',
    label: 'Cúi gập sâu',
    patch: { facing: 'profile_right', torsoTiltDeg: 0, torsoForwardBend: 0.92, kneeSquat: 0, leftUpperDeg: 15, leftElbowDeg: 0, rightUpperDeg: 15, rightElbowDeg: 0, leftHipDeg: 4, leftKneeDeg: 0, rightHipDeg: -4, rightKneeDeg: 0, motionArc: 'bend_down' }
  },
  {
    id: 'knee_lift',
    label: 'Nâng cao đùi',
    patch: { facing: 'profile_right', torsoTiltDeg: 0, torsoForwardBend: 0, kneeSquat: 0, heelRaisePx: 6, leftUpperDeg: -32, leftElbowDeg: 65, rightUpperDeg: 42, rightElbowDeg: 85, leftHipDeg: 78, leftKneeDeg: 88, rightHipDeg: -8, rightKneeDeg: 0, motionArc: 'run_forward' }
  },
];

export const CreateHdImageModal: React.FC<CreateHdImageModalProps> = ({
  isOpen,
  onClose,
  defaultGrade = '1',
  initialMovementName = '',
  onSaveToLibrary,
  onSaveAndAttachToLesson,
  showToast,
}) => {
  const safeInitGrade: '1' | '2' | '3' | '4' | '5' =
    defaultGrade === '2' || defaultGrade === '3' || defaultGrade === '4' || defaultGrade === '5'
      ? defaultGrade
      : '1';

  const [movementName, setMovementName] = useState<string>(
    initialMovementName || 'Động tác Vươn thở'
  );
  const [customDescription, setCustomDescription] = useState<string>('');
  const [grade, setGrade] = useState<'1' | '2' | '3' | '4' | '5'>(safeInitGrade);
  const [folder, setFolder] = useState<SubFolderType>('kyThuat');
  const [sceneMode, setSceneMode] = useState<HdSceneMode>('sequence_5');
  const [gender, setGender] = useState<HdGender>('male');
  const [equipment, setEquipment] = useState<HdEquipment>('none');
  const [resolution, setResolution] = useState<1600 | 2400 | 3200>(2400);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);

  const [sceneSpec, setSceneSpec] = useState<HdSceneSpec>(() =>
    buildHdSceneSpecFromKeyword(initialMovementName || 'Động tác Vươn thở', {
      grade: safeInitGrade,
      sceneMode: 'sequence_5',
      gender: 'male',
      equipment: 'none',
    })
  );

  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(1);
  const [isAiComposing, setIsAiComposing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [aiSourceLabel, setAiSourceLabel] = useState<string>('Bộ khung động học SGK 2D');

  useEffect(() => {
    if (isOpen) {
      const g: '1' | '2' | '3' | '4' | '5' =
        defaultGrade === '2' || defaultGrade === '3' || defaultGrade === '4' || defaultGrade === '5'
          ? defaultGrade
          : '1';
      setGrade(g);
      if (initialMovementName) {
        setMovementName(initialMovementName);
        setSceneSpec(
          buildHdSceneSpecFromKeyword(initialMovementName, {
            grade: g,
          })
        );
      }
    }
  }, [isOpen, defaultGrade, initialMovementName]);

  // Keep grade / gender / equipment / sceneMode in sync on current sceneSpec
  const effectiveSpec = useMemo<HdSceneSpec>(() => {
    return {
      ...sceneSpec,
      title: movementName.trim() || sceneSpec.title,
      grade,
      gender,
      equipment,
      sceneMode,
    };
  }, [sceneSpec, movementName, grade, gender, equipment, sceneMode]);

  const previewSvg = useMemo(
    () =>
      generateHdSgkSvg(effectiveSpec, {
        background: transparentBg ? 'studio_grid' : 'pure_white',
      }),
    [effectiveSpec, transparentBg]
  );

  const exportSvg = useMemo(
    () =>
      generateHdSgkSvg(effectiveSpec, {
        background: transparentBg ? 'transparent' : 'pure_white',
      }),
    [effectiveSpec, transparentBg]
  );

  const handleSelectPreset = (presetId: string) => {
    const preset = HD_PRESET_LIST.find((p) => p.id === presetId);
    if (!preset) return;
    setMovementName(preset.label.replace(/\s*\(K\d\)$/, ''));
    setGrade(preset.grade);
    setFolder(preset.folder);
    setSceneMode(preset.sceneMode);
    setEquipment(preset.equipment);
    const next = buildHdSceneSpecFromKeyword(preset.label, {
      grade: preset.grade,
      sceneMode: preset.sceneMode,
      gender,
      equipment: preset.equipment,
    });
    setSceneSpec(next);
    setSelectedStepIdx(next.poses.length > 1 ? 1 : 0);
    setAiSourceLabel('Mẫu chuẩn SGK Khối ' + preset.grade);
  };

  const handleAiCompose = async () => {
    if (!movementName.trim()) {
      showToast('Vui lòng nhập tên động tác hoặc trò chơi trước!');
      return;
    }

    setIsAiComposing(true);
    try {
      const res = await fetch('/api/ai/compose-hd-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName: movementName.trim(),
          grade,
          sceneMode,
          gender,
          equipment,
          customDescription: customDescription.trim(),
        }),
      });

      const data = await res.json();
      if (data?.success && !data.useLocalPreset && data.spec) {
        setSceneSpec(data.spec);
        setSelectedStepIdx(data.spec.poses?.length > 1 ? 1 : 0);
        setAiSourceLabel('Gemini 4 Hydrogen + Vector SGK 2K/4K');
        showToast('✨ Đã thiết kế xong bộ khung tư thế chuẩn SGK bằng AI!');
      } else {
        const localSpec = buildHdSceneSpecFromKeyword(movementName.trim(), {
          grade,
          sceneMode,
          gender,
          equipment,
        });
        setSceneSpec(localSpec);
        setSelectedStepIdx(localSpec.poses.length > 1 ? 1 : 0);
        setAiSourceLabel('Bộ tổng hợp động học SGK 2D (Tức thì)');
        showToast('✨ Đã dựng xong minh họa chất lượng cao theo chuẩn SGK!');
      }
    } catch {
      const localSpec = buildHdSceneSpecFromKeyword(movementName.trim(), {
        grade,
        sceneMode,
        gender,
        equipment,
      });
      setSceneSpec(localSpec);
      setAiSourceLabel('Bộ tổng hợp động học SGK 2D');
      showToast('✨ Đã dựng xong minh họa chất lượng cao!');
    } finally {
      setIsAiComposing(false);
    }
  };

  const handleUpdateStepPose = (idx: number, patch: Partial<HdPoseSpec>) => {
    setSceneSpec((prev) => {
      const nextPoses = prev.poses.map((p, i) => (i === idx ? { ...p, ...patch } : p));
      return { ...prev, poses: nextPoses };
    });
  };

  const buildImageItem = async (): Promise<SgkImageItem> => {
    const pngDataUrl = await renderSvgToHdPngDataUrl(exportSvg, resolution, transparentBg);
    const title = `${effectiveSpec.title} (Tạo mới ${resolution === 3200 ? '4K' : resolution === 2400 ? '2K' : 'HD'})`;
    return {
      id: `img_hd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      grade,
      folder,
      page: 1,
      category: FOLDER_TO_CATEGORY[folder] || 'dong_tac',
      imgUrl: pngDataUrl,
      caption: `${effectiveSpec.subtitle}. Xuất PNG độ phân giải ${resolution}×${Math.round((resolution * 540) / 1200)} px sắc nét.`,
      selected: false,
      createdAt: Date.now(),
    };
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const pngDataUrl = await renderSvgToHdPngDataUrl(exportSvg, resolution, transparentBg);
      const a = document.createElement('a');
      a.href = pngDataUrl;
      const slug = effectiveSpec.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      a.download = `gdtc_k${grade}_${slug || 'minh_hoa'}_${resolution}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`⬇️ Đã tải PNG ${resolution}px sắc nét về máy!`);
    } catch (err: any) {
      showToast('Lỗi xuất PNG: ' + (err?.message || 'Thử lại'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdtc_k${grade}_vector_goc.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('⬇️ Đã tải file Vector SVG gốc (phóng to vô hạn không vỡ nét)!');
  };

  const handleSave = async (attachImmediately: boolean) => {
    setIsExporting(true);
    try {
      const item = await buildImageItem();
      if (attachImmediately && onSaveAndAttachToLesson) {
        onSaveAndAttachToLesson(item);
      } else {
        onSaveToLibrary(item);
        showToast(`💾 Đã lưu ảnh chất lượng cao "${item.title}" vào Thư viện!`);
      }
      onClose();
    } catch (err: any) {
      showToast('Lỗi lưu ảnh: ' + (err?.message || 'Thử lại'));
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const resHeight = Math.round((resolution * 540) / 1200);
  const activeStep = effectiveSpec.poses[selectedStepIdx] || effectiveSpec.poses[0];

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 text-white px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/15 rounded-xl border border-white/25 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                Studio Tạo Mới Ảnh Minh Họa Chất Lượng Cao (HD / 2K / 4K)
              </h3>
              <p className="text-[11px] text-sky-100 truncate">
                Vẽ mới hoàn toàn từ đầu chuẩn SGK GDPT 2018 — sắc nét tuyệt đối khi chèn Word A4 & PDF, không cần cắt ảnh mờ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Panel: Controls (5 cols) */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 space-y-4 overflow-y-auto">
            {/* Quick Preset Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Chọn nhanh động tác / trò chơi mẫu (18+ bài SGK):</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                {HD_PRESET_LIST.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition whitespace-nowrap ${
                      movementName.toLowerCase().includes(p.label.toLowerCase().replace(/\s*\(k\d\)$/, '').slice(0, 12))
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Description + AI Compose */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Tên động tác hoặc trò chơi mới:
                </label>
                <input
                  type="text"
                  value={movementName}
                  onChange={(e) => setMovementName(e.target.value)}
                  placeholder="VD: Động tác Vươn thở, Nhảy dây cá nhân, Chạy tiếp sức..."
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mô tả thêm từng nhịp hoặc bối cảnh (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="VD: Nhịp 1 bước chân trái kiễng gót hai tay dang ngang sấp; Nhịp 2 khuỵu gối chống hông..."
                  className="w-full px-3 py-1.5 text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleAiCompose}
                disabled={isAiComposing}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Wand2 className={`w-4 h-4 text-amber-300 ${isAiComposing ? 'animate-spin' : ''}`} />
                <span>
                  {isAiComposing
                    ? 'Đang phân tích kỹ thuật & dựng hình...'
                    : '✨ Phân Tích Kỹ Thuật & Tạo Tranh Mới'}
                </span>
              </button>
            </div>

            {/* Grade, Folder, Layout Mode, Character, Equipment */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2.5 shadow-2xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as '1' | '2' | '3' | '4' | '5')}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="1">Khối Lớp 1</option>
                  <option value="2">Khối Lớp 2</option>
                  <option value="3">Khối Lớp 3</option>
                  <option value="4">Khối Lớp 4</option>
                  <option value="5">Khối Lớp 5</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Lưu vào mục:</label>
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value as SubFolderType)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="kyThuat">🏃 Kỹ thuật động tác</option>
                  <option value="luyenTap">👥 Luyện tập</option>
                  <option value="troChoi">🎯 Trò chơi vận động</option>
                  <option value="troChoiKhoiDong">🎮 Trò chơi khởi động</option>
                  <option value="khoiDong">⚡ Khởi động chung</option>
                  <option value="vanDung">🌱 Vận dụng & Hồi tĩnh</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Kiểu minh họa:</label>
                <select
                  value={sceneMode}
                  onChange={(e) => {
                    const nextMode = e.target.value as HdSceneMode;
                    setSceneMode(nextMode);
                    setSceneSpec(
                      buildHdSceneSpecFromKeyword(movementName, {
                        grade,
                        sceneMode: nextMode,
                        gender,
                        equipment,
                      })
                    );
                    setSelectedStepIdx(0);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="sequence_5">📊 Chuỗi phân thế 5 nhịp</option>
                  <option value="single_pose">🧍 1 tư thế chuẩn cận cảnh</option>
                  <option value="pair_practice">👫 Cặp đôi tập & sửa sai</option>
                  <option value="group_game">🏟️ Trò chơi sân tập thể</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nhân vật & Dụng cụ:</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGender(gender === 'male' ? 'female' : 'male')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1 shrink-0"
                    title="Đổi nhân vật Nam / Nữ"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{gender === 'male' ? 'Nam' : 'Nữ'}</span>
                  </button>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as HdEquipment)}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="none">Không dụng cụ</option>
                    <option value="stick">Gậy thể dục</option>
                    <option value="hoop">Vòng thể dục</option>
                    <option value="ball">Bóng rổ/chuyền</option>
                    <option value="rope">Dây nhảy</option>
                    <option value="flag">Cờ đích & cọc</option>
                    <option value="cone">Cọc nấm</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fine-tune individual step pose */}
            {sceneMode !== 'group_game' && effectiveSpec.poses.length > 0 && activeStep && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    Tinh chỉnh từng bước minh họa:
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {effectiveSpec.poses.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedStepIdx(idx)}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition ${
                          selectedStepIdx === idx
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Nhãn nhịp</label>
                    <input
                      type="text"
                      value={activeStep.label}
                      onChange={(e) => handleUpdateStepPose(selectedStepIdx, { label: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500">Chú thích dưới chân</label>
                    <input
                      type="text"
                      value={activeStep.caption}
                      onChange={(e) => handleUpdateStepPose(selectedStepIdx, { caption: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Đổi nhanh tư thế cho "{activeStep.label}":
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_STEP_POSES.map((qp) => (
                      <button
                        key={qp.id}
                        type="button"
                        onClick={() => handleUpdateStepPose(selectedStepIdx, qp.patch)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live HD Preview & Export Settings (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <Check className="w-3.5 h-3.5" />
                    {aiSourceLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold tabular-nums">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {resolution} × {resHeight} px
                  </span>
                </div>

                {/* Quality & Background pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
                    {([1600, 2400, 3200] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setResolution(r)}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          resolution === r
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {r === 1600 ? 'HD' : r === 2400 ? '2K Nét' : '4K Siêu Nét'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setTransparentBg(!transparentBg)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      transparentBg
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {transparentBg ? '🏁 Nền Trong Suốt PNG' : '📄 Nền Trắng In A4'}
                  </button>
                </div>
              </div>

              {/* Crisp Vector Preview Canvas */}
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-2 sm:p-3 shadow-inner flex items-center justify-center overflow-hidden">
                <img
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`}
                  alt={effectiveSpec.title}
                  className="w-full h-auto max-h-[380px] object-contain rounded-xl shadow-2xs bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tỉ lệ cơ thể học sinh tiểu học chuẩn, đồng phục áo trắng viền xanh.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Không bị nhòe hạt JPEG, không dính chữ thừa từ trang quét SGK.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Xuất PNG 2K/4K tương thích 100% Microsoft Word (.DOCX) & in A4.</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleDownloadPng}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Tải PNG ({resolution === 3200 ? '4K' : resolution === 2400 ? '2K' : 'HD'})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Tải file Vector SVG không giới hạn độ phóng đại"
                >
                  <FileCode2 className="w-4 h-4 text-indigo-600" />
                  <span>SVG Gốc</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Vào Thư Viện</span>
                </button>

                {onSaveAndAttachToLesson && (
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleSave(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Lưu &amp; Gắn Vào Giáo Án</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
