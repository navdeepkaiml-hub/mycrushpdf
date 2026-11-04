import { Link } from "react-router-dom";
import { FileQuestion, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import { POPULAR_SLUGS, TOOLS } from "@/data/tools";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Seo title="Page Not Found — mycrushpdf" description="The page you are looking for could not be found." path="/404" noindex />
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-indigo-600">
        <FileQuestion className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-slate-700">Page not found</h2>
      <p className="mt-3 max-w-md text-base text-slate-500">
        The page you're looking for doesn't exist or may have moved. Try one of our popular tools instead.
      </p>
      <Link to="/" data-testid="notfound-home-btn" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700">
        Back to home <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {POPULAR_SLUGS.map((slug) => {
          const t = TOOLS.find((x) => x.slug === slug);
          return (
            <Link key={slug} to={`/${slug}`} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600">
              {t.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
