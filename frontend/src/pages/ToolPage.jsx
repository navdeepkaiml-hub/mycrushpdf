import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FileCheck2, ListChecks, ShieldCheck, Lightbulb } from "lucide-react";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import ToolRunner from "@/components/ToolRunner";
import AdSlot from "@/components/AdSlot";
import { getTool, TOOLS } from "@/data/tools";
import { api } from "@/lib/api";

export default function ToolPage({ slug: propSlug }) {
  const params = useParams();
  const slug = propSlug || params.slug;
  const tool = getTool(slug);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!tool) return;
    api.get("/config/public").then((r) => {
      const enabled = r.data.tools_enabled?.[tool.endpoint];
      setDisabled(enabled === false);
    }).catch(() => {});
  }, [tool]);

  if (!tool) return <Navigate to="/404" replace />;

  const Icon = tool.icon;
  const related = (tool.related || []).map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${tool.name} — mycrushpdf`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: tool.seoDescription,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <Seo title={tool.seoTitle} description={tool.seoDescription} path={`/${tool.slug}`} jsonLd={jsonLd} />
      {/* second JSON-LD for FAQ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "All Tools", to: "/all-tools" }, { label: tool.name }]} />
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl" style={{ backgroundColor: `${tool.color}1a`, color: tool.color }}>
            <Icon className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{tool.name}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">{tool.intro}</p>
        </div>
      </div>

      {/* Tool runner */}
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
        {disabled ? (
          <div data-testid="tool-disabled" className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
            <h2 className="text-xl font-bold text-amber-800">This tool is temporarily unavailable</h2>
            <p className="mt-2 text-sm text-amber-700">Please check back soon or try another tool.</p>
            <Link to="/all-tools" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline">
              Browse all tools
            </Link>
          </div>
        ) : (
          <ToolRunner tool={tool} />
        )}
      </div>

      {/* Info sections */}
      <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="tool" />
        <div className="space-y-12">
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <BookOpen className="h-6 w-6 text-indigo-600" /> What {tool.name} does
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{tool.intro}</p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <ListChecks className="h-6 w-6 text-indigo-600" /> How to use {tool.name}
            </h2>
            <ol className="mt-4 space-y-3">
              {tool.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5 text-base leading-relaxed text-slate-600">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900"><FileCheck2 className="h-5 w-5 text-indigo-600" /> Supported formats</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.formats}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900"><ShieldCheck className="h-5 w-5 text-indigo-600" /> Limitations</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.limitations}</p>
            </div>
          </section>

          <section className="rounded-2xl bg-indigo-50/70 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Lightbulb className="h-5 w-5 text-indigo-600" /> Practical example</h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">{tool.example}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Privacy</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Your files are processed on our secure server with random filenames and
              deleted automatically within 60 minutes. We never store document contents
              in our database. We do not claim end-to-end or zero-knowledge encryption.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
            <div className="mt-5"><FaqAccordion faqs={tool.faqs} testIdPrefix={`${tool.slug}-faq`} /></div>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900">Related tools</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((t) => {
                  const RI = t.icon;
                  return (
                    <Link key={t.slug} to={`/${t.slug}`} data-testid={`related-${t.slug}`} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md">
                      <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                        <RI className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{t.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}
