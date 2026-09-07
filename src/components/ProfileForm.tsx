"use client";

import { useId, useState } from "react";
import { Field } from "@/components/Field";
import { apiPost, type ApiError } from "@/lib/api-client";

type Accessibility = Record<string, boolean>;

export type ProfileValues = {
  goal: string | null;
  goalNote: string | null;
  priorExperience: string | null;
  hoursPerWeek: number | null;
  supportLanguage: string;
  timezone: string;
  correctionStyle: string;
  accessibility: Accessibility;
};

const GOALS = [
  { value: "giao_tiep", label: "Giao tiếp hằng ngày" },
  { value: "cuoc_song", label: "Cuộc sống ở Đức: giấy tờ, y tế, nhà ở" },
  { value: "cong_viec", label: "Công việc" },
  { value: "ausbildung", label: "Ausbildung hoặc học nghề" },
  { value: "thi_cu", label: "Chuẩn bị thi lấy chứng chỉ" },
];

const EXPERIENCE = [
  { value: "chua_hoc", label: "Chưa học bao giờ" },
  { value: "duoi_6_thang", label: "Dưới 6 tháng" },
  { value: "6_12_thang", label: "6 đến 12 tháng" },
  { value: "tren_1_nam", label: "Trên 1 năm" },
];

const ACCESSIBILITY = [
  { key: "captions", label: "Luôn bật phụ đề trong lớp" },
  { key: "slowSpeech", label: "Đọc chậm hơn mặc định" },
  { key: "largeText", label: "Chữ lớn hơn" },
  { key: "reducedMotion", label: "Giảm hiệu ứng chuyển động" },
];

/** Múi giờ hay dùng. Trình bày ngắn gọn thay vì danh sách 400 dòng của IANA. */
const TIMEZONES = ["Europe/Berlin", "Asia/Ho_Chi_Minh", "Europe/Prague", "Europe/Warsaw", "UTC"];

export function ProfileForm({
  initial,
  email,
  name,
}: {
  initial: ProfileValues;
  email: string;
  name: string;
}) {
  const [values, setValues] = useState<ProfileValues>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const formId = useId();

  function set<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result = await apiPost(
      "/api/ho-so",
      {
        goal: values.goal || null,
        goalNote: values.goalNote || null,
        priorExperience: values.priorExperience || null,
        hoursPerWeek: values.hoursPerWeek ?? null,
        supportLanguage: values.supportLanguage,
        timezone: values.timezone,
        correctionStyle: values.correctionStyle,
        accessibility: values.accessibility,
      },
      "PATCH",
    );

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setSaved(true);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className="alert alert--error" role="alert">
          <p>{error.message}</p>
        </div>
      )}
      {saved && (
        <div className="alert alert--success" role="status">
          <p>Đã lưu hồ sơ.</p>
        </div>
      )}

      <div className="card card--flat" style={{ marginBottom: "var(--s-7)" }}>
        <h2 style={{ fontSize: "var(--fs-md)" }}>Tài khoản</h2>
        <p style={{ color: "var(--muted)", fontSize: "var(--fs-sm)", marginBottom: 0 }}>
          {name} · {email}
        </p>
      </div>

      <Field label="Bạn học tiếng Đức để làm gì?" name="goal">
        <select
          id={`${formId}-goal`}
          value={values.goal ?? ""}
          onChange={(e) => set("goal", e.target.value || null)}
        >
          <option value="">Chưa chọn</option>
          {GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Mô tả thêm (không bắt buộc)"
        name="goalNote"
        hint="Ví dụ: cần nói được với đồng nghiệp trong bếp, hoặc chuẩn bị phỏng vấn Ausbildung ngành điều dưỡng."
      >
        <textarea
          value={values.goalNote ?? ""}
          onChange={(e) => set("goalNote", e.target.value)}
          maxLength={1000}
        />
      </Field>

      <Field label="Bạn đã học tiếng Đức bao lâu?" name="priorExperience">
        <select
          value={values.priorExperience ?? ""}
          onChange={(e) => set("priorExperience", e.target.value || null)}
        >
          <option value="">Chưa chọn</option>
          {EXPERIENCE.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Mỗi tuần bạn học được bao nhiêu giờ?"
        name="hoursPerWeek"
        hint="Con số thật, không phải con số mong muốn — lộ trình dựng từ nó."
      >
        <input
          type="number"
          min={0}
          max={60}
          value={values.hoursPerWeek ?? ""}
          onChange={(e) => set("hoursPerWeek", e.target.value === "" ? null : Number(e.target.value))}
        />
      </Field>

      <Field label="Ngôn ngữ giải thích" name="supportLanguage">
        <select
          value={values.supportLanguage}
          onChange={(e) => set("supportLanguage", e.target.value)}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="de">Tiếng Đức</option>
        </select>
      </Field>

      <Field
        label="Múi giờ"
        name="timezone"
        hint="Dùng để hiển thị lịch học và lịch ôn đúng giờ của bạn."
      >
        <select value={values.timezone} onChange={(e) => set("timezone", e.target.value)}>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Khi bạn nói sai, giáo viên nên sửa lúc nào?"
        name="correctionStyle"
        hint="Sửa ngay giúp nhớ nhanh; tổng kết cuối lượt giúp bạn nói trôi hơn."
      >
        <select
          value={values.correctionStyle}
          onChange={(e) => set("correctionStyle", e.target.value)}
        >
          <option value="end_of_turn">Tổng kết cuối lượt</option>
          <option value="immediate">Sửa ngay khi sai</option>
        </select>
      </Field>

      <fieldset
        style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "var(--s-5)", marginBottom: "var(--s-6)" }}
      >
        <legend style={{ fontSize: "var(--fs-sm)", fontWeight: 620, padding: "0 var(--s-2)" }}>
          Hỗ trợ tiếp cận
        </legend>
        {ACCESSIBILITY.map((a) => (
          <label key={a.key} className="check">
            <input
              type="checkbox"
              checked={Boolean(values.accessibility?.[a.key])}
              onChange={(e) =>
                set("accessibility", { ...values.accessibility, [a.key]: e.target.checked })
              }
            />
            <span>{a.label}</span>
          </label>
        ))}
      </fieldset>

      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? "Đang lưu…" : "Lưu hồ sơ"}
      </button>
    </form>
  );
}
