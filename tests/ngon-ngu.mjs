/**
 * Kiểm thử ngôn ngữ giao diện của khu công khai.
 *
 *   node tests/ngon-ngu.mjs [BASE_URL]
 *
 * Mỗi thứ tiếng phải: render trang chủ bằng đúng thứ tiếng đó từ server (không
 * phải đợi JavaScript), khai `lang` đúng, và giữ nguyên câu tiếng Đức. Thêm hai
 * quy tắc đoán ngôn ngữ đã chốt: trình duyệt tiếng Nhật được trang tiếng Nhật,
 * còn trình duyệt tiếng Anh vẫn được tiếng Việt - vì rất nhiều người Việt dùng
 * máy đặt tiếng Anh.
 */
const BASE = process.argv[2] ?? process.env.LINGORA_APP_URL ?? "http://localhost:3055";

let pass = 0;
let fail = 0;
function check(label, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Câu đầu của tiêu đề hero ở từng bản, lấy đúng như trong src/i18n/dict. */
const EXPECT = {
  vi: { tag: "vi", h1: "Tự tin nói tiếng Đức.", nav: "Chương trình" },
  en: { tag: "en", h1: "Speak German with confidence.", nav: "Programme" },
  ja: { tag: "ja", h1: "自信を持ってドイツ語を話そう。", nav: "カリキュラム" },
  zh: { tag: "zh-Hans", h1: "自信地说德语。", nav: "课程" },
  ko: { tag: "ko", h1: "자신 있게 독일어로 말하세요.", nav: "교육과정" },
};

async function page(path, headers = {}) {
  const res = await fetch(`${BASE}${path}`, { headers, redirect: "manual" });
  return { status: res.status, html: await res.text() };
}

async function main() {
  console.log(`Kiểm thử ngôn ngữ ${BASE}\n`);

  for (const [locale, e] of Object.entries(EXPECT)) {
    console.log(`Bản ${locale}`);
    const { status, html } = await page("/", { cookie: `vd-lang=${locale}` });
    check("trang chủ trả 200", status === 200, `nhận ${status}`);
    check("tiêu đề hero đúng thứ tiếng", html.includes(e.h1));
    check("menu đúng thứ tiếng", html.includes(e.nav));
    check(`vùng trang chủ khai lang="${e.tag}"`, html.includes(`class="home" lang="${e.tag}"`));
    check("câu tiếng Đức giữ nguyên, có lang=de", html.includes('lang="de"') && html.includes("Wo wohnst du?"));
    check("lời khai báo AI có mặt", /AI|trí tuệ nhân tạo|人工/.test(html));
  }

  console.log("\nĐoán ngôn ngữ khi chưa chọn");
  const ja = await page("/", { "accept-language": "ja-JP,ja;q=0.9,en;q=0.8" });
  check("trình duyệt tiếng Nhật → tiếng Nhật", ja.html.includes(EXPECT.ja.h1));
  const en = await page("/", { "accept-language": "en-US,en;q=0.9" });
  check("trình duyệt tiếng Anh → vẫn tiếng Việt", en.html.includes(EXPECT.vi.h1));
  const bad = await page("/", { cookie: "vd-lang=xx" });
  check("cookie rác → tiếng Việt, không lỗi", bad.status === 200 && bad.html.includes(EXPECT.vi.h1));

  console.log("\nTrang chưa dịch");
  const sub = await page("/chuong-trinh", { cookie: "vd-lang=en" });
  check("trang con vẫn 200 khi chọn tiếng Anh", sub.status === 200, `nhận ${sub.status}`);
  check("có dòng báo trang này đang bằng tiếng Việt", sub.html.includes("site-header__untranslated"));
  const subVi = await page("/chuong-trinh", { cookie: "vd-lang=vi" });
  check("tiếng Việt thì không có dòng báo đó", !subVi.html.includes("site-header__untranslated"));

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
