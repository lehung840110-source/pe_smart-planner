import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  Check,
  RotateCcw,
  Copy,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Key,
  CheckCircle2,
  SlidersHorizontal,
  Replace,
  Wand2,
  AlertTriangle,
  Users,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SgkImageItem, SubFolderType, ImageCategory } from '../types/gdtc';
import { generateSgk2dSequenceSvg, generateFormationSvg, MovementBeats } from '../utils/sgkVectorGenerator';
import { enhanceSgkImage } from '../utils/imageEnhancer';

interface ImageToImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: SgkImageItem | null;
  onSaveGeneratedImage: (newImg: SgkImageItem) => void;
  onReplaceImage?: (oldId: string, updatedImg: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

export const ImageToImageModal: React.FC<ImageToImageModalProps> = ({
  isOpen,
  onClose,
  sourceImage,
  onSaveGeneratedImage,
  onReplaceImage,
  showToast,
}) => {
  // Modal Type: Movement sequence (phân thế từng nhịp) vs Formation Diagram (sơ đồ đội hình tập luyện)
  const [generationType, setGenerationType] = useState<'movement' | 'formation'>('movement');

  const [activeTab, setActiveTab] = useState<'restore' | 'local_2d' | 'chatgpt' | 'api'>('restore');
  const [movementName, setMovementName] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('1');
  const [targetFolder, setTargetFolder] = useState<SubFolderType>('kyThuat');

  // Movement beats breakdown
  const [ttcb, setTtcb] = useState<string>('Đứng nghiêm, thân thẳng, hai tay buông tự nhiên');
  const [nhip1, setNhip1] = useState<string>('Hai tay dang ngang bàn tay sấp, kiễng gót chân');
  const [nhip2, setNhip2] = useState<string>('Khuỵu gối chụm vào nhau, hai tay chống hông');
  const [nhip3, setNhip3] = useState<string>('Như nhịp 1 (đứng thẳng lên, kiễng gót, hai tay dang ngang sấp)');
  const [nhip4, setNhip4] = useState<string>('Về lại Tư thế chuẩn bị (TTCB)');
  const [nhip58, setNhip58] = useState<string>('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân / đổi bên');

  // Formation settings
  const [formationTeacher, setFormationTeacher] = useState<string>('Đứng phía trước cách hàng 1 khoảng 3 - 4m quan sát và chỉ huy');
  const [formationSpacing, setFormationSpacing] = useState<string>('Cự ly 1 sải tay, 4 hàng ngang đứng so le nhau');

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [isCallingApi, setIsCallingApi] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // API Keys stored in localStorage
  const [openAiApiKey, setOpenAiApiKey] = useState<string>(() => localStorage.getItem('gdtc_openai_key') || '');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('gdtc_gemini_key') || '');
  const [selectedApiProvider, setSelectedApiProvider] = useState<'openai' | 'gemini'>('openai');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto detect if image is a formation diagram or movement sequence
  const isFormationTitle = (title: string, folder?: string) => {
    const t = (title || '').toLowerCase();
    return (
      t.includes('hàng ngang') ||
      t.includes('hàng dọc') ||
      t.includes('đội hình') ||
      t.includes('sơ đồ') ||
      t.includes('so le') ||
      t.includes('giãn cách') ||
      t.includes('vòng tròn') ||
      t.includes('luyện tập') ||
      t.includes('tiếp sức') ||
      t.includes('trò chơi') ||
      folder === 'luyenTap' ||
      folder === 'troChoi'
    );
  };

  // Initialize data when sourceImage changes
  useEffect(() => {
    if (sourceImage) {
      const clean = sourceImage.title
        .replace(/\s*-\s*SGK.*$/i, '')
        .replace(/Hình\s+\d+(\.\d+)?:?\s*/i, '')
        .trim();

      setMovementName(clean);
      setTargetGrade(sourceImage.grade || '1');
      setTargetFolder(sourceImage.folder || 'kyThuat');
      setGeneratedImageUrl(null);
      setGenerationSource('');

      // Auto detect mode
      if (isFormationTitle(clean, sourceImage.folder)) {
        setGenerationType('formation');
      } else {
        setGenerationType('movement');
      }

      // Auto deduce technical sequence hints strictly matching Vietnamese GDTC SGK
      const mLower = clean.toLowerCase();
      if (mLower.includes('tay') && !mLower.includes('cổ tay')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Chân trái bước sang ngang rộng bằng vai, hai tay đưa ra trước vỗ vào nhau');
        setNhip2('Hai tay dang ngang, lòng bàn tay ngửa');
        setNhip3('Hai tay đưa ra trước vỗ vào nhau (như nhịp 1)');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải');
      } else if (mLower.includes('vươn thở')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Chân trái bước lên trước, hai tay vươn chếch chữ V lên cao ngửa đầu hít sâu');
        setNhip2('Thu chân về, hai tay hạ chéo trước bụng cúi đầu thở ra');
        setNhip3('Như nhịp 1 nhưng bước chân phải lên trước');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Thực hiện tương tự nhịp 1, 2, 3, 4');
      } else if (mLower.includes('chân') && !mLower.includes('cổ chân')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Nhón gót hai chân, hai tay chống hông');
        setNhip2('Khuỵu sâu hai gối, lưng thẳng, hai tay đưa trước song song lòng bàn tay sấp');
        setNhip3('Đứng thẳng lên nhón gót, hai tay dang ngang lòng bàn tay ngửa');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Thực hiện tương tự nhịp 1, 2, 3, 4');
      } else if (mLower.includes('lườn')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Chân trái bước sang ngang rộng bằng vai, hai tay chống hông');
        setNhip2('Nghiêng lườn sâu sang trái, tay phải vươn cao ép sát tai, tay trái chống hông');
        setNhip3('Đứng thẳng người lên, hai tay dang ngang lòng bàn tay ngửa');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi nghiêng lườn sang phải');
      } else if (mLower.includes('bụng') || mLower.includes('gập thân')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Chân trái bước sang ngang rộng hơn vai, hai tay vươn cao song song lòng bàn tay hướng vào nhau');
        setNhip2('Cúi gập thân sâu ra trước, hai tay chạm mu bàn chân');
        setNhip3('Đứng thẳng thân người lên, hai tay dang ngang bàn tay ngửa');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải');
      } else if (mLower.includes('nhảy')) {
        setTtcb('Đứng nghiêm, thân thẳng');
        setNhip1('Bật nhảy tách hai chân sang hai bên, hai tay vươn cao vỗ trên đầu');
        setNhip2('Bật nhảy khép chân về, hạ hai tay xuôi theo thân');
        setNhip3('Bật nhảy tách hai chân sang hai bên, hai tay vươn cao vỗ trên đầu');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Thực hiện tương tự nhịp 1, 2, 3, 4');
      } else {
        setTtcb('Đứng nghiêm, thân thẳng, hai tay buông tự nhiên');
        setNhip1('Hai tay dang ngang bàn tay sấp, kiễng gót chân');
        setNhip2('Khuỵu gối chụm vào nhau, hai tay chống hông');
        setNhip3('Như nhịp 1 (đứng thẳng lên, kiễng gót, hai tay dang ngang sấp)');
        setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
        setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân / đổi bên');
      }
    }
  }, [sourceImage, isOpen]);

  // Handle global paste (Ctrl + V) when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
              if (loadEvt.target?.result) {
                setGeneratedImageUrl(loadEvt.target.result as string);
                setGenerationSource('clipboard_paste');
                showToast('📋 Đã dán ảnh kết quả từ Clipboard (Ctrl + V)!');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, showToast]);

  if (!isOpen || !sourceImage) return null;

  // Build the specialized ChatGPT / Gemini prompt tailored for EITHER Movement Sequence OR Formation Layout
  const hasStick = movementName.toLowerCase().includes('gậy') || String(targetGrade) === '5';

  const movementChatGptPrompt = `Hãy vẽ lại tranh kỹ thuật phân thế sách giáo khoa môn Giáo dục Thể chất tiểu học Việt Nam (Bộ Kết Nối Tri Thức).
Tên động tác: "${movementName}" - Khối Lớp ${targetGrade}.
Nhân vật: Học sinh tiểu học Việt Nam, mặc đồng phục thể thao chuẩn: áo thun trắng có cổ viền xanh dương, quần thể thao dài màu xanh dương có sọc trắng bên hông, mang giày thể thao.
Phong cách: Nét vẽ minh họa 2D vector phẳng (flat cel-shading), màu sắc trong sáng, nền trắng sạch tinh (#ffffff) phục vụ in ấn. TUYỆT ĐỐI KHÔNG TẠO HÌNH 3D ĐẤT NẶN HAY BÚP BÊ NHỰA.

YÊU CẦU BẮT BUỘC KHỚP KỸ THUẬT ĐỘNG TÁC TỪNG NHỊP CỦA SGK:
Bố cục nằm ngang tuần tự gồm 5 hình học sinh từ trái sang phải:
- Hình 1: TTCB (${ttcb}${hasStick ? ', hai tay cầm gậy ngang đùi' : ''})
- Hình 2: Nhịp 1 (${nhip1})
- Hình 3: Nhịp 2 (${nhip2})
- Hình 4: Nhịp 3 (${nhip3})
- Hình 5: Nhịp 4 (${nhip4})
Kèm dòng tiêu đề: "1. ${movementName}" và dòng chú thích phía dưới: "${nhip58}".
CHÚ Ý BẮT BUỘC: ĐÚNG TƯ THẾ BÀN TAY VÀ TAY CHÂN THEO ĐẶC TẢ TRÊN, KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI DANG TAY HAY GIƠ TAY LÊN ĐẦU NẾU KHÔNG CÓ TRONG MÔ TẢ.`;

  const formationChatGptPrompt = `Hãy vẽ sơ đồ bố trí đội hình tập luyện thể dục tiểu học Việt Nam (Bộ Kết Nối Tri Thức Với Cuộc Sống).
Tên sơ đồ: "${movementName}" - Khối Lớp ${targetGrade}.
Bố cục sơ đồ chiến thuật thể dục 2D phẳng nhìn từ trên xuống hoặc phối cảnh thẳng:
1. Phía trên: Vị trí Giáo viên (khung chữ nhật màu đỏ có biểu tượng ghi "GV HƯỚNG DẪN", cách hàng 1 khoảng 3 - 4m).
2. Phía dưới: 4 hàng ngang học sinh đứng so le nhau, mỗi hàng 5-6 học sinh (vẽ biểu tượng thể thao rõ ràng, học sinh mặc đồng phục áo trắng viền xanh, quần xanh có sọc trắng).
3. Thước đo cự ly giãn cách: Ký hiệu mũi tên hai chiều "↔ 1 sải tay ↔" giữa các học sinh trong hàng.
4. Mũi tên hướng nhìn: Mũi tên xanh chỉ từ học sinh hướng thẳng lên Giáo viên phía trước.
5. Bên trái sơ đồ: Ghi rõ các nhãn "Hàng 1 ▶", "Hàng 2 ▶", "Hàng 3 ▶", "Hàng 4 ▶".
6. Phía dưới có thanh ghi chú sư phạm: "Đội hình 4 hàng ngang đứng so le cự ly 1 sải tay, đồng loạt thực hiện bài thể dục theo nhịp hô".
Phong cách: Bản vẽ sơ đồ sư phạm 2D phẳng, đường nét mạch lạc, nền trắng tinh khiết (#ffffff) phục vụ in giáo án. TUYỆT ĐỐI KHÔNG TẠO ĐỘNG TÁC CÁ NHÂN VÌ ĐÂY LÀ SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN.`;

  const activeChatGptPrompt = generationType === 'formation' ? formationChatGptPrompt : movementChatGptPrompt;

  // 1. Phục Chế & Làm Nét Ảnh SGK Gốc (Khuyên dùng nhất)
  const handleRestoreAndSharpen = async () => {
    setIsRestoring(true);
    showToast('✨ Đang phục chế và làm sắc nét ảnh gốc SGK (khử mờ, nền trắng tinh, tăng độ phân giải 2x)...');

    try {
      const restored = await enhanceSgkImage(sourceImage.imgUrl, {
        sharpenAmount: 1.4,
        contrastBoost: 1.25,
        cleanBackground: true
      });
      setGeneratedImageUrl(restored);
      setGenerationSource('restored_sgk_hd');
      showToast('✅ Đã phục chế thành công! Ảnh giữ nguyên 100% kỹ thuật chuẩn của Bộ GD&ĐT.');
    } catch (err: any) {
      showToast('Lỗi phục chế ảnh: ' + err?.message);
    } finally {
      setIsRestoring(false);
    }
  };

  // 2. Generate Internal 2D Vector SGK Diagram / Sequence
  const handleGenerateLocal2d = () => {
    try {
      if (generationType === 'formation') {
        const rawSvg = generateFormationSvg(movementName, targetGrade);
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
        setGeneratedImageUrl(dataUrl);
        setGenerationSource('local_formation_svg');
        showToast('⚡ Đã sinh thành công Sơ đồ Đội hình 4 hàng ngang giãn cách chuẩn SGK!');
      } else {
        const customBeats: MovementBeats = {
          ttcb,
          nhip1,
          nhip2,
          nhip3,
          nhip4,
          nhip58
        };
        const rawSvg = generateSgk2dSequenceSvg(movementName, targetGrade, 'single', 'male', customBeats);
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
        setGeneratedImageUrl(dataUrl);
        setGenerationSource('local_2d_svg');
        showToast('⚡ Đã sinh thành công Tranh Phân Thế 2D chuẩn kỹ thuật từng nhịp!');
      }
    } catch (err: any) {
      showToast('Lỗi sinh tranh: ' + err?.message);
    }
  };

  // Preset quick fill for Movement beats
  const applyMovementPreset = (presetKey: string) => {
    if (presetKey === 'hung_special') {
      setTtcb('Đứng nghiêm, thân thẳng, hai tay buông tự nhiên');
      setNhip1('Hai tay dang ngang bàn tay sấp, kiễng gót chân');
      setNhip2('Khuỵu gối chụm vào nhau, hai tay chống hông');
      setNhip3('Như nhịp 1 (đứng thẳng lên, kiễng gót, hai tay dang ngang sấp)');
      setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
      setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng đổi chân / đổi bên');
      showToast('⭐ Đã áp dụng mẫu cử động: Kiễng gót dang sấp ➔ Khuỵu gối chống hông');
    } else if (presetKey === 'sgk_tay') {
      setTtcb('Đứng nghiêm, thân thẳng');
      setNhip1('Chân trái bước sang ngang rộng bằng vai, hai tay đưa ra trước vỗ vào nhau');
      setNhip2('Hai tay dang ngang, lòng bàn tay ngửa');
      setNhip3('Hai tay đưa ra trước vỗ vào nhau (như nhịp 1)');
      setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
      setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải');
      showToast('Đã áp dụng mẫu Động tác Tay SGK Lớp 1');
    } else if (presetKey === 'sgk_vuon_tho') {
      setTtcb('Đứng nghiêm, thân thẳng');
      setNhip1('Chân trái bước lên trước, hai tay vươn chếch chữ V lên cao ngửa đầu hít sâu');
      setNhip2('Thu chân về, hai tay hạ chéo trước bụng cúi đầu thở ra');
      setNhip3('Như nhịp 1 nhưng bước chân phải lên trước');
      setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
      setNhip58('Nhịp 5, 6, 7, 8: Thực hiện tương tự nhịp 1, 2, 3, 4');
      showToast('Đã áp dụng mẫu Động tác Vươn thở SGK');
    } else if (presetKey === 'sgk_chan') {
      setTtcb('Đứng nghiêm, thân thẳng');
      setNhip1('Nhón gót hai chân, hai tay chống hông');
      setNhip2('Khuỵu sâu hai gối, lưng thẳng, hai tay đưa trước song song lòng bàn tay sấp');
      setNhip3('Đứng thẳng lên nhón gót, hai tay dang ngang lòng bàn tay ngửa');
      setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
      setNhip58('Nhịp 5, 6, 7, 8: Thực hiện tương tự nhịp 1, 2, 3, 4');
      showToast('Đã áp dụng mẫu Động tác Chân SGK');
    } else if (presetKey === 'sgk_bung') {
      setTtcb('Đứng nghiêm, thân thẳng');
      setNhip1('Chân trái bước sang ngang rộng hơn vai, hai tay vươn cao song song lòng bàn tay hướng vào nhau');
      setNhip2('Cúi gập thân sâu ra trước, hai tay chạm mu bàn chân');
      setNhip3('Đứng thẳng thân người lên, hai tay dang ngang bàn tay ngửa');
      setNhip4('Về lại Tư thế chuẩn bị (TTCB)');
      setNhip58('Nhịp 5, 6, 7, 8: Như nhịp 1, 2, 3, 4 nhưng ở nhịp 5 bước chân phải');
      showToast('Đã áp dụng mẫu Động tác Bụng SGK');
    }
  };

  // Copy ChatGPT Prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeChatGptPrompt);
    setIsCopied(true);
    showToast('📋 Đã sao chép Prompt chuẩn cho ChatGPT vào Clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handle direct file upload from computer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setGeneratedImageUrl(loadEvt.target.result as string);
          setGenerationSource('file_upload');
          showToast('📥 Đã tải ảnh lên xem trước thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setGeneratedImageUrl(loadEvt.target.result as string);
          setGenerationSource('drag_drop');
          showToast('📥 Đã tải ảnh thả vào thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Call API (OpenAI DALL-E or Gemini)
  const handleCallApi = async () => {
    const key = selectedApiProvider === 'openai' ? openAiApiKey : geminiApiKey;
    if (!key.trim()) {
      showToast(`Vui lòng nhập API Key cho ${selectedApiProvider === 'openai' ? 'OpenAI (DALL-E 3)' : 'Google Gemini'}!`);
      return;
    }

    if (selectedApiProvider === 'openai') {
      localStorage.setItem('gdtc_openai_key', openAiApiKey);
    } else {
      localStorage.setItem('gdtc_gemini_key', geminiApiKey);
    }

    setIsCallingApi(true);
    showToast(`Đang kết nối API ${selectedApiProvider === 'openai' ? 'OpenAI DALL-E 3' : 'Gemini'} để tạo tranh...`);

    try {
      const descPayload = generationType === 'formation'
        ? `Sơ đồ đội hình: ${movementName}. GV hướng dẫn phía trước, 4 hàng ngang học sinh đứng so le cự ly 1 sải tay.`
        : `TTCB: ${ttcb}. Nhịp 1: ${nhip1}. Nhịp 2: ${nhip2}. Nhịp 3: ${nhip3}. Nhịp 4: ${nhip4}. ${nhip58}`;

      const res = await fetch('/api/ai/generate-3d-cartoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName,
          grade: targetGrade,
          description: descPayload,
          sourceImageBase64: sourceImage.imgUrl,
          style: 'sgk_vector',
          provider: selectedApiProvider,
          openAiApiKey: selectedApiProvider === 'openai' ? openAiApiKey : undefined,
          geminiApiKey: selectedApiProvider === 'gemini' ? geminiApiKey : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGenerationSource(data.source || 'api');
        showToast('✨ Đã nhận kết quả ảnh sinh từ API!');
      } else {
        throw new Error(data.error || 'API không thể tạo ảnh');
      }
    } catch (err: any) {
      showToast('Lỗi gọi API tạo ảnh: ' + err?.message);
    } finally {
      setIsCallingApi(false);
    }
  };

  // Save: Overwrite / Replace current image
  const handleSaveAndReplace = () => {
    if (!generatedImageUrl) return;

    let cat: ImageCategory = 'dong_tac';
    if (generationType === 'formation' || targetFolder === 'luyenTap') cat = 'tap_luyen';
    else if (targetFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
    else if (targetFolder === 'vanDung') cat = 'van_dung';
    else if (targetFolder === 'troChoi') cat = 'tro_choi';
    else if (targetFolder === 'khoiDong') cat = 'khoi_dong';

    const updatedItem: SgkImageItem = {
      ...sourceImage,
      title: movementName,
      grade: targetGrade,
      folder: targetFolder,
      category: cat,
      imgUrl: generatedImageUrl,
      caption: generationType === 'formation'
        ? `Sơ đồ đội hình tập luyện chuẩn SGK GDTC Khối ${targetGrade}. 4 hàng ngang so le cự ly 1 sải tay.`
        : `Tranh phân thế kỹ thuật chuẩn SGK GDTC Khối ${targetGrade}. Đúng đồng phục áo trắng viền xanh, quần xanh sọc trắng.`,
      updatedAt: Date.now()
    };

    if (onReplaceImage) {
      onReplaceImage(sourceImage.id, updatedItem);
    } else {
      onSaveGeneratedImage(updatedItem);
    }

    showToast(`💾 Đã thay thế đè thành công hình ảnh cho "${movementName}"!`);
    onClose();
  };

  // Save: Add as new image to Library
  const handleSaveAsNew = () => {
    if (!generatedImageUrl) return;

    let cat: ImageCategory = 'dong_tac';
    if (generationType === 'formation' || targetFolder === 'luyenTap') cat = 'tap_luyen';
    else if (targetFolder === 'troChoiKhoiDong') cat = 'tro_choi_khoi_dong';
    else if (targetFolder === 'vanDung') cat = 'van_dung';
    else if (targetFolder === 'troChoi') cat = 'tro_choi';
    else if (targetFolder === 'khoiDong') cat = 'khoi_dong';

    const newItem: SgkImageItem = {
      id: `img_ai_sgk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${movementName} (${generationType === 'formation' ? 'Sơ Đồ Đội Hình' : 'Chuẩn SGK 2D'})`,
      grade: targetGrade,
      topicId: sourceImage.topicId,
      topicTitle: sourceImage.topicTitle,
      lessonId: sourceImage.lessonId,
      lessonTitle: sourceImage.lessonTitle,
      folder: targetFolder,
      page: sourceImage.page || 1,
      category: cat,
      imgUrl: generatedImageUrl,
      caption: generationType === 'formation'
        ? `Sơ đồ đội hình tập luyện 4 hàng ngang giãn cách Khối ${targetGrade}. Phục vụ in ấn rõ nét.`
        : `Tranh phân thế kỹ thuật chuẩn SGK GDTC Khối ${targetGrade}. Tư thế chuẩn xác, nền sạch, phục vụ in ấn.`,
      selected: false,
      createdAt: Date.now()
    };

    onSaveGeneratedImage(newItem);
    showToast(`➕ Đã thêm tranh mới "${newItem.title}" vào thư viện!`);
    onClose();
  };

  // Download reference image to send to ChatGPT
  const handleDownloadReference = () => {
    const a = document.createElement('a');
    a.href = sourceImage.imgUrl;
    a.download = `Anh_mau_tham_chieu_${movementName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 Đã tải ảnh mẫu gốc xuống để gửi kèm vào ChatGPT!');
  };

  // Download generated PNG/SVG
  const handleDownloadResultPng = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `Tranh_SGK_${movementName.replace(/\s+/g, '_')}_K${targetGrade}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 Đã tải tranh kỹ thuật SGK về máy!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Tái Tạo & Chuẩn Hóa Ảnh Động Tác SGK</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Chuẩn GDPT 2018
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Bảo toàn 100% kỹ thuật SGK Bộ GD&ĐT · Khử mờ ảnh scan · Vẽ lại tranh 2D phân thế từng nhịp & Sơ đồ đội hình tập luyện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50 text-xs">

          {/* MODE SELECTOR: Movement beats sequence vs Formation Diagram */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                PHÂN LOẠI NỘI DUNG HÌNH ẢNH:
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                Chọn đúng loại hình để hệ thống sinh chính xác tranh phân thế hoặc sơ đồ đội hình:
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setGenerationType('movement')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  generationType === 'movement'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>🤸 Động Tác Kỹ Thuật (Từng nhịp)</span>
              </button>

              <button
                type="button"
                onClick={() => setGenerationType('formation')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  generationType === 'formation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>📐 Sơ Đồ Đội Hình (Hàng ngang / Tập luyện)</span>
              </button>
            </div>
          </div>
          
          {/* Top Comparison Area: Original vs Generated Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Original Reference Image */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                    1. Ảnh SGK Gốc (Chuẩn Bản Quyền Bộ GD&ĐT)
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1 mt-0.5">
                    {sourceImage.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDownloadReference}
                    className="px-2 py-1 text-[10.5px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition flex items-center gap-1"
                    title="Tải ảnh gốc về máy"
                  >
                    <Download className="w-3 h-3" /> Tải
                  </button>
                  <button
                    disabled={isRestoring}
                    onClick={handleRestoreAndSharpen}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition shadow-2xs flex items-center gap-1 disabled:opacity-50"
                    title="Tự động khử mờ, khử vỡ hạt, làm trắng nền và tăng nét 2X trực tiếp trên ảnh gốc này"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Phục Chế Làm Nét
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 rounded-lg p-2 h-52 flex items-center justify-center overflow-hidden border border-slate-200">
                <img
                  src={sourceImage.imgUrl}
                  alt={sourceImage.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-2 bg-slate-100 rounded-lg text-[10.5px] text-slate-600 flex items-center justify-between">
                <span>Khối {sourceImage.grade} · Trang {sourceImage.page || 'SGK'}</span>
                <span className="text-emerald-700 font-semibold">Tư thế chuẩn mực 100%</span>
              </div>
            </div>

            {/* Right: Generated Result Preview */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider block">
                    2. Kết Quả Ảnh Mới Đã Xử Lý / Tái Tạo
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {generatedImageUrl
                      ? generationSource === 'restored_sgk_hd'
                        ? 'Ảnh SGK gốc đã được phục chế nét cao · Nền trắng tinh'
                        : generationSource === 'local_formation_svg'
                        ? 'Sơ đồ 4 hàng ngang giãn cách so le cự ly 1 sải tay'
                        : generationSource === 'local_2d_svg'
                        ? 'Tranh 2D vector phân thế 5 nhịp chuẩn SGK'
                        : 'Ảnh mới sẵn sàng sử dụng'
                      : 'Chưa chọn kết quả xử lý'}
                  </p>
                </div>
                {generatedImageUrl && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã sẵn sàng
                  </span>
                )}
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50 rounded-lg p-2 h-52 flex items-center justify-center overflow-hidden border-2 transition relative ${
                  isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-dashed border-slate-300'
                }`}
              >
                {isRestoring || isCallingApi ? (
                  <div className="text-center space-y-2">
                    <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="font-bold text-slate-800 text-xs">
                      {isRestoring ? 'Đang phục chế làm nét và tách nền trắng ảnh SGK...' : 'Đang xử lý hình ảnh chuẩn mực...'}
                    </p>
                    <p className="text-[10px] text-slate-500">Khử mờ hạt và bảo toàn tư thế</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Kết quả tranh mới tạo"
                    className="max-h-full max-w-full object-contain animate-in fade-in"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2 max-w-xs px-2">
                    <ImageIcon className="w-8 h-8 mx-auto stroke-1 text-slate-400" />
                    <p className="font-bold text-slate-700 text-xs">
                      Bấm phím <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-bold">Ctrl + V</kbd> để dán ảnh
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Hoặc bấm nút <strong>"Phục Chế Làm Nét"</strong> ở ô bên trái để nâng cấp ảnh gốc ngay lập tức!
                    </p>
                  </div>
                )}
              </div>

              {generatedImageUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveAndReplace}
                    className="flex-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    title="Cập nhật đè lên ảnh gốc này trong thư viện và tất cả kế hoạch bài dạy"
                  >
                    <Replace className="w-3.5 h-3.5" /> 💾 Thay Thế Đè Ảnh Cũ
                  </button>
                  <button
                    onClick={handleSaveAsNew}
                    className="flex-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    title="Lưu thành một hình ảnh độc lập mới vào thư viện"
                  >
                    <Check className="w-3.5 h-3.5" /> ➕ Thêm Ảnh Mới
                  </button>
                  <button
                    onClick={handleDownloadResultPng}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
                    title="Tải PNG về máy tính"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition border border-slate-300"
                  >
                    <Upload className="w-3.5 h-3.5" /> Chọn tệp ảnh từ máy tính để nạp
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-2xs">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {generationType === 'formation' ? 'Tiêu Đề Sơ Đồ Đội Hình:' : 'Tên Động Tác Trọng Tâm:'}
              </label>
              <input
                type="text"
                value={movementName}
                onChange={(e) => setMovementName(e.target.value)}
                placeholder={generationType === 'formation' ? 'VD: Tập đồng loạt 4 hàng ngang giãn cách...' : 'VD: Động tác tay, Động tác chân...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Khối Lớp:
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">Khối Lớp 1</option>
                <option value="3">Khối Lớp 3</option>
                <option value="5">Khối Lớp 5</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Lưu Thư Mục:
              </label>
              <select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value as SubFolderType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="kyThuat">🏃 Kỹ thuật động tác mới</option>
                <option value="luyenTap">👥 Luyện tập (Cá nhân/Nhóm)</option>
                <option value="troChoi">🎮 Trò chơi vận động</option>
                <option value="khoiDong">⚡ Khởi động</option>
                <option value="vanDung">🎯 Vận dụng & Hồi tĩnh</option>
              </select>
            </div>
          </div>

          {/* DETAILED BEATS / FORMATION SPECS INPUT AREA */}
          {generationType === 'movement' ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider block">
                    ĐẶC TẢ CHI TIẾT TỪNG NHỊP KỸ THUẬT (CHUẨN SGK GDTC):
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Nhập đúng cử động tay chân từng nhịp để hệ thống vẽ chính xác cử động, không lo AI vẽ sai lệch:
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500">Mẫu nhanh:</span>
                  <button
                    type="button"
                    onClick={() => applyMovementPreset('hung_special')}
                    className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[10.5px] font-bold transition border border-amber-300"
                    title="Kiễng gót dang sấp ➔ Khuỵu gối chống hông"
                  >
                    ⭐ Mẫu Thầy Hưng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMovementPreset('sgk_tay')}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-[10.5px] font-medium transition border border-blue-200"
                  >
                    Động tác Tay
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMovementPreset('sgk_vuon_tho')}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-[10.5px] font-medium transition border border-blue-200"
                  >
                    Vươn thở
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMovementPreset('sgk_chan')}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-[10.5px] font-medium transition border border-blue-200"
                  >
                    Động tác Chân
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMovementPreset('sgk_bung')}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-md text-[10.5px] font-medium transition border border-blue-200"
                  >
                    Động tác Bụng
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    1. Tư thế chuẩn bị (TTCB):
                  </label>
                  <input
                    type="text"
                    value={ttcb}
                    onChange={(e) => setTtcb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-blue-700 block mb-1">
                    2. Nhịp 1 (Bắt đầu):
                  </label>
                  <input
                    type="text"
                    value={nhip1}
                    onChange={(e) => setNhip1(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-blue-700 block mb-1">
                    3. Nhịp 2 (Cao trào kỹ thuật):
                  </label>
                  <input
                    type="text"
                    value={nhip2}
                    onChange={(e) => setNhip2(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    4. Nhịp 3:
                  </label>
                  <input
                    type="text"
                    value={nhip3}
                    onChange={(e) => setNhip3(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    5. Nhịp 4:
                  </label>
                  <input
                    type="text"
                    value={nhip4}
                    onChange={(e) => setNhip4(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    6. Nhịp 5, 6, 7, 8 (Ghi chú dưới):
                  </label>
                  <input
                    type="text"
                    value={nhip58}
                    onChange={(e) => setNhip58(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
                THÔNG SỐ SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    Vị trí Giáo viên hướng dẫn:
                  </label>
                  <input
                    type="text"
                    value={formationTeacher}
                    onChange={(e) => setFormationTeacher(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="text-[10.5px] font-bold text-slate-700 block mb-1">
                    Cự ly giãn cách và bố trí học sinh:
                  </label>
                  <input
                    type="text"
                    value={formationSpacing}
                    onChange={(e) => setFormationSpacing(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Workflow Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="flex border-b border-slate-200 bg-slate-100/75 p-1 gap-1">
              <button
                onClick={() => setActiveTab('restore')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeTab === 'restore'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-4 h-4 text-emerald-600" />
                <span>Cách 1: Phục Chế Làm Nét Ảnh Gốc (Khuyên dùng 100%)</span>
              </button>

              <button
                onClick={() => setActiveTab('local_2d')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeTab === 'local_2d'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>{generationType === 'formation' ? 'Cách 2: Sơ Đồ Đội Hình 2D Vector (Ngoại tuyến)' : 'Cách 2: Tranh Phân Thế 2D Vector (Ngoại tuyến)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chatgpt')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeTab === 'chatgpt'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Cách 3: ChatGPT / Gemini (Prompt chuẩn sư phạm)</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  activeTab === 'api'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-4 h-4 text-purple-600" />
                <span>Cách 4: API Tự Động</span>
              </button>
            </div>

            {/* TAB 1: RESTORE & SHARPEN ORIGINAL (CHÂU ĐÁO VÀ CHUẨN XÁC NHẤT) */}
            {activeTab === 'restore' && (
              <div className="p-4 space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                      <Wand2 className="w-4 h-4 text-emerald-600" />
                      Phục chế ảnh gốc từ Sách Giáo Khoa (Khử mờ, tăng nét 2x, nền trắng tinh)
                    </h5>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                      Ảnh gốc từ SGK là bản vẽ chính thức của Nhà xuất bản Giáo dục Việt Nam (Bộ GD&ĐT). Khi dùng chức năng này, hệ thống sẽ:
                      <br />• <strong>Tăng độ tương phản & làm trắng nền 100%:</strong> Xóa bỏ hoàn toàn vệt vàng ố, nền xám do scan.
                      <br />• <strong>Khử mờ & sắc nét đường viền (Unsharp Masking):</strong> Làm rõ từng khớp ngón tay, mắt nhìn, góc độ thân người.
                      <br />• <strong>Bảo toàn 100% bản quyền và kỹ thuật sư phạm GDPT 2018.</strong>
                    </p>
                  </div>
                  <button
                    disabled={isRestoring}
                    onClick={handleRestoreAndSharpen}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xs shrink-0"
                  >
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>{isRestoring ? 'Đang Phục Chế...' : '✨ Bắt Đầu Phục Chế Làm Nét Ngay'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: INTERNAL 2D VECTOR */}
            {activeTab === 'local_2d' && (
              <div className="p-4 space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-blue-900 text-xs">
                      {generationType === 'formation'
                        ? '📐 Bộ Sinh Sơ Đồ Đội Hình 4 Hàng Ngang Giãn Cách (Ngoại tuyến 100%)'
                        : '📐 Bộ Sinh Tranh Phân Thế 2D Vector Chuẩn Từng Nhịp (Ngoại tuyến 100%)'}
                    </h5>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      {generationType === 'formation'
                        ? 'Sinh bản vẽ sơ đồ sân tập: GV ở trên, 4 hàng ngang học sinh đứng so le, thước đo 1 sải tay, mũi tên nhìn hướng lên GV.'
                        : 'Sinh tranh 5 nhịp chính xác theo các thông số cử động Thầy đã nhập ở trên. Không bao giờ lo AI đoán mò!'}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateLocal2d}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{generationType === 'formation' ? '⚡ Sinh Sơ Đồ Đội Hình Ngay' : '⚡ Sinh Tranh 2D Từng Nhịp Ngay'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CHATGPT WITH PEDAGOGICAL CONSTRAINTS */}
            {activeTab === 'chatgpt' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <div>
                    <h5 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Quy trình kết nối ChatGPT kèm câu lệnh chuyên sâu:
                    </h5>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {generationType === 'formation'
                        ? 'Prompt đã được thiết kế riêng cho SƠ ĐỒ ĐỘI HÌNH TẬP LUYỆN (cấm ChatGPT vẽ phân thế động tác cá nhân).'
                        : 'Prompt đã được liên kết trực tiếp với từng cử động nhịp Thầy nhập ở trên, bảo đảm ChatGPT không vẽ sai.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Mở ChatGPT
                    </a>
                    <a
                      href="https://gemini.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Mở Gemini
                    </a>
                  </div>
                </div>

                {/* Prompt display box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700">
                      Nội dung Prompt đã khớp chuẩn xác với yêu cầu của Thầy:
                    </label>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition shadow-2xs"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Đã Sao Chép!' : '📋 1-Click Sao Chép Prompt'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    value={activeChatGptPrompt}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-[11px] text-slate-800 font-mono leading-relaxed focus:outline-none select-all"
                  />
                </div>

                {/* Paste Area notice */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <h6 className="font-bold text-emerald-950 text-xs">
                        Dán ảnh vừa tạo bằng phím tắt
                      </h6>
                      <p className="text-[11px] text-emerald-800">
                        Chuột phải Copy Image trên ChatGPT rồi bấm <strong>Ctrl + V</strong> tại màn hình này!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: API AUTOMATION */}
            {activeTab === 'api' && (
              <div className="p-4 space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <h5 className="font-bold text-purple-900 text-xs">
                    ⚡ Tự động gọi API (OpenAI DALL-E 3 hoặc Google Gemini)
                  </h5>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Nhập API Key lưu bảo mật trên máy để tự động sinh ảnh qua API.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedApiProvider('openai')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedApiProvider === 'openai'
                        ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">OpenAI DALL-E 3</span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">Tranh SGK Cực Đẹp</span>
                    </div>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={openAiApiKey}
                      onChange={(e) => setOpenAiApiKey(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>

                  <div
                    onClick={() => setSelectedApiProvider('gemini')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedApiProvider === 'gemini'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">Google Gemini AI</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">Nhanh Chóng</span>
                    </div>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={isCallingApi}
                    onClick={handleCallApi}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isCallingApi ? 'Đang Sinh Tranh Qua API...' : 'Bắt Đầu Sinh Tranh Qua API'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết tuân thủ chuẩn GDPT 2018: học sinh tiểu học, đúng đồng phục, bố cục rõ ràng, nền trắng in ấn.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>
  );
};
