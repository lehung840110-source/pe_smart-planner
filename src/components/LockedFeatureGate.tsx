import React from 'react';
import { Lock, UserPlus, LogIn, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface LockedFeatureGateProps {
  badgeText: string;
  title: string;
  description: string;
  highlights: string[];
  onRegister: () => void;
  onLogin: () => void;
  onFallbackTab?: () => void;
  fallbackLabel?: string;
}

export const LockedFeatureGate: React.FC<LockedFeatureGateProps> = ({
  badgeText,
  title,
  description,
  highlights,
  onRegister,
  onLogin,
  onFallbackTab,
  fallbackLabel = 'Quay về Tab 5 (Xem trước cơ bản)'
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 max-w-3xl mx-auto my-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
          <Lock className="w-7 h-7" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          {badgeText} · Tính năng dành cho Thành viên
        </span>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
          {description}
        </p>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 mt-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Sau khi đăng ký / đăng nhập miễn phí, Thầy/Cô sẽ mở khóa ngay:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={onRegister}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Tài Khoản Miễn Phí</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập Ngay</span>
          </button>

          {onFallbackTab && (
            <button
              type="button"
              onClick={onFallbackTab}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>{fallbackLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
