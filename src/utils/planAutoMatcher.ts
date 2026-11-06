import { LessonRow, SgkImageItem } from '../types/gdtc';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { standardFormationDiagrams, FormationDiagram, getFormationDiagramByKeyword } from '../data/formationDiagrams';
import { standardMovementsLibrary, findMatchingMovement, MovementTechnicalItem } from '../data/movementLibrary';
import { sgkCurriculumTree, SgkLessonFolder } from '../data/sgkCurriculumTree';

export interface AutoMatchResult {
  newRows: LessonRow[];
  detectedMovements: string[];
  matchedImages: Array<{ rowIdx: number; col: 'content' | 'hs'; title: string }>;
  matchedFormations: Array<{ rowIdx: number; name: string }>;
}

/**
 * Extracts movement names from a lesson title string.
 * Example: "Bài 2: ĐỘNG TÁC CHÂN, ĐỘNG TÁC LƯỜN (BỤNG) (Tiết 1)"
 * -> ["Động tác Chân", "Động tác Lườn (Bụng)"]
 */
export function extractMovementNamesFromTitle(title: string): string[] {
  const results: string[] = [];
  const cleanTitle = title.replace(/^bài\s*\d+\s*[:\-]?\s*/i, '').trim();

  // Common movement patterns in GDPT 2018
  const knownMovements = [
    'Động tác Vươn thở',
    'Động tác Tay',
    'Động tác Chân',
    'Động tác Lườn',
    'Động tác Bụng',
    'Động tác Vặn mình',
    'Động tác Toàn thân',
    'Động tác Nhảy',
    'Động tác Điều hòa',
    'Động tác Đi đều, Đứng lại',
    'Đi đều vòng phải',
    'Đi đều vòng trái',
    'Đổi chân khi đi đều sai nhịp',
    'Động tác với gậy',
    'Động tác Vươn thở với gậy',
    'Động tác Tay với gậy',
    'Động tác Chân với gậy',
    'Động tác Vặn mình với gậy',
    'Động tác Bụng với gậy',
    'Động tác Phối hợp với gậy'
  ];

  for (const km of knownMovements) {
    const reg = new RegExp(km.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (reg.test(cleanTitle)) {
      results.push(km);
    }
  }

  // Fallback: split by comma if none matched
  if (results.length === 0) {
    const parts = cleanTitle.split(/[,;\-]+/).map((s) => s.trim()).filter((s) => s.length > 3);
    return parts.length > 0 ? parts : [cleanTitle];
  }

  return results;
}

/**
 * Checks whether an image represents a game (Trò chơi) rather than a technical movement (Động tác).
 * Games must NEVER be inserted into the technical movement activity (Khám phá & Làm quen động tác).
 */
export function isGameImage(img: SgkImageItem): boolean {
  const t = (img.title || '').toLowerCase();
  const c = (img.caption || '').toLowerCase();
  const folder = (img.folder || '').toLowerCase();
  const cat = (img.category || '').toLowerCase();

  if (cat === 'tro_choi' || cat === 'tro_choi_khoi_dong' || folder === 'trochoi' || folder === 'trochoikhoidong') {
    return true;
  }
  if (t.includes('trò chơi') || t.includes('tro choi') || c.includes('trò chơi') || c.includes('tro choi')) {
    return true;
  }
  const gameKeywords = [
    'lò cò tiếp sức',
    'tiếp sức',
    'chuyền gậy',
    'kết bạn',
    'mèo đuổi chuột',
    'chim về tổ',
    'hoàng anh hoàng yến',
    'chạy theo hình',
    'cướp cờ',
    'kéo co',
    'thỏ nhường hang'
  ];
  return gameKeywords.some((kw) => t.includes(kw) || c.includes(kw));
}

export interface AccurateMovementDetails {
  movementName: string;
  imgUrl: string;
  imgTitle: string;
  movementSteps: string;
  gvExplanation: string;
  hsTask: string;
  practiceFocus: string;
}

export const AUTHENTIC_TEXTBOOK_MAP: Record<string, { url: string; title: string }> = {
  vuon_tho: {
    url: '/assets/sgk_chuan/k1_vuon_tho.jpg',
    title: 'Động tác Vươn thở - SGK Lớp 1 (Trang 36)'
  },
  tay: {
    url: '/assets/sgk_chuan/k1_tay.jpg',
    title: 'Động tác Tay - SGK Lớp 1 (Trang 37)'
  },
  chan: {
    url: '/assets/sgk_chuan/k1_chan.jpg',
    title: 'Động tác Chân - SGK Lớp 1 (Trang 43)'
  },
  luon: {
    url: '/assets/sgk_chuan/k1_luon.jpg',
    title: 'Động tác Lườn - SGK Lớp 1 (Trang 44)'
  },
  bung: {
    url: '/assets/sgk_chuan/k1_bung.jpg',
    title: 'Động tác Bụng - SGK Lớp 1 (Trang 49)'
  },
  di_deu: {
    url: '/assets/sgk_chuan/k3_di_deu_dung_lai.jpg',
    title: 'Động tác Đi đều, Đứng lại - SGK Lớp 3 (Trang 27)'
  },
  on_di_deu: {
    url: '/assets/sgk_chuan/k3_on_di_deu_doi_chan.jpg',
    title: 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp - SGK Lớp 3 (Trang 28)'
  },
  gay: {
    url: '/assets/sgk_chuan/k5_vuon_tho_tay_gay.jpg',
    title: 'Bài tập thể dục với gậy - SGK Lớp 5 (Trang 24)'
  },
  chan_gay: {
    url: '/assets/sgk_chuan/k5_chan_voi_gay.jpg',
    title: 'Động tác Chân với gậy - SGK Lớp 5 (Trang 25)'
  },
  van_minh: {
    url: '/assets/sgk_chuan/k5_van_minh_toan_than_gay.jpg',
    title: 'Động tác Vặn mình và Toàn thân với gậy - SGK Lớp 5 (Trang 28)'
  },
  thang_bang: {
    url: '/assets/aistudio/0e0e03fc-7060-481d-85f2-da82dde1f3c3_eccfceae.jfif',
    title: 'Động tác Thăng bằng - SGK Lớp 1'
  }
};

/**
 * Resolves accurate movement name, technical image, and pedagogical steps from text/title.
 * Strictly guarantees that games (Trò chơi) are NEVER attached to technical movements (Học động tác).
 */
export function resolveAccurateMovement(
  content: string = '',
  title: string = '',
  grade: number = 1,
  userImages: SgkImageItem[] = []
): AccurateMovementDetails {
  const combined = `${content} ${title}`.toLowerCase();

  let targetKey = 'vuon_tho';
  let targetName = 'Động tác Vươn thở';

  if (combined.includes('vươn thở') || combined.includes('vuon tho')) {
    targetKey = 'vuon_tho';
    targetName = 'Động tác Vươn thở';
  } else if (combined.includes('động tác tay') || (combined.includes('tay') && !combined.includes('cổ tay') && !combined.includes('vỗ tay') && !combined.includes('chạm tay') && !combined.includes('chuyền'))) {
    targetKey = 'tay';
    targetName = 'Động tác Tay';
  } else if (combined.includes('động tác chân') || (combined.includes('chân') && !combined.includes('cổ chân') && !combined.includes('mũi chân') && !combined.includes('đổi chân') && !combined.includes('đập chân'))) {
    targetKey = 'chan';
    targetName = 'Động tác Chân';
  } else if (combined.includes('lườn') || combined.includes('luon')) {
    targetKey = 'luon';
    targetName = 'Động tác Lườn';
  } else if (combined.includes('bụng') || combined.includes('bung')) {
    targetKey = 'bung';
    targetName = 'Động tác Bụng';
  } else if (combined.includes('vặn mình') || combined.includes('van minh')) {
    targetKey = 'van_minh';
    targetName = 'Động tác Vặn mình';
  } else if (combined.includes('toàn thân') || combined.includes('toan than') || combined.includes('phối hợp cơ thể')) {
    targetKey = 'toan_than';
    targetName = 'Động tác Toàn thân';
  } else if (combined.includes('động tác nhảy') || (combined.includes('nhảy') && !combined.includes('lò cò') && !combined.includes('tiếp sức') && !combined.includes('nhảy dây'))) {
    targetKey = 'nhay';
    targetName = 'Động tác Nhảy';
  } else if (combined.includes('điều hòa') || combined.includes('dieu hoa')) {
    targetKey = 'dieu_hoa';
    targetName = 'Động tác Điều hòa';
  } else if (combined.includes('gậy') || combined.includes('gay')) {
    targetKey = 'gay';
    targetName = 'Bài tập thể dục với gậy';
  } else if (combined.includes('đi đều') || combined.includes('di deu') || combined.includes('đứng lại')) {
    targetKey = 'di_deu';
    targetName = 'Động tác Đi đều, Đứng lại';
  } else if (combined.includes('nghiêm') || combined.includes('nghỉ') || combined.includes('hàng dọc') || combined.includes('dóng hàng') || combined.includes('điểm số') || combined.includes('quay')) {
    targetKey = 'dung_nghiem';
    targetName = 'Tư thế đứng nghiêm, đứng nghỉ';
  } else if (combined.includes('chướng ngại vật') || combined.includes('chuong ngai vat')) {
    targetKey = 'vuot_cnv';
    targetName = 'Đi vượt chướng ngại vật';
  } else if (combined.includes('tung') || (combined.includes('bắt bóng') && !combined.includes('bóng rổ'))) {
    targetKey = 'tung_bong';
    targetName = 'Tung và bắt bóng tại chỗ';
  } else if (combined.includes('bóng rổ') || combined.includes('dẫn bóng') || combined.includes('ném rổ') || combined.includes('chuyền bóng')) {
    targetKey = 'dan_bong';
    targetName = 'Kỹ thuật môn Bóng rổ';
  } else if (combined.includes('bơi') || combined.includes('dưới nước') || combined.includes('trườn sấp') || combined.includes('lặn')) {
    targetKey = 'boi';
    targetName = 'Kỹ thuật môn Bơi';
  } else if (combined.includes('lăn') || combined.includes('lộn xuôi') || combined.includes('leo') || combined.includes('trèo')) {
    targetKey = 'lan_lon';
    targetName = 'Động tác Lăn và Lộn xuôi';
  }

  // Check if this is an review (Ôn tập) or change-step lesson for Grade 3
  if (targetKey === 'di_deu' && (combined.includes('ôn') || combined.includes('đổi chân') || combined.includes('sai nhịp') || combined.includes('tiết 4') || combined.includes('tiết 16'))) {
    targetKey = 'on_di_deu';
    targetName = 'Ôn Đi đều, Đứng lại & Đổi chân khi sai nhịp';
  }

  // 1. Search in user library with STRICT filtering (must exclude all games and prioritize authentic photos over SVG vectors)
  const technicalOnlyImages = userImages.filter((img) => !isGameImage(img));
  const sortedCandidates = [
    // Prioritize non-SVG authentic images first for the requested grade
    ...technicalOnlyImages.filter((img) => String(img.grade) === String(grade) && !img.imgUrl.startsWith('data:image/svg+xml')),
    ...technicalOnlyImages.filter((img) => String(img.grade) !== String(grade) && !img.imgUrl.startsWith('data:image/svg+xml')),
    ...technicalOnlyImages.filter((img) => String(img.grade) === String(grade)),
    ...technicalOnlyImages.filter((img) => String(img.grade) !== String(grade))
  ];

  let resolvedImgUrl = '';
  let resolvedImgTitle = '';

  const matchedUserImg = sortedCandidates.find((img) => {
    const t = img.title.toLowerCase();
    const c = (img.caption || '').toLowerCase();
    if (t.includes('trò chơi') || t.includes('tro choi')) return false;

    if (targetKey === 'vuon_tho') return t.includes('vươn thở') || c.includes('vươn thở');
    if (targetKey === 'tay') return t.includes('động tác tay') || c.includes('động tác tay') || (t.includes('tay') && !t.includes('cổ tay'));
    if (targetKey === 'chan') return (t.includes('động tác chân') || t.includes('kỹ thuật chân') || (t.includes('chân') && !t.includes('cổ chân'))) && !t.includes('vươn thở');
    if (targetKey === 'luon') return t.includes('lườn') || c.includes('lườn') || t.includes('nghiêng người');
    if (targetKey === 'bung') return t.includes('bụng') || c.includes('bụng') || t.includes('gập thân');
    if (targetKey === 'van_minh') return t.includes('vặn mình') || c.includes('vặn mình');
    if (targetKey === 'toan_than') return t.includes('toàn thân') || c.includes('toàn thân');
    if (targetKey === 'nhay') return (t.includes('động tác nhảy') || c.includes('động tác nhảy')) && !t.includes('lò cò') && !t.includes('tiếp sức');
    if (targetKey === 'dieu_hoa') return t.includes('điều hòa') || c.includes('điều hòa');
    if (targetKey === 'on_di_deu') return (t.includes('ôn đi đều') || t.includes('đổi chân') || t.includes('sai nhịp')) || (t.includes('đi đều') && !t.includes('trò chơi'));
    if (targetKey === 'di_deu') return t.includes('đi đều') || c.includes('đi đều');
    if (targetKey === 'gay') return t.includes('gậy') || c.includes('gậy');
    if (targetKey === 'dung_nghiem') return t.includes('nghiêm') || t.includes('nghỉ') || t.includes('hàng dọc');
    if (targetKey === 'vuot_cnv') return t.includes('chướng ngại vật') || t.includes('vật cản');
    if (targetKey === 'tung_bong') return t.includes('tung') || t.includes('bắt bóng');
    if (targetKey === 'dan_bong') return t.includes('bóng rổ') || t.includes('dẫn bóng');
    if (targetKey === 'boi') return t.includes('bơi') || t.includes('trườn sấp') || t.includes('nước');
    if (targetKey === 'lan_lon') return t.includes('lăn') || t.includes('lộn') || t.includes('đệm');
    return false;
  });

  // Prefer authentic textbook images - never use synthetic recreated SVG graphics when authentic image exists!
  if (matchedUserImg && !matchedUserImg.imgUrl.startsWith('data:image/svg+xml')) {
    resolvedImgUrl = matchedUserImg.imgUrl;
    resolvedImgTitle = matchedUserImg.title;
  } else if (AUTHENTIC_TEXTBOOK_MAP[targetKey]) {
    resolvedImgUrl = AUTHENTIC_TEXTBOOK_MAP[targetKey].url;
    resolvedImgTitle = AUTHENTIC_TEXTBOOK_MAP[targetKey].title;
  } else if (matchedUserImg) {
    resolvedImgUrl = matchedUserImg.imgUrl;
    resolvedImgTitle = matchedUserImg.title;
  } else {
    const std = findMatchingMovement(targetName, grade);
    if (std) {
      resolvedImgUrl = std.svgDataUrl;
      resolvedImgTitle = `Kỹ thuật SGK: ${std.name}`;
      targetName = std.name;
    } else {
      resolvedImgUrl = '/assets/sgk_chuan/k1_vuon_tho.jpg';
      resolvedImgTitle = `Kỹ thuật SGK: ${targetName}`;
    }
  }

  // 2. Generate authentic technical descriptions & 100-120 word teacher instructions
  let movementSteps = '';
  let gvExplanation = '';
  let hsTask = '';
  let practiceFocus = '';

  switch (targetKey) {
    case 'tay':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Hai tay đưa ra trước vỗ vào nhau ngang ngực, tiếng vỗ dứt khoát.\n- Nhịp 3: Như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải bước sang ngang.`;
      gvExplanation = `- GV giới thiệu tên Động tác Tay, nêu rõ tác dụng phát triển sức mạnh khớp vai, cơ cánh tay và tạo tư thế thân trên thẳng đẹp.\n- Thị phạm làm mẫu chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích rõ điểm mấu chốt: nhịp 1 hai tay dang thẳng ngang vai lòng bàn tay ngửa, nhịp 2 vỗ tay trước ngực dứt khoát.\n- Hướng dẫn học sinh đối chiếu với hình ảnh kỹ thuật SGK, lưu ý không để cánh tay chúc xuống dưới hoặc giơ quá cao qua vai.\n- Hô nhịp chậm cho học sinh làm thử; trực tiếp sửa lỗi chùng khuỷu tay và gù lưng cho từng em; nhắc nhở học sinh giữ ngực căng.\n- Động viên, khích lệ cả lớp thực hiện đều và chuẩn xác biên độ.`;
      hsTask = `- Đội hình 4 hàng ngang đứng so le giãn cách 1 sải tay để không va chạm tay nhau.\n- Quan sát tỉ mỉ động tác mẫu của GV và hình ảnh kỹ thuật SGK, ghi nhớ độ cao của cánh tay ngang vai.\n- Thực hiện mô phỏng từng nhịp theo nhịp hô chậm của giáo viên; giữ lưng thẳng, ngực căng.\n- Tự giác nhận biết và sửa lỗi sai tư thế theo hướng dẫn của thầy cô.`;
      practiceFocus = 'hai tay dang thẳng ngang vai và nhịp vỗ tay trước ngực dứt khoát';
      break;

    case 'chan':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Kiễng gót hai chân, hai tay chống hông (thân thẳng, mắt nhìn thẳng).\n- Nhịp 2: Hạ gót, khuỵu gối sâu, hai tay đưa ra trước song song ngang vai, lòng bàn tay sấp, lưng giữ thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (kiễng gót hai chân, hai tay chống hông).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gvExplanation = `- GV giới thiệu Động tác Chân, phân tích tác dụng tăng cường sức mạnh cơ đùi, khớp gối, cổ chân và rèn luyện khả năng giữ thăng bằng cơ thể.\n- Làm mẫu chuẩn 2 - 3 lần theo phương pháp chiều gương; nhấn mạnh nhịp 1 kiễng cao gót giữ thăng bằng trên nửa trước bàn chân, nhịp 2 khuỵu gối sâu nhưng thân người luôn giữ thẳng, không chúi đầu ra trước.\n- Cho học sinh quan sát tranh kỹ thuật SGK, chỉ rõ vị trí đặt hai tay chống hông và hai tay song song ngang vai.\n- Hô nhịp chậm hướng dẫn lớp tập từng nhịp; phát hiện các lỗi sai (mất thăng bằng ngả nghiêng, cong gập lưng khi khuỵu gối) và trực tiếp uốn nắn sửa sai.\n- Biểu dương tinh thần tập luyện nghiêm túc của học sinh.`;
      hsTask = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay an toàn.\n- Chăm chú quan sát tư thế kiễng gót thăng bằng và cách khuỵu gối lưng thẳng của giáo viên.\n- Mô phỏng động tác theo nhịp đếm chậm; cố gắng giữ thăng bằng không để người chao đảo.\n- Lắng nghe góp ý của thầy cô để hoàn thiện độ sâu của gối và độ thẳng của lưng.`;
      practiceFocus = 'kiễng gót thăng bằng và khuỵu gối sâu giữ lưng thẳng';
      break;

    case 'luon':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Nghiêng lườn sâu sang trái, tay trái chống hông, tay phải vươn cao ép sát tai, trọng tâm dồn chân phải.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (hai tay dang ngang, lòng bàn tay ngửa).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân bước sang phải và nghiêng lườn sang phải.`;
      gvExplanation = `- GV giới thiệu Động tác Lườn, giải thích tác dụng làm giãn mềm cột sống, phát triển các nhóm cơ liên sườn và rèn luyện độ dẻo dai cơ thể.\n- Làm mẫu chuẩn xác 2 - 3 lần; nhấn mạnh điểm kỹ thuật quan trọng: khi nghiêng người phải giữ thân trên trên một mặt phẳng trán, không gập người ra trước hoặc ngửa ra sau, hai chân giữ thẳng.\n- Cho học sinh xem tranh kỹ thuật SGK, chỉ rõ độ cong của tay vươn trên đầu và tư thế tay chống hông.\n- Hô nhịp chậm cho học sinh tập thử; kịp thời phát hiện và sửa các lỗi sai xoay vặn thân mình thay vì nghiêng lườn.\n- Khen ngợi những em thực hiện độ uốn lườn sâu và đúng kỹ thuật.`;
      hsTask = `- Đội hình 4 hàng ngang so le giãn cách 1 sải tay.\n- Quan sát hướng uốn của thân người trên mặt phẳng trán, ghi nhớ nhịp thở đều đặn.\n- Thực hiện từng nhịp chậm rãi, tự cảm nhận độ căng của cơ lườn khi uốn nghiêng.\n- Tích cực sửa sai tư thế tay áp sát tai theo hướng dẫn của giáo viên.`;
      practiceFocus = 'độ uốn lườn sâu trên mặt phẳng trán và tay vươn sát tai';
      break;

    case 'bung':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng hơn vai, hai tay đưa thẳng lên cao song song, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ.\n- Nhịp 2: Cúi gập thân sâu ra trước, cúi đầu, hai tay hướng xuống chạm hai mu bàn chân, hai chân giữ thẳng.\n- Nhịp 3: Đứng thẳng lên, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.`;
      gvExplanation = `- GV giới thiệu Động tác Bụng, phân tích tác dụng tăng cường độ dẻo dai của gân kheo cơ đùi sau và săn chắc các nhóm cơ bụng.\n- Làm mẫu trực quan 2 - 3 lần kết hợp phân tích nhịp: nhịp 1 vươn căng hai tay lên cao, nhịp 2 gập sâu thân người thở ra hết, hai chân giữ thẳng không được co gập gối.\n- Cho học sinh quan sát tranh vẽ kỹ thuật SGK, lưu ý tư thế đầu cúi tự nhiên theo thân người.\n- Hô nhịp chậm điều khiển lớp tập thử; di chuyển quan sát uốn nắn cho những em chân còn bị co gập hoặc cúi gập quá vội vàng.\n- Tuyên dương các em giữ được chân thẳng và chạm tay tới mu bàn chân.`;
      hsTask = `- Đội hình 4 hàng ngang giãn cách cự ly 1 sải tay.\n- Chăm chú theo dõi tư thế cúi gập thân và giữ thẳng đầu gối của thầy cô.\n- Tập mô phỏng chậm rãi, thở ra hết khi gập thân và hít sâu khi vươn người đứng thẳng.\n- Tự giác điều chỉnh không co gối khi tay với xuống chạm mu bàn chân.`;
      practiceFocus = 'hai chân giữ thẳng và cúi gập thân sâu thở ra nhịp nhàng';
      break;

    case 'van_minh':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay dang ngang bằng vai, lòng bàn tay ngửa.\n- Nhịp 2: Vặn mình sang trái 90 độ, hai bàn chân giữ nguyên cố định bám sàn, hai tay giữ ngang vai.\n- Nhịp 3: Như nhịp 1 (về tư thế hai tay dang ngang).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng bước chân phải và vặn mình sang phải.`;
      gvExplanation = `- GV giới thiệu Động tác Vặn mình, nêu rõ tác dụng tăng độ linh hoạt của khớp háng, cột sống và rèn luyện sự khéo léo phối hợp vận động.\n- Làm mẫu kỹ thuật 2 - 3 lần; nhấn mạnh yêu cầu: hai bàn chân phải bám chắc trên mặt sân, chỉ xoay vặn phần thân trên 90 độ, không xoay nhấc gót chân.\n- Hướng dẫn học sinh quan sát hình ảnh SGK, nhắc nhở giữ hai tay ngang bằng vai trong suốt quá trình vặn mình.\n- Hô nhịp chậm hướng dẫn lớp tập luyện; quan sát phát hiện lỗi xoay cả chân hoặc hạ tay xuống thấp để kịp thời nhắc nhở sửa chữa.\n- Biểu dương sự cố gắng và chuyển động dứt khoát của học sinh.`;
      hsTask = `- Đội hình 4 hàng ngang so le 1 sải tay.\n- Quan sát góc xoay 90 độ của thân trên và vị trí cố định của hai bàn chân.\n- Thực hiện động tác vặn mình dứt khoát, giữ hai cánh tay thẳng ngang vai.\n- Chỉnh sửa tư thế bàn chân bám chắc mặt sân theo nhắc nhở của thầy cô.`;
      practiceFocus = 'bàn chân cố định bám sàn và vặn thân trên 90 độ dứt khoát';
      break;

    case 'toan_than':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bước chân trái chếch trước, khuỵu gối sâu, chân sau thẳng, hai tay vươn chếch cao chữ V, ngửa đầu.\n- Nhịp 2: Rút chân trái về, cúi gập thân hai tay chạm mũi chân, chân thẳng.\n- Nhịp 3: Đứng thẳng hai tay dang ngang bằng vai, ngực căng.\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng bước chân phải chếch trước.`;
      gvExplanation = `- GV giới thiệu Động tác Toàn thân, phân tích tác dụng kéo giãn liên hoàn các nhóm cơ đùi, lưng và cánh tay, nâng cao khả năng phối hợp vận động toàn diện.\n- Thị phạm chuẩn xác 2 - 3 lần theo phương pháp chiều gương; phân tích kỹ thuật dồn trọng tâm lên chân trước khi khuỵu gối và độ căng cơ lưng khi cúi gập.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK, chỉ rõ độ mở của hai chân.\n- Hô nhịp chậm cho học sinh tập mô phỏng; kịp thời uốn nắn tư thế khuỵu gối vững chãi và thẳng chân sau.\n- Khen ngợi những em thực hiện nhịp nhàng, vững vàng thăng bằng.`;
      hsTask = `- Đội hình 4 hàng ngang đứng so le, khoảng cách 1 sải tay.\n- Quan sát kỹ thuật bước chân chếch trước và khuỵu gối của GV.\n- Tập mô phỏng từng nhịp theo nhịp hô chậm, chú ý giữ thăng bằng chân trước chân sau.\n- Tiếp thu chỉ dẫn để hoàn thiện độ vươn cao của hai tay và độ dẻo thân người.`;
      practiceFocus = 'dồn trọng tâm chân trước khuỵu gối và phối hợp toàn thân nhịp nhàng';
      break;

    case 'nhay':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Bật nhảy tách hai chân sang ngang rộng bằng vai, đồng thời hai tay dang ngang bằng vai, lòng bàn tay sấp.\n- Nhịp 2: Bật nhảy khép hai chân về, đồng thời hai tay vỗ vào nhau trên đỉnh đầu.\n- Nhịp 3: Như nhịp 1 (bật nhảy tách chân, hai tay dang ngang).\n- Nhịp 4: Bật nhảy khép chân về TTCB (hạ hai tay xuôi theo thân).\n- Nhịp 5, 6, 7, 8: Thực hiện liên tục như nhịp 1, 2, 3, 4.`;
      gvExplanation = `- GV giới thiệu Động tác Nhảy, giải thích tác dụng phát triển sức bật của đôi chân, độ linh hoạt toàn thân và sự hào hứng phấn chấn.\n- Thị phạm mẫu chuẩn 2 - 3 lần; lưu ý điểm an toàn quan trọng: khi bật nhảy phải tiếp đất nhẹ nhàng bằng nửa trước bàn chân để hoãn xung, tránh dộng gót gây đau khớp gối.\n- Cho học sinh quan sát tranh ảnh SGK, chỉ rõ nhịp vỗ tay trên đỉnh đầu dứt khoát kết hợp bật nhảy nhịp nhàng.\n- Hô nhịp đếm chậm cho học sinh tập thử từng nhịp; trực tiếp sửa sai cách tiếp đất cho các em; nhắc nhở học sinh giữ nhịp thở đều.\n- Tuyên dương tinh thần tập luyện sôi nổi, động tác đều đẹp của cả lớp.`;
      hsTask = `- Đội hình 4 hàng ngang giãn cách 1 sải tay an toàn.\n- Chú ý quan sát động tác tiếp đất êm bằng mũi bàn chân và nhịp vỗ tay trên đầu của GV.\n- Bật nhảy nhịp nhàng theo nhịp đếm, giữ lưng thẳng, tiếp đất nhẹ nhàng không gây tiếng ồn lớn.\n- Tự điều chỉnh biên độ nhảy vừa sức và giữ nhịp thở ổn định.`;
      practiceFocus = 'bật nhảy nhịp nhàng và tiếp đất nhẹ nhàng bằng nửa trước bàn chân';
      break;

    case 'dieu_hoa':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang chạm bằng mũi chân, hai tay đưa ra trước lắc cổ tay nhẹ nhàng, hít sâu bằng mũi.\n- Nhịp 2: Về TTCB, thở ra từ từ bằng miệng.\n- Nhịp 3: Chân phải đưa sang ngang chạm bằng mũi chân, hai tay dang ngang lắc cổ tay nhẹ nhàng, hít sâu.\n- Nhịp 4: Về TTCB, thở ra.\n- Nhịp 5, 6, 7, 8: Thực hiện như nhịp 1, 2, 3, 4.`;
      gvExplanation = `- GV giới thiệu Động tác Điều hòa, nhấn mạnh đây là động tác cuối cùng của bài thể dục giúp cơ thể thả lỏng, nhịp tim và hô hấp hồi phục về trạng thái cân bằng.\n- Làm mẫu 2 - 3 lần kết hợp hướng dẫn nhịp thở sâu, êm; phân tích kỹ thuật lắc cổ tay nhẹ nhàng, thả lỏng toàn bộ các cơ bắp.\n- Cho học sinh đối chiếu với tranh ảnh SGK, hướng dẫn các em tập trung cảm nhận sự thư thái khi thực hiện động tác.\n- Hô nhịp chậm, giọng điệu nhẹ nhàng truyền cảm giúp học sinh thả lỏng tối đa; nhắc nhở các em không gồng cứng cơ bắp.\n- Nhận xét và đánh giá cao sự tiến bộ của toàn lớp trong việc hoàn thiện bài tập thể dục.`;
      hsTask = `- Đội hình 4 hàng ngang đứng giãn cách thoải mái.\n- Lắng nghe nhịp hô chậm rãi, êm dịu của giáo viên, thả lỏng hoàn toàn các khớp cổ tay và chân.\n- Thực hiện đưa chân chạm mũi nhẹ nhàng, kết hợp hít vào sâu bằng mũi và thở ra chậm rãi bằng miệng.\n- Đưa cơ thể về trạng thái hồi phục khoan khoái sau giờ học.`;
      practiceFocus = 'lắc cổ tay thả lỏng nhẹ nhàng và điều hòa nhịp thở sâu êm';
      break;

    case 'di_deu':
      movementSteps = `- TTCB: Đứng nghiêm.\n- Khẩu lệnh: "Đi đều... BƯỚC!".\n- Động tác: Bước chân trái ra trước nhịp 1, đồng thời tay phải gập vuông góc trước ngực, tay trái đánh thẳng ra sau; nhịp 2 bước chân phải, đổi tay; bước chân theo nhịp 1-2, 1-2 dứt khoát.\n- Khẩu lệnh: "Đứng lại... ĐỨNG!" (dự lệnh và động lệnh đều rơi vào chân phải).\n- Động tác: Sau động lệnh "ĐỨNG!", bước tiếp chân trái một bước rồi khép chân phải về TTCB đứng nghiêm.`;
      gvExplanation = `- GV giới thiệu động tác Đi đều, Đứng lại, phân tích ý nghĩa rèn luyện tính kỷ luật, tác phong đội ngũ nhanh nhẹn, thống nhất và đẹp mắt.\n- Làm mẫu chuẩn xác 2 - 3 lần theo phương pháp vừa làm vừa phân tích; nhấn mạnh quy tắc: "Chân nọ tay kia", chân trái bước vào nhịp 1, chân phải bước vào nhịp 2, tay đánh vuông góc trước ngực.\n- Cho học sinh xem tranh kỹ thuật SGK lớp 3 trang 27, hướng dẫn cách nghe khẩu lệnh dự lệnh và động lệnh.\n- Hô nhịp tại chỗ cho học sinh tập dậm chân trước, sau đó cho đi đều từng bước ngắn; quan sát phát hiện lỗi đi cùng chân cùng tay để sửa ngay.\n- Khen ngợi các em bước chân đúng nhịp hô dứt khoát.`;
      hsTask = `- Đội hình hàng dọc hoặc hàng ngang theo cự ly chuẩn bị đi đều.\n- Lắng nghe dự lệnh và động lệnh của GV, ghi nhớ quy tắc bước chân trái ở nhịp 1 và chân phải ở nhịp 2.\n- Đi đều dứt khoát, tay đánh tự nhiên vuông góc trước ngực, mắt nhìn thẳng phía trước.\n- Chỉnh đốn cự ly hàng ngũ thẳng đều theo các bạn xung quanh.`;
      practiceFocus = 'bước chân đúng nhịp 1 - 2 chân nọ tay kia và đứng lại chuẩn khẩu lệnh';
      break;

    case 'gay':
      movementSteps = `- TTCB: Đứng nghiêm, hai tay cầm hai đầu gậy thể dục đặt ngang trước đùi.\n- Nhịp 1: Kiễng gót hai chân, hai tay nâng gậy thẳng ra trước ngang vai (thân thẳng, gậy song song mặt đất).\n- Nhịp 2: Khuỵu gối sâu, hai tay giữ nguyên gậy ngang vai, lưng thẳng, mắt nhìn thẳng.\n- Nhịp 3: Đứng thẳng lên như nhịp 1 (kiễng gót hai chân, nâng gậy ngang vai).\n- Nhịp 4: Về TTCB.\n- Nhịp 5, 6, 7, 8: Thực hiện liên hoàn như nhịp 1, 2, 3, 4.`;
      gvExplanation = `- GV giới thiệu bài tập thể dục với gậy, nêu rõ tác dụng phát triển sức mạnh tay vai, độ khéo léo kết hợp dụng cụ và rèn luyện tư thế chuẩn mực.\n- Quán triệt kỷ luật an toàn sử dụng gậy; kiểm tra gậy nhẵn bóng không nứt gãy trước khi tập; thị phạm mẫu chuẩn xác 2 - 3 lần.\n- Cho học sinh quan sát tranh ảnh SGK lớp 5 trang 24-26, chỉ rõ cách cầm gậy cân đối và giữ gậy thăng bằng song song với mặt sân.\n- Hô nhịp trống/còi dứt khoát hướng dẫn học sinh tập thử từng nhịp; luân chuyển uốn nắn tư thế gậy và lưng thẳng cho từng em.\n- Đánh giá cao ý thức giữ cự ly an toàn và sự đồng đều của các tổ.`;
      hsTask = `- Đội hình 4 hàng ngang so le cự ly 1.5m đảm bảo không chạm gậy vào nhau.\n- Cầm chắc hai đầu gậy, chăm chú quan sát tư thế nâng gậy song song và khuỵu gối lưng thẳng của GV.\n- Tập liên hoàn theo nhịp trống dứt khoát, nâng gậy đều đẹp và hạ gậy dứt khoát.\n- Tự giác bảo quản dụng cụ học tập cẩn thận trong suốt tiết học.`;
      practiceFocus = 'nâng gậy song song thăng bằng và giữ khoảng cách an toàn dụng cụ';
      break;

    case 'dung_nghiem':
      movementSteps = `- Tư thế đứng nghiêm: Khẩu lệnh "Nghiêm!" - Học sinh đứng thẳng người, ngực căng, hai gót chân chạm sát nhau, hai mũi chân mở tự nhiên hình chữ V (45-60 độ); hai tay duỗi thẳng dọc đùi, ngón tay khép nhẹ, mắt nhìn thẳng.\n- Tư thế đứng nghỉ: Khẩu lệnh "Nghỉ!" - Học sinh trùng nhẹ khớp gối chân trái (hoặc chân phải), trọng tâm dồn lên chân còn lại, thân người thả lỏng tự nhiên; khi mỏi có thể đổi chân.`;
      gvExplanation = `- GV giới thiệu và làm mẫu chuẩn mực hai tư thế Đứng nghiêm và Đứng nghỉ, giải thích ý nghĩa rèn nếp sống kỷ luật, tư thế tác phong ngay ngắn trong học tập và sinh hoạt.\n- Thị phạm 2 - 3 lần kết hợp giải thích chi tiết: tư thế nghiêm gót chân phải khép chạm, ngực căng thẳng, hai tay khép sát sườn đùi, không nhấp nhổm.\n- Cho học sinh quan sát tranh ảnh SGK lớp 1 trang 10-11, chỉ rõ sự khác biệt giữa chân đứng thẳng và chân trùng gối khi nghỉ.\n- Phát khẩu lệnh "Nghiêm!" - "Nghỉ!" luân phiên cho toàn lớp thực hiện; trực tiếp đi sửa tư thế mở bàn chân chữ V và góc nhìn thẳng cho học sinh.\n- Biểu dương sự tập trung, tác phong nhanh nhẹn và nghiêm túc của lớp.`;
      hsTask = `- Đội hình 4 hàng ngang tập trung chỉnh đốn hàng ngũ.\n- Lắng nghe khẩu lệnh dứt khoát, thực hiện dứt khoát tư thế đứng nghiêm (khép gót, căng ngực) và tư thế nghỉ (trùng gối tự nhiên).\n- Giữ trật tự, mắt nhìn thẳng, không quay nghiêng ngửa đầu khi đứng nghiêm.\n- Tự điều chỉnh tư thế bàn chân theo hướng dẫn của giáo viên.`;
      practiceFocus = 'gót chân khép chạm mở mũi chữ V và phản xạ dứt khoát theo khẩu lệnh';
      break;

    case 'vuot_cnv':
      movementSteps = `- TTCB: Đứng chân trước chân sau trước vạch xuất phát, hai tay buông tự nhiên, mắt quan sát chướng ngại vật.\n- Động tác: Bước đi tự nhiên theo đường thẳng; khi đến gần chướng ngại vật (cọc mốc, vạch kẻ, bóng), nâng cao đùi bước dứt khoát qua vật cản, tiếp đất êm bằng nửa trước bàn chân rồi bước tiếp tục, hai tay đánh phối hợp thăng bằng.`;
      gvExplanation = `- GV giới thiệu bài tập Đi vượt chướng ngại vật, nêu rõ tác dụng rèn luyện sự khéo léo, khả năng định hướng và kỹ năng vượt vật cản an toàn trong đời sống.\n- Bố trí các chướng ngại vật thấp (10-15cm), cự ly an toàn 1.5 - 2m; làm mẫu chuẩn xác 2-3 lần kết hợp giải thích cách nâng cao đùi và tiếp đất nhẹ nhàng.\n- Cho học sinh quan sát hình ảnh SGK lớp 3 trang 41-43, chỉ rõ điểm đặt chân trước và sau vật cản.\n- Cho từng nhóm học sinh đi thử, GV đứng sát bên quan sát uốn nắn, nhắc nhở không nhảy vội vàng làm xô đổ chướng ngại vật.\n- Khen ngợi những em bước qua êm ái, giữ vững thăng bằng.`;
      hsTask = `- Đội hình hàng dọc trước làn chướng ngại vật.\n- Quan sát điểm chạm đất và biên độ nâng đùi của giáo viên.\n- Lần lượt từng học sinh thực hiện đi vượt chướng ngại vật theo hiệu lệnh còi, giữ thăng bằng thân người.\n- Chờ đến lượt trật tự, cổ vũ động viên các bạn trong tổ.`;
      practiceFocus = 'nâng cao đùi bước qua vật cản và tiếp đất thăng bằng an toàn';
      break;

    case 'tung_bong':
      movementSteps = `- TTCB: Đứng chân trước chân sau (hoặc hai chân rộng bằng vai), hai tay ôm đón bóng ở trước ngực.\n- Động tác tung bóng: Hơi khuỵu gối lấy đà, dùng lực cẳng tay và cổ tay đẩy tung bóng thẳng lên cao phía trước mặt từ 0.8m - 1.2m.\n- Động tác bắt bóng: Hai mắt chăm chú theo dõi đường bóng rơi, hai tay giơ lên xòe rộng các ngón đón bóng ngang ngực, hoãn xung giữ êm vào lòng bàn tay.`;
      gvExplanation = `- GV giới thiệu kỹ thuật Tung và bắt bóng, nêu rõ tác dụng phát triển phản xạ thị giác, khả năng phán đoán quỹ đạo và sự khéo léo của đôi tay.\n- Thị phạm làm mẫu 2 - 3 lần kết hợp chỉ dẫn: khi tung bóng phải đẩy bóng theo phương thẳng đứng, khi bắt bóng phải xòe rộng ngón tay đón bóng và co nhẹ tay hoãn xung.\n- Cho học sinh quan sát hình ảnh SGK, nhắc nhở không dùng lòng bàn tay đập vào bóng làm nảy bóng rơi.\n- Hướng dẫn học sinh tập tung bắt bóng tại chỗ cá nhân trước, sau đó phát triển sang chuyền bắt bóng cặp đôi.\n- Tuyên dương những em bắt bóng dính và chuẩn xác.`;
      hsTask = `- Đội hình 4 hàng ngang giãn cách cự ly 2m để không va chạm bóng.\n- Mỗi học sinh cầm 1 quả bóng tập trung quan sát hướng tung và đón bóng của GV.\n- Tự giác luyện tập tung bóng vừa tầm mắt và đón bắt êm bằng hai tay.\n- Phối hợp cặp đôi chuyền bắt bóng nhịp nhàng, giúp bạn nhặt bóng rơi.`;
      practiceFocus = 'tung bóng thẳng hướng và xòe ngón đón bóng hoãn xung êm ái';
      break;

    case 'dan_bong':
      movementSteps = `- TTCB: Chân trước chân sau, hai đầu gối khuỵu hạ thấp trọng tâm, lưng thẳng nghiêng nhẹ về trước, mắt quan sát phía trước.\n- Động tác dẫn bóng: Dùng các chai ngón tay và cổ tay ấn đẩy bóng nhịp nhàng xuống sân; bóng nảy lên ngang tầm hông thì tiếp tục ấn bóng xuống; tay không dẫn bóng co tự nhiên trước ngực bảo vệ bóng.`;
      gvExplanation = `- GV giới thiệu kỹ thuật Dẫn bóng trong môn bóng rổ, phân tích tầm quan trọng của cảm giác bóng và khả năng giữ thăng bằng khi di chuyển.\n- Làm mẫu kỹ thuật dẫn bóng tại chỗ bằng tay thuận và tay không thuận; nhấn mạnh không được dùng cả lòng bàn tay tát vào bóng mà phải dùng độ dẻo ngón tay ấn đẩy bóng nhịp nhàng.\n- Cho học sinh xem tranh kỹ thuật SGK, nhắc các em tập thói quen không nhìn chằm chằm vào bóng mà phải ngẩng đầu quan sát sân.\n- Hướng dẫn học sinh nhồi bóng theo nhịp đếm; trực tiếp uốn nắn độ khuỵu gối và độ cao của bóng cho từng em.\n- Khen ngợi học sinh kiểm soát bóng tự tin, nhịp nhàng.`;
      hsTask = `- Đội hình 4 hàng ngang so le, mỗi em 1 bóng cự ly giãn cách an toàn.\n- Quan sát độ nảy của bóng và điểm tiếp xúc bằng các ngón tay của GV.\n- Tập nhồi bóng tại chỗ bằng tay thuận rồi đổi sang tay trái, giữ trọng tâm thấp.\n- Ngẩng đầu quan sát tín hiệu tay của thầy cô trong khi nhồi bóng.`;
      practiceFocus = 'dùng các ngón tay nhồi bóng nảy ngang hông và mắt nhìn quan sát';
      break;

    case 'boi':
      movementSteps = `- TTCB: Hai tay bám chắc mép thành bể (hoặc nằm sấp trên thảm tập), thân người duỗi thẳng tự nhiên trên mặt nước phẳng.\n- Động tác đập chân: Hai chân duỗi thẳng, phát lực từ khớp hông đập so le lên xuống nhịp nhàng, cổ chân thả lỏng, mũi chân duỗi thẳng tạo bọt nước mịn.\n- Động tác quạt tay: Tay đưa ra trước ôm nước, kéo nước dọc theo thân người ra sau rồi nhấc khuỷu tay vung lên đưa về trước.`;
      gvExplanation = `- GV giới thiệu kỹ thuật bơi trườn sấp, phân tích tầm quan trọng của kỹ năng bơi phòng chống đuối nước và rèn luyện thể lực toàn diện.\n- Quán triệt nội quy an toàn sông nước tuyệt đối; làm mẫu chuẩn xác động tác đập chân và quạt tay trên cạn 2-3 lần trước khi xuống nước.\n- Cho học sinh xem tranh ảnh kỹ thuật SGK, chỉ rõ cách phát lực từ hông chứ không phải co gập đầu gối.\n- Hướng dẫn học sinh tập mô phỏng trên cạn, sau đó thực hành đập chân bám thành bể có áo phao/phao bơi hỗ trợ an toàn.\n- Động viên, khích lệ tinh thần tự tin, dạn nước của các em.`;
      hsTask = `- Đội hình xếp hàng trật tự dọc theo thành bể bơi có phao cứu sinh an toàn.\n- Tập trung quan sát kỹ thuật chân duỗi thẳng phát lực từ hông của GV.\n- Thực hiện bài tập mô phỏng trên cạn thuần thục trước khi xuống bể bơi.\n- Chấp hành nghiêm ngặt hiệu lệnh còi cứu hộ của giáo viên.`;
      practiceFocus = 'phát lực đập chân từ hông và phối hợp quạt tay thở nhịp nhàng';
      break;

    case 'lan_lon':
      movementSteps = `- TTCB: Ngồi xổm trên mép đệm thể dục, hai tay chống đệm phía trước rộng bằng vai, mắt nhìn đệm.\n- Động tác lộn xuôi: Đạp nhẹ hai chân, nâng mông cao, gập sâu cằm sát vào ngực, cong tròn lưng; đặt phần sau gáy chạm đệm rồi lăn tròn thân người theo lưng ra trước, hai tay ôm lấy cẳng chân đứng dậy về TTCB.`;
      gvExplanation = `- GV giới thiệu kỹ thuật Lộn xuôi và Lăn trên đệm thể dục, nêu rõ tác dụng rèn luyện sự khéo léo, khả năng định hướng không gian và kỹ năng tự bảo vệ khi ngã.\n- Kiểm tra kỹ đệm thể dục êm ái, bề mặt phẳng an toàn; làm mẫu chuẩn xác 2 - 3 lần kết hợp giải thích chậm: điểm chạm đệm là phần gáy và lưng trên, tuyệt đối không chống đỉnh đầu xuống đệm.\n- Hướng dẫn học sinh xem tranh kỹ thuật SGK lớp 5 trang 41, nhắc nhở tư thế cuộn tròn người hình cầu.\n- Đứng sát đệm trực tiếp đỡ lưng bảo hiểm cho từng học sinh thực hiện; nhắc nhở học sinh gập cằm sát ngực trong suốt quá trình lộn.\n- Khen ngợi những em thực hiện động tác lăn êm, đứng dậy thăng bằng.`;
      hsTask = `- Đội hình hàng dọc trước 4 thảm đệm thể dục an toàn.\n- Quan sát kỹ thuật giấu cằm vào ngực và cuộn tròn lưng của giáo viên.\n- Luân phiên từng bạn lên thực hiện động tác trên đệm có sự bảo hiểm của GV.\n- Tự giác đứng dậy gọn gàng và di chuyển về cuối hàng trật tự.`;
      practiceFocus = 'giấu cằm sát ngực, cuộn tròn lưng lăn êm và đứng dậy thăng bằng';
      break;

    default:
      // Mặc định Vươn thở
      movementSteps = `- TTCB: Đứng nghiêm.\n- Nhịp 1: Chân trái bước sang ngang rộng bằng vai, hai tay đưa lên cao chếch chữ V, lòng bàn tay hướng vào nhau, đầu ngửa nhẹ, hít sâu bằng mũi.\n- Nhịp 2: Hai tay đưa xuống bắt chéo trước bụng, cúi nhẹ đầu, thở ra từ từ bằng miệng.\n- Nhịp 3: Như nhịp 1 (hít sâu).\n- Nhịp 4: Về TTCB (thở ra).\n- Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân phải.`;
      gvExplanation = `- GV giới thiệu tên động tác ${targetName}, nêu rõ tác dụng giúp phát triển các nhóm cơ và rèn luyện tư thế chuẩn xác.\n- Thị phạm làm mẫu chuẩn xác 2 - 3 lần theo phương pháp chiều gương kết hợp phân tích chậm từng nhịp; nhấn mạnh nhịp hít sâu bằng mũi, vươn căng các cơ, và nhịp thở ra hết bằng miệng.\n- Cho học sinh quan sát tranh ảnh kỹ thuật đính kèm trong SGK, chỉ rõ hướng của các chi và góc ngửa của đầu thân người.\n- Hô nhịp chậm hướng dẫn toàn lớp tập thử từng nhịp; quan sát phát hiện các lỗi sai phổ biến (cúi gập đầu quá thấp, tay chùng chưa căng, thở nông) và hướng dẫn sửa sai ngay tại chỗ.\n- Khen ngợi những em thực hiện đúng biên độ.`;
      hsTask = `- Đội hình 4 hàng ngang đứng so le, cự ly giãn cách 1 sải tay để không va chạm.\n- Chăm chú quan sát động tác làm mẫu của GV và hình ảnh kỹ thuật SGK, ghi nhớ khẩu lệnh và thứ tự từng nhịp.\n- Bắt chước thực hiện mô phỏng từng nhịp theo nhịp hô chậm của giáo viên; phối hợp nhịp nhàng giữa nhịp thở và cử động tay chân.\n- Tự giác nhận biết và sửa lỗi sai tư thế theo hướng dẫn của thầy cô.`;
      practiceFocus = 'vươn căng hai tay chếch chữ V và phối hợp nhịp thở sâu';
      break;
  }

  return {
    movementName: targetName,
    imgUrl: resolvedImgUrl,
    imgTitle: resolvedImgTitle,
    movementSteps,
    gvExplanation,
    hsTask,
    practiceFocus
  };
}

/**
 * Resolves an authentic game image from the user library or standard SGK assets matching the game name.
 */
export function resolveAccurateGameImage(
  gameName: string = '',
  grade: number = 1,
  category: 'tro_choi_kd' | 'tro_choi_vd' = 'tro_choi_vd',
  userImages: SgkImageItem[] = []
): { url: string; title: string } {
  const cleanName = (gameName || '').toLowerCase().trim();

  // 1. Search user library for exact or keyword matching strictly for this grade
  if (userImages && userImages.length > 0) {
    const match = userImages.find((img) => {
      if (img.grade && String(img.grade) !== String(grade)) return false;
      const t = (img.title || '').toLowerCase();
      const c = (img.caption || '').toLowerCase();
      if (!isGameImage(img)) return false;
      if (cleanName && (t.includes(cleanName) || c.includes(cleanName))) return true;

      const words = cleanName.split(/\s+/).filter((w) => w.length > 3);
      return words.length > 0 && words.some((w) => t.includes(w) || c.includes(w));
    });

    if (match) {
      return {
        url: match.imgUrl,
        title: match.title || `Trò chơi: ${gameName}`
      };
    }
  }

  // 2. Authoritative textbook image mapping by grade
  if (grade === 1) {
    if (cleanName.includes('kết bạn') || cleanName.includes('ket ban')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
        title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC 1 (Trang 31)'
      };
    }
    if (cleanName.includes('lò cò') || cleanName.includes('lo co') || cleanName.includes('tiếp sức')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
        title: 'Trò chơi bổ trợ khéo léo: Lò cò tiếp sức - SGK GDTC 1 (Trang 34)'
      };
    }
    if (cleanName.includes('thỏ') || cleanName.includes('tho') || cleanName.includes('hiệu lệnh')) {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_tho.jpg',
        title: `Trò chơi SGK Khối 1: ${gameName || 'Con thỏ / Làm theo hiệu lệnh'}`
      };
    }
    // Default fallback for Grade 1
    if (category === 'tro_choi_kd') {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_ket_ban.jpg',
        title: 'Trò chơi bổ trợ khởi động: Kết bạn - SGK GDTC 1 (Trang 31)'
      };
    } else {
      return {
        url: '/assets/sgk_chuan/k1_tro_choi_lo_co_tiep_suc.jpg',
        title: 'Trò chơi bổ trợ khéo léo: Lò cò tiếp sức - SGK GDTC 1 (Trang 34)'
      };
    }
  }

  if (grade === 3) {
    return {
      url: '/assets/sgk_chuan/k3_tro_choi_tam_giac.jpg',
      title: `Trò chơi SGK Khối 3: ${gameName || 'Chạy theo hình tam giác / Đua ô tô'}`
    };
  }

  // Grade 5 (Bài tập thể dục với gậy)
  if (cleanName.includes('nhanh nhất') || cleanName.includes('đội nào') || cleanName.includes('doi nao') || cleanName.includes('nhanh nhat')) {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: 'Trò chơi bổ trợ khởi động: Đội nào nhanh nhất - SGK GDTC 5 (Trang 29)'
    };
  }
  if (category === 'tro_choi_kd') {
    return {
      url: '/assets/sgk_chuan/k5_tro_choi_doi_nao_nhanh_nhat.jpg',
      title: `Trò chơi bổ trợ khởi động: ${gameName || 'Đội nào nhanh nhất'} - SGK GDTC 5 (Trang 29)`
    };
  }
  return {
    url: '/assets/sgk_chuan/k5_chuyen_gay_tiep_suc.jpg',
    title: `Trò chơi SGK Khối 5: ${gameName || 'Chuyền gậy tiếp sức'}`
  };
}

