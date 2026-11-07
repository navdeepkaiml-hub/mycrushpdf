import { Link } from "react-router-dom";

export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="#5146E5" />
      <rect x="23" y="10" width="27" height="35" rx="5" fill="#fff" fillOpacity="0.35" />
      <path d="M19 17h17l11 11v21a5 5 0 0 1-5 5H19a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5z" fill="#fff" />
      <path d="M36 17v7a4 4 0 0 0 4 4h7z" fill="#C9C5FF" />
      <path d="M20.5 33.5l6 5.5-6 5.5M40.5 33.5l-6 5.5 6 5.5" fill="none" stroke="#5146E5" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandLogo({ testId = "logo-link" }) {
  return (
    <Link to="/" data-testid={testId} aria-label="mycrushpdf home" className="flex shrink-0 items-center gap-2.5 rounded-lg">
      <LogoMark />
      <span className="font-display text-[1.2rem] font-extrabold tracking-tight text-ink">
        mycrush<span className="text-brand">pdf</span>
      </span>
    </Link>
  );
}
