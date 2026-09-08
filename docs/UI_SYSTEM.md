# Hệ thống thiết kế Việt Đức

Thẩm mỹ đích: học viện ngôn ngữ hiện đại - tri thức gặp công nghệ. Thoáng, có
chiều sâu, chữ rõ, hình có mục đích. Không phải dashboard SaaS đại trà, cũng
không phải app học tiếng cho trẻ con.

## Bảng màu — lấy từ logo, không phải chọn tự do

Màu đo trực tiếp từ tệp logo bằng `npx tsx scripts/lay-mau-logo.ts`.
**Đỏ là màu chính** theo yêu cầu của chủ dự án.

| Token | Giá trị | Lấy từ | Vai trò |
|---|---|---|---|
| `--brand` | `#CA2427` | đỏ cờ Việt Nam trong logo | đỏ dùng cho CHỮ và viền |
| `--brand-fill` | `#CA2427` | như trên | đỏ dùng cho MẶT PHẲNG: nút chính, bong bóng, khối nhấn |
| `--band` | `#8E1A1D` | đỏ sẫm | dải nền lớn, chữ trắng đạt 9.1:1 |
| `--gold` | `#C28E43` | chữ VIET DUC | màu phụ: huy hiệu, viền, thanh tiến độ |
| `--star` | `#F9DA07` | ngôi sao trên cờ | điểm nhấn nhỏ |
| `--ink` | `#241A17` | — | chữ chính, ấm để hợp với đỏ và vàng |
| `--paper` | `#FAF7F4` | — | nền giấy hơi ấm; trắng lạnh làm đỏ trông như báo lỗi |

Hai quy tắc không được phá:

1. **Vàng kim không bao giờ mang chữ trắng.** Trắng trên `#C28E43` chỉ 2.9:1.
   Chữ trên nền vàng luôn là `--on-gold`.
2. **`--brand` và `--brand-fill` đi ngược chiều khi đổi chủ đề.** Đỏ dùng cho
   chữ phải SÁNG lên trên nền tối mới đọc được; đỏ dùng cho mặt phẳng mà sáng
   lên thì thành hồng và mất chất thương hiệu. Vì vậy chúng là hai token riêng.

Các token dẫn xuất (`--forest-700`, `--paper-raised`, `--line`, `--muted`...) khai
báo đầy đủ trong `src/styles/tokens.css`, kèm bảng tương phản đã đo trong chính
tệp đó. Chế độ tối khai báo hai lần: `[data-theme="dark"]` cho lựa chọn tường
minh và `@media (prefers-color-scheme: dark)` cho người chưa chọn gì.

## Chữ

- Nội dung: `Inter` với dự phòng `Segoe UI`, `system-ui`. Đủ dấu tiếng Việt, đủ
  umlaut và ß.
- Cỡ tối thiểu cho nội dung là **16px**; nhãn và siêu dữ liệu 14px; không nhỏ hơn.
- Thang: `--fs-xs 13px` - `--fs-sm 14px` - `--fs-md 16px` - `--fs-lg 18px` -
  `--fs-xl 22px` - `--fs-2xl 28px` - `--fs-3xl 36px` - `--fs-4xl 48px` -
  `--fs-hero clamp(38px, 5.2vw, 62px)`.
- Chiều cao dòng: 1.15 cho tiêu đề, 1.65 cho văn bản dài.
- Chữ tiếng Đức trong ngữ cảnh tiếng Việt bọc trong `<span lang="de">` để trình
  đọc màn hình phát âm đúng.

## Nhịp, bo góc, đổ bóng

Spacing theo bậc 4px: `--s-1` 4 tới `--s-14` 96. Bo góc: `--r-sm` 8, `--r-md` 14,
`--r-lg` 22, `--r-pill` 999. Bóng dùng ba mức mềm, luôn có sắc xanh chứ không
phải đen thuần, để bóng không bị xám bẩn trên nền `--paper`.

## Chuyển động

