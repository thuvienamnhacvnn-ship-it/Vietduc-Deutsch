import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { profileFor } from "@/lib/queries";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata: Metadata = { title: "Hồ sơ học viên" };

export default async function ProfilePage() {
  const user = await requireUser("/hoc/ho-so");
  const profile = await profileFor(user.id);

  return (
    <>
      <div className="page-head">
        <h1>Hồ sơ học viên</h1>
        <p>
          Những thông tin này quyết định lộ trình, cách giáo viên sửa lỗi và giờ hiển thị của bạn.
        </p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <ProfileForm
          initial={{
            goal: profile.goal,
            goalNote: profile.goalNote,
            priorExperience: profile.priorExperience,
            hoursPerWeek: profile.hoursPerWeek,
            supportLanguage: profile.supportLanguage,
            timezone: profile.timezone,
            correctionStyle: profile.correctionStyle,
            accessibility: profile.accessibility,
          }}
          email={user.email}
          name={user.name}
        />
      </div>
    </>
  );
}
