import "server-only";

import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
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
    const provider = process.env.LINGORA_MAIL_PROVIDER;
    if (provider === "sendmail") return sendViaSendmail(mail);
    // Ném lỗi thay vì im lặng rơi về mock: đã cấu hình `live` mà không gửi được
    // là sự cố phải nhìn thấy, không phải thứ để giấu đi.
    throw new Error(`Chưa hỗ trợ nhà cung cấp email "${provider}". Xem docs/INTEGRATIONS.md.`);
  }
  return sendMock(mail);
}

/* --------------------------------------------------------------- sendmail */

/**
 * Gửi qua máy chủ thư của chính VPS (postfix, ký DKIM bằng opendkim).
 *
 * Gọi lệnh `sendmail` chứ không mở kết nối SMTP: postfix nhận thư vào hàng đợi
 * cục bộ gần như tức thì, rồi TỰ gửi đi và TỰ thử lại khi máy nhận bận. Ứng
 * dụng không phải giữ kết nối, không phải lo thử lại, và không cần thư viện nào.
 *
 * Người nhận truyền bằng tham số, KHÔNG dùng `-t` (đọc người nhận từ header):
 * như vậy không có cách nào chèn thêm người nhận qua nội dung thư.
 */
const SENDMAIL = process.env.LINGORA_SENDMAIL_PATH || "/usr/sbin/sendmail";

/** Tách "Tên <dia@chi>" thành phần tên và địa chỉ. */
function parseFrom(from: string): { name: string; address: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].replace(/^"|"$/g, ""), address: m[2] } : { name: "", address: from.trim() };
}

/** Header không phải ASCII phải mã hoá kiểu RFC 2047, nếu không dấu tiếng Việt vỡ ở hộp thư. */
function encodeHeader(text: string): string {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

/** Base64 ngắt dòng 76 ký tự - giới hạn độ dài dòng của thư. */
function base64Lines(text: string): string {
  return (Buffer.from(text, "utf8").toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");
}

export function buildMessage(mail: Mail, from: string, now = new Date()): string {
  // Địa chỉ đã được zod kiểm ở route; chặn thêm xuống dòng ở đây vì một ký tự
  // xuống dòng trong header là chèn được cả một header mới.
  for (const v of [mail.to, mail.subject, from]) {
    if (/[\r\n]/.test(v)) throw new Error("Header thư chứa ký tự xuống dòng");
  }
  const sender = parseFrom(from);
  const domain = sender.address.split("@")[1] ?? "localhost";
  const fromHeader = sender.name ? `${encodeHeader(sender.name)} <${sender.address}>` : sender.address;
  return [
    `From: ${fromHeader}`,
    `To: ${mail.to}`,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${randomBytes(12).toString("hex")}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    // Thư tự động: hộp thư của người nhận không gửi thư trả lời "đang đi vắng".
    "Auto-Submitted: auto-generated",
    "",
    base64Lines(mail.text),
    "",
  ].join("\r\n");
}

async function sendViaSendmail(mail: Mail): Promise<MailResult> {
  const from = process.env.LINGORA_MAIL_FROM!;
  const message = buildMessage(mail, from);
  const envelopeFrom = parseFrom(from).address;
  const id = message.match(/^Message-ID: <([^>]+)>/m)?.[1] ?? "khong-ro";

  await new Promise<void>((resolve, reject) => {
    const child = spawn(SENDMAIL, ["-i", "-f", envelopeFrom, "--", mail.to], {
      stdio: ["pipe", "ignore", "pipe"],
    });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("sendmail không trả lời sau 15 giây"));
    }, 15_000);
    child.stderr.on("data", (d) => (stderr += String(d)));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`sendmail thoát mã ${code}: ${stderr.trim().slice(0, 300)}`));
    });
    // Ghi nội dung vào stdin rồi đóng - không đóng thì sendmail đợi mãi.
    child.stdin.end(message);
  });

  // Log không có nội dung thư: trong đó là liên kết đăng nhập một lần.
  console.info(`[mail:sendmail] ${id} -> ${mail.to}`);
  return { mode: "live", id };
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
