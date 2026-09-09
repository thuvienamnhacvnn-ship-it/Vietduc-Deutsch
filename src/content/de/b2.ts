import type { GapItem, McqItem, SpeakItem, WriteItem } from "@/content/placement-types";

/** Ngân hàng B2 - phần mở rộng. Xem ghi chú ở `a1.ts`. */

export const B2_MCQ: McqItem[] = [
  {
    code: "B2-R-03",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    passage:
      "Dass Fachkräfte fehlen, ist längst bekannt. Weniger diskutiert wird jedoch, dass viele bereits im Land lebende Menschen ihre im Ausland erworbenen Abschlüsse nicht anerkennen lassen können - nicht aus Mangel an Qualifikation, sondern an Verfahren.",
    prompt: "Ý chính của đoạn văn là gì?",
    options: [
      "Vấn đề nằm ở thủ tục công nhận bằng cấp, không phải ở trình độ người lao động",
      "Nước Đức không thiếu lao động có tay nghề",
      "Bằng cấp nước ngoài thường kém chất lượng hơn",
      "Người lao động nhập cư không muốn làm thủ tục",
    ],
    answer: 0,
    why: "„nicht aus Mangel an Qualifikation, sondern an Verfahren“ — không phải thiếu trình độ mà là thiếu (vướng) thủ tục. Cấu trúc „nicht …, sondern …“ chính là chỗ đặt ý chính.",
  },
  {
    code: "B2-R-04",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    passage:
      "Der Betriebsrat äußerte sich zurückhaltend zu den Plänen der Geschäftsführung. Man wolle die Vorschläge zunächst prüfen, bevor man sich festlege.",
    prompt: "Thái độ của hội đồng lao động là gì?",
    options: [
      "Dè dặt, muốn xem xét trước khi quyết",
      "Ủng hộ hoàn toàn kế hoạch",
      "Phản đối gay gắt",
      "Không quan tâm tới kế hoạch",
    ],
    answer: 0,
    why: "„äußerte sich zurückhaltend“ là phát biểu dè dặt; „zunächst prüfen, bevor man sich festlegt“ là xem xét trước khi chốt. „wolle“ là Konjunktiv I - lối tường thuật gián tiếp của báo chí.",
  },
  {
    code: "B2-G-03",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "___ er lange gearbeitet hatte, war er nicht müde.",
    options: ["Obwohl", "Weil", "Nachdem", "Damit"],
    answer: 0,
    why: "Hai vế nghịch nhau (làm việc lâu nhưng không mệt) nên dùng „obwohl“. „Nachdem“ chỉ nói thứ tự thời gian, không diễn tả sự nghịch lý.",
  },
  {
    code: "B2-G-04",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "Die Kosten lassen sich nur senken, ___ man den Verbrauch reduziert.",
    options: ["indem", "obwohl", "damit", "sodass"],
    answer: 0,
    why: "„indem“ nêu CÁCH THỨC đạt được điều gì (bằng cách…). „damit“ nêu mục đích, „sodass“ nêu hệ quả.",
  },
  {
    code: "B2-G-05",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "Der Antrag muss bis Freitag ___ werden.",
    options: ["eingereicht", "einreichen", "eingereicht haben", "einzureichen"],
    answer: 0,
    why: "Bị động với động từ tình thái: „muss … eingereicht werden“ — Partizip II đứng trước „werden“.",
  },
  {
    code: "B2-V-02",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "„Das kommt für mich nicht infrage.“ nghĩa là gì?",
    options: [
      "Với tôi chuyện đó không thể chấp nhận",
      "Tôi chưa hiểu câu hỏi",
      "Tôi cần suy nghĩ thêm",
      "Chuyện đó không liên quan tới tôi",
    ],
    answer: 0,
    why: "„nicht infrage kommen“ là dứt khoát không được, không nằm trong lựa chọn - mạnh hơn nhiều so với „ich weiß nicht“.",
  },
  {
    code: "B2-V-03",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "„Sie hat sich in die Sache eingearbeitet.“ nghĩa là gì?",
    options: [
      "Cô ấy đã tự làm quen và nắm được công việc",
      "Cô ấy đã bị cuốn vào rắc rối",
      "Cô ấy đã bàn giao công việc",
      "Cô ấy đã làm thêm giờ",
    ],
    answer: 0,
    why: "„sich einarbeiten“ là làm quen với công việc mới cho tới khi thạo. Đây là chữ đứng trong hầu hết mô tả công việc ở Đức.",
  },
];

