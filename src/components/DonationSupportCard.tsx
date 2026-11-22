import React, { useState } from 'react';
import {
  Heart,
  Coffee,
  Copy,
  Check,
  QrCode,
  Landmark,
  Mail,
  Gift
} from 'lucide-react';
import {
  ADMIN_OWNER_EMAIL,
  DONATION_BANK_INFO,
  buildDonationVietQrUrl
} from '../utils/subscriptionPlans';

interface DonationSupportCardProps {
  compact?: boolean;
  suggestedAmountVnd?: number;
  suggestedTransferNote?: string;
  onShowToast?: (msg: string) => void;
  defaultShowQr?: boolean;
}

export const DonationSupportCard: React.FC<DonationSupportCardProps> = ({
  compact = false,
  suggestedAmountVnd,
  suggestedTransferNote,
  onShowToast,
  defaultShowQr = false
}) => {
  const [copiedField, setCopiedField] = useState<'account' | 'note' | null>(null);
  const [showQr, setShowQr] = useState<boolean>(defaultShowQr);
  const [qrFailed, setQrFailed] = useState<boolean>(false);

  const transferNote = suggestedTransferNote || DONATION_BANK_INFO.defaultTransferNote;
  const qrUrl = buildDonationVietQrUrl(suggestedAmountVnd, transferNote);

  const handleCopy = async (value: string, field: 'account' | 'note', label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      onShowToast?.(`📋 Đã sao chép ${label}: ${value}`);
      setTimeout(() => setCopiedField(null), 2200);
    } catch {
      onShowToast?.(`${label}: ${value}`);
    }
  };

  return (
    <section
      className={`bg-gradient-to-br from-amber-50 via-rose-50/40 to-emerald-50/70 border border-amber-200/90 rounded-2xl ${
        compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-4'
      } text-xs shadow-2xs`}
    >
      {/* Top heading + meaningful mission */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shrink-0 shadow-xs">
          <Heart className="w-4 h-4 fill-white/25" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-extrabold text-slate-900 ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {DONATION_BANK_INFO.title}
            </h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <Gift className="w-3 h-3" />
              Hoàn toàn tự nguyện
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed text-[11.5px]">
            SmartPlan GDTC Pro được chia sẻ miễn phí cho cộng đồng giáo viên Giáo dục Thể chất. Nếu thầy cô thấy công cụ hữu ích và muốn ủng hộ tùy tâm, kinh phí đóng góp sẽ được ưu tiên cho{' '}
            <strong className="text-slate-900">
              duy trì vận hành hệ thống/AI và mua sắm dụng cụ tập luyện, phần quà khích lệ, hỗ trợ học sinh có hoàn cảnh khó khăn
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Bank Account Details + Optional QR */}
      <div className={`grid grid-cols-1 ${showQr && !qrFailed ? 'md:grid-cols-12' : ''} gap-3 items-center`}>
        <div
          className={`${
            showQr && !qrFailed ? 'md:col-span-7' : ''
          } bg-white/95 rounded-xl border border-amber-200/80 p-3.5 space-y-2.5 shadow-2xs`}
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-800 text-xs">
              <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ngân hàng: {DONATION_BANK_INFO.bankName}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              VCB · 24/7
            </span>
          </div>

          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-slate-500">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-extrabold tracking-wider text-slate-900 select-all">
                  {DONATION_BANK_INFO.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(DONATION_BANK_INFO.accountNumber, 'account', 'Số tài khoản Vietcombank')
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] transition"
                >
                  {copiedField === 'account' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedField === 'account' ? 'Đã chép' : 'Sao chép STK'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <span className="font-extrabold text-slate-900 tracking-wide">
                {DONATION_BANK_INFO.accountHolder}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-slate-500">Nội dung chuyển khoản gợi ý:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded select-all">
                  {transferNote}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(transferNote, 'note', 'Nội dung chuyển khoản')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10.5px] transition shrink-0"
                  title="Sao chép nội dung chuyển khoản"
                >
                  {copiedField === 'note' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedField === 'note' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <button
              type="button"
              onClick={() => {
                setQrFailed(false);
                setShowQr((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr && !qrFailed ? 'Ẩn mã QR VietQR' : 'Quét mã QR chuyển khoản nhanh'}</span>
            </button>

            <a
              href={`mailto:${ADMIN_OWNER_EMAIL}?subject=${encodeURIComponent(
                '[SmartPlan GDTC Pro] Chia sẻ & Ủng hộ duy trì hệ thống'
              )}&body=${encodeURIComponent(
                'Kính gửi thầy Lê Quốc Hưng,\n\nTôi vừa gửi chút tấm lòng ủng hộ duy trì SmartPlan GDTC Pro và quỹ mua quà, dụng cụ tập luyện hỗ trợ các em học sinh khó khăn.\n\nChúc thầy nhiều sức khỏe và tiếp tục lan tỏa giá trị cho cộng đồng giáo viên GDTC!'
              )}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 font-semibold text-[11px] transition"
            >
              <Mail className="w-3.5 h-3.5 text-rose-500" />
              <span>Gửi lời nhắn tới tác giả</span>
            </a>
          </div>
        </div>

        {/* Optional VietQR Code Preview */}
        {showQr && !qrFailed && (
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-white rounded-xl border border-emerald-200 p-3 shadow-2xs">
            <img
              src={qrUrl}
              alt={`Mã QR Vietcombank ${DONATION_BANK_INFO.accountNumber} - ${DONATION_BANK_INFO.accountHolder}`}
              onError={() => setQrFailed(true)}
              className="w-44 h-auto rounded-lg object-contain"
              loading="lazy"
            />
            <p className="text-[10.5px] text-slate-500 mt-1.5 text-center leading-snug">
              Mở app Ngân hàng bất kỳ để quét VietQR ·{' '}
              <strong className="text-slate-700">{DONATION_BANK_INFO.bankName}</strong>
            </p>
          </div>
        )}
      </div>

      {!compact && (
        <p className="text-[11px] text-amber-900/80 flex items-center gap-1.5 leading-relaxed">
          <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Trân trọng cảm ơn tấm lòng của Quý thầy cô — mỗi sự đồng hành là nguồn động lực và những món quà thiết thực gửi tới học sinh thân yêu!
          </span>
        </p>
      )}
    </section>
  );
};
