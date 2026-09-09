/**
 * Kiểm thử luồng "Tiếp tục với Google" trên server đang chạy.
 *
 * Chạy qua bản MÔ PHỎNG (chưa có khóa Google), nhưng đi đúng con đường thật:
 * cùng cookie state, cùng route callback, cùng code tạo tài khoản và tạo phiên.
 * Chỉ một chỗ khác: trang chọn tài khoản là màn hình nội bộ thay vì của Google.
 *
 *   node tests/google.mjs [baseUrl]
 *
 * LƯU Ý: xem ghi chú về rate limit ở đầu tests/smoke.mjs - hai tệp dùng chung
 * hạn mức đăng ký theo IP.
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

  async function call(path, init = {}) {
    const headers = new Headers(init.headers ?? {});
    if (jar.size > 0) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    if (init.body && typeof init.body === "string" && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const response = await fetch(new URL(path, BASE), { ...init, headers, redirect: "manual" });

    for (const [key, value] of response.headers) {
      if (key.toLowerCase() !== "set-cookie") continue;
      for (const part of value.split(/,(?=[^;]+=)/)) {
        const [pair] = part.split(";");
        const idx = pair.indexOf("=");
        if (idx <= 0) continue;
        const name = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        // Cookie bị xóa (giá trị rỗng) thì bỏ khỏi jar, đúng như trình duyệt.
        if (val === "") jar.delete(name);
        else jar.set(name, val);
      }
    }

    const type = response.headers.get("content-type") ?? "";
    const body = type.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    return { status: response.status, body, location: response.headers.get("location"), jar };
  }

  call.jar = jar;
  return call;
}

/** Đi trọn luồng Google cho một địa chỉ email, trả về client đã có phiên. */
async function signInWithGoogle(email, name) {
  const client = makeClient();

  const start = await client("/api/auth/google?tiep=/hoc");
  if (start.status !== 302) throw new Error(`bước 1 trả ${start.status}`);

  const mockUrl = new URL(start.location, BASE);
  const state = mockUrl.searchParams.get("state");
  if (!state) throw new Error("không có state trong URL chuyển hướng");

  const form = new URLSearchParams({ email, name, state });
  const submitted = await client("/api/auth/google/mo-phong", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (submitted.status !== 303) throw new Error(`màn hình mô phỏng trả ${submitted.status}`);

  const callback = await client(
    new URL(submitted.location, BASE).pathname + new URL(submitted.location, BASE).search,
  );

  return { client, callback, state, mockUrl };
}

async function main() {
  console.log(`Kiểm thử đăng nhập Google trên ${BASE}\n`);
  const stamp = Date.now();

  /* ------------------------------------------------------------ bước mở đầu */
  console.log("Bắt đầu luồng");
  const opener = makeClient();
  const start = await opener("/api/auth/google?tiep=/hoc");
  check("GET /api/auth/google chuyển hướng", start.status === 302, `nhận ${start.status}`);
  check("có đặt cookie state", opener.jar.has("lingora_oauth"));
  check(
    "chuyển sang màn hình chọn tài khoản kèm state",
    Boolean(new URL(start.location, BASE).searchParams.get("state")),
    start.location ?? "",
  );

  const evil = await opener("/api/auth/google?tiep=https://vi-du-doc-hai.test/lay-cap");
  const evilNext = evil.status === 302;
  check("tham số tiep trỏ ra ngoài không được chấp nhận", evilNext, `nhận ${evil.status}`);

  /* ------------------------------------------------------ đăng ký lần đầu */
  console.log("\nĐăng ký bằng Google");
  const email = `google.${stamp}@lingora.test`;
  const first = await signInWithGoogle(email, "Nguyễn Thị Google");
  // Người MỚI đăng ký bằng Google phải rơi thẳng vào bài kiểm tra trình độ,
  // không đi qua bảng học rỗng.
  check(
    "đăng ký bằng Google đưa thẳng tới bài kiểm tra trình độ",
    first.callback.status === 302 &&
      new URL(first.callback.location, BASE).pathname === "/hoc/xep-lop",
    `${first.callback.status} → ${first.callback.location}`,
  );

  const profile = await first.client("/api/ho-so");
  check("có phiên đăng nhập ngay sau đó", profile.status === 200, `nhận ${profile.status}`);
  const userId = profile.body?.profile?.userId;
  check("hồ sơ học viên được tạo kèm", Boolean(userId));

  const learn = await first.client("/hoc/xep-lop");
  check("mở được trang kiểm tra trình độ", learn.status === 200, `nhận ${learn.status}`);

  /* ------------------------------------------- đăng nhập lại: cùng tài khoản */
  console.log("\nĐăng nhập lại");
  const second = await signInWithGoogle(email, "Tên Khác Hẳn");
  const secondProfile = await second.client("/api/ho-so");
  check(
    "cùng email Google thì vào đúng tài khoản cũ, không tạo tài khoản thứ hai",
    secondProfile.body?.profile?.userId === userId,
    `${userId} vs ${secondProfile.body?.profile?.userId}`,
  );

  /* ------------------------------------------------- tài khoản không mật khẩu */
  console.log("\nTài khoản tạo bằng Google");
  const guess = await makeClient()("/api/auth/dang-nhap", {
    method: "POST",
    body: JSON.stringify({ email, password: "mot-mat-khau-bat-ky-du-dai" }),
  });
  check(
    "không đăng nhập bằng mật khẩu được (tài khoản không có mật khẩu)",
    guess.status === 401,
    `nhận ${guess.status}`,
  );

  /* --------------------------------------------------- nối vào tài khoản cũ */
  console.log("\nNối Google vào tài khoản đã có sẵn");
  const pwEmail = `matkhau.${stamp}@lingora.test`;
  const pwClient = makeClient();
  const registered = await pwClient("/api/auth/dang-ky", {
    method: "POST",
    body: JSON.stringify({
      email: pwEmail,
      name: "Người Dùng Mật Khẩu",
      password: "mot-cau-dai-de-nho",
      acceptTerms: true,
    }),
  });
  check("tạo tài khoản bằng mật khẩu trước", registered.status === 200);
  const pwProfile = await pwClient("/api/ho-so");
  const pwUserId = pwProfile.body?.profile?.userId;

  const linked = await signInWithGoogle(pwEmail, "Người Dùng Mật Khẩu");
  const linkedProfile = await linked.client("/api/ho-so");
  check(
    "đăng nhập Google cùng email nối vào đúng tài khoản đó",
    linkedProfile.body?.profile?.userId === pwUserId,
    `${pwUserId} vs ${linkedProfile.body?.profile?.userId}`,
  );

  const stillPassword = await makeClient()("/api/auth/dang-nhap", {
    method: "POST",
    body: JSON.stringify({ email: pwEmail, password: "mot-cau-dai-de-nho" }),
  });
  check("mật khẩu cũ vẫn dùng được sau khi nối", stillPassword.status === 200, `nhận ${stillPassword.status}`);

  /* --------------------------------------------------------------- bảo mật */
  console.log("\nChặn tấn công");

  // state sai: cookie của phiên này, state của phiên khác.
  const victim = makeClient();
  await victim("/api/auth/google?tiep=/hoc");
  const wrongState = await victim(
    `/api/auth/google/callback?state=khong-phai-state-cua-toi&code=${Buffer.from(
      JSON.stringify({ email: `kegian.${stamp}@lingora.test`, name: "Kẻ gian" }),
      "utf8",
    ).toString("base64url")}`,
  );
  check(
    "state không khớp thì bị chặn",
    wrongState.status === 302 && String(wrongState.location).includes("loi=google_sai_state"),
    `${wrongState.status} → ${wrongState.location}`,
  );

  // không có cookie nào cả.
  const noCookie = await makeClient()("/api/auth/google/callback?state=abc&code=def");
  check(
    "callback không có cookie thì bị từ chối",
    noCookie.status === 302 && String(noCookie.location).includes("loi=google_het_han"),
    String(noCookie.location),
  );

  // cookie chỉ dùng được một lần.
  const replay = makeClient();
  const replayStart = await replay("/api/auth/google?tiep=/hoc");
  const replayState = new URL(replayStart.location, BASE).searchParams.get("state");
  const replayCode = Buffer.from(
    JSON.stringify({ email: `phatlai.${stamp}@lingora.test`, name: "Phát lại" }),
    "utf8",
  ).toString("base64url");
  const firstUse = await replay(`/api/auth/google/callback?state=${replayState}&code=${replayCode}`);
  const secondUse = await replay(`/api/auth/google/callback?state=${replayState}&code=${replayCode}`);
  check("lần dùng đầu thành công", firstUse.status === 302 && !String(firstUse.location).includes("loi="));
  check(
    "dùng lại cùng cookie state lần hai thì bị từ chối",
    String(secondUse.location).includes("loi=google_het_han"),
    String(secondUse.location),
  );

  // người dùng bấm Hủy ở màn hình Google.
  const cancel = makeClient();
  await cancel("/api/auth/google?tiep=/hoc");
  const cancelled = await cancel("/api/auth/google/callback?error=access_denied");
  check(
    "bấm Hủy ở Google thì báo đúng lý do",
    String(cancelled.location).includes("loi=google_bi_huy"),
    String(cancelled.location),
  );

  /* ---------------------------------------------------------- giao diện */
  console.log("\nGiao diện");
  const anon = makeClient();
  const loginPage = await anon("/dang-nhap");
  check("trang đăng nhập có nút Google", String(loginPage.body).includes("Tiếp tục với Google"));
  check(
    "trang đăng nhập nói rõ đang chạy bản mô phỏng",
    String(loginPage.body).includes("Bản mô phỏng"),
  );
  const registerPage = await anon("/dang-ky");
  check("trang đăng ký có nút Google", String(registerPage.body).includes("Tiếp tục với Google"));

  const errorPage = await anon("/dang-nhap?loi=google_bi_huy");
  check(
    "trang đăng nhập hiển thị thông báo lỗi của Google",
    String(errorPage.body).includes("dừng ở màn hình Google"),
  );

  const mockPage = await anon("/dang-nhap/google-mo-phong?state=abc");
  check(
    "màn hình mô phỏng tự nói nó không phải Google",
    mockPage.status === 200 && String(mockPage.body).includes("Đây không phải Google"),
    `nhận ${mockPage.status}`,
  );
  const mockNoState = await anon("/dang-nhap/google-mo-phong");
  check("màn hình mô phỏng không có state thì 404", mockNoState.status === 404, `nhận ${mockNoState.status}`);

  console.log(`\n${passed} PASS, ${failed} FAIL`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
