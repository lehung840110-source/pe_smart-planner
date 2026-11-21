import { SgkImageItem, SubFolderType } from '../types/gdtc';
import { SgkLessonFolder, doesImageBelongToSgkLesson } from '../data/sgkCurriculumTree';
import { sortLibraryImages } from './libraryImageOrder';

export type LessonContextDomain =
  | 'bai_the_duc'
  | 'dhdn'
  | 'tu_the_vdcb'
  | 'tttc'
  | 'danh_gia'
  | 'other';

export function normalizeViSearch(input: string = ''): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\bky\b/g, 'ki')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if the text refers to a NON-calisthenics coordination activity
 * (e.g. "phối hợp di chuyển", "phối hợp vận động đầu cổ", "phối hợp vận động tay, chân",
 * "vận động phối hợp của cơ thể", "bài tập phối hợp đội hình", "phối hợp dẫn bóng"...).
 * Such phrases must NEVER be hijacked by Bài thể dục's "Động tác Phối hợp".
 */
export function isNonCalisthenicsCoordinationText(raw: string = ''): boolean {
  const n = normalizeViSearch(raw);
  if (!n) return false;
  return (
    /phoi hop\s+(di chuyen|van dong|dau|co\b|co the|tay|chan|doi hinh|bien doi|di deu|dan bong|nem ro|tung|bat bong|chuyen bong|cac tu the|quy|ngoi|chay|bat|nhay xa|tho|boi|vuot)/.test(n) ||
    /van dong\s+phoi hop/.test(n) ||
    /bai tap\s+phoi hop/.test(n) ||
    (n.includes('phoi hop') &&
      /(di chuyen|chuong ngai vat|duong thang|gap khuc|dia hinh|vach ke|dau co|van dong cua|co the|doi hinh|bien doi|di deu|bong ro|dan bong|nem ro|tung|bat bong|quy|ngoi|chay|boi|nuoc)/.test(n))
  );
}

/**
 * Determines the authoritative pedagogical domain of a lesson from its title, topic, and SGK folder.
 */
export function detectLessonContextDomain(
  title: string = '',
  topic: string = '',
  targetLesson?: SgkLessonFolder
): LessonContextDomain {
  const tNorm = normalizeViSearch(title);
  const topicNorm = normalizeViSearch(`${topic} ${targetLesson?.topicName || ''} ${targetLesson?.topicId || ''}`);
  const combined = `${tNorm} ${topicNorm}`.trim();

  if (/kiem tra|danh gia|tong ket|so ket|xep loai|tieu chuan ren luyen/.test(tNorm)) {
    return 'danh_gia';
  }

  // Explicit topicId from matched SGK lesson tree is highly authoritative
  if (targetLesson?.topicId) {
    const tid = targetLesson.topicId.toLowerCase();
    if (tid.includes('cd2')) return 'bai_the_duc';
    if (tid.includes('cd1')) return 'dhdn';
    if (tid.includes('cd3')) return 'tu_the_vdcb';
    if (tid.includes('tttc')) return 'tttc';
  }

  // Explicit topic text
  if (topicNorm.includes('chu de 2') || topicNorm.includes('bai tap the duc') || topicNorm.includes('bai the duc')) {
    return 'bai_the_duc';
  }
  if (topicNorm.includes('chu de 1') || topicNorm.includes('doi hinh doi ngu')) {
    return 'dhdn';
  }
  if (topicNorm.includes('chu de 3') || topicNorm.includes('tu the') || topicNorm.includes('ki nang van dong co ban')) {
    return 'tu_the_vdcb';
  }
  if (topicNorm.includes('the thao tu chon') || topicNorm.includes('bong ro') || topicNorm.includes('mon boi') || topicNorm.includes('bong da')) {
    return 'tttc';
  }

  // Title-based strong non-calisthenics signals (MUST be checked BEFORE generic calisthenics keywords!)
  if (
    /bong ro|dan bong|nem ro|chuyen bong|lam quen voi bong|di chuyen khong bong|trong nuoc|boi ech|tap tho|lan nhin tho/.test(tNorm)
  ) {
    return 'tttc';
  }
  if (
    /van dong cua dau|dau co|van dong cua tay|van dong cua chan|van dong phoi hop|phoi hop di chuyen|chuong ngai vat|vach ke|duong thang|gap khuc|dia hinh|tung bat bong|tu the quy|ngoi co ban|nhay day|chay cu ly/.test(tNorm)
  ) {
    return 'tu_the_vdcb';
  }
  if (
    /doi hinh|dung nghiem|dung nghi|tap hop|dong hang|dan hang|don hang|quay cac huong|quay phai|quay trai|bien doi|di deu|dung lai|doi chan/.test(tNorm)
  ) {
    return 'dhdn';
  }

  // Calisthenics (Bài thể dục phát triển chung) signals
  if (
    !isNonCalisthenicsCoordinationText(tNorm) &&
    (/bai (tap )?the duc|vuon tho|van minh|dieu hoa|voi gay|voi vong/.test(tNorm) ||
      /dong tac (vuon tho|tay|chan|luon|bung|van minh|toan than|phoi hop|nhay|dieu hoa)\b/.test(tNorm))
  ) {
    return 'bai_the_duc';
  }

  if (combined.includes('bai the duc') || combined.includes('bai tap the duc')) {
    return 'bai_the_duc';
  }

  return 'other';
}

