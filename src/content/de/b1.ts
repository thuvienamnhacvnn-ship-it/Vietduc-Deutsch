import type { GapItem, McqItem, SpeakItem, WriteItem } from "@/content/placement-types";

/** Ngân hàng B1 - phần mở rộng. Xem ghi chú ở `a1.ts`. */

export const B1_MCQ: McqItem[] = [
  {
    code: "B1-R-02",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    passage:
      "Immer mehr Betriebe suchen Auszubildende. Wer eine Ausbildung beginnt, verdient von Anfang an Geld und lernt gleichzeitig im Betrieb und in der Berufsschule. Voraussetzung sind meistens ausreichende Deutschkenntnisse und ein Schulabschluss.",
    prompt: "Theo đoạn văn, học nghề ở Đức có đặc điểm gì?",
    options: [
      "Vừa đi làm có lương vừa học ở trường nghề",
      "Chỉ học lý thuyết ở trường nghề",
      "Không cần bằng phổ thông",
      "Phải trả học phí cho doanh nghiệp",
    ],
    answer: 0,
    why: "„verdient von Anfang an Geld“ là có lương ngay từ đầu, „lernt gleichzeitig im Betrieb und in der Berufsschule“ là học song song ở doanh nghiệp và trường nghề.",
  },
  {
    code: "B1-R-03",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    passage:
      "Sehr geehrte Damen und Herren, hiermit kündige ich meinen Vertrag zum nächstmöglichen Zeitpunkt. Bitte bestätigen Sie mir den Erhalt dieser Kündigung schriftlich.",
    prompt: "Người viết muốn gì?",
    options: [
      "Chấm dứt hợp đồng và xin xác nhận bằng văn bản",
      "Gia hạn hợp đồng thêm một năm",
      "Khiếu nại về chất lượng dịch vụ",
      "Xin đổi sang gói dịch vụ khác",
    ],
    answer: 0,
    why: "„kündige ich meinen Vertrag“ là chấm dứt hợp đồng; „bestätigen Sie … schriftlich“ là xin xác nhận bằng văn bản.",
  },
  {
    code: "B1-G-04",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "Das ist der Kollege, ___ mir bei der Bewerbung geholfen hat.",
    options: ["der", "den", "dem", "dessen"],
    answer: 0,
    why: "Đại từ quan hệ làm chủ ngữ của mệnh đề („… hat geholfen“) nên ở cách 1, giống đực: „der“.",
  },
  {
    code: "B1-G-05",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "Ich weiß nicht, ___ der Kurs am Montag stattfindet.",
    options: ["ob", "wenn", "dass", "als"],
    answer: 0,
    why: "Câu hỏi gián tiếp không có từ để hỏi thì dùng „ob“ (liệu có… hay không). „wenn“ là điều kiện, „dass“ là mệnh đề khẳng định.",
  },
  {
    code: "B1-G-06",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "Er ging zur Arbeit, ___ er krank war.",
    options: ["obwohl", "weil", "damit", "seitdem"],
    answer: 0,
    why: "Hai vế trái ngược nhau (ốm nhưng vẫn đi làm) nên dùng „obwohl“ — mặc dù.",
  },
  {
    code: "B1-V-02",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "„Sie müssen den Antrag bis Ende des Monats einreichen.“ — bạn phải làm gì?",
    options: [
      "Nộp đơn trước cuối tháng",
      "Ký đơn rồi giữ lại",
      "Rút đơn đã nộp",
      "Bổ sung giấy tờ cho đơn cũ",
    ],
    answer: 0,
    why: "„einreichen“ là nộp (hồ sơ, đơn). Từ này gặp khắp nơi trong giấy tờ hành chính ở Đức.",
  },
  {
    code: "B1-V-03",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "„Die Stelle ist befristet.“ nghĩa là gì?",
    options: [
      "Vị trí làm việc có thời hạn",
      "Vị trí đã có người nhận",
      "Vị trí làm việc toàn thời gian",
      "Vị trí đang tạm ngừng tuyển",
    ],
    answer: 0,
    why: "„befristet“ là có thời hạn; ngược lại là „unbefristet“ — không thời hạn. Đây là chữ quyết định khi đọc hợp đồng lao động.",
  },
];

