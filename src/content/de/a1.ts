import type { GapItem, McqItem, SpeakItem, WriteItem } from "@/content/placement-types";

/**
 * Ngân hàng A1 - phần mở rộng.
 *
 * Bốn tệp `a1..b2` là phần thêm vào bộ câu hỏi gốc trong `placement.ts`. Có
 * thêm chúng thì mỗi lần thi mới rút được một đề khác: một cấp độ cần nhiều
 * câu hơn số câu thực sự hỏi, nếu không thì "đề khác nhau" chỉ là đảo thứ tự
 * của đúng một đề.
 *
 * Mã câu hỏi KHÔNG BAO GIỜ được dùng lại cho nội dung khác. Bài làm cũ trỏ tới
 * phiên bản câu hỏi theo mã; đổi ruột một mã là làm sai lệch điểm đã chấm.
 *
 * Nội dung tiếng Đức viết mới cho dự án này, tình huống lấy từ đời sống thật
 * của người Việt ở Đức: đi chợ, xin nghỉ ốm, hẹn bác sĩ, làm hồ sơ Ausbildung.
 */

export const A1_MCQ: McqItem[] = [
  {
    code: "A1-R-03",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    passage:
      "Familie Nguyen wohnt in Leipzig. Der Vater arbeitet in einer Firma, die Mutter lernt Deutsch. Die Tochter geht in die Schule und der Sohn ist noch klein.",
    prompt: "Mẹ trong gia đình này đang làm gì?",
    options: ["Học tiếng Đức", "Làm ở một công ty", "Đi học phổ thông", "Ở nhà trông em"],
    answer: 0,
    why: "„die Mutter lernt Deutsch“ — „lernen“ là học, nên mẹ đang học tiếng Đức. Bố mới là người „arbeitet in einer Firma“.",
  },
  {
    code: "A1-R-04",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    passage: "Öffnungszeiten: Montag bis Freitag 8-18 Uhr. Samstag 9-13 Uhr. Sonntag geschlossen.",
    prompt: "Chủ nhật cửa hàng thế nào?",
    options: ["Đóng cửa", "Mở từ 9 đến 13 giờ", "Mở từ 8 đến 18 giờ", "Chỉ mở buổi chiều"],
    answer: 0,
    why: "„geschlossen“ nghĩa là đóng cửa. Đây là chữ hay gặp nhất trên cửa hàng ở Đức, cùng cặp với „geöffnet“.",
  },
  {
    code: "A1-R-05",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    passage:
      "Hallo Lan, ich kann heute nicht kommen. Mein Kind ist krank. Können wir uns morgen um 15 Uhr treffen? Liebe Grüße, Thu",
    prompt: "Thu muốn gì?",
    options: [
      "Dời buổi gặp sang ngày mai lúc 15 giờ",
      "Hủy hẳn buổi gặp",
      "Gặp hôm nay muộn hơn",
      "Nhờ Lan trông con giúp",
    ],
    answer: 0,
    why: "„Können wir uns morgen um 15 Uhr treffen?“ là đề nghị gặp vào ngày mai lúc 15 giờ, tức dời lịch chứ không hủy.",
  },
  {
    code: "A1-G-03",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Wir ___ heute sehr müde.",
    options: ["sind", "seid", "ist", "bin"],
    answer: 0,
    why: "Ngôi „wir“ đi với „sind“. „seid“ là của „ihr“, „ist“ của „er/sie/es“.",
  },
  {
    code: "A1-G-04",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Ich kaufe ___ Apfel.",
    options: ["einen", "ein", "eine", "einem"],
    answer: 0,
    why: "„kaufen“ đi với cách 4 (Akkusativ). „der Apfel“ giống đực, ở cách 4 thành „einen Apfel“.",
  },
  {
    code: "A1-G-05",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Ich ___ heute arbeiten, ich habe keine Zeit.",
    options: ["muss", "musst", "möchte nicht", "kann nicht"],
    answer: 0,
    why: "Ngôi „ich“ của „müssen“ là „muss“ (không có đuôi). Câu sau giải thích lý do nên nghĩa „phải“ mới hợp.",
  },
  {
    code: "A1-V-02",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "„Wo ist der Bahnhof?“ — bạn đang hỏi đường tới đâu?",
    options: ["Nhà ga", "Bệnh viện", "Chợ", "Bưu điện"],
    answer: 0,
    why: "„der Bahnhof“ là nhà ga. Bệnh viện là „das Krankenhaus“, bưu điện là „die Post“.",
  },
];

