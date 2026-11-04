import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, Lock, AlertCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) navigate("/admin/dashboard", { replace: true });
  }, [admin, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate("/admin/dashboard", { replace: true });
    else setError(res.error);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Seo title="Admin Login — mycrushpdf" description="Administrator login." path="/admin/login" noindex />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white">
            <FileText className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage mycrushpdf</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="admin-login-form">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="admin-email" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="admin-password" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          {error && (
            <div data-testid="admin-login-error" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={loading} data-testid="admin-login-submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : <><Lock className="h-4 w-4" /> Sign in</>}
          </button>
        </form>
      </div>
    </div>
  );
}
