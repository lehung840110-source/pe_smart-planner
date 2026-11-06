import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  Sparkles,
  BookCheck,
  Info,
  ShieldCheck,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { MasterPlanItem, masterPlansTuan8, normalizeMasterPlan } from '../data/masterTemplateTuan8';
import { LessonRow, SgkImageItem } from '../types/gdtc';
import { SelectFormationModal } from './SelectFormationModal';
import { SelectMovementImageModal } from './SelectMovementImageModal';
import { FormationDiagram } from '../data/formationDiagrams';

interface TabExtractSampleProps {
  currentMasterPlan: MasterPlanItem;
  setCurrentMasterPlan: React.Dispatch<React.SetStateAction<MasterPlanItem>>;
  userImages: SgkImageItem[];
  onApplyMasterToGenerator: (plan: MasterPlanItem) => void;
  showToast: (msg: string) => void;
}

export const TabExtractSample: React.FC<TabExtractSampleProps> = ({
  currentMasterPlan,
  setCurrentMasterPlan,
  userImages,
  onApplyMasterToGenerator,
  showToast,
}) => {
  const plan = normalizeMasterPlan(currentMasterPlan);
  const [selectedKey, setSelectedKey] = useState<string>('k1_t15');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showObjectivesAccordion, setShowObjectivesAccordion] = useState<boolean>(false);

  // Modals for picking formation or movement image
  const [targetRowForFormation, setTargetRowForFormation] = useState<number | null>(null);
  const [targetRowForImage, setTargetRowForImage] = useState<number | null>(null);

  // Load a preset master plan from Tuần 8
  const handleSelectPreset = (key: string) => {
    setSelectedKey(key);
    const chosen = masterPlansTuan8[key];
    if (chosen) {
      setCurrentMasterPlan(normalizeMasterPlan(chosen));
      showToast(`Đã tải Giáo án mẫu Tuần 8 - Khối ${chosen.grade} (Tiết ${chosen.lessonNum})`);
    }
  };

  // Revert back to original PDF state for current selected key
  const handleResetToOriginal = () => {
    if (
      window.confirm(
        'Khôi phục giáo án mẫu này về đúng nguyên bản 100% từ file PDF của thầy Lê Quốc Hưng (Trường TH & THCS Nghĩa Hiệp)?'
      )
    ) {
      const orig = masterPlansTuan8[selectedKey] || masterPlansTuan8.k1_t15;
      setCurrentMasterPlan(normalizeMasterPlan(orig));
      showToast('Đã khôi phục nguyên bản giáo án mẫu Tuần 8 Nghĩa Hiệp!');
    }
  };

  // Save current modifications as default template
  const handleSaveMasterTemplate = () => {
    setIsEditMode(false);
    showToast('✨ Đã lưu trực tiếp vào Giáo án mẫu! Các bài dạy tiếp theo sẽ tuân thủ theo mẫu này.');
  };

  // Edit table row fields
  const handleUpdateRow = (idx: number, field: keyof LessonRow, value: string) => {
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      const updatedRows = [...safe.rows];
      updatedRows[idx] = {
        ...updatedRows[idx],
        [field]: value,
      };
      return { ...safe, rows: updatedRows };
    });
  };

  // Add new row
  const handleAddRow = () => {
    const newRow: LessonRow = {
      content: 'Hoạt động bổ sung mới',
      lvd: "3 - 5'",
      gv: '- GV hướng dẫn nội dung.',
      hs: '- HS tập trung thực hiện.',
    };
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      return {
        ...safe,
        rows: [...safe.rows, newRow],
      };
    });
    showToast('Đã thêm 1 dòng hoạt động mới vào giáo án mẫu!');
  };

  // Delete row
  const handleDeleteRow = (idx: number) => {
    if (plan.rows.length <= 1) {
      showToast('Giáo án phải có ít nhất 1 dòng hoạt động!');
      return;
    }
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      return {
        ...safe,
        rows: safe.rows.filter((_, i) => i !== idx),
      };
    });
    showToast('Đã xóa dòng hoạt động khỏi giáo án mẫu.');
  };

  // Move row up/down
  const handleMoveRow = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= plan.rows.length) return;

    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      const updated = [...safe.rows];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...safe, rows: updated };
    });
  };

  // Attach formation to Column 4
  const handleSelectFormation = (rowIndex: number, formation: FormationDiagram) => {
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      const updatedRows = [...safe.rows];
      if (updatedRows[rowIndex]) {
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          hsImgUrl: formation.svgDataUrl,
          hsImgTitle: formation.name,
        };
      }
      return { ...safe, rows: updatedRows };
    });
    showToast(`Đã gắn "${formation.name}" vào Cột Hoạt Động HS dòng ${rowIndex + 1}!`);
  };

  // Attach movement image to Column 1
  const handleSelectMovementImage = (
    rowIndex: number,
    imgUrl: string,
    title: string
  ) => {
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      const updatedRows = [...safe.rows];
      if (updatedRows[rowIndex]) {
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          contentImgUrl: imgUrl,
          contentImgTitle: title,
        };
      }
      return { ...safe, rows: updatedRows };
    });
    showToast(`Đã gắn ảnh kỹ thuật "${title}" vào Cột Nội Dung dòng ${rowIndex + 1}!`);
  };

  // Remove attached image from Column 1 or 4
  const handleRemoveImage = (rowIndex: number, col: 'content' | 'hs') => {
    setCurrentMasterPlan((prev) => {
      const safe = normalizeMasterPlan(prev);
      const updatedRows = [...safe.rows];
      if (col === 'content') {
        delete updatedRows[rowIndex].contentImgUrl;
        delete updatedRows[rowIndex].contentImgTitle;
      } else {
        delete updatedRows[rowIndex].hsImgUrl;
        delete updatedRows[rowIndex].hsImgTitle;
      }
      return { ...safe, rows: updatedRows };
    });
    showToast('Đã gỡ ảnh khỏi dòng này.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Center */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Mẫu Mặc Định Hệ Thống
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">
              Trường TH & THCS Nghĩa Hiệp (Lê Quốc Hưng)
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600 w-5 h-5 shrink-0" />
            Giáo Án Mẫu Mặc Định & Công Cụ Sửa Trực Tiếp
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Bộ giáo án này là <strong>chuẩn mực mặc định</strong> dùng để sinh giáo án mới cho các tuần tiếp theo. Mọi chỉnh sửa ở đây sẽ được kế thừa toàn vẹn.
          </p>
        </div>

        {/* Master Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <select
            value={selectedKey}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
          >
            <option value="k1_t15">Khối 1 · Tiết 15: Vươn thở, Tay (Tiết 1)</option>
            <option value="k1_t16">Khối 1 · Tiết 16: Vươn thở, Tay (Tiết 2)</option>
            <option value="k3_t15">Khối 3 · Tiết 15: Đi đều, Đứng lại (Tiết 3)</option>
            <option value="k3_t16">Khối 3 · Tiết 16: Đi đều, Đứng lại (Tiết 4 - Ôn tập)</option>
            <option value="k5_t15">Khối 5 · Tiết 15: Vươn thở, Tay, Chân với gậy (Tiết 1)</option>
            <option value="k5_t16">Khối 5 · Tiết 16: Vươn thở, Tay, Chân với gậy (Tiết 2)</option>
          </select>

          {/* Toggle Edit Mode */}
          <button
            onClick={() => {
              if (isEditMode) {
                handleSaveMasterTemplate();
              } else {
                setIsEditMode(true);
                showToast('Đã bật chế độ Sửa Trực Tiếp. Bạn có thể gõ chỉnh sửa mọi ô trong bảng!');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs ${
              isEditMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isEditMode ? (
              <>
                <Save className="w-3.5 h-3.5" /> Lưu Thay Đổi Vào Mẫu
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-amber-700" /> Sửa Trực Tiếp Vào Mẫu
              </>
            )}
          </button>

          {/* Reset to Original Button */}
          <button
            onClick={handleResetToOriginal}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-medium transition"
            title="Khôi phục nguyên bản giáo án PDF Nghĩa Hiệp"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Send to Generator */}
          <button
            onClick={() => {
              onApplyMasterToGenerator(currentMasterPlan);
              showToast('Đã chuyển sang Tab Sinh Giáo Án với mẫu chuẩn này!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Wand2 className="w-3.5 h-3.5" /> Sinh Giáo Án Tuần Tiếp
          </button>
        </div>
      </div>

      {/* Edit Mode Notice Bar */}
      {isEditMode && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ Sửa Trực Tiếp đang bật:</strong> Bạn có thể sửa trực tiếp văn bản trong 4 cột, gắn thêm hình ảnh kỹ thuật SGK, hoặc đổi sơ đồ đội hình. Nhớ bấm nút <strong>Lưu Thay Đổi</strong> sau khi chỉnh sửa.
            </span>
          </div>
          <button
            onClick={handleAddRow}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-1 text-[11px] shrink-0"
          >
            <Plus className="w-3 h-3" /> Thêm Dòng Hoạt Động
          </button>
        </div>
      )}

      {/* Accordion: Header & Objectives Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowObjectivesAccordion(!showObjectivesAccordion)}
          className="w-full p-4 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-200 flex justify-between items-center text-left transition"
        >
          <div className="flex items-center gap-2">
            <BookCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs text-slate-800">
              I. YÊU CẦU CẦN ĐẠT & TÍCH HỢP NĂNG LỰC SỐ ({plan.integrations.digitalSkill})
            </span>
            <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
              Chuẩn GDPT 2018
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
            <span>{showObjectivesAccordion ? 'Thu gọn' : 'Xem & Sửa Mục Tiêu'}</span>
            {showObjectivesAccordion ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showObjectivesAccordion && (
          <div className="p-5 space-y-4 text-xs bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Năng lực đặc thù */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs">1. Năng lực đặc thù</h4>
                {isEditMode ? (
                  <>
                    <label className="block text-[11px] text-slate-600 font-medium">
                      Chăm sóc sức khỏe:
                    </label>
                    <textarea
                      rows={2}
                      value={plan.specialCompetencies.healthCare}
                      onChange={(e) =>
                        setCurrentMasterPlan((prev) => {
                          const safe = normalizeMasterPlan(prev);
                          return {
                            ...safe,
                            specialCompetencies: {
                              ...safe.specialCompetencies,
                              healthCare: e.target.value,
                            },
                          };
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />

                    <label className="block text-[11px] text-slate-600 font-medium mt-1">
                      Vận động cơ bản & Thể dục thể thao:
                    </label>
                    <textarea
                      rows={2}
                      value={plan.specialCompetencies.basicMovement}
                      onChange={(e) =>
                        setCurrentMasterPlan((prev) => {
                          const safe = normalizeMasterPlan(prev);
                          return {
                            ...safe,
                            specialCompetencies: {
                              ...safe.specialCompetencies,
                              basicMovement: e.target.value,
                            },
                          };
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </>
                ) : (
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11.5px]">
                    <li>{plan.specialCompetencies.healthCare}</li>
                    <li>{plan.specialCompetencies.basicMovement}</li>
                    <li>{plan.specialCompetencies.sportsCompetency}</li>
                  </ul>
                )}
              </div>

              {/* Tích hợp năng lực số & KNS */}
              <div className="space-y-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 text-xs">
                  4. Tích Hợp Năng Lực Số & Kỹ Năng Sống
                </h4>
                {isEditMode ? (
                  <>
                    <label className="block text-[11px] text-blue-800 font-medium">
                      Mã Năng Lực Số (ví dụ: 3.1TC1a hoặc 1.1TC1a):
                    </label>
                    <input
                      type="text"
                      value={plan.integrations.digitalSkill}
                      onChange={(e) =>
                        setCurrentMasterPlan((prev) => {
                          const safe = normalizeMasterPlan(prev);
                          return {
                            ...safe,
                            integrations: { ...safe.integrations, digitalSkill: e.target.value },
                          };
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-blue-300 bg-white"
                    />

                    <label className="block text-[11px] text-blue-800 font-medium mt-1">
                      Mô tả nội dung tích hợp số:
                    </label>
                    <textarea
                      rows={2}
                      value={plan.integrations.digitalDescription}
                      onChange={(e) =>
                        setCurrentMasterPlan((prev) => {
                          const safe = normalizeMasterPlan(prev);
                          return {
                            ...safe,
                            integrations: {
                              ...safe.integrations,
                              digitalDescription: e.target.value,
                            },
                          };
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-blue-300 bg-white"
                    />
                  </>
                ) : (
                  <div className="space-y-1 text-slate-700 text-[11.5px]">
                    <p>
                      <strong>- Tích hợp năng lực số ({plan.integrations.digitalSkill}):</strong>{' '}
                      {plan.integrations.digitalDescription}
                    </p>
                    <p>
                      <strong>- Kỹ năng sống:</strong> {plan.integrations.lifeSkills}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main 4-Column Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Tiến Trình Giảng Dạy 4 Cột Quy Chuẩn (Công văn 5512)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {plan.title} · Khối {plan.grade} · Tiết {plan.lessonNum}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {plan.rows.length} mục hoạt động
            </span>
            {isEditMode && (
              <button
                onClick={handleAddRow}
                className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Dòng
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-6 text-center text-slate-400">STT</th>
                <th className="p-3 w-1/4">Cột 1: Nội Dung / Kỹ Thuật Động Tác</th>
                <th className="p-3 w-20 text-center">Cột 2: LVĐ</th>
                <th className="p-3 w-1/3">Cột 3: Hoạt Động của Giáo Viên</th>
                <th className="p-3 w-1/3">Cột 4: Hoạt Động của Học Sinh & Sơ Đồ Đội Hình</th>
                {isEditMode && <th className="p-3 w-20 text-center">Thao Tác</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {plan.rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/70 transition ${
                    isEditMode ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* STT */}
                  <td className="p-3 text-center font-bold text-slate-400 align-top">
                    {idx + 1}
                  </td>

                  {/* Cột 1: Nội dung */}
                  <td className="p-3 align-top">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={row.content}
                          onChange={(e) => handleUpdateRow(idx, 'content', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => setTargetRowForImage(idx)}
                          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          {row.contentImgUrl ? 'Đổi ảnh kỹ thuật Cột 1' : '+ Gắn ảnh kỹ thuật Cột 1'}
                        </button>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed font-semibold text-slate-900">
                        {row.content}
                      </div>
                    )}

                    {/* Image preview in Column 1 */}
                    {row.contentImgUrl && (
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <img
                          src={row.contentImgUrl}
                          alt={row.contentImgTitle || 'Ảnh kỹ thuật động tác'}
                          className="max-h-36 w-full object-contain rounded"
                        />
                        {row.contentImgTitle && (
                          <p className="text-[10px] text-slate-600 font-medium text-center mt-1">
                            {row.contentImgTitle}
                          </p>
                        )}
                        {isEditMode && (
                          <button
                            onClick={() => handleRemoveImage(idx, 'content')}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                            title="Xóa ảnh khỏi cột"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Cột 2: LVĐ */}
                  <td className="p-3 text-center align-top font-semibold text-slate-800">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={row.lvd}
                        onChange={(e) => handleUpdateRow(idx, 'lvd', e.target.value)}
                        className="w-full text-center p-1.5 text-xs rounded-lg border border-slate-300 font-bold focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px] font-bold block">
                        {row.lvd}
                      </span>
                    )}
                  </td>

                  {/* Cột 3: Hoạt động GV */}
                  <td className="p-3 align-top leading-relaxed text-slate-800">
                    {isEditMode ? (
                      <textarea
                        rows={5}
                        value={row.gv}
                        onChange={(e) => handleUpdateRow(idx, 'gv', e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <div className="whitespace-pre-line">{row.gv}</div>
                    )}
                  </td>

                  {/* Cột 4: Hoạt động HS & Sơ đồ đội hình */}
                  <td className="p-3 align-top leading-relaxed text-slate-800">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={row.hs}
                          onChange={(e) => handleUpdateRow(idx, 'hs', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => setTargetRowForFormation(idx)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 py-1 px-2 rounded-md text-[10.5px] font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <Users className="w-3 h-3 text-blue-600" />
                          {row.hsImgUrl ? 'Đổi sơ đồ đội hình Cột 4' : '+ Gắn sơ đồ đội hình Cột 4'}
                        </button>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{row.hs}</div>
                    )}

                    {/* Formation Diagram preview in Column 4 */}
                    {row.hsImgUrl && (
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <img
                          src={row.hsImgUrl}
                          alt={row.hsImgTitle || 'Sơ đồ đội hình'}
                          className="max-h-36 w-full object-contain rounded"
                        />
                        {row.hsImgTitle && (
                          <p className="text-[10px] text-slate-600 font-medium text-center mt-1">
                            {row.hsImgTitle}
                          </p>
                        )}
                        {isEditMode && (
                          <button
                            onClick={() => handleRemoveImage(idx, 'hs')}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                            title="Xóa sơ đồ khỏi cột"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Action Buttons in Edit Mode */}
                  {isEditMode && (
                    <td className="p-3 text-center align-top space-y-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMoveRow(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                          title="Lên trên"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveRow(idx, 'down')}
                          disabled={idx === currentMasterPlan.rows.length - 1}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
                          title="Xuống dưới"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info & signatures */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              Duyệt BGH: {plan.signatures.bgh}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800">
              Tổ trưởng: {plan.signatures.headTeacher}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800">
              GV: {plan.signatures.teacher}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onApplyMasterToGenerator(plan);
                showToast('Đã nạp giáo án mẫu này vào Trình Tạo Bài Dạy Mới!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-semibold shadow-2xs transition flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" /> Sử Dụng Mẫu Này Để Sinh Tuần Tiếp Theo
            </button>
          </div>
        </div>
      </div>

      {/* Select Formation Modal */}
      {targetRowForFormation !== null && (
        <SelectFormationModal
          isOpen={true}
          onClose={() => setTargetRowForFormation(null)}
          targetRowIndex={targetRowForFormation}
          onSelectFormation={handleSelectFormation}
        />
      )}

      {/* Select Movement Image Modal */}
      {targetRowForImage !== null && (
        <SelectMovementImageModal
          isOpen={true}
          onClose={() => setTargetRowForImage(null)}
          targetRowIndex={targetRowForImage}
          userImages={userImages}
          onSelectImage={handleSelectMovementImage}
        />
      )}
    </div>
  );
};
