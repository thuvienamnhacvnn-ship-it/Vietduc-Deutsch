"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { SpeakingRecorder } from "@/components/SpeakingRecorder";

type Item = {
  code: string;
  kind: "mcq" | "gap" | "write" | "speak";
  level: string;
  skill: string;
  prompt: string;
  passage?: string;
  options?: string[];
  hint?: string;
  minWords?: number;
  speakText?: string;
  index: number;
  total: number;
};

type Feedback = {
  correct: boolean;
  /** Chỉ số đáp án đúng, chỉ có ở câu trắc nghiệm. */
  answer: number | null;
  /** Từ cần điền, chỉ có ở câu điền. */
  expected: string | null;
  why: string;
} | null;

const SKILL_LABEL: Record<string, string> = {
  reading: "Đọc và cấu trúc",
  listening: "Nghe",
  writing: "Viết",
  speaking: "Nói",
};

/**
 * Bài kiểm tra xếp lớp: mỗi màn một câu.
 *
 * Vì sao một câu một màn: người học đang ở mức A1 mà nhìn thấy hai mươi câu
 * tiếng Đức cùng lúc thì bỏ ngay. Một câu, một nút, một thanh tiến độ.
 *
 * Câu Nghe được đọc bằng bộ đọc sẵn có của trình duyệt và giao diện nói rõ điều
 * đó. Đây là bản dự phòng có nhãn, không phải dịch vụ giọng nói của Lingora.
 */
