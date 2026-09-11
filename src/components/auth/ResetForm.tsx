"use client";

import Link from "next/link";
import { useState } from "react";
import { Field } from "@/components/Field";
import { apiPost, type ApiError } from "@/lib/api-client";

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  if (!token) {
    return (
      <div className="alert alert--error" role="alert">
        <p>
          Liên kết thiếu mã đặt lại. Hãy mở lại liên kết trong email, hoặc{" "}
          <Link href="/quen-mat-khau">yêu cầu liên kết mới</Link>.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="alert alert--success" role="status">
        <p>
          Đã đổi mật khẩu. Mọi thiết bị đang đăng nhập đã bị đăng xuất.{" "}
          <Link href="/dang-nhap">Đăng nhập lại</Link>.
        </p>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await apiPost("/api/auth/dat-lai-mat-khau", { token, password });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error.message}</p>
        </div>
      )}
      <Field
        label="Mật khẩu mới"
        name="password"
        icon="lock"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="new-password"
        hint="Ít nhất 10 ký tự."
        error={error?.fields?.password}
      />
      <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang lưu…" : "Đặt mật khẩu mới"}
      </button>
    </form>
  );
}
