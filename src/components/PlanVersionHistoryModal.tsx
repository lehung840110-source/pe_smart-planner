import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Star,
  RotateCcw,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  FileEdit,
  ArrowRight
} from 'lucide-react';
import { MasterPlanItem } from '../data/masterTemplateTuan8';
import {
  LessonPlanVersion,
  PlanVersionStore,
  computePlanDiff,
  formatDateTimeVi,
  formatRelativeTimeVi,
  getBestVersionForPlan,
  getPlanVersionKey,
  getPreferredVersionForPlan,
  getVersionsForPlan
} from '../utils/planVersionHistory';

interface PlanVersionTargetOption {
  week: number;
  grade: 1 | 3 | 5;
  lessonNum: number;
  title: string;
  currentPlan: MasterPlanItem;
  defaultBaselinePlan?: MasterPlanItem | null;
}

interface PlanVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: PlanVersionStore;
  targets: PlanVersionTargetOption[];
  initialTargetKey?: string;
  onSaveNewVersion: (
    plan: MasterPlanItem,
    customLabel?: string,
    markAsBest?: boolean,
    baselinePlan?: MasterPlanItem | null
  ) => void;
  onLoadVersion: (planKey: string, versionId: string) => void;
  onToggleBest: (planKey: string, versionId: string) => void;
  onDeleteVersion: (planKey: string, versionId: string) => void;
  onResetToDefaultBaseline?: (target: PlanVersionTargetOption) => void;
}

