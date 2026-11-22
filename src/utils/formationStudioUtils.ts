export interface FormationElement {
  id: string;
  type:
    | 'hs'
    | 'gv'
    | 'cs'
    | 'tt'
    | 'shape_rect'
    | 'shape_circle'
    | 'line_solid'
    | 'line_dashed'
    | 'arrow_straight'
    | 'arrow_curved'
    | 'ball'
    | 'marker'
    | 'cone'
    | 'hoop'
    | 'stick'
    | 'flag'
    | 'text'
    | 'sgk_board'
    | 'grid_box'
    | 'parallel_lines'
    | 'foot_left'
    | 'foot_right'
    | 'feet_pair'
    | 'hand_left'
    | 'hand_right'
    | 'hands_pair'
    | 'mat'
    | 'hurdle'
    | 'goal_gate'
    | 'zigzag_path'
    | 'jump_arc'
    | 'star_target'
    | 'mini_square'
    | 'mini_triangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  color: string;
  label?: string;
  fontSize?: number;
  rotation?: number;
  /** For grid_box */
  rows?: number;
  cols?: number;
  cellSize?: number;
  cellMode?: 'empty' | 'numbers' | 'hand_foot';
  /** For parallel_lines */
  orientation?: 'horizontal' | 'vertical';
  lineCount?: number;
  lineSpacing?: number;
  lineLength?: number;
  lineStyle?: 'solid' | 'dashed';
  /** Persistent group ID for grouped selection & manipulation */
  groupId?: string;
  /** Uniform scale multiplier for fixed-geometry icons (gv, cone, marker, flag) */
  scale?: number;
  /** Mirror / Flip flags */
  flipX?: boolean;
  flipY?: boolean;
}

function getRotatedRectBox(cx: number, cy: number, w: number, h: number, rotationDeg?: number) {
  if (!rotationDeg) {
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const rotW = w * cos + h * sin;
  const rotH = w * sin + h * cos;
  return { x: cx - rotW / 2, y: cy - rotH / 2, w: rotW, h: rotH };
}

export function getElementBoundingBox(el: FormationElement): { x: number; y: number; w: number; h: number } {
  if (el.type === 'grid_box') {
    const rows = Math.max(1, Math.min(8, el.rows ?? 3));
    const cols = Math.max(1, Math.min(8, el.cols ?? 3));
    const cell = Math.max(12, Math.min(72, el.cellSize ?? 36));
    return getRotatedRectBox(el.x, el.y, cols * cell, rows * cell, el.rotation);
  }
  if (el.type === 'parallel_lines') {
    const count = Math.max(2, Math.min(12, el.lineCount ?? 4));
    const spacing = Math.max(6, Math.min(90, el.lineSpacing ?? 32));
    const length = Math.max(24, Math.min(540, el.lineLength ?? 220));
    const span = (count - 1) * spacing;
    const isVert = el.orientation === 'vertical';
    const w = isVert ? Math.max(20, span + 12) : length;
    const h = isVert ? length : Math.max(20, span + 12);
    return getRotatedRectBox(el.x, el.y, w, h, el.rotation);
  }
  if (
    el.type === 'shape_rect' ||
    el.type === 'sgk_board' ||
    el.type === 'mat' ||
    el.type === 'hurdle' ||
    el.type === 'goal_gate' ||
    el.type === 'stick'
  ) {
    const w =
      el.width ||
      (el.type === 'mat'
        ? 76
        : el.type === 'hurdle'
        ? 52
        : el.type === 'goal_gate'
        ? 64
        : el.type === 'stick'
        ? 40
        : 140);
    const h =
      el.height ||
      (el.type === 'mat'
        ? 42
        : el.type === 'hurdle'
        ? 18
        : el.type === 'goal_gate'
        ? 28
        : el.type === 'stick'
        ? 10
        : 70);
    return getRotatedRectBox(el.x, el.y, w, h, el.rotation);
  }
  if (el.type === 'zigzag_path' || el.type === 'jump_arc') {
    const w = el.width || (el.type === 'zigzag_path' ? 160 : 90);
    const h = el.height || (el.type === 'zigzag_path' ? 44 : 34);
    return getRotatedRectBox(el.x, el.y, w, h, el.rotation);
  }
  if (el.type === 'line_solid' || el.type === 'line_dashed' || el.type === 'arrow_straight' || el.type === 'arrow_curved') {
    const x2 = el.endX ?? el.x + 80;
    const y2 = el.endY ?? el.y;
    const minX = Math.min(el.x, x2);
    const minY = Math.min(el.y, y2);
    return { x: minX, y: minY, w: Math.max(20, Math.abs(x2 - el.x)), h: Math.max(20, Math.abs(y2 - el.y)) };
  }
  if (el.type === 'gv' || el.type === 'cone' || el.type === 'marker' || el.type === 'flag') {
    const r = Math.round(16 * (el.scale ?? 1));
    return { x: el.x - r, y: el.y - r, w: r * 2, h: r * 2 };
  }
  const r = el.radius || 16;
  return { x: el.x - r, y: el.y - r, w: r * 2, h: r * 2 };
}

export type AlignmentMode =
  | 'left'
  | 'centerX'
  | 'right'
  | 'top'
  | 'centerY'
  | 'bottom'
  | 'distributeH'
  | 'distributeV'
  | 'centerCourt';

function shiftElementBy(el: FormationElement, dx: number, dy: number): FormationElement {
  const nextX = Math.max(15, Math.min(625, Math.round(el.x + dx)));
  const nextY = Math.max(60, Math.min(415, Math.round(el.y + dy)));
  const actualDx = nextX - el.x;
  const actualDy = nextY - el.y;
  if (el.endX !== undefined && el.endY !== undefined) {
    return {
      ...el,
      x: nextX,
      y: nextY,
      endX: Math.max(15, Math.min(625, Math.round(el.endX + actualDx))),
      endY: Math.max(60, Math.min(415, Math.round(el.endY + actualDy)))
    };
  }
  return { ...el, x: nextX, y: nextY };
}

/**
 * Proportionally scale a set of selected elements (both positions & sizes) around an anchor point.
 */
export function scaleFormationElements(
  elements: FormationElement[],
  targetIds: string[],
  factor: number,
  anchorX?: number,
  anchorY?: number
): FormationElement[] {
  const idSet = new Set(targetIds);
  const selected = elements.filter((el) => idSet.has(el.id));
  if (selected.length === 0) return elements;

  let cx = anchorX;
  let cy = anchorY;
  if (cx === undefined || cy === undefined) {
    let minX = 9999;
    let maxX = -9999;
    let minY = 9999;
    let maxY = -9999;
    selected.forEach((el) => {
      const b = getElementBoundingBox(el);
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.w);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.h);
    });
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
  }

  const safeFactor = Math.max(0.35, Math.min(2.5, factor));
  const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  return elements.map((el) => {
    if (!idSet.has(el.id)) return el;
    const next: FormationElement = {
      ...el,
      x: clampNum(Math.round(cx! + (el.x - cx!) * safeFactor), 18, 622),
      y: clampNum(Math.round(cy! + (el.y - cy!) * safeFactor), 62, 412)
    };
    if (el.endX !== undefined && el.endY !== undefined) {
      next.endX = clampNum(Math.round(cx! + (el.endX - cx!) * safeFactor), 18, 622);
      next.endY = clampNum(Math.round(cy! + (el.endY - cy!) * safeFactor), 62, 412);
    }

    if (el.type === 'grid_box') {
      next.cellSize = clampNum(Math.round((el.cellSize ?? 36) * safeFactor), 12, 72);
    } else if (el.type === 'parallel_lines') {
      next.lineSpacing = clampNum(Math.round((el.lineSpacing ?? 32) * safeFactor), 6, 90);
      next.lineLength = clampNum(Math.round((el.lineLength ?? 220) * safeFactor), 24, 540);
    } else if (
      el.type === 'shape_rect' ||
      el.type === 'sgk_board' ||
      el.type === 'mat' ||
      el.type === 'hurdle' ||
      el.type === 'goal_gate' ||
      el.type === 'zigzag_path' ||
      el.type === 'jump_arc' ||
      el.type === 'stick'
    ) {
      const baseW =
        el.width ||
        (el.type === 'mat'
          ? 76
          : el.type === 'hurdle'
          ? 52
          : el.type === 'goal_gate'
          ? 64
          : el.type === 'zigzag_path'
          ? 160
          : el.type === 'jump_arc'
          ? 90
          : el.type === 'stick'
          ? 40
          : 140);
      const baseH =
        el.height ||
        (el.type === 'mat'
          ? 42
          : el.type === 'hurdle'
          ? 18
          : el.type === 'goal_gate'
          ? 28
          : el.type === 'zigzag_path'
          ? 40
          : el.type === 'jump_arc'
          ? 34
          : el.type === 'stick'
          ? 7
          : 70);
      next.width = clampNum(Math.round(baseW * safeFactor), 20, 520);
      next.height = clampNum(Math.round(baseH * safeFactor), 6, 300);
    } else if (
      el.type === 'hs' ||
      el.type === 'cs' ||
      el.type === 'tt' ||
      el.type === 'ball' ||
      el.type === 'hoop' ||
      el.type === 'shape_circle' ||
      el.type === 'foot_left' ||
      el.type === 'foot_right' ||
      el.type === 'feet_pair' ||
      el.type === 'hand_left' ||
      el.type === 'hand_right' ||
      el.type === 'hands_pair' ||
      el.type === 'star_target' ||
      el.type === 'mini_square' ||
      el.type === 'mini_triangle'
    ) {
      const baseR =
        el.radius ||
        (el.type === 'hs'
          ? 11
          : el.type === 'cs' || el.type === 'tt'
          ? 12
          : el.type === 'ball'
          ? 13
          : el.type === 'hoop'
          ? 20
          : el.type === 'shape_circle'
          ? 50
          : 16);
      next.radius = clampNum(Math.round(baseR * safeFactor * 10) / 10, 5, 160);
    } else if (el.type === 'gv' || el.type === 'cone' || el.type === 'marker' || el.type === 'flag') {
      next.scale = clampNum(Math.round((el.scale ?? 1) * safeFactor * 100) / 100, 0.45, 2.2);
    } else if (el.type === 'text') {
      next.fontSize = clampNum(Math.round((el.fontSize ?? 12.5) * safeFactor * 10) / 10, 8, 28);
    }
    return next;
  });
}

/**
 * Align or distribute selected elements cleanly.
 * If selection contains multiple distinct persistent groups, aligns each group as an atomic unit.
 */
export function alignFormationElements(
  elements: FormationElement[],
  targetIds: string[],
  mode: AlignmentMode
): FormationElement[] {
  const idSet = new Set(targetIds);
  const selected = elements.filter((el) => idSet.has(el.id));
  if (selected.length === 0) return elements;

  if (mode === 'centerCourt') {
    let minX = 9999;
    let maxX = -9999;
    let minY = 9999;
    let maxY = -9999;
    selected.forEach((el) => {
      const b = getElementBoundingBox(el);
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.w);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.h);
    });
    const dx = 320 - (minX + maxX) / 2;
    const dy = 235 - (minY + maxY) / 2;
    return elements.map((el) => (idSet.has(el.id) ? shiftElementBy(el, dx, dy) : el));
  }

  if (selected.length < 2) return elements;

  // Determine atomic units: if multiple distinct groups/items exist, preserve internal structure of distinct groups
  const distinctGroups = new Set(selected.map((el) => el.groupId).filter(Boolean));
  const useGroupUnits = distinctGroups.size >= 2 || (distinctGroups.size === 1 && selected.some((el) => !el.groupId));

  interface AlignUnit {
    key: string;
    memberIds: string[];
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
  }

  const unitMap = new Map<string, FormationElement[]>();
  selected.forEach((el) => {
    const key = useGroupUnits && el.groupId ? `grp:${el.groupId}` : `el:${el.id}`;
    const arr = unitMap.get(key) || [];
    arr.push(el);
    unitMap.set(key, arr);
  });

  const units: AlignUnit[] = Array.from(unitMap.entries()).map(([key, members]) => {
    let minX = 9999;
    let maxX = -9999;
    let minY = 9999;
    let maxY = -9999;
    members.forEach((m) => {
      const b = getElementBoundingBox(m);
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.w);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.h);
    });
    return {
      key,
      memberIds: members.map((m) => m.id),
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2
    };
  });

  if (units.length < 2) return elements;

  const deltaByElId = new Map<string, { dx: number; dy: number }>();
  const setUnitDelta = (u: AlignUnit, dx: number, dy: number) => {
    u.memberIds.forEach((id) => deltaByElId.set(id, { dx, dy }));
  };

  if (mode === 'left') {
    const targetLeft = Math.min(...units.map((u) => u.x));
    units.forEach((u) => setUnitDelta(u, targetLeft - u.x, 0));
  } else if (mode === 'right') {
    const targetRight = Math.max(...units.map((u) => u.x + u.w));
    units.forEach((u) => setUnitDelta(u, targetRight - (u.x + u.w), 0));
  } else if (mode === 'centerX') {
    const targetCx = units.reduce((acc, u) => acc + u.cx, 0) / units.length;
    units.forEach((u) => setUnitDelta(u, targetCx - u.cx, 0));
  } else if (mode === 'top') {
    const targetTop = Math.min(...units.map((u) => u.y));
    units.forEach((u) => setUnitDelta(u, 0, targetTop - u.y));
  } else if (mode === 'bottom') {
    const targetBottom = Math.max(...units.map((u) => u.y + u.h));
    units.forEach((u) => setUnitDelta(u, 0, targetBottom - (u.y + u.h)));
  } else if (mode === 'centerY') {
    const targetCy = units.reduce((acc, u) => acc + u.cy, 0) / units.length;
    units.forEach((u) => setUnitDelta(u, 0, targetCy - u.cy));
  } else if (mode === 'distributeH' && units.length >= 3) {
    const sorted = [...units].sort((a, b) => a.cx - b.cx);
    const first = sorted[0].cx;
    const last = sorted[sorted.length - 1].cx;
    const step = (last - first) / (sorted.length - 1);
    sorted.forEach((u, idx) => setUnitDelta(u, first + idx * step - u.cx, 0));
  } else if (mode === 'distributeV' && units.length >= 3) {
    const sorted = [...units].sort((a, b) => a.cy - b.cy);
    const first = sorted[0].cy;
    const last = sorted[sorted.length - 1].cy;
    const step = (last - first) / (sorted.length - 1);
    sorted.forEach((u, idx) => setUnitDelta(u, 0, first + idx * step - u.cy));
  }

  return elements.map((el) => {
    const delta = deltaByElId.get(el.id);
    if (!delta) return el;
    return shiftElementBy(el, delta.dx, delta.dy);
  });
}

