import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Layers,
  Loader2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  sanitizeOriginalHtmlPreserveAllContent,
  StoredOriginalDocument
} from '../utils/originalDocumentStore';

interface FaithfulOriginalDocumentViewerProps {
  document: StoredOriginalDocument | null;
  /** Inclusive 1-based start page for the 1 selected week/lesson */
  lockedStartPage?: number;
  /** Inclusive 1-based end page for the 1 selected week/lesson */
  lockedEndPage?: number;
  /** Selected week number (used for slicing multi-week Word/HTML/text files to strictly 1 week) */
  selectedWeekNumber?: number;
  /** Next week number (if any) to know where the selected week ends in Word/HTML/text */
  nextWeekNumber?: number;
  /** True when the original file contains multiple weeks so we slice strictly to 1 week */
  isMultiWeekDocument?: boolean;
  targetLessonLabel?: string;
}

interface PdfPageCanvasProps {
  pdfDoc: any;
  pageNumber: number;
  relativePageIndex: number;
  totalLockedPages: number;
  scale: number;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  relativePageIndex,
  totalLockedPages,
  scale
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: any = null;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;
      setRendering(true);
      setRenderError(null);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const hiDpiViewport = page.getViewport({ scale: scale * dpr });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = Math.floor(hiDpiViewport.width);
        canvas.height = Math.floor(hiDpiViewport.height);
        canvas.style.width = `${Math.floor(baseViewport.width)}px`;
        canvas.style.height = `${Math.floor(baseViewport.height)}px`;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvasContext: ctx,
          viewport: hiDpiViewport
        });
        await renderTask.promise;
        if (!cancelled) setRendering(false);
      } catch (err: any) {
        if (!cancelled && err?.name !== 'RenderingCancelledException') {
          setRenderError(err?.message || 'Không thể hiển thị trang PDF này.');
          setRendering(false);
        }
      }
    }

    renderPage();
    return () => {
      cancelled = true;
      try {
        renderTask?.cancel?.();
      } catch {
        // ignore cancel errors
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div className="relative bg-white shadow-md border border-slate-300 mx-auto overflow-hidden">
      <div className="px-3 py-1 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
        <span>
          Trang {relativePageIndex} / {totalLockedPages}{' '}
          <span className="text-slate-400 font-normal">(Trang gốc #{pageNumber} trong file)</span>
        </span>
        {rendering && (
          <span className="inline-flex items-center gap-1 text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang hiển thị sắc nét...
          </span>
        )}
      </div>
      <div className="relative flex justify-center bg-white overflow-x-auto">
        {renderError ? (
          <div className="p-6 text-xs text-rose-600">{renderError}</div>
        ) : (
          <canvas ref={canvasRef} className="block max-w-full h-auto" />
        )}
      </div>
    </div>
  );
};

/**
 * Slices a multi-week verbatim Word/HTML document strictly to the single chosen week
 * without altering a single tag, nested table, or embedded image inside that week.
 */
function sliceOriginalHtmlToSingleWeek(
  safeHtml: string,
  weekNum?: number,
  nextWeekNum?: number,
  isMultiWeek?: boolean
): string {
  if (!safeHtml || !isMultiWeek || !weekNum || typeof DOMParser === 'undefined') {
    return safeHtml;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${safeHtml}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (!root) return safeHtml;

    const children = Array.from(root.children);
    if (children.length < 3) return safeHtml;

    const startRe = new RegExp(`\\bTuần\\s*[:\\-_.]?\\s*0?${weekNum}\\b`, 'i');
    const nextRe = nextWeekNum
      ? new RegExp(`\\bTuần\\s*[:\\-_.]?\\s*0?${nextWeekNum}\\b`, 'i')
      : new RegExp(`\\bTuần\\s*[:\\-_.]?\\s*0?${weekNum + 1}\\b`, 'i');

    const startIdx = children.findIndex((el) => startRe.test(el.textContent || ''));
    if (startIdx < 0) return safeHtml;

    // Include up to 2 preceding header lines (e.g. Trường / Tổ / Ngày soạn) belonging to this lesson
    let sliceStart = startIdx;
    for (let back = 1; back <= 2; back++) {
      const prevEl = children[startIdx - back];
      if (!prevEl) break;
      const t = (prevEl.textContent || '').trim();
      if (/^(?:Trường|Tổ|Ngày\s*soạn|Họ\s*và\s*tên|KẾ\s*HOẠCH)/i.test(t) && t.length < 180) {
        sliceStart = startIdx - back;
      } else {
        break;
      }
    }

    let sliceEnd = children.length;
    for (let i = startIdx + 1; i < children.length; i++) {
      const txt = children[i].textContent || '';
      if (nextRe.test(txt)) {
        // Step back 1-2 lines if the next week's Trường/Tổ header precedes its Tuần line
        let cut = i;
        for (let back = 1; back <= 2; back++) {
          const prevEl = children[i - back];
          if (!prevEl) break;
          const pt = (prevEl.textContent || '').trim();
          if (/^(?:Trường|Tổ|Ngày\s*soạn|Họ\s*và\s*tên)/i.test(pt) && pt.length < 180) {
            cut = i - back;
          } else {
            break;
          }
        }
        sliceEnd = Math.max(startIdx + 1, cut);
        break;
      }
    }

    return children
      .slice(sliceStart, sliceEnd)
      .map((el) => el.outerHTML)
      .join('\n');
  } catch {
    return safeHtml;
  }
}

function sliceOriginalTextToSingleWeek(
  rawText: string,
  weekNum?: number,
  nextWeekNum?: number,
  isMultiWeek?: boolean
): string {
  if (!rawText || !isMultiWeek || !weekNum) return rawText;
  const startRe = new RegExp(`(?:^|\\n)[^\\n]{0,60}\\bTuần\\s*[:\\-_.]?\\s*0?${weekNum}\\b`, 'i');
  const startMatch = startRe.exec(rawText);
  if (!startMatch || startMatch.index === undefined) return rawText;

  const afterStart = rawText.slice(startMatch.index);
  const nextRe = new RegExp(
    `\\n[^\\n]{0,60}\\bTuần\\s*[:\\-_.]?\\s*0?${nextWeekNum || weekNum + 1}\\b`,
    'i'
  );
  const nextMatch = nextRe.exec(afterStart.slice(40));
  if (!nextMatch || nextMatch.index === undefined) return afterStart.trim();
  return afterStart.slice(0, 40 + nextMatch.index).trim();
}

export const FaithfulOriginalDocumentViewer: React.FC<FaithfulOriginalDocumentViewerProps> = ({
  document: origDoc,
  lockedStartPage,
  lockedEndPage,
  selectedWeekNumber,
  nextWeekNumber,
  isMultiWeekDocument,
  targetLessonLabel
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [totalFilePages, setTotalFilePages] = useState<number>(0);
  const [relativePage, setRelativePage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(1.15);
  const [pdfViewScope, setPdfViewScope] = useState<'full_week' | 'single_page'>('full_week');
  const [htmlZoom, setHtmlZoom] = useState<number>(100);

  // Load pdfjs document whenever PDF bytes change
  useEffect(() => {
    let cancelled = false;
    let loadedTask: any = null;
    let loadedPdf: any = null;

    async function openPdf() {
      if (!origDoc || origDoc.fileType !== 'pdf' || !origDoc.pdfBytes) {
        setPdfDoc(null);
        setTotalFilePages(0);
        return;
      }

      setPdfLoading(true);
      setPdfError(null);

      try {
        if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          try {
            const workerMod: any = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default || workerMod;
          } catch {
            // fallback
          }
        }

        const freshBytes = new Uint8Array(origDoc.pdfBytes.slice());
        loadedTask = pdfjsLib.getDocument({ data: freshBytes });
        loadedPdf = await loadedTask.promise;
        if (cancelled) {
          loadedPdf.destroy?.();
          return;
        }
        setPdfDoc(loadedPdf);
        setTotalFilePages(loadedPdf.numPages || 0);
        setRelativePage(1);
      } catch (err: any) {
        if (!cancelled) {
          setPdfError(err?.message || 'Không thể mở bản PDF gốc.');
        }
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    }

    openPdf();
    return () => {
      cancelled = true;
      try {
        loadedPdf?.destroy?.();
      } catch {
        // ignore
      }
    };
  }, [origDoc?.blueprintId, origDoc?.savedAt]);

  // Reset relative page to 1 whenever the chosen week/page range changes
  useEffect(() => {
    setRelativePage(1);
  }, [lockedStartPage, lockedEndPage, selectedWeekNumber]);

  // Compute the STRICT locked page array belonging ONLY to the 1 selected week!
  const lockedPages: number[] = useMemo(() => {
    if (totalFilePages <= 0) return [];
    const startP = Math.min(Math.max(1, lockedStartPage || 1), totalFilePages);
    const endP =
      lockedEndPage && lockedEndPage >= startP
        ? Math.min(totalFilePages, lockedEndPage)
        : Math.min(totalFilePages, isMultiWeekDocument ? startP + 11 : totalFilePages);
    // Safety cap at 20 pages for a single week so the browser stays ultra-fast
    const safeEnd = Math.min(endP, startP + 19);
    const arr: number[] = [];
    for (let p = startP; p <= safeEnd; p++) arr.push(p);
    return arr;
  }, [totalFilePages, lockedStartPage, lockedEndPage, isMultiWeekDocument]);

  const pagesToRender = useMemo(() => {
    if (lockedPages.length === 0) return [];
    if (pdfViewScope === 'single_page') {
      const idx = Math.min(Math.max(0, relativePage - 1), lockedPages.length - 1);
      return [{ pageNumber: lockedPages[idx], relativeIdx: idx + 1 }];
    }
    return lockedPages.map((p, idx) => ({ pageNumber: p, relativeIdx: idx + 1 }));
  }, [lockedPages, pdfViewScope, relativePage]);

  const safeSlicedHtml = useMemo(() => {
    if (!origDoc?.originalHtml) return '';
    const sanitized = sanitizeOriginalHtmlPreserveAllContent(origDoc.originalHtml);
    return sliceOriginalHtmlToSingleWeek(sanitized, selectedWeekNumber, nextWeekNumber, isMultiWeekDocument);
  }, [origDoc?.originalHtml, selectedWeekNumber, nextWeekNumber, isMultiWeekDocument]);

  const slicedPlainText = useMemo(() => {
    if (!origDoc?.originalText) return '';
    return sliceOriginalTextToSingleWeek(
      origDoc.originalText,
      selectedWeekNumber,
      nextWeekNumber,
      isMultiWeekDocument
    );
  }, [origDoc?.originalText, selectedWeekNumber, nextWeekNumber, isMultiWeekDocument]);

  const handleDownloadOriginalFile = () => {
    if (!origDoc) return;
    let blob: Blob | null = null;
    if (origDoc.pdfBytes) {
      blob = new Blob([origDoc.pdfBytes.slice()], { type: origDoc.mimeType || 'application/pdf' });
    } else if (origDoc.rawBytes) {
      blob = new Blob([origDoc.rawBytes.slice()], {
        type: origDoc.mimeType || 'application/octet-stream'
      });
    } else if (origDoc.originalHtml) {
      blob = new Blob([origDoc.originalHtml], { type: 'text/html;charset=utf-8' });
    } else if (origDoc.originalText) {
      blob = new Blob([origDoc.originalText], { type: 'text/plain;charset=utf-8' });
    }
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = origDoc.fileName || 'Giao_an_goc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  if (!origDoc) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-sm font-bold text-slate-800">Chưa có tệp gốc được lưu cho mẫu này</p>
        <p className="text-xs text-slate-500">
          Hãy tải lại tệp Word (.docx) hoặc PDF giáo án ở Bước 1 để xem nguyên vẹn 1 giáo án hoàn thiện của 1 tuần bất kỳ.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-200/80 overflow-hidden shadow-xs">
      {/* Faithful Verbatim Header Toolbar (Strictly Scoped to 1 Complete Week) */}
      <div className="bg-white border-b border-slate-300 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold shrink-0">
            <FileCheck2 className="w-3.5 h-3.5" />
            Nguyên vẹn 100%
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate" title={targetLessonLabel || origDoc.fileName}>
              {targetLessonLabel || origDoc.fileName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {origDoc.fileType === 'pdf' && lockedPages.length > 0
                ? `Chỉ hiển thị trọn vẹn 1 giáo án tuần này (${lockedPages.length} trang: trang gốc ${lockedPages[0]}–${lockedPages[lockedPages.length - 1]}) — không chỉnh sửa`
                : 'Chỉ hiển thị nguyên vẹn 1 giáo án hoàn thiện của tuần đang chọn — không chỉnh sửa nội dung & hình ảnh'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {origDoc.fileType === 'pdf' && lockedPages.length > 0 && (
            <>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPdfViewScope('full_week')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                    pdfViewScope === 'full_week'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Hiển thị đầy đủ tất cả các trang của đúng tuần đang chọn"
                >
                  <Layers className="w-3 h-3" />
                  <span>Trọn tuần ({lockedPages.length} trang)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfViewScope('single_page')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                    pdfViewScope === 'single_page'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Xem từng trang của tuần đang chọn"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Từng trang</span>
                </button>
              </div>

              {pdfViewScope === 'single_page' && (
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-800">
                  <button
                    type="button"
                    disabled={relativePage <= 1}
                    onClick={() => setRelativePage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                    title="Trang trước trong tuần này"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1">
                    {relativePage} / {lockedPages.length}
                  </span>
                  <button
                    type="button"
                    disabled={relativePage >= lockedPages.length}
                    onClick={() => setRelativePage((p) => Math.min(lockedPages.length, p + 1))}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                    title="Trang sau trong tuần này"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => setPdfZoom((z) => Math.max(0.75, Math.round((z - 0.15) * 100) / 100))}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-slate-700 w-10 text-center">
                  {Math.round((pdfZoom / 1.15) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPdfZoom((z) => Math.min(1.85, Math.round((z + 0.15) * 100) / 100))}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          {origDoc.fileType !== 'pdf' && (
            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-300 rounded-lg px-1 py-0.5">
              <button
                type="button"
                onClick={() => setHtmlZoom((z) => Math.max(80, z - 10))}
                className="p-1 rounded hover:bg-slate-200"
                title="Thu nhỏ chữ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-700 w-10 text-center">{htmlZoom}%</span>
              <button
                type="button"
                onClick={() => setHtmlZoom((z) => Math.min(130, z + 10))}
                className="p-1 rounded hover:bg-slate-200"
                title="Phóng to chữ"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadOriginalFile}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 transition"
            title="Tải xuống đúng bản gốc đã nạp"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file gốc</span>
          </button>
        </div>
      </div>

      {/* Document Viewport (Strictly 1 Complete Week Only) */}
      <div className="p-3 sm:p-5 max-h-[82vh] overflow-y-auto space-y-4">
        {origDoc.fileType === 'pdf' && (
          <>
            {pdfLoading ? (
              <div className="bg-white rounded-xl p-10 text-center space-y-2 border border-slate-200">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">Đang hiển thị nguyên vẹn giáo án tuần đang chọn...</p>
              </div>
            ) : pdfError ? (
              <div className="bg-white rounded-xl p-8 text-center text-xs text-rose-600 border border-rose-200">
                {pdfError}
              </div>
            ) : (
              <>
                {pagesToRender.map(({ pageNumber, relativeIdx }) => (
                  <PdfPageCanvas
                    key={`${origDoc.blueprintId}_w${selectedWeekNumber}_p_${pageNumber}`}
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    relativePageIndex={relativeIdx}
                    totalLockedPages={lockedPages.length}
                    scale={pdfZoom}
                  />
                ))}
                <div className="text-center text-[11px] font-semibold text-slate-500 pt-1">
                  — Kết thúc giáo án hoàn thiện của tuần đang chọn ({lockedPages.length} trang) —
                </div>
              </>
            )}
          </>
        )}

        {(origDoc.fileType === 'docx' || origDoc.fileType === 'doc' || origDoc.fileType === 'html') && (
          <div
            className="bg-white shadow-md mx-auto max-w-[820px] px-7 sm:px-10 py-8 text-slate-950 border border-slate-300 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_td]:border [&_td]:border-black [&_td]:p-1.5 [&_td]:align-top [&_th]:border [&_th]:border-black [&_th]:p-1.5 [&_th]:bg-slate-100 [&_th]:font-bold [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:my-1.5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: `${Math.round((13.5 * htmlZoom) / 100)}px`,
              lineHeight: 1.45
            }}
            dangerouslySetInnerHTML={{ __html: safeSlicedHtml }}
          />
        )}

        {origDoc.fileType === 'text' && (
          <div
            className="bg-white shadow-md mx-auto max-w-[820px] px-7 sm:px-10 py-8 text-slate-950 border border-slate-300 whitespace-pre-wrap leading-relaxed"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: `${Math.round((13.5 * htmlZoom) / 100)}px`
            }}
          >
            {slicedPlainText}
          </div>
        )}
      </div>
    </div>
  );
};
