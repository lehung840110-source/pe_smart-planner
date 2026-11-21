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
  AlignVerticalDistributeCenter,
  Image as ImageIcon,
  Upload,
  Wand2,
  FolderOpen,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  RotateCw,
  Link2,
  Unlink,
  ZoomOut,
  AlignLeft,
  AlignRight,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  Magnet,
  Crosshair
} from 'lucide-react';
import {
  FormationElement,
  CourtTheme,
  formationStudioPresets,
  renderFormationSvgString,
  generateFormationByContext,
  FormationPresetItem,
  getElementBoundingBox,
  scaleFormationElements,
  alignFormationElements,
  AlignmentMode
} from '../utils/formationStudioUtils';
import { FormationExtraElementSvg } from './FormationExtraElementSvg';
import { FormationDiagram, saveCustomFormationToStorage } from '../data/formationDiagrams';
import { downloadSvgAsPng } from '../utils/imageProcessing';
import { SgkImageItem, GradeLevel } from '../types/gdtc';

interface FormationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRowIndex: number;
  initialFormation?: FormationDiagram | null;
  onApplyFormationToRow: (rowIndex: number, formation: FormationDiagram) => void;
  onSaveToLibrary?: (formation: FormationDiagram) => void;
  libraryImages?: SgkImageItem[];
  grade?: number;
  initialReferenceImage?: SgkImageItem | null;
  openReferencePanelInitially?: boolean;
}

