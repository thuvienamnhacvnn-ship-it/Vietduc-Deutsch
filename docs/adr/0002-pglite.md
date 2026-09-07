# ADR-0002 — PGlite làm driver mặc định khi phát triển

Ngày: 07.09.2026 · Trạng thái: chấp nhận

## Bối cảnh
Máy phát triển không cài được PostgreSQL bản địa: mọi `.exe` của Postgres bị
Smart App Control chặn, và không có Docker/WSL. Đặc tả vẫn yêu cầu Postgres.

## Quyết định
Dùng `@electric-sql/pglite` (chính Postgres biên dịch sang WASM) khi không có
`DATABASE_URL`; dùng `pg` khi có. Schema, migration và mọi truy vấn viết một lần,
chạy nguyên vẹn trên cả hai.

## Hệ quả
- Không có code path riêng cho dev — thứ chạy ở máy là Postgres thật, chỉ khác
  cách nhúng.
- PGlite độc quyền thư mục dữ liệu. Có khóa advisory ghi PID trong
  `data/pgdata/.lingora-lock`; mở lần hai khi tiến trình cũ còn sống sẽ báo lỗi
  kèm hướng dẫn, thay vì làm hỏng dữ liệu.
- Trên VPS chỉ cần đặt `DATABASE_URL`; không phải đổi dòng code nào.

## Phương án đã loại
- SQLite: khác phương ngữ SQL, sẽ phải viết lại truy vấn khi lên production.
- Postgres qua Docker: không dùng được trên máy này.
