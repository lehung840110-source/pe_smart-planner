/**
 * High-Definition Articulated 2D SGK Illustration Engine & 2K/4K PNG Rasterizer
 * Creates brand-new textbook-grade Physical Education (GDTC) illustrations from scratch
 * with pure SVG (ZERO <foreignObject>) and renders crisp 1600px / 2400px (2K) / 3200px (4K) PNGs.
 */

export type HdSceneMode = 'sequence_5' | 'single_pose' | 'pair_practice' | 'group_game';
export type HdLayoutStyle = 'poster_80x60' | 'compact_a4';
export type HdPosterTheme = 'sky_meadow' | 'mint_sport' | 'coral_energy';
export type HdGender = 'male' | 'female';
export type HdEquipment = 'none' | 'stick' | 'hoop' | 'ball' | 'rope' | 'cone' | 'flag';
export type HdMotionArc =
  | 'none'
  | 'arms_up'
  | 'arms_down'
  | 'arms_out'
  | 'clap'
  | 'side_left'
  | 'side_right'
  | 'bend_down'
  | 'hop_up'
  | 'run_forward'
  | 'throw_ball';
export type HdFacing = 'front' | 'profile_right' | 'profile_left';
export type HdPalmFacing = 'natural' | 'up' | 'down' | 'clap';

export interface HdPoseSpec {
  label: string;
  caption: string;
  customImageUrl?: string;
  facing?: HdFacing;
  gender?: HdGender;
  torsoTiltDeg?: number; // -35 (left) to +35 (right)
  torsoForwardBend?: number; // 0 (upright) to 1 (deep 90-deg forward bend)
  kneeSquat?: number; // 0 (straight) to 1 (deep squat)
  heelRaisePx?: number; // 0 (flat) to 18 (tiptoe / jump)
  headTiltDeg?: number; // -15 to +15
  // Arm angles in degrees: 0 = down, 90 = horizontal outward/forward, 175 = straight up, -30 = across chest/back
  leftUpperDeg: number;
  leftElbowDeg: number;
  rightUpperDeg: number;
  rightElbowDeg: number;
  // Leg angles in degrees: 0 = down, +25 = outward/forward, -15 = inward/back
  leftHipDeg: number;
  leftKneeDeg: number;
  rightHipDeg: number;
  rightKneeDeg: number;
  palmFacing?: HdPalmFacing;
  motionArc?: HdMotionArc;
  showEquipment?: boolean;
}

export interface HdSceneSpec {
  title: string;
  subtitle: string;
  grade: '1' | '2' | '3' | '4' | '5';
  sceneMode: HdSceneMode;
  layoutStyle?: HdLayoutStyle;
  posterTheme?: HdPosterTheme;
  gender: HdGender;
  equipment: HdEquipment;
  bottomBadge?: string;
  bottomNote: string;
  poses: HdPoseSpec[];
  gameType?: 'relay' | 'circle' | 'tug_of_war' | 'rabbit_hop' | 'ball_pass' | 'cone_run';
}

export interface HdPresetMeta {
  id: string;
  label: string;
  grade: '1' | '2' | '3' | '4' | '5';
  folder: 'kyThuat' | 'luyenTap' | 'troChoi' | 'troChoiKhoiDong' | 'khoiDong' | 'vanDung';
  sceneMode: HdSceneMode;
  equipment: HdEquipment;
}

const DEG = Math.PI / 180;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function wrapVietnameseLines(text: string, maxChars: number = 24, maxLines: number = 3): string[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) {
        // Put remaining words trimmed into last line
        break;
      }
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

/**
 * Computes joint positions in local figure space (hip at (0,0), upright head near -115, feet near +94)
 * then shifts vertically so lowest foot sole rests cleanly on `groundY - heelRaisePx`.
 */
