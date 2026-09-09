import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { ClassRoom } from "@/components/ClassRoom";

export const metadata: Metadata = { title: "Buổi học nói" };

/**
 * Một buổi học nói.
 *
 * Trang server chỉ lo đăng nhập; toàn bộ buổi học nằm trong một component ở
 * trình duyệt vì nó là một vòng lặp nghe - nói - đáp, không phải một trang đọc.
 */
export default async function ClassPage({ params }: { params: Promise<{ ma: string }> }) {
  const { ma } = await params;
  await requireUser(`/hoc/lop/${ma}`);
  return <ClassRoom code={ma} />;
}