export type ShapePatternItemType = 'hoop' | 'mini_square' | 'mini_triangle' | 'hs';
export type ShapePatternLayout = 'circle' | 'arc' | 'triangle' | 'rectangle' | 'zigzag';

/**
 * Generate a locked group of N small shapes arranged in a geometric formation pattern:
 * circle, arc, triangle, rectangle, or zigzag.
 */
export function generateShapePatternElements(options: {
  itemType: ShapePatternItemType;
  layout: ShapePatternLayout;
  count: number;
  itemRadius?: number;
  numbered?: boolean;
  color?: string;
  centerX?: number;
  centerY?: number;
}): FormationElement[] {
  const count = Math.max(3, Math.min(24, Math.round(options.count || 8)));
  const itemType = options.itemType;
  const layout = options.layout;
  const cx = options.centerX ?? 320;
  const cy = options.centerY ?? 235;
  const defaultRadius =
    itemType === 'hs' ? 11 : itemType === 'hoop' ? 16 : 15;
  const r = Math.max(8, Math.min(30, options.itemRadius ?? defaultRadius));
  const defaultColor =
    itemType === 'hoop'
      ? '#06b6d4'
      : itemType === 'mini_square'
      ? '#2563eb'
      : itemType === 'mini_triangle'
      ? '#ea580c'
      : '#1e293b';
  const color = options.color || defaultColor;

  const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const points: Array<{ x: number; y: number }> = [];

  if (layout === 'circle') {
    const circRadius = clampNum((count * (r * 2.45)) / (2 * Math.PI), 56, 132);
    for (let i = 0; i < count; i++) {
      const ang = (2 * Math.PI * i) / count - Math.PI / 2;
      points.push({
        x: cx + Math.cos(ang) * circRadius,
        y: cy + Math.sin(ang) * circRadius
      });
    }
  } else if (layout === 'arc') {
    const startDeg = 118;
    const endDeg = 242;
    const spanRad = ((endDeg - startDeg) * Math.PI) / 180;
    const arcRadius = clampNum(((count - 1) * (r * 2.55)) / spanRad, 62, 145);
    const rawPts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const ang = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180;
      rawPts.push({
        x: Math.cos(ang) * arcRadius,
        y: Math.sin(ang) * arcRadius
      });
    }
    const minX = Math.min(...rawPts.map((p) => p.x));
    const maxX = Math.max(...rawPts.map((p) => p.x));
    const minY = Math.min(...rawPts.map((p) => p.y));
    const maxY = Math.max(...rawPts.map((p) => p.y));
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    rawPts.forEach((p) => points.push({ x: cx + (p.x - midX), y: cy + (p.y - midY) }));
  } else if (layout === 'triangle') {
    const side = clampNum((count / 3) * (r * 2.55), 118, 250);
    const triH = (side * Math.sqrt(3)) / 2;
    const v0 = { x: cx, y: cy - triH * 0.56 };
    const v1 = { x: cx + side / 2, y: cy + triH * 0.44 };
    const v2 = { x: cx - side / 2, y: cy + triH * 0.44 };
    const verts = [v0, v1, v2];
    for (let i = 0; i < count; i++) {
      const pos = (i / count) * 3;
      const edgeIdx = Math.min(2, Math.floor(pos));
      const localT = pos - edgeIdx;
      const a = verts[edgeIdx];
      const b = verts[(edgeIdx + 1) % 3];
      points.push({
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT
      });
    }
  } else if (layout === 'rectangle') {
    const perimeter = clampNum(count * (r * 2.55), 320, 860);
    let rectH = clampNum(perimeter / 4.9, 86, 220);
    let rectW = clampNum(rectH * 1.45, 130, 350);
    if (count === 4) {
      rectW = 150;
      rectH = 104;
    }
    const left = cx - rectW / 2;
    const right = cx + rectW / 2;
    const top = cy - rectH / 2;
    const bottom = cy + rectH / 2;
    const totalP = 2 * (rectW + rectH);
    for (let i = 0; i < count; i++) {
      const d = (i / count) * totalP;
      if (d <= rectW) {
        points.push({ x: left + d, y: top });
      } else if (d <= rectW + rectH) {
        points.push({ x: right, y: top + (d - rectW) });
      } else if (d <= 2 * rectW + rectH) {
        points.push({ x: right - (d - rectW - rectH), y: bottom });
      } else {
        points.push({ x: left, y: bottom - (d - 2 * rectW - rectH) });
      }
    }
  } else {
    // zigzag (hình gấp khúc)
    const stepX = clampNum(r * 2.55, 28, 56);
    const totalW = Math.min(460, (count - 1) * stepX);
    const actualStepX = count > 1 ? totalW / (count - 1) : 0;
    const ampY = clampNum(r * 2.15, 28, 54);
    const startX = cx - totalW / 2;
    for (let i = 0; i < count; i++) {
      points.push({
        x: startX + i * actualStepX,
        y: cy + (i % 2 === 0 ? -ampY : ampY)
      });
    }
  }

  const now = Date.now();
  const groupId = `pat_${layout}_${now}`;
  return points.map((pt, idx) => ({
    id: `${itemType}_pat_${now}_${idx}`,
    type: itemType,
    x: clampNum(Math.round(pt.x), 24, 616),
    y: clampNum(Math.round(pt.y), 70, 405),
    radius: r,
    color,
    label: options.numbered ? String(idx + 1) : undefined,
    groupId
  }));
}

/**
 * Mirror (flip) selected elements horizontally or vertically.
 * When duplicate is true, creates an independent mirrored clone placed beside the original.
 */
