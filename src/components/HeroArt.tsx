/**
 * Hình chính của hero: một lượt hội thoại đang diễn ra.
 *
 * Vẽ bằng SVG ngay trong repo thay vì dùng ảnh stock - không có vấn đề bản
 * quyền, không request ngoài, đổi màu theo chủ đề, và không bao giờ là một ô
 * placeholder xám lúc bàn giao. Nội dung tiếng Đức trong hình là câu A1 thật,
 * bọc `lang="de"` để trình đọc màn hình phát âm đúng.
 */
export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="false">
      <svg
        viewBox="0 0 520 420"
        role="img"
        aria-labelledby="hero-art-title hero-art-desc"
        width="100%"
      >
        <title id="hero-art-title">Một lượt hội thoại trong lớp học Lingora</title>
        <desc id="hero-art-desc">
          Giáo viên AI hỏi &quot;Wo wohnst du?&quot;, học viên trả lời &quot;Ich wohne in
          Berlin&quot;, kèm gợi ý ngữ pháp và thanh trạng thái micro.
        </desc>

        {/* nền mềm */}
        <defs>
          <linearGradient id="heroSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.09" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="520" height="420" rx="30" fill="url(#heroSky)" />

        {/* avatar giáo viên */}
        <g transform="translate(38 46)">
          <circle cx="34" cy="34" r="34" fill="var(--forest)" />
          <circle cx="34" cy="27" r="12" fill="var(--lime)" />
          <path d="M14 58 C16 42 52 42 54 58 Z" fill="var(--lime)" />
          {/* vòng "đang nói" */}
          <circle
            cx="34"
            cy="34"
            r="43"
            fill="none"
            stroke="var(--lime-deep)"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.8"
          />
        </g>
        <text x="122" y="72" fontSize="13" fontWeight="650" fill="var(--muted)">
          Anna · giáo viên AI
        </text>

        {/* bong bóng của giáo viên */}
        <g transform="translate(122 84)">
          <rect width="326" height="76" rx="18" fill="var(--paper-raised)" stroke="var(--line)" />
          <text x="22" y="34" fontSize="20" fontWeight="620" fill="var(--ink)">
            <tspan xmlSpace="preserve">Wo wohnst du?</tspan>
          </text>
          <text x="22" y="58" fontSize="14" fill="var(--muted)">
            Bạn sống ở đâu?
          </text>
        </g>

        {/* bong bóng của học viên */}
        <g transform="translate(56 190)">
          <rect width="330" height="78" rx="18" fill="var(--forest)" />
          <text x="22" y="34" fontSize="20" fontWeight="620" fill="var(--paper)">
            Ich wohne in Berlin.
          </text>
          <text x="22" y="58" fontSize="14" fill="var(--lime)">
            Tôi sống ở Berlin.
          </text>
        </g>

        {/* thẻ gợi ý ngữ pháp */}
        <g transform="translate(232 288)">
          <rect width="248" height="88" rx="16" fill="var(--lime)" />
          <text x="18" y="30" fontSize="12" fontWeight="700" fill="var(--on-lime)">
            GỢI Ý
          </text>
          <text x="18" y="54" fontSize="15" fontWeight="600" fill="var(--on-lime)">
            wohnen → ich wohne
          </text>
          <text x="18" y="74" fontSize="13" fill="var(--on-lime)">
            Động từ đứng vị trí thứ hai
          </text>
        </g>

        {/* thanh mic */}
        <g transform="translate(40 300)">
          <rect width="168" height="60" rx="30" fill="var(--paper-raised)" stroke="var(--line)" />
          <circle cx="34" cy="30" r="16" fill="var(--forest)" />
          <rect x="30" y="22" width="8" height="12" rx="4" fill="var(--lime)" />
          <path
            d="M27 32 a7 7 0 0 0 14 0"
            fill="none"
            stroke="var(--lime)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={64 + i * 14}
              y={30 - (4 + ((i * 7) % 16))}
              width="6"
              height={8 + ((i * 14) % 32)}
              rx="3"
              fill="var(--forest)"
              opacity={0.35 + (i % 3) * 0.22}
            />
          ))}
        </g>
      </svg>

      <p className="hero-art__note">
        <span className="badge badge--lime">AI</span> Mọi giáo viên ở đây là AI. Giao diện luôn nói
        rõ điều đó.
      </p>
    </div>
  );
}
