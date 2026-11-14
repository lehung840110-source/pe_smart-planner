import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  School,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSchoolName?: string;
  defaultTeacherName?: string;
  initialMode?: 'login' | 'register';
  gateReason?: string | null;
  onAuthSuccess: (mode: 'login' | 'register') => Promise<void> | void;
  onManualSyncUp: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultSchoolName = '',
  defaultTeacherName = '',
  initialMode = 'login',
  gateReason = null,
  onAuthSuccess,
  onManualSyncUp,
  showToast
}) => {
  const { user, isSyncing, lastSyncedAt, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(defaultTeacherName);
  const [schoolName, setSchoolName] = useState(defaultSchoolName);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận chưa trùng khớp.');
        return;
      }
      setIsSubmitting(true);
      const res = await register({
        email: email.trim(),
        password,
        fullName: fullName.trim() || defaultTeacherName || 'Giáo viên GDTC',
        schoolName: schoolName.trim() || defaultSchoolName || 'TRƯỜNG TIỂU HỌC & THCS'
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Đăng ký thất bại.');
        return;
      }
      await onAuthSuccess('register');
      showToast(`🎉 Đăng ký thành công! Xin chào thầy/cô ${res.user?.fullName || email}.`);
      onClose();
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Đăng nhập thất bại.');
      return;
    }
    await onAuthSuccess('login');
    showToast(`✅ Đăng nhập thành công! Đã đồng bộ hồ sơ giáo án của ${res.user?.fullName || email}.`);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    showToast('Đã đăng xuất khỏi tài khoản.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {user ? 'Tài Khoản Giáo Viên & Đồng Bộ' : 'Đăng Nhập / Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Lưu trữ giáo án, mẫu riêng và lịch sử phiên bản theo từng tài khoản
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {user ? (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Đang đăng nhập
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {user.role === 'admin' ? 'Quản trị / Tổ trưởng' : 'Giáo viên'}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 pt-1">{user.fullName}</p>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-slate-600 font-medium">{user.schoolName}</p>
              {lastSyncedAt && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã đồng bộ lần cuối: {new Date(lastSyncedAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  await onManualSyncUp();
                }}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Lưu & Đồng Bộ Giáo Án Lên Tài Khoản Ngay</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {gateReason && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-amber-900">Mở khóa toàn bộ tính năng thành viên</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Vui lòng đăng nhập hoặc đăng ký tài khoản miễn phí để sử dụng: <strong>{gateReason}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Switch Mode Tabs */}
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  mode === 'register' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng Ký Tài Khoản</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email giáo viên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu: lehung84@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ và tên giáo viên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ví dụ: Lê Quốc Hưng"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Đơn vị / Trường học
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="TRƯỜNG TIỂU HỌC & THCS ..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nhập lại mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition ${
                mode === 'register'
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'register' ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{mode === 'register' ? 'Tạo Tài Khoản & Đăng Nhập' : 'Đăng Nhập Ngay'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
