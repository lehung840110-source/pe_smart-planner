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

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * List files in Google Drive (or filter specifically for smartplan folders or lesson files)
 */
export async function listDriveFiles(query = "trashed = false", pageSize = 30): Promise<DriveFileItem[]> {
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
    const errorText = await res.text();
    let readableError = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error?.message?.includes('insufficient authentication scopes') || parsed?.error?.status === 'PERMISSION_DENIED') {
        readableError = 'Tài khoản Google chưa cấp quyền đọc/ghi Google Drive (Request had insufficient authentication scopes). Vui lòng đăng xuất và đăng nhập lại để tích chọn cấp quyền.';
      } else if (parsed?.error?.message) {
        readableError = parsed.error.message;
      }
    } catch {
      // Keep errorText
    }
    throw new Error(`Lỗi Google Drive API (${res.status}): ${readableError}`);
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

  // Create folder
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
    throw new Error('Không thể tạo thư mục SmartPlan GDTC Pro trên Google Drive');
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

  const metadata: any = {
    name,
    mimeType
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', contentBlob);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tải lên Google Drive thất bại: ${err}`);
  }

  return await res.json();
}

/**
 * Download a file content from Google Drive
 */
export async function downloadDriveFileContent(fileId: string): Promise<Blob> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google');

  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Không thể tải tệp từ Google Drive: ${res.statusText}`);
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
    throw new Error(`Xoá tệp Google Drive thất bại (${res.status})`);
  }
}
