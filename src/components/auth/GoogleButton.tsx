import Link from "next/link";
import { googleAvailable, mockEnabled } from "@/lib/adapters/oauth-google";

/**
 * Nút "Tiếp tục với Google".
 *
 * Là một liên kết thường chứ không phải nút JavaScript: luồng OAuth là một
 * chuyển hướng, nên trình duyệt tự làm được, và nó hoạt động cả khi JavaScript
 * chưa kịp tải.
 *
 * Ba trạng thái và cả ba đều nói đúng sự thật:
 *   live - bấm là sang Google thật
 *   mock - chỉ ở máy dev, có nhãn nói rõ đây là bản mô phỏng
 *   chưa kết nối - nút bị vô hiệu kèm lý do, không có đường vòng nào
 */
export function GoogleButton({ next = "/hoc" }: { next?: string }) {
  const available = googleAvailable();
  const isMock = mockEnabled();

  return (
    <div className="oauth-block">
      {available ? (
        <Link
          href={`/api/auth/google?tiep=${encodeURIComponent(next)}`}
          className="btn btn--secondary btn--block oauth-btn"
          prefetch={false}
        >
          <GoogleMark />
          Tiếp tục với Google
        </Link>
      ) : (
        <button type="button" className="btn btn--secondary btn--block oauth-btn" disabled>
          <GoogleMark />
          Đăng nhập Google chưa kết nối
        </button>
      )}

      {isMock && (
        <p className="mock-tag oauth-block__note">
          Bản mô phỏng — chưa có khóa Google, không có dữ liệu nào rời khỏi máy này
        </p>
      )}

      {!available && (
        // Người học không cần biết tên tệp tài liệu của dự án; họ chỉ cần biết
        // dùng cách nào thay thế. Hướng dẫn kỹ thuật nằm ở docs/INTEGRATIONS.md.
        <p className="oauth-block__hint">
          Cách đăng nhập này chưa mở. Bạn dùng email và mật khẩu bên dưới nhé.
        </p>
      )}

      <p className="oauth-block__terms">
        Tiếp tục với Google nghĩa là bạn đồng ý với <Link href="/dieu-khoan">Điều khoản sử dụng</Link>{" "}
        và <Link href="/rieng-tu">Chính sách riêng tư</Link>.
      </p>

      <div className="oauth-block__or">
        <span>hoặc dùng email</span>
      </div>
    </div>
  );
}

/**
 * Ghi chú quyền riêng tư của đăng nhập Google, đặt ở cuối thẻ biểu mẫu. Nói
 * đúng phạm vi đã xin của Google (`openid email profile`): tên và email, không
 * đọc Gmail, không gì khác.
 */
export function GooglePrivacyNote() {
  if (!googleAvailable()) return null;
  return (
    <p className="auth-note">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
        </g>
      </svg>
      Chỉ dùng tên và email khi đăng nhập Google - không đọc Gmail, không truy cập gì khác.
    </p>
  );
}

/**
 * Logo Google vẽ tay theo bốn màu chính thức. Không nạp ảnh từ CDN của Google:
 * một request ra ngoài trên mọi trang đăng nhập là thứ không cần thiết.
 */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2 5.1-4.4 6.700v5.6h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.5-9.1H4.2v5.8C7.8 41.1 15.3 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.8H4.2C2.8 16.9 2 20.3 2 24s.8 7.1 2.2 10l7.3-6z"
      />
      <path
        fill="#EA4335"
        d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.3 30 2 24 2 15.3 2 7.8 6.9 4.2 14.1l7.3 5.8c1.8-5.2 6.7-9.1 12.5-9.1z"
      />
    </svg>
  );
}
