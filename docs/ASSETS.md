# Danh mục tài nguyên

Mọi hình ảnh trong dự án là **SVG do repo này tự sinh hoặc tự vẽ**. Không có ảnh
stock, không có tệp tải từ nguồn ngoài, không có request tới CDN nào. Vì vậy cột
"nguồn / quyền" đơn giản và không có rủi ro bản quyền.

Không có ô placeholder nào trong bản bàn giao: mọi vị trí cần hình đều đã có
hình thật.

## Bộ nhận diện — `public/brand/`

Sinh lại bằng `npm run logo` (mã nguồn: `scripts/logo.ts`).

| Tệp | Dùng ở | Kích thước | Nội dung | Alt text |
|---|---|---|---|---|
| `wordmark.svg` | tài liệu, email nền sáng | 420×96 | Biểu tượng + chữ "Lingora", xanh ngọc đậm | "Lingora" |
| `wordmark-dark.svg` | nền tối | 420×96 | Bản chữ trắng của trên | "Lingora" |
| `mark.svg` | icon vuông, avatar | 80×80 | Bong bóng thoại chứa chữ L | "Lingora" |
| `favicon.svg` | tab trình duyệt, icon ứng dụng | 64×64 | Nền xanh đặc, chữ L vàng chanh — đọc được ở 16px | — |
| `og.svg` | ảnh chia sẻ mạng xã hội | 1200×630 | Nền xanh, biểu tượng, tên, tagline và câu hứa | như tiêu đề trang |

Chữ trong wordmark là `<text>` sống, không phải đường path: trình đọc màn hình
đọc được, và đổi tên thương hiệu trong `src/lib/brand.ts` rồi chạy lại
`npm run logo` là ra bộ mới.

## Hình trong giao diện

| Vị trí | Thành phần | Nội dung | Khả năng tiếp cận |
|---|---|---|---|
| Hero trang chủ | `src/components/HeroArt.tsx` | Một lượt hội thoại thật: giáo viên hỏi "Wo wohnst du?", học viên đáp "Ich wohne in Berlin.", kèm thẻ gợi ý ngữ pháp và thanh mic | `role="img"` với `<title>` và `<desc>` tiếng Việt mô tả đầy đủ nội dung |
| Header, footer, khu auth | `src/components/Logo.tsx` | Logo inline, tô bằng `currentColor` nên đổi theo chủ đề | SVG `aria-hidden`, tên thương hiệu nằm trong `.sr-only` |
| Thẻ giáo viên AI | `src/app/(site)/giao-vien-ai/page.tsx` | Vòng tròn màu có chữ cái đầu của vai trò | `aria-hidden`, tên đầy đủ nằm ở tiêu đề bên cạnh |
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
