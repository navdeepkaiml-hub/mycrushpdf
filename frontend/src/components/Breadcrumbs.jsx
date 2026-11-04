import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ items }) {
  // items: [{ label, to }] — last item is current (no link)
  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumbs" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-indigo-600">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            {item.to ? (
              <Link to={item.to} className="hover:text-indigo-600">{item.label}</Link>
            ) : (
              <span className="font-medium text-slate-700" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
