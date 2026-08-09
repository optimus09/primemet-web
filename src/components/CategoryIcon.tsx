import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  ALLENKEY: (
    <path d="M14 10 L14 30 L34 30 M14 10 L20 10 M14 16 L10 16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "BDS CUTTER": (
    <>
      <path d="M12 12 L36 36 M36 12 L12 36" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="36" cy="12" r="3" />
    </>
  ),
  "CUTTING NOZZEL": (
    <path d="M18 10 L30 10 L26 26 L22 26 Z M24 26 L24 38" strokeLinecap="round" strokeLinejoin="round" />
  ),
  NOZZEL: (
    <path d="M18 10 L30 10 L26 26 L22 26 Z M24 26 L24 38" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "CUTTING TORCH": (
    <path
      d="M14 30 L22 22 L30 14 M22 22 L34 34 M14 30 Q10 34 14 38 Q18 34 14 30"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "CUTTING WHEEL": (
    <>
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="4" />
    </>
  ),
  "GRINDING WHEEL": (
    <>
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="4" />
      <path d="M24 10 L24 14 M24 34 L24 38 M10 24 L14 24 M34 24 L38 24" strokeLinecap="round" />
    </>
  ),
  "DRILL BIT": (
    <path
      d="M10 24 L30 24 L38 24 M14 18 L26 18 M14 30 L26 30 M30 18 L34 24 L30 30"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "FLAP DISC": (
    <>
      <circle cx="24" cy="24" r="13" />
      <path
        d="M24 11 L24 17 M35 17 L30 20 M35 31 L30 28 M24 37 L24 31 M13 31 L18 28 M13 17 L18 20"
        strokeLinecap="round"
      />
    </>
  ),
  "M/C": (
    <path
      d="M20 12 L28 12 L28 16 Q34 18 34 24 Q34 30 28 32 L28 36 L20 36 L20 32 Q14 30 14 24 Q14 18 20 16 Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "MIG WELDING": (
    <path
      d="M12 34 L22 24 L18 20 L28 12 L34 18 L26 28 L22 24 M30 14 L34 10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "WELDING HOLDER": (
    <path
      d="M14 14 L22 22 M26 10 L38 22 L34 26 L22 14 Z M18 18 L10 26 Q8 30 12 34 Q16 38 20 34 L22 32"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "WELDING ROD": (
    <path d="M14 34 L34 14 M28 14 L34 14 L34 20" strokeLinecap="round" strokeLinejoin="round" />
  ),
  OTHER: (
    <path
      d="M18 30 Q12 30 12 24 Q12 18 18 18 L20 18 L30 8 L34 12 L24 22 L24 24 Q24 30 18 30 Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const FALLBACK = (
  <path
    d="M18 30 Q12 30 12 24 Q12 18 18 18 L20 18 L30 8 L34 12 L24 22 L24 24 Q24 30 18 30 Z"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export default function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const content = ICONS[category?.toUpperCase()] ?? FALLBACK;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
