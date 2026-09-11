/**
 * Nội dung trang giới thiệu. Tách khỏi component để biên tập viên sửa chữ mà
 * không phải đụng vào JSX.
 *
 * Quy tắc nội dung (bản giao việc, mục 01): không nhận xét học viên bịa, không
 * số lượng người học bịa, không chứng chỉ, không logo đối tác, không cam kết đỗ
 * thi. Mọi con số nêu ra phải là thứ kiểm chứng được.
 */

export const JOURNEY = [
  {
    n: "01",
    title: "Nói chuyện với cố vấn",
    body: "Mia hỏi bạn muốn dùng tiếng Đức để làm gì, đã học tới đâu và mỗi tuần có bao nhiêu thời gian. Chưa cần tài khoản.",
  },
  {
    n: "02",
    title: "Kiểm tra bốn kỹ năng",
    body: "Nghe, đọc, viết và nói được kiểm riêng. Kết quả trả về theo từng kỹ năng - nghe có thể ở A2 trong khi viết còn A1, và như vậy là bình thường.",
  },
  {
    n: "03",
    title: "Nhận lộ trình của riêng bạn",
    body: "Lộ trình dựng từ kết quả thật kèm lý do vì sao bắt đầu ở đó. Bạn chọn học lại nền tảng hoặc xin đánh giá lại bất cứ lúc nào.",
  },
  {
    n: "04",
    title: "Vào lớp và nói",
    body: "Anna dẫn buổi học, bảng giảng chạy theo bài, và bạn nói bằng micro. Gõ chữ cũng được nếu hôm nay bạn không tiện nói.",
  },
  {
    n: "05",
    title: "Ôn đúng thứ hay quên",
    body: "Từ và lỗi lặp lại được xếp lịch ôn theo kết quả của chính bạn, không theo lịch cố định cho tất cả mọi người.",
  },
];

export const FAQ = [
  {
    q: "Giáo viên ở đây là người thật hay trí tuệ nhân tạo?",
    a: "Anna, Lukas, Mia và các vai trò khác là giáo viên trí tuệ nhân tạo, không phải người thật. Chúng tôi đặt tên và tính cách cho họ để bạn dễ nhớ ai làm việc gì và để buổi học có người đồng hành, chứ không phải để bạn tưởng đó là người. Trong lớp luôn có dòng nhắc điều này.",
  },
  {
    q: "Học xong có chứng chỉ không?",
    a: "Không. Việt Đức Lingua dạy và theo dõi tiến bộ nội bộ. Hoàn thành một cấp độ ở đây không đồng nghĩa với chứng chỉ CEFR được công nhận - chứng chỉ đó do các tổ chức khảo thí cấp và phải thi riêng.",
  },
  {
    q: "Bao lâu thì tôi đạt B2?",
    a: "Không ai trả lời trung thực được câu này, kể cả chúng tôi. Nó phụ thuộc điểm xuất phát, thời gian bạn học mỗi tuần và cả việc bạn có dùng tiếng Đức ngoài lớp không. Trang chương trình có ghi khoảng số giờ học thường thấy cho từng cấp, để bạn tự ước lượng.",
  },
  {
    q: "Tôi không có micro tốt thì sao?",
    a: "Bạn vẫn học được: mọi phần nói đều có lựa chọn gõ chữ. Riêng phần đánh giá kỹ năng Nói cần âm thanh - nếu không thu được, hệ thống ghi rõ là chưa đánh giá được kỹ năng đó chứ không đoán một mức điểm.",
  },
  {
    q: "Dữ liệu học và ghi âm của tôi được xử lý thế nào?",
    a: "Bài làm, ghi âm và tiến độ lưu ở máy chủ và chỉ tài khoản của bạn đọc được. Thời gian giữ file ghi âm gốc được cấu hình và mặc định là ngắn. Trang Riêng tư ghi rõ dịch vụ nào tham gia xử lý giọng nói.",
  },
  {
    q: "Tôi có thể học bằng điện thoại không?",
    a: "Được. Giao diện lớp học trên điện thoại ưu tiên nội dung bài và nút nói; phần còn lại thu gọn lại.",
  },
];

/** Điều thẳng thắn về giới hạn - đặt ngay trên trang chủ, không giấu trong FAQ. */
export const HONESTY = [
  {
    title: "Nói rõ ai đang dạy bạn",
    body: "Anna, Lukas và Mia là giáo viên trí tuệ nhân tạo. Họ có tên và tính cách để đồng hành cùng bạn, nhưng chúng tôi không bao giờ để bạn hiểu nhầm đó là người thật.",
  },
  {
    title: "Không cam kết đỗ thi",
    body: "Chúng tôi đo tiến bộ của bạn và trình bày đúng phạm vi bằng chứng thu được. Không hứa điểm số, không hứa thời hạn.",
  },
  {
    title: "Thiếu dữ liệu thì nói là thiếu",
    body: "Kỹ năng nào chưa đủ bằng chứng thì hiển thị là chưa đánh giá được, chứ không có một con số đẹp mắt được suy đoán ra.",
  },
];
