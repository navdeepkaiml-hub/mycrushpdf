import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { TOOLS } from "@/data/tools";

const LEGAL = [
  { to: "/about-us", label: "About Us" },
  { to: "/contact-us", label: "Contact Us" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-and-conditions", label: "Terms & Conditions" },
  { to: "/cookie-policy", label: "Cookie Policy" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/faq", label: "FAQ" },
  { to: "/help", label: "Help Center" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
                <FileText className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                mycrush<span className="text-indigo-600">pdf</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Free, fast and secure online PDF tools. Merge, compress, split and
              convert documents right in your browser.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">PDF Tools</h3>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.slice(0, 6).map((t) => (
                <li key={t.slug}>
                  <Link to={`/${t.slug}`} data-testid={`footer-tool-${t.slug}`} className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} data-testid={`footer-link-${l.to.replace(/\//g, "")}`} className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/all-tools" className="text-sm text-slate-500 hover:text-indigo-600">All Tools</Link></li>
              <li><Link to="/blog" className="text-sm text-slate-500 hover:text-indigo-600">Blog & Guides</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-500 hover:text-indigo-600">FAQ</Link></li>
              <li><Link to="/help" className="text-sm text-slate-500 hover:text-indigo-600">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} mycrushpdf. All rights reserved.</p>
          <p className="text-xs text-slate-400">
            Files are processed securely and deleted automatically within 60 minutes.
          </p>
        </div>
      </div>
    </footer>
  );
}