export const PlanVersionHistoryModal: React.FC<PlanVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  store,
  targets,
  initialTargetKey,
  onSaveNewVersion,
  onLoadVersion,
  onToggleBest,
  onDeleteVersion,
  onResetToDefaultBaseline
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (initialTargetKey && targets.some((t) => getPlanVersionKey(t.week, t.grade, t.lessonNum) === initialTargetKey)) {
      return initialTargetKey;
    }
    const first = targets[0];
    return first ? getPlanVersionKey(first.week, first.grade, first.lessonNum) : '';
  });

  const [newVersionLabel, setNewVersionLabel] = useState<string>('');
  const [expandedDiffIds, setExpandedDiffIds] = useState<Record<string, boolean>>({});
  const [compareBaselineId, setCompareBaselineId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTargetKey) {
      setSelectedKey(initialTargetKey);
    }
  }, [isOpen, initialTargetKey]);

  const activeTarget = useMemo(() => {
    return (
      targets.find((t) => getPlanVersionKey(t.week, t.grade, t.lessonNum) === selectedKey) ||
      targets[0] ||
      null
    );
  }, [targets, selectedKey]);

  const activePlanKey = activeTarget
    ? getPlanVersionKey(activeTarget.week, activeTarget.grade, activeTarget.lessonNum)
    : '';

  const versions = useMemo(() => {
    if (!activeTarget) return [];
    return getVersionsForPlan(store, activeTarget.week, activeTarget.grade, activeTarget.lessonNum);
  }, [store, activeTarget]);

  const preferredVersion = useMemo(() => {
    if (!activeTarget) return null;
    return getPreferredVersionForPlan(store, activeTarget.week, activeTarget.grade, activeTarget.lessonNum);
  }, [store, activeTarget]);

  const bestVersion = useMemo(() => {
    if (!activeTarget) return null;
    return getBestVersionForPlan(store, activeTarget.week, activeTarget.grade, activeTarget.lessonNum);
  }, [store, activeTarget]);

  const liveDiffVsDefault = useMemo(() => {
    if (!activeTarget?.defaultBaselinePlan || !activeTarget.currentPlan) return null;
    return computePlanDiff(activeTarget.defaultBaselinePlan, activeTarget.currentPlan);
  }, [activeTarget]);

  if (!isOpen || !activeTarget) return null;

  const toggleExpandDiff = (versionId: string) => {
    setExpandedDiffIds((prev) => ({ ...prev, [versionId]: !prev[versionId] }));
  };

  const handleSaveCheckpoint = (markBest: boolean) => {
    onSaveNewVersion(
      activeTarget.currentPlan,
      newVersionLabel.trim() || undefined,
      markBest,
      activeTarget.defaultBaselinePlan
    );
    setNewVersionLabel('');
  };

  const renderStatusText = (v: LessonPlanVersion, isCurrentlyLoaded: boolean) => {
    const parts: string[] = [];
    if (isCurrentlyLoaded) parts.push('Đang hiển thị');
    if (v.isStarredBest || v.status === 'best') parts.push('Hoàn hảo nhất');
    else if (v.status === 'draft') parts.push('Bản nháp đang sửa dở');
    else parts.push('Đã lưu chính thức');
    return parts.join(' · ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">Lịch Sử Phiên Bản & Tiếp Tục Bản Nháp</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Mặc định luôn mở phiên bản chỉnh sửa gần nhất · Khôi phục hoặc chọn bản hoàn hảo nhất bất kỳ lúc nào
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Lesson Selector (when multiple lessons exist in Tab 6) */}
        {targets.length > 1 && (
          <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Chọn tiết giáo án:</span>
            <div className="flex items-center gap-1.5">
              {targets.map((t) => {
                const k = getPlanVersionKey(t.week, t.grade, t.lessonNum);
                const count = getVersionsForPlan(store, t.week, t.grade, t.lessonNum).length;
                const active = k === activePlanKey;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSelectedKey(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition tabular-nums ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    K{t.grade} · Tiết {t.lessonNum} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Lesson Info + Save New Version Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs text-slate-500 tabular-nums">
                Tuần {activeTarget.week} · Khối {activeTarget.grade} · Tiết PPCT {activeTarget.lessonNum} · {versions.length} phiên bản đã lưu
              </div>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {activeTarget.currentPlan.title || activeTarget.title}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {bestVersion && bestVersion.versionId !== preferredVersion?.versionId && (
                <button
                  type="button"
                  onClick={() => onLoadVersion(activePlanKey, bestVersion.versionId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Tải bản hoàn hảo nhất (v{bestVersion.versionNumber})</span>
                </button>
              )}

              {activeTarget.defaultBaselinePlan && liveDiffVsDefault && liveDiffVsDefault.diffDetails.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setCompareBaselineId((prev) => (prev === activePlanKey ? null : activePlanKey))
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 whitespace-nowrap shrink-0 transition"
                >
                  {compareBaselineId === activePlanKey ? 'Ẩn đối chiếu bản gốc' : `Đã sửa ${liveDiffVsDefault.changeSummary.length} mục so với gốc`}
                </button>
              )}
            </div>
          </div>

          {/* Save explicit named checkpoint */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newVersionLabel}
              onChange={(e) => setNewVersionLabel(e.target.value)}
              placeholder="Ghi chú phiên bản (vd: Đã sửa ảnh động tác & Cột GV, Bản nộp BGH...)"
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSaveCheckpoint(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thành phiên bản mới</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveCheckpoint(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Lưu & Chọn Hoàn Hảo Nhất</span>
              </button>
            </div>
          </div>

          {/* Optional diff against factory baseline */}
          {compareBaselineId === activePlanKey && liveDiffVsDefault && (
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
              <div className="text-xs font-bold text-slate-800">
                Tổng hợp thay đổi hiện tại so với bản gốc mặc định ({liveDiffVsDefault.diffDetails.length} điểm khác):
              </div>
              <div className="space-y-1.5">
                {liveDiffVsDefault.diffDetails.map((d) => (
                  <div key={d.id} className="text-[11px] border-t border-slate-100 pt-1.5 grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-3 font-semibold text-slate-700">{d.label}</div>
                    <div className="md:col-span-4 text-slate-500 bg-slate-50 p-1.5 rounded break-words">
                      <span className="font-semibold text-slate-600">Gốc: </span>
                      {d.before}
                    </div>
                    <div className="md:col-span-5 text-slate-900 bg-emerald-50/60 p-1.5 rounded break-words">
                      <span className="font-semibold text-emerald-700">Hiện tại: </span>
                      {d.after}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Version Timeline List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {versions.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
              <History className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Chưa có lịch sử chỉnh sửa nào cho tiết dạy này
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Ngay khi Thầy/Cô chỉnh sửa nội dung, đổi ảnh hoặc nhấn nút Lưu bên trên, hệ thống sẽ tự động lưu bản nháp và ghi rõ từng thay đổi để không bao giờ bị mất bài.
              </p>
            </div>
          ) : (
            versions.map((v, idx) => {
              const isLoaded = preferredVersion?.versionId === v.versionId;
              const isExpanded = Boolean(expandedDiffIds[v.versionId]);
              const isDraft = v.status === 'draft';
              const isBest = v.isStarredBest || v.status === 'best';

              return (
                <div
                  key={v.versionId}
                  className={`rounded-xl border p-4 transition ${
                    isLoaded
                      ? 'border-blue-500 bg-blue-50/30'
                      : isBest
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 tabular-nums">
                        <span className="font-bold text-slate-900">Phiên bản #{v.versionNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            isBest
                              ? 'text-amber-700'
                              : isDraft
                              ? 'text-blue-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isBest ? (
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ) : isDraft ? (
                            <FileEdit className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {renderStatusText(v, isLoaded)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTimeVi(v.updatedAt)} ({formatRelativeTimeVi(v.updatedAt)})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{v.sourceTab === 'tab-generator' ? 'Sửa ở Tab 5' : 'Sửa ở Tab 6'}</span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">
                        {v.label || v.title}
                      </div>

                      {/* Human-readable Change Summary */}
                      {v.changeSummary && v.changeSummary.length > 0 && (
                        <ul className="text-xs text-slate-700 space-y-0.5 pt-1">
                          {v.changeSummary.map((line, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <ArrowRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleBest(activePlanKey, v.versionId)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          isBest
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-amber-800'
                        }`}
                        title={isBest ? 'Bỏ đánh dấu hoàn hảo nhất' : 'Chọn phiên bản này làm bản hoàn hảo nhất'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isBest ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        <span>{isBest ? 'Hoàn hảo nhất' : 'Chọn hoàn hảo'}</span>
                      </button>

                      {!isLoaded && (
                        <button
                          type="button"
                          onClick={() => {
                            onLoadVersion(activePlanKey, v.versionId);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 whitespace-nowrap shrink-0 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isDraft ? 'Tiếp tục bản nháp này' : 'Tải lại phiên bản này'}</span>
                        </button>
                      )}

                      {v.diffDetails && v.diffDetails.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandDiff(v.versionId)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 whitespace-nowrap shrink-0 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>Chi tiết ({v.diffDetails.length})</span>
                        </button>
                      )}

                      {versions.length > 1 && !isLoaded && (
                        <button
                          type="button"
                          onClick={() => onDeleteVersion(activePlanKey, v.versionId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Xóa phiên bản cũ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Before/After Diff */}
                  {isExpanded && v.diffDetails && v.diffDetails.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      {v.diffDetails.map((d) => (
                        <div
                          key={d.id}
                          className="text-[11px] bg-slate-50 rounded-lg border border-slate-200 p-2.5 grid grid-cols-1 md:grid-cols-12 gap-2"
                        >
                          <div className="md:col-span-3">
                            <div className="text-[10px] text-slate-500">{d.section}</div>
                            <div className="font-bold text-slate-800">{d.label}</div>
                          </div>
                          <div className="md:col-span-4 bg-white border border-slate-200 rounded p-2 text-slate-600 break-words">
                            <div className="text-[10px] font-semibold text-slate-400 mb-0.5">Trước khi sửa:</div>
                            {d.before}
                          </div>
                          <div className="md:col-span-5 bg-emerald-50/70 border border-emerald-200 rounded p-2 text-slate-900 break-words">
                            <div className="text-[10px] font-semibold text-emerald-700 mb-0.5">Sau khi sửa:</div>
                            {d.after}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Mọi chỉnh sửa đều được tự động lưu nháp liên tục vào bộ nhớ trình duyệt (IndexedDB + Local Mirror).
          </div>
          <div className="flex items-center gap-2">
            {onResetToDefaultBaseline && activeTarget.defaultBaselinePlan && (
              <button
                type="button"
                onClick={() => {
                  onResetToDefaultBaseline(activeTarget);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 whitespace-nowrap shrink-0 transition"
                title="Tạo một bản khôi phục từ mẫu gốc (không xóa các phiên bản cũ trong lịch sử)"
              >
                Khôi phục về bản gốc mặc định
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap shrink-0 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
