import type { Metadata } from "next";
import { AGENTS, AI_DISCLOSURE, MEMORY_NOTE } from "@/content/agents";

export const metadata: Metadata = {
  title: "Đội ngũ giảng dạy",
  description:
    "Bảy vai trò của Việt Đức Lingua: ai dạy gì, không được làm gì, và đọc được dữ liệu nào của bạn.",
};

export default function AgentsPage() {
  return (
    <>
      <section className="section" style={{ paddingBottom: "var(--s-8)" }}>
        <div className="wrap">
          <p className="eyebrow">Đội ngũ</p>
          <h1>Ai sẽ dạy bạn, và ranh giới của từng người</h1>
          <p className="lede">
            Mỗi người một việc và một cách dạy. Mỗi thẻ dưới đây ghi cả việc người đó{" "}
            <strong>không</strong> được phép làm — phần thường bị giấu đi, và cũng là phần đáng đọc
            nhất.
          </p>

          <p className="note-quiet">
            {AI_DISCLOSURE} Chúng tôi đặt tên và tính cách cho họ để buổi học có người đồng hành,
            không phải để bạn hiểu nhầm.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid grid-2">
          {AGENTS.map((a) => (
            <article key={a.key} className="card agent-card">
              <div className="agent-card__head">
                <span
                  className="agent-card__avatar"
                  style={{ background: a.accent }}
                  aria-hidden="true"
                >
                  {(a.name ?? a.title).slice(0, 1)}
                </span>
                <div>
                  <h2 style={{ fontSize: "var(--fs-lg)", marginBottom: 2 }}>
                    {a.name ?? a.title}
                  </h2>
                  <p className="agent-card__role">{a.name ? a.title : "Vai trò hậu trường"}</p>
                </div>
              </div>

              <p className="persona">{a.persona}</p>
              <p>{a.does}</p>

              <p className="limits">
                <strong>Không làm:</strong> {a.limits}
              </p>

              <p className="agent-card__tools">
                <strong>Công cụ được phép gọi:</strong> {a.tools.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="wrap">
          <p className="eyebrow">Bộ nhớ</p>
          <h2>Hệ thống nhớ gì về bạn</h2>
          <div className="grid grid-3" style={{ marginTop: "var(--s-7)" }}>
            <div className="card">
              <h3>Trong buổi học</h3>
              <p>{MEMORY_NOTE.shortTerm}</p>
            </div>
            <div className="card">
              <h3>Lâu dài</h3>
              <p>{MEMORY_NOTE.longTerm}</p>
            </div>
            <div className="card">
              <h3>Ranh giới</h3>
              <p>{MEMORY_NOTE.boundary}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
