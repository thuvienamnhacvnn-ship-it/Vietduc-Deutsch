"use client";

import Link from "next/link";
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
        icon="mail"
        placeholder="tenban@email.com"
      />

      <Field
        label="Mật khẩu"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="current-password"
        icon="lock"
        placeholder="Nhập mật khẩu"
      />

      <p className="auth-form__forgot">
        <Link href="/quen-mat-khau">Quên mật khẩu?</Link>
      </p>

      <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        {!busy && (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  );
}
