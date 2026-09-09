import type { Level } from "@/lib/db/schema";
import type {
  GapItem,
  McqItem,
  PlacementItem,
  SpeakItem,
  WriteItem,
} from "@/content/placement-types";
import { A1_GAP, A1_LISTENING, A1_MCQ, A1_SPEAK, A1_WRITE } from "@/content/de/a1";
import { A2_GAP, A2_LISTENING, A2_MCQ, A2_SPEAK, A2_WRITE } from "@/content/de/a2";
import { B1_GAP, B1_LISTENING, B1_MCQ, B1_SPEAK, B1_WRITE } from "@/content/de/b1";
import { B2_GAP, B2_LISTENING, B2_MCQ, B2_SPEAK, B2_WRITE } from "@/content/de/b2";

/**
 * Ngân hàng câu hỏi xếp lớp.
 *
 * Đây là NGUỒN của nội dung; `npm run seed` nạp nó vào `question_bank` và
 * `question_versions` với version 1. Bài làm của học viên trỏ tới đúng phiên bản
 * câu hỏi, nên sửa câu hỏi về sau không làm sai lệch điểm đã chấm.
 *
 * Mỗi câu có lời giải thích tiếng Việt. Người học sai một câu mà không biết vì
 * sao sai thì bài kiểm tra chỉ là một cái máy chấm điểm.
 *
 * Nội dung tiếng Đức viết mới cho Lingora, không sao chép giáo trình thương mại.
 */

export type {
  McqItem,
  GapItem,
  WriteItem,
  SpeakItem,
  PlacementItem,
} from "@/content/placement-types";

/* ------------------------------------------------------------------ A1 */

const A1: McqItem[] = [
  {
    code: "A1-R-01",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Wie ___ du?",
    options: ["heißt", "heiße", "heißen", "heißen Sie"],
    answer: 0,
    why: "Với ngôi „du“, động từ „heißen“ chia thành „heißt“. „Ich heiße…“ mới là ngôi tôi.",
  },
  {
    code: "A1-R-02",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    passage: "Hallo, ich bin Mai. Ich komme aus Vietnam und wohne jetzt in Berlin. Ich arbeite in einem Restaurant.",
    prompt: "Mai làm việc ở đâu?",
    options: ["Trong một nhà hàng", "Trong một cửa hàng", "Ở nhà", "Trong một bệnh viện"],
    answer: 0,
    why: "„Ich arbeite in einem Restaurant“ nghĩa là „Tôi làm việc trong một nhà hàng“.",
  },
  {
    code: "A1-G-01",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Das ist ___ Buch.",
    options: ["ein", "eine", "einen", "einem"],
    answer: 0,
    why: "„das Buch“ là danh từ giống trung, nên mạo từ không xác định ở cách 1 là „ein“.",
  },
  {
    code: "A1-G-02",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "Ich habe ___ Zeit.",
    options: ["keine", "kein", "nicht", "nein"],
    answer: 0,
    why: "Phủ định một danh từ có mạo từ không xác định thì dùng „kein“. „die Zeit“ giống cái nên thành „keine“.",
  },
  {
    code: "A1-V-01",
    kind: "mcq",
    level: "A1",
    skill: "reading",
    prompt: "„Was kostet das?“ nghĩa là gì?",
    options: ["Cái này giá bao nhiêu?", "Cái này là cái gì?", "Cái này ở đâu?", "Bạn muốn gì?"],
    answer: 0,
    why: "„kosten“ là „có giá“, nên „Was kostet das?“ là câu hỏi giá quen thuộc khi mua hàng.",
  },
  {
    code: "A1-L-01",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Guten Morgen! Ich möchte einen Kaffee, bitte.",
    prompt: "Người này muốn gì?",
    options: ["Một cà phê", "Một trà", "Một bánh mì", "Một ly nước"],
    answer: 0,
    why: "„Ich möchte einen Kaffee“ — „möchten“ là „muốn“, „Kaffee“ là cà phê.",
  },
  {
    code: "A1-L-02",
    kind: "mcq",
    level: "A1",
    skill: "listening",
    audioText: "Es ist Viertel vor acht.",
    prompt: "Mấy giờ rồi?",
    options: ["7 giờ 45", "8 giờ 15", "7 giờ 15", "8 giờ 45"],
    answer: 0,
    why: "„Viertel vor acht“ là „mười lăm phút trước tám giờ“, tức 7:45. „Viertel nach acht“ mới là 8:15.",
  },
];

