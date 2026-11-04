import { Link } from "react-router-dom";
import {
  ShieldCheck, Zap, Lock, Clock, Trash2, CheckCircle2, ArrowRight,
  UploadCloud, Settings2, Download, FileText,
} from "lucide-react";
import Seo from "@/components/Seo";
import FaqAccordion from "@/components/FaqAccordion";
import AdSlot from "@/components/AdSlot";
import { TOOLS, POPULAR_SLUGS, CATEGORIES } from "@/data/tools";
import { ARTICLES } from "@/data/blog";

const HOME_FAQS = [
  { q: "Is mycrushpdf free to use?", a: "Yes. All our core PDF tools are free to use with no account required for everyday tasks." },
  { q: "Are my files safe?", a: "Files are processed on our server with random filenames and deleted automatically within 60 minutes. We never store document contents in our database. We do not claim end-to-end or zero-knowledge encryption." },
  { q: "Do I need to install anything?", a: "No. Everything runs in your browser. Just upload, process and download." },
  { q: "What file sizes are supported?", a: "Each file can be up to 50MB and 500 pages. Larger files may need to be split first." },
  { q: "Which tools are available?", a: "You can merge, compress, split, remove pages, organize, convert JPG to PDF, convert PDF to Word and rotate PDFs, with more tools on the way." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "mycrushpdf",
  url: "https://mycrushpdf.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://mycrushpdf.com/all-tools?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <Link
      to={`/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${tool.color}1a`, color: tool.color }}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{tool.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{tool.tagline}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
        Use tool <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export default function Home() {
  const popular = POPULAR_SLUGS.map((s) => TOOLS.find((t) => t.slug === s));
  return (
    <div>
      <Seo
        title="mycrushpdf — All Your PDF Tools in One Place"
        description="Merge, compress, split and convert PDF documents with simple, fast and secure online tools. Free to use, no signup required."
        path="/"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <ShieldCheck className="h-4 w-4" /> Secure · Free · No signup
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              All Your PDF Tools<br className="hidden sm:block" /> in One Place
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Merge, compress, split and convert PDF documents with simple, fast and
              secure online tools.
            </p>
          </div>

          {/* Upload / tools entry */}
          <div className="mx-auto mt-10 max-w-3xl">
            <Link
              to="/merge-pdf"
              data-testid="hero-upload-area"
              className="group block rounded-3xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-10 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50 sm:p-14"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
                <UploadCloud className="h-8 w-8" />
              </span>
              <p className="mt-5 text-lg font-semibold text-slate-900">Select a PDF tool to get started</p>
              <p className="mt-1 text-sm text-slate-500">Pick a tool below, then upload your file to process it instantly.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Popular PDF tools</h2>
            <p className="mt-2 text-base text-slate-500">The tools people reach for most often.</p>
          </div>
          <Link to="/all-tools" className="hidden items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {popular.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><AdSlot slot="home" /></div>

      {/* All tools by category */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">All tools by category</h2>
        <p className="mt-2 text-base text-slate-500">Everything you need to work with PDF documents.</p>
        <div className="mt-8 space-y-10">
          {CATEGORIES.map((cat) => {
            const items = TOOLS.filter((t) => t.category === cat.id);
            if (!items.length) return null;
            return (
              <div key={cat.id}>
                <h3 className="text-lg font-semibold text-slate-900">{cat.label}</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((t) => <ToolCard key={t.slug} tool={t} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">How it works</h2>
            <p className="mt-2 text-base text-slate-500">Three simple steps, no software to install.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: UploadCloud, title: "Upload your file", text: "Drag and drop or select the PDF or image you want to work with." },
              { icon: Settings2, title: "Choose your options", text: "Set the tool options — order, ranges, compression level and more." },
              { icon: Download, title: "Download the result", text: "Process on our secure server and download your finished file." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Why choose mycrushpdf</h2>
          <p className="mt-2 text-base text-slate-500">Built for speed, privacy and ease of use.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, title: "Fast processing", text: "Efficient server-side processing returns your files in seconds." },
            { icon: ShieldCheck, title: "Private by design", text: "Random filenames, no document contents stored in our database." },
            { icon: Clock, title: "Auto-deletion", text: "Files are automatically deleted within 60 minutes of processing." },
            { icon: CheckCircle2, title: "Free & no signup", text: "Use every core tool for free without creating an account." },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy & security */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-200">
                <Lock className="h-4 w-4" /> Document privacy & security
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Your documents stay yours</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                We process files on our server only for as long as needed to complete
                your task. Uploads get random, non-guessable names, are never stored in
                our database, and are deleted automatically within 60 minutes. A storage
                lifecycle rule provides an extra cleanup safeguard.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                We take privacy seriously, but no online service can guarantee absolute
                security — so we don't claim end-to-end or zero-knowledge encryption.
              </p>
              <Link to="/privacy-policy" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-300 hover:text-indigo-200">
                Read our Privacy Policy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Lock, title: "Random filenames", text: "Non-guessable names prevent unauthorized access." },
                { icon: Trash2, title: "Auto cleanup", text: "Deleted within 60 minutes, with a lifecycle safeguard." },
                { icon: ShieldCheck, title: "No content stored", text: "Document contents never saved to our database." },
                { icon: Zap, title: "HTTPS everywhere", text: "Encrypted in transit with secure headers." },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                    <Icon className="h-6 w-6 text-indigo-300" />
                    <h3 className="mt-3 text-sm font-semibold text-white">{c.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{c.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Useful PDF guides</h2>
            <p className="mt-2 text-base text-slate-500">Practical tips to get the most from your documents.</p>
          </div>
          <Link to="/blog" className="hidden items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:inline-flex">
            All guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {ARTICLES.slice(0, 3).map((a) => (
            <Link key={a.slug} to={`/blog/${a.slug}`} data-testid={`guide-card-${a.slug}`} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold leading-snug text-slate-900 group-hover:text-indigo-600">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{a.description}</p>
              <p className="mt-3 text-xs text-slate-400">{a.readingTime}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-base text-slate-500">Everything you need to know about using mycrushpdf.</p>
          </div>
          <div className="mt-10">
            <FaqAccordion faqs={HOME_FAQS} testIdPrefix="home-faq" />
          </div>
        </div>
      </section>
    </div>
  );
}