/**
 * Returns true ONLY when the lesson is genuinely part of Chủ đề 2 (Bài tập thể dục phát triển chung).
 */
export function isCalisthenicsMovementLesson(
  title: string = '',
  topic: string = '',
  targetLesson?: SgkLessonFolder
): boolean {
  return detectLessonContextDomain(title, topic, targetLesson) === 'bai_the_duc';
}

/**
 * Detects whether a library image belongs specifically to Chủ đề 2 (Bài thể dục phát triển chung).
 */
export function isCalisthenicsImage(img: SgkImageItem): boolean {
  const tid = (img.topicId || '').toLowerCase();
  const lid = (img.lessonId || '').toLowerCase();
  if (tid.includes('cd2') || lid.includes('cd2')) return true;
  if (tid.includes('cd1') || tid.includes('cd3') || tid.includes('tttc')) return false;

  const subject = normalizeViSearch((img.title || '').split(/\s+-\s+sgk/i)[0] || img.title || '');
  const topicNorm = normalizeViSearch(img.topicTitle || '');
  const lessonNorm = normalizeViSearch(img.lessonTitle || '');

  if (isNonCalisthenicsCoordinationText(`${subject} ${lessonNorm}`)) return false;
  if (topicNorm.includes('chu de 2') || topicNorm.includes('bai the duc') || topicNorm.includes('bai tap the duc')) {
    return true;
  }
  if (
    topicNorm.includes('chu de 1') ||
    topicNorm.includes('chu de 3') ||
    topicNorm.includes('doi hinh') ||
    topicNorm.includes('tu the') ||
    topicNorm.includes('bong ro') ||
    topicNorm.includes('mon boi')
  ) {
    return false;
  }

  if (/van dong cua (dau|tay|chan)|van dong phoi hop|di chuyen|chuong ngai vat|doi hinh|bong ro|nem ro|dan bong|boi|nuoc/.test(`${subject} ${lessonNorm}`)) {
    return false;
  }

  return (
    /bai (tap )?the duc|vuon tho|van minh|dieu hoa|voi gay|voi vong/.test(`${subject} ${lessonNorm}`) ||
    /^dong tac (vuon tho|tay|chan|luon|bung|van minh|toan than|phoi hop|nhay|dieu hoa)(\b|$)/.test(subject)
  );
}

export type CompoundConceptId =
  | 'btd_vuon_tho'
  | 'btd_tay'
  | 'btd_chan'
  | 'btd_luon'
  | 'btd_bung'
  | 'btd_van_minh'
  | 'btd_toan_than'
  | 'btd_phoi_hop'
  | 'btd_nhay'
  | 'btd_dieu_hoa'
  | 'vd_dau_co'
  | 'vd_tay'
  | 'vd_chan'
  | 'vd_co_the'
  | 'vd_di_chuyen_thang'
  | 'vd_di_chuyen_gap_khuc'
  | 'vd_di_chuyen_dia_hinh'
  | 'vd_di_chuyen_vong'
  | 'vd_di_chuyen_chung'
  | 'vd_quy_ngoi'
  | 'vd_tung_bat_tai_cho'
  | 'vd_tung_bat_di_chuyen'
  | 'dhdn_nghiem_nghi'
  | 'dhdn_hang_doc'
  | 'dhdn_hang_ngang'
  | 'dhdn_vong_tron'
  | 'dhdn_quay'
  | 'dhdn_di_deu'
  | 'dhdn_phoi_hop'
  | 'tttc_lam_quen_bong'
  | 'tttc_di_chuyen_khong_bong'
  | 'tttc_dan_bong'
  | 'tttc_chuyen_bong'
  | 'tttc_nem_ro'
  | 'tttc_phoi_hop_dan_nem'
  | 'tttc_boi'
  | 'generic';

