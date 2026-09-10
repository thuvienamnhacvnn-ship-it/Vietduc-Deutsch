import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { learnerHome } from "@/lib/bang-hoc";
import { activeEntitlements, profileFor } from "@/lib/queries";
import { SKILL_LABEL_VI } from "@/lib/db/schema";
import { ResendVerification } from "@/components/auth/ResendVerification";
import { HomeArt } from "@/components/HomeArt";
import { adapterMode, config } from "@/lib/config";

export const metadata: Metadata = { title: "Bảng học" };

/**
 * Màn hình chính của khu học viên.
 *
 * Nó phải trả lời đúng một câu, ngay trong khung nhìn đầu tiên trên điện thoại:
 * "bây giờ tôi làm gì tiếp?". Vì vậy thứ to nhất trên trang là MỘT lối vào buổi
 * học tiếp theo, không phải một lưới thống kê. Các con số lùi xuống thành một
 * hàng nhỏ - chúng để người học tự hào, không phải để họ ra quyết định.
 *
 * Người chưa làm bài kiểm tra được đưa thẳng sang đó: chưa đo trình độ thì mọi
 * gợi ý ở đây đều là đoán, và một màn hình toàn ô rỗng không dạy được ai điều
 * gì.
 */
export default async function LearnHome() {
  const user = await requireUser("/hoc");
  const home = await learnerHome(user.id);

  const assessed = home.skills.filter((s) => !s.unknown).length;
  if (assessed === 0) redirect("/hoc/xep-lop");

  const [ents, profile] = await Promise.all([activeEntitlements(user.id), profileFor(user.id)]);
  const llmOff = adapterMode("llm") !== "live";
  const tenNgan = user.name.trim().split(/\s+/).slice(-1)[0] || user.name;
  const hetBai = home.total > 0 && home.done >= home.total;

  return (
    <>
      {/* Lời chào ngắn, không phải một khối tiêu đề trang. Đây là màn hình người
          ta mở mỗi ngày; một dòng chào là đủ, phần còn lại phải là việc. */}
      <header className="hoc-chao">
        <div>
          <p className="hoc-chao__hi">Chào {tenNgan}</p>
          <h1 className="hoc-chao__h1">
            {home.streak > 0
              ? `${home.streak} ngày học liên tiếp`
              : home.spoken > 0
                ? "Quay lại lớp hôm nay nhé"
                : "Buổi học đầu tiên đang chờ"}
          </h1>
        </div>
        {home.level && (
          <Link
            href="/hoc/ket-qua"
            className="hoc-chao__muc"
            aria-label={`Trình độ ${home.level}, xem kết quả`}
          >
            <span>Trình độ</span>
            <strong>{home.level}</strong>
          </Link>
        )}
      </header>

      {config.requireEmailVerification && !user.emailVerified && (
        <div className="alert alert--warning">
          <div>
            <p>
              <strong>Email chưa được xác minh.</strong> Bạn vẫn học được, nhưng chưa nhận được
              thông báo và chưa đặt lại được mật khẩu khi cần.
            </p>
            <ResendVerification email={user.email} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- việc chính hôm nay */}
      {home.next ? (
        <Link
          href={llmOff ? "/hoc/lop" : `/hoc/lop/${home.next.code.toLowerCase()}`}
          className="tiep-tuc"
        >
          <HomeArt />
          <span className="tiep-tuc__nhan">
            {home.next.state === "doing"
              ? "Đang học dở"
              : hetBai
                ? "Học lại"
                : home.done > 0
                  ? "Học tiếp"
                  : "Bắt đầu"}
            <span className="tiep-tuc__cham" aria-hidden="true" />
            {home.next.level}
          </span>
          <span className="tiep-tuc__ten">{home.next.title}</span>
          {home.next.situationVi && <span className="tiep-tuc__mo-ta">{home.next.situationVi}</span>}
          <span className="tiep-tuc__nut">
            {home.next.state === "doing" ? "Học tiếp" : "Vào buổi học"}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h13M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      ) : (
        <div className="empty">
          <h3>Chưa có buổi học nào được duyệt</h3>
          <p>
            Nội dung đã soạn nhưng còn chờ người duyệt. Bài do máy soạn phải có người đọc lại trước
            khi học viên học — đó là ràng buộc của dự án, không phải một bước hình thức.
          </p>
        </div>
      )}

      {llmOff && home.next && (
        <p className="note-quiet" style={{ marginTop: "var(--s-4)" }}>
          Máy chủ giảng dạy chưa bật trên bản cài này, nên buổi học chưa diễn ra được. Bạn vẫn xem
          được nội dung từng buổi.
        </p>
      )}

      {/* ------------------------------------------------------- con số của bạn */}
      <div className="so-lieu" role="list">
        <div className="so-lieu__o" role="listitem">
          <span className="so-lieu__so">{home.streak}</span>
          <span className="so-lieu__nhan">ngày liên tiếp</span>
        </div>
        <div className="so-lieu__o" role="listitem">
          <span className="so-lieu__so">{home.spoken}</span>
          <span className="so-lieu__nhan">lượt đã nói</span>
        </div>
        <div className="so-lieu__o" role="listitem">
          <span className="so-lieu__so">
            {home.done}
            <span className="so-lieu__tren">/{home.total}</span>
          </span>
          <span className="so-lieu__nhan">buổi đã xong</span>
        </div>
      </div>

      {/* ---------------------------------------------------------- việc còn lại */}
      <section className="viec">
        <h2 className="muc-de">Việc hôm nay</h2>

        <Link href="/hoc/on-tap" className="viec__hang">
          <span className="viec__icon viec__icon--on" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 12a8 8 0 1 1-2.4-5.7" />
              <path d="M20 4v4h-4" />
            </svg>
          </span>
          <span className="viec__chu">
            <strong>Ôn tập</strong>
            <span>
              {home.due > 0
                ? `${home.due} thẻ tới hạn hôm nay`
                : home.spoken > 0
                  ? "Không còn thẻ nào tới hạn — quay lại sau"
                  : "Thẻ ôn sinh ra từ lỗi được sửa trong lớp"}
            </span>
          </span>
          {home.due > 0 && <span className="viec__dem">{home.due}</span>}
        </Link>

        {home.after && (
          <Link href={`/hoc/lop/${home.after.code.toLowerCase()}`} className="viec__hang">
            <span className="viec__icon viec__icon--lop" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 5.5h6a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h6" />
                <path d="M4 5.5V18h6a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h6V5.5" />
              </svg>
            </span>
            <span className="viec__chu">
              <strong>Sau đó: {home.after.title}</strong>
              <span>
                {home.after.level} · {home.after.situationVi || "buổi tiếp theo trong lộ trình"}
              </span>
            </span>
          </Link>
        )}

        {assessed < 4 && (
          <Link href="/hoc/xep-lop" className="viec__hang">
            <span className="viec__icon viec__icon--do" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
                <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
              </svg>
            </span>
            <span className="viec__chu">
              <strong>Đo nốt {4 - assessed} kỹ năng còn lại</strong>
              <span>Kỹ năng thiếu bằng chứng được ghi là chưa đánh giá, không đoán điểm.</span>
            </span>
          </Link>
        )}
      </section>

      {/* ------------------------------------------------------------ bốn kỹ năng */}
      <section className="ky-nang">
        <div className="muc-de muc-de--hang">
          <h2>Bốn kỹ năng</h2>
          <Link href="/hoc/ket-qua">Xem kết quả</Link>
        </div>

        <div className="card">
          {home.skills.map((s) => (
            <div key={s.skill} className="skill-row">
              <span className="skill-row__name">{SKILL_LABEL_VI[s.skill]}</span>
              <span
                className="meter"
                data-unknown={s.unknown ? "true" : undefined}
                role="img"
                aria-label={
                  s.unknown
                    ? `${SKILL_LABEL_VI[s.skill]}: chưa đủ bằng chứng để đánh giá`
                    : `${SKILL_LABEL_VI[s.skill]}: mức ${s.level}, độ tin cậy ${Math.round(s.confidence * 100)} phần trăm`
                }
              >
                <span
                  style={{
                    width: s.unknown ? "100%" : `${Math.max(8, Math.round(s.confidence * 100))}%`,
                  }}
                />
              </span>
              <span className="skill-row__value">
                {s.unknown ? "chưa đánh giá" : `${s.level} · ${Math.round(s.confidence * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ gói */}
      <section className="the-goi">
        <div>
          <strong>{ents.length > 0 ? "Đang có quyền học" : "Chưa có gói học"}</strong>
          <p>
            {ents.length > 0
              ? "Quyền học được cấp từ backend sau khi đối soát, không từ giao diện."
              : "Bạn vẫn học và kiểm tra được. Thanh toán chuyển khoản, chưa thu tiền lần nào."}
          </p>
        </div>
        <Link href="/hoc/goi-hoc" className="btn btn--secondary btn--sm">
          {ents.length > 0 ? "Xem gói" : "Xem học phí"}
        </Link>
      </section>

      <p className="hoc-cuoi">
        Kiểu sửa lỗi đang đặt là{" "}
        <strong>
          {profile.correctionStyle === "immediate" ? "sửa ngay" : "tổng kết cuối lượt"}
        </strong>
        . Đổi trong <Link href="/hoc/ho-so">hồ sơ</Link>.
      </p>
    </>
  );
}
