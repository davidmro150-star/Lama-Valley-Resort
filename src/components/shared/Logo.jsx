
import Link from "next/link";

export default function Logo({
  light = false,
  className = "",
  logoUrl = "",
  logoAlt = "Lama Valley Resort & Restaurant",
}) {
  const textColor = light ? "#ffffff" : "#234b3b";
  const accentColor = "#c49a62";

  return (
    <Link
      href="/"
      aria-label="Lama Valley Resort home"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={logoAlt}
          className="h-12 w-auto max-w-[200px] object-contain"
        />
      ) : (
        <>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 35L17 17L25 27L32 19L44 35"
              stroke={textColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M10 35C17 29 30 29 38 35"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle cx="34" cy="11" r="4" fill={accentColor} />
          </svg>

          <span className="flex flex-col">
            <span
              className="font-serif text-lg font-semibold tracking-[0.12em]"
              style={{ color: textColor }}
            >
              LAMA VALLEY
            </span>

            <span
              className="text-[9px] font-medium tracking-[0.18em]"
              style={{ color: accentColor }}
            >
              RESORT & RESTAURANT
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
