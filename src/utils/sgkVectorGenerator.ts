/**
 * Generates authentic, pedagogically precise 2D vector illustrations matching
 * Vietnamese Elementary PE Textbooks (SGK GDTC Bộ Kết Nối Tri Thức Với Cuộc Sống).
 *
 * Exact limb poses for standard curriculum movements:
 * 1. Động tác Tay:
 *    - TTCB: Đứng nghiêm
 *    - Nhịp 1: Chân trái bước sang ngang, hai tay đưa ra trước vỗ vào nhau
 *    - Nhịp 2: Hai tay dang ngang, bàn tay ngửa
 *    - Nhịp 3: Hai tay như nhịp 1 (đưa ra trước vỗ vào nhau)
 *    - Nhịp 4: Về TTCB
 * 2. Động tác Vươn thở:
 *    - Nhịp 1: Chân trái bước lên trước, hai tay vươn chếch chữ V lên cao, ngửa đầu hít sâu
 *    - Nhịp 2: Thu chân về, hai tay hạ chéo trước bụng, cúi đầu thở ra
 * 3. Động tác Chân:
 *    - Nhịp 1: Nhón gót hai chân, hai tay chống hông
 *    - Nhịp 2: Khuỵu sâu hai đầu gối, hai tay đưa thẳng ra trước lòng bàn tay sấp
 *    - Nhịp 3: Đứng thẳng lên nhón gót, hai tay dang ngang lòng bàn tay ngửa
 * 4. Động tác Lườn:
 *    - Nhịp 1: Chân trái bước sang ngang, hai tay chống hông
 *    - Nhịp 2: Nghiêng lườn sang trái, tay phải vươn cao ép sát tai, tay trái chống hông
 *    - Nhịp 3: Đứng thẳng, hai tay dang ngang lòng bàn tay ngửa
 * 5. Động tác Bụng:
 *    - Nhịp 1: Chân trái bước sang ngang, hai tay vươn cao song song
 *    - Nhịp 2: Cúi gập thân sâu, hai tay chạm mu bàn chân
 *    - Nhịp 3: Đứng thẳng, hai tay dang ngang lòng bàn tay ngửa
 * 6. Động tác Nhảy / Nhảy với gậy (Lớp 5):
 *    - Nhịp 1: Bật nhảy tách hai chân sang ngang, đưa gậy lên cao
 *    - Nhịp 2: Bật nhảy khép chân về, hạ gậy ngang đùi
 */

