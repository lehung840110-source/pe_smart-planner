import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-amber-400/50"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Chế độ Offline — Đang dùng dữ liệu &amp; bộ nhớ đệm trên máy</span>
    </div>
  );
};
