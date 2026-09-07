# Trạng thái dự án Lingora

Cập nhật: 07.09.2026 · Giai đoạn 0 và 1 hoàn tất.

Đọc tệp này trước, rồi `REQUIREMENTS.md`, `ACCEPTANCE.md`, `CONTENT_COVERAGE.md`.
Luôn kiểm tra code hiện tại trước khi kết luận điều gì đã có hay chưa.

## Đã chạy thật

- Ứng dụng Next.js 16 chạy ở `http://localhost:3055` (cổng 3050 đã bị một dự án
  khác trên máy này chiếm).
- PostgreSQL qua PGlite, schema đầy đủ 30 bảng, migration có phiên bản trong
  `drizzle/0000_married_stature.sql`, áp bằng `npm run db:push`.
- Đăng ký, xác minh email, đăng nhập, quên mật khẩu, đặt lại mật khẩu, đăng
  xuất, quản lý phiên.
- **Đăng nhập nhanh bằng Google** (OAuth 2.0 Authorization Code + PKCE): một
  chạm với tài khoản Gmail đang đăng nhập sẵn, tự nối vào tài khoản email đã có,
  tài khoản tạo bằng Google không có mật khẩu. Chạy bằng adapter mô phỏng có
  nhãn cho tới khi có khóa OAuth.
- Bốn vai trò: learner, editor, support, admin. Phân quyền kiểm ở server cho cả
  trang lẫn API.
- Hồ sơ học viên đọc/ghi được, kèm audit log.
- Trang giới thiệu đủ khối, ba trang nội dung, hai trang pháp lý (bản nháp có
  nhãn), khu học viên, cổng quản trị.
- Hệ thiết kế token, logo sinh bằng script, hai chủ đề sáng/tối.
- 37 kiểm tra end-to-end trong `tests/smoke.mjs` và 24 kiểm tra luồng Google
  trong `tests/google.mjs`, tất cả PASS.

## Đang chạy bằng mock có nhãn

Toàn bộ adapter dịch vụ ngoài: LLM, STT, TTS, avatar, email, thanh toán, lưu
trữ, đăng nhập Google. Chúng khai `mode: "mock"` và giao diện hiển thị nhãn đó. Chi tiết và các
bước kích hoạt: `docs/INTEGRATIONS.md`.

## Chưa làm

Giai đoạn 2 (tư vấn, xếp lớp bốn kỹ năng), 3 (giáo trình, lớp học giọng nói,
đội agent), 4 (cá nhân hóa, ôn tập giãn cách), 5 (thanh toán, vận hành).
Bản đồ chi tiết theo ID nằm trong `REQUIREMENTS.md`.

## Quyết định kỹ thuật đã chốt

| Quyết định | Lý do | Ghi ở |
|---|---|---|
| Next.js 16 + Drizzle + Postgres, một web + một worker | đúng đặc tả, không dựng microservices sớm | `docs/adr/0001-stack.md` |
| PGlite khi dev, `pg` khi có `DATABASE_URL` | máy dev không chạy được Postgres bản địa | `docs/adr/0002-pglite.md` |
| CSS thuần với custom properties, không Tailwind | thư mục home là git root, Tailwind v4 quét cả home và treo dev server | `docs/adr/0003-css-tokens.md` |
| scrypt cho mật khẩu | argon2/bcrypt là native binary, bị Smart App Control chặn | `src/lib/auth/password.ts` |
| CSS component để trong `globals.css`, không styled-jsx | styled-jsx không gắn class phạm vi lên `next/link`, mọi quy tắc nhắm vào `<Link>` sẽ im lặng không có tác dụng | `src/components/SiteHeader.tsx` |

## Bẫy đã gặp, đừng đạp lại

1. **Cổng 3050 không dùng được** — đã có dự án khác nghe ở đó. Lingora dùng 3055.
2. **PGlite chỉ cho một tiến trình mở thư mục dữ liệu.** Đang chạy `npm run dev`
   thì `npm run db:push` và `npm run seed` sẽ bị khóa advisory chặn lại kèm thông
   báo. Dừng dev server trước.
3. **styled-jsx + `next/link`**: xem bảng trên. Đã làm cả header mất style một
   lượt trước khi phát hiện.
4. **`white-space: nowrap` cho `.btn` toàn cục** làm nút có nhãn dài đẩy trang
   tràn ngang ở 390px. Giờ chỉ áp cho nút trong thanh điều hướng.
5. **Emoji trong heredoc của shell trên máy này làm vỡ lệnh** — viết tài liệu
   bằng ký tự thường.
6. **Hai bộ test dùng chung hạn mức rate limit theo IP.** Chạy `tests/google.mjs`
   rồi `tests/smoke.mjs` ngay sau đó có thể làm một kiểm tra đăng ký báo FAIL.
   Đó là rate limit chạy đúng, không phải hỏng.

## Quy tắc nội dung: nói rõ ai đang dạy

Anna, Lukas, Mia được viết như nhân vật có tính cách, vì bản giao việc yêu cầu
"tạo cảm giác có giáo viên đang đồng hành". Nhưng không chỗ nào được nói hay ám
chỉ họ là người thật.

Lời khai báo chuẩn nằm ở `AI_DISCLOSURE` trong `src/content/agents.ts` và xuất
hiện ở đúng ba nơi: trang đội ngũ, trang lớp học, và FAQ cùng điều khoản. Trước
đây nhãn "AI" bị dán lên mọi thẻ và mọi khối, làm giao diện lạnh như bảng thông
báo mà không làm sự thật rõ hơn.

## Bước tiếp theo (giai đoạn 2)

1. Cố vấn Mia: luồng hỏi mục tiêu, lưu vào `learner_profiles`, sinh lộ trình đề
   xuất có lý do. Không hứa thời gian đạt B2.
2. Onboarding nhiều bước có lưu và tiếp tục (`assessment_sessions.resume_state`).
3. Ngân hàng câu hỏi có phiên bản + rubric có phiên bản; CMS tối thiểu trong
   `/quan-tri/cau-hoi`.
4. Đánh giá bốn kỹ năng. Ràng buộc quan trọng nhất: kỹ năng thiếu bằng chứng
   phải ghi `insufficient_evidence = true`, tuyệt đối không suy ra mức.
5. Trang kết quả theo kỹ năng + độ tin cậy + bằng chứng ngắn.

## Cần chủ dự án cung cấp

| Việc | Chặn phần nào |
|---|---|
| Khóa Anthropic + hạn mức chi tiêu | toàn bộ giảng dạy và chấm bài (giai đoạn 3) |
| OAuth client của Google (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`) | đăng nhập Google thật; hiện chạy mô phỏng ở máy dev, tắt hẳn ở production |
| Nhà cung cấp STT và TTS tiếng Đức + khóa | lớp học giọng nói (giai đoạn 3) |
| Nhà cung cấp email giao dịch + khóa | email xác minh thật (hiện ghi ra `data/outbox/`) |
| Pháp nhân, tài khoản nhận tiền, thông tin thuế | mở bán (giai đoạn 5) |
| Tài khoản PayPal + nhà cung cấp thẻ | thanh toán (giai đoạn 5) |
| Duyệt điều khoản, chính sách hủy và hoàn tiền | công khai trang, mở bán |
| Chốt giá kinh doanh thật | hiện giá trong seed là giá tham khảo, `approved_for_sale = false` |
