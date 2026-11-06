import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  ArrowRightCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScenarioItem } from '../types/gdtc';

interface TabScenarioLibraryProps {
  scenarios: ScenarioItem[];
  setScenarios: React.Dispatch<React.SetStateAction<ScenarioItem[]>>;
  onOpenAddModal: () => void;
  onEditScenario: (sc: ScenarioItem) => void;
  onInsertToLesson: (sc: ScenarioItem) => void;
  showToast: (msg: string) => void;
}

export const TabScenarioLibrary: React.FC<TabScenarioLibraryProps> = ({
  scenarios,
  setScenarios,
  onOpenAddModal,
  onEditScenario,
  onInsertToLesson,
  showToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleDelete = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    showToast('Đã xóa kịch bản khỏi thư viện!');
  };

  const filteredScenarios = scenarios.filter((sc) => {
    const matchCat = filterCategory === 'all' || sc.category === filterCategory;
    const matchGrade = filterGrade === 'all' || sc.grade === 'Chung' || sc.grade === filterGrade;
    const matchSearch =
      sc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.gv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.hs.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchGrade && matchSearch;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Động tác mới':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Luyện tập':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Trò chơi':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Mở đầu':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Tích hợp':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-blue-600 w-5 h-5" />
              Thư Viện Kịch Bản Sư Phạm GDTC Chuẩn ({scenarios.length} kịch bản)
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Lưu trữ kịch bản hoạt động của giáo viên và học sinh. Dễ dàng chèn linh hoạt vào giáo án tuần mới.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition"
          >
            <PlusCircle className="w-4 h-4" /> Thêm Kịch Bản Mới
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại Hoạt Động</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả loại hoạt động</option>
              <option value="Mở đầu">1. Khởi động & Nhận lớp</option>
              <option value="Động tác mới">2. Dạy Động tác mới</option>
              <option value="Luyện tập">3. Tổ chức Luyện tập</option>
              <option value="Trò chơi">4. Trò chơi vận động</option>
              <option value="Tích hợp">5. Tích hợp KNS & An toàn</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Khối Lớp</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="1">Khối 1</option>
              <option value="2">Khối 2</option>
              <option value="3">Khối 3</option>
              <option value="4">Khối 4</option>
              <option value="5">Khối 5</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tìm Kiếm Từ Khóa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên động tác, trò chơi, khẩu lệnh giáo viên..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 p-2 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      {filteredScenarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          Không tìm thấy kịch bản nào. Hãy bấm "Thêm Kịch Bản Mới" hoặc chuyển sang mục Giáo Án Mẫu để nạp thêm.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(
                        sc.category
                      )}`}
                    >
                      {sc.category}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Khối {sc.grade}
                    </span>
                    {sc.lvd && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        LVD: {sc.lvd}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditScenario(sc)}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-50 transition"
                      title="Sửa kịch bản"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                      title="Xóa kịch bản"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-xs leading-snug">{sc.title}</h4>

                {/* GV & HS script content */}
                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {sc.content && (
                    <div className="pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-indigo-700 block mb-0.5">Cột 1: Nội Dung Hoạt Động:</span>
                      <p className="whitespace-pre-line text-slate-800 font-medium">{sc.content}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-blue-700 block mb-0.5">Cột 3 - Hoạt Động GV:</span>
                    <p className="whitespace-pre-line text-slate-700">{sc.gv}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="font-bold text-emerald-700 block mb-0.5">Cột 4 - Hoạt Động HS:</span>
                    <p className="whitespace-pre-line text-slate-700">{sc.hs}</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onInsertToLesson(sc)}
                className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ArrowRightCircle className="w-3.5 h-3.5" /> Chèn Vào Kế Hoạch Bài Dạy Tuần Này
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