/**
 * Creates 7 balanced lesson rows where:
 * 1. Practice 3.1, 3.2, 3.3 are separated into dedicated rows with individual diagrams.
 * 2. Teacher activities (Cột GV) are estimated at ~100-120 words per row to match image/diagram heights and eliminate white space.
 * 3. Movement image is 100% matched with title and content.
 * 4. Warm-up and practice games strictly match the syllabus and attach authentic textbook game photos.
 */
export function createBalanced7LessonRows(
  grade: number = 1,
  title: string = 'Bài tập rèn luyện thể dục phát triển chung',
  userImages: SgkImageItem[] = [],
  customWarmupGame?: string,
  customPracticeGame?: string
): LessonRow[] {
  const accurate = resolveAccurateMovement('', title, grade, userImages);
  const mName = accurate.movementName;

  const isG1Bai2 =
    grade === 1 &&
    (title.toLowerCase().includes('chân') ||
      title.toLowerCase().includes('vặn mình') ||
      title.toLowerCase().includes('bụng') ||
      title.toLowerCase().includes('bài 2'));
  const isG1Bai3 =
    grade === 1 &&
    (title.toLowerCase().includes('phối hợp') ||
      title.toLowerCase().includes('điều hòa') ||
      title.toLowerCase().includes('bài 3'));

  const defaultG1Warmup = isG1Bai2 ? 'Kết bạn' : 'Làm theo hiệu lệnh';
  const defaultG1Practice = isG1Bai2 ? 'Lò cò tiếp sức' : isG1Bai3 ? 'Mèo đuổi chuột' : 'Thỏ nhường hang';

  const resolvedWarmup =
    customWarmupGame ||
    (grade === 1 ? defaultG1Warmup : grade === 3 ? 'Chui qua hầm' : 'Ai nhanh hơn với gậy');
  const resolvedPractice =
    customPracticeGame ||
    (grade === 1 ? defaultG1Practice : grade === 3 ? 'Đua ô tô' : 'Chuyền gậy tiếp sức');

  const warmupImg = resolveAccurateGameImage(resolvedWarmup, grade, 'tro_choi_kd', userImages);
  const practiceImg = resolveAccurateGameImage(resolvedPractice, grade, 'tro_choi_vd', userImages);

  const equipmentDesc =
    grade === 5
      ? 'Gậy thể dục, cọc tiêu theo chuẩn nội dung trò chơi.'
      : 'Sân bãi sạch sẽ, vạch xuất phát, cọc tiêu đích an toàn theo đúng chuẩn SGK.';

  return [
    // HÀNG 1: MỞ ĐẦU & KHỞI ĐỘNG (Gắn ảnh Trò chơi khởi động chuẩn SGK)
    {
      content: `1. HOẠT ĐỘNG MỞ ĐẦU\n1.1. Nhận lớp:\n- Kiểm tra vệ sinh sân tập, trang phục, sức khỏe học sinh.\n- Phổ biến mục tiêu, nội dung bài học.\n1.2. Khởi động:\n- Xoay kỹ các khớp: cổ tay, cổ chân, khớp vai, cánh tay, hông, đầu gối, ép dọc, ép ngang (theo nhạc).\n1.3. Trò chơi bổ trợ khởi động: "${resolvedWarmup}".`,
      lvd: `5 - 7 phút\n2L x 8N`,
      gv: `- GV tập trung lớp, thăm hỏi tình hình sức khỏe học sinh (nhắc em nào mệt, đau ốm báo ngay để nghỉ tập hoặc tập nhẹ); kiểm tra sân bãi sạch sẽ, trang phục giày thể thao đúng quy định.\n- Phổ biến mục tiêu, yêu cầu cần đạt của bài học một cách ngắn gọn, truyền cảm hứng.\n- Hướng dẫn cán sự điều khiển lớp khởi động xoay kỹ các khớp theo nhạc hoặc nhịp hô dứt khoát; nhắc nhở học sinh xoay đúng biên độ, không làm vội vàng để phòng tránh chấn thương.\n- Tổ chức trò chơi bổ trợ khởi động "${resolvedWarmup}" tạo không khí vui tươi, hào hứng trước khi vào bài mới; quan sát bao quát và nhắc nhở tinh thần tập trung, trật tự.`,
      hs: `- Cán sự tập hợp lớp thành 4 hàng ngang, điểm số, chỉnh đốn hàng ngũ và báo cáo sĩ số cho GV.\n- Học sinh lắng nghe phổ biến, ghi nhớ yêu cầu tiết học.\n- Thực hiện xoay kỹ các khớp theo nhịp đếm của cán sự lớp, khởi động tích cực, đúng biên độ.\n- Hào hứng tham gia trò chơi khởi động "${resolvedWarmup}", chấp hành nghiêm túc hiệu lệnh của giáo viên.`,
      contentImgUrl: warmupImg.url,
      contentImgTitle: warmupImg.title,
      hsImgUrl: standardFormationDiagrams[0].svgDataUrl,
      hsImgTitle: 'Đội hình nhận lớp và khởi động 4 hàng ngang',
      hsImages: [
        {
          id: 'diag_1_nhan_lop',
          url: standardFormationDiagrams[0].svgDataUrl,
          title: 'Đội hình nhận lớp và khởi động (4 hàng ngang)'
        }
      ]
    },
    // HÀNG 2: HÌNH THÀNH KIẾN THỨC MỚI (Khớp 100% ảnh kỹ thuật và bước thực hiện)
    {
      content: `2. HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC MỚI\n2.1. Khám phá & Làm quen động tác:\n* Học ${mName}:\n${accurate.movementSteps}`,
      lvd: `6 - 8 phút\n2 - 3 lần`,
      gv: accurate.gvExplanation,
      hs: accurate.hsTask,
      contentImgUrl: accurate.imgUrl,
      contentImgTitle: accurate.imgTitle,
      hsImgUrl: standardFormationDiagrams[2].svgDataUrl,
      hsImgTitle: 'Đội hình quan sát tranh mẫu & GV làm mẫu',
      hsImages: [
        {
          id: 'diag_2_quan_sat',
          url: standardFormationDiagrams[2].svgDataUrl,
          title: 'Đội hình quan sát tranh mẫu & GV làm mẫu'
        }
      ]
    },
    // HÀNG 3: 3.1. TẬP ĐỒNG LOẠT CẢ LỚP (Ô RIÊNG)
    {
      content: `3. HOẠT ĐỘNG LUYỆN TẬP\n3.1. Tập đồng loạt cả lớp:\n- Toàn lớp thực hiện ${mName} theo nhịp hô của giáo viên (2 - 3 lần, mỗi lần 2x8 nhịp).\n- Cán sự lớp lên điều hành hô nhịp cho cả lớp cùng tập luyện.\n- Rèn luyện kỹ thuật động tác đều, dứt khoát, đúng tư thế và phối hợp ${accurate.practiceFocus}.`,
      lvd: `3 - 4 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- GV đứng ở vị trí trung tâm phía trước lớp, hô nhịp to, rõ ràng, dứt khoát để cả lớp cùng thực hiện động tác đồng loạt lần 1.\n- Quan sát bao quát toàn thể học sinh, chú ý điều chỉnh nhịp đếm phù hợp với nhịp hít thở và biên độ vận động của các em.\n- Mời cán sự lớp lên điều hành hô nhịp lần 2 và 3; GV di chuyển linh hoạt dọc các hàng ngang để quan sát góc độ tay, chân và tư thế thân người của từng học sinh.\n- Nhắc nhở các lỗi sai còn tồn tại ở nhiều em; yêu cầu cả lớp giữ cự ly thẳng hàng và chú trọng ${accurate.practiceFocus}.\n- Nhận xét nhanh và biểu dương tinh thần tập luyện nghiêm túc của toàn lớp.`,
      hs: `- Đội hình tập luyện đồng loạt: 4 hàng ngang so le, cự ly giãn cách 1 sải tay.\n- Toàn lớp tập trung cao độ, thực hiện động tác chuẩn xác, nhịp nhàng theo khẩu lệnh của GV và cán sự lớp.\n- Chú ý giữ đúng biên độ kỹ thuật và tư thế thân người, không nói chuyện riêng.\n- Chỉnh đốn tư thế theo nhắc nhở của thầy cô.`,
      hsImgUrl: standardFormationDiagrams[3].svgDataUrl,
      hsImgTitle: 'Đội hình tập luyện đồng loạt 4 hàng ngang giãn cách',
      hsImages: [
        {
          id: 'diag_3_dong_loat',
          url: standardFormationDiagrams[3].svgDataUrl,
          title: 'Đội hình tập đồng loạt (4 hàng ngang giãn cách)'
        }
      ]
    },
    // HÀNG 4: 3.2. TẬP THEO TỔ / NHÓM (Ô RIÊNG)
    {
      content: `3.2. Tập luyện theo tổ / nhóm:\n- Lớp chia làm 4 tổ di chuyển về 4 khu vực quy định trên sân bãi.\n- Tổ trưởng điều khiển tổ mình ôn luyện ${mName} (2 - 3 lần).\n- Các thành viên trong tổ tự giác quan sát, đếm nhịp và sửa sai cho nhau.\n- Giúp đỡ các bạn có thể lực yếu hoặc còn lúng túng.`,
      lvd: `4 - 5 phút\n2 - 3 lần\n(2x8 nhịp)`,
      gv: `- Phân chia rõ ràng 4 khu vực sân tập cho 4 tổ (đảm bảo khoảng cách an toàn, không vướng vật cản và đủ không gian thoáng mát).\n- Giao nhiệm vụ cụ thể cho từng tổ trưởng: hô nhịp dõng dạc, quan sát các thành viên và điều hành tổ tập luyện nghiêm túc, chú trọng rèn ${accurate.practiceFocus}.\n- GV đi lần lượt đến từng tổ, theo dõi tiến độ tập luyện; trực tiếp uốn nắn, cầm tay sửa góc độ cho những học sinh còn thực hiện chưa đúng.\n- Quan sát thể trạng của từng em, cho học sinh có biểu hiện mệt mỏi nghỉ ngơi tại chỗ.\n- Đánh giá khả năng tự quản, tinh thần hợp tác và đoàn kết của từng nhóm.`,
      hs: `- Đội hình tập luyện theo tổ: 4 tổ di chuyển trật tự về 4 góc sân quy định, xếp thành hàng ngang hoặc vòng tròn.\n- Học sinh chấp hành sự chỉ huy của tổ trưởng, luân phiên nhau hô nhịp để cùng luyện tập.\n- Chăm chú theo dõi tư thế của bạn bên cạnh, góp ý thân thiện giúp bạn sửa sai nhịp thở và biên độ tay.\n- Chủ động xin phép thầy cô nghỉ ngơi nếu thấy mệt trong người.`,
      hsImgUrl: standardFormationDiagrams[4].svgDataUrl,
      hsImgTitle: 'Đội hình tập theo tổ / nhóm (4 góc sân)',
      hsImages: [
        {
          id: 'diag_4_to_nhom',
          url: standardFormationDiagrams[4].svgDataUrl,
          title: 'Đội hình tập theo tổ / nhóm (4 góc sân bãi)'
        }
      ]
    },
    // HÀNG 5: 3.3. TẬP CẶP ĐÔI SỬA SAI (Ô RIÊNG)
    {
      content: `3.3. Tập luyện cặp đôi & cá nhân sửa sai:\n- Từng cặp hai bạn quay mặt đối diện nhau để tập luyện.\n- 1 bạn thực hiện ${mName} kết hợp tự đếm nhịp, 1 bạn quan sát nhận xét, sau đó đổi vai.\n- Tự giác hoàn thiện kỹ thuật cá nhân; khắc phục triệt để các lỗi sai đã được chỉ dẫn.`,
      lvd: `3 - 4 phút\n1 - 2 lần\nđổi vai`,
      gv: `- Phát khẩu lệnh cho học sinh quay mặt vào nhau tạo thành từng cặp đôi đối diện, giữ cự ly tối thiểu 1.5m.\n- Hướng dẫn phương pháp kiểm tra chéo: bạn đứng ngoài quan sát kỹ xem bạn mình đã thực hiện chuẩn ${accurate.practiceFocus} hay chưa; sau đó dùng lời nói nhẹ nhàng, tích cực để góp ý cho bạn.\n- GV đi kiểm tra từng cặp đôi, khích lệ sự tự tin và tinh thần tương trợ giữa các học sinh; thị phạm trực tiếp cho các cặp còn bỡ ngỡ.\n- Cho các em đổi vai để cả hai đều được luyện tập và sửa sai; tuyên dương những cặp đôi hợp tác tốt.`,
      hs: `- Đội hình cặp đôi: Đứng đối diện nhau theo từng đôi một cách nghiêm túc.\n- Bạn A thực hiện động tác 2 lần 8 nhịp, bạn B chăm chú quan sát và góp ý chân thành về tư thế, biên độ và nhịp thở; sau đó hai bạn đổi vai cho nhau.\n- Tiếp thu ý kiến đóng góp của bạn với thái độ cầu thị, tự điều chỉnh động tác cho thuần thục, đẹp mắt.\n- Báo cáo với giáo viên khi cả hai đã thực hiện tốt.`,
      hsImgUrl: standardFormationDiagrams[5].svgDataUrl,
      hsImgTitle: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai',
      hsImages: [
        {
          id: 'diag_5_cap_doi',
          url: standardFormationDiagrams[5].svgDataUrl,
          title: 'Đội hình cặp đôi đối diện quay mặt vào nhau sửa sai'
        }
      ]
    },
    // HÀNG 6: 3.4. THI ĐUA TRÌNH DIỄN & TRÒ CHƠI VẬN ĐỘNG (Ô RIÊNG - Gắn ảnh Trò chơi vận động chuẩn SGK)
    {
      content: `3.4. Thi đua trình diễn giữa các tổ & Trò chơi vận động:\n* Thi đua trình diễn động tác giữa các tổ:\n- Từng tổ lên thực hiện động tác trước lớp, các tổ khác quan sát, nhận xét và chấm điểm.\n* Trò chơi vận động: "${resolvedPractice}":\n- Mục đích: Phát triển tố chất nhanh nhẹn, khéo léo, sức mạnh và tinh thần đồng đội.\n- Dụng cụ: ${equipmentDesc}\n- Luật chơi: Xuất phát đúng hiệu lệnh, di chuyển thực hiện động tác theo luật quay về tiếp sức an toàn cho bạn tiếp theo; đội nào hoàn thành trước ít lỗi phạm quy nhất sẽ đạt giải Nhất.`,
      lvd: `5 - 7 phút\n2 - 3 lượt`,
      gv: `- Tổ chức thi đua biểu diễn: Gọi lần lượt từng tổ lên trước lớp trình diễn động tác; hướng dẫn các tổ ngồi xem quan sát, cổ vũ văn minh và tham gia nhận xét công tâm.\n- Phổ biến ngắn gọn tên trò chơi vận động "${resolvedPractice}", mục đích rèn luyện tố chất nhanh nhẹn, luật chơi và các lỗi phạm quy.\n- Cho 1 nhóm làm mẫu thao tác tham gia trò chơi; điều hành 4 đội thi đấu chính thức 2 - 3 lượt hào hứng, công bằng.\n- Đảm bảo an toàn tuyệt đối sân bãi; nhận xét tinh thần thi đấu, tuyên dương tổ chiến thắng và động viên các tổ còn lại.`,
      hs: `- Đội hình thi đua & trò chơi: Ngồi theo hàng ngang quan sát tổ bạn biểu diễn, vỗ tay cổ vũ nhiệt tình và nêu nhận xét khách quan.\n- Khi vào trò chơi "${resolvedPractice}": 4 hàng dọc đứng sau vạch xuất phát hướng về cọc tiêu.\n- Chấp hành nghiêm chỉnh luật chơi, phối hợp ăn ý, nhanh nhẹn vượt qua thử thách và tiếp sức an toàn cho bạn.\n- Thể hiện tinh thần trung thực, đoàn kết, chúc mừng đội bạn khi giành chiến thắng.`,
      contentImgUrl: practiceImg.url,
      contentImgTitle: practiceImg.title,
      hsImgUrl: standardFormationDiagrams[8].svgDataUrl,
      hsImgTitle: 'Sơ đồ trò chơi tiếp sức 4 làn cọc mốc 10m',
      hsImages: [
        {
          id: 'diag_6_tro_choi',
          url: standardFormationDiagrams[8].svgDataUrl,
          title: 'Sơ đồ trò chơi tiếp sức 4 làn cọc mốc 10m'
        }
      ]
    },
    // HÀNG 7: 4. VẬN DỤNG & HỒI TĨNH (Ô RIÊNG)
    {
      content: `4. HOẠT ĐỘNG VẬN DỤNG & HỒI TĨNH\n4.1. Hồi tĩnh:\n- Thả lỏng cơ toàn thân, rũ tay, rung đùi, lắc bắp chân và hít thở sâu theo nhịp chậm rãi.\n4.2. Vận dụng:\n- Nêu câu hỏi vận dụng bài tập vào thực tế: "Em nên tập bài thể dục này vào thời điểm nào trong ngày để nâng cao sức khỏe?"\n- Tích hợp bảo vệ môi trường: Kiểm tra vệ sinh sân tập, nhặt vật nguy hiểm, thu dọn dụng cụ đúng nơi quy định.\n4.3. Nhận xét & Dặn dò về nhà:\n- Đánh giá thái độ học tập; giao nhiệm vụ tự tập ở nhà.`,
      lvd: `3 - 5 phút\n1 - 2 lần`,
      gv: `- Điều hành toàn lớp thực hiện các động tác hồi tĩnh: cúi người rũ tay, rung thả lỏng cơ đùi, hít thở sâu để đưa cơ thể về trạng thái hồi phục ổn định sau vận động.\n- Đặt câu hỏi tương tác thực tế giúp học sinh khắc sâu kiến thức; liên hệ thói quen tập thể dục buổi sáng cùng gia đình để tăng cường sức đề kháng.\n- Giáo dục ý thức bảo vệ môi trường: nhắc nhở các em quan sát xung quanh sân tập, cùng nhau nhặt rác, cất gậy và cọc tiêu vào phòng dụng cụ gọn gàng, an toàn.\n- Nhận xét ưu điểm, tinh thần tích cực của tiết học; dặn dò các em tự giác ôn tập ở nhà và chuẩn bị trang phục cho tiết tiếp theo; phát lệnh xuống lớp.`,
      hs: `- Đội hình hồi tĩnh: Đứng giãn cách tự nhiên hoặc vòng tròn, hít thở sâu, thả lỏng toàn thân theo sự điều khiển của giáo viên.\n- Tích cực xung phong trả lời câu hỏi vận dụng kiến thức vào thực tế cuộc sống.\n- Tự giác cùng các bạn dọn dẹp vệ sinh sân bãi, xếp dụng cụ thể dục đúng nơi quy định sạch sẽ.\n- Lắng nghe dặn dò của thầy cô, chào giáo viên và xếp hàng trật tự đi về lớp học.`,
      hsImgUrl: standardFormationDiagrams[15].svgDataUrl,
      hsImgTitle: 'Đội hình hồi tĩnh và thả lỏng toàn thân',
      hsImages: [
        {
          id: 'diag_7_hoi_tinh',
          url: standardFormationDiagrams[15].svgDataUrl,
          title: 'Đội hình hồi tĩnh và thả lỏng toàn thân'
        }
      ]
    }
  ];
}

