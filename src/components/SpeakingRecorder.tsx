"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "asking" | "recording" | "recorded" | "uploading" | "saved" | "denied" | "unsupported";

/**
 * Ghi âm bài Nói bằng chính trình duyệt.
 *
 * Đây là phần kỹ năng Nói chạy được ngay hôm nay: MediaRecorder có sẵn trong
 * trình duyệt, không cần dịch vụ ngoài nào. Âm thanh được gửi thẳng lên server
 * của Lingora và không đi đâu khác.
 *
 * Quyền micro chỉ được xin khi người học BẤM nút ghi, không phải lúc mở trang.
 * Xin quyền trước khi người ta hiểu mình sắp làm gì là cách nhanh nhất để bị từ
 * chối vĩnh viễn.
 */
export function SpeakingRecorder({
  sessionId,
  code,
  onSaved,
}: {
  sessionId: number;
  code: string;
  onSaved: () => void;
}) {
  /**
   * Trạng thái ban đầu tính ngay lúc dựng, không phải trong useEffect: nếu đặt
   * bằng effect thì màn hình vẽ ra nút ghi âm trước rồi mới đổi sang thông báo
   * không hỗ trợ, và người dùng kịp bấm vào một nút không làm gì.
   *
   * Hàm khởi tạo chạy cả trên server, nơi không có `navigator` - trả về "idle"
   * ở đó và để lần vẽ đầu ở trình duyệt quyết định.
   */
  const [state, setState] = useState<State>(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") return "idle";
    const canRecord =
      Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    return canRecord ? "idle" : "unsupported";
  });
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dọn sạch khi rời màn hình: microphone phải tắt, và URL xem trước phải được
  // thu hồi, nếu không đèn mic vẫn sáng sau khi người học đã đi chỗ khác.
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function start() {
    setError(null);
    setState("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Để trình duyệt tự chọn định dạng nó hỗ trợ; Safari và Chrome khác nhau.
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setState("recorded");
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setState("recording");

      tickRef.current = setInterval(() => {
        setSeconds((s) => {
          // Dừng cứng ở 90 giây: đủ dài cho một bài tự giới thiệu, và giữ tệp
          // trong giới hạn kích thước của server.
          if (s + 1 >= 90) stop();
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      const name = (err as Error).name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setState("denied");
      } else {
        setState("idle");
        setError("Không mở được micro. Kiểm tra xem thiết bị khác có đang dùng micro không.");
      }
    }
  }

  function stop() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setSeconds(0);
    setState("idle");
  }

  async function upload() {
    if (!blobRef.current) return;
    setState("uploading");
    setError(null);

    const form = new FormData();
    form.set("audio", blobRef.current, "bai-noi.webm");
    form.set("sessionId", String(sessionId));
    form.set("code", code);
    form.set("seconds", String(seconds));

    try {
      const response = await fetch("/api/xep-lop/ghi-am", { method: "POST", body: form });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Chưa gửi được đoạn ghi âm.");
        setState("recorded");
        return;
      }
      setState("saved");
      onSaved();
    } catch {
      setError("Mất kết nối khi gửi đoạn ghi âm. Bạn thử lại giúp nhé.");
      setState("recorded");
    }
  }

  if (state === "unsupported") {
    return (
      <p className="test-note">
        Trình duyệt này không ghi âm được. Bạn bỏ qua phần Nói cũng không sao — kỹ năng Nói sẽ được
        ghi là chưa đánh giá được.
      </p>
    );
  }

  if (state === "denied") {
    return (
      <div className="test-note">
        <p style={{ margin: 0 }}>
          Trình duyệt đã chặn micro. Bấm vào biểu tượng ổ khoá cạnh thanh địa chỉ để cho phép, rồi
          thử lại. Hoặc bỏ qua phần này.
        </p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => setState("idle")} style={{ marginTop: "var(--s-3)" }}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="recorder">
      {state === "recording" ? (
        <div className="recorder__live">
          <span className="recorder__dot" aria-hidden="true" />
          <span className="recorder__time">{formatTime(seconds)}</span>
          <span className="recorder__hint">Đang ghi… tối đa 90 giây</span>
          <button type="button" className="btn btn--solid" onClick={stop}>
            Dừng ghi
          </button>
        </div>
      ) : state === "recorded" || state === "uploading" ? (
        <div className="recorder__done">
          <p className="recorder__time">Đã ghi {formatTime(seconds)}</p>
          {previewUrl && <audio src={previewUrl} controls preload="metadata" />}
          <div className="recorder__buttons">
            <button
              type="button"
              className="btn btn--primary"
              onClick={upload}
              disabled={state === "uploading"}
            >
              {state === "uploading" && <span className="spinner" aria-hidden="true" />}
              {state === "uploading" ? "Đang gửi…" : "Gửi bài nói"}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={reset}
              disabled={state === "uploading"}
            >
              Ghi lại
            </button>
          </div>
        </div>
      ) : state === "saved" ? (
        <p className="recorder__saved" role="status">
          Đã lưu đoạn ghi âm {formatTime(seconds)}.
        </p>
      ) : (
        <button
          type="button"
          className="btn btn--solid btn--block"
          onClick={start}
          disabled={state === "asking"}
        >
          {state === "asking" ? "Đang xin quyền micro…" : "● Bắt đầu ghi âm"}
        </button>
      )}

      {error && (
        <div className="alert alert--error" role="alert" style={{ marginTop: "var(--s-4)" }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
