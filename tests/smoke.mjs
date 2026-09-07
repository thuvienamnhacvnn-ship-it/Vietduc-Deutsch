/**
 * Kiểm thử end-to-end trên server đang chạy.
 *
 * Không mô phỏng gì cả: script gọi HTTP thật vào ứng dụng, tự đăng ký một tài
 * khoản mới, đăng nhập, sửa hồ sơ, rồi thử đọc dữ liệu bằng phiên của người
 * khác để chứng minh phân quyền chặn ở SERVER chứ không chỉ ẩn nút trên giao
 * diện (yêu cầu AUTH trong ACCEPTANCE.md).
 *
 *   node tests/smoke.mjs [baseUrl]
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

/** fetch giữ cookie thủ công: mỗi "người dùng" trong test là một jar riêng. */
function makeClient() {
  const jar = new Map();

  return async function call(path, init = {}) {
    const headers = new Headers(init.headers ?? {});
    if (jar.size > 0) {
      headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    }
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const response = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });

    for (const [key, value] of response.headers) {
      if (key.toLowerCase() !== "set-cookie") continue;
      for (const part of value.split(/,(?=[^;]+=)/)) {
        const [pair] = part.split(";");
        const idx = pair.indexOf("=");
        if (idx > 0) jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
      }
    }

    let body = null;
    const type = response.headers.get("content-type") ?? "";
    if (type.includes("application/json")) body = await response.json().catch(() => null);
    else body = await response.text().catch(() => "");

    return { status: response.status, body, headers: response.headers };
  };
}

const PUBLIC_PAGES = [
  "/",
  "/chuong-trinh",
  "/lop-hoc-ai",
  "/giao-vien-ai",
  "/hoc-phi",
  "/cau-hoi",
  "/dieu-khoan",
  "/rieng-tu",
  "/dang-ky",
  "/dang-nhap",
  "/quen-mat-khau",
  "/dat-lai-mat-khau",
  "/xac-minh",
];