function renderArticulatedStudent(
  cx: number,
  groundY: number,
  scale: number,
  pose: HdPoseSpec,
  sceneEquipment: HdEquipment,
  defaultGender: HdGender,
  uid: string
): string {
  const facing = pose.facing || 'front';
  const gender = pose.gender || defaultGender;
  const tiltDeg = clamp(pose.torsoTiltDeg ?? 0, -40, 40);
  const fwdBend = clamp(pose.torsoForwardBend ?? 0, 0, 1);
  const squat = clamp(pose.kneeSquat ?? 0, 0, 1);
  const heelRaise = clamp(pose.heelRaisePx ?? 0, 0, 26);
  const useEquip = pose.showEquipment !== false && sceneEquipment !== 'none';

  // Palette - Crisp Print-Ready Vietnamese Elementary PE Textbook Vector Style
  const inkOutline = '#24303f';
  const skin = '#ffe2c8';
  const skinShade = '#f2c19e';
  const hairMain = '#232834';
  const hairHighlight = '#4a5568';
  const shirtFill = '#ffffff';
  const shirtShade = '#e8eef7';
  const shirtBorder = '#2c3a4f';
  const collarBlue = '#2563eb';
  const pantsMain = '#2764d8';
  const pantsDark = '#1b47a3';
  const stripeWhite = '#f8fafc';
  const shoeMain = '#ffffff';
  const shoeSole = '#475569';
  const shoeAccent = '#84cc16';

  const torsoLen = 62;
  const upperArmLen = 30;
  const forearmLen = 27;
  const thighLen = 44;
  const shinLen = 44;

  // Pelvis / Hip joints
  const isProfile = facing !== 'front';
  const dir = facing === 'profile_left' ? -1 : 1;

  // Torso vector from (0,0) up to neck
  let neckX = 0;
  let neckY = -torsoLen;
  let torsoRotRad = tiltDeg * DEG;

  if (isProfile) {
    const leanRad = (tiltDeg + dir * fwdBend * 72) * DEG;
    neckX = Math.sin(leanRad) * torsoLen;
    neckY = -Math.cos(leanRad) * torsoLen;
    torsoRotRad = leanRad;
  } else {
    const verticalScale = Math.cos(fwdBend * 76 * DEG);
    neckX = Math.sin(tiltDeg * DEG) * torsoLen * Math.max(0.28, verticalScale);
    neckY = -Math.cos(tiltDeg * DEG) * torsoLen * Math.max(0.28, verticalScale);
  }

  // Shoulders perpendicular to torso direction
  const shoulderHalf = isProfile ? 6 : 20;
  const perpX = Math.cos(torsoRotRad);
  const perpY = Math.sin(torsoRotRad);

  const lShoulder = {
    x: neckX - shoulderHalf * perpX,
    y: neckY + 5 - shoulderHalf * perpY,
  };
  const rShoulder = {
    x: neckX + shoulderHalf * perpX,
    y: neckY + 5 + shoulderHalf * perpY,
  };

  // Compute Arm joints
  function computeArm(
    sx: number,
    sy: number,
    upperDeg: number,
    elbowDeg: number,
    side: -1 | 1 // -1 left (screen left), +1 right (screen right)
  ) {
    if (isProfile) {
      const uRad = upperDeg * DEG;
      const ex = sx + dir * Math.sin(uRad) * upperArmLen;
      const ey = sy + Math.cos(uRad) * upperArmLen;
      const fRad = (upperDeg + elbowDeg) * DEG;
      const wx = ex + dir * Math.sin(fRad) * forearmLen;
      const wy = ey + Math.cos(fRad) * forearmLen;
      return { sx, sy, ex, ey, wx, wy };
    } else {
      const uRad = upperDeg * DEG;
      const ex = sx + side * Math.sin(uRad) * upperArmLen;
      const ey = sy + Math.cos(uRad) * upperArmLen;
      const fRad = (upperDeg - elbowDeg) * DEG;
      const wx = ex + side * Math.sin(fRad) * forearmLen;
      const wy = ey + Math.cos(fRad) * forearmLen;
      return { sx, sy, ex, ey, wx, wy };
    }
  }

  const lArm = computeArm(lShoulder.x, lShoulder.y, pose.leftUpperDeg, pose.leftElbowDeg, -1);
  const rArm = computeArm(rShoulder.x, rShoulder.y, pose.rightUpperDeg, pose.rightElbowDeg, 1);

  // Compute Leg joints
  const hipHalf = isProfile ? 4 : 11;
  function computeLeg(
    hx: number,
    hy: number,
    hipDeg: number,
    kneeDeg: number,
    side: -1 | 1
  ) {
    if (isProfile) {
      const squatHip = squat * 52;
      const squatKnee = squat * 92;
      const hRad = (hipDeg + dir * squatHip) * DEG;
      const kx = hx + dir * Math.sin(hRad) * thighLen;
      const ky = hy + Math.cos(hRad) * thighLen;
      const sRad = (hipDeg + dir * squatHip - dir * (kneeDeg + squatKnee)) * DEG;
      const ax = kx + dir * Math.sin(sRad) * shinLen;
      const ay = ky + Math.cos(sRad) * shinLen;
      return { hx, hy, kx, ky, ax, ay };
    } else {
      // Squat opens knees outward slightly and drops height cleanly
      const effectiveHipDeg = hipDeg + squat * 34;
      const hRad = effectiveHipDeg * DEG;
      const kx = hx + side * Math.sin(hRad) * thighLen * (1 - squat * 0.14);
      const ky = hy + Math.cos(hRad) * thighLen * (1 - squat * 0.14);
      const effectiveKneeDeg = kneeDeg > 25 ? kneeDeg : -squat * 30;
      const sRad = (effectiveHipDeg - effectiveKneeDeg) * DEG;
      const ax = kx + side * Math.sin(sRad) * shinLen * (1 - squat * 0.08);
      const ay = ky + Math.cos(sRad) * shinLen * (1 - squat * 0.08);
      return { hx, hy, kx, ky, ax, ay };
    }
  }

  const lLeg = computeLeg(-hipHalf, 2, pose.leftHipDeg, pose.leftKneeDeg, -1);
  const rLeg = computeLeg(hipHalf, 2, pose.rightHipDeg, pose.rightKneeDeg, 1);

  // Ground alignment: shift so lowest ankle + shoe height (10) lands at groundY - heelRaise
  const maxAnkleY = Math.max(lLeg.ay, rLeg.ay);
  const footSoleLocalY = maxAnkleY + 10;
  const originX = cx;
  const originY = groundY - heelRaise - footSoleLocalY * scale;

  // Draw tapered anatomical limb helper
  function limbPath(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len);
    const ny = (dx / len);
    return `M ${(x1 + nx * w1).toFixed(1)} ${(y1 + ny * w1).toFixed(1)}
            L ${(x2 + nx * w2).toFixed(1)} ${(y2 + ny * w2).toFixed(1)}
            A ${w2} ${w2} 0 0 1 ${(x2 - nx * w2).toFixed(1)} ${(y2 - ny * w2).toFixed(1)}
            L ${(x1 - nx * w1).toFixed(1)} ${(y1 - ny * w1).toFixed(1)}
            A ${w1} ${w1} 0 0 1 ${(x1 + nx * w1).toFixed(1)} ${(y1 + ny * w1).toFixed(1)} Z`;
  }

  function drawLeg(leg: { hx: number; hy: number; kx: number; ky: number; ax: number; ay: number }, side: -1 | 1, isBackLeg: boolean) {
    const shade = isBackLeg ? pantsDark : pantsMain;
    const thigh = limbPath(leg.hx, leg.hy, leg.kx, leg.ky, 8.8, 7.0);
    const shin = limbPath(leg.kx, leg.ky, leg.ax, leg.ay, 6.8, 5.4);

    // Twin crisp white tracksuit side stripes (exact print-poster uniform signature)
    const stripeOff1 = isProfile ? -1.4 : side * 5.0;
    const stripeOff2 = isProfile ? 1.4 : side * 2.5;
    const stripe = `
      <path d="M ${(leg.hx + stripeOff1).toFixed(1)} ${(leg.hy + 3).toFixed(1)} L ${(leg.kx + stripeOff1 * 0.88).toFixed(1)} ${leg.ky.toFixed(1)} L ${(leg.ax + stripeOff1 * 0.72).toFixed(1)} ${(leg.ay - 2).toFixed(1)}" stroke="${stripeWhite}" stroke-width="1.45" stroke-linecap="round" fill="none" opacity="0.95"/>
      <path d="M ${(leg.hx + stripeOff2).toFixed(1)} ${(leg.hy + 3).toFixed(1)} L ${(leg.kx + stripeOff2 * 0.88).toFixed(1)} ${leg.ky.toFixed(1)} L ${(leg.ax + stripeOff2 * 0.72).toFixed(1)} ${(leg.ay - 2).toFixed(1)}" stroke="${stripeWhite}" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.85"/>
    `;

    // Crisp White & Lime-Green Athletic Sneaker
    const shoeDir = isProfile ? dir : side;
    const shoeWidth = isProfile ? 22 : 18.5;
    const sx0 = isProfile ? leg.ax - shoeDir * 5 : leg.ax - (side === -1 ? 12 : 6.5);
    const shoe = `
      <g>
        <path d="M ${sx0.toFixed(1)} ${(leg.ay + 1).toFixed(1)}
                 Q ${(sx0 + shoeWidth * 0.52).toFixed(1)} ${(leg.ay - 2.6).toFixed(1)} ${(sx0 + shoeWidth).toFixed(1)} ${(leg.ay + 4.2).toFixed(1)}
                 L ${(sx0 + shoeWidth).toFixed(1)} ${(leg.ay + 10.2).toFixed(1)}
                 Q ${(sx0 + shoeWidth * 0.5).toFixed(1)} ${(leg.ay + 11.2).toFixed(1)} ${sx0.toFixed(1)} ${(leg.ay + 10.2).toFixed(1)} Z"
              fill="${shoeMain}" stroke="${inkOutline}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M ${(sx0 + 1.5).toFixed(1)} ${(leg.ay + 4.8).toFixed(1)} Q ${(sx0 + shoeWidth * 0.52).toFixed(1)} ${(leg.ay + 2.4).toFixed(1)} ${(sx0 + shoeWidth - 1.5).toFixed(1)} ${(leg.ay + 6.2).toFixed(1)} L ${(sx0 + shoeWidth - 1).toFixed(1)} ${(leg.ay + 8.6).toFixed(1)} L ${(sx0 + 1.5).toFixed(1)} ${(leg.ay + 8.6).toFixed(1)} Z" fill="${shoeAccent}" opacity="0.92"/>
        <path d="M ${sx0.toFixed(1)} ${(leg.ay + 9.2).toFixed(1)} L ${(sx0 + shoeWidth).toFixed(1)} ${(leg.ay + 9.2).toFixed(1)}" stroke="${shoeSole}" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    `;

    return `
      <g>
        <path d="${thigh}" fill="${shade}" stroke="${inkOutline}" stroke-width="1.65" stroke-linejoin="round"/>
        <path d="${shin}" fill="${shade}" stroke="${inkOutline}" stroke-width="1.65" stroke-linejoin="round"/>
        <circle cx="${leg.kx.toFixed(1)}" cy="${leg.ky.toFixed(1)}" r="5.8" fill="${shade}"/>
        ${stripe}
        ${shoe}
      </g>
    `;
  }

  function drawArm(
    arm: { sx: number; sy: number; ex: number; ey: number; wx: number; wy: number },
    isBackArm: boolean
  ) {
    // Upper sleeve (short athletic tee sleeve) + skin forearm
    const sleeveEndX = arm.sx + (arm.ex - arm.sx) * 0.52;
    const sleeveEndY = arm.sy + (arm.ey - arm.sy) * 0.52;
    const sleevePath = limbPath(arm.sx, arm.sy, sleeveEndX, sleeveEndY, 6.8, 6.2);
    const upperBarePath = limbPath(sleeveEndX, sleeveEndY, arm.ex, arm.ey, 4.8, 4.3);
    const forearmPath = limbPath(arm.ex, arm.ey, arm.wx, arm.wy, 4.3, 3.4);
    const handColor = isBackArm ? skinShade : skin;
    const palm = pose.palmFacing || 'natural';

    // Draw crisp palm indicator
    let handSvg = `<circle cx="${arm.wx.toFixed(1)}" cy="${arm.wy.toFixed(1)}" r="4.6" fill="${handColor}" stroke="#c28e70" stroke-width="1"/>`;
    if (palm === 'down') {
      handSvg = `
        <ellipse cx="${arm.wx.toFixed(1)}" cy="${(arm.wy + 1).toFixed(1)}" rx="6.2" ry="3.3" fill="${handColor}" stroke="#c28e70" stroke-width="1"/>
      `;
    } else if (palm === 'up') {
      handSvg = `
        <ellipse cx="${arm.wx.toFixed(1)}" cy="${(arm.wy - 1).toFixed(1)}" rx="6.2" ry="3.3" fill="${handColor}" stroke="#c28e70" stroke-width="1"/>
        <line x1="${(arm.wx - 3).toFixed(1)}" y1="${(arm.wy - 2.5).toFixed(1)}" x2="${(arm.wx + 3).toFixed(1)}" y2="${(arm.wy - 2.5).toFixed(1)}" stroke="#c28e70" stroke-width="0.9"/>
      `;
    }

    return `
      <g>
        <path d="${upperBarePath}" fill="${handColor}" stroke="${inkOutline}" stroke-width="1.4"/>
        <path d="${forearmPath}" fill="${handColor}" stroke="${inkOutline}" stroke-width="1.4"/>
        <circle cx="${arm.ex.toFixed(1)}" cy="${arm.ey.toFixed(1)}" r="4.1" fill="${handColor}"/>
        <path d="${sleevePath}" fill="${isBackArm ? shirtShade : shirtFill}" stroke="${shirtBorder}" stroke-width="1.6"/>
        <line x1="${(sleeveEndX - 4.5).toFixed(1)}" y1="${sleeveEndY.toFixed(1)}" x2="${(sleeveEndX + 4.5).toFixed(1)}" y2="${sleeveEndY.toFixed(1)}" stroke="${collarBlue}" stroke-width="2.2" stroke-linecap="round"/>
        ${handSvg}
      </g>
    `;
  }

  // Torso polygon with crisp royal-blue polo collar, placket & neat tuck shadow
  const waistHalf = isProfile ? 9.5 : 16.5;
  const chestHalf = isProfile ? 11 : 21.5;
  const hipL = { x: -waistHalf, y: 2 };
  const hipR = { x: waistHalf, y: 2 };
  const shL = { x: neckX - chestHalf * perpX, y: neckY + 2 - chestHalf * perpY };
  const shR = { x: neckX + chestHalf * perpX, y: neckY + 2 + chestHalf * perpY };

  const torsoSvg = `
    <g>
      <path d="M ${shL.x.toFixed(1)} ${shL.y.toFixed(1)}
               L ${shR.x.toFixed(1)} ${shR.y.toFixed(1)}
               L ${hipR.x.toFixed(1)} ${hipR.y.toFixed(1)}
               Q 0 7 ${hipL.x.toFixed(1)} ${hipL.y.toFixed(1)} Z"
            fill="url(#shirtGrad_${uid})" stroke="${shirtBorder}" stroke-width="1.75" stroke-linejoin="round"/>
      <!-- Royal-blue polo collar & button placket -->
      <path d="M ${(neckX - 10 * perpX).toFixed(1)} ${(neckY + 1).toFixed(1)}
               L ${(neckX - 2.5 * perpX).toFixed(1)} ${(neckY + 11.5).toFixed(1)}
               L ${neckX.toFixed(1)} ${(neckY + 7.5).toFixed(1)}
               L ${(neckX + 2.5 * perpX).toFixed(1)} ${(neckY + 11.5).toFixed(1)}
               L ${(neckX + 10 * perpX).toFixed(1)} ${(neckY + 1).toFixed(1)} Z"
            fill="${collarBlue}" stroke="${inkOutline}" stroke-width="1.15" stroke-linejoin="round"/>
      <line x1="${neckX.toFixed(1)}" y1="${(neckY + 10).toFixed(1)}" x2="${neckX.toFixed(1)}" y2="${(neckY + 20).toFixed(1)}" stroke="${collarBlue}" stroke-width="2" stroke-linecap="round"/>
      <line x1="${hipL.x.toFixed(1)}" y1="${hipL.y.toFixed(1)}" x2="${hipR.x.toFixed(1)}" y2="${hipR.y.toFixed(1)}" stroke="${inkOutline}" stroke-width="2"/>
    </g>
  `;

  // Head & Neck
  const headCenterX = neckX + Math.sin(torsoRotRad * 0.7) * 16.5;
  const headCenterY = neckY - (fwdBend > 0.65 ? 9 : 17.5);
  const headTilt = pose.headTiltDeg ?? 0;

  let hairSvg = '';
  if (gender === 'female') {
    hairSvg = `
      <!-- Girl's glossy school hair + playful high side ponytail with purple tie -->
      <path d="M ${isProfile ? -dir * 13 : -15} -5 C ${isProfile ? -dir * 26 : -27} -10, ${isProfile ? -dir * 27 : -26} 11, ${isProfile ? -dir * 17 : -18} 16 C ${isProfile ? -dir * 21 : -20} 8, ${isProfile ? -dir * 16 : -15} 2, ${isProfile ? -dir * 12 : -13} -2 Z" fill="${hairMain}" stroke="${inkOutline}" stroke-width="1.2"/>
      <ellipse cx="${isProfile ? -dir * 14 : -15.5}" cy="-5.5" rx="3.3" ry="2.4" fill="#a855f7" stroke="${inkOutline}" stroke-width="0.9"/>
      <path d="M -16 -1 C -17.5 -20, 17.5 -20, 16 -1 C 12 -8, 6 -10, 2 -6 C -1 -10, -8 -9, -11 -5 C -13.5 -6, -15 -4, -16 -1 Z" fill="${hairMain}" stroke="${inkOutline}" stroke-width="1.2"/>
      <path d="M -9 -11.5 Q 0 -16 9 -11.5" stroke="${hairHighlight}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>
    `;
  } else {
    hairSvg = `
      <!-- Boy's crisp sporty school hair -->
      <path d="M -16 -1 C -17.5 -20, 17.5 -20, 16 -1 C 12.5 -9, 4 -11, -1 -7.5 C -7 -11, -13 -8.5, -16 -1 Z" fill="${hairMain}" stroke="${inkOutline}" stroke-width="1.2"/>
      <path d="M -8 -12.5 Q 2 -16.5 10 -11.5" stroke="${hairHighlight}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>
    `;
  }

  const faceDetails = isProfile
    ? `
      <path d="M ${dir * 4.5} -5 Q ${dir * 7.5} -6.5 ${dir * 10} -5" stroke="${inkOutline}" stroke-width="1.25" fill="none" stroke-linecap="round"/>
      <ellipse cx="${dir * 7.2}" cy="-0.8" rx="1.9" ry="2.3" fill="#0f172a"/>
      <circle cx="${dir * 7.8}" cy="-1.6" r="0.75" fill="#ffffff"/>
      <ellipse cx="${dir * 9.5}" cy="3.8" rx="2.6" ry="1.4" fill="#fda4af" opacity="0.6"/>
      <path d="M ${dir * 13.5} 1 L ${dir * 16.5} 3 L ${dir * 13.8} 4.6" fill="none" stroke="#c28e70" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M ${dir * 7} 7.2 Q ${dir * 11} 8.4 ${dir * 12.2} 6.2" stroke="#e11d48" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    `
    : `
      <path d="M -8.5 -5.2 Q -5.5 -6.8 -3 -5.2" stroke="${inkOutline}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path d="M 3 -5.2 Q 5.5 -6.8 8.5 -5.2" stroke="${inkOutline}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="-7.5" cy="4.2" rx="3" ry="1.6" fill="#fda4af" opacity="0.65"/>
      <ellipse cx="7.5" cy="4.2" rx="3" ry="1.6" fill="#fda4af" opacity="0.65"/>
      <ellipse cx="-5.2" cy="-0.5" rx="2.0" ry="2.4" fill="#0f172a"/>
      <ellipse cx="5.2" cy="-0.5" rx="2.0" ry="2.4" fill="#0f172a"/>
      <circle cx="-4.5" cy="-1.4" r="0.8" fill="#ffffff"/>
      <circle cx="5.9" cy="-1.4" r="0.8" fill="#ffffff"/>
      <path d="M -3.6 6.4 Q 0 9.6 3.6 6.4" stroke="#e11d48" stroke-width="1.45" fill="none" stroke-linecap="round"/>
    `;

  const headSvg = `
    <g transform="translate(${headCenterX.toFixed(1)}, ${headCenterY.toFixed(1)}) rotate(${headTilt})">
      <!-- Neck -->
      <rect x="-4.8" y="11" width="9.6" height="9.5" rx="3" fill="${skinShade}" stroke="${inkOutline}" stroke-width="1.2"/>
      <!-- Ears -->
      ${!isProfile ? `<circle cx="-15.5" cy="1" r="3.2" fill="${skin}" stroke="${inkOutline}" stroke-width="1.2"/><circle cx="15.5" cy="1" r="3.2" fill="${skin}" stroke="${inkOutline}" stroke-width="1.2"/>` : `<circle cx="${-dir * 3}" cy="2" r="3.2" fill="${skin}" stroke="${inkOutline}" stroke-width="1.2"/>`}
      <!-- Head -->
      <circle cx="0" cy="0" r="15.6" fill="${skin}" stroke="${inkOutline}" stroke-width="1.6"/>
      ${hairSvg}
      ${faceDetails}
    </g>
  `;

  // Equipment overlays
  let equipmentSvg = '';
  if (useEquip) {
    if (sceneEquipment === 'stick') {
      const dx = rArm.wx - lArm.wx;
      const dy = rArm.wy - lArm.wy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = (dx / len) * 22;
      const uy = (dy / len) * 22;
      equipmentSvg = `
        <g>
          <line x1="${(lArm.wx - ux).toFixed(1)}" y1="${(lArm.wy - uy).toFixed(1)}"
                x2="${(rArm.wx + ux).toFixed(1)}" y2="${(rArm.wy + uy).toFixed(1)}"
                stroke="#dc2626" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="${(lArm.wx - ux * 0.5).toFixed(1)}" y1="${(lArm.wy - uy * 0.5).toFixed(1)}"
                x2="${(rArm.wx + ux * 0.5).toFixed(1)}" y2="${(rArm.wy + uy * 0.5).toFixed(1)}"
                stroke="#f87171" stroke-width="1.5" stroke-linecap="round"/>
        </g>
      `;
    } else if (sceneEquipment === 'hoop') {
      const hx = (lArm.wx + rArm.wx) / 2;
      const hy = (lArm.wy + rArm.wy) / 2;
      const radius = Math.max(18, Math.min(34, Math.hypot(rArm.wx - lArm.wx, rArm.wy - lArm.wy) * 0.56));
      equipmentSvg = `
        <g>
          <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${radius.toFixed(1)}" fill="none" stroke="#0ea5e9" stroke-width="4.5"/>
          <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${radius.toFixed(1)}" fill="none" stroke="#bae6fd" stroke-width="1.3" stroke-dasharray="6,6"/>
        </g>
      `;
    } else if (sceneEquipment === 'ball') {
      const bx = (lArm.wx + rArm.wx) / 2 + (isProfile ? dir * 10 : 0);
      const by = (lArm.wy + rArm.wy) / 2 - 4;
      equipmentSvg = `
        <g transform="translate(${bx.toFixed(1)}, ${by.toFixed(1)})">
          <circle cx="0" cy="0" r="12" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M -11 0 Q 0 -6 11 0 M 0 -11 Q -5 0 0 11" stroke="#7c2d12" stroke-width="1.1" fill="none"/>
        </g>
      `;
    } else if (sceneEquipment === 'rope') {
      const midX = (lArm.wx + rArm.wx) / 2;
      const lowestFoot = Math.max(lLeg.ay, rLeg.ay) + 12;
      equipmentSvg = `
        <path d="M ${lArm.wx.toFixed(1)} ${lArm.wy.toFixed(1)}
                 Q ${(midX - 18).toFixed(1)} ${lowestFoot.toFixed(1)} ${midX.toFixed(1)} ${lowestFoot.toFixed(1)}
                 Q ${(midX + 18).toFixed(1)} ${lowestFoot.toFixed(1)} ${rArm.wx.toFixed(1)} ${rArm.wy.toFixed(1)}"
              fill="none" stroke="#0284c7" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="${(lArm.wx - 2).toFixed(1)}" y="${(lArm.wy - 5).toFixed(1)}" width="4" height="10" rx="2" fill="#ef4444"/>
        <rect x="${(rArm.wx - 2).toFixed(1)}" y="${(rArm.wy - 5).toFixed(1)}" width="4" height="10" rx="2" fill="#ef4444"/>
      `;
    } else if (sceneEquipment === 'flag') {
      equipmentSvg = `
        <g transform="translate(${rArm.wx.toFixed(1)}, ${rArm.wy.toFixed(1)})">
          <line x1="0" y1="6" x2="0" y2="-32" stroke="#475569" stroke-width="2.4" stroke-linecap="round"/>
          <polygon points="0,-32 22,-24 0,-16" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
        </g>
      `;
    } else if (sceneEquipment === 'cone') {
      equipmentSvg = `
        <g transform="translate(${(cx + (isProfile ? dir * 40 : 48) - originX) / scale}, ${(maxAnkleY + 10).toFixed(1)})">
          <polygon points="-10,0 10,0 3,-24 -3,-24" fill="#f97316" stroke="#c2410c" stroke-width="1.2"/>
          <line x1="-6" y1="-10" x2="6" y2="-10" stroke="#ffffff" stroke-width="2.5"/>
          <ellipse cx="0" cy="0" rx="13" ry="3" fill="#ea580c"/>
        </g>
      `;
    }
  }

  // Motion guide arcs
  let arcSvg = '';
  const arc = pose.motionArc || 'none';
  if (arc === 'arms_up') {
    arcSvg = `
      <path d="M -38 -20 Q -48 -58 -24 -86" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
      <path d="M 38 -20 Q 48 -58 24 -86" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
    `;
  } else if (arc === 'arms_down') {
    arcSvg = `
      <path d="M -36 -75 Q -48 -42 -30 -12" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
      <path d="M 36 -75 Q 48 -42 30 -12" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
    `;
  } else if (arc === 'arms_out') {
    arcSvg = `
      <path d="M -28 -18 Q -48 -35 -58 -52" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
      <path d="M 28 -18 Q 48 -35 58 -52" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>
    `;
  } else if (arc === 'clap') {
    arcSvg = `
      <line x1="-18" y1="${(lArm.wy - 10).toFixed(1)}" x2="-8" y2="${(lArm.wy - 4).toFixed(1)}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
      <line x1="18" y1="${(rArm.wy - 10).toFixed(1)}" x2="8" y2="${(rArm.wy - 4).toFixed(1)}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
      <line x1="0" y1="${(lArm.wy - 15).toFixed(1)}" x2="0" y2="${(lArm.wy - 7).toFixed(1)}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
    `;
  } else if (arc === 'side_left') {
    arcSvg = `<path d="M 10 -86 Q -25 -95 -42 -66" fill="none" stroke="#f97316" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowOrange_${uid})"/>`;
  } else if (arc === 'side_right') {
    arcSvg = `<path d="M -10 -86 Q 25 -95 42 -66" fill="none" stroke="#f97316" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowOrange_${uid})"/>`;
  } else if (arc === 'bend_down') {
    arcSvg = `<path d="M 28 -75 Q 42 -35 24 25" fill="none" stroke="#f97316" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowOrange_${uid})"/>`;
  } else if (arc === 'hop_up') {
    arcSvg = `
      <path d="M -24 55 L -24 25" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowGreen_${uid})"/>
      <path d="M 24 55 L 24 25" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowGreen_${uid})"/>
    `;
  } else if (arc === 'run_forward') {
    arcSvg = `<path d="M ${-dir * 28} 35 L ${dir * 38} 35" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowBlue_${uid})"/>`;
  } else if (arc === 'throw_ball') {
    arcSvg = `<path d="M ${dir * 16} -76 Q ${dir * 45} -95 ${dir * 72} -74" fill="none" stroke="#f97316" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#arrowOrange_${uid})"/>`;
  }

  const backLeg = isProfile ? drawLeg(lLeg, -1, true) : '';
  const frontLegs = isProfile
    ? drawLeg(rLeg, 1, false)
    : `${drawLeg(lLeg, -1, false)}${drawLeg(rLeg, 1, false)}`;
  const backArm = isProfile ? drawArm(lArm, true) : '';
  const frontArms = isProfile
    ? drawArm(rArm, false)
    : `${drawArm(lArm, false)}${drawArm(rArm, false)}`;

  // Ground shadow
  const shadowRx = (28 - heelRaise * 0.3) * scale;
  const shadowOpacity = Math.max(0.1, 0.22 - heelRaise * 0.005);

  return `
    <g>
      <ellipse cx="${cx.toFixed(1)}" cy="${(groundY + 2).toFixed(1)}" rx="${shadowRx.toFixed(1)}" ry="${(6 * scale).toFixed(1)}" fill="#64748b" opacity="${shadowOpacity.toFixed(2)}"/>
      <g transform="translate(${originX.toFixed(1)}, ${originY.toFixed(1)}) scale(${scale})">
        ${backLeg}
        ${backArm}
        ${frontLegs}
        ${torsoSvg}
        ${headSvg}
        ${frontArms}
        ${equipmentSvg}
        ${arcSvg}
      </g>
    </g>
  `;
}

