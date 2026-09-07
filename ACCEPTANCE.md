# Nghiệm thu Lingora

Trạng thái: **PASS** (đã chạy thật, có bằng chứng) · **MOCK PASS** (chạy đúng bằng
adapter mô phỏng có nhãn — *không phải* live integration pass) · **FAIL** ·
**BLOCKED** (thiếu kết nối hoặc quyền) · **NOT STARTED**.

Môi trường đo: Windows 11, Node v24.16.0, Next 16.3.4, PGlite 0.5.8 (Postgres
biên dịch WASM), không có `DATABASE_URL`, không có khóa dịch vụ nào.
Ngày đo: 07.09.2026. Cổng: `http://localhost:3055`.

Cách tái hiện toàn bộ mục PASS bên dưới:

```
npm install
npx drizzle-kit generate     # đã có sẵn drizzle/0000_*.sql, chỉ chạy khi đổi schema
npm run db:push
npm run seed
npm run dev                  # cửa sổ khác
node tests/smoke.mjs         # 37 kiểm tra nền tảng và phân quyền
node tests/google.mjs        # 24 kiểm tra luồng đăng nhập Google
```

Kết quả lần chạy gần nhất: **37 PASS** (smoke) và **24 PASS** (google), 0 FAIL.

Lưu ý: chạy hai tệp test liền nhau có thể chạm trần rate limit đăng ký
(5 lần/10 phút/IP) và làm một kiểm tra báo FAIL. Đó là rate limit hoạt động
đúng; chờ vài phút rồi chạy lại.

## AUTH — tài khoản và phân quyền

| ID | Kiểm tra | Cách kiểm | Trạng thái |
|---|---|---|---|
| AUTH-01 | Đăng ký tạo user + hồ sơ + bản ghi consent | `tests/smoke.mjs` "đăng ký thành công" | PASS |
| AUTH-02 | Mật khẩu dưới 10 ký tự bị từ chối | smoke "mật khẩu quá ngắn bị từ chối" | PASS |
| AUTH-03 | Không tick điều khoản thì không tạo được tài khoản | smoke "không đồng ý điều khoản" | PASS |
| AUTH-04 | Email trùng bị từ chối (409) | smoke "email trùng bị từ chối" | PASS |
| AUTH-05 | Đăng nhập đúng/sai | smoke "sai mật khẩu bị từ chối", "đăng nhập đúng thành công" | PASS |
| AUTH-06 | Đăng xuất thu hồi phiên, API trả 401 sau đó | smoke "sau khi đăng xuất thì mất quyền" | PASS |
| AUTH-07 | Dữ liệu còn nguyên sau đăng xuất/đăng nhập lại | smoke "hồ sơ vẫn còn sau khi đăng xuất rồi đăng nhập lại" | PASS |
| AUTH-08 | **Học viên A không đọc được dữ liệu của B — kiểm ở API, không phải ở UI** | smoke "Bob không đọc được hồ sơ của Alice" + "hồ sơ Bob không mang dữ liệu Alice" | PASS |
| AUTH-09 | Khách chưa đăng nhập gọi API riêng tư nhận 401 | smoke "khách chưa đăng nhập không đọc được hồ sơ" | PASS |
| AUTH-10 | Khách vào `/hoc` bị chuyển sang đăng nhập | smoke "khách vào /hoc bị chuyển sang đăng nhập" | PASS |
| AUTH-11 | Học viên vào `/quan-tri` nhận 404, không lộ sự tồn tại của khu quản trị | smoke "học viên vào /quan-tri nhận 404" | PASS |
| AUTH-12 | Nhân viên vào được `/quan-tri` và `/quan-tri/hoc-vien` | đăng nhập `admin@lingora.demo`, cả hai trả 200 | PASS |
| AUTH-13 | Quên mật khẩu không tiết lộ email nào có tài khoản | smoke "email có thật và email không có trả lời giống hệt nhau" | PASS |
| AUTH-14 | Token đặt lại/xác minh giả bị từ chối | smoke hai mục "token ... giả bị từ chối" | PASS |
| AUTH-15 | Xác minh email qua liên kết thật | Adapter mail đang ở chế độ mock: liên kết ghi vào `data/outbox/`. Luồng chạy đủ, nhưng chưa có email thật nào được gửi | MOCK PASS |
| AUTH-16 | Đổi mật khẩu thu hồi mọi phiên khác | code: `api/auth/dat-lai-mat-khau` revoke toàn bộ `sessions` của user. Chưa có test tự động | NOT STARTED |
| AUTH-17 | Rate limit auth | Cài đặt trong `lib/rate-limit.ts`, đang giữ trong bộ nhớ tiến trình. Chưa đo bằng test riêng, nhưng đã quan sát được khi chạy hai bộ test liền nhau | NOT STARTED |

