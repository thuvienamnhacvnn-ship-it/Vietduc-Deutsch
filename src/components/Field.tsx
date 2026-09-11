"use client";

import { useId, useState } from "react";

type FieldIcon = "mail" | "lock" | "user";

/**
 * Ô nhập liệu. Nhãn, gợi ý và lỗi luôn được nối vào input qua `aria-describedby`
 * - trình đọc màn hình đọc được lý do một ô bị đỏ, không chỉ nhìn thấy màu.
 *
 * Ô mật khẩu tự có nút ẩn/hiện: người học gõ trên điện thoại hay gõ nhầm, và
 * không nhìn thấy mình gõ gì là lý do số một của "sai mật khẩu".
 */
export function Field({
  label,
  hint,
  error,
  type = "text",
  name,
  value,
  onChange,
  required,
  autoComplete,
  disabled,
  icon,
  placeholder,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  type?: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  /** Biểu tượng nhỏ trong ô, theo bản thiết kế. Chỉ trang trí. */
  icon?: FieldIcon;
  placeholder?: string;
  /** Cho phép thay input bằng select hoặc textarea mà vẫn giữ nguyên khung. */
  children?: React.ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ");
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field" data-invalid={error ? "true" : undefined}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "var(--danger)" }}>
            {" *"}
          </span>
        )}
      </label>

      {children ?? (
        <span
          className="field__box"
          data-icon={icon ? "true" : undefined}
          data-reveal={isPassword ? "true" : undefined}
        >
          {icon && <FieldGlyph icon={icon} />}
          <input
            id={id}
            name={name}
            type={isPassword && reveal ? "text" : type}
            value={value}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {isPassword && (
            <button
              type="button"
              className="field__reveal"
              aria-pressed={reveal}
              aria-controls={id}
              onClick={() => setReveal((v) => !v)}
            >
              <EyeGlyph open={reveal} />
              <span className="sr-only">{reveal ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
            </button>
          )}
        </span>
      )}

      {hint && (
        <span className="hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="error" id={errId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function FieldGlyph({ icon }: { icon: FieldIcon }) {
  return (
    <svg className="field__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {icon === "mail" && (
          <>
            <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
            <path d="m4 7 8 6 8-6" />
          </>
        )}
        {icon === "lock" && (
          <>
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          </>
        )}
        {icon === "user" && (
          <>
            <circle cx="12" cy="8.5" r="3.8" />
            <path d="M4.5 20c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
          </>
        )}
      </g>
    </svg>
  );
}

function EyeGlyph({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
        {open && <path d="M4 20 20 4" />}
      </g>
    </svg>
  );
}
