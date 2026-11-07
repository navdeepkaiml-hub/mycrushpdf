import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { TOOLS } from "@/data/tools";

const COLUMNS = [
  { title: "Company", links: [
    { to: "/about-us", label: "About Us" },
    { to: "/contact-us", label: "Contact" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/help", label: "Help Center" },
  ] },
  { title: "Legal", links: [
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms-and-conditions", label: "Terms of Service" },
    { to: "/cookie-policy", label: "Cookie Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
    { to: "/security", label: "Security & File Privacy" },
  ] },
  { title: "Explore", links: [
    { to: "/all-tools", label: "All PDF Tools" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ] },
];

const linkCls = "text-sm text-slate-500 transition-colors hover:text-brand";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <BrandLogo testId="footer-logo" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Free online PDF tools that run in your browser. Merge, compress, split, organize and convert PDFs without creating an account.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">PDF Tools</h2>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.map((t) => (
                <li key={t.slug}><Link to={`/${t.slug}`} data-testid={`footer-tool-${t.slug}`} className={linkCls}>{t.name}</Link></li>
              ))}
            </ul>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a href={l.href} data-testid="footer-link-sitemap" className={linkCls}>{l.label}</a>
                    ) : (
                      <Link to={l.to} data-testid={`footer-link-${l.to.slice(1)}`} className={linkCls}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="footer-copyright">© {new Date().getFullYear()} mycrushpdf. All rights reserved.</p>
          <p className="text-xs text-slate-400">PDF tools on this site process your files in your browser. Files are not uploaded to our servers.</p>
        </div>
      </div>
    </footer>
  );
}
