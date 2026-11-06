import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Download,
  Sparkles,
  Users,
  Copy,
  Trash2,
  RotateCcw,
  Palette,
  Layers,
  Flag,
  CircleDot,
  MoveHorizontal,
  MoveVertical,
  Plus,
  ArrowRight,
  BookOpen,
  ZoomIn,
  Square,
  Circle,
  Footprints,
  Sliders,
  Save,
  CheckCircle2,
  BoxSelect,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter
} from 'lucide-react';
import {
  FormationElement,
  CourtTheme,
  formationStudioPresets,
  renderFormationSvgString,
  generateFormationByContext,
  FormationPresetItem
} from '../utils/formationStudioUtils';
import { FormationDiagram, saveCustomFormationToStorage } from '../data/formationDiagrams';
import { downloadSvgAsPng } from '../utils/imageProcessing';

interface FormationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRowIndex: number;
  initialFormation?: FormationDiagram | null;
  onApplyFormationToRow: (rowIndex: number, formation: FormationDiagram) => void;
  onSaveToLibrary?: (formation: FormationDiagram) => void;
}

export const FormationStudioModal: React.FC<FormationStudioModalProps> = ({
  isOpen,
  onClose,
  targetRowIndex,
  initialFormation,
  onApplyFormationToRow,
  onSaveToLibrary
}) => {
  // Theme & Canvas Metadata
  const [theme, setTheme] = useState<CourtTheme>('clean');
  const [title, setTitle] = useState<string>('SƠ ĐỒ: ĐỘI HÌNH TẬP LUYỆN');
  const [subtitle, setSubtitle] = useState<string>('Chuẩn sư phạm GDPT 2018');

  // Canvas elements state
  const [elements, setElements] = useState<FormationElement[]>(() => {
    return JSON.parse(JSON.stringify(formationStudioPresets[3].elements)); // default 4 hàng dọc
  });

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const [dragStartPt, setDragStartPt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSnapshot, setInitialSnapshot] = useState<FormationElement[]>([]);

  // Marquee drag selection box
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState<boolean>(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);

  // History for Undo
  const [history, setHistory] = useState<FormationElement[][]>([]);

  // Selected Target Row (0 to 4)
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(targetRowIndex >= 0 ? targetRowIndex : 2);

  // Contextual Generator State
  const [contextPrompt, setContextPrompt] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Repeat counts for array duplication
  const [repeatCount, setRepeatCount] = useState<number>(4);
  const [repeatSpacing, setRepeatSpacing] = useState<number>(45);

  // Toast notification inside modal
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice(null);
    }, 3200);
  };

  // Sync target row when prop changes
  useEffect(() => {
    if (targetRowIndex >= 0) {
      setCurrentRowIndex(targetRowIndex);
    }
  }, [targetRowIndex]);

  // Load initial formation if provided
  useEffect(() => {
    if (initialFormation) {
      setTitle(initialFormation.name);
      setSubtitle(initialFormation.description);
      const matchPreset = formationStudioPresets.find((p) => p.name === initialFormation.name);
      if (matchPreset) {
        setElements(JSON.parse(JSON.stringify(matchPreset.elements)));
      }
    }
  }, [initialFormation]);

  // Push to history before state changes
  const recordHistory = (newElements: FormationElement[]) => {
    setHistory((prev) => [...prev.slice(-15), elements]);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setElements(previous);
  };

  // Preset load
  const handleLoadPreset = (preset: FormationPresetItem) => {
    recordHistory(JSON.parse(JSON.stringify(preset.elements)));
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setSelectedIds([]);
    showToast(`Đã nạp mẫu: ${preset.name}`);
  };

  // Convert client pointer coordinate to SVG 640x430 coordinate
  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 430 / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  // Pointer down on Canvas Background (Starts Marquee Selection)
  const handlePointerDownCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      setSelectedIds([]);
    }
    setIsMarqueeSelecting(true);
    setMarqueeStart(pt);
    setMarqueeCurrent(pt);
  };

  // Pointer down on an Element
  const handlePointerDownElement = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const pt = svgRef.current ? getSvgCoordinates(e as unknown as React.PointerEvent<SVGSVGElement>) : { x: 0, y: 0 };

    let newSelected = [...selectedIds];
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Toggle
      if (newSelected.includes(id)) {
        newSelected = newSelected.filter((item) => item !== id);
      } else {
        newSelected.push(id);
      }
    } else {
      // If clicking an unselected element, make it the sole selection
      // If clicking an already selected element, maintain the group selection so the group can be dragged
      if (!newSelected.includes(id)) {
        newSelected = [id];
      }
    }

    setSelectedIds(newSelected);
    setIsDraggingGroup(true);
    setDragStartPt(pt);
    setInitialSnapshot(JSON.parse(JSON.stringify(elements)));
  };

  // Pointer move on Canvas
  const handlePointerMoveCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);

    // Marquee Box Selection
    if (isMarqueeSelecting && marqueeStart) {
      setMarqueeCurrent(pt);
      const minX = Math.min(marqueeStart.x, pt.x);
      const maxX = Math.max(marqueeStart.x, pt.x);
      const minY = Math.min(marqueeStart.y, pt.y);
      const maxY = Math.max(marqueeStart.y, pt.y);

      // Only consider marquee if dragged beyond minimal threshold (5px)
      if (maxX - minX > 5 || maxY - minY > 5) {
        const enclosedIds = elements
          .filter((el) => {
            const elX = el.x;
            const elY = el.y;
            return elX >= minX && elX <= maxX && elY >= minY && elY <= maxY;
          })
          .map((el) => el.id);

        setSelectedIds(enclosedIds);
      }
      return;
    }

    // Dragging Selected Group
    if (isDraggingGroup && selectedIds.length > 0 && initialSnapshot.length > 0) {
      const dx = pt.x - dragStartPt.x;
      const dy = pt.y - dragStartPt.y;

      setElements(
        initialSnapshot.map((item) => {
          if (selectedIds.includes(item.id)) {
            const newX = Math.max(15, Math.min(625, item.x + dx));
            const newY = Math.max(60, Math.min(415, item.y + dy));
            const diffX = newX - item.x;
            const diffY = newY - item.y;

            if (item.endX !== undefined && item.endY !== undefined) {
              return {
                ...item,
                x: newX,
                y: newY,
                endX: Math.max(15, Math.min(625, item.endX + diffX)),
                endY: Math.max(60, Math.min(415, item.endY + diffY))
              };
            }
            return { ...item, x: newX, y: newY };
          }
          return item;
        })
      );
    }
  };

  // Pointer up on Canvas
  const handlePointerUpCanvas = () => {
    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
    }
    if (isDraggingGroup) {
      setIsDraggingGroup(false);
      // Record history if positions changed
      if (JSON.stringify(initialSnapshot) !== JSON.stringify(elements)) {
        setHistory((prev) => [...prev.slice(-15), initialSnapshot]);
      }
    }
  };

  // Primary selected element for single-item inspector
  const primarySelectedElement = useMemo(
    () => elements.find((item) => item.id === (selectedIds[0] || '')) || null,
    [elements, selectedIds]
  );

  // Group bounding box for multi-selection indicator
  const groupBoundingBox = useMemo(() => {
    if (selectedIds.length <= 1) return null;
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    if (selectedObjs.length === 0) return null;

    let minX = 9999,
      maxX = -9999,
      minY = 9999,
      maxY = -9999;
    selectedObjs.forEach((el) => {
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x);
      minY = Math.min(minY, el.y);
      maxY = Math.max(maxY, el.y);
      if (el.endX !== undefined) {
        minX = Math.min(minX, el.endX);
        maxX = Math.max(maxX, el.endX);
      }
      if (el.endY !== undefined) {
        minY = Math.min(minY, el.endY);
        maxY = Math.max(maxY, el.endY);
      }
    });

    return {
      x: minX,
      y: minY,
      w: Math.max(20, maxX - minX),
      h: Math.max(20, maxY - minY)
    };
  }, [elements, selectedIds]);

  // Select All Elements
  const handleSelectAll = () => {
    setSelectedIds(elements.map((el) => el.id));
    showToast(`Đã chọn toàn bộ ${elements.length} đối tượng trên sân!`);
  };

  // Deselect All
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Group: Delete Selected
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    recordHistory(elements.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    showToast(`Đã xóa ${count} đối tượng!`);
  };

  // Group: Duplicate Selected (Nhân bản cả nhóm)
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    const newClones: FormationElement[] = [];
    const newIds: string[] = [];

    selectedObjs.forEach((el, index) => {
      const newId = `${el.type}_copy_${Date.now()}_${index}`;
      const clone: FormationElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        x: Math.min(615, el.x + 25),
        y: Math.min(405, el.y + 25)
      };
      if (el.endX !== undefined && el.endY !== undefined) {
        clone.endX = Math.min(615, el.endX + 25);
        clone.endY = Math.min(405, el.endY + 25);
      }
      newClones.push(clone);
      newIds.push(newId);
    });

    recordHistory([...elements, ...newClones]);
    setSelectedIds(newIds);
    showToast(`Đã nhân bản ${newClones.length} đối tượng thành nhóm mới!`);
  };

  // Group: Align Horizontal (Đồng Y)
  const handleAlignHorizontal = () => {
    if (selectedIds.length <= 1) return;
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    const avgY = Math.round(selectedObjs.reduce((acc, el) => acc + el.y, 0) / selectedObjs.length);

    recordHistory(
      elements.map((item) => {
        if (selectedIds.includes(item.id)) {
          return { ...item, y: avgY };
        }
        return item;
      })
    );
    showToast('Đã căn thẳng hàng ngang!');
  };

  // Group: Align Vertical (Đồng X)
  const handleAlignVertical = () => {
    if (selectedIds.length <= 1) return;
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    const avgX = Math.round(selectedObjs.reduce((acc, el) => acc + el.x, 0) / selectedObjs.length);

    recordHistory(
      elements.map((item) => {
        if (selectedIds.includes(item.id)) {
          return { ...item, x: avgX };
        }
        return item;
      })
    );
    showToast('Đã căn thẳng hàng dọc!');
  };

  // Group: Distribute Horizontally (Dàn đều khoảng cách ngang)
  const handleDistributeHorizontal = () => {
    if (selectedIds.length < 3) return;
    const selectedObjs = elements
      .filter((el) => selectedIds.includes(el.id))
      .sort((a, b) => a.x - b.x);

    const firstX = selectedObjs[0].x;
    const lastX = selectedObjs[selectedObjs.length - 1].x;
    const step = (lastX - firstX) / (selectedObjs.length - 1);

    const updatedMap = new Map<string, number>();
    selectedObjs.forEach((el, idx) => {
      updatedMap.set(el.id, Math.round(firstX + idx * step));
    });

    recordHistory(
      elements.map((item) => {
        if (updatedMap.has(item.id)) {
          return { ...item, x: updatedMap.get(item.id)! };
        }
        return item;
      })
    );
    showToast('Đã dàn đều cự ly các đối tượng!');
  };

  // Group: Change Color for all selected
  const handleGroupColorChange = (color: string) => {
    if (selectedIds.length === 0) return;
    recordHistory(
      elements.map((item) => {
        if (selectedIds.includes(item.id)) {
          return { ...item, color };
        }
        return item;
      })
    );
    showToast(`Đã đổi màu cho ${selectedIds.length} đối tượng!`);
  };

  // Single Item: Update attributes
  const handleUpdateSingleSelected = (props: Partial<FormationElement>) => {
    if (selectedIds.length === 0) return;
    const targetId = selectedIds[0];
    recordHistory(
      elements.map((item) => (item.id === targetId ? { ...item, ...props } : item))
    );
  };

  // Clear Canvas
  const handleClearAll = () => {
    if (elements.length === 0) return;
    recordHistory([]);
    setSelectedIds([]);
    showToast('Đã xóa trắng sân tập!');
  };

  // Add Elements
  const handleAddElement = (type: FormationElement['type'], extra?: Partial<FormationElement>) => {
    const newId = `${type}_${Date.now()}`;
    const defaultProps: Partial<FormationElement> = {
      x: 320,
      y: 220,
      color: '#1e293b'
    };

    if (type === 'gv') {
      defaultProps.color = '#dc2626';
      defaultProps.label = 'GV';
      defaultProps.y = 85;
    } else if (type === 'cs') {
      defaultProps.color = '#0284c7';
      defaultProps.label = 'CS';
    } else if (type === 'tt') {
      defaultProps.color = '#ea580c';
      defaultProps.label = 'TT';
    } else if (type === 'hs') {
      defaultProps.color = '#2563eb';
      defaultProps.radius = 11;
    } else if (type === 'ball') {
      defaultProps.color = '#ea580c';
      defaultProps.radius = 13;
    } else if (type === 'cone') {
      defaultProps.color = '#ea580c';
    } else if (type === 'marker') {
      defaultProps.color = '#eab308';
    } else if (type === 'hoop') {
      defaultProps.color = '#06b6d4';
      defaultProps.radius = 20;
    } else if (type === 'stick') {
      defaultProps.color = '#d97706';
      defaultProps.width = 40;
      defaultProps.height = 7;
    } else if (type === 'flag') {
      defaultProps.color = '#dc2626';
    } else if (type === 'line_solid') {
      defaultProps.color = '#dc2626';
      defaultProps.endX = 420;
      defaultProps.endY = 220;
      defaultProps.label = 'Vạch XP';
    } else if (type === 'line_dashed') {
      defaultProps.color = '#64748b';
      defaultProps.endX = 420;
      defaultProps.endY = 220;
      defaultProps.label = 'Giới hạn';
    } else if (type === 'arrow_straight') {
      defaultProps.color = '#16a34a';
      defaultProps.endX = 400;
      defaultProps.endY = 220;
    } else if (type === 'arrow_curved') {
      defaultProps.color = '#ea580c';
      defaultProps.endX = 400;
      defaultProps.endY = 220;
    } else if (type === 'shape_rect') {
      defaultProps.color = '#3b82f6';
      defaultProps.width = 160;
      defaultProps.height = 90;
      defaultProps.label = 'Khu Vực Tổ';
    } else if (type === 'shape_circle') {
      defaultProps.color = '#3b82f6';
      defaultProps.radius = 50;
      defaultProps.label = 'Vòng Tròn';
    } else if (type === 'text') {
      defaultProps.color = '#475569';
      defaultProps.label = 'Ghi chú chỉ dẫn';
      defaultProps.fontSize = 12.5;
    } else if (type === 'sgk_board') {
      defaultProps.color = '#d97706';
      defaultProps.width = 140;
      defaultProps.height = 60;
      defaultProps.label = 'Động tác mẫu';
    }

    const newElement: FormationElement = {
      id: newId,
      type,
      ...defaultProps,
      ...extra
    } as FormationElement;

    recordHistory([...elements, newElement]);
    setSelectedIds([newId]);
    showToast(`Đã thêm đối tượng mới lên sân!`);
  };

  // Repetition: Horizontal repeat (Row)
  const handleRepeatHorizontal = () => {
    if (!primarySelectedElement) return;
    const clones: FormationElement[] = [];
    for (let i = 1; i <= repeatCount; i++) {
      const clone: FormationElement = {
        ...JSON.parse(JSON.stringify(primarySelectedElement)),
        id: `${primarySelectedElement.id}_h_${Date.now()}_${i}`,
        x: Math.min(620, primarySelectedElement.x + i * repeatSpacing)
      };
      if (primarySelectedElement.endX !== undefined) {
        clone.endX = Math.min(620, primarySelectedElement.endX + i * repeatSpacing);
      }
      clones.push(clone);
    }
    recordHistory([...elements, ...clones]);
    showToast(`Đã nhân bản ${repeatCount} đối tượng theo hàng ngang!`);
  };

  // Repetition: Vertical repeat (Column)
  const handleRepeatVertical = () => {
    if (!primarySelectedElement) return;
    const clones: FormationElement[] = [];
    for (let i = 1; i <= repeatCount; i++) {
      const clone: FormationElement = {
        ...JSON.parse(JSON.stringify(primarySelectedElement)),
        id: `${primarySelectedElement.id}_v_${Date.now()}_${i}`,
        y: Math.min(410, primarySelectedElement.y + i * repeatSpacing)
      };
      if (primarySelectedElement.endY !== undefined) {
        clone.endY = Math.min(410, primarySelectedElement.endY + i * repeatSpacing);
      }
      clones.push(clone);
    }
    recordHistory([...elements, ...clones]);
    showToast(`Đã nhân bản ${repeatCount} đối tượng theo hàng dọc!`);
  };

  // Contextual AI Auto-generator
  const handleContextGenerate = () => {
    if (!contextPrompt.trim()) return;
    setIsAiProcessing(true);
    try {
      const generated = generateFormationByContext(contextPrompt.trim());
      recordHistory(generated.elements);
      setTitle(generated.title);
      setSubtitle(generated.subtitle);
      setSelectedIds([]);
      showToast(`Đã sinh sơ đồ theo mô tả: "${contextPrompt.trim()}"`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Current Generated SVG Data URL
  const currentSvgDataUrl = useMemo(() => {
    return renderFormationSvgString(elements, theme, title, subtitle);
  }, [elements, theme, title, subtitle]);

  // Export handlers
  const handleDownloadPng = async () => {
    await downloadSvgAsPng(currentSvgDataUrl, `so_do_doi_hinh_${Date.now()}.png`);
    showToast('Đã tải ảnh PNG độ nét cao (1280x860) về máy tính!');
  };

  const handleDownloadSvg = () => {
    const a = document.createElement('a');
    a.href = currentSvgDataUrl;
    a.download = `so_do_doi_hinh_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Đã tải tệp Vector SVG về máy tính!');
  };

  // Apply to Column 4 of chosen row
  const handleApplyToRow = () => {
    const diagram: FormationDiagram = {
      id: `dh_custom_${Date.now()}`,
      name: title,
      code: 'DH_CUSTOM',
      phase: 'dong_loat',
      description: subtitle,
      svgDataUrl: currentSvgDataUrl
    };

    saveCustomFormationToStorage(diagram);
    if (onSaveToLibrary) {
      onSaveToLibrary(diagram);
    }
    onApplyFormationToRow(currentRowIndex, diagram);
    showToast(`✨ Đã gắn sơ đồ "${title}" vào Cột 4 dòng số ${currentRowIndex + 1}!`);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  // Save to Library
  const handleSaveOnlyToLibrary = () => {
    const diagram: FormationDiagram = {
      id: `dh_custom_${Date.now()}`,
      name: title,
      code: 'DH_CUSTOM',
      phase: 'dong_loat',
      description: subtitle,
      svgDataUrl: currentSvgDataUrl
    };

    saveCustomFormationToStorage(diagram);
    if (onSaveToLibrary) {
      onSaveToLibrary(diagram);
    }
    showToast(`💾 Đã lưu sơ đồ "${title}" vào Kho Sơ Đồ thành công!`);
  };

  if (!isOpen) return null;

  const colorPalette = [
    '#dc2626', // Red
    '#2563eb', // Blue
    '#16a34a', // Green
    '#ea580c', // Orange
    '#eab308', // Yellow
    '#9333ea', // Purple
    '#06b6d4', // Cyan
    '#475569', // Slate
    '#1e293b', // Dark Slate
    '#ffffff' // White
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3">
      <div className="bg-white rounded-2xl max-w-7xl w-full h-[90vh] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 relative">
        
        {/* In-Modal Toast Banner */}
        {toastNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-60 shadow-xl border border-slate-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Header - Fixed & Always Visible */}
        <div className="p-3 sm:p-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight">
                  Studio Thiết Kế Sơ Đồ Đội Hình GDTC
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  GDPT 2018 · CV 5512
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Kéo chuột quét vùng chọn nhóm đối tượng, nhân bản hàng loạt và chèn trực tiếp vào Cột 4 giáo án
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Guarantee visibility on all screen resolutions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOnlyToLibrary}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
              title="Lưu sơ đồ này vào Kho Sơ Đồ thư viện"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưu Thư Viện</span>
            </button>

            <button
              onClick={handleApplyToRow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md"
              title={`Gắn sơ đồ này vào Cột 4 dòng số ${currentRowIndex + 1}`}
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Gắn Cột 4 (Dòng {currentRowIndex + 1})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Quick Bar: Presets & Contextual AI (Shrink-0) */}
        <div className="p-2.5 sm:p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2.5 items-center justify-between text-xs shrink-0">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 whitespace-nowrap">📋 Mẫu Sơ Đồ:</span>
            <select
              onChange={(e) => {
                const found = formationStudioPresets.find((p) => p.id === e.target.value);
                if (found) handleLoadPreset(found);
              }}
              defaultValue="p_4_hang_doc"
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[240px] sm:max-w-xs shadow-2xs"
            >
              <optgroup label="1. Đội Hình Hàng Dọc">
                <option value="p_1_hang_doc">1 Hàng Dọc (Tập trung thẳng)</option>
                <option value="p_2_hang_doc">2 Hàng Dọc (2 Tổ song song)</option>
                <option value="p_3_hang_doc">3 Hàng Dọc (3 Cột thẳng)</option>
                <option value="p_4_hang_doc">4 Hàng Dọc (Chuẩn 4 Tổ lớp học)</option>
              </optgroup>
              <optgroup label="2. Đội Hình Hàng Ngang">
                <option value="p_1_hang_ngang">1 Hàng Ngang (Tập trung cự ly hẹp)</option>
                <option value="p_2_hang_ngang">2 Hàng Ngang (So le quan sát rõ)</option>
                <option value="p_3_hang_ngang">3 Hàng Ngang (Đồng loạt theo nhịp)</option>
                <option value="p_4_hang_ngang">4 Hàng Ngang (Khởi động / Nhận lớp)</option>
              </optgroup>
              <optgroup label="3. Tổ Nhóm & Cá Nhân & Cặp Đôi">
                <option value="p_to_nhom_4_goc">Tập Luyện 4 Tổ Tại 4 Khu Vực Sân</option>
                <option value="p_tap_ca_nhan">Tập Luyện Cá Nhân Tự Giác</option>
                <option value="p_tap_cap_doi">Tập Luyện Cặp Đôi Đối Diện Sửa Sai</option>
              </optgroup>
              <optgroup label="4. Sơ Đồ Trò Chơi Vận Động">
                <option value="p_tro_choi_tiep_suc">Trò Chơi Tiếp Sức (4 Làn + Cọc Tiêu)</option>
                <option value="p_tro_choi_vong_tron">Trò Chơi Theo Vòng Tròn (GV Tâm)</option>
              </optgroup>
              <optgroup label="5. Quy Trình Tiết Học">
                <option value="p_nhan_lop_cu_ly_hep">Đội Hình Nhận Lớp (Điểm số báo cáo)</option>
                <option value="p_quan_sat_tranh_mau">Đội Hình Quan Sát Tranh SGK & Mẫu</option>
                <option value="p_hoi_tinh_xuong_lop">Đội Hình Hồi Tĩnh & Xuống Lớp</option>
              </optgroup>
            </select>
          </div>

          {/* Contextual Generator */}
          <div className="flex-1 flex items-center gap-1.5 min-w-[260px]">
            <input
              type="text"
              value={contextPrompt}
              onChange={(e) => setContextPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleContextGenerate();
              }}
              placeholder="Nhập mô tả hoạt động: tiếp sức 4 làn, cướp cờ, vòng tròn 12 em, 3 hàng dọc..."
              className="flex-1 bg-white border border-purple-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
            />
            <button
              onClick={handleContextGenerate}
              disabled={!contextPrompt.trim() || isAiProcessing}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" /> Tạo Theo Ngữ Cảnh
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setTheme('clean')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                theme === 'clean' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⚪ Trắng Sư Phạm
            </button>
            <button
              onClick={() => setTheme('turf')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                theme === 'turf' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟢 Sân Cỏ
            </button>
            <button
              onClick={() => setTheme('court')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                theme === 'court' ? 'bg-amber-800 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟤 Sàn Gỗ
            </button>
          </div>
        </div>

        {/* Main Workspace Body - Flex-1 and min-h-0 so it NEVER overflows */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row bg-slate-50">
          
          {/* Left Palette: Add Elements */}
          <div className="w-full lg:w-56 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-2.5 flex flex-col gap-2.5 text-xs overflow-y-auto max-h-[180px] lg:max-h-none custom-scrollbar">
            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1">
                1. Nhân Vật & Vị Trí
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleAddElement('hs')}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <CircleDot className="w-3.5 h-3.5 text-blue-600" /> + Học Sinh
                </button>
                <button
                  onClick={() => handleAddElement('gv')}
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <span className="text-red-600 font-black"></span> + Giáo Viên
                </button>
                <button
                  onClick={() => handleAddElement('cs')}
                  className="bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-bold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <span className="text-sky-600 font-black">CS</span> + Cán Sự
                </button>
                <button
                  onClick={() => handleAddElement('tt')}
                  className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-bold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <span className="text-orange-600 font-black">TT</span> + Tổ Trưởng
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1">
                2. Dụng Cụ Thể Dục
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleAddElement('ball')}
                  className="bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ⚽ Bóng
                </button>
                <button
                  onClick={() => handleAddElement('cone')}
                  className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  🔺 Chóp Nón
                </button>
                <button
                  onClick={() => handleAddElement('marker')}
                  className="bg-slate-100 hover:bg-yellow-50 hover:text-yellow-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  🟡 Nấm Mốc
                </button>
                <button
                  onClick={() => handleAddElement('hoop')}
                  className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ⭕ Vòng TD
                </button>
                <button
                  onClick={() => handleAddElement('stick')}
                  className="bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ▬ Gậy TD
                </button>
                <button
                  onClick={() => handleAddElement('flag')}
                  className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  🚩 Cờ Đích
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1">
                3. Đường Kẻ, Mũi Tên & Vùng
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleAddElement('line_solid')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  📏 Vạch XP
                </button>
                <button
                  onClick={() => handleAddElement('line_dashed')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ┈ Giới Hạn
                </button>
                <button
                  onClick={() => handleAddElement('arrow_straight')}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ➔ Mũi Tên
                </button>
                <button
                  onClick={() => handleAddElement('arrow_curved')}
                  className="bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ↩ Quay Đầu
                </button>
                <button
                  onClick={() => handleAddElement('shape_rect')}
                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <Square className="w-3 h-3 text-blue-600" /> Vùng Tổ
                </button>
                <button
                  onClick={() => handleAddElement('shape_circle')}
                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  <Circle className="w-3 h-3 text-blue-600" /> Vùng Tròn
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1">
                4. Tranh & Ghi Chú
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleAddElement('sgk_board')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold p-1 rounded-lg border border-amber-200 flex items-center gap-1 transition text-[11px]"
                >
                  📖 Bảng Tranh
                </button>
                <button
                  onClick={() => handleAddElement('text')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-1 rounded-lg border border-slate-200 flex items-center gap-1 transition text-[11px]"
                >
                  ✍️ Chữ
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 mt-auto">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition text-[11px]"
              >
                <RotateCcw className="w-3 h-3" /> Hoàn Tác (Undo)
              </button>
              <button
                onClick={handleClearAll}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition text-[11px]"
              >
                <Trash2 className="w-3 h-3" /> Xóa Trắng Sân
              </button>
            </div>
          </div>

          {/* Center Canvas Area - Auto scales to fit without overflowing */}
          <div className="flex-1 min-h-0 p-2 sm:p-3 flex flex-col items-center justify-center overflow-hidden bg-slate-100/70">
            
            {/* Inline Title / Subtitle editors */}
            <div className="w-full max-w-[620px] flex gap-2 mb-1.5 text-xs shrink-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề sơ đồ (VD: SƠ ĐỒ ĐỘI HÌNH 4 HÀNG DỌC)"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ghi chú phụ (VD: Cự ly 1 cánh tay)"
                className="w-44 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* Quick Canvas Toolbar: Marquee hints & Select all */}
            <div className="w-full max-w-[620px] mb-1.5 flex items-center justify-between text-[11px] text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700 flex items-center gap-1">
                  <BoxSelect className="w-3.5 h-3.5 text-blue-600" />
                  {selectedIds.length > 0 ? (
                    <span>Đang chọn: <strong>{selectedIds.length}</strong> đối tượng</span>
                  ) : (
                    <span>Kéo chuột trên sân để quét vùng chọn nhóm</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSelectAll}
                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold transition border border-blue-200"
                >
                  🔘 Chọn Tất Cả ({elements.length})
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold transition"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="relative border-2 border-slate-300 rounded-xl shadow-md overflow-hidden bg-white max-w-[620px] max-h-[calc(90vh-270px)] w-full aspect-[640/430] select-none">
              <svg
                ref={svgRef}
                viewBox="0 0 640 430"
                className="w-full h-full cursor-crosshair"
                onPointerDown={handlePointerDownCanvas}
                onPointerMove={handlePointerMoveCanvas}
                onPointerUp={handlePointerUpCanvas}
              >
                <defs>
                  <marker
                    id="arrowMarkerStudio"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
                  </marker>
                  <marker
                    id="arrowMarkerOrangeStudio"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
                  </marker>
                  <pattern id="turfPatternStudio" width="60" height="60" patternUnits="userSpaceOnUse">
                    <rect width="30" height="60" fill="#000000" fillOpacity="0.08" />
                    <rect x="30" width="30" height="60" fill="#ffffff" fillOpacity="0.05" />
                  </pattern>
                  <linearGradient id="woodGradStudio" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b45309" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#d97706" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0.95" />
                  </linearGradient>
                  <filter id="shadowStudio" x="-10%" y="-10%" width="125%" height="125%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.22" />
                  </filter>
                </defs>

                {/* Court Background */}
                {theme === 'turf' && (
                  <g>
                    <rect width="640" height="430" rx="16" fill="#15803d" />
                    <rect x="0" y="0" width="640" height="430" rx="16" fill="url(#turfPatternStudio)" opacity="0.22" />
                    <rect x="24" y="60" width="592" height="346" rx="8" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeOpacity="0.85" />
                    <line x1="320" y1="60" x2="320" y2="406" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.75" />
                    <circle cx="320" cy="233" r="56" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeOpacity="0.75" />
                    <circle cx="320" cy="233" r="4" fill="#ffffff" strokeOpacity="0.9" />
                    <rect x="0" y="0" width="640" height="52" rx="15" fill="#0f172a" fillOpacity="0.45" />
                    <line x1="0" y1="52" x2="640" y2="52" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.25" />
                  </g>
                )}

                {theme === 'court' && (
                  <g>
                    <rect width="640" height="430" rx="16" fill="#9a3412" />
                    <rect x="0" y="0" width="640" height="430" rx="16" fill="url(#woodGradStudio)" />
                    <rect x="24" y="60" width="592" height="346" rx="8" fill="none" stroke="#fef08a" strokeWidth="2.8" strokeOpacity="0.85" />
                    <line x1="320" y1="60" x2="320" y2="406" stroke="#fef08a" strokeWidth="2.2" strokeOpacity="0.75" />
                    <circle cx="320" cy="233" r="56" fill="none" stroke="#fef08a" strokeWidth="2.2" strokeOpacity="0.75" />
                    <circle cx="320" cy="233" r="4" fill="#fef08a" />
                    <rect x="0" y="0" width="640" height="52" rx="15" fill="#0f172a" fillOpacity="0.48" />
                    <line x1="0" y1="52" x2="640" y2="52" stroke="#fef08a" strokeWidth="1.5" strokeOpacity="0.3" />
                  </g>
                )}

                {theme === 'clean' && (
                  <g>
                    <rect width="640" height="430" rx="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x="0" y="0" width="640" height="48" rx="15" fill="#f8fafc" />
                    <line x1="0" y1="48" x2="640" y2="48" stroke="#e2e8f0" strokeWidth="1.5" />
                    <rect x="24" y="66" width="592" height="340" rx="8" fill="#fbfcfe" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="6,4" />
                  </g>
                )}

                {/* Header Titles */}
                <text
                  x="24"
                  y="32"
                  fontFamily="sans-serif"
                  fontSize="15"
                  fontWeight="bold"
                  fill={theme === 'clean' ? '#1e293b' : '#ffffff'}
                >
                  {title}
                </text>
                <text
                  x="616"
                  y="32"
                  fontFamily="sans-serif"
                  fontSize="12.5"
                  fontWeight="600"
                  fill={theme === 'turf' ? '#bbf7d0' : theme === 'court' ? '#fef08a' : '#64748b'}
                  textAnchor="end"
                >
                  {subtitle}
                </text>

                {/* Render All Elements */}
                {elements.map((el) => {
                  const isSelected = selectedIds.includes(el.id);

                  return (
                    <g
                      key={el.id}
                      onPointerDown={(e) => handlePointerDownElement(e, el.id)}
                      className="cursor-move"
                    >
                      {/* Selection Box / Halo */}
                      {isSelected && (
                        <circle
                          cx={el.x}
                          cy={el.y}
                          r={24}
                          fill="#3b82f6"
                          fillOpacity="0.12"
                          stroke="#2563eb"
                          strokeWidth="2.2"
                          strokeDasharray="4,3"
                        />
                      )}

                      {/* Element Type Render */}
                      {el.type === 'gv' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <polygon points="0,-18 -16,14 16,14" fill={el.color || '#dc2626'} />
                          <text
                            x="0"
                            y="28"
                            fontFamily="sans-serif"
                            fontSize="13"
                            fontWeight="bold"
                            fill={el.color || '#dc2626'}
                            textAnchor="middle"
                          >
                             {el.label || 'GV'}
                          </text>
                        </g>
                      )}

                      {el.type === 'hs' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <circle cx="0" cy="0" r={el.radius || 11} fill={el.color || '#2563eb'} stroke="#ffffff" strokeWidth="2" />
                          {el.label && (
                            <text
                              x="0"
                              y="4"
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#ffffff"
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'cs' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <circle cx="0" cy="0" r={el.radius || 12} fill={el.color || '#0284c7'} stroke="#ffffff" strokeWidth="2" />
                          <text
                            x="0"
                            y="4.5"
                            fontFamily="sans-serif"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            {el.label || 'CS'}
                          </text>
                        </g>
                      )}

                      {el.type === 'tt' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <circle cx="0" cy="0" r={el.radius || 12} fill={el.color || '#ea580c'} stroke="#ffffff" strokeWidth="2" />
                          <text
                            x="0"
                            y="4.5"
                            fontFamily="sans-serif"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            {el.label || 'TT'}
                          </text>
                        </g>
                      )}

                      {el.type === 'ball' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <circle cx="0" cy="0" r={el.radius || 13} fill={el.color || '#ea580c'} stroke="#ffffff" strokeWidth="2" />
                          <path d={`M ${-(el.radius || 13)} 0 Q 0 ${-(el.radius || 13) / 2} ${el.radius || 13} 0`} stroke="#ffffff" strokeWidth="1.8" fill="none" />
                          <path d={`M ${-(el.radius || 13)} 0 Q 0 ${(el.radius || 13) / 2} ${el.radius || 13} 0`} stroke="#ffffff" strokeWidth="1.8" fill="none" />
                          <line x1="0" y1={-(el.radius || 13)} x2="0" y2={el.radius || 13} stroke="#ffffff" strokeWidth="1.8" />
                          {el.label && (
                            <text
                              x="0"
                              y={(el.radius || 13) + 14}
                              fontFamily="sans-serif"
                              fontSize="10.5"
                              fontWeight="bold"
                              fill="#c2410c"
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'cone' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <polygon points="0,-16 -12,12 12,12" fill={el.color || '#ea580c'} />
                          <rect x="-14" y="10" width="28" height="4" rx="2" fill={el.color || '#c2410c'} />
                          <polygon points="0,-6 -6,6 6,6" fill="#ffffff" opacity="0.6" />
                          {el.label && (
                            <text
                              x="0"
                              y="24"
                              fontFamily="sans-serif"
                              fontSize="11"
                              fontWeight="bold"
                              fill={el.color || '#ea580c'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'marker' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <ellipse cx="0" cy="0" rx="14" ry="7" fill={el.color || '#eab308'} stroke="#ca8a04" strokeWidth="1.5" />
                          <circle cx="0" cy="-1" r="3" fill="#ca8a04" />
                          {el.label && (
                            <text
                              x="0"
                              y="17"
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#a16207"
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'hoop' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <circle cx="0" cy="0" r={el.radius || 20} fill="none" stroke={el.color || '#06b6d4'} strokeWidth="4.5" />
                          {el.label && (
                            <text
                              x="0"
                              y={(el.radius || 20) + 14}
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill={el.color || '#0891b2'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'stick' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <rect x={-((el.width || 40) / 2)} y={-((el.height || 7) / 2)} width={el.width || 40} height={el.height || 7} rx="3" fill={el.color || '#d97706'} stroke="#b45309" strokeWidth="1.2" />
                          {el.label && (
                            <text
                              x="0"
                              y={((el.height || 7) / 2) + 14}
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#b45309"
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'flag' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <line x1="0" y1="16" x2="0" y2="-18" stroke="#334155" strokeWidth="2.5" />
                          <polygon points="0,-18 18,-11 0,-4" fill={el.color || '#dc2626'} />
                          {el.label && (
                            <text
                              x="0"
                              y="28"
                              fontFamily="sans-serif"
                              fontSize="10.5"
                              fontWeight="bold"
                              fill={el.color || '#dc2626'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'line_solid' && (
                        <g>
                          <line x1={el.x} y1={el.y} x2={el.endX ?? el.x + 80} y2={el.endY ?? el.y} stroke={el.color || '#dc2626'} strokeWidth="3" strokeLinecap="round" />
                          {el.label && (
                            <text
                              x={((el.x + (el.endX ?? el.x + 80)) / 2)}
                              y={((el.y + (el.endY ?? el.y)) / 2) - 8}
                              fontFamily="sans-serif"
                              fontSize="11"
                              fontWeight="bold"
                              fill={el.color || '#dc2626'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'line_dashed' && (
                        <g>
                          <line x1={el.x} y1={el.y} x2={el.endX ?? el.x + 80} y2={el.endY ?? el.y} stroke={el.color || '#64748b'} strokeWidth="2.5" strokeDasharray="6,4" strokeLinecap="round" />
                          {el.label && (
                            <text
                              x={((el.x + (el.endX ?? el.x + 80)) / 2)}
                              y={((el.y + (el.endY ?? el.y)) / 2) - 8}
                              fontFamily="sans-serif"
                              fontSize="11"
                              fontWeight="bold"
                              fill={el.color || '#64748b'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'arrow_straight' && (
                        <g>
                          <line x1={el.x} y1={el.y} x2={el.endX ?? el.x + 70} y2={el.endY ?? el.y} stroke={el.color || '#16a34a'} strokeWidth="2.8" strokeDasharray="5,3" markerEnd="url(#arrowMarkerStudio)" />
                          {el.label && (
                            <text
                              x={((el.x + (el.endX ?? el.x + 70)) / 2)}
                              y={((el.y + (el.endY ?? el.y)) / 2) - 8}
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill={el.color || '#16a34a'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'arrow_curved' && (
                        <g>
                          <path d={`M ${el.x} ${el.y} Q ${((el.x + (el.endX ?? el.x + 70)) / 2)} ${el.y - 35} ${el.endX ?? el.x + 70} ${el.endY ?? el.y}`} fill="none" stroke={el.color || '#ea580c'} strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrowMarkerOrangeStudio)" />
                          {el.label && (
                            <text
                              x={((el.x + (el.endX ?? el.x + 70)) / 2)}
                              y={el.y - 40}
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="bold"
                              fill={el.color || '#ea580c'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'shape_rect' && (
                        <g transform={`translate(${el.x}, ${el.y})`}>
                          <rect x={-((el.width || 160) / 2)} y={-((el.height || 90) / 2)} width={el.width || 160} height={el.height || 90} rx="10" fill={el.color || '#3b82f6'} fillOpacity="0.08" stroke={el.color || '#3b82f6'} strokeWidth="2" strokeDasharray="6,4" />
                          {el.label && (
                            <text
                              x="0"
                              y={-((el.height || 90) / 2) - 8}
                              fontFamily="sans-serif"
                              fontSize="12"
                              fontWeight="bold"
                              fill={el.color || '#2563eb'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'shape_circle' && (
                        <g transform={`translate(${el.x}, ${el.y})`}>
                          <circle cx="0" cy="0" r={el.radius || 50} fill={el.color || '#3b82f6'} fillOpacity="0.08" stroke={el.color || '#3b82f6'} strokeWidth="2" strokeDasharray="6,4" />
                          {el.label && (
                            <text
                              x="0"
                              y={-((el.radius || 50) + 8)}
                              fontFamily="sans-serif"
                              fontSize="12"
                              fontWeight="bold"
                              fill={el.color || '#2563eb'}
                              textAnchor="middle"
                            >
                              {el.label}
                            </text>
                          )}
                        </g>
                      )}

                      {el.type === 'sgk_board' && (
                        <g transform={`translate(${el.x}, ${el.y})`} filter="url(#shadowStudio)">
                          <rect x={-((el.width || 140) / 2)} y={-((el.height || 60) / 2)} width={el.width || 140} height={el.height || 60} rx="8" fill="#fef3c7" stroke={el.color || '#d97706'} strokeWidth="2" />
                          <text
                            x="0"
                            y="-6"
                            fontFamily="sans-serif"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#b45309"
                            textAnchor="middle"
                          >
                            📖 TRANH SGK MẪU
                          </text>
                          <text
                            x="0"
                            y="14"
                            fontFamily="sans-serif"
                            fontSize="9.5"
                            fill="#78350f"
                            textAnchor="middle"
                          >
                            {el.label || 'Động tác vươn thở'}
                          </text>
                        </g>
                      )}

                      {el.type === 'text' && (
                        <g transform={`translate(${el.x}, ${el.y})`}>
                          <text
                            x="0"
                            y="0"
                            fontFamily="sans-serif"
                            fontSize={el.fontSize || 12.5}
                            fontWeight="bold"
                            fill={el.color || '#475569'}
                            textAnchor="middle"
                          >
                            {el.label || 'Ghi chú'}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Group Selection Bounding Box */}
                {groupBoundingBox && (
                  <g pointerEvents="none">
                    <rect
                      x={groupBoundingBox.x - 14}
                      y={groupBoundingBox.y - 14}
                      width={groupBoundingBox.w + 28}
                      height={groupBoundingBox.h + 28}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="1.8"
                      strokeDasharray="6,4"
                      rx="8"
                    />
                    <rect
                      x={groupBoundingBox.x - 14}
                      y={groupBoundingBox.y - 34}
                      width={140}
                      height={20}
                      rx="5"
                      fill="#2563eb"
                    />
                    <text
                      x={groupBoundingBox.x - 6}
                      y={groupBoundingBox.y - 20}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      Nhóm: {selectedIds.length} đối tượng
                    </text>
                  </g>
                )}

                {/* Active Marquee Drag Box */}
                {isMarqueeSelecting && marqueeStart && marqueeCurrent && (
                  <rect
                    x={Math.min(marqueeStart.x, marqueeCurrent.x)}
                    y={Math.min(marqueeStart.y, marqueeCurrent.y)}
                    width={Math.abs(marqueeCurrent.x - marqueeStart.x)}
                    height={Math.abs(marqueeCurrent.y - marqueeStart.y)}
                    fill="#3b82f6"
                    fillOpacity="0.18"
                    stroke="#2563eb"
                    strokeWidth="1.8"
                    strokeDasharray="4,3"
                    rx="4"
                    pointerEvents="none"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Right Inspector: Properties & Group Operations */}
          <div className="w-full lg:w-64 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-3 overflow-y-auto text-xs flex flex-col justify-between custom-scrollbar">
            {selectedIds.length > 1 ? (
              /* GROUP OPERATIONS (Multi-select) */
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-900 text-xs">
                      👥 Nhóm Đang Chọn ({selectedIds.length})
                    </span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Kéo chuột để di chuyển cả nhóm, hoặc bấm các nút bên dưới để thao tác hàng loạt:
                  </p>
                </div>

                {/* Group Action Buttons */}
                <div className="space-y-1.5">
                  <button
                    onClick={handleDuplicateSelected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-200" />
                    <span>Nhân Bản Cả Nhóm (+{selectedIds.length})</span>
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    className="w-full bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold py-1.5 px-3 rounded-lg border border-red-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Cả Nhóm ({selectedIds.length})</span>
                  </button>
                </div>

                {/* Group Alignments */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block text-[11px]">
                    📐 Căn Chỉnh Hàng Loạt
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleAlignHorizontal}
                      className="bg-white hover:bg-slate-200 text-slate-700 font-semibold py-1 px-2 rounded-lg border border-slate-300 flex items-center justify-center gap-1 transition"
                      title="Căn tất cả về cùng một hàng ngang"
                    >
                      <MoveHorizontal className="w-3 h-3 text-blue-600" /> Đồng Ngang
                    </button>
                    <button
                      onClick={handleAlignVertical}
                      className="bg-white hover:bg-slate-200 text-slate-700 font-semibold py-1 px-2 rounded-lg border border-slate-300 flex items-center justify-center gap-1 transition"
                      title="Căn tất cả về cùng một hàng dọc"
                    >
                      <MoveVertical className="w-3 h-3 text-indigo-600" /> Đồng Dọc
                    </button>
                  </div>
                  {selectedIds.length >= 3 && (
                    <button
                      onClick={handleDistributeHorizontal}
                      className="w-full bg-white hover:bg-slate-200 text-slate-700 font-semibold py-1 px-2 rounded-lg border border-slate-300 flex items-center justify-center gap-1 transition"
                      title="Dàn đều khoảng cách giữa các đối tượng"
                    >
                      <AlignHorizontalDistributeCenter className="w-3 h-3 text-emerald-600" />
                      <span>Dàn Đều Khoảng Cách</span>
                    </button>
                  )}
                </div>

                {/* Group Color Change */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    🎨 Đổi Màu Cho Toàn Nhóm:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleGroupColorChange(c)}
                        className="w-5 h-5 rounded-full border border-slate-300 hover:scale-115 transition"
                        style={{ backgroundColor: c }}
                        title={`Đổi màu nhóm sang ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : primarySelectedElement ? (
              /* SINGLE ELEMENT INSPECTOR */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    ⚙️ Thuộc Tính Đối Tượng
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                    title="Xóa đối tượng này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Label text input */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nhãn / Nội Dung Chữ:</label>
                  <input
                    type="text"
                    value={primarySelectedElement.label || ''}
                    onChange={(e) => handleUpdateSingleSelected({ label: e.target.value })}
                    placeholder="VD: 1, HS, Cọc A, TT, Vạch XP..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>

                {/* Color Palette */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Màu Sắc Đối Tượng:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleUpdateSingleSelected({ color: c })}
                        className={`w-5 h-5 rounded-full border transition ${
                          primarySelectedElement.color === c ? 'border-blue-600 scale-120 shadow-sm' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Array Repetition (Sao chép hàng loạt) */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    🔁 Nhân Bản Hàng Loạt
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div>
                      <span className="text-slate-500">Số lượng:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full mt-0.5 bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500">Khoảng cách:</span>
                      <input
                        type="number"
                        min={15}
                        max={150}
                        value={repeatSpacing}
                        onChange={(e) => setRepeatSpacing(parseInt(e.target.value) || 45)}
                        className="w-full mt-0.5 bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={handleRepeatHorizontal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-2xs text-[11px]"
                    >
                      <MoveHorizontal className="w-3 h-3" /> Hàng Ngang
                    </button>
                    <button
                      onClick={handleRepeatVertical}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-2xs text-[11px]"
                    >
                      <MoveVertical className="w-3 h-3" /> Hàng Dọc
                    </button>
                  </div>
                </div>

                {/* Alignments */}
                <button
                  onClick={() => handleUpdateSingleSelected({ x: 320 })}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-2 rounded-lg text-center transition text-[11px]"
                >
                  Căn Giữa Trục Sân (X=320)
                </button>
              </div>
            ) : (
              /* EMPTY STATE: PROMPT TO SELECT */
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 space-y-2 my-auto">
                <BoxSelect className="w-7 h-7 mx-auto text-blue-500/70" />
                <p className="font-bold text-slate-700 text-xs">Chưa chọn đối tượng nào</p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  • <strong>Kéo chuột trên sân</strong> để quét vùng chọn nhiều đối tượng cùng lúc.<br />
                  • Hoặc <strong>nhấp vào 1 đối tượng</strong> để chỉnh chữ, màu sắc và nhân bản hàng dọc/ngang.
                </p>
                <button
                  onClick={handleSelectAll}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg transition shadow-2xs text-[11px]"
                >
                  🔘 Chọn Tất Cả ({elements.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer: ALWAYS VISIBLE & STICKY AT BOTTOM */}
        <div className="p-2.5 sm:p-3 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shrink-0">
          
          {/* Target row selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-amber-300 whitespace-nowrap">📥 Gắn vào Cột 4:</span>
            <select
              value={currentRowIndex}
              onChange={(e) => setCurrentRowIndex(parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>Dòng 1: Mở đầu / Nhận lớp & Khởi động</option>
              <option value={1}>Dòng 2: Quan sát tranh / Kiến thức mới</option>
              <option value={2}>Dòng 3: Luyện tập (Đồng loạt / Tổ / Cặp)</option>
              <option value={3}>Dòng 4: Trò chơi vận động</option>
              <option value={4}>Dòng 5: Hồi tĩnh & Xuống lớp</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPng}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-700"
              title="Tải ảnh PNG độ nét cao (1280x860)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Tải PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-700"
              title="Tải Vector SVG"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Tải SVG
            </button>
            <button
              onClick={handleSaveOnlyToLibrary}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" /> Lưu Vào Thư Viện
            </button>
            <button
              onClick={handleApplyToRow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md"
            >
              <Check className="w-4 h-4 text-emerald-300" /> Áp Dụng Vào Dòng Số {currentRowIndex + 1}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
