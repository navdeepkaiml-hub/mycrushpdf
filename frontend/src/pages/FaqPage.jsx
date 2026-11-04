import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { TOOLS } from "@/data/tools";

const GENERAL_FAQS = [
  { q: "Is mycrushpdf really free?", a: "Yes. All core PDF tools are free to use, with no account required for everyday tasks." },
  { q: "Do I need to create an account?", a: "No account is needed to use the tools. Accounts exist only for site administrators." },
  { q: "How large can my files be?", a: "Each file can be up to 50MB and 500 pages. For bigger documents, split them first." },
  { q: "What happens to my files after processing?", a: "Files are stored with random names and automatically deleted within 60 minutes. Document contents are never saved to our database." },
  { q: "Do you support password-protected PDFs?", a: "Not directly. Please unlock a protected PDF before uploading it." },
  { q: "Which browsers are supported?", a: "mycrushpdf works in all modern browsers on desktop and mobile, including Chrome, Firefox, Safari and Edge." },
  { q: "Can I use the tools on my phone?", a: "Yes. The site is fully responsive and works well on phones and tablets." },
  { q: "Will there be more tools?", a: "Yes. We are adding tools like OCR, Word to PDF, PDF to JPG and Protect PDF in future releases." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GENERAL_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo
        title="FAQ — Frequently Asked Questions | mycrushpdf"
        description="Answers to common questions about mycrushpdf: pricing, file limits, privacy, supported formats, browsers and upcoming tools."
        path="/faq"
        jsonLd={faqLd}
      />
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
