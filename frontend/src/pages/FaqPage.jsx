import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { TOOLS } from "@/data/tools";
import { PAGE_META, GENERAL_FAQS, ld } from "@/data/seo";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo {...PAGE_META.faq} jsonLd={[ld.faq(GENERAL_FAQS), ld.breadcrumbs([{ name: "FAQ", path: "/faq" }])]} />
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Frequently Asked Questions</h1>
      <p className="mt-3 text-base text-slate-600">Everything you need to know about using mycrushpdf.</p>

      <div className="mt-8"><FaqAccordion faqs={GENERAL_FAQS} testIdPrefix="page-faq" /></div>

      <div className="mt-12 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-900">Jump to a tool</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <Link key={t.slug} to={`/${t.slug}`} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600">
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