export function PlacementTest() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "intro" | "question" | "finishing">("loading");
  const [resumed, setResumed] = useState(false);
  const [germanVoice, setGermanVoice] = useState<SpeechSynthesisVoice | null>(null);
  /** Câu kế tiếp, giữ lại trong lúc người học đang đọc lời giải thích. */
  const [pendingNext, setPendingNext] = useState<Item | null>(null);
  const [pendingDone, setPendingDone] = useState(false);
  /** Đã gửi xong đoạn ghi âm cho đề Nói đang mở. */
  const [recorded, setRecorded] = useState(false);
  const startedRef = useRef(false);

  /* --------------------------------------------------------- giọng đọc */

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      // Ưu tiên giọng de-DE; không có thì bất kỳ giọng tiếng Đức nào.
      const de =
        voices.find((v) => v.lang?.toLowerCase() === "de-de") ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("de")) ??
        null;
      setGermanVoice(de);
    };
    pick();
    // Chrome nạp danh sách giọng không đồng bộ, nên phải nghe sự kiện.
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  const speak = useCallback(
    (germanText: string, slow = false) => {
      if (!germanVoice || typeof window === "undefined") return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(germanText);
      utterance.voice = germanVoice;
      utterance.lang = germanVoice.lang || "de-DE";
      utterance.rate = slow ? 0.7 : 0.92;
      window.speechSynthesis.speak(utterance);
    },
    [germanVoice],
  );

  /* ----------------------------------------------------------- bắt đầu */

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    apiPost<{ sessionId: number; item: Item | null; done: boolean; resumed: boolean }>(
      "/api/xep-lop/bat-dau",
      {},
    ).then((result) => {
      if (!result.ok) {
        setError(result.error.message);
        setPhase("intro");
        return;
      }
      setSessionId(result.data.sessionId);
      setResumed(result.data.resumed);
      setItem(result.data.item);
      setPhase(result.data.resumed ? "question" : "intro");
    });
  }, []);

  // Câu Nghe tự đọc một lần khi hiện ra, để người học không phải tìm nút.
  useEffect(() => {
    if (phase !== "question" || !item?.speakText) return;
    const timer = setTimeout(() => speak(item.speakText!), 350);
    return () => clearTimeout(timer);
  }, [item, phase, speak]);

  /* ------------------------------------------------------------ gửi bài */

  async function submit(skip = false) {
    if (!sessionId || !item) return;
    setBusy(true);
    setError(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const result = await apiPost<{ feedback: Feedback; item: Item | null; done: boolean }>(
      "/api/xep-lop/tra-loi",
      {
        sessionId,
        code: item.code,
        ...(item.kind === "mcq" ? { choice: choice ?? -1 } : {}),
        // Câu điền và bài viết dùng chung ô `text`. Thiếu "gap" ở đây từng làm
        // mọi câu điền bị chấm sai vì server không nhận được gì.
        ...(item.kind === "gap" || item.kind === "write" ? { text } : {}),
        ...(skip ? { skip: true } : {}),
      },
    );

    if (!result.ok) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    if (result.data.feedback) {
      // Dừng lại cho người học đọc lời giải thích, rồi mới sang câu sau.
      setFeedback(result.data.feedback);
      setPendingNext(result.data.item);
      setPendingDone(result.data.done);
      setBusy(false);
      return;
    }

    advance(result.data.item, result.data.done);
  }

  function advance(next: Item | null, done: boolean) {
    setFeedback(null);
    setChoice(null);
    setText("");
    setRecorded(false);
    setBusy(false);
    if (done || !next) {
      void finish();
      return;
    }
    setItem(next);
  }

  async function finish() {
    if (!sessionId) return;
    setPhase("finishing");
    const result = await apiPost("/api/xep-lop/ket-thuc", { sessionId });
    if (!result.ok) {
      setError(result.error.message);
      setPhase("question");
      return;
    }
    router.push("/hoc/ket-qua");
    router.refresh();
  }

  /* ------------------------------------------------------------ render */

  if (phase === "loading") {
    return (
      <p className="test-center">
        <span className="spinner" aria-hidden="true" /> Đang chuẩn bị bài kiểm tra…
      </p>
    );
  }

  if (phase === "finishing") {
    return (
      <p className="test-center">
        <span className="spinner" aria-hidden="true" /> Đang tính kết quả…
      </p>
    );
  }

  if (phase === "intro") {
    return (
      <div className="test-card test-intro">
        <span className="badge badge--lime">Khoảng 10–15 phút</span>
        <h1>Xem bạn đang ở đâu</h1>
        <p className="lede" style={{ fontSize: "var(--fs-md)" }}>
          Bốn phần, mỗi màn một câu. Sai cũng không sao — mục đích là tìm đúng điểm bắt đầu cho
          bạn, không phải chấm đỗ trượt.
        </p>

        <ol className="test-steps">
          <li>
            <strong>Đọc và cấu trúc</strong>
            <span>Câu ngắn và đoạn văn, từ dễ lên khó. Sai nhiều thì dừng sớm.</span>
          </li>
          <li>
            <strong>Nghe</strong>
            <span>Câu tiếng Đức được đọc lên. Nghe lại bao nhiêu lần cũng được.</span>
          </li>
          <li>
            <strong>Viết</strong>
            <span>Một đề ngắn, vừa đúng mức bạn vừa làm được ở phần Đọc.</span>
          </li>
          <li>
            <strong>Nói</strong>
            <span>Không bắt buộc. Bỏ qua được nếu hôm nay bạn không tiện nói.</span>
          </li>
        </ol>

        {!germanVoice && (
          <p className="test-note">
            Máy của bạn chưa có giọng đọc tiếng Đức, nên phần Nghe có thể không phát được. Bạn vẫn
            làm được các phần còn lại, và phần Nghe sẽ được ghi là chưa đánh giá.
          </p>
        )}

        {error && (
          <div className="alert alert--error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => setPhase("question")}
          disabled={!item}
        >
          Bắt đầu
        </button>
      </div>
    );
  }

  if (!item) return null;

  const percent = Math.min(100, Math.round(((item.index - 1) / Math.max(1, item.total)) * 100));
  const canSubmit =
    item.kind === "mcq"
      ? choice !== null
      : item.kind === "gap"
        ? text.trim().length > 0
        : item.kind === "write"
          ? text.trim().split(/\s+/).filter(Boolean).length >= 5
          : true;

  return (
    <div className="test-card">
      <div className="test-progress">
        <div className="test-progress__meta">
          <span className="badge">{SKILL_LABEL[item.skill] ?? item.skill}</span>
          <span className="badge badge--lime">{item.level}</span>
          <span className="test-progress__count">
            Câu {item.index} / khoảng {item.total}
          </span>
        </div>
        <span className="meter" role="img" aria-label={`Đã làm khoảng ${percent} phần trăm`}>
          <span style={{ width: `${percent}%` }} />
        </span>
      </div>

      {resumed && item.index > 1 && (
        <p className="test-note">Bạn đang tiếp tục bài làm dở trước đó.</p>
      )}

      {item.passage && (
        <blockquote className="test-passage" lang="de">
          {item.passage}
        </blockquote>
      )}

      {item.speakText && (
        <div className="test-audio">
          <div className="test-audio__buttons">
            <button
              type="button"
              className="btn btn--solid btn--sm"
              onClick={() => speak(item.speakText!)}
              disabled={!germanVoice}
            >
              ▶ Nghe
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => speak(item.speakText!, true)}
              disabled={!germanVoice}
            >
              Nghe chậm
            </button>
          </div>
          <p className="test-audio__note">
            {germanVoice
              ? "Đọc bằng giọng đọc sẵn có của trình duyệt. Nghe lại bao nhiêu lần cũng được."
              : "Máy của bạn chưa có giọng tiếng Đức nên không phát được câu này. Bạn bấm Bỏ qua để đi tiếp."}
          </p>
        </div>
      )}

      <h2 className="test-prompt" lang={item.kind === "mcq" && !item.passage && !item.speakText ? "de" : undefined}>
        {item.prompt}
      </h2>

      {item.kind === "mcq" && (
        <div className="test-options" role="radiogroup" aria-label="Chọn đáp án">
          {item.options?.map((option, i) => {
            const isChosen = choice === i;
            const state = feedback
              ? i === feedback.answer
                ? "right"
                : isChosen
                  ? "wrong"
                  : undefined
              : undefined;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isChosen}
                className="test-option"
                data-chosen={isChosen || undefined}
                data-state={state}
                disabled={Boolean(feedback) || busy}
                onClick={() => setChoice(i)}
              >
                <span className="test-option__key" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {item.kind === "gap" && (
        <div className="test-gap">
          <label htmlFor="test-gap-input">Điền vào chỗ trống</label>
          <input
            id="test-gap-input"
            lang="de"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={text}
            disabled={Boolean(feedback) || busy}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter là phím tự nhiên nhất ở một ô nhập một từ. Không gắn thì
              // người học phải rời tay khỏi bàn phím để bấm chuột mỗi câu.
              if (e.key === "Enter" && text.trim() && !feedback && !busy) submit(false);
            }}
            placeholder="Gõ từ cần điền…"
            data-state={feedback ? (feedback.correct ? "right" : "wrong") : undefined}
          />
          <span className="hint">
            Gợi ý: {item.hint}. Không có ký tự ß hay ä trên bàn phím cũng không sao — gõ ss, ae là
            được.
          </span>
        </div>
      )}

      {item.kind === "write" && (
        <div className="field">
          <label htmlFor="test-write">Bài viết của bạn (bằng tiếng Đức)</label>
          <textarea
            id="test-write"
            lang="de"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Viết ở đây…"
          />
          <span className="hint">
            {item.hint} · Đã viết {text.trim().split(/\s+/).filter(Boolean).length} từ
            {item.minWords ? `, nên có ít nhất ${item.minWords} từ` : ""}.
          </span>
        </div>
      )}

      {item.kind === "speak" && sessionId && (
        <div className="test-speak">
          <p>{item.hint}</p>

          <SpeakingRecorder
            sessionId={sessionId}
            code={item.code}
            onSaved={() => setRecorded(true)}
          />

          <p className="test-note" style={{ marginTop: "var(--s-5)" }}>
            Đoạn ghi âm được gửi thẳng lên máy chủ Lingora và không đi đâu khác. Hiện chưa có bộ
            phân tích giọng nói để chấm, nên kỹ năng Nói vẫn được ghi là <strong>chưa đánh giá
            được</strong> — chúng tôi giữ bản ghi làm bằng chứng thay vì đoán một mức điểm cho bạn.
          </p>
        </div>
      )}

      {feedback && (
        <div className={`test-feedback ${feedback.correct ? "is-right" : "is-wrong"}`} role="status">
          <strong>{feedback.correct ? "Đúng rồi." : "Chưa đúng."}</strong>
          {feedback.expected && !feedback.correct && (
            <p>
              Đáp án: <strong lang="de">{feedback.expected}</strong>
            </p>
          )}
          <p>{feedback.why}</p>
        </div>
      )}

      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="test-actions">
        {feedback ? (
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => advance(pendingNext, pendingDone)}
          >
            Câu tiếp theo
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => submit(false)}
              disabled={!canSubmit || busy}
            >
              {busy && <span className="spinner" aria-hidden="true" />}
              {item.kind === "speak" ? (recorded ? "Xong, đi tiếp" : "Tôi đã nói xong") : "Trả lời"}
            </button>
            {(item.kind === "speak" ||
              (item.speakText && !germanVoice) ||
              item.kind === "gap" ||
              item.kind === "write") && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => submit(true)}
                disabled={busy}
              >
                Bỏ qua phần này
              </button>
            )}
          </>
        )}
      </div>

      <p className="test-saved">
        Mỗi câu được lưu ngay khi bạn trả lời. Đóng tab giữa chừng cũng không mất bài.
      </p>
    </div>
  );
}