/**
 * Classifies a text (lesson title, movement item, or image title) into a precise compound PE concept
 * so overlapping single words like "phối hợp", "tay", "chân", "nhảy" never collide across domains.
 */
export function detectCompoundConceptId(
  rawText: string = '',
  domainHint: LessonContextDomain = 'other'
): CompoundConceptId {
  const n = normalizeViSearch(rawText);
  if (!n) return 'generic';

  // 1. Sport / TTTC concepts
  if (/phoi hop dan bong|dan bong nem ro|dan bong.*nem ro/.test(n)) return 'tttc_phoi_hop_dan_nem';
  if (/nem ro|ban ro/.test(n)) return 'tttc_nem_ro';
  if (/chuyen bong|chuyen bat bong/.test(n)) return 'tttc_chuyen_bong';
  if (/dan bong|nhoi bong/.test(n)) return 'tttc_dan_bong';
  if (/di chuyen khong bong|truot ngang|tu the thu/.test(n)) return 'tttc_di_chuyen_khong_bong';
  if (/lam quen voi bong|cam bong bang hai tay/.test(n)) return 'tttc_lam_quen_bong';
  if (/trong nuoc|boi ech|tap tho|lan nhin tho|ngup tho/.test(n)) return 'tttc_boi';

  // 2. Tư thế & KN vận động cơ bản (Chủ đề 3) — ALWAYS check before Bài thể dục single words!
  if (/dau co|van dong cua dau|cui dau|ngua dau|nghieng dau|xoay dau|phoi hop dau|phoi hop van dong dau/.test(n)) {
    return 'vd_dau_co';
  }
  if (/van dong cua tay|van dong tay|phoi hop van dong tay|dua tay ra truoc|dua tay len cao|dang hai tay|cac huong tay/.test(n) && !n.includes('chan')) {
    return 'vd_tay';
  }
  if (/van dong cua chan|van dong chan|phoi hop van dong chan|dung co mot chan|dung mot chan|thang bang chan/.test(n) && !n.includes('tay')) {
    return 'vd_chan';
  }
  if (/van dong phoi hop|phoi hop cua co the|phoi hop van dong tay chan|phoi hop tay chan|di kieng got|di bang got chan|di chuyen huong/.test(n)) {
    return 'vd_co_the';
  }
  if (/di chuyen tung bat|vua di vua tung|chuyen bong khi di chuyen/.test(n)) {
    return 'vd_tung_bat_di_chuyen';
  }
  if (/tai cho tung|tung bat bong|tung bong len cao|bat bong hai tay/.test(n)) {
    return 'vd_tung_bat_tai_cho';
  }
  if (/tu the quy|ngoi co ban|quy ngoi/.test(n)) {
    return 'vd_quy_ngoi';
  }
  if (/duong gap khuc|luon coc|zic zac|sang trai va sang phai/.test(n)) {
    return 'vd_di_chuyen_gap_khuc';
  }
  if (/tren dia hinh|vuot dia hinh|ghe the duc|cau go|bo chui/.test(n)) {
    return 'vd_di_chuyen_dia_hinh';
  }
  if (/vong trai vong phai|di chuyen vong/.test(n)) {
    return 'vd_di_chuyen_vong';
  }
  if (/tren duong thang|theo vach ke thang|buoc qua chuong ngai vat|nhay qua chuong ngai vat|nhanh dan theo vach ke/.test(n)) {
    return 'vd_di_chuyen_thang';
  }
  if (/phoi hop di chuyen|chuong ngai vat|vuot qua/.test(n)) {
    return 'vd_di_chuyen_chung';
  }

  // 3. Đội hình đội ngũ (Chủ đề 1)
  if (/di deu|dung lai|doi chan/.test(n)) return 'dhdn_di_deu';
  if (/quay cac huong|quay phai|quay trai|quay sau/.test(n)) return 'dhdn_quay';
  if (/vong tron/.test(n)) return 'dhdn_vong_tron';
  if (/hang ngang|dan hang|don hang/.test(n)) return 'dhdn_hang_ngang';
  if (/hang doc/.test(n)) return 'dhdn_hang_doc';
  if (/dung nghiem|dung nghi/.test(n)) return 'dhdn_nghiem_nghi';
  if (/phoi hop doi hinh|phoi hop bien doi|bien doi doi hinh|doi hinh doi ngu/.test(n)) return 'dhdn_phoi_hop';

  // 4. Bài tập thể dục phát triển chung (Chủ đề 2) — ONLY when NOT non-calisthenics coordination
  if (!isNonCalisthenicsCoordinationText(n)) {
    if (domainHint === 'bai_the_duc' || /dong tac|bai (tap )?the duc|voi gay|voi vong/.test(n)) {
      if (n.includes('vuon tho')) return 'btd_vuon_tho';
      if (n.includes('van minh')) return 'btd_van_minh';
      if (n.includes('dieu hoa')) return 'btd_dieu_hoa';
      if (n.includes('toan than')) return 'btd_toan_than';
      if (n.includes('phoi hop')) return 'btd_phoi_hop';
      if (n.includes('luon')) return 'btd_luon';
      if (n.includes('bung')) return 'btd_bung';
      if (/\bnhay\b/.test(n) && !n.includes('nhay day') && !n.includes('nhay xa') && !n.includes('nhay lo co')) {
        return 'btd_nhay';
      }
      if (/dong tac tay\b/.test(n) || (domainHint === 'bai_the_duc' && /\btay\b/.test(n) && !n.includes('co tay'))) {
        return 'btd_tay';
      }
      if (/dong tac chan\b/.test(n) || (domainHint === 'bai_the_duc' && /\bchan\b/.test(n) && !n.includes('co chan'))) {
        return 'btd_chan';
      }
    }
  }

  return 'generic';
}

