import { Link } from "react-router-dom";
import {
  ShieldCheck, Zap, MonitorSmartphone, BadgeCheck, ArrowRight, MousePointerClick,
  FilePlus2, Download, Laptop, Tablet, Smartphone, Globe, Lock,
} from "lucide-react";
import Seo from "@/components/Seo";
import FaqAccordion from "@/components/FaqAccordion";
import ToolCard, { ToolIcon } from "@/components/ToolCard";
import { TOOLS, POPULAR_SLUGS, CATEGORIES } from "@/data/tools";
import { ARTICLES } from "@/data/blog";
import { PAGE_META, HOME_FAQS, ld } from "@/data/seo";

const TRUST = ["No account required", "Files processed in your browser", "Free to use"];

function SectionHead({ eyebrow, title, text, id }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
      <h2 id={id} className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-relaxed text-slate-600">{text}</p>}
    </div>
  );
}

function Hero() {
  const popular = POPULAR_SLUGS.map((s) => TOOLS.find((t) => t.slug === s));
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-surface" aria-labelledby="hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/[0.07]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-20">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-semibold text-brand">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Your files never leave your device
          </p>
          <h1 id="hero-title" className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Everything you need to work with <span className="text-brand">PDFs</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Merge, compress, split, organize and convert PDF files with simple online tools that run right in your browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/all-tools" data-testid="hero-explore-cta" className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-brand-dark">
              Explore PDF Tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#how-it-works" data-testid="hero-how-cta" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand">
              How It Works
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2" data-testid="hero-trust">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <BadgeCheck className="h-4 w-4 text-brand" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="animate-rise rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-brand/10 [animation-delay:120ms] sm:p-6" data-testid="hero-tool-picker">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MousePointerClick className="h-4 w-4 text-brand" aria-hidden="true" /> Pick a tool to get started
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2.5">
            {popular.map((t) => (
              <li key={t.slug}>
                <Link to={`/${t.slug}`} data-testid={`hero-tool-${t.slug}`} className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200 p-3 transition-[border-color,background-color] hover:border-brand/40 hover:bg-surface">
                  <ToolIcon tool={t} />
                  <span className="text-sm font-semibold text-ink group-hover:text-brand">{t.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-slate-600">
            Up to 10 MB per file. Processing happens on your device, so your documents stay private.
          </p>
        </div>
      </div>
    </section>
  );
}

const WHY = [
  { icon: Lock, title: "Private by design", text: "Files are processed in your browser and are not uploaded to our servers." },
  { icon: Zap, title: "Fast, no waiting in queues", text: "Your own device does the work, so there is no upload or download wait." },
  { icon: ShieldCheck, title: "Honest and simple", text: "No signup, no watermarks and no misleading buttons. Tools do what they say." },
  { icon: MonitorSmartphone, title: "Works everywhere", text: "Use the same tools on a laptop, tablet or phone without installing anything." },
];

const STEPS = [
  { icon: MousePointerClick, title: "Choose a tool", text: "Pick the task you need, such as Merge or Compress." },
  { icon: FilePlus2, title: "Add your files", text: "Drop files or choose them from your device. They are checked and processed locally." },
  { icon: Download, title: "Download the result", text: "Save the finished file to your device with one click." },
];

const DEVICES = [
  { icon: Laptop, label: "Windows, macOS & Linux" },
  { icon: Tablet, label: "iPad & Android tablets" },
  { icon: Smartphone, label: "iPhone & Android phones" },
  { icon: Globe, label: "Chrome, Edge, Firefox & Safari" },
];

function IconList({ items }) {
  return (
    <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: I, title, text }) => (
        <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><I className="h-5 w-5" aria-hidden="true" /></span>
          <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
        </li>
      ))}
    </ul>
  );
}

