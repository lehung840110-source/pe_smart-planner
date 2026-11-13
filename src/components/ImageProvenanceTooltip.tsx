import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, FileText, MapPin } from 'lucide-react';
import { SgkImageItem } from '../types/gdtc';
import { resolveImageUsageProvenance } from '../utils/imageProvenance';

interface ImageProvenanceTooltipProps {
  image: Partial<SgkImageItem> & { title?: string; imgUrl?: string };
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * Crisp hover popover revealed when hovering an image card/thumbnail (`group/imgtip`),
 * showing exact Grade, Textbook Page, Lesson, Academic Week(s), PPCT Period(s), and Lesson Plan Section.
 */
export const ImageProvenanceTooltip: React.FC<ImageProvenanceTooltipProps> = ({
  image,
  position = 'bottom',
  className = ''
}) => {
  const provenance = useMemo(
    () => resolveImageUsageProvenance(image),
    [
      image.id,
      image.title,
      image.grade,
      image.page,
      image.lessonId,
      image.lessonTitle,
      image.topicId,
      image.folder,
      image.category
    ]
  );

  const posClass =
    position === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <div
      role="tooltip"
      className={`pointer-events-none opacity-0 invisible group-hover/imgtip:opacity-100 group-hover/imgtip:visible transition-opacity duration-150 absolute ${posClass} z-40 w-80 max-w-[90vw] bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-[11px] leading-relaxed text-left ${className}`}
    >
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-700/80">
        <span className="font-bold text-sky-300 flex items-center gap-1 truncate">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{provenance.subFolderLabel}: {provenance.specificEntityName}</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[10px] shrink-0 tabular-nums border border-slate-700">
          Khối {provenance.grade}{provenance.page ? ` · Tr.${provenance.page}` : ''}
        </span>
      </div>

      <div className="space-y-1.5 text-[10.5px]">
        <div className="flex items-start gap-1.5 text-slate-200">
          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">Bài học: </span>
            <span className="font-semibold text-white">{provenance.lessonName}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">Dùng cho giáo án: </span>
            <span className="font-bold text-emerald-300 tabular-nums">{provenance.weekLabel}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400">Chèn vào vị trí: </span>
            <span className="font-bold text-sky-300">{provenance.slotLabel}</span>
          </div>
        </div>

        <p className="pt-1.5 mt-1.5 border-t border-slate-800 text-slate-300 text-[10px] leading-snug">
          {provenance.summaryNotice}
        </p>
      </div>
    </div>
  );
};