const GENERIC_QUERY_STOP_WORDS = new Set([
  'bai', 'tiet', 'hoc', 'tap', 'cac', 'cua', 'voi', 'cho', 'khi', 'trong', 'theo', 'tren', 'duoi',
  'sgk', 'gdtc', 'lop', 'khoi', 'trang', 'chu', 'de', 'hoat', 'dong', 'kham', 'pha', 'kien', 'thuc',
  'moi', 'lam', 'quen', 'on', 'luyen', 'van', 'dung', 'thuc', 'te', 'hinh', 'anh', 'minh', 'hoa',
  'dong', 'tac', 'phoi', 'hop', 'tu', 'the', 'co', 'ban', 'mot', 'hai', 'ba', 'bon', 'nam', 'va', 'tiep'
]);

/**
 * Extracts clean, high-signal contextual compound phrases (2–4 words) for matching & UI keyword chips.
 */
export function extractContextSearchKeywords(
  lessonTitle: string = '',
  topic: string = '',
  rowContent: string = '',
  targetLesson?: SgkLessonFolder
): string[] {
  const domain = detectLessonContextDomain(lessonTitle, topic, targetLesson);
  const cleanTitle = (lessonTitle || '')
    .replace(/^bài\s*\d+\s*[:\-–]?\s*/i, '')
    .replace(/\s*\((?:tiết|tuần)[^)]*\)/gi, '')
    .replace(/\s*\(tiếp theo\)/gi, '')
    .trim();

  const keywords: string[] = [];
  const seen = new Set<string>();
  const addKw = (kw: string) => {
    const cleaned = (kw || '').replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    const norm = normalizeViSearch(cleaned);
    if (!cleaned || norm.length < 3 || seen.has(norm)) return;
    // Never add bare "phối hợp" alone as a keyword!
    if (norm === 'phoi hop' || norm === 'dong tac' || norm === 'bai tap' || norm === 'van dong') return;
    seen.add(norm);
    keywords.push(cleaned);
  };

  // 1. If Bài thể dục, add exact movement names from rowContent (`* Học Động tác ...`) or title
  if (domain === 'bai_the_duc') {
    const rowNewMatches = (rowContent || '').matchAll(/\*\s*học\s+([^\n(:]+)/gi);
    for (const m of rowNewMatches) {
      addKw(m[1]);
    }
    const btdMatches = (lessonTitle || '').matchAll(/động tác\s+[a-zA-ZÀ-ỹ\s]{2,28}/gi);
    for (const m of btdMatches) {
      const part = m[0].split(/[,;.\-–(]/)[0].trim();
      addKw(part);
    }
  }

  // 2. Clean lesson core title (e.g. "Vận động của đầu, cổ", "Phối hợp di chuyển vượt qua chướng ngại vật trên đường thẳng")
  if (cleanTitle) {
    // Shorten overly long titles while preserving compound distinction
    const shortTitle = cleanTitle.replace(/^bài tập\s+/i, '').trim();
    addKw(shortTitle.length > 52 ? shortTitle.slice(0, 52).trim() : shortTitle);
  }

  // 3. Specific SGK technical items from the matched lesson folder
  if (targetLesson?.subFolders?.kyThuat?.items) {
    for (const item of targetLesson.subFolders.kyThuat.items.slice(0, 3)) {
      addKw(item.name);
    }
  }

  // 4. Concept-specific crisp Vietnamese compound keywords
  const concept = detectCompoundConceptId(`${cleanTitle} ${targetLesson?.lessonName || ''}`, domain);
  const conceptChips: Partial<Record<CompoundConceptId, string[]>> = {
    btd_phoi_hop: ['Động tác Phối hợp', 'Bài thể dục'],
    vd_dau_co: ['Vận động đầu, cổ', 'Phối hợp đầu cổ', 'Cúi đầu, ngửa đầu', 'Xoay đầu'],
    vd_tay: ['Vận động của tay', 'Đưa tay ra trước', 'Dang hai tay'],
    vd_chan: ['Vận động của chân', 'Kiễng gót chân', 'Đứng co một chân'],
    vd_co_the: ['Vận động phối hợp cơ thể', 'Phối hợp tay chân', 'Đi theo vạch kẻ thẳng'],
    vd_di_chuyen_thang: ['Phối hợp di chuyển', 'Chướng ngại vật đường thẳng', 'Bước qua chướng ngại vật'],
    vd_di_chuyen_gap_khuc: ['Phối hợp di chuyển', 'Đường gấp khúc', 'Luồn cọc'],
    vd_di_chuyen_dia_hinh: ['Phối hợp di chuyển', 'Vượt địa hình', 'Đi thăng bằng'],
    vd_di_chuyen_vong: ['Phối hợp di chuyển vòng trái, vòng phải'],
    vd_di_chuyen_chung: ['Phối hợp di chuyển', 'Chướng ngại vật'],
    vd_quy_ngoi: ['Tư thế quỳ, ngồi'],
    vd_tung_bat_tai_cho: ['Tung bắt bóng tại chỗ', 'Tung bóng'],
    vd_tung_bat_di_chuyen: ['Di chuyển tung bắt bóng', 'Chuyền bóng'],
    dhdn_nghiem_nghi: ['Đứng nghiêm', 'Đứng nghỉ'],
    dhdn_hang_doc: ['Hàng dọc', 'Dóng hàng dọc'],
    dhdn_hang_ngang: ['Hàng ngang', 'Dàn hàng ngang'],
    dhdn_vong_tron: ['Vòng tròn', 'Biến đổi vòng tròn'],
    dhdn_quay: ['Quay các hướng', 'Quay phải', 'Quay trái'],
    dhdn_di_deu: ['Đi đều', 'Đứng lại', 'Đổi chân'],
    dhdn_phoi_hop: ['Phối hợp đội hình', 'Biến đổi đội hình'],
    tttc_lam_quen_bong: ['Làm quen với bóng', 'Cầm bóng'],
    tttc_di_chuyen_khong_bong: ['Di chuyển không bóng', 'Trượt ngang'],
    tttc_dan_bong: ['Dẫn bóng', 'Nhồi bóng'],
    tttc_chuyen_bong: ['Chuyền bóng', 'Bắt bóng'],
    tttc_nem_ro: ['Ném rổ'],
    tttc_phoi_hop_dan_nem: ['Phối hợp dẫn bóng ném rổ', 'Dẫn bóng ném rổ'],
    tttc_boi: ['Đi trong nước', 'Tập thở']
  };
  for (const chip of conceptChips[concept] || []) {
    addKw(chip);
  }

  return keywords.slice(0, 5);
}

function extractDistinctiveTokens(raw: string): string[] {
  const norm = normalizeViSearch(raw);
  if (!norm) return [];
  return Array.from(
    new Set(
      norm
        .split(' ')
        .filter((w) => w.length >= 2 && !GENERIC_QUERY_STOP_WORDS.has(w))
    )
  );
}

function extractBigrams(raw: string): string[] {
  const norm = normalizeViSearch(raw);
  if (!norm) return [];
  const words = norm.split(' ').filter((w) => w.length >= 2);
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i];
    const b = words[i + 1];
    // Skip generic boilerplate bigrams like "dong tac", "bai tap", "phoi hop" alone
    const pair = `${a} ${b}`;
    if (
      pair === 'dong tac' ||
      pair === 'bai tap' ||
      pair === 'phoi hop' ||
      pair === 'sgk gdtc' ||
      pair === 'hinh anh' ||
      pair === 'van dong' ||
      pair === 'luyen tap'
    ) {
      continue;
    }
    bigrams.push(pair);
  }
  return Array.from(new Set(bigrams));
}

