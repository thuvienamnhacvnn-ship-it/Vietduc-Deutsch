# Trạng thái dự án Việt Đức

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
| Màu lấy bằng máy từ tệp logo, không chọn bằng mắt | `scripts/lay-mau-logo.ts` tự giải mã PNG và đo tương phản; bảng màu vì thế khớp đúng nhận diện của khách | `src/styles/tokens.css` |
| Tách `--brand` (đỏ cho chữ) khỏi `--brand-fill` (đỏ cho mặt phẳng) | hai vai trò đi ngược chiều khi đổi chủ đề: chữ đỏ phải sáng lên trên nền tối, mặt phẳng đỏ mà sáng lên thì thành hồng | `src/styles/tokens.css` |
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
6. **Hạn mức đăng ký từng quá chặt.** Trần 5 rồi 10 lần/10 phút mỗi IP chặn
   đúng nhóm người dùng hợp lệ đông nhất: một lớp học đăng ký cùng lúc từ một
   wifi. Nay là 30, và rào chắn thật nằm ở xác minh email cùng entitlement.
7. **`x-forwarded-for` từng được tin vô điều kiện** — bất kỳ ai cũng vượt được
   mọi rate limit bằng cách đổi một chuỗi trong request. Nay chỉ đọc header đó
   khi `LINGORA_TRUST_PROXY=1`, tức khi thật sự đứng sau nginx của mình.
8. **`iframe` trong flexbox bị co lại** làm phép đo tràn ngang sai hoàn toàn:
   khung khai 390px nhưng `innerWidth` chỉ 300. Harness kiểm khung phải đặt
   `flex: none`.
9. **Python hiểu `` trong chuỗi thay thế là backreference** và nhét ký tự
   điều khiển 0x01 vào tài liệu. Sửa đường dẫn Windows trong file thì dùng Node
   hoặc chuỗi raw.

## Quy tắc nội dung: nói rõ ai đang dạy

Anna, Lukas, Mia được viết như nhân vật có tính cách, vì bản giao việc yêu cầu
"tạo cảm giác có giáo viên đang đồng hành". Nhưng không chỗ nào được nói hay ám
chỉ họ là người thật.

Lời khai báo chuẩn nằm ở `AI_DISCLOSURE` trong `src/content/agents.ts` và xuất
hiện ở đúng ba nơi: trang đội ngũ, trang lớp học, và FAQ cùng điều khoản. Trước
đây nhãn "AI" bị dán lên mọi thẻ và mọi khối, làm giao diện lạnh như bảng thông
báo mà không làm sự thật rõ hơn.

## Quy tắc: ngôn ngữ sản phẩm vs ngôn ngữ kỹ thuật

Người học đọc "Lớp học bằng giọng nói chưa mở". Chủ dự án đọc `stt: mock` ở
`/quan-tri`. Lập trình viên đọc `docs/INTEGRATIONS.md`. Ba thứ này không được
trộn: chữ như "chế độ mô phỏng có nhãn" hay đường dẫn tệp tài liệu từng lọt ra
trang giới thiệu và trang học phí, làm trang trông như bảng báo lỗi. Bảng phân
vai ở `docs/UI_SYSTEM.md`.

## Nhận diện

Nền tảng thuộc **Việt Đức Group**. Logo là tệp của khách trong `public/brand/`,
không vẽ lại. Hệ màu đo trực tiếp từ logo: đỏ cờ Việt Nam làm màu chính theo yêu
cầu chủ dự án, vàng kim của chữ VIET DUC làm màu phụ, đen cờ Đức làm chữ.
Chi tiết ở `docs/UI_SYSTEM.md` và `docs/ASSETS.md`.

## Thông tin tổ chức

Tên pháp nhân, trụ sở, hai văn phòng, điện thoại, email và website lấy nguyên từ
dự án vietducgroup (`src/lib/site-config.ts` bên đó) và nằm gọn trong
`src/lib/brand.ts`. Chân trang cũng bê nguyên bố cục ba dải của chân trang bên
đó: văn phòng kèm bản đồ, sơ đồ trang bốn cột, dòng pháp lý.

Quy tắc giữ nguyên từ bản gốc: giá trị rỗng nghĩa là "chưa cấu hình", và giao
diện khi ấy không hiện gì cả, chứ không hiện chỗ trống hay một đường dẫn đoán
bừa. Vì vậy khối mạng xã hội hiện chưa render, còn mã số doanh nghiệp, mã số
thuế và người chịu trách nhiệm nội dung thì chân trang và trang điều khoản tự
ghi ra là còn thiếu.

Bản đồ dùng OpenStreetMap chứ không dùng bản nhúng thương mại: nó không đặt
cookie, nên được phép có mặt trước khi người dùng trả lời thông báo cookie -
đúng như trang quyền riêng tư đã hứa.

