"use client";

import { useState } from "react";
import { Field } from "@/components/Field";
import { apiPost } from "@/lib/api-client";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    await apiPost("/api/auth/quen-mat-khau", { email });
    // Endpoint luôn trả ok để không lộ email nào có tài khoản, nên giao diện
    // cũng chỉ nói một câu duy nhất cho cả hai trường hợp.
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="alert alert--success" role="status">
        <p>
          Nếu email này có tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu. Liên kết có hiệu
          lực 60 phút.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field
        label="Email"
        name="email"
        icon="mail"
        placeholder="tenban@email.com"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />
      <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang gửi…" : "Gửi liên kết đặt lại"}
      </button>
    </form>
  );
}
