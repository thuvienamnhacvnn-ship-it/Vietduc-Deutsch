"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/Field";
import { apiPost, type ApiError } from "@/lib/api-client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await apiPost<{ role: string }>("/api/auth/dang-nhap", { email, password });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // Nhân viên vào thẳng cổng quản trị, trừ khi họ đến từ một đường dẫn cụ thể.
    const staff = ["admin", "editor", "support"].includes(result.data.role);
    router.push(next !== "/hoc" ? next : staff ? "/quan-tri" : "/hoc");
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error.message}</p>
        </div>
      )}

      <Field
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />

      <Field
        label="Mật khẩu"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="current-password"
      />

      <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
