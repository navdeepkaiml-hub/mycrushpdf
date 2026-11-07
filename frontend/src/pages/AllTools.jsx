import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { PAGE_META, ld } from "@/data/seo";

export default function AllTools() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo {...PAGE_META.allTools} jsonLd={ld.breadcrumbs([{ name: "All Tools", path: "/all-tools" }])} />
      <Breadcrumbs items={[{ label: "All Tools" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">All PDF Tools</h1>
      <p className="mt-3 max-w-2xl text-base text-slate-600">
        Every tool you need to work with PDF documents — free, fast and secure.
      </p>

      <div className="mt-10 space-y-12">
        {CATEGORIES.map((cat) => {
          const items = TOOLS.filter((t) => t.category === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id}>
              <h2 className="text-xl font-bold text-slate-900">{cat.label}</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.slug}
                      to={`/${t.slug}`}
                      data-testid={`all-tool-${t.slug}`}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600">{t.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{t.tagline}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