/**
 * Renders a vibrant Group Game / Court Scene (relay run, circle game, tug of war, rabbit hop, ball pass)
 */
function renderGroupGameScene(spec: HdSceneSpec, uid: string): string {
  const w = 1200;
  const h = 560;
  const nameLower = `${spec.title} ${spec.subtitle}`.toLowerCase();
  const gameType =
    spec.gameType ||
    (nameLower.includes('kéo co')
      ? 'tug_of_war'
      : nameLower.includes('vòng tròn') || nameLower.includes('mèo đuổi chuột') || nameLower.includes('kết bạn') || nameLower.includes('bỏ khăn')
      ? 'circle'
      : nameLower.includes('bóng')
      ? 'ball_pass'
      : nameLower.includes('thỏ nhảy') || nameLower.includes('lò cò') || nameLower.includes('bật')
      ? 'rabbit_hop'
      : 'relay');

  // Court surface
  const courtBg = `
    <rect x="34" y="88" width="${w - 68}" height="388" rx="22" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2.5"/>
    <ellipse cx="600" cy="295" rx="460" ry="135" fill="#dcfce7" opacity="0.55"/>
    <line x1="85" y1="365" x2="1115" y2="365" stroke="#86efac" stroke-width="3" stroke-dasharray="10,8"/>
  `;

  let actors = '';

  if (gameType === 'circle') {
    // 6 students around a chalk circle + 2 running/chasing
    actors = `
      <ellipse cx="600" cy="312" rx="340" ry="118" fill="none" stroke="#16a34a" stroke-width="3" stroke-dasharray="10,6"/>
      <path d="M 330 220 Q 600 155 880 225" fill="none" stroke="#f97316" stroke-width="3" stroke-dasharray="7,5" marker-end="url(#arrowOrange_${uid})"/>
      ${renderArticulatedStudent(300, 275, 0.72, { label: '', caption: '', leftUpperDeg: 75, leftElbowDeg: 0, rightUpperDeg: 75, rightElbowDeg: 0, leftHipDeg: 6, leftKneeDeg: 0, rightHipDeg: 6, rightKneeDeg: 0, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(490, 232, 0.66, { label: '', caption: '', leftUpperDeg: 75, leftElbowDeg: 0, rightUpperDeg: 75, rightElbowDeg: 0, leftHipDeg: 6, leftKneeDeg: 0, rightHipDeg: 6, rightKneeDeg: 0, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(710, 232, 0.66, { label: '', caption: '', leftUpperDeg: 75, leftElbowDeg: 0, rightUpperDeg: 75, rightElbowDeg: 0, leftHipDeg: 6, leftKneeDeg: 0, rightHipDeg: 6, rightKneeDeg: 0, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(900, 275, 0.72, { label: '', caption: '', leftUpperDeg: 75, leftElbowDeg: 0, rightUpperDeg: 75, rightElbowDeg: 0, leftHipDeg: 6, leftKneeDeg: 0, rightHipDeg: 6, rightKneeDeg: 0, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(415, 425, 0.88, { label: '', caption: '', leftUpperDeg: 60, leftElbowDeg: 10, rightUpperDeg: 60, rightElbowDeg: 10, leftHipDeg: 8, leftKneeDeg: 0, rightHipDeg: 8, rightKneeDeg: 0, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(785, 425, 0.88, { label: '', caption: '', leftUpperDeg: 60, leftElbowDeg: 10, rightUpperDeg: 60, rightElbowDeg: 10, leftHipDeg: 8, leftKneeDeg: 0, rightHipDeg: 8, rightKneeDeg: 0, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(600, 325, 0.84, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 50, leftElbowDeg: 65, rightUpperDeg: -45, rightElbowDeg: 55, leftHipDeg: 35, leftKneeDeg: 45, rightHipDeg: -28, rightKneeDeg: 25, heelRaisePx: 8, motionArc: 'run_forward', gender: 'female' }, 'none', 'female', uid)}
    `;
  } else if (gameType === 'tug_of_war') {
    // 2 teams pulling opposite sides across center line
    actors = `
      <line x1="600" y1="185" x2="600" y2="445" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="8,6"/>
      <line x1="175" y1="316" x2="1025" y2="316" stroke="#b45309" stroke-width="7" stroke-linecap="round"/>
      <polygon points="592,316 608,316 600,338" fill="#ef4444"/>
      ${renderArticulatedStudent(260, 415, 0.9, { label: '', caption: '', facing: 'profile_right', torsoTiltDeg: -16, leftUpperDeg: 68, leftElbowDeg: 28, rightUpperDeg: 52, rightElbowDeg: 36, leftHipDeg: 26, leftKneeDeg: 25, rightHipDeg: -24, rightKneeDeg: 10, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(415, 415, 0.9, { label: '', caption: '', facing: 'profile_right', torsoTiltDeg: -16, leftUpperDeg: 68, leftElbowDeg: 28, rightUpperDeg: 52, rightElbowDeg: 36, leftHipDeg: 26, leftKneeDeg: 25, rightHipDeg: -24, rightKneeDeg: 10, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(785, 415, 0.9, { label: '', caption: '', facing: 'profile_left', torsoTiltDeg: 16, leftUpperDeg: 68, leftElbowDeg: 28, rightUpperDeg: 52, rightElbowDeg: 36, leftHipDeg: 26, leftKneeDeg: 25, rightHipDeg: -24, rightKneeDeg: 10, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(940, 415, 0.9, { label: '', caption: '', facing: 'profile_left', torsoTiltDeg: 16, leftUpperDeg: 68, leftElbowDeg: 28, rightUpperDeg: 52, rightElbowDeg: 36, leftHipDeg: 26, leftKneeDeg: 25, rightHipDeg: -24, rightKneeDeg: 10, gender: 'female' }, 'none', 'female', uid)}
    `;
  } else if (gameType === 'ball_pass') {
    // 4 students in 2 teams passing balls with arched trajectories
    actors = `
      <path d="M 355 245 Q 500 135 650 245" fill="none" stroke="#f97316" stroke-width="3" stroke-dasharray="7,5" marker-end="url(#arrowOrange_${uid})"/>
      <circle cx="500" cy="186" r="15" fill="#f97316" stroke="#c2410c" stroke-width="1.8"/>
      <path d="M 486 186 Q 500 179 514 186 M 500 172 Q 494 186 500 200" stroke="#7c2d12" stroke-width="1.3" fill="none"/>
      ${renderArticulatedStudent(220, 405, 0.92, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 112, leftElbowDeg: 15, rightUpperDeg: 104, rightElbowDeg: 15, leftHipDeg: 18, leftKneeDeg: 12, rightHipDeg: -14, rightKneeDeg: 8, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(410, 405, 0.92, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 88, leftElbowDeg: 20, rightUpperDeg: 84, rightElbowDeg: 22, leftHipDeg: 12, leftKneeDeg: 6, rightHipDeg: -12, rightKneeDeg: 4, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(720, 405, 0.92, { label: '', caption: '', facing: 'profile_left', leftUpperDeg: 95, leftElbowDeg: 15, rightUpperDeg: 95, rightElbowDeg: 15, leftHipDeg: 14, leftKneeDeg: 10, rightHipDeg: -14, rightKneeDeg: 10, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(950, 405, 0.92, { label: '', caption: '', facing: 'profile_left', leftUpperDeg: 40, leftElbowDeg: 75, rightUpperDeg: 40, rightElbowDeg: 75, leftHipDeg: 8, leftKneeDeg: 0, rightHipDeg: -8, rightKneeDeg: 0, gender: 'female' }, 'none', 'female', uid)}
    `;
  } else {
    // Relay / Rabbit Hop / Cone Run (Default dynamic outdoor game)
    const isHop = gameType === 'rabbit_hop';
    actors = `
      <!-- Starting line & Finish cones/flag -->
      <line x1="295" y1="220" x2="295" y2="440" stroke="#0284c7" stroke-width="4"/>
      <text x="295" y="458" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">VẠCH XUẤT PHÁT</text>
      <!-- Hoops / Cones -->
      ${[470, 620, 770].map((hx) => `<ellipse cx="${hx}" cy="395" rx="34" ry="11" fill="none" stroke="#f59e0b" stroke-width="4"/>`).join('')}
      <g transform="translate(975, 365)">
        <line x1="0" y1="0" x2="0" y2="-75" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <polygon points="0,-75 46,-60 0,-45" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <polygon points="-16,0 16,0 7,-32 -7,-32" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
      </g>
      <path d="M 380 285 Q 680 185 950 285" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="8,5" marker-end="url(#arrowBlue_${uid})"/>
      <path d="M 940 420 Q 640 458 340 415" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6,5" marker-end="url(#arrowGreen_${uid})"/>
      ${renderArticulatedStudent(165, 355, 0.78, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 15, leftElbowDeg: 45, rightUpperDeg: -10, rightElbowDeg: 35, leftHipDeg: 6, leftKneeDeg: 0, rightHipDeg: -6, rightKneeDeg: 0, gender: 'female' }, 'none', 'female', uid)}
      ${renderArticulatedStudent(245, 395, 0.85, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 45, leftElbowDeg: 65, rightUpperDeg: -35, rightElbowDeg: 55, leftHipDeg: 22, leftKneeDeg: 18, rightHipDeg: -18, rightKneeDeg: 10, gender: 'male' }, 'none', 'male', uid)}
      ${renderArticulatedStudent(545, 388, 0.94, isHop
        ? { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 118, leftElbowDeg: 45, rightUpperDeg: 118, rightElbowDeg: 45, leftHipDeg: 28, leftKneeDeg: 48, rightHipDeg: 18, rightKneeDeg: 42, heelRaisePx: 20, motionArc: 'hop_up', gender: 'male' }
        : { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 58, leftElbowDeg: 75, rightUpperDeg: -50, rightElbowDeg: 65, leftHipDeg: 42, leftKneeDeg: 52, rightHipDeg: -34, rightKneeDeg: 40, heelRaisePx: 14, motionArc: 'run_forward', gender: 'male' },
        spec.equipment === 'flag' ? 'flag' : 'none', 'male', uid)}
      ${renderArticulatedStudent(745, 340, 0.80, { label: '', caption: '', facing: 'profile_right', leftUpperDeg: 55, leftElbowDeg: 70, rightUpperDeg: -45, rightElbowDeg: 60, leftHipDeg: 38, leftKneeDeg: 45, rightHipDeg: -28, rightKneeDeg: 32, heelRaisePx: 10, gender: 'female' }, 'none', 'female', uid)}
    `;
  }

  return `${courtBg}${actors}`;
}

