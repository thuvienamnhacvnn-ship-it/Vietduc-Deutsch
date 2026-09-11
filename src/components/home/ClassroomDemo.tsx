import type { Dict } from "@/i18n/dict";
import { BerlinScene } from "./BerlinScene";
import { IconCheck, IconKeyboard, IconMic, IconSpeaker } from "./Icons";

/**
 * Minh hoạ một lượt trong lớp học, đặt ở hero.
 *
 * Bản thiết kế gốc là một cuộc gọi video với khuôn mặt người thật. Lớp học của
 * nền tảng KHÔNG có hình người: Anna là giọng nói và chữ. Vẽ một khuôn mặt ở
 * đây là hứa một thứ người học vào lớp sẽ không thấy - nên Anna hiện đúng như
 * trong lớp: một giọng nói đang nghe, cùng những gì lớp thật sự làm:
 *
 *   - Anna hỏi bằng tiếng Đức, kèm nghĩa bằng ngôn ngữ của trang
 *   - người học trả lời, có một lỗi
 *   - thẻ bên phải sửa đúng MỘT lỗi đó - quy tắc thật của lớp
 *   - thanh dưới là ba nút có thật trong lớp: gõ chữ, nói, nghe lại
 *
 * Câu tiếng Đức giữ nguyên ở mọi bản dịch và mang `lang="de"`.
 */
export function ClassroomDemo({ t }: { t: Dict["demo"] }) {
  return (
    <figure className="demo" aria-label={t.label}>
      <div className="demo__frame">
        <div className="demo__screen">
          <BerlinScene className="demo__scene" />

          <div className="demo__chip">
            <span className="demo__avatar" aria-hidden="true">
              A
            </span>
            <span>
              <strong>{t.teacher}</strong>
              <span className="demo__status">
                <span className="demo__dot" aria-hidden="true" />
                {t.status}
              </span>
            </span>
          </div>

          <div className="demo__voice" aria-hidden="true">
            <span />
            <span />
            <span />
            <i>A</i>
          </div>

          <div className="demo__turns">
            <p className="demo__bubble demo__bubble--anna">
              <span>
                <span lang="de" className="demo__de">
                  Wo wohnst du?
                </span>
                <span className="demo__tr">{t.question}</span>
              </span>
              <IconSpeaker size={18} />
            </p>
            <p className="demo__bubble demo__bubble--me">
              <span lang="de" className="demo__de">
                Ich <span className="demo__err">wohnen</span> in Berlin.
              </span>
              <Wave />
            </p>
          </div>
        </div>

        <div className="demo__bar" aria-hidden="true">
          <span className="demo__ctl">
            <IconKeyboard />
            {t.controls.type}
          </span>
          <span className="demo__ctl demo__ctl--mic">
            <span className="demo__mic">
              <IconMic size={24} />
            </span>
            {t.controls.mic}
          </span>
          <span className="demo__ctl">
            <IconSpeaker />
            {t.controls.listen}
          </span>
        </div>
      </div>

      <aside className="demo__fix">
        <p className="demo__fix-title">
          <span className="demo__fix-icon" aria-hidden="true">
            <IconCheck size={16} />
          </span>
          {t.fixTitle}
        </p>
        <p lang="de" className="demo__fix-line">
          Ich <del>wohnen</del> <ins>wohne</ins> in Berlin.
        </p>
        <p className="demo__fix-why">{t.fixWhy}</p>
      </aside>

      <p className="demo__script" lang="de" aria-hidden="true">
        Berlin wartet auf dich <span>♡</span>
      </p>
    </figure>
  );
}

/** Dạng sóng của đoạn ghi âm vừa nói. Chiều cao cố định, không ngẫu nhiên, để server và client vẽ giống nhau. */
function Wave() {
  const bars = [4, 8, 12, 7, 14, 9, 5, 11, 15, 8, 12, 6, 10, 13, 7, 4, 9, 12, 6, 3];
  return (
    <svg className="demo__wave" viewBox="0 0 80 18" aria-hidden="true" focusable="false">
      {bars.map((h, i) => (
        <rect key={i} x={i * 4} y={9 - h / 2} width="2" height={h} rx="1" />
      ))}
    </svg>
  );
}