function areConceptsCompatible(targetConcept: CompoundConceptId, imgConcept: CompoundConceptId): boolean {
  if (targetConcept === 'generic' || imgConcept === 'generic') return true;
  if (targetConcept === imgConcept) return true;

  // Compatible movement sub-families within the exact same domain
  const diChuyenGroup = new Set<CompoundConceptId>([
    'vd_di_chuyen_thang',
    'vd_di_chuyen_gap_khuc',
    'vd_di_chuyen_dia_hinh',
    'vd_di_chuyen_vong',
    'vd_di_chuyen_chung'
  ]);
  if (targetConcept === 'vd_di_chuyen_chung' && diChuyenGroup.has(imgConcept)) return true;
  if (imgConcept === 'vd_di_chuyen_chung' && diChuyenGroup.has(targetConcept)) return true;

  return false;
}

/**
 * Matches same-grade technical ('kyThuat') raster images using BOTH:
 * 1. Exact SGK lesson tree membership (lessonId / page range)
 * 2. Compound contextual keyword scoring (disambiguating "phối hợp" of Bài thể dục vs
 *    "phối hợp di chuyển", "phối hợp vận động đầu cổ", "phối hợp vận động tay/chân", etc.)
 *
 * Strictly rejects any cross-domain or conflicting-concept image!
 */
