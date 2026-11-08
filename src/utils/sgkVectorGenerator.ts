/**
 * Generates authentic, pedagogically precise 2D vector illustrations matching
 * Vietnamese Elementary PE Textbooks (SGK GDTC Bộ Kết Nối Tri Thức Với Cuộc Sống).
 */

export interface MovementBeats {
  ttcb?: string;
  nhip1?: string;
  nhip2?: string;
  nhip3?: string;
  nhip4?: string;
  nhip58?: string;
}

export function generateSgk2dSequenceSvg(
  movementName: string = 'Động tác Tay',
  grade: string | number = 1,
  characterMode: 'single' | 'pair' | 'group' = 'single',
  gender: 'male' | 'female' = 'male',
  customBeats?: MovementBeats
): string {
  const mLower = (movementName || '').toLowerCase();
  const nhip1Lower = (customBeats?.nhip1 || '').toLowerCase();
  const nhip2Lower = (customBeats?.nhip2 || '').toLowerCase();

  // Detection
  const isCustomLegHeel = (nhip1Lower.includes('kiễng') || nhip1Lower.includes('nhón') || nhip1Lower.includes('sấp')) &&
    (nhip2Lower.includes('khuỵu') || nhip2Lower.includes('chống hông'));

  const isArm = !isCustomLegHeel && mLower.includes('tay') && !mLower.includes('cổ tay');
  const isBreathing = mLower.includes('vươn thở') || mLower.includes('vuon tho') || mLower.includes('thở');
  const isLeg = isCustomLegHeel || (mLower.includes('chân') && !mLower.includes('cổ chân'));
  const isFlank = mLower.includes('lườn') || mLower.includes('luon') || mLower.includes('nghiêng');
  const isBelly = mLower.includes('bụng') || mLower.includes('bung') || mLower.includes('gập thân');
  const isJump = mLower.includes('nhảy') || mLower.includes('nhay');
  const hasStick = mLower.includes('gậy') || String(grade) === '5';

  // Palette: Clean authentic 2D flat colors
  const skin = '#fce7d6';
  const skinShadow = '#f3cbb4';
  const hair = '#1e293b';
  const shirtWhite = '#ffffff';
  const blueTrim = '#2563eb';
  const pantsBlue = '#1d4ed8';
  const pantsShadow = '#1e40af';
  const pantsStripe = '#ffffff';
  const shoeWhite = '#f8fafc';
  const shoeBlue = '#3b82f6';
  const stickColor = '#ef4444';
  const groundLine = '#cbd5e1';

  const width = 860;
  const height = 330;

  // Determine subtitles for steps based on customBeats or exact SGK curriculum
  let stepSubs = [
    customBeats?.ttcb || 'Đứng nghiêm',
    customBeats?.nhip1 || 'Thực hiện nhịp 1',
    customBeats?.nhip2 || 'Thực hiện nhịp 2',
    customBeats?.nhip3 || 'Như nhịp 1',
    customBeats?.nhip4 || 'Về TTCB'
  ];

  if (!customBeats?.nhip1) {
    if (isArm) {
      stepSubs = [
        'Đứng nghiêm',
        'Chân trái bước sang ngang, hai tay đưa ra trước vỗ vào nhau',
        'Hai tay dang ngang, bàn tay ngửa',
        'Hai tay như nhịp 1',
        'Về TTCB'
      ];
    } else if (isBreathing) {
      stepSubs = [
        'Đứng nghiêm',
        'Chân trái bước lên trước, hai tay vươn chữ V ngửa đầu hít sâu',
        'Thu chân về, hai tay hạ chéo trước bụng thở ra',
        'Như nhịp 1 đổi chân phải',
        'Về TTCB'
      ];
    } else if (isLeg) {
      stepSubs = [
        'Đứng nghiêm',
        'Nhón gót hai chân, hai tay chống hông (hoặc dang ngang sấp)',
        'Khuỵu sâu gối, hai tay đưa trước sấp (hoặc chống hông)',
        'Đứng thẳng nhón gót, hai tay dang ngang',
        'Về TTCB'
      ];
    } else if (isFlank) {
      stepSubs = [
        'Đứng nghiêm',
        'Chân trái bước sang ngang, hai tay chống hông',
        'Nghiêng lườn sang trái, tay phải vươn cao ép sát tai',
        'Đứng thẳng, hai tay dang ngang bàn tay ngửa',
        'Về TTCB'
      ];
    } else if (isBelly) {
      stepSubs = [
        'Đứng nghiêm',
        'Chân trái bước sang ngang, hai tay vươn cao song song',
        'Cúi gập thân sâu, hai tay chạm mu bàn chân',
        'Đứng thẳng lên, hai tay dang ngang',
        'Về TTCB'
      ];
    } else if (isJump) {
      stepSubs = [
        'Đứng nghiêm',
        hasStick ? 'Bật nhảy tách chân, hai tay đưa gậy lên cao' : 'Bật nhảy tách chân, hai tay vỗ trên đầu',
        hasStick ? 'Bật nhảy chụm chân, hạ gậy ngang đùi' : 'Bật nhảy chụm chân, hai tay xuôi theo thân',
        'Như nhịp 1',
        'Về TTCB'
      ];
    }
  }

  // Draw 1 student character figure
  function drawFigure(cx: number, baseY: number, stepIdx: number): string {
    const headY = baseY - 165;
    const shoulderY = baseY - 138;
    const waistY = baseY - 88;
    const crotchY = baseY - 82;
    const kneeY = baseY - 42;
    const ankleY = baseY - 8;

    let armLeft = '';
    let armRight = '';
    let legLeft = '';
    let legRight = '';
    let torso = '';
    let stick = '';

    // STEP 0 & 4: TTCB (Đứng nghiêm)
    if (stepIdx === 0 || stepIdx === 4) {
      legLeft = `
        <path d="M ${cx - 10} ${crotchY} L ${cx - 10} ${kneeY} L ${cx - 9} ${ankleY} L ${cx - 16} ${ankleY} L ${cx - 16} ${baseY} L ${cx - 3} ${baseY} L ${cx - 2} ${ankleY} L ${cx - 3} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
        <line x1="${cx - 14}" y1="${crotchY + 8}" x2="${cx - 14}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
        <rect x="${cx - 18}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        <path d="M ${cx - 18} ${baseY - 3} L ${cx} ${baseY - 3}" stroke="${shoeBlue}" stroke-width="2"/>
      `;
      legRight = `
        <path d="M ${cx + 3} ${crotchY} L ${cx + 2} ${ankleY} L ${cx + 3} ${baseY} L ${cx + 16} ${baseY} L ${cx + 16} ${ankleY} L ${cx + 10} ${kneeY} L ${cx + 10} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
        <line x1="${cx + 14}" y1="${crotchY + 8}" x2="${cx + 14}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
        <rect x="${cx}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        <path d="M ${cx} ${baseY - 3} L ${cx + 18} ${baseY - 3}" stroke="${shoeBlue}" stroke-width="2"/>
      `;
      torso = `
        <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M ${cx - 10} ${shoulderY} L ${cx} ${shoulderY + 9} L ${cx + 10} ${shoulderY}" stroke="${blueTrim}" stroke-width="2.5" fill="none"/>
      `;
      armLeft = `
        <path d="M ${cx - 18} ${shoulderY} L ${cx - 24} ${shoulderY + 28} L ${cx - 20} ${waistY + 12}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="${cx - 20}" cy="${waistY + 15}" r="4" fill="${skin}"/>
      `;
      armRight = `
        <path d="M ${cx + 18} ${shoulderY} L ${cx + 24} ${shoulderY + 28} L ${cx + 20} ${waistY + 12}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="${cx + 20}" cy="${waistY + 15}" r="4" fill="${skin}"/>
      `;
      if (hasStick) {
        stick = `<line x1="${cx - 32}" y1="${waistY + 15}" x2="${cx + 32}" y2="${waistY + 15}" stroke="${stickColor}" stroke-width="3.5" stroke-linecap="round"/>`;
      }
    }

    // STEP 1 & 3: NHỊP 1 VÀ NHỊP 3
    else if (stepIdx === 1 || stepIdx === 3) {
      if (isCustomLegHeel || (nhip1Lower.includes('dang ngang') && (nhip1Lower.includes('kiễng') || nhip1Lower.includes('nhón')))) {
        // VÍ DỤ CỦA THẦY: Kiễng gót chân, hai tay dang ngang bàn tay sấp
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 8}" y2="${baseY - 14}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <line x1="${cx - 12}" y1="${crotchY + 6}" x2="${cx - 12}" y2="${baseY - 14}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx - 16}" y="${baseY - 14}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 8}" y2="${baseY - 14}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <line x1="${cx + 12}" y1="${crotchY + 6}" x2="${cx + 12}" y2="${baseY - 14}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx}" y="${baseY - 14}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY - 6} L ${cx + 18} ${shoulderY - 6} L ${cx + 15} ${waistY - 6} L ${cx - 15} ${waistY - 6} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
          <path d="M ${cx - 10} ${shoulderY - 6} L ${cx} ${shoulderY + 3} L ${cx + 10} ${shoulderY - 6}" stroke="${blueTrim}" stroke-width="2.5" fill="none"/>
        `;
        // Hai tay dang ngang, bàn tay sấp (úp xuống)
        armLeft = `
          <line x1="${cx - 18}" y1="${shoulderY - 2}" x2="${cx - 52}" y2="${shoulderY - 2}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <path d="M ${cx - 58} ${shoulderY - 2} Q ${cx - 55} ${shoulderY - 7} ${cx - 52} ${shoulderY - 2}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx - 55}" cy="${shoulderY - 3}" r="3.5" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 18}" y1="${shoulderY - 2}" x2="${cx + 52}" y2="${shoulderY - 2}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <path d="M ${cx + 52} ${shoulderY - 2} Q ${cx + 55} ${shoulderY - 7} ${cx + 58} ${shoulderY - 2}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx + 55}" cy="${shoulderY - 3}" r="3.5" fill="${skin}"/>
        `;
      } else if (isArm) {
        // ĐỘNG TÁC TAY: Chân trái bước sang ngang, hai tay đưa ra trước vỗ vào nhau
        legLeft = `
          <path d="M ${cx - 6} ${crotchY} L ${cx - 22} ${kneeY} L ${cx - 28} ${ankleY} L ${cx - 34} ${ankleY} L ${cx - 34} ${baseY} L ${cx - 18} ${baseY} L ${cx - 16} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <line x1="${cx - 32}" y1="${crotchY + 6}" x2="${cx - 32}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx - 36}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <path d="M ${cx + 6} ${crotchY} L ${cx + 18} ${kneeY} L ${cx + 22} ${ankleY} L ${cx + 22} ${baseY} L ${cx + 36} ${baseY} L ${cx + 34} ${ankleY} L ${cx + 16} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <line x1="${cx + 32}" y1="${crotchY + 6}" x2="${cx + 32}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx + 18}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        armLeft = `
          <path d="M ${cx - 18} ${shoulderY + 2} L ${cx - 6} ${shoulderY + 22} L ${cx - 2} ${shoulderY + 28}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 2}" cy="${shoulderY + 28}" r="4.5" fill="${skin}"/>
        `;
        armRight = `
          <path d="M ${cx + 18} ${shoulderY + 2} L ${cx + 6} ${shoulderY + 22} L ${cx + 2} ${shoulderY + 28}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 2}" cy="${shoulderY + 28}" r="4.5" fill="${skin}"/>
        `;
        stick = `
          <line x1="${cx - 8}" y1="${shoulderY + 23}" x2="${cx - 4}" y2="${shoulderY + 25}" stroke="#f59e0b" stroke-width="1.5"/>
          <line x1="${cx + 8}" y1="${shoulderY + 23}" x2="${cx + 4}" y2="${shoulderY + 25}" stroke="#f59e0b" stroke-width="1.5"/>
        `;
      } else {
        // Mặc định: chân bước ngang
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 28}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx + 10}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        armLeft = `
          <line x1="${cx - 18}" y1="${shoulderY}" x2="${cx - 36}" y2="${shoulderY - 44}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 38}" cy="${shoulderY - 46}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 18}" y1="${shoulderY}" x2="${cx + 36}" y2="${shoulderY - 44}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 38}" cy="${shoulderY - 46}" r="4" fill="${skin}"/>
        `;
      }
    }

    // STEP 2: NHỊP 2
    else {
      if (isCustomLegHeel || (nhip2Lower.includes('khuỵu') && nhip2Lower.includes('hông'))) {
        // VÍ DỤ CỦA THẦY: Khuỵu gối chụm vào nhau, hai tay chống hông
        legLeft = `
          <path d="M ${cx - 10} ${crotchY + 12} L ${cx - 1} ${kneeY + 14} L ${cx - 10} ${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="${cx - 16}" y="${baseY - 7}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <path d="M ${cx + 10} ${crotchY + 12} L ${cx + 1} ${kneeY + 14} L ${cx + 10} ${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="${cx}" y="${baseY - 7}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY + 12} L ${cx + 18} ${shoulderY + 12} L ${cx + 15} ${waistY + 12} L ${cx - 15} ${waistY + 12} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
          <path d="M ${cx - 10} ${shoulderY + 12} L ${cx} ${shoulderY + 21} L ${cx + 10} ${shoulderY + 12}" stroke="${blueTrim}" stroke-width="2.5" fill="none"/>
        `;
        // Hai tay chống hai bên hông
        armLeft = `
          <path d="M ${cx - 18} ${shoulderY + 14} L ${cx - 28} ${waistY + 2} L ${cx - 16} ${waistY + 14}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 16}" cy="${waistY + 14}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <path d="M ${cx + 18} ${shoulderY + 14} L ${cx + 28} ${waistY + 2} L ${cx + 16} ${waistY + 14}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 16}" cy="${waistY + 14}" r="4" fill="${skin}"/>
        `;
      } else if (isArm) {
        // Động tác tay: Hai tay dang ngang, bàn tay ngửa
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 28}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx + 10}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        armLeft = `
          <line x1="${cx - 18}" y1="${shoulderY + 4}" x2="${cx - 52}" y2="${shoulderY + 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <path d="M ${cx - 58} ${shoulderY + 3} Q ${cx - 55} ${shoulderY + 8} ${cx - 52} ${shoulderY + 3}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx - 55}" cy="${shoulderY + 4}" r="3.5" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 18}" y1="${shoulderY + 4}" x2="${cx + 52}" y2="${shoulderY + 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <path d="M ${cx + 52} ${shoulderY + 3} Q ${cx + 55} ${shoulderY + 8} ${cx + 58} ${shoulderY + 3}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx + 55}" cy="${shoulderY + 4}" r="3.5" fill="${skin}"/>
        `;
      } else if (isBelly) {
        // Động tác bụng: Cúi gập thân sâu
        legLeft = `
          <line x1="${cx - 14}" y1="${crotchY + 12}" x2="${cx - 14}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 22}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 14}" y1="${crotchY + 12}" x2="${cx + 14}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx + 4}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 16} ${crotchY + 10} L ${cx - 22} ${crotchY + 45} L ${cx + 22} ${crotchY + 45} L ${cx + 16} ${crotchY + 10} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        armLeft = `
          <line x1="${cx - 16}" y1="${crotchY + 35}" x2="${cx - 18}" y2="${baseY - 10}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 18}" cy="${baseY - 9}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 16}" y1="${crotchY + 35}" x2="${cx + 18}" y2="${baseY - 10}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 18}" cy="${baseY - 9}" r="4" fill="${skin}"/>
        `;
      } else {
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 8}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 14}" y="${baseY - 7}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 8}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 2}" y="${baseY - 7}" width="16" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        armLeft = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx - 24} ${shoulderY + 28} L ${cx - 20} ${waistY + 12}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 20}" cy="${waistY + 15}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <path d="M ${cx + 18} ${shoulderY} L ${cx + 24} ${shoulderY + 28} L ${cx + 20} ${waistY + 12}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 20}" cy="${waistY + 15}" r="4" fill="${skin}"/>
        `;
      }
    }

    // Head, face, hair
    const head = `
      <circle cx="${cx}" cy="${headY}" r="14" fill="${skin}" stroke="${skinShadow}" stroke-width="1"/>
      <path d="M ${cx - 15} ${headY - 2} C ${cx - 16} ${headY - 16}, ${cx + 16} ${headY - 16}, ${cx + 15} ${headY - 2} C ${cx + 12} ${headY - 7}, ${cx - 12} ${headY - 7}, ${cx - 15} ${headY - 2} Z" fill="${hair}"/>
      <circle cx="${cx - 4}" cy="${headY + 1}" r="1.5" fill="#0f172a"/>
      <circle cx="${cx + 4}" cy="${headY + 1}" r="1.5" fill="#0f172a"/>
      <path d="M ${cx - 3} ${headY + 6} Q ${cx} ${headY + 9} ${cx + 3} ${headY + 6}" stroke="#dc2626" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    `;

    return `
      <g id="figure_step_${stepIdx}">
        ${legLeft}
        ${legRight}
        ${torso}
        ${armLeft}
        ${armRight}
        ${stick}
        ${head}
      </g>
    `;
  }

  // Generate 5 figures horizontally at x = 95, 260, 430, 600, 765
  const stepLabels = ['TTCB', 'Nhịp 1', 'Nhịp 2', 'Nhịp 3', 'Nhịp 4'];
  const figures = [95, 260, 430, 600, 765].map((cx, idx) => {
    const f = drawFigure(cx, 225, idx);
    const label = stepLabels[idx];
    const sub = stepSubs[idx];
    return `
      ${f}
      <rect x="${cx - 30}" y="244" width="60" height="22" rx="11" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
      <text x="${cx}" y="259" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1" text-anchor="middle">${label}</text>
      <foreignObject x="${cx - 75}" y="270" width="150" height="48">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Roboto, sans-serif; font-size: 9.5px; line-height: 1.25; color: #475569; text-align: center; font-weight: 500;">
          ${sub}
        </div>
      </foreignObject>
    `;
  }).join('\n');

  const bottomNote = customBeats?.nhip58 || 'Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 đổi chân / đổi bên.';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#ffffff" rx="12"/>
      
      <rect x="25" y="14" width="30" height="30" rx="15" fill="#0284c7"/>
      <text x="40" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
      <text x="65" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${movementName}</text>
      <text x="65" y="50" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-style="italic" fill="#64748b">Tranh kỹ thuật phân thế chuẩn SGK GDTC Khối ${grade} (Bộ Kết Nối Tri Thức)</text>

      <line x1="35" y1="225" x2="825" y2="225" stroke="${groundLine}" stroke-width="1.5" stroke-dasharray="4 2"/>

      ${figures}

      <rect x="180" y="306" width="500" height="18" rx="9" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="430" y="319" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="600" font-style="italic" fill="#0284c7" text-anchor="middle">
        ${bottomNote}
      </text>
    </svg>
  `.trim();
}

/**
 * Generates an authentic pedagogical formation layout diagram:
 * e.g. "Tập đồng loạt 4 hàng ngang giãn cách cự ly 1 sải tay"
 */
export function generateFormationSvg(
  title: string = 'Tập đồng loạt 4 hàng ngang giãn cách',
  grade: string | number = 1
): string {
  const width = 860;
  const height = 440;

  // 4 rows of students, staggered (so le)
  // Row 1 (y = 170): 6 students
  // Row 2 (y = 230): 5 students (staggered)
  // Row 3 (y = 290): 6 students
  // Row 4 (y = 350): 5 students (staggered)

  function drawStudentDot(cx: number, cy: number, label: string): string {
    return `
      <g>
        <circle cx="${cx}" cy="${cy}" r="11" fill="#1d4ed8" stroke="#1e40af" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy - 2}" r="4" fill="#fce7d6"/>
        <text x="${cx}" y="${cy + 22}" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="600" fill="#475569" text-anchor="middle">${label}</text>
        <!-- Mũi tên hướng nhìn lên GV -->
        <line x1="${cx}" y1="${cy - 12}" x2="${cx}" y2="${cy - 20}" stroke="#0284c7" stroke-width="1.5"/>
        <polygon points="${cx},${cy - 24} ${cx - 3},${cy - 19} ${cx + 3},${cy - 19}" fill="#0284c7"/>
      </g>
    `;
  }

  // Row coordinates
  const row1X = [180, 270, 360, 450, 540, 630];
  const row2X = [225, 315, 405, 495, 585];
  const row3X = [180, 270, 360, 450, 540, 630];
  const row4X = [225, 315, 405, 495, 585];

  const studentsSvg = [
    row1X.map((x, i) => drawStudentDot(x, 170, `H1.${i + 1}`)).join('\n'),
    row2X.map((x, i) => drawStudentDot(x, 230, `H2.${i + 1}`)).join('\n'),
    row3X.map((x, i) => drawStudentDot(x, 290, `H3.${i + 1}`)).join('\n'),
    row4X.map((x, i) => drawStudentDot(x, 350, `H4.${i + 1}`)).join('\n'),
  ].join('\n');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Nền trắng trong sáng in ấn -->
      <rect width="100%" height="100%" fill="#ffffff" rx="14"/>
      
      <!-- Khung sân tập kẻ viền -->
      <rect x="25" y="20" width="810" height="400" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Tiêu đề sơ đồ -->
      <rect x="40" y="32" width="28" height="28" rx="14" fill="#0284c7"/>
      <text x="54" y="51" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">SĐ</text>
      <text x="78" y="47" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">${title}</text>
      <text x="78" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-style="italic" fill="#64748b">Sơ đồ bố trí sân tập luyện sư phạm GDTC Khối ${grade} (Bộ Kết Nối Tri Thức)</text>

      <!-- Vị trí Giáo viên phía trước -->
      <g>
        <rect x="360" y="75" width="140" height="36" rx="8" fill="#dc2626" stroke="#b91c1c" stroke-width="1.5"/>
        <text x="430" y="98" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle"> GV HƯỚNG DẪN</text>
        <circle cx="430" cy="120" r="7" fill="#dc2626"/>
      </g>

      <!-- Đường kẻ khoảng cách GV và hàng 1 -->
      <line x1="150" y1="135" x2="710" y2="135" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5"/>
      <text x="735" y="139" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="600" fill="#64748b">Cách 3 - 4m</text>

      <!-- Thước đo cự ly giãn cách 1 sải tay -->
      <g>
        <line x1="270" y1="155" x2="360" y2="155" stroke="#0284c7" stroke-width="2" marker-start="url(#arr-l)" marker-end="url(#arr-r)"/>
        <text x="315" y="150" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="bold" fill="#0284c7" text-anchor="middle">↔ 1 sải tay ↔</text>
      </g>

      <!-- 4 Hàng ngang so le học sinh -->
      ${studentsSvg}

      <!-- Nhãn hàng bên trái -->
      <text x="120" y="174" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#1e293b">Hàng 1 ▶</text>
      <text x="120" y="234" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#1e293b">Hàng 2 ▶</text>
      <text x="120" y="294" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#1e293b">Hàng 3 ▶</text>
      <text x="120" y="354" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#1e293b">Hàng 4 ▶</text>

      <!-- Ghi chú sư phạm ở đáy -->
      <rect x="160" y="388" width="540" height="22" rx="11" fill="#eff6ff" stroke="#bfdbfe"/>
      <text x="430" y="403" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">
        💡 Đội hình 4 hàng ngang đứng so le, cự ly 1 sải tay đồng loạt thực hiện bài thể dục theo nhịp hô.
      </text>
    </svg>
  `.trim();
}
