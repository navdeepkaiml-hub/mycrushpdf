import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Activity, AlertTriangle, Mail, LogOut,
  ToggleLeft, Save, CheckCircle2, Megaphone, Loader2,
} from "lucide-react";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { TOOLS } from "@/data/tools";
import { Switch } from "@/components/ui/switch";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "contacts", label: "Messages", icon: Mail },
  { id: "tools", label: "Tools", icon: ToggleLeft },
  { id: "seo", label: "SEO", icon: FileText },
  { id: "ads", label: "Advertising", icon: Megaphone },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [toolsEnabled, setToolsEnabled] = useState({});
  const [seo, setSeo] = useState({});
  const [ads, setAds] = useState({ enabled: false, publisher_id: "" });
  const [saved, setSaved] = useState("");

  const load = async () => {
    const [ov, cfg] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/config"),
    ]);
    setOverview(ov.data);
    const cfgData = cfg.data || {};
    const te = cfgData.tools_enabled || {};
    const full = {};
    TOOLS.forEach((t) => { full[t.endpoint] = te[t.endpoint] !== false; });
    setToolsEnabled(full);
    setSeo(cfgData.seo || {});
    setAds(cfgData.ads || { enabled: false, publisher_id: "" });
  };

  useEffect(() => { load().catch(() => {}); }, []);
  useEffect(() => {
    if (tab === "contacts") api.get("/admin/contacts").then((r) => setContacts(r.data)).catch(() => {});
  }, [tab]);

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(""), 2500); };

  const saveTools = async () => {
    await api.put("/admin/tools", { tools_enabled: toolsEnabled });
    flash("Tool settings saved");
  };
  const saveSeo = async () => {
    await api.put("/admin/seo", { seo });
    flash("SEO settings saved");
  };
  const saveAds = async () => {
    await api.put("/admin/ads", { ads });
    flash("Advertising settings saved");
  };

  const doLogout = async () => { await logout(); navigate("/admin/login"); };

  const toolLabel = (endpoint) => TOOLS.find((t) => t.endpoint === endpoint)?.name || endpoint;

  return (
    <div className="min-h-screen bg-slate-50">
      <Seo title="Admin Dashboard — mycrushpdf" description="Admin dashboard" path="/admin/dashboard" noindex />
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><FileText className="h-5 w-5" strokeWidth={2.5} /></span>
            <span className="font-bold text-slate-900">mycrushpdf <span className="text-slate-400">admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">{admin?.email}</span>
            <button onClick={doLogout} data-testid="admin-logout" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {saved && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {saved}
          </div>
        )}

        {/* Overview */}
        {tab === "overview" && (
          <div data-testid="admin-overview">
            {!overview ? (
              <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={Activity} label="Total Jobs" value={overview.total_jobs} color="#4F46E5" />
                  <StatCard icon={CheckCircle2} label="Successful" value={overview.total_success} color="#10B981" />
                  <StatCard icon={AlertTriangle} label="Failed Jobs" value={overview.total_failed} color="#EF4444" />
                  <StatCard icon={Mail} label="Messages" value={overview.total_contacts} color="#0EA5E9" />
                </div>
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Tool usage statistics</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-400">
                          <th className="pb-2 font-medium">Tool</th>
                          <th className="pb-2 font-medium">Total</th>
                          <th className="pb-2 font-medium">Success</th>
                          <th className="pb-2 font-medium">Failed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.tool_stats.length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-slate-400">No usage yet.</td></tr>
                        ) : overview.tool_stats.map((s) => (
                          <tr key={s.tool} className="border-b border-slate-100" data-testid={`stat-row-${s.tool}`}>
                            <td className="py-2.5 font-medium text-slate-700">{toolLabel(s.tool)}</td>
                            <td className="py-2.5 text-slate-600">{s.total || 0}</td>
                            <td className="py-2.5 text-emerald-600">{s.success || 0}</td>
                            <td className="py-2.5 text-red-600">{s.failed || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Contacts */}
        {tab === "contacts" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="admin-contacts">
            <h2 className="text-lg font-bold text-slate-900">Contact form submissions</h2>
            <div className="mt-4 space-y-3">
              {contacts.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No messages yet.</p>
              ) : contacts.map((c, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4" data-testid={`contact-row-${i}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="ml-2 text-sm text-slate-400">{c.email}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">{c.subject}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools */}
        {tab === "tools" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="admin-tools">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Enable / disable tools</h2>
              <button onClick={saveTools} data-testid="save-tools" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {TOOLS.map((t) => (
                <div key={t.endpoint} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-700">{t.name}</span>
                  <Switch
                    checked={toolsEnabled[t.endpoint] !== false}
                    onCheckedChange={(v) => setToolsEnabled((p) => ({ ...p, [t.endpoint]: v }))}
                    data-testid={`toggle-${t.endpoint}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO */}
        {tab === "seo" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="admin-seo">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">SEO metadata overrides</h2>
              <button onClick={saveSeo} data-testid="save-seo" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">Override the homepage title and description. Leave blank to use defaults.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Homepage title</label>
                <input value={seo.home_title || ""} onChange={(e) => setSeo((p) => ({ ...p, home_title: e.target.value }))} data-testid="seo-home-title" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Homepage description</label>
                <textarea value={seo.home_description || ""} onChange={(e) => setSeo((p) => ({ ...p, home_description: e.target.value }))} rows={3} data-testid="seo-home-description" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
          </div>
        )}

        {/* Ads */}
        {tab === "ads" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="admin-ads">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Advertising configuration</h2>
              <button onClick={saveAds} data-testid="save-ads" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">Ads stay disabled until you enable them and provide an approved AdSense publisher ID.</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <span className="text-sm font-medium text-slate-700">Enable advertising</span>
                  <p className="text-xs text-slate-400">Only turn on after AdSense approval.</p>
                </div>
                <Switch checked={!!ads.enabled} onCheckedChange={(v) => setAds((p) => ({ ...p, enabled: v }))} data-testid="toggle-ads" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">AdSense publisher ID</label>
                <input value={ads.publisher_id || ""} onChange={(e) => setAds((p) => ({ ...p, publisher_id: e.target.value }))} placeholder="pub-XXXXXXXXXXXXXXXX" data-testid="ads-publisher-id" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                <p className="mt-1.5 text-xs text-slate-400">This also populates your ads.txt once set. Never use a fabricated ID.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
