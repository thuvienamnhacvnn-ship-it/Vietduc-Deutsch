"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { SpeakingRecorder } from "@/components/SpeakingRecorder";
import {
  HONESTY_PLEDGE,
  LEARNER_RIGHTS,
  LISTEN_LIMIT,
  PREP_SECONDS,
  SECTIONS,
  SECTION_MINUTES,
} from "@/content/quy-che-thi";

type Item = {
  code: string;
  kind: "mcq" | "gap" | "write" | "speak";
  level: "A1" | "A2" | "B1" | "B2";
  skill: string;
  prompt: string;
  passage?: string;
  options?: string[];
  hint?: string;
  minWords?: number;
  /** Câu này có phần nghe. Chữ tiếng Đức KHÔNG nằm ở đây. */
  needsAudio?: boolean;
  /** Số lượt nghe còn lại, do server cấp. */
  listensLeft?: number;
  index: number;
  total: number;
};

type Feedback = {
  correct: boolean;
  answer: number | null;
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
 * QUY CHẾ được THI HÀNH ở đây, không chỉ được trưng bày:
 *
 *  - Bài chỉ bắt đầu sau khi người học ký cam kết trung thực; server từ chối
 *    tạo phiên nếu chưa có cam kết.
 *  - Câu tiếng Đức của phần Nghe KHÔNG nằm trong dữ liệu câu hỏi. Mỗi lần nghe
 *    là một request tới server và server đếm. Nghe chậm cũng tính một lượt.
 *  - Thời gian làm từng câu do server đo từ lúc phát câu ra, không tin đồng hồ
 *    của client.
 *
 * Một câu một màn: người học ở mức A1 nhìn thấy hai mươi câu tiếng Đức cùng lúc
 * thì bỏ ngay.
 */
export function PlacementTest({ hasOpenSession }: { hasOpenSession: boolean }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Chưa có bài đang dở thì quy chế hiện ngay ở lần vẽ đầu, không qua vòng xoay:
  // đây là màn hình đầu tiên người vừa đăng ký nhìn thấy.
  const [phase, setPhase] = useState<"loading" | "intro" | "question" | "finishing">(
    hasOpenSession ? "loading" : "intro",
  );
  const [resumed, setResumed] = useState(false);
  const [pledged, setPledged] = useState(false);
  const [germanVoice, setGermanVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [listensLeft, setListensLeft] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pendingNext, setPendingNext] = useState<Item | null>(null);
  const [pendingDone, setPendingDone] = useState(false);
  // Người học bấm "tôi dừng ở đây": hỏi lại một lần rồi mới nộp. Dừng bài là
  // việc không lùi lại được, nhưng cũng không được giấu đi - xem ghi chú ở chỗ
  // vẽ nút.
  const [askStop, setAskStop] = useState(false);
  const startedRef = useRef(false);
  // Một thẻ <audio> duy nhất, tạo một lần rồi dùng lại. Tạo thẻ mới mỗi lần
  // phát thì Safari trên iPhone coi lần phát thứ hai là "không do người dùng
  // bấm" và chặn im lặng.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Engine của trường đang đọc, hay giọng máy của trình duyệt. Quyết định câu
  // giải thích dưới hai nút nghe.
  const [voiceSource, setVoiceSource] = useState<"engine" | "trinh-duyet" | null>(null);
  /**
   * Số giây chuẩn bị còn lại, hoặc null khi câu này không cần chuẩn bị.
   *
   * Có bước này vì kỳ thi thật không bật băng lúc thí sinh vừa lật trang. Bỏ nó
   * đi thì đề đo tốc độ phản xạ với một giao diện lạ, không đo tiếng Đức.
   */
  const [prepLeft, setPrepLeft] = useState<number | null>(null);
  const autoPlayedRef = useRef<string | null>(null);

  /* --------------------------------------------------------- giọng đọc */

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
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

  /**
   * Xin một lượt nghe rồi phát. Chữ tiếng Đức chỉ đến từ server và chỉ đến đúng
   * số lần quy chế cho phép - đó là điều làm cho giới hạn có hiệu lực thật.
   */
  const playAudio = useCallback(
    async (slow: boolean) => {
      if (!sessionId || !item) return;
      setPlaying(true);
      setError(null);

      const result = await apiPost<{
        text?: string;
        audio?: string;
        voice?: "engine" | "trinh-duyet";
        listensLeft: number;
      }>("/api/xep-lop/nghe", {
        sessionId,
        code: item.code,
        slow,
      });

      if (!result.ok) {
        setError(result.error.message);
        if (result.error.code === "listen_limit") setListensLeft(0);
        setPlaying(false);
        return;
      }

      setListensLeft(result.data.listensLeft);
      setVoiceSource(result.data.voice ?? null);

      // Ưu tiên âm thanh thật do engine của trường đọc.
      if (result.data.audio) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        const el = audioRef.current ?? new Audio();
        audioRef.current = el;
        el.src = result.data.audio;
        // Nghe chậm phát ở 0.75 tốc độ. Đây là chỗ đọc chậm KHÔNG méo giọng:
        // trình phát giữ nguyên cao độ, khác hẳn giọng máy đọc chậm nghe như
        // băng rè.
        el.playbackRate = slow ? 0.75 : 1;
        el.onended = () => setPlaying(false);
        el.onerror = () => setPlaying(false);
        void el.play().catch(() => setPlaying(false));
        return;
      }

      // Không có engine: rơi về giọng đọc sẵn của trình duyệt.
      if (!result.data.text || !germanVoice) {
        setPlaying(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.data.text);
      utterance.voice = germanVoice;
      utterance.lang = germanVoice.lang || "de-DE";
      utterance.rate = slow ? 0.7 : 0.92;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    },
    [sessionId, item, germanVoice],
  );

  /* ----------------------------------------------------------- bắt đầu */

  const load = useCallback(async (pledge: boolean) => {
    const result = await apiPost<{
      sessionId: number;
      item: Item | null;
      done: boolean;
      resumed: boolean;
    }>("/api/xep-lop/bat-dau", pledge ? { pledge: true } : {});

    if (!result.ok) {
      // Chưa ký cam kết là trạng thái bình thường của người mới, không phải lỗi.
      if (result.error.code === "pledge_required") {
        setPhase("intro");
        return;
      }
      setError(result.error.message);
      setPhase("intro");
      return;
    }

    setSessionId(result.data.sessionId);
    setResumed(result.data.resumed);
    setItem(result.data.item);
    setListensLeft(result.data.item?.listensLeft ?? null);
    setPhase("question");
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Không có bài dở thì không cần hỏi server: cứ hiện quy chế và chờ người
    // học ký cam kết.
    //
    // `load` là hàm async - nó chỉ khởi động một request rồi trả về ngay, và
    // setState nằm sau `await` chứ không chạy đồng bộ trong thân effect. Đây
    // đúng là việc effect sinh ra để làm: đồng bộ với một hệ thống bên ngoài.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasOpenSession) void load(false);
  }, [load, hasOpenSession]);

  /*
   * ĐỒNG HỒ CHUẨN BỊ.
   *
   * Câu Nghe: người học được đọc câu hỏi và bốn phương án trước, rồi đoạn nghe
   * mới phát. Câu Nói: được đọc đề và nghĩ ý trước khi micro mở.
   *
   * Trước đây phần Nghe tự phát sau 400 mili giây - tức là bật băng ngay lúc
   * người ta còn chưa kịp đọc xem câu hỏi hỏi gì. Nghe hụt một lần là mất một
   * lượt trong hai lượt được nghe.
   *
   * Đồng hồ chỉ đặt MỘT lần cho mỗi câu; `autoPlayedRef` giữ mã câu đã đặt để
   * việc vẽ lại màn hình không làm đồng hồ chạy lại từ đầu.
   */
  useEffect(() => {
    if (phase !== "question" || !item) return;
    if (autoPlayedRef.current === item.code) return;

    const giay =
      item.needsAudio && (item.listensLeft ?? 0) > 0
        ? PREP_SECONDS.listening
        : item.kind === "speak"
          ? PREP_SECONDS.speaking
          : null;

    autoPlayedRef.current = item.code;
    setPrepLeft(giay);
  }, [item, phase]);

  // Đếm lùi từng giây. Hết giờ: câu Nghe tự phát, câu Nói mở micro.
  useEffect(() => {
    if (prepLeft === null || prepLeft <= 0) return;
    const timer = setTimeout(() => setPrepLeft((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(timer);
  }, [prepLeft]);

  useEffect(() => {
    if (prepLeft !== 0 || !item?.needsAudio) return;
    const timer = setTimeout(() => void playAudio(false), 200);
    return () => clearTimeout(timer);
  }, [prepLeft, item, playAudio]);

  /* ------------------------------------------------------------ gửi bài */

  async function submit(skip = false) {
    if (!sessionId || !item) return;
    setBusy(true);
    setError(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const result = await apiPost<{ feedback: Feedback; item: Item | null; done: boolean }>(
      "/api/xep-lop/tra-loi",
      {
        sessionId,
        code: item.code,
        ...(item.kind === "mcq" ? { choice: choice ?? -1 } : {}),
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
    setBusy(false);
    if (done || !next) {
      void finish();
      return;
    }
    setItem(next);
    setListensLeft(next.listensLeft ?? null);
  }

  /**
   * Nộp bài. `stop` là người học tự dừng giữa chừng: phần đã làm vẫn được chấm
   * và vẫn ra một khoá học, chỉ là kết quả được ghi rõ là bài dừng sớm.
   */
  async function finish(stop = false) {
    if (!sessionId) return;
    setPhase("finishing");
    const result = await apiPost("/api/xep-lop/ket-thuc", {
      sessionId,
      ...(stop ? { stop: true } : {}),
    });
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
    const totalMinutes = Object.values(SECTION_MINUTES).reduce((a, b) => a + b, 0);
    return (
      <div className="test-card test-intro">
        <span className="badge badge--gold">Khoảng {totalMinutes} phút</span>
        <h1>Quy chế bài kiểm tra xếp lớp</h1>
        <p className="lede" style={{ fontSize: "var(--fs-md)" }}>
          Đọc kỹ trước khi bắt đầu. Kết quả này dùng để xếp bạn vào đúng cấp độ, nên điều kiện làm
          bài quyết định kết quả có dùng được hay không.
        </p>

        <ol className="test-steps">
          {SECTIONS.map((section) => (
            <li key={section.skill}>
              <strong>
                {section.title} · khoảng {SECTION_MINUTES[section.skill]} phút
              </strong>
              <span>
                {section.what}
                <ul className="test-rules">
                  {section.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </span>
            </li>
          ))}
        </ol>

        {/* Quyền đứng TRƯỚC cam kết. Người sắp làm bài cần biết mình được
            dừng lúc nào cũng được - đó là thứ quyết định họ có bấm bắt đầu hay
            không, chứ không phải danh sách nghĩa vụ. */}
        <div className="test-rights">
          <h2>Bạn được quyền</h2>
          <ul>
            {LEARNER_RIGHTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="test-pledge">
          <h2>Cam kết của bạn</h2>
          <ul>
            {HONESTY_PLEDGE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <label className="check">
            <input
              type="checkbox"
              checked={pledged}
              onChange={(event) => setPledged(event.target.checked)}
            />
            <span>Tôi đã đọc quy chế và cam kết làm bài trung thực.</span>
          </label>
        </div>

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
          disabled={!pledged || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            await load(true);
            setBusy(false);
          }}
        >
          {busy && <span className="spinner" aria-hidden="true" />}
          Tôi cam kết và bắt đầu làm bài
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

  const outOfListens = Boolean(item.needsAudio && listensLeft !== null && listensLeft <= 0);
  /*
   * Không nghe được BẰNG CÁCH NÀO CẢ: không có engine của trường mà máy cũng
   * không có giọng tiếng Đức.
   *
   * Chỉ biết chắc điều này sau lần phát đầu tiên - trước đó `voiceSource` còn
   * null. Nên trước lần phát đầu, nút luôn mở: khoá sẵn nút chỉ vì trình duyệt
   * thiếu giọng thì người có engine cũng không bấm được.
   */
  const noVoiceAtAll = voiceSource === "trinh-duyet" && !germanVoice;
  /** Còn đang trong thời gian chuẩn bị của chính câu này. */
  const dangChuanBi = prepLeft !== null && prepLeft > 0;

  return (
    <div className="test-card">
      <div className="test-progress">
        <div className="test-progress__meta">
          <span className="badge">{SKILL_LABEL[item.skill] ?? item.skill}</span>
          <span className="badge badge--gold">{item.level}</span>
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

      {/*
        Khối chuẩn bị. Nó nằm TRƯỚC phần nghe và trước đề nói, vì đó đúng là thứ
        tự việc: đọc trước, rồi mới nghe hoặc nói.
      */}
      {dangChuanBi && (
        <div className="test-prep" role="status" aria-live="polite">
          <div>
            <strong>
              {item.needsAudio
                ? "Đọc câu hỏi trước đã"
                : "Đọc đề và nghĩ trước khi nói"}
            </strong>
            <p>
              {item.needsAudio
                ? "Đoạn nghe sẽ phát khi hết giờ chuẩn bị. Đọc xong sớm thì bấm phát luôn."
                : "Micro mở khi hết giờ chuẩn bị. Sẵn sàng sớm thì bấm vào đây."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setPrepLeft(0)}
          >
            {item.needsAudio ? `Phát ngay (${prepLeft}s)` : `Tôi sẵn sàng (${prepLeft}s)`}
          </button>
        </div>
      )}

      {item.needsAudio && (
        <div className="test-audio">
          <div className="test-audio__buttons">
            <button
              type="button"
              className="btn btn--solid btn--sm"
              onClick={() => void playAudio(false)}
              disabled={noVoiceAtAll || dangChuanBi || playing || outOfListens || Boolean(feedback)}
            >
              {playing ? "Đang phát…" : "▶ Nghe"}
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => void playAudio(true)}
              disabled={noVoiceAtAll || dangChuanBi || playing || outOfListens || Boolean(feedback)}
            >
              Nghe chậm
            </button>
            {listensLeft !== null && (
              <span className="test-audio__count" aria-live="polite">
                Còn <strong>{listensLeft}</strong>/{LISTEN_LIMIT[item.level]} lượt nghe
              </span>
            )}
          </div>
          <p className="test-audio__note">
            {noVoiceAtAll
              ? "Máy của bạn chưa có giọng tiếng Đức nên không phát được câu này. Bấm Bỏ qua để đi tiếp; câu bỏ qua không bị tính là sai."
              : outOfListens
                ? "Đã hết lượt nghe. Hãy trả lời theo những gì bạn nghe được — đó chính là điều bài kiểm tra muốn đo."
                : voiceSource === "trinh-duyet"
                  ? "Nghe chậm cũng tính là một lượt. Câu này đang đọc bằng giọng máy sẵn có của trình duyệt."
                  : "Nghe chậm cũng tính là một lượt."}
          </p>
        </div>
      )}

      <h2
        className="test-prompt"
        lang={item.kind === "mcq" && !item.passage && !item.needsAudio ? "de" : undefined}
      >
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

          {/* Máy ghi âm chỉ xuất hiện sau thời gian chuẩn bị: thấy nút ghi là
              tay tự bấm, rồi mới nhận ra mình chưa nghĩ xong. */}
          {dangChuanBi ? (
            <p className="test-note">Đang trong thời gian chuẩn bị. Micro sẽ mở sau {prepLeft} giây.</p>
          ) : (
            <SpeakingRecorder sessionId={sessionId} code={item.code} onSaved={() => undefined} />
          )}

          <p className="test-note" style={{ marginTop: "var(--s-5)" }}>
            Đoạn ghi âm được gửi thẳng lên máy chủ Việt Đức và không đi đâu khác. Hiện chưa có bộ
            phân tích giọng nói để chấm, nên kỹ năng Nói vẫn được ghi là{" "}
            <strong>chưa đánh giá được</strong> — chúng tôi giữ bản ghi làm bằng chứng thay vì đoán
            một mức điểm cho bạn.
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
              {item.kind === "speak" ? "Tôi đã nói xong" : "Trả lời"}
            </button>
            {(item.kind === "speak" ||
              (item.needsAudio && !germanVoice) ||
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

      {/*
        Lối ra danh dự.

        Người học đuối sức mà không có nút dừng thì họ vẫn dừng - bằng cách đóng
        tab, và khi đó họ không nhận được gì cả. Cho dừng đàng hoàng thì phần đã
        làm vẫn thành một kết quả và một khoá học để bắt đầu, còn hệ thống thì
        biết bài này dừng sớm nên độ tin cậy thấp hơn.
      */}
      {askStop ? (
        <div className="test-stop" role="group" aria-label="Dừng bài kiểm tra">
          <strong>Dừng ở đây và xem kết quả?</strong>
          <p>
            Những câu bạn đã làm vẫn được chấm và bạn vẫn nhận được khoá học phù hợp. Kết quả sẽ
            được ghi là bài dừng sớm, và bạn làm lại lúc nào cũng được.
          </p>
          <div className="test-stop__row">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => void finish(true)}
              disabled={busy}
            >
              Dừng và xem kết quả
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setAskStop(false)}
              disabled={busy}
            >
              Làm tiếp
            </button>
          </div>
        </div>
      ) : (
        item.index > 1 && (
          <button type="button" className="test-stop__open" onClick={() => setAskStop(true)}>
            Tôi dừng ở đây
          </button>
        )
      )}

      <p className="test-saved">
        Mỗi câu được lưu ngay khi bạn trả lời. Đóng tab giữa chừng cũng không mất bài.
      </p>
    </div>
  );
}