export const B1_LISTENING: McqItem[] = [
  {
    code: "B1-L-03",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Wenn Sie sich bewerben möchten, schicken Sie uns bitte Ihren Lebenslauf und Ihr letztes Zeugnis. Ein Anschreiben ist nicht nötig.",
    prompt: "Cần gửi những gì khi ứng tuyển?",
    options: [
      "Sơ yếu lý lịch và bảng điểm gần nhất",
      "Thư xin việc và sơ yếu lý lịch",
      "Chỉ thư xin việc",
      "Sơ yếu lý lịch, bảng điểm và thư xin việc",
    ],
    answer: 0,
    why: "„Lebenslauf“ là CV, „Zeugnis“ là bằng hoặc bảng điểm; „ein Anschreiben ist nicht nötig“ — không cần thư xin việc.",
  },
  {
    code: "B1-L-04",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Aufgrund einer Störung im Betriebsablauf kommt es heute zu Verspätungen von etwa zwanzig Minuten. Wir bitten um Ihr Verständnis.",
    prompt: "Thông báo nói gì?",
    options: [
      "Hôm nay chậm khoảng 20 phút do sự cố vận hành",
      "Chuyến bị hủy hoàn toàn",
      "Chậm khoảng hai tiếng vì thời tiết",
      "Đổi sang tuyến khác",
    ],
    answer: 0,
    why: "„Verspätungen von etwa zwanzig Minuten“ là chậm khoảng 20 phút, nguyên nhân „Störung im Betriebsablauf“ — sự cố vận hành.",
  },
  {
    code: "B1-L-05",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Ich würde gern an dem Kurs teilnehmen, aber er ist mir zu teuer. Gibt es vielleicht eine Ermäßigung für Studenten?",
    prompt: "Người này muốn hỏi gì?",
    options: [
      "Có giảm giá cho sinh viên không",
      "Khóa học bắt đầu khi nào",
      "Có thể trả góp không",
      "Khóa học có bao nhiêu buổi",
    ],
    answer: 0,
    why: "„Ermäßigung“ là mức giảm giá, „für Studenten“ là dành cho sinh viên.",
  },
  {
    code: "B1-L-06",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Bitte beachten Sie, dass die Anmeldung nur online möglich ist. Anmeldungen per Telefon werden nicht mehr angenommen.",
    prompt: "Đăng ký bằng cách nào?",
    options: [
      "Chỉ đăng ký trực tuyến",
      "Đăng ký qua điện thoại",
      "Đăng ký trực tiếp tại quầy",
      "Đăng ký bằng thư tay",
    ],
    answer: 0,
    why: "„nur online möglich“ là chỉ qua mạng; „per Telefon … nicht mehr angenommen“ — không nhận qua điện thoại nữa.",
  },
  {
    code: "B1-L-07",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Nach dem Praktikum hatte ich das Gefühl, dass mir die Arbeit mit Menschen mehr liegt als die Arbeit im Büro.",
    prompt: "Sau kỳ thực tập người này nhận ra điều gì?",
    options: [
      "Hợp với công việc tiếp xúc con người hơn là ngồi văn phòng",
      "Muốn học tiếp lên đại học",
      "Không muốn làm nghề này nữa",
      "Cần cải thiện tiếng Đức trước đã",
    ],
    answer: 0,
    why: "„mir liegt … mehr“ là hợp với tôi hơn; ở đây là „die Arbeit mit Menschen“ so với „die Arbeit im Büro“.",
  },
  {
    code: "B1-L-08",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Falls Sie den Termin nicht wahrnehmen können, sagen Sie bitte mindestens vierundzwanzig Stunden vorher ab. Sonst müssen wir eine Gebühr berechnen.",
    prompt: "Nếu không tới được thì sao?",
    options: [
      "Phải báo hủy trước ít nhất 24 giờ, nếu không sẽ bị tính phí",
      "Chỉ cần báo trong ngày là được",
      "Không cần báo, hẹn lại sau cũng được",
      "Phải trả phí trong mọi trường hợp",
    ],
    answer: 0,
    why: "„mindestens vierundzwanzig Stunden vorher absagen“ là hủy trước tối thiểu 24 giờ; „sonst … eine Gebühr“ là nếu không thì bị tính phí.",
  },
];

