import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { ReviewDeck } from "@/components/ReviewDeck";

export const metadata: Metadata = { title: "Ôn tập" };

/**
 * Ôn tập ngắt quãng.
 *
 * Thẻ ở đây KHÔNG phải danh sách từ vựng chung chung tải về từ đâu đó: chúng là
 * lỗi của chính người học, ghi lại từ những lượt nói trong lớp. Ôn lại lỗi của
 * mình có tác dụng hơn hẳn ôn một danh sách từ mà mình vốn đã biết một nửa.
 */
export default async function ReviewPage() {
  await requireUser("/hoc/on-tap");
  return (
    <>
      <div className="page-head">
        <h1>Ôn tập</h1>
        <p>
          Những lỗi bạn được sửa trong lớp sẽ quay lại đây, cách nhau vài ngày, đúng lúc trí nhớ bắt
          đầu mờ đi.
        </p>
      </div>
      <ReviewDeck />
    </>
  );
}