interface PosterThemePalette {
  bannerTop: string;
  bannerBottom: string;
  bannerBorder: string;
  titleColor: string;
  skyTop: string;
  skyBottom: string;
  hillBack: string;
  hillFront: string;
  groundFill: string;
  stepHeaderBg: string;
  stepHeaderText: string;
  descCardBg: string;
  descCardBorder: string;
  footerBg: string;
  footerBorder: string;
  badgeBg: string;
}

const POSTER_THEMES: Record<HdPosterTheme, PosterThemePalette> = {
  sky_meadow: {
    bannerTop: '#dff4ff',
    bannerBottom: '#82ccfb',
    bannerBorder: '#79bde8',
    titleColor: '#133a5c',
    skyTop: '#d3ecff',
    skyBottom: '#eef8ff',
    hillBack: '#c4e797',
    hillFront: '#99d157',
    groundFill: '#f5ecd9',
    stepHeaderBg: '#cde6b7',
    stepHeaderText: '#133a5c',
    descCardBg: '#fdf7df',
    descCardBorder: '#eae0ba',
    footerBg: '#fde2e4',
    footerBorder: '#f6c2c7',
    badgeBg: '#f16552',
  },
  mint_sport: {
    bannerTop: '#d6f9ef',
    bannerBottom: '#6ee7c8',
    bannerBorder: '#52c8aa',
    titleColor: '#0f3d36',
    skyTop: '#d8f7f1',
    skyBottom: '#f2fdfb',
    hillBack: '#bcead5',
    hillFront: '#73c7a2',
    groundFill: '#f6efe0',
    stepHeaderBg: '#bae8d4',
    stepHeaderText: '#0f3d36',
    descCardBg: '#f6fbf6',
    descCardBorder: '#d3e9dc',
    footerBg: '#e0f2fe',
    footerBorder: '#bae6fd',
    badgeBg: '#0284c7',
  },
  coral_energy: {
    bannerTop: '#ffedd5',
    bannerBottom: '#fdba74',
    bannerBorder: '#f59e0b',
    titleColor: '#7c2d12',
    skyTop: '#e0f2fe',
    skyBottom: '#f0f9ff',
    hillBack: '#d9f99d',
    hillFront: '#a3e635',
    groundFill: '#fef3c7',
    stepHeaderBg: '#fde68a',
    stepHeaderText: '#78350f',
    descCardBg: '#fffbeb',
    descCardBorder: '#f5d98a',
    footerBg: '#ffe4e6',
    footerBorder: '#fecdd3',
    badgeBg: '#e11d48',
  },
};

