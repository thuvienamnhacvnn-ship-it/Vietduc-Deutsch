# ADR-0003 — CSS thuần với custom properties, không Tailwind

Ngày: 07.09.2026 · Trạng thái: chấp nhận

## Bối cảnh
Thư mục home của máy phát triển bản thân nó là một git repository. Tailwind v4
lấy git root làm gốc quét nội dung, nên nó duyệt toàn bộ home và làm `next dev`
treo. Cách chữa (`source("../")`) là một mẹo mong manh gắn với máy này.

## Quyết định
Hệ thiết kế viết bằng CSS custom properties trong `src/styles/tokens.css`, kèm
lớp tiện ích tối thiểu trong `globals.css`, và CSS Module cho thành phần.

## Hệ quả
- Không phụ thuộc bố cục máy phát triển; build giống nhau ở mọi nơi.
- Token là hợp đồng thiết kế thật: đổi một biến là đổi toàn hệ thống, không phải
  tìm-thay chuỗi class.