/**
 * Splits collapsed practice rows (3.1, 3.2, 3.3) into separate rows and expands Cột GV to 100-120 words.
 */
export function splitAndBalanceExistingRows(
  rows: LessonRow[],
  grade: number = 1,
  title: string = '',
  userImages: SgkImageItem[] = []
): LessonRow[] {
  // If already 7 rows, just return
  if (rows.length >= 7) {
    return rows;
  }

  // Generate the clean 7 balanced rows
  return createBalanced7LessonRows(grade, title, userImages);
}

/**
 * Automatically creates a new lesson plan based on the Master Template (Tuần 8 Nghĩa Hiệp),
 * generating 7 balanced rows with separated 3.1, 3.2, 3.3 and 100-120 words in Cột GV.
 */
export function generateNextWeekPlan(
  grade: number,
  week: number,
  lessonNum: number,
  topic: string,
  title: string,
  baseMasterPlan?: MasterPlanItem,
  userImages: SgkImageItem[] = []
): AutoMatchResult {
  const detectedMovements = extractMovementNamesFromTitle(title);
  const newRows = createBalanced7LessonRows(grade, title, userImages);

  const matchedImages = [
    { rowIdx: 1, col: 'content' as const, title: newRows[1]?.contentImgTitle || 'Ảnh kỹ thuật động tác' }
  ];

  const matchedFormations = newRows.map((r, idx) => ({
    rowIdx: idx,
    name: r.hsImgTitle || `Sơ đồ dòng ${idx + 1}`
  }));

  return {
    newRows,
    detectedMovements,
    matchedImages,
    matchedFormations
  };
}

