import type { Metadata } from "next";
import { VerifyPanel } from "@/components/auth/VerifyPanel";

export const metadata: Metadata = { title: "Xác minh email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1>Xác minh email</h1>
      <VerifyPanel token={token ?? ""} />
    </>
  );
}
