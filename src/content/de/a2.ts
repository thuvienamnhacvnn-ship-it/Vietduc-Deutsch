import type { GapItem, McqItem, SpeakItem, WriteItem } from "@/content/placement-types";

/** Ngân hàng A2 - phần mở rộng. Xem ghi chú ở `a1.ts`. */

export const A2_MCQ: McqItem[] = [
  {
    code: "A2-R-02",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    passage:
      "Liebe Kollegen, am Freitag fällt die Besprechung aus. Wir treffen uns stattdessen am Montag um neun Uhr im großen Raum. Bitte bringt eure Unterlagen mit. Viele Grüße, Frau Berger",
    prompt: "Chuyện gì xảy ra với cuộc họp thứ Sáu?",
    options: [
      "Bị hủy, chuyển sang thứ Hai",
      "Vẫn họp nhưng đổi phòng",
      "Bị lùi sang chiều thứ Sáu",
      "Chỉ hoãn với một số người",
    ],
    answer: 0,
    why: "„fällt … aus“ (ausfallen) là bị hủy; „stattdessen am Montag“ là thay vào đó họp thứ Hai.",
  },
  {
    code: "A2-R-03",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    passage:
      "Achtung: Wegen Bauarbeiten fährt die Linie 5 diese Woche nicht bis zum Hauptbahnhof. Bitte steigen Sie an der Haltestelle Marktplatz in den Bus 12 um.",
    prompt: "Hành khách phải làm gì?",
    options: [
      "Đổi sang xe buýt 12 ở bến Marktplatz",
      "Đi bộ tới ga chính",
      "Chờ tuyến 5 ở ga chính",
      "Mua vé mới ở Marktplatz",
    ],
    answer: 0,
    why: "„steigen Sie … in den Bus 12 um“ — „umsteigen“ là đổi phương tiện, tại bến „Marktplatz“.",
  },
  {
    code: "A2-G-04",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Ich helfe ___ Nachbarn beim Umzug.",
    options: ["dem", "den", "der", "das"],
    answer: 0,
    why: "„helfen“ luôn đi với cách 3 (Dativ). „der Nachbar“ ở Dativ số ít là „dem Nachbarn“.",
  },
  {
    code: "A2-G-05",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Der Kurs beginnt um acht, ___ stehe ich früh auf.",
    options: ["deshalb", "weil", "obwohl", "dass"],
    answer: 0,
    why: "„deshalb“ nối hai câu chính theo quan hệ nguyên nhân - kết quả và giữ động từ ở vị trí thứ hai („deshalb stehe ich…“). „weil“ thì phải đẩy động từ xuống cuối.",
  },
  {
    code: "A2-G-06",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Berlin ist ___ als Leipzig.",
    options: ["größer", "am größten", "groß", "so groß"],
    answer: 0,
    why: "So sánh hơn dùng dạng „größer … als“. „am größten“ là so sánh nhất, không đi với „als“.",
  },
  {
    code: "A2-G-07",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Wann ___ du gestern nach Hause gekommen?",
    options: ["bist", "hast", "warst", "bist du"],
    answer: 0,
    why: "„kommen“ chỉ sự di chuyển nên thì Perfekt dùng „sein“: „du bist gekommen“.",
  },
  {
    code: "A2-V-02",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "„Ich muss einen Termin beim Arzt vereinbaren.“ — bạn đang định làm gì?",
    options: ["Đặt lịch hẹn khám", "Hủy lịch khám", "Đi khám ngay bây giờ", "Hỏi đường tới phòng khám"],
    answer: 0,
    why: "„einen Termin vereinbaren“ là hẹn lịch. Hủy hẹn là „absagen“, dời hẹn là „verschieben“.",
  },
];

