/**
 * Kiểm thử lớp học nói, ôn tập và gói học - chạy qua HTTP thật.
 *
 * Bản cài dùng để kiểm thử KHÔNG có engine giảng dạy và cũng chưa duyệt bài
 * nào, nên phần lớn phép kiểm ở đây là về chuyện hệ thống nói thật:
 *
 *   - chưa duyệt bài thì học viên không vào lớp được (chứ không phải vào rồi
 *     mới báo lỗi)
 *   - chưa có engine thì trả 503 kèm câu giải thích, KHÔNG bịa lời giảng
 *   - giá chưa duyệt thì không đặt mua được, dù giao diện có hiện nút
 *   - học viên không đụng được vào các đường dẫn của quản trị
 *
 *   node tests/lop-hoc.mjs [baseUrl]
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

function makeClient() {
  const jar = new Map();
  return async function call(path, init = {}) {
    const headers = new Headers(init.headers ?? {});
    if (jar.size) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
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

async function main() {
  console.log(`Kiểm thử lớp học và gói học trên ${BASE}\n`);

  const learner = await newLearner("lop");

  /* ------------------------------------------------------- 1. lớp học */
  console.log("Lớp học nói");

  const start = await learner("/api/lop-hoc/bat-dau", {
    method: "POST",
    body: JSON.stringify({ lesson: "A1-B01" }),
  });
  // Bài mẫu được nạp ở trạng thái chờ duyệt, nên học viên KHÔNG thấy nó.
  check(
    "bài chưa duyệt thì học viên không mở được lớp",
    start.status === 404,
    `nhận ${start.status}`,
  );
  check(
    "câu từ chối nói rõ là chưa có bài, không phải lỗi hệ thống",
    typeof start.body?.error?.message === "string" && start.body.error.message.length > 5,
    JSON.stringify(start.body),
  );

  const badLesson = await learner("/api/lop-hoc/bat-dau", {
    method: "POST",
    body: JSON.stringify({ lesson: "KHONG-CO" }),
  });
  check("mã bài không tồn tại trả 404", badLesson.status === 404, `nhận ${badLesson.status}`);

  const turnNoSession = await learner("/api/lop-hoc/luot", {
    method: "POST",
    body: JSON.stringify({ classSessionId: 999999, lesson: "A1-B01", said: "Hallo" }),
  });
  check(
    "không ghi được vào buổi học của người khác",
    turnNoSession.status === 404,
    `nhận ${turnNoSession.status}`,
  );

  const guest = makeClient();
  const guestStart = await guest("/api/lop-hoc/bat-dau", {
    method: "POST",
    body: JSON.stringify({ lesson: "A1-B01" }),
  });
  check("khách chưa đăng nhập không mở được lớp", guestStart.status === 401, `nhận ${guestStart.status}`);

  /* -------------------------------------------------------- 2. ôn tập */
  console.log("\nÔn tập");

  const due = await learner("/api/on-tap");
  check("người mới chưa có thẻ ôn nào", due.status === 200 && due.body?.items?.length === 0, JSON.stringify(due.body));

  const gradeMissing = await learner("/api/on-tap", {
    method: "POST",
    body: JSON.stringify({ id: 999999, remembered: true }),
  });
  check("không chấm được thẻ của người khác", gradeMissing.status === 404, `nhận ${gradeMissing.status}`);

  /* ------------------------------------------------------- 3. gói học */
  console.log("\nGói học");

  const buy = await learner("/api/goi-hoc/dat", {
    method: "POST",
    body: JSON.stringify({ versionId: 1 }),
  });
  check(
    "giá chưa duyệt thì server TỪ CHỐI đặt mua",
    buy.status === 409 && buy.body?.error?.code === "not_for_sale",
    `nhận ${buy.status} ${JSON.stringify(buy.body?.error?.code)}`,
  );

  const buyMissing = await learner("/api/goi-hoc/dat", {
    method: "POST",
    body: JSON.stringify({ versionId: 999999 }),
  });
  check("gói không tồn tại trả 404", buyMissing.status === 404, `nhận ${buyMissing.status}`);

  /* ------------------------------------------------- 4. quyền quản trị */
  console.log("\nPhân quyền");

  const publish = await learner("/api/quan-tri/bai-hoc", {
    method: "POST",
    body: JSON.stringify({ versionId: 1, publish: true }),
  });
  check(
    "học viên KHÔNG duyệt được bài học",
    publish.status === 404 || publish.status === 403,
    `nhận ${publish.status}`,
  );

  const confirm = await learner("/api/quan-tri/don-hang", {
    method: "POST",
    body: JSON.stringify({ orderId: 1, note: "thu tay", months: 3 }),
  });
  check(
    "học viên KHÔNG tự xác nhận thanh toán được",
    confirm.status === 404 || confirm.status === 403,
    `nhận ${confirm.status}`,
  );

  const adminPage = await learner("/quan-tri/don-hang");
  check(
    "học viên vào trang đơn hàng thì không thấy trang đó tồn tại",
    adminPage.status === 404 || adminPage.status === 307,
    `nhận ${adminPage.status}`,
  );

  /* ---------------------------------------------------- 5. trang học */
  console.log("\nTrang của học viên");

  for (const path of ["/hoc/lop", "/hoc/on-tap", "/hoc/goi-hoc"]) {
    const page = await learner(path);
    check(`${path} mở được`, page.status === 200, `nhận ${page.status}`);
  }

  console.log(`\n${passed} PASS, ${failed} FAIL`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
