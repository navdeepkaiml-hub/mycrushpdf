import { Link } from "react-router-dom";

// Outlined SVG wordmark (274×64 viewBox), rendered at a fixed size to avoid layout shift.
export default function BrandLogo({ testId = "logo-link" }) {
  return (
    <Link to="/" data-testid={testId} className="flex shrink-0 items-center rounded-lg">
      <img src="/brand/mycrushpdf-logo.svg" alt="mycrushpdf home" width="154" height="36" className="h-9 w-auto" decoding="async" />
    </Link>
  );
}
