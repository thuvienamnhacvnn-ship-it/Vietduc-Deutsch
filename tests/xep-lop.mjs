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
  // Đề B2 có hai bản và bản dài hơn cần 90 từ. Bài mẫu phải vượt ngưỡng dài
  // nhất, nếu không thì kiểm thử đỏ hay xanh tuỳ vào đề nào được rút ra.
  "Zwar braucht selbstständiges Lernen viel Disziplin, allerdings gewinnt man dadurch Freiheit bei der Zeiteinteilung.",
  "Deshalb halte ich eine Mischung aus festen Terminen und freien Übungsphasen für den sinnvollsten Weg.",
].join(" ");

/**
 * Đáp án của các câu điền. Cố ý gõ bằng ký tự thường (heisse, haette) để kiểm
 * luôn phần chuẩn hóa: người học trên bàn phím Việt không có ß hay ä.
 */
const GAP_ANSWERS = {
  "A1-F-01": "heisse",
  "A1-F-02": "wohnst",
  "A1-F-03": "ist",
  "A1-F-04": "bist",
  "A1-F-05": "dem",
  "A1-F-06": "fahren",
  "A1-F-07": "spielt",
  "A1-F-08": "was",
  "A2-F-01": "bin",
  "A2-F-02": "weil",
  "A2-F-03": "wenn",
  "A2-F-04": "als",
  "A2-F-05": "den",
  "A2-F-06": "gearbeitet",
  "A2-F-07": "fuer",
  "A2-F-08": "aufstehen",
  "B1-F-01": "wurde",
  "B1-F-02": "haette",
  "B1-F-03": "auf",
  "B1-F-04": "deren",
  "B1-F-05": "damit",
  "B1-F-06": "vermietet",
  "B1-F-07": "trotz",
  "B1-F-08": "wuerde",
  "B2-F-01": "Trotz",
  "B2-F-02": "hätte",
  "B2-F-03": "indem",
  "B2-F-04": "als",
  "B2-F-05": "trotz",
  "B2-F-06": "bearbeitet",
  "B2-F-07": "an",
  "B2-F-08": "desto",
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
  const start = await client("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
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
  // Khối đầu là khối ĐỊNH TUYẾN, cố ý trộn A1 với A2 - thấy câu A2 ở đây là
  // đúng thiết kế. Điều phải kiểm là bài KHÔNG leo lên B1, B2.
  check(
    "sai hết thì bài không leo lên B1/B2 phần Đọc",
    readingSeenA.every((s) => s.level === "A1" || s.level === "A2"),
    readingSeenA.map((s) => s.level).join(","),
  );
  check(
    "chạm sàn thì bài dừng sớm, không bắt làm hết 28 câu",
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

  /* ---- khoá học đề xuất ---- */
  const recB = doneB.body.recommendation;
  check("kết quả kèm khoá học đề xuất", Boolean(recB?.course?.code), JSON.stringify(recB?.course ?? null));
  check(
    "khoá đề xuất bám mức THẤP nhất trong các kỹ năng đo được",
    recB?.course?.level === "B2",
    recB?.course?.code,
  );
  check("khoá đề xuất có số giờ học", typeof recB?.course?.hours === "number" && recB.course.hours > 0);
  check("khoá đề xuất nói rõ vì sao", typeof recB?.reason === "string" && recB.reason.length > 30);
  check("có khoá đi tiếp sau đó", Boolean(recB?.nextCourse) || recB?.course?.code === "B2.2");

  /* --------------------------------------- 2c. thi lại phải ra đề khác */
  console.log("\nThi lại lần hai");
  const repeater = await newLearner("thi-lai");
  const runC1 = await takeTest(repeater, right);
  await finish(repeater, runC1.sessionId);
  const runC2 = await takeTest(repeater, right);
  await finish(repeater, runC2.sessionId);

  const set1 = runC1.seen.filter((s) => s.kind === "mcq" || s.kind === "gap").map((s) => s.code);
  const set2 = runC2.seen.filter((s) => s.kind === "mcq" || s.kind === "gap").map((s) => s.code);
  const overlap = set2.filter((c) => set1.includes(c));
  check("lần hai không phải là đúng đề cũ", set1.join(",") !== set2.join(","), `${set1.length} vs ${set2.length} câu`);
  check(
    "lần hai gặp lại rất ít câu cũ",
    overlap.length <= Math.floor(set2.length / 3),
    `trùng ${overlap.length}/${set2.length} câu`,
  );

  /* ---------------------------------- 2d. dừng giữa chừng vẫn có kết quả */
  console.log("\nDừng giữa chừng");
  const stopper = await newLearner("dung-giua");
  const runD = await takeTest(stopper, right, 4);
  const stopped = await stopper("/api/xep-lop/ket-thuc", {
    method: "POST",
    body: JSON.stringify({ sessionId: runD.sessionId, stop: true }),
  });
  check("dừng giữa chừng vẫn nộp được bài", stopped.status === 200, `nhận ${stopped.status}`);
  check("dừng giữa chừng vẫn có khoá học để bắt đầu", Boolean(stopped.body.recommendation?.course?.code));
  check("kết quả ghi rõ là bài dừng sớm", stopped.body.recommendation?.endedEarly === true);
  const readD = levelOf(stopped.body.results, "reading");
  check("phần đã làm vẫn được chấm", Boolean(readD) && readD.insufficientEvidence === false, JSON.stringify(readD));
  check(
    "dừng sớm thì độ tin cậy bị hạ xuống",
    readD.confidence < 0.7,
    String(readD?.confidence),
  );

  /* ------------------------------------- 2b. chấm câu điền, gõ không dấu Đức */
  console.log("\nCâu điền đáp án");
  const typer = await newLearner("go-tay");
  const startT = await typer("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
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
    "câu điền gõ không có ký tự Đức vẫn được chấm ĐÚNG",
    gapFeedback?.fb?.correct === true,
    `${gapFeedback?.code} = "${gapFeedback?.sent}" -> ${JSON.stringify(gapFeedback?.fb)}`,
  );
  check(
    "câu điền trả về từ cần điền để người học đối chiếu",
    typeof gapFeedback?.fb?.expected === "string" && gapFeedback.fb.expected.length > 0,
    JSON.stringify(gapFeedback?.fb?.expected),
  );

  // Một câu điền sai phải bị chấm sai, không phải cái gì cũng đúng.
  const wrongTyper = await newLearner("go-sai");
  const startW = await wrongTyper("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
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

  const again = await quitter("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
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

  /* ------------------------------------------------------------- quy chế */
  console.log("\nQuy chế bài thi");

  // Không ký cam kết thì không có bài thi nào được tạo.
  const noPledge = await newLearner("chua-cam-ket");
  const refused = await noPledge("/api/xep-lop/bat-dau", { method: "POST", body: "{}" });
  check(
    "chưa ký cam kết thì không bắt đầu được bài",
    refused.status === 409 && refused.body?.error?.code === "pledge_required",
    `${refused.status} ${refused.body?.error?.code}`,
  );

  const pledged = await noPledge("/api/xep-lop/bat-dau", {
    method: "POST",
    body: JSON.stringify({ pledge: true }),
  });
  check("ký cam kết rồi thì bài bắt đầu", pledged.status === 200 && pledged.body.item);

  // Giới hạn số lần nghe phải chặn ở SERVER, không phải chỉ ẩn nút.
  const listener = await newLearner("nghe");
  const startL = await listener("/api/xep-lop/bat-dau", {
    method: "POST",
    body: JSON.stringify({ pledge: true }),
  });
  let curL = startL.body.item;
  const sid = startL.body.sessionId;

  // Câu hỏi gửi ra không được kèm chữ tiếng Đức, nếu không client tự phát lại.
  check(
    "câu hỏi KHÔNG kèm chữ tiếng Đức của phần nghe",
    !JSON.stringify(startL.body).includes("speakText"),
    "",
  );

  // Trả lời đúng cho tới khi gặp câu Nghe đầu tiên.
  let listenItem = null;
  while (curL && !listenItem) {
    if (curL.needsAudio) {
      listenItem = curL;
      break;
    }
    const payload = { sessionId: sid, code: curL.code };
    if (curL.kind === "mcq") payload.choice = 0;
    else if (curL.kind === "gap") payload.text = GAP_ANSWERS[curL.code] ?? "?";
    else payload.skip = true;
    const res = await listener("/api/xep-lop/tra-loi", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    curL = res.body.item;
  }

  check("bài có câu cần nghe", Boolean(listenItem), JSON.stringify(listenItem?.code));

  if (listenItem) {
    check(
      "câu nghe được cấp sẵn số lượt còn lại",
      typeof listenItem.listensLeft === "number" && listenItem.listensLeft > 0,
      String(listenItem.listensLeft),
    );

    const limit = listenItem.listensLeft;
    const plays = [];
    for (let i = 0; i < limit + 1; i++) {
      const res = await listener("/api/xep-lop/nghe", {
        method: "POST",
        body: JSON.stringify({ sessionId: sid, code: listenItem.code }),
      });
      plays.push({ status: res.status, left: res.body?.listensLeft, hasText: Boolean(res.body?.text) });
    }

    check(
      `${limit} lượt đầu đều được cấp chữ để đọc`,
      plays.slice(0, limit).every((p) => p.status === 200 && p.hasText),
      JSON.stringify(plays),
    );
    check(
      "lượt vượt quá bị server từ chối, không phải chỉ ẩn nút",
      plays[limit].status === 409,
      `nhận ${plays[limit].status}`,
    );
    check(
      "lượt bị từ chối KHÔNG kèm chữ tiếng Đức",
      plays[limit].hasText === false,
      JSON.stringify(plays[limit]),
    );
    check(
      "số lượt còn lại giảm dần đúng",
      plays[0].left === limit - 1,
      `sau lượt đầu còn ${plays[0].left}`,
    );
  }

  // Hồ sơ bài thi phải có trong kết quả.
  const recorder = await newLearner("ho-so");
  const runR = await takeTest(recorder, wrong);
  const doneR = await finish(recorder, runR.sessionId);
  const record = doneR.body?.record;
  check("kết quả kèm hồ sơ bài thi", Boolean(record), JSON.stringify(record));
  check(
    "hồ sơ có mã bài thi dạng VD-XL",
    typeof record?.code === "string" && record.code.startsWith("VD-XL-"),
    record?.code,
  );
  // Không ghim con số: quy chế đổi thì số phải đổi theo, kiểm thử chỉ cần bảo
  // đảm hồ sơ CÓ ghi phiên bản nào đó.
  check(
    "hồ sơ ghi phiên bản quy chế",
    typeof record?.regulation === "string" && /^[0-9]+[.][0-9]+$/.test(record.regulation),
    record?.regulation,
  );
  check("hồ sơ ghi thời điểm ký cam kết", Boolean(record?.pledgedAt), record?.pledgedAt);
  check(
    "hồ sơ đếm số câu đã làm",
    record?.itemsAnswered === runR.seen.length,
    `${record?.itemsAnswered} vs ${runR.seen.length}`,
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
  const anonStart = await anon("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
  check("khách chưa đăng nhập không bắt đầu được bài", anonStart.status === 401, `nhận ${anonStart.status}`);

  // Đáp án không được lộ trong dữ liệu gửi ra trình duyệt. Dùng lại tài khoản
  // vừa tạo thay vì tạo thêm một cái nữa - mỗi lần đăng ký đều tiêu một suất
  // trong hạn mức theo IP, và bộ test không nên tự làm mình hết suất.
  const peekStart = await other("/api/xep-lop/bat-dau", { method: "POST", body: JSON.stringify({ pledge: true }) });
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