## GOOGLE — đăng nhập nhanh bằng tài khoản Google

Toàn bộ chạy qua **bản mô phỏng có nhãn** (chưa có khóa OAuth), nhưng đi đúng
đường thật: cùng cookie state, cùng route callback, cùng code tạo tài khoản và
tạo phiên. Chỉ khác một chỗ là màn hình chọn tài khoản.

| ID | Kiểm tra | Cách kiểm | Trạng thái |
|---|---|---|---|
| GG-01 | Bước 1 chuyển hướng và đặt cookie state | `tests/google.mjs` "GET /api/auth/google chuyển hướng", "có đặt cookie state" | MOCK PASS |
| GG-02 | `tiep` trỏ ra tên miền ngoài không được chấp nhận (chống open redirect) | google.mjs "tham số tiep trỏ ra ngoài" | PASS |
| GG-03 | Đăng ký một chạm: tạo user + hồ sơ + consent + phiên | google.mjs "callback chuyển về khu học", "có phiên đăng nhập ngay sau đó" | MOCK PASS |
| GG-04 | Đăng nhập lại cùng tài khoản Google không tạo tài khoản thứ hai | google.mjs "cùng email Google thì vào đúng tài khoản cũ" | MOCK PASS |
| GG-05 | Tài khoản tạo bằng Google không đăng nhập được bằng mật khẩu | google.mjs "không đăng nhập bằng mật khẩu được" | PASS |
| GG-06 | Nối Google vào tài khoản email đã có, mật khẩu cũ vẫn dùng được | google.mjs hai mục "nối vào đúng tài khoản đó" và "mật khẩu cũ vẫn dùng được" | MOCK PASS |
| GG-07 | **State không khớp thì bị chặn** (CSRF) | google.mjs "state không khớp thì bị chặn" | PASS |
| GG-08 | Callback không có cookie thì bị từ chối | google.mjs "callback không có cookie" | PASS |
| GG-09 | **Cookie state dùng một lần**, phát lại bị từ chối | google.mjs "dùng lại cùng cookie state lần hai" | PASS |
| GG-10 | Người dùng bấm Hủy ở Google thì báo đúng lý do | google.mjs "bấm Hủy ở Google" | PASS |
| GG-11 | Màn hình mô phỏng tự khai không phải Google, và 404 khi thiếu state | google.mjs hai mục cuối | PASS |
| GG-12 | Giao diện có nút Google và nhãn "bản mô phỏng" | google.mjs mục "Giao diện" | PASS |
| GG-13 | PKCE (S256) gửi đúng lên Google | Code có, nhưng chỉ kiểm được khi có khóa thật — bản mô phỏng không kiểm `code_verifier` | BLOCKED |
| GG-14 | Kiểm `iss`, `aud`, `exp`, `nonce`, `email_verified` của id_token | Code có trong `verifyIdToken`. Chỉ chạy ở chế độ live | BLOCKED |
| GG-15 | Nút Google bị vô hiệu ở production khi thiếu khóa | Logic trong `mockEnabled()`. Chưa kiểm trên môi trường production thật | NOT STARTED |

## DATA — dữ liệu và hồ sơ

| ID | Kiểm tra | Cách kiểm | Trạng thái |
|---|---|---|---|
| DATA-01 | Hồ sơ lưu và đọc lại đúng | smoke "sửa hồ sơ được lưu" | PASS |
| DATA-02 | Giá trị ngoài khoảng bị Zod chặn | smoke "giá trị ngoài khoảng bị từ chối" | PASS |
| DATA-03 | Bốn kỹ năng luôn trả đủ bốn dòng | smoke "tiến độ trả đủ bốn kỹ năng" | PASS |
| DATA-04 | **Chưa kiểm tra thì không suy ra điểm** — cả bốn kỹ năng báo "chưa đánh giá" | smoke "chưa kiểm tra thì cả bốn kỹ năng đều là chưa đánh giá" | PASS |
| DATA-05 | Chưa thanh toán thì không có quyền học | smoke "chưa mua thì không có quyền học" | PASS |
| DATA-06 | Migration chạy được và chạy lại không hỏng | `npm run db:push` hai lần: lần hai báo "bỏ qua ... (đã áp)" | PASS |
| DATA-07 | Audit log ghi đăng nhập, đăng ký, đổi hồ sơ | hiển thị tại `/quan-tri`, đọc từ bảng `audit_logs` | PASS |
| DATA-08 | Backup và khôi phục | Chưa làm | NOT STARTED |
| DATA-09 | Người dùng xuất/xóa dữ liệu của mình | Chưa làm (giai đoạn 5) | NOT STARTED |

