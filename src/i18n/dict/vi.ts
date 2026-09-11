/**
 * Bản tiếng Việt - bản gốc. Bốn bản còn lại dịch từ đây và phải có đúng các
 * khoá này (kiểu `Dict` bắt buộc điều đó lúc biên dịch).
 *
 * Quy tắc nội dung vẫn là quy tắc của src/content/site.ts: không số liệu bịa,
 * không hứa đỗ thi, không hứa thứ sản phẩm chưa làm. Câu tiếng Đức trong phần
 * minh hoạ lớp học KHÔNG dịch - chúng giống nhau ở mọi bản.
 */
export const vi = {
  meta: {
    title: "Việt Đức Lingua — Học tiếng Đức trực tuyến A1–B2",
    description:
      "Tiếng Đức A1–B2 cho người Việt: bạn nói, cô Anna nghe và trả lời bằng tiếng Đức, giải thích bằng tiếng Việt.",
  },
  chrome: {
    skip: "Bỏ qua điều hướng, tới nội dung chính",
    home: "Về trang chủ",
    mainNav: "Điều hướng chính",
    mobileNav: "Điều hướng chính, bản rút gọn",
    menuOpen: "Mở menu",
    menuClose: "Đóng menu",
    nav: {
      program: "Chương trình",
      classroom: "Lớp học AI",
      path: "Lộ trình",
      pricing: "Học phí",
      team: "Đội ngũ",
      faq: "Câu hỏi",
    },
    signin: "Đăng nhập",
    start: "Bắt đầu học",
    enter: "Vào học",
    theme: "Giao diện",
    themeState: {
      system: "Giao diện: theo hệ thống",
      light: "Giao diện: ngày",
      dark: "Giao diện: đêm",
    },
    themeHint: "Bấm để đổi.",
    language: "Ngôn ngữ",
    motto: ["Hôm nay giỏi tiếng Đức", "Ngày mai rộng mở tương lai"],
    /** Hiện ở các trang chưa có bản dịch khi người đọc chọn ngôn ngữ khác. */
    untranslated: "",
  },
  hero: {
    eyebrow: "Tiếng Đức A1–B2 cho người Việt",
    h1: ["Tự tin nói tiếng Đức.", "Mở lối tương lai."],
    lede: "Học cùng giáo viên AI, luyện giao tiếp mỗi ngày và tiến bộ theo lộ trình riêng của bạn.",
    ctaTest: "Kiểm tra trình độ",
    ctaClass: "Trải nghiệm lớp học",
    features: [
      { title: "Lộ trình cá nhân", body: "Dựng từ kết quả kiểm tra thật" },
      { title: "Luyện nói bất cứ lúc nào", body: "Anna nghe và trả lời từng câu" },
      { title: "Giải thích tiếng Việt", body: "Dễ hiểu, dễ áp dụng" },
    ],
  },
  demo: {
    label: "Minh hoạ một lượt trong lớp học",
    teacher: "Anna · Giáo viên AI",
    status: "Đang nghe bạn nói",
    question: "Bạn sống ở đâu?",
    fixTitle: "Mỗi lượt sửa một lỗi",
    fixWhy: "Đi với „ich“, động từ chia đuôi -e.",
    controls: { mic: "Nói", type: "Gõ chữ", listen: "Nghe lại" },
  },
  path: {
    kicker: "Ngôn ngữ kết nối những con người tốt đẹp",
    h2: "Lộ trình rõ ràng. Tiến bộ từng ngày.",
    lede: "Từ những câu nói đầu tiên đến học tập và làm việc tại Đức.",
    startHere: "Bắt đầu tại đây",
    more: "Xem chi tiết",
    levels: {
      A1: {
        title: "Khởi đầu",
        body: "Làm quen tiếng Đức, nắm vững phát âm, từ vựng và những câu giao tiếp cơ bản trong đời sống hằng ngày.",
      },
      A2: {
        title: "Giao tiếp cơ bản",
        body: "Tự tin giao tiếp trong các tình huống quen thuộc: mua sắm, đi lại, công việc và cuộc sống hằng ngày.",
      },
      B1: {
        title: "Tự tin hội thoại",
        body: "Diễn đạt ý kiến, thảo luận vấn đề và giao tiếp tự nhiên hơn trong học tập, công việc và các tình huống xã hội.",
      },
      B2: {
        title: "Học tập & công việc",
        body: "Sẵn sàng cho môi trường học tập và làm việc tại Đức với khả năng nghe, nói, đọc, viết vững vàng và tự tin.",
      },
    },
  },
  journey: {
    eyebrow: "Hành trình học",
    h2: "Năm bước, không bước nào là hình thức",
    steps: [
      {
        title: "Kiểm tra bốn kỹ năng",
        body: "Nghe, đọc, viết và nói được kiểm riêng. Nghe có thể ở A2 trong khi viết còn A1 - như vậy là bình thường.",
      },
      {
        title: "Nhận lộ trình của riêng bạn",
        body: "Lộ trình dựng từ kết quả thật, kèm lý do vì sao bắt đầu ở đó.",
      },
      {
        title: "Vào lớp và nói",
        body: "Anna dẫn buổi học theo một tình huống thật. Không tiện nói thì gõ chữ cũng được.",
      },
      {
        title: "Sửa đúng một lỗi mỗi lượt",
        body: "Không đổ cả trang lỗi lên bạn. Mỗi lượt Anna chọn lỗi đáng sửa nhất và giải thích ngắn.",
      },
      {
        title: "Ôn đúng thứ hay quên",
        body: "Lỗi đã sửa trong lớp thành thẻ ôn, xếp lịch theo kết quả của chính bạn.",
      },
    ],
  },
  honest: {
    eyebrow: "Nói thẳng",
    h2: "Ba điều chúng tôi không làm",
    items: [
      {
        title: "Không giấu ai đang dạy bạn",
        body: "Anna, Lukas và Mia là giáo viên trí tuệ nhân tạo, không phải người thật. Trong lớp luôn có dòng nhắc điều này.",
      },
      {
        title: "Không cam kết đỗ thi",
        body: "Chúng tôi đo tiến bộ và trình bày đúng phạm vi bằng chứng thu được. Không hứa điểm số, không hứa thời hạn.",
      },
      {
        title: "Không đoán khi thiếu dữ liệu",
        body: "Kỹ năng nào chưa đủ bằng chứng thì ghi là chưa đánh giá được, không có con số đẹp mắt được suy ra.",
      },
    ],
  },
  faq: {
    eyebrow: "Câu hỏi thường gặp",
    h2: "Những điều người học hỏi trước tiên",
    items: [
      {
        q: "Giáo viên là người thật hay trí tuệ nhân tạo?",
        a: "Anna, Lukas, Mia và các vai trò khác là giáo viên trí tuệ nhân tạo, không phải người thật. Họ có tên và tính cách để bạn dễ nhớ ai làm việc gì, chứ không phải để bạn tưởng đó là người.",
      },
      {
        q: "Lớp học giải thích bằng ngôn ngữ nào?",
        a: "Anna nói và luyện với bạn bằng tiếng Đức, phần giải thích và sửa lỗi bằng tiếng Việt. Ngôn ngữ bạn chọn cho trang web không đổi ngôn ngữ giảng dạy.",
      },
      {
        q: "Học xong có chứng chỉ không?",
        a: "Không. Hoàn thành một cấp độ ở đây không phải là chứng chỉ CEFR được công nhận - chứng chỉ đó do các tổ chức khảo thí cấp và phải thi riêng.",
      },
      {
        q: "Bao lâu thì tôi đạt B2?",
        a: "Không ai trả lời trung thực được câu này. Nó phụ thuộc điểm xuất phát, thời gian bạn học mỗi tuần và việc bạn có dùng tiếng Đức ngoài lớp không.",
      },
      {
        q: "Tôi học bằng điện thoại được không?",
        a: "Được. Lớp học trên điện thoại ưu tiên nội dung bài và nút nói; phần còn lại thu gọn lại.",
      },
    ],
  },
  cta: {
    h2: "Bắt đầu bằng một bài kiểm tra thật",
    lede: "Bốn kỹ năng được kiểm riêng. Kết quả nói rõ bạn đang ở đâu và phần nào chưa đủ dữ liệu để kết luận.",
    button: "Tạo tài khoản và kiểm tra",
    fine: "Hiện chưa mở bán: lớp học mở cho mọi tài khoản đã đăng ký và chưa thu tiền của ai.",
  },
  footer: {
    hq: "Trụ sở",
    phone: "Điện thoại",
    email: "Email",
    website: "Website",
    social: "Kênh của chúng tôi",
    mapTitle: "Bản đồ vị trí trụ sở {name}",
    directions: "Chỉ đường",
    motto: "Kiến tạo tri thức – Dẫn lối tương lai",
    learn: "Học",
    account: "Tài khoản",
    legal: "Pháp lý",
    offices: "Văn phòng",
    links: {
      program: "Chương trình A1–B2",
      classroom: "Lớp học",
      team: "Đội ngũ giảng dạy",
      pricing: "Học phí",
      signup: "Tạo tài khoản",
      signin: "Đăng nhập",
      faq: "Câu hỏi thường gặp",
      placementRules: "Quy chế kiểm tra xếp lớp",
      terms: "Điều khoản sử dụng",
      privacy: "Quyền riêng tư",
      placementShort: "Quy chế kiểm tra",
    },
    rights: "Bản quyền thuộc về {name}.",
    aiNote: "Nội dung học do AI hỗ trợ biên soạn và có người duyệt trước khi xuất bản.",
    missing: {
      register: "mã số doanh nghiệp",
      vatId: "mã số thuế",
      responsible: "người chịu trách nhiệm nội dung",
      sentence:
        "Chưa có {list}. Những mục này bắt buộc phải có trước khi trang được công khai và mở bán.",
    },
  },
};

export type Dict = typeof vi;
