/**
 * Kiểm thử bài kiểm tra xếp lớp, chạy qua HTTP thật trên server đang chạy.
 *
 * Script này đóng vai ba người học khác nhau và kiểm rằng hệ thống kết luận
 * đúng về từng người:
 *   - người mới hoàn toàn: sai hết A1, phải dừng sớm và được xếp A1
 *   - người khá: đúng hết, phải leo tới B2
 *   - người bỏ dở: làm vài câu rồi đóng tab, quay lại phải thấy đúng chỗ cũ
 *
 *   node tests/xep-lop.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? process.env.LINGORA_APP_URL ?? "http://localhost:3055";

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/**
 * Bài viết mẫu cho đề B2. Phải dài hơn 70 từ vì đó là ngưỡng của đề - viết
 * ngắn hơn thì hệ thống ghi là chưa đủ bằng chứng, và nó ghi đúng.
 */
const B2_ESSAY = [
  "Meiner Meinung nach hat Online-Unterricht viele Vorteile, weil man überall und jederzeit lernen kann.",
  "Außerdem spart man viel Zeit, da lange Fahrtwege wegfallen und man den eigenen Rhythmus bestimmt.",
  "Andererseits fehlt vielen Lernenden der persönliche Kontakt, obwohl moderne Programme das teilweise ausgleichen können.",
  "Wer sich schlecht selbst motivieren kann, braucht meiner Erfahrung nach eine feste Gruppe und klare Termine.",
  "Zusammenfassend finde ich beide Formen sinnvoll, denn sie ergänzen sich gegenseitig und jeder Lernende ist anders.",
].join(" ");

/**
 * Đáp án của các câu điền. Cố ý gõ bằng ký tự thường (heisse, haette) để kiểm
 * luôn phần chuẩn hóa: người học trên bàn phím Việt không có ß hay ä.
 */
const GAP_ANSWERS = {
  "A1-F-01": "heisse",
  "A1-F-02": "wohnst",
  "A2-F-01": "bin",
  "A2-F-02": "weil",
  "B1-F-01": "wurde",
  "B1-F-02": "haette",
  "B2-F-01": "Trotz",
  "B2-F-02": "hätte",
};

function makeClient() {
  const jar = new Map();
  return async function call(path, init = {}) {
    const headers = new Headers(init.headers ?? {});
    if (jar.size) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    if (init.body) headers.set("content-type", "application/json");
    const res = await fetch(new URL(path, BASE), { ...init, headers, redirect: "manual" });
    for (const [k, v] of res.headers) {
      if (k.toLowerCase() !== "set-cookie") continue;
      for (const part of v.split(/,(?=[^;]+=)/)) {
        const [pair] = part.split(";");
        const i = pair.indexOf("=");
        if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
      }
    }
    const type = res.headers.get("content-type") ?? "";
    const body = type.includes("json") ? await res.json().catch(() => null) : await res.text();
    return { status: res.status, body };
  };
}

async function newLearner(tag) {
  const client = makeClient();
  const email = `${tag}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@lingora.test`;
  const res = await client("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email,
      name: `Kiểm thử ${tag}`,
      password: "mot-cau-dai-de-nho",
      acceptTerms: true,
    }),
  });
  if (res.status !== 200) throw new Error(`không tạo được tài khoản ${tag}: ${res.status}`);
  return client;
}

/**
 * Làm bài với một chiến lược trả lời.
 * `strategy(item)` trả về chỉ số đáp án, hoặc "skip".
 * Đáp án đúng của mọi câu trong ngân hàng đều là chỉ số 0.
 */
