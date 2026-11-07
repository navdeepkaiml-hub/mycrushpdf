import { Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, FileCheck2, ListChecks, ShieldCheck, Lightbulb, Lock, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import ToolRunner from "@/components/ToolRunner";
import ToolCard, { ToolIcon } from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
import { getTool, TOOLS } from "@/data/tools";
import { ARTICLES } from "@/data/blog";
import { ld } from "@/data/seo";
import { api } from "@/lib/api";

function Block({ icon: I, title, children }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink sm:text-2xl"><I className="h-5 w-5 text-brand" aria-hidden="true" /> {title}</h2>
      <div className="mt-3 text-base leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function ToolPage({ slug }) {
  const tool = getTool(slug);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!tool) return;
    api.get("/config/public").then((r) => setDisabled(r.data.tools_enabled?.[tool.endpoint] === false)).catch(() => {});
  }, [tool]);

  if (!tool) return <Navigate to="/404" replace />;

  const related = (tool.related || []).map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean);
  const guides = ARTICLES.filter((a) => a.tool === tool.slug || (a.tools || []).includes(tool.slug));
  const jsonLd = [ld.tool(tool), ld.breadcrumbs([{ name: "All Tools", path: "/all-tools" }, { name: tool.name, path: `/${tool.slug}` }]), ld.faq(tool.faqs)];

  return (
    <div>
      <Seo title={tool.seoTitle} description={tool.seoDescription} path={`/${tool.slug}`} jsonLd={jsonLd} />
      <div className="border-b border-slate-200/70 bg-surface">
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "All Tools", to: "/all-tools" }, { label: tool.name }]} />
          <div className="flex items-start gap-4">
            <ToolIcon tool={tool} size="h-14 w-14" />
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{tool.name}</h1>
              <p className="mt-1 text-base font-medium text-brand">{tool.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-base leading-relaxed text-slate-600" data-testid="tool-intro">{tool.intro}</p>
          <div className="mt-6">
            {disabled ? (
              <div data-testid="tool-disabled" className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
                <h2 className="text-xl font-bold text-amber-800">This tool is temporarily unavailable</h2>
                <Link to="/all-tools" className="mt-3 inline-block text-sm font-medium text-amber-800 underline">Browse all tools</Link>
              </div>
            ) : (
              <ToolRunner tool={tool} />
            )}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Processed in your browser. Your files are not uploaded to our servers.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-4 pt-14 sm:px-6 lg:px-8">
        <Block icon={ListChecks} title={`How to use ${tool.name}`}>
          <ol className="space-y-3">
            {tool.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </Block>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink"><FileCheck2 className="h-5 w-5 text-brand" aria-hidden="true" /> Supported formats</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.formats}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink"><ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" /> Limits</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.limitations}</p>
          </div>
        </div>

        <Block icon={Lightbulb} title="When to use it">
          <p>{tool.example}</p>
        </Block>

        <Block icon={Lock} title="Privacy and processing">
          <p>
            {tool.name} runs in your web browser using open-source PDF libraries. Your files are read and processed on your device and are not uploaded to our servers. The result is kept in your browser tab until you download it or leave the page. <Link to="/security" className="font-medium text-brand hover:underline">Learn more about file privacy</Link>.
          </p>
        </Block>

        <AdSlot slot="tool" />

        <section>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{tool.name} FAQ</h2>
          <div className="mt-5"><FaqAccordion faqs={tool.faqs} testIdPrefix={`${tool.slug}-faq`} /></div>
        </section>

        {guides.length > 0 && (
          <Block icon={BookOpen} title="Helpful guides">
            <ul className="space-y-2">
              {guides.map((a) => (
                <li key={a.slug}><Link to={`/blog/${a.slug}`} data-testid={`tool-guide-${a.slug}`} className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">{a.title} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></li>
              ))}
            </ul>
          </Block>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Related PDF tools</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((t) => <li key={t.slug} data-testid={`related-${t.slug}`}><ToolCard tool={t} /></li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
