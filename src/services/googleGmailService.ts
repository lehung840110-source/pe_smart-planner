import { getAccessToken } from './googleAuth';

export const ADMIN_NOTIFICATION_EMAIL = 'lehung840110@gmail.com';

const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  base64Data: string;
}

export interface SendGmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  replyTo?: string;
  attachments?: GmailAttachment[];
}

export interface SendGmailResult {
  id: string;
  threadId?: string;
}

/**
 * UTF-8 safe Base64 encoding for browser
 */
function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * UTF-8 safe Base64URL encoding required by Gmail API raw field
 */
function utf8ToBase64Url(input: string): string {
  return utf8ToBase64(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * RFC 2047 UTF-8 Base64 header encoding so Vietnamese subjects render properly
 */
function encodeMimeHeader(value: string): string {
  return `=?UTF-8?B?${utf8ToBase64(value)}?=`;
}

function wrapBase64(b64: string): string {
  return b64.replace(/\s+/g, '').replace(/(.{76})/g, '$1\r\n');
}

/**
 * Extract raw base64 + mimeType from a browser data URL (`data:image/jpeg;base64,...`)
 */
export function parseDataUrlAttachment(dataUrl: string, filename = 'anh-chuyen-khoan.jpg'): GmailAttachment | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec((dataUrl || '').trim());
  if (!match) return null;
  const mimeType = match[1];
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const finalName = filename.includes('.') ? filename : `${filename}.${ext}`;
  return {
    filename: finalName,
    mimeType,
    base64Data: match[2]
  };
}

/**
 * Send an HTML email (with optional image attachments) through the authenticated user's Gmail account.
 */
export async function sendEmailViaGmailApi(params: SendGmailParams): Promise<SendGmailResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa đăng nhập Google hoặc chưa cấp quyền Gmail. Vui lòng đăng nhập Google trước khi gửi email.');
  }

  let rawMime: string;
  const hasAttachments = Boolean(params.attachments && params.attachments.length > 0);

  if (!hasAttachments) {
    const headers = [
      `To: ${params.to}`,
      `Subject: ${encodeMimeHeader(params.subject)}`,
      ...(params.replyTo ? [`Reply-To: ${params.replyTo}`] : []),
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64'
    ];
    const bodyBase64 = wrapBase64(utf8ToBase64(params.htmlBody));
    rawMime = `${headers.join('\r\n')}\r\n\r\n${bodyBase64}`;
  } else {
    const boundary = `pesmartplan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const headers = [
      `To: ${params.to}`,
      `Subject: ${encodeMimeHeader(params.subject)}`,
      ...(params.replyTo ? [`Reply-To: ${params.replyTo}`] : []),
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`
    ];

    const parts: string[] = [
      [
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        'Content-Transfer-Encoding: base64',
        '',
        wrapBase64(utf8ToBase64(params.htmlBody))
      ].join('\r\n')
    ];

    for (const att of params.attachments || []) {
      parts.push(
        [
          `--${boundary}`,
          `Content-Type: ${att.mimeType}; name="${att.filename}"`,
          `Content-Disposition: attachment; filename="${att.filename}"`,
          'Content-Transfer-Encoding: base64',
          '',
          wrapBase64(att.base64Data)
        ].join('\r\n')
      );
    }

    rawMime = `${headers.join('\r\n')}\r\n\r\n${parts.join('\r\n')}\r\n--${boundary}--`;
  }

  const rawEncoded = utf8ToBase64Url(rawMime);

  const res = await fetch(GMAIL_SEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawEncoded })
  });

  if (!res.ok) {
    const errText = await res.text();
    let message = errText;
    try {
      const parsed = JSON.parse(errText);
      const apiMsg = parsed?.error?.message || '';
      if (apiMsg.includes('insufficient authentication scopes') || parsed?.error?.status === 'PERMISSION_DENIED') {
        message =
          'Tài khoản Google chưa cấp quyền gửi email (Gmail). Vui lòng đăng xuất Google và đăng nhập lại, sau đó tích chọn cấp quyền Gmail.';
      } else if (apiMsg) {
        message = apiMsg;
      }
    } catch {
      // keep raw error text
    }
    throw new Error(`Gửi email qua Gmail thất bại (${res.status}): ${message}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    threadId: data.threadId
  };
}

/**
 * Build confirmation/notification email sent to lehung840110@gmail.com when a new teacher registers
 */
export function buildRegistrationNotificationEmail(info: {
  fullName: string;
  email: string;
  schoolName: string;
  registeredAt: number;
  confirmationCode: string;
}): SendGmailParams {
  const formattedDate = new Date(info.registeredAt).toLocaleString('vi-VN');
  const subject = `[PE SmartPlan] Xác nhận đăng ký tài khoản mới: ${info.fullName} (${info.email})`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #1d4ed8; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 18px;">Thông Báo Đăng Ký Tài Khoản Giáo Viên Mới</h2>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">PE SmartPlan 2.0 · Hệ thống soạn kế hoạch bài dạy GDTC Tiểu học</p>
      </div>
      <div style="padding: 20px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p>Kính gửi Quản trị viên (<strong>${ADMIN_NOTIFICATION_EMAIL}</strong>),</p>
        <p>Một tài khoản giáo viên mới vừa đăng ký trên ứng dụng:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 36%;">Họ và tên giáo viên</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${info.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Email đăng ký</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${info.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Đơn vị / Trường học</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${info.schoolName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Thời gian đăng ký</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Mã xác nhận đăng ký</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 16px; font-weight: bold; color: #059669; letter-spacing: 2px;">${info.confirmationCode}</td>
          </tr>
        </table>
      </div>
    </div>
  `.trim();

  return {
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    htmlBody,
    replyTo: info.email
  };
}

/**
 * Build a Gmail Web Compose URL that ALWAYS opens in a new browser tab (works on Windows/Mac/Mobile & inside iframes,
 * unlike raw mailto: links which silently fail when no desktop mail client is configured).
 */
export function buildGmailWebComposeUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(params.to)}&su=${encodeURIComponent(
    params.subject
  )}&body=${encodeURIComponent(params.body)}`;
}

/**
 * Build payment proof email (with transfer screenshot attachment + direct view link) sent to Admin lehung840110@gmail.com
 */
export function buildPaymentProofToAdminEmail(info: {
  requestId: string;
  email: string;
  fullName: string;
  schoolName: string;
  scopeLabel: string;
  gradeLabel: string;
  amountText: string;
  transferNote: string;
  adminReviewUrl: string;
  receiptImageUrl?: string;
  proofImageDataUrl?: string;
}): SendGmailParams {
  const attachment = info.proofImageDataUrl
    ? parseDataUrlAttachment(info.proofImageDataUrl, `chuyen-khoan-${info.requestId}.jpg`)
    : null;
  const subject = `[PE SmartPlan] Đã chuyển khoản ${info.amountText} (${info.email}) · #${info.requestId}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #047857; color: #ffffff; padding: 16px 22px;">
        <h2 style="margin: 0; font-size: 17px;">Yêu Cầu Duyệt Thanh Toán &amp; Cấp Mã Kích Hoạt</h2>
        <p style="margin: 4px 0 0; font-size: 12.5px; opacity: 0.92;">Mã yêu cầu: #${info.requestId} · PE SmartPlan 2.0</p>
      </div>
      <div style="padding: 18px 22px; color: #1e293b; font-size: 13.5px; line-height: 1.6;">
        <p style="margin-top:0;">Kính gửi <strong>Thầy Lê Quốc Hưng</strong>,</p>
        <p>Giáo viên đã tải lên ảnh chuyển khoản thành công và yêu cầu kích hoạt phần mềm:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 38%;">Email kích hoạt</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;"><strong>${info.email}</strong></td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Giáo viên / Trường</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${info.fullName}${info.schoolName ? ` — ${info.schoolName}` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Gói đăng ký</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${info.scopeLabel} (${info.gradeLabel})</td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Số tiền</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; color: #047857; font-weight: bold;">${info.amountText}</td>
          </tr>
          <tr>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Nội dung CK</td>
            <td style="padding: 7px 10px; border: 1px solid #e2e8f0; font-family: monospace;">${info.transferNote}</td>
          </tr>
        </table>
        <p style="margin: 14px 0 6px;">
          ${attachment ? '📎 Ảnh biên lai chuyển khoản được đính kèm trực tiếp trong email này và lưu sẵn trong mục <strong>Quản Trị Mã</strong>.' : 'Ảnh biên lai chuyển khoản đã được lưu sẵn trong mục <strong>Quản Trị Mã</strong>.'}
          ${info.receiptImageUrl ? `<br/>🖼️ Link xem trực tiếp ảnh chuyển khoản: <a href="${info.receiptImageUrl}" style="color:#1d4ed8;word-break:break-all;">${info.receiptImageUrl}</a>` : ''}
        </p>
        <div style="text-align: center; margin: 16px 0;">
          <a href="${info.adminReviewUrl}" style="display: inline-block; padding: 11px 20px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
            Mở Quản Trị Mã Để Duyệt &amp; Tự Động Gửi Mã Kích Hoạt
          </a>
        </div>
      </div>
    </div>
  `.trim();

  return {
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    htmlBody,
    replyTo: info.email,
    ...(attachment ? { attachments: [attachment] } : {})
  };
}

/**
 * Build automatic Activation Code + 1-Click Activation Link + Success Notice email sent to the teacher
 */
export function buildActivationSuccessEmailToUser(info: {
  recipientEmail: string;
  fullName: string;
  planLabel: string;
  licenseCode: string;
  activationLink: string;
}): SendGmailParams {
  const subject = `[PE SmartPlan] Mã & Link kích hoạt ${info.planLabel} — PE SmartPlan 2.0`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d1fae5; border-radius: 12px; overflow: hidden;">
      <div style="background: #059669; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 18px;">🔑 MÃ &amp; LINK KÍCH HOẠT PHẦN MỀM PE SMARTPLAN</h2>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.95;">Gói đăng ký: ${info.planLabel} · Tài khoản ${info.recipientEmail}</p>
      </div>
      <div style="padding: 20px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top:0;">Xin chào <strong>${info.fullName}</strong>,</p>
        <p>Quản trị viên (<strong>Thầy Lê Quốc Hưng</strong>) đã tạo Mã kích hoạt gói <strong>${info.planLabel}</strong> gửi tới thầy/cô.</p>
        <div style="margin: 16px 0; padding: 14px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; text-align: center;">
          <div style="font-size: 12px; color: #047857; font-weight: bold;">MÃ KÍCH HOẠT (KHÓA KÍCH HOẠT)</div>
          <div style="font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #065f46; font-family: monospace; margin-top: 6px;">${info.licenseCode}</div>
        </div>
        <p style="font-size: 13px; color: #1e293b; margin: 12px 0;">
          <strong>Hướng dẫn kích hoạt mở khóa tải theo gói:</strong><br/>
          1. Bấm trực tiếp vào nút <strong>Kích Hoạt 1 Chạm</strong> bên dưới, <em>hoặc</em><br/>
          2. Đăng nhập vào ứng dụng <strong>PE SmartPlan</strong> bằng email <strong>${info.recipientEmail}</strong> → mở mục <strong>Tài khoản / Mở khóa tải giáo án</strong> → nhập mã trên và bấm <strong>Kích Hoạt</strong>.
        </p>
        <div style="text-align: center; margin: 18px 0;">
          <a href="${info.activationLink}" style="display: inline-block; padding: 12px 24px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px; font-size: 14px;">
            Bấm Vào Link Kích Hoạt &amp; Mở Khóa Tải Ngay
          </a>
        </div>
        <p style="font-size: 12.5px; color: #475569;">
          Hoặc sao chép link kích hoạt: <br/>
          <a href="${info.activationLink}" style="color: #1d4ed8; word-break: break-all;">${info.activationLink}</a>
        </p>
        <p style="font-size: 12.5px; color: #047857; font-weight: bold; margin-bottom: 0;">
          ✅ Sau khi kích hoạt mã thành công, tài khoản sẽ tự động mở khóa tải giáo án (Word .DOC/.DOCX, PDF) đúng theo gói ${info.planLabel} đã đăng ký!
        </p>
      </div>
    </div>
  `.trim();

  return {
    to: info.recipientEmail,
    subject,
    htmlBody,
    replyTo: ADMIN_NOTIFICATION_EMAIL
  };
}

