# Tích hợp dịch vụ ngoài

Mỗi dịch vụ ngoài đứng sau một adapter trong `src/lib/adapters/`. Adapter có hai
bản cài đặt: `live` và `mock`. Bản mock **luôn** trả về `mode: "mock"` và giao
diện hiển thị nhãn đó cho người dùng. Không có khóa thì hệ thống vẫn chạy đủ
luồng ở chế độ mock - và không bao giờ được báo cáo là đã tích hợp thật.

**Ba dịch vụ nặng nhất KHÔNG còn là dịch vụ ngoài nữa.** Đọc tiếng Đức, nghe
tiếng Đức và bộ giảng dạy đã chuyển sang phần mềm mã nguồn mở chạy trên máy chủ
của trường - không khóa, không tính tiền theo lượt. Xem `docs/ENGINE-TU-HOST.md`
để biết cài gì, đo được bao nhiêu, và nối vào ứng dụng thế nào.

Những dịch vụ còn lại (email, thanh toán thẻ, đăng nhập Google) vẫn ở `mock` cho
tới khi chủ dự án cung cấp tài khoản. Bản mock **luôn** tự khai là mock.

## Bộ giảng dạy - TỰ HOST

- Adapter: `src/lib/adapters/llm.ts`
- Biến: `LINGORA_LLM_URL`, `LINGORA_LLM_TOKEN`, `LINGORA_LLM_MODEL`
- Chạy llama.cpp với model GGUF mã nguồn mở, phơi ra theo chuẩn OpenAI. Chuẩn đó
  được chọn để đổi model hoặc đổi engine sau này không phải sửa code.
- `ANTHROPIC_API_KEY` vẫn được chấp nhận nếu chủ dự án muốn trả tiền cho dịch
  vụ ngoài, nhưng đó không còn là đường mặc định.

## Nghe tiếng Đức (STT) - TỰ HOST

- Adapter: `src/lib/adapters/giong-noi.ts`
- Biến: `LINGORA_VOICE_URL`, `LINGORA_VOICE_TOKEN` (dùng chung với phần đọc)
- whisper.cpp, hai model: `nhanh` cho lớp học, `ky` cho chấm bài.
- Thiếu engine: lớp học vẫn dùng được bằng cách gõ; KHÔNG có transcript giả nào
  được sinh ra.

## Đọc tiếng Đức (TTS) - TỰ HOST

- Adapter: `src/lib/adapters/giong-noi.ts`
- Biến: `LINGORA_VOICE_URL`, `LINGORA_VOICE_TOKEN`
- piper với giọng `de_DE-thorsten-medium`, nhanh hơn thời gian thực 12 lần trên
  CPU, câu đã đọc được lưu đệm.
- Thiếu engine: rơi về `speechSynthesis` của trình duyệt, **có nhãn** cho người
  học biết đó là giọng máy của thiết bị. Fallback này không được tính là đã có
  giọng đọc.

## Avatar

- Adapter: `src/lib/adapters/avatar.ts`
- v1 là avatar SVG có trạng thái nghe / suy nghĩ / nói, chạy hoàn toàn cục bộ.
- Avatar nói đồng bộ khẩu hình là một tích hợp riêng, chưa kết nối. Giao diện ghi
  rõ điều đó thay vì gợi ý là đã có.

## Thanh toán

**Cách mặc định là chuyển khoản ngân hàng**, xem `src/lib/thanh-toan.ts`. Nó
không cần nhà cung cấp nào, chỉ cần ba biến `LINGORA_BANK_*` và một người đối
chiếu sao kê ở `/quan-tri/don-hang`. Phần dưới đây chỉ cần khi chủ trường muốn
mở thêm cách trả tiền.

