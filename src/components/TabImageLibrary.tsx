import React, { useState, useMemo } from 'react';
import {
  Download,
  FileJson,
  Crop,
  Scissors,
  Sparkles,
  Search,
  PlusCircle,
  Trash2,
  Upload,
  CheckSquare,
  Square,
  Layers,
  ArrowRight,
  FolderTree,
  Folder,
  FolderOpen,
  Filter,
  CheckCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Tag,
  Move,
  X
} from 'lucide-react';
import { SgkImageItem, ImageCategory, SubFolderType } from '../types/gdtc';
import { downloadZipOfImages, downloadJsonFile } from '../utils/exportUtils';
import { removeBackgroundCanvas, autoCropCanvas, enhanceContrastCanvas } from '../utils/imageProcessing';
import { Database, Wand2, Eraser } from 'lucide-react';
import { sgkCurriculumTree, SgkLessonFolder } from '../data/sgkCurriculumTree';
import { deleteImageDB, saveImagesDB } from '../utils/db';
import { ImageToImageModal } from './ImageToImageModal';

interface TabImageLibraryProps {
  images: SgkImageItem[];
  setImages: React.Dispatch<React.SetStateAction<SgkImageItem[]>>;
  onOpenSelectCellModal: (img: SgkImageItem) => void;
  onAnalyzeVision?: (img: SgkImageItem) => void;
  onOpenSmartClean?: (img: SgkImageItem) => void;
  showToast: (msg: string) => void;
}

