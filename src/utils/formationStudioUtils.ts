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
    | 'sgk_board';
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
        case 'gv':
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <polygon points="0,-18 -16,14 16,14" fill="${el.color || '#dc2626'}" />
              <text x="0" y="28" font-family="sans-serif" font-size="13" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle"> ${el.label || 'GV'}</text>
            </g>
          `;
        case 'hs': {
          const r = el.radius || 11;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#2563eb'}" stroke="#ffffff" stroke-width="2"/>
              ${el.label ? `<text x="0" y="4" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'cs': {
          const r = el.radius || 12;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#0284c7'}" stroke="#ffffff" stroke-width="2"/>
              <text x="0" y="4.5" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${el.label || 'CS'}</text>
            </g>
          `;
        }
        case 'tt': {
          const r = el.radius || 12;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#ea580c'}" stroke="#ffffff" stroke-width="2"/>
              <text x="0" y="4.5" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${el.label || 'TT'}</text>
            </g>
          `;
        }
        case 'shape_rect': {
          const w = el.width || 120;
          const h = el.height || 70;
          return `
            <g transform="translate(${el.x}, ${el.y})">
              <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${el.color || '#eff6ff'}" fill-opacity="0.4" stroke="${el.color || '#3b82f6'}" stroke-width="2" stroke-dasharray="5,4"/>
              ${el.label ? `<text x="0" y="${-h / 2 + 18}" font-family="sans-serif" font-size="12" font-weight="bold" fill="${el.color || '#1d4ed8'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'shape_circle': {
          const r = el.radius || 40;
          return `
            <g transform="translate(${el.x}, ${el.y})">
              <circle cx="0" cy="0" r="${r}" fill="${el.color || '#eff6ff'}" fill-opacity="0.35" stroke="${el.color || '#3b82f6'}" stroke-width="2" stroke-dasharray="5,4"/>
              ${el.label ? `<text x="0" y="5" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#1d4ed8'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'line_solid': {
          const x2 = el.endX ?? (el.x + (el.width || 80));
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#dc2626'}" stroke-width="3" stroke-linecap="round"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'line_dashed': {
          const x2 = el.endX ?? (el.x + (el.width || 80));
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#0284c7'}" stroke-width="2.5" stroke-dasharray="6,4" stroke-linecap="round"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#0284c7'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'arrow_straight': {
          const x2 = el.endX ?? (el.x + 70);
          const y2 = el.endY ?? el.y;
          return `
            <g>
              <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.color || '#16a34a'}" stroke-width="2.8" marker-end="url(#arrowMarker)"/>
              ${el.label ? `<text x="${(el.x + x2) / 2}" y="${(el.y + y2) / 2 - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#16a34a'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'arrow_curved': {
          const x2 = el.endX ?? (el.x + 80);
          const y2 = el.endY ?? el.y;
          const midX = (el.x + x2) / 2;
          const midY = Math.min(el.y, y2) - 40;
          return `
            <g>
              <path d="M ${el.x} ${el.y} Q ${midX} ${midY} ${x2} ${y2}" fill="none" stroke="${el.color || '#ea580c'}" stroke-width="2.8" marker-end="url(#arrowMarkerOrange)"/>
              ${el.label ? `<text x="${midX}" y="${midY - 8}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#ea580c'}" text-anchor="middle">${el.label}</text>` : ''}
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
              ${el.label ? `<text x="0" y="${r + 14}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#c2410c" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'cone': {
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <polygon points="0,-16 -12,12 12,12" fill="${el.color || '#ea580c'}"/>
              <rect x="-14" y="10" width="28" height="4" rx="2" fill="${el.color || '#c2410c'}"/>
              <polygon points="0,-6 -6,6 6,6" fill="#ffffff" opacity="0.6"/>
              ${el.label ? `<text x="0" y="24" font-family="sans-serif" font-size="11" font-weight="bold" fill="${el.color || '#ea580c'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'marker': {
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="${el.color || '#eab308'}" stroke="#ca8a04" stroke-width="1.5"/>
              <circle cx="0" cy="-1" r="3" fill="#ca8a04"/>
              ${el.label ? `<text x="0" y="17" font-family="sans-serif" font-size="10" font-weight="bold" fill="#a16207" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'hoop': {
          const r = el.radius || 20;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="${r}" fill="none" stroke="${el.color || '#06b6d4'}" stroke-width="4.5"/>
              ${el.label ? `<text x="0" y="${r + 14}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${el.color || '#0891b2'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'stick': {
          const len = el.width || 60;
          return `
            <g transform="translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})" filter="url(#dropShadow)">
              <rect x="${-len / 2}" y="-4" width="${len}" height="8" rx="4" fill="${el.color || '#f59e0b'}" stroke="#b45309" stroke-width="1.5"/>
              ${el.label ? `<text x="0" y="18" font-family="sans-serif" font-size="10" font-weight="bold" fill="#b45309" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'flag': {
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <line x1="0" y1="16" x2="0" y2="-18" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
              <polygon points="0,-18 18,-11 0,-4" fill="${el.color || '#dc2626'}"/>
              <circle cx="0" cy="16" r="4" fill="#334155"/>
              ${el.label ? `<text x="0" y="29" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="${el.color || '#dc2626'}" text-anchor="middle">${el.label}</text>` : ''}
            </g>
          `;
        }
        case 'text': {
          return `
            <text x="${el.x}" y="${el.y}" font-family="sans-serif" font-size="${el.fontSize || 13}" font-weight="bold" fill="${el.color || '#1e293b'}" text-anchor="middle">
              ${el.label || 'Ghi chú'}
            </text>
          `;
        }
        case 'sgk_board': {
          const w = el.width || 120;
          const h = el.height || 65;
          return `
            <g transform="translate(${el.x}, ${el.y})" filter="url(#dropShadow)">
              <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
              <text x="0" y="${-h / 2 + 20}" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#b45309" text-anchor="middle">📖 TRANH KỸ THUẬT</text>
              <text x="0" y="${-h / 2 + 40}" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#92400e" text-anchor="middle">${el.label || 'Động Tác Mẫu SGK'}</text>
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
