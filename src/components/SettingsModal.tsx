import React, { useState } from 'react';
import { X, Check, School, User, Award } from 'lucide-react';
import { SchoolSettings } from '../types/gdtc';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSave: (newSettings: SchoolSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [form, setForm] = useState<SchoolSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Cài Đặt Thông Tin Đơn Vị & Giáo Viên</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Đơn Vị / Trường Học</label>
            <input
              type="text"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
              placeholder="VD: TRƯỜNG TIỂU HỌC NGHĨA HIỆP"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tổ Chuyên Môn</label>
              <input
                type="text"
                value={form.departmentName}
                onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                placeholder="VD: TỔ TIỂU HỌC"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Năm Học</label>
              <input
                type="text"
                value={form.schoolYear}
                onChange={(e) => setForm({ ...form, schoolYear: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                placeholder="VD: 2026 - 2027"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ & Tên Giáo Viên Giảng Dạy</label>
            <input
              type="text"
              value={form.teacherName}
              onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-semibold text-blue-900"
              placeholder="VD: LÊ QUỐC HƯNG"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Cán Bộ Duyệt Giáo Án
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Ban Giám Hiệu duyệt</label>
                <input
                  type="text"
                  value={form.approverPrincipal}
                  onChange={(e) => setForm({ ...form, approverPrincipal: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  placeholder="VD: Võ Thị Thuận"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Tổ Trưởng duyệt</label>
                <input
                  type="text"
                  value={form.approverHead}
                  onChange={(e) => setForm({ ...form, approverHead: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                  placeholder="VD: Bùi Ngọc Lâm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Check className="w-4 h-4" /> Lưu Thiết Lập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