/* ------------------------------------------------------------------ A2 */

const A2: McqItem[] = [
  {
    code: "A2-G-01",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Gestern ___ ich einen Film gesehen.",
    options: ["habe", "bin", "hatte", "war"],
    answer: 0,
    why: "Thì Perfekt của „sehen“ đi với trợ động từ „haben“: „ich habe … gesehen“.",
  },
  {
    code: "A2-G-02",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Ich komme heute nicht, ___ ich krank bin.",
    options: ["weil", "denn", "und", "aber"],
    answer: 0,
    why: "„weil“ đẩy động từ xuống cuối mệnh đề — ở đây là „bin“ đứng cuối, nên „weil“ mới đúng. Với „denn“ thì phải viết „denn ich bin krank“.",
  },
  {
    code: "A2-G-03",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "Ich ___ gestern keine Zeit.",
    options: ["hatte", "habe", "bin", "war"],
    answer: 0,
    why: "Với „haben“, tiếng Đức thường dùng thì Präteritum khi kể quá khứ: „ich hatte“.",
  },
  {
    code: "A2-R-01",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    passage:
      "Guten Tag Frau Nguyen, Ihr Termin am Dienstag um 10 Uhr muss leider verschoben werden. Wir schlagen Donnerstag um 14 Uhr vor. Bitte rufen Sie uns zurück.",
    prompt: "Nội dung chính của tin nhắn này là gì?",
    options: [
      "Cuộc hẹn phải dời sang thứ Năm",
      "Cuộc hẹn thứ Ba vẫn giữ nguyên",
      "Cuộc hẹn bị hủy hẳn",
      "Người nhận phải trả tiền",
    ],
    answer: 0,
    why: "„verschoben werden“ là „bị dời lại“, và họ đề xuất „Donnerstag um 14 Uhr“ — thứ Năm lúc 14 giờ.",
  },
  {
    code: "A2-V-01",
    kind: "mcq",
    level: "A2",
    skill: "reading",
    prompt: "„die Rechnung“ nghĩa là gì?",
    options: ["hóa đơn", "cuộc hẹn", "đơn thuốc", "hợp đồng"],
    answer: 0,
    why: "„die Rechnung“ là hóa đơn. „der Termin“ mới là cuộc hẹn, „der Vertrag“ là hợp đồng.",
  },
  {
    code: "A2-L-01",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Achtung, eine Durchsage: Der Zug nach München fährt heute von Gleis sieben ab, nicht von Gleis drei.",
    prompt: "Tàu đi München hôm nay chạy từ đường ray nào?",
    options: ["Đường ray 7", "Đường ray 3", "Đường ray 13", "Đường ray 9"],
    answer: 0,
    why: "Câu thông báo nói „von Gleis sieben ab, nicht von Gleis drei“ — chạy từ ray 7, không phải ray 3. Đây là kiểu bẫy hay gặp trong thông báo nhà ga.",
  },
  {
    code: "A2-L-02",
    kind: "mcq",
    level: "A2",
    skill: "listening",
    audioText:
      "Ich hatte gestern Kopfschmerzen und bin früher nach Hause gegangen.",
    prompt: "Vì sao người này về nhà sớm?",
    options: ["Vì bị đau đầu", "Vì hết việc", "Vì trời mưa", "Vì có khách"],
    answer: 0,
    why: "„Kopfschmerzen“ là đau đầu; „bin früher nach Hause gegangen“ là đã về nhà sớm hơn.",
  },
];

/* ------------------------------------------------------------------ B1 */

