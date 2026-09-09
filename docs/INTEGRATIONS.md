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

**Đã cấu hình và đang chạy** trên bản triển khai (09/09/2026).

| Mục | Giá trị |
|---|---|
| Project | `Alamit` (gen-lang-client-0036085459), tài khoản tuxeedoo |
| Tên app người học nhìn thấy | Viet Duc - Deutsch |
| Trạng thái | In production — mọi tài khoản Google đăng nhập được, không cần danh sách test user |
| Phạm vi | `openid email profile` — chỉ tên và địa chỉ email, không đọc Gmail |
| JavaScript origin | `https://deutsch.57-129-45-199.sslip.io` và `http://localhost:3055` |
| Redirect URI | `https://deutsch.57-129-45-199.sslip.io/api/auth/google/callback` và `http://localhost:3055/api/auth/google/callback` |

Khoá nằm trong `.env.production` trên máy chủ (quyền 600), KHÔNG có trong Git.

**Đổi tên miền là phải sửa ba chỗ, thiếu một chỗ là hỏng:** `LINGORA_APP_URL`
trong `.env.production`, JavaScript origin và Redirect URI trong OAuth client.
Redirect URI phải khớp tuyệt đối từng ký tự với `LINGORA_APP_URL` +
`/api/auth/google/callback`; lệch một dấu gạch chéo là Google trả
`redirect_uri_mismatch`.

Phạm vi chỉ gồm dữ liệu không nhạy cảm nên Google **không bắt thẩm định**. Thêm
logo cho app thì mới phải qua thẩm định - đó là lý do phần logo để trống.

Máy phát triển cũng được khai trong cùng một OAuth client, nên nút Google ở
`localhost:3055` chạy thật chứ không còn là bản mô phỏng. Địa chỉ phải là
**localhost**, không phải 127.0.0.1: Google chỉ miễn trừ http cho tên
`localhost`, còn `127.0.0.1` thì phải khai riêng - và redirect_uri gửi đi phải
khớp từng ký tự với cái đã đăng ký.

Luồng cố ý KHÔNG đặt `prompt=select_account`: học viên nào đang đăng nhập sẵn
một tài khoản Google trên máy thì bấm một lần là vào thẳng, không phải chọn lại.

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