export const TabImageLibrary: React.FC<TabImageLibraryProps> = ({
  images,
  setImages,
  onOpenSelectCellModal,
  onAnalyzeVision,
  onOpenSmartClean,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('all'); // 'all' | '1' | '3' | '5'
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');
  const [selectedSubFolder, setSelectedSubFolder] = useState<string>('all'); // 'all' | 'kyThuat' | 'luyenTap' | 'vanDung' | 'troChoi' | 'khoiDong'
  const [imageToImageModalItem, setImageToImageModalItem] = useState<SgkImageItem | null>(null);

  // Tree expanded state
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
    '5': true
  });
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({
    'k1_cd2_b1': true,
    'k3_cd1_b4': true,
    'k5_cd2_b1': true
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [reclassifyModalImage, setReclassifyModalImage] = useState<SgkImageItem | null>(null);

  const selectedCount = images.filter((img) => img.selected).length;

  const toggleGradeExpand = (grade: string) => {
    setExpandedGrades((prev) => ({ ...prev, [grade]: !prev[grade] }));
  };

  const toggleLessonExpand = (lessonId: string) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Toggle selection
  const handleToggleSelectAll = (checked: boolean) => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: checked })));
  };

  const handleToggleSelectOne = (id: string, checked: boolean) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, selected: checked } : img))
    );
  };

  // Bulk Delete
  const handleBatchDelete = () => {
    const itemsToDelete = images.filter((img) => img.selected);
    const countToDelete = itemsToDelete.length;
    if (countToDelete === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh để xóa!');
      return;
    }

    // Direct deletion from IndexedDB to guarantee persistence
    itemsToDelete.forEach((img) => deleteImageDB(img.id).catch(() => {}));

    setImages((prev) => {
      const updated = prev.filter((img) => !img.selected);
      saveImagesDB(updated).catch(() => {});
      return updated;
    });
    setIsConfirmDeleteOpen(false);
    showToast(`🗑️ Đã xóa vĩnh viễn ${countToDelete} hình ảnh khỏi thư viện và IndexedDB!`);
  };

  // Single Delete
  const handleDeleteSingleImage = (id: string) => {
    deleteImageDB(id).catch(() => {});
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      saveImagesDB(updated).catch(() => {});
      return updated;
    });
    showToast('Đã xóa vĩnh viễn hình ảnh khỏi thư viện!');
  };

  // Reclassify single image
  const handleUpdateImageMetadata = (
    id: string,
    updates: Partial<SgkImageItem>
  ) => {
    setImages((prev) => {
      const updated = prev.map((img) => (img.id === id ? { ...img, ...updates } : img));
      saveImagesDB(updated).catch(() => {});
      return updated;
    });
    showToast('Đã cập nhật phân loại khối lớp & thư mục cho hình ảnh!');
  };

  // Direct PNG download of single image
  const handleDownloadSinglePng = (img: SgkImageItem) => {
    const a = document.createElement('a');
    a.href = img.imgUrl;
    const cleanTitle = (img.title || 'anh_gdtc')
      .replace(/[^\w\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '_');
    a.download = `${cleanTitle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`💾 Đã tải "${img.title}" về máy tính!`);
  };

  // Batch move to another grade
  const handleBatchMoveGrade = (targetGrade: string) => {
    if (selectedCount === 0) return alert('Vui lòng chọn ảnh trước khi chuyển khối!');
    setImages((prev) => {
      const updated = prev.map((img) => (img.selected ? { ...img, grade: targetGrade } : img));
      saveImagesDB(updated).catch(() => {});
      return updated;
    });
    showToast(`Đã chuyển ${selectedCount} ảnh sang Khối ${targetGrade}!`);
  };

  // Batch move to another sub-folder
  const handleBatchMoveSubFolder = (targetFolder: SubFolderType) => {
    if (selectedCount === 0) return alert('Vui lòng chọn ảnh trước khi chuyển thư mục!');
    let newCat: ImageCategory = 'dong_tac';
    if (targetFolder === 'luyenTap') newCat = 'tap_luyen';
    else if (targetFolder === 'vanDung') newCat = 'van_dung';
    else if (targetFolder === 'troChoi') newCat = 'tro_choi';
    else if (targetFolder === 'khoiDong') newCat = 'khoi_dong';

    setImages((prev) =>
      prev.map((img) =>
        img.selected
          ? { ...img, folder: targetFolder, category: newCat }
          : img
      )
    );
    showToast(`Đã chuyển ${selectedCount} ảnh sang thư mục mới!`);
  };

  // Canvas batch operations
  const handleBatchProcess = async (action: 'crop' | 'remove-bg' | 'watermark') => {
    const selected = images.filter((i) => i.selected);
    if (selected.length === 0) {
      alert('Vui lòng chọn ít nhất 1 hình ảnh để xử lý!');
      return;
    }

    setIsProcessing(true);
    showToast(`Đang xử lý ${selected.length} hình ảnh trên Canvas...`);

    try {
      const updatedImages = [...images];
      for (let i = 0; i < updatedImages.length; i++) {
        const item = updatedImages[i];
        if (!item.selected) continue;

        try {
          if (action === 'crop') {
            const cropped = await autoCropCanvas(item.imgUrl);
            updatedImages[i] = { ...item, imgUrl: cropped };
          } else if (action === 'remove-bg') {
            const transparent = await removeBackgroundCanvas(item.imgUrl, 38, true);
            updatedImages[i] = { ...item, imgUrl: transparent };
          } else if (action === 'watermark') {
            const enhanced = await enhanceContrastCanvas(item.imgUrl);
            updatedImages[i] = { ...item, imgUrl: enhanced };
          }
        } catch (itemErr) {
          console.warn('Error processing item', item.id, itemErr);
        }
      }

      setImages(updatedImages);
      if (action === 'crop') {
        showToast(`Đã tự động cắt căn lề chuẩn thành công cho ${selected.length} ảnh!`);
      } else if (action === 'remove-bg') {
        showToast(`Đã bóc tách nền trong suốt tự động cho ${selected.length} ảnh!`);
      } else {
        showToast(`Đã xóa watermark và tăng cường độ sắc nét cho ${selected.length} ảnh!`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeduplicateAndClean = () => {
    const originalCount = images.length;
    const seen = new Set<string>();
    const cleaned: SgkImageItem[] = [];

    for (const img of images) {
      // Key: title + grade + page
      const key = `${img.grade}_${img.title.trim().toLowerCase()}_${img.page || 0}`;
      if (!seen.has(key) && !seen.has(img.id)) {
        seen.add(key);
        seen.add(img.id);
        cleaned.push(img);
      }
    }

    const removedCount = originalCount - cleaned.length;
    if (removedCount === 0) {
      showToast('✨ Thư viện rất gọn gàng, không có ảnh trùng lặp nào!');
    } else {
      setImages(cleaned);
      showToast(`🧹 Đã dọn dẹp ${removedCount} ảnh trùng lặp và tối ưu thư viện!`);
    }
  };

  const handleExportZip = () => {
    if (images.length === 0) return alert('Thư viện chưa có hình ảnh nào để tải về!');
    downloadZipOfImages(images);
    showToast('Đang nén và tải về file ZIP thư viện ảnh SGK!');
  };

  const handleExportJson = () => {
    if (images.length === 0) return alert('Thư viện chưa có dữ liệu để xuất JSON!');
    downloadJsonFile(images);
    showToast('Đã xuất thành công file JSON thư viện!');
  };

  // Tự động quét và phân loại toàn bộ thư viện: Phân biệt Động tác mới vs Luyện tập vs Khởi động vs Vận dụng
  const handleAutoClassifyAllImages = async () => {
    if (images.length === 0) return alert('Thư viện chưa có hình ảnh nào!');
    setIsProcessing(true);
    showToast('Đang phân tích và tự động phân loại toàn bộ thư viện...');

    let countUpdated = 0;
    const updatedImages = images.map((img) => {
      let newFolder: SubFolderType = img.folder || 'kyThuat';
      let newCat: ImageCategory = img.category || 'dong_tac';
      let newTitle = img.title || '';

      const lowerTitle = (img.title || '').toLowerCase();
      const lowerCaption = (img.caption || '').toLowerCase();
      const text = `${lowerTitle} ${lowerCaption}`;

      // 1. Phân loại Thư mục Luyện tập
      if (
        text.includes('luyện tập') ||
        text.includes('tập luyện') ||
        text.includes('cặp đôi') ||
        text.includes('tổ nhóm') ||
        text.includes('theo tổ') ||
        text.includes('4 khu vực') ||
        text.includes('sửa sai') ||
        text.includes('cá nhân')
      ) {
        newFolder = 'luyenTap';
        newCat = 'tap_luyen';
        countUpdated++;
      }
      // 2. Phân loại Khởi động
      else if (
        text.includes('khởi động') ||
        text.includes('xoay khớp') ||
        text.includes('làm nóng')
      ) {
        newFolder = 'khoiDong';
        newCat = 'khoi_dong';
        countUpdated++;
      }
      // 3. Phân loại Vận dụng
      else if (
        text.includes('vận dụng') ||
        text.includes('thả lỏng') ||
        text.includes('hồi tĩnh') ||
        text.includes('buổi sáng')
      ) {
        newFolder = 'vanDung';
        newCat = 'van_dung';
        countUpdated++;
      }
      // 4. Phân loại Trò chơi
      else if (text.includes('trò chơi') || text.includes('tiếp sức') || text.includes('con thỏ')) {
        newFolder = 'troChoi';
        newCat = 'tro_choi';
        countUpdated++;
      }
      // 5. Động tác kỹ thuật mới
      else {
        newFolder = 'kyThuat';
        newCat = 'dong_tac';
      }

      // 6. Sửa tên mặc định chung chung (nếu dính "Thư mục ảnh Kỹ thuật động tác - Động tác vươn thở")
      if (lowerTitle.includes('thư mục ảnh') || (lowerTitle.includes('động tác vươn thở') && !lowerCaption.includes('vươn thở'))) {
        if (text.includes('tay')) {
          newTitle = `Động tác Tay - SGK Lớp ${img.grade || 1}`;
        } else if (text.includes('chân')) {
          newTitle = `Động tác Chân - SGK Lớp ${img.grade || 1}`;
        } else if (text.includes('lườn')) {
          newTitle = `Động tác Lườn - SGK Lớp ${img.grade || 1}`;
        } else if (text.includes('bụng')) {
          newTitle = `Động tác Bụng - SGK Lớp ${img.grade || 1}`;
        } else if (text.includes('đi đều')) {
          newTitle = `Động tác Đi đều, Đứng lại - SGK Lớp ${img.grade || 3}`;
        } else if (text.includes('gậy')) {
          newTitle = `Động tác với gậy - SGK Lớp ${img.grade || 5}`;
        } else if (text.includes('thăng bằng')) {
          newTitle = `Động tác Thăng bằng - SGK Lớp ${img.grade || 1}`;
        } else if (newFolder === 'luyenTap') {
          newTitle = `Luyện tập bài học - SGK Lớp ${img.grade || 1}`;
        } else if (newFolder === 'khoiDong') {
          newTitle = `Khởi động bài học - SGK Lớp ${img.grade || 1}`;
        } else if (newFolder === 'vanDung') {
          newTitle = `Vận dụng thực tế - SGK Lớp ${img.grade || 1}`;
        }
      }

      return {
        ...img,
        folder: newFolder,
        category: newCat,
        title: newTitle
      };
    });

    setImages(updatedImages);
    await saveImagesDB(updatedImages);
    setIsProcessing(false);
    showToast(`⚡ Đã tự động phân loại thành công ${updatedImages.length} ảnh vào đúng thư mục Kỹ thuật mới & Luyện tập!`);
  };

  const handleUploadSingleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const g = filterGrade === 'all' ? '1' : filterGrade;
      const newImg: SgkImageItem = {
        id: 'img_user_' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        grade: g,
        folder: 'kyThuat',
        page: 1,
        category: 'dong_tac',
        imgUrl: e.target?.result as string,
        caption: `Ảnh người dùng tải lên trực tiếp vào Khối ${g}`,
        selected: false,
        createdAt: Date.now()
      };
      setImages((prev) => [newImg, ...prev]);
      showToast(`Đã thêm ảnh mới vào Thư viện Khối ${g}!`);
    };
    reader.readAsDataURL(file);
  };

  // State theo dõi ảnh đang sinh 3D
  const [generating3dId, setGenerating3dId] = useState<string | null>(null);

  // Tạo nhân vật hoạt hình 3D phong cách Pixar, nền trong suốt, KHÔNG CHỮ
  const handleGenerate3dCartoon = async (img: SgkImageItem) => {
    setGenerating3dId(img.id);
    showToast(`AI đang tạo nhân vật 3D hoạt hình Pixar nền trong suốt cho "${img.title}"...`);

    try {
      const cleanName = img.title
        .replace(/\s*-\s*SGK.*$/i, '')
        .replace(/Hình\s+\d+(\.\d+)?:?\s*/i, '')
        .replace(/Trò chơi:?\s*/i, '')
        .replace(/Động tác:?\s*/i, '')
        .trim();

      const res = await fetch('/api/ai/generate-3d-cartoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movementName: cleanName || img.title,
          grade: img.grade,
          description: img.caption || ''
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        const new3dImg: SgkImageItem = {
          id: `img_3d_${Date.now()}`,
          title: `[3D] ${cleanName || img.title} (Nền trong suốt)`,
          grade: img.grade,
          topicId: img.topicId,
          topicTitle: img.topicTitle,
          lessonId: img.lessonId,
          lessonTitle: img.lessonTitle,
          folder: img.folder || 'kyThuat',
          page: img.page || 1,
          category: img.category || 'dong_tac',
          imgUrl: data.imageUrl,
          caption: `Nhân vật hoạt hình 3D Pixar GDTC, nền trong suốt, không chữ, tư thế chuẩn động tác: ${cleanName}`,
          selected: false,
          createdAt: Date.now()
        };

        setImages((prev) => [new3dImg, ...prev]);
        showToast(`✨ Đã tạo thành công nhân vật hoạt hình 3D nền trong suốt không chữ cho "${cleanName}"!`);
      } else {
        throw new Error(data.error || 'Lỗi tạo ảnh');
      }
    } catch (err: any) {
      showToast('Lỗi tạo ảnh 3D: ' + err?.message);
    } finally {
      setGenerating3dId(null);
    }
  };

  // Kiểm tra ảnh khớp chuẩn xác với thư mục bài học trong cây SGK
  const checkImageMatchesFolder = (img: SgkImageItem, folder: SgkLessonFolder): boolean => {
    // 1. Khối lớp bắt buộc khớp
    if (String(img.grade) !== String(folder.grade)) return false;

    // 2. Nếu cả 2 đều có topicId, nếu khác nhau thì KHÔNG khớp (tránh lẫn giữa Chủ đề 1 và Chủ đề 2 cùng khối)
    if (img.topicId && folder.topicId && img.topicId !== folder.topicId && img.topicId !== folder.id) {
      if (!(img.page && img.page >= folder.startPage && img.page <= folder.endPage)) {
        return false;
      }
    }

    // 3. Khớp chính xác ID bài học hoặc ID thư mục
    if (img.lessonId === folder.id || (img.topicId === folder.topicId && img.lessonId === folder.lessonId)) {
      return true;
    }

    // 4. Khớp theo khoảng trang SGK đã cấu hình
    if (img.page && img.page >= folder.startPage && img.page <= folder.endPage) {
      return true;
    }

    // 5. Khớp theo tên các động tác trọng tâm trong bài
    const textCorpus = `${img.title} ${img.caption || ''} ${img.lessonTitle || ''}`.toLowerCase();
    const hasMovementMatch = folder.movements.some((m) => {
      const cleanM = m.toLowerCase().trim();
      return cleanM.length > 3 && textCorpus.includes(cleanM);
    });
    if (hasMovementMatch) return true;

    // 6. Khớp theo tên bài học (đã loại bỏ phần phụ lục như Tuần 8)
    const cleanLessonName = folder.lessonName.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    if (cleanLessonName.length > 5 && textCorpus.includes(cleanLessonName)) {
      return true;
    }

    return false;
  };

  // Kiểm tra ảnh khớp với thư mục con (Kỹ thuật / Luyện tập / Vận dụng / Trò chơi / Khởi động / Trò chơi khởi động)
  const checkImageMatchesSubFolder = (img: SgkImageItem, subFolder: string): boolean => {
    if (subFolder === 'all') return true;
    if (img.folder) {
      if (img.folder === subFolder) return true;
      if (subFolder === 'kyThuat' && (img.folder === 'kyThuat' || img.category === 'dong_tac')) return true;
      if (subFolder === 'luyenTap' && (img.folder === 'luyenTap' || img.category === 'tap_luyen')) return true;
      if (subFolder === 'vanDung' && (img.folder === 'vanDung' || img.category === 'van_dung')) return true;
      if (subFolder === 'troChoiKhoiDong' && (img.folder === 'troChoiKhoiDong' || img.category === 'tro_choi_khoi_dong')) return true;
      if (subFolder === 'troChoi' && (img.folder === 'troChoi' || img.category === 'tro_choi')) return true;
      if (subFolder === 'khoiDong' && (img.folder === 'khoiDong' || img.category === 'khoi_dong')) return true;
    }

    // Fallback theo category
    if (subFolder === 'kyThuat') return img.category === 'dong_tac';
    if (subFolder === 'luyenTap') return img.category === 'tap_luyen';
    if (subFolder === 'vanDung') return img.category === 'van_dung';
    if (subFolder === 'troChoiKhoiDong') return img.category === 'tro_choi_khoi_dong';
    if (subFolder === 'troChoi') return img.category === 'tro_choi';
    if (subFolder === 'khoiDong') return img.category === 'khoi_dong';

    return false;
  };

  // Helper counts
  const countByGrade = (g: string) => images.filter((img) => img.grade === g).length;
  const countByLesson = (lessonId: string) => {
    const folder = sgkCurriculumTree.find((f) => f.id === lessonId);
    if (!folder) return 0;
    return images.filter((img) => checkImageMatchesFolder(img, folder)).length;
  };

  const countBySubFolder = (lessonId: string, subFolder: string) => {
    const folder = sgkCurriculumTree.find((f) => f.id === lessonId);
    if (!folder) return 0;
    return images.filter((img) => checkImageMatchesFolder(img, folder) && checkImageMatchesSubFolder(img, subFolder)).length;
  };

  // Filtered Image List
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      // 1. Search filter
      const matchSearch =
        !searchTerm ||
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.topicTitle && img.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.lessonTitle && img.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Grade filter
      const matchGrade = filterGrade === 'all' || img.grade === filterGrade;

      // 3. Lesson / Tree filter
      let matchLesson = true;
      if (selectedLessonId !== 'all') {
        const folder = sgkCurriculumTree.find((f) => f.id === selectedLessonId);
        if (folder) {
          matchLesson = checkImageMatchesFolder(img, folder);
        }
      }

      // 4. Sub-folder filter
      let matchSubFolder = true;
      if (selectedSubFolder !== 'all') {
        matchSubFolder = checkImageMatchesSubFolder(img, selectedSubFolder);
      }

      return matchSearch && matchGrade && matchLesson && matchSubFolder;
    });
  }, [images, searchTerm, filterGrade, selectedLessonId, selectedSubFolder]);

  const folderBadge = (folder?: SubFolderType, cat?: ImageCategory) => {
    if (folder === 'kyThuat' || cat === 'dong_tac') {
      return { label: '🏃 ĐỘNG TÁC KỸ THUẬT', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    if (folder === 'luyenTap' || cat === 'tap_luyen') {
      return { label: '👥 LUYỆN TẬP', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (folder === 'vanDung' || cat === 'van_dung') {
      return { label: '🎯 VẬN DỤNG', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (folder === 'troChoiKhoiDong' || cat === 'tro_choi_khoi_dong') {
      return { label: '🎮 TRÒ CHƠI KHỞI ĐỘNG', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
    if (folder === 'troChoi' || cat === 'tro_choi') {
      return { label: '🎮 TRÒ CHƠI VẬN ĐỘNG', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
    return { label: '⚡ KHỞI ĐỘNG CHUNG', color: 'bg-sky-50 text-sky-800 border-sky-200' };
  };

  const activeBreadcrumbText = useMemo(() => {
    const parts = [];
    if (filterGrade !== 'all') parts.push(`Khối ${filterGrade}`);
    if (selectedLessonId !== 'all') {
      const folder = sgkCurriculumTree.find((f) => f.id === selectedLessonId);
      if (folder) parts.push(folder.lessonName);
    }
    if (selectedSubFolder !== 'all') {
      if (selectedSubFolder === 'kyThuat') parts.push('🏃 Kỹ thuật động tác');
      else if (selectedSubFolder === 'luyenTap') parts.push('👥 Luyện tập');
      else if (selectedSubFolder === 'vanDung') parts.push('🎯 Vận dụng');
      else if (selectedSubFolder === 'troChoiKhoiDong') parts.push('🎮 Trò chơi khởi động');
      else if (selectedSubFolder === 'troChoi') parts.push('🎮 Trò chơi vận động');
      else if (selectedSubFolder === 'khoiDong') parts.push('⚡ Khởi động');
    }
    return parts.length > 0 ? parts.join(' > ') : 'Tất cả hình ảnh SGK';
  }, [filterGrade, selectedLessonId, selectedSubFolder]);

  return (
    <div className="space-y-6">
      {/* Top Banner Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600 w-5 h-5" />
                Thư Viện Hình Ảnh SGK Theo Cây Thư Mục ({images.length} ảnh)
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" /> Lưu trữ IndexedDB
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Phân loại nghiêm ngặt: <strong>Khối lớp &gt; Chủ đề &gt; Bài học &gt; Động tác &gt; Luyện tập &gt; Vận dụng</strong>. Cắt SGK lớp nào sẽ lưu đúng vào khối lớp đó.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5" /> Thêm Ảnh Ngoài
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadSingleImage(e.target.files[0]);
                  }
                }}
              />
            </label>

            <button
              onClick={handleDeduplicateAndClean}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Loại bỏ các ảnh trùng lặp để thư viện luôn gọn gàng và không bị làm đầy ngoài ý muốn"
            >
              <Eraser className="w-3.5 h-3.5 text-amber-600" /> Dọn Trùng Lặp
            </button>

            <button
              onClick={handleAutoClassifyAllImages}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              title="Tự động phân loại thư mục Động tác mới vs Luyện tập cho tất cả ảnh trong thư viện"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> ⚡ Tự Động Phân Loại Thư Mục
            </button>

            <button
              onClick={handleExportZip}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4" /> Tải ZIP
            </button>

            <button
              onClick={handleExportJson}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <FileJson className="w-4 h-4" /> Xuất JSON
            </button>
          </div>
        </div>

        {/* Grade Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Chọn Khối Lớp:
          </span>

          <button
            onClick={() => {
              setFilterGrade('all');
              setSelectedLessonId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              filterGrade === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất Cả Khối ({images.length})
          </button>

          <button
            onClick={() => {
              setFilterGrade('1');
              setSelectedLessonId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              filterGrade === '1'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Khối 1 ({countByGrade('1')})
          </button>

          <button
            onClick={() => {
              setFilterGrade('3');
              setSelectedLessonId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              filterGrade === '3'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Khối 3 ({countByGrade('3')})
          </button>

          <button
            onClick={() => {
              setFilterGrade('5');
              setSelectedLessonId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              filterGrade === '5'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Khối 5 ({countByGrade('5')})
          </button>
        </div>

        {/* Sub-folder Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-purple-600" /> Thư Mục Con:
          </span>

          <button
            onClick={() => setSelectedSubFolder('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
              selectedSubFolder === 'all'
                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tất cả thư mục
          </button>

          <button
            onClick={() => setSelectedSubFolder('kyThuat')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
              selectedSubFolder === 'kyThuat'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            🏃 Động Tác Kỹ Thuật
          </button>

          <button
            onClick={() => setSelectedSubFolder('luyenTap')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
              selectedSubFolder === 'luyenTap'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            👥 Luyện Tập (Tổ / Nhóm / Cặp đôi)
          </button>

          <button
            onClick={() => setSelectedSubFolder('vanDung')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
              selectedSubFolder === 'vanDung'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            🎯 Vận Dụng Thực Tế
          </button>

          <button
            onClick={() => setSelectedSubFolder('troChoi')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition border text-[11px] ${
              selectedSubFolder === 'troChoi'
                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            🎮 Trò Chơi Vận Động
          </button>
        </div>

        {/* Batch Operations & Selection Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleSelectAll(selectedCount !== images.length)}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition"
            >
              {selectedCount === images.length && images.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Chọn tất cả ({selectedCount}/{images.length} đã chọn)</span>
            </button>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa {selectedCount} ảnh</span>
                </button>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px]">
                  <span className="text-slate-500 font-semibold px-1">Chuyển sang:</span>
                  <button
                    onClick={() => handleBatchMoveGrade('1')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded font-bold"
                  >
                    Khối 1
                  </button>
                  <button
                    onClick={() => handleBatchMoveGrade('3')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded font-bold"
                  >
                    Khối 3
                  </button>
                  <button
                    onClick={() => handleBatchMoveGrade('5')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded font-bold"
                  >
                    Khối 5
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBatchProcess('crop')}
              disabled={selectedCount === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <Crop className="w-3.5 h-3.5" /> Cắt căn lề
            </button>
            <button
              onClick={() => handleBatchProcess('remove-bg')}
              disabled={selectedCount === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <Scissors className="w-3.5 h-3.5" /> Tách nền
            </button>
            <button
              onClick={() => handleBatchProcess('watermark')}
              disabled={selectedCount === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" /> Tăng nét
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên động tác, chủ đề, bài học, lượng vận động..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 p-2 focus:border-blue-500 focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Main Content Area: Left Hierarchical Folder Tree + Right Images Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Directory Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col max-h-[800px]">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span>CÂY THƯ MỤC BÀI HỌC SGK</span>
            </h3>
            {(filterGrade !== 'all' || selectedLessonId !== 'all' || selectedSubFolder !== 'all') && (
              <button
                onClick={() => {
                  setFilterGrade('all');
                  setSelectedLessonId('all');
                  setSelectedSubFolder('all');
                }}
                className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Hiện tất cả
              </button>
            )}
          </div>

          {/* Root: Tất cả */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-xs pr-1">
            <div
              onClick={() => {
                setFilterGrade('all');
                setSelectedLessonId('all');
                setSelectedSubFolder('all');
              }}
              className={`p-2 rounded-xl cursor-pointer font-bold flex items-center justify-between transition ${
                filterGrade === 'all' && selectedLessonId === 'all' && selectedSubFolder === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                <span>Tất cả hình ảnh thư viện</span>
              </div>
              <span className="text-[10px] opacity-80 bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                {images.length}
              </span>
            </div>

            {/* Tree Nodes by Grade: 1, 3, 5 */}
            {([1, 3, 5] as const).map((g) => {
              const gradeStr = String(g);
              const isGradeExpanded = !!expandedGrades[gradeStr];
              const isGradeActive = filterGrade === gradeStr && selectedLessonId === 'all';
              const gradeLessons = sgkCurriculumTree.filter((f) => f.grade === g);
              const gCount = countByGrade(gradeStr);

              return (
                <div key={`grade_${g}`} className="space-y-1 pt-1">
                  {/* Grade Header */}
                  <div
                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      isGradeActive
                        ? 'bg-blue-50 border border-blue-300 text-blue-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-800 font-semibold'
                    }`}
                  >
                    <div
                      className="flex items-center gap-1.5 flex-1"
                      onClick={() => {
                        setFilterGrade(gradeStr);
                        setSelectedLessonId('all');
                      }}
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold uppercase">Khối Lớp {g}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                        {gCount} ảnh
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGradeExpand(gradeStr);
                        }}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        {isGradeExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Lessons Under this Grade */}
                  {isGradeExpanded && (
                    <div className="pl-3 border-l-2 border-slate-200 space-y-1.5 ml-2">
                      {gradeLessons.map((lesson) => {
                        const isLessonExpanded = !!expandedLessons[lesson.id];
                        const isLessonActive = selectedLessonId === lesson.id && selectedSubFolder === 'all';
                        const lCount = countByLesson(lesson.id);

                        return (
                          <div key={lesson.id} className="space-y-1">
                            {/* Lesson Node */}
                            <div
                              className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition text-[11px] ${
                                isLessonActive
                                  ? 'bg-blue-100/70 text-blue-900 font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div
                                className="flex items-center gap-1.5 flex-1 truncate"
                                onClick={() => {
                                  setFilterGrade(gradeStr);
                                  setSelectedLessonId(lesson.id);
                                  setSelectedSubFolder('all');
                                }}
                              >
                                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">{lesson.lessonName}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[9px] px-1 bg-slate-100 text-slate-600 rounded font-semibold">
                                  {lCount}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonExpand(lesson.id);
                                  }}
                                  className="p-0.5 hover:bg-slate-200 rounded"
                                >
                                  {isLessonExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* 4 Standard Sub-folders inside each Lesson */}
                            {isLessonExpanded && (
                              <div className="pl-4 space-y-0.5 text-[10.5px]">
                                {/* 1. Kỹ thuật động tác */}
                                <div
                                  onClick={() => {
                                    setFilterGrade(gradeStr);
                                    setSelectedLessonId(lesson.id);
                                    setSelectedSubFolder('kyThuat');
                                  }}
                                  className={`p-1 rounded cursor-pointer flex items-center justify-between transition ${
                                    selectedLessonId === lesson.id && selectedSubFolder === 'kyThuat'
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'hover:bg-blue-50 text-slate-600'
                                  }`}
                                >
                                  <span>🏃 Động tác kỹ thuật</span>
                                  <span className="text-[9px] opacity-75 font-semibold">
                                    {countBySubFolder(lesson.id, 'kyThuat')}
                                  </span>
                                </div>

                                {/* 2. Luyện tập */}
                                <div
                                  onClick={() => {
                                    setFilterGrade(gradeStr);
                                    setSelectedLessonId(lesson.id);
                                    setSelectedSubFolder('luyenTap');
                                  }}
                                  className={`p-1 rounded cursor-pointer flex items-center justify-between transition ${
                                    selectedLessonId === lesson.id && selectedSubFolder === 'luyenTap'
                                      ? 'bg-amber-600 text-white font-bold'
                                      : 'hover:bg-amber-50 text-slate-600'
                                  }`}
                                >
                                  <span>👥 Luyện tập (Nhóm/Cặp)</span>
                                  <span className="text-[9px] opacity-75 font-semibold">
                                    {countBySubFolder(lesson.id, 'luyenTap')}
                                  </span>
                                </div>

                                {/* 3. Vận dụng */}
                                <div
                                  onClick={() => {
                                    setFilterGrade(gradeStr);
                                    setSelectedLessonId(lesson.id);
                                    setSelectedSubFolder('vanDung');
                                  }}
                                  className={`p-1 rounded cursor-pointer flex items-center justify-between transition ${
                                    selectedLessonId === lesson.id && selectedSubFolder === 'vanDung'
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'hover:bg-emerald-50 text-slate-600'
                                  }`}
                                >
                                  <span>🎯 Vận dụng thực tế</span>
                                  <span className="text-[9px] opacity-75 font-semibold">
                                    {countBySubFolder(lesson.id, 'vanDung')}
                                  </span>
                                </div>

                                 {/* 4. Trò chơi khởi động */}
                                <div
                                  onClick={() => {
                                    setFilterGrade(gradeStr);
                                    setSelectedLessonId(lesson.id);
                                    setSelectedSubFolder('troChoiKhoiDong');
                                  }}
                                  className={`p-1 rounded cursor-pointer flex items-center justify-between transition ${
                                    selectedLessonId === lesson.id && selectedSubFolder === 'troChoiKhoiDong'
                                      ? 'bg-purple-600 text-white font-bold'
                                      : 'hover:bg-purple-50 text-slate-600'
                                  }`}
                                >
                                  <span>🎮 Trò chơi khởi động</span>
                                  <span className="text-[9px] opacity-75 font-semibold">
                                    {countBySubFolder(lesson.id, 'troChoiKhoiDong')}
                                  </span>
                                </div>

                                {/* 5. Trò chơi vận động */}
                                <div
                                  onClick={() => {
                                    setFilterGrade(gradeStr);
                                    setSelectedLessonId(lesson.id);
                                    setSelectedSubFolder('troChoi');
                                  }}
                                  className={`p-1 rounded cursor-pointer flex items-center justify-between transition ${
                                    selectedLessonId === lesson.id && selectedSubFolder === 'troChoi'
                                      ? 'bg-purple-600 text-white font-bold'
                                      : 'hover:bg-purple-50 text-slate-600'
                                  }`}
                                >
                                  <span>🏃 Trò chơi vận động</span>
                                  <span className="text-[9px] opacity-75 font-semibold">
                                    {countBySubFolder(lesson.id, 'troChoi')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Images Grid View */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Tree Path Breadcrumb */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-blue-900">{activeBreadcrumbText}</span>
              <span className="text-slate-400 font-normal">({filteredImages.length} ảnh)</span>
            </div>

            {(filterGrade !== 'all' || selectedLessonId !== 'all' || selectedSubFolder !== 'all') && (
              <button
                onClick={() => {
                  setFilterGrade('all');
                  setSelectedLessonId('all');
                  setSelectedSubFolder('all');
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
              >
                Quay lại tất cả
              </button>
            )}
          </div>

          {filteredImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 text-xs space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Thư mục này chưa có hình ảnh nào.</p>
              <p className="text-slate-500 max-w-md mx-auto">
                Hãy mở tab <strong>"1. Quét & Bóc Tách SGK"</strong>, chọn trang sách của Khối {filterGrade === 'all' ? '1, 3, hoặc 5' : filterGrade} và dùng chuột quét vùng ảnh để tự động lưu vào đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredImages.map((img) => {
                const badge = folderBadge(img.folder, img.category);
                return (
                  <div
                    key={img.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition relative ${
                      img.selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!img.selected}
                            onChange={(e) => handleToggleSelectOne(img.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            Khối Lớp {img.grade}
                          </span>
                        </label>

                        <span
                          className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Image Preview Box */}
                      <div className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-100 h-44 flex items-center justify-center p-2">
                        <img
                          src={img.imgUrl}
                          alt={img.title}
                          className="max-h-full max-w-full object-contain rounded"
                        />
                        <button
                          onClick={() => handleDeleteSingleImage(img.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs"
                          title="Xóa ảnh khỏi thư viện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Info & Hierarchy Tags */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {img.title}
                        </h4>
                        {img.lessonTitle && (
                          <p className="text-[10px] font-semibold text-blue-700 mt-1 line-clamp-1">
                            {img.lessonTitle}
                          </p>
                        )}
                        <p className="text-slate-500 text-[10.5px] leading-relaxed mt-1 line-clamp-2">
                          {img.caption}
                        </p>
                      </div>
                    </div>

                    {/* Quick Move / Reclassify Menu */}
                    <div className="space-y-2 pt-2.5 mt-2.5 border-t border-slate-100 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div>
                          <label className="text-[9.5px] text-slate-400 font-semibold block mb-0.5">Khối lớp:</label>
                          <select
                            value={img.grade}
                            onChange={(e) => handleUpdateImageMetadata(img.id, { grade: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-slate-800 font-semibold focus:outline-none"
                          >
                            <option value="1">Khối 1</option>
                            <option value="3">Khối 3</option>
                            <option value="5">Khối 5</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9.5px] text-slate-400 font-semibold block mb-0.5">Thư mục con:</label>
                          <select
                            value={img.folder || 'kyThuat'}
                            onChange={(e) => {
                              const f = e.target.value as SubFolderType;
                              let c: ImageCategory = 'dong_tac';
                              if (f === 'luyenTap') c = 'tap_luyen';
                              else if (f === 'vanDung') c = 'van_dung';
                              else if (f === 'troChoiKhoiDong') c = 'tro_choi_khoi_dong';
                              else if (f === 'troChoi') c = 'tro_choi';
                              else if (f === 'khoiDong') c = 'khoi_dong';
                              handleUpdateImageMetadata(img.id, { folder: f, category: c });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-slate-800 font-semibold focus:outline-none"
                          >
                            <option value="kyThuat">Động tác kỹ thuật</option>
                            <option value="luyenTap">Luyện tập</option>
                            <option value="vanDung">Vận dụng</option>
                            <option value="troChoiKhoiDong">Trò chơi khởi động</option>
                            <option value="troChoi">Trò chơi vận động</option>
                            <option value="khoiDong">Khởi động chung</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-1.5 pt-1">
                        {/* Generate New Image from Existing Image */}
                        <button
                          onClick={() => setImageToImageModalItem(img)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                          title="Tạo hình ảnh mới (Chuẩn mẫu SGK, 3D, Nhiều người, Phác thảo) giữ nguyên tư thế từ ảnh này"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>🎨 Tạo Ảnh Mới Từ Ảnh Này</span>
                        </button>

                        <div className="grid grid-cols-3 gap-1.5">
                          {onOpenSmartClean && (
                            <button
                              onClick={() => onOpenSmartClean(img)}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                              title="Cắt xén kéo chuột hoặc tẩy chi tiết thừa"
                            >
                              <Scissors className="w-3 h-3 text-blue-600" /> Cắt Xử Lý
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadSinglePng(img)}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                            title="Tải ảnh PNG trực tiếp về máy tính"
                          >
                            <Download className="w-3 h-3 text-emerald-600" /> Tải Về
                          </button>

                          {onAnalyzeVision && (
                            <button
                              onClick={() => onAnalyzeVision(img)}
                              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10.5px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                              title="AI phân tích thị giác đọc động tác"
                            >
                              <Wand2 className="w-3 h-3 text-indigo-600" /> AI Đọc
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => onOpenSelectCellModal(img)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Gắn Vào Kế Hoạch Bài Dạy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Bulk Deletion */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Xác nhận xóa hàng loạt</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong>{selectedCount} hình ảnh</strong> đã chọn khỏi Thư viện ảnh không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa {selectedCount} ảnh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image-to-Image Generation Modal */}
      <ImageToImageModal
        isOpen={!!imageToImageModalItem}
        onClose={() => setImageToImageModalItem(null)}
        sourceImage={imageToImageModalItem}
        onSaveGeneratedImage={(newImg) => {
          setImages((prev) => [newImg, ...prev]);
        }}
        showToast={showToast}
      />
    </div>
  );
};
