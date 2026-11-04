import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ARTICLES } from "@/data/blog";

export default function Blog() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo
        title="PDF Guides & Tips — mycrushpdf Blog"
        description="Practical, original guides on merging, compressing, splitting, converting and organizing PDF files. Learn to work smarter with documents."
        path="/blog"
      />
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">PDF Guides & Tips</h1>
      <p className="mt-3 max-w-2xl text-base text-slate-600">
        Original, practical guides to help you get the most out of your PDF documents.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            to={`/blog/${a.slug}`}
            data-testid={`blog-card-${a.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{a.category}</span>
            <h2 className="mt-4 text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-600">{a.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{a.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.readingTime}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Updated {a.updated}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