/**
 * Scans the teacher's current image library and automatically attaches appropriate
 * technical movement pictures and accurate formation diagrams to all rows of any lesson plan.
 */
export function autoScanLibraryAndAttachToRows(
  rows: LessonRow[],
  userImages: SgkImageItem[],
  grade: number,
  lessonTitle: string
): { updatedRows: LessonRow[]; attachedCount: number; messages: string[] } {
  let attachedCount = 0;
  const messages: string[] = [];
  const updatedRows = rows.map((r) => ({ ...r }));

  // Filter images for this grade or general
  const gradeImages = userImages.filter((img) => String(img.grade) === String(grade) || !img.grade);

  // ROW 0: Hoạt động mở đầu (Nhận lớp, Khởi động)
  if (updatedRows[0]) {
    // Look for warmup image in user library
    const warmupUserImg = gradeImages.find(
      (img) =>
        img.folder === 'khoiDong' ||
        img.title.toLowerCase().includes('khởi động') ||
        img.title.toLowerCase().includes('xoay khớp')
    ) || userImages.find((img) => img.folder === 'khoiDong' || img.title.toLowerCase().includes('khởi động'));

    if (warmupUserImg && !updatedRows[0].contentImgUrl) {
      updatedRows[0].contentImgUrl = warmupUserImg.imgUrl;
      updatedRows[0].contentImgTitle = warmupUserImg.title;
      attachedCount++;
      messages.push(`H1 (Khởi động): Gắn ảnh thư viện "${warmupUserImg.title}"`);
    }

    // Formation diagram for row 0
    if (!updatedRows[0].hsImgUrl) {
      const warmupDiagram = standardFormationDiagrams.find((f) => f.id === 'f_khoi_dong') || standardFormationDiagrams[1];
      updatedRows[0].hsImgUrl = warmupDiagram.svgDataUrl;
      updatedRows[0].hsImgTitle = warmupDiagram.name;
      attachedCount++;
      messages.push(`H1 (Đội hình): Gắn "${warmupDiagram.name}"`);
    }
  }

  // ROW 1: Hình thành kiến thức mới (Động tác kỹ thuật)
  const targetRow1 = updatedRows[1] ? 1 : 0;
  if (updatedRows[targetRow1]) {
    const accurate = resolveAccurateMovement(updatedRows[targetRow1].content, lessonTitle, grade, userImages);
    updatedRows[targetRow1].contentImgUrl = accurate.imgUrl;
    updatedRows[targetRow1].contentImgTitle = accurate.imgTitle;
    attachedCount++;
    messages.push(`H2 (Kỹ thuật mới): Gắn chính xác "${accurate.imgTitle}" khớp với ${accurate.movementName}`);

    // Observation formation diagram
    if (!updatedRows[targetRow1].hsImgUrl) {
      const obsDiagram = standardFormationDiagrams.find((f) => f.id === 'f_tap_mau') || standardFormationDiagrams[2];
      updatedRows[targetRow1].hsImgUrl = obsDiagram.svgDataUrl;
      updatedRows[targetRow1].hsImgTitle = obsDiagram.name;
      attachedCount++;
      messages.push(`H2 (Đội hình): Gắn "${obsDiagram.name}"`);
    }
  }

  // ROW 2: Hoạt động Luyện tập (Tổ nhóm / Cặp đôi)
  const targetRow2 = updatedRows[2] ? 2 : targetRow1;
  if (updatedRows[targetRow2]) {
    const practiceUserImg = gradeImages.find(
      (img) =>
        img.folder === 'luyenTap' ||
        img.title.toLowerCase().includes('luyện tập') ||
        img.title.toLowerCase().includes('tổ')
    ) || userImages.find((img) => img.folder === 'luyenTap');

    if (practiceUserImg && !updatedRows[targetRow2].contentImgUrl) {
      updatedRows[targetRow2].contentImgUrl = practiceUserImg.imgUrl;
      updatedRows[targetRow2].contentImgTitle = practiceUserImg.title;
      attachedCount++;
      messages.push(`H3 (Luyện tập): Gắn ảnh thư viện "${practiceUserImg.title}"`);
    }

    // Team formation diagram
    if (!updatedRows[targetRow2].hsImgUrl) {
      const teamDiagram = standardFormationDiagrams.find((f) => f.id === 'f_to_nhom') || standardFormationDiagrams[4];
      updatedRows[targetRow2].hsImgUrl = teamDiagram.svgDataUrl;
      updatedRows[targetRow2].hsImgTitle = teamDiagram.name;
      attachedCount++;
      messages.push(`H3 (Đội hình): Gắn "${teamDiagram.name}"`);
    }
  }

  // ROW 3: Trò chơi vận động
  const targetRow3 = updatedRows[3] ? 3 : 2;
  if (updatedRows[targetRow3]) {
    const rowText = (updatedRows[targetRow3].content || '').toLowerCase();

    // Check user library for game images
    const gameUserImg = gradeImages.find(
      (img) =>
        img.folder === 'troChoi' ||
        img.title.toLowerCase().includes('trò chơi') ||
        (rowText.includes('tam giác') && img.title.toLowerCase().includes('tam giác')) ||
        (rowText.includes('tiếp sức') && img.title.toLowerCase().includes('tiếp sức')) ||
        (rowText.includes('kéo co') && img.title.toLowerCase().includes('kéo co')) ||
        (rowText.includes('cướp cờ') && img.title.toLowerCase().includes('cướp cờ'))
    ) || userImages.find((img) => img.folder === 'troChoi');

    if (gameUserImg && !updatedRows[targetRow3].contentImgUrl) {
      updatedRows[targetRow3].contentImgUrl = gameUserImg.imgUrl;
      updatedRows[targetRow3].contentImgTitle = gameUserImg.title;
      attachedCount++;
      messages.push(`H4 (Trò chơi): Gắn ảnh thư viện "${gameUserImg.title}"`);
    }

    // Sơ đồ trò chơi: TỰ ĐỘNG KHỚP NỘI DUNG CHÍNH XÁC (Tránh lỗi tam giác ra vòng tròn!)
    const matchedDiagram = getFormationDiagramByKeyword(updatedRows[targetRow3].content, 'tro_choi');
    updatedRows[targetRow3].hsImgUrl = matchedDiagram.svgDataUrl;
    updatedRows[targetRow3].hsImgTitle = matchedDiagram.name;
    attachedCount++;
    messages.push(`H4 (Sơ đồ trò chơi): Tự động khớp chính xác "${matchedDiagram.name}"`);
  }

  // ROW 4: Hồi tĩnh & Vận dụng
  const targetRow4 = updatedRows[4] ? 4 : updatedRows.length - 1;
  if (updatedRows[targetRow4]) {
    const vanDungImg = gradeImages.find(
      (img) =>
        img.folder === 'vanDung' ||
        img.title.toLowerCase().includes('vận dụng') ||
        img.title.toLowerCase().includes('thả lỏng')
    ) || userImages.find((img) => img.folder === 'vanDung');

    if (vanDungImg && !updatedRows[targetRow4].contentImgUrl) {
      updatedRows[targetRow4].contentImgUrl = vanDungImg.imgUrl;
      updatedRows[targetRow4].contentImgTitle = vanDungImg.title;
      attachedCount++;
      messages.push(`H5 (Vận dụng): Gắn ảnh thư viện "${vanDungImg.title}"`);
    }

    if (!updatedRows[targetRow4].hsImgUrl) {
      const cooldownDiagram = standardFormationDiagrams.find((f) => f.id === 'f_hoi_tinh') || standardFormationDiagrams[15];
      updatedRows[targetRow4].hsImgUrl = cooldownDiagram.svgDataUrl;
      updatedRows[targetRow4].hsImgTitle = cooldownDiagram.name;
      attachedCount++;
      messages.push(`H5 (Đội hình): Gắn "${cooldownDiagram.name}"`);
    }
  }

  return {
    updatedRows,
    attachedCount,
    messages
  };
}
