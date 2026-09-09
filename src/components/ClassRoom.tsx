"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api-client";

type Correction = { wrong: string; right: string; why: string };

type Turn = {
  id: string;
  who: "anna" | "toi";
  de: string;
  vi?: string;
  correction?: Correction | null;
  hintVi?: string;
};

type StartData = {
  classSessionId: number;
  lesson: {
    code: string;
    level: string;
    title: string;
    situationVi: string;
    goalVi: string;
    focus: string[];
    published: boolean;
  };
  opener: { de: string; vi: string; audio: string | null };
  history: { role: "user" | "assistant"; content: string }[];
  engines: { llm: string; tts: string; stt: string };
};

/**
 * Phòng học nói.
 *
 * Vòng một lượt: người học BẤM GIỮ để nói (hoặc gõ), máy nghe ra chữ, người học
 * sửa lại chữ nếu máy nghe nhầm, gửi đi, Anna đáp bằng tiếng Đức có tiếng đọc
 * kèm nghĩa tiếng Việt và tối đa một lỗi được sửa.
 *
 * BƯỚC SỬA CHỮ TRƯỚC KHI GỬI là bước quan trọng nhất ở đây. Máy nghe người mới
 * học tiếng Đức sai khá thường xuyên; gửi thẳng thì Anna chữa một lỗi mà người
 * học không hề mắc, và họ mất niềm tin vào cả buổi học. Cho sửa thì lỗi của máy
 * dừng lại ở chỗ đó.
 *
 * Gõ tay luôn dùng được, kể cả khi không có micro hay engine nghe. Không ai bị
 * chặn khỏi buổi học chỉ vì cái máy.
 */
