# ADR-0001 — Next.js 16 + Drizzle + Postgres, một tiến trình web và một worker

Ngày: 07.09.2026 · Trạng thái: chấp nhận

## Bối cảnh
Đặc tả yêu cầu TypeScript, React/Next.js, PostgreSQL, ORM có migration, worker cho
job nền, object storage, triển khai VPS bằng Docker Compose, và **không** dựng
microservices ngay từ đầu.

## Quyết định
Một repo, một ứng dụng Next.js (App Router) phục vụ cả trang công khai, khu học
viên, cổng quản trị và API; một worker riêng cùng codebase cho job nền; Postgres
làm nguồn sự thật duy nhất; Drizzle sinh migration SQL.

## Hệ quả
- Lớp học giọng nói dùng SSE cho luồng chữ và HTTP cho audio, không cần WebSocket
  server riêng — giảm một thành phần phải vận hành trên VPS.
- Khi cần tách, ranh giới rõ nhất là `jobs/` và `adapters/`; chúng đã không phụ
  thuộc vào request context.
