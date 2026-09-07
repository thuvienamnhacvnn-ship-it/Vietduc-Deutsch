/**
 * Gọi API từ phía trình duyệt. Một chỗ duy nhất hiểu hình dạng lỗi
 * `{ error: { code, message, fields } }`, nên mỗi form không phải tự đoán.
 */

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function apiPost<T = unknown>(
  path: string,
  body: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Mất mạng là trường hợp thường gặp nhất và cũng dễ bị bỏ quên nhất.
    return {
      ok: false,
      error: { code: "network", message: "Không kết nối được. Kiểm tra mạng rồi thử lại." },
    };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* phản hồi không phải JSON - xử lý ngay dưới */
  }

  if (!response.ok) {
    const err = (payload as { error?: ApiError } | null)?.error;
    return {
      ok: false,
      error: err ?? {
        code: `http_${response.status}`,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      },
    };
  }

  return { ok: true, data: (payload ?? {}) as T };
}
