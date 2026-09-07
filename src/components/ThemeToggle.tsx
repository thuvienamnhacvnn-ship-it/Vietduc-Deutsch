"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

/**
 * Ba trạng thái, không phải hai: "theo hệ thống" là mặc định và phải quay lại
 * được. Lựa chọn tường minh ghi `data-theme` lên <html>; chọn "theo hệ thống"
 * xóa thuộc tính đó đi để media query trong tokens.css nắm quyền trở lại.
 *
 * Nguồn sự thật là chính thuộc tính `data-theme` trên <html> — script inline
 * trong app/layout.tsx đã đặt nó trước lần vẽ đầu tiên. Đọc bằng
 * `useSyncExternalStore` thay vì `useEffect` + `setState`: server render ra
 * "system", client đồng bộ ngay ở lần vẽ đầu, và không có vòng render thừa.
 */

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  // Đổi chủ đề ở tab khác cũng phải cập nhật nhãn của nút ở tab này.
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === "dark" || value === "light" ? value : "system";
}

const LABEL: Record<Theme, string> = {
  system: "Giao diện: theo hệ thống",
  light: "Giao diện: sáng",
  dark: "Giao diện: tối",
};

const ICON: Record<Theme, string> = { system: "◐", light: "☀", dark: "☾" };

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  function apply(next: Theme) {
    try {
      if (next === "system") {
        localStorage.removeItem("lingora-theme");
        delete document.documentElement.dataset.theme;
      } else {
        localStorage.setItem("lingora-theme", next);
        document.documentElement.dataset.theme = next;
      }
    } catch {
      // localStorage bị chặn (cửa sổ riêng tư, chặn dữ liệu trang): vẫn đổi
      // được cho phiên hiện tại, chỉ là không nhớ sang lần sau.
      if (next === "system") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = next;
    }
  }

  const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";

  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={() => apply(next)}
      title={LABEL[theme]}
    >
      <span aria-hidden="true">{ICON[theme]}</span>
      <span className="sr-only">{LABEL[theme]}. Bấm để đổi.</span>
    </button>
  );
}
