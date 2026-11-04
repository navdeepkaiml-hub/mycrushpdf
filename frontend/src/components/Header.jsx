import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FileText, Menu, X, ChevronDown } from "lucide-react";
import { TOOLS, POPULAR_SLUGS } from "@/data/tools";

const NAV = [
  { to: "/merge-pdf", label: "Merge" },
  { to: "/compress-pdf", label: "Compress" },
  { to: "/split-pdf", label: "Split" },
  { to: "/jpg-to-pdf", label: "JPG to PDF" },
];

export function Logo() {
  return (
    <Link to="/" data-testid="logo-link" className="flex items-center gap-2 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <FileText className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        mycrush<span className="text-indigo-600">pdf</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button
                data-testid="nav-all-tools-trigger"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                onClick={() => navigate("/all-tools")}
              >
                All Tools <ChevronDown className="h-4 w-4" />
              </button>
              {toolsOpen && (
                <div className="absolute left-0 top-full w-[32rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {TOOLS.map((t) => {
                      const Icon = t.icon;
                      return (
                        <Link
                          key={t.slug}
                          to={`/${t.slug}`}
                          data-testid={`menu-tool-${t.slug}`}
                          className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50"
                        >
                          <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-sm font-medium text-slate-700">{t.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <NavLink to="/blog" data-testid="nav-blog" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"}`}>
              Blog
            </NavLink>
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/all-tools"
            data-testid="header-cta"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
          >
            Explore Tools
          </Link>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_SLUGS.map((slug) => {
              const t = TOOLS.find((x) => x.slug === slug);
              return (
                <Link key={slug} to={`/${slug}`} data-testid={`mobile-tool-${slug}`} onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
                  {t.name}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/all-tools" onClick={() => setOpen(false)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white">All Tools</Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700">Blog</Link>
          </div>
        </div>
      )}
    </header>
  );
}