export function mirrorFormationElements(
  elements: FormationElement[],
  targetIds: string[],
  axis: 'horizontal' | 'vertical',
  options?: { duplicate?: boolean }
): { elements: FormationElement[]; nextSelectedIds: string[] } {
  const idSet = new Set(targetIds);
  const selected = elements.filter((el) => idSet.has(el.id));
  if (selected.length === 0) return { elements, nextSelectedIds: targetIds };

  let minX = 9999;
  let maxX = -9999;
  let minY = 9999;
  let maxY = -9999;
  selected.forEach((el) => {
    const b = getElementBoundingBox(el);
    minX = Math.min(minX, b.x);
    maxX = Math.max(maxX, b.x + b.w);
    minY = Math.min(minY, b.y);
    maxY = Math.max(maxY, b.y + b.h);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const transformElement = (el: FormationElement, pivotX: number, pivotY: number): FormationElement => {
    const copy: FormationElement = JSON.parse(JSON.stringify(el));
    const isLineLike =
      copy.type === 'line_solid' ||
      copy.type === 'line_dashed' ||
      copy.type === 'arrow_straight' ||
      copy.type === 'arrow_curved';

    if (axis === 'horizontal') {
      copy.x = Math.round(2 * pivotX - copy.x);
      if (copy.endX !== undefined) {
        copy.endX = Math.round(2 * pivotX - copy.endX);
      }
      if (copy.rotation) {
        copy.rotation = (360 - (copy.rotation % 360)) % 360;
      }
      if (copy.type === 'foot_left') {
        copy.type = 'foot_right';
      } else if (copy.type === 'foot_right') {
        copy.type = 'foot_left';
      } else if (copy.type === 'hand_left') {
        copy.type = 'hand_right';
      } else if (copy.type === 'hand_right') {
        copy.type = 'hand_left';
      } else if (!isLineLike) {
        copy.flipX = !copy.flipX;
      }
    } else {
      copy.y = Math.round(2 * pivotY - copy.y);
      if (copy.endY !== undefined) {
        copy.endY = Math.round(2 * pivotY - copy.endY);
      }
      if (copy.rotation) {
        copy.rotation = (180 - (copy.rotation % 360) + 360) % 360;
      }
      copy.flipY = !copy.flipY;
    }

    return copy;
  };

  if (options?.duplicate) {
    const now = Date.now();
    const clonedGroupMap = new Map<string, string>();
    const gap = 18;
    const pivotX = axis === 'horizontal' ? maxX + gap / 2 : cx;
    const pivotY = axis === 'vertical' ? maxY + gap / 2 : cy;

    let clones = selected.map((el, idx) => {
      const mirrored = transformElement(el, pivotX, pivotY);
      mirrored.id = `${mirrored.type}_mir_${now}_${idx}`;
      if (el.groupId) {
        if (!clonedGroupMap.has(el.groupId)) {
          clonedGroupMap.set(el.groupId, `grp_mir_${now}_${clonedGroupMap.size}`);
        }
        mirrored.groupId = clonedGroupMap.get(el.groupId);
      } else if (selected.length >= 2) {
        mirrored.groupId = `grp_mir_${now}`;
      }
      return mirrored;
    });

    // Keep mirrored clones neatly inside court bounds if they overflow right/bottom/left/top
    let cMinX = 9999;
    let cMaxX = -9999;
    let cMinY = 9999;
    let cMaxY = -9999;
    clones.forEach((c) => {
      const b = getElementBoundingBox(c);
      cMinX = Math.min(cMinX, b.x);
      cMaxX = Math.max(cMaxX, b.x + b.w);
      cMinY = Math.min(cMinY, b.y);
      cMaxY = Math.max(cMaxY, b.y + b.h);
    });
    let fixDx = 0;
    let fixDy = 0;
    if (cMaxX > 616) fixDx = 616 - cMaxX;
    if (cMinX + fixDx < 22) fixDx = 22 - cMinX;
    if (cMaxY > 406) fixDy = 406 - cMaxY;
    if (cMinY + fixDy < 64) fixDy = 64 - cMinY;

    if (fixDx !== 0 || fixDy !== 0) {
      clones = clones.map((c) => shiftElementBy(c, fixDx, fixDy));
    }

    return {
      elements: [...elements, ...clones],
      nextSelectedIds: clones.map((c) => c.id)
    };
  }

  // In-place mirror across selection bounding-box center
  const nextElements = elements.map((el) => {
    if (!idSet.has(el.id)) return el;
    const mirrored = transformElement(el, cx, cy);
    mirrored.x = clampNum(mirrored.x, 18, 622);
    mirrored.y = clampNum(mirrored.y, 62, 412);
    if (mirrored.endX !== undefined) mirrored.endX = clampNum(mirrored.endX, 18, 622);
    if (mirrored.endY !== undefined) mirrored.endY = clampNum(mirrored.endY, 62, 412);
    return mirrored;
  });

  return { elements: nextElements, nextSelectedIds: targetIds };
}

export type ConnectorLineType = 'line_solid' | 'line_dashed' | 'arrow_straight';

export function isLineLikeElement(el: FormationElement): boolean {
  return (
    el.type === 'line_solid' ||
    el.type === 'line_dashed' ||
    el.type === 'arrow_straight' ||
    el.type === 'arrow_curved'
  );
}

/**
 * Compute angle (0..359°), length (px), and midpoint of a line or arrow element.
 */
export function getLineMetrics(el: FormationElement): {
  angle: number;
  length: number;
  midX: number;
  midY: number;
} {
  const x1 = el.x;
  const y1 = el.y;
  const x2 = el.endX ?? el.x + 80;
  const y2 = el.endY ?? el.y;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(10, Math.round(Math.hypot(dx, dy)));
  const rawDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const angle = Math.round(((rawDeg % 360) + 360) % 360) % 360;
  return {
    angle,
    length,
    midX: (x1 + x2) / 2,
    midY: (y1 + y2) / 2
  };
}

/**
 * Rotate a line/arrow around its midpoint to an exact angle (degrees) and optional new length.
 */
export function rotateLineToAngle(
  el: FormationElement,
  targetDeg: number,
  nextLength?: number
): Partial<FormationElement> {
  const { length, midX, midY } = getLineMetrics(el);
  const len = Math.max(16, Math.min(560, nextLength ?? length));
  const rad = (targetDeg * Math.PI) / 180;
  const halfX = (Math.cos(rad) * len) / 2;
  const halfY = (Math.sin(rad) * len) / 2;
  const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  return {
    x: clampNum(Math.round(midX - halfX), 18, 622),
    y: clampNum(Math.round(midY - halfY), 62, 412),
    endX: clampNum(Math.round(midX + halfX), 18, 622),
    endY: clampNum(Math.round(midY + halfY), 62, 412)
  };
}

/**
 * Rotate a group of selected elements around their combined bounding-box center by deltaDeg degrees.
 */
export function rotateFormationElements(
  elements: FormationElement[],
  targetIds: string[],
  deltaDeg: number
): FormationElement[] {
  const idSet = new Set(targetIds);
  const selected = elements.filter((el) => idSet.has(el.id));
  if (selected.length === 0 || !deltaDeg) return elements;

  let minX = 9999;
  let maxX = -9999;
  let minY = 9999;
  let maxY = -9999;
  selected.forEach((el) => {
    const b = getElementBoundingBox(el);
    minX = Math.min(minX, b.x);
    maxX = Math.max(maxX, b.x + b.w);
    minY = Math.min(minY, b.y);
    maxY = Math.max(maxY, b.y + b.h);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rad = (deltaDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const rotPt = (px: number, py: number) => ({
    x: clampNum(Math.round(cx + (px - cx) * cos - (py - cy) * sin), 18, 622),
    y: clampNum(Math.round(cy + (px - cx) * sin + (py - cy) * cos), 62, 412)
  });

  return elements.map((el) => {
    if (!idSet.has(el.id)) return el;
    const p1 = rotPt(el.x, el.y);
    const next: FormationElement = {
      ...el,
      x: p1.x,
      y: p1.y
    };
    if (el.endX !== undefined && el.endY !== undefined) {
      const p2 = rotPt(el.endX, el.endY);
      next.endX = p2.x;
      next.endY = p2.y;
    } else {
      next.rotation = Math.round((((el.rotation || 0) + deltaDeg) % 360 + 360) % 360);
    }
    return next;
  });
}

/**
 * Create straight solid, dashed, or arrow connectors linking selected objects in sequence.
 * Inserts connector lines behind existing nodes so numbers/shapes remain crisp and readable.
 */
export function connectFormationElements(
  elements: FormationElement[],
  targetIds: string[],
  lineType: ConnectorLineType,
  options?: { closed?: boolean; color?: string }
): { elements: FormationElement[]; createdIds: string[] } {
  const idSet = new Set(targetIds);
  const nodes = elements.filter((el) => idSet.has(el.id) && !isLineLikeElement(el) && el.type !== 'text');
  if (nodes.length < 2) return { elements, createdIds: [] };

  // Smart ordering: if at least 2 nodes have numeric labels (e.g. 1, 2, 5, 8, 9, 10), order ascending
  const numericNodes = nodes.filter((n) => n.label && /^\d+$/.test(n.label.trim()));
  let ordered = [...nodes];
  if (numericNodes.length >= 2) {
    ordered.sort((a, b) => {
      const na = a.label && /^\d+$/.test(a.label.trim()) ? parseInt(a.label.trim(), 10) : 999999;
      const nb = b.label && /^\d+$/.test(b.label.trim()) ? parseInt(b.label.trim(), 10) : 999999;
      return na - nb;
    });
  }

  const defaultColor =
    options?.color ||
    (lineType === 'line_solid'
      ? '#2563eb'
      : lineType === 'line_dashed'
      ? '#475569'
      : '#16a34a');

  const now = Date.now();
  const created: FormationElement[] = [];
  const pairCount = options?.closed && ordered.length >= 3 ? ordered.length : ordered.length - 1;

  for (let i = 0; i < pairCount; i++) {
    const a = ordered[i];
    const b = ordered[(i + 1) % ordered.length];
    if (a.x === b.x && a.y === b.y) continue;
    created.push({
      id: `${lineType}_conn_${now}_${i}`,
      type: lineType,
      x: a.x,
      y: a.y,
      endX: b.x,
      endY: b.y,
      color: defaultColor
    });
  }

  return {
    elements: [...created, ...elements],
    createdIds: created.map((c) => c.id)
  };
}

export function buildFootSvgInner(color: string, mirrorX: boolean = false, scale: number = 1): string {
  const sx = mirrorX ? -scale : scale;
  return `
    <g transform="scale(${sx}, ${scale})">
      <path d="M -3.5,11 C -5.5,6 -4.5,0 -5.5,-4.5 C -5.8,-7.5 -2,-9.5 1.8,-8.5 C 5.5,-7.5 6.2,-3.5 4.6,2 C 3.6,6 4.5,10.5 1.2,12.5 C -1.5,13.5 -3,12.5 -3.5,11 Z" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
      <ellipse cx="4.2" cy="-12.2" rx="2.3" ry="3.1" fill="${color}" stroke="#ffffff" stroke-width="0.9"/>
      <ellipse cx="0.6" cy="-13" rx="1.6" ry="2.4" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>
      <ellipse cx="-2.3" cy="-12.2" rx="1.4" ry="2.1" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>
      <ellipse cx="-4.8" cy="-10.6" rx="1.25" ry="1.8" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>
      <ellipse cx="-6.7" cy="-8.4" rx="1.1" ry="1.5" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>
    </g>
  `;
}

export function buildHandSvgInner(color: string, mirrorX: boolean = false, scale: number = 1): string {
  const sx = mirrorX ? -scale : scale;
  return `
    <g transform="scale(${sx}, ${scale})">
      <path d="M -6,11 C -8,8 -8.5,3 -8.5,-1 L -8.5,-7.5 C -8.5,-9 -6.5,-9 -6.5,-7.5 L -6.5,-1.5 L -5,-1.5 L -5,-10.5 C -5,-12 -2.8,-12 -2.8,-10.5 L -2.8,-2 L -1.2,-2 L -1.2,-12 C -1.2,-13.6 1.1,-13.6 1.1,-12 L 1.1,-2 L 2.7,-2 L 2.7,-10 C 2.7,-11.6 4.9,-11.6 4.9,-10 L 4.9,0.5 L 7.8,-2.8 C 9,-4 10.7,-2.5 9.5,-1.2 L 5.6,4.8 C 4.8,8.5 3.2,11.5 0,12 C -3,12.5 -5,12 -6,11 Z" fill="${color}" stroke="#ffffff" stroke-width="1.1" stroke-linejoin="round"/>
    </g>
  `;
}

export type CourtTheme = 'clean' | 'turf' | 'court';

export interface FormationPresetItem {
  id: string;
  name: string;
  category: 'Hàng Dọc' | 'Hàng Ngang' | 'Tổ / Nhóm' | 'Cá Nhân & Cặp Đôi' | 'Trò Chơi' | 'Quy Trình Tiết Học';
  description: string;
  elements: FormationElement[];
  title: string;
  subtitle: string;
}

/**
 * Generate high-definition SVG string from FormationElement[]
 */
const escXml = (str: string) =>
  (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function renderFormationSvgString(
  elements: FormationElement[],
  theme: CourtTheme = 'clean',
  title: string = 'SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN',
  subtitle: string = 'Chuẩn GDPT 2018'
): string {
  let bgHtml = '';
  let titleColor = '#1e293b';
  let subtitleColor = '#64748b';

  if (theme === 'turf') {
    titleColor = '#ffffff';
    subtitleColor = '#bbf7d0';
    bgHtml = `
      <rect width="640" height="430" rx="16" fill="#15803d"/>
      <rect x="0" y="0" width="640" height="430" rx="16" fill="url(#turfPattern2)" opacity="0.22"/>
      <rect x="24" y="60" width="592" height="346" rx="8" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-opacity="0.85"/>
      <line x1="320" y1="60" x2="320" y2="406" stroke="#ffffff" stroke-width="2.2" stroke-opacity="0.75"/>
      <circle cx="320" cy="233" r="56" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-opacity="0.75"/>
      <circle cx="320" cy="233" r="4" fill="#ffffff" stroke-opacity="0.9"/>
      <rect x="0" y="0" width="640" height="52" rx="15" fill="#0f172a" fill-opacity="0.45"/>
      <line x1="0" y1="52" x2="640" y2="52" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.25"/>
    `;
  } else if (theme === 'court') {
    titleColor = '#ffffff';
    subtitleColor = '#fef08a';
    bgHtml = `
      <rect width="640" height="430" rx="16" fill="#9a3412"/>
      <rect x="0" y="0" width="640" height="430" rx="16" fill="url(#woodGrad2)"/>
      <rect x="24" y="60" width="592" height="346" rx="8" fill="none" stroke="#fef08a" stroke-width="2.8" stroke-opacity="0.85"/>
      <line x1="320" y1="60" x2="320" y2="406" stroke="#fef08a" stroke-width="2.2" stroke-opacity="0.75"/>
      <circle cx="320" cy="233" r="56" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-opacity="0.75"/>
      <circle cx="320" cy="233" r="4" fill="#fef08a"/>
      <rect x="0" y="0" width="640" height="52" rx="15" fill="#0f172a" fill-opacity="0.48"/>
      <line x1="0" y1="52" x2="640" y2="52" stroke="#fef08a" stroke-width="1.5" stroke-opacity="0.3"/>
    `;
  } else {
    // Sư phạm CV 5512 (Clean White)
    bgHtml = `
      <rect width="640" height="430" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="640" height="48" rx="15" fill="#f8fafc"/>
      <line x1="0" y1="48" x2="640" y2="48" stroke="#e2e8f0" stroke-width="1.5"/>
      <rect x="24" y="66" width="592" height="340" rx="8" fill="#fbfcfe" stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="6,4"/>
    `;
  }

  const elementsSvg = elements
    .map((el) => {
      switch (el.type) {
        case 'gv': {
          const sc = el.scale ?? 1;
          const sx = (el.flipX ? -1 : 1) * sc;
          const sy = (el.flipY ? -1 : 1) * sc;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <g transform="rotate(${el.rotation || 0}) scale(${sx}, ${sy})">
                <polygon points="0,-18 -16,14 16,14" fill="${el.color || '#dc2626'}" />
              </g>
              <text x="0" y="${Math.round(28 * sc)}" font-family="sans-serif" font-size="13" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle"> ${escXml(el.label || 'GV')}</text>
            </g>
          `;
        }
        case 'hs': {
          const r = el.radius || 11;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#2563eb'}" stroke="#ffffff" stroke-width="2"/>
              ${el.label ? `<text x="0" y="4" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'cs': {
          const r = el.radius || 12;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#0284c7'}" stroke="#ffffff" stroke-width="2"/>
              <text x="0" y="4.5" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${escXml(el.label || 'CS')}</text>
            </g>
          `;
        }
        case 'tt': {
          const r = el.radius || 12;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#ea580c'}" stroke="#ffffff" stroke-width="2"/>
              <text x="0" y="4.5" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${escXml(el.label || 'TT')}</text>
            </g>
          `;
        }
        case 'shape_rect': {
          const w = el.width || 120;
          const h = el.height || 70;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${el.color || '#eff6ff'}" fill-opacity="0.4" stroke="${el.color || '#3b82f6'}" stroke-width="2" stroke-dasharray="5,4"/>
              ${el.label ? `<text x="0" y="${-h / 2 + 18}" font-family="sans-serif" font-size="12" font-weight="bold" fill="${el.color || '#1d4ed8'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'shape_circle': {
          const r = el.radius || 40;
          return `
            <g transform="translate(${el.x}, ${el.y})">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#eff6ff'}" fill-opacity="0.35" stroke="${el.color || '#3b82f6'}" stroke-width="2" stroke-dasharray="5,4"/>
              ${el.label ? `<text x="0" y="5" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#1d4ed8'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'line_solid': {
          const x2 = el.endX ?? (el.x + (el.width || 80));
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#dc2626'}" stroke-width="3" stroke-linecap="round"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'line_dashed': {
          const x2 = el.endX ?? (el.x + (el.width || 80));
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#0284c7'}" stroke-width="2.5" stroke-dasharray="6,4" stroke-linecap="round"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#0284c7'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'arrow_straight': {
          const x2 = el.endX ?? (el.x + 70);
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#16a34a'}" stroke-width="2.8" marker-end="url(#arrowMarker)"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#16a34a'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'arrow_curved': {
          const x2 = el.endX ?? (el.x + 80);
          const y2 = el.endY ?? el.y;
          const midX = (el.x + x2) / 2;
          const midY = el.flipY ? Math.max(el.y, y2) + 40 : Math.min(el.y, y2) - 40;
          const labelY = el.flipY ? midY + 14 : midY - 8;
          return `
            <g>
              <path d="M ${el.x} ${el.y} Q ${midX} ${midY} ${x2} ${y2}" fill="none" stroke="${el.color || '#ea580c'}" stroke-width="2.8" marker-end="url(#arrowMarkerOrange)"/>
              ${el.label ? `<text x="${midX}" y="${labelY}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#ea580c'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'ball': {
          const r = el.radius || 13;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#ea580c'}" stroke="#ffffff" stroke-width="2"/>
              <path d="M ${-r} 0 Q 0 ${-r / 2} ${r} 0" stroke="#ffffff" stroke-width="1.8" fill="none"/>
              <path d="M ${-r} 0 Q 0 ${r / 2} ${r} 0" stroke="#ffffff" stroke-width="1.8" fill="none"/>
              <line x1="0" y1="${-r}" x2="0" y2="${r}" stroke="#ffffff" stroke-width="1.8"/>
              ${el.label ? `<text x="0" y="${r + 14}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#c2410c" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'cone': {
          const sc = el.scale ?? 1;
          const sx = (el.flipX ? -1 : 1) * sc;
          const sy = (el.flipY ? -1 : 1) * sc;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <g transform="rotate(${el.rotation || 0}) scale(${sx}, ${sy})">
                <polygon points="0,-16 -12,12 12,12" fill="${el.color || '#ea580c'}"/>
                <rect x="-14" y="10" width="28" height="4" rx="2" fill="${el.color || '#c2410c'}"/>
                <polygon points="0,-6 -6,6 6,6" fill="#ffffff" opacity="0.6"/>
              </g>
              ${el.label ? `<text x="0" y="${Math.round(24 * sc)}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#ea580c'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'marker': {
          const sc = el.scale ?? 1;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}) scale(${sc})" filter="url(#dropShadow)">
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="${el.color || '#eab308'}" stroke="#ca8a04" stroke-width="1.5"/>
              <circle cx="0" cy="-1" r="3" fill="#ca8a04"/>
              ${el.label ? `<text x="0" y="17" font-family="sans-serif" font-size="10" font-weight="bold" fill="#a16207" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'hoop': {
          const r = el.radius || 20;
          const labelY = el.label && el.label.length <= 2 ? 4 : r + 14;
          const labelSize = el.label && el.label.length <= 2 ? 10.5 : 10;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="none" stroke="${el.color || '#06b6d4'}" stroke-width="4.5"/>
              ${el.label ? `<text x="0" y="${labelY}" font-family="sans-serif" font-size="${labelSize}" font-weight="bold" fill="${el.color || '#0891b2'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'stick': {
          const len = el.width || 60;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <rect x="${-len / 2}" y="-4" width="${len}" height="8" rx="4" fill="${el.color || '#f59e0b'}" stroke="#b45309" stroke-width="1.5"/>
              ${el.label ? `<text x="0" y="18" font-family="sans-serif" font-size="10" font-weight="bold" fill="#b45309" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'flag': {
          const sc = el.scale ?? 1;
          const sx = (el.flipX ? -1 : 1) * sc;
          const sy = (el.flipY ? -1 : 1) * sc;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <g transform="rotate(${el.rotation || 0}) scale(${sx}, ${sy})">
                <line x1="0" y1="16" x2="0" y2="-18" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
                <polygon points="0,-18 18,-11 0,-4" fill="${el.color || '#dc2626'}"/>
                <circle cx="0" cy="16" r="4" fill="#334155"/>
              </g>
              ${el.label ? `<text x="0" y="${Math.round(29 * sc)}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'text': {
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              <text x="0" y="0" font-family="sans-serif" font-size="${el.fontSize || 13}" font-weight="bold" fill="${el.color || '#1e293b'}" text-anchor="middle">
                ${escXml(el.label || 'Ghi chú')}
              </text>
            </g>
          `;
        }
        case 'sgk_board': {
          const w = el.width || 120;
          const h = el.height || 65;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
              <text x="0" y="${-h / 2 + 20}" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b45309" text-anchor="middle">📖 TRANH KỸ THUẬT</text>
              <text x="0" y="${-h / 2 + 40}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#92400e" text-anchor="middle">${escXml(el.label || 'Động Tác Mẫu SGK')}</text>
            </g>
          `;
        }
        case 'grid_box': {
          const rows = Math.max(1, Math.min(8, el.rows ?? 3));
          const cols = Math.max(1, Math.min(8, el.cols ?? 3));
          const cell = Math.max(12, Math.min(72, el.cellSize ?? 36));
          const mode = el.cellMode || 'empty';
          const totalW = cols * cell;
          const totalH = rows * cell;
          const strokeColor = el.color || '#2563eb';
          const lines: string[] = [];
          for (let c = 1; c < cols; c++) {
            const lx = -totalW / 2 + c * cell;
            lines.push(`<line x1="${lx}" y1="${-totalH / 2}" x2="${lx}" y2="${totalH / 2}" stroke="${strokeColor}" stroke-width="1.6"/>`);
          }
          for (let r = 1; r < rows; r++) {
            const ly = -totalH / 2 + r * cell;
            lines.push(`<line x1="${-totalW / 2}" y1="${ly}" x2="${totalW / 2}" y2="${ly}" stroke="${strokeColor}" stroke-width="1.6"/>`);
          }
          const cellContents: string[] = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cx = -totalW / 2 + c * cell + cell / 2;
              const cy = -totalH / 2 + r * cell + cell / 2;
              if (mode === 'numbers') {
                cellContents.push(
                  `<text x="${cx}" y="${cy + 4.5}" font-family="sans-serif" font-size="${Math.max(8, Math.round(cell * 0.36))}" font-weight="bold" fill="${strokeColor}" text-anchor="middle">${r * cols + c + 1}</text>`
                );
              } else if (mode === 'hand_foot') {
                const miniScale = Math.max(0.28, (cell / 36) * 0.68);
                const idx = r * cols + c;
                if (idx % 2 === 0) {
                  cellContents.push(`<g transform="translate(${cx}, ${cy})">${buildFootSvgInner('#2563eb', idx % 4 === 2, miniScale)}</g>`);
                } else {
                  cellContents.push(`<g transform="translate(${cx}, ${cy})">${buildHandSvgInner('#ea580c', idx % 4 === 3, miniScale)}</g>`);
                }
              }
            }
          }
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              <rect x="${-totalW / 2}" y="${-totalH / 2}" width="${totalW}" height="${totalH}" rx="4" fill="${strokeColor}" fill-opacity="0.06" stroke="${strokeColor}" stroke-width="2.2"/>
              ${lines.join('\n')}
              ${cellContents.join('\n')}
              ${el.label ? `<text x="0" y="${-totalH / 2 - 8}" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="${strokeColor}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'parallel_lines': {
          const count = Math.max(2, Math.min(12, el.lineCount ?? 4));
          const spacing = Math.max(6, Math.min(90, el.lineSpacing ?? 32));
          const length = Math.max(24, Math.min(540, el.lineLength ?? 220));
          const isVert = el.orientation === 'vertical';
          const isDashed = el.lineStyle === 'dashed';
          const strokeColor = el.color || '#0284c7';
          const span = (count - 1) * spacing;
          const lines: string[] = [];
          for (let i = 0; i < count; i++) {
            const offset = -span / 2 + i * spacing;
            if (isVert) {
              lines.push(
                `<line x1="${offset}" y1="${-length / 2}" x2="${offset}" y2="${length / 2}" stroke="${strokeColor}" stroke-width="2.4" ${isDashed ? 'stroke-dasharray="7,4"' : ''} stroke-linecap="round"/>`
              );
            } else {
              lines.push(
                `<line x1="${-length / 2}" y1="${offset}" x2="${length / 2}" y2="${offset}" stroke="${strokeColor}" stroke-width="2.4" ${isDashed ? 'stroke-dasharray="7,4"' : ''} stroke-linecap="round"/>`
              );
            }
          }
          const labelY = isVert ? -length / 2 - 9 : -span / 2 - 9;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              ${lines.join('\n')}
              ${el.label ? `<text x="0" y="${labelY}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${strokeColor}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'foot_left':
        case 'foot_right': {
          const s = (el.radius || 16) / 16;
          const col = el.color || '#2563eb';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              ${buildFootSvgInner(col, el.type === 'foot_right', s)}
              ${el.label ? `<text x="0" y="${Math.round(18 * s + 9)}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'feet_pair': {
          const s = (el.radius || 15) / 16;
          const col = el.color || '#2563eb';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <g transform="translate(${-9 * s}, 0)">${buildFootSvgInner(col, false, s * 0.88)}</g>
              <g transform="translate(${9 * s}, 0)">${buildFootSvgInner(col, true, s * 0.88)}</g>
              ${el.label ? `<text x="0" y="${Math.round(18 * s + 9)}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'hand_left':
        case 'hand_right': {
          const s = (el.radius || 16) / 16;
          const col = el.color || '#ea580c';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              ${buildHandSvgInner(col, el.type === 'hand_right', s)}
              ${el.label ? `<text x="0" y="${Math.round(18 * s + 9)}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'hands_pair': {
          const s = (el.radius || 15) / 16;
          const col = el.color || '#ea580c';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <g transform="translate(${-11 * s}, 0)">${buildHandSvgInner(col, false, s * 0.85)}</g>
              <g transform="translate(${11 * s}, 0)">${buildHandSvgInner(col, true, s * 0.85)}</g>
              ${el.label ? `<text x="0" y="${Math.round(18 * s + 9)}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'mat': {
          const w = el.width || 76;
          const h = el.height || 42;
          const col = el.color || '#0284c7';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="${col}" fill-opacity="0.22" stroke="${col}" stroke-width="2.2"/>
              <line x1="${-w / 6}" y1="${-h / 2 + 2}" x2="${-w / 6}" y2="${h / 2 - 2}" stroke="${col}" stroke-width="1.2" stroke-opacity="0.6"/>
              <line x1="${w / 6}" y1="${-h / 2 + 2}" x2="${w / 6}" y2="${h / 2 - 2}" stroke="${col}" stroke-width="1.2" stroke-opacity="0.6"/>
              ${el.label ? `<text x="0" y="4" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'hurdle': {
          const w = el.width || 52;
          const h = el.height || 18;
          const col = el.color || '#dc2626';
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <rect x="${-w / 2}" y="${-h / 2}" width="6" height="${h}" rx="2" fill="#334155"/>
              <rect x="${w / 2 - 6}" y="${-h / 2}" width="6" height="${h}" rx="2" fill="#334155"/>
              <rect x="${-w / 2 + 2}" y="-4" width="${w - 4}" height="8" rx="2" fill="${col}" stroke="#ffffff" stroke-width="1"/>
              <line x1="${-w / 4}" y1="-4" x2="${-w / 4 + 4}" y2="4" stroke="#ffffff" stroke-width="2.5"/>
              <line x1="0" y1="-4" x2="4" y2="4" stroke="#ffffff" stroke-width="2.5"/>
              <line x1="${w / 4 - 4}" y1="-4" x2="${w / 4}" y2="4" stroke="#ffffff" stroke-width="2.5"/>
              ${el.label ? `<text x="0" y="${h / 2 + 13}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'goal_gate': {
          const w = el.width || 64;
          const h = el.height || 28;
          const col = el.color || '#16a34a';
          const fx = el.flipX ? -1 : 1;
          const fy = el.flipY ? -1 : 1;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <g transform="scale(${fx}, ${fy})">
                <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="${col}" fill-opacity="0.1" stroke="${col}" stroke-width="1.2" stroke-dasharray="3,3"/>
                <path d="M ${-w / 2},${h / 2} L ${-w / 2},${-h / 2} L ${w / 2},${-h / 2} L ${w / 2},${h / 2}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
              ${el.label ? `<text x="0" y="${h / 2 + 13}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'zigzag_path': {
          const w = el.width || 160;
          const h = el.height || 40;
          const col = el.color || '#16a34a';
          const fx = el.flipX ? -1 : 1;
          const fy = el.flipY ? -1 : 1;
          const x0 = -w / 2;
          const seg = w / 4;
          const pts = `${x0},0 ${x0 + seg * 0.7},${-h / 2} ${x0 + seg * 1.8},${h / 2} ${x0 + seg * 2.9},${-h / 2} ${w / 2},0`;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              <g transform="scale(${fx}, ${fy})">
                <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.6" stroke-dasharray="5,3" stroke-linejoin="round" marker-end="url(#arrowMarker)"/>
              </g>
              ${el.label ? `<text x="0" y="${-h / 2 - 7}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'jump_arc': {
          const w = el.width || 90;
          const h = el.height || 34;
          const col = el.color || '#ea580c';
          const fx = el.flipX ? -1 : 1;
          const fy = el.flipY ? -1 : 1;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})">
              <g transform="scale(${fx}, ${fy})">
                <path d="M ${-w / 2},${h / 3} Q ${-w / 4},${-h} 0,${h / 3} Q ${w / 4},${-h} ${w / 2},${h / 3}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="5,3" marker-end="url(#arrowMarkerOrange)"/>
              </g>
              ${el.label ? `<text x="0" y="${-h / 2 - 4}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'star_target': {
          const r = el.radius || 16;
          const rInner = r * 0.45;
          const col = el.color || '#eab308';
          const starPts: string[] = [];
          for (let i = 0; i < 10; i++) {
            const rad = i % 2 === 0 ? r : rInner;
            const ang = (Math.PI / 5) * i - Math.PI / 2;
            starPts.push(`${(Math.cos(ang) * rad).toFixed(1)},${(Math.sin(ang) * rad).toFixed(1)}`);
          }
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <polygon points="${starPts.join(' ')}" fill="${col}" stroke="#ffffff" stroke-width="1.6"/>
              ${el.label ? `<text x="0" y="${r + 13}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'mini_square': {
          const r = el.radius || 15;
          const col = el.color || '#2563eb';
          const fx = el.flipX ? -1 : 1;
          const fy = el.flipY ? -1 : 1;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <g transform="scale(${fx}, ${fy})">
                <rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" rx="3.5" fill="${col}" fill-opacity="0.14" stroke="${col}" stroke-width="3.2"/>
              </g>
              ${el.label ? `<text x="0" y="4" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        case 'mini_triangle': {
          const r = el.radius || 16;
          const col = el.color || '#ea580c';
          const fx = el.flipX ? -1 : 1;
          const fy = el.flipY ? -1 : 1;
          const h = r * 1.1;
          const w = r * 1.15;
          const pts = `0,${(-h).toFixed(1)} ${w.toFixed(1)},${(h * 0.82).toFixed(1)} ${(-w).toFixed(1)},${(h * 0.82).toFixed(1)}`;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <g transform="scale(${fx}, ${fy})">
                <polygon points="${pts}" fill="${col}" fill-opacity="0.14" stroke="${col}" stroke-width="3.2" stroke-linejoin="round"/>
              </g>
              ${el.label ? `<text x="0" y="5" font-family="sans-serif" font-size="10" font-weight="bold" fill="${col}" text-anchor="middle">${escXml(el.label)}</text>` : ''}
            </g>
          `;
        }
        default:
          return '';
      }
    })
    .join('\n');

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="430" viewBox="0 0 640 430">
      <defs>
        <marker id="arrowMarker" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a"/>
        </marker>
        <marker id="arrowMarkerOrange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c"/>
        </marker>
        <pattern id="turfPattern2" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="30" height="60" fill="#000000" fill-opacity="0.08"/>
          <rect x="30" width="30" height="60" fill="#ffffff" fill-opacity="0.05"/>
        </pattern>
        <linearGradient id="woodGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#d97706" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#92400e" stop-opacity="0.95"/>
        </linearGradient>
        <filter id="dropShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.22"/>
        </filter>
      </defs>

      ${bgHtml}

      <!-- Header Title & Subtitle -->
      <text x="24" y="32" font-family="sans-serif" font-size="15" font-weight="bold" fill="${titleColor}">${escXml(title)}</text>
      <text x="616" y="32" font-family="sans-serif" font-size="12.5" font-weight="600" fill="${subtitleColor}" text-anchor="end">${escXml(subtitle)}</text>

      <!-- Elements -->
      ${elementsSvg}
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
}

/**
 * Formation Presets Factory
 */
export const formationStudioPresets: FormationPresetItem[] = [
  // 1. HÀNG DỌC (1, 2, 3, 4 Hàng Dọc)
  {
    id: 'p_1_hang_doc',
    name: '1 Hàng Dọc (Tập trung thẳng hàng)',
    category: 'Hàng Dọc',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 1 HÀNG DỌC',
    subtitle: 'Gióng hàng thẳng tắp',
    description: '1 hàng dọc duy nhất ở giữa sân, Cán sự đứng đầu hàng, GV đối diện quan sát.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 90, color: '#dc2626', label: 'GV' },
      { id: 'cs_1', type: 'cs', x: 320, y: 150, color: '#0284c7', label: 'CS' },
      { id: 'hs_1', type: 'hs', x: 320, y: 190, color: '#1e293b', label: '1' },
      { id: 'hs_2', type: 'hs', x: 320, y: 230, color: '#1e293b', label: '2' },
      { id: 'hs_3', type: 'hs', x: 320, y: 270, color: '#1e293b', label: '3' },
      { id: 'hs_4', type: 'hs', x: 320, y: 310, color: '#1e293b', label: '4' },
      { id: 'hs_5', type: 'hs', x: 320, y: 350, color: '#1e293b', label: '5' },
      { id: 'hs_6', type: 'hs', x: 320, y: 390, color: '#1e293b', label: '6' },
      { id: 'txt_1', type: 'text', x: 320, y: 415, color: '#475569', label: 'Cự ly 1 cánh tay - Nhìn gáy bạn trước', fontSize: 11 }
    ]
  },
  {
    id: 'p_2_hang_doc',
    name: '2 Hàng Dọc (Song song đều đặn)',
    category: 'Hàng Dọc',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 2 HÀNG DỌC',
    subtitle: '2 Tổ song song',
    description: '2 hàng dọc đối xứng 2 bên, khoảng cách giữa 2 hàng 1.5 - 2m.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 85, color: '#dc2626', label: 'GV' },
      { id: 'tt_1', type: 'tt', x: 250, y: 145, color: '#ea580c', label: 'T1' },
      { id: 'tt_2', type: 'tt', x: 390, y: 145, color: '#ea580c', label: 'T2' },
      { id: 'hs_1', type: 'hs', x: 250, y: 185, color: '#1e293b', label: '' },
      { id: 'hs_2', type: 'hs', x: 250, y: 225, color: '#1e293b', label: '' },
      { id: 'hs_3', type: 'hs', x: 250, y: 265, color: '#1e293b', label: '' },
      { id: 'hs_4', type: 'hs', x: 250, y: 305, color: '#1e293b', label: '' },
      { id: 'hs_5', type: 'hs', x: 250, y: 345, color: '#1e293b', label: '' },
      { id: 'hs_6', type: 'hs', x: 390, y: 185, color: '#1e293b', label: '' },
      { id: 'hs_7', type: 'hs', x: 390, y: 225, color: '#1e293b', label: '' },
      { id: 'hs_8', type: 'hs', x: 390, y: 265, color: '#1e293b', label: '' },
      { id: 'hs_9', type: 'hs', x: 390, y: 305, color: '#1e293b', label: '' },
      { id: 'hs_10', type: 'hs', x: 390, y: 345, color: '#1e293b', label: '' },
      { id: 'line_dist', type: 'line_dashed', x: 250, y: 380, endX: 390, endY: 380, color: '#2563eb', label: '↔ 1.5m' },
      { id: 'txt_1', type: 'text', x: 320, y: 415, color: '#475569', label: 'Đội hình 2 hàng dọc gióng hàng thẳng tắp', fontSize: 11 }
    ]
  },
  {
    id: 'p_3_hang_doc',
    name: '3 Hàng Dọc (3 Cột thẳng)',
    category: 'Hàng Dọc',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 3 HÀNG DỌC',
    subtitle: '3 Tổ tập trung',
    description: '3 hàng dọc thẳng tắp, GV đứng đối diện ở cự ly 4 - 6m.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 85, color: '#dc2626', label: 'GV' },
      { id: 'tt_1', type: 'tt', x: 190, y: 145, color: '#ea580c', label: 'T1' },
      { id: 'tt_2', type: 'tt', x: 320, y: 145, color: '#ea580c', label: 'T2' },
      { id: 'tt_3', type: 'tt', x: 450, y: 145, color: '#ea580c', label: 'T3' },
      { id: 'hs_1', type: 'hs', x: 190, y: 190, color: '#1e293b' },
      { id: 'hs_2', type: 'hs', x: 190, y: 235, color: '#1e293b' },
      { id: 'hs_3', type: 'hs', x: 190, y: 280, color: '#1e293b' },
      { id: 'hs_4', type: 'hs', x: 190, y: 325, color: '#1e293b' },
      { id: 'hs_5', type: 'hs', x: 190, y: 370, color: '#1e293b' },
      { id: 'hs_6', type: 'hs', x: 320, y: 190, color: '#1e293b' },
      { id: 'hs_7', type: 'hs', x: 320, y: 235, color: '#1e293b' },
      { id: 'hs_8', type: 'hs', x: 320, y: 280, color: '#1e293b' },
      { id: 'hs_9', type: 'hs', x: 320, y: 325, color: '#1e293b' },
      { id: 'hs_10', type: 'hs', x: 320, y: 370, color: '#1e293b' },
      { id: 'hs_11', type: 'hs', x: 450, y: 190, color: '#1e293b' },
      { id: 'hs_12', type: 'hs', x: 450, y: 235, color: '#1e293b' },
      { id: 'hs_13', type: 'hs', x: 450, y: 280, color: '#1e293b' },
      { id: 'hs_14', type: 'hs', x: 450, y: 325, color: '#1e293b' },
      { id: 'hs_15', type: 'hs', x: 450, y: 370, color: '#1e293b' },
      { id: 'txt_1', type: 'text', x: 320, y: 415, color: '#475569', label: 'Cự ly cách nhau 1 cánh tay, gióng hàng theo Tổ 1', fontSize: 11 }
    ]
  },
  {
    id: 'p_4_hang_doc',
    name: '4 Hàng Dọc (Chuẩn 4 Tổ lớp học)',
    category: 'Hàng Dọc',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 4 HÀNG DỌC TẬP TRUNG',
    subtitle: 'Đội hình hàng dọc cơ bản',
    description: '4 tổ xếp thành 4 hàng dọc thẳng tắp, chuẩn bị di chuyển hoặc xuống lớp.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 80, color: '#dc2626', label: 'GV' },
      { id: 'tt_1', type: 'tt', x: 140, y: 140, color: '#ea580c', label: 'T1' },
      { id: 'tt_2', type: 'tt', x: 260, y: 140, color: '#ea580c', label: 'T2' },
      { id: 'tt_3', type: 'tt', x: 380, y: 140, color: '#ea580c', label: 'T3' },
      { id: 'tt_4', type: 'tt', x: 500, y: 140, color: '#ea580c', label: 'T4' },
      { id: 'c1_1', type: 'hs', x: 140, y: 180, color: '#1e293b' },
      { id: 'c1_2', type: 'hs', x: 140, y: 220, color: '#1e293b' },
      { id: 'c1_3', type: 'hs', x: 140, y: 260, color: '#1e293b' },
      { id: 'c1_4', type: 'hs', x: 140, y: 300, color: '#1e293b' },
      { id: 'c1_5', type: 'hs', x: 140, y: 340, color: '#1e293b' },
      { id: 'c1_6', type: 'hs', x: 140, y: 380, color: '#1e293b' },
      { id: 'c2_1', type: 'hs', x: 260, y: 180, color: '#1e293b' },
      { id: 'c2_2', type: 'hs', x: 260, y: 220, color: '#1e293b' },
      { id: 'c2_3', type: 'hs', x: 260, y: 260, color: '#1e293b' },
      { id: 'c2_4', type: 'hs', x: 260, y: 300, color: '#1e293b' },
      { id: 'c2_5', type: 'hs', x: 260, y: 340, color: '#1e293b' },
      { id: 'c2_6', type: 'hs', x: 260, y: 380, color: '#1e293b' },
      { id: 'c3_1', type: 'hs', x: 380, y: 180, color: '#1e293b' },
      { id: 'c3_2', type: 'hs', x: 380, y: 220, color: '#1e293b' },
      { id: 'c3_3', type: 'hs', x: 380, y: 260, color: '#1e293b' },
      { id: 'c3_4', type: 'hs', x: 380, y: 300, color: '#1e293b' },
      { id: 'c3_5', type: 'hs', x: 380, y: 340, color: '#1e293b' },
      { id: 'c3_6', type: 'hs', x: 380, y: 380, color: '#1e293b' },
      { id: 'c4_1', type: 'hs', x: 500, y: 180, color: '#1e293b' },
      { id: 'c4_2', type: 'hs', x: 500, y: 220, color: '#1e293b' },
      { id: 'c4_3', type: 'hs', x: 500, y: 260, color: '#1e293b' },
      { id: 'c4_4', type: 'hs', x: 500, y: 300, color: '#1e293b' },
      { id: 'c4_5', type: 'hs', x: 500, y: 340, color: '#1e293b' },
      { id: 'c4_6', type: 'hs', x: 500, y: 380, color: '#1e293b' },
      { id: 'txt_1', type: 'text', x: 320, y: 415, color: '#475569', label: 'Đội hình 4 hàng dọc tập trung trật tự', fontSize: 11 }
    ]
  },

  // 2. HÀNG NGANG (1, 2, 3, 4 Hàng Ngang)
  {
    id: 'p_1_hang_ngang',
    name: '1 Hàng Ngang (Tập trung thẳng hàng)',
    category: 'Hàng Ngang',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 1 HÀNG NGANG',
    subtitle: '1 Hàng duy nhất',
    description: '1 hàng ngang dàn trải trước mặt giáo viên, thích hợp sửa lỗi kỹ thuật trực tiếp.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 110, color: '#dc2626', label: 'GV' },
      { id: 'cs_1', type: 'cs', x: 100, y: 230, color: '#0284c7', label: 'CS' },
      { id: 'h1', type: 'hs', x: 155, y: 230, color: '#1e293b' },
      { id: 'h2', type: 'hs', x: 210, y: 230, color: '#1e293b' },
      { id: 'h3', type: 'hs', x: 265, y: 230, color: '#1e293b' },
      { id: 'h4', type: 'hs', x: 320, y: 230, color: '#1e293b' },
      { id: 'h5', type: 'hs', x: 375, y: 230, color: '#1e293b' },
      { id: 'h6', type: 'hs', x: 430, y: 230, color: '#1e293b' },
      { id: 'h7', type: 'hs', x: 485, y: 230, color: '#1e293b' },
      { id: 'h8', type: 'hs', x: 540, y: 230, color: '#1e293b' },
      { id: 'line_dist', type: 'line_dashed', x: 210, y: 200, endX: 265, endY: 200, color: '#dc2626', label: '↔ 1 khuỷu tay' },
      { id: 'txt_1', type: 'text', x: 320, y: 340, color: '#475569', label: 'Đội hình 1 hàng ngang, cự ly hẹp chống tay vào hông gióng hàng', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_2_hang_ngang',
    name: '2 Hàng Ngang (So le hoặc thẳng hàng)',
    category: 'Hàng Ngang',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 2 HÀNG NGANG SO LE',
    subtitle: 'Quan sát rõ ràng',
    description: '2 hàng ngang đứng so le nhau giúp hàng sau không bị khuất tầm nhìn.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 95, color: '#dc2626', label: 'GV' },
      { id: 'r1_1', type: 'hs', x: 120, y: 190, color: '#0284c7' },
      { id: 'r1_2', type: 'hs', x: 200, y: 190, color: '#0284c7' },
      { id: 'r1_3', type: 'hs', x: 280, y: 190, color: '#0284c7' },
      { id: 'r1_4', type: 'hs', x: 360, y: 190, color: '#0284c7' },
      { id: 'r1_5', type: 'hs', x: 440, y: 190, color: '#0284c7' },
      { id: 'r1_6', type: 'hs', x: 520, y: 190, color: '#0284c7' },
      { id: 'r2_1', type: 'hs', x: 160, y: 270, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 240, y: 270, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 320, y: 270, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 400, y: 270, color: '#1e293b' },
      { id: 'r2_5', type: 'hs', x: 480, y: 270, color: '#1e293b' },
      { id: 'line_dist', type: 'line_dashed', x: 200, y: 165, endX: 280, endY: 165, color: '#ea580c', label: '↔ 1 sải tay' },
      { id: 'txt_1', type: 'text', x: 320, y: 370, color: '#475569', label: 'Hàng 2 đứng so le vào khe giữa các bạn hàng 1', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_3_hang_ngang',
    name: '3 Hàng Ngang (Tập luyện đồng loạt)',
    category: 'Hàng Ngang',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 3 HÀNG NGANG SO LE',
    subtitle: 'Đồng loạt theo nhịp',
    description: '3 hàng ngang giãn cách rộng 1 sải tay, thực hiện các bài tập phát triển chung.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 80, color: '#dc2626', label: 'GV' },
      { id: 'r1_1', type: 'hs', x: 130, y: 160, color: '#16a34a' },
      { id: 'r1_2', type: 'hs', x: 210, y: 160, color: '#16a34a' },
      { id: 'r1_3', type: 'hs', x: 290, y: 160, color: '#16a34a' },
      { id: 'r1_4', type: 'hs', x: 370, y: 160, color: '#16a34a' },
      { id: 'r1_5', type: 'hs', x: 450, y: 160, color: '#16a34a' },
      { id: 'r1_6', type: 'hs', x: 530, y: 160, color: '#16a34a' },
      { id: 'r2_1', type: 'hs', x: 170, y: 235, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 250, y: 235, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 330, y: 235, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 410, y: 235, color: '#1e293b' },
      { id: 'r2_5', type: 'hs', x: 490, y: 235, color: '#1e293b' },
      { id: 'r3_1', type: 'hs', x: 130, y: 310, color: '#16a34a' },
      { id: 'r3_2', type: 'hs', x: 210, y: 310, color: '#16a34a' },
      { id: 'r3_3', type: 'hs', x: 290, y: 310, color: '#16a34a' },
      { id: 'r3_4', type: 'hs', x: 370, y: 310, color: '#16a34a' },
      { id: 'r3_5', type: 'hs', x: 450, y: 310, color: '#16a34a' },
      { id: 'r3_6', type: 'hs', x: 530, y: 310, color: '#16a34a' },
      { id: 'txt_1', type: 'text', x: 320, y: 385, color: '#475569', label: 'Cả lớp tập đồng loạt theo nhịp đếm dứt khoát của GV', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_4_hang_ngang',
    name: '4 Hàng Ngang (Chuẩn Nhận Lớp / Khởi Động)',
    category: 'Hàng Ngang',
    title: 'SƠ ĐỒ: ĐỘI HÌNH 4 HÀNG NGANG SO LE',
    subtitle: 'Giãn cách 1 sải tay',
    description: '4 hàng ngang so le hoàn hảo, cự ly tiêu chuẩn môn Giáo Dục Thể Chất.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 75, color: '#dc2626', label: 'GV' },
      { id: 'cs_1', type: 'cs', x: 320, y: 125, color: '#0284c7', label: 'CS' },
      { id: 'r1_1', type: 'hs', x: 100, y: 175, color: '#0284c7' },
      { id: 'r1_2', type: 'hs', x: 190, y: 175, color: '#0284c7' },
      { id: 'r1_3', type: 'hs', x: 280, y: 175, color: '#0284c7' },
      { id: 'r1_4', type: 'hs', x: 370, y: 175, color: '#0284c7' },
      { id: 'r1_5', type: 'hs', x: 460, y: 175, color: '#0284c7' },
      { id: 'r1_6', type: 'hs', x: 540, y: 175, color: '#0284c7' },
      { id: 'r2_1', type: 'hs', x: 145, y: 230, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 235, y: 230, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 325, y: 230, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 415, y: 230, color: '#1e293b' },
      { id: 'r2_5', type: 'hs', x: 500, y: 230, color: '#1e293b' },
      { id: 'r3_1', type: 'hs', x: 100, y: 285, color: '#0284c7' },
      { id: 'r3_2', type: 'hs', x: 190, y: 285, color: '#0284c7' },
      { id: 'r3_3', type: 'hs', x: 280, y: 285, color: '#0284c7' },
      { id: 'r3_4', type: 'hs', x: 370, y: 285, color: '#0284c7' },
      { id: 'r3_5', type: 'hs', x: 460, y: 285, color: '#0284c7' },
      { id: 'r3_6', type: 'hs', x: 540, y: 285, color: '#0284c7' },
      { id: 'r4_1', type: 'hs', x: 145, y: 340, color: '#1e293b' },
      { id: 'r4_2', type: 'hs', x: 235, y: 340, color: '#1e293b' },
      { id: 'r4_3', type: 'hs', x: 325, y: 340, color: '#1e293b' },
      { id: 'r4_4', type: 'hs', x: 415, y: 340, color: '#1e293b' },
      { id: 'r4_5', type: 'hs', x: 500, y: 340, color: '#1e293b' },
      { id: 'line_dist', type: 'line_dashed', x: 190, y: 155, endX: 280, endY: 155, color: '#dc2626', label: '↔ 1 sải tay' },
      { id: 'txt_1', type: 'text', x: 320, y: 405, color: '#475569', label: 'Đội hình 4 hàng ngang giãn cách so le, xoay các khớp an toàn', fontSize: 11.5 }
    ]
  },

  // 3. TẬP LUYỆN THEO TỔ / NHÓM
  {
    id: 'p_to_nhom_4_goc',
    name: 'Đội Hình Tập Luyện Theo Tổ / Nhóm (4 Góc Sân)',
    category: 'Tổ / Nhóm',
    title: 'SƠ ĐỒ: TẬP LUYỆN THEO TỔ TẠI 4 KHU VỰC SÂN',
    subtitle: 'Tổ trưởng chỉ huy',
    description: '4 tổ phân bổ về 4 góc sân bãi, có tổ trưởng hô nhịp và GV bao quát di chuyển sửa sai.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 230, color: '#dc2626', label: 'GV Bao Quát' },
      // Tổ 1 (Khu A - Trên Trái)
      { id: 'zone_1', type: 'shape_rect', x: 160, y: 135, width: 230, height: 115, color: '#3b82f6', label: 'TỔ 1 (Khu Vực A)' },
      { id: 'tt_1', type: 'tt', x: 75, y: 135, color: '#ea580c', label: 'TT1' },
      { id: 't1_1', type: 'hs', x: 115, y: 120, color: '#1e293b' },
      { id: 't1_2', type: 'hs', x: 150, y: 120, color: '#1e293b' },
      { id: 't1_3', type: 'hs', x: 185, y: 120, color: '#1e293b' },
      { id: 't1_4', type: 'hs', x: 220, y: 120, color: '#1e293b' },
      { id: 't1_5', type: 'hs', x: 135, y: 155, color: '#1e293b' },
      { id: 't1_6', type: 'hs', x: 170, y: 155, color: '#1e293b' },
      { id: 't1_7', type: 'hs', x: 205, y: 155, color: '#1e293b' },
      // Tổ 2 (Khu B - Trên Phải)
      { id: 'zone_2', type: 'shape_rect', x: 480, y: 135, width: 230, height: 115, color: '#3b82f6', label: 'TỔ 2 (Khu Vực B)' },
      { id: 'tt_2', type: 'tt', x: 395, y: 135, color: '#ea580c', label: 'TT2' },
      { id: 't2_1', type: 'hs', x: 435, y: 120, color: '#1e293b' },
      { id: 't2_2', type: 'hs', x: 470, y: 120, color: '#1e293b' },
      { id: 't2_3', type: 'hs', x: 505, y: 120, color: '#1e293b' },
      { id: 't2_4', type: 'hs', x: 540, y: 120, color: '#1e293b' },
      { id: 't2_5', type: 'hs', x: 455, y: 155, color: '#1e293b' },
      { id: 't2_6', type: 'hs', x: 490, y: 155, color: '#1e293b' },
      { id: 't2_7', type: 'hs', x: 525, y: 155, color: '#1e293b' },
      // Tổ 3 (Khu C - Dưới Trái)
      { id: 'zone_3', type: 'shape_rect', x: 160, y: 325, width: 230, height: 115, color: '#16a34a', label: 'TỔ 3 (Khu Vực C)' },
      { id: 'tt_3', type: 'tt', x: 75, y: 325, color: '#ea580c', label: 'TT3' },
      { id: 't3_1', type: 'hs', x: 115, y: 310, color: '#1e293b' },
      { id: 't3_2', type: 'hs', x: 150, y: 310, color: '#1e293b' },
      { id: 't3_3', type: 'hs', x: 185, y: 310, color: '#1e293b' },
      { id: 't3_4', type: 'hs', x: 220, y: 310, color: '#1e293b' },
      { id: 't3_5', type: 'hs', x: 135, y: 345, color: '#1e293b' },
      { id: 't3_6', type: 'hs', x: 170, y: 345, color: '#1e293b' },
      { id: 't3_7', type: 'hs', x: 205, y: 345, color: '#1e293b' },
      // Tổ 4 (Khu D - Dưới Phải)
      { id: 'zone_4', type: 'shape_rect', x: 480, y: 325, width: 230, height: 115, color: '#16a34a', label: 'TỔ 4 (Khu Vực D)' },
      { id: 'tt_4', type: 'tt', x: 395, y: 325, color: '#ea580c', label: 'TT4' },
      { id: 't4_1', type: 'hs', x: 435, y: 310, color: '#1e293b' },
      { id: 't4_2', type: 'hs', x: 470, y: 310, color: '#1e293b' },
      { id: 't4_3', type: 'hs', x: 505, y: 310, color: '#1e293b' },
      { id: 't4_4', type: 'hs', x: 540, y: 310, color: '#1e293b' },
      { id: 't4_5', type: 'hs', x: 455, y: 345, color: '#1e293b' },
      { id: 't4_6', type: 'hs', x: 490, y: 345, color: '#1e293b' },
      { id: 't4_7', type: 'hs', x: 525, y: 345, color: '#1e293b' },
      { id: 'txt_1', type: 'text', x: 320, y: 415, color: '#475569', label: 'Từng tổ chủ động luyện tập - Tổ trưởng đếm nhịp - GV nhắc nhở sửa sai', fontSize: 11.5 }
    ]
  },

  // 4. TẬP CÁ NHÂN & CẶP ĐÔI
  {
    id: 'p_tap_ca_nhan',
    name: 'Đội Hình Tập Cá Nhân (Tự Luyện Độc Lập)',
    category: 'Cá Nhân & Cặp Đôi',
    title: 'SƠ ĐỒ: ĐỘI HÌNH TẬP LUYỆN CÁ NHÂN',
    subtitle: 'Tự giác hoàn thiện động tác',
    description: 'Học sinh phân tán đều trên sân bãi, mỗi em có không gian riêng để tự kiểm soát tư thế.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 80, color: '#dc2626', label: 'GV Thị Phạm' },
      { id: 'c_1', type: 'hs', x: 140, y: 155, color: '#2563eb', label: '1' },
      { id: 'c_2', type: 'hs', x: 320, y: 155, color: '#2563eb', label: '2' },
      { id: 'c_3', type: 'hs', x: 500, y: 155, color: '#2563eb', label: '3' },
      { id: 'c_4', type: 'hs', x: 230, y: 235, color: '#16a34a', label: '4' },
      { id: 'c_5', type: 'hs', x: 410, y: 235, color: '#16a34a', label: '5' },
      { id: 'c_6', type: 'hs', x: 140, y: 315, color: '#ea580c', label: '6' },
      { id: 'c_7', type: 'hs', x: 320, y: 315, color: '#ea580c', label: '7' },
      { id: 'c_8', type: 'hs', x: 500, y: 315, color: '#ea580c', label: '8' },
      { id: 'h_1', type: 'hoop', x: 320, y: 155, color: '#06b6d4', radius: 24 },
      { id: 'h_2', type: 'hoop', x: 230, y: 235, color: '#06b6d4', radius: 24 },
      { id: 'h_3', type: 'hoop', x: 410, y: 235, color: '#06b6d4', radius: 24 },
      { id: 'txt_1', type: 'text', x: 320, y: 395, color: '#475569', label: 'Mỗi học sinh tập trung thực hiện bài tập trong không gian riêng', fontSize: 12 }
    ]
  },
  {
    id: 'p_tap_cap_doi',
    name: 'Đội Hình Tập Cặp Đôi (Đối Diện Sửa Sai)',
    category: 'Cá Nhân & Cặp Đôi',
    title: 'SƠ ĐỒ: ĐỘI HÌNH TẬP LUYỆN CẶP ĐÔI',
    subtitle: 'Hỗ trợ nhau sửa tư thế',
    description: 'Từng đôi bạn đối diện nhau: 1 bạn làm động tác, 1 bạn quan sát đếm nhịp và sửa sai.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 75, color: '#dc2626', label: 'GV Quan Sát & Sửa Lỗi' },
      // Hàng 1 cặp đôi
      { id: 'p1_a', type: 'hs', x: 100, y: 160, color: '#2563eb', label: 'A' },
      { id: 'arr1', type: 'arrow_straight', x: 125, y: 160, endX: 165, endY: 160, color: '#dc2626', label: '↔' },
      { id: 'p1_b', type: 'hs', x: 190, y: 160, color: '#16a34a', label: 'B' },

      { id: 'p2_a', type: 'hs', x: 275, y: 160, color: '#2563eb', label: 'A' },
      { id: 'arr2', type: 'arrow_straight', x: 300, y: 160, endX: 340, endY: 160, color: '#dc2626', label: '↔' },
      { id: 'p2_b', type: 'hs', x: 365, y: 160, color: '#16a34a', label: 'B' },

      { id: 'p3_a', type: 'hs', x: 450, y: 160, color: '#2563eb', label: 'A' },
      { id: 'arr3', type: 'arrow_straight', x: 475, y: 160, endX: 515, endY: 160, color: '#dc2626', label: '↔' },
      { id: 'p3_b', type: 'hs', x: 540, y: 160, color: '#16a34a', label: 'B' },

      // Hàng 2 cặp đôi
      { id: 'p4_a', type: 'hs', x: 100, y: 250, color: '#2563eb', label: 'A' },
      { id: 'arr4', type: 'arrow_straight', x: 125, y: 250, endX: 165, endY: 250, color: '#dc2626', label: '↔' },
      { id: 'p4_b', type: 'hs', x: 190, y: 250, color: '#16a34a', label: 'B' },

      { id: 'p5_a', type: 'hs', x: 275, y: 250, color: '#2563eb', label: 'A' },
      { id: 'arr5', type: 'arrow_straight', x: 300, y: 250, endX: 340, endY: 250, color: '#dc2626', label: '↔' },
      { id: 'p5_b', type: 'hs', x: 365, y: 250, color: '#16a34a', label: 'B' },

      { id: 'p6_a', type: 'hs', x: 450, y: 250, color: '#2563eb', label: 'A' },
      { id: 'arr6', type: 'arrow_straight', x: 475, y: 250, endX: 515, endY: 250, color: '#dc2626', label: '↔' },
      { id: 'p6_b', type: 'hs', x: 540, y: 250, color: '#16a34a', label: 'B' },

      // Hàng 3 cặp đôi
      { id: 'p7_a', type: 'hs', x: 100, y: 340, color: '#2563eb', label: 'A' },
      { id: 'arr7', type: 'arrow_straight', x: 125, y: 340, endX: 165, endY: 340, color: '#dc2626', label: '↔' },
      { id: 'p7_b', type: 'hs', x: 190, y: 340, color: '#16a34a', label: 'B' },

      { id: 'p8_a', type: 'hs', x: 275, y: 340, color: '#2563eb', label: 'A' },
      { id: 'arr8', type: 'arrow_straight', x: 300, y: 340, endX: 340, endY: 340, color: '#dc2626', label: '↔' },
      { id: 'p8_b', type: 'hs', x: 365, y: 340, color: '#16a34a', label: 'B' },

      { id: 'p9_a', type: 'hs', x: 450, y: 340, color: '#2563eb', label: 'A' },
      { id: 'arr9', type: 'arrow_straight', x: 475, y: 340, endX: 515, endY: 340, color: '#dc2626', label: '↔' },
      { id: 'p9_b', type: 'hs', x: 540, y: 340, color: '#16a34a', label: 'B' },

      { id: 'txt_1', type: 'text', x: 320, y: 405, color: '#475569', label: 'Bạn A thực hiện động tác - Bạn B đếm nhịp và nhận xét, sau đó đổi vai', fontSize: 11.5 }
    ]
  },

  // 5. TRÒ CHƠI TIẾP SỨC & TRÒ CHƠI THEO VÒNG TRÒN
  {
    id: 'p_tro_choi_tiep_suc',
    name: 'Sơ Đồ Trò Chơi Tiếp Sức (4 Làn Chạy + Cọc Tiêu)',
    category: 'Trò Chơi',
    title: 'SƠ ĐỒ TRÒ CHƠI TIẾP SỨC',
    subtitle: '4 Làn chạy vòng cọc cờ',
    description: '4 tổ đứng sau vạch xuất phát, học sinh chạy vòng qua cọc tiêu quay về tiếp sức.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 75, color: '#dc2626', label: 'GV / Trọng Tài' },
      // Vạch xuất phát
      { id: 'start_line', type: 'line_solid', x: 120, y: 130, endX: 120, endY: 360, color: '#dc2626', label: 'Vạch Xuất Phát' },
      // Làn 1
      { id: 'q1_1', type: 'hs', x: 70, y: 160, color: '#1e293b' },
      { id: 'q1_2', type: 'hs', x: 95, y: 160, color: '#1e293b' },
      { id: 'r1_run', type: 'hs', x: 260, y: 150, color: '#e11d48', label: 'Chạy' },
      { id: 'arr_1', type: 'arrow_straight', x: 135, y: 160, endX: 470, endY: 160, color: '#16a34a', label: 'Đi thẳng' },
      { id: 'cone_1', type: 'cone', x: 530, y: 160, color: '#ea580c', label: 'Cọc 1' },
      { id: 'arr_1b', type: 'arrow_curved', x: 530, y: 145, endX: 530, endY: 175, color: '#ea580c', label: 'Vòng qua cọc' },
      // Làn 2
      { id: 'q2_1', type: 'hs', x: 70, y: 220, color: '#1e293b' },
      { id: 'q2_2', type: 'hs', x: 95, y: 220, color: '#1e293b' },
      { id: 'arr_2', type: 'arrow_straight', x: 135, y: 220, endX: 470, endY: 220, color: '#16a34a' },
      { id: 'cone_2', type: 'cone', x: 530, y: 220, color: '#ea580c', label: 'Cọc 2' },
      // Làn 3
      { id: 'q3_1', type: 'hs', x: 70, y: 280, color: '#1e293b' },
      { id: 'q3_2', type: 'hs', x: 95, y: 280, color: '#1e293b' },
      { id: 'arr_3', type: 'arrow_straight', x: 135, y: 280, endX: 470, endY: 280, color: '#16a34a' },
      { id: 'cone_3', type: 'cone', x: 530, y: 280, color: '#ea580c', label: 'Cọc 3' },
      // Làn 4
      { id: 'q4_1', type: 'hs', x: 70, y: 340, color: '#1e293b' },
      { id: 'q4_2', type: 'hs', x: 95, y: 340, color: '#1e293b' },
      { id: 'arr_4', type: 'arrow_straight', x: 135, y: 340, endX: 470, endY: 340, color: '#16a34a' },
      { id: 'cone_4', type: 'cone', x: 530, y: 340, color: '#ea580c', label: 'Cọc 4' },
      { id: 'flag_end', type: 'flag', x: 530, y: 110, color: '#dc2626', label: 'Cự ly 10m' },
      { id: 'txt_1', type: 'text', x: 320, y: 405, color: '#475569', label: 'Chạy nhanh vòng qua cọc mốc và chạm tay/chuyền gậy cho bạn tiếp theo', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_tro_choi_vong_tron',
    name: 'Sơ Đồ Trò Chơi Theo Vòng Tròn (GV / Bóng Trung Tâm)',
    category: 'Trò Chơi',
    title: 'SƠ ĐỒ TRÒ CHƠI THEO VÒNG TRÒN',
    subtitle: 'Vận động vòng tròn',
    description: 'Học sinh nắm tay tạo thành vòng tròn lớn, GV hoặc bóng/cờ đặt ở tâm vòng tròn.',
    elements: [
      { id: 'center_gv', type: 'gv', x: 320, y: 230, color: '#dc2626', label: 'GV / Tâm' },
      { id: 'ball_center', type: 'ball', x: 320, y: 200, color: '#ea580c', label: 'Bóng / Cờ' },
      { id: 'circle_path', type: 'shape_circle', x: 320, y: 230, radius: 120, color: '#3b82f6', label: '' },
      // 12 Học sinh xếp quanh vòng tròn
      { id: 'c_01', type: 'hs', x: 320, y: 110, color: '#2563eb', label: '1' },
      { id: 'c_02', type: 'hs', x: 380, y: 125, color: '#2563eb', label: '2' },
      { id: 'c_03', type: 'hs', x: 425, y: 170, color: '#2563eb', label: '3' },
      { id: 'c_04', type: 'hs', x: 440, y: 230, color: '#2563eb', label: '4' },
      { id: 'c_05', type: 'hs', x: 425, y: 290, color: '#2563eb', label: '5' },
      { id: 'c_06', type: 'hs', x: 380, y: 335, color: '#2563eb', label: '6' },
      { id: 'c_07', type: 'hs', x: 320, y: 350, color: '#2563eb', label: '7' },
      { id: 'c_08', type: 'hs', x: 260, y: 335, color: '#2563eb', label: '8' },
      { id: 'c_09', type: 'hs', x: 215, y: 290, color: '#2563eb', label: '9' },
      { id: 'c_10', type: 'hs', x: 200, y: 230, color: '#2563eb', label: '10' },
      { id: 'c_11', type: 'hs', x: 215, y: 170, color: '#2563eb', label: '11' },
      { id: 'c_12', type: 'hs', x: 260, y: 125, color: '#2563eb', label: '12' },
      // Mũi tên chiều chạy
      { id: 'arr_circ', type: 'arrow_curved', x: 350, y: 95, endX: 410, endY: 115, color: '#16a34a', label: 'Chiều quay' },
      { id: 'txt_1', type: 'text', x: 320, y: 410, color: '#475569', label: 'Cả lớp di chuyển nhịp nhàng quanh vòng tròn theo hiệu lệnh còi', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_tro_choi_chan_tay_kheo_khoe',
    name: 'Trò Chơi Chân Tay Khéo Khỏe (Lưới Ô 3×3 + Tay & Chân)',
    category: 'Trò Chơi',
    title: 'SƠ ĐỒ TRÒ CHƠI: CHÂN TAY KHÉO KHỎE',
    subtitle: 'Lưới ô 3×3 · Đặt đúng tay & chân',
    description: '2 đội xếp hàng sau vạch xuất phát, di chuyển qua lưới ô vuông 3×3 đặt đúng bàn tay và bàn chân theo ký hiệu rồi về đích.',
    elements: [
      { id: 'gv_ct', type: 'gv', x: 320, y: 78, color: '#dc2626', label: 'GV / Trọng Tài' },
      { id: 'xp_ct', type: 'line_solid', x: 140, y: 120, endX: 140, endY: 365, color: '#dc2626', label: 'Vạch XP' },
      { id: 'lane_sep', type: 'parallel_lines', x: 345, y: 245, orientation: 'horizontal', lineCount: 3, lineSpacing: 115, lineLength: 380, lineStyle: 'dashed', color: '#94a3b8' },
      // Đội 1
      { id: 'd1_1', type: 'hs', x: 75, y: 185, color: '#2563eb', label: '1' },
      { id: 'd1_2', type: 'hs', x: 105, y: 185, color: '#2563eb', label: '2' },
      { id: 'grid_1', type: 'grid_box', x: 265, y: 185, rows: 3, cols: 3, cellSize: 32, cellMode: 'hand_foot', color: '#2563eb', label: 'Ô 3×3 (Đội 1)' },
      { id: 'arr_ct1', type: 'jump_arc', x: 395, y: 185, width: 95, height: 32, color: '#ea580c', label: 'Bật nhảy' },
      { id: 'hand_ct1', type: 'hands_pair', x: 472, y: 185, radius: 13, color: '#ea580c' },
      { id: 'flag_ct1', type: 'flag', x: 545, y: 185, color: '#2563eb', label: 'Đích 1' },
      // Đội 2
      { id: 'd2_1', type: 'hs', x: 75, y: 305, color: '#16a34a', label: '1' },
      { id: 'd2_2', type: 'hs', x: 105, y: 305, color: '#16a34a', label: '2' },
      { id: 'grid_2', type: 'grid_box', x: 265, y: 305, rows: 3, cols: 3, cellSize: 32, cellMode: 'hand_foot', color: '#16a34a', label: 'Ô 3×3 (Đội 2)' },
      { id: 'arr_ct2', type: 'jump_arc', x: 395, y: 305, width: 95, height: 32, color: '#ea580c', label: 'Bật nhảy' },
      { id: 'feet_ct2', type: 'feet_pair', x: 472, y: 305, radius: 13, color: '#16a34a' },
      { id: 'flag_ct2', type: 'flag', x: 545, y: 305, color: '#16a34a', label: 'Đích 2' },
      { id: 'txt_ct', type: 'text', x: 320, y: 405, color: '#475569', label: 'Đặt đúng bàn tay/bàn chân vào từng ô vuông 3×3, chạm cờ đích rồi chạy về tiếp sức', fontSize: 11 }
    ]
  },
  {
    id: 'p_tro_choi_nhay_o_song_song',
    name: 'Trò Chơi Nhảy Ô & Đường Song Song (Lưới Ô Số + Rào)',
    category: 'Trò Chơi',
    title: 'SƠ ĐỒ TRÒ CHƠI: NHẢY Ô TIẾP SỨC',
    subtitle: 'Lưới ô vuông đánh số & làn song song',
    description: 'Các làn kẻ song song với dãy ô vuông đánh số 1–5 và vật cản rào thấp cho trò chơi bật nhảy tiếp sức.',
    elements: [
      { id: 'gv_no', type: 'gv', x: 320, y: 76, color: '#dc2626', label: 'GV Điều Hành' },
      { id: 'xp_no', type: 'line_solid', x: 130, y: 120, endX: 130, endY: 365, color: '#dc2626', label: 'Vạch XP' },
      { id: 'pl_no', type: 'parallel_lines', x: 355, y: 245, orientation: 'horizontal', lineCount: 4, lineSpacing: 76, lineLength: 420, lineStyle: 'solid', color: '#0284c7', label: 'Các làn song song' },
      // Làn 1
      { id: 'no_1a', type: 'hs', x: 75, y: 168, color: '#1e293b' },
      { id: 'no_1b', type: 'hs', x: 102, y: 168, color: '#1e293b' },
      { id: 'g_no1', type: 'grid_box', x: 255, y: 168, rows: 1, cols: 5, cellSize: 32, cellMode: 'numbers', color: '#2563eb' },
      { id: 'hur_1', type: 'hurdle', x: 400, y: 168, width: 44, height: 16, rotation: 90, color: '#dc2626' },
      { id: 'mat_1', type: 'mat', x: 470, y: 168, width: 54, height: 32, color: '#0284c7', label: 'Đệm' },
      { id: 'cone_no1', type: 'cone', x: 540, y: 168, color: '#ea580c' },
      // Làn 2
      { id: 'no_2a', type: 'hs', x: 75, y: 244, color: '#1e293b' },
      { id: 'no_2b', type: 'hs', x: 102, y: 244, color: '#1e293b' },
      { id: 'g_no2', type: 'grid_box', x: 255, y: 244, rows: 1, cols: 5, cellSize: 32, cellMode: 'numbers', color: '#16a34a' },
      { id: 'hur_2', type: 'hurdle', x: 400, y: 244, width: 44, height: 16, rotation: 90, color: '#dc2626' },
      { id: 'mat_2', type: 'mat', x: 470, y: 244, width: 54, height: 32, color: '#0284c7', label: 'Đệm' },
      { id: 'cone_no2', type: 'cone', x: 540, y: 244, color: '#ea580c' },
      // Làn 3
      { id: 'no_3a', type: 'hs', x: 75, y: 320, color: '#1e293b' },
      { id: 'no_3b', type: 'hs', x: 102, y: 320, color: '#1e293b' },
      { id: 'g_no3', type: 'grid_box', x: 255, y: 320, rows: 1, cols: 5, cellSize: 32, cellMode: 'numbers', color: '#9333ea' },
      { id: 'hur_3', type: 'hurdle', x: 400, y: 320, width: 44, height: 16, rotation: 90, color: '#dc2626' },
      { id: 'mat_3', type: 'mat', x: 470, y: 320, width: 54, height: 32, color: '#0284c7', label: 'Đệm' },
      { id: 'cone_no3', type: 'cone', x: 540, y: 320, color: '#ea580c' },
      { id: 'txt_no', type: 'text', x: 320, y: 405, color: '#475569', label: 'Nhảy qua dãy ô số 1–5, bật qua rào tiếp đất đệm, vòng qua cọc mốc về tiếp sức', fontSize: 11 }
    ]
  },

  // 6. QUY TRÌNH TIẾT HỌC (Nhận Lớp, Quan Sát Tranh, Hồi Tĩnh)
  {
    id: 'p_nhan_lop_cu_ly_hep',
    name: 'Đội Hình Nhận Lớp (4 Hàng Ngang Cự Ly Hẹp)',
    category: 'Quy Trình Tiết Học',
    title: 'SƠ ĐỒ: ĐỘI HÌNH NHẬN LỚP',
    subtitle: 'Cự ly hẹp điểm số báo cáo',
    description: 'Cán sự tập hợp lớp thành 4 hàng ngang cự ly hẹp, chỉnh đốn trang phục và báo cáo sĩ số cho GV.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 75, color: '#dc2626', label: 'GV' },
      { id: 'cs_1', type: 'cs', x: 320, y: 135, color: '#0284c7', label: 'CS Báo Cáo' },
      { id: 'r1_1', type: 'hs', x: 120, y: 195, color: '#1e293b' },
      { id: 'r1_2', type: 'hs', x: 185, y: 195, color: '#1e293b' },
      { id: 'r1_3', type: 'hs', x: 250, y: 195, color: '#1e293b' },
      { id: 'r1_4', type: 'hs', x: 315, y: 195, color: '#1e293b' },
      { id: 'r1_5', type: 'hs', x: 380, y: 195, color: '#1e293b' },
      { id: 'r1_6', type: 'hs', x: 445, y: 195, color: '#1e293b' },
      { id: 'r1_7', type: 'hs', x: 510, y: 195, color: '#1e293b' },

      { id: 'r2_1', type: 'hs', x: 120, y: 245, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 185, y: 245, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 250, y: 245, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 315, y: 245, color: '#1e293b' },
      { id: 'r2_5', type: 'hs', x: 380, y: 245, color: '#1e293b' },
      { id: 'r2_6', type: 'hs', x: 445, y: 245, color: '#1e293b' },
      { id: 'r2_7', type: 'hs', x: 510, y: 245, color: '#1e293b' },

      { id: 'r3_1', type: 'hs', x: 120, y: 295, color: '#1e293b' },
      { id: 'r3_2', type: 'hs', x: 185, y: 295, color: '#1e293b' },
      { id: 'r3_3', type: 'hs', x: 250, y: 295, color: '#1e293b' },
      { id: 'r3_4', type: 'hs', x: 315, y: 295, color: '#1e293b' },
      { id: 'r3_5', type: 'hs', x: 380, y: 295, color: '#1e293b' },
      { id: 'r3_6', type: 'hs', x: 445, y: 295, color: '#1e293b' },
      { id: 'r3_7', type: 'hs', x: 510, y: 295, color: '#1e293b' },

      { id: 'r4_1', type: 'hs', x: 120, y: 345, color: '#1e293b' },
      { id: 'r4_2', type: 'hs', x: 185, y: 345, color: '#1e293b' },
      { id: 'r4_3', type: 'hs', x: 250, y: 345, color: '#1e293b' },
      { id: 'r4_4', type: 'hs', x: 315, y: 345, color: '#1e293b' },
      { id: 'r4_5', type: 'hs', x: 380, y: 345, color: '#1e293b' },
      { id: 'r4_6', type: 'hs', x: 445, y: 345, color: '#1e293b' },
      { id: 'r4_7', type: 'hs', x: 510, y: 345, color: '#1e293b' },

      { id: 'txt_1', type: 'text', x: 320, y: 405, color: '#475569', label: 'Cán sự hô: Nghiêm! Chúc thầy (cô) khỏe! - Điểm số báo cáo', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_quan_sat_tranh_mau',
    name: 'Đội Hình Quan Sát Tranh SGK & GV Thị Phạm',
    category: 'Quy Trình Tiết Học',
    title: 'SƠ ĐỒ: ĐỘI HÌNH QUAN SÁT TRANH & THỊ PHẠM',
    subtitle: 'Tập trung chú ý',
    description: 'Tranh minh họa đặt trên giá + GV đứng thị phạm làm mẫu, HS ngồi/đứng theo hàng quan sát.',
    elements: [
      { id: 'sgk_board', type: 'sgk_board', x: 200, y: 95, width: 170, height: 60, color: '#d97706', label: 'Động tác vươn thở' },
      { id: 'gv_1', type: 'gv', x: 420, y: 95, color: '#dc2626', label: 'GV Làm Mẫu' },

      { id: 'r1_1', type: 'hs', x: 130, y: 195, color: '#1e293b' },
      { id: 'r1_2', type: 'hs', x: 200, y: 195, color: '#1e293b' },
      { id: 'r1_3', type: 'hs', x: 270, y: 195, color: '#1e293b' },
      { id: 'r1_4', type: 'hs', x: 340, y: 195, color: '#1e293b' },
      { id: 'r1_5', type: 'hs', x: 410, y: 195, color: '#1e293b' },
      { id: 'r1_6', type: 'hs', x: 480, y: 195, color: '#1e293b' },

      { id: 'r2_1', type: 'hs', x: 165, y: 250, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 235, y: 250, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 305, y: 250, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 375, y: 250, color: '#1e293b' },
      { id: 'r2_5', type: 'hs', x: 445, y: 250, color: '#1e293b' },

      { id: 'r3_1', type: 'hs', x: 130, y: 305, color: '#1e293b' },
      { id: 'r3_2', type: 'hs', x: 200, y: 305, color: '#1e293b' },
      { id: 'r3_3', type: 'hs', x: 270, y: 305, color: '#1e293b' },
      { id: 'r3_4', type: 'hs', x: 340, y: 305, color: '#1e293b' },
      { id: 'r3_5', type: 'hs', x: 410, y: 305, color: '#1e293b' },
      { id: 'r3_6', type: 'hs', x: 480, y: 305, color: '#1e293b' },

      { id: 'txt_1', type: 'text', x: 320, y: 380, color: '#475569', label: 'Học sinh chú ý lắng nghe phân tích và quan sát từng nhịp kỹ thuật mẫu', fontSize: 11.5 }
    ]
  },
  {
    id: 'p_hoi_tinh_xuong_lop',
    name: 'Đội Hình Hồi Tĩnh & Xuống Lớp (Thả Lỏng Toàn Thân)',
    category: 'Quy Trình Tiết Học',
    title: 'SƠ ĐỒ: ĐỘI HÌNH HỒI TĨNH & XUỐNG LỚP',
    subtitle: 'Thả lỏng sâu và nhận xét',
    description: 'Đội hình hàng ngang giãn cách thả lỏng các khớp, nghe nhận xét tiết học và giải tán trật tự.',
    elements: [
      { id: 'gv_1', type: 'gv', x: 320, y: 80, color: '#dc2626', label: 'GV Nhận Xét' },
      { id: 'r1_1', type: 'hs', x: 120, y: 170, color: '#0284c7' },
      { id: 'r1_2', type: 'hs', x: 220, y: 170, color: '#0284c7' },
      { id: 'r1_3', type: 'hs', x: 320, y: 170, color: '#0284c7' },
      { id: 'r1_4', type: 'hs', x: 420, y: 170, color: '#0284c7' },
      { id: 'r1_5', type: 'hs', x: 520, y: 170, color: '#0284c7' },

      { id: 'r2_1', type: 'hs', x: 170, y: 245, color: '#1e293b' },
      { id: 'r2_2', type: 'hs', x: 270, y: 245, color: '#1e293b' },
      { id: 'r2_3', type: 'hs', x: 370, y: 245, color: '#1e293b' },
      { id: 'r2_4', type: 'hs', x: 470, y: 245, color: '#1e293b' },

      { id: 'r3_1', type: 'hs', x: 120, y: 320, color: '#0284c7' },
      { id: 'r3_2', type: 'hs', x: 220, y: 320, color: '#0284c7' },
      { id: 'r3_3', type: 'hs', x: 320, y: 320, color: '#0284c7' },
      { id: 'r3_4', type: 'hs', x: 420, y: 320, color: '#0284c7' },
      { id: 'r3_5', type: 'hs', x: 520, y: 320, color: '#0284c7' },

      { id: 'txt_relax', type: 'text', x: 320, y: 375, color: '#0284c7', label: 'Rũ cổ tay, cổ chân - Cúi người thở sâu điều hòa nhịp tim', fontSize: 12 },
      { id: 'txt_1', type: 'text', x: 320, y: 410, color: '#475569', label: 'GV dặn dò bài tập về nhà - Cán sự hô "Giải tán!" - HS đồng thanh "Khỏe!"', fontSize: 11.5 }
    ]
  }
];

/**
 * Contextual Auto-Layout Generator
 * Parses contextual query and generates matching elements directly
 */
export function generateFormationByContext(query: string): {
  title: string;
  subtitle: string;
  elements: FormationElement[];
} {
  const q = (query || '').toLowerCase().trim();

  // 0. Chân tay khéo khỏe / Ô vuông 3x3
  if (q.includes('chân tay') || q.includes('khéo khỏe') || q.includes('3x3') || q.includes('3×3')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_tro_choi_chan_tay_kheo_khoe')!;
    return {
      title: `SƠ ĐỒ TRÒ CHƠI: ${query.toUpperCase()}`,
      subtitle: 'Lưới ô 3×3 · Bàn tay & bàn chân',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 0b. Nhảy ô / Đường song song / Vượt rào
  if (q.includes('nhảy ô') || q.includes('ô vuông') || q.includes('song song') || q.includes('vượt rào')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_tro_choi_nhay_o_song_song')!;
    return {
      title: `SƠ ĐỒ TRÒ CHƠI: ${query.toUpperCase()}`,
      subtitle: 'Ô vuông đánh số & làn song song',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 1. Chạy tiếp sức
  if (q.includes('tiếp sức') || q.includes('chạy tiếp sức') || q.includes('chuyền gậy') || q.includes('lò cò')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_tro_choi_tiep_suc')!;
    return {
      title: `SƠ ĐỒ: ${query.toUpperCase()}`,
      subtitle: 'Làn chạy tiếp sức & cọc mốc',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 2. Vòng tròn
  if (q.includes('vòng tròn') || q.includes('mèo đuổi chuột') || q.includes('thỏ') || q.includes('hang')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_tro_choi_vong_tron')!;
    return {
      title: `SƠ ĐỒ TRÒ CHƠI: ${query.toUpperCase()}`,
      subtitle: 'Đội hình vòng tròn trung tâm',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 3. Cặp đôi
  if (q.includes('cặp đôi') || q.includes('đối diện') || q.includes('sửa sai')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_tap_cap_doi')!;
    return {
      title: `SƠ ĐỒ: LUYỆN TẬP CẶP ĐÔI`,
      subtitle: query || 'Đối diện kiểm tra tư thế',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 4. Tổ nhóm / 4 tổ
  if (q.includes('tổ') || q.includes('nhóm') || q.includes('4 tổ') || q.includes('góc sân')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_to_nhom_4_goc')!;
    return {
      title: `SƠ ĐỒ: TẬP THEO TỔ NHÓM`,
      subtitle: query || '4 Khu vực quy định',
      elements: JSON.parse(JSON.stringify(preset.elements))
    };
  }

  // 5. 1 Hàng dọc
  if (q.includes('1 hàng dọc') || q.includes('một hàng dọc')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_1_hang_doc')!;
    return { title: 'SƠ ĐỒ: 1 HÀNG DỌC', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 6. 2 Hàng dọc
  if (q.includes('2 hàng dọc') || q.includes('hai hàng dọc')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_2_hang_doc')!;
    return { title: 'SƠ ĐỒ: 2 HÀNG DỌC', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 7. 3 Hàng dọc
  if (q.includes('3 hàng dọc') || q.includes('ba hàng dọc')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_3_hang_doc')!;
    return { title: 'SƠ ĐỒ: 3 HÀNG DỌC', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 8. 1 Hàng ngang
  if (q.includes('1 hàng ngang') || q.includes('một hàng ngang')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_1_hang_ngang')!;
    return { title: 'SƠ ĐỒ: 1 HÀNG NGANG', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 9. 2 Hàng ngang
  if (q.includes('2 hàng ngang') || q.includes('hai hàng ngang')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_2_hang_ngang')!;
    return { title: 'SƠ ĐỒ: 2 HÀNG NGANG', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 10. 3 Hàng ngang
  if (q.includes('3 hàng ngang') || q.includes('ba hàng ngang')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_3_hang_ngang')!;
    return { title: 'SƠ ĐỒ: 3 HÀNG NGANG', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 11. Hồi tĩnh / Thả lỏng
  if (q.includes('hồi tĩnh') || q.includes('thả lỏng') || q.includes('kết thúc') || q.includes('xuống lớp')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_hoi_tinh_xuong_lop')!;
    return { title: 'SƠ ĐỒ: HỒI TĨNH & XUỐNG LỚP', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // 12. Quan sát tranh / Mẫu
  if (q.includes('tranh') || q.includes('mẫu') || q.includes('thị phạm') || q.includes('quan sát')) {
    const preset = formationStudioPresets.find((p) => p.id === 'p_quan_sat_tranh_mau')!;
    return { title: 'SƠ ĐỒ: QUAN SÁT MẪU & TRANH', subtitle: query, elements: JSON.parse(JSON.stringify(preset.elements)) };
  }

  // Default: 4 Hàng ngang so le
  const preset = formationStudioPresets.find((p) => p.id === 'p_4_hang_ngang')!;
  return {
    title: query ? `SƠ ĐỒ: ${query.toUpperCase()}` : 'SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN',
    subtitle: 'Đội hình chuẩn sư phạm CV 5512',
    elements: JSON.parse(JSON.stringify(preset.elements))
  };
}
