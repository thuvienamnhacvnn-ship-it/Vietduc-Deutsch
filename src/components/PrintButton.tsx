"use client";

/**
 * Nút in phiếu kết quả.
 *
 * Một component client rất nhỏ, tách riêng để trang kết quả vẫn là server
 * component: cả trang chỉ cần một nút biết gọi `window.print()`, không đáng để
 * đẩy toàn bộ phần render sang phía trình duyệt.
 *
 * Bố cục bản in nằm trong `@media print` của test.css - nó bỏ thanh điều hướng
 * và các nút, giữ lại phiếu.
 */
export function PrintButton({ className = "btn btn--secondary btn--sm" }: { className?: string }) {
  return (
    <button type="button" className={`${className} exam-record__print`} onClick={() => window.print()}>
      In phiếu kết quả
    </button>
  );
}