export const FormationStudioModal: React.FC<FormationStudioModalProps> = ({
  isOpen,
  onClose,
  targetRowIndex,
  initialFormation,
  onApplyFormationToRow,
  onSaveToLibrary,
  libraryImages = [],
  grade,
  initialReferenceImage = null,
  openReferencePanelInitially = false
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

  // Interactive corner resize state for multi-selected group
  const [isResizingGroup, setIsResizingGroup] = useState<boolean>(false);
  const [resizeAnchor, setResizeAnchor] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartDist, setResizeStartDist] = useState<number>(0);
  const [resizeInitialSnapshot, setResizeInitialSnapshot] = useState<FormationElement[]>([]);

  // Smart alignment snap guides during drag
  const [enableSmartSnap, setEnableSmartSnap] = useState<boolean>(true);
  const [activeSnapGuides, setActiveSnapGuides] = useState<{ x?: number; y?: number }>({});

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

  // Quick builders for Square Grid (e.g. 3x3) & Parallel Lines (vertical / horizontal)
  const [gridRows, setGridRows] = useState<number>(3);
  const [gridCols, setGridCols] = useState<number>(3);
  const [gridCellMode, setGridCellMode] = useState<'empty' | 'numbers' | 'hand_foot'>('empty');
  const [parallelCount, setParallelCount] = useState<number>(4);
  const [parallelStyle, setParallelStyle] = useState<'solid' | 'dashed'>('solid');

  // Toast notification inside modal
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Phase & Grade classification for created diagrams
  const [diagramPhase, setDiagramPhase] = useState<FormationDiagram['phase']>(
    initialFormation?.phase || 'dong_loat'
  );
  const [diagramGrade, setDiagramGrade] = useState<GradeLevel | 'all'>(() => {
    if (initialFormation?.grade) return initialFormation.grade;
    if (grade === 1 || grade === 2 || grade === 3 || grade === 4 || grade === 5) return grade;
    return 'all';
  });

  // Reference Game Photo -> Editable Diagram state
  const [isRefPanelOpen, setIsRefPanelOpen] = useState<boolean>(
    Boolean(initialReferenceImage || openReferencePanelInitially)
  );
  const [refImageUrl, setRefImageUrl] = useState<string>(initialReferenceImage?.imgUrl || '');
  const [refGameTitle, setRefGameTitle] = useState<string>(initialReferenceImage?.title || '');
  const [refCaption, setRefCaption] = useState<string>(initialReferenceImage?.caption || '');
  const [refGrade, setRefGrade] = useState<number>(() => {
    const imgGrade = Number(initialReferenceImage?.grade);
    if (imgGrade >= 1 && imgGrade <= 5) return imgGrade;
    return grade && grade >= 1 && grade <= 5 ? grade : 1;
  });
  const [isAnalyzingRefImage, setIsAnalyzingRefImage] = useState<boolean>(false);
  const [isLibraryRefPickerOpen, setIsLibraryRefPickerOpen] = useState<boolean>(false);
  const [libSearch, setLibSearch] = useState<string>('');
  const [libGradeFilter, setLibGradeFilter] = useState<string>(() => (grade ? String(grade) : 'all'));
  const [libGameOnly, setLibGameOnly] = useState<boolean>(true);
  const refFileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Load initial formation if provided (prioritize saved elements!)
  useEffect(() => {
    if (initialFormation) {
      setTitle(initialFormation.name);
      setSubtitle(initialFormation.description);
      setDiagramPhase(initialFormation.phase || 'dong_loat');
      setDiagramGrade(
        initialFormation.grade ||
          (grade === 1 || grade === 2 || grade === 3 || grade === 4 || grade === 5 ? grade : 'all')
      );
      if (initialFormation.elements && initialFormation.elements.length > 0) {
        setElements(JSON.parse(JSON.stringify(initialFormation.elements)));
      } else {
        const matchPreset = formationStudioPresets.find((p) => p.name === initialFormation.name);
        if (matchPreset) {
          setElements(JSON.parse(JSON.stringify(matchPreset.elements)));
        }
      }
    }
  }, [initialFormation, grade]);

  // Load initial reference game image if passed (e.g. from Tab 2 Thư viện ảnh)
  useEffect(() => {
    if (initialReferenceImage) {
      setIsRefPanelOpen(true);
      setRefImageUrl(initialReferenceImage.imgUrl || '');
      setRefGameTitle(initialReferenceImage.title || '');
      setRefCaption(initialReferenceImage.caption || '');
      const imgG = Number(initialReferenceImage.grade);
      if (imgG === 1 || imgG === 2 || imgG === 3 || imgG === 4 || imgG === 5) {
        setRefGrade(imgG);
        setDiagramGrade(imgG);
      }
      setDiagramPhase(
        initialReferenceImage.folder === 'troChoiKhoiDong' ? 'khoi_dong' : 'tro_choi'
      );
    }
  }, [initialReferenceImage]);

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

  // Helper: resolve full locked group IDs for a given element id
  const getGroupMemberIds = (elId: string, list: FormationElement[] = elements): string[] => {
    const target = list.find((item) => item.id === elId);
    if (target?.groupId) {
      return list.filter((item) => item.groupId === target.groupId).map((item) => item.id);
    }
    return [elId];
  };

  // Pointer down on an Element
  const handlePointerDownElement = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const pt = svgRef.current ? getSvgCoordinates(e as unknown as React.PointerEvent<SVGSVGElement>) : { x: 0, y: 0 };
    const unitIds = getGroupMemberIds(id);

    let newSelected = [...selectedIds];
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Toggle the whole locked group (or single element)
      const allUnitSelected = unitIds.every((uid) => newSelected.includes(uid));
      if (allUnitSelected) {
        newSelected = newSelected.filter((item) => !unitIds.includes(item));
      } else {
        unitIds.forEach((uid) => {
          if (!newSelected.includes(uid)) newSelected.push(uid);
        });
      }
    } else {
      // If clicking an unselected element, select its full locked group (or itself)
      // If clicking an already selected element, preserve current multi-selection for group drag
      if (!newSelected.includes(id)) {
        newSelected = unitIds;
      }
    }

    setSelectedIds(newSelected);
    setIsDraggingGroup(true);
    setDragStartPt(pt);
    setInitialSnapshot(JSON.parse(JSON.stringify(elements)));
  };

  // Pointer down on one of the 4 corner resize handles of groupBoundingBox
  const handlePointerDownResizeCorner = (
    e: React.PointerEvent,
    corner: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.stopPropagation();
    if (!groupBoundingBox || selectedIds.length < 2) return;
    const pt = svgRef.current ? getSvgCoordinates(e as unknown as React.PointerEvent<SVGSVGElement>) : { x: 0, y: 0 };
    const left = groupBoundingBox.x;
    const right = groupBoundingBox.x + groupBoundingBox.w;
    const top = groupBoundingBox.y;
    const bottom = groupBoundingBox.y + groupBoundingBox.h;

    const anchor =
      corner === 'nw'
        ? { x: right, y: bottom }
        : corner === 'ne'
        ? { x: left, y: bottom }
        : corner === 'sw'
        ? { x: right, y: top }
        : { x: left, y: top };

    const startDist = Math.max(18, Math.hypot(pt.x - anchor.x, pt.y - anchor.y));
    setIsResizingGroup(true);
    setResizeAnchor(anchor);
    setResizeStartDist(startDist);
    setResizeInitialSnapshot(JSON.parse(JSON.stringify(elements)));
  };

  // Pointer move on Canvas
  const handlePointerMoveCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);

    // Interactive Proportional Group Resize via Corner Handles
    if (isResizingGroup && resizeAnchor && resizeStartDist > 0 && resizeInitialSnapshot.length > 0) {
      const curDist = Math.max(12, Math.hypot(pt.x - resizeAnchor.x, pt.y - resizeAnchor.y));
      const rawFactor = curDist / resizeStartDist;
      const factor = Math.max(0.35, Math.min(2.2, rawFactor));
      setElements(
        scaleFormationElements(resizeInitialSnapshot, selectedIds, factor, resizeAnchor.x, resizeAnchor.y)
      );
      return;
    }

    // Marquee Box Selection
    if (isMarqueeSelecting && marqueeStart) {
      setMarqueeCurrent(pt);
      const minX = Math.min(marqueeStart.x, pt.x);
      const maxX = Math.max(marqueeStart.x, pt.x);
      const minY = Math.min(marqueeStart.y, pt.y);
      const maxY = Math.max(marqueeStart.y, pt.y);

      // Only consider marquee if dragged beyond minimal threshold (5px)
      if (maxX - minX > 5 || maxY - minY > 5) {
        const directIds = new Set<string>();
        elements.forEach((el) => {
          const box = getElementBoundingBox(el);
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
            directIds.add(el.id);
          }
        });
        // Expand any selected member of a locked group to include the entire group
        const expanded = new Set<string>(directIds);
        elements.forEach((el) => {
          if (el.groupId && directIds.has(el.id)) {
            elements.forEach((peer) => {
              if (peer.groupId === el.groupId) expanded.add(peer.id);
            });
          }
        });
        setSelectedIds(Array.from(expanded));
      }
      return;
    }

    // Dragging Selected Group (with optional Smart Alignment Snap Guides)
    if (isDraggingGroup && selectedIds.length > 0 && initialSnapshot.length > 0) {
      let dx = pt.x - dragStartPt.x;
      let dy = pt.y - dragStartPt.y;

      if (enableSmartSnap) {
        const selectedInit = initialSnapshot.filter((it) => selectedIds.includes(it.id));
        const unselectedInit = initialSnapshot.filter((it) => !selectedIds.includes(it.id));

        if (selectedInit.length > 0) {
          let sMinX = Infinity,
            sMaxX = -Infinity,
            sMinY = Infinity,
            sMaxY = -Infinity;
          selectedInit.forEach((el) => {
            const b = getElementBoundingBox(el);
            sMinX = Math.min(sMinX, b.x);
            sMaxX = Math.max(sMaxX, b.x + b.w);
            sMinY = Math.min(sMinY, b.y);
            sMaxY = Math.max(sMaxY, b.y + b.h);
          });

          const curCx = (sMinX + sMaxX) / 2 + dx;
          const curCy = (sMinY + sMaxY) / 2 + dy;
          const curLeft = sMinX + dx;
          const curRight = sMaxX + dx;
          const curTop = sMinY + dy;
          const curBottom = sMaxY + dy;

          const xTargets: number[] = [320]; // Court vertical center
          const yTargets: number[] = [235]; // Court horizontal center

          unselectedInit.forEach((other) => {
            const ob = getElementBoundingBox(other);
            xTargets.push(ob.x + ob.w / 2, ob.x, ob.x + ob.w);
            yTargets.push(ob.y + ob.h / 2, ob.y, ob.y + ob.h);
          });

          const SNAP_THRESHOLD = 5;
          let bestDxAdjust = 0;
          let bestXDist = SNAP_THRESHOLD + 1;
          let snapGuideX: number | undefined;

          const selXAnchors = [curCx, curLeft, curRight];
          for (const targetX of xTargets) {
            for (const anchorX of selXAnchors) {
              const dist = Math.abs(targetX - anchorX);
              if (dist < bestXDist) {
                bestXDist = dist;
                bestDxAdjust = targetX - anchorX;
                snapGuideX = Math.round(targetX);
              }
            }
          }

          let bestDyAdjust = 0;
          let bestYDist = SNAP_THRESHOLD + 1;
          let snapGuideY: number | undefined;

          const selYAnchors = [curCy, curTop, curBottom];
          for (const targetY of yTargets) {
            for (const anchorY of selYAnchors) {
              const dist = Math.abs(targetY - anchorY);
              if (dist < bestYDist) {
                bestYDist = dist;
                bestDyAdjust = targetY - anchorY;
                snapGuideY = Math.round(targetY);
              }
            }
          }

          if (snapGuideX !== undefined) dx += bestDxAdjust;
          if (snapGuideY !== undefined) dy += bestDyAdjust;
          setActiveSnapGuides({ x: snapGuideX, y: snapGuideY });
        }
      } else if (activeSnapGuides.x !== undefined || activeSnapGuides.y !== undefined) {
        setActiveSnapGuides({});
      }

      setElements(
        initialSnapshot.map((item) => {
          if (selectedIds.includes(item.id)) {
            const newX = Math.max(15, Math.min(625, Math.round(item.x + dx)));
            const newY = Math.max(60, Math.min(415, Math.round(item.y + dy)));
            const diffX = newX - item.x;
            const diffY = newY - item.y;

            if (item.endX !== undefined && item.endY !== undefined) {
              return {
                ...item,
                x: newX,
                y: newY,
                endX: Math.max(15, Math.min(625, Math.round(item.endX + diffX))),
                endY: Math.max(60, Math.min(415, Math.round(item.endY + diffY)))
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
    if (isResizingGroup) {
      setIsResizingGroup(false);
      setResizeAnchor(null);
      setResizeStartDist(0);
      if (
        resizeInitialSnapshot.length > 0 &&
        JSON.stringify(resizeInitialSnapshot) !== JSON.stringify(elements)
      ) {
        setHistory((prev) => [...prev.slice(-15), resizeInitialSnapshot]);
      }
      setResizeInitialSnapshot([]);
    }
    if (isMarqueeSelecting) {
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeCurrent(null);
    }
    if (isDraggingGroup) {
      setIsDraggingGroup(false);
      setActiveSnapGuides({});
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

  // Persistent group metadata for current selection
  const selectionGroupMeta = useMemo(() => {
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    const groupIds = new Set<string>();
    selectedObjs.forEach((el) => {
      if (el.groupId) groupIds.add(el.groupId);
    });
    const isSingleLockedGroup =
      selectedObjs.length >= 2 &&
      groupIds.size === 1 &&
      selectedObjs.every((el) => Boolean(el.groupId));
    const hasAnyGrouped = groupIds.size > 0;
    // Count distinct alignable units (each locked group counts as 1 unit, ungrouped item as 1)
    const unitKeys = new Set<string>();
    selectedObjs.forEach((el) => {
      unitKeys.add(el.groupId ? `g:${el.groupId}` : `e:${el.id}`);
    });
    return {
      groupIds,
      isSingleLockedGroup,
      hasAnyGrouped,
      alignUnitCount: unitKeys.size
    };
  }, [elements, selectedIds]);

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
      const box = getElementBoundingBox(el);
      minX = Math.min(minX, box.x);
      maxX = Math.max(maxX, box.x + box.w);
      minY = Math.min(minY, box.y);
      maxY = Math.max(maxY, box.y + box.h);
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

  // Persistent Group / Ungroup handlers
  const handleGroupSelected = () => {
    if (selectedIds.length < 2) return;
    const newGroupId = `grp_${Date.now()}`;
    recordHistory(
      elements.map((item) =>
        selectedIds.includes(item.id) ? { ...item, groupId: newGroupId } : item
      )
    );
    showToast(`Đã khóa nhóm ${selectedIds.length} đối tượng! Nhấp 1 đối tượng sẽ chọn cả nhóm.`);
  };

  const handleUngroupSelected = () => {
    if (selectedIds.length === 0) return;
    recordHistory(
      elements.map((item) => {
        if (!selectedIds.includes(item.id)) return item;
        const copy = { ...item };
        delete copy.groupId;
        return copy;
      })
    );
    showToast(`Đã rã nhóm ${selectedIds.length} đối tượng thành phần tử rời!`);
  };

  // Proportional Scale Selected Group (Thu nhỏ / Phóng to nhóm)
  const handleScaleSelected = (factor: number) => {
    if (selectedIds.length === 0) return;
    const scaled = scaleFormationElements(elements, selectedIds, factor);
    recordHistory(scaled);
    const pct = Math.round(factor * 100);
    showToast(
      factor < 1
        ? `Đã thu nhỏ nhóm xuống ${pct}% (giữ nguyên tỷ lệ)!`
        : `Đã phóng to nhóm lên ${pct}% (giữ nguyên tỷ lệ)!`
    );
  };

  // Full 9-mode Alignment & Distribution Handler
  const handleAlignSelected = (mode: AlignmentMode, toastLabel: string) => {
    if (selectedIds.length === 0) return;
    if (mode !== 'centerCourt' && selectedIds.length < 2) return;
    const aligned = alignFormationElements(elements, selectedIds, mode);
    recordHistory(aligned);
    showToast(toastLabel);
  };

  // Keyboard shortcuts: Ctrl+G (Group), Ctrl+Shift+G (Ungroup), Ctrl+Z (Undo)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelected();
        } else if (selectedIds.length >= 2) {
          handleGroupSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, selectedIds, elements, history]);

  // Group: Delete Selected
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    recordHistory(elements.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    showToast(`Đã xóa ${count} đối tượng!`);
  };

  // Group: Duplicate Selected (Nhân bản cả nhóm - giữ nguyên khóa nhóm độc lập)
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedObjs = elements.filter((el) => selectedIds.includes(el.id));
    const newClones: FormationElement[] = [];
    const newIds: string[] = [];
    const now = Date.now();
    const clonedGroupMap = new Map<string, string>();

    selectedObjs.forEach((el, index) => {
      const newId = `${el.type}_copy_${now}_${index}`;
      const clone: FormationElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        x: Math.min(615, el.x + 25),
        y: Math.min(405, el.y + 25)
      };
      if (el.groupId) {
        if (!clonedGroupMap.has(el.groupId)) {
          clonedGroupMap.set(el.groupId, `grp_${now}_${clonedGroupMap.size}`);
        }
        clone.groupId = clonedGroupMap.get(el.groupId);
      }
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
    } else if (type === 'grid_box') {
      const r = extra?.rows ?? gridRows;
      const c = extra?.cols ?? gridCols;
      const m = extra?.cellMode ?? gridCellMode;
      defaultProps.color = '#2563eb';
      defaultProps.rows = r;
      defaultProps.cols = c;
      defaultProps.cellSize = r >= 5 || c >= 6 ? 28 : 36;
      defaultProps.cellMode = m;
      defaultProps.label = `Ô ${r}×${c}`;
    } else if (type === 'parallel_lines') {
      const orient = extra?.orientation ?? 'horizontal';
      const cnt = extra?.lineCount ?? parallelCount;
      defaultProps.color = '#0284c7';
      defaultProps.orientation = orient;
      defaultProps.lineCount = cnt;
      defaultProps.lineSpacing = orient === 'vertical' ? 40 : 34;
      defaultProps.lineLength = orient === 'vertical' ? 210 : 260;
      defaultProps.lineStyle = extra?.lineStyle ?? parallelStyle;
      defaultProps.label = '';
    } else if (type === 'foot_left' || type === 'foot_right') {
      defaultProps.color = '#2563eb';
      defaultProps.radius = 16;
      defaultProps.rotation = 0;
    } else if (type === 'feet_pair') {
      defaultProps.color = '#2563eb';
      defaultProps.radius = 15;
      defaultProps.rotation = 0;
    } else if (type === 'hand_left' || type === 'hand_right') {
      defaultProps.color = '#ea580c';
      defaultProps.radius = 16;
      defaultProps.rotation = 0;
    } else if (type === 'hands_pair') {
      defaultProps.color = '#ea580c';
      defaultProps.radius = 15;
      defaultProps.rotation = 0;
    } else if (type === 'mat') {
      defaultProps.color = '#0284c7';
      defaultProps.width = 76;
      defaultProps.height = 42;
      defaultProps.label = 'Đệm tập';
    } else if (type === 'hurdle') {
      defaultProps.color = '#dc2626';
      defaultProps.width = 52;
      defaultProps.height = 18;
      defaultProps.label = 'Rào';
    } else if (type === 'goal_gate') {
      defaultProps.color = '#16a34a';
      defaultProps.width = 64;
      defaultProps.height = 28;
      defaultProps.label = 'Đích / Rổ';
    } else if (type === 'zigzag_path') {
      defaultProps.color = '#16a34a';
      defaultProps.width = 160;
      defaultProps.height = 40;
      defaultProps.label = 'Zíc-zắc';
    } else if (type === 'jump_arc') {
      defaultProps.color = '#ea580c';
      defaultProps.width = 90;
      defaultProps.height = 34;
      defaultProps.label = 'Bật nhảy';
    } else if (type === 'star_target') {
      defaultProps.color = '#eab308';
      defaultProps.radius = 16;
      defaultProps.label = 'Đích';
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

  // Filtered library images for Game Reference Picker
  const filteredRefLibraryImages = useMemo(() => {
    return libraryImages.filter((img) => {
      const matchesGrade = libGradeFilter === 'all' || String(img.grade) === libGradeFilter;
      const isGame =
        img.folder === 'troChoi' ||
        img.folder === 'troChoiKhoiDong' ||
        img.category === 'tro_choi' ||
        img.category === 'tro_choi_khoi_dong' ||
        /trò chơi/i.test(`${img.title} ${img.caption}`);
      const matchesGame = !libGameOnly || isGame;
      const q = libSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (img.title || '').toLowerCase().includes(q) ||
        (img.caption || '').toLowerCase().includes(q) ||
        (img.lessonTitle || '').toLowerCase().includes(q);
      return matchesGrade && matchesGame && matchesSearch;
    });
  }, [libraryImages, libGradeFilter, libGameOnly, libSearch]);

  // Upload or paste local game photo
  const handleRefFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRefImageUrl(reader.result);
        if (!refGameTitle.trim()) {
          setRefGameTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
        }
        showToast('Đã nạp ảnh trò chơi tham chiếu! Nhấn "AI Phân Tích & Dựng Sơ Đồ" để tạo sơ đồ.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteRefImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          handleRefFileSelected(blob);
          break;
        }
      }
    }
  };

  // Analyze Reference Game Image -> Editable FormationElement[] Diagram
  const handleAnalyzeGameReferenceImage = async () => {
    if (!refImageUrl) {
      showToast('Vui lòng chọn ảnh trò chơi từ Thư viện hoặc tải ảnh lên trước.');
      return;
    }
    setIsAnalyzingRefImage(true);
    try {
      const res = await fetch('/api/ai/game-image-to-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: refImageUrl,
          gameTitle: refGameTitle.trim(),
          caption: refCaption.trim(),
          grade: refGrade
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.elements) && data.elements.length > 0) {
        recordHistory(data.elements);
        setTitle(data.name || (refGameTitle ? `SƠ ĐỒ TRÒ CHƠI: ${refGameTitle.toUpperCase()}` : 'SƠ ĐỒ TRÒ CHƠI VẬN ĐỘNG'));
        setSubtitle(data.subtitle || data.description || `Khối ${refGrade} · Tham chiếu ảnh SGK`);
        const nextPhase: FormationDiagram['phase'] =
          data.phase === 'khoi_dong' ? 'khoi_dong' : 'tro_choi';
        setDiagramPhase(nextPhase);
        if (refGrade === 1 || refGrade === 2 || refGrade === 3 || refGrade === 4 || refGrade === 5) {
          setDiagramGrade(refGrade);
        }
        setSelectedIds([]);
        if (nextPhase === 'tro_choi' && currentRowIndex === 2) {
          setCurrentRowIndex(3);
        }
        showToast(
          data.usedFallback
            ? 'Đã dựng sơ đồ trò chơi mẫu chuẩn theo tên & nội dung ảnh! Thầy/Cô có thể kéo thả chỉnh sửa.'
            : '✨ AI đã phân tích bố cục ảnh trò chơi & dựng sơ đồ vector tương tác! Có thể kéo thả chỉnh sửa.'
        );
      } else {
        showToast('Không thể phân tích ảnh trò chơi này, vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối khi phân tích ảnh trò chơi.');
    } finally {
      setIsAnalyzingRefImage(false);
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
      code: diagramPhase === 'tro_choi' ? 'DH_TC_CUSTOM' : 'DH_CUSTOM',
      phase: diagramPhase,
      grade: diagramGrade,
      description: subtitle,
      svgDataUrl: currentSvgDataUrl,
      elements: JSON.parse(JSON.stringify(elements))
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
      code: diagramPhase === 'tro_choi' ? 'DH_TC_CUSTOM' : 'DH_CUSTOM',
      phase: diagramPhase,
      grade: diagramGrade,
      description: subtitle,
      svgDataUrl: currentSvgDataUrl,
      elements: JSON.parse(JSON.stringify(elements))
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
                <option value="p_tro_choi_chan_tay_kheo_khoe">Chân Tay Khéo Khỏe (Lưới Ô 3×3 + Tay &amp; Chân)</option>
                <option value="p_tro_choi_nhay_o_song_song">Nhảy Ô Tiếp Sức (Ô Vuông Số + Đường Song Song)</option>
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

          {/* Toggle Reference Game Image -> Diagram Drawer */}
          <button
            type="button"
            onClick={() => setIsRefPanelOpen((v) => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition whitespace-nowrap cursor-pointer ${
              isRefPanelOpen || refImageUrl
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
            title="Chọn ảnh trò chơi từ thư viện hoặc tải ảnh lên để AI phân tích dựng thành sơ đồ trò chơi"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Tạo Từ Ảnh Trò Chơi</span>
            {isRefPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

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

        {/* Collapsible Reference Game Photo -> Diagram Bar */}
        {isRefPanelOpen && (
          <div
            onPaste={handlePasteRefImage}
            className="bg-emerald-50/80 border-b border-emerald-200 px-3 py-2 flex flex-wrap items-center gap-3 text-xs shrink-0"
          >
            <input
              ref={refFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleRefFileSelected(e.target.files[0]);
                }
              }}
            />

            {/* Preview Thumbnail */}
            <div className="w-24 h-16 rounded-lg border border-emerald-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {refImageUrl ? (
                <img src={refImageUrl} alt="Ảnh trò chơi tham chiếu" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center px-1">Chưa có ảnh</span>
              )}
            </div>

            {/* Source Buttons & Game Metadata */}
            <div className="flex-1 min-w-[240px] space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsLibraryRefPickerOpen(true)}
                  className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chọn từ Thư Viện ({libraryImages.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => refFileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tải ảnh / Dán (Ctrl+V)</span>
                </button>
                <select
                  value={refGrade}
                  onChange={(e) => setRefGrade(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value={1}>Khối 1</option>
                  <option value={2}>Khối 2</option>
                  <option value={3}>Khối 3</option>
                  <option value={4}>Khối 4</option>
                  <option value={5}>Khối 5</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="text"
                  value={refGameTitle}
                  onChange={(e) => setRefGameTitle(e.target.value)}
                  placeholder="Tên trò chơi (VD: Đua ô tô, Mèo đuổi chuột, Chui qua hầm...)"
                  className="flex-1 min-w-[180px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={refCaption}
                  onChange={(e) => setRefCaption(e.target.value)}
                  placeholder="Ghi chú đội hình / dụng cụ (tuỳ chọn)"
                  className="w-48 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700"
                />
                <button
                  type="button"
                  disabled={!refImageUrl || isAnalyzingRefImage}
                  onClick={handleAnalyzeGameReferenceImage}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition whitespace-nowrap"
                >
                  {isAnalyzingRefImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang phân tích ảnh...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Phân Tích & Dựng Sơ Đồ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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

            {/* 3. Lưới Ô Vuông & Đường Song Song */}
            <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-blue-800 flex items-center gap-1">
                <Grid3x3 className="w-3.5 h-3.5 text-blue-600" />
                3. Vùng Ô Vuông &amp; Song Song
              </p>

              {/* Square Grid Builder */}
              <div className="space-y-1.5 bg-white p-1.5 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-600">
                  <span>Vùng ô (Hàng × Cột):</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <label className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    <span>Hàng</span>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={gridRows}
                      onChange={(e) => setGridRows(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                      className="w-full text-center font-bold text-blue-700 bg-transparent focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    <span>Cột</span>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={gridCols}
                      onChange={(e) => setGridCols(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                      className="w-full text-center font-bold text-blue-700 bg-transparent focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-0.5 text-[9.5px]">
                  {(
                    [
                      { id: 'empty', label: 'Trống' },
                      { id: 'numbers', label: 'Số 1..N' },
                      { id: 'hand_foot', label: 'Tay-Chân' }
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setGridCellMode(m.id)}
                      className={`py-0.5 rounded font-bold border transition ${
                        gridCellMode === m.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAddElement('grid_box', {
                      rows: gridRows,
                      cols: gridCols,
                      cellMode: gridCellMode,
                      label: `Ô ${gridRows}×${gridCols}`
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-md text-[10.5px] transition shadow-2xs"
                >
                  + Chèn Lưới Ô {gridRows}×{gridCols}
                </button>
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddElement('grid_box', { rows: 3, cols: 3, cellMode: 'hand_foot', label: 'Ô 3×3' })
                    }
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold py-0.5 rounded text-[9.5px] transition"
                    title="Chèn nhanh lưới ô 3×3 kèm ký hiệu Tay-Chân"
                  >
                    3×3 TayChân
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddElement('grid_box', { rows: 1, cols: 5, cellMode: 'numbers', label: 'Dãy 5 ô' })
                    }
                    className="bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 font-bold py-0.5 rounded text-[9.5px] transition"
                    title="Chèn dãy 1×5 ô đánh số nhảy lò cò"
                  >
                    1×5 Số
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddElement('grid_box', { rows: 2, cols: 4, cellMode: 'empty', label: 'Ô 2×4' })
                    }
                    className="bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 font-bold py-0.5 rounded text-[9.5px] transition"
                    title="Chèn lưới ô 2×4 trống"
                  >
                    2×4 Trống
                  </button>
                </div>
              </div>

              {/* Parallel Lines Builder */}
              <div className="space-y-1.5 bg-white p-1.5 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-600">
                  <span>Đường song song:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={parallelCount}
                      onChange={(e) =>
                        setParallelCount(Math.max(2, Math.min(12, parseInt(e.target.value, 10) || 2)))
                      }
                      className="w-10 text-center font-bold text-sky-700 bg-slate-50 border border-slate-200 rounded py-0.5 text-[10px]"
                      title="Số đường kẻ song song"
                    />
                    <button
                      type="button"
                      onClick={() => setParallelStyle((s) => (s === 'solid' ? 'dashed' : 'solid'))}
                      className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[9.5px] font-bold text-slate-700"
                      title="Chuyển nét liền / nét đứt"
                    >
                      {parallelStyle === 'solid' ? 'Liền' : 'Đứt'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddElement('parallel_lines', {
                        orientation: 'vertical',
                        lineCount: parallelCount,
                        lineStyle: parallelStyle
                      })
                    }
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-1 px-1 rounded-md text-[10px] transition"
                    title="Chèn các đường thẳng đứng song song theo hàng dọc"
                  >
                    ||| Song Song Dọc
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddElement('parallel_lines', {
                        orientation: 'horizontal',
                        lineCount: parallelCount,
                        lineStyle: parallelStyle
                      })
                    }
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-1 rounded-md text-[10px] transition"
                    title="Chèn các đường nằm ngang song song theo hàng ngang"
                  >
                    ☰ Song Song Ngang
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Biểu Tượng Trò Chơi Đặc Biệt (Chân tay khéo khỏe...) */}
            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-orange-600 mb-1">
                4. Biểu Tượng Trò Chơi
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => handleAddElement('foot_left')}
                  className="bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-semibold p-1 rounded-lg border border-blue-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Bàn chân trái (Trò chơi Chân tay khéo khỏe / Nhảy ô)"
                >
                  🦶 Chân Trái
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('foot_right')}
                  className="bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-semibold p-1 rounded-lg border border-blue-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Bàn chân phải"
                >
                  🦶 Chân Phải
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('feet_pair')}
                  className="bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 font-semibold p-1 rounded-lg border border-indigo-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Đôi bàn chân chụm (Bật nhảy 2 chân)"
                >
                  👣 Đôi Chân
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('hand_left')}
                  className="bg-orange-50/80 hover:bg-orange-100 text-orange-800 font-semibold p-1 rounded-lg border border-orange-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Bàn tay trái (Trò chơi Chân tay khéo khỏe)"
                >
                  ✋ Tay Trái
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('hand_right')}
                  className="bg-orange-50/80 hover:bg-orange-100 text-orange-800 font-semibold p-1 rounded-lg border border-orange-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Bàn tay phải"
                >
                  🤚 Tay Phải
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('hands_pair')}
                  className="bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-semibold p-1 rounded-lg border border-amber-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Đôi bàn tay chống (Chân tay khéo khỏe)"
                >
                  🙌 Đôi Tay
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('mat')}
                  className="bg-sky-50/80 hover:bg-sky-100 text-sky-900 font-semibold p-1 rounded-lg border border-sky-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Đệm / Thảm tập thể dục"
                >
                  🟦 Đệm Tập
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('hurdle')}
                  className="bg-red-50/80 hover:bg-red-100 text-red-800 font-semibold p-1 rounded-lg border border-red-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Rào thấp / Chướng ngại vật bật nhảy"
                >
                  🚧 Rào / Cản
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('goal_gate')}
                  className="bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Cổng đích / Khung thành / Rổ"
                >
                  🥅 Cổng / Rổ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('zigzag_path')}
                  className="bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 font-semibold p-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Đường chạy Zíc-zắc luồn cọc"
                >
                  ⚡ Zíc-zắc
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('jump_arc')}
                  className="bg-orange-50/80 hover:bg-orange-100 text-orange-800 font-semibold p-1 rounded-lg border border-orange-200 flex items-center gap-1 transition text-[10.5px]"
                  title="Mũi tên bật nhảy vòng cung"
                >
                  ⤴ Bật Nhảy
                </button>
                <button
                  type="button"
                  onClick={() => handleAddElement('star_target')}
                  className="bg-yellow-50/80 hover:bg-yellow-100 text-amber-800 font-semibold p-1 rounded-lg border border-yellow-300 flex items-center gap-1 transition text-[10.5px]"
                  title="Ngôi sao / Ô đích / Điểm thưởng"
                >
                  ⭐ Ô Đích
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 mb-1">
                5. Đường Kẻ, Mũi Tên &amp; Vùng
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
                6. Tranh &amp; Ghi Chú
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
            
            {/* Inline Title / Subtitle / Grade / Phase editors */}
            <div className="w-full max-w-[640px] flex flex-wrap gap-1.5 mb-1.5 text-xs shrink-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề sơ đồ (VD: SƠ ĐỒ TRÒ CHƠI ĐUA Ô TÔ)"
                className="flex-1 min-w-[190px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ghi chú phụ"
                className="w-36 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
              <select
                value={String(diagramGrade)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDiagramGrade(v === 'all' ? 'all' : (Number(v) as GradeLevel));
                }}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700"
                title="Gắn thẻ Khối lớp cho sơ đồ trong Kho"
              >
                <option value="all">Chung (Tất cả khối)</option>
                <option value="1">Khối 1</option>
                <option value="2">Khối 2</option>
                <option value="3">Khối 3</option>
                <option value="4">Khối 4</option>
                <option value="5">Khối 5</option>
              </select>
              <select
                value={diagramPhase}
                onChange={(e) => setDiagramPhase(e.target.value as FormationDiagram['phase'])}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-700"
                title="Phân loại mục hoạt động của sơ đồ"
              >
                <option value="tro_choi">🎮 Trò chơi vận động</option>
                <option value="khoi_dong">⚡ Khởi động / TC KĐ</option>
                <option value="nhan_lop">📋 Nhận lớp</option>
                <option value="tap_mau">👀 Quan sát mẫu</option>
                <option value="dong_loat">🏃 Tập đồng loạt</option>
                <option value="to_nhom">👥 Tập theo tổ</option>
                <option value="cap_doi">🤝 Cặp đôi</option>
                <option value="thi_dua">⭐ Thi đua</option>
                <option value="hoi_tinh">🍃 Hồi tĩnh & Xuống lớp</option>
              </select>
            </div>

            {/* Quick Canvas Toolbar: Marquee hints, Smart Snap, Quick Group & Select all */}
            <div className="w-full max-w-[620px] mb-1.5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-600 bg-white/85 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700 flex items-center gap-1">
                  <BoxSelect className="w-3.5 h-3.5 text-blue-600" />
                  {selectedIds.length > 0 ? (
                    <span>
                      {selectionGroupMeta.isSingleLockedGroup ? '🔗 Đã nhóm: ' : 'Đang chọn: '}
                      <strong>{selectedIds.length}</strong> đối tượng
                    </span>
                  ) : (
                    <span>Kéo chuột trên sân để quét vùng chọn nhóm</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {selectedIds.length >= 2 && !selectionGroupMeta.isSingleLockedGroup && (
                  <button
                    onClick={handleGroupSelected}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition flex items-center gap-1"
                    title="Khóa các đối tượng đang chọn thành 1 nhóm (Ctrl+G)"
                  >
                    <Link2 className="w-3 h-3" /> Nhóm
                  </button>
                )}
                {selectionGroupMeta.hasAnyGrouped && (
                  <button
                    onClick={handleUngroupSelected}
                    className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-bold transition border border-amber-300 flex items-center gap-1"
                    title="Tách nhóm thành các đối tượng rời (Ctrl+Shift+G)"
                  >
                    <Unlink className="w-3 h-3" /> Rã nhóm
                  </button>
                )}
                <button
                  onClick={() => setEnableSmartSnap((v) => !v)}
                  className={`px-2 py-0.5 rounded font-bold transition border flex items-center gap-1 ${
                    enableSmartSnap
                      ? 'bg-pink-50 text-pink-700 border-pink-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title="Tự động bắt thẳng hàng với tâm sân và các đối tượng khác khi kéo chuột"
                >
                  <Magnet className="w-3 h-3" /> Bắt thẳng hàng
                </button>
                <button
                  onClick={handleSelectAll}
                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold transition border border-blue-200"
                >
                  🔘 Tất cả ({elements.length})
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
                      {isSelected && (() => {
                        const isRectHalo =
                          el.type === 'grid_box' ||
                          el.type === 'parallel_lines' ||
                          el.type === 'shape_rect' ||
                          el.type === 'sgk_board' ||
                          el.type === 'mat' ||
                          el.type === 'hurdle' ||
                          el.type === 'goal_gate' ||
                          el.type === 'zigzag_path' ||
                          el.type === 'jump_arc';
                        if (isRectHalo) {
                          const box = getElementBoundingBox(el);
                          return (
                            <rect
                              x={box.x - 6}
                              y={box.y - 6}
                              width={box.w + 12}
                              height={box.h + 12}
                              rx="6"
                              fill="#3b82f6"
                              fillOpacity="0.09"
                              stroke="#2563eb"
                              strokeWidth="2"
                              strokeDasharray="4,3"
                            />
                          );
                        }
                        return (
                          <circle
                            cx={el.x}
                            cy={el.y}
                            r={Math.max(24, (el.radius || 16) + 8)}
                            fill="#3b82f6"
                            fillOpacity="0.12"
                            stroke="#2563eb"
                            strokeWidth="2.2"
                            strokeDasharray="4,3"
                          />
                        );
                      })()}

                      {/* Element Type Render */}
                      {el.type === 'gv' && (
                        <g
                          transform={`translate(${el.x}, ${el.y}) scale(${el.scale ?? 1})`}
                          filter="url(#shadowStudio)"
                        >
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
                        <g
                          transform={`translate(${el.x}, ${el.y}) scale(${el.scale ?? 1})`}
                          filter="url(#shadowStudio)"
                        >
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
                        <g
                          transform={`translate(${el.x}, ${el.y}) scale(${el.scale ?? 1})`}
                          filter="url(#shadowStudio)"
                        >
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
                        <g
                          transform={`translate(${el.x}, ${el.y}) scale(${el.scale ?? 1})`}
                          filter="url(#shadowStudio)"
                        >
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

                      {/* Extended Element Types: Grid Box, Parallel Lines, Special Game Symbols */}
                      <FormationExtraElementSvg el={el} />
                    </g>
                  );
                })}

                {/* Smart Alignment Snap Guide Lines during Drag */}
                {isDraggingGroup && activeSnapGuides.x !== undefined && (
                  <line
                    x1={activeSnapGuides.x}
                    y1={52}
                    x2={activeSnapGuides.x}
                    y2={415}
                    stroke="#ec4899"
                    strokeWidth="1.4"
                    strokeDasharray="5,3"
                    pointerEvents="none"
                  />
                )}
                {isDraggingGroup && activeSnapGuides.y !== undefined && (
                  <line
                    x1={20}
                    y1={activeSnapGuides.y}
                    x2={620}
                    y2={activeSnapGuides.y}
                    stroke="#ec4899"
                    strokeWidth="1.4"
                    strokeDasharray="5,3"
                    pointerEvents="none"
                  />
                )}

                {/* Group Selection Bounding Box + 4 Interactive Corner Resize Handles */}
                {groupBoundingBox && (() => {
                  const pad = 12;
                  const bx = groupBoundingBox.x - pad;
                  const by = groupBoundingBox.y - pad;
                  const bw = groupBoundingBox.w + pad * 2;
                  const bh = groupBoundingBox.h + pad * 2;
                  const accent = selectionGroupMeta.isSingleLockedGroup ? '#059669' : '#2563eb';
                  const badgeText = selectionGroupMeta.isSingleLockedGroup
                    ? `🔗 Đã nhóm (${selectedIds.length}) · Kéo góc thu nhỏ`
                    : `Chọn: ${selectedIds.length} đối tượng · Kéo góc thu nhỏ`;
                  const corners: Array<{
                    key: 'nw' | 'ne' | 'sw' | 'se';
                    cx: number;
                    cy: number;
                    cursor: string;
                  }> = [
                    { key: 'nw', cx: bx, cy: by, cursor: 'cursor-nwse-resize' },
                    { key: 'ne', cx: bx + bw, cy: by, cursor: 'cursor-nesw-resize' },
                    { key: 'sw', cx: bx, cy: by + bh, cursor: 'cursor-nesw-resize' },
                    { key: 'se', cx: bx + bw, cy: by + bh, cursor: 'cursor-nwse-resize' }
                  ];
                  return (
                    <g>
                      <rect
                        x={bx}
                        y={by}
                        width={bw}
                        height={bh}
                        fill="none"
                        stroke={accent}
                        strokeWidth={selectionGroupMeta.isSingleLockedGroup ? '2.2' : '1.8'}
                        strokeDasharray={selectionGroupMeta.isSingleLockedGroup ? 'none' : '6,4'}
                        rx="8"
                        pointerEvents="none"
                      />
                      <rect
                        x={bx}
                        y={Math.max(52, by - 21)}
                        width={212}
                        height={19}
                        rx="5"
                        fill={accent}
                        pointerEvents="none"
                      />
                      <text
                        x={bx + 7}
                        y={Math.max(65, by - 8)}
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        pointerEvents="none"
                      >
                        {badgeText}
                      </text>
                      {corners.map((c) => (
                        <g
                          key={c.key}
                          onPointerDown={(e) => handlePointerDownResizeCorner(e, c.key)}
                          className={c.cursor}
                        >
                          <rect
                            x={c.cx - 8}
                            y={c.cy - 8}
                            width={16}
                            height={16}
                            fill="transparent"
                          />
                          <rect
                            x={c.cx - 5}
                            y={c.cy - 5}
                            width={10}
                            height={10}
                            rx="2.5"
                            fill="#ffffff"
                            stroke={accent}
                            strokeWidth="2.2"
                          />
                        </g>
                      ))}
                    </g>
                  );
                })()}

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
              <div className="space-y-2.5">
                <div
                  className={`p-2.5 rounded-xl border ${
                    selectionGroupMeta.isSingleLockedGroup
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-bold text-xs ${
                        selectionGroupMeta.isSingleLockedGroup ? 'text-emerald-900' : 'text-blue-900'
                      }`}
                    >
                      {selectionGroupMeta.isSingleLockedGroup
                        ? `🔗 Đã Khóa Nhóm (${selectedIds.length})`
                        : `👥 Nhóm Đang Chọn (${selectedIds.length})`}
                    </span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-snug">
                    {selectionGroupMeta.isSingleLockedGroup
                      ? 'Các đối tượng đã khóa thành 1 khối thống nhất. Kéo 4 góc vuông trên khung để thu nhỏ/phóng to.'
                      : 'Bấm "Nhóm Lại" để khóa thành 1 khối, hoặc kéo 4 góc vuông trên khung để thu nhỏ cả nhóm.'}
                  </p>
                </div>

                {/* Lock / Unlock Persistent Group */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleGroupSelected}
                    disabled={selectionGroupMeta.isSingleLockedGroup}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 shadow-2xs transition text-[11px]"
                    title="Khóa các đối tượng thành 1 nhóm cố định (Ctrl+G)"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Nhóm Lại</span>
                  </button>
                  <button
                    onClick={handleUngroupSelected}
                    disabled={!selectionGroupMeta.hasAnyGrouped}
                    className="bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-800 font-bold py-1.5 px-2 rounded-lg border border-amber-300 flex items-center justify-center gap-1 transition text-[11px]"
                    title="Tách nhóm thành đối tượng rời (Ctrl+Shift+G)"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Rã Nhóm</span>
                  </button>
                </div>

                {/* Proportional Group Resize / Shrink */}
                <div className="p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
                      <ZoomOut className="w-3.5 h-3.5 text-indigo-600" /> Thu Nhỏ / Phóng To Nhóm
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleScaleSelected(0.8)}
                      className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-bold py-1 rounded-md border border-indigo-200 transition"
                      title="Thu nhỏ cả nhóm đi 20%"
                    >
                      −20%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScaleSelected(0.9)}
                      className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-bold py-1 rounded-md border border-indigo-200 transition"
                      title="Thu nhỏ cả nhóm đi 10%"
                    >
                      −10%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScaleSelected(1.1)}
                      className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-bold py-1 rounded-md border border-indigo-200 transition"
                      title="Phóng to cả nhóm thêm 10%"
                    >
                      +10%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScaleSelected(1.2)}
                      className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-bold py-1 rounded-md border border-indigo-200 transition"
                      title="Phóng to cả nhóm thêm 20%"
                    >
                      +20%
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-700/90 leading-tight">
                    Mẹo: Có thể kéo trực tiếp 4 ô vuông ở góc khung nhóm trên sân để thu gọn tự do.
                  </p>
                </div>

                {/* Full Alignment & Distribution Suite */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block text-[11px]">
                    📐 Canh Chỉnh Thẳng Hàng
                  </span>

                  {/* Vertical Axis Align (Left / CenterX / Right) */}
                  <div className="grid grid-cols-3 gap-1 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('left', 'Đã căn thẳng mép trái!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng mép trái tất cả đối tượng"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
                      <span>Trái</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('centerX', 'Đã căn thẳng tâm dọc (đồng cột)!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng tâm theo hàng dọc (đồng trục X)"
                    >
                      <AlignCenterHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Giữa Dọc</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('right', 'Đã căn thẳng mép phải!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng mép phải tất cả đối tượng"
                    >
                      <AlignRight className="w-3.5 h-3.5 text-blue-600" />
                      <span>Phải</span>
                    </button>
                  </div>

                  {/* Horizontal Axis Align (Top / CenterY / Bottom) */}
                  <div className="grid grid-cols-3 gap-1 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('top', 'Đã căn thẳng mép trên!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng mép trên tất cả đối tượng"
                    >
                      <AlignStartHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Trên</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('centerY', 'Đã căn thẳng tâm ngang (đồng hàng)!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng tâm theo hàng ngang (đồng trục Y)"
                    >
                      <AlignCenterVertical className="w-3.5 h-3.5 text-teal-600" />
                      <span>Giữa Ngang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignSelected('bottom', 'Đã căn thẳng mép dưới!')}
                      className="bg-white hover:bg-blue-50 text-slate-700 font-semibold py-1 px-1 rounded-md border border-slate-300 flex flex-col items-center gap-0.5 transition"
                      title="Căn thẳng mép dưới tất cả đối tượng"
                    >
                      <AlignEndHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Dưới</span>
                    </button>
                  </div>

                  {/* Even Distribution (Horizontal / Vertical) */}
                  {selectionGroupMeta.alignUnitCount >= 3 && (
                    <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                      <button
                        type="button"
                        onClick={() =>
                          handleAlignSelected('distributeH', 'Đã dàn đều khoảng cách hàng ngang!')
                        }
                        className="bg-white hover:bg-emerald-50 text-slate-700 font-semibold py-1 px-1.5 rounded-md border border-slate-300 flex items-center justify-center gap-1 transition"
                        title="Dàn đều cự ly giữa các đối tượng theo chiều ngang"
                      >
                        <AlignHorizontalDistributeCenter className="w-3 h-3 text-emerald-600" />
                        <span>Dàn Ngang</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleAlignSelected('distributeV', 'Đã dàn đều khoảng cách hàng dọc!')
                        }
                        className="bg-white hover:bg-emerald-50 text-slate-700 font-semibold py-1 px-1.5 rounded-md border border-slate-300 flex items-center justify-center gap-1 transition"
                        title="Dàn đều cự ly giữa các đối tượng theo chiều dọc"
                      >
                        <AlignVerticalDistributeCenter className="w-3 h-3 text-emerald-600" />
                        <span>Dàn Dọc</span>
                      </button>
                    </div>
                  )}

                  {/* Center Whole Group on Court */}
                  <button
                    type="button"
                    onClick={() =>
                      handleAlignSelected('centerCourt', 'Đã đưa cả nhóm vào chính giữa sân tập!')
                    }
                    className="w-full bg-white hover:bg-slate-200 text-slate-700 font-bold py-1 px-2 rounded-md border border-slate-300 flex items-center justify-center gap-1 transition text-[10.5px]"
                    title="Dịch chuyển cả nhóm vào tâm giữa sân tập"
                  >
                    <Crosshair className="w-3 h-3 text-pink-600" />
                    <span>Căn Nhóm Vào Giữa Sân</span>
                  </button>
                </div>

                {/* Group Duplicate & Delete */}
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

                {/* Grid Box Live Inspector */}
                {primarySelectedElement.type === 'grid_box' && (
                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-2">
                    <span className="font-bold text-blue-900 block text-[11px]">
                      🔲 Tùy Chỉnh Lưới Ô Vuông
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-[10.5px]">
                      <div>
                        <span className="text-slate-600">Hàng:</span>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={primarySelectedElement.rows ?? 3}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              rows: Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-blue-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-slate-600">Cột:</span>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={primarySelectedElement.cols ?? 3}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              cols: Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-blue-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-slate-600">Cỡ ô:</span>
                        <input
                          type="number"
                          min={12}
                          max={72}
                          value={primarySelectedElement.cellSize ?? 36}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              cellSize: Math.max(12, Math.min(72, parseInt(e.target.value, 10) || 36))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-blue-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {(
                        [
                          { id: 'empty', label: 'Ô trống' },
                          { id: 'numbers', label: 'Đánh số' },
                          { id: 'hand_foot', label: 'Tay-Chân' }
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleUpdateSingleSelected({ cellMode: m.id })}
                          className={`py-1 rounded-md font-bold border transition ${
                            (primarySelectedElement.cellMode || 'empty') === m.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parallel Lines Live Inspector */}
                {primarySelectedElement.type === 'parallel_lines' && (
                  <div className="p-2.5 bg-sky-50/80 rounded-xl border border-sky-200 space-y-2">
                    <span className="font-bold text-sky-900 block text-[11px]">
                      ☰ Tùy Chỉnh Đường Song Song
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleSelected({ orientation: 'vertical' })}
                        className={`py-1 rounded-md font-bold border transition ${
                          primarySelectedElement.orientation === 'vertical'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        ||| Hàng Dọc
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleSelected({ orientation: 'horizontal' })}
                        className={`py-1 rounded-md font-bold border transition ${
                          primarySelectedElement.orientation !== 'vertical'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        ☰ Hàng Ngang
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10.5px]">
                      <div>
                        <span className="text-slate-600">Số đường:</span>
                        <input
                          type="number"
                          min={2}
                          max={12}
                          value={primarySelectedElement.lineCount ?? 4}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              lineCount: Math.max(2, Math.min(12, parseInt(e.target.value, 10) || 2))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-sky-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-slate-600">Cách:</span>
                        <input
                          type="number"
                          min={6}
                          max={90}
                          value={primarySelectedElement.lineSpacing ?? 32}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              lineSpacing: Math.max(6, Math.min(90, parseInt(e.target.value, 10) || 32))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-sky-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-slate-600">Dài:</span>
                        <input
                          type="number"
                          min={24}
                          max={520}
                          value={primarySelectedElement.lineLength ?? 220}
                          onChange={(e) =>
                            handleUpdateSingleSelected({
                              lineLength: Math.max(24, Math.min(520, parseInt(e.target.value, 10) || 220))
                            })
                          }
                          className="w-full mt-0.5 bg-white border border-sky-300 rounded px-1 py-0.5 font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleSelected({ lineStyle: 'solid' })}
                        className={`py-1 rounded-md font-bold border transition ${
                          primarySelectedElement.lineStyle !== 'dashed'
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        ─── Nét Liền
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSingleSelected({ lineStyle: 'dashed' })}
                        className={`py-1 rounded-md font-bold border transition ${
                          primarySelectedElement.lineStyle === 'dashed'
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        - - - Nét Đứt
                      </button>
                    </div>
                  </div>
                )}

                {/* Rotation & Size Controls for Special Symbols / Shapes / Lines */}
                {(primarySelectedElement.type === 'foot_left' ||
                  primarySelectedElement.type === 'foot_right' ||
                  primarySelectedElement.type === 'feet_pair' ||
                  primarySelectedElement.type === 'hand_left' ||
                  primarySelectedElement.type === 'hand_right' ||
                  primarySelectedElement.type === 'hands_pair' ||
                  primarySelectedElement.type === 'mat' ||
                  primarySelectedElement.type === 'hurdle' ||
                  primarySelectedElement.type === 'goal_gate' ||
                  primarySelectedElement.type === 'zigzag_path' ||
                  primarySelectedElement.type === 'jump_arc' ||
                  primarySelectedElement.type === 'star_target' ||
                  primarySelectedElement.type === 'grid_box' ||
                  primarySelectedElement.type === 'parallel_lines' ||
                  primarySelectedElement.type === 'stick' ||
                  primarySelectedElement.type === 'shape_rect' ||
                  primarySelectedElement.type === 'shape_circle') && (
                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Xoay &amp; Kích Thước
                      </span>
                      <span className="text-[10px] font-bold text-amber-700">
                        {primarySelectedElement.rotation || 0}°
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => handleUpdateSingleSelected({ rotation: deg })}
                          className={`py-0.5 rounded font-bold border transition ${
                            (primarySelectedElement.rotation || 0) === deg
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSingleSelected({
                            rotation: ((primarySelectedElement.rotation || 0) + 45) % 360
                          })
                        }
                        className="py-0.5 rounded font-bold border bg-white text-amber-800 border-amber-300 hover:bg-amber-100"
                        title="Xoay thêm 45 độ"
                      >
                        +45°
                      </button>
                    </div>
                    {(primarySelectedElement.type === 'foot_left' ||
                      primarySelectedElement.type === 'foot_right' ||
                      primarySelectedElement.type === 'feet_pair' ||
                      primarySelectedElement.type === 'hand_left' ||
                      primarySelectedElement.type === 'hand_right' ||
                      primarySelectedElement.type === 'hands_pair' ||
                      primarySelectedElement.type === 'star_target' ||
                      primarySelectedElement.type === 'shape_circle') && (
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-slate-600 whitespace-nowrap">Cỡ:</span>
                        <input
                          type="range"
                          min={10}
                          max={primarySelectedElement.type === 'shape_circle' ? 140 : 34}
                          value={primarySelectedElement.radius || 16}
                          onChange={(e) =>
                            handleUpdateSingleSelected({ radius: parseInt(e.target.value, 10) || 16 })
                          }
                          className="flex-1"
                        />
                        <span className="font-bold text-slate-700 w-7 text-right">
                          {primarySelectedElement.radius || 16}
                        </span>
                      </div>
                    )}
                    {(primarySelectedElement.type === 'mat' ||
                      primarySelectedElement.type === 'hurdle' ||
                      primarySelectedElement.type === 'goal_gate' ||
                      primarySelectedElement.type === 'zigzag_path' ||
                      primarySelectedElement.type === 'jump_arc' ||
                      primarySelectedElement.type === 'shape_rect') && (
                      <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                        <div>
                          <span className="text-slate-600">Rộng:</span>
                          <input
                            type="number"
                            min={24}
                            max={420}
                            value={primarySelectedElement.width || 80}
                            onChange={(e) =>
                              handleUpdateSingleSelected({
                                width: Math.max(24, Math.min(420, parseInt(e.target.value, 10) || 80))
                              })
                            }
                            className="w-full mt-0.5 bg-white border border-amber-300 rounded px-1 py-0.5 font-bold text-center"
                          />
                        </div>
                        <div>
                          <span className="text-slate-600">Cao:</span>
                          <input
                            type="number"
                            min={12}
                            max={260}
                            value={primarySelectedElement.height || 40}
                            onChange={(e) =>
                              handleUpdateSingleSelected({
                                height: Math.max(12, Math.min(260, parseInt(e.target.value, 10) || 40))
                              })
                            }
                            className="w-full mt-0.5 bg-white border border-amber-300 rounded px-1 py-0.5 font-bold text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scale Slider for GV / Cone / Marker / Flag */}
                {(primarySelectedElement.type === 'gv' ||
                  primarySelectedElement.type === 'cone' ||
                  primarySelectedElement.type === 'marker' ||
                  primarySelectedElement.type === 'flag') && (
                  <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-bold text-indigo-900">🔍 Tỷ Lệ Thu Nhỏ / Phóng To</span>
                      <span className="font-bold text-indigo-700">
                        {Math.round((primarySelectedElement.scale ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={180}
                      step={5}
                      value={Math.round((primarySelectedElement.scale ?? 1) * 100)}
                      onChange={(e) =>
                        handleUpdateSingleSelected({
                          scale: Number((parseInt(e.target.value, 10) / 100).toFixed(2))
                        })
                      }
                      className="w-full"
                    />
                  </div>
                )}

                {/* Quick Orientation for single Line / Arrow */}
                {(primarySelectedElement.type === 'line_solid' ||
                  primarySelectedElement.type === 'line_dashed' ||
                  primarySelectedElement.type === 'arrow_straight' ||
                  primarySelectedElement.type === 'arrow_curved') && (
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 block text-[10.5px]">
                      📏 Đổi Hướng Đường / Mũi Tên
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const len = Math.max(
                            60,
                            Math.round(
                              Math.hypot(
                                (primarySelectedElement.endX ?? primarySelectedElement.x + 100) - primarySelectedElement.x,
                                (primarySelectedElement.endY ?? primarySelectedElement.y) - primarySelectedElement.y
                              )
                            )
                          );
                          handleUpdateSingleSelected({
                            endX: Math.min(615, primarySelectedElement.x + len),
                            endY: primarySelectedElement.y
                          });
                        }}
                        className="py-1 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-slate-700"
                      >
                        ── Nằm Ngang
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const len = Math.max(
                            60,
                            Math.round(
                              Math.hypot(
                                (primarySelectedElement.endX ?? primarySelectedElement.x + 100) - primarySelectedElement.x,
                                (primarySelectedElement.endY ?? primarySelectedElement.y) - primarySelectedElement.y
                              )
                            )
                          );
                          handleUpdateSingleSelected({
                            endX: primarySelectedElement.x,
                            endY: Math.min(405, primarySelectedElement.y + len)
                          });
                        }}
                        className="py-1 rounded bg-white hover:bg-blue-50 border border-slate-300 font-bold text-slate-700"
                      >
                        │ Thẳng Đứng
                      </button>
                    </div>
                  </div>
                )}

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

        {/* Inline Reference Image Picker Modal (from Thư Viện Ảnh) */}
        {isLibraryRefPickerOpen && (
          <div
            className="fixed inset-0 z-70 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3"
            onClick={() => setIsLibraryRefPickerOpen(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[82vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm">Chọn Ảnh Trò Chơi Tham Chiếu Từ Thư Viện</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLibraryRefPickerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={libSearch}
                    onChange={(e) => setLibSearch(e.target.value)}
                    placeholder="Tìm tên trò chơi hoặc bài học..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs"
                  />
                </div>
                <select
                  value={libGradeFilter}
                  onChange={(e) => setLibGradeFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="all">Tất cả khối</option>
                  <option value="1">Khối 1</option>
                  <option value="2">Khối 2</option>
                  <option value="3">Khối 3</option>
                  <option value="4">Khối 4</option>
                  <option value="5">Khối 5</option>
                </select>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                  <input
                    type="checkbox"
                    checked={libGameOnly}
                    onChange={(e) => setLibGameOnly(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Chỉ ảnh Trò chơi</span>
                </label>
              </div>

              <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-100/60">
                {filteredRefLibraryImages.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-slate-500">
                    Chưa tìm thấy ảnh phù hợp. Thử bỏ chọn "Chỉ ảnh Trò chơi" hoặc tải ảnh trực tiếp từ máy tính.
                  </div>
                ) : (
                  filteredRefLibraryImages.map((img) => (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => {
                        setRefImageUrl(img.imgUrl);
                        setRefGameTitle(img.title);
                        setRefCaption(img.caption || '');
                        const imgG = Number(img.grade);
                        if (imgG === 1 || imgG === 2 || imgG === 3 || imgG === 4 || imgG === 5) {
                          setRefGrade(imgG);
                          setDiagramGrade(imgG);
                        }
                        setDiagramPhase(img.folder === 'troChoiKhoiDong' ? 'khoi_dong' : 'tro_choi');
                        setIsLibraryRefPickerOpen(false);
                        showToast(`Đã chọn ảnh "${img.title}"! Nhấn "Phân Tích & Dựng Sơ Đồ" để tạo sơ đồ.`);
                      }}
                      className="text-left bg-white rounded-xl border border-slate-200 hover:border-emerald-500 p-2 flex flex-col gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <div className="h-28 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden p-1">
                        <img src={img.imgUrl} alt={img.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Khối {img.grade}</span>
                        <span className="text-emerald-700 truncate">{img.folder === 'troChoiKhoiDong' ? 'TC Khởi động' : img.folder === 'troChoi' ? 'TC Vận động' : img.folder}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2">{img.title}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