async function main() {
  console.log(`Kiểm thử ${BASE}\n`);

  /* ------------------------------------------------------- trang công khai */
  console.log("Trang công khai");
  const anon = makeClient();
  for (const path of PUBLIC_PAGES) {
    const res = await anon(path);
    check(`GET ${path} trả 200`, res.status === 200, `nhận ${res.status}`);
  }

  const health = await anon("/api/suc-khoe");
  check("GET /api/suc-khoe báo database ok", health.body?.db === "ok", JSON.stringify(health.body));

  /* ------------------------------------------------------------ đăng ký */
  console.log("\nĐăng ký và phiên");
  const alice = makeClient();
  const stamp = Date.now();
  const aliceEmail = `alice.${stamp}@lingora.test`;
  const alicePass = "mot-cau-dai-de-nho";

  const badPw = await alice("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: `short.${stamp}@lingora.test`,
      name: "Ngắn",
      password: "123",
      acceptTerms: true,
    }),
  });
  check("mật khẩu quá ngắn bị từ chối", badPw.status === 400, `nhận ${badPw.status}`);

  const noTerms = await alice("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: `noterms.${stamp}@lingora.test`,
      name: "Không đồng ý",
      password: alicePass,
      acceptTerms: false,
    }),
  });
  check("không đồng ý điều khoản thì bị từ chối", noTerms.status === 400, `nhận ${noTerms.status}`);

  const reg = await alice("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: aliceEmail,
      name: "Alice Kiểm Thử",
      password: alicePass,
      acceptTerms: true,
      marketingContact: false,
    }),
  });
  check("đăng ký thành công", reg.status === 200 && reg.body?.ok === true, JSON.stringify(reg.body));

  const dup = await anon("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: aliceEmail,
      name: "Trùng",
      password: alicePass,
      acceptTerms: true,
    }),
  });
  check("email trùng bị từ chối", dup.status === 409, `nhận ${dup.status}`);

  /* -------------------------------------------------------------- hồ sơ */
  console.log("\nHồ sơ và ownership");
  const profile = await alice("/api/ho-so");
  check("chủ tài khoản đọc được hồ sơ của mình", profile.status === 200 && profile.body?.profile);

  const aliceProfileId = profile.body?.profile?.id;

  const patched = await alice("/api/ho-so", {
    method: "PATCH",
    body: JSON.stringify({ goal: "ausbildung", hoursPerWeek: 6, correctionStyle: "immediate" }),
  });
  check(
    "sửa hồ sơ được lưu",
    patched.status === 200 && patched.body?.profile?.goal === "ausbildung",
    JSON.stringify(patched.body?.error ?? patched.body?.profile?.goal),
  );

  const badPatch = await alice("/api/ho-so", {
    method: "PATCH",
    body: JSON.stringify({ hoursPerWeek: 500 }),
  });
  check("giá trị ngoài khoảng bị từ chối", badPatch.status === 400, `nhận ${badPatch.status}`);

  const anonProfile = await anon("/api/ho-so");
  check("khách chưa đăng nhập không đọc được hồ sơ", anonProfile.status === 401, `nhận ${anonProfile.status}`);

  // Bob là một tài khoản khác. Hồ sơ Bob đọc được phải là của chính Bob.
  const bob = makeClient();
  const bobEmail = `bob.${stamp}@lingora.test`;
  await bob("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: bobEmail,
      name: "Bob Kiểm Thử",
      password: alicePass,
      acceptTerms: true,
    }),
  });
  const bobProfile = await bob("/api/ho-so");
  check(
    "Bob không đọc được hồ sơ của Alice",
    bobProfile.status === 200 && bobProfile.body?.profile?.id !== aliceProfileId,
    `alice#${aliceProfileId} vs bob#${bobProfile.body?.profile?.id}`,
  );
  check(
    "hồ sơ Bob không mang dữ liệu Alice",
    bobProfile.body?.profile?.goal !== "ausbildung",
    `goal=${bobProfile.body?.profile?.goal}`,
  );

  /* ---------------------------------------------------------- tiến độ */
  console.log("\nTiến độ");
  const progress = await alice("/api/tien-do");
  check("tiến độ trả đủ bốn kỹ năng", progress.body?.skills?.length === 4);
  check(
    "chưa kiểm tra thì cả bốn kỹ năng đều là chưa đánh giá",
    progress.body?.skills?.every((s) => s.unknown === true),
    JSON.stringify(progress.body?.skills),
  );
  check("chưa mua thì không có quyền học", progress.body?.hasAccess === false);

  /* --------------------------------------------------- khu học và quản trị */
  console.log("\nPhân quyền route");
  const learnAnon = await anon("/hoc");
  check(
    "khách vào /hoc bị chuyển sang đăng nhập",
    learnAnon.status === 307 || learnAnon.status === 302,
    `nhận ${learnAnon.status}`,
  );

  const learnAlice = await alice("/hoc");
  check("người đã đăng nhập mở được /hoc", learnAlice.status === 200, `nhận ${learnAlice.status}`);

  const adminAlice = await alice("/quan-tri");
  check(
    "học viên vào /quan-tri nhận 404 (không phải 403)",
    adminAlice.status === 404,
    `nhận ${adminAlice.status}`,
  );

  /* -------------------------------------------------------- đăng nhập lại */
  console.log("\nĐăng nhập, đăng xuất");
  const fresh = makeClient();
  const wrong = await fresh("/api/auth/dang-nhap", {
    method: "POST",
    body: JSON.stringify({ email: aliceEmail, password: "sai-mat-khau-hoan-toan" }),
  });
  check("sai mật khẩu bị từ chối", wrong.status === 401, `nhận ${wrong.status}`);

  const right = await fresh("/api/auth/dang-nhap", {
    method: "POST",
    body: JSON.stringify({ email: aliceEmail, password: alicePass }),
  });
  check("đăng nhập đúng thành công", right.status === 200 && right.body?.ok === true);

  const afterLogin = await fresh("/api/ho-so");
  check(
    "hồ sơ vẫn còn sau khi đăng xuất rồi đăng nhập lại",
    afterLogin.body?.profile?.goal === "ausbildung",
    JSON.stringify(afterLogin.body?.profile?.goal),
  );

  await fresh("/api/auth/dang-xuat", { method: "POST" });
  const afterLogout = await fresh("/api/ho-so");
  check("sau khi đăng xuất thì mất quyền", afterLogout.status === 401, `nhận ${afterLogout.status}`);

  /* ------------------------------------------------------------ quên mật khẩu */
  console.log("\nQuên mật khẩu");
  const forgotReal = await anon("/api/auth/quen-mat-khau", {
    method: "POST",
    body: JSON.stringify({ email: aliceEmail }),
  });
  const forgotFake = await anon("/api/auth/quen-mat-khau", {
    method: "POST",
    body: JSON.stringify({ email: `khong-ton-tai.${stamp}@lingora.test` }),
  });
  check(
    "email có thật và email không có trả lời giống hệt nhau",
    forgotReal.status === forgotFake.status &&
      JSON.stringify(forgotReal.body) === JSON.stringify(forgotFake.body),
    `${forgotReal.status} vs ${forgotFake.status}`,
  );

  const badToken = await anon("/api/auth/dat-lai-mat-khau", {
    method: "POST",
    body: JSON.stringify({ token: "khong-phai-token-that-dau", password: "mot-mat-khau-du-dai" }),
  });
  check("token đặt lại giả bị từ chối", badToken.status === 400, `nhận ${badToken.status}`);

  const badVerify = await anon("/api/auth/xac-minh", {
    method: "POST",
    body: JSON.stringify({ token: "cung-khong-phai-token-that" }),
  });
  check("token xác minh giả bị từ chối", badVerify.status === 400, `nhận ${badVerify.status}`);

  /* ------------------------------------------------------------- kết luận */
  console.log(`\n${passed} PASS, ${failed} FAIL`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