const B1: McqItem[] = [
  {
    code: "B1-G-01",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "___ Sie mir bitte kurz helfen?",
    options: ["Könnten", "Konnten", "Können Sie", "Könnt"],
    answer: 0,
    why: "„Könnten“ là Konjunktiv II, dùng để đề nghị lịch sự. „Konnten“ là quá khứ, nghĩa hoàn toàn khác.",
  },
  {
    code: "B1-G-02",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "Das Formular ___ von der Sekretärin ausgefüllt.",
    options: ["wird", "ist", "hat", "war"],
    answer: 0,
    why: "Bị động ở hiện tại: „werden“ + Partizip II. „Das Formular wird … ausgefüllt“.",
  },
  {
    code: "B1-G-03",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "Der Kollege, ___ ich gestern getroffen habe, ist neu.",
    options: ["den", "der", "dem", "dessen"],
    answer: 0,
    why: "„treffen“ đi với cách 4, và „der Kollege“ giống đực, nên đại từ quan hệ là „den“.",
  },
  {
    code: "B1-R-01",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    passage:
      "Sehr geehrte Damen und Herren, die Waschmaschine, die ich am 3. März bei Ihnen gekauft habe, funktioniert seit einer Woche nicht mehr. Ich bitte Sie, das Gerät zu reparieren oder mir den Kaufpreis zu erstatten.",
    prompt: "Người viết muốn gì?",
    options: [
      "Sửa máy hoặc hoàn lại tiền",
      "Đổi sang một máy đắt hơn",
      "Kéo dài thời gian bảo hành",
      "Được giao hàng nhanh hơn",
    ],
    answer: 0,
    why: "„reparieren oder mir den Kaufpreis zu erstatten“ — sửa, hoặc hoàn lại số tiền đã mua.",
  },
  {
    code: "B1-V-01",
    kind: "mcq",
    level: "B1",
    skill: "reading",
    prompt: "„sich um eine Stelle bewerben“ nghĩa là gì?",
    options: ["nộp đơn xin một vị trí việc làm", "từ chối một công việc", "nghỉ việc", "thăng chức"],
    answer: 0,
    why: "„sich bewerben um…“ là nộp đơn ứng tuyển. „kündigen“ mới là nghỉ việc.",
  },
  {
    code: "B1-L-01",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Liebe Kolleginnen und Kollegen, die Besprechung am Freitag fällt aus. Wir treffen uns stattdessen am Montag um neun Uhr im großen Konferenzraum.",
    prompt: "Cuộc họp diễn ra khi nào và ở đâu?",
    options: [
      "Thứ Hai lúc 9 giờ, phòng họp lớn",
      "Thứ Sáu lúc 9 giờ, phòng họp lớn",
      "Thứ Hai lúc 9 giờ, phòng họp nhỏ",
      "Thứ Sáu, chưa rõ phòng",
    ],
    answer: 0,
    why: "„fällt aus“ là bị hủy; „stattdessen am Montag um neun Uhr im großen Konferenzraum“ — thay vào đó là thứ Hai, 9 giờ, phòng họp lớn.",
  },
  {
    code: "B1-L-02",
    kind: "mcq",
    level: "B1",
    skill: "listening",
    audioText:
      "Obwohl die Miete hoch ist, hat sich Familie Tran für die Wohnung entschieden, weil sie sehr zentral liegt.",
    prompt: "Vì sao gia đình Tran chọn căn hộ đó?",
    options: [
      "Vì vị trí rất trung tâm",
      "Vì tiền thuê rẻ",
      "Vì căn hộ rộng",
      "Vì gần trường học",
    ],
    answer: 0,
    why: "„weil sie sehr zentral liegt“ — vì nó nằm rất trung tâm. „Obwohl die Miete hoch ist“ là ý nhượng bộ: tiền thuê CAO chứ không rẻ.",
  },
];

/* ------------------------------------------------------------------ B2 */

