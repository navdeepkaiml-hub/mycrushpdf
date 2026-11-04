import { useParams, Navigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { LEGAL_PAGES } from "@/data/legal";

function renderParagraph(text) {
  // auto-link URLs
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-words">{p}</a>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default function LegalPage({ pageKey: propKey }) {
  const params = useParams();
  const pageKey = propKey || params.pageKey;
  const page = LEGAL_PAGES[pageKey];
  if (!page) return <Navigate to="/404" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo title={page.seoTitle} description={page.seoDescription} path={`/${pageKey}`} />
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{page.title}</h1>
      {page.updated && <p className="mt-2 text-sm text-slate-400">Last updated: {page.updated}</p>}

      <div className="mt-8 space-y-8">
        {page.sections.map((s, i) => (
          <section key={i}>
            {s.h && <h2 className="text-xl font-bold text-slate-900">{s.h}</h2>}
            <div className={s.h ? "mt-3 space-y-3" : "space-y-3"}>
              {s.p.map((para, j) => (
                <p key={j} className="text-base leading-relaxed text-slate-700">{renderParagraph(para)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
