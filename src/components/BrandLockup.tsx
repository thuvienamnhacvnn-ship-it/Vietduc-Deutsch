import Image from "next/image";

/**
 * Cụm nhận diện "VIỆT ĐỨC · LINGUA" của nền tảng học.
 *
 * Ngọn lửa là CHÍNH tệp logo của khách (`logo-ngang.png`), chỉ cắt khung để lộ
 * phần ngọn lửa - không vẽ lại. Chữ bên cạnh theo đúng bố cục logo tập đoàn,
 * thay "GROUP" bằng "LINGUA" như bản thiết kế trang chủ.
 *
 * Tệp gốc 1985x686, ngọn lửa chiếm khoảng 630px đầu. Khung cắt rộng 0,92 lần
 * chiều cao là vừa khít ngọn lửa, không lẹm vào chữ V.
 */
export function BrandLockup({ height = 44 }: { height?: number }) {
  return (
    <span className="brand-lockup" style={{ "--lockup-h": `${height}px` } as React.CSSProperties}>
      <span className="brand-lockup__flame" aria-hidden="true">
        <Image
          src="/brand/logo-ngang.png"
          alt=""
          width={Math.round(height * (1985 / 686))}
          height={height}
          priority
        />
      </span>
      <span className="brand-lockup__text" aria-hidden="true">
        <span className="brand-lockup__name">VIỆT ĐỨC</span>
        <span className="brand-lockup__sub">LINGUA</span>
      </span>
    </span>
  );
}