export const A1_LISTENING: McqItem[] = [
  {
    code: "A1-L-03",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Der Zug nach München fährt um zehn Uhr ab.",
    prompt: "Tàu chạy lúc mấy giờ?",
    options: ["10 giờ", "2 giờ", "12 giờ", "8 giờ"],
    answer: 0,
    why: "„um zehn Uhr“ là lúc 10 giờ. „abfahren“ là khởi hành — chữ hay nghe ở nhà ga.",
  },
  {
    code: "A1-L-04",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Ich hätte gern ein Brötchen und einen Tee, bitte.",
    prompt: "Người này gọi gì?",
    options: ["Bánh mì và trà", "Bánh mì và cà phê", "Bánh ngọt và trà", "Chỉ một ly trà"],
    answer: 0,
    why: "„ein Brötchen“ là chiếc bánh mì nhỏ, „einen Tee“ là một trà. „Ich hätte gern…“ là cách gọi món lịch sự.",
  },
  {
    code: "A1-L-05",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Mein Name ist Klaus Weber. Ich wohne in der Gartenstraße zwölf.",
    prompt: "Ông ấy sống ở đâu?",
    options: ["Gartenstraße số 12", "Gartenstraße số 20", "Bergstraße số 12", "Gartenweg số 2"],
    answer: 0,
    why: "„in der Gartenstraße zwölf“ — tên phố Gartenstraße, số nhà 12 („zwölf“).",
  },
  {
    code: "A1-L-06",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Wir treffen uns am Samstag um drei Uhr vor dem Kino.",
    prompt: "Hẹn gặp khi nào và ở đâu?",
    options: [
      "Thứ Bảy 3 giờ, trước rạp chiếu phim",
      "Thứ Bảy 3 giờ, trong rạp chiếu phim",
      "Chủ nhật 3 giờ, trước rạp chiếu phim",
      "Thứ Bảy 4 giờ, trước nhà ga",
    ],
    answer: 0,
    why: "„am Samstag“ thứ Bảy, „um drei Uhr“ 3 giờ, „vor dem Kino“ là trước rạp — „vor“ là phía trước, không phải bên trong.",
  },
  {
    code: "A1-L-07",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Das macht acht Euro fünfzig, bitte.",
    prompt: "Phải trả bao nhiêu tiền?",
    options: ["8,50 euro", "18,50 euro", "8,15 euro", "80,50 euro"],
    answer: 0,
    why: "„acht Euro fünfzig“ là 8 euro 50 cent. Người Đức đọc tiền theo thứ tự euro rồi cent, không nói „Cent“ ở cuối.",
  },
  {
    code: "A1-L-08",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Entschuldigung, die Apotheke ist heute geschlossen. Sie öffnet morgen um acht.",
    prompt: "Hôm nay hiệu thuốc thế nào?",
    options: ["Đóng cửa, mai 8 giờ mở", "Mở tới 8 giờ tối", "Mở cả ngày", "Đóng cửa cả tuần"],
    answer: 0,
    why: "„ist heute geschlossen“ — hôm nay đóng; „öffnet morgen um acht“ — mai 8 giờ mở.",
  },
];

export const A1_GAP: GapItem[] = [
  {
    code: "A1-F-03",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Das ___ meine Schwester. Sie heißt Linh.",
    hint: "động từ sein, chia cho „das“",
    accept: ["ist"],
    why: "Câu giới thiệu „Das ist …“ dùng „ist“, kể cả khi người được giới thiệu là phụ nữ.",
  },
  {
    code: "A1-F-04",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Wie alt ___ du?",
    hint: "động từ sein, chia cho ngôi du",
    accept: ["bist"],
    why: "Ngôi „du“ của „sein“ là „bist“. Người Đức hỏi tuổi bằng „Wie alt bist du?“, không dùng „haben“ như tiếng Việt „có bao nhiêu tuổi“.",
  },
  {
    code: "A1-F-05",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Ich fahre mit ___ Bus zur Arbeit.",
    hint: "mạo từ xác định sau „mit“, danh từ „der Bus“",
    accept: ["dem"],
    why: "„mit“ luôn đi với cách 3 (Dativ). „der Bus“ ở Dativ thành „dem Bus“.",
  },
  {
    code: "A1-F-06",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Am Wochenende ___ wir nach Hamburg.",
    hint: "động từ fahren, chia cho ngôi wir",
    accept: ["fahren"],
    why: "Ngôi „wir“ giữ nguyên dạng nguyên thể: „wir fahren“. Câu đảo trật tự nhưng động từ vẫn đứng vị trí thứ hai.",
  },
  {
    code: "A1-F-07",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Mein Bruder ___ gern Fußball.",
    hint: "động từ spielen, chia cho ngôi er",
    accept: ["spielt"],
    why: "Ngôi „er/sie/es“ lấy đuôi -t: „er spielt“. „gern“ đứng sau động từ để nói thích làm gì.",
  },
  {
    code: "A1-F-08",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "___ kostet der Kaffee? — Zwei Euro.",
    hint: "từ để hỏi giá tiền",
    accept: ["was", "wie viel", "wieviel"],
    why: "Hỏi giá là „Was kostet…?“ (hoặc „Wie viel kostet…?“). Câu trả lời là một số tiền nên từ hỏi phải hỏi về giá.",
  },
];

export const A1_WRITE: WriteItem[] = [
  {
    code: "A1-W-02",
    kind: "write",
    level: "A1",
    skill: "writing",
    prompt:
      "Viết một tin nhắn ngắn cho bạn: rủ bạn đi uống cà phê vào thứ Bảy, hẹn giờ và địa điểm.",
    hint: "Khoảng 3-4 câu. Có thể mở bằng „Hallo …“ và kết bằng „Liebe Grüße“.",
    minWords: 15,
    expectPatterns: [
      { label: "chào hỏi", any: ["hallo", "hi", "liebe", "lieber", "guten tag"] },
      { label: "rủ đi đâu", any: ["kaffee", "café", "cafe", "trinken", "treffen"] },
      { label: "nói thời gian", any: ["samstag", "am samstag", "uhr", "wochenende"] },
    ],
  },
];

export const A1_SPEAK: SpeakItem[] = [
  {
    code: "A1-S-02",
    kind: "speak",
    level: "A1",
    skill: "speaking",
    prompt:
      "Kể bằng tiếng Đức về một ngày bình thường của bạn: mấy giờ dậy, làm gì, mấy giờ đi ngủ. Khoảng 30 giây.",
    hint: "Câu ngắn cũng được: „Ich stehe um sechs Uhr auf. Dann …“",
  },
];
