# Tích hợp dịch vụ ngoài

Mỗi dịch vụ ngoài đứng sau một adapter trong `src/lib/adapters/`. Adapter có hai
bản cài đặt: `live` và `mock`. Bản mock **luôn** trả về `mode: "mock"` và giao
diện hiển thị nhãn đó cho người dùng. Không có khóa thì hệ thống vẫn chạy đủ
luồng ở chế độ mock - và không bao giờ được báo cáo là đã tích hợp thật.

Trạng thái hôm nay: **toàn bộ đang ở `mock`**. Chưa có khóa dịch vụ nào trong dự
án này. Đây là trạng thái BLOCKED trong `ACCEPTANCE.md`, không phải PASS.

## LLM - Claude (suy luận và giảng dạy)

- Adapter: `src/lib/adapters/llm.ts`
- Biến môi trường: `ANTHROPIC_API_KEY`, `LINGORA_LLM_MODEL`
- Cần khi kích hoạt: tài khoản Anthropic, chọn model theo tài liệu chính thức tại
  thời điểm triển khai, đặt hạn mức chi tiêu.
- Lưu ý: **không** ghi tên model cứng trong code sản phẩm; tên đọc từ cấu hình để
  không tuyên bố năng lực chưa kiểm chứng.

## STT - nhận dạng giọng nói

- Adapter: `src/lib/adapters/stt.ts`
- Biến: `LINGORA_STT_PROVIDER`, `LINGORA_STT_KEY`
- Ứng viên cần đánh giá khi có ngân sách: dịch vụ hỗ trợ tiếng Đức có streaming và
  VAD. Phải kiểm thật với giọng người Việt nói tiếng Đức trước khi chốt.
- Bản mock trả transcript giả có nhãn; nó **không** được dùng để chấm kỹ năng Nói.

## TTS - tổng hợp giọng nói tiếng Đức

- Adapter: `src/lib/adapters/tts.ts`
- Biến: `LINGORA_TTS_PROVIDER`, `LINGORA_TTS_KEY`, `LINGORA_TTS_VOICE_ANNA`,
  `LINGORA_TTS_VOICE_LUKAS`
- Fallback là `speechSynthesis` của trình duyệt, **có nhãn "giọng dự phòng của
  trình duyệt"** hiển thị cho người học. Fallback này không được tính là đã tích
  hợp TTS.
- Trước khi chốt nhà cung cấp: nghe kiểm tra thật giọng đọc tiếng Đức, kiểm cách
  đọc tên riêng và tốc độ chậm.

## Avatar

- Adapter: `src/lib/adapters/avatar.ts`
- v1 là avatar SVG có trạng thái nghe / suy nghĩ / nói, chạy hoàn toàn cục bộ.
- Avatar nói đồng bộ khẩu hình là một tích hợp riêng, chưa kết nối. Giao diện ghi
  rõ điều đó thay vì gợi ý là đã có.

## Thanh toán

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

## Email giao dịch

- Adapter: `src/lib/adapters/mail.ts`
- Biến: `LINGORA_MAIL_PROVIDER`, `LINGORA_MAIL_KEY`, `LINGORA_MAIL_FROM`
- Bản mock ghi email ra `data/outbox/` và in đường dẫn xác minh ra console, để
  luồng đăng ký chạy được end-to-end khi phát triển.
- Không gửi email hàng loạt cho tới khi chủ dự án cho phép.

## Object storage cho audio

- Adapter: `src/lib/adapters/storage.ts`
- Biến: `LINGORA_STORAGE_DRIVER` (`local` hoặc `s3`), `LINGORA_S3_*`
- Mặc định khi phát triển: đĩa cục bộ trong `data/uploads/`, phục vụ qua URL ký có
  hạn. Trên VPS dùng S3-compatible.
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
