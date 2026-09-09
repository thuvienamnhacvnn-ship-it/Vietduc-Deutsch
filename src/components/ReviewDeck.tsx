"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api-client";

type Card = {
  id: number;
  type: "vocab" | "error_pattern";
  content: { wrong?: string; right?: string; why?: string; de?: string; vi?: string };
  reps: number;
  lapses: number;
};

/**
 * Bộ thẻ ôn tập.
 *
 * Một thẻ một màn hình, hai nút: nhớ hoặc quên. Thang sáu mức của SM-2 gốc đo
 * chính xác hơn nhưng bắt người học tự chấm mình tỉ mỉ ở mỗi thẻ, và phần đông
 * bỏ giữa chừng - dữ liệu chính xác của một người bỏ ngang thì kém hơn dữ liệu
 * thô của một người ôn hết.
 *
 * Thẻ lật rồi mới hiện đáp án. Nhìn thấy đáp án cùng lúc với câu hỏi thì không
 * còn là nhớ lại, mà là đọc lại - và đọc lại gần như không tạo ra trí nhớ.
 */
export function ReviewDeck() {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(0);
  const [nextNote, setNextNote] = useState<string | null>(null);
  const startedRef = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/on-tap");
    const body = (await res.json().catch(() => null)) as { items?: Card[] } | null;
    setCards(body?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void load();
  }, [load]);

  async function grade(remembered: boolean) {
    const card = cards[index];
    if (!card) return;
    const res = await apiPost<{ nextDays: number }>("/api/on-tap", { id: card.id, remembered });
    setNextNote(
      res.ok
        ? res.data.nextDays >= 1
          ? `Hẹn gặp lại thẻ này sau ${res.data.nextDays} ngày.`
          : "Thẻ này sẽ quay lại ngay trong hôm nay."
        : null,
    );
    setDone((d) => d + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (loading) {
    return (
      <p className="test-center">
        <span className="spinner" aria-hidden="true" /> Đang lấy thẻ ôn…
      </p>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="empty">
        <h3>Chưa có thẻ nào tới hạn</h3>
        <p>
          Thẻ ôn được tạo ra từ những lỗi bạn được sửa trong lớp học nói. Học một buổi rồi quay lại
          đây sau vài ngày.
        </p>
      </div>
    );
  }

  const card = cards[index];

  if (!card) {
    return (
      <div className="empty">
        <h3>Xong {done} thẻ hôm nay</h3>
        <p>{nextNote ?? "Những thẻ còn lại sẽ quay lại đúng lúc bạn sắp quên."}</p>
      </div>
    );
  }

  const front = card.content.wrong ?? card.content.de ?? "";
  const back = card.content.right ?? card.content.vi ?? "";

  return (
    <div className="the-on">
      <p className="the-on__count">
        Thẻ {index + 1} / {cards.length}
        {card.lapses > 0 && <span> · đã vấp {card.lapses} lần</span>}
      </p>

      <div className="the-on__card">
        <p className="the-on__label">Bạn đã nói</p>
        <p className="the-on__front" lang="de">
          {front}
        </p>

        {flipped ? (
          <>
            <p className="the-on__label">Câu đúng</p>
            <p className="the-on__back" lang="de">
              {back}
            </p>
            {card.content.why && <p className="the-on__why">{card.content.why}</p>}
          </>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={() => setFlipped(true)}>
            Nói câu đúng trong đầu, rồi lật thẻ
          </button>
        )}
      </div>

      {flipped && (
        <div className="the-on__row">
          <button type="button" className="btn btn--secondary" onClick={() => void grade(false)}>
            Chưa nhớ
          </button>
          <button type="button" className="btn btn--primary" onClick={() => void grade(true)}>
            Nhớ rồi
          </button>
        </div>
      )}
    </div>
  );
}
