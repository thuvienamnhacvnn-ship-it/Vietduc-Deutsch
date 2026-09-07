# Lingora

Nền tảng học tiếng Đức A1–B2 cho người Việt, giảng dạy bằng đội ngũ AI Agent.

"Lingora" là tên làm việc. Đổi nó ở `src/lib/brand.ts` là đổi toàn bộ giao diện,
metadata, email và logo.

> **Trạng thái:** giai đoạn 0 và 1 hoàn tất — nền tảng, giao diện, tài khoản và
> cơ sở dữ liệu chạy thật. Mọi dịch vụ ngoài (Claude, STT, TTS, email, thanh
> toán, đăng nhập Google) đang chạy adapter **mock có nhãn**. Chưa mở bán, chưa thu tiền.
> Đọc `PROJECT_STATE.md` và `ACCEPTANCE.md` để biết chính xác cái gì đã chạy.

## Yêu cầu

- Node.js 20 trở lên (đang phát triển trên v24.16.0)
- Không cần cài PostgreSQL khi phát triển: ứng dụng dùng PGlite, tức chính
  Postgres biên dịch sang WASM. Xem `docs/adr/0002-pglite.md`.

## Chạy ở máy

```bash
npm install
npm run db:push        # áp migration trong drizzle/ vào database
npm run seed           # dữ liệu demo, in ra mật khẩu tài khoản demo
npm run dev            # http://localhost:3055
```

`npm run seed` in mật khẩu của hai tài khoản demo ra màn hình **một lần**; chúng
không được lưu trong tệp nào.

> PGlite chỉ cho **một tiến trình** mở thư mục dữ liệu. Dừng `npm run dev` trước
> khi chạy `db:push` hoặc `seed`, nếu không sẽ gặp khóa cảnh báo (cố ý — mở hai
> lần sẽ làm hỏng database).

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run dev` | chạy phát triển ở cổng 3055 |
| `npm run build` / `npm run start` | build và chạy production |
| `npm run typecheck` | kiểm kiểu TypeScript |
| `npm run lint` | ESLint |
| `npm run db:push` | áp migration SQL trong `drizzle/` |
| `npm run seed` | nạp dữ liệu demo có nhãn |
| `npm run logo` | sinh lại bộ nhận diện vào `public/brand/` |
| `npm test` | chạy cả hai bộ test end-to-end (server phải đang chạy) |
| `node tests/smoke.mjs` | 37 kiểm tra nền tảng và phân quyền |
| `node tests/google.mjs` | 24 kiểm tra luồng đăng nhập Google |

## Đổi schema

```bash
# 1. sửa src/lib/db/schema.ts
npx drizzle-kit generate     # sinh SQL có phiên bản vào drizzle/
npm run db:push              # áp vào database (dev server phải đang tắt)
```

`drizzle-kit push` không dùng được với PGlite (nó cần Postgres qua TCP), nhưng
`generate` chạy offline. Chính các tệp SQL đó sẽ chạy trên Postgres thật khi
triển khai — không có nhánh riêng cho môi trường nào.

## Cấu hình

Chép `.env.example` thành `.env.local` và điền những gì bạn có. Tệp mẫu chỉ liệt
kê **tên biến** kèm giải thích, không chứa giá trị.

Thiếu biến nào thì adapter tương ứng chạy ở chế độ **mock có nhãn** và ứng dụng
vẫn chạy đủ luồng. Kiểm tra trạng thái thật ở `GET /api/suc-khoe` hoặc trang
`/quan-tri`.

Chỉ cần đặt `DATABASE_URL` là ứng dụng chuyển sang Postgres thật, không sửa dòng
code nào.

## Tài liệu

| Tệp | Nội dung |
|---|---|
| `PROJECT_STATE.md` | đã làm gì, còn gì, bẫy đã gặp, việc tiếp theo |
| `REQUIREMENTS.md` | toàn bộ yêu cầu có ID và trạng thái |
| `ACCEPTANCE.md` | từng yêu cầu ánh xạ tới test, bằng chứng, trạng thái |
| `CONTENT_COVERAGE.md` | giáo trình đã phủ tới đâu |
| `docs/ARCHITECTURE.md` | kiến trúc và ranh giới |
| `docs/DATA_MODEL.md` | vì sao các bảng có hình dạng như vậy |
| `docs/ROUTES.md` | hợp đồng route và API |
| `docs/UI_SYSTEM.md` | hệ thiết kế |
| `docs/INTEGRATIONS.md` | dịch vụ ngoài và checklist kích hoạt |
| `docs/ASSETS.md` | danh mục tài nguyên hình ảnh |
| `docs/adr/` | quyết định kiến trúc và trade-off |

## Nguyên tắc của dự án này

- **Nói rõ ai đang dạy.** Anna, Lukas, Mia có tên và tính cách để người học thấy
  có ai đó đồng hành, nhưng không chỗ nào được để người học hiểu nhầm họ là
  người thật. Lời khai báo chuẩn ở `AI_DISCLOSURE` (`src/content/agents.ts`).
- **Thiếu dữ liệu thì nói là thiếu.** Kỹ năng chưa đủ bằng chứng hiển thị là
  chưa đánh giá được, không có điểm suy đoán.
- **Mock không bao giờ được trình bày như thật.** Adapter mock tự khai và giao
  diện dán nhãn.
- **Không nhận xét học viên, chứng chỉ, con số hay logo đối tác bịa đặt.**
- **Phân quyền ở server.** Ẩn nút trên giao diện không phải là bảo mật.
