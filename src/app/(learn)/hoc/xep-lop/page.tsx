import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { PlacementTest } from "@/components/PlacementTest";

export const metadata: Metadata = { title: "Kiểm tra trình độ" };

export default async function PlacementPage() {
  await requireUser("/hoc/xep-lop");
  return (
    <div className="test-shell">
      <PlacementTest />
    </div>
  );
}
