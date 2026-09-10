import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { activeEntitlements, dueReviewCount, profileFor, skillStateFor } from "@/lib/queries";
import { SKILL_LABEL_VI } from "@/lib/db/schema";
import { ResendVerification } from "@/components/auth/ResendVerification";
import { adapterStatus, config } from "@/lib/config";

export const metadata: Metadata = { title: "Bảng học" };

/**
 * Bảng học.
 *
 * Chỉ có nghĩa khi đã có kết quả để bày ra. Người vừa đăng ký xong mà nhìn thấy
 * bốn ô rỗng và một khối "chưa có bài học nào" thì không biết phải làm gì -
 * việc duy nhất họ cần làm lúc đó là bài kiểm tra trình độ, nên đưa thẳng họ
 * tới đó thay vì bắt đi qua một màn hình trống.
 */
export default async function LearnHome() {
  const user = await requireUser("/hoc");
  const [skills, due, ents, profile] = await Promise.all([
    skillStateFor(user.id),
    dueReviewCount(user.id),
    activeEntitlements(user.id),
    profileFor(user.id),
  ]);

  const assessed = skills.filter((s) => !s.unknown).length;
  if (assessed === 0) redirect("/hoc/xep-lop");
  const status = adapterStatus();
  const voiceReady = status.stt === "live" && status.tts === "live";

  return (
    <>
      <div className="page-head">
        <h1>Chào {user.name}</h1>
        <p>
          {assessed === 0
            ? "Bắt đầu bằng bài kiểm tra bốn kỹ năng — đó là thứ quyết định lộ trình của bạn."
            : `Đã đánh giá ${assessed}/4 kỹ năng.`}
        </p>
      </div>

      {/* Đang tạm tắt xác minh email thì không nhắc: bảo người ta làm một việc
          họ không làm được là cách nhanh nhất để họ mất tin vào phần còn lại. */}
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

      <div className="stat-grid">
        <div className="stat">
          <p className="stat__label">Kỹ năng đã đánh giá</p>
          <p className="stat__value">{assessed}/4</p>
          <p className="stat__note">
            Kỹ năng thiếu bằng chứng được ghi là chưa đánh giá được, không đoán điểm.
          </p>
        </div>
        <div className="stat">
          <p className="stat__label">Mục cần ôn hôm nay</p>
          <p className="stat__value">{due}</p>
          <p className="stat__note">Lịch ôn chạy theo kết quả thật của bạn.</p>
        </div>
        <div className="stat">
          <p className="stat__label">Trạng thái gói</p>
          <p className="stat__value" style={{ fontSize: "var(--fs-lg)" }}>
            {ents.length > 0 ? "Đang có quyền học" : "Chưa có gói"}
          </p>
          <p className="stat__note">
            {ents.length > 0
              ? "Quyền học được cấp từ backend, không từ giao diện."
              : "Thanh toán chưa mở. Bạn chưa bị thu tiền lần nào."}
          </p>
        </div>
        <div className="stat">
          <p className="stat__label">Kiểu sửa lỗi</p>
          <p className="stat__value" style={{ fontSize: "var(--fs-lg)" }}>
            {profile.correctionStyle === "immediate" ? "Sửa ngay" : "Tổng kết cuối lượt"}
          </p>
          <p className="stat__note">
            Đổi trong <Link href="/hoc/ho-so">hồ sơ</Link>.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Bốn kỹ năng</h2>
          {skills.map((s) => (
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
          <p style={{ marginTop: "var(--s-5)", marginBottom: 0 }}>
            <span className="btn btn--primary btn--sm" aria-disabled="true">
              Làm bài xếp lớp (sắp có)
            </span>
          </p>
        </section>

        <section className="card">
          <h2 style={{ fontSize: "var(--fs-lg)" }}>Bài học tiếp theo</h2>
          <div className="empty">
            <h3>Chưa có bài học nào được xuất bản</h3>
            <p>
              Giáo trình đang được biên soạn và duyệt. Khi có bài đầu tiên ở cấp độ của bạn, nó sẽ
              mở ngay tại đây.
            </p>
          </div>
          {!voiceReady && (
            <p
              style={{
                marginTop: "var(--s-4)",
                marginBottom: 0,
                fontSize: "var(--fs-sm)",
                color: "var(--muted)",
              }}
            >
              Lớp học bằng giọng nói đang được hoàn thiện và chưa mở.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
