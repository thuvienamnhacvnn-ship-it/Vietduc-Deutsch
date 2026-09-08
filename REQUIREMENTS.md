# LINGORA — Bản đồ yêu cầu

Nguồn: `Lingora_Prompt_Claude_A1-B2.docx` (Bản giao việc 1.0, 07.09.2026).
Mỗi yêu cầu có một ID cố định. `ACCEPTANCE.md` ánh xạ ID → test → bằng chứng.

Trạng thái: `DONE` (đã chạy thật) · `MOCK` (chạy bằng mock/sandbox có nhãn) ·
`WIP` · `BLOCKED` (thiếu kết nối/quyền) · `TODO`.

## A — Nền tảng, thiết kế, giao diện công khai

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| A-01 | Design token: màu, typography, spacing, radius, shadow, grid, motion | 1 | DONE |
| A-02 | Trạng thái thống nhất: hover/focus/active/disabled/loading/empty/success/error | 1 | DONE |
| A-03 | Logo wordmark + icon + bản ngang + favicon + app icon | 1 | DONE |
| A-04 | Trang giới thiệu đủ khối: header, hero, hành trình, chương trình A1–B2, cách lớp AI hoạt động, giáo viên AI, gói học, FAQ, footer | 1 | DONE |
| A-05 | Responsive hoàn chỉnh tại 390 / 768 / 1440px, không tràn ngang | 1 | DONE |
| A-06 | Font đủ ký tự tiếng Việt + umlaut/ß; nội dung ≥16px, nhãn 14px | 1 | DONE |
| A-07 | Tôn trọng `prefers-reduced-motion`, điều hướng bàn phím, focus ring rõ | 1 | DONE |
| A-08 | Social icon chỉ hiện khi có link thật; không con số/nhận xét/logo đối tác bịa | 1 | DONE |
| A-09 | Danh mục assets có vị trí dùng, kích thước, nguồn/quyền, alt text | 1 | DONE |
| A-10 | Song ngữ VI/DE cho giao diện; VI giải thích, DE nội dung học | 1 | DONE |
| A-11 | Tên thương hiệu đổi tập trung trong cấu hình | 1 | DONE |

## B — Tài khoản, phân quyền, hồ sơ

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| B-01 | Đăng ký + xác minh email + đăng nhập + quên mật khẩu + đăng xuất | 1 | DONE |
| B-09 | Đăng nhập nhanh bằng Google (OAuth 2.0 + PKCE), một chạm với Gmail đang đăng nhập sẵn | 1 | MOCK |
| B-10 | Nối tài khoản Google vào tài khoản email đã có; tài khoản tạo bằng Google không có mật khẩu | 1 | DONE |
| B-02 | Quản lý phiên (cookie httpOnly, hết hạn, thu hồi) | 1 | DONE |
| B-03 | Vai trò: learner, editor, support, admin | 1 | DONE |
| B-04 | Learner profile: mục tiêu, múi giờ, sở thích học, accessibility, lịch khả dụng | 1 | DONE |
| B-05 | Ghi nhận consent (điều khoản, liên hệ riêng) có dấu thời gian | 1 | DONE |
| B-06 | Ownership ở server cho mọi resource; A không đọc/sửa được dữ liệu của B — kiểm cả API | 1 | DONE |
| B-07 | Rate limit cho auth và các endpoint tốn kém | 1 | DONE |
| B-08 | Người dùng xem / xuất / yêu cầu xóa dữ liệu của mình | 5 | TODO |

## C — Tư vấn và xếp lớp

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| C-01 | Mia — cố vấn tuyển sinh: hỏi mục tiêu, kinh nghiệm, thời gian, hạn, ngôn ngữ hỗ trợ | 2 | TODO |
| C-02 | Onboarding từng bước, lưu và tiếp tục, quay lại được | 2 | TODO |
| C-03 | Kiểm tra nhanh (gợi ý) tách khỏi kiểm tra xếp lớp đầy đủ | 2 | TODO |
| C-04 | Đánh giá Nghe: câu tiếng Đức đọc lên, nghe lại không giới hạn | 2 | DONE |
| C-05 | Đánh giá Đọc: đoạn văn theo cấp độ, đáp án có giải thích | 2 | DONE |
| C-06 | Đánh giá Viết: đề mở + rubric; hiện chấm được phần kiểm tự động | 2 | WIP |
| C-07 | Đánh giá Nói: thu âm thật qua micro và lưu làm bằng chứng; chấm cần dịch vụ giọng nói | 2 | WIP |
| C-08 | Thiếu audio/độ tin cậy thấp ⇒ đánh dấu chưa đủ dữ liệu, không tự cho điểm | 2 | DONE |
| C-09 | Ngân hàng câu hỏi có level/skill/độ khó/rubric/version/trạng thái duyệt — 41 câu, gồm trắc nghiệm và điền | 2 | DONE |
| C-10 | Lưu từng câu, tiếp tục được khi mất mạng | 2 | DONE |
| C-11 | Kết quả theo từng kỹ năng + độ tin cậy + bằng chứng + mức bắt đầu đề xuất | 2 | DONE |
| C-12 | Quản trị viên điều chỉnh mức kèm lý do; người học xin đánh giá lại | 2 | TODO |