- Adapter: `src/lib/adapters/payments/` (`paypal.ts`, `card.ts`)
- Biến: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`,
  `PAYPAL_ENV`; nhà cung cấp thẻ điền sau khi chốt.
- Visa là **phương thức thẻ**, không phải cổng thanh toán: cần một payment
  provider có hosted checkout hoặc hosted fields. Trước khi chốt phải kiểm: hỗ trợ
  quốc gia của doanh nghiệp, EUR, thanh toán định kỳ, và các loại thẻ thật sự
  chấp nhận được.
- Ứng dụng không bao giờ chạm vào số thẻ hay CVV.
- Cần từ chủ dự án: pháp nhân, tài khoản nhận tiền, thông tin thuế, chính sách
  hủy và hoàn tiền đã được duyệt.

## Đăng nhập bằng Google

- Adapter: `src/lib/adapters/oauth-google.ts`
- Biến: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Luồng: Authorization Code + PKCE, chuyển hướng phía server. `client_secret`
  không bao giờ ra tới trình duyệt và không phải nạp script của Google vào trang.
- Người dùng đã đăng nhập Gmail sẵn thì Google tự chọn tài khoản đó và quay về
  gần như tức thì. Cố ý không đặt `prompt=select_account` vì nó sẽ ép thêm một
  bước chọn cho người chỉ có một tài khoản.
- Chỉ chấp nhận tài khoản có `email_verified = true`. Email chưa được Google xác
  minh không đủ để nối vào một tài khoản có sẵn.
- Danh tính là trường `sub` của Google, không phải email: người dùng đổi được
  địa chỉ Gmail, còn `sub` thì không.

**Khi chưa có khóa:** ở máy phát triển, luồng chạy bằng màn hình mô phỏng nội bộ
tại `/dang-nhap/google-mo-phong` — nó tự khai "Đây không phải Google" ngay trên
đầu trang và không giống giao diện của Google. Ở production thì màn hình đó trả
404 và nút Google bị vô hiệu kèm lý do. Không có màn hình giả nào chạy ở
production, dù chỉ là nội bộ.

**Các bước kích hoạt:**

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID,
   loại **Web application**.
2. Authorized redirect URIs: thêm `https://<tên miền>/api/auth/google/callback`
   (và `http://localhost:3055/api/auth/google/callback` nếu muốn thử ở máy).
3. Màn hình OAuth consent: điền tên ứng dụng, logo, liên kết Điều khoản và Riêng
   tư. Scope chỉ cần `openid`, `email`, `profile` — đây là nhóm không cần Google
   thẩm định, nên không phải chờ duyệt.
4. Đặt `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào môi trường triển khai.
5. Kiểm `GET /api/suc-khoe`: `adapters.oauth_google` phải chuyển thành `live`.

## Email giao dịch

- Adapter: `src/lib/adapters/mail.ts`
- Biến: `LINGORA_MAIL_PROVIDER`, `LINGORA_MAIL_KEY`, `LINGORA_MAIL_FROM`
- Bản mock ghi email ra `data/outbox/` và in đường dẫn xác minh ra console, để
  luồng đăng ký chạy được end-to-end khi phát triển.
- Không gửi email hàng loạt cho tới khi chủ dự án cho phép.

## Object storage cho audio

- Adapter: `src/lib/adapters/storage.ts`
- Biến: `LINGORA_STORAGE_DRIVER` (`local` hoặc `s3`), `LINGORA_S3_*`
- Mặc định khi phát triển: đĩa cục bộ trong `data/uploads/`. Trên VPS dùng
  S3-compatible; hàm `storeAudio` ném lỗi rõ ràng nếu đặt driver `s3` mà chưa có
  bản cài đặt, thay vì âm thầm ghi xuống đĩa của một instance web bất kỳ.
- Đã dùng thật: ghi âm bài Nói trong bài kiểm tra xếp lớp. Giới hạn 8 MB, chỉ
  nhận các định dạng trình duyệt thật sự tạo ra, tên tệp do server sinh, mỗi tệp
  có `expires_at` theo `LINGORA_AUDIO_RETENTION_DAYS`.
- Còn thiếu: URL ký có hạn để phát lại, và job nền xoá tệp quá hạn.
- Thời gian giữ audio thô cấu hình bằng `LINGORA_AUDIO_RETENTION_DAYS`, mặc định
  ngắn.

## Checklist kích hoạt (bàn giao cho chủ dự án)

1. Tạo tài khoản từng dịch vụ, lấy khóa, đặt vào secret manager của môi trường
   triển khai - **không** dán vào hội thoại, không commit vào Git.
2. Đặt hạn mức chi tiêu ở phía nhà cung cấp trước khi bật.
3. Chạy `npm run kiem-tra-ket-noi` (sẽ có ở giai đoạn 3) để xác nhận từng adapter
   chuyển từ `mock` sang `live`.
4. Chỉ sau khi từng adapter báo `live` và test tương ứng chuyển PASS trong
   `ACCEPTANCE.md` thì mới được coi là đã tích hợp.