const B2: McqItem[] = [
  {
    code: "B2-G-01",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "Er sagte, er ___ heute leider verhindert.",
    options: ["sei", "ist", "wäre gewesen", "war"],
    answer: 0,
    why: "Lời dẫn gián tiếp trong văn phong trang trọng dùng Konjunktiv I: „er sei“.",
  },
  {
    code: "B2-G-02",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "Er hat zwar wenig Erfahrung, ___ er lernt sehr schnell.",
    options: ["aber", "sondern", "weil", "damit"],
    answer: 0,
    why: "Cặp „zwar … aber“ diễn đạt ý nhượng bộ. „sondern“ chỉ dùng sau một phủ định.",
  },
  {
    code: "B2-V-01",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "Chọn động từ đi đúng: eine Entscheidung ___",
    options: ["treffen", "machen", "nehmen", "geben"],
    answer: 0,
    why: "Tiếng Đức nói „eine Entscheidung treffen“. „eine Entscheidung machen“ là lỗi dịch thẳng từ tiếng Anh „make a decision“.",
  },
  {
    code: "B2-R-01",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    passage:
      "Der Fachkräftemangel betrifft inzwischen nicht nur technische Berufe. Auch in der Pflege bleiben zahlreiche Stellen unbesetzt, obwohl die Zahl der Bewerbungen aus dem Ausland deutlich gestiegen ist. Kritiker führen dies vor allem auf langwierige Anerkennungsverfahren zurück.",
    prompt: "Theo đoạn văn, vì sao nhiều vị trí trong ngành chăm sóc vẫn trống?",
    options: [
      "Vì thủ tục công nhận bằng cấp kéo dài",
      "Vì không có ai nộp đơn từ nước ngoài",
      "Vì lương trong ngành quá thấp",
      "Vì ngành này không còn cần người",
    ],
    answer: 0,
    why: "„Kritiker führen dies … auf langwierige Anerkennungsverfahren zurück“ — quy nguyên nhân cho thủ tục công nhận kéo dài. Đoạn văn còn nói số đơn từ nước ngoài đã TĂNG.",
  },
  {
    code: "B2-R-02",
    kind: "mcq",
    level: "B2",
    skill: "reading",
    prompt: "„Das Projekt wurde aufgrund fehlender Mittel eingestellt.“ Câu này nghĩa là gì?",
    options: [
      "Dự án bị dừng vì thiếu kinh phí",
      "Dự án được cấp thêm kinh phí",
      "Dự án bị hoãn một tuần",
      "Dự án đã hoàn thành",
    ],
    answer: 0,
    why: "„einstellen“ ở đây là „dừng lại“; „aufgrund fehlender Mittel“ là „do thiếu phương tiện, kinh phí“.",
  },
  {
    code: "B2-L-01",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Ich sehe das etwas anders. Natürlich spart die neue Software Zeit, allerdings nur, wenn alle Mitarbeiter entsprechend geschult werden.",
    prompt: "Người nói có quan điểm thế nào?",
    options: [
      "Đồng ý một phần, nhưng kèm điều kiện phải đào tạo nhân viên",
      "Phản đối hoàn toàn phần mềm mới",
      "Đồng ý hoàn toàn, không có điều kiện gì",
      "Không quan tâm tới chủ đề",
    ],
    answer: 0,
    why: "„Ich sehe das etwas anders“ là nêu ý khác; „allerdings nur, wenn…“ đặt ra điều kiện. Đây là đồng ý có điều kiện, không phải phản đối hẳn.",
  },
  {
    code: "B2-L-02",
    kind: "mcq",
    level: "B2",
    skill: "listening",
    audioText:
      "Hätten wir früher reagiert, wäre der Schaden deutlich geringer ausgefallen.",
    prompt: "Câu này diễn đạt điều gì?",
    options: [
      "Một giả định trái với thực tế đã xảy ra",
      "Một kế hoạch cho tương lai",
      "Một mệnh lệnh",
      "Một câu hỏi",
    ],
    answer: 0,
    why: "„Hätten wir …, wäre …“ là Konjunktiv II ở quá khứ: giả định trái thực tế. Thực tế là họ đã KHÔNG phản ứng sớm.",
  },
];

/* -------------------------------------------------------- điền đáp án */

/**
 * Câu điền, xếp theo cấp. Đặt sau phần trắc nghiệm cùng cấp trong mỗi kỹ năng,
 * nên người học đã quen tay trước khi phải tự gõ.
 */
