/**
 * Loyihaning "imzo" grafik elementi: Markaziy Osiyo koshin (majolika) naqshidan
 * ilhomlangan takrorlanuvchi geometrik shakl. Hero fonida juda xira holda,
 * bo'lim ajratgichlarida esa to'q rangda ishlatiladi - ortiqcha bezakka
 * aylanib ketmasligi uchun faqat shu ikki joyda qo'llaniladi.
 */
export default function TilePattern({ className = "", opacity = 0.08 }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="registon-tile" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="none" />
          <path
            d="M15 2 L28 15 L15 28 L2 15 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={opacity}
          />
          <circle cx="15" cy="15" r="3" fill="currentColor" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="120" height="120" fill="url(#registon-tile)" />
    </svg>
  );
}