export const A2_LISTENING: McqItem[] = [
  {
    code: "A2-L-03",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Guten Tag, hier ist die Praxis Dr. Klein. Ihr Termin am Dienstag muss leider verschoben werden. Passt Ihnen Donnerstag um elf Uhr?",
    prompt: "Phòng khám gọi để làm gì?",
    options: [
      "Dời lịch hẹn sang thứ Năm 11 giờ",
      "Hủy hẳn lịch hẹn",
      "Nhắc bệnh nhân mang giấy tờ",
      "Báo phòng khám đóng cửa",
    ],
    answer: 0,
    why: "„muss verschoben werden“ là phải dời lại, và họ đề nghị „Donnerstag um elf Uhr“ — thứ Năm 11 giờ.",
  },
  {
    code: "A2-L-04",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Nächste Woche bleibt das Büro am Mittwoch geschlossen. Wenn Sie etwas brauchen, schreiben Sie bitte eine E-Mail.",
    prompt: "Thứ Tư tuần sau thế nào?",
    options: [
      "Văn phòng đóng cửa, cần gì thì gửi email",
      "Văn phòng mở muộn hơn thường lệ",
      "Chỉ nhận khách có hẹn trước",
      "Văn phòng chuyển sang chỗ mới",
    ],
    answer: 0,
    why: "„bleibt … geschlossen“ là vẫn đóng cửa; „schreiben Sie bitte eine E-Mail“ là cách liên hệ thay thế.",
  },
  {
    code: "A2-L-05",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Ich habe am Wochenende meine Wohnung geputzt und danach mit meiner Familie telefoniert.",
    prompt: "Cuối tuần người này đã làm gì?",
    options: [
      "Dọn nhà rồi gọi điện cho gia đình",
      "Đi thăm gia đình",
      "Đi làm rồi dọn nhà",
      "Gọi điện rồi đi mua đồ",
    ],
    answer: 0,
    why: "„geputzt“ (putzen - lau dọn) rồi „danach … telefoniert“ — sau đó gọi điện. Cả hai đều ở thì Perfekt.",
  },
  {
    code: "A2-L-06",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Der Deutschkurs für Anfänger findet dienstags und donnerstags von achtzehn bis zwanzig Uhr statt.",
    prompt: "Lớp học vào những ngày nào?",
    options: [
      "Thứ Ba và thứ Năm, 18-20 giờ",
      "Thứ Hai và thứ Tư, 18-20 giờ",
      "Thứ Ba và thứ Năm, 8-10 giờ",
      "Hằng ngày, 18-20 giờ",
    ],
    answer: 0,
    why: "„dienstags und donnerstags“ là thứ Ba và thứ Năm hằng tuần; „von achtzehn bis zwanzig Uhr“ là 18 tới 20 giờ.",
  },
  {
    code: "A2-L-07",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Entschuldigung, können Sie mir helfen? Ich suche das Rathaus. — Gehen Sie geradeaus und dann die zweite Straße links.",
    prompt: "Chỉ đường thế nào?",
    options: [
      "Đi thẳng rồi rẽ trái ở con phố thứ hai",
      "Đi thẳng rồi rẽ phải ở con phố thứ hai",
      "Rẽ trái ngay rồi đi thẳng",
      "Đi thẳng tới cuối phố rồi hỏi tiếp",
    ],
    answer: 0,
    why: "„geradeaus“ là đi thẳng, „die zweite Straße links“ là phố thứ hai bên trái.",
  },
  {
    code: "A2-L-08",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Leider kann ich morgen nicht arbeiten. Ich bin erkältet und gehe heute noch zum Arzt.",
    prompt: "Vì sao mai người này không đi làm được?",
    options: ["Bị cảm, hôm nay đi khám", "Phải trông con", "Đi công tác xa", "Xe hỏng"],
    answer: 0,
    why: "„erkältet“ là bị cảm lạnh, và „gehe … zum Arzt“ là đi khám bác sĩ.",
  },
];

