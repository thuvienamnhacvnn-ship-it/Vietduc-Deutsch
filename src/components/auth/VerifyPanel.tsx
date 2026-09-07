"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/api-client";

type State = "idle" | "working" | "done" | "failed";

/**
 * Xác minh email. Token đến qua query string, nên việc xác minh chạy ngay khi
 * mở trang - không bắt người dùng bấm thêm một nút nữa.
 *
 * Ref `started` chặn lần gọi thứ hai của React Strict Mode trong dev: token dùng
 * một lần, lần gọi thứ hai sẽ luôn thất bại và hiện lỗi sai sự thật.
 */
export function VerifyPanel({ token }: { token: string }) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    setState("working");
    apiPost("/api/auth/xac-minh", { token }).then((result) => {
      if (result.ok) {
        setState("done");
      } else {
        setState("failed");
        setMessage(result.error.message);
      }
    });
  }, [token]);

  if (!token) {
    return (
      <div className="alert alert--warning">
        <p>
          Liên kết thiếu mã xác minh. Hãy mở lại liên kết trong email xác minh mà chúng tôi đã gửi.
        </p>
      </div>
    );
  }

  if (state === "working" || state === "idle") {
    return (
      <p>
        <span className="spinner" aria-hidden="true" /> Đang xác minh…
      </p>
    );
  }

  if (state === "done") {
    return (
      <div className="alert alert--success" role="status">
        <p>
          Email đã được xác minh. <Link href="/hoc">Vào khu học</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="alert alert--error" role="alert">
      <p>{message}</p>
      <p>
        Bạn có thể <Link href="/dang-nhap">đăng nhập</Link> rồi yêu cầu gửi lại liên kết xác minh.
      </p>
    </div>
  );
}
