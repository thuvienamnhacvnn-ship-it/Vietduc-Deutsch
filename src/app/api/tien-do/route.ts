import { apiUser } from "@/lib/auth/guard";
import { activeEntitlements, dueReviewCount, skillStateFor } from "@/lib/queries";
import { hit, tooMany } from "@/lib/rate-limit";

export async function GET() {
  const auth = await apiUser();
  if (!auth.ok) return auth.response;

  const limit = hit(`tien-do:${auth.user.id}`, 60, 60 * 1000);
  if (!limit.allowed) return tooMany(limit);

  const [skills, due, ents] = await Promise.all([
    skillStateFor(auth.user.id),
    dueReviewCount(auth.user.id),
    activeEntitlements(auth.user.id),
  ]);

  return Response.json({
    skills,
    dueReviewCount: due,
    hasAccess: ents.length > 0,
    // Chưa có bài học nào được xuất bản ở giai đoạn này. Nói thẳng thay vì trả
    // một bài giả để giao diện trông đầy đặn.
    nextLesson: null,
  });
}
