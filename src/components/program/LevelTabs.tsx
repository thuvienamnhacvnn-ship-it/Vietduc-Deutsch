"use client";

import { useSyncExternalStore } from "react";
import type { LevelPlan } from "@/content/curriculum";
import {
  IconBook,
  IconCap,
  IconChat,
  IconCheck,
  IconGear,
  IconInfo,
  IconTarget,
  IconTool,
  IconUsers,
} from "@/components/home/Icons";

/**
 * Bốn thẻ cấp độ và bảng chi tiết của cấp đang chọn - trang Chương trình.
 *
 * Cấp đang chọn nằm trong dấu # của địa chỉ (#a1…#b2), nên đường dẫn từ thẻ
 * cấp độ ở trang chủ mở đúng cấp, và gửi đường dẫn cho người khác cũng mở đúng
 * cấp. Đọc bằng useSyncExternalStore: server vẽ A1, trình duyệt đồng bộ ngay
 * lần vẽ đầu, không có vòng render thừa.
 *
 * Không có phần tử nào mang id "a1": trình duyệt sẽ không nhảy cuộn trang mỗi
 * lần bấm thẻ.
 *
 * Bốn bảng đều có trong HTML (ẩn bằng `hidden`) - trình tìm kiếm và người tắt
 * JavaScript vẫn đọc được toàn bộ chương trình.
 */

const META: Record<string, { title: string; short: string; Icon: typeof IconBook }> = {
  A1: { title: "Khởi đầu", short: "Những câu nói đầu tiên", Icon: IconBook },
  A2: { title: "Đời sống hằng ngày", short: "Xoay xở việc thường ngày", Icon: IconUsers },
  B1: { title: "Giao tiếp độc lập", short: "Tự lập trong tình huống quen thuộc", Icon: IconChat },
  B2: { title: "Học tập & công việc", short: "Lập luận và làm việc bằng tiếng Đức", Icon: IconCap },
};

/** "khoảng 100-150 giờ học" → "100 – 150 giờ". Không khớp thì giữ nguyên chữ gốc. */
function hours(text: string): string {
  const m = text.match(/(\d+)\s*-\s*(\d+)/);
  return m ? `${m[1]} – ${m[2]} giờ` : text;
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function LevelTabs({ levels }: { levels: LevelPlan[] }) {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1).toUpperCase(),
    () => "",
  );
  const current = levels.find((l) => l.level === hash)?.level ?? levels[0].level;

  function select(level: string) {
    // replace("#…") vừa đổi địa chỉ vừa phát hashchange, và không chồng thêm
    // một mục lịch sử cho mỗi lần bấm thẻ - nút Back vẫn đưa về trang trước.
    window.location.replace(`#${level.toLowerCase()}`);
  }

  function onKey(e: React.KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = levels[(index + step + levels.length) % levels.length];
    select(next.level);
    document.getElementById(`the-${next.level}`)?.focus();
  }

  return (
    <>
      <div className="program-tabs" role="tablist" aria-label="Cấp độ">
        {levels.map((l, i) => {
          const meta = META[l.level];
          const on = l.level === current;
          return (
            <button
              key={l.level}
              id={`the-${l.level}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`bang-${l.level}`}
              tabIndex={on ? 0 : -1}
              className="program-tab"
              onClick={() => select(l.level)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="program-tab__text">
                <span className="program-tab__code">{l.level}</span>
                <span className="program-tab__title">{meta.title}</span>
                <span className="program-tab__hours">{hours(l.typicalHours)}</span>
              </span>
              <span className="program-tab__icon" aria-hidden="true">
                <meta.Icon size={44} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="program-note">
        <IconInfo size={18} />
        Thời lượng tham khảo, không phải cam kết hoàn thành.
      </p>

      {levels.map((l) => {
        const meta = META[l.level];
        return (
          <section
            key={l.level}
            id={`bang-${l.level}`}
            role="tabpanel"
            aria-labelledby={`the-${l.level}`}
            className="program-panel"
            hidden={l.level !== current}
          >
            <h2 className="program-panel__h">
              {l.level} — {meta.short}
            </h2>
            <p className="program-panel__sub">{l.summary}</p>

            <div className="program-cols">
              <div className="program-col">
                <h3>
                  <IconBook size={26} /> Chủ đề
                </h3>
                <ol className="program-list">
                  {l.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </div>
              <div className="program-col">
                <h3>
                  <IconGear size={26} /> Ngữ pháp &amp; cấu trúc
                </h3>
                <ol className="program-list">
                  {l.structures.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </div>
              <div className="program-col program-col--can">
                <h3>
                  <IconTarget size={26} /> Bạn sẽ làm được
                </h3>
                <ul className="program-can">
                  {l.canDo.map((t) => (
                    <li key={t}>
                      <span aria-hidden="true">
                        <IconCheck size={14} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="program-building">
              <IconTool size={18} />
              Nội dung bài học chi tiết đang được biên soạn và duyệt theo từng cấp độ.
            </p>
          </section>
        );
      })}
    </>
  );
}