## UI — giao diện

| ID | Kiểm tra | Cách kiểm | Trạng thái |
|---|---|---|---|
| UI-01 | 13 trang công khai trả 200 | smoke, mục "Trang công khai" | PASS |
| UI-02 | **Không trang nào tràn ngang ở 390 / 768 / 1440px** | Đo `scrollWidth − innerWidth` trong iframe đúng ba khổ, 13 trang công khai + `/hoc` + `/hoc/ho-so`. Kết quả: không trang nào dương | PASS |
| UI-03 | Header đổi giữa menu ngang và nút hamburger đúng mốc 900px | Đo `getComputedStyle` ở 390/768/1440 | PASS |
| UI-04 | Chủ đề sáng và tối đều đọc được | Chụp màn hình cả hai chủ đề trên trang chủ và trang học phí | PASS |
| UI-05 | Trạng thái rỗng có ở mọi danh sách | Bảng học, bảng giá, danh sách học viên, nhật ký — đều có khối `.empty` | PASS |
| UI-06 | Kỹ năng chưa đánh giá vẽ bằng vạch chéo, không phải thanh đặc | `meter[data-unknown]` trong `globals.css`; ảnh chụp `/hoc` | PASS |
| UI-07 | Nút chưa hoạt động thì bị vô hiệu và ghi lý do | Nút mua gói ở `/hoc-phi`, nút xếp lớp ở `/hoc` | PASS |
| UI-08 | `prefers-reduced-motion` tắt hết chuyển động | Khai báo ở tầng token trong `tokens.css` | PASS |
| UI-09 | Điều hướng bàn phím và focus ring trên mọi nền | Đã khai báo; chưa rà từng màn hình bằng bàn phím | NOT STARTED |
| UI-10 | Không có nhận xét học viên, chứng chỉ, con số hay logo đối tác bịa | Rà toàn bộ `src/content/` và các trang | PASS |
| UI-11 | Icon mạng xã hội chỉ hiện khi có URL thật | `brand.social` rỗng, footer không render khối đó | PASS |

## AI, VOICE, PAY, CONTENT — chưa tới giai đoạn

| ID | Kiểm tra | Trạng thái | Mở khóa bằng cách nào |
|---|---|---|---|
| AI-01..06 | Vai trò agent, orchestrator, RAG, chống prompt injection, giới hạn chi phí | NOT STARTED | Giai đoạn 3 |
| VOICE-01..10 | Mic, STT, TTS, ngắt lời, latency, reconnect | BLOCKED | Cần tài khoản STT và TTS; xem `docs/INTEGRATIONS.md` |
| PAY-01..09 | Checkout, webhook, entitlement, hoàn tiền | BLOCKED | Cần pháp nhân, tài khoản PayPal và nhà cung cấp thẻ |
| CONTENT-01..03 | 12 bài pilot, bản đồ độ phủ, quy trình duyệt | NOT STARTED | Giai đoạn 3; theo dõi ở `CONTENT_COVERAGE.md` |
| OPS-01..04 | Backup, dashboard chi phí, job retry | NOT STARTED | Giai đoạn 5 |

## Ghi chú trung thực

- **Không có dịch vụ ngoài nào đang kết nối.** LLM, STT, TTS, avatar, email,
  thanh toán, lưu trữ và đăng nhập Google đều chạy adapter mock. `/api/suc-khoe` và trang
  `/quan-tri` in ra đúng trạng thái này; giao diện dán nhãn ở mọi chỗ liên quan.
- **Chưa có bài học nào được xuất bản**, nên chưa thể nghiệm thu bất kỳ mục nào
  thuộc nhóm LEARN.
- **Chưa đo tải.** Không có tuyên bố nào về số lớp học đồng thời.
- Rate limit hiện giữ trong bộ nhớ của một tiến trình. Khi chạy nhiều instance
  phải thay bằng Redis; ghi rõ trong `lib/rate-limit.ts`.
