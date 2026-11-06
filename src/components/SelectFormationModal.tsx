import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Check,
  Users,
  Sparkles,
  Download,
  Search,
  Edit3,
  Palette,
  CheckCircle2,
  Trash2,
  ZoomIn,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  standardFormationDiagrams,
  FormationDiagram,
  createFormationSvg,
  getSavedCustomFormations,
  saveCustomFormationToStorage,
  deleteCustomFormationFromStorage,
  resetCustomFormations
} from '../data/formationDiagrams';
import { downloadSvgAsPng } from '../utils/imageProcessing';
import { FormationStudioModal } from './FormationStudioModal';

interface SelectFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRowIndex: number;
  onSelectFormation: (rowIndex: number, formation: FormationDiagram) => void;
}

export const SelectFormationModal: React.FC<SelectFormationModalProps> = ({
  isOpen,
  onClose,
  targetRowIndex,
  onSelectFormation,
}) => {
  // Bỏ tab 'all' (Tất Cả) theo yêu cầu người dùng, mặc định vào Khởi Động & Nhận Lớp
  const [selectedPhase, setSelectedPhase] = useState<string>('khoi_dong');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [courtTheme, setCourtTheme] = useState<'clean' | 'turf' | 'court'>('clean');
  
  // Tùy chọn thu nhỏ / phóng to kích thước hiển thị hình
  const [density, setDensity] = useState<'compact' | 'normal' | 'large'>('normal');

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Studio and custom state
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [selectedToEdit, setSelectedToEdit] = useState<FormationDiagram | null>(null);
  const [customList, setCustomList] = useState<FormationDiagram[]>([]);

  // Preview zoom modal
  const [zoomDiagram, setZoomDiagram] = useState<FormationDiagram | null>(null);
  
  // Row selection (Dòng 1 đến 5)
  const [selectedRow, setSelectedRow] = useState<number>(targetRowIndex >= 0 ? targetRowIndex : 2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomList(getSavedCustomFormations());
      if (targetRowIndex >= 0) {
        setSelectedRow(targetRowIndex);
      }
    }
  }, [isOpen, targetRowIndex]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const allDiagrams = useMemo(() => {
    const seen = new Set<string>();
    const list: FormationDiagram[] = [];

    // Custom diagrams first (with guaranteed unique IDs)
    customList.forEach((c, idx) => {
      const cleanId = c.id?.startsWith('custom_') ? c.id : `custom_${c.id || idx}`;
      const uniqueDiag = { ...c, id: cleanId };
      if (!seen.has(uniqueDiag.id)) {
        seen.add(uniqueDiag.id);
        list.push(uniqueDiag);
      }
    });

    // Standard diagrams
    standardFormationDiagrams.forEach((s) => {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        list.push(s);
      }
    });

    return list;
  }, [customList]);

  // Các tab sư phạm chuẩn (đã bỏ tab Tất Cả theo chỉ đạo)
  const phaseTabs = useMemo(() => {
    const tabs = [
      { id: 'khoi_dong', label: '⚡ Khởi Động & Nhận Lớp' },
      { id: 'tap_mau', label: '👀 Quan Sát Mẫu' },
      { id: 'dong_loat', label: '🏃 Tập Đồng Loạt' },
      { id: 'to_nhom', label: '👥 Tập Theo Tổ / Nhóm' },
      { id: 'cap_doi', label: '🤝 Cặp Đôi Sửa Sai' },
      { id: 'tro_choi', label: '🎮 Trò Chơi Vận Động' },
      { id: 'thi_dua', label: '⭐ Thi Đua Trình Diễn' },
      { id: 'hoi_tinh', label: '🍃 Hồi Tĩnh & Xuống Lớp' }
    ];
    if (customList.length > 0) {
      tabs.push({ id: 'custom', label: `✨ Tự Thiết Kế (${customList.length})` });
    }
    return tabs;
  }, [customList]);

  const filteredDiagrams = useMemo(() => {
    return allDiagrams.filter((item) => {
      const isCustom = customList.some((c) => c.id === item.id);
      let matchPhase = false;
      if (selectedPhase === 'custom') {
        matchPhase = isCustom;
      } else if (selectedPhase === 'khoi_dong') {
        matchPhase = item.phase === 'khoi_dong' || item.phase === 'nhan_lop';
      } else if (selectedPhase === 'hoi_tinh') {
        matchPhase = item.phase === 'hoi_tinh' || item.phase === 'xuong_lop';
      } else {
        matchPhase = item.phase === selectedPhase;
      }

      const matchSearch =
        !searchKeyword.trim() ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.description.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchPhase && matchSearch;
    });
  }, [allDiagrams, customList, selectedPhase, searchKeyword]);

  if (!isOpen) return null;

  const handleDownloadPng = async (e: React.MouseEvent, diagram: FormationDiagram) => {
    e.stopPropagation();
    await downloadSvgAsPng(diagram.svgDataUrl, `${diagram.id}_${courtTheme}.png`);
    showToast(`Đã tải file ảnh PNG của "${diagram.name}" về máy!`);
  };

  const handleApplyFormation = (diagram: FormationDiagram) => {
    onSelectFormation(selectedRow, diagram);
    showToast(`✨ Đã chèn sơ đồ "${diagram.name}" vào Cột 4 dòng số ${selectedRow + 1}!`);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Xóa đội hình tùy chỉnh / do AI tạo
  const handleDeleteCustomFormation = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const updated = deleteCustomFormationFromStorage(id);
    setCustomList(updated);
    showToast(`🗑️ Đã xóa sơ đồ "${name}" khỏi kho!`);
  };

  // AI Sinh sơ đồ đội hình mới
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-formation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          title: aiPrompt.trim(),
          description: aiPrompt.trim(),
          phase: selectedPhase === 'custom' ? 'tro_choi' : selectedPhase
        })
      });
      const data = await res.json();
      if (data.success && data.svgDataUrl) {
        const aiDiag: FormationDiagram = {
          id: 'ai_' + Date.now(),
          name: data.name || `Sơ đồ AI: ${aiPrompt}`,
          code: 'DH_AI',
          phase: (data.phase as any) || (selectedPhase === 'custom' ? 'tro_choi' : (selectedPhase as any)),
          description: data.description || aiPrompt,
          svgDataUrl: data.svgDataUrl
        };
        saveCustomFormationToStorage(aiDiag);
        const refreshed = getSavedCustomFormations();
        setCustomList(refreshed);
        setSelectedPhase(aiDiag.phase);
        setAiPrompt('');
        showToast(`✨ AI đã tạo xong sơ đồ: "${aiDiag.name}"!`);
      } else {
        showToast('⚠️ Không thể tạo sơ đồ, vui lòng thử lại.');
      }
    } catch (e) {
      console.error(e);
      showToast('⚠️ Lỗi kết nối AI, vui lòng thử lại.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Responsive Grid CSS theo mật độ thu nhỏ/vừa/lớn
  const gridClass =
    density === 'compact'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
      : density === 'large'
      ? 'grid-cols-1 sm:grid-cols-2 gap-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5';

  const imageAspectHeight =
    density === 'compact' ? 'h-28 sm:h-32' : density === 'large' ? 'h-48 sm:h-56' : 'h-36 sm:h-40';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[92vh] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Toast thông báo nhanh */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-70 shadow-lg border border-slate-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base">
                  Kho Sơ Đồ Đội Hình GDTC ({allDiagrams.length} Sơ Đồ)
                </h3>
                {customList.length > 0 && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    {customList.length} sơ đồ tự thiết kế
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Hiển thị trực quan theo dạng ảnh kèm ghi chú · Nhấn vào sơ đồ để chèn ngay vào Cột 4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Target Row Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-amber-300 font-bold whitespace-nowrap">📥 Chèn vào:</span>
              <select
                value={selectedRow}
                onChange={(e) => setSelectedRow(parseInt(e.target.value))}
                className="bg-slate-900 text-white font-bold rounded-lg px-2 py-1 border border-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
              >
                <option value={0}>Dòng 1: Mở đầu / Khởi động</option>
                <option value={1}>Dòng 2: Quan sát / Kiến thức mới</option>
                <option value={2}>Dòng 3: Luyện tập (Đồng loạt / Tổ / Cặp)</option>
                <option value={3}>Dòng 4: Trò chơi vận động</option>
                <option value={4}>Dòng 5: Hồi tĩnh & Xuống lớp</option>
              </select>
            </div>

            {/* Studio Tự Vẽ Button */}
            <button
              onClick={() => {
                setSelectedToEdit(null);
                setIsStudioOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition whitespace-nowrap cursor-pointer"
              title="Vẽ hoặc tạo mới sơ đồ đội hình"
            >
              <Palette className="w-4 h-4 text-amber-300" />
              <span>+ Vẽ Đội Hình Mới</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Tabs Sư Phạm + Thu nhỏ/Phóng to + AI Generator */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 space-y-2.5 text-xs shrink-0">
          
          {/* Phase Filter Tabs (Đã bỏ tab Tất Cả, mặc định tab Khởi động) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 flex-1">
              {phaseTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPhase(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedPhase === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Size / Density Controls: Thu nhỏ - Vừa - Lớn */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shrink-0 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold px-2">Cỡ hình:</span>
              <button
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  density === 'compact' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Thu nhỏ để xem nhiều sơ đồ cùng lúc (4 cột)"
              >
                <Grid3X3 className="w-3 h-3" />
                <span>Thu nhỏ (4)</span>
              </button>
              <button
                onClick={() => setDensity('normal')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  density === 'normal' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Hiển thị vừa (3 cột)"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Vừa (3)</span>
              </button>
              <button
                onClick={() => setDensity('large')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  density === 'large' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Phóng to để nhìn rõ cọc và vận động viên (2 cột)"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Lớn (2)</span>
              </button>
            </div>
          </div>

          {/* Search & AI Formation Creator Bar */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm nhanh: 1 hàng dọc, 2 hàng dọc, 1 hàng ngang, 4 hàng ngang, tiếp sức, vòng tròn, cặp đôi..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* AI Prompt Input & Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiGenerate();
                }}
                placeholder="Yêu cầu AI vẽ sơ đồ mới (VD: Chạy zíc zắc qua 5 cọc)..."
                className="flex-1 sm:w-72 bg-purple-50/80 border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
              />
              <button
                disabled={isGeneratingAi || !aiPrompt.trim()}
                onClick={handleAiGenerate}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition whitespace-nowrap cursor-pointer"
                title="Bấm để AI phân tích và tạo ngay sơ đồ vector sắc nét"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang vẽ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Tạo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Formation Diagrams Grid - Visual First: Ảnh lớn chiếm ưu thế, kèm ghi chú gọn gàng */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 min-h-0 bg-slate-50">
          {filteredDiagrams.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              <Users className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">Chưa tìm thấy sơ đồ phù hợp trong mục này</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Bạn có thể nhập từ khóa khác, bấm "+ Vẽ Đội Hình Mới", hoặc nhập yêu cầu để AI tự động vẽ sơ đồ cho bạn!
              </p>
            </div>
          ) : (
            <div className={`grid ${gridClass}`}>
              {filteredDiagrams.map((formation, fIdx) => {
                const isCustom = customList.some((c) => c.id === formation.id || `custom_${c.id}` === formation.id);

                return (
                  <div
                    key={`${formation.id}_${fIdx}`}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-150 flex flex-col justify-between overflow-hidden group shadow-2xs"
                  >
                    {/* Phần Ảnh Sơ Đồ Chiếm Ưu Thế (Visual-First) */}
                    <div
                      onClick={() => handleApplyFormation(formation)}
                      className="cursor-pointer relative bg-slate-100/70 p-2 border-b border-slate-200 flex items-center justify-center group-hover:bg-blue-50/30 transition overflow-hidden"
                      title={`Nhấn trực tiếp để chèn sơ đồ "${formation.name}" vào Dòng ${selectedRow + 1}`}
                    >
                      {/* Ảnh SVG sắc nét không bị vỡ */}
                      <img
                        src={formation.svgDataUrl}
                        alt={formation.name}
                        onError={(e) => {
                          // Fallback an toàn nếu có lỗi
                          const target = e.currentTarget;
                          target.src = createFormationSvg(formation.name, 'Sơ đồ GDTC', 'dong_loat');
                        }}
                        className={`w-full ${imageAspectHeight} object-contain rounded-lg bg-white shadow-2xs border border-slate-200/80 group-hover:scale-[1.015] transition duration-200`}
                      />

                      {/* Tag huy hiệu góc trên */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 z-10 pointer-events-none">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                          {formation.code || 'SƠ ĐỒ'}
                        </span>
                        {isCustom && (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                            Tự thiết kế
                          </span>
                        )}
                      </div>

                      {/* Nút Phóng to & Xóa ở góc trên phải */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomDiagram(formation);
                          }}
                          className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-700 shadow-md transition hover:scale-110 cursor-pointer"
                          title="Xem phóng to toàn màn hình"
                        >
                          <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        {isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomFormation(e, formation.id, formation.name)}
                            className="p-1 rounded-md bg-white/90 hover:bg-rose-50 text-rose-600 shadow-md transition hover:scale-110 cursor-pointer"
                            title="Xóa sơ đồ này để tạo lại"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Hover Overlay thông minh: 1-Click Insert */}
                      <div className="absolute inset-0 bg-blue-600/15 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition">
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Chèn Vào Cột 4 (Dòng {selectedRow + 1})</span>
                        </span>
                      </div>
                    </div>

                    {/* Phần Chú Thích Gọn Gàng Bên Dưới: Tiêu đề + Ghi chú ngắn */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        <h4
                          className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-blue-600 transition"
                          title={formation.name}
                        >
                          {formation.name}
                        </h4>
                        <p
                          className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5"
                          title={formation.description}
                        >
                          {formation.description || 'Sơ đồ bố trí sân bãi và cự ly học sinh an toàn.'}
                        </p>
                      </div>

                      {/* Quick Action Toolbar: Chèn (Chính) + Sửa Studio + Tải PNG */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleApplyFormation(formation)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-2xs cursor-pointer"
                          title={`Chèn trực tiếp vào Cột 4 dòng ${selectedRow + 1}`}
                        >
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Chèn Sơ Đồ</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedToEdit(formation);
                            setIsStudioOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg transition cursor-pointer"
                          title="Mở trong Studio để tùy biến kéo thả hoặc nhân bản"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                        </button>

                        <button
                          onClick={(e) => handleDownloadPng(e, formation)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition cursor-pointer"
                          title="Tải ảnh PNG độ nét cao về máy"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formation Studio Modal lồng vào khi sửa / tạo mới */}
        {isStudioOpen && (
          <FormationStudioModal
            isOpen={isStudioOpen}
            onClose={() => setIsStudioOpen(false)}
            targetRowIndex={selectedRow}
            initialFormation={selectedToEdit}
            onApplyFormationToRow={(rowIdx, customFormation) => {
              saveCustomFormationToStorage(customFormation);
              setCustomList(getSavedCustomFormations());
              onSelectFormation(rowIdx, customFormation);
              setIsStudioOpen(false);
              onClose();
            }}
            onSaveToLibrary={(customFormation) => {
              saveCustomFormationToStorage(customFormation);
              setCustomList(getSavedCustomFormations());
              showToast(`Đã lưu sơ đồ "${customFormation.name}" vào thư viện!`);
            }}
          />
        )}

        {/* Zoom Lightbox Preview Modal */}
        {zoomDiagram && (
          <div
            className="fixed inset-0 z-80 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setZoomDiagram(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full p-4 flex flex-col gap-3 shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{zoomDiagram.name}</h3>
                  <p className="text-xs text-slate-500">{zoomDiagram.description}</p>
                </div>
                <button
                  onClick={() => setZoomDiagram(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                <img
                  src={zoomDiagram.svgDataUrl}
                  alt={zoomDiagram.name}
                  className="w-full max-h-[55vh] object-contain rounded bg-white shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={(e) => handleDownloadPng(e, zoomDiagram)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tải Ảnh PNG</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedToEdit(zoomDiagram);
                      setZoomDiagram(null);
                      setIsStudioOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mở Sửa Trong Studio</span>
                  </button>
                  <button
                    onClick={() => {
                      handleApplyFormation(zoomDiagram);
                      setZoomDiagram(null);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Chèn Vào Cột 4 (Dòng {selectedRow + 1})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-slate-600">
            <span>Chuẩn hóa sư phạm GDPT 2018 · CV 5512 · Tự động chèn sơ đồ vào Cột 4 (Hoạt động học sinh)</span>
            {customList.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn làm mới kho sơ đồ tự thiết kế về mặc định không?')) {
                    resetCustomFormations();
                    setCustomList([]);
                    showToast('Đã làm mới kho sơ đồ về chuẩn ban đầu!');
                  }
                }}
                className="text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
              >
                (Làm mới kho tự vẽ)
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