## D — Giáo trình và phương pháp

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| D-01 | Bản đồ module đủ A1, A2, B1, B2 tham chiếu mục tiêu CEFR | 3 | TODO |
| D-02 | Lesson JSON có schema + version; sai schema không xuất bản được | 3 | TODO |
| D-03 | 12 bài pilot đủ chu trình (3 bài mỗi cấp) | 3 | TODO |
| D-04 | Chu trình dạy 8 bước: gợi nhớ → tình huống → mẫu → luyện có hướng dẫn → nhập vai → phản hồi → kiểm tra → ôn | 3 | TODO |
| D-05 | Quy tắc sửa lỗi: 1–2 lỗi trọng tâm/lượt, chọn sửa ngay hay tổng kết | 3 | TODO |
| D-06 | Spaced repetition cho từ vựng và lỗi lặp; mastery cấu hình được | 4 | TODO |
| D-07 | CMS giáo trình + quy trình duyệt trước khi xuất bản | 3 | TODO |
| D-08 | `CONTENT_COVERAGE.md` cập nhật độ phủ thật | 3 | WIP |

## E — Đội AI Agent

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| E-01 | 7 vai trò có system prompt versioned, I/O schema, công cụ cho phép, giới hạn vòng lặp/timeout/budget | 3 | TODO |
| E-02 | Orchestrator chọn đúng một vai trò mỗi lượt; đổi vai có lý do trong log | 3 | TODO |
| E-03 | Bộ nhớ ngắn hạn (buổi học) và dài hạn (trình độ, lỗi, từ đã học) | 3 | TODO |
| E-04 | RAG chỉ truy xuất giáo trình đã duyệt, đúng level + version | 3 | TODO |
| E-05 | Chống prompt injection: nội dung truy xuất và lời học viên là dữ liệu, không đổi được policy/quyền | 3 | TODO |
| E-06 | Mọi hành động ghi (điểm, lịch, thông báo) qua schema validation + kiểm quyền + audit log | 3 | TODO |
| E-07 | Giới hạn chi phí theo ngày/tháng, cảnh báo, chặn khi vượt | 5 | TODO |

## F — Lớp học giọng nói

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| F-01 | Kiểm tra thiết bị, xin quyền mic đúng lúc, nói rõ đây là giáo viên AI | 3 | TODO |
| F-02 | Avatar/chân dung có trạng thái nghe–suy nghĩ–nói | 3 | TODO |
| F-03 | Bảng giảng đồng bộ: câu mẫu, từ vựng, cấu trúc, bài tập tương tác | 3 | TODO |
| F-04 | Pipeline mic → VAD → STT → Claude → TTS → phụ đề, adapter tách theo nhà cung cấp | 3 | TODO |
| F-05 | Ngắt lời: dừng audio, hủy lượt cũ, turn ID mới, không phát chồng | 3 | TODO |
| F-06 | Xử lý im lặng, tạp âm, nhận sai từ, mic bị từ chối, mất mạng, reconnect | 3 | TODO |
| F-07 | Người học sửa được transcript; lỗi STT không tính thành lỗi kiến thức | 3 | TODO |
| F-08 | TTS tiếng Đức nghe kiểm tra thật; browser TTS chỉ là fallback có nhãn | 3 | TODO |
| F-09 | Đo latency p50 ≤ 2,5s / p95 ≤ 5s trong môi trường đo xác định | 3 | TODO |
| F-10 | Tổng kết cuối buổi + lưu tiến độ idempotent, quay lại đúng trạng thái | 3 | TODO |

## G — Thương mại

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| G-01 | Gói học cấu hình trong admin: chu kỳ, giá EUR, hạn mức AI/voice, dùng thử | 5 | TODO |
| G-02 | Server tạo order và tính giá từ catalog; không tin giá từ trình duyệt | 5 | TODO |
| G-03 | PayPal adapter (sandbox trước) | 5 | TODO |
| G-04 | Card/Visa qua payment provider hosted checkout/hosted fields; không chạm PAN/CVV | 5 | TODO |
| G-05 | Webhook có xác minh chữ ký, event ID chống trùng, đối chiếu amount/currency/order | 5 | TODO |
| G-06 | Entitlement chỉ mở sau khi backend xác minh; return URL không phải bằng chứng | 5 | TODO |
| G-07 | Trạng thái: pending/completed/failed/cancelled/expired/refunded/dispute; subscription active/past_due/cancelled/ended | 5 | TODO |
| G-08 | Lịch sử giao dịch, chứng từ, ngày gia hạn, hủy gia hạn | 5 | TODO |
| G-09 | Hoàn tiền và đổi gói có workflow; agent không tự cấp quyền/hoàn tiền | 5 | TODO |

## H — Kiến trúc và vận hành

| ID | Yêu cầu | GĐ | Trạng thái |
|---|---|---|---|
| H-01 | TypeScript + Next.js + Postgres + ORM có migration + worker + object storage | 0 | DONE |
| H-02 | Triển khai VPS bằng Docker Compose, tách web/worker/db | 5 | TODO |
| H-03 | ADR ghi quyết định và trade-off | 0 | DONE |
| H-04 | Hợp đồng API: method, input schema, output, quyền, lỗi, rate limit | 0 | DONE |
| H-05 | Upload có giới hạn kích thước + kiểm MIME + hạn giữ tệp; URL ký chưa làm | 3 | WIP |
| H-06 | Không ghi dữ liệu nhạy cảm vào log; secret không vào bundle/Git | 1 | DONE |
| H-07 | Backup + diễn tập khôi phục | 5 | TODO |
| H-08 | Cấu hình thời gian giữ audio; mỗi tệp ghi âm có `expires_at`. Job dọn chưa làm | 3 | WIP |
| H-09 | Dashboard vận hành: lớp, lỗi, latency, usage, chi phí theo học viên/gói | 5 | TODO |
| H-10 | Job nền có retry giới hạn, không gửi nhắc học trùng | 4 | TODO |
