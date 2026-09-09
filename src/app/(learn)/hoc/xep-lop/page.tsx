import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { PlacementTest } from "@/components/PlacementTest";
import { openSessionFor } from "@/lib/placement";

export const metadata: Metadata = { title: "Kiểm tra trình độ" };

/**
 * Trang làm bài kiểm tra xếp lớp.
 *
 * Server tra trước xem người học có bài đang dở không, rồi nói cho component
 * biết. Không có bước này thì người vừa đăng ký xong nhìn thấy một vòng xoay
 * trước khi quy chế hiện ra - và đó lại đúng là màn hình đầu tiên họ thấy sau
 * khi tạo tài khoản.
 */
export default async function PlacementPage() {
  const user = await requireUser("/hoc/xep-lop");
  const session = await openSessionFor(user.id);

  return (
    <div className="test-shell">
      <PlacementTest hasOpenSession={Boolean(session)} />
    </div>
  );
}
