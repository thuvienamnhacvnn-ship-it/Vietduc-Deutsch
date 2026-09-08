# Danh mục tài nguyên

Hai tệp logo do chủ dự án cung cấp; mọi hình còn lại là **SVG do repo này tự
sinh hoặc tự vẽ**. Không có ảnh stock, không có request tới CDN nào. Vì vậy cột
"nguồn / quyền" đơn giản và không có rủi ro bản quyền.

Không có ô placeholder nào trong bản bàn giao: mọi vị trí cần hình đều đã có
hình thật.

## Bộ nhận diện — `public/brand/`

**Logo là tài sản của khách, không phải do dự án vẽ.** Hai tệp gốc nhận từ chủ
dự án, chép nguyên trạng, KHÔNG chỉnh màu và KHÔNG vẽ lại:

| Tệp | Nguồn | Kích thước | Dùng ở |
|---|---|---|---|
| `logo-ngang.png` | `E:\Works\itw\VD\1x\logo vd2.png` | 1985×686 | header trang công khai, thanh điều hướng khu học |
| `logo-doc.png` | `E:\Works\itw\VD\1x\logo vd1.png` | 1349×1278 | bản dọc, dự phòng cho chỗ hẹp chiều ngang |

Logo là ngọn lửa ghép từ cờ Việt Nam (đỏ, sao vàng) và cờ Đức (đen–đỏ–vàng),
kèm chữ VIET DUC GROUP gradient vàng kim.

**Ngọn lửa có mảng đen của cờ Đức.** Trên nền đậm mảng đó biến mất và hình mất
một nửa, nên ở footer và khu đăng nhập logo được đặt trên tấm nền trắng bo góc
(`.logo-plate`). Đây là cách xử lý thông thường cho logo có chi tiết đen, và
trung thực hơn là tự đổi màu logo của khách.

Ba tệp còn lại do `npm run logo` sinh ra (mã nguồn `scripts/logo.ts`):

| Tệp | Dùng ở | Kích thước | Nội dung |
|---|---|---|---|
| `favicon.svg` | tab trình duyệt, icon ứng dụng | 64×64 | Ngọn lửa đơn giản hóa trên nền giấy — logo đầy đủ không đọc ra ở 16px |
| `mark.svg` | chỗ đã có nền sáng sẵn | 64×64 | Cùng hình, không nền |
| `og.svg` | ảnh chia sẻ mạng xã hội | 1200×630 | Nền chuyển sắc đỏ, ngọn lửa, tên và câu hứa |

Hình đơn giản hóa dùng đúng bảng màu đo từ tệp logo, cùng ý tưởng hai lớp lửa
với ngôi sao, nhưng ít chi tiết để còn đọc được ở cỡ nhỏ.

## Màu lấy từ đâu

`npx tsx scripts/lay-mau-logo.ts "<đường dẫn .png>"` tự giải mã PNG bằng zlib có
sẵn của Node và in ra những màu chiếm diện tích lớn nhất kèm độ tương phản. Toàn
bộ bảng màu trong `src/styles/tokens.css` đến từ lần chạy đó, không phải ước
lượng bằng mắt.

## Hình trong giao diện

| Vị trí | Thành phần | Nội dung | Khả năng tiếp cận |
|---|---|---|---|
| Hero trang chủ | `src/components/HeroArt.tsx` | Một lượt hội thoại thật: giáo viên hỏi "Wo wohnst du?", học viên đáp "Ich wohne in Berlin.", kèm thẻ gợi ý ngữ pháp và thanh mic | `role="img"` với `<title>` và `<desc>` tiếng Việt mô tả đầy đủ nội dung |
| Header, footer, khu auth | `src/components/Logo.tsx` | Tệp logo của khách; trên nền đậm đặt trong `.logo-plate` | `alt` là tên đầy đủ kèm tagline |
| Thẻ giáo viên | `src/app/(site)/giao-vien-ai/page.tsx` | Vòng tròn màu có chữ cái đầu của vai trò | `aria-hidden`, tên đầy đủ nằm ở tiêu đề bên cạnh |
| Thanh tiến độ kỹ năng | `.meter` trong `globals.css` | Thanh đặc khi có dữ liệu; **vạch chéo** khi chưa đủ bằng chứng | `role="img"` với `aria-label` nói rõ mức và độ tin cậy, hoặc "chưa đủ bằng chứng để đánh giá" |

## Nhân vật AI

Bản giao việc yêu cầu nhân vật AI nhất quán về ngoại hình và giọng. Hiện tại:

- **Ngoại hình:** avatar hình học đơn giản, cùng một ngôn ngữ đồ họa với logo.
  Anna (giáo viên chính) là avatar trong hero. Chưa có chân dung riêng cho từng
  vai trò — sẽ làm ở giai đoạn 3 cùng với phòng học.
- **Giọng:** chưa có. Cần chọn nhà cung cấp TTS trước; id giọng cấu hình qua
  `LINGORA_TTS_VOICE_ANNA` và `LINGORA_TTS_VOICE_LUKAS`. Xem `docs/INTEGRATIONS.md`.

## Audio bài học

Chưa có tệp audio nào. Khi biên soạn, mỗi tệp phải có một dòng trong bảng
`assets` với `license` và `alt_text` điền đầy đủ — không nhận tệp không rõ nguồn.
