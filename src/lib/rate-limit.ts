import "server-only";

/**
 * Rate limit theo cửa sổ trượt, giữ trong bộ nhớ tiến trình.
 *
 * Đủ cho một tiến trình web - đúng hình dạng triển khai của bản pilot. Khi chạy
 * nhiều instance sau load balancer, thay phần lưu trữ bằng Redis; hợp đồng của
 * `hit()` không đổi. Ghi lại ở đây để không ai nhầm đây là bảo vệ phân tán.
 */

type Bucket = { hits: number[]; };
const buckets = new Map<string, Bucket>();

/** Dọn định kỳ để bản đồ không phình vô hạn theo số IP đã gặp. */
let lastSweep = Date.now();
function sweep(windowMs: number) {
  if (Date.now() - lastSweep < 60_000) return;
  lastSweep = Date.now();
  const cutoff = Date.now() - windowMs;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  sweep(windowMs);
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterSeconds = Math.ceil((bucket.hits[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * IP của client. Chỉ tin `x-forwarded-for` khi ứng dụng thật sự đứng sau proxy
 * của mình - trên VPS, nginx đặt header này. Không có thì rơi về chuỗi cố định,
 * và rate limit khi đó tính chung cho cả máy, vẫn an toàn hơn là không giới hạn.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Trả sẵn Response 429 kèm Retry-After, để route handler chỉ việc return. */
export function tooMany(result: RateLimitResult): Response {
  return Response.json(
    {
      error: {
        code: "rate_limited",
        message: `Bạn thử lại quá nhanh. Vui lòng chờ ${result.retryAfterSeconds} giây.`,
      },
    },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
