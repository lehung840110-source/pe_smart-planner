import React, { useState, useEffect } from 'react';
import { X, Check, BookPlus, Sparkles, Loader2 } from 'lucide-react';
import { ScenarioItem } from '../types/gdtc';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioToEdit?: ScenarioItem | null;
  onSave: (scenario: ScenarioItem) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  scenarioToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<ScenarioItem>({
    id: '',
    title: '',
    category: 'Động tác mới',
    grade: 'Chung',
    lvd: "5 - 7'",
    gv: '',
    hs: ''
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (scenarioToEdit) {
      setFormData(scenarioToEdit);
    } else {
      setFormData({
        id: 'sc_' + Date.now(),
        title: '',
        category: 'Động tác mới',
        grade: 'Chung',
        lvd: "5 - 7'",
        gv: '',
        hs: ''
      });
    }
  }, [scenarioToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập Tên kịch bản hoặc tên động tác trước khi dùng AI!');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          grade: formData.grade,
        }),
      });

      const data = await res.json();
      if (data.success && data.scenario) {
        setFormData((prev) => ({
          ...prev,
          lvd: data.scenario.lvd || prev.lvd,
          gv: data.scenario.gv || prev.gv,
          hs: data.scenario.hs || prev.hs,
        }));
      }
    } catch (err) {
      console.warn('AI scenario generate notice:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Vui lòng nhập tên kịch bản!');
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              {scenarioToEdit ? 'Chỉnh Sửa Kịch Bản Giảng Dạy' : 'Thêm Kịch Bản Mới Vào Thư Viện'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Tên Kịch Bản / Tên Hoạt Động
              </label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>AI Đang Soạn...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>AI Soạn Chi Tiết</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Động tác Tay - Hướng dẫn kỹ thuật nhịp 1-4"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại Hoạt Động</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="Động tác mới">Động tác mới (Khám phá)</option>
                <option value="Luyện tập">Luyện tập (Tổ / Cặp đôi)</option>
                <option value="Trò chơi">Trò chơi vận động</option>
                <option value="Mở đầu">Mở đầu & Khởi động</option>
                <option value="Hồi tĩnh">Hồi tĩnh & Thả lỏng</option>
                <option value="Vận dụng">Vận dụng & Tích hợp BVMT</option>
                <option value="Tích hợp">Tích hợp KNS & An toàn</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối Lớp Áp Dụng</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="Chung">Tất cả các khối</option>
                <option value="1">Khối 1</option>
                <option value="2">Khối 2</option>
                <option value="3">Khối 3</option>
                <option value="4">Khối 4</option>
                <option value="5">Khối 5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội Dung Hoạt Động (Cột 1 - Động tác mới, luật chơi, nhận lớp, hồi tĩnh)
            </label>
            <textarea
              rows={2}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="VD: 1.1 Nhận lớp: Kiểm tra vệ sinh sân tập... hoặc Tên trò chơi, luật chơi..."
              className="w-full border border-slate-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lượng Vận Động (Cột 2 - LVĐ)</label>
            <input
              type="text"
              value={formData.lvd}
              onChange={(e) => setFormData({ ...formData, lvd: e.target.value })}
              placeholder="VD: 5 - 7', 2 - 3 lần, 2Lx8N"
              className="w-full border border-slate-300 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kịch Bản Giáo Viên (Cột 3 - Lời giảng, khẩu lệnh, thị phạm, sửa sai)
            </label>
            <textarea
              rows={4}
              value={formData.gv}
              onChange={(e) => setFormData({ ...formData, gv: e.target.value })}
              placeholder="- GV làm mẫu chuẩn xác 2-3 lần...&#10;- Hô nhịp dứt khoát..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kịch Bản Học Sinh (Cột 4 - Đội hình, động tác, phản hồi, cặp đôi)
            </label>
            <textarea
              rows={4}
              value={formData.hs}
              onChange={(e) => setFormData({ ...formData, hs: e.target.value })}
              placeholder="- Đội hình 4 hàng ngang cự ly 1 sải tay...&#10;- Quan sát mẫu và tập luyện..."
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Check className="w-4 h-4" />
              <span>{scenarioToEdit ? 'Cập Nhật Kịch Bản' : 'Lưu Vào Thư Viện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
