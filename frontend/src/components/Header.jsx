import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { ToolIcon } from "@/components/ToolCard";
import { TOOLS } from "@/data/tools";

const NAV = [
  { to: "/merge-pdf", label: "Merge PDF", id: "merge" },
  { to: "/compress-pdf", label: "Compress PDF", id: "compress" },
  { to: "/split-pdf", label: "Split PDF", id: "split" },
  { to: "/jpg-to-pdf", label: "JPG to PDF", id: "jpg-to-pdf" },
];

const linkCls = ({ isActive }) =>
  `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-brand" : "text-slate-600 hover:text-ink"}`;

function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        data-testid="nav-all-tools-trigger"
        aria-expanded={open}
        aria-controls="tools-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-ink"
      >
        All Tools <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="tools-menu" className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-2">
          <div className="animate-pop rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5">
            <ul className="grid grid-cols-2 gap-1">
              {TOOLS.map((t) => (
                <li key={t.slug}>
                  <Link to={`/${t.slug}`} data-testid={`menu-tool-${t.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface focus-visible:bg-surface">
                    <ToolIcon tool={t} size="h-9 w-9" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t.name}</span>
                      <span className="block text-xs text-slate-500">{t.tagline}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/all-tools" onClick={() => setOpen(false)} data-testid="menu-all-tools" className="mt-2 flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-brand hover:bg-brand/10">
              Browse all PDF tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={`nav-${n.id}`} className={linkCls}>{n.label}</NavLink>
          ))}
          <ToolsDropdown />
          <NavLink to="/blog" data-testid="nav-blog" className={linkCls}>Blog</NavLink>
        </nav>
        <Link to="/all-tools" data-testid="header-cta" className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-dark lg:inline-flex">
          Explore All Tools
        </Link>
        <button
          type="button"
          data-testid="mobile-menu-toggle"
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">PDF tools</p>
          <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link to={`/${t.slug}`} data-testid={`mobile-tool-${t.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium text-ink hover:bg-surface">
                  <ToolIcon tool={t} size="h-8 w-8" /> {t.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/blog" data-testid="mobile-blog" className="rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-ink">Blog</Link>
            <Link to="/all-tools" data-testid="mobile-all-tools" className="rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white">Explore All Tools</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