export const GAP_ITEMS: GapItem[] = [
  {
    code: "A1-F-01",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Ich ___ Mai und komme aus Vietnam.",
    hint: "động từ heißen, chia cho ngôi ich",
    accept: ["heiße", "heisse"],
    why: "Ngôi „ich“ thì „heißen“ thành „heiße“. Gõ „heisse“ cũng được chấp nhận vì bàn phím tiếng Việt không có ß.",
  },
  {
    code: "A1-F-02",
    kind: "gap",
    level: "A1",
    skill: "reading",
    prompt: "Wo ___ du? — In Berlin.",
    hint: "động từ wohnen, chia cho ngôi du",
    accept: ["wohnst"],
    why: "Ngôi „du“ lấy đuôi -st: „du wohnst“.",
  },
  {
    code: "A2-F-01",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Gestern ___ ich ins Kino gegangen.",
    hint: "trợ động từ cho thì Perfekt của „gehen“",
    accept: ["bin"],
    why: "„gehen“ là động từ chỉ sự di chuyển nên dùng „sein“: „ich bin gegangen“, không phải „habe“.",
  },
  {
    code: "A2-F-02",
    kind: "gap",
    level: "A2",
    skill: "reading",
    prompt: "Ich komme später, ___ ich noch arbeiten muss.",
    hint: "liên từ đẩy động từ xuống cuối câu",
    accept: ["weil", "da"],
    why: "„weil“ (hoặc „da“) đẩy động từ „muss“ xuống cuối mệnh đề, đúng như trong câu.",
  },
  {
    code: "B1-F-01",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Der Brief ___ gestern von der Sekretärin geschrieben.",
    hint: "bị động ở quá khứ",
    accept: ["wurde"],
    why: "Bị động quá khứ: „werden“ ở Präteritum („wurde“) + Partizip II. „war geschrieben“ là trạng thái, không phải hành động.",
  },
  {
    code: "B1-F-02",
    kind: "gap",
    level: "B1",
    skill: "reading",
    prompt: "Wenn ich mehr Zeit ___, würde ich einen Kurs besuchen.",
    hint: "Konjunktiv II của „haben“",
    accept: ["hätte", "haette"],
    why: "Câu điều kiện không có thật dùng Konjunktiv II: „wenn ich … hätte, würde ich …“.",
  },
  {
    code: "B2-F-01",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "___ des schlechten Wetters fand das Fest statt.",
    hint: "giới từ mang nghĩa „mặc dù“, đi với cách 2",
    accept: ["trotz"],
    why: "„trotz“ đi với Genitiv: „trotz des schlechten Wetters“ — mặc dù thời tiết xấu.",
  },
  {
    code: "B2-F-02",
    kind: "gap",
    level: "B2",
    skill: "reading",
    prompt: "Er tut so, als ___ er alles verstanden.",
    hint: "Konjunktiv II của „haben“, sau „als ob / als“",
    accept: ["hätte", "haette"],
    why: "Sau „als“ mang nghĩa giả vờ, tiếng Đức dùng Konjunktiv: „als hätte er alles verstanden“.",
  },
];

/* --------------------------------------------------------------- Viết */

export const WRITE_ITEMS: WriteItem[] = [
  {
    code: "A1-W-01",
    kind: "write",
    level: "A1",
    skill: "writing",
    prompt: "Viết vài câu tiếng Đức giới thiệu bản thân: tên, quê, nơi ở, nghề nghiệp.",
    hint: "Khoảng 3-4 câu là đủ. Ví dụ mở đầu: „Ich heiße …“",
    minWords: 12,
    expectPatterns: [
      { label: "giới thiệu tên", any: ["ich heiße", "mein name ist", "ich bin"] },
      { label: "nói nơi ở", any: ["ich wohne", "ich lebe"] },
      { label: "nói quê hoặc nghề", any: ["ich komme aus", "ich arbeite", "ich bin von beruf", "ich studiere"] },
    ],
  },
  {
    code: "A2-W-01",
    kind: "write",
    level: "A2",
    skill: "writing",
    prompt:
      "Viết một tin nhắn ngắn cho đồng nghiệp: hôm nay bạn bị ốm và không đi làm được, hẹn ngày mai quay lại.",
    hint: "Khoảng 4-5 câu. Nhớ dùng thì quá khứ hoặc lý do với „weil“.",
    minWords: 20,
    expectPatterns: [
      { label: "chào hỏi", any: ["hallo", "guten tag", "liebe", "lieber", "sehr geehrte"] },
      { label: "nói bị ốm", any: ["krank", "kopfschmerzen", "fieber", "erkältet"] },
      { label: "nêu lý do hoặc thì quá khứ", any: ["weil", "denn", "habe", "bin", "hatte", "war"] },
    ],
  },
  {
    code: "B1-W-01",
    kind: "write",
    level: "B1",
    skill: "writing",
    prompt:
      "Viết một email khiếu nại: bạn mua một món đồ và nó hỏng sau một tuần. Nêu vấn đề và đề xuất cách giải quyết.",
    hint: "Khoảng 6-8 câu, giọng trang trọng. Mở bằng „Sehr geehrte Damen und Herren,“.",
    minWords: 45,
    expectPatterns: [
      { label: "mở thư trang trọng", any: ["sehr geehrte", "sehr geehrter"] },
      { label: "mô tả vấn đề", any: ["funktioniert nicht", "kaputt", "defekt", "nicht mehr"] },
      { label: "đề xuất giải quyết", any: ["reparieren", "erstatten", "umtauschen", "zurückzahlen", "bitte ich"] },
      { label: "kết thư", any: ["mit freundlichen grüßen", "freundlichen grüßen"] },
    ],
  },
  {
    code: "B2-W-01",
    kind: "write",
    level: "B2",
    skill: "writing",
    prompt:
      "Nhiều người cho rằng học ngoại ngữ online hiệu quả hơn học ở lớp truyền thống. Bạn nghĩ sao? Nêu quan điểm và ít nhất hai lý do.",
    hint: "Khoảng 8-12 câu. Dùng từ nối lập luận và ít nhất một mệnh đề phụ.",
    minWords: 70,
    expectPatterns: [
      { label: "nêu quan điểm", any: ["meiner meinung nach", "ich bin der ansicht", "ich denke", "ich finde", "ich bin der meinung"] },
      { label: "từ nối lập luận", any: ["außerdem", "zudem", "einerseits", "andererseits", "allerdings", "jedoch", "dagegen"] },
      { label: "mệnh đề phụ", any: ["weil", "obwohl", "damit", "dass", "während"] },
      { label: "kết luận", any: ["zusammenfassend", "insgesamt", "abschließend", "deshalb", "daher"] },
    ],
  },
];