export function generateSgk2dSequenceSvg(
  movementName: string = 'Động tác Tay',
  grade: string | number = 1,
  characterMode: 'single' | 'pair' | 'group' = 'single',
  gender: 'male' | 'female' = 'male'
): string {
  const mLower = (movementName || '').toLowerCase();

  const isArm = mLower.includes('tay') && !mLower.includes('cổ tay');
  const isBreathing = mLower.includes('vươn thở') || mLower.includes('vuon tho') || mLower.includes('thở');
  const isLeg = mLower.includes('chân') && !mLower.includes('cổ chân');
  const isFlank = mLower.includes('lườn') || mLower.includes('luon') || mLower.includes('nghiêng');
  const isBelly = mLower.includes('bụng') || mLower.includes('bung') || mLower.includes('gập thân');
  const isTwist = mLower.includes('vặn mình') || mLower.includes('van minh');
  const isJump = mLower.includes('nhảy') || mLower.includes('nhay');
  const hasStick = mLower.includes('gậy') || String(grade) === '5';

  // Palette: Clean authentic 2D flat colors
  const skin = '#fce7d6';
  const skinShadow = '#f3cbb4';
  const hair = '#1e293b';
  const shirtWhite = '#ffffff';
  const shirtShadow = '#e2e8f0';
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

  // Determine subtitles for steps based on exact SGK curriculum
  let stepSubs = [
    'Đứng nghiêm',
    'Thực hiện nhịp 1',
    'Thực hiện nhịp 2',
    'Hai tay như nhịp 1',
    'Về TTCB'
  ];

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
      'Nhón gót hai chân, hai tay chống hông',
      'Khuỵu sâu gối, hai tay đưa trước lòng bàn tay sấp',
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

    // ==========================================
    // STEP 0 & 4: TTCB (Đứng nghiêm)
    // ==========================================
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

    // ==========================================
    // STEP 1 & 3: NHỊP 1 VÀ NHỊP 3
    // ==========================================
    else if (stepIdx === 1 || stepIdx === 3) {
      if (isArm) {
        // ĐỘNG TÁC TAY NHỊP 1: Chân trái bước sang ngang, hai tay đưa ra trước vỗ vào nhau
        legLeft = `
          <path d="M ${cx - 6} ${crotchY} L ${cx - 22} ${kneeY} L ${cx - 28} ${ankleY} L ${cx - 34} ${ankleY} L ${cx - 34} ${baseY} L ${cx - 18} ${baseY} L ${cx - 16} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <line x1="${cx - 32}" y1="${crotchY + 6}" x2="${cx - 32}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx - 36}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
          <path d="M ${cx - 36} ${baseY - 3} L ${cx - 18} ${baseY - 3}" stroke="${shoeBlue}" stroke-width="2"/>
        `;
        legRight = `
          <path d="M ${cx + 6} ${crotchY} L ${cx + 18} ${kneeY} L ${cx + 22} ${ankleY} L ${cx + 22} ${baseY} L ${cx + 36} ${baseY} L ${cx + 34} ${ankleY} L ${cx + 16} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <line x1="${cx + 32}" y1="${crotchY + 6}" x2="${cx + 32}" y2="${ankleY}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx + 18}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
          <path d="M ${cx + 18} ${baseY - 3} L ${cx + 36} ${baseY - 3}" stroke="${shoeBlue}" stroke-width="2"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
          <path d="M ${cx - 10} ${shoulderY} L ${cx} ${shoulderY + 9} L ${cx + 10} ${shoulderY}" stroke="${blueTrim}" stroke-width="2.5" fill="none"/>
        `;
        // Hai tay đưa thẳng ra trước vỗ vào nhau (song song hướng vào giữa ngực)
        armLeft = `
          <path d="M ${cx - 18} ${shoulderY + 2} L ${cx - 6} ${shoulderY + 22} L ${cx - 2} ${shoulderY + 28}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 2}" cy="${shoulderY + 28}" r="4.5" fill="${skin}"/>
        `;
        armRight = `
          <path d="M ${cx + 18} ${shoulderY + 2} L ${cx + 6} ${shoulderY + 22} L ${cx + 2} ${shoulderY + 28}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 2}" cy="${shoulderY + 28}" r="4.5" fill="${skin}"/>
        `;
        // Hiệu ứng tia vỗ tay nhỏ tinh tế
        stick = `
          <line x1="${cx - 8}" y1="${shoulderY + 23}" x2="${cx - 4}" y2="${shoulderY + 25}" stroke="#f59e0b" stroke-width="1.5"/>
          <line x1="${cx + 8}" y1="${shoulderY + 23}" x2="${cx + 4}" y2="${shoulderY + 25}" stroke="#f59e0b" stroke-width="1.5"/>
        `;
      } else if (isLeg) {
        // ĐỘNG TÁC CHÂN NHỊP 1: Nhón gót hai chân, hai tay chống hông
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
        `;
        // Hai tay chống hông
        armLeft = `
          <path d="M ${cx - 18} ${shoulderY - 4} L ${cx - 28} ${waistY - 16} L ${cx - 16} ${waistY - 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 16}" cy="${waistY - 4}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <path d="M ${cx + 18} ${shoulderY - 4} L ${cx + 28} ${waistY - 16} L ${cx + 16} ${waistY - 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 16}" cy="${waistY - 4}" r="4" fill="${skin}"/>
        `;
      } else if (isBreathing) {
        // ĐỘNG TÁC VƯƠN THỞ NHỊP 1: Chân trái bước lên, 2 tay chữ V ngửa đầu
        legLeft = `
          <path d="M ${cx - 6} ${crotchY} L ${cx - 20} ${kneeY} L ${cx - 22} ${baseY} L ${cx - 8} ${baseY} L ${cx - 12} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <rect x="${cx - 24}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <path d="M ${cx + 6} ${crotchY} L ${cx + 12} ${kneeY} L ${cx + 14} ${baseY} L ${cx + 28} ${baseY} L ${cx + 18} ${crotchY} Z" fill="${pantsBlue}" stroke="${pantsShadow}" stroke-width="1.5"/>
          <rect x="${cx + 12}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        // Hai tay vươn chếch chữ V lên cao
        armLeft = `
          <line x1="${cx - 18}" y1="${shoulderY}" x2="${cx - 36}" y2="${shoulderY - 48}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 37}" cy="${shoulderY - 50}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 18}" y1="${shoulderY}" x2="${cx + 36}" y2="${shoulderY - 48}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 37}" cy="${shoulderY - 50}" r="4" fill="${skin}"/>
        `;
      } else {
        // Mặc định các bài khác: Chân tách rộng, tay đưa trước hoặc lên cao
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
        if (hasStick) {
          stick = `<line x1="${cx - 48}" y1="${shoulderY - 48}" x2="${cx + 48}" y2="${shoulderY - 48}" stroke="${stickColor}" stroke-width="3.5" stroke-linecap="round"/>`;
        }
      }
    }

    // ==========================================
    // STEP 2: NHỊP 2 (ĐỘNG TÁC KỸ THUẬT CHÍNH)
    // ==========================================
    else {
      if (isArm) {
        // ĐỘNG TÁC TAY NHỊP 2: Chân giữ nguyên, hai tay dang ngang bằng vai, lòng bàn tay ngửa
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <line x1="${cx - 24}" y1="${crotchY + 6}" x2="${cx - 24}" y2="${baseY - 7}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx - 28}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 22}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <line x1="${cx + 24}" y1="${crotchY + 6}" x2="${cx + 24}" y2="${baseY - 7}" stroke="${pantsStripe}" stroke-width="2"/>
          <rect x="${cx + 10}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY} L ${cx + 18} ${shoulderY} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
          <path d="M ${cx - 10} ${shoulderY} L ${cx} ${shoulderY + 9} L ${cx + 10} ${shoulderY}" stroke="${blueTrim}" stroke-width="2.5" fill="none"/>
        `;
        // HAI TAY DANG NGANG BẰNG VAI, LÒNG BÀN TAY NGỬA
        armLeft = `
          <line x1="${cx - 18}" y1="${shoulderY + 4}" x2="${cx - 52}" y2="${shoulderY + 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <!-- Bàn tay ngửa (nửa hình tròn ngửa lên) -->
          <path d="M ${cx - 58} ${shoulderY + 3} Q ${cx - 55} ${shoulderY + 8} ${cx - 52} ${shoulderY + 3}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx - 55}" cy="${shoulderY + 4}" r="3.5" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 18}" y1="${shoulderY + 4}" x2="${cx + 52}" y2="${shoulderY + 4}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <!-- Bàn tay ngửa -->
          <path d="M ${cx + 52} ${shoulderY + 3} Q ${cx + 55} ${shoulderY + 8} ${cx + 58} ${shoulderY + 3}" stroke="${skin}" stroke-width="3" fill="none"/>
          <circle cx="${cx + 55}" cy="${shoulderY + 4}" r="3.5" fill="${skin}"/>
        `;
      } else if (isLeg) {
        // ĐỘNG TÁC CHÂN NHỊP 2: Khuỵu sâu hai gối, hai tay đưa trước song song lòng bàn tay sấp
        legLeft = `
          <path d="M ${cx - 10} ${crotchY + 14} L ${cx - 20} ${kneeY + 16} L ${cx - 12} ${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="${cx - 18}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <path d="M ${cx + 10} ${crotchY + 14} L ${cx + 20} ${kneeY + 16} L ${cx + 12} ${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <rect x="${cx}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <path d="M ${cx - 18} ${shoulderY + 14} L ${cx + 18} ${shoulderY + 14} L ${cx + 15} ${waistY + 14} L ${cx - 15} ${waistY + 14} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        // Hai tay đưa thẳng ra trước song song, lòng bàn tay sấp
        armLeft = `
          <line x1="${cx - 14}" y1="${shoulderY + 18}" x2="${cx - 40}" y2="${shoulderY + 18}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 42}" cy="${shoulderY + 18}" r="4" fill="${skin}"/>
        `;
        armRight = `
          <line x1="${cx + 14}" y1="${shoulderY + 18}" x2="${cx + 40}" y2="${shoulderY + 18}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx + 42}" cy="${shoulderY + 18}" r="4" fill="${skin}"/>
        `;
      } else if (isFlank) {
        // ĐỘNG TÁC LƯỜN NHỊP 2: Nghiêng lườn sang trái, tay phải vươn cao ép sát tai
        legLeft = `
          <line x1="${cx - 8}" y1="${crotchY}" x2="${cx - 24}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx - 30}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        legRight = `
          <line x1="${cx + 8}" y1="${crotchY}" x2="${cx + 24}" y2="${baseY - 7}" stroke="${pantsBlue}" stroke-width="12" stroke-linecap="round"/>
          <rect x="${cx + 12}" y="${baseY - 7}" width="18" height="7" rx="3" fill="${shoeWhite}" stroke="#64748b" stroke-width="1"/>
        `;
        torso = `
          <!-- Thân nghiêng cong sang trái -->
          <path d="M ${cx - 22} ${shoulderY + 12} L ${cx + 14} ${shoulderY + 4} L ${cx + 15} ${waistY} L ${cx - 15} ${waistY} Z" fill="${shirtWhite}" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
        // Tay trái chống hông
        armLeft = `
          <path d="M ${cx - 22} ${shoulderY + 12} L ${cx - 30} ${waistY - 4} L ${cx - 16} ${waistY}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round"/>
          <circle cx="${cx - 16}" cy="${waistY}" r="4" fill="${skin}"/>
        `;
        // Tay phải vươn cao ép sát tai uốn cong sang trái
        armRight = `
          <path d="M ${cx + 14} ${shoulderY + 4} Q ${cx + 6} ${shoulderY - 35} ${cx - 14} ${shoulderY - 42}" stroke="${shirtWhite}" stroke-width="7" stroke-linecap="round" fill="none"/>
          <circle cx="${cx - 16}" cy="${shoulderY - 43}" r="4" fill="${skin}"/>
        `;
      } else if (isBelly) {
        // ĐỘNG TÁC BỤNG NHỊP 2: Cúi gập thân sâu, hai tay chạm mu bàn chân
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
        if (hasStick) {
          stick = `<line x1="${cx - 36}" y1="${baseY - 6}" x2="${cx + 36}" y2="${baseY - 6}" stroke="${stickColor}" stroke-width="3.5" stroke-linecap="round"/>`;
        }
      } else {
        // Nhảy chụm chân hoặc về thế phụ
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

    // Head, face, hair (Friendly Vietnamese primary student)
    const head = `
      <circle cx="${cx}" cy="${headY}" r="14" fill="${skin}" stroke="${skinShadow}" stroke-width="1"/>
      <!-- Tóc đen cắt tỉa học sinh -->
      <path d="M ${cx - 15} ${headY - 2} C ${cx - 16} ${headY - 16}, ${cx + 16} ${headY - 16}, ${cx + 15} ${headY - 2} C ${cx + 12} ${headY - 7}, ${cx - 12} ${headY - 7}, ${cx - 15} ${headY - 2} Z" fill="${hair}"/>
      <!-- Mắt -->
      <circle cx="${cx - 4}" cy="${headY + 1}" r="1.5" fill="#0f172a"/>
      <circle cx="${cx + 4}" cy="${headY + 1}" r="1.5" fill="#0f172a"/>
      <!-- Miệng cười tươi -->
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
      <!-- Nút tròn chỉ số nhịp -->
      <rect x="${cx - 30}" y="244" width="60" height="22" rx="11" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
      <text x="${cx}" y="259" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1" text-anchor="middle">${label}</text>
      <!-- Chú thích chi tiết từng nhịp -->
      <foreignObject x="${cx - 75}" y="270" width="150" height="48">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Roboto, sans-serif; font-size: 9.5px; line-height: 1.25; color: #475569; text-align: center; font-weight: 500;">
          ${sub}
        </div>
      </foreignObject>
    `;
  }).join('\n');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Nền trắng trong sáng phục vụ in ấn -->
      <rect width="100%" height="100%" fill="#ffffff" rx="12"/>
      
      <!-- Tiêu đề SGK chuẩn mực -->
      <rect x="25" y="14" width="30" height="30" rx="15" fill="#0284c7"/>
      <text x="40" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
      <text x="65" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${movementName}</text>
      <text x="65" y="50" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-style="italic" fill="#64748b">Tranh kỹ thuật phân thế chuẩn SGK GDTC Khối ${grade} (Bộ Kết Nối Tri Thức)</text>

      <!-- Đường vạch sân mặt đất -->
      <line x1="35" y1="225" x2="825" y2="225" stroke="${groundLine}" stroke-width="1.5" stroke-dasharray="4 2"/>

      <!-- 5 Phân thế liên hoàn -->
      ${figures}

      <!-- Dòng chú thích nhịp 5, 6, 7, 8 đổi bên -->
      <rect x="200" y="306" width="460" height="18" rx="9" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="430" y="319" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="600" font-style="italic" fill="#0284c7" text-anchor="middle">
        Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 đổi chân / đổi bên.
      </text>
    </svg>
  `.trim();
}