export function matchTechnicalImagesByContext(
  grade: number,
  lessonTitle: string,
  topic: string,
  rowContent: string,
  targetLesson: SgkLessonFolder | undefined,
  userImages: SgkImageItem[],
  isPeriod2: boolean,
  helpers: {
    isSvgImageUrl: (url?: string) => boolean;
    isGameImage: (img: SgkImageItem) => boolean;
    hasConflictingGradeTag: (text: string | undefined, expectedGrade: number) => boolean;
    getImageEffectiveSubFolder: (img: SgkImageItem) => SubFolderType;
  }
): SgkImageItem[] {
  if (!userImages || userImages.length === 0) return [];

  const lessonDomain = detectLessonContextDomain(lessonTitle, topic, targetLesson);
  const sgkItemNames = (targetLesson?.subFolders?.kyThuat?.items || []).map((it) => it.name);
  const targetConcept = detectCompoundConceptId(
    `${lessonTitle} ${targetLesson?.lessonName || ''} ${sgkItemNames.join(' ')}`,
    lessonDomain
  );

  // Build query phrases & distinctive tokens from lesson + active SGK items
  const activeSgkItems =
    sgkItemNames.length > 1
      ? isPeriod2
        ? sgkItemNames.slice(Math.ceil(sgkItemNames.length / 2))
        : sgkItemNames.slice(0, Math.ceil(sgkItemNames.length / 2))
      : sgkItemNames;

  const queryCorpus = [
    lessonTitle.replace(/^bài\s*\d+\s*[:\-–]?\s*/i, '').replace(/\s*\([^)]*\)/g, ''),
    targetLesson?.lessonName?.replace(/^bài\s*\d+\s*[:\-–]?\s*/i, '').replace(/\s*\([^)]*\)/g, '') || '',
    ...activeSgkItems
  ]
    .filter(Boolean)
    .join(' ');

  const queryTokens = extractDistinctiveTokens(queryCorpus);
  const queryBigrams = extractBigrams(queryCorpus);

  const ordered = sortLibraryImages(userImages, 'sgk');
  const scored: Array<{ img: SgkImageItem; score: number }> = [];

  for (const img of ordered) {
    if (!img.imgUrl || helpers.isSvgImageUrl(img.imgUrl)) continue;
    if (helpers.isGameImage(img)) continue;
    if (String(img.grade) !== String(grade)) continue;
    if (
      helpers.hasConflictingGradeTag(img.imgUrl, grade) ||
      helpers.hasConflictingGradeTag(img.title, grade) ||
      helpers.hasConflictingGradeTag((img.caption || '').split('•')[0], grade)
    ) {
      continue;
    }
    if (helpers.getImageEffectiveSubFolder(img) !== 'kyThuat') continue;

    // 1. HARD DOMAIN GUARD: never put a Bài thể dục image into a non-Bài-thể-dục lesson (or vice versa)!
    const imgIsBtd = isCalisthenicsImage(img);
    if (lessonDomain !== 'bai_the_duc' && lessonDomain !== 'other' && imgIsBtd) {
      continue;
    }
    if (lessonDomain === 'bai_the_duc' && !imgIsBtd && isNonCalisthenicsCoordinationText(`${img.title} ${img.lessonTitle || ''}`)) {
      continue;
    }

    const imgSubject = (img.title || '').split(/\s+-\s+sgk/i)[0] || img.title || '';
    const imgCapHead = (img.caption || '').split('•')[0] || '';
    const imgDomain = imgIsBtd
      ? 'bai_the_duc'
      : detectLessonContextDomain(`${imgSubject} ${img.lessonTitle || ''}`, img.topicTitle || '');
    const imgConcept = detectCompoundConceptId(`${imgSubject} ${imgCapHead} ${img.lessonTitle || ''}`, imgDomain);

    // 2. HARD CONCEPT GUARD: e.g., never match "vận động tay" or "phối hợp di chuyển" into "vận động đầu, cổ"!
    if (!areConceptsCompatible(targetConcept, imgConcept)) {
      continue;
    }

    const exactLessonMatch = Boolean(
      targetLesson &&
        (doesImageBelongToSgkLesson(img, targetLesson) ||
          (img.page && img.page >= targetLesson.startPage && img.page <= targetLesson.endPage))
    );

    const imgTextNorm = normalizeViSearch(`${imgSubject} ${imgCapHead}`);
    const imgTokenSet = new Set(extractDistinctiveTokens(`${imgSubject} ${imgCapHead} ${img.lessonTitle || ''}`));
    const imgBigramSet = new Set(extractBigrams(`${imgSubject} ${imgCapHead} ${img.lessonTitle || ''}`));

    let bigramHits = 0;
    for (const bg of queryBigrams) {
      if (imgBigramSet.has(bg) || imgTextNorm.includes(bg)) bigramHits++;
    }

    let tokenHits = 0;
    for (const tok of queryTokens) {
      if (imgTokenSet.has(tok)) tokenHits++;
    }

    const conceptExactMatch =
      targetConcept !== 'generic' && imgConcept !== 'generic' && targetConcept === imgConcept;

    let score = 0;
    if (exactLessonMatch) score += 200;
    if (conceptExactMatch) score += 160;
    score += bigramHits * 55;
    score += tokenHits * 20;
    if (!img.id.startsWith('img_sgk_')) score += 30;
    if (img.folder === 'kyThuat') score += 15;

    // Require either exact SGK lesson membership OR strong compound concept + keyword match!
    const meetsThreshold =
      exactLessonMatch ||
      (conceptExactMatch && (bigramHits >= 1 || tokenHits >= 2)) ||
      (bigramHits >= 2 && tokenHits >= 2);

    if (!meetsThreshold) continue;

    // If image explicitly belongs to a DIFFERENT lessonId in the same grade, only allow if concept matches strongly and targetLesson wasn't matched
    if (
      targetLesson &&
      img.lessonId &&
      img.lessonId !== targetLesson.id &&
      img.lessonId !== targetLesson.lessonId &&
      !exactLessonMatch
    ) {
      if (!conceptExactMatch || bigramHits < 1) continue;
      score -= 60;
    }

    scored.push({ img, score });
  }

  if (scored.length === 0) return [];

  // Sort by highest contextual score first, preserving SGK tree order on ties
  scored.sort((a, b) => b.score - a.score);

  // If multiple candidates belong to the exact lesson and there are period splits, pick period-relevant slice cleanly
  const topScore = scored[0].score;
  const strongMatches = scored
    .filter((item) => item.score >= Math.max(150, topScore - 90))
    .map((item) => item.img);

  if (strongMatches.length > 2 && sgkItemNames.length > 1) {
    // Prefer images that explicitly match activeSgkItems for this period (Tiết 1 vs Tiết 2)
    const activeTokens = new Set(extractDistinctiveTokens(activeSgkItems.join(' ')));
    const periodRanked = [...strongMatches].sort((a, b) => {
      const aHits = extractDistinctiveTokens(`${a.title} ${(a.caption || '').split('•')[0]}`).filter((t) =>
        activeTokens.has(t)
      ).length;
      const bHits = extractDistinctiveTokens(`${b.title} ${(b.caption || '').split('•')[0]}`).filter((t) =>
        activeTokens.has(t)
      ).length;
      return bHits - aHits;
    });
    return periodRanked.slice(0, 2);
  }

  return strongMatches.slice(0, 2);
}

