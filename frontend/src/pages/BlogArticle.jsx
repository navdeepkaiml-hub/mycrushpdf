import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import { ld } from "@/data/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { getArticle, ARTICLES } from "@/data/blog";
import { getTool } from "@/data/tools";

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-10 text-2xl font-bold tracking-tight text-slate-900">{block.text}</h2>;
    case "p":
      return <p className="mt-4 text-base leading-relaxed text-slate-700">{block.text}</p>;
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-slate-700">
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      );
    default:
      return null;
  }
}

export default function BlogArticle() {
  const { slug } = useParams();
  const article = getArticle(slug);
  if (!article) return <Navigate to="/404" replace />;

  const tool = article.tool ? getTool(article.tool) : null;
  const others = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  const jsonLd = [ld.article(article), ld.breadcrumbs([{ name: "Blog", path: "/blog" }, { name: article.title, path: `/blog/${article.slug}` }])];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo
        title={`${article.title} | mycrushpdf`}
        description={article.description}
        path={`/blog/${article.slug}`}
        jsonLd={jsonLd}
      />
      <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: article.title }]} />

      <article>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{article.category}</span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{article.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
          <span>By mycrushpdf Editorial Team</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Updated {article.updated}</span>
          <span>{article.readingTime}</span>
        </div>

        <div className="mt-8">
          {article.body.map((b, i) => <Block key={i} block={b} />)}
        </div>
      </article>

      {tool && (
        <div className="mt-10 rounded-2xl bg-indigo-600 p-6 text-center">
          <h3 className="text-lg font-bold text-white">Try the {tool.name} tool</h3>
          <p className="mt-1 text-sm text-indigo-100">Put this guide into practice right now — it's free.</p>
          <Link to={`/${tool.slug}`} data-testid="article-tool-cta" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
            Open {tool.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <AdSlot slot="article" />

      <div className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="text-xl font-bold text-slate-900">More guides</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {others.map((a) => (
            <Link key={a.slug} to={`/blog/${a.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md">
              <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-indigo-600">{a.title}</h3>
              <p className="mt-2 text-xs text-slate-400">{a.readingTime}</p>
            </Link>
          ))}
        </div>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to all guides
        </Link>
      </div>
    </div>
  );
}