export function ClassRoom({ code }: { code: string }) {
  const [data, setData] = useState<StartData | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "listening" | "thinking" | "error">(
    "loading",
  );
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const startedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const play = useCallback((src: string | null) => {
    if (!src) return;
    const el = audioRef.current ?? new Audio();
    audioRef.current = el;
    el.src = src;
    void el.play().catch(() => undefined);
  }, []);

  /* ------------------------------------------------------------ mở lớp */

  const open = useCallback(async () => {
    const res = await apiPost<StartData>("/api/lop-hoc/bat-dau", { lesson: code });
    if (!res.ok) {
      setError(res.error.message);
      setState("error");
      return;
    }
    setData(res.data);
    setTurns([
      ...res.data.history.slice(0, -1).map((h, i) => ({
        id: `cu-${i}`,
        who: h.role === "assistant" ? ("anna" as const) : ("toi" as const),
        de: h.content,
      })),
      {
        id: "mo-loi",
        who: "anna",
        de: res.data.opener.de,
        vi: res.data.opener.vi,
      },
    ]);
    setState("ready");
    play(res.data.opener.audio);
  }, [code, play]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Hàm async chỉ khởi động một request rồi trả về; setState nằm sau await.
    void open();
  }, [open]);

  // Cuộn xuống lượt mới nhất. Không cuộn thì câu trả lời của Anna nằm dưới màn
  // hình và người học tưởng chưa có gì xảy ra.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ---------------------------------------------------------- ghi âm */

  async function startRecording() {
    setError(null);
    setNote(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        void transcribe(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Không mở được micro. Bạn gõ câu tiếng Đức của mình cũng được.");
    }
  }

  function stopRecording() {
    if (tickRef.current) clearInterval(tickRef.current);
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function transcribe(blob: Blob) {
    setState("listening");
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const res = await fetch(`/api/lop-hoc/nghe-toi?ext=${ext}`, {
      method: "POST",
      headers: { "content-type": blob.type || "audio/webm" },
      body: blob,
    });
    const body = (await res.json().catch(() => null)) as
      | { text?: string; error?: { message?: string } }
      | null;

    setState("ready");
    if (!res.ok || !body?.text) {
      setNote(body?.error?.message ?? "Chưa nghe được. Bạn gõ lại câu vừa nói nhé.");
      return;
    }
    // Không gửi thẳng: đưa vào ô soạn để người học đọc lại và sửa nếu máy nghe
    // nhầm - xem ghi chú ở đầu tệp.
    setDraft(body.text);
    setNote("Máy nghe được như trên. Sửa lại nếu chưa đúng rồi gửi.");
  }

  /* ------------------------------------------------------------ lượt */

  async function send() {
    const said = draft.trim();
    if (!said || !data) return;
    setDraft("");
    setNote(null);
    setError(null);
    setTurns((t) => [...t, { id: `toi-${Date.now()}`, who: "toi", de: said }]);
    setState("thinking");

    const res = await apiPost<{
      turn: { replyDe: string; glossVi: string; correction: Correction | null; hintVi: string };
      audio: string | null;
    }>("/api/lop-hoc/luot", {
      classSessionId: data.classSessionId,
      lesson: data.lesson.code,
      said,
    });

    if (!res.ok) {
      setError(res.error.message);
      setState("ready");
      return;
    }

    setTurns((t) => [
      ...t,
      {
        id: `anna-${Date.now()}`,
        who: "anna",
        de: res.data.turn.replyDe,
        vi: res.data.turn.glossVi,
        correction: res.data.turn.correction,
        hintVi: res.data.turn.hintVi,
      },
    ]);
    setState("ready");
    play(res.data.audio);
  }

  /* ---------------------------------------------------------- render */

  if (state === "loading") {
    return (
      <p className="test-center">
        <span className="spinner" aria-hidden="true" /> Đang mở lớp…
      </p>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="alert alert--error" role="alert">
        <p>{error ?? "Không mở được lớp học."}</p>
      </div>
    );
  }

  const llmOff = data.engines.llm !== "live";

  return (
    <div className="lop">
      <header className="lop__head">
        <div>
          <span className="badge badge--gold">{data.lesson.level}</span>{" "}
          <span className="badge">{data.lesson.code}</span>
          <h1>{data.lesson.title}</h1>
          <p className="lop__situation">{data.lesson.situationVi}</p>
        </div>
        <p className="lop__goal">
          <strong>Hết buổi bạn làm được:</strong> {data.lesson.goalVi}
        </p>
      </header>

      {!data.lesson.published && (
        <p className="note-quiet">
          Bài này đang ở bản nháp, chưa qua duyệt nội dung. Bạn đang xem với quyền biên tập.
        </p>
      )}

      {llmOff && (
        <div className="alert" role="status">
          <p>
            Lớp học nói chưa mở trên bản cài này: máy chủ giảng dạy chưa được bật. Bạn vẫn xem được
            bài và câu mở lời, nhưng chưa có câu trả lời của giáo viên.
          </p>
        </div>
      )}

      <div className="lop__stream">
        {turns.map((t) => (
          <article key={t.id} className="lop-turn" data-who={t.who}>
            <p className="lop-turn__de" lang="de">
              {t.de}
            </p>
            {t.vi && <p className="lop-turn__vi">{t.vi}</p>}

            {t.correction && (
              <div className="lop-turn__fix">
                <p>
                  <s lang="de">{t.correction.wrong}</s> → <strong lang="de">{t.correction.right}</strong>
                </p>
                {t.correction.why && <p className="lop-turn__why">{t.correction.why}</p>}
              </div>
            )}

            {t.hintVi && <p className="lop-turn__hint">{t.hintVi}</p>}
          </article>
        ))}

        {state === "thinking" && (
          <p className="lop__typing" aria-live="polite">
            <span className="spinner" aria-hidden="true" /> Anna đang nghĩ…
          </p>
        )}
        {state === "listening" && (
          <p className="lop__typing" aria-live="polite">
            <span className="spinner" aria-hidden="true" /> Đang nghe lại câu bạn vừa nói…
          </p>
        )}
        <div ref={endRef} />
      </div>

      {note && <p className="lop__note">{note}</p>}
      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="lop__bar">
        <button
          type="button"
          className={`lop__mic${recording ? " is-on" : ""}`}
          onPointerDown={() => void startRecording()}
          onPointerUp={stopRecording}
          onPointerLeave={() => recording && stopRecording()}
          disabled={state === "thinking" || state === "listening"}
          aria-label={recording ? "Thả ra để gửi" : "Bấm giữ để nói"}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
          </svg>
          {recording ? `${seconds}s — thả ra` : "Bấm giữ để nói"}
        </button>

        <div className="lop__type">
          <input
            lang="de"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim() && state === "ready") void send();
            }}
            placeholder="…hoặc gõ câu tiếng Đức của bạn"
            disabled={state === "thinking"}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void send()}
            disabled={!draft.trim() || state !== "ready"}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
