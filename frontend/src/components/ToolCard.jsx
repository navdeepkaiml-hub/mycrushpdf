import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function ToolIcon({ tool, size = "h-10 w-10" }) {
  const Icon = tool.icon;
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-xl`} style={{ backgroundColor: `${tool.color}14`, color: tool.color }}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export default function ToolCard({ tool }) {
  return (
    <Link
      to={`/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/[0.08]"
    >
      <ToolIcon tool={tool} size="h-12 w-12" />
      <h3 className="mt-5 text-lg font-semibold text-ink">{tool.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand">{tool.tagline}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{tool.intro.split(". ")[0]}.</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-ink group-hover:text-brand">
        Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
