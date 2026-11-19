import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDocPreviewData {
  documentId: string;
  title: string;
  htmlContent: string;
  plainTextSummary: string;
  paragraphCount: number;
  tableCount: number;
  webViewLink: string;
}

export const GOOGLE_DOC_MIME_TYPE = 'application/vnd.google-apps.document';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DOCS_API_BASE = 'https://docs.googleapis.com/v1/documents';

function parseGoogleApiError(status: number, errorText: string, defaultPrefix: string): Error {
  let readableError = errorText;
  try {
    const parsed = JSON.parse(errorText);
    const msg = parsed?.error?.message || '';
    if (
      msg.includes('insufficient authentication scopes') ||
      parsed?.error?.status === 'PERMISSION_DENIED'
    ) {
      readableError =
        'Tài khoản Google chưa cấp đủ quyền Google Drive / Google Docs (insufficient authentication scopes). Vui lòng bấm "Cấp lại quyền Google" và tích chọn đầy đủ các ô cấp quyền.';
    } else if (msg) {
      readableError = msg;
    }
  } catch {
    // Keep raw text
  }
  return new Error(`${defaultPrefix} (${status}): ${readableError}`);
}

export function isGoogleDocFile(file: Pick<DriveFileItem, 'mimeType'>): boolean {
  return file.mimeType === GOOGLE_DOC_MIME_TYPE;
}

export function getGoogleDocEditUrl(file: Pick<DriveFileItem, 'id' | 'mimeType' | 'webViewLink'>): string {
  if (isGoogleDocFile(file)) {
    return `https://docs.google.com/document/d/${file.id}/edit`;
  }
  return file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;
}

/**
 * List files in Google Drive (or filter specifically for smartplan folders or lesson files)
 */
export async function listDriveFiles(query = 'trashed = false', pageSize = 30): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google hoặc phiên làm việc đã hết hạn');

  const params = new URLSearchParams({
    q: query,
    pageSize: pageSize.toString(),
    fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)',
    orderBy: 'modifiedTime desc'
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw parseGoogleApiError(res.status, await res.text(), 'Lỗi Google Drive API');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Ensure or find the dedicated folder 'SmartPlan GDTC Pro' on user's Google Drive
 */
export async function getOrCreateAppFolder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const folderName = 'SmartPlan GDTC Pro';
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const existing = await listDriveFiles(query, 1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const res = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!res.ok) {
    throw parseGoogleApiError(res.status, await res.text(), 'Không thể tạo thư mục SmartPlan GDTC Pro');
  }

  const newFolder = await res.json();
  return newFolder.id;
}

/**
 * Upload a file (Blob or text) directly into Google Drive
 */
export async function uploadFileToDrive(
  name: string,
  mimeType: string,
  contentBlob: Blob,
  folderId?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const metadata: Record<string, any> = {
    name,
    mimeType
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', contentBlob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    }
  );

  if (!res.ok) {
    throw parseGoogleApiError(res.status, await res.text(), 'Tải lên Google Drive thất bại');
  }

  return await res.json();
}

/**
 * Upload full HTML lesson plan and convert natively to an editable Google Docs document.
 * Preserves tables, borders, Times New Roman formatting, and embedded PNG images.
 */
export async function uploadHtmlAsGoogleDoc(
  title: string,
  htmlContent: string,
  folderId?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const metadata: Record<string, any> = {
    name: title,
    mimeType: GOOGLE_DOC_MIME_TYPE
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', htmlBlob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    }
  );

  if (!res.ok) {
    throw parseGoogleApiError(res.status, await res.text(), 'Lưu thành Google Docs thất bại');
  }

  const created: DriveFileItem = await res.json();
  return {
    ...created,
    webViewLink: created.webViewLink || `https://docs.google.com/document/d/${created.id}/edit`
  };
}

/**
 * Inspect and preview a Google Doc directly inside the app using both Google Docs API and Drive HTML export.
 */
export async function getGoogleDocPreview(file: DriveFileItem): Promise<GoogleDocPreviewData> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  let title = file.name;
  let paragraphCount = 0;
  let tableCount = 0;
  const textParts: string[] = [];

  // 1. Try Google Docs API v1 for live document structure metadata
  if (isGoogleDocFile(file)) {
    const docRes = await fetch(`${DOCS_API_BASE}/${file.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (docRes.ok) {
      const docJson = await docRes.json();
      if (docJson?.title) title = docJson.title;
      const bodyContent = docJson?.body?.content || [];
      for (const el of bodyContent) {
        if (el.paragraph) {
          paragraphCount++;
          const line = (el.paragraph.elements || [])
            .map((pe: any) => pe?.textRun?.content || '')
            .join('')
            .trim();
          if (line) textParts.push(line);
        } else if (el.table) {
          tableCount++;
        }
      }
    } else if (docRes.status === 403) {
      throw parseGoogleApiError(docRes.status, await docRes.text(), 'Không thể đọc Google Docs');
    }
  }

  // 2. Export rich HTML from Google Drive so user can preview tables & images directly in app
  let htmlContent = '';
  if (isGoogleDocFile(file)) {
    const htmlRes = await fetch(
      `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=${encodeURIComponent('text/html')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (htmlRes.ok) {
      htmlContent = await htmlRes.text();
    }
  }

  return {
    documentId: file.id,
    title,
    htmlContent,
    plainTextSummary: textParts.slice(0, 12).join('\n'),
    paragraphCount,
    tableCount,
    webViewLink: getGoogleDocEditUrl(file)
  };
}

/**
 * Download a file content from Google Drive.
 * Automatically exports native Google Docs to DOCX so importing back into the app works cleanly.
 */
export async function downloadDriveFileContent(fileId: string, mimeType?: string): Promise<Blob> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const isNativeDoc = mimeType === GOOGLE_DOC_MIME_TYPE;
  const url = isNativeDoc
    ? `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )}`
    : `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw parseGoogleApiError(res.status, await res.text(), 'Không thể tải tệp từ Google Drive');
  }

  return await res.blob();
}

/**
 * Delete a file from Google Drive (Requires explicit confirmation before calling)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    throw parseGoogleApiError(res.status, await res.text(), 'Xoá tệp Google Drive thất bại');
  }
}