function Wrap({ children, className = "", ...rest }) {
  return <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${className}`} {...rest}>{children}</section>;
}

export default function Home() {
  const popular = POPULAR_SLUGS.map((s) => TOOLS.find((t) => t.slug === s));
  return (
    <div>
      <Seo {...PAGE_META.home} jsonLd={ld.home()} />
      <Hero />

      <Wrap aria-labelledby="popular">
        <SectionHead id="popular" eyebrow="Popular" title="Popular PDF tools" text="The everyday PDF tasks people need most, ready in a couple of clicks." />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="popular-tools">
          {popular.map((t) => <li key={t.slug}><ToolCard tool={t} /></li>)}
        </ul>
      </Wrap>

      <section className="bg-surface" aria-labelledby="categories">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHead id="categories" eyebrow="Browse" title="All tools by category" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const items = TOOLS.filter((t) => t.category === cat.id);
              if (!items.length) return null;
              return (
                <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{cat.label}</h3>
                  <ul className="mt-3 space-y-1">
                    {items.map((t) => (
                      <li key={t.slug}>
                        <Link to={`/${t.slug}`} data-testid={`category-tool-${t.slug}`} className="flex items-center gap-2.5 rounded-lg p-2 text-sm font-medium text-ink hover:bg-surface hover:text-brand">
                          <ToolIcon tool={t} size="h-8 w-8" /> {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Wrap aria-labelledby="why">
        <SectionHead id="why" eyebrow="Why mycrushpdf" title="Why use mycrushpdf?" text="A focused set of PDF tools that respect your time and your documents." />
        <IconList items={WHY} />
      </Wrap>

      <section id="how-it-works" className="scroll-mt-20 bg-surface" aria-labelledby="how">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHead id="how" eyebrow="How it works" title="How online PDF processing works" text="mycrushpdf loads open-source PDF libraries into your browser and processes files on your own device." />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: I, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-brand/10" aria-hidden="true">{i + 1}</span>
                <I className="h-6 w-6 text-brand" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-ink">{i + 1}. {title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink" aria-labelledby="privacy">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Privacy</p>
            <h2 id="privacy" className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">What happens to your files</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              When you use a tool, your browser reads the file and builds the result on your device. Your documents are not uploaded to our servers, and the result disappears from the page when you close or refresh the tab.
            </p>
            <Link to="/security" data-testid="privacy-learn-more" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
              Read about security & file privacy <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-3 self-center text-sm text-slate-200">
            {["Files are checked before processing (real PDF or JPG/PNG, up to 10 MB)", "Password-protected PDFs are rejected with a clear message", "Only an anonymous usage count (tool name, success or failure) may be sent", "No document contents or file names are ever sent to us"].map((t) => (
              <li key={t} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-indigo-300" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <Wrap aria-labelledby="devices">
        <SectionHead id="devices" eyebrow="Compatibility" title="Supported devices and browsers" text="Any up-to-date browser with JavaScript enabled can run mycrushpdf. Very large files process faster on laptops and desktops." />
        <ul className="mt-8 flex flex-wrap gap-3">
          {DEVICES.map(({ icon: I, label }) => (
            <li key={label} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink"><I className="h-4 w-4 text-brand" aria-hidden="true" />{label}</li>
          ))}
        </ul>
      </Wrap>

      <section className="bg-surface" aria-labelledby="guides">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead id="guides" eyebrow="Learn" title="Helpful PDF guides and tutorials" />
            <Link to="/blog" data-testid="home-all-guides" className="text-sm font-semibold text-brand hover:underline">View all guides</Link>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {ARTICLES.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <Link to={`/blog/${a.slug}`} data-testid={`home-article-${a.slug}`} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-900/5">
                  <span className="text-xs font-semibold text-brand">{a.category} · {a.readingTime}</span>
                  <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-brand">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Wrap aria-labelledby="faq" className="max-w-3xl">
        <SectionHead id="faq" eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-8"><FaqAccordion faqs={HOME_FAQS} testIdPrefix="home-faq" /></div>
      </Wrap>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready to work with your PDFs?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-indigo-100">Free tools, no signup, and your files stay on your device.</p>
          <Link to="/all-tools" data-testid="final-cta" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5">
            Explore PDF Tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
