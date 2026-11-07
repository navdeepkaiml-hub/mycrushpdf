import { useEffect, useState } from "react";
import {
  FileText, Image as ImageIcon, X, ArrowUp, ArrowDown, CheckCircle2,
  AlertCircle, Loader2, Download, RefreshCw, Info,
} from "lucide-react";
import { api } from "@/lib/api";
import UploadZone from "@/components/UploadZone";
import { LIMITS, MESSAGES, checkFile, runTool } from "@/lib/pdfTools";

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const reportUsage = (tool, ok) => api.post("/stats", { tool, ok }).catch(() => {});

function FileRow({ f, i, count, multiple, Icon, onMove, onRemove }) {
  return (
    <li data-testid={`file-card-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{f.name}</p>
        <p className="text-xs text-slate-500">{humanSize(f.size)}</p>
      </div>
      {multiple && count > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" data-testid={`move-up-${i}`} onClick={() => onMove(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-ink disabled:opacity-30" aria-label={`Move ${f.name} up`}><ArrowUp className="h-4 w-4" /></button>
          <button type="button" data-testid={`move-down-${i}`} onClick={() => onMove(i, 1)} disabled={i === count - 1} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-ink disabled:opacity-30" aria-label={`Move ${f.name} down`}><ArrowDown className="h-4 w-4" /></button>
        </div>
      )}
      <button type="button" data-testid={`remove-file-${i}`} onClick={() => onRemove(i)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${f.name}`}><X className="h-4 w-4" /></button>
    </li>
  );
}

function OptionField({ o, value, onChange }) {
  const cls = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
  const id = `opt-${o.key}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{o.label}</label>
      {o.type === "select" ? (
        <select id={id} data-testid={`option-${o.key}`} value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          {o.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      ) : (
        <input id={id} type="text" data-testid={`option-${o.key}`} value={value ?? ""} placeholder={o.placeholder} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      {o.hint && <p className="mt-1.5 text-xs text-slate-500">{o.hint}</p>}
    </div>
  );
}

function ResultCard({ tool, result, onReset }) {
  return (
    <div data-testid="tool-result" className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12" role="status">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-9 w-9" aria-hidden="true" /></span>
      <h3 className="mt-5 text-2xl font-bold text-ink">Your file is ready</h3>
      <p data-testid="result-meta" className="mt-2 text-sm text-slate-500">{result.name} · {humanSize(result.blob.size)}</p>
      {result.note && <p data-testid="result-note" className="mx-auto mt-3 max-w-md text-sm text-amber-700">{result.note}</p>}
      <a href={result.url} download={result.name} data-testid="download-result-btn" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-dark">
        <Download className="h-5 w-5" aria-hidden="true" /> Download {tool.outputIsZip ? "ZIP" : "file"}
      </a>
      <div className="mt-4">
        <button type="button" data-testid="process-another-btn" onClick={onReset} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Process another file
        </button>
      </div>
    </div>
  );
}

export default function ToolRunner({ tool }) {
  const isImage = tool.fileKind === "image";
  const [files, setFiles] = useState([]);
  const [opts, setOpts] = useState(() => Object.fromEntries((tool.options || []).map((o) => [o.key, o.default])));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result]);

  const addFiles = (incoming) => {
    if (!incoming.length) { setError(MESSAGES.empty); return; }
    let err = "";
    const valid = [];
    for (const f of incoming) {
      const msg = checkFile(f, tool.fileKind);
      if (msg) err = msg; else valid.push(f);
    }
    if (!tool.multiple) {
      if (valid.length) setFiles([valid[0]]);
    } else {
      const room = isImage ? LIMITS.maxImages - files.length : valid.length;
      if (valid.length > room) err = MESSAGES.tooMany;
      setFiles([...files, ...valid.slice(0, Math.max(0, room))]);
    }
    setError(err);
  };

  const removeFile = (i) => { setFiles((p) => p.filter((_, idx) => idx !== i)); setError(""); };
  const move = (i, dir) => setFiles((p) => {
    const arr = [...p];
    const j = i + dir;
    if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
    return arr;
  });

  const visibleOptions = (tool.options || []).filter((o) => !o.showWhen || Object.entries(o.showWhen).every(([k, v]) => opts[k] === v));
  const blocked = (tool.minFiles && files.length > 0 && files.length < tool.minFiles)
    || visibleOptions.some((o) => o.required && !String(opts[o.key] || "").trim());

  const process = async () => {
    if (!files.length) { setError(MESSAGES.empty); return; }
    setStatus("processing");
    setError("");
    try {
      const out = await runTool(tool.endpoint, files, opts);
      setResult({ ...out, url: URL.createObjectURL(out.blob) });
      setStatus("done");
      reportUsage(tool.endpoint, true);
    } catch (e) {
      setError(e.message || "Processing failed. Please try again.");
      setStatus("error");
      reportUsage(tool.endpoint, false);
    }
  };

  const reset = () => { setFiles([]); setResult(null); setStatus("idle"); setError(""); };

  if (status === "done" && result) return <ResultCard tool={tool} result={result} onReset={reset} />;

  const Icon = isImage ? ImageIcon : FileText;
  const limitHint = isImage ? `Maximum file size: ${LIMITS.maxFileMB} MB · Maximum ${LIMITS.maxImages} images per batch · JPG or PNG` : `Maximum file size: ${LIMITS.maxFileMB} MB · PDF only`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/[0.04] sm:p-6" data-testid="tool-runner">
      {files.length === 0 ? (
        <UploadZone accept={tool.accept} multiple={tool.multiple} onFiles={addFiles} hint={limitHint} />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p data-testid="file-count" className="font-medium text-ink">
              {isImage ? `${files.length} of ${LIMITS.maxImages} images selected` : `${files.length} file${files.length > 1 ? "s" : ""} selected`}
            </p>
            <p className="text-xs text-slate-500">Maximum file size: {LIMITS.maxFileMB} MB</p>
          </div>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <FileRow key={`${f.name}-${i}`} f={f} i={i} count={files.length} multiple={tool.multiple} Icon={Icon} onMove={move} onRemove={removeFile} />
            ))}
          </ul>
          {tool.multiple && (!isImage || files.length < LIMITS.maxImages) && (
            <UploadZone accept={tool.accept} multiple onFiles={addFiles} compact testId="upload-zone-more" />
          )}
        </div>
      )}

      {files.length > 0 && visibleOptions.length > 0 && (
        <div className="mt-5 space-y-4 rounded-2xl bg-surface p-5">
          {visibleOptions.map((o) => (
            <OptionField key={o.key} o={o} value={opts[o.key]} onChange={(v) => setOpts((p) => ({ ...p, [o.key]: v }))} />
          ))}
          {tool.optionNote && <p className="flex gap-2 text-xs text-slate-600"><Info className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />{tool.optionNote}</p>}
        </div>
      )}

      {error && (
        <div data-testid="tool-error" role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        data-testid="process-btn"
        onClick={process}
        disabled={blocked || status === "processing"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "processing" ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Processing in your browser…</> : tool.name}
      </button>
      {tool.minFiles > 1 && files.length > 0 && files.length < tool.minFiles && (
        <p className="mt-2 text-center text-xs text-slate-500">Add at least {tool.minFiles} files to continue.</p>
      )}
    </div>
  );
}