`--motion-fast` 140ms, `--motion` 220ms, `--motion-slow` 420ms, easing
`cubic-bezier(.22,.61,.36,1)`. Toàn bộ nằm trong khối
`@media (prefers-reduced-motion: reduce)` để tắt sạch khi người dùng yêu cầu -
kể cả hiệu ứng trạng thái của avatar giáo viên.

## Trạng thái bắt buộc

Mọi thành phần tương tác khai báo đủ tám trạng thái: `hover`, `focus-visible`,
`active`, `disabled`, `loading`, `empty`, `success`, `error`. Focus ring là
đường viền 2px `--focus` cách 2px, hiện trên **mọi** nền - kiểm cả trên band xanh
đậm lẫn trên nút vàng chanh.

## Thành phần đã dựng

`Button` (primary / secondary / ghost / danger, có `loading`), `Field` (label,
hint, lỗi, `aria-describedby`), `Card`, `Badge`, `SkillMeter`, `Stepper`,
`Alert`, `EmptyState`, `Reveal` (hiệu ứng vào màn, tự tắt khi reduced-motion),
`ThemeToggle`, `SiteHeader`, `SiteFooter`, `LearnNav`, `AdminNav`.

## Điểm gãy

`390px` (mốc kiểm bắt buộc), `768px`, `1024px`, `1440px`. Lưới nội dung rộng tối
đa `1200px`, lề ngoài `--s-6` trên mobile. Không thành phần nào được phép tràn
ngang; bảng dài nằm trong khối `overflow-x:auto` của riêng nó.

## Logo

Wordmark chữ "Lingora" với dấu ngôn ngữ trên chữ "i" thay cho dấu chấm, và một
biểu tượng vuông (chữ L lồng trong hình bong bóng thoại). Sinh bằng
`npm run logo` ra `public/brand/`: `wordmark.svg`, `wordmark-dark.svg`,
`mark.svg`, `favicon.svg`, `icon-512.png` (nếu có sharp), `og.svg`.
Toàn bộ là SVG viết tay trong `scripts/logo.ts`, không phụ thuộc dịch vụ ngoài.

## Ngôn ngữ trên màn hình: ai đọc cái gì

Ba nhóm người đọc ba thứ khác nhau, và không được trộn lẫn:

| Người đọc | Chỗ | Cách viết |
|---|---|---|
| Người học và khách | trang công khai, khu học viên | Ngôn ngữ sản phẩm: "Lớp học bằng giọng nói chưa mở", "Chưa mở thanh toán". Nói cái gì dùng được và cái gì chưa. |
| Chủ dự án và nhân viên | `/quan-tri` | Ngôn ngữ kỹ thuật: `live` / `mock`, tên bảng, tên cờ cấu hình. Checklist mở bán nằm ở đây. |
| Lập trình viên | `docs/`, comment trong code | Chi tiết đầy đủ: tên biến môi trường, đường dẫn tệp, các bước kích hoạt. |

Chữ như "chế độ mô phỏng có nhãn", "adapter chưa kết nối", hay đường dẫn tới
`docs/INTEGRATIONS.md` **không được xuất hiện trên màn hình của người học**. Nó
đúng về mặt kỹ thuật nhưng vô nghĩa với họ, và làm trang giới thiệu trông như
một bảng báo lỗi.

Điều này KHÔNG có nghĩa là giấu sự thật. Người học vẫn được biết chính xác cái
gì chưa chạy - chỉ là bằng câu họ hiểu được.

Thành phần `.note-quiet` dùng cho những điều bắt buộc phải nói nhưng không phải
cảnh báo, ví dụ lời khai báo giáo viên là AI. Một hộp `alert` cho việc đó làm
trang trông như đang báo lỗi, và hai hộp cạnh nhau thì càng nặng.

## Nguyên tắc nội dung giao diện

- Không nhận xét học viên, con số người học, chứng chỉ hay logo đối tác bịa đặt.
- Mọi chỗ có giáo viên AI đều nói rõ đó là AI, ở ngay nơi người học nhìn thấy.
- Không streak giả, không thông báo gây áp lực học.
- Icon mạng xã hội chỉ render khi `brand.ts` có URL thật.
