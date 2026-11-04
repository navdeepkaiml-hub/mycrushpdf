import { useState } from "react";
import {
  FileText, Image as ImageIcon, X, ArrowUp, ArrowDown, CheckCircle2,
  AlertCircle, Loader2, Download, RefreshCw,
} from "lucide-react";
import { api, formatApiError, downloadUrl } from "@/lib/api";
import UploadZone from "@/components/UploadZone";

const MAX_MB = 50;

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ToolRunner({ tool }) {
  const [files, setFiles] = useState([]);
  const [opts, setOpts] = useState(() => {
    const o = {};
    (tool.options || []).forEach((opt) => { o[opt.key] = opt.default; });
    return o;
  });
  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const addFiles = (newOnes) => {
    const valid = [];
    let err = "";
    for (const f of newOnes) {
      if (f.size > MAX_MB * 1024 * 1024) {
        err = `"${f.name}" exceeds the ${MAX_MB}MB limit.`;
        continue;
      }
      valid.push(f);
    }
    setError(err);
    setFiles((prev) => (tool.multiple ? [...prev, ...valid] : valid.slice(0, 1)));
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    setFiles((p) => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  const visibleOptions = (tool.options || []).filter((o) => {
    if (!o.showWhen) return true;
    return Object.entries(o.showWhen).every(([k, v]) => opts[k] === v);
  });

  const canProcess = () => {
    if (files.length === 0) return false;
    if (tool.minFiles && files.length < tool.minFiles) return false;
    for (const o of visibleOptions) {
      if (o.required && !String(opts[o.key] || "").trim()) return false;
    }
    return true;
  };

  const process = async () => {
    setStatus("processing");
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      if (tool.multiple) {
        files.forEach((f) => fd.append("files", f));
      } else {
        fd.append("file", files[0]);
      }
      visibleOptions.forEach((o) => fd.append(o.key, opts[o.key] ?? ""));
      const { data } = await api.post(`/tools/${tool.endpoint}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(formatApiError(e.response?.data?.detail) || "Processing failed. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setStatus("idle");
    setError("");
  };

  const FileIcon = tool.fileKind === "image" ? ImageIcon : FileText;

  if (status === "done" && result) {
    return (
      <div data-testid="tool-result" className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h3 className="mt-5 text-2xl font-bold text-slate-900">Your file is ready!</h3>
        <p className="mt-2 text-sm text-slate-500">
          {result.download_name} · {humanSize(result.size)} · available for 60 minutes
        </p>
        <a
          href={downloadUrl(result.job_id)}
          data-testid="download-result-btn"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          <Download className="h-5 w-5" /> Download {tool.outputIsZip ? "ZIP" : "file"}
        </a>
        <div className="mt-4">
          <button data-testid="process-another-btn" onClick={reset} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600">
            <RefreshCw className="h-4 w-4" /> Process another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      {files.length === 0 ? (
        <UploadZone accept={tool.accept} multiple={tool.multiple} onFiles={addFiles} />
      ) : (
        <div className="space-y-3">
          {files.map((f, i) => (
            <div key={i} data-testid={`file-card-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
                <FileIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-400">{humanSize(f.size)}</p>
              </div>
              {tool.multiple && files.length > 1 && (
                <div className="flex items-center gap-1">
                  <button data-testid={`move-up-${i}`} onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button data-testid={`move-down-${i}`} onClick={() => move(i, 1)} disabled={i === files.length - 1} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button data-testid={`remove-file-${i}`} onClick={() => removeFile(i)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600" aria-label="Remove file">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {tool.multiple && (
            <UploadZoneInline accept={tool.accept} onFiles={addFiles} />
          )}
        </div>
      )}

      {/* Options */}
      {files.length > 0 && visibleOptions.length > 0 && (
        <div className="mt-6 space-y-4 rounded-2xl bg-slate-50/70 p-5">
          {visibleOptions.map((o) => (
            <div key={o.key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{o.label}</label>
              {o.type === "select" ? (
                <select
                  data-testid={`option-${o.key}`}
                  value={opts[o.key]}
                  onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {o.choices.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  data-testid={`option-${o.key}`}
                  value={opts[o.key] ?? ""}
                  placeholder={o.placeholder}
                  onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              )}
              {o.hint && <p className="mt-1.5 text-xs text-slate-400">{o.hint}</p>}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div data-testid="tool-error" className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <button
          data-testid="process-btn"
          onClick={process}
          disabled={!canProcess() || status === "processing"}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "processing" ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
          ) : (
            <>{tool.name}</>
          )}
        </button>
      )}
      {tool.minFiles && files.length > 0 && files.length < tool.minFiles && (
        <p className="mt-2 text-center text-xs text-slate-400">Add at least {tool.minFiles} files to continue.</p>
      )}
    </div>
  );
}

function UploadZoneInline({ accept, onFiles }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <UploadZone accept={accept} multiple onFiles={(f) => { onFiles(f); setOpen(false); }} testId="upload-zone-more" />
  ) : (
    <button
      data-testid="add-more-files"
      onClick={() => setOpen(true)}
      className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
    >
      + Add more files
    </button>
  );
}
