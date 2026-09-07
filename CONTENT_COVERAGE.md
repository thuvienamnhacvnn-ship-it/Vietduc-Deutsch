# Độ phủ nội dung

Cập nhật: 07.09.2026.

Tệp này nói **thật** giáo trình đã có tới đâu. Nó tồn tại để không ai — kể cả
trang giới thiệu — quảng bá một cấp độ mà nội dung chưa có.

Quy tắc: **một cấp độ chỉ được mở bán khi bộ nội dung và bộ đánh giá của chính
cấp đó đã qua duyệt và được chủ dự án chấp thuận công bố.**

## Tổng quan

| Cấp | Khung mục tiêu | Bài đã duyệt | Bài pilot cần có | Ngân hàng câu hỏi | Được mở bán |
|---|---|---|---|---|---|
| A1 | có | 0 | 3 | 0 | KHÔNG |
| A2 | có | 0 | 3 | 0 | KHÔNG |
| B1 | có | 0 | 3 | 0 | KHÔNG |
| B2 | có | 0 | 3 | 0 | KHÔNG |

**Chưa có bài học nào được xuất bản.** Bảng học của học viên hiển thị đúng như
vậy chứ không dựng một bài giả cho đẹp màn hình.

## Đã có

- Khung mục tiêu giao tiếp đủ bốn cấp trong `src/content/curriculum.ts`: chủ đề,
  trọng tâm ngữ pháp, và các câu "có thể làm" cho mỗi cấp.
- Các câu "có thể làm" đã được nạp vào bảng `objectives` bởi `npm run seed`
  (mã `A1-CAN-01`…), làm cơ sở đo độ phủ về sau.
- Bốn khóa học trong bảng `courses`, mỗi cấp một khóa.
- Cấu trúc bảng cho `modules`, `lessons`, `lesson_versions` (có `schema_version`
  và trạng thái duyệt), `question_bank`, `question_versions`, `rubric_versions`.

## Còn thiếu

1. **Schema JSON cho bài học** (`D-02`) — định nghĩa và bộ kiểm tra hợp lệ. Bài
   sai schema không được chuyển sang `published`.
2. **12 bài pilot** (`D-03`) — 3 bài mỗi cấp, mỗi bài đủ tám bước của chu trình
   dạy: từ vựng, cấu trúc, hội thoại, audio, bài tập cho cả bốn kỹ năng, rubric,
   đáp án, giải thích tiếng Việt và bài ôn.
3. **Bản đồ module đầy đủ** cho từng cấp — hiện mới có khung mục tiêu, chưa chia
   thành module và bài cụ thể.
4. **Ngân hàng câu hỏi** cho kiểm tra nhanh và kiểm tra xếp lớp, có phiên bản và
   trạng thái duyệt.
5. **Audio** — mọi file nghe phải có nguồn và quyền sử dụng rõ ràng, ghi trong
   bảng `assets` (`license`, `alt_text`).
6. **Quy trình duyệt** trong `/quan-tri/giao-trinh`: draft → in_review →
   published, có người duyệt và thời điểm duyệt.

## Mục tiêu CEFR chưa được phủ

Không thể liệt kê cho tới khi có bài học thật để đối chiếu. Khi 12 bài pilot
xong, bảng này phải liệt kê từng `objectives.code` chưa có bài nào dạy.

## Ghi chú về nguồn

Khung mục tiêu tham chiếu mô tả CEFR và được viết lại bằng ngôn ngữ của người
học Việt Nam. Không sao chép giáo trình thương mại nào. Nội dung do AI hỗ trợ
soạn phải qua kiểm tra và duyệt trước khi xuất bản.