export const B2_LISTENING: McqItem[] = [
  {
    code: "B2-L-03",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Grundsätzlich ist die Regelung sinnvoll. Allerdings stellt sich die Frage, ob kleinere Betriebe den zusätzlichen Aufwand überhaupt leisten können.",
    prompt: "Người nói có quan điểm thế nào?",
    options: [
      "Về cơ bản tán thành, nhưng nghi ngờ khả năng thực hiện của doanh nghiệp nhỏ",
      "Phản đối hoàn toàn quy định",
      "Cho rằng doanh nghiệp nhỏ hưởng lợi nhiều nhất",
      "Cho rằng quy định nên áp dụng sớm hơn",
    ],
    answer: 0,
    why: "„Grundsätzlich … sinnvoll“ là về cơ bản hợp lý; „Allerdings stellt sich die Frage, ob …“ là nêu điểm ngờ. „allerdings“ chính là bản lề đổi hướng của câu.",
  },
  {
    code: "B2-L-04",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Anders als im Vorjahr wurden die Mittel diesmal nicht gekürzt, sondern lediglich anders verteilt.",
    prompt: "Năm nay ngân sách thế nào?",
    options: [
      "Không bị cắt, chỉ phân bổ khác đi",
      "Bị cắt mạnh hơn năm ngoái",
      "Được tăng thêm đáng kể",
      "Giữ nguyên cách phân bổ như năm ngoái",
    ],
    answer: 0,
    why: "„nicht gekürzt, sondern lediglich anders verteilt“ — không cắt mà chỉ phân bổ khác. „lediglich“ nghĩa là chỉ, thuần túy.",
  },
  {
    code: "B2-L-05",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Ich hätte den Vertrag nicht unterschrieben, wenn ich gewusst hätte, dass die Probezeit sechs Monate dauert.",
    prompt: "Người này muốn nói gì?",
    options: [
      "Nếu biết thời gian thử việc là sáu tháng thì đã không ký",
      "Đã ký vì thời gian thử việc chỉ sáu tháng",
      "Đang cân nhắc có nên ký hay không",
      "Muốn rút ngắn thời gian thử việc xuống sáu tháng",
    ],
    answer: 0,
    why: "Konjunktiv II quá khứ („hätte … unterschrieben“, „hätte gewusst“) diễn tả điều trái với thực tế đã xảy ra: thực tế là đã ký.",
  },
  {
    code: "B2-L-06",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Die Teilnahme ist freiwillig. Wer sich jedoch anmeldet, verpflichtet sich, an allen vier Terminen teilzunehmen.",
    prompt: "Quy định tham gia thế nào?",
    options: [
      "Tự nguyện đăng ký, nhưng đã đăng ký thì phải dự đủ bốn buổi",
      "Bắt buộc tham gia cả bốn buổi",
      "Tự nguyện, tới buổi nào cũng được",
      "Chỉ cần dự một trong bốn buổi",
    ],
    answer: 0,
    why: "„freiwillig“ là tự nguyện; „verpflichtet sich“ là cam kết ràng buộc — đăng ký rồi thì phải dự đủ.",
  },
  {
    code: "B2-L-07",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Es hilft wenig, immer mehr Kurse anzubieten, solange die Betreuung der Teilnehmer auf der Strecke bleibt.",
    prompt: "Người nói cho rằng vấn đề nằm ở đâu?",
    options: [
      "Mở thêm khóa không giải quyết được gì nếu việc kèm cặp học viên bị bỏ bê",
      "Số lượng khóa học còn quá ít",
      "Học viên không chịu tham gia",
      "Chi phí các khóa học quá cao",
    ],
    answer: 0,
    why: "„auf der Strecke bleiben“ là bị bỏ rơi, bị bỏ lại phía sau. Cả câu nói: thêm khóa mà thiếu kèm cặp thì vô ích.",
  },
  {
    code: "B2-L-08",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Nach Angaben der Behörde soll das Verfahren künftig digital ablaufen, was den Bearbeitungszeitraum deutlich verkürzen dürfte.",
    prompt: "Thông tin nói gì về thủ tục?",
    options: [
      "Sẽ chuyển sang làm trực tuyến, dự kiến rút ngắn đáng kể thời gian xử lý",
      "Đã chuyển sang trực tuyến từ lâu",
      "Sẽ kéo dài hơn vì phải số hóa",
      "Sẽ bỏ hẳn, không cần thủ tục nữa",
    ],
    answer: 0,
    why: "„soll … digital ablaufen“ là dự kiến sẽ chạy trên môi trường số; „dürfte … verkürzen“ là nhiều khả năng sẽ rút ngắn — „dürfte“ ở đây là phỏng đoán, không phải sự cho phép.",
  },
];

