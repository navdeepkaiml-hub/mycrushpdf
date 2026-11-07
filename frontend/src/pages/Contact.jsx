import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import Seo from "@/components/Seo";
import { PAGE_META, ld } from "@/data/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { api, formatApiError } from "@/lib/api";
import { CONTACT_EMAIL } from "@/data/legal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.post("/contact", form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail ? formatApiError(detail) : `We could not send your message right now. Please email us at ${CONTACT_EMAIL}.`);
      setStatus("error");
    }
  };

  const field = (k) => ({
    value: form[k],
    onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Seo {...PAGE_META.contact} jsonLd={ld.breadcrumbs([{ name: "Contact Us", path: "/contact-us" }])} />
      <Breadcrumbs items={[{ label: "Contact Us" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Contact Us</h1>
      <p className="mt-3 max-w-xl text-base text-slate-600">
        Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Mail className="h-6 w-6 text-indigo-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Email us</h3>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block text-sm text-indigo-600 break-words">{CONTACT_EMAIL}</a>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <MapPin className="h-6 w-6 text-indigo-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">Response time</h3>
            <p className="mt-1 text-sm text-slate-500">We usually respond within 1–2 business days.</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          {status === "sent" ? (
            <div data-testid="contact-success" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-3 text-lg font-bold text-emerald-800">Message sent!</h3>
              <p className="mt-1 text-sm text-emerald-700">Thanks for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setStatus("idle")} className="mt-4 text-sm font-medium text-emerald-800 underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="contact-form">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                  <input {...field("name")} required data-testid="contact-name" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <input {...field("email")} type="email" required data-testid="contact-email" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                <input {...field("subject")} required data-testid="contact-subject" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                <textarea {...field("message")} required rows={5} data-testid="contact-message" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <button type="submit" disabled={status === "sending"} data-testid="contact-submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
                {status === "sending" ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