function renderPoster80x60Svg(
  spec: HdSceneSpec,
  options: { background?: 'pure_white' | 'transparent' | 'studio_grid' } = {}
): string {
  const { background = 'pure_white' } = options;
  const theme = POSTER_THEMES[spec.posterTheme || 'sky_meadow'];
  const uid =
    'pst_' +
    Math.abs(
      `${spec.title}_${spec.posterTheme || 'sky'}`.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
    ).toString(36);
  const w = 1600;
  const h = 1200;

  let bgRect = `<rect width="100%" height="100%" fill="#ffffff"/>`;
  if (background === 'transparent') {
    bgRect = '';
  } else if (background === 'studio_grid') {
    bgRect = `
      <rect width="100%" height="100%" fill="#ffffff"/>
      <pattern id="grid_${uid}" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid_${uid})"/>
    `;
  }

  const upperTitle = (spec.title || 'ĐỘNG TÁC THỂ DỤC').toUpperCase();
  const titleFontSize = upperTitle.length > 34 ? 44 : upperTitle.length > 24 ? 56 : upperTitle.length > 18 ? 64 : 74;

  const defs = `
    <defs>
      <linearGradient id="shirtGrad_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#eef3f9"/>
      </linearGradient>
      <linearGradient id="bannerGrad_${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${theme.bannerTop}"/>
        <stop offset="100%" stop-color="${theme.bannerBottom}"/>
      </linearGradient>
      <linearGradient id="skyGrad_${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${theme.skyTop}"/>
        <stop offset="100%" stop-color="${theme.skyBottom}"/>
      </linearGradient>
      <marker id="arrowBlue_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7"/>
      </marker>
      <marker id="arrowOrange_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f97316"/>
      </marker>
      <marker id="arrowGreen_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#16a34a"/>
      </marker>
      <clipPath id="bannerClip_${uid}">
        <rect x="46" y="38" width="1508" height="168" rx="28"/>
      </clipPath>
    </defs>
  `;

  // Top Glossy Sky-Blue Print Banner with Fresh Decorative Leaf Pairs
  const headerBanner = `
    <g>
      <rect x="46" y="38" width="1508" height="168" rx="28" fill="url(#bannerGrad_${uid})" stroke="${theme.bannerBorder}" stroke-width="2.5"/>
      <g clip-path="url(#bannerClip_${uid})">
        <path d="M 46 135 Q 420 82 810 132 T 1554 118 L 1554 206 L 46 206 Z" fill="#ffffff" opacity="0.22"/>
        <path d="M 46 168 Q 520 132 980 165 T 1554 148 L 1554 206 L 46 206 Z" fill="#38bdf8" opacity="0.16"/>
      </g>
      <!-- Left Leaf Accents -->
      <g transform="translate(158, 122)">
        <path d="M 10 -46 C 32 -32, 34 -8, 12 8 C -8 -8, -10 -32, 10 -46 Z" fill="#f59e0b" transform="rotate(-24)"/>
        <path d="M -22 8 C 4 -10, 32 2, 36 28 C 8 36, -18 24, -22 8 Z" fill="#76b900" transform="rotate(14)"/>
      </g>
      <!-- Right Leaf Accents -->
      <g transform="translate(1442, 122) scale(-1, 1)">
        <path d="M 10 -46 C 32 -32, 34 -8, 12 8 C -8 -8, -10 -32, 10 -46 Z" fill="#f59e0b" transform="rotate(-24)"/>
        <path d="M -22 8 C 4 -10, 32 2, 36 28 C 8 36, -18 24, -22 8 Z" fill="#76b900" transform="rotate(14)"/>
      </g>
      <text x="800" y="${122 + Math.round(titleFontSize * 0.34)}" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="${titleFontSize}" font-weight="900" fill="${theme.titleColor}" text-anchor="middle" letter-spacing="1.5">${escapeXml(upperTitle)}</text>
    </g>
  `;

  let bodySvg = '';

  if (spec.sceneMode === 'group_game') {
    // Full-width illustrated playground card + game instruction panel
    const gameSvg = renderGroupGameScene(spec, uid);
    const wrappedGameSub = wrapVietnameseLines(spec.subtitle || spec.bottomNote, 76, 3);
    const subTspans = wrappedGameSub
      .map((line, i) => `<tspan x="800" dy="${i === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`)
      .join('');

    bodySvg = `
      <g>
        <rect x="46" y="232" width="1508" height="585" rx="22" fill="url(#skyGrad_${uid})" stroke="#cfe2f2" stroke-width="2.5"/>
        <g transform="translate(115, 224) scale(1.14)">
          ${gameSvg}
        </g>
        <rect x="46" y="832" width="1508" height="68" rx="14" fill="${theme.stepHeaderBg}"/>
        <text x="800" y="876" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="30" font-weight="900" fill="${theme.stepHeaderText}" text-anchor="middle">TỔ CHỨC &amp; HƯỚNG DẪN TRÒ CHƠI VẬN ĐỘNG (KHỐI ${spec.grade})</text>
        <rect x="46" y="902" width="1508" height="128" rx="14" fill="${theme.descCardBg}" stroke="${theme.descCardBorder}" stroke-width="2"/>
        <text x="800" y="950" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="25" font-weight="700" fill="${theme.titleColor}" text-anchor="middle">${subTspans}</text>
      </g>
    `;
  } else {
    const poses = spec.poses.slice(
      0,
      spec.sceneMode === 'single_pose' ? 1 : spec.sceneMode === 'pair_practice' ? 2 : 5
    );
    const count = poses.length || 1;
    const totalW = 1508;
    const gap = count >= 5 ? 22 : 28;
    const cardW = Math.floor((totalW - gap * (count - 1)) / count);
    const startX = 46 + Math.floor((totalW - (cardW * count + gap * (count - 1))) / 2);

    const artY = 232;
    const artH = 472;
    const groundY = artY + artH - 42;
    const labelY = artY + artH + 14;
    const labelH = 72;
    const descY = labelY + labelH;
    const descH = 240;

    const figureScale =
      count === 1 ? 1.82 : count === 2 ? 1.66 : count === 3 ? 1.56 : count === 4 ? 1.48 : 1.44;

    bodySvg = poses
      .map((pose, idx) => {
        const cardX = startX + idx * (cardW + gap);
        const cx = cardX + cardW / 2;
        const clipId = `cardClip_${uid}_${idx}`;

        // Normalize label to crisp textbook uppercase (TTCB -> TƯ THẾ CHUẨN BỊ)
        const rawLabel = (pose.label || `NHỊP ${idx}`).trim();
        const displayLabel =
          rawLabel.toUpperCase() === 'TTCB' ? 'TƯ THẾ CHUẨN BỊ' : rawLabel.toUpperCase();
        const labelFontSize =
          displayLabel.length > 14 ? 23 : displayLabel.length > 10 ? 27 : 31;

        const maxChars = count >= 5 ? 21 : count === 4 ? 26 : count === 2 ? 44 : 72;
        const capLines = wrapVietnameseLines(pose.caption, maxChars, 7);
        const lineHeight = 31;
        const blockHeight = (capLines.length - 1) * lineHeight;
        const textStartY = descY + descH / 2 - blockHeight / 2 + 8;
        const capTspans = capLines
          .map(
            (line, li) =>
              `<tspan x="${cx}" dy="${li === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
          )
          .join('');

        const artworkInner = pose.customImageUrl
          ? `<image href="${escapeXml(pose.customImageUrl)}" x="${cardX + 8}" y="${artY + 8}" width="${cardW - 16}" height="${artH - 16}" preserveAspectRatio="xMidYMid meet"/>`
          : `
            <rect x="${cardX}" y="${artY}" width="${cardW}" height="${artH}" fill="url(#skyGrad_${uid})"/>
            <!-- Sunlit Schoolyard Rolling Hills -->
            <path d="M ${cardX - 10} ${artY + 355} Q ${cardX + cardW * 0.35} ${artY + 292} ${cardX + cardW * 0.78} ${artY + 336} T ${cardX + cardW + 10} ${artY + 322} L ${cardX + cardW + 10} ${artY + 390} L ${cardX - 10} ${artY + 390} Z" fill="${theme.hillBack}"/>
            <path d="M ${cardX - 10} ${artY + 372} Q ${cardX + cardW * 0.62} ${artY + 318} ${cardX + cardW + 10} ${artY + 362} L ${cardX + cardW + 10} ${artY + 400} L ${cardX - 10} ${artY + 400} Z" fill="${theme.hillFront}" opacity="0.88"/>
            <!-- Warm Cream Schoolyard Floor -->
            <rect x="${cardX}" y="${artY + 376}" width="${cardW}" height="${artH - 376}" fill="${theme.groundFill}"/>
            <line x1="${cardX}" y1="${artY + 376}" x2="${cardX + cardW}" y2="${artY + 376}" stroke="#e5d9be" stroke-width="2"/>
            ${renderArticulatedStudent(
              cx,
              groundY,
              figureScale,
              pose,
              spec.equipment,
              spec.gender,
              uid
            )}
          `;

        return `
          <g>
            <defs>
              <clipPath id="${clipId}">
                <rect x="${cardX}" y="${artY}" width="${cardW}" height="${artH}" rx="16"/>
              </clipPath>
            </defs>
            <!-- Top Artwork Panel -->
            <g clip-path="url(#${clipId})">
              ${artworkInner}
            </g>
            <rect x="${cardX}" y="${artY}" width="${cardW}" height="${artH}" rx="16" fill="none" stroke="#d1e3f2" stroke-width="2"/>

            <!-- Middle Mint-Green Label Bar -->
            <path d="M ${cardX + 12} ${labelY} L ${cardX + cardW - 12} ${labelY} Q ${cardX + cardW} ${labelY} ${cardX + cardW} ${labelY + 12} L ${cardX + cardW} ${labelY + labelH} L ${cardX} ${labelY + labelH} L ${cardX} ${labelY + 12} Q ${cardX} ${labelY} ${cardX + 12} ${labelY} Z" fill="${theme.stepHeaderBg}"/>
            <text x="${cx}" y="${labelY + 46}" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="${labelFontSize}" font-weight="900" fill="${theme.stepHeaderText}" text-anchor="middle">${escapeXml(displayLabel)}</text>

            <!-- Bottom Cream Technical Description Box -->
            <path d="M ${cardX} ${descY} L ${cardX + cardW} ${descY} L ${cardX + cardW} ${descY + descH - 12} Q ${cardX + cardW} ${descY + descH} ${cardX + cardW - 12} ${descY + descH} L ${cardX + 12} ${descY + descH} Q ${cardX} ${descY + descH} ${cardX} ${descY + descH - 12} Z" fill="${theme.descCardBg}" stroke="${theme.descCardBorder}" stroke-width="1.8"/>
            <text x="${cx}" y="${textStartY}" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="22" font-weight="700" fill="${theme.titleColor}" text-anchor="middle">${capTspans}</text>
          </g>
        `;
      })
      .join('\n');
  }

  // Bottom Pink Callout Banner ("NHỊP 5, 6, 7, 8 | Thực hiện như nhịp 1, 2, 3, 4, nhưng đổi chân.")
  const badgeLabel = (spec.bottomBadge || 'NHỊP 5, 6, 7, 8').trim().toUpperCase();
  const noteText = (spec.bottomNote || 'Thực hiện như nhịp 1, 2, 3, 4, nhưng đổi chân.').trim();
  const badgeW = Math.min(420, Math.max(290, badgeLabel.length * 22 + 64));
  const noteFontSize = noteText.length > 64 ? 26 : noteText.length > 48 ? 31 : 36;
  const totalFooterContentW = badgeW + 38 + Math.min(960, noteText.length * (noteFontSize * 0.52));
  const badgeX = Math.max(82, Math.round(800 - totalFooterContentW / 2));
  const noteX = badgeX + badgeW + 36;

  const footerBanner = `
    <g>
      <rect x="46" y="1054" width="1508" height="106" rx="22" fill="${theme.footerBg}" stroke="${theme.footerBorder}" stroke-width="2"/>
      <rect x="${badgeX}" y="1070" width="${badgeW}" height="74" rx="20" fill="${theme.badgeBg}"/>
      <text x="${badgeX + badgeW / 2}" y="1119" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${escapeXml(badgeLabel)}</text>
      <text x="${noteX}" y="1119" font-family="'Be Vietnam Pro', 'Segoe UI', Roboto, Arial, sans-serif" font-size="${noteFontSize}" font-weight="800" fill="${theme.titleColor}" text-anchor="start">${escapeXml(noteText)}</text>
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${defs}
${bgRect}
${headerBanner}
${bodySvg}
${footerBanner}
</svg>`.trim();
}

/**
 * Main SVG generator (100% pure SVG, NO <foreignObject>).
 * Supports both Print-Ready 80x60cm 300DPI Poster (1600x1200) and Compact A4 Strip (1200x540).
 */
export function generateHdSgkSvg(
  spec: HdSceneSpec,
  options: { background?: 'pure_white' | 'transparent' | 'studio_grid' } = {}
): string {
  if (spec.layoutStyle === 'poster_80x60') {
    return renderPoster80x60Svg(spec, options);
  }

  const { background = 'pure_white' } = options;
  const uid = 'hd_' + Math.abs(spec.title.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36);
  const w = 1200;
  const h = 540;

  let bgRect = `<rect width="100%" height="100%" fill="#ffffff"/>`;
  if (background === 'transparent') {
    bgRect = '';
  } else if (background === 'studio_grid') {
    bgRect = `
      <rect width="100%" height="100%" fill="#ffffff"/>
      <pattern id="grid_${uid}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid_${uid})"/>
    `;
  }

  const defs = `
    <defs>
      <linearGradient id="shirtGrad_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <marker id="arrowBlue_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7"/>
      </marker>
      <marker id="arrowOrange_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f97316"/>
      </marker>
      <marker id="arrowGreen_${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#16a34a"/>
      </marker>
    </defs>
  `;

  // Header badge + Title
  const header = `
    <g>
      <rect x="36" y="22" width="42" height="42" rx="14" fill="#0284c7"/>
      <text x="57" y="49" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">K${spec.grade}</text>
      <text x="92" y="42" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="22" font-weight="800" fill="#0f172a">${escapeXml(spec.title)}</text>
      <text x="92" y="62" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="13.5" font-weight="500" font-style="italic" fill="#475569">${escapeXml(spec.subtitle)}</text>
    </g>
  `;

  let bodySvg = '';

  if (spec.sceneMode === 'group_game') {
    bodySvg = renderGroupGameScene(spec, uid);
  } else {
    const poses = spec.poses.slice(0, spec.sceneMode === 'single_pose' ? 1 : spec.sceneMode === 'pair_practice' ? 2 : 5);
    const count = poses.length || 1;
    const figureScale =
      spec.sceneMode === 'single_pose'
        ? 1.56
        : spec.sceneMode === 'pair_practice'
        ? 1.38
        : count <= 3
        ? 1.28
        : 1.16;
    const groundY = spec.sceneMode === 'single_pose' ? 395 : 378;

    const centers: number[] =
      count === 1
        ? [600]
        : count === 2
        ? [410, 790]
        : count === 3
        ? [250, 600, 950]
        : count === 4
        ? [175, 458, 742, 1025]
        : [132, 366, 600, 834, 1068];

    const stepConnectorArrows =
      count > 1 && spec.sceneMode === 'sequence_5'
        ? centers
            .slice(0, -1)
            .map((cx, i) => {
              const x1 = cx + 62;
              const x2 = centers[i + 1] - 62;
              return `<line x1="${x1}" y1="245" x2="${x2}" y2="245" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5,4" marker-end="url(#arrowBlue_${uid})"/>`;
            })
            .join('')
        : '';

    const groundLine = `<line x1="50" y1="${groundY}" x2="${w - 50}" y2="${groundY}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="7,4"/>`;

    const renderedFigures = poses
      .map((pose, idx) => {
        const cx = centers[idx] ?? 600;
        const fig = pose.customImageUrl
          ? `<image href="${escapeXml(pose.customImageUrl)}" x="${cx - 95}" y="95" width="190" height="${groundY - 100}" preserveAspectRatio="xMidYMid meet"/>`
          : renderArticulatedStudent(
              cx,
              groundY,
              figureScale,
              pose,
              spec.equipment,
              spec.gender,
              uid
            );

        const maxChars = count >= 5 ? 24 : count === 4 ? 28 : 38;
        const capLines = wrapVietnameseLines(pose.caption, maxChars, 3);
        const capTspans = capLines
          .map((line, li) => `<tspan x="${cx}" dy="${li === 0 ? 0 : 16}">${escapeXml(line)}</tspan>`)
          .join('');

        const pillW = Math.max(82, pose.label.length * 10 + 28);
        const pillY = groundY + 18;
        const capY = groundY + 62;

        return `
          <g>
            ${fig}
            <rect x="${cx - pillW / 2}" y="${pillY}" width="${pillW}" height="28" rx="14" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.4"/>
            <text x="${cx}" y="${pillY + 19}" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="14" font-weight="800" fill="#0369a1" text-anchor="middle">${escapeXml(pose.label)}</text>
            <text x="${cx}" y="${capY}" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="12.5" font-weight="600" fill="#334155" text-anchor="middle">${capTspans}</text>
          </g>
        `;
      })
      .join('\n');

    bodySvg = `${groundLine}${stepConnectorArrows}${renderedFigures}`;
  }

  // Footer pedagogy note pill
  const footerNote = spec.bottomNote
    ? `
      <g>
        <rect x="140" y="496" width="920" height="30" rx="15" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
        <text x="600" y="516" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="13.5" font-weight="700" fill="#0369a1" text-anchor="middle">${escapeXml(spec.bottomNote)}</text>
      </g>
    `
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${defs}
${bgRect}
${header}
${bodySvg}
${footerNote}
</svg>`.trim();
}

/**
 * Generates an optimized print-ready AI poster prompt matching the 80x60cm 300DPI textbook poster aesthetic
 */
export function buildAiPosterPrompt(spec: HdSceneSpec): string {
  const stepsText = spec.poses
    .map((p, idx) => `- Khung ${idx + 1} (${p.label.toUpperCase()}): ${p.caption}`)
    .join('\n');
  return `Thiết kế tranh minh họa giáo dục thể chất chuẩn in vector 80x60cm 300DPI (tỉ lệ 4:3), phong cách tranh sách giáo khoa GDPT 2018 Việt Nam sắc nét:
- Tiêu đề banner xanh dương bo tròn phía trên có lá xanh-cam trang trí hai bên: "${spec.title.toUpperCase()}"
- Bố cục ${spec.poses.length} khung dọc đều nhau, mỗi khung gồm: nền trời xanh nhạt, đồi cỏ xanh dịu, sân tập màu kem, nhân vật học sinh ${spec.gender === 'female' ? 'nữ tóc buộc đuôi ngựa' : 'nam tóc gọn gàng'} mặc đồng phục thể dục áo polo trắng cổ xanh, quần thể thao xanh dương có 2 sọc trắng dọc thân, giày thể thao trắng viền xanh lá, mũi tên chỉ hướng chuyển động rõ nét.
- Thanh nhãn xanh lá nhạt + hộp mô tả màu kem chữ tiếng Việt rõ dấu chuẩn chính tả ngay bên dưới từng khung:
${stepsText}
- Thanh chú thích màu hồng phấn dưới cùng có nhãn cam đỏ "${spec.bottomBadge || 'NHỊP 5, 6, 7, 8'}": "${spec.bottomNote}"
- Nền ngoài trắng tinh, đường nét vector sạch, không lỗi chữ tiếng Việt.`;
}

/**
 * Renders any pure SVG string to a crisp high-resolution PNG Data URL (HD 1600 / 2K 2400 / 4K 3200 / Print 3600)
 */
export async function renderSvgToHdPngDataUrl(
  svgString: string,
  targetWidth: 1600 | 2400 | 3200 | 3600 = 2400,
  transparentBg: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const vbMatch = svgString.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/i);
      const srcW = vbMatch ? parseFloat(vbMatch[1]) : 1200;
      const srcH = vbMatch ? parseFloat(vbMatch[2]) : 540;
      const targetHeight = Math.round((targetWidth * srcH) / (srcW || 1200));
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Canvas context unavailable'));
            return;
          }

          if (!transparentBg) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          URL.revokeObjectURL(blobUrl);
          resolve(canvas.toDataURL('image/png', 1.0));
        } catch (err) {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      };
      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}

// Common Standing Pose
const POSE_TTCB: HdPoseSpec = {
  label: 'TTCB',
  caption: 'Đứng nghiêm, thân thẳng, hai tay xuôi áp nhẹ đùi',
  leftUpperDeg: 7,
  leftElbowDeg: 4,
  rightUpperDeg: 7,
  rightElbowDeg: 4,
  leftHipDeg: 3,
  leftKneeDeg: 0,
  rightHipDeg: 3,
  rightKneeDeg: 0,
  palmFacing: 'natural',
  motionArc: 'none',
};

export const HD_PRESET_LIST: HdPresetMeta[] = [
  { id: 'dung_nghiem_nghi', label: 'Đứng nghiêm - Đứng nghỉ (K1)', grade: '1', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'vuon_tho', label: 'Động tác Vươn thở', grade: '1', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_tay', label: 'Động tác Tay', grade: '1', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_chan', label: 'Động tác Chân', grade: '1', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_luon', label: 'Động tác Lườn', grade: '3', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_bung', label: 'Động tác Bụng', grade: '3', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_phoi_hop', label: 'Động tác Phối hợp / Toàn thân', grade: '3', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'dong_tac_nhay', label: 'Động tác Nhảy / Điều hòa', grade: '3', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'bai_td_vong_k4', label: 'Bài Thể dục với Vòng thể dục (Khối 4)', grade: '4', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'hoop' },
  { id: 'bai_td_gay', label: 'Bài Thể dục với Gậy (Khối 5)', grade: '5', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'stick' },
  { id: 'bien_doi_hang_doc_k2', label: 'Biến đổi 1↔2 hàng dọc (Khối 2)', grade: '2', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'di_vach_ke_thang_k2', label: 'Đi vạch kẻ thẳng & kiễng gót (Khối 2)', grade: '2', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'chay_nang_cao_dui', label: 'Chạy nâng cao đùi / Bước nhỏ', grade: '3', folder: 'khoiDong', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'bat_xa_tai_cho', label: 'Bật xa bằng hai chân', grade: '3', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'nhay_lo_co', label: 'Nhảy lò cò / Thăng bằng', grade: '1', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'none' },
  { id: 'nhay_day_chan_truoc_sau_k4', label: 'Nhảy dây kiểu chân trước chân sau (Khối 4)', grade: '4', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'rope' },
  { id: 'nhay_day_ca_nhan', label: 'Nhảy dây cá nhân kiểu chụm chân', grade: '5', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'rope' },
  { id: 'tung_bat_bong_cap_doi', label: 'Tung và bắt bóng (Cặp đôi)', grade: '3', folder: 'luyenTap', sceneMode: 'pair_practice', equipment: 'ball' },
  { id: 'dan_bong_ro_k4', label: 'Dẫn bóng rổ đổi hướng luồn cọc (Khối 4)', grade: '4', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'ball' },
  { id: 'dan_bong_ro', label: 'Dẫn bóng rổ tại chỗ & di chuyển', grade: '5', folder: 'kyThuat', sceneMode: 'sequence_5', equipment: 'ball' },
  { id: 'tro_choi_dua_ngua_k2', label: 'Trò chơi: Đua ngựa tiếp sức (Khối 2)', grade: '2', folder: 'troChoi', sceneMode: 'group_game', equipment: 'flag' },
  { id: 'tro_choi_chuyen_vong_k4', label: 'Trò chơi: Chuyền vòng tiếp sức (Khối 4)', grade: '4', folder: 'troChoi', sceneMode: 'group_game', equipment: 'hoop' },
  { id: 'tro_choi_tiep_suc', label: 'Trò chơi: Chạy tiếp sức', grade: '3', folder: 'troChoi', sceneMode: 'group_game', equipment: 'flag' },
  { id: 'tro_choi_vong_tron', label: 'Trò chơi: Mèo đuổi chuột / Kết bạn', grade: '1', folder: 'troChoiKhoiDong', sceneMode: 'group_game', equipment: 'none' },
  { id: 'tro_choi_keo_co', label: 'Trò chơi: Kéo co đồng đội', grade: '5', folder: 'troChoi', sceneMode: 'group_game', equipment: 'none' },
];

export function buildHdSceneSpecFromKeyword(
  movementName: string,
  options: {
    grade?: '1' | '2' | '3' | '4' | '5';
    sceneMode?: HdSceneMode;
    gender?: HdGender;
    equipment?: HdEquipment;
  } = {}
): HdSceneSpec {
  const grade = options.grade || '1';
  const gender = options.gender || 'male';
  const name = (movementName || 'Động tác thể dục').trim();
  const m = name.toLowerCase();

  let equipment: HdEquipment = options.equipment || 'none';
  if (equipment === 'none') {
    if (m.includes('gậy')) equipment = 'stick';
    else if (m.includes('vòng thể dục') || m.includes('với vòng') || m.includes('chuyền vòng')) equipment = 'hoop';
    else if (m.includes('dây')) equipment = 'rope';
    else if (m.includes('bóng')) equipment = 'ball';
    else if (m.includes('cờ') || m.includes('tiếp sức')) equipment = 'flag';
  }

  let sceneMode: HdSceneMode = options.sceneMode || 'sequence_5';
  if (!options.sceneMode) {
    if (m.includes('trò chơi') || m.includes('tiếp sức') || m.includes('kéo co') || m.includes('mèo đuổi') || m.includes('kết bạn')) {
      sceneMode = 'group_game';
    } else if (m.includes('cặp đôi') || m.includes('chuyền bóng') || m.includes('tung và bắt')) {
      sceneMode = 'pair_practice';
    }
  }

  const subtitle = `Minh họa kỹ thuật chuẩn SGK GDTC Khối ${grade} · Bộ Kết nối tri thức`;
  const defaultBottom = 'Nhịp 5, 6, 7, 8: Thực hiện tương tự như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 đổi chân / đổi bên.';

  if (sceneMode === 'group_game') {
    return {
      title: name,
      subtitle: `Sân chơi vận động Khối ${grade} · Tổ chức theo đội/nhóm an toàn, hào hứng`,
      grade,
      sceneMode: 'group_game',
      gender,
      equipment,
      bottomNote: 'Giáo viên phổ biến luật chơi rõ ràng, quan sát bảo đảm an toàn suốt quá trình chơi.',
      poses: [POSE_TTCB],
    };
  }

  if (sceneMode === 'pair_practice') {
    return {
      title: name,
      subtitle: `Luyện tập cặp đôi Khối ${grade} · Phối hợp & sửa sai cho nhau`,
      grade,
      sceneMode: 'pair_practice',
      gender,
      equipment,
      bottomNote: 'Hai học sinh đứng đối diện hoặc song song cách nhau 1,5 - 2m, thực hiện nhịp nhàng.',
      poses: [
        {
          label: 'Học sinh A',
          caption: equipment === 'ball' ? 'Hai tay cầm bóng ngang ngực, mắt nhìn bạn' : 'Thực hiện động tác làm mẫu chuẩn xác',
          facing: 'profile_right',
          gender: 'male',
          leftUpperDeg: equipment === 'ball' ? 75 : 90,
          leftElbowDeg: 40,
          rightUpperDeg: equipment === 'ball' ? 75 : 90,
          rightElbowDeg: 40,
          leftHipDeg: 14,
          leftKneeDeg: 10,
          rightHipDeg: -10,
          rightKneeDeg: 8,
          motionArc: equipment === 'ball' ? 'throw_ball' : 'none',
          showEquipment: equipment === 'ball',
        },
        {
          label: 'Học sinh B',
          caption: equipment === 'ball' ? 'Hai tay mở sẵn sàng đón bắt bóng từ bạn' : 'Quan sát bạn và nhận xét sửa sai tư thế',
          facing: 'profile_left',
          gender: 'female',
          leftUpperDeg: 82,
          leftElbowDeg: 32,
          rightUpperDeg: 82,
          rightElbowDeg: 32,
          leftHipDeg: 12,
          leftKneeDeg: 8,
          rightHipDeg: -12,
          rightKneeDeg: 8,
          showEquipment: false,
        },
      ],
    };
  }

  // Specific sequence presets
  if (m.includes('vươn thở') || m.includes('vuon tho') || m.includes('thở')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: 'Chân trái bước lên trước, hai tay vươn chữ V ngửa mặt hít sâu',
          headTiltDeg: -10,
          leftUpperDeg: 148,
          leftElbowDeg: 0,
          rightUpperDeg: 148,
          rightElbowDeg: 0,
          leftHipDeg: 22,
          leftKneeDeg: 0,
          rightHipDeg: 8,
          rightKneeDeg: 0,
          palmFacing: 'up',
          motionArc: 'arms_up',
        },
        {
          label: 'Nhịp 2',
          caption: 'Thu chân về TTCB, hai tay hạ xuống bắt chéo trước bụng thở ra',
          headTiltDeg: 8,
          leftUpperDeg: -22,
          leftElbowDeg: 45,
          rightUpperDeg: -22,
          rightElbowDeg: 45,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: 4,
          rightKneeDeg: 0,
          palmFacing: 'down',
          motionArc: 'arms_down',
        },
        {
          label: 'Nhịp 3',
          caption: 'Đổi bước chân phải lên, hai tay vươn cao chữ V hít sâu',
          headTiltDeg: -10,
          leftUpperDeg: 148,
          leftElbowDeg: 0,
          rightUpperDeg: 148,
          rightElbowDeg: 0,
          leftHipDeg: 8,
          leftKneeDeg: 0,
          rightHipDeg: 22,
          rightKneeDeg: 0,
          palmFacing: 'up',
          motionArc: 'arms_up',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Thu chân về, hạ tay dọc theo thân, thở ra hết về TTCB' },
      ],
    };
  }

  if (m.includes('tay') && !m.includes('cổ tay')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: equipment === 'stick' ? 'Bước chân trái sang ngang, đưa gậy thẳng ra trước' : 'Bước chân trái sang ngang, hai tay đưa trước vỗ vào nhau',
          leftUpperDeg: 24,
          leftElbowDeg: 95,
          rightUpperDeg: 24,
          rightElbowDeg: 95,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          motionArc: equipment === 'stick' ? 'arms_out' : 'clap',
        },
        {
          label: 'Nhịp 2',
          caption: equipment === 'stick' ? 'Đưa gậy lên cao thẳng tay qua đầu, mắt nhìn theo gậy' : 'Hai tay dang ngang ngang vai, bàn tay ngửa, mắt nhìn thẳng',
          leftUpperDeg: equipment === 'stick' ? 168 : 90,
          leftElbowDeg: 0,
          rightUpperDeg: equipment === 'stick' ? 168 : 90,
          rightElbowDeg: 0,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          palmFacing: 'up',
          motionArc: 'arms_out',
        },
        {
          label: 'Nhịp 3',
          caption: equipment === 'stick' ? 'Hạ gậy ngang trước ngực như nhịp 1' : 'Hai tay đưa ra trước vỗ vào nhau như nhịp 1',
          leftUpperDeg: 24,
          leftElbowDeg: 95,
          rightUpperDeg: 24,
          rightElbowDeg: 95,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          motionArc: 'clap',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Thu chân trái về, hạ tay xuôi về TTCB' },
      ],
    };
  }

  if (m.includes('chân') && !m.includes('cổ chân')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: 'Kiễng gót hai chân, hai tay dang ngang bàn tay sấp',
          heelRaisePx: 14,
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: 4,
          rightKneeDeg: 0,
          palmFacing: 'down',
          motionArc: 'hop_up',
        },
        {
          label: 'Nhịp 2',
          caption: 'Hạ gót khuỵu sâu gối chụm vào nhau, hai tay chống hông',
          kneeSquat: 0.72,
          leftUpperDeg: 48,
          leftElbowDeg: 105,
          rightUpperDeg: 48,
          rightElbowDeg: 105,
          leftHipDeg: 5,
          leftKneeDeg: 0,
          rightHipDeg: 5,
          rightKneeDeg: 0,
        },
        {
          label: 'Nhịp 3',
          caption: 'Đứng thẳng nhón gót, hai tay dang ngang bàn tay ngửa',
          heelRaisePx: 14,
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: 4,
          rightKneeDeg: 0,
          palmFacing: 'up',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Hạ gót chân, hai tay buông tự nhiên về TTCB' },
      ],
    };
  }

  if (m.includes('lườn') || m.includes('nghiêng')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: 'Bước chân trái sang ngang rộng bằng vai, hai tay dang ngang',
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          palmFacing: 'down',
        },
        {
          label: 'Nhịp 2',
          caption: 'Nghiêng lườn sang trái, tay phải vươn cao sát tai, tay trái chống hông',
          torsoTiltDeg: -22,
          leftUpperDeg: 48,
          leftElbowDeg: 105,
          rightUpperDeg: 162,
          rightElbowDeg: -16,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          motionArc: 'side_left',
        },
        {
          label: 'Nhịp 3',
          caption: 'Đứng thẳng thân người, hai tay dang ngang bàn tay ngửa',
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          palmFacing: 'up',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Thu chân trái về, hạ hai tay xuôi về TTCB' },
      ],
    };
  }

  if (m.includes('bụng') || m.includes('gập')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: 'Bước chân trái sang ngang, hai tay vươn cao song song lòng bàn tay hướng vào',
          leftUpperDeg: 168,
          leftElbowDeg: 0,
          rightUpperDeg: 168,
          rightElbowDeg: 0,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          motionArc: 'arms_up',
        },
        {
          label: 'Nhịp 2',
          caption: 'Cúi gập thân sâu hết biên độ, hai tay vươn chạm mu bàn chân, gối thẳng',
          facing: 'profile_right',
          torsoForwardBend: 0.92,
          headTiltDeg: 25,
          leftUpperDeg: 15,
          leftElbowDeg: 0,
          rightUpperDeg: 15,
          rightElbowDeg: 0,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: -4,
          rightKneeDeg: 0,
          motionArc: 'bend_down',
        },
        {
          label: 'Nhịp 3',
          caption: 'Đứng thẳng người lên, hai tay dang ngang bàn tay ngửa',
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 20,
          leftKneeDeg: 0,
          rightHipDeg: 20,
          rightKneeDeg: 0,
          palmFacing: 'up',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Thu chân trái về tư thế đứng nghiêm TTCB' },
      ],
    };
  }

  if (m.includes('nhảy dây')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment: 'rope',
      bottomNote: 'Hai cổ tay xoay đều dây từ sau ra trước, bật nhảy nhẹ bằng nửa trước bàn chân.',
      poses: [
        {
          ...POSE_TTCB,
          caption: 'Hai tay cầm hai đầu dây, dây để sát phía sau gót chân',
          leftUpperDeg: 25,
          leftElbowDeg: 55,
          rightUpperDeg: 25,
          rightElbowDeg: 55,
        },
        {
          label: 'Quay dây',
          caption: 'Cổ tay xoay nhẹ đưa vòng dây qua đầu hướng xuống đất',
          leftUpperDeg: 40,
          leftElbowDeg: 75,
          rightUpperDeg: 40,
          rightElbowDeg: 75,
          leftHipDeg: 5,
          leftKneeDeg: 0,
          rightHipDeg: 5,
          rightKneeDeg: 0,
        },
        {
          label: 'Bật nhảy',
          caption: 'Chụm hai chân bật nhảy nhẹ vừa đủ để dây lướt qua dưới bàn chân',
          heelRaisePx: 20,
          leftUpperDeg: 38,
          leftElbowDeg: 70,
          rightUpperDeg: 38,
          rightElbowDeg: 70,
          leftHipDeg: 5,
          leftKneeDeg: 22,
          rightHipDeg: 5,
          rightKneeDeg: 22,
          motionArc: 'hop_up',
        },
        {
          label: 'Tiếp đất',
          caption: 'Tiếp đất nhẹ bằng nửa trước bàn chân, hơi khuỵu gối giảm chấn',
          kneeSquat: 0.25,
          leftUpperDeg: 38,
          leftElbowDeg: 70,
          rightUpperDeg: 38,
          rightElbowDeg: 70,
          leftHipDeg: 5,
          leftKneeDeg: 0,
          rightHipDeg: 5,
          rightKneeDeg: 0,
        },
        { ...POSE_TTCB, label: 'Kết thúc', caption: 'Dừng quay dây, hai tay cầm dây buông tự nhiên' },
      ],
    };
  }

  if (m.includes('nhảy') || m.includes('điều hòa') || m.includes('bật')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: defaultBottom,
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Nhịp 1',
          caption: 'Bật nhảy tách hai chân rộng bằng vai, hai tay vỗ trên cao',
          heelRaisePx: 14,
          leftUpperDeg: 145,
          leftElbowDeg: -36,
          rightUpperDeg: 145,
          rightElbowDeg: -36,
          leftHipDeg: 22,
          leftKneeDeg: 0,
          rightHipDeg: 22,
          rightKneeDeg: 0,
          motionArc: 'hop_up',
        },
        {
          label: 'Nhịp 2',
          caption: 'Bật nhảy thu chụm hai chân về, hai tay xuôi dọc theo thân',
          heelRaisePx: 6,
          leftUpperDeg: 10,
          leftElbowDeg: 5,
          rightUpperDeg: 10,
          rightElbowDeg: 5,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: 4,
          rightKneeDeg: 0,
        },
        {
          label: 'Nhịp 3',
          caption: 'Bật nhảy tách chân sang ngang, hai tay dang ngang bàn tay sấp',
          heelRaisePx: 12,
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 22,
          leftKneeDeg: 0,
          rightHipDeg: 22,
          rightKneeDeg: 0,
          palmFacing: 'down',
        },
        { ...POSE_TTCB, label: 'Nhịp 4', caption: 'Bật nhảy chụm chân tiếp đất nhẹ nhàng về TTCB' },
      ],
    };
  }

  if (m.includes('chạy') || m.includes('nâng cao đùi') || m.includes('bước nhỏ')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: 'Đánh tay nhịp nhàng trước - sau theo nhịp chân, giữ lưng thẳng tự nhiên.',
      poses: [
        { ...POSE_TTCB, facing: 'profile_right' },
        {
          label: 'Nhịp 1',
          caption: 'Nâng đùi chân trái vuông góc với thân, tay phải đánh trước co khuỷu 90°',
          facing: 'profile_right',
          heelRaisePx: 8,
          leftUpperDeg: -32,
          leftElbowDeg: 65,
          rightUpperDeg: 42,
          rightElbowDeg: 85,
          leftHipDeg: 78,
          leftKneeDeg: 88,
          rightHipDeg: -8,
          rightKneeDeg: 0,
          motionArc: 'run_forward',
        },
        {
          label: 'Nhịp 2',
          caption: 'Hạ chân trái, nâng nhanh đùi chân phải lên cao, tay trái đánh trước',
          facing: 'profile_right',
          heelRaisePx: 8,
          leftUpperDeg: 42,
          leftElbowDeg: 85,
          rightUpperDeg: -32,
          rightElbowDeg: 65,
          leftHipDeg: -8,
          leftKneeDeg: 0,
          rightHipDeg: 78,
          rightKneeDeg: 88,
          motionArc: 'run_forward',
        },
        {
          label: 'Nhịp 3',
          caption: 'Đổi chân liên tục giữ nhịp đều, tiếp đất bằng nửa trước bàn chân',
          facing: 'profile_right',
          heelRaisePx: 12,
          leftUpperDeg: -32,
          leftElbowDeg: 65,
          rightUpperDeg: 42,
          rightElbowDeg: 85,
          leftHipDeg: 72,
          leftKneeDeg: 82,
          rightHipDeg: -14,
          rightKneeDeg: 10,
          motionArc: 'run_forward',
        },
        { ...POSE_TTCB, facing: 'profile_right', label: 'Nhịp 4', caption: 'Giảm tốc độ, dừng lại về tư thế đứng nghiêm' },
      ],
    };
  }

  if (m.includes('lò cò') || m.includes('thăng bằng')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment,
      bottomNote: 'Giữ thăng bằng mắt nhìn thẳng, đổi chân luân phiên tránh mỏi cơ.',
      poses: [
        { ...POSE_TTCB },
        {
          label: 'Chuẩn bị',
          caption: 'Co một chân ra sau, hai tay dang ngang giữ thăng bằng',
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 2,
          leftKneeDeg: 0,
          rightHipDeg: 22,
          rightKneeDeg: 78,
        },
        {
          label: 'Bật nhảy',
          caption: 'Dùng sức chân trụ bật nhẹ người lên trước bằng nửa trước bàn chân',
          heelRaisePx: 18,
          leftUpperDeg: 95,
          leftElbowDeg: 0,
          rightUpperDeg: 95,
          rightElbowDeg: 0,
          leftHipDeg: 4,
          leftKneeDeg: 0,
          rightHipDeg: 26,
          rightKneeDeg: 85,
          motionArc: 'hop_up',
        },
        {
          label: 'Đổi chân',
          caption: 'Hạ chân và đổi sang chân còn lại giữ thăng bằng ổn định',
          leftUpperDeg: 90,
          leftElbowDeg: 0,
          rightUpperDeg: 90,
          rightElbowDeg: 0,
          leftHipDeg: 22,
          leftKneeDeg: 78,
          rightHipDeg: 2,
          rightKneeDeg: 0,
        },
        { ...POSE_TTCB, label: 'Kết thúc', caption: 'Hạ chân xuống đứng nghiêm về TTCB' },
      ],
    };
  }

  if (m.includes('đứng nghiêm') || m.includes('đứng nghỉ')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment: 'none',
      bottomNote: 'Khẩu lệnh: "Nghiêm!" — "Nghỉ!". Thực hiện dứt khoát, mắt nhìn thẳng.',
      poses: [
        { ...POSE_TTCB, label: 'TTCB', caption: 'Hai chân đứng tự nhiên, mắt nhìn về phía trước' },
        { ...POSE_TTCB, label: 'Đứng nghiêm', caption: 'Gót chân chạm nhau, mũi bàn chân mở hình chữ V, tay áp nhẹ đùi' },
        {
          label: 'Đứng nghỉ (Trái)',
          caption: 'Chùng nhẹ gối trái, dồn trọng tâm sang chân phải thoải mái',
          torsoTiltDeg: 3,
          leftUpperDeg: 10,
          leftElbowDeg: 12,
          rightUpperDeg: 7,
          rightElbowDeg: 4,
          leftHipDeg: 12,
          leftKneeDeg: 30,
          rightHipDeg: 3,
          rightKneeDeg: 0,
        },
        {
          label: 'Đứng nghỉ (Phải)',
          caption: 'Đổi chùng nhẹ gối phải, hai tay buông tự nhiên dọc thân',
          torsoTiltDeg: -3,
          leftUpperDeg: 7,
          leftElbowDeg: 4,
          rightUpperDeg: 10,
          rightElbowDeg: 12,
          leftHipDeg: 3,
          leftKneeDeg: 0,
          rightHipDeg: 12,
          rightKneeDeg: 30,
        },
        { ...POSE_TTCB, label: 'Nghiêm!', caption: 'Thu chân về tư thế Đứng nghiêm chuẩn xác' },
      ],
    };
  }

  if (m.includes('bóng')) {
    return {
      title: name,
      subtitle,
      grade,
      sceneMode,
      gender,
      equipment: 'ball',
      bottomNote: 'Mắt quan sát bóng và hướng di chuyển, tiếp xúc bóng bằng các đầu ngón tay.',
      poses: [
        {
          ...POSE_TTCB,
          caption: 'Hai chân đứng rộng bằng vai, hai tay cầm bóng ngang hông',
          leftUpperDeg: 25,
          leftElbowDeg: 60,
          rightUpperDeg: 25,
          rightElbowDeg: 60,
          leftHipDeg: 14,
          leftKneeDeg: 0,
          rightHipDeg: 14,
          rightKneeDeg: 0,
        },
        {
          label: 'Nhịp 1',
          caption: 'Chùng gối hạ thấp trọng tâm, đẩy bóng xuống mặt sân bằng tay thuận',
          kneeSquat: 0.35,
          leftUpperDeg: 35,
          leftElbowDeg: 40,
          rightUpperDeg: 18,
          rightElbowDeg: 10,
          leftHipDeg: 16,
          leftKneeDeg: 0,
          rightHipDeg: 16,
          rightKneeDeg: 0,
        },
        {
          label: 'Nhịp 2',
          caption: 'Đưa bóng lên cao ngang vai hoặc chuyền bóng về phía trước',
          leftUpperDeg: 118,
          leftElbowDeg: 15,
          rightUpperDeg: 118,
          rightElbowDeg: 15,
          leftHipDeg: 16,
          leftKneeDeg: 0,
          rightHipDeg: 16,
          rightKneeDeg: 0,
          motionArc: 'arms_up',
        },
        {
          label: 'Nhịp 3',
          caption: 'Bắt bóng nhịp nhàng và giữ ổn định trước ngực',
          leftUpperDeg: 45,
          leftElbowDeg: 80,
          rightUpperDeg: 45,
          rightElbowDeg: 80,
          leftHipDeg: 16,
          leftKneeDeg: 0,
          rightHipDeg: 16,
          rightKneeDeg: 0,
        },
        { ...POSE_TTCB, label: 'Kết thúc', caption: 'Thu chân cầm bóng về tư thế chuẩn bị ban đầu' },
      ],
    };
  }

  // Default Phối hợp / Toàn thân exercise (Exact 5-beat Vietnamese GDTC textbook poster)
  return {
    title: name,
    subtitle,
    grade,
    sceneMode,
    gender,
    equipment,
    bottomBadge: 'NHỊP 5, 6, 7, 8',
    bottomNote: 'Thực hiện như nhịp 1, 2, 3, 4, nhưng đổi chân.',
    poses: [
      {
        ...POSE_TTCB,
        label: 'TƯ THẾ CHUẨN BỊ',
        caption: 'Đứng nghiêm.',
      },
      {
        label: 'NHỊP 1',
        caption:
          'Chân trái bước lên một bước chếch sang trái, đồng thời khuỵu gối, chân phải thẳng, hai tay chống hông, thân thẳng, trọng tâm dồn vào chân trái.',
        facing: 'front',
        leftUpperDeg: 50,
        leftElbowDeg: 108,
        rightUpperDeg: 50,
        rightElbowDeg: 108,
        leftHipDeg: 28,
        leftKneeDeg: 32,
        rightHipDeg: 18,
        rightKneeDeg: 0,
        motionArc: 'side_left',
      },
      {
        label: 'NHỊP 2',
        caption:
          'Chân trái thu về sát chân phải, cúi người, gập thân, hai chân thẳng, hai tay với mũi bàn chân.',
        facing: 'front',
        torsoForwardBend: 0.88,
        leftUpperDeg: 10,
        leftElbowDeg: 0,
        rightUpperDeg: 10,
        rightElbowDeg: 0,
        leftHipDeg: 3,
        leftKneeDeg: 0,
        rightHipDeg: 3,
        rightKneeDeg: 0,
        motionArc: 'bend_down',
      },
      {
        label: 'NHỊP 3',
        caption: 'Khuỵu hai gối, lưng thẳng, hai tay dang ngang, bàn tay ngửa.',
        facing: 'front',
        kneeSquat: 0.62,
        leftUpperDeg: 90,
        leftElbowDeg: 0,
        rightUpperDeg: 90,
        rightElbowDeg: 0,
        leftHipDeg: 6,
        leftKneeDeg: 0,
        rightHipDeg: 6,
        rightKneeDeg: 0,
        palmFacing: 'up',
        motionArc: 'arms_out',
      },
      {
        ...POSE_TTCB,
        label: 'NHỊP 4',
        caption: 'Về tư thế đứng nghiêm.',
        motionArc: 'arms_down',
      },
    ],
  };
}