/* ---------------------------------------------------------------- Nói */

export const SPEAK_ITEMS: SpeakItem[] = [
  {
    code: "A1-S-01",
    kind: "speak",
    level: "A1",
    skill: "speaking",
    prompt: "Hãy tự giới thiệu bằng tiếng Đức trong khoảng 30 giây: tên, quê, nơi ở, vì sao học tiếng Đức.",
    hint: "Nói được câu nào hay câu đó. Ngập ngừng không sao — đây là để biết bạn đang ở đâu.",
  },
];

/** Toàn bộ câu trắc nghiệm, đã xếp theo cấp độ tăng dần. */
export const MCQ_ITEMS: McqItem[] = [
  ...A1,
  ...A1_MCQ,
  ...A1_LISTENING,
  ...A2,
  ...A2_MCQ,
  ...A2_LISTENING,
  ...B1,
  ...B1_MCQ,
  ...B1_LISTENING,
  ...B2,
  ...B2_MCQ,
  ...B2_LISTENING,
];

/** Câu chấm tự động được: trắc nghiệm và điền. Dùng chung một quy tắc chấm. */
export const AUTO_ITEMS: (McqItem | GapItem)[] = [
  ...MCQ_ITEMS,
  ...GAP_ITEMS,
  ...A1_GAP,
  ...A2_GAP,
  ...B1_GAP,
  ...B2_GAP,
];

/** Mọi đề Viết, gồm bộ gốc và bộ mở rộng. */
export const ALL_WRITE_ITEMS: WriteItem[] = [
  ...WRITE_ITEMS,
  ...A1_WRITE,
  ...A2_WRITE,
  ...B1_WRITE,
  ...B2_WRITE,
];

/** Mọi đề Nói, gồm bộ gốc và bộ mở rộng. */
export const ALL_SPEAK_ITEMS: SpeakItem[] = [
  ...SPEAK_ITEMS,
  ...A1_SPEAK,
  ...A2_SPEAK,
  ...B1_SPEAK,
  ...B2_SPEAK,
];

export const ALL_ITEMS: PlacementItem[] = [
  ...AUTO_ITEMS,
  ...ALL_WRITE_ITEMS,
  ...ALL_SPEAK_ITEMS,
];

/**
 * So khớp câu trả lời gõ tay.
 *
 * Chuẩn hóa trước khi so: bỏ hoa thường, bỏ dấu câu, và quy các ký tự riêng của
 * tiếng Đức về dạng gõ được trên bàn phím thường (ß→ss, ä→ae). Người học đang
 * học ngữ pháp, không phải đang thi gõ ký tự đặc biệt.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/\s+/g, " ");
}

export function gapIsCorrect(item: GapItem, value: string): boolean {
  const given = normalizeAnswer(value);
  return item.accept.some((a) => normalizeAnswer(a) === given);
}

/** Tra nhanh theo mã. */
export function itemByCode(code: string): PlacementItem | undefined {
  return ALL_ITEMS.find((i) => i.code === code);
}

export const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2"];