/**
 * Build password recovery verification email sent via Gmail
 */
export function buildPasswordRecoveryEmail(info: {
  recipientEmail: string;
  accountEmail: string;
  fullName: string;
  recoveryCode: string;
  expiresAt: number;
}): SendGmailParams {
  const expireStr = new Date(info.expiresAt).toLocaleTimeString('vi-VN');
  const subject = `[PE SmartPlan] Mã khôi phục mật khẩu tài khoản: ${info.accountEmail}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0f766e; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 18px;">Yêu Cầu Khôi Phục Mật Khẩu Tài Khoản</h2>
      </div>
      <div style="padding: 20px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p>Xin chào,</p>
        <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${info.fullName}</strong> (<code>${info.accountEmail}</code>).</p>
        <div style="margin: 18px 0; padding: 14px; background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; text-align: center;">
          <div style="font-size: 12px; color: #0f766e; font-weight: bold;">MÃ XÁC THỰC KHÔI PHỤC (Hiệu lực đến ${expireStr})</div>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #115e59; margin-top: 6px;">${info.recoveryCode}</div>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Vui lòng nhập mã gồm 6 chữ số trên vào khung Phục hồi mật khẩu trong ứng dụng để đặt mật khẩu mới.
        </p>
      </div>
    </div>
  `.trim();

  return {
    to: info.recipientEmail,
    subject,
    htmlBody
  };
}
