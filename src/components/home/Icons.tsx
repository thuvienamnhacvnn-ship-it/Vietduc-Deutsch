/**
 * Bộ icon nét của trang chủ. Cùng độ dày nét 1.8 và khung 24px để đứng cạnh
 * nhau không lệch nhau. Tất cả là trang trí: chữ bên cạnh mới mang nghĩa.
 */
type P = { size?: number };

function Svg({ size = 22, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const IconArrow = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </Svg>
);

export const IconPlay = (p: P) => (
  <Svg {...p}>
    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" />
  </Svg>
);

export const IconBars = (p: P) => (
  <Svg {...p}>
    <path d="M6 19v-6M12 19V9M18 19V5" />
  </Svg>
);

export const IconMic = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z" />
    <path d="M12 6.5v13" />
  </Svg>
);

export const IconKeyboard = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
    <path d="M7 10h.01M11 10h.01M15 10h.01M7.5 14h9" />
  </Svg>
);

export const IconSpeaker = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconUsers = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.8-3.4 3-5 5.5-5s4.7 1.6 5.5 5" />
    <circle cx="16.8" cy="9" r="2.6" />
    <path d="M15.5 14.2c2.4-.3 4.3 1.1 5 4.3" />
  </Svg>
);

export const IconChat = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5h11a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H9l-4 3.5V15H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
    <path d="M19 9.5h1a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2h-1v2.5L16 18h-3" />
    <path d="M6.5 10.2h.01M9.5 10.2h.01M12.5 10.2h.01" strokeWidth="2.4" />
  </Svg>
);

export const IconCap = (p: P) => (
  <Svg {...p}>
    <path d="m2 9.5 10-5 10 5-10 5Z" />
    <path d="M6 11.5V16c1.8 1.6 3.8 2.4 6 2.4s4.2-.8 6-2.4v-4.5M22 9.5v5" />
  </Svg>
);

export const IconInfo = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.8h.01" />
  </Svg>
);

export const IconTarget = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="m12 12 7-7M16 5h3v3" />
  </Svg>
);

export const IconGear = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2 1.2M17.8 15.3l2 1.2M4.2 16.5l2-1.2M17.8 8.7l2-1.2" />
    <circle cx="12" cy="12" r="6.5" />
  </Svg>
);

export const IconTool = (p: P) => (
  <Svg {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3Z" />
    <path d="M6 4 4 6l3 3 2-2Z" />
  </Svg>
);
