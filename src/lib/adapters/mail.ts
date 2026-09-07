import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { adapterMode, config } from "@/lib/config";
import { brand } from "@/lib/brand";

/**
 * Email giao dịch. Hai bản cài đặt: `live` (nhà cung cấp thật) và `mock`.
 *
 * Bản mock ghi thư ra `data/outbox/` và in đường dẫn xác minh ra console, để
 * luồng đăng ký chạy được end-to-end khi phát triển. Nó LUÔN trả `mode: "mock"`
 * và không bao giờ được báo cáo là đã gửi thư thật.
 */

export type MailResult = { mode: "live" | "mock"; id: string };

type Mail = {
  to: string;
  subject: string;
  text: string;
};

export async function sendMail(mail: Mail): Promise<MailResult> {
  if (adapterMode("mail") === "live") {
    // Chưa chốt nhà cung cấp. Khi chốt, phần cài đặt nằm gọn ở đây và không có
    // chỗ nào khác trong ứng dụng phải đổi.
    //
    // Ném lỗi thay vì im lặng rơi về mock: đã cấu hình `live` mà không gửi được
    // là sự cố phải nhìn thấy, không phải thứ để giấu đi.
    throw new Error(
      "Adapter email chưa có bản cài đặt live. Xem docs/INTEGRATIONS.md, mục Email giao dịch.",
    );
  }
  return sendMock(mail);
}

async function sendMock(mail: Mail): Promise<MailResult> {
  const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dir = path.resolve(process.cwd(), "data", "outbox");
  await fs.mkdir(dir, { recursive: true });
  const body =
    `[THƯ MOCK - KHÔNG GỬI ĐI ĐÂU]\n` +
    `Đến: ${mail.to}\nTiêu đề: ${mail.subject}\nLúc: ${new Date().toISOString()}\n\n${mail.text}\n`;
  await fs.writeFile(path.join(dir, `${id}.txt`), body, "utf8");
  // Log ngắn, đủ để bấm được liên kết khi phát triển; không in nội dung thư.
  console.info(`[mail:mock] ${mail.subject} -> ${mail.to} (data/outbox/${id}.txt)`);
  return { mode: "mock", id };
}

/* ------------------------------------------------------------ mẫu thư cụ thể */

export function verifyEmailMail(to: string, name: string, token: string): Mail {
  const link = `${config.appUrl}/xac-minh?token=${encodeURIComponent(token)}`;
  return {
    to,
    subject: `Xác minh email của bạn tại ${brand.name}`,
    text:
      `Chào ${name},\n\n` +
      `Bấm vào liên kết dưới đây để xác minh email và bắt đầu học:\n${link}\n\n` +
      `Liên kết có hiệu lực 24 giờ. Nếu bạn không đăng ký ${brand.name}, hãy bỏ qua thư này.\n`,
  };
}

export function resetPasswordMail(to: string, name: string, token: string): Mail {
  const link = `${config.appUrl}/dat-lai-mat-khau?token=${encodeURIComponent(token)}`;
  return {
    to,
    subject: `Đặt lại mật khẩu ${brand.name}`,
    text:
      `Chào ${name},\n\n` +
      `Bấm vào liên kết dưới đây để đặt mật khẩu mới:\n${link}\n\n` +
      `Liên kết có hiệu lực 60 phút và chỉ dùng được một lần. Nếu bạn không yêu cầu\n` +
      `đặt lại mật khẩu, không cần làm gì - mật khẩu hiện tại vẫn nguyên.\n`,
  };
}
