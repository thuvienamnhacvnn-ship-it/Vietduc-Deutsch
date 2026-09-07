"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api-client";

export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");

  if (state === "sent") {
    return (
      <p style={{ marginBottom: 0 }} role="status">
        Đã gửi lại liên kết xác minh tới {email}.
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn--secondary btn--sm"
      disabled={state === "busy"}
      onClick={async () => {
        setState("busy");
        await apiPost("/api/auth/gui-lai-xac-minh", { email });
        setState("sent");
      }}
    >
      {state === "busy" && <span className="spinner" aria-hidden="true" />}
      {state === "busy" ? "Đang gửi…" : "Gửi lại liên kết xác minh"}
    </button>
  );
}