/**
 * Scores a library image against a teacher's keyword query in the Image Picker modal.
 * Supports accent-insensitive compound matching AND prevents bare "phối hợp" collisions:
 * e.g., searching "phối hợp di chuyển" ranks "Phối hợp di chuyển..." at #1 and excludes "Động tác Phối hợp" (Bài thể dục).
 */
export function scoreImageByKeywordQuery(
  img: SgkImageItem,
  rawQuery: string,
  expectedDomain: LessonContextDomain = 'other'
): number {
  const qNorm = normalizeViSearch(rawQuery);
  if (!qNorm) return 0;

  const subject = normalizeViSearch((img.title || '').split(/\s+-\s+sgk/i)[0] || img.title || '');
  const fullCorpus = normalizeViSearch(`${img.title || ''} ${img.caption || ''} ${img.lessonTitle || ''} ${img.topicTitle || ''} trang ${img.page || ''}`);
  if (!fullCorpus) return -1;

  const queryDomain = detectLessonContextDomain(rawQuery);
  const effectiveDomain = queryDomain !== 'other' ? queryDomain : expectedDomain;
  const queryConcept = detectCompoundConceptId(rawQuery, effectiveDomain);
  const imgIsBtd = isCalisthenicsImage(img);
  const imgDomain = imgIsBtd
    ? 'bai_the_duc'
    : detectLessonContextDomain(`${img.title || ''} ${img.lessonTitle || ''}`, img.topicTitle || '');
  const imgConcept = detectCompoundConceptId(`${img.title || ''} ${(img.caption || '').split('•')[0] || ''} ${img.lessonTitle || ''}`, imgDomain);

  // Strict disambiguation when the query specifies a non-calisthenics coordination concept
  if (isNonCalisthenicsCoordinationText(rawQuery) && imgIsBtd) {
    return -1;
  }
  if (queryConcept === 'btd_phoi_hop' && isNonCalisthenicsCoordinationText(`${img.title || ''} ${img.lessonTitle || ''}`)) {
    return -1;
  }

  let score = 0;

  // 1. Exact full phrase match in subject title or full corpus
  if (subject.includes(qNorm)) {
    score += 320;
  } else if (fullCorpus.includes(qNorm)) {
    score += 200;
  }

  // 2. Compound concept match boost
  if (queryConcept !== 'generic' && imgConcept === queryConcept) {
    score += 180;
  } else if (queryConcept !== 'generic' && imgConcept !== 'generic' && !areConceptsCompatible(queryConcept, imgConcept)) {
    // Heavily penalize conflicting concepts (e.g. searching "vận động đầu cổ" shouldn't return "động tác tay")
    score -= 220;
  }

  // 3. Multi-word token & bigram matching (accent-insensitive)
  const qWords = qNorm.split(' ').filter((w) => w.length >= 2);
  const qBigrams = extractBigrams(rawQuery);
  let wordHits = 0;
  let subjectWordHits = 0;
  for (const w of qWords) {
    if (fullCorpus.includes(w)) wordHits++;
    if (subject.includes(w)) subjectWordHits++;
  }
  let bigramHits = 0;
  for (const bg of qBigrams) {
    if (fullCorpus.includes(bg)) bigramHits++;
  }

  if (qWords.length > 0 && wordHits === 0 && score <= 0) {
    return -1;
  }

  // When query has >= 2 words (e.g. "phối hợp di chuyển"), require more than JUST "phoi" + "hop" matching!
  if (qWords.length >= 3 && !fullCorpus.includes(qNorm)) {
    const nonGenericQWords = qWords.filter((w) => !GENERIC_QUERY_STOP_WORDS.has(w));
    if (nonGenericQWords.length > 0) {
      const specificHits = nonGenericQWords.filter((w) => fullCorpus.includes(w)).length;
      if (specificHits === 0) return -1;
    }
  }

  score += bigramHits * 65 + subjectWordHits * 35 + wordHits * 18;

  // Domain bonus if aligned with expected lesson domain
  if (effectiveDomain !== 'other' && imgDomain === effectiveDomain) {
    score += 45;
  }

  return score > 0 ? score : -1;
}