export const A2_GAP: GapItem[] = [
  {
    code: "A2-F-03",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Ich rufe dich an, ___ ich zu Hause bin.",
    hint: "liên từ nghĩa „khi nào“, đẩy động từ xuống cuối",
    accept: ["wenn", "sobald"],
    why: "„wenn“ (hoặc „sobald“) mở mệnh đề phụ và đẩy „bin“ xuống cuối. „wann“ chỉ dùng để hỏi.",
  },
  {
    code: "A2-F-04",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Der Film war interessanter ___ das Buch.",
    hint: "từ đi kèm so sánh hơn",
    accept: ["als"],
    why: "So sánh hơn trong tiếng Đức dùng „als“. „wie“ chỉ dùng khi hai bên ngang nhau: „so … wie“.",
  },
  {
    code: "A2-F-05",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Kannst du mir bitte ___ Kugelschreiber geben?",
    hint: "mạo từ xác định cách 4, danh từ „der Kugelschreiber“",
    accept: ["den"],
    why: "„geben“ có tân ngữ trực tiếp ở cách 4. „der Kugelschreiber“ ở Akkusativ thành „den Kugelschreiber“.",
  },
  {
    code: "A2-F-06",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Er hat gestern den ganzen Tag ___ (arbeiten).",
    hint: "Partizip II của „arbeiten“",
    accept: ["gearbeitet"],
    why: "Động từ có quy tắc tạo Partizip II theo mẫu ge- + gốc + -t: „gearbeitet“.",
  },
  {
    code: "A2-F-07",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Ich interessiere mich ___ deutsche Musik.",
    hint: "giới từ cố định đi với „sich interessieren“",
    accept: ["für"],
    why: "„sich interessieren für + Akkusativ“ là cụm cố định. Học động từ kèm giới từ của nó là cách duy nhất để không đoán.",
  },
  {
    code: "A2-F-08",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Wir müssen um sieben Uhr ___ (aufstehen).",
    hint: "động từ tách ở dạng nguyên thể sau động từ tình thái",
    accept: ["aufstehen"],
    why: "Sau động từ tình thái, động từ chính về dạng nguyên thể và tiền tố dính liền: „aufstehen“, không tách.",
  },
];

export const A2_WRITE: WriteItem[] = [
  {
    code: "A2-W-02",
    kind: "write",
    level: "A2",
    skill: "writing",
    prompt:
      "Viết email ngắn cho trường: xin dời buổi kiểm tra vì bạn phải đi làm hôm đó, và đề xuất một ngày khác.",
    hint: "Khoảng 5-6 câu. Có lời chào, lý do và đề nghị cụ thể.",
    minWords: 30,
    expectPatterns: [
      { label: "chào hỏi trang trọng", any: ["sehr geehrte", "guten tag", "hallo", "liebe", "lieber"] },
      { label: "nêu lý do", any: ["weil", "denn", "muss", "arbeiten", "arbeit"] },
      { label: "đề nghị ngày khác", any: ["verschieben", "anderen termin", "termin", "möglich", "vorschlagen"] },
      { label: "kết thư", any: ["viele grüße", "mit freundlichen grüßen", "liebe grüße", "danke"] },
    ],
  },
];

export const A2_SPEAK: SpeakItem[] = [
  {
    code: "A2-S-01",
    kind: "speak",
    level: "A2",
    skill: "speaking",
    prompt:
      "Kể bằng tiếng Đức về cuối tuần vừa rồi của bạn: đã đi đâu, làm gì, với ai. Khoảng 40 giây.",
    hint: "Dùng thì quá khứ nếu được: „Am Samstag habe ich …“",
  },
  {
    code: "A2-S-02",
    kind: "speak",
    level: "A2",
    skill: "speaking",
    prompt:
      "Bạn tới hiệu thuốc mua thuốc cảm nhưng không biết tên thuốc. Hãy nói bằng tiếng Đức để nhờ giúp. Khoảng 40 giây.",
    hint: "Có thể mở bằng „Entschuldigung, ich brauche …“",
  },
];
