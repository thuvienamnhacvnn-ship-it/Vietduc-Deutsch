# Hệ thống thiết kế Lingora

Thẩm mỹ đích: học viện ngôn ngữ hiện đại - tri thức gặp công nghệ. Thoáng, có
chiều sâu, chữ rõ, hình có mục đích. Không phải dashboard SaaS đại trà, cũng
không phải app học tiếng cho trẻ con.

## Bảng màu (theo hướng nghệ thuật trong bản giao việc)

| Token | Giá trị | Vai trò |
|---|---|---|
| `--paper` | `#F8FAF9` | Nền trang |
| `--forest` | `#154B3D` | Xanh ngọc đậm - màu cấu trúc, band, nút chính |
| `--lime` | `#DEF59A` | Vàng chanh - **chỉ** cho hành động chính và thanh tiến độ |
| `--ink` | `#203B34` | Chữ chính |

Vàng chanh dùng có tiết chế. Nó không bao giờ là nền của một khối lớn và không
bao giờ mang chữ trắng: `--on-lime` là `#153A2E`, đạt tương phản 9.6:1.

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

## Nguyên tắc nội dung giao diện

- Không nhận xét học viên, con số người học, chứng chỉ hay logo đối tác bịa đặt.
- Mọi chỗ có giáo viên AI đều nói rõ đó là AI, ở ngay nơi người học nhìn thấy.
- Không streak giả, không thông báo gây áp lực học.
- Icon mạng xã hội chỉ render khi `brand.ts` có URL thật.
