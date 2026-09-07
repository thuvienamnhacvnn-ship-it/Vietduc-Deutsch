"use client";

import { useId } from "react";

/**
 * Ô nhập liệu. Nhãn, gợi ý và lỗi luôn được nối vào input qua `aria-describedby`
 * - trình đọc màn hình đọc được lý do một ô bị đỏ, không chỉ nhìn thấy màu.
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
  /** Cho phép thay input bằng select hoặc textarea mà vẫn giữ nguyên khung. */
  children?: React.ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ");

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
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange?.(e.target.value)}
        />
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
