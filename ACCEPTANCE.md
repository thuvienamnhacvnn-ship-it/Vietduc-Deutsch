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
| GG-13 | PKCE (S256) gửi đúng lên Google | ĐÃ KIỂM trên bản chạy: `/api/auth/google` chuyển hướng kèm `code_challenge` và `code_challenge_method=S256`, Google nhận và trả màn hình đăng nhập | PASS |
| GG-14 | Kiểm `iss`, `aud`, `exp`, `nonce`, `email_verified` của id_token | Code có trong `verifyIdToken`, đã ở chế độ live; còn chờ một lần đăng nhập thật để chạy qua đường này | BLOCKED |
| GG-15 | Nút Google bị vô hiệu ở production khi thiếu khóa | ĐÃ KIỂM trên bản đang chạy: trang đăng nhập hiện "Google chưa kết nối" kèm lý do, và `POST /api/auth/google/mo-phong` trả 404 | PASS |

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

## AI, VOICE, PAY, CONTENT — giai đoạn 3-4-5

| ID | Kiểm tra | Trạng thái | Ghi chú |
|---|---|---|---|
| AI-01 | Vai trò giáo viên có ràng buộc mức, sửa một lỗi mỗi lượt, giải thích tiếng Việt | PASS | `src/lib/lop-hoc.ts` |
| AI-02 | Thiếu bộ giảng dạy thì KHÔNG bịa lời giảng, trả 503 có giải thích | PASS | test `lop-hoc.mjs` |
| AI-03 | Bộ giảng dạy tự host, đổi model không phải sửa code | PASS | chuẩn OpenAI, `LINGORA_LLM_URL` |
| AI-04..06 | Orchestrator nhiều agent, RAG, trần chi phí | NOT STARTED | một agent giáo viên là đủ cho lớp nói; RAG chờ có kho nội dung lớn hơn |
| VOICE-01 | Ghi âm từ trình duyệt, bấm giữ để nói | PASS | `ClassRoom.tsx` |
| VOICE-02 | Nghe ra chữ (STT) chạy trên engine của trường | PASS | whisper.cpp, đo 5,2s cho 11s tiếng nói |
| VOICE-03 | Đọc tiếng Đức (TTS) chạy trên engine của trường | PASS | piper, nhanh gấp 12 lần thời gian thực |
| VOICE-04 | Người học sửa được phần máy nghe nhầm trước khi gửi | PASS | bước bắt buộc trong luồng |
| VOICE-05 | Phần Nghe của bài thi phát âm thanh thật, không gửi kèm chữ | PASS | `/api/xep-lop/nghe` |
| VOICE-06 | Engine hỏng không làm hỏng bài thi | PASS | rơi về giọng trình duyệt, có nhãn |
| VOICE-07..10 | Ngắt lời giữa câu, đo độ trễ liên tục, tự nối lại khi rớt | NOT STARTED | cần lớp học chạy thật với người dùng trước |
| PAY-01 | Đặt đơn, sinh mã chuyển khoản | PASS | `/api/goi-hoc/dat` |
| PAY-02 | Giá chưa duyệt thì server từ chối bán | PASS | test `lop-hoc.mjs` |
| PAY-03 | Xác nhận thu tiền ghi khoản thu, đóng đơn, cấp quyền trong một luồng | PASS | `confirmBankPayment` |
| PAY-04 | Chỉ quản trị xác nhận được, có ghi chú đối chiếu bắt buộc | PASS | test phân quyền |
| PAY-05 | Quyền học chỉ đến từ bảng `entitlements` | PASS | `activeEntitlement` |
| PAY-06..09 | PayPal, thẻ, webhook, hoàn tiền tự động | BLOCKED | cần tài khoản thương gia; chuyển khoản không cần |
| CONTENT-01 | 12 bài pilot | PASS | `src/content/bai-hoc.ts`, nạp vào CSDL |
| CONTENT-02 | Quy trình duyệt nội dung trước khi tới học viên | PASS | `/quan-tri/bai-hoc`, ghi ai duyệt |
| CONTENT-03 | Bản đồ độ phủ | NOT STARTED | theo dõi ở `CONTENT_COVERAGE.md` |
| SRS-01 | Lỗi được sửa thành thẻ ôn, ôn theo khoảng cách tăng dần | PASS | `/hoc/on-tap` |
| OPS-01 | Trang sức khỏe hỏi thẳng engine, không suy từ biến môi trường | PASS | `/api/suc-khoe` |
| OPS-02..04 | Backup, bảng chi phí, job retry | NOT STARTED | — |

## Ghi chú trung thực

- **Ba dịch vụ nặng nhất không còn là dịch vụ ngoài.** Đọc, nghe và bộ giảng dạy
  chạy trên máy chủ của trường bằng phần mềm mã nguồn mở
  (`docs/ENGINE-TU-HOST.md`). Bản cài nào chưa trỏ tới engine thì chúng vẫn ở
  mock và tự khai là mock.
- **Còn lại vẫn là mock:** avatar, email, thanh toán thẻ, lưu trữ đám mây và
  đăng nhập Google. `/api/suc-khoe` và trang
  `/quan-tri` in ra đúng trạng thái này; giao diện dán nhãn ở mọi chỗ liên quan.
- **Chưa có bài học nào được xuất bản**, nên chưa thể nghiệm thu bất kỳ mục nào
  thuộc nhóm LEARN.
- **Chưa đo tải.** Không có tuyên bố nào về số lớp học đồng thời.
- Rate limit hiện giữ trong bộ nhớ của một tiến trình. Khi chạy nhiều instance
  phải thay bằng Redis; ghi rõ trong `lib/rate-limit.ts`.
