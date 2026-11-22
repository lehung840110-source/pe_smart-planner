import { getAppStateDB, setAppStateDB } from './db';

export interface StoredOriginalDocument {
  blueprintId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'html' | 'text';
  mimeType: string;
  sizeBytes: number;
  savedAt: number;
  pdfBytes?: Uint8Array;
  originalHtml?: string;
  rawBytes?: Uint8Array;
  originalText?: string;
}

const ORIG_DOC_KEY_PREFIX = 'gdtc_orig_doc_v1_';
const memoryOriginalDocCache = new Map<string, StoredOriginalDocument>();

export async function saveOriginalDocumentDB(doc: StoredOriginalDocument): Promise<void> {
  memoryOriginalDocCache.set(doc.blueprintId, doc);
  try {
    await setAppStateDB(`${ORIG_DOC_KEY_PREFIX}${doc.blueprintId}`, doc);
  } catch (err) {
    console.warn('Could not persist original document to IndexedDB:', err);
  }
}

export async function getOriginalDocumentDB(blueprintId: string): Promise<StoredOriginalDocument | null> {
  if (!blueprintId) return null;
  const cached = memoryOriginalDocCache.get(blueprintId);
  if (cached) return cached;
  try {
    const fromDb = await getAppStateDB<StoredOriginalDocument | null>(`${ORIG_DOC_KEY_PREFIX}${blueprintId}`, null);
    if (fromDb) {
      memoryOriginalDocCache.set(blueprintId, fromDb);
      return fromDb;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function deleteOriginalDocumentDB(blueprintId: string): Promise<void> {
  if (!blueprintId) return;
  memoryOriginalDocCache.delete(blueprintId);
  try {
    await setAppStateDB(`${ORIG_DOC_KEY_PREFIX}${blueprintId}`, null);
  } catch {
    // ignore
  }
}

/**
 * Strips script/iframe/event-handler tags from raw Word/HTML while preserving 100%
 * of text, tables, colspan/rowspan, inline formatting, and embedded base64 images.
 */
export function sanitizeOriginalHtmlPreserveAllContent(rawHtml: string): string {
  if (!rawHtml || typeof DOMParser === 'undefined') return rawHtml || '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, link[rel="import"]').forEach((el) => el.remove());
    doc.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        if (
          (attr.name.toLowerCase() === 'href' || attr.name.toLowerCase() === 'src') &&
          /^\s*javascript:/i.test(attr.value)
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  } catch {
    return rawHtml;
  }
}
