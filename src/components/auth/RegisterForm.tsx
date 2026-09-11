"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/Field";
import { apiPost, type ApiError } from "@/lib/api-client";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingContact, setMarketingContact] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await apiPost("/api/auth/dang-ky", {
      name,
      email,
      password,
      acceptTerms,
      marketingContact,
    });

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // Đăng ký xong là đã có phiên; đưa thẳng vào khu học thay vì bắt đăng nhập lại.
    router.push(next);
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
        label="Tên của bạn"
        name="name"
        icon="user"
        value={name}
        onChange={setName}
        required
        autoComplete="name"
        error={error?.fields?.name}
        hint="Anna sẽ gọi bạn bằng tên này trong lớp."
      />

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
        error={error?.fields?.email}
      />

      <Field
        label="Mật khẩu"
        name="password"
        icon="lock"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="new-password"
        error={error?.fields?.password}
        hint="Ít nhất 10 ký tự. Một câu ngắn dễ nhớ thường an toàn hơn một chuỗi ký tự lộn xộn."
      />

      <label className="check">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          required
        />
        <span>
          Tôi đồng ý với <Link href="/dieu-khoan">Điều khoản sử dụng</Link> và{" "}
          <Link href="/rieng-tu">chính sách riêng tư</Link>.
        </span>
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={marketingContact}
          onChange={(e) => setMarketingContact(e.target.checked)}
        />
        <span>
          Việt Đức được liên hệ riêng với tôi về lộ trình học. Không bắt buộc, bỏ chọn lúc nào cũng
          được.
        </span>
      </label>

      <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </button>
    </form>
  );
}
