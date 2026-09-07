# Hợp đồng route và API

Ký hiệu quyền: `pub` công khai - `auth` cần đăng nhập - `staff` cần vai trò
admin/editor/support. Trạng thái: `[x]` đã dựng - `[ ]` giai đoạn sau.

## Trang

| Route | Quyền | Mô tả | TT |
|---|---|---|---|
| `/` | pub | Trang giới thiệu: hero, hành trình, chương trình, cách lớp AI hoạt động, giáo viên AI, gói học, FAQ | [x] |
| `/chuong-trinh` | pub | Chi tiết A1-B2, mục tiêu từng cấp | [x] |
| `/lop-hoc-ai` | pub | Lớp học AI hoạt động thế nào, minh bạch về giới hạn | [x] |
| `/giao-vien-ai` | pub | Hồ sơ 7 vai trò AI, nói rõ đây là AI | [x] |
| `/hoc-phi` | pub | Gói học; giá đọc từ `plan_versions` | [x] |
| `/cau-hoi` | pub | FAQ | [x] |
| `/dieu-khoan`, `/rieng-tu` | pub | Pháp lý - chờ người chịu trách nhiệm duyệt trước khi mở bán | [x] |
| `/dang-ky`, `/dang-nhap`, `/quen-mat-khau`, `/dat-lai-mat-khau`, `/xac-minh` | pub | Auth, kèm nút "Tiếp tục với Google" | [x] |
| `/dang-nhap/google-mo-phong` | pub (chỉ dev) | Màn hình chọn tài khoản mô phỏng khi chưa có khóa Google; 404 ở production | [x] |
| `/hoc` | auth | Dashboard: bài kế tiếp, tiến độ 4 kỹ năng, lịch, bài cần ôn, trạng thái gói | [x] |
| `/hoc/ho-so` | auth | Hồ sơ học viên, mục tiêu, múi giờ, accessibility | [x] |
| `/hoc/xep-lop` | auth | Kiểm tra xếp lớp 4 kỹ năng | [ ] GĐ2 |
| `/hoc/lo-trinh` | auth | Lộ trình cá nhân | [ ] GĐ2 |
| `/hoc/lop/[id]` | auth | Phòng học giọng nói | [ ] GĐ3 |
| `/hoc/on-tap` | auth | Ôn tập giãn cách | [ ] GĐ4 |
| `/hoc/goi-hoc` | auth | Gói, hóa đơn, gia hạn | [ ] GĐ5 |
| `/quan-tri` | staff | Tổng quan vận hành | [x] |
| `/quan-tri/hoc-vien` | staff | Danh sách học viên | [x] |
| `/quan-tri/giao-trinh` | staff | CMS bài học + duyệt | [ ] GĐ3 |
| `/quan-tri/cau-hoi` | staff | Ngân hàng câu hỏi | [ ] GĐ2 |
| `/quan-tri/agent` | staff | Prompt, giới hạn, log agent | [ ] GĐ3 |
| `/quan-tri/goi-hoc`, `/quan-tri/thanh-toan` | staff | Gói và giao dịch | [ ] GĐ5 |
| `/quan-tri/van-hanh` | staff | Latency, usage, chi phí, cảnh báo | [ ] GĐ5 |

## API

Mọi endpoint trả lỗi dạng `{ error: { code, message, fields? } }`. Input validate
bằng Zod. Rate limit tính theo IP và theo tài khoản.

| Method | Đường dẫn | Quyền | Input | Output | Rate limit | TT |
|---|---|---|---|---|---|---|
| POST | `/api/auth/dang-ky` | pub | `{email, password, name, acceptTerms, marketingContact?}` | `{ok, needsVerification}` | 5/10ph/IP | [x] |
| POST | `/api/auth/dang-nhap` | pub | `{email, password}` | `{ok, role}` | 10/10ph/IP | [x] |
| POST | `/api/auth/dang-xuat` | auth | - | `{ok}` | - | [x] |
| GET | `/api/auth/google` | pub | `?tiep=<đường dẫn nội bộ>` | 302 sang Google, đặt cookie state + PKCE | 20/10ph/IP | [x] |
| GET | `/api/auth/google/callback` | pub | `?code&state` từ Google | 302 vào `tiep`, hoặc `/dang-nhap?loi=...` | 20/10ph/IP | [x] |
| POST | `/api/auth/google/mo-phong` | pub (chỉ dev) | `{email, name, state}` | 303 sang callback. 404 ở production | - | [x] |
| POST | `/api/auth/xac-minh` | pub | `{token}` | `{ok}` | 10/10ph/IP | [x] |
| POST | `/api/auth/gui-lai-xac-minh` | pub | `{email}` | `{ok}` luôn ok, không lộ email có tồn tại | 3/10ph/IP | [x] |
| POST | `/api/auth/quen-mat-khau` | pub | `{email}` | `{ok}` luôn ok | 3/10ph/IP | [x] |
| POST | `/api/auth/dat-lai-mat-khau` | pub | `{token, password}` | `{ok}` | 5/10ph/IP | [x] |
| GET, PATCH | `/api/ho-so` | auth | hồ sơ học viên | hồ sơ đã lưu | 30/ph | [x] |
| GET | `/api/tien-do` | auth | - | điểm 4 kỹ năng + bài kế tiếp | 60/ph | [x] |
| POST | `/api/xep-lop/bat-dau` | auth | `{kind}` | `{sessionId, firstItem}` | 5/giờ | [ ] |
| POST | `/api/xep-lop/tra-loi` | auth | `{sessionId, questionId, raw}` | `{saved, nextItem}` | 120/ph | [ ] |
| POST | `/api/lop/[id]/luot` | auth | `{turnId, audio hoặc text}` | SSE: transcript, phản hồi, url audio | 60/ph | [ ] |
| POST | `/api/lop/[id]/huy-luot` | auth | `{turnId}` | `{ok}` | 120/ph | [ ] |
| POST | `/api/thanh-toan/tao-don` | auth | `{planVersionId}` | `{orderId, checkoutUrl}` - giá tính ở server | 10/giờ | [ ] |
| POST | `/api/webhooks/paypal` | pub + chữ ký | event nhà cung cấp | 200 sau khi ghi `webhook_events` | - | [ ] |
| GET | `/api/suc-khoe` | pub | - | `{ok, db, adapters}` | 60/ph | [x] |

## Quy ước quyền

- Kiểm tra quyền nằm trong `src/lib/auth/guard.ts`, gọi ở **mọi** route handler và
  mọi server component có dữ liệu riêng tư. Không có route nào dựa vào việc UI
  không hiển thị nút.
- Route `auth` mà chưa đăng nhập thì chuyển hướng `/dang-nhap?tiep=<đường dẫn>`.
  Route API trả 401 dạng JSON, không chuyển hướng.
- Route `staff` mà thiếu vai trò trả 404 chứ không 403, để không lộ sự tồn tại của
  khu quản trị.
