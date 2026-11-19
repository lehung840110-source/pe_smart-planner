import { getAccessToken } from './googleAuth';

export const ADMIN_NOTIFICATION_EMAIL = 'lehung840110@gmail.com';

const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export interface SendGmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  replyTo?: string;
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

/**
 * Send an HTML email through the authenticated user's Gmail account.
 * IMPORTANT: Always display an explicit user confirmation dialog before invoking this function.
 */
export async function sendEmailViaGmailApi(params: SendGmailParams): Promise<SendGmailResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa đăng nhập Google hoặc chưa cấp quyền Gmail. Vui lòng đăng nhập Google trước khi gửi email.');
  }

  const headers = [
    `To: ${params.to}`,
    `Subject: ${encodeMimeHeader(params.subject)}`,
    ...(params.replyTo ? [`Reply-To: ${params.replyTo}`] : []),
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64'
  ];

  const bodyBase64 = utf8ToBase64(params.htmlBody).replace(/(.{76})/g, '$1\r\n');
  const rawMime = `${headers.join('\r\n')}\r\n\r\n${bodyBase64}`;
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
  const subject = `[SmartPlan GDTC] Xác nhận đăng ký tài khoản mới: ${info.fullName} (${info.email})`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #1d4ed8; color: #ffffff; padding: 18px 24px;">
        <h2 style="margin: 0; font-size: 18px;">Thông Báo Đăng Ký Tài Khoản Giáo Viên Mới</h2>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Hệ thống soạn kế hoạch bài dạy GDTC Tiểu học (GDPT 2018)</p>
      </div>
      <div style="padding: 20px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p>Kính gửi Quản trị viên (<strong>${ADMIN_NOTIFICATION_EMAIL}</strong>),</p>
        <p>Một tài khoản giáo viên mới vừa đăng ký thành công trên ứng dụng với thông tin chi tiết sau:</p>
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
        <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
          Email này được gửi để xác nhận đăng ký tài khoản theo yêu cầu quản trị hệ thống.
        </p>
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
  const subject = `[SmartPlan GDTC] Mã khôi phục mật khẩu tài khoản: ${info.accountEmail}`;
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