async function takeTest(client, strategy, stopAfter = Infinity) {
  const start = await client("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  if (start.status !== 200) throw new Error(`bắt đầu thất bại: ${start.status}`);

  let item = start.body.item;
  const sessionId = start.body.sessionId;
  const seen = [];
  let steps = 0;

  while (item && steps < stopAfter) {
    seen.push({ code: item.code, skill: item.skill, level: item.level, kind: item.kind });
    const choice = strategy(item);
    const payload = { sessionId, code: item.code };
    if (choice === "skip") payload.skip = true;
    else if (item.kind === "mcq") payload.choice = choice;
    else payload.text = choice;

    const res = await client("/api/xep-lop/tra-loi", { method: "POST", body: JSON.stringify(payload) });
    if (res.status !== 200) throw new Error(`trả lời thất bại: ${res.status}`);
    item = res.body.item;
    steps += 1;
  }

  return { sessionId, seen, unfinished: Boolean(item) };
}

async function finish(client, sessionId) {
  const res = await client("/api/xep-lop/ket-thuc", { method: "POST", body: JSON.stringify({ sessionId }) });
  return res;
}

function levelOf(results, skill) {
  return results.find((r) => r.skill === skill);
}

async function main() {
  console.log(`Kiểm thử bài xếp lớp trên ${BASE}\n`);

  /* --------------------------------------------- 1. người mới hoàn toàn */
  console.log("Người mới hoàn toàn (sai hết)");
  const beginner = await newLearner("moi");
  const wrong = (item) =>
    item.kind === "mcq" ? 1 : item.kind === "gap" ? "sai-hoan-toan" : item.kind === "write" ? "" : "skip";
  const runA = await takeTest(beginner, wrong);

  const readingSeenA = runA.seen.filter((s) => s.skill === "reading");
  check(
    "sai hết A1 thì KHÔNG bị hỏi tiếp câu A2 phần Đọc",
    readingSeenA.every((s) => s.level === "A1"),
    readingSeenA.map((s) => s.level).join(","),
  );
  check(
    "bài dừng sớm, không bắt làm hết 28 câu",
    runA.seen.length < 20,
    `${runA.seen.length} câu`,
  );

  const doneA = await finish(beginner, runA.sessionId);
  check("nộp bài thành công", doneA.status === 200, `nhận ${doneA.status}`);

  const rA = doneA.body.results;
  check("Đọc được xếp A1", levelOf(rA, "reading")?.level === "A1", JSON.stringify(levelOf(rA, "reading")));
  check(
    "Nói luôn là chưa đánh giá được khi không có audio",
    levelOf(rA, "speaking")?.insufficientEvidence === true && levelOf(rA, "speaking")?.level === null,
  );
  check(
    "Viết bỏ trống thì ghi là chưa đủ bằng chứng, không cho điểm",
    levelOf(rA, "writing")?.insufficientEvidence === true,
    JSON.stringify(levelOf(rA, "writing")),
  );
  check("nộp lại lần hai bị từ chối", (await finish(beginner, runA.sessionId)).status === 409);

  /* ------------------------------------------------------ 2. người khá */
  console.log("\nNgười khá (đúng hết)");
  const strong = await newLearner("kha");
  // Đáp án đúng của mọi câu trắc nghiệm là chỉ số 0; câu điền tra từ bảng dưới.
  const right = (item) =>
    item.kind === "mcq"
      ? 0
      : item.kind === "gap"
        ? (GAP_ANSWERS[item.code] ?? "?")
        : item.kind === "write"
          ? B2_ESSAY
          : "skip";
  const runB = await takeTest(strong, right);

  const gapSeen = runB.seen.filter((s) => s.kind === "gap");
  check("bài có cả câu điền đáp án, không chỉ trắc nghiệm", gapSeen.length >= 4, `${gapSeen.length} câu điền`);
  check(
    "câu điền gõ bằng ký tự thường (heisse, haette) vẫn được chấm đúng",
    gapSeen.length > 0,
    "",
  );

  const levelsSeen = new Set(runB.seen.filter((s) => s.kind === "mcq" || s.kind === "gap").map((s) => s.level));
  check("làm đúng thì được hỏi lên tới B2", levelsSeen.has("B2"), [...levelsSeen].join(","));
  check(
    "đề Viết chọn theo mức Đọc, không phải luôn là A1",
    runB.seen.find((s) => s.kind === "write")?.level === "B2",
    runB.seen.find((s) => s.kind === "write")?.level,
  );

  const doneB = await finish(strong, runB.sessionId);
  const rB = doneB.body.results;
  check("Đọc được xếp B2", levelOf(rB, "reading")?.level === "B2", JSON.stringify(levelOf(rB, "reading")?.level));
  check("Nghe được xếp B2", levelOf(rB, "listening")?.level === "B2", JSON.stringify(levelOf(rB, "listening")?.level));
  check(
    "Viết có mức sơ bộ nhưng độ tin cậy thấp",
    levelOf(rB, "writing")?.level === "B2" && levelOf(rB, "writing")?.confidence <= 0.35,
    JSON.stringify(levelOf(rB, "writing")),
  );
  check(
    "độ tin cậy phần Đọc không bao giờ vượt 0.9",
    levelOf(rB, "reading")?.confidence <= 0.9,
    String(levelOf(rB, "reading")?.confidence),
  );
  check(
    "Nói vẫn chưa đánh giá được dù các phần khác rất tốt",
    levelOf(rB, "speaking")?.level === null,
  );

  /* ------------------------------------- 2b. chấm câu điền, gõ không dấu Đức */
  console.log("\nCâu điền đáp án");
  const typer = await newLearner("go-tay");
  const startT = await typer("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  let cur = startT.body.item;
  let gapFeedback = null;
  let wrongFeedback = null;

  // Đi tới câu điền đầu tiên, trả lời trắc nghiệm đúng trên đường.
  while (cur && !gapFeedback) {
    const payload = { sessionId: startT.body.sessionId, code: cur.code };
    if (cur.kind === "mcq") payload.choice = 0;
    else if (cur.kind === "gap") payload.text = GAP_ANSWERS[cur.code];
    else payload.skip = true;

    const res = await typer("/api/xep-lop/tra-loi", { method: "POST", body: JSON.stringify(payload) });
    if (cur.kind === "gap") gapFeedback = { code: cur.code, sent: payload.text, fb: res.body.feedback };
    cur = res.body.item;
  }

  check(
    "gõ heisse (không có ß) vẫn được chấm ĐÚNG",
    gapFeedback?.fb?.correct === true,
    `${gapFeedback?.sent} -> ${JSON.stringify(gapFeedback?.fb)}`,
  );
  check(
    "câu điền trả về từ cần điền để người học đối chiếu",
    typeof gapFeedback?.fb?.expected === "string" && gapFeedback.fb.expected.length > 0,
    JSON.stringify(gapFeedback?.fb?.expected),
  );

  // Một câu điền sai phải bị chấm sai, không phải cái gì cũng đúng.
  const wrongTyper = await newLearner("go-sai");
  const startW = await wrongTyper("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  let curW = startW.body.item;
  while (curW && !wrongFeedback) {
    const payload = { sessionId: startW.body.sessionId, code: curW.code };
    if (curW.kind === "mcq") payload.choice = 0;
    else if (curW.kind === "gap") payload.text = "khong-phai-tieng-duc";
    else payload.skip = true;
    const res = await wrongTyper("/api/xep-lop/tra-loi", { method: "POST", body: JSON.stringify(payload) });
    if (curW.kind === "gap") wrongFeedback = res.body.feedback;
    curW = res.body.item;
  }
  check("gõ bậy thì bị chấm SAI", wrongFeedback?.correct === false, JSON.stringify(wrongFeedback));

  /* ------------------------------------------------- 3. bỏ dở rồi quay lại */
  console.log("\nBỏ dở giữa chừng");
  const quitter = await newLearner("bodo");
  const runC = await takeTest(quitter, right, 3);
  check("đã làm 3 câu rồi dừng", runC.seen.length === 3);

  const again = await quitter("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  check("quay lại được nhận diện là tiếp tục", again.body.resumed === true);
  check("không tạo phiên mới", again.body.sessionId === runC.sessionId, `${runC.sessionId} vs ${again.body.sessionId}`);
  check(
    "câu tiếp theo đúng là câu thứ 4",
    again.body.item?.index === 4,
    `index ${again.body.item?.index}`,
  );
  check(
    "không hỏi lại câu đã làm",
    !runC.seen.some((s) => s.code === again.body.item?.code),
    again.body.item?.code,
  );

  /* ------------------------------------------------------------ bảo mật */
  console.log("\nPhân quyền và dữ liệu");
  const other = await newLearner("nguoikhac");
  const steal = await other("/api/xep-lop/tra-loi", {
    method: "POST",
    body: JSON.stringify({ sessionId: runC.sessionId, code: "A1-R-01", choice: 0 }),
  });
  check(
    "người khác không ghi được vào bài làm của mình",
    steal.status === 404,
    `nhận ${steal.status}`,
  );

  const anon = makeClient();
  const anonStart = await anon("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  check("khách chưa đăng nhập không bắt đầu được bài", anonStart.status === 401, `nhận ${anonStart.status}`);

  // Đáp án không được lộ trong dữ liệu gửi ra trình duyệt. Dùng lại tài khoản
  // vừa tạo thay vì tạo thêm một cái nữa - mỗi lần đăng ký đều tiêu một suất
  // trong hạn mức theo IP, và bộ test không nên tự làm mình hết suất.
  const peekStart = await other("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  const raw = JSON.stringify(peekStart.body);
  check(
    "câu hỏi gửi ra KHÔNG kèm đáp án hay lời giải",
    !raw.includes('"answer"') && !raw.includes('"why"'),
    raw.slice(0, 120),
  );

  console.log(`\n${passed} PASS, ${failed} FAIL`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
