import type { Metadata } from "next";
import { FAQ } from "@/content/site";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: "Giáo viên AI, chứng chỉ, thời gian học, micro và dữ liệu cá nhân.",
};

export default function FaqPage() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Câu hỏi</p>
        <h1>Câu hỏi thường gặp</h1>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
