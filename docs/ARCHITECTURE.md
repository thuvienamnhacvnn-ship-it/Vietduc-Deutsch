# Kiến trúc Lingora

## Bức tranh tổng thể

```
Trình duyệt (Next.js App Router, React 19)
  │  fetch / SSE / WebSocket-free streaming
  ▼
Next.js server  ──►  Drizzle ORM  ──►  Postgres
  │                                     (PGlite khi dev, Postgres thật khi deploy)
  ├──►  agents/       điều phối AI Agent, một vai trò mỗi lượt
  ├──►  adapters/     llm · stt · tts · avatar · payments · mail
  └──►  jobs/         worker: nhắc học, spaced repetition, đối chiếu thanh toán
```

Không dựng microservices. Một ứng dụng Next.js + một worker cùng repo, cùng schema.
Lý do và các phương án đã cân nhắc nằm trong `docs/adr/`.

## Vì sao chọn stack này

| Thành phần | Chọn | Lý do |
|---|---|---|
| Ngôn ngữ | TypeScript | Đúng mặc định của đặc tả; schema Zod dùng chung client/server |
| Web | Next.js 16 App Router + React 19 | Server Component cho trang nội dung, streaming cho lượt nói |
| DB | Postgres | Đúng đặc tả; JSONB cho lesson/rubric, quan hệ chặt cho điểm số |
| Driver dev | PGlite (Postgres biên dịch WASM) | Máy dev **không chạy được** Postgres bản địa (xem ADR-0002) |
| ORM | Drizzle | Migration bằng SQL đọc được, chạy y hệt trên PGlite và Postgres |
| CSS | CSS thuần + custom properties | Thư mục home là một git repo; Tailwind v4 quét cả home và treo dev server |
| Mật khẩu | scrypt (node:crypto) | argon2/bcrypt là native binary, bị Smart App Control chặn trên máy này |

## Ranh giới quan trọng

**Claude chỉ là thành phần suy luận.** STT, TTS, avatar, cơ sở dữ liệu và job nền
là các dịch vụ riêng, gọi qua adapter riêng. Không có chỗ nào trong code nói rằng
model tự lo âm thanh.

**Mọi adapter có hai bản: `live` và `mock`.** Bản mock luôn tự khai `mode: "mock"`
trong kết quả trả về, và giao diện hiển thị nhãn đó. Không có khóa dịch vụ thì
ứng dụng vẫn chạy đủ luồng, chỉ là chạy ở chế độ mock có nhãn — không bao giờ
báo cáo là đã tích hợp thật.

**Agent không được gọi thẳng cơ sở dữ liệu.** Mỗi agent chỉ gọi được các "công
cụ" (tool) đã whitelist ở server; mỗi công cụ tự kiểm tra quyền theo `userId` của
phiên, validate input bằng Zod và ghi `audit_logs`. Nội dung RAG và lời học viên
đi vào prompt như **dữ liệu**, không bao giờ như chỉ thị.

## Bố cục thư mục

```
src/
  app/                  route (App Router)
    (site)/             trang công khai — landing, chương trình, giá, FAQ
    (auth)/             đăng ký, đăng nhập, xác minh, đặt lại mật khẩu
    (learn)/            khu học viên — dashboard, lớp học, bài tập, tiến độ
    (admin)/            cổng quản trị
    api/                hợp đồng HTTP (xem docs/ROUTES.md)
  components/           thành phần dùng lại
  lib/
    db/                 schema Drizzle + kết nối
    auth/               phiên, mật khẩu, phân quyền
    agents/             định nghĩa vai trò, orchestrator, tool registry
    adapters/           llm, stt, tts, avatar, payments, mail
    content/            schema lesson, loader, kiểm tra hợp lệ
  styles/               tokens.css + globals.css
scripts/                CLI: db:push, seed, logo, assets
docs/                   tài liệu kiến trúc, ADR, API
drizzle/                migration SQL sinh ra
data/pgdata/            dữ liệu PGlite khi dev (KHÔNG commit)
```

## Môi trường và cấu hình

Toàn bộ cấu hình đi qua `src/lib/config.ts`, đọc từ biến môi trường và không bao
giờ nhúng khóa vào bundle client. `.env.example` chỉ liệt kê **tên biến** kèm giải
thích, không chứa giá trị.

Tên thương hiệu nằm ở `src/lib/brand.ts` — đổi một chỗ là đổi toàn bộ giao diện,
metadata và email, đúng yêu cầu "Lingora là tên làm việc".

## Giới hạn của bản pilot

- PGlite chỉ cho **một tiến trình** mở thư mục dữ liệu. Đang chạy `npm run dev`
  thì không chạy được `npm run seed`; có khóa cảnh báo để báo lỗi rõ ràng thay vì
  làm hỏng dữ liệu âm thầm.
- Chưa đo tải. Không có tuyên bố nào về số lớp đồng thời cho tới khi có load test
  ghi trong `ACCEPTANCE.md`.