export const B2_GAP: GapItem[] = [
  {
    code: "B2-F-03",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Die Firma konnte die Krise überstehen, ___ sie früh reagiert hat.",
    hint: "liên từ chỉ cách thức: „bằng cách“",
    accept: ["indem"],
    why: "„indem“ nêu cách đạt được kết quả. „weil“ cũng nêu nguyên nhân nhưng câu này nhấn vào phương thức: nhờ phản ứng sớm.",
  },
  {
    code: "B2-F-04",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Er tat so, ___ ob nichts passiert wäre.",
    hint: "từ mở cụm so sánh giả định, đi trước „ob“",
    accept: ["als"],
    why: "Cụm „als ob“ + Konjunktiv II diễn tả điều giả vờ, không có thật: làm như thể không có chuyện gì.",
  },
  {
    code: "B2-F-05",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "___ der schlechten Wirtschaftslage stellt das Unternehmen neue Leute ein.",
    hint: "giới từ nghĩa „mặc dù“, đi với cách 2",
    accept: ["trotz"],
    why: "„trotz + Genitiv“: „trotz der schlechten Wirtschaftslage“ — mặc dù tình hình kinh tế xấu.",
  },
  {
    code: "B2-F-06",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Der Antrag muss bis Montag ___ werden.",
    hint: "Partizip II của „bearbeiten“",
    accept: ["bearbeitet"],
    why: "Bị động: „bearbeitet werden“. Tiền tố „be-“ không tách nên Partizip II không có „ge-“.",
  },
  {
    code: "B2-F-07",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Es liegt ___ dir, ob wir das Angebot annehmen.",
    hint: "giới từ trong cụm „quyết định là ở ai“",
    accept: ["an"],
    why: "„Es liegt an dir“ là chuyện đó tùy ở bạn. „liegen an + Dativ“ vừa chỉ nguyên nhân vừa chỉ trách nhiệm.",
  },
  {
    code: "B2-F-08",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Je mehr man übt, ___ sicherer wird man.",
    hint: "vế thứ hai của cấu trúc „càng… càng…“",
    accept: ["desto", "umso"],
    why: "Cấu trúc „je + so sánh hơn …, desto/umso + so sánh hơn …“. Vế „je“ đẩy động từ xuống cuối, vế „desto“ thì động từ đứng ngay sau.",
  },
];

export const B2_WRITE: WriteItem[] = [
  {
    code: "B2-W-02",
    kind: "write",
    level: "B2",
    skill: "writing",
    prompt:
      "Ở nhiều nơi, người ta đề nghị bắt buộc học tiếng của nước sở tại trước khi được nhận việc. Hãy nêu quan điểm của bạn, có lập luận phản bác và một kết luận.",
    hint: "Khoảng 10-14 câu. Nên có một đoạn nêu ý ngược lại rồi mới kết.",
    minWords: 90,
    expectPatterns: [
      { label: "nêu quan điểm", any: ["meiner meinung nach", "meiner ansicht nach", "ich bin der meinung", "ich vertrete"] },
      { label: "lập luận có cấu trúc", any: ["einerseits", "andererseits", "zwar", "jedoch", "allerdings", "dagegen"] },
      { label: "câu phức", any: ["obwohl", "während", "sodass", "indem", "damit", "dass"] },
      { label: "kết luận", any: ["zusammenfassend", "abschließend", "insgesamt", "folglich", "daher"] },
    ],
  },
];

export const B2_SPEAK: SpeakItem[] = [
  {
    code: "B2-S-01",
    kind: "speak",
    level: "B2",
    skill: "speaking",
    prompt:
      "Trình bày bằng tiếng Đức quan điểm của bạn: người mới sang Đức nên đi làm ngay hay nên học tiếng cho vững trước? Nêu lý do và một ý phản bác. Khoảng một phút rưỡi.",
    hint: "Cấu trúc giúp bạn nói mạch lạc: quan điểm - hai lý do - ý ngược lại - kết.",
  },
  {
    code: "B2-S-02",
    kind: "speak",
    level: "B2",
    skill: "speaking",
    prompt:
      "Bạn phải trình bày với cấp trên vì sao nhóm bạn cần thêm thời gian cho một dự án. Hãy nói bằng tiếng Đức. Khoảng một phút rưỡi.",
    hint: "Nêu tình hình, nguyên nhân, đề xuất cụ thể, rồi cam kết.",
  },
];
