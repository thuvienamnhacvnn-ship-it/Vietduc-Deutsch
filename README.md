# Việt Đức — học tiếng Đức trực tuyến

Nền tảng học tiếng Đức A1–B2 cho người Việt của **Việt Đức Group**, giảng dạy
bằng đội ngũ AI Agent.

Thương hiệu đổi tập trung ở `src/lib/brand.ts`. Hệ màu lấy trực tiếp từ tệp logo
(`npx tsx scripts/lay-mau-logo.ts`) — xem `src/styles/tokens.css` và
`docs/ASSETS.md`.

**Bản đang chạy:** https://deutsch.57-129-45-199.sslip.io — xem `docs/TRIEN-KHAI.md`.

## Trạng thái

**Chạy thật:** tài khoản và phân quyền, bài kiểm tra xếp lớp phân nhánh nhiều
giai đoạn, lớp học nói, ôn tập ngắt quãng, duyệt nội dung, đặt gói học bằng
chuyển khoản. 130 kiểm thử end-to-end đều xanh.

**Ba dịch vụ AI nặng nhất KHÔNG mua theo lượt** — chúng chạy trên máy chủ của
trường bằng phần mềm mã nguồn mở (piper, whisper.cpp, llama.cpp). Cài đặt, số đo
thật và quyết định kiến trúc ở `docs/ENGINE-TU-HOST.md`.

**Còn ở chế độ mock có nhãn:** email giao dịch, thanh toán thẻ và PayPal, đăng
nhập Google, lưu trữ đám mây, avatar khẩu hình. Thiếu cấu hình thì adapter tự
khai là mock và giao diện dán nhãn — không có màn hình giả nào được trình bày
như thật.

**Chưa mở bán, chưa thu tiền của ai.** Giá trong dữ liệu mẫu là giá tham khảo và
server từ chối đặt mua cho tới khi chủ trường duyệt.

`PROJECT_STATE.md` và `ACCEPTANCE.md` ghi chính xác từng mục.

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
| `npm run logo` | sinh lại favicon và ảnh chia sẻ (logo chính là tệp của khách) |
| `npx tsx scripts/lay-mau-logo.ts <png>` | đo màu và độ tương phản từ một tệp ảnh |
| `npm test` | chạy cả bốn bộ test end-to-end (server phải đang chạy) |
| `npm run dat-quyen -- <email> admin` | đặt vai trò cho một tài khoản |
| `npm run icon:app` | sinh icon cho bản cài về màn hình chính |
| `node tests/smoke.mjs` | 38 kiểm tra nền tảng và phân quyền |
| `node tests/google.mjs` | đăng nhập Google: 24 kiểm tra ở chế độ mô phỏng, 15 khi đã cắm khoá thật |
| `node tests/xep-lop.mjs` | 53 kiểm tra bài kiểm tra xếp lớp |
| `node tests/lop-hoc.mjs` | 15 kiểm tra lớp học, ôn tập và gói học |

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
| `docs/TRIEN-KHAI.md` | bản đang chạy ở đâu, cập nhật thế nào, dựng lại từ đầu ra sao |
| `docs/ENGINE-TU-HOST.md` | engine giọng nói và bộ giảng dạy tự host: cài đặt, số đo, giới hạn |
| `docs/INTEGRATIONS.md` | dịch vụ ngoài còn lại và checklist kích hoạt |
| `docs/ASSETS.md` | danh mục tài nguyên hình ảnh |
| `docs/adr/` | quyết định kiến trúc và trade-off |

## Việc của người thật

Ba việc hệ thống cố ý KHÔNG tự làm, vì chúng cần một người chịu trách nhiệm:

1. **Duyệt bài học.** Nội dung do máy soạn nằm ở trạng thái chờ duyệt cho tới
   khi một biên tập viên đọc và bấm duyệt tại `/quan-tri/bai-hoc`. Học viên
   không thấy bài chưa duyệt.
2. **Đối chiếu sao kê và cấp quyền học.** Học viên đặt gói rồi chuyển khoản kèm
   mã; quản trị tìm mã trong sao kê ngân hàng rồi xác nhận tại
   `/quan-tri/don-hang`. Không có webhook ngân hàng nào tự làm việc này.
3. **Duyệt giá.** Giá trong dữ liệu mẫu là giá tham khảo. Server từ chối mọi đơn
   trên gói chưa được duyệt bán.

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