export const B1_GAP: GapItem[] = [
  {
    code: "B1-F-03",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Ich freue mich ___ deine Antwort.",
    hint: "giới từ cố định của „sich freuen“ khi nói về điều sắp tới",
    accept: ["auf"],
    why: "„sich freuen auf“ là mong chờ điều sắp tới; „sich freuen über“ là vui vì điều đã xảy ra.",
  },
  {
    code: "B1-F-04",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Das ist die Frau, ___ Sohn bei uns arbeitet.",
    hint: "đại từ quan hệ sở hữu, giống cái",
    accept: ["deren"],
    why: "Sở hữu trong mệnh đề quan hệ: giống cái và số nhiều dùng „deren“, giống đực và trung dùng „dessen“.",
  },
  {
    code: "B1-F-05",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Er lernt jeden Tag, ___ er die Prüfung besteht.",
    hint: "liên từ chỉ mục đích, dùng khi hai vế khác chủ ngữ hoặc muốn nhấn mạnh mục đích",
    accept: ["damit"],
    why: "„damit“ mở mệnh đề mục đích và đẩy động từ xuống cuối. „um … zu“ chỉ dùng khi hai vế cùng chủ ngữ và không có „er“ thứ hai.",
  },
  {
    code: "B1-F-06",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Die Wohnung ist seit zwei Monaten ___ (vermieten).",
    hint: "Partizip II của „vermieten“",
    accept: ["vermietet"],
    why: "Động từ có tiền tố không tách („ver-“) thì Partizip II KHÔNG thêm „ge-“: „vermietet“.",
  },
  {
    code: "B1-F-07",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "___ des Regens sind wir spazieren gegangen.",
    hint: "giới từ nghĩa „mặc dù“, đi với cách 2",
    accept: ["trotz"],
    why: "„trotz + Genitiv“: „trotz des Regens“ — mặc dù trời mưa.",
  },
  {
    code: "B1-F-08",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "An deiner Stelle ___ ich mit dem Chef sprechen.",
    hint: "Konjunktiv II của „werden“, ngôi ich",
    accept: ["würde"],
    why: "Lời khuyên lịch sự dùng Konjunktiv II: „An deiner Stelle würde ich …“ — nếu ở vị trí bạn thì tôi sẽ…",
  },
];

export const B1_WRITE: WriteItem[] = [
  {
    code: "B1-W-02",
    kind: "write",
    level: "B1",
    skill: "writing",
    prompt:
      "Viết thư xin việc ngắn cho một vị trí học nghề (Ausbildung): vì sao bạn quan tâm, bạn có kinh nghiệm gì, và đề nghị một buổi phỏng vấn.",
    hint: "Khoảng 8-10 câu, giọng trang trọng.",
    minWords: 55,
    expectPatterns: [
      { label: "mở thư trang trọng", any: ["sehr geehrte", "sehr geehrter"] },
      { label: "nói về vị trí", any: ["ausbildung", "stelle", "bewerbe", "bewerbung", "interessiere"] },
      { label: "nêu kinh nghiệm hoặc năng lực", any: ["erfahrung", "praktikum", "gearbeitet", "kenntnisse", "gelernt"] },
      { label: "đề nghị phỏng vấn", any: ["vorstellungsgespräch", "gespräch", "freuen", "einladung"] },
      { label: "kết thư", any: ["mit freundlichen grüßen", "freundlichen grüßen"] },
    ],
  },
];

export const B1_SPEAK: SpeakItem[] = [
  {
    code: "B1-S-01",
    kind: "speak",
    level: "B1",
    skill: "speaking",
    prompt:
      "Kể bằng tiếng Đức về công việc hoặc việc học hiện tại của bạn và một khó khăn bạn đang gặp. Khoảng một phút.",
    hint: "Cố gắng dùng ít nhất một mệnh đề với „weil“ hoặc „obwohl“.",
  },
  {
    code: "B1-S-02",
    kind: "speak",
    level: "B1",
    skill: "speaking",
    prompt:
      "Hàng bạn mua trên mạng bị giao sai. Hãy gọi điện bằng tiếng Đức để trình bày và đề nghị cách giải quyết. Khoảng một phút.",
    hint: "Nêu vấn đề trước, rồi mới đề nghị: „Ich möchte, dass …“",
  },
];