## Giai đoạn 3-4-5: đã dựng những gì

Toàn bộ phần AI chạy trên máy chủ của trường bằng phần mềm mã nguồn mở, không
mua dịch vụ theo lượt. Chi tiết và số đo thật ở `docs/ENGINE-TU-HOST.md`.

**Giai đoạn 3 - lớp học nói và bộ giảng dạy**

- `src/lib/adapters/giong-noi.ts` - đọc và nghe tiếng Đức qua engine tự host
  (piper + whisper.cpp). Bài thi phần Nghe giờ phát ÂM THANH THẬT và không gửi
  kèm chữ; thiếu engine thì rơi về giọng trình duyệt và nói rõ điều đó.
- `src/lib/adapters/llm.ts` - bộ giảng dạy qua chuẩn OpenAI, mặc định trỏ vào
  llama.cpp trên máy chủ. Thiếu engine thì KHÔNG bịa lời giảng, trả 503 kèm câu
  giải thích.
- `src/lib/lop-hoc.ts` + `/hoc/lop` - buổi học nói: người học nói hoặc gõ,
  Anna đáp bằng tiếng Đức có tiếng đọc, kèm nghĩa tiếng Việt và TỐI ĐA MỘT lỗi
  được sửa mỗi lượt.

**Giai đoạn 4 - nội dung và ôn tập**

- 12 buổi học nói (`src/content/bai-hoc.ts`), nạp vào cơ sở dữ liệu ở trạng
  thái CHỜ DUYỆT. Học viên không thấy bài chưa duyệt.
- `/quan-tri/bai-hoc` - màn hình duyệt: bày ra toàn bộ nội dung sẽ đến tay học
  viên, ghi lại ai duyệt và lúc nào.
- Ôn tập ngắt quãng: mỗi lỗi được sửa trong lớp thành một thẻ; `/hoc/on-tap`
  hỏi lại đúng lúc trí nhớ bắt đầu mờ. Thuật toán ở
  `src/lib/lop-hoc-db.ts`.

**Giai đoạn 5 - bán hàng và vận hành**

- Cách trả tiền mặc định là CHUYỂN KHOẢN, không phải cổng thẻ: cổng thẻ và
  PayPal cần tài khoản thương gia đứng tên pháp nhân, không tự dựng được.
- `/hoc/goi-hoc` đặt đơn và nhận mã chuyển khoản; `/quan-tri/don-hang` là
  chỗ quản trị đối chiếu sao kê rồi cấp quyền học, có ghi chú bắt buộc và nhật
  ký.
- Giá chưa được chủ trường duyệt thì SERVER từ chối đặt mua, không chỉ ẩn nút.

**Đã chạy thật:** cả ba engine (đọc, nghe, giảng dạy) đang chạy trên máy chủ
`ovh-fra` và nối vào ứng dụng qua đường hầm SSH. Một lượt trong lớp mất
khoảng 4 giây, câu Anna đáp hiện ngay lập tức vì nó lấy từ kịch bản bài học.

**Điều phải nói rõ:** model cỡ nhỏ chạy CPU KHÔNG đủ để làm người đối thoại tự
do - đo được 25-45 giây một câu với 7B, và 3B thì có lượt trả lời tiếng Việt
bằng tiếng Trung. Vì vậy câu Anna nói là kịch bản viết tay, model chỉ lo phần
chữa lỗi. Bảng số đo và các chốt chặn ở `docs/ENGINE-TU-HOST.md`.

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
| ~~Khóa Anthropic~~ | KHÔNG CẦN NỮA - bộ giảng dạy chạy tự host, xem `docs/ENGINE-TU-HOST.md` |
| OAuth client của Google (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`) | đăng nhập Google thật; hiện chạy mô phỏng ở máy dev, tắt hẳn ở production |
| ~~Nhà cung cấp STT và TTS~~ | KHÔNG CẦN NỮA - engine giọng nói đã chạy trên máy chủ của trường |
| Nhà cung cấp email giao dịch + khóa | email xác minh thật (hiện ghi ra `data/outbox/`) |
| Mã số doanh nghiệp, mã số thuế, người chịu trách nhiệm nội dung (tên và trụ sở đã có) | công khai trang, mở bán |
| Tài khoản nhận tiền | mở bán (giai đoạn 5) |
| Số tài khoản ngân hàng của trường | hiện thông tin chuyển khoản trên trang gói học |
| Tài khoản PayPal + nhà cung cấp thẻ | chỉ cần nếu muốn thêm cách trả tiền ngoài chuyển khoản |
| Duyệt điều khoản, chính sách hủy và hoàn tiền | công khai trang, mở bán |
| Chốt giá kinh doanh thật | hiện giá trong seed là giá tham khảo, `approved_for_sale = false` |
